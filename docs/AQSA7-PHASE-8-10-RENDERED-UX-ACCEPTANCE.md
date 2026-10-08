# AQSA7 — Phase 8.10 Rendered UX Acceptance

Status: IN PROGRESS — initial screenshot review found a mobile action-dock clipping defect; CSS correction and final evidence rerun pending
Date: 2026-10-09
Branch: `phase-8-10-rendered-ux-acceptance`
Base `main`: `d3b5b524f6b5ce7cf2bd1a47b3c78a3e381d3cd1`

## Verified predecessor

Phase 8.9 is COMPLETE. PR #66 is merged at `fbb1afad7b0b80a72bc39f662916236b9c4368fd`. The Phase 8.9 record names the final required passing gates: Runtime Smoke #373, Receipt Export #532, Pages Source Verification #227 and Android Build #610. Current `main` was independently re-checked at `d3b5b524f6b5ce7cf2bd1a47b3c78a3e381d3cd1`.

## Objective and scope

Inspect actual rendered screens and interaction outcomes at:
- Mobile: 390×844
- Desktop: 1440×1000

Surfaces to capture on both viewports:
1. AQSA7 Platform Home
2. Products / Projects
3. Dental clinic dashboard/workspace
4. Patient Workspace
5. Visit / Services / Billing
6. Receipt Issuance
7. History / Financial Ledger
8. Settings

## Implementation

- Reuse the existing `.github/workflows/runtime-smoke.yml` and installed Playwright runner.
- Add a dedicated evidence-capture step and upload the current-run PNGs plus JSON viewport/overflow/surface measurements as `aqsa7-phase-8-10-rendered-ux`.
- Keep evidence capture isolated from application data and do not create synthetic production records.
- Initial screenshots from run #37857343189 were inspected. On mobile, the persistent action dock was visibly clipped at the left edge and covered the last visible content row.
- A narrowly scoped correction was applied in `css/ui.css`: on screens ≤700px the dock uses five equal columns, stays within 8px horizontal insets, and the page canvas reserves bottom space. Existing desktop behavior is retained.
- Runtime Smoke now records dock geometry and asserts all five dock buttons remain inside the viewport. This is a screenshot-grounded presentation fix only; business logic, persistence and architecture are unchanged.

## Evidence acceptance

Required artifact: `aqsa7-phase-8-10-rendered-ux`

Initial reviewed artifact (pre-fix): `aqsa7-phase-8-10-rendered-ux` from run [#37857353829](https://github.com/Alssaedy50/AQSA7/actions/runs/37857353829). The initial capture step stopped at Settings because history navigation changed the active visual context; the existing `setPlatformVisual('dental')` recovery was added before the Settings capture. The resulting complete artifact from run #37857543189 contains 16 screenshots and the JSON report. That pre-fix set confirmed the dock clipping; it is diagnostic evidence, not the final acceptance set.

The current PR head adds an explicit dock geometry assertion and must produce a new 16-image artifact after the correction.
Expected evidence:
- 16 PNG screenshots, 8 surfaces × 2 viewports.
- `rendered-ux-report.json` with viewport size, visibility, dimensions, overflow and visible action counts.
- Current-run CI link and exact tested commit recorded after checks complete.

Screenshots must be visually inspected after the workflow completes. DOM/viewport assertions are useful measurements but are not a substitute for visual review.

## Gate decisions

- Functional Gate: pending final current-run CI.
- Architecture Gate: no route, repository, data authority, business behavior or export boundary changes; one presentation-only mobile CSS correction plus tests/docs. Final gate pending CI.
- Product/UX Gate: initial screenshot inspection identified and corrected the dock clipping; final post-fix screenshot review pending.
- Physical paper stock, binding, ink and real printer scaling are outside this phase and remain manual print-shop proof.

## Exit criteria

1. All 16 current-run screenshots are produced and visually reviewed.
2. All eight surfaces are covered at mobile and desktop.
3. No blocking rendered UX defects remain, or specific unresolved defects are documented as blockers.
4. Required Runtime Smoke, Pages Source Verification, Receipt Export and Android Build pass on final PR head.
5. PR is merged only after required gates pass; final `main` and Build Plan are re-verified.
6. Phase 8.11 or another next phase is not authorized unless the authoritative Build Plan explicitly defines it; do not invent the next step.

## Current decision

Phase 8.10 is **IN PROGRESS**. No rendered acceptance or completion is claimed before screenshots have been generated, reviewed and required gates verified.
