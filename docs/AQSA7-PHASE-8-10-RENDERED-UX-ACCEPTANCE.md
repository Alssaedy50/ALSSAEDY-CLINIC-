# AQSA7 — Phase 8.10 Rendered UX Acceptance

Status: IN PROGRESS — final screenshot review complete; final documentation-head CI and merge reconciliation pending
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

## Visual findings and disposition

- **Mobile action dock:** initial mobile screenshots showed the five-action dock clipped at the viewport edge and covering content. Corrected in `css/ui.css` to five equal columns inside 8px side insets, with bottom content space. The final mobile screenshots show all five buttons visible; report geometry is left=8, right=382 at 390px, and the dock visibility assertion passes.
- **Platform hierarchy:** Platform Home and Products/Projects remain separate from Dental product context; the Dental action dock is absent from both platform-only screens.
- **Patient workspace:** visible at both sizes; mobile uses a full-width workspace, desktop presents its established wide workspace/modal treatment.
- **History and Settings:** both render at mobile and desktop; their long content is scrollable within the surface. The screenshot-only review does not establish keyboard/screen-reader compliance.
- No remaining blocking visual, navigation or horizontal-overflow defect was found in the reviewed screenshots. This is bounded to the tested static/rendered states; it is not a claim of full accessibility compliance.

## Gate decisions

- Functional Gate: PASS on source commit `a5a59f09aa7b42644f2e228b82f35b251e3331e4` — Runtime Smoke #383, Receipt Export #540, Pages Source Verification #237, Android Build #620.
- Architecture Gate: PASS — changes limited to responsive CSS, existing Runtime Smoke assertions and documentation; no route, repository, data authority, business behavior or export boundary changed.
- Product/UX Gate: PASS for the eight captured surfaces at the two tested viewport sizes, based on final screenshot review and dock geometry checks.
- Final documentation-head CI and PR merge remain pending.
- Physical paper stock, binding, ink and real printer scaling are outside this phase and remain manual print-shop proof.

## Exit criteria

1. All 16 current-run screenshots are produced and visually reviewed.
2. All eight surfaces are covered at mobile and desktop.
3. No blocking rendered UX defects remain, or specific unresolved defects are documented as blockers.
4. Required Runtime Smoke, Pages Source Verification, Receipt Export and Android Build pass on final PR head.
5. PR is merged only after required gates pass; final `main` and Build Plan are re-verified.
6. Phase 8.11 or another next phase is not authorized unless the authoritative Build Plan explicitly defines it; do not invent the next step.

## Current decision

Rendered screenshot review is complete and the required four gates passed on source commit `a5a59f09aa7b42644f2e228b82f35b251e3331e4`. Phase 8.10 remains **IN PROGRESS** until the documentation-updated final PR head passes the same gates, the PR is merged, and the resulting `main` state is re-verified. No subsequent phase is authorized by this Phase 8.10 section; do not invent Phase 8.11.
