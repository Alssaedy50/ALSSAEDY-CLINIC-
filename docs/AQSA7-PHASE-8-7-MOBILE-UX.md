# AQSA7 — Phase 8.7 Mobile UX

Status: IN PROGRESS — MOBILE RECONSTRUCTION IMPLEMENTED, CI GATE PENDING
Branch: `phase-8-7-mobile-ux`
Base: `639c188d48e4e08dd98feb0652b9c82b40257941`

## Objective

Reconstruct the clinic UI for small touch screens so mobile is a first-class daily workflow rather than a scaled desktop layout.

The phase is limited to presentation/composition and responsive interaction behavior. Existing route ownership, repository/IndexedDB authority, business functions, receipt lifecycle, export/print/share boundaries and Android core remain authoritative.

## Scope

### Implemented

- Mobile-first AQSA7 shell composition at 700px and below.
- Safe, full-width clinic-local navigation with horizontal scrolling where necessary.
- Touch-first product/workspace actions with 44px minimum interactive height.
- Dashboard action/stat/card density adapted for narrow screens.
- Persistent patient workspace retained as a workspace, never reverted to a fixed modal.
- Visit/service line items converted to a compact two-column touch layout.
- Billing summary collapsed to readable single-column cards.
- Receipt issuance actions grouped into touch-sized controls without changing receipt data/business behavior.
- History search/date/filter controls and patient financial ledger adapted to narrow screens.
- Settings drawer and modal controls adapted to full-width mobile use.
- Floating action dock given safe-area-aware mobile positioning.
- Explicit mobile overflow controls to prevent horizontal page scrolling.
- Print/export physical receipt dimensions remain protected from mobile presentation rules.

### Regression coverage

Runtime Smoke now verifies at a 390px viewport:

- viewport contract;
- body/workspace/local-navigation horizontal overflow;
- dashboard mobile grid composition;
- patient workspace remains non-fixed;
- visit/service mobile composition;
- history ledger mobile composition;
- visible touch controls are not below 44px, excluding the physical receipt document itself.

## Architecture / reuse

No new router, repository, persistence store, business state machine, receipt persistence model, service catalogue, provider, dependency or platform client was introduced.

The implementation reuses existing DOM surfaces and existing responsive architecture in `css/ui.css`.

## Out of scope

- Physical printer validation — Phase 8.8.
- PDF/image physical output acceptance — Phase 8.8.
- Rendered cross-device visual acceptance — Phase 8.10.
- New appointment engine.
- New accounting persistence model.
- Accessibility-wide audit beyond the mobile touch/readability contract.
- New UI framework.

## Future Surprise Gate

- Future products continue to use the same platform/product/workspace hierarchy.
- Patient/visit/billing/receipt data ownership is unchanged.
- Web/PWA/Desktop/Android continue to share the same core.
- Mobile CSS does not alter export dimensions or print semantics.
- No Dental-only persistence or mobile-only business path was introduced.
- Further accessibility and rendered device validation remain explicitly deferred to their approved gates.

## Phase gate evidence required

1. Runtime/Browser Smoke PASS.
2. Pages Source Verification PASS.
3. Receipt Export PASS.
4. Android/Build PASS.
5. No unresolved required CI failure.
6. PR merged to `main`.
7. Build Plan updated to mark 8.7 COMPLETE and authorize 8.8 only after all gates pass.

## Current gate

**IN PROGRESS — implementation committed; required CI verification and merge are still pending.**
