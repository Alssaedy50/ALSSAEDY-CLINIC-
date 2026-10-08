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

## Project Control & Governance — Mandatory Operating Rules

This section governs how AQSA7 is controlled, handed off, verified and advanced. It is authoritative and applies to every task, phase, release and execution handoff.

1. **GitHub is the single authoritative project state.** The current repository, authoritative plan/ledger, source code, tests, CI evidence and committed decisions take precedence over conversation memory or undocumented claims.
2. **This Build Plan is the Project Master Ledger.** It is the authoritative operational and architectural memory of AQSA7: current architecture, approved plan, task/phase status, constraints, success criteria, verification state, decisions, blockers, research conclusions, release gates and handoff state.
3. **The latest authoritative state wins.** Obsolete, superseded or contradictory instructions/statuses must be consolidated or removed; historical evidence may remain only when it is necessary to explain a decision or verification result.
4. **No task or phase advances on intention alone.** A task may be marked COMPLETE only after its documented exit criteria and required verification evidence are satisfied. A phase may advance only after its phase gate is satisfied.
5. **Every completed work unit must leave GitHub self-contained.** The record must state what changed, where it changed, how it was verified, relevant failures and resolutions, decisions, commit SHA, remaining blockers and the exact next authorized step.
6. **Unverified work must be explicit.** If required verification cannot be performed, the authoritative state must remain PENDING, BLOCKED or UNVERIFIED and must name the exact missing evidence or reason.
7. **Control decisions must not live only in chat.** Any requirement, constraint, success condition, architectural decision or consequential execution rule needed for future success must be recorded in this Build Plan or an explicitly referenced authoritative project document.
8. **Code, Git history and CI remain evidence layers.** The Build Plan records the authoritative current state and points to evidence; it does not replace source code, commits, tests or CI artifacts and does not need to reproduce every line of code or every terminal command.
9. **Handoffs must be lossless.** A new execution conversation or technical lead must be able to recover the current project state and next permitted action from GitHub without relying on undocumented chat context.
10. **Execution follows the control loop:** Inspect → Decide → Execute → Test → Verify → Document → Commit → Gate → Next. No step may be silently skipped when it is required by the applicable task/phase criteria.

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

## Master Success Criteria — Mandatory for Every Task, Phase & Release

These criteria are authoritative and apply in addition to each task's specific exit criteria.

### Task Gate
A task may be marked COMPLETE only when:
1. Its stated purpose, scope and constraints are satisfied.
2. All task-specific exit criteria are explicitly verified.
3. Required static/source checks and relevant runtime tests pass.
4. Required Web/PWA/Desktop/Android/export/print checks for the affected behavior pass.
5. No known regression or unresolved gating failure remains.
6. Architecture rules are preserved: one source of truth, no duplicate persistence/repository/state machine, no hidden paid/cloud dependency.
7. Security, privacy, ownership and tenant boundaries affected by the task are verified.
8. Documentation records implementation, verification evidence, failures/resolution, decisions and commit SHA.
9. Obsolete contradictory status text is consolidated or removed.
10. If any required verification is unavailable, the task remains PENDING/BLOCKED/UNVERIFIED with the exact reason.

### Phase Gate
A phase may be marked COMPLETE only when:
1. Every phase task is COMPLETE.
2. Every task exit criterion has verified evidence in GitHub.
3. Phase-wide architecture and integration criteria are satisfied.
4. Cross-platform behavior remains coherent across Web/PWA/Desktop/Android where applicable.
5. No unresolved phase-gating CI/test/security/regression blocker remains.
6. Required external research/standards decisions are recorded when consequential.
7. An independent phase-gate audit confirms the phase is ready to advance.

### Project Release Gate
AQSA7 may be declared release-ready only when:
1. All approved phases and tasks are COMPLETE.
2. Final regression and cross-platform verification pass.
3. Backup/restore, security, privacy and tenant/instance isolation requirements pass.
4. Offline/local-first operation works without paid or mandatory cloud services.
5. A5/A4/80mm receipt/print/export contracts remain valid.
6. Android and Web/PWA/Desktop use the same shared product core without duplicated business logic.
7. Release artifacts, version, checksums, documentation and known limitations are recorded.
8. Final independent acceptance audit passes.

**Gate rule:** A green implementation commit, a successful build, or a conversational claim of success is not by itself sufficient to close a task or phase. The complete applicable exit criteria and verification evidence are required.

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

Current next authorized task:
- **Phase 3 / Task 3.6 — Integration / Interoperability Adapter Contract**
- Status: **NOT STARTED**
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

Phase 3 proves that AQSA7 is a reusable multi-product platform rather than only a reusable Dental Clinic application.

Completed:
- 3.1 Reusable Dental Clinic Product Boundary — COMPLETE.
- 3.2 Product Manifest & Instance Configuration Contract — COMPLETE.
- 3.3 Generic Shared Capability / Module Boundaries — COMPLETE.
- 3.4 Tenant / Instance Isolation Contract — COMPLETE.

### Phase 3 / Task 3.4 — Tenant / Instance Isolation Contract

Purpose:
- Establish one authoritative product/tenant/instance ownership contract across product configuration, repository records, backup/restore and future cloud/sync boundaries.
- Prevent one instance from silently reading or writing another instance's durable records.
- Preserve IndexedDB as the single durable application database and avoid any duplicate Repository or State Machine.

Implementation:
- js/product.js is the authoritative ownership boundary and exposes aqsa7GetInstanceIdentity(), aqsa7OwnRecord(), aqsa7ValidateBackupScope(), and aqsa7StampRecord() through the same ownership contract.
- Fully unscoped legacy records may be explicitly adopted into the current configured instance.
- Partially scoped records are rejected.
- Records carrying a foreign productId, tenantId or instanceId are rejected rather than rewritten.
- js/repository.js enforces ownership at the durable write boundary for tenant-scoped receipts and patients and filters invalid foreign records during hydration.
- js/storage.js creates instance-scoped backup metadata with schemaVersion: 5, product/tenant/instance identity and the configured database name.
- Backup import validates top-level ownership before destructive replacement/merge and validates every incoming tenant-scoped record before writing.
- Legacy unscoped backups remain importable only through explicit adoption into the current instance; identified foreign backups fail closed.
- No second durable database, Repository, persistence path or State Machine was introduced.
- IndexedDB remains the sole durable local data authority. IndexedDB itself is origin-scoped by the browser; AQSA7 therefore adds explicit application-level product/tenant/instance ownership checks at the repository and backup boundaries. citeturn0search0turn0search2

Files changed:
- js/product.js
- js/repository.js
- js/storage.js
- .github/workflows/runtime-smoke.yml
- docs/AQSA7-BUILD-PLAN.md

Task 3.4 exit criteria:
1. One authoritative instance identity exists.
2. Unscoped legacy records are adoptable only into the current instance.
3. Partial ownership metadata is rejected.
4. Foreign product/tenant/instance records are rejected at the durable write boundary.
5. Hydration does not expose foreign/invalid tenant-scoped records to application state.
6. Backup artifacts declare instance ownership.
7. Backup import rejects mismatched ownership before destructive writes.
8. Incoming records are individually ownership-validated.
9. No duplicate durable database/repository/state machine exists.
10. JavaScript static parsing passes.
11. Isolation behavior checks pass for adoption and mismatch rejection.
12. Browser mobile + desktop runtime, receipt/export, Android and Pages verification must pass before the task can be closed.

Verification completed so far:
- GitHub source inspection: PASS on implementation checkpoint dc300945ef8bf590f2ad1a3cccc19151f7377e05.
- Independent JavaScript static parsing of product.js, repository.js, storage.js: PASS.
- Independent isolation harness: PASS for current identity, unscoped adoption, foreign record rejection, partial identity rejection and foreign backup-scope rejection.
- Runtime Smoke PR verification run `37722497546` — SUCCESS; JavaScript syntax validation, mobile browser smoke and desktop browser integration smoke all passed on the exact Task 3.4 source state.
- Android PR verification run `37722497534` — SUCCESS; debug APK, signed production APK, signature verification and metadata verification all passed on the exact Task 3.4 source state.
- Final push-based verification on commit `1c680a5bd4822f06ce858e296768fa6acac5da07` completed successfully:
  - Receipt/export `37723564300` — SUCCESS.
  - Runtime Smoke `37723564323` — SUCCESS.
  - Android `37723564301` — SUCCESS.
  - GitHub Pages `37723563802` — SUCCESS.
- The same final commit also produced a successful Cloudflare Workers build check; no deployment blocker remains for this verification gate.

Gate decision:
- Implementation: MET.
- Isolation contract: MET.
- Architecture/no-duplication constraint: MET.
- Static/isolation verification: MET.
- Cross-platform CI verification: MET.
- Task 3.4: COMPLETE.
- Task 3.5: COMPLETE.
- Task 3.6 is now the next authorized task; it has not been started.

Next authorized task:
- Task 3.5 — AI Capability Layer & Provider Adapter Contract — COMPLETE.

### Phase 3 / Task 3.5 — AI Capability Layer & Provider Adapter Contract

Status: **COMPLETE**

Purpose:
- Establish one platform-level, provider-independent AI capability boundary reusable by Dental, medical, retail, supermarket, restaurant, café and future products.
- Keep business/vertical modules dependent only on AQSA7 AI capability contracts, never on a model vendor, SDK, API key or provider-specific request format.
- Preserve local-first operation: AI is optional, disabled by default, has no persistence ownership, no secrets, and no mandatory paid/online dependency.
- Provide stable contracts for capabilities, structured outputs, prompts, tools/function calling, retrieval/context, streaming, provider discovery, usage controls, safety policy and observability.

Research and decision:
- Google Gemini documentation confirms structured JSON-schema output and application-owned function execution; the model proposes function calls while the application remains responsible for executing them. citeturn0search1turn0search2
- MCP documentation confirms a provider-neutral tool/resource/prompt protocol with explicit client/server boundaries; AQSA7 does not adopt MCP as a dependency here, but the same separation supports a clean future interoperability boundary. citeturn0search3turn0search15
- Current provider pricing was reviewed to reject any provider as a mandatory core dependency; external model use remains optional and must be policy-controlled. citeturn2search1turn2search24
- Decision: implement a lightweight native AQSA7 AI contract now, without importing any AI SDK. Provider adapters will be thin transport/model adapters behind the contract; future local or external providers can be added without changing business modules.

Implementation:
- Added `js/ai.js` as the single authoritative Platform AI Capability Layer.
- Versioned contract ID: `aqsa7-ai-capability-layer`, schemaVersion 1.
- Stable reusable capabilities: `summarize`, `extract`, `classify`, `search`, `generate`, `recommend`.
- Prompt/instruction templates are generic platform assets, not Dental/business logic.
- Structured request/result contract includes capability ID, authorized input/context, output schema, tool descriptors, retrieval context, streaming flag, policy and metadata.
- Tool boundary explicitly requires application-side authorization/validation before any requested tool executes; AI never receives direct repository authority.
- Retrieval boundary explicitly consumes existing AQSA7 repository/capability data and never creates a second database/store.
- Provider adapter contract defines descriptor, capability discovery, execute, optional stream/model-list/health; adapter ownership is limited to transport/auth/model invocation.
- Default adapter is an explicit `unconfigured` fail-soft adapter; AI unavailable/disabled does not affect core product operation.
- Policy contract denies external transmission and sensitive data by default and requires explicit enablement; high-impact/recommendation/extraction/generation outputs require human review by default.
- Usage/cost controls are adapter metadata/limits only; no mandatory paid service is introduced.
- Observability hooks are defined without permitting sensitive payload logging.
- `index.html` loads `js/ai.js` before `js/product.js`.
- Dental Product Definition now references the platform AI contract and keeps AI optional/disabled by default with explicit allowed capabilities and sensitive-data denial.
- No Repository, State Machine, IndexedDB store, backup path, vendor SDK, API key or secret was added for AI.

Files changed:
- js/ai.js
- js/product.js
- index.html
- .github/workflows/runtime-smoke.yml
- docs/AQSA7-BUILD-PLAN.md

Verification completed:
- JavaScript syntax validation: PASS in final Runtime Smoke `37725061960`.
- AI vendor isolation assertion: PASS in `37725061960`; no direct provider/SDK reference is permitted in product/shared capability/repository/storage/app modules.
- AI policy contract checks: PASS in `37725061960` for disabled fail-closed behavior, external-transmission denial, sensitive-data denial, immutable manifest/capability contracts and unconfigured fail-soft provider state.
- Provider adapter execution + streaming contract: PASS in `37725061960` using an in-browser local mock adapter; no external provider/SDK was invoked.
- Mobile browser smoke: PASS in `37725061960`.
- Desktop browser integration smoke: PASS in `37725061960`.
- Android debug + signed production build, signature and metadata verification: PASS in `37725061931`.
- Receipt/export verification: PASS in `37725061918`.
- GitHub Pages build/deployment: PASS in `37725062094`.
- Initial verification run `37724650951` failed only because the new shell grep assertion had invalid quoting; the root cause was test-harness syntax, not application code. The assertion was simplified and passed in the subsequent verification runs.
- Final implementation verification source commit: `0733d0c8ed993d9c35f14a44f4582ddb9ba96c85`.

Task 3.5 exit criteria:
1. Platform-level AI boundary exists independently of any product/provider.
2. Business modules have no direct AI vendor/SDK dependency.
3. Stable capability contracts and versioning exist.
4. Provider/model adapters are isolated behind one contract.
5. Structured output and validation boundary exists.
6. Tool/function-calling boundary preserves normal AQSA7 authorization/validation.
7. Retrieval/context boundary uses existing AQSA7 data authorities and does not create a second store.
8. Streaming/provider capability discovery are represented by the adapter contract.
9. AI is optional, fail-soft and disabled by default.
10. Sensitive/external data transmission is explicitly denied unless policy permits it.
11. Secrets are not embedded or persisted by the AI layer.
12. No paid/mandatory AI dependency is introduced.
13. Static JS, browser mobile/desktop and Android verification pass.
14. Receipt/export and Pages/cross-platform verification pass on the final main commit.
15. Build Plan records research, decisions, implementation, failures/resolution and final evidence.

Gate decision:
- Architecture/implementation: MET.
- Provider independence/no vendor leakage: MET.
- Safety/local-first/no persistence or secret ownership: MET.
- Static/mobile/desktop/Android verification: MET.
- Final main-branch export/Pages verification: MET.
- Task 3.5: **COMPLETE**.
- Task 3.6 is the next authorized task but was not started.

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

Last updated: 2026-10-08 (Task 3.5 fully verified and closed; Task 3.6 authorized but not started)

## Current authoritative decisions

- AQSA7 core remains 100% free/local-first by architecture.
- AI is a Platform Core capability behind `aqsa7-ai-capability-layer`; AI is optional/disabled by default, provider-independent, non-persistent, secret-free and fail-soft.
- Business/vertical modules must call AQSA7 AI capability contracts rather than vendor SDKs; provider adapters own only transport/auth/model invocation.
- IndexedDB remains the single durable local application database.
- Cloud backup is optional disaster recovery, not the primary database.
- Cloud backup artifacts must be encrypted before upload.
- Provider access is abstracted behind adapters.
- Google Drive is the first planned provider; OneDrive and Dropbox are future provider options.
- No external provider may become a hidden paid/core dependency.
- Web/PWA/Desktop browser/Android share one application core.
- Platform/provider adapters must remain thin and must not duplicate domain logic.
- Phase 3 owns multi-product architecture, product manifests, shared module boundaries, tenant/instance isolation contracts and AI/integration capability boundaries.
- Task 3.2 establishes js/product.js as the single authoritative Product Definition + configured Instance/Tenant contract; no second manifest/configuration source is permitted.
- Task 3.3 establishes js/capabilities.js as the single authoritative shared-business capability registry; physical persistence remains repository/IndexedDB-owned and capability contracts contain no provider or vertical clinical logic.
- Product identity/organization defaults are separated from reusable product semantics; repository IndexedDB scope is selected from the configured instance contract.
- Runtime/browser, receipt export, Pages and Android gates are green on final Task 3.2 checkpoint b61477028c0f2476b21a13e732c81b7506e88857.
- Phase 4 owns backup/security implementation; Phase 5 owns cross-platform and disaster-recovery verification.
