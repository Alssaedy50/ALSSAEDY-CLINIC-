# AQSA7 — Phase 8.2 Clinic Dashboard

Status: IMPLEMENTED — PENDING CI GATE
Date: 2026-10-08
Base: Phase 8.1 merged commit `3062921e470b027d296bf93ea5d3393fae2e15ba`

## Objective

Create the daily operational home for ALSSAEDY CLINIC inside the existing Dental product workspace, using only existing repository-backed patient and receipt data.

## Implemented

- Added a clinic-local **الرئيسية** dashboard navigation entry.
- Made the Dental product entry land on the operational dashboard by default.
- Added quick actions for سند جديد, المرضى and السجل.
- Added live summary cards for registered patients, today's receipts, today's paid amount and today's outstanding balance.
- Added today's recent activity list.
- Added upcoming patient follow-up list from the existing `nextVisit` patient field.
- Reused `clinicRepositoryPatients()` and `safeHistory()`; no new persistence path or data store was introduced.
- Kept receipt issuance, patient management, history, settings and export workflows unchanged.

## Architecture boundary

The dashboard is a presentation/projection surface only:

IndexedDB → repository.js → storage.js data helpers → app.js dashboard projection → existing DOM

No dashboard-specific persistence, billing ledger, appointment engine or patient schema was introduced.

## Deliberate non-changes

Phase 8.2 does not implement:
- receipt redesign;
- service line-item redesign;
- financial ledger;
- appointment engine;
- patient workspace reconstruction;
- receipt void/cancel lifecycle;
- new repository/state/router.

## Acceptance criteria

- Dashboard is inside Dental product context.
- Dental product entry opens the dashboard.
- Dashboard uses existing repository-backed data.
- Quick actions route to existing workflows.
- No new persistence/state authority exists.
- Receipt surface remains reachable through **السندات**.
- Mobile layout remains single-column and touch-safe.
- Runtime Smoke verifies dashboard DOM and summary surfaces.

## Next task

**Phase 8.3 — Patient Workspace.**
