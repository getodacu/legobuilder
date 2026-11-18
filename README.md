# RoboBuild

Independent SvelteKit/Three.js robotics assembly workbench. The robot meshes come from [attributed, selected LDraw component data](docs/research/geometry-assets.md), not manufacturer PDFs or unlicensed model conversions. Assembly placement confidence is reported separately from authored step coverage.

## Run

Use Node.js 24.19.x with npm. The repository includes the generated model manifests, preview images, and licensed geometry needed to run and build the app from a fresh checkout.

```sh
npm ci
npm run dev -- --host 127.0.0.1 --port 5179 --strictPort
```

Open `http://127.0.0.1:5179`. Run `npm run build` to create the static site in `build/`.

## Contribute

Run `npm run check` and `npm run test:unit` before opening a pull request. For browser tests, run `npx playwright install chromium` and then `npm run test:e2e`. The browser suite starts its own servers on ports 5187 and 5188.

After editing model definitions, run `npm run models:build` to refresh the published manifests. To regenerate learner part thumbnails, install Playwright Chromium and run `npm run models:part-previews -- http://127.0.0.1:5179/` while Vite is running. Repacking the LDraw library with `npm run assets:prepare` requires the original hash-verified research files. See the [asset library guide](docs/architecture/asset-library.md).

## What is playable

| Model / official edition | Authored numbered steps | Tracked source callout units | Physical placement verification | Demonstration |
|---|---:|---:|---|---|
| Advanced Driving Base, five 2019 books | 136/136 | 234 | First three steps/seven units and a source-backed native rear-join audit; whole-build clearance unchecked | Differential drive, two independent tool outputs and scripted course/sensor inputs |
| Robot Hand, Pass the Brick 2019 | 28/28, plus wiring stage | 39 | Fits unchecked | One F-powered coupled grip/hold/release; original non-BOM block |
| Quality Check, Idea Detector + Robot Head 2019 | 30/30 | 55 robot + 8 sample | Fits and physical A/F motor-axis assignments unchecked | Two-axis inspection response; RoboBuild extension |
| Package Sorter, Robot + Base + Packages 2019 | 80/80 | 158 robot + 8 samples | Nominal native bearing, fork, rod and pedestal seats checked; loaded passive contact branch and whole-build clearance unverified | **Motor-command replay only; no actual package pickup or sorting** |

A tracked unit is a prepared part callout from the cited manual, not a claim about every molded element inside a motor, hub, wheel or prepared sample. `authored` means the instruction and its source-linked operations exist; it does **not** certify physical fit. All four LEGO workbenches are available and interactive. The [ADB rear-join mismatch is resolved](docs/research/adb-join-resolution.md) by official physical-build footage and actual native mounting features, without changing part counts or stretching geometry. Hand and Quality render qualitative captive-lead paths; lengths and dynamic clearances are not measured. Remaining limits include whole-build interference/clearance, Hand calibration and retention, Quality's exact flexible support and physical port-to-axis mapping, and Sorter's disabled capture/routing. See [robot sources](docs/research/robot-sources.md) and [per-robot reports](docs/validation/). Historical VEX research is outside active scope.

## Controls

**Start Robot Hand** opens the shortest guide: 28 numbered instructions plus wiring. Each guided instruction shows the required pieces, counts, warnings and official pages. **Watch this step** holds the instruction after playback, and **Next step** moves on only when you choose it. **Back a step**, `[` / `]` and Space provide equivalent navigation and playback. Use the official instructions for the real build; never force pieces.

**Parts** opens a searchable list grouped by geometry, color, manufacturer identity and robot/sample scope. It opens in a native dialog on smaller screens. **Selected part** exposes the official page, focus and isolation controls; **Technical details** lists instance IDs, geometry references, mounting coordinates and evidence.

**Workshop tools** shows the full timeline, speed, reverse, milestones, visual styles, overlays and **How it works**. Both modes use the same assembly and renderer. **Reference & credits** and step navigation work even if geometry or WebGL fails; **Try 3D again** rebuilds only the viewer.

**Reference & credits** contains the original-manual browser, source-page mappings, coverage limitations, inventory accounting, geometry licenses and material evidence. Reading a manual page does not change the build; choosing its mapped step does. Original manuals are linked, not redistributed. Relevant wiring, clearance and unresolved-fit warnings also appear directly in the affected instructions.

**Watch what moves** opens a paused simulation after the final supported stage. **More controls and technical notes** contains scenario controls and evidence limits. Package Sorter provides motor replay only; pickup and sorting remain unavailable. Reaching the end of a guide does not certify physical fit or confirm that a physical robot was built.

The browser keeps one anonymous checkpoint per build. **Continue {name}** restores the saved time and held instruction, paused. Use **Start over** in the guide header to clear that guide’s checkpoint and return to its first step. When browser storage is blocked, progress lasts only until the page closes or reloads.

## Learner validation

Before calling the guide child-ready, run a supervised session with learners roughly 8–12. Ask them to start the recommended build, choose between similar-looking parts, replay a step without losing it, resume after an interruption, and explain what the demo does. Record which tasks needed an adult hint. Browser tests do not cover this.

## License

RoboBuild's original work is available under the [MIT License](LICENSE). See the [third-party notices](THIRD_PARTY_NOTICES.md) for LDraw assets, rendered previews, the bundled font, and manufacturer references.
