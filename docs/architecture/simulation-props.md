# Original simulation props

`scripts/assets/simulation-props.py` authors two RoboBuild-original visual props with Blender 5.2's Python API. They are not substitute robot components, manufacturer CAD, official Hand scoring bricks, or evidence of any build's mechanical fidelity. Keep their simulation objects outside official BOM/inventory rows and manual assembly steps. Their authored surfaces do not establish rigid-body, collision, friction, or calibrated material behavior.

## Generate before model integration

The parent integration owner runs, from the project root:

```sh
/Applications/Blender.app/Contents/MacOS/Blender --background --python scripts/assets/simulation-props.py
```

The generator resolves its output relative to its own source path, not the process working directory. It clears the Blender scene, creates only original geometry/materials, bakes object transforms, and exports only each prop's selected owned objects. It does not save a `.blend` file or need network access, private CAD, textures, fonts, copied meshes, vendor logos, or a Draco decoder.

After **both real GLB exports succeed**, it publishes these files in `static/models/simulation/`:

- `demo-block.glb`, served as `/models/simulation/demo-block.glb`.
- `course-marker.glb`, served as `/models/simulation/course-marker.glb`.
- `PROVENANCE.txt`, served as `/models/simulation/PROVENANCE.txt`.
- `manifest.json`, served as `/models/simulation/manifest.json`, published last.

No empty GLBs, guessed hashes, or pre-export manifest are checked in by this authoring task. The manifest follows the existing top-level `schemaVersion`, `assets`, `materials` convention; its records are `GeometryAsset` and `MaterialDefinition`, without parallel geometry schemas. Import its generated records into selected model authoring only after generation, then regenerate the selected model manifest. Do not use fabricated TS hashes to bypass this prerequisite. Deploy generated GLBs, provenance, and matching model metadata together.

## Original design parameters

All dimensions are our explicit original design choices, **not manufacturer dimensions or physical measurements**. Bounds below are the intended post-export, part-local **scene millimeter** bounds, including inward bevels and all node transforms.

| Geometry ID | Shape and origin | Scene bounds, min → max (mm) |
| --- | --- | --- |
| `robobuild-demo-block` | Unbranded teal foam-like demonstration block; X16 × Y20 height × Z32; centered origin; 1 mm soft edge bevel, four bevel segments | `[-8,-10,-16]` → `[8,10,16]` |
| `robobuild-course-marker` | Circular charcoal base, diameter32 × height4; 0.75 mm inward bevel, three bevel segments; base origin Y0; total height48; seamless tapered orange/white body, bottom radius11 and top radius3.5 | `[-16,0,-16]` → `[16,48,16]` |

The marker uses 64 radial segments. Its body is one closed shared-ring surface, not separated orange/white cone stacks. White bands occupy scene Y16–24 and Y33–41 mm. Other body faces are orange. A softened foot seats 0.5 mm inside the base, an intentional visual joint rather than a physical collision definition; the top has a small softened lip. Material seams share the continuous surface and smooth side normals. Both props have outward normals, named mesh/object nodes and modest untextured topology; export must retain indexed primitives and normals.

## Units and materials

Blender authors vertices in meters, Z-up: `(x,y,z)` exports to glTF Y-up `(x,z,-y)`. The centered block's Blender dimensions are therefore `(0.016,0.032,0.020)` meters. The marker's Blender Z extent is `0..0.048` meters. Baked object transforms retain these design origins; no recentering occurs.

Each `GeometryAsset` declares:

```text
nativeUnits: m
nativeToScene: position [0,0,0], quaternion [0,0,0,1], scale [1000,1000,1000]
preserveOrigin: true
dependencyIds: []
```

The cache's existing `nativeToScene` application performs the meter-to-scene-millimeter conversion **exactly once**. Do not add an instance scale1000, apply another axis correction, or write millimeter-valued coordinates inside glTF. `GeometryAsset` has no separate bounds field: actual mesh/node bounds are authoritative; the table and generated provenance declare the design extents.

| Fixed material/slot ID | Use | Roughness | Existing display category |
| --- | --- | --- | --- |
| `robobuild-demo-foam` | Teal `#23a6a0` foam-like polymer | 0.90 | plastic |
| `robobuild-marker-charcoal` | Charcoal `#28313a` base | 0.80 | rubber |
| `robobuild-marker-orange` | Orange `#f27621` body | 0.48 | plastic |
| `robobuild-marker-white` | Warm white `#f4f2e8` bands | 0.52 | plastic |

All materials are opaque, nonmetallic PBR. The source sRGB colors are converted to linear Blender shader inputs. Display categories and roughness are authored presentation choices, not material tests. All declared material slots use `colorMode: fixed`; GLB material names match the IDs. There is no inherited-color flag. The existing GLB cache retains these embedded materials, so an instance's required `materialId` does not recolor marker banding. Use `robobuild-demo-foam` for block objects and `robobuild-marker-charcoal` for marker objects as their model-level default material IDs.

## Provenance and rights

Generated attribution identifies **RoboBuild** as author, records `sourcePath: scripts/assets/simulation-props.py`, and hashes the actual generator bytes. Each asset hash is separately computed from its actual exported GLB bytes. The public provenance includes both source and generated asset hashes and the original parameter/origin/material descriptions.

Both `sourceUrl` and the sole `licenseUrls` entry point to `/models/simulation/PROVENANCE.txt`. `LicenseRef-Project-Original` identifies original project work; it does **not** invent a third-party grant, assert public domain, change project licensing, or create a new permission regime. Applicable project licensing remains unchanged. No VEX CAD is used or converted.

Material/design evidence is `category: app-authored`, `confidence: 1`, `sources: []`: confidence is in the original authorship/design, **not physical validation**. Source references to nonexistent manuals or CAD documents are unnecessary. The current engine accepts these nonempty public local URLs and the cache permits self-contained meter-native GLBs; neither validator needs weakening.

## Parent verification

This authoring change does not claim an executed export, loader check, screenshot, test, or build. The generator itself includes runnable checks for Blender-space design bounds, genuine GLB headers, indexed normal/material-bearing primitives, and absence of external buffers, textures and Draco. Those run only when the parent executes the command.

After generation, the parent must exercise actual runtime GLB loads and matching SHA-256 metadata, actual world/node-composed bounds and origins, normals and polished appearance, fixed marker banding under instance tint, and exactly-once meter conversion. Model integration, simulation object placement, browser inspection, and all project gates belong to the parent and the model/simulation owners.
