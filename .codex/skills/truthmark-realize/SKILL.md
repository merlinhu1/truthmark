---
name: truthmark-realize
description: Use when the user explicitly asks to realize Truthmark truth docs into code, including /truthmark-realize, $truthmark-realize, or /truthmark:realize. Not for syncing docs after code changes, documenting existing code, topology repair, or truth audits.
argument-hint: Optional truth doc path, area, or desired code behavior to realize
user-invocable: true
truthmark-version: 1.4.0
---

# Truthmark Realize

Use this skill only when the user explicitly asks to realize truth docs into code.

Invocations: OpenCode /skill truthmark-realize; Codex /truthmark-realize or $truthmark-realize; Claude Code /truthmark-realize; GitHub Copilot /truthmark-realize; Gemini CLI /truthmark:realize.

Truth Realize is doc-first:

- truth docs lead
- code follows
- Truth Realize never edits the truth docs it is realizing

Workflow:

1. Read the updated truth docs named by the user, or infer the relevant docs from docs/truthmark/areas.md.
2. Read .truthmark/config.yml, docs/truthmark/areas.md, relevant child route files, tests, and the relevant functional code.
3. Repository instruction docs such as docs/ai/repo-rules.md remain instruction authority.
Implementation code and canonical truth docs are inspected evidence for current behavior; they do not silently override workflow write boundaries.
Truth-doc ownership gate:
- before editing or relying on source truth docs before writing code, verify each target/source truth doc is a bounded owner for the behavior
- if a target/source doc mixes independent owners, spans unrelated behaviors, acts as an index, or needs cross-owner edits, do not patch or in-place repair it
- if a source truth doc is broad, mixed-owner, index-like, unrouteable, stale, or conflicts with implementation evidence, block before writing code and recommend Truth Structure or Truth Document
- report Ownership reviewed, Structure required, Truth docs split, Truth docs restructured, or Blocked reason as applicable
4. Update functional code only so implementation matches bounded, current truth claims from the source docs.
5. Do not edit truth docs or truth routing while realizing those docs.
6. Run relevant tests for the changed code.
7. Report changed code files and verification steps.
Truthmark hierarchy:
- Config: .truthmark/config.yml
- Root route index: docs/truthmark/areas.md
- Area route files: docs/truthmark/areas/**/*.md
- Truth docs: docs/truth/**/*.md

Read and write boundaries:

- may read truth docs, routing docs, and relevant functional code
- may write functional code only
- must not edit truth docs or truth routing while realizing those docs

Report completion in this shape:

```md
Truth Realize: completed

Truth docs used:
- docs/truth/authentication/session-timeout.md

Code updated:
- src/auth/session.ts

Verification:
- npm test -- auth
```
