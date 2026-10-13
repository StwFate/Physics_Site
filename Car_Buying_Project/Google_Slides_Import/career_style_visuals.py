"""Build editable Google Slides shapes and standalone photo assets."""
from __future__ import annotations

import json
import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageOps


HERE = Path(__file__).resolve().parent
ASSETS = HERE / "career_style_assets"
PHOTOS = ASSETS / "editable_photos"
PHOTOS.mkdir(parents=True, exist_ok=True)
SOURCE_SCALE = 4
SLIDE_SCALE = 4 / 3
INK = "#1c1c1c"
PAPER = "#fffdf7"
COLORS = {
    "yellow": "#fde047",
    "pink": "#f472b6",
    "blue": "#38bdf8",
    "green": "#4ade80",
    "orange": "#fb923c",
    "purple": "#c084fc",
    "white": "#ffffff",
    "muted": "#666666",
    "brown": "#b26206",
    "soft_green": "#f0fff6",
    "soft_orange": "#fff7ed",
}

base_shapes: list[dict] = []
overlay_shapes: list[dict] = []
photos: list[dict] = []


def add_shape(
    slide: str,
    name: str,
    x: float,
    y: float,
    w: float,
    h: float,
    fill: str | None,
    *,
    rounded: bool = False,
    ellipse: bool = False,
    stroke: str | None = INK,
    stroke_width: float = 2.3,
    rotate: float = 0,
    overlay: bool = False,
) -> None:
    shape_type = "ELLIPSE" if ellipse else "ROUND_RECTANGLE" if rounded else "RECTANGLE"
    shape = dict(
        slide=slide,
        id=f"vis_{name}",
        type=shape_type,
        x=x,
        y=y,
        w=w,
        h=h,
        fill=fill,
        stroke=stroke,
        stroke_width=stroke_width,
        rotate=rotate,
    )
    (overlay_shapes if overlay else base_shapes).append(shape)


def box(slide: str, name: str, x: float, y: float, w: float, h: float, fill: str,
        radius: float = 8, stroke: str | None = INK, stroke_width: float = 2.3,
        *, overlay: bool = False) -> None:
    add_shape(slide, name, x, y, w, h, fill, rounded=radius > 0,
              stroke=stroke, stroke_width=stroke_width, overlay=overlay)


def add_photo(slide: str, name: str, source: str, x: int, y: int, w: int, h: int,
              radius: int, alt: str) -> None:
    photos.append(dict(slide=slide, id=f"vis_photo_{name}", source=source,
                       x=x, y=y, w=w, h=h, radius=radius, alt=alt))


def header(slide: str, fill: str = "yellow") -> None:
    box(slide, f"{slide}_title_bar", 30, 18, 460, 42, COLORS[fill], radius=8)
    box(slide, f"{slide}_slide_tag", 570, 18, 120, 34, COLORS["pink"], radius=6)


# Cover accents and frames.
for name, x, y, angle, color in [
    ("blue_corner", -4, -15, 40, "blue"),
    ("green_top", 325, 24, -27, "green"),
    ("green_bottom", 597, 337, 16, "green"),
]:
    add_shape("cb26_cover", f"cover_{name}", x, y, 50, 50, COLORS[color],
              stroke=INK, stroke_width=2.5, rotate=angle)
add_shape("cb26_cover", "cover_pink_circle", 198, 288, 62, 62,
          COLORS["pink"], ellipse=True, stroke_width=2.5)
box("cb26_cover", "cover_blue_pill", 40, 45, 230, 30, COLORS["blue"], radius=5)
box("cb26_cover", "cover_name_box", 40, 275, 173, 60, PAPER, radius=10)
box("cb26_cover", "cover_photo_shadow", 420, 67, 285, 260, COLORS["pink"], radius=10)
add_photo("cb26_cover", "cover_jeep", "cb26_cover.png", 412, 59, 285, 260, 10, "Jeep Wrangler photo")
box("cb26_cover", "cover_photo_outline", 412, 59, 285, 260, PAPER, radius=10,
    stroke=INK, stroke_width=2.3, overlay=True)
overlay_shapes[-1]["fill"] = None
box("cb26_cover", "cover_project_badge", 596, 49, 86, 23, COLORS["yellow"], radius=12, overlay=True)

# Job and pay slide.
header("p1")
box("p1", "p1_monthly_pay", 35, 75, 211, 177, COLORS["yellow"], radius=28)
add_photo("p1", "target_store", "p1.png", 35, 264, 211, 98, 16, "Target store photo")
box("p1", "p1_store_photo_outline", 35, 264, 211, 98, PAPER, radius=16,
    stroke=INK, stroke_width=2.3, overlay=True)
overlay_shapes[-1]["fill"] = None
job_cards = [
    ("blue", "job"), ("yellow", "hourly"), ("green", "hours"), ("pink", "weekly"),
]
for index, (color, name) in enumerate(job_cards):
    x = 264 + (index % 2) * 225
    y = 75 + (index // 2) * 100
    box("p1", f"p1_{name}_card", x, y, 206, 88, COLORS["white"], radius=12)
    box("p1", f"p1_{name}_chip", x + 9, y + 10, 14, 14, COLORS[color], radius=3, stroke_width=1.5)
box("p1", "p1_pay_math_card", 264, 275, 431, 88, COLORS["white"], radius=12)
box("p1", "p1_pay_math_chip", 273, 285, 14, 14, COLORS["purple"], radius=3, stroke_width=1.5)

# Car description slides.
def car_slide(slide: str, prefix: str, photo_name: str, photo_source: str, photo_alt: str) -> None:
    header(slide)
    row_colors = ["yellow", "blue", "green", "purple", "orange"]
    for i, color in enumerate(row_colors):
        y = 72 + 62 * i
        box(slide, f"{prefix}_row_{i + 1}", 35, y, 390, 54, COLORS["white"], radius=9)
        box(slide, f"{prefix}_row_{i + 1}_stripe", 42, y + 7, 12, 41,
            COLORS[color], radius=3, stroke_width=1)
    add_photo(slide, photo_name, photo_source, 438, 89, 254, 156, 24, photo_alt)
    box(slide, f"{prefix}_safety_card", 450, 285, 235, 95, COLORS["blue"], radius=17)
    box(slide, f"{prefix}_photo_outline", 438, 89, 254, 156, PAPER, radius=24,
        stroke=INK, stroke_width=2.3, overlay=True)
    # The outline is transparent; do not paint over the photo.
    overlay_shapes[-1]["fill"] = None


car_slide("p2", "car1", "nissan_rogue", "p2.png", "2023 Nissan Rogue photo")
car_slide("p4", "car2", "car2_jeep", "p4.png", "2012 Jeep Wrangler photo")

# Loan comparison slides.
def loan_slide(slide: str, number: int) -> None:
    header(slide, fill="brown")
    widths = [120, 165, 165]
    row_h = 290 / 7
    for row in range(7):
        x = 30
        fill = COLORS["orange"] if row == 0 else COLORS["green"] if row == 6 else COLORS["white"]
        for column, width in enumerate(widths):
            box(slide, f"{slide}_table_r{row + 1}_c{column + 1}", x,
                75 + row * row_h, width, row_h, fill, radius=0)
            x += width
    add_photo(slide, f"loan{number}_phone", "p3.png", 489, 74, 222, 150, 25,
              "Loan comparison calculator photo")
    box(slide, f"{slide}_chosen_loan", 534, 280, 135, 100, COLORS["blue"], radius=16)
    # Small right-pointing arrow leading from the table to the selected loan.
    add_shape(slide, f"{slide}_choice_arrow", 486, 328, 38, 22, "#666666",
              stroke=None)
    base_shapes[-1]["type"] = "RIGHT_ARROW"
    box(slide, f"{slide}_phone_outline", 489, 74, 222, 150, PAPER, radius=25,
        stroke=INK, stroke_width=2.3, overlay=True)
    overlay_shapes[-1]["fill"] = None


loan_slide("p3", 1)
loan_slide("p5", 2)

# Final follow-up slide.
header("p6")
box("p6", "p6_top_questions", 35, 73, 410, 173, COLORS["soft_green"], radius=27)
box("p6", "p6_bottom_questions", 35, 258, 410, 116, COLORS["soft_orange"], radius=27)
add_photo("p6", "writing", "p6.png", 477, 73, 214, 150, 26, "Notebook and pen photo")
box("p6", "p6_affordability_card", 477, 258, 214, 116, COLORS["blue"], radius=22)
box("p6", "p6_writing_outline", 477, 73, 214, 150, PAPER, radius=26,
    stroke=INK, stroke_width=2.3, overlay=True)
overlay_shapes[-1]["fill"] = None


def rgb(hex_color: str) -> dict:
    value = hex_color.lstrip("#")
    return {"red": int(value[0:2], 16) / 255,
            "green": int(value[2:4], 16) / 255,
            "blue": int(value[4:6], 16) / 255}


def element_properties(shape: dict) -> dict:
    x, y, w, h = shape["x"], shape["y"], shape["w"], shape["h"]
    transform = dict(scaleX=1, scaleY=1,
                     translateX=x * SLIDE_SCALE, translateY=y * SLIDE_SCALE, unit="PT")
    if shape["rotate"]:
        radians = math.radians(shape["rotate"])
        cosine, sine = math.cos(radians), math.sin(radians)
        # The original tilted squares are centered in a 62-point padded tile.
        cx, cy = x + 31, y + 31
        transform = dict(
            scaleX=cosine, shearX=-sine, shearY=sine, scaleY=cosine,
            translateX=(cx - (cosine - sine) * w / 2) * SLIDE_SCALE,
            translateY=(cy - (sine + cosine) * h / 2) * SLIDE_SCALE,
            unit="PT",
        )
    return dict(
        pageObjectId=shape["slide"],
        size={"width": {"magnitude": w * SLIDE_SCALE, "unit": "PT"},
              "height": {"magnitude": h * SLIDE_SCALE, "unit": "PT"}},
        transform=transform,
    )


def shape_requests(shape: dict) -> list[dict]:
    requests = [{"createShape": {"objectId": shape["id"], "shapeType": shape["type"],
                                 "elementProperties": element_properties(shape)}}]
    properties = {}
    fields = []
    if shape["fill"] is None:
        properties["shapeBackgroundFill"] = {"propertyState": "NOT_RENDERED"}
        fields.append("shapeBackgroundFill.propertyState")
    else:
        properties["shapeBackgroundFill"] = {"solidFill": {"color": {"rgbColor": rgb(shape["fill"])}}}
        fields.append("shapeBackgroundFill.solidFill.color")
    if shape["stroke"] is None:
        properties["outline"] = {"propertyState": "NOT_RENDERED"}
        fields.append("outline.propertyState")
    else:
        properties["outline"] = {
            "outlineFill": {"solidFill": {"color": {"rgbColor": rgb(shape["stroke"])}}},
            "weight": {"magnitude": shape["stroke_width"] * SLIDE_SCALE, "unit": "PT"},
        }
        fields.extend(["outline.outlineFill.solidFill.color", "outline.weight"])
    requests.append({"updateShapeProperties": {"objectId": shape["id"],
                                                "shapeProperties": properties,
                                                "fields": ",".join(fields)}})
    return requests


def extract_photos() -> None:
    photo_specs = [
        ("target_store", "p1.png", 35, 264, 211, 98, 16),
        ("nissan_rogue", "p2.png", 438, 89, 254, 156, 24),
        ("loan1_phone", "p3.png", 489, 74, 222, 150, 25),
        ("car2_jeep", "p4.png", 438, 89, 254, 156, 24),
        ("loan2_phone", "p5.png", 489, 74, 222, 150, 25),
        ("writing", "p6.png", 477, 73, 214, 150, 26),
    ]
    for name, source_name, x, y, w, h, radius in photo_specs:
        source = Image.open(ASSETS / source_name).convert("RGB")
        frame_inset = 12  # Remove the old raster border before adding the native outline.
        left, top = x * SOURCE_SCALE + frame_inset, y * SOURCE_SCALE + frame_inset
        right = (x + w) * SOURCE_SCALE - frame_inset
        bottom = (y + h) * SOURCE_SCALE - frame_inset
        target_size = (w * SOURCE_SCALE, h * SOURCE_SCALE)
        content = source.crop((left, top, right, bottom)).resize(target_size, Image.Resampling.LANCZOS)
        mask = Image.new("L", target_size, 0)
        ImageDraw.Draw(mask).rounded_rectangle(
            (0, 0, target_size[0] - 1, target_size[1] - 1),
            radius=radius * SOURCE_SCALE, fill=255)
        content.putalpha(mask)
        content.save(PHOTOS / f"{name}.png")

    # The cover's yellow badge overlaps its old raster photo. Build a clean cover
    # crop from the separate Jeep photo on slide 5 so the badge stays independent.
    jeep = Image.open(PHOTOS / "car2_jeep.png").convert("RGBA")
    plate = Image.new("RGB", jeep.size, PAPER)
    plate.paste(jeep, mask=jeep.getchannel("A"))
    target_size = (285 * SOURCE_SCALE, 260 * SOURCE_SCALE)
    cover = ImageOps.fit(plate, target_size, method=Image.Resampling.LANCZOS)
    cover_mask = Image.new("L", target_size, 0)
    ImageDraw.Draw(cover_mask).rounded_rectangle(
        (0, 0, target_size[0] - 1, target_size[1] - 1),
        # Slides' ROUND_RECTANGLE shape uses a generous default corner radius.
        radius=44 * SOURCE_SCALE, fill=255)
    cover.putalpha(cover_mask)
    cover.save(PHOTOS / "cover_jeep.png")


def build_payload() -> dict:
    extract_photos()
    # Preserve visual layer order: cards and panels, photos, then photo outlines/badges.
    per_slide = {slide: [] for slide in ["cb26_cover", "p1", "p2", "p3", "p4", "p5", "p6"]}
    for shape in base_shapes:
        per_slide[shape["slide"]].append(shape["id"])
    for photo in photos:
        per_slide[photo["slide"]].append(photo["id"])
    for shape in overlay_shapes:
        per_slide[shape["slide"]].append(shape["id"])

    base_by_slide = {slide: [{"updatePageProperties": {
        "objectId": slide,
        "pageProperties": {"pageBackgroundFill": {"solidFill": {"color": {"rgbColor": rgb(PAPER)}}}},
        "fields": "pageBackgroundFill",
    }}] for slide in per_slide}
    for shape in base_shapes:
        base_by_slide[shape["slide"]].extend(shape_requests(shape))
    overlay_by_slide = {slide: [] for slide in per_slide}
    for shape in overlay_shapes:
        overlay_by_slide[shape["slide"]].extend(shape_requests(shape))
    photo_requests = []
    for photo in photos:
        # The cropped asset uses a short semantic name independent of its source slide.
        path = str(PHOTOS / f"{photo['id'].removeprefix('vis_photo_')}.png")
        photo_requests.append({
            "slide": photo["slide"], "id": photo["id"], "path": path,
            "request": {"createImage": {
                "objectId": photo["id"], "url": path,
                "elementProperties": {
                    "pageObjectId": photo["slide"],
                    "size": {"width": {"magnitude": photo["w"] * SLIDE_SCALE, "unit": "PT"},
                             "height": {"magnitude": photo["h"] * SLIDE_SCALE, "unit": "PT"}},
                    "transform": {"scaleX": 1, "scaleY": 1,
                                  "translateX": photo["x"] * SLIDE_SCALE,
                                  "translateY": photo["y"] * SLIDE_SCALE, "unit": "PT"},
                },
            }},
            "alt": photo["alt"],
        })
    final_requests = []
    for slide, ids in per_slide.items():
        final_requests.append({"updatePageElementsZOrder": {
            "pageElementObjectIds": ids, "operation": "SEND_TO_BACK"}})
    for slide in per_slide:
        final_requests.append({"deleteObject": {"objectId": f"career_bg_{slide}"}})
    return {
        "baseRequestsBySlide": base_by_slide,
        "photoRequests": photo_requests,
        "overlayRequestsBySlide": overlay_by_slide,
        "finalRequests": final_requests,
        "counts": {"baseShapes": len(base_shapes), "photos": len(photos),
                   "overlayShapes": len(overlay_shapes)},
    }


if __name__ == "__main__":
    import sys
    output = Path(sys.argv[1]) if len(sys.argv) > 1 else HERE / "editable_visual_requests.json"
    output.write_text(json.dumps(build_payload(), separators=(",", ":")), encoding="utf-8")
    print(json.dumps({"requests": str(output), "photos": str(PHOTOS),
                      "counts": json.loads(output.read_text(encoding="utf-8"))["counts"]}))
