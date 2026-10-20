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
- Complete authorized assembled CAD, exact coordinates, hole indices, motor axes/limits and cable-safe travel are not established.
- A/F motor-port-to-physical-axis mapping has not been independently traced.
- Embedded lesson videos were not downloaded or frame-inspected; motion claims here come from actually rendered official program SVGs and official prose.
- There is **no integration gap**: the final joining steps, combined hierarchy and wiring are present and inspected.

No app code, build, lint, test or formatter work was performed for this research slice.
