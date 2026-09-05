import { defaultAgentConfig } from "../../src/agents/shared.js";
import type { TruthmarkWorkflowId } from "../../src/agents/workflow-manifest.js";
import type { TruthmarkConfig } from "../../src/config/schema.js";
import {
  renderTruthmarkSkillPackage,
  type TruthmarkSkillPackageHost,
} from "../../src/templates/workflow-surfaces.js";

// Skill packages are the only workflow surface init installs, so assert against
// them rather than a parallel renderer no host ever receives.
const packageFiles = (
  workflowId: TruthmarkWorkflowId,
  host: TruthmarkSkillPackageHost,
  config: TruthmarkConfig,
) => {
  return renderTruthmarkSkillPackage({
    skillPath: `.agents/skills/${workflowId}/SKILL.md`,
    workflowId,
    host,
    config,
  });
};

export const installedSkillEntrypoint = (
  workflowId: TruthmarkWorkflowId,
  host: TruthmarkSkillPackageHost = "cursor",
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  return packageFiles(workflowId, host, config)[0].content;
};

export const installedSkillSurface = (
  workflowId: TruthmarkWorkflowId,
  host: TruthmarkSkillPackageHost = "cursor",
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  return packageFiles(workflowId, host, config)
    .map((file) => file.content)
    .join("\n");
};
