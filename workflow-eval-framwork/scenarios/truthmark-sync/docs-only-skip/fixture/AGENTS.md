# Fixture Agent Instructions

Use the installed Truthmark workflow behavior for this eval fixture.

## Truthmark Workflow

Hierarchy hints: config `.truthmark/config.yml` when present; routes `docs/truthmark/routes/areas.md` and `docs/truthmark/routes/areas/**/*.md` when present; Truth docs under `docs/truthmark/**` when present.

### Truth Sync

After functional code changes, run relevant tests, then use the Truth Sync review before finishing. Skip Sync for docs-only/no-code changes, formatting-only changes, behavior-preserving renames with no truth impact, or missing config. When skipping, report the reason and the verification command you ran or explicitly explain why it was skipped.

Truth Sync may write truth docs and truth routing files when functional behavior changed, and must not rewrite functional code.
