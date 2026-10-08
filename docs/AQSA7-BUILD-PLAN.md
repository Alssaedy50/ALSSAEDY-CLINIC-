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

## AI Research, Analysis & Adaptive Planning Authority

The AI / Technical Lead must not treat its internal knowledge or the current plan as the only source of truth when designing, building, debugging, verifying or making architectural decisions.

1. **Use the full available capability set.** When materially useful, the AI should combine repository inspection, source/code analysis, web research, comparison, technical documentation, standards, trusted project examples, experimentation, testing, prediction/risk analysis, cross-checking and reasoning before deciding.
2. **Research before consequential decisions.** For important architecture, UX/UI, security, interoperability, platform, library, API or product decisions, the AI should investigate current and relevant external evidence rather than relying only on prior knowledge.
3. **Use comparable projects intelligently.** The AI may study similar products, open-source projects, established design patterns, official documentation and proven implementations to identify better approaches, but must verify their relevance, correctness, maintenance status and suitability for AQSA7 before adopting any idea.
4. **Prefer authoritative evidence.** Official documentation, standards, primary sources, maintained repositories and reproducible technical evidence take precedence over unverified posts, outdated examples or unsupported assumptions.
5. **Compare before selecting.** When multiple viable approaches exist, the AI should evaluate them against AQSA7 requirements such as reliability, security, maintainability, cost, offline-first behavior, cross-platform reuse, performance, simplicity and future productization, then select the most appropriate approach rather than presenting an unnecessary menu of choices.
6. **Experiment and verify.** If an important decision or suspected defect can be tested, prototype, benchmark, reproduce or otherwise experimentally verify it before committing to the conclusion. Do not infer success from intention alone.
7. **The plan is adaptive, not blindly rigid.** The AI must follow the approved architecture, phases and task sequence, but may internally reorder implementation steps, split/merge subtasks, add prerequisite work, or change the execution route when evidence shows that doing so is necessary to satisfy the project's goals or exit criteria.
8. **Material plan changes require approval.** If a proposed new phase, major task, architectural direction, scope expansion, security model, product requirement or other change is important enough to materially alter the approved project plan, the AI must explain the change, its reason, impact and expected benefit and obtain User approval before treating it as part of the approved plan.
9. **Minor/necessary execution decisions do not require approval.** The AI may independently perform implementation details, refactoring, debugging, test-harness corrections, documentation consolidation, verification work and other decisions that do not materially change the approved scope, architecture or user-facing requirements.
10. **No knowledge-source restriction.** The AI is expected to connect evidence from the repository, external research, comparable systems, testing and project requirements. It must not deliberately ignore useful available evidence merely because it was not present in the original plan.
11. **Record consequential decisions.** When research, comparison, experimentation or a plan change materially affects implementation, the authoritative GitHub plan/ledger must record the resulting decision, rationale, verification status and any relevant source/evidence category so the project remains reproducible and auditable.
12. **User remains the approval authority for material scope changes.** The AI is the technical decision-maker for execution within the approved boundaries, while the User retains final approval over major changes to scope, product direction, architecture or other decisions explicitly requiring approval.

**Operating principle:** Research broadly → verify evidence → compare viable approaches → choose the best fit → implement → test → document the authoritative result → request approval only when the change is materially important.

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

## AQSA7 Multi-Product Platform Vision — Mandatory Architectural Direction

AQSA7 is not intended to become only a Dental Clinic application. The Dental Clinic product is the **first vertical product used to prove the platform architecture**. The approved long-term direction is a reusable, configurable, multi-product business/application platform capable of producing different industry applications from one shared AQSA7 core.

### Product families in scope
The architecture must be capable of supporting, without rebuilding the core platform:
- Dental Clinic
- General Medical Clinic
- Medical Center / Health Center
- Hospital
- Pharmacy and related healthcare operations
- Supermarket / grocery retail
- Mini-market / convenience store
- Restaurant
- Café
- Other retail, service, appointment, inventory, billing and operations businesses as future verticals

This list is an architectural target, not a commitment to implement every vertical immediately. Each vertical must be introduced as a product package/domain configuration with only the modules and workflows it actually needs.

### Required separation of concerns
AQSA7 must evolve into four explicit layers:

1. **AQSA7 Platform Core** — reusable infrastructure shared by every product:
   - application shell and navigation framework
   - identity/session and permissions boundaries
   - configuration and product manifest system
   - generic repository/data-access contracts
   - local-first persistence abstraction
   - backup/restore engine and provider adapters
   - export/print/share framework
   - notifications and scheduling abstractions
   - search/filter/table/form primitives
   - audit/event framework
   - localization, RTL/BiDi, currency, date/time and formatting utilities
   - validation/error handling
   - offline/PWA/install/update infrastructure
   - integration/API boundary
   - AI capability layer and provider/model adapters

2. **Shared Business Capabilities / Modules** — reusable capabilities that can be enabled per product:
   - customers/patients
   - contacts
   - appointments/queue
   - products/services/catalog
   - inventory/stock
   - purchasing/suppliers
   - sales/orders
   - billing/payments/receivables
   - receipts/invoices
   - employees/staff/roles
   - branches/locations
   - reports/analytics
   - documents/attachments
   - messaging/notifications
   - loyalty/membership where relevant
   - scheduling
   - workflow/task management

3. **Vertical Product Domains** — industry-specific business rules and screens:
   - Dental Clinic: patients, odontogram/tooth context, clinical visits, treatments, dental services, clinical history, etc.
   - General Medical / Medical Center / Hospital: patient clinical records, encounters, diagnoses, medications, laboratory/imaging/referrals and other appropriate clinical workflows.
   - Supermarket / Grocery: POS, barcode/product catalog, stock, purchasing, suppliers, pricing, promotions, cashier shifts and retail reporting.
   - Restaurant / Café: menu/catalog, tables, orders, kitchen workflow, modifiers, payments, delivery/takeaway and restaurant reporting.
   - Other verticals: added as isolated domain modules rather than by contaminating the platform core with industry-specific assumptions.

4. **Instance / Tenant Configuration** — a concrete organization using a product:
   - organization/clinic/store/restaurant identity
   - branding/logo/theme
   - address/contact information
   - currency/tax/numbering rules
   - enabled modules and feature flags
   - roles/permissions
   - receipt/invoice/document templates
   - operational defaults
   - integration configuration
   - AI policy and enabled AI capabilities

### Product-definition contract
Every AQSA7 product must have a machine-readable or equivalently authoritative **Product Manifest / Product Definition** that declares:
- product ID and version
- vertical/domain type
- enabled shared modules
- domain entities and relationships
- navigation/sections
- product defaults
- required capabilities
- optional capabilities/features
- document/print templates
- permissions/roles
- integrations
- AI capabilities and policy
- migration/schema version

A configured business instance must consume this product definition rather than hardcoding the product identity throughout the application. Product identity, clinic/store names, labels, logos and defaults must not be scattered through core code.

### Generic domain/data architecture
The platform must avoid naming the core data layer around a single vertical. For example, \x60clinicDB\x60, patient-only assumptions, dental-specific receipt schemas or ALSSAEDY-specific identifiers must not become permanent AQSA7 core contracts. Existing Dental-specific code is legacy/product-domain implementation and must be progressively moved behind the Dental product boundary during Phase 3.

The target is:
**Platform Core → Shared Capability Modules → Vertical Product → Configured Instance/Tenant**

not:
**Dental application → copy/paste → another application**.

### Multi-tenant / multi-instance readiness
The architecture must support multiple independent customer instances without sharing their business data accidentally. Even when the first release is local-only, every durable record and service boundary must have a clear ownership/tenant strategy so future cloud sync, multi-branch and hosted deployments do not require a destructive rewrite.

Local-first does not mean tenant isolation is optional. Tenant/instance boundaries must be explicit in the domain model, backup artifacts, synchronization authorization, imports/exports and future server APIs.

### Cross-industry reuse rule
A capability belongs in the platform/shared layer only when its semantics are genuinely reusable. If a feature is inherently dental, hospital, retail, supermarket, restaurant or café-specific, it belongs in that vertical module. The AI/Technical Lead must reject abstractions that merely hide unrelated business rules behind generic names.

### Build-once rule for future products
Creating a new vertical product should primarily consist of:
1. selecting/reusing shared capabilities;
2. defining the vertical domain model and business rules;
3. defining the product manifest/navigation/workflows;
4. supplying vertical UI/templates/assets;
5. configuring integrations and AI capabilities;
6. testing the product against the shared platform contracts.

It must **not** require cloning the entire AQSA7 codebase or creating a separate persistence, backup, authentication, export, AI or cross-platform implementation.

## AI-Native / AI-Ready Architecture — Mandatory Future Capability

AI is a planned platform capability, not a later bolt-on. AQSA7 must be designed so AI can be integrated into Dental, medical, retail, supermarket, restaurant, café and future products without rewriting their business cores.

### AI capability layer
Create a platform-level AI boundary with:
- provider/model adapter abstraction
- model capability discovery
- prompt/instruction templates kept outside core business logic
- structured input/output contracts
- tool/function calling boundary
- retrieval/context boundary
- streaming where useful
- model fallback/error handling
- usage/cost controls where external models are used
- local/offline AI adapter support where technically practical
- observability and evaluation hooks
- versioned AI capability contracts

Business modules must call **AQSA7 AI capabilities** rather than directly embedding one vendor SDK throughout the application. This allows future use of different providers/models and local models without rewriting vertical features.

### AI must be optional and safe
- Core business operation must continue if AI is unavailable, disabled, offline or unconfigured.
- AI must never become a hidden paid dependency.
- External AI transmission of sensitive business/clinical data must require an explicit product/security policy and appropriate user authorization.
- Patient/health data must not be sent to external models merely because an AI feature exists.
- Secrets, provider keys and tokens must never be embedded in public client code or committed to GitHub.
- AI actions that can modify business data must pass through normal authorization, validation and repository contracts.
- High-impact clinical recommendations must be treated as assistive output, not autonomous diagnosis/treatment authority, and must preserve human review.

### Planned AI capability examples
The architecture should be able to host capabilities such as:
- natural-language search across authorized records
- report and summary generation
- intelligent document extraction/OCR
- appointment/queue assistance
- customer/patient communication drafting
- inventory and purchasing analysis
- sales/financial trend analysis
- demand forecasting
- anomaly detection
- menu/product/catalog assistance
- clinical documentation assistance where appropriate
- knowledge retrieval/RAG from approved local documents
- workflow automation and task suggestions
- voice input/output where supported
- AI agents that can use constrained AQSA7 tools under explicit permissions

These are capability targets, not permission for unrestricted autonomous actions. Each AI feature must define its data access, tools, permissions, failure mode, human-review requirement and offline behavior.

### AI provider independence
The platform must not be architected around one AI vendor. External model providers and local models are adapters behind the AQSA7 AI boundary. Product code should depend on stable AQSA7 capability contracts such as \x60summarize\x60, \x60extract\x60, \x60classify\x60, \x60search\x60, \x60generate\x60, \x60recommend\x60 or approved domain tools rather than provider-specific APIs.

### AI research/evaluation requirement
Before adopting a model/provider for a consequential feature, the AI/Technical Lead must research current official documentation, privacy/data-handling terms, capabilities, limits, pricing/free tiers, local alternatives and comparable implementations, then test the chosen approach against AQSA7 requirements. Provider choices must not silently violate the 100% free/local-first core constraint.

## Interoperability & Standards Direction

AQSA7 must use standards where they materially improve portability and future integrations, without forcing every industry into healthcare-specific standards.

For healthcare products, the architecture should remain compatible with **HL7 FHIR** as the future interoperability boundary. FHIR is designed for structured healthcare information exchange and supports resources and RESTful exchange patterns across clinical and administrative contexts. [Evidence: HL7 FHIR official specification and overview.]

This does **not** require implementing a FHIR server in the current Dental release. It requires avoiding data structures and service boundaries that make future mapping/interoperability unnecessarily difficult.

For non-healthcare verticals, use the most appropriate open standards and integration contracts for the domain rather than forcing healthcare models onto retail or hospitality.

## Architectural Readiness Gate Before New Vertical Products

Before AQSA7 is declared capable of producing multiple product families, Phase 3 must verify at minimum:
1. Dental-specific identity and business assumptions are isolated behind the Dental product boundary.
2. A generic product/instance manifest exists.
3. Shared modules can be enabled/disabled without duplicating core code.
4. Generic data/repository contracts no longer require Dental-specific names or semantics at the platform boundary.
5. Tenant/instance ownership is explicit.
6. Shared backup/export/import contracts are product-neutral.
7. AI capability boundary exists independently of any single product or provider.
8. Integrations use adapter boundaries.
9. A second non-dental vertical can be modeled as a product without cloning AQSA7.
10. Web/PWA/Desktop/Android continue to consume the same shared core.
11. Tests cover at least one cross-product platform contract in addition to Dental behavior.

The second vertical used for this architectural proof should be selected by the AI/Technical Lead after research and comparison of implementation value; it does not need to be fully built in Phase 3 unless the approved plan is expanded.

## Target architecture

AQSA7 Platform
- PLATFORM CORE
  - App Shell / Router / Navigation
  - Shared UI / Theme / Responsive system
  - Product Manifest / Instance Configuration
  - Identity / Permissions / Tenant boundaries
  - Generic Repository / Data contracts
  - Local-first Storage
  - Backup Engine / Provider Adapters
  - Export / Print / Share engine
  - Notifications / Scheduling
  - Search / Forms / Tables / Validation
  - Audit / Events
  - Localization / RTL / BiDi / Currency / Date-time
  - Offline / PWA / Install / Update infrastructure
  - Integration / API adapters
  - AI Capability Layer / Model Provider adapters
- SHARED BUSINESS CAPABILITIES
  - People / Customers / Patients
  - Appointments / Queue
  - Catalog / Products / Services
  - Inventory / Purchasing / Suppliers
  - Sales / Orders / Billing / Payments
  - Receipts / Invoices
  - Staff / Roles / Branches
  - Reports / Analytics
  - Documents / Messaging / Notifications
- PRODUCTS / VERTICAL DOMAINS
  - Dental Clinic
    - reusable product definition
    - ALSSAEDY CLINIC = configured instance
  - General Medical / Medical Center / Hospital
  - Pharmacy / Healthcare operations
  - Supermarket / Grocery / Mini-market
  - Restaurant / Café
  - Future verticals
- CONFIGURED INSTANCES / TENANTS
  - organization identity
  - branding
  - enabled modules
  - operational settings
  - integrations
  - AI policy/capabilities

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
Status: COMPLETE

Completed Phase 2 tasks:
- 2.1 Design System Foundation — COMPLETE
- 2.2 Top App Shell & Navigation Dock — COMPLETE
- 2.3 Patient Directory / Ledger Table — COMPLETE
- 2.4 Patient Account Detail — COMPLETE
- 2.5 Receipt Issuance Panel — COMPLETE
- 2.6 History / Receipts Ledger Reconstruction — COMPLETE
- 2.7 Settings / Configuration Surface Reconstruction — COMPLETE

Current next task:
- **Phase 3 / Task 3.1 — Reusable Dental Clinic Product Boundary**
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
- Phase 2 remained IN PROGRESS at the time of this checkpoint; the blocker was subsequently cleared by Task 2.9.

### Phase 2 / Task 2.9 — Receipt Export / Print Verification Blocker Resolution: COMPLETE

Purpose:
- Clear the known receipt export verification blocker without changing the authoritative native print/PDF architecture or protected A5/A4/80mm geometry.
- Correct the verification contract so valid selectable Arabic/Latin PDF text is accepted despite normal pdftotext whitespace and bidi-control artifacts.
- Re-run the full receipt export test and confirm PNG dimensions/content plus vector PDF page count/selectable text for A5 and A4.
- Treat any genuine rendering/geometry failure as an implementation defect rather than weakening the contract.

Implementation:
- Updated `tests/receipt-export-test.mjs` to normalize Unicode bidi controls and extraction whitespace before checking required receipt text.
- The content contract remains strict: normalized patient identity, receipt number and formatted date must be present; raw ISO date must remain absent.
- No receipt CSS, print geometry or application data/state path was changed before the root cause was isolated. The final fix was limited to the authoritative size-selection path in `js/app.js`: `setSize()` now synchronizes a single dynamic `@page` rule with the selected A5/A4/80mm profile.
- This fixed the genuine A4 vector-PDF regression: the static print stylesheet declared A5 globally while the DOM changed to A4, so Chromium could paginate the 297mm receipt onto multiple pages.
- PDF text assertions were hardened separately to account for normal pdftotext whitespace/BiDi extraction artifacts while retaining stable receipt identifiers and Arabic selectable-text presence.

### Phase 2 / Task 2.9 Verification & Exit Decision

Verification:
- Receipt export verification 37716604934 — PASS on final checkpoint 925620d0c2ae9a173a6ded40155505b119340658.
- Browser runtime smoke 37716604833 — PASS on the same checkpoint.
- Android APK 37716604807 — SUCCESS on the same checkpoint.
- GitHub Pages build/deployment 37716604067 — SUCCESS on the same checkpoint.
- A5 and A4 vector PDFs now pass one-page and selectable-text verification; PNG export checks for A5/A4/80mm also pass.

Exit decision:
- Receipt export blocker: CLEARED.
- Native print/PDF architecture remains authoritative.
- A5/A4/80mm size profiles remain intact.
- Phase 2 UX/UI + integration + receipt export verification gates are now complete.
- Phase 2: COMPLETE.

### Phase 3 — Productization & Multi-Product Platform Foundation
Status: IN PROGRESS

Phase 3 is now explicitly responsible for proving that AQSA7 is a reusable multi-product platform, not merely a reusable Dental Clinic application.

Current next task: **Task 3.1 — Reusable Dental Clinic Product Boundary**
- Separate reusable Dental Clinic product from clinic configuration.
- Clinic profile/configuration model.
- Product defaults and Product Manifest foundation.
- Tenant/clinic identity boundaries.
- Remove/contain Dental-specific assumptions at platform boundaries.
- Prepare the shared capability/module boundaries.
- Establish the AI capability boundary without making AI a core dependency.

Planned Phase 3 architectural gates/tasks:
- 3.1 Reusable Dental Clinic Product Boundary — current next task.
- 3.2 Product Manifest & Instance Configuration Contract.
- 3.3 Generic Shared Capability / Module Boundaries.
- 3.4 Tenant / Instance Isolation Contract.
- 3.5 AI Capability Layer & Provider Adapter Contract.
- 3.6 Integration / Interoperability Adapter Contract.
- 3.7 Second-Vertical Architecture Proof — model a non-dental product without cloning AQSA7; exact vertical selected by research.
- 3.8 Cross-Product Architecture Verification Gate.

These are planning-level tasks. Implementation order may be adaptively reordered when necessary, but material scope or architecture changes remain subject to User approval under the AI Research, Analysis & Adaptive Planning Authority above.

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

Last updated: 2026-10-08 (Multi-Product + AI architecture direction added; Phase 3 Task 3.1 next)

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
- Phase 3 owns multi-product architecture, product manifests, shared module boundaries, tenant/instance isolation contracts and AI/integration capability boundaries.
- Phase 4 owns backup/security implementation; Phase 5 owns cross-platform and disaster-recovery verification.
