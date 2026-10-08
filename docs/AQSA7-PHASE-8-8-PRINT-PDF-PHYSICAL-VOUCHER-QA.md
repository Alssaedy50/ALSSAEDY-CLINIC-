# AQSA7 — Phase 8.8 Print / PDF / Physical Voucher QA

Status: IN PROGRESS — QA IMPLEMENTED, CI GATE PENDING
Branch: `phase-8-8-print-pdf-physical-voucher-qa`
Base: `1886b02eda12a412525f5270f80ae763ca2e0137`

## Objective

Formally verify the three distinct output paths:

1. **Digital Receipt** — a real saved clinic transaction that can be previewed, exported, shared and printed.
2. **PDF / Image Output** — a representation of the digital receipt using the existing export boundary.
3. **Blank Printed Voucher** — a print-shop master for pre-printed physical receipt books, filled by hand and never saved as a transaction.

The phase must verify physical sheet geometry, Arabic/RTL integrity, blank-template data isolation, and preservation of existing print/export boundaries.

## Verified design contract

### A5 is the primary physical notebook master

- A5: 148 × 210 mm, portrait.
- The blank voucher is intended for a print shop and manual handwriting.
- Binding-side margin is larger in the blank A5 contract.
- Receipt number, patient data, payment data and transaction date are not leaked into the blank master.
- The blank template does not create or persist a receipt.

### Digital receipt

- Existing receipt lifecycle remains authoritative.
- Saved receipt data continues through repository/IndexedDB.
- Print, preview, image export, share and Android bridge remain the existing boundaries.
- The physical receipt document remains independent from responsive/mobile composition.

### PDF / image

- Existing Canvas export remains authoritative for image/preview output.
- Arabic text uses the existing font/materialization protections.
- Export size continues to derive from the shared `SIZE_PROFILES`.
- No second export pipeline was introduced.

## QA implemented

Runtime Smoke now verifies:

- A5 physical profile: 148 × 210 mm.
- A5 portrait PDF dimensions.
- A5 rendered sheet aspect ratio.
- print CSS sheet geometry and zero page margin.
- blank-template mode and export-only state.
- absence of receipt number, patient, phone, paid amount, total and transaction date in blank mode.
- restoration of the original digital receipt state after blank-template preparation.
- existing RTL/BiDi assertions remain active.
- Existing A5/A4/80mm size switching remains covered.
- Existing print/preview/share/CSV/JSON regression remains covered.

## Architecture constraints

No new router, repository, IndexedDB store, financial persistence path, receipt model, print provider, UI framework or mobile-only business path was introduced.

The implementation reuses:

- `js/app.js` size/mode authority;
- `js/export.js` export/print/template boundary;
- `css/receipt.css` receipt geometry;
- `css/print.css` print geometry;
- existing Android bridge;
- existing Runtime Smoke and Receipt Export suites.

## Physical-print limitation

This phase can prove the application-side print contract and generated geometry. It cannot physically inspect ink, paper stock, binding, printer calibration, toner/ink density or a print-shop's actual output inside CI. Those remain manual physical checks and are documented separately from browser acceptance.

## Gate

Required before completion:

1. Runtime/Browser Smoke PASS.
2. Pages Source Verification PASS.
3. Receipt Export PASS.
4. Android/Build PASS.
5. No unresolved required CI failure.
6. PR merged to `main`.
7. Build Plan updated to mark 8.8 COMPLETE and authorize 8.9.

**Current state: implementation committed; CI verification pending.**
