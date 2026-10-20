# Robot Hand — evidence and implementation boundary

Research date: 2026-10-20. This is the official **Robot Hand / Pass the Brick**, not a prosthetic arm, articulated anatomical hand, or independent-finger mechanism.

## Primary sources and revision

- [Official SPIKE Prime building-instructions index](https://education.lego.com/en-us/product-resources/spike-prime/downloads/building-instructions/) labels this model “Robot Hand” and links [Pass-the-Brick book 1 of 1](https://assets.education.lego.com/v3/assets/blt293eea581807678a/bltd34f6e501eb5ff30/5f8802b8bf5ab07ee90076df/pass-the-brick-bi-pdf-book1of1.pdf?locale=en-us).
- [Official Pass the Brick lesson](https://education.lego.com/en-us/lessons/prime-extra-resources/pass-the-brick/) documents intended use, controls and optional extensions. Its separately hosted manual is byte-identical to the index copy downloaded for this research.
- Manual: 32 PDF pages, 11,767,693 bytes. SHA-256: `561591039e9933b98f8bd59d4e25afa809ae5110f154d6538955d0bc65cb5ee2`.
- PDF metadata: created `2019-08-13 09:04:57 +02:00`, modified `2019-08-13 09:05:05 +02:00`, InDesign CC 2017 / Adobe PDF Library 15.0. No explicit printed revision identifier was found. Metadata time is not a claimed publication date.
- All 32 pages were rendered and visually inspected; this is not text-only PDF research. Private originals, page renders, contact sheets and extracted text are in `.research-cache/hand-quality`. No downloaded images or PDFs were placed in public/static assets.
- Structured source, step, BOM and connection evidence: [`data/hand-quality.json`](data/hand-quality.json).

**Page convention:** all page numbers below are one-based PDF page indices, not invented printed page numbers. Printed step numbers are separate.

## Complete manual sequence

The official sequence contains **28 numbered steps**. Joining an existing subassembly does not add another copy of its parts.

| Step | PDF page | Verified action / new callout quantities |
|---:|---:|---|
| — | 1 | Finished model cover view |
| — | 2 | One SPIKE set storage box pictured; not robot inventory |
| — | 3 | Hub battery preparation; battery installs inside Hub |
| 1 | 4 | Hub ×1, short black pins ×4 |
| 2 | 5 | First magenta frame ×1, gray cross block with four integral pins ×1 |
| 3 | 6 | Second magenta frame ×1; stack the handle |
| 4 | 7 | Mount stacked handle to Hub |
| 5 | 8 | Short black pins ×2 at free end of handle |
| 6 | 9 | Medium angular motor ×1, short pins ×2, yellow length-3 axle ×1; motor alignment inset |
| 7 | 10 | Magenta length-5 beam ×1, short pins ×2 |
| 8 | 11 | White short link ×1, tan axle/pin ×1 |
| 9 | 12 | Medium azure 2L liftarm with round and axle holes ×1 |
| 10 | 13 | Join short-link subassembly to motor assembly |
| 11 | 14 | First tire ×1, wheel hub ×1 |
| 12 | 15 | Yellow length-3 axle ×1 into first wheel |
| 13 | 16 | First magenta 2×4 jaw brick with three vertical axle holes ×1 |
| 14 | 17 | First black angled jaw link ×1, yellow length-3 axle ×1 |
| 15 | 18 | Join first jaw and angled link |
| 16 | 19 | Black round 2×2 through-hole tiles ×2; leave axles exposed |
| 17 | 20 | Tan axle/pin ×1 on rear of first jaw link |
| 18 | 21 | Mount first jaw to motor assembly |
| 19 | 22 | Second tire ×1, wheel hub ×1 |
| 20 | 23 | Yellow length-3 axle ×1 into second wheel |
| 21 | 24 | Second magenta 2×4 jaw brick with three vertical axle holes ×1 |
| 22 | 25 | Second black angled jaw link ×1, yellow length-3 axle ×1 |
| 23 | 26 | Join second jaw and angled link |
| 24 | 27 | Black round 2×2 through-hole tiles ×2; leave axles exposed |
| 25 | 28 | Mount second jaw to motor assembly |
| 26 | 29 | Longer black pivot/retaining pin ×1; distinguish it from short pins |
| 27 | 30 | Gray H-shaped coupling link ×1 across rear jaw connections |
| 28 | 31 | Turn and attach complete gripper/motor to frame handle |
| — | 32 | Electrical diagram: motor to Hub port **F** |

## Verified inventory, not guessed catalog IDs

The callouts yield **39 counted robot elements** when the prepared Hub and motor each count as one assembly with captive cables; rechargeable battery is not separately counted. This is an arithmetic total of the callouts, not a manufacturer-published model part count. The lesson additionally asks for **six loose LEGO bricks used for points**; their complete types/colors are not established by this manual and they are excluded from 39.

| Visual part identity | Quantity | PDF pages introducing it |
|---|---:|---|
| Prepared Large Hub | 1 | 4 |
| Short black friction pins | 10 | 4, 8, 9, 10 |
| Longer black pin | 1 | 29 |
| Magenta rectangular open frames | 2 | 5, 6 |
| Gray 1×3 cross block with four integral pins (two on each face) | 1 | 5 |
| Medium angular motor, captive cable | 1 | 9 |
| Yellow cross axles, explicitly length 3 | 5 | 9, 15, 17, 23, 25 |
| Magenta beam, explicitly length 5 | 1 | 10 |
| White short three-hole link | 1 | 11 |
| Tan axle/pin connectors | 2 | 11, 20 |
| Medium azure 2L liftarm, round and axle holes | 1 | 12 |
| Small treaded tires | 2 | 14, 22 |
| White small wheel hubs | 2 | 14, 22 |
| Magenta studded 2×4 jaw bricks with three vertical axle holes | 2 | 16, 24 |
| Black angled perforated jaw links | 2 | 17, 25 |
| Black smooth round 2×2 tiles with center through-hole | 4 | 19, 27 |
| Gray H-shaped coupling link | 1 | 30 |

**Numerical LEGO design IDs and color-specific element IDs are not printed in this manual; manufacturer `partId` fields remain `null`.** The contextual [geometry crosswalk](lego-part-crosswalk.md) now resolves the jaw rounds to `15535.dat` (through-hole tiles, not `4185a/b` pulleys or `2815` tyres), the gray four-pin block to provisional `48989.dat` versus `65489.dat`, and jaw bricks to `39789.dat` with three vertical axle holes. These are LDraw geometry selections, not certified historical molds or manufacturer IDs. The stable `azure-short-connector` key means `60483.dat` in this hand (p12), but `49283.dat` cable clip in Quality's head; resolve by input + build + key, never a global alias. Quantities, page/step mappings and original PDF hashes are unchanged.

## Actual mechanism and connections

Verified from manual imagery:

1. The Hub is the rear handheld mass; two stacked magenta frames form a fixed handle, and the motor body is fixed to the other end (steps 1–5 and 28).
2. One medium angular motor drives the short magenta crank/link through a length-3 cross axle (steps 6–7). The white and azure short-link assembly forms part of the mounting/pivot structure (steps 8–10).
3. Each jaw has an angled perforated link, a magenta vertical-axlehole 2×4 jaw brick, a wheel/tire and two black round 2×2 through-hole tiles (steps 11–25).
4. A gray H-shaped link bridges the rear jaw connections, retained at the pin/axle connections (steps 26–27). These parts are not independent cosmetic fingers.
5. The motor plugs into **F** (page 32).

**Engineering inference:** the assembly has **one powered mechanical degree of freedom**, opening/closing its coupled two-jaw linkage. It is not a five-finger or multi-axis hand. Passive wheel/connection behavior is not an additional independently commanded grasp axis. An exact linkage solver needs verified pivot coordinates and attachment indices; the drawings alone are not a supplied CAD constraint system.

**Gripping range:** no calibrated maximum/minimum jaw opening, motor travel limit, gripping force or payload is specified in the inspected manual or lesson. Report range as **unknown**, not a guessed millimeter span derived from the cover perspective. The lesson demonstrates handling, stacking and passing LEGO bricks; that establishes intended tasks, not a numerical grasp envelope. No exact assembled transforms, tolerances or pin-hole indices have been established here.

## Official operation versus extensions

[Lesson, Explore/Explain/Elaborate](https://education.lego.com/en-us/lessons/prime-extra-resources/pass-the-brick/): students build the hand and six loose scoring bricks, test the hand, move bricks from A to B one at a time, stack bricks, then pass bricks between teams. These are human-operated teamwork challenges, not autonomous sorting.

The same lesson’s **Building Tips** says the hand opens/closes using the Hub’s left/right buttons. However, the currently linked [possible-solution SVG](https://assets.education.lego.com/v3/assets/blt293eea581807678a/bltc6b07403d9294da2/6399c2a031c74c1cc74f9795/spike_extra_resources_pass_the_brick_step04-hint_en.svg?locale=en-us), actually rendered and inspected, instead shows:

- At program start: motor F clockwise for **0.2 seconds**.
- Left button pressed: start F at **−100% power**.
- Left button released: motor F clockwise for **0.2 seconds**.

Preserve this prose/program discrepancy; do not claim that both sources encode an identical two-button program. These timings are not calibrated jaw endpoints or safe stall limits.

The lesson labels the following as alternatives/extensions, not original manual hardware:

- Open/close by tilting the Hub left/right.
- Incorporate a **Force Sensor**. No Force Sensor is present in the inspected 28-step manual BOM or wiring diagram.

The [official medium angular motor specification](https://assets.education.lego.com/v3/assets/blt293eea581807678a/blt692436dd1e8fa71c/5f8801d5c8a27c1d9614c27e/techspecs_technicmediumangularmotor.pdf?locale=en-us) documents speed and position sensing, 360 counts/revolution and position accuracy ≤±3°. Hardware capability does not prove an exact gripper opening or that the lesson closes a calibrated position-control loop.

## Authorized CAD search and licensing

Searches for this build by model/lesson name plus MPD, LDraw, Studio and CAD did **not locate a verified, authorized complete assembly**. This is a bounded search result, not a claim that no file exists anywhere.

- [LDraw OMR](https://library.ldraw.org/omr) is a potential official-set model repository; inspecting its landing page did not establish a matching hand model or model-specific license.
- [John Holbrook’s educational-set CAD palettes](https://www.johnholbrook.us/LDD_sets.html) explicitly allow use and derivatives with backlink credit. They are **laid-out set parts**, not this assembled hand. The author notes SPIKE Studio files need Philo’s parts pack and the LDraw set palette is missing 28T gears. This permission does not establish the licensing of every separate part-geometry dependency or LEGO’s manual imagery.
- [LEGO Education’s legal notice](https://education.lego.com/en-us/support/legal-notice/) allows downloading for non-commercial home personal use with notices retained, and requires written permission for public/commercial copying, uploading or distribution. Public availability is not a redistribution license.

Keep the downloaded PDFs, source SVGs, screenshots/renders and text extraction in the private research cache. A publicly distributed application should link to official instructions, not bundle them without the necessary permission. An original procedural visualization still needs accurate measured/CAD attachment data before it can truthfully be described as dimensionally faithful.

## Remaining evidence gaps

- Authoritative numeric part/element IDs and full assembled CAD transforms.
- Exact physical pivot coordinates, joint limits, grasp range and force/payload.
- Exact historical molds remain uncertified; the gripping-round source shape is resolved to `15535.dat`, not an open shape gap.
- Exact accessory brick composition beyond the lesson’s total of six.
- Embedded lesson videos were not frame-inspected; the operation findings above derive from the official prose and rendered program diagrams, not an asserted video observation.

No app code, build, lint, test or formatter work was performed for this research slice.
