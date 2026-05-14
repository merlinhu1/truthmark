# RepoAgent, ai-doc-gen, and TruthMark

Focused product and implementation comparison for improving TruthMark.

This is a non-canonical research note. It is intentionally outside `docs/` so it does not compete with TruthMark's current-state product documentation.

## Evidence Base

This report is based on source inspection, not README reading alone.

Key files reviewed:

- RepoAgent: `repo_agent/runner.py`, `repo_agent/doc_meta_info.py`, `repo_agent/file_handler.py`, `repo_agent/change_detector.py`, `repo_agent/chat_engine.py`, `repo_agent/prompt.py`, `repo_agent/project_manager.py`, `repo_agent/multi_task_dispatch.py`
- ai-doc-gen: `src/agents/analyzer.py`, `src/agents/documenter.py`, `src/agents/ai_rules_generator.py`, `src/agents/prompts/analyzer.yaml`, `src/agents/prompts/documenter.yaml`, `src/agents/tools/dir_tool/list_files.py`, `src/agents/tools/file_tool/file_reader.py`, `src/handlers/analyze.py`, `src/handlers/readme.py`, `src/handlers/cronjob.py`, `src/utils/prompt_manager.py`, `src/utils/worker_pool.py`
- TruthMark: `src/agents/truth-document.ts`, `src/agents/truth-sync.ts`, `src/agents/truth-structure.ts`, `src/agents/truth-check.ts`, `src/agents/instructions.ts`, `src/checks/areas.ts`, `src/routing/area-resolver.ts`, `src/sync/surfaces.ts`, `src/sync/classify.ts`, `src/checks/check.ts`, `docs/truth/installed-workflows.md`, `docs/architecture/module-map.md`

## Executive Synthesis

RepoAgent's main value is not "AI writes docs." Its real value is that it builds a persistent repository model at the symbol level, tracks relationship changes, and uses that state to regenerate only the documentation units that became stale.

ai-doc-gen's main value is not deep static understanding. Its real value is a simple, operator-friendly pipeline that turns a repo into reusable AI-facing analysis artifacts and then reuses those artifacts to generate higher-level documentation and assistant instruction files.

TruthMark's current value is different from both. It is strongest where the other two are weakest: truth ownership, documentation boundaries, canonical destinations, and agent workflow constraints. Its main gap is that its repository understanding is still shallow. It knows routes, files, and changed surfaces well enough to govern truth updates, but it does not yet maintain a semantic model of the codebase that can drive better context selection, impact analysis, or grounded explanation.

The highest-leverage direction is to combine RepoAgent's persistent impact model with ai-doc-gen's staged analysis artifact pattern, while preserving TruthMark's stronger truth-routing and write-boundary model.

## 1. What Each Project Is Really Trying To Do

| Project | Core user value | Main problem solved | Intended workflow | Repository assumptions | Optimized output | Developer experience |
| --- | --- | --- | --- | --- | --- | --- |
| RepoAgent | Keep detailed internal code documentation synchronized with a Python repository at object granularity. | Internal docs rot because nobody updates function and class explanations after code changes. | Parse the repo into objects, extract references, generate docs per object, persist metadata, then rerun incrementally on later code changes. | Git repo, Python source, willingness to keep `.project_doc_record` and generated markdown in-repo, staged-change oriented workflow. | Per-file and per-symbol markdown docs under `markdown_docs/`, backed by persistent metadata. | Automation-first. It fits a pre-commit flow and tries to make documentation maintenance feel like a side effect of normal git usage. |
| ai-doc-gen | Produce usable high-level documentation and AI onboarding artifacts quickly with minimal repository-specific engineering. | Repositories often lack a current README, AI context files, and analysis notes that help both humans and models understand the codebase. | Run `analyze` to emit `.ai/docs/*.md`, then run `generate readme` or `generate ai-rules`, optionally through cron automation. | Repo is inspectable through directory listing plus targeted file reads; LLM can infer structure from code cues; generated analysis docs are acceptable intermediates. | AI-facing analysis markdown, README.md, CLAUDE.md, AGENTS.md, Cursor rules. | Operator-driven and approachable. The user runs explicit commands and gets high-level artifacts without needing a persistent semantic model. |
| TruthMark | Keep canonical repository truth current, bounded, and writable by agents without losing ownership or trust. | Docs drift because teams lack a stable answer to "what doc owns this behavior" and agents lack hard boundaries on what they may update. | Configure docs topology, install workflow surfaces, let agents inspect the checkout directly, then use Truth Sync / Document / Structure / Check to maintain truth. | Teams want branch-local markdown as canonical truth; agents can inspect code directly; routing metadata can map behavior to bounded truth docs. | Canonical truth docs, route files, installed agent workflow surfaces, diagnostics. | Governance-first and agent-native. It optimizes for correct placement and safe maintenance of truth, not for automatic narrative generation. |

### Bottom line

- RepoAgent is a repository model plus incremental invalidation engine that happens to output docs.
- ai-doc-gen is a staged LLM analysis-and-generation pipeline that happens to work on repositories.
- TruthMark is a truth-governance system for repositories that happens to install agent workflows.

That difference matters. TruthMark should not copy either product wholesale. It should borrow the parts that deepen repository understanding and improve grounded generation while keeping its stronger truth-ownership model intact.

## 2. Core Capability Comparison

| Capability | RepoAgent | ai-doc-gen | TruthMark today | What TruthMark should do |
| --- | --- | --- | --- | --- |
| Repository understanding | Builds a persistent tree of files, classes, functions, and nested functions in `MetaInfo` / `DocItem` using Python AST plus Jedi references. Strong local semantics, but Python-only. | Builds no persistent semantic model. The analyzers start from directory listing plus on-demand file reads, so understanding mostly lives inside the LLM run. Broadly portable, but low determinism. | Understands repos mainly through path classification, routing metadata, changed-surface excerpts, and direct agent inspection. Strong ownership model, shallow code semantics. | Adapt RepoAgent's persistent model idea, not its Python-specific implementation. TruthMark needs a language-aware but language-agnostic index layer. |
| Codebase summarization | Summarizes at object level, then assembles file markdown from object docs in `Runner.markdown_refresh`. Granular, but verbose and not optimized for repo-level synthesis. | Specialized analyzer agents each write one analysis artifact with fixed section shapes. Good repo-level summaries, but quality depends heavily on prompt execution. | Produces no first-class codebase summary artifact. It expects the acting agent to inspect code and write/update truth docs directly. | Copy ai-doc-gen's idea of reusable analysis artifacts, but generate them from a stronger grounding layer and keep them non-canonical. |
| Documentation generation | Generates docs object-by-object with `ChatEngine.generate_doc`, using code plus caller/callee context. High locality, but can create a lot of surface area. | Generates high-level docs from analysis artifacts and optional existing docs. Easier to read, easier to adopt, but less precise about code units. | Generates workflow instructions and report shapes, not first-class repository explanations. Truth docs are agent-written manual outputs. | Adapt both: use smaller, evidence-rich context packs to generate bounded truth docs or summaries when helpful, not per-symbol markdown by default. |
| File and module relationship discovery | Explicitly models parent/child and reference edges in `DocItem`, `parse_reference`, and `find_all_referencer`. | Relationship discovery is inferred in prompts; no stored graph. | Models doc ownership relationships, not module relationships. `resolveAreaRouting` and `checkAreas` reason about code-surface coverage, not imports or symbol references. | Copy RepoAgent's idea of stored relationships, but use module/import/reference edges rather than only doc routing. |
| Code structure extraction | `FileHandler.generate_overall_structure` walks Python files and extracts functions/classes from AST. Deterministic. | `ListFilesTool` gives a grouped directory map; structure is inferred by the LLM. No parser-backed structure extraction. | Knows directory and code-surface boundaries, not symbol structure. | Adapt RepoAgent's parser-backed extraction for the languages TruthMark cares about most first, starting with TS/JS. |
| Dependency or call relationship extraction | Jedi reference lookup approximates call/reference relationships across files. Useful for doc invalidation, but not a complete call graph and tied to Python symbol resolution. | Dependency analysis is prompt-driven. It may read manifests and imports, but there is no extracted dependency graph. | No built-in dependency or call graph extraction. | Adapt RepoAgent's relationship extraction concept into a lighter import/reference graph; avoid claiming full call-graph precision unless the parser supports it. |
| Incremental update behavior | Strongest of the three. `MetaInfo.load_doc_from_older_meta` compares code content and referencer sets to mark items stale (`code_changed`, `add_new_referencer`, `referencer_not_exist`). | Weak. Regeneration is command-level. Cron logic only decides whether a repo should be analyzed again; it does not compute impacted docs inside the repo. | Medium. `buildChangedSurfaces` narrows changed code to segments, and routing narrows which docs matter, but there is no semantic invalidation or impacted-symbol reasoning. | Copy RepoAgent's invalidation idea. TruthMark should compute impacted docs from changed paths plus module/symbol edges, not just path routing. |
| Context construction for LLMs | Strong local context: prompt includes code, project structure, referenced objects, referencer objects, and prior docs. Good grounding, high token cost. | Prompt context is staged: repo structure summary, reusable `.ai/docs` files, optional existing docs, and tool-based file reads. Scales in workflow simplicity, less in determinism. | Context is mostly workflow text plus changed-surface excerpts and routing docs. Excellent write-boundary control, weaker semantic grounding. | Adapt both: TruthMark needs a dedicated context builder that selects impacted code, owning docs, neighboring modules, tests, and evidence snippets. |
| Prompt design and output shaping | One dense prompt template with deterministic-tone instructions and a fixed object-doc format. Simple, but narrow. | YAML prompt library, specialized agent roles, fixed output section contracts, and Pydantic structured outputs for some generators. Stronger prompt maintainability. | Prompting is aimed at workflow behavior, not repository summarization or explanation generation. Output shaping is strongest for reports, not docs. | Copy ai-doc-gen's explicit prompt library and structured outputs for generation flows; keep TruthMark's workflow prompts separate from content prompts. |
| Handling large or complex repositories | Good incremental behavior helps after the first run, but full AST/Jedi graphing can be expensive and only works for Python. | Concurrency helps throughput, but repeated LLM-driven rediscovery can become expensive and inconsistent in large repos. | Bounded docs and routing keep the human/agent task small, but there is no index to deepen understanding without reopening the repo repeatedly. | Adapt RepoAgent's persistence and ai-doc-gen's staged artifacts, but make caches advisory and non-authoritative. |
| Maintaining consistency across generated documentation | Consistency comes from one prompt plus one persistent per-object store. Good local consistency, limited repo-level narrative consistency. | Consistency comes from staged analysis docs, shared prompt templates, and reuse of existing files. Better repo-level coherence, but analysis artifacts can drift together. | Strongest on destination and ownership consistency. Weakest on style and explanatory consistency because there is no shared analysis artifact or claim model. | Copy ai-doc-gen's staged consistency pattern, but tie it to source-grounded artifacts and TruthMark's routing. |
| Avoiding hallucinated or stale documentation | Better than prompt-only tools because it uses direct code and references, but there is little post-generation validation beyond stale-item detection. | Weakest here. The system is disciplined, but most claims are still LLM-synthesized from ad hoc file reads with no semantic validator. | Strong on process boundaries: current behavior only, bounded truth owners, checker diagnostics. Weak on validating whether a generated explanation is actually supported by source. | TruthMark should add evidence-backed claim validation and impacted-doc checks. This is its best chance to exceed both projects. |
| Developer-facing usability | Very effective once set up, but operationally heavy: git staging assumptions, fake-file handling, Python limitation, lots of generated markdown. | Best immediate usability: clear commands, obvious outputs, optional cron automation. | Best governance usability for AI-native teams, but not yet the best explanatory usability because it does not help agents build deep repo understanding. | Adapt ai-doc-gen's operator-visible analysis workflow and preview surfaces, but preserve TruthMark's stricter truth boundaries. |

## 3. Implementation Comparison Focused On Core Value

### RepoAgent: the core patterns behind the value

RepoAgent's decisive implementation choice is to treat a repository as a persistent graph of documentation units.

- Repository traversal and file selection: `FileHandler.generate_overall_structure` walks the target repo, filters through `.gitignore`, and parses Python files into object lists. `ChangeDetector` and `make_fake_files` then bias the system toward staged and unstaged git changes instead of whole-repo regeneration.
- Internal representation: `MetaInfo` stores a tree of `DocItem` nodes for repo, directories, files, classes, functions, and nested functions. Each node keeps source span, prior markdown, relationship lists, status, depth, and task metadata.
- Relationship extraction: `parse_reference` plus Jedi-based `find_all_referencer` construct `reference_who` and `who_reference_me` edges. This is the key to RepoAgent's incremental logic: it does not only care that a file changed, it cares whether an object's callers or callees changed.
- LLM context building: `ChatEngine.build_prompt` combines the current object's code, referenced-object code/docs, referencer code/docs, and project structure. This is far better grounded than a repo-level summary prompt because the generation unit is narrow and contextually rich.
- Incremental update behavior: `MetaInfo.load_doc_from_older_meta` reuses prior docs, compares old and new code content, reparses relationships, and marks items stale when code or referencer sets changed.
- Task decomposition: `get_topology` and `TaskManager` produce dependency-aware generation order so leaf objects and dependencies can be documented before higher-level dependents.
- Intermediate state: checkpoints in `.project_doc_record` make repo analysis persistent rather than rediscovered every run.

The tradeoff is equally clear.

- It is strongly coupled to Python semantics (`ast`, Jedi, `.py`-only structure walk).
- It mutates working tree state in a way TruthMark should not copy (`make_fake_files`, automatic staging of generated docs).
- It optimizes for exhaustive code explanation, not canonical product truth.

### ai-doc-gen: the core patterns behind the value

ai-doc-gen's central pattern is a staged analysis pipeline with reusable AI-facing artifacts.

- Repository traversal and file selection: `ListFilesTool` produces a grouped directory listing with extensive ignore rules; `FileReadTool` allows bounded line-based reads. There is no parser-backed symbol extraction.
- Internal representation: the main intermediate representation is markdown analysis artifacts in `.ai/docs/` rather than a graph structure. This is the defining architectural choice.
- Analyzer decomposition: `AnalyzerAgent.run` spins up independent agents for structure, dependencies, data flow, request flow, and API analysis. Each agent has a role-specific system prompt and a fixed markdown output contract in `analyzer.yaml`.
- Context building: `_render_prompt` injects repo path plus full repo structure string. The LLM can then call `Read-File` and `List-Files-Tool` during the run.
- Documentation generation: `DocumenterAgent` reads the available `.ai/docs/*.md` files and optionally an existing README, then writes `README.md` using a Pydantic output model. `AIRulesGeneratorAgent` reuses the same pattern for `CLAUDE.md`, `AGENTS.md`, and Cursor rules.
- Output shaping and constraints: prompts live in YAML, output schemas use Pydantic models for several generators, and there are simple postchecks such as required analysis-file presence and `AGENTS.md` line-count warnings.
- Update behavior: it can reuse existing generated files as references, but it does not compute semantic impact or stale regions inside the repo. The `cronjob` path only decides whether a repository should be reanalyzed and then opens an MR.

This produces a much simpler product experience than RepoAgent, but the implementation tradeoff is real: understanding is mostly ephemeral and prompt-carried.

- There is no stored module or symbol graph.
- Relationship discovery is largely inferred rather than extracted.
- Generated analysis files are useful, but if they are wrong, downstream README or AI rules can inherit the same error.

### TruthMark: what the current implementation is optimized for

TruthMark is currently optimized for documentation topology and workflow discipline, not semantic repository analysis.

What is helping it:

- Routing as a first-class concept: `resolveAreaRouting` and `checkAreas` turn docs ownership into an explicit, checkable mapping between code surfaces and truth docs.
- Strong boundary model: `truth-document.ts`, `truth-sync.ts`, `truth-structure.ts`, and `truth-check.ts` encode what agents may inspect, write, and report.
- Bounded change context: `buildChangedSurfaces` narrows code-change context to diff segments or excerpts instead of forcing whole-file rereads.
- Practical repo-wide validation: `runCheck` combines authority, routing, doc structure, links, decision sections, and generated-surface diagnostics into one truth-health pass.
- Path classification as a useful coarse filter: `classifyPath` is a pragmatic way to distinguish functional code, markdown, config, derived surfaces, and ignored files.

What is limiting it:

- No semantic index: there is no stored representation of modules, symbols, imports, references, or flows.
- No reusable analysis artifacts: each agent session reconstructs understanding from code, route files, and docs.
- Weak prompt/context boundary: workflow prompt rendering lives in `src/agents/*`, but there is no separate system for building evidence packs for documentation tasks.
- Trust checks operate at topology level more than claim level: TruthMark can tell you whether a doc exists, is routed, and has the right sections; it cannot yet tell you whether a specific explanation is actually grounded in source.

Where abstraction boundaries are weak:

- Repository understanding is spread across `src/checks`, `src/routing`, `src/sync`, and ad hoc agent instructions rather than centered in one reusable analysis layer.
- `src/agents` currently mixes workflow contracts, prompt text, and examples. That is reasonable for installed skills, but it is not the right place for future semantic context selection.
- The changed-surface logic is useful but isolated. It is not joined with a module/symbol graph or doc-claim model.

Where repository understanding could become deeper:

- module import graph
- exported symbol index
- inbound and outbound reference map
- test-to-module associations
- config and generated-surface ownership graph
- documentation claim to source-span mapping

Where generated outputs could become more useful and trustworthy:

- generate compact non-canonical analysis artifacts that summarize a bounded area with evidence links
- build context packs for Truth Sync and Truth Document automatically
- validate doc claims against extracted symbols, imports, routes, and changed surfaces before writing
- preserve TruthMark's bounded-leaf-doc model while making the content inside those docs more reliably grounded

## 4. What Makes RepoAgent Valuable

RepoAgent is valuable because it makes documentation maintenance stateful.

Its central workflow is:

1. Parse the repository into a persistent hierarchy of documentation units.
2. Extract cross-object relationships.
3. Generate docs at a small unit of work.
4. Persist both the docs and the semantic state.
5. On the next run, invalidate only the units affected by code or relationship changes.

That is the strongest lesson in the whole comparison.

### How RepoAgent models a repository

It uses a tree of `DocItem` nodes plus relationship edges and status fields. That is richer than a file list and more actionable than a one-shot summary because it supports downstream reasoning such as:

- which object changed
- which dependents must be reconsidered
- which docs can be safely reused
- which tasks can run concurrently

### How it decomposes documentation tasks

RepoAgent does not ask the LLM to explain the whole repository. It asks it to explain one code object with caller/callee context. That is a far better fit for grounded generation.

### How it handles code relationships

It explicitly stores bidirectional references. That matters because many documentation changes are caused by relationship changes, not just body edits.

### How it uses agents or LLM calls

It is not really a multi-agent system. It is a task scheduler around one documentation generation prompt. The intelligence is in state management, not role decomposition.

### How it updates documentation

`load_doc_from_older_meta` is the key implementation. It merges prior docs into the new parse, compares code content, reparses references, and reclassifies stale items. That is the part TruthMark should learn from.

### What would be useful for TruthMark

- Persistent semantic state, especially impacted-item invalidation.
- Reference-aware context packs for generation and review.
- Small-unit generation rather than whole-repo prompting.
- Explicit dependency-aware scheduling when multiple bounded truth docs need regeneration.

### What is too heavyweight or misaligned

- Fake-file manipulation and staging mutations.
- Per-symbol markdown as the primary product surface.
- Python-only AST and Jedi dependency.
- Generating large parallel doc trees instead of maintaining bounded canonical truth.

### Top lessons TruthMark should take from RepoAgent

1. Persistent repository state is more valuable than another clever prompt.
2. Relationship change detection matters at least as much as file change detection.
3. Small, evidence-rich generation units beat whole-repo narrative generation for trust.

## 5. What Makes ai-doc-gen Valuable

ai-doc-gen is valuable because it turns repository analysis into reusable artifacts that other documentation tasks can build on.

### Its central workflow

The workflow is simple and productive:

1. Analyze the repository into a small set of AI-facing documents.
2. Use those documents to generate higher-level human-facing and AI-facing outputs.
3. Optionally automate the process over multiple repos.

That separation of analysis from final output is the best thing in ai-doc-gen.

### Documentation generation strategy

It treats `.ai/docs/*.md` as a working knowledge layer. README generation and AI-rule generation consume those artifacts instead of rediscovering the repo each time.

### Code parsing or analysis approach

There is little hard parsing. The repo is explored through directory listing and bounded file reads; the actual structural interpretation is prompt-driven. That makes it flexible across stacks, but the semantic depth is lower than RepoAgent's.

### LLM prompting strategy

The prompts are well-factored. Each analyzer role has a defined purpose and required output sections. This makes the pipeline maintainable and easier to tune than one monolithic prompt.

### Output format and user experience

The outputs are practical:

- `.ai/docs/*.md` for machine-readable repository knowledge
- `README.md` for humans
- `CLAUDE.md`, `AGENTS.md`, Cursor rules for AI assistant onboarding

That is a strong user experience because the outputs line up with actual developer jobs.

### Simplicity versus RepoAgent

Compared with RepoAgent, ai-doc-gen is much simpler and more portable, but also less deterministic. It wins on adoption friction and loses on semantic precision.

### What would be useful for TruthMark

- A reusable intermediate artifact layer.
- Prompt libraries with explicit section contracts.
- Structured outputs for generated artifacts.
- Existing-doc reuse as context, with explicit warnings that existing docs may be stale.

### What is too narrow, brittle, or misaligned

- LLM-only analysis without a semantic index.
- Reusing analysis artifacts without source-backed validation.
- Treating generated AI guidance files as if they were canonical truth.

### Top lessons TruthMark should take from ai-doc-gen

1. Separate repository analysis artifacts from final documentation artifacts.
2. Use reusable prompt contracts and structured outputs instead of ad hoc text generation.
3. Make the workflow obvious to operators: analyze, preview, generate, review.

## 6. TruthMark Improvement Analysis

TruthMark should prioritize improvements that deepen source-grounded understanding without weakening its truth-governance model.

### 1. Add a semantic repository index

Today TruthMark knows where truth should live, but not enough about the code itself. Add a language-aware repository index that stores files, modules, exports, imports, tests, and selected symbol/reference edges.

This is the single biggest upgrade because it improves Truth Structure, Truth Document, Truth Sync, and Truth Check at the same time.

### 2. Add relationship-aware impact analysis

Current Truth Sync can narrow to changed surfaces, but it still lacks a principled way to answer "which docs are probably stale because this module's role changed?" TruthMark should compute impacted docs from:

- changed paths
- owning areas
- imported and importing modules
- routed contracts
- nearby tests

### 3. Introduce non-canonical analysis artifacts

TruthMark should not turn canonical docs into scratchpads. But it should create optional, non-canonical, derived analysis artifacts that help agents and maintainers build context faster. These should be clearly derived and never treated as authority.

### 4. Build a dedicated context-pack layer

Right now context building is scattered across routing docs, changed-surface excerpts, and manual agent behavior. TruthMark should centralize the assembly of evidence packs for tasks like:

- Truth Sync on changed code
- Truth Document for undocumented behavior
- Truth Structure for overloaded areas
- Truth Check for audit of a specific area

### 5. Add source-grounding and claim validation

TruthMark already validates topology. It should also validate whether generated doc claims have supporting source evidence. Even a lightweight validator would materially improve trust.

### 6. Make generated explanations more useful

TruthMark's generated surfaces are excellent at telling agents what not to do. They are not yet equally strong at helping agents build accurate, concise explanations of what the code is doing. A better analysis-and-context layer would fix this.

### 7. Preserve the current product boundary

TruthMark should not become another README generator or per-function doc generator. Its differentiation is stronger: canonical truth ownership plus grounded agent workflows. Improvements should reinforce that identity.

## 7. Recommended Architecture Changes For TruthMark

### Proposed pipeline

```text
discover files
  -> classify files
  -> parse language-specific structure
  -> build repository graph
  -> join graph with TruthMark routing
  -> compute impacted docs / areas
  -> build task-specific context pack
  -> generate or update truth docs
  -> validate grounding and route ownership
  -> persist derived index/cache
```

### Better internal representation of repository structure

TruthMark should add a reusable `RepoIndex` layer.

```ts
type RepoIndex = {
  snapshotId: string;
  files: Map<string, FileNode>;
  modules: Map<string, ModuleNode>;
  symbols: Map<string, SymbolNode>;
  edges: Edge[];
  routedAreas: RoutedAreaNode[];
  docs: DocArtifact[];
};

type Edge =
  | { kind: "imports"; from: string; to: string }
  | { kind: "exports"; from: string; to: string }
  | { kind: "references"; from: string; to: string }
  | { kind: "tested-by"; from: string; to: string }
  | { kind: "owned-by-area"; from: string; to: string };
```

This does not need to start as a full cross-language symbol graph. A pragmatic first version for TS/JS plus coarse import edges would already move TruthMark forward materially.

### Clearer pipeline boundaries

Suggested module boundaries:

- `src/index/discover.ts`: collect files and classify candidate code surfaces
- `src/index/parsers/*`: language-specific structure extraction
- `src/index/graph.ts`: build module and symbol graph
- `src/index/cache.ts`: persist derived snapshots under a clearly derived location
- `src/impact/compute.ts`: compute impacted modules, areas, and docs from diffs
- `src/context/builders/*`: build task-specific evidence packs
- `src/artifacts/*`: derived area summaries, module briefs, contract briefs
- `src/validate/grounding.ts`: check generated claims against source evidence
- `src/agents/*`: keep only workflow surface rendering and report examples

This would fix one of TruthMark's main current weaknesses: repository understanding is currently distributed across routing, sync, and check logic with no reusable semantic core.

### Possible graph or index layer

TruthMark does not need RepoAgent's exact per-object hierarchy, but it does need an impact-aware graph.

Start with:

- file node
- module node
- export symbol node
- import edge
- routed area edge
- truth doc edge
- test coverage edge

Later, add language-specific symbol references where the parser quality supports them.

### Stronger prompt/context-building layer

Add a `ContextPack` model for each workflow.

```ts
type ContextPack = {
  task: "truth-sync" | "truth-document" | "truth-structure" | "truth-check";
  changedFiles: string[];
  impactedModules: string[];
  owningAreas: string[];
  relevantDocs: string[];
  evidenceSnippets: Array<{ path: string; start: number; end: number; reason: string }>;
  openQuestions: string[];
};
```

Example behavior:

```ts
const impacted = computeImpact(diffPaths, repoIndex, routing);
const pack = buildTruthSyncContextPack({ impacted, repoIndex, routing });
const draft = generateTruthDocUpdate(pack);
const result = validateGrounding(draft, pack, repoIndex);
```

This is where TruthMark can combine RepoAgent's impact awareness with ai-doc-gen's staged-analysis practicality.

### Documentation or knowledge artifact model

TruthMark should distinguish:

- canonical truth docs: current, authoritative, bounded
- derived analysis artifacts: disposable, regenerable, AI-facing
- validation artifacts: reports, diagnostics, grounding results

That separation is one of the best ideas available from ai-doc-gen, and it fits TruthMark well as long as the derived artifacts are never mistaken for authority.

### Incremental regeneration strategy

Recommended strategy:

1. Diff files and build `ChangedSurface`s.
2. Map changed files to modules and routed areas.
3. Walk import/reference edges outward with a bounded radius.
4. Rank candidate truth docs by ownership and dependency proximity.
5. Build a context pack from top-ranked docs and evidence spans.
6. Update only those docs or block if routing is insufficient.

That is a better fit for TruthMark than RepoAgent's per-symbol invalidation, but it is clearly inspired by the same principle.

### Validation or source-grounding mechanisms

Suggested validation checks:

- every updated truth section references at least one source span or route owner
- added contracts correspond to current exported endpoints, schemas, or config fields
- changed behavior claims intersect changed or impacted modules
- doc updates that mention a new subsystem require either a new route mapping or an existing owning area

TruthMark already validates structure well. This would extend it into semantic trustworthiness.

## 8. What TruthMark Should Copy, Adapt, Or Avoid

| Decision | Pattern | Source | Why |
| --- | --- | --- | --- |
| Copy | Persistent impacted-item invalidation | RepoAgent | This is the most valuable implementation idea in the comparison. TruthMark needs a durable way to know what became stale after code changes. |
| Copy | Staged analysis artifacts separate from final outputs | ai-doc-gen | TruthMark needs reusable analysis context, but those artifacts should stay derived and non-canonical. |
| Copy | Prompt libraries with explicit output contracts | ai-doc-gen | TruthMark's future generation flows will be easier to maintain and test if prompts and output shapes are explicit rather than embedded ad hoc in workflow strings. |
| Adapt | Relationship-aware context packs | RepoAgent | The principle is right, but TruthMark should build module and ownership context packs, not per-function markdown generation prompts. |
| Adapt | Specialized analyzers by question type | ai-doc-gen | TruthMark can benefit from structure, dependency, and contract views, but they should be driven by a shared repo index instead of purely prompt-time rediscovery. |
| Adapt | Existing-doc reuse as context | ai-doc-gen | Valuable for preserving authored nuance, but TruthMark must continue treating code and routed truth as the authority over stale prose. |
| Adapt | Concurrent execution of independent analyses | RepoAgent and ai-doc-gen | Useful once TruthMark has discrete analysis tasks, but only after the index and impact layers exist. |
| Avoid | Fake-file swapping and staging-area mutation | RepoAgent | This is operationally risky and misaligned with TruthMark's agent-native, repo-safe posture. |
| Avoid | Per-symbol markdown as the primary documentation product | RepoAgent | TruthMark's product is canonical truth ownership, not exhaustive API-by-API narrative coverage. |
| Avoid | LLM-only repository understanding without a semantic index | ai-doc-gen | It is simple, but it would weaken TruthMark's trustworthiness and make large-repo behavior too prompt-dependent. |
| Avoid | Treating derived analysis docs as authoritative truth | ai-doc-gen | This would collapse the distinction that gives TruthMark its strongest product value. |

## 9. Prioritized Roadmap

### Immediate improvements

| Item | Expected benefit | Difficulty | Inspiration | Concrete implementation suggestion |
| --- | --- | --- | --- | --- |
| Add a first-pass `RepoIndex` for TS/JS modules and imports | Better context selection, impact analysis, and truth checks on the same codebase TruthMark is written in. | Medium | RepoAgent | Introduce `src/index/` and extract files, exports, imports, and test relations for TS/JS first. |
| Build `ImpactSet` computation for Truth Sync | More accurate doc targeting than changed-path routing alone. | Medium | RepoAgent | Join `buildChangedSurfaces` with route ownership and import edges to rank impacted docs. |
| Add task-specific `ContextPack` builders | Better grounded agent behavior without changing TruthMark's workflow model. | Medium | ai-doc-gen and RepoAgent | Add `src/context/builders/truth-sync.ts`, `truth-document.ts`, `truth-structure.ts`, and feed packs into installed prompt rendering or CLI previews. |
| Add a non-canonical analysis artifact format | Faster repeated analysis and more consistent explanations. | Low to Medium | ai-doc-gen | Emit derived area or module briefs under a clearly derived root, with version marker and source references. |

### Medium-term improvements

| Item | Expected benefit | Difficulty | Inspiration | Concrete implementation suggestion |
| --- | --- | --- | --- | --- |
| Add grounding validation for generated doc updates | Higher trust and lower hallucination risk. | Medium | TruthMark's existing checker model | Extend `truthmark check` or a new internal validator to verify source evidence for changed claims. |
| Expand the index from modules to selected symbols and contracts | Deeper repo understanding where it matters most. | Medium to High | RepoAgent | Add parser-backed export, route, schema, and contract extraction for supported languages. |
| Separate workflow prompts from content-generation prompts | Cleaner architecture and easier future extension. | Medium | ai-doc-gen | Keep `src/agents/` for workflow contracts and move content prompts into a dedicated prompt library plus output schema layer. |

### Long-term direction

| Item | Expected benefit | Difficulty | Inspiration | Concrete implementation suggestion |
| --- | --- | --- | --- | --- |
| Truth-aware semantic graph across multiple languages | Makes TruthMark materially better on large, polyglot repositories. | High | RepoAgent, generalized | Add parser adapters per language and normalize into one impact graph. |
| Evidence-backed canonical truth updates with claim-to-source links | Creates a stronger trust story than either comparison project. | High | Neither project fully solves this | Store doc claims with source spans and validate them on sync or check. |
| TruthMark as the canonical truth orchestrator for AI-native repos | Establishes a differentiated product identity rather than competing as another doc generator. | High | TruthMark's existing strengths | Keep route ownership and agent boundaries central, while using the semantic layer to make updates smarter and more grounded. |

## 10. Final Recommendation

- The most important thing RepoAgent teaches TruthMark is that repository understanding should be persistent and impact-aware, not rediscovered from scratch on each run.
- The most important thing ai-doc-gen teaches TruthMark is that reusable analysis artifacts and explicit prompt contracts materially improve downstream documentation workflows.
- The biggest current gap in TruthMark is the absence of a semantic repository model that connects changed code, module relationships, and truth-doc ownership.
- The highest-leverage next implementation step is to add a first-pass `RepoIndex` plus `ImpactSet` computation and use that to build Truth Sync context packs.
- The unique advantage TruthMark could develop is a system that combines canonical truth ownership, agent-safe write boundaries, semantic impact analysis, and source-grounded validation. Neither RepoAgent nor ai-doc-gen currently offers that combination.
