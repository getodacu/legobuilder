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

Original Chrome source-stage captures: [Base 53 mirrored fork bracket, 154/158 robot units, fit unverified](screenshots/package-sorter-fork-unverified.webp), and [assembled Python source-command replay at 6.0 s, pickup disabled](screenshots/package-sorter-source-replay-no-pickup.webp). No image is offered as evidence of correct fork contact or an actual delivered package.

## Locked source edition and accounting

Authoritative transcription: [`../research/data/package-sorter.json`](../research/data/package-sorter.json). Contextual identities: [`../research/data/lego-part-crosswalk.json`](../research/data/lego-part-crosswalk.json). Original PDFs/page renders remain private under `.research-cache/package-sorter/`; none is copied into public assets.

| Document | Pages / numbered steps / prepared units | SHA-256 |
|---|---|---|
| [Robot2019][robot] |22 /19 /57 robot |`7db26cbedb1242a818c9f60fb0b299d90ac5a82eb24f26bf6657d1a58e813eae` |
| [Base2019][base] |61 /58 /101 robot |`8d694829bc8819624e8a40b882ad912e2092f8bb2739db6efb733e2a72a71e7a` |
| [Packages][packages] |5 /3 /8 sample |`c5418a2f74eb65e0a11b9c03724244fa8d97442e37a1d417934c2afcb76ee705` |

Robot steps map to PDF `step+3`, Base and Packages to `step+2`. Stable per-instance IDs are the research IDs, including their original family keys even when a key's color description was corrected. Every instance has one installation milestone; no assembly merge recounts units. Motors, sensor and prepared hub count as devices, not their internal colored submeshes. Robot p3 removable-battery preparation is outside the158 numbered robot units.

Timeline order is Robot1–19, Base1–57, Packages1–3, then Base58. This is the actual dependency implied by Basep60: place the **already built** two package samples on the side pedestals. Base58 introduces zero units. Packages' three numbered instructions are not merged with Base58 and do not create a second copy of the eight sample parts. Source book numbers/pages remain unchanged despite this dependency ordering.

The2021 Robot18/156-robot-unit alternative is not mixed into this model. In particular the two canonical knobbed pins at Robot2019 step7/p10 remain present.

## Per-family provenance and authentic geometry

R/B/P quantities below are separate Robot/Base/Packages prepared-callout counts. A DAT basename is a licensed community geometry identifier, **not a certified manufacturer element/SKU**. No `partNumber` is invented. Material shades and historical mold variants remain uncertified.

| Research family | DAT / palette | R / B / P | Source addition PDF pages |
|---|---|---:|---|
|hub |45601c01 / white+fixed colors |1/0/0 |R4 |
|peg-black-friction |2780 / black |18/32/0 |R4,6,7,9,13; B3,4,11,14,15,18,24,28,31,35,39,43,50,54 |
|panel-yellow-11x19 |39369 / yellow |1/0/0 |R5 |
|peg-tan-axle |3749 / tan |5/6/0 |R6,21; B27,30,33,37 |
|clip-red |49283 / red |1/0/0 |R6 |
|frame-azure-11x15 |39790 / medium azure |1/0/0 |R8 |
|frame-magenta-7x11 |39794 / magenta |2/0/0 |R8 |
|beam-yellow-3 |32523 / yellow |2/0/0 |R9 |
|peg-black-knob |6628 / black |2/2/0 |R10; B52,56 |
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
|32140 yellow2×4 |Axle hole `(0,0,0)`; round long-arm holes z20,40,60; short-end round hole `(20,0,60)` |Sourcep27 tan pin enters the lower cross-hole; sourcep28 top blue pin sits at the short end. Selecting the compound operating branch is unresolved. |
|32184 white |Outer axle passages centered `(0,±20,0)`, axesX; central round passage axisZ |Not three parallel round holes. Native geometry prevents treating it as a generic three-hole beam. Its compound coupler indexing remains unchecked. |
|32526 azure3×5 |Round centers `(0,0,0..80)`, `(20,0,80)`, `(40,0,80)`; axisY |Sourcep36 upper connection and lower short leg must be fitted jointly with32140/32184. No arbitrary passive fork angle is enabled. |
|2739a rod |Steering-link eye centers separated100 LDU =40mm |A real fixed-length constraint candidate, not an animated telescoping rod. Type1 vsType2 historical mold remains provisional. |
|32498 sample gear |NativeZ axle, faces z±10; true z36 teeth |Rotated horizontal, distinct from the z28; no wheel/drivetrain binding. |
|39789 brick |Three vertical axle holes at x−20,0,+20; body bottom y24; stud plane y0 |Two same-color bricks stack at24LDU pitch over the same source3L axle. Their hole axes remain vertical, not incorrectly horizontal. |
|64179 frame |Native slab y±10; through-hole grid x±40,z±60/20 |Lower/upper frame stack and B2p58 yaw mounting still need independently fitted seating comparison. |
|11954 fork panel |Authentic side/front hole sets and native origin retained |Two distinct source panels/prongs. No extra opening DOF; exact actual support contact surface not certified. |

`addMate` records inspectable source-local frames for motor outputs, z28 and sample stacks. Electrical endpoints retain the actual device cable-stub origins and hub socket locations. The three captive cable routes correspond to A/F/D and are outside extra inventory; the intermediate cable bend is an openly diagram-derived presentation route, not a measured collision envelope.

Operation structure uses the existing shared assembly engine: each instance approaches individually from the visible inventory; pin/axle operations have a separate axial phase; prepared modules move as root subassemblies and are reparented continuously. Source assembly-only steps are real module merges, not empty fabricated views. B2p58 moves the whole101-unit moving arm onto Book1's yaw output. B2p59 routes/connects the existing captive devices using the p61 wiring reference. Source step IDs and numbered page mappings stay synchronized.

Initial inventory uses the measured canonical geometry bounds from `component-bounds.json`, checked against each actual geometry SHA. Identity-rotation inventory rows have12mm gaps and a5mm floor clearance; the original native geometry origins are preserved, not recentered. The permanent inventory check independently checks all pairwise X/Z bounds for overlap.

### Explicit red geometric evidence — unresolved compound linkage

Inspected enlarged B2pp17,22,25,27,32,33,36,49,53 plus native32140,32184,32526,2739a and46372 files. These establish more than an abstract four-bar:

- The long azure7 support ends are coaxial with opposite medium-motor output extensions in p22; their holes are round, not powered axle holes.
- The yellow32140 lower cross-hole/tan pin and top short-end blue pin are distinct features in p27. The top round hole cannot simply be relabeled as a cross axle.
- The z28 has real eccentric pin holes, so absence of another meshing gear does **not** prove absence of a pin-driven crank relation.
- White32184 is an axle/pin/axle perpendicular connector; p33 shows two tan axle pins, not a plain rigid three-round-hole link.
- p36 couples that white connector, yellow crank and azure angle beam. p49/p53 add a further perpendicular connector and the two fork interfaces. A single independently rotating fork joint omits this compound closure.

The exact pairings of the pictured pins, the finished branch of the compound couplers, and the two real gear-base/prong contacts have not been independently fitted. Publishing a made-up40mm rod closure at convenient world points would create a plausible but unsupported mechanism. Consequently **no fake closed-loop constraint is enabled**, and no package is attached or released. This preserves honest inspection and the full source assembly data while the user-required full functional cycle remains a red acceptance item.

The minimum missing geometric evidence is a consistent hole-to-hole assignment for B2pp27/32/36/40/49/53/57 yielding all actual pin axes and rod spans simultaneously. Once that exists, the existing nonlinear `SimulationCore` solver—not another animation architecture—must prove the continuous operating branch over the documented F command range. Capture then needs two independent actual prong contacts and continuous attach/release poses. This task has not established that prerequisite.

## Source program distinctions

[Official Python p13][python], SHA-256 `e03ddef0538aa6dce8894281d742b953945d6a30bd2cbc2156dc9dc71bb621ce`, and [official SVG][blocks], SHA-256 `64bf575bec6b8838410d4490a9cd934b828137186a45054a520f0f14149a71a2`, are separate source documents in the model registry.

Both source logs retain A0→F240→A90→F25→check, then A0→F240→A270→F25→check. Each check raises F235, waits4s and samples D. Magenta uses A0/F25/Triumph/F240; the other branch lowers F25 and shakes three−100°/+100° pairs. Python ends A0 then F240; SVG ends F240 then A0. Absolute encoder positions use shortest-path equivalents; negative unwrapped coordinates are not invented physical hard stops.

The Python rate250°/s and shake1000°/s are source values. SVG25% is **not** asserted equivalent to250°/s: that playback mapping is labeled app-authored. Sound lengths are presentation dwell intervals, not measured audio durations or redistributed LEGO audio. The staged magenta/yellow color reads are explicit RoboBuild scripted inputs, not an optical classifier. Both original packages stay on their pedestals because actual capture is disabled.

## Permanent checks and parent verification

Runnable tests independently transcribe all45 family rows and R/B/P quantities; check authentic DAT and palette identities, source pages, exact one-time introductions, installation milestones, the101-unit whole-arm merge, initial whole inventory visibility and deterministic arbitrary-time sampling. Native-frame tests cover both real motor pivots, opposite axial seats, the z28's nativeZ axis and39789 sample stacking. Program checks independently assert the magenta/reject command outputs and Python/SVG final-order distinction. Replay checks prove only supported output motion; they do not call a static fork a successful pickup.

The source full-cycle/nonlinear-closure/two-contact delivery test is explicitly skipped with the precise blocker. Parent compilation, unit tests and source-program browser replay ran, while **manual-to-WebGL fit comparison, unintended intersections, hole alignment, cable envelopes, calibrated exploded view, performance, full capture/release continuity and distinct physical outputs remain unexercised**. No source-accurate sorting acceptance pass is claimed here.

[robot]: https://assets.education.lego.com/v3/assets/blt293eea581807678a/bltebfffd33fc0a5e72/5f8802a1bc43790f5c4389f2/automate-it-bi-pdf-book1of3.pdf?locale=en-us
[base]: https://assets.education.lego.com/v3/assets/blt293eea581807678a/blte262c4974fee83b0/5f8802a3ed5ccb12e4342dac/automate-it-bi-pdf-book2of3.pdf?locale=en-us
[packages]: https://assets.education.lego.com/v3/assets/blt293eea581807678a/blt2cb1e769ec72a3d7/5f88022d6c54ba0f72c2081a/automate-it-bi-pdf-book3of3.pdf?locale=en-us
[python]: https://assets.education.lego.com/v3/assets/blt293eea581807678a/blt02bcbffa2bf460b5/65df44a50f1d35dffdca4995/EN-US-SPIKE-Prime-Python-Programs_Feb-2024.pdf?locale=en-us
[blocks]: https://assets.education.lego.com/v3/assets/blt293eea581807678a/blt2c8acc9f40bbf081/633b2bbfcba38f4c5f6a947a/spike_kickstart_your_business_automate_it_teacher_solution_en.svg?locale=en-us
