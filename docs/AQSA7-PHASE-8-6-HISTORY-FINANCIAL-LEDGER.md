# AQSA7 — Phase 8.6 History & Financial Ledger

Status: COMPLETE — merged and fully regression-verified
Date: 2026-10-09

## Objective

Turn the existing receipt history into a clinic-usable patient/transaction history and financial ledger without creating a second financial persistence model.

## Implementation

- Reused the existing receipt repository and activeReceiptHistory() lifecycle projection.
- Extended the existing history surface with patient-level financial summaries, active receipt count, unique patient count, total billed, total collected, total outstanding, voided receipt count, date-range filtering, and existing search/status filtering.
- Added a patient financial ledger grouped by patientId, then phone/name fallback for legacy records.
- Patient ledger shows visits/receipts, billed amount, paid amount, outstanding balance and latest activity.
- Voided receipts remain available in transaction history but are excluded from active financial totals.
- Removed the user-facing destructive clear-entire-history path so financial records are not silently hard-deleted.
- Existing receipt open/edit/void, repository and export boundaries remain authoritative.
- No new IndexedDB store, repository, router or ledger persistence path was introduced.

## Reuse Registry / Traceability

| Element | Owner | Decision | Verification |
|---|---|---|---|
| Transaction history | js/storage.js | Adapt existing renderHistory() | Runtime Smoke |
| Financial summary | js/storage.js + aqsa7BillingContract | Reuse/adapt | Runtime Smoke |
| Patient ledger | js/storage.js | Add projection from existing receipts | Runtime Smoke |
| Durable data | js/repository.js + IndexedDB | Reuse unchanged | Existing repository tests |
| Receipt lifecycle | js/capabilities.js | Reuse | Phase 8.5 regression |
| History UI | index.html + css/ui.css | Adapt existing surface | Browser Smoke |
| CSV/JSON export | existing storage.js export boundary | Reuse unchanged | Receipt/export regression |

## Financial semantics

The active financial ledger is based only on issued receipts.

For each patient:

Outstanding = active billed total − active paid total

Voided receipts are retained for historical reference but do not contribute to active patient balances or clinic financial totals.

The ledger is a read projection of existing receipt records. It does not introduce a second source of truth.

## Out of scope

- Full accounting/general-ledger accounting.
- Expense accounting.
- Payment-provider integration.
- Appointment engine.
- New patient/receipt persistence stores.
- Mobile reconstruction (8.7).
- Physical print QA (8.8).
- Full regression (8.9).
- Rendered UX acceptance (8.10).

## Gates

Required: Runtime Smoke, Browser Smoke, Pages Source Verification, Receipt Export, Android/Build.

Separate acceptance: Functional Gate, Architecture Gate, Product/UX Gate.

Current gate: COMPLETE — required GitHub gates passed.

Completion evidence:
- PR #63 merged to main.
- Verified head: 37d10de1676cd3e99710af0aa9a95c4687ea5896.
- Merge commit: b90ebc4333e21d51e260ad92d1262ca149336ed2.
- Browser Smoke: PASS.
- Pages Source Verification: PASS.
- Receipt Export: PASS.
- Android/Build: PASS.
- Workers deployment check: external rate-limit failure; non-blocking.