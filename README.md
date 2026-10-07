## v1.2.0

Quality, print/PDF, logo, and navigation fixes.

# ALSSAEDY CLINIC — Receipt Voucher

Professional dental clinic receipt system for daily use, electronic filling, printing, image export, PDF export, and sharing.

- **Primary size:** A5 Portrait (148 × 210 mm)
- **Other sizes:** A4 and 80mm thermal
- **Orientation:** Portrait (A5/A4) and optimized 80mm thermal
- **Typography:** RTL Arabic primary + LTR English identity
- **Logo & background:** replaceable locally with no application-imposed file-size limit
- **Local persistence:** receipt settings in localStorage; uploaded logo/background in IndexedDB
- **Synchronization:** intentionally disabled for the current version; central synchronization will be added later
- **Print:** browser print engine with exact A5 (148×210mm), A4 (210×297mm), and 80mm thermal profiles
- **Export:** PNG, one-click PDF (jsPDF), and system file sharing when supported; PDF follows the selected document size
- **Official logo:** assets/Saedy_Dental_Logo.svg

## v1.1.0 highlights

- **One-click PDF**: dialog-free, correctly sized A5/A4/80mm PDF via bundled jsPDF
  (`vendor/jspdf/`), with native print as a fallback.
- **Real print preview**: `👁️ معاينة` renders the exact sheet before printing.
- **Robust dates**: `parseAnyDate()` accepts ISO, `DD/MM/YYYY`, `D-M-Y` and
  Arabic-Indic digits; printed/exported dates now render correctly.
- **History upgrades**: search/filter plus a live totals dashboard (count, totals,
  paid, outstanding).
- **PWA / offline**: installable with a service worker caching the full app shell.
- **Night mode**, toast notifications, keyboard shortcuts (`Ctrl+S/P/E/K`), and
  automatic draft recovery.
- **Android**: fixed export (`vendor/**` now packaged), exact-alarm scheduling with
  graceful fallback, safer notification icon, and a native PDF save bridge.
- See `AGENTS.md` for architecture and `docs/DESIGN-CONTRACT.md` for protected rules.

