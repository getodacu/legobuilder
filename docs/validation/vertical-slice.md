# Advanced Driving Base vertical-slice verification

This is a historical Phase 3 checkpoint, **not a complete-robot acceptance report**. It covers Front Part Book 1 instructions 1–3: one 40490 beam, four separate 2780 pins and two 48989 integral-pin cross blocks. Whole-build coverage at this checkpoint is 3/136 documented instructions and 7/234 prepared callout units. The old/new cross-block mold distinction remains disclosed; nominal community CAD fit does not certify physical molding tolerances.

## Exercised checks

- `npm run assets:prepare && npm run models:build`: 64 genuine self-contained MPDs, 492 selected DAT dependencies; all 561 cached source DAT hashes verified. Strict model generation produced the actual seven-unit manifest.
- `npm run check`: 845 files, zero errors and zero warnings.
- `npm run test:unit`: **16/16 passed**, including the real source model, not only synthetic engine fixtures.
- `env -u CI PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome npm run test:e2e`: **9/9 passed** using real Chrome, WebGL, assets and UI. The variable selects this workstation's installed Chrome; omit it when Playwright's bundled Chromium is installed. `CI` was unset only because the parent-owned development server was already running on 5179.
- `npm run build`: static production build passed, including prerendered links to the real rendered preview.
- Independent browser inspection at 1512×982 observed an unclipped **838×445** drawing surface, and no uncaught page errors during the captured interactions. Playwright exercised 320px and 390px layouts without horizontal overflow.

The browser library test loaded every authorized root, checked canonical source origins, fixed versus inherited colors, genuine motor rotor partitions, independent cache leases, disposal and corrupt-hash rejection. A separate browser diagnostic measured all 64 actual loaded meshes; none had a missing mesh or non-finite bounds. This does not constitute visual inspection or dimensional certification of every component.

## Source-specific structural evidence

`tests/unit/source-assembly.test.ts` independently transforms native DAT features rather than merely comparing two authored connection records:

- Nine beam hole centers retain their 20-LDU pitch and original central origin.
- Two far-face pin collars seat at beam holes 4/6; their entering tips reach the opposite face.
- Four gray integral-pin bases seat at beam holes 1/3/7/9 without counting captive pins as separate components.
- Two outer upper pins seat on the gray blocks' actual outer-hole face planes, not their hole midplanes.
- All eight mating axes agree; six entering components follow an 8mm axial contact-to-seat segment continuously.
- Source introductions remain 3/2/2; exact installation boundaries reverse correctly, arbitrary seek history does not change poses, and output buffers are reused.

The first attempt at the independent test transcribed the beam's native ±Y faces in reverse. The model's DAT registration maps native +Y to the scene's near +Z face. Correcting the independent transcription resolved that discrepancy; the robot transforms were not changed to satisfy it.

Direct comparison with the official Front Part page-2 detail and page-1–7 contact sheet confirmed the page-3 arrangement: both paired gray blocks on the near face, far pins in holes 4/6, and upright pins in the two outer upper holes. Official imagery remains private; public screenshots below are independent renders of licensed component geometry.

## Actual UI states

Installed means a seating event has committed; a hold before a source-step boundary can have all that step's parts seated without incrementing completed steps yet.

| Timeline ms | Installed / tracked units | Completed / implemented steps | Synchronized source page |
| --- | --- | --- | --- |
| 0 | 0/7 | 0/3 | 1 |
| 3999 | 3/7 | 0/3 | 1 |
| 6999 | 5/7 | 1/3 | 2 |
| 10000 | 7/7 | 3/3 | 3 |

Screenshots: [organized inventory](screenshots/vertical-slice-inventory.webp), [first seated bracket](screenshots/vertical-slice-step1-seated.webp), [gray blocks seated](screenshots/vertical-slice-step2-seated.webp), [final bracket](screenshots/vertical-slice-final.webp), [technical mode](screenshots/vertical-slice-technical.webp), [mechanical explosion](screenshots/vertical-slice-exploded.webp). The catalog preview is an actual WebGL capture, not a generated or completed-robot substitute.

Playwright additionally exercised non-reduced-motion step playback, pause/resume, single-step stopping, reverse, source-page browsing without seeking, mapped-figure seeking, selection, isolation, mounting overlays, camera controls/manual override, keyboard typing guards, native modal focus return, and responsive exclusive drawers. Reaching this partial endpoint did not unlock simulation.

## Rendering boundary and remaining limits

The catalog/workspace split reduced the landing route chunk to 18.02kB minified / 7.53kB gzip. The separately loaded Three.js workspace chunk was 781.03kB / 204.20kB gzip. The bundler's large-chunk advisory remains visible; it was not suppressed. Frame-rate, long-duration GPU-resource behavior, full-build clearances and post-assembly simulation were not established by this checkpoint.

Sources and attribution: [bracket derivation](advanced-driving-base.md), [official Front Part PDF](https://assets.education.lego.com/v3/assets/blt293eea581807678a/blt9d23fa8f579e63ea/5f8802346c54ba0f72c2081e/advanced-driving-base-bi-pdf-book1of5.pdf?locale=en-us), [LDraw credits](../../static/models/library/CREDITS.txt), and [geometry pipeline](../architecture/asset-library.md). No official manual pages or VEX CAD-derived meshes are redistributed.
