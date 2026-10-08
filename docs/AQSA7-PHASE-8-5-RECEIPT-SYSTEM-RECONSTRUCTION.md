# AQSA7 — Phase 8.5 Receipt System Reconstruction

Status: COMPLETE — merged and fully regression-verified
Date: 2026-10-09

## Objective

Reconstruct the receipt workflow around the completed:

**Patient → Visit → Services → Billing → Digital Receipt**

while preserving the existing receipt repository, IndexedDB authority, export/print/share boundaries and the separate blank paper-voucher workflow.

## Scope

### Digital receipt
- Clear issuance state versus saved receipt state.
- Preserve receipt numbering when editing an existing receipt.
- Update an existing issued receipt instead of creating a duplicate.
- Replace direct receipt deletion with controlled void/cancel semantics.
- Preserve voided receipts in the durable history with:
  - `status: "voided"`
  - `voidedAt`
  - `voidReason`
- Exclude voided receipts from active financial/patient totals while retaining them for historical reference.
- Keep preview, native print/PDF and sharing on the existing `js/export.js` boundary.
- Include service-line details and void state in text-based receipt sharing.

### Blank paper voucher
- Make the distinction explicit: the paper template is a high-resolution print-shop master for pre-printed receipt books and manual handwriting.
- Do not auto-populate transaction date or patient/payment data in the blank-template workflow.
- Keep the paper template separate from the digital transaction record.

## Reuse / ownership decisions

| Element | Existing owner | Decision |
|---|---|---|
| Route/context | `js/app.js` | Reuse |
| Receipt lifecycle contract | `js/capabilities.js` | Extend existing shared receipts capability |
| Dental receipt behavior | `js/storage.js` | Extend |
| Durable receipt storage | `js/repository.js` + IndexedDB | Reuse unchanged |
| Billing calculations | `js/capabilities.js` → `aqsa7BillingContract` | Reuse unchanged |
| Digital preview/print/share | `js/export.js` + Android bridge | Reuse existing boundary |
| Blank paper master | `js/templates.js` + existing receipt DOM/CSS | Reuse; clarify separation |
| UI | `index.html` + `css/ui.css` | Adapt existing surfaces |
| Regression | Runtime Smoke | Extend |

## Receipt lifecycle contract

The shared receipts capability now defines two durable states:

- `issued`
- `voided`

Allowed transition:

**issued → voided**

A void requires a reason and retains the original receipt number and record. A voided receipt cannot be silently reactivated or edited.

This preserves an auditable historical record instead of deleting a financial document. The design follows the project's existing receipt-capability ownership and common financial-control practice of retaining cancelled/reversed records with reason and timestamp.

## Editing contract

Opening a saved issued receipt loads the same durable record into the existing receipt workspace.

Saving after an edit:
- preserves the original receipt ID;
- preserves the original receipt number;
- updates the same repository record;
- updates the corresponding patient visit entry;
- does not create a second receipt.

Opening a voided receipt is read-only.

## Financial semantics

Active financial views use only issued receipts.

Voided receipts remain visible in history and exports but do not contribute to:
- active patient receivables;
- active patient financial summaries;
- active receipt counts/totals.

The full financial ledger remains Phase 8.6.

## Verification contract

Required gates:
- Runtime Smoke;
- Pages Source Verification;
- Receipt Export;
- Android APK.

Additional Phase 8.5 Runtime Smoke coverage:
- lifecycle contract presence;
- issuance status UI;
- controlled edit/update semantics;
- same-ID/same-number persistence;
- void/cancel with mandatory reason;
- voided receipt retained but excluded from active financial history;
- blank paper template has no transaction-date editor/data-entry path.

Out of scope:
- full financial ledger (8.6);
- physical print-shop production QA (8.8);
- rendered cross-device UX acceptance (8.10);
- appointment engine;
- service catalogue;
- payment providers;
- new IndexedDB stores;
- new router/state manager.

## Gate decision

**COMPLETE — REQUIRED CI GATES PASSED.**

### Completion evidence
- PR #62 merged to `main`.
- Verified PR head: `7a7295f96a5d654480a01e656db7fa20f2d861ab`.
- Merge commit: `915a03ab2f8a619aea8fbc2487580a56c5f7b491`.
- Runtime Smoke: PASS.
- Browser Smoke: PASS.
- Pages Source Verification: PASS.
- Receipt Export: PASS.
- Android/Build: PASS.
- Cloudflare Workers build check: external deployment-rate-limit failure; non-blocking for the required AQSA7 gates.


Completion evidence will be recorded here and in `docs/AQSA7-BUILD-PLAN.md` only after all required CI gates are green and the PR is merged.
