# AQSA7 — Engineering Build Plan & Continuity Ledger

Status: ACTIVE
Last updated: 2026-10-08 (Phase 2 Task 2.2 completed)
Owner: Project technical/design lead (ChatGPT)
Repository: Alssaedy50/AQSA7
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

## Task Completion, GitHub Record & Handoff Rule

At the end of every task, subtask, phase, or verified work unit:
1. Update GitHub to the complete current state, including implementation result, verification, commits, blockers and decisions.
2. Consolidate or remove obsolete intermediate notes so project documentation contains the current authoritative state without contradictions or unnecessary history.
3. Produce a concise final task report in the conversation: what was completed, current state, exact next step, and who executes it (AI or User).
4. If User input is genuinely required, ask directly and state exactly what is needed and why; do so only after exhausting all reasonable tools, technical paths and verification methods available to AI.
5. Never claim completion without satisfying the defined exit criteria. If verification is unavailable, record the task as PENDING/BLOCKED/UNVERIFIED with the exact reason.
6. GitHub remains the authoritative project state; the conversation handoff must not contradict it.


## Strict 100% Free & Local-First Architectural Constraint

This is a mandatory architectural constraint for AQSA7 and every product inside it.

1. **No paid backend infrastructure is required for the core product.**
   - Core functionality must operate without a paid backend service or paid cloud dependency.
   - Any optional online service must have a local/offline-first fallback and must never become a hidden requirement for core clinic operation.

2. **Persistence**
   - Client-side **IndexedDB is the single durable application database** for clinic data.
   - The durable local data path must have zero operational infrastructure cost.
   - localStorage may only be used for explicitly scoped UI preferences, temporary draft/recovery state, migration compatibility, or similarly non-authoritative concerns.
   - No second persistent database may be introduced for the same domain.

3. **Assets & icons**
   - Prefer inline SVG and lightweight local/static icon libraries such as Lucide SVG.
   - Avoid heavy remote CDNs, remote runtime assets, and custom font dependencies unless there is a documented architectural reason.
   - The application must remain usable when external asset networks are unavailable.

4. **Export & print**
   - Native browser/WebView print is the authoritative PDF/print engine.
   - Preserve real text/vector output and the existing A4, A5 and 80mm thermal contracts.
   - Do not introduce paid or cloud PDF/canvas conversion services.
   - PNG remains a local raster export path where an image is specifically required.

5. **Hosting target**
   - Prefer static edge hosting/distribution such as Cloudflare Pages or GitHub Pages.
   - Hosting must not be required for local clinic data persistence or core receipt operation.

6. **Data protection / backup**
   - AQSA7 must provide an automatic scheduled reminder/trigger for local encrypted JSON backup.
   - The backup flow must be designed to protect against accidental browser storage clearing.
   - Backup/restore integrity, encryption design and scheduling behavior are mandatory reliability work and must be verified before release.

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
Status: COMPLETE
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
Status: COMPLETE
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
Status: IN PROGRESS

### Phase 2 / Task 2.1 — Design System Foundation: COMPLETE

Implemented the mandatory Phase 2 foundation without changing protected receipt print geometry or replacing existing application behavior.

Implementation:
- Added authoritative AQSA7 design tokens to `css/ui.css`:
  - Primary `#1E3A8A`
  - Paid/success `#059669`
  - Warning/balance `#D97706`
  - Surface `#F8FAFC`
  - White `#FFFFFF`
  - Border `#E2E8F0`
- Added shared UI typography token using `system-ui, -apple-system, sans-serif`.
- Added a 44px shared touch-target token and applied it to primary navigation/action controls on screen.
- Added shared visible focus treatment for keyboard/accessibility navigation.
- Added tabular numeric presentation to core financial/ledger/phone UI surfaces.
- Retained legacy CSS aliases so existing feature styles continue to resolve through one token source rather than duplicating values.
- Preserved the configurable receipt font family and receipt-specific geometry.

Verification:
- GitHub Actions `AQSA7 Runtime Smoke`: run `37709542791` — **PASS**.
- Runtime smoke now verifies the required design-token values, system UI font token and 44px navigation touch target in addition to the existing application smoke checks.
- Android APK workflow on the same checkpoint: run `37709542785` — **SUCCESS**.
- Pages deployment: run `37709541569` — **SUCCESS**.
- `Verify receipt image export`: run `37709542776` — **FAIL**, but the failure is in the existing PDF text-selection assertion (`tests/receipt-export-test.mjs`) after the PDF was generated; it is not a design-token/runtime failure. It remains explicitly unresolved and must be cleared before Phase 2 exit/full regression.

Next Phase 2 task:
- **Task 2.2 — Top App Shell & Navigation Dock reconstruction**.
- Executor: **AI / Technical Lead**.

### Phase 2 / Task 2.2 — Top App Shell & Navigation Dock: COMPLETE

Implemented the shared AQSA7 application shell and navigation dock as the authoritative Phase 2 navigation surface.

Implementation:
- Reconstructed the top application shell in index.html with explicit AQSA7 platform identity, Dental Clinic product identity, clinic identity, saved-receipt count and section navigation.
- Kept the existing four navigation responsibilities authoritative: Receipt, Patients, History and Settings.
- Preserved the existing activateAppTab() routing/state behavior; no competing navigation state machine was introduced.
- Added accessible active-state semantics through aria-current="page" in activateAppTabVisual().
- Added responsive navigation behavior:
  - desktop: product identity + section navigation + receipt mode controls in one shell
  - mobile/tablet: product identity, full-width section dock and touch-first controls
  - mobile navigation remains horizontally safe without creating a second navigation path
- Applied Phase 2 design tokens and the 44px interaction contract to navigation controls.
- Added clear hover, active, focus and selected-state treatment.
- Preserved print behavior by excluding the application shell from print output.
- Added runtime smoke assertions for AQSA7 identity, clinic identity, four navigation items and exactly one active/current navigation item.

Files:
- index.html
- css/ui.css
- js/app.js
- .github/workflows/runtime-smoke.yml

Verification:
- AQSA7 Runtime Smoke run 37709928853 — PASS on commit 383448a9160faef3246362692ffd404c4d47bea5.
- Pages deployment run 37709928883 — SUCCESS on the same commit.
- Verify receipt image export run 37709928831 — FAIL, but the failure is the pre-existing PDF selectable-text assertion in tests/receipt-export-test.mjs for A5 after the PDF was generated. The exported text is present in the PDF extraction output, but the test's expected selectable-text condition still fails. This is unrelated to Task 2.2 shell/navigation behavior and remains an explicit release/regression blocker.
- Android APK build run 37709928867 — IN PROGRESS at ledger update time; its result must not be interpreted as a Task 2.2 runtime pass until completed.

Exit decision:
- Task 2.2 functional/design exit criteria: MET.
- Browser runtime gate for the task: PASS.
- Navigation architecture remains single-owner and behavior-preserving.
- Phase 2 remains IN PROGRESS.

Next Phase 2 task:
- Task 2.3 — Patient Directory / Ledger Table reconstruction.
- Executor: AI / Technical Lead.

### AQSA7 Design System Specification — Phase 2 Mandatory Foundation

Phase 2 must not evolve into screen-by-screen AI-generated styling. All new screens and components must use one shared design-token and component system.

#### Design tokens

The authoritative global design tokens belong in `css/ui.css`:

| Token | Required value | Intended use |
|---|---|---|
| Primary Navy/Blue | `#1E3A8A` | primary navigation, major actions, clinical identity |
| Accent/Paid Green | `#059669` | paid/success/positive financial states |
| Warning/Balance Amber | `#D97706` | balance/warning states |
| Neutral Slate Surface | `#F8FAFC` | application/background surfaces |
| White Surface | `#FFFFFF` | cards, panels, receipt surfaces |
| Border Gray | `#E2E8F0` | borders/dividers |

Typography:
- Use `system-ui, -apple-system, sans-serif` as the primary system font stack.
- Use `font-variant-numeric: tabular-nums;` for currency amounts, ledger entries and phone numbers.
- Do not introduce per-screen font systems.

Interaction guardrails:
- Action buttons and form inputs must have minimum 44px–48px touch targets.
- Mobile/clinical touchscreen interaction must remain the baseline.
- Focus, keyboard navigation, disabled states and readable contrast are part of the component contract.

#### Component Blueprint Standardization

The following components are mandatory shared patterns:

1. **Top App Shell & Navigation Dock**
   - unified product identity
   - stable navigation ownership
   - active-state indication
   - responsive mobile/desktop behavior

2. **Patient Directory / Ledger Table**
   - consistent search/filter affordances
   - aligned tabular numbers
   - clear patient identity and financial status
   - mobile-safe responsive transformation

3. **Patient Account Detail**
   - sticky summary header
   - patient identity + financial summary
   - chronological visit/receipt timeline
   - consistent action hierarchy

4. **Receipt Issuance Panel**
   - clear clinical/financial input grouping
   - consistent currency and amount presentation
   - primary save/print/export actions
   - preserved receipt geometry and print contracts

#### Design-system rules

- Components must be reusable before screen-specific variants are introduced.
- Tokens must be referenced rather than hard-coded repeatedly across screens.
- New CSS must respect existing ownership boundaries.
- Do not redesign protected receipt print geometry merely for visual consistency.
- Phase 2 visual work must preserve the functional architecture established in Phase 1.
Status: IN PROGRESS
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
- Phase 0 / Tasks 0.1 → 0.15 — Deep Audit
- Phase 1 / Tasks 1.1 → 1.5 — architecture/data-layer/export/logo/date foundations
- Phase 1 / Task 1.6 — Settings Ownership Cleanup
- Phase 1 / Task 1.7 — CSS Responsibility Cleanup
- Phase 1 / Task 1.8 — CSS/UX Regression Verification
- Phase 1 / Task 1.9 — Runtime Visual Smoke Baseline

### Phase 1 Exit Gate — 2026-10-08: COMPLETE

#### Task 1.9 — Runtime Visual Smoke Baseline: COMPLETE

Browser runtime smoke executed successfully in GitHub Actions after correcting the Playwright runner dependency and aligning the smoke flow with the application's modal navigation contract.

Final browser verification:
- Workflow: `AQSA7 Runtime Smoke`
- Run: `37708647675`
- Commit: `25e6fdb59c7808950793854dc0e670929c0be845`
- Job: `browser-smoke`
- Result: **PASS**
- Mobile viewport: 390×844
- Verified page load/title, critical DOM nodes, required runtime functions, date rendering, Patients route + Back behavior, History open/close, Settings open/close, Receipt return, console/page errors.
- Runtime screenshot artifact: `aqsa7-runtime-smoke`
- Artifact SHA-256: `0954361bbd411cff6179db01ef2c4ea3d6eb20bb6f7f213ba3c445d9fc2a20dd`

Test-runner defect resolved:
- The original Playwright invocation failed because the package was not resolvable from the temporary `npx -p` execution environment.
- The workflow now installs Playwright 1.55.0 locally and runs the smoke script against that installation.

Smoke-contract correction:
- History and Settings are modal/overlay surfaces that intentionally intercept pointer events.
- The smoke test now verifies their open/close behavior explicitly rather than attempting to click the underlying navigation dock through an open overlay.
- The application navigation implementation was not changed for this test assumption; the speculative navigation modification was reverted before the final PASS.

#### Android/WebView baseline acceptance boundary

Android CI/build verification is available and the production APK build/signature verification succeeded on the final checkpoint commit. Actual Android emulator/WebView interactive execution is not exposed by the available repository tooling.

Therefore the Android runtime portion is **formally accepted into Phase 5 — Full Regression**, with explicit scope:
- Android/WebView interactive navigation and Back behavior.
- Native print/share/file behavior.
- WebView asset/cache lifecycle.
- Logo persistence and reload.
- A4/A5/80mm rendering.
- Offline behavior.
- Android bridge behavior.

This acceptance does **not** claim that Android runtime testing has already passed.

#### Phase 1 exit decision

Phase 1 is now **COMPLETE**:
- Browser runtime gate: **PASS**.
- Android/WebView runtime: **deferred to Phase 5 under the explicit regression scope above**.
- Phase 2 remains **NOT STARTED** and is now unblocked.

Next:
- **Phase 2 — UX/UI Reconstruction**.
- Executor: **AI / Technical Lead** when the user instructs to continue.

### Phase 1.7 — CSS Responsibility Cleanup: COMPLETE

Implemented:
- Receipt geometry and receipt-specific mobile/export rules remain owned by `css/receipt.css`.
- Print-only rules remain owned by `css/print.css`.
- Template/patient modal rules remain owned by `css/templates.css`.
- Global application chrome remains owned by `css/ui.css`.
- `css/polish.css` was reduced from a catch-all stylesheet to cross-feature presentation components and feedback styles.
- Removed duplicate date-print visibility rules from `css/receipt.css`; print visibility is now owned by `css/print.css`.
- Removed duplicate paper-template date editor styling from `css/receipt.css`; template editor styling remains in `css/templates.css`.
- Moved receipt mobile safeguards out of the UI stylesheet into the receipt stylesheet.
- Added a temporary component-layer artifact during the refactor, then removed it because it was not loaded by the current shell; no unused stylesheet remains.
- Verified the repository after the rename from `ALSSAEDY-CLINIC-` to `AQSA7`.

Validation:
- Duplicate-selector scan performed across all five CSS files.
- Exact duplicate blocks identified and removed where ownership was unambiguous.
- JavaScript runtime sources remain syntactically valid.
- CSS files remain text-valid and preserve the existing stylesheet load order.
- No Phase 2 work has started.
 (browser/Android)

### Phase 1.6 — Settings Ownership Cleanup: COMPLETE

Implemented:
- Durable clinic settings now have one IndexedDB owner through the repository.
- `currency`, `receiptSize`, `receiptTexts`, and `customLogo` are clinic configuration.
- UI presentation preferences remain in localStorage.
- Sync configuration/metadata remains in localStorage.
- Legacy clinic-setting localStorage values are migration inputs only.
- Full backup schema upgraded to v3 with explicit `settings.clinic` and `settings.ui` separation.
- Restore remains backward-compatible with the previous flat settings structure.
- Cloud sync now restores clinic settings through repository APIs rather than writing clinic settings directly to localStorage.
- Added `docs/AQSA7-SETTINGS-OWNERSHIP.md`.

Validation:
- JavaScript syntax compilation passed for `repository.js`, `app.js`, `storage.js`, and `sync.js`.
- Repository-wide scan of the affected setting keys confirms direct localStorage access remains only inside the migration/cleanup layer.
- Modified files verified on `main`.

Next:
- Phase 1 / Task 1.7 — CSS Responsibility Cleanup

Do not start Phase 2 until Phase 1 is tested.
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


### Phase 0 / Task 0.7 — Export/print/PDF/PNG/share audit: COMPLETE

- **Authoritative PDF:** browser/WebView native print via `triggerNativePrint()` / `downloadReceiptPDF()`; this preserves real text instead of flattening the receipt to a canvas image.
- **PNG:** `downloadReceiptImage()` → `generateReceiptCanvas()` → high-scale html2canvas → Android chunked MediaStore save or browser Blob download.
- **Preview:** canvas at scale 2; intentionally a preview, not the production export.
- **Image sharing:** Web Share API with file support; fallback downloads the image then opens WhatsApp/text sharing.
- **Text sharing/copy:** generated from the current DOM receipt state; phone/reference/financial numerals use BiDi isolation where needed.
- **Transaction exports:** CSV/JSON are generated from history and routed through Android Downloads or browser download.
- **Blank templates:** temporary snapshot → manual/blank mode → print/image → restore snapshot; no receipt persistence intended.
- **Legacy PDF path:** `buildReceiptPdfBlob()` plus `ensureJsPdf()` / `blobToDataUrl()` are disconnected from the active PDF button flow. They should be removed only in Phase 1 after repository-wide proof and regression tests.
- **Legacy Android PDF/image bridge:** `savePdfFromData()` and `saveImage()` are exposed but have no active frontend callers; the chunked PNG bridge and native print are the active paths.
- **Quality risk:** PNG is inherently raster; high scale improves it but cannot equal vector/text PDF. Native print is therefore the correct PDF architecture.
- **Print CSS:** A5/A4/80mm dimensions are explicitly controlled, with zero page margins and a thermal auto-height path. This protected contract must remain regression-tested.

### Phase 0 / Task 0.8 — Navigation audit: COMPLETE

Current navigation is a hybrid of tab state, modal/drawer CSS state and browser history. The receipt tab is the base state; patients/history/settings are overlays.

Confirmed issues:
1. `activateAppTab('patients')` calls `openPatientsModal()`, but `openPatientsModal()` does not push a `history.state`; Back therefore cannot reliably return from the patient section through the same router mechanism.
2. `selectPatient()` loads patient data and account content but does not call `showPatientDetailView()`; the detail/list transition is therefore implicit/incomplete.
3. `startPatientVisit()` closes the patients modal and returns to the receipt, but does not establish a route/state describing the patient context.
4. Share/template/preview modals do not participate in the same history state model.
5. `closeAllAppPanels()` resets visual state but navigation ownership remains distributed across multiple functions.

Target: one explicit route state (for example receipt/patients/patient-detail/history/settings plus transient modal state) with one router owner.

### Phase 0 / Task 0.9 — Storage audit: COMPLETE

- IndexedDB database: `ALSSAEDY_CLINIC_DB`, version 2, stores `receipts`, `patients`, `settings`.
- localStorage contains settings, draft, sync configuration, patient mirror and full receipt-history mirror.
- `safeHistory()` reads localStorage, so UI/history reads do not consistently come from IndexedDB.
- Receipt writes first update localStorage and then IndexedDB; the async IndexedDB result rewrites localStorage. Failures are swallowed, allowing divergence.
- Patient writes use IndexedDB then rewrite the localStorage mirror.
- Backup reads IndexedDB for receipts/patients but localStorage for settings.
- Import writes IndexedDB then rebuilds the receipt mirror.
- Sync reads/writes IndexedDB for records but localStorage for settings/configuration.

Primary remediation: IndexedDB repository becomes authoritative; localStorage is reduced to compatibility/preferences/draft only, with a controlled migration of existing mirrors.

### Phase 0 / Task 0.10 — Android bridge audit: COMPLETE

Active bridge responsibilities: native print, chunked PNG save, transaction-file save, patient reminder scheduling. Additional exposed methods include PDF data-URL save, single-call image save, shareText, copyText and openUrl. The frontend currently uses only the active set identified above; unused exposed methods are Phase 1 cleanup candidates.

The bridge writes through MediaStore rather than legacy filesystem paths, uses scoped storage-compatible Downloads/Pictures locations, and uses a 300 DPI print resolution. Exact alarms have an inexact fallback when permission is unavailable.

Risk: the bridge is larger than the current frontend needs, so unnecessary JS interfaces increase attack/maintenance surface. Phase 1 should minimize it to proven requirements.

### Phase 0 / Task 0.11 — CSS cascade audit: COMPLETE

The current print/export contract is spread across `ui.css`, `receipt.css`, `print.css`, `templates.css`, and `polish.css`. `print.css` contains repeated `@media print` blocks and explicit overrides for date, footer, size and blank-template behavior. This works but makes ownership difficult to reason about.

Confirmed cleanup target: one base receipt layout layer, one interaction/UI layer, one print/export layer, and one optional theme layer. Do not change protected A5/A4/80mm geometry until regression snapshots exist.

### Phase 0 / Task 0.12 — Sync/security audit: COMPLETE

The endpoint derives a deterministic Blob path from the supplied clinic key and treats the bearer value itself as the clinic credential. There is no separate user identity, signed session, expiry, or per-clinic authorization record. Anyone possessing/guessing a valid key can address that clinic's blob.

CORS currently reflects the request Origin. The endpoint validates key length and payload size and uses optimistic version checks, but there is no cryptographic authentication of the clinic identity beyond the secret key itself.

Critical productization requirement: replace the current “shared secret = tenant identity + authorization” model with a proper clinic identity/credential boundary, rate limiting/abuse controls, and server-side tenant authorization before selling the product to other clinics.

### Phase 0 / Task 0.13 — Service-worker/cache audit: COMPLETE

- Cache name and asset query version are manually bumped per release.
- Install pre-caches the application shell but silently ignores individual cache failures.
- Fetch is cache-first and starts a background network fetch; API traffic is excluded.
- Activation deletes every previous cache name.

Risks: cache-first can serve stale HTML/JS until a new service worker activates; manually synchronized version strings are easy to miss; background cache writes are not awaited. Phase 1 should use an explicit asset-version strategy and an update/reload policy, with offline behavior preserved.

### Phase 0 / Task 0.14 — Dead/legacy responsibility inventory: COMPLETE

Proven disconnected candidates from the current call graph:
- `persistLogoData()`
- `loadCustomLogo()`
- `buildReceiptPdfBlob()`
- `blobToDataUrl()`
- `getTransactionsSummary()`
- Android `savePdfFromData()`
- Android `saveImage()`

Additional responsibility overlap (not yet dead):
- logo persistence/application
- receipt history persistence/mirroring
- settings storage
- navigation state
- export/print orchestration

These are removal/merge candidates, not yet deleted, because Phase 1 must first establish the replacement authoritative paths and regression coverage.


### Phase 0 / Task 0.15 — Final audit report & remediation order: COMPLETE

#### Final audit conclusion
The current v1.2.1 implementation is functional enough to serve as a baseline, but its responsibilities are too distributed for AQSA7 productization. The dominant architectural problem is **state ownership fragmentation**, not missing individual features. The next phase must therefore restructure ownership before adding UX features.

#### Remediation order (mandatory)
1. **R1 — Data repository:** IndexedDB-backed repository for receipts, patients, settings; migrate readers away from localStorage mirrors.
2. **R2 — Receipt state:** explicit draft/current-receipt model and canonical date/currency values.
3. **R3 — Logo repository:** one persistence/apply path; remove duplicate logo helpers after migration.
4. **R4 — Export engine:** keep native print as PDF authority; keep one PNG engine; remove disconnected jsPDF/data-url paths after tests.
5. **R5 — Router/navigation:** one route owner and reliable Android/browser Back behavior.
6. **R6 — Android bridge:** retain only active native capabilities and keep JS interface surface minimal.
7. **R7 — Settings:** centralize settings access and persistence; keep only true preferences in localStorage.
8. **R8 — Sync boundary:** make sync consume repository snapshots and redesign authentication/tenant isolation before productization.
9. **R9 — Service worker:** explicit version/update lifecycle without sacrificing offline support.
10. **R10 — CSS ownership:** consolidate cascade after architecture changes, with protected print geometry tests.

#### Phase 0 exit criteria
- All 0.1–0.15 tasks completed.
- No production code was deleted during audit-only work.
- Every proposed deletion has a dependency/call-graph basis.
- Phase 1 can now proceed with R1 as the first implementation change.

### Phase 0 — COMPLETE

### Phase 1 / Task 1.1 — Data repository architecture: COMPLETE

Receipt/patient repository migration merged to `main` in PR #33 (squashed commit `1ef58eb284f8d87ab3b40ff41ca882c3e7f8c771`). IndexedDB is now authoritative for receipt/patient records; legacy mirrors are migrated and retired.

Implementation branch: `refactor/phase1-repository`

Current implementation scope:
- Added `js/repository.js` as the single IndexedDB persistence boundary.
- Upgraded DB schema version to 3 without changing existing store names.
- Added safe migration that merges legacy receipt/patient localStorage mirrors into IndexedDB before removing those mirrors.
- Added an in-memory repository projection used by synchronous history/UI reads; it is hydrated from IndexedDB and is not persisted independently.
- Routed receipt save/delete/clear, patient writes, receipt-number generation, imports and sync-restore cache refresh through the repository.
- Removed active receipt/patient localStorage mirror writes from the domain layer.
- Added repository to HTML load order and service-worker app shell.

The next repository boundary is clinic settings/logo storage; UI-only preferences may remain local until their ownership is explicitly consolidated.
Objective: establish one authoritative persistence boundary before removing mirrors or legacy storage paths.


### Phase 1 / Task 1.2 — Clinic settings & logo repository: COMPLETE

Custom clinic logo is now owned by the repository settings store. Duplicate logo persistence helpers and direct localStorage logo writes were removed from the active domain flow. Import/sync restore use the repository API, and startup applies the repository logo after hydration.

### Phase 1 / Task 1.3 — Export pipeline consolidation: COMPLETE

Removed the disconnected jsPDF raster-PDF path, its data-URL helper and unused vendor asset; native print remains the single PDF/print authority. Removed unused Android `savePdfFromData()` and `saveImage()` bridge methods and unused Java imports. PNG export, transaction export, text sharing, preview and blank-template flows remain intact. Static syntax checks passed across all frontend JS files.

### Phase 1 / Task 1.4 — Navigation/state ownership: COMPLETE

Introduced explicit top-level `appRoute` state and made patient list/detail transitions history-aware. Opening Patients now creates a history entry; opening a patient creates `patient-detail`; browser/Android Back returns from detail to list and from list to receipt. Closing the patient section clears its stale route without reopening it. History/settings continue to use their existing history entries.

### Phase 1 / Task 1.5 — Service worker/cache lifecycle: COMPLETE

The service worker now uses a new cache namespace, never serves `sw.js` from its own cache, and uses network-first navigation/HTML with cached fallback. Static application assets retain offline cache-first behavior. This reduces stale-shell/update blocking while preserving offline use.

Next: **1.6 Settings ownership cleanup** — centralize durable clinic settings separately from UI-only preferences, then proceed to CSS responsibility cleanup.
Objective: prevent stale HTML/service-worker code from blocking updates while retaining offline cached assets.
Objective: make browser/Android Back deterministic for receipt, patients, patient detail, history and settings without removing existing screens.
Objective: retain one authoritative PDF/print path and one PNG path; remove proven disconnected export/bridge machinery without changing user-visible export capabilities.
Objective: move durable clinic configuration (custom logo first) behind the repository boundary while leaving UI-only preferences isolated until their own migration.
