# RoboBuild

Independent SvelteKit/Three.js robotics assembly workbench. The robot meshes come from [attributed, selected LDraw component data](docs/research/geometry-assets.md), not manufacturer PDFs or unlicensed model conversions. Assembly placement confidence is reported separately from authored step coverage.

## Run

```sh
npm ci
npm run assets:prepare
npm run models:build
npm run dev -- --host 127.0.0.1 --port 5179 --strictPort
```

Open `http://127.0.0.1:5179`. To create a static distributable, run `npm run build` after asset preparation. Checks: `npm run check`, `npm run test:unit`, `npm run test:e2e` (Playwright Chromium). The browser suite uses port 5179; stop another process occupying **that** port before running it, or let Playwright reuse this project's running server outside CI.

## What is playable

| Model / official edition | Authored numbered steps | Tracked source callout units | Physical placement verification | Demonstration |
|---|---:|---:|---|---|
| Advanced Driving Base, five 2019 books | 136/136 | 234 | First three steps / seven units checked nominally; later joins and interference unchecked | Differential drive, two independent tool outputs and scripted course/sensor inputs |
| Robot Hand, Pass the Brick 2019 | 28/28, plus wiring stage | 39 | Fits unchecked | One F-powered coupled grip/hold/release; original non-BOM block |
| Quality Check, Idea Detector + Robot Head 2019 | 30/30 | 55 robot + 8 sample | Fits and physical A/F motor-axis assignments unchecked | Two-axis inspection response; RoboBuild extension |
| Package Sorter, Robot + Base + Packages 2019 | 80/80 | 158 robot + 8 samples | Fits and compound fork linkage unchecked | **Motor-command replay only; no actual package pickup or sorting** |
| V5 Clawbot, historical 2018 Rev 1 | 0/41 | No reliable total asserted | No app model | **Unavailable:** scoped CAD conversion/use permission or an independently licensed revision-compatible asset is required |

A tracked unit is a prepared part callout from the cited manual, not a claim about every molded element inside a motor, hub, wheel or prepared sample. `authored` means the instruction and its source-linked operations exist; it does **not** certify physical fit. The first four workbenches are interactive; VEX remains a source/limitations card rather than a counterfeit model. See [robot sources](docs/research/robot-sources.md), [per-robot reports](docs/validation/), and [VEX rights findings](docs/research/vex-cad-recovery.md).

## Controls

Choose a model, select a source step in Instructions, then use Previous/Next, Play/Reverse, or drag Assembly position. Counts commit only when individual hardware seats, and reverse or arbitrary seeking recomputes the same scene. Click an inventory entry or part in the canvas to inspect it. Studio, Technical, Explode, and Inspection use the same scene and timestamp; Fit whole, Focus active, Reset view, orbit, pan and zoom work in the center scene. The **?** button lists keyboard shortcuts. Finish the entire authored assembly to enter that model's supported demonstration; source versus app-authored motion, unverified dimensions, and missing capabilities remain labeled there. Sample parts and original simulation props do not inflate the robot bill of materials.

The catalog retains each workbench's exact paused assembly position **for this visit** when returning with **Back to build catalog**; reopening resumes it. Scrubbing backward also reduces catalog progress. Reloading the page clears visit progress, and completing authored steps does not change the separately reported physical-fit status.

**View options → Educational explanations** opens graph-backed notes for joint axes, motor rotation, gears, transmission direction, gripping linkages, sensors, structural connections and assembly prerequisites. Inspection actions select the actual CAD component; prerequisite actions seek the original source step. Motor coordinates and sensor evidence follow reversible simulation time. Unsupported mechanisms and scripted sensor inputs are identified rather than inferred.

Original instructions are linked rather than redistributed. Each workbench exposes part-level source references and component licensing. WebGL2 is required; performance and collision clearance have not been certified across devices.
