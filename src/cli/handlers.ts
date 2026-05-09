import { runConfig as runRepositoryConfig, type ConfigCommandOptions } from "../config/command.js";
import { runInit as runRepositoryInit } from "../init/init.js";
import { runCheck as runRepositoryCheck } from "../checks/check.js";
import type { CommandResult } from "../output/diagnostic.js";

export const runConfig = async (options: ConfigCommandOptions): Promise<CommandResult> => {
  return runRepositoryConfig(process.cwd(), options);
};

export const runInit = async (): Promise<CommandResult> => {
  return runRepositoryInit(process.cwd());
};

export const runCheck = async (): Promise<CommandResult> => {
  return runRepositoryCheck(process.cwd());
};
