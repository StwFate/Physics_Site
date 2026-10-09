import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

def create_deck():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Reference Color Palette from User PDF
    c_canvas = RGBColor(251, 249, 245)     # Cream / warm off-white #FBF9F5
    c_black = RGBColor(0, 0, 0)            # Pure Black #000000
    c_white = RGBColor(255, 255, 255)      # Pure White #FFFFFF
    c_yellow = RGBColor(255, 214, 70)      # Canary Yellow #FFD646
    c_pink = RGBColor(244, 114, 182)       # Bubblegum Pink #F472B6
    c_cyan = RGBColor(56, 189, 248)        # Sky Blue / Cyan #38BDF8
    c_green = RGBColor(74, 222, 128)       # Bright Lime Green #4ADE80
    c_orange = RGBColor(251, 146, 60)      # Warm Orange #FB923C
    c_purple = RGBColor(192, 132, 252)     # Lilac Purple #C084FC

    font_display = "Arial Black"
    font_body = "Trebuchet MS"

    shadow_x = Inches(0.07)
    shadow_y = Inches(0.07)

    def draw_neo_box(slide, left, top, width, height, fill_color, border_width=2.5, shape_type=MSO_SHAPE.ROUNDED_RECTANGLE, has_shadow=True, shadow_color=c_black):
        if has_shadow:
            sh = slide.shapes.add_shape(shape_type, left + shadow_x, top + shadow_y, width, height)
            sh.fill.solid()
            sh.fill.fore_color.rgb = shadow_color
            sh.line.fill.background()
        
        main = slide.shapes.add_shape(shape_type, left, top, width, height)
        main.fill.solid()
        main.fill.fore_color.rgb = fill_color
        main.line.color.rgb = c_black
        main.line.width = Pt(border_width)
        return main

    def add_slide_canvas(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = c_canvas
        bg.line.fill.background()

    def add_top_nav(slide, title_text, slide_str="SLIDE 01 / 06"):
        # Yellow header pill
        pill_w = Inches(9.2)
        pill_h = Inches(0.8)
        pill = draw_neo_box(slide, Inches(0.8), Inches(0.4), pill_w, pill_h, c_yellow, border_width=3.0)
        tf = pill.text_frame
        tf.word_wrap = True
        tf.vertical_anchor = MSO_ANCHOR.MIDDLE
        tf.margin_left = Inches(0.3)
        tf.margin_right = Inches(0.3)
        p = tf.paragraphs[0]
        p.text = title_text.upper()
        p.alignment = PP_ALIGN.CENTER
        p.font.name = font_display
        p.font.size = Pt(17)
        p.font.bold = True
        p.font.color.rgb = c_black

        # Pink slide number pill
        num_w = Inches(2.2)
        num_pill = draw_neo_box(slide, Inches(10.3), Inches(0.4), num_w, pill_h, c_pink, border_width=3.0)
        tf_n = num_pill.text_frame
        tf_n.word_wrap = True
        tf_n.vertical_anchor = MSO_ANCHOR.MIDDLE
        p = tf_n.paragraphs[0]
        p.text = slide_str
        p.alignment = PP_ALIGN.CENTER
        p.font.name = font_display
        p.font.size = Pt(13)
        p.font.bold = True
        p.font.color.rgb = c_black

    # =========================================================================
    # SLIDE 1: TITLE & JOB OVERVIEW (Matching Page 1 Style)
    # =========================================================================
    slide1 = prs.slides.add_slide(blank_layout)
    add_slide_canvas(slide1)

    # Decorative Cyan Tilted Square (top left)
    dia1 = slide1.shapes.add_shape(MSO_SHAPE.DIAMOND, Inches(0.8), Inches(0.4), Inches(0.9), Inches(0.9))
    dia1.fill.solid()
    dia1.fill.fore_color.rgb = c_cyan
    dia1.line.color.rgb = c_black
    dia1.line.width = Pt(2.5)

    # Decorative Green Tilted Square (top center)
    dia2 = slide1.shapes.add_shape(MSO_SHAPE.DIAMOND, Inches(6.8), Inches(0.5), Inches(0.95), Inches(0.95))
    dia2.fill.solid()
    dia2.fill.fore_color.rgb = c_green
    dia2.line.color.rgb = c_black
    dia2.line.width = Pt(2.5)

    # Decorative Green Diamond (bottom right)
    dia3 = slide1.shapes.add_shape(MSO_SHAPE.DIAMOND, Inches(11.2), Inches(6.2), Inches(0.9), Inches(0.9))
    dia3.fill.solid()
    dia3.fill.fore_color.rgb = c_green
    dia3.line.color.rgb = c_black
    dia3.line.width = Pt(2.5)

    # Top-Left Project Tag Pill
    tag_pill = draw_neo_box(slide1, Inches(1.2), Inches(0.8), Inches(4.3), Inches(0.65), c_cyan, border_width=3.0)
    tf = tag_pill.text_frame
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    p = tf.paragraphs[0]
    p.text = "MY • CAR PRESENTATION"
    p.alignment = PP_ALIGN.CENTER
    p.font.name = font_display
    p.font.size = Pt(13)
    p.font.color.rgb = c_black

    # Big Punchy Title
    title_box = slide1.shapes.add_textbox(Inches(0.8), Inches(1.8), Inches(6.0), Inches(1.4))
    tf = title_box.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "CAR BUYING"
    p.font.name = font_display
    p.font.size = Pt(46)
    p.font.bold = True
    p.font.color.rgb = c_black

    p2 = tf.add_paragraph()
    p2.text = "PROJECT"
    p2.font.name = font_display
    p2.font.size = Pt(46)
    p2.font.bold = True
    p2.font.color.rgb = c_black

    # Prepared by Card (with pink circle)
    prep_card = draw_neo_box(slide1, Inches(0.8), Inches(3.6), Inches(3.4), Inches(1.3), c_white, border_width=3.0)
    tf = prep_card.text_frame
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    tf.margin_left = Inches(0.3)
    p = tf.paragraphs[0]
    p.text = "PREPARED BY:"
    p.font.name = font_display
    p.font.size = Pt(11)
    p.font.color.rgb = RGBColor(100, 116, 139)
    p_name = tf.add_paragraph()
    p_name.text = "Rehan Mangar"
    p_name.font.name = font_display
    p_name.font.size = Pt(20)
    p_name.font.color.rgb = c_black

    # Floating Pink Circle overlapping prep card
    circle = slide1.shapes.add_shape(MSO_SHAPE.OVAL, Inches(3.9), Inches(3.8), Inches(1.05), Inches(1.05))
    circle.fill.solid()
    circle.fill.fore_color.rgb = c_pink
    circle.line.color.rgb = c_black
    circle.line.width = Pt(2.5)

    # Job Earnings Stat Card (Left Bottom)
    job_card = draw_neo_box(slide1, Inches(0.8), Inches(5.1), Inches(6.0), Inches(1.9), c_yellow, border_width=3.0)
    tf = job_card.text_frame
    tf.margin_left = Inches(0.3)
    tf.margin_right = Inches(0.3)
    tf.margin_top = Inches(0.2)
    p = tf.paragraphs[0]
    p.text = "ASSIGNED JOB: TARGET TEAM MEMBER"
    p.font.name = font_display
    p.font.size = Pt(12)
    p.font.color.rgb = c_black

    p2 = tf.add_paragraph()
    p2.text = "• Pay & Schedule: $14.25 / hr  •  24 hrs / week"
    p2.font.name = font_body
    p2.font.bold = True
    p2.font.size = Pt(12)
    p2.font.color.rgb = c_black

    p3 = tf.add_paragraph()
    p3.text = "• Gross Weekly Pay: $342.00  |  Gross Monthly: $1,368.00"
    p3.font.name = font_body
    p3.font.bold = True
    p3.font.size = Pt(12)
    p3.font.color.rgb = c_black

    p4 = tf.add_paragraph()
    p4.text = "• 11% Transportation Budget: $150.48 / month ($1,368 × 0.11)"
    p4.font.name = font_body
    p4.font.bold = True
    p4.font.size = Pt(12)
    p4.font.color.rgb = RGBColor(220, 38, 38)

    # Right Side: Target Image inside rounded card with PINK offset shadow (matching Page 1 style!)
    img1_x = Inches(7.3)
    img1_y = Inches(1.3)
    img1_w = Inches(5.2)
    img1_h = Inches(4.5)

    # Pink shadow underneath image
    sh_pink = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, img1_x + Inches(0.12), img1_y + Inches(0.12), img1_w, img1_h)
    sh_pink.fill.solid()
    sh_pink.fill.fore_color.rgb = c_pink
    sh_pink.line.color.rgb = c_black
    sh_pink.line.width = Pt(3.0)

    # Main image card
    img_card1 = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, img1_x, img1_y, img1_w, img1_h)
    img_card1.fill.solid()
    img_card1.fill.fore_color.rgb = c_white
    img_card1.line.color.rgb = c_black
    img_card1.line.width = Pt(3.0)

    # Embed Target image
    target_img = "Car_Buying_Project/images/target_store.jpg"
    if os.path.exists(target_img):
        slide1.shapes.add_picture(target_img, img1_x + Inches(0.15), img1_y + Inches(0.15), width=img1_w - Inches(0.3), height=img1_h - Inches(0.3))

    # Star Badge on Target photo (top right)
    star_badge = draw_neo_box(slide1, Inches(10.5), Inches(1.05), Inches(2.2), Inches(0.55), c_yellow, border_width=2.5)
    tf_s = star_badge.text_frame
    tf_s.vertical_anchor = MSO_ANCHOR.MIDDLE
    p = tf_s.paragraphs[0]
    p.text = "★ TARGET 2026"
    p.alignment = PP_ALIGN.CENTER
    p.font.name = font_display
    p.font.size = Pt(11)
    p.font.color.rgb = c_black

    # =========================================================================
    # SLIDE 2: CAR #1 OVERVIEW - 2023 NISSAN ROGUE S AWD
    # =========================================================================
    slide2 = prs.slides.add_slide(blank_layout)
    add_slide_canvas(slide2)
    add_top_nav(slide2, "Car #1 Overview: 2023 Nissan Rogue S AWD", "SLIDE 02 / 06")

    # Left Container: Photo Card + 2 Stat Pills (matching Page 2 & 3 layout)
    card2_l = draw_neo_box(slide2, Inches(0.8), Inches(1.45), Inches(5.6), Inches(5.5), c_white, border_width=3.0)
    
    nissan_img = "Car_Buying_Project/images/nissan_rogue.jpg"
    if os.path.exists(nissan_img):
        slide2.shapes.add_picture(nissan_img, Inches(1.05), Inches(1.65), width=Inches(5.1), height=Inches(3.1))

    # Stat Pill 1: List Price (Orange Top Strip)
    p_stat1 = draw_neo_box(slide2, Inches(1.05), Inches(5.0), Inches(2.45), Inches(1.7), c_white, border_width=2.5)
    # Header strip inside
    strip1 = slide2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.05), Inches(5.0), Inches(2.45), Inches(0.45))
    strip1.fill.solid()
    strip1.fill.fore_color.rgb = c_orange
    strip1.line.color.rgb = c_black
    strip1.line.width = Pt(2.0)
    tf = strip1.text_frame
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    p = tf.paragraphs[0]
    p.text = "1. LIST PRICE"
    p.alignment = PP_ALIGN.CENTER
    p.font.name = font_display
    p.font.size = Pt(10.5)
    p.font.color.rgb = c_black

    tf_st1 = p_stat1.text_frame
    tf_st1.margin_top = Inches(0.55)
    p = tf_st1.paragraphs[0]
    p.text = "$11,376"
    p.alignment = PP_ALIGN.CENTER
    p.font.name = font_display
    p.font.size = Pt(22)
    p.font.color.rgb = c_black
    p2 = tf_st1.add_paragraph()
    p2.text = "Under $20K budget"
    p2.alignment = PP_ALIGN.CENTER
    p2.font.name = font_body
    p2.font.size = Pt(10)
    p2.font.color.rgb = RGBColor(100, 116, 139)

    # Stat Pill 2: Gas Fill Cost (Yellow Top Strip)
    p_stat2 = draw_neo_box(slide2, Inches(3.7), Inches(5.0), Inches(2.45), Inches(1.7), c_white, border_width=2.5)
    strip2 = slide2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(3.7), Inches(5.0), Inches(2.45), Inches(0.45))
    strip2.fill.solid()
    strip2.fill.fore_color.rgb = c_yellow
    strip2.line.color.rgb = c_black
    strip2.line.width = Pt(2.0)
    tf = strip2.text_frame
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    p = tf.paragraphs[0]
    p.text = "2. TANK FILL-UP"
    p.alignment = PP_ALIGN.CENTER
    p.font.name = font_display
    p.font.size = Pt(10.5)
    p.font.color.rgb = c_black

    tf_st2 = p_stat2.text_frame
    tf_st2.margin_top = Inches(0.55)
    p = tf_st2.paragraphs[0]
    p.text = "$56.41"
    p.alignment = PP_ALIGN.CENTER
    p.font.name = font_display
    p.font.size = Pt(22)
    p.font.color.rgb = c_black
    p2 = tf_st2.add_paragraph()
    p2.text = "14.5 Gal × $3.89/gal"
    p2.alignment = PP_ALIGN.CENTER
    p2.font.name = font_body
    p2.font.size = Pt(10)
    p2.font.color.rgb = RGBColor(100, 116, 139)

    # Right Column: 3 Stacked Cards (Matching Page 3 of user PDF!)
    right_x = Inches(6.8)
    card_w = Inches(5.7)

    # Card 1: Features & Options (Blue Pill)
    rcard1 = draw_neo_box(slide2, right_x, Inches(1.45), card_w, Inches(1.65), c_white, border_width=2.5)
    # Side indicator pill
    pill1 = slide2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, right_x + Inches(0.2), Inches(1.6), Inches(0.3), Inches(0.7))
    pill1.fill.solid()
    pill1.fill.fore_color.rgb = c_cyan
    pill1.line.color.rgb = c_black
    pill1.line.width = Pt(2.0)

    tf = rcard1.text_frame
    tf.margin_left = Inches(0.65)
    tf.margin_top = Inches(0.15)
    tf.margin_right = Inches(0.25)
    p = tf.paragraphs[0]
    p.text = "FEATURES & OPTIONS"
    p.font.name = font_display
    p.font.size = Pt(12)
    p.font.color.rgb = c_black
    p2 = tf.add_paragraph()
    p2.text = "Apple CarPlay, Android Auto, Keyless start & remote push-button entry, Bluetooth audio, rearview backup camera, and automatic parking assistance."
    p2.font.name = font_body
    p2.font.size = Pt(10.5)
    p2.font.color.rgb = c_black

    # Card 2: Safety Features (Green Pill)
    rcard2 = draw_neo_box(slide2, right_x, Inches(3.35), card_w, Inches(1.65), c_white, border_width=2.5)
    pill2 = slide2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, right_x + Inches(0.2), Inches(3.5), Inches(0.3), Inches(0.7))
    pill2.fill.solid()
    pill2.fill.fore_color.rgb = c_green
    pill2.line.color.rgb = c_black
    pill2.line.width = Pt(2.0)

    tf = rcard2.text_frame
    tf.margin_left = Inches(0.65)
    tf.margin_top = Inches(0.15)
    tf.margin_right = Inches(0.25)
    p = tf.paragraphs[0]
    p.text = "SAFETY FEATURES & DRIVER ASSIST"
    p.font.name = font_display
    p.font.size = Pt(12)
    p.font.color.rgb = c_black
    p2 = tf.add_paragraph()
    p2.text = "All-Wheel Drive (AWD / 4WD) for safe snow/rain traction, Lane Departure Warning, Automatic Emergency Braking with pedestrian detection, and Rear Cross-Traffic Alert."
    p2.font.name = font_body
    p2.font.size = Pt(10.5)
    p2.font.color.rgb = c_black

    # Card 3: Why I Chose This Car (Purple Pill)
    rcard3 = draw_neo_box(slide2, right_x, Inches(5.25), card_w, Inches(1.7), c_white, border_width=2.5)
    pill3 = slide2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, right_x + Inches(0.2), Inches(5.4), Inches(0.3), Inches(0.7))
    pill3.fill.solid()
    pill3.fill.fore_color.rgb = c_purple
    pill3.line.color.rgb = c_black
    pill3.line.width = Pt(2.0)

    tf = rcard3.text_frame
    tf.margin_left = Inches(0.65)
    tf.margin_top = Inches(0.15)
    tf.margin_right = Inches(0.25)
    p = tf.paragraphs[0]
    p.text = "WHY I CHOSE THIS CAR"
    p.font.name = font_display
    p.font.size = Pt(12)
    p.font.color.rgb = c_black
    p2 = tf.add_paragraph()
    p2.text = "\"Has a clean record with zero accidents, the exterior and interior have no damage, offers AWD security for winter driving, and the $11,376 price is well within the $20,000 project limit.\""
    p2.font.name = font_body
    p2.font.italic = True
    p2.font.size = Pt(10.5)
    p2.font.color.rgb = c_black

    # =========================================================================
    # SLIDE 3: CAR #1 FINANCING BREAKDOWN (Loan A vs Loan B)
    # =========================================================================
    slide3 = prs.slides.add_slide(blank_layout)
    add_slide_canvas(slide3)
    add_top_nav(slide3, "Car #1 Financing Breakdown: Nissan Rogue", "SLIDE 03 / 06")

    # Left Card: Loan A (Simple Interest Parents) — Green Header
    card3_a = draw_neo_box(slide3, Inches(0.8), Inches(1.45), Inches(4.5), Inches(3.9), c_white, border_width=3.0)
    hdr_a = slide3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.45), Inches(4.5), Inches(0.65))
    hdr_a.fill.solid()
    hdr_a.fill.fore_color.rgb = c_green
    hdr_a.line.color.rgb = c_black
    hdr_a.line.width = Pt(2.5)
    tf = hdr_a.text_frame
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    p = tf.paragraphs[0]
    p.text = "LOAN A: PARENTS (SIMPLE INTEREST)"
    p.alignment = PP_ALIGN.CENTER
    p.font.name = font_display
    p.font.size = Pt(11)
    p.font.color.rgb = c_black

    tf = card3_a.text_frame
    tf.margin_top = Inches(0.8)
    tf.margin_left = Inches(0.3)
    tf.margin_right = Inches(0.3)
    p = tf.paragraphs[0]
    p.text = "$229.42 / MO"
    p.font.name = font_display
    p.font.size = Pt(26)
    p.font.color.rgb = c_black
    p.space_after = Pt(8)

    rows_a = [
        "• Terms: 4.2% Simple / 5 Yrs (60 Mos)",
        "• Formula: $11,376 × 0.042 × 5",
        "• Interest Paid: $2,388.96",
        "• Total Repayment: $13,764.96",
        "★ SAVES $1,683.12 IN INTEREST!"
    ]
    for r in rows_a:
        p_r = tf.add_paragraph()
        p_r.text = r
        p_r.font.name = font_body
        p_r.font.bold = True
        p_r.font.size = Pt(11)
        p_r.font.color.rgb = RGBColor(6, 95, 70) if "SAVE" in r else c_black
        p_r.space_after = Pt(3)

    # Middle Card: Loan B (Compound Interest Bank) — Cyan Header
    card3_b = draw_neo_box(slide3, Inches(5.6), Inches(1.45), Inches(4.5), Inches(3.9), c_white, border_width=3.0)
    hdr_b = slide3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(5.6), Inches(1.45), Inches(4.5), Inches(0.65))
    hdr_b.fill.solid()
    hdr_b.fill.fore_color.rgb = c_cyan
    hdr_b.line.color.rgb = c_black
    hdr_b.line.width = Pt(2.5)
    tf = hdr_b.text_frame
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    p = tf.paragraphs[0]
    p.text = "LOAN B: BANK (COMPOUND INTEREST)"
    p.alignment = PP_ALIGN.CENTER
    p.font.name = font_display
    p.font.size = Pt(11)
    p.font.color.rgb = c_black

    tf = card3_b.text_frame
    tf.margin_top = Inches(0.8)
    tf.margin_left = Inches(0.3)
    tf.margin_right = Inches(0.3)
    p = tf.paragraphs[0]
    p.text = "$214.56 / MO"
    p.font.name = font_display
    p.font.size = Pt(26)
    p.font.color.rgb = c_black
    p.space_after = Pt(8)

    rows_b = [
        "• Terms: 5.1% Daily (365) / 6 Yrs (72 Mos)",
        "• Formula: 11,376(1 + 0.051/365)^2190",
        "• Interest Paid: $4,072.08",
        "• Total Repayment: $15,448.08",
        "• Cheaper monthly by $14.86/mo"
    ]
    for r in rows_b:
        p_r = tf.add_paragraph()
        p_r.text = r
        p_r.font.name = font_body
        p_r.font.bold = True
        p_r.font.size = Pt(11)
        p_r.font.color.rgb = RGBColor(220, 38, 38) if "4,072" in r else c_black
        p_r.space_after = Pt(3)

    # Right Image Card: Real Financial Calculator
    card3_img = draw_neo_box(slide3, Inches(10.4), Inches(1.45), Inches(2.1), Inches(3.9), c_white, border_width=3.0)
    calc_img = "Car_Buying_Project/images/financing_calculator.jpg"
    if os.path.exists(calc_img):
        slide3.shapes.add_picture(calc_img, Inches(10.55), Inches(1.65), width=Inches(1.8), height=Inches(2.4))
    tf = card3_img.text_frame
    tf.margin_top = Inches(2.7)
    tf.margin_left = Inches(0.15)
    tf.margin_right = Inches(0.15)
    p = tf.paragraphs[0]
    p.text = "SMART CHOICE:"
    p.font.name = font_display
    p.font.size = Pt(10)
    p.font.color.rgb = c_black
    p2 = tf.add_paragraph()
    p2.text = "Simple loan avoids $1.6K+ bank interest."
    p2.font.name = font_body
    p2.font.size = Pt(9.5)
    p2.font.color.rgb = c_black

    # Bottom Callout Card: Final Loan Decision (Sky Blue, matching PDF Callouts!)
    dec3 = draw_neo_box(slide3, Inches(0.8), Inches(5.6), Inches(11.7), Inches(1.5), c_cyan, border_width=3.0)
    tf = dec3.text_frame
    tf.margin_left = Inches(0.35)
    tf.margin_right = Inches(0.35)
    tf.margin_top = Inches(0.15)

    p = tf.paragraphs[0]
    p.text = "WHICH LOAN WOULD YOU CHOOSE?  —  FINAL DECISION: LOAN A (PARENTS)"
    p.font.name = font_display
    p.font.size = Pt(13)
    p.font.color.rgb = c_black

    p2 = tf.add_paragraph()
    p2.text = "• Lowest Monthly Payment: Loan B has a lower monthly payment ($214.56/mo vs. $229.42/mo — $14.86 cheaper).\n• Lowest Total Interest: Loan A has much lower interest ($2,388.96 vs. $4,072.08 — saves $1,683.12).\n• Final Choice: I choose Loan A. Paying $14.86 more per month saves over $1,683 in interest and pays off 1 year earlier."
    p2.font.name = font_body
    p2.font.bold = True
    p2.font.size = Pt(11)
    p2.font.color.rgb = c_black

    # =========================================================================
    # SLIDE 4: CAR #2 OVERVIEW - 2021 TOYOTA COROLLA LE
    # =========================================================================
    slide4 = prs.slides.add_slide(blank_layout)
    add_slide_canvas(slide4)
    add_top_nav(slide4, "Car #2 Overview: 2021 Toyota Corolla LE", "SLIDE 04 / 06")

    # Left Container: Photo Card + 2 Stat Pills
    card4_l = draw_neo_box(slide4, Inches(0.8), Inches(1.45), Inches(5.6), Inches(5.5), c_white, border_width=3.0)

    toyota_img = "Car_Buying_Project/images/toyota_corolla.jpg"
    if os.path.exists(toyota_img):
        slide4.shapes.add_picture(toyota_img, Inches(1.05), Inches(1.65), width=Inches(5.1), height=Inches(3.1))

    # Stat Pill 1: List Price
    p_stat4_1 = draw_neo_box(slide4, Inches(1.05), Inches(5.0), Inches(2.45), Inches(1.7), c_white, border_width=2.5)
    strip4_1 = slide4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.05), Inches(5.0), Inches(2.45), Inches(0.45))
    strip4_1.fill.solid()
    strip4_1.fill.fore_color.rgb = c_orange
    strip4_1.line.color.rgb = c_black
    strip4_1.line.width = Pt(2.0)
    tf = strip4_1.text_frame
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    p = tf.paragraphs[0]
    p.text = "1. LIST PRICE"
    p.alignment = PP_ALIGN.CENTER
    p.font.name = font_display
    p.font.size = Pt(10.5)
    p.font.color.rgb = c_black

    tf_st4_1 = p_stat4_1.text_frame
    tf_st4_1.margin_top = Inches(0.55)
    p = tf_st4_1.paragraphs[0]
    p.text = "$14,500"
    p.alignment = PP_ALIGN.CENTER
    p.font.name = font_display
    p.font.size = Pt(22)
    p.font.color.rgb = c_black
    p2 = tf_st4_1.add_paragraph()
    p2.text = "Well under $20K budget"
    p2.alignment = PP_ALIGN.CENTER
    p2.font.name = font_body
    p2.font.size = Pt(10)
    p2.font.color.rgb = RGBColor(100, 116, 139)

    # Stat Pill 2: Gas Fill Cost
    p_stat4_2 = draw_neo_box(slide4, Inches(3.7), Inches(5.0), Inches(2.45), Inches(1.7), c_white, border_width=2.5)
    strip4_2 = slide4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(3.7), Inches(5.0), Inches(2.45), Inches(0.45))
    strip4_2.fill.solid()
    strip4_2.fill.fore_color.rgb = c_yellow
    strip4_2.line.color.rgb = c_black
    strip4_2.line.width = Pt(2.0)
    tf = strip4_2.text_frame
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    p = tf.paragraphs[0]
    p.text = "2. TANK FILL-UP"
    p.alignment = PP_ALIGN.CENTER
    p.font.name = font_display
    p.font.size = Pt(10.5)
    p.font.color.rgb = c_black

    tf_st4_2 = p_stat4_2.text_frame
    tf_st4_2.margin_top = Inches(0.55)
    p = tf_st4_2.paragraphs[0]
    p.text = "$51.35"
    p.alignment = PP_ALIGN.CENTER
    p.font.name = font_display
    p.font.size = Pt(22)
    p.font.color.rgb = c_black
    p2 = tf_st4_2.add_paragraph()
    p2.text = "13.2 Gal × $3.89/gal"
    p2.alignment = PP_ALIGN.CENTER
    p2.font.name = font_body
    p2.font.size = Pt(10)
    p2.font.color.rgb = RGBColor(100, 116, 139)

    # Right Column: 3 Stacked Cards
    rcard4_1 = draw_neo_box(slide4, right_x, Inches(1.45), card_w, Inches(1.65), c_white, border_width=2.5)
    pill4_1 = slide4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, right_x + Inches(0.2), Inches(1.6), Inches(0.3), Inches(0.7))
    pill4_1.fill.solid()
    pill4_1.fill.fore_color.rgb = c_cyan
    pill4_1.line.color.rgb = c_black
    pill4_1.line.width = Pt(2.0)

    tf = rcard4_1.text_frame
    tf.margin_left = Inches(0.65)
    tf.margin_top = Inches(0.15)
    tf.margin_right = Inches(0.25)
    p = tf.paragraphs[0]
    p.text = "FEATURES & OPTIONS"
    p.font.name = font_display
    p.font.size = Pt(12)
    p.font.color.rgb = c_black
    p2 = tf.add_paragraph()
    p2.text = "Apple CarPlay, Android Auto, Amazon Alexa compatibility, 8-inch high-res touchscreen, integrated backup camera, and remote keyless entry."
    p2.font.name = font_body
    p2.font.size = Pt(10.5)
    p2.font.color.rgb = c_black

    # Safety
    rcard4_2 = draw_neo_box(slide4, right_x, Inches(3.35), card_w, Inches(1.65), c_white, border_width=2.5)
    pill4_2 = slide4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, right_x + Inches(0.2), Inches(3.5), Inches(0.3), Inches(0.7))
    pill4_2.fill.solid()
    pill4_2.fill.fore_color.rgb = c_green
    pill4_2.line.color.rgb = c_black
    pill4_2.line.width = Pt(2.0)

    tf = rcard4_2.text_frame
    tf.margin_left = Inches(0.65)
    tf.margin_top = Inches(0.15)
    tf.margin_right = Inches(0.25)
    p = tf.paragraphs[0]
    p.text = "SAFETY FEATURES (TOYOTA SAFETY SENSE 2.0)"
    p.font.name = font_display
    p.font.size = Pt(12)
    p.font.color.rgb = c_black
    p2 = tf.add_paragraph()
    p2.text = "Pre-Collision System with Pedestrian Detection, Lane Departure Alert with Steering Assist, Full-Speed Radar Cruise Control, and 10 advanced airbags."
    p2.font.name = font_body
    p2.font.size = Pt(10.5)
    p2.font.color.rgb = c_black

    # Why Chosen
    rcard4_3 = draw_neo_box(slide4, right_x, Inches(5.25), card_w, Inches(1.7), c_white, border_width=2.5)
    pill4_3 = slide4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, right_x + Inches(0.2), Inches(5.4), Inches(0.3), Inches(0.7))
    pill4_3.fill.solid()
    pill4_3.fill.fore_color.rgb = c_purple
    pill4_3.line.color.rgb = c_black
    pill4_3.line.width = Pt(2.0)

    tf = rcard4_3.text_frame
    tf.margin_left = Inches(0.65)
    tf.margin_top = Inches(0.15)
    tf.margin_right = Inches(0.25)
    p = tf.paragraphs[0]
    p.text = "WHY I CHOSE THIS CAR"
    p.font.name = font_display
    p.font.size = Pt(12)
    p.font.color.rgb = c_black
    p2 = tf.add_paragraph()
    p2.text = "\"Unmatched Toyota reliability, class-leading 38 MPG highway fuel efficiency that saves money at the pump, low repair/maintenance costs, and great resale value.\""
    p2.font.name = font_body
    p2.font.italic = True
    p2.font.size = Pt(10.5)
    p2.font.color.rgb = c_black

    # =========================================================================
    # SLIDE 5: CAR #2 FINANCING BREAKDOWN (Loan C vs Loan D)
    # =========================================================================
    slide5 = prs.slides.add_slide(blank_layout)
    add_slide_canvas(slide5)
    add_top_nav(slide5, "Car #2 Financing Breakdown: Toyota Corolla", "SLIDE 05 / 06")

    # Left Card: Loan C (Simple Interest Parents) — Green Header
    card5_c = draw_neo_box(slide5, Inches(0.8), Inches(1.45), Inches(4.5), Inches(3.9), c_white, border_width=3.0)
    hdr_c = slide5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.45), Inches(4.5), Inches(0.65))
    hdr_c.fill.solid()
    hdr_c.fill.fore_color.rgb = c_green
    hdr_c.line.color.rgb = c_black
    hdr_c.line.width = Pt(2.5)
    tf = hdr_c.text_frame
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    p = tf.paragraphs[0]
    p.text = "LOAN C: PARENTS (SIMPLE INTEREST)"
    p.alignment = PP_ALIGN.CENTER
    p.font.name = font_display
    p.font.size = Pt(11)
    p.font.color.rgb = c_black

    tf = card5_c.text_frame
    tf.margin_top = Inches(0.8)
    tf.margin_left = Inches(0.3)
    tf.margin_right = Inches(0.3)
    p = tf.paragraphs[0]
    p.text = "$292.42 / MO"
    p.font.name = font_display
    p.font.size = Pt(26)
    p.font.color.rgb = c_black
    p.space_after = Pt(8)

    rows_c = [
        "• Terms: 4.2% Simple / 5 Yrs (60 Mos)",
        "• Formula: $14,500 × 0.042 × 5",
        "• Interest Paid: $3,045.00",
        "• Total Repayment: $17,545.00",
        "★ SAVES $2,142.23 IN INTEREST!"
    ]
    for r in rows_c:
        p_r = tf.add_paragraph()
        p_r.text = r
        p_r.font.name = font_body
        p_r.font.bold = True
        p_r.font.size = Pt(11)
        p_r.font.color.rgb = RGBColor(6, 95, 70) if "SAVE" in r else c_black
        p_r.space_after = Pt(3)

    # Middle Card: Loan D (Compound Interest Bank) — Cyan Header
    card5_d = draw_neo_box(slide5, Inches(5.6), Inches(1.45), Inches(4.5), Inches(3.9), c_white, border_width=3.0)
    hdr_d = slide5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(5.6), Inches(1.45), Inches(4.5), Inches(0.65))
    hdr_d.fill.solid()
    hdr_d.fill.fore_color.rgb = c_cyan
    hdr_d.line.color.rgb = c_black
    hdr_d.line.width = Pt(2.5)
    tf = hdr_d.text_frame
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    p = tf.paragraphs[0]
    p.text = "LOAN D: BANK (COMPOUND INTEREST)"
    p.alignment = PP_ALIGN.CENTER
    p.font.name = font_display
    p.font.size = Pt(11)
    p.font.color.rgb = c_black

    tf = card5_d.text_frame
    tf.margin_top = Inches(0.8)
    tf.margin_left = Inches(0.3)
    tf.margin_right = Inches(0.3)
    p = tf.paragraphs[0]
    p.text = "$273.43 / MO"
    p.font.name = font_display
    p.font.size = Pt(26)
    p.font.color.rgb = c_black
    p.space_after = Pt(8)

    rows_d = [
        "• Terms: 5.1% Daily (365) / 6 Yrs (72 Mos)",
        "• Formula: 14,500(1 + 0.051/365)^2190",
        "• Interest Paid: $5,187.23",
        "• Total Repayment: $19,687.23",
        "• Cheaper monthly by $18.99/mo"
    ]
    for r in rows_d:
        p_r = tf.add_paragraph()
        p_r.text = r
        p_r.font.name = font_body
        p_r.font.bold = True
        p_r.font.size = Pt(11)
        p_r.font.color.rgb = RGBColor(220, 38, 38) if "5,187" in r else c_black
        p_r.space_after = Pt(3)

    # Right Image Card: Real Bank Piggy Bank
    card5_img = draw_neo_box(slide5, Inches(10.4), Inches(1.45), Inches(2.1), Inches(3.9), c_white, border_width=3.0)
    bank_img = "Car_Buying_Project/images/bank_savings.jpg"
    if os.path.exists(bank_img):
        slide5.shapes.add_picture(bank_img, Inches(10.55), Inches(1.65), width=Inches(1.8), height=Inches(2.4))
    tf = card5_img.text_frame
    tf.margin_top = Inches(2.7)
    tf.margin_left = Inches(0.15)
    tf.margin_right = Inches(0.15)
    p = tf.paragraphs[0]
    p.text = "COMPOUND TRAP:"
    p.font.name = font_display
    p.font.size = Pt(10)
    p.font.color.rgb = c_black
    p2 = tf.add_paragraph()
    p2.text = "6-yr bank compounding adds $5.1K in interest!"
    p2.font.name = font_body
    p2.font.size = Pt(9.5)
    p2.font.color.rgb = c_black

    # Bottom Callout Card: Final Loan Decision (Sky Blue)
    dec5 = draw_neo_box(slide5, Inches(0.8), Inches(5.6), Inches(11.7), Inches(1.5), c_cyan, border_width=3.0)
    tf = dec5.text_frame
    tf.margin_left = Inches(0.35)
    tf.margin_right = Inches(0.35)
    tf.margin_top = Inches(0.15)

    p = tf.paragraphs[0]
    p.text = "WHICH LOAN WOULD YOU CHOOSE?  —  FINAL DECISION: LOAN C (PARENTS)"
    p.font.name = font_display
    p.font.size = Pt(13)
    p.font.color.rgb = c_black

    p2 = tf.add_paragraph()
    p2.text = "• Lowest Monthly Payment: Loan D has lower payment ($273.43/mo vs. $292.42/mo — $18.99 cheaper).\n• Lowest Total Interest: Loan C has much lower interest ($3,045.00 vs. $5,187.23 — saves $2,142.23).\n• Final Choice: I choose Loan C. Paying $18.99 more per month saves over $2,142 in interest and eliminates debt 1 year faster."
    p2.font.name = font_body
    p2.font.bold = True
    p2.font.size = Pt(11)
    p2.font.color.rgb = c_black

    # =========================================================================
    # SLIDE 6: FOLLOW-UP QUESTIONS & PITCH TO PARENTS (Matching Page 6 Style!)
    # =========================================================================
    slide6 = prs.slides.add_slide(blank_layout)
    add_slide_canvas(slide6)
    add_top_nav(slide6, "Career & Budget Reflection: Pitch to Parents", "SLIDE 06 / 06")

    # Left Column: Two Large Stacked Question Cards (Matching Page 6 of reference PDF!)
    q_card_w = Inches(7.5)

    # Question Card 1
    q1_card = draw_neo_box(slide6, Inches(0.8), Inches(1.45), q_card_w, Inches(2.6), c_white, border_width=3.0)
    tf = q1_card.text_frame
    tf.margin_left = Inches(0.4)
    tf.margin_right = Inches(0.4)
    tf.margin_top = Inches(0.2)
    p = tf.paragraphs[0]
    p.text = "1. WHICH CAR & MONTHLY PAYMENT DID YOU PICK? DOES IT FIT YOUR BUDGET?"
    p.font.name = font_display
    p.font.size = Pt(11.5)
    p.font.color.rgb = c_black
    p.space_after = Pt(6)

    p2 = tf.add_paragraph()
    p2.text = "• Chosen Car & Loan: 2023 Nissan Rogue S AWD with Loan A ($229.42 / mo) or Loan B ($214.56 / mo).\n• Monthly Transportation Budget (11%): $150.48 / month ($1,368.00 gross monthly income × 0.11).\n• Does it fit? No, the vehicle payment alone exceeds my $150.48 budget by $64.08 (Loan B) or $78.94 (Loan A). Adding insurance creates a substantial gap that requires budget restructuring."
    p2.font.name = font_body
    p2.font.size = Pt(11)
    p2.font.color.rgb = c_black

    # Question Card 2
    q2_card = draw_neo_box(slide6, Inches(0.8), Inches(4.35), q_card_w, Inches(2.6), c_white, border_width=3.0)
    tf = q2_card.text_frame
    tf.margin_left = Inches(0.4)
    tf.margin_right = Inches(0.4)
    tf.margin_top = Inches(0.2)
    p = tf.paragraphs[0]
    p.text = "2. WHAT IS INSURANCE & TOTAL PAYMENT? HOW WILL YOU AFFORD IT?"
    p.font.name = font_display
    p.font.size = Pt(11.5)
    p.font.color.rgb = c_black
    p.space_after = Pt(6)

    p2 = tf.add_paragraph()
    p2.text = "• Expected Insurance: $245.00 / month based on researched average teen rates on a parent's policy.\n• Total Monthly Transportation Outlay: $474.42 / month ($229.42 car loan + $245.00 insurance; or $459.56 with Loan B).\n• Commitment: 1) Increase weekly hours at Target from 24 to 32 hrs/wk (+1 shift = +$456.00/mo gross), boosting income to $1,824.00/mo; 2) Cut personal dining/entertainment spending; 3) Save $1,500+ down payment beforehand."
    p2.font.name = font_body
    p2.font.size = Pt(11)
    p2.font.color.rgb = c_black

    # Right Column: Dealership Image + Key Takeaway Pill
    r_img_x = Inches(8.6)
    r_img_w = Inches(3.9)

    img_card6 = draw_neo_box(slide6, r_img_x, Inches(1.45), r_img_w, Inches(3.0), c_white, border_width=3.0)
    dealer_img = "Car_Buying_Project/images/car_dealership.jpg"
    if os.path.exists(dealer_img):
        slide6.shapes.add_picture(dealer_img, r_img_x + Inches(0.12), Inches(1.57), width=r_img_w - Inches(0.24), height=Inches(2.75))

    # Bottom Right Action Pill (Sky Blue, matching PDF Callouts!)
    callout6 = draw_neo_box(slide6, r_img_x, Inches(4.65), r_img_w, Inches(2.3), c_cyan, border_width=3.0)
    tf = callout6.text_frame
    tf.margin_left = Inches(0.25)
    tf.margin_right = Inches(0.25)
    tf.margin_top = Inches(0.18)
    p = tf.paragraphs[0]
    p.text = "KEY TAKEAWAY FOR PARENTS:"
    p.font.name = font_display
    p.font.size = Pt(11)
    p.font.color.rgb = c_black

    p2 = tf.add_paragraph()
    p2.text = "By picking up one extra 8-hour shift at Target each week, I will earn an extra $456/month gross, completely covering the $474.42 monthly vehicle and insurance obligation while learning real financial responsibility."
    p2.font.name = font_body
    p2.font.bold = True
    p2.font.size = Pt(10.5)
    p2.font.color.rgb = c_black

    # Save PPTX
    out_path = "Car_Buying_Project/Buying_Your_First_Car_Presentation.pptx"
    prs.save(out_path)
    print("New Neo-Brutalism Presentation saved to:", out_path)

if __name__ == "__main__":
    create_deck()
