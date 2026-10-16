#!/usr/bin/env python3
"""
Dassault Rafale C - Photorealistic 3D Model & Scene Builder for Headless Blender
Builds a detailed, accurate 3D model of a modern Dassault Rafale C parked on a concrete apron,
with realistic PBR materials, procedural panel lines and surface wear, warm late-afternoon lighting,
and Cycles rendering.
"""

import os
import sys
import math
import bpy
import bmesh
from mathutils import Vector, Matrix, Euler


def parse_args():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    mode = argv[0] if len(argv) > 0 else "final"
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
# GEOMETRY & BMesh HELPERS
# ==============================================================================

def create_mesh_obj(name, verts, faces, collection=None, smooth=True, subsurf_levels=0, mat_indices=None):
    mesh = bpy.data.meshes.new(f"{name}_Mesh")
    mesh.from_pydata(verts, [], faces)
    mesh.update()

    if mat_indices is not None and len(mat_indices) == len(mesh.polygons):
        for poly, m_idx in zip(mesh.polygons, mat_indices):
            poly.material_index = m_idx

    # Repair & recalculate normals using BMesh
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

    if subsurf_levels > 0:
        mod = obj.modifiers.new("Subsurf", 'SUBSURF')
        mod.levels = subsurf_levels
        mod.render_levels = subsurf_levels

    return obj


def loft_closed_profiles(name, profiles, cap_start=True, cap_end=True, collection=None,
                         smooth=True, subsurf_levels=1, ring_materials=None):
    """
    profiles: list of rings, where each ring is a list of (x, y, z) tuples of identical length N.
    Notice: No N-gon center vertex caps when subsurf_levels > 0 unless explicitly needed, or we inset the cap
    by adding a tiny inner ring so Catmull-Clark Subdivision never puckers or pinches!
    ring_materials: optional list of material slot indices for each ring segment r in range(n_rings - 1).
    """
    verts = []
    faces = []
    mat_indices = []

    # Build expanded profile list with smooth inset caps so Catmull-Clark Subsurf is 100% pinch-free
    work_profiles = list(profiles)
    work_ring_mats = list(ring_materials) if ring_materials is not None else [0] * (len(profiles) - 1)

    if cap_start:
        c0 = Vector((0, 0, 0))
        for pt in work_profiles[0]:
            c0 += Vector(pt)
        c0 /= len(work_profiles[0])
        inset_ring_1 = [tuple(c0.lerp(Vector(pt), 0.55)) for pt in work_profiles[0]]
        inset_ring_0 = [tuple(c0.lerp(Vector(pt), 0.08)) for pt in work_profiles[0]]
        work_profiles = [inset_ring_0, inset_ring_1] + work_profiles
        m0 = work_ring_mats[0] if work_ring_mats else 0
        work_ring_mats = [m0, m0] + work_ring_mats

    if cap_end:
        c1 = Vector((0, 0, 0))
        for pt in work_profiles[-1]:
            c1 += Vector(pt)
        c1 /= len(work_profiles[-1])
        inset_ring_a = [tuple(c1.lerp(Vector(pt), 0.55)) for pt in work_profiles[-1]]
        inset_ring_b = [tuple(c1.lerp(Vector(pt), 0.08)) for pt in work_profiles[-1]]
        work_profiles = work_profiles + [inset_ring_a, inset_ring_b]
        m_last = work_ring_mats[-1] if work_ring_mats else 0
        work_ring_mats = work_ring_mats + [m_last, m_last]

    n_rings = len(work_profiles)
    n_pts = len(work_profiles[0])

    for ring in work_profiles:
        verts.extend(ring)

    for r in range(n_rings - 1):
        base1 = r * n_pts
        base2 = (r + 1) * n_pts
        m_idx = work_ring_mats[r] if r < len(work_ring_mats) else 0
        for i in range(n_pts):
            ni = (i + 1) % n_pts
            faces.append((base1 + i, base1 + ni, base2 + ni, base2 + i))
            mat_indices.append(m_idx)

    if cap_start:
        c0_idx = len(verts)
        verts.append((c0.x, c0.y, c0.z))
        m0 = work_ring_mats[0]
        for i in range(n_pts):
            ni = (i + 1) % n_pts
            faces.append((c0_idx, ni, i))
            mat_indices.append(m0)

    if cap_end:
        c1_idx = len(verts)
        verts.append((c1.x, c1.y, c1.z))
        base_last = (n_rings - 1) * n_pts
        m_last = work_ring_mats[-1]
        for i in range(n_pts):
            ni = (i + 1) % n_pts
            faces.append((c1_idx, base_last + i, base_last + ni))
            mat_indices.append(m_last)

    return create_mesh_obj(name, verts, faces, collection=collection,
                           smooth=smooth, subsurf_levels=subsurf_levels, mat_indices=mat_indices)


def make_airfoil_section(chord, thickness_ratio, camber=0.015, n_pts=28):
    """
    Returns 2D airfoil coordinates [(u, w), ...] for u in [0, 1] (leading edge 0 to trailing edge 1),
    starting from trailing edge upper surface -> leading edge -> trailing edge lower surface.
    """
    pts = []
    # Upper surface: from TE (1.0) to LE (0.0)
    for i in range(n_pts, -1, -1):
        beta = math.pi * i / n_pts
        u = 0.5 * (1.0 - math.cos(beta))
        yt = 5.0 * thickness_ratio * (
            0.2969 * math.sqrt(max(u, 1e-6))
            - 0.1260 * u
            - 0.3516 * (u ** 2)
            + 0.2843 * (u ** 3)
            - 0.1015 * (u ** 4)
        )
        yc = camber * 4.0 * u * (1.0 - u)
        pts.append((u * chord, (yc + yt) * chord))

    # Lower surface: from LE (skip index 0) to TE (1.0)
    for i in range(1, n_pts + 1):
        beta = math.pi * i / n_pts
        u = 0.5 * (1.0 - math.cos(beta))
        yt = 5.0 * thickness_ratio * (
            0.2969 * math.sqrt(max(u, 1e-6))
            - 0.1260 * u
            - 0.3516 * (u ** 2)
            + 0.2843 * (u ** 3)
            - 0.1015 * (u ** 4)
        )
        yc = camber * 4.0 * u * (1.0 - u)
        pts.append((u * chord, (yc - yt) * chord))

    return pts


def build_airfoil_surface(name, stations, collection=None, smooth=True, subsurf_levels=1,
                          cap_start=False, cap_end=True):
    """
    Builds a crisp, pinch-free airfoil lifting surface.
    Note: Root station (inside fuselage/spine) uses cap_start=False so Catmull-Clark Subsurf never
    pulls the root boundary toward an N-gon centroid (eliminating vertical tail & wing root pleating!).
    """
    n_pts = 26
    profiles = []
    for st in stations:
        le = Vector(st['le'])
        chord = st['chord']
        t_ratio = st.get('t_ratio', 0.045)
        camber = st.get('camber', 0.01)
        twist = math.radians(st.get('twist_deg', 0.0))
        vertical = st.get('vertical', False)

        sec_2d = make_airfoil_section(chord, t_ratio, camber=camber, n_pts=n_pts)
        ring = []
        for u_dist, thick_dist in sec_2d:
            dy = -u_dist * math.cos(twist) - thick_dist * math.sin(twist)
            dh = -u_dist * math.sin(twist) + thick_dist * math.cos(twist)
            if vertical:
                ring.append((le.x + dh, le.y + dy, le.z))
            else:
                ring.append((le.x, le.y + dy, le.z + dh))
        profiles.append(ring)

    return loft_closed_profiles(name, profiles, cap_start=cap_start, cap_end=cap_end,
                                collection=collection, smooth=smooth, subsurf_levels=subsurf_levels)


# ==============================================================================
# MATERIALS & PROCEDURAL SHADERS
# ==============================================================================

def create_materials():
    mats = {}

    # 1. Main Rafale Airframe Tactical Grey Paint (with restrained panel lines & subtle surface wear)
    mat_airframe = bpy.data.materials.new("Rafale_Airframe_Grey")
    tree = mat_airframe.node_tree
    nodes = tree.nodes
    links = tree.links
    nodes.clear()

    out = nodes.new("ShaderNodeOutputMaterial")
    bsdf = nodes.new("ShaderNodeBsdfPrincipled")
    links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])

    # Use World/Object Position from Geometry node so panel lines & wear have uniform real-world metric scale across all parts!
    geom = nodes.new("ShaderNodeNewGeometry")

    # Subtle surface wear / mottling (two-scale noise)
    noise_large = nodes.new("ShaderNodeTexNoise")
    noise_large.inputs["Scale"].default_value = 0.85
    noise_large.inputs["Detail"].default_value = 6.0
    noise_large.inputs["Roughness"].default_value = 0.65
    links.new(geom.outputs["Position"], noise_large.inputs["Vector"])

    noise_fine = nodes.new("ShaderNodeTexNoise")
    noise_fine.inputs["Scale"].default_value = 6.5
    noise_fine.inputs["Detail"].default_value = 8.0
    noise_fine.inputs["Roughness"].default_value = 0.72
    links.new(geom.outputs["Position"], noise_fine.inputs["Vector"])

    # Restrained panel lines using Brick Texture in 2 projections (Top/Bottom XY and Side YZ)
    mapping_xy = nodes.new("ShaderNodeMapping")
    mapping_xy.inputs["Scale"].default_value = (1.15, 0.75, 1.0)
    links.new(geom.outputs["Position"], mapping_xy.inputs["Vector"])

    brick_xy = nodes.new("ShaderNodeTexBrick")
    brick_xy.offset = 0.5
    brick_xy.squash = 1.0
    brick_xy.inputs["Color1"].default_value = (1.0, 1.0, 1.0, 1.0)
    brick_xy.inputs["Color2"].default_value = (0.94, 0.94, 0.94, 1.0)
    brick_xy.inputs["Mortar"].default_value = (0.0, 0.0, 0.0, 1.0)
    brick_xy.inputs["Scale"].default_value = 1.65
    brick_xy.inputs["Mortar Size"].default_value = 0.0055
    brick_xy.inputs["Mortar Smooth"].default_value = 0.20
    brick_xy.inputs["Bias"].default_value = 0.0
    brick_xy.inputs["Brick Width"].default_value = 0.95
    brick_xy.inputs["Row Height"].default_value = 0.52
    links.new(mapping_xy.outputs["Vector"], brick_xy.inputs["Vector"])

    # Side projection YZ mapped to XY for fuselage & vertical tail side panel lines
    sep_xyz = nodes.new("ShaderNodeSeparateXYZ")
    links.new(geom.outputs["Position"], sep_xyz.inputs["Vector"])
    comb_yz = nodes.new("ShaderNodeCombineXYZ")
    links.new(sep_xyz.outputs["Y"], comb_yz.inputs["X"])
    links.new(sep_xyz.outputs["Z"], comb_yz.inputs["Y"])
    links.new(sep_xyz.outputs["X"], comb_yz.inputs["Z"])

    brick_yz = nodes.new("ShaderNodeTexBrick")
    brick_yz.offset = 0.35
    brick_yz.inputs["Color1"].default_value = (1.0, 1.0, 1.0, 1.0)
    brick_yz.inputs["Color2"].default_value = (0.95, 0.95, 0.95, 1.0)
    brick_yz.inputs["Mortar"].default_value = (0.0, 0.0, 0.0, 1.0)
    brick_yz.inputs["Scale"].default_value = 1.55
    brick_yz.inputs["Mortar Size"].default_value = 0.0055
    brick_yz.inputs["Mortar Smooth"].default_value = 0.20
    brick_yz.inputs["Brick Width"].default_value = 1.05
    brick_yz.inputs["Row Height"].default_value = 0.48
    links.new(comb_yz.outputs["Vector"], brick_yz.inputs["Vector"])

    # Combine top/bottom and side brick patterns based on surface normal!
    sep_norm = nodes.new("ShaderNodeSeparateXYZ")
    links.new(geom.outputs["Normal"], sep_norm.inputs["Vector"])
    abs_nx = nodes.new("ShaderNodeMath")
    abs_nx.operation = 'ABSOLUTE'
    links.new(sep_norm.outputs["X"], abs_nx.inputs[0])

    mix_brick = nodes.new("ShaderNodeMix")
    mix_brick.data_type = 'RGBA'
    links.new(abs_nx.outputs["Value"], mix_brick.inputs["Factor"])
    links.new(brick_xy.outputs["Color"], mix_brick.inputs[6])
    links.new(brick_yz.outputs["Color"], mix_brick.inputs[7])

    # Combine noise for base color variation (French Air Force Celomer tactical grey)
    mix_noise = nodes.new("ShaderNodeMix")
    mix_noise.data_type = 'FLOAT'
    mix_noise.inputs["Factor"].default_value = 0.42
    links.new(noise_large.outputs["Fac"], mix_noise.inputs[2])
    links.new(noise_fine.outputs["Fac"], mix_noise.inputs[3])

    ramp_color = nodes.new("ShaderNodeValToRGB")
    ramp_color.color_ramp.elements[0].position = 0.25
    ramp_color.color_ramp.elements[0].color = (0.175, 0.195, 0.220, 1.0)  # Weathered tactical slate grey
    ramp_color.color_ramp.elements[1].position = 0.75
    ramp_color.color_ramp.elements[1].color = (0.235, 0.258, 0.285, 1.0)  # Standard Celomer grey-blue
    links.new(mix_noise.outputs[0], ramp_color.inputs["Fac"])

    # Darken slightly inside panel seams and give subtle panel-to-panel tonal variation
    panel_col_ramp = nodes.new("ShaderNodeValToRGB")
    panel_col_ramp.color_ramp.elements[0].position = 0.0
    panel_col_ramp.color_ramp.elements[0].color = (0.08, 0.09, 0.105, 1.0)
    panel_col_ramp.color_ramp.elements[1].position = 1.0
    panel_col_ramp.color_ramp.elements[1].color = (0.22, 0.24, 0.268, 1.0)
    links.new(mix_brick.outputs[2], panel_col_ramp.inputs["Fac"])

    mix_panel_col = nodes.new("ShaderNodeMix")
    mix_panel_col.data_type = 'RGBA'
    mix_panel_col.inputs["Factor"].default_value = 0.42
    links.new(ramp_color.outputs["Color"], mix_panel_col.inputs[6])
    links.new(panel_col_ramp.outputs["Color"], mix_panel_col.inputs[7])

    links.new(mix_panel_col.outputs[2], bsdf.inputs["Base Color"])
    bsdf.inputs["Metallic"].default_value = 0.14

    # Roughness variation (satin matte military finish: 0.34 to 0.55)
    ramp_rough = nodes.new("ShaderNodeValToRGB")
    ramp_rough.color_ramp.elements[0].position = 0.2
    ramp_rough.color_ramp.elements[0].color = (0.34, 0.34, 0.34, 1.0)
    ramp_rough.color_ramp.elements[1].position = 0.8
    ramp_rough.color_ramp.elements[1].color = (0.55, 0.55, 0.55, 1.0)
    links.new(mix_noise.outputs[0], ramp_rough.inputs["Fac"])
    links.new(ramp_rough.outputs["Color"], bsdf.inputs["Roughness"])

    # Bump node for restrained panel lines + micro surface texture
    bump_panel = nodes.new("ShaderNodeBump")
    bump_panel.inputs["Strength"].default_value = 0.22
    bump_panel.inputs["Distance"].default_value = 0.0035
    links.new(mix_brick.outputs[2], bump_panel.inputs["Height"])

    bump_wear = nodes.new("ShaderNodeBump")
    bump_wear.inputs["Strength"].default_value = 0.045
    bump_wear.inputs["Distance"].default_value = 0.002
    links.new(noise_fine.outputs["Fac"], bump_wear.inputs["Height"])
    links.new(bump_panel.outputs["Normal"], bump_wear.inputs["Normal"])
    links.new(bump_wear.outputs["Normal"], bsdf.inputs["Normal"])

    mats['airframe'] = mat_airframe

    # 2. Radome / Nose Cone Material (Slightly darker slate composite dielectric with subtle weathering)
    mat_radome = bpy.data.materials.new("Rafale_Radome")
    tree = mat_radome.node_tree
    bsdf = tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (0.135, 0.150, 0.172, 1.0)
    bsdf.inputs["Metallic"].default_value = 0.04
    bsdf.inputs["Roughness"].default_value = 0.36
    if "Coat Weight" in bsdf.inputs:
        bsdf.inputs["Coat Weight"].default_value = 0.18
        bsdf.inputs["Coat Roughness"].default_value = 0.24
    mats['radome'] = mat_radome

    # 3. Dielectric Sensor / Leading Edge / Fin Tip Material (Dark Charcoal)
    mat_sensor = bpy.data.materials.new("Rafale_Sensor_Dark")
    bsdf = mat_sensor.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (0.065, 0.070, 0.080, 1.0)
    bsdf.inputs["Metallic"].default_value = 0.06
    bsdf.inputs["Roughness"].default_value = 0.30
    mats['sensor'] = mat_sensor

    # 4. Gold-Tinted Canopy Glass (Rafale signature radar-absorbent gold/amber iridescent tint)
    mat_canopy = bpy.data.materials.new("Rafale_Canopy_GoldTint")
    tree = mat_canopy.node_tree
    nodes = tree.nodes
    links = tree.links
    nodes.clear()

    out = nodes.new("ShaderNodeOutputMaterial")
    bsdf = nodes.new("ShaderNodeBsdfPrincipled")
    links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])

    fresnel = nodes.new("ShaderNodeLayerWeight")
    fresnel.inputs["Blend"].default_value = 0.35

    ramp_tint = nodes.new("ShaderNodeValToRGB")
    ramp_tint.color_ramp.elements[0].position = 0.0
    ramp_tint.color_ramp.elements[0].color = (0.16, 0.13, 0.07, 1.0)   # Smoked warm amber-bronze core
    ramp_tint.color_ramp.elements[1].position = 0.75
    ramp_tint.color_ramp.elements[1].color = (0.82, 0.60, 0.22, 1.0)   # Metallic gold reflection at grazing angles
    links.new(fresnel.outputs["Facing"], ramp_tint.inputs["Fac"])

    links.new(ramp_tint.outputs["Color"], bsdf.inputs["Base Color"])
    bsdf.inputs["Metallic"].default_value = 0.20
    bsdf.inputs["Roughness"].default_value = 0.025
    bsdf.inputs["IOR"].default_value = 1.52
    if "Transmission Weight" in bsdf.inputs:
        bsdf.inputs["Transmission Weight"].default_value = 0.78
    if "Coat Weight" in bsdf.inputs:
        bsdf.inputs["Coat Weight"].default_value = 0.90
        bsdf.inputs["Coat Roughness"].default_value = 0.012
        bsdf.inputs["Coat Tint"].default_value = (0.96, 0.76, 0.34, 1.0)
    if "Thin Film Thickness" in bsdf.inputs:
        bsdf.inputs["Thin Film Thickness"].default_value = 420.0
        bsdf.inputs["Thin Film IOR"].default_value = 1.65
    mats['canopy'] = mat_canopy

    # 5. Cockpit Interior (Dark matte anthracite instrument/seat finish)
    mat_cockpit = bpy.data.materials.new("Rafale_Cockpit_Interior")
    bsdf = mat_cockpit.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (0.025, 0.028, 0.032, 1.0)
    bsdf.inputs["Metallic"].default_value = 0.15
    bsdf.inputs["Roughness"].default_value = 0.75
    mats['cockpit'] = mat_cockpit

    # 6. HUD Glass (Greenish reflective combiner glass)
    mat_hud = bpy.data.materials.new("Rafale_HUD_Glass")
    bsdf = mat_hud.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (0.1, 0.85, 0.45, 1.0)
    bsdf.inputs["Metallic"].default_value = 0.1
    bsdf.inputs["Roughness"].default_value = 0.04
    if "Transmission Weight" in bsdf.inputs:
        bsdf.inputs["Transmission Weight"].default_value = 0.75
    if "Emission Color" in bsdf.inputs:
        bsdf.inputs["Emission Color"].default_value = (0.05, 0.55, 0.25, 1.0)
        bsdf.inputs["Emission Strength"].default_value = 0.4
    mats['hud'] = mat_hud

    # 7. Snecma M88 Exhaust Outer Petals (Heat-stained Titanium / Carbon-Ceramic Dark Metallic)
    mat_exhaust = bpy.data.materials.new("Rafale_Exhaust_Metal")
    tree = mat_exhaust.node_tree
    nodes = tree.nodes
    links = tree.links
    nodes.clear()
    out = nodes.new("ShaderNodeOutputMaterial")
    bsdf = nodes.new("ShaderNodeBsdfPrincipled")
    links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])

    geom_ex = nodes.new("ShaderNodeNewGeometry")
    noise_ex = nodes.new("ShaderNodeTexNoise")
    noise_ex.inputs["Scale"].default_value = 10.0
    noise_ex.inputs["Detail"].default_value = 6.0
    links.new(geom_ex.outputs["Position"], noise_ex.inputs["Vector"])

    ramp_ex = nodes.new("ShaderNodeValToRGB")
    ramp_ex.color_ramp.elements[0].position = 0.2
    ramp_ex.color_ramp.elements[0].color = (0.075, 0.070, 0.068, 1.0)  # Dark carbon/soot titanium
    ramp_ex.color_ramp.elements[1].position = 0.8
    ramp_ex.color_ramp.elements[1].color = (0.19, 0.160, 0.135, 1.0)  # Warm bronze heat-tinted titanium
    links.new(noise_ex.outputs["Fac"], ramp_ex.inputs["Fac"])

    links.new(ramp_ex.outputs["Color"], bsdf.inputs["Base Color"])
    bsdf.inputs["Metallic"].default_value = 0.88
    bsdf.inputs["Roughness"].default_value = 0.32
    if "Anisotropic" in bsdf.inputs:
        bsdf.inputs["Anisotropic"].default_value = 0.45
    mats['exhaust'] = mat_exhaust

    # 8. Exhaust Inner Liner & Turbine (Deep blackened metallic carbon)
    mat_exhaust_inner = bpy.data.materials.new("Rafale_Exhaust_Inner")
    bsdf = mat_exhaust_inner.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (0.032, 0.032, 0.035, 1.0)
    bsdf.inputs["Metallic"].default_value = 0.75
    bsdf.inputs["Roughness"].default_value = 0.50
    mats['exhaust_inner'] = mat_exhaust_inner

    # 9. Landing Gear Struts (Gloss White / Light Grey French Air Force Messier-Dowty finish)
    mat_gear_strut = bpy.data.materials.new("Rafale_Gear_Strut_White")
    bsdf = mat_gear_strut.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (0.78, 0.79, 0.81, 1.0)
    bsdf.inputs["Metallic"].default_value = 0.18
    bsdf.inputs["Roughness"].default_value = 0.28
    mats['gear_strut'] = mat_gear_strut

    # 10. Oleo Chrome & Brake Discs (Mirror polished hydraulic cylinder / steel)
    mat_chrome = bpy.data.materials.new("Rafale_Oleo_Chrome")
    bsdf = mat_chrome.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (0.90, 0.91, 0.94, 1.0)
    bsdf.inputs["Metallic"].default_value = 0.98
    bsdf.inputs["Roughness"].default_value = 0.06
    mats['chrome'] = mat_chrome

    # 11. Tire Rubber (Deep charcoal vulcanized rubber with procedural circumferential ribs & wear)
    mat_tire = bpy.data.materials.new("Rafale_Tire_Rubber")
    tree = mat_tire.node_tree
    nodes = tree.nodes
    links = tree.links
    nodes.clear()
    out = nodes.new("ShaderNodeOutputMaterial")
    bsdf = nodes.new("ShaderNodeBsdfPrincipled")
    links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])

    geom_t = nodes.new("ShaderNodeNewGeometry")
    noise_t = nodes.new("ShaderNodeTexNoise")
    noise_t.inputs["Scale"].default_value = 28.0
    noise_t.inputs["Detail"].default_value = 8.0
    links.new(geom_t.outputs["Position"], noise_t.inputs["Vector"])

    # Circumferential tread grooves along X coordinate of tire
    sep_t = nodes.new("ShaderNodeSeparateXYZ")
    links.new(geom_t.outputs["Position"], sep_t.inputs["Vector"])
    wave_t = nodes.new("ShaderNodeTexWave")
    wave_t.wave_type = 'BANDS'
    wave_t.bands_direction = 'X'
    wave_t.inputs["Scale"].default_value = 24.0
    wave_t.inputs["Distortion"].default_value = 0.0
    links.new(geom_t.outputs["Position"], wave_t.inputs["Vector"])

    ramp_t = nodes.new("ShaderNodeValToRGB")
    ramp_t.color_ramp.elements[0].position = 0.2
    ramp_t.color_ramp.elements[0].color = (0.022, 0.022, 0.024, 1.0)  # Deep vulcanized black rubber
    ramp_t.color_ramp.elements[1].position = 0.85
    ramp_t.color_ramp.elements[1].color = (0.045, 0.044, 0.046, 1.0)  # Subtle greyed rubber tread wear
    links.new(noise_t.outputs["Fac"], ramp_t.inputs["Fac"])

    links.new(ramp_t.outputs["Color"], bsdf.inputs["Base Color"])
    bsdf.inputs["Metallic"].default_value = 0.0
    bsdf.inputs["Roughness"].default_value = 0.82

    bump_t = nodes.new("ShaderNodeBump")
    bump_t.inputs["Strength"].default_value = 0.25
    bump_t.inputs["Distance"].default_value = 0.003
    links.new(wave_t.outputs["Color"], bump_t.inputs["Height"])
    links.new(bump_t.outputs["Normal"], bsdf.inputs["Normal"])
    mats['tire'] = mat_tire

    # 12. Concrete Apron (Photorealistic weathered concrete slabs with expansion joints & oil/tire stains)
    mat_apron = bpy.data.materials.new("Concrete_Apron")
    tree = mat_apron.node_tree
    nodes = tree.nodes
    links = tree.links
    nodes.clear()

    out = nodes.new("ShaderNodeOutputMaterial")
    bsdf = nodes.new("ShaderNodeBsdfPrincipled")
    links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])

    geom_a = nodes.new("ShaderNodeNewGeometry")

    # Concrete slab joints using Brick Texture (5m x 5m square concrete slabs in world meters)
    brick_apron = nodes.new("ShaderNodeTexBrick")
    brick_apron.offset = 0.0
    brick_apron.inputs["Color1"].default_value = (0.96, 0.96, 0.96, 1.0)
    brick_apron.inputs["Color2"].default_value = (1.0, 1.0, 1.0, 1.0)
    brick_apron.inputs["Mortar"].default_value = (0.06, 0.055, 0.05, 1.0)
    brick_apron.inputs["Scale"].default_value = 0.20
    brick_apron.inputs["Mortar Size"].default_value = 0.006
    brick_apron.inputs["Mortar Smooth"].default_value = 0.30
    brick_apron.inputs["Brick Width"].default_value = 1.0
    brick_apron.inputs["Row Height"].default_value = 1.0
    links.new(geom_a.outputs["Position"], brick_apron.inputs["Vector"])

    # Macro concrete stains / weathering
    noise_macro = nodes.new("ShaderNodeTexNoise")
    noise_macro.inputs["Scale"].default_value = 0.28
    noise_macro.inputs["Detail"].default_value = 8.0
    noise_macro.inputs["Roughness"].default_value = 0.68
    links.new(geom_a.outputs["Position"], noise_macro.inputs["Vector"])

    # Micro concrete aggregate grain
    noise_grain = nodes.new("ShaderNodeTexNoise")
    noise_grain.inputs["Scale"].default_value = 32.0
    noise_grain.inputs["Detail"].default_value = 12.0
    noise_grain.inputs["Roughness"].default_value = 0.82
    links.new(geom_a.outputs["Position"], noise_grain.inputs["Vector"])

    mix_conc = nodes.new("ShaderNodeMix")
    mix_conc.data_type = 'FLOAT'
    mix_conc.inputs["Factor"].default_value = 0.45
    links.new(noise_macro.outputs["Fac"], mix_conc.inputs[2])
    links.new(noise_grain.outputs["Fac"], mix_conc.inputs[3])

    ramp_conc = nodes.new("ShaderNodeValToRGB")
    ramp_conc.color_ramp.elements[0].position = 0.22
    ramp_conc.color_ramp.elements[0].color = (0.18, 0.172, 0.160, 1.0)   # Darker oil/weathered concrete
    ramp_conc.color_ramp.elements[1].position = 0.78
    ramp_conc.color_ramp.elements[1].color = (0.33, 0.315, 0.295, 1.0)  # Warm grey concrete
    links.new(mix_conc.outputs[0], ramp_conc.inputs["Fac"])

    # Darken expansion joints
    mix_joint = nodes.new("ShaderNodeMix")
    mix_joint.data_type = 'RGBA'
    links.new(brick_apron.outputs["Fac"], mix_joint.inputs["Factor"])
    links.new(ramp_conc.outputs["Color"], mix_joint.inputs[6])
    mix_joint.inputs[7].default_value = (0.06, 0.055, 0.05, 1.0)

    links.new(mix_joint.outputs[2], bsdf.inputs["Base Color"])
    bsdf.inputs["Metallic"].default_value = 0.0

    # Concrete roughness variation (0.48 to 0.85 so golden hour sun + aircraft cast subtle reflections)
    ramp_c_rough = nodes.new("ShaderNodeValToRGB")
    ramp_c_rough.color_ramp.elements[0].position = 0.2
    ramp_c_rough.color_ramp.elements[0].color = (0.46, 0.46, 0.46, 1.0)
    ramp_c_rough.color_ramp.elements[1].position = 0.8
    ramp_c_rough.color_ramp.elements[1].color = (0.85, 0.85, 0.85, 1.0)
    links.new(mix_conc.outputs[0], ramp_c_rough.inputs["Fac"])
    links.new(ramp_c_rough.outputs["Color"], bsdf.inputs["Roughness"])

    # Bump for slab joints + concrete grain
    bump_joint = nodes.new("ShaderNodeBump")
    bump_joint.inputs["Strength"].default_value = 0.50
    bump_joint.inputs["Distance"].default_value = 0.012
    links.new(brick_apron.outputs["Color"], bump_joint.inputs["Height"])

    bump_grain = nodes.new("ShaderNodeBump")
    bump_grain.inputs["Strength"].default_value = 0.20
    bump_grain.inputs["Distance"].default_value = 0.004
    links.new(noise_grain.outputs["Fac"], bump_grain.inputs["Height"])
    links.new(bump_joint.outputs["Normal"], bump_grain.inputs["Normal"])
    links.new(bump_grain.outputs["Normal"], bsdf.inputs["Normal"])

    mats['apron'] = mat_apron

    # 13. Apron Yellow Taxi Line Paint
    mat_marking = bpy.data.materials.new("Apron_Taxi_Yellow")
    bsdf = mat_marking.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (0.65, 0.44, 0.07, 1.0)
    bsdf.inputs["Roughness"].default_value = 0.72
    mats['marking'] = mat_marking

    return mats


def assign_mat(obj, mat):
    if obj.data.materials:
        obj.data.materials[0] = mat
    else:
        obj.data.materials.append(mat)


# ==============================================================================
# DASSAULT RAFALE 3D GEOMETRY CONSTRUCTION
# ==============================================================================

def make_fuselage_ring(y, z_bot, z_mid, z_top, half_w_bot, half_w_mid, half_w_top,
                       twin_lobe=0.0, chine_sharpness=0.0, n_half=18):
    """
    Generates a 2*n_half vertex closed cross-section ring at longitudinal station y.
    Uses smooth parametric curves from bottom centerline (0, y, z_bot) -> right side -> top centerline (0, y, z_top) -> left side.
    """
    ring = []
    total_pts = n_half * 2
    for i in range(total_pts):
        theta = 2.0 * math.pi * i / total_pts
        s = math.sin(theta)
        c = -math.cos(theta)  # -1 at bottom, 0 at mid, +1 at top

        if c < 0:
            t = 1.0 + c  # 0 at bottom, 1 at mid
            w_interp = half_w_bot + (half_w_mid - half_w_bot) * (t ** 0.65)
            x = math.copysign(abs(s) ** 0.85, s) * w_interp
            z_base = z_bot + (z_mid - z_bot) * (1.0 - (abs(c) ** 1.35))
            gulley = twin_lobe * (1.0 - abs(s)) * math.exp(-4.0 * (s ** 2))
            z = z_base + gulley * 0.14
        else:
            t = c  # 0 at mid, 1 at top
            w_interp = half_w_mid * ((1.0 - (t ** 1.35)) ** 0.7) + half_w_top * (t ** 1.5)
            x = s * w_interp
            z = z_mid + (z_top - z_mid) * (t ** 0.88)
            if chine_sharpness > 0.0 and t < 0.35:
                x *= (1.0 + chine_sharpness * (0.35 - t))

        ring.append((x, y, z))
    return ring


def build_fuselage_and_radome(coll, mats):
    """
    Builds the main fuselage and radome nose cone as a SINGLE continuous, seamless lofted mesh
    from Y = -7.28m (engine shroud) to Y = +7.62m (nose tip) so there is zero pinching at the radome joint!
    Uses 2 material slots: slot 0 = tactical grey airframe (Y <= 4.86m), slot 1 = slate radome (Y > 4.86m).
    """
    # Combined continuous stations from tail (-7.28m) to nose tip (+7.62m)
    # Tightly spaced rings around Y = 4.86m create a crisp panel break without any Catmull-Clark pinch!
    all_specs = [
        # (y, z_bot, z_mid, z_top, hw_bot, hw_mid, hw_top, twin_lobe, chine, mat_slot)
        (-7.28, 1.22, 1.56, 1.88, 0.72, 0.80, 0.58, 1.0,  0.00, 0),
        (-6.90, 1.16, 1.56, 1.98, 0.76, 0.85, 0.62, 1.0,  0.05, 0),
        (-6.00, 1.08, 1.56, 2.12, 0.82, 0.94, 0.55, 0.9,  0.12, 0),
        (-4.50, 1.02, 1.56, 2.22, 0.86, 1.02, 0.46, 0.75, 0.18, 0),
        (-3.00, 0.98, 1.56, 2.26, 0.88, 1.05, 0.42, 0.55, 0.22, 0),
        (-1.50, 0.96, 1.58, 2.28, 0.86, 1.02, 0.40, 0.35, 0.25, 0),
        ( 0.00, 0.96, 1.60, 2.28, 0.80, 0.96, 0.38, 0.15, 0.25, 0),
        ( 1.20, 0.98, 1.62, 2.25, 0.68, 0.86, 0.38, 0.0,  0.22, 0),
        ( 2.20, 1.00, 1.60, 2.08, 0.52, 0.74, 0.40, 0.0,  0.20, 0),
        ( 3.40, 1.02, 1.56, 2.04, 0.44, 0.68, 0.36, 0.0,  0.20, 0),
        ( 4.30, 1.04, 1.52, 2.00, 0.38, 0.62, 0.28, 0.0,  0.18, 0),
        ( 4.82, 1.06, 1.48, 1.95, 0.34, 0.56, 0.22, 0.0,  0.18, 0),
        # Radome transition seam at Y=4.86m (tiny 4mm groove ring for crisp physical radome line)
        ( 4.86, 1.063, 1.48, 1.946, 0.337, 0.556, 0.218, 0.0, 0.18, 1),
        ( 4.90, 1.065, 1.48, 1.942, 0.335, 0.554, 0.216, 0.0, 0.18, 1),
        ( 5.45, 1.12, 1.47, 1.84, 0.27, 0.46, 0.17, 0.0,  0.20, 1),
        ( 6.05, 1.20, 1.45, 1.72, 0.19, 0.35, 0.12, 0.0,  0.22, 1),
        ( 6.65, 1.28, 1.44, 1.59, 0.11, 0.22, 0.07, 0.0,  0.15, 1),
        ( 7.20, 1.36, 1.43, 1.49, 0.045, 0.095, 0.035, 0.0, 0.05, 1),
        ( 7.52, 1.40, 1.42, 1.44, 0.014, 0.024, 0.010, 0.0, 0.00, 1),
        ( 7.62, 1.418, 1.42, 1.422, 0.003, 0.004, 0.003, 0.0, 0.00, 1),
    ]

    fuse_rings = [make_fuselage_ring(*sp[:9]) for sp in all_specs]
    ring_mats = [all_specs[r][9] for r in range(len(all_specs) - 1)]

    fuse_obj = loft_closed_profiles("Rafale_Fuselage_Body", fuse_rings, cap_start=True, cap_end=True,
                                    collection=coll, smooth=True, subsurf_levels=2, ring_materials=ring_mats)
    fuse_obj.data.materials.append(mats['airframe'])
    fuse_obj.data.materials.append(mats['radome'])

    # Pitot / nose tip lightning diverter probe
    bpy.ops.mesh.primitive_cone_add(vertices=16, radius1=0.012, radius2=0.002, depth=0.24,
                                    location=(0.0, 7.72, 1.42), rotation=(math.radians(-90), 0, 0))
    pitot = bpy.context.active_object
    pitot.name = "Rafale_Nose_Probe"
    coll.objects.link(pitot)
    bpy.context.scene.collection.objects.unlink(pitot)
    assign_mat(pitot, mats['sensor'])

    # Dorsal Spine Fairing (smoothly faired into the upper fuselage without pinch)
    spine_specs = [
        (-6.75, 1.82, 1.94, 2.04, 0.26, 0.24, 0.08, 0.0, 0.0),
        (-5.50, 1.95, 2.15, 2.34, 0.34, 0.30, 0.12, 0.0, 0.0),
        (-3.50, 2.05, 2.26, 2.44, 0.38, 0.34, 0.15, 0.0, 0.0),
        (-1.20, 2.08, 2.30, 2.50, 0.40, 0.36, 0.18, 0.0, 0.0),
        ( 0.80, 2.08, 2.32, 2.54, 0.42, 0.38, 0.20, 0.0, 0.0),
        ( 1.55, 2.05, 2.28, 2.48, 0.40, 0.36, 0.18, 0.0, 0.0),
    ]
    spine_rings = [make_fuselage_ring(*sp, n_half=14) for sp in spine_specs]
    spine_obj = loft_closed_profiles("Rafale_Dorsal_Spine", spine_rings, cap_start=True, cap_end=True,
                                     collection=coll, smooth=True, subsurf_levels=2)
    assign_mat(spine_obj, mats['airframe'])

    # Forward Canard Mounting Shoulders / LERX Chines (sleek integrated fairing blending into the fuselage sides)
    for side in (-1.0, 1.0):
        side_name = "R" if side > 0 else "L"
        shoulder_specs = []
        raw_sh = [
            # (y, x_in, x_out, z_bot, z_top)
            (0.45, 0.42, 0.78, 1.72, 2.12),
            (1.25, 0.40, 0.80, 1.76, 2.16),
            (2.15, 0.36, 0.75, 1.78, 2.14),
            (2.95, 0.32, 0.65, 1.76, 2.06),
            (3.60, 0.28, 0.48, 1.70, 1.94),
        ]
        for y, xi, xo, zb, zt in raw_sh:
            zm = 0.5 * (zb + zt)
            xm = 0.5 * (xi + xo)
            ring = [
                (side * xi, y, zb),
                (side * xm, y, zb - 0.03),
                (side * xo, y, zm - 0.03),
                (side * (xo + 0.03), y, zm),
                (side * xo, y, zm + 0.05),
                (side * xm, y, zt + 0.02),
                (side * xi, y, zt),
                (side * (xi - 0.04), y, zm),
            ]
            if side < 0:
                ring.reverse()
            shoulder_specs.append(ring)
        sh_obj = loft_closed_profiles(f"Rafale_Canard_Shoulder_{side_name}", shoulder_specs,
                                      cap_start=True, cap_end=True, collection=coll, smooth=True, subsurf_levels=2)
        assign_mat(sh_obj, mats['airframe'])


def build_cockpit_and_canopy(coll, mats):
    """
    Builds the single-seat Rafale C teardrop bubble canopy, canopy frame arches,
    cockpit coaming, HUD, Martin-Baker Mk16 ejection seat, FSO optronics ball, and IFR probe.
    """
    # 1. Cockpit Tub / Coaming & Glare Shield
    coaming_verts = [
        (-0.38, 1.50, 1.95), (0.38, 1.50, 1.95), (0.34, 4.45, 1.92), (-0.34, 4.45, 1.92),
        (-0.32, 1.60, 2.14), (0.32, 1.60, 2.14), (0.24, 4.30, 2.08), (-0.24, 4.30, 2.08),
    ]
    coaming_faces = [
        (0, 1, 2, 3), (4, 7, 6, 5), (0, 4, 5, 1), (1, 5, 6, 2), (2, 6, 7, 3), (3, 7, 4, 0)
    ]
    coaming = create_mesh_obj("Rafale_Cockpit_Tub", coaming_verts, coaming_faces, collection=coll, smooth=True, subsurf_levels=1)
    assign_mat(coaming, mats['cockpit'])

    # 2. Martin-Baker Mk 16F Ejection Seat (inclined 29 degrees as in Rafale)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, 2.55, 2.18))
    seat_back = bpy.context.active_object
    seat_back.name = "Rafale_Ejection_Seat_Back"
    seat_back.scale = (0.22, 0.12, 0.42)
    seat_back.rotation_euler = (math.radians(-29), 0, 0)
    coll.objects.link(seat_back)
    bpy.context.scene.collection.objects.unlink(seat_back)
    assign_mat(seat_back, mats['cockpit'])

    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, 2.34, 2.48))
    headrest = bpy.context.active_object
    headrest.name = "Rafale_Ejection_Seat_Headbox"
    headrest.scale = (0.16, 0.14, 0.16)
    headrest.rotation_euler = (math.radians(-20), 0, 0)
    coll.objects.link(headrest)
    bpy.context.scene.collection.objects.unlink(headrest)
    assign_mat(headrest, mats['sensor'])

    # 3. Holographic HUD Combiner Glass
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, 3.68, 2.26))
    hud = bpy.context.active_object
    hud.name = "Rafale_HUD_Combiner"
    hud.scale = (0.13, 0.008, 0.12)
    hud.rotation_euler = (math.radians(42), 0, 0)
    coll.objects.link(hud)
    bpy.context.scene.collection.objects.unlink(hud)
    assign_mat(hud, mats['hud'])

    # 4. Gold-Tinted Teardrop Bubble Canopy Glass
    canopy_specs = [
        (1.32, 2.08, 2.48, 0.36),
        (1.75, 2.07, 2.58, 0.41),
        (2.35, 2.06, 2.68, 0.44),
        (2.95, 2.05, 2.65, 0.42),
        (3.55, 2.03, 2.50, 0.37),
        (4.05, 2.00, 2.28, 0.29),
        (4.42, 1.97, 2.08, 0.19),
        (4.58, 1.96, 1.99, 0.08),
    ]
    canopy_rings = []
    n_c = 24
    for y, z_sill, z_crown, hw in canopy_specs:
        ring = []
        for i in range(n_c):
            theta = 2.0 * math.pi * i / n_c
            s = math.sin(theta)
            c = -math.cos(theta)
            if c < 0:
                x = s * hw * (1.0 + 0.15 * c)
                z = z_sill + 0.04 * c
            else:
                x = s * hw * ((1.0 - (c ** 1.65)) ** 0.48)
                z = z_sill + (z_crown - z_sill) * (c ** 0.78)
            ring.append((x, y, z))
        canopy_rings.append(ring)

    canopy_obj = loft_closed_profiles("Rafale_Canopy_Glass", canopy_rings, cap_start=True, cap_end=True,
                                      collection=coll, smooth=True, subsurf_levels=2)
    assign_mat(canopy_obj, mats['canopy'])

    # 5. Canopy Sill Frame & Internal Reinforcing Bow Frame
    frame_specs = []
    for y, z_sill, z_crown, hw in canopy_specs:
        ring = []
        for i in range(16):
            theta = 2.0 * math.pi * i / 16
            s = math.sin(theta)
            c = -math.cos(theta)
            x = s * (hw + 0.014) * (1.0 - 0.3 * max(0, c))
            z = z_sill - 0.02 + 0.08 * c
            ring.append((x, y, z))
        frame_specs.append(ring)
    sill_frame = loft_closed_profiles("Rafale_Canopy_Sill_Frame", frame_specs, cap_start=True, cap_end=True,
                                      collection=coll, smooth=True, subsurf_levels=1)
    assign_mat(sill_frame, mats['airframe'])

    # Windshield forward arch frame at Y=3.60m
    arch_rings = []
    for dy in (-0.032, 0.032):
        y = 3.60 + dy
        z_sill = 2.02
        z_crown = 2.49
        hw = 0.368
        ring = []
        for i in range(20):
            theta = 2.0 * math.pi * i / 20
            s = math.sin(theta)
            c = -math.cos(theta)
            if c < 0:
                x = s * hw
                z = z_sill
            else:
                x = s * (hw + 0.008) * ((1.0 - (c ** 1.65)) ** 0.48)
                z = z_sill + (z_crown - z_sill + 0.008) * (c ** 0.78)
            ring.append((x, y, z))
        arch_rings.append(ring)
    arch_obj = loft_closed_profiles("Rafale_Canopy_Arch", arch_rings, cap_start=True, cap_end=True,
                                    collection=coll, smooth=True, subsurf_levels=1)
    assign_mat(arch_obj, mats['airframe'])

    # 6. FSO (Front Sector Optronics) spherical turret + streamlined base fairing right in front of windshield
    bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=16, radius=0.068, location=(0.11, 4.66, 2.00))
    fso_ball = bpy.context.active_object
    fso_ball.name = "Rafale_FSO_Optronics"
    coll.objects.link(fso_ball)
    bpy.context.scene.collection.objects.unlink(fso_ball)
    assign_mat(fso_ball, mats['sensor'])

    # 7. Fixed In-Flight Refueling (IFR) Probe on Starboard (Right, +X) side of forward cockpit/nose
    ifr_stations = [
        (0.38, 3.25, 1.84, 0.042),
        (0.43, 3.65, 1.89, 0.038),
        (0.45, 4.15, 1.95, 0.032),
        (0.44, 4.70, 1.98, 0.028),
        (0.43, 5.05, 1.99, 0.022),
        (0.43, 5.18, 1.99, 0.028),
        (0.43, 5.28, 1.99, 0.014),
    ]
    ifr_rings = []
    for xc, yc, zc, rad in ifr_stations:
        ring = []
        for i in range(12):
            ang = 2.0 * math.pi * i / 12
            ring.append((xc + rad * math.cos(ang), yc, zc + rad * math.sin(ang)))
        ifr_rings.append(ring)
    ifr_obj = loft_closed_profiles("Rafale_Refueling_Probe", ifr_rings, cap_start=True, cap_end=True,
                                   collection=coll, smooth=True, subsurf_levels=1)
    assign_mat(ifr_obj, mats['airframe'])


def build_air_intakes(coll, mats):
    """
    Builds the Rafale's signature semi-ventral kidney-shaped fixed air intakes with
    boundary-layer splitter gap, swept outer lips, and deep internal S-ducts leading to the engines.
    """
    for side in (-1.0, 1.0):
        side_name = "R" if side > 0 else "L"

        duct_and_cowl_rings = []
        n_ring = 22

        def make_kidney_ring(y, x_in, x_out, z_bot, z_top, y_rake=0.0):
            ring = []
            xc = 0.5 * (x_in + x_out)
            rx = 0.5 * (x_out - x_in)
            zc = 0.5 * (z_bot + z_top)
            rz = 0.5 * (z_top - z_bot)
            for i in range(n_ring):
                ang = 2.0 * math.pi * i / n_ring
                ca = math.cos(ang)
                sa = math.sin(ang)
                x_local = xc + rx * math.copysign(abs(ca) ** 0.82, ca)
                z_local = zc + rz * math.copysign(abs(sa) ** 0.85, sa) - 0.04 * (ca - 0.2)
                dy = y_rake * (0.45 * sa - 0.35 * ca)
                ring.append((side * x_local, y + dy, z_local))
            if side < 0:
                ring.reverse()
            return ring

        # 1. Deep internal S-duct (dark engine compressor entrance at Y=-0.6m forward to lip at Y=2.48m)
        inner_specs = [
            (-0.60, 0.34, 0.72, 1.12, 1.52, 0.0),
            ( 0.50, 0.33, 0.78, 1.04, 1.58, 0.0),
            ( 1.50, 0.32, 0.84, 1.00, 1.62, 0.08),
            ( 2.25, 0.32, 0.85, 0.99, 1.64, 0.14),
            ( 2.48, 0.32, 0.82, 0.98, 1.65, 0.18),
        ]
        for sp in inner_specs:
            duct_and_cowl_rings.append(make_kidney_ring(*sp))

        # 2. Lip apex at Y=2.55m
        duct_and_cowl_rings.append(make_kidney_ring(2.55, 0.30, 0.85, 0.96, 1.67, 0.18))

        # 3. Outer nacelle cowl marching aft from Y=2.46m to Y=-6.00m
        outer_specs = [
            ( 2.46, 0.28, 0.89, 0.94, 1.70, 0.18),
            ( 2.10, 0.26, 0.96, 0.91, 1.73, 0.12),
            ( 1.30, 0.23, 1.05, 0.88, 1.76, 0.04),
            ( 0.20, 0.20, 1.12, 0.87, 1.78, 0.0),
            (-1.20, 0.18, 1.14, 0.88, 1.77, 0.0),
            (-2.80, 0.18, 1.10, 0.91, 1.74, 0.0),
            (-4.40, 0.20, 1.02, 0.96, 1.68, 0.0),
            (-5.85, 0.22, 0.88, 1.06, 1.62, 0.0),
        ]
        for sp in outer_specs:
            duct_and_cowl_rings.append(make_kidney_ring(*sp))

        intake_obj = loft_closed_profiles(f"Rafale_Air_Intake_{side_name}", duct_and_cowl_rings,
                                          cap_start=True, cap_end=True, collection=coll, smooth=True, subsurf_levels=2)
        assign_mat(intake_obj, mats['airframe'])

        # Dark compressor face disc deep inside the intake duct
        bpy.ops.mesh.primitive_cylinder_add(vertices=20, radius=0.24, depth=0.06,
                                            location=(side * 0.52, -0.45, 1.32),
                                            rotation=(math.radians(90), 0, 0))
        comp_disc = bpy.context.active_object
        comp_disc.name = f"Rafale_Intake_Compressor_{side_name}"
        coll.objects.link(comp_disc)
        bpy.context.scene.collection.objects.unlink(comp_disc)
        assign_mat(comp_disc, mats['exhaust_inner'])

        # Boundary-layer splitter plate / diverter strut between fuselage and intake lip
        splitter_verts = [
            (side * 0.24, 2.75, 1.12), (side * 0.31, 2.55, 1.02),
            (side * 0.31, 2.40, 1.64), (side * 0.24, 2.70, 1.66),
            (side * 0.20, 2.00, 1.02), (side * 0.31, 2.00, 1.02),
            (side * 0.31, 2.00, 1.64), (side * 0.20, 2.00, 1.64),
        ]
        splitter_faces = [
            (0, 1, 2, 3), (4, 7, 6, 5), (0, 4, 5, 1), (1, 5, 6, 2), (2, 6, 7, 3), (3, 7, 4, 0)
        ]
        splitter = create_mesh_obj(f"Rafale_Intake_Splitter_{side_name}", splitter_verts, splitter_faces,
                                   collection=coll, smooth=False, subsurf_levels=0)
        assign_mat(splitter, mats['sensor'])


def build_wings_and_canards(coll, mats):
    """
    Builds the main compound delta wings (span 10.90m, X=±5.45m), wingtip launcher rails,
    underwing actuator fairings, and high-mounted close-coupled canards.
    Uses cap_start=False on root stations inside the fuselage to guarantee 0% root pleating!
    """
    for side in (-1.0, 1.0):
        side_name = "R" if side > 0 else "L"

        # 1. Main Delta Wing with LERX
        wing_stations = [
            {'le': (side * 0.55,  1.05, 1.64), 'chord': 7.05, 't_ratio': 0.054, 'camber': 0.012, 'twist_deg':  0.5},
            {'le': (side * 1.05,  0.30, 1.62), 'chord': 6.35, 't_ratio': 0.050, 'camber': 0.014, 'twist_deg':  0.2},
            {'le': (side * 1.45, -0.55, 1.60), 'chord': 5.55, 't_ratio': 0.046, 'camber': 0.015, 'twist_deg':  0.0},
            {'le': (side * 2.50, -1.75, 1.56), 'chord': 4.42, 't_ratio': 0.043, 'camber': 0.014, 'twist_deg': -0.5},
            {'le': (side * 3.80, -3.22, 1.51), 'chord': 3.02, 't_ratio': 0.039, 'camber': 0.012, 'twist_deg': -1.2},
            {'le': (side * 4.95, -4.52, 1.47), 'chord': 1.78, 't_ratio': 0.036, 'camber': 0.008, 'twist_deg': -1.8},
            {'le': (side * 5.32, -4.95, 1.45), 'chord': 1.40, 't_ratio': 0.034, 'camber': 0.005, 'twist_deg': -2.0},
        ]
        if side < 0:
            wing_stations = list(reversed(wing_stations))
            wing_obj = build_airfoil_surface(f"Rafale_Delta_Wing_{side_name}", wing_stations,
                                             collection=coll, smooth=True, subsurf_levels=1,
                                             cap_start=True, cap_end=False)
        else:
            wing_obj = build_airfoil_surface(f"Rafale_Delta_Wing_{side_name}", wing_stations,
                                             collection=coll, smooth=True, subsurf_levels=1,
                                             cap_start=False, cap_end=True)
        assign_mat(wing_obj, mats['airframe'])

        # 2. Wingtip MICA Launch Rail & SPECTRA Wingtip Sensor Pods (X = ±5.38m)
        rail_stations = [
            (side * 5.38, -6.52, 1.45, 0.022, 0.040),
            (side * 5.38, -6.20, 1.45, 0.038, 0.068),
            (side * 5.38, -5.00, 1.45, 0.042, 0.072),
            (side * 5.38, -4.60, 1.45, 0.035, 0.058),
            (side * 5.38, -4.42, 1.45, 0.012, 0.022),
        ]
        rail_rings = []
        for xr, yr, zr, rx, rz in rail_stations:
            ring = []
            for i in range(12):
                ang = 2.0 * math.pi * i / 12
                ring.append((xr + rx * math.cos(ang), yr, zr + rz * math.sin(ang)))
            rail_rings.append(ring)
        rail_obj = loft_closed_profiles(f"Rafale_Wingtip_Rail_{side_name}", rail_rings,
                                        cap_start=True, cap_end=True, collection=coll, smooth=True, subsurf_levels=1)
        assign_mat(rail_obj, mats['airframe'])

        # 3. Underwing Elevon Hydraulic Actuator Fairings (low-profile streamlined blisters integrated into lower wing skin)
        for idx, x_f in enumerate((1.85, 3.05, 4.15), 1):
            y_te = -6.08 - (x_f - 1.5) * 0.06
            z_w = 1.56 - (x_f - 1.5) * 0.025
            f_rings = []
            for dy, r_x, r_z, dz in [(-0.18, 0.010, 0.012, 0.0), (0.05, 0.028, 0.036, -0.018),
                                     (0.42, 0.030, 0.040, -0.022), (0.85, 0.010, 0.012, 0.0)]:
                ring = []
                for i in range(10):
                    ang = 2.0 * math.pi * i / 10
                    ring.append((side * x_f + r_x * math.cos(ang), y_te + dy, z_w + dz + r_z * math.sin(ang)))
                f_rings.append(ring)
            f_obj = loft_closed_profiles(f"Rafale_Actuator_Fairing_{side_name}_{idx}", f_rings,
                                         cap_start=True, cap_end=True, collection=coll, smooth=True, subsurf_levels=1)
            assign_mat(f_obj, mats['airframe'])

        # 4. Close-Coupled Forward All-Moving Canards
        canard_stations = [
            {'le': (side * 0.68, 2.38, 2.02), 'chord': 1.48, 't_ratio': 0.044, 'camber': 0.008, 'twist_deg': -2.5},
            {'le': (side * 1.40, 1.72, 2.11), 'chord': 1.12, 't_ratio': 0.041, 'camber': 0.006, 'twist_deg': -2.5},
            {'le': (side * 2.15, 1.02, 2.21), 'chord': 0.72, 't_ratio': 0.038, 'camber': 0.004, 'twist_deg': -2.5},
            {'le': (side * 2.56, 0.62, 2.27), 'chord': 0.42, 't_ratio': 0.034, 'camber': 0.002, 'twist_deg': -2.5},
        ]
        if side < 0:
            canard_stations = list(reversed(canard_stations))
            canard_obj = build_airfoil_surface(f"Rafale_Canard_{side_name}", canard_stations,
                                               collection=coll, smooth=True, subsurf_levels=1,
                                               cap_start=True, cap_end=False)
        else:
            canard_obj = build_airfoil_surface(f"Rafale_Canard_{side_name}", canard_stations,
                                               collection=coll, smooth=True, subsurf_levels=1,
                                               cap_start=False, cap_end=True)
        assign_mat(canard_obj, mats['airframe'])

        # Canard pivot spindle
        bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.075, depth=0.32,
                                            location=(side * 0.66, 1.55, 2.02),
                                            rotation=(0, math.radians(82 * side), 0))
        spindle = bpy.context.active_object
        spindle.name = f"Rafale_Canard_Spindle_{side_name}"
        coll.objects.link(spindle)
        bpy.context.scene.collection.objects.unlink(spindle)
        assign_mat(spindle, mats['exhaust'])


def build_vertical_tail(coll, mats):
    """
    Builds the swept vertical stabilizer (tailfin) with base heat-exchanger ram air scoop,
    smooth root fillet fairing, and top SPECTRA electronic warfare pod.
    Notice: cap_start=False on the fin root (embedded inside the dorsal spine at Z=1.95m)
    completely eliminates the Catmull-Clark root wrinkling seen in the initial preview!
    """
    # 1. Main Vertical Fin Airfoil (from Z=1.95m inside spine to Z=5.22m under top pod)
    tail_stations = [
        {'le': (0.0, -3.35, 1.95), 'chord': 3.55, 't_ratio': 0.056, 'camber': 0.0, 'twist_deg': 0.0, 'vertical': True},
        {'le': (0.0, -3.65, 2.25), 'chord': 3.25, 't_ratio': 0.052, 'camber': 0.0, 'twist_deg': 0.0, 'vertical': True},
        {'le': (0.0, -4.35, 2.95), 'chord': 2.68, 't_ratio': 0.048, 'camber': 0.0, 'twist_deg': 0.0, 'vertical': True},
        {'le': (0.0, -5.20, 3.85), 'chord': 1.95, 't_ratio': 0.044, 'camber': 0.0, 'twist_deg': 0.0, 'vertical': True},
        {'le': (0.0, -5.95, 4.65), 'chord': 1.32, 't_ratio': 0.040, 'camber': 0.0, 'twist_deg': 0.0, 'vertical': True},
        {'le': (0.0, -6.48, 5.22), 'chord': 0.90, 't_ratio': 0.036, 'camber': 0.0, 'twist_deg': 0.0, 'vertical': True},
    ]
    tail_obj = build_airfoil_surface("Rafale_Vertical_Tail", tail_stations,
                                     collection=coll, smooth=True, subsurf_levels=1,
                                     cap_start=False, cap_end=True)
    assign_mat(tail_obj, mats['airframe'])

    # 2. Fin-Root Heat Exchanger Ram Air Scoop (characteristic scoop at the base of the fin leading edge)
    scoop_rings = []
    for y, rx, rz, zc in [(-4.40, 0.11, 0.10, 2.34), (-3.65, 0.13, 0.14, 2.38),
                          (-3.32, 0.10, 0.12, 2.38), (-3.38, 0.07, 0.09, 2.38)]:
        ring = []
        for i in range(14):
            ang = 2.0 * math.pi * i / 14
            ring.append((rx * math.cos(ang), y, zc + rz * math.sin(ang)))
        scoop_rings.append(ring)
    scoop_obj = loft_closed_profiles("Rafale_Tail_Root_Scoop", scoop_rings,
                                     cap_start=True, cap_end=True, collection=coll, smooth=True, subsurf_levels=1)
    assign_mat(scoop_obj, mats['airframe'])

    # 3. Top Fin Tip SPECTRA EW Pod (elongated horizontal bullet/cigar pod at Z=5.26m, topping at Z=5.34m)
    pod_stations = [
        (-7.62, 5.26, 0.015, 0.015),
        (-7.45, 5.26, 0.065, 0.075),
        (-6.90, 5.26, 0.075, 0.085),
        (-6.45, 5.26, 0.070, 0.080),
        (-6.28, 5.26, 0.045, 0.055),
        (-6.18, 5.26, 0.012, 0.015),
    ]
    pod_rings = []
    for yp, zp, rx, rz in pod_stations:
        ring = []
        for i in range(16):
            ang = 2.0 * math.pi * i / 16
            ring.append((rx * math.cos(ang), yp, zp + rz * math.sin(ang)))
        pod_rings.append(ring)
    pod_obj = loft_closed_profiles("Rafale_Tail_Top_SPECTRA_Pod", pod_rings,
                                   cap_start=True, cap_end=True, collection=coll, smooth=True, subsurf_levels=1)
    assign_mat(pod_obj, mats['sensor'])

    # 4. Rear Parachute / ECM Fairing under the tail root (Y=-7.45m, Z=2.10m)
    ddm_stations = [
        (-7.58, 2.10, 0.02, 0.02),
        (-7.35, 2.10, 0.09, 0.08),
        (-6.75, 2.10, 0.11, 0.10),
        (-6.20, 2.10, 0.06, 0.06),
    ]
    ddm_rings = []
    for yp, zp, rx, rz in ddm_stations:
        ring = []
        for i in range(14):
            ang = 2.0 * math.pi * i / 14
            ring.append((rx * math.cos(ang), yp, zp + rz * math.sin(ang)))
        ddm_rings.append(ring)
    ddm_obj = loft_closed_profiles("Rafale_Tail_Base_Fairing", ddm_rings,
                                   cap_start=True, cap_end=True, collection=coll, smooth=True, subsurf_levels=1)
    assign_mat(ddm_obj, mats['airframe'])


def build_recessed_exhausts(coll, mats):
    """
    Builds the twin Snecma M88-2 recessed exhaust nozzles at X = ±0.415m, Y = -7.25m to -7.62m, Z = 1.54m.
    Features an authentic annular outer shroud and 18 curved, ribbed convergent-divergent turkey-feather
    petals per engine with an external metallic compression band and deep internal afterburner assembly.
    """
    n_petals = 18
    for side in (-1.0, 1.0):
        side_name = "R" if side > 0 else "L"
        xc = side * 0.415
        zc = 1.54

        # 1. Outer Fuselage Exhaust Shroud Ring (OPEN annular collar — cap_start=False, cap_end=False so it never blocks the nozzle!)
        shroud_rings = []
        for y, r in [(-6.50, 0.345), (-7.28, 0.345), (-7.30, 0.385), (-7.00, 0.418), (-6.40, 0.435), (-6.50, 0.345)]:
            ring = []
            for i in range(32):
                ang = 2.0 * math.pi * i / 32
                ring.append((xc + r * math.cos(ang), y, zc + r * math.sin(ang)))
            shroud_rings.append(ring)
        shroud_obj = loft_closed_profiles(f"Rafale_Exhaust_Shroud_{side_name}", shroud_rings,
                                          cap_start=False, cap_end=False, collection=coll, smooth=True, subsurf_levels=1)
        assign_mat(shroud_obj, mats['airframe'])

        # 2. Recessed Convergent-Divergent Nozzle Petals (18 individual 3D curved & ribbed petals per nozzle)
        # Each petal is subdivided into 3 angular sub-segments with a raised external structural spine rib
        petal_verts = []
        petal_faces = []
        for p in range(n_petals):
            ang_c = 2.0 * math.pi * p / n_petals
            d_ang = (2.0 * math.pi / n_petals) * 0.53
            ang_L = ang_c - d_ang
            ang_R = ang_c + d_ang

            stations_p = [
                # (y, r_base, rib_height)
                (-7.15, 0.342, 0.010),
                (-7.38, 0.318, 0.014),
                (-7.52, 0.298, 0.012),
                (-7.62, 0.284, 0.008),
            ]
            thick = 0.014
            base_idx = len(petal_verts)

            # 6 vertices per longitudinal station:
            # Outer Left (0), Outer Center Rib (1), Outer Right (2), Inner Right (3), Inner Center (4), Inner Left (5)
            for yp, r_base, rib_h in stations_p:
                r_L = r_base
                r_C = r_base + rib_h
                r_R = r_base + 0.004  # shingle overlap
                petal_verts.append((xc + r_L * math.cos(ang_L), yp, zc + r_L * math.sin(ang_L)))
                petal_verts.append((xc + r_C * math.cos(ang_c), yp, zc + r_C * math.sin(ang_c)))
                petal_verts.append((xc + r_R * math.cos(ang_R), yp, zc + r_R * math.sin(ang_R)))
                petal_verts.append((xc + (r_R - thick) * math.cos(ang_R), yp, zc + (r_R - thick) * math.sin(ang_R)))
                petal_verts.append((xc + (r_base - thick) * math.cos(ang_c), yp, zc + (r_base - thick) * math.sin(ang_c)))
                petal_verts.append((xc + (r_L - thick) * math.cos(ang_L), yp, zc + (r_L - thick) * math.sin(ang_L)))

            for s_idx in range(len(stations_p) - 1):
                b1 = base_idx + s_idx * 6
                b2 = base_idx + (s_idx + 1) * 6
                for k in range(6):
                    nk = (k + 1) % 6
                    petal_faces.append((b1 + k, b1 + nk, b2 + nk, b2 + k))

            # Aft tip cap at station -7.62m
            b_end = base_idx + (len(stations_p) - 1) * 6
            petal_faces.append((b_end + 0, b_end + 1, b_end + 4, b_end + 5))
            petal_faces.append((b_end + 1, b_end + 2, b_end + 3, b_end + 4))

        petals_obj = create_mesh_obj(f"Rafale_Exhaust_Petals_{side_name}", petal_verts, petal_faces,
                                     collection=coll, smooth=True, subsurf_levels=0)
        assign_mat(petals_obj, mats['exhaust'])

        # 3. External Actuator Compression Ring around the nozzle throat (Y = -7.36m)
        bpy.ops.mesh.primitive_torus_add(major_radius=0.332, minor_radius=0.012,
                                         major_segments=36, minor_segments=10,
                                         location=(xc, -7.36, zc), rotation=(math.radians(90), 0, 0))
        comp_ring = bpy.context.active_object
        comp_ring.name = f"Rafale_Exhaust_Ring_{side_name}"
        coll.objects.link(comp_ring)
        bpy.context.scene.collection.objects.unlink(comp_ring)
        assign_mat(comp_ring, mats['exhaust'])

        # 4. Deep Recessed Afterburner Liner Tube (OPEN front at Y=-7.58m, capped only at deep forward turbine wall Y=-5.90m!)
        liner_rings = []
        for y, r in [(-7.58, 0.268), (-7.38, 0.296), (-7.10, 0.318), (-5.90, 0.318)]:
            ring = []
            for i in range(28):
                ang = 2.0 * math.pi * i / 28
                ring.append((xc + r * math.cos(ang), y, zc + r * math.sin(ang)))
            liner_rings.append(ring)
        liner_obj = loft_closed_profiles(f"Rafale_Exhaust_Interior_{side_name}", liner_rings,
                                         cap_start=False, cap_end=True, collection=coll, smooth=True, subsurf_levels=0)
        assign_mat(liner_obj, mats['exhaust_inner'])

        # 5. Turbine Cone & Flameholder Rings inside the open recessed exhaust cavity
        bpy.ops.mesh.primitive_cone_add(vertices=24, radius1=0.14, radius2=0.01, depth=0.48,
                                        location=(xc, -6.20, zc), rotation=(math.radians(-90), 0, 0))
        cone = bpy.context.active_object
        cone.name = f"Rafale_Turbine_Cone_{side_name}"
        coll.objects.link(cone)
        bpy.context.scene.collection.objects.unlink(cone)
        assign_mat(cone, mats['exhaust'])

        for r_fh, y_fh in [(0.23, -6.45), (0.16, -6.40), (0.10, -6.35)]:
            bpy.ops.mesh.primitive_torus_add(major_radius=r_fh, minor_radius=0.012,
                                             major_segments=28, minor_segments=8,
                                             location=(xc, y_fh, zc), rotation=(math.radians(90), 0, 0))
            fh = bpy.context.active_object
            fh.name = f"Rafale_Flameholder_{side_name}_{int(r_fh*100)}"
            coll.objects.link(fh)
            bpy.context.scene.collection.objects.unlink(fh)
            assign_mat(fh, mats['exhaust'])


def create_wheel_and_tire(name, loc, tire_radius, tire_width, coll, mats):
    """
    Creates a realistic aircraft tire with deep recessed wheel rim dish, brake caliper assembly,
    lug bolts, and dark vulcanized rubber tire.
    """
    cx, cy, cz = loc
    hw = tire_width * 0.5
    r_rim = tire_radius * 0.52

    # 1. Tire Toroid (closed loop cross-section around the rim so it has real sidewall thickness and bead)
    tire_section = [
        # (dx, r) around the tire cross-section
        (-hw * 0.72, r_rim * 0.96),
        (-hw * 0.96, tire_radius * 0.72),
        (-hw * 1.00, tire_radius * 0.86),
        (-hw * 0.84, tire_radius * 0.97),
        (-hw * 0.45, tire_radius * 1.00),
        ( 0.0,       tire_radius * 1.005),
        ( hw * 0.45, tire_radius * 1.00),
        ( hw * 0.84, tire_radius * 0.97),
        ( hw * 1.00, tire_radius * 0.86),
        ( hw * 0.96, tire_radius * 0.72),
        ( hw * 0.72, r_rim * 0.96),
        ( 0.0,       r_rim * 0.92),
    ]

    tire_rings = []
    n_seg = 40
    for dx, rad in tire_section:
        ring = []
        for i in range(n_seg):
            ang = 2.0 * math.pi * i / n_seg
            y = cy + rad * math.cos(ang)
            z = cz + rad * math.sin(ang)
            # Subtle static weight deflection where the tire meets the concrete apron at Z = 0.0
            if z < 0.010:
                z = max(0.0, z * 0.30)
            ring.append((cx + dx, y, z))
        tire_rings.append(ring)
    # Close the loop by repeating the first section
    tire_rings.append(tire_rings[0])

    tire_obj = loft_closed_profiles(f"{name}_Tire", tire_rings, cap_start=False, cap_end=False,
                                    collection=coll, smooth=True, subsurf_levels=1)
    assign_mat(tire_obj, mats['tire'])

    # 2. Sculpted Recessed Wheel Rim Hub (revolved profile with outer flange, deep dish recess, and raised center hub cap)
    rim_section = [
        (-hw * 0.45, 0.005),
        (-hw * 0.45, r_rim * 0.32),
        (-hw * 0.28, r_rim * 0.42),
        (-hw * 0.32, r_rim * 0.78),
        (-hw * 0.74, r_rim * 0.94),
        (-hw * 0.76, r_rim * 1.00),
        (-hw * 0.65, r_rim * 1.00),
        (-hw * 0.55, r_rim * 0.86),
        ( 0.0,       r_rim * 0.82),
        ( hw * 0.55, r_rim * 0.86),
        ( hw * 0.65, r_rim * 1.00),
        ( hw * 0.76, r_rim * 1.00),
        ( hw * 0.74, r_rim * 0.94),
        ( hw * 0.32, r_rim * 0.78),
        ( hw * 0.28, r_rim * 0.42),
        ( hw * 0.45, r_rim * 0.32),
        ( hw * 0.45, 0.005),
    ]
    rim_rings = []
    for dx, rad in rim_section:
        ring = []
        for i in range(32):
            ang = 2.0 * math.pi * i / 32
            ring.append((cx + dx, cy + rad * math.cos(ang), cz + rad * math.sin(ang)))
        rim_rings.append(ring)

    rim_obj = loft_closed_profiles(f"{name}_Rim", rim_rings, cap_start=True, cap_end=True,
                                   collection=coll, smooth=True, subsurf_levels=1)
    assign_mat(rim_obj, mats['gear_strut'])

    # 3. Circle of 10 Lug Bolts / Brake Tie Bolts inside the wheel dish (both sides)
    n_bolts = 10
    r_bolt_circle = r_rim * 0.60
    for b in range(n_bolts):
        ang = 2.0 * math.pi * b / n_bolts
        by = cy + r_bolt_circle * math.cos(ang)
        bz = cz + r_bolt_circle * math.sin(ang)
        bpy.ops.mesh.primitive_cylinder_add(vertices=8, radius=tire_radius * 0.032, depth=tire_width * 0.72,
                                            location=(cx, by, bz), rotation=(0, math.radians(90), 0))
        bolt = bpy.context.active_object
        bolt.name = f"{name}_Bolt_{b}"
        coll.objects.link(bolt)
        bpy.context.scene.collection.objects.unlink(bolt)
        assign_mat(bolt, mats['chrome'])


def add_cylinder_between(name, p1, p2, radius, coll, mat, vertices=16):
    v1 = Vector(p1)
    v2 = Vector(p2)
    diff = v2 - v1
    length = diff.length
    if length < 1e-5:
        return None
    mid = 0.5 * (v1 + v2)
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=length, location=mid)
    obj = bpy.context.active_object
    obj.name = name
    up = Vector((0, 0, 1))
    rot_quat = up.rotation_difference(diff.normalized())
    obj.rotation_mode = 'QUATERNION'
    obj.rotation_quaternion = rot_quat
    obj.rotation_mode = 'XYZ'
    coll.objects.link(obj)
    bpy.context.scene.collection.objects.unlink(obj)
    assign_mat(obj, mat)
    return obj


def build_landing_gear(coll, mats):
    """
    Builds detailed Messier-Dowty tricycle landing gear resting squarely on Z = 0.0:
    1. Nose Landing Gear at Y = +3.90m: Twin steerable wheels (r=0.22m), recessed wheel hubs,
       shock absorber strut, oleo chrome cylinder, torque links, forward drag brace, twin landing lights,
       and nose gear bay doors.
    2. Main Landing Gear at Y = -1.80m, X = ±1.20m (Track 2.40m, Wheelbase 5.70m):
       Single large main wheels (r=0.39m), multi-bolt recessed wheel hubs, carbon brake pack,
       heavy trailing-link shock struts, hydraulic side braces, and contoured main gear bay doors.
    """
    # --- NOSE LANDING GEAR (Y = +3.90m) ---
    ny = 3.90
    nr = 0.22
    create_wheel_and_tire("Rafale_Nose_Wheel_L", (-0.118, ny, nr), nr, 0.11, coll, mats)
    create_wheel_and_tire("Rafale_Nose_Wheel_R", ( 0.118, ny, nr), nr, 0.11, coll, mats)

    # Axle
    add_cylinder_between("Rafale_Nose_Axle", (-0.15, ny, nr), (0.15, ny, nr), 0.032, coll, mats['chrome'])

    # Lower chrome oleo piston
    add_cylinder_between("Rafale_Nose_Oleo", (0.0, ny, nr), (0.0, ny + 0.04, 0.56), 0.042, coll, mats['chrome'])

    # Upper white main strut housing
    add_cylinder_between("Rafale_Nose_Strut_Upper", (0.0, ny + 0.04, 0.52), (0.0, ny + 0.14, 1.18), 0.062, coll, mats['gear_strut'])

    # Steering actuator collar
    bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.082, depth=0.14,
                                        location=(0.0, ny + 0.09, 0.82), rotation=(math.radians(-8), 0, 0))
    steer = bpy.context.active_object
    steer.name = "Rafale_Nose_Steering_Collar"
    coll.objects.link(steer)
    bpy.context.scene.collection.objects.unlink(steer)
    assign_mat(steer, mats['gear_strut'])

    # Forward diagonal drag brace / retraction actuator
    add_cylinder_between("Rafale_Nose_Drag_Brace", (0.0, ny + 0.08, 0.68), (0.0, ny + 0.62, 1.16), 0.032, coll, mats['gear_strut'])
    add_cylinder_between("Rafale_Nose_Actuator_Piston", (0.0, ny + 0.10, 0.72), (0.0, ny + 0.45, 0.98), 0.022, coll, mats['chrome'])

    # Scissor torque links (aft of nose strut)
    add_cylinder_between("Rafale_Nose_Torque_Lower", (0.0, ny + 0.01, 0.26), (0.0, ny - 0.16, 0.40), 0.020, coll, mats['gear_strut'])
    add_cylinder_between("Rafale_Nose_Torque_Upper", (0.0, ny - 0.16, 0.40), (0.0, ny + 0.04, 0.55), 0.020, coll, mats['gear_strut'])

    # Twin Taxi / Landing Lights on nose strut
    for lx in (-0.068, 0.068):
        bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.035, depth=0.05,
                                            location=(lx, ny + 0.12, 0.62), rotation=(math.radians(90), 0, 0))
        light_housing = bpy.context.active_object
        light_housing.name = f"Rafale_Nose_Gear_Light_{'R' if lx > 0 else 'L'}"
        coll.objects.link(light_housing)
        bpy.context.scene.collection.objects.unlink(light_housing)
        assign_mat(light_housing, mats['gear_strut'])

    # Nose Gear Bay Doors
    for side in (-1.0, 1.0):
        side_name = "R" if side > 0 else "L"
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(side * 0.25, ny + 0.18, 0.94))
        ndoor = bpy.context.active_object
        ndoor.name = f"Rafale_Nose_Gear_Door_{side_name}"
        ndoor.scale = (0.012, 0.44, 0.15)
        ndoor.rotation_euler = (0.0, math.radians(side * -14), 0.0)
        coll.objects.link(ndoor)
        bpy.context.scene.collection.objects.unlink(ndoor)
        assign_mat(ndoor, mats['airframe'])

    # --- MAIN LANDING GEAR (Y = -1.80m, X = ±1.20m) ---
    my = -1.80
    mr = 0.39
    for side in (-1.0, 1.0):
        side_name = "R" if side > 0 else "L"
        mx = side * 1.20

        # Main Wheel & Tire with detailed recessed hub and lug bolts
        create_wheel_and_tire(f"Rafale_Main_Wheel_{side_name}", (mx, my, mr), mr, 0.25, coll, mats)

        # Carbon Brake Caliper Pack on inboard side of main wheel hub
        bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=mr * 0.44, depth=0.14,
                                            location=(side * 1.09, my, mr), rotation=(0, math.radians(90), 0))
        brake_pack = bpy.context.active_object
        brake_pack.name = f"Rafale_Main_Brake_Pack_{side_name}"
        coll.objects.link(brake_pack)
        bpy.context.scene.collection.objects.unlink(brake_pack)
        assign_mat(brake_pack, mats['exhaust'])

        # Heavy Trailing-Link / Inclined Main Strut
        knuckle = (side * 1.02, my + 0.04, 0.42)
        wheel_axle_in = (side * 1.02, my, mr)
        wheel_axle_out = (side * 1.28, my, mr)
        top_pivot = (side * 0.68, my + 0.28, 1.18)

        # Axle & trailing arm knuckle
        add_cylinder_between(f"Rafale_Main_Axle_{side_name}", wheel_axle_in, wheel_axle_out, 0.052, coll, mats['chrome'])
        add_cylinder_between(f"Rafale_Main_Trailing_Arm_{side_name}", (side * 0.96, my + 0.24, 0.58), knuckle, 0.052, coll, mats['gear_strut'])

        # Oleo Shock Absorber Cylinder
        add_cylinder_between(f"Rafale_Main_Oleo_{side_name}", knuckle, (side * 0.88, my + 0.14, 0.74), 0.050, coll, mats['chrome'])

        # Main Heavy Upper Strut
        add_cylinder_between(f"Rafale_Main_Strut_{side_name}", (side * 0.88, my + 0.14, 0.68), top_pivot, 0.076, coll, mats['gear_strut'])

        # Side Brace & Retraction Actuator Struts
        add_cylinder_between(f"Rafale_Main_Side_Brace_{side_name}",
                             (side * 0.88, my + 0.14, 0.72), (side * 0.52, my + 0.68, 1.10), 0.036, coll, mats['gear_strut'])
        add_cylinder_between(f"Rafale_Main_Rear_Brace_{side_name}",
                             (side * 0.82, my + 0.18, 0.82), (side * 0.55, my - 0.35, 1.12), 0.032, coll, mats['gear_strut'])

        # Outer Main Gear Door
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(side * 1.06, my + 0.15, 0.90))
        mdoor_out = bpy.context.active_object
        mdoor_out.name = f"Rafale_Main_Gear_Door_Out_{side_name}"
        mdoor_out.scale = (0.015, 0.50, 0.22)
        mdoor_out.rotation_euler = (0.0, math.radians(side * 20), 0.0)
        coll.objects.link(mdoor_out)
        bpy.context.scene.collection.objects.unlink(mdoor_out)
        assign_mat(mdoor_out, mats['airframe'])

        # Inner Belly Gear Door
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(side * 0.42, my + 0.18, 0.82))
        mdoor_in = bpy.context.active_object
        mdoor_in.name = f"Rafale_Main_Gear_Door_In_{side_name}"
        mdoor_in.scale = (0.014, 0.58, 0.18)
        mdoor_in.rotation_euler = (0.0, math.radians(side * -18), 0.0)
        coll.objects.link(mdoor_in)
        bpy.context.scene.collection.objects.unlink(mdoor_in)
        assign_mat(mdoor_in, mats['airframe'])


def build_apron_environment(coll, mats):
    """
    Builds a large, simple, realistic concrete apron with painted yellow taxiway centerline
    and nose-wheel stop bar.
    """
    bpy.ops.mesh.primitive_plane_add(size=240.0, location=(0.0, 0.0, 0.0))
    apron = bpy.context.active_object
    apron.name = "Concrete_Apron"
    coll.objects.link(apron)
    bpy.context.scene.collection.objects.unlink(apron)
    assign_mat(apron, mats['apron'])

    bpy.ops.mesh.primitive_plane_add(size=1.0, location=(0.0, 2.0, 0.0015))
    taxi_line = bpy.context.active_object
    taxi_line.name = "Apron_Taxi_Line"
    taxi_line.scale = (0.18, 32.0, 1.0)
    coll.objects.link(taxi_line)
    bpy.context.scene.collection.objects.unlink(taxi_line)
    assign_mat(taxi_line, mats['marking'])

    bpy.ops.mesh.primitive_plane_add(size=1.0, location=(0.0, 3.90, 0.0018))
    stop_bar = bpy.context.active_object
    stop_bar.name = "Apron_Nose_Stop_Bar"
    stop_bar.scale = (1.40, 0.16, 1.0)
    coll.objects.link(stop_bar)
    bpy.context.scene.collection.objects.unlink(stop_bar)
    assign_mat(stop_bar, mats['marking'])


# ==============================================================================
# LIGHTING, WORLD & CAMERA SETUP
# ==============================================================================

def setup_world_and_lighting(scene):
    """
    Sets up dramatic warm late-afternoon ("golden hour") lighting with rich sunset horizon
    gradient, low-elevation warm amber key sun, and realistic crisp shadows & reflections.
    """
    world = bpy.data.worlds.new("LateAfternoon_World")
    scene.world = world
    tree = world.node_tree
    nodes = tree.nodes
    links = tree.links
    nodes.clear()

    out = nodes.new("ShaderNodeOutputWorld")
    bg = nodes.new("ShaderNodeBackground")
    bg.inputs["Strength"].default_value = 0.42  # Balanced so sky never blows out to white
    links.new(bg.outputs["Background"], out.inputs["Surface"])

    sky = nodes.new("ShaderNodeTexSky")
    sky_enums = [e.identifier for e in sky.bl_rna.properties['sky_type'].enum_items]
    if 'MULTIPLE_SCATTERING' in sky_enums:
        sky.sky_type = 'MULTIPLE_SCATTERING'
    elif 'SINGLE_SCATTERING' in sky_enums:
        sky.sky_type = 'SINGLE_SCATTERING'

    if hasattr(sky, "sun_disc"):
        sky.sun_disc = False
    if hasattr(sky, "sun_elevation"):
        sky.sun_elevation = math.radians(6.5)   # True golden-hour low sun elevation
    if hasattr(sky, "sun_rotation"):
        sky.sun_rotation = math.radians(135.0)
    if hasattr(sky, "air_density"):
        sky.air_density = 1.65
    if hasattr(sky, "aerosol_density"):
        sky.aerosol_density = 2.40
    if hasattr(sky, "ozone_density"):
        sky.ozone_density = 1.80

    links.new(sky.outputs["Color"], bg.inputs["Color"])

    # Primary Warm Late-Afternoon Sun Light (dramatic golden raking light)
    sun_data = bpy.data.lights.new(name="LateAfternoon_Sun", type='SUN')
    sun_data.energy = 6.8
    sun_data.color = (1.0, 0.62, 0.30)  # Rich golden-amber late afternoon sunlight
    if hasattr(sun_data, "angle"):
        sun_data.angle = math.radians(0.85)  # Crisp yet natural shadow penumbra

    sun_obj = bpy.data.objects.new("LateAfternoon_Sun", sun_data)
    scene.collection.objects.link(sun_obj)
    # Elevation ~10.5 degrees above horizon, raking across the front-left three-quarter view
    sun_obj.rotation_euler = (math.radians(79.5), math.radians(6.0), math.radians(-128.0))

    # Subtle Cool Sky / Warm Apron Bounce Fill
    fill_data = bpy.data.lights.new(name="Sky_Bounce_Fill", type='AREA')
    fill_data.energy = 110.0
    fill_data.color = (0.65, 0.76, 0.98)
    fill_data.size = 14.0
    fill_obj = bpy.data.objects.new("Sky_Bounce_Fill", fill_data)
    scene.collection.objects.link(fill_obj)
    fill_obj.location = (10.5, 5.0, 6.0)
    fill_obj.rotation_euler = (math.radians(58.0), 0.0, math.radians(118.0))


def create_aimed_camera(name, location, target, lens_mm=50.0, fstop=5.6, scene=None):
    cam_data = bpy.data.cameras.new(name)
    cam_data.lens = lens_mm
    cam_data.clip_start = 0.1
    cam_data.clip_end = 500.0
    if hasattr(cam_data, "dof"):
        cam_data.dof.use_dof = True
        cam_data.dof.focus_distance = (Vector(location) - Vector(target)).length
        cam_data.dof.aperture_fstop = fstop

    cam_obj = bpy.data.objects.new(name, cam_data)
    if scene:
        scene.collection.objects.link(cam_obj)

    cam_obj.location = Vector(location)
    direction = Vector(target) - Vector(location)
    rot_quat = direction.to_track_quat('-Z', 'Y')
    cam_obj.rotation_mode = 'QUATERNION'
    cam_obj.rotation_quaternion = rot_quat
    cam_obj.rotation_mode = 'XYZ'
    return cam_obj


def configure_cycles(scene, width, height, samples=128):
    scene.render.engine = 'CYCLES'
    try:
        prefs = bpy.context.preferences.addons['cycles'].preferences
        dev_types = [d[0] for d in prefs.get_device_types(bpy.context)]
        if 'OPTIX' in dev_types:
            prefs.compute_device_type = 'OPTIX'
        elif 'CUDA' in dev_types:
            prefs.compute_device_type = 'CUDA'
        prefs.get_devices()
        for d in prefs.devices:
            d.use = (d.type in ('OPTIX', 'CUDA'))
        scene.cycles.device = 'GPU'
    except Exception as e:
        print("Warning configuring GPU:", e)

    scene.cycles.samples = samples
    if hasattr(scene.cycles, "use_denoising"):
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
    except Exception:
        try:
            scene.view_settings.view_transform = 'Filmic'
            scene.view_settings.look = 'High Contrast'
        except Exception:
            pass
    scene.view_settings.exposure = -0.25


def main():
    mode, outdir = parse_args()
    scene = reset_scene()

    rafale_coll = bpy.data.collections.new("Dassault_Rafale_C")
    scene.collection.children.link(rafale_coll)
    env_coll = bpy.data.collections.new("Environment_Apron")
    scene.collection.children.link(env_coll)

    mats = create_materials()

    build_fuselage_and_radome(rafale_coll, mats)
    build_cockpit_and_canopy(rafale_coll, mats)
    build_air_intakes(rafale_coll, mats)
    build_wings_and_canards(rafale_coll, mats)
    build_vertical_tail(rafale_coll, mats)
    build_recessed_exhausts(rafale_coll, mats)
    build_landing_gear(rafale_coll, mats)
    build_apron_environment(env_coll, mats)

    setup_world_and_lighting(scene)

    # Create Cameras with full framing so the entire aircraft (nose probe to tailfin & wingtips) is framed cleanly:
    # 1. Hero Front Three-Quarter Camera
    cam_hero = create_aimed_camera(
        "Camera_Hero_Front3Q",
        location=(-11.2, 13.8, 1.75),
        target=(-0.15, -0.35, 2.05),
        lens_mm=42.0,
        fstop=5.6,
        scene=scene,
    )
    # 2. Side Profile Inspection Camera (backed out to X = -22.5m so full 15.3m length and 5.34m tail fit in frame)
    cam_side = create_aimed_camera(
        "Camera_Preview_Side",
        location=(-22.5, -0.1, 2.35),
        target=(0.0, -0.1, 2.35),
        lens_mm=45.0,
        fstop=8.0,
        scene=scene,
    )
    # 3. Rear Three-Quarter / Exhaust Inspection Camera
    cam_rear = create_aimed_camera(
        "Camera_Preview_Rear",
        location=(-9.6, -17.5, 2.35),
        target=(0.0, -2.5, 2.55),
        lens_mm=38.0,
        fstop=8.0,
        scene=scene,
    )

    scene.camera = cam_hero

    blend_path = os.path.join(outdir, "dassault_rafale.blend")

    if mode == "initial":
        configure_cycles(scene, 1280, 720, samples=96)
        shots = [
            (cam_hero, "preview_initial_hero.png"),
            (cam_side, "preview_initial_side.png"),
            (cam_rear, "preview_initial_rear.png"),
        ]
        for cam, fname in shots:
            scene.camera = cam
            scene.render.filepath = os.path.join(outdir, fname)
            bpy.ops.render.render(write_still=True)
            print("Rendered:", scene.render.filepath)
        scene.camera = cam_hero
        bpy.ops.wm.save_as_mainfile(filepath=blend_path)
    else:
        # Render revised side & rear previews first
        configure_cycles(scene, 1280, 720, samples=128)
        for cam, fname in [(cam_side, "preview_revised_side.png"), (cam_rear, "preview_revised_rear.png")]:
            scene.camera = cam
            scene.render.filepath = os.path.join(outdir, fname)
            bpy.ops.render.render(write_still=True)
            print("Rendered:", scene.render.filepath)

        # Render final 1920x1080 hero render with high sample count
        scene.camera = cam_hero
        configure_cycles(scene, 1920, 1080, samples=256)
        scene.render.filepath = os.path.join(outdir, "rafale_hero_final.png")
        bpy.ops.render.render(write_still=True)
        print("Rendered Final Hero:", scene.render.filepath)

        # Save editable .blend file with Hero camera and 1920x1080 settings active
        bpy.ops.wm.save_as_mainfile(filepath=blend_path)
        print("Saved blend file:", blend_path)


if __name__ == "__main__":
    main()
