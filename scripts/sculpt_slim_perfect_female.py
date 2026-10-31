import bpy
import math
import os

print("=== Sculpting Ultra-Slim, Feminine 3D Female Anatomy Body Surface ===")

bpy.ops.wm.read_factory_settings(use_empty=True)

# Helper: Convert HEX color to linear RGB
def hex_to_rgb(hex_str):
    hex_str = hex_str.lstrip('#')
    lv = len(hex_str)
    fin = [int(hex_str[i:i + lv // 3], 16) / 255.0 for i in range(0, lv, lv // 3)]
    return [(c / 12.92) if c <= 0.04045 else math.pow((c + 0.055) / 1.055, 2.4) for c in fin] + [1.0]

def create_pbr_mat(name, hex_color, roughness=0.42):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if not bsdf:
        bsdf = mat.node_tree.nodes.new(type="ShaderNodeBsdfPrincipled")
    rgba = hex_to_rgb(hex_color)
    if "Base Color" in bsdf.inputs:
        bsdf.inputs["Base Color"].default_value = rgba
    if "Roughness" in bsdf.inputs:
        bsdf.inputs["Roughness"].default_value = roughness
    return mat

MAT_SKIN = create_pbr_mat("Mat_Female_Skin", "#EAC2B4", roughness=0.44)
MAT_AREOLA = create_pbr_mat("Mat_Female_Areola", "#C8867E", roughness=0.42)
MAT_LIPS = create_pbr_mat("Mat_Female_Lips", "#C27878", roughness=0.38)

# 1. Import base female skin mesh
base_obj_path = "D:/Physora/scratch/female_skin_base.obj"
print(f"Importing base female mesh: {base_obj_path}")
bpy.ops.wm.obj_import(filepath=base_obj_path)
body = bpy.context.selected_objects[0]
body.name = "Female_Body_Surface"
body.rotation_euler = (0, 0, 0)
bpy.context.view_layer.objects.active = body

mesh = body.data

# 2. Mathematical Vertex-Level Sculpting for Truly Slim, Graceful Feminine Proportions
print("Applying precision anatomical vertex morphing...")

for v in mesh.vertices:
    x, y, z = v.co.x, v.co.y, v.co.z

    # A. Flatten protruding cadaver potbelly (Y: 0.86 - 1.16m, Z < -0.07, |X| < 0.18)
    # Pull anterior abdominal wall back by up to 7.0 cm to make the belly completely flat
    if 0.86 <= y <= 1.16 and z < -0.07 and abs(x) < 0.18:
        w_y = math.sin((y - 0.86) / 0.30 * math.pi)
        w_x = math.cos(min(1.0, abs(x) / 0.18) * (math.pi / 2))
        protrusion = -0.095 - z
        if protrusion > 0:
            v.co.z += protrusion * 0.90 * w_y * w_x

    # B. Slim hourglass waist (Y: 0.91 - 1.16m, |X| < 0.26)
    # Narrow waist width by up to 24% to create a classic 0.68 waist-to-hip feminine curve
    if 0.91 <= y <= 1.16 and abs(x) < 0.26:
        w_y = math.sin((y - 0.91) / 0.25 * math.pi)
        v.co.x *= (1.0 - 0.24 * w_y)
        if z > -0.09:
            v.co.z *= (1.0 - 0.12 * w_y)

    # C. Slim upper arms & eliminate bulky male deltoids (Y: 0.85 - 1.38m, |X| > 0.18)
    if 0.85 <= y <= 1.38 and abs(x) > 0.18:
        w_y = math.sin((y - 0.85) / 0.53 * math.pi)
        x_c = 0.27 if x > 0 else -0.27
        dx = x - x_c
        v.co.x = x_c + dx * (1.0 - 0.20 * w_y)
        v.co.z *= (1.0 - 0.18 * w_y)

    # D. Slim neck & soften jaw/chin (Y: 1.36 - 1.50m, |X| < 0.12)
    if 1.36 <= y <= 1.50 and abs(x) < 0.12:
        w_y = math.sin((y - 1.36) / 0.14 * math.pi)
        v.co.x *= (1.0 - 0.15 * w_y)
        if z > 0.0:
            v.co.z *= (1.0 - 0.10 * w_y)

    # E. Smooth contoured feminine breasts (Y: 1.14 - 1.33m, 0.02 < |X| < 0.17, Z < -0.08)
    # Form natural teardrop shape with integrated surface areola/nipple apex
    if 1.14 <= y <= 1.33 and 0.02 < abs(x) < 0.17 and z < -0.08:
        y_apex = 1.236
        x_apex = 0.077
        d = math.hypot(abs(x) - x_apex, y - y_apex)
        if d < 0.070:
            bump = (math.cos((d / 0.070) * (math.pi / 2))) ** 1.3
            v.co.z -= 0.015 * bump
            if d < 0.012:
                nip_bump = math.cos((d / 0.012) * (math.pi / 2))
                v.co.z -= 0.0035 * nip_bump

mesh.update()

# 3. Direct multi-material assignment on body surface polygons (NO FLOATING OBJECTS!)
print("Assigning materials directly to surface polygons...")
body.data.materials.clear()
body.data.materials.append(MAT_SKIN)   # Index 0
body.data.materials.append(MAT_AREOLA) # Index 1
body.data.materials.append(MAT_LIPS)   # Index 2

areola_count = 0
lips_count = 0

for poly in mesh.polygons:
    # Areola / Nipple faces: within 0.028m of breast apex and on front breast wall
    d = math.hypot(abs(poly.center.x) - 0.080, poly.center.y - 1.240)
    if d < 0.028 and poly.center.z < -0.18:
        poly.material_index = 1
        areola_count += 1
    # Vermilion lips faces: around mouth Y ~ 1.490 - 1.535m, |X| <= 0.028, front
    elif 1.490 <= poly.center.y <= 1.535 and abs(poly.center.x) <= 0.028 and poly.center.z < -0.135:
        poly.material_index = 2
        lips_count += 1
    else:
        poly.material_index = 0

print(f"Directly integrated areola faces on body: {areola_count}")
print(f"Directly integrated lip faces on body: {lips_count}")

# 4. Smooth normals & shading
bpy.ops.object.select_all(action='DESELECT')
body.select_set(True)
bpy.ops.object.shade_smooth()

# 5. Export clean, monolithic GLB
export_path = "D:/Physora/public/models/female_body_beautified.glb"
print(f"Exporting ultra-slim female model to: {export_path}")

bpy.ops.export_scene.gltf(
    filepath=export_path,
    export_format='GLB',
    use_selection=True,
    export_apply=True,
    export_materials='EXPORT'
)

file_size = os.path.getsize(export_path)
print(f"SUCCESS: Exported clean ultra-slim female model ({file_size / (1024*1024):.2f} MB)")
print("=== Headless Blender Sculpting Complete ===")
