# Robot Hand reconstruction — source-indexed nominal contacts, physical fits unchecked

## Coverage and verification boundary

- Official **Pass the Brick / Robot Hand**, 2019 PDF export: **28 numbered instructions, 39 prepared robot callout units**. One additional unnumbered electrical operation represents p32; it is not a fabricated numbered instruction.
- Implemented: all 28 numbered source steps, 39 distinct physical identities, one installation per new identity, real reused-module transfers, source-page synchronization, inspection connections, native-origin licensed geometry, one F motor and a coupled post-assembly demonstration.
- **Physically verified steps/components: 0.** Independent comparison supports **53 nominal registrations across all39 identities**, including14 fingertip units. These include source-selected shafts, real bearing planes, stud pockets and the published rim/tyre registration; sliding axle positions remain authored where no insertion stop is dimensioned. This is not collision, tolerance, retention or manufacturer certification; every `fit` stays `unchecked`.
- Earlier parent integration exercised previous geometry with the strict manifest build, `npm run check`, unit suite and Chrome grip scenario. Historical results do **not** validate this corrected jaw/H/tip-stack revision. This source-fit assignment ran no build, test, lint, formatter or browser check; parent must run the updated regressions.

The 39-unit count is an independently transcribed sum of source callouts, not a printed manufacturer model total. A prepared hub includes its rechargeable battery (unnumbered preparation p3); a motor includes its captive lead. Integral pins on48989 are features of one prepared unit. Neither module reuse nor wiring adds another unit. The lesson's six scoring bricks have unestablished types/colors and remain excluded. The one original RoboBuild demo block is a separate `simulationObject`, never a source part or inventory line.

## Source and license

- [Official manual](https://assets.education.lego.com/v3/assets/blt293eea581807678a/bltd34f6e501eb5ff30/5f8802b8bf5ab07ee90076df/pass-the-brick-bi-pdf-book1of1.pdf?locale=en-us), 32 pages, SHA-256 `561591039e9933b98f8bd59d4e25afa809ae5110f154d6538955d0bc65cb5ee2`.
- [Official lesson](https://education.lego.com/en-us/lessons/prime-extra-resources/pass-the-brick/).
- [Supplied possible-solution SVG](https://assets.education.lego.com/v3/assets/blt293eea581807678a/bltc6b07403d9294da2/6399c2a031c74c1cc74f9795/spike_extra_resources_pass_the_brick_step04-hint_en.svg?locale=en-us), SHA-256 `8538d55e0e2973749b709a2e111eef51136aba258c4a5fdab597d4974b0abcb5`.
- Research: `docs/research/robotic-hand.md`, `docs/research/data/hand-quality.json`, contextual `lego-part-crosswalk.json`. Private manual originals/renders remain under `.research-cache/hand-quality`; no manual imagery is copied into public assets.
- All physical meshes are actual selected LDraw roots with original headers, authors, licenses, source URLs, dependency attribution and hashes in the generated library manifest. CC BY4.0 and where applicable CC BY2.0/4.0 attribution is preserved. These root IDs are **geometry identifiers**, not certified LEGO manufacturer IDs; the manual prints no numerical design/element numbers.
- Demo block: original project-authored Blender GLB `robobuild-demo-block`, project provenance in `/models/simulation/PROVENANCE.txt`. Actual geometry bounds are16×20×32mm, meter-to-mm conversion exactly once; no LEGO part or manual accessory identity is implied.

## Complete family/BOM provenance

| Source family | LDraw root | Quantity | First-introduction PDF pages |
|---|---|---:|---|
| Prepared hub |45601c01|1|4|
| Short black friction pin |2780|10|4,8,9,10|
| Long black axle/pin |18651|1|29|
| Four-integral-pin cross block |48989|1|5|
| Magenta11×7 frame |39794|2|5,6|
| Prepared medium angular motor |54696p01|1|9|
| Yellow3L axle |4519|5|9,15,17,23,25|
| Magenta5L beam |32316|1|10|
| White axle/pin/axle cross block |32184|1|11|
| Tan axle/pin |3749|2|11,20|
| Azure2L round/axle liftarm |60483|1|12|
| Rubber tyre |61254|2|14,22|
| Separate white rim |56903|2|14,22|
| Magenta2×4 brick with3 vertical axle holes |39789|2|16,24|
| Black4×4 bent jaw beam |32348|2|17,25|
| Black smooth round through-hole tile |15535|4|19,27|
| Gray H coupler |14720|1|30|

The azure part is60483, not Quality Check's49283 cable clip. The four15535 tiles are not pulleys or tyres. Each56903 rim and61254 tyre has its own identity and source installation.48989's circular-center historical mold remains provisional versus65489; do not claim mold certification.

## Independent source/native contact comparison

Private official pages **4–31** were inspected for the affected source interfaces, including higher-resolution PDF crops of fingertip assembly p14–19/p22–27, source arrows, bent-part callouts and occupied H holes. Native numbers below come from original DAT type1 features and referenced surface primitives, not existing connection-point coordinates or bounding boxes. Conversion remains `N = Rx(pi) ×0.4mm/LDU`; all transforms are rigid and preserve origins.

### Concrete corrections

- **Wrong jaw identity:** p17/p25 show four holes per arm with a common bend and axle-shaped terminal holes: **32348**, not the old 32271 seven-hole/three-hole beam. Both original instance IDs and introduction steps14/22 remain unchanged.
- **Wrong ground/pivot indices:** p21/p28 mount each jaw at rear round hole `[32,0,84]`, one pitch before the terminal. P29's long retainer enters the *first* rear round hole `[16,0,72]`. P20's tan axle occupies terminal `[48,0,96]`.
- **Wrong H hole:** p30 has the black and tan retainers in diagonally opposite **crossbar ends**, leaving two unused holes on each crossbar. Native seats are `[20,0,-40]` / `[-20,0,40]`, not center/end. The in-plane span is `hypot(32,16)`mm.
- **Wrong handle bridge station/direction:** p5 arrows select long-edge positions2 and4 from the free end, zero-based, at native `[60,0,60]` / `[60,0,20]`. Bridge center moves from sceneZ104 to **Z88mm**. Both integral-pin bridge insertion and second-frame insertion run **−X**, not through the already seated first frame in +X. All four integral pins now have contact registrations.
- **Wrong connection kind:** the white end is keyed onto the long retainer axle; their connection is fixed. The pivot is the real round jaw bore, not a fictitious round white hole.
- **Wrong fingertip keyed/pocket directions:** the four fingertip4519 shafts, two56903 rims and four15535 tiles now rotate with the matching39789 brick. Cruciform lobes and four-stud underside pockets align, not merely their vertical centerlines. P14/p22 animate the rim downward into the already present tyre, as the source arrow shows, rather than moving the tyre onto a stationary rim.
- **Recessed yellow tips:** native4519's beveled end isX±29.5LDU, not the nominal±30 datum. The old centerY28 put tipsY39.8 below tile topY40.8, contradicting p19/p27/p31. Both pairs now use **nominal centerY30**, yieldingY18.2…41.8 and1mm exposed tips. This corrects source direction/exposure but is **not a measured insertion stop**; permissible axial sliding and shallow wheel engagement remain explicit below.

### Per-contact nominal support ledger

Every row is independently source-selected and native-feature-supported, **not** independently cleared for tolerances/collision. `±` rows enumerate both instances. Shaft coordinates specify selected engagement sections, not an assertion that a hole has an invented end stop.

| Connection IDs / count | PDF selection and native LDU features | Nominal scene seat / installation |
|---|---|---|
|`hand-hub-end-0…3` /4|P4 four end-face corner bores; `u9402s01` `[±40,±20,100]`, complete hub bottom offsetY−30; exterior `[±40,-10/-50,110]`|Pin collars atZ148mm; insert+Z8mm.|
|`hand-frame-bridge-1`, `-1-other` /2|P5 arrows at long-edge indices2/4:39794 `[60,0,60/20]`;48989 `[0,∓20,-20]` shaft midpoints|First frame planeX−8; inner faceX−4 matches integral-pin baseZ−10LDU; bridgeZ88; insert−X8mm.|
|`hand-frame-bridge-2`, `-2-other` /2|P6 matching holes in second frame;48989 positive-Z shaft midpoints `[0,∓20,20]`|Second frame planeX8; inner faceX4 matches pin baseZ10LDU; insert−X8mm.|
|`hand-handle-hub-0…3` /4|P7 short-end transverse bores39794 `[±40,0,-100]`, axisZ; hub pins nativeX10LDU sections|Four bore centersZ144; frame outer end planeZ148 meets hub end face.|
|`hand-handle-end-pin-0/1` /2|P8 free short-end central transverse bore39794 `[0,0,100]`, axisZ; pinX−10LDU sections|CollarsZ60, receiving frame centersZ64; insert+Z8mm.|
|`hand-motor-handle-0/1` /2|P31 existing pins to rear motor; `u9364c01` offset140Z + `u9366s01` exterior `[±20,0,10]` ⇒ complete `[±20,0,150]`|Motor rear and handle exterior bothZ60mm. Transfer animation is presentation, not measured human approach.|
|`hand-body-pin-0/1` /2|P9 underside housing pair flanks central axle; `u9364c01` offset20Y + `u9365s01` exterior `[±20,10,0]` ⇒ complete `[±20,30,0]`|Motor exterior/pin collarsY12; downward insertion−Y8mm.|
|`hand-body-ground-0/1` /2|P10 five-hole32316 inner positions1/3: `[0,0,±20]`, axesY; housing pinsX10LDU|Beam centerY16, undersideY12 meets motor plane; insert−Y8mm. This beam is fixed, not a crank.|
|`hand-ground-pin-0/1` /2|P10 new pins at32316 terminal positions0/4: `[0,0,±40]`; lower pin sectionsX−10LDU|Pin collarsY20 on beam top; lower half-centerY16; insert−Y8mm.|
|`hand-central-output-axle` /1|P9 central3L axle through output axis, not either mounting bore; exterior datum `[0,30,0]`, axleX−10LDU|Axle extendsY4…28; source does not supply its internal engagement stop/depth.|
|`hand-white-tan-axle` /1|P11 tan axle in32184 terminal `[0,-20,0]`, native axisX; tanX10LDU|WhiteY12…20, collarY20, axle half-centerY16; insert−Y8mm.|
|`hand-white-crank-pivot` /1|P12/p13 tan round pin to60483 round hole `[0,0,20]`, **not** cross hole0; tanX−10LDU|AzureY20…28 and round half-centerY24; crank radius8mm.|
|`hand-keyed-drive` /1|P13 central yellow axle to60483 cross hole `[0,0,0]`; axleX20LDU|Azure centerY24, topY28 at axle tip; underside crank stationZ−8 selected by P13/P21 free white-end orientation.|
|`hand-jaw-ground-0/1` /2|P21/p28 arrows at32348 second rear round `[32,0,84]`, axisY; ground-pinX10LDU|Jaw centerY24, undersideY20 seats on beam top; groundX±16.|
|`hand-opposite-rear-axle` /1|P20 terminal32348 `[48,0,96]`; tan axleX10LDU|Axle enters from underside; collarY28, axle half-centerY24; pin points upward.|
|`hand-driven-retainer-bore` /1|P29 first rear round32348 `[16,0,72]`;18651 axleX0|Long retainer collarY28, axle through jaw centerY24; insert−Y16mm.|
|`hand-white-retainer` /1|P29 free32184 axle end `[0,20,0]`;18651 axleX20LDU|Keyed engagement centerY16; white is fixed to axle, jaw round bore pivots.|
|`hand-h-retainer` /1|P30 near14720 crossbar **end** `[20,0,-40]`;18651 pinX−20LDU|H centerY32, undersideY28 on jaw; pin half-centerY32; install−Y8mm.|
|`hand-H-opposite-pin` /1|P30 opposite14720 crossbar **end** `[-20,0,40]`; tan pinX−10LDU|Other H seatY32; source leaves two holes unused on each crossbar.|
|`hand-wheel-tyre-0/1` /2|P14/p22 rim detailed face up, inserts downward; official56903c01 places56903/61254 at identical native origins|CentersY16, native+Z upward. Flange radius21 vs tyre inner22LDU gives0.4mm nominal radial clearance; not a zero-gap elastic bead fit.|
|`hand-wheel-axle-0/1` /2|P15/p23 upright yellow3L axle enters56903 nativeZ−10…10 through-bore; selected rimZ7.5 / axleX−27.5 sections shareY19|Axle centerY30 is **authored sliding registration**. Real beveled spanY18.2…41.8, full shaftY19…41; rim boreY12…20 receives1mm full shaft plus0.8mm bevel, not a fabricated full-depth stop.|
|`hand-brick-hole-0/1` /2|P16/p24 wheel shaft through39789 outerX±20 hole, native axisY; middleX0 unused; bore surface spansY0…24 with18LDU straight inner section|Brick topY37.6 / axleX19; brick support annuli reachY28. No axial shaft stop is supplied.|
|`hand-front-jaw-axle-0/1` /2|P17/p25 new shaft at32348 terminal`[0,0,0]` axlehole; shaftX−15 at jaw center|JawY20…28 fully traversed, axle points up; animate insertion−Y. Cruciform lobes match the terminal, not global unrotated axes.|
|`hand-front-brick-axle-0/1` /2|P18/p26 opposite39789 outer axlehole receives terminal-jaw shaft; outer pitch40LDU matches jawZ0/40|Top-plane section shaftX19 atY37.6. Selected shaft height is nominal, not a source stop.|
|`hand-wheel-jaw-axle-0/1` /2|P18/p26 wheel shaft also traverses32348 **round**`connhole` at`[0,0,40]`|Jaw centerY24 / shaftX−15. Round-bore connection is a pivot; the other front terminal is keyed.|
|`hand-rim-jaw-face-0/1` /2|P18/p26 wheel below jaw;56903 upper hub annulusZ10 radius6…10 meets32348 lower entrance annulus at nativeY+10/−10 for first/flipped jaws, radius8…9, sampled radius8.5|Actual bearing facesY20 fix rim centerY16; not outer mesh bounds. Rim nativeX maps jawZ with opposite signs on the two jaws.|
|`hand-brick-jaw-face-0/1` /2|P18/p26 brick above jaw;39789 reversed`stud4a` atY18 scaled−1.5 puts annulus at**Y24**, radius6…8. Radius7 meets32348 terminal upper face at nativeY−10/+10 for first/flipped jaws, radius6…9|Support planeY28 fixes brick topY37.6. TreatingY18 as the tube end would incorrectly sink the brick2.4mm; using the same signed local face on both mirrored jaws misses by8mm.|
|`hand-tile-stud-0/1-0/1` /4|P19/p27 tiles centered on outer axleholes;39789 studs surround each at offsets`[±10,0,±10]`;15535s02 pocket roofY4 / undersideY8|Brick stud topsY39.2 meet tile pocket roof; brick faceY37.6 meets tile underside. Tile topY40.8, shaft tipY41.8. All four pockets rotate with their brick; tile center hole remains open.|

This completes the contiguous p5–6 three-unit handle using four actual pin axes and mating planes, registers its p4/p7/p8/p31 hub/motor interfaces, and independently identifies all14 fingertip units' source-selected stations and native seating features. The53 inspection registrations include33 earlier handle/motor/linkage pairs and20 fingertip registrations. Axle/rim selected sections and rim/tyre origin agreement are not a claim of a dimensioned axle stop or zero-gap bead contact.

### Source-indexed nonlinear mechanism

The single F output rotates60483 and the same central yellow axle; motor body and32316 remain fixed. On32348 the two selected rear lever lengths are **8/8mm**, pointing to opposite sides of each ground pivot. Equal lengths do **not** imply an invented equal/opposite angular ratio: the H diagonal-end linkage is nonlinear.

At the authored open registration, crank round seat is`[0,24,-8]`, driven rear seat`[16,24,-8]`, opposite terminal seat`[-16,24,8]`mm. The white end-to-end span is16mm; H span is`hypot(32,16)`mm. Axial projection ontoY24 follows the real parallel shaft axes; white center isY16 and H centerY32. Auxiliary distance equations orient the actual meshes using32348 bend`[0,0,60]`; they are not added hardware.

For driver angle`q`, the opposite-jaw circle equation uses`x=32−8sin(q)`, `z=−8cos(q)`, H span squared1280 and rear lever radius8. The source-indexed reference-continuous branch is
`p=asin((x²+z²−1216)/(16 hypot(x,z)))−atan2(z,x)`.
The scripted range0…0.6rad is **modeled**, not a measured physical limit. The original non-BOM block placement/contact anchors are recalculated from corrected wheel centers; source contacts are not moved to make a test pass.


## Assembly journal

Numbered step new-unit counts, independently transcribed from p4–31:

`5,2,1,0,2,4,3,2,1,0,2,1,1,2,0,2,1,0,2,1,1,2,0,2,0,1,1,0` (sum39).

Steps4,10,15,18,23,25,28 transfer the **already-built** physical module roots with every installed descendant as participants. Pins/axles have distinct approach and axial insertion stages using the supplied seat direction/depth. Original presentation staging and timing are not source dimensions. Every new part begins visibly in inventory, gets exactly one installation milestone and is then carried by its actual module. Later root motion never substitutes a second robot.

The p31 turn is a camera/view convention rather than a new numbered part operation; the physical operation there is the genuine gripper-to-handle join. P3 battery preparation is linked to step1 without introducing a fake battery identity. P32 commits the source F electrical edge. Cable endpoint topology is implemented; unknown flexible cable curve/length is explicitly not fabricated.

## Demonstration and source-program distinction

The single scenario is explicitly **RoboBuild extension — coupled grip, hold and release**:

1. Close the one actual powered crank within a modeled0…0.6rad range; the passive joints solve both corrected source-indexed loops. The grip endpoint is selected by the original block's16mm width and native tyre-band anchors, not claimed as a LEGO stop.
2. At3000ms, capture the original non-BOM block using two distinct local anchors on the **two actual61254 tyre instances**. Block side-face points are±8mm; nominal tyre band radius is9.2mm. Capture rejects contact gaps/teleports rather than simply hiding the object.
3. Hold the solved grip while a separately labeled scripted human-hand lift translates the actual whole assembly50mm.
4. At6000ms, release at the exact current world pose and reopen the same jaws. The released block remains externally supported, not a claimed gravity/collision simulation.

The GLB prop's orientation/position and static closed contact registration are authored from the native linkage dimensions. Runtime evaluates only the shared `SimulationCore` nonlinear solver and object-event journal; there is no separate hand animation/timeline architecture. Nominal tyre-band contacts do not establish compliant-contact force, correct tread-polygon engagement, clearance or payload.

**Do not merge the official control variants:** lesson Building Tips describes Hub left/right buttons, while the linked possible-solution SVG shows startup F clockwise0.2s, left press F−100% power and left release F clockwise0.2s. The UI scenario description and limitations preserve this discrepancy. The app's position-based endpoints/hold/lift sequence are not falsely labeled a source power/time program. Force Sensor and tilt control are optional lesson extensions, not original hardware in this model.

## Exercised runtime behavior and outstanding physical review

`tests/unit/robotic-hand.test.ts` retains source-family/per-step counts, deterministic reversible assembly seeking, genuine DAT checks, nonlinear bilateral closure, two-contact capture, held translation, continuous release and deterministic replay. Its53-registration axis regression and compact native consumer-frame fingertip regression cover actual rim/jaw and brick/jaw bearing faces, all four studs/pocket roofs per tile, real beveled axle tips, cruciform orientation, source insertion direction and the undimensioned-stop warning. The longer branch test stays inside the corrected reachable modeled branch.

Parent integration passed the strict four-model generator,871-file typecheck with zero errors/warnings,52 unit tests with one explicitly skipped Sorter pickup acceptance, static production build and18/18 Chromium cases. The targeted Hand regression passed7/7. Those checks caught and corrected one stale p20 retainer coordinate and the flipped jaw's signed bearing faces; no coordinate/angle expectation was weakened to hide a gap. The actual corrected grip and visit/source counters were also exercised from the production bundle. Whole-model molded fit, force and source-undimensioned insertion stops remain unverified.

The corrected source revision was rendered in real Chromium at1512×982 and compared qualitatively with the official p5–6 handle, p30 H and p31 final silhouettes. These original WebGL captures are not source artwork, force/contact measurements or clearance certificates:

| State | Robot units installed | Live capture |
|---|---:|---|
| Staged inventory |0/39 |[Inventory](screenshots/hand-source-inventory.png) |
| Numbered step3 complete, handle prepared |8/39 |[Handle](screenshots/hand-source-handle-seated.png) |
| Numbered step27 H approach, 65% |38/39 |[Source-indexed H mounting](screenshots/hand-source-h-coupler-approach.png) |
| All28 instructions plus unnumbered F wiring |39/39 |[Corrected studio](screenshots/robotic-hand-final-corrected.png) |
| Same endpoint, technical mode |39/39 |[Technical](screenshots/hand-source-technical.png) |
| Same endpoint, exploded presentation |39/39 |[Exploded](screenshots/hand-source-exploded.png) |
| Same assembly grips original non-BOM block, 4.2s |39/39 |[Coupled grip](screenshots/robotic-hand-grip-corrected.png) |

## Exact remaining evidence required

- **Fingertip insertion/retention:** p14–19/p22–27/p31 selects the real surfaces, shafts and exposed tips, but supplies no section or measured56903 axle insertion stop. CenterY30 is one nominal sliding registration:1mm full-shaft plus0.8mm bevel overlaps the upper rim bore, and1mm projects above the tile. Neither shallow engagement strength nor an exact insertion depth is certified. The native rim/tyre shortcut confirms registration, while0.4mm uncompressed radial clearance leaves elastic bead retention/tolerances unestablished.
- **Physical fit of all53 registrations:** no pin friction, mold variation, interference, retention or open-to-closed swept-volume check was measured.48989's circular-center historical mold versus65489 remains provisional despite matching four-pin grid. Nominal rim/jaw and brick/jaw faces do not certify intervening-volume clearance.
- **Motor/jaw calibration:** source p9 alignment inset is qualitative; no encoder-to-jaw zero, physical travel endpoints, safe stall limit, force/payload, real friction or deformation measurement is supplied. Central axle internal engagement depth is also not dimensioned.
- **Tyre grip and cable:** nominal band-edge anchors do not establish tread-polygon/compliant contact or grip force. Captive F lead topology is known, not actual routing/length or dynamic clearance.
- No exact six-scoring-brick composition or manufacturer certification has been established.
