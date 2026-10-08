# AQSA7 — Multi-Product Platform

AQSA7 is a reusable, local-first multi-product platform. The first configured product is **ALSSAEDY CLINIC / Dental Clinic**, presented inside the AQSA7 platform shell rather than defining the platform itself.

## Current release

- **Version:** v1.4.0
- **Android:** versionCode 19, signed production APK
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
- **Local-first:** IndexedDB remains authoritative; cloud backup is optional disaster recovery.
- **Cross-platform:** Web/PWA/Desktop browser and Android share the same application core; Android remains a thin WebView wrapper.
- **PWA/offline:** the service worker caches the production app shell.

## Product model

The current configured product is:

**AQSA7 Platform → Products / Projects → Dental Clinic → ALSSAEDY CLINIC**

The platform is intentionally structured so additional products can be added through the existing product/capability contracts without cloning the application or creating a second repository/state system.

## Verification and release

The v1.4.0 release candidate must pass the existing Runtime Smoke, Android production build/signature, Pages source, and receipt-export gates before publication. The historical **v1.3.0** release remains unchanged as the prior released artifact.

Known release limitations:
- Live Google production OAuth upload/download/restore requires an authorized production OAuth client/account and is not covered by CI.
- Live-device Android back/share/print interaction requires a connected/emulated Android runtime and is not claimed by the automated gate.
