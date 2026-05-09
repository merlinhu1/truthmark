import { describe, expect, it } from "vitest";

import {
  renderTruthCheckInstructions,
  renderTruthStructureInstructions,
  renderTruthSyncInstructions,
} from "../../src/agents/instructions.js";

describe("renderTruthSyncInstructions", () => {
  it("renders a compact Truth Sync reminder for managed instruction files", () => {
    const instructions = renderTruthSyncInstructions();

    expect(instructions).toContain("### Truth Sync");
    expect(instructions).toContain("Automatic finish-time trigger");
    expect(instructions).toContain("use the truthmark-sync skill before finishing");
    expect(instructions).toContain(
      "OpenCode /skill truthmark-sync; Codex /truthmark-sync or $truthmark-sync; Gemini CLI /truthmark:sync",
    );
    expect(instructions).toContain("staged, unstaged, and untracked functional code files");
    expect(instructions).toContain("Run relevant tests before finishing");
    expect(instructions).toContain("documentation-only change");
    expect(instructions).toContain("Explicit invocation runs immediately");
    expect(instructions).toContain("Later functional-code changes reopen the finish-time requirement");
    expect(instructions).toContain("must not rewrite functional code");
    expect(instructions).toContain("host supports subagent dispatch");
    expect(instructions).toContain("If routing is broad, overloaded, or catch-all");
    expect(instructions).toContain("run or recommend Truth Structure before syncing");
    expect(instructions).not.toContain(".truthmark/local.yml");
    expect(instructions).not.toContain("truth_sync.sync_agent");
    expect(instructions).not.toContain("Truth Sync: completed");
    expect(instructions).not.toContain("Truth Sync: skipped");
    expect(instructions).not.toContain("truthmark packet --changed");
    expect(instructions).not.toContain("truthmark check --json --workflow truth-sync");
  });

  it("keeps the managed Truth Sync reminder small", () => {
    const instructions = renderTruthSyncInstructions();
    const lines = instructions.split("\n");

    expect(lines.slice(0, 4).join("\n")).toContain("Truth Sync");
    expect(lines.length).toBeLessThanOrEqual(18);
  });
});

describe("agent-native workflow instructions", () => {
  it("renders Truth Structure and Truth Check summaries", () => {
    expect(renderTruthStructureInstructions()).toContain("truthmark-structure");
    expect(renderTruthStructureInstructions()).toContain("docs/truthmark/areas.md");
    expect(renderTruthStructureInstructions()).toContain("canonical current-truth destinations");
    expect(renderTruthStructureInstructions()).toContain("topology pressure");
    expect(renderTruthStructureInstructions()).toContain("If the skill is unavailable");
    expect(renderTruthCheckInstructions()).toContain("truthmark-check");
    expect(renderTruthCheckInstructions()).toContain("truthmark check command may be used");
  });
});
