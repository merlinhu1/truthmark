# Truthmark Sync Report Template

Truthmark-managed generated file. Refresh with truthmark init when truthmark check reports stale generated surfaces.

Report completion in this shape:
```md
Truth Sync: completed

Changed code reviewed:
- src/auth/session.ts

Sync Intent:
- Changed code reviewed: src/auth/session.ts
- Affected route/truth owner: docs/truthmark/routes/areas/authentication.md
- Target truth docs: docs/truthmark/engineering/behaviors/session-timeout.md
- Intended update: Update session timeout behavior.
- Evidence to verify: src/auth/session.ts:12 / docs/truthmark/routes/areas/authentication.md:11
- User-provided decisions/rationale: User rationale: session timeout behavior changed for internal implementation consistency
- No-update-needed rationale: not applicable; mapped truth is stale
- Blockers: none

Ownership reviewed:
- docs/truthmark/routes/areas/authentication.md

Truth docs updated:
- docs/truthmark/engineering/behaviors/session-timeout.md

Decision/rationale captured:
- Placed user rationale in the bounded authentication behavior truth doc under Engineering Decisions/Rationale.

Evidence checked:
- Claim: Session timeout behavior is documented in the bounded authentication behavior truth doc.
  Evidence: src/auth/session.ts:12 / docs/truthmark/routes/areas/authentication.md:11
  Result: supported

Notes:
- Updated session timeout behavior.
```
Blocked report example:
```md
Truth Sync: blocked

Reason:
- Changed code maps only to the provisional bootstrap route.

Files requiring manual review:
- src/auth/**
- docs/truthmark/routes/areas/repository.md

Next action:
- Run Truth Structure for src/auth/** before updating behavior truth.
```
