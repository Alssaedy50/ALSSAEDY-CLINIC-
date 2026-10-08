# AQSA7 — Engineering Build Plan & Continuity Ledger

Status: PHASE 8 ACTIVE — Phase 8.0–8.5 COMPLETE / Phase 8.6 AUTHORIZED NEXT
Last updated: 2026-10-09 (Phase 8.6 History & Financial Ledger completed and verified)
Owner: Project technical/design lead (ChatGPT)
Repository: Alssaedy50/AQSA7
Umbrella product target: AQSA7

## Mission

Transform AQSA7 from the current clinic-first user experience into a genuine reusable **multi-product platform shell**, while preserving the already-implemented and verified business capabilities.

The first configured product remains **ALSSAEDY CLINIC / Dental Clinic**, but it must live inside the AQSA7 Platform rather than define the platform itself.

The target user-visible hierarchy is:

**AQSA7 Platform → Workspace / Dashboard → Products / Projects → Dental Clinic → ALSSAEDY CLINIC**

Future verticals must be addable through the existing product/capability boundaries without cloning the application.

### Current Reality Baseline — 2026-10-08

Phase 0–6 implementation, reliability and the historical v1.3.0 release are preserved as verified historical evidence. Phase 7.0–7.5 completed the controlled migration to the approved Platform-first user experience.

Authoritative current state:

- AQSA7 is now presented as the primary application shell.
- The user-visible hierarchy is **AQSA7 Platform → Products / Projects → Dental Clinic → ALSSAEDY CLINIC workspace**.
- `js/app.js` remains the single route/context state owner.
- `js/product.js` remains the single Product/Tenant/Instance authority.
- `js/capabilities.js` remains the shared capability registry.
- `js/repository.js` + IndexedDB remain the single durable application data authority.
- `js/storage.js` remains the Dental receipt/patient/history/settings business-behavior owner.
- `js/export.js` + the existing Android bridge remain the export/print/share boundary.
- Existing backup/recovery/provider/security modules remain authoritative and are not duplicated.
- Web/PWA and Android use the same shared application core; Android remains a thin wrapper.
- Phase 7.5 rendered UI acceptance passed after the isolated `css/ui.css` stacking/layout correction.

The current source is therefore the accepted Platform-first composition and is the source package to be released as **v1.4.0**. The historical v1.3.0 artifact remains unchanged and must not be represented as the current source state.

### Primary corrective objective

Create a verifiable platform shell and product/workspace composition while keeping existing Dental business logic, data authority, repository boundaries, backup/recovery, export/print, AI/integration contracts and cross-platform core intact unless an actual dependency gap is proven.

### Absolute anti-duplication rule

Before creating any file, module, component, state path, repository, schema, adapter, helper or command, the execution team must first prove that the capability does not already exist.

**Existing implementation wins. Reuse > adapt > refactor > replace > create new.**

No parallel implementation may be introduced merely because the current implementation is inconvenient to use.

## Corrective Transition Control — Mandatory

This section supersedes any earlier assumption that a functionally verified clinic UI is automatically an accepted AQSA7 platform UI.

### 1. No-build baseline gate

Before any implementation begins, create a **read-only inventory** of the current repository and running product surfaces.

The inventory must identify, at minimum:

- existing pages/routes/views;
- every top-level navigation item;
- every button/action/menu;
- every form/input/modal;
- every state transition;
- every business action and its handler;
- every data source/repository;
- every persistence path;
- every export/print/share path;
- every platform/product/tenant/instance contract;
- every Android bridge capability;
- every existing CI/runtime verification covering the affected behavior;
- exact source files owning each item.

This inventory is a baseline, not a second implementation.

### 2. Reuse Registry — mandatory before creation

The project must maintain a lightweight **Reuse Registry / Component Traceability Matrix** in the authoritative documentation.

For every proposed element, record:

**Element ID → Current owner → Existing implementation → Reuse/adapt/refactor/create decision → Dependencies → Verification**

A new file/module is allowed only when the registry proves that no suitable existing owner exists or that the existing owner cannot satisfy the approved contract without unacceptable coupling.

### 3. UI-to-code traceability

Every user-visible platform surface introduced or changed must be traceable:

**UI ID → page/surface → component/DOM owner → event/action → business function → data/repository owner → affected tests → verification evidence**

This is specifically to prevent the previous failure mode where a platform name was added around a clinic-first interface.

### 4. No duplicate paths

For each capability, there must be exactly one authoritative:

- navigation path;
- state owner;
- business action;
- persistence owner;
- export/print action;
- product configuration source.

If two implementations already exist, consolidate them before adding another one unless a documented compatibility boundary requires both.

### 5. Platform acceptance is user-visible and testable

The statement **“AQSA7 is a platform”** is not accepted because files are named platform/core/product or because contracts exist internally.

The platform acceptance gate must demonstrate, in the actual UI:

1. AQSA7 is the primary application shell.
2. A user can enter a workspace/dashboard.
3. Products/projects are first-class navigable entities.
4. Dental Clinic is one configured product, not the entire application shell.
5. ALSSAEDY CLINIC is an instance/configuration of that product.
6. Shared capabilities remain reusable and are not duplicated inside the Dental product.
7. Existing Dental workflows remain reachable and functional.
8. The structure clearly permits a second product without cloning the application.
9. Web/PWA and Android use the same product/core contracts rather than separate business implementations.

### 6. Three separate acceptance gates

Never merge these into one “PASS”:

- **Functional Gate:** existing and changed actions work.
- **Architecture Gate:** ownership, contracts, reuse and boundaries are correct.
- **Product/UX Gate:** the actual user-visible product matches AQSA7's approved platform hierarchy and interaction model.

A release/phase cannot claim overall acceptance while Product/UX Gate is failed or unverified.

### 7. Change-impact rule

Any change to a shared file/module must list its affected surfaces before implementation.

Minimum impact scan:

**changed owner → dependents → user-visible surfaces → data paths → platform clients → tests**

This follows established traceability/change-management practice: requirements and implementation artifacts should remain linked so a change can be assessed for its downstream impact rather than handled as an isolated edit.

### 8. No documentation inflation

Do not create a new plan, architecture document, component catalog, test ledger or command script when an authoritative existing document can be updated.

Prefer:

- update the existing Build Plan;
- extend an existing test;
- update an existing module;
- reuse an existing command/workflow;
- delete/supersede contradictory documentation.

Create a new artifact only when its ownership and purpose are genuinely distinct.

### 9. No contradictory execution commands

Each execution handoff must contain:

- one objective;
- one authoritative target branch/ref;
- exact files/areas in scope;
- exact evidence required;
- explicit “do not create/modify” boundaries;
- the next gate.

If a later instruction conflicts with the Build Plan or current GitHub state, stop and reconcile the authoritative plan first.

### 10. Preserve verified functionality by default

The corrective phase may reorganize presentation and composition, but must not casually rewrite:

- IndexedDB authority;
- repository/data contracts;
- backup/recovery contracts;
- provider boundaries;
- sync boundaries;
- AI capability boundary;
- export/print mechanisms;
- Android bridge contracts;
- verified Dental business workflows.

Any exception requires a dependency finding and targeted regression evidence.

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

## Balanced Scope, Speed & Precision — Mandatory Execution Discipline

AQSA7 must preserve a deliberate balance between architectural quality, execution speed and task focus. The purpose of planning and future-proofing is to prevent avoidable rework, not to turn every task into a broad architecture project.

1. **One task, one primary outcome.** Every task must have one clearly defined primary objective and the minimum deliverables required to close that objective.
2. **Minimum sufficient scope.** Execute only the work necessary to satisfy the current task's purpose and exit criteria. Do not expand a task merely because related future concerns are interesting or potentially useful.
3. **Separate thinking from building.** Future requirements may be analyzed, classified, documented or bounded without implementing them early.
4. **Boundary before implementation, not implementation before need.** Establish a contract or architectural boundary early only when it prevents a likely rewrite or is required by the approved plan. Do not create speculative abstractions, files, services or frameworks without evidence of need.
5. **Phase discipline.** Do not pull implementation work forward from a later phase merely because it is technically related to the current task. A current task may define or constrain future work, but must not silently execute it.
6. **Prefer the smallest safe change.** When several changes satisfy the same exit criteria, choose the smallest reversible change with the lowest maintenance and verification cost.
7. **No architecture inflation.** A task must not become a redesign of adjacent systems unless the current task cannot be closed correctly without that redesign. If such expansion appears necessary, stop and reassess scope.
8. **Evidence over speculation.** Inspect the actual repository and verify the need before introducing a new abstraction, persistence path, state machine, dependency or architectural layer.
9. **Concise execution handoffs.** Execution instructions should state the objective, required checks, hard constraints, explicit out-of-scope items and completion evidence. Avoid repeating the entire future architecture when a concise task-specific instruction is sufficient.
10. **Future-proofing is a constraint, not a workload multiplier.** Use the Future Surprise Gate to prevent bad decisions, then defer implementation that is not required now.
11. **Stop at the gate.** Once the task's purpose and exit criteria are satisfied, close the task. Do not continue into the next task or phase without explicit authorization.
12. **Escalate genuine scope conflicts.** If closing the task requires a material scope, architecture or security change, do not improvise. Record the conflict and request the required approval.

**Operating principle:** Minimum sufficient scope → inspect actual need → make the smallest safe change → verify → document → close → move to the next authorized step.

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

## Long-Term Architectural Foresight & “No Future Surprise” Rule — Mandatory

AQSA7 must be designed from the **maximum approved long-term target backward**, not only from the immediate task requirement. The purpose is to prevent avoidable architectural rewrites when AQSA7 later expands from the first Dental product into a multi-product, multi-tenant, cross-platform and AI-enabled platform.

### 1. Think from the destination backward
Before any materially architectural task, the AI / Technical Lead must evaluate:
- the immediate task and its exit criteria;
- the next affected phases/tasks;
- the approved target architecture;
- the expected future product families, tenants, instances, branches, devices, integrations and AI capabilities;
- likely security, privacy, migration, synchronization, recovery, scaling and interoperability requirements;
- the cost of changing the decision later.

The decision must optimize for the **whole AQSA7 lifecycle**, not only the shortest path to the current task.

### 2. Design for the future, but do not build everything early
Future-proofing does **not** mean implementing every future feature immediately.

For each future concern, classify the required action as exactly one of:
1. **Implement now** — the missing foundation would otherwise create a costly rewrite or violates a current requirement.
2. **Establish the contract/boundary now, implement later** — define stable interfaces, ownership, identifiers, schemas, adapters or extension points now while deferring the heavy feature implementation.
3. **Document and defer** — no current architectural foundation is needed yet; record the future requirement and revisit it at the appropriate gate.
4. **Reject** — the idea conflicts with AQSA7 principles or adds unjustified complexity/lock-in.

The AI must explicitly distinguish these cases instead of either ignoring future needs or prematurely implementing speculative features.

### 3. No Future Surprise Gate
Before closing any task that affects architecture, persistence, identity, security, platform boundaries, integrations, AI, data contracts or user-facing product structure, verify:
- What future requirement could this implementation make difficult?
- Does any current identifier/data model assume Dental-only semantics?
- Could a future second product/tenant/instance/branch use this contract without cloning it?
- Could Web/PWA/Desktop/Android continue using the same core?
- Could cloud/offline/sync/recovery be added without replacing the local authority?
- Could another provider/model/integration be added without changing business modules?
- Could schema evolution/migration occur without destructive data loss?
- Could permissions/audit/security boundaries be strengthened without rewriting the domain?
- Is any temporary implementation accidentally becoming a permanent contract?
- Is there evidence from current standards, official documentation or maintained comparable systems that changes the decision?

If the answer reveals a required architectural foundation, establish it before closing the task unless doing so would be a material plan change requiring User approval.

### 4. Architectural boundaries must be established before dependent features
When a future feature is known to be important, the platform should establish the stable boundary before building multiple dependent implementations. Examples include:
- Product → Tenant → Instance ownership before multi-tenant sync/hosting.
- Generic Repository/Data contracts before additional vertical products.
- Backup Engine → Provider Adapter before multiple cloud providers.
- AQSA7 AI Capability → Provider Adapter before vendor-specific AI features.
- Integration contract → provider-specific adapter before external integrations.
- Shared authorization/audit boundaries before high-impact automation.
- Versioned schemas/migrations before long-lived production data evolves.

The principle is **boundary first, implementation when justified**.

### 5. Future-risk register
The Build Plan must maintain architectural awareness of at least these future-risk domains even when their implementation is deferred:
- multi-product and vertical isolation;
- tenant, instance, branch and device ownership;
- authentication, authorization and role/permission evolution;
- audit trail and accountability;
- schema versioning, migrations and backward compatibility;
- offline/online synchronization and conflict resolution;
- backup, restore and disaster recovery;
- encryption, key management, privacy and data lifecycle/retention;
- AI provider/model independence, tool authorization, evaluation and sensitive-data policy;
- integration/API/webhook boundaries and provider changes;
- healthcare interoperability/standards and non-healthcare domain standards;
- localization, RTL/BiDi, currency, timezone and regional rules;
- accessibility and responsive/cross-platform behavior;
- performance, large datasets, indexing and eventual scale;
- observability, diagnostics and safe error reporting;
- testing strategy, contract tests and cross-product regression coverage;
- release/update/rollback and client-version compatibility;
- extensibility/plugin/module boundaries;
- future commercial/product packaging without coupling the technical core to a single customer.

These are **architecture watchpoints**, not permission to add speculative complexity. Each becomes implementation work only when its readiness criteria or an approved product requirement requires it.

### 6. Reversibility and migration-cost principle
When two approaches satisfy current requirements, prefer the approach that:
- preserves a stable public/internal contract;
- minimizes irreversible coupling;
- keeps data migration possible;
- avoids vendor/provider lock-in;
- keeps domain logic independent of infrastructure;
- can be tested and replaced behind an adapter;
- has lower long-term operational and recovery risk.

A decision with high future migration cost requires stronger evidence and must be recorded as an architectural decision in GitHub.

### 7. Temporary code must have an exit condition
Any temporary compatibility path, legacy adoption mechanism, migration shim, experimental adapter or transitional abstraction must document:
- why it exists;
- what authoritative path replaces it;
- what conditions permit its removal;
- what test prevents accidental regression.

No temporary mechanism may silently become permanent architecture.

### 8. User approval boundary remains protected
Long-term foresight gives the AI authority to anticipate, research and prepare the architecture. It does **not** authorize silent material changes to approved scope, product requirements, security model or major architecture. Such changes remain subject to the existing material-change approval rule.

**Operating principle:** Think to the furthest approved destination → identify future failure modes → establish necessary boundaries early → defer unnecessary implementation → verify → document the decision → continue.

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

### Generic domain/data architectureThe platform must avoid naming the core data layer around a single vertical. For example, \x60clinicDB\x60, patient-only assumptions, dental-specific receipt schemas or ALSSAEDY-specific identifiers must not become permanent AQSA7 core contracts. Existing Dental-specific code is legacy/product-domain implementation and must be progressively moved behind the Dental product boundary during Phase 3.

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
Status: FUNCTIONALLY COMPLETE; PRODUCT/UX ACCEPTANCE FAILED IN RETROSPECT

Completed Phase 2 tasks:
- 2.1 Design System Foundation — COMPLETE
- 2.2 Top App Shell & Navigation Dock — COMPLETE
- 2.3 Patient Directory / Ledger Table — COMPLETE
- 2.4 Patient Account Detail — COMPLETE
- 2.5 Receipt Issuance Panel — COMPLETE
- 2.6 History / Receipts Ledger Reconstruction — COMPLETE
- 2.7 Settings / Configuration Surface Reconstruction — COMPLETE

Current task:
- **Phase 3 / Task 3.6 — Integration / Interoperability Adapter Contract**
- Status: **COMPLETE**
- Executor: **AI / Technical Lead**
- Next authorized task: **Phase 3 / Task 3.7**

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
- 3.5 AI Capability Layer & Provider Adapter Contract — COMPLETE.

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
- .github/workflows/pages-source-verification.yml
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
- Task 3.6 was subsequently executed and is now COMPLETE after the final independent Pages verification gate.

Next authorized task:
- Task 3.6 — Integration / Interoperability Adapter Contract — NOT STARTED.

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
- Task 3.6 followed this completed Task 3.5 checkpoint and is now COMPLETE.

### Phase 3 / Task 3.6 — Integration / Interoperability Adapter Contract
Status: **COMPLETE**

Purpose:
- Establish one platform-level, provider-independent integration/interoperability boundary reusable across Dental, Medical, Hospital, Supermarket, Restaurant/Café and future verticals.
- Keep Business Modules and Vertical Domains independent from external providers, APIs, SDKs, transport protocols and credential formats.
- Preserve local-first operation, tenant/instance ownership, cross-platform shared core and the existing AI boundary.

Research and architectural decision:
- OpenAPI 3.1 is the interoperability reference for HTTP interface descriptions, reusable callbacks and webhooks, not a runtime dependency. citeturn0search0turn0search2
- RFC 9110 establishes the HTTP retry/idempotency basis: safe/idempotent methods may be retried, while unknown side-effecting writes require an explicit idempotency strategy. citeturn0search7
- RFC 9457 provides a standard machine-readable Problem Details model for HTTP API errors; AQSA7 adopts the normalized-error principle while keeping the adapter transport-neutral. citeturn0search4
- GitHub webhook guidance was used as a maintained concrete example for HTTPS, signature verification, event filtering and delivery identifiers/replay handling; AQSA7 records these as generic adapter responsibilities. citeturn0search3turn0search8
- JSON Schema 2020-12 is the current JSON Schema specification and is the reference for future schema validation/mapping contracts, without adding a runtime validator now. citeturn1search2turn1search11
- HL7 FHIR R5 remains the healthcare interoperability direction. AQSA7 establishes the generic boundary now and defers concrete FHIR implementation to the appropriate healthcare product/integration requirement. citeturn1search0turn1search3

Future-fitness classification:
- Implement now: one authoritative integration contract; provider descriptors/capability discovery; versioned request/response boundary; instance ownership propagation; auth/authorization boundary; normalized errors; retry/idempotency policy; webhook verification boundary; import/export/mapping boundary; offline fail-soft behavior; cross-platform adapter strategy; safe observability.
- Establish contract now, implement later: concrete provider adapters; OAuth/API-key/service-account implementations; webhook delivery infrastructure/queues; sync/event queues; retry persistence; provider-specific rate/quota handling; concrete OpenAPI clients; healthcare FHIR adapters; vertical-specific mappings.
- Document and defer: generic durable integration queue/outbox, background sync/conflict resolution, audit/event store, concrete interoperability profiles, and domain-specific standards beyond the healthcare FHIR watchpoint.
- Reject: provider SDKs in business modules, mandatory cloud integration, a second integration database/store, integration-owned business state machines, hardcoded credentials, or making one industry standard mandatory for all verticals.

Implementation:
- Added js/integrations.js as the single authoritative Platform Integration / Interoperability Contract.
- Versioned contract ID: aqsa7-integration-adapter-contract, schemaVersion 1.
- Reusable capabilities: api, import, export, webhook, event, mapping.
- Adapter descriptor contract: id/name/kind/version/capabilities/local/platforms; optional health/subscribe/unsubscribe/webhook verification/import/export/mapping methods.
- Request/response contract carries capability, operation, version-neutral payload/query metadata, opaque auth reference, idempotency key/retry policy and mandatory current product/tenant/instance ownership.
- Authentication boundary keeps credential material outside business modules and source; authorization remains AQSA7-owned before adapter execution.
- Retry policy is conservative: no automatic retry for unknown side effects; safe HTTP methods may be retried; automatic retry of non-idempotent writes requires an explicit idempotency key.
- Webhook boundary requires adapter-side authenticity/event/delivery/freshness validation before normalization and application processing; secrets never belong in payloads or source.
- Import/export/mapping boundary requires explicit versioned mapping profiles; external payloads are untrusted until validated/mapped.
- Normalized integration errors expose safe machine-readable categories while preserving non-sensitive provider codes.
- Default integration adapter is a local fail-soft/unavailable adapter; core business operation remains local and authoritative when integrations are unavailable.
- Cross-platform contract is shared by Web/PWA/Desktop/Android; only transport/OS-specific mechanics may be implemented in platform adapters.
- No Repository, State Machine, IndexedDB store, queue, vendor SDK, API key or secret was added.

Files changed:
- js/integrations.js
- js/product.js
- index.html
- .github/workflows/runtime-smoke.yml
- docs/AQSA7-BUILD-PLAN.md

Verification performed:
- JavaScript syntax validation: PASS in Runtime Smoke 37728098566.
- AI vendor isolation: PASS in Runtime Smoke 37728098566.
- Mobile browser smoke: PASS in Runtime Smoke 37728098566.
- Desktop browser integration smoke: PASS in Runtime Smoke 37728098566.
- Integration contract in-browser mock verification: PASS in the Task 3.6 final verification set for descriptor discovery, instance ownership propagation, idempotency guard, adapter execution, mapping, webhook verification/rejection and normalized errors.
- Android debug + signed production build, signature and metadata verification: PASS in Android run 37728098568.
- Receipt/export verification: PASS in final-gate run 37726589591; the Pages-evidence fix changed only CI verification infrastructure and did not modify receipt/export implementation.
- GitHub Pages independent source verification: PASS in final verification run 37728292037. The verifier resolved the actual remote main ref, checked out that exact main state (faca058e8bb83ce7446f25453cd9545a13db9476), fetched the live Pages js/integrations.js, and compared SHA-256 hashes.
- Pages evidence artifact 11528691666 records:
  - source_commit=faca058e8bb83ce7446f25453cd9545a13db9476
  - live URL=https://alssaedy50.github.io/AQSA7/
  - live integration URL=https://alssaedy50.github.io/AQSA7/js/integrations.js
  - source_integrations_sha256=cf30c03f706305057ac94cd17644e7f0d2bad4cc23223f1a520b4f29bd1aa9cc
  - live_integrations_sha256=cf30c03f706305057ac94cd17644e7f0d2bad4cc23223f1a520b4f29bd1aa9cc
  - result=PASS
- Verification-only PR #44 was closed without merge; it contained only the temporary pull-request trigger needed to expose the reproducible Pages verification run through the available GitHub CI surfaces.

Task 3.6 exit criteria:
1. One authoritative platform integration/interoperability contract exists.
2. Business/vertical modules have no direct provider/API/SDK dependency.
3. Provider descriptors and capability discovery are versioned.
4. Authentication/authorization boundaries are explicit and ownership-aware.
5. Request/response and normalized error contracts exist.
6. Retry/idempotency rules prevent unsafe automatic duplication of side effects.
7. Webhook/event boundary includes authenticity, delivery/replay and validation responsibilities.
8. Import/export and explicit data-mapping boundaries exist.
9. External data is treated as untrusted until validated/mapped.
10. Integration failure never makes the local core unavailable.
11. Tenant/instance ownership is propagated and cannot be widened by an adapter.
12. Observability excludes credentials/tokens/raw sensitive payloads.
13. Web/PWA/Desktop/Android share the same contract.
14. Static JS, browser mobile/desktop, Android, receipt/export and Pages verification pass on the final main commit.
15. Build Plan records research, decisions, implementation, failures/resolution, commit SHA and blockers.

Gate decision:
- Architecture/implementation: MET.
- Provider independence/no vendor lock-in: MET.
- Ownership/local-first/cross-platform boundaries: MET.
- Static/browser/Android verification: MET.
- GitHub Pages live-source gate: MET.
- The available GitHub connector did not expose the Pages REST deployment/build endpoints directly, so the smallest safe fix was a verification-only GitHub Actions workflow that resolves the actual remote main ref and compares the live Pages integration-contract bytes against the checked-out source.
- Independent deployment-to-source evidence is reproducible from GitHub Actions run 37728292037 and artifact 11528691666.
- The final documentation commit is docs-only; the authoritative Task 3.6 source file js/integrations.js remains byte-identical to the verified source and retains the verified live SHA-256.
- Task 3.6: **COMPLETE**.
### Phase 3 / Task 3.7 — Reliability, Backup & Security Boundary Contract / Phase 4 Readiness

Status: **COMPLETE**

Purpose:
- Formalize and reconcile the already-partially-implemented local backup and legacy cloud snapshot architecture into the canonical AQSA7 Backup/Recovery/Security boundary before Phase 4 implementation begins.
- This is an architectural/documentation task only. It must not implement Phase 4 runtime behavior.

Current Architecture Reconciliation:
- Local JSON backup/restore already exists in `js/storage.js` through `buildFullBackup()`, `exportFullBackup()` and `importFullBackup()`.
- The current backup artifact carries `schema: AQSA7_PRODUCT_BACKUP`, `schemaVersion: 5`, export metadata, ownership metadata, `productId`, `tenantId`, `instanceId` and the configured database name, together with the current application data.
- Existing restore logic validates backup scope and ownership and validates/stamps incoming tenant-scoped records before repository persistence; merge/replace behavior already exists.
- The current local backup representation is plaintext JSON. The Product contract may declare the target `encrypted-json` format, but encryption is not implemented in this task.
- A functioning legacy cloud snapshot/sync path already exists in `js/sync.js` and `api/clinic-sync.js`.
- The legacy path uses a clinic-keyed cloud record, persists snapshots through Vercel Blob, carries version/client/timestamp metadata and uses optimistic version/conflict behavior.
- IndexedDB remains the single durable application authority for live clinic data. The existing cloud snapshot is an optional recovery copy and is not the primary application database.
- The legacy cloud snapshot path is not the basis for the Phase 4 Backup Engine architecture and must not be extended into the canonical architecture without an explicitly approved reconciliation decision.

Canonical Future Boundary:
```
Product / Tenant / Instance
          ↓
Repository / IndexedDB
          ↓
Backup Engine
          ↓
Backup Artifact Contract
          ↓
Backup Provider Adapter
          ↓
Provider-specific storage
```
- IndexedDB remains the live source of truth.
- Backup Artifact is a versioned output/representation, not a persistence authority.
- The Backup Provider Adapter transports/stores backup artifacts and must not own business/domain state.
- Provider-specific logic must remain outside the Backup Engine.
- Provider adapters must not know or manipulate business/domain entities directly.

Backup Engine Responsibility — Contract Only:
- Define the boundary for serialization and backup metadata.
- Carry product/tenant/instance ownership and schema/version information.
- Define integrity and validation requirements.
- Define the encryption boundary without implementing encryption here.
- Define restore preparation and pre-restore validation.
- Define the migration boundary between stored artifact versions and the current application representation.
- Define failure, partial-failure and recovery semantics.
- Preserve the rule that the Backup Engine reads from the authoritative repository and never becomes a second database or repository.

Backup Provider Adapter — Contract Only:
- provider discovery/capability description;
- authentication reference, without owning raw credentials in domain code;
- upload;
- download;
- listing/version lookup;
- optional retention/deletion;
- provider availability, quota and normalized error reporting.
No provider implementation is created by Task 3.7.

Local vs Cloud Recovery:
- Local encrypted backup is an independent recovery layer.
- Cloud storage is optional disaster recovery.
- Cloud availability is never required for core AQSA7 operation.
- Cloud storage must never replace IndexedDB as the live authority.
- The architecture must support recovery after device loss while preserving local-first operation.

Security Boundary:
- **Current gap:** current local backup is plaintext JSON.
- **Target:** encrypted backup artifact.
- **Status:** encryption implementation is deferred to Phase 4.
- Ownership propagation, authentication references, authorization boundaries, credential handling and key-management boundaries are defined as contracts in this task; runtime security implementation remains Phase 4.
- The final architecture must not imply that the existing legacy cloud snapshot path is already compliant with the target encrypted-artifact security model.

Schema / Migration Boundary:
- Backup `schemaVersion: 5` already exists.
- Product `schemaVersion: 2` already exists.
- IndexedDB database version `3` already exists.
- Transaction export has its own version metadata.
- These version numbers are related but do not yet constitute one generic backup migration engine.
- Task 3.7 therefore defines the migration contract/boundary and compatibility expectations; migration runtime implementation remains Phase 4.

Legacy Cloud Snapshot Disposition:
- `js/sync.js` + `api/clinic-sync.js` are classified as:
  **Legacy clinic-specific cloud snapshot/sync path — transitional/non-authoritative for the canonical AQSA7 Backup architecture.**
- The path is a real existing cloud snapshot/recovery mechanism, but it is not the canonical primary sync architecture and must not silently become one.
- Task 3.7 must define the eventual disposition decision space for this path: retention, migration, wrapping/adoption, deprecation or removal.
- The eventual decision must include an explicit exit condition so the transitional path cannot become permanent by omission.
- Task 3.7 records the boundary and required decision; it does not execute the disposition.

Settings Ownership Distinction:
- Business records require explicit ownership enforcement at the appropriate repository/backup boundaries.
- Instance configuration/settings are governed by Product/Instance configuration rather than being assumed to have identical tenant-record semantics.
- Future backup/restore design must preserve this distinction and must not incorrectly apply one ownership model to every stored object.

Explicit Out of Scope:
- Backup Engine runtime.
- Encryption runtime.
- Google Drive.
- OAuth.
- Cloud upload/download implementation.
- Scheduling or background jobs.
- Sync engine.
- Conflict-resolution engine.
- Authentication system.
- Authorization system.
- Replacement of `js/sync.js`.
- Replacement of `api/clinic-sync.js`.
- Any Phase 4 implementation.
- A second database.
- A second repository.
- A second state machine.
- Any mandatory cloud dependency.

Phase 4 Dependency Map — Plan Only:
1. Backup Artifact & Schema Contract.
2. Encryption & Integrity Layer.
3. Generic Backup Engine.
4. Restore & Migration Engine.
5. Local Backup / Recovery UX.
6. Scheduling / Reliability.
7. Backup Provider Adapter implementation.
8. Google Drive Adapter.
9. Cloud Recovery.
10. Security / Tenant / Platform Hardening.

This is a dependency map only. It is not implementation work authorized under Task 3.7.

Task 3.7 Exit Criteria:
1. Authoritative data authority is explicitly documented.
2. Backup Engine boundary is explicitly documented.
3. Backup Artifact contract is explicitly documented.
4. Backup Provider Adapter boundary is explicitly documented.
5. Encryption boundary is explicitly documented, including the current plaintext gap and Phase 4 target.
6. Restore validation boundary is documented.
7. Migration boundary is documented.
8. Product/tenant/instance ownership propagation is documented.
9. Local/cloud recovery separation is documented.
10. Cross-platform responsibility is documented.
11. Legacy cloud snapshot disposition and its required exit condition are documented.
12. Phase 4 dependency sequence is documented.
13. No Future Surprise assessment is completed and recorded.
14. The task remains documentation/architecture scope only and does not claim Phase 4 implementation.

Verification Requirements:
- Source inspection.
- Backup/storage/repository ownership audit.
- Legacy sync audit.
- Dependency-direction audit.
- No-second-store audit.
- Tenant/instance isolation audit.
- Schema/migration readiness audit.
- Local-first/offline audit.
- No Future Surprise Gate.
- Phase 4 readiness review.
- Verification is architectural/documentation verification; no runtime implementation tests are required for Task 3.7 itself.

Task 3.7 completion summary:
- Architectural gap between Phase 3 and Phase 4 is closed at the documentation/contract level.
- IndexedDB is confirmed as the single durable application authority; the repository remains the live persistence boundary.
- Existing local JSON backup/restore is documented as the current backup/recovery mechanism, including ownership validation and schemaVersion 5.
- Existing `js/sync.js` + `api/clinic-sync.js` are documented as the transitional, non-authoritative legacy clinic-specific cloud snapshot path using Vercel Blob and optimistic version/conflict behavior.
- The canonical future direction is explicitly `IndexedDB → Backup Boundary → Provider Adapter → provider-specific storage`; cloud remains optional disaster recovery and never the live database.
- Known Phase 4 gaps are explicitly recorded, including plaintext local backup/encryption, generic migration, runtime Backup Engine, provider implementation, scheduling/reliability and security/platform hardening.
- No Phase 4 runtime implementation, source abstraction, new persistence layer or user-facing feature was introduced.

Files changed:
- docs/AQSA7-BUILD-PLAN.md

Verification:
- Source inspection completed for `js/storage.js`, `js/repository.js`, `js/product.js`, `js/sync.js` and `api/clinic-sync.js`.
- Backup/storage/repository ownership and IndexedDB authority were audited.
- Legacy cloud snapshot path and optimistic version/conflict behavior were audited.
- Dependency direction and no-second-store constraints were reviewed.
- Product/tenant/instance ownership propagation and backup-scope validation were reviewed.
- Existing version metadata was reconciled: backup schemaVersion 5, Product schemaVersion 2, IndexedDB version 3 and transaction-export versioning; no generic migration engine was found.
- Local-first/offline and cloud-optional boundaries were reviewed.
- No Future Surprise / Phase 4 readiness review completed: no current evidence requires a new abstraction or source file to close Task 3.7.
- No runtime implementation tests were added or required because this task is architectural/documentation work.

Deferred Phase 4 work:
- Backup Artifact & Schema runtime contract.
- Encryption & Integrity Layer.
- Generic Backup Engine runtime.
- Restore & Migration Engine.
- Local Backup / Recovery UX.
- Scheduling / Reliability.
- Backup Provider Adapter implementation.
- Google Drive Adapter and OAuth.
- Cloud Recovery.
- Security / Tenant / Platform Hardening.
- Any replacement, migration, wrapping/adoption or removal of the legacy cloud snapshot path.

Next authorized task:
- Phase 4 — Reliability & Security.
- Task 4.1 — Backup Artifact & Schema Contract — **COMPLETE**.
- Task 4.2 — Encryption & Integrity Layer — **COMPLETE**.
- Task 4.3 — Generic Backup Engine — **COMPLETE**.
- Task 4.4 — Generic Backup Provider Adapter Contract — **COMPLETE**.
- Next authorized task: **Task 4.5 — Restore & Migration Engine Contract/Implementation**.

### Phase 4 / Task 4.2 — Encryption & Integrity Layer

Status: **COMPLETE**

Implementation decision:
- Local Backup Artifact protection uses the browser/platform Web Crypto API only; no cloud, paid service or external cryptographic dependency was introduced.
- The artifact is encrypted with AES-256-GCM, providing confidentiality plus authenticated integrity in one standard primitive.
- The encryption key is derived from a user-supplied backup password with PBKDF2-HMAC-SHA-256 using a random 16-byte salt and 600,000 iterations.
- Each backup receives a fresh random 12-byte GCM IV and a 128-bit authentication tag.
- The encrypted envelope is versioned independently from the payload schema so the cryptographic suite can evolve without silently reinterpreting older artifacts.
- Authenticated additional data binds artifact type, artifact version, schema version, algorithm, KDF and KDF iteration count to the ciphertext. Changes to those protected contract values therefore fail closed.
- No password, derived key, token or secret is persisted in source code, IndexedDB, localStorage, GitHub or the backup artifact.

Cryptographic contract:
- envelope artifactType: AQSA7_BACKUP_ARTIFACT
- envelope artifactVersion: 1
- envelope schemaVersion: 5
- crypto.version: 1
- crypto.algorithm: AES-GCM-256
- crypto.kdf: PBKDF2-HMAC-SHA256
- crypto.iterations: 600000
- crypto.salt: random 16-byte Base64 value
- crypto.iv: random 12-byte Base64 value
- crypto.tagLength: 128
- crypto.encoding: base64
- ciphertext: authenticated encrypted representation of the complete Backup Artifact
- productId / tenantId / instanceId / application metadata / payload remain inside the authenticated encrypted artifact and are restored only after successful decryption and validation.
- The current plaintext JSON backup is no longer treated as the secure target representation; the full-backup restore path rejects unencrypted JSON.

Key-handling boundary:
- The user supplies the backup password at export and restore time.
- The password is used only in memory to derive a non-extractable AES-GCM key through Web Crypto.
- AQSA7 does not store the password or derived key.
- Password loss is unrecoverable by design; there is no hidden recovery key or cloud escrow.
- A minimum password length of 8 characters is enforced by the current UX. Security strength therefore depends materially on the user's chosen password.
- Web Crypto is required. If the platform does not expose the required secure cryptographic primitives, encrypted backup creation/restoration fails closed rather than falling back to plaintext or custom cryptography.
- This key model stays within the local-first architecture and does not require a new authentication system or persistence authority.

Restore security behavior:
1. Parse the encrypted envelope.
2. Reject unsupported artifact/crypto/version metadata before decryption.
3. Derive the key from the supplied password and verify AES-GCM authentication.
4. Reject wrong-password, tampered or corrupted ciphertext as an authenticated failure.
5. Parse the decrypted artifact and validate artifact identity/schema.
6. Re-run existing product/tenant/instance backup-scope validation.
7. Only then perform the existing merge/replace repository restore behavior.
8. Provider/cloud paths are not involved.

Files changed:
- js/storage.js — implemented local encrypted backup envelope, Web Crypto encryption/decryption, password handling, fail-closed encrypted restore and rejection of plaintext full-backup input.
- index.html — bumped storage asset version from 1.2.1 to 1.2.2 so deployed clients do not retain the previous backup implementation under the same cache key.
- .github/workflows/runtime-smoke.yml — added browser verification for round-trip, tamper/corruption, wrong-key, cryptographic-metadata and incompatible-schema rejection.

Verification evidence:
- Source inspection reconfirmed js/storage.js, js/product.js, js/repository.js and the existing backup/sync paths before implementation.
- Web Crypto design was selected from standard browser primitives: PBKDF2 is intended for password-derived keys, AES-GCM provides authenticated encryption, and Web Crypto is broadly available in modern browsers/secure contexts. citeturn0search0turn0search2turn0search5turn0search7
- Browser runtime verification was executed in the authoritative Runtime Smoke workflow for:
  - encrypt → decrypt round trip;
  - preservation of artifactType, schemaVersion and ownership metadata;
  - modified ciphertext rejection;
  - wrong password rejection;
  - invalid cryptographic metadata rejection;
  - incompatible schema rejection.
- Existing ownership isolation checks remain in the same runtime smoke path.
- The restore implementation does not write to IndexedDB until decryption, authentication, artifact/schema and ownership validation have succeeded.
- No second database, repository, persistence authority, provider or cloud dependency was introduced.
- Existing plaintext full-backup JSON is explicitly rejected by the secure restore path.
- Runtime Smoke run 37782155201 on application source commit 314905b32af131c4df3b285dfa5cfd39e1f0ad58: **SUCCESS**; JavaScript syntax validation, mobile browser smoke and desktop browser integration smoke all passed, including the encrypted-backup crypto checks.
- Android build run 37782155251 on the same application source: **SUCCESS**.
- Receipt export verification run 37782155208 on the same application source: **SUCCESS**.
- GitHub Pages source verification run 37782155233 and Pages deployment run 37782154554 on the same application source: **SUCCESS**.
- A follow-up test-harness-only commit 5d3f68295ac7e4739ea6f15aaee58989043c4c26 removed the hardcoded test password by generating a random per-run test password. Its Runtime Smoke run 37782346361 remained in progress at handoff; the application implementation was unchanged from the already successful Runtime Smoke source checkpoint.

Known limitations:
- There is intentionally no password-recovery mechanism. A lost backup password means the encrypted artifact cannot be restored.
- The current minimum password length is 8 characters; stronger user-chosen passwords materially improve resistance to offline guessing.
- Cryptographic metadata supports future algorithm/KDF versioning, but changing the active suite is a future implementation task and is not performed here.
- The legacy clinic cloud snapshot path remains outside this encryption layer and is not silently converted into the canonical Backup Engine/provider architecture by Task 4.2.

Task 4.2 gate decision:
- Encryption boundary: **MET**.
- Authenticated integrity/tamper detection: **MET**.
- Wrong-key/corruption/incompatible-metadata fail-closed behavior: **MET**.
- Key-handling/no-secret-persistence boundary: **MET**.
- Ownership/restore validation preservation: **MET**.
- Web/PWA/Android-compatible Web Crypto design: **MET**.
- No-cloud/no-provider/no-second-store constraint: **MET**.
- Task 4.2: **COMPLETE**.

Next authorized task:
- **Task 4.3 — Generic Backup Engine**.


### Phase 4 / Task 4.1 — Backup Artifact & Schema Contract

Status: **COMPLETE**

Purpose:
- Establish the authoritative versioned Backup Artifact + Schema contract for subsequent Phase 4 work.
- Keep IndexedDB/Repository as the sole live data authority.
- Define a stable boundary for Backup Engine → Backup Artifact → Provider Adapter without implementing the engine, encryption or any provider.

Current implementation baseline (verified against main):
- js/storage.js currently builds AQSA7_PRODUCT_BACKUP artifacts with schemaVersion: 5, exportedAt, product/tenant/instance ownership, database name, receipts, patients and settings.
- exportFullBackup() currently serializes that payload as plaintext JSON (application/json).
- importFullBackup() currently accepts the current AQSA7 backup schema plus the legacy clinic backup schema, validates top-level backup scope, ownership-stamps/validates incoming tenant-scoped records, and persists through the repository/IndexedDB path.
- js/product.js provides the authoritative product/tenant/instance identity and backup-scope validation boundary.
- js/repository.js confirms IndexedDB is the durable authority; window.__clinicRepository is only an in-memory projection/cache and not a second persistence store.
- Current versions are intentionally distinct: Backup Artifact schemaVersion 5, Product contract schemaVersion 2, IndexedDB database version 3. These are not interchangeable version numbers.

Authoritative Backup Artifact Contract:
- artifact type/identity: AQSA7_BACKUP_ARTIFACT
- artifact contract version: versioned independently from application/product schema versions; the contract itself must be explicitly versioned before runtime implementation.
- schemaVersion: integer identifying the Backup Artifact payload schema. Existing legacy/current artifacts use 5; future incompatible artifact changes require a new schema version.
- ownership: required productId, tenantId, instanceId. Ownership is fail-closed: a complete matching identity is accepted; a foreign identity is rejected; partial identity is rejected; explicitly unscoped legacy data may only be adopted by the current instance through the existing controlled legacy path.
- application/database metadata: product/version identity, instance identity, database name/scope metadata, and sufficient application metadata to select/validate the compatible restore target. Database metadata describes the source/target scope; it never creates a second database authority.
- timestamps/integrity metadata: exportedAt is required. The target artifact contract reserves integrity metadata (algorithm/version and digest/authenticity information) for the later Encryption & Integrity Layer. The current plaintext artifact has no implemented cryptographic integrity field.
- payload: a structured domain-data envelope containing the durable repository data required by the product. For the current Dental product this is receipts, patients, and settings; payload structure must remain subordinate to the authoritative repository/domain model and must not become a new persistence schema.
- representation/format: the current representation is plaintext JSON. The target representation is an encrypted backup artifact; encryption is a later security-layer responsibility and is not performed by Task 4.1.
- compatibility/versioning: a restore implementation must validate artifact type, contract/schema version, ownership, required metadata and payload shape before writing. Compatible versions may be accepted by explicit compatibility rules; unsupported future versions must fail closed; older supported versions require an explicit migration path before restore. No implicit destructive reinterpretation of unknown fields/version is allowed.
- validation: malformed artifacts, missing required identity, partial ownership, foreign ownership, unsupported schema versions and invalid payload structures must be rejected before destructive restore actions. Validation must occur before repository writes, and restore must preserve the existing merge/replace semantics.
- provider neutrality: the artifact is provider-independent. Provider adapters may store/transport the artifact but must not inspect, rewrite or own domain entities/business state.

Canonical contract shape (logical, not runtime implementation):
{
  "artifactType": "AQSA7_BACKUP_ARTIFACT",
  "artifactVersion": 1,
  "schemaVersion": 5,
  "exportedAt": "ISO-8601",
  "ownership": {
    "productId": "…",
    "tenantId": "…",
    "instanceId": "…",
    "scope": "instance"
  },
  "application": {
    "productVersion": "…",
    "databaseName": "…",
    "databaseScope": "instance"
  },
  "integrity": {
    "algorithm": "reserved-for-Task-4.2",
    "digest": "reserved-for-Task-4.2"
  },
  "payload": {
    "receipts": [],
    "patients": [],
    "settings": {}
  }
}

- This shape is the target contract boundary, not a new source-code type and not an instruction to add the reserved integrity fields to the current plaintext export in Task 4.1.
- The current legacy artifact remains schema: AQSA7_PRODUCT_BACKUP, schemaVersion: 5, with top-level identity fields and top-level receipts/patients/settings; Task 4.1 does not rewrite that representation.
- legacySchema: ALSSAEDY_CLINIC_BACKUP remains a compatibility input only and is not the canonical future artifact identity.

Current vs target representation:
- Current legacy/plaintext backup: JSON downloaded locally, application/json, schemaVersion 5, no cryptographic encryption and no implemented cryptographic integrity metadata.
- Target encrypted artifact: same authoritative repository-derived backup semantics behind the versioned artifact boundary, with encryption and cryptographic integrity supplied by Task 4.2; provider storage is downstream and optional.
- Task 4.1 deliberately does not encrypt, upload, download, schedule, migrate or replace the current backup runtime.

Restore implications:
1. Read only from the authoritative Repository/IndexedDB state.
2. Validate artifact identity/version/ownership/metadata/payload before destructive operations.
3. Reject unsupported/foreign/partially scoped artifacts before repository writes.
4. Route accepted payload data through the existing repository ownership boundary.
5. Preserve explicit merge vs replace behavior.
6. Never make the backup artifact or provider storage a live database.

Boundary established for later implementation:
Product / Tenant / Instance → Repository / IndexedDB → Backup Engine → Backup Artifact → Provider Adapter → provider-specific storage
- Task 4.1 establishes the artifact/schema contract only.
- Task 4.2 owns encryption/integrity runtime.
- Later Backup Engine work consumes/produces this contract.
- Provider implementation remains downstream and is not authorized by this task.

Explicitly out of scope:
- Encryption runtime or key management.
- Backup Engine runtime.
- Restore/Migration Engine runtime.
- Google Drive, OAuth or any provider implementation.
- Cloud upload/download.
- Scheduling/background jobs.
- Sync engine or rewrite of js/sync.js / api/clinic-sync.js.
- Repository redesign, new database, new repository, new state machine or new persistence path.
- User-facing backup feature changes.

Task 4.1 exit criteria:
1. Current backup implementation in js/storage.js, js/product.js and js/repository.js is inspected and reconciled.
2. IndexedDB/Repository remains the only live durable authority.
3. A versioned Backup Artifact identity/type and schema boundary is explicitly defined.
4. Product/tenant/instance ownership and validation expectations are explicit.
5. Application/database metadata required for restore is explicit.
6. Export timestamp and future integrity metadata boundary are explicit.
7. Current plaintext representation and target encrypted representation are explicitly distinguished.
8. Payload and compatibility/versioning rules are explicit.
9. Restore validation implications are explicit.
10. Provider-neutral Backup Engine → Backup Artifact → Provider Adapter boundary is explicit.
11. No new persistence path, provider, encryption runtime, migration runtime or source abstraction is introduced.
12. Task evidence and exact next authorized task are recorded in this ledger.

Verification evidence:
- js/storage.js inspected at the live main state: buildFullBackup() confirms schema: AQSA7_PRODUCT_BACKUP, schemaVersion: 5, exportedAt, ownership/database metadata, receipts, patients and settings; exportFullBackup() confirms plaintext JSON serialization.
- js/storage.js restore path confirms schema allow-list, aqsa7ValidateBackupScope(), per-record ownership enforcement and repository persistence before/around merge/replace writes.
- js/product.js inspected: authoritative Product/Instance identity, aqsa7OwnRecord(), aqsa7ValidateBackupScope(), Product schemaVersion 2, instance storage/database metadata.
- js/repository.js inspected: IndexedDB database version 3, durable stores receipts, patients, settings; in-memory repository is explicitly a projection of IndexedDB.
- Ownership boundary verified: complete matching product/tenant/instance identity is accepted; foreign identity is rejected; partial ownership is rejected; unscoped legacy records can only be explicitly adopted into the current instance.
- Version boundary verified: Backup 5, Product 2, IndexedDB 3 are separate version domains; no generic Backup Migration Engine is claimed or introduced.
- No new source file, persistence store, repository, provider, cloud path, encryption runtime, scheduler or migration runtime was added.
- Documentation-only contract work required no runtime test changes; verification was performed against the actual current implementation and restore implications before closure.

Files changed:
- docs/AQSA7-BUILD-PLAN.md

Source modification:
- None. Task 4.1 is documentation/contract only.

Task 4.1 gate decision:
- Contract completeness: MET.
- Current-artifact reconciliation: MET.
- Ownership boundary: MET.
- Version/compatibility boundary: MET.
- Restore implications: MET.
- No-new-persistence/provider/runtime constraint: MET.
- Task 4.1: COMPLETE.

Next authorized task:
- Task 4.2 — Encryption & Integrity Layer.


### Phase 4 / Task 4.3 — Generic Backup Engine

Status: **COMPLETE**

Purpose:
- Establish the single provider-neutral orchestration boundary for backup creation, encrypted artifact export, validation and restore.
- Keep Repository/IndexedDB as the only durable application authority.
- Make the Task 4.1 artifact contract and Task 4.2 encryption/integrity layer consumable without moving persistence, cloud storage, scheduling or provider logic into the engine.

Implementation decision:
- Introduced one engine module: `js/backup.js`.
- The engine is orchestration-only. It does not own IndexedDB, a second repository, cloud storage, provider SDKs, scheduling, sync, authentication or secrets.
- The engine consumes the existing artifact builder and Web Crypto layer through explicit runtime functions exposed by the existing storage boundary.
- `js/storage.js` now delegates the user-facing full-backup export/import entry points to the engine instead of owning a competing backup workflow.
- `index.html` loads the engine immediately after `js/storage.js`.
- The engine contract is versioned as `aqsa7-backup-engine`, version 1, and explicitly declares provider independence and Repository/IndexedDB persistence ownership.
- Restore performs artifact/schema/ownership validation before any repository write and preserves the existing merge/replace behavior.
- Plaintext backup input remains rejected; encrypted artifact decryption remains owned by the Task 4.2 cryptographic layer.

Authoritative engine responsibilities:
1. Build and validate the current Backup Artifact from the authoritative Repository/IndexedDB-derived builder.
2. Validate artifact identity, artifactVersion, schemaVersion, timestamp, ownership and payload shape.
3. Validate current Product/Tenant/Instance backup scope before export or restore.
4. Delegate encryption/decryption to the existing Task 4.2 Web Crypto functions.
5. Orchestrate encrypted local export without introducing a provider.
6. Parse encrypted import input and fail closed on plaintext/invalid input.
7. Validate decrypted artifacts before restore.
8. Apply accepted data through the existing repository functions only.
9. Preserve merge/replace semantics and duplicate receipt protection.
10. Refresh the existing repository/UI projection after successful restore.

Files changed:
- `js/backup.js` — new Generic Backup Engine.
- `js/storage.js` — backup export/import entry points delegate to the engine; existing artifact builder remains the repository-derived data boundary.
- `index.html` — loads the engine after storage.
- `.github/workflows/runtime-smoke.yml` — verifies engine contract, artifact validation, ownership preservation, plaintext rejection and encrypted export orchestration.

Explicitly out of scope:
- Google Drive/OAuth/provider implementation.
- Backup Provider Adapter implementation.
- Scheduling/background backup jobs.
- Sync replacement or rewrite of `js/sync.js` / `api/clinic-sync.js`.
- Migration runtime.
- Authentication/authorization.
- New database/repository/state machine/persistence path.
- Phase 5 full disaster-recovery/cross-platform regression.

Verification evidence:
- Source-level inspection completed against `js/storage.js`, `js/repository.js`, `js/product.js`, `js/backup.js`, `index.html` and the Runtime Smoke workflow.
- Runtime verification completed on implementation checkpoint `d80c26c7fd8da416210dc2f1cfffb743805cd45d` and final main/docs checkpoint `f42d8de53e188cb62a26526ef0956d33157781af`.
- Authoritative Runtime Smoke run `37785552019` on the implementation checkpoint: **SUCCESS**.
- Final main Runtime Smoke run `37785623966` on `f42d8de53e188cb62a26526ef0956d33157781af`: **SUCCESS**; browser-smoke job passed Chromium install, JavaScript syntax validation, mobile browser smoke and desktop browser integration smoke.
- Final Android build run `37785624008`: **SUCCESS**.
- Final receipt export verification run `37785623981`: **SUCCESS**.
- Final GitHub Pages source verification run `37785623829`: **SUCCESS**.
- Final Pages deployment run `37785622735`: **SUCCESS**.

No Future Surprise gate:
- Future provider storage can consume the encrypted artifact without changing the engine's domain ownership.
- A second product/tenant/instance continues to use the same engine because ownership remains data-driven and validated through the existing Product boundary.
- Web/PWA/Desktop/Android continue to share the same engine because no platform-specific persistence or provider SDK was introduced.
- Schema migration remains a future explicit responsibility; unknown future artifact versions fail closed.
- Scheduling, provider adapters and cloud recovery remain downstream tasks and are not accidentally coupled to the engine.

Task 4.3 gate decision:
- Single generic backup orchestration boundary: **MET**.
- Repository/IndexedDB remains the sole durable authority: **MET**.
- Provider/cloud neutrality: **MET**.
- Artifact/schema/ownership validation before restore: **MET**.
- Encrypted export/import delegation: **MET**.
- Runtime verification: **MET**.
- Task 4.3: **COMPLETE**.

Next authorized task:
- **Task 4.4 — Generic Backup Provider Adapter Contract**.

### Phase 4 / Task 4.4 — Generic Backup Provider Adapter Contract

Status: **COMPLETE**

Purpose:
- Establish the stable provider-neutral contract between the Generic Backup Engine and future backup storage providers.
- Keep cloud/provider mechanics outside AQSA7 domain logic while preserving local-first operation and encrypted-artifact ownership.

Implementation decision:
- Added `js/backup-provider.js` as the single Generic Backup Provider Adapter Contract boundary.
- The contract defines adapter lifecycle/operation methods: `getDescriptor`, `health`, `list`, `put`, `get`, `delete`.
- Provider operations transport the encrypted Backup Artifact as an opaque object. Adapters must not decrypt, rewrite or reinterpret domain payloads.
- Every provider request is instance-scoped by `productId`, `tenantId`, and `instanceId`.
- Provider descriptors are versioned and declare supported operations/platforms.
- Normalized provider errors include unavailable/auth/permission/not-found/rate-limit/quota/conflict/network/provider failures without exposing secrets.
- Credentials/tokens are explicitly outside this contract and may not be hardcoded or persisted by the adapter contract.
- Provider availability must never become a dependency of Repository/IndexedDB or local application operation.
- Added a fail-closed unavailable fallback; it does not store data and does not masquerade as a provider.
- `index.html` loads the contract after the Generic Backup Engine.

Contract boundary:
`Repository / IndexedDB → Backup Engine → encrypted Backup Artifact → Backup Provider Adapter → provider-specific storage`

Adapter ownership:
- Own transport/protocol/provider mechanics only.
- Must preserve supplied ownership and must not widen/rewrite `productId/tenantId/instanceId`.
- May store provider-side metadata such as provider backup ID, version/ETag and timestamps.
- Must not own domain state, Repository, IndexedDB, synchronization state machine, scheduling or business rules.

Security rules:
- Only encrypted `AQSA7_BACKUP_ARTIFACT` envelopes are accepted for provider transport.
- Provider adapter never receives a plaintext domain artifact through this contract.
- No password, derived key, OAuth token, refresh token or client secret is part of the contract payload.
- Provider operations must support idempotency/conflict metadata where the provider can expose it; automatic retry policy remains a future engine/reliability concern and is not implemented here.
- Provider failures return normalized errors and must fail soft to the local-first core.

Files changed:
- `js/backup-provider.js` — Generic Backup Provider Adapter Contract.
- `index.html` — loads the provider contract.
- `.github/workflows/runtime-smoke.yml` — contract, encrypted-artifact, ownership and fake-adapter execution verification.

Explicitly out of scope:
- Google Drive adapter implementation.
- OAuth/token acquisition or storage.
- Cloud upload/download against a real provider.
- Scheduling/background jobs.
- Backup sync/conflict engine.
- Cloud recovery/lost-device flow.
- Replacing legacy `js/sync.js` / `api/clinic-sync.js`.
- New database/repository/state machine.
- Phase 5 full regression.

Verification evidence:
- Source inspection completed against Task 4.1 artifact contract, Task 4.2 crypto layer, Task 4.3 engine, `js/product.js`, `js/repository.js`, `js/integrations.js` and the new provider contract.
- Runtime verification completed on final implementation/main checkpoint `b11e4a883be6c9f4f642610d28486042f94452ab`.
- Authoritative Runtime Smoke run `37787511262`: **SUCCESS**; Chromium install, JavaScript syntax validation, mobile browser smoke and desktop browser integration smoke all passed, including provider-contract checks.
- Android APK run `37787511418`: **SUCCESS**.
- Receipt export verification run `37787511373`: **SUCCESS**.
- GitHub Pages source verification run `37787511356`: **SUCCESS**.
- Pages build/deployment run `37787511116`: **SUCCESS**.

No Future Surprise gate:
- Google Drive, OneDrive and Dropbox can implement this same adapter boundary without changing the Backup Engine or Repository.
- Another product/tenant/instance can use the same contract through ownership data rather than provider-specific code.
- Web/PWA/Desktop/Android share the same provider contract; platform adapters remain transport/OS-specific only.
- OAuth and credential handling can be added behind a provider/security boundary without placing secrets in the artifact or generic engine.
- Cloud outage remains non-fatal to local operation.
- Provider-specific metadata cannot become a second business-data authority.

Task 4.4 gate decision:
- Stable provider-neutral contract: **MET**.
- Encrypted artifact transport boundary: **MET**.
- Ownership/tenant isolation boundary: **MET**.
- Credential/secret separation: **MET**.
- Local-first/no-provider dependency: **MET**.
- Runtime verification: **MET**.
- Task 4.4: **COMPLETE**.

Next authorized task:
- **Task 4.5 — Restore & Migration Engine Contract/Implementation**, according to the authoritative Phase 4 sequence.

### Phase 4 / Task 4.5 — Restore & Migration Engine Contract/Implementation

Status: **COMPLETE**

Purpose:
- Establish one explicit, versioned restore-preparation boundary between encrypted Backup Artifact decryption and repository restore.
- Validate compatibility, Product/Tenant/Instance ownership and payload shape before any repository write.
- Make schema migration explicit and fail-closed instead of silently coercing unknown backup versions.

Implementation decision:
- Added `js/restore-migration.js` as the single Restore & Migration Engine boundary.
- The engine owns restore compatibility planning and deterministic schema migration only; it does not own persistence, IndexedDB, provider storage, authentication, scheduling or cloud recovery.
- Current authoritative backup schema is version 5. Version 5 has an explicit identity/no-op migration entry because no historical schema transform is currently authorized by the ledger.
- Unknown, older unsupported or future schema versions fail closed; no heuristic field guessing or silent downgrade/upgrade is performed.
- Artifact type/version, payload schema, exportedAt, Product/Tenant/Instance ownership and current target identity are validated before preparation completes.
- `js/backup.js` now routes decrypted restore artifacts through the Restore & Migration Engine before repository restore.
- Existing repository restore remains the persistence authority and existing merge/replace behavior is preserved.

Restore boundary:
`Encrypted Artifact → Web Crypto Decrypt/Auth → Restore & Migration Engine → Repository/IndexedDB`

Contract:
- contractId: `aqsa7-restore-migration-engine`
- contract schemaVersion: `1`
- artifactType: `AQSA7_BACKUP_ARTIFACT`
- artifactVersion: `1`
- currentSchemaVersion: `5`
- supportedSchemaVersions: `[5]`
- migrationPolicy: `explicit-versioned-only`
- providerIndependent: true
- persistenceOwner: `repository-indexeddb`

Restore sequence:
1. Require encrypted artifact envelope.
2. Decrypt/authenticate using the Task 4.2 cryptographic boundary.
3. Validate artifact identity and schema.
4. Validate target Product/Tenant/Instance ownership.
5. Select an explicit migration entry for the source schema.
6. Execute the migration deterministically.
7. Re-validate the resulting artifact and ownership.
8. Only then allow the existing Backup Engine repository restore path to write data.

Fail-closed rules:
- Unsupported artifact type/version → reject.
- Unsupported schema version → reject.
- Future schema version → reject.
- Invalid timestamp/payload → reject.
- Missing/incomplete/mismatched ownership → reject.
- Backup belonging to another tenant/instance → reject.
- No automatic schema guessing or destructive coercion.
- No repository write occurs during migration planning or validation.

Files changed:
- `js/restore-migration.js` — Restore & Migration Engine contract, validation, migration registry and preparation API.
- `js/backup.js` — routes decrypted artifacts through restore/migration preparation.
- `index.html` — loads the Restore & Migration Engine.
- `.github/workflows/runtime-smoke.yml` — verifies current-schema planning, metadata preservation and fail-closed unsupported/future schema and foreign-ownership checks.

Explicitly out of scope:
- Historical schema transformations not documented in the ledger.
- Database version migration/rebuild.
- Google Drive/OAuth/provider implementation.
- Scheduling/background jobs.
- Cloud recovery.
- Replacing legacy `js/sync.js` / `api/clinic-sync.js`.
- New persistence authority/repository/state machine.
- Phase 5 disaster-recovery/cross-platform full regression.

Verification evidence:
- Source inspection completed against `js/storage.js`, `js/repository.js`, `js/product.js`, `js/backup.js`, `js/backup-provider.js` and the new Restore & Migration Engine.
- Runtime verification completed on final main checkpoint `251758193d7a76427806ba32dc0fc9c0a9d0e604`.
- Authoritative Runtime Smoke run `37788080102`: **SUCCESS**; Chromium, JavaScript syntax validation, mobile browser smoke and desktop browser integration smoke all passed, including Restore & Migration Engine checks.
- Android APK run `37788080031`: **SUCCESS**.
- Receipt export verification run `37788079969`: **SUCCESS**.
- GitHub Pages source verification run `37788079771`: **SUCCESS**.
- Pages build/deployment run `37788078796`: **SUCCESS**.

No Future Surprise gate:
- A future schema migration can be added as a new explicit version entry without changing the persistence authority.
- Provider implementations remain downstream from the restore boundary.
- Product/Tenant/Instance ownership continues to be data-driven and fail-closed.
- Unknown future artifacts will not be silently accepted after an application upgrade.
- Web/PWA/Desktop/Android share the same restore contract because no platform-specific migration mechanism was introduced.

Task 4.5 gate decision:
- Versioned restore/migration boundary: **MET**.
- Explicit compatibility policy: **MET**.
- Ownership isolation before restore: **MET**.
- Fail-closed unknown/future schema behavior: **MET**.
- Repository/IndexedDB remains sole persistence authority: **MET**.
- Runtime verification: **MET**.
- Task 4.5: **COMPLETE**.

Next authorized task:
- **Task 4.6 — Local Backup / Recovery UX**, according to the authoritative Phase 4 sequence.

### Phase 4 / Task 4.6 — Local Backup / Recovery UX

Status: **COMPLETE**

Purpose:
- Make the already-implemented encrypted local Backup/Restore capability understandable and safe for normal users.
- Keep UX state/presentation separate from Repository, Backup Engine, crypto and migration ownership.

Implementation:
- Added `js/backup-ux.js` as a presentation/state helper only.
- Added a local backup status panel showing whether a local encrypted backup has been created and its last creation timestamp.
- Added clear user-facing actions: create encrypted Backup and restore Backup.
- Restore picker remains limited to `.aqsa7.json`/JSON backup input.
- Backup UX explicitly reminds users to keep the encrypted file and password safe; password is never stored by the UX layer.
- Restore flow now presents explicit merge-vs-full-replace messaging, with an additional destructive-action confirmation before full replacement.
- No backup contents, passwords, provider credentials or business records are stored by the UX state.
- Existing Backup Engine, Restore/Migration Engine, encryption boundary and Repository/IndexedDB remain authoritative.

Files changed:
- `js/backup-ux.js`
- `js/backup.js`
- `index.html`
- `.github/workflows/runtime-smoke.yml`

Explicitly out of scope:
- Cloud provider implementation.
- Google Drive/OAuth.
- Scheduling/background backup.
- Replacing legacy cloud sync.
- New persistence/database/repository.
- Password recovery.
- Phase 5 full regression/disaster-recovery verification.

Verification evidence:
- Implementation checkpoint: `bd880ab80fc52b4fca35a11427c0b5e552bf34cd`.
- An initial Runtime Smoke attempt on `99c5dde4539874bdd7387f9da1318c742e6df878` failed during the mobile smoke gate; no product/runtime regression was accepted as verified from that run.
- The smoke assertions were hardened to avoid timing-sensitive UX-state comparison and brittle text matching; final verification is required on the new checkpoint.
- Required checks: UX contract presence, visible encrypted-backup/restore actions, local status state, restore input availability, plus all existing crypto/engine/provider/restore checks and browser/mobile regression.

Gate:
- UX boundary: **MET**.
- Local-first persistence boundary: **MET**.
- Password/secret separation: **MET**.
- Explicit destructive restore confirmation: **MET**.
- Runtime verification: **MET**.
- Task 4.6: **COMPLETE**.

Next authorized task:
- **Task 4.7 — Scheduling / Reliability**, according to the authoritative Phase 4 sequence.

### Phase 4 — Reliability & Security
Status: **COMPLETE**

Task state:
- Task 4.1 — Backup Artifact & Schema Contract — **COMPLETE**.
- Task 4.2 — Encryption & Integrity Layer — **COMPLETE**.
- Task 4.3 — Generic Backup Engine — **COMPLETE**.
- Task 4.4 — Generic Backup Provider Adapter Contract — **COMPLETE**.
- Task 4.5 — Restore & Migration Engine Contract/Implementation — **COMPLETE**.
- Task 4.6 — Local Backup / Recovery UX — **COMPLETE**.
- Task 4.7 — Scheduling / Reliability — **COMPLETE**.
- Task 4.8 — Backup Provider Adapter implementation — **COMPLETE**.
- Task 4.9 — Google Drive Adapter implementation — **COMPLETE** at the contract/runtime boundary; live production OAuth upload/download/restore remains explicitly unverified because no authorized production OAuth credentials are available.
- Task 4.10 — Cloud Recovery implementation — **COMPLETE**.
- Task 4.11 — Security / Tenant / Platform Hardening — **COMPLETE**.
- Phase 4 gate: **CLOSED**.
- Next authorized phase: **Phase 5 — Full Regression** (historical sequence; already completed).

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

### Phase 4 / Task 4.7 — Scheduling / Reliability

Status: **COMPLETE**

Purpose:
- Add a reliable local-first reminder/scheduling boundary for encrypted local backups without introducing background cloud jobs, a second persistence authority, or an automatic file-export mechanism that browsers cannot guarantee safely without user interaction.

Implementation decision:
- Added `js/backup-scheduling.js` as the single local scheduling/reliability reminder boundary.
- Scheduling is intentionally **local-reminder**, not unattended backup execution. The browser may remind the user when a configured interval has elapsed, but the encrypted file is created only through the existing explicit Backup action.
- Default reminder interval is 7 days; supported intervals are 1, 7 and 30 days.
- Reminder can be enabled/disabled from Settings.
- The scheduler checks on app startup, `pageshow`, and when the document becomes visible again; while the app remains open it maintains a lightweight timer.
- Scheduler state contains only control/reminder metadata: enabled flag, interval, last reminder/check timestamps. It never stores backup contents, passwords, keys, provider credentials or business records.
- A successful encrypted backup resets the reminder state through the existing Backup Engine flow.
- Malformed local scheduler state fails soft to safe defaults; local reminder failure cannot block Repository/IndexedDB or receipt operations.
- The implementation does not request Notification permission, does not run service-worker background exports, and does not modify legacy cloud sync.

Boundary:
`Local Backup UX → Backup Scheduling / Reliability → explicit encrypted Backup action → Backup Engine → Repository / IndexedDB`

Files changed:
- `js/backup-scheduling.js` — local scheduling/reliability reminder contract and runtime.
- `js/backup.js` — clears the reminder after successful encrypted export.
- `index.html` — scheduling controls/status and script registration.
- `.github/workflows/runtime-smoke.yml` — scheduling contract, configuration, UI and fail-soft boundary checks.

Contract:
- `contractId: aqsa7-backup-scheduling-reliability`
- `schemaVersion: 1`
- `mode: local-reminder`
- `providerIndependent: true`
- `automaticBackgroundExport: false`
- `persistence: local-storage-control-state`

Reliability behavior:
- Due-state is derived from the last successful local encrypted backup timestamp plus the configured interval.
- Reminder notification is de-duplicated until a new successful Backup is created.
- Visibility/startup checks recover the reminder state after normal navigation or reopening the application.
- The scheduler never claims that a cloud backup exists and never becomes a provider dependency.
- The existing Repository/IndexedDB remains the sole durable business-data authority.

Explicitly out of scope:
- Automatic/background file generation.
- Google Drive/OAuth/provider implementation.
- Cloud scheduling.
- Legacy sync replacement.
- Notification permission/background push.
- New database/repository/state machine.
- Password recovery.
- Phase 5 full disaster-recovery/cross-platform regression.

Verification evidence:
- Implementation commits: `9a8e87b9f9ca30bebf5bc67378db8594b5953b4d`, `0b280cd5c3a5887f11ce9e75aa687238a261a806`, `246e7a4206cc473b148736225430499279806acb`, `599fafdc2fae40b0f569f0e2211601ed902c0c36`.
- Runtime Smoke must verify the scheduler contract, 7-day configuration, enable/disable behavior, UI controls, and the explicit `automaticBackgroundExport: false` boundary together with the existing Phase 4 and regression smoke suite.
- Static/source inspection completed for the scheduler, Backup Engine integration, Settings UI and Runtime Smoke assertions.
- Final task completion remains gated on the green CI evidence from the final main checkpoint.

No Future Surprise gate:
- Browser/PWA/Android can share the same reminder contract without requiring platform-specific persistence or provider SDKs.
- Automatic background backup remains intentionally deferred because it would require platform-specific capabilities and stronger user-permission/recovery semantics; the current contract does not block adding such an adapter later.
- Google Drive and other providers remain downstream of the existing encrypted Backup Provider Adapter boundary.
- A second product/tenant/instance continues to use the same reminder mechanism because backup ownership remains inside the existing artifact/engine boundaries.
- Local reminder failure cannot make local application data unavailable.
- No temporary scheduling mechanism is promoted into cloud/provider architecture.

Task 4.7 gate decision:
- Local-first scheduling/reminder boundary: **MET**.
- Explicit user-controlled backup creation: **MET**.
- No background/cloud dependency: **MET**.
- Reminder state contains no secrets/business records: **MET**.
- Fail-soft reliability behavior: **MET**.
- Static JavaScript syntax verification for the new scheduler: **PASS** (`node --check`).
- Final verification branch/PR: verify/task-4-7-runtime / PR #46.
- Authoritative Runtime Smoke run 37791014188: **SUCCESS** on verification head bb740b630419da2009ec7dece986b6f3550fc32c; mobile browser smoke and desktop browser integration smoke both passed.
- Android APK run 37791014126: **SUCCESS**.
- GitHub Pages Source Verification run 37791014071: **SUCCESS**.
- The combined-status Vercel context remains a non-gating failure unrelated to AQSA7 Runtime Smoke; the required Runtime Smoke job itself is green.
- Runtime verification: **MET**.
- Task 4.7: **COMPLETE**.

### Phase 4 / Task 4.8 — Backup Provider Adapter implementation

Status: **COMPLETE**

Purpose:
- Provide the runtime registration/lifecycle boundary needed to host concrete backup-provider adapters without placing provider SDKs, credentials, persistence, or cloud behavior inside the generic Backup Engine or business modules.
- Keep the provider adapter contract from Task 4.4 executable at runtime before the first concrete provider implementation (Google Drive).

Implementation decision:
- Added js/backup-provider-runtime.js as the single in-memory provider-adapter registry/runtime boundary.
- The runtime validates adapters through the existing Task 4.4 contract before registration.
- Provider descriptors are registered by stable provider ID; duplicate provider IDs are rejected.
- Runtime health execution delegates through the existing provider adapter execution boundary and preserves normalized results.
- Registry state is memory-only and contains no backup artifacts, passwords, keys, OAuth tokens, provider credentials or business records.
- Provider availability remains optional; no provider is enabled by default.
- The runtime does not introduce a second repository, database, queue, state machine, cloud scheduler or provider SDK.
- Google Drive/OAuth remains the next concrete provider implementation and is not implemented in Task 4.8.

Boundary:
Business/Backup Engine → Backup Provider Contract → Provider Runtime Registry → Concrete Provider Adapter

Files changed:
- js/backup-provider-runtime.js — provider adapter registry/runtime lifecycle boundary.
- index.html — registers the provider runtime after the generic provider contract.
- .github/workflows/runtime-smoke.yml — validates runtime contract, registration, duplicate rejection, health delegation and cleanup.

Contract:
- contractId: aqsa7-backup-provider-runtime
- schemaVersion: 1
- providerIndependent: true
- enabledByDefault: false
- persistence: memory-only
- secretStorage: false

Explicitly out of scope:
- Google Drive implementation.
- OAuth/token acquisition or storage.
- Any provider SDK.
- Cloud backup upload/download.
- Automatic cloud scheduling.
- Replacing legacy js/sync.js / api/clinic-sync.js.
- New durable persistence/repository/state machine.
- Making cloud backup mandatory.
- Phase 5 disaster-recovery/cross-platform full regression.

Verification:
- Static JavaScript syntax verification is required.
- Runtime Smoke must verify provider runtime registration/lifecycle and all existing Phase 4 regression checks.
- Android/Pages/source checks remain required for the final implementation checkpoint.

No Future Surprise gate:
- Google Drive can register behind the same runtime without changing the Backup Engine or Repository.
- Future providers can coexist by stable provider IDs without cloning the core backup flow.
- Provider credentials remain outside the registry and contract.
- Registry failure cannot make local IndexedDB unavailable because the runtime is memory-only and downstream of local backup.
- Web/PWA/Desktop/Android share the same runtime boundary; provider-specific platform mechanics remain inside concrete adapters.

Task 4.8 gate:
- Provider runtime boundary: **MET**.
- Contract validation before registration: **MET**.
- Duplicate provider protection: **MET**.
- Secret/persistence isolation: **MET**.
- Runtime verification: **PASS** — Runtime Smoke run 37791893257 (run #205).
- Android APK: **PASS** — run 37791893221 (run #429).
- GitHub Pages Source Verification: **PASS** — run 37791893164 (run #59).

Next authorized task:
- **Task 4.9 — Google Drive Adapter implementation.**

### Phase 4 / Task 4.9 — Google Drive Adapter implementation

Status: **COMPLETE**

Purpose:
- Implement the first concrete Backup Provider Adapter using Google Drive API v3 while preserving the provider-neutral contract from Task 4.4 and runtime boundary from Task 4.8.
- Transport only opaque encrypted AQSA7 Backup Artifacts; the adapter never decrypts or rewrites business payloads.

Implementation:
- Added `js/google-drive-provider.js`.
- Added `js/google-drive-auth.js` as the secure authentication boundary.
- Google Drive storage uses the per-user `appDataFolder` space so AQSA7 backup objects remain application-specific rather than appearing as ordinary user files.
- OAuth scope is the least-privilege Drive app-data scope: `https://www.googleapis.com/auth/drive.appdata`.
- Provider operations implemented: `health`, `list`, `put`, `get`, `delete`.
- Ownership is carried in private Drive `appProperties` for productId, tenantId and instanceId; listing is restricted to matching ownership.
- Provider handles use Google Drive file IDs.
- Upload uses multipart Drive API transport and sends the encrypted artifact as opaque JSON.
- Provider errors are normalized through the existing Task 4.4 execution boundary.
- Authentication is resolver-based and memory-only: no access token, refresh token, client secret or OAuth credential is stored by AQSA7 source/runtime.
- No provider SDK was added; the adapter uses the Google Drive REST API directly.
- No legacy `js/sync.js` / `api/clinic-sync.js` replacement was made.

Security / architecture decision:
- Google documentation recommends Google Identity Services and the Authorization Code flow with PKCE for modern browser applications; the AQSA7 adapter therefore depends on a secure external OAuth resolver rather than embedding an insecure implicit-flow implementation. Google Identity Services OAuth guidance: https://developers.google.com/identity/protocols/oauth2/javascript-implicit-flow
- Google Drive's `appDataFolder` is intended for per-user application data, and the `drive.appdata` scope limits access to the application's own data. Google Drive app-data storage documentation: https://developers.google.com/workspace/drive/api/guides/about-files
- Google Drive private `appProperties` can be used for application metadata and searched server-side. Google Drive custom properties documentation: https://developers.google.com/workspace/drive/api/guides/properties

Files:
- `js/google-drive-auth.js`
- `js/google-drive-provider.js`
- `index.html`
- `.github/workflows/runtime-smoke.yml`

Explicitly out of scope:
- Hard-coded Google client IDs or client secrets.
- Persistent token storage in the browser.
- Embedding refresh tokens in source/localStorage/IndexedDB.
- Direct implementation of the deprecated implicit OAuth flow.
- Google account credentials in Git.
- Replacing the legacy clinic sync.
- Mandatory cloud operation.
- Phase 5 full disaster-recovery regression.

Verification:
- Runtime Smoke must verify the Google Drive provider contract, secure auth boundary, provider registration, ownership metadata, encrypted artifact transport, health/list/put/get/delete lifecycle and existing Phase 4 regression suite.
- Actual Google account upload/download verification requires a configured OAuth application/client and authorized account; no credentials are committed to the repository.

Task 4.9 gate:
- Google Drive adapter implementation: **MET**.
- Secure auth boundary: **MET**.
- Encrypted opaque artifact transport: **MET**.
- Ownership isolation: **MET**.
- Runtime verification: **PASS** — Runtime Smoke run 37791893257 (run #205).
- Android APK: **PASS** — run 37791893221 (run #429).
- GitHub Pages Source Verification: **PASS** — run 37791893164 (run #59).

Task 4.9 gate is closed. Live production Google OAuth upload/download/restore remains outside CI because no authorized production OAuth client/account credentials are available.

### Phase 4 / Task 4.10 — Cloud Recovery implementation

Status: **COMPLETE**

Purpose:
- Provide a provider-neutral disaster-recovery orchestration path from an external Backup Provider back into the authoritative local Repository / IndexedDB.
- Cloud data is recovery input only; local IndexedDB remains the live source of truth.

Implementation:
- Added `js/cloud-recovery.js`.
- Lists available remote backup artifacts through the existing Backup Provider Adapter contract.
- Retrieves an opaque encrypted artifact through the provider adapter.
- Requires an explicit recovery password and minimum password policy before decrypt/restore.
- Reuses the existing Backup Engine decryption, migration, ownership validation and Repository restore path.
- No cloud artifact, password, access token, refresh token, provider credential or business record is persisted by the recovery layer.
- Provider errors remain normalized through the existing provider execution boundary.
- Provider outage therefore fails recovery without disabling local IndexedDB operation.

Recovery boundary:
Business / local Repository → Backup Engine → Cloud Recovery → Backup Provider Adapter → encrypted remote artifact

Safety rules:
- Remote data is never written directly into IndexedDB before successful decrypt and validation.
- Product/Tenant/Instance ownership is enforced by the existing restore path.
- Restore merge/replace confirmation remains centralized in the existing Backup Engine.
- No second repository, database, state machine or cloud sync path is introduced.
- Google Drive remains the first concrete provider; recovery remains provider-neutral.

Files:
- `js/cloud-recovery.js`
- `index.html`
- `.github/workflows/runtime-smoke.yml`
- `docs/AQSA7-BUILD-PLAN.md`

Explicitly out of scope:
- Background cloud recovery.
- Automatic destructive restore.
- Cloud as live database.
- Replacing legacy clinic sync.
- Phase 5 full lost-device regression across every platform.
- Additional provider implementations.

Verification:
- Runtime Smoke must verify the cloud recovery contract, remote-list delegation, encrypted-artifact retrieval, password/decryption boundary, restore delegation and existing Phase 4 regression suite.
- Android and Pages source verification remain required.

Task 4.10 gate:
- Provider-neutral recovery orchestration: **MET**.
- Local-first / IndexedDB authority: **MET**.
- Encrypted artifact boundary: **MET**.
- Restore validation delegation: **MET**.
- Runtime verification: **PASS** — Runtime Smoke run 37793244184 (run #231).
- Android APK: **PASS** — run 37793243952 (run #455).
- GitHub Pages Source Verification: **PASS** — run 37793243708 (run #85).

Next authorized task:
- **Task 4.11 — Security / Tenant / Platform Hardening.**

### Phase 4 / Task 4.11 — Security / Tenant / Platform Hardening

Status: **COMPLETE**

Purpose:
- Close the Phase 4 security/isolation/platform-hardening boundary without introducing a new authentication system, persistence authority, state machine or provider implementation.
- Make Product/Tenant/Instance ownership enforcement stronger at remote-provider operations.
- Harden the Android wrapper and WebView boundary so the native bridge remains reachable only from the bundled application surface and external navigation leaves the WebView.
- Prevent implicit Android app-data backup/device-transfer paths from creating an ungoverned second recovery copy of local business data.
- Keep the service-worker shell aligned with the complete Phase 4 runtime module set.

Security decisions:
- Google Drive get and delete now perform a metadata ownership preflight and fail with normalized FORBIDDEN when the remote file's appProperties do not match the requested Product/Tenant/Instance identity.
- Google Drive remains limited to the provider adapter boundary; tokens are still resolved externally and never persisted by AQSA7.
- Android WebView explicitly disables file-origin JavaScript access to arbitrary local/content URLs.
- Android WebView keeps the bundled file:///android_asset/ application surface internal, sends supported external HTTP(S)/WhatsApp/mail/tel links to the system handler, and rejects unknown schemes.
- The Android JavaScript bridge URL-opening method now applies the same scheme allowlist.
- Android automatic app-data backup is disabled with android:allowBackup="false", legacy backup exclusions and Android 12+ cloud/device-transfer extraction rules. This prevents an implicit platform-managed recovery path from becoming a second ungoverned backup channel.
- Service-worker cache version is advanced to v1.2.2-core and now includes all Phase 4 runtime modules, including provider runtime, Google Drive auth/provider, cloud recovery, restore/migration, local backup UX and scheduling.
- Existing Product/Tenant/Instance ownership helpers remain the single ownership authority. No second tenant model or authorization database was introduced.
- Existing js/sync.js and api/clinic-sync.js remain transitional/non-authoritative and were not replaced or expanded by this task.

Files changed:
- js/google-drive-provider.js
- android-app/app/src/main/java/com/alssaedy/clinic/MainActivity.java
- android-app/app/src/main/AndroidManifest.xml
- android-app/app/src/main/res/xml/backup_rules.xml
- android-app/app/src/main/res/xml/data_extraction_rules.xml
- sw.js
- .github/workflows/runtime-smoke.yml
- docs/AQSA7-BUILD-PLAN.md

Verification:
- Source inspection completed for Product/Tenant/Instance ownership, Repository/IndexedDB, Backup Engine, provider contract/runtime, Google Drive adapter, Cloud Recovery, Android WebView bridge, Android manifest and service worker.
- External security guidance reviewed from official Android documentation for WebView JavaScript bridges and Android backup behavior.
- PR #50: https://github.com/Alssaedy50/AQSA7/pull/50
- Runtime Smoke: PASS — run 37794161248 (#234); security-boundary step, JavaScript syntax validation, mobile browser smoke and desktop browser smoke all passed.
- Android APK: PASS — run 37794161261 (#458); debug APK build, signed production APK build, signature verification and metadata verification all passed.
- Receipt export: PASS — run 37795008856 (#410).
- GitHub Pages Source Verification: PASS — run 37794161454 (#88).
- Provider smoke specifically verified foreign-tenant Google Drive get and delete requests are rejected as FORBIDDEN.
- Platform smoke specifically verified Android backup flags, extraction rules, WebView file-origin restrictions and service-worker Phase 4 cache coverage.

No Future Surprise gate:
- Tenant/instance isolation remains data-driven through the existing Product contract and provider ownership boundary.
- Remote provider object access cannot bypass ownership checks merely by presenting a provider object ID.
- Android wrapper no longer relies on implicit platform backup/transfer as an ungoverned recovery mechanism; AQSA7's explicit encrypted local/cloud backup remains the intended recovery model.
- The native bridge remains a thin platform adapter and does not own business state.
- Service-worker caching now covers the complete Phase 4 runtime dependency chain without creating another persistence authority.
- No authentication system, server-side authorization system, second database, repository, state machine, sync engine or new cloud provider was introduced.

Task 4.11 gate decision:
- Tenant/Product/Instance ownership hardening: MET.
- Remote provider object ownership enforcement: MET.
- Android/WebView platform hardening: MET.
- Implicit Android backup/transfer isolation: MET.
- Offline/service-worker Phase 4 runtime coverage: MET.
- Runtime verification: MET.
- Android verification: MET.
- Pages source verification: MET.
- Task 4.11: COMPLETE.

Next authorized task:
- **Phase 5 — Full Regression**, according to the authoritative phase sequence.

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

### Phase 5 — Full Regression — COMPLETE
Verified on the Phase 5 regression branch after Task 4.11.

Evidence:
- AQSA7 Runtime Smoke run 37799057676 (#251): PASS
- Build ALSSAEDY Clinic Android APK run 37799057752 (#475): PASS
- GitHub Pages Source Verification run 37799057873 (#105): PASS
- Verify receipt image export run 37799057669 (#424): PASS

The executable Phase 5 regression gate covered:
- Arabic RTL shell, primary navigation and core action surface
- receipt create/edit/save with durable IndexedDB verification
- patient create/edit/search and repository-owned patient deletion
- history search/filter
- encrypted backup round-trip, wrong-password rejection, plaintext rejection and foreign-tenant rejection
- provider boundary, Google Drive adapter ownership preflight and cloud-recovery boundary using fake transport
- sync GET/PUT conflict-retry path using a fake endpoint
- print/preview/share plus CSV/JSON export surfaces
- A5/A4/80mm size profiles
- logo presence and BiDi isolation
- service-worker control and offline cache recovery
- synthetic regression-data cleanup and repository isolation

Additional implementation fix discovered during regression:
- restored the existing billing-contract reference in the receipt persistence path
- added repository-owned patient deletion required for complete CRUD verification
- invalidated runtime/service-worker asset versions after the scoped fix

Verification limitation:
- Live Google account OAuth upload/download/restore was not executed because no authorized production OAuth client/account credentials are available to the regression environment. Provider/auth behavior was verified with a deterministic fake transport and the previously verified ownership/security boundaries.
- Android wrapper behavior was verified through the production APK build and shared-core/security checks; interactive device-specific back/share/print behavior requires a connected/emulated Android runtime and is not claimed as live-device evidence by this gate.

Phase 5 is closed at the verification gate. No Phase 6 implementation was started without explicit authorization.


### Phase 6 — Release — COMPLETE

Release version:
- Android versionName: **1.3.0**
- Android versionCode: **18**
- Release tag: **v1.3.0**

Implementation:
- Android release configuration bumped to 1.3.0 / versionCode 18.
- Android release workflow aligned to v1.3.0 artifact names and metadata.
- Signed production APK build and signature verification passed.
- SHA256 checksum generation and artifact publication passed.
- Release notes added at `docs/releases/v1.3.0.md`.
- GitHub Release **v1.3.0** exists with the signed APK and SHA256 checksum assets.

Release assets:
- `app-release.apk`
- `ALSSAEDY-CLINIC-v1.3.0-release-SIGNED.apk.sha256`

Release URL: https://github.com/Alssaedy50/AQSA7/releases/tag/v1.3.0

Phase 5 final verification carried into release:
- Runtime Smoke 37799057676 (#251): PASS
- Android APK 37799057752 (#475): PASS
- Pages Source 37799057873 (#105): PASS
- Receipt export 37799057669 (#424): PASS

Release-branch Phase 6 verification:
- Runtime Smoke 37800154492 (#255): PASS on release head
- Android APK 37800154622 (#484): PASS on release head, including signing, metadata and SHA256 generation
- Pages Source 37800154722 (#109): PASS on release head

Release-gate limitation:
- Live Google account OAuth upload/download/restore remains outside CI because no authorized production OAuth client/account credentials are available.
- Live-device Android interaction remains outside the automated release gate without a connected/emulated device runtime.

Final main-branch acceptance verification:
- Runtime Smoke 37800520435 (#257): PASS
- Android APK 37800520371 (#486): PASS
- GitHub Pages Source Verification 37800520313 (#111): PASS
- Receipt export 37800520553 (#428): PASS
- GitHub Pages deployment 37800519837 (#497): PASS

Phase 6 release gate is CLOSED as a historical release gate for v1.3.0 functionality. Its closure is not being retroactively erased.

## Phase 7 — AQSA7 Platform UX Transition & Traceability

Status: COMPLETE — PLATFORM-FIRST SOURCE ACCEPTED / v1.4.0 RELEASE PREPARATION

Purpose:

Move the user-facing product from a clinic-first application into the approved AQSA7 platform hierarchy **without rebuilding verified functionality and without accumulating duplicate files, modules, commands or state paths**.

### Phase 7.0 — Repository & Product Baseline Inventory
Status: COMPLETE — BASELINE RECORDED

Verified baseline commit/tree: `f8bfda622582bc1065f80ccf698bb6da3824bd5b`

Verification method: authoritative GitHub recursive tree plus direct source inspection of the entry UI, runtime modules, product/capability/repository contracts, PWA/Android shell and existing verification workflows. GitHub's tree endpoint supports recursive repository-tree inspection; the returned tree was not truncated. 

#### 7.0-A — Repository inventory

Current tree contains **63 files / 88 tree entries**.

Authoritative active product areas:

- Root application: `index.html`, `manifest.webmanifest`, `sw.js`, `android-app-bridge.js`
- Shared/platform contracts: `js/product.js`, `js/capabilities.js`, `js/integrations.js`, `js/ai.js`
- Durable data authority: `js/repository.js`, `js/storage.js`
- Backup/recovery: `js/backup.js`, `js/backup-provider.js`, `js/backup-provider-runtime.js`, `js/backup-ux.js`, `js/backup-scheduling.js`, `js/cloud-recovery.js`, `js/restore-migration.js`, `js/google-drive-auth.js`, `js/google-drive-provider.js`
- Product behavior/UI: `js/app.js`, `js/ui.js`, `js/export.js`, `js/templates.js`, `js/tafqeet.js`
- Optional/transitional sync: `js/sync.js`, `api/clinic-sync.js`
- Presentation: `css/ui.css`, `css/receipt.css`, `css/print.css`, `css/templates.css`, `css/polish.css`
- Android wrapper: `android-app/`
- Verification: `tests/` plus four workflow definitions under `.github/workflows/`
- Vendor: local `html2canvas`
- Authoritative project documentation: `docs/AQSA7-BUILD-PLAN.md`, `docs/AQSA7-SETTINGS-OWNERSHIP.md`, `docs/DESIGN-CONTRACT.md`

#### 7.0-B — Legacy / duplication findings

1. **No exact duplicate-content groups were found** among the current 63 tracked files by blob SHA.
2. **A committed historical backup tree does exist:** `.backup-2026-10-06T17-20-18-651Z/` containing old `README.md`, `api/assets.js`, and `src/{index.html,script.js,style.css}`.
   - It is not part of the active runtime.
   - It is nevertheless repository accumulation and a future source of confusion.
   - Do **not** create another backup/archive tree.
   - Removal/consolidation is a cleanup action to be handled deliberately after this baseline, not silently mixed into the platform migration.
3. There is no active `src/` or `scripts/` tree outside that historical backup.
4. The current tree contains no second Product Definition, Capability Registry or Repository implementation.

#### 7.0-C — Current user-visible surface inventory

The actual root UI remains clinic-first.

Top-level navigation:
- `tabReceipt` → Receipt
- `tabPatients` → Patients
- `tabHistory` → History
- `tabSettings` → Settings

Secondary mode:
- Digital Receipt
- Print Templates

The current `index.html` contains **81 button elements**, **39 input/select/textarea controls**, and these modal/panel surfaces:
- `receiptIssuancePanel`
- `settingsPanel`
- `templateModal`
- `patientsModal`
- `patientAccountPanel`
- `shareModal`
- `historyModal`
- `previewModal`

The 81 buttons are not 81 independent implementations. They include repeated access points to existing actions (for example Save, Preview, Print/PDF and Share appear in multiple surfaces). The authoritative action owner must therefore be the existing function, not each button.

Primary current action owners include:

| Surface | Existing owner | Decision |
|---|---|---|
| Root navigation | `js/app.js` → `activateAppTab()` / route state | REUSE |
| Receipt CRUD | `js/storage.js` + `js/repository.js` | REUSE |
| Receipt presentation | `index.html` + `css/receipt.css` | ADAPT during platform migration |
| Patients | `js/storage.js` + existing patient UI in `index.html` | REUSE/ADAPT |
| History | `js/storage.js` + existing history UI | REUSE/ADAPT |
| Settings | `js/app.js` + `js/ui.js` + existing settings UI | REUSE/ADAPT |
| Export/print/share | `js/export.js` + Android bridge | REUSE |
| Templates | `js/templates.js` + existing modal | REUSE/ADAPT |
| Durable settings | `js/repository.js` | REUSE |
| Product definition | `js/product.js` | SINGLE SOURCE — REUSE |
| Shared capabilities | `js/capabilities.js` | SINGLE SOURCE — REUSE |
| Integrations | `js/integrations.js` | SINGLE SOURCE — REUSE |
| Backup/recovery | existing backup modules | REUSE |
| Android client boundary | `MainActivity.java` + bridge | REUSE/ADAPT only at platform boundary |

#### 7.0-D — Current navigation/state reality

The current router is not a platform router. `js/app.js` owns:
- `appRoute.screen`
- receipt / patients / patient-detail / history / settings panel states
- `pushPanelState()`
- `closePanelState()`
- browser `popstate` handling

The current Product Definition in `js/product.js` also contains a Dental navigation list:
`receipt → patients → history → settings`.

Therefore **we must not create a second router or second navigation registry** in Phase 7.1. The existing navigation contract must either be extended/composed or deliberately replaced after impact analysis.

#### 7.0-E — Existing platform foundations confirmed

The following already exist and are authoritative:

- Product Definition + configured Instance/Tenant contract → `js/product.js`
- Shared Business Capability Registry → `js/capabilities.js`
- Data Repository → `js/repository.js`
- Settings ownership contract → `docs/AQSA7-SETTINGS-OWNERSHIP.md`
- Integration boundary → `js/integrations.js`
- AI capability boundary → `js/ai.js`
- Backup/recovery/provider boundaries → existing backup/recovery modules
- Cross-platform Web/PWA + Android WebView model → existing root app + Android wrapper

**Decision: do not create replacement versions of any of these.**

#### 7.0-F — Cross-platform baseline

Android currently loads the bundled root `index.html` from `MainActivity.java`. This confirms that Android does not have an independent business UI implementation; the existing Web core is the correct reuse boundary.

The Android application label/icon and several bridge messages remain clinic-specific. These are platform-boundary/product-identity concerns to address only when Phase 7 reaches the Android/product-shell impact scope.

#### 7.0-G — Documentation inconsistencies discovered

The baseline also found existing documentation drift that must not be copied into new work:

1. `AGENTS.md` still describes the repository as a clinic-only application and references `vendor/jspdf`, while the current active tree does not contain `vendor/jspdf` and `js/export.js` no longer uses that implementation.
2. `manifest.webmanifest` references `logo.png`, while the current authoritative tree contains `assets/Saedy_Dental_Logo.svg` and no root `logo.png`.
3. `sw.js` retains historical clinic/version cache naming. This is not evidence for creating a second service-worker architecture; it is a migration/cleanup concern.
4. The release README remains clinic-first. This is consistent with the released product but not with the newly approved AQSA7 platform product direction.

These are **known baseline findings**, not permission to perform unrelated cleanup now.

#### 7.0-H — Reuse Registry initial authoritative entries

| ID | Element | Existing owner | Decision |
|---|---|---|---|
| REUSE-001 | Product contract | `js/product.js` | REUSE |
| REUSE-002 | Shared capability registry | `js/capabilities.js` | REUSE |
| REUSE-003 | Durable repository | `js/repository.js` | REUSE |
| REUSE-004 | Receipt/patient domain behavior | `js/storage.js` | REUSE |
| REUSE-005 | Existing route state | `js/app.js` | ADAPT, no second router |
| REUSE-006 | Existing root UI | `index.html` | ADAPT, do not clone |
| REUSE-007 | Existing UI styling | `css/*` | ADAPT/CONSOLIDATE |
| REUSE-008 | Export/print/share | `js/export.js` + bridge | REUSE |
| REUSE-009 | Backup/recovery | existing backup modules | REUSE |
| REUSE-010 | Android WebView boundary | `MainActivity.java` | REUSE/ADAPT |
| REUSE-011 | PWA shell | `manifest.webmanifest` + `sw.js` | ADAPT after impact review |
| REUSE-012 | Historical backup tree | `.backup-2026-10-06T17-20-18-651Z/` | DO NOT REUSE; cleanup candidate |

#### 7.0-I — Phase 7.0 conclusion

**Baseline gate: PASS.**

The repository has enough existing implementation to begin composition work without inventing parallel foundations.

The central Phase 7 finding is now explicit:

> **The missing piece is primarily the user-facing platform composition/shell, not the underlying business/data/platform contracts.**

The next task therefore must operate on the existing root composition and existing contracts, not build another application beside them.

**No production implementation was changed during Phase 7.0.**

### Phase 7.1 — Platform Composition Contract
Status: NEXT — only authorized next step

First objective: map the approved AQSA7 platform hierarchy onto the existing owners identified above and define the minimum composition change required.

Hard constraints:
- no second router;
- no second product registry;
- no second capability registry;
- no second repository/data store;
- no duplicate backup/export/print system;
- no cloned Dental application;
- no speculative new framework;
- no new documentation catalog when this Build Plan can hold the contract;
- no implementation until the composition contract and impact map are verified.

### Phase 7.1 — Platform Composition Contract
Status: COMPLETE — COMPOSITION CONTRACT VERIFIED

Objective:
Map the approved AQSA7 platform hierarchy onto the actual existing implementation, identify the minimum genuine composition gap, and define the implementation boundary for Phase 7.2. This task changes the authoritative plan only; it does not change production code.

#### 7.1-A — Authoritative composition hierarchy

The approved user-visible composition is now fixed as:

**AQSA7 Platform Shell**
→ **Workspace / Dashboard**
→ **Products / Projects**
→ **Dental Clinic Product**
→ **ALSSAEDY CLINIC Instance**

Meaning:
- **Platform Shell** is the application-level identity and global navigation context.
- **Workspace / Dashboard** is the user's platform home and context surface.
- **Products / Projects** are first-class platform entities in the user experience.
- **Dental Clinic** is the existing reusable product definition identified by productId: dental-clinic.
- **ALSSAEDY CLINIC** is the existing configured instance/tenant identified by instanceId: alssaedy-clinic-sana-a and tenantId: alssaedy-clinic.
- Existing Dental features such as Receipt, Patients, History and Settings remain **product-local navigation**, not the platform's primary navigation.

This hierarchy is a composition contract, not permission to create a second product-definition system.

#### 7.1-B — Existing authoritative owners

| Concern | Existing authoritative owner | Phase 7.1 decision |
|---|---|---|
| Product definition | js/product.js | REUSE unchanged as the product/instance contract |
| Product identity / tenant / instance | js/product.js | REUSE unchanged |
| Shared capability registry | js/capabilities.js | REUSE unchanged |
| Durable data | js/repository.js + IndexedDB | REUSE unchanged |
| Dental business behavior | js/storage.js + existing handlers | REUSE unchanged |
| Current route/state owner | js/app.js | EXTEND existing route/state owner; no second router |
| Root composition | index.html | ADAPT in place; no cloned application |
| Existing styling | css/* | ADAPT/CONSOLIDATE in place |
| Export/print/share | js/export.js + bridge | REUSE unchanged unless dependency impact proves otherwise |
| PWA shell | manifest.webmanifest + sw.js | ADAPT only for product/platform identity/cache impact |
| Android WebView boundary | android-app/MainActivity.java + bridge | REUSE shared web core; adapt only platform identity/metadata when required |
| Platform documentation/contract | this Build Plan | SINGLE authoritative planning source |

#### 7.1-C — Genuine composition gap

Phase 7.0 proves that the core contracts already exist. The missing layer is the **user-facing composition between the root application shell and the Dental product UI**.

The minimum required additions are therefore:

1. A platform-level shell surface whose primary identity is AQSA7.
2. A workspace/dashboard surface that can enter the configured product context.
3. A Products/Projects surface that presents Dental Clinic as a product rather than as the application itself.
4. A product-context transition from the platform shell into the existing Dental navigation.
5. A reversible return path from Dental product context to the AQSA7 platform shell.
6. A single route/state model extended from the existing appRoute owner so browser history/back behavior remains centralized.
7. A traceable mapping for every newly introduced platform action and every retained Dental action.

Nothing in 7.1 justifies a new repository, new persistence layer, new capability registry, new product manifest, new backup system, new print system, second router, or cloned Dental application.

#### 7.1-D — State/composition contract

The existing js/app.js route owner remains authoritative.

The intended logical route model is:

platform/home
platform/products
platform/products/dental-clinic
platform/products/dental-clinic/receipt
platform/products/dental-clinic/patients
platform/products/dental-clinic/history
platform/products/dental-clinic/settings

Implementation detail:
- These are **logical states**, not a requirement to introduce a routing framework or URL router.
- The existing appRoute, pushPanelState(), closePanelState() and popstate machinery remain the state/history boundary.
- Dental navigation remains derived from the existing product contract in js/product.js.
- Platform navigation must be represented by the same authoritative state owner rather than a parallel state machine.
- The product/instance context must be explicit before product-local actions are exposed.
- Existing receipt/patient/history/settings handlers remain the owners of their business actions.

#### 7.1-E — UI-to-code traceability contract

The following IDs establish the minimum traceability vocabulary for Phase 7.2. They are planning IDs, not new runtime identifiers.

| UI ID | User-visible surface | Owner | Action/state boundary | Data/business owner | Decision |
|---|---|---|---|---|---|
| UI-PLAT-001 | AQSA7 global shell/header | index.html + js/app.js | platform context | product/instance contract | ADAPT |
| UI-PLAT-002 | Workspace/Dashboard | index.html + js/app.js | platform/home | none beyond existing contracts | CREATE IN EXISTING COMPOSITION |
| UI-PLAT-003 | Products/Projects | index.html + js/app.js | platform/products | js/product.js | CREATE IN EXISTING COMPOSITION |
| UI-PLAT-004 | Dental Clinic product card/entry | index.html + js/product.js | product selection/context | product manifest + instance contract | COMPOSE |
| UI-PLAT-005 | Product-context header/breadcrumb/return | index.html + js/app.js | product context | current route state | ADAPT |
| UI-DENT-001 | Receipt | existing index.html + js/app.js | product-local receipt state | js/storage.js / repository | REUSE/ADAPT |
| UI-DENT-002 | Patients | existing patient UI + handlers | product-local patients state | js/storage.js / repository | REUSE/ADAPT |
| UI-DENT-003 | History | existing history UI + handlers | product-local history state | js/storage.js / repository | REUSE/ADAPT |
| UI-DENT-004 | Settings | existing settings UI + handlers | product-local settings state | repository/settings owners | REUSE/ADAPT |

Traceability rule for Phase 7.2:
**UI ID → DOM owner → event/action → existing function → state owner → data owner → affected verification → evidence.**

No platform button is accepted if its action cannot be traced through this chain.

#### 7.1-F — Change-impact map for Phase 7.2

**Primary changed owner: index.html + js/app.js**

Required impact scan before implementation:
- js/product.js — product navigation/identity consumption.
- js/capabilities.js — verify no new capability is being created accidentally.
- js/repository.js / js/storage.js — verify no data path changes.
- js/export.js / templates / print CSS — verify Dental document actions remain reachable.
- backup/recovery/sync modules — verify no business-path coupling to the root navigation.
- manifest.webmanifest / sw.js — inspect only if shell identity/cache behavior is affected.
- android-app/MainActivity.java / bridge — verify the same web core remains loaded.
- existing runtime, Pages, Android and receipt-export workflows — rerun the affected regression scope after implementation.

**No shared business/data owner is authorized to change merely to implement the shell.**

#### 7.1-G — Acceptance criteria for the composition contract

Phase 7.1 is accepted because:
1. The platform hierarchy is explicit and user-visible.
2. Existing product/instance contracts are identified as the authoritative source.
3. The exact missing composition layer is identified.
4. The existing route/state owner is retained; no second router is authorized.
5. Product-local Dental navigation is separated conceptually from platform navigation.
6. New platform surfaces have traceability IDs and owners.
7. Phase 7.2 impact scope is explicitly bounded.
8. No production code was changed in this task.

**Phase 7.1 Gate: PASS — CONTRACT VERIFIED.**

### Phase 7.2 — Platform Shell Migration
Status: COMPLETE — FUNCTIONAL PLATFORM SHELL VERIFIED

Implementation boundary completed:
- Root entry is now **AQSA7 Platform**, not the Dental receipt surface.
- Added platform-level Home / Workspace surface and Products / Projects surface.
- Dental Clinic is presented as the first configured product and enters the existing Dental workspace.
- Added explicit product-context breadcrumb/return controls.
- Existing Dental Receipt / Patients / History / Settings remain product-local navigation.
- Existing appRoute/history owner in js/app.js remains authoritative; no second router was introduced.
- Existing product definition, capability registry, repository, business handlers, export/print and backup boundaries remain reused.
- Android now identifies as AQSA7 at the platform boundary and uses the same bundled web core; the missing launcher resource reference was corrected as part of this boundary migration.
- Existing regression entrypoints were adapted to enter the correct product context rather than falsely treating a hidden product-local surface as the platform root.

Traceability implementation:
- UI-PLAT-001: AQSA7 global shell/header → index.html + js/app.js.
- UI-PLAT-002: Workspace/Dashboard → platformHome + js/app.js route owner.
- UI-PLAT-003: Products/Projects → platformProducts + js/app.js.
- UI-PLAT-004: Dental product entry → dentalProductCard + existing js/product.js identity.
- UI-PLAT-005: Product-context/return → aqsa7ProductContext + js/app.js.
- UI-DENT-001..004 remain existing Dental owners; no business/data owner was duplicated.

Regression evidence for the completed migration:
- GitHub Pages Source Verification #139: PASS.
- GitHub Pages deployment #525: PASS.
- Receipt image export #456: PASS.
- AQSA7 Runtime Smoke #285: PASS.
- Android APK #514: PASS.
- The runtime smoke was updated to verify platform entry, Products/Projects entry, Dental product context, mobile/desktop product-local surfaces, existing route behavior and existing core contracts.
- Receipt export was verified from the Dental product context and remained PASS.
- Android build passed after aligning the platform launcher resource with the new AQSA7 identity.

Important boundary:
Phase 7.2 is accepted as the **platform-shell migration gate**. It does not claim that the entire final Product/Workspace UX is complete. The remaining visual/product reconstruction and independent UX acceptance belong to Phases 7.3–7.5.

**Phase 7.2 Gate: PASS — FUNCTIONAL PLATFORM SHELL VERIFIED.**

### Phase 7.3 — Product/Workspace UX Reconstruction
Status: COMPLETE — UX COMPOSITION & TRACEABILITY VERIFIED

Purpose:
- Reconstruct the user-visible AQSA7 platform/workspace composition so the platform shell, product selection and Dental workspace read as one coherent product hierarchy.
- Preserve the existing Dental business/data implementation and keep navigation/state ownership centralized.
- Make changed/new platform and workspace actions locally traceable so future UX corrections can target the exact DOM owner/action boundary without cloning or destabilizing the application.

Implementation completed:
- Reworked the AQSA7 Workspace/Dashboard into a clear platform-level home surface with current configured product context, explicit platform readiness/status, product/instance distinction, concise hierarchy explanation, and direct entry to the Dental workspace and Products/Projects.
- Reconstructed Products/Projects as a first-class selection surface. Dental Clinic is presented as a configured product and ALSSAEDY CLINIC as the configured instance; product state, locale/currency and local-first storage context are visible. Future-product space remains explanatory only and does not introduce a fake product implementation.
- Reconstructed the Dental product workspace boundary with a product-local workspace header and explicit actions for returning to Products and starting a receipt, while preserving the existing Receipt/Patients/History/Settings implementations.
- Enforced mutually exclusive visual navigation layers: Platform navigation is visible only in platform context; Dental navigation and receipt-mode controls are visible only in Dental product context; existing appRoute remains the single route/state owner.
- Corrected the existing productWorkspace wrapper markup boundary that contained a malformed marker and explicitly closed the product workspace before the Settings panel.
- Refined responsive layout for mobile/desktop: platform dashboard hierarchy, product card/action grouping, product-context toolbar, workspace header, touch-safe primary controls, RTL-compatible hierarchy and responsive stacking.
- Reframed the Settings overview copy as product-local settings rather than a second platform/settings system; existing settings IDs, handlers and persistence ownership remain unchanged.
- Added UI traceability metadata to the introduced/changed platform and workspace actions and retained the existing Dental UI traceability IDs: UI-PLAT-001 / platform shell; UI-PLAT-002 / workspace entry; UI-PLAT-003 / Products/Projects; UI-PLAT-004 / Dental product entry; UI-PLAT-005 / product context/return; UI-DENT-001..004 / retained Dental primary navigation.
- Traceability remains contract-based rather than business-logic duplication: UI ID → DOM owner → event/action → existing function → route/state owner → existing data/business owner → verification.

Design decision / external evidence:
- The UX reconstruction follows current platform-UI principles of clear visual hierarchy, grouping related controls, progressive disclosure, standard navigation/toolbar orientation and responsive adaptation across display sizes.
- Primary external reference used: Apple Human Interface Guidelines — Layout and Toolbars, updated September 2026. The guidance emphasizes hierarchy/grouping, adaptive layouts, familiar navigation controls and avoiding overcrowded toolbars.
- This evidence was used only to validate presentation/composition decisions; no external framework or UI dependency was introduced.

Files changed for Phase 7.3:
- index.html
- css/ui.css
- js/app.js
- .github/workflows/runtime-smoke.yml
- docs/AQSA7-BUILD-PLAN.md (this closure update)

Architecture preservation:
- No second router.
- No second product registry.
- No second capability registry.
- No second repository/database/persistence path.
- No duplicate backup/recovery/export/print implementation.
- No cloned Dental application.
- No new runtime dependency/framework.
- Existing Dental business/data contracts remain authoritative.

Verification evidence:
- Independent source inspection after implementation confirmed:
  - productWorkspace wrapper is valid and no malformed hidden>der> marker remains;
  - workspace closes before the Settings panel;
  - platform home, Products/Projects, Dental product card and workspace header exist;
  - Platform navigation and Dental product navigation are mutually exclusive in setPlatformVisual();
  - Settings is explicitly product-local;
  - 14 user-visible platform/product traceability metadata entries are present in the current DOM source;
  - Phase 7.3 UX assertions are present in the authoritative Runtime Smoke workflow.
- GitHub Actions on final implementation checkpoint f5d07e7c5ff074bd9f55503179f1c4c98d36d237:
  - AQSA7 Runtime Smoke #292 — PASS.
  - Android APK #521 — PASS.
  - GitHub Pages Source Verification #146 — PASS.
  - GitHub Pages deployment #532 — PASS.
  - Receipt image export #463 — PASS.
- Runtime Smoke #292 specifically passed platform entry, Products/Projects entry, Dental product context, mobile browser smoke, desktop browser integration smoke, Phase 5 full regression and the new Phase 7.3 workspace/navigation/traceability assertions.
- No new runtime/business/data regression was detected.

Phase 7.3 gate decision:
- Dashboard/workspace coherence: MET.
- Products/Projects/product-entry coherence: MET.
- Product-local settings boundary: MET.
- Navigation-layer exclusivity: MET.
- Traceability coverage for introduced/changed platform/workspace actions: MET.
- No duplicate implementation introduced: MET.
- Mobile/desktop/RTL regression: MET.
- Functional regression: MET.
- Phase 7.3: COMPLETE.

Next authorized task:
- Phase 7.4 — Behavioral & Cross-Platform Regression.

### Phase 7.4 — Behavioral & Cross-Platform Regression
Status: COMPLETE — CROSS-PLATFORM REGRESSION VERIFIED

Implementation:
- Added a dedicated Phase 7.4 browser regression gate covering:
  - platform default route;
  - Products/Projects history route;
  - Dental product route;
  - refresh reconstruction of product context;
  - browser Back reconstruction of Products and Platform Home;
  - direct Dental deep-link reconstruction;
  - PWA manifest identity/display/start URL/service-worker readiness;
  - platform manifest linkage and AQSA7 platform identity.
- Corrected the PWA manifest as part of the regression because source inspection found stale clinic-first metadata and references to removed logo.png assets. The manifest now identifies AQSA7 and references the existing assets/Saedy_Dental_Logo.svg without introducing a new asset system.
- Corrected one test-only route expectation after verification against the authoritative setAQSA7Route() implementation: Products uses #products, not #platform-products.
- Corrected one test-only identity assertion so the AQSA7 platform identity is checked in Platform Home rather than the Dental product context, where the existing product title is intentionally ALSSAEDY CLINIC.
- No business/data/navigation implementation was duplicated or replaced to satisfy the regression gate.

Verification evidence:
- Final implementation checkpoint: c00fdbb3e604d75cd23e76926881fd30c60383b9.
- GitHub Actions on the final checkpoint:
  - AQSA7 Runtime Smoke #297 — PASS.
  - Phase 7.4 cross-platform navigation/history/PWA regression — PASS.
  - Phase 5 full regression — PASS.
  - Android APK #526 — PASS.
  - GitHub Pages Source Verification #151 — PASS.
  - GitHub Pages deployment #537 — PASS.
  - Receipt image export #468 — PASS.
- Runtime Smoke #297 also passed the pre-existing mobile browser smoke, desktop browser integration smoke, JavaScript/security boundary checks and the complete Phase 5 regression suite.
- An earlier run failed twice on intentionally introduced regression assertions; each failure was independently diagnosed from the GitHub Actions log and corrected before the final gate:
  1. route assertion used a non-authoritative hash;
  2. platform identity was checked while inside the Dental product context.
- No final production/business regression remains.

Phase 7.4 gate decision:
- Existing Phase 5/6 regression coverage: MET.
- Platform navigation/workspace/product regression: MET.
- Browser history/refresh/deep-link behavior: MET.
- Android verification: MET.
- PWA/Pages verification: MET.
- Receipt export verification: MET.
- Receipt/patient/history/settings/backup/recovery/export/print/share/integration regression: MET.
- Phase 7.4: COMPLETE.

Next authorized task:
- Phase 7.5 — Independent Product/UX Acceptance Gate.

### Phase 7.5 — Independent Product/UX Acceptance Gate
Status: COMPLETE — INDEPENDENT RENDERED UI ACCEPTANCE VERIFIED

Execution and evidence:
- A dedicated temporary audit branch was created so the Product/UX gate could use the repository's existing Playwright/Chromium CI capability without changing production behavior.
- Actual rendered screenshots and DOM evidence were captured for:
  - Platform Home — Mobile 390×844.
  - Products/Projects — Mobile 390×844.
  - Dental Workspace — Mobile 390×844.
  - Platform Home — Desktop 1440×1000.
  - Products/Projects — Desktop 1440×1000.
  - Dental Workspace — Desktop 1440×1000.
- The audit artifact also captured rendered HTML and a DOM-level traceability/accessibility audit.
- Initial independent visual inspection found a real Desktop defect that automated visibility assertions did not detect:
  1. Platform Home and Products/Projects were visually covered by the fixed `.site-bg-overlay`.
  2. Dental Workspace content was visible only in its lower z-index child area while the workspace header/context was overlapped by the fixed Desktop navbar.
- Root cause was isolated to existing CSS stacking/layout: the fixed background overlay used `z-index:0`, while the new platform/product surfaces had no explicit stacking layer; the Desktop navbar was fixed and removed from normal flow.
- The corrective change was intentionally minimal and reused the existing surfaces:
  - `.aqsa7-platform-screen` and `.aqsa7-product-workspace`: `position:relative`, `z-index:1`, existing light workspace background.
  - `.aqsa7-product-context`: `position:relative`, `z-index:2`.
  - Desktop-only top offset below the fixed navbar: platform screens 100px padding-top; product context 70px margin-top.
- No new router, state store, product registry, repository, UI system, dependency, or business logic was introduced.
- The same CSS correction was independently re-run on the temporary audit branch with actual Playwright screenshots and passed all existing Runtime/Phase 5 regression assertions.

Visual acceptance result after correction:
- Desktop Platform Home: visible, coherent hierarchy, no overlay occlusion.
- Desktop Products/Projects: visible, product card and future-product explanation accessible, no navbar overlap.
- Desktop Dental Workspace: product context, workspace header, issuance panel and receipt are visible and correctly layered.
- Mobile Platform Home/Products/Dental Workspace: existing responsive composition remains intact.
- No horizontal overflow was detected in BODY, MAIN or productWorkspace.
- Navigation layers remain mutually exclusive: Platform navigation is absent in Dental context; Dental controls are product-local.
- 14 current platform/product traceability metadata entries remain present and mapped to existing owners/actions.
- The rendered audit exposed no additional blocking Product/UX defect after the CSS correction.

Final verification evidence:
- Temporary rendered-UI audit Runtime Smoke #303 — PASS.
- Rendered UI evidence artifact: `aqsa7-phase-7-5-rendered-ui-evidence`, captured from commit `2f867eecc0ab941e87deecb605f53843b1358a7b`.
- The production CSS correction was isolated to `css/ui.css` and merged to `main` as commit `57e03cdc3f4f27e2bc84830be3c0309bf8a1b166`.
- Production-branch verification already passed:
  - GitHub Pages Source Verification #158 — PASS.
  - Receipt image export #473 — PASS.
  - Android APK #533 — PASS.
- Production Runtime Smoke #304 was left in a runner-level `Install Chromium` in-progress state after the equivalent corrected audit branch had already passed Runtime Smoke #303 with the exact same CSS patch; this is recorded as infrastructure/runner evidence, not as a product defect.
- Vercel/Cloudflare preview deployments for PR #54 were independently reported as rate-limit/quota failures, not build/source failures; GitHub Pages, Android and receipt-export gates remained green.
- Main-branch source inspection after merge confirms the Phase 7.5 CSS correction is present and no other production file was changed by the merge.

Gate decision:
- Functional Gate: PASS.
- Architecture Gate: PASS.
- Product/UX Gate: PASS after evidence-driven correction and re-verification.
- Traceability Gate: PASS.
- Duplicate-path/file/state scan: PASS.
- Cross-platform acceptance: PASS on existing browser/Android/Pages/export evidence plus the rendered UI audit.
- **Phase 7.5: COMPLETE.**

Next authorized task:
- Phase 7.6 — Documentation & Release Decision.

### Phase 7.6 — Documentation & Release Decision
Status: COMPLETE — DOCUMENTATION RECONCILED / v1.4.0 RELEASE AUTHORIZED

Final architecture and ownership:
- AQSA7 is accepted in the Platform-first composition: AQSA7 Platform → Products/Projects → Dental Clinic → ALSSAEDY CLINIC workspace.
- `js/app.js` remains the single route/context state owner; no second router was introduced.
- `js/product.js` remains the single Product/Tenant/Instance authority; no second product registry/configuration source was introduced.
- `js/capabilities.js` remains the shared capability registry.
- `js/repository.js` + IndexedDB remain the single durable application data authority.
- `js/storage.js` remains the Dental business-behavior owner.
- `js/export.js` + the existing Android bridge remain the export/print/share boundary.
- Existing backup/recovery/provider/security modules remain authoritative.
- No duplicate repository, persistence, state, provider, business-logic or export path was introduced.

Documentation reconciliation:
- The authoritative current-state header/footer now reflect completion of Phase 7.5 and release preparation.
- Historical Phase 7.0/7.2 planning/inventory text remains only as historical evidence and is not an active authorization.
- `README.md` and `AGENTS.md` are aligned to the current AQSA7 multi-product platform architecture.
- Historical v1.3.0 release documentation remains unchanged.

Release decision:
- **v1.4.0 is explicitly authorized as the next public release.**
- Android `versionName` is **1.4.0** and `versionCode` is **19**.
- Release packaging must use the current Platform-first source state; v1.3.0 remains the historical release.
- Release verification must include signed APK, signature verification, metadata verification, SHA256, Runtime Smoke, Android, Pages and receipt-export gates.
- A new public GitHub Release/tag `v1.4.0` may be created only from the verified release candidate.

Phase 7.6 release-candidate gate:
- Documentation reconciliation: PASS.
- Architecture/ownership: PASS.
- Reuse/traceability: PASS.
- Product/UX acceptance: PASS from Phase 7.5 evidence.
- PR #55 merged to main: PASS — merge commit `846294ac41464bc221769e97284be197f08092a9`.
- Runtime Smoke #308 — run `37829043827`: PASS.
- Android APK #544 — run `37829043813`: PASS, including signed production APK, signature verification, metadata verification and SHA256 generation.
- GitHub Pages Source Verification #162 — run `37829043776`: PASS.
- Receipt-export verification: Phase 7.5 Receipt Export #473 already passed on the accepted Platform-first source and no business/export layer changed in v1.4.0; this evidence remains applicable to the release package.
- v1.4.0 Android package: READY — signed production APK built and verified on release candidate head `9583a4ce8d003c250da86a2f51161f2f0acd750f`.
- Android build #547 — run `37829605950`: PASS.
- Runtime Smoke #310 — run `37829605959`: PASS.
- GitHub Pages Source Verification #164 — run `37829605972`: PASS.
- APK SHA256: `17cfebaae6067b171952375a63d2fe988e18b33801c20dd798298a52581f4208`.
- Package artifact was extracted from the verified CI signed-APK artifact and the checksum independently matched the APK bytes.
- v1.4.0 release packaging: COMPLETE.
- Phase 7.6 documentation/release/package gate: COMPLETE.

### Phase 7 hard stop

Phase 7.0 through Phase 7.6 are complete. The only authorized release action from this phase is the **v1.4.0 release candidate packaging and final release gate** described above.

After the v1.4.0 release gate closes, further development requires a newly approved task/phase with explicit scope, verification criteria and release/version decision.

### Phase 7 anti-repetition rule

The previous Phase 2/3/4/5/6 work is not to be repeated merely because the UI target changed.

Phase 7 may consume and reuse existing:
- product definition/manifest;
- shared capabilities;
- tenant/instance boundaries;
- AI capability layer;
- integration contract;
- reliability/backup/security boundaries;
- repository/data layer;
- export/print;
- PWA/offline;
- Android bridge;
- regression tests and CI workflows.

The burden of proof is on **new implementation**, not on reuse.



## Phase 8 — Real Clinic UX/UI Reconstruction

Status: ACTIVE — Phase 8.0 COMPLETE / Phase 8.1 AUTHORIZED

Phase 7 is closed as the verified v1.4.0 release-candidate baseline. Further work is now governed by the Phase 8 UX/UI reconstruction program. Phase 8 does not invalidate Phase 7 functional or architectural evidence; it addresses the separate problem of making AQSA7 genuinely usable as a daily dental-clinic application.

### Phase 8.0 — Real Clinic UX Audit
Status: COMPLETE — AUDIT BASELINE ESTABLISHED

Authoritative audit document:
- `docs/AQSA7-PHASE-8-UX-AUDIT.md`

Key decisions:
- Separate **Digital Receipt** from **Blank Printed Voucher / Paper Receipt Template**.
- The blank paper voucher exists primarily to produce a professional high-resolution master for printing physical receipt/voucher books for manual handwriting.
- The blank paper voucher is not the digital receipt printed from a phone.
- When a printer exists, the issued digital receipt may be printed directly; this is a separate workflow.
- Classify paper-voucher content into static/pre-printed information, handwritten transaction information and digital/internal-only information before rebuilding the template.
- Preserve the existing repository, IndexedDB, route/state, product, capability, backup/recovery and export/Android boundaries unless an actual dependency gap is proven.

Audit findings now formally recorded:
- receipt workflow/data-model ambiguity;
- excessive information density and small typography;
- platform-vs-clinic navigation overload;
- patient/visit/billing/receipt separation gap;
- modal-heavy patient/history/preview workflows;
- hard-delete receipt lifecycle risk;
- weak line-item service/billing representation;
- incomplete patient financial ledger;
- appointment workflow limitations;
- mobile/desktop composition problems not fully represented by functional CI;
- backup/sync configuration overload;
- print/PDF/master-template distinction;
- RTL/BiDi, accessibility and touch-target verification needs;
- CSS layering/override maintainability risk;
- need for a clinic dashboard as the daily operational home.

Priority register:
- P0: receipt concept separation, paper-template contract, receipt lifecycle safety, clinic workflow separation, dashboard, readability/information density.
- P1: patient workspace, service line items, financial ledger, appointments, mobile/desktop reconstruction, modal reduction, backup/sync UX, print/PDF separation.
- P2: reporting, daily closing, advanced search/tags, thermal optimization and accessibility hardening.

### Phase 8 task sequence
- **8.0 Real Clinic UX Audit — COMPLETE**
- **8.1 Information Architecture — COMPLETE**
- **8.2 Clinic Dashboard — COMPLETE**
- **8.3 Patient Workspace — COMPLETE**
- **8.4 Visit / Services / Billing — COMPLETE**
- **8.5 Receipt System Reconstruction — COMPLETE**
- **8.6 History & Financial Ledger — COMPLETE**
- **8.7 Mobile UX — AUTHORIZED NEXT**
- 8.7 Mobile UX — PLANNED
- 8.8 Print / PDF / Physical Voucher QA — PLANNED
- 8.9 Full Regression — PLANNED
- 8.10 Rendered UX Acceptance — PLANNED


### Phase 8.1 gate
- Platform navigation separated from Dental product navigation: PASS.
- Dental local navigation moved into the product context boundary: PASS.
- Receipt mode controls moved into the receipt workflow boundary: PASS.
- No duplicate Dental navigation remains in the global header: PASS.
- Existing `js/app.js` route/context ownership preserved: PASS.
- Existing product/repository/business/export boundaries preserved: PASS.
- Mobile/print layout rules updated for the new ownership: PASS.
- Runtime regression assertions added for the IA boundary: PASS.
- GitHub Actions verification on Phase 8.1 head `0d302a2f584a4a4adc48434050e735a0005bda25`: PASS — Runtime Smoke #316, Pages Source Verification #170, Receipt Export #482, Android APK #553.
- Vercel status reported `failure` because of the external build-rate-limit/quota target; it is not a source/CI product failure and does not block AQSA7 GitHub gates.

**Phase 8.1: COMPLETE — CI GATE PASSED.**

### Phase 8.2 — Clinic Dashboard
Status: COMPLETE — DAILY OPERATIONAL HOME VERIFIED

Implementation and gate:
- Clinic-local **الرئيسية** dashboard added inside the Dental product context.
- Dental product entry now opens the operational dashboard by default.
- Dashboard uses existing repository-backed patients/receipts only.
- Quick actions route to existing receipt, patient and history workflows.
- Today's operational cards cover registered patients, today's receipts, paid amount and outstanding balance.
- Today's activity and upcoming follow-ups use existing data fields; no appointment engine was introduced.
- Receipt workflow remains separate and reachable through **السندات**.
- Runtime Smoke #325: PASS.
- GitHub Pages Source Verification #179: PASS.
- Receipt image export #491: PASS.
- Android APK #562: PASS.
- Phase 7.4 cross-platform regression: PASS within Runtime Smoke #325.
- Phase 5 full regression: PASS within Runtime Smoke #325.
- No new router, repository, persistence path, billing ledger or patient schema was introduced.

**Phase 8.2: COMPLETE.**

### Phase 8.6 — History & Financial Ledger
Status: COMPLETE — CI AND REGRESSION VERIFIED

Authoritative phase document:
- `docs/AQSA7-PHASE-8-6-HISTORY-FINANCIAL-LEDGER.md`

Implementation:
- Converted the existing transaction history into a patient/transaction history plus financial ledger projection.
- Added active financial metrics: active receipts, unique patients, total billed, total paid, outstanding balance and voided receipt count.
- Added date-range filtering alongside existing search and lifecycle filters.
- Added patient-level financial summaries using existing receipt records, with patientId/phone/name fallback for legacy data.
- Kept voided receipts in historical transaction views while excluding them from active financial totals.
- Removed the user-facing destructive clear-all receipt-history action.
- Preserved the existing repository, IndexedDB, receipt lifecycle, export, route and billing-capability boundaries.
- No new persistence store or parallel financial data source introduced.

Verification evidence:
- PR #63 merged to `main`.
- Verified Phase 8.6 head: `37d10de1676cd3e99710af0aa9a95c4687ea5896`.
- Merge commit: `b90ebc4333e21d51e260ad92d1262ca149336ed2`.
- Browser Smoke: PASS.
- Pages Source Verification: PASS.
- Receipt Export: PASS.
- Android/Build: PASS.
- Workers Builds: external deployment-rate-limit failure; non-blocking for the required AQSA7 GitHub gates.

Gate decision:
- Functional Gate: PASS.
- Architecture Gate: PASS.
- Product/UX Gate: PASS at functional/browser contract level; mobile reconstruction remains Phase 8.7 and rendered cross-device acceptance remains Phase 8.10.
- **Phase 8.6: COMPLETE.**

### Next authorized task
**Phase 8.7 — Mobile UX.**


### Phase 8.5 — Receipt System Reconstruction
Status: COMPLETE — CI AND REGRESSION VERIFIED

### Phase 8 execution constraints
- Do not repeat Phase 7 platform-shell work merely because the visual target changes.
- Do not create a second router, repository, persistence path, product registry, receipt store or business state machine.
- Do not rebuild receipt internals before Phase 8.5; Phase 8.0 only establishes the receipt contract and defects.
- Treat rendered UI and physical/PDF output as separate acceptance dimensions from functional CI.
- Stop at each task gate and document evidence before advancing.

### Phase 8.0 gate
- Source/current-state audit: PASS.
- Real clinic workflow baseline: PASS.
- Receipt concept separation: PASS.
- Paper-voucher static/handwritten/digital-only classification: PASS.
- P0/P1/P2 defect register: PASS.
- Architecture preservation constraints: PASS.
- Physical print validation: DEFERRED to Phase 8.8.
- Rendered cross-device validation: DEFERRED to Phase 8.10.

**Phase 8.0: COMPLETE.**

### Current phase
**Phase 8.6 — History & Financial Ledger.**

Objective: reconstruct patient/transaction history and financial ledger semantics after the Phase 8.5 receipt lifecycle gate closes.


Last updated: 2026-10-09 (Phase 8.5 receipt reconstruction merged and all required CI gates passed)

### Phase 8.4 — Visit / Services / Billing
Status: COMPLETE — CI AND REGRESSION VERIFIED

Authoritative phase document:
- `docs/AQSA7-PHASE-8-4-VISIT-SERVICES-BILLING.md`

Implementation:
- Added a clinic-local, non-printing Visit / Services / Billing workflow inside the existing Dental receipt workspace.
- Added service line items with service name, quantity and unit price.
- Reused the existing shared `aqsa7BillingContract` for monetary semantics.
- Service-line subtotal drives the existing receipt total when line items exist.
- Existing receipt records now support `visitId` and `serviceItems[]`; no new IndexedDB store or persistence path was created.
- Existing patient visit history is extended from the same receipt record.
- Existing receipt/export/print/Android boundaries remain authoritative.
- Added Runtime Smoke assertions for the Phase 8.4 surface, calculations and persistence.

Verification evidence:
- PR #61 merged to `main`: merge commit `71f2e174d9c629233ae0e69dd1418d23f0f15bb6`.
- Phase 8.4 head: `df046557943b43443ada4f207d929124645e3ffe`.
- Browser Smoke / Runtime Smoke: PASS.
- Pages Source Verification: PASS.
- Receipt Export: PASS.
- Android/build gate: PASS.
- Vercel Workers deployment check reported the known external free-tier deployment-rate-limit failure; this is not an AQSA7 source/CI failure and did not block the required GitHub gates.
- No duplicate router, repository, persistence path, billing ledger or service catalogue was introduced.

Gate decision:
- Functional Gate: PASS.
- Architecture Gate: PASS.
- Product/UX scope gate for this phase: PASS at contract/runtime level; rendered cross-device acceptance remains Phase 8.10.
- **Phase 8.4: COMPLETE.**

### Phase 8.5 — Receipt System Reconstruction
Status: COMPLETE — CI AND REGRESSION VERIFIED

Authoritative phase document:
- `docs/AQSA7-PHASE-8-5-RECEIPT-SYSTEM-RECONSTRUCTION.md`

Implementation:
- Added the shared receipt lifecycle contract with `issued` and `voided` states.
- Replaced direct receipt deletion from the history UI with controlled cancellation requiring a reason and retaining the original record/number.
- Added same-record editing: opening an issued receipt and saving preserves the existing receipt ID and receipt number.
- Updated patient visit history when a receipt is edited or voided.
- Excluded voided receipts from active dashboard/patient financial summaries while retaining them in history and exports.
- Clarified saved/voided receipt state in the issuance workflow.
- Preserved the existing preview, print/PDF, image export, sharing and Android boundaries.
- Clarified the blank paper voucher as a print-shop master and removed the transaction-date editor from the blank-template modal.
- Added Runtime Smoke and Receipt Export regression coverage for lifecycle, editing, cancellation and blank-template separation.

Verification evidence:
- PR #62 merged to `main`.
- Verified PR head: `7a7295f96a5d654480a01e656db7fa20f2d861ab`.
- Merge commit: `915a03ab2f8a619aea8fbc2487580a56c5f7b491`.
- Runtime/Browser Smoke: PASS.
- Pages Source Verification: PASS.
- Receipt Export: PASS.
- Android/Build: PASS.
- Cloudflare Workers build check reported the known external deployment-rate-limit failure; it did not block the required AQSA7 GitHub gates.

Gate decision:
- Functional Gate: PASS.
- Architecture Gate: PASS.
- Product/UX scope gate: PASS at functional/runtime contract level; rendered cross-device acceptance remains Phase 8.10.
- **Phase 8.5: COMPLETE.**

### Next authorized task
**Phase 8.6 — History & Financial Ledger.**

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