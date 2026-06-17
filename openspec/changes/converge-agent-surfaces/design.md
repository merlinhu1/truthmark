# Design: Native Host Workflow Packages

## Summary

Generated Truthmark workflow behavior is authored in source renderers and projected into host-native surfaces. Skill directories are the runtime package boundary for hosts that support skills, so Truthmark renders complete host skill packages with colocated resources instead of pointer-only skill adapters.

A separate `.truthmark/agent/` workflow copy is intentionally not generated unless an active host surface consumes it. With native host packages in place, a repo-local duplicate would add documentation-like files that agents do not load and that users must review without runtime benefit.

## Package shape

For each configured host skill root, Truthmark renders:

- `SKILL.md` as the host skill entrypoint.
- `support/procedure.md` for detailed procedure and review questions.
- `support/report-template.md` for completion/handoff shape.
- `support/subagents-and-leases.md` when the workflow uses subagents or write leases.
- `helper-manifest.yml` and `support/helper-policy.md` when helper validation applies.

Copilot prompt files, Gemini command files, and top-level managed instruction blocks remain compact adapter/discovery surfaces that point to host-local package files.

## Rationale

Agent skill systems may discover, package, and progressively disclose files from the skill directory. Replacing skill directories with a single pointer-only adapter would make behavior depend on arbitrary cross-repository reads and can fail in hosts or sandboxes that package only the skill directory.

Generating both host packages and a `.truthmark/agent/` copy creates the opposite problem: duplicate workflow docs in the repository when no runtime surface reads the copy. The safer product boundary is one source renderer in package code, then concrete host-native runtime packages in the checked-out repository.

## Validation

`truthmark check` compares rendered generated surfaces against committed files and reports missing/stale host package files. These diagnostics are advisory review output; they do not introduce hooks, CI blockers, daemons, or mandatory live preflight.
