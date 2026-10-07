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
- continuity ledger
- Phase 0 / Task 0.2 dependency & call graph
- Phase 0 / Task 0.3 action/event map

Current:
- Phase 0 / Task 0.4 state/data-flow map

Do not start Phase 1 until Phase 0.15 is marked COMPLETE.
Do not start Phase 2 until Phase 1 is tested.
Do not start productization until architecture and data boundaries are stable.
Do not create a release until Phase 5 is COMPLETE.


## Audit checkpoint — 2026-10-08

### Phase 0 / Task 0.2 — Dependency & call graph: COMPLETE

Authoritative runtime map established from the current `main` branch.

#### UI/action → handler → state/data → persistence/output
- Receipt tabs → `activateAppTab()` → `activeAppTab` + panel/modal state → receipt/patients/history/settings UI.
- Receipt entry → live DOM inputs + `calculateLedger()` / date/payment/service handlers → receipt field state → `saveReceiptLocally()` → IndexedDB `receipts` plus a legacy localStorage mirror.
- Save → `saveReceiptLocally()` → `collectReceiptData()` → fingerprint/duplicate checks → IndexedDB + localStorage mirror → patient upsert + optional auto-sync.
- History → `openHistoryModal()` → `renderHistory()` → reads `safeHistory()` → load/delete/clear actions mutate IndexedDB and the localStorage mirror.
- Patient workflow → `openPatientsModal()` / `selectPatient()` / `savePatientManual()` → patient state + receipt-derived financial summary → IndexedDB `patients` and localStorage mirror; patient account can create a new receipt.
- PNG → `downloadReceiptImage()` → `generateReceiptCanvas()` → `saveCanvasImage()` → Android chunked image bridge or browser download.
- Share image → `shareReceiptImage()` → canvas PNG → Web Share API or image download + WhatsApp fallback.
- Print/PDF → `triggerNativePrint()` / `downloadReceiptPDF()` → print DOM materialization + dynamic print CSS → browser/WebView print engine. This is the authoritative PDF route.
- Legacy PDF → `buildReceiptPdfBlob()` → jsPDF + raster canvas. No active caller was found; candidate for removal after final dependency proof.
- Text share/copy → `getReceiptText()` → clipboard/WhatsApp URL.
- Transaction export → `exportTransactionsFile()` → history read → CSV/JSON → Android Downloads bridge or browser download.
- Full backup → `buildFullBackup()` → IndexedDB receipts/patients + localStorage settings → JSON file. Import reverses this into IndexedDB and rebuilds the receipt mirror.
- Cloud sync → `syncBackupNow()` / `syncRestoreNow()` → IndexedDB snapshot + selected settings → `fetch()` to `/api/clinic-sync` → Vercel Blob record; restore writes back to IndexedDB and localStorage mirrors.

#### Android bridge map
- `triggerNativePrint()` ultimately relies on WebView print; native `Android.printReceipt()` remains separately exposed and must be checked for active JS callers before removal.
- PNG export uses `Android.beginImageSave()` → `appendImageChunk()` → `finishImageSave()`.
- Transaction exports use `Android.saveTransactionsFile()`.
- Patient reminders use `Android.scheduleReminder()`.
- `Android.savePdfFromData()` and `Android.saveImage()` remain exposed legacy bridge methods; no active JS call was found for them in the current frontend call graph.

#### Confirmed architectural issues discovered during 0.2
1. **Two persistence representations:** IndexedDB is the durable store, but receipts/patients are repeatedly mirrored into localStorage. This creates synchronization responsibility in multiple modules and violates the intended single source of truth.
2. **Logo persistence/application is split:** `saveLogoDurably/loadLogoDurably` coexist with `persistLogoData/loadCustomLogo`; the latter pair has no active caller in the current graph.
3. **Export has competing historical paths:** native print is authoritative, while jsPDF/blob helpers remain in the codebase without active callers.
4. **Navigation is not a true router:** tab selection, modal state and browser history are mixed. In particular, `activateAppTab('patients')` opens the patient modal through `openPatientsModal()`, but that function does not push a panel history state; this directly weakens Back navigation. `selectPatient()` also renders the account without explicitly transitioning through `showPatientDetailView()`.
5. **Multiple event mechanisms:** 89 inline `onclick` handlers coexist with JavaScript `addEventListener` handlers. This is workable but increases coupling and makes a future centralized event/action layer preferable.
6. **Sync settings use localStorage directly** while sync data uses IndexedDB, adding another split ownership boundary.

### Phase 0 / Task 0.3 — Action/Event map: COMPLETE

The action inventory covers 89 inline handlers across 53 handler expressions, plus DOMContentLoaded, popstate, input/change, keyboard shortcut, service-worker and Android bridge events. The major action families are: receipt entry, quick actions, navigation, settings/theme/typography, logo, history, patient management, backup/import/export, sync, print/PDF/image/share and template generation.

### Next task
**0.4 State/data-flow map — IN PROGRESS.**
Focus: identify every authoritative state owner, every mirror, every mutation path, and the exact boundaries between DOM state, IndexedDB, localStorage, sync snapshots, export snapshots and Android persistence.
