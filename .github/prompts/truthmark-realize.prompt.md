---
agent: 'agent'
description: 'Realize repository truth docs into code.'
---

---
name: truthmark-realize
description: Use when the user explicitly asks to realize Truthmark truth docs into code, including /truthmark-realize, $truthmark-realize, or /truthmark:realize. Reads truth docs and routing first, updates functional code only, and reports verification.
argument-hint: Optional truth doc path, area, or desired code behavior to realize
user-invocable: true
truthmark-version: 1.2.3
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
2. Read .truthmark/config.yml, docs/truthmark/areas.md, and the relevant functional code.
3. Repository instruction docs such as docs/ai/repo-rules.md remain instruction authority.
Implementation code and canonical truth docs are inspected evidence for current behavior; they do not silently override workflow write boundaries.
4. Update functional code only so implementation matches the truth docs.
5. Do not edit truth docs or truth routing while realizing those docs.
6. Run relevant tests for the changed code.
7. Report changed code files and verification steps.

Read and write boundaries:

- may read truth docs, routing docs, and relevant functional code
- may write functional code only
- must not edit truth docs or truth routing while realizing those docs

Report completion in this shape:

```md
Truth Realize: completed

Truth docs used:
- docs/features/authentication.md

Code updated:
- src/auth/session.ts

Verification:
- npm test -- auth
```

