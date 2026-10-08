# AQSA7 — Phase 8.0 Real Clinic UX/UI Audit

Status: COMPLETE — AUDIT BASELINE ESTABLISHED
Date: 2026-10-08
Target branch: phase-8-0-real-clinic-ux-audit
Base: main @ 2fb50a9805eb9d01aa44817b37267d4da8526a47

## Purpose

Phase 8.0 establishes the real clinic workflow baseline before implementation of the Phase 8 UX/UI reconstruction.

This is an audit and requirements-lock task, not a feature implementation task. It records the defects, workflow mismatches, information-architecture problems, receipt-model contradiction, visual problems, mobile/desktop issues, financial workflow gaps, accessibility concerns, and architectural constraints that the following Phase 8 tasks must address.

## Critical product decision — receipt model

AQSA7 has two distinct receipt concepts and they must not be conflated:

1. **Digital Receipt**
   - Created from an actual transaction in AQSA7.
   - Contains transaction/patient/payment data.
   - Can be viewed, exported and, when a printer exists, printed directly.
   - PDF/image export represents an actual issued receipt.

2. **Blank Printed Voucher / Paper Receipt Template**
   - A professional high-resolution blank form.
   - Its purpose is to be supplied to a print shop for printing a physical receipt/voucher book.
   - It is intended for manual handwriting when the clinic has no printer.
   - It is NOT the digital receipt printed from a phone.
   - It must never mutate or save the current digital receipt data.
   - Its design must optimize for handwriting, print margins, binding, serial numbering and physical use.

The current source already contains a blank-template workflow, but the information hierarchy and data contract must be audited/reconstructed so the paper template, digital receipt and PDF export are explicitly separate product concepts.

## Data classification for the paper voucher

### Pre-printed/static information

Examples:
- clinic logo;
- Arabic clinic name;
- English clinic name;
- doctor name;
- specialty;
- address;
- phone numbers;
- document title: سند قبض / RECEIPT VOUCHER;
- field labels;
- currency label;
- payment-method labels;
- signature/stamp labels;
- optional serial-number area if the print process requires pre-numbering.

### Handwritten/transaction information

Examples:
- receipt number, when not pre-numbered by the printer;
- date;
- patient/customer name;
- amount;
- amount in words;
- service/reason for payment;
- payment method;
- transfer/reference number;
- received by;
- signature;
- notes, if required.

The final field list must be confirmed during Phase 8.5 before the paper template is rebuilt.

### Digital-only/internal data

Examples:
- patient ID;
- visit ID;
- repository identifiers;
- internal timestamps;
- audit/fingerprint fields;
- application state;
- internal balance calculations;
- device/sync metadata.

These must not be forced onto the physical form unless a documented clinic requirement exists.

## Current-state audit

### A. Information architecture / workflow

Severity: P0/P1

Findings:
- The platform shell is technically valid, but the operational Dental workflow remains visually and cognitively dense.
- Clinic work is distributed across platform navigation, product context, receipt modes, receipt controls, patients, history and settings.
- The operational home should be a clinic dashboard rather than a platform/product management surface for everyday clinic staff.
- Patient, visit, service, billing and receipt concepts are not separated strongly enough.
- Patient profile is implemented as a modal-style surface although it represents a durable patient workspace.
- Appointment support is represented mainly by a return/next-visit field rather than a complete appointment workflow.
- History is primarily receipt-centric; a patient-centric longitudinal view is needed.
- Settings and backup/sync controls are exposed alongside operational clinic actions, increasing cognitive load.

Target hierarchy:
AQSA7 Platform → Dental Clinic Product → Clinic Dashboard → Patient → Visit → Services → Billing → Receipt

Platform administration remains available but must not dominate the daily clinical workflow.

### B. Receipt UX

Severity: P0

Findings:
- Receipt issuance, receipt preview, sharing, printing and blank-template generation are visually close enough to be confused as one workflow.
- The current source contains a blank-template modal and functions, which is positive, but the concept needs a first-class boundary and clearer terminology.
- The current preview actions combine Print, Save PDF and Download Image even though the user has explicitly different use cases for digital issuance versus physical pre-printed books.
- The receipt UI attempts to serve data entry, final document preview and physical print representation at the same time.
- Typography becomes too small because too much information is being forced into the receipt layout.
- A5/A4/80mm are currently exposed as template sizes, but they represent materially different physical use cases and should not be treated as simple scale variants.
- The 80mm thermal template is a printer-oriented feature and must remain secondary to the clinic's current no-printer paper-book workflow.

Required separation:
- Issue digital receipt
- View issued receipt
- Export issued receipt PDF/image
- Print issued receipt when hardware exists
- Generate blank paper-voucher master for print shop

### C. Paper voucher design requirements

Severity: P0

The paper template must:
- be print-shop ready;
- use high-resolution/vector-safe output where possible;
- leave generous handwriting areas;
- reserve safe margins and binding margin;
- avoid tiny typography;
- have a clear visual hierarchy;
- make the transaction fields unmistakable;
- support Arabic RTL correctly;
- distinguish static printed labels from handwritten fields;
- include enough space for amount in words and service/reason;
- include signature/stamp areas;
- allow serial numbering either pre-printed or manually written according to the selected print strategy.

The blank template must not contain a fake patient, fake amount, fake date or transaction-specific data.

### D. Patient management

Severity: P1

Findings:
- Patient search/filter exists and is useful.
- Patient data includes name, gender, age, phone, return visit, problem, medical history and notes.
- Patient and account data are combined in one dense surface.
- Shared phone numbers are possible in real families; phone must not be treated as a globally unique patient identity.
- The patient profile needs a dedicated workspace view with summary, contact data, clinical notes, visits, financial ledger and receipts.
- Patient deletion/edit flows need explicit safety confirmation and clear consequences.

### E. Financial/accounting workflow

Severity: P0/P1

Current model:
- total;
- paid;
- balance;
- payment method;
- transfer/reference.

Problems:
- This is not yet a full patient financial ledger.
- Services are not consistently modeled as robust line items with service + tooth/area + quantity + unit price + amount.
- A single total/paid/balance representation makes historical partial payments and adjustments harder to reason about.
- Receipt history is not equivalent to a patient account ledger.

Target conceptual model:
Patient → Visit → Service line items → Charge → Payment → Receipt → Ledger entry

A ledger should be able to show date, operation, debit/charge, credit/payment and resulting balance.

### F. Receipt lifecycle and destructive actions

Severity: P0

Findings:
- Repository-level receipt deletion is a hard delete.
- A financial document should normally use a controlled lifecycle: issued → void/cancelled, with reason and audit information, rather than silent hard deletion.
- Existing edit/load behavior must be reviewed so editing an issued receipt cannot accidentally create duplicate receipt numbers/fingerprints or mutate historical accounting without an explicit action.
- History actions need separate semantics for View, Edit (if permitted), Duplicate, Void/Cancel and Export.

### G. Navigation / visual density

Severity: P1

Findings:
- Too many layers of navigation, pills, badges, cards, modal surfaces and floating controls are visible in the same workflow.
- Platform concepts are mixed with clinic-operational concepts.
- The floating action dock can become cluttered on mobile and can compete with long receipt/patient content.
- Several UI labels are English-heavy for a clinic whose primary users are likely Arabic-speaking.
- English should remain available as secondary terminology where useful, but primary operational labels should be Arabic and unambiguous.

### H. Typography

Severity: P1

Findings:
- CSS contains numerous very small font sizes, including approximately 8–11px values in receipt/UI styling.
- Small typography is especially harmful in Arabic RTL forms, financial figures and print layouts.
- The redesign must establish minimum readable sizes for screen and print rather than continuing local overrides.

### I. Responsive/mobile UX

Severity: P1

Findings:
- Existing mobile regression is green, but functional regression does not equal good mobile UX.
- Long forms, modal patient management, dense receipt controls and floating actions require task-oriented mobile redesign.
- Primary actions must remain reachable with one hand where practical.
- Secondary actions should move into progressive disclosure.
- Receipt entry should not require navigating a document preview that competes with the input form.

### J. Desktop UX

Severity: P1

Findings:
- Phase 7.5 already exposed a real stacking/layout defect that automated visibility checks missed; this demonstrates that rendered visual acceptance remains necessary.
- Desktop fixed navigation and overlays require explicit layout ownership.
- Wide screens should use the additional space to improve grouping and scanning, not simply stretch dense forms.

### K. Modals / overlays

Severity: P1

Findings:
- Patient management, history, sharing and preview are heavily modal-driven.
- Some of these are full workflows and should become route/workspace surfaces rather than dialogs.
- Dialogs should be reserved for focused decisions, confirmations and short tasks.

### L. Backup / sync UX

Severity: P1

Findings:
- Backup/recovery architecture is strong and should be preserved.
- Backup and sync controls are too close to everyday clinic actions and can overwhelm users.
- The UX should expose a simple safe backup action and place advanced provider/sync configuration behind settings.
- Destructive restore/import actions require clear confirmation and consequence messaging.

### M. Export/print architecture

Severity: P1

Findings:
- Existing export.js and Android bridge are valuable and must remain the authoritative export/print boundary.
- The Canvas-based receipt export is optimized for Arabic rendering and should be preserved unless a measured limitation is found.
- The current workflow should distinguish:
  - digital receipt PDF;
  - blank print-shop master;
  - PNG/share image;
  - native print.
- A rasterized image should not be treated as equivalent to a print-shop master PDF when vector/text fidelity matters.

### N. Accessibility / semantics

Severity: P1/P2

Findings:
- Existing labels and ARIA usage are present in parts of the application, but dense controls and modal workflows require a dedicated accessibility pass.
- Focus management, keyboard navigation, modal focus trapping, visible focus, error association, touch target size, contrast and RTL/BiDi need systematic verification.
- Emoji/icons must not be the only semantic indicator of an action.

### O. Code/CSS maintainability

Severity: P1

Findings:
- Styling is distributed across ui.css, receipt.css, polish.css, templates.css and other layers.
- Late overrides/patches increase the risk of contradictory presentation rules.
- The redesign should consolidate tokens and shared component rules where this can be done without creating a second UI system.
- Existing ownership must be preserved; do not introduce a parallel framework.

## Architecture constraints

Preserve:
- js/app.js as route/context state owner;
- js/product.js as Product/Tenant/Instance authority;
- js/capabilities.js as shared capability registry;
- js/repository.js + IndexedDB as durable data authority;
- js/storage.js as existing Dental business behavior owner;
- js/export.js + Android bridge as export/print/share boundary;
- backup/recovery/provider modules;
- Web/PWA/Android shared core;
- existing CI and regression entrypoints.

Do not:
- create a second router;
- create a second repository;
- create a second receipt persistence model;
- duplicate patient storage;
- introduce a new UI framework without approval;
- rewrite verified business logic merely to make UI changes.

## Priority register

### P0 — must be addressed before production UX acceptance
1. Separate blank paper voucher from digital receipt.
2. Define paper-voucher static vs handwritten vs digital-only data.
3. Rebuild receipt workflow around the real clinic use cases.
4. Replace hard-delete financial receipt semantics with controlled void/cancel behavior, subject to compatibility/migration review.
5. Separate Patient / Visit / Billing / Receipt concepts.
6. Establish a usable clinic dashboard as the daily operational home.
7. Remove information overload and improve typography/readability.

### P1 — required for a strong clinic release
1. Patient workspace redesign.
2. Service line-item model/UX.
3. Patient financial ledger.
4. Appointment workflow.
5. Mobile workflow reconstruction.
6. Desktop layout refinement.
7. Modal-to-workspace migration where appropriate.
8. Backup/sync UX simplification.
9. Unified dialogs/toasts and safer confirmations.
10. Print/PDF template separation.

### P2 — after core reconstruction
1. Reports.
2. Daily closing.
3. Outstanding-balance report.
4. Service catalogue.
5. Advanced search/tags.
6. Thermal printer optimization.
7. Accessibility hardening.
8. Additional print templates.

## Phase 8 task sequence

### Phase 8.0 — Real Clinic UX Audit
Status: COMPLETE — this document.

Exit criteria:
- current workflow defects documented;
- receipt concepts separated;
- paper-template data classification documented;
- P0/P1/P2 register established;
- architecture preservation constraints recorded.

### Phase 8.1 — Information Architecture
Status: AUTHORIZED NEXT TASK
Objective: redesign navigation/workspace hierarchy for daily clinic operations without duplicating route/state ownership.

### Phase 8.2 — Clinic Dashboard
Status: PLANNED
Objective: create the daily operational home around patients, visits, appointments, financial status and recent activity.

### Phase 8.3 — Patient Workspace
Status: PLANNED
Objective: replace the modal-heavy patient experience with a coherent patient workspace while preserving existing data ownership.

### Phase 8.4 — Visit / Services / Billing
Status: PLANNED
Objective: establish a clear visit and service-entry workflow and improve financial representation without prematurely creating duplicate persistence.

### Phase 8.5 — Receipt System Reconstruction
Status: PLANNED
Objective: separately design digital receipt issuance/export and the blank print-shop paper-voucher master.

### Phase 8.6 — History & Financial Ledger
Status: PLANNED
Objective: make historical receipts and patient financial movements auditable and understandable.

### Phase 8.7 — Mobile UX
Status: PLANNED
Objective: optimize high-frequency clinic workflows for phone use.

### Phase 8.8 — Print / PDF / Physical Voucher QA
Status: PLANNED
Objective: validate digital PDF, blank master PDF, physical handwriting usability, print margins and optional thermal/native print.

### Phase 8.9 — Full Regression
Status: PLANNED
Objective: verify all existing core, repository, backup, export, PWA, Pages and Android behavior after UX reconstruction.

### Phase 8.10 — Rendered UX Acceptance
Status: PLANNED
Objective: independently inspect actual rendered mobile/desktop/RTL/print surfaces and close visual defects before release.

## Phase 8 completion gate

Phase 8 cannot be marked complete until:
- all P0 issues are resolved or explicitly approved as deferred;
- P1 issues required by the release scope are resolved;
- digital and paper receipt concepts are demonstrably separate;
- paper voucher is validated as a handwriting-oriented print-shop master;
- functional, architecture and Product/UX gates all pass;
- rendered visual evidence exists for mobile and desktop;
- print/PDF evidence exists;
- Android and Web/PWA regression remains green;
- documentation is reconciled and the release/version decision is explicitly recorded.

## Phase 8.0 audit limitations

This task establishes a source-based and product-requirements baseline. It does not claim that every visual defect has been reproduced on every device or that a physical print test has been performed. Those require the rendered/print gates in Phases 8.8 and 8.10.

## Next authorized action

Phase 8.1 — Information Architecture.
Before changing production code, create the IA implementation boundary and trace the existing route/state owners. Do not redesign the receipt internals yet; receipt reconstruction is Phase 8.5.
