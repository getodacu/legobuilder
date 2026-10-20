# VEX V5 Clawbot — revision-locked evidence

## Selected build and reference status

Selected **VEX V5 Clawbot, manual 276-6009-750 Rev6, ©2023**, not Cortex, EXP or IQ. The official [Clawbot With Controller build lesson](https://education.vex.com/stemlabs/v5/stem-labs/clawbot-with-controller/build-instructions) links to [VEX's manual redirect](https://link.vex.com/docs/v5-clawbot-buildinstructions), which resolved to [276-6009-750-Rev6.pdf](https://content.vexrobotics.com/docs/276-6009-750-Rev6.pdf). Page 28 prints the revision and copyright. Page 4 explicitly sends Cortex System Bundle users to a different build. The V5 Brain, radio, battery and four 11W Smart Motors are explicitly listed on page 2.

Reference retrieved 2026-10-20. The private PDF is `.research-cache/vex-clawbot/276-6009-750-Rev6.pdf`: **34,709,793 bytes**, SHA-256 **`b57496f4f49730fd1da6d5bfc83cacede9ee17a2c94446799c035359b655f7d1`**. PDF metadata creation date is 2023-11-08; that is metadata, not a separately asserted publication date. All 28 pages were rendered and visually inspected; larger renders of pages 4, 6 and 18 resolve repeated items. Page numbers below are **physical PDF pages, 1-based**, because printed page numbers are missing on some sheets.

The required [official V5 build catalog](https://www.vexrobotics.com/v5/downloads/build-instructions) was visited but returned HTTP 403 through the reader; curl failed with error 56, and browser attachment was unavailable. Its contents were not verified. The education lesson and actual PDF were retrieved independently. No downloaded manuals or page renders are in `static` or intended for redistribution.

**Machine-readable evidence:** [`data/vex-clawbot.json`](data/vex-clawbot.json) transcribes all **40 page-2/3 inventory lines**, and every **41 numbered build steps** with page, explicit additions, fastener and shaft IDs, wiring ports, repeat scope and source contradictions. This is a faithful source transcription, **not a certified complete procurement BOM**: the manual starts with an unlisted preassembled claw, and its inventory conflicts with some step callouts.

## Inventory: what the manual actually says

Source for this section is [Rev6, pages 2–3](https://content.vexrobotics.com/docs/276-6009-750-Rev6.pdf#page=2). Full part IDs are in the JSON; quantities below are the printed parts-list quantities, not silently reconciled quantities.

| Category | Printed inventory |
| --- | --- |
| Fasteners | 30 #8-32 hex nuts; 30 #8-32 × 0.375-inch star screws; 4 #8-32 × 0.500-inch locking star screws; 2 #8-32 × 1.000-inch star screws; 6 #8-32 × 1.500-inch locking star screws |
| Spacers | 8 × 0.125-inch, 4 × 0.375-inch, 3 × 0.500-inch, 2 × 0.875-inch nylon spacers |
| Bearings/retainers | 5 bearing flats; 5 one-post hex-nut retainers; 7 four-post hex-nut retainers; 15 one-post hex-nut retainers with bearing flat |
| Shaft components | 23 rubber shaft collars; 10 high-strength gear shaft inserts; 1 high-strength shaft adapter, 1/8-inch square bore × 1/2-inch long |
| Shafts | 3 × 8x pitch; 1 × 7x pitch; 2 × 6x pitch; 3 × 4x pitch |
| Gears/elastic components | 1 12T gear with 1/8-inch bore; 1 12T metal pinion; 1 84T high-strength gear; 2 #32 rubber bands |
| Electronics | 1 V5 Robot Brain; 4 V5 Smart Motors (11W); 1 V5 Robot Battery Li-Ion 1100mAh; 1 V5 Robot Radio; 2 V5 battery clips; 6 connector pins called “0x2” |
| Wheels | 2 standard 4-inch wheels; 2 4-inch omni-directional wheels |
| Wiring | 1 × 180 mm power cable; **3 × 900 mm Smart Cable; 1 × 600 mm; 1 × 300 mm** — conflicts with steps, below |
| Structure | 2 C-Channel 1x2x1x15 (276-2232-028); 2 Angle 2x2x14x20 (276-6009-002); 3 U-Channel 2x2x2x20 (276-6009-001); 2 C-Channel 1x2x1x25 (276-2232-029) |

No preassembled claw body or its internal hardware appears in this list. Step 37 begins with a fully formed double-sided claw mechanism, then adds a shaft, drive gear and collar. Its existing gears, jaws, pivots, screws, nuts, spacers and other internals **cannot be counted from this manual's callouts**. [Official claw guidance](https://kb.vex.com/hc/en-us/articles/360035592952-Building-V5-Robot-Claws) links both Claw Kit 276-2212 and Claw Kit v2 276-6010; that does not prove which internal revision every depicted component belongs to. The indexed [Claw Kit v2 product listing](https://www.vexrobotics.com/276-6010.html) says it is partially assembled and excludes the motor, but the live page returned 403; no hidden hardware counts are inferred from that statement.

## Complete source sequence

All entries cite [the selected manual](https://content.vexrobotics.com/docs/276-6009-750-Rev6.pdf); PDF page and numbered figure identify the evidence. “S” = #8-32 × 0.375-inch star screw; “N” = #8-32 hex nut; “BF retainer” = one-post nut retainer with bearing flat. These abbreviations do not omit quantities. Existing assemblies are reused, not counted as new parts. Unlabeled structural-member ID assignments are **[INFERENCE]** from the profile and page-3 inventory; exact per-hole coordinates are not dimensioned.

| Step | PDF page | Explicit new callouts and action |
| --- | --- | --- |
| 1 | 4 | 2 S + 2 N + 2 four-post retainers; connect first crossmember to two rails. Pictured initial structure: two U-channels plus one angle [INFERENCE]. |
| 2 | 4 | 2 S + 2 N + 2 four-post retainers; attach second angle [INFERENCE]. |
| 3 | 5 | 2 S + 2 N + 2 four-post retainers; attach central U-channel [INFERENCE]. |
| 4 | 5 | 2 S + 2 N + 2 BF retainers; frame orientation change pictured. |
| 5 | 6 | 2 S + 2 N + 2 BF retainers on opposite side. |
| 6 | 6 | **Prepare two** 8x-pitch shaft/rubber-collar units; install one with **2 bearing flats**. Blue “2X” encloses only shaft and collar preparation. Printed local callout is one shaft + one collar; the second prepared unit is reused in step 9. |
| 7 | 7 | 1 V5 11W drive motor + 1 × 0.500-inch locking screw. |
| 8 | 7 | 1 × 0.500-inch spacer + 1 × 1.500-inch locking screw. |
| 9 | 8 | 2 bearing flats; reuse the second prepared shaft/collar unit from step 6. |
| 10 | 8 | 1 V5 11W drive motor + 1 × 0.500-inch locking screw. |
| 11 | 9 | 1 × 0.500-inch spacer + 1 × 1.500-inch locking screw. |
| 12 | 9 | 1 standard 4-inch wheel + 1 × 0.375-inch spacer + 2 collars + 2 gear shaft inserts. |
| 13 | 10 | Same additions as step 12 for other driven wheel. |
| 14 | 10 | 1 × 6x-pitch shaft + 1 collar. |
| 15 | 11 | 1 omni 4-inch wheel + 1 × 0.375-inch spacer + 2 collars + 2 gear shaft inserts. |
| 16 | 11 | 1 × 6x-pitch shaft + 1 collar. |
| 17 | 12 | Same additions as step 15 for other passive omni wheel. |
| 18 | 12 | 2 battery clips + 4 S + 4 N; rotate chassis as pictured. |
| 19 | 13 | 1 radio + 2 S. |
| 20 | 13 | 1 Brain + **4 connector pins, called “0x1” here**. |
| 21 | 14 | 1 V5 battery inserted into clips. |
| 22 | 15 | **3 × 300 mm Smart Cables** (276-4860-020) + 1 × 180 mm power cable. Image connects Brain port 6 to radio, port 10 to image-left drive motor, port 1 to image-right drive motor; battery uses power connector. |
| 23 | 16 | 2 S + 2 N + 2 BF retainers on first short C-channel [INFERENCE]. |
| 24 | 16 | 1 S + 1 N + 1 BF retainer on second short C-channel [INFERENCE]. |
| 25 | 16 | 1 arm motor + 2 × 0.500-inch locking screws + 1 × 8x-pitch shaft + 1 collar + 1 bearing flat. |
| 26 | 17 | Place completed support on chassis; no new hardware callout. |
| 27 | 17 | 1 N + 2 one-post retainers + 1 × 0.875-inch spacer + 1 × 1.500-inch locking screw. |
| 28 | 18 | Two long C-channels [INFERENCE]; **4 S + 4 N + 4 BF retainers total across the two channels**, not 8. End-web notch is pictured with “Cut”; parent/mentor hacksaw help required. No numeric notch dimensions. |
| 29 | 18 | **4 S + 4 N + 4 BF retainers total across both channels**, on opposite faces; 2X is not an instruction to double the already printed 4x totals. |
| 30 | 18 | 1 N + 1 four-post retainer + 1 × 0.500-inch spacer + 1 × 1.000-inch screw. |
| 31 | 19 | 1 N + 1 one-post retainer. |
| 32 | 19 | 1 84T high-strength gear + 2 inserts + 2 × 0.125-inch spacers + 1 × 7x-pitch shaft + 1 × 1.000-inch screw. |
| 33 | 20 | 1 collar + 2 × 0.125-inch spacers; mount geared arm to tower. |
| 34 | 21 | 3 × 0.125-inch spacers + 1 12T metal pinion + 1 shaft adapter; install other arm channel from step 29. |
| 35 | 22 | 2 collars; install opposite support (figure references step 23). |
| 36 | 23 | 1 N + 2 one-post retainers + 1 × 0.875-inch spacer + 1 × 1.500-inch locking screw. |
| 37 | 24 | **Unlisted preassembled claw input** + 1 12T gear + 1 × 4x-pitch shaft + 1 collar. |
| 38 | 24 | 1 claw motor + 2 × 1.500-inch locking screws. |
| 39 | 25 | 2 #32 rubber bands placed as pictured; position claw between arm ends. |
| 40 | 26 | 2 × 4x-pitch shafts + 4 collars securing claw. |
| 41 | 27 | 1 × 900 mm cable to arm motor at Brain port 8; 1 × 600 mm cable to claw motor at Brain port 3. |

Non-step pages: page 1 cover/completed robot; pages 2–3 inventory; page 28 revision and rights. The education lesson's generic “check the Appendix” tip does not correspond to an additional appendix in this 28-page Rev6 file; the PDF ends with the copyright/revision page.

### Source conflicts that must remain visible

- **Wiring:** page 3 lists 3 × 900 mm and 1 × 300 mm Smart Cable, but step 22 uses **3 × 300 mm** and step 41 uses **1 × 900 mm**. Both include 1 × 600 mm. Page 3 prints 300 mm part ID **276-4861-020**, while step 22 prints **276-4860-020**. Preserve the conflict; do not claim the printed BOM is reconciled.
- **Pins:** page 2 lists **6 “0x2” pins**; step 20 calls for **4 “0x1” pins**, with the same ID 228-2500-086. Neither the unused two nor the inconsistent length label is resolved.
- **Listed quantities exceed explicit step-callout totals:** 0.375-inch screws **30 vs 27**; hex nuts **30 vs 29**; 0.125-inch spacers **8 vs 7**. These are unresolved differences, not proven spares or permission to invent additional placements.
- **Part-ID typographical conflicts:** step 10 prints motor 276-4840-001 while others print -000; wheel insert leaders in steps 13/17 say 276-2250-001 versus callout -005; step 18 nut leader says 276-1028-001 versus callout 275-1028-001; step 25 screw leader says 276-5117-001 versus callout 276-5007-001; step 37 shaft callout repeats gear ID 276-6010-011 while shaft leader says 228-2500-120; step 38 screw leader says 228-6009-007 versus callout 276-6009-007. JSON records each rather than treating the mistakes as new components.

## Geometry and documented dimensions

The manual documents nominal **4-inch wheel diameters**, screw and spacer lengths, the **1/8-inch gear bore**, **1/2-inch shaft-adapter length**, shaft pitch labels and structure hole-count designations. It does **not** provide global assembly width/length/height, a coordinate frame, per-hole attachment indices, metal thickness/tolerances, a dimensioned cut notch, axle track, arm reach or a dimensioned jaw aperture. Page 2 warns that V5 electronics, gears, wheels, wiring and structure are **not to scale**. No engineering dimensions were recovered by measuring the illustration.

The indexed official [metal plates listing](https://www.vexrobotics.com/plates.html) describes **0.182-inch square holes on 0.500-inch increments** (12.7 mm nominal pitch by exact unit conversion). Direct access returned 403. This is **indexed, generic metal-system evidence**, not a verified tolerance or member-specific drawing for every Clawbot part; application mount transforms must not be claimed as manufacturer-verified from it. The retrieved [V5 chassis guide](https://kb.vex.com/hc/en-us/articles/360035953131-Designing-a-V5-Chassis) verifies square connection holes, markers every five holes, material options and two parallel shaft supports, but its retrieved text does not state the 0.500-inch pitch.

## Kinematics, picking and controls

**[INFERENCE from inspected mechanism imagery]** Four independently actuated motor coordinates: two drive wheels, one arm elevation, one coupled claw aperture. The two passive omni wheels are not additional powered DOF; the paired arm beams are not independent joints; two claw jaws are coupled, not independently actuated. The wheel arrangement supports differential forward/reverse and yaw, **not direct lateral strafing**. Manual steps 32–34 explicitly show 84T and 12T gears; **7:1 external arm reduction is derived** from those tooth counts, not a published overall motor-to-arm ratio. The motor cartridge is not specified in the manual. No independently powered wrist is shown.

The [official object-retrieval challenge](https://education.vex.com/stemlabs/v5/stem-labs/clawbot-with-controller/remix-challenges-clawbot-control-python) demonstrates grabbing/releasing classroom objects and collecting them one at a time. It supplies **no numerical payload, jaw width, object-size limit, reach, safe center-of-mass, grip friction, force or tipping specification**. Those remain unknown; classroom success is not a certified payload rating.

[Controller Tank Drive Exploration](https://education.vex.com/stemlabs/v5/stem-labs/clawbot-with-controller/controller-tank-drive-exploration-blocks-based?type=teacher) documents independent motor velocity from joystick positions **3 and 2**, continuously refreshed in a forever loop. Its image alt text includes an inconsistent arcade-style note about right left/right input; the block descriptions and teacher answers describe two up/down joystick velocities. Do not turn that inconsistent note into a third drive axis.

[Clawbot Controller with Events, Python teacher answer](https://education.vex.com/stemlabs/v5/stem-labs/clawbot-with-controller/prepare-for-the-remix-challenges-python?type=teacher) specifies **L1/L2 arm up/down** and **R1/R2 claw open/close**, stopping motors when buttons are not held and predicting held positions. [The event lesson](https://education.vex.com/stemlabs/v5/stem-labs/clawbot-with-controller/event-based-programming-communication-among-blocks?type=teacher) explicitly demonstrates **L1 → arm up**, simultaneous driving/arm/claw control, and required pairing/cable checks. Retrieved prose does not disambiguate which individual R button opens versus closes. VEXcode V5's **Clawbot Controller with Events** example supplies device configuration. Motor reversals, encoder zero definitions and cartridge choice are not established by the retrieved build manual.

No official **revision-matched V5 Clawbot simulator**, contact model or dynamics calibration was verified. Search surfaced VEXcode VR competition playgrounds for other robots, not evidence that the Rev6 Clawbot is simulated. Any app keyboard mapping, motor acceleration, contact thresholds, payload bounds, angle stops or simulated picking behavior must be labeled app-authored and must not masquerade as official physical limits.

## CAD, engineering files and rights

The indexed official [V5 Classroom Starter Kit page](https://www.vexrobotics.com/v5-classroom-starter-kit.html) lists **CAD Files → V5 Clawbot (276-6009), STEP**. [Official-support forum discussion](https://www.vexforum.com/t/v5-clawbot-cad-files/49561) is a discovery lead for that product-page download. The product and forum pages returned 403; curl and isolated browser attempts did not recover an exact STEP link. Independent geometry-assets research encountered the same failures. Therefore **the official full-assembly CAD option is discoverable, but no exact binary URL, file hash, assembly hierarchy, internal claw geometry or Rev6 compatibility was verified**. No native parametric assembly, joint/constraint model, engineering tolerance drawing or full internal claw BOM was retrieved. A STEP listing alone does not prove native mating constraints or a dynamics-ready model.

Manual page 28 states **©2023 VEX Robotics, Inc. All rights reserved**. The indexed [VEX copyright notice](https://www.vexrobotics.com/copyright-notice) claims ownership of products, materials and digital assets; direct reader access was blocked. The retrieved [VEX Branding Guidelines](https://kb.vex.com/hc/en-us/articles/360044280432-Branding-Guidelines) expressly allow digital resources for **promotional and private use if proper branding is upheld**, state commercial use must credit VEX Robotics unless otherwise agreed, and give **branding@vex.com** for permissions. This provides evidence for private research reference use, but the page is organized around logos/artwork/style guides and does **not explicitly license redistribution of the full manual, manufacturing CAD or converted runtime meshes in an application**. Attribution alone is not treated as a blanket CAD redistribution grant. The software licensing EULA is not evidence of such a CAD grant.

The PDF and image renders therefore remain private development artifacts. Public runtime official meshes, copied pages/screenshots and downloaded manual bundles require an applicable explicit grant or permission first. Independently authored descriptive metadata is not represented as official engineering geometry. Third-party CAD repositories are not a substitute for a verified rights chain or revision match.

## Exact unresolved prerequisites

1. Retrieve official revision-compatible full-assembly STEP/native engineering files, verify hierarchy/component identity, and establish the internal preassembled claw BOM. Current blockers: official product/forum HTTP 403, curl failure 56, unavailable browser target; no guessed URL substituted.
2. Obtain a file-specific redistribution grant covering public runtime mesh conversion and any manual/image reuse; current branding guidance is not explicitly CAD-specific.
3. Resolve cable lengths/part ID, pin type/count, listed-versus-called-out fasteners/spacers and documented leader typos with an authoritative revision or VEX clarification.
4. Obtain dimensioned mounting transforms, cut-notch drawing, material/tolerance data, arm/claw angular bounds, encoder zeros, motor cartridge/reversal configuration, claw aperture, payload and object pickup envelope. None is invented from the illustration.
5. Obtain validated simulation parameters if physical fidelity is required. The source supports the assembly sequence and qualitative motions, not calibrated contact, grip, motor, collision or tipping physics.

No app code, build, lint, test or formatter gates were run for this research assignment.
