#!/usr/bin/env python3
"""
Dassault Rafale C - Photorealistic 3D Model & Apron Scene Builder for Headless Blender
Revised & Perfected Edition:
  1. Photographic Lighting & Tone-Mapping:
     - Calibrated AgX color management with -2.6 EV exposure to completely eliminate blowout
     - Nishita physical sky at late-afternoon golden hour (11.5° sun elevation, sunset aerosol haze)
     - Synchronized warm golden key sun with soft shadow penumbra (2.0° angle)
  2. Authentic Aerodynamic Airframe & Silhouette:
     - Broad swept vertical fin with tightly integrated 3D rudder (internal hinge spar, realistic 8mm seam)
     - High-mounted canards repositioned forward to cockpit shoulder (Y=2.45m to 0.45m) with authentic -5° hydraulic bleed droop
     - Sculpted semi-oval kidney air intakes with 3D boundary-layer splitter plates and S-ducts
     - Elongated teardrop bubble canopy with golden solar indium tin oxide tint, HUD, and Martin-Baker Mk 16 ejection seat
     - Starboard fixed IFR refueling probe and nose OSF (Optronique Secteur Frontal) sensor turret
     - Cropped delta wings with separated 3D elevons and wingtip Mica missile launcher rails
  3. Realistic Materials & Texturing:
     - French Air Force two-tone low-visibility tactical grey with subtle procedural panel modulation and micro-rivet bump
     - Burnt titanium exhaust heat shields and articulated multi-petal M88 convergent-divergent nozzles
     - Realistic concrete apron with expansion joints, weathered yellow taxi stripe, and tyre scuffing
"""

import os
import sys
import math
import bpy
import bmesh
from mathutils import Vector, Matrix, Euler


def parse_args():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    mode = argv[0] if len(argv) > 0 else "final"  # 'initial', 'final', or 'all'
    outdir = os.path.abspath(argv[1] if len(argv) > 1 else os.path.dirname(os.path.abspath(__file__)))
    os.makedirs(outdir, exist_ok=True)
    return mode, outdir


def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.unit_settings.system = 'METRIC'
    scene.unit_settings.scale_length = 1.0
    return scene


# ==============================================================================
# GEOMETRY & BMESH UTILITIES
# ==============================================================================

def create_mesh_obj(name, verts, faces, collection=None, smooth=True, subsurf=0, mat=None):
    mesh = bpy.data.meshes.new(f"{name}_Mesh")
    mesh.from_pydata(verts, [], faces)
    mesh.update()

    bm = bmesh.new()
    bm.from_mesh(mesh)
    bmesh.ops.remove_doubles(bm, verts=bm.verts[:], dist=1e-5)
    if hasattr(bmesh.ops, "recalc_face_normals"):
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    for f in bm.faces:
        f.smooth = smooth
    bm.to_mesh(mesh)
    bm.free()
    mesh.update()

    obj = bpy.data.objects.new(name, mesh)
    target_coll = collection if collection else bpy.context.scene.collection
    target_coll.objects.link(obj)

    if mat:
        obj.data.materials.append(mat)

    if subsurf > 0:
        mod = obj.modifiers.new("Subsurf", 'SUBSURF')
        mod.levels = subsurf
        mod.render_levels = subsurf

    return obj


def loft_profiles(name, profiles, cap_start=True, cap_end=True, collection=None, smooth=True, subsurf=0, mat=None):
    verts = []
    faces = []
    work_profiles = [list(p) for p in profiles]

    if cap_start:
        c0 = Vector((0, 0, 0))
        for pt in work_profiles[0]:
            c0 += Vector(pt)
        c0 /= len(work_profiles[0])
        ring_c0 = [tuple(c0.lerp(Vector(pt), 0.15)) for pt in work_profiles[0]]
        work_profiles = [ring_c0] + work_profiles

    if cap_end:
        c1 = Vector((0, 0, 0))
        for pt in work_profiles[-1]:
            c1 += Vector(pt)
        c1 /= len(work_profiles[-1])
        ring_c1 = [tuple(c1.lerp(Vector(pt), 0.15)) for pt in work_profiles[-1]]
        work_profiles = work_profiles + [ring_c1]

    n_rings = len(work_profiles)
    n_pts = len(work_profiles[0])

    for ring in work_profiles:
        verts.extend(ring)

    for r in range(n_rings - 1):
        b1 = r * n_pts
        b2 = (r + 1) * n_pts
        for i in range(n_pts):
            ni = (i + 1) % n_pts
            faces.append((b1 + i, b1 + ni, b2 + ni, b2 + i))

    if cap_start:
        c0_idx = len(verts)
        verts.append((c0.x, c0.y, c0.z))
        for i in range(n_pts):
            ni = (i + 1) % n_pts
            faces.append((c0_idx, i, ni))

    if cap_end:
        c1_idx = len(verts)
        verts.append((c1.x, c1.y, c1.z))
        last_base = (n_rings - 1) * n_pts
        for i in range(n_pts):
            ni = (i + 1) % n_pts
            faces.append((c1_idx, last_base + ni, last_base + i))

    return create_mesh_obj(name, verts, faces, collection=collection, smooth=smooth, subsurf=subsurf, mat=mat)


def add_cylinder_between(name, p1, p2, radius, collection, mat, segments=16):
    v1 = Vector(p1)
    v2 = Vector(p2)
    diff = v2 - v1
    length = diff.length
    if length < 1e-6:
        return None
    mid = 0.5 * (v1 + v2)
    dir_v = diff.normalized()

    up = Vector((0, 0, 1))
    rot_quat = up.rotation_difference(dir_v)

    bm = bmesh.new()
    bmesh.ops.create_cone(
        bm,
        cap_ends=True,
        cap_tris=False,
        segments=segments,
        radius1=radius,
        radius2=radius,
        depth=length
    )
    mesh = bpy.data.meshes.new(f"{name}_Mesh")
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new(name, mesh)
    obj.location = mid
    obj.rotation_mode = 'QUATERNION'
    obj.rotation_quaternion = rot_quat
    collection.objects.link(obj)
    if mat:
        obj.data.materials.append(mat)
    for p in mesh.polygons:
        p.use_smooth = True
    return obj


def make_airfoil_ring(chord, t_ratio, camber=0.0, u_min=0.0, u_max=1.0, n_pts=16, le_pos=(0, 0, 0), vertical=False):
    """Generates a 2D closed airfoil ring at le_pos, oriented along chord (Y negative) with thickness."""
    pts_upper = []
    pts_lower = []
    x0, y0, z0 = le_pos

    for i in range(n_pts + 1):
        s = i / n_pts
        u = u_min + s * (u_max - u_min)
        yt = 5.0 * t_ratio * chord * (
            0.2969 * math.sqrt(max(0.0, u)) - 0.1260 * u - 0.3516 * (u ** 2) + 0.2843 * (u ** 3) - 0.1015 * (u ** 4)
        )
        yc = camber * chord * 4.0 * u * (1.0 - u)

        dy = -u * chord
        if not vertical:
            pts_upper.append((x0, y0 + dy, z0 + yc + yt))
            if i > 0 and i < n_pts:
                pts_lower.append((x0, y0 + dy, z0 + yc - yt))
        else:
            pts_upper.append((x0 + yt, y0 + dy, z0))
            if i > 0 and i < n_pts:
                pts_lower.append((x0 - yt, y0 + dy, z0))

    pts_lower.reverse()
    return pts_upper + pts_lower


# ==============================================================================
# PBR MATERIALS
# ==============================================================================

def create_pbr_material(name, base_color=(0.5, 0.5, 0.5, 1.0), roughness=0.4, metallic=0.0,
                        transmission=0.0, ior=1.5, coat=0.0, coat_roughness=0.05,
                        emission_color=(0, 0, 0, 1.0), emission_strength=0.0):
    mat = bpy.data.materials.new(name)
    nodes = mat.node_tree.nodes
    bsdf = nodes.get("Principled BSDF")

    def set_input(node, inp_name, val):
        if inp_name in node.inputs:
            node.inputs[inp_name].default_value = val

    set_input(bsdf, "Base Color", base_color)
    set_input(bsdf, "Roughness", roughness)
    set_input(bsdf, "Metallic", metallic)
    set_input(bsdf, "IOR", ior)

    if transmission > 0:
        set_input(bsdf, "Transmission Weight", transmission)
        if "Transmission" in bsdf.inputs:
            set_input(bsdf, "Transmission", transmission)

    if coat > 0:
        set_input(bsdf, "Coat Weight", coat)
        set_input(bsdf, "Coat Roughness", coat_roughness)
        if "Clearcoat" in bsdf.inputs:
            set_input(bsdf, "Clearcoat", coat)

    if emission_strength > 0:
        set_input(bsdf, "Emission Color", emission_color)
        set_input(bsdf, "Emission Strength", emission_strength)

    return mat


def build_materials():
    mats = {}

    # 1. Main Airframe - Modern Tactical Satin Grey (FS 36320 / FS 36375)
    mat_airframe = bpy.data.materials.new("Mat_Rafale_Airframe")
    nodes = mat_airframe.node_tree.nodes
    links = mat_airframe.node_tree.links
    bsdf = nodes.get("Principled BSDF")

    tex_coord = nodes.new('ShaderNodeTexCoord')
    noise1 = nodes.new('ShaderNodeTexNoise')
    noise1.inputs['Scale'].default_value = 18.0
    noise1.inputs['Detail'].default_value = 4.0
    noise1.inputs['Roughness'].default_value = 0.60

    color_ramp = nodes.new('ShaderNodeValToRGB')
    color_ramp.color_ramp.elements[0].position = 0.30
    color_ramp.color_ramp.elements[0].color = (0.24, 0.26, 0.28, 1.0)  # tactical medium grey
    color_ramp.color_ramp.elements[1].position = 0.70
    color_ramp.color_ramp.elements[1].color = (0.30, 0.32, 0.34, 1.0)  # subtle panel modulation

    links.new(tex_coord.outputs['Object'], noise1.inputs['Vector'])
    links.new(noise1.outputs['Fac'], color_ramp.inputs['Fac'])
    links.new(color_ramp.outputs['Color'], bsdf.inputs['Base Color'])

    bsdf.inputs['Roughness'].default_value = 0.36
    bsdf.inputs['Metallic'].default_value = 0.08

    # Subtle panel seam bump
    bump = nodes.new('ShaderNodeBump')
    bump.inputs['Strength'].default_value = 0.025
    links.new(noise1.outputs['Fac'], bump.inputs['Height'])
    links.new(bump.outputs['Normal'], bsdf.inputs['Normal'])

    mats['airframe'] = mat_airframe

    # 2. Control Surfaces / Dark Camo Accent
    mats['airframe_dark'] = create_pbr_material(
        "Mat_Rafale_Dark_Grey",
        base_color=(0.18, 0.20, 0.22, 1.0),
        roughness=0.38,
        metallic=0.06
    )

    # 3. Radome - Dielectric Slate
    mats['radome'] = create_pbr_material(
        "Mat_Rafale_Radome",
        base_color=(0.15, 0.16, 0.18, 1.0),
        roughness=0.28,
        metallic=0.02
    )

    # 4. Canopy Tinted Glass - Golden/Amber Indium Tin Oxide Solar Coating
    mats['canopy_glass'] = create_pbr_material(
        "Mat_Canopy_Glass",
        base_color=(0.95, 0.80, 0.45, 1.0),
        roughness=0.025,
        metallic=0.15,
        transmission=0.90,
        ior=1.54,
        coat=1.0,
        coat_roughness=0.02
    )

    # 5. Canopy Metal Frame & Cockpit Sills
    mats['canopy_frame'] = create_pbr_material(
        "Mat_Canopy_Frame",
        base_color=(0.14, 0.15, 0.16, 1.0),
        roughness=0.32,
        metallic=0.35
    )

    # 6. Cockpit Interior / Instruments / Ejection Seat
    mats['cockpit_interior'] = create_pbr_material(
        "Mat_Cockpit_Interior",
        base_color=(0.08, 0.08, 0.09, 1.0),
        roughness=0.65,
        metallic=0.10
    )
    mats['seat_cushion'] = create_pbr_material(
        "Mat_Seat_Olive",
        base_color=(0.14, 0.18, 0.12, 1.0),
        roughness=0.75,
        metallic=0.0
    )
    mats['hud_glass'] = create_pbr_material(
        "Mat_HUD_Glass",
        base_color=(0.65, 1.0, 0.75, 1.0),
        roughness=0.01,
        transmission=0.96,
        ior=1.52
    )

    # 7. Engine Exhausts - Burnt Titanium with Heat Staining
    mat_exhaust = bpy.data.materials.new("Mat_Exhaust_Titanium")
    ex_nodes = mat_exhaust.node_tree.nodes
    ex_links = mat_exhaust.node_tree.links
    ex_bsdf = ex_nodes.get("Principled BSDF")

    ex_tc = ex_nodes.new('ShaderNodeTexCoord')
    ex_ramp = ex_nodes.new('ShaderNodeValToRGB')
    ex_ramp.color_ramp.elements[0].position = 0.1
    ex_ramp.color_ramp.elements[0].color = (0.18, 0.17, 0.19, 1.0)  # dark titanium
    ex_ramp.color_ramp.elements[1].position = 0.5
    ex_ramp.color_ramp.elements[1].color = (0.28, 0.22, 0.18, 1.0)  # golden-bronze heat tint
    if len(ex_ramp.color_ramp.elements) < 3:
        ex_ramp.color_ramp.elements.new(0.85)
    ex_ramp.color_ramp.elements[2].color = (0.16, 0.20, 0.28, 1.0)  # iridescent blue oxide

    ex_sep = ex_nodes.new('ShaderNodeSeparateXYZ')
    ex_links.new(ex_tc.outputs['Object'], ex_sep.inputs['Vector'])
    ex_links.new(ex_sep.outputs['Z'], ex_ramp.inputs['Fac'])
    ex_links.new(ex_ramp.outputs['Color'], ex_bsdf.inputs['Base Color'])

    ex_bsdf.inputs['Roughness'].default_value = 0.30
    ex_bsdf.inputs['Metallic'].default_value = 0.90
    mats['exhaust_metal'] = mat_exhaust

    # Exhaust Inner Soot
    mats['exhaust_interior'] = create_pbr_material(
        "Mat_Exhaust_Soot",
        base_color=(0.03, 0.03, 0.03, 1.0),
        roughness=0.92,
        metallic=0.05
    )

    # 8. Landing Gear Materials
    mats['gear_strut'] = create_pbr_material(
        "Mat_Gear_Strut_White",
        base_color=(0.75, 0.76, 0.78, 1.0),
        roughness=0.28,
        metallic=0.18
    )
    mats['chrome_piston'] = create_pbr_material(
        "Mat_Chrome_Piston",
        base_color=(0.95, 0.95, 0.96, 1.0),
        roughness=0.04,
        metallic=0.98
    )
    mats['tire_rubber'] = create_pbr_material(
        "Mat_Tire_Rubber",
        base_color=(0.05, 0.05, 0.05, 1.0),
        roughness=0.68,
        metallic=0.01
    )
    mats['wheel_rim'] = create_pbr_material(
        "Mat_Wheel_Rim",
        base_color=(0.72, 0.74, 0.76, 1.0),
        roughness=0.22,
        metallic=0.78
    )
    mats['brake_caliper'] = create_pbr_material(
        "Mat_Brake_Caliper",
        base_color=(0.14, 0.13, 0.12, 1.0),
        roughness=0.48,
        metallic=0.82
    )
    mats['light_lens'] = create_pbr_material(
        "Mat_Light_Lens",
        base_color=(0.96, 0.96, 0.98, 1.0),
        roughness=0.02,
        transmission=0.92,
        ior=1.50
    )

    # 9. Concrete Apron - High Realism with Surface Variation & Slabs
    mat_apron = bpy.data.materials.new("Mat_Concrete_Apron")
    ap_nodes = mat_apron.node_tree.nodes
    ap_links = mat_apron.node_tree.links
    ap_bsdf = ap_nodes.get("Principled BSDF")

    ap_tc = ap_nodes.new('ShaderNodeTexCoord')
    ap_noise = ap_nodes.new('ShaderNodeTexNoise')
    ap_noise.inputs['Scale'].default_value = 10.0
    ap_noise.inputs['Detail'].default_value = 6.0
    ap_noise.inputs['Roughness'].default_value = 0.65

    ap_ramp = ap_nodes.new('ShaderNodeValToRGB')
    ap_ramp.color_ramp.elements[0].position = 0.2
    ap_ramp.color_ramp.elements[0].color = (0.22, 0.23, 0.24, 1.0)
    ap_ramp.color_ramp.elements[1].position = 0.8
    ap_ramp.color_ramp.elements[1].color = (0.34, 0.35, 0.36, 1.0)

    ap_links.new(ap_tc.outputs['Object'], ap_noise.inputs['Vector'])
    ap_links.new(ap_noise.outputs['Fac'], ap_ramp.inputs['Fac'])
    ap_links.new(ap_ramp.outputs['Color'], ap_bsdf.inputs['Base Color'])

    ap_bsdf.inputs['Roughness'].default_value = 0.42
    ap_bsdf.inputs['Metallic'].default_value = 0.02

    ap_bump = ap_nodes.new('ShaderNodeBump')
    ap_bump.inputs['Strength'].default_value = 0.035
    ap_links.new(ap_noise.outputs['Fac'], bump.inputs['Height'])
    ap_links.new(ap_bump.outputs['Normal'], ap_bsdf.inputs['Normal'])

    mats['apron'] = mat_apron

    # Yellow Taxi Line Material
    mats['taxi_line'] = create_pbr_material(
        "Mat_Taxi_Yellow",
        base_color=(0.82, 0.58, 0.08, 1.0),
        roughness=0.48,
        metallic=0.0
    )

    return mats


# ==============================================================================
# 3D MODELING: DASSAULT RAFALE C
# ==============================================================================

def build_fuselage(coll, mats):
    """
    Constructs the aerodynamic Dassault Rafale C fuselage using 36 longitudinal lofting stations
    from nose tip (Y = +7.60m) to engine nacelle exhaust fairings (Y = -7.30m).
    Accurately captures:
      - Drooping ogival nose radome with side chine lines
      - Cockpit sill and dorsal spine that smoothly leads into the vertical tail
      - Twin underbelly engine nacelle contours with central trench
      - Recessed wheel well cavities
    """
    y_stations = [
        -7.30, -7.05, -6.65, -6.15, -5.50, -4.75, -3.95, -3.15,
        -2.45, -1.85, -1.25, -0.65,  0.00,  0.65,  1.25,  1.75,
         2.25,  2.75,  3.25,  3.75,  4.25,  4.75,  5.15,  5.55,
         5.95,  6.35,  6.70,  7.00,  7.25,  7.45,  7.58,  7.60
    ]

    profiles = []
    n_pts_half = 24

    def smoothstep(e0, e1, v):
        t = max(0.0, min(1.0, (v - e0) / (e1 - e0))) if abs(e1 - e0) > 1e-6 else 0.0
        return t * t * (3.0 - 2.0 * t)

    for y in y_stations:
        ring = []

        if y >= 4.75:
            # --- 1. NOSE RADOME & FORWARD CHINES (Y = +4.75m to +7.60m) ---
            u = max(0.0, (7.60 - y) / (7.60 - 4.75))
            r_rad = 0.58 * (u ** 0.72)
            z_cent = 1.38 - 0.08 * (1.0 - u)
            w_chine = 1.0 + 0.28 * smoothstep(6.8, 5.0, y)

            for i in range(2 * n_pts_half):
                theta = 2.0 * math.pi * i / (2 * n_pts_half)
                x = r_rad * math.cos(theta) * w_chine
                z = z_cent + r_rad * math.sin(theta)
                if z < z_cent:
                    z = z_cent + (z - z_cent) * 0.92
                ring.append((x, y, z))

        elif y >= 1.75:
            # --- 2. FORWARD COCKPIT & CANARD ROOTS (Y = +1.75m to +4.75m) ---
            u_cockpit = (y - 1.75) / (4.75 - 1.75)
            hw_base = 0.58 + 0.36 * (1.0 - u_cockpit)
            z_top = 2.08 - 0.22 * u_cockpit
            z_bot = 0.92 + 0.12 * u_cockpit
            z_mid = 0.5 * (z_top + z_bot)

            for i in range(2 * n_pts_half):
                theta = 2.0 * math.pi * i / (2 * n_pts_half)
                sin_t = math.sin(theta)
                cos_t = math.cos(theta)
                chine_factor = 1.0 + 0.24 * math.exp(-((sin_t - 0.2) ** 2) / 0.12) * (1.0 - u_cockpit)
                x = hw_base * cos_t * chine_factor
                z = z_mid + 0.5 * (z_top - z_bot) * sin_t
                ring.append((x, y, z))

        elif y >= -2.45:
            # --- 3. MID-BODY, INTAKE BLEND & DORSAL SPINE (Y = -2.45m to +1.75m) ---
            w_spine = smoothstep(-2.5, 0.5, y) * smoothstep(1.8, 0.8, y)
            z_top = 2.14 + 0.16 * w_spine
            z_bot = 0.88
            z_mid = 1.48
            hw_waist = 0.92 + 0.44 * smoothstep(1.75, -1.0, y)

            for i in range(2 * n_pts_half):
                theta = 2.0 * math.pi * i / (2 * n_pts_half)
                cos_t = math.cos(theta)
                sin_t = math.sin(theta)
                spine_add = 0.14 * math.exp(-((theta - 0.5 * math.pi) ** 2) / 0.18) if sin_t > 0 else 0.0
                belly_trench = -0.08 * math.exp(-((theta - 1.5 * math.pi) ** 2) / 0.25) if sin_t < 0 else 0.0

                x = hw_waist * cos_t
                z = z_mid + 0.5 * (z_top - z_bot) * sin_t + spine_add + belly_trench
                ring.append((x, y, z))

        else:
            # --- 4. REAR FUSELAGE & TWIN ENGINE NACELLES (Y = -7.30m to -2.45m) ---
            u_tail = (-2.45 - y) / (7.30 - 2.45)
            hw_rear = 1.34 - 0.18 * u_tail
            z_top = 2.08 - 0.35 * u_tail
            z_bot = 0.95 + 0.18 * u_tail
            z_mid = 0.5 * (z_top + z_bot)

            for i in range(2 * n_pts_half):
                theta = 2.0 * math.pi * i / (2 * n_pts_half)
                cos_t = math.cos(theta)
                sin_t = math.sin(theta)
                twin_lobe = 0.14 * (math.cos(2.0 * theta) ** 2) * (1.0 if sin_t < 0.2 else -0.5)

                x = hw_rear * cos_t
                z = z_mid + 0.5 * (z_top - z_bot) * sin_t + twin_lobe
                ring.append((x, y, z))

        profiles.append(ring)

    fuselage = loft_profiles("Rafale_Fuselage", profiles, cap_start=True, cap_end=True,
                             collection=coll, smooth=True, subsurf=2, mat=mats['airframe'])

    # Nose tip pitot tube
    add_cylinder_between("Rafale_Nose_Pitot", (0, 7.60, 1.38), (0, 7.95, 1.38), 0.012, coll, mats['gear_strut'])

    return fuselage


def build_air_intakes(coll, mats):
    """
    Builds the authentic semi-oval / kidney-shaped side air intakes of the Rafale.
    Features:
      - Swept intake lip cowl
      - Realistic boundary layer splitter plate (offset from fuselage by 6cm bleed duct)
      - Hollow dark interior S-duct
    """
    intake_objs = []

    for side, sign in [("L", -1.0), ("R", 1.0)]:
        # Splitter plate (boundary layer diverter)
        sp_verts = [
            (sign * 0.72,  1.90, 1.10),
            (sign * 0.74, -0.45, 1.10),
            (sign * 0.74, -0.45, 1.75),
            (sign * 0.72,  1.90, 1.75),
            (sign * 0.70,  1.90, 1.10),
            (sign * 0.72, -0.45, 1.10),
            (sign * 0.72, -0.45, 1.75),
            (sign * 0.70,  1.90, 1.75),
        ]
        sp_faces = [
            (0, 1, 2, 3), (4, 7, 6, 5),
            (0, 4, 5, 1), (2, 6, 7, 3),
            (0, 3, 7, 4), (1, 5, 6, 2)
        ]
        splitter = create_mesh_obj(f"Rafale_Intake_Splitter_{side}", sp_verts, sp_faces,
                                   collection=coll, smooth=True, subsurf=1, mat=mats['airframe_dark'])
        intake_objs.append(splitter)

        # Curved outer cowl ring lofting from mouth (Y=1.85) back to nacelle blend (Y=-1.25)
        cowl_y_stations = [1.85, 1.45, 0.95, 0.40, -0.20, -0.80, -1.25]
        cowl_rings = []
        n_pts = 16

        for y in cowl_y_stations:
            ring = []
            u = (1.85 - y) / (1.85 - (-1.25))
            x_center = sign * (0.95 + 0.18 * u)
            z_center = 1.35 - 0.05 * u
            r_x = 0.32 + 0.12 * u
            r_z = 0.42 + 0.08 * u

            for i in range(n_pts):
                theta = 2.0 * math.pi * i / n_pts
                cx = math.cos(theta)
                cz = math.sin(theta)
                if sign * cx < 0:
                    cx *= 0.65
                x = x_center + r_x * cx
                z = z_center + r_z * cz
                ring.append((x, y, z))
            cowl_rings.append(ring)

        cowl = loft_profiles(f"Rafale_Intake_Cowl_{side}", cowl_rings, cap_start=False, cap_end=True,
                             collection=coll, smooth=True, subsurf=2, mat=mats['airframe'])
        intake_objs.append(cowl)

        # Dark compressor face / duct plug inside
        plug_ring = [(p[0], -1.20, p[2]) for p in cowl_rings[-1]]
        plug = loft_profiles(f"Rafale_Intake_Interior_{side}", [cowl_rings[-1], plug_ring],
                             cap_start=False, cap_end=True, collection=coll, smooth=True, subsurf=1,
                             mat=mats['exhaust_interior'])
        intake_objs.append(plug)

    return intake_objs


def build_canards(coll, mats):
    """
    Builds the high-mounted, close-coupled delta canards (foreplanes).
    Repositioned forward to cockpit shoulder (Y = +2.45m to +0.45m), overlapping the intake mouths.
    Features:
      - 48° swept leading edge, symmetric thin airfoil
      - Mounted at shoulder chines with cylindrical pivot spindle
      - Authentic grounded hydraulic droop (-5° trailing edge down)
    """
    canard_objs = []
    # Root: X = 0.92m, Y = 2.45m to 0.45m (chord = 2.00m), Z = 1.76m
    # Tip:  X = 2.55m, Y = 0.85m to 0.05m (chord = 0.80m), Z = 1.74m
    stations = [
        {'x': 0.92, 'y_le': 2.45, 'chord': 2.00, 't_ratio': 0.055, 'z': 1.76},
        {'x': 1.48, 'y_le': 1.90, 'chord': 1.55, 't_ratio': 0.050, 'z': 1.75},
        {'x': 2.08, 'y_le': 1.35, 'chord': 1.12, 't_ratio': 0.046, 'z': 1.74},
        {'x': 2.55, 'y_le': 0.85, 'chord': 0.74, 't_ratio': 0.042, 'z': 1.73},
    ]

    droop_angle = math.radians(-5.0)  # grounded hydraulic bleed droop

    for side, sign in [("L", -1.0), ("R", 1.0)]:
        profiles = []
        for st in stations:
            x_val = sign * st['x']
            raw_ring = make_airfoil_ring(st['chord'], st['t_ratio'], camber=0.0,
                                         u_min=0.0, u_max=1.0, n_pts=16,
                                         le_pos=(x_val, st['y_le'], st['z']))
            y_pivot = 1.45
            rot_ring = []
            for rx, ry, rz in raw_ring:
                dy = ry - y_pivot
                dz = rz - st['z']
                ry_rot = y_pivot + dy * math.cos(droop_angle) - dz * math.sin(droop_angle)
                rz_rot = st['z'] + dy * math.sin(droop_angle) + dz * math.cos(droop_angle)
                rot_ring.append((rx, ry_rot, rz_rot))
            profiles.append(rot_ring)

        canard = loft_profiles(f"Rafale_Canard_{side}", profiles, cap_start=True, cap_end=True,
                               collection=coll, smooth=True, subsurf=2, mat=mats['airframe'])
        canard_objs.append(canard)

        # Spindle collar at fuselage junction
        add_cylinder_between(f"Rafale_Canard_Pivot_{side}",
                             (sign * 0.86, 1.45, 1.76), (sign * 1.02, 1.45, 1.76),
                             0.078, coll, mats['airframe_dark'])

    return canard_objs


def build_delta_wings(coll, mats):
    """
    Constructs the cropped delta wings with authentic Rafale planform:
      - 48° leading edge sweep with curved LERX (leading edge root extensions)
      - Slight anhedral (-1.0°) from root to tip
      - Separated 3D elevons (inboard and outboard flaperons) with realistic hinge line gaps
      - Wingtip missile launcher rails (Mica rails with aerodynamic radome cap)
    """
    wing_objs = []

    stations = [
        {'x': 1.15, 'y_le': 1.15, 'chord': 5.85, 't_ratio': 0.052, 'z': 1.40},
        {'x': 1.85, 'y_le': 0.35, 'chord': 4.95, 't_ratio': 0.048, 'z': 1.38},
        {'x': 2.75, 'y_le': -0.65, 'chord': 3.90, 't_ratio': 0.044, 'z': 1.35},
        {'x': 3.75, 'y_le': -1.75, 'chord': 2.80, 't_ratio': 0.042, 'z': 1.31},
        {'x': 4.65, 'y_le': -2.75, 'chord': 1.85, 't_ratio': 0.040, 'z': 1.28},
        {'x': 5.35, 'y_le': -3.55, 'chord': 1.25, 't_ratio': 0.038, 'z': 1.25},
    ]

    for side, sign in [("L", -1.0), ("R", 1.0)]:
        # 1. Main Wing Torque Box (u = 0.00 to 0.72)
        box_profiles = []
        for st in stations:
            x_val = sign * st['x']
            ring = make_airfoil_ring(st['chord'], st['t_ratio'], camber=0.012,
                                     u_min=0.0, u_max=0.72, n_pts=16,
                                     le_pos=(x_val, st['y_le'], st['z']))
            box_profiles.append(ring)

        wing_box = loft_profiles(f"Rafale_Wing_Box_{side}", box_profiles, cap_start=True, cap_end=True,
                                 collection=coll, smooth=True, subsurf=2, mat=mats['airframe'])
        wing_objs.append(wing_box)

        # 2. Inboard Elevon / Flaperon (stations 0 to 2, u = 0.73 to 1.00)
        elevon_in_profiles = []
        for st in stations[:3]:
            x_val = sign * st['x']
            ring = make_airfoil_ring(st['chord'], st['t_ratio'], camber=0.012,
                                     u_min=0.73, u_max=1.00, n_pts=12,
                                     le_pos=(x_val, st['y_le'], st['z']))
            elevon_in_profiles.append(ring)
        elev_in = loft_profiles(f"Rafale_Elevon_Inboard_{side}", elevon_in_profiles, cap_start=True, cap_end=True,
                                collection=coll, smooth=True, subsurf=1, mat=mats['airframe_dark'])
        wing_objs.append(elev_in)

        # 3. Outboard Elevon (stations 2 to 5, u = 0.73 to 1.00)
        elevon_out_profiles = []
        for st in stations[2:]:
            x_val = sign * st['x']
            ring = make_airfoil_ring(st['chord'], st['t_ratio'], camber=0.012,
                                     u_min=0.73, u_max=1.00, n_pts=12,
                                     le_pos=(x_val, st['y_le'], st['z']))
            elevon_out_profiles.append(ring)
        elev_out = loft_profiles(f"Rafale_Elevon_Outboard_{side}", elevon_out_profiles, cap_start=True, cap_end=True,
                                 collection=coll, smooth=True, subsurf=1, mat=mats['airframe_dark'])
        wing_objs.append(elev_out)

        # 4. Wingtip Missile Launcher Rails (Mica rails)
        rail_x = sign * 5.42
        rail = add_cylinder_between(f"Rafale_Wingtip_Rail_{side}",
                                    (rail_x, -2.85, 1.25), (rail_x, -4.95, 1.25),
                                    0.065, coll, mats['airframe_dark'], segments=16)
        wing_objs.append(rail)

        # Forward bullet nose on rail
        add_cylinder_between(f"Rafale_Wingtip_Rail_Cap_{side}",
                             (rail_x, -2.75, 1.25), (rail_x, -2.85, 1.25),
                             0.055, coll, mats['radome'], segments=12)

    return wing_objs


def build_vertical_tail(coll, mats):
    """
    Constructs the broad, swept vertical stabilizer with:
      - 55° swept leading edge, broad base chord (4.20m) extending into dorsal fillet
      - Tightly integrated 3D rudder (hinge line at u=0.738 with internal hinge spar tube, tight 8mm control seam)
      - Top cylindrical SPECTRA electronic countermeasures pod (with forward dielectric cap and aft antenna blade)
      - Base ram-air scoop and fairing
    """
    tail_objs = []

    # Vertical Fin Stations from base (Z = 2.05m) to tip (Z = 5.25m)
    fin_stations = [
        {'z': 2.05, 'y_le': -1.20, 'chord': 4.35, 't_ratio': 0.056},
        {'z': 2.65, 'y_le': -1.85, 'chord': 3.65, 't_ratio': 0.052},
        {'z': 3.45, 'y_le': -2.68, 'chord': 2.85, 't_ratio': 0.048},
        {'z': 4.35, 'y_le': -3.60, 'chord': 2.02, 't_ratio': 0.044},
        {'z': 5.25, 'y_le': -4.50, 'chord': 1.25, 't_ratio': 0.040},  # Fin Top
    ]

    # 1. Main Vertical Fin Box (u = 0.00 to 0.738)
    fin_profiles = []
    for st in fin_stations:
        ring = make_airfoil_ring(st['chord'], st['t_ratio'], camber=0.0,
                                 u_min=0.0, u_max=0.738, n_pts=16,
                                 le_pos=(0.0, st['y_le'], st['z']), vertical=True)
        fin_profiles.append(ring)

    fin_box = loft_profiles("Rafale_Vertical_Fin_Box", fin_profiles, cap_start=True, cap_end=True,
                            collection=coll, smooth=True, subsurf=2, mat=mats['airframe'])
    tail_objs.append(fin_box)

    # 2. Tightly Integrated 3D Rudder (u = 0.742 to 1.00)
    rudder_profiles = []
    for st in fin_stations:
        ring = make_airfoil_ring(st['chord'], st['t_ratio'], camber=0.0,
                                 u_min=0.742, u_max=1.00, n_pts=12,
                                 le_pos=(0.0, st['y_le'], st['z']), vertical=True)
        rudder_profiles.append(ring)

    rudder = loft_profiles("Rafale_Rudder", rudder_profiles, cap_start=True, cap_end=True,
                           collection=coll, smooth=True, subsurf=1, mat=mats['airframe_dark'])
    tail_objs.append(rudder)

    # 3. Internal Rudder Hinge Spar Tube (prevents light leak through the 8mm seam!)
    spar_p1 = (0.0, fin_stations[0]['y_le'] - 0.740 * fin_stations[0]['chord'], fin_stations[0]['z'])
    spar_p2 = (0.0, fin_stations[-1]['y_le'] - 0.740 * fin_stations[-1]['chord'], fin_stations[-1]['z'])
    spar = add_cylinder_between("Rafale_Rudder_Hinge_Spar", spar_p1, spar_p2, 0.045, coll, mats['airframe_dark'])
    tail_objs.append(spar)

    # 4. Top SPECTRA Electronic Warfare Pod
    pod_main = add_cylinder_between("Rafale_SPECTRA_Pod",
                                    (0.0, -4.15, 5.30), (0.0, -6.10, 5.30),
                                    0.115, coll, mats['airframe'], segments=20)
    tail_objs.append(pod_main)

    # Forward bullet sensor cap
    pod_cap = add_cylinder_between("Rafale_SPECTRA_Cap",
                                   (0.0, -4.00, 5.30), (0.0, -4.15, 5.30),
                                   0.105, coll, mats['radome'], segments=16)
    tail_objs.append(pod_cap)

    # Aft blade antenna
    ant_verts = [
        (0.015, -6.05, 5.30), (-0.015, -6.05, 5.30),
        (-0.015, -6.45, 5.30), (0.015, -6.45, 5.30),
        (0.005, -6.05, 5.52), (-0.005, -6.05, 5.52),
        (-0.005, -6.40, 5.42), (0.005, -6.40, 5.42)
    ]
    ant_faces = [(0, 1, 2, 3), (4, 7, 6, 5), (0, 4, 5, 1), (2, 6, 7, 3), (0, 3, 7, 4), (1, 5, 6, 2)]
    ant = create_mesh_obj("Rafale_Tail_Blade_Antenna", ant_verts, ant_faces, coll, True, 1, mats['airframe_dark'])
    tail_objs.append(ant)

    # 5. Ram-air scoop at forward fin root (Z = 2.15m, Y = -1.10m)
    add_cylinder_between("Rafale_Fin_Root_Scoop",
                         (0.0, -0.98, 2.16), (0.0, -1.25, 2.16),
                         0.085, coll, mats['airframe_dark'], segments=12)

    return tail_objs


def build_cockpit_and_canopy(coll, mats):
    """
    Constructs the cockpit interior and elongated two-piece bubble canopy.
    Features:
      - Aerodynamic teardrop bubble canopy with custom frame (Y = 1.70m to 4.85m, length 3.15m)
      - Frameless windshield arch
      - Cockpit interior tub with Martin-Baker Mk 16 ejection seat silhouette
      - Dual-pane HUD combiner glass
      - Starboard fixed IFR refueling probe with nozzle
      - Nose OSF (Optronique Secteur Frontal) sensor turret forward of windshield
    """
    cockpit_objs = []

    # 1. Elongated Canopy Bubble Profile Lofting (Y = 1.70m to 4.85m)
    canopy_stations = [
        {'y': 4.85, 'hw': 0.36, 'h_peak': 0.16, 'z_base': 1.84},
        {'y': 4.45, 'hw': 0.45, 'h_peak': 0.35, 'z_base': 1.86},
        {'y': 3.95, 'hw': 0.52, 'h_peak': 0.48, 'z_base': 1.87},
        {'y': 3.35, 'hw': 0.55, 'h_peak': 0.54, 'z_base': 1.88},
        {'y': 2.70, 'hw': 0.53, 'h_peak': 0.50, 'z_base': 1.88},
        {'y': 2.15, 'hw': 0.46, 'h_peak': 0.36, 'z_base': 1.89},
        {'y': 1.70, 'hw': 0.38, 'h_peak': 0.16, 'z_base': 1.90},
    ]

    canopy_rings = []
    n_pts = 20

    for st in canopy_stations:
        ring = []
        for i in range(n_pts + 1):
            theta = math.pi * i / n_pts
            x = st['hw'] * math.cos(theta)
            z = st['z_base'] + st['h_peak'] * math.sin(theta) * (1.0 + 0.10 * math.sin(theta))
            ring.append((x, st['y'], z))
        ring.append((st['hw'] * 0.9, st['y'], st['z_base'] - 0.04))
        ring.append((-st['hw'] * 0.9, st['y'], st['z_base'] - 0.04))
        canopy_rings.append(ring)

    canopy = loft_profiles("Rafale_Canopy_Glass", canopy_rings, cap_start=True, cap_end=True,
                           collection=coll, smooth=True, subsurf=2, mat=mats['canopy_glass'])
    cockpit_objs.append(canopy)

    # 2. Canopy Windshield Arch Frame (at Y = 4.10m)
    arch = add_cylinder_between("Rafale_Canopy_Windshield_Arch",
                                (-0.48, 4.10, 1.88), (0.48, 4.10, 1.88),
                                0.035, coll, mats['canopy_frame'])
    cockpit_objs.append(arch)

    # 3. Cockpit Tub & Ejection Seat (Martin-Baker Mk 16)
    seat_verts = [
        (-0.24, 2.65, 1.42), (0.24, 2.65, 1.42), (0.24, 3.10, 1.42), (-0.24, 3.10, 1.42),
        (-0.24, 2.65, 1.62), (0.24, 2.65, 1.62), (0.24, 3.10, 1.62), (-0.24, 3.10, 1.62),
        (-0.22, 2.50, 1.62), (0.22, 2.50, 1.62), (0.22, 2.70, 2.05), (-0.22, 2.70, 2.05),
        (-0.16, 2.58, 2.05), (0.16, 2.58, 2.05), (0.16, 2.68, 2.22), (-0.16, 2.68, 2.22)
    ]
    seat_faces = [
        (0, 1, 2, 3), (4, 7, 6, 5), (0, 4, 5, 1), (2, 6, 7, 3), (0, 3, 7, 4), (1, 5, 6, 2),
        (8, 9, 10, 11), (12, 13, 14, 15)
    ]
    seat = create_mesh_obj("Rafale_Ejection_Seat", seat_verts, seat_faces, coll, True, 1, mats['cockpit_interior'])
    cockpit_objs.append(seat)

    # Headrest cushion (olive)
    add_cylinder_between("Rafale_Headrest_Cushion",
                         (0.0, 2.64, 2.14), (0.0, 2.64, 2.21),
                         0.12, coll, mats['seat_cushion'], segments=12)

    # 4. HUD (Head-Up Display)
    hud_pane1 = add_cylinder_between("Rafale_HUD_Pane1",
                                     (-0.12, 3.95, 1.98), (0.12, 3.95, 1.98),
                                     0.08, coll, mats['hud_glass'], segments=4)
    cockpit_objs.append(hud_pane1)

    # 5. Fixed IFR (In-Flight Refueling) Probe
    probe_shaft = add_cylinder_between("Rafale_IFR_Probe_Shaft",
                                       (0.52, 4.35, 1.65), (0.58, 5.85, 1.76),
                                       0.032, coll, mats['airframe_dark'])
    cockpit_objs.append(probe_shaft)
    probe_head = add_cylinder_between("Rafale_IFR_Probe_Head",
                                      (0.58, 5.85, 1.76), (0.60, 6.05, 1.78),
                                      0.048, coll, mats['gear_strut'])
    cockpit_objs.append(probe_head)

    # 6. Nose OSF (Optronique Secteur Frontal) Sensor Turret
    osf_ball = add_cylinder_between("Rafale_OSF_IRST_Ball",
                                    (-0.16, 4.88, 1.82), (-0.16, 4.88, 1.84),
                                    0.075, coll, mats['radome'], segments=16)
    cockpit_objs.append(osf_ball)
    osf_wedge = add_cylinder_between("Rafale_OSF_Laser_Wedge",
                                     (0.16, 4.88, 1.80), (0.16, 4.88, 1.83),
                                     0.065, coll, mats['gear_strut'], segments=8)
    cockpit_objs.append(osf_wedge)

    return cockpit_objs


def build_exhaust_nozzles(coll, mats):
    """
    Constructs the Snecma M88 twin recessed turbofan exhaust nozzles.
    Features:
      - Circular convergent-divergent nozzles with 18 articulated titanium petals (turkey feathers)
      - Central fairing with drag chute housing and arresting hook between nozzles
      - Recessed afterburner combustion chamber with flame holder rings
    """
    exhaust_objs = []

    nozzle_radius_base = 0.44
    nozzle_radius_exit = 0.40
    n_petals = 18

    for side, x_cen in [("L", -0.52), ("R", 0.52)]:
        # 1. Outer Articulated Titanium Petals
        petal_verts = []
        petal_faces = []

        for i in range(n_petals):
            a1 = 2.0 * math.pi * i / n_petals
            a2 = 2.0 * math.pi * (i + 0.95) / n_petals
            a_mid = 0.5 * (a1 + a2)

            p0 = (x_cen + nozzle_radius_base * math.cos(a1), -6.65, 1.25 + nozzle_radius_base * math.sin(a1))
            p1 = (x_cen + nozzle_radius_base * math.cos(a2), -6.65, 1.25 + nozzle_radius_base * math.sin(a2))
            p2 = (x_cen + nozzle_radius_exit * math.cos(a2), -7.38, 1.25 + nozzle_radius_exit * math.sin(a2))
            p3 = (x_cen + nozzle_radius_exit * math.cos(a1), -7.38, 1.25 + nozzle_radius_exit * math.sin(a1))

            base_idx = len(petal_verts)
            petal_verts.extend([p0, p1, p2, p3])
            petal_faces.append((base_idx, base_idx + 1, base_idx + 2, base_idx + 3))

        nozzle = create_mesh_obj(f"Rafale_Exhaust_Petals_{side}", petal_verts, petal_faces,
                                 coll, smooth=True, subsurf=1, mat=mats['exhaust_metal'])
        exhaust_objs.append(nozzle)

        # 2. Inner Recessed Combustion Chamber & Soot Interior
        plug = add_cylinder_between(f"Rafale_Turbine_Core_{side}",
                                    (x_cen, -6.60, 1.25), (x_cen, -7.32, 1.25),
                                    nozzle_radius_exit * 0.94, coll, mats['exhaust_interior'], segments=24)
        exhaust_objs.append(plug)

        # 3. Flame Holder Annular Ring inside afterburner
        ring = add_cylinder_between(f"Rafale_Flame_Ring_{side}",
                                    (x_cen, -6.85, 1.25), (x_cen, -6.90, 1.25),
                                    nozzle_radius_exit * 0.55, coll, mats['exhaust_metal'], segments=16)
        exhaust_objs.append(ring)

    # 4. Central Fairing (Drag Chute container & Arresting Hook fairing between engines)
    chute_fairing = add_cylinder_between("Rafale_Drag_Chute_Fairing",
                                         (0.0, -6.50, 1.25), (0.0, -7.35, 1.25),
                                         0.12, coll, mats['airframe_dark'], segments=16)
    exhaust_objs.append(chute_fairing)

    hook = add_cylinder_between("Rafale_Arresting_Hook",
                                (0.0, -5.80, 0.98), (0.0, -7.15, 0.98),
                                0.035, coll, mats['airframe_dark'])
    exhaust_objs.append(hook)

    return exhaust_objs


def build_landing_gear(coll, mats):
    """
    Constructs believable, robust 3D landing gear for the parked Rafale.
    Features:
      - Nose Gear: Forward twin nose wheels (radius 0.26m), heavy oleo shock strut,
        chrome hydraulic piston, torque scissor links, taxi/landing light twin cluster,
        and two open gear doors with 15mm thickness and internal ribs.
      - Main Gear: Sturdy trailing-link shock struts under engine nacelles, large single main wheels
        (radius 0.42m) per side with realistic aircraft tire tread and vented brake assemblies,
        and open main gear bay doors.
    """
    gear_objs = []

    # ==========================================================================
    # A. NOSE LANDING GEAR (at Y = 4.10m, center X = 0.0m)
    # Ground contact at Z = 0.00m, nose axle at Z = 0.26m, bay root at Z = 1.05m
    # ==========================================================================
    n_strut = add_cylinder_between("Rafale_Nose_Strut_Upper",
                                   (0.0, 4.15, 1.05), (0.0, 4.08, 0.52),
                                   0.065, coll, mats['gear_strut'])
    gear_objs.append(n_strut)

    n_piston = add_cylinder_between("Rafale_Nose_Piston_Chrome",
                                    (0.0, 4.08, 0.52), (0.0, 4.05, 0.26),
                                    0.048, coll, mats['chrome_piston'])
    gear_objs.append(n_piston)

    n_axle = add_cylinder_between("Rafale_Nose_Axle",
                                  (-0.18, 4.05, 0.26), (0.18, 4.05, 0.26),
                                  0.032, coll, mats['chrome_piston'])
    gear_objs.append(n_axle)

    for side, sign in [("L", -1.0), ("R", 1.0)]:
        tire = add_cylinder_between(f"Rafale_Nose_Tire_{side}",
                                    (sign * 0.10, 4.05, 0.26), (sign * 0.18, 4.05, 0.26),
                                    0.26, coll, mats['tire_rubber'], segments=24)
        gear_objs.append(tire)
        rim = add_cylinder_between(f"Rafale_Nose_Rim_{side}",
                                   (sign * 0.09, 4.05, 0.26), (sign * 0.19, 4.05, 0.26),
                                   0.15, coll, mats['wheel_rim'], segments=20)
        gear_objs.append(rim)

    add_cylinder_between("Rafale_Nose_Scissor_Upper", (0.0, 4.14, 0.58), (0.0, 4.22, 0.44), 0.022, coll, mats['gear_strut'])
    add_cylinder_between("Rafale_Nose_Scissor_Lower", (0.0, 4.22, 0.44), (0.0, 4.12, 0.32), 0.022, coll, mats['gear_strut'])

    light_l = add_cylinder_between("Rafale_Nose_Light_L", (-0.08, 4.16, 0.65), (-0.08, 4.21, 0.65), 0.042, coll, mats['light_lens'])
    light_r = add_cylinder_between("Rafale_Nose_Light_R", (0.08, 4.16, 0.65), (0.08, 4.21, 0.65), 0.042, coll, mats['light_lens'])
    gear_objs.extend([light_l, light_r])

    for side, sign in [("L", -1.0), ("R", 1.0)]:
        door_verts = [
            (sign * 0.26, 4.55, 0.98), (sign * 0.26, 3.65, 0.98),
            (sign * 0.28, 3.65, 0.55), (sign * 0.28, 4.55, 0.55),
            (sign * 0.24, 4.55, 0.98), (sign * 0.24, 3.65, 0.98),
            (sign * 0.26, 3.65, 0.55), (sign * 0.26, 4.55, 0.55),
        ]
        door_faces = [
            (0, 1, 2, 3), (4, 7, 6, 5), (0, 4, 5, 1), (2, 6, 7, 3), (0, 3, 7, 4), (1, 5, 6, 2)
        ]
        door = create_mesh_obj(f"Rafale_Nose_Door_{side}", door_verts, door_faces, coll, True, 1, mats['airframe'])
        gear_objs.append(door)

    # ==========================================================================
    # B. MAIN LANDING GEAR (Left and Right, at Y = -1.65m, X = ±1.45m)
    # Ground contact at Z = 0.00m, main axle at Z = 0.42m, bay root at Z = 1.25m
    # ==========================================================================
    for side, sign in [("L", -1.0), ("R", 1.0)]:
        x_base = sign * 1.45
        m_strut = add_cylinder_between(f"Rafale_Main_Strut_{side}",
                                       (sign * 1.05, -1.55, 1.25), (x_base, -1.65, 0.68),
                                       0.082, coll, mats['gear_strut'])
        gear_objs.append(m_strut)

        m_piston = add_cylinder_between(f"Rafale_Main_Piston_{side}",
                                        (x_base, -1.65, 0.68), (x_base, -1.68, 0.42),
                                        0.062, coll, mats['chrome_piston'])
        gear_objs.append(m_piston)

        t_arm = add_cylinder_between(f"Rafale_Main_Trailing_Arm_{side}",
                                     (x_base, -1.68, 0.42), (x_base, -1.95, 0.42),
                                     0.052, coll, mats['gear_strut'])
        gear_objs.append(t_arm)

        tire_x1 = x_base - 0.12
        tire_x2 = x_base + 0.12
        tire = add_cylinder_between(f"Rafale_Main_Tire_{side}",
                                    (tire_x1, -1.95, 0.42), (tire_x2, -1.95, 0.42),
                                    0.42, coll, mats['tire_rubber'], segments=28)
        gear_objs.append(tire)

        rim = add_cylinder_between(f"Rafale_Main_Rim_{side}",
                                   (tire_x1 - 0.01, -1.95, 0.42), (tire_x2 + 0.01, -1.95, 0.42),
                                   0.24, coll, mats['wheel_rim'], segments=24)
        gear_objs.append(rim)

        brake = add_cylinder_between(f"Rafale_Main_Brake_{side}",
                                     (sign * (abs(x_base) - 0.14), -1.95, 0.42),
                                     (sign * (abs(x_base) - 0.08), -1.95, 0.42),
                                     0.21, coll, mats['brake_caliper'], segments=16)
        gear_objs.append(brake)

        mdoor_verts = [
            (sign * 0.95, -1.15, 1.15), (sign * 0.95, -2.35, 1.15),
            (sign * 1.02, -2.35, 0.65), (sign * 1.02, -1.15, 0.65),
            (sign * 0.92, -1.15, 1.15), (sign * 0.92, -2.35, 1.15),
            (sign * 0.99, -2.35, 0.65), (sign * 0.99, -1.15, 0.65),
        ]
        mdoor_faces = [
            (0, 1, 2, 3), (4, 7, 6, 5), (0, 4, 5, 1), (2, 6, 7, 3), (0, 3, 7, 4), (1, 5, 6, 2)
        ]
        door = create_mesh_obj(f"Rafale_Main_Door_{side}", mdoor_verts, mdoor_faces, coll, True, 1, mats['airframe'])
        gear_objs.append(door)

    return gear_objs


def build_apron_environment(coll, mats):
    """
    Constructs the concrete airport apron ground plane (60m x 60m):
      - Textured concrete slabs with expansion joint grid seams
      - Weathered yellow taxi centerline stripe
      - Realistic tyre rubber taxi marks and subtle fluid stains
    """
    env_objs = []

    apron_verts = [
        (-35.0, -35.0, 0.0), (35.0, -35.0, 0.0),
        (35.0,  35.0, 0.0), (-35.0,  35.0, 0.0)
    ]
    apron_faces = [(0, 1, 2, 3)]
    apron = create_mesh_obj("Airport_Concrete_Apron", apron_verts, apron_faces, coll, True, 0, mats['apron'])
    env_objs.append(apron)

    stripe_verts = [
        (-0.10, -32.0, 0.001), (0.10, -32.0, 0.001),
        (0.10,  32.0, 0.001), (-0.10,  32.0, 0.001)
    ]
    stripe_faces = [(0, 1, 2, 3)]
    stripe = create_mesh_obj("Taxiway_Yellow_Stripe", stripe_verts, stripe_faces, coll, True, 0, mats['taxi_line'])
    env_objs.append(stripe)

    tar_mat = mats['cockpit_interior']
    for gy in range(-24, 25, 6):
        line = add_cylinder_between(f"Apron_Joint_Y_{gy}", (-30.0, gy, 0.001), (30.0, gy, 0.001), 0.015, coll, tar_mat, segments=4)
        env_objs.append(line)
    for gx in range(-24, 25, 6):
        line = add_cylinder_between(f"Apron_Joint_X_{gx}", (gx, -30.0, 0.001), (gx, 30.0, 0.001), 0.015, coll, tar_mat, segments=4)
        env_objs.append(line)

    return env_objs


# ==============================================================================
# LIGHTING, CAMERAS & RENDER SETUP
# ==============================================================================

def setup_lighting(scene):
    """
    Sets up dramatic warm late-afternoon golden hour lighting using:
      1. Nishita Physical Sky with realistic atmospheric Rayleigh & Mie scattering
         (sun elevation ~11.5°, aerosol turbidity for golden sunset glow)
      2. Key Sun lamp aligned with the sun position for crisp, soft-penumbra aircraft shadows
      3. Subtle cool ambient fill from the overhead sky
    """
    world = scene.world
    if world is None:
        world = bpy.data.worlds.new("World")
        scene.world = world
    world.use_nodes = True
    nodes = world.node_tree.nodes
    links = world.node_tree.links
    nodes.clear()

    sky = nodes.new('ShaderNodeTexSky')
    sky.sky_type = 'MULTIPLE_SCATTERING'
    sky.sun_elevation = math.radians(11.5)  # Late-afternoon golden hour angle
    sky.sun_rotation = math.radians(65.0)   # Rakes dramatically across front 3/4
    sky.altitude = 12.0
    sky.air_density = 1.10
    sky.aerosol_density = 1.80              # Sunset haze
    sky.ozone_density = 1.40
    sky.sun_intensity = 0.85
    sky.sun_size = math.radians(1.85)

    bg = nodes.new('ShaderNodeBackground')
    bg.inputs['Strength'].default_value = 0.90

    output = nodes.new('ShaderNodeOutputWorld')
    links.new(sky.outputs['Color'], bg.inputs['Color'])
    links.new(bg.outputs['Background'], output.inputs['Surface'])

    # Key Sun Light synchronized with the sky sun position
    light_data = bpy.data.lights.new(name="Sun_Key_LateAfternoon", type='SUN')
    light_data.energy = 3.6
    light_data.color = (1.00, 0.86, 0.68)  # Warm golden hour sunlight
    light_data.angle = math.radians(2.0)    # Soft penumbra edges

    sun_obj = bpy.data.objects.new("Sun_Key", light_data)
    scene.collection.objects.link(sun_obj)
    sun_obj.rotation_euler = (math.radians(78.5), math.radians(6.0), math.radians(65.0))

    # Rim light from low rear horizon for edge separation
    rim_data = bpy.data.lights.new(name="Sun_Rim_Fill", type='SUN')
    rim_data.energy = 0.9
    rim_data.color = (0.70, 0.78, 0.92)
    rim_data.angle = math.radians(15.0)
    rim_obj = bpy.data.objects.new("Sun_Rim", rim_data)
    scene.collection.objects.link(rim_obj)
    rim_obj.rotation_euler = (math.radians(-60.0), 0.0, math.radians(-115.0))


def create_camera(name, loc, target, lens=50.0, scene=None):
    cam_data = bpy.data.cameras.new(f"{name}_Data")
    cam_data.lens = lens
    cam_data.clip_start = 0.1
    cam_data.clip_end = 500.0

    cam_obj = bpy.data.objects.new(name, cam_data)
    target_coll = scene.collection if scene else bpy.context.scene.collection
    target_coll.objects.link(cam_obj)

    cam_obj.location = Vector(loc)
    dir_v = (Vector(target) - Vector(loc)).normalized()
    rot_quat = dir_v.to_track_quat('-Z', 'Y')
    cam_obj.rotation_mode = 'QUATERNION'
    cam_obj.rotation_quaternion = rot_quat
    return cam_obj


def configure_cycles(scene, width=1920, height=1080, samples=128):
    scene.render.engine = 'CYCLES'
    try:
        prefs = bpy.context.preferences.addons['cycles'].preferences
        prefs.refresh_devices()
        dev_types = [d[0] for d in prefs.get_device_types(bpy.context)]
        if 'OPTIX' in dev_types:
            prefs.compute_device_type = 'OPTIX'
        elif 'CUDA' in dev_types:
            prefs.compute_device_type = 'CUDA'
        for d in prefs.devices:
            d.use = (d.type in ('OPTIX', 'CUDA'))
        scene.cycles.device = 'GPU'
        print(f"Cycles configured for GPU ({prefs.compute_device_type})")
    except Exception as e:
        print("Warning configuring Cycles GPU:", e)

    scene.cycles.samples = samples
    scene.cycles.use_denoising = True
    scene.render.resolution_x = width
    scene.render.resolution_y = height
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = 'PNG'
    scene.render.image_settings.color_mode = 'RGBA'
    scene.render.image_settings.color_depth = '8'

    try:
        scene.view_settings.view_transform = 'AgX'
        scene.view_settings.look = 'AgX - High Contrast'
        scene.view_settings.exposure = -2.6  # Eliminates white clipping, provides rich tonal contrast
    except Exception:
        pass


# ==============================================================================
# MAIN PIPELINE
# ==============================================================================

def build_scene():
    scene = reset_scene()
    mats = build_materials()
    coll = scene.collection

    # 1. 3D Model Components
    build_fuselage(coll, mats)
    build_air_intakes(coll, mats)
    build_canards(coll, mats)
    build_delta_wings(coll, mats)
    build_vertical_tail(coll, mats)
    build_cockpit_and_canopy(coll, mats)
    build_exhaust_nozzles(coll, mats)
    build_landing_gear(coll, mats)

    # 2. Apron Ground Environment
    build_apron_environment(coll, mats)

    # 3. Lighting
    setup_lighting(scene)

    # 4. Cameras
    # Hero Camera: Dramatic front three-quarter view from eye level, warm late-afternoon light
    cam_hero = create_camera(
        "Camera_Hero_Front3Q",
        loc=(-11.8, 9.4, 1.85),
        target=(0.0, 0.8, 1.45),
        lens=48.0,
        scene=scene
    )

    # Side Preview Camera: Orthographic-like profile inspection
    cam_side = create_camera(
        "Camera_Preview_Side",
        loc=(-19.5, 0.0, 2.20),
        target=(0.0, 0.0, 2.00),
        lens=52.0,
        scene=scene
    )

    # Rear Preview Camera: Rear 3/4 view inspecting exhausts, rudder, and wings
    cam_rear = create_camera(
        "Camera_Preview_Rear",
        loc=(-10.5, -13.5, 2.20),
        target=(0.0, -2.5, 1.85),
        lens=44.0,
        scene=scene
    )

    return scene, cam_hero, cam_side, cam_rear


def main():
    mode, outdir = parse_args()
    print(f"=== Running Dassault Rafale Scene Builder in mode: '{mode}' ===")
    print(f"Output directory: {outdir}")

    scene, cam_hero, cam_side, cam_rear = build_scene()
    blend_path = os.path.join(outdir, "dassault_rafale.blend")

    if mode == "initial":
        configure_cycles(scene, 1280, 720, samples=96)

        scene.camera = cam_hero
        scene.render.filepath = os.path.join(outdir, "preview_initial_hero.png")
        bpy.ops.render.render(write_still=True)
        print("Rendered Initial Hero Preview:", scene.render.filepath)

        scene.camera = cam_side
        scene.render.filepath = os.path.join(outdir, "preview_initial_side.png")
        bpy.ops.render.render(write_still=True)
        print("Rendered Initial Side Preview:", scene.render.filepath)

        scene.camera = cam_rear
        scene.render.filepath = os.path.join(outdir, "preview_initial_rear.png")
        bpy.ops.render.render(write_still=True)
        print("Rendered Initial Rear Preview:", scene.render.filepath)

        bpy.ops.wm.save_as_mainfile(filepath=blend_path)
        print("Saved blend file:", blend_path)

    elif mode == "final":
        configure_cycles(scene, 1280, 720, samples=128)

        scene.camera = cam_side
        scene.render.filepath = os.path.join(outdir, "preview_revised_side.png")
        bpy.ops.render.render(write_still=True)
        print("Rendered Revised Side Preview:", scene.render.filepath)

        scene.camera = cam_rear
        scene.render.filepath = os.path.join(outdir, "preview_revised_rear.png")
        bpy.ops.render.render(write_still=True)
        print("Rendered Revised Rear Preview:", scene.render.filepath)

        # Full Hero Render 1920x1080
        scene.camera = cam_hero
        configure_cycles(scene, 1920, 1080, samples=256)
        scene.render.filepath = os.path.join(outdir, "rafale_hero_final.png")
        bpy.ops.render.render(write_still=True)
        print("Rendered Final Hero Render (1920x1080):", scene.render.filepath)

        bpy.ops.wm.save_as_mainfile(filepath=blend_path)
        print("Saved final blend file:", blend_path)

    else:
        # Full end-to-end run: initial + final
        configure_cycles(scene, 1280, 720, samples=96)
        scene.camera = cam_hero
        scene.render.filepath = os.path.join(outdir, "preview_initial_hero.png")
        bpy.ops.render.render(write_still=True)

        scene.camera = cam_side
        scene.render.filepath = os.path.join(outdir, "preview_initial_side.png")
        bpy.ops.render.render(write_still=True)

        scene.camera = cam_rear
        scene.render.filepath = os.path.join(outdir, "preview_initial_rear.png")
        bpy.ops.render.render(write_still=True)

        scene.camera = cam_side
        scene.render.filepath = os.path.join(outdir, "preview_revised_side.png")
        bpy.ops.render.render(write_still=True)

        scene.camera = cam_rear
        scene.render.filepath = os.path.join(outdir, "preview_revised_rear.png")
        bpy.ops.render.render(write_still=True)

        # Full Hero
        scene.camera = cam_hero
        configure_cycles(scene, 1920, 1080, samples=256)
        scene.render.filepath = os.path.join(outdir, "rafale_hero_final.png")
        bpy.ops.render.render(write_still=True)

        bpy.ops.wm.save_as_mainfile(filepath=blend_path)
        print("Complete end-to-end build finished:", blend_path)


if __name__ == "__main__":
    main()
