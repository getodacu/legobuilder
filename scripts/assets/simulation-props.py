"""Original RoboBuild props. Run with Blender 5.2, not system Python.

/Applications/Blender.app/Contents/MacOS/Blender --background --python scripts/assets/simulation-props.py

No external geometry, textures, fonts, logos, or manufacturer dimensions.
This source and its generated work do not change the project's licensing.
"""

import hashlib
import json
import math
from pathlib import Path
import struct
import tempfile

import bmesh
import bpy


SOURCE = Path(__file__).resolve()
ROOT = SOURCE.parents[2]
OUTPUT = ROOT / "static/models/simulation"
PROVENANCE_URL = "/models/simulation/PROVENANCE.txt"
SEGMENTS = 64

# Explicit original design parameters, in meters; Blender Z is exported as glTF Y.
BLOCK_SIZE = (0.016, 0.032, 0.020)
BLOCK_BEVEL = 0.001
MARKER_RADIUS = 0.016
MARKER_BASE_HEIGHT = 0.004
MARKER_HEIGHT = 0.048
MARKER_BODY_BOTTOM_RADIUS = 0.011
MARKER_BODY_TOP_RADIUS = 0.0035

MATERIALS = [
    {"id": "robobuild-demo-foam", "name": "RoboBuild demonstration foam — teal", "color": "#23a6a0", "metalness": 0, "roughness": 0.9, "opacity": 1, "category": "plastic"},
    {"id": "robobuild-marker-charcoal", "name": "RoboBuild marker base — charcoal", "color": "#28313a", "metalness": 0, "roughness": 0.8, "opacity": 1, "category": "rubber"},
    {"id": "robobuild-marker-orange", "name": "RoboBuild marker body — orange", "color": "#f27621", "metalness": 0, "roughness": 0.48, "opacity": 1, "category": "plastic"},
    {"id": "robobuild-marker-white", "name": "RoboBuild marker bands — warm white", "color": "#f4f2e8", "metalness": 0, "roughness": 0.52, "opacity": 1, "category": "plastic"},
]
EVIDENCE = {
    "category": "app-authored", "confidence": 1, "sources": [],
    "note": "RoboBuild original design and display material parameters, not an official robot component or physical/material validation. Foam-like polymer is represented by the existing plastic display category. No manufacturer claim, collision dynamics, or rigid-body calibration.",
}


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def linear_channel(value):
    value /= 255
    return value / 12.92 if value <= 0.04045 else ((value + 0.055) / 1.055) ** 2.4


def make_material(definition):
    material = bpy.data.materials.new(definition["id"])
    material.use_nodes = True
    rgb = tuple(linear_channel(int(definition["color"][i:i + 2], 16)) for i in (1, 3, 5))
    material.diffuse_color = (*rgb, 1)
    shader = material.node_tree.nodes.get("Principled BSDF")
    shader.inputs["Base Color"].default_value = (*rgb, 1)
    shader.inputs["Metallic"].default_value = definition["metalness"]
    shader.inputs["Roughness"].default_value = definition["roughness"]
    material["robobuildColorMode"] = "fixed"
    return material


def finish_mesh(obj, name):
    obj.name = name
    obj.data.name = name + "-mesh"
    # Bake transforms, including the base's vertical offset, into meter vertices.
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    mesh = bmesh.new()
    mesh.from_mesh(obj.data)
    bmesh.ops.recalc_face_normals(mesh, faces=list(mesh.faces))
    mesh.to_mesh(obj.data)
    mesh.free()
    obj.data.update()
    return obj


def bevel(obj, width, segments):
    modifier = obj.modifiers.new("softened-original-edges", "BEVEL")
    modifier.width = width
    modifier.segments = segments
    modifier.affect = "EDGES"
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.modifier_apply(modifier=modifier.name)
    for face in obj.data.polygons:
        face.use_smooth = True
    normals = obj.modifiers.new("weighted-surface-normals", "WEIGHTED_NORMAL")
    normals.keep_sharp = True
    normals.weight = 50
    bpy.ops.object.modifier_apply(modifier=normals.name)


def demo_block(materials):
    bpy.ops.object.select_all(action="DESELECT")
    bpy.ops.mesh.primitive_cube_add(size=1)
    obj = bpy.context.object
    obj.dimensions = BLOCK_SIZE
    finish_mesh(obj, "robobuild-demo-block")
    obj.data.materials.append(materials["robobuild-demo-foam"])
    bevel(obj, BLOCK_BEVEL, 4)
    return [obj]


def course_marker(materials):
    bpy.ops.object.select_all(action="DESELECT")
    bpy.ops.mesh.primitive_cylinder_add(vertices=SEGMENTS, radius=MARKER_RADIUS, depth=MARKER_BASE_HEIGHT, end_fill_type="NGON", location=(0, 0, MARKER_BASE_HEIGHT / 2))
    base = finish_mesh(bpy.context.object, "robobuild-course-marker-base")
    base.data.materials.append(materials["robobuild-marker-charcoal"])
    bevel(base, 0.00075, 3)
    base.select_set(False)

    # One shared-vertex surface across both white bands: no stacked cone gaps.
    # The rounded foot seats 0.5 mm inside the base; this is a visual design,
    # not a collision mesh. Axial ring subdivision does not alter the taper.
    slope_bottom = 0.0045
    slope_top = MARKER_HEIGHT - 0.0005
    slope_top_radius = MARKER_BODY_TOP_RADIUS + 0.0001

    def radius_at(z):
        t = (z - slope_bottom) / (slope_top - slope_bottom)
        return MARKER_BODY_BOTTOM_RADIUS + t * (slope_top_radius - MARKER_BODY_BOTTOM_RADIUS)

    bands = (0.016, 0.024, 0.033, 0.041)
    profile = [
        (0.0035, 0.0104), (0.00375, 0.01085),
        (slope_bottom, MARKER_BODY_BOTTOM_RADIUS),
        *((z, radius_at(z)) for z in bands),
        (slope_top, slope_top_radius),
        (MARKER_HEIGHT - 0.00015, MARKER_BODY_TOP_RADIUS + 0.00005),
        (MARKER_HEIGHT, MARKER_BODY_TOP_RADIUS),
    ]
    vertices = [(radius * math.cos(2 * math.pi * i / SEGMENTS), radius * math.sin(2 * math.pi * i / SEGMENTS), z) for z, radius in profile for i in range(SEGMENTS)]
    # Counterclockwise side quads face outward; lower and upper caps close it.
    faces = [tuple(reversed(range(SEGMENTS)))]
    face_materials = [0]
    for ring in range(len(profile) - 1):
        midpoint = (profile[ring][0] + profile[ring + 1][0]) / 2
        white = bands[0] < midpoint < bands[1] or bands[2] < midpoint < bands[3]
        for i in range(SEGMENTS):
            j = (i + 1) % SEGMENTS
            faces.append((ring * SEGMENTS + i, ring * SEGMENTS + j, (ring + 1) * SEGMENTS + j, (ring + 1) * SEGMENTS + i))
            face_materials.append(1 if white else 0)
    faces.append(tuple((len(profile) - 1) * SEGMENTS + i for i in range(SEGMENTS)))
    face_materials.append(0)
    mesh = bpy.data.meshes.new("robobuild-course-marker-banded-body-mesh")
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    body = bpy.data.objects.new("robobuild-course-marker-banded-body", mesh)
    bpy.context.collection.objects.link(body)
    body.data.materials.append(materials["robobuild-marker-orange"])
    body.data.materials.append(materials["robobuild-marker-white"])
    for face, material_index in zip(mesh.polygons, face_materials):
        face.material_index = material_index
        face.use_smooth = len(face.vertices) == 4
    finish_mesh(body, "robobuild-course-marker-banded-body")
    return [base, body]


def export_prop(objects, target, expected_bounds):
    # Runnable authoring invariant: bevels and node transforms must retain the
    # declared design bounds. Parent additionally checks the exported GLB.
    points = [obj.matrix_world @ vertex.co for obj in objects for vertex in obj.data.vertices]
    actual = tuple(tuple(function(point[axis] for point in points) for axis in range(3)) for function in (min, max))
    if any(abs(actual[side][axis] - expected_bounds[side][axis]) > 1e-7 for side in range(2) for axis in range(3)):
        raise RuntimeError(f"{target.name}: design bounds differ: {actual} != {expected_bounds}")
    bpy.ops.object.select_all(action="DESELECT")
    for obj in objects:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = objects[0]
    result = bpy.ops.export_scene.gltf(
        filepath=str(target), export_format="GLB", use_selection=True,
        export_yup=True, export_apply=True, export_normals=True,
        export_materials="EXPORT", export_texcoords=False,
        export_tangents=False, export_animations=False,
        export_cameras=False, export_lights=False,
        export_extras=True, export_draco_mesh_compression_enable=False,
    )
    if result != {"FINISHED"}:
        raise RuntimeError(f"Export did not finish: {target}")
    # Inspect real exported bytes before publishing hashes, never a fake GLB.
    data = target.read_bytes()
    magic, version, length, json_length, chunk_type = struct.unpack_from("<4sIIII", data)
    if magic != b"glTF" or version != 2 or length != len(data) or chunk_type != 0x4E4F534A:
        raise RuntimeError(f"Invalid GLB export: {target}")
    gltf = json.loads(data[20:20 + json_length])
    primitives = [primitive for mesh in gltf.get("meshes", []) for primitive in mesh["primitives"]]
    if not primitives or any("indices" not in primitive or "NORMAL" not in primitive["attributes"] or "material" not in primitive for primitive in primitives):
        raise RuntimeError(f"Export requires indexed, normal-bearing, material-bearing meshes: {target}")
    if any(buffer.get("uri") for buffer in gltf.get("buffers", [])) or gltf.get("images") or gltf.get("textures") or "KHR_draco_mesh_compression" in gltf.get("extensionsUsed", []):
        raise RuntimeError(f"Export must be self-contained and texture/Draco-free: {target}")


def main():
    for obj in list(bpy.data.objects):
        bpy.data.objects.remove(obj, do_unlink=True)
    # Remove unused startup datablocks so rerunning in one Blender process
    # cannot silently append .001 to owned mesh/material names.
    for collection in (bpy.data.meshes, bpy.data.materials):
        for block in list(collection):
            if block.users == 0:
                collection.remove(block)
    bpy.context.scene.unit_settings.system = "METRIC"
    bpy.context.scene.unit_settings.scale_length = 1.0
    materials = {definition["id"]: make_material(definition) for definition in MATERIALS}
    props = [
        ("robobuild-demo-block", "demo-block.glb", demo_block(materials),
         ((-0.008, -0.016, -0.010), (0.008, 0.016, 0.010)), ["robobuild-demo-foam"]),
        ("robobuild-course-marker", "course-marker.glb", course_marker(materials),
         ((-0.016, -0.016, 0), (0.016, 0.016, 0.048)),
         ["robobuild-marker-charcoal", "robobuild-marker-orange", "robobuild-marker-white"]),
    ]
    source_sha = digest(SOURCE)
    attribution = {
        "sourcePath": SOURCE.relative_to(ROOT).as_posix(),
        "sourceUrl": PROVENANCE_URL, "sha256": source_sha,
        "originalHeader": "RoboBuild original procedural simulation props with project-authored dimensions and materials.",
        "authors": ["RoboBuild"], "licenseIds": ["MIT"],
        "licenseUrls": ["https://opensource.org/license/mit"],
        "modifications": ["Generated directly from original meter-valued design parameters; bevels and transforms baked before glTF Y-up export. No acquired mesh modified. Runtime uniform scale 1000 converts meters to scene millimeters exactly once."],
    }
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix=".simulation-props-", dir=OUTPUT.parent) as temporary:
        staging = Path(temporary)
        assets = []
        for geometry_id, filename, objects, bounds, material_ids in props:
            export_prop(objects, staging / filename, bounds)
            assets.append({
                "id": geometry_id, "url": "/models/simulation/" + filename,
                "format": "glb", "sha256": digest(staging / filename),
                "dependencyIds": [], "nativeUnits": "m",
                "nativeToScene": {"position": [0, 0, 0], "quaternion": [0, 0, 0, 1], "scale": [1000, 1000, 1000]},
                "preserveOrigin": True, "attribution": [attribution],
                "materialSlots": [{"id": material_id, "colorMode": "fixed", "materialId": material_id} for material_id in material_ids],
            })
        provenance = f"""RoboBuild original procedural simulation props
Author attribution: RoboBuild
Source path: {SOURCE.relative_to(ROOT).as_posix()}
Source SHA-256: {source_sha}
License identifier: MIT

The generator and generated props are original RoboBuild work. The full
MIT license is in LICENSE at the repository root and at /LICENSE.txt in
the production build.

All dimensions below are OUR explicit original design parameters, not measured
or manufacturer specifications. These are visual simulation props outside the
official robot BOM and manual steps, not robot stand-ins. There is no physical
validation, rigid-body, collision, material calibration, or friction claim.
Evidence: app-authored; confidence 1 in authorship/design; sources [].

robobuild-demo-block: unbranded teal demonstration foam-like polymer block,
not an official Hand scoring brick. X16 x Y20(height) x Z32 mm, centered origin,
1 mm inward edge bevel (4 segments). Runtime bounds mm:
[-8,-10,-16] to [8,10,16]. Fixed material robobuild-demo-foam.

robobuild-course-marker: X32 x Y48(height) x Z32 mm, base origin Y=0.
Charcoal circular base outer diameter32 mm, height4 mm, inward bevel0.75 mm
(3 segments). One continuous orange/white shared-ring tapered body, 64 radial
segments, bottom radius11 mm, top radius3.5 mm, softened foot and top lip.
The foot seats 0.5 mm inside the base. White bands Y16..24 and Y33..41 mm;
all remaining body faces orange. Runtime bounds mm:
[-16,0,-16] to [16,48,16]. Fixed materials robobuild-marker-charcoal,
robobuild-marker-orange, robobuild-marker-white.

Blender Z-up becomes glTF Y-up at export: (x,y,z) -> (x,z,-y).
Meter mesh coordinates, baked object transforms, no recentering. GeometryAsset
nativeUnits=m; nativeToScene identity rotation/position and uniform scale1000.
This is the only meter-to-scene-mm conversion. Materials are fixed opaque PBR
colors with authored roughness, not measured real-world material properties.
No textures, external dependencies, animations, or Draco decoder requirement.

Generated asset hashes:
""" + "".join(f"{asset['url']} SHA-256 {asset['sha256']}\n" for asset in assets)
        (staging / "PROVENANCE.txt").write_text(provenance, encoding="utf-8")
        manifest = {"schemaVersion": 1, "assets": assets, "materials": [{**definition, "evidence": EVIDENCE} for definition in MATERIALS]}
        (staging / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
        # Publish only after BOTH genuine exports and all metadata are ready;
        # manifest is last so it can never advertise an unexported new asset.
        OUTPUT.mkdir(parents=True, exist_ok=True)
        for filename in ("demo-block.glb", "course-marker.glb", "PROVENANCE.txt", "manifest.json"):
            (staging / filename).replace(OUTPUT / filename)
    print(f"Exported original RoboBuild props and actual SHA-256 metadata to {OUTPUT}")


if __name__ == "__main__":
    main()
