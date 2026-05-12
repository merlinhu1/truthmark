---
status: active
doc_type: standard
last_reviewed: 2026-05-13
source_of_truth:
  - testing-and-verification.md
  - documentation-governance.md
---

# Pre-Completion Checklist

## Scope

Use this checklist before declaring Truthmark work complete.

## Checklist

- Did the change stay within the requested scope?
- If behavior, contracts, or workflow text changed, did the nearest canonical docs change in the same working change?
- If this was a major product, onboarding, install, command, positioning, or workflow change, did you review the root [README.md](../../README.md) and update stale user-facing claims, examples, or command sequences?
- If the root README changed materially, did the localized README variants change in the same working change? If not, stop unless you have an explicit repo-authorized reason they intentionally remain different, and state that reason. A passing verification command does not waive this gate.
- If canonical routing changed, did [docs/truthmark/areas.md](../truthmark/areas.md) change too?
- If [AGENTS.md](../../AGENTS.md) changed, did manual edits stay outside the managed Truthmark block?
- Did you run the narrowest meaningful verification command from [docs/standards/testing-and-verification.md](testing-and-verification.md)?
- If a normally expected verification step was skipped, did you state the reason explicitly?
- If the task was documentation-only, did you confirm whether Truth Sync should be skipped rather than run?
