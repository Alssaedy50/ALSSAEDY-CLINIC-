# AGENTS.md — ALSSAEDY CLINIC repository guide

## What this is
RTL Arabic dental-clinic receipt voucher tool. Static single-page app (no framework,
no build step) served directly from the repository root.

- Entry: `index.html`
- Scripts (load order matters): `js/tafqeet.js`, `js/storage.js`, `js/export.js`,
  `js/templates.js`, `js/app.js`, `js/ui.js`, `android-app-bridge.js`
- Styles: `css/ui.css`, `css/receipt.css`, `css/print.css`, `css/templates.css`, `css/polish.css`
- Vendored libs: `vendor/html2canvas/`, `vendor/jspdf/`
- PWA: `manifest.webmanifest`, `sw.js`
- Android wrapper: `android-app/` (WebView + Gradle), bridge in `android-app-bridge.js`
- Deploy: Cloudflare/Vercel (`worker.js`, `wrangler.jsonc`, `api/`)

## Commands
- Serve locally: `python3 -m http.server 8080` from repo root
- Regression test: install `playwright pngjs` and `poppler-utils`, then
  `python3 -m http.server 4173 & node tests/receipt-export-test.mjs`
- Android build (CI): see `.github/workflows/android-apk.yml`

## Architecture notes
- **Size profiles** (`SIZE_PROFILES` in `js/app.js`): `a5` (148×210mm, default),
  `a4`, `thermal` (80mm, auto height). Print uses `@page` injected by
  `injectPrintPageStyle()`; PNG/PDF use `generateReceiptCanvas()`.
- **Date handling**: always parse via `parseAnyDate()` (`js/app.js`). It accepts
  ISO, `DD/MM/YYYY`, `D-M-Y`, and Arabic-Indic digits and returns `{y,m,d}`.
  Do not add ad-hoc regex date parsing elsewhere.
- **Blank print templates** (`prepareBlankTemplate`/`finishBlankTemplate`) must stay
  fully empty: no receipt number, date, patient, or amounts. They must never be saved
  to history.
- **Exports**: `materializeReceiptControls()` converts live `<input>` values to text
  in the html2canvas clone so the exported image contains data (a WebView quirk).
  `materializeReceiptDate()` mirrors the formatted date into `#printDateValue`.
- **PDF**: `buildReceiptPdfBlob()` renders the full sheet and embeds it in a correctly
  sized jsPDF page (single-click, dialog-free). Falls back to native print.
- **Storage**: IndexedDB (`ALSSAEDY_CLINIC_DB`) is the durable store, mirrored to
  `localStorage` for synchronous reads. `safeHistory()` is the read path.
- **Currency**: stored per receipt; `tafqeetRial()` takes the currency name so
  amount-in-words follows the selected currency.

## Protected contract
See `docs/DESIGN-CONTRACT.md`. Clinic identity, address, phones, size profiles, and
the financial/signature grid must be preserved unless a documented regression requires
a change. Test print + export after any layout change.

## Gotchas
- `[data-mode="manual"]` hides `.digital-only`; `body.blank-template-export` forces the
  blank template state and must always be cleared in a `finally` block.
- Night mode uses `html[data-night="on"]`; the receipt paper always stays white.
- The Android `prepareWebAssets` Gradle task must include `vendor/**` or offline
  html2canvas/jsPDF exports break inside the app.

## Cloud sync (v1.1.0)
- Client: `js/sync.js`. Keyed snapshots (a "clinic key" shared across devices),
  optimistic concurrency via `baseVersion`, duplicate-free merge of receipts and
  patients, optional auto-upload after each save.
- Same-origin endpoint: `/api/clinic-sync`.
  - Hosted (Vercel): `api/clinic-sync.js` (Vercel Blob, `BLOB_READ_WRITE_TOKEN`).
  - Self-hosted: `scripts/serve.py` (dependency-free static server + sync API,
    snapshots in git-ignored `output/sync/`).
- The service worker must never cache `/api/*` — stale `found:false` responses
  previously broke restore.

## Deployments
- GitHub Pages: `https://alssaedy50.github.io/ALSSAEDY-CLINIC-/` (from `main`).
- Vercel: `https://alssaedy-clinic.vercel.app` (from `main`; `/api/clinic-sync`).
- Cloudflare Worker: `https://alssaedy-clinic.alssaedy500.workers.dev`
  (`worker.js` static assets only; deploy with `npx wrangler deploy`).
  The `migrations` entry in `wrangler.jsonc` deletes the orphaned `ThemeStore`
  Durable Object — do not remove it or deploys fail with error 10064.
- Cache-busting: every CSS/JS reference uses `?v=<version>`; keep `sw.js`
  `APP_SHELL` URLs in sync with the versioned URLs in `index.html`.
