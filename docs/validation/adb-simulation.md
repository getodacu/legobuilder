# Advanced Driving Base simulation browser contract

`tests/e2e/simulation.spec.ts` passed within the final **18/18** Chromium all-spec union, including completed source assembly/real MPD reuse, guarded course and deterministic scrubbing, independent C/D gear motion, typed B/F events, reset and320px controls without horizontal overflow. The full-course regression passed1/1 alone after correcting history-dependent studio lighting and now checks same-pixel assembly return/course re-entry instead of a brittle orange-column classifier. This does **not** constitute mechanical-fit approval, collision physics or manufacturer validation. Simulation shares the completed model and WebGL canvas.

## Entry, source accounting and scene continuity

- Open Advanced Driving Base from the catalog. The former first-three-step endpoint (10,000 ms, seven installed units) remains locked, as does one millisecond before the current complete assembly endpoint. The endpoint is read from the real assembly range, not a stale hardcoded total duration.
- At the endpoint, require **234/234 robot units, zero remaining and 136/136 source steps**, plus 234 installed inventory rows. Only then is **Enter post-assembly demonstration** enabled.
- Keep the original accessible WebGL canvas element across entry, exit and re-entry. Observe actual successful component MPD and original course-marker GLB requests, and require entry to reuse those assets rather than load replacement robot geometry.
- Require visible disclosure that complete authored coverage does not mean a fully verified robot, and that scripts, color inputs and markers are RoboBuild extensions outside the official inventory.

## Native controls and deterministic course

The **Post-assembly simulation** region exposes **Scenario**, **Play demonstration**, **Pause**, **Reverse**, **Reset time**, **Restore scenario**, **Speed**, the millisecond **Simulation position** range, and **Return to assembly end**. Simulation starts paused at zero. Seeking pauses playback. Reverse and forward playback must actually change the range; pausing must stop it.

The course test samples zero, 6,000 ms, 12,000 ms, repeated random/reverse seeks and the range endpoint. The A/E wheel-angle oracle independently integrates the declared RoboBuild speed phases (straight 0–4 s, differential 4–6 s, straight 6–10 s, opposite differential 10–12 s, straight 12–16 s, then hold). It does not invoke the application sampler as its expected result.

The visible **Simplified collision stop, no physics** notice is required. If it reports an actual stop, its disclosed cutoff bounds the wheel reference rather than assuming the original command plan is unstoppable. C/D tool commands and typed color history remain independent of that wheel stop. These checks establish neither rigid-body collision physics nor traction, contact, slip or calibration.

**Reset view** followed by **Fit whole** supplies a consistent oblique course view. Fresh canvas screenshots identify four separate orange marker projections in simulation and none in assembly. Repeated timestamps must restore sampled readings and substantially identical robot pixels while those marker projections remain fixed. Screenshots also require meaningful actual robot motion through the course. The marker check uses the original orange/white course design and separated projections in that deliberate view; it is not a general object-recognition or geometry-counting API.

## Independent motors and actual geometry

Expand **Motor commands, sensor inputs & source limitations**. The native **Motor / physical output** selector must expose the four declared physical ports A, E, C and D. **Command**, **Target (rad/s)**, **Duration (ms)** and **Replace motor plan & reset** author a selected motor plan and reset time without replacing the other motors' plans.

The tests select actual inventory instances through **Inventory & inspection**, **Inventory**, the searchbox, **Isolate part** and **Focus active**:

- The actual `left-wheel` must visibly rotate under its original drive plan. Refocusing the same isolated wheel removes chassis translation from the before/after comparison.
- Native zero-speed A/E plans isolate tool behavior from drive motion. The actual isolated wheel must remain visually unchanged while D is commanded.
- A D speed plan of 0.5 rad/s changes the actual `front-gear28` geometry at one second, with A/E/C readings unchanged.
- A C speed plan of −0.4 rad/s changes the actual `rear-output-gear`, preserving D's sampled angle and rendered gear at the same timestamp. Technical mode supplies an additional real-geometry screenshot.

These are the declared pinned output gears and powered wheel, not invented tool accessories. Fresh screenshot comparisons ignore small RGB/antialias differences; no historical golden image is treated as a source-fit oracle. Installed source counts must stay unchanged throughout.

## Typed B/F color events, reset and restoration

The expanded controls expose native **Sensor** and **Color** selectors and **Record color event**. Both B and F must be present as declared scripted inputs. At one second the test records B/red and F/blue, checks current readings and typed log entries containing timestamp, port, `color` type and `scripted-input` basis, then seeks before, at and after those events. Original future events at six seconds (black) and twelve seconds (white) must still supersede those edits.

**Reset time** returns to zero but retains all four motor edits and two color edits; seeking to one second restores the edited motor/sensor state. **Restore scenario** resets time, clears accepted manual history and removes user color events, restoring the original C/D zero angles at one second. These inputs are **not optical sensor measurements**, inferred scene colors, hardware reads, distance readings or invented sensor lights.

## Return, responsive operation and evidence

**Return to assembly end** must restore the unchanged complete assembly range value and 234/136 accounting, hide all course markers and retain the original canvas. Entry must work again and restart at simulation zero.

A separate **320 px** viewport scenario operates reverse/pause, speed, the range, D motor editing, B color recording, reset, restoration and return. It checks document-level horizontal overflow with the native editors expanded as well as collapsed. This is an operability/overflow check, not a complete WCAG audit.

The executed suite records page errors, failed requests and HTTP failures including MPD/GLB assets; its Playwright attachments include full-page and canvas screenshots at start, intermediate and return states, tool output views and narrow controls. A separate curated [Chromium mid-course screenshot](screenshots/adb-course-midpoint.webp) shows authored markers and the actual rendered robot at `t=13 s`, with the source/extension limitations visible in the UI. No manufacturer PDF images were captured. Browser output and visual pixels must not be relabeled as independently validated source joins.
