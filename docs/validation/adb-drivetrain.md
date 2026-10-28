# Advanced Driving Base — drivetrain authoring evidence

## Scope and status

`src/lib/models/advanced-driving-base/drivetrain.ts` exports Book 2 `rightSide` and Book 3 `leftSide`. Each has 39 separately identified prepared units, 24 numbered source actions, 39 installation records and three physical reuse/merge actions. The total is prepared callout units, not molded components: one motor is one prepared instance despite its actual body/rotor geometry nodes, and one wheel includes its integral tyre.

Both manuals were inspected independently in private rendered source imagery, including their full 1–12 and 13–24 contact sheets. Additional individual-page inspection covered motor pins, wheel retention, the lower reinforcement, both source merge arrows, rear pins, and side-specific cable clips. This is **authoring evidence, not a passed fit-validation report**. No test, typecheck, build, formatter, browser or simulation gate was run by this producer. Source PDFs and page images remain private.

- [Official Right Side Book 2](https://assets.education.lego.com/v3/assets/blt293eea581807678a/bltaab3ff32deffc66d/5ec8e800f32b1a633f9052dd/advanced-driving-base-bi-pdf-book2of5.pdf?locale=en-us): SHA-256 `7985dd81ea0a880de3ac0223f4d2e382ff359cdad3bc733a688a19c5506a758b`.
- [Official Left Side Book 3](https://assets.education.lego.com/v3/assets/blt293eea581807678a/blt43751cee8daa89a7/5ec8e7f4f32b1a633f9052d7/advanced-driving-base-bi-pdf-book3of5.pdf?locale=en-us): SHA-256 `03f0b4d6bdf4daf5f7fbbaa27a8443ce253a84582f0af4ee9f5ca1a981cd60c3`.
- Page equals numbered instruction in these two 24-page PDFs. This is not true of Book 5: its step 3/A cable is PDF page 6, step 5/E cable page 8, step 8 hub page 11, step 9 rear join page 12, step 13 stop axles page 16, and step 18 underside reinforcement page 21.

## Source quantity/action graph (each book)

The following independent callout graph is taken from the manual and agrees with the research manifest. The implementation preserves the misleading legacy research key `black-angle4x4` only as a family accounting key; page 18 physically introduces a second gray 63869 cross block.

| Step/page | New callout units | Cumulative | Physical action |
|---|---|---:|---|
| 1 | motor ×1; black pin ×5 | 6 | Prepare housing/index and five pins |
| 2 | 5×7 frame ×1 | 7 | Attach frame to housing front |
| 3 | black pin ×2; gray four-pin block ×1; blue 3L pin ×2 | 12 | Output pins, frame support and free frame pins |
| 4 | integral-tyre wheel ×1 | 13 | Seat wheel on output |
| 5 | blue 3L pin ×2 | 15 | Retain wheel |
| 6 | magenta perpendicular block ×1 | 16 | Fit output connector |
| 7 | gray 5L axle ×1; perpendicular axle/pin block ×1 | 18 | Begin separate outside reinforcement |
| 8 | angular beam ×1; perpendicular axle/pin block ×1 | 20 | Add first beam and middle connector |
| 9 | gray four-pin block ×1; yellow 3L axle ×1 | 22 | Upper block and cross axle |
| 10 | angular beam ×1 | 23 | Second parallel beam |
| 11 | perpendicular axle/pin block ×1 | 24 | Third lower connector |
| 12 | black pin ×1 | 25 | Lower connector pin |
| 13 | none | 25 | Merge existing outside reinforcement; never recount it |
| 14 | black 4L axle ×1 | 26 | Output shaft insertion |
| 15 | black pin ×2 | 28 | Changed camera, real rear housing pins |
| 16 | gray 63869 block ×1; blue 3L pin ×2 | 31 | Begin separate cable-end reinforcement |
| 17 | angular beam ×1 | 32 | Add third angular beam |
| 18 | gray 63869 block ×1 | 33 | Second cross block, not a black angle |
| 19 | red pin/axle ×2 | 35 | Retaining axle/pins |
| 20 | gray H-frame ×1 | 36 | Rear-end H-frame |
| 21 | yellow 3-hole beam ×1 | 37 | End cap |
| 22 | none | 37 | Merge existing cable-end reinforcement |
| 23 | blue 3L pin ×1; cable clip ×1 | 39 | Prepare clip unit |
| 24 | none | 39 | Changed camera and physical clip attachment |

Every numbered page performs a physical operation. The rotation icons on pages 15 and 24 are camera changes accompanying real insertion, not a reason to replace these pages with empty camera actions. Pages 13, 22 and 24 reuse already counted hardware. There are **no gears** in either side-book callout graph; the actual 28-tooth gears belong to the front/rear output assemblies, not these direct wheel drives.

Per-book family totals: black pins 10; blue 3L pins 7; angular beams 3; gray perpendicular axle/pin blocks 3; gray integral-four-pin blocks 2; gray 63869 blocks 2; red axle/pins 2; and one each motor, frame, wheel, magenta connector, axle5, axle3, axle4, H-frame, yellow beam and clip. The two 63869 instances retain separate source family keys (`grey-cross3x2` and corrected `black-angle4x4`).

## Native coordinate convention and independent CAD features

Both fragment roots initially have identity transforms. Coordinates below are native LDraw coordinates in LDU, with `N = Rx(pi) × 0.4 mm/LDU` applied once. Acquired meshes are not centered or resized. Part transforms are proper unit-scale rotations. A right/left side is not produced with negative scale. Source housing-side coordinates are selected independently for each book and the cable clips differ (right magenta, left yellow).

### Motor, wheel and shaft — independently constrained

- [54675.dat](https://library.ldraw.org/library/official/parts/54675.dat), lines 16–17: genuine body assembly `u9367c01.dat` and rotor `u9363.dat` at native `[0,-50,0]`. The rotor is an existing internal mesh node `parts/u9363.dat`, not an additional motor instance or synthetic disc. `u9363.dat` forwards to patterned `u9363p01.dat` in the acquired library.
- `u9367c01.dat` translates front top by `[0,-20,0]` and azure back by `[0,0,140]`. `s/u9367s01.dat` front longitudinal holes are `[±40,20,-20]` before its -20Y translation, with actual front faceZ=-30. Native motor front pin seats therefore are `[±40,0,-30]`.
- **Corrected64179 orientation:** `s/64179s01.dat:66` explicitly places a native **X-axis** `connhol2` at `[40,0,40]`; mirrored instances provide X=±40,Z=±40 side bores. Proper **Ry(+pi/2)** with frame origin motor `[0,0,-80]` maps actual frame `[-40,0,±40]` to motor `[±40,0,-40]`. Frame outside faceX=-50 maps motorZ=-30, registering both real nose collars without inventing longitudinal bores at the Y-axis corners. Official source2 visibly has four top holes and three alternating side holes along each long rail across motor width, independently supporting this long7-rail orientation. The earlier `[0,0,-100]` candidate and its false corner-bore edges were replaced; the corrected source/CAD-derived fit remains `unchecked`, not independently verified.
- [49295p01.dat](https://library.ldraw.org/library/official/parts/49295p01.dat) fixes its integral tyre to material **10322**. `s/49295s03.dat` hub axle bore extends local Z=-10..+10; `s/49295s04.dat` inner spokes have pin-hole pitch20. Wheel Rx(+pi/2) maps its local +Z outward along motor -Y. Inner hub face local Z=-10 meets rotor Y=-50 with wheel origin **[0,-60,0]**, i.e. body-origin to wheel-centre axial offset **24 mm**. This comes from actual mating faces, not overall bounds.
- Motor native rotor face has separate pin-hole locations at pitch20. Black pins at Z=±20 and blue wheel-retaining pins at X=±20 are separate introductions. 39793 has native perpendicular pin holes X=±20; centre `[0,-80,0]` puts its lower face Y=-70 at the wheel outer face.
- [3705.dat](https://library.ldraw.org/library/official/parts/3705.dat) spans native X=-40..40. With axis mapped to motor +Y and centre Y=-70, the shaft spans Y=-110..-30: outer bearing (-110..-90), magenta connector (-90..-70), wheel hub (-70..-50), and front rotor axle socket (-50..-30). Full axial insertion is **80 LDU = 32 mm**, while engagement in the actual front rotor axle socket is **20 LDU = 8 mm**. Neither value is replaced with a universal 8 mm travel.
- Wheel designation is LEGO nominal **88 mm**. Previously measured acquired-mesh diameter is approximately **87.8117 mm** (outer radius43.9058 mm); that mesh value is not a certified measurement of a physical tyre. Differential-drive nominal radius is44 mm.

### Reinforcement and other native features

- [32073.dat](https://library.ldraw.org/library/official/parts/32073.dat) is a true100-LDU 5L shaft. [32009.dat](https://library.ldraw.org/library/official/parts/32009.dat) lower axle hole `[80,0,0]`, upper axle hole `[0,0,-160]`, and intermediate round holes provide independent pitch constraints. Its lower stack is authored as five20-LDU layers (three6536 blocks and two beams), not stretched geometry.
- [6536.dat](https://library.ldraw.org/library/official/parts/6536.dat) axle bore is native X at origin; its perpendicular pin bore is `[0,20,0]` along Z. [48989.dat](https://library.ldraw.org/library/official/parts/48989.dat) has four genuine integral pins at `[0,±20,±10]`. The old round-centre48989 mold is retained rather than silently replaced by cross-centre65489; exact 2019 mold remains uncertified.
- [63869.dat](https://library.ldraw.org/library/official/parts/63869.dat) axle bore is native X through origin with faces X=±10. Its **round triple-pin** row is local `[X=-20/0/+20,Y=20,Z=0]`, along localZ. These are distinct perpendicular bore systems. Source16 blue pins use middle+one end, source19 red axle halves use the actual axle bores, and the unused round row end supplies the possible vertical Book5 stop path. Do not rotate the red-occupied axle bore vertical merely to fit a guessed stop location.
- `s/u9390s01.dat` rear longitudinal holes are `[±40,0,0]` before +140Z; actual rear housing face is Z=150. [14720.dat](https://library.ldraw.org/library/official/parts/14720.dat) H-frame end-bar centres local Z=±40 map to both rear pin positions. Its front face and housing rear face coincide at Z=150 in authored poses.
- [49283.dat](https://library.ldraw.org/library/official/parts/49283.dat) has the real native cross bore. The pin/clip preassembly uses that bore and source housing-side hole. No additional prepared cable/plug instance is fabricated; motor cable stub remains part of the acquired motor root. Full cable routing to the hub belongs to integration.

### Cable-end reinforcement: corrected independent native-feature graph

The p16–21 reconstruction uses both source callout hole selection and acquired native axes. Motor-native placements are first63869 `[-sign×20,20,160]`, second63869 `[sign×20,20,160]`, both with proper quaternion `[.5,.5,.5,.5]`. Blue pins are `[0,20,180]` / `[0,40,180]`: right native shaft +X remains +X; left uses proper Ry(pi) to make it -X, preserving the mirrored source introduction order without negative scale. Their collars at motorX=-sign×10 seat the first block; the beam occupies X=-10..10 and their long halves enter the second block. This uses adjacent63869 row positions, not both ends. Final acquired-mesh geometry is the same symmetric sandwich, while source16/18 part identities remain book-specific.

The third32009 beam has motor-native origin `[0,-20,180]`, quaternion Rz(+pi/2). Its short-leg **round** holes local `[40,0,0]` / `[60,0,0]` coincide with those blue pins. It does not receive a round pin in its native end axle hole `[80,0,0]`. The red11214 connectors are motor-native `[±20,0,160]` with Rz(+pi/2): their local axle half X10..30 enters the63869 axle bore at motorY10..30; their2L pin half remains Y-30..10.

The14720 H-frame remains centred `[0,0,160]` with quaternion `[.5,.5,.5,.5]`. Its **spine** holes nativeZ±20, axesX, engage the red pins. Independently, both **end-bar** middle holes nativeZ±40 engage the motor rear housing pins at motorX±40, front faceZ150. Yellow32523 is `[0,-20,160]`, quaternion `[sqrt(.5),0,sqrt(.5),0]`: its two outer holes engage the remaining red pin halves in the adjacent Y-30..-10 layer. These independently authored native mates replace the earlier incorrectly oriented rear-brace grid poses; source-view/physical-fit verification is still not claimed.

The unoccupied63869 end row is local `[-20,20,0]`. Under the corrected poses and candidate final module roots, its upper and lower external faces are world `[80,36,24]` / `[80,12,24]` on the right and `[-16,36,24]` / `[-16,12,24]` on the left. This is an actual vertical round-bore line through the two cross blocks. The original horizontal63869 axle bore is red-occupied, not a Book5 stop-axle receiver. The exact source13/14 retention sequence still needs independent comparison; no closed Front-rail wall or fictional spacer is used as a lower receiver.

## Integration attachment-site contract

`attachmentSites` references actual named `connectionPoints`; integrator must transform these frames with actual fragment/root transforms, never read a bounding box as a mating surface. All point coordinates are part-local after N conversion.

| Site key | Part ID (`right-` / `left-`) | Part-local native frame position | Feature |
|---|---|---|---|
| `motor-electrical` | `motor` | `[0,14,142]` | Actual captive cable stub from54675→u9367c01.dat; electrical point only, no extra inventory unit |
| `front-join-1`, `front-join-2` | `housing-pin-4`, `housing-pin-5` | `[0,0,0]` | Actual pin collar at Front upper face; motor-native `[sign×50,20,80/120]`; connection-frame+Y follows downward native `sign×X` |
| `rear-join-1`, `rear-join-2` | `frame-pin-1`, `frame-pin-2` | `[20,0,0]` | Long-half second bearing; motor-native `[X=0/sign×40,Y=0,Z=-160]`, shaft axis motorZ |
| `hub-front`, `hub-rear` | `motor` | `[-sign×50,20,80/120]` | Actual opposite housing-side bores; selecting them as hub attachment still requires source pose resolution |
| `hub-outer-1`, `hub-outer-2` | `motor` | `[-sign×50,-20,80/120]` | Alternative real opposite housing-side row, not invented extra holes |
| `stop-axle5` | `rear-cross-1` (both books, source16) | `[-20,20,-sign×10]` | Upper face of unused END **round** triple-pin bore; frame+Y follows downward `sign×localZ` |
| `stop-axle5-opposite` | `rear-cross-2` (both books, source18) | `[-20,20,sign×10]` | Opposite cross-block lower face on the same actual round-bore line |
| `rear-iframe-upper` | `rear-iframe` | `[0,0,-40]` | Actual H-frame end bar; **not** a certified upper7×11 mate |

`sign=+1` right, `-1` left. Source3 uses adjacent **middle + lower** holes of the frame front long rail: frame native `[X=50,Y=0,Z=0/sign×40]`, not an invented symmetric±20 pair. Pin collars seat at motorZ=-130; true2L free halves extend toZ=-170, and their second bearing centres areZ=-160. With candidate roots right `[80,24,96]`/Rz(-pi/2), left `[-16,24,96]`/Rz(+pi/2), actual world bearing centres are right `[80,24,160]` / `[80,8,160]`, left `[-16,24,160]` / `[-16,8,160]`, shaft axes worldZ. The96mm cross-robot separation must not be forced onto unrelated64mm Rear receivers. The two independent pin/hole pairs and their actual axes must all be checked.

Book4 p17 reinspection corrected Rear's two63869 brackets and two60483 short liftarms and their vertical shaft stack; it did **not** change these Side motor roots. Genuine white32184 rear cap bores still finish atX0/64 versus Side pinsX−16/80, all atY24/8,Z160. Replacing frame nativeZ0/±40 holes cannot by itself fix that lateral error: Ry(+90°) maps nativeZ to motorX, and the upright root Rz(±90°) maps motorX to **worldY**, not worldX. In-plane64179 bores all have motorY0, fixing their worldX at the motor roots. Source20 rail pins were independently recounted as holes4/10; changing the corrected Rear cap sign outward would violate that real48mm rail-pin span. See [Rear native graph and bounded finding](adb-rear.md); no alternative hole is approved merely for matching a desired width.


Book5 source step8 places the hub with its **long dimension across the space between the wheel modules**. A hub yaw assumption using its short dimension across that gap produces an artificial width contradiction. Book5 source step9 mates Rear to the side **frame end**, while Front mates the motor **cable end**. These source observations override naming-based guesses about longitudinal direction.

Integration identified and rejected an initial false pin-to-pin pairing. Side housing-pin axes are native X, which become **vertical Y** after the modules stand upright. Their actual counterparts are Front39790 **vertical bores**, not Front's already installed horizontal pins. Front's corrected source upper-face receiver frames are raw39790 `[x=±100,y=-10,z=60/20]`, i.e. module X=-8/72, Y=4, Z=48/64. The side sites use actual pin **collars** at local `[0,0,0]`, not free-bearing centres displaced4mm inside the receiving frame. These give candidate side roots right `[80,24,96]` with scene Rz(-pi/2), left `[-16,24,96]` with Rz(+pi/2), and motor-root spacing96mm. With the CAD-derived24mm outward wheel-centre offset on each side, candidate track is144mm. This source-feature solution removes the spurious104-versus64mm closure contradiction without deforming either fragment; it remains subject to independent full-model validation. Source Book5 step9 has distinct lower blue-pin mates and upper Rear long-gray-axle/under-hub mates; they must not all be forced onto one Rear upright pair.

## Mechanics and modeled motion

The same seven prepared instances comprise each revolute group: wheel, two black output pins, two blue retaining pins, magenta connector and4L shaft. Motor body remains in the fixed module root. The genuine internal rotor follows the external revolute joint via `movingSide:'rotor'`. No duplicated motor part or anonymous rotor geometry is introduced. The external joint datum is the actual wheel centre native `[0,-60,0]` (scene `[0,24,0]`), on the same shaft axis as the genuine motor rotor native `[0,-50,0]` (scene `[0,20,0]`); shifting a revolute origin along its own axis does not change rotation.

Right and left local wheel-axis signs differ so integration can use proper opposite upright rotations while making both positive zero-pose world axes **-X**. This is a mechanical coordinate convention, **not invented hardware encoder polarity**. The integrator must confirm the transformed axes against the agreed forward-local-Z convention. Source ports are **A left drive / E right drive**, from Book5 source3/5 (PDF6/8). Conservative application speed ceiling2rad/s is explicitly `basis:'modeled'`; physical stops, acceleration and calibrated motor rates are unknown. No physical continuous-rotation stop is invented.

## Outstanding independent-fit work — do not promote authoring to verification

1. The wheel/rotor axial faces and corrected Ry(+pi/2) frame side-bore registration are independently constrained by native geometry above, but have not passed parent union gates or source-view render comparison in this phase. The old frame corner-bore conflict is resolved by actual `s/64179s01.dat:66`, not by relabeling a Y-axis bore.
2. The outside reinforcement's overall registration still needs source-view reconciliation; it must not be declared correct because internal stack Connections close. The corrected frame block has motor-native centre `[sign×80,0,-80]`, quaternion `[.5,.5,.5,.5]`. Its integral pins `[0,±20,-sign×10]` meet actual frame short-end bore faces `[-localY,0,sign×70]`, i.e. motor `[sign×70,0,-100/-60]`. Both source-native fixed edges and installation endpoints now coincide. Each brace-pin collar also has an explicit fixed edge to its6536 perpendicular pin-hole front face `[0,20,-10]`, axisZ. Those demonstrable internal edges do not establish the outside unit's final connection to the corrected frame block; graph connectivity is not substituted for physical fit.
3. Cable-end internal cross-block/blue-pin/beam/red-pin/H-frame/yellow-cap relationships have been corrected using the independent graph above. The long beam's upper mating to the outside reinforcement and Book5 stop/bush retention still need source/CAD contact validation. Real native bore sites alone do not certify those unresolved interfaces.
   An attempted stop-axle closure moved the63869 bore into the correct Front-rail X plane, but landed at Front rawZ80, where39790 has a horizontal side bore rather than a vertical bore. That candidate was rejected and **not applied**. Likewise a bush cannot be placed beneath a closed rail wall merely because the vertical shaft length looks plausible. The actual3713 flange span is8mm (nativeZ±10); any future source-backed stack must use that acquired dimension, not6.4mm or an invented spacer.
4. Final Front/Rear width and hub long-axis orientation must be solved from at least two source attachment features. The producer sent all known native site coordinates to integration; it did not alter source pitch to force a guessed global width.
5. Book5 upper7×11 and underside paired5×7 actions visibly attach predominantly to Front structural frames. No extra drivetrain bounding-box seat is fabricated for those actions; integration must use the actual source receiver parts.

**Coverage:** 48 documented side-book steps;48 authored physical actions;78 modeled prepared units. Independently fit-verified side steps/components in this authoring pass: **not yet established**. Geometry uses genuine licensed acquired roots with explicit historical-mold caveats. The unresolved reinforcement registrations above prevent claiming the two side fragments meet full exact-fit acceptance until corrected and independently checked by the integration owner.
