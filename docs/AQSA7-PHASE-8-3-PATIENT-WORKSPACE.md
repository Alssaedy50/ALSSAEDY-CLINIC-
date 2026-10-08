# AQSA7 — Phase 8.3 Patient Workspace

Status: IMPLEMENTED — PENDING CI GATE
Date: 2026-10-08
Base: Phase 8.2 merged main

## Objective

Reconstruct the patient experience as a persistent clinic workspace instead of a modal overlay, while preserving the existing patient repository, storage behavior, receipt linkage and route ownership.

## Implemented

- Converted the patient surface from a modal overlay into a product-local workspace inside the Dental workflow.
- Added a dedicated workspace header with:
  - مساحة المرضى
  - مريض جديد
  - العودة إلى الرئيسية
- Kept the existing patient directory search/filter and financial projections.
- Kept the existing patient detail view, medical profile fields and visit/receipt timeline.
- Kept existing patient actions: edit, delete, visit / new receipt and open historical receipt.
- Added a dedicated **مريض جديد** action that opens the existing patient editor without creating a new persistence model.
- Preserved existing patient IDs and `clinicRepositoryPutPatient()` / `clinicRepositoryDeletePatient()` authority.
- Kept financial totals derived from existing receipts; no new ledger was introduced.
- Updated navigation/back-state handling so `#patients` and `#patient-detail` address the workspace rather than a modal.
- Updated Runtime Smoke assertions and desktop patient-surface checks for the new non-modal contract.

## Architecture safety

No second:
- router;
- repository;
- persistence path;
- patient schema;
- billing ledger;
- receipt store;
- business state machine.

Existing route/context ownership remains in `js/app.js`. Existing patient/business behavior remains in `js/storage.js` and `js/repository.js`.

## Explicitly deferred

Phase 8.3 does not implement:
- Visit/service line-item reconstruction;
- Billing redesign;
- financial ledger;
- appointment engine;
- receipt reconstruction;
- physical voucher redesign;
- advanced reporting.

Those remain governed by Phases 8.4–8.10.

## Acceptance criteria

- Patient tab opens a persistent product-local workspace.
- The patient workspace is not a fixed modal.
- Dashboard and receipt surfaces remain separate.
- Patient directory and profile remain reachable without duplicating data.
- Existing patient financial projections remain derived from existing receipt history.
- New-patient creation uses the existing repository path.
- Mobile and desktop layouts remain responsive.
- Runtime regression verifies the new workspace boundary.

## Gate

Pending GitHub Actions:
- Runtime Smoke
- Pages Source Verification
- Receipt Image Export
- Android APK

## Next task

**Phase 8.4 — Visit / Services / Billing**, only after Phase 8.3 is green and merged.
