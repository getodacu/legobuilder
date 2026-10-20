# Quality Check Robot — evidence and assembly boundary

Research date: 2026-10-20. Official lesson: **Place Your Order**. Official building-index model: **Quality Check Robot**, composed of **Idea Detector** and **Robot Head**. This is a stationary color-input robot with a motorized expressive sensor head, not a conveyor sorter.

## Primary sources, revisions and inspection

- [Official building-instructions index](https://education.lego.com/en-us/product-resources/spike-prime/downloads/building-instructions/).
- [Idea Detector — book 1 of 2](https://assets.education.lego.com/v3/assets/blt293eea581807678a/blta28e7be5ac30e472/5f8802cda302dc0d859a7343/place-your-order-bi-pdf-book1of2.pdf?locale=en-us): **16 pages**, 14,802,963 bytes; SHA-256 `e81b4e9b1212349543ad4b79d8a47a7897f06c1c031c23d9c3bc05933c3727c0`. PDF created `2019-08-12 15:54:40 +02:00`, modified `15:54:49 +02:00`.
- [Robot Head — book 2 of 2](https://assets.education.lego.com/v3/assets/blt293eea581807678a/blt7f40beca9b715331/5f8802ef18cd5f0f67ac48f8/place-your-order-bi-pdf-book2of2.pdf?locale=en-us): **20 pages**, 20,439,397 bytes; SHA-256 `69b0625f4f1c2c752440bfefd5b5316d34a1c27681e7f46a509177d59ff2b170`. PDF created `2019-08-12 15:55:13 +02:00`, modified `15:55:22 +02:00`.
- No printed revision identifier found. Metadata times are not claimed publication dates. Both manuals are InDesign CC 2017 / Adobe PDF Library 15.0 output.
- [Official Place Your Order lesson](https://education.lego.com/en-us/lessons/prime-kickstart-a-business/place-your-order/) independently links the two manuals under different asset URLs. Both lesson-linked downloads are **byte-identical** to their corresponding index downloads.
- All **36 manual pages** were visually inspected via private page renders/contact sheets, including final integration and wiring pages opened individually. Program SVGs were rendered and inspected, not treated as inaccessible text.
- Private evidence: `.research-cache/hand-quality`. Machine-readable steps, BOM and connections: [`data/hand-quality.json`](data/hand-quality.json).

All page references are **one-based PDF page indices**. Step numbers reset for book 2. Storage-box pictures on each book’s page 2 are not robot parts.

## Integration really is shown

**Yes.** The index supplies two books, not two unrelated alternative robots:

- Both covers (page 1) explicitly diagram **book 1 + book 2 → combined robot**.
- Book 1 ends at step 13/page 16 with the Idea Detector plate, fixed Color Sensor and upright Hub.
- Book 2 step **11/page 13** mounts the assembled head to that existing detector plate and shows a cable being connected.
- Step **12/page 14** turns the combined build and shows the other connections.
- Steps **13–15/pages 15–17** make and install a cable retainer.
- Step **17/page 19** shows the exact final combined hierarchy, with four loose colored sample packages alongside it.
- Book 2 page **20** supplies the final electrical diagram.

Do not invent an integration gap, a separate robot base, a third manual, or an automatic material-handling stage.

## Complete numbered sequence

### Idea Detector, book 1

| Step | PDF page | Verified action / new callout quantities |
|---:|---:|---|
| — | 1 | Two-book combination diagram |
| — | 2 | One set storage box pictured |
| — | 3 | Prepare Hub rechargeable battery |
| 1 | 4 | Black open frame ×1, tan axle/pin ×1 |
| 2 | 5 | Short black pins ×4, red rear connector ×1 |
| 3 | 6 | Azure L-shaped beams ×2 |
| 4 | 7 | Gray cross blocks ×2, each with four integral pins (two on each face) |
| 5 | 8 | Short black pins ×4 |
| 6 | 9 | Yellow perforated base plate ×1 |
| 7 | 10 | Short black pins ×6 on base plate |
| 8 | 11 | Color Sensor with captive cable ×1 |
| 9 | 12 | Yellow 2×4 bricks with three vertical axle holes ×2, tan axle/pins ×4; prepare both side mounts |
| 10 | 13 | Mount both prepared yellow side mounts around sensor |
| 11 | 14 | Yellow curved top/slope pieces ×2 |
| 12 | 15 | Handed azure curved panels ×1 each |
| 13 | 16 | Large Hub ×1; mount upright and connect sensor |

### Robot Head, book 2

| Step | PDF page | Verified action / new callout quantities |
|---:|---:|---|
| — | 1 | Two-book combination diagram |
| — | 2 | One set storage box pictured |
| 1 | 3 | First medium angular motor ×1, short pins ×2; alignment inset |
| 2 | 4 | First magenta square multi-hole connector ×1 |
| 3 | 5 | Short black pins ×4 in connector |
| 4 | 6 | Mount connector upright on first motor output disc |
| 5 | 7 | Gray right-angle connector ×1, tan axle/pin ×1 |
| 6 | 8 | Gray plain non-friction 2L pin ×1 into round hole; no cross axle |
| 7 | 9 | Join gray/tan connector subassembly to first motor structure |
| 8 | 10 | Second medium angular motor ×1, short pins ×2; attach vertically with specified alignment |
| 9 | 11 | Second magenta square connector ×1, short pins ×2 |
| 10 | 12 | Distance Sensor with captive cable ×1 |
| 11 | 13 | Mount assembled head to existing detector plate; cable connection |
| 12 | 14 | Turn model; remaining cable connections |
| 13 | 15 | Medium azure cable clip ×1, red axle ×1 for cable retainer |
| 14 | 16 | Magenta short connector ×1 |
| 15 | 17 | Install retainer and route cables |
| 16 | 18 | Loose 2×4 vertical-axlehole bricks: green ×2, blue ×2, red ×2, magenta ×2; stack same-color pairs |
| 17 | 19 | Final assembled robot and four loose packages; turned view |
| — | 20 | Wiring diagram: motors **A/F**, Distance Sensor **C**, Color Sensor **D** |

## Exact verified callout inventory

Quantities below are verified from the callout illustrations and numbers, not inferred from the set’s overall piece count. **Numeric manufacturer design/element IDs are not printed and remain unknown/null.** Descriptive keys in JSON are not catalog IDs.

### Idea Detector: 34 counted elements

| Visual part | Quantity | Book 1 PDF pages |
|---|---:|---|
| Black rectangular open frame | 1 | 4 |
| Tan axle/pin connectors | 5 | 4, 12 |
| Short black friction pins | 14 | 5, 8, 10 |
| Red rear connector | 1 | 5 |
| Azure L-shaped beams | 2 | 6 |
| Gray 1×3 cross blocks, four integral pins each | 2 | 7 |
| Yellow perforated plate | 1 | 9 |
| Color Sensor, captive cable | 1 | 11 |
| Yellow 2×4 side-mount bricks with three vertical axle holes | 2 | 12 |
| Yellow curved tops/slopes | 2 | 14 |
| Azure curved panel, first handedness | 1 | 15 |
| Azure curved panel, opposite handedness | 1 | 15 |
| Prepared Large Hub | 1 | 16 |

### Robot Head: 21 counted elements, plus 8 loose sample bricks

| Visual part | Quantity | Book 2 PDF pages |
|---|---:|---|
| Medium angular motors, captive cables | 2 | 3, 10 |
| Short black friction pins | 10 | 3, 5, 10, 11 |
| Magenta square multi-hole connectors | 2 | 4, 11 |
| Gray right-angle connector | 1 | 7 |
| Tan axle/pin connector | 1 | 7 |
| Light bluish gray plain non-friction 2L pin | 1 | 8 |
| Distance Sensor, captive cable | 1 | 12 |
| Medium azure cable clip | 1 | 15 |
| Red cross axle | 1 | 15 |
| Magenta short connector | 1 | 16 |
| Green 2×4 sample bricks, three vertical axle holes | 2 | 18 |
| Blue 2×4 sample bricks, three vertical axle holes | 2 | 18 |
| Red 2×4 sample bricks, three vertical axle holes | 2 | 18 |
| Magenta 2×4 sample bricks, three vertical axle holes | 2 | 18 |

The combined arithmetic is **55 robot elements + 8 sample bricks = 63 counted elements**. Hub/battery and motor/cable are treated as prepared assemblies; this is an explicitly scoped callout sum, not a LEGO-published model count. There is one Hub total, not one per book. There are two motors total. The final four packages are each two stacked bricks, not four single bricks and not eight separate packages.

The [contextual geometry crosswalk](lego-part-crosswalk.md) resolves `gray-axle-pin` to plain `3673.dat`, not a cross axle; the four-pin blocks select provisional `48989.dat` versus `65489.dat`. Head `azure-short-connector` selects `49283.dat` cable clip (p15), unlike the hand's `60483.dat` 2L liftarm (p12): dispatch by input + build + key. All sample bricks and yellow side-mount bricks use `39789.dat`'s three vertical axle holes. Stable `violet-brick` renders **magenta**, while **violet** remains the documented lesson's sensor-event/program label, not a physical material name. Geometry filenames do not certify LEGO design/element IDs or historical molds.

## Final hierarchy and mechanics

Physical hierarchy verified from the assembly imagery:

```text
Quality Check Robot
├─ fixed Idea Detector structure
│  ├─ black rear frame + azure L brackets + yellow base plate
│  ├─ upright Large Hub
│  └─ fixed Color Sensor + yellow surround + handed azure panels
└─ head mounted on the yellow plate
   ├─ fixed lower medium-motor body
   └─ lower motor output + magenta/gray coupling
      └─ second motor output connected to coupling
         └─ upper motor body + sensor bracket
            ├─ Distance Sensor (“eyes”)
            └─ cable retainer

Loose objects: four two-brick sample packages (magenta, red, blue, green)
```

**Engineering interpretation:** two powered rotary degrees of freedom in an approximately orthogonal serial arrangement, enabling head yaw/pitch-like expression. The upper motor’s **output** attaches to the lower driven structure while the upper motor’s **body** carries the sensor; do not incorrectly anchor both motor bodies rigidly to the base. The lower motor body is fixed to the plate at step 11. Exact axes, origins, joint limits, safe cable travel and transforms are not dimensioned by the manual and are not asserted here.

Electrical identities on book 2 page 20 are exact: **A and F → motors; C → Distance Sensor; D → Color Sensor**. The diagram alone does not label which motor axis is A versus F; that physical-axis assignment remains unverified rather than guessed from the expressive movement names. The main model’s alignment insets and the lesson’s **Align Motors Correctly** tip are functional requirements, not decorative artwork.

### Source-native seating audit (2026-10-20)

Original Detector pp4–9/16 and Head pp3–14/20 were inspected alongside the selected licensed DATs under the private geometry cache. Detector pp5/6/8 were additionally rendered from the original PDF at3× scale, resolving individual occupied/empty holes. These comparisons found actual reconstruction faults, not merely missing confidence labels:

| Source proof | Native selected contacts (LDU, before N) | Corrected authored result |
|---|---|---|
| Detector pp5–6: four pins sit along the frame's seven-hole sides, entering the second/fourth holes of each five-hole L leg |64179 `(±40,−10,60/20)`;32526 long-leg Z60/20 and corresponding lower Y face |Removed quarter-turn of the frame, reduced rail separation48→32 mm, and replaced incorrect L endpoints Z0/80 with the source holes. |
| Detector pp6–8: L short legs project outward; p8 leaves each middle short-leg hole empty |32526 `(0/40,±10,80)`;39369 `(±40/±80,−10,−180)` |Short legs now face out; four plate-join collars are at world X±16/±32, Y8, Z72 mm. Pins insert upward from underneath, and the plate follows from below. |
| Detector p7: integral crossblock pins occupy alternate remaining long-leg holes |32526 long-leg Z0/40;48989 lower bases `(0,±20,+10)`, upper bases `(0,±20,−10)` |Crossblocks are centered at `[±16,20,96]` mm; lower contacts Y16 and upper contacts Y24, with native20-LDU pin extensions. L installation now includes an8 mm downward stage. |
| Detector p16: hub stands on the two crossblocks |`s/u9402s01.dat` end bores X±40, Y−20/0/+20, Z±110;45601 adds native shell translation `(0,−30,0)` |Correct root-native selected bores `(±40,−10/−50,−110)`, not previous X±60/untranslated Y±20. Hub origin `[0,68,84]` seats four real vertical end bores at Z88/104 mm. |
| Detector pp4–5: red clip mounts over the rear-corner tan axle |64179 `(40,−10,−60)` and49283 native Z−10 face |Clip bore is now vertical and coaxial with the tan axle, rather than horizontal; face contact is `[16,8,128]` mm. |
| Head pp3–6/10: lower edge mount and reversed upper output |Lower54696p01 disc `(0,−50,±20)` meets39793 edge `(−30,0,±20)`; upper disc's four `(±20,−50,0)` / `(0,−50,±20)` bores meet39793 main-face cross `(±20,−10,0)` / `(0,−10,±20)` |Lower mount and reversed body/rotor hierarchy retained. Registered all four real output-retaining pin contacts and an8 mm +X upper-motor insertion rather than only a transfer/center-pivot description. |
| Head pp7–9: gray/tan prepared coupling |6536 axle face `(−10,0,0)`, round-pin face `(0,20,+10)`;39793 main face `(0,+10,0)`;3749 axle projects native +X |Corrected backwards tan-axle installation from−X to+X into the elbow and registered all three real collar/face contacts.3673 stays a plain round pin, not a cross axle. |
| Head pp10–12: sensor bracket on upper motor housing, sensor on orthogonal bracket holes |Motor housing `(30,±20,140)`;39793 main-face cross;37316 sensor side `(70,±20,0)` |Existing bracket contacts remain consistent: world Z−60 housing interface, Z−68 sensor interface. No guessed center-rear sensor holes or moving/fixed motor-body swap. |

The numerical regression samples the consumer assembly frame, independently transcribes source-selected contacts and checks both face coincidence and bore-axis directions. It does **not** establish molded interference, tolerances or a wholly verified source step. Full-step/component verified counts remain zero; all placement-fit fields remain unchecked.55 robot +8 sample callout identities, all30 numbered steps, separate loose samples and the actual motor body/rotor hierarchy are unchanged in scope.

Head p14 was inspected directly at4× scale (2235×1676), with p13's opposite view and p20's diagram. The cached lesson alternative has the same recorded SHA-256 as the index download, not higher-information artwork. Overlapping leads, crossings and a hidden-side connector prevent independent tracing of both motor paths. A/F physical-axis mapping therefore remains **unknown**; the app's A→yaw/F→upper-body command mapping remains explicitly authored, not a source wiring assertion.

### Exterior contacts and cable-supported retainer (2026-10-20)

Detector PDF pp12–15 and Head pp15–17/19 were reopened individually; Detector p15 and Head pp17/19 were also rendered at3× directly from the locked originals. The native comparison uses39789/3749,24309 with `s/24309s01.dat`,41749 and mirrored41750,39369 with `s/39369s01.dat`,49283 and32062:

| Source support path | Native evidence (LDU, before N) | Reconstruction correction / limit |
|---|---|---|
| Detector pp12–13: inverted preparation, two pin/axles per brick, then turn/mount both surrounds |39789 bottom Y24; outer vertical axle holes X±20, Z0.3749 axle +X and pin −X.39369 top Y−10, ordinary20-LDU Technic grid |Brick roots X8→24 mm; pin collars Y17.6→8 mm and X0/16→16/32 mm. Collars now meet both the underside axle holes and plate bores. Prepared bricks turn upside-down and axle preparation enters the exposed underside. Stable instance IDs are retained, even when their embedded numbers no longer describe the pose. |
| Detector p14: curves occupy the rear half of the brick studs |24309 rear bottom plane Y24; stud pockets X±10, Z0/−20; rear underside tube `(0,20,−10)` lies between pockets. The recessed front tube `(0,12,20)` is not this seat |Curve roots `[24,24,z]`→`[28,27.2,z]`, Ry(+pi/2). Four pockets match brick studs X10/30, Z±10. Exact nominal contact is independent of tube-center coincidence; no stud is placed on a between-stud tube axis. |
| Detector p15: handed panels on the Color Sensor's reading side, four rear stud sockets per panel |41749 underside Y24, sockets X0/−20 and Z±10;41750 reflects X. Both front soles reach Y48 near native Z−120 |41750 root `[16,27.2,12]`;41749 `[16,27.2,68]`. Their original Ry(−pi/2) already points toward−X and is retained. Corrected handed-side selection and4 mm lateral half-stud error; sockets now occupy the brick's front columns X−30/−10. Soles reach the plate at world Y8. |
| Panel front support is bearing, not a fictitious stud clutch |39369 repeats `connhole.dat` plus half-grid `npeghole.dat`; no stud primitives. Panel front sole is molded Y48 geometry |Only rear stud-pocket attachment is registered as fixed. Front sole height/reading-side position is independently asserted; toe interference, bearing patch and retention remain unchecked. |
| Head pp15–17: two clips joined by a red2L axle capture the flexible bundle |49283 native-Z bore, thickness20 LDU with Z±10 faces;32062 native-X shaft endpoints ±20. Cable-channel arms extend native Y−10…−29 |Old clip bores were perpendicular to the axle. Two coaxial clip bores now touch at their adjoining faces and enclose the entire40-LDU shaft, with flush outer ends. Retainer display position moves to the far side beside the upper motor; both clips and axle remain real inventory units. |

**Retainer support is the flexible leads themselves.** Head p17 shows the bundle passing through the open clip arms, not an axle entering a motor hole or a rigid bracket. The clip/axle internal fit is exact nominal DAT geometry; its whole-assembly position is not dimensioned. The displayed far-side seat is explicitly `unknown` numerical evidence at confidence0.35, with `diagram-derived` placement. Pitch parenting preserves existing playback ownership and does not certify a rigid mount. Rendered flexible lead geometry is absent, so the support cannot be visually reconstructed without a separately justified route; no cable length, bundle thickness, rigid support or measured flex path is invented. Motor A/F physical-axis assignment remains **UNKNOWN**.

The independent consumer-frame fixture adds surround underside/plate collar coincidence and axes, inverted preparation/insertion, all sixteen curve/panel stud pockets, front sole height/direction, and both clip bores, joining faces and shaft endpoints. It deliberately does not assert a measured global retainer seat. All30 steps,55 robot units +8 sample units and the existing body/rotor/sensor hierarchy remain unchanged. No build/test/lint/formatter was run.



## Documented capabilities versus actual lesson behavior

### Color Sensor

The [official Color Sensor technical specification](https://assets.education.lego.com/v3/assets/blt293eea581807678a/blt62a78c227edef070/5f8801b9a302dc0d859a732b/techspecs_techniccolorsensor.pdf?locale=en-us) documents RGB/HSV/LEGO color, reflected light and ambient light, plus white-light output. Its optimal color-reading distance is **16 mm depending on object size, color and surface**. That is a sensor specification, not a verified assembly clearance.

The [lesson’s Color Sensor Sensitivity tip](https://education.lego.com/en-us/lessons/prime-kickstart-a-business/place-your-order/) warns fingers can be read as **violet** and says to keep fingers behind the brick. The illustrated sample is presented by a person. It is not conveyed or automatically grasped.

### Distance Sensor / “eyes”

The [official Distance Sensor specification](https://assets.education.lego.com/v3/assets/blt293eea581807678a/blt64c2b9534cf10f68/5f8801b8bc43790f5c4389ea/techspecs_technicdistancesensor.pdf?locale=en-us) documents ultrasonic distance measurement from **50–2000 mm, ±20 mm**, and four independently controlled white light segments around the eyes. The installed sensor can measure range, but **the inspected lesson programs use its eye-light output, not a distance-triggered quality-inspection decision**. Presence in the head does not establish a documented metrology workflow.

### Motors

The [official medium angular motor specification](https://assets.education.lego.com/v3/assets/blt293eea581807678a/blt692436dd1e8fa71c/5f8801d5c8a27c1d9614c27e/techspecs_technicmediumangularmotor.pdf?locale=en-us) documents speed/position sensing, relative position, absolute ±180° reporting, 360 counts/revolution and ≤±3° position accuracy. The reporting interval is not a mechanical rotation limit or proof of unlimited cable-safe motion.

### Original official programs inspected

The [lesson](https://education.lego.com/en-us/lessons/prime-kickstart-a-business/place-your-order/) teaches decomposition: copy the robot’s actions from videos into pseudocode and programming stacks. Its supplied rendered diagrams provide concrete evidence:

- [Main program](https://assets.education.lego.com/v3/assets/blt293eea581807678a/blt441de26b5a4d2a97/633b2e41a425ab7d963723b6/spike_kickstart_your_business_place-your-order_step03-program_en-us.svg?locale=en-us): A+F speed **75%**; shortest path to position **0**; start “Cat Meow 1”; light C eyes; alternate two Hub display images **10 times**, **2 seconds** each.
- [Possible solution](https://assets.education.lego.com/v3/assets/blt293eea581807678a/bltebd4ff3bea14f6cf/63502a67dcbfe55a60fa3cb8/spike_kickstart_your_business_place-your-order_step04-hint_en.svg?locale=en-us): on D reading **violet**, run A clockwise **30°**, counterclockwise **60°**, clockwise **60°**, counterclockwise **30°**; play “Connect” and update the display.
- [Other official program](https://assets.education.lego.com/v3/assets/blt293eea581807678a/blt917e0c256b80ba6d/63513ac8dec6d64920ca68fa/spike_kickstart_your_business_place-your-order_teacher-solution_en.svg?locale=en-us): A+F speed **50%**, shortest path to **350**; D **red** triggers the A 30/60/60/30-degree sequence, D **green** triggers an F 30/60/60/30-degree sequence; sound/display feedback also appears.

These are documented example behaviors, **not a complete truth table for every sample color**. A renderer may reproduce the example motions, but should not invent accept/reject semantics, a blue response, a package conveyor, grabbing, defect classification or a sensor-tolerance model and label it original behavior. Custom videos/program stacks are explicitly suggested lesson differentiation; a user-made inspection workflow would likewise be an extension, not a manual feature.

## CAD and licensing findings

No verified, authorized full CAD/MPD build was located by searches combining SPIKE/Quality Check/Place Your Order with CAD, LDraw, MPD, Studio and GitHub. This bounded search cannot prove absence from all repositories.

- [John Holbrook’s educational-set palettes](https://www.johnholbrook.us/LDD_sets.html) grant use/derivatives with backlink credit. They contain laid-out set parts, **not this assembled robot**. Separate geometry packs may have their own licenses; author permission for a palette is not permission for LEGO manual imagery.
- [LDraw OMR](https://library.ldraw.org/omr) landing-page inspection did not establish a matching model or model-specific authorization.
- [LEGO Education legal notice](https://education.lego.com/en-us/support/legal-notice/) permits non-commercial home personal downloading with notices intact, while requiring written permission for public/commercial copying, upload and distribution. No open license for these manual PDFs or lesson SVGs was found.

All downloaded originals and rendered manual/program imagery remain private development evidence under `.research-cache/hand-quality`, not app/static assets. Cite and link official sources rather than redistributing the manuals without permission.

## Remaining gaps

- Numerical manufacturer design/element IDs remain uncertified and structured `partId` fields remain null. Source-shape geometry is now resolved contextually in the crosswalk; exact historical mold variants remain uncertain.
- No complete authorized assembled CAD or manufacturer-coordinate/fit certificate is established. The bounded contact selection above includes the Detector surrounds, curves and handed panels and the retainer's internal clip/axle stack. Molded clearance, upper/lower motor pointer zero, gray elbow retention, panel toe bearing and exact cable-supported retainer position remain unverified. Flexible lead geometry is absent; motor limits, cable lengths, flex route and cable-safe travel are not established.
- A/F motor-port-to-physical-axis mapping remains unknown after the higher-resolution p14 and cached identical alternative inspection.
- Embedded lesson videos were not downloaded or frame-inspected; motion claims here come from actually rendered official program SVGs and official prose.
- There is **no integration gap**: the final joining steps, combined hierarchy and wiring are present and inspected.

The source-native audit updated only the robot model, its unit regression and robot-specific research/validation records. No build, test, lint or formatter was run for these corrections.
