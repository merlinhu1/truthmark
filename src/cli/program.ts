import { Command } from "commander";

import type { CommandResult } from "../output/diagnostic.js";
import { renderHuman, renderJson } from "../output/render.js";
import { runCheck, runConfig, runInit } from "./handlers.js";

type OutputOptions = {
  json?: boolean;
};

type ConfigOptions = OutputOptions & {
  stdout?: boolean;
  force?: boolean;
};

const writeResult = (result: CommandResult, options: OutputOptions): void => {
  const output = options.json ? renderJson(result) : renderHuman(result);
  process.stdout.write(`${output}\n`);
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
    program.command("check").description("Run local Truthmark diagnostics."),
  ).action(async (options: OutputOptions) => {
    writeResult(await runCheck(), options);
  });

  return program;
};
