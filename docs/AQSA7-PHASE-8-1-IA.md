# AQSA7 — Phase 8.1 Information Architecture

Status: COMPLETE — CLINIC LOCAL IA IMPLEMENTED
Date: 2026-10-08
Base: Phase 8.0 audit
Objective: establish a clear separation between Platform navigation, Dental product navigation and receipt-specific workflow controls.

## IA decision

The daily clinic user should not navigate through platform administration concepts to perform clinic work.

The hierarchy is:

AQSA7 Platform
→ Dental Clinic Product
→ ALSSAEDY CLINIC Instance
→ Clinic-local navigation
→ current workflow surface

The Phase 8.1 implementation keeps the existing route/state owner in `js/app.js`. No second router or state store was introduced.

## Navigation ownership

### Platform navigation
Visible only outside the Dental product:
- الرئيسية
- المنتجات والمشاريع

Owner remains:
- `js/app.js` route/context state
- existing platform shell

### Dental clinic navigation
Visible only inside the Dental product context:
- السندات
- المرضى
- السجل
- الإعدادات

The navigation is now physically located inside `#aqsa7ProductContext`, so clinic-local navigation is visually and semantically subordinate to the selected product instance.

Existing handlers remain authoritative:
- `activateAppTab('receipt')`
- `activateAppTab('patients')`
- `activateAppTab('history')`
- `activateAppTab('settings')`

### Receipt-specific workflow controls
The distinction between:
- سند رقمي
- نموذج ورقي

is no longer presented as global product navigation. It is located inside the Dental workspace and is explicitly labelled as receipt workflow tooling.

The paper-template concept remains separate from digital receipt issuance and is governed by the Phase 8.0 receipt contract.

## Deliberate non-changes

Phase 8.1 does NOT implement:
- clinic dashboard functionality;
- patient workspace reconstruction;
- visit/service/billing redesign;
- receipt redesign;
- financial ledger;
- hard-delete/void migration;
- appointment system.

Those remain owned by later Phase 8 tasks.

This prevents IA work from accidentally duplicating or rewriting verified business/data behavior.

## Implemented changes

### `index.html`
- Removed Dental navigation from the global platform header.
- Added Dental local navigation inside the product context boundary.
- Renamed the primary receipt navigation label from "السند" to "السندات" to represent the receipt area rather than a single document.
- Moved receipt mode controls from global header controls into the Dental workspace.
- Renamed "نماذج الطباعة" to "نموذج ورقي" to reinforce the real print-shop/handwriting use case.

### `css/ui.css`
- Added explicit layout ownership for the product context top line.
- Styled the clinic-local navigation as a subordinate product-local navigation layer.
- Added a compact receipt workflow tool section.
- Added mobile stacking and touch-safe behavior.
- Kept print output free of application navigation/workflow chrome.

### `.github/workflows/runtime-smoke.yml`
Added Phase 8.1 assertions that:
- clinic-local navigation is visible in Dental context;
- it is physically nested under `#aqsa7ProductContext`;
- no duplicate Dental navigation remains in the global header;
- receipt workflow controls are nested inside `#productWorkspace`;
- platform and product navigation remain mutually exclusive;
- existing traceability metadata remains valid.

## Architecture safety

Preserved:
- `js/app.js` as the only route/context state owner;
- `js/product.js` as product/tenant/instance authority;
- `js/repository.js` + IndexedDB as durable data authority;
- `js/storage.js` as Dental business behavior owner;
- `js/export.js` and Android bridge as export/print/share boundary.

No new:
- router;
- repository;
- persistence path;
- product registry;
- receipt store;
- business state machine;
- UI framework.

## Phase 8.1 acceptance criteria

- Platform navigation is platform-only: PASS.
- Dental navigation is product-local: PASS.
- Receipt mode is workflow-local: PASS.
- No duplicate navigation layer: PASS by source inspection.
- Existing route/state handlers remain authoritative: PASS.
- Mobile layout boundary defined: PASS.
- Print output excludes navigation chrome: PASS.
- Phase 8.0 receipt contract remains intact: PASS.

## Next task

**Phase 8.2 — Clinic Dashboard**

The next task should create the operational daily home for the dental clinic using existing data/repository capabilities, without prematurely redesigning receipts or patient persistence.
