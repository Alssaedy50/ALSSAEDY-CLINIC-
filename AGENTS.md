# AGENTS.md — AQSA7 repository guide

## What this is
AQSA7 is a reusable, local-first multi-product platform. The first configured product is **ALSSAEDY CLINIC / Dental Clinic**.

The user-visible hierarchy is:

**AQSA7 Platform → Products / Projects → Dental Clinic → ALSSAEDY CLINIC workspace**

The platform shell is not a second application. Existing Dental business behavior, persistence, backup/recovery, export/print/share and Android bridge remain authoritative.

## Entry and runtime layers

- Entry: `index.html`
- Platform/context/navigation owner: `js/app.js`
- Product/Tenant/Instance authority: `js/product.js`
- Shared capability registry: `js/capabilities.js`
- Integration and AI contracts: `js/integrations.js`, `js/ai.js`
- Durable data authority: `js/repository.js`, IndexedDB
- Dental business behavior: `js/storage.js`
- Backup/recovery: `js/backup.js`, `js/backup-provider.js`, `js/backup-provider-runtime.js`, `js/cloud-recovery.js`, `js/restore-migration.js`, `js/google-drive-auth.js`, `js/google-drive-provider.js`
- Backup UX/reliability: `js/backup-ux.js`, `js/backup-scheduling.js`
- Export/print/share: `js/export.js`, `android-app-bridge.js`
- Templates/UI: `js/templates.js`, `js/ui.js`
- Optional/transitional sync: `js/sync.js`, `api/clinic-sync.js`
- Presentation: `css/ui.css`, `css/receipt.css`, `css/print.css`, `css/templates.css`, `css/polish.css`
- PWA: `manifest.webmanifest`, `sw.js`
- Android wrapper: `android-app/`
- Verification: `tests/` and `.github/workflows/`
- Authoritative project ledger: `docs/AQSA7-BUILD-PLAN.md`

Script load order in `index.html` is contract-sensitive. Do not reorder modules casually.

## Commands

- Serve locally: `python3 -m http.server 8080` from repo root
- Receipt regression: install Playwright/pngjs/poppler-utils as required by the workflow, then run the existing receipt-export test.
- Android build: use `.github/workflows/android-apk.yml`; production signing is CI-secret based.

## Architecture rules

1. **Reuse first:** Existing implementation wins. Reuse → adapt → refactor → replace → create new.
2. **One route/context owner:** `js/app.js`.
3. **One Product/Tenant/Instance authority:** `js/product.js`.
4. **One durable data authority:** `js/repository.js` + IndexedDB.
5. **One Dental business owner:** `js/storage.js` for receipt/patient/history/settings behavior.
6. **One export/print/share boundary:** `js/export.js` + existing Android bridge.
7. Do not create a duplicate repository, router, state machine, product registry, persistence store, provider path or business implementation.
8. Platform UI may compose existing capabilities, but must not move domain logic into the presentation layer.
9. Android remains a thin wrapper around the shared Web/PWA core.
10. Any material architecture change must be reflected in `docs/AQSA7-BUILD-PLAN.md` and verified.

## Dental contracts / gotchas

- **Size profiles:** A5 (148×210mm), A4, thermal (80mm/auto height). Preserve the existing profile behavior.
- **Dates:** use the authoritative `parseAnyDate()` path; do not add ad-hoc date parsing.
- **Blank templates:** remain fully empty and must never be saved to history.
- **Exports:** `materializeReceiptControls()` and `materializeReceiptDate()` support image/PDF export in WebView.
- **PDF:** `buildReceiptPdfBlob()` renders the full sheet and uses the configured size profile.
- **Storage:** IndexedDB is authoritative; any synchronous projection is not a second database.
- **Currency:** receipt currency remains part of stored receipt data.
- **Night mode:** receipt paper remains white.
- **Service worker:** keep cache-busting URLs synchronized between `index.html` and `sw.js`; never cache `/api/*`.
- **Android assets:** `prepareWebAssets` must include `vendor/**` or offline html2canvas/jsPDF exports can break.

## Release discipline

- Never publish an unverified build.
- v1.3.0 is historical; v1.4.0 is the current Platform-first release target.
- Release versionCode/versionName, workflow artifact names, checksum names and release notes must remain aligned.
- Keep production signing material in GitHub Secrets; never commit the keystore or credentials.
- Live Google OAuth and live-device interaction remain explicit release-gate limitations unless separately authorized and available.
