# Quality Check Robot — source reconstruction and validation boundary

## Status

`src/lib/models/quality-check.ts` exports `qualityCheck` (`id: quality-check`). This is the combined2019 **Idea Detector + Robot Head**, not a conveyor inspection machine. All30 numbered instructions have operations,63 individual callout-unit identities have one installation each, and the same assembled hierarchy supplies the two-axis simulation. Parent integration exercised strict source compilation, the unit suite and the real Chrome color/range/moving-head flow in `additional-robots.spec.ts` (3/3 across all additional robots); **manual-view comparison, mesh interference and physical fit remain unverified**. Authoring coverage is not acceptance completion: verified placement/components/steps remain zero.

| Coverage | Authored | Independently verified here |
|---|---:|---:|
| Numbered instructions |30 /30 |0 |
| Idea Detector robot units |34 /34 |Source callout transcription inherited; numerical placement unchecked |
| Robot Head robot units |21 /21 |Source callout transcription inherited; numerical placement unchecked |
| Loose sample bricks |8 /8 |Source callout transcription inherited; numerical placement unchecked |
| Physical moving axes |2 |Native motor axes modeled; source A/F physical mapping unknown |
| Response workflows |1 |Parent Chrome scripted violet/range response exercised; source-calibrated response unverified |

No source-manual images, PDF pages or program SVG images are copied into public assets. Only source links, hashes and independently authored data are included. The model does not depend on the private research cache at build/runtime.

## Locked primary sources

- [Idea Detector, book1](https://assets.education.lego.com/v3/assets/blt293eea581807678a/blta28e7be5ac30e472/5f8802cda302dc0d859a7343/place-your-order-bi-pdf-book1of2.pdf?locale=en-us),16 PDF pages, SHA-256 `e81b4e9b1212349543ad4b79d8a47a7897f06c1c031c23d9c3bc05933c3727c0`.
- [Robot Head, book2](https://assets.education.lego.com/v3/assets/blt293eea581807678a/blt7f40beca9b715331/5f8802ef18cd5f0f67ac48f8/place-your-order-bi-pdf-book2of2.pdf?locale=en-us),20 PDF pages, SHA-256 `69b0625f4f1c2c752440bfefd5b5316d34a1c27681e7f46a509177d59ff2b170`.
- [Place Your Order lesson](https://education.lego.com/en-us/lessons/prime-kickstart-a-business/place-your-order/). Source inventory/step transcription: [`../research/data/hand-quality.json`](../research/data/hand-quality.json); geometry crosswalk: [`../research/data/lego-part-crosswalk.json`](../research/data/lego-part-crosswalk.json).
- [Main program](https://assets.education.lego.com/v3/assets/blt293eea581807678a/blt441de26b5a4d2a97/633b2e41a425ab7d963723b6/spike_kickstart_your_business_place-your-order_step03-program_en-us.svg?locale=en-us): SHA-256 `b5ec1619edd4a0a616fdcdf6fff937f19fef243f183e6ede1d82ab8019293a59`.
- [Violet/A possible solution](https://assets.education.lego.com/v3/assets/blt293eea581807678a/bltebd4ff3bea14f6cf/63502a67dcbfe55a60fa3cb8/spike_kickstart_your_business_place-your-order_step04-hint_en.svg?locale=en-us): SHA-256 `056d76e80e7b296d5395866141aca224a8882fe21e2b45ba5f5b02c2e99269a4`.
- [Distinct red-A/green-F teacher solution](https://assets.education.lego.com/v3/assets/blt293eea581807678a/blt917e0c256b80ba6d/63513ac8dec6d64920ca68fa/spike_kickstart_your_business_place-your-order_teacher-solution_en.svg?locale=en-us): SHA-256 `18b7bd6a2788a15655bd50552f74df9f8285d3cfce33759c94ace594c0f6b99d`.

Book1 steps1–13 map to PDF pages4–16. Book2 steps1–17 map to PDF pages3–19. Head step11 genuinely installs the existing18-unit pre-retainer head onto the existing detector plate. Step12 turns and wires that same robot; steps13–15 prepare/install the3-unit cable retainer. Step16 alone introduces the8 sample bricks; step17 is a genuine camera-only review, with no physical participants or new count. Battery preparation remains part of the single prepared hub, not an invented extra numbered step or inventory unit.

## Part-family provenance

Quantities below are prepared manual-callout units, not a certified LEGO-published molded-piece total. A motor includes its captive lead; its real internal rotor is not recounted. DAT basenames are licensed geometry identifiers, **not asserted manufacturer design/element numbers**. Each instance keeps the exact source introduction page and a separate geometry confidence/placement-fit state.

| Research family | Detector | Head | Samples | Geometry | Source PDF pages |
|---|---:|---:|---:|---|---|
| black-frame |1 |0 |0 |64179 |Detector4 |
| tan-axle-pin |5 |1 |0 |3749 |Detector4,12; Head7 |
| black-pin |14 |10 |0 |2780 |Detector5,8,10; Head3,5,10,11 |
| red-connector |1 |0 |0 |49283 |Detector5 |
| azure-l-beam |2 |0 |0 |32526 |Detector6 |
| gray-double-pin-connector |2 |0 |0 |48989, provisional circular-center mold |Detector7 |
| yellow-plate |1 |0 |0 |39369 |Detector9 |
| color-sensor |1 |0 |0 |37308 |Detector11 |
| yellow-brick |2 |0 |0 |39789, three vertical axle holes |Detector12 |
| yellow-curve |2 |0 |0 |24309 |Detector14 |
| azure-panel-left |1 |0 |0 |41750 |Detector15 |
| azure-panel-right |1 |0 |0 |41749 |Detector15 |
| hub |1 |0 |0 |45601c01 |Detector16 |
| medium-motor |0 |2 |0 |54696p01 |Head3,10 |
| magenta-square-connector |0 |2 |0 |39793 |Head4,11 |
| gray-right-angle-connector |0 |1 |0 |6536 |Head7 |
| gray-axle-pin |0 |1 |0 |3673, plain round pin, not cross axle |Head8 |
| distance-sensor |0 |1 |0 |37316 |Head12 |
| azure-short-connector |0 |1 |0 |49283 cable clip, **not Hand60483** |Head15 |
| red-axle |0 |1 |0 |32062 |Head15 |
| magenta-short-connector |0 |1 |0 |49283 |Head16 |
| green-brick |0 |0 |2 |39789 / LDraw green2 |Head18 |
| blue-brick |0 |0 |2 |39789 / LDraw blue1 |Head18 |
| red-brick |0 |0 |2 |39789 / LDraw red4 |Head18 |
| violet-brick |0 |0 |2 |39789 / physical magenta26 |Head18 |
| **Totals** |**34** |**21** |**8** |**55 robot +8 sample =63** | |

Each sample is a separate two-brick subassembly, not one cosmetic package mesh. Its two39789 instances are stacked by the actual24-LDU body height (9.6 mm). All8 stay `inventoryScope: sample`, outside the robot root and source robot count; the presentation path moves that existing pair without making replacement objects.

## Native connection-feature proof table

All coordinates in this table are **original LDraw LDU**, before `N = Rx(pi) ×0.4 mm/LDU`. Model transforms are rigid, right-handed, Y-up and unit-scale. Geometry receives N once; origins are never centered or normalized. The genuine selected root MPDs, their full original attribution closures and hashes come from `geometryAssetsFor` / `sourceDocumentsFor`. Relevant original DAT files are available at `https://library.ldraw.org/library/official/parts/<id>.dat`; primitive/subpart references below describe independently readable source structure rather than rendered bounding boxes.

| Native feature | Source-native evidence | Authored relationship / verification boundary |
|---|---|---|
|64179 rear frame top bores |`s/64179s01.dat` connhole `(40,0,60)` and `(40,0,20)`, reflected to other quadrants; faces native Y±10 |Four black collars meet selected real top faces. L-beam receiving endpoints use32526 native Z0/80; independent fit unchecked. |
|32526 L-beam grid |`s/32526s01.dat` bores `(0,0,0/20/40/60/80)` and `(20/40,0,80)`; native Y±10 faces |Uses actual long legs and two short-leg plate seats, not a rectangular placeholder. Hole-index selection remains diagram-derived. |
|48989 integral mounting pins |Integral pin bases `(0,±20,±10)`, axes native Z, tips at±30 |Lower pair mates L beams; upper pair supports hub. Circular-center48989 vs65489 historical mold remains provisional. |
|Hub upright lower end |`u9402.dat` translates shell `(0,-30,0)`; `s/u9402s01.dat` end-face bores at native X±60, Y±20, Z±110 after reflections/translation |Selected lower native Z−110 face reaches Y24 mm; upper crossblock pin bases meet its four selected end bores. Not independently clearance-validated. |
|39369 base plate |Repeated20-LDU grid; native faces Y±10 |Six individual pins: four under the lower head housing, two under the rotated Color Sensor. No guessed extra pins. |
|37308 Color Sensor |`s/u9408s01.dat` native side bores at X±30, Y±20; `37308.dat` lens/front at native Z≈−49 |Rotated onto its real side mounts, looking across the plate; no fake detector surface. Color inputs remain scripted, not raycast calibration. |
|54696p01 native motor rotor |Root occurrence `u9363p01.dat` at `(0,−50,0)`; drive face bores include native `(0,−50,±20)` |Lower rotor center `[0,40,−48]` mm is the yaw pivot. Body stays fixed; the same actual internal rotor and disc pins follow yaw. |
|39793 lower upright square |Main face connholes cross grid `(0/±20,0,0)` / `(0,0,±20)`; `s/39793s01.dat` perpendicular edge bores at `(±30,0,±20)` |Bottom edge native X−30 receives lower disc pins; the prepared block really rotates upright at Head4. Edge bore selection is explicit, not a box contact. |
|Upper motor body side |`u9364c01.dat` back translates native Z140; `s/u9366s01.dat` side bores at native X30, Y±20, Z140 |Actual housing pins at `[−32/−16,108,−60]` mm connect its sensor bracket. Upper rotor center `[−4,52,−48]` mm is the pitch pivot. |
|Upper motor output retained on lower structure |Native `(0,−50,0)` reaches lower square native `(0,−10,0)` in the nominal rest pose |**Upper body moves, output does not rotate with it.** `internalBinding.movingSide: body` countertransforms the genuine rotor relative to the moving housing. This is the crucial reversed mounting, not a second fixed motor body. |
|37316 Distance Sensor side bores |`s/u9470s01.dat` native X70, Y±20, Z0 |The two sensor pins enter a real side of the wide sensor, not invented center rear holes. Sensor carries the original native eyes on the pitch body. |
|39789 actual sample brick |Root body Y0–24, studs at X±30/±10, Z±10; three vertical axle holes |Upper native underside `(-30,24,-10)` meets lower native stud plane `(-30,0,-10)`, retaining the9.6 mm stack pitch. |
|6536 and3673 coupling |6536 cross bore along native X at origin; round bore native `(0,20,±10)` along Z.3673 is round pin, native X shaft |Gray/tan prepared subassembly is genuinely merged at Head7. Detailed molded interference remains unchecked, never mislabeled as a cross axle. |
|49283 retainer and32062 axle |49283 native cross bore at origin, along Z;32062 shaft native X±20 |Source clip identities preserved; the flexible retainer/cable seat is diagram-derived. No rigid motor-hole fit or measured flexible route is asserted. |
|41749/41750 and24309 |Handed panels have top studs native `(0,0,±10)`;24309 underside tube is `(0,12,20)` in its source subpart |Real authored shapes are retained. Slope/panel stud-contact depths and surrounds require independent visual/mesh comparison. |

These are **native feature proofs and numerical construction assumptions, not a blanket fit certificate**. All placement `fit` values remain `unchecked`. The behavioral test independently probes critical native rotor, upright edge, upper housing and sample-stack coordinates; it does not promote the remaining source-selected contacts to verified status.

## Actual hierarchy and response workflow

The fixed base carries the upright hub, Color Sensor and lower motor body. The lower native output owns `quality-yaw`, including its actual disc pins, upright square and gray coupling. The upper motor output is held on that yaw structure; `quality-pitch` carries the actual upper motor **body**, sensor bracket, Distance Sensor and retainer. Head11 reparenting preserves the assembled roots and all18 existing descendants continuously; no replacement simulation model exists.

`quality-inspection-response-extension` is an explicitly **RoboBuild-authored workflow**:

1. Human presentation is represented by moving the existing magenta two-brick sample around the outside of the robot into the D reading area. It is not robot transport, gripping or sorting.
2. Scripted C range signals and a scripted D `violet` event provide inspection cues. Physical sample material remains magenta. No synthetic automatic defect inference is made.
3. The violet/A possible-solution angular pattern is0→30→−30→30→0 degrees (clockwise30/counterclockwise60/clockwise60/counterclockwise30). Playback durations are authored rather than converted from75% motor power to an invented calibrated speed.
4. A second upper-body expression and eye-light changes demonstrate documented motor/light capabilities, explicitly as an app-authored extension. The source main program lights C eyes; the demo does not reproduce the source sound or Hub image animations.

The distinct teacher example is **red→A, green→F**, initialized at350 rather than the main program's0. It is preserved as a separate hashed source and never merged into a fabricated all-color response table.

**A and F motor ports are source verified, but the physical port-to-axis mapping is UNKNOWN.** The runnable extension binds modeled A→lower yaw/F→upper-body as `assignmentEvidence.category: app-authored`, confidence0.35, with UNKNOWN stated in the note, step warnings and scenario limitations. This category identifies an authored command binding, not verified source wiring: the common solver deliberately refuses a literal unresolved physical command. C→Distance Sensor and D→Color Sensor are documented. No geometry or test passing can resolve A/F tracing by itself.

Both axes have conservative modeled±35° limits. These are not physical end stops, calibrated safe cable travel or the motor's absolute encoder reporting interval. Source alignment insets remain represented by zero-pose orientation; exact pointer/shaft calibration still needs the independent source-view gate. Cable routes are schematic, captive and uncounted; lengths are not invented.

## Exercised checks and outstanding source-view verification

`tests/unit/quality-check.test.ts` contains one end-to-end regression comparing every source callout addition and BOM row against the independent research JSON; locked manual registry; genuine integration/view/wiring semantics; sample count timing and actual two-brick stack; native critical mates; deterministic assembly/simulation replay; lower fixed body/rotating rotor; upper moving body/countertransformed rotor; eyes rigidly following the actual body; violet-event provenance and unknown mapping labels.

Parent integration exercised strict compilation, typechecking, units and the real-browser source-control scenario. Manual validation must still compare Detector4/9/12/16 and Head6/10/12/13/14/17/19 against private primary-source pages, plus staged inventory, intermediate merges, final, exploded, technical and simulation geometry. Significant remaining acceptance boundaries are numerical fit/collision comparison, motor pointer alignment, A/F cable tracing and calibrated safe travel. Chrome-rendered movement proves UI/engine operation only.

Original Chrome source-stage captures: [Idea Detector stage, 34/55 robot units](screenshots/quality-check-intermediate.webp) and [complete Robot Head at 5.3 s with F=0.506 rad, D=violet, C=35](screenshots/quality-check-inspection.webp). The latter is a scripted RoboBuild response, not manufacturer-verified A/F kinematics or physical calibration.
