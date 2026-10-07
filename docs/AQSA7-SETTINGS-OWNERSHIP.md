# AQSA7 — Settings Ownership Contract

Status: ACTIVE
Last updated: 2026-10-08

## Purpose

Define exactly which storage layer owns each class of setting. No module may create a second persistence source for a setting owned elsewhere.

## Ownership

### Durable clinic configuration — IndexedDB `settings`
Authoritative keys:
- `customLogo` — receipt/clinic logo
- `currency` — clinic currency default
- `receiptSize` — clinic receipt format default
- `receiptTexts` — clinic-editable receipt text/content

Access:
- Read: `clinicRepositoryGetSettingSync()` / `clinicRepositoryGetSettingsSync()`
- Write: `clinicRepositoryPutSetting()` / `clinicRepositoryPutSettings()`

### UI preferences — localStorage
These are device/user presentation preferences and are not clinic records:
- theme
- watermark visibility
- font family
- global/font/body/heading/title scales
- logo display scale
- receipt accent color
- receipt font weight
- night mode
- draft recovery state

### Sync configuration / metadata — localStorage
These belong to the sync client, not clinic business data:
- sync key
- sync URL
- auto-sync toggle
- sync client ID
- last sync timestamp

### Clinical records — IndexedDB
- `receipts`
- `patients`

## Migration rule

Older releases stored some clinic settings in localStorage:
- `alssaedy_currency`
- `alssaedy_receipt_size`
- `alssaedy_texts`
- `alssaedy_custom_logo`

On repository hydration, missing durable settings are migrated once into IndexedDB. Durable values win if both stores contain a value. Successful migration removes the old localStorage mirror.

## Backup / restore contract

Full backups now separate:
- `settings.clinic` — durable clinic configuration
- `settings.ui` — UI preferences

The importer remains backward-compatible with the previous flat settings shape.

Cloud sync uses the same split and restores clinic settings through the repository API. Sync configuration itself is never included in clinic snapshots.

## Invariants

1. No active code writes clinic configuration directly to localStorage.
2. localStorage is not a second database for receipts/patients.
3. Sync never writes durable clinic settings directly to localStorage.
4. Backup/restore must preserve clinic configuration without importing sync credentials.
5. New clinic settings must be registered here before implementation.
