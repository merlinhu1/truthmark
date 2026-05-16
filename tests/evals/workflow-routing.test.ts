import { describe, expect, it } from "vitest";
import { createDefaultConfig } from "../../src/config/defaults.js";
import { renderGeneratedSurfaces } from "../../src/templates/generated-surfaces.js";
import {
  TRUTHMARK_WORKFLOW_IDS,
  TRUTHMARK_WORKFLOW_MANIFEST,
  getTruthmarkWorkflow,
  type TruthmarkWorkflowId,
} from "../../src/agents/workflow-manifest.js";
import { WORKFLOW_ROUTING_EVAL_CASES } from "./workflow-routing-cases.js";

const WORKFLOW_COMMAND_PATHS: Record<TruthmarkWorkflowId, string> = {
  "truthmark-sync": ".gemini/commands/truthmark/sync.toml",
  "truthmark-structure": ".gemini/commands/truthmark/structure.toml",
  "truthmark-document": ".gemini/commands/truthmark/document.toml",
  "truthmark-preview": ".gemini/commands/truthmark/preview.toml",
  "truthmark-realize": ".gemini/commands/truthmark/realize.toml",
  "truthmark-check": ".gemini/commands/truthmark/check.toml",
};

const WORKFLOW_SURFACE_PATHS = (id: TruthmarkWorkflowId): readonly string[] => [
  `.codex/skills/${id}/SKILL.md`,
  `.opencode/skills/${id}/SKILL.md`,
  `.claude/skills/${id}/SKILL.md`,
  `.github/prompts/${id}.prompt.md`,
  WORKFLOW_COMMAND_PATHS[id],
];

const CODEX_METADATA_PATHS = (id: TruthmarkWorkflowId): string =>
  `.codex/skills/${id}/agents/openai.yaml`;

const WORKFLOW_SKILL_PACKAGE_PATHS = (
  hostSkillRoot: string,
  id: TruthmarkWorkflowId,
): readonly string[] => {
  const workflow = TRUTHMARK_WORKFLOW_MANIFEST[id];
  const hasSubagentSupport =
    ("subagents" in workflow ? workflow.subagents.length : 0) > 0 ||
    ("writeSubagents" in workflow ? workflow.writeSubagents.length : 0) > 0;

  return [
    `${hostSkillRoot}/${id}/SKILL.md`,
    `${hostSkillRoot}/${id}/support/procedure.md`,
    `${hostSkillRoot}/${id}/support/report-template.md`,
    ...(hasSubagentSupport
      ? [`${hostSkillRoot}/${id}/support/subagents-and-leases.md`]
      : []),
  ];
};

const WORKFLOW_CONTRACT_PATH_GROUPS = (
  id: TruthmarkWorkflowId,
): readonly (readonly string[])[] => [
  WORKFLOW_SKILL_PACKAGE_PATHS(".codex/skills", id),
  WORKFLOW_SKILL_PACKAGE_PATHS(".opencode/skills", id),
  WORKFLOW_SKILL_PACKAGE_PATHS(".claude/skills", id),
  [`.github/prompts/${id}.prompt.md`],
  [WORKFLOW_COMMAND_PATHS[id]],
];

const SURFACE_CONTRACT_TERMS: Record<TruthmarkWorkflowId, readonly string[]> = {
  "truthmark-sync": [
    "Skip when changes are documentation-only",
    "block and recommend Truth Structure",
    "verify only truth docs and leased truth routing files changed",
    "Report completion in this shape:",
    "Changed code reviewed:",
    "Evidence checked:",
  ],
  "truthmark-structure": [
    "New area setup",
    "report the initial truth boundary",
    "create or repair",
    "starter truth docs",
    "Do not require the truthmark CLI",
    "Report completion in this shape:",
    "Topology reviewed:",
    "Initial truth boundary:",
    "Evidence checked:",
  ],
  "truthmark-document": [
    "document existing implemented behavior",
    "may write canonical truth docs",
    "must not write functional code",
    "Report completion in this shape:",
    "Implementation reviewed:",
    "Evidence checked:",
  ],
  "truthmark-preview": [
    "preview Truthmark routing",
    "Truth Preview is read-only",
    "Report completion in this shape:",
    "Truth Preview: completed",
    "Handoff:",
  ],
  "truthmark-realize": [
    "Use this skill only when the user explicitly asks",
    "may write functional code only",
    "must not edit truth docs or truth routing",
    "Report completion in this shape:",
    "Truth docs used:",
    "Verification:",
  ],
  "truthmark-check": [
    "audit repository truth health",
    "report issues and suggested fixes without silently rewriting unrelated files",
    "Report completion in this shape:",
    "Files reviewed:",
    "Validation:",
  ],
};

const manifestRoutingText = (id: TruthmarkWorkflowId): string => {
  const workflow = getTruthmarkWorkflow(id);

  return [
    workflow.description,
    workflow.defaultPrompt,
    ...workflow.positiveTriggers,
    ...workflow.negativeTriggers,
    ...workflow.forbiddenAdjacency,
  ].join("\n");
};

const candidateManifestText = (
  expectedWorkflow: TruthmarkWorkflowId | "none" | "block",
  forbiddenWorkflows: readonly TruthmarkWorkflowId[] = [],
): string => {
  const workflowIds =
    expectedWorkflow === "none" || expectedWorkflow === "block"
      ? forbiddenWorkflows
      : [expectedWorkflow, ...forbiddenWorkflows];

  return workflowIds.map((id) => manifestRoutingText(id)).join("\n");
};

const buildGeneratedSurfaceMap = (): Map<string, string> => {
  const config = createDefaultConfig();
  return new Map(
    renderGeneratedSurfaces(config).map((surface) => [
      surface.path,
      surface.content,
    ]),
  );
};

describe("workflow routing eval corpus", () => {
  it("covers positive, negative, adjacent, none, and blocked routing outcomes", () => {
    expect(WORKFLOW_ROUTING_EVAL_CASES).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: "manifest-positive" }),
        expect.objectContaining({ source: "manifest-negative" }),
        expect.objectContaining({ source: "forbidden-adjacent" }),
        expect.objectContaining({ expectedWorkflow: "none" }),
        expect.objectContaining({ expectedWorkflow: "block" }),
      ]),
    );

    for (const id of TRUTHMARK_WORKFLOW_IDS) {
      expect(WORKFLOW_ROUTING_EVAL_CASES).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ expectedWorkflow: id }),
        ]),
      );
    }
  });

  it.each(WORKFLOW_ROUTING_EVAL_CASES)(
    "anchors $id to manifest routing signals",
    (testCase) => {
      const routingText = candidateManifestText(
        testCase.expectedWorkflow,
        testCase.forbiddenWorkflows,
      );

      for (const signal of testCase.expectedManifestSignals) {
        expect(routingText).toContain(signal);
      }
    },
  );
});

describe("generated workflow surface conformance", () => {
  const surfaces = buildGeneratedSurfaceMap();

  it("renders every workflow routing surface from the manifest description", () => {
    for (const id of TRUTHMARK_WORKFLOW_IDS) {
      const workflow = TRUTHMARK_WORKFLOW_MANIFEST[id];

      for (const path of WORKFLOW_SURFACE_PATHS(id)) {
        const content = surfaces.get(path);

        expect(content, `${path} is generated`).toBeDefined();
        expect(content).toContain(workflow.description);
        expect(content).toContain(workflow.description.split("Not for ")[1]);
      }
    }
  });

  it("keeps Codex metadata aligned with manifest selection policy", () => {
    for (const id of TRUTHMARK_WORKFLOW_IDS) {
      const workflow = TRUTHMARK_WORKFLOW_MANIFEST[id];
      const path = CODEX_METADATA_PATHS(id);
      const content = surfaces.get(path);

      expect(content, `${path} is generated`).toBeDefined();
      expect(content).toContain(`display_name: "${workflow.displayName}"`);
      expect(content).toContain(
        `short_description: "${workflow.shortDescription}"`,
      );
      expect(content).toContain(`default_prompt: "${workflow.defaultPrompt}"`);
      expect(content).toContain(
        `allow_implicit_invocation: ${workflow.allowImplicitInvocation}`,
      );
    }
  });

  it("keeps generated skill, prompt, and command bodies on the same write and report contract", () => {
    for (const id of TRUTHMARK_WORKFLOW_IDS) {
      for (const paths of WORKFLOW_CONTRACT_PATH_GROUPS(id)) {
        const content = paths
          .map((path) => {
            const surface = surfaces.get(path);

            expect(surface, `${path} is generated`).toBeDefined();
            return surface;
          })
          .join("\n");

        for (const term of SURFACE_CONTRACT_TERMS[id]) {
          expect(content).toContain(term);
        }
      }
    }
  });
});
