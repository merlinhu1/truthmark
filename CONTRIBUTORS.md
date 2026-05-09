# Contributors

This guide is for people contributing to Truthmark itself from this checkout.

## Local Bootstrap

```bash
npm install
npm run dev -- init
npm run dev -- check
```

Use this source-checkout flow when changing Truthmark's own code, templates, or generated workflow surfaces. Downstream repositories should rely on the committed workflow surfaces after `truthmark init`.

## What To Verify

- If you edit `src/templates/**`, `src/agents/**`, or generated workflow renderers, rerun `npm run dev -- init` and review the diffs in `AGENTS.md`, `.codex/skills/`, and `skills/`.
- If you change behavior in `src/checks/**`, `src/init/**`, `src/sync/**`, or `src/realize/**`, run the relevant tests and `npm run dev -- check`.
- Keep the public [README.md](README.md) user-facing; put contributor setup here.
