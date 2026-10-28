# Advanced Driving Base: resolving the four lower rear joins

## Finding

The 16 mm-per-side error was **receiver ownership and gray-bracket orientation**, not an axle length, rail-hole index, or a tolerance problem. Book 4's four black housing pins enter the **four white 32184 central bores**. The two gray **63869 triple-pin rows face outward** and remain available for Book 5's four blue drive-module pins. The previous reconstruction assigned those motor pins to the gray rows, pointing the rows inward, and incorrectly treated the white bores as free.

The correction preserves all 234 prepared units, 136 instructions, native mesh origins, shaft/cap/rail positions, motor roots, hub pose, wiring and original first-seven datum. It adds the four actual Book 5 rigid connections and the four source13 first-bearing connections through the side 6536 blocks. It does not stretch or replace any geometry.

## New primary evidence, provenance and license

The [official LEGO lesson](https://education.lego.com/en-us/lessons/prime-competition-ready/assembling-an-advanced-driving-base/) embeds a **physical build film**, distinct from the previously inspected app instruction-still films:

- Title: `Competition-Ready-Assemble your Advanced Driving Base.mp4`.
- [Official player](https://legoeducation.23video.com/v.ihtml/player.html?token=dff7c3c7d9875510d0537f36807867e3&photo_id=51454837).
- [Public source metadata](https://legoeducation.23video.com/api/photo/list?photo_id=51454837&token=dff7c3c7d9875510d0537f36807867e3&format=json): photo `51454837`, creation `2019-05-01 11:24:29`, duration44.8s, original1920×1080. Downloaded1080p rendition: **8,441,901 bytes**.
- [Exact acquired film](https://legoeducation.23video.com/49543313/51454837/dff7c3c7d9875510d0537f36807867e3/video_1080p/competition-ready-assemble-your-28-video.mp4), SHA-256 `d011d8e6bd818578eebc9c8fe423d44062674c7c137d1ea4a3e38c50362fb534`.
- **00:10–00:12:** actual separate modules, not a PDF render.
- **00:14–00:17:** hands seat the rear module on the assembled drive modules.
- **00:18:** close underside view exposes the white caps and outward gray rows, with the two side frames immediately outboard of them. This identifies which side of each vertical yellow axle the gray row occupies. Together with Book4 p19's motor-pin arrows it distinguishes the motor-occupied white bores from the free gray row ends.
- Private acquired film: `.research-cache/advanced-driving-base/official-lesson-assembly.mp4`. Exact00:18 extracted frame: `lesson-under-18.png`, SHA-256 `9c4e5ec5b4a7dc9bb992a7644f7aada5fda8e5e91e5dcbd6c04508572c696e7d`.

The video metadata supplies no open-content license (`license_id` empty). Treat it as LEGO copyrighted reference, **not redistributable application artwork**. Film and derived frame stay in `.research-cache/`, never `static/`. No photograph was used as a calibrated dimensional ruler; it selects topology and handedness, while dimensions below come from native CAD.

Companion official diagrams:

- [Book4 p16–19](https://assets.education.lego.com/v3/assets/blt293eea581807678a/bltbaec24f63e4075fc/5ec8e806f555a00375660930/advanced-driving-base-bi-pdf-book4of5.pdf?locale=en-us#page=19): white two-axle preparations, gray63869/azure60483 layer, closing caps and motor-pin insertion.
- [Book4 p20–22](https://assets.education.lego.com/v3/assets/blt293eea581807678a/bltbaec24f63e4075fc/5ec8e806f555a00375660930/advanced-driving-base-bi-pdf-book4of5.pdf?locale=en-us#page=20): rail pins at holes4/10 enter60483 round bores. This internal48mm span remains unchanged.
- [Book5 p12](https://assets.education.lego.com/v3/assets/blt293eea581807678a/bltdfc58a87376f5440/5ec8e868afa52a7b5193fda0/advanced-driving-base-bi-pdf-book5of5.pdf?locale=en-us#page=12): four side pins and two top axles merge simultaneously. The lower contacts are partly occluded; the new physical underside view resolves their ownership.
- [Book2 p3/p13](https://assets.education.lego.com/v3/assets/blt293eea581807678a/bltaab3ff32deffc66d/5ec8e800f32b1a633f9052dd/advanced-driving-base-bi-pdf-book2of5.pdf?locale=en-us#page=13) and mirrored [Book3](https://assets.education.lego.com/v3/assets/blt293eea581807678a/blt43751cee8daa89a7/5ec8e7f4f32b1a633f9052d7/advanced-driving-base-bi-pdf-book3of5.pdf?locale=en-us): a blue3L pin has one bearing in the64179 frame, a first projecting bearing in6536, and its second projecting bearing available for the rear63869.

Bounded independent-source search also examined [FIRST Indiana's build-training slides](https://playbook.firstindianarobotics.org/pluginfile.php/882/mod_folder/content/0/Robot%20Build%20Self%20Guided%20Training%20Slides%20%28Printable%29.pdf?forcedownload=1), which direct builders to the same modular app instructions and provide no native assembly CAD. Searches for this exact build with `.io`, `.ldr`, `.mpd`, Studio and LDraw did not locate an inspectable, source-matched full assembly. This is not a claim that none exists. The [I LEGO U tutorial](https://www.youtube.com/watch?v=m_07wfVDYZw) was identified in search, but its visuals were not inspected here and contribute no geometric evidence. No third-party model or license assumption enters the correction.

## Native features and equations

Use unchanged `N = Rx(pi) ×0.4 mm/LDU`. For a native feature `v` of part `p`, the independent witness computes `F_p(v) = finalTransform_p · N(v)` and transforms a second point to obtain the native axis. It never reads authored `connectionPoints` to establish geometry.

Native roots and licenses:

| Native source | Mechanical feature | License / author |
|---|---|---|
| [63869.dat:15–16](https://library.ldraw.org/library/official/parts/63869.dat) | origin axle axisX; triple round-hole centers `(u,20,0)`, `u=-20,0,20`, axisZ, facesZ±10 | CC BY4.0, Philippe Hurbain |
| [32184.dat:17–18,37–38](https://library.ldraw.org/library/official/parts/32184.dat) | end axle bores `(0,±20,0)` axisX; central round bore origin axisZ, facesZ±10 | CC BY2.0 and4.0, Jeff Boen |
| [6536.dat:19,34–35](https://library.ldraw.org/library/official/parts/6536.dat) | axle at origin axisX; pin bore `(0,20,0)` axisZ, facesZ±10 | CC BY4.0, James Jessiman; listed subsequent contributors |
| [6558.dat:15–17](https://library.ldraw.org/library/official/parts/6558.dat) | shaft axisX, collar atX−10, short/long extentsX−30…+30; projecting bearing centersX0/+20 | CC BY4.0, James Jessiman |
| [39790.dat](https://library.ldraw.org/library/official/parts/39790.dat), [64179.dat](https://library.ldraw.org/library/official/parts/64179.dat) | real frame-hole grids, not fitted markers | CC BY4.0, Philippe Hurbain / Santeri Piippo |

Acquired native hashes:63869 `948e6802d89ba087bc7c1357271b852eba35c55e8a91e926602b0a680e5b82fc`;6536 `a6d8a8a512ebf4b109a98e6cbbbc1868cec2058c771c3e7b27c7813d5676a743`;6558 `28d5dfb1009599f84edfae076be13eb648bbfae32cdba57b12b7d7829465057c`. Existing licensed real meshes are retained.

### Corrected rear native graph

All coordinates here are motor-native LDU, before `N` and the final rear pose.

- White centers remain `(-40,±20,-20)` and `(-40,±20,140)`. Their localZ+10 faces are `(-30,±20,-20/140)`, exactly the source6 black-pin collars at the real motor side faces. Their central bores are therefore **occupied**.
- Gray axle centers remain `(-40,0,-40)` and `(-40,0,160)`. Their localX→moduleY mapping is unchanged, retaining both vertical shaft seats.
- First gray orientation is now localX→moduleY, localY→−moduleZ, localZ→−moduleX; second is localX→moduleY, localY→+moduleZ, localZ→+moduleX. This is a proper180° rotation about each existing vertical axle, not moving a part or its origin.
- Thus the gray row ends become `(-40,±20,-60)` and `(-40,±20,180)`: **240LDU =96mm span**. The white centers still span160LDU=64mm, but are not Book5 receivers.
- Yellow shaft positions,60483 axle and round-bore positions,13L rails and hole4/10 pin centers are unchanged. The old outward-*cap* hypothesis is unnecessary: it changed a real rail span, whereas the corrected gray rotation changes only the free row's side of its axle.

### Upstream width and final join

The existing nominal Front/side registration is measured from actual features: Front39790 native receivers `(-100/100,-10,60/20)` map to scene `(-8/72,4,48/64)`. Source side housing collars at motor-native `(sign×50,20,80/120)` give actual motor roots `(-16,24,96)` and `(80,24,96)` under their existing opposite upright rotations.64179's actual transverse rail bores and source3 blue-pin localX+20 bearings consequently give the four positions below. No Front datum, upstream motor row, frame yaw, or blue-pin hole index was changed to obtain them.

The rear pose is derived from **one actual bearing pair plus the source-constrained yaw**, not a midpoint fit. The other three pairs are independent constraints:

| Side / native row end | Drive pin localX+20 | Corrected63869 center | Residual |
|---|---|---|---|
| left upper / `(-20,20,0)` | `(-16,24,160)` | `(-16,24,160)` |3.972054645195637e−15mm |
| left lower / `(20,20,0)` | `(-16,8,160)` | `(-16,8,160)` |8.881784197001252e−16mm |
| right upper / `(-20,20,0)` | `(80,24,160)` | `(80,24,160)` |3.552713678800501e−15mm |
| right lower / `(20,20,0)` | `(80,8,160)` | `(80,8,160)` |0mm |

Each pin axis and receiver's actual nativeZ bore axis have `abs(dot)=1`. The selected rectangle has96mm width and16mm vertical pitch, with no forced symmetry.

**Contacting faces:** each6536 first projecting bearing center is sceneZ152 and each63869 second bearing center isZ160.6536's actual local `(0,20,-10)` far face and63869's near face (first gray localZ−10, second gray localZ+10) coincide at **Z156**. The blue shaft's localX+10 section lies in this same plane.6536 occupiesZ148…156,63869 occupiesZ156…164; the second8mm of the projecting shaft engages the gray row. Thus center coincidence does not conceal an axial air gap. The surrounding source13 outside reinforcement now has explicit fixed edges at these first-bearing centers.

### Predictions and exercised numerical result

This explanation predicts all of the following together: motor black pins register with white caps; gray rows register with all four side pins; the6536/63869 faces contact; yellow shafts remain vertical; both60483 axle seats and both rail layers remain registered. Rotating only a gray row the old way reintroduces16mm lateral error; changing white-cap signs is not required.

The private actual-model diagnostic was exercised with:

```sh
node --experimental-strip-types .research-cache/advanced-driving-base/join-witness.ts
```

It evaluated34 independent native-coordinate pairs: four final bearings, four first projecting bearings, four real face contacts, four motor/white seats, eight cap/shaft seats, two63869 axle seats, two60483 axle seats, two60483 round-bore seats and four rail seats. Result: **max position residual9.769962616701378e−15mm; max `1−abs(axis dot)`0;234 parts;136 steps**. An initial diagnostic used the opposite63869 face sign and correctly reported8mm axial error; selecting the source-facing native entry plane, without changing modeled poses, corrected that diagnostic equation. The original pre-correction diagnostic measured16mm at all four presumed white receivers.

## Implementation and limits

Owned changes:

- `src/lib/models/advanced-driving-base/rear.ts`: reverse the two63869 rotations, replace four false motor/gray edges with motor/white edges, expose free gray-row ends as the side receivers. Existing prepared and merged operation targets inherit the corrected part rotations.
- `src/lib/models/advanced-driving-base/drivetrain.ts`: source13 fixed first-bearing edges between the existing6536 units and blue pins; no poses, hardware or joint motion changes.
- `src/lib/models/advanced-driving-base.ts`: derive rear pose from an actual single pair; add four rigid source9 edges; replace obsolete misalignment warning and assembly text with the corrected instructions. Upper retention, hub and electrical paths remain live and unchanged.
- `tests/unit/advanced-driving-base-source.test.ts`: correct motor receiver ownership; add regression using actual final poses, native bores, native axes and contacting faces, independently of declared markers. It also requires four source9 edges and rejects white-side-pin edges. A second regression samples actual consumer replay at Book4 source6 (pin→motor, both future receiver families still uninstalled), source19 (pin→white cap), and Book5 source9 (side pin→gray row). Black pins are introduced at6, white caps at16/18, gray blocks at17, and their motor-side merge occurs at19; source6 must never be misrepresented as a seat into either future receiver.

No build, suite, linter, formatter, browser or generated-manifest gate was run by this worker. Parent integration owns those gates and refreshing application captures. The numerical result is nominal source/CAD mechanical consistency for the affected interface and retained internal stack, **not** a full collision audit, mold-tolerance measurement, independent validation of every Front source pose, cable-length guarantee, or physical performance certification. Those limitations do not block these now-established nominal four-point joins. Earlier validation notes describing a free-white64/96mm mismatch are superseded by this receiver-ownership finding.
