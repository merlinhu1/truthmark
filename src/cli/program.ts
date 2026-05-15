import { Command } from "commander";

import type { CommandResult } from "../output/diagnostic.js";
import { renderHuman, renderJson } from "../output/render.js";
import { runCheck, runConfig, runContext, runImpact, runIndex, runInit } from "./handlers.js";

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

const writeResult = (result: CommandResult, options: OutputOptions): void => {
  const output = options.json ? renderJson(result) : renderHuman(result);
  process.stdout.write(`${output}\n`);
};
const writeContextResult = (result: CommandResult, options: ContextOptions): void => {
  if (!options.json && options.format === "markdown" && typeof result.data?.markdown === "string") {
    process.stdout.write(result.data.markdown);
    return;
  }
  writeResult(result, options);
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

  return program;
};
