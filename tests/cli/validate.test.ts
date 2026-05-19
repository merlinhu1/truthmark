import { describe, expect, it } from "vitest";

import { runCli } from "../helpers/run-cli.js";
import { createTempRepo } from "../helpers/temp-repo.js";

const validSyncReport = `Truth Sync: completed

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
`;

const validDocumentReport = `Truth Document: completed

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
`;

describe("truthmark validate CLI helpers", () => {
  it("validates sync reports through the Truthmark CLI", async () => {
    const repo = await createTempRepo();
    try {
      await repo.writeFile("report.md", validSyncReport);

      const result = await runCli(["validate", "sync-report", "report.md", "--json"], {
        cwd: repo.rootDir,
      });
      const output = JSON.parse(result.stdout) as {
        ok: boolean;
        helper: string;
        checks?: string[];
      };

      expect(result.exitCode).toBe(0);
      expect(output).toMatchObject({ ok: true, helper: "validate-sync-report" });
      expect(output.checks).toContain("status: completed");
    } finally {
      await repo.cleanup();
    }
  });

  it("validates document reports through the Truthmark CLI", async () => {
    const repo = await createTempRepo();
    try {
      await repo.writeFile("report.md", validDocumentReport);

      const result = await runCli(["validate", "document-report", "report.md", "--json"], {
        cwd: repo.rootDir,
      });
      const output = JSON.parse(result.stdout) as { ok: boolean; helper: string };

      expect(result.exitCode).toBe(0);
      expect(output).toMatchObject({ ok: true, helper: "validate-document-report" });
    } finally {
      await repo.cleanup();
    }
  });

  it("rejects failed helper statuses in completed sync reports", async () => {
    const repo = await createTempRepo();
    try {
      await repo.writeFile(
        "report.md",
        validSyncReport.replace("validate-sync-report: ran, passed", "validate-sync-report: ran, failed"),
      );

      const result = await runCli(["validate", "sync-report", "report.md", "--json"], {
        cwd: repo.rootDir,
      });
      const output = JSON.parse(result.stdout) as { ok: boolean; errors?: string[] };

      expect(result.exitCode).toBe(1);
      expect(output.ok).toBe(false);
      expect(output.errors?.join("\n")).toContain("ran, failed");
    } finally {
      await repo.cleanup();
    }
  });

  it("rejects write-lease path traversal and Windows absolute changed paths", async () => {
    const repo = await createTempRepo();
    try {
      await repo.writeFile("lease.yml", "allowedWrites:\n  - docs/truth/**\nforbiddenWrites:\n  - src/**\n");
      await repo.writeFile("changed-files.txt", "C:/repo/docs/truth/secret.md\n");

      const result = await runCli(
        ["validate", "write-lease", "lease.yml", "changed-files.txt", "--json"],
        { cwd: repo.rootDir },
      );
      const output = JSON.parse(result.stdout) as { ok: boolean; errors?: string[] };

      expect(result.exitCode).toBe(1);
      expect(output.ok).toBe(false);
      expect(output.errors?.join("\n")).toContain("invalid changed file path");
    } finally {
      await repo.cleanup();
    }
  });
});
