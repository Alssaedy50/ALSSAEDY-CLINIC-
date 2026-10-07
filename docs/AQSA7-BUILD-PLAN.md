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


### Phase 0 / Task 0.4 — State & data-flow map: COMPLETE

#### Authoritative state model (current implementation)
| Domain | Current authoritative state | Mirrors / secondary state | Main mutation paths |
|---|---|---|---|
| Current receipt draft | Live DOM inputs under `#receiptPrintArea` | `alssaedy_draft` localStorage for recovery | input/change handlers, quick actions, payment/service/ledger functions |
| Saved receipts | IndexedDB `receipts` is the intended durable store | `alssaedy_receipts_history` localStorage is a full mirror used by reads/UI | save/load/delete/clear/import/sync |
| Patients | IndexedDB `patients` | `alssaedy_patients` localStorage mirror | manual save, receipt save/upsert, sync/import |
| Settings | Mostly localStorage keys | some settings also copied into sync snapshots | setters in app.js, import/sync restore |
| Custom logo | IndexedDB `settings/customLogo` is durable path | `alssaedy_custom_logo` localStorage; startup reads both | upload/reset/import/sync |
| Selected patient | `currentPatientId` / `window.currentPatientId` | patient form hidden ID + receipt `patientId` when saved | select/save patient, load receipt |
| Sync config | localStorage | none | sync settings UI |
| Navigation | `activeAppTab` + DOM classes + browser history state | modal open classes | tab/modal functions + popstate |
| Export snapshot | temporary DOM clone/canvas/print DOM | none intended | export functions |

#### Data-flow conclusions
1. The current receipt draft is correctly DOM-centric, but draft recovery is an independent localStorage state machine.
2. IndexedDB is the stronger persistence layer, but the localStorage mirrors are actively read by `safeHistory()` and patient fallback paths; therefore deleting the mirrors without first changing readers would break functionality.
3. Receipt save/delete/clear and patient save all perform explicit mirror writes, creating multiple synchronization points and possible divergence if one write succeeds and the other fails.
4. Logo has two persistence paths with overlapping responsibilities; startup explicitly reads localStorage first and then IndexedDB, while reset/import/sync update localStorage directly. This must be consolidated in Phase 1.
5. Settings are fragmented across at least 17 localStorage keys in app.js plus night/sync/draft/patient/receipt-history keys in other modules. There is no centralized settings repository.
6. Navigation state is distributed between `activeAppTab`, modal classes, patient-detail visibility classes and `history.state`; there is no single route state owner.
7. Sync snapshot is built from IndexedDB for receipts/patients but settings from localStorage, confirming the current data boundary is split between stores.

#### Phase 1 remediation targets derived from 0.4
- Introduce one repository/data layer with IndexedDB as the single durable source for receipts, patients and settings.
- Treat localStorage only as a narrowly scoped compatibility/migration store, not a second database.
- Centralize clinic settings and logo persistence.
- Define one navigation state machine/router.
- Define explicit receipt draft state separate from persisted receipt records.
- Make sync consume repository snapshots rather than reaching into storage primitives directly.
- Make export consume a read-only receipt snapshot and never mutate persistent state.


### Phase 0 / Task 0.5 — Date pipeline audit: COMPLETE

#### Current date flow
`digDate / paperTemplateDate` → `parseAnyDate()` → normalized `YYYY-MM-DD`-style components → `formatReceiptDate()` for exported text/WhatsApp → `syncPaperDate()` for paper display → receipt history/backup/sync as stored raw date value.

#### Confirmed good
- One shared parser is used for paper display and formatted receipt text.
- Arabic/Persian numerals are normalized.
- Both year-first and day-first common numeric forms are supported.
- Calendar validity is checked with a real `Date` probe, including invalid day/month combinations.
- Paper year digits and `م` are rendered as separate LTR/isolated elements to reduce RTL/BiDi reordering.
- Native print receives a materialized text date instead of relying on the hidden date input.
- Export clone materialization removes the duplicate print-date node before creating the authoritative exported node.

#### Date defects / design risks
1. The UI placeholder says “any common format”, but the parser intentionally accepts only a bounded numeric grammar; this wording is too broad.
2. The native picker sync only copies an existing value when it already matches strict `YYYY-MM-DD`. If the user entered a valid day-first date such as `07/10/2026`, opening the picker does not seed it with the normalized date.
3. Receipt history stores the user's raw date string rather than a canonical date plus display representation. This makes future filtering/sorting/migration harder and can produce mixed formats across old records.
4. `generateNextReceiptNo()` still reads the localStorage receipt-history mirror rather than the durable repository, coupling numbering to the mirror.
5. The paper template's blank state intentionally keeps the current year in the year slot while day/month are blank; this is a product decision that should remain explicit in the new template model.

#### Phase 1 target
Create one canonical date value in the data layer (ISO date), one formatter for human display, and one input adapter that accepts supported human formats and seeds the native picker from the normalized value. Persist canonical date values; do not persist presentation strings.


### Phase 0 / Task 0.6 — Logo pipeline audit: COMPLETE

#### Current pipeline
Official logo: `assets/Saedy_Dental_Logo.svg` → `OFFICIAL_LOGO_URL` → `applyLogo()` → receipt header + watermark. Custom upload: FileReader → SVG preserved as data URL, raster images optionally downscaled to max 4096px → localStorage + IndexedDB settings → `applyLogo()`. PNG export uses html2canvas; print/PDF uses the live DOM/WebView print engine. Android packages a separate `logo.png` as the application icon while web content still uses the SVG asset.

#### Confirmed good
- Official logo is vector SVG with a 500×500 viewBox, so it is not inherently resolution-limited for print.
- Raster upload processing caps oversized inputs at 4096px while preserving aspect ratio.
- SVG uploads are not rasterized, preserving vector quality in the browser/print path.
- Receipt logo uses `object-fit: contain` and a square presentation box, preventing forced stretching of non-square artwork.
- Export clone explicitly removes width/height attributes and disables visual filters/opacity overrides that could degrade capture.
- Reset removes both custom logo stores and restores the official asset.

#### Confirmed architectural issues / risks
1. **Two logo persistence implementations:** `saveLogoDurably/loadLogoDurably` and `persistLogoData/loadCustomLogo` overlap; the latter pair has no active callers. One logo repository should remain after Phase 1 cleanup.
2. **Two persistence stores:** custom logo is written to both IndexedDB and localStorage, with startup preferring localStorage and then asynchronously applying IndexedDB. This can create a visible two-step logo state during startup.
3. **Import/sync restore bypass the durable logo API:** they write `alssaedy_custom_logo` directly to localStorage rather than the authoritative logo manager.
4. **Export quality depends on html2canvas for PNG:** the capture is high-scale (4 browser / 3 Android in the legacy PDF helper), but PNG remains raster by definition. Print/PDF is the correct high-fidelity/vector route.
5. **Android launcher icon is a separate raster asset:** it must be treated as application branding, not as the source of truth for receipt rendering.

#### Phase 1 target
Create one LogoRepository/manager with a single durable source, a single load/apply path, explicit raster quality policy, and explicit separation between receipt-rendering logo and Android launcher icon.

### Next task
**0.7 Export/print/PDF/PNG/share audit — IN PROGRESS.**
Focus: prove each export path, quality characteristics, filename/download behavior, Android bridge usage, print CSS, text selectability, blank-template behavior, and eliminate competing legacy paths only after call-graph proof.
