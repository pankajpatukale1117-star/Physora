"""
Blender Python script: Sculpt a genuinely slim, feminine, beautiful female anatomical reference body.
- Removes the ugly blocky hair completely.
- Slims shoulders, arms, neck, waist, and abdomen to create an authentic, natural young female silhouette.
- Creates natural, firm, symmetrical teardrop female breasts.
- Sculpts anatomically clean external vulva without harsh red stripes.
- Adds realistic eyes and natural rose lips on a refined feminine face.
- Applies warm, healthy PBR skin material with subsurface scattering.
- Exports to public/models/female_body_beautified.glb.
"""

import math
import os
import sys
import bpy
import bmesh
from mathutils import Vector

print("=== Starting Professional Slim Female Body Sculpt in Blender ===")

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

# Natural, healthy female anatomical materials
MAT_SKIN = create_pbr_material("Mat_Female_Skin", "#EAB8A8", roughness=0.44, subsurface=0.18)
MAT_EYEBROW = create_pbr_material("Mat_Female_Eyebrow", "#322018", roughness=0.40)
MAT_SCLERA = create_pbr_material("Mat_Eye_Sclera", "#FAF8F5", roughness=0.08, coat=0.8)
MAT_IRIS = create_pbr_material("Mat_Eye_Iris", "#3B6E55", roughness=0.15, coat=0.8)
MAT_PUPIL = create_pbr_material("Mat_Eye_Pupil", "#0A0A0A", roughness=0.02, coat=1.0)
MAT_LIPS = create_pbr_material("Mat_Female_Lips", "#C26B6B", roughness=0.35, coat=0.35)
MAT_AREOLA = create_pbr_material("Mat_Female_Areola_Nipple", "#C87A6E", roughness=0.42, subsurface=0.20)
MAT_MONS = create_pbr_material("Mat_Mons_Pubis", "#EAB8A8", roughness=0.46, subsurface=0.16)
MAT_LABIA_MAJ = create_pbr_material("Mat_Labia_Majora", "#DCA092", roughness=0.42, subsurface=0.18)
MAT_LABIA_MIN = create_pbr_material("Mat_Labia_Minora", "#CF747C", roughness=0.30, coat=0.25)
MAT_CLITORIS = create_pbr_material("Mat_Glans_Clitoridis", "#D4656F", roughness=0.26, coat=0.35)
MAT_VESTIBULE = create_pbr_material("Mat_Vaginal_Vestibule", "#BC5A66", roughness=0.24, coat=0.40)

# ---------------------------------------------------------
# STEP 1: Import Base Female Body Mesh
# ---------------------------------------------------------
base_obj_path = "D:/Physora/scratch/female_skin_base.obj"
print(f"Importing base female mesh from: {base_obj_path}")
bpy.ops.wm.obj_import(filepath=base_obj_path)
body_obj = bpy.context.selected_objects[0]
body_obj.name = "Female_Body_Surface"
body_obj.data.materials.clear()
body_obj.data.materials.append(MAT_SKIN)

# ---------------------------------------------------------
# STEP 2: Sculpt a Genuinely Slim, Feminine Figure
# ---------------------------------------------------------
print("Applying professional feminine slimming & body sculpting...")

bm = bmesh.new()
bm.from_mesh(body_obj.data)

# Anatomical landmarks (Y is Up, Z is Forward, X is Right)
LB_CENTER = Vector((0.088, 1.205, 0.055))
RB_CENTER = Vector((-0.088, 1.205, 0.055))
BREAST_RADIUS = 0.072

for v in bm.verts:
    x, y, z = v.co.x, v.co.y, v.co.z

    # 1. SLIM SHOULDERS & SLENDER ARMS (Remove male bulk)
    if 1.28 < y < 1.44:
        # Narrow biacromial shoulder width by 14%
        s_factor = math.sin((y - 1.28) / (1.44 - 1.28) * math.pi)
        if abs(x) > 0.075:
            arm_reach = min(1.0, (abs(x) - 0.075) / 0.14)
            v.co.x *= (1.0 - 0.14 * s_factor * arm_reach)

    # Slim arms throughout the whole limb (y from 0.75 to 1.35, abs(x) > 0.16)
    if 0.70 < y < 1.35 and abs(x) > 0.14:
        # Arm axis approximate line
        arm_center_x = 0.22 if x > 0 else -0.22
        arm_dx = x - arm_center_x
        # Slim arm girth by 16%
        v.co.x = arm_center_x + (arm_dx * 0.84)
        v.co.z *= 0.86

    # 2. SLIM GRACEFUL NECK
    if 1.36 < y < 1.46 and abs(x) < 0.075:
        neck_factor = math.sin((y - 1.36) / (1.46 - 1.36) * math.pi)
        v.co.x *= (1.0 - 0.12 * neck_factor)
        v.co.z *= (1.0 - 0.10 * neck_factor)

    # 3. SLIM HOURGLASS WAIST & FLAT ABDOMEN (0.70 waist-to-hip ratio)
    if 0.94 < y < 1.07:
        # Waist center at y ≈ 1.005
        w_dist = abs(y - 1.005) / 0.065
        if w_dist < 1.0:
            w_factor = math.cos(w_dist * (math.pi / 2.0))
            # Deepen waist indent laterally
            v.co.x *= (1.0 - 0.18 * w_factor)
            # Flatten belly bulge completely
            if z > -0.01:
                v.co.z -= 0.022 * w_factor * min(1.0, (z + 0.01) / 0.04)

    # Flatten lower abdomen / suprapubic protrusion
    if 0.84 < y < 0.95 and z > 0.00:
        v.co.z -= 0.015 * min(1.0, z / 0.035)

    # 4. FEMININE CURVACEOUS HIPS (Natural outward curve)
    if 0.84 < y < 0.94 and abs(x) > 0.11:
        hip_dist = abs(y - 0.89) / 0.05
        if hip_dist < 1.0:
            hip_factor = math.cos(hip_dist * (math.pi / 2.0))
            # Widen hips smoothly
            if x > 0:
                v.co.x += 0.012 * hip_factor
            else:
                v.co.x -= 0.012 * hip_factor

    # 5. SLIMMED LEGS & KNEES (Smooth, slender feminine contours)
    if 0.40 < y < 0.80 and abs(x) > 0.03:
        # Subtle tapering of lateral thigh bulk for a slender leg silhouette
        if abs(x) > 0.12:
            v.co.x *= 0.94
        # Slim knees (y ≈ 0.46 - 0.52)
        if 0.46 < y < 0.52:
            v.co.x *= 0.95
            v.co.z *= 0.95

    # 6. FEMININE FACIAL CONTOURS (Slender jawline, softer chin, gentle brow)
    if 1.45 < y < 1.51 and abs(x) < 0.045:
        # Taper jawline
        v.co.x *= 0.88
        v.co.z -= 0.004
    if 1.55 < y < 1.59 and z > 0.030:
        # Soften brow ridge
        v.co.z -= 0.004

    # 7. NATURAL, FIRM, SYMMETRICAL TEARDROP BREASTS
    # Left Breast
    dist_l = (Vector((x, y, z)) - LB_CENTER).length
    if dist_l < BREAST_RADIUS and z > 0.015:
        falloff = math.cos((dist_l / BREAST_RADIUS) * (math.pi / 2.0))
        # Natural teardrop contour (lower pole fuller)
        pole_mult = 1.12 if y < 1.205 else 0.88
        v.co.z += 0.024 * falloff * pole_mult
        v.co.x += 0.003 * falloff
        v.co.y += 0.002 * falloff

    # Right Breast
    dist_r = (Vector((x, y, z)) - RB_CENTER).length
    if dist_r < BREAST_RADIUS and z > 0.015:
        falloff = math.cos((dist_r / BREAST_RADIUS) * (math.pi / 2.0))
        pole_mult = 1.12 if y < 1.205 else 0.88
        v.co.z += 0.024 * falloff * pole_mult
        v.co.x -= 0.003 * falloff
        v.co.y += 0.002 * falloff

    # 8. Natural inner-thigh clearing for pelvic / vulva visibility
    if 0.76 < y < 0.83 and abs(x) < 0.040 and z < 0.01:
        cleft_factor = math.sin((y - 0.76) / (0.83 - 0.76) * math.pi)
        if x > 0:
            v.co.x += 0.0055 * cleft_factor
        elif x < 0:
            v.co.x -= 0.0055 * cleft_factor

bm.to_mesh(body_obj.data)
bm.free()
body_obj.data.update()

# Smooth surface shading & apply subdivision/smooth
bpy.ops.object.select_all(action='DESELECT')
body_obj.select_set(True)
bpy.context.view_layer.objects.active = body_obj
bpy.ops.object.shade_smooth()

smooth_mod = body_obj.modifiers.new(name="Surface_Smooth", type='SMOOTH')
smooth_mod.factor = 0.40
smooth_mod.iterations = 3
bpy.ops.object.modifier_apply(modifier="Surface_Smooth")

print("Slim female body morphing completed.")

# ---------------------------------------------------------
# STEP 3: Add Colored Eyes (Left & Right) with Sclera, Iris & Pupil
# ---------------------------------------------------------
print("Creating realistic 3D female eyes...")

def create_eye(name, center, look_dir=Vector((0, 0, 1))):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=20, ring_count=14, radius=0.0118, location=center)
    eye = bpy.context.selected_objects[0]
    eye.name = name

    bm = bmesh.new()
    bm.from_mesh(eye.data)

    eye.data.materials.append(MAT_SCLERA)   # Index 0
    eye.data.materials.append(MAT_IRIS)     # Index 1
    eye.data.materials.append(MAT_PUPIL)    # Index 2

    for f in bm.faces:
        face_center = f.calc_center_median()
        rel = (face_center - center).normalized()
        angle = rel.angle(look_dir)

        if angle < math.radians(10.0):
            f.material_index = 2 # Pupil
        elif angle < math.radians(26.0):
            f.material_index = 1 # Iris
        else:
            f.material_index = 0 # Sclera

    bm.to_mesh(eye.data)
    bm.free()
    eye.data.update()

    bpy.ops.object.shade_smooth()
    return eye

eye_left = create_eye("Female_Eye_Left", Vector((0.0315, 1.542, 0.034)))
eye_right = create_eye("Female_Eye_Right", Vector((-0.0315, 1.542, 0.034)))

# ---------------------------------------------------------
# STEP 4: Add Delicate Arched Eyebrows
# ---------------------------------------------------------
print("Creating delicate arched eyebrows...")

def create_eyebrow(name, is_left=True):
    sign = 1.0 if is_left else -1.0
    pts = [
        Vector((sign * 0.015, 1.562, 0.038)),
        Vector((sign * 0.024, 1.566, 0.038)),
        Vector((sign * 0.034, 1.568, 0.037)),
        Vector((sign * 0.043, 1.563, 0.034))
    ]

    curve_data = bpy.data.curves.new(name + "_Curve", type='CURVE')
    curve_data.dimensions = '3D'
    polyline = curve_data.splines.new('NURBS')
    polyline.points.add(len(pts) - 1)
    for i, pt in enumerate(pts):
        polyline.points[i].co = (pt.x, pt.y, pt.z, 1.0)
    polyline.use_endpoint_u = True
    curve_data.bevel_depth = 0.0013
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
# STEP 5: Add Sculpted Rose Lips (Cupid's Bow)
# ---------------------------------------------------------
print("Creating sculpted rose lips...")

def create_lips():
    bm = bmesh.new()

    upper_lip_profile = [
        Vector((-0.019, 1.503, 0.040)),
        Vector((-0.010, 1.507, 0.043)),
        Vector((-0.003, 1.506, 0.044)),
        Vector(( 0.000, 1.504, 0.044)),
        Vector(( 0.003, 1.506, 0.044)),
        Vector(( 0.010, 1.507, 0.043)),
        Vector(( 0.019, 1.503, 0.040))
    ]

    lower_lip_profile = [
        Vector((-0.018, 1.502, 0.040)),
        Vector((-0.011, 1.498, 0.042)),
        Vector(( 0.000, 1.496, 0.043)),
        Vector(( 0.011, 1.498, 0.042)),
        Vector(( 0.018, 1.502, 0.040))
    ]

    mesh_lips = bpy.data.meshes.new("Female_Lips_Mesh")
    lips_obj = bpy.data.objects.new("Female_Lips", mesh_lips)
    bpy.context.collection.objects.link(lips_obj)

    u_verts_front = [bm.verts.new(p) for p in upper_lip_profile]
    u_verts_back = [bm.verts.new(p - Vector((0, 0, 0.0025))) for p in upper_lip_profile]
    for i in range(len(u_verts_front) - 1):
        bm.faces.new([u_verts_front[i], u_verts_front[i+1], u_verts_back[i+1], u_verts_back[i]])

    l_verts_front = [bm.verts.new(p) for p in lower_lip_profile]
    l_verts_back = [bm.verts.new(p - Vector((0, 0, 0.0025))) for p in lower_lip_profile]
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

# NOTE: NO HAIR! The user explicitly requested removing the hair: "and remove that hair and its not good"
# Clean medical anatomical reference heads are standard across Complete Anatomy, BioDigital, Zygote, and 3D Organon.

# ---------------------------------------------------------
# STEP 6: Add Subtle Anatomical Areolae & Nipple Apexes
# ---------------------------------------------------------
print("Creating natural areolae and nipple apexes...")

def create_areola_nipple(name, center, is_left=True):
    bm = bmesh.new()
    segs = 16
    r_areola = 0.015
    r_nipple = 0.0038
    h_nipple = 0.0032

    # Nipple tip
    v_tip = bm.verts.new(center + Vector((0, 0, h_nipple)))

    # Nipple ring
    v_nipple_ring = []
    for i in range(segs):
        ang = (i / segs) * 2.0 * math.pi
        px = center.x + math.cos(ang) * r_nipple
        py = center.y + math.sin(ang) * r_nipple
        pz = center.z + (h_nipple * 0.35)
        v_nipple_ring.append(bm.verts.new(Vector((px, py, pz))))

    for i in range(segs):
        bm.faces.new([v_tip, v_nipple_ring[i], v_nipple_ring[(i+1)%segs]])

    # Areola ring
    v_areola_ring = []
    for i in range(segs):
        ang = (i / segs) * 2.0 * math.pi
        px = center.x + math.cos(ang) * r_areola
        py = center.y + math.sin(ang) * r_areola
        pz = center.z - 0.0018
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

areola_left = create_areola_nipple("Female_Areola_Nipple_Left", Vector((0.091, 1.202, 0.088)), is_left=True)
areola_right = create_areola_nipple("Female_Areola_Nipple_Right", Vector((-0.091, 1.202, 0.088)), is_left=False)

# ---------------------------------------------------------
# STEP 7: Add Complete, Anatomically Subtle External Female Genitalia
# ---------------------------------------------------------
print("Sculpting anatomically clean external female genitalia...")

# 7.1 Mons Pubis (Soft anterior cushion)
def create_mons_pubis():
    bpy.ops.mesh.primitive_uv_sphere_add(segments=14, ring_count=10, radius=0.021, location=Vector((0, 0.820, 0.013)))
    mons = bpy.context.selected_objects[0]
    mons.name = "Mons_Pubis"
    mons.scale = (1.25, 0.75, 0.55)
    bpy.ops.object.transform_apply(scale=True)
    mons.data.materials.append(MAT_MONS)
    bpy.ops.object.shade_smooth()
    return mons

mons_pubis = create_mons_pubis()

# 7.2 Labia Majora (Left & Right outer folds)
def create_labium_majus(name, is_left=True):
    sign = 1.0 if is_left else -1.0
    bm = bmesh.new()

    pts = [
        Vector((sign * 0.005, 0.810,  0.004)),
        Vector((sign * 0.011, 0.801, -0.005)),
        Vector((sign * 0.013, 0.791, -0.014)),
        Vector((sign * 0.011, 0.782, -0.021)),
        Vector((sign * 0.004, 0.774, -0.025))
    ]

    segs = 8
    radius = 0.0058
    slice_verts = []

    for idx, pt in enumerate(pts):
        r_current = radius * (1.0 if 0 < idx < 4 else 0.45)
        cur_ring = []
        for s in range(segs):
            ang = (s / segs) * 2.0 * math.pi
            dx = math.cos(ang) * (r_current * 0.85)
            dz = math.sin(ang) * r_current
            cur_ring.append(bm.verts.new(pt + Vector((dx, 0, dz))))
        slice_verts.append(cur_ring)

    for i in range(len(pts) - 1):
        for s in range(segs):
            v0 = slice_verts[i][s]
            v1 = slice_verts[i][(s+1)%segs]
            v2 = slice_verts[i+1][(s+1)%segs]
            v3 = slice_verts[i+1][s]
            bm.faces.new([v0, v1, v2, v3])

    mesh_lm = bpy.data.meshes.new(name + "_Mesh")
    obj = bpy.data.objects.new(name, mesh_lm)
    bpy.context.collection.objects.link(obj)

    bm.to_mesh(mesh_lm)
    bm.free()

    obj.data.materials.append(MAT_LABIA_MAJ)
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.shade_smooth()
    return obj

labia_maj_l = create_labium_majus("Labia_Majora_Left", is_left=True)
labia_maj_r = create_labium_majus("Labia_Majora_Right", is_left=False)

# 7.3 Labia Minora (Left & Right inner folds)
def create_labium_minus(name, is_left=True):
    sign = 1.0 if is_left else -1.0
    bm = bmesh.new()

    pts = [
        Vector((sign * 0.002, 0.808,  0.003)),
        Vector((sign * 0.005, 0.800, -0.005)),
        Vector((sign * 0.005, 0.791, -0.014)),
        Vector((sign * 0.004, 0.783, -0.020)),
        Vector((sign * 0.002, 0.776, -0.024))
    ]

    segs = 6
    radius = 0.0028
    slice_verts = []

    for idx, pt in enumerate(pts):
        r_current = radius * (1.1 if 0 < idx < 4 else 0.4)
        cur_ring = []
        for s in range(segs):
            ang = (s / segs) * 2.0 * math.pi
            dx = math.cos(ang) * (r_current * 0.6)
            dz = math.sin(ang) * r_current
            cur_ring.append(bm.verts.new(pt + Vector((dx, 0, dz))))
        slice_verts.append(cur_ring)

    for i in range(len(pts) - 1):
        for s in range(segs):
            v0 = slice_verts[i][s]
            v1 = slice_verts[i][(s+1)%segs]
            v2 = slice_verts[i+1][(s+1)%segs]
            v3 = slice_verts[i+1][s]
            bm.faces.new([v0, v1, v2, v3])

    mesh_lm = bpy.data.meshes.new(name + "_Mesh")
    obj = bpy.data.objects.new(name, mesh_lm)
    bpy.context.collection.objects.link(obj)

    bm.to_mesh(mesh_lm)
    bm.free()

    obj.data.materials.append(MAT_LABIA_MIN)
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.shade_smooth()
    return obj

labia_min_l = create_labium_minus("Labia_Minora_Left", is_left=True)
labia_min_r = create_labium_minus("Labia_Minora_Right", is_left=False)

# 7.4 Clitoral Hood & Glans Clitoridis
def create_clitoris():
    bpy.ops.mesh.primitive_uv_sphere_add(segments=10, ring_count=6, radius=0.0036, location=Vector((0, 0.810, 0.0045)))
    hood = bpy.context.selected_objects[0]
    hood.name = "Clitoral_Hood_Prepuce"
    hood.scale = (1.0, 1.3, 0.65)
    bpy.ops.object.transform_apply(scale=True)
    hood.data.materials.append(MAT_LABIA_MIN)
    bpy.ops.object.shade_smooth()

    bpy.ops.mesh.primitive_uv_sphere_add(segments=10, ring_count=6, radius=0.0025, location=Vector((0, 0.807, 0.0028)))
    glans = bpy.context.selected_objects[0]
    glans.name = "Glans_Clitoridis"
    glans.scale = (0.85, 1.0, 0.8)
    bpy.ops.object.transform_apply(scale=True)
    glans.data.materials.append(MAT_CLITORIS)
    bpy.ops.object.shade_smooth()

    return hood, glans

clitoral_hood, glans_clitoris = create_clitoris()

# 7.5 Vaginal Vestibule & Introitus
def create_vestibule():
    bm = bmesh.new()

    v_floor = [
        Vector(( 0.000, 0.804, -0.002)),
        Vector((-0.003, 0.797, -0.009)),
        Vector(( 0.003, 0.797, -0.009)),
        Vector((-0.004, 0.787, -0.017)),
        Vector(( 0.004, 0.787, -0.017)),
        Vector(( 0.000, 0.777, -0.023))
    ]

    for p in v_floor:
        bm.verts.new(p)

    i_center = Vector((0, 0.785, -0.016))
    i_outer_ring = []
    i_inner_canal = []
    for i in range(10):
        ang = (i / 10) * 2.0 * math.pi
        px = i_center.x + math.cos(ang) * 0.0036
        py = i_center.y + math.sin(ang) * 0.0058
        i_outer_ring.append(bm.verts.new(Vector((px, py, i_center.z))))
        i_inner_canal.append(bm.verts.new(Vector((px * 0.7, py * 0.8, i_center.z - 0.015))))

    for i in range(10):
        v0 = i_outer_ring[i]
        v1 = i_outer_ring[(i+1)%10]
        v2 = i_inner_canal[(i+1)%10]
        v3 = i_inner_canal[i]
        bm.faces.new([v0, v1, v2, v3])

    mesh_vest = bpy.data.meshes.new("Vaginal_Vestibule_Mesh")
    obj = bpy.data.objects.new("Vaginal_Vestibule", mesh_vest)
    bpy.context.collection.objects.link(obj)

    bm.to_mesh(mesh_vest)
    bm.free()

    obj.data.materials.append(MAT_VESTIBULE)
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.shade_smooth()

    return obj

vestibule_obj = create_vestibule()

# ---------------------------------------------------------
# STEP 8: Coordinate Alignment & Clean Export
# ---------------------------------------------------------
all_created = [
    body_obj,
    eye_left,
    eye_right,
    eyebrow_left,
    eyebrow_right,
    lips_obj,
    areola_left,
    areola_right,
    mons_pubis,
    labia_maj_l,
    labia_maj_r,
    labia_min_l,
    labia_min_r,
    clitoral_hood,
    glans_clitoris,
    vestibule_obj
]

# Apply coordinate alignment (Blender +Z up -> glTF +Y up)
bpy.ops.object.select_all(action='DESELECT')
for obj in all_created:
    obj.rotation_euler = (1.5707963, 0, 0)
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.transform_apply(rotation=True)
    obj.select_set(False)

export_path = "D:/Physora/public/models/female_body_beautified.glb"
print(f"Exporting slim female model to: {export_path}")

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
print("=== Professional Slim Female Body Pipeline Finished ===")
