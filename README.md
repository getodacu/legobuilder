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

Choose a robot and select **Start building**. The guide opens with the current instruction, grouped required components and a focused 3D view. **Previous**, **Play step / Pause / Resume** and **Next** stay at the bottom of the screen. **Jump to step** selects an instruction; **More** opens speed, Play all, Reverse and milestone controls. The progress slider seeks any point in the animation. Progress describes the guide, not a completed physical robot, and animation duration is not a building-time estimate.

**Parts** opens a searchable list grouped by geometry, color, manufacturer identity and robot/sample scope. Expand a group to select an individual piece; its color, assembly, official instruction link, focus and isolation actions appear in **Selected part**. Instance IDs, geometry references, mounting coordinates and evidence are available under **Technical details**. Robot components and sample components retain separate counts.

**View options** contains Studio, Technical, Explode and Inspection styles, labels, joint axes, connections and **How it works**. Focus active, Fit whole, Reset view and manual orbit/pan/zoom use the same scene and timestamp. The **?** button lists camera and keyboard controls. On phones, the model sits above a scrollable instruction pane and playback stays visible.

**Reference & credits** contains the original-manual browser, source-page mappings, coverage limitations, inventory accounting, geometry licenses and material evidence. Reading a manual page does not change the build; choosing its mapped step does. Original manuals are linked, not redistributed. Relevant wiring, clearance and unresolved-fit warnings also appear directly in the affected instructions.

The movement demo becomes available at the end of the complete guide, including preparation and wiring stages. Demonstration inputs and physical-fit limitations remain labeled. Package Sorter provides motor replay only; pickup and sorting remain unavailable. **How it works** follows the declared joints, motor bindings, sensors, connections and step prerequisites, and its inspection actions select actual components.

The catalog retains each guide's exact paused position **for this visit**. **Continue building** resumes it, and seeking backward also reduces catalog progress. Reloading clears visit progress. Completing the guide does not change the model's physical-fit verification status.

WebGL2 is required; performance and collision clearance have not been certified across devices.
