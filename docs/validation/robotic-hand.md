# Robot Hand reconstruction — authored, not independently verified

## Coverage and verification boundary

- Official **Pass the Brick / Robot Hand**, 2019 PDF export: **28 numbered instructions, 39 prepared robot callout units**. One additional unnumbered electrical operation represents p32; it is not a fabricated numbered instruction.
- Implemented: all 28 numbered source steps, 39 distinct physical identities, one installation per new identity, real reused-module transfers, source-page synchronization, inspection connections, native-origin licensed geometry, one F motor and a coupled post-assembly demonstration.
- **Verified steps: 0. Verified placements/components: 0.** Native geometric evidence and the newly passed independent unit/real-browser behavior checks are not source registration or physical fit certification.
- Parent integration ran the strict manifest build, `npm run check`, the complete unit suite and dedicated Chrome `additional-robots.spec.ts` scenario (grip/release with the *same* coupled-jaw model); the full-browser union status is recorded in [current coverage](coverage-baseline.md). Source-view contact and collision audit still remain.

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
| Black3×7 bent jaw beam |32271|2|17,25|
| Black smooth round through-hole tile |15535|4|19,27|
| Gray H coupler |14720|1|30|

The azure part is60483, not Quality Check's49283 cable clip. The four15535 tiles are not pulleys or tyres. Each56903 rim and61254 tyre has its own identity and source installation.48989's circular-center historical mold remains provisional versus65489; do not claim mold certification.

## Native mating datums and mechanism

All data are rigid, right-handed, +Y-up, millimeters, scale1. Mesh conversion is `N = Rx(pi) ×0.4mm/LDU`; no recentering/resizing. The following numbers are read from genuine DAT primitive/type1 features. Source-selected indices and assembled registrations remain **unchecked**.

| DAT / native feature | Native LDU datum | Registration / purpose |
|---|---|---|
|54696p01 rotor |`[0,-50,0]`, axisY|Actual `parts/u9363p01.dat` internal rotor, not a replacement disc. Motor body is fixed.|
|u9365 underside mounting bores |`[±20,30,0]` in complete motor|Two source short pins retain the **fixed**32316 beam. The magenta5L beam is not a keyed motor crank.|
|32316 holes |`[0,0,-40,-20,0,20,40]` alongZ|Inner pair matches motor housing; outer pair gives jaw ground pivots atX±16mm.|
|60483 holes |`[0,0,0]` axle and`[0,0,20]` round|Actual8mm keyed drive crank on central yellow axle. Tan pin pivots in the round hole.|
|32184 ends |`[0,±20,0]`, through axisX|Actual16mm white passive link, not a third motor.|
|32271 fixed pivot |`[0,0,120]`, axisY|Both jaws pivot on the actual outer ground pins.|
|32271 intermediate short-arm bore |`[16,0,132]`, axisY|Driven-side long18651 retainer links the white coupler and H bar through a real round bore.|
|32271 terminal axle hole |`[32,0,144]`, axisY|Opposite jaw tan axle/pin and H endpoint. Terminal arm length16mm; intermediate arm length8mm.|
|14720 crossbar seats |`[-20,0,40]` and`[0,0,-40]`|Selected span`hypot(32,8)`mm. Exact manual hole correspondence requires independent comparison.|
|32271 jaw-tip axle bores |`[0,0,0]` and`[0,0,40]`|16mm pitch registers the outer39789 vertical holes±20LDU. Wheel axle occupies the z40 bore.|
|56903 /61254 |Common origin, native axisZ|Rim and tyre are separate concentric genuine assets; nominal band-edge radius23LDU and axial edge9LDU supply the demo contact model.|
|39794 handle |Frame centersX±8mm,Z104mm; rotated90° aboutZ|Two actual stacked frames, not a stretched single rectangle.|
|48989 |Pin shafts atnativeY±20,Z±10 and extensions|One cross block bridges source long-edge bores; the modeled bridge is centeredY24mm.|
|Hub end mounting |Native`[±40,-10,110]`,`[±40,-50,110]`|Hub is rotated90° aboutZ; translationX12mm registers the two frame planes.|
|Motor rear |Native`[±20,0,150]`|Handle front end pins atworldX±8mm,Z60mm.|

Closed-loop anchors are projected **along the actual parallel pin/axle axes** onto commonY24mm. Projection changes neither physical bore-axis location nor XZ link length. Two extra distance constraints orient the actual white/H meshes by a second native jaw bore; these are geometric closure equations, not additional physical rods or counted hardware.

There is one commanded coordinate: F rotates60483 plus the same installed yellow motor axle. The first planar loop solves the driven jaw and white coupler. The second solves the other jaw and H coupler with unequal8/16mm rear lever arms; it is nonlinear, not an invented equal/opposite finger ratio. Both actual jaw tips, bricks, tiles, rims and tyres remain descendants of their installed moving jaw roots.

## Assembly journal

Numbered step new-unit counts, independently transcribed from p4–31:

`5,2,1,0,2,4,3,2,1,0,2,1,1,2,0,2,1,0,2,1,1,2,0,2,0,1,1,0` (sum39).

Steps4,10,15,18,23,25,28 transfer the **already-built** physical module roots with every installed descendant as participants. Pins/axles have distinct approach and axial insertion stages using the supplied seat direction/depth. Original presentation staging and timing are not source dimensions. Every new part begins visibly in inventory, gets exactly one installation milestone and is then carried by its actual module. Later root motion never substitutes a second robot.

The p31 turn is a camera/view convention rather than a new numbered part operation; the physical operation there is the genuine gripper-to-handle join. P3 battery preparation is linked to step1 without introducing a fake battery identity. P32 commits the source F electrical edge. Cable endpoint topology is implemented; unknown flexible cable curve/length is explicitly not fabricated.

## Demonstration and source-program distinction

The single scenario is explicitly **RoboBuild extension — coupled grip, hold and release**:

1. Close the one actual powered crank within a conservative modeled0…2.4rad range; the passive joints solve both loops.
2. At3000ms, capture the original non-BOM block using two distinct local anchors on the **two actual61254 tyre instances**. Block side-face points are±8mm; nominal tyre band radius is9.2mm. Capture rejects contact gaps/teleports rather than simply hiding the object.
3. Hold the solved grip while a separately labeled scripted human-hand lift translates the actual whole assembly50mm.
4. At6000ms, release at the exact current world pose and reopen the same jaws. The released block remains externally supported, not a claimed gravity/collision simulation.

The GLB prop's orientation/position and static closed contact registration are authored from the native linkage dimensions. Runtime evaluates only the shared `SimulationCore` nonlinear solver and object-event journal; there is no separate hand animation/timeline architecture. Nominal tyre-band contacts do not establish compliant-contact force, correct tread-polygon engagement, clearance or payload.

**Do not merge the official control variants:** lesson Building Tips describes Hub left/right buttons, while the linked possible-solution SVG shows startup F clockwise0.2s, left press F−100% power and left release F clockwise0.2s. The UI scenario description and limitations preserve this discrepancy. The app's position-based endpoints/hold/lift sequence are not falsely labeled a source power/time program. Force Sensor and tilt control are optional lesson extensions, not original hardware in this model.

## Exercised runtime behavior and outstanding physical review

`tests/unit/robotic-hand.test.ts` independently checks source-family quantities, per-step actual journal installation states, no double-count on reuse, zero/final/backward/replay sampling, genuine native pivot features, rim/tyre identity, nonlinear loop residuals and passive coupler coincidence, two-contact capture, held translation, continuous release, invalid contact rejection and deterministic simulation seeking.

Parent executed the strict generator/type/unit checks and actual Chrome grip demonstration. Further acceptance requires comparing first/middle/difficult/final/exploded/technical/simulation browser views against private pages5–7,9–13,18–21,28–31. In particular inspect bridge source seats, motor underside stack, H bar crossbar indices, long-pin axle depth, brick/tile studs, tyre contact/clearance and the open-to-closed swept volume. Correct failures in source geometry, not by weakening source counts, disabling constraints or promoting unchecked fits.

Actual source-state browser evidence at 1512 × 982: [numbered step 13, 23/39 installed](screenshots/robotic-hand-intermediate.webp) and [post-assembly coupled F output at 4.2 s, 39/39 installed, one original non-BOM prop](screenshots/robotic-hand-grip.webp). These screenshots prove live scene/source linking and output motion, **not** force, measured jaw contact or true mechanical tolerances.

Physical limits, jaw opening calibration, force/payload, real friction/deformation, complete collision clearance and dynamic flexible cable routing remain unknown. No completion/verification claim is made beyond the authored coverage above.
