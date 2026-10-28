# VEX V5 Clawbot — recovered engineering data and historical build selection

Research date: 2026-10-20. Structured evidence: [`data/vex-cad-recovery.json`](data/vex-cad-recovery.json). Downloaded source files, source-page DOM, native-CAD inspection records and manual page renders remain private under `.research-cache/vex-cad-recovery/`. No app implementation, converted runtime meshes, build, test, lint or formatter gates were run.

**Historical, out of active product scope:** the user explicitly removed VEX V5 Clawbot. The active product contains only `advanced-driving-base`, `robotic-hand`, `quality-check` and `package-sorter`. This report preserves source identities, counts, retrieval evidence and rights findings; its VEX conversion, permission, identity and simulation prerequisites are **not current delivery gates**. No VEX workbench, source-only card or unavailable-model dialog remains in the product. Removing VEX does not certify the remaining LEGO fidelity or complete Sorter pickup/routing.

## Decision

**Official engineering data is now recovered, including the claw's internal rigid components and assembly placements.** The earlier blanket “no exact CAD URL or file retrieved” blocker is superseded. The remaining blockers are **rights for app-specific CAD conversion/use**, and **revision equivalence**, not lack of any real motor/channel/claw geometry.

The historical research pairing is **the official 2018 V5 Clawbot manual, 276-6009-750 Rev1 ©2018, and the official full Clawbot STEP whose header identifies 276-6009-000 Rev1, dated 2018-04-02**. These are separate document/assembly revision namespaces: matching “Rev1” text is **not** evidence of a vendor-certified CAD/manual match. This is a practical, explicitly documented same-era research selection, not a claim of certification or a current runtime target. The original [`vex-clawbot.md`](vex-clawbot.md) and its Rev6 transcription remain alternate historical research; **do not mix their Rev6 notch/wiring details into this selected 2018 sequence**.

No public distribution license was recovered. Native private CAD inspection is directly supported by VEX's offered Download/Preview controls; a separate app's CAD-to-mesh conversion is not explicitly licensed by the recovered terms. Localhost-only serving and keeping files out of public packages do not themselves create that permission.

## Retrieval: actual official alternatives, no guessed file URLs

The reader still returned HTTP 403 for the [Classroom Starter Kit](https://www.vexrobotics.com/v5-classroom-starter-kit.html). An isolated `app.path` Chrome launch initially reported no page targets. A separately launched Chrome with its own profile and CDP port **9347** loaded the ordinary product pages, with VEX's automatic EU-store redirect. No access-control challenge was bypassed.

The live product DOM exposes both individual CAD links and **Download All Files** archive links:

| Official source page | Actual source-linked download | Observed result |
| --- | --- | --- |
| [V5 Classroom Starter Kit](https://www.vexrobotics.com/v5-classroom-starter-kit.html) | [Individual Clawbot STEP](https://www.vexrobotics.com/cadmodels/upload/download/upload_id/0212d660-fca3-43ad-addb-bc9dc58b28e4) | Browser fetch HTTP 403, `cf-mitigated: challenge`; saved response is HTML, **not CAD**. |
| Same page | [Download All Files, product 2370](https://www.vexrobotics.com/cadmodels/archive/download/product_id/2370) | HTTP 200; archive `v5-classroom-starter-kit.zip`, **30,214,375 bytes**. |
| [Claw Kit v2, 276-6010](https://www.vexrobotics.com/276-6010.html) | [Individual STEP](https://www.vexrobotics.com/cadmodels/upload/download/upload_id/27ed312a-6226-498f-95d5-7c97bcc2856c); [Download All Files, product 1718](https://www.vexrobotics.com/cadmodels/archive/download/product_id/1718) | Archive HTTP 200, `276-6010.zip`, **3,597,041 bytes**. Individual link was recovered from DOM; no individual-file success is claimed. |
| [V5 Smart Motor, 276-4840](https://www.vexrobotics.com/276-4840.html) | [Individual STEP](https://www.vexrobotics.com/cadmodels/upload/download/upload_id/4d4d0c25-ee11-41b1-a39a-97eadda19619); [Download All Files, product 1756](https://www.vexrobotics.com/cadmodels/archive/download/product_id/1756) | Archive HTTP 200, `v5-smart-motor.zip`, **3,994,531 bytes**. |

These are alternatives deliberately offered by the accessible source pages, not a workaround around the challenged individual endpoint. The Clawbot and claw **Preview** buttons also loaded their public Autodesk model derivatives normally (HTTP 200); the claw model-browser tree was inspected and privately captured. No authentication tokens were copied into the reports.

Each downloaded ZIP contains **one STEP and no README/LICENSE**:

| Exact archive member | Uncompressed bytes | SHA-256 | Header |
| --- | ---: | --- | --- |
| `V5 Clawbot (276-6009).step` | 119,373,056 | `d291e70cf6ccd5260983193ab07d9f824b965b1c5f7e2ef298e961e7e7768fb7` | `276-6009-000 Rev1.STEP`; 2018-04-02T20:49:09; STEP AP203; SolidWorks 2017 |
| `V5 Claw Kit (276-6010).step` | 15,555,881 | `76ddd073429280482a4538c4750d2234d0ed173d6a8649d013c6669e96f39213` | `V5_Claw_Kit_276-6010.STEP`; 2020-02-05T19:53:27; STEP AP203; SolidWorks 2019 |
| `V5 Smart Motor (276-4840).step` | 16,822,582 | `3399374de417a5b403619e9e475d616e0cc1c3196324b4ba15d4fd0049ab9cec` | `276-4840-000 Rev1.STEP`; 2018-03-29T15:46:13; STEP AP214; SolidWorks 2017 |

Archive SHA-256, respectively: `4d5d7f2dfdd2287e690729772cf864c5955974a2b83b9d56692519d833ddb6d8`, `72d67a80877c7f3b934f760ced27f34d93cbb2348060adbc621ffaa06476c9de`, `41d0a2d499d7ef9b29b5fc41bc1539d389dc5b7ed7ffe44bfc5195e81978f819`. Exact private paths are in the JSON `archives` entries. No copyright/license/redistribution wording was found in these STEP texts; empty author/organization header fields are **not** a license grant.

## Native hierarchy and internal claw evidence

The JSON `nativeStepHierarchies` records every parsed `PRODUCT` and `NEXT_ASSEMBLY_USAGE_OCCURRENCE` with its source STEP entity number and parent/child identity; this is engineering source hierarchy, not guessed tessellation grouping:

- Full Clawbot: **56 unique PRODUCT records, 301 usage occurrences**, including **175 direct root children** and an **88-child embedded claw assembly**, `276-6010-100 Rev12_276-6010`.
- Standalone claw: **13 PRODUCT records including root, 83 direct child occurrences**.
- Standalone motor: **18 PRODUCT records, 25 usage occurrences**, 16 direct root children; smaller subassemblies contain the remaining occurrences.

`nativePlacements` contains millimetre translations and 3×4 rigid transform matrices recovered through native STEP import for the full root, embedded claw, standalone claw and standalone motor. The original STEP retains the complete native BREP and all nested placements. No claim is made that AP203/AP214 includes the original SolidWorks mates, editable feature tree, joint limits or simulation parameters.

### Standalone claw: all 83 modeled occurrences

Source: [official Claw Kit v2 CAD archive](https://www.vexrobotics.com/cadmodels/archive/download/product_id/1718), corroborated by its official Preview tree. Keep these exact CAD names; do not silently turn anonymous sections into invented procurement IDs.

| CAD product name | Count |
| --- | ---: |
| `V5_Claw_Section_001` | 2 |
| `V5_Claw_Section_002` | 4 |
| `V5_Claw_Section_003_35 Tooth` | 2 |
| `V5_Claw_Section_004` | 2 |
| `V5_Claw_Section_007` | 2 |
| `V5_Claw_Section_010` | 18 |
| `V5_Claw_Section_Washer_Instruction` | 8 |
| `_8-32_x_1_000_Star_Drive_Screw_276-4996_No Threads` | 19 |
| `_8-32_x_1_5000_Star_Drive_Screw_276-4998_No Threads` | 2 |
| `_8-32_Hex_Nut_275-1028` | 21 |
| `12T_Gear_276-7368_Spur01` | 1 |
| `Rubber Band` | 2 |

The 2018 full model's embedded claw contains corresponding individually named `276-6010-001 Rev7` (2), `-002 Rev5` (4), `-003 Rev6_35 Tooth` (2), `-004 Rev4` (2), `-007 Rev4` (2), `-010 Rev2` (18), plus 8 `228-2500-112 Rev2_Instruction`, 19 one-inch screws, 21 nuts and two rubber-band occurrences. Its **88** children additionally include a motor, a 4x-pitch shaft, a collar and two further long screws relative to the standalone 83. Its four long screws use `276-6009-007 Rev1_No Threads`; the standalone's two use the name `276-4998`. These differing names are preserved rather than asserted to be manufacturer-approved substitutions.

**What is resolved:** there is actual native geometry for the jaws, geared sections, structural pieces, pivots, washers/section pieces and fasteners, not just an exterior claw silhouette. **What is not resolved:** a certified packaged/internal procurement BOM or proof the 2020 standalone claw is geometrically unchanged from either the 2018 embedded claw or the 2023 Rev6 figure. Historical Rev1 step 37 starts with a preassembled claw; the CAD includes some pieces added later in the manual, so blindly summing the model and manual double-counts them.

The current [product listing](https://www.vexrobotics.com/276-6010.html) explicitly lists one claw assembly, two **#64** bands, two locking 1.5-inch screws, one rubber shaft collar, one 12T gear and one 4x-pitch shaft; it excludes the motor. Historical/Rev6 manuals call out `228-4133-474` bands, identified in existing component research as #32. The standalone CAD lacks the supplied shaft/collar and includes a gear and bands: **model occurrence tally is not the shipping BOM**.

## Real dimensions recovered, and their limits

Source data below is native official STEP geometry, imported privately with OpenCascade (`cadquery-ocp` 8.0.1.1.0), using native unit conversion and `BRepBndLib.AddOptimal` without triangulation or shape-tolerance expansion. Rounded values are **CAD-derived nominal extents**, not toleranced drawings, certified physical dimensions or automatically valid Rev6 dimensions. Source-frame axes are retained; they are not a newly invented semantic length/width/height frame.

| Source product | Source-frame X × Y × Z extent, mm |
| --- | --- |
| `276-6009-001 Rev3` U-channel | 254.0000 × 25.4000 × 27.9368 |
| `276-6009-002 Rev3` angle | 254.0000 × 25.4000 × 25.4000 |
| `276-2232-028 Rev1` short C-channel | 190.5000 × 13.8684 × 25.4000 |
| `276-2232-029 Rev1` long C-channel | 317.5000 × 25.4000 × 13.8700 |
| Motor `276-4840-000 Rev1`, full modeled assembly | 57.3001 × 33.0001 × 72.3000 |
| Standalone claw, modeled pose including bands | 120.7998 × 68.3166 × 186.2706 |

The [VEX Smart Motors knowledge-base specification](https://kb.vex.com/hc/en-us/articles/360060929971-Understanding-V5-Smart-Motors) independently publishes **57.3 W × 71.6 L × 33.0 H mm**, two **#8-32 threaded inserts**, and acceptance of **1/4-inch high-strength / 1/8-inch standard shafts**. Its inch values are 2.26 × 2.82 × 1.30; retain the manufacturer's rounded unit pairs rather than silently replacing them with exact conversions. The **71.6 mm published length versus 72.3 mm full CAD extent** remains a visible difference, not an invented correction.

In the motor CAD's own coordinate frame, the two `276-4840-043 Rev8` occurrences have coaxial cylindrical features at **(X,Y)=(-12.7,0) and (0,0) mm**, parallel to Z, hence **12.7 mm spacing**. Their modeled cylindrical bore radius is **1.7272 mm**. Assigning these paired parts the mounting-insert role is **[INFERENCE]**, supported by their source placement and VEX's two-insert description; the smooth CAD cylinder is **not a tap drill/thread tolerance specification**. Raw placements and cylinder evidence are private `motor-paired-insert-features.json`. Exact holes, web profiles and thickness are available in the native BREP: do not reconstruct them from the rounded bounding boxes above.

No toleranced 2D engineering drawing was recovered from the inspected [motor](https://www.vexrobotics.com/276-4840.html), [structure](https://www.vexrobotics.com/v5-structure.html) or [aluminum Clawbot structure](https://www.vexrobotics.com/276-6240.html) pages. The aluminum kit has different member IDs (`276-6240-001/-002/-003`, `276-2288-001`); it is not evidence that the selected steel parts may be swapped without recording a revision change.

## Official historical manual: chosen 41-step source

Recovered [first-party historical PDF](https://content.vexrobotics.com/docs/V5-Clawbot-BuildInstructions-0720.pdf): **17,370,434 bytes**, SHA-256 **`cd08303f81e1e48d6ab6ca6ff126ca9dff5c92ec579e4e06cfeb99d44a00dd8b`**. Page 28 explicitly prints **276-6009-750 Rev1, ©2018**. Creation metadata is 2018-07-20; that metadata is not treated as a separate publication claim. The initial lead was indexed search, then the actual VEX-hosted file was retrieved; a `vex-academy.com` alternate failed DNS and is not relied on. Reader extraction succeeded; urllib returned 403 and browser cross-origin fetch failed; ordinary curl retrieved the PDF. All pages were rendered into a private visual contact sheet; critical counts, the uncut arm, claw and wiring were inspected in larger page renders.

The JSON transcribes all **40 inventory lines and all 41 numbered steps**, with exact historical IDs, page references, additions and wiring. A compact human sequence follows. S = `276-4991-001` #8-32 × 0.375-inch screw; N = historical `276-1028-001` nut; BR = `276-6009-003` bearing nut retainer. Structural ID assignments where not labeled in the step remain explicitly inferred from the inventory/profile.

| Step | PDF page | Historical action / new additions |
| --- | ---: | --- |
| 1 | 4 | First crossmember to rails: 2 S, 2 N, 2 four-post retainers. |
| 2 | 4 | Second crossmember: 2 S, 2 N, 2 four-post retainers. |
| 3 | 5 | Central U-channel: 2 S, 2 N, 2 four-post retainers. |
| 4 | 5 | 2 S, 2 N, 2 BR; rotate frame as pictured. |
| 5 | 6 | Opposite side: 2 S, 2 N, 2 BR. |
| 6 | 6 | Prepare **two** shaft/collar units (`228-2500-124`, `-143`); install one with 2 bearing flats. Historical printed totals are already **2 shafts + 2 collars**; 2X is not four. |
| 7 | 7 | First drive motor, 1 × 0.5-inch locking screw. |
| 8 | 7 | 1 × 0.5-inch spacer, 1 × 1.5-inch locking screw. |
| 9 | 8 | Reuse second step-6 unit, add 2 bearing flats. |
| 10 | 8 | Second drive motor, 1 × 0.5-inch locking screw. |
| 11 | 9 | 1 × 0.5-inch spacer, 1 × 1.5-inch locking screw. |
| 12 | 9 | First standard wheel, 1 × 0.375-inch spacer, 2 collars, 2 inserts. |
| 13 | 10 | Same for opposite standard wheel. |
| 14 | 10 | First passive-wheel shaft `228-2500-122`, 1 collar. |
| 15 | 11 | First omni wheel, 1 × 0.375-inch spacer, 2 collars, 2 inserts. |
| 16 | 11 | Second `228-2500-122` shaft, 1 collar. |
| 17 | 12 | Second omni wheel, 1 × 0.375-inch spacer, 2 collars, 2 inserts. |
| 18 | 12 | 2 battery clips, 4 S, 4 N. |
| 19 | 13 | Radio, 2 S. |
| 20 | 13 | Brain, **4 `228-3943-086` connector pins**. |
| 21 | 14 | Battery into clips. |
| 22 | 15 | 3 × 300 mm `276-4860-020`, 1 × 180 mm `276-4817-100`: Brain 6 radio, 10 image-left drive, 1 image-right drive; power cable to battery. |
| 23 | 16 | First support: 2 S, 2 N, 2 BR. |
| 24 | 16 | Opposite support: 1 S, 1 N, 1 BR. |
| 25 | 16 | Arm motor, 2 × 0.5-inch locking screws, `228-2500-124` shaft, collar, bearing flat. |
| 26 | 17 | Place completed support on chassis, reuse prior assemblies. |
| 27 | 17 | 1 N, 2 one-post retainers, 1 × 0.875-inch spacer, 1 × 1.5-inch locking screw. |
| 28 | 18 | Prepare two long arm channels: **4 S + 4 N + 4 BR total**. **No Cut/notch instruction.** |
| 29 | 18 | Opposite faces of both channels: **4 S + 4 N + 4 BR total**. |
| 30 | 18 | 1 N, four-post retainer, 0.5-inch spacer, 1-inch screw. |
| 31 | **18** | 1 N, one-post retainer. |
| 32 | 19 | 84T gear, 2 inserts, 2 × 0.125-inch spacers, `228-2500-123` shaft, 1-inch screw. |
| 33 | 20 | Mount geared arm: collar, 2 × 0.125-inch spacers. |
| 34 | 21 | 3 × 0.125-inch spacers, 12T metal pinion, adapter; fit other arm channel. |
| 35 | 22 | Fit opposite support, add 2 collars. |
| 36 | 23 | 1 N, 2 one-post retainers, 0.875-inch spacer, 1.5-inch locking screw. |
| 37 | 24 | Preassembled claw input; add `276-6010-011` 12T gear, `228-2500-120` shaft, collar. |
| 38 | 24 | Claw motor, 2 × 1.5-inch locking screws. |
| 39 | 25 | 2 `228-4133-474` rubber bands, position claw between arm ends. |
| 40 | 26 | 2 `228-2500-120` shafts, 4 collars. |
| 41 | 27 | **Arm: Brain 8, 600 mm `276-4860-030`; claw: Brain 3, 900 mm `276-4861-010`.** |

### Differences and discrepancies must remain explicit

- Historical page 3 prints **3 × 300 + 1 × 600 + 1 × 900 mm**. This agrees with the current kit's quantity mix, unlike the Rev6 inventory. Historical step 41 assigns **600 mm to arm / 900 mm to claw**, opposite the inspected Rev6 figure; never apply one revision's wiring labels to the other.
- Historical page 18 has **no arm Cut callout**. Do not add the Rev6 notch to the historical STEP. The historical long-channel BREP is a direct engineering reference, not a guessed notch.
- Historical inventory and step 20 both print pin **228-3943-086**, with **6 inventory / 4 step**. The recovered full CAD has 4 `228-2500-086 Rev3` occurrences. No manufacturer-approved equivalence was established. Current kit wording “6 0x2” and Rev6 “4 0x1” do not resolve it.
- Historical nuts print **276-1028-001**, unlike most Rev6 callouts' **275-1028-001**. The standalone claw uses the latter name, the embedded claw the former. Preserve source IDs.
- **30 vs 27** 0.375-inch screws, **30 vs 29** nuts, and **8 vs 7** 0.125-inch spacers remain inventory/step differences. The full CAD root independently contains 27, 29 and 7 respectively; this corroborates step additions, **not** a proof the differences are spares.
- Current kit contents explicitly supply **one V5 Claw Assembly** linked to 276-6010, which the manual omits from inventory. Current kit lists four 1.5-inch screws outside that assembly; CAD/manually added motor screws must be classified before summing. Internal hardware is not absent merely because the external manual's inventory does not list it.

## Retrieval rights versus use/conversion/distribution rights

Primary rights sources are the [copyright notice](https://www.vexrobotics.com/copyright-notice), [VEX Site Terms of Use page](https://www.vexrobotics.com/terms-of-use), its actual embedded [VEX Terms and Conditions](https://www.iubenda.com/terms-and-conditions/89449486), and [Licensing EULA](https://www.vexrobotics.com/licensing-eula). The terms page initially displayed only a heading because its legal content is externally embedded; inspecting the page's actual embedded link recovered the authoritative text. **Owner contact: `legal@vex.com`.**

The content terms reserve rights, permit use **necessary or implicit in proper use of the Service**, otherwise prohibit copying/downloading/modifying/**transforming/creating derivative works**, and make an exception for explicitly downloadable/copyable/shareable content for **sole personal, non-commercial use with required attributions** where stated. The explicit CAD Download and Preview controls support private retrieval and native CAD inspection. They do not expressly identify a separate assembly app's mesh generation, local serving, commercial development or distribution as permitted uses.

The broad licensing EULA separately restricts modification/redistribution, but no file-specific statement was found establishing which EULA provisions govern these CAD downloads. This is not treated as an affirmative license or as proof every CAD use is prohibited. The [branding guidance](https://kb.vex.com/hc/en-us/articles/360044280432-Branding-Guidelines) is not substituted for CAD-specific terms.

| Activity | Evidence-based position |
| --- | --- |
| Download through offered archive link; private native CAD viewing/engineering inspection | Directly supported by offered controls and proper-service-use clause; keep attribution and private source records. Not a general open-license grant. |
| Private CAD-to-mesh conversion for this separate localhost assembly app | **No explicit CAD-specific grant established.** Request written permission/clarification from legal@vex.com. Local-only distribution scope should be stated precisely. |
| Public STEP/mesh redistribution, deployment, package/manual-image bundling | **Not cleared.** Request a separate grant if this becomes intended scope; none was assumed for current local development. |
| Independently authored geometry from factual dimensions/drawings | Potential practical alternative, but not a way to relabel copied CAD topology. Source factual coordinates and rights scope separately; obtain legal clarification when extracting dimensions under these terms. |

## Historical licensed alternatives and faithful paths (not current delivery work)

The inspected [VEX-CAD Fusion 360 Library](https://github.com/VEX-CAD/VEX-CAD-Fusion-360-Library) contains V5 parts and import instructions, but its [GitHub license endpoint](https://api.github.com/repos/VEX-CAD/VEX-CAD-Fusion-360-Library/license) returned **404** and the README does not provide an explicit asset license or upstream VEX rights chain. Targeted VEX-claw Creative Commons/CC-BY searches did not establish a faithful explicitly licensed internal claw alternative. That is a result for inspected sources, not a claim no licensed model exists anywhere. Do not adopt a public repository merely because it is downloadable.

**Chosen 2018 path:** use this report's complete Rev1 40-line inventory/41-step transcription, native assembly hierarchy and exact source component geometry/placements; no Rev6 Cut step or reversed cable lengths. Clarify historical pin ID versus CAD ID. The source has real engineering geometry; generic motor boxes, solid “claw” lumps, guessed hole spacing and invented internal counts are unnecessary. Vendor confirmation or a documented per-instance comparison is still needed before calling the pairing an exact manufacturer match.

**Conversion prerequisite only if VEX is explicitly reintroduced:** a permission request would need the three exact product/download links and hashes, planned local-only STEP-to-glTF/mesh conversion and assembly animation, whether use is commercial, attribution, cache exclusions and lack of public deployment. Request permission to convert/use geometry and retain private development assets; ask public redistribution separately only if planned. This is not required for the four LEGO models. Do not send a message on the user's behalf without authorization.

**Rev6 alternative:** request updated CAD or VEX confirmation of unchanged parts/claw internals against 276-6009-750 Rev6, plus the exact notch and cable/pin corrections. Recovered 2018/2020 engineering data does not itself prove those 2023 details.

**Independently authored geometry alternative:** use documented motor envelope/thread/socket facts and real measured hole/profile coordinates, not bounding boxes as final geometry. Obtain dimensioned drawings or record independent physical measurements for every motor housing/mount, channel profile/hole/web, claw link, gear, spacer/washer and jaw contact surface; retain provenance and revision. The recovered native BREP demonstrates precisely which pieces/features require dimensions, and the JSON preserves their source identities and placements. Publicly shipping independently authored geometry still needs an assessed rights basis; this report does not provide legal clearance for copying manufacturer topology or circumventing the transformation restriction.

If VEX is explicitly reintroduced, its faithful-app prerequisites remain concrete: **scoped conversion/use permission**, **pin identity**, and **revision/placement comparison or vendor confirmation**. For calibrated physical simulation, separate limits/zero settings, motor cartridge configuration, friction/contact/compliance and load data would still be needed; STEP shape alone does not supply them. None is a prerequisite for the current four-LEGO product.
