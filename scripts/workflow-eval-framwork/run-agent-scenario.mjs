#!/usr/bin/env node
import { cp, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { execa, execaCommand } from "execa";
import micromatch from "micromatch";
import { parse as parseYaml } from "yaml";

const REQUIRED_WORKFLOWS = [
  "truthmark-check",
  "truthmark-document",
  "truthmark-realize",
  "truthmark-structure",
  "truthmark-sync",
];

function parseArgs(argv) {
  const args = new Map();
  const flags = new Set(["debug-scenario", "require-usage"]);
  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index];
    if (!item.startsWith("--")) {
      throw new Error(`Unexpected positional argument: ${item}`);
    }
    const key = item.slice(2);
    if (flags.has(key)) {
      args.set(key, true);
      continue;
    }
    if (key === "judge") {
      throw new Error("--judge was removed because deterministic-only judging is not meaningful. Use --judge-command with an explicit LLM judge command.");
    }
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`Missing value for --${key}`);
    }
    args.set(key, value);
    index += 1;
  }
  return args;
}

function requireArg(args, name) {
  const value = args.get(name);
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Missing required --${name}`);
  }
  return value;
}

function optionalString(args, name) {
  const value = args.get(name);
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function safeSegment(value) {
  return value.replace(/[^a-zA-Z0-9._-]+/gu, "-").replace(/^-|-$/gu, "");
}

function timestampSegment(date = new Date()) {
  return date.toISOString().replace(/[:.]/gu, "");
}

async function readYaml(filePath) {
  return parseYaml(await readFile(filePath, "utf8"));
}

async function git(args, cwd, options = {}) {
  return execa("git", args, { cwd, reject: false, ...options });
}

async function initializeFixtureGit(tempRepo) {
  await git(["init"], tempRepo);
  await git(["config", "user.email", "workflow-eval@example.invalid"], tempRepo);
  await git(["config", "user.name", "Workflow Eval"], tempRepo);
  await git(["add", "."], tempRepo);
  await git(["commit", "-m", "baseline"], tempRepo, {
    env: { GIT_AUTHOR_DATE: "2026-01-01T00:00:00Z", GIT_COMMITTER_DATE: "2026-01-01T00:00:00Z" },
  });
}

function parseChangedFiles(statusOutput) {
  return statusOutput
    .split("\n")
    .map((line) => line.trimEnd())
    .filter(Boolean)
    .map((line) => line.slice(3).trim())
    .map((file) => file.replace(/^"|"$/gu, ""));
}

function asStringArray(value) {
  return Array.isArray(value) ? value.filter((item) => typeof item === "string") : [];
}

function matchAny(file, patterns) {
  return micromatch.isMatch(file, patterns, { dot: true });
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

function commandWasRunOrExplained(evidence, command) {
  if (evidence.includes(command)) {
    return true;
  }
  const escaped = escapeRegExp(command);
  const explanationPattern = new RegExp(
    `(?:skip|skipped|cannot|can't|unable|did not run|not run|not available|would fail|no package|missing dependency)[\\s\\S]{0,200}${escaped}|${escaped}[\\s\\S]{0,200}(?:skip|skipped|cannot|can't|unable|did not run|not run|not available|would fail|no package|missing dependency)`,
    "iu",
  );
  return explanationPattern.test(evidence);
}

async function collectTraceEvidence(runDir, commandOutput) {
  const chunks = [commandOutput];
  let bytes = commandOutput.length;
  const maxBytes = 1_000_000;

  async function visit(directory) {
    if (bytes >= maxBytes) {
      return;
    }
    let entries;
    try {
      entries = await readdir(directory, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (bytes >= maxBytes) {
        return;
      }
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        await visit(absolute);
        continue;
      }
      if (!entry.isFile()) {
        continue;
      }
      try {
        const text = await readFile(absolute, "utf8");
        const relative = path.relative(runDir, absolute);
        const chunk = `\n--- ${relative} ---\n${text}`;
        bytes += chunk.length;
        chunks.push(chunk);
      } catch {
        // Binary or unreadable artifacts are not trace evidence.
      }
    }
  }

  await visit(runDir);
  return chunks.join("\n");
}

function gradeDeterministic({ changedFiles, agentChangedFiles, expected, commandOutput, traceEvidence, finalReportExists }) {
  const failures = [];
  const mustRead = asStringArray(expected.must_read);
  const mustNotChange = asStringArray(expected.must_not_change);
  const mustChange = asStringArray(expected.must_change);
  const mustRunOrExplain = asStringArray(expected.must_run_or_explain);
  const report = expected.report && typeof expected.report === "object" ? expected.report : {};
  const evidence = `${commandOutput}\n${traceEvidence}`;

  for (const file of mustRead) {
    if (!evidence.includes(file)) {
      failures.push({ id: "required-read-not-recorded", message: `${file} was not recorded in trace evidence` });
    }
  }

  for (const file of agentChangedFiles) {
    if (mustNotChange.length > 0 && matchAny(file, mustNotChange)) {
      failures.push({ id: "forbidden-write", message: `${file} matched forbidden write patterns` });
    }
  }

  for (const pattern of mustChange) {
    if (!agentChangedFiles.some((file) => matchAny(file, [pattern]))) {
      failures.push({ id: "missing-required-change", message: `${pattern} was not changed` });
    }
  }

  for (const command of mustRunOrExplain) {
    if (!commandWasRunOrExplained(evidence, command)) {
      failures.push({ id: "verification-not-recorded", message: `${command} was not run or specifically explained` });
    }
  }

  if (report.required === true && !finalReportExists) {
    failures.push({ id: "missing-report", message: "expected report was not produced" });
  }

  return {
    status: failures.length === 0 ? "passed" : "failed",
    failures,
    changedFiles,
    agentChangedFiles,
    requiredReads: mustRead,
  };
}

function normalizeJudgeResult(candidate, fallback) {
  if (!candidate || typeof candidate !== "object") {
    return fallback;
  }
  const status = typeof candidate.status === "string" ? candidate.status : "not_evaluable";
  if (!["passed", "failed", "not_evaluable", "skipped"].includes(status)) {
    return {
      status: "not_evaluable",
      judges: [],
      note: `Judge returned unsupported status ${JSON.stringify(status)}.` ,
    };
  }
  return {
    ...candidate,
    status,
    judges: Array.isArray(candidate.judges) ? candidate.judges : [],
  };
}

const usageTokenFields = ["inputTokens", "cachedInputTokens", "outputTokens", "reasoningOutputTokens", "totalTokens"];

function emptyTokenTotals() {
  return {
    inputTokens: 0,
    cachedInputTokens: 0,
    outputTokens: 0,
    reasoningOutputTokens: 0,
    totalTokens: 0,
  };
}

function addTokenTotals(left, right) {
  return {
    inputTokens: left.inputTokens + right.inputTokens,
    cachedInputTokens: left.cachedInputTokens + right.cachedInputTokens,
    outputTokens: left.outputTokens + right.outputTokens,
    reasoningOutputTokens: left.reasoningOutputTokens + right.reasoningOutputTokens,
    totalTokens: left.totalTokens + right.totalTokens,
  };
}

function hasUsageCount(record) {
  return usageTokenFields.some((field) => Object.hasOwn(record, field));
}

function normalizeUsageRecord(record, phase, index) {
  if (!record || typeof record !== "object" || Array.isArray(record)) {
    throw new Error(`${phase} usage record ${index + 1} is not an object`);
  }
  if (!hasUsageCount(record)) {
    throw new Error(`${phase} usage record ${index + 1} does not include token counts`);
  }

  const normalized = {
    schemaVersion: record.schemaVersion ?? 1,
    source: typeof record.source === "string" ? record.source : "usage-sidecar",
    model: typeof record.model === "string" ? record.model : undefined,
    ...emptyTokenTotals(),
  };

  for (const field of usageTokenFields) {
    if (!Object.hasOwn(record, field)) {
      continue;
    }
    const value = record[field];
    if (!Number.isFinite(value) || value < 0) {
      throw new Error(`${phase} usage record ${index + 1} has invalid ${field}`);
    }
    normalized[field] = value;
  }

  if (!Object.hasOwn(record, "totalTokens")) {
    normalized.totalTokens = normalized.inputTokens + normalized.outputTokens + normalized.reasoningOutputTokens;
  }

  return normalized;
}

async function readUsageSidecar(filePath, phase) {
  let text;
  try {
    text = await readFile(filePath, "utf8");
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return {
        status: "unavailable",
        phase,
        path: filePath,
        warnings: [`${phase} command did not write usage sidecar ${filePath}`],
        records: [],
        ...emptyTokenTotals(),
      };
    }
    return {
      status: "invalid",
      phase,
      path: filePath,
      warnings: [`Could not read ${phase} usage sidecar ${filePath}: ${error instanceof Error ? error.message : String(error)}`],
      records: [],
      ...emptyTokenTotals(),
    };
  }

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (error) {
    return {
      status: "invalid",
      phase,
      path: filePath,
      warnings: [`${phase} usage sidecar ${filePath} did not contain valid JSON: ${error instanceof Error ? error.message : String(error)}`],
      records: [],
      ...emptyTokenTotals(),
    };
  }

  const candidates = Array.isArray(parsed) ? parsed : [parsed];
  if (candidates.length === 0) {
    return {
      status: "invalid",
      phase,
      path: filePath,
      warnings: [`${phase} usage sidecar ${filePath} contained no usage records`],
      records: [],
      ...emptyTokenTotals(),
    };
  }

  try {
    const records = candidates.map((record, index) => normalizeUsageRecord(record, phase, index));
    const totals = records.reduce((sum, record) => addTokenTotals(sum, record), emptyTokenTotals());
    return {
      status: "measured",
      phase,
      path: filePath,
      warnings: [],
      records,
      ...totals,
    };
  } catch (error) {
    return {
      status: "invalid",
      phase,
      path: filePath,
      warnings: [error instanceof Error ? error.message : String(error)],
      records: [],
      ...emptyTokenTotals(),
    };
  }
}

function usageStatusForPhases(agent, judge) {
  if (agent.status === "invalid" || judge.status === "invalid") {
    return "invalid";
  }
  if (agent.status === "unavailable" || judge.status === "unavailable") {
    return "unavailable";
  }
  return "measured";
}

function compactUsagePhase(phaseUsage) {
  return {
    status: phaseUsage.status,
    inputTokens: phaseUsage.inputTokens,
    cachedInputTokens: phaseUsage.cachedInputTokens,
    outputTokens: phaseUsage.outputTokens,
    reasoningOutputTokens: phaseUsage.reasoningOutputTokens,
    totalTokens: phaseUsage.totalTokens,
    records: phaseUsage.records,
    warnings: phaseUsage.warnings,
  };
}

function evaluateRequiredUsage(usage, { requireUsage }) {
  const failures = [];

  if (requireUsage) {
    for (const phase of ["agent", "judge"]) {
      if (usage[phase].status !== "measured") {
        failures.push({ id: `${phase}-usage-required`, message: `${phase} usage is required but status was ${usage[phase].status}` });
      }
    }
  }

  return {
    status: failures.length > 0 ? "failed" : "passed",
    failures,
  };
}

function buildUsage({ agentUsage, judgeUsage, requireUsage }) {
  const agent = compactUsagePhase(agentUsage);
  const judge = compactUsagePhase(judgeUsage);
  const total = addTokenTotals(agentUsage, judgeUsage);
  const usage = {
    status: usageStatusForPhases(agentUsage, judgeUsage),
    agent,
    judge,
    total,
  };
  usage.requirement = evaluateRequiredUsage(usage, { requireUsage });
  return usage;
}

function aggregateSuiteUsage(results) {
  const agent = results.reduce((sum, result) => addTokenTotals(sum, result.usage.agent), emptyTokenTotals());
  const judge = results.reduce((sum, result) => addTokenTotals(sum, result.usage.judge), emptyTokenTotals());
  const total = addTokenTotals(agent, judge);
  const statuses = results.map((result) => result.usage.status);
  return {
    status: statuses.every((status) => status === "measured") ? "measured" : statuses.some((status) => status === "invalid") ? "invalid" : "unavailable",
    agent,
    judge,
    total,
    requirement: {
      status: results.some((result) => result.usage.requirement.status === "failed") ? "failed" : "passed",
      failures: results.flatMap((result) => result.usage.requirement.failures.map((failure) => ({ ...failure, workflow: result.workflow, scenario: result.scenario }))),
    },
  };
}

async function runJudge({ judgeCommand, judgeModel, judgeUsagePath, runDir, repoRoot, scenario, scenarioPath, expectedPath, deterministic }) {
  const outputPath = path.join(runDir, "judge-results.json");

  if (deterministic.status !== "passed") {
    const skipped = {
      status: "skipped",
      judges: [],
      note: "Deterministic grading failed; LLM judge spending is blocked until objective failures are fixed.",
    };
    await writeFile(outputPath, `${JSON.stringify(skipped, null, 2)}\n`, "utf8");
    return skipped;
  }

  if (!judgeCommand) {
    const missing = {
      status: "not_evaluable",
      judges: [],
      note: "No --judge-command was supplied. Deterministic-only runs are harness smoke tests, not meaningful workflow-quality evals.",
    };
    await writeFile(outputPath, `${JSON.stringify(missing, null, 2)}\n`, "utf8");
    return missing;
  }

  const judge = await execaCommand(judgeCommand, {
    cwd: repoRoot,
    reject: false,
    timeout: 300_000,
    env: {
      TRUTHMARK_EVAL_EXPECTED: expectedPath,
      TRUTHMARK_EVAL_RUN_DIR: runDir,
      TRUTHMARK_EVAL_SCENARIO: scenarioPath,
      TRUTHMARK_EVAL_WORKFLOW: scenario.workflow,
      TRUTHMARK_EVAL_JUDGE_MODEL: judgeModel ?? "",
      TRUTHMARK_EVAL_JUDGE_USAGE: judgeUsagePath,
    },
  });
  await writeFile(path.join(runDir, "judge-output.txt"), `${judge.stdout}\n`, "utf8");
  await writeFile(path.join(runDir, "judge-error.txt"), `${judge.stderr}\n`, "utf8");

  let parsed;
  try {
    parsed = JSON.parse(judge.stdout);
  } catch {
    parsed = {
      status: "not_evaluable",
      judges: [],
      note: "Judge command did not emit strict JSON on stdout.",
    };
  }

  const normalized = normalizeJudgeResult(parsed, {
    status: "not_evaluable",
    judges: [],
    note: "Judge command output was not an object.",
  });
  const finalJudge = judge.exitCode === 0
    ? normalized
    : {
        ...normalized,
        status: normalized.status === "passed" ? "not_evaluable" : normalized.status,
        note: normalized.note ?? `Judge command exited with ${judge.exitCode}.`,
      };
  await writeFile(outputPath, `${JSON.stringify(finalJudge, null, 2)}\n`, "utf8");
  return finalJudge;
}

function resultStatus({ agentExitCode, deterministic, judgeResult }) {
  if (agentExitCode !== 0 || deterministic.status === "failed" || judgeResult.status === "failed") {
    return "failed";
  }
  return judgeResult.status === "passed" ? "passed" : "not_evaluable";
}

function renderHumanReport(result) {
  const lines = [
    `# Workflow Eval Report`,
    "",
    `- Status: ${result.status}`,
    `- Workflow: ${result.workflow}`,
    `- Scenario: ${result.scenario}`,
    `- Host: ${result.host}`,
    `- Agent model: ${result.agentModel ?? "<unspecified>"}`,
    `- Judge model: ${result.judgeModel ?? "<unspecified>"}`,
    `- Run directory: ${result.runDir}`,
    "",
    "## Deterministic grading",
    "",
    `- Status: ${result.deterministic.status}`,
    "",
    "## LLM judging",
    "",
    `- Status: ${result.judge.status}`,
    "",
    "## Token Usage Summary",
    "",
    `- Usage status: ${result.usage.status}`,
    `- Agent tokens: ${result.usage.agent.totalTokens} total (${result.usage.agent.inputTokens} input, ${result.usage.agent.cachedInputTokens} cached input, ${result.usage.agent.outputTokens} output, ${result.usage.agent.reasoningOutputTokens} reasoning output)`,
    `- Judge tokens: ${result.usage.judge.totalTokens} total (${result.usage.judge.inputTokens} input, ${result.usage.judge.cachedInputTokens} cached input, ${result.usage.judge.outputTokens} output, ${result.usage.judge.reasoningOutputTokens} reasoning output)`,
    `- Suite tokens: ${result.usage.total.totalTokens} total`,
    `- Required usage status: ${result.usage.requirement.status}`,
  ];

  if (result.deterministic.failures.length > 0) {
    lines.push("", "### Deterministic failures", "");
    for (const failure of result.deterministic.failures) {
      lines.push(`- ${failure.id}: ${failure.message}`);
    }
  }

  lines.push("", "## Artifacts", "", "- `result.json`", "- `deterministic-results.json`", "- `judge-results.json`", "- `command-output.txt`", "- `command-error.txt`", "- `changed-files.txt`", "- `after.patch`", "- `final-report.md`", "- `human-review.yaml`");
  return `${lines.join("\n")}\n`;
}

function scenarioRunId({ scenario, host }) {
  return `${timestampSegment()}-${safeSegment(scenario.workflow)}-${safeSegment(scenario.id)}-${safeSegment(host)}`;
}

async function runScenario({ repoRoot, scenarioArg, host, agentCommand, judgeCommand, agentModel, judgeModel, outputBase, timeout, requireUsage }) {
  const scenarioPath = path.resolve(repoRoot, scenarioArg);
  const scenarioDir = path.dirname(scenarioPath);
  const scenario = await readYaml(scenarioPath);
  const expectedPath = path.join(scenarioDir, scenario.expected);
  const expected = await readYaml(expectedPath);
  const promptPath = path.join(scenarioDir, scenario.prompt);
  const fixtureDir = path.join(scenarioDir, scenario.fixture);
  const runDir = path.join(outputBase, scenarioRunId({ scenario, host }));
  const finalReportPath = path.join(runDir, "final-report.md");
  const agentUsagePath = path.join(runDir, "agent-usage.json");
  const judgeUsagePath = path.join(runDir, "judge-usage.json");
  const tempRepo = await mkdtemp(path.join(os.tmpdir(), "truthmark-workflow-eval-fixture-"));

  await mkdir(runDir, { recursive: true });
  console.log(`runDir=${runDir}`);

  try {
    await cp(fixtureDir, tempRepo, { recursive: true });
    await initializeFixtureGit(tempRepo);

    const setup = scenario.setup && typeof scenario.setup === "object" ? scenario.setup : {};
    const setupPatch = typeof setup.patch === "string" ? setup.patch : undefined;
    if (setupPatch) {
      const setupPatchPath = path.join(scenarioDir, setupPatch);
      await writeFile(path.join(runDir, "setup.patch"), await readFile(setupPatchPath, "utf8"), "utf8");
      const applyResult = await git(["apply", setupPatchPath], tempRepo);
      if (applyResult.exitCode !== 0) {
        throw new Error(`Failed to apply scenario setup patch ${setupPatch}: ${applyResult.stderr}`);
      }
    }

    const beforeAgentStatus = await git(["status", "--porcelain", "-uall"], tempRepo);
    const beforeAgentChangedFiles = parseChangedFiles(beforeAgentStatus.stdout);
    await writeFile(path.join(runDir, "before-agent-changed-files.txt"), `${beforeAgentChangedFiles.join("\n")}\n`, "utf8");
    const beforeAgentDiff = await git(["diff", "--binary"], tempRepo);
    await writeFile(path.join(runDir, "before-agent.patch"), `${beforeAgentDiff.stdout}\n`, "utf8");

    await writeFile(
      path.join(runDir, "trace-summary.txt"),
      [
        `scenario=${scenarioArg}`,
        `workflow=${scenario.workflow}`,
        `prompt=${path.relative(repoRoot, promptPath)}`,
        `host=${host}`,
        `agentCommand=${agentCommand}`,
        `judgeCommand=${judgeCommand ?? "<missing>"}`,
        `agentModel=${agentModel ?? "<unspecified>"}`,
        `judgeModel=${judgeModel ?? "<unspecified>"}`,
        `requireUsage=${requireUsage ? "true" : "false"}`,
        `agentUsage=${agentUsagePath}`,
        `judgeUsage=${judgeUsagePath}`,
        `setupPatch=${setupPatch ?? "<none>"}`,
        "trace=host command stdout/stderr plus changed-file, patch, report, and judge artifacts",
      ].join("\n") + "\n",
      "utf8",
    );

    const agentResult = await execaCommand(agentCommand, {
      cwd: tempRepo,
      reject: false,
      timeout: Number(timeout ?? 900_000),
      env: {
        TRUTHMARK_EVAL_EXPECTED: expectedPath,
        TRUTHMARK_EVAL_PROMPT: promptPath,
        TRUTHMARK_EVAL_REPORT: finalReportPath,
        TRUTHMARK_EVAL_RUN_DIR: runDir,
        TRUTHMARK_EVAL_SCENARIO: scenarioPath,
        TRUTHMARK_EVAL_WORKFLOW: scenario.workflow,
        TRUTHMARK_EVAL_AGENT_MODEL: agentModel ?? "",
        TRUTHMARK_EVAL_JUDGE_MODEL: judgeModel ?? "",
        TRUTHMARK_EVAL_AGENT_USAGE: agentUsagePath,
      },
    });

    const combinedOutput = `${agentResult.stdout}\n${agentResult.stderr}`;
    await writeFile(path.join(runDir, "command-output.txt"), `${agentResult.stdout}\n`, "utf8");
    await writeFile(path.join(runDir, "command-error.txt"), `${agentResult.stderr}\n`, "utf8");

    const status = await git(["status", "--porcelain", "-uall"], tempRepo);
    const changedFiles = parseChangedFiles(status.stdout);
    const beforeAgentChangedSet = new Set(beforeAgentChangedFiles);
    const agentChangedFiles = changedFiles.filter((file) => !beforeAgentChangedSet.has(file));
    await writeFile(path.join(runDir, "changed-files.txt"), `${changedFiles.join("\n")}\n`, "utf8");
    await writeFile(path.join(runDir, "agent-changed-files.txt"), `${agentChangedFiles.join("\n")}\n`, "utf8");

    const diff = await git(["diff", "--binary"], tempRepo);
    await writeFile(path.join(runDir, "before.patch"), `${beforeAgentDiff.stdout}\n`, "utf8");
    await writeFile(path.join(runDir, "after.patch"), `${diff.stdout}\n`, "utf8");

    let finalReportExists = true;
    try {
      await readFile(finalReportPath, "utf8");
    } catch {
      finalReportExists = false;
      await writeFile(finalReportPath, "# Final Report Missing\n\nThe agent did not produce a final workflow report artifact.\n", "utf8");
    }

    const traceEvidence = await collectTraceEvidence(runDir, combinedOutput);
    await writeFile(path.join(runDir, "trace-evidence.txt"), traceEvidence, "utf8");

    const baseDeterministic = gradeDeterministic({
      changedFiles,
      agentChangedFiles,
      expected,
      commandOutput: combinedOutput,
      traceEvidence,
      finalReportExists,
    });

    const judgeResult = await runJudge({
      judgeCommand,
      judgeUsagePath,
      runDir,
      repoRoot,
      scenario,
      scenarioPath,
      expectedPath,
      deterministic: baseDeterministic,
      judgeModel,
    });

    const agentUsage = await readUsageSidecar(agentUsagePath, "agent");
    const judgeUsage = await readUsageSidecar(judgeUsagePath, "judge");
    const usage = buildUsage({
      agentUsage,
      judgeUsage,
      requireUsage,
    });
    const deterministic = {
      ...baseDeterministic,
      failures: [...baseDeterministic.failures, ...usage.requirement.failures],
    };
    deterministic.status = deterministic.failures.length === 0 ? "passed" : "failed";
    await writeFile(path.join(runDir, "deterministic-results.json"), `${JSON.stringify(deterministic, null, 2)}\n`, "utf8");

    const statusValue = resultStatus({
      agentExitCode: agentResult.exitCode,
      deterministic,
      judgeResult,
    });
    const result = {
      status: statusValue,
      runDir,
      workflow: scenario.workflow,
      scenario: scenario.id,
      host,
      agentModel,
      judgeModel,
      agentExitCode: agentResult.exitCode,
      deterministic,
      judge: judgeResult,
      usage,
    };
    await writeFile(path.join(runDir, "result.json"), `${JSON.stringify(result, null, 2)}\n`, "utf8");
    await writeFile(path.join(runDir, "report.md"), renderHumanReport(result), "utf8");
    await writeFile(
      path.join(runDir, "human-review.yaml"),
      "status: not-evaluable\nreviewer: \"\"\nreviewed_at: \"\"\nnotes: []\nfollow_up: []\n",
      "utf8",
    );

    return result;
  } finally {
    await rm(tempRepo, { force: true, recursive: true });
  }
}

function makeAuditScenario(result) {
  return {
    workflow: result.workflow,
    scenario: result.scenario,
    status: result.status,
    host: result.host,
    agentModel: result.agentModel,
    judgeModel: result.judgeModel,
    agentExitCode: result.agentExitCode,
    deterministic: {
      status: result.deterministic.status,
      failures: result.deterministic.failures,
      changedFiles: result.deterministic.changedFiles,
      agentChangedFiles: result.deterministic.agentChangedFiles,
      requiredReads: result.deterministic.requiredReads,
    },
    judge: result.judge,
    usage: result.usage,
  };
}

function renderCatalogReport(audit) {
  const lines = [
    "# Workflow Evaluation Report",
    "",
    `- Status: ${audit.status}`,
    `- Host: ${audit.host}`,
    `- Agent model: \`${audit.agentModel ?? "<unspecified>"}\``,
    `- Judge model: \`${audit.judgeModel ?? "<unspecified>"}\``,
    `- Total scenarios: ${audit.total}`,
    `- Passed: ${audit.passed}`,
    `- Failed: ${audit.failed}`,
    `- Not evaluable: ${audit.notEvaluable}`,
    `- Audit data: \`${audit.audit}\``,
    "",
    "## Token Usage Summary",
    "",
    `- Usage status: ${audit.usage.status}`,
    `- Agent tokens: ${audit.usage.agent.totalTokens} total (${audit.usage.agent.inputTokens} input, ${audit.usage.agent.cachedInputTokens} cached input, ${audit.usage.agent.outputTokens} output, ${audit.usage.agent.reasoningOutputTokens} reasoning output)`,
    `- Judge tokens: ${audit.usage.judge.totalTokens} total (${audit.usage.judge.inputTokens} input, ${audit.usage.judge.cachedInputTokens} cached input, ${audit.usage.judge.outputTokens} output, ${audit.usage.judge.reasoningOutputTokens} reasoning output)`,
    `- Suite tokens: ${audit.usage.total.totalTokens} total (${audit.usage.total.inputTokens} input, ${audit.usage.total.cachedInputTokens} cached input, ${audit.usage.total.outputTokens} output, ${audit.usage.total.reasoningOutputTokens} reasoning output)`,
    `- Required usage status: ${audit.usage.requirement.status}`,
    "",
    "## Scenario Results",
    "",
    "| Workflow | Scenario | Status | Deterministic | Judge | Notes |",
    "|---|---|---:|---:|---:|---|",
  ];

  for (const scenario of audit.scenarios) {
    const notes = [];
    for (const failure of scenario.deterministic.failures ?? []) {
      notes.push(`${failure.id}: ${failure.message}`);
    }
    if (scenario.judge?.note) {
      notes.push(scenario.judge.note);
    }
    for (const judge of scenario.judge?.judges ?? []) {
      if (judge.summary) {
        notes.push(judge.summary);
      }
    }
    if (scenario.usage?.requirement?.status && scenario.usage.requirement.status !== "passed") {
      notes.push(`required usage ${scenario.usage.requirement.status}`);
    }
    for (const warning of [...(scenario.usage?.agent?.warnings ?? []), ...(scenario.usage?.judge?.warnings ?? [])]) {
      notes.push(warning);
    }
    const note = notes.join("; ").replace(/\n/gu, " ").slice(0, 900);
    lines.push(`| \`${scenario.workflow}\` | \`${scenario.scenario}\` | ${scenario.status} | ${scenario.deterministic.status} | ${scenario.judge.status} | ${note} |`);
  }

  lines.push(
    "",
    "## Persistent Artifacts",
    "",
    "- `final-report.md`: this human-facing report.",
    "- `audit.json`: compact machine-readable audit data for the run.",
    "",
    "Detailed per-scenario command traces, patches, and intermediate files were temporary and discarded after aggregation.",
  );
  return `${lines.join("\n")}\n`;
}

function validateCatalogCoverage(catalog) {
  const workflows = Array.isArray(catalog.workflows) ? catalog.workflows : [];
  const ids = workflows.map((workflow) => workflow.id).sort();
  const missing = REQUIRED_WORKFLOWS.filter((workflow) => !ids.includes(workflow));
  if (missing.length > 0) {
    throw new Error(`Catalog is missing required workflow coverage: ${missing.join(", ")}`);
  }
  for (const workflow of workflows) {
    if (!Array.isArray(workflow.scenarios) || workflow.scenarios.length === 0) {
      throw new Error(`Workflow ${workflow.id} must have at least one meaningful scenario.`);
    }
  }
}

async function runCatalog({ repoRoot, args }) {
  const catalogArg = requireArg(args, "catalog");
  const host = requireArg(args, "host");
  const agentCommand = requireArg(args, "agent-command");
  const judgeCommand = optionalString(args, "judge-command");
  const agentModel = optionalString(args, "agent-model");
  const judgeModel = optionalString(args, "judge-model");
  const requireUsage = args.get("require-usage") === true;
  const catalogPath = path.resolve(repoRoot, catalogArg);
  const catalog = await readYaml(catalogPath);
  validateCatalogCoverage(catalog);
  const scenarios = catalog.workflows.flatMap((workflow) => workflow.scenarios ?? []);

  const suiteDir = path.resolve(
    repoRoot,
    args.get("output") ?? path.join("workflow-eval-framwork", "runs", `${timestampSegment()}-all-workflows-${safeSegment(host)}`),
  );
  const reportPath = path.join(suiteDir, "final-report.md");
  const auditPath = path.join(suiteDir, "audit.json");
  const tempSuiteDir = await mkdtemp(path.join(os.tmpdir(), "truthmark-workflow-eval-suite-"));
  await mkdir(suiteDir, { recursive: true });
  console.log(`suiteDir=${suiteDir}`);

  try {
    const results = [];
    for (const scenario of scenarios) {
      results.push(
        await runScenario({
          repoRoot,
          scenarioArg: scenario,
          host,
          agentCommand,
          judgeCommand,
          agentModel,
          judgeModel,
          outputBase: tempSuiteDir,
          timeout: args.get("timeout"),
          requireUsage,
        }),
      );
    }

    const passed = results.filter((result) => result.status === "passed").length;
    const failed = results.filter((result) => result.status === "failed").length;
    const notEvaluable = results.filter((result) => result.status === "not_evaluable").length;
    const summaryStatus = failed > 0 ? "failed" : notEvaluable > 0 ? "not_evaluable" : "passed";
    const suiteUsage = aggregateSuiteUsage(results);
    const audit = {
      status: summaryStatus,
      suiteDir,
      report: reportPath,
      audit: auditPath,
      host,
      judgeRequired: true,
      judgeCommandSupplied: judgeCommand !== undefined,
      agentModel,
      judgeModel,
      total: results.length,
      passed,
      failed,
      notEvaluable,
      usage: suiteUsage,
      scenarios: results.map(makeAuditScenario),
      persistentArtifacts: ["final-report.md", "audit.json"],
      temporaryArtifactsDiscarded: true,
    };
    await writeFile(auditPath, `${JSON.stringify(audit, null, 2)}
`, "utf8");
    await writeFile(reportPath, renderCatalogReport(audit), "utf8");
    console.log(`report=${reportPath}`);
    console.log(`audit=${auditPath}`);
    return audit.status;
  } finally {
    await rm(tempSuiteDir, { force: true, recursive: true });
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.has("pricing-file")) {
    throw new Error("--pricing-file was removed; workflow eval reports token usage only, not dollar estimates.");
  }
  const repoRoot = process.cwd();

  if (args.has("catalog")) {
    const status = await runCatalog({ repoRoot, args });
    process.exitCode = status === "passed" ? 0 : 1;
    return;
  }

  if (args.has("scenario") && args.get("debug-scenario") !== true) {
    throw new Error("Use --catalog for evaluation runs. Single --scenario runs are debug-only and must pass --debug-scenario.");
  }

  const host = requireArg(args, "host");
  const agentCommand = requireArg(args, "agent-command");
  const judgeCommand = optionalString(args, "judge-command");
  const agentModel = optionalString(args, "agent-model");
  const judgeModel = optionalString(args, "judge-model");
  const requireUsage = args.get("require-usage") === true;
  const scenarioArg = requireArg(args, "scenario");
  const outputBase = path.resolve(repoRoot, args.get("output") ?? path.join("workflow-eval-framwork", "runs", "debug"));
  const result = await runScenario({
    repoRoot,
    scenarioArg,
    host,
    agentCommand,
    judgeCommand,
    agentModel,
    judgeModel,
    outputBase,
    timeout: args.get("timeout"),
    requireUsage,
  });
  process.exitCode = result.status === "passed" ? 0 : 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
