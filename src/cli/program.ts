import { Command } from "commander";

import type { CommandResult } from "../output/diagnostic.js";
import { renderHuman, renderJson } from "../output/render.js";
import {
  runCheck,
  runConfig,
  runContext,
  runImpact,
  runIndex,
  runInit,
  runValidateDocumentReport,
  runValidateSyncReport,
  runValidateWriteLease,
  runWorkflowInstructions,
  runWorkflowStatus,
} from "./handlers.js";
import type { WorkflowHelperValidationResult } from "../agents/workflow-helper-validation.js";

type OutputOptions = {
  json?: boolean;
};

type ConfigOptions = OutputOptions & {
  stdout?: boolean;
  force?: boolean;
};

type CheckCliOptions = OutputOptions & {
  base?: string;
};

type ImpactOptions = OutputOptions & {
  base?: string;
};

type ContextOptions = OutputOptions & {
  workflow?: string;
  base?: string;
  format?: string;
};

type WorkflowOptions = OutputOptions & {
  workflow?: string;
  base?: string;
};

const markFailedWhenErrorDiagnosticsExist = (result: CommandResult): void => {
  if (result.diagnostics.some((diagnostic) => diagnostic.severity === "error")) {
    process.exitCode = 1;
  }
};

const writeResult = (result: CommandResult, options: OutputOptions): void => {
  const output = options.json ? renderJson(result) : renderHuman(result);
  process.stdout.write(`${output}\n`);
  markFailedWhenErrorDiagnosticsExist(result);
};
const writeContextResult = (result: CommandResult, options: ContextOptions): void => {
  if (!options.json && options.format === "markdown" && typeof result.data?.markdown === "string") {
    process.stdout.write(result.data.markdown);
    markFailedWhenErrorDiagnosticsExist(result);
    return;
  }
  writeResult(result, options);
};

const renderValidationHuman = (result: WorkflowHelperValidationResult): string => {
  if (result.ok === true) {
    return [`${result.helper}: ok`, ...result.checks.map((check) => `- ${check}`)].join("\n");
  }

  return [`${result.helper}: failed`, ...result.errors.map((error) => `- ${error}`)].join("\n");
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

export const buildProgram = (): Command => {
  const program = new Command();

  program
    .name("truthmark")
    .description("Git-native, branch-scoped truth workflow installer for local AI coding agents.")
    .showHelpAfterError();

  addJsonOption(
    program
      .command("config")
      .description("Create or render the Truthmark repository config before initialization.")
      .option("--stdout", "Render default config in the JSON data payload without writing")
      .option("--force", "Overwrite an existing .truthmark/config.yml"),
  ).action(async (options: ConfigOptions) => {
    writeResult(await runConfig(options), options);
  });

  addJsonOption(
    program
      .command("init")
      .description("Initialize Truthmark workflow files in the current repository."),
  ).action(async (options: OutputOptions) => {
    writeResult(await runInit(), options);
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
    program.command("index").description("Build the deterministic Truthmark repository index."),
  ).action(async (options: OutputOptions) => {
    writeResult(await runIndex(), options);
  });

  addJsonOption(
    program
      .command("impact")
      .description("Map changed files to truth routes, docs, owners, and tests.")
      .requiredOption("--base <ref>", "Base Git ref to compare against"),
  ).action(async (options: ImpactOptions) => {
    writeResult(await runImpact({ base: options.base }), options);
  });

  addJsonOption(
    program
      .command("context")
      .description("Generate a bounded workflow context pack.")
      .requiredOption("--workflow <workflow>", "Workflow name: truth-sync, truth-document, or truth-realize")
      .option("--base <ref>", "Base Git ref for impact-backed packs")
      .option("--format <format>", "Output format: json or markdown", "json"),
  ).action(async (options: ContextOptions) => {
    writeContextResult(
      await runContext({
        workflow: options.workflow,
        base: options.base,
        format: options.format,
      }),
      options,
    );
  });

  const workflow = program
    .command("workflow")
    .description("Inspect agent-facing Truthmark workflow state and instructions.");

  addJsonOption(
    workflow
      .command("status")
      .description("Return schema-versioned workflow state for a canonical workflow ID.")
      .option("--workflow <workflow>", "Canonical workflow ID, such as truthmark-sync")
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

  addJsonOption(
    workflow
      .command("instructions")
      .description("Return agent instructions derived from workflow state.")
      .option("--workflow <workflow>", "Canonical workflow ID, such as truthmark-sync")
      .option("--base <ref>", "Base Git ref for impact-backed workflow state"),
  ).action(async (options: WorkflowOptions) => {
    writeResult(
      await runWorkflowInstructions({
        workflow: options.workflow,
        base: options.base,
      }),
      options,
    );
  });

  const validate = program
    .command("validate")
    .description("Run optional Truthmark workflow helper validators from the installed CLI.");

  addJsonOption(
    validate
      .command("sync-report")
      .description("Validate a Truth Sync report file.")
      .argument("<report-file>", "Truth Sync report file"),
  ).action(async (reportFile: string, options: OutputOptions) => {
    writeValidationResult("validate sync-report", await runValidateSyncReport(reportFile), options);
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
      .description("Validate a workflow write lease or worker report against changed files.")
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
