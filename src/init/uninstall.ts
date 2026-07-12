import { loadConfig } from "../config/load.js";
import { getGitRepository } from "../git/repository.js";
import type { CommandResult } from "../output/diagnostic.js";
import { applyLifecyclePlan, buildLifecyclePlan } from "./lifecycle.js";

export const runUninstall = async (
  cwd: string,
  mode: "dry-run" | "apply",
): Promise<CommandResult> => {
  const repository = await getGitRepository(cwd);
  const loaded = await loadConfig(repository.worktreePath);
  if (!loaded.config) {
    const lifecyclePlan = {
      schemaVersion: "truthmark-lifecycle/v0" as const,
      mode,
      entries: [],
      diagnostics: loaded.diagnostics,
      applicable: false,
      applied: false,
    };
    return {
      command: "uninstall",
      summary:
        "Truthmark uninstall requires a valid .truthmark/config.yml; no files were changed.",
      diagnostics: loaded.diagnostics,
      data: { lifecyclePlan },
    };
  }
  const planned = await buildLifecyclePlan(
    repository.worktreePath,
    loaded.config,
    mode,
    [],
  );
  const plan = await applyLifecyclePlan(repository.worktreePath, planned);
  return {
    command: "uninstall",
    summary:
      mode === "dry-run"
        ? "Truthmark uninstall dry run completed; no files were changed."
        : plan.applied
          ? "Truthmark generated host surfaces were uninstalled; authored truth and config were preserved."
          : "Truthmark uninstall was not applied.",
    diagnostics: [...loaded.diagnostics, ...plan.diagnostics],
    data: { lifecyclePlan: plan },
  };
};
