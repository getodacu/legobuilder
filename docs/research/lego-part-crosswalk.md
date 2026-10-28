# LEGO visual-part to licensed geometry crosswalk

Research date: 2026-10-20. Machine-readable handoff: [data/lego-part-crosswalk.json](data/lego-part-crosswalk.json). This is a source-shape crosswalk, **not a certified LEGO element-ID/mold equivalence table**. It covers Advanced Driving Base, Package Sorter, Robot Hand, and Quality Check Robot. Manual hashes, step references and physical callout-unit totals remain unchanged; corrected identifications can redistribute family counts. Original cached files and the earlier geometry manifest remain untouched. Corrected names/materials below supersede misleading descriptive labels.

## Acquisition and coverage

All **132 contextual visual families** (45 Advanced Driving Base,45 sorter,17 hand,25 Quality;36 distinct hand/Quality input keys) select one of **64 genuine official-library LDraw roots**. Book4 p17's azure short liftarm splits from the cable-clip family but reuses already-selected60483; its gray bracket migrates to already-selected63869. Hand's bent jaws use32348; Sorter32271 remains unchanged. No primitive stand-ins or invented dimensions were introduced. Sixteen selected roots reuse earlier root assets; two were baseline dependencies. All23 baseline roots/366 DAT files remain preserved.

The private curated tree contains **563 DAT files**, **1,562,275 DAT bytes**: the original366 plus197 additional DATs. Research acquired61 narrow per-root dependency ZIPs,852,616 archive bytes; never a whole library. The selected runtime roots now need a closed union of **485 DATs /1,323,112 bytes**; the retained32348 root adds only its original3,597 bytes and reuses41 selected dependencies. Source-specific file lists, bundle member lists, author/header/history/BFC data, URLs, byte sizes and SHA-256 hashes are in the JSON. Every type-1 dependency resolves; no conflicting bytes were merged and no original DAT was overwritten. Current exact root membership comes from `assets[].dependencyClosure`; per-file `includedBySelectedRoots` arrays are retained as the initial inspection snapshot. The earlier correction acquisition `32054.zip` added only `parts/32054.dat` and `p/confric9.dat`; its other28 members matched existing bytes.

Actual inspected headers declare **548 CC BY 4.0** files and **15 mixed CC BY 2.0 / CC BY 4.0** files across the cache. This count includes retained research candidates, not just chosen roots. Each additional file—not just its ZIP or root—has an observed declaration. Preserve both notices and histories on mixed files, including the newly selected `32054.dat`. Follow the [actual library license readme](https://library.ldraw.org/library/official/CAreadme.txt) and [LDraw legal guidance](https://www.ldraw.org/legal-info); attribution must account for dependencies, not only root authors.

## Evidence and identifier rules

- Source shapes were inspected in actual official manual images and the [2019 element overview][overview], including both base/expansion pages, then compared with real DAT descriptions and geometry references. Manual page numbers below are one-based PDF indexes; printed step numbers are separately recorded in JSON. Original PDF hashes remain in the three input manifests. Private contact sheets/renders added under `.research-cache/geometry` are listed and hashed in the delta manifest, not licensed for redistribution.
- LDraw **geometryId** is only the DAT basename. **elementIds** are separately qualified existing official-overview associations; no guessed design/element IDs were added. The [2021 expansion overview][expansion] does not certify equivalence to a 2019 physical mold. Retail electronics SKUs are independent fields.
- The [supporting author-authorized set palette](https://www.johnholbrook.us/LEGO/sets/45678.ldr) helped locate candidates and cross-check colors, not certify IDs, build quantities, robot placement or historical molds. The DAT header/geometry and manual image determine the selected source shape.
- The [official 63869 detail page](https://library.ldraw.org/parts/11564) and [small-wheel composite detail page](https://library.ldraw.org/parts/10267) explicitly link their DAT and dependency ZIP. Every acquired root retains its actual `Name:` filename and official per-root ZIP URL; downloads are not a redistributable license by themselves. All listed DATs are official-library files, not copied proprietary app meshes.
- `high-source-shape` means the visible functional family agrees; it never means a manufacturer-certified mold. `medium-mold` retains an explicit alternative or unseen-underside uncertainty. Exact material codes are render mappings supported by source images/palette, not calibrated physical color measurements. Inherited color must not override fixed subpart colors.

## Corrections that must drive consuming manifests

Apply these source-shaped descriptions/materials before model authors consume older records. Per-step and whole-build physical unit totals stay unchanged; the ADB corrections below remove one mistaken family and redistribute its counted units, not preserve a false runtime alias:

1. **`advanced-driving-base:black-angle4x4` → `63869.dat`, Light bluish gray.** Callout is the same gray 3x2 cross block as page 16; no black 4x4 bent beam is added. Reject the old 6278125 catalog association for this key. Evidence: book2 p18 / step 18; book3 p18 / step 18.
2. **`hand-quality:gray-axle-pin` → `3673.dat`, Light bluish gray.** Callout shows a cylindrical pin with end slots and collars at both ends, not a cross axle. It enters the round hole of the gray cross block. Evidence: robot-head p8 / step 6.
3. **`hand-quality:azure-short-connector` → `49283.dat`, Medium azure.** Same local key denotes a different shape in hand and head: head is a grooved cable clip with cross hole; hand page 12 is a 2L liftarm with round and axle holes (60483). Dispatch by build/manual, never key globally. Evidence: robot-head p15 / step 13.
4. **`hand-quality:gray-double-pin-connector` → `48989.dat`, Light bluish gray.** Four integral pins (two on each face), not two integral pins total; round-center mold remains provisional versus 65489. Evidence: hand p5 / step 2; idea-detector p7 / step 4.
5. **`hand-quality:violet-brick` → `39789.dat`, Magenta.** Sample uses magenta vertical-axlehole 2x4 brick, not generic violet solid brick; other green/blue/red sample bricks share the same shape. Evidence: robot-head p18 / step 16.
6. **`package-sorter:axle-black-2-snap` → `18651.dat`, Black.** Length-2 refers to the cross-axle portion, plus a 1L pin; total is a 3L axle/pin family, not the shorter 43093 1L+1L family. Evidence: base2019 p49 / step 47; base2019 p51 / step 49.
7. **`package-sorter:tile-round-black-2x2` → `15535.dat`, Black.** Visible center through-hole selects 15535, not the closed-top 14769 round tile. Evidence: base2019 p47 / step 45.
8. **`hand-quality:black-round-grip` → `15535.dat`, Black.** Two smooth round 2x2 tiles with center holes fit each 2x4 jaw and leave axles exposed. Not wedge-belt pulleys 4185a/b or wedge-belt tyre 2815. Evidence: hand p19 / step 16; hand p27 / step 24.
9. **`package-sorter:rod-gray-6` → `2739a.dat`, Black.** Official 2019 overview track rod is black; retrieved supporting set palette also assigns color 0 to 2739a. Manual drawing is shaded; do not use gray from the descriptive key as a calibrated material claim. Exact Type 1 versus Type 2 mold stays provisional. Evidence: base2019 p25 / step 23.
10. **`package-sorter:gear-gray-36` → `32498.dat`, Black.** Official 2019 overview and supporting set palette show the z36 family in black; no z36 belongs to the sorter motor transmission, whose illustrated gear is z28. Manual grayscale shading is not an element color measurement. Evidence: packages2019 p3 / step 1.
11. **ADB book4 p11/p12: `grey-pin3cross` → [`32054.dat`](https://library.ldraw.org/library/official/parts/32054.dat), light bluish gray.** The [official p11 callout and insertion diagram][ADB4] show four straight long pins with stop bushes receiving four separate blue `6558` pins coaxially; p12 installs the existing units. Reject `87082`, whose hole is transverse. Original official-overview element `4211865` is corroboration only, not a certified historical-mold equivalence. The blue companion does not make the gray stop-bush part blue.
12. **ADB book4 p18 → existing white `32184` family.** [P18][ADB4] introduces two upper white axle/pin/axle cross blocks on four yellow axles; p16 introduced the lower white pair. Book4 white count **2→4**, whole ADB **4→6**; remove former `grey-anglepin3` / `55615` family **2→0**, including its wrong element association. This rejected identification is correction history only, not an accessory or alias. Book4 **68** and whole ADB **234** are unchanged; integral pins are never separately recounted.
13. **ADB book4 p28 → existing gray `18651` axle2/pin1 family.** The [p28 callout][ADB4] shows two long cross axles with short pin ends, the same family as p30. Book4 `black-pin2` **22→20**, `grey-axlepin2` **2→4**; whole ADB **75→73** and **2→4**. The upper gray axles pass through the uprights toward hub yellow holes in book5 p12. No kit-inventory counts were used.
14. **ADB book4 p17 → existing gray `63869` family.** The callout has one triple round-hole row and a perpendicular axle bore, not an H-frame. Rear14720 count4→2 and63869 count0→2; whole14720 count8→6. Native motor/cross-block/shaft contacts, not appearance alone, distinguish it.
15. **ADB book4 p17 → new `azur-beam2-cross` / existing `60483.dat`, medium azure.** P17 has two separate axle/pin two-hole liftarms; p21 blue rail pins enter their free **round** bores. The one p14 actual cable clip remains49283. Rear clip3→1 and two-hole liftarm0→2;68/234 prepared units and31/136 steps stay unchanged. Yellow bracket shafts remain vertical; the former horizontal H-frame/clip stack is removed. [Native derivation, bounded Book5 gap and exact private artifact hashes](../validation/adb-rear.md) are distinct from physical-fit approval.


The shared `hand-quality:azure-short-connector` key is **not globally resolvable**: hand → `60483.dat`, head → `49283.dat`. Resolve by **input + build + key**, as represented by `families[]` and `implementationAssetList[]`. The four sample-package colors all use `39789.dat`, not ordinary solid `3001.dat`. All magenta instances map to LDraw 26; do not silently equate the input word “Dark Pink” with LDraw 5.

## Full per-family map

Names are the exact source DAT descriptions. Materials are explicit instance choices; electronics and integral tyres retain their fixed source materials. Each root link is the primary raw CAD source. All introduction-page evidence, alternative molds, caveats, qualified element IDs and native-frame records are in JSON.

### advanced-driving-base

| Stable local key | Genuine geometry root | Corrected source family | Material | Manual evidence | Confidence |
|---|---|---|---|---|---|
| `black-pin2` | [`2780.dat`](https://library.ldraw.org/library/official/parts/2780.dat) | Technic Pin with Friction and Slots | Black | book1 p1; book1 p3; book1 p5; book1 p7; book1 p11; book1 p20; book1 p27; book1 p34; book1 p37; book2 p1; book2 p3; book2 p12; book2 p15; book3 p1; book3 p3; book3 p12; book3 p15; book4 p3; book4 p4; book4 p6; book4 p7; book4 p23; book4 p25; book5 p20 | medium-mold |
| `black-beam9` | [`40490.dat`](https://library.ldraw.org/library/official/parts/40490.dat) | Technic Beam  9 | Black | book1 p1; book4 p1; book4 p2; book4 p13 | high-source-shape |
| `grey-pinbeam3` | [`48989.dat`](https://library.ldraw.org/library/official/parts/48989.dat) | Technic Cross Block 1 x 3 (Pin/Pin/Pin) with 4 Pins | Light bluish gray | book1 p2; book1 p17; book1 p24; book2 p3; book2 p9; book3 p3; book3 p9; book4 p1; book5 p18 | medium-mold |
| `frame11x15` | [`39790.dat`](https://library.ldraw.org/library/official/parts/39790.dat) | Technic Beam 15 x 11 with Open Center 13 x  9 | Medium azure | book1 p4 | high-source-shape |
| `blue-pin3` | [`6558.dat`](https://library.ldraw.org/library/official/parts/6558.dat) | Technic Pin Long with Friction and Slot | Blue | book1 p6; book1 p8; book1 p12; book1 p16; book1 p23; book2 p3; book2 p5; book2 p16; book2 p23; book3 p3; book3 p5; book3 p16; book3 p23; book4 p11; book4 p14; book4 p20 | high-source-shape |
| `white-doublecross` | [`32184.dat`](https://library.ldraw.org/library/official/parts/32184.dat) | Technic Cross Block 1 x 3 (Axle/Pin/Axle) | White | book1 p6; book4 p16; book4 p18 | high-source-shape |
| `medium-motor` | [`54696p01.dat`](https://library.ldraw.org/library/official/parts/54696p01.dat) | Electric Powered Up Medium Angular Motor with Medium Azure Back and Hub Pattern | White / fixed source subpart colors | book1 p8; book4 p5 | high-source-shape |
| `pink-connector3` | [`39793.dat`](https://library.ldraw.org/library/official/parts/39793.dat) | Technic Connector Block  3 x  3 with  9 Perpendicular Holes | Magenta | book1 p11; book1 p34; book2 p6; book3 p6; book4 p7 | high-source-shape |
| `grey-iframe3x5` | [`14720.dat`](https://library.ldraw.org/library/official/parts/14720.dat) | Technic Beam  5 x  3 H-shaped | Light bluish gray | book1 p12; book1 p15; book2 p20; book3 p20; book4 p8; book4 p10 | high-source-shape |
| `color-sensor` | [`37308.dat`](https://library.ldraw.org/library/official/parts/37308.dat) | Electric Powered Up Colour Sensor | White / fixed source subpart colors | book1 p16; book1 p23 | high-source-shape |
| `ballcup` | [`39370.dat`](https://library.ldraw.org/library/official/parts/39370.dat) | Technic Beam  5 x  3 H-shaped with Ball Socket | Medium azure | book1 p18; book1 p25 | high-source-shape |
| `ball19` | [`52629.dat`](https://library.ldraw.org/library/official/parts/52629.dat) | Technic Ball 19mm for Ball Castor | White | book1 p18; book1 p25 | high-source-shape |
| `azur-angle3x5` | [`32526.dat`](https://library.ldraw.org/library/official/parts/32526.dat) | Technic Beam  3 x  5 Bent 90 | Medium azure | book1 p21; book1 p28 | high-source-shape |
| `black-beam15` | [`32278.dat`](https://library.ldraw.org/library/official/parts/32278.dat) | Technic Beam 15 | Black | book1 p30 | high-source-shape |
| `red-axlepin3` | [`11214.dat`](https://library.ldraw.org/library/official/parts/11214.dat) | Technic Axle Pin Long with Friction with  2L Pin | Red | book1 p31; book2 p19; book3 p19; book4 p27; book5 p14 | high-source-shape |
| `yellow-brick2x4` | [`39789.dat`](https://library.ldraw.org/library/official/parts/39789.dat) | Brick  2 x  4 with  3 Axleholes Vertical | Yellow | book1 p31 | high-source-shape |
| `black-tube1` | [`18654.dat`](https://library.ldraw.org/library/official/parts/18654.dat) | Technic Beam  1 | Black | book1 p32 | high-source-shape |
| `grey-gear28` | [`46372.dat`](https://library.ldraw.org/library/official/parts/46372.dat) | Technic Gear 28 Tooth Double Bevel | Light bluish gray | book1 p37; book4 p25 | high-source-shape |
| `large-motor` | [`54675.dat`](https://library.ldraw.org/library/official/parts/54675.dat) | Electric Powered Up Large Angular Motor with Medium Azure Back | White / fixed source subpart colors | book2 p1; book3 p1 | high-source-shape |
| `black-frame5x7` | [`64179.dat`](https://library.ldraw.org/library/official/parts/64179.dat) | Technic Beam  7 x  5 with Open Center  5 x  3 | Black | book2 p2; book3 p2; book5 p18; book5 p19 | high-source-shape |
| `wheel88` | [`49295p01.dat`](https://library.ldraw.org/library/official/parts/49295p01.dat) | Wheel 14 x 80 with  4 Spokes with Integral Medium Azure Tyre | Black rim with integral medium azure tyre | book2 p4; book3 p4 | high-source-shape |
| `grey-axle5` | [`32073.dat`](https://library.ldraw.org/library/official/parts/32073.dat) | Technic Axle  5 | Light bluish gray | book2 p7; book3 p7 | high-source-shape |
| `grey-bush` | [`3713.dat`](https://library.ldraw.org/library/official/parts/3713.dat) | Technic Bush with Two Flanges | Light bluish gray | book5 p17 | high-source-shape |
| `black-doubleangle3x7` | [`32009.dat`](https://library.ldraw.org/library/official/parts/32009.dat) | Technic Beam  3 x  3.8 x  7 Liftarm Bent 45 Double | Black | book2 p8; book2 p10; book2 p17; book3 p8; book3 p10; book3 p17 | high-source-shape |
| `grey-cross2x1` | [`6536.dat`](https://library.ldraw.org/library/official/parts/6536.dat) | Technic Cross Block 1 x 2 (Axle/Pin) | Light bluish gray | book2 p7; book2 p8; book2 p11; book3 p7; book3 p8; book3 p11 | high-source-shape |
| `yellow-axle3` | [`4519.dat`](https://library.ldraw.org/library/official/parts/4519.dat) | Technic Axle  3 | Yellow | book2 p9; book3 p9; book4 p16 | high-source-shape |
| `black-axle4` | [`3705.dat`](https://library.ldraw.org/library/official/parts/3705.dat) | Technic Axle  4 | Black | book2 p14; book3 p14 | high-source-shape |
| `black-angle4x4` | [`63869.dat`](https://library.ldraw.org/library/official/parts/63869.dat) | Technic Cross Block 3 x 2 (Axle/Triple Pin) | Light bluish gray | book2 p18; book3 p18 | high-source-shape |
| `grey-cross3x2` | [`63869.dat`](https://library.ldraw.org/library/official/parts/63869.dat) | Technic Cross Block 3 x 2 (Axle/Triple Pin) | Light bluish gray | book2 p16; book3 p16; book4 p17 | high-source-shape |
| `yellow-beam3` | [`32523.dat`](https://library.ldraw.org/library/official/parts/32523.dat) | Technic Beam  3 | Yellow | book2 p21; book3 p21 | high-source-shape |
| `grey-pin3cross` | [`32054.dat`](https://library.ldraw.org/library/official/parts/32054.dat) | Technic Pin Long with Stop Bush | Light bluish gray | book4 p11; book4 p12 | high-source-shape |
| `azur-beam13` | [`41239.dat`](https://library.ldraw.org/library/official/parts/41239.dat) | Technic Beam 13 | Medium azure | book4 p20; book4 p22 | high-source-shape |
| `yellow-tube2` | [`62462.dat`](https://library.ldraw.org/library/official/parts/62462.dat) | Technic Pin Joiner Round with Slot | Yellow | book4 p23 | high-source-shape |
| `pink-frame7x11` | [`39794.dat`](https://library.ldraw.org/library/official/parts/39794.dat) | Technic Beam 11 x  7 with Open Center  9 x  5 | Magenta | book4 p27; book5 p14 | high-source-shape |
| `azur-beam7` | [`32524.dat`](https://library.ldraw.org/library/official/parts/32524.dat) | Technic Beam  7 | Medium azure | book4 p30 | high-source-shape |
| `grey-axlepin2` | [`18651.dat`](https://library.ldraw.org/library/official/parts/18651.dat) | Technic Axle Pin Long with Friction with  2L Axle | Light bluish gray | book4 p28; book4 p30 | high-source-shape |
| `hub` | [`45601c01.dat`](https://library.ldraw.org/library/official/parts/45601c01.dat) | Electric Powered Up 6 Port Hub with Yellow Bottom | White / fixed source subpart colors | book5 p4 | high-source-shape |
| `brown-axle5stop` | [`15462.dat`](https://library.ldraw.org/library/official/parts/15462.dat) | Technic Axle  5 with Stop | Reddish brown | book5 p16 | high-source-shape |
| `blue-wireclip` | [`49283.dat`](https://library.ldraw.org/library/official/parts/49283.dat) | Technic Cable Clip | Blue | book1 p9 | high-source-shape |
| `green-wireclip` | [`49283.dat`](https://library.ldraw.org/library/official/parts/49283.dat) | Technic Cable Clip | Green | book1 p9 | high-source-shape |
| `red-wireclip` | [`49283.dat`](https://library.ldraw.org/library/official/parts/49283.dat) | Technic Cable Clip | Red | book1 p13 | high-source-shape |
| `magenta-wireclip` | [`49283.dat`](https://library.ldraw.org/library/official/parts/49283.dat) | Technic Cable Clip | Magenta | book2 p23 | high-source-shape |
| `yellow-wireclip` | [`49283.dat`](https://library.ldraw.org/library/official/parts/49283.dat) | Technic Cable Clip | Yellow | book3 p23 | high-source-shape |
| `azur-wireclip` | [`49283.dat`](https://library.ldraw.org/library/official/parts/49283.dat) | Technic Cable Clip | Medium azure | book4 p14 only | high-source-shape |
| `azur-beam2-cross` | [`60483.dat`](https://library.ldraw.org/library/official/parts/60483.dat) | Technic Beam 2 Liftarm; distinct axle/round bores | Medium azure | book4 p17 callout; p21 rail pin insertion | high-source-shape |

### package-sorter

| Stable local key | Genuine geometry root | Corrected source family | Material | Manual evidence | Confidence |
|---|---|---|---|---|---|
| `hub` | [`45601c01.dat`](https://library.ldraw.org/library/official/parts/45601c01.dat) | Electric Powered Up 6 Port Hub with Yellow Bottom | White / fixed source subpart colors | robot2019 p4 | high-source-shape |
| `panel-yellow-11x19` | [`39369.dat`](https://library.ldraw.org/library/official/parts/39369.dat) | Technic Beam 19 x 11 Baseplate | Yellow | robot2019 p5 | high-source-shape |
| `peg-black-friction` | [`2780.dat`](https://library.ldraw.org/library/official/parts/2780.dat) | Technic Pin with Friction and Slots | Black | robot2019 p4; robot2019 p6; robot2019 p7; robot2019 p9; robot2019 p13; base2019 p3; base2019 p4; base2019 p11; base2019 p14; base2019 p15; base2019 p18; base2019 p24; base2019 p28; base2019 p31; base2019 p35; base2019 p39; base2019 p43; base2019 p50; base2019 p54 | medium-mold |
| `peg-tan-axle` | [`3749.dat`](https://library.ldraw.org/library/official/parts/3749.dat) | Technic Axle Pin | Tan | robot2019 p6; robot2019 p21; base2019 p27; base2019 p30; base2019 p33; base2019 p37 | high-source-shape |
| `clip-red` | [`49283.dat`](https://library.ldraw.org/library/official/parts/49283.dat) | Technic Cable Clip | Red | robot2019 p6 | high-source-shape |
| `frame-azure-11x15` | [`39790.dat`](https://library.ldraw.org/library/official/parts/39790.dat) | Technic Beam 15 x 11 with Open Center 13 x  9 | Medium azure | robot2019 p8 | high-source-shape |
| `frame-magenta-7x11` | [`39794.dat`](https://library.ldraw.org/library/official/parts/39794.dat) | Technic Beam 11 x  7 with Open Center  9 x  5 | Magenta | robot2019 p8 | high-source-shape |
| `beam-yellow-3` | [`32523.dat`](https://library.ldraw.org/library/official/parts/32523.dat) | Technic Beam  3 | Yellow | robot2019 p9 | high-source-shape |
| `peg-black-knob` | [`6628.dat`](https://library.ldraw.org/library/official/parts/6628.dat) | Technic Pin Towball with Friction | Black | robot2019 p10; base2019 p24, p52, p56 | high-source-shape |
| `motor-large` | [`54675.dat`](https://library.ldraw.org/library/official/parts/54675.dat) | Electric Powered Up Large Angular Motor with Medium Azure Back | White / fixed source subpart colors | robot2019 p11 | high-source-shape |
| `connector-gray-3-four-snaps` | [`48989.dat`](https://library.ldraw.org/library/official/parts/48989.dat) | Technic Cross Block 1 x 3 (Pin/Pin/Pin) with 4 Pins | Light bluish gray | robot2019 p11; robot2019 p19; robot2019 p20; base2019 p20 | medium-mold |
| `angular-azure-3x5` | [`32526.dat`](https://library.ldraw.org/library/official/parts/32526.dat) | Technic Beam  3 x  5 Bent 90 | Medium azure | robot2019 p12; base2019 p34; base2019 p38 | high-source-shape |
| `biscuit-magenta` | [`39793.dat`](https://library.ldraw.org/library/official/parts/39793.dat) | Technic Connector Block  3 x  3 with  9 Perpendicular Holes | Magenta | robot2019 p14; base2019 p17; base2019 p19; base2019 p44 | high-source-shape |
| `peg-blue-3-friction` | [`6558.dat`](https://library.ldraw.org/library/official/parts/6558.dat) | Technic Pin Long with Friction and Slot | Blue | robot2019 p15; robot2019 p17; base2019 p28; base2019 p31 | high-source-shape |
| `beam-magenta-5` | [`32316.dat`](https://library.ldraw.org/library/official/parts/32316.dat) | Technic Beam  5 | Magenta | robot2019 p17; base2019 p14 | high-source-shape |
| `iframe-gray-3x5` | [`14720.dat`](https://library.ldraw.org/library/official/parts/14720.dat) | Technic Beam  5 x  3 H-shaped | Light bluish gray | robot2019 p18 | high-source-shape |
| `biscuit-black` | [`39793.dat`](https://library.ldraw.org/library/official/parts/39793.dat) | Technic Connector Block  3 x  3 with  9 Perpendicular Holes | Black | robot2019 p20; robot2019 p21 | high-source-shape |
| `tbeam-black-3x3` | [`60484.dat`](https://library.ldraw.org/library/official/parts/60484.dat) | Technic Beam  3 x  3 T-shaped | Black | base2019 p3; base2019 p4 | high-source-shape |
| `motor-medium` | [`54696p01.dat`](https://library.ldraw.org/library/official/parts/54696p01.dat) | Electric Powered Up Medium Angular Motor with Medium Azure Back and Hub Pattern | White / fixed source subpart colors | base2019 p5 | high-source-shape |
| `frame-black-5x7` | [`64179.dat`](https://library.ldraw.org/library/official/parts/64179.dat) | Technic Beam  7 x  5 with Open Center  5 x  3 | Black | base2019 p6; base2019 p9 | high-source-shape |
| `peg-gray` | [`3673.dat`](https://library.ldraw.org/library/official/parts/3673.dat) | Technic Pin | Light bluish gray | base2019 p7; base2019 p10 | high-source-shape |
| `axle-yellow-7` | [`44294.dat`](https://library.ldraw.org/library/official/parts/44294.dat) | Technic Axle  7 | Yellow | base2019 p13 | high-source-shape |
| `axle-gray-5` | [`32073.dat`](https://library.ldraw.org/library/official/parts/32073.dat) | Technic Axle  5 | Light bluish gray | base2019 p13 | high-source-shape |
| `gear-gray-36` | [`32498.dat`](https://library.ldraw.org/library/official/parts/32498.dat) | Technic Gear 36 Tooth Double Bevel | Black | packages2019 p3 | high-source-shape |
| `gear-gray-28` | [`46372.dat`](https://library.ldraw.org/library/official/parts/46372.dat) | Technic Gear 28 Tooth Double Bevel | Light bluish gray | base2019 p17 | high-source-shape |
| `beam-azure-13` | [`41239.dat`](https://library.ldraw.org/library/official/parts/41239.dat) | Technic Beam 13 | Medium azure | base2019 p18 | high-source-shape |
| `beam-azure-7` | [`32524.dat`](https://library.ldraw.org/library/official/parts/32524.dat) | Technic Beam  7 | Medium azure | base2019 p21; base2019 p22 | high-source-shape |
| `beam-azure-2-cross` | [`60483.dat`](https://library.ldraw.org/library/official/parts/60483.dat) | Technic Beam  2 Liftarm | Medium azure | base2019 p23 | high-source-shape |
| `rod-gray-6` | [`2739a.dat`](https://library.ldraw.org/library/official/parts/2739a.dat) | Technic Steering Link  6L Type 1 | Black | base2019 p25 | medium-mold |
| `angular-yellow-2x4` | [`32140.dat`](https://library.ldraw.org/library/official/parts/32140.dat) | Technic Beam  2 x  4 Liftarm Bent 90 | Yellow | base2019 p27; base2019 p30 | high-source-shape |
| `double-cross-block-light` | [`32184.dat`](https://library.ldraw.org/library/official/parts/32184.dat) | Technic Cross Block 1 x 3 (Axle/Pin/Axle) | White | base2019 p33; base2019 p37; base2019 p49 | high-source-shape |
| `beam-magenta-11` | [`32525.dat`](https://library.ldraw.org/library/official/parts/32525.dat) | Technic Beam 11 | Magenta | base2019 p41 | high-source-shape |
| `beam-black-15` | [`32278.dat`](https://library.ldraw.org/library/official/parts/32278.dat) | Technic Beam 15 | Black | base2019 p42 | high-source-shape |
| `color-sensor` | [`37308.dat`](https://library.ldraw.org/library/official/parts/37308.dat) | Electric Powered Up Colour Sensor | White / fixed source subpart colors | base2019 p44 | high-source-shape |
| `plate-round-azure-2x2` | [`4032a.dat`](https://library.ldraw.org/library/official/parts/4032a.dat) | Plate  2 x  2 Round with Axlehole | Medium azure | base2019 p45 | medium-mold |
| `dish-transparent-6x6` | [`44375b.dat`](https://library.ldraw.org/library/official/parts/44375b.dat) | Dish  6 x  6 Inverted with Solid Studs | Transparent clear | base2019 p46 | medium-mold |
| `tile-round-black-2x2` | [`15535.dat`](https://library.ldraw.org/library/official/parts/15535.dat) | Tile  2 x  2 Round with Hole | Black | base2019 p47 | high-source-shape |
| `axle-black-2-snap` | [`18651.dat`](https://library.ldraw.org/library/official/parts/18651.dat) | Technic Axle Pin Long with Friction with  2L Axle | Black | base2019 p49; base2019 p51; base2019 p55 | high-source-shape |
| `angular-yellow-3x7` | [`32271.dat`](https://library.ldraw.org/library/official/parts/32271.dat) | Technic Beam  3 x  7 Liftarm Bent 53.13 | Yellow | base2019 p50; base2019 p54 | high-source-shape |
| `axle-red-2` | [`32062.dat`](https://library.ldraw.org/library/official/parts/32062.dat) | Technic Axle  2 Notched | Red | base2019 p50; base2019 p54 | high-source-shape |
| `angle-black-180` | [`32034.dat`](https://library.ldraw.org/library/official/parts/32034.dat) | Technic Angle Connector #2 (180 degree) | Black | base2019 p51; base2019 p55 | high-source-shape |
| `panel-azure-3x11x2` | [`11954.dat`](https://library.ldraw.org/library/official/parts/11954.dat) | Technic Panel Smooth 11 x  2 x  3 with 10 Front Pin Holes | Medium azure | base2019 p52; base2019 p56 | high-source-shape |
| `axle-yellow-3` | [`4519.dat`](https://library.ldraw.org/library/official/parts/4519.dat) | Technic Axle  3 | Yellow | packages2019 p4 | high-source-shape |
| `brick-yellow-2x4-cross` | [`39789.dat`](https://library.ldraw.org/library/official/parts/39789.dat) | Brick  2 x  4 with  3 Axleholes Vertical | Yellow | packages2019 p5 | high-source-shape |
| `brick-magenta-2x4-cross` | [`39789.dat`](https://library.ldraw.org/library/official/parts/39789.dat) | Brick  2 x  4 with  3 Axleholes Vertical | Magenta | packages2019 p5 | high-source-shape |

### robotic-hand

| Stable local key | Genuine geometry root | Corrected source family | Material | Manual evidence | Confidence |
|---|---|---|---|---|---|
| `hub` | [`45601c01.dat`](https://library.ldraw.org/library/official/parts/45601c01.dat) | Electric Powered Up 6 Port Hub with Yellow Bottom | White / fixed source subpart colors | hand p4 | high-source-shape |
| `black-pin` | [`2780.dat`](https://library.ldraw.org/library/official/parts/2780.dat) | Technic Pin with Friction and Slots | Black | hand p4; hand p8; hand p9; hand p10 | medium-mold |
| `long-black-pin` | [`18651.dat`](https://library.ldraw.org/library/official/parts/18651.dat) | Technic Axle Pin Long with Friction with  2L Axle | Black | hand p29 | high-source-shape |
| `tan-axle-pin` | [`3749.dat`](https://library.ldraw.org/library/official/parts/3749.dat) | Technic Axle Pin | Tan | hand p11; hand p20 | high-source-shape |
| `magenta-frame` | [`39794.dat`](https://library.ldraw.org/library/official/parts/39794.dat) | Technic Beam 11 x  7 with Open Center  9 x  5 | Magenta | hand p5; hand p6 | high-source-shape |
| `gray-double-pin-connector` | [`48989.dat`](https://library.ldraw.org/library/official/parts/48989.dat) | Technic Cross Block 1 x 3 (Pin/Pin/Pin) with 4 Pins | Light bluish gray | hand p5 | medium-mold |
| `medium-motor` | [`54696p01.dat`](https://library.ldraw.org/library/official/parts/54696p01.dat) | Electric Powered Up Medium Angular Motor with Medium Azure Back and Hub Pattern | White / fixed source subpart colors | hand p9 | high-source-shape |
| `yellow-axle-3` | [`4519.dat`](https://library.ldraw.org/library/official/parts/4519.dat) | Technic Axle  3 | Yellow | hand p9; hand p15; hand p17; hand p23; hand p25 | high-source-shape |
| `magenta-beam-5` | [`32316.dat`](https://library.ldraw.org/library/official/parts/32316.dat) | Technic Beam  5 | Magenta | hand p10 | high-source-shape |
| `white-short-link` | [`32184.dat`](https://library.ldraw.org/library/official/parts/32184.dat) | Technic Cross Block 1 x 3 (Axle/Pin/Axle) | White | hand p11 | high-source-shape |
| `azure-short-connector` | [`60483.dat`](https://library.ldraw.org/library/official/parts/60483.dat) | Technic Beam  2 Liftarm | Medium azure | hand p12 | high-source-shape |
| `small-tire` | [`61254.dat`](https://library.ldraw.org/library/official/parts/61254.dat) | Tyre  7/ 45 x 17 Offset Tread with Middle Band | Black rubber | hand p14; hand p22 | high-source-shape |
| `small-wheel` | [`56903.dat`](https://library.ldraw.org/library/official/parts/56903.dat) | Wheel Rim  8 x 18 with Deep Centre Groove and Axle Hole | White | hand p14; hand p22 | high-source-shape |
| `magenta-technic-brick` | [`39789.dat`](https://library.ldraw.org/library/official/parts/39789.dat) | Brick  2 x  4 with  3 Axleholes Vertical | Magenta | hand p16; hand p24 | high-source-shape |
| `black-angled-beam` | [`32348.dat`](https://library.ldraw.org/library/official/parts/32348.dat) | Technic Beam  4 x  4 Liftarm Bent 53.13 | Black | hand p17; hand p25; independent enlarged4+4 callout check | high-source-shape |
| `black-round-grip` | [`15535.dat`](https://library.ldraw.org/library/official/parts/15535.dat) | Tile  2 x  2 Round with Hole | Black | hand p19; hand p27 | high-source-shape |
| `gray-h-link` | [`14720.dat`](https://library.ldraw.org/library/official/parts/14720.dat) | Technic Beam  5 x  3 H-shaped | Light bluish gray | hand p30 | high-source-shape |

### quality-check

| Stable local key | Genuine geometry root | Corrected source family | Material | Manual evidence | Confidence |
|---|---|---|---|---|---|
| `hub` | [`45601c01.dat`](https://library.ldraw.org/library/official/parts/45601c01.dat) | Electric Powered Up 6 Port Hub with Yellow Bottom | White / fixed source subpart colors | idea-detector p16 | high-source-shape |
| `black-pin` | [`2780.dat`](https://library.ldraw.org/library/official/parts/2780.dat) | Technic Pin with Friction and Slots | Black | idea-detector p5; idea-detector p8; idea-detector p10; robot-head p3; robot-head p5; robot-head p10; robot-head p11 | medium-mold |
| `tan-axle-pin` | [`3749.dat`](https://library.ldraw.org/library/official/parts/3749.dat) | Technic Axle Pin | Tan | idea-detector p4; idea-detector p12; robot-head p7 | high-source-shape |
| `gray-double-pin-connector` | [`48989.dat`](https://library.ldraw.org/library/official/parts/48989.dat) | Technic Cross Block 1 x 3 (Pin/Pin/Pin) with 4 Pins | Light bluish gray | idea-detector p7 | medium-mold |
| `medium-motor` | [`54696p01.dat`](https://library.ldraw.org/library/official/parts/54696p01.dat) | Electric Powered Up Medium Angular Motor with Medium Azure Back and Hub Pattern | White / fixed source subpart colors | robot-head p3; robot-head p10 | high-source-shape |
| `azure-short-connector` | [`49283.dat`](https://library.ldraw.org/library/official/parts/49283.dat) | Technic Cable Clip | Medium azure | robot-head p15 | high-source-shape |
| `black-frame` | [`64179.dat`](https://library.ldraw.org/library/official/parts/64179.dat) | Technic Beam  7 x  5 with Open Center  5 x  3 | Black | idea-detector p4 | high-source-shape |
| `red-connector` | [`49283.dat`](https://library.ldraw.org/library/official/parts/49283.dat) | Technic Cable Clip | Red | idea-detector p5 | high-source-shape |
| `azure-l-beam` | [`32526.dat`](https://library.ldraw.org/library/official/parts/32526.dat) | Technic Beam  3 x  5 Bent 90 | Medium azure | idea-detector p6 | high-source-shape |
| `yellow-plate` | [`39369.dat`](https://library.ldraw.org/library/official/parts/39369.dat) | Technic Beam 19 x 11 Baseplate | Yellow | idea-detector p9 | high-source-shape |
| `color-sensor` | [`37308.dat`](https://library.ldraw.org/library/official/parts/37308.dat) | Electric Powered Up Colour Sensor | White / fixed source subpart colors | idea-detector p11 | high-source-shape |
| `yellow-brick` | [`39789.dat`](https://library.ldraw.org/library/official/parts/39789.dat) | Brick  2 x  4 with  3 Axleholes Vertical | Yellow | idea-detector p12 | high-source-shape |
| `yellow-curve` | [`24309.dat`](https://library.ldraw.org/library/official/parts/24309.dat) | Slope Brick Curved  3 x  2 | Yellow | idea-detector p14 | high-source-shape |
| `azure-panel-left` | [`41750.dat`](https://library.ldraw.org/library/official/parts/41750.dat) | Slope Brick Round  3 x  8 x  2 Left | Medium azure | idea-detector p15 | high-source-shape |
| `azure-panel-right` | [`41749.dat`](https://library.ldraw.org/library/official/parts/41749.dat) | Slope Brick Round  3 x  8 x  2 Right | Medium azure | idea-detector p15 | high-source-shape |
| `magenta-square-connector` | [`39793.dat`](https://library.ldraw.org/library/official/parts/39793.dat) | Technic Connector Block  3 x  3 with  9 Perpendicular Holes | Magenta | robot-head p4; robot-head p11 | high-source-shape |
| `gray-right-angle-connector` | [`6536.dat`](https://library.ldraw.org/library/official/parts/6536.dat) | Technic Cross Block 1 x 2 (Axle/Pin) | Light bluish gray | robot-head p7 | high-source-shape |
| `gray-axle-pin` | [`3673.dat`](https://library.ldraw.org/library/official/parts/3673.dat) | Technic Pin | Light bluish gray | robot-head p8 | high-source-shape |
| `distance-sensor` | [`37316.dat`](https://library.ldraw.org/library/official/parts/37316.dat) | Electric Powered Up Distance Sensor | White / fixed source subpart colors | robot-head p12 | high-source-shape |
| `red-axle` | [`32062.dat`](https://library.ldraw.org/library/official/parts/32062.dat) | Technic Axle  2 Notched | Red | robot-head p15 | high-source-shape |
| `magenta-short-connector` | [`49283.dat`](https://library.ldraw.org/library/official/parts/49283.dat) | Technic Cable Clip | Magenta | robot-head p16 | high-source-shape |
| `green-brick` | [`39789.dat`](https://library.ldraw.org/library/official/parts/39789.dat) | Brick  2 x  4 with  3 Axleholes Vertical | Green | robot-head p18 | high-source-shape |
| `blue-brick` | [`39789.dat`](https://library.ldraw.org/library/official/parts/39789.dat) | Brick  2 x  4 with  3 Axleholes Vertical | Blue | robot-head p18 | high-source-shape |
| `red-brick` | [`39789.dat`](https://library.ldraw.org/library/official/parts/39789.dat) | Brick  2 x  4 with  3 Axleholes Vertical | Red | robot-head p18 | high-source-shape |
| `violet-brick` | [`39789.dat`](https://library.ldraw.org/library/official/parts/39789.dat) | Brick  2 x  4 with  3 Axleholes Vertical | Magenta | robot-head p18 | high-source-shape |

## Decisions for easily confused families

- **Hand gripping rounds:** `15535.dat`, smooth round 2×2 tiles with through-holes. Hand pp19/27 show two on each 2×4 jaw, leaving the yellow axles exposed. The supporting palette independently contains four black `15535` instances. `4185a/b` are wedge-belt pulleys and `2815` is the pulley tyre; neither is this smooth full-faced tile. Retained downloaded pulley candidates are not runtime selections.
- **Hand H-link versus caster:** `14720.dat` is the plain 5×3 H beam (hand p30); `39370.dat` has a ball socket and is not interchangeable. The white three-position link is `32184.dat` (axle/pin/axle), not a generic three-pin-hole beam. The small azure hand connector is the distinct two-position `60483.dat`.
- **Hand wheels and tyres:** white `56903.dat` rim and black `61254.dat` offset-tread tyre are separate callouts on pp14/22. The [official `56903c01.dat` shortcut](https://library.ldraw.org/library/official/parts/56903c01.dat), lines12–13, places both at **the same native origin with identity matrices**. This shortcut is cached as composition evidence only; do not add it as a third physical item.
- **2×4 jaw/package/sample bricks:** `39789.dat` has three **vertical axle holes**, not horizontal side holes or a solid ordinary brick. Hand pp16/24, sorter packages p5 and Quality samples p18 support this source shape. Retain inherited instance color for yellow/magenta/green/blue/red variants.
- **Quality sensor/head connections:** magenta squares are `39793.dat`; gray elbow is `6536.dat`; gray element inserted on head p8 is a smooth `3673.dat` pin, not a long cross axle. Detector red piece and both head cable-retainer clips are `49283.dat`.
- **Quality handed shells:** `41750.dat` is LDraw Left and `41749.dat` Right; both are medium azure 3×8×2 curved shells with the depicted studded ends. Use both authored parts. `24309.dat` supplies the yellow 3×2 curved-top pieces, atop vertical-axlehole bricks. Local “left/right” does not certify a camera/world axis; use the page15 assembly view.
- **Sorter fork panels/rods/gears:** the two bowed fork covers use `11954.dat`, with ten front pin holes, not the Quality curved studded shells. The 6L eye-ended rods select genuine `2739a.dat` Type1; `32005.dat` Type2 remains a cached mold alternative. The sorter transmission’s p17 gear is `46372.dat` **z28**; separate package feet on packages p3 are `32498.dat` **z36**. Neither gear is a stand-in for the other.
- **Advanced wheel88:** `49295p01.dat` is the proper larger integral-tyre composite. LEGO’s overview calls the assembled wheel88mm; the LDraw name is “Wheel14×80 ... Integral Medium Azure Tyre.” These nominal descriptions concern different features; do not rescale geometry to force the names to agree, substitute smaller `39367p01`, or add an extra tyre. Root inherited rim is black; fixed tyre color10322 remains rubber medium azure.
- **Advanced caster:** map separate callouts to `39370.dat` frame and `52629.dat` white ball. The [real shortcut](https://library.ldraw.org/library/official/parts/39370c01.dat), lines14–15, gives ball-in-frame translation **[0,46,0] LDU**, identity orientation. Do **not** instantiate complete `39370c01` and another ball.
- **Pins and four-pin blocks:** select the observed slotted friction family `2780.dat` while retaining `61332.dat` alternative; select circular-center `48989.dat` while retaining rectangular-center `65489.dat`. Both are genuine licensed geometries, but neither comparison certifies the manual’s historical mold.
- **Advanced rear straight connector and white cross blocks:** `32054` has a coaxial stop bush, not the transverse eye on rejected `87082`; `32184` is the white axle/pin/axle cross block at both rear pp16/18, not rejected gray angular `55615`. Neither rejected root has another selected build context, so both are private research candidates only, absent from the curated runtime roots.

## Native source origins and axes

The [LDraw specification](https://www.ldraw.org/article/218.html) uses right-handed coordinates with **negative Y up** and LDU units. Approximately0.4mm/LDU is a real-world approximation, not an invented engineering measurement. Preserve every original part-local origin; a bounding-box-centered converted mesh would destroy the supplied attachment evidence.

Every selected asset contains `nativeCoordinates`: original [0,0,0], numeric axis basis, raw root type-1 matrices and source file/line chains for **510 composed connection-primitive references**. The references are CAD-derived, not measured from a diagram. A primitive’s source matrix/reference point is not automatically an insertion depth or a center-plane mate. For families whose semantic origin was not independently established, that limitation is explicit rather than a fabricated pivot.

Useful established frames:

- Straight selected odd-length beams run along native **Z**, with ordinary hole axes **Y** and the origin at the central hole. `40490` repeats hole features at20LDU spacing. Do not assume one end is origin.
- Plain selected axles run along **X**, with source end coordinates of opposite sign. A stopped axle’s origin is not automatically its stop face.
- Selected open frames are centered in native **X/Z**, normal **Y**. Their source pegholes appear at opposing signed coordinates.
- `39789` origin is the top-deck center excluding studs; length **X**, width **Z**, vertical axleholes **Y**. The actual file places axlehole references at X=−20,0,20; those are exact CAD coordinates, not physical dimensions assigned here.
- Wheels/rim/tyre and z28/z36 gears rotate around native **Z**; preserve source axial offsets. `52629` is a centered sphere.
- [`32054.dat`](https://library.ldraw.org/library/official/parts/32054.dat) is coaxial along native **X**: `bush0.dat` is placed at **[−20,0,0]**, with bush end planes **X=−30/−10** and the gray pin shaft **X=−10…30**. The separate [`6558.dat`](https://library.ldraw.org/library/official/parts/6558.dat) collar is at **X=−10**; its short end **−30…−10** enters the stop bush with opposing native X directions, collar seating against gray rear lip **X=−30**. This is a CAD-derived/source-view reconstruction, not a tested physical fit or manufacturer tolerance claim.
- For Y-up Three/glTF, use **one outer X rotation byπ**, `(x,y,z)→(x,−y,−z)`, plus the chosen uniform unit scale. Negating only Y reflects geometry. Preserve BFC, `INVERTNEXT`, mirrored matrices and fixed material inheritance.

## Actionable asset and delta manifest

1. Consume `implementationAssetList[]` for each build and resolve the full `families[]` record by input/build/key. Use `correctedName` and `material`, not the obsolete descriptive label. Use the corrected input family distribution without changing physical unit totals.
2. For each geometry root, take its **`assets[].dependencyClosure`**. The union is485 files after promoting the source-correct Hand32348 root. Use the exact case-insensitive-normalized paths recorded in `files[].resolvedDependencies`; copy original DAT bytes with headers intact. There is no need to ship the whole private cache.
3. Preserve the root origin and source subpart transforms. Apply the caster/small-wheel exact composition transforms only as documented; other robot placement is connection-/diagram-derived work, not an asserted official assembly matrix.
4. Attribute all selected closure files using actual authors/licenses and preserve histories. A conversion must name its modification. Do not label proprietary manual renders or `LDConfig.ldr` as DAT-licensed assets.
5. The JSON **`delta`** is the additional-file manifest:197 added DAT paths;61 bundle URLs, hashes, member lists and byte sizes;366 preserved baseline hashes; private inspection-image hashes; retained-but-unselected research candidates. `files[]` contains full provenance for all563 cached DATs. ADB input identifications/family distributions were corrected from primary-source images; source manual hashes, step numbers and physical totals remain unchanged. No application code was edited.

All selected roots, their actual authors and declared licenses:

| Geometry root | Root author(s) | Observed root license | Provenance reuse |
|---|---|---|---|
| [`11214.dat`](https://library.ldraw.org/library/official/parts/11214.dat) | Philippe Hurbain [Philo] | CC BY4.0 | additional root |
| [`11954.dat`](https://library.ldraw.org/library/official/parts/11954.dat) | Philippe Hurbain [Philo] | CC BY4.0 | additional root |
| [`14720.dat`](https://library.ldraw.org/library/official/parts/14720.dat) | Philippe Hurbain [Philo] | CC BY4.0 | additional root |
| [`15462.dat`](https://library.ldraw.org/library/official/parts/15462.dat) | Max Martin Richter [MMR1988] | CC BY4.0 | additional root |
| [`15535.dat`](https://library.ldraw.org/library/official/parts/15535.dat) | Max Martin Richter [MMR1988] | CC BY4.0 | additional root |
| [`18651.dat`](https://library.ldraw.org/library/official/parts/18651.dat) | Owen Burgoyne [C3POwen] | CC BY4.0 | additional root |
| [`18654.dat`](https://library.ldraw.org/library/official/parts/18654.dat) | Owen Burgoyne [C3POwen] | CC BY4.0 | additional root |
| [`24309.dat`](https://library.ldraw.org/library/official/parts/24309.dat) | Owen Burgoyne [C3POwen] | CC BY4.0 | additional root |
| [`2739a.dat`](https://library.ldraw.org/library/official/parts/2739a.dat) | James Jessiman | CC BY4.0 | additional root |
| [`2780.dat`](https://library.ldraw.org/library/official/parts/2780.dat) | Guy Vivan [guyvivan] | mixed CC BY2.0 +4.0 | earlier root |
| [`32009.dat`](https://library.ldraw.org/library/official/parts/32009.dat) | Steve Bliss [sbliss] | CC BY4.0 | additional root |
| [`32034.dat`](https://library.ldraw.org/library/official/parts/32034.dat) | Lutz Uhlmann [El-Lutzo] | mixed CC BY2.0 +4.0 | additional root |
| [`32062.dat`](https://library.ldraw.org/library/official/parts/32062.dat) | Steve Bliss [sbliss] | CC BY4.0 | additional root |
| [`32073.dat`](https://library.ldraw.org/library/official/parts/32073.dat) | Magnus Forsberg [MagFors] | CC BY4.0 | additional root |
| [`32054.dat`](https://library.ldraw.org/library/official/parts/32054.dat) | Guy Vivan [guyvivan] | mixed CC BY2.0 +4.0 | corrected ADB root |
| [`32140.dat`](https://library.ldraw.org/library/official/parts/32140.dat) | Guy Vivan [guyvivan] | mixed CC BY2.0 +4.0 | additional root |
| [`32184.dat`](https://library.ldraw.org/library/official/parts/32184.dat) | Jeff Boen [onyx] | mixed CC BY2.0 +4.0 | additional root |
| [`32271.dat`](https://library.ldraw.org/library/official/parts/32271.dat) | Ishino Keiichiro | mixed CC BY2.0 +4.0 | additional root |
| [`32278.dat`](https://library.ldraw.org/library/official/parts/32278.dat) | Ishino Keiichiro | mixed CC BY2.0 +4.0 | additional root |
| [`32316.dat`](https://library.ldraw.org/library/official/parts/32316.dat) | Philippe Hurbain [Philo] | CC BY4.0 | additional root |
| [`32348.dat`](https://library.ldraw.org/library/official/parts/32348.dat) | Ishino Keiichiro | mixed CC BY2.0 +4.0 | retained candidate promoted to Hand root after source4×4 correction |
| [`32498.dat`](https://library.ldraw.org/library/official/parts/32498.dat) | Ross Crawford [rosco] | CC BY4.0 | additional root |
| [`32523.dat`](https://library.ldraw.org/library/official/parts/32523.dat) | Tim Gould [timgould] | CC BY4.0 | additional root |
| [`32524.dat`](https://library.ldraw.org/library/official/parts/32524.dat) | Philippe Hurbain [Philo] | CC BY4.0 | earlier root |
| [`32525.dat`](https://library.ldraw.org/library/official/parts/32525.dat) | Philippe Hurbain [Philo] | CC BY4.0 | additional root |
| [`32526.dat`](https://library.ldraw.org/library/official/parts/32526.dat) | Jonathan P. Brown | mixed CC BY2.0 +4.0 | additional root |
| [`3673.dat`](https://library.ldraw.org/library/official/parts/3673.dat) | James Jessiman | CC BY4.0 | additional root |
| [`3705.dat`](https://library.ldraw.org/library/official/parts/3705.dat) | James Jessiman | CC BY4.0 | additional root |
| [`3713.dat`](https://library.ldraw.org/library/official/parts/3713.dat) | James Jessiman | CC BY4.0 | additional root |
| [`37308.dat`](https://library.ldraw.org/library/official/parts/37308.dat) | Philippe Hurbain [Philo] | CC BY4.0 | earlier root |
| [`37316.dat`](https://library.ldraw.org/library/official/parts/37316.dat) | Philippe Hurbain [Philo] | CC BY4.0 | earlier root |
| [`3749.dat`](https://library.ldraw.org/library/official/parts/3749.dat) | James Jessiman | CC BY4.0 | additional root |
| [`39369.dat`](https://library.ldraw.org/library/official/parts/39369.dat) | Philippe Hurbain [Philo] | CC BY4.0 | earlier root |
| [`39370.dat`](https://library.ldraw.org/library/official/parts/39370.dat) | Philippe Hurbain [Philo] | CC BY4.0 | earlier dependency, now root |
| [`39789.dat`](https://library.ldraw.org/library/official/parts/39789.dat) | Philippe Hurbain [Philo] | CC BY4.0 | additional root |
| [`39790.dat`](https://library.ldraw.org/library/official/parts/39790.dat) | Philippe Hurbain [Philo] | CC BY4.0 | earlier root |
| [`39793.dat`](https://library.ldraw.org/library/official/parts/39793.dat) | Philippe Hurbain [Philo] | CC BY4.0 | earlier root |
| [`39794.dat`](https://library.ldraw.org/library/official/parts/39794.dat) | Philippe Hurbain [Philo] | CC BY4.0 | earlier root |
| [`4032a.dat`](https://library.ldraw.org/library/official/parts/4032a.dat) | James Jessiman | CC BY4.0 | additional root |
| [`40490.dat`](https://library.ldraw.org/library/official/parts/40490.dat) | Ross Crawford [rosco] | CC BY4.0 | earlier root |
| [`41239.dat`](https://library.ldraw.org/library/official/parts/41239.dat) | Guy Vivan [guyvivan] | mixed CC BY2.0 +4.0 | additional root |
| [`41749.dat`](https://library.ldraw.org/library/official/parts/41749.dat) | Brent Jackson [bjackson] | mixed CC BY2.0 +4.0 | additional root |
| [`41750.dat`](https://library.ldraw.org/library/official/parts/41750.dat) | Brent Jackson [bjackson] | mixed CC BY2.0 +4.0 | additional root |
| [`44294.dat`](https://library.ldraw.org/library/official/parts/44294.dat) | Magnus Forsberg [MagFors] | CC BY4.0 | additional root |
| [`44375b.dat`](https://library.ldraw.org/library/official/parts/44375b.dat) | Philippe Hurbain [Philo] | CC BY4.0 | additional root |
| [`4519.dat`](https://library.ldraw.org/library/official/parts/4519.dat) | James Jessiman | CC BY4.0 | additional root |
| [`45601c01.dat`](https://library.ldraw.org/library/official/parts/45601c01.dat) | Philippe Hurbain [Philo] | CC BY4.0 | earlier root |
| [`46372.dat`](https://library.ldraw.org/library/official/parts/46372.dat) | Philippe Hurbain [Philo] | CC BY4.0 | earlier root |
| [`48989.dat`](https://library.ldraw.org/library/official/parts/48989.dat) | Guy Vivan [guyvivan] | mixed CC BY2.0 +4.0 | earlier root |
| [`49283.dat`](https://library.ldraw.org/library/official/parts/49283.dat) | Philippe Hurbain [Philo] | CC BY4.0 | earlier root |
| [`49295p01.dat`](https://library.ldraw.org/library/official/parts/49295p01.dat) | Philippe Hurbain [Philo] | CC BY4.0 | earlier root |
| [`52629.dat`](https://library.ldraw.org/library/official/parts/52629.dat) | Philippe Hurbain [Philo] | CC BY4.0 | earlier dependency, now root |
| [`54675.dat`](https://library.ldraw.org/library/official/parts/54675.dat) | Philippe Hurbain [Philo] | CC BY4.0 | earlier root |
| [`54696p01.dat`](https://library.ldraw.org/library/official/parts/54696p01.dat) | Philippe Hurbain [Philo] | CC BY4.0 | earlier root |
| [`56903.dat`](https://library.ldraw.org/library/official/parts/56903.dat) | Philippe Hurbain [Philo] | CC BY4.0 | additional root |
| [`60483.dat`](https://library.ldraw.org/library/official/parts/60483.dat) | Philippe Hurbain [Philo] | CC BY4.0 | additional root |
| [`60484.dat`](https://library.ldraw.org/library/official/parts/60484.dat) | Philippe Hurbain [Philo] | CC BY4.0 | additional root |
| [`61254.dat`](https://library.ldraw.org/library/official/parts/61254.dat) | Philippe Hurbain [Philo] | CC BY4.0 | additional root |
| [`62462.dat`](https://library.ldraw.org/library/official/parts/62462.dat) | Philippe Hurbain [Philo] | CC BY4.0 | additional root |
| [`63869.dat`](https://library.ldraw.org/library/official/parts/63869.dat) | Santeri Piippo [arezey] | CC BY4.0 | additional root |
| [`64179.dat`](https://library.ldraw.org/library/official/parts/64179.dat) | Santeri Piippo [arezey] | CC BY4.0 | additional root |
| [`6536.dat`](https://library.ldraw.org/library/official/parts/6536.dat) | James Jessiman | CC BY4.0 | additional root |
| [`6558.dat`](https://library.ldraw.org/library/official/parts/6558.dat) | James Jessiman | CC BY4.0 | additional root |
| [`6628.dat`](https://library.ldraw.org/library/official/parts/6628.dat) | William Howard [WilliamH] | mixed CC BY2.0 +4.0 | additional root |

## Explicit remaining gaps

- **historical-mold-certification — unresolved certification, not missing geometry:** Manuals do not print geometry IDs. Visual source-shape matches select genuine CAD without claiming verified LEGO design/element IDs. Most important alternatives are2780/61332,48989/65489,2739a/32005 and unseen round-plate/dish underside molds.
- **build-cable-routing — unresolved source-specific geometry:** Selected electronics roots model actual housings; full routed captive cable path, bends, plug placement and slack are not supplied as official build transforms. Coiled library shortcuts are not the pictured route. Do not replace cable runs with guessed cylinders or claim them sourced. No missing cable length/dimension is invented.
- **assembly-placement — outside this asset-crosswalk evidence:** Native DAT frames and connection primitive references are supplied; manual views establish assemblies, not metrology. Robot/world matrices, motor-zero calibration, insertion depths, collisions and motion limits still need connection-derived or explicitly diagram-derived placement. A source primitive surface anchor is not automatically a complete mate constraint.
- **handed-panel-world-side — source-shape selected; camera-left naming not certified:** 41750 is LDraw Left and41749 is LDraw Right. The local descriptive keys did not define a robot/world handedness; assemble the mirrored pair from page15 and retain native frames rather than mirroring one mesh ad hoc.
- **LDConfig-license — individual declaration absent:** Existing LDConfig.ldr remains private and has no!LICENSE header. All563 DATs are individually license-inspected here; use a narrowly authored needed-color mapping or separately clear configuration redistribution.

No visual family is left without a genuine source-shape root. That does **not** remove the listed historical-mold, cable-route, placement or world-handedness limitations. No missing dimensions, kinematic limits, cable routes or catalog IDs were invented. VEX is excluded: [the recovered CAD research](vex-cad-recovery.md) still does not establish app conversion/use rights, so no VEX mesh was generated.

## Inspection versus verification

Performed source retrieval, manual/overview image inspection, per-file metadata/license/hash inspection, narrow ZIP dependency inspection and native-coordinate extraction. **No application build, test, lint, formatter, mesh conversion or loader smoke was run.** Parent verification should load/convert the selected closures and inspect source origin retention, handed shells, the wheel’s fixed tyre material, split caster composition and corrected connector families.

[overview]: https://assets.education.lego.com/v3/assets/blt293eea581807678a/blt28cad37f1f002fd3/5f8801b982eaa522ca601c89/le_spike_prime_element_overview.pdf
[expansion]: https://assets.education.lego.com/v3/assets/blt293eea581807678a/blt3e340817c93629a0/66016a8d9497241adef62cf9/le_spike_prime_expansion_element_overview_45681.pdf?locale=en-us
[ADB1]: https://assets.education.lego.com/v3/assets/blt293eea581807678a/blt2d17fa746ea991e5/5ec8e83df11f7e3ed6d502d7/advanced-driving-base-bi-pdf-book1of5.pdf?locale=en-us
[ADB2]: https://assets.education.lego.com/v3/assets/blt293eea581807678a/bltaab3ff32deffc66d/5ec8e800f32b1a633f9052dd/advanced-driving-base-bi-pdf-book2of5.pdf?locale=en-us
[ADB3]: https://assets.education.lego.com/v3/assets/blt293eea581807678a/blt43751cee8daa89a7/5ec8e7f4f32b1a633f9052d7/advanced-driving-base-bi-pdf-book3of5.pdf?locale=en-us
[ADB4]: https://assets.education.lego.com/v3/assets/blt293eea581807678a/bltbaec24f63e4075fc/5ec8e806f555a00375660930/advanced-driving-base-bi-pdf-book4of5.pdf?locale=en-us
[ADB5]: https://assets.education.lego.com/v3/assets/blt293eea581807678a/bltdfc58a87376f5440/5ec8e868afa52a7b5193fda0/advanced-driving-base-bi-pdf-book5of5.pdf?locale=en-us
[robot2019]: https://assets.education.lego.com/v3/assets/blt293eea581807678a/bltebfffd33fc0a5e72/5f8802a1bc43790f5c4389f2/automate-it-bi-pdf-book1of3.pdf?locale=en-us
[base2019]: https://assets.education.lego.com/v3/assets/blt293eea581807678a/blte262c4974fee83b0/5f8802a3ed5ccb12e4342dac/automate-it-bi-pdf-book2of3.pdf?locale=en-us
[packages2019]: https://assets.education.lego.com/v3/assets/blt293eea581807678a/blt2cb1e769ec72a3d7/5f88022d6c54ba0f72c2081a/automate-it-bi-pdf-book3of3.pdf?locale=en-us
[hand]: https://assets.education.lego.com/v3/assets/blt293eea581807678a/bltd34f6e501eb5ff30/5f8802b8bf5ab07ee90076df/pass-the-brick-bi-pdf-book1of1.pdf?locale=en-us
[idea-detector]: https://assets.education.lego.com/v3/assets/blt293eea581807678a/blta28e7be5ac30e472/5f8802cda302dc0d859a7343/place-your-order-bi-pdf-book1of2.pdf?locale=en-us
[robot-head]: https://assets.education.lego.com/v3/assets/blt293eea581807678a/blt7f40beca9b715331/5f8802ef18cd5f0f67ac48f8/place-your-order-bi-pdf-book2of2.pdf?locale=en-us
