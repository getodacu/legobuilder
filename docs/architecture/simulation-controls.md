# Post-assembly controls

`Workspace.svelte` owns the assembly/simulation mode switch. `SimulationControls.svelte` owns one simulation clock and immutable scenario replacements; no store or duplicate robot is introduced.

## Entry and coverage

Entry requires all documented steps to be implemented in the current manifest, an equal manifest step count, the assembly at its endpoint with all robot/sample installation and step counts complete, ready scene assets, and at least one declared `model.scenarios` entry. A partial 3/136 implementation remains locked even at its local assembly endpoint. `compileSimulation` remains the authority for physical joint bindings, completed hierarchy consistency, command limits, overlapping commands and unsupported assignments.

Full authored coverage is not verified placement. Entry and simulation show implemented/documented and verified/documented counts independently. When verified coverage is lower, the UI explicitly says that placement remains unchecked and the robot is not fully verified. Manifest coverage deviations and scenario limitations remain available alongside source links. Course markers, scripts and simulated inputs are RoboBuild extensions, not official parts or a manufacturer program.

## One frame path and one active clock

Entering pauses and clears assembly playback, disables source automatic camera moves and clears presentation explode/isolation. The child compiles the selected manifest scenario, creates its frame through `createSimulationFrame`, and samples with `sampleSimulation`. Its actual `SimulationFrame.assembly` goes through the existing `RobotScene`/`RendererController.update` route with an incremented revision, including mutable environment and internal-rotor buffers. The renderer instance and model are unchanged.

The control component is keyed by the compiled assembly, so a replacement model/assembly unmounts the previous clock and initializes fresh scenario, motor and input state. Model, eligible motors and clearance defaults are reactive derivatives of the current assembly prop rather than captured initial values. The workspace coverage badge distinguishes incomplete authored source coverage from complete authored coverage with unverified fits.

After the simulation frame mounts, entry resets the scene column's internal scroll, scrolls its toolbar into view, and uses the renderer's robot-only camera reset once. It deliberately does not fit the full meter-scale marker course by default, which would shrink the mechanism. Both the visible notice and accessibility announcement explain that markers can be outside the current camera and that Fit whole frames the full course; Reset view returns to robot-focused inspection.

Play, pause, reverse, speed and the native millisecond scrubber only change the simulation sampling time; they never recompile during animation. Manual seeking pauses. Reset time samples zero while preserving edits; Restore scenario reloads the original manifest scenario and clears manual edits. Scenario selection recompiles and resets. Exiting cancels the simulation animation, samples the paused assembly endpoint, hides external props via the assembly frame, and restores the previous automatic-camera setting. Unmount and scene errors cancel playback.

Workspace keyboard handling excludes typing, contenteditable elements, native sliders/selects, dialogs and the focused camera canvas. Space toggles simulation playback in its current direction, `[`/`]` seek one second, Home/End seek endpoints, and Escape returns to assembly after closing any active drawer/isolation. Camera shortcuts remain shared. Native buttons and form controls retain their normal keyboard behavior.

## Motor authoring safety

The selector uses `model.motors` and actual `jointId`/`drivenByMotorId` bindings, not guessed port-to-axis mappings. Unknown assignment evidence, fixed joints, coupled outputs and closed-loop dependent coordinates cannot receive independent commands. Consequently the documented single-powered Hand linkage cannot become independent fingers, and unresolved Quality axes cannot be silently assigned.

A motor submission explicitly pauses and resets time to zero, replaces that motor's entire scheduled plan and appends a new command without touching other motor plans, source data or sensor history. This deliberately chooses the reset-and-replace safety policy instead of truncating an arbitrary in-progress nonlinear command. Position starts at the declared joint zero; speed uses its declared rad/s or mm/s coordinate. Values are finite, duration is bounded by the scenario, native fields expose declared limits, and engine validation enforces trajectory and modeled maximum-speed limits. Unknown physical limits are labeled unknown, not fabricated. New commands carry `app-authored` evidence and empty source links. The accepted manual-edit list is appended immutably; Restore scenario clears it.

The live state comes from sampled joint values and compiled active commands, including command mode, interpolation value and units in the expanded panel. An unassigned motor has no invented angle. Scenario plan snapshots remain separate from the original manifest.

## Typed sensor events

Only color inputs already declared as scripted color signals receive input controls. Their actual sensor instance IDs and declared ports are retained. A user submission pauses and appends a typed `SensorSignal` at the current timestamp with `scripted-input` basis, `app-authored` evidence and no source links; an event for the same sensor/type/timestamp is explicitly replaced. Future scripted events remain and can supersede the input later. Both the typed event log and current readings are visible; current values come from `SimulationFrame.sensorValues`, so reverse/seek restores the correct historical signal. These are simulated inputs, not optical rendering, hardware reads or invented lights/distance sensors.

## Simplified geometric course stop

A differential-drive scenario with original `robobuild-course-marker` props receives a deterministic guard during compilation, not an extra animation-time physics loop. A reusable probe samples the actual root/subassembly and environment transforms every 20 ms and checks swept axle-center disks against the authored marker base radius of 16 mm. The default robot clearance radius encloses robot part origins plus the nominal wheel radius, and is explicitly an authored conservative envelope rather than a measured collision hull. A native radius field permits increasing clearance for calibration; it cannot lower the derived minimum.

At the first clearance crossing, both wheel plans are cut off before the unsafe interval while independent tool commands and color events continue. Linear speed/position commands are analytically truncated with their original slope; a nonlinear wheel ramp is conservatively stopped at its preceding command boundary so its retained history is not silently distorted. The guarded scenario is recompiled into the same engine. Original user-authored plans remain available for subsequent edits and Restore scenario. The status always says **“Simplified collision stop, no physics”** and identifies a stop time or clear path.

This is a planar sampled clearance model, not rigid-body contact, traction, friction, slip, certified collision shape, dynamic obstacle solver or a Rapier integration. It is intended for the static ADB marker course. Closed-loop object capture remains exclusively the simulation solver's responsibility; the controls do not attach objects heuristically.

## Validation boundary

No checks, browser runs, tests, build or formatting were executed by this implementation worker. The integration owner should exercise completed ADB entry; partial-manifest lock; play/pause/reverse/arbitrary seek/reset; scenario restoration; independent A/E/C/D commands and invalid-limit rejection; B/F color event timestamp restoration; marker stop with tool continuation; same renderer/internal rotors/environment props; assembly return; keyboard/input/dialog handling; and 320 px layout through the actual browser suite.
