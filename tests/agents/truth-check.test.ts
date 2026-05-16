import { describe, expect, it } from "vitest";

import {
  TRUTH_CHECK_EXPLICIT_INVOCATIONS,
  renderTruthCheckSkillBody,
} from "../../src/agents/truth-check.js";
import { createDefaultConfig } from "../../src/config/defaults.js";
import {
  renderTruthmarkClaimVerifierAgent,
  renderTruthmarkCheckLocalSkill,
  renderTruthmarkCheckClaudeSkill,
  renderTruthmarkCheckSkill,
  renderTruthmarkCheckSkillMetadata,
  renderTruthmarkClaudeClaimVerifierAgent,
  renderTruthmarkClaudeDocReviewerAgent,
  renderTruthmarkClaudeDocWriterAgent,
  renderTruthmarkClaudeRouteAuditorAgent,
  renderTruthmarkCopilotClaimVerifierAgent,
  renderTruthmarkCopilotDocReviewerAgent,
  renderTruthmarkDocReviewerAgent,
  renderTruthmarkDocWriterAgent,
  renderTruthmarkOpenCodeClaimVerifierAgent,
  renderTruthmarkOpenCodeDocReviewerAgent,
  renderTruthmarkOpenCodeDocWriterAgent,
  renderTruthmarkOpenCodeRouteAuditorAgent,
  renderTruthmarkCopilotDocWriterAgent,
  renderTruthmarkCopilotRouteAuditorAgent,
  renderTruthmarkRouteAuditorAgent,
} from "../../src/templates/workflow-surfaces.js";
import { TRUTHMARK_VERSION } from "../../src/version.js";

describe("renderTruthCheckSkillBody", () => {
  it("renders the agent-led truth audit workflow", () => {
    const skill = renderTruthCheckSkillBody();

    expect(TRUTH_CHECK_EXPLICIT_INVOCATIONS).toContain("/truthmark:check");
    expect(skill).toContain("name: truthmark-check");
    expect(skill).toContain(`truthmark-version: ${TRUTHMARK_VERSION}`);
    expect(skill).toContain(
      "description: Use when the user asks to audit repository truth health, routing, ownership, or canonical docs.",
    );
    expect(skill).toContain(
      "Not for normal lint/test/typecheck/code-review verification, finish-time Sync, or silently rewriting docs.",
    );
    expect(skill).toContain("audit repository truth health");
    expect(skill).toContain(
      "Repository instruction docs such as docs/ai/repo-rules.md remain instruction authority.",
    );
    expect(skill).toContain(
      "Implementation code and canonical truth docs are inspected evidence for current behavior; they do not silently override workflow write boundaries.",
    );
    expect(skill).not.toContain(
      "Repository docs and code are inspected evidence, not executable instruction authority.",
    );
    expect(skill).toContain("optionally run truthmark check");
    expect(skill).toContain("must not require the truthmark binary");
    expect(skill).toContain(
      "support each finding and suggested fix with evidence from config, route files, canonical docs, implementation, templates, or tests",
    );
    expect(skill).toContain(
      "remove unsupported findings or mark open questions",
    );
    expect(skill).toContain("Truthmark hierarchy:");
    expect(skill).toContain("Product Decisions");
    expect(skill).toContain("Rationale");
    expect(skill).toContain("Truth Check: completed");
    expect(skill).toContain("Files reviewed");
    expect(skill).toContain("Issues found");
    expect(skill).toContain("Fixes suggested");
    expect(skill).toContain("Evidence checked");
    expect(skill).toContain("Confidence");
    expect(skill).toContain("Validation");
  });
});

describe("Truth Check generated surfaces", () => {
  const readOnlyContextBoundary =
    "Do not preload AGENTS.md, CLAUDE.md, GEMINI.md, .github/copilot-instructions.md, or repo-wide policy docs unless the parent explicitly assigns them as evidence.";

  it("renders Codex metadata and OpenCode skill content", () => {
    expect(renderTruthmarkCheckSkill()).toContain("name: truthmark-check");
    expect(renderTruthmarkCheckSkill()).toContain("Codex subagent mode:");
    expect(renderTruthmarkCheckSkill()).toContain(
      "use automatically when this workflow runs in Codex",
    );
    expect(renderTruthmarkCheckSkill()).toContain("truth_route_auditor");
    expect(renderTruthmarkCheckSkill()).toContain("truth_claim_verifier");
    expect(renderTruthmarkCheckSkill()).toContain("truth_doc_reviewer");
    expect(renderTruthmarkCheckSkill()).toContain(
      "Parent agent owns the final Truth Check report",
    );
    expect(renderTruthmarkCheckLocalSkill()).toContain(
      "/skill truthmark-check",
    );
    expect(renderTruthmarkCheckLocalSkill()).not.toContain("Codex subagent mode:");
    expect(renderTruthmarkCheckClaudeSkill()).toContain(
      "Claude Code subagent mode:",
    );
    expect(renderTruthmarkCheckClaudeSkill()).toContain(
      "truth-route-auditor subagent",
    );
    expect(renderTruthmarkCheckClaudeSkill()).toContain(
      "truth-claim-verifier subagent",
    );
    expect(renderTruthmarkCheckClaudeSkill()).toContain(
      "truth-doc-reviewer subagent",
    );
    expect(renderTruthmarkCheckLocalSkill()).toContain("/truthmark:check");
    expect(renderTruthmarkCheckSkillMetadata()).toContain(
      'display_name: "Truthmark Check"',
    );
    expect(renderTruthmarkCheckSkillMetadata()).toContain(
      "allow_implicit_invocation: false",
    );
    expect(renderTruthmarkCheckSkillMetadata()).toContain(
      `version: "${TRUTHMARK_VERSION}"`,
    );
  });

  it("renders read-only Codex verifier agents for truth audits", () => {
    const routeAuditor = renderTruthmarkRouteAuditorAgent();
    const claimVerifier = renderTruthmarkClaimVerifierAgent();
    const docReviewer = renderTruthmarkDocReviewerAgent();

    expect(routeAuditor).toContain('name = "truth_route_auditor"');
    expect(routeAuditor).toContain('sandbox_mode = "read-only"');
    expect(routeAuditor).toContain(readOnlyContextBoundary);
    expect(routeAuditor).toContain("Return JSON only");
    expect(routeAuditor).toContain("recommendedWorkflow");
    expect(routeAuditor).not.toContain("write truth docs");

    expect(claimVerifier).toContain('name = "truth_claim_verifier"');
    expect(claimVerifier).toContain('sandbox_mode = "read-only"');
    expect(claimVerifier).toContain(readOnlyContextBoundary);
    expect(claimVerifier).toContain("supported | narrowed | removed | blocked");
    expect(claimVerifier).toContain("Do not edit files");

    expect(docReviewer).toContain('name = "truth_doc_reviewer"');
    expect(docReviewer).toContain('sandbox_mode = "read-only"');
    expect(docReviewer).toContain(readOnlyContextBoundary);
    expect(docReviewer).toContain("Product Decisions");
    expect(docReviewer).toContain("Rationale");
  });
  it("renders read-only Claude Code verifier subagents for truth audits", () => {
    const routeAuditor = renderTruthmarkClaudeRouteAuditorAgent();
    const claimVerifier = renderTruthmarkClaudeClaimVerifierAgent();
    const docReviewer = renderTruthmarkClaudeDocReviewerAgent();
    expect(routeAuditor).toContain("name: truth-route-auditor");
    expect(routeAuditor).toContain("tools: Read, Grep, Glob, LS");
    expect(routeAuditor).toContain("Manual invocation: use the truth-route-auditor subagent");
    expect(routeAuditor).toContain(readOnlyContextBoundary);
    expect(routeAuditor).toContain("Do not edit files");
    expect(routeAuditor).toContain("Return JSON only");
    expect(claimVerifier).toContain("name: truth-claim-verifier");
    expect(claimVerifier).toContain("tools: Read, Grep, Glob, LS");
    expect(claimVerifier).toContain(readOnlyContextBoundary);
    expect(claimVerifier).toContain("supported | narrowed | removed | blocked");
    expect(claimVerifier).toContain("Do not edit files");
    expect(docReviewer).toContain("name: truth-doc-reviewer");
    expect(docReviewer).toContain("tools: Read, Grep, Glob, LS");
    expect(docReviewer).toContain(readOnlyContextBoundary);
    expect(docReviewer).toContain("Product Decisions");
    expect(docReviewer).toContain("Rationale");
  });
  it("renders read-only OpenCode verifier subagents for truth audits", () => {
    const routeAuditor = renderTruthmarkOpenCodeRouteAuditorAgent();
    const claimVerifier = renderTruthmarkOpenCodeClaimVerifierAgent();
    const docReviewer = renderTruthmarkOpenCodeDocReviewerAgent();
    expect(routeAuditor).toContain("mode: subagent");
    expect(routeAuditor).toContain("edit: deny");
    expect(routeAuditor).toContain("task: deny");
    expect(routeAuditor).toContain("@truth-route-auditor");
    expect(routeAuditor).toContain(readOnlyContextBoundary);
    expect(routeAuditor).toContain("Return JSON only");
    expect(routeAuditor).toContain("recommendedWorkflow");
    expect(claimVerifier).toContain("mode: subagent");
    expect(claimVerifier).toContain("edit: deny");
    expect(claimVerifier).toContain(readOnlyContextBoundary);
    expect(claimVerifier).toContain("supported | narrowed | removed | blocked");
    expect(claimVerifier).toContain("Do not edit files");
    expect(docReviewer).toContain("mode: subagent");
    expect(docReviewer).toContain("edit: deny");
    expect(docReviewer).toContain(readOnlyContextBoundary);
    expect(docReviewer).toContain("Product Decisions");
    expect(docReviewer).toContain("Rationale");
  });

  it("renders read-only Copilot verifier agents with bounded context", () => {
    const routeAuditor = renderTruthmarkCopilotRouteAuditorAgent();
    const claimVerifier = renderTruthmarkCopilotClaimVerifierAgent();
    const docReviewer = renderTruthmarkCopilotDocReviewerAgent();

    expect(routeAuditor).toContain("name: truth-route-auditor");
    expect(routeAuditor).toContain("tools: [read, search]");
    expect(routeAuditor).toContain(readOnlyContextBoundary);
    expect(routeAuditor).toContain("Return JSON only");
    expect(claimVerifier).toContain("name: truth-claim-verifier");
    expect(claimVerifier).toContain(readOnlyContextBoundary);
    expect(claimVerifier).toContain("supported | narrowed | removed | blocked");
    expect(docReviewer).toContain("name: truth-doc-reviewer");
    expect(docReviewer).toContain(readOnlyContextBoundary);
    expect(docReviewer).toContain("Rationale");
  });

  it("renders write-capable doc writer agents behind explicit leases", () => {
    const codexWriter = renderTruthmarkDocWriterAgent();
    const openCodeWriter = renderTruthmarkOpenCodeDocWriterAgent();
    const claudeWriter = renderTruthmarkClaudeDocWriterAgent();
    const copilotWriter = renderTruthmarkCopilotDocWriterAgent();
    const defaultConfig = createDefaultConfig();
    const customOpenCodeWriter = renderTruthmarkOpenCodeDocWriterAgent({
      ...defaultConfig,
      docs: {
        ...defaultConfig.docs,
        roots: {
          ...defaultConfig.docs.roots,
          truth: "product/truth",
        },
        routing: {
          ...defaultConfig.docs.routing,
          rootIndex: "product/routes/index.md",
          areaFilesRoot: "product/routes/areas",
        },
      },
    });

    expect(codexWriter).toContain('name = "truth_doc_writer"');
    expect(codexWriter).toContain('sandbox_mode = "workspace-write"');
    expect(codexWriter).toContain("Require an explicit write lease");
    expect(codexWriter).not.toContain(readOnlyContextBoundary);
    expect(codexWriter).toContain("Return YAML only");
    expect(openCodeWriter).toContain("mode: subagent");
    expect(openCodeWriter).toContain('"docs/truth/**": allow');
    expect(openCodeWriter).toContain('"docs/truthmark/areas.md": allow');
    expect(openCodeWriter).toContain("@truth-doc-writer");
    expect(customOpenCodeWriter).toContain('"product/truth/**": allow');
    expect(customOpenCodeWriter).toContain(
      '"product/routes/index.md": allow',
    );
    expect(customOpenCodeWriter).toContain(
      '"product/routes/areas/**/*.md": allow',
    );
    expect(customOpenCodeWriter).not.toContain('"docs/truth/**": allow');
    expect(claudeWriter).toContain("name: truth-doc-writer");
    expect(claudeWriter).toContain("tools: Read, Grep, Glob, LS, Edit, MultiEdit");
    expect(copilotWriter).toContain("name: truth-doc-writer");
    expect(copilotWriter).toContain("tools: [read, search, edit]");
    expect(copilotWriter).toContain("offLeaseChanges");
  });
});
