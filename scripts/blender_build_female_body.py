"""
Headless Blender Python pipeline: Rebuild Female Body Surface
Feminizes the HRA base body mesh, sculpts teardrop breasts, adds hair, eyebrows, eyes,
lips, areolae/nipples, and complete external female genitalia (mons pubis, labia majora,
labia minora, clitoral hood & glans, vaginal vestibule & introitus).
Exports to public/models/female_body_beautified.glb with full PBR materials.
"""

import math
import os
import sys
import bpy
import bmesh
from mathutils import Vector, Matrix

print("=== Starting Physora Blender Female Body Rebuild Pipeline ===")

# Reset Blender to completely clean scene
bpy.ops.wm.read_factory_settings(use_empty=True)

# Helper: Convert HEX to sRGB float tuple
def hex_to_rgb(hex_str):
    hex_str = hex_str.lstrip('#')
    lv = len(hex_str)
    fin = [int(hex_str[i:i + lv // 3], 16) / 255.0 for i in range(0, lv, lv // 3)]
    # Convert sRGB gamma to Linear RGB for Blender shaders
    return [(c / 12.92) if c <= 0.04045 else math.pow((c + 0.055) / 1.055, 2.4) for c in fin] + [1.0]

# Helper: Create high quality PBR material with Blender 5.4 Principled BSDF
def create_pbr_material(name, hex_color, roughness=0.45, metallic=0.0, subsurface=0.0, coat=0.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    bsdf = nodes.get("Principled BSDF")
    if not bsdf:
        bsdf = nodes.new(type="ShaderNodeBsdfPrincipled")

    rgba = hex_to_rgb(hex_color)
    
    # Safe input setting across Blender versions
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
        sub_col = [min(1.0, c * 1.15) for c in rgba[:3]] + [1.0]
        set_inp(["Subsurface Radius"], Vector((0.025, 0.015, 0.010)))
    if coat > 0.0:
        set_inp(["Coat Weight", "Coat"], coat)
        set_inp(["Coat Roughness"], 0.04)

    return mat

# Materials definition matching specifications
MAT_SKIN = create_pbr_material("Mat_Female_Skin", "#F1C2AC", roughness=0.44, subsurface=0.15)
MAT_HAIR = create_pbr_material("Mat_Female_Hair", "#261710", roughness=0.38)
MAT_EYEBROW = create_pbr_material("Mat_Female_Eyebrow", "#261710", roughness=0.40)
MAT_SCLERA = create_pbr_material("Mat_Eye_Sclera", "#FAF8F5", roughness=0.08, coat=0.8)
MAT_IRIS = create_pbr_material("Mat_Eye_Iris", "#3D6B52", roughness=0.15, coat=0.8)
MAT_PUPIL = create_pbr_material("Mat_Eye_Pupil", "#0B0B0B", roughness=0.02, coat=1.0)
MAT_LIPS = create_pbr_material("Mat_Female_Lips", "#C86D6D", roughness=0.35, coat=0.4)
MAT_AREOLA = create_pbr_material("Mat_Female_Areola_Nipple", "#C67B71", roughness=0.42, subsurface=0.2)
MAT_MONS = create_pbr_material("Mat_Mons_Pubis", "#F1C2AC", roughness=0.48, subsurface=0.12)
MAT_LABIA_MAJ = create_pbr_material("Mat_Labia_Majora", "#E2A393", roughness=0.45, subsurface=0.15)
MAT_LABIA_MIN = create_pbr_material("Mat_Labia_Minora", "#CF6E78", roughness=0.32, coat=0.2)
MAT_CLITORIS = create_pbr_material("Mat_Glans_Clitoridis", "#D65C6C", roughness=0.28, coat=0.3)
MAT_VESTIBULE = create_pbr_material("Mat_Vaginal_Vestibule", "#B84A5A", roughness=0.25, coat=0.5)

# ---------------------------------------------------------
# STEP 1: Import Base Female Body Mesh
# ---------------------------------------------------------
base_obj_path = "D:/Physora/scratch/female_skin_base.obj"
if not os.path.exists(base_obj_path):
    print(f"Error: {base_obj_path} does not exist!")
    sys.exit(1)

print(f"Importing base OBJ from: {base_obj_path}")
bpy.ops.wm.obj_import(filepath=base_obj_path)
body_obj = bpy.context.selected_objects[0]
body_obj.name = "Female_Body_Surface"

# Assign Skin Material
body_obj.data.materials.clear()
body_obj.data.materials.append(MAT_SKIN)

# ---------------------------------------------------------
# STEP 2: Feminize Body Silhouette with Proportional Vertex Morphing
# ---------------------------------------------------------
print("Applying smooth proportional vertex morphing to body silhouette...")

mesh = body_obj.data
bm = bmesh.new()
bm.from_mesh(mesh)

# Breast landmark anchors
LB_CENTER = Vector((0.092, 1.205, 0.065))
RB_CENTER = Vector((-0.092, 1.205, 0.065))
BREAST_RADIUS = 0.078

for v in bm.verts:
    x, y, z = v.co.x, v.co.y, v.co.z

    # 1. Narrow biacromial shoulder width by up to 12% & slim upper arms
    if 1.28 < y < 1.45:
        y_factor = math.sin((y - 1.28) / (1.45 - 1.28) * math.pi)
        if abs(x) > 0.08:
            arm_factor = min(1.0, (abs(x) - 0.08) / 0.12)
            narrow_factor = 1.0 - (0.12 * y_factor * arm_factor)
            v.co.x *= narrow_factor
        # Slim neck slightly
        if abs(x) < 0.065 and y > 1.36:
            v.co.x *= 0.94
            v.co.z *= 0.95

    # 2. Taper waist & flatten protruding cadaver abdomen (Waist-to-Hip 0.72 curve)
    if 0.93 < y < 1.08:
        # Waist center at y ≈ 1.00
        w_factor = math.cos((y - 1.00) / 0.08 * (math.pi / 2.0))
        if w_factor > 0:
            # Narrow waist width (x)
            v.co.x *= (1.0 - 0.135 * w_factor)
            # Flatten abdominal protrusion (anterior z)
            if z > 0.01:
                v.co.z -= 0.014 * w_factor * min(1.0, z / 0.04)

    # 3. Soften heavy jaw/chin and brow ridge
    if 1.46 < y < 1.50 and abs(x) < 0.048 and z > 0.015:
        # Taper lower jaw width
        v.co.x *= 0.91
        v.co.z -= 0.003
    if 1.55 < y < 1.59 and z > 0.035:
        # Soften brow ridge
        v.co.z -= 0.0035

    # 4. Reshape Breasts into natural symmetrical teardrop contours
    # Left Breast
    dist_l = (Vector((x, y, z)) - LB_CENTER).length
    if dist_l < BREAST_RADIUS and z > 0.02:
        falloff = math.cos((dist_l / BREAST_RADIUS) * (math.pi / 2.0))
        # Teardrop fullness on lower pole (y < 1.205)
        pole_mult = 1.15 if y < 1.205 else 0.90
        v.co.z += 0.035 * falloff * pole_mult
        # Slight outward/upward lift
        v.co.x += 0.004 * falloff
        v.co.y += 0.003 * falloff

    # Right Breast
    dist_r = (Vector((x, y, z)) - RB_CENTER).length
    if dist_r < BREAST_RADIUS and z > 0.02:
        falloff = math.cos((dist_r / BREAST_RADIUS) * (math.pi / 2.0))
        pole_mult = 1.15 if y < 1.205 else 0.90
        v.co.z += 0.035 * falloff * pole_mult
        v.co.x -= 0.004 * falloff
        v.co.y += 0.003 * falloff

    # 5. Inner thigh abduction to clear pudendal cleft for vulva visibility
    if 0.75 < y < 0.83 and abs(x) < 0.045 and z < 0.01:
        cleft_factor = math.sin((y - 0.75) / (0.83 - 0.75) * math.pi)
        if x > 0:
            v.co.x += 0.0065 * cleft_factor
        elif x < 0:
            v.co.x -= 0.0065 * cleft_factor

bm.to_mesh(mesh)
bm.free()
mesh.update()

# Shade smooth and add subtle Smooth modifier to remove all blocky facets
bpy.ops.object.select_all(action='DESELECT')
body_obj.select_set(True)
bpy.context.view_layer.objects.active = body_obj
bpy.ops.object.shade_smooth()

smooth_mod = body_obj.modifiers.new(name="Surface_Smooth", type='SMOOTH')
smooth_mod.factor = 0.35
smooth_mod.iterations = 2
bpy.ops.object.modifier_apply(modifier="Surface_Smooth")

print("Body silhouette morphing completed.")

# ---------------------------------------------------------
# STEP 3: Add Eyes (Left & Right) with Sclera, Iris, Pupil & Cornea
# ---------------------------------------------------------
print("Creating realistic 3D female eyes...")

def create_eye(name, center, look_dir=Vector((0, 0, 1))):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=16, radius=0.0125, location=center)
    eye = bpy.context.selected_objects[0]
    eye.name = name

    # Align pupil towards forward Z
    bm = bmesh.new()
    bm.from_mesh(eye.data)

    eye.data.materials.append(MAT_SCLERA)   # Index 0
    eye.data.materials.append(MAT_IRIS)     # Index 1
    eye.data.materials.append(MAT_PUPIL)    # Index 2

    for f in bm.faces:
        face_center = f.calc_center_median()
        rel = (face_center - center).normalized()
        angle = rel.angle(look_dir)

        if angle < math.radians(11.0):
            f.material_index = 2 # Pupil
        elif angle < math.radians(28.0):
            f.material_index = 1 # Iris
        else:
            f.material_index = 0 # Sclera

    bm.to_mesh(eye.data)
    bm.free()
    eye.data.update()

    bpy.ops.object.shade_smooth()
    return eye

eye_left = create_eye("Female_Eye_Left", Vector((0.0325, 1.542, 0.035)))
eye_right = create_eye("Female_Eye_Right", Vector((-0.0325, 1.542, 0.035)))

# ---------------------------------------------------------
# STEP 4: Add Eyebrows (Left & Right)
# ---------------------------------------------------------
print("Creating arched female eyebrows...")

def create_eyebrow(name, is_left=True):
    sign = 1.0 if is_left else -1.0
    pts = [
        Vector((sign * 0.016, 1.562, 0.039)),
        Vector((sign * 0.026, 1.567, 0.039)),
        Vector((sign * 0.036, 1.569, 0.038)),
        Vector((sign * 0.046, 1.564, 0.035))
    ]

    curve_data = bpy.data.curves.new(name + "_Curve", type='CURVE')
    curve_data.dimensions = '3D'
    polyline = curve_data.splines.new('NURBS')
    polyline.points.add(len(pts) - 1)
    for i, pt in enumerate(pts):
        polyline.points[i].co = (pt.x, pt.y, pt.z, 1.0)
    polyline.use_endpoint_u = True

    curve_data.bevel_depth = 0.0016
    curve_data.bevel_resolution = 3

    brow_obj = bpy.data.objects.new(name, curve_data)
    bpy.context.collection.objects.link(brow_obj)

    # Convert curve to mesh
    bpy.context.view_layer.objects.active = brow_obj
    brow_obj.select_set(True)
    bpy.ops.object.convert(target='MESH')
    brow_obj.data.materials.append(MAT_EYEBROW)
    bpy.ops.object.shade_smooth()
    return brow_obj

eyebrow_left = create_eyebrow("Female_Eyebrow_Left", is_left=True)
eyebrow_right = create_eyebrow("Female_Eyebrow_Right", is_left=False)

# ---------------------------------------------------------
# STEP 5: Add Lips (Upper & Lower Vermilion)
# ---------------------------------------------------------
print("Creating sculpted rose female lips...")

def create_lips():
    bm = bmesh.new()

    # Contoured upper lip (Cupid's bow) and lower lip
    upper_lip_profile = [
        Vector((-0.022, 1.503, 0.041)),
        Vector((-0.012, 1.507, 0.044)),
        Vector((-0.004, 1.506, 0.046)),
        Vector(( 0.000, 1.504, 0.046)),
        Vector(( 0.004, 1.506, 0.046)),
        Vector(( 0.012, 1.507, 0.044)),
        Vector(( 0.022, 1.503, 0.041))
    ]

    lower_lip_profile = [
        Vector((-0.021, 1.502, 0.041)),
        Vector((-0.013, 1.498, 0.043)),
        Vector(( 0.000, 1.496, 0.045)),
        Vector(( 0.013, 1.498, 0.043)),
        Vector(( 0.021, 1.502, 0.041))
    ]

    # Create volumetric lip mesh
    mesh_lips = bpy.data.meshes.new("Female_Lips_Mesh")
    lips_obj = bpy.data.objects.new("Female_Lips", mesh_lips)
    bpy.context.collection.objects.link(lips_obj)

    # Extrude small volume along Z
    u_verts_front = [bm.verts.new(p) for p in upper_lip_profile]
    u_verts_back = [bm.verts.new(p - Vector((0, 0, 0.003))) for p in upper_lip_profile]
    for i in range(len(u_verts_front) - 1):
        bm.faces.new([u_verts_front[i], u_verts_front[i+1], u_verts_back[i+1], u_verts_back[i]])

    l_verts_front = [bm.verts.new(p) for p in lower_lip_profile]
    l_verts_back = [bm.verts.new(p - Vector((0, 0, 0.003))) for p in lower_lip_profile]
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
# STEP 6: Add Sculpted Layered Female Hair
# ---------------------------------------------------------
print("Creating sculpted layered female hair...")

def create_hair():
    bm = bmesh.new()

    # Hair crown and cascading waves behind neck/shoulders
    rings = 14
    segs = 18

    # Lofted dome covering scalp and cascading down back
    verts_grid = []
    for r in range(rings):
        t = r / (rings - 1)
        # Height from crown (y=1.66) down to upper back (y=1.35)
        hy = 1.66 - (t * 0.31)
        # Outer radius expanding around head
        rx = 0.088 + (0.035 * t)
        rz = 0.098 + (0.030 * t)

        ring_verts = []
        for s in range(segs):
            theta = (s / (segs - 1)) * math.pi * 1.5 - (math.pi * 0.25)
            # Offset slightly to create hair volume over scalp
            px = math.cos(theta) * rx
            pz = -math.sin(theta) * rz
            # Slight wave variation
            py = hy + 0.006 * math.sin(theta * 3.0 + t * 4.0)

            # Keep hair primarily on top, sides, and back (not covering face)
            if pz > 0.04 and hy < 1.58:
                pz = 0.04 # Trim front face clearing

            v = bm.verts.new(Vector((px, py, pz)))
            ring_verts.append(v)
        verts_grid.append(ring_verts)

    for r in range(rings - 1):
        for s in range(segs - 1):
            v0 = verts_grid[r][s]
            v1 = verts_grid[r][s+1]
            v2 = verts_grid[r+1][s+1]
            v3 = verts_grid[r+1][s]
            bm.faces.new([v0, v1, v2, v3])

    mesh_hair = bpy.data.meshes.new("Female_Hair_Mesh")
    hair_obj = bpy.data.objects.new("Female_Hair", mesh_hair)
    bpy.context.collection.objects.link(hair_obj)

    bm.to_mesh(mesh_hair)
    bm.free()

    hair_obj.data.materials.append(MAT_HAIR)
    bpy.context.view_layer.objects.active = hair_obj
    hair_obj.select_set(True)
    bpy.ops.object.shade_smooth()

    sub_mod = hair_obj.modifiers.new("Subsurf", type='SUBSURF')
    sub_mod.levels = 1
    bpy.ops.object.modifier_apply(modifier="Subsurf")

    return hair_obj

hair_obj = create_hair()

# ---------------------------------------------------------
# STEP 7: Add Areola & Nipple Apex (Left & Right)
# ---------------------------------------------------------
print("Creating anatomical areolae and nipple apexes...")

def create_areola_nipple(name, center, is_left=True):
    bm = bmesh.new()
    segs = 16
    r_areola = 0.018
    r_nipple = 0.0045
    h_nipple = 0.004

    # Center nipple tip
    v_tip = bm.verts.new(center + Vector((0, 0, h_nipple)))

    # Nipple base ring
    v_nipple_ring = []
    for i in range(segs):
        ang = (i / segs) * 2.0 * math.pi
        px = center.x + math.cos(ang) * r_nipple
        py = center.y + math.sin(ang) * r_nipple
        pz = center.z + (h_nipple * 0.4)
        v_nipple_ring.append(bm.verts.new(Vector((px, py, pz))))

    for i in range(segs):
        bm.faces.new([v_tip, v_nipple_ring[i], v_nipple_ring[(i+1)%segs]])

    # Areola outer ring
    v_areola_ring = []
    for i in range(segs):
        ang = (i / segs) * 2.0 * math.pi
        px = center.x + math.cos(ang) * r_areola
        py = center.y + math.sin(ang) * r_areola
        # Conforming to breast curve
        pz = center.z - (0.003 * math.sin(ang * 0.5 + 0.5))
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

areola_left = create_areola_nipple("Female_Areola_Nipple_Left", Vector((0.095, 1.198, 0.098)), is_left=True)
areola_right = create_areola_nipple("Female_Areola_Nipple_Right", Vector((-0.095, 1.198, 0.098)), is_left=False)

# ---------------------------------------------------------
# STEP 8: Add Complete External Female Genitalia (Vulva Assembly)
# ---------------------------------------------------------
print("Sculpting complete external female genitalia assembly...")

# 8.1 Mons Pubis (Soft anterior cushion)
def create_mons_pubis():
    bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=12, radius=0.024, location=Vector((0, 0.822, 0.016)))
    mons = bpy.context.selected_objects[0]
    mons.name = "Mons_Pubis"
    mons.scale = (1.4, 0.8, 0.65)
    bpy.ops.object.transform_apply(scale=True)
    mons.data.materials.append(MAT_MONS)
    bpy.ops.object.shade_smooth()
    return mons

mons_pubis = create_mons_pubis()

# 8.2 Labia Majora (Left & Right outer folds)
def create_labium_majus(name, is_left=True):
    sign = 1.0 if is_left else -1.0
    bm = bmesh.new()

    pts = [
        Vector((sign * 0.007, 0.812,  0.006)), # Anterior commissure
        Vector((sign * 0.014, 0.802, -0.004)),
        Vector((sign * 0.016, 0.792, -0.014)),
        Vector((sign * 0.014, 0.782, -0.022)),
        Vector((sign * 0.005, 0.774, -0.026))  # Posterior fourchette
    ]

    segs = 8
    radius = 0.0075
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

# 8.3 Labia Minora (Left & Right inner mucosal folds)
def create_labium_minus(name, is_left=True):
    sign = 1.0 if is_left else -1.0
    bm = bmesh.new()

    pts = [
        Vector((sign * 0.002, 0.809,  0.004)), # Prepuce junction
        Vector((sign * 0.006, 0.801, -0.005)),
        Vector((sign * 0.007, 0.792, -0.015)),
        Vector((sign * 0.005, 0.783, -0.022)),
        Vector((sign * 0.002, 0.776, -0.025))  # Frenulum junction
    ]

    segs = 6
    radius = 0.0035
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

# 8.4 Clitoral Hood & Glans Clitoridis
def create_clitoris():
    # Prepuce / Hood
    bpy.ops.mesh.primitive_uv_sphere_add(segments=12, ring_count=8, radius=0.0048, location=Vector((0, 0.811, 0.0055)))
    hood = bpy.context.selected_objects[0]
    hood.name = "Clitoral_Hood_Prepuce"
    hood.scale = (1.1, 1.4, 0.7)
    bpy.ops.object.transform_apply(scale=True)
    hood.data.materials.append(MAT_LABIA_MIN)
    bpy.ops.object.shade_smooth()

    # Glans Clitoridis
    bpy.ops.mesh.primitive_uv_sphere_add(segments=12, ring_count=8, radius=0.0032, location=Vector((0, 0.808, 0.0035)))
    glans = bpy.context.selected_objects[0]
    glans.name = "Glans_Clitoridis"
    glans.scale = (0.9, 1.1, 0.85)
    bpy.ops.object.transform_apply(scale=True)
    glans.data.materials.append(MAT_CLITORIS)
    bpy.ops.object.shade_smooth()

    return hood, glans

clitoral_hood, glans_clitoris = create_clitoris()

# 8.5 Vaginal Vestibule, External Urethral Orifice & Vaginal Introitus Orifice
def create_vestibule_and_introitus():
    bm = bmesh.new()

    # Recessed vestibule mucosal floor
    v_floor = [
        Vector(( 0.000, 0.805, -0.002)),
        Vector((-0.004, 0.798, -0.010)),
        Vector(( 0.004, 0.798, -0.010)),
        Vector((-0.005, 0.788, -0.018)),
        Vector(( 0.005, 0.788, -0.018)),
        Vector(( 0.000, 0.778, -0.024))
    ]

    for p in v_floor:
        bm.verts.new(p)

    # Urethral meatus ring
    u_center = Vector((0, 0.801, -0.006))
    u_ring = []
    for i in range(8):
        ang = (i / 8) * 2.0 * math.pi
        px = u_center.x + math.cos(ang) * 0.0018
        py = u_center.y + math.sin(ang) * 0.0022
        u_ring.append(bm.verts.new(Vector((px, py, u_center.z))))

    # Vaginal Introitus 3D Opening (recessed into pelvic canal)
    i_center = Vector((0, 0.785, -0.016))
    i_outer_ring = []
    i_inner_canal = []
    for i in range(12):
        ang = (i / 12) * 2.0 * math.pi
        px = i_center.x + math.cos(ang) * 0.0045
        py = i_center.y + math.sin(ang) * 0.0070
        i_outer_ring.append(bm.verts.new(Vector((px, py, i_center.z))))
        # Recessed canal tunnel (leads inward)
        i_inner_canal.append(bm.verts.new(Vector((px * 0.75, py * 0.85, i_center.z - 0.018))))

    for i in range(12):
        v0 = i_outer_ring[i]
        v1 = i_outer_ring[(i+1)%12]
        v2 = i_inner_canal[(i+1)%12]
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

vestibule_obj = create_vestibule_and_introitus()

# ---------------------------------------------------------
# STEP 9: Parent / Hierarchy Assembly & glTF Export
# ---------------------------------------------------------
print("Assembling anatomical hierarchy...")

all_created = [
    body_obj,
    eye_left,
    eye_right,
    eyebrow_left,
    eyebrow_right,
    lips_obj,
    hair_obj,
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
    obj.rotation_euler = (math.pi / 2, 0, 0)
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.transform_apply(rotation=True)
    obj.select_set(False)

export_path = "D:/Physora/public/models/female_body_beautified.glb"
print(f"Exporting beautified female model to: {export_path}")

# Select all objects for export
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
print("=== Physora Blender Pipeline Finished Successfully ===")
