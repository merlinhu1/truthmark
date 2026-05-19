import fs from "node:fs/promises";
import path from "node:path";

import { execa } from "execa";
import { parse } from "yaml";
import { afterEach, describe, expect, it } from "vitest";

import {
  VALIDATE_DOCUMENT_REPORT_SCRIPT,
  VALIDATE_SYNC_REPORT_SCRIPT,
  VALIDATE_WRITE_LEASE_SCRIPT,
} from "../../src/agents/workflow-helper-scripts.js";
import { renderTruthmarkSkillPackage } from "../../src/templates/workflow-surfaces.js";
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

const runMaterializedHelper = async ({
  scriptName,
  scriptContent,
  files,
  args,
}: {
  scriptName: string;
  scriptContent: string;
  files: Record<string, string>;
  args: string[];
}): Promise<HelperResult> => {
  const repo = await createTempRepo();
  tempRepos.push(repo);
  await repo.writeFile(scriptName, scriptContent);

  for (const [filePath, content] of Object.entries(files)) {
    await repo.writeFile(filePath, content);
  }

  const before = await snapshotFiles(repo.rootDir);
  const result = await execa(
    process.execPath,
    [scriptName, ...args],
    {
      cwd: repo.rootDir,
      reject: false,
    },
  );
  const after = await snapshotFiles(repo.rootDir);

  expect(after).toEqual(before);

  if (result.stdout === "") {
    throw new Error(`helper printed no JSON\nstderr:\n${result.stderr}`);
  }

  return {
    exitCode: result.exitCode ?? 1,
    stdout: result.stdout,
    stderr: result.stderr,
    json: JSON.parse(result.stdout) as HelperResult["json"],
  };
};

const getGeneratedReportExample = (workflowId: "truthmark-document" | "truthmark-sync"): string => {
  const files = renderTruthmarkSkillPackage({
    skillPath: `.codex/skills/${workflowId}/SKILL.md`,
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
    skillPath: `.codex/skills/${workflowId}/SKILL.md`,
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
- docs/truthmark/areas.md

Truth docs updated:
- docs/truth/init-and-scaffold.md

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
- docs/truthmark/areas.md

Truth docs created:
- docs/truth/workflows/helpers.md

Evidence checked:
${evidenceChecked}

Helper scripts:
- validate-document-report: ran, passed
- validate-write-lease: skipped, no write lease used

Notes:
- Complete.
`;

const runSyncReport = async (report: string): Promise<HelperResult> =>
  runMaterializedHelper({
    scriptName: "validate-sync-report.mjs",
    scriptContent: VALIDATE_SYNC_REPORT_SCRIPT,
    files: { "report.md": report },
    args: ["report.md"],
  });

const runDocumentReport = async (report: string): Promise<HelperResult> =>
  runMaterializedHelper({
    scriptName: "validate-document-report.mjs",
    scriptContent: VALIDATE_DOCUMENT_REPORT_SCRIPT,
    files: { "report.md": report },
    args: ["report.md"],
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

  it("runs generated helper manifest commands from the documented skill package directory", async () => {
    const repo = await materializeSkillPackage("truthmark-sync");
    const skillDirectory = path.join(repo.rootDir, ".codex/skills/truthmark-sync");
    const manifest = await fs.readFile(
      path.join(skillDirectory, "helper-manifest.yml"),
      "utf8",
    );
    const commandMatch = manifest.match(/^\s+command:\s*(.+)$/mu);

    if (commandMatch === null) {
      throw new Error("missing helper manifest command");
    }

    await fs.writeFile(
      path.join(skillDirectory, "report.md"),
      getGeneratedReportExample("truthmark-sync"),
      "utf8",
    );

    const command = commandMatch[1].replace("<report-file>", "report.md");
    const result = await execa("bash", ["-lc", command], {
      cwd: skillDirectory,
      reject: false,
    });

    expect(result.exitCode).toBe(0);
    expect(JSON.parse(result.stdout)).toMatchObject({ ok: true });
  });

  it("accepts a valid completed Truth Sync report", async () => {
    const result = await runMaterializedHelper({
      scriptName: "validate-sync-report.mjs",
      scriptContent: VALIDATE_SYNC_REPORT_SCRIPT,
      files: {
        "report.md": `Truth Sync: completed

Changed code reviewed:
- src/init/init.ts

Ownership reviewed:
- docs/truthmark/areas.md

Truth docs updated:
- docs/truth/init-and-scaffold.md

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
      args: ["report.md"],
    });

    expect(result.exitCode).toBe(0);
    expect(result.stderr).toBe("");
    expect(result.json.ok).toBe(true);
    expect(result.json.helper).toBe("validate-sync-report");
  });

  it("accepts the generated Truth Sync report template example", async () => {
    const result = await runMaterializedHelper({
      scriptName: "validate-sync-report.mjs",
      scriptContent: VALIDATE_SYNC_REPORT_SCRIPT,
      files: {
        "report.md": getGeneratedReportExample("truthmark-sync"),
      },
      args: ["report.md"],
    });

    expect(result.exitCode).toBe(0);
    expect(result.json.ok).toBe(true);
  });

  it("rejects a completed Truth Sync report missing helper script statuses", async () => {
    const result = await runMaterializedHelper({
      scriptName: "validate-sync-report.mjs",
      scriptContent: VALIDATE_SYNC_REPORT_SCRIPT,
      files: {
        "report.md": `Truth Sync: completed

Changed code reviewed:
- src/init/init.ts

Ownership reviewed:
- docs/truthmark/areas.md

Truth docs updated:
- docs/truth/init-and-scaffold.md

Evidence checked:
- Claim: Init writes generated workflow files.
  Evidence: src/init/init.ts
  Result: supported

Notes:
- Complete.
`,
      },
      args: ["report.md"],
    });

    expect(result.exitCode).toBe(1);
    expect(result.json.ok).toBe(false);
    expect(result.json.errors?.join("\n")).toContain("Helper scripts");
  });

  it("rejects a completed Truth Sync report with evidence labels outside Evidence checked", async () => {
    const result = await runMaterializedHelper({
      scriptName: "validate-sync-report.mjs",
      scriptContent: VALIDATE_SYNC_REPORT_SCRIPT,
      files: {
        "report.md": `Truth Sync: completed

Changed code reviewed:
- src/init/init.ts

Ownership reviewed:
- docs/truthmark/areas.md

Truth docs updated:
- docs/truth/init-and-scaffold.md

Evidence checked:
- malformed entry only

Notes:
- Claim: appears outside the evidence section.
- Evidence: appears outside the evidence section.
- Result: appears outside the evidence section.
`,
      },
      args: ["report.md"],
    });

    expect(result.exitCode).toBe(1);
    expect(result.json.ok).toBe(false);
    expect(result.json.errors?.join("\n")).toContain("Evidence checked");
  });

  it("rejects a completed Truth Sync report missing Evidence checked", async () => {
    const result = await runMaterializedHelper({
      scriptName: "validate-sync-report.mjs",
      scriptContent: VALIDATE_SYNC_REPORT_SCRIPT,
      files: {
        "report.md": `Truth Sync: completed

Changed code reviewed:
- src/init/init.ts

Ownership reviewed:
- docs/truthmark/areas.md

Truth docs updated:
- docs/truth/init-and-scaffold.md

Notes:
- Missing evidence.
`,
      },
      args: ["report.md"],
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
    const result = await runMaterializedHelper({
      scriptName: "validate-document-report.mjs",
      scriptContent: VALIDATE_DOCUMENT_REPORT_SCRIPT,
      files: {
        "report.md": `Truth Document: completed

Implementation reviewed:
- src/templates/workflow-surfaces.ts

Ownership reviewed:
- docs/truthmark/areas.md

Truth docs created:
- docs/truth/workflows/helpers.md

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
      args: ["report.md"],
    });

    expect(result.exitCode).toBe(0);
    expect(result.json.ok).toBe(true);
    expect(result.json.helper).toBe("validate-document-report");
  });

  it("accepts the generated Truth Document report template example", async () => {
    const result = await runMaterializedHelper({
      scriptName: "validate-document-report.mjs",
      scriptContent: VALIDATE_DOCUMENT_REPORT_SCRIPT,
      files: {
        "report.md": getGeneratedReportExample("truthmark-document"),
      },
      args: ["report.md"],
    });

    expect(result.exitCode).toBe(0);
    expect(result.json.ok).toBe(true);
  });

  it("rejects a completed Truth Document report with malformed Evidence checked entries", async () => {
    const result = await runMaterializedHelper({
      scriptName: "validate-document-report.mjs",
      scriptContent: VALIDATE_DOCUMENT_REPORT_SCRIPT,
      files: {
        "report.md": `Truth Document: completed

Implementation reviewed:
- src/templates/workflow-surfaces.ts

Ownership reviewed:
- docs/truthmark/areas.md

Truth docs created:
- docs/truth/workflows/helpers.md

Evidence checked:
- malformed entry only

Notes:
- Complete.
`,
      },
      args: ["report.md"],
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

  it("rejects write-lease changes outside allowedWrites", async () => {
    const result = await runMaterializedHelper({
      scriptName: "validate-write-lease.mjs",
      scriptContent: VALIDATE_WRITE_LEASE_SCRIPT,
      files: {
        "lease.yml": `allowedWrites:
  - docs/truth/**
forbiddenWrites:
  - src/**
`,
        "changed-files.txt": "src/init/init.ts\n",
      },
      args: ["lease.yml", "changed-files.txt"],
    });

    expect(result.exitCode).toBe(1);
    expect(result.json.ok).toBe(false);
    expect(result.json.errors?.join("\n")).toContain("outside allowedWrites");
  });

  it("rejects unsupported write-lease glob patterns with manual-validation guidance", async () => {
    const result = await runMaterializedHelper({
      scriptName: "validate-write-lease.mjs",
      scriptContent: VALIDATE_WRITE_LEASE_SCRIPT,
      files: {
        "lease.yml": `allowedWrites:
  - docs/**/*.md
forbiddenWrites: []
`,
        "changed-files.txt": "docs/truth/workflows/overview.md\n",
      },
      args: ["lease.yml", "changed-files.txt"],
    });

    expect(result.exitCode).toBe(1);
    expect(result.json.ok).toBe(false);
    expect(result.json.errors?.join("\n")).toContain("manual-validation");
  });
});
