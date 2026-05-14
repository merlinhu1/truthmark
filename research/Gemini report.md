# Documentation Tools Technical Comparison: RepoAgent vs ai-doc-gen vs TruthMark

## 1. What is each project really trying to do?

### RepoAgent
- **Core User Value:** Automated, comprehensive documentation generation for Python repositories with accurate dependency resolution.
- **Workflow:** Extracts Python AST, builds relationship graphs using static analysis (jedi), and incrementally updates documentation for only the changed files and their cascading dependents.
- **Assumptions:** The repository is Python-based (or cleanly parses into AST). The static analysis correctly reflects semantic relationships.

### ai-doc-gen
- **Core User Value:** Completely generic, LLM-driven repository understanding and documentation generation.
- **Workflow:** An AI agent leverages tooling (directory listing, file reading) to map out the codebase organically, guided by highly configurable Jinja2 templates, outputting strict Pydantic structures.
- **Assumptions:** LLMs with tool access can accurately build a semantic map of a repository without needing strict AST parsing.

### TruthMark
- **Core User Value:** Maintaining a canonical, synchronized truth representation for a repository, enforcing boundaries between functional code, documentation, and agent rules.
- **Workflow:** Explicit commands (`truthmark sync`, `truthmark document`) triggered when code changes, guided by a `.truthmark/config.yml` hierarchy.
- **Assumptions:** Documentation should be explicitly coupled to the codebase changes via routed areas. The developer is actively involved in the update loop rather than running a passive background batch job.

## 2. Core Capability Comparison

### Repository Understanding
- **RepoAgent:** Relies on structural `ast` parsing and `jedi`. Excellent for exact dependency trees but rigid and language-specific.
- **ai-doc-gen:** Uses LLM agents exploring file trees (`pydantic_ai` + `ListFilesTool`). Highly flexible but potentially hallucination-prone and relies heavily on context windows.
- **TruthMark:** Uses metadata routing (`areas.md`) to constrain the LLM's focus. 

### Documentation Generation
- **RepoAgent:** Batch generation traversing a dependency graph sequentially.
- **ai-doc-gen:** Prompt-orchestrated blocks built from Jinja2 templates, converting unstructured text directly into constrained models.
- **TruthMark:** Targeted syncs of specific routed documents based on actual git diffs.

## 3. Implementation Comparison Focused on Core Value

- **RepoAgent:** Uses strict OOP Python structures (`DocItem`) forming a `project_hierarchy.json`. Excellent for incrementality—when changing `foo()`, only `foo()` and its callers get updated.
- **ai-doc-gen:** Decouples prompts entirely into YAML files rendered via Jinja2 (`src/utils/prompt_manager.py`). 
- **TruthMark:** Current implementation leans on markdown parsing, frontmatter state, and route mapping (`routing/areas.ts`). 
- **Comparison:** TruthMark excels at "routing" but lacks the automatic relationship-mapping of RepoAgent. It is better structured for generic ecosystems than RepoAgent, but its context building is more primitive than ai-doc-gen's robust Jinja mappings.

## 4. What Makes RepoAgent Valuable?
RepoAgent's highest value is its incremental capability via static graph traversal. It knows exactly what files call other files. 
**Lesson for TruthMark:** To make TruthMark more trustworthy, TruthMark needs a way to detect cascading truth-changes. If routing `A` depends on routing `B`, changing `B` should optionally warn that `A` is stale.

## 5. What Makes ai-doc-gen Valuable?
ai-doc-gen excels at prompt engineering logic decoupling. By using Jinja2 templates stored as YAML, it isolates code from prompt logic, and enforces structured outputs via Pydantic.
**Lesson for TruthMark:** Dynamic prompt template rendering based on project state could greatly enhance TruthMark's flexibility during `truthmark sync`.

## 6. TruthMark Improvement Analysis
TruthMark must improve repository semantic understanding. Currently, relying purely on routing metadata is safe but limits the intelligence of the system. 
- **Recommendation:** Implement a lightweight structural map (similar to RepoAgent's hierarchy, but language-agnostic or using `lean-ctx` tree-sitter AST) to inform the LLM of cross-boundary file dependencies.

## 7. Recommended Architecture Changes for TruthMark
1. **Index Layer:** Introduce a background file graph that tracks import statements/dependencies. When running `truthmark check` or `sync`, this graph can flag un-routed dependencies.
2. **Template Engine:** Migrate hardcoded prompt strings into a templating engine (like `Handlebars` or native TS template literals mapped externally) to allow for easier dynamic context building.

## 8. What TruthMark Should Copy, Adapt, or Avoid

| Action | Pattern | Source | Why |
|--------|---------|--------|-----|
| **Copy** | Structured Validation | ai-doc-gen | Enforcing LLM responses into strict schemas ensures truth docs conform to the `.truthmark` schema. |
| **Adapt** | Dependency Graphs | RepoAgent | TruthMark should build a lightweight language-agnostic dependency graph to find "blast radius" for a truth sync, rather than pure AST. |
| **Avoid** | Agentic Discovery traversal | ai-doc-gen | TruthMark values deterministic boundaries. Letting an LLM blindly traverse raw directories is too brittle and breaks routing laws. |

## 9. Prioritized Roadmap

### Immediate
- **Strict Output Validation:** Adopt ai-doc-gen's strategy of strongly typing the LLM output (e.g., Zod schemas corresponding to TruthMark frontmatter/docs). 

### Medium-term
- **Prompt Architecture Engine:** Decouple prompt logic from agents into manageable templates. 

### Long-term
- **Language-Agnostic Blast Radius Mapping:** Implement a dependency graph (via `lean-ctx` tree-sitter) so `truthmark sync` knows exactly what routed areas might be affected by a code change.

## 10. Final Recommendation
- **RepoAgent teaches:** The power of deterministic state management over LLM generation (graph-based incrementality).
- **ai-doc-gen teaches:** The power of flexible template engines cleanly wrapping AI models.
- **Biggest Gap in TruthMark:** Knowing the cross-route dependencies within the code itself.
- **Highest Leverage Next Step:** Introduce schema-validated outputs for your generation pipelines to guarantee frontmatter and structure integrity.
