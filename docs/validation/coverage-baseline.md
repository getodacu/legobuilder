# RoboBuild — current coverage and acceptance

Status: four interactive LEGO reconstructions, one VEX permission-blocked source record. This is an **implementation and verification ledger**, not a five-robot completion certificate. Updated after the source graph, material-mode and model-catalog integration; a later physical-fit or browser result must change this report rather than be assumed. See [research provenance](../research/robot-sources.md), [asset rights](../research/geometry-assets.md) and [the 12 acceptance criteria](../specifications/testing.md#section-18-acceptance-matrix-exact-criteria).

## Counting rule

“Unit” means one distinct *prepared manual callout* introduced once, including an assembled wheel, motor or hub as one unit when the source does so. Inner motor submeshes and captive leads do not increase the bill. Reused assemblies are not recounted; loose sample parts remain separate from robot components. “Authored” means source references, identities, final transforms and assembly operations exist and compile; **it does not mean physically fit-verified**. A component is “verified” only after its identity, count, native geometry, mounting pose and relevant joins have independent evidence. Source-listed quantities and a test that checks their sum do not alone certify historical molds, intersection-free fits or motor limits.

| Selected official build | Numbered instructions documented / authored / independently fit-checked | Authored tracked source units / placement-checked units | Reported geometry confidence; independently checked fit | Outstanding acceptance issue |
|---|---|---|---|---|
| Advanced Driving Base, five 2019 books | **136 / 136 / 3** (38+24+24+31+19) | **234 / 7** (73+39+39+68+15) | 0.9 source-shape estimate; original seven-unit bracket nominally checked, **not clearance-certified** | Rear receiver pin centers span 64 mm versus side pins 96 mm; four lower mechanical links not asserted. New fit, rigid-body intersections, outside braces, cable travel and motor limits unverified. |
| Robot Hand, *Pass the Brick* 2019 | **28 / 28 / 0**; separate real wiring stage | **39 / 0** robot; unsourced loose lesson bricks excluded | 0.85 source-shape estimate; jaw branches validated mathematically but source fit unchecked | Source-specific pivot indices, nominal contacts, cable travel and payload/collision tolerance unverified. App demonstration uses one F-driven coupled linkage and a separate original non-BOM block. |
| Quality Check, 2019 Idea Detector + Robot Head | **30 / 30 / 0** (13+17) | **55 robot + 8 sample / 0** | 0.9 source-shape estimate; fit unchecked | Physical A/F port-to-head-axis assignment **unknown**, although both motors exist. App-authored binding, scripted inspection response and head travel are extensions, not documented manufacturing behavior. |
| Package Sorter, 2019 Robot + Base + Packages | **80 / 80 / 0** (19+58+3); 2021 edition excluded | **158 robot + 8 sample / 0** | 0.9 source-shape estimate; fit unchecked | Compound 32140/32184/32526 fork joints, package contacts and continuous pickup/drop **unsolved**. Only source Python/SVG A/F motor-command replay is enabled; a complete sorting cycle is not implemented. |
| V5 Clawbot, historical 2018 manual Rev 1 | **41 / 0 / 0** | **0; physical total unresolved** | Official STEP inspected privately; **no VEX app geometry converted** | Explicit scoped app-conversion/use permission or independently licensed Rev1-compatible geometry is missing; manual/CAD version match and conflicting fastener inventory also unresolved. |

Numerical geometry confidence measures candidate source-shape identification only, **not** a fraction of validated placements or a manufacturer tolerance. None of the additional LEGO models has an independently fit-verified numbered step. Do not infer completed acceptance from 100% authored-source coverage.

## Current executable evidence

- `npm run assets:prepare` produced 63 selected LDraw root MPDs with 484 selected DAT dependencies and attribution/hashes; original Blender-generated course marker and demonstration block GLBs are separate source-scoped props.
- `npm run models:build` strictly compiled four independent assembly graphs and their declared scenarios, writing a manifest for each and small derived catalog metadata. It reports 136/136, 28/28, 30/30 and 80/80 numbered instructions; the Hand's extra wiring stage is not a 29th manual step.
- `npm run check` passed with **868 files, zero TypeScript/Svelte errors or warnings**; `npm run test:unit` reported **45 passed, zero failed, one explicitly skipped sorter pickup/compound-linkage acceptance test**. The source ledger includes independent per-page callout reconciliation, native 14720 bore grids, motor bottom-bore seating, 73-connected-unit Front graph, nonlinear Hand loops and deterministic random-time replay.
- A real Chromium browser loaded each of the four manifests and their authentic selected MPD assets: installed source counts **234/234, 39/39, 55/55 plus eight samples, 158/158 plus eight samples**. Robot Hand moved its *same* jaw geometry and separately authored block; Quality Check moved its actual coupled head and showed violet sensor input; sorter explicitly displayed **pickup disabled**. New user-visible panels, modes and transport were exercised; no manufacturer-fit conclusion follows from these views.
- Final `env -u CI npm run test:e2e` completed **16/16 passed in Chromium** across catalog/source navigation, geometry library and resource leases, four assemblies, per-part installation/reverse/scrub, studio/technical/explode/inspection, motor/sensor demonstrations and 320 px transport. The dedicated source-geometry case and 3/3 additional-robot cases were also exercised alone before the union. No Playwright failure is being counted as a source-fit certificate; sorter pickup remains the one explicit skipped unit acceptance.
- [ADB source-stage browser captures](advanced-driving-base.md) include staged inventory, first-seven bracket, a difficult unverified rear approach, final studio, technical, capped exploded and mid-course demonstration; [Hand](robotic-hand.md), [Quality](quality-check.md) and [Sorter](package-sorter.md) reports include their own original live Chromium screenshots. These are actual WebGL pixels, not redistributed instruction art or fit certificates. Further visual fit comparisons and calibrated collision tests remain open.

## The twelve per-model acceptance criteria

**P** = observable implementation but acceptance not certified; **N** = required behavior or independent evidence missing; **B** = blocked prerequisite. These are not pass percentages.

| Criterion | Driving Base | Hand | Quality | Sorter 2019 | VEX 2018 |
|---|---|---|---|---|---|
| 01 Recognizable source build and credible geometry | P | P | P | P | B |
| 02 Verified inventory, not merely prepared callout sum | P | P | P | P | B |
| 03 Complete *validated* documented assembly coverage | P | P | P | P | B |
| 04 Individual mounting animation or real subassembly merges | P | P | P | P | B |
| 05 Independently validated installed placement/orientation | P (3 steps) | N | N | N | B |
| 06 Reversible deterministic timeline | P | P | P | P | B |
| 07 Manual/timeline synchronization | P | P | P | P | B |
| 08 Mechanically readable exploded mode | P | P | P | P | B |
| 09 Part identity and inspection | P | P | P | P | B |
| 10 Required functioning post-assembly interaction | P (course extension) | P (grasp extension) | P (inspection extension) | **N: no pickup/routing** | B |
| 11 Automated tests against actual model behavior | P | P | P | P, pickup test explicitly skipped | N for VEX model; blocked state is tested |
| 12 Source provenance, license and model deviations | P | P | P | P | P for research, app rights blocked |

The publicly linked official manuals are not bundled or reproduced. VEX STEP access, private research page screenshots or an authorized LDraw library do **not** convey permission to redistribute VEX conversion. See each robot's individual [validation report](./), [VEX evidence](../research/vex-cad-recovery.md), and the complete [testing contract](../specifications/testing.md). `npm run build` emitted a usable static `build/` with four model manifests and licensed library assets; its largest client chunk was 840 kB before gzip (222 kB gzip), above Vite's 500 kB advisory threshold. Approximately 60 FPS and integrated-GPU behavior are **targets**, not measured guarantees; clearance, friction, load and compliance remain uncalibrated.
