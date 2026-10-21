# RoboBuild visual design

Status: visual design specification, not a claim that every source pose is accurate. Read [product requirements](product.md), [testing](testing.md), [current coverage](../validation/coverage-baseline.md) and the real-browser captures in [validation](../validation/) together.

## Identity: the laboratory workbench

RoboBuild is an original precision-learning workbench, not a toy-store landing page or a copy of Flatpack. Use dark graphite panels, a lighter slate 3D stage, peach actions and bright teal mechanical feedback. Actual licensed robot geometry is the subject. Preserve component colors and use neutral studio illumination plus a cool rim light to distinguish black pins, axles and tyres from the background. Do not use generated robot art, unrelated robots, copied benchmark compositions, instruction scans, fake CAD, decorative stock machinery or fabricated VEX previews.

The header wordmark is plain typeset **RoboBuild**, with a small original two-line alignment mark; no manufacturer logo imitation. A small `ASSEMBLY WORKBENCH` descriptor and model/edition establish context. Keep a factual manufacturer attribution and non-endorsement statement in Sources, not a marketing badge implying affiliation.

### Design tokens

| Token | Value | Role |
|---|---|---|
| Canvas / page | `#0F141B` | Dark graphite field |
| Panel / elevated | `#171F29` / `#222D3A` | Instruction surfaces and raised controls |
| 3D stage | `#303E4E` | Lighter slate behind authentic component colors |
| Primary ink | `#EDF2F7` | Primary text and instrument labels |
| Muted ink | `#B2BFCE` | Secondary text; never low-opacity body copy |
| Rule / control boundary | `#3C4B5D` / `#6F8197` | Passive dividers and explicit input boundaries |
| Peach | `#FF936F` | Primary actions with dark text, timeline thumb, moving parts |
| Mechanical teal | `#65DFCF` | Selected connections, joint feedback, inspection emphasis |
| Warning ink / field | `#FFD187` / `#352B1C` | Warning text with icon and explicit wording |
| Focus | `#9AC4FF` | Visible outer keyboard-focus ring |

These are authored starting values, not evidence of measured accessibility. Verify every actual text/background and control-state combination to WCAG 2.2 AA: 4.5:1 normal text, 3:1 large text and meaningful non-text boundaries. Do not depend on the pale rule for input boundaries. Use text/icon/outline in addition to hue. A selected teal part must remain legible against teal LEGO geometry.

Use native system UI: `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`. IDs, counts, page/step numbers and angles use `ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`, with tabular numerals. No font download is required. Body 14–16 px, secondary metadata no smaller than 12 px, model title 24–30 px, current instruction 18–22 px. Prefer sentence case to walls of technical capitals. Space on a 4 px rhythm; use 8/12/16/24/32 px gaps, 8 px panel radii, and subtle contact-like shadows only for raised drawers/popovers. Avoid glass effects, gradients as hierarchy and gratuitous dashboard widgets.

## Catalog

Show five named builds in a responsive grid, ordered Advanced Driving Base, Robot Hand, Quality Check Robot, Package Sorter and V5 Clawbot. Every card has manufacturer, locked edition, documented step scope, quantity scope, reconstruction coverage and source access. Render these as real data, not text baked into an image.

For an available reconstruction, use a render from its actual runtime geometry and hierarchy, consistently framed at a three-quarter view on the same slate background as the live viewer. A partial reconstruction shows only that actual slice with a conspicuous `Partial reconstruction — n/N source steps` label; never frame a component pile as the completed robot. An unimplemented build has a quiet typographic `Reconstruction not available` panel, not invented geometry. VEX has a graphite outlined source-record tile with `App geometry permission blocked`, selected historical2018 edition and `View sources`; no robot silhouette, fake total, mesh, clickable Play or simulation marketing. All five entries remain discoverable. See the product source table for exact count language.

## Workbench composition

At desktop widths of 1200 px and above, use a full-height application shell: compact model/source header, three working panels, and a persistent bottom timeline. Suggested grid is `296px minmax(0, 1fr) 320px` with 16 px outer spacing and 12 px gaps. The center must be allowed to shrink; never size it using an unbounded intrinsic canvas width. Both side panels can collapse, giving the viewport their space. Keep the source badge and current step visible even when panels collapse.

1. **Left — Instructions / Sources.** Book/module breadcrumb, printed step and one-based PDF page, original operation summary, required hardware cards, warning/uncertainty callout, authored schematic and official-source links. A source-page selector and mapped-figure buttons are distinct controls. No copied manual thumbnail is implied by the word “instructions.” Reference-only pages explicitly say that they do not advance assembly.
2. **Center — 3D workbench.** Actual assembly with clear active attachment point, small view-mode toolbar, orbit/pan/zoom affordance and a persistent camera-override indicator. Contextual part labels use leader lines and avoid covering the mating hole. Selected instance outline plus an unobtrusive anchor mark connect scene to inspector. A compact legend explains moving, staged, installed and selected states in words as well as color.
3. **Right — Inventory / Inspection.** Tabs for searchable inventory and selected instance. Robot installed/total counts are separate from sample counts. Each row has a shape thumbnail rendered from the actual part geometry, corrected family name, known manufacturer ID if any, geometry ID, quantity and confidence. Inspector shows instance ID, parent/subassembly, connections, mount points and source evidence. A geometry ID is labeled `Geometry (LDraw)`, never `LEGO part number`.
4. **Bottom — Timeline.** Primary Play step, secondary Play all, Pause while running, Reverse, Previous/Next, current source-step label, labeled seek range, milestone menu and speed selector. Keep distinct text or accessible names for all actions; do not hide Play all behind the same ambiguous triangular icon. Include a clearly labeled assembly/simulation mode switch with a visible lock reason until eligible.

Use responsive text truncation only for secondary IDs with full text available on focus/expansion. Never truncate the meaningful operation, warning, blocker or edition distinction. Busy/loading/error states occupy the relevant region without shifting transport controls. Errors name the asset/model and recovery action; no silent blank canvas or endless spinner. WebGL2 failure offers sources and accessible inventory/text guidance, not a fabricated 3D fallback.

## Scene direction

The scene is a workbench, not a furnished room: neutral horizonless ground, a subtle millimeter grid available on demand, and soft contact shadows. Scene units are millimeters; the approximate LDraw conversion is not a measurement claim. Use restrained neutral studio illumination and authored plastic/rubber/metal categories. Preserve source colors and fixed subpart colors; source-supported magenta is not a random orange accent. Keep black pins, holes, axle profiles and small connectors readable without bleaching light parts.

- **Studio:** material color, restrained highlights, ambient/contact shadow; no distracting bloom, depth of field or chromatic effects.
- **Technical:** high-contrast faces and edges with readable hidden relationships only when explicitly enabled. Same geometry, transforms, selection and timestamp as Studio; it is not a second reconstruction.
- **Explode:** clearly labeled presentation inspection, with reversible separation vectors and leader lines. Preserve the saved assembly timestamp and only include instances present in that state. Do not jump to a completed robot. Offset strength may be adjustable if exposed, but any such slider must work and reset. It must not imply a source-authorized disassembly path.
- **Isolate:** isolate selected part or subassembly without changing counts, hierarchy or timeline. Always show `Exit isolate`; uninstalled inventory entries remain inspectable as labeled part previews rather than fictitiously installed parts.
- **Overlays:** labels, parent/child relationships, attachment/mount points and educational joint/force-path explanations are individually switchable. Use dashed lines for inferred relationships, solid lines for source-backed relations, and a text legend. Do not draw force vectors as measured physics. Hide irrelevant overlays rather than burying the assembly in labels.

Automatic camera poses frame the active operation, not an arbitrary screenshot composition. User orbit/pan/zoom immediately takes ownership and displays `Manual camera · Resume auto camera`. Fit assembly, Reset view and Focus selection have distinct labels and results. Camera movement must not rotate physical parts. Keep moving insertion hardware visible from the authored pose; if occluded, a source-linked alternate view is preferable to false part transparency by default.

## Responsive behavior

- **768–1199 px:** center scene and bottom transport stay primary; side panels collapse into named Instructions and Inventory buttons. Open one panel at a time as a non-overflowing side drawer. Preserve the current selected tab and scroll position when switching.
- **Below 768 px:** header stacks compactly; canvas occupies remaining useful space above the sticky transport; instructions and inventory open as scrollable bottom sheets. Put essential step/warning status above transport. A sheet has an explicit close button, a readable title and correct focus handling. Avoid a minimum canvas width. Source access, quantity caveats and keyboard help remain available, not removed with CSS.
- **320 px width and 200% zoom:** wrap transport into rows or use an accessible overflow menu for secondary actions; primary playback, step status and Pause remain visible. Document width must not exceed the viewport. Safe-area padding protects controls from device insets. Test portrait and landscape, not merely a CSS screenshot at one width.

Touch controls need at least 44 × 44 CSS px targets, separated controls, pinch zoom and discoverable pan/orbit guidance. Do not depend on hover, right-click or a multi-touch gesture without a visible/keyboard alternative. Scrollable panel content must not unintentionally orbit the scene.

## Accessible feedback and motion

Provide a skip link, landmark regions, visible focus, semantic buttons and native range/select controls where they fit. The canvas has a meaningful accessible label and a parallel DOM inventory/step/relationship inspector; no critical information exists only in pixels. Selection changes announce the selected family/instance and installation state. Announce settled step changes politely, not every animation frame. An unobtrusive Keyboard help button opens searchable/readable shortcut guidance and all gesture equivalents.

Reduced motion defaults to immediate step/camera transitions and no automatic camera flights, pulse loops or ambient animation. Users may explicitly start a mechanism demonstration, with a visible Pause and a reduced-motion explanation; do not start it automatically. Never use flashing status. Loading respects reduced motion too. Keyboard/input guards, focus restoration and exact control behavior are specified in [product.md](product.md), and must be tested rather than assumed from appearance.

## Required visual evidence

Capture catalog and each implemented model at first, intermediate, difficult and final source steps, plus Technical, Explode and an eligible simulation state in an actual browser. Include mobile drawers and a keyboard-focus view. Record model/edition, timestamp, viewport, mode and evidence category beside each capture. Keep official manual imagery private. No design render, private research screenshot or generated robot image counts as evidence of the shipped scene. Acceptance and resource measurements follow [testing.md](testing.md); polished styling cannot turn a permission-blocked or partial build into a complete one.
