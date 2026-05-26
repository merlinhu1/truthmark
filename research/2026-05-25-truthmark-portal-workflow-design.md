# Truthmark Portal Workflow Design

Status: draft for review

This is a non-canonical design note. It is intentionally kept under `research/` so it does not redefine current Truthmark behavior until a reviewed decision is promoted into canonical docs and implementation.

## Decision Summary

Design `truthmark-portal` as an opt-in, manually triggered, Markdown-native agent workflow that generates a committed multi-page static HTML site for humans.

Name rationale: **Truthmark Portal** is the strongest V1 name because the feature is a human entrypoint into repository truth: a browsable, publishable doorway to routes, areas, diagrams, and large-project orientation without implying that generated HTML is canonical truth.

Confirmed product choices:

1. Generated HTML is committed to the repository.
2. Portal is a full multi-page site, because Truthmark targets large projects.
3. Installation is opt-in only during `truthmark init`.
4. Truthmark Portal uses one namespaced config block, `truthmark-portal`, so the install toggle, output path, and template selection live together. Output path and template selection are V1 features. Repositories can rename the generated output folder and choose a shared committed template so different users generate the same Portal shape.
5. Generated Portal output may include presentation artifacts: HTML pages, diagrams, generated summaries, navigation files, search data, CSS, JavaScript, copied source images, and template-requested assets. Generated pictures and screenshots require an explicit user or template request.
6. The HTML site is for humans only. Markdown remains canonical and agents should not treat generated HTML as repository truth.

## Problem

Large projects need a browsable human-facing portal over Truthmark's branch-local Markdown truth docs. A raw tree of route files and truth docs is useful for agents and reviewers, but humans need stronger navigation, summaries, diagrams, and project-level orientation.

A deterministic `truthmark-portal renderer` CLI/package would either duplicate Truthmark's routing model in another renderer or push the project toward canonical JSON/index artifacts too early. The desired V1 is instead LLM-native: an agent reads Markdown directly, interprets the project structure, and generates a committed static site.

## Goals

- Provide an opt-in `truthmark-portal` workflow installable by `truthmark init`.
- Require explicit manual invocation; never run as part of normal Truth Sync, Truth Check, or code-change completion.
- Read canonical Markdown directly from the checkout.
- Generate a committed static multi-page HTML site for human browsing.
- Include a strong default template suitable for large projects.
- Support configurable output path and template selection in V1.
- Allow committed shared templates to request additional generated content such as diagrams, pictures, visual explainers, summary pages, dependency maps, and other static assets.
- Keep generated site metadata disposable and scoped to Portal output.
- Avoid any hard runtime dependency on the `truthmark` package/binary for core generation.

## Non-Goals

- Do not make generated HTML canonical truth.
- Do not create `.truthmark/index.json` as required infrastructure.
- Do not create a separate Portal npm package for V1.
- Do not make the workflow automatic after code changes.
- Do not require agents to consume the generated HTML later.
- Do not let generated summaries replace source Markdown.
- Do not require a deterministic semantic index before the workflow is useful.

## Product Boundary

Canonical sources remain Markdown in the checkout:

```text
.truthmark/config.yml
docs/truthmark/areas.md
docs/truthmark/areas/**/*.md
docs/ai/**/*.md
docs/architecture/**/*.md
docs/standards/**/*.md
docs/truth/**/*.md
```

Generated presentation output is committed but non-canonical. The default output is:

```text
docs/truthmark-portal/**
```

Repositories may configure a different contained output directory through `truthmark-portal.output`:

```text
<configured-portal-output>/**
```

Every generated page should visibly disclose:

```text
Generated Truthmark Portal. Markdown files are canonical; this site is presentation only.
```

## Configuration

### Namespaced workflow block

Use one opt-in namespaced block in `.truthmark/config.yml`:

```yaml
truthmark-portal:
  enabled: false
  output: docs/truthmark-portal
  template: default
```

Default when the block is omitted should be equivalent to the block above: Truthmark Portal is disabled, with default output and template values available after normalization. If `enabled` is omitted inside the block, treat it as `false` so adding shared settings never accidentally installs or runs the workflow.

Configured example:

```yaml
truthmark-portal:
  enabled: true
  output: docs/project-map
  template: docs/truthmark/portal-templates/product-docs.md
```

`truthmark-portal.enabled` controls whether `truthmark init` installs Truthmark Portal surfaces.

`truthmark-portal.output` is a repo-relative directory path for generated presentation output. It must stay inside the repository and must not overlap canonical Markdown roots, source roots, or instruction targets.

`truthmark-portal.template` may be a built-in template ID such as `default` or a repo-relative Markdown file path. Repo-relative template files are committed and shared so different users generate the same Portal style. Template files are instructions for presentation generation only; they are not canonical truth docs.

### Why a namespaced block instead of `optional_workflows`

Preferred:

```yaml
truthmark-portal:
  enabled: true
  output: docs/project-map
  template: docs/truthmark/portal-templates/product-docs.md
```

Rejected split shape:

```yaml
optional_workflows:
  - truthmark-portal
portal:
  output: docs/project-map
  template: docs/truthmark/portal-templates/product-docs.md
```

The namespaced block is simpler for users because one feature owns its enable flag and settings. It avoids a split-brain config where installation lives in one key and runtime generation settings live in another. It also scales cleanly if Truthmark Portal later needs additional presentation-only options.

## Init Behavior

During `truthmark init`:

1. Load and normalize config.
2. Generate existing platform surfaces as today.
3. If `truthmark-portal.enabled` is `true`, render `truthmark-portal` skill/prompt/command surfaces for all configured platforms.
4. If not enabled, do not mention or install `truthmark-portal`.

Default init behavior must remain unchanged for existing users.

## Workflow Identity

Add workflow ID:

```ts
"truthmark-portal"
```

Manifest intent:

```text
Use only when the user explicitly asks to generate, refresh, or update a committed static HTML Truthmark Portal.
```

Positive triggers:

- "generate the Truthmark Portal"
- "refresh the committed HTML docs site"
- "create a browsable project map from Truthmark docs"
- "update docs/truthmark-portal"
- "make a human-readable static site from the truth docs"

Negative triggers:

- code changed and truth needs syncing
- route ownership needs repair
- user asks for truth validation/checking
- user asks to document implemented behavior
- user asks to realize docs into code
- user asks for machine-readable agent context

Manual-only boundary:

```text
Truthmark Portal is never a completion gate. It runs only when explicitly requested.
```

## Installed Surfaces

When enabled, install host-native workflow surfaces using existing generated-surface machinery.

Examples:

```text
.codex/skills/truthmark-portal/SKILL.md
.codex/skills/truthmark-portal/support/procedure.md
.codex/skills/truthmark-portal/support/report-template.md

.claude/skills/truthmark-portal/SKILL.md
.claude/skills/truthmark-portal/support/procedure.md
.claude/skills/truthmark-portal/support/report-template.md

.opencode/skills/truthmark-portal/SKILL.md
.opencode/skills/truthmark-portal/support/procedure.md
.opencode/skills/truthmark-portal/support/report-template.md

.github/skills/truthmark-portal/SKILL.md
.github/prompts/truthmark-portal.prompt.md

.gemini/skills/truthmark-portal/SKILL.md
.gemini/commands/truthmark/portal.toml
```

No dedicated subagents in V1 unless a later implementation needs separate visual-design, diagram, or link-checking specialists.

## AGENTS Managed Block

If installed, the generated instruction block may mention Truthmark Portal, but the wording must not imply that Truth Sync can require Truthmark Portal.

Example wording:

```md
Explicit workflows: Truth Structure, Truth Document, Truth Preview, Truth Realize, Truth Check. Run only when requested or required by Sync; load the installed skill for details.
Truthmark Portal is a separate manual-only presentation workflow. Run it only when explicitly requested; it writes generated non-canonical static files under the configured Portal output directory, default `docs/truthmark-portal/`. Markdown remains canonical.
```

If not installed, do not mention it.

## Runtime Dependency Rule

The workflow must not require the `truthmark` binary/package.

Allowed:

- Read Markdown directly from the checkout.
- Use shell/filesystem tools to inspect docs.
- Use an LLM to synthesize summaries, navigation, diagrams, and page copy.
- Optionally run `truthmark check --json` or `truthmark index --json` if available, but only as supporting evidence.

Forbidden:

- Blocking generation because the `truthmark` CLI is missing.
- Requiring `.truthmark/index.json`.
- Treating a generated index/manifest as canonical routing truth.
- Asking users to install a separate Portal package for V1.

## Output Directory

Default committed output:

```text
docs/truthmark-portal/
```

Rationale:

- easy to commit
- easy to review in PRs
- easy to publish through GitHub Pages or static hosting
- clearly separate from canonical `docs/truth/**`
- visible to humans browsing the repo

A repo may override the output path in config or in the user request, but the default should be `docs/truthmark-portal/`.

## Generated Site Shape

V1 should generate a multi-page static site optimized for large projects.

Default structure under the selected output directory:

```text
<truthmark-portal.output>/
  index.html
  areas/
    index.html
    <area-slug>/
      index.html
      <child-area-slug>.html
  truth/
    index.html
    <truth-doc-slug>.html
  architecture/
    index.html
    <architecture-doc-slug>.html
  standards/
    index.html
    <standard-doc-slug>.html
  diagrams/
    index.html
    <diagram-slug>.html
  assets/
    style.css
    app.js
    search-index.json
    manifest.json
    images/
      <generated-or-copied-image>.*
```

The exact page set can vary by project size and template instructions.

## Default Human Template

The default template should help humans answer:

1. What is this project?
2. What are the major areas?
3. Where do I start?
4. What behavior is owned where?
5. What changed or looks risky?
6. Which source Markdown file backs this page?

### Default pages

#### Home page: `index.html`

Include:

- project title
- generated-at timestamp
- source branch/commit when available
- short human summary
- major areas grid
- quick links to architecture, standards, truth docs, diagrams, and search
- "Start here" path for new contributors
- source/canonical disclaimer

#### Area overview: `areas/index.html`

Include:

- area tree
- parent/child relationships
- owned code surfaces when available from route docs
- owned truth docs
- stale/missing/ambiguous route notes when detected

#### Area detail pages

Each area page should include:

- purpose of area
- child areas
- code surfaces
- truth docs
- update triggers
- source route Markdown link
- related diagrams and truth pages

#### Truth doc pages

Each truth doc page should include:

- generated summary
- rendered Markdown body or major excerpts
- source path
- owning area when inferable
- related docs
- diagrams or pictures requested by template
- "canonical source" link

#### Architecture and standards pages

Include:

- rendered source Markdown
- generated summary
- relationships to truth docs and areas
- source links

#### Diagrams index

Include all generated visual artifacts:

- project map
- area ownership map
- workflow map
- code-surface-to-truth-doc map
- any template-requested diagrams or pictures

### Default navigation

Every page should include:

- persistent left nav or top nav
- breadcrumb trail
- local table of contents
- source Markdown link
- search box when `assets/search-index.json` exists
- generated/canonical disclaimer

## Template-Driven Extra Content

The workflow should support template instructions that request extra generated content.

Template examples:

```md
## Extra generated pages

- Create a Mermaid project ownership diagram.
- Create one architecture explainer page per major area.
- Create onboarding diagrams for new contributors.
- Create a visual map of Truthmark workflows.
- Create one picture/illustration per top-level area if useful.
```

Recommended source for shared custom template instructions:

```text
docs/truthmark/portal-templates/<template-name>.md
```

A repository may also use a single-file convention:

```text
docs/truthmark/portal-template.md
```

or a config-near path when preferred:

```text
.truthmark/portal-template.md
```

The default should work without a custom template, but `truthmark-portal.template` must support repo-relative committed Markdown files so teams can share portal style across users.

### Template contract

A template may request:

- extra HTML pages
- Mermaid diagrams
- SVG diagrams
- generated images/pictures where tools are available
- copied source images
- navigation sections
- summary cards
- glossary pages
- onboarding paths
- contributor guides

A template must not request:

- edits to canonical truth docs as part of the portal workflow
- generated files that agents should treat as canonical truth
- destructive rewrites outside the output directory
- hidden external service dependencies

## Provenance And Staleness Contract

Committed generated HTML can become stale, so the generated site must make source provenance visible.

Every generated page should include:

- generated timestamp
- source branch when available
- source commit when available
- source Markdown path or paths backing the page
- canonical Markdown disclaimer

The generated manifest should include source provenance for review and stale-output detection:

```json
{
  "generatedAt": "2026-05-25T00:00:00.000Z",
  "sourceBranch": "main",
  "sourceCommit": "<git-commit-or-null>",
  "output": "docs/truthmark-portal",
  "template": "default",
  "pages": [
    {
      "output": "truth/example.html",
      "sources": ["docs/truth/example.md"]
    }
  ]
}
```

This manifest is presentation metadata only. It must stay under the generated output directory and must not become repository authority.

## Generated Metadata

Generated metadata is allowed, but only as presentation support.

Allowed examples:

```text
<truthmark-portal.output>/assets/manifest.json
<truthmark-portal.output>/assets/search-index.json
<truthmark-portal.output>/assets/link-map.json
<truthmark-portal.output>/assets/page-data/*.json
```

These files may support search, navigation, link checking, and client-side browsing.

Rules:

- Metadata lives under the generated output directory.
- Metadata is disposable and regenerated with the site.
- Metadata is not canonical repository truth.
- Metadata must not replace `docs/truthmark/areas.md` or truth docs.
- Agents should read source Markdown, not generated Portal metadata, when doing Truthmark work.

Avoid:

```text
.truthmark/index.json
.truthmark/index/**
```

unless a future deterministic consumer creates a separate reviewed design.

## HTML And Asset Safety

Generated static output must be safe to commit and publish.

Rules:

- Escape or sanitize rendered Markdown before embedding it in HTML.
- Do not execute code blocks from source Markdown.
- Do not include remote scripts, analytics, fonts, CSS, or CDN dependencies by default.
- Prefer local static CSS and JavaScript under the generated output directory.
- Do not embed secrets, environment variables, access tokens, local absolute paths, or private machine metadata.
- Sanitize generated or embedded SVG/HTML so it cannot execute arbitrary script.
- If source Markdown contains raw HTML, either sanitize it or render it as escaped source content.
- Link copied source images back to their source paths.
- Keep all generated assets and metadata under the configured output directory.

## Diagrams and Pictures

The workflow may generate visual artifacts when useful or requested by the template.

Recommended V1 diagram and image types:

- Mermaid diagrams embedded in HTML
- SVG diagrams generated from Mermaid or handwritten SVG
- copied existing repo images with attribution/source links
- static PNG/WebP/JPEG images only when explicitly requested by the user or shared template and when image tools are available

Default generated diagrams:

1. Project area map
2. Area-to-truth-doc ownership map
3. Workflow overview map
4. Architecture dependency sketch when architecture docs provide enough evidence

Diagram and image rules:

- Prefer source-backed diagrams over invented architecture.
- Label uncertain relationships as inferred.
- Link every diagram back to the source Markdown files used.
- Store generated diagram and image assets under the output directory.
- Do not write diagram sources into canonical docs unless the user asks for documentation changes.
- Do not generate decorative pictures or screenshots by default; require an explicit user or template request.

## Workflow Procedure

The installed procedure should guide the agent through these steps.

### 1. Confirm manual invocation

Proceed only if the user explicitly asked to generate or refresh Truthmark Portal.

### 2. Inspect config and source docs

Read:

1. `.truthmark/config.yml`
2. `docs/ai/repo-rules.md` if present
3. `docs/truthmark/areas.md`
4. `docs/truthmark/areas/**/*.md`
5. `docs/truth/**/*.md`
6. `docs/architecture/**/*.md`
7. `docs/standards/**/*.md`
8. custom Portal template if present

### 3. Determine output path and template

Use:

1. user-requested output path if provided
2. config `truthmark-portal.output` if provided
3. default `docs/truthmark-portal/`

Validate that the selected output path is repo-relative, inside the repository, and not overlapping canonical Markdown roots, source roots, or instruction targets.

Use:

1. user-requested template if provided
2. config `truthmark-portal.template` if provided
3. default template otherwise

If the selected template is a repo-relative file, read it from the checkout. If it is a built-in template ID such as `default`, use the installed workflow's default template instructions.

### 4. Plan generated page inventory

Create a generation plan listing:

- pages
- diagrams
- pictures/images
- assets
- metadata files
- source Markdown backing each page

The plan is internal to the workflow report unless the agent needs user confirmation for unusually large output.

### 5. Generate site

Generate complete static output under the selected output directory.

The workflow may replace the entire output directory because it owns generated presentation output. It must not edit files outside that directory except by explicit user request.

### 6. Validate generated output

Recommended checks:

- entry page exists
- all generated HTML files have source/canonical disclaimer
- source Markdown links are present
- generated provenance includes generated timestamp and branch/commit when available
- relative links resolve within the generated site where practical
- major route/truth docs have corresponding pages or reported skips
- generated metadata stays under the output directory
- generated HTML/assets have no default remote scripts, analytics, fonts, CSS, or CDN dependencies
- raw Markdown HTML and generated SVG are sanitized or escaped
- no canonical truth docs were modified accidentally

If available, optional supporting checks:

```bash
truthmark check --json
truthmark index --json
```

These are helpful but not required for the Portal workflow.

### 7. Report

Final report must identify:

- output path
- page count
- generated diagrams/assets
- source docs reviewed
- skipped/ambiguous docs
- validation performed
- statement that Markdown remains canonical

## Write Boundaries

Allowed writes by default:

```text
docs/truthmark-portal/**
```

Allowed if configured or user-requested:

```text
<configured-portal-output>/**
```

The selected output directory must be contained in the repository and must not overlap canonical source or authority surfaces. Reject or block paths that resolve outside the repository, point at source roots, or overlap:

```text
src/**
docs/ai/**
docs/truthmark/areas.md
docs/truthmark/areas/**
docs/truth/**
docs/architecture/**
docs/standards/**
.truthmark/config.yml
AGENTS.md
CLAUDE.md
GEMINI.md
.github/copilot-instructions.md
```

Forbidden unless the user changes the task:

```text
src/**
docs/truthmark/areas.md
docs/truthmark/areas/**/*.md
docs/truth/**/*.md
docs/architecture/**/*.md
docs/standards/**/*.md
.truthmark/config.yml
AGENTS.md
CLAUDE.md
GEMINI.md
.github/copilot-instructions.md
```

The workflow may report issues in canonical docs, but should not repair them. Suggested follow-ups:

- Truth Structure for routing problems
- Truth Document for missing or stale behavior docs
- Truth Check for validation/audit
- Truth Sync after functional code changes

## Large Project Strategy

Because this workflow is designed for large projects, the default site should avoid one giant page.

Recommended behavior:

- top-level landing page summarizes the repo
- area index splits navigation by ownership area
- each area gets an overview page
- each truth doc gets a page
- diagrams get their own index
- search index supports client-side lookup
- summaries stay concise and link to source docs
- pages use stable slugs derived from source paths
- generation report lists any docs skipped to keep output bounded

For very large repos, the workflow can shard pages further:

```text
<truthmark-portal.output>/truth/<area-slug>/<doc-slug>.html
<truthmark-portal.output>/areas/<parent>/<child>/index.html
```

## Source Link and Canonicality Rules

Every generated page should include:

- source Markdown path(s)
- generated timestamp
- disclaimer that Markdown is canonical
- link to relevant area route when inferable

Recommended footer:

```text
Generated by Truthmark Portal from repository Markdown. This page is presentation only. Source Markdown is canonical.
```

## Implementation Touchpoints

Likely files:

```text
src/config/schema.ts
src/config/defaults.ts
src/config/load.ts
src/agents/workflow-manifest.ts
src/templates/generated-surfaces.ts
src/templates/workflow-surfaces.ts
src/templates/agents-block.ts
```

Config implementation must add a normalized `truthmark-portal` block with `enabled`, `output`, and `template` fields. Invalid field types, unsafe output paths, and invalid template references should fail visibly.

Potential new files:

```text
src/agents/truthmark-portal.ts
src/templates/truthmark-portal-default-template.ts
```

Tests:

```text
tests/config/*
tests/init/init.test.ts
tests/agents/workflow-manifest.test.ts
tests/agents/truthmark-portal.test.ts
tests/agents/prompts.test.ts
tests/templates/generated-surfaces.test.ts
```

## Acceptance Criteria

- `truthmark init` with omitted `truthmark-portal` config or `truthmark-portal.enabled: false` does not install Truthmark Portal.
- `truthmark init` with `truthmark-portal.enabled: true` installs Truthmark Portal surfaces for configured platforms.
- Config supports normalized `truthmark-portal.output` and `truthmark-portal.template` so users can rename the generated folder and share templates across users.
- Generated workflow text states manual-only invocation.
- Generated workflow text states Markdown is canonical and HTML is presentation.
- Generated workflow text does not require the `truthmark` binary.
- Generated workflow text defaults output to `docs/truthmark-portal/`.
- Generated workflow text permits configured repo-relative output paths after containment and non-overlap checks.
- Generated workflow text permits multi-page committed static output.
- Generated workflow text permits template-driven extra HTML, diagrams, assets, and presentation metadata under the output directory.
- Generated workflow text requires explicit user or template request for generated pictures or screenshots.
- Generated workflow text requires source provenance on generated pages and in generated manifest metadata.
- Generated workflow text forbids default remote scripts, analytics, fonts, CSS, and CDN dependencies.
- Generated workflow text forbids `.truthmark/index.json` as required infrastructure.
- Generated workflow text instructs agents not to edit canonical truth docs unless the user explicitly changes scope.
- Tests cover opt-in/opt-out generated-surface behavior, output/template config, provenance text, and HTML/asset safety rules.

## Open Questions Before Implementation

1. Should the default shared template path convention be `docs/truthmark/portal-template.md`, `docs/truthmark/portal-templates/<name>.md`, or another repo-relative location?
2. Should the workflow replace the entire output directory on each run, or preserve unknown files under the configured output directory?
3. Should the default site include client-side JavaScript search, or stay HTML/CSS-only in V1?

## Recommended V1

Implement the smallest durable version:

```yaml
truthmark-portal:
  enabled: true
  output: docs/truthmark-portal
  template: default
```

Default behavior:

- install manual-only workflow surfaces
- generate committed multi-page static site under configured `truthmark-portal.output`, default `docs/truthmark-portal/`
- include default large-project human navigation template
- support `truthmark-portal.template` as either a built-in template ID or repo-relative shared Markdown template path
- support template-driven extra pages/assets if a template file is present
- keep generated metadata under `<truthmark-portal.output>/assets/`
- include page-level and manifest-level source provenance
- enforce static HTML/asset safety rules with no default remote dependencies
- avoid `.truthmark/index.json`
- avoid any required Portal package or CLI

This gives humans a useful browsable site while preserving Truthmark's core model: branch-local Markdown is canonical, generated surfaces are presentation, and agents inspect the checkout directly.
