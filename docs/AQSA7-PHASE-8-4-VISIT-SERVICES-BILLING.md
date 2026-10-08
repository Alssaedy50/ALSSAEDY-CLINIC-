# AQSA7 — Phase 8.4 Visit / Services / Billing

Status: IN PROGRESS — implementation on branch `phase-8-4-visit-services-billing`
Date: 2026-10-08

## Objective

Reconstruct the daily clinic transaction workflow around:

**Patient → Visit → Services → Billing summary → existing Digital Receipt**

without creating a second repository, visit database, receipt store, router or financial ledger.

Phase 8.4 is deliberately limited to the visit/service/billing workflow. Receipt lifecycle reconstruction belongs to Phase 8.5 and the full ledger belongs to Phase 8.6.

## Reuse / ownership decisions

| Element | Existing owner | Decision |
|---|---|---|
| Route/context | `js/app.js` | Reuse |
| Dental business behavior | `js/storage.js` | Extend |
| Durable data | `js/repository.js` + IndexedDB | Reuse unchanged |
| Billing calculations | `js/capabilities.js` → `aqsa7BillingContract` | Reuse |
| Receipt record | Existing receipt object | Extend with `visitId` + `serviceItems` |
| Patient visit history | Existing `patient.visits[]` | Extend existing derived history |
| Receipt export/print | `js/export.js` + Android bridge | No change |
| UI surface | Existing receipt workspace | Add clinic-local visit/service/billing panel |
| Tests | Existing Runtime Smoke workflow | Extend |

## Data contract

No new IndexedDB store is introduced.

A saved digital receipt may now contain:

- `visitId`: stable identifier for the visit represented by the receipt;
- `serviceItems[]`: line items containing service name, quantity, unit price and optional tooth/notes fields.

The existing receipt fields remain authoritative for final transaction totals:

- `total`
- `paid`
- `balance`
- `change`
- `services`

The line-item subtotal drives `total` when service lines exist. Existing receipts without line items remain valid.

## UI contract

The new non-printing **Visit / Services / Billing** panel provides:

1. patient context;
2. service line items;
3. quantity;
4. unit price;
5. calculated line total;
6. automatic visit subtotal;
7. current payment;
8. remaining balance;
9. add/remove/reset actions.

It is intentionally outside the printable receipt surface. The existing receipt remains the document/export representation.

## Explicitly out of scope

- receipt lifecycle redesign / void-cancel semantics;
- full financial ledger;
- appointment engine;
- service catalogue persistence;
- tax engine;
- payment-provider integration;
- new IndexedDB stores;
- new router or state manager;
- physical print QA;
- rendered cross-device acceptance.

## Verification required before completion

- Visit/services/billing surface is present and traceable.
- Line-item calculations are correct.
- Existing billing contract remains the calculation authority.
- Receipt persistence includes `visitId` and `serviceItems`.
- Patient history continues to derive from existing receipt data.
- Runtime Smoke passes.
- Pages Source Verification passes.
- Receipt Export passes.
- Android APK passes.
- No duplicate persistence path is introduced.
