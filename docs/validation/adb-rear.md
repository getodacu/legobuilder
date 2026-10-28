# Advanced Driving Base — Rear Part authoring evidence

## Scope and status

`src/lib/models/advanced-driving-base/rear.ts` exports Book4's31 steps and68 prepared units. Source17's two gray brackets and two azure short beams were misidentified; the corrected native stack below replaces that false topology. A source-native numerical diagnostic was exercised, but no test suite, build, typecheck, formatter or browser gate ran in this correction. This is not full mechanical acceptance.

Source: [official Rear Part PDF](https://assets.education.lego.com/v3/assets/blt293eea581807678a/bltbaec24f63e4075fc/5ec8e806f555a00375660930/advanced-driving-base-bi-pdf-book4of5.pdf?locale=en-us), SHA-256 `6d8c32bc457e17a2f816da54a422f9cf4f0cde55235a5d3d610816d846342b89`. Page equals instruction,1–31. Reinspection covered p6's housing-pin row, p16–19's bracket construction, p20–22's rail seats, p27–31's upper stack and [Book5 p12–13](https://assets.education.lego.com/v3/assets/blt293eea581807678a/bltdfc58a87376f5440/5ec8e868afa52a7b5193fda0/advanced-driving-base-bi-pdf-book5of5.pdf?locale=en-us#page=12). Private images remain under `.research-cache/advanced-driving-base/`; none are public assets.

The earlier task text mistakenly assigned hub and caster scope to Rear; parent explicitly corrected that assignment. Book4 has **no hub and no caster**. Book1 owns each separate39370 cup and52629 ball (native ball offset `[0,46,0]` LDU); Book5 owns the one prepared hub including its source battery preparation. Rear never adds a duplicate ball, extra battery unit, arbitrary hub box, tyre, cable part, or optional tool accessory.

## Inventory and source correction

| Source family | Prepared units | Introduction pages |
|---|---:|---|
| Gray48989 integral-pin cross block | 2 | 1 |
| Black40490 nine-hole beam | 4 | 1,2,13 |
| Black2780 friction pin | 20 | 3,4,6,7,23,25 |
| Medium54696p01 motor | 1 | 5 |
| Magenta39793 block | 1 | 7 |
| Gray14720 H-frame | 2 | 8,10 |
| Gray63869 axle/triple-pin cross block | 2 | 17 |
| Blue6558 long pin | 7 | 11,14,20 |
| Gray32054 coaxial stop-bush pin | 4 | 11 |
| Medium azure49283 cable clip | 1 | 14 |
| Medium azure60483 two-hole axle/pin liftarm | 2 | 17 |
| White32184 axle/pin/axle cross block | 4 | 16,18 |
| Yellow4519 axle3 | 4 | 16 |
| Medium azure41239 beam13 | 2 | 20,22 |
| Yellow62462 pin joiner | 2 | 23 |
| Gray46372 gear28 | 1 | 25 |
| Magenta39794 frame7×11 | 1 | 27 |
| Red11214 long axle/pin | 2 | 27 |
| Gray18651 axle2/pin1 | 4 | 28,30 |
| Medium azure32524 beam7 | 2 | 30 |
| **Total prepared callout units** | **68** | |

**Page18 transcription correction:** the actual source image depicts two more white32184 cross blocks, including visible yellow axle cross ends through both upper end holes. It does not depict gray55615 bent four-pin connectors. Page16 introduces the lower pair; page18 closes the mounts with the upper pair. Stable IDs are `rear-white-lower-1`, `rear-white-lower-2` (page16), `rear-white-upper-1`, `rear-white-upper-2` (page18). Private decisive source view: `.research-cache/advanced-driving-base/rear-detail-18.png`; companion page16 is `rear-detail-16.png`. This changes contextual family allocation, not the68-unit count. Parent owns reconciliation of earlier research JSON/crosswalk transcriptions and regression expectations.

**Page11 geometry correction:** source shape and coaxial blue-pin insertion require [32054 Technic Pin Long with Stop Bush](https://library.ldraw.org/library/official/parts/32054.dat), not the earlier87082 crosswalk. The real32054 native root has a coaxial `bush0` centeredX-20 and a two-module pin shaft extendingX-10..30. Source p11 shows that stop-bush head and long shaft; p12/p13 show coaxial installed units. The wrong87082 has a transverse bore/opposed pins and cannot provide this relationship. Parent owns licensed asset acquisition and research crosswalk correction; no invented replacement mesh is used.

**Page28 axle correction:** the high-resolution source `.research-cache/advanced-driving-base/rear-detail-28.png` depicts two gray18651 axle2/pin1 connectors, identical to page30's callout, not two black2780 pins. The short pin enters the top39794 frame; the two-module axle passes the top upright hole and remains exposed for Book5's hub join. IDs `rear-top-upright-pin-1/2` retain stable identity but use18651. Thus Book4 has20 black2780 and four gray18651;68 total is unchanged. Parent's geometry-evidence owner independently confirmed all three source corrections and updated research records.

**Page17 root correction:** the gray callout is **63869**, with one triple round-hole row and one perpendicular axle bore; it is not14720. The azure callout is **60483**, with distinct axle/round bores; it is not49283. Source p21 visibly places each blue rail pin into60483's free **round** bore, not into a white32184 center bore. Four source17 instance IDs are preserved (`rear-mount-frame-1/2`, `rear-mount-clip-1/2`) while their geometry/family/name changes. The real p14 cable clip stays49283. Rear H-frames4→2, gray cross blocks0→2, cable clips3→1, short liftarms0→2;68/234 units and31/136 steps remain unchanged.


## Independent native feature derivations

All coordinates in this section are original native LDraw LDU. Native geometry receives `N = Rx(pi) ×0.4` once. Part placements use `N*T*N^-1`; retained mesh origins are never centered or rescaled. Rotations are proper quaternions, not reflected CAD matrices.

- **40490:** original DAT lines21–38 specify nine through-hole centers at `(0,0,z)`, `z=-80,-60,…,80`, nativeY through-axis, facesY±10. Lower rails use native placements `(-20,40,60)` and `(20,40,60)` with Rz(-90°), placing the through-axes along module nativeX.
- **48989:** root lines14–21 place integral pin bases at `(0,±20,±10)` along nativeZ. Subpart `s/48989s01.dat` lines12–14 has end through-holes along nativeX and the orthogonal center bore. Native bridge centers `(0,40,0)` and `(0,40,120)` with the recorded proper rotation place opposed integral pins onto rail holes at global nativeZ `-20,20,100,140`. The two bridges remain two prepared units, not separately counted molded pins.
- **2780:** root lines13–14 place both `confric5` halves along nativeX. Pin origin is the central collar; the two halves reach±20 LDU. Face-recess/collar seating is different from putting the pin mesh center at the beam center. Final pin seating travel20 LDU is8mm where that one-half insertion actually applies.
- **32054/6558 coaxial seats:** unchanged gray origin `(60,y,z)` gives stop-bush facesX30/50 and shaftX50..90; blue origin `(20,y,z)` with Ry(pi) seats its short half in the bush and long half in the motor. Black rails occupyX50..70. Corrected uprights occupyX70..90 at **both** motor rowsY−20/+20 (their fourth/sixth holes), not just the upper row.
- **54696p01:** root lines17–18 reference the real fixed `u9364c01` body and the real `u9363p01` drive hub at native `(0,-50,0)`. This is canonical scene `(0,20,0)` before any module transform. Body hierarchy `u9364c01.dat` lines16–21 locates white upper/lower shells, azure rear shell, and the captive cable stub at nativeZ143. The output joint binds **`parts/u9363p01.dat`**, movingSide `rotor`; the body does not spin.
- **Motor mounting features:** `u9364c01` translates `u9364` byY-20 and `u9365` byY+20; their mirrored subparts contain side bores at X±30, Y±20, Z±20. Rear shell `u9366` is translatedZ140 and contains the rear side and underside bores. The front underside seat at `(0,30,-20)` and rear underside at `(0,30,140)` are the lower bridge upward-pin targets. These independently derived seat features need parent contact comparison, rather than assuming the body bounds are holes.
- **39793:** original root lines14–26 contains center/outer holes and orthogonal edge holes at20-LDU spacing. The bracket is a genuine nine-perpendicular-hole part, not a box. Four separate black pins connect its side bores to the H-frame upper row.
- **14720:** original root lines14–18 defines three-hole crossbars at nativeZ±40 plus central longitudinal bores atZ-20,0,20. Crucially, the central bores use nativeX while crossbar bores use nativeY: they are not all parallel. Rear bracket-frame transforms cycle localX→moduleZ, localY→moduleX, localZ→moduleY. Thus crossbar holes atZ±40 become the upper/lower rows, with two source pins through each row.
- **63869 source17:** [root lines15–16](https://library.ldraw.org/library/official/parts/63869.dat) define round-hole row `(−20/0/20,20,0)`, nativeZ axis, and the perpendicular origin axle bore, nativeX axis. Front bracket center `(-40,0,-40)` uses localX→moduleY, localY→moduleZ, localZ→moduleX. Rear center `(-40,0,160)` uses localX→moduleY, localY→−moduleZ, localZ→−moduleX. Row **end holes** receive the four source6 housing pins at module `(-30,±20,-20/140)`. Each middle row hole remains free; no H-frame holes are manufactured.
- **32184 caps and4519 shafts:** [32184 lines17–18/37–38](https://library.ldraw.org/library/official/parts/32184.dat) distinguish its two nativeX axle bores `(0,±20,0)` from its nativeZ central pin bore. Both lower caps are centered module `(-40,20,-20/140)`, upper caps `(-40,-20,-20/140)`, orientation localX→moduleY, localY→moduleZ, localZ→moduleX. Four yellow shafts remain vertical atX−40, centerY0, Z−40/0/120/160; endsY±30. Each source3L shaft crosses lower-capY10..30, middle63869-or60483Y−10..10, upper-capY−30..−10. No source19 horizontal preparation rotation remains.
- **60483 source17/21:** [s/60483s01.dat lines16/20](https://library.ldraw.org/library/official/parts/s/60483s01.dat) place the nativeY axle bore atZ0 and a separate nativeY **round** bore atZ20. Liftarm axle centers are module `(-40,0,0/120)` with Ry(−90°); their round bores are `(-60,0,0/120)`. The corresponding yellow shafts use the axle bores. The rail blue pins use only the free round bores. A49283 cable clip has no such second bore.
- **41239 rail seats:** lower/upper rails are module `(-60,20,60)` / `(-60,-20,60)`, nativeY through axes. Source20 pins use holes4/10 (relativeZ±60), origins `(-60,0,0/120)` with Rz(−90°). CollarY10 meets the lower rail face; short half occupiesY10..30, long half crosses60483Y−10..10 and upper railY−30..−10. White cap centers remain **unoccupied by those rail pins**.
- **Stack height:** two tubes are `(-60,-50,-40/160)`, pin-end planesY−30/−70. Their lower pins register with upper rail holes2/12, upper pins with39794 corners. Thus top-frame center is `(0,-80,60)`, **40LDU lower** than the old false63869/60483 substitution'sY−120 stack; this is derived from actual seats, not a hub-height tweak.
- **4519:** native axle long axisX, nominal three-module length60 LDU. Its prepared lower-block seat spans20 LDU=8mm; this is derived from that individual through-axle bore, not a generic axle travel. The distinct blue6558 long-half motor insertion remains40 LDU=16mm.
- **62462:** original root lines14–20 and33–39 establish a nativeX-axis tubular pin joiner with endsX±20. Its source upper/lower2780 pin seats are at those real end planes, not inferred bounding-box centers. Two standoffs each count as one tube and two separately tracked pins.
- **46372:** root lines51–55 has four pin holes on nativeZ axes at radial `(0,±20)` and `(±20,0)` in its nativeXY plane. Its center axle bore is nativeZ. The authored gear rotation Rx(+90°) turns that plane horizontal; two opposite radial pin bores match two real motor-hub bores. Gear native center `(0,-60,0)` puts its lower seat at motor nativeY-50. The gear and its two pins belong to moving subassembly `rear-output`; no invented output shaft is introduced. The four yellow axles are structural mounting shafts, not driven tool outputs.
- **39794:** original root lines14–45 constructs the real7×11 opening, nativeX sides±60, nativeZ ends±100 and nativeY thickness20. Side through-hole surfaces areX±70. Corrected center `(0,-80,60)` follows the actual60483/rail/tube/pin stack.
- **32524 /18651:** uprights centered `(80,-20,-20/140)` retain the original proper orientation. Their seven centers span moduleY−80..40. Upper18651 origins are `(80,-80,-20/140)`, bottom origins `(100,40,-20/140)`; shafts remain perpendicular to beam length. Both gray32054 rowsY−20/+20 now enter genuine holes4/6. The top frame, upper shafts, standoffs, uprights and their assembly-operation targets move with the corrected native stack.
- **49283:** only the genuine source14 cable clip remains in Rear. The p17 azure units have separate60483 geometry and provenance; no cable shape masquerades as a two-hole beam.

## Timeline, reuse and accounting

All68 instances are visible in staged inventory at time zero. Staging, camera positions, durations and work-area clearances are explicitly app-authored presentation. Each new unit receives one installation milestone on its source introduction page. Introduction into a prepared local unit does not recount that unit when transferred into the larger rear module.

Reused groups move on pages9,12,15,19,21,24,26,29,31 with actual prepared IDs and snapshots. Source16–19 brackets retain vertical shafts throughout preparation and transfer; the earlier artificial90° whole-bracket preparation rotation was removed. Page10/31 rotation icons change camera side, not the robot. Integration transforms the same corrected descendants and derives the hub pose from live upper-axle sites; it does not duplicate units.

## Book5 interface contract

`attachmentSites` exposes real part-local bore frames, not module/world coordinates disguised as local data:

- `side-receiver-{1,2}-{upper,lower}` now exposes actual free **white32184 central pin-bore centers** at local `(0,0,0)`, nativeZ axis, facesZ±10. They compare to drive-pin second-bearing centers, not a mismatched surface datum. Their source-selected Book5 correspondence is still unchecked. The previous32524 candidate and falsely identified source17 H-frame receiver sites were removed.
- `upper-frame-bore-1/2`: `rear-top-frame`, geometry39794, actual outer side face native `(-70,0,-40)` /`(-70,0,40)`, nativeX bore axis. Frame part-local orientation is supplied so its connection-frame+Y follows that bore axis.
- `rear-motor` retains `rear-captive-lead`, native `(0,0,143)`, for the integrator's continuous captive cable route to the Book5 hub. Book5 instruction4/PDF7 and the final port map assign rear motor **C**. Fragment motor ID is `rear-output-motor`; output joint `rear-output-joint`; moving group `rear-output`.
- `hub-axle-1/2` retains the real upper18651 exposed axle local `(10,0,0)`, nativeX axis, now module `(90,-80,-20/140)` after the corrected stack. Its Book5 whole-robot fit still requires independent source/clearance comparison.
- Old `azur-end-*`, `mount-end-*`, `mount-free-*` and `mount-spine-*` search-only interfaces were deleted. They were not Book5 native mates; some referenced the source17 parts that are not H-frames.

Hub upper seats, the separate Book5 top frame, stop axles and underside5×7 frames are not invented Rear inventory. The integration owner supplies those parts and their mating connections using the source-accurate sites on whichever module the source actually mounts them to.

## Unresolved fit and required parent checks

No global 'all31 verified' or 'all68 fit verified' claim is made. Identity/geometry source confidence is distinct from independent final placement verification.

1. Parent integrated the corrected source17 family distribution into generated assets/manifests and exercised the independent native-contact regression in `tests/unit/advanced-driving-base-source.test.ts`; current software/browser results are in the four-model coverage ledger.
2. Preserve the earlier p11/p18/p28 corrections and the new p17 correction;68/234 units,31/136 steps and the original first-seven datum do not change.
3. Independently compare all corrected source16–31 bracket, rail, frame and upright views and actual solid/gear clearances. Native-axis/face registration is not a collision audit or a historical-mold tolerance certification.
4. **Book5 four lower joins remain open.** Do not install four fixed edges, stretch parts, rotate bore axes by declaration, or promote fit coverage merely because the corrected internal graph now closes.

### Exercised nominal diagnostic and bounded external finding

The numerical diagnostic used actual final part poses, **independently transcribed native coordinates**, and transformed native directions—not authored connection markers. Across18 motor/cross-block, cap/shaft, short-liftarm/rail-pin and paired-rail pin seats, maximum position residual was **1.2630431306296742e−14mm**, maximum `1−abs(axis dot)` **0**. The added regression also covers both middle-layer axle seats; parent integration executed it successfully. No physical-clearance result is inferred.

After midpoint registration, actual drive-pin second-bearing centers are right`(80,24/8,160)`, left`(−16,24/8,160)`; actual white32184 bore centers are right`(64,24/8,160)`, left`(0,24/8,160)`. All four have **16mm lateral residual**, despite compatible axes and16mm vertical pitch. White-center row span64mm versus drive row96mm therefore still prevents a four-point rigid fit. This is now a finding on the **corrected source17 native bracket topology**, not the former H-frame/upright candidate search. No authorized source-matched complete assembly CAD was found in the bounded search. Further correction must resolve the source/global width relationship; ordinary educational motion does not require manufacturer certification, but incorrect nominal contacts cannot be approved.

The outward-cap sign hypothesis was also bounded rather than forced: moving each32184 center another20LDU **outward** from its63869 axle would put white centers atZ−60/180 (96mm span), but put the other yellow shafts/60483 axle bores atZ−80/200 (**112mm** span). Two20-LDU short liftarms cannot reduce that to the source20 blue-pin pair's **120LDU=48mm** spacing (holes4/10); even both maximal inward offsets leave96mm. The current inward cap sign instead simultaneously closes the motor/63869, two-cap/two-shaft,60483 and rail-hole4/10 graph. This rules out fixing only that sign to obtain convenient Book5 points; it is not proof that every global Front/drive pose is correct.


### Exact private evidence provenance

| Artifact | SHA-256 / decisive evidence |
|---|---|
| `rear-detail-17.png` | `523ca7d92b249e195834729ed4419b52884d5d38054b2e75a6772200cba1ce27`; gray triple-pin/axle block and azure two-hole callouts |
| `book4-page19-rootfix.png` | `20fa9706db78949bffbe7c26665ca82396d53fc5357c29fbc336b4af09d9ebea`; source19 bracket transfer with vertical yellow shafts |
| `book4-page21-rootfix.png` | `b54e71c565729e6417622abb1f38e0a763182a1bc44fe6084ed09d9eeff14108`; blue pins through free60483 round bores |
| `63869.dat` | `948e6802d89ba087bc7c1357271b852eba35c55e8a91e926602b0a680e5b82fc`; native row/axle, lines15–16 |
| `60483.dat` | `e9642b7d24f816f62a37ef798e2a7a21377febec2e857ce0ecc4eceb907ca47c`; existing licensed root, no acquisition/replacement mesh |
| `s/60483s01.dat` | `19502854a4f0a692bdf46cf90f901fbdf443aa96221fe8436965c6bd97d0b803`; distinct axle/round nativeY bores, lines16/20 |
| `32184.dat` | `b8b99136eec5188641ad689bed183ad787f5b3325329f7e22c61cf8271f947a4`; perpendicular nativeX axle/nativeZ pin systems |

## Official app alternatives and rejected width shortcuts

The live [official SPIKE app model](https://spike.legoeducation.com/prime/models/blte4788002edb15a78) loads its public [Competition Ready content record](https://spike.legoeducation.com/content/en-GB/blt4b49bd6ee0bde119.json), including38/31/24/24/19 instruction-view counts. Its source-provided Rear and Assembly films were retrieved for private inspection only:

- [Rear corrected instruction film](https://spike.legoeducation.com/content/49543312/52934736/cd41e2477660a88b16cedc18a90c5279/video_original/Rear_part_Packed_Corr._13112019_with_eop-unix.mp4),879686bytes, SHA-256 `4f54973069ee6b1ce0cea6b23d05e4987708241e0fed1087ff309a1e560155fd`.
- [Assembly instruction film](https://spike.legoeducation.com/content/49543319/52934767/48c628823e64384fcc9dfc6348e24162/video_original/Advanced_Driving_Base_Asseembly_Packed_20082019_with_eop-unix.mp4),714757bytes, SHA-256 `6fb46c74ff31e494327e825a77de81cacd12ecc23d000ea4ad793b8c47369f0c`.

Both contain1440×1080 source stills at10fps. Rear17/19/21 confirm63869/60483 and the free short-liftarm round-hole rail seats; Assembly9/10 retain the PDF's occluded lower receiver contacts. The filename's correction date is not evidence of an altered width or a new hardware revision.

Independent high-resolution Book2 pp1–3 and actual motor DAT structure reject three convenient width shortcuts: the housing's three pins select nativeY+20, not the visibly unused−20 row; the64179 opening lies in motorXZ with its long rail along motorX, rejecting Rx90; and genuine Z-axis nose bores are nativeY0, not−40. The latter follows upper-shell localY20 plus its−20Y body translation, with X-only mirroring. Moving the frame16mm inward would unseat real nose pins. No speculative transform, false fixed link or fit-coverage promotion was made.

