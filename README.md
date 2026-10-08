# ALSSAEDY CLINIC — Receipt Voucher

Production dental clinic receipt system within the AQSA7 umbrella.

## Current release

- **Version:** v1.3.0
- **Android:** versionCode 18, signed production APK
- **Primary size:** A5 Portrait (148 × 210 mm)
- **Other sizes:** A4 and 80mm thermal
- **Orientation:** Portrait for A5/A4; optimized thermal layout for 80mm
- **Typography:** RTL Arabic primary + LTR English identity
- **Official logo:** `assets/Saedy_Dental_Logo.svg`

## Core architecture

- **Local-first:** IndexedDB is the authoritative durable application store.
- **Backup:** encrypted local JSON backup is supported; cloud recovery is optional.
- **Cloud provider boundary:** Google Drive is implemented behind the generic Backup Provider Adapter contract. Live production Google OAuth upload/download/restore is not claimed without authorized production credentials.
- **Synchronization:** the existing keyed sync path (`js/sync.js` + `api/clinic-sync.js`) is optional/transitional and is not the authoritative local data store.
- **Print:** native browser/WebView print engine with A5, A4 and 80mm profiles.
- **Image export:** bundled local `html2canvas`.
- **PWA/offline:** service worker caches the production app shell.
- **Android:** shared Web/PWA core with a native WebView bridge.

## Release verification

v1.3.0 passed the final main-branch release gate, including Runtime Smoke, Android APK, GitHub Pages source/deployment verification and receipt export.

Known release limitations:
- Live Google production OAuth upload/download/restore requires an authorized production OAuth client/account and is not covered by CI.
- Live-device Android interaction requires a connected/emulated Android runtime and is not claimed by the automated release gate.
