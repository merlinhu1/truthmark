# Truthmark Sync Report Template

Truthmark-managed generated file. Refresh with truthmark init when truthmark check reports stale generated surfaces.

Report completion in this shape:
```md
Truth Sync: completed

Changed code reviewed:
- src/auth/session.ts

Sync Intent:
- Changed code reviewed: src/auth/session.ts
- Affected route/truth owner: docs/truthmark/routes/areas.md
- Target truth docs: docs/truthmark/engineering/repository/bootstrap-routing.md
- Intended update: Update session timeout behavior.
- Evidence to verify: src/auth/session.ts:12 / docs/truthmark/routes/areas.md:11
- User-provided decisions/rationale: User rationale: session timeout behavior changed for internal implementation consistency
- No-update-needed rationale: not applicable; mapped truth is stale
- Blockers: none

Ownership reviewed:
- docs/truthmark/routes/areas.md

Truth docs updated:
- docs/truthmark/engineering/repository/bootstrap-routing.md

Decision/rationale captured:
- Placed user rationale in the mapped engineering truth doc under Engineering Decisions/Rationale.

Evidence checked:
- Claim: Session timeout behavior is documented in the mapped repository truth doc.
  Evidence: src/auth/session.ts:12 / docs/truthmark/routes/areas.md:11
  Result: supported

Notes:
- Updated session timeout behavior.
```
Blocked report example:
```md
Truth Sync: blocked

Reason:
- routing repair is not allowed

Files requiring manual review:
- docs/truthmark/routes/areas.md

Next action:
- update routing metadata and rerun Truth Sync
```
