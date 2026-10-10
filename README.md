# AQSA7 — Multi-Product Platform

AQSA7 is a reusable, local-first multi-product platform. The first configured product is **ALSSAEDY CLINIC / Dental Clinic**, presented inside the AQSA7 platform shell rather than defining the platform itself.

## Current release

- **Version:** v1.4.1
- **Android:** versionCode 20, signed production APK (built by GitHub Actions)
- **Release page:** https://github.com/Alssaedy50/AQSA7/releases/tag/v1.4.1
- **APK download:** https://github.com/Alssaedy50/AQSA7/releases/download/v1.4.1/app-release.apk
- **Platform hierarchy:** AQSA7 Platform → Products / Projects → Dental Clinic → ALSSAEDY CLINIC workspace
- **Receipt profiles:** A5 Portrait (148 × 210 mm), A4 and 80mm thermal
- **Typography:** RTL Arabic primary + LTR English identity
- **Official logo:** `assets/Saedy_Dental_Logo.svg`

## Architecture

- **Platform shell:** `index.html` + `css/*` provide the user-visible Platform / Products / Dental Workspace composition.
- **Route/context owner:** `js/app.js` is the single navigation and context state owner.
- **Product authority:** `js/product.js` is the single Product/Tenant/Instance authority.
- **Shared capabilities:** `js/capabilities.js` is the shared capability registry.
- **Durable data:** `js/repository.js` + IndexedDB are the single durable application data authority.
- **Dental business behavior:** `js/storage.js` owns receipt, patient, history and settings behavior.
- **Export/print/share:** `js/export.js` and the existing Android bridge remain the authoritative boundary.
- **Backup/recovery/security:** existing backup, migration, provider, Google Drive and cloud-recovery modules remain authoritative; no parallel persistence or provider path is used.
- **Local-first + cloud sync:** IndexedDB remains the durable local authority. The current source implements bidirectional snapshot merging by stable record ID, `updatedAt`, per-setting timestamps, and scoped deletion tombstones; conflicts returned by the endpoint are merged and retried. Live two-device production acceptance is still required. Vercel Blob does not provide atomic compare-and-swap for this read/merge/write flow, so a strict no-lost-update guarantee for writes arriving at exactly the same time is not claimed.
- **Cross-platform:** Web/PWA/Desktop browser and Android share the same application core; Android remains a thin WebView wrapper.
- **PWA/offline:** the service worker caches the production app shell.

## Product model

The current configured product is:

**AQSA7 Platform → Products / Projects → Dental Clinic → ALSSAEDY CLINIC**

The platform is intentionally structured so additional products can be added through the existing product/capability contracts without cloning the application or creating a second repository/state system.

## Verification and release

The current published Android release is **v1.4.1** (Android versionCode 20). Runtime Smoke, Android production build/signature, Pages source/build, and receipt-export gates passed on the documented release/current maintenance baseline; every subsequent change must pass the applicable gates before merge. The historical **v1.3.0** and **v1.4.0** artifacts remain unchanged as historical releases.

External deployment limitations: Vercel and Cloudflare deployment checks were not green at the last documented verification; do not describe those external deployments as verified until their build/deployment status is checked separately. Physical Android-device installation, printer/share behavior, and production Google OAuth flows are not proven by CI.

Known release limitations:
- Live Google production OAuth upload/download/restore requires an authorized production OAuth client/account and is not covered by CI.
- Live-device Android back/share/print interaction requires a connected/emulated Android runtime and is not claimed by the automated gate.
