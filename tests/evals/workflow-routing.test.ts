import { describe, expect, it } from "vitest";
import { createDefaultConfig } from "../../src/config/defaults.js";
import { renderGeneratedSurfaces } from "../../src/templates/generated-surfaces.js";
import {
  TRUTHMARK_WORKFLOW_IDS,
  TRUTHMARK_WORKFLOW_MANIFEST,
  getTruthmarkWorkflow,
  type TruthmarkWorkflowId,
} from "../../src/agents/workflow-manifest.js";
import { NO_CLI_FALLBACK_EVAL_CASES } from "./no-cli-fallback-cases.js";
import { WORKFLOW_ROUTING_EVAL_CASES } from "./workflow-routing-cases.js";

const WORKFLOW_COMMAND_PATHS: Record<TruthmarkWorkflowId, string> = {
  "truthmark-sync": ".gemini/commands/truthmark/sync.toml",
  "truthmark-structure": ".gemini/commands/truthmark/structure.toml",
  "truthmark-document": ".gemini/commands/truthmark/document.toml",
  "truthmark-preview": ".gemini/commands/truthmark/preview.toml",
  "truthmark-realize": ".gemini/commands/truthmark/realize.toml",
  "truthmark-check": ".gemini/commands/truthmark/check.toml",
  "truthmark-portal": ".gemini/commands/truthmark/portal.toml",
};

const WORKFLOW_SURFACE_PATHS = (id: TruthmarkWorkflowId): readonly string[] => [
  `.agents/skills/${id}/SKILL.md`,
  `.opencode/skills/${id}/SKILL.md`,
  `.claude/skills/${id}/SKILL.md`,
  `.github/prompts/${id}.prompt.md`,
  WORKFLOW_COMMAND_PATHS[id],
];

const CODEX_METADATA_PATHS = (id: TruthmarkWorkflowId): string =>
  `.agents/skills/${id}/agents/openai.yaml`;

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
  WORKFLOW_SKILL_PACKAGE_PATHS(".agents/skills", id),
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
  "truthmark-portal": [
    "manual-only presentation workflow",
    "fixed Portal output directory only",
    "Markdown remains canonical",
    "Truthmark Portal: completed",
    "Output path:",
    "Markdown canonical statement:",
  ],
};

const NO_CLI_FALLBACK_SCENARIOS = [
  "single-file-one-truth-doc",
  "multi-file-one-truth-doc",
  "multi-route-multiple-truth-docs",
  "ambiguous-unmapped-code-blocks",
  "broad-index-truth-doc-triggers-structure",
  "evidence-reference-stale-or-missing",
  "preserve-product-decisions-rationale",
] as const;

const NO_CLI_FALLBACK_EQUIVALENCE_AXES = [
  "same target docs",
  "same block/apply decision",
  "same write boundary",
  "same evidence status",
] as const;

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
  config.truthmark.generated.portal.enabled = true;
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

describe("no-CLI fallback eval corpus", () => {
  it("covers route-first fallback outcomes before any hard budget policy is added", () => {
    const caseIds = NO_CLI_FALLBACK_EVAL_CASES.map((testCase) => testCase.id);

    expect(caseIds).toEqual(expect.arrayContaining([...NO_CLI_FALLBACK_SCENARIOS]));

    for (const testCase of NO_CLI_FALLBACK_EVAL_CASES) {
      expect(testCase.changedSurface.length).toBeGreaterThan(0);
      expect(testCase.equivalenceAxes).toEqual([...NO_CLI_FALLBACK_EQUIVALENCE_AXES]);
      expect(testCase.expectedCliOutcome).toEqual(
        expect.objectContaining({
          decision: expect.stringMatching(/^(apply|block|structure)$/u),
          evidenceStatus: expect.stringMatching(
            /^(current|missing-or-stale|requires-preservation-check)$/u,
          ),
        }),
      );
    }

    expect(NO_CLI_FALLBACK_EVAL_CASES.map((testCase) => testCase.scenario).join("\n")).not.toMatch(
      /token budget|hard budget/iu,
    );
  });
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

  it("keeps write-workflow no-CLI fallback route-first and non-expansive", () => {
    for (const id of [
      "truthmark-sync",
      "truthmark-structure",
      "truthmark-document",
      "truthmark-realize",
    ] as const) {
      const content = surfaces.get(`.agents/skills/${id}/SKILL.md`);

      expect(content, `${id} Codex skill is generated`).toBeDefined();
      expect(content).toContain("If the local Truthmark CLI is unavailable or too old");
      expect(content).toContain("use the checked-in workflow files as the contract");
      expect(content).toContain("Follow the route-first procedure");
      expect(content).toContain(
        "read only the config, route files, truth docs, and source evidence needed for the current changed surface",
      );
      expect(content).toContain(
        "stop on missing or ambiguous ownership instead of broadening reads or writes",
      );
    }
  });

  it("labels non-main progressive-disclosure files as conditional", () => {
    const syncSkill = surfaces.get(".agents/skills/truthmark-sync/SKILL.md");

    expect(syncSkill).toContain(
      "support/procedure.md — read before edits or detailed auditing; contains core quality gates",
    );
    expect(syncSkill).toContain(
      "support/subagents-and-leases.md — read only when using subagents, leases, or accepting worker output",
    );
    expect(syncSkill).toContain(
      "helper-manifest.yml — read only when invoking helper validators or validating helper registration",
    );
    expect(syncSkill).toContain(
      "support/helper-policy.md — read only when invoking helper validators or reporting helper status",
    );
  });
});
