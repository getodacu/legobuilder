# Advanced Driving Base — Front Part authoring evidence

## Scope and exercised evidence

`src/lib/models/advanced-driving-base/front.ts` owns official Book 1, Front Part: 38 numbered source pages, 73 prepared callout units. Each source introduction has a distinct part identity and installation milestone; later preparations move the existing identity tree rather than introduce duplicate inventory. `front` is the identity root. No import from the composition module is used.

This is an authoring record, **not a fit certificate or a claim that all 38 steps passed verification**. The initial parent browser/unit seed verified only the original seven-unit/three-step bracket; the extended strict generator, current full unit suite and live full-robot Chromium scenarios have since been exercised separately. This worker ran no tests, build, formatter, browser or geometry gate. Source-view contacts, optical clearance and correct registration throughout the enlarged fragment remain unverified, and all **new** authored placement fits remain `unchecked`.

The preserved datum contains exactly `beam-1`, `pin-1`, `pin-2`, `grey-connector-1`, `grey-connector-2`, `pin-3`, `pin-4`, the original poses, mount IDs, and eight original connections. `front-bracket` now nests under the identity `front`; its two existing end-bracket children remain. Source steps 1/2/3 retain introductions 3/2/2.

## Locked source and asset policy

- Official [Front Part PDF](https://assets.education.lego.com/v3/assets/blt293eea581807678a/blt2d17fa746ea991e5/5ec8e83df11f7e3ed6d502d7/advanced-driving-base-bi-pdf-book1of5.pdf?locale=en-us), 38 pages; SHA-256 `903c68142601a3fbd50a4c22eac64e1fd950bd037b667626e4eacc362e8d7901`.
- Source quantities and book-local observations: `docs/research/data/advanced-driving-base.json`; contextual identities: `docs/research/data/lego-part-crosswalk.json`.
- All 38 page views were read from private source contact sheets, with enlarged source views for first bracket, prepared frame, motor, first H bracket, caster angle, sensor, assembled reinforcement, and final gear. Book5 attachment views were also read. Source PDF/rendered imagery remains private; no manual image is added to distributable assets.
- Native DAT sources remain under `.research-cache/geometry/ldraw/`; app geometry references the already authorized library roots. LDraw roots/primitive references carry existing CC BY attribution. Nothing here licenses, converts, or uses VEX CAD.
- Coordinates: native LDU, then `N = Rx(pi) × 0.4 mm/LDU`; authored native placement conversion is `N T N^-1`. Geometry receives `N` only once. No mesh recentering, bounding-box resizing, or proxy robot primitives.

## Complete prepared-family crosswalk

The table counts manual prepared callout units, not molded subpieces, captive leads, retail packages, or certified historical element IDs. Composite electronics remain one prepared unit. Both color sensors and both caster balls/cups are in this Front book; no hub or optional accessory is introduced here.

| Source family | Genuine geometry root | Material | Source quantity | Introduction pages |
|---|---|---|---:|---|
| `black-pin2` | `2780.dat` | `ldraw-0` | 29 | 1, 3, 5, 7, 11, 20, 27, 34, 37 |
| `black-beam9` | `40490.dat` | `ldraw-0` | 1 | 1 |
| `grey-pinbeam3` | `48989.dat` | `ldraw-71` | 4 | 2, 17, 24 |
| `frame11x15` | `39790.dat` | `ldraw-322` | 1 | 4 |
| `blue-pin3` | `6558.dat` | `ldraw-1` | 9 | 6, 8, 12, 16, 23 |
| `white-doublecross` | `32184.dat` | `ldraw-15` | 2 | 6 |
| `medium-motor` | `54696p01.dat` | `ldraw-15` | 1 | 8 |
| `pink-connector3` | `39793.dat` | `ldraw-26` | 3 | 11, 34 |
| `grey-iframe3x5` | `14720.dat` | `ldraw-71` | 2 | 12, 15 |
| `color-sensor` | `37308.dat` | `ldraw-15` | 2 | 16, 23 |
| `ballcup` | `39370.dat` | `ldraw-322` | 2 | 18, 25 |
| `ball19` | `52629.dat` | `ldraw-15` | 2 | 18, 25 |
| `azur-angle3x5` | `32526.dat` | `ldraw-322` | 2 | 21, 28 |
| `black-beam15` | `32278.dat` | `ldraw-0` | 1 | 30 |
| `red-axlepin3` | `11214.dat` | `ldraw-4` | 4 | 31 |
| `yellow-brick2x4` | `39789.dat` | `ldraw-14` | 2 | 31 |
| `black-tube1` | `18654.dat` | `ldraw-0` | 2 | 32 |
| `grey-gear28` | `46372.dat` | `ldraw-71` | 1 | 37 |
| `blue-wireclip` | `49283.dat` | `ldraw-1` | 1 | 9 |
| `green-wireclip` | `49283.dat` | `ldraw-2` | 1 | 9 |
| `red-wireclip` | `49283.dat` | `ldraw-4` | 1 | 13 |

The misleading global family key `black-angle4x4` is **not a Book1 addition**. When used elsewhere in the complete ADB it resolves to gray `63869.dat`, Technic Cross Block 3×2, not a black bent beam; no fictitious 63869 instance is added to Front to satisfy that correction. `grey-pinbeam3` retains `48989.dat`, the documented older round-center mold; correspondence to a later 65489 mold is not certified.

## Native critical-feature table for independent checking

Raw coordinates below are real DAT/primitive coordinates, not mesh-bound corners. A world registration selects how those features are used; independent source comparison and tolerance checking remain separate work. Slot/hole indices use the explicit source datum below rather than an undocumented library numbering convention.

| Feature / source page | Raw native CAD position / axis | Canonical scene registration or corresponding part feature | Uncertainty |
|---|---|---|---|
| 40490 h1…h9 / 1 | beam native `(0,0,z)` at `z=-80,-60,…,80`; native through Y, face Y±10 | preserved datum h1 `(0,0,0)`, h9 `(64,0,0)`, through scene Z | Original nominal parent assertions do not establish factory tolerance |
| 2780 seed pins / 1–3 | pin axis native X, collar root0; endpoints X±20; 2-LDU collar | unchanged original source h4/h6 and crossblock upper seats | Historical mold/elastic compression unchecked |
| 48989 integral bases / 2–4 | `(0,±20,±10)`; integral pins along native Z; pin travel20LDU | existing front free bases scene X0/16/48/64, Y0,Z12 | 48989 versus65489 round-center difference retained |
| 39790 frame registration / 4 | native bounds X±110,Y±10,Z±150; frame translation `[80,0,-180]`, native identity | center scene `[32,0,72]`; 88×8×120mm, no centering | Source registration CAD-derived, not independent fit certification |
| 39790 near SHORT-rail side holes / 4 | native outer-face Z150, X `-80,-40,0,40,80`; horizontal axisZ; innerface Z130 | source four gray pins use X `-80,-40,40,80` => scene `[0/16/48/64,0,12]` | Do not confuse these with alternating vertical holes |
| 39790 vertical short-rail holes / 4 | Z±140, X `-100,-60,-20,20,60,100`; verticalY | scene near rail Z16, farZ128; X `-8,8,24,40,56,72` | Alternate with side-facing holes, not a universal full grid |
| 39790 long-rail side pins / 5 | outer X±110, Z120/80, axisX; center near rail `(0,0,130)` axisZ | scene outer X-12/76,Z24/40 and inner scene `[32,0,20]` | Source-selected rail indices require image/contact gate; not Side free-pin mates |
| 32184 end support / 6–7 | end cross axes nativeX, centers `(0,±20,0)`; CENTRAL ROUND hole axisnativeZ, facesZ±10 | nativeRz(-90), centers `[0/64,8,16]`; inboard vertical blue pins atX8/56, collarY12; long half reachesframeY-4 | False white→pin3/4 and whiteblue→motorbottom pairings are removed; the real motorbottom seats are original pin3/4, documented below |
| 6558 split collar / 6,8,16,23 | split collar nativeX-10, extents-30/+30; short20LDU/long40LDU | source6long half DOWN16mm; source8short half INTO housing8mm with long16mm outside for8mm cableclip; source16/23short halfDOWN8mm | White cross-hole/pin seating and collar phase remain fitunchecked; do not infer plastic flex/clearance from nominal CAD |
| Medium motor registration / 8–10 | bottom entrance faces native(0,30,-20)/(0,30,140); side boresX30,Y20,Z-20/140; acquired rotor native[0,-50,0] | bodyroot `[8,16,8]`, nativeRy90; bottomfaces `[0/64,4,8]` seat directly on ORIGINAL pin3/4; sidecollars `[0/64,8,20]`, pin/clipcentersZ24 | Source10 lowers8mm onto pin3/4. White-blue and white-center-hole motor-seat hypotheses are rejected, not emitted as connections |
| Medium source cable / 8–9 | actual captive stub native[0,0,143] | follows corrected bodyroot; clips use real49283 socket bores, no extra wire inventory | Cable route remains presentation/modeling, no physical lead length invented |
| 39793 perpendicular bores / 11,34 | native edge(±30,0,±20), axisX | flat topcap center `[32,32,8]`, nativeRy90; upright centers `[0/64,36,32]`, nativeq[-.5,.5,-.5,.5]; upperpinsY48 | Topcap bottomY28 clears acquired motorback top≈27.6 nominally; no factory tolerance certified |
| 14720 H foundations / 14–15 | lowerendbar nativeZ40,X-20/0/+20, throughnativeY±10 | insideH root `[32,16,24]`, lowercentral face `[32,0,20]` receives source5innerpin; outsideHroot `[32,16,-8]`, lowerend faces `[24/40,0,-4]` receive preserved pin1/2 | Source-view interpretation and exact native grids now agree; independent parent fit/collision gate remains required |
| 37308 sensor optics/mounts / 16,23 | optical axisnative-Z; upper boresnativeX±20,Y0,Z10; sideboresnativeX±30,Y±20 | nativeRx90; roots `[0/64,8,32]`; optics DOWN; bluecollarsY12, tipY28; source30 rail lowerfaceY16/upper24 | Earlier optical ambiguity is resolved by source20/21 pin row and frame-side-pin closure, not by ignoring the optical axis |
| 48989 sensor/caster bridge / 17,19,24,26 | integralpairsnativeY±20,Z±10 | graycenters `[-16/80,8,32]`; sensor-facing basesX-12/76 atZ24/40; cup-facing basesX-20/84 atZ24/40 | Left graynativeq[.5,.5,.5,.5], right[.5,-.5,-.5,.5]; actual geometry, no reflected mesh |
| 39370 caster sphere / 18,25 | spherecenter native[0,46,0] | cupcenters `[-24/88,8,24]`, leftnativeidentity/rightRy180; ballcenterY-10.4, nominal19mm ballbottom≈-19.9 | Ball/socket contact modeled; nominal sphere bottom aligns wheel groundY-20 from24−44 without claiming physical calibration |
| 39370→32526 / 20–22,27–29 | outer cup end sideholes nativeY±20, otherend from gray; LshortlegnativeX0/40,Z80 | cupblackcollars `[-20/84,0/16,8]`; Lcenters `[-16/80,0,40]`, nativeRz-90; longarmZ0/40 seats framepins atsceneZ40/24,Y0 | Source20 enlarged view confirms TOP/BOTTOM pins with middlehole empty; adjacent8mm hole interpretation is rejected |
| 32278 cross rail / 30 | native longaxisZ, vertical holesY | nativeq[sqrt(.5),0,sqrt(.5),0], center `[32,20,32]`; sourcebluepins h3/h5 andh11/h13; endh1/h15 remainfree until33 | Source33 redpins use END holes, never the occupiedbluepin holes |
| 39789 yellow supports / 31–33 | native crossholes X±20,Y0,Z0; brickheight24LDU; rootnativeRy90 | brickcenters `[-24/88,33.6,24]`, lowerfaceY24; red11214rootsY20,Z16/32, collarY24; barepinZ32 passes crossrail and enters cup; sleevedpinZ16 enters cup | Full source33 motion16mm from firsttip contact with railY24; cuppinhole entranceY12 and tipY8 give4mm final penetration; no artificial spacer-to-cup face mate |
| 46372 output / 37–38 | nativeaxisZ; roundholesX±20,Y0; facesZ±10 | gearcenter `[8,40,8]`, nativeRx-90; pin collars `[0/16,36,8]`; joins actual motorroundholesnativeZ±20 | No central axle pin or optional accessory invented |
| Medium rotor binding / 38 | acquired node `parts/u9363p01.dat`, native[0,-50,0] | jointpivot `[8,36,8]`, axis+Y; fixedbody/realrotormoving; gear+2pins actualchild subtree | Kinematic model, not physical motor speed/torque certification |

## Final mechanical joining correction

Parent reported five disconnected groups of31/25/9/4/4 units. That observation was treated as ground truth; this worker did not rerun the graph or any gates. The groups were the original frame/motor/output, two sensor/caster preparations with crossrail/uprights, pink/H brace, and two yellow preparations.

The correction reconstructs the actual source joining interfaces rather than adding arbitrary graph edges:

| Source join | Actual receiving feature and existing fastener | Authored installation operation |
|---|---|---|
| 7 | white inboard blue long half through actual39790 vertical short-rail holesX8/56,Y4,Z16 | `front-reuse-front-white-mounts-7` |
| 10 | Actual MOTORBOTTOM nativefaces(0,30,-20)/(0,30,140) receive original blackpin3/4 atscene[0/64,4,8], freeends toY12; NOT white pin/roundhole seats | `front-reuse-front-medium-body-10` |
| 14 | inside14720 LOWER BAR CENTER, nativeX0,Z40, faceY-10; source5innerframepin at[32,0,20] | `front-reuse-front-motor-brace-14` |
| 15 | outside14720 LOWER BAR ENDS, nativeX±20,Z40, faceY+10; original h4/h6 pin1/2 collars[24/40,0,-4] | `mount-front-motor-h-brace-2` |
| 19/26 | cup side horizontal row, nativeY0, nativeZ0 andoneend±40; actual gray integralpair | `front-reuse-front-{left/right}-caster-19/26` |
| 22/29 | Llongarm nativeZ0/40, nativeX0, facesY±10; actual source5sidepinsX-12/76,Y0,Z40/24 | `front-reuse-front-{left/right}-sensor-22/29` |
| 33 | bare red pin through32278 h1/h15 atY24,Z32; both redpins enter39370 vertical holes atY12,Z16/32 | `front-reuse-front-{left/right}-yellow-33` |
| 35 | upright loweredge bores atY24,X±8/56/72,Z32;4mm projection of actual sensorbluepins | `front-reuse-front-{left/right}-upright-35` |
| 38 | real46372 roundholes and actual rotorroundholes; existing two gearpins, no central cross-pin | `front-reuse-front-tool-output-38` |

Each listed operation includes at least one endpoint as a genuine moving participant. By the authored topology these joins connect the prior five groups into one73-unit mechanical structure; this is a construction claim, **not an independently exercised graph/fit result**. Parent must perform that re-evaluation. The original seven poses and original eight connection IDs are unchanged. False draft white→pin3/4 and whiteblue→motorbottom edges were deleted, not retained as compatibility aliases.
The source10 ambiguity was resolved by matching the actual bottom nativefaces to preserved pin3/4, rather than forcing a white-center-hole pairing. The resulting motor Z8 sidefaces-4/20 lie between Hbrace insidefaces-4/20, so the earlier motorZ-8/Hstrut overlap hypothesis is eliminated nominally. White pin/cross-hole tolerance and collar seating still require the parent fit gate; graph connectedness is not a tolerance certificate.


## Book5 attachment contract

- `{left,right}-side-front-{1,2}` are **receiving frame holes**, not two already-installed pins being mated. Part `front-frame`, connection IDs `{side}-side-receiver-1/2`, raw `[±100,-10,60/20]` => upper-face scene `[-8/72,4,48/64]`. Source7 occupation at nativeZ100 is deliberately not reused as a new free receiver. Side housing pin/white support closure still needs parent source checking.
- `upper-front-{left,right}-{1,2}` refer to actual upright2780 collars with world+Y frames, raw pin origin0 at X-8/8/56/72,Y48,Z32. Book5 upper39794 candidate center `[32,52,56]`, sceneRy90, aligns four genuine native frame holes nominally; this remains unchecked.
- `underside-{left,right}-{front,rear}`: actual39790 lower-face `[±100,10,±60]` => scene X-8/72,Y-4,Z48/96. Book5 PDF21 correspondence is diagram-derived, not a verified fit.
- `stop-axle-{left,right}`: actual39790 through bores `[±100,-10,100]`; source selection is explicitly unchecked and may require correction when Book5 source registration is independently tested.
- Electrical sites expose only actual native captive stubs: medium `[0,0,143]`; sensors `[0,0,3]`. Integration owns actual hub socket mates and Book5 wiring. No separate invented cable inventory or electrical “pins.”
- **No Front hub support grid is fabricated.** X8/56 bores on the actual39790 short rails lie at Z16/128, not a made-up48×48 grid inside the void. Hub support must be resolved from Book5 and actual other module features.

## Every source page represented

All steps preserve Book1 page numbers. Zero-introduction pages reuse actual source preparations; step36 is a genuine camera-only operation with empty participants/stages/parent changes. Step15 changes the camera to the opposite source view while adding the second actual H bracket; no physical model flip is invented for a view-turn icon.

| Source step/page | New prepared units | Introduction or reuse | Source observation |
|---:|---:|---|---|
| 1 | 3 | 2 × `black-pin2`; 1 × `black-beam9` | Begin 9-hole beam; insert two black friction pins from far face through holes4 and6, counting from upper-left end of displayed beam. |
| 2 | 2 | 2 × `grey-pinbeam3` | Two grey 3-length beams with four integral pins attach to near side of black beam, across end holes1/3 and7/9; two pins of each grey connector remain projecting toward viewer. |
| 3 | 2 | 2 × `black-pin2` | Insert black pins downward into upward-facing outer end hole of each grey connector. This completes the first three-step bracket seed. |
| 4 | 1 | 1 × `frame11x15` | Join bracket to outside of one frame rail; grey projecting pins face into frame side holes, black vertical pins remain upward. |
| 5 | 5 | 5 × `black-pin2` | Insert five side-facing frame connection pins at the shown rail locations; two arrows plus three already-inserted instances define placement. |
| 6 | 4 | 2 × `blue-pin3`; 2 × `white-doublecross` | Build two white double-cross connectors, each with blue3-pin inserted axially through one end cross hole, short pin end emerging above. |
| 7 | 6 | 6 × `black-pin2` | Attach two white connector units onto frame near motor rail ends, blue ends upward; insert six additional upward black frame pins at pictured edge locations. |
| 8 | 3 | 1 × `medium-motor`; 2 × `blue-pin3` | Prepare medium motor, circular output pointing upward and cable toward lower-right; set output index marks as inset, insert blue3-pins laterally into housing mount holes. |
| 9 | 2 | 1 × `blue-wireclip`; 1 × `green-wireclip` | Fit blue and green cable clips on opposite sides of medium motor housing. |
| 10 | 0 | Existing preparation moves as an assembly; no recount | Lower medium motor onto prepared frame mount; cable traverses frame opening, circular output upward. |
| 11 | 5 | 4 × `black-pin2`; 1 × `pink-connector3` | Insert four lateral black pins into magenta 1x3x3 connector block, two at each side. |
| 12 | 2 | 1 × `blue-pin3`; 1 × `grey-iframe3x5` | Attach grey I-frame side bracket to magenta block; add one blue pin at bracket side. |
| 13 | 1 | 1 × `red-wireclip` | Attach red cable clip to blue pin on I-frame bracket. |
| 14 | 0 | Existing preparation moves as an assembly; no recount | Lower magenta-and-grey bracket over medium motor, pinning to surrounding frame connectors. |
| 15 | 1 | 1 × `grey-iframe3x5` | Rotate camera to opposite side; add second grey I-frame bracket on other motor side. |
| 16 | 3 | 2 × `blue-pin3`; 1 × `color-sensor` | Prepare first color sensor with two blue3-pins pointing upward from mount side. |
| 17 | 1 | 1 × `grey-pinbeam3` | Attach grey four-pin beam to sensor side using protruding mount pins; sensor lens remains unobstructed. |
| 18 | 2 | 1 × `ballcup`; 1 × `ball19` | Press white19mm ball into Medium Azur ball-cup frame; ball surface protrudes downward in final driving orientation. |
| 19 | 0 | Existing preparation moves as an assembly; no recount | Join first ball-cup frame to first color-sensor unit using grey connector. |
| 20 | 2 | 2 × `black-pin2` | Insert two black pins into visible side holes of ball-cup frame. |
| 21 | 1 | 1 × `azur-angle3x5` | Attach Medium Azur L-shaped3x5 beam to this caster/sensor unit; long arm projects toward center of eventual front rail. |
| 22 | 0 | Existing preparation moves as an assembly; no recount | Attach first caster/sensor unit to front frame/motor side; sensor is outboard and downward-facing after final rotation. |
| 23 | 3 | 2 × `blue-pin3`; 1 × `color-sensor` | Prepare second color sensor with two blue3-pins. |
| 24 | 1 | 1 × `grey-pinbeam3` | Attach second grey four-pin beam to second sensor, mirrored placement. |
| 25 | 2 | 1 × `ballcup`; 1 × `ball19` | Prepare second white ball in Medium Azur ball-cup frame. |
| 26 | 0 | Existing preparation moves as an assembly; no recount | Join second caster frame to second sensor unit. |
| 27 | 2 | 2 × `black-pin2` | Insert two black side pins into second ball-cup frame. |
| 28 | 1 | 1 × `azur-angle3x5` | Attach second3x5 angular beam, mirrored relative to first sensor/caster. |
| 29 | 0 | Existing preparation moves as an assembly; no recount | Attach second caster/sensor unit on other motor side. |
| 30 | 1 | 1 × `black-beam15` | Add black15-hole rail spanning two sensor/caster units across front. |
| 31 | 6 | 4 × `red-axlepin3`; 2 × `yellow-brick2x4` | Make two yellow2x4 cross-hole brick units, two red axle/pins per brick, axles entering holes in brick face opposite studs. |
| 32 | 2 | 2 × `black-tube1` | Slide one short black tube onto one red pin in each yellow brick unit. |
| 33 | 0 | Existing preparation moves as an assembly; no recount | Mount both yellow brick units atop outer front supports, studs outward/up in displayed orientation. |
| 34 | 6 | 4 × `black-pin2`; 2 × `pink-connector3` | Make two magenta connector blocks, each with two upward black pins. |
| 35 | 0 | Existing preparation moves as an assembly; no recount | Attach the two magenta connector blocks alongside motor, their pinned edges upward. |
| 36 | 0 | Camera-only view | Rotate camera to opposite end; no additional parts. |
| 37 | 3 | 2 × `black-pin2`; 1 × `grey-gear28` | Insert two black pins into opposing round holes of grey28-tooth double-bevel gear; not into center cross axle hole. |
| 38 | 0 | Existing preparation moves as an assembly; no recount | Mount grey gear on circular medium-motor output, using the two pin connections; no external tool is added. |

## Hierarchy, presentation, and verification boundary

White mounts, motor/clip preparation, upper motor brace, both separate sensor/caster chains, yellow supports, magenta uprights and rotor output are represented as mechanical child groups. Their source reuse pages move the existing groups with participants containing all descendants. Initial work-area offsets and deterministic approach timing are app-authored presentation. New prepared instances each have one installation milestone; reuse does not increase the count. No wiring leads or integral crossblock pins become duplicate inventory.
The yellow preparations use a real source preparation rotation180° about sceneX: pins point upward during source31/32, then the group approach turns them downward before source33 seating. The gear preparation similarly turns between source37 (free pins upward) and source38 (pins into rotor). These are physical preparation turns, not camera-only physical flips. The source38 output root also reparents from Front into the fixed medium-motor group after seating, preserving its world pose and the acquired rotor pivot. Upright source35 insertion uses only the4mm remaining blue-pin projection above the cross rail; it does not reuse an arbitrary8mm depth.

The medium motor remains one prepared unit. Its rotor binding names the acquired internal mesh node; the real gear and two actual pins rotate as the supported output child. There is no optional dozer, gripper, liftarm, range sensor, or decorative motion replacement.

Parent gates should exercise strict type/schema compilation, exact source family/introduction counts, mechanical connectedness, DAG/installation accounting, same-time reversible sampling through each reuse, independent raw-native feature checks, collision/contact checks, and source-view comparisons of frame, motor/H braces, both downward sensor/casters, yellow/upright reinforcement and output. The source reconstruction now resolves the previously disconnected Front groups; independent source/fit verification and Book5 receiver occupancy checks are still required before declaring full Front placement verified. Neither this document nor operation coverage establishes those verification results.
