import bpy
import bmesh
import math
import os
from mathutils import Vector

print("=== Building Clean Slim Female Anatomical Model (No Middle Line / No Vestibule) ===")

bpy.ops.wm.read_factory_settings(use_empty=True)

# Helper: Convert HEX to Linear RGB for Blender shaders
def hex_to_rgb(hex_str):
    hex_str = hex_str.lstrip('#')
    lv = len(hex_str)
    fin = [int(hex_str[i:i + lv // 3], 16) / 255.0 for i in range(0, lv, lv // 3)]
    return [(c / 12.92) if c <= 0.04045 else math.pow((c + 0.055) / 1.055, 2.4) for c in fin] + [1.0]

# Helper: Create high quality PBR material
def create_pbr_material(name, hex_color, roughness=0.45, metallic=0.0, subsurface=0.0, coat=0.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if not bsdf:
        bsdf = mat.node_tree.nodes.new(type="ShaderNodeBsdfPrincipled")

    rgba = hex_to_rgb(hex_color)

    def set_inp(name_list, val):
        for n in name_list:
            if n in bsdf.inputs:
                bsdf.inputs[n].default_value = val
                return True
        return False

    set_inp(["Base Color"], rgba)
    set_inp(["Roughness"], roughness)
    set_inp(["Metallic"], metallic)
    if subsurface > 0.0:
        set_inp(["Subsurface Weight", "Subsurface"], subsurface)
        set_inp(["Subsurface Radius"], Vector((0.020, 0.012, 0.008)))
    if coat > 0.0:
        set_inp(["Coat Weight", "Coat"], coat)
        set_inp(["Coat Roughness"], 0.05)

    return mat

# Natural anatomical materials
MAT_SKIN = create_pbr_material("Mat_Female_Skin", "#EAC2B4", roughness=0.44, subsurface=0.18)
MAT_EYEBROW = create_pbr_material("Mat_Female_Eyebrow", "#33221A", roughness=0.40)
MAT_SCLERA = create_pbr_material("Mat_Eye_Sclera", "#FAF8F5", roughness=0.10, coat=0.8)
MAT_IRIS = create_pbr_material("Mat_Eye_Iris", "#4A5D4E", roughness=0.20, coat=0.8)
MAT_PUPIL = create_pbr_material("Mat_Eye_Pupil", "#0C0C0C", roughness=0.05, coat=1.0)
MAT_LIPS = create_pbr_material("Mat_Female_Lips", "#C27878", roughness=0.38, coat=0.25)
MAT_AREOLA = create_pbr_material("Mat_Female_Areola", "#C8867E", roughness=0.44, subsurface=0.18)

# ---------------------------------------------------------
# STEP 1: Import Base Female Body Surface
# ---------------------------------------------------------
base_obj_path = "D:/Physora/scratch/female_skin_base.obj"
print(f"Importing base female mesh from: {base_obj_path}")
bpy.ops.wm.obj_import(filepath=base_obj_path)
body = bpy.context.selected_objects[0]
body.name = "Female_Body_Surface"
bpy.context.view_layer.objects.active = body
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

body.data.materials.clear()
body.data.materials.append(MAT_SKIN)

# ---------------------------------------------------------
# STEP 2: Sculpt Feminine Silhouette via 3D B-Spline Lattice
# ---------------------------------------------------------
print("Deforming mesh via 3D B-spline Lattice for graceful female proportions...")

u_count = 5
v_count = 5
w_count = 21

lat_data = bpy.data.lattices.new('BodyLattice')
lat_data.points_u = u_count
lat_data.points_v = v_count
lat_data.points_w = w_count
lat_data.interpolation_type_u = 'KEY_BSPLINE'
lat_data.interpolation_type_v = 'KEY_BSPLINE'
lat_data.interpolation_type_w = 'KEY_BSPLINE'

lat_obj = bpy.data.objects.new('BodyLattice', lat_data)
bpy.context.collection.objects.link(lat_obj)

lat_obj.location = (0.0, 0.06, 0.83)
lat_obj.scale = (0.98, 0.36, 1.68)
bpy.context.view_layer.objects.active = lat_obj
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

mod = body.modifiers.new('LatticeMod', type='LATTICE')
mod.object = lat_obj

for w in range(w_count):
    t_z = w / (w_count - 1.0)
    world_z = t_z * 1.66

    for v in range(v_count):
        is_front = (v <= 1)

        for u in range(u_count):
            pt = lat_data.points[w * (u_count * v_count) + v * u_count + u]

            # 1. Slender jawline & soft chin (w = 18, 19)
            if 18 <= w <= 19:
                if u in [1, 2, 3]:
                    pt.co_deform[0] *= 0.89
                    if is_front:
                        pt.co_deform[1] += 0.02

            # 2. Slender neck (w = 17)
            if w == 17:
                if u in [1, 2, 3]:
                    pt.co_deform[0] *= 0.85
                    pt.co_deform[1] *= 0.88

            # 3. Narrow feminine shoulders (w = 15, 16)
            if 15 <= w <= 16:
                s_factor = math.sin((w - 14) / 3.0 * math.pi)
                pt.co_deform[0] *= (1.0 - 0.18 * s_factor)

            # 4. Slender arms (u = 0, u = 4)
            if 7 <= w <= 16:
                if u == 0:
                    pt.co_deform[0] += 0.045
                elif u == 4:
                    pt.co_deform[0] -= 0.045

            # 5. Natural teardrop breasts (w = 13, 14, 15)
            if 13 <= w <= 15:
                b_mult = 1.30 if w == 14 else 0.80
                if is_front and u in [1, 3]:
                    pt.co_deform[1] -= 0.095 * b_mult
                    if u == 1:
                        pt.co_deform[0] += 0.015
                    elif u == 3:
                        pt.co_deform[0] -= 0.015

            # 6. Hourglass waist & flat abdomen (w = 11, 12, 13)
            if 11 <= w <= 13:
                w_dist = abs(w - 12) / 1.5
                w_factor = math.cos(w_dist * (math.pi / 2.0))
                if u in [1, 2, 3]:
                    pt.co_deform[0] *= (1.0 - 0.26 * w_factor)
                if is_front and u in [1, 2, 3]:
                    pt.co_deform[1] += 0.090 * w_factor

            # 7. Curvaceous feminine hips (w = 9, 10, 11)
            if 9 <= w <= 11:
                h_dist = abs(w - 10) / 1.5
                h_factor = math.cos(h_dist * (math.pi / 2.0))
                if u in [1, 3]:
                    if u == 1:
                        pt.co_deform[0] -= 0.038 * h_factor
                    elif u == 3:
                        pt.co_deform[0] += 0.038 * h_factor

            # 8. Slender legs (w = 5, 6, 7)
            if 5 <= w <= 7:
                if u in [1, 3]:
                    pt.co_deform[0] *= 0.93

# Apply Lattice Modifier
bpy.context.view_layer.objects.active = body
bpy.ops.object.modifier_apply(modifier="LatticeMod")

# Smooth shading & surface smoothing modifier
bpy.ops.object.shade_smooth()
smooth_mod = body.modifiers.new(name="Surface_Smooth", type='SMOOTH')
smooth_mod.factor = 0.35
smooth_mod.iterations = 2
bpy.ops.object.modifier_apply(modifier="Surface_Smooth")

print("Body sculpting complete. Adding refined anatomical details...")

# ---------------------------------------------------------
# STEP 3: Natural Eyes
# ---------------------------------------------------------
def create_eye(name, center, look_dir=Vector((0, -1, 0))):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=20, ring_count=14, radius=0.0112, location=center)
    eye = bpy.context.selected_objects[0]
    eye.name = name

    bm = bmesh.new()
    bm.from_mesh(eye.data)

    eye.data.materials.append(MAT_SCLERA)
    eye.data.materials.append(MAT_IRIS)
    eye.data.materials.append(MAT_PUPIL)

    for f in bm.faces:
        face_center = f.calc_center_median()
        rel = (face_center - center).normalized()
        angle = rel.angle(look_dir)

        if angle < math.radians(9.0):
            f.material_index = 2 # Pupil
        elif angle < math.radians(24.0):
            f.material_index = 1 # Iris
        else:
            f.material_index = 0 # Sclera

    bm.to_mesh(eye.data)
    bm.free()
    eye.data.update()
    bpy.ops.object.shade_smooth()
    return eye

eye_left = create_eye("Female_Eye_Left", Vector((0.0315, -0.031, 1.550)))
eye_right = create_eye("Female_Eye_Right", Vector((-0.0315, -0.031, 1.550)))

# ---------------------------------------------------------
# STEP 4: Soft Eyebrows
# ---------------------------------------------------------
def create_eyebrow(name, is_left=True):
    sign = 1.0 if is_left else -1.0
    pts = [
        Vector((sign * 0.015, -0.038, 1.572)),
        Vector((sign * 0.024, -0.038, 1.575)),
        Vector((sign * 0.034, -0.037, 1.576)),
        Vector((sign * 0.043, -0.034, 1.571))
    ]

    curve_data = bpy.data.curves.new(name + "_Curve", type='CURVE')
    curve_data.dimensions = '3D'
    polyline = curve_data.splines.new('NURBS')
    polyline.points.add(len(pts) - 1)
    for i, pt in enumerate(pts):
        polyline.points[i].co = (pt.x, pt.y, pt.z, 1.0)
    polyline.use_endpoint_u = True
    curve_data.bevel_depth = 0.0012
    curve_data.bevel_resolution = 2

    brow_obj = bpy.data.objects.new(name, curve_data)
    bpy.context.collection.objects.link(brow_obj)

    bpy.context.view_layer.objects.active = brow_obj
    brow_obj.select_set(True)
    bpy.ops.object.convert(target='MESH')
    brow_obj.data.materials.append(MAT_EYEBROW)
    bpy.ops.object.shade_smooth()
    return brow_obj

eyebrow_left = create_eyebrow("Female_Eyebrow_Left", is_left=True)
eyebrow_right = create_eyebrow("Female_Eyebrow_Right", is_left=False)

# ---------------------------------------------------------
# STEP 5: Soft Rose Lips
# ---------------------------------------------------------
def create_lips():
    bm = bmesh.new()

    upper_lip = [
        Vector((-0.017, -0.043, 1.505)),
        Vector((-0.010, -0.046, 1.507)),
        Vector((-0.003, -0.047, 1.506)),
        Vector(( 0.000, -0.047, 1.505)),
        Vector(( 0.003, -0.047, 1.506)),
        Vector(( 0.010, -0.046, 1.507)),
        Vector(( 0.017, -0.043, 1.505))
    ]

    lower_lip = [
        Vector((-0.016, -0.042, 1.503)),
        Vector((-0.010, -0.045, 1.498)),
        Vector(( 0.000, -0.046, 1.496)),
        Vector(( 0.010, -0.045, 1.498)),
        Vector(( 0.016, -0.042, 1.503))
    ]

    mesh_lips = bpy.data.meshes.new("Female_Lips_Mesh")
    lips_obj = bpy.data.objects.new("Female_Lips", mesh_lips)
    bpy.context.collection.objects.link(lips_obj)

    u_verts_front = [bm.verts.new(p) for p in upper_lip]
    u_verts_back = [bm.verts.new(p + Vector((0, 0.002, 0))) for p in upper_lip]
    for i in range(len(u_verts_front) - 1):
        bm.faces.new([u_verts_front[i], u_verts_front[i+1], u_verts_back[i+1], u_verts_back[i]])

    l_verts_front = [bm.verts.new(p) for p in lower_lip]
    l_verts_back = [bm.verts.new(p + Vector((0, 0.002, 0))) for p in lower_lip]
    for i in range(len(l_verts_front) - 1):
        bm.faces.new([l_verts_front[i], l_verts_front[i+1], l_verts_back[i+1], l_verts_back[i]])

    bm.to_mesh(mesh_lips)
    bm.free()

    lips_obj.data.materials.append(MAT_LIPS)
    bpy.context.view_layer.objects.active = lips_obj
    lips_obj.select_set(True)
    bpy.ops.object.shade_smooth()

    sub_mod = lips_obj.modifiers.new("Subsurf", type='SUBSURF')
    sub_mod.levels = 1
    bpy.ops.object.modifier_apply(modifier="Subsurf")

    return lips_obj

lips_obj = create_lips()

# ---------------------------------------------------------
# STEP 6: Subtle Areolae and Papilla Mammae
# ---------------------------------------------------------
def create_areola_nipple(name, center, is_left=True):
    bm = bmesh.new()
    segs = 16
    r_areola = 0.013
    r_nipple = 0.0032
    h_nipple = 0.0025

    v_tip = bm.verts.new(center - Vector((0, h_nipple, 0)))

    v_nipple_ring = []
    for i in range(segs):
        ang = (i / segs) * 2.0 * math.pi
        px = center.x + math.cos(ang) * r_nipple
        py = center.y - (h_nipple * 0.35)
        pz = center.z + math.sin(ang) * r_nipple
        v_nipple_ring.append(bm.verts.new(Vector((px, py, pz))))

    for i in range(segs):
        bm.faces.new([v_tip, v_nipple_ring[i], v_nipple_ring[(i+1)%segs]])

    v_areola_ring = []
    for i in range(segs):
        ang = (i / segs) * 2.0 * math.pi
        px = center.x + math.cos(ang) * r_areola
        py = center.y + 0.0012
        pz = center.z + math.sin(ang) * r_areola
        v_areola_ring.append(bm.verts.new(Vector((px, py, pz))))

    for i in range(segs):
        bm.faces.new([v_nipple_ring[i], v_areola_ring[i], v_areola_ring[(i+1)%segs], v_nipple_ring[(i+1)%segs]])

    mesh_an = bpy.data.meshes.new(name + "_Mesh")
    obj = bpy.data.objects.new(name, mesh_an)
    bpy.context.collection.objects.link(obj)

    bm.to_mesh(mesh_an)
    bm.free()

    obj.data.materials.append(MAT_AREOLA)
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.shade_smooth()

    return obj

areola_left = create_areola_nipple("Female_Areola_Nipple_Left", Vector((0.098, -0.104, 1.185)), is_left=True)
areola_right = create_areola_nipple("Female_Areola_Nipple_Right", Vector((-0.098, -0.104, 1.185)), is_left=False)

# NOTE: The body surface in the pelvic/groin region is completely smooth, seamless, and clean.
# No vaginal vestibule mesh, no labia minora mesh, no middle slit line.
# Clean, professional medical reference anatomy.

all_created = [
    body,
    eye_left,
    eye_right,
    eyebrow_left,
    eyebrow_right,
    lips_obj,
    areola_left,
    areola_right
]

# ---------------------------------------------------------
# STEP 7: Export to GLB
# ---------------------------------------------------------
export_path = "D:/Physora/public/models/female_body_beautified.glb"
print(f"Exporting clean female model to: {export_path}")

bpy.ops.object.select_all(action='DESELECT')
for obj in all_created:
    obj.select_set(True)

bpy.ops.export_scene.gltf(
    filepath=export_path,
    export_format='GLB',
    use_selection=True,
    export_apply=True,
    export_materials='EXPORT'
)

file_size = os.path.getsize(export_path)
print(f"✅ SUCCESS: Exported {export_path} ({file_size / (1024*1024):.2f} MB)")
print("=== Clean Professional Female Model Pipeline Complete ===")
