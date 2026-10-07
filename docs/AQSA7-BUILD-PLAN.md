# AQSA7 — Engineering Build Plan & Continuity Ledger

Status: ACTIVE
Last updated: 2026-10-08
Owner: Project technical/design lead (ChatGPT)
Repository: ALSSAEDY-CLINIC-
Umbrella product target: AQSA7

## Mission

Transform the current ALSSAEDY CLINIC receipt application into a clean, reliable, reusable Dental Clinic product that can live inside the AQSA7 umbrella platform and later be configured/sold to other clinics.

## Non-negotiable engineering rules

1. Understand before modifying.
2. Fix root causes, not symptoms.
3. One responsibility has one authoritative implementation.
4. One data domain has one source of truth.
5. No dead/legacy code without a documented reason.
6. No duplicate UI paths or competing state machines.
7. Preserve existing features unless explicitly replaced by a superior, tested implementation.
8. Every architectural change requires regression testing.
9. Never release an unverified build.
10. Update this ledger after every completed phase/task.

## Target architecture

AQSA7
- CORE
  - App Shell
  - Router / Navigation
  - Shared UI
  - Theme
  - Storage / Data layer
  - Export engine
  - Notifications
  - Shared utilities
- PRODUCTS
  - Dental Clinic
    - reusable product
    - ALSSAEDY CLINIC = configured instance
  - future products

## Current baseline

Audited main branch at the start of the program:
- HTML IDs: 88; duplicate IDs: 0
- inline onclick handlers: 89; unique handler names: 48
- missing referenced handlers: 0
- JavaScript functions across core JS files: ~170
- duplicate function names across core JS files: 0
- main JS files: app.js, export.js, storage.js, ui.js, templates.js, tafqeet.js, sync.js
- CSS layers: ui.css, receipt.css, print.css, templates.css, polish.css
- Android WebView bridge present
- IndexedDB and localStorage both participate in application data
- navigation is primarily panel/modal state + history
- export contains both current native-print and legacy PDF machinery
- sync API exists on Vercel Blob

## Program phases

### Phase 0 — Deep Audit
Status: IN PROGRESS
Tasks:
- 0.1 repository inventory
- 0.2 dependency/call graph
- 0.3 action/event map
- 0.4 state/data-flow map
- 0.5 date pipeline audit
- 0.6 logo pipeline audit
- 0.7 export/print/PDF/PNG/share audit
- 0.8 navigation audit
- 0.9 storage audit
- 0.10 Android bridge audit
- 0.11 CSS cascade/audit
- 0.12 sync/security audit
- 0.13 service-worker/cache audit
- 0.14 dead/legacy responsibility inventory
- 0.15 final audit report and remediation order

### Phase 1 — Architecture Cleanup
Status: NOT STARTED
- establish clear module boundaries
- remove proven dead/legacy paths
- unify state ownership
- establish data repository layer
- unify export pathways
- unify logo management
- unify date handling
- simplify Android bridge
- clean CSS responsibilities

### Phase 2 — UX/UI Reconstruction
Status: NOT STARTED
- AQSA7 app shell
- clear section navigation
- Dental Clinic dashboard
- Patients
- Receipts
- History
- Reports
- Settings
- responsive mobile-first design
- accessible interactions
- consistent design system

### Phase 3 — Productization
Status: NOT STARTED
- separate reusable Dental Clinic product from clinic configuration
- clinic profile/configuration model
- product-level defaults
- tenant/clinic identity boundaries
- prepare for future sellable instances

### Phase 4 — Reliability & Security
Status: NOT STARTED
- backup/restore integrity
- sync authentication/authorization
- tenant isolation
- conflict handling
- offline/cache lifecycle
- Android permissions and bridge safety
- data migration/versioning

### Phase 5 — Full Regression
Status: NOT STARTED
- every button/action
- every form/input
- receipt creation/edit/save
- patients CRUD/navigation
- history/search
- backup/import
- sync
- logo
- PNG
- PDF
- print
- share
- A5/A4/80mm
- Android back/file/share/print
- offline
- cache upgrade
- Arabic RTL/BiDi
- release installation/upgrade

### Phase 6 — Release
Status: NOT STARTED
- version bump
- CI build
- signed APK verification
- release notes
- SHA256
- GitHub release
- final acceptance

## Findings already confirmed

### Dead/legacy candidates
The following functions currently appear to have no callers and must be proven unused before removal:
- persistLogoData()
- loadCustomLogo()
- buildReceiptPdfBlob()
- blobToDataUrl()
- getTransactionsSummary()

### Storage duplication
Receipt data is represented in both IndexedDB and localStorage. This must be resolved into a single authoritative data layer; localStorage should not act as a second database.

### Navigation
Current navigation relies on panels/modals plus history state. It needs a coherent routing/screen model.

### Export
Current code contains the native-print PDF direction plus remnants of an older jsPDF/data-url path. The final architecture must have one authoritative implementation per export type.

### Logo
Logo persistence/application responsibilities are split between overlapping functions. Final design must have one authoritative logo manager/storage path.

### Sync
Authentication, authorization, key handling, tenant isolation, deterministic object addressing, CORS, concurrency and integrity require a dedicated security review before productization.

### Service worker
Cache-first lifecycle/version invalidation needs explicit audit to avoid stale production assets.

## Execution protocol

When a new instruction says to continue, resume from the first incomplete task in this ledger unless the instruction explicitly changes priority.

For every task:
1. Inspect current repository state.
2. Identify root cause/dependencies.
3. Implement only the coherent change set.
4. Run relevant tests.
5. Run regression tests for affected areas.
6. Record outcome here.
7. Commit with a clear message.
8. Only then advance the task status.

## Current checkpoint

Completed:
- repository baseline inventory
- initial structural checks
- initial dependency/call-site sampling
- initial legacy candidate identification
- initial storage/navigation/export/logo/sync observations
- this continuity ledger

Next task:
**0.2 Dependency/call graph — complete the authoritative action → function → state → storage → output map.**

Do not start Phase 1 until Phase 0.15 is marked COMPLETE.
Do not start Phase 2 until Phase 1 is tested.
Do not start productization until architecture and data boundaries are stable.
Do not create a release until Phase 5 is COMPLETE.
