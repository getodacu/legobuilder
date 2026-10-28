# RoboBuild — current coverage and acceptance

Status: the active product contains exactly four interactive LEGO builds: `advanced-driving-base`, `robotic-hand`, `quality-check` and `package-sorter`. The user explicitly removed VEX V5 Clawbot; its [historical validation record](vex-clawbot.md) and private research are retained, but VEX geometry, rights and implementation are **not delivery prerequisites**. This is an **implementation and verification ledger**, not a four-robot completion certificate. Remaining LEGO accuracy and sorting gaps below still prevent full acceptance. See [research provenance](../research/robot-sources.md), [asset rights](../research/geometry-assets.md) and [the 12 acceptance criteria](../specifications/testing.md#section-18-acceptance-matrix-exact-criteria).

## Counting rule

“Unit” means one distinct *prepared manual callout* introduced once, including an assembled wheel, motor or hub as one unit when the source does so. Inner motor submeshes and captive leads do not increase the bill. Reused assemblies are not recounted; loose sample parts remain separate from robot components. “Authored” means source references, identities, final transforms and assembly operations exist and compile; **it does not mean physically fit-verified**. A component is “verified” only after its identity, count, native geometry, mounting pose and relevant joins have independent evidence. Source-listed quantities and a test that checks their sum do not alone certify historical molds, intersection-free fits or motor limits.

| Selected official build | Numbered instructions documented / authored / independently fit-checked | Authored tracked source units / placement-checked units | Reported geometry confidence; independently checked fit | Outstanding acceptance issue |
|---|---|---|---|---|
| Advanced Driving Base, five2019 books | **136 / 136 / 3** (38+24+24+31+19) | **234 / 7** (73+39+39+68+15) | 0.9 source-shape estimate; initial seven-unit bracket plus bounded34-contact rear audit, **not clearance-certified** | Former rear-width mismatch resolved by official physical film and native gray receivers/white motor seats. Whole-model intersections, other braces/stops, cable travel and motor calibration remain unmeasured. |
| Robot Hand, *Pass the Brick* 2019 | **28 / 28 / 0**; separate real wiring stage | **39 / 0** robot; unsourced loose lesson bricks excluded | 0.85 source-shape estimate;53 nominal native registrations across39 identities independently supported; physical fits unchecked | Corrected32348 jaws, source-selected8/8mm rear arms, diagonal-end H, handle and fingertip faces. Qualitative captive F lead is rendered; axle stop, physical zero/travel, compliant retention and dynamic cable clearance remain unmeasured. |
| Quality Check, 2019 Idea Detector + Robot Head | **30 / 30 / 0** (13+17) | **55 robot + 8 sample / 0** | 0.9 source-shape estimate; base/head/exterior native-contact audit completed, physical fit unchecked | Corrected frame/rails/hub, reversed output, surrounds, handed panels and coaxial retainer. Cable-supported retainer global seat and physical A/F-to-axis assignment are **unknown**; inspection behavior remains an app-authored extension. |
| Package Sorter, 2019 Robot + Base + Packages | **80 / 80 / 0** (19+58+3); 2021 edition excluded | **158 robot + 8 sample / 0** | 0.9 source-shape estimate; selected nominal native bearing/crank/fork/rod/pedestal/package seats now independently regressed, whole fit unchecked | Two40mm spherical rods constrain three passive coordinates; no source-registered active contact/stop, F phase/sign, genuine capture or accepted/rejected package cycle. Python/SVG replay moves only the actual A/F motor outputs. |

Numerical geometry confidence measures candidate source-shape identification only, **not** a fraction of validated placements or a manufacturer tolerance. None of the additional LEGO models has an independently fit-verified numbered step. Do not infer completed acceptance from 100% authored-source coverage.

The canonical Sorter Base p24 callout contains genuine6628 towballs (stable historical IDs `base2019:peg-black-friction:19/20`), not ordinary2780 pins; its158 robot/8 sample total remains unchanged:48 genuine2780 plus6 genuine6628. The new [native reconstruction](../research/sorter-linkage-resolution.md) checks the asymmetric source F shaft stack, round-bearing carrier, direct yellow/black mast, four L-to-11L cage pins, source fork receiver rows, outward side pedestal H supports, two40mm nominal rod closures and all three package cross rows. This **resolves the earlier static indexing mismatch**, not the continuous passive branch, release/grip or placement certification. The independent-fit-checked step count remains0.

## Latest four-robot gates — rear join and source-native Sorter correction

| Gate | Observed result on current four-model code |
|---|---|
| `npm run assets:prepare` | Passed:64 licensed MPD roots,485 selected DATs and563 private source hashes checked; no unauthorized Blender/VEX conversion introduced. |
| `npm run models:build` | Passed: four manifests;234/136 ADB,39/28 Hand,63/30 Quality including8 source samples,166/80 Sorter including8 separate packages; all placement-fit flags remain honest. |
| `npm run check` | Passed:876 files, zero errors and warnings. |
| `npm run test:unit` | **64 passed, zero failed, one explicitly skipped full Sorter physical pickup/routing test.** Regressions check official ADB rear receiver contacts at source6/19/Book5p9 and six new Sorter native seat/body families including nominal40mm rod closure. |
| `npm run build` | Passed: static `build/` emitted, largest client chunk861.53kB /228.40kB gzip; existing500kB advisory retained, not suppressed. |
| `env -u CI npm run test:e2e` | **23/23 passed in real Chromium,5.3min**: exactly four catalog models; all four source-linked workbenches; selected manual PDF pages; responsive navigation; reverse/seek, source camera override and post-assembly scenes. Suite-owned production5187 and source-module Vite5188; not dev5179. |

Direct desktop WebGL inspection separately exercised [ADB Book5 source9 rear insertion and differential driving](advanced-driving-base.md#actual-browser-captures-and-limits), plus [Sorter Robotp22 transfer, Basep60 final, technical/explode and Python motor replay at10s](package-sorter.md#acceptance-status). Sorter A/F read **−1.571/−1.745rad** at10s; seeking19.14s→0 restored both motor outputs and the scripted D signal, **but both real package assemblies stayed on their pedestals**. No browser page errors were observed in these inspected surfaces. Source-video findings fix the ADB rear receiver ownership and nominal Sorter static fit; they do not supply the missing underactuated Sorter active contact law, F encoder phase/sign, continuous capture or distinct delivery. Criterion10 for Sorter therefore remains **N** despite all software gates passing.

## Native geometry and flexible leads — earlier integration check

The four-model cutover below is retained as history. This later integration corrects the ADB Rear17 families to63869/60483 and its native cap/rail stack, the Sorter F/crank and mirrored sphere/socket seats, and the missing Hand/Quality flexible-lead scene consumer. The source callout totals and numbered-step counts do not change.

| Gate | Observed earlier result, before the new join research |
|---|---|
| `npm run assets:prepare` | Passed:64 licensed root MPDs,485 selected DATs,563 private source hashes verified; no new geometry substitution. |
| `npm run models:build` | Passed:four source-backed model graphs and declared scenario compilations. |
| `npm run check` | Passed:876 files, zero errors or warnings. |
| `npm run test:unit` | **56 passed, zero failed, one explicitly skipped Sorter complete pickup/routing acceptance.** New regressions exercise ADB native seats, Sorter shaft/socket alignment and moving cable-channel geometry. |
| Production build | Passed during the browser gate; static `build/` emitted. Existing500kB client-chunk advisory remains visible. |
| `env -u CI npm run test:e2e` | **23/23 passed in5.6 minutes**:22 product cases use suite-owned production5187; the source-module geometry integration uses separate suite-owned Vite5188. Neither reuses development5179. |

Two observed harness failures were corrected, not hidden: a development HMR reload interrupted the320px workflow, so product cases now use immutable production output; the geometry integration deliberately imports source modules, so only that case uses its own source server. Its existing static-asset import warnings remain visible.

Afterward, real Chromium independently exercised **all four current production workbenches** from zero to234/234,39/39,55/55 and158/158 robot units; entered each same-hierarchy demonstration; reversed every motor command to zero; and returned to exactly four catalog cards. There were **zero page exceptions or HTTP errors**. Hand's29th guide stage is real unnumbered wiring, not a29th numbered source instruction. Quality/Sorter samples remain separate from robot totals. Sorter still explicitly provides motor replay, not pickup/routing.

Fresh actual WebGL views show the [Hand's captive handle lead](screenshots/hand-routed-lead-assembly.png), [hidden flexible span during exploded inspection](screenshots/hand-routed-lead-exploded.png), [coupled grip with that same lead](screenshots/hand-routed-lead-grip.png), [Quality's routed head leads](screenshots/quality-routed-leads-assembly.png) and [moving head/support bundle](screenshots/quality-routed-leads-motion.png). Hand captures use the current production build; Quality captures use the identical current source renderer on development5179. These are qualitative surfaces, not cable-length, clearance, force or source-port certification.

**Those software gates passed; full four-robot mechanical/scenario acceptance remains open.** The subsequent [ADB investigation](../research/adb-join-resolution.md) resolves the former16mm rear residual and is exercised in [fresh actual WebGL captures](advanced-driving-base.md#actual-browser-captures-and-limits). Sorter's complete coupled contact branch and real package cycle remain open; source/CAD registration must not be promoted into an unsupported physical sorting claim.

## Four-robot cutover — previous executable check

The catalog, flat `CatalogEntry` contract, source-only UI removal, browser expectations, specifications and release matrix now target exactly the four LEGO builds above. Historical VEX evidence is retained outside product scope; no VEX implementation or permission is a release dependency. The following gates were executed together after the cutover, not inferred from the previous run:

| Gate | Observed result |
|---|---|
| `npm run assets:prepare` | Passed: 64 genuine MPDs, 485 selected DATs, all 563 private source hashes verified. |
| `npm run models:build` | Passed: all four source-backed graphs, inventory reconciliation and declared scenario compilations. |
| `npm run check` | Passed: 875 files, zero errors and warnings. |
| `npm run test:unit` | 53 passed, zero failed, **one explicit Sorter physical pickup/routing acceptance skipped**. The skip is not a passing sorting demonstration. |
| `npm run build` | Passed: static `build/` emitted; largest client chunk 853.81 kB / 225.97 kB gzip. The existing 500 kB chunk advisory remains visible. |
| `env -u CI npm run test:e2e` | **23/23 Chromium cases passed in 5.4 minutes**, including the four-card/no-Clawbot catalog, current guided UI and responsive workflows. |

The production bundle was then served on isolated port5187 and exercised in real Chromium: every preview loaded; each of the four workbenches loaded its own real geometry, progressed from zero to its complete authored unit count, entered its same-hierarchy demonstration and returned to the catalog. Hand retained its real wiring-inclusive final stage; the Sorter explicitly continued to report **pickup disabled**, with only actual yaw/output replay. Seventy distinct manifest/MPD/GLB requests completed without a page exception, failed request or HTTP error. Public credits returned HTTP200 and included the corrected32348 source.

At320px, the production catalog still contained four guides without horizontal overflow. Reopening Quality Check restored its completed guide; header top was0px, the live scene remained200.625px high and the scrollable instruction pane309px high. The [actual four-robot catalog](screenshots/catalog-four-robots.png) and [320px production workbench](screenshots/four-robot-mobile-320.png) were captured and visually reviewed. The production browser and temporary preview were closed after inspection; the development app remains on5179.

**At that cutover, software checks passed but full mechanical/four-scenario acceptance did not.** Its ADB rear mismatch has since been resolved; remaining Hand/Quality fit/calibration uncertainty and Sorter's closed-contact branch/package routing are separate issues. VEX remains out of scope, and the twelve-criterion matrix intentionally preserves unverified behavior.

## Previous executable evidence

The results below predate the four-model-only catalog cutover. They remain historical evidence, **not a fresh verification of the changed product**. Passing executable checks demonstrate only their exercised software behavior; they do not resolve independent LEGO fit, Hand retention/calibration, Quality cable/port mapping or Sorter pickup/routing acceptance. Fresh final-run results must be recorded separately after execution.

- `npm run assets:prepare` produced **64 selected LDraw root MPDs with485 selected DATs**, original attribution/hashes and all563 private cache hashes verified. The existing source-correct32348 Hand root reuses41 selected dependencies; original Blender-generated course marker and demonstration block GLBs remain separate source-scoped props.
- `npm run models:build` strictly compiled four independent assembly graphs and their declared scenarios, writing a manifest for each and small derived catalog metadata. It reports 136/136, 28/28, 30/30 and 80/80 numbered instructions; the Hand's extra wiring stage is not a 29th manual step.
- `npm run check` passed with **871 files, zero TypeScript/Svelte errors or warnings**; `npm run test:unit` reported **52 passed, zero failed, one explicitly skipped sorter pickup/compound-linkage acceptance test**. Independent source fixtures cover the corrected Hand jaw/H/53 nominal registrations and keyed fingertip surfaces; Quality frame/hub/reversed-output/exterior contact planes; ADB native features; Sorter towball/socket identity; and all four full-scene source-boundary/random-time pose, buffer, flag and accounting lanes.
- A real Chromium browser loaded each of the four manifests and their authentic selected MPD assets: installed source counts **234/234, 39/39, 55/55 plus eight samples, 158/158 plus eight samples**. Robot Hand moved its *same* jaw geometry and separately authored block; Quality Check moved its actual coupled head and showed violet sensor input; sorter explicitly displayed **pickup disabled**. New user-visible panels, modes and transport were exercised; no manufacturer-fit conclusion follows from these views.
- The previous final `env -u CI npm run test:e2e` completed **18/18 passed in Chromium** across catalog/source navigation and reversible visit resume; graph-backed education; every selected source root/resource lease; four assemblies; per-part reverse/scrub; studio/technical/explode/inspection; motor/sensor demonstrations; and320px transport. The source-camera reset restores the real view, and assembly return/course re-entry reproduce the same pixels after the studio-rig history bug was fixed. Obsolete exact demo-angle and orange-column heuristics were removed, not re-pinned. Sorter pickup remains the one explicit skipped unit acceptance; no browser pass is a source-fit certificate.
- [ADB source-stage browser captures](advanced-driving-base.md) include staged inventory, first-seven bracket, a difficult unverified rear approach, final studio, technical, capped exploded, mid-course demonstration and [the actual 320 px viewport after catalog navigation](screenshots/mobile-320-workbench.png). [Hand](robotic-hand.md), [Quality](quality-check.md) and [Sorter](package-sorter.md) reports include their own live Chromium screenshots. These are real WebGL pixels, not redistributed instruction art or fit certificates. Further visual fit comparisons and calibrated collision tests remain open.
- The actual [catalog with corrected WebGL previews and visit progress](screenshots/catalog-progress-current.png) and [live graph-backed educational guide](screenshots/graph-backed-education.png) were exercised in Chromium. Guide prerequisite actions seek their source step; inspection actions select real CAD; A/E live coordinates at5s independently integrate to9/10rad, then return to zero on reverse seek. Catalog reopen restored the exact10s,7/234-unit,3/136-step state without promoting physical-fit coverage.
- The previous production `build/` was served on an isolated preview port and exercised in Chromium: **five historical catalog records, before VEX removal**; original previews; credits HTTP200 including32348; the same39-unit Hand gripped at4.2s; catalog return reported28/28 **source** steps rather than29 wiring-inclusive stages; mobile320px Quality loaded55/55 units/30 steps with header top0. No new page errors or HTTP failures were observed in that run. The temporary preview was stopped; that report recorded the development application on5179, not a current service guarantee.

## The twelve per-model acceptance criteria

**P** = observable implementation but acceptance not certified; **N** = required behavior or independent evidence missing. These are not pass percentages. The matrix covers only the four active LEGO models; a software test pass does not promote any cell to independently certified acceptance.

| Criterion | Driving Base | Hand | Quality | Sorter 2019 |
|---|---|---|---|---|
| 01 Recognizable source build and credible geometry | P | P | P | P |
| 02 Verified inventory, not merely prepared callout sum | P | P | P | P |
| 03 Complete *validated* documented assembly coverage | P | P | P | P |
| 04 Individual mounting animation or real subassembly merges | P | P | P | P |
| 05 Independently validated installed placement/orientation | P (3 steps) | N | N | N |
| 06 Reversible deterministic timeline | P | P | P | P |
| 07 Manual/timeline synchronization | P | P | P | P |
| 08 Mechanically readable exploded mode | P | P | P | P |
| 09 Part identity and inspection | P | P | P | P |
| 10 Required functioning post-assembly interaction | P (course extension) | P (grasp extension) | P (inspection extension) | **N: no pickup/routing** |
| 11 Automated tests against actual model behavior | P | P | P | P, pickup test explicitly skipped |
| 12 Source provenance, license and model deviations | P | P | P | P |

The publicly linked official manuals are not bundled or reproduced. See each active robot's individual [validation report](./) and the complete [testing contract](../specifications/testing.md). Retained [VEX evidence](../research/vex-cad-recovery.md) is historical and does not add a release gate; removal does not grant permission to convert or redistribute its sources. The previous `npm run build` emitted a usable static `build/` with four model manifests and licensed library assets; its largest client chunk was approximately854 kB before gzip (226 kB gzip), above Vite's500 kB advisory threshold. Approximately60 FPS and integrated-GPU behavior are **targets**, not measured guarantees; clearance, friction, load and compliance remain uncalibrated.

**Measured local software-renderer limit:** Chromium identified ANGLE/Vulkan **SwiftShader**, not a hardware GPU. Viewport1280×800; each sample measures two animation frames including the actual WebGL draw/scheduling.

| Actual workload | Samples | Median | p95 | Measurement context |
|---|---:|---:|---:|---|
| Initial ADB alternating zero/final seeks |60 |404.6ms |418.2ms |Earlier renderer revision |
| Idle two-frame reference |18 |33.3ms |33.4ms |No pose changes |
| Final ADB alternating zero/final seeks |30 |455.5ms |527.6ms |Time-derived studio; concurrent local browser suite |

The concurrent final run is not an isolated regression benchmark; it cannot attribute the timing difference to the studio change. Both seek measurements expose a real software-backend limitation: full-scene rapid scrubbing is not responsive here. No hardware FPS/integrated-GPU guarantee follows. Adaptive rendering can reduce the1024px shadow map to512px even atDPR1 and restore it after sustained fast draws; source geometry is not replaced with primitives. Geometry reuse and static disposal have separate automated lifetime checks.
