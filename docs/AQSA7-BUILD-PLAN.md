# AQSA7 — Engineering Build Plan & Continuity Ledger

Status: ACTIVE
Last updated: 2026-10-08
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
   - localStorage may only be used for explicitly scoped UI preferences, temporary draft/recovery state, migration compatibility, or similarly non-authoritative concerns.
   - No second persistent database may be introduced for the same domain.

3. **Assets & hosting**
   - Prefer local/static assets and free static hosting.
   - Avoid heavy remote runtime dependencies unless justified.
   - Hosting must not be required for local clinic data persistence or core receipt operation.

4. **Export & print**
   - Native browser/WebView print is the authoritative PDF/print engine.
   - Preserve A4, A5 and 80mm contracts.
   - No paid/cloud PDF conversion.

5. **Data protection / backup**
   - AQSA7 must provide scheduled local encrypted JSON backup.
   - Backup/restore integrity, encryption design and scheduling are mandatory reliability work before release.

## Cloud Backup & Provider Abstraction — Mandatory Architecture

Cloud backup is an **optional disaster-recovery layer**, not the primary database and not a mandatory requirement for operating AQSA7.

### 1. Local-first authority
- IndexedDB remains the single authoritative durable application database.
- The application must remain fully usable offline without any cloud account.
- Cloud backup/sync must never replace IndexedDB or introduce a second authoritative clinic database.
- Cloud outages, expired free quotas, unavailable networks or provider API changes must not prevent core clinic operation.

### 2. Encrypted backup model
- Cloud uploads must contain an encrypted backup artifact rather than exposed patient/clinic JSON.
- Patient and clinic data must be encrypted before leaving the device.
- Encryption/decryption and backup integrity must be designed, implemented and verified before release.
- Restore must verify integrity before replacing or merging local data.
- The encryption key/password must never be stored inside the cloud backup artifact.

### 3. Provider abstraction
AQSA7 must implement a generic **Backup Provider / Cloud Provider Adapter** boundary.

The backup engine owns:
- backup serialization
- compression where useful
- encryption
- integrity/version metadata
- scheduling
- retention/version policy
- restore validation

Provider adapters own only:
- authentication/authorization with the provider
- upload
- download
- listing/version lookup
- deletion where supported

Provider adapters must not contain clinic business logic, duplicate the repository, or become competing data stores.

### 4. Initial provider and future providers
The first planned user-selectable provider is **Google Drive**, using the customer's own account and OAuth authorization.

The architecture must allow later providers without rebuilding the backup engine:
- Google Drive — first provider
- Microsoft OneDrive — planned alternative
- Dropbox — planned alternative
- AQSA7/self-hosted or other compatible provider — future option if economically and technically justified

The provider list is extensible; no provider is allowed to become a hidden core dependency.

### 5. Free-first requirement
- The cloud-backup feature must be usable with free consumer storage where the provider permits it.
- AQSA7 must not require a paid subscription for core clinic operation.
- The UI must clearly distinguish **free provider limits** from AQSA7 requirements.
- If a free quota is exceeded, the application must warn the user and continue local operation; it must never silently lose or delete local data.
- No claim of “free forever” may be made for an external provider.

### 6. User-controlled connection
Settings must eventually provide a clear flow similar to:
- Cloud Backup: Disabled / Enabled
- Provider: Google Drive / other supported providers
- Connect / Disconnect account
- Last successful backup
- Backup status/error
- Backup Now
- Restore Backup
- Export encrypted backup locally

OAuth tokens/credentials must be handled through the provider's supported authorization flow and must not be hardcoded into the application or committed to GitHub.

### 7. Backup scheduling and reliability
The final product must support:
- automatic scheduled backup/trigger where the platform permits
- retry after temporary network failure
- visible last-success timestamp
- pending/failed backup status
- manual Backup Now
- manual Restore
- safe restore with validation and conflict handling
- local encrypted backup fallback

The system must never report a cloud backup as successful unless the provider confirms the upload and the backup artifact passes local integrity validation.

### 8. Recovery scenarios
Phase 4/5 must explicitly verify:
- phone lost/damaged → install/open AQSA7 on another device → authenticate to the chosen provider → discover backup → verify → restore
- browser storage cleared → restore from encrypted local/cloud backup
- no internet → clinic continues from IndexedDB
- cloud provider unavailable → clinic continues locally
- free cloud quota exceeded → local operation continues and user receives a clear warning
- corrupted/incomplete backup → restore is rejected without destructive replacement

### 9. Security and privacy boundary
- Cloud backup is a transport/storage destination, not a place where raw patient records should be exposed.
- Provider OAuth permissions must be scoped as narrowly as technically possible.
- Credentials/tokens are secrets and must never be placed in public client code, GitHub, or backup artifacts.
- Tenant/clinic isolation and any server-side sync authorization remain Phase 4 concerns for multi-clinic/cloud sync.

### 10. Cross-platform behavior
The same shared backup engine must be used by Web/PWA/Desktop browser and Android.
Only unavoidable platform capabilities may use thin adapters, such as:
- secure/local file access
- native share
- background scheduling
- Android-specific file/notification APIs

No platform-specific backup implementation may become a second business/data path.

### 11. Recommended resilience model
AQSA7 should follow a practical 3-layer protection model:
1. **IndexedDB:** live authoritative local data.
2. **Encrypted local backup:** user-controlled recovery copy.
3. **Encrypted cloud backup:** optional off-device disaster recovery.

This is the target model; it does not make a cloud provider mandatory for core operation.

## Target architecture

AQSA7
- CORE
  - App Shell
  - Router / Navigation
  - Shared UI
  - Theme
  - Storage / Data layer
  - Backup engine
  - Backup provider adapters
  - Export engine
  - Notifications
  - Shared utilities
- PRODUCTS
  - Dental Clinic
    - reusable product
    - ALSSAEDY CLINIC = configured instance
  - future products

## Cross-Platform Product Architecture — Mandatory Constraint

AQSA7 is a **single cross-platform application**, not separate products that are independently rebuilt for Web, Desktop and Android.

1. One shared application core.
2. Same application as responsive Web App/PWA in mobile and desktop browsers and Android wrapper.
3. Build once; core feature changes must not require separate business-logic implementations.
4. Platform adapters only where technically necessary.
5. Phase 2 screens/components are responsive for phone, tablet and desktop from first implementation.
6. Supported clients use the same data contracts, validation, receipt behavior and state model.
7. No platform-specific rebuild of core product features.
8. Phase 5 verifies the shared product across browser/PWA, desktop browser and Android.

**Architecture objective: Build once → share the core → adapt only the platform boundary → run Web/PWA/Desktop/Android without rebuilding the product.**

## Program phases

### Phase 0 — Deep Audit
Status: COMPLETE

### Phase 1 — Architecture Cleanup
Status: COMPLETE

### Phase 2 — UX/UI Reconstruction
Status: IN PROGRESS

Completed Phase 2 tasks:
- 2.1 Design System Foundation — COMPLETE
- 2.2 Top App Shell & Navigation Dock — COMPLETE
- 2.3 Patient Directory / Ledger Table — COMPLETE
- 2.4 Patient Account Detail — COMPLETE
- 2.5 Receipt Issuance Panel — COMPLETE
- 2.6 History / Receipts Ledger Reconstruction — COMPLETE
- 2.7 Settings / Configuration Surface Reconstruction — COMPLETE

Current next task:
- **Task 2.9 — Receipt Export / Print Verification Blocker Resolution**
- Executor: **AI / Technical Lead**

### Phase 2 / Task 2.7 — Settings / Configuration Surface Reconstruction: COMPLETE

Implementation:
- Added a dedicated AQSA7 Settings overview/header with clear configuration categories.
- Preserved all existing setting IDs, handlers and persistence/state ownership; no duplicate settings state machine was introduced.
- Standardized settings cards and interactive controls with Phase 2 design tokens, responsive spacing and a 44px minimum control contract.
- Added runtime-smoke coverage for the settings overview, six category chips, setting-card presence and touch-target contract.
- No receipt print/export geometry was changed.

Files changed:
- index.html
- css/polish.css
- .github/workflows/runtime-smoke.yml

Verification:
- Runtime Smoke 37714713602 — PASS on checkpoint 4fe031730a23dacab5ccfa488383904229613526.
- Pages build/deployment 37714713371 — SUCCESS on the same checkpoint.
- Android APK 37714713699 — SUCCESS on the same checkpoint.
- Receipt image export 37714713641 — FAILS at the existing PDF selectable-text assertion after PDF generation; unrelated to Task 2.7 and remains a known release blocker.
- Initial Runtime Smoke 37714623010 exposed 29 settings controls below 44px; root cause was existing control sizing overriding the new minimum and was corrected in the final checkpoint.

Exit decision:
- Implementation/design criteria: MET.
- Browser runtime gate: PASS.
- Android: PASS.
- Pages: PASS.
- Task 2.7: COMPLETE.
- Known receipt-export verification issue remains a separate release blocker.

### Phase 2 / Task 2.8 — UX/UI Integration & Cross-Surface Consistency Pass: COMPLETE

Purpose:
- Verify and consolidate the completed Phase 2 surfaces as one coherent product rather than independent screen redesigns.
- Detect duplicated styling/state/rendering responsibilities introduced during Tasks 2.1–2.7.
- Verify shared navigation, spacing, typography, status semantics, financial presentation and responsive behavior across Receipt, Patients, Patient Account, History and Settings.
- Preserve the authoritative IndexedDB/repository model and all existing receipt print/export geometry.

Exit criteria:
1. One shared visual token system is used across all Phase 2 surfaces.
2. Navigation/state ownership remains single-path with no duplicate screen state machines.
3. Primary actions and interactive controls meet the 44px contract where applicable.
4. Desktop and mobile use the same DOM/data path with responsive CSS rather than duplicated screens.
5. No Phase 2 surface introduces console/page errors during browser runtime smoke.
6. Existing core workflows remain reachable: receipt, patients, history, settings, patient account, receipt load/edit/save/print/share.
7. No protected A5/A4/80mm receipt geometry regression.
8. CI browser smoke, Android build and Pages build all pass for the final integration checkpoint.

Verification:
- Static/source audit: no duplicate JavaScript function definitions were found across the authoritative Phase 2 JS files; the same IndexedDB/repository ownership remains intact.
- Mobile browser smoke 37715933948 — PASS on final integration checkpoint 8b22302d7e2e893ac747ce0a74792aca2f037722.
- Desktop browser integration smoke: added to the shared runtime workflow; two CI test-harness-only modal-transition assumptions were corrected without changing product behavior. Final mobile+desktop browser gate is PASS on the same checkpoint.
- Android APK 37715934064 — SUCCESS on the same checkpoint.
- GitHub Pages build/deployment 37715933128 — SUCCESS on the same checkpoint.
- Receipt export verification 37715933944 — failed only because pdftotext inserted whitespace/bidi marks into mixed Arabic/Latin text and the test asserted exact raw substrings. The failure was isolated to test normalization, not receipt geometry or PDF generation.

Exit decision:
- One shared Phase 2 token/state/rendering architecture preserved.
- Mobile and desktop browser integration gates: PASS.
- Android build: PASS.
- Pages deployment: PASS.
- Task 2.8: COMPLETE.
- Phase 2 remains IN PROGRESS until the receipt export/print verification blocker is cleared.

### Phase 2 / Task 2.9 — Receipt Export / Print Verification Blocker Resolution: IN PROGRESS

Purpose:
- Clear the known receipt export verification blocker without changing the authoritative native print/PDF architecture or protected A5/A4/80mm geometry.
- Correct the verification contract so valid selectable Arabic/Latin PDF text is accepted despite normal pdftotext whitespace and bidi-control artifacts.
- Re-run the full receipt export test and confirm PNG dimensions/content plus vector PDF page count/selectable text for A5 and A4.
- Treat any genuine rendering/geometry failure as an implementation defect rather than weakening the contract.

Implementation:
- Updated `tests/receipt-export-test.mjs` to normalize Unicode bidi controls and extraction whitespace before checking required receipt text.
- The content contract remains strict: normalized patient identity, receipt number and formatted date must be present; raw ISO date must remain absent.
- No receipt CSS, print geometry or application data/state path was changed.

### Phase 3 — Productization
- Separate reusable Dental Clinic product from clinic configuration.
- Clinic profile/configuration model.
- Product defaults.
- Tenant/clinic identity boundaries.
- Prepare for future sellable instances.

### Phase 4 — Reliability & Security
Mandatory cloud-backup work added:
- local encrypted backup integrity
- backup/restore versioning and migration
- scheduled backup/reminder behavior
- generic Backup Engine
- generic Backup Provider Adapter interface
- Google Drive provider as first implementation target
- OAuth/token handling
- encrypted upload/download
- restore validation and conflict handling
- free-quota/error handling
- offline/cloud-outage behavior
- lost-device recovery flow
- local + cloud backup status
- tenant isolation and sync authorization
- Android/Web platform adapter safety

Cloud backup is optional and must not become a paid or online-only dependency.

### Phase 5 — Full Regression
Must verify:
- all buttons/actions/forms/inputs
- receipt create/edit/save
- patients CRUD/navigation
- history/search
- backup/import/restore
- local encrypted backup
- cloud provider connection
- Google Drive upload/download/restore
- backup failure/retry/quota behavior
- sync
- logo
- PNG/PDF/print/share
- A5/A4/80mm
- Android back/file/share/print
- offline/cache upgrade
- Arabic RTL/BiDi
- cross-platform same-core behavior on mobile Web/PWA, desktop browser and Android wrapper
- disaster recovery from lost/damaged device

### Phase 6 — Release
- version bump
- CI build
- signed APK verification
- release notes
- SHA256
- GitHub release
- final acceptance

Last updated: 2026-10-08 (Phase 2 Task 2.7 completed; Task 2.8 started)

## Current authoritative decisions

- AQSA7 core remains 100% free/local-first by architecture.
- IndexedDB remains the single durable local application database.
- Cloud backup is optional disaster recovery, not the primary database.
- Cloud backup artifacts must be encrypted before upload.
- Provider access is abstracted behind adapters.
- Google Drive is the first planned provider; OneDrive and Dropbox are future provider options.
- No external provider may become a hidden paid/core dependency.
- Web/PWA/Desktop browser/Android share one application core.
- Platform/provider adapters must remain thin and must not duplicate domain logic.
- Phase 4 owns backup/security implementation; Phase 5 owns cross-platform and disaster-recovery verification.
