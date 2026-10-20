# Simulation rendering

`SceneController` renders assembly and simulation in the same WebGL2 scene. The workspace passes `SimulationFrame.assembly` to the existing `update(frame)` method; the renderer does not integrate motors, reparent captured objects, advance simulation time, or construct a simplified robot. Every explicit update consumes the buffers, including repeated calls with the same mutable frame object.

## Robot and external geometry

Robot instances continue to use `frame.transforms`. Actual geometry-node primitives additionally use `frame.internalTransforms` with the authored node-rest inverse, retaining the real motor body/rotor split. Joint overlays use the sampled `frame.subassemblyTransforms` for subassembly parents instead of reconstructing their current pose from an initial descendant-part offset. Exploded-view offsets remain renderer-only.

`loadModel` also acquires the geometry assets referenced by `model.simulationObjects`. These use the same `GeometryLibrary` leases, native-to-scene conversion and origin-preserving primitive matrices as robot parts. They have separate instanced mesh batches keyed by geometry, primitive and effective material; repeated markers share a batch per compatible primitive rather than separate mesh objects. Fixed GLB materials retain their source colors in studio, technical and inspection views. Authored marker diameter32/height48 and block X16/Y20/Z32 millimeter dimensions are not rescaled by the renderer.

External instance matrices come only from `frame.environmentTransforms`. An instance is shown only when its `environmentVisible` flag is set, its scale is nonzero on every axis, and no robot-part isolation is active. Assembly sampling clears these flags, so returning to assembly hides the course without replacing the renderer. Technical line primitives follow the same visibility policy. Exploding the robot does not move the course.

External objects do not enter robot part indices, raycast selection, labels, active/selected outlines, inventory counts, subassembly BOMs or mechanical connection overlays. Batch `userData.simulationObjectIds` lists stable external IDs in instance order for scene inspection; these are not selectable robot IDs.

## Framing and course floor

Explicit `fit('all')` includes visible external objects. Active-part/module fits, reset view and automatic initial/inventory framing remain robot-only. Hidden, isolated-away and zero-scale external instances do not contribute to camera bounds. Orbit, pan and zoom use the existing controls and camera.

When the environment becomes visible, studio lighting/shadow coverage is configured around the robot and visible course. The course floor is the lowest initial world-space bound of the declared external geometry and remains fixed while a prop moves or is captured. A course marker's preserved base origin has local Y0; a centered demo block has local minY−10, so its instance origin must be positioned 10mm above a shared floor. The renderer does not infer contact, collision or physical support. With no visible environment it restores the ordinary robot studio floor policy.

Visible environment lanes suppress assembly instruction camera presets and cancel an in-flight assembly camera transition on entry. The workspace also disables automatic source cameras when entering simulation, covering scenarios without external props. Simulation time remains owned by the simulation sampler, not the renderer or assembly instruction clock. Camera changes therefore do not restart on each simulation update.

## Ownership and lifetime

Robot and external batches share cache-owned geometry and renderer-owned material variants. Unload, replacement, disposal and failed adopted loads dispose all external instanced batches and material variants and release the acquired asset leases alongside robot resources. Existing generation checks reject late asynchronous adoption and release stale acquisitions. The renderer's bounded pixel-ratio/shadow adaptation is unchanged and does not alter sampled poses.

No renderer verification results are asserted here; browser, resource-lifetime and project checks are performed by the integration owner.
