# Package Sorter — canonical2019 reconstruction and validation

## Acceptance status

**Not acceptance-complete. Functional package pickup/sorting is blocked.** The source-backed inventory and80 numbered instructions are authored. Native LDraw motor, bearing, connector, rod, fork, mast, pedestal and package fits now have independently transcribed feature regressions ([source-native reconstruction](../research/sorter-linkage-resolution.md)); **a complete independent manual-to-WebGL fit comparison has not been performed**. All166 authored placement flags remain `fit: unchecked`: nominal contact coincidence is not whole-assembly physical validation. The available scenarios remain explicitly titled **source motor replay — pickup disabled**, not working sorting cycles.

The model is `packageSorter` in `src/lib/models/package-sorter.ts`, ID `package-sorter`. Only two source-supported powered axes are active: A whole-arm yaw and F medium-motor output shafts/z28/dishes. The nominal body graph now distinguishes keyed F cranks, independent spherical rods, an F-shaft round-bearing carrier, forward keyed fork adapters and a separate round-bearing F cage. No guessed passive fork track, fake third-powered gripper, conveyor, made-up transmission ratio, package teleport or unsupported catch contact is enabled.

| Coverage | Authored | Independently verified in this task |
|---|---:|---:|
| Canonical numbered instructions |80 =19 Robot +58 Base +3 Packages |0 |
| Robot prepared-callout instances |158 =57 Robot +101 Base |0 assembled fits |
| Separately attributed source package instances |8 |0 assembled fits |
| Geometry |Genuine licensed native-origin LDraw components |Selected native feature seats regressed; no independent full-scene fit or collision certification |
| Powered axes |2 actual motor-output pivots |Fresh Chrome F/A source-command replay reversed at19.14s→0 and scrubbed to10.00s; F/A motor states changed, passive fork/pickup did not |
| Nonlinear compound linkage |Nominal shaft/carrier/cage/fork/rod body ownership and40mm bilateral closure reconstructed |Unloaded/contact-selected moving branch disabled, no phase/stop registration |
| Capture/release and distinct delivery |Disabled, explicitly skipped acceptance test |0 |

Current parent integration ran all four strict manifests, TypeScript/Svelte checking, the unit suite, production build and **23/23 Playwright Chromium cases**. The permanent `tests/unit/package-sorter.test.ts` explicitly skips its unresolved full-cycle pickup/routing test; no green sorter acceptance is implied by passing the other cases.

Historical Chromium WebGL captures at1512×982 below predate the later native bearing/mast/pedestal correction. They demonstrate assembly transport, **not** source-contact verification, nonlinear closure or a delivered package:

| State | Installed robot units; source steps | Live capture |
|---|---|---|
| Staged inventory |0/158;0/80 |[Inventory](screenshots/sorter-source-inventory.png) |
| Robot19 + Base11 assembled |78/158;30/80 |[Base](screenshots/sorter-source-base-seated.png) |
| Base53 approach, 55%, geometry unverified |155/158;71/80 |[Fork approach](screenshots/sorter-source-fork-approach-unverified.png) |
| Final authored state;8 separate samples also installed |158/158;80/80 |[Unverified final assembly](screenshots/sorter-source-final-unverified.png) |
| Same endpoint, technical mode |158/158;80/80 |[Technical](screenshots/sorter-source-technical.png) |
| Same endpoint, exploded presentation |158/158;80/80 |[Exploded](screenshots/sorter-source-exploded.png) |
| Source commands at6s, **pickup disabled** |158/158;80/80 |[Motor replay only](screenshots/sorter-source-command-replay-only.png) |

Current corrected Chrome WebGL captures (desktop1512×982, rendered screenshot1024×665) show the live native LDraw assets, manual source links, cumulative counts and disabled pickup. They do **not** certify full manual fit:

| Scene | Source state / observed behavior | Capture |
|---|---|---|
| Robotp22, before Robot19 merge | Guide18/80 complete,57/158 robot units; side pedestal modules approach the magenta outer short rails |[Pedestal transfer](screenshots/sorter-corrected-robot19-p22.png) |
| Basep60 final source reuse | Step80/80,158/158 robot +8/8 separate samples; fit camera shows source-colored samples on two laterally supported pedestals |[Final native assembly](screenshots/sorter-corrected-final-source58.png) |
| Basep60 technical / exploded | Same exact installed accounting; high-contrast lines and physically separated bodies |[Technical](screenshots/sorter-corrected-technical.png) · [Exploded](screenshots/sorter-corrected-exploded.png) |
| Python source motor replay, t=10.00s | A=−1.571rad,F=−1.745rad,D scripted magenta; both sample groups remain on pedestals; seeking19.14s→0 resets A/F and D; no browser page errors |[Disabled-pickup motor replay](screenshots/sorter-corrected-motor-replay-10s.png) |

## Locked source edition and accounting

Authoritative transcription: [`../research/data/package-sorter.json`](../research/data/package-sorter.json). Contextual identities: [`../research/data/lego-part-crosswalk.json`](../research/data/lego-part-crosswalk.json). Original PDFs/page renders remain private under `.research-cache/package-sorter/`; none is copied into public assets.

| Document | Pages / numbered steps / prepared units | SHA-256 |
|---|---|---|
| [Robot2019][robot] |22 /19 /57 robot |`7db26cbedb1242a818c9f60fb0b299d90ac5a82eb24f26bf6657d1a58e813eae` |
| [Base2019][base] |61 /58 /101 robot |`8d694829bc8819624e8a40b882ad912e2092f8bb2739db6efb733e2a72a71e7a` |
| [Packages][packages] |5 /3 /8 sample |`c5418a2f74eb65e0a11b9c03724244fa8d97442e37a1d417934c2afcb76ee705` |

Robot steps map to PDF `step+3`, Base and Packages to `step+2`. Stable per-instance IDs are the research IDs, including historical descriptors corrected by contextual `partKey`: **Basep24/step22 `base2019:peg-black-friction:19` and `:20` are genuine black6628 towball pins, not2780**. Their IDs, source pages and one-time installations are unchanged; Base now accounts for30 plain friction pins and4 towball pins. Every instance has one installation milestone; no assembly merge recounts units. Motors, sensor and prepared hub count as devices, not their internal colored submeshes. Robot p3 removable-battery preparation is outside the158 numbered robot units.

Timeline order is Robot1–19, Base1–57, Packages1–3, then Base58. This is the actual dependency implied by Basep60: place the **already built** two package samples on the side pedestals. Base58 introduces zero units. Packages' three numbered instructions are not merged with Base58 and do not create a second copy of the eight sample parts. Source book numbers/pages remain unchanged despite this dependency ordering.

The2021 Robot18/156-robot-unit alternative is not mixed into this model. In particular the two canonical knobbed pins at Robot2019 step7/p10 remain present.

## Per-family provenance and authentic geometry

R/B/P quantities below are separate Robot/Base/Packages prepared-callout counts. A DAT basename is a licensed community geometry identifier, **not a certified manufacturer element/SKU**. No `partNumber` is invented. Material shades and historical mold variants remain uncertified.

| Research family | DAT / palette | R / B / P | Source addition PDF pages |
|---|---|---:|---|
|hub |45601c01 / white+fixed colors |1/0/0 |R4 |
|peg-black-friction |2780 / black |18/30/0 |R4,6,7,9,13; B3,4,11,14,15,18,28,31,35,39,43,50,54 |
|panel-yellow-11x19 |39369 / yellow |1/0/0 |R5 |
|peg-tan-axle |3749 / tan |5/6/0 |R6,21; B27,30,33,37 |
|clip-red |49283 / red |1/0/0 |R6 |
|frame-azure-11x15 |39790 / medium azure |1/0/0 |R8 |
|frame-magenta-7x11 |39794 / magenta |2/0/0 |R8 |
|beam-yellow-3 |32523 / yellow |2/0/0 |R9 |
|peg-black-knob |6628 / black, towball |2/4/0 |R10; B24,52,56 |
|motor-large |54675 / white+fixed colors |1/0/0 |R11 |
|connector-gray-3-four-snaps |48989 / light bluish gray |6/2/0 |R11,19,20; B20 |
|angular-azure-3x5 |32526 / medium azure |2/2/0 |R12; B34,38 |
|biscuit-magenta |39793 / magenta |1/4/0 |R14; B17,19,44 |
|peg-blue-3-friction |6558 / blue |6/2/0 |R15,17; B28,31 |
|beam-magenta-5 |32316 / magenta |2/2/0 |R17; B14 |
|iframe-gray-3x5 |14720 / light bluish gray |2/0/0 |R18 |
|biscuit-black |39793 / black |4/0/0 |R20,21 |
|tbeam-black-3x3 |60484 / black |0/2/0 |B3,4 |
|motor-medium |54696p01 / white+fixed colors |0/1/0 |B5 |
|frame-black-5x7 |64179 / black |0/2/0 |B6,9 |
|peg-gray |3673 / light bluish gray |0/6/0 |B7,10 |
|axle-yellow-7 |44294 / yellow |0/1/0 |B13 |
|axle-gray-5 |32073 / light bluish gray |0/1/0 |B13 |
|gear-gray-28 |46372 / light bluish gray |0/1/0 |B17 |
|beam-azure-13 |41239 / medium azure |0/1/0 |B18 |
|beam-azure-7 |32524 / medium azure |0/2/0 |B21,22 |
|beam-azure-2-cross |60483 / medium azure |0/2/0 |B23 |
|rod-gray-6 |2739a / **black** |0/2/0 |B25 |
|angular-yellow-2x4 |32140 / yellow |0/2/0 |B27,30 |
|double-cross-block-light |32184 / **white** |0/4/0 |B33,37,49 |
|beam-magenta-11 |32525 / magenta |0/1/0 |B41 |
|beam-black-15 |32278 / black |0/2/0 |B42 |
|color-sensor |37308 / white+fixed colors |0/1/0 |B44 |
|plate-round-azure-2x2 |4032a / medium azure |0/2/0 |B45 |
|dish-transparent-6x6 |44375b / transparent clear |0/2/0 |B46 |
|tile-round-black-2x2 |15535 / black, through-hole |0/2/0 |B47 |
|axle-black-2-snap |18651 / black,2L axle+1L pin |0/4/0 |B49,51,55 |
|axle-red-2 |32062 / red |0/2/0 |B50,54 |
|angular-yellow-3x7 |32271 / yellow |0/2/0 |B50,54 |
|angle-black-180 |32034 / black |0/2/0 |B51,55 |
|panel-azure-3x11x2 |11954 / medium azure |0/2/0 |B52,56 |
|gear-gray-36 |32498 / **black** |0/0/2 |P3 |
|axle-yellow-3 |4519 / yellow |0/0/2 |P4 |
|brick-yellow-2x4-cross |39789 / yellow,3 vertical axle holes |0/0/2 |P5 |
|brick-magenta-2x4-cross |39789 / magenta,3 vertical axle holes |0/0/2 |P5 |

Assets come only from `geometryAssetsFor` and the generated licensed component library. `sourceDocumentsFor` includes the actual selected roots and palette sources, with original attribution and full hashes. No robot is replaced with primitive proxy geometry. The single gray46372 drive z28 is distinct from the two black32498 z36 sample feet. There is no second sorter transmission gear to justify a reduction ratio. The old48989 mold is a provisional source-shape match, not a certified historical65489 equivalent.

## Coordinates, actual native features and placement evidence

Unchanged library geometry receives `N = Rx(pi) ×0.4mm/LDU` once. Component placement is `N Tnative N^-1`; every authored pose is right-handed,+Y up, scale1. No centering or per-part rescaling is performed. The reconstructed platform39369 native origin is the model's initial reference frame. World placement is diagram-derived, **not acquired complete assembly CAD**. Assembly work-area offsets, inventory spacing and timing are app-authored presentation data.

| Critical component | Independently readable native DAT feature | Model interpretation / status |
|---|---|---|
|54675 large motor |Rotor `parts/u9363.dat` at `(0,-50,0)` LDU |Yaw pivot scene `(0,36,-32)` mm; body remains fixed, authentic internal rotor rotates. Global motor placement unchecked. |
|54696p01 medium motor |Rotor `parts/u9363p01.dat` at `(0,-50,0)` |Native body basis maps X→Z,Y→X,Z→Y, standing motor upright; transverse output pivot scene `(-20,124,-32)` mm. Global motor placement unchecked. |
|44294/32073 |Axles along nativeX, lengths140/100 LDU |Opposite real shaft extensions through the same motor axis; tips enter rather than float off the housing. |
|46372 z28 |Axle through nativeZ; eccentric round holes `(±20,0,0)`, `(0,±20,0)` |NativeZ is rotated onto the motor's transverseX axis. Gear eccentric pin mating is **not equivalent to a proven transmission loop**. |
|32140 yellow2×4 |Axle hole `(0,0,0)`; round long-arm holes z20,40,60; short-end round hole `(20,0,60)`; axesY |Sourcep27 tan axle enters lower cross; p28/p31 blackz20 and bluez60 mount directly to black15L mast, **not** white F-bearing support cage. Its unloaded passive motion is not simulated. |
|32184 white |Outer crosses `(0,±20,0)`, axesX; central **round** passage axisZ |Two upper white parts receive F-shaft and azure L/tan pairs; two front white parts are fork adapters. Their distinct native frames are nominally registered; no erroneous F key or forward fake hinge. |
|32526 azure3×5 |Long-arm holes `(0,0,0..80)` and short leg `(20,0,80)`, `(40,0,80)`; axesY |Both upper L parts enter one11L bar through all four black pins, independently of the yellow/black mast. |
|2739a rod /6628 towball |Towball sockets `(0,0,0)` and `(0,0,100)`; sphere center `(-10,0,0)` radius8LDU |Each distinct spherical link meets its actual crank and fork-panel sphere at the nominal reference pose,40mm span; p25 link transfers as its own body. Two lengths alone do not solve three passive angles. |
|32498 sample gear |NativeZ axle, outer nativeY±20 crosses, faces z±10; genuine z36 teeth |Horizontal with both genuine exposed pedestal axles seated in outer gear crosses and a separate central package axle; source contact through yaw not validated. |
|39789 brick |Three vertical axle crosses nativeX−20,0,+20; body bottom y24; stud plane y0 |Both same-color bricks stack at24LDU pitch, rotated to match **all three** gear cross rows from Packagesp5, not merely central shaft. |
|64179 frame |Native slab y±10; through-hole grid x±40,z±60/20 |Lower/upper frame stack and B2p58 yaw mounting still need independently fitted seating comparison. |
|11954 fork panel |Authentic side/front hole sets and native origin retained |Two distinct source panels/prongs. No extra opening DOF; exact actual support contact surface not certified. |

`addMate` records inspectable source-local frames for motor outputs, z28 and sample stacks. Electrical endpoints retain the actual device cable-stub origins and hub socket locations. The three captive cable routes correspond to A/F/D and are outside extra inventory; the intermediate cable bend is an openly diagram-derived presentation route, not a measured collision envelope.

Operation structure uses the existing shared assembly engine: each instance approaches individually from the visible inventory; pin/axle operations have a separate axial phase; prepared modules move as root subassemblies and are reparented continuously. Source assembly-only steps are real module merges, not empty fabricated views. B2p58 moves the whole101-unit moving arm onto Book1's yaw output. B2p59 routes/connects the existing captive devices using the p61 wiring reference. Source step IDs and numbered page mappings stay synchronized.

Initial inventory uses the measured canonical geometry bounds from `component-bounds.json`, checked against each actual geometry SHA. Identity-rotation inventory rows have12mm gaps and a5mm floor clearance; the original native geometry origins are preserved, not recentered. The permanent inventory check independently checks all pairwise X/Z bounds for overlap.

### Native source fit — reconstructed nominal graph, unresolved powered linkage

The [canonical Base PDF][base] pp18–57, Robotpp19–22 and Packagespp3–5 were compared with the actual native DAT feature frames. Independent regression checks now sample the completed assembly engine's world poses. Earlier axial/off-axis and wrong-body discrepancies are retained with before/after numerical evidence in [the linkage reconstruction report](../research/sorter-linkage-resolution.md), not used as current scene coordinates.

| Manual operation | Checked native assembly relationship | Remaining limit |
|---|---|---|
| Robotp22 pedestals, Packagesp5, Basep60 | Each H frame receives two blue pins via a5L beam into the **outer short rail**; two exposed tan axles enter the gear's outer crosses; both stacked bricks align all three genuine cross rows on each of two independent removable samples | Source sample transfer from pedestal into gripper still unproved |
| Basepp18–26 carrier/F drive | Unequal genuine F shaft ends, installed z28, keyed60483 eccentric spheres, round rear7L bearings, actual48989 four-pin seat and both40mm independent2739 links close in the nominal frame | Motor phase/sign, dynamic rod and passive bearing branch unregistered |
| Basepp27–44 support/sensor | Yellow32140–black15L direct mast mount, F-shaft round white cage, tan-to-azure L seats, all four pins into **one**11L bar and original color sensor D pins match native feature rows | Support frame's0.4mm candidate body-shell gap is **not** a demonstrated carrier stop |
| Basepp49–57 fork/panels | White fork adapters sit below13L and extend **forward**; first18651 enters a round carrier bearing, second18651 keys white–yellow; inward32034 caps, panel's native front receiver rows and two real terminal spheres meet rod sockets | Actual finite cap/panel lip/package contact and load-selected swivel remain unproved |

All source instances retain their IDs,158 robot +8 removable sample counts, and80 numbered pages. Native feature coincidence is only a **nominal source-fit result**, not whole-scene clearance certification or published exact CAD. The two40mm spherical rods impose only two equations on carrier pitch and left/right fork swivel, leaving one passive coordinate unselected until a real active material stop/contact equation and phase/sign are registered. No guessed drive ratio, symmetry constraint or scripted contact is enabled; `fit: unchecked` is retained for all166 placements.

**Additional primary motion evidence:** the [official lesson's physical demonstration][lesson] (22.2s,1920×1080,25FPS, private video SHA-256 `0061183eba0da8ba30a35c751447f6ecf3b52e62b6357732446073034d26892b`) was inspected at5,8,8.5,9,10,12,14 and17s. The yellow package leaves its pedestal as the carrier rises; at10–12s the rejected package lies beside the robot while the magenta package remains on its pedestal. These uncalibrated views establish **close–lift–eject**, not uninterrupted grip through yaw, instantaneous passive coordinates or a contact law. The separate delivery cart in the same lesson is **not part of the selected Sorter**. Media and source-page captures remain private; only links to LEGO documentation are published.

Primary native-feature references: [6628 towball](https://library.ldraw.org/library/official/parts/6628.dat), [2739a steering link](https://library.ldraw.org/library/official/parts/2739a.dat), [2739a socket subpart](https://library.ldraw.org/library/official/parts/s/2739as01.dat), [60483 crank](https://library.ldraw.org/library/official/parts/60483.dat), [32184 perpendicular block](https://library.ldraw.org/library/official/parts/32184.dat), and [32271 bent fork bracket](https://library.ldraw.org/library/official/parts/32271.dat).

**Remaining mechanical prerequisite:** identify the real active stop or finite package-contact facet and its nonpenetrating transition, then register the source F encoder phase/sign and an A-yaw capture-to-delivery path. The physical example records a yellow pickup and later ejection beside the robot, **not** certified uninterrupted held transport; the Python p13 magenta accepted-bin branch is distinct. Do not declare sorting acceptance from a static40mm rod span or from the source-command replay alone.

The official Python p13 commands F240/F25/F235 and three−100°/+100° shake pairs. In the existing shortest-path unwrapped replay, the continuous input interval to prove is **F∈[−125°,25°]**, including startup0→−120°,25°→−125°, and shake25°↔−75°. B5 supplies a visible rotor/body alignment datum, but its phase to the reconstructed crank/socket branch has not been established; no angle multiplier or encoder offset is invented. A continuous valid branch over that interval has **not** been derived.

Two true prong/32498 gear-base contact sites, their pickup/drop world path and a physical D sensor intersection remain unestablished. Robotp22/Basep60 confirm two side pedestals, not a conveyor; the source Python accepts magenta and shakes off other colors. The current staged D values remain scripted inputs rather than a geometry-derived color decision. **Pickup stays disabled and the full-cycle acceptance test stays explicitly skipped.**

## Source program distinctions

[Official Python p13][python], SHA-256 `e03ddef0538aa6dce8894281d742b953945d6a30bd2cbc2156dc9dc71bb621ce`, and [official SVG][blocks], SHA-256 `64bf575bec6b8838410d4490a9cd934b828137186a45054a520f0f14149a71a2`, are separate source documents in the model registry.

Both source logs retain A0→F240→A90→F25→check, then A0→F240→A270→F25→check. Each check raises F235, waits4s and samples D. Magenta uses A0/F25/Triumph/F240; the other branch lowers F25 and shakes three−100°/+100° pairs. Python ends A0 then F240; SVG ends F240 then A0. Absolute encoder positions use shortest-path equivalents; negative unwrapped coordinates are not invented physical hard stops.

The Python rate250°/s and shake1000°/s are source values. SVG25% is **not** asserted equivalent to250°/s: that playback mapping is labeled app-authored. Sound lengths are presentation dwell intervals, not measured audio durations or redistributed LEGO audio. The staged magenta/yellow color reads are explicit RoboBuild scripted inputs, not an optical classifier. Both original packages stay on their pedestals because actual capture is disabled.

## Permanent checks and parent verification

`tests/unit/package-sorter.test.ts` independently transcribes45 source-family rows and exact Robot/Base/Packages counts; checks all80 PDF step/page mappings, one-time installation, 158+8 scope and reversible arbitrary-time transforms. Six new native-feature regressions sample the **assembly engine's world-frame consumer**: outer short-rail pedestals with removable samples; keyed F crank and asymmetric shaft/gear/cap stack; real biscuit-to-four-pin-to-7L carrier; common white/L-to-11L cage; direct yellow/black sensor mast and fixed rails; forward keyed fork, inward tip, panel receiver row and bilateral genuine40mm spherical rod closure. Three package cross rows and p25 independent rod-body transfer are checked, not merely center markers. The motor replay regression proves only A/F output movement; it does **not** pass the separate skipped nonlinear pickup/routing acceptance.

The full-cycle test remains explicitly skipped: two source100-LDU spherical links constrain three passive angles; a registered active material stop/contact, source F phase/sign and finite3D capture/release are missing. Fresh parent gates passed `npm run models:build` (four models; Sorter166 tracked units,80/80 steps), `npm run check` (**876 files, zero errors/warnings**), `npm run test:unit` (**64 passed, zero failed, one Sorter complete-cycle skip**), production `npm run build` and `env -u CI npm run test:e2e` (**23/23 real Chromium cases in5.3min**). Direct current WebGL inspection showed progressive Robotp22, final Basep60, technical and exploded renders, and source A/F replay with packages still on their original pedestals. **Whole-build manual fit, unintended non-contact intersections, dynamic cable clearance, calibrated explosion, continuous capture/release and separate physical accepted/rejected outputs remain unverified.** No source-accurate sorting acceptance pass is claimed.

[robot]: https://assets.education.lego.com/v3/assets/blt293eea581807678a/bltebfffd33fc0a5e72/5f8802a1bc43790f5c4389f2/automate-it-bi-pdf-book1of3.pdf?locale=en-us
[lesson]: https://education.lego.com/en-us/lessons/prime-kickstart-a-business/automate-it/
[base]: https://assets.education.lego.com/v3/assets/blt293eea581807678a/blte262c4974fee83b0/5f8802a3ed5ccb12e4342dac/automate-it-bi-pdf-book2of3.pdf?locale=en-us
[packages]: https://assets.education.lego.com/v3/assets/blt293eea581807678a/blt2cb1e769ec72a3d7/5f88022d6c54ba0f72c2081a/automate-it-bi-pdf-book3of3.pdf?locale=en-us
[python]: https://assets.education.lego.com/v3/assets/blt293eea581807678a/blt02bcbffa2bf460b5/65df44a50f1d35dffdca4995/EN-US-SPIKE-Prime-Python-Programs_Feb-2024.pdf?locale=en-us
[blocks]: https://assets.education.lego.com/v3/assets/blt293eea581807678a/blt2c8acc9f40bbf081/633b2bbfcba38f4c5f6a947a/spike_kickstart_your_business_automate_it_teacher_solution_en.svg?locale=en-us
