# Tasks

## 1. Tests first

- [x] 1.1 Add/keep renderer tests proving configured host skill packages include `SKILL.md`, `support/procedure.md`, `support/report-template.md`, and conditional helper/subagent resources.
- [x] 1.2 Add/keep renderer and init tests proving generated surfaces do not include unused `.truthmark/agent/` workflow copies.
- [x] 1.3 Add/keep freshness tests proving missing/stale host package files produce generated-surface review diagnostics.

## 2. Renderer implementation

- [x] 2.1 Render `.agents`, `.opencode`, `.claude`, `.github`, and `.gemini` skill directories as native generated packages with colocated resources.
- [x] 2.2 Keep Copilot prompts, Gemini commands, and top-level managed blocks compact and routed to host-local skill package files.
- [x] 2.3 Remove the unused `.truthmark/agent/` generated package and manifest from normal generated output.
- [x] 2.4 Remove stale expanded-adapter/canonical-package hash plumbing that only existed for duplicated workflow copies.

## 3. Documentation and truth

- [x] 3.1 Record the native skill package decision and justification in the product capability doc.
- [x] 3.2 Update engineering workflow/runtime truth to say source renderers are generation authority and host packages are runtime surfaces.
- [x] 3.3 Update release notes and generated-surface repository-intelligence docs to avoid claiming a separate `.truthmark/agent/` package exists.

## 4. Verification

- [x] 4.1 Regenerate generated surfaces with `npx tsx src/cli/main.ts init --json`.
- [x] 4.2 Run focused generated-surface/init/check/eval/integration tests.
- [x] 4.3 Run full repository verification before final commit: `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build`, `npm run release:check`, OpenSpec validation, Truthmark check/index, and `git diff --check`.
