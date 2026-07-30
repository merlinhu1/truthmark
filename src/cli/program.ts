import { Command } from "commander";

import type { CommandResult } from "../output/diagnostic.js";
import { renderHuman, renderJson } from "../output/render.js";
import {
  runCheck,
  runImpact,
  runIndex,
  runInit,
  runUninstall,
  runValidateDocumentReport,
  runValidateSyncReport,
  runValidateWriteLease,
  runWorkflowStatus,
} from "./handlers.js";
import type { WorkflowHelperValidationResult } from "../agents/workflow-helper-validation.js";

type OutputOptions = {
  json?: boolean;
};

type InitCliOptions = OutputOptions & {
  platform?: string[];
};

type CheckCliOptions = OutputOptions & {
  base?: string;
};

type ImpactOptions = OutputOptions & {
  base?: string;
};

type WorkflowOptions = OutputOptions & {
  workflow?: string;
  base?: string;
};

type UninstallOptions = OutputOptions & { dryRun?: boolean; apply?: boolean };

const markFailedWhenErrorDiagnosticsExist = (result: CommandResult): void => {
  if (
    result.diagnostics.some((diagnostic) => diagnostic.severity === "error")
  ) {
    process.exitCode = 1;
  }
};

const writeResult = (result: CommandResult, options: OutputOptions): void => {
  const output = options.json ? renderJson(result) : renderHuman(result);
  process.stdout.write(`${output}\n`);
  markFailedWhenErrorDiagnosticsExist(result);
};

const renderValidationHuman = (
  result: WorkflowHelperValidationResult,
): string => {
  if (result.ok === true) {
    return [
      `${result.helper}: ok`,
      ...result.checks.map((check) => `- ${check}`),
    ].join("\n");
  }

  return [
    `${result.helper}: failed`,
    ...result.errors.map((error) => `- ${error}`),
  ].join("\n");
};

const toValidationCommandResult = (
  command: string,
  result: WorkflowHelperValidationResult,
): CommandResult => ({
  command,
  summary: result.ok ? "Validation passed" : "Validation failed",
  diagnostics: [],
  data: {
    validation: result,
  },
});

const writeValidationResult = (
  command: string,
  result: WorkflowHelperValidationResult,
  options: OutputOptions,
): void => {
  const output = options.json
    ? renderJson(toValidationCommandResult(command, result))
    : renderValidationHuman(result);
  process.stdout.write(`${output}\n`);

  if (!result.ok) {
    process.exitCode = 1;
  }
};

const addJsonOption = (command: Command): Command => {
  return command.option("--json", "Render command output as JSON");
};

const collectPlatform = (value: string, previous: string[]): string[] => [
  ...previous,
  value,
];

export const buildProgram = (): Command => {
  const program = new Command();

  program
    .name("truthmark")
    .description(
      "Git-native, branch-scoped truth workflow installer for local AI coding agents.",
    )
    .showHelpAfterError();

  addJsonOption(
    program
      .command("init")
      .description(
        "Initialize Truthmark workflow files in the current repository.",
      )
      .option(
        "--platform <id>",
        "Select a repository agent platform; repeat for multiple platforms",
        collectPlatform,
        [],
      ),
  ).action(async (options: InitCliOptions) => {
    const platforms = options.platform?.length ? options.platform : undefined;
    writeResult(
      await runInit({ json: options.json, platforms }),
      options,
    );
  });

  addJsonOption(
    program
      .command("uninstall")
      .description(
        "Remove recognized generated host surfaces while preserving truth, config, Portal output, Gemini, and user files.",
      )
      .option("--dry-run", "Plan removals without changing files")
      .option("--apply", "Apply the planned safe removals"),
  ).action(async (options: UninstallOptions) => {
    if (Boolean(options.dryRun) === Boolean(options.apply)) {
      program.error(
        "truthmark uninstall requires exactly one of --dry-run or --apply",
      );
      return;
    }
    writeResult(
      await runUninstall(options.apply ? "apply" : "dry-run"),
      options,
    );
  });

  addJsonOption(
    program
      .command("check")
      .description("Run local Truthmark diagnostics.")
      .option("--base <ref>", "Base Git ref for freshness diagnostics"),
  ).action(async (options: CheckCliOptions) => {
    writeResult(await runCheck({ base: options.base }), options);
  });

  addJsonOption(
    program
      .command("index")
      .description(
        "Inspect derived Truthmark workflow routing metadata for the current checkout.",
      ),
  ).action(async (options: OutputOptions) => {
    writeResult(await runIndex(), options);
  });

  addJsonOption(
    program
      .command("impact")
      .description(
        "Map changed files to truth routes, docs, owners, and tests.",
      )
      .requiredOption("--base <ref>", "Base Git ref to compare against"),
  ).action(async (options: ImpactOptions) => {
    writeResult(await runImpact({ base: options.base }), options);
  });

  const workflow = program
    .command("workflow")
    .description("Inspect agent-facing Truthmark workflow state.");

  addJsonOption(
    workflow
      .command("status")
      .description(
        "Return schema-versioned workflow state for a canonical workflow ID.",
      )
      .option(
        "--workflow <workflow>",
        "Canonical workflow ID, such as truthmark-sync",
      )
      .option("--base <ref>", "Base Git ref for impact-backed workflow state"),
  ).action(async (options: WorkflowOptions) => {
    writeResult(
      await runWorkflowStatus({
        workflow: options.workflow,
        base: options.base,
      }),
      options,
    );
  });

  const validate = program
    .command("validate")
    .description(
      "Run optional Truthmark workflow helper validators from the installed CLI.",
    );

  addJsonOption(
    validate
      .command("sync-report")
      .description("Validate a Truth Sync report file.")
      .argument("<report-file>", "Truth Sync report file"),
  ).action(async (reportFile: string, options: OutputOptions) => {
    writeValidationResult(
      "validate sync-report",
      await runValidateSyncReport(reportFile),
      options,
    );
  });

  addJsonOption(
    validate
      .command("document-report")
      .description("Validate a Truth Document report file.")
      .argument("<report-file>", "Truth Document report file"),
  ).action(async (reportFile: string, options: OutputOptions) => {
    writeValidationResult(
      "validate document-report",
      await runValidateDocumentReport(reportFile),
      options,
    );
  });

  addJsonOption(
    validate
      .command("write-lease")
      .description(
        "Validate a workflow write lease or worker report against changed files.",
      )
      .argument("<lease-or-report-file>", "Lease or worker report file")
      .argument("<changed-files-file>", "Newline-separated changed file list"),
  ).action(
    async (
      leaseOrReportFile: string,
      changedFilesFile: string,
      options: OutputOptions,
    ) => {
      writeValidationResult(
        "validate write-lease",
        await runValidateWriteLease(leaseOrReportFile, changedFilesFile),
        options,
      );
    },
  );

  return program;
};
