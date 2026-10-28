# Package Sorter — canonical2019 reconstruction and validation

## Acceptance status

**Not acceptance-complete. Functional package pickup/sorting is blocked.** The source-backed inventory and80 numbered instructions are authored; a real Chrome visit displayed its assembled model and both Python/SVG source-command variants, **but no independent browser-to-manual fit comparison** has been performed. All166 assembled placements remain `fit: unchecked`. The available scenarios are explicitly titled **source motor replay — pickup disabled**; they are not advertised as working sorting cycles.

The model is `packageSorter` in `src/lib/models/package-sorter.ts`, ID `package-sorter`. Only these source-supported powered axes are active: A whole-arm yaw, F the actual medium-motor output shafts/z28/dishes. No guessed passive fork joint, fake independent gripper, conveyor, made-up transmission ratio, package teleport, or synthetic catch contact is enabled.

| Coverage | Authored | Independently verified in this task |
|---|---:|---:|
| Canonical numbered instructions |80 =19 Robot +58 Base +3 Packages |0 |
| Robot prepared-callout instances |158 =57 Robot +101 Base |0 assembled fits |
| Separately attributed source package instances |8 |0 assembled fits |
| Geometry |Genuine licensed native-origin LDraw components |No independent scene fit validation |
| Powered axes |2 actual motor-output pivots |Browser command replay exercised; actual physical fork motion/fit unverified |
| Nonlinear compound linkage |Disabled, unresolved hole indexing |0 |
| Capture/release and distinct delivery |Disabled, explicitly skipped acceptance test |0 |

Parent integration exercised strict manifest build, `npm run check`, the unit suite, and Chrome `additional-robots.spec.ts` (3/3 across additional robots); the authoring-only note is superseded. The permanent `tests/unit/package-sorter.test.ts` **skips the unresolved full-cycle pickup test explicitly**; no green sorting acceptance is implied.

Original Chromium WebGL captures at1512×982 cover the source timeline below. They demonstrate renderer/transport states, **not** correct fork contacts, nonlinear closure or an actual delivered package:

| State | Installed robot units; source steps | Live capture |
|---|---|---|
| Staged inventory |0/158;0/80 |[Inventory](screenshots/sorter-source-inventory.png) |
| Robot19 + Base11 assembled |78/158;30/80 |[Base](screenshots/sorter-source-base-seated.png) |
| Base53 approach, 55%, geometry unverified |155/158;71/80 |[Fork approach](screenshots/sorter-source-fork-approach-unverified.png) |
| Final authored state;8 separate samples also installed |158/158;80/80 |[Unverified final assembly](screenshots/sorter-source-final-unverified.png) |
| Same endpoint, technical mode |158/158;80/80 |[Technical](screenshots/sorter-source-technical.png) |
| Same endpoint, exploded presentation |158/158;80/80 |[Exploded](screenshots/sorter-source-exploded.png) |
| Source commands at6s, **pickup disabled** |158/158;80/80 |[Motor replay only](screenshots/sorter-source-command-replay-only.png) |

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
|32140 yellow2×4 |Axle hole `(0,0,0)`; round long-arm holes z20,40,60; short-end round hole `(20,0,60)`; all axesY |Sourcep27 tan pin enters the lower cross-hole; enlarged p28/p31 show black pin at z20 and blue pin at the long-arm corner z60, leaving the short-end round hole empty. Operating branch unresolved. |
|32184 white |Outer axle passages centered `(0,±20,0)`, axesX; central round passage axisZ |Not three parallel round holes. Native geometry prevents treating it as a generic three-hole beam. Its compound coupler indexing remains unchecked. |
|32526 azure3×5 |Round centers `(0,0,0..80)`, `(20,0,80)`, `(40,0,80)`; axisY |Sourcep36 upper connection and lower short leg must be fitted jointly with32140/32184. No arbitrary passive fork angle is enabled. |
|2739a rod /6628 towball |Towball-socket centers `(0,0,0)`, `(0,0,100)`; sphere center `(-10,0,0)`, radius8LDU |Fixed100LDU =40mm center span. Sourcep24 towballs and p25 rod sockets are now correctly identified; socket aperture is nativeY, not an ordinary2780 cylindrical pin joint. Type1/Type2 historical mold and assembled fit remain provisional. |
|32498 sample gear |NativeZ axle, faces z±10; true z36 teeth |Rotated horizontal, distinct from the z28; no wheel/drivetrain binding. |
|39789 brick |Three vertical axle holes at x−20,0,+20; body bottom y24; stud plane y0 |Two same-color bricks stack at24LDU pitch over the same source3L axle. Their hole axes remain vertical, not incorrectly horizontal. |
|64179 frame |Native slab y±10; through-hole grid x±40,z±60/20 |Lower/upper frame stack and B2p58 yaw mounting still need independently fitted seating comparison. |
|11954 fork panel |Authentic side/front hole sets and native origin retained |Two distinct source panels/prongs. No extra opening DOF; exact actual support contact surface not certified. |

`addMate` records inspectable source-local frames for motor outputs, z28 and sample stacks. Electrical endpoints retain the actual device cable-stub origins and hub socket locations. The three captive cable routes correspond to A/F/D and are outside extra inventory; the intermediate cable bend is an openly diagram-derived presentation route, not a measured collision envelope.

Operation structure uses the existing shared assembly engine: each instance approaches individually from the visible inventory; pin/axle operations have a separate axial phase; prepared modules move as root subassemblies and are reparented continuously. Source assembly-only steps are real module merges, not empty fabricated views. B2p58 moves the whole101-unit moving arm onto Book1's yaw output. B2p59 routes/connects the existing captive devices using the p61 wiring reference. Source step IDs and numbered page mappings stay synchronized.

Initial inventory uses the measured canonical geometry bounds from `component-bounds.json`, checked against each actual geometry SHA. Identity-rotation inventory rows have12mm gaps and a5mm floor clearance; the original native geometry origins are preserved, not recentered. The permanent inventory check independently checks all pairwise X/Z bounds for overlap.

### Explicit geometric evidence — corrected input seats, unresolved complete linkage

Directly inspected the **[canonical2019 Base PDF][base]**, including enlarged pp25,27,32,36,40,49,53,57; pp5,24,26,28,31,33–35,39,50–52,56 resolve additional local details. Robotpp11,21,22 and Basepp58,60 establish the platform motor, side pedestals and reused samples. Originals and existing figure renders remain private in `.research-cache/package-sorter/`; no source imagery was copied into app assets or this document.

| Canonical figure evidence | Established feature / exact remaining registration |
|---|---|
|B24 step22, top-left2x callout; B25 step23, both rod ends on the prepared2L connectors |Both heads are spheres, identical to B52/B56 callouts. These are6628, not2780. Native `6628.dat:23` places an8LDU sphere at `(-10,0,0)`; `2739a.dat:19–20` repeats towball socket `s/2739as01.dat` at z0/100. Historical IDs19/20 now resolve through the corrected research family, with no global alias and no extra units. |
|B26 step24, arrow to the2L connector over the protruding yellow shaft |The60483 cross passage `(0,0,0)`, axisY, must be coaxial with the actual F shaft; round passage `(0,0,20)` carries the p24 towball. This establishes a one-stud crank arm, not a guessed gear reduction. Source shaft phase still needs registration to B5's aligned rotor/body marks. |
|B27/28 and B30/31, prepared mirrored yellow connectors; B32 step30 |32140 tan axle at `(0,0,0)`, black pin at `(0,0,20)`, blue pin at `(0,0,60)`; the extra short-end hole `(20,0,60)` remains empty. The earlier “blue pin at the short end” interpretation was incorrect. Which pictured motor/body holes receive each prepared yellow connector still needs full native-frame seating. |
|B33 step31 and B34/35; B36 step34 and B40 step38 |White32184 outer axle axesX at `(0,±20,0)` carry the two tan pins into azure32526 long-arm holes `(0,0,0)` and `(0,0,40)`, axesY; its central round passage is **perpendicular**, axisZ. Which white outer sign maps to azure z0 versus z40, and the yellow blue-pin/white central-passage world frame, remain unresolved together. This is not a generic parallel-axis three-hole link. |
|B49 step47, downward18651 insertion; B50/51 prepared yellow fork bracket |The seven-beam end, white32184 outer axle passage and18651 must be registered together. Native32524 end holes are `(0,0,±60)`, axesY; native32184 outer passages are `(0,±20,0)`, axesX. Exact end/sign and which white outer passage receives the source axle remain unresolved. Native32271 has long-end cross `(0,0,0)`, bend round `(0,0,120)`, and short-end cross `(32,0,144)`, all axesY—not a rectangular3×7 grid. |
|B52/B56 towball insertion; B53 step51/B57 step55 red circles |Two genuine11954 panels/prongs, each with a6628 towball and its own rod hookup. The pictured terminal hole must be registered to the panel's nativeY passages `(0,0,±80)` and mirrored native orientation, jointly with the32271/18651 seats. The circles show rod hookup, **not** gear-base pickup contacts. |

Before the crank-seat correction below, the authoring was geometrically red **before moving F**. These historical coordinates were calculated from the then-authored native poses with the unchanged `Rx(pi) ×0.4` conversion; they are model registrations, **not measured positions of the real build**. Axes are scene unit directions; an axis sign is immaterial for coaxiality.

| Before-correction model feature | World mm / axis | Failure against source relationship |
|---|---|---|
|F output axis |Through `(-20,124,-32)`, axisX |Both shaft extensions share y124,z−32. |
|60483 left cross / round |`(-32,132,-32)` / `(-24,132,-32)`, both axisZ |Cross axis is perpendicular to F and8mm off its line. The authored round-hole direction is not the source1L crank plane. |
|60483 right cross / round |`(32,132,-32)` / `(40,132,-32)`, both axisZ |Same perpendicular/off-axis failure; merely making the groups dependent on F cannot seat these parts. |
|2739a left / right socket centers |Left `(-40,132,-72)`→`(-40,132,-32)`; right `(40,132,-72)`→`(40,132,-32)` |Each real rod preserves40mm length, but this is not proof either end sits on its source towball. Socket apertures currently point alongY. |
|Corrected p24 left / right6628 sphere centers |`(-40,132,-32)` / `(32,132,-32)` |Left happens to coincide with one rod socket; right is8mm away. Neither establishes the60483 round-hole/shaft registration. |
|Panel left / right6628 sphere centers |`(-48,140,-72)` / `(48,140,-72)` |Each is `sqrt(8²+8²) ≈11.314mm` from the corresponding free rod socket. No endpoint relocation or attachment event hides this residual. |

The native ball/socket feature frames are now exposed as inspectable `surface` connection points on the actual parts. They remain `fit: unchecked`; no fake assembled mate, bilateral closure or contact constraint is inferred from their existence. Corrected source-family totals are48 genuine2780 plus6 genuine6628 across the robot; the158 robot/8 sample identities and80 steps remain unchanged.

**Input-seat correction:** B2p26's two60483 cross bores are now on the actual F shaft line, with nativeY—not nativeZ—mapped to the shaft axis. Native centers changed to `(±80,−310,80)LDU`; the pictured round ends remain above the cross ends. The second p24 towball is properly mirrored, so both true sphere centers meet their prepared rod's z100 socket. The actual-model diagnostic failed before with8mm off-axis/perpendicular holes and now reports0mm shaft-line residual, axis alignment1 and both sphere/socket residuals below`8e−15mm`. The permanent regression samples the final assembly consumer, not just authored constants. Axial seat depth, whole fork mounting and moving closure are still not certified; input-seat coincidence alone is not a functioning sorter.

**Additional primary motion evidence:** the official lesson's public22.2s “Kickstart a Business — Automate it” video was inspected privately at5,8,8.5,9,10,12,14 and17s. [Official embed](https://legoeducation.23video.com/v.ihtml/player.html?token=21b5ab59bca51d34499dca3e0aaf2908&source=embed&photo_id=51455084), public1080p playback bytes`3884761`, SHA-256`0061183eba0da8ba30a35c751447f6ecf3b52e62b6357732446073034d26892b`. Media remains only at `.research-cache/package-sorter/official-mechanism-2019.mp4`; it is not redistributed. The carrier and prongs visibly rise and return while the rear sensor mast remains upright, and a rejected sample drops beside its pedestal. These views establish qualitative motion, not calibrated joint coordinates, instantaneous rod lengths, complete bearing ownership or a physical contact model. The separate delivery cart shown in the same video is **not part of this selected Sorter** and is not added to its inventory.

Primary native-feature references: [6628 towball](https://library.ldraw.org/library/official/parts/6628.dat), [2739a steering link](https://library.ldraw.org/library/official/parts/2739a.dat), [2739a socket subpart](https://library.ldraw.org/library/official/parts/s/2739as01.dat), [60483 crank](https://library.ldraw.org/library/official/parts/60483.dat), [32184 perpendicular block](https://library.ldraw.org/library/official/parts/32184.dat), and [32271 bent fork bracket](https://library.ldraw.org/library/official/parts/32271.dat).

**Remaining unresolved assignment:** register the32140 tan/body seats and blue-pin/32184 central passages while respecting perpendicular outer axes; identify the32524 end/32184 outer axle sign and32271/18651 fork seats; then map each panel's terminal towball hole and rod free socket. Establish carrier-versus-prong bearing ownership from the source and solve the coupled moving branch. The corrected60483/F and prepared ball/socket seats above must be preserved; remaining choices must solve simultaneously, not be selected independently to fit a convenient planar four-bar.

The official Python p13 commands F240/F25/F235 and three−100°/+100° shake pairs. In the existing shortest-path unwrapped replay, the continuous input interval to prove is **F∈[−125°,25°]**, including startup0→−120°,25°→−125°, and shake25°↔−75°. B5 supplies a visible rotor/body alignment datum, but its phase to the reconstructed crank/socket branch has not been established; no angle multiplier or encoder offset is invented. A continuous valid branch over that interval has **not** been derived.

Two true prong/32498 gear-base contact sites, their pickup/drop world path and a physical D sensor intersection remain unestablished. Robotp22/Basep60 confirm two side pedestals, not a conveyor; the source Python accepts magenta and shakes off other colors. The current staged D values remain scripted inputs rather than a geometry-derived color decision. **Pickup stays disabled and the full-cycle acceptance test stays explicitly skipped.**

## Source program distinctions

[Official Python p13][python], SHA-256 `e03ddef0538aa6dce8894281d742b953945d6a30bd2cbc2156dc9dc71bb621ce`, and [official SVG][blocks], SHA-256 `64bf575bec6b8838410d4490a9cd934b828137186a45054a520f0f14149a71a2`, are separate source documents in the model registry.

Both source logs retain A0→F240→A90→F25→check, then A0→F240→A270→F25→check. Each check raises F235, waits4s and samples D. Magenta uses A0/F25/Triumph/F240; the other branch lowers F25 and shakes three−100°/+100° pairs. Python ends A0 then F240; SVG ends F240 then A0. Absolute encoder positions use shortest-path equivalents; negative unwrapped coordinates are not invented physical hard stops.

The Python rate250°/s and shake1000°/s are source values. SVG25% is **not** asserted equivalent to250°/s: that playback mapping is labeled app-authored. Sound lengths are presentation dwell intervals, not measured audio durations or redistributed LEGO audio. The staged magenta/yellow color reads are explicit RoboBuild scripted inputs, not an optical classifier. Both original packages stay on their pedestals because actual capture is disabled.

## Permanent checks and parent verification

Runnable tests independently transcribe all45 family rows and R/B/P quantities, including the two p24 stable-ID exceptions and corrected30/4 Base pin-family accounting; check authentic DAT and palette identities, source pages, exact one-time introductions, installation milestones, the101-unit whole-arm merge, initial whole inventory visibility and deterministic arbitrary-time sampling. A dedicated behavioral regression requires those exact p24 IDs to be black6628 towballs with native sphere-center frames, real2739a socket-center frames and40mm fixed span, preserving their original source installation and unchecked assembled-fit flags. Native-frame tests also cover both real motor pivots, opposite axial seats, the z28's nativeZ axis and39789 sample stacking. Program checks independently assert the magenta/reject command outputs and Python/SVG final-order distinction. Replay checks prove only supported output motion; they do not call a static fork a successful pickup.

The source full-cycle/nonlinear-closure/two-contact delivery test remains explicitly skipped with its precise blocker. Final parent integration passed `npm run models:build` (166 tracked units,80/80 steps), `npm run check` (871 files, zero errors/warnings), `npm run test:unit` (52 passed, one Sorter pickup acceptance skipped), static production build and `env -u CI npm run test:e2e` (18/18 real Chromium cases). Source-program replay and the complete source-state screenshot set were exercised without claiming real package contact. **Full manual-to-WebGL fit, unintended intersections, hole alignment, cable envelopes, calibrated explosion, continuous capture/release and distinct physical outputs remain unverified.** No source-accurate sorting acceptance pass is claimed.

[robot]: https://assets.education.lego.com/v3/assets/blt293eea581807678a/bltebfffd33fc0a5e72/5f8802a1bc43790f5c4389f2/automate-it-bi-pdf-book1of3.pdf?locale=en-us
[base]: https://assets.education.lego.com/v3/assets/blt293eea581807678a/blte262c4974fee83b0/5f8802a3ed5ccb12e4342dac/automate-it-bi-pdf-book2of3.pdf?locale=en-us
[packages]: https://assets.education.lego.com/v3/assets/blt293eea581807678a/blt2cb1e769ec72a3d7/5f88022d6c54ba0f72c2081a/automate-it-bi-pdf-book3of3.pdf?locale=en-us
[python]: https://assets.education.lego.com/v3/assets/blt293eea581807678a/blt02bcbffa2bf460b5/65df44a50f1d35dffdca4995/EN-US-SPIKE-Prime-Python-Programs_Feb-2024.pdf?locale=en-us
[blocks]: https://assets.education.lego.com/v3/assets/blt293eea581807678a/blt2c8acc9f40bbf081/633b2bbfcba38f4c5f6a947a/spike_kickstart_your_business_automate_it_teacher_solution_en.svg?locale=en-us
