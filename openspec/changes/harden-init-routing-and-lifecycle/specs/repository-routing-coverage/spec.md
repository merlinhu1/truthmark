## ADDED Requirements

### Requirement: Repository-wide functional-code discovery
Truthmark Check SHALL evaluate every current Git-visible path classified as functional code regardless of its top-level directory. Coverage discovery SHALL NOT depend on a fixed list of conventional repository roots.

#### Scenario: Unmapped code under an unknown root
- **WHEN** `backend/auth/session.ts` exists, is not ignored, and matches no valid route
- **THEN** Check emits exactly one existing-shape `coverage` review diagnostic for that file
- **AND** routing coverage and ownership clarity do not report `pass`

#### Scenario: Mapped code under an unknown root
- **WHEN** `engine/runtime/main.rs` exists and a valid area maps `engine/runtime/**` to bounded truth ownership
- **THEN** Check emits no coverage diagnostic for that file

### Requirement: Checkout-aware shared discovery
Check and RepoIndex SHALL share a lightweight discovery primitive that returns normalized, sorted, deduplicated repository-relative paths from tracked files and untracked files not excluded by Git. Git enumeration MUST use NUL-delimited output and MUST preserve legal filename whitespace and quoting bytes. Git failure SHALL retain the existing local full-tree fallback.

#### Scenario: Untracked functional code
- **WHEN** an untracked functional source file is visible to Git and is not ignored
- **THEN** it participates in routing coverage and RepoIndex discovery

#### Scenario: Deleted tracked file
- **WHEN** a tracked functional source file is absent from the worktree
- **THEN** Check emits no live-file coverage diagnostic for the deleted path

#### Scenario: Git command unavailable
- **WHEN** Git-backed file enumeration cannot run
- **THEN** discovery uses the bounded full-tree fallback with the same normalization, Truthmark default/config ignore, classification, sorting, and deduplication rules
- **AND** the fallback MAY conservatively include paths that only `.gitignore` would exclude because Git ignore semantics are unavailable

#### Scenario: Filename contains whitespace or quoting bytes
- **WHEN** Git reports a legal repository filename containing tabs, newlines, leading or trailing spaces, or quoting-sensitive bytes
- **THEN** discovery preserves it as one exact repository-relative path without trimming or line splitting

### Requirement: Ignore behavior is consistent
The shared discovery contract MUST apply current default exclusions and configured Truthmark ignore patterns consistently. During successful Git enumeration, Git-ignored untracked files SHALL remain excluded and tracked files SHALL remain visible unless Truthmark configuration explicitly ignores them. During full-tree fallback, Truthmark SHALL apply default/config ignores and MAY conservatively include paths excluded only by Git ignore rules.

#### Scenario: Config-ignored generated code
- **WHEN** `generated/client.ts` exists and `generated/**` is in the Truthmark ignore list
- **THEN** neither Check coverage nor RepoIndex treats the file as an ownership candidate

#### Scenario: Git-ignored untracked output
- **WHEN** an untracked code-like file is excluded by `.gitignore`
- **THEN** the file is not discovered

### Requirement: Coverage excludes non-production surfaces
Coverage candidates MUST be existing, contained paths classified as functional code and MUST exclude recognized tests. Markdown, assets, generated Truthmark host surfaces, managed instruction files, package artifacts, and configured ignored paths SHALL not receive routing coverage diagnostics.

#### Scenario: Mixed repository surfaces
- **WHEN** a fixture contains an unmapped source file together with Markdown, images, generated host surfaces, `tests/**`, and supported `*.test.*` or `*.spec.*` files
- **THEN** only the ordinary functional source file receives a coverage diagnostic
- **AND** recognized tests remain available to RepoIndex and ImpactSet as test guidance

### Requirement: Coverage discovery remains bounded and deterministic
In a Git checkout, coverage discovery SHALL use one file-enumeration Git process, SHALL not parse source or Markdown bodies, and SHALL produce deterministic ordering. Candidate filtering SHALL be linear in discovered path count; the existing route-glob matching loop MAY remain unchanged.

#### Scenario: Repeated check on unchanged checkout
- **WHEN** Check runs repeatedly against the same checkout and config
- **THEN** discovered candidate order, coverage diagnostics, diagnostic indexes, and scorecard evidence remain stable
