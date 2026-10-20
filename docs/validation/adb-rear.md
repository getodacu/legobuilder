# Advanced Driving Base — Rear Part authoring evidence

## Scope and status

`src/lib/models/advanced-driving-base/rear.ts` exports the complete Book4 numbered sequence as `rear: BuildFragment`, root `rear`: 31 numbered steps and 68 prepared callout units. These are authored counts, not independently verified placement counts. This author ran no tests, builds, formatters, browser scenarios, fit gates or source-image comparison gates; parent integration has since exercised strict model compilation, current unit tests and live complete-ADB browser states, **but not full Book4 manual-to-mesh fit, contact and collision checks**. Do not promote placement coverage.

Source: [official Rear Part PDF](https://assets.education.lego.com/v3/assets/blt293eea581807678a/bltbaec24f63e4075fc/5ec8e806f555a00375660930/advanced-driving-base-bi-pdf-book4of5.pdf?locale=en-us), SHA-256 `6d8c32bc457e17a2f816da54a422f9cf4f0cde55235a5d3d610816d846342b89`. One PDF page per numbered instruction, 1–31. All contact-sheet pages were inspected; private full-page details were rendered for instructions1,3–6,8,11–13,16–20,22–29,31. Source PDFs and images remain private in `.research-cache/advanced-driving-base/`; none are public app assets.

The earlier task text mistakenly assigned hub and caster scope to Rear; parent explicitly corrected that assignment. Book4 has **no hub and no caster**. Book1 owns each separate39370 cup and52629 ball (native ball offset `[0,46,0]` LDU); Book5 owns the one prepared hub including its source battery preparation. Rear never adds a duplicate ball, extra battery unit, arbitrary hub box, tyre, cable part, or optional tool accessory.

## Inventory and source correction

| Source family | Prepared units | Introduction pages |
|---|---:|---|
| Gray48989 integral-pin cross block | 2 | 1 |
| Black40490 nine-hole beam | 4 | 1,2,13 |
| Black2780 friction pin | 20 | 3,4,6,7,23,25 |
| Medium54696p01 motor | 1 | 5 |
| Magenta39793 block | 1 | 7 |
| Gray14720 H-frame | 4 | 8,10,17 |
| Blue6558 long pin | 7 | 11,14,20 |
| Gray32054 coaxial stop-bush pin | 4 | 11 |
| Medium azure49283 cable clip | 3 | 14,17 |
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

## Independent native feature derivations

All coordinates in this section are original native LDraw LDU. Native geometry receives `N = Rx(pi) ×0.4` once. Part placements use `N*T*N^-1`; retained mesh origins are never centered or rescaled. Rotations are proper quaternions, not reflected CAD matrices.

- **40490:** original DAT lines21–38 specify nine through-hole centers at `(0,0,z)`, `z=-80,-60,…,80`, nativeY through-axis, facesY±10. Lower rails use native placements `(-20,40,60)` and `(20,40,60)` with Rz(-90°), placing the through-axes along module nativeX.
- **48989:** root lines14–21 place integral pin bases at `(0,±20,±10)` along nativeZ. Subpart `s/48989s01.dat` lines12–14 has end through-holes along nativeX and the orthogonal center bore. Native bridge centers `(0,40,0)` and `(0,40,120)` with the recorded proper rotation place opposed integral pins onto rail holes at global nativeZ `-20,20,100,140`. The two bridges remain two prepared units, not separately counted molded pins.
- **2780:** root lines13–14 place both `confric5` halves along nativeX. Pin origin is the central collar; the two halves reach±20 LDU. Face-recess/collar seating is different from putting the pin mesh center at the beam center. Final pin seating travel20 LDU is8mm where that one-half insertion actually applies.
- **32054/6558 coaxial seats:** gray32054 origin `(60,y,z)` places its stop-bush faces at moduleX30/50 and pin shaft atX50..90. Blue6558 origin `(20,y,z)` with Ry(180°) places collarX30, short halfX30..50 inside the bush, and long halfX-10..30 inside the motor. Motor insertion travel is40LDU=16mm. Outer40490 rail facesX50..70 occupy the first gray shaft module. At upper motor rowY-20, the upright occupiesX70..90 at its sixth hole; the lower rowY20 does not intersect the seven-hole upright and is not falsely mated to it.
- **54696p01:** root lines17–18 reference the real fixed `u9364c01` body and the real `u9363p01` drive hub at native `(0,-50,0)`. This is canonical scene `(0,20,0)` before any module transform. Body hierarchy `u9364c01.dat` lines16–21 locates white upper/lower shells, azure rear shell, and the captive cable stub at nativeZ143. The output joint binds **`parts/u9363p01.dat`**, movingSide `rotor`; the body does not spin.
- **Motor mounting features:** `u9364c01` translates `u9364` byY-20 and `u9365` byY+20; their mirrored subparts contain side bores at X±30, Y±20, Z±20. Rear shell `u9366` is translatedZ140 and contains the rear side and underside bores. The front underside seat at `(0,30,-20)` and rear underside at `(0,30,140)` are the lower bridge upward-pin targets. These independently derived seat features need parent contact comparison, rather than assuming the body bounds are holes.
- **39793:** original root lines14–26 contains center/outer holes and orthogonal edge holes at20-LDU spacing. The bracket is a genuine nine-perpendicular-hole part, not a box. Four separate black pins connect its side bores to the H-frame upper row.
- **14720:** original root lines14–18 defines three-hole crossbars at nativeZ±40 plus central longitudinal bores atZ-20,0,20. Crucially, the central bores use nativeX while crossbar bores use nativeY: they are not all parallel. Rear bracket-frame transforms cycle localX→moduleZ, localY→moduleX, localZ→moduleY. Thus crossbar holes atZ±40 become the upper/lower rows, with two source pins through each row.
- **Mounting H-frame registration:** the page17 mount frames use **Rx(-90°)**, centers `(-40,0,-20)` /`(-40,0,140)`. NativeX remains moduleX, nativeZ becomes moduleY, nativeY becomes-moduleZ. The two source housing pins therefore enter actual **central-spine nativeX bores at nativeZ±20**, matching motor rowsY±20 at frontZ-20/rearZ140. They do not use the nativeY end-crossbar holes. End crossbars are at moduleY±40 with bores along moduleZ. This resolves the earlier invented rearZ100 end-bar hypothesis without moving or altering the real motor.
- **32184:** original root lines17–34 places its two axle bores on nativeX, centers `(0,±20,0)`, with end facesX±10. Lines37–43 define the center pin bore along nativeZ, facesZ±10. The source-yellow shafts run through the two axle bores, not the central round bore. White upper/lower pairs remain distinct instances with distinct introduction pages.
- **Installed white units:** source preparation is upright, but page19 rotates each prepared unit into its motor-end pose. White32184 orientation maps nativeX→moduleZ, nativeY→moduleX, nativeZ→moduleY. Front cap centers are `(-60,-40,-40)` and `(-60,-40,0)`; rear cap centers `(-60,-40,160)` and `(-60,-40,120)`. Two yellow axes run along moduleZ atX-80/-40, Y-40, centeredZ-20/140. TheX-40 shaft passes the H-frame top end-crossbar center bore; theX-80 shaft passes the genuine clip. Axle and clip do not occupy the same H-frame volume. Parts retain names lower/upper by their preparation-page identity, not a false installed vertical separation.
- **41239 rail seats:** the13-hole rails are stacked at native `(-60,-20,60)` and `(-60,-60,60)`, nativeY through-axes. The p20 pins use holes4/10, relativeZ±60: moduleZ0/120. Blue6558 origin `(-60,-40,0/120)` with Rz(-90°) puts its collar atY-30, short half through the lower railY-30..-10, long half through white inner-cap boreY-50..-30 and upper railY-70..-50. The first prepared rail approaches upward with16mm long-half seating; the second rail seats downward over the remaining free pin halves.
- **Stack height:** the two source tubes sit at `(-60,-90,-40/160)`, pin-end planesY-70/-110. Lower standoff pins seat in the upper13-rail holes2/12 (relativeZ±100); upper pins enter the real39794 corners atX-60,Z-40/160. These actual successive seats determine topframeY-120; they are not a guessed hub-height adjustment.
- **4519:** native axle long axisX, nominal three-module length60 LDU. Its prepared lower-block seat spans20 LDU=8mm; this is derived from that individual through-axle bore, not a generic axle travel. The distinct blue6558 long-half motor insertion remains40 LDU=16mm.
- **62462:** original root lines14–20 and33–39 establish a nativeX-axis tubular pin joiner with endsX±20. Its source upper/lower2780 pin seats are at those real end planes, not inferred bounding-box centers. Two standoffs each count as one tube and two separately tracked pins.
- **46372:** root lines51–55 has four pin holes on nativeZ axes at radial `(0,±20)` and `(±20,0)` in its nativeXY plane. Its center axle bore is nativeZ. The authored gear rotation Rx(+90°) turns that plane horizontal; two opposite radial pin bores match two real motor-hub bores. Gear native center `(0,-60,0)` puts its lower seat at motor nativeY-50. The gear and its two pins belong to moving subassembly `rear-output`; no invented output shaft is introduced. The four yellow axles are structural mounting shafts, not driven tool outputs.
- **39794:** original root lines14–45 constructs the real7×11 opening, nativeX sides±60, nativeZ ends±100 and nativeY thickness20. Side through-hole surfaces areX±70. The authored center is `(0,-120,60)`, derived from the stacked rail/tube/pin seats.
- **32524 /18651:** page30 shafts are perpendicular to the7-hole beam length. Root18651 defines pin collarX-10 and longer axle toX30. Uprights centered `(80,-60,-20)` /`(80,-60,140)` map long nativeZ to moduleY and bore nativeY to moduleX. Seven centers spanY-120..0; the upper gray shaft passes the top end, bottom18651 passes the bottom end. Upper32054 rowY-20 enters hole6; lower rowY20 is below the beam and is deliberately not connected.
- **49283:** original native root lines14–32 defines its genuine bushing/clip body. Only the three source medium azure322 clips appear in Rear; no red, blue, yellow, magenta, or invented clip is added here.

## Timeline, reuse and accounting

All68 instances are visible in staged inventory at time zero. Staging, camera positions, durations and work-area clearances are explicitly app-authored presentation. Each new unit receives one installation milestone on its source introduction page. Introduction into a prepared local unit does not recount that unit when transferred into the larger rear module.

Physical reused groups move on pages9,12,15,19,21,24,26,29,31, with the actual prepared IDs and world-space snapshots. Page19 includes the real preparation-to-installed rotation of the two mount units; their preparation shafts stand upward while installed axes run along moduleZ. Page10/31 rotation symbols change camera side, not the whole physical robot. The root remains identity; integration owns whole-module staging/final positioning. Each connection commit operation is selected by source step and actual mating endpoint membership, not the first arbitrary operation in a multi-unit step.

## Book5 interface contract

`attachmentSites` exposes real part-local bore frames, not module/world coordinates disguised as local data:

- `side-receiver-{1,2}-{upper,lower}`: available real holes on `rear-upright-1/2`, geometry32524, native local `(0,10,-40)` and `(0,10,0)`. These are **not** asserted to be the four Book5 joining receivers. Independent PDF12 inspection shows its top two arrows instead lead from exposed top axles to hub side holes; its lower arrows involve the gray bracket ends. Do not force the64mm upright span onto the96mm drive-side chassis span.
- `upper-frame-bore-1/2`: `rear-top-frame`, geometry39794, actual outer side face native `(-70,0,-40)` /`(-70,0,40)`, nativeX bore axis. Frame part-local orientation is supplied so its connection-frame+Y follows that bore axis.
- `rear-motor` retains `rear-captive-lead`, native `(0,0,143)`, for the integrator's continuous captive cable route to the Book5 hub. Book5 instruction4/PDF7 and the final port map assign rear motor **C**. Fragment motor ID is `rear-output-motor`; output joint `rear-output-joint`; moving group `rear-output`.
- `hub-axle-1/2`: real18651 upper axle local `(10,0,0)`, nativeX axis; native module positions `(90,-120,-20)` /`(90,-120,140)`. Collars areX70, uprights occupyX70..90, exposed axleX90..110. Book5 top-arrow/hub correspondence still needs an independently validated whole-model root placement after this corrected stack height.
- `azur-end-1/2` and `azur-upper-end-1/2`: true41239 endpoint bores on both stacked rails, local `(0,-10,-120)` /`(0,-10,120)`, nativeY axes. Module endpoints areX-60, Y-20/-60, Z-60/180: a96mm×16mm rectangle. Neither their Book5 incoming-pin axes nor their final whole-module orientation is assumed merely from matching rectangle dimensions.
- `mount-end-{1,2}-{a,b}` and `mount-free-*`: true14720 end-crossbar nativeY bores. For H center `(-40,0,Zend)` and Rx(-90°), a local `(x,y,z)` becomes module `(-40+x,z,Zend-y)`; bore axis is moduleZ. Free candidates exclude the upper middle hole occupied by the yellow shaft, while exposing both actual seat faces of the remaining bores.
- `mount-spine-{1,2}-{upper,lower}` exposes actual nativeX central-spine bore faces for inspection. These holes are already occupied by the Book4 motor housing pins, **not free Book5 joining receivers**. The earlier `drive-receiver-*` Rz(+90°) closure candidate was removed: algebraic agreement did not correspond to the native motor/H-frame bores. No compatibility alias silently preserves that false mount.

Hub upper seats, the separate Book5 top frame, stop axles and underside5×7 frames are not invented Rear inventory. The integration owner supplies those parts and their mating connections using the source-accurate sites on whichever module the source actually mounts them to.

## Unresolved fit and required parent checks

No global 'all31 verified' or 'all68 fit verified' claim is made. Identity/geometry source confidence is distinct from independent final placement verification.

1. Parent reports licensed32054 assets acquired/generated and directly loaded, with no87082 geometry fallback; independently compare the four corrected coaxial units/outer-rail seats. This author did not run that asset check.
2. Keep the three independently observed source corrections (p11 gray32054, p18 white32184, p28 gray18651) reconciled in source-family and regression expectations;68 total remains unchanged.
3. Independently compare upper/lower motor seats, selected side bores, both white mounting brackets, azure rails and cable clip routes to source views. The source fixes topology but does not print metric attachment matrices; authored selected-hole registration remains unchecked. No historic2019 mold fit is certified by a current genuine DAT root.
4. Verify the two rotor/gear pin bores, gear seatY-50 and absence of gear/frame interference at both zero and nonzero rear output angles. The motor housing and structural yellow axles must remain fixed.
5. Register the Book5 rear join to the actual drive-side pins with part-local bore axes, then compare all simultaneous pin pairs, not just one convenient contact. Available upright sites do not by themselves establish the final chassis transform.
6. Parent-only gates should cover full source-family BOM, one introduction per unit,31 nonempty step mappings, deterministic reverse/scrub, every declared critical native seat, representative source comparisons and actual simulation output separation. Authored geometry is not proof that these gates passed.

### Critical registration residuals, not verified-fit claims

Motor/H-frame, white-shaft/clip,13-rail/white-center and standoff/topframe registrations now use mutually consistent original native features as detailed above. Their derivations are reconstructed CAD seating evidence, not independently exercised fit gates. Parent separately confirmed the real medium motor is the9L54696p01 and its rear bores areZ140; no shorter-body substitute or fictitiousZ100 bore exists.

The remaining critical open registration is **Book5's four drive-side blue pins to Rear**. Available true rear13-rail end bores have vertical moduleY axes and96mm endpoint span; free H-frame end bores have moduleZ axes and end crossbars atY±40. The motor-occupied H-frame central bores cannot be relabeled free receivers. Integration and drive-side owners must resolve the physical orientation/site correspondence from source and native CAD, or explicitly report the failing closure. Likewise parent must compare the corrected taller frame/upright poses to source31 and check clearance of the unconnected lower gray shaft row. No world-point equality alone counts as native fit verification.
