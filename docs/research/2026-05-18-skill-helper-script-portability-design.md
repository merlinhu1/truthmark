# Skill Helper Script Portability Design

Status: superseded research draft
Date: 2026-05-18
Scope: Historical notes for optional helper-script packaging; current implementation uses Truthmark CLI-owned helpers.

> Superseded decision (2026-05-19): helper logic now lives in the installed
> `truthmark` CLI. Generated helper manifests expose argv-style
> `truthmark validate ... --json` commands and generated skill packages no longer
> copy `.mjs` helper scripts. The manual workflow and helper fallback behavior
> remain authoritative when the CLI is unavailable or version-mismatched.

This is a research design, not canonical repository truth. If accepted, the
behavior-bearing parts should move into the owning truth docs, manifest,
renderers, generated skill packages, and tests.

## Summary

Truthmark should allow workflow skills to ship helper scripts, but scripts should
be capability-enhancing rather than capability-defining. The manual workflow in
the skill and its support procedure remains authoritative. A script may collect
checkout facts, validate structured reports, or catch mechanical drift, but a
missing runner such as Node for `.mjs` must not block an agent from completing the
workflow correctly.

The recommended model is a fallback ladder:

1. Follow the manual workflow contract in `SKILL.md` and support docs.
2. Use built-in agent tools for checkout inspection, search, diffs, and focused
   validation.
3. Run optional helper scripts only when their runner is available.
4. Run equivalent Truthmark CLI validation when installed and applicable.

When a helper cannot run, the agent continues manually and reports that the
helper was skipped, including the reason.

## Problem

Scripts improve repeatability for deterministic mechanics, but skill packages run
in many environments. A user may have a checkout but not Node, not Python, no
shell beyond a restricted sandbox, or no permission to execute files. If the
workflow silently assumes a specific script runtime, a portable skill becomes a
host-specific runtime dependency.

For example, a generated skill can include:

```bash
node .truthmark/scripts/validate-sync-report.mjs report.md
```

That is useful in a Node-capable environment, but brittle when `node` is absent
or when execution of `.mjs` files is blocked. Truthmark should not make workflow
success depend on this helper.

## Goals

- Preserve Truthmark's repository-native, cross-host workflow model.
- Keep checkout docs, manifest, templates, renderers, and tests as the sources
  of behavior-bearing truth.
- Use scripts for deterministic, boring mechanics that are easy to verify.
- Make script availability explicit and observable in final reports.
- Ensure every scripted check has a manual fallback path in the skill procedure.
- Avoid hidden workflow brains inside executable assets.

## Non-Goals

- Do not require users to install Node, Python, or another runtime before they
  can use a Truthmark workflow skill.
- Do not duplicate every helper in several languages by default.
- Do not let helper output override direct checkout evidence.
- Do not put conceptual ownership, semantic truth validation, or final
  acceptance decisions into scripts.
- Do not create host-specific skill behavior where the workflow contract differs
  across Codex, OpenCode, Claude Code, Copilot, or Gemini.

## Design Principle: Scripts Are Optional Accelerators

A script-backed skill step should always be written as an optional acceleration
path:

```md
Optional helper:
- If Node is available, run:
  `node .truthmark/scripts/validate-sync-report.mjs <report-file>`
- If unavailable, manually check `support/report-template.md` for the same
  required fields.
- In the final report, state whether the helper ran or was skipped.
```

The workflow still succeeds because the skill and support procedure are the
runtime contract. The script only makes a deterministic part faster or less
error-prone.

## Fallback Ladder

Truthmark should document and generate this execution order for helper-aware
skills:

1. **Manual skill contract**: the agent can complete the workflow by reading the
   skill, support files, and checkout evidence directly.
2. **Agent-native tools**: search, read, diff, test, and inspect files using the
   host's available tools.
3. **Optional helper script**: run only after checking that the declared runner
   exists and the script is safe for the current step.
4. **Optional Truthmark CLI command**: run when the package is installed and the
   command is relevant to the validation being performed.

If all executable helpers are unavailable, the workflow falls back to steps 1 and
2. That outcome is valid when the manual checks are performed and reported.

## Helper Manifest

A generated helper manifest should describe each helper's requirements and
fallback. This makes runtime capability explicit instead of burying assumptions in
prose.

Example:

```yaml
helpers:
  validate-sync-report:
    optional: true
    runner: node>=20
    command: node .truthmark/scripts/validate-sync-report.mjs
    inputs:
      - final report markdown
    output: json
    writes: false
    fallback: manually validate support/report-template.md
  validate-write-lease:
    optional: true
    runner: node>=20
    command: node .truthmark/scripts/validate-write-lease.mjs
    inputs:
      - lease yaml
      - git diff --name-only output
    output: json
    writes: false
    fallback: manually compare declared allowedWrites with changed files
```

The manifest is not the authority for workflow semantics. It is an index that
lets agents and hosts discover whether a helper can be attempted safely.

## Runtime Detection

Skill text should direct agents to detect capabilities before invoking helpers.
For Node-backed helpers, the minimal pattern is:

```bash
if command -v node >/dev/null 2>&1; then
  node .truthmark/scripts/validate-sync-report.mjs report.md
else
  echo "SKIP: node unavailable; validate manually using support/report-template.md"
fi
```

Generated surfaces do not need to inline this shell snippet everywhere. They can
instead state the policy once and list helper metadata. The important contract is
that agents check runner availability before invocation and treat absence as a
visible skip, not a workflow failure.

## Reporting Contract

Final workflow reports should include a small helper status section whenever
helper scripts are part of the skill package:

```md
Helper scripts:
- validate-sync-report: ran, passed
- validate-write-lease: skipped, no write lease used
- generated-surface-drift: skipped, node unavailable; checked rendered surfaces manually
```

A skipped helper is acceptable when the report also states the manual evidence or
manual check that replaced it.

## Script Selection Guidelines

Good helper candidates:

- preflight context probes, such as changed files and required config presence
- report shape validators
- write lease validators
- generated surface drift checks
- routing eval smoke-check wrappers
- deterministic fixture or snapshot comparators

Poor helper candidates:

- deciding canonical truth ownership
- judging whether prose truth claims are semantically correct
- writing final documentation prose
- accepting or rejecting a workflow run
- choosing whether to expand workflow write boundaries
- encoding host-specific behavior that changes the workflow across platforms

## Packaging Strategy

Truthmark can use the repository's native Node/TypeScript ecosystem for canonical
helper implementations without making Node a workflow prerequisite.

Recommended package shape:

```text
.codex/skills/truthmark-sync/
  SKILL.md
  support/
    procedure.md
    report-template.md
  scripts/
    validate-sync-report.mjs
    generated-surface-drift.mjs
  helper-manifest.yml
```

For project-local generated skills, equivalent host directories may contain the
same support files. The behavior contract should come from the typed workflow
manifest and renderers, not from hand-edited generated surfaces.

## Multi-Language Alternatives

Truthmark should not duplicate every helper in `.mjs`, `.py`, and `.sh` by
default. Multi-language duplication increases drift and makes helpers harder to
trust.

Prefer this order:

1. One canonical helper in the project-native runtime.
2. A clear manual fallback in support documentation.
3. A tiny POSIX shell fallback only for very small checks where duplication is
   obviously lower risk than the runtime dependency.
4. Additional language implementations only when a helper proves critical and the
   alternate implementation can be tested against the same fixtures.

If an alternate implementation exists, tests should prove the outputs are
contract-equivalent for shared fixtures.

## Read-Only Default

Helper scripts should be read-only by default. A read-only helper can fail, be
skipped, or be unavailable without leaving the checkout in a partial state.

If a helper writes files, the manifest and skill must say so explicitly:

```yaml
writes: true
allowedWrites:
  - docs/truthmark/areas/**/*.md
```

Write-capable helpers should be rare and should follow the same boundary rules as
workflow agents: exact scope, visible evidence, focused verification, and parent
acceptance.

## Canonicalization Path

If this design is accepted, promote it in this order:

1. Add canonical helper policy to the owning workflow truth docs.
2. Extend the workflow manifest model with optional helper metadata if needed.
3. Update renderers/templates so generated host skills include the helper policy
   and helper status reporting contract.
4. Add tests that generated skills preserve the manual fallback language.
5. Add focused tests for helper manifests and read-only helper behavior.

Research notes alone are not enough. The behavior must be enforced through the
same source surfaces that already govern Truthmark workflows.

## Acceptance Criteria

A script-aware Truthmark skill is acceptable when:

- Every helper has declared runner requirements.
- Every helper is marked optional or required; workflow helpers should default to
  optional.
- Every optional helper has a documented manual fallback.
- The skill tells agents to report helpers that were run or skipped.
- Helper scripts are read-only unless writes are explicitly declared.
- Tests cover generated helper policy text and any machine-readable manifest.
- The workflow remains completable in a checkout where `.mjs` execution is not
  available.

## Recommended Default Policy Text

```md
Optional helper scripts may collect deterministic checkout facts or validate
artifacts. If a helper's runner is unavailable, continue manually using this
procedure and report which helper was skipped. Helper output is derived evidence;
it does not override direct checkout inspection, workflow write boundaries, or
parent acceptance.
```
