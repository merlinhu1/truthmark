import { describe, expect, it } from "vitest";
import matter from "gray-matter";

import {
  renderArchitectureDocTemplateFile,
  renderBehaviorDocTemplateFile,
  renderContractDocTemplateFile,
  renderOperationsDocTemplateFile,
  renderProductCapabilityDocTemplateFile,
  renderTestBehaviorDocTemplateFile,
  renderWorkflowDocTemplateFile,
} from "../../src/templates/init-files.js";

describe("truth doc templates", () => {
  const templateCases = [
    ["product-capability", renderProductCapabilityDocTemplateFile],
    ["engineering-behavior", renderBehaviorDocTemplateFile],
    ["engineering-contract", renderContractDocTemplateFile],
    ["engineering-architecture", renderArchitectureDocTemplateFile],
    ["engineering-workflow", renderWorkflowDocTemplateFile],
    ["engineering-operations", renderOperationsDocTemplateFile],
    ["engineering-test-behavior", renderTestBehaviorDocTemplateFile],
  ] as const;

  it("keeps cross-lane relationship authority in route YAML, not frontmatter", () => {
    for (const [templateKind, renderTemplate] of templateCases) {
      const template = renderTemplate();
      const frontmatter = matter(template).data;

      expect(frontmatter, templateKind).not.toHaveProperty("realized_by");
      expect(frontmatter, templateKind).not.toHaveProperty("realizes");
      expect(frontmatter, templateKind).not.toHaveProperty("depends_on");

      const relationshipInstructionLines = template
        .split(/\r?\n/u)
        .filter((line) =>
          /\b(?:realized_by|canonical realizes|depends_on)\b/u.test(line),
        );

      for (const line of relationshipInstructionLines) {
        expect(line, templateKind).toContain("route YAML");
        expect(line, templateKind).toContain("not doc frontmatter");
      }
    }

    expect(renderProductCapabilityDocTemplateFile()).toContain(
      "author canonical realized_by links in route YAML, not doc frontmatter",
    );
    expect(renderBehaviorDocTemplateFile()).toContain(
      "author canonical realizes links in route YAML, not doc frontmatter",
    );
  });
});
