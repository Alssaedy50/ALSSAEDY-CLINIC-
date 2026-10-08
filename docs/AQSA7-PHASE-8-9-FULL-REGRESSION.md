# AQSA7 — Phase 8.9 Full Regression

Status: IN PROGRESS — required CI evidence pending
Date: 2026-10-09
Branch: `phase-8-9-full-regression`
Base `main` checkpoint: `b011ac760da2be95392a4d2b9d627ccf838febb7`

## Objective

Run the complete regression after Phase 8.2–8.8 clinic UX, patient workspace, visit/service billing, receipt lifecycle, financial history/ledger, mobile UX and print/PDF reconstruction. Preserve all established business and architecture boundaries.

## Re-verified predecessor

- Phase 8.8 documentation on `main` records COMPLETE.
- PR #65 is merged; merge commit `9309582937a5cf0bb45a58625784c1b85cc3a32c`.
- Current `main` checkpoint was verified as `b011ac760da2be95392a4d2b9d627ccf838febb7`.
- Existing Runtime Smoke already exercises the AQSA7 platform entry/workspace, PWA routes, patient workspace, visit/service line billing, receipt issue/edit/void, repository persistence, encrypted backup/recovery, provider adapters, RTL/BiDi, A5/A4/80mm, blank-template isolation and mobile/desktop layouts.
- Phase 8.8's physical paper/binding/ink/scale proof remains a manual print-shop responsibility.

## Regression work in this phase

- Reuse `.github/workflows/runtime-smoke.yml`; no new test framework or parallel test path.
- Add explicit regression assertions for date-range filtering, rejection of reversed date ranges, active-vs-voided financial summary semantics and rendering of the patient financial ledger.
- Keep synthetic data confined to browser smoke and preserve the existing cleanup.
- Run the required CI gates on the pull-request head: Runtime Smoke, Pages Source Verification, Receipt Export and Android Build.
- Inspect any failed required job's logs, fix the root cause, and rerun. External preview/deployment failures may only be considered non-blocking if they are clearly outside the required AQSA7 gates and documented.

## Architecture constraints

- `js/app.js` remains the route/context owner.
- `js/product.js` remains the Product/Tenant/Instance authority.
- `js/capabilities.js` remains the shared capability registry.
- `js/repository.js` + IndexedDB remain the only durable data authority.
- `js/storage.js` remains the Dental business behavior owner.
- `js/export.js` and the existing Android bridge remain the export/print/share boundary.
- No second router, repository, database, receipt store, financial persistence model, backup path or UI framework.
- Do not pull Phase 8.10 rendered UX acceptance into this phase.

## Required verification and exit criteria

1. Existing Phase 8.2–8.8 regression assertions remain green.
2. Date filters exclude records outside the requested range and reversed ranges are rejected.
3. Voided receipts remain in historical records but do not contribute to active financial totals.
4. The patient financial ledger remains a projection from existing receipt records.
5. Runtime Smoke passes on the final PR head.
6. Pages Source Verification passes on the final PR head.
7. Receipt Export passes on the final PR head.
8. Android Build passes on the final PR head.
9. Any required failures are inspected, corrected and rerun; no failure is waived without evidence.
10. PR is merged only after required gates pass, and the final `main` commit and this phase record are verified.

## Current decision

Phase 8.9 is **IN PROGRESS**. No pass or completion is claimed before the required CI runs finish. Phase 8.10 — Rendered UX Acceptance — remains the next phase only after the 8.9 gate is met.
