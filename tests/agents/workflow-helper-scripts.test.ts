import fs from "node:fs/promises";
import path from "node:path";

import { parse } from "yaml";
import { afterEach, describe, expect, it } from "vitest";

import { renderTruthmarkSkillPackage } from "../../src/templates/workflow-surfaces.js";
import { runCli } from "../helpers/run-cli.js";
import { createTempRepo } from "../helpers/temp-repo.js";

type HelperResult = {
  exitCode: number;
  stdout: string;
  stderr: string;
  json: {
    ok: boolean;
    helper: string;
    checks?: string[];
    errors?: string[];
  };
};

type ValidationEnvelope = {
  command: string;
  summary: string;
  diagnostics: unknown[];
  data?: {
    validation?: HelperResult["json"];
  };
};

const parseValidationEnvelope = (stdout: string): HelperResult["json"] => {
  const parsed = JSON.parse(stdout) as ValidationEnvelope;
  const validation = parsed.data?.validation;

  if (validation === undefined) {
    throw new Error(`missing data.validation in helper JSON\nstdout:\n${stdout}`);
  }

  return validation;
};

const tempRepos: Array<Awaited<ReturnType<typeof createTempRepo>>> = [];

const snapshotFiles = async (rootDir: string): Promise<Record<string, string>> => {
  const entries = await fs.readdir(rootDir, {
    recursive: true,
    withFileTypes: true,
  });

  const filePaths = entries
    .filter((entry) => entry.isFile())
    .map((entry) => path.relative(rootDir, path.join(entry.parentPath, entry.name)))
    .sort();

  return Object.fromEntries(
    await Promise.all(
      filePaths.map(async (filePath) => [
        filePath,
        await fs.readFile(path.join(rootDir, filePath), "utf8"),
      ]),
    ),
  );
};

const runCliHelper = async ({
  files,
  args,
}: {
  files: Record<string, string>;
  args: string[];
}): Promise<HelperResult> => {
  const repo = await createTempRepo();
  tempRepos.push(repo);

  for (const [filePath, content] of Object.entries(files)) {
    await repo.writeFile(filePath, content);
  }

  const before = await snapshotFiles(repo.rootDir);
  const result = await runCli(args, { cwd: repo.rootDir });
  const after = await snapshotFiles(repo.rootDir);

  expect(after).toEqual(before);

  if (result.stdout === "") {
    throw new Error(`helper printed no JSON\nstderr:\n${result.stderr}`);
  }

  return {
    exitCode: result.exitCode ?? 1,
    stdout: result.stdout,
    stderr: result.stderr,
    json: parseValidationEnvelope(result.stdout),
  };
};

const getGeneratedReportExample = (workflowId: "truthmark-document" | "truthmark-sync"): string => {
  const files = renderTruthmarkSkillPackage({
    skillPath: `.agents/skills/${workflowId}/SKILL.md`,
    workflowId,
    host: "codex",
  });
  const reportTemplate = files.find((file) => file.path.endsWith("/support/report-template.md"));
  const match = reportTemplate?.content.match(/```md\n([\s\S]*?)\n```/u);

  if (match === null || match === undefined) {
    throw new Error(`missing generated report example for ${workflowId}`);
  }

  return match[1];
};

const materializeSkillPackage = async (workflowId: "truthmark-document" | "truthmark-sync") => {
  const repo = await createTempRepo();
  tempRepos.push(repo);

  for (const file of renderTruthmarkSkillPackage({
    skillPath: `.agents/skills/${workflowId}/SKILL.md`,
    workflowId,
    host: "codex",
  })) {
    await repo.writeFile(file.path, file.content);
  }

  return repo;
};

const syncReportWithEvidence = (evidenceChecked: string): string => `Truth Sync: completed

Changed code reviewed:
- src/init/init.ts

Ownership reviewed:
- docs/truthmark/routes/areas.md

Truth docs updated:
- docs/truthmark/truth/init-and-scaffold.md

Decision/rationale captured:
- none provided in task conversation

Evidence checked:
${evidenceChecked}

Helper scripts:
- validate-sync-report: ran, passed
- validate-write-lease: skipped, no write lease used

Notes:
- Complete.
`;

const documentReportWithEvidence = (evidenceChecked: string): string => `Truth Document: completed

Implementation reviewed:
- src/templates/workflow-surfaces.ts

Ownership reviewed:
- docs/truthmark/routes/areas.md

Truth docs created:
- docs/truthmark/truth/workflows/helpers.md

Evidence checked:
${evidenceChecked}

Helper scripts:
- validate-document-report: ran, passed
- validate-write-lease: skipped, no write lease used

Notes:
- Complete.
`;

const runSyncReport = async (report: string): Promise<HelperResult> =>
  runCliHelper({
    files: { "report.md": report },
    args: ["validate", "sync-report", "report.md", "--json"],
  });

const runDocumentReport = async (report: string): Promise<HelperResult> =>
  runCliHelper({
    files: { "report.md": report },
    args: ["validate", "document-report", "report.md", "--json"],
  });

const runWriteLease = async ({
  lease,
  changedFiles,
}: {
  lease: string;
  changedFiles: string;
}): Promise<HelperResult> =>
  runCliHelper({
    files: {
      "lease.yml": lease,
      "changed-files.txt": changedFiles,
    },
    args: ["validate", "write-lease", "lease.yml", "changed-files.txt", "--json"],
  });

afterEach(async () => {
  const repos = tempRepos.splice(0);

  await Promise.all(repos.map((repo) => repo.cleanup()));
});

describe("workflow helper scripts", () => {
  it("renders parseable helper manifests for every generated workflow host", () => {
    const packageTargets = [
      { host: "codex", skillRoot: ".codex" },
      { host: "opencode", skillRoot: ".opencode" },
      { host: "claude-code", skillRoot: ".claude" },
    ] as const;
    const workflowIds = ["truthmark-document", "truthmark-sync"] as const;

    for (const { host, skillRoot } of packageTargets) {
      for (const workflowId of workflowIds) {
        const files = renderTruthmarkSkillPackage({
          skillPath: `${skillRoot}/skills/${workflowId}/SKILL.md`,
          workflowId,
          host,
        });
        const manifest = files.find((file) =>
          file.path.endsWith("/helper-manifest.yml"),
        );
        const entrypoint = files.find((file) => file.path.endsWith("/SKILL.md"));

        expect(manifest).toBeDefined();
        expect(entrypoint?.content).toContain("- helper-manifest.yml");

        const parsed = parse(manifest?.content ?? "") as {
          helpers?: Record<string, { fallback?: unknown }>;
        };
        const expectedReportHelper =
          workflowId === "truthmark-sync"
            ? "validate-sync-report"
            : "validate-document-report";

        expect(parsed.helpers).toBeDefined();
        expect(parsed.helpers?.[expectedReportHelper]?.fallback).toEqual(
          expect.any(String),
        );

        if (workflowId === "truthmark-sync") {
          expect(parsed.helpers?.[expectedReportHelper]?.fallback).toContain(
            "Result: supported",
          );
        }
      }
    }
  });

  it("runs generated helper manifest argv through the Truthmark CLI", async () => {
    const repo = await materializeSkillPackage("truthmark-sync");
    const skillDirectory = path.join(repo.rootDir, ".agents/skills/truthmark-sync");
    const manifest = await fs.readFile(
      path.join(skillDirectory, "helper-manifest.yml"),
      "utf8",
    );
    const parsed = parse(manifest) as {
      helpers?: Record<string, { command?: { argv?: string[] } }>;
    };
    const argv = parsed.helpers?.["validate-sync-report"]?.command?.argv;

    expect(argv).toEqual([
      "truthmark",
      "validate",
      "sync-report",
      "<report-file>",
      "--json",
    ]);
    await expect(
      fs.access(path.join(skillDirectory, "scripts/validate-sync-report.mjs")),
    ).rejects.toThrow();

    await fs.writeFile(
      path.join(skillDirectory, "report.md"),
      getGeneratedReportExample("truthmark-sync"),
      "utf8",
    );

    const result = await runCli(["validate", "sync-report", "report.md", "--json"], {
      cwd: skillDirectory,
    });

    expect(result.exitCode).toBe(0);
    expect(JSON.parse(result.stdout)).toMatchObject({
      data: { validation: { ok: true } },
    });
  });

  it("accepts a valid completed Truth Sync report", async () => {
    const result = await runCliHelper({
      files: {
        "report.md": `Truth Sync: completed

Changed code reviewed:
- src/init/init.ts

Ownership reviewed:
- docs/truthmark/routes/areas.md

Truth docs updated:
- docs/truthmark/truth/init-and-scaffold.md

Decision/rationale captured:
- none provided in task conversation

Evidence checked:
- Claim: Init writes generated workflow files.
  Evidence: src/init/init.ts
  Result: supported

Helper scripts:
- validate-sync-report: ran, passed
- validate-write-lease: skipped, no write lease used

Notes:
- Complete.
`,
      },
      args: ["validate", "sync-report", "report.md", "--json"],
    });

    expect(result.exitCode).toBe(0);
    expect(result.stderr).toBe("");
    expect(result.json.ok).toBe(true);
    expect(result.json.helper).toBe("validate-sync-report");
  });

  it("accepts a completed Truth Sync report body before its own helper status is appended", async () => {
    const result = await runSyncReport(
      syncReportWithEvidence(`- Claim: Init writes generated workflow files.
  Evidence: src/init/init.ts
  Result: supported`).replace("- validate-sync-report: ran, passed\n", ""),
    );

    expect(result.exitCode).toBe(0);
    expect(result.json.ok).toBe(true);
  });

  it("accepts Truth Sync helper status bullets with flexible whitespace", async () => {
    const report = syncReportWithEvidence(`- Claim: Init writes generated workflow files.
  Evidence: src/init/init.ts
  Result: supported`)
      .replace("- validate-sync-report: ran, passed", "-   validate-sync-report: ran, passed")
      .replace(
        "- validate-write-lease: skipped, no write lease used",
        "-\tvalidate-write-lease: skipped, no write lease used",
      );
    const result = await runSyncReport(report);

    expect(result.exitCode).toBe(0);
    expect(result.json.ok).toBe(true);
  });

  it("accepts the generated Truth Sync report template example", async () => {
    const result = await runCliHelper({
      files: {
        "report.md": getGeneratedReportExample("truthmark-sync"),
      },
      args: ["validate", "sync-report", "report.md", "--json"],
    });

    expect(result.exitCode).toBe(0);
    expect(result.json.ok).toBe(true);
  });

  it("rejects a completed Truth Sync report missing helper script statuses", async () => {
    const result = await runCliHelper({
      files: {
        "report.md": `Truth Sync: completed

Changed code reviewed:
- src/init/init.ts

Ownership reviewed:
- docs/truthmark/routes/areas.md

Truth docs updated:
- docs/truthmark/truth/init-and-scaffold.md

Decision/rationale captured:
- none provided in task conversation

Evidence checked:
- Claim: Init writes generated workflow files.
  Evidence: src/init/init.ts
  Result: supported

Notes:
- Complete.
`,
      },
      args: ["validate", "sync-report", "report.md", "--json"],
    });

    expect(result.exitCode).toBe(1);
    expect(result.json.ok).toBe(false);
    expect(result.json.errors?.join("\n")).toContain("Helper scripts");
  });

  it.each([
    ["blocked", "Reason"],
    ["skipped", "Reason"],
  ])("rejects a Truth Sync %s report with no required body", async (status, expectedError) => {
    const result = await runSyncReport(`Truth Sync: ${status}\n`);

    expect(result.exitCode).toBe(1);
    expect(result.json.ok).toBe(false);
    expect(result.json.errors?.join("\n")).toContain(expectedError);
  });

  it("rejects a blocked Truth Sync report missing manual-review files", async () => {
    const result = await runSyncReport(`Truth Sync: blocked

Reason:
- route ownership is ambiguous

Next action:
- run Truth Structure before rerunning Truth Sync
`);

    expect(result.exitCode).toBe(1);
    expect(result.json.ok).toBe(false);
    expect(result.json.errors?.join("\n")).toContain("Files requiring manual review");
  });

  it.each([
    ["Changed code reviewed"],
    ["Ownership reviewed"],
    ["Truth docs updated"],
    ["Notes"],
  ])("rejects a completed Truth Sync report with empty %s", async (label) => {
    const report = syncReportWithEvidence(`- Claim: Init writes generated workflow files.
  Evidence: src/init/init.ts
  Result: supported`).replace(new RegExp(`${label}:\\n- [^\\n]+`, "u"), `${label}:`);
    const result = await runSyncReport(report);

    expect(result.exitCode).toBe(1);
    expect(result.json.ok).toBe(false);
    expect(result.json.errors?.join("\n")).toContain(label);
  });

  it("rejects a completed Truth Sync report with evidence labels outside Evidence checked", async () => {
    const result = await runCliHelper({
      files: {
        "report.md": `Truth Sync: completed

Changed code reviewed:
- src/init/init.ts

Ownership reviewed:
- docs/truthmark/routes/areas.md

Truth docs updated:
- docs/truthmark/truth/init-and-scaffold.md

Decision/rationale captured:
- none provided in task conversation

Evidence checked:
- malformed entry only

Notes:
- Claim: appears outside the evidence section.
- Evidence: appears outside the evidence section.
- Result: appears outside the evidence section.
`,
      },
      args: ["validate", "sync-report", "report.md", "--json"],
    });

    expect(result.exitCode).toBe(1);
    expect(result.json.ok).toBe(false);
    expect(result.json.errors?.join("\n")).toContain("Evidence checked");
  });

  it("rejects a completed Truth Sync report missing Evidence checked", async () => {
    const result = await runCliHelper({
      files: {
        "report.md": `Truth Sync: completed

Changed code reviewed:
- src/init/init.ts

Ownership reviewed:
- docs/truthmark/routes/areas.md

Truth docs updated:
- docs/truthmark/truth/init-and-scaffold.md

Decision/rationale captured:
- none provided in task conversation

Notes:
- Missing evidence.
`,
      },
      args: ["validate", "sync-report", "report.md", "--json"],
    });

    expect(result.exitCode).toBe(1);
    expect(result.json.ok).toBe(false);
    expect(result.json.errors?.join("\n")).toContain("Evidence checked");
  });

  it.each([
    ["empty Evidence checked", ""],
    [
      "missing Result",
      `- Claim: Init writes generated workflow files.
  Evidence: src/init/init.ts`,
    ],
    [
      "invalid Result enum",
      `- Claim: Init writes generated workflow files.
  Evidence: src/init/init.ts
  Result: guessed`,
    ],
    [
      "malformed indentation",
      `- Claim: Init writes generated workflow files.
Evidence: src/init/init.ts
  Result: supported`,
    ],
  ])("rejects a completed Truth Sync report with %s", async (_name, evidenceChecked) => {
    const result = await runSyncReport(syncReportWithEvidence(evidenceChecked));

    expect(result.exitCode).toBe(1);
    expect(result.json.ok).toBe(false);
    expect(result.json.errors?.join("\n")).toContain("Evidence checked");
  });

  it.each([
    ["validate-sync-report"],
    ["validate-write-lease"],
  ])("rejects a completed Truth Sync report when %s ran and failed", async (helperId) => {
    const report = syncReportWithEvidence(`- Claim: Init writes generated workflow files.
  Evidence: src/init/init.ts
  Result: supported`).replace(
      `- ${helperId}: ${helperId === "validate-write-lease" ? "skipped, no write lease used" : "ran, passed"}`,
      `- ${helperId}: ran, failed`,
    );

    const result = await runSyncReport(report);

    expect(result.exitCode).toBe(1);
    expect(result.json.ok).toBe(false);
    expect(result.json.errors?.join("\n")).toContain("ran, failed");
  });

  it("accepts a valid completed Truth Document report", async () => {
    const result = await runCliHelper({
      files: {
        "report.md": `Truth Document: completed

Implementation reviewed:
- src/templates/workflow-surfaces.ts

Ownership reviewed:
- docs/truthmark/routes/areas.md

Truth docs created:
- docs/truthmark/truth/workflows/helpers.md

Evidence checked:
- Claim: Helpers are optional.
  Evidence: src/agents/workflow-manifest.ts
  Result: supported

Helper scripts:
- validate-document-report: ran, passed
- validate-write-lease: skipped, no write lease used

Notes:
- Complete.
`,
      },
      args: ["validate", "document-report", "report.md", "--json"],
    });

    expect(result.exitCode).toBe(0);
    expect(result.json.ok).toBe(true);
    expect(result.json.helper).toBe("validate-document-report");
  });

  it("accepts a completed Truth Document report body before its own helper status is appended", async () => {
    const result = await runDocumentReport(
      documentReportWithEvidence(`- Claim: Helpers are optional.
  Evidence: src/agents/workflow-manifest.ts
  Result: supported`).replace("- validate-document-report: ran, passed\n", ""),
    );

    expect(result.exitCode).toBe(0);
    expect(result.json.ok).toBe(true);
  });

  it("accepts Truth Document helper status bullets with flexible whitespace", async () => {
    const report = documentReportWithEvidence(`- Claim: Helpers are optional.
  Evidence: src/agents/workflow-manifest.ts
  Result: supported`)
      .replace(
        "- validate-document-report: ran, passed",
        "-   validate-document-report: ran, passed",
      )
      .replace(
        "- validate-write-lease: skipped, no write lease used",
        "-\tvalidate-write-lease: skipped, no write lease used",
      );
    const result = await runDocumentReport(report);

    expect(result.exitCode).toBe(0);
    expect(result.json.ok).toBe(true);
  });

  it("accepts the generated Truth Document report template example", async () => {
    const result = await runCliHelper({
      files: {
        "report.md": getGeneratedReportExample("truthmark-document"),
      },
      args: ["validate", "document-report", "report.md", "--json"],
    });

    expect(result.exitCode).toBe(0);
    expect(result.json.ok).toBe(true);
  });

  it("rejects a Truth Document blocked report with no required body", async () => {
    const result = await runDocumentReport("Truth Document: blocked\n");

    expect(result.exitCode).toBe(1);
    expect(result.json.ok).toBe(false);
    expect(result.json.errors?.join("\n")).toContain("Reason");
  });

  it.each([
    ["Implementation reviewed"],
    ["Ownership reviewed"],
    ["Truth docs created"],
    ["Notes"],
  ])("rejects a completed Truth Document report with empty %s", async (label) => {
    const report = documentReportWithEvidence(`- Claim: Helpers are optional.
  Evidence: src/agents/workflow-manifest.ts
  Result: supported`).replace(new RegExp(`${label}:\\n- [^\\n]+`, "u"), `${label}:`);
    const result = await runDocumentReport(report);

    expect(result.exitCode).toBe(1);
    expect(result.json.ok).toBe(false);
    expect(result.json.errors?.join("\n")).toContain(label);
  });

  it("rejects a completed Truth Document report with malformed Evidence checked entries", async () => {
    const result = await runCliHelper({
      files: {
        "report.md": `Truth Document: completed

Implementation reviewed:
- src/templates/workflow-surfaces.ts

Ownership reviewed:
- docs/truthmark/routes/areas.md

Truth docs created:
- docs/truthmark/truth/workflows/helpers.md

Evidence checked:
- malformed entry only

Notes:
- Complete.
`,
      },
      args: ["validate", "document-report", "report.md", "--json"],
    });

    expect(result.exitCode).toBe(1);
    expect(result.json.ok).toBe(false);
    expect(result.json.errors?.join("\n")).toContain("Evidence checked");
  });

  it.each([
    ["empty Evidence checked", ""],
    [
      "labels outside Evidence checked",
      `- malformed entry only

Notes:
- Claim: appears outside the evidence section.
- Evidence: appears outside the evidence section.
- Result: appears outside the evidence section.`,
    ],
    [
      "missing Result",
      `- Claim: Helpers are optional.
  Evidence: src/agents/workflow-manifest.ts`,
    ],
    [
      "invalid Result enum",
      `- Claim: Helpers are optional.
  Evidence: src/agents/workflow-manifest.ts
  Result: guessed`,
    ],
    [
      "malformed indentation",
      `- Claim: Helpers are optional.
Evidence: src/agents/workflow-manifest.ts
  Result: supported`,
    ],
  ])("rejects a completed Truth Document report with %s", async (_name, evidenceChecked) => {
    const result = await runDocumentReport(documentReportWithEvidence(evidenceChecked));

    expect(result.exitCode).toBe(1);
    expect(result.json.ok).toBe(false);
    expect(result.json.errors?.join("\n")).toContain("Evidence checked");
  });

  it.each([
    ["validate-document-report"],
    ["validate-write-lease"],
  ])("rejects a completed Truth Document report when %s ran and failed", async (helperId) => {
    const report = documentReportWithEvidence(`- Claim: Helpers are optional.
  Evidence: src/agents/workflow-manifest.ts
  Result: supported`).replace(
      `- ${helperId}: ${helperId === "validate-write-lease" ? "skipped, no write lease used" : "ran, passed"}`,
      `- ${helperId}: ran, failed`,
    );

    const result = await runDocumentReport(report);

    expect(result.exitCode).toBe(1);
    expect(result.json.ok).toBe(false);
    expect(result.json.errors?.join("\n")).toContain("ran, failed");
  });

  it.each([
    [
      "block list",
      `allowedWrites:
  - docs/truthmark/truth/**
forbiddenWrites:
  - src/**
`,
    ],
    ["flow list", "allowedWrites: [docs/truthmark/truth/**]\nforbiddenWrites: []\n"],
    [
      "quoted paths and comments",
      `# parent-issued lease
allowedWrites:
  - "docs/truthmark/truth/**" # canonical truth docs
forbiddenWrites:
  - 'src/**' # functional code
`,
    ],
    [
      "worker report with nested lease",
      `status: completed
worker: truth_doc_writer
workflow: truthmark-sync
writeLease:
  allowedWrites: [docs/truthmark/truth/**]
  forbiddenWrites:
    - src/**
filesChanged:
  - docs/truthmark/truth/workflows/overview.md
`,
    ],
  ])("accepts write-lease %s YAML", async (_name, lease) => {
    const result = await runWriteLease({
      lease,
      changedFiles: "docs/truthmark/truth/workflows/overview.md\n",
    });

    expect(result.exitCode).toBe(0);
    expect(result.json.ok).toBe(true);
  });

  it.each([
    [
      "invalid YAML",
      `allowedWrites:
  - docs/truthmark/truth/**
forbiddenWrites: [src/**
`,
      "invalid write lease YAML",
    ],
    [
      "non-list allowedWrites",
      `allowedWrites: docs/truthmark/truth/**
forbiddenWrites: []
`,
      "allowedWrites must be an array of strings",
    ],
    [
      "non-list forbiddenWrites",
      `allowedWrites: [docs/truthmark/truth/**]
forbiddenWrites: src/**
`,
      "forbiddenWrites must be an array of strings",
    ],
    [
      "non-string allowedWrites item",
      `allowedWrites:
  - docs/truthmark/truth/**
  - 42
forbiddenWrites: []
`,
      "allowedWrites must be an array of strings",
    ],
  ])("rejects write-lease %s", async (_name, lease, expectedError) => {
    const result = await runWriteLease({
      lease,
      changedFiles: "docs/truthmark/truth/workflows/overview.md\n",
    });

    expect(result.exitCode).toBe(1);
    expect(result.json.ok).toBe(false);
    expect(result.json.errors?.join("\n")).toContain(expectedError);
  });

  it("rejects write-lease changes outside allowedWrites", async () => {
    const result = await runCliHelper({
      files: {
        "lease.yml": `allowedWrites:
  - docs/truthmark/truth/**
forbiddenWrites:
  - src/**
`,
        "changed-files.txt": "src/init/init.ts\n",
      },
      args: ["validate", "write-lease", "lease.yml", "changed-files.txt", "--json"],
    });

    expect(result.exitCode).toBe(1);
    expect(result.json.ok).toBe(false);
    expect(result.json.errors?.join("\n")).toContain("outside allowedWrites");
  });

  it.each([
    ["parent-directory changed file", "../outside.md", "invalid changed file path"],
    ["absolute changed file", "/docs/truthmark/truth/workflows/overview.md", "invalid changed file path"],
    ["normalized-outside changed file", "docs/truthmark/truth/../../src/init.ts", "invalid changed file path"],
  ])("rejects write-lease %s", async (_name, changedFiles, expectedError) => {
    const result = await runWriteLease({
      lease: `allowedWrites:
  - docs/truthmark/truth/**
forbiddenWrites:
  - src/**
`,
      changedFiles: `${changedFiles}\n`,
    });

    expect(result.exitCode).toBe(1);
    expect(result.json.ok).toBe(false);
    expect(result.json.errors?.join("\n")).toContain(expectedError);
  });

  it.each([
    ["parent-directory allowedWrites", "../docs/truthmark/truth/**"],
    ["absolute allowedWrites", "/docs/truthmark/truth/**"],
    ["normalized-outside allowedWrites", "docs/truthmark/truth/../../src/**"],
  ])("rejects write-lease %s", async (_name, allowedWrite) => {
    const result = await runWriteLease({
      lease: `allowedWrites:
  - ${allowedWrite}
forbiddenWrites: []
`,
      changedFiles: "docs/truthmark/truth/workflows/overview.md\n",
    });

    expect(result.exitCode).toBe(1);
    expect(result.json.ok).toBe(false);
    expect(result.json.errors?.join("\n")).toContain("invalid allowedWrites path");
  });

  it("rejects unsupported write-lease glob patterns with manual-validation guidance", async () => {
    const result = await runCliHelper({
      files: {
        "lease.yml": `allowedWrites:
  - docs/**/*.md
forbiddenWrites: []
`,
        "changed-files.txt": "docs/truthmark/truth/workflows/overview.md\n",
      },
      args: ["validate", "write-lease", "lease.yml", "changed-files.txt", "--json"],
    });

    expect(result.exitCode).toBe(1);
    expect(result.json.ok).toBe(false);
    expect(result.json.errors?.join("\n")).toContain("manual-validation");
  });
});
