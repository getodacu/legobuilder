# RoboBuild — current coverage and acceptance

Status: four interactive LEGO reconstructions, one VEX permission-blocked source record. This is an **implementation and verification ledger**, not a five-robot completion certificate. Updated after the source graph, material-mode and model-catalog integration; a later physical-fit or browser result must change this report rather than be assumed. See [research provenance](../research/robot-sources.md), [asset rights](../research/geometry-assets.md) and [the 12 acceptance criteria](../specifications/testing.md#section-18-acceptance-matrix-exact-criteria).

## Counting rule

“Unit” means one distinct *prepared manual callout* introduced once, including an assembled wheel, motor or hub as one unit when the source does so. Inner motor submeshes and captive leads do not increase the bill. Reused assemblies are not recounted; loose sample parts remain separate from robot components. “Authored” means source references, identities, final transforms and assembly operations exist and compile; **it does not mean physically fit-verified**. A component is “verified” only after its identity, count, native geometry, mounting pose and relevant joins have independent evidence. Source-listed quantities and a test that checks their sum do not alone certify historical molds, intersection-free fits or motor limits.

| Selected official build | Numbered instructions documented / authored / independently fit-checked | Authored tracked source units / placement-checked units | Reported geometry confidence; independently checked fit | Outstanding acceptance issue |
|---|---|---|---|---|
| Advanced Driving Base, five 2019 books | **136 / 136 / 3** (38+24+24+31+19) | **234 / 7** (73+39+39+68+15) | 0.9 source-shape estimate; original seven-unit bracket nominally checked, **not clearance-certified** | Rear receiver pin centers span 64 mm versus side pins 96 mm; four lower mechanical links not asserted. New fit, rigid-body intersections, outside braces, cable travel and motor limits unverified. |
| Robot Hand, *Pass the Brick* 2019 | **28 / 28 / 0**; separate real wiring stage | **39 / 0** robot; unsourced loose lesson bricks excluded | 0.85 source-shape estimate;53 nominal native registrations across39 identities independently supported; physical fits unchecked | Corrected32348 jaws, source-selected8/8mm rear arms, diagonal-end H, complete handle and fingertip faces. Axle insertion stop, physical zero/travel, compliant retention, cable route and collision tolerance remain unknown. |
| Quality Check, 2019 Idea Detector + Robot Head | **30 / 30 / 0** (13+17) | **55 robot + 8 sample / 0** | 0.9 source-shape estimate; base/head/exterior native-contact audit completed, physical fit unchecked | Corrected frame/rails/hub, reversed output, surrounds, handed panels and coaxial retainer. Cable-supported retainer global seat and physical A/F-to-axis assignment are **unknown**; inspection behavior remains an app-authored extension. |
| Package Sorter, 2019 Robot + Base + Packages | **80 / 80 / 0** (19+58+3); 2021 edition excluded | **158 robot + 8 sample / 0** | 0.9 source-shape estimate; fit unchecked | Compound 32140/32184/32526 fork joints, package contacts and continuous pickup/drop **unsolved**. Only source Python/SVG A/F motor-command replay is enabled; a complete sorting cycle is not implemented. |
| [V5 Clawbot, historical 2018 manual Rev 1](vex-clawbot.md) | **41 / 0 / 0** | **0; physical total unresolved** | Official STEP inspected privately; **no VEX app geometry converted** | Explicit scoped app-conversion/use permission or independently licensed Rev1-compatible geometry is missing; manual/CAD version match and conflicting fastener inventory also unresolved. |

Numerical geometry confidence measures candidate source-shape identification only, **not** a fraction of validated placements or a manufacturer tolerance. None of the additional LEGO models has an independently fit-verified numbered step. Do not infer completed acceptance from 100% authored-source coverage.

The corrected canonical Sorter Base p24 callout has two genuine 6628 towball pins (historical stable IDs `base2019:peg-black-friction:19/20`), not two plain 2780 pins. Original robot count stays 158; corrected totals across the Sorter are 48 plain 2780 and 6 black 6628 pins. Rod-socket geometry is inspectable, but its as-authored end contacts and motor-to-crank axes do not close; this correction does **not** raise its fit-checked step count.

## Current executable evidence

- `npm run assets:prepare` produced **64 selected LDraw root MPDs with485 selected DATs**, original attribution/hashes and all563 private cache hashes verified. The existing source-correct32348 Hand root reuses41 selected dependencies; original Blender-generated course marker and demonstration block GLBs remain separate source-scoped props.
- `npm run models:build` strictly compiled four independent assembly graphs and their declared scenarios, writing a manifest for each and small derived catalog metadata. It reports 136/136, 28/28, 30/30 and 80/80 numbered instructions; the Hand's extra wiring stage is not a 29th manual step.
- `npm run check` passed with **871 files, zero TypeScript/Svelte errors or warnings**; `npm run test:unit` reported **52 passed, zero failed, one explicitly skipped sorter pickup/compound-linkage acceptance test**. Independent source fixtures cover the corrected Hand jaw/H/53 nominal registrations and keyed fingertip surfaces; Quality frame/hub/reversed-output/exterior contact planes; ADB native features; Sorter towball/socket identity; and all four full-scene source-boundary/random-time pose, buffer, flag and accounting lanes.
- A real Chromium browser loaded each of the four manifests and their authentic selected MPD assets: installed source counts **234/234, 39/39, 55/55 plus eight samples, 158/158 plus eight samples**. Robot Hand moved its *same* jaw geometry and separately authored block; Quality Check moved its actual coupled head and showed violet sensor input; sorter explicitly displayed **pickup disabled**. New user-visible panels, modes and transport were exercised; no manufacturer-fit conclusion follows from these views.
- Final `env -u CI npm run test:e2e` completed **18/18 passed in Chromium** across catalog/source navigation and reversible visit resume; graph-backed education; every selected source root/resource lease; four assemblies; per-part reverse/scrub; studio/technical/explode/inspection; motor/sensor demonstrations; and320px transport. The source-camera reset restores the real view, and assembly return/course re-entry reproduce the same pixels after the studio-rig history bug was fixed. Obsolete exact demo-angle and orange-column heuristics were removed, not re-pinned. Sorter pickup remains the one explicit skipped unit acceptance; no browser pass is a source-fit certificate.
- [ADB source-stage browser captures](advanced-driving-base.md) include staged inventory, first-seven bracket, a difficult unverified rear approach, final studio, technical, capped exploded, mid-course demonstration and [the actual 320 px viewport after catalog navigation](screenshots/mobile-320-workbench.png). [Hand](robotic-hand.md), [Quality](quality-check.md) and [Sorter](package-sorter.md) reports include their own live Chromium screenshots. These are real WebGL pixels, not redistributed instruction art or fit certificates. Further visual fit comparisons and calibrated collision tests remain open.
- The actual [catalog with corrected WebGL previews and visit progress](screenshots/catalog-progress-current.png) and [live graph-backed educational guide](screenshots/graph-backed-education.png) were exercised in Chromium. Guide prerequisite actions seek their source step; inspection actions select real CAD; A/E live coordinates at5s independently integrate to9/10rad, then return to zero on reverse seek. Catalog reopen restored the exact10s,7/234-unit,3/136-step state without promoting physical-fit coverage.
- Final production `build/` was served on an isolated preview port and exercised in Chromium: five catalog records; original current previews; credits HTTP200 including32348; the same39-unit Hand gripped at4.2s; catalog return reported28/28 **source** steps rather than29 wiring-inclusive stages; mobile320px Quality loaded55/55 units/30 steps with header top0. No new page errors or HTTP failures were observed. The temporary preview was stopped; the development application remains on5179.

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

The publicly linked official manuals are not bundled or reproduced. VEX STEP access, private research page screenshots or an authorized LDraw library do **not** convey permission to redistribute VEX conversion. See each robot's individual [validation report](./), [VEX evidence](../research/vex-cad-recovery.md), and the complete [testing contract](../specifications/testing.md). `npm run build` emitted a usable static `build/` with four model manifests and licensed library assets; its largest client chunk was approximately854 kB before gzip (226 kB gzip), above Vite's500 kB advisory threshold. Approximately60 FPS and integrated-GPU behavior are **targets**, not measured guarantees; clearance, friction, load and compliance remain uncalibrated.

**Measured local software-renderer limit:** Chromium identified ANGLE/Vulkan **SwiftShader**, not a hardware GPU. Viewport1280×800; each sample measures two animation frames including the actual WebGL draw/scheduling.

| Actual workload | Samples | Median | p95 | Measurement context |
|---|---:|---:|---:|---|
| Initial ADB alternating zero/final seeks |60 |404.6ms |418.2ms |Earlier renderer revision |
| Idle two-frame reference |18 |33.3ms |33.4ms |No pose changes |
| Final ADB alternating zero/final seeks |30 |455.5ms |527.6ms |Time-derived studio; concurrent local browser suite |

The concurrent final run is not an isolated regression benchmark; it cannot attribute the timing difference to the studio change. Both seek measurements expose a real software-backend limitation: full-scene rapid scrubbing is not responsive here. No hardware FPS/integrated-GPU guarantee follows. Adaptive rendering can reduce the1024px shadow map to512px even atDPR1 and restore it after sustained fast draws; source geometry is not replaced with primitives. Geometry reuse and static disposal have separate automated lifetime checks.
