import type { DiscoveredMarkdownDocument } from "../markdown/discovery.js";

export type TemplateFile = {
  path: string;
  content: string;
};

const DEFAULT_STANDARDS: TemplateFile[] = [
  {
    path: "docs/standards/default-principles.md",
    content: `---
status: active
doc_type: standard
last_reviewed: 2026-05-03
source_of_truth:
  - README.md
---

# Default Principles

## Scope

This is a bootstrap standards baseline for repositories that adopt Truthmark.

## Reusable Defaults

- Authority order should be explicit.
- Committed repository artifacts are the durable source of truth.
- Each document should have one primary responsibility.
- Each class of fact should have one canonical source.
- Architecture docs describe system structure, module boundaries, runtime topology, persistence boundaries, cross-cutting contracts, and generated-surface ownership.
- Do not put ordinary feature behavior in architecture docs.
- Verification should be explicit, and skipped checks should state why.
- Missing, stale, broad, overloaded, or unrouteable documentation topology should be repaired through AI-native structure workflow before agents create more generic truth docs.
- Installed repository workflows should remain usable from committed files even when the Truthmark CLI is unavailable.
`,
  },
  {
    path: "docs/standards/documentation-governance.md",
    content: `---
status: active
doc_type: standard
last_reviewed: 2026-05-03
source_of_truth:
  - README.md
---

# Documentation Governance

## Core Rules

- Each document should have one primary responsibility.
- Each class of fact should have one canonical source.
- Current implementation, reusable standards, and future proposals should be stored separately.
- Generated helper output is never canonical truth.
- Architecture docs describe structure and ownership; truth docs describe current product behavior.

## Truthmark Implications

- Truth Sync should extend mapped docs first, create an area-local doc second, and create a new area only as a last resort.
- Weak routing produces weak truth maintenance.
- Missing, stale, broad, overloaded, or unrouteable routing should trigger Truth Structure before more generic truth docs are created.
`,
  },
];

export const renderDefaultStandards = (
  documents: DiscoveredMarkdownDocument[],
): TemplateFile[] => {
  const existingPaths = new Set(documents.map((document) => document.path));

  return DEFAULT_STANDARDS.filter((template) => !existingPaths.has(template.path));
};
