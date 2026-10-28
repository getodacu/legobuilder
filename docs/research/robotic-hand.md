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

Independent source-fit comparison additionally corrects the Hand black angled beams to **[`32348.dat`](https://library.ldraw.org/library/official/parts/32348.dat), 4×4 bent53.13°**, not32271 (3×7). P17/p25 have four hole centers per arm, a common bend and axle-shaped terminal holes. Two original instance IDs,39 units and28 source steps are retained.

## Actual mechanism and connections

Verified from manual imagery:

1. The Hub is the rear handheld mass; two stacked magenta frames form a fixed handle, and the motor body is fixed to the other end (steps 1–5 and 28).
2. The magenta5L beam is pinned to the **fixed motor housing underside**, not a powered crank (p9/p10). The central yellow3L axle drives the **azure60483 crank** through its cross-shaped hole (p12/p13); the tan pin in the adjacent round hole carries the white32184 passive link.
3. Each jaw has an angled perforated link, a magenta vertical-axlehole 2×4 jaw brick, a wheel/tire and two black round 2×2 through-hole tiles (steps 11–25).
4. A gray H-shaped link bridges the rear jaw connections, retained at the pin/axle connections (steps 26–27). These parts are not independent cosmetic fingers.
5. The motor plugs into **F** (page 32).

**Engineering inference:** the assembly has **one powered mechanical degree of freedom**, opening/closing its coupled two-jaw linkage. It is not a five-finger or multi-axis hand. Passive wheel/connection behavior is not an additional independently commanded grasp axis. Source-selected nominal indices have now been independently compared below; imagery is still not a supplied tolerance-qualified CAD assembly.

**Gripping range:** no calibrated maximum/minimum jaw opening, motor travel limit, gripping force or payload is specified in the inspected manual or lesson. Physical range remains **unknown**. Handling, stacking and passing tasks do not supply a numerical grasp envelope. Nominal pin/hole registration below does not establish measured endpoints or physical tolerances.

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

## Independent source-fit comparison, 2026-10-20

The private original PDF and cached pages4–31 were compared directly with original DAT type1 features. Higher-resolution in-memory PDF crops resolved p5 arrows, p14–19/p22–27 tip stacks, p17/p25 jaw callout, p21/p28 mounting arrows, p29 retaining-axle arrow and p30 occupied/unused H holes. No manual imagery was added to public assets.

### Complete contiguous handle

- P5 arrows select full long-edge holes2/4 from the free short end, zero-based:39794 native`[60,0,60]` /`[60,0,20]`, axisY. Its`s/39790s01.dat` gives actual bores, not bounding-box anchors or intermediate surface pockets.
-48989 integral shafts have axesZ, rowsY±20, basesZ±10, midpoint seatsZ±20 and endsZ±30. P5 first frame receives`[0,∓20,-20]`; p6 second frame receives`[0,∓20,20]`. This fixes16mm frame-plane separation and16mm along-edge pitch.
- Scene frame planesX±8, inward facesX±4 and bridge center`[0,24,88]`mm follow those seats. The old bridgeZ104mm was wrong. Both bridge and second-frame installation directions are−X8mm, not+X through the first frame. All four contacts and inward face planes are registered and independently transcribed in the regression.
- P4/P7 hub corner end holes follow45601→u9402 offsetY−30→u9402s01`[±40,±20,100]`, exteriorZ110, axisZ. Complete seats`[±40,-10/-50,110]` receive four original pins;39794 short-end cross bores`[±40,0,-100]` meet exposed halves at sceneZ144. Hub/frame exterior isZ148.
- P8's free-end pins occupy39794 central short-end cross bores`[0,0,100]`, axisZ. P31 rear motor bores followu9364c01 offsetZ140 plusu9366s01 exterior`[±20,0,10]`; complete motor`[±20,0,150]` and frame exterior coincide at sceneZ60. No retention/clearance measurement is implied.

### Motor underside and corrected linkage

- P9/P10 mounting pair uses complete-motor exteriors`[±20,30,0]`, derived fromu9364c01 offsetY20 andu9365s01 features.32316 inner holes1/3 atnativeZ±20 seat on these pins; outer holes0/4 atZ±40 retain the jaw pins. Motor exterior/beam undersideY12mm, beam centerY16/topY20, jaw centersX±16/Y24mm. The beam is fixed.
- P11–13 white32184 end axle bores`[0,±20,0]`, axisX, span16mm. Tan axle enters white; tan round pin enters60483 round bore`[0,0,20]`. Its keyed motor bore is`[0,0,0]`, radius8mm. White occupiesY12…20, azureY20…28mm.
- P21/P28 ground jaw pins use32348 **second rear round**`[32,0,84]`; p29 long axle uses **first rear round**`[16,0,72]`; p20 tan axle uses terminal`[48,0,96]`. Original declarations are`beamhole`, `connhole`, `axlehol4`; bend is`[0,0,60]`. Old32271 and its bend-pivot assumption were concrete errors.
- P30 black/tan retainers occupy opposite diagonal **crossbar ends** on14720:`[20,0,-40]` /`[-20,0,40]`, span`hypot(32,16)`mm. Two holes on each crossbar remain unused. Old center/end selection was wrong.
-18651's axle descends through the round jaw bore to the white axlehole. The white/axle seat is keyed; rotation occurs in the round jaw bore. CollarY28 and pin half-centerY32 support H centerY32. Opposite tan axle keys into the jaw terminal and leaves its round half upward for H.

The resulting **53 nominal registrations across39 identities** are individually enumerated, with native coordinates, actual bearing planes and installation directions, in [the validation ledger](../validation/robotic-hand.md#per-contact-nominal-support-ledger). The complete p5–6 handle uses four source-selected shaft seats; the14 fingertip units now have20 registrations. A registration is not necessarily a zero-gap contact: the rim/tyre shortcut defines coincident origins, and shaft axial sections remain nominal where the source supplies no stop.

Selected rear lever lengths are8/8mm on opposite sides of their ground pivots. The H diagonal produces a genuinely nonlinear opposite-jaw angle, **not** a symmetric finger ratio. The installed meshes, reversible journal and shared nonlinear solver remain; original demo-block registration is recalculated for corrected wheel centers.0…0.6rad is modeled, not a source stop/calibration. All fits remain`unchecked`; verified-step/component counts are not promoted.

Native primary sources: [`39794`](https://library.ldraw.org/library/official/parts/39794.dat), [`48989`](https://library.ldraw.org/library/official/parts/48989.dat), [`u9402s01`](https://library.ldraw.org/library/official/parts/s/u9402s01.dat), [`u9365s01`](https://library.ldraw.org/library/official/parts/s/u9365s01.dat), [`u9366s01`](https://library.ldraw.org/library/official/parts/s/u9366s01.dat), [`32316`](https://library.ldraw.org/library/official/parts/32316.dat), [`32184`](https://library.ldraw.org/library/official/parts/32184.dat), [`60483`](https://library.ldraw.org/library/official/parts/60483.dat), [`32348`](https://library.ldraw.org/library/official/parts/32348.dat), [`18651`](https://library.ldraw.org/library/official/parts/18651.dat), [`14720`](https://library.ldraw.org/library/official/parts/14720.dat). Original cached roots/dependencies were inspected.

### Fingertip source/native stack

- P14/p22 show56903's detailed four-spoke face upward and **rim moving down into the tyre**, not the reverse. Official[`56903c01`](https://library.ldraw.org/library/official/parts/56903c01.dat) places56903 and61254 at coincident origins. The actual rim flange radius21 and tyre inner radius22LDU leave0.4mm nominal radial clearance; native registration is established, elastic bead retention is not.
- P18/p26 put wheel below32348. The rim upper hub face at nativeZ10, radius6…10, meets the jaw lower round-bore entrance face at nativeY+10 on the first jaw and Y−10 on its flipped mate, radius8…9. Their radius8.5 samples meet at sceneY20, establishing wheel centerY16 without bounding-box seating. Wheel shaft station is jaw`[0,0,40]`, a round`connhole`; the other shaft uses keyed terminal`[0,0,0]`. Brick outer axleholesX±20 match these40LDU-spaced stations, leaving its centralX0 hole unused.
-39789's **true lower support annulus isY24**, radius6…8. Its`stud4a` is translatedY18 and scaled−1.5, so the primitive'sY−4 end reaches24. The front tube's radius7 annulus rests on32348's terminal upper face at nativeY−10 on the first jaw and Y+10 on the flipped mate, radius6…9, at sceneY28. Brick top staysY37.6; an apparentY18 support would incorrectly sink it2.4mm. Signed local faces must reflect the second jaw's rotation; both physical upper planes remain worldY28.
- P19/p27 tiles seat on the four real studs around each outer axlehole.39789's`stug-2x2` offsets are`[±10,0,±10]`.15535s02 has undersideY8 and stud-pocket roofY4: brick faceY37.6 and stud topsY39.2 meet these surfaces, putting tile topY40.8. All four tiles now rotate with their brick so pockets capture the studs. Rims and all four fingertip shafts likewise follow the brick's keyed cruciform directions.
- P19/p27/p31 visibly expose yellow axle tips; old centerY28 recessed4519's actual beveledX29.5 end atY39.8 below tile topY40.8. **CenterY30 is a corrected authored nominal sliding registration**, yielding tipsY41.8,1mm proud, and lower tipsY18.2. The full straight shaft startsY19, giving only1mm full-shaft plus0.8mm bevel within rim boreY12…20. The source gives **no dimensioned insertion stop**: neither this selected depth, full rim engagement nor its retention strength is independently established. Front-jaw8mm engagement and source upward direction are established; a full-depth wheel stop is not invented.

Native primary sources: [`56903`](https://library.ldraw.org/library/official/parts/56903.dat), [`61254`](https://library.ldraw.org/library/official/parts/61254.dat), [`4519`](https://library.ldraw.org/library/official/parts/4519.dat), [`39789`](https://library.ldraw.org/library/official/parts/39789.dat), [`15535s02`](https://library.ldraw.org/library/official/parts/s/15535s02.dat), [`stud4a`](https://library.ldraw.org/library/official/p/stud4a.dat), [`peghole`](https://library.ldraw.org/library/official/p/peghole.dat). The compact regression independently transforms these native features through the final consumer frame, including pocket roofs, keyed directions, genuine bearing faces and exposed bevels.


## Remaining evidence gaps

- Manufacturer part/element IDs and exact historical molds;48989 versus65489 remains provisional despite matching source four-shaft grid.
- Physical tolerances/retention, motor encoder-to-jaw zero, physical stops, grasp range, safe stall limit and force/payload. P9's qualitative alignment inset does not dimension internal axle engagement.
- Fingertip **axial insertion stop and retention**, not identities or bearing/stud stations: source does not dimension56903 engagement. CorrectedY30 shaft centers are labeled nominal sliding registrations, with shallow1mm full-shaft/0.8mm bevel overlap and1mm tile-tip exposure.61254 elastic bead retention remains unmeasured despite source/published-shortcut origin agreement.
- Open-to-closed swept collision clearance, tyre tread/compliance/contact force and calibrated captive-lead length/dynamic clearance. A2026-10-28 reinspection of p31 supports a qualitative loop over the handle, now rendered from native motor/Hub F endpoints and explicitly authored slack guides. Its rectangular ribbon envelope follows the real six-wire stub CAD profile, not a measured cable section/length or elastic solver; no additional inventory is counted.
- Exact accessory brick composition beyond the lesson’s total of six.
- Embedded lesson videos were not frame-inspected; the operation findings above derive from the official prose and rendered program diagrams, not an asserted video observation.

The2026-10-28 continuation preserves all53 nominal registrations, all39 identities and the existing working F-powered clamp/closed loops; no angle or grasp-contact values are changed. It corrects the placement label to `diagram-derived` (manual-selected CAD seats are not measured attachments) and the coverage note that previously omitted20 already-audited fingertip registrations. Nominal validation and source callout reconciliation are actual completed work; physical force, encoder calibration and undimensioned sliding stops remain separate unmeasured limits. The shared scene now consumes parent-local cable guides, including the source p31 handle loop and Quality's clip-threaded leads. The current cable/evidence revision has not run a build, test, lint, formatter or browser check; parent should exercise the updated regressions. Existing geometry/runtime evidence is recorded in [validation](../validation/robotic-hand.md).
