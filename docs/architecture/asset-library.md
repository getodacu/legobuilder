# Licensed component asset library

The library is generated from the researched LEGO crosswalk, not from placeholder solids or a wholesale parts-library download. It is a geometry library, not a claim that any complete robot's placement, mold identity or assembly coverage is verified. VEX CAD remains permission-blocked and is not converted or distributed.

## Prepare once before authoring or building

Run `npm run assets:prepare` (equivalently `node scripts/assets/prepare.ts`) on Node 24 with project dependencies installed and the original private `.research-cache/geometry/ldraw` and `.research-cache/geometry/licenses` available, including the hash-locked private `LDConfig.ldr` used only for factual RGB cross-check provenance. The script needs no network, conversion kernel or compression package. The authoring-only `src/lib/geometry/library.ts` imports the full generated `manifest.json` directly, including its JSON import attribute for Node model-authoring scripts; it does not import runtime loaders or issue browser-relative fetches during authoring.

The script validates every researched DAT cache record against its original SHA-256 and byte length, checks observed license declarations and actual type-1 dependency records, recomputes every selected root's recursive closure, and rejects cycles and ambiguous references. Selected roots must safely and uniquely cover the researched part families; totals are derived rather than pinned to an obsolete curation. Missing, altered or unlicensed sources fail with source paths and restoration guidance. It validates prerequisites before replacing the generated public directory. It never substitutes a primitive or emits private manual PDFs/images, VEX geometry, unused candidate DATs or `LDConfig.ldr`.

Outputs under `static/models/library/`:

- One deterministic `<geometryId>.mpd` per selected root, containing only its selected licensed closure.
- `manifest.json`: full authoring registry of `GeometryAsset[]`, narrowly authored `MaterialDefinition[]` and minimal material `SourceDocument[]` provenance consumed by `geometryAssetsFor(ids)`, `materials` and `sourceDocumentsFor(geometryAssets, selectedMaterials)`. Runtime modules must not import this all-root registry.
- `materials.json`: small runtime palette array containing only `id`, `color`, `category`, `opacity`, `roughness` and `metalness` from the same independently authored materials. `cache.ts` imports this artifact, not the full registry or its all-root attribution. Material evidence and source documents remain in the authoring manifest and selected model manifests.
- `attribution.json`: exact source hashes/URLs/paths, original headers/authors, both license obligations where applicable, modifications and per-root source closure, plus display-palette provenance and its link-only source-document record.
- `CREDITS.txt`: readable per-source attribution and modification notice; the workspace can link it directly.
- `licenses/CAreadme.txt`, `licenses/CAlicense.txt` (CC BY 2.0), and `licenses/CC-BY-4.0.txt`: applicable existing legal texts/notices.

Original DAT bodies, including full authorship/history/comments, BFC certification, clipping, winding, INVERTNEXT and fixed colors, remain untouched inside MPD FILE wrappers. Root is first, dependencies sort by canonical source path; no timestamp enters the output. Original source hashes identify each unmodified body; the asset hash identifies the complete packed derivative. Mixed CC BY 2.0/4.0 declarations are retained as both obligations, including the history-date rules in CAreadme, not treated as an either/or grant. Source originals remain independently recoverable from the MPD sections.
`.gitattributes` disables Git text conversion for these MPDs and recognizes the preserved native CRLF terminators. Do not strip carriage returns or rewrite original DAT bodies to satisfy a whitespace check; their source hashes and authorship records describe the original bytes.

Models merge `sourceDocumentsFor` with their manual records. The helper builds selected root CAD records from each root's actual attribution URL, original DAT SHA-256 and `!LDRAW_ORG` edition, not the packed MPD hash. It adds only documents actually referenced by selected materials; no full research/crosswalk metadata or unused component-document catalog is copied into the browser to construct these records. CAD redistribution remains subject to the accompanying licensed attribution. The private LDConfig bytes are checked against the research download's size/hash; only its URL, edition, hash and link-only status are emitted, with no configuration text or inferred DAT license grant.

Before building or deploying after a library change, run `npm run assets:prepare && npm run models:build` in that order, then the application build. Both the runtime `materials.json` import and Node authoring manifest require asset preparation first. Deploy the generated library directory, selected model manifests and application build together: each model's `GeometryAsset` retains its own selected closure, source attribution and packed hash for `acquire(asset)`, while full attribution, credits and license artifacts remain public for Sources links. Do not import `library.ts` into runtime code to look up asset metadata.

The workspace's manual-page selector accepts only source records with a defined `pageCount`; geometry and material references remain direct attribution/evidence links, never synthetic PDF-page links to DAT or LDConfig files.

Catalog previews under `static/previews/` are original RoboBuild WebGL renderings of the source-authored manifests, not copied manual art, manufacturer photography or generated substitute robots. Hand and Quality previews were re-rendered after the32348/exterior source corrections. Their pictured LDraw-derived components retain the same authorship/license obligations as the meshes: `/models/library/CREDITS.txt`, `attribution.json` and the selected model's full per-file attribution identify sources and modifications. Rendered placements, camera, lighting and PBR choices are RoboBuild-authored and do not certify the model's fit. No VEX preview is fabricated while its geometry rights are unresolved.


## Coordinates and articulation

No loader or script centers geometry. Native DAT origins and authoring matrices remain unchanged. Each returned primitive's matrix includes the asset's `nativeToScene` exactly once: LDraw uses `N = Rx(pi) * scale(0.4)`, right-handed Y-up scene millimeters. Renderer multiplies the sampled scene part pose outside that matrix and must not add another N. Bounds are a Three.js `Box3` in part-local scene mm. Assembly-author native placements use `N * Tnative * N^-1` independently of the native vertex conversion.

The actual large/medium angular motor root references expose separate body and drive-hub source groups. Generated `internalNodes` use canonical source-path IDs and their scene-mm default local poses:

| Root | Body node | Rotor node |
| --- | --- | --- |
| `54675` | `parts/u9367c01.dat` | `parts/u9363.dat` |
| `54696p01` | `parts/u9364c01.dat` | `parts/u9363p01.dat` |

The rotor default translation is `[0,20,0]` mm, derived from the source root's `[0,-50,0]` LDU reference; this is not a guessed motor dimension. The source group's geometry remains at its native pivot. Primitive `nodeId` identifies its nearest retained declared group. A renderer applying a sampled internal pose uses the scene-part-local delta `sampledLocal * inverse(authoredLocal)` before the primitive matrix. Other source subgroups are retained by the loader where its part/subpart representation permits, but no unverified semantic joints are invented. These node IDs do not add inventory instances or establish joint limits.

## Materials and edges

The pipeline contains a small independently authored color/material table, with factual RGB cross-check provenance and explicit presentation-only PBR values. Its `ldraw-palette` source identifies the hash-locked private LDraw configuration edition as a link-only factual reference; roughness, metalness and opacity are RoboBuild choices, not measured material properties or PBR values extracted from LDConfig. It does not copy or ship LDConfig text. Instance color 16 is inherited; fixed child colors are not. The integral wheel tyre remains fixed material `ldraw-10322`, category rubber; the clear dish material `ldraw-47` retains opacity. Electronics retain the source's multicolor housing, contacts, pattern and cable-stub materials.

LDraw type-2 lines and type-5 conditional lines remain distinct primitive kinds. The installed Three.js LDraw loader handles BFC, mirrored subparts and INVERTNEXT; no global double-sided material is used to hide winding. Its conditional-line material preserves control-point visibility. Authored dark edges are distinct from surface tint; inherited versus fixed material metadata remains available to the renderer. Material-array meshes are split into singular-material draw-range views sharing the original immutable position/normal/index buffers, never deep-cloning mesh data to recolor a fixed child.

## Runtime ownership

`GeometryLibrary` implements `GeometryCache`. Runtime consumers import it and the `ThreeGeometryHandle` / `ThreeGeometryPrimitive` types directly from `cache.ts`; the authoring-only `library.ts` does not re-export them. `acquire(asset)` uses the asset from the selected model manifest, verifies the packed asset SHA-256, validates MPD FILE sections and references against its declared closure before parsing, and forbids undeclared external dependency fetches. Errors name the affected asset/dependency; no fallback mesh is returned.

Concurrent acquisitions coalesce by source hash, format, conversion version, transform, dependency list, material grouping and internal-node options. Each acquisition receives its own lease wrapper around shared immutable primitives/bounds. Releasing a lease is idempotent and cannot release another library's handle. The last release disposes owned geometries/materials/textures; model switching should release every acquired handle. `dispose()` aborts pending fetches, prevents late adoption, and disposes retained resources. Renderer model-generation tokens independently prevent an old model's completed acquisition from attaching to a new scene.

DAT/MPD is the adopted component route. The same cache has real installed-loader routes for STL with explicitly declared source units, material-free OBJ with explicit instance material, and self-contained glTF/GLB declared in native meters with authored mm conversion. Material-bearing OBJ must first be converted offline with licensed MTL/textures into self-contained glTF; external glTF resources are rejected rather than silently ignored. STEP needs an authorized offline CAD conversion and remains blocked for VEX until rights are established. No format is relabeled or parsed as another.

## Checks to exercise

Preparation itself is a runnable integrity/closure/license check and must run before model generation. Parent preparation verified64 genuine roots/485 selected DATs and all563 cached hashes; real Chromium parsing checks every selected root against an independent triangle/dependency walk, source-local dimensions, fixed/inherited/transparent/rubber materials, retained motor nodes and lease disposal. See [current executable evidence](../validation/coverage-baseline.md) for the latest exercised gate results. Neither source-mesh parsing nor nominal mating tests certify historical molds, full mechanical clearance or manufacturer-safe motor limits.
