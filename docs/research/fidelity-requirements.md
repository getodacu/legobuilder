# Fidelity requirements and source-to-deliverable assessment

Research baseline: 2026-10-20. These are **requirements, not verified application capabilities**. The full five-build application remains incomplete; research coverage must not be presented as implementation coverage. [Source register](robot-sources.md), model notes and JSON separate inspected evidence from unknowns. Recovered native CAD is not an authorized, implemented runtime asset.

## What “faithful” must mean

A credible assembly app must report fidelity by dimension, not use one blanket “complete” label:

1. **Source identity:** manufacturer, exact model, document edition/hash, manual title, PDF page and printed step are traceable. Export dates are not semantic revision numbers.
2. **Inventory and sequence:** every depicted introduction, preparation, repetition and reuse has a source-backed instance accounting rule. Unknown IDs, omitted assemblies and contradictory quantities remain visible.
3. **Geometry:** a real licensed component mesh is distinct from a verified catalog match, and both are distinct from verified assembled position. Identify provisional mold matches and diagram-derived placements.
4. **Kinematics:** joint axes, origins, coupling and limits need their own evidence. Motor encoder commands do not establish safe mechanical bounds.
5. **Simulation:** animation of an intended action is not validated contact, force, grip, sensor response or stability. App-authored demonstrations must say so.
6. **Presentation:** camera poses, staging, exploded offsets and timing may be original explanatory choices, but must never be relabeled as manufacturer steps or physical specifications.

This boundary follows the distinction between source order and approximate drawing-derived geometry made in the [observed Flatpack help](https://sael.net/flatpack/), not an endorsement or copied implementation. The [benchmark](flatpack-benchmark.md#exactness-and-rights-qualifications-in-flatpacks-help) records exactly which behaviors were observed and which were merely help-documented.

## Initial scope and complexity

Begin with a small **source-linked genuine-geometry assembly slice**, not five plausible whole-robot approximations. The inspected [Advanced Driving Base Front Part steps 1–3](https://assets.education.lego.com/v3/assets/blt293eea581807678a/blt2d17fa746ea991e5/5ec8e83df11f7e3ed6d502d7/advanced-driving-base-bi-pdf-book1of5.pdf?locale=en-us) introduce one nine-hole beam, four friction pins and two cross blocks. [Retrieved DAT roots and image comparison](geometry-assets.md#first-usable-lego-subassembly-direct-image-evidence) make this a practical first slice, but exact pin mold and cross-block historical identity remain provisional. Establish attachment positions before presenting the slice as dimensionally verified. A partial build must remain explicitly partial; do not imply the rest is implemented.

The following complexity assessment is an engineering inference from documented inventory and topology, **not measured development effort**:

| Build | Main assembly burden | Initial behavior boundary | Evidence needed beyond the manuals |
|---|---|---|---|
| Advanced Driving Base | 136 steps, 234 prepared units; four independently built modules and cable management | Differential drive plus two unloaded tool outputs; no optional tools | Full connection graph/transforms, motor zeros and wheel/contact calibration |
| Robot Hand | 28 steps, 39 units; small inventory but coupled closed-loop jaws | One opening/closing coordinate; scripted pass/stack illustration only | Pivot coordinates, coupling solution, safe limits, aperture and grip/contact measurements |
| Quality Check | 30 steps, 55 robot units + eight sample bricks; integration is shown | Two expressive head coordinates, color events and eye lights | Upper-body/output mounting transforms, A/F physical-axis assignment, cable-safe travel |
| Package Sorter index2019 | 77 robot steps + three sample steps; 158 robot callout units + eight sample units | Two-axis yaw/fork sequence and documented magenta check | Linkage pivots, package/fork contact, encoder zero mapping, limits and clearance |
| V5 Clawbot historical2018 | 41 steps; metal fasteners, repeated preparation and conflicting inventory; preassembled claw internals now recovered in native CAD; no Cut callout | Differential drive, arm and coupled claw as uncalibrated kinematics | Scoped CAD conversion/use permission, manual/CAD revision comparison, pin crosswalk, procurement accounting, bounds and pickup physics |

Primary evidence and exact document links: [Advanced Driving Base](advanced-driving-base.md), [Robot Hand](robotic-hand.md), [Quality Check](quality-check.md), [Package Sorter](package-sorter.md), [selected VEX historical2018 manual and native CAD recovery](vex-cad-recovery.md). [Original VEX Rev6 research](vex-clawbot.md) is retained as an alternate, not merged into the selected sequence. A small part count does not make a linkage or grasp simulation physically simple. Conversely, many static fasteners need not become independent simulation bodies.

## Required source and inventory behavior

- Every selectable build must display its manufacturer/model, edition, exact source links and a clear coverage statement. Incomplete reconstruction must be visible before playback, not buried in a disclaimer.
- Use stable build/document/step/instance identities already recorded in JSON. Document page indices are one-based; printed step numbers can restart between books. Unnumbered battery preparation, warnings and wiring diagrams must not become invented numbered steps.
- Keep **Package Sorter index2019** and **lesson2021** separate: 77 versus 76 robot steps, 80 versus 79 including samples. The canonical research dataset is index2019. Do not merge the changed two-peg inventory or renumber source evidence. [Edition evidence](package-sorter.md#scope-and-edition-decision).
- Count a reused module once. Advanced Driving Base's **234 prepared units**, Hand's **39**, Quality's **55 + eight samples**, and Sorter's **158 + eight samples** are callout sums, not manufacturer-published model counts. Sorter's unnumbered battery preparation remains separately identified. Show robot and loose-object totals separately.
- For VEX, select **historical2018: manual 276-6009-750 Rev1 ©2018 + CAD 276-6009-000 Rev1 dated 2018-04-02**. Document and assembly revisions are separate namespaces; same-era selection is not verified exact equivalence. Retain printed-list quantities and step additions as distinct records, with visible conflicts. Step 37's preassembled claw is omitted from manual inventory, but native CAD now reveals its internal geometry/hierarchy; this does not establish a certified procurement BOM. Avoid double-counting CAD pieces added later in the manual. Resolve historical pin **228-3943-086** versus CAD **228-2500-086 Rev3** before claiming an exact crosswalk. Inventory/step differences **30/27 screws, 30/29 nuts and 8/7 spacers** are corroborated by CAD installed counts, not verified spares. [Exact hierarchy, BOM distinctions and conflicts](vex-cad-recovery.md).
- Never fill unknown design IDs, element IDs, mold revisions, dimensions or matrices with plausible values. Descriptive keys are not catalog identifiers. Geometry selection must retain the basis for a provisional visual match.

## Required geometry and assembly behavior

Use real attributable part geometry where acquired and licensed. The [23-root LDraw acquisition](geometry-assets.md#retrieved-ldraw-inventory) is a component seed, not complete BOM coverage. Preserve source-local coordinates and nested dependencies; do not independently recenter parts and lose mating origins. LDraw uses a right-handed, negative-Y-up coordinate system; apply one documented outer conversion and scale rather than a reflection or guessed per-part corrections. The approximate 0.4 mm/LDU relation must not be advertised as metrology. Preserve fixed subpart colors, inherited color semantics, winding/BFC and mirrored transforms. [Manifest and normalization evidence](data/geometry-assets.json); [LDraw file format](https://www.ldraw.org/article/218.html).

The subsequent [part crosswalk](lego-part-crosswalk.md) supplies genuine geometry for all four LEGO builds' visual families: 64 selected roots and 492 required dependency DATs. Use its contextual mappings and correction records, not obsolete visual-key names; quantities remain unchanged. Component availability does not establish assembled transforms or calibrated kinematics.

VEX's official full Clawbot, standalone claw and motor STEP files have been retrieved, with native BREP, nested placements and internal claw components recorded in [the CAD recovery report](vex-cad-recovery.md#native-hierarchy-and-internal-claw-evidence) and [JSON](data/vex-cad-recovery.json). This supersedes the earlier blanket no-CAD finding, not the permission or revision blockers. Preserve source-native hierarchy and distinguish CAD occurrences from procurement pieces. Do not generate or use converted VEX app geometry until scoped conversion/use permission is established; localhost-only serving does not supply it. Native STEP placements are CAD-derived source evidence, not proof every selected-manual operation matches the modeled pose. Require documented per-instance comparison or vendor confirmation before claiming exact equivalence.

For each implemented operation, record participating instance IDs, parent changes, before/after transforms, attachment references and source page/step. Numeric placements need an explicit provenance category: acquired CAD, measured attachment, or diagram-derived approximation. Validate fit before calling it exact. A source camera turn is not a movement of physical parts. A completed subassembly must retain its internal transforms while being mounted.

Presentation animations may illustrate insertion/rotation but must not imply validated collision-free tool access. The selected historical2018 VEX sequence has **no Cut/notch instruction**; do not introduce the [Rev6 step 28](https://content.vexrobotics.com/docs/276-6009-750-Rev6.pdf#page=18) notch into its CAD or playback. If offering Rev6 separately, retain its parent/mentor-help warning and disclose that no dimensioned notch drawing or Rev6 CAD equivalence was recovered. Never invent a safe cutting specification. Historical step 41 uses **600 mm arm / 900 mm claw** cables; Rev6 reverses those lengths. Keep both sequences' wiring and inventory records separate.

## Required playback and inspection behavior

Use the [Flatpack interaction observations](flatpack-benchmark.md#fourteen-topic-comparison) as a benchmark for clarity, not as code/assets to copy:

- Provide an original workbench layout with readable current operation, source reference, selected part and transport. Keep attachment sites visible. On narrow screens, collapse optional panels without removing warnings or source access.
- Previous/next, play/pause and a labeled, focusable timeline must address real source-step boundaries. Seeking backward or forward must reconstruct the same assembly state; stop playback on manual seek. Fractional animation progress is not an official substep.
- Keep user orbit, zoom, pan and fit/reset available. Author explanatory camera poses separately from robot transforms; camera changes must not change assembly state.
- Selection must identify the actual instance, known catalog identity and confidence. Use a visible outline and text, not color alone. Installed counts must derive from instance membership/state, not hand-maintained percentages.
- Shaded and high-contrast inspection modes must share exactly the same transforms/state. Exploded inspection must preserve and restore the selected assembly step; its offsets are presentation-only, not disassembly instructions.
- Provide visible button names, keyboard-operable equivalents, focus indication, readable contrast, reduced-motion handling and discoverable help. Do not claim benchmark accessibility conformance, frame rate or physical-device coverage; those were not established.
- Link official manuals/page references. Do not reproduce scans or program artwork until rights are established. Reference-only pages must stay reference-only even if a source link can seek to a mapped operation.

These are requirements, not a report that any controls currently exist. The benchmark did not verify standalone one-step Play, a persistent selected outline, collision analysis or numerical measurement tools; RoboBuild proposals must not be described as observed benchmark facts.

## Simulation fidelity ceiling

The manuals and inspected lesson programs support **qualitative mechanism and example-program demonstrations**. They do not currently support calibrated physical simulations. Keep assembly viewing and behavior demonstration separately labeled.

- **Driving Base:** infer differential planar motion from two independent driven wheels; no lateral actuator. Do not invent tool attachments or loads. Two Color Sensors do not supply a calibrated floor/lighting model.
- **Hand:** coupled jaws, one powered coordinate. No independent fingers or installed Force Sensor. Preserve prose-versus-SVG control disagreement; 0.2-second motor actions do not establish grasp endpoints.
- **Quality Check:** fixed input sensor and expressive sensor head, not automatic quality metrology. The inspected programs use eye-light output; installed Distance Sensor capability is not proof of distance-triggered inspection. Do not invent color accept/reject truth tables.
- **Sorter:** yaw A, fork lift F, Color Sensor D; no conveyor or independent claw. Preserve SVG/Python ordering and speed-unit differences. Example angle targets are not mechanical stops, and one magenta test is not arbitrary multi-bin sorting.
- **VEX:** two drive outputs, arm and coupled claw. No powered wrist or strafing. The 7:1 external arm reduction is derived from pictured tooth counts; motor cartridge, safe travel, payload and grip limits remain unknown. Native CAD supplies internal rigid geometry/placements, not mates, motion limits or a calibrated contact model; the 2020 standalone claw is not verified unchanged from the 2018 embedded claw or Rev6.

Each item is grounded in the corresponding [source register entry](robot-sources.md). Before any physically accurate claim, obtain verified mass/inertia, joint limits, drive configuration, friction/contact parameters, cable clearances, sensor geometry/noise and representative measured validation. Unsupported parameters must be openly app-authored assumptions, never defaults disguised as manufacturer data.

## Source-to-deliverable traceability

| Evidence available now | Supports now | Does not yet support | Required deliverable evidence |
|---|---|---|---|
| Five-model notes plus hashed manual records in [research data](data/) | Model/revision selection, page/step audit and bounded quantity statements | Implemented sequencing or complete procurement BOM; VEX manual omits the preassembled claw and CAD is not a shipping BOM | Each shipped step and instance mapped to its exact source record, with omissions/conflicts displayed |
| Per-step callouts and relational connection observations | Order, module reuse, component families and documented mounting relationships | Exact hole-index graph, insertion depths or whole-build matrices | Per-instance geometry mapping and provenance-tagged assembly transforms |
| [LDraw files and license manifest](data/geometry-assets.json) | Acquired component geometry/dependencies and header-level license evidence | Five complete assemblies or automatic mold identity | Complete required geometry closure, attribution/notice bundle, checked conversion and part crosswalk |
| [Recovered official VEX STEP hierarchy and placements](vex-cad-recovery.md) | Native full assembly, motor and internal claw geometry; CAD-derived nominal dimensions and rigid placements | Authorized mesh conversion/use, exact manual/CAD revision equivalence, pin crosswalk, certified procurement BOM or physics | Scoped conversion/use grant, documented manual-to-CAD instance/placement comparison, retained source identities and separate procurement accounting |
| Official lesson prose, inspected SVGs and Sorter Python source | Specific example control sequences and documented sensor use | Calibrated dynamics, general autonomy, all lesson video behavior | Source-specific scripted demonstrations; separately validated physical parameters if physical claims are made |
| [Flatpack browser observations](flatpack-benchmark.md) | Concrete interaction comparisons and proposed original requirements | Reusable app assets/code or RoboBuild UX/performance/accessibility coverage | Implemented controls with deterministic state and exercised interaction/accessibility evidence |
| Copyright/legal records and actual CAD download terms | Distinction between offered private native inspection and separate app conversion/use | Scoped VEX conversion/use permission, even for localhost, or public redistribution clearance for CAD/manuals | Applicable file-specific permissions, separate distribution scope and retained attribution before conversion or inclusion |

**Coverage assessment:** documentation and structured research exist; LDraw component acquisition is partial, and official VEX native assembly/claw/motor geometry has been recovered. These records do not establish authorized VEX runtime conversion, complete five-build assembly reconstruction, executable timelines, inventory UI, simulation or user-facing fidelity disclosures. The full application remains incomplete. No app tests, visual comparisons, device checks or physics validation have been exercised by this consolidation. No percentage of complete/fidelity coverage is justified.

## Release-claim boundaries

A faithful five-robot deliverable requires all five locked editions to be traceable through their full supported sequences, with honest unresolved boundaries, not a generic robot substituted for any model. If exact geometry or redistribution permission is unavailable, that limitation is a real prerequisite—not permission to ship copied assets or quietly replace parts with boxes. Descriptive metadata, official source links and clearly labeled partial research can remain available without pretending the assembly is complete.

Manuals, page renders, benchmark screenshots and source archives remain private. [LEGO legal notice](https://education.lego.com/en-us/support/legal-notice/) and [Fair Play](https://www.lego.com/en-us/legal/notices-and-policies/fair-play/) do not establish a blanket manual/artwork license. For VEX, use the official [copyright notice](https://www.vexrobotics.com/copyright-notice), [Site Terms page](https://www.vexrobotics.com/terms-of-use), actual embedded [Terms and Conditions](https://www.iubenda.com/terms-and-conditions/89449486) and [Licensing EULA](https://www.vexrobotics.com/licensing-eula), not branding guidance as a CAD license. Offered Download/Preview controls support private native inspection, but no explicit grant for a separate app's STEP-to-mesh transformation/use was established; **localhost and private storage do not grant it**. Request scoped permission/clarification from **legal@vex.com** before conversion/use; public redistribution and bundled manual images require separate clearance where applicable. See [the detailed rights evidence](vex-cad-recovery.md#retrieval-rights-versus-useconversiondistribution-rights). Component CC licensing must be satisfied independently of manufacturer trademarks and instruction copyright.

No implementation, build, lint, tests or formatters were run for this report.
