# ALSSAEDY Clinic Receipt — Protected Design Contract

Version: 1.0  
Baseline: dce3994e723dddd77bb96fb6432222ca650750f9

## Protected
- Clinic identity, doctor name, specialty, logo.
- Address: ريمة – كسمة – عزلة الضبارة.
- Contact numbers: +967 716 339 366 / +967 739 550 138 / +967 775 956 520.
- A5/A4/80mm size profiles.
- Receipt financial grid and signature/stamp structure.
- PNG export, native print/PDF flow, history, sharing, watermark and typography controls.

## Update rule
Future changes must preserve protected components unless a documented regression or explicit product requirement requires a change. Test screen, mobile, print and export behavior before release.

## Export rule
PNG is the raster/share artifact. PDF is produced through the browser's native print engine so text and layout are not flattened into a canvas image.

## Footer rule
The clinic address is isolated from RTL/LTR contact data. Phone numbers remain LTR and tabular for reliable display and printing.
