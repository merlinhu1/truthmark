---
status: active
doc_type: standard
last_reviewed: 2026-05-16
source_of_truth:
  - versioning.md
  - pre-completion-checklist.md
---

# Change Notes

## Trigger

Use this standard when a change needs PR text, release text, or a package version decision.

Required triggers:

- `package.json` version changes
- root package entries in `package-lock.json` change because the package version changed
- the user asks for PR, release, changelog, or handoff text
- the working change alters published package behavior

Optional trigger:

- internal-only maintenance that would benefit from a reusable PR summary

## Folder

Write change notes under `changes/`.

Use one file per cohesive working change:

```text
changes/YYYY-MM-DD-short-slug.md
```

Use dates from the current local session date. Keep slugs short, lowercase, and grep-friendly.

## Required Shape

Each change note must use this structure:

```markdown
# Short Change Title

Version action: none|patch|minor|major

## PR Summary

- Concise maintainer-facing summary.

## Release Note

- User-facing release text, or `None; internal-only change.`

## Verification

- Command run, or skipped check with reason.
```

## Rules

- `Version action` must match [versioning.md](versioning.md).
- If `Version action` is `patch`, `minor`, or `major`, the package version must change in the same working change.
- If the package version changes, a matching change note is required because Truthmark releases whenever the package version changes.
- Internal-only repository standards may use `Version action: none`.
- Release notes describe published package behavior, not private repo maintenance.
- Keep notes compact; they are source material for PR and release descriptions, not canonical product truth.

## Agent Output

When reporting change-note work, state only:

- change note path
- version action
- whether release text is present or intentionally `None`
