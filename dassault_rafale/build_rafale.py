#!/usr/bin/env python3
"""
Dassault Rafale C - Photorealistic 3D Model & Scene Builder for Headless Blender
Rebuilt with unified fuselage/intake/spine bodywork, smooth curvature-continuous nose-to-fuselage
transition, separated 3D control surfaces (slats, inner/outer elevons, rudder), recessed wheel wells
with internal ribs and detailed Messier-Dowty landing gear, reference-based panel seam maps,
and weathered concrete apron with puddles and oil stains.
"""

import os
import sys
import math
import numpy as np
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
    verts = []
    faces = []
    mat_indices = []

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


def make_airfoil_section(chord, thickness_ratio, camber=0.012, u_min=0.0, u_max=1.0, n_pts=24):
    """
    Returns 2D airfoil coordinates [(u_dist, w_dist), ...] for a chordwise slice u in [u_min, u_max].
    """
    pts = []
    for i in range(n_pts, -1, -1):
        t = i / n_pts
        u = u_min + (u_max - u_min) * (0.5 * (1.0 - math.cos(math.pi * t)))
        yt = 5.0 * thickness_ratio * (
            0.2969 * math.sqrt(max(u, 1e-6))
            - 0.1260 * u
            - 0.3516 * (u ** 2)
            + 0.2843 * (u ** 3)
            - 0.1015 * (u ** 4)
        )
        yc = camber * 4.0 * u * (1.0 - u)
        pts.append((u * chord, (yc + yt) * chord))

    for i in range(1, n_pts + 1):
        t = i / n_pts
        u = u_min + (u_max - u_min) * (0.5 * (1.0 - math.cos(math.pi * t)))
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


def build_airfoil_slice(name, stations, u_min=0.0, u_max=1.0, deflect_deg=0.0,
                        collection=None, smooth=True, subsurf_levels=1,
                        cap_start=False, cap_end=False, ring_materials=None):
    """
    Builds a 3D airfoil section (full airfoil or separated slat / main box / elevon / rudder).
    When cap_start=False and cap_end=False, we insert tight boundary rings at 1.5% span from both ends
    and cap with a flush flat polygon so Catmull-Clark Subdivision never rounds off or shrinks the tips!
    """
    n_pts = 22
    raw_profiles = []
    deflect_rad = math.radians(deflect_deg)
    hinge_u = u_min if u_min > 0.01 else u_max

    for st in stations:
        le = Vector(st['le'])
        chord = st['chord']
        t_ratio = st.get('t_ratio', 0.044)
        camber = st.get('camber', 0.010)
        twist = math.radians(st.get('twist_deg', 0.0))
        vertical = st.get('vertical', False)

        sec_2d = make_airfoil_section(chord, t_ratio, camber=camber, u_min=u_min, u_max=u_max, n_pts=n_pts)
        hinge_dist = hinge_u * chord
        ring = []
        for u_dist, thick_dist in sec_2d:
            if abs(deflect_rad) > 1e-5:
                du = u_dist - hinge_dist
                u_rot = hinge_dist + du * math.cos(deflect_rad) - thick_dist * math.sin(deflect_rad)
                t_rot = du * math.sin(deflect_rad) + thick_dist * math.cos(deflect_rad)
            else:
                u_rot, t_rot = u_dist, thick_dist

            dy = -u_rot * math.cos(twist) - t_rot * math.sin(twist)
            dh = -u_rot * math.sin(twist) + t_rot * math.cos(twist)
            if vertical:
                ring.append((le.x + dh, le.y + dy, le.z))
            else:
                ring.append((le.x, le.y + dy, le.z + dh))
        raw_profiles.append(ring)

    # Add tight boundary support rings near start and end so Subsurf preserves exact sharp spanwise edges!
    profiles = []
    if len(raw_profiles) >= 2:
        r0 = [ tuple(Vector(a).lerp(Vector(b), 0.02)) for a, b in zip(raw_profiles[0], raw_profiles[1]) ]
        r_end = [ tuple(Vector(a).lerp(Vector(b), 0.98)) for a, b in zip(raw_profiles[-2], raw_profiles[-1]) ]
        profiles = [raw_profiles[0], r0] + raw_profiles[1:-1] + [r_end, raw_profiles[-1]]
    else:
        profiles = raw_profiles

    return loft_closed_profiles(name, profiles, cap_start=cap_start, cap_end=cap_end,
                                collection=collection, smooth=smooth, subsurf_levels=subsurf_levels,
                                ring_materials=ring_materials)


# ==============================================================================
# REFERENCE-BASED PANEL SEAM & WEATHERING TEXTURE GENERATOR (NumPy + bpy.data.images)
# ==============================================================================

def create_reference_panel_textures(outdir):
    """
    Generates high-resolution 2048x2048 reference-based panel seam, access hatch, and tonal variation
    textures using NumPy.
    - Top/Planform Map: covers X in [-6.0, 6.0], Y in [-8.0, 8.0]
    - Side Profile Map: covers Y in [-8.0, 8.0], Z in [0.0, 6.0]
    """
    W, H = 2048, 2048

    def draw_line_segment(canvas, x1, y1, x2, y2, u_range, v_range, width_px=1.6, depth=0.65):
        u0, u1 = u_range
        v0, v1 = v_range
        px1 = (x1 - u0) / (u1 - u0) * (W - 1)
        py1 = (y1 - v0) / (v1 - v0) * (H - 1)
        px2 = (x2 - u0) / (u1 - u0) * (W - 1)
        py2 = (y2 - v0) / (v1 - v0) * (H - 1)

        pad = int(width_px * 3) + 2
        ix_min = max(0, int(min(px1, px2)) - pad)
        ix_max = min(W - 1, int(max(px1, px2)) + pad)
        iy_min = max(0, int(min(py1, py2)) - pad)
        iy_max = min(H - 1, int(max(py1, py2)) + pad)
        if ix_min >= ix_max or iy_min >= iy_max:
            return

        gx, gy = np.meshgrid(np.arange(ix_min, ix_max + 1, dtype=np.float32),
                             np.arange(iy_min, iy_max + 1, dtype=np.float32))
        dx = px2 - px1
        dy = py2 - py1
        seg_len_sq = dx * dx + dy * dy
        if seg_len_sq < 1e-6:
            return
        t = np.clip(((gx - px1) * dx + (gy - py1) * dy) / seg_len_sq, 0.0, 1.0)
        proj_x = px1 + t * dx
        proj_y = py1 + t * dy
        dist = np.sqrt((gx - proj_x) ** 2 + (gy - proj_y) ** 2)

        seam = np.clip(1.0 - dist / width_px, 0.0, 1.0) ** 1.5
        sub = canvas[iy_min:iy_max + 1, ix_min:ix_max + 1]
        canvas[iy_min:iy_max + 1, ix_min:ix_max + 1] = np.minimum(sub, 1.0 - depth * seam)

    # --- 1. TOP / PLANFORM PANEL MAP (X in [-6, 6], Y in [-8, 8]) ---
    top_map = np.ones((H, W), dtype=np.float32)
    xr = (-6.0, 6.0)
    yr = (-8.0, 8.0)

    # Fuselage & Spine circumferential bulkheads
    for y_frame, x_half in [
        (4.86, 0.56),   # Radome bulkhead
        (3.85, 0.65),   # Forward avionics frame
        (1.32, 0.82),   # Rear cockpit bulkhead
        (-0.40, 1.05),  # Center fuselage frame
        (-2.20, 1.10),  # Main gear bulkhead
        (-4.20, 1.05),  # Forward engine bay bulkhead
        (-5.85, 0.90),  # Rear engine bay frame
        (-6.60, 0.84),  # Exhaust shroud seam
    ]:
        draw_line_segment(top_map, -x_half, y_frame, x_half, y_frame, xr, yr, width_px=1.5, depth=0.68)

    # Dorsal spine longitudinal avionics bay seams
    draw_line_segment(top_map, -0.26, -6.50, -0.34, 1.32, xr, yr, width_px=1.4, depth=0.58)
    draw_line_segment(top_map,  0.26, -6.50,  0.34, 1.32, xr, yr, width_px=1.4, depth=0.58)

    # Symmetric Wing & LERX Reference Panel Seams
    for s in (-1.0, 1.0):
        # Main wing box front spar & leading-edge slat boundary (swept at 48 deg)
        draw_line_segment(top_map, s * 1.15,  0.05, s * 5.25, -4.65, xr, yr, width_px=1.6, depth=0.72)
        # Main wing rear spar / elevon hinge line
        draw_line_segment(top_map, s * 1.10, -5.28, s * 5.20, -5.58, xr, yr, width_px=1.6, depth=0.72)
        # Mid-chord composite skin seam
        draw_line_segment(top_map, s * 1.12, -2.50, s * 4.55, -4.55, xr, yr, width_px=1.3, depth=0.52)
        # Spanwise wing rib seams (4 main structural ribs per wing, starting outboard of fuselage X=1.2m so they never project onto the fuselage spine!)
        for x_rib, y_le, y_te in [
            (1.95, -0.95, -5.34),
            (2.95, -2.05, -5.42),
            (3.95, -3.20, -5.50),
            (4.75, -4.12, -5.55),
        ]:
            draw_line_segment(top_map, s * x_rib, y_le, s * x_rib, y_te, xr, yr, width_px=1.3, depth=0.52)

        # Engine servicing access hatches on upper rear fuselage nacelles
        for y_h1, y_h2 in [(-2.0, -3.8), (-4.0, -5.6)]:
            draw_line_segment(top_map, s * 0.35, y_h1, s * 0.85, y_h1, xr, yr, width_px=1.3, depth=0.50)
            draw_line_segment(top_map, s * 0.85, y_h1, s * 0.85, y_h2, xr, yr, width_px=1.3, depth=0.50)
            draw_line_segment(top_map, s * 0.85, y_h2, s * 0.35, y_h2, xr, yr, width_px=1.3, depth=0.50)

    # --- 2. SIDE PROFILE PANEL MAP (Y in [-8, 8], Z in [0, 6]) ---
    side_map = np.ones((H, W), dtype=np.float32)
    zr = (0.0, 6.0)

    # Vertical Stabilizer (Tailfin) Reference Seams (all strictly at Z >= 2.25m so they only hit the vertical tail!):
    # Leading-edge dielectric spar line
    draw_line_segment(side_map, -3.62, 2.25, -6.28, 5.20, yr, zr, width_px=1.6, depth=0.70)
    # Rudder hinge line (swept rear spar from Z=2.25m to Z=5.18m)
    draw_line_segment(side_map, -6.08, 2.25, -6.88, 5.18, yr, zr, width_px=1.8, depth=0.78)
    # 5 angled structural ribs inside the main fin box
    for z_r, y_le_r, y_te_r in [
        (2.65, -4.02, -6.18),
        (3.20, -4.52, -6.34),
        (3.75, -5.00, -6.50),
        (4.30, -5.50, -6.66),
        (4.82, -5.96, -6.80),
    ]:
        draw_line_segment(side_map, y_le_r, z_r, y_te_r, z_r - 0.08, yr, zr, width_px=1.3, depth=0.50)
    # Horizontal rudder segment divisions (3 segments on rudder)
    for z_rud, y_r1, y_r2 in [
        (3.15, -6.34, -7.12),
        (4.15, -6.60, -7.24),
    ]:
        draw_line_segment(side_map, y_r1, z_rud, y_r2, z_rud, yr, zr, width_px=1.4, depth=0.58)

    # Forward Fuselage & Intake Nacelle Side Seams (strictly below Z = 2.05m so they never cross into the spine):
    draw_line_segment(side_map, 4.86, 1.00, 4.86, 2.00, yr, zr, width_px=1.6, depth=0.72)
    # Avionics bay side access hatches below cockpit (Y = 2.75m to 4.45m, Z = 1.24m to 1.74m)
    for y_a1, y_a2, z_b, z_t in [
        (3.65, 4.45, 1.24, 1.72),
        (2.75, 3.50, 1.22, 1.74),
    ]:
        draw_line_segment(side_map, y_a1, z_b, y_a2, z_b, yr, zr, width_px=1.3, depth=0.52)
        draw_line_segment(side_map, y_a2, z_b, y_a2, z_t, yr, zr, width_px=1.3, depth=0.52)
        draw_line_segment(side_map, y_a2, z_t, y_a1, z_t, yr, zr, width_px=1.3, depth=0.52)
        draw_line_segment(side_map, y_a1, z_t, y_a1, z_b, yr, zr, width_px=1.3, depth=0.52)

    # Intake nacelle structural ring frames (strictly below Z = 1.62m so they only appear on the lower nacelle sides!)
    for y_nf in (1.40, -0.40, -2.40, -4.40, -6.45):
        draw_line_segment(side_map, y_nf, 0.85, y_nf, 1.56, yr, zr, width_px=1.4, depth=0.55)
    # Longitudinal nacelle maintenance seam (from Y = -6.45m to +1.40m so it stops behind the intake lip!)
    draw_line_segment(side_map, -6.45, 1.32, 1.40, 1.35, yr, zr, width_px=1.4, depth=0.55)

    def array_to_blender_image(name, gray_arr, filepath):
        rgba = np.ones((H, W, 4), dtype=np.float32)
        rgba[:, :, 0] = gray_arr
        rgba[:, :, 1] = gray_arr
        rgba[:, :, 2] = gray_arr
        img = bpy.data.images.new(name, width=W, height=H, alpha=True)
        img.pixels.foreach_set(rgba.ravel())
        img.filepath_raw = filepath
        img.file_format = 'PNG'
        img.save()
        img.pack()
        return img

    img_top = array_to_blender_image("Rafale_Panels_Top", top_map, os.path.join(outdir, "tex_panels_top.png"))
    img_side = array_to_blender_image("Rafale_Panels_Side", side_map, os.path.join(outdir, "tex_panels_side.png"))
    return img_top, img_side


# ==============================================================================
# MATERIALS & PROCEDURAL SHADERS
# ==============================================================================

def create_materials(outdir):
    mats = {}
    img_top, img_side = create_reference_panel_textures(outdir)

    def build_airframe_shader(mat_name, base_col_dark, base_col_light, rough_min=0.32, rough_max=0.54, metallic=0.15):
        mat = bpy.data.materials.new(mat_name)
        tree = mat.node_tree
        nodes = tree.nodes
        links = tree.links
        nodes.clear()

        out = nodes.new("ShaderNodeOutputMaterial")
        bsdf = nodes.new("ShaderNodeBsdfPrincipled")
        links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])

        geom = nodes.new("ShaderNodeNewGeometry")
        sep_pos = nodes.new("ShaderNodeSeparateXYZ")
        links.new(geom.outputs["Position"], sep_pos.inputs["Vector"])

        # Top/Planform projection
        u_top = nodes.new("ShaderNodeMapRange")
        u_top.inputs["From Min"].default_value = -6.0
        u_top.inputs["From Max"].default_value = 6.0
        links.new(sep_pos.outputs["X"], u_top.inputs["Value"])

        v_top = nodes.new("ShaderNodeMapRange")
        v_top.inputs["From Min"].default_value = -8.0
        v_top.inputs["From Max"].default_value = 8.0
        links.new(sep_pos.outputs["Y"], v_top.inputs["Value"])

        uv_top = nodes.new("ShaderNodeCombineXYZ")
        links.new(u_top.outputs["Result"], uv_top.inputs["X"])
        links.new(v_top.outputs["Result"], uv_top.inputs["Y"])

        tex_top = nodes.new("ShaderNodeTexImage")
        tex_top.image = img_top
        tex_top.extension = 'CLIP'
        links.new(uv_top.outputs["Vector"], tex_top.inputs["Vector"])

        # Side Profile projection
        z_side = nodes.new("ShaderNodeMapRange")
        z_side.inputs["From Min"].default_value = 0.0
        z_side.inputs["From Max"].default_value = 6.0
        links.new(sep_pos.outputs["Z"], z_side.inputs["Value"])

        uv_side = nodes.new("ShaderNodeCombineXYZ")
        links.new(v_top.outputs["Result"], uv_side.inputs["X"])
        links.new(z_side.outputs["Result"], uv_side.inputs["Y"])

        tex_side = nodes.new("ShaderNodeTexImage")
        tex_side.image = img_side
        tex_side.extension = 'CLIP'
        links.new(uv_side.outputs["Vector"], tex_side.inputs["Vector"])

        # Blend Top and Side projections smoothly based on |Normal.X|
        sep_norm = nodes.new("ShaderNodeSeparateXYZ")
        links.new(geom.outputs["Normal"], sep_norm.inputs["Vector"])
        abs_nx = nodes.new("ShaderNodeMath")
        abs_nx.operation = 'ABSOLUTE'
        links.new(sep_norm.outputs["X"], abs_nx.inputs[0])

        ramp_proj = nodes.new("ShaderNodeValToRGB")
        ramp_proj.color_ramp.elements[0].position = 0.35
        ramp_proj.color_ramp.elements[0].color = (0.0, 0.0, 0.0, 1.0)
        ramp_proj.color_ramp.elements[1].position = 0.65
        ramp_proj.color_ramp.elements[1].color = (1.0, 1.0, 1.0, 1.0)
        links.new(abs_nx.outputs["Value"], ramp_proj.inputs["Fac"])

        mix_seams = nodes.new("ShaderNodeMix")
        mix_seams.data_type = 'RGBA'
        links.new(ramp_proj.outputs["Color"], mix_seams.inputs["Factor"])
        links.new(tex_top.outputs["Color"], mix_seams.inputs[6])
        links.new(tex_side.outputs["Color"], mix_seams.inputs[7])

        # Multi-scale surface weathering & airflow streaking
        map_streak = nodes.new("ShaderNodeMapping")
        map_streak.inputs["Scale"].default_value = (2.8, 0.45, 2.8)
        links.new(geom.outputs["Position"], map_streak.inputs["Vector"])

        noise_streak = nodes.new("ShaderNodeTexNoise")
        noise_streak.inputs["Scale"].default_value = 1.8
        noise_streak.inputs["Detail"].default_value = 8.0
        noise_streak.inputs["Roughness"].default_value = 0.68
        links.new(map_streak.outputs["Vector"], noise_streak.inputs["Vector"])

        noise_mottle = nodes.new("ShaderNodeTexNoise")
        noise_mottle.inputs["Scale"].default_value = 0.95
        noise_mottle.inputs["Detail"].default_value = 6.0
        noise_mottle.inputs["Roughness"].default_value = 0.62
        links.new(geom.outputs["Position"], noise_mottle.inputs["Vector"])

        noise_micro = nodes.new("ShaderNodeTexNoise")
        noise_micro.inputs["Scale"].default_value = 16.0
        noise_micro.inputs["Detail"].default_value = 10.0
        noise_micro.inputs["Roughness"].default_value = 0.75
        links.new(geom.outputs["Position"], noise_micro.inputs["Vector"])

        mix_wear = nodes.new("ShaderNodeMix")
        mix_wear.data_type = 'FLOAT'
        mix_wear.inputs["Factor"].default_value = 0.48
        links.new(noise_mottle.outputs["Fac"], mix_wear.inputs[2])
        links.new(noise_streak.outputs["Fac"], mix_wear.inputs[3])

        ramp_col = nodes.new("ShaderNodeValToRGB")
        ramp_col.color_ramp.elements[0].position = 0.22
        ramp_col.color_ramp.elements[0].color = base_col_dark
        ramp_col.color_ramp.elements[1].position = 0.78
        ramp_col.color_ramp.elements[1].color = base_col_light
        links.new(mix_wear.outputs[0], ramp_col.inputs["Fac"])

        # Multiply seam darkening into base paint color
        seam_col_mult = nodes.new("ShaderNodeMix")
        seam_col_mult.data_type = 'RGBA'
        seam_col_mult.blend_type = 'MULTIPLY'
        seam_col_mult.inputs["Factor"].default_value = 0.68
        links.new(ramp_col.outputs["Color"], seam_col_mult.inputs[6])
        links.new(mix_seams.outputs[2], seam_col_mult.inputs[7])

        links.new(seam_col_mult.outputs[2], bsdf.inputs["Base Color"])
        bsdf.inputs["Metallic"].default_value = metallic

        # Roughness variation
        ramp_rough = nodes.new("ShaderNodeValToRGB")
        ramp_rough.color_ramp.elements[0].position = 0.20
        ramp_rough.color_ramp.elements[0].color = (rough_min, rough_min, rough_min, 1.0)
        ramp_rough.color_ramp.elements[1].position = 0.82
        ramp_rough.color_ramp.elements[1].color = (rough_max, rough_max, rough_max, 1.0)
        links.new(mix_wear.outputs[0], ramp_rough.inputs["Fac"])
        links.new(ramp_rough.outputs["Color"], bsdf.inputs["Roughness"])

        # Engraved panel seam bump + subtle metallic skin orange-peel/wear bump
        bump_seam = nodes.new("ShaderNodeBump")
        bump_seam.inputs["Strength"].default_value = 0.22
        bump_seam.inputs["Distance"].default_value = 0.0028
        links.new(mix_seams.outputs[2], bump_seam.inputs["Height"])

        bump_skin = nodes.new("ShaderNodeBump")
        bump_skin.inputs["Strength"].default_value = 0.035
        bump_skin.inputs["Distance"].default_value = 0.0015
        links.new(noise_micro.outputs["Fac"], bump_skin.inputs["Height"])
        links.new(bump_seam.outputs["Normal"], bump_skin.inputs["Normal"])
        links.new(bump_skin.outputs["Normal"], bsdf.inputs["Normal"])

        return mat

    # 1. Primary Rafale Tactical Celomer Grey-Blue Airframe
    mats['airframe'] = build_airframe_shader(
        "Rafale_Airframe_Grey",
        base_col_dark=(0.170, 0.190, 0.215, 1.0),
        base_col_light=(0.235, 0.258, 0.286, 1.0),
        rough_min=0.33,
        rough_max=0.54,
        metallic=0.16,
    )

    # 1b. Secondary Control-Surface & Composite Access Panel Grey
    mats['airframe_alt'] = build_airframe_shader(
        "Rafale_Airframe_Composite_Alt",
        base_col_dark=(0.148, 0.165, 0.188, 1.0),
        base_col_light=(0.205, 0.226, 0.252, 1.0),
        rough_min=0.36,
        rough_max=0.58,
        metallic=0.12,
    )

    # 2. Radome / Nose Cone Material
    mats['radome'] = build_airframe_shader(
        "Rafale_Radome_Slate",
        base_col_dark=(0.125, 0.140, 0.162, 1.0),
        base_col_light=(0.162, 0.180, 0.204, 1.0),
        rough_min=0.30,
        rough_max=0.46,
        metallic=0.04,
    )

    # 3. Dielectric Sensor / Leading Edge / Fin Tip Material
    mat_sensor = bpy.data.materials.new("Rafale_Sensor_Dark")
    bsdf = mat_sensor.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (0.065, 0.070, 0.080, 1.0)
    bsdf.inputs["Metallic"].default_value = 0.06
    bsdf.inputs["Roughness"].default_value = 0.30
    mats['sensor'] = mat_sensor

    # 4. Gold-Tinted Canopy Glass
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
    ramp_tint.color_ramp.elements[0].color = (0.16, 0.13, 0.07, 1.0)
    ramp_tint.color_ramp.elements[1].position = 0.75
    ramp_tint.color_ramp.elements[1].color = (0.82, 0.60, 0.22, 1.0)
    links.new(fresnel.outputs["Facing"], ramp_tint.inputs["Fac"])

    links.new(ramp_tint.outputs["Color"], bsdf.inputs["Base Color"])
    bsdf.inputs["Metallic"].default_value = 0.20
    bsdf.inputs["Roughness"].default_value = 0.02
    bsdf.inputs["IOR"].default_value = 1.52
    if "Transmission Weight" in bsdf.inputs:
        bsdf.inputs["Transmission Weight"].default_value = 0.78
    if "Coat Weight" in bsdf.inputs:
        bsdf.inputs["Coat Weight"].default_value = 0.90
        bsdf.inputs["Coat Roughness"].default_value = 0.01
        bsdf.inputs["Coat Tint"].default_value = (0.96, 0.76, 0.34, 1.0)
    if "Thin Film Thickness" in bsdf.inputs:
        bsdf.inputs["Thin Film Thickness"].default_value = 420.0
        bsdf.inputs["Thin Film IOR"].default_value = 1.65
    mats['canopy'] = mat_canopy

    # 5. Cockpit Interior
    mat_cockpit = bpy.data.materials.new("Rafale_Cockpit_Interior")
    bsdf = mat_cockpit.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (0.025, 0.028, 0.032, 1.0)
    bsdf.inputs["Metallic"].default_value = 0.15
    bsdf.inputs["Roughness"].default_value = 0.75
    mats['cockpit'] = mat_cockpit

    # 6. HUD Glass
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

    # 7. Snecma M88 Exhaust Outer Petals
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
    ramp_ex.color_ramp.elements[0].color = (0.075, 0.070, 0.068, 1.0)
    ramp_ex.color_ramp.elements[1].position = 0.8
    ramp_ex.color_ramp.elements[1].color = (0.19, 0.160, 0.135, 1.0)
    links.new(noise_ex.outputs["Fac"], ramp_ex.inputs["Fac"])

    links.new(ramp_ex.outputs["Color"], bsdf.inputs["Base Color"])
    bsdf.inputs["Metallic"].default_value = 0.88
    bsdf.inputs["Roughness"].default_value = 0.32
    if "Anisotropic" in bsdf.inputs:
        bsdf.inputs["Anisotropic"].default_value = 0.45
    mats['exhaust'] = mat_exhaust

    # 8. Exhaust Inner Liner & Deep Duct Shadow Material
    mat_exhaust_inner = bpy.data.materials.new("Rafale_Exhaust_Inner")
    bsdf = mat_exhaust_inner.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (0.022, 0.022, 0.025, 1.0)
    bsdf.inputs["Metallic"].default_value = 0.65
    bsdf.inputs["Roughness"].default_value = 0.55
    mats['exhaust_inner'] = mat_exhaust_inner

    # 9. Landing Gear Struts & Wheel Bays
    mat_gear_strut = bpy.data.materials.new("Rafale_Gear_Strut_White")
    tree = mat_gear_strut.node_tree
    nodes = tree.nodes
    links = tree.links
    nodes.clear()
    out = nodes.new("ShaderNodeOutputMaterial")
    bsdf = nodes.new("ShaderNodeBsdfPrincipled")
    links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])

    geom_g = nodes.new("ShaderNodeNewGeometry")
    noise_g = nodes.new("ShaderNodeTexNoise")
    noise_g.inputs["Scale"].default_value = 12.0
    noise_g.inputs["Detail"].default_value = 6.0
    links.new(geom_g.outputs["Position"], noise_g.inputs["Vector"])

    ramp_g = nodes.new("ShaderNodeValToRGB")
    ramp_g.color_ramp.elements[0].position = 0.20
    ramp_g.color_ramp.elements[0].color = (0.68, 0.69, 0.71, 1.0)
    ramp_g.color_ramp.elements[1].position = 0.80
    ramp_g.color_ramp.elements[1].color = (0.83, 0.84, 0.86, 1.0)
    links.new(noise_g.outputs["Fac"], ramp_g.inputs["Fac"])

    links.new(ramp_g.outputs["Color"], bsdf.inputs["Base Color"])
    bsdf.inputs["Metallic"].default_value = 0.15
    bsdf.inputs["Roughness"].default_value = 0.26
    mats['gear_strut'] = mat_gear_strut

    # 10. Oleo Chrome & Actuators
    mat_chrome = bpy.data.materials.new("Rafale_Oleo_Chrome")
    bsdf = mat_chrome.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (0.92, 0.93, 0.95, 1.0)
    bsdf.inputs["Metallic"].default_value = 0.98
    bsdf.inputs["Roughness"].default_value = 0.05
    mats['chrome'] = mat_chrome

    # 10b. Hydraulic Lines / Brake Hoses
    mat_hyd = bpy.data.materials.new("Rafale_Hydraulic_Line")
    bsdf = mat_hyd.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (0.08, 0.075, 0.07, 1.0)
    bsdf.inputs["Metallic"].default_value = 0.45
    bsdf.inputs["Roughness"].default_value = 0.48
    mats['hydraulic'] = mat_hyd

    # 11. Tire Rubber
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

    wave_t = nodes.new("ShaderNodeTexWave")
    wave_t.wave_type = 'BANDS'
    wave_t.bands_direction = 'X'
    wave_t.inputs["Scale"].default_value = 28.0
    wave_t.inputs["Distortion"].default_value = 0.0
    links.new(geom_t.outputs["Position"], wave_t.inputs["Vector"])

    ramp_t = nodes.new("ShaderNodeValToRGB")
    ramp_t.color_ramp.elements[0].position = 0.2
    ramp_t.color_ramp.elements[0].color = (0.020, 0.020, 0.022, 1.0)
    ramp_t.color_ramp.elements[1].position = 0.85
    ramp_t.color_ramp.elements[1].color = (0.048, 0.046, 0.044, 1.0)
    links.new(noise_t.outputs["Fac"], ramp_t.inputs["Fac"])

    links.new(ramp_t.outputs["Color"], bsdf.inputs["Base Color"])
    bsdf.inputs["Metallic"].default_value = 0.0
    bsdf.inputs["Roughness"].default_value = 0.82

    bump_t = nodes.new("ShaderNodeBump")
    bump_t.inputs["Strength"].default_value = 0.28
    bump_t.inputs["Distance"].default_value = 0.003
    links.new(wave_t.outputs["Color"], bump_t.inputs["Height"])
    links.new(bump_t.outputs["Normal"], bsdf.inputs["Normal"])
    mats['tire'] = mat_tire

    # 12. Concrete Apron
    mat_apron = bpy.data.materials.new("Concrete_Apron")
    tree = mat_apron.node_tree
    nodes = tree.nodes
    links = tree.links
    nodes.clear()

    out = nodes.new("ShaderNodeOutputMaterial")
    bsdf = nodes.new("ShaderNodeBsdfPrincipled")
    links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])

    geom_a = nodes.new("ShaderNodeNewGeometry")

    brick_apron = nodes.new("ShaderNodeTexBrick")
    brick_apron.offset = 0.0
    brick_apron.inputs["Color1"].default_value = (0.94, 0.94, 0.94, 1.0)
    brick_apron.inputs["Color2"].default_value = (1.0, 1.0, 1.0, 1.0)
    brick_apron.inputs["Mortar"].default_value = (0.03, 0.028, 0.025, 1.0)
    brick_apron.inputs["Scale"].default_value = 0.20
    brick_apron.inputs["Mortar Size"].default_value = 0.0065
    brick_apron.inputs["Mortar Smooth"].default_value = 0.35
    brick_apron.inputs["Brick Width"].default_value = 1.0
    brick_apron.inputs["Row Height"].default_value = 1.0
    links.new(geom_a.outputs["Position"], brick_apron.inputs["Vector"])

    noise_macro = nodes.new("ShaderNodeTexNoise")
    noise_macro.inputs["Scale"].default_value = 0.24
    noise_macro.inputs["Detail"].default_value = 10.0
    noise_macro.inputs["Roughness"].default_value = 0.72
    links.new(geom_a.outputs["Position"], noise_macro.inputs["Vector"])

    map_skid = nodes.new("ShaderNodeMapping")
    map_skid.inputs["Scale"].default_value = (2.5, 0.15, 1.0)
    links.new(geom_a.outputs["Position"], map_skid.inputs["Vector"])
    noise_skid = nodes.new("ShaderNodeTexNoise")
    noise_skid.inputs["Scale"].default_value = 0.85
    noise_skid.inputs["Detail"].default_value = 6.0
    links.new(map_skid.outputs["Vector"], noise_skid.inputs["Vector"])

    noise_grain = nodes.new("ShaderNodeTexNoise")
    noise_grain.inputs["Scale"].default_value = 38.0
    noise_grain.inputs["Detail"].default_value = 14.0
    noise_grain.inputs["Roughness"].default_value = 0.85
    links.new(geom_a.outputs["Position"], noise_grain.inputs["Vector"])

    mix_conc = nodes.new("ShaderNodeMix")
    mix_conc.data_type = 'FLOAT'
    mix_conc.inputs["Factor"].default_value = 0.38
    links.new(noise_macro.outputs["Fac"], mix_conc.inputs[2])
    links.new(noise_skid.outputs["Fac"], mix_conc.inputs[3])

    mix_conc2 = nodes.new("ShaderNodeMix")
    mix_conc2.data_type = 'FLOAT'
    mix_conc2.inputs["Factor"].default_value = 0.35
    links.new(mix_conc.outputs[0], mix_conc2.inputs[2])
    links.new(noise_grain.outputs["Fac"], mix_conc2.inputs[3])

    ramp_conc = nodes.new("ShaderNodeValToRGB")
    ramp_conc.color_ramp.elements[0].position = 0.24
    ramp_conc.color_ramp.elements[0].color = (0.145, 0.138, 0.130, 1.0)
    ramp_conc.color_ramp.elements[1].position = 0.76
    ramp_conc.color_ramp.elements[1].color = (0.310, 0.298, 0.280, 1.0)
    links.new(mix_conc2.outputs[0], ramp_conc.inputs["Fac"])

    mix_joint = nodes.new("ShaderNodeMix")
    mix_joint.data_type = 'RGBA'
    mix_joint.blend_type = 'MULTIPLY'
    mix_joint.inputs["Factor"].default_value = 0.85
    links.new(ramp_conc.outputs["Color"], mix_joint.inputs[6])
    links.new(brick_apron.outputs["Color"], mix_joint.inputs[7])

    links.new(mix_joint.outputs[2], bsdf.inputs["Base Color"])
    bsdf.inputs["Metallic"].default_value = 0.0

    ramp_c_rough = nodes.new("ShaderNodeValToRGB")
    ramp_c_rough.color_ramp.elements[0].position = 0.25
    ramp_c_rough.color_ramp.elements[0].color = (0.26, 0.26, 0.26, 1.0)
    ramp_c_rough.color_ramp.elements[1].position = 0.72
    ramp_c_rough.color_ramp.elements[1].color = (0.88, 0.88, 0.88, 1.0)
    links.new(mix_conc.outputs[0], ramp_c_rough.inputs["Fac"])
    links.new(ramp_c_rough.outputs["Color"], bsdf.inputs["Roughness"])

    bump_joint = nodes.new("ShaderNodeBump")
    bump_joint.inputs["Strength"].default_value = 0.55
    bump_joint.inputs["Distance"].default_value = 0.015
    links.new(brick_apron.outputs["Color"], bump_joint.inputs["Height"])

    bump_grain = nodes.new("ShaderNodeBump")
    bump_grain.inputs["Strength"].default_value = 0.28
    bump_grain.inputs["Distance"].default_value = 0.005
    links.new(noise_grain.outputs["Fac"], bump_grain.inputs["Height"])
    links.new(bump_joint.outputs["Normal"], bump_grain.inputs["Normal"])
    links.new(bump_grain.outputs["Normal"], bsdf.inputs["Normal"])

    mats['apron'] = mat_apron

    # 13. Apron Yellow Taxi Line Paint
    mat_marking = bpy.data.materials.new("Apron_Taxi_Yellow")
    tree = mat_marking.node_tree
    nodes = tree.nodes
    links = tree.links
    nodes.clear()
    out = nodes.new("ShaderNodeOutputMaterial")
    bsdf = nodes.new("ShaderNodeBsdfPrincipled")
    links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
    geom_m = nodes.new("ShaderNodeNewGeometry")
    noise_m = nodes.new("ShaderNodeTexNoise")
    noise_m.inputs["Scale"].default_value = 8.0
    noise_m.inputs["Detail"].default_value = 8.0
    links.new(geom_m.outputs["Position"], noise_m.inputs["Vector"])
    ramp_m = nodes.new("ShaderNodeValToRGB")
    ramp_m.color_ramp.elements[0].position = 0.25
    ramp_m.color_ramp.elements[0].color = (0.42, 0.28, 0.05, 1.0)
    ramp_m.color_ramp.elements[1].position = 0.75
    ramp_m.color_ramp.elements[1].color = (0.68, 0.46, 0.08, 1.0)
    links.new(noise_m.outputs["Fac"], ramp_m.inputs["Fac"])
    links.new(ramp_m.outputs["Color"], bsdf.inputs["Base Color"])
    bsdf.inputs["Roughness"].default_value = 0.68
    bump_m = nodes.new("ShaderNodeBump")
    bump_m.inputs["Strength"].default_value = 0.22
    bump_m.inputs["Distance"].default_value = 0.004
    links.new(noise_m.outputs["Fac"], bump_m.inputs["Height"])
    links.new(bump_m.outputs["Normal"], bsdf.inputs["Normal"])
    mats['marking'] = mat_marking

    return mats


def assign_mat(obj, mat):
    if obj.data.materials:
        obj.data.materials[0] = mat
    else:
        obj.data.materials.append(mat)


# ==============================================================================
# UNIFIED DASSAULT RAFALE BODYWORK (FUSELAGE + RADOME + CANARD CHINES + INTAKE NACELLES + DORSAL SPINE)
# ==============================================================================

def evaluate_unified_body_ring(y, n_half=32):
    """
    Evaluates a 64-vertex cross-section ring at longitudinal station `y` (from Y = -7.28m to Y = +7.62m)
    that smoothly integrates:
      - Smooth tangent-continuous ogival nose radome (Y = +4.86m to +7.62m) with nose chines
      - Forward cockpit fuselage & flared canard-shoulder chines (Y = +0.50m to +4.86m)
      - Blended intake nacelles & twin-engine rear fuselage (Y = -7.28m to +2.45m)
      - Sleek low-profile dorsal avionics spine (Y = -6.75m to +1.55m, peak Z = 2.28m)
      - Recessed wheel-well cavities on the underside at Nose Bay (Y = 3.65..4.55m) and Main Bays (Y = -2.25..-1.15m)
    """
    def smoothstep(edge0, edge1, val):
        t = max(0.0, min(1.0, (val - edge0) / (edge1 - edge0))) if abs(edge1 - edge0) > 1e-6 else 0.0
        return t * t * (3.0 - 2.0 * t)

    # 1. Analytical smooth envelope functions from tail (Y=-7.28) to nose tip (Y=+7.62)
    if y >= 1.50:
        u = max(0.0, (7.62 - y) / (7.62 - 1.50))  # 1.0 at Y=1.50, 0.0 at Y=7.62
        ogive = (u ** 0.74) * (1.0 - 0.14 * (1.0 - u) * u)
        hw_mid = 0.003 + 0.84 * ogive
        hw_bot = 0.002 + 0.56 * (u ** 0.82)
        hw_top = 0.002 + 0.38 * (u ** 0.78)
        z_bot = 1.40 - 0.42 * (u ** 0.78)
        z_mid = 1.40 + 0.16 * (u ** 0.72)
        z_top = 1.40 + 0.68 * (u ** 0.68)  # 2.08m at Y=1.50m (matches rear canopy sill!)
    else:
        w_nacelle = smoothstep(2.45, 0.80, y) * (1.0 - 0.26 * smoothstep(-4.20, -7.28, y))
        hw_mid = 0.84 + 0.30 * w_nacelle
        hw_bot = 0.56 + 0.34 * w_nacelle
        hw_top = 0.38 + 0.20 * smoothstep(-2.0, -7.0, y)
        z_bot = 0.98 - 0.10 * w_nacelle + 0.24 * smoothstep(-4.80, -7.28, y)
        z_mid = 1.56
        # Sleek upper fuselage profile behind cockpit (2.08m at Y=1.5m, 2.12m mid-fuselage, tapering to 1.84m at tail)
        z_top = 2.08 + 0.04 * smoothstep(1.50, -1.00, y) - 0.28 * smoothstep(-4.50, -7.28, y)

    # 2. Sleek Integrated Dorsal Spine (Y from -6.75m to +1.45m, adding +0.16m so total spine crown is Z = 2.28m, matching the rear canopy fairing!)
    spine_env = smoothstep(-6.80, -4.80, y) * smoothstep(1.55, 0.85, y)
    z_spine_add = 0.16 * spine_env

    # 3. Integrated Canard Shoulder Chines
    shoulder_env = smoothstep(-0.40, 1.10, y) * smoothstep(4.35, 2.35, y)
    nose_chine_env = smoothstep(1.50, 4.20, y) * smoothstep(7.45, 5.20, y)

    # 4. Integrated Intake Nacelle Lateral Lobe
    intake_env = smoothstep(2.48, 1.55, y) * smoothstep(-6.80, -4.20, y)
    twin_gulley_env = smoothstep(1.20, -1.50, y)

    # 5. Recessed Landing Gear Wheel Well Cutouts
    nose_bay_env = smoothstep(3.50, 3.68, y) * smoothstep(4.68, 4.50, y)
    main_bay_env = smoothstep(-2.38, -2.18, y) * smoothstep(-1.02, -1.22, y)

    ring = []
    total_pts = n_half * 2
    for i in range(total_pts):
        theta = 2.0 * math.pi * i / total_pts
        s = math.sin(theta)
        c = -math.cos(theta)
        abs_s = abs(s)

        if c < 0:
            t = 1.0 + c
            w_interp = hw_bot + (hw_mid - hw_bot) * (t ** 0.62)
            x_mag = (abs_s ** 0.82) * w_interp
            z = z_bot + (z_mid - z_bot) * (1.0 - (abs(c) ** 1.40))

            if intake_env > 0.0:
                lobe_mask = math.exp(-((t - 0.55) / 0.38) ** 2) * (abs_s ** 0.7)
                x_mag += intake_env * 0.09 * lobe_mask
                z -= intake_env * 0.045 * lobe_mask

            if twin_gulley_env > 0.0:
                gulley = twin_gulley_env * (1.0 - abs_s) * math.exp(-5.5 * (s ** 2))
                z += gulley * 0.15

            if nose_bay_env > 0.0 and x_mag < 0.22 and c < -0.55:
                well_mask = smoothstep(0.22, 0.15, x_mag)
                z += nose_bay_env * well_mask * 0.26

            if main_bay_env > 0.0 and 0.34 < x_mag < 0.96 and c < -0.25:
                well_mask = smoothstep(0.34, 0.44, x_mag) * smoothstep(0.96, 0.84, x_mag)
                z += main_bay_env * well_mask * 0.28

            x = math.copysign(x_mag, s)
        else:
            t = c
            w_interp = hw_mid * ((1.0 - (t ** 1.38)) ** 0.68) + hw_top * (t ** 1.55)
            x_mag = abs_s * w_interp
            z = z_mid + (z_top - z_mid) * (t ** 0.86)

            if shoulder_env > 0.0:
                sh_mask = math.exp(-((t - 0.42) / 0.24) ** 2)
                x_mag += shoulder_env * 0.22 * sh_mask
                z += shoulder_env * 0.08 * sh_mask

            if nose_chine_env > 0.0:
                ch_mask = math.exp(-((t - 0.18) / 0.16) ** 2)
                x_mag += nose_chine_env * 0.045 * ch_mask

            if spine_env > 0.0 and t > 0.45:
                sp_mask = smoothstep(0.45, 0.82, t)
                z += z_spine_add * sp_mask
                x_mag = x_mag * (1.0 - 0.20 * sp_mask) + (0.34 * spine_env * math.sin(math.pi * (1.0 - t))) * 0.30 * sp_mask

            x = math.copysign(x_mag, s)

        ring.append((x, y, z))
    return ring


def build_unified_airframe_body(coll, mats):
    """
    Builds the primary unified airframe hull from Y = -7.28m to Y = +7.62m with dense, smooth stations,
    plus the sculpted hollow S-duct intake mouths and boundary-layer splitter channels that blend
    all the way back into the rear fuselage nacelles so there is zero external step or seam!
    """
    y_stations = [
        -7.28, -7.05, -6.70, -6.20, -5.50, -4.70, -3.80, -2.90,
        -2.38, -2.20, -1.70, -1.20, -1.02, -0.50,  0.10,  0.65,
         1.15,  1.50,  1.85,  2.20,  2.55,  2.95,  3.48,  3.68,
         4.10,  4.50,  4.68,  4.84,  4.86,  4.88,  5.25,  5.65,
         6.05,  6.45,  6.82,  7.15,  7.40,  7.55,  7.62
    ]

    rings = [evaluate_unified_body_ring(y, n_half=32) for y in y_stations]
    ring_mats = []
    for r in range(len(y_stations) - 1):
        y_mid = 0.5 * (y_stations[r] + y_stations[r + 1])
        ring_mats.append(1 if y_mid > 4.86 else 0)

    body_obj = loft_closed_profiles("Rafale_Unified_Fuselage", rings, cap_start=True, cap_end=True,
                                    collection=coll, smooth=True, subsurf_levels=2, ring_materials=ring_mats)
    body_obj.data.materials.append(mats['airframe'])
    body_obj.data.materials.append(mats['radome'])

    # Pitot / nose tip lightning diverter probe at Y = +7.62m..+7.88m, Z = 1.40m
    bpy.ops.mesh.primitive_cone_add(vertices=16, radius1=0.012, radius2=0.002, depth=0.26,
                                    location=(0.0, 7.75, 1.40), rotation=(math.radians(-90), 0, 0))
    pitot = bpy.context.active_object
    pitot.name = "Rafale_Nose_Probe"
    coll.objects.link(pitot)
    bpy.context.scene.collection.objects.unlink(pitot)
    assign_mat(pitot, mats['sensor'])

    # Sculpted Semi-Ventral Kidney Intake Lips & Full-Length Nacelle Fairing (extending from Y = +2.62m all the way back to Y = -5.80m!)
    for side in (-1.0, 1.0):
        side_name = "R" if side > 0 else "L"
        n_ring = 28

        def make_sculpted_intake_ring(y, x_in, x_out, z_bot, z_top, y_sweep_out=0.0, y_sweep_bot=0.0):
            ring = []
            xc = 0.5 * (x_in + x_out)
            rx = 0.5 * (x_out - x_in)
            zc = 0.5 * (z_bot + z_top)
            rz = 0.5 * (z_top - z_bot)
            for i in range(n_ring):
                ang = 2.0 * math.pi * i / n_ring
                ca = math.cos(ang)  # +1 outboard, -1 inboard
                sa = math.sin(ang)  # +1 top, -1 bottom
                x_local = xc + rx * math.copysign(abs(ca) ** 0.80, ca) - 0.03 * (sa ** 2)
                z_local = zc + rz * math.copysign(abs(sa) ** 0.84, sa) - 0.045 * ca
                dy = -y_sweep_out * (0.5 * (ca + 1.0)) - y_sweep_bot * (0.5 * (1.0 - sa))
                ring.append((side * x_local, y + dy, z_local))
            if side < 0:
                ring.reverse()
            return ring

        intake_rings = []
        ring_mat_slots = []

        # 1. Deep S-duct interior (Slot 1 = dark duct interior, transitioning to Slot 0 = airframe grey near lip)
        s_duct_specs = [
            (-1.20, 0.25, 0.65, 1.18, 1.56, 0.00, 0.00, 1),
            (-0.20, 0.28, 0.74, 1.06, 1.60, 0.05, 0.04, 1),
            ( 0.85, 0.30, 0.82, 0.98, 1.64, 0.12, 0.08, 1),
            ( 1.75, 0.31, 0.86, 0.95, 1.66, 0.22, 0.14, 0),
            ( 2.38, 0.32, 0.85, 0.95, 1.66, 0.28, 0.18, 0),
            ( 2.58, 0.31, 0.84, 0.95, 1.67, 0.30, 0.20, 0),
        ]
        for sp in s_duct_specs:
            intake_rings.append(make_sculpted_intake_ring(*sp[:7]))
            ring_mat_slots.append(sp[7])

        # 2. Sharp Leading-Edge Intake Lip Apex at Y = +2.62m
        intake_rings.append(make_sculpted_intake_ring(2.62, 0.30, 0.86, 0.94, 1.68, 0.30, 0.20))
        ring_mat_slots.append(0)

        # 3. Outer Intake Nacelle Cowl marching continuously from the lip (Y=+2.56m) all the way to the rear fuselage (Y=-5.80m),
        # with recessed cutout over the main landing gear bay (Y=-2.30..-1.10m) so it never overhangs the wheel well!
        outer_cowl_specs = [
            ( 2.56, 0.28, 0.89, 0.92, 1.70, 0.30, 0.20, 0),
            ( 2.25, 0.26, 0.96, 0.90, 1.73, 0.24, 0.15, 0),
            ( 1.55, 0.23, 1.05, 0.88, 1.76, 0.12, 0.08, 0),
            ( 0.65, 0.22, 1.11, 0.88, 1.77, 0.00, 0.00, 0),
            (-0.40, 0.22, 1.12, 0.89, 1.77, 0.00, 0.00, 0),
            (-1.00, 0.22, 1.10, 0.92, 1.76, 0.00, 0.00, 0),
            # Over main gear bay (Y=-1.20 to -2.20m), z_bot rises to 1.16m so the recessed wheel well is completely open!
            (-1.25, 0.24, 1.06, 1.16, 1.75, 0.00, 0.00, 0),
            (-1.75, 0.24, 1.05, 1.16, 1.75, 0.00, 0.00, 0),
            (-2.20, 0.24, 1.04, 1.16, 1.74, 0.00, 0.00, 0),
            (-2.45, 0.22, 1.06, 0.93, 1.73, 0.00, 0.00, 0),
            (-3.60, 0.22, 1.02, 0.95, 1.70, 0.00, 0.00, 0),
            (-4.80, 0.24, 0.94, 1.02, 1.65, 0.00, 0.00, 0),
            (-5.80, 0.26, 0.82, 1.12, 1.60, 0.00, 0.00, 0),
        ]
        for sp in outer_cowl_specs:
            intake_rings.append(make_sculpted_intake_ring(*sp[:7]))
            ring_mat_slots.append(sp[7])

        intake_obj = loft_closed_profiles(f"Rafale_Sculpted_Intake_{side_name}", intake_rings,
                                          cap_start=True, cap_end=True, collection=coll,
                                          smooth=True, subsurf_levels=2, ring_materials=ring_mat_slots[:-1])
        intake_obj.data.materials.append(mats['airframe'])
        intake_obj.data.materials.append(mats['exhaust_inner'])

        # Boundary-layer diverter channel & upper splitter wedge between fuselage chine and intake lip
        splitter_verts = [
            (side * 0.24, 2.82, 1.10), (side * 0.30, 2.58, 1.00),
            (side * 0.30, 2.48, 1.66), (side * 0.24, 2.76, 1.68),
            (side * 0.20, 1.90, 1.00), (side * 0.30, 1.90, 1.00),
            (side * 0.30, 1.90, 1.66), (side * 0.20, 1.90, 1.66),
        ]
        splitter_faces = [
            (0, 1, 2, 3), (4, 7, 6, 5), (0, 4, 5, 1), (1, 5, 6, 2), (2, 6, 7, 3), (3, 7, 4, 0)
        ]
        splitter = create_mesh_obj(f"Rafale_Intake_Splitter_{side_name}", splitter_verts, splitter_faces,
                                   collection=coll, smooth=False, subsurf_levels=0)
        assign_mat(splitter, mats['sensor'])


# ==============================================================================
# COCKPIT, CANOPY, WINGS, CANARDS, TAIL & SEPARATED 3D CONTROL SURFACES
# ==============================================================================

def build_cockpit_and_canopy(coll, mats):
    # 1. Cockpit Tub / Coaming & Glare Shield (embedded flush inside the upper fuselage)
    coaming_verts = [
        (-0.34, 1.50, 1.92), (0.34, 1.50, 1.92), (0.28, 4.35, 1.88), (-0.28, 4.35, 1.88),
        (-0.30, 1.60, 2.08), (0.30, 1.60, 2.08), (0.20, 4.25, 2.01), (-0.20, 4.25, 2.01),
    ]
    coaming_faces = [
        (0, 1, 2, 3), (4, 7, 6, 5), (0, 4, 5, 1), (1, 5, 6, 2), (2, 6, 7, 3), (3, 7, 4, 0)
    ]
    coaming = create_mesh_obj("Rafale_Cockpit_Tub", coaming_verts, coaming_faces, collection=coll, smooth=True, subsurf_levels=1)
    assign_mat(coaming, mats['cockpit'])

    # 2. Martin-Baker Mk 16F Ejection Seat
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, 2.55, 2.16))
    seat_back = bpy.context.active_object
    seat_back.name = "Rafale_Ejection_Seat_Back"
    seat_back.scale = (0.22, 0.12, 0.40)
    seat_back.rotation_euler = (math.radians(-29), 0, 0)
    coll.objects.link(seat_back)
    bpy.context.scene.collection.objects.unlink(seat_back)
    assign_mat(seat_back, mats['cockpit'])

    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, 2.34, 2.45))
    headrest = bpy.context.active_object
    headrest.name = "Rafale_Ejection_Seat_Headbox"
    headrest.scale = (0.16, 0.14, 0.15)
    headrest.rotation_euler = (math.radians(-20), 0, 0)
    coll.objects.link(headrest)
    bpy.context.scene.collection.objects.unlink(headrest)
    assign_mat(headrest, mats['sensor'])

    # 3. Holographic HUD Combiner Glass
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, 3.68, 2.22))
    hud = bpy.context.active_object
    hud.name = "Rafale_HUD_Combiner"
    hud.scale = (0.12, 0.008, 0.11)
    hud.rotation_euler = (math.radians(42), 0, 0)
    coll.objects.link(hud)
    bpy.context.scene.collection.objects.unlink(hud)
    assign_mat(hud, mats['hud'])

    # 4. Gold-Tinted Teardrop Bubble Canopy Glass + Integrated Rear Metal Spine Fairing
    # Notice: Rear stations (Y = 0.85m to 1.45m) use material slot 1 (airframe_alt) and blend seamlessly into the dorsal spine at Z=2.28m!
    # Forward stations (Y = 1.45m to 4.58m) use material slot 0 (gold canopy glass) and sit flush inside the fuselage deck!
    canopy_specs = [
        # (y, z_sill, z_crown, hw, mat_slot)
        (0.85, 2.02, 2.28, 0.32, 1),
        (1.25, 2.02, 2.36, 0.36, 1),
        (1.45, 2.01, 2.44, 0.38, 0),
        (1.85, 2.00, 2.56, 0.41, 0),
        (2.40, 1.99, 2.64, 0.43, 0),
        (2.95, 1.98, 2.61, 0.41, 0),
        (3.55, 1.96, 2.46, 0.36, 0),
        (4.05, 1.93, 2.24, 0.28, 0),
        (4.42, 1.90, 2.04, 0.18, 0),
        (4.60, 1.88, 1.93, 0.07, 0),
    ]
    canopy_rings = []
    canopy_mats = [canopy_specs[r][4] for r in range(len(canopy_specs) - 1)]
    n_c = 28
    for y, z_sill, z_crown, hw, _ in canopy_specs:
        ring = []
        for i in range(n_c):
            theta = 2.0 * math.pi * i / n_c
            s = math.sin(theta)
            c = -math.cos(theta)
            if c < 0:
                x = s * hw * (1.0 + 0.20 * c)
                z = z_sill + 0.06 * c
            else:
                x = s * hw * ((1.0 - (c ** 1.65)) ** 0.48)
                z = z_sill + (z_crown - z_sill) * (c ** 0.78)
            ring.append((x, y, z))
        canopy_rings.append(ring)

    canopy_obj = loft_closed_profiles("Rafale_Canopy_Assembly", canopy_rings, cap_start=True, cap_end=True,
                                      collection=coll, smooth=True, subsurf_levels=2, ring_materials=canopy_mats)
    canopy_obj.data.materials.append(mats['canopy'])
    canopy_obj.data.materials.append(mats['airframe_alt'])

    # 5. Flush Canopy Sill Trim & Windshield Bow Frame (hugs the fuselage deck without overhanging!)
    arch_rings = []
    for dy in (-0.028, 0.028):
        y = 3.55 + dy
        z_sill = 1.96
        z_crown = 2.46
        hw = 0.36
        ring = []
        for i in range(24):
            theta = 2.0 * math.pi * i / 24
            s = math.sin(theta)
            c = -math.cos(theta)
            if c < 0:
                x = s * hw * 0.95
                z = z_sill - 0.02
            else:
                x = s * (hw + 0.006) * ((1.0 - (c ** 1.65)) ** 0.48)
                z = z_sill + (z_crown - z_sill + 0.006) * (c ** 0.78)
            ring.append((x, y, z))
        arch_rings.append(ring)
    arch_obj = loft_closed_profiles("Rafale_Canopy_Arch", arch_rings, cap_start=True, cap_end=True,
                                    collection=coll, smooth=True, subsurf_levels=1)
    assign_mat(arch_obj, mats['airframe_alt'])

    # 6. FSO (Front Sector Optronics) Turret ahead of windshield
    bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=16, radius=0.065, location=(0.11, 4.66, 1.95))
    fso_ball = bpy.context.active_object
    fso_ball.name = "Rafale_FSO_Optronics"
    coll.objects.link(fso_ball)
    bpy.context.scene.collection.objects.unlink(fso_ball)
    assign_mat(fso_ball, mats['sensor'])

    # 7. Fixed In-Flight Refueling (IFR) Probe on Starboard side
    ifr_stations = [
        (0.38, 3.25, 1.82, 0.040),
        (0.43, 3.65, 1.87, 0.036),
        (0.45, 4.15, 1.93, 0.030),
        (0.44, 4.70, 1.96, 0.026),
        (0.43, 5.05, 1.97, 0.020),
        (0.43, 5.18, 1.97, 0.026),
        (0.43, 5.28, 1.97, 0.012),
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


def build_wings_and_canards(coll, mats):
    """
    Builds the compound delta wings with separated 3D control-surface geometry and crisp spanwise edges:
      1. Main Wing Torque Box (u = 0.00 to 0.835)
      2. Leading-Edge Slat (u = 0.00 to 0.125)
      3. Inner Elevon (u = 0.838 to 1.00, static hydraulic droop -2.2 deg)
      4. Outer Elevon (u = 0.838 to 1.00, static hydraulic droop -1.8 deg)
      5. Close-coupled forward canards & wingtip MICA launcher rails
    """
    for side in (-1.0, 1.0):
        side_name = "R" if side > 0 else "L"

        # 1. Main Delta Wing Torque Box
        wing_box_stations = [
            {'le': (side * 0.55,  1.05, 1.62), 'chord': 7.05, 't_ratio': 0.052, 'camber': 0.012, 'twist_deg':  0.5},
            {'le': (side * 1.05,  0.30, 1.60), 'chord': 6.35, 't_ratio': 0.049, 'camber': 0.014, 'twist_deg':  0.2},
            {'le': (side * 1.45, -0.55, 1.58), 'chord': 5.55, 't_ratio': 0.045, 'camber': 0.014, 'twist_deg':  0.0},
            {'le': (side * 2.50, -1.75, 1.54), 'chord': 4.42, 't_ratio': 0.042, 'camber': 0.013, 'twist_deg': -0.5},
            {'le': (side * 3.80, -3.22, 1.50), 'chord': 3.02, 't_ratio': 0.038, 'camber': 0.011, 'twist_deg': -1.2},
            {'le': (side * 4.95, -4.52, 1.46), 'chord': 1.78, 't_ratio': 0.035, 'camber': 0.008, 'twist_deg': -1.8},
            {'le': (side * 5.32, -4.95, 1.45), 'chord': 1.40, 't_ratio': 0.033, 'camber': 0.005, 'twist_deg': -2.0},
        ]
        st_box = list(reversed(wing_box_stations)) if side < 0 else wing_box_stations
        wing_obj = build_airfoil_slice(
            f"Rafale_Delta_Wing_Box_{side_name}", st_box,
            u_min=0.0, u_max=0.835, deflect_deg=0.0,
            collection=coll, smooth=True, subsurf_levels=1,
            cap_start=(side < 0), cap_end=(side > 0)
        )
        assign_mat(wing_obj, mats['airframe'])

        # 2. Separated 3D Leading-Edge Slats
        slat_stations = [
            {'le': (side * 1.38, -0.42, 1.582), 'chord': 5.62, 't_ratio': 0.046, 'camber': 0.014, 'twist_deg':  0.0},
            {'le': (side * 2.50, -1.75, 1.542), 'chord': 4.42, 't_ratio': 0.043, 'camber': 0.013, 'twist_deg': -0.5},
            {'le': (side * 3.80, -3.22, 1.502), 'chord': 3.02, 't_ratio': 0.039, 'camber': 0.011, 'twist_deg': -1.2},
            {'le': (side * 5.22, -4.82, 1.454), 'chord': 1.52, 't_ratio': 0.034, 'camber': 0.006, 'twist_deg': -1.9},
        ]
        st_slat = list(reversed(slat_stations)) if side < 0 else slat_stations
        slat_obj = build_airfoil_slice(
            f"Rafale_LE_Slat_{side_name}", st_slat,
            u_min=0.0, u_max=0.125, deflect_deg=1.8,
            collection=coll, smooth=True, subsurf_levels=1,
            cap_start=False, cap_end=False
        )
        assign_mat(slat_obj, mats['airframe_alt'])

        # 3. Separated 3D Inner Elevon (crisp spanwise ends with cap_start=False, cap_end=False)
        inner_elev_stations = [
            {'le': (side * 1.06,  0.26, 1.60), 'chord': 6.32, 't_ratio': 0.049, 'camber': 0.014, 'twist_deg':  0.2},
            {'le': (side * 2.10, -1.28, 1.56), 'chord': 4.86, 't_ratio': 0.044, 'camber': 0.013, 'twist_deg': -0.3},
            {'le': (side * 3.13, -2.46, 1.52), 'chord': 3.74, 't_ratio': 0.040, 'camber': 0.012, 'twist_deg': -0.8},
        ]
        st_ie = list(reversed(inner_elev_stations)) if side < 0 else inner_elev_stations
        ie_obj = build_airfoil_slice(
            f"Rafale_Inner_Elevon_{side_name}", st_ie,
            u_min=0.838, u_max=1.00, deflect_deg=-2.2,
            collection=coll, smooth=True, subsurf_levels=1,
            cap_start=False, cap_end=False
        )
        assign_mat(ie_obj, mats['airframe_alt'])

        # 4. Separated 3D Outer Elevon (only 8mm spanwise clearance from inner elevon so there is no triangular gap!)
        outer_elev_stations = [
            {'le': (side * 3.14, -2.47, 1.52), 'chord': 3.73, 't_ratio': 0.040, 'camber': 0.012, 'twist_deg': -0.8},
            {'le': (side * 4.20, -3.68, 1.48), 'chord': 2.58, 't_ratio': 0.037, 'camber': 0.010, 'twist_deg': -1.4},
            {'le': (side * 5.25, -4.87, 1.45), 'chord': 1.47, 't_ratio': 0.034, 'camber': 0.006, 'twist_deg': -1.9},
        ]
        st_oe = list(reversed(outer_elev_stations)) if side < 0 else outer_elev_stations
        oe_obj = build_airfoil_slice(
            f"Rafale_Outer_Elevon_{side_name}", st_oe,
            u_min=0.838, u_max=1.00, deflect_deg=-1.8,
            collection=coll, smooth=True, subsurf_levels=1,
            cap_start=False, cap_end=False
        )
        assign_mat(oe_obj, mats['airframe_alt'])

        # 5. Wingtip MICA Launch Rail & SPECTRA Wingtip Sensor Pods
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
        assign_mat(rail_obj, mats['airframe_alt'])

        # 6. Underwing Elevon Hydraulic Actuator Fairings
        for idx, x_f in enumerate((1.85, 3.13, 4.25), 1):
            y_te = -5.45 - (x_f - 1.5) * 0.05
            z_w = 1.54 - (x_f - 1.5) * 0.025
            f_rings = []
            for dy, r_x, r_z, dz in [(-0.35, 0.010, 0.012, 0.0), (-0.05, 0.026, 0.034, -0.016),
                                     (0.35, 0.028, 0.038, -0.020), (0.75, 0.010, 0.012, 0.0)]:
                ring = []
                for i in range(10):
                    ang = 2.0 * math.pi * i / 10
                    ring.append((side * x_f + r_x * math.cos(ang), y_te + dy, z_w + dz + r_z * math.sin(ang)))
                f_rings.append(ring)
            f_obj = loft_closed_profiles(f"Rafale_Actuator_Fairing_{side_name}_{idx}", f_rings,
                                         cap_start=True, cap_end=True, collection=coll, smooth=True, subsurf_levels=1)
            assign_mat(f_obj, mats['airframe'])

        # 7. Close-Coupled Forward All-Moving Canards
        canard_stations = [
            {'le': (side * 0.68, 2.38, 1.98), 'chord': 1.48, 't_ratio': 0.044, 'camber': 0.008, 'twist_deg': -2.5},
            {'le': (side * 1.40, 1.72, 2.07), 'chord': 1.12, 't_ratio': 0.041, 'camber': 0.006, 'twist_deg': -2.5},
            {'le': (side * 2.15, 1.02, 2.17), 'chord': 0.72, 't_ratio': 0.038, 'camber': 0.004, 'twist_deg': -2.5},
            {'le': (side * 2.56, 0.62, 2.23), 'chord': 0.42, 't_ratio': 0.034, 'camber': 0.002, 'twist_deg': -2.5},
        ]
        st_can = list(reversed(canard_stations)) if side < 0 else canard_stations
        canard_obj = build_airfoil_slice(
            f"Rafale_Canard_{side_name}", st_can,
            u_min=0.0, u_max=1.0, deflect_deg=0.0,
            collection=coll, smooth=True, subsurf_levels=1,
            cap_start=(side < 0), cap_end=(side > 0)
        )
        assign_mat(canard_obj, mats['airframe_alt'])

        bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.072, depth=0.32,
                                            location=(side * 0.66, 1.55, 1.98),
                                            rotation=(0, math.radians(82 * side), 0))
        spindle = bpy.context.active_object
        spindle.name = f"Rafale_Canard_Spindle_{side_name}"
        coll.objects.link(spindle)
        bpy.context.scene.collection.objects.unlink(spindle)
        assign_mat(spindle, mats['exhaust'])


def build_vertical_tail(coll, mats):
    """
    Builds the swept vertical stabilizer with:
      1. Main Fin Torque Box (u = 0.00 to 0.738)
      2. Separated 3D Rudder Control Surface (u = 0.740 to 1.00) with a tight 5mm hinge line gap so sky never leaks through!
      3. Internal Cylindrical Rudder Hinge Spar Tube inside the 5mm seam
      4. Fin-Root Heat Exchanger Ram Air Scoop & SPECTRA Top Fin Pod
    """
    tail_stations = [
        {'le': (0.0, -3.35, 1.95), 'chord': 3.55, 't_ratio': 0.056, 'camber': 0.0, 'twist_deg': 0.0, 'vertical': True},
        {'le': (0.0, -3.65, 2.25), 'chord': 3.25, 't_ratio': 0.052, 'camber': 0.0, 'twist_deg': 0.0, 'vertical': True},
        {'le': (0.0, -4.35, 2.95), 'chord': 2.68, 't_ratio': 0.048, 'camber': 0.0, 'twist_deg': 0.0, 'vertical': True},
        {'le': (0.0, -5.20, 3.85), 'chord': 1.95, 't_ratio': 0.044, 'camber': 0.0, 'twist_deg': 0.0, 'vertical': True},
        {'le': (0.0, -5.95, 4.65), 'chord': 1.32, 't_ratio': 0.040, 'camber': 0.0, 'twist_deg': 0.0, 'vertical': True},
        {'le': (0.0, -6.48, 5.22), 'chord': 0.90, 't_ratio': 0.036, 'camber': 0.0, 'twist_deg': 0.0, 'vertical': True},
    ]
    # 1. Main Vertical Fin Box (u = 0.0 to 0.738)
    fin_box = build_airfoil_slice(
        "Rafale_Vertical_Tail_Box", tail_stations,
        u_min=0.0, u_max=0.738, deflect_deg=0.0,
        collection=coll, smooth=True, subsurf_levels=1,
        cap_start=False, cap_end=False
    )
    assign_mat(fin_box, mats['airframe'])

    # 2. Separated 3D Rudder Control Surface (from Z=2.18m to Z=5.18m, u = 0.740 to 1.00)
    rudder_stations = [
        {'le': (0.0, -3.58, 2.18), 'chord': 3.32, 't_ratio': 0.053, 'camber': 0.0, 'twist_deg': 0.0, 'vertical': True},
        {'le': (0.0, -4.35, 2.95), 'chord': 2.68, 't_ratio': 0.048, 'camber': 0.0, 'twist_deg': 0.0, 'vertical': True},
        {'le': (0.0, -5.20, 3.85), 'chord': 1.95, 't_ratio': 0.044, 'camber': 0.0, 'twist_deg': 0.0, 'vertical': True},
        {'le': (0.0, -5.95, 4.65), 'chord': 1.32, 't_ratio': 0.040, 'camber': 0.0, 'twist_deg': 0.0, 'vertical': True},
        {'le': (0.0, -6.44, 5.18), 'chord': 0.94, 't_ratio': 0.036, 'camber': 0.0, 'twist_deg': 0.0, 'vertical': True},
    ]
    rudder_obj = build_airfoil_slice(
        "Rafale_Vertical_Rudder", rudder_stations,
        u_min=0.740, u_max=1.00, deflect_deg=1.2,
        collection=coll, smooth=True, subsurf_levels=1,
        cap_start=False, cap_end=False
    )
    assign_mat(rudder_obj, mats['airframe_alt'])

    # 3. Internal Rudder Hinge Spar Tube along the hinge line (prevents any sky light from passing through the 5mm hinge seam!)
    spar_rings = []
    for st in rudder_stations:
        y_hinge = st['le'][1] - 0.739 * st['chord']
        z_hinge = st['le'][2]
        r_spar = 0.32 * st['chord'] * st['t_ratio']
        ring = []
        for i in range(16):
            ang = 2.0 * math.pi * i / 16
            ring.append((r_spar * math.cos(ang), y_hinge + r_spar * math.sin(ang), z_hinge))
        spar_rings.append(ring)
    spar_obj = loft_closed_profiles("Rafale_Rudder_Hinge_Spar", spar_rings, cap_start=True, cap_end=True,
                                    collection=coll, smooth=True, subsurf_levels=0)
    assign_mat(spar_obj, mats['sensor'])

    # 4. Fin-Root Heat Exchanger Ram Air Scoop
    scoop_rings = []
    for y, rx, rz, zc in [(-4.40, 0.10, 0.09, 2.22), (-3.65, 0.12, 0.12, 2.26),
                          (-3.32, 0.09, 0.10, 2.26), (-3.38, 0.06, 0.07, 2.26)]:
        ring = []
        for i in range(14):
            ang = 2.0 * math.pi * i / 14
            ring.append((rx * math.cos(ang), y, zc + rz * math.sin(ang)))
        scoop_rings.append(ring)
    scoop_obj = loft_closed_profiles("Rafale_Tail_Root_Scoop", scoop_rings,
                                     cap_start=True, cap_end=True, collection=coll, smooth=True, subsurf_levels=1)
    assign_mat(scoop_obj, mats['airframe'])

    # 5. Top Fin Tip SPECTRA EW Pod
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

    # 6. Rear Parachute / ECM Fairing under the tail root
    ddm_stations = [
        (-7.58, 2.08, 0.02, 0.02),
        (-7.35, 2.08, 0.09, 0.08),
        (-6.75, 2.08, 0.11, 0.10),
        (-6.20, 2.08, 0.06, 0.06),
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
    assign_mat(ddm_obj, mats['airframe_alt'])


# ==============================================================================
# RECESSED EXHAUSTS & DETAILED LANDING GEAR + WHEEL WELLS
# ==============================================================================

def build_recessed_exhausts(coll, mats):
    n_petals = 18
    for side in (-1.0, 1.0):
        side_name = "R" if side > 0 else "L"
        xc = side * 0.415
        zc = 1.54

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

        petal_verts = []
        petal_faces = []
        for p in range(n_petals):
            ang_c = 2.0 * math.pi * p / n_petals
            d_ang = (2.0 * math.pi / n_petals) * 0.53
            ang_L = ang_c - d_ang
            ang_R = ang_c + d_ang

            stations_p = [
                (-7.15, 0.342, 0.010),
                (-7.38, 0.318, 0.014),
                (-7.52, 0.298, 0.012),
                (-7.62, 0.284, 0.008),
            ]
            thick = 0.014
            base_idx = len(petal_verts)

            for yp, r_base, rib_h in stations_p:
                r_L = r_base
                r_C = r_base + rib_h
                r_R = r_base + 0.004
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

            b_end = base_idx + (len(stations_p) - 1) * 6
            petal_faces.append((b_end + 0, b_end + 1, b_end + 4, b_end + 5))
            petal_faces.append((b_end + 1, b_end + 2, b_end + 3, b_end + 4))

        petals_obj = create_mesh_obj(f"Rafale_Exhaust_Petals_{side_name}", petal_verts, petal_faces,
                                     collection=coll, smooth=True, subsurf_levels=0)
        assign_mat(petals_obj, mats['exhaust'])

        bpy.ops.mesh.primitive_torus_add(major_radius=0.332, minor_radius=0.012,
                                         major_segments=36, minor_segments=10,
                                         location=(xc, -7.36, zc), rotation=(math.radians(90), 0, 0))
        comp_ring = bpy.context.active_object
        comp_ring.name = f"Rafale_Exhaust_Ring_{side_name}"
        coll.objects.link(comp_ring)
        bpy.context.scene.collection.objects.unlink(comp_ring)
        assign_mat(comp_ring, mats['exhaust'])

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
    cx, cy, cz = loc
    hw = tire_width * 0.5
    r_rim = tire_radius * 0.52

    tire_section = [
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
    n_seg = 48
    for dx, rad in tire_section:
        ring = []
        is_sidewall = abs(dx) > hw * 0.80
        for i in range(n_seg):
            ang = 2.0 * math.pi * i / n_seg
            y = cy + rad * math.cos(ang)
            z = cz + rad * math.sin(ang)
            if z < 0.022:
                ground_prox = max(0.0, (0.022 - z) / 0.022)
                z = max(0.0005, z * 0.12)
                if is_sidewall:
                    dx_bulge = math.copysign(hw * 0.09 * (ground_prox ** 0.7), dx)
                else:
                    dx_bulge = 0.0
            elif z < 0.10 and is_sidewall:
                ground_prox = max(0.0, (0.10 - z) / 0.10)
                dx_bulge = math.copysign(hw * 0.06 * (ground_prox ** 1.2), dx)
            else:
                dx_bulge = 0.0
            ring.append((cx + dx + dx_bulge, y, z))
        tire_rings.append(ring)
    tire_rings.append(tire_rings[0])

    tire_obj = loft_closed_profiles(f"{name}_Tire", tire_rings, cap_start=False, cap_end=False,
                                    collection=coll, smooth=True, subsurf_levels=1)
    assign_mat(tire_obj, mats['tire'])

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

    n_bolts = 10
    r_bolt_circle = r_rim * 0.60
    for b in range(n_bolts):
        ang = 2.0 * math.pi * b / n_bolts
        by = cy + r_bolt_circle * math.cos(ang)
        bz = cz + r_bolt_circle * math.sin(ang)
        bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=tire_radius * 0.030, depth=tire_width * 0.72,
                                            location=(cx, by, bz), rotation=(0, math.radians(90), 0))
        bolt = bpy.context.active_object
        bolt.name = f"{name}_Bolt_{b}"
        coll.objects.link(bolt)
        bpy.context.scene.collection.objects.unlink(bolt)
        assign_mat(bolt, mats['chrome'])


def add_cylinder_between(name, p1, p2, radius, coll, mat, vertices=24, clevis_ends=False):
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
    for poly in obj.data.polygons:
        poly.use_smooth = True
    up = Vector((0, 0, 1))
    rot_quat = up.rotation_difference(diff.normalized())
    obj.rotation_mode = 'QUATERNION'
    obj.rotation_quaternion = rot_quat
    obj.rotation_mode = 'XYZ'
    coll.objects.link(obj)
    bpy.context.scene.collection.objects.unlink(obj)
    assign_mat(obj, mat)

    if clevis_ends:
        for idx, pt in enumerate((v1, v2)):
            bpy.ops.mesh.primitive_cylinder_add(vertices=20, radius=radius * 1.32, depth=radius * 2.2,
                                                location=pt, rotation=(0, math.radians(90), 0))
            joint = bpy.context.active_object
            joint.name = f"{name}_Joint_{idx}"
            for poly in joint.data.polygons:
                poly.use_smooth = True
            coll.objects.link(joint)
            bpy.context.scene.collection.objects.unlink(joint)
            assign_mat(joint, mat)
    return obj


def build_serrated_gear_door(name, corner_pts, thickness, serration_amp, n_teeth, coll, mat):
    p0, p1, p2, p3 = [Vector(p) for p in corner_pts]
    n_steps = n_teeth * 2
    verts = []
    faces = []

    normal = (p1 - p0).cross(p3 - p0).normalized()
    offset_vec = normal * thickness

    for i in range(n_steps + 1):
        t = i / n_steps
        top_pt = p0.lerp(p1, t)
        bot_pt = p3.lerp(p2, t)
        tooth = serration_amp if (i % 2 == 1) else 0.0
        bot_dir = (bot_pt - top_pt).normalized()
        bot_pt = bot_pt + bot_dir * tooth

        verts.append(tuple(top_pt))
        verts.append(tuple(bot_pt))
        verts.append(tuple(bot_pt + offset_vec))
        verts.append(tuple(top_pt + offset_vec))

    for i in range(n_steps):
        b1 = i * 4
        b2 = (i + 1) * 4
        for k in range(4):
            nk = (k + 1) % 4
            faces.append((b1 + k, b1 + nk, b2 + nk, b2 + k))
    faces.append((0, 3, 2, 1))
    b_last = n_steps * 4
    faces.append((b_last, b_last + 1, b_last + 2, b_last + 3))

    door_obj = create_mesh_obj(name, verts, faces, collection=coll, smooth=False, subsurf_levels=0)
    assign_mat(door_obj, mat)
    return door_obj


def build_landing_gear(coll, mats):
    """
    Builds detailed Messier-Dowty nose and main landing gear with recessed wheel-well ribs
    tucked strictly inside the hull cavity, smooth-shaded hydraulic cylinders and clevis joints,
    braided hydraulic brake lines, and weighted tire contact on Z = 0.0.
    """
    # --- 1. RECESSED NOSE WHEEL WELL & NOSE LANDING GEAR (Y = +3.90m) ---
    ny = 3.90
    nr = 0.215
    nz_c = 0.208

    # Nose Wheel Well Interior Transverse Ribs (tucked inside the recessed cavity X in [-0.14, 0.14], Z = 1.15m)
    for y_rib in (3.70, 3.90, 4.10, 4.30, 4.48):
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, y_rib, 1.16))
        rib = bpy.context.active_object
        rib.name = f"Rafale_Nose_Bay_Rib_{int(y_rib*100)}"
        rib.scale = (0.14, 0.018, 0.08)
        coll.objects.link(rib)
        bpy.context.scene.collection.objects.unlink(rib)
        assign_mat(rib, mats['gear_strut'])

    create_wheel_and_tire("Rafale_Nose_Wheel_L", (-0.118, ny, nz_c), nr, 0.11, coll, mats)
    create_wheel_and_tire("Rafale_Nose_Wheel_R", ( 0.118, ny, nz_c), nr, 0.11, coll, mats)

    add_cylinder_between("Rafale_Nose_Axle", (-0.15, ny, nz_c), (0.15, ny, nz_c), 0.032, coll, mats['chrome'], clevis_ends=True)
    add_cylinder_between("Rafale_Nose_Oleo", (0.0, ny, nz_c), (0.0, ny + 0.03, 0.55), 0.040, coll, mats['chrome'], clevis_ends=True)
    add_cylinder_between("Rafale_Nose_Strut_Upper", (0.0, ny + 0.03, 0.52), (0.0, ny + 0.14, 1.22), 0.056, coll, mats['gear_strut'], clevis_ends=True)

    for z_flange, rad_f in [(0.53, 0.070), (0.76, 0.078), (0.94, 0.072)]:
        y_f = ny + 0.03 + (z_flange - 0.52) * 0.15
        bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=rad_f, depth=0.042,
                                            location=(0.0, y_f, z_flange), rotation=(math.radians(-9), 0, 0))
        fl = bpy.context.active_object
        fl.name = f"Rafale_Nose_Collar_{int(z_flange*100)}"
        for poly in fl.data.polygons:
            poly.use_smooth = True
        coll.objects.link(fl)
        bpy.context.scene.collection.objects.unlink(fl)
        assign_mat(fl, mats['gear_strut'])

    for sx in (-0.062, 0.062):
        add_cylinder_between(f"Rafale_Nose_Steer_Cyl_{'R' if sx>0 else 'L'}",
                             (sx, ny + 0.08, 0.78), (sx * 0.5, ny - 0.08, 0.62), 0.016, coll, mats['chrome'], clevis_ends=True)

    knee_n = (0.0, ny + 0.36, 0.90)
    add_cylinder_between("Rafale_Nose_Drag_Lower", (0.0, ny + 0.07, 0.66), knee_n, 0.026, coll, mats['gear_strut'], clevis_ends=True)
    add_cylinder_between("Rafale_Nose_Drag_Upper", knee_n, (0.0, ny + 0.62, 1.20), 0.028, coll, mats['gear_strut'], clevis_ends=True)
    add_cylinder_between("Rafale_Nose_Retract_Body", (0.0, ny + 0.56, 1.18), (0.0, ny + 0.26, 0.94), 0.024, coll, mats['gear_strut'])
    add_cylinder_between("Rafale_Nose_Retract_Rod", (0.0, ny + 0.26, 0.94), (0.0, ny + 0.09, 0.72), 0.015, coll, mats['chrome'], clevis_ends=True)

    add_cylinder_between("Rafale_Nose_Torque_Lower", (0.0, ny + 0.01, 0.25), (0.0, ny - 0.17, 0.39), 0.018, coll, mats['gear_strut'], clevis_ends=True)
    add_cylinder_between("Rafale_Nose_Torque_Upper", (0.0, ny - 0.17, 0.39), (0.0, ny + 0.04, 0.54), 0.018, coll, mats['gear_strut'], clevis_ends=True)

    for hp1, hp2 in [
        ((0.046, ny + 0.15, 1.16), (0.052, ny + 0.06, 0.75)),
        ((0.052, ny + 0.06, 0.75), (0.042, ny - 0.06, 0.42)),
        ((0.042, ny - 0.06, 0.42), (0.036, ny, 0.24)),
    ]:
        add_cylinder_between("Rafale_Nose_Hyd_Line", hp1, hp2, 0.007, coll, mats['hydraulic'])

    for lx in (-0.070, 0.070):
        bpy.ops.mesh.primitive_cylinder_add(vertices=20, radius=0.034, depth=0.048,
                                            location=(lx, ny + 0.11, 0.62), rotation=(math.radians(90), 0, 0))
        light_housing = bpy.context.active_object
        light_housing.name = f"Rafale_Nose_Gear_Light_{'R' if lx > 0 else 'L'}"
        for poly in light_housing.data.polygons:
            poly.use_smooth = True
        coll.objects.link(light_housing)
        bpy.context.scene.collection.objects.unlink(light_housing)
        assign_mat(light_housing, mats['gear_strut'])

    for side in (-1.0, 1.0):
        side_name = "R" if side > 0 else "L"
        c_pts = [
            (side * 0.20, 3.62, 1.02),
            (side * 0.19, 4.52, 1.04),
            (side * 0.25, 4.48, 0.78),
            (side * 0.26, 3.66, 0.76),
        ]
        if side < 0:
            c_pts = [c_pts[1], c_pts[0], c_pts[3], c_pts[2]]
        build_serrated_gear_door(f"Rafale_Nose_Gear_Door_{side_name}", c_pts,
                                 thickness=0.014, serration_amp=0.024, n_teeth=5, coll=coll, mat=mats['airframe_alt'])
        add_cylinder_between(f"Rafale_Nose_Door_Strut_{side_name}",
                             (side * 0.15, 4.05, 1.10), (side * 0.21, 4.05, 0.88), 0.008, coll, mats['chrome'])

    # --- 2. RECESSED MAIN WHEEL WELLS & MAIN LANDING GEAR (Y = -1.80m, X = ±1.20m) ---
    my = -1.80
    mr = 0.385
    mz_c = 0.372

    for side in (-1.0, 1.0):
        side_name = "R" if side > 0 else "L"
        mx = side * 1.20

        # Main Wheel Well Internal Structural Bulkheads (tucked cleanly inside the recessed bay X in [0.46, 0.78], Z = 1.12m)
        for y_mb in (-2.15, -1.88, -1.60, -1.32):
            bpy.ops.mesh.primitive_cube_add(size=1.0, location=(side * 0.62, y_mb, 1.12))
            mrib = bpy.context.active_object
            mrib.name = f"Rafale_Main_Bay_Rib_{side_name}_{int(abs(y_mb)*100)}"
            mrib.scale = (0.16, 0.022, 0.09)
            coll.objects.link(mrib)
            bpy.context.scene.collection.objects.unlink(mrib)
            assign_mat(mrib, mats['gear_strut'])

        create_wheel_and_tire(f"Rafale_Main_Wheel_{side_name}", (mx, my, mz_c), mr, 0.25, coll, mats)

        bpy.ops.mesh.primitive_cylinder_add(vertices=28, radius=mr * 0.45, depth=0.14,
                                            location=(side * 1.08, my, mz_c), rotation=(0, math.radians(90), 0))
        brake_pack = bpy.context.active_object
        brake_pack.name = f"Rafale_Main_Brake_Pack_{side_name}"
        for poly in brake_pack.data.polygons:
            poly.use_smooth = True
        coll.objects.link(brake_pack)
        bpy.context.scene.collection.objects.unlink(brake_pack)
        assign_mat(brake_pack, mats['exhaust'])

        for ang_deg in (30, 90, 150, 210, 270, 330):
            ang = math.radians(ang_deg)
            cy_p = my + (mr * 0.36) * math.cos(ang)
            cz_p = mz_c + (mr * 0.36) * math.sin(ang)
            bpy.ops.mesh.primitive_cylinder_add(vertices=14, radius=0.024, depth=0.17,
                                                location=(side * 1.07, cy_p, cz_p), rotation=(0, math.radians(90), 0))
            cal = bpy.context.active_object
            cal.name = f"Rafale_Brake_Caliper_{side_name}_{ang_deg}"
            for poly in cal.data.polygons:
                poly.use_smooth = True
            coll.objects.link(cal)
            bpy.context.scene.collection.objects.unlink(cal)
            assign_mat(cal, mats['chrome'])

        knuckle = (side * 1.01, my + 0.05, 0.41)
        forward_knee = (side * 0.94, my + 0.34, 0.60)
        strut_lower = (side * 0.87, my + 0.16, 0.72)
        top_trunnion = (side * 0.66, my + 0.30, 1.20)

        add_cylinder_between(f"Rafale_Main_Axle_{side_name}",
                             (side * 1.00, my, mz_c), (side * 1.28, my, mz_c), 0.050, coll, mats['chrome'], clevis_ends=True)
        add_cylinder_between(f"Rafale_Main_Trailing_Link_{side_name}",
                             knuckle, forward_knee, 0.052, coll, mats['gear_strut'], clevis_ends=True)

        add_cylinder_between(f"Rafale_Main_Oleo_Piston_{side_name}",
                             knuckle, strut_lower, 0.044, coll, mats['chrome'], clevis_ends=True)
        add_cylinder_between(f"Rafale_Main_Shock_Cylinder_{side_name}",
                             strut_lower, (side * 0.74, my + 0.25, 1.05), 0.060, coll, mats['gear_strut'], clevis_ends=True)

        add_cylinder_between(f"Rafale_Main_Upper_Post_{side_name}",
                             forward_knee, top_trunnion, 0.068, coll, mats['gear_strut'], clevis_ends=True)

        side_knee = (side * 0.68, my + 0.44, 0.92)
        add_cylinder_between(f"Rafale_Main_Side_Brace_Low_{side_name}",
                             (side * 0.86, my + 0.18, 0.74), side_knee, 0.032, coll, mats['gear_strut'], clevis_ends=True)
        add_cylinder_between(f"Rafale_Main_Side_Brace_Up_{side_name}",
                             side_knee, (side * 0.48, my + 0.68, 1.16), 0.034, coll, mats['gear_strut'], clevis_ends=True)
        add_cylinder_between(f"Rafale_Main_Retract_Cyl_{side_name}",
                             (side * 0.46, my + 0.24, 1.14), (side * 0.72, my + 0.20, 0.94), 0.030, coll, mats['gear_strut'])
        add_cylinder_between(f"Rafale_Main_Retract_Rod_{side_name}",
                             (side * 0.72, my + 0.20, 0.94), (side * 0.86, my + 0.18, 0.76), 0.018, coll, mats['chrome'], clevis_ends=True)

        add_cylinder_between(f"Rafale_Main_Rear_Brace_{side_name}",
                             (side * 0.80, my + 0.22, 0.86), (side * 0.56, my - 0.34, 1.14), 0.030, coll, mats['gear_strut'], clevis_ends=True)

        for h_off in (-0.025, 0.025):
            for hp1, hp2 in [
                ((side * 0.68, my + 0.32 + h_off, 1.16), (side * 0.92, my + 0.34 + h_off, 0.62)),
                ((side * 0.92, my + 0.34 + h_off, 0.62), (side * 1.03, my + 0.08 + h_off, 0.42)),
                ((side * 1.03, my + 0.08 + h_off, 0.42), (side * 1.06, my + h_off, mz_c + 0.08)),
            ]:
                add_cylinder_between(f"Rafale_Main_Hyd_Hose_{side_name}", hp1, hp2, 0.008, coll, mats['hydraulic'])

        out_pts = [
            (side * 0.98, my - 0.35, 1.02),
            (side * 0.98, my + 0.62, 1.02),
            (side * 1.08, my + 0.58, 0.64),
            (side * 1.08, my - 0.32, 0.64),
        ]
        if side < 0:
            out_pts = [out_pts[1], out_pts[0], out_pts[3], out_pts[2]]
        build_serrated_gear_door(f"Rafale_Main_Gear_Door_Out_{side_name}", out_pts,
                                 thickness=0.015, serration_amp=0.030, n_teeth=6, coll=coll, mat=mats['airframe_alt'])

        in_pts = [
            (side * 0.36, my - 0.38, 0.94),
            (side * 0.36, my + 0.68, 0.94),
            (side * 0.44, my + 0.64, 0.62),
            (side * 0.44, my - 0.34, 0.62),
        ]
        if side > 0:
            in_pts = [in_pts[1], in_pts[0], in_pts[3], in_pts[2]]
        build_serrated_gear_door(f"Rafale_Main_Gear_Door_In_{side_name}", in_pts,
                                 thickness=0.014, serration_amp=0.026, n_teeth=6, coll=coll, mat=mats['airframe_alt'])
        add_cylinder_between(f"Rafale_Main_Door_Strut_{side_name}",
                             (side * 0.46, my + 0.15, 1.06), (side * 0.40, my + 0.15, 0.76), 0.010, coll, mats['chrome'])


def build_apron_environment(coll, mats):
    bpy.ops.mesh.primitive_plane_add(size=260.0, location=(0.0, 0.0, 0.0))
    apron = bpy.context.active_object
    apron.name = "Concrete_Apron"
    coll.objects.link(apron)
    bpy.context.scene.collection.objects.unlink(apron)
    assign_mat(apron, mats['apron'])

    bpy.ops.mesh.primitive_plane_add(size=1.0, location=(0.0, 2.0, 0.0012))
    taxi_line = bpy.context.active_object
    taxi_line.name = "Apron_Taxi_Line"
    taxi_line.scale = (0.18, 36.0, 1.0)
    coll.objects.link(taxi_line)
    bpy.context.scene.collection.objects.unlink(taxi_line)
    assign_mat(taxi_line, mats['marking'])

    bpy.ops.mesh.primitive_plane_add(size=1.0, location=(0.0, 3.90, 0.0015))
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
    world = bpy.data.worlds.new("LateAfternoon_World")
    scene.world = world
    tree = world.node_tree
    nodes = tree.nodes
    links = tree.links
    nodes.clear()

    out = nodes.new("ShaderNodeOutputWorld")
    bg = nodes.new("ShaderNodeBackground")
    bg.inputs["Strength"].default_value = 0.44
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
        sky.sun_elevation = math.radians(6.8)
    if hasattr(sky, "sun_rotation"):
        sky.sun_rotation = math.radians(135.0)
    if hasattr(sky, "air_density"):
        sky.air_density = 1.65
    if hasattr(sky, "aerosol_density"):
        sky.aerosol_density = 2.35
    if hasattr(sky, "ozone_density"):
        sky.ozone_density = 1.80

    links.new(sky.outputs["Color"], bg.inputs["Color"])

    sun_data = bpy.data.lights.new(name="LateAfternoon_Sun", type='SUN')
    sun_data.energy = 6.8
    sun_data.color = (1.0, 0.62, 0.30)
    if hasattr(sun_data, "angle"):
        sun_data.angle = math.radians(0.85)

    sun_obj = bpy.data.objects.new("LateAfternoon_Sun", sun_data)
    scene.collection.objects.link(sun_obj)
    sun_obj.rotation_euler = (math.radians(79.5), math.radians(6.0), math.radians(-128.0))

    fill_data = bpy.data.lights.new(name="Sky_Bounce_Fill", type='AREA')
    fill_data.energy = 115.0
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
    scene.view_settings.exposure = -0.22


def main():
    mode, outdir = parse_args()
    scene = reset_scene()

    rafale_coll = bpy.data.collections.new("Dassault_Rafale_C")
    scene.collection.children.link(rafale_coll)
    env_coll = bpy.data.collections.new("Environment_Apron")
    scene.collection.children.link(env_coll)

    mats = create_materials(outdir)

    build_unified_airframe_body(rafale_coll, mats)
    build_cockpit_and_canopy(rafale_coll, mats)
    build_wings_and_canards(rafale_coll, mats)
    build_vertical_tail(rafale_coll, mats)
    build_recessed_exhausts(rafale_coll, mats)
    build_landing_gear(rafale_coll, mats)
    build_apron_environment(env_coll, mats)

    setup_world_and_lighting(scene)

    # 1. Hero Front Three-Quarter Camera — Pulled back to (-12.8, 15.6, 1.82) with target shifted forward (Y=0.35m)
    # so the nose tip & pitot probe have generous breathing room on the left of the 1920x1080 frame!
    cam_hero = create_aimed_camera(
        "Camera_Hero_Front3Q",
        location=(-12.8, 15.6, 1.82),
        target=(0.15, 0.35, 2.05),
        lens_mm=43.0,
        fstop=5.6,
        scene=scene,
    )

    # 2. Close-up Diagnostic Cameras
    cam_close_nose_intake = create_aimed_camera(
        "Camera_Closeup_Nose_Intake",
        location=(-4.6, 6.2, 1.68),
        target=(0.0, 2.85, 1.65),
        lens_mm=52.0,
        fstop=8.0,
        scene=scene,
    )
    cam_close_gear = create_aimed_camera(
        "Camera_Closeup_Landing_Gear",
        location=(-3.8, 1.2, 0.65),
        target=(-0.4, -0.8, 0.58),
        lens_mm=45.0,
        fstop=8.0,
        scene=scene,
    )
    cam_close_tail_controls = create_aimed_camera(
        "Camera_Closeup_Tail_Controls",
        location=(-6.8, -8.5, 2.55),
        target=(-1.2, -4.5, 2.65),
        lens_mm=48.0,
        fstop=8.0,
        scene=scene,
    )

    # 3. Full Side and Rear Previews
    cam_side = create_aimed_camera(
        "Camera_Preview_Side",
        location=(-23.5, 0.0, 2.35),
        target=(0.0, 0.0, 2.35),
        lens_mm=45.0,
        fstop=8.0,
        scene=scene,
    )
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

    if mode == "closeups":
        configure_cycles(scene, 1280, 720, samples=128)
        for cam, fname in [
            (cam_close_nose_intake, "closeup_nose_intake.png"),
            (cam_close_gear, "closeup_landing_gear.png"),
            (cam_close_tail_controls, "closeup_tail_controls.png"),
            (cam_side, "preview_revised_side.png"),
        ]:
            scene.camera = cam
            scene.render.filepath = os.path.join(outdir, fname)
            bpy.ops.render.render(write_still=True)
            print("Rendered close-up:", scene.render.filepath)
        scene.camera = cam_hero
        bpy.ops.wm.save_as_mainfile(filepath=blend_path)
    else:
        # Render updated close-ups, side & rear previews, and final 1920x1080 hero render
        configure_cycles(scene, 1280, 720, samples=128)
        for cam, fname in [
            (cam_close_nose_intake, "closeup_nose_intake.png"),
            (cam_close_gear, "closeup_landing_gear.png"),
            (cam_close_tail_controls, "closeup_tail_controls.png"),
            (cam_side, "preview_revised_side.png"),
            (cam_rear, "preview_revised_rear.png"),
        ]:
            scene.camera = cam
            scene.render.filepath = os.path.join(outdir, fname)
            bpy.ops.render.render(write_still=True)
            print("Rendered preview:", scene.render.filepath)

        scene.camera = cam_hero
        configure_cycles(scene, 1920, 1080, samples=288)
        scene.render.filepath = os.path.join(outdir, "rafale_hero_final.png")
        bpy.ops.render.render(write_still=True)
        print("Rendered Final Hero:", scene.render.filepath)

        bpy.ops.wm.save_as_mainfile(filepath=blend_path)
        print("Saved blend file:", blend_path)


if __name__ == "__main__":
    main()
