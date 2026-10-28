# Package Sorter — primary-source assembly research

## Scope and edition decision

Canonical sources are the **three PDFs linked by the requested official building-instructions index**, not a synthesized build. The index calls book 1 **Brick Sorter Robot**, book 2 **Brick Sorter Base**, and separately lists book 3 as **Packages** under **Boxes**. Despite those names, book 1 builds the fixed platform, hub, yaw motor and package pedestals; book 2 builds the moving arm/sensor unit and integrates it with book 1. Packages are separately attributed sample objects, not part of the sorter BOM. [Index][index], [R pp1,22][robot], [B pp1,58–61][base], [P pp1,3–5][packages].

All page numbers below are **1-based PDF pages**. The canonical PDFs do not print conventional page numbers. Step numbers are the large assembly numbers, not page numbers. Actual imagery was rendered and inspected for every page, with larger views for callouts, joints, integration, and the program. Private derived contact sheets and page renders live under `.research-cache/package-sorter/`; they are not app assets.

**Published revision conflict:** the current lesson links 2021 exports of books 1 and 2. Its book 1 has **18 numbered steps**, not the index version's **19**: PDF p10 no longer introduces the two knobbed black pegs at the far front corners; it remains an unnumbered yellow-support mounting diagram. Old steps 8–19 become 7–18 on the same PDF pages. Book 2 retains 58 steps; it is not byte-identical, and a complete equivalence of every graphic is not asserted. Book 3 is byte-identical. Use one edition's quantities, not a mixture. [Lesson resources][lesson], [2021 R p10][robot2021].

## Documents, provenance and hashes

There is no visible semantic version identifier; PDF creation/modification metadata is recorded as export metadata, **not a claim of publication date**. Full SHA-256 hashes and every document's metadata are also in [`data/package-sorter.json`](data/package-sorter.json).

| Source | PDF pages | Numbered steps | PDF creation metadata | SHA-256 |
|---|---:|---:|---|---|
| Index Robot | 22 | 19 | `D:20191106160810+01'00'` | `7db26cbedb1242a818c9f60fb0b299d90ac5a82eb24f26bf6657d1a58e813eae` |
| Index Base | 61 | 58 | `D:20190930105806+02'00'` | `8d694829bc8819624e8a40b882ad912e2092f8bb2739db6efb733e2a72a71e7a` |
| Separate Packages | 5 | 3 | `D:20190930110635+02'00'` | `c5418a2f74eb65e0a11b9c03724244fa8d97442e37a1d417934c2afcb76ee705` |

2021 lesson variants:

- Robot: `6176c551828a256b296d63616ee64d7e70d591f744da43578c62f97085eaedb2`; created `D:20210129094017+01'00'`; modified `D:20210129094043+01'00'`.
- Base: `149a8096384fd963fa746dfbffa76b66d208c2adc49a16f4e75daedea64e7819`; created `D:20210129104306+01'00'`; modified `D:20210129104350+01'00'`.
- Packages: same hash as the index package document.

## Complete page/step map

The JSON includes **every PDF page**, all **80 numbered steps** across the three documents, each printed parts callout, an action description, and stable per-instance IDs with document/step/page evidence. The sorter itself has 77 numbered steps; the separately attributed package objects have 3.

| Document | PDF page(s) | Evidence / operation |
|---|---|---|
| Robot | 1 | Book 1 + Book 2 integration overview. |
| Robot | 2 | Required set illustration; not a model-inventory callout. |
| Robot | 3 | Unnumbered removable hub-battery installation. |
| Robot | 4–9 | Steps 1–6: hub, perforated panel, attachment pins/clip, front/lateral frames, small yellow supports. |
| Robot | 10 | Step 7: mount yellow supports and add two knobbed pegs. This step differs in the 2021 lesson PDF. |
| Robot | 11–16 | Steps 8–13: large motor, zero-marker inset, side brackets, magenta rotating output biscuit/pins, mount motor to platform. |
| Robot | 17–22 | Steps 14–19: construct both side package pedestals, then mount on lateral frames. |
| Base | 1–2 | Combination overview and required set illustration. |
| Base | 3–12 | Steps 1–10: medium motor, zero-marker inset, feet and two stacked black frames; cable-clearance warning inset at p8. |
| Base | 13–17 | Steps 11–15: opposite motor output axles, magenta supports/biscuits, one gray angled gear wheel z28. |
| Base | 18–26 | Steps 16–24: transverse arm support and bilateral track-rod links. |
| Base | 27–32 | Steps 25–30: mirrored yellow crank brackets/pins, mounted on opposite sides. |
| Base | 33–40 | Steps 31–38: mirrored upper links/azure angle beams and axle connectors. |
| Base | 41–44 | Steps 39–42: rear cross beam, twin vertical 15m mast beams, color sensor and attachment biscuit. |
| Base | 45–48 | Steps 43–46: round plates, two transparent dish wheels and black round 2×2 through-hole tiles; mount on opposite sides. |
| Base | 49–53 | Steps 47–51: front linkage connectors and first panel-sided fork prong. |
| Base | 54–57 | Steps 52–55: mirrored second fork prong. |
| Base | 58 | Step 56: mount whole moving assembly to book 1 output biscuit. |
| Base | 59 | Step 57: viewpoint change and cable routing. |
| Base | 60 | Step 58: place separate magenta/yellow sample packages on side pedestals. No additional sorter parts callout. |
| Base | 61 | Unnumbered hub wiring: A motor, D color sensor, F motor. |
| Packages | 1–2 | Two separate sample objects overview and required set. |
| Packages | 3–5 | Steps 1–3: two black z36 gear bases, two yellow 3m axles, two yellow and two magenta 2×4 bricks with three vertical axle holes; underside orientation inset. |

References: [R][robot], [B][base], [P][packages]. Do not turn the grouped rows above into invented manual step boundaries; the JSON preserves each original numbered step.

## Inventory — quantities separate from identity confidence

**Numbered callout sum: 57 book-1 items + 101 book-2 items = 158 sorter items under this explicit counting convention.** This is a transcription rollup, not a printed manufacturer BOM total: hub counts as one device, motor/sensor attached cables count with those devices, and the removable hub battery shown on preparatory R p3 is separately documented, outside the 158. Set storage box and USB cable are not assembly parts. The separately built package objects add **8** items, excluded from the sorter rollup. The newer lesson edition removes two knobbed pegs, changing its comparable sorter rollup to 156. [R pp3–22][robot], [B pp3–60][base], [P pp3–5][packages].

Names below are visual descriptions matched to the official [45678 element overview, p1][overview], with source-shape corrections from the [contextual geometry crosswalk](lego-part-crosswalk.md). Printed quantities are high-confidence; exact historical molds, manufacturer color codes and element/design certification remain separate uncertainties. LDraw geometry basenames are not verified purchasable SKUs. Stable keys, source step/page mappings and original document hashes are preserved.

| Visually identified part | Robot | Base | Sorter subtotal |
|---|---:|---:|---:|
| Large Hub (battery inserted separately on preparatory page) | 1 | 0 | 1 |
| Connector peg with friction, black | 18 | 32 | 50 |
| Panel 11x19, yellow | 1 | 0 | 1 |
| Connector peg/cross axle, tan | 5 | 6 | 11 |
| Wire clip with cross hole, red | 1 | 0 | 1 |
| Technic frame 11x15, azure | 1 | 0 | 1 |
| Technic frame 7x11, magenta | 2 | 0 | 2 |
| Technic 3m beam, yellow | 2 | 0 | 2 |
| Connector peg with knob, black | 2 | 2 | 4 |
| Large Motor (with attached cable) | 1 | 0 | 1 |
| Beam 3m with 4 snaps, gray | 6 | 2 | 8 |
| Technic angular beam 3x5 90 degrees, azure | 2 | 2 | 4 |
| Biscuit 1x3x3, magenta | 1 | 4 | 5 |
| Connector peg with friction 3m, blue | 6 | 2 | 8 |
| Technic 5m beam, magenta | 2 | 2 | 4 |
| Beam I-frame 3x5, gray | 2 | 0 | 2 |
| Biscuit 1x3x3, black | 4 | 0 | 4 |
| T-beam 3x3, black | 0 | 2 | 2 |
| Medium Motor (with attached cable) | 0 | 1 | 1 |
| Technic frame 5x7, black | 0 | 2 | 2 |
| Connector peg, gray, non-friction appearance | 0 | 6 | 6 |
| Cross axle 7m, yellow | 0 | 1 | 1 |
| Cross axle 5m, gray | 0 | 1 | 1 |
| Angled gear wheel z28, gray | 0 | 1 | 1 |
| Technic 13m beam, azure | 0 | 1 | 1 |
| Technic 7m beam, azure | 0 | 2 | 2 |
| Technic 2m beam with cross hole, azure | 0 | 2 | 2 |
| Eye-ended steering link 6L, black (stable key `rod-gray-6`) | 0 | 2 | 2 |
| Technic angular beam 2x4 90 degrees, yellow | 0 | 2 | 2 |
| Double cross block, light gray | 0 | 4 | 4 |
| Technic 11m beam, magenta | 0 | 1 | 1 |
| Technic 15m beam, black | 0 | 2 | 2 |
| Color Sensor (with attached cable) | 0 | 1 | 1 |
| Plate round 2x2, azure | 0 | 2 | 2 |
| Satellite dish 6x6, transparent | 0 | 2 | 2 |
| Smooth round tile 2×2 with center through-hole, black | 0 | 2 | 2 |
| Long friction axle/pin, black: 2L cross axle + 1L pin (3L overall) | 0 | 4 | 4 |
| Cross axle 2m with groove, red | 0 | 2 | 2 |
| Technic angular beam 3x7, yellow | 0 | 2 | 2 |
| Angle element 180 degrees [2], black | 0 | 2 | 2 |
| Bowed panel 3x11x2, azure | 0 | 2 | 2 |

Separate sample-object inventory: **2 black double-bevel z36 gear wheels, 2 yellow 3m axles, 2 yellow 2×4 bricks with three vertical axle holes, 2 magenta 2×4 bricks with three vertical axle holes**. Each color sample uses one gear/axle and two same-color bricks. The sorter drive's **one gray z28 angled gear** is a different geometry; do not merge it with these z36 sample bases. Identity checked against the official overview p1, B p17, and P p5 inset. [B][base], [P][packages], [Overview][overview].

Resolved source shapes: `axle-black-2-snap` → `18651.dat` (2L axle plus 1L pin, not `43093`); `tile-round-black-2x2` → `15535.dat` (through-hole, not closed `14769`); `rod-gray-6` → black `2739a.dat` (Type1 provisional versus Type2 `32005`); sample `gear-gray-36` → black `32498.dat`. The old gray words in stable keys are not material instructions: the official 2019 overview and supporting set palette establish black, while shaded manual images are not calibrated color measurements. Package bricks select `39789.dat`, not ordinary solid bricks. These geometry resolutions do not certify historical manufacturer molds or assembled transforms.

### Element/design identifiers

None of the requested building PDFs or the official 45678 overview prints exact element or design IDs for these assembly callouts. Therefore the JSON intentionally leaves certified `elementId` and `designId` fields **null** rather than inventing them.

An additional official **2016 Element Survey** supplies visually matching legacy references for five connector/axle types: black friction peg **4121715** (PDF p2 / printed p176); tan peg/axle **4186017**, gray connector peg **4211807**, gray 5m axle **4211639** (PDF p3 / printed p177); red 2m axle **4142865** (PDF p2 / printed p176). These are explicitly marked **additional visual references, not certified 45678 supplied SKUs**; that survey is not a sorter inventory and none of its quantities were used. Exact current mold/element variants remain unverified. [Survey pp2–3][survey].

## Mechanism, joints, mounting and actual controlled DOF

**Two actuated degrees of freedom, not a three-axis arm or a powered gripper:**

1. **Base yaw, port A:** the book-1 large motor sits on the yellow platform with its output vertical. The magenta output biscuit and two blue three-module pins support the complete book-2 frame. Book-2 p58 shows that lowering/mating operation. The arm, sensor mast and forks yaw as one moving superassembly relative to the fixed panel/hub/pedestals. [R pp11,14–16][robot], [B p58][base], [Python p13][python].
2. **F motor crank and passive fork lift, port F:** the book-2 medium motor sits upright in stacked black frames. Opposite horizontal shaft extensions (yellow7m and gray5m) power the bilateral keyed cranks. Their two genuine40mm ball/socket rods pull a carrier with round F-shaft bearings and two passive fork pivots. The F encoder sets a crank angle, **not** an independently prescribed fork or lift angle. No prismatic carriage, conveyor drive or separate claw-opening motor is introduced. [B pp5,13,17,22,26,32,40,48,53,57][base], [Python p13][python], [native contact reconstruction](sorter-linkage-resolution.md).

The color sensor is fixed high on the twin black15m mast, aimed toward the raised package region; it connects to **D**. The sample gear bases initially sit over two exposed pedestal axles. The two source fork assemblies carry native32034 black tips and11954 panel lips; whether a specific gear tooth/face or brick facet seats against them at each instant requires actual registered contact evidence. The large azure front frame is a catch region, not a powered conveyor. [B pp42,44,57–61][base], [R p22][robot], [physical example](sorter-linkage-resolution.md).

There is only **one transmission-position gear introduced in book 2** (z28, step15), with no second meshing gear in the sorter parts callouts. A reduction ratio cannot be inferred just because a gear-shaped part is visible. Likewise, no third DOF should be added for the transparent dishes, passive links, or sample gears. [B pp17,45–48][base].

### What mounting is known — and what is not

Verified relational mounting: hub is at rear of the yellow panel; large azure frame extends forward; magenta frames extend laterally and carry the package pedestals; output biscuit is atop the large motor; moving black frame mates to its blue pins; medium-motor axle is transverse to the forward fork direction; mast is behind the fork. The JSON records these as relational observations with page evidence. [R pp5,8,16,22][robot], [B pp13,40,42,57–60][base].

**Not published/verified:** exact world-coordinate transforms, per-part rotation matrices, hole-center connection graph, closed-loop pivot coordinates, full passive-joint enumeration, rigid-body inertias/masses, clearances, backlash, cable collision envelopes, travel limits, and millimetre overall dimensions. The manual does label selected beam/axle lengths in modules (e.g. 5,7,11,13,15); those are not permission to invent metric CAD offsets or claim a dimensionally validated reconstruction. Program encoder positions below are not mechanical hard stops.

## Documented sorting sequence versus extension

The lesson explicitly describes an **open-ended example solution**, not one prescribed industrial factory. Its stated objective is identifying/shipping the correct package by color; combining models, delivery carts, additional functions and larger automated factories are extensions. [Lesson: Building Tips, Coding Tips, Differentiation][lesson].

The official **block-program SVG** was visually inspected, and the official **February 2024 Python-programs PDF p13** supplies the source text. The manual's B p61 wiring and the Python comments agree: **A base**, **F arm**, **D color**. [Block program][blocks], [Python p13][python].

Block main sequence (absolute motor target positions in degrees, shortest path; A+F speed25%):

`A0 → F240 → A90 → F25 → check color → A0 → F240 → A270 → F25 → check color → F240 → A0`.

`check color` is:

1. F235; wait4 seconds; read D.
2. **Magenta:** A0; F25; play Triumph until done; F240. The Python comments identify this as placing the accepted package in the bin.
3. **Otherwise:** play Oops until done; F25; repeat3 times: set F100%, move −100° then +100°, set F25%. The Python comments identify this as dropping the rejected package.

This documents **one pickup from each side and one magenta acceptance test**, not continuous operation, arbitrary package counts, arbitrary color classification, or one bin per color. The final order differs slightly between sources: the SVG ends **F240 then A0**, while the Python p13 ends **A0 then F240**. Python uses250°/s positional commands rather than the SVG's25% speed, and1000°/s for shaking; do not claim speed-unit identity. The JSON retains the source-specific distinction.

The official Python PDF's extracted code includes typographic quotation marks around sound names; it is evidence to transcribe carefully, not an executable artifact copied into this repository.

### Physical example and native-fit follow-up

The [official lesson][lesson] embeds a22.2s physical example film (player, private source hash and source-frame findings in [sorter linkage resolution](sorter-linkage-resolution.md)). At8.2s the yellow package sits between the actual black fork tips above its pedestal; at8.5s the carrier rises and the package has left that pedestal. At9.5s the package moves separately near the raised fork, and at10s it falls beside the robot, lying by the pedestal at12s. The film establishes an actual close–lift–release sequence but **does not establish a sustained rigid hold throughout yaw or a measured destination coordinate**. Source Python separately documents a magenta acceptance/bin branch and a yellow shake/drop branch. Its encoder targets must not be converted into unverified passive joint tracks or a fabricated object teleport. Internal native DAT contact geometry permits inspectable seats; no full dynamic contact law or authorized complete assembly CAD was recovered.

## CAD availability and rights

Inspected the official building index, lesson resources and element overview, plus targeted searches for `automate-it` with CAD/MPD/LDR/IO terms. **No authorized downloadable complete assembly CAD/MPD was found.** This is a scoped negative finding, not proof no such asset exists anywhere. The inspected public resource links are PDFs, images, program artwork and teaching resources; none supplies exact assembly transforms.

Manual and overview imagery carries **©2019 The LEGO Group. All rights reserved.** The [Fair Play policy][fairplay] says LEGO owns building-instruction copyrights, objects to Internet distribution, and narrowly tolerates limited unaltered noncommercial extracts for information/commentary subject to notices/disclaimers. That is **not** a full-PDF redistribution or derivative-CAD license. Public download availability must not be treated as an open license. Keep all cached PDFs, screenshots and program artwork private; link to the official sources instead of shipping them in `static/`. No right to publish a reconstructed full assembly or reproduce logos has been established here.

## Deliverable boundaries

`data/package-sorter.json` contains document metadata/hashes, every page/numbered step, printed-callout quantities, an inventory rollup, **166 numbered-callout instances across sorter158 + separate samples8**, separately evidenced battery preparation, source-specific program behavior, relational joints/mountings, source references and explicit uncertainties. Stable instance IDs identify transcription instances, **not verified CAD transforms**. The original research transcription did not run application checks; [the later validation ledger](../validation/package-sorter.md) records subsequent source-native implementation and its actual software gates.

[index]: https://education.lego.com/en-us/product-resources/spike-prime/downloads/building-instructions/
[robot]: https://assets.education.lego.com/v3/assets/blt293eea581807678a/bltebfffd33fc0a5e72/5f8802a1bc43790f5c4389f2/automate-it-bi-pdf-book1of3.pdf?locale=en-us
[base]: https://assets.education.lego.com/v3/assets/blt293eea581807678a/blte262c4974fee83b0/5f8802a3ed5ccb12e4342dac/automate-it-bi-pdf-book2of3.pdf?locale=en-us
[packages]: https://assets.education.lego.com/v3/assets/blt293eea581807678a/blt2cb1e769ec72a3d7/5f88022d6c54ba0f72c2081a/automate-it-bi-pdf-book3of3.pdf?locale=en-us
[lesson]: https://education.lego.com/en-us/lessons/prime-kickstart-a-business/automate-it/
[robot2021]: https://assets.education.lego.com/v3/assets/blt293eea581807678a/blt0736063849654cd1/611664001e409f13bb3b921d/automate-it-bi-pdf-book1of3.pdf?locale=en-us
[overview]: https://assets.education.lego.com/v3/assets/blt293eea581807678a/blt28cad37f1f002fd3/5f8801b982eaa522ca601c89/le_spike_prime_element_overview.pdf?locale=en-us
[survey]: https://assets.education.lego.com/v3/assets/blt293eea581807678a/blt3c5f371ade173ee6/5ebaea0f63e19c6dbf02ccce/element-survey.pdf?locale=en-us
[blocks]: https://assets.education.lego.com/v3/assets/blt293eea581807678a/blt2c8acc9f40bbf081/633b2bbfcba38f4c5f6a947a/spike_kickstart_your_business_automate_it_teacher_solution_en.svg?locale=en-us
[python]: https://assets.education.lego.com/v3/assets/blt293eea581807678a/blt02bcbffa2bf460b5/65df44a50f1d35dffdca4995/EN-US-SPIKE-Prime-Python-Programs_Feb-2024.pdf?locale=en-us
[fairplay]: https://www.lego.com/en-us/legal/notices-and-policies/fair-play/
