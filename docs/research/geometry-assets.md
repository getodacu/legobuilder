# Geometry and asset acquisition

Research date: 2026-10-20. Scope: real, attributable geometry and an actionable acquisition path, not a complete five-build BOM or certified engineering dimensions. Machine-readable evidence is in [data/geometry-assets.json](data/geometry-assets.json).

**Authoritative current scope:** the user explicitly removed VEX V5 Clawbot. The active product is exactly four LEGO builds: `advanced-driving-base`, `robotic-hand`, `quality-check` and `package-sorter`. This report preserves its original acquisition counts and license evidence; references to five builds describe the historical research set, not a fifth delivery obligation. VEX acquisition/permission findings are historical and are not acceptance prerequisites. LEGO fit/calibration, Quality cable/port mapping and Sorter pickup/routing gaps remain governed by [current coverage](../validation/coverage-baseline.md), not cleared by source availability.

## Decision

Use the **official LDraw parts-library files**, which are community-authored models of LEGO parts, **not official LEGO engineering CAD**. Download only the root parts needed and their dependency ZIPs. This research retrieved 23 root assets, comprising 366 unique DAT files, 991,792 uncompressed DAT bytes and 733,850 dependency-ZIP bytes. Every retrieved DAT's actual author, `!LDRAW_ORG`, `!LICENSE`, history, BFC declarations, dependencies, source URL and SHA-256 are recorded in the JSON. The retrieved reference graph has no unresolved type-1 dependencies.

The 366 DAT headers contain 364 CC BY 4.0 declarations and two mixed CC BY 2.0 / CC BY 4.0 declarations. The ZIP container and site footer are **not** the license evidence. No runtime VEX CAD redistribution is cleared by this research.

All downloaded PDFs, manual renders and source archives remain under `.research-cache`; nothing was put in `static`.

## 1. Official LEGO CAD investigated first

The inspected [official SPIKE Prime Product Info page](https://education.lego.com/en-us/teacher-resources/lego-education-spike-prime/support-technical-info/lego-education-spike-prime-support-technical-info-product-info/) provides product photographs, technical-specification PDFs for the hub, both angular motors and all three sensors, and an element-overview PDF. The [official building-instruction directory](https://education.lego.com/en-us/product-resources/spike-prime/downloads/building-instructions/) provides the target-build PDFs. Neither inspected page supplied openly licensed downloadable engineering CAD.

This is **not a claim that LEGO has no CAD**. It means no public CAD file and redistribution grant were established from the inspected official resources. The product-page HTML, hub technical sheet and large-motor technical sheet were archived privately with hashes in the JSON. Do not extract proprietary app geometry or treat PDF availability as permission to redistribute pages or derive a reusable asset pack.

## 2. Retrieved LDraw inventory

All links below point to the actual retrieved root DAT. Their individual headers were inspected, not inferred from filenames. `CC4` means the exact header is `Licensed under CC BY 4.0 : see CAreadme.txt`; `mixed` means `Licensed under CC BY 2.0 and CC BY 4.0 : see CAreadme.txt`.

Descriptions containing size numbers are source descriptions, not measurements made here. No physical component dimensions have been invented or assigned.

| Component / source description | Exact root filename | Observed license | Use / limitation |
|---|---|---|---|
| SPIKE Prime 6-port hub, yellow bottom, battery included; product SKU 45601 | [`45601c01.dat`](https://library.ldraw.org/library/official/parts/45601c01.dat) | CC4 | Use this complete shortcut; `45601.dat` alone omits the rechargeable battery. |
| Large angular motor, medium-azure back; SKU 45602 | [`54675.dat`](https://library.ldraw.org/library/official/parts/54675.dat) | CC4 | Real motor geometry; does not establish the official cable route. |
| Medium angular motor, medium-azure back and hub pattern; SKU 45603 | [`54696p01.dat`](https://library.ldraw.org/library/official/parts/54696p01.dat) | CC4 | Do not substitute the light-bluish-grey-back variant. |
| Distance sensor; SKU 45604 | [`37316.dat`](https://library.ldraw.org/library/official/parts/37316.dat) | CC4 | Full sensor shape with subparts. |
| Color sensor; SKU 45605 | [`37308.dat`](https://library.ldraw.org/library/official/parts/37308.dat) | CC4 | LDraw spelling is “Colour Sensor.” |
| Force sensor; SKU 45606 | [`37312.dat`](https://library.ldraw.org/library/official/parts/37312.dat) | CC4 | Full sensor shape with subparts. |
| Wheel 14 × 48, four spokes, integral medium-azure tyre | [`39367p01.dat`](https://library.ldraw.org/library/official/parts/39367p01.dat) | CC4 | Wheel/tyre composite; preserve its fixed color. |
| Wheel 14 × 80, four spokes, integral medium-azure tyre | [`49295p01.dat`](https://library.ldraw.org/library/official/parts/49295p01.dat) | CC4 | Larger wheel variant; do not select by visual similarity alone. |
| H-shaped beam / caster with white 19 mm ball | [`39370c01.dat`](https://library.ldraw.org/library/official/parts/39370c01.dat) | CC4 | Complete caster shortcut includes its ball. |
| Technic beam 7 | [`32524.dat`](https://library.ldraw.org/library/official/parts/32524.dat) | CC4 | General structural root. |
| Technic beam 9 | [`40490.dat`](https://library.ldraw.org/library/official/parts/40490.dat) | CC4 | First Advanced Driving Base front-bracket seed. |
| Technic axle 6 | [`3706.dat`](https://library.ldraw.org/library/official/parts/3706.dat) | CC4 | Representative axle, not a claim that every axle length is covered. |
| Friction pin with slots | [`2780.dat`](https://library.ldraw.org/library/official/parts/2780.dat) | mixed | Historical mold candidate; retain both license notices. |
| Friction pin, type 2 | [`61332.dat`](https://library.ldraw.org/library/official/parts/61332.dat) | CC4 | Newer mold candidate; exact manual mold is unresolved. |
| Connector block 3 × 3, nine perpendicular holes | [`39793.dat`](https://library.ldraw.org/library/official/parts/39793.dat) | CC4 | General connector root. |
| Cross block 1 × 3 with four pins | [`48989.dat`](https://library.ldraw.org/library/official/parts/48989.dat) | mixed | Circular-center candidate for the first front bracket. |
| Cross block 1 × 3 with four pins, rectangular center hole | [`65489.dat`](https://library.ldraw.org/library/official/parts/65489.dat) | CC4 | Alternate mold retained explicitly, not silently substituted. |
| Cable clip | [`49283.dat`](https://library.ldraw.org/library/official/parts/49283.dat) | CC4 | Clip geometry only, not an assembled cable path. |
| Frame 15 × 11, open center 13 × 9 | [`39790.dat`](https://library.ldraw.org/library/official/parts/39790.dat) | CC4 | Structural frame. |
| Frame 11 × 7, open center 9 × 5 | [`39794.dat`](https://library.ldraw.org/library/official/parts/39794.dat) | CC4 | Structural frame. |
| Beam/baseplate 19 × 11 | [`39369.dat`](https://library.ldraw.org/library/official/parts/39369.dat) | CC4 | Structural baseplate. |
| Double-bevel gear, 12 teeth | [`32270.dat`](https://library.ldraw.org/library/official/parts/32270.dat) | CC4 | Representative gear. |
| Double-bevel gear, 28 teeth | [`46372.dat`](https://library.ldraw.org/library/official/parts/46372.dat) | CC4 | Available now; an older palette's “missing 28T gears” warning is not current library absence. |

SPIKE motor/hub/sensor roots are authored by Philippe Hurbain (`Philo`); all dependency authors and editors are preserved separately in the manifest. First-beam root `40490.dat` is authored by Ross Crawford; `48989.dat` by Guy Vivan. Attribution must account for dependencies as well as these root authors.

The [SPIKE search results](https://library.ldraw.org/parts/list?tableSearch=spike+prime) and [medium-angular-motor results](https://library.ldraw.org/parts/list?tableSearch=medium+angular) also expose coiled-cable shortcuts: `54675c01.dat`, `54696p01c01.dat`, `37316c01.dat`, `37308c01.dat`, and `37312c01.dat`. These were discovered but not downloaded or individually license-cleared here. A coiled cable is not the official build's routed cable; do not present it as one.

### First usable LEGO subassembly: direct image evidence

The [official Advanced Driving Base Front Part PDF](https://assets.education.lego.com/v3/assets/blt293eea581807678a/blt2d17fa746ea991e5/5ec8e83df11f7e3ed6d502d7/advanced-driving-base-bi-pdf-book1of5.pdf?locale=en-us) was inspected as images, not inferred from text. Cached source: `.research-cache/advanced-driving-base/book1.pdf`, SHA-256 `903c68142601a3fbd50a4c22eac64e1fd950bd037b667626e4eacc362e8d7901`. Private page renders are `.research-cache/geometry/driving-base-step-01.png` through `-03.png`.

- **PDF page 1 / printed step 1:** one black nine-hole beam and two black friction pins. `40490.dat` is a sourced nine-hole beam; `2780.dat` and `61332.dat` are genuine, explicitly distinguished pin candidates.
- **PDF page 2 / printed step 2:** two light-grey three-position cross blocks with four integral pins. `48989.dat` matches the visible functional shape; its circular center appearance is closer to this image than the rectangular-center `65489.dat`, but exact historical mold identity remains provisional.
- **PDF page 3 / printed step 3:** two additional black friction pins inserted in the upward-facing end holes.

This is suitable genuine geometry for the first seed, not a fake block approximation. The manual does not print design IDs or insertion depths on these pages; visual shape matching does not promote a candidate into a verified historical element-ID crosswalk. No assembly matrices were copied or invented.

Actual `40490.dat` calls place successive beam-hole centers at source Z coordinates separated by **20 LDU** (lines 28–39). This is exact in the retrieved CAD; conversion to 8 mm uses the specification's *approximate* 0.4 mm/LDU relation. The beam's long axis is source Z and its hole axis source Y, which matters when placing the pin models. Preserve part-local coordinates instead of recentering meshes independently.

## 3. Complete, narrow dependency acquisition

The [motor detail page](https://library.ldraw.org/parts/10114) links both its DAT and a dependency ZIP. The retrieved pattern is:

```text
https://library.ldraw.org/library/official/parts/{part-id}.zip
```

For example, `54675.zip` contains 88 members, including motor housing subparts and the required ordinary and high-resolution primitives. `45601c01.zip` contains 132 members. These are member counts, not physical part counts.

Acquisition procedure:

1. Select a root by the actual part description and manual evidence; download its linked ZIP, not the whole library.
2. Preserve archive paths exactly: `parts/`, `parts/s/`, `p/`, and `p/48/`. Treat references case-insensitively and normalize backslashes for URL/file lookup.
3. Parse **every** type-1 subfile reference recursively. Resolve relative to the referencing file, then library `parts/`, `p/`, and `models/`; use the actual resolved path rather than inventing a prefix. Deduplicate by path and hash; conflicting bytes at a path require investigation.
4. Record every member's exact license, author, history, release metadata, hash and source URL. A permissive root does not license an unknown dependency. Reject unlicensed/unretrieved dependencies rather than inserting placeholder geometry.
5. Serve a curated licensed copy from the application's own origin, or pack the closed dependency set into MPD `0 FILE` sections with consistent names. Retain original metadata in either representation. Do not depend on cross-origin LDraw availability at runtime.

Raw assets are in `.research-cache/geometry/ldraw`; ZIPs are in `.research-cache/geometry/bundles`. JSON `assets[].dependencyBundle` identifies each archive and all members; JSON `files[].resolvedDependencies` is a usable file map. No huge full-library download was performed.

## 4. Actual redistribution notices

The retrieved [current `CAreadme.txt`](https://library.ldraw.org/library/official/CAreadme.txt) distinguishes CC BY 4.0 files from mixed CC BY 2.0 / CC BY 4.0 files. For mixed files it assigns modifications before 2023-03-05 to CC BY 2.0 and modifications on/after that date to CC BY 4.0. **Do not treat “and” as a blanket choice to ignore one license.** Retain both notices and original histories for `2780.dat` and `48989.dat`.

A shipped asset/provenance notice should:

- credit creators, source URLs, applicable [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) and [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) licenses;
- retain original DAT headers/history and the per-file manifest;
- say when geometry was converted, packed, simplified, recolored or otherwise modified;
- avoid any suggestion of LEGO/LDraw/VEX endorsement.

The [LDraw legal page](https://www.ldraw.org/legal-info) permits attribution to “The LDraw Parts Library” in place of a full author list for the described library derivatives. Preserving the actual authors in the manifest is more useful than relying solely on that shortcut. Its exception for **2D rendered images** does not turn redistributed GLB/OBJ/STL geometry into unlicensed images; converted parts remain derivatives.

Private cached notices: `licenses/CAreadme.txt`, `licenses/CAlicense.txt` (actual CC BY 2.0 text), and `licenses/CC-BY-4.0.txt` (retrieved from Creative Commons). The library's `CALicense4.txt` URL mentioned by CAreadme returned 404; the canonical Creative Commons legal text was retrieved instead.

**Material-config exception:** the actual retrieved `LDConfig.ldr` names LDraw.org as author and has no `!LICENSE` header. It is not included in the count of 366 license-inspected DATs. LDraw.org's site-created-content CC BY 4.0 policy may apply, but that is an inference rather than an observed per-file declaration. Confirm the grant before wholesale redistribution; alternatively author a narrowly scoped material mapping, retaining source/color provenance. Do not silently label this file with the DAT licenses.

## 5. Units, orientation and materials

The primary [LDraw format specification](https://www.ldraw.org/article/218.html) defines right-handed coordinates with **negative Y up**, brick width 20 LDU, brick height 24 LDU and plate height 8 LDU. It explicitly labels 1 LDU = 0.4 mm as a **real-world approximation**, not precision engineering data.

Recommended normalization:

- Keep authoring/attachment transforms in original LDU. For a Y-up Three/glTF scene, apply one outer X rotation of π: `(x, y, z) → (x, −y, −z)`. Negating only Y reflects the geometry and reverses handedness.
- Apply one outer scale: approximately 0.4 for scene millimeters or 0.0004 for glTF meters. Do not mix a millimeter model with a meter model without an explicit conversion. [glTF specifies meters and a right-handed Y-up coordinate system](https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html).
- Keep per-part origins and the full type-1 transform matrices. Parts are not all centered or oriented alike; do not assume the visual bounding-box center is an attachment pivot.
- Preserve BFC winding, `INVERTNEXT` and mirrored transforms. Preserve material code 16 inheritance, code 24 edge color and fixed subpart colors. A hub or integral tyre is not correctly represented by recoloring every triangle uniformly.
- Keep `!COLOUR` alpha/finish and conditional edges when using DAT. Treat sRGB colors correctly in Three; do not hand-apply a second gamma transform. Source color codes are design/material facts; the visual render is not a calibrated physical color measurement.

No component bounding-box dimensions were fabricated. The JSON deliberately leaves `dimensionsMm` null.

## 6. Conversion choices in this environment

| Path | Practical approach | Caveats / observed status |
|---|---|---|
| DAT / LDR / MPD → Three | [`LDrawLoader`](https://threejs.org/docs/pages/LDrawLoader.html), `setPartsLibraryPath`, optional `setFileMap`, conditional-line material | Preferred: directly handles sourced geometry, hierarchy, BFC and LDraw material semantics. Official docs recommend packing dependencies for fewer web requests. No conversion was executed here. |
| Three scene → glTF / GLB | [`GLTFExporter`](https://threejs.org/docs/pages/GLTFExporter.html) offline | Preserve part IDs/instances and attribution; exporter has a copyright option. Do not assume custom LDraw conditional-edge shader behavior round-trips through glTF. Retain DAT as the authoritative source. |
| STL / OBJ / glTF → optimized GLB | Blender at `/Applications/Blender.app/Contents/MacOS/Blender` | Parent reports a working Blender 5.2 LTS installation. [Blender documents OBJ/STL interchange](https://docs.blender.org/manual/en/latest/files/import_export/index.html). Require explicit source units and material/assembly sidecars; STL is not a substitute for a semantic part model. Native DAT/STEP import is not assumed. No Blender conversion was run. |
| STEP / IGES → triangulated geometry | [`occt-import-js`](https://github.com/kovacsv/occt-import-js) / OpenCascade via Node or browser WASM | Its primary README documents `ReadStepFile`, explicit output `linearUnit`, tessellation tolerances, and Three-compatible mesh/hierarchy/color data. Not installed or exercised. Importer LGPL/OpenCascade obligations and the CAD asset's separate license must both be considered. Offline conversion avoids shipping a large CAD parser for every page load. |

The smallest suitable first implementation is direct DAT loading from the curated dependency tree. A custom CAD parser, whole-library mirror and extra conversion dependency are unnecessary for that seed.

## 7. Full assemblies and third-party transform provenance

The [LDraw Official Model Repository](https://library.ldraw.org/omr) describes community-created models of official LEGO sets. “Official model” does not mean LEGO-authored CAD or a blanket license over all assembly matrices. No complete target-build MPD/LDR with independently inspected model license was adopted. Static OMR search-query attempts did not actually filter the displayed set list, so this research does not assert exhaustive absence.

An author-authorized **parts palette**, not a completed robot, was retrieved from [John Holbrook's educational-set files](https://www.johnholbrook.us/LDD_sets.html): [`45678.ldr`](https://www.johnholbrook.us/LEGO/sets/45678.ldr). The author explicitly permits use and derivatives with a backlink credit. The file itself has a blank author and no license header; preserve the web permission evidence if reusing that layout. Its page warns that the old LDraw palette omits 28T gears, and its arbitrary palette placements/quantities are not official build instructions. It supplies no verified robot assembly transforms. The asset's hash and source URL are recorded separately in the JSON.

## 8. VEX official engineering CAD and licensing (historical, out of scope)

This section records the initial retrieval attempt, not the current product scope. The later [CAD recovery report](vex-cad-recovery.md) supersedes its no-STEP-retrieval finding while retaining the rights boundary. No VEX recovery, conversion or permission work is required for the four-LEGO delivery.

The indexed primary [V5 Classroom Starter Kit page](https://www.vexrobotics.com/v5-classroom-starter-kit.html) and [Super Kit page](https://www.vexrobotics.com/v5-classroom-super-kit.html) advertise **CAD Files → V5 Clawbot (276-6009) → STEP Download**, plus a download-all option. Exact STEP download URL, file contents, assembly hierarchy, units, embedded copyright and file hash were **not retrieved**. These are discoverability findings from indexed official-page results, not a claimed asset acquisition.

Direct static fetch and urllib with a Mozilla user-agent returned HTTP 403; curl returned error 56; the related VEX forum and JSON endpoint also returned 403. Isolated browser access failed with no page targets, and default browser automation was denied. The [copyright notice](https://www.vexrobotics.com/copyright-notice) and [licensing EULA](https://www.vexrobotics.com/licensing-eula) were also inaccessible directly. No license grant is inferred from a “Download” button or search snippet.

The accessible primary [VEX Branding Guidelines](https://kb.vex.com/hc/en-us/articles/360044280432-Branding-Guidelines) say digital resources are freely available for promotional/private use with proper branding and commercial use must credit VEX Robotics unless otherwise agreed. The surrounding page concerns logos, artwork and style guides; it **does not explicitly license CAD or redistribution of STEP/tessellated meshes**. `branding@vex.com` is the stated contact for permission/resource questions. This evidence is not enough to clear public runtime VEX assets.

A STEP conversion route is technically available through OpenCascade, but cannot repair an unknown content license. Keep VEX CAD and any renders/conversions private until the actual asset grant is established. Community GrabCAD/SolidWorks assemblies are not a licensed fallback merely because the geometry resembles the official robot.

## Historical research unknowns and handoff

The following list records this acquisition report's original unknowns, not current release gates. Subsequent component work is documented in the [LEGO crosswalk](lego-part-crosswalk.md), and later VEX recovery remains out-of-scope historical research. See [current coverage](../validation/coverage-baseline.md) for unresolved active LEGO acceptance.

- First-seed geometry is available; exact historical friction-pin and four-pin-block mold selection remains provisional.
- Full BOM-to-geometry coverage across all five builds is not claimed. Additional lengths, gears, grippers, panels, connectors and cable routes must be matched to the manuals before acquiring their roots.
- Full-assembly transforms, insertion depths and cable routes are not supplied by the asset library and are not invented here.
- No independently licensed complete target-build MPD/LDR was established.
- VEX actual STEP bytes/download URL and public redistribution permission remain unresolved; no fake replacement geometry is proposed.
- LDConfig's individual license declaration is absent, unlike the inspected DATs.

Research performed: source retrieval, ZIP member inspection, actual per-file metadata/license extraction, dependency-graph analysis and manual-page image inspection. **No application build, tests, linters, formatters or conversion smoke checks were run.** Main-agent verification should exercise the chosen loader against the curated tree and inspect the first sourced assembly and attribution notices.
