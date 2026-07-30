---
status: active
doc_type: standard
last_reviewed: 2026-05-30
source_of_truth:
  - default-principles.md
  - documentation-governance.md
  - testing-and-verification.md
  - https://www.iso.org/standard/74393.html
  - https://www.iso.org/standard/72089.html
  - https://www.iso.org/standard/63712.html
  - https://www.iso.org/standard/78176.html
  - https://c4model.com/
  - https://docs.arc42.org/home/
  - https://sre.google/sre-book/monitoring-distributed-systems/
  - https://spec.openapis.org/oas/latest.html
  - https://semver.org/
  - https://diataxis.fr/
---

# Template Standards

## Scope

This standard explains why Truthmark's default truth-document templates are suitable bootstrap templates for professional software engineering repositories.

The templates are not certifications, and Truthmark does not claim that a generated repository is compliant with any external standard by installing them. The templates are intentionally lightweight Markdown scaffolds that align with widely recognized software engineering documentation practices while leaving project-specific standards in the adopting repository.

## Default Template Baseline

Truthmark's default truth-document templates cover six common engineering documentation surfaces:

- behavior docs for implemented product or system behavior
- contract docs for API, CLI, file, event, or integration contracts
- architecture docs for system structure, boundaries, components, and cross-cutting constraints
- workflow docs for triggers, inputs, execution steps, retry behavior, and outputs
- operations docs for runtime topology, configuration, permissions, deployment, rollback, availability, and observability
- test-behavior docs for fixtures, execution model, assertions, isolation, and failure semantics

Every default template includes the same governance foundation:

- frontmatter status and review metadata
- a declared source-of-truth list
- purpose and scope
- evidence-oriented guidance for default sections
- explicit current-state content rather than roadmap content
- active decisions and rationale
- non-goals to prevent scope creep
- maintenance notes for future reviewers and agents

`truthmark init` may refresh these Truthmark-owned default template sections as the baseline improves. Existing template preambles/frontmatter are preserved on rerun so repository-owned metadata, titles, and local introductory guidance do not churn or get replaced just because the default baseline changed. Repository-specific custom `##` sections are not part of the default baseline; init preserves them and keeps their authored order relative to the next default section that followed them.

This foundation follows Truthmark's repository-truth model: current implementation, reusable standards, architecture, and future proposals must not compete as parallel sources of authority.

## External Standard Alignment

| Truthmark template surface | External practice or standard alignment | Why the alignment matters |
| --- | --- | --- |
| Architecture | ISO/IEC/IEEE 42010, arc42, C4 Model | Architecture docs should make system role, boundaries, components, ownership, and quality constraints explicit instead of mixing structure with ordinary feature behavior. |
| Behavior | ISO/IEC/IEEE 29148, ISO/IEC/IEEE 12207, Diátaxis | Behavior docs should state current system behavior, rules, states, and constraints in a form maintainers can review and agents can update with implementation changes. |
| Contract | ISO/IEC/IEEE 29148, OpenAPI Specification, Semantic Versioning | Contract docs should separate inputs, outputs, diagnostics, compatibility rules, and migration/versioning expectations so external interfaces remain reviewable. |
| Workflow | ISO/IEC/IEEE 12207, Diátaxis | Workflow docs should capture triggers, inputs, steps, failure behavior, and outputs as current operational behavior rather than as hidden process memory. |
| Operations | ISO/IEC/IEEE 25010, Google SRE practices | Operations docs should make runtime topology, configuration, permissions, rollback, availability, and observability visible as maintainable repository truth. |
| Test behavior | ISO/IEC/IEEE 12207, Truthmark testing-and-verification standard | Test-behavior docs should describe the test surface, data model, assertions, isolation rules, and failure semantics needed to keep verification meaningful. |

## Justification For The Template Shape

Truthmark defaults are justified because they optimize for the reviewable artifacts software teams need after AI-assisted changes:

1. **Traceability:** `source_of_truth` metadata and routing docs make it clear which code, docs, or standards support a claim.
2. **Single responsibility:** each template asks for a bounded document scope so one file does not become a feature manual, architecture note, changelog, and operations runbook at once.
3. **Current-state authority:** sections are written for implemented behavior and active decisions, not historical plans or desired futures.
4. **Decision capture:** `Product Decisions` and `Rationale` preserve non-obvious tradeoffs without requiring a separate ADR process for every small behavior decision.
5. **Interface discipline:** contract templates isolate inputs, outputs, diagnostics, compatibility, and migration rules, matching how professional teams review public interfaces.
6. **Operational readiness:** operations templates include configuration, permissions, deployment, rollback, availability, and observability because production behavior is part of repository truth.
7. **Verification discipline:** test-behavior templates and the testing standard keep assertions, fixtures, isolation, and failure semantics explicit.
8. **Override safety:** defaults are bootstrap guidance only; mature projects should replace or extend them with project-specific standards when those standards are clearer.

## Reference Notes

- ISO/IEC/IEEE 42010 supports the architecture-template focus on concerns, boundaries, viewpoints, and architecture rationale.
- ISO/IEC/IEEE 29148 supports the behavior and contract-template focus on requirements, constraints, interfaces, and traceable statements.
- ISO/IEC/IEEE 12207 supports the lifecycle-template focus on processes, implementation, verification, operation, and maintenance.
- ISO/IEC 25010 supports cross-cutting quality attributes such as maintainability, reliability, usability, security, and portability.
- C4 and arc42 provide practical, industry-adopted architecture-documentation shapes that map well to Truthmark's architecture sections.
- OpenAPI and Semantic Versioning provide practical anchors for contract shape, compatibility, and migration language.
- Google SRE practices justify keeping availability, observability, rollback, and operational behavior explicit.
- Diátaxis reinforces the separation between explanation, reference, how-to, and tutorial content; Truthmark uses that principle to avoid mixed-purpose truth docs.

## Non-Goals

- Truthmark templates do not replace project-specific engineering standards.
- Truthmark templates do not certify compliance with ISO, IEEE, OpenAPI, SRE, C4, arc42, SemVer, or Diátaxis.
- Truthmark templates do not require every repository to keep every document kind.
- Truthmark templates do not make roadmap proposals canonical current truth.

## Maintenance Notes

Update this standard when Truthmark adds, removes, renames, or materially changes default truth-document templates, or when the references behind the default template rationale change.

When changing default template content, keep `docs/truthmark/templates/*.md`, `src/templates/init-files.ts`, `docs/standards/default-principles.md`, and this standard aligned.
