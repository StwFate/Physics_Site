import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

def build_presentation():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Clean Color Palette
    c_canvas = RGBColor(248, 250, 252)        # Slate 50
    c_white = RGBColor(255, 255, 255)         # Pure White
    c_slate_900 = RGBColor(15, 23, 42)        # Slate 900
    c_slate_800 = RGBColor(30, 41, 59)        # Slate 800
    c_slate_600 = RGBColor(71, 85, 105)       # Slate 600
    c_border = RGBColor(226, 232, 240)        # Slate 200
    
    # Accent Colors
    c_blue = RGBColor(37, 99, 235)            # Blue
    c_blue_tint = RGBColor(239, 246, 255)
    c_blue_border = RGBColor(191, 219, 254)
    
    c_emerald = RGBColor(5, 150, 105)         # Emerald
    c_emerald_tint = RGBColor(236, 253, 245)
    c_emerald_border = RGBColor(167, 243, 208)

    c_amber = RGBColor(217, 119, 6)           # Amber
    c_amber_tint = RGBColor(254, 243, 199)
    c_amber_border = RGBColor(253, 230, 138)

    font_main = "Segoe UI"

    def apply_canvas_background(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = c_canvas
        bg.line.fill.background()

    def add_card(slide, left, top, width, height, bg_color=c_white, border_color=c_border, border_width=1.0):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = bg_color
        if border_color:
            card.line.color.rgb = border_color
            card.line.width = Pt(border_width)
        else:
            card.line.fill.background()
        return card

    def add_slide_header(slide, slide_num, title, category_tag, tag_bg=c_blue_tint, tag_fg=c_blue, tag_border=c_blue_border):
        # Category Tag Pill
        tag = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.4), Inches(2.3), Inches(0.32))
        tag.fill.solid()
        tag.fill.fore_color.rgb = tag_bg
        tag.line.color.rgb = tag_border
        tag.line.width = Pt(1.0)
        tf = tag.text_frame
        tf.vertical_anchor = MSO_ANCHOR.MIDDLE
        tf.margin_top = Inches(0)
        p = tf.paragraphs[0]
        p.text = category_tag.upper()
        p.alignment = PP_ALIGN.CENTER
        p.font.name = font_main
        p.font.size = Pt(9.5)
        p.font.bold = True
        p.font.color.rgb = tag_fg

        # Slide Title
        t_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.72), Inches(8.5), Inches(0.55))
        tf = t_box.text_frame
        tf.margin_top = Inches(0)
        p = tf.paragraphs[0]
        p.text = title
        p.font.name = font_main
        p.font.size = Pt(21)
        p.font.bold = True
        p.font.color.rgb = c_slate_900

        # Right Meta Badge
        meta = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(10.133), Inches(0.48), Inches(2.4), Inches(0.45))
        meta.fill.solid()
        meta.fill.fore_color.rgb = c_white
        meta.line.color.rgb = c_border
        meta.line.width = Pt(1.0)
        tf = meta.text_frame
        tf.vertical_anchor = MSO_ANCHOR.MIDDLE
        p = tf.paragraphs[0]
        p.text = f"SLIDE {slide_num:02d} OF 06 • REHAN MANGAR"
        p.alignment = PP_ALIGN.CENTER
        p.font.name = font_main
        p.font.size = Pt(9)
        p.font.bold = True
        p.font.color.rgb = c_slate_600

        # Divider Line
        div = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(1.3), Inches(11.733), Inches(0.015))
        div.fill.solid()
        div.fill.fore_color.rgb = c_border
        div.line.fill.background()

    # =========================================================================
    # SLIDE 1: JOB PROFILE & BUDGET BASELINE
    # =========================================================================
    slide1 = prs.slides.add_slide(blank_layout)
    apply_canvas_background(slide1)
    add_slide_header(slide1, 1, "Employment Profile & Transportation Budget", "Job Profile")

    # Left Container: Job Details & Income
    card1_l = add_card(slide1, Inches(0.8), Inches(1.5), Inches(6.4), Inches(5.4))
    tf1 = card1_l.text_frame
    tf1.margin_left = Inches(0.4)
    tf1.margin_right = Inches(0.4)
    tf1.margin_top = Inches(0.35)

    p = tf1.paragraphs[0]
    p.text = "Target Team Member"
    p.font.name = font_main
    p.font.size = Pt(22)
    p.font.bold = True
    p.font.color.rgb = c_slate_900
    p.space_after = Pt(14)

    income_metrics = [
        ("Hourly Pay Rate", "$14.25 / hr"),
        ("Work Schedule", "24 hours / week"),
        ("Gross Weekly Pay", "$342.00 / week ($14.25 × 24 hrs)"),
        ("Gross Monthly Pay", "$1,368.00 / month ($342 × 4 weeks)")
    ]

    for lbl, val in income_metrics:
        p_row = tf1.add_paragraph()
        p_row.text = f"• {lbl}: "
        p_row.font.name = font_main
        p_row.font.bold = True
        p_row.font.size = Pt(12)
        p_row.font.color.rgb = c_slate_900
        r_val = p_row.add_run()
        r_val.text = val
        r_val.font.bold = False
        r_val.font.color.rgb = c_slate_800
        p_row.space_after = Pt(8)

    # Budget Box inside Left Card
    callout1 = add_card(slide1, Inches(1.15), Inches(4.9), Inches(5.7), Inches(1.7), c_amber_tint, c_amber_border)
    tf_c1 = callout1.text_frame
    tf_c1.margin_left = Inches(0.3)
    tf_c1.margin_right = Inches(0.3)
    tf_c1.margin_top = Inches(0.2)
    p = tf_c1.paragraphs[0]
    p.text = "11% TRANSPORTATION BUDGET"
    p.font.name = font_main
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = c_amber

    p_amt = tf_c1.add_paragraph()
    p_amt.text = "$150.48 / month"
    p_amt.font.name = font_main
    p_amt.font.size = Pt(22)
    p_amt.font.bold = True
    p_amt.font.color.rgb = c_slate_900

    p_expl = tf_c1.add_paragraph()
    p_expl.text = "Calculation: $1,368.00 gross monthly pay × 0.11 budget allocation."
    p_expl.font.name = font_main
    p_expl.font.size = Pt(10)
    p_expl.font.color.rgb = c_slate_600

    # Right Container: Real Target Store Photo
    card1_r = add_card(slide1, Inches(7.5), Inches(1.5), Inches(5.033), Inches(5.4))
    target_img = "Car_Buying_Project/images/target_store.jpg"
    if os.path.exists(target_img):
        slide1.shapes.add_picture(target_img, Inches(7.75), Inches(1.75), width=Inches(4.533), height=Inches(3.3))

    banner1 = add_card(slide1, Inches(7.75), Inches(5.25), Inches(4.533), Inches(1.35), c_blue_tint, c_blue_border)
    tf_b1 = banner1.text_frame
    tf_b1.margin_left = Inches(0.25)
    tf_b1.margin_right = Inches(0.25)
    tf_b1.margin_top = Inches(0.2)
    p = tf_b1.paragraphs[0]
    p.text = "Target Employment"
    p.font.name = font_main
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = c_blue
    p2 = tf_b1.add_paragraph()
    p2.text = "Working 24 hours per week at Target earns $1,368/month to pay for a car and build savings."
    p2.font.name = font_main
    p2.font.size = Pt(10.5)
    p2.font.color.rgb = c_slate_800

    # =========================================================================
    # SLIDE 2: CAR #1 (2023 Nissan Rogue S AWD)
    # =========================================================================
    slide2 = prs.slides.add_slide(blank_layout)
    apply_canvas_background(slide2)
    add_slide_header(slide2, 2, "Car #1 Overview: 2023 Nissan Rogue S AWD", "Car #1")

    # Left Column: Car Image + Stats
    card2_l = add_card(slide2, Inches(0.8), Inches(1.5), Inches(5.6), Inches(5.4))
    nissan_img = "Car_Buying_Project/images/nissan_rogue.jpg"
    if os.path.exists(nissan_img):
        slide2.shapes.add_picture(nissan_img, Inches(1.05), Inches(1.75), width=Inches(5.1), height=Inches(3.1))

    # Metric 1: Price
    m1_box = add_card(slide2, Inches(1.05), Inches(5.05), Inches(2.45), Inches(1.6), c_blue_tint, c_blue_border)
    tf = m1_box.text_frame
    tf.margin_top = Inches(0.18)
    p = tf.paragraphs[0]
    p.text = "PURCHASE PRICE"
    p.alignment = PP_ALIGN.CENTER
    p.font.name = font_main
    p.font.size = Pt(10)
    p.font.bold = True
    p.font.color.rgb = c_blue
    p2 = tf.add_paragraph()
    p2.text = "$11,376"
    p2.alignment = PP_ALIGN.CENTER
    p2.font.name = font_main
    p2.font.size = Pt(22)
    p2.font.bold = True
    p2.font.color.rgb = c_slate_900

    # Metric 2: Fuel
    m2_box = add_card(slide2, Inches(3.7), Inches(5.05), Inches(2.45), Inches(1.6), c_amber_tint, c_amber_border)
    tf = m2_box.text_frame
    tf.margin_top = Inches(0.18)
    p = tf.paragraphs[0]
    p.text = "TANK FILL-UP COST"
    p.alignment = PP_ALIGN.CENTER
    p.font.name = font_main
    p.font.size = Pt(10)
    p.font.bold = True
    p.font.color.rgb = c_amber
    p2 = tf.add_paragraph()
    p2.text = "$56.41"
    p2.alignment = PP_ALIGN.CENTER
    p2.font.name = font_main
    p2.font.size = Pt(22)
    p2.font.bold = True
    p2.font.color.rgb = c_slate_900
    p3 = tf.add_paragraph()
    p3.text = "14.5 Gal × $3.89/gal"
    p3.alignment = PP_ALIGN.CENTER
    p3.font.name = font_main
    p3.font.size = Pt(9.5)
    p3.font.color.rgb = c_slate_600

    # Right Column: Features and Choice
    right_x = Inches(6.65)
    right_w = Inches(5.883)

    c2_1 = add_card(slide2, right_x, Inches(1.5), right_w, Inches(3.1))
    tf = c2_1.text_frame
    tf.margin_left = Inches(0.35)
    tf.margin_right = Inches(0.35)
    tf.margin_top = Inches(0.25)
    p = tf.paragraphs[0]
    p.text = "Features & Safety Options"
    p.font.name = font_main
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = c_blue
    p.space_after = Pt(8)

    features_1 = [
        "Apple CarPlay and Android Auto smartphone connection",
        "Backup camera and automatic emergency braking",
        "Keyless entry with push-button start",
        "Blind spot warning and lane departure alerts",
        "Intelligent all-wheel drive (AWD) for rain and snow"
    ]
    for feat in features_1:
        p_row = tf.add_paragraph()
        p_row.text = f"• {feat}"
        p_row.font.name = font_main
        p_row.font.size = Pt(11)
        p_row.font.color.rgb = c_slate_800
        p_row.space_after = Pt(4)

    c2_2 = add_card(slide2, right_x, Inches(4.8), right_w, Inches(2.1))
    tf = c2_2.text_frame
    tf.margin_left = Inches(0.35)
    tf.margin_right = Inches(0.35)
    tf.margin_top = Inches(0.25)
    p = tf.paragraphs[0]
    p.text = "Why I Chose This Car"
    p.font.name = font_main
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = c_slate_900
    p.space_after = Pt(6)
    p2 = tf.add_paragraph()
    p2.text = "Clean Carfax with no accident reports, no exterior damage, reliable all-wheel drive for winter weather, and well under the $20,000 budget."
    p2.font.name = font_main
    p2.font.size = Pt(11)
    p2.font.color.rgb = c_slate_800

    # =========================================================================
    # SLIDE 3: CAR #1 FINANCING (Loan A vs Loan B)
    # =========================================================================
    slide3 = prs.slides.add_slide(blank_layout)
    apply_canvas_background(slide3)
    add_slide_header(slide3, 3, "Car #1 Financing: Nissan Rogue Loans", "Financing", c_emerald_tint, c_emerald, c_emerald_border)

    col_w = Inches(5.7)

    # Loan A Card
    card3_a = add_card(slide3, Inches(0.8), Inches(1.5), col_w, Inches(3.7), c_white, c_emerald_border, border_width=1.5)
    tf = card3_a.text_frame
    tf.margin_left = Inches(0.4)
    tf.margin_right = Inches(0.4)
    tf.margin_top = Inches(0.25)

    p = tf.paragraphs[0]
    p.text = "LOAN A (PARENTS) — RECOMMENDED"
    p.font.name = font_main
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = c_emerald

    p_amt = tf.add_paragraph()
    p_amt.text = "$229.42 / month"
    p_amt.font.name = font_main
    p_amt.font.size = Pt(24)
    p_amt.font.bold = True
    p_amt.font.color.rgb = c_slate_900
    p_amt.space_after = Pt(8)

    specs_a = [
        "4.2% Simple Interest / 5 Years (60 months)",
        "Interest: $11,376 × 0.042 × 5 = $2,388.96",
        "Total Cost: $11,376 + $2,388.96 = $13,764.96",
        "Monthly Payment: $13,764.96 ÷ 60 = $229.42 / mo",
        "Saves $1,683.12 in interest compared to the bank loan."
    ]
    for s in specs_a:
        p_row = tf.add_paragraph()
        p_row.text = f"• {s}"
        p_row.font.name = font_main
        p_row.font.size = Pt(11)
        p_row.font.bold = "Saves" in s
        p_row.font.color.rgb = c_emerald if "Saves" in s else c_slate_800
        p_row.space_after = Pt(3)

    # Loan B Card
    card3_b = add_card(slide3, Inches(6.833), Inches(1.5), col_w, Inches(3.7))
    tf = card3_b.text_frame
    tf.margin_left = Inches(0.4)
    tf.margin_right = Inches(0.4)
    tf.margin_top = Inches(0.25)

    p = tf.paragraphs[0]
    p.text = "LOAN B (COMMERCIAL BANK)"
    p.font.name = font_main
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = c_blue

    p_amt = tf.add_paragraph()
    p_amt.text = "$214.56 / month"
    p_amt.font.name = font_main
    p_amt.font.size = Pt(24)
    p_amt.font.bold = True
    p_amt.font.color.rgb = c_slate_900
    p_amt.space_after = Pt(8)

    specs_b = [
        "5.1% Compound Interest (Daily) / 6 Years (72 months)",
        "Formula: $11,376 × (1 + 0.051/365)^2190 = $15,448.08",
        "Total Interest Paid: $15,448.08 - $11,376 = $4,072.08",
        "Monthly Payment: $15,448.08 ÷ 72 = $214.56 / mo",
        "Daily compounding adds $1,683 in extra interest."
    ]
    for s in specs_b:
        p_row = tf.add_paragraph()
        p_row.text = f"• {s}"
        p_row.font.name = font_main
        p_row.font.size = Pt(11)
        p_row.font.color.rgb = c_slate_800
        p_row.space_after = Pt(3)

    # Bottom Decision Banner
    dec3 = add_card(slide3, Inches(0.8), Inches(5.45), Inches(11.733), Inches(1.45), c_emerald_tint, c_emerald_border)
    tf = dec3.text_frame
    tf.margin_left = Inches(0.35)
    tf.margin_right = Inches(0.35)
    tf.margin_top = Inches(0.18)
    p = tf.paragraphs[0]
    p.text = "WHICH LOAN WOULD YOU CHOOSE?"
    p.font.name = font_main
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = c_emerald

    p2 = tf.add_paragraph()
    p2.text = "• Lowest Monthly Payment: Loan B ($214.56/mo vs. $229.42/mo — $14.86 cheaper per month).\n• Lowest Total Interest: Loan A ($2,388.96 vs. $4,072.08 — saves $1,683.12).\n• My Choice: Loan A. Paying $14.86 more per month saves over $1,683 in interest and finishes 12 months sooner."
    p2.font.name = font_main
    p2.font.size = Pt(10.5)
    p2.font.color.rgb = c_slate_800

    # =========================================================================
    # SLIDE 4: CAR #2 (2012 Jeep Wrangler Unlimited Sport 4WD)
    # =========================================================================
    slide4 = prs.slides.add_slide(blank_layout)
    apply_canvas_background(slide4)
    add_slide_header(slide4, 4, "Car #2 Overview: 2012 Jeep Wrangler Unlimited", "Car #2")

    # Left Column: Car Image + Stats
    card4_l = add_card(slide4, Inches(0.8), Inches(1.5), Inches(5.6), Inches(5.4))
    jeep_img = "Car_Buying_Project/images/jeep_wrangler.jpg"
    if os.path.exists(jeep_img):
        slide4.shapes.add_picture(jeep_img, Inches(1.05), Inches(1.75), width=Inches(5.1), height=Inches(3.1))

    # Metric 1: Price
    m1_4 = add_card(slide4, Inches(1.05), Inches(5.05), Inches(2.45), Inches(1.6), c_blue_tint, c_blue_border)
    tf = m1_4.text_frame
    tf.margin_top = Inches(0.18)
    p = tf.paragraphs[0]
    p.text = "PURCHASE PRICE"
    p.alignment = PP_ALIGN.CENTER
    p.font.name = font_main
    p.font.size = Pt(10)
    p.font.bold = True
    p.font.color.rgb = c_blue
    p2 = tf.add_paragraph()
    p2.text = "$8,995"
    p2.alignment = PP_ALIGN.CENTER
    p2.font.name = font_main
    p2.font.size = Pt(22)
    p2.font.bold = True
    p2.font.color.rgb = c_slate_900

    # Metric 2: Fuel
    m2_4 = add_card(slide4, Inches(3.7), Inches(5.05), Inches(2.45), Inches(1.6), c_amber_tint, c_amber_border)
    tf = m2_4.text_frame
    tf.margin_top = Inches(0.18)
    p = tf.paragraphs[0]
    p.text = "TANK FILL-UP COST"
    p.alignment = PP_ALIGN.CENTER
    p.font.name = font_main
    p.font.size = Pt(10)
    p.font.bold = True
    p.font.color.rgb = c_amber
    p2 = tf.add_paragraph()
    p2.text = "$87.53"
    p2.alignment = PP_ALIGN.CENTER
    p2.font.name = font_main
    p2.font.size = Pt(22)
    p2.font.bold = True
    p2.font.color.rgb = c_slate_900
    p3 = tf.add_paragraph()
    p3.text = "22.5 Gal × $3.89/gal"
    p3.alignment = PP_ALIGN.CENTER
    p3.font.name = font_main
    p3.font.size = Pt(9.5)
    p3.font.color.rgb = c_slate_600

    # Right Column: Features and Choice
    c4_1 = add_card(slide4, right_x, Inches(1.5), right_w, Inches(3.1))
    tf = c4_1.text_frame
    tf.margin_left = Inches(0.35)
    tf.margin_right = Inches(0.35)
    tf.margin_top = Inches(0.25)
    p = tf.paragraphs[0]
    p.text = "Features & Safety Options"
    p.font.name = font_main
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = c_blue
    p.space_after = Pt(8)

    features_2 = [
        "Command-Trac shift-on-the-fly 4-wheel drive (4WD)",
        "Durable wash-out interior with floor drain plugs",
        "Removable soft top and full steel doors",
        "Electronic stability control (ESC) & roll mitigation (ERM)",
        "Hill start assist (HSA) and 4-wheel anti-lock brakes (ABS)"
    ]
    for feat in features_2:
        p_row = tf.add_paragraph()
        p_row.text = f"• {feat}"
        p_row.font.name = font_main
        p_row.font.size = Pt(11)
        p_row.font.color.rgb = c_slate_800
        p_row.space_after = Pt(4)

    c4_2 = add_card(slide4, right_x, Inches(4.8), right_w, Inches(2.1))
    tf = c4_2.text_frame
    tf.margin_left = Inches(0.35)
    tf.margin_right = Inches(0.35)
    tf.margin_top = Inches(0.25)
    p = tf.paragraphs[0]
    p.text = "Why I Chose This Car"
    p.font.name = font_main
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = c_slate_900
    p.space_after = Pt(6)
    p2 = tf.add_paragraph()
    p2.text = "It is a great deal at $8,995, offering true 4WD capability, simple durable maintenance, and huge budget savings."
    p2.font.name = font_main
    p2.font.size = Pt(11)
    p2.font.color.rgb = c_slate_800

    # =========================================================================
    # SLIDE 5: CAR #2 FINANCING (Loan C vs Loan D)
    # =========================================================================
    slide5 = prs.slides.add_slide(blank_layout)
    apply_canvas_background(slide5)
    add_slide_header(slide5, 5, "Car #2 Financing: Jeep Wrangler Loans", "Financing", c_emerald_tint, c_emerald, c_emerald_border)

    # Loan C Card
    card5_c = add_card(slide5, Inches(0.8), Inches(1.5), col_w, Inches(3.7), c_white, c_emerald_border, border_width=1.5)
    tf = card5_c.text_frame
    tf.margin_left = Inches(0.4)
    tf.margin_right = Inches(0.4)
    tf.margin_top = Inches(0.25)

    p = tf.paragraphs[0]
    p.text = "LOAN C (PARENTS) — RECOMMENDED"
    p.font.name = font_main
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = c_emerald

    p_amt = tf.add_paragraph()
    p_amt.text = "$181.40 / month"
    p_amt.font.name = font_main
    p_amt.font.size = Pt(24)
    p_amt.font.bold = True
    p_amt.font.color.rgb = c_slate_900
    p_amt.space_after = Pt(8)

    specs_c = [
        "4.2% Simple Interest / 5 Years (60 months)",
        "Interest: $8,995 × 0.042 × 5 = $1,888.95",
        "Total Cost: $8,995 + $1,888.95 = $10,883.95",
        "Monthly Payment: $10,883.95 ÷ 60 = $181.40 / mo",
        "Saves $1,330.84 in interest compared to the bank loan."
    ]
    for s in specs_c:
        p_row = tf.add_paragraph()
        p_row.text = f"• {s}"
        p_row.font.name = font_main
        p_row.font.size = Pt(11)
        p_row.font.bold = "Saves" in s
        p_row.font.color.rgb = c_emerald if "Saves" in s else c_slate_800
        p_row.space_after = Pt(3)

    # Loan D Card
    card5_d = add_card(slide5, Inches(6.833), Inches(1.5), col_w, Inches(3.7))
    tf = card5_d.text_frame
    tf.margin_left = Inches(0.4)
    tf.margin_right = Inches(0.4)
    tf.margin_top = Inches(0.25)

    p = tf.paragraphs[0]
    p.text = "LOAN D (COMMERCIAL BANK)"
    p.font.name = font_main
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = c_blue

    p_amt = tf.add_paragraph()
    p_amt.text = "$169.65 / month"
    p_amt.font.name = font_main
    p_amt.font.size = Pt(24)
    p_amt.font.bold = True
    p_amt.font.color.rgb = c_slate_900
    p_amt.space_after = Pt(8)

    specs_d = [
        "5.1% Compound Interest (Daily) / 6 Years (72 months)",
        "Formula: $8,995 × (1 + 0.051/365)^2190 = $12,214.79",
        "Total Interest Paid: $12,214.79 - $8,995 = $3,219.79",
        "Monthly Payment: $12,214.79 ÷ 72 = $169.65 / mo",
        "Daily compounding adds $1,330 in extra interest."
    ]
    for s in specs_d:
        p_row = tf.add_paragraph()
        p_row.text = f"• {s}"
        p_row.font.name = font_main
        p_row.font.size = Pt(11)
        p_row.font.color.rgb = c_slate_800
        p_row.space_after = Pt(3)

    # Bottom Decision Banner
    dec5 = add_card(slide5, Inches(0.8), Inches(5.45), Inches(11.733), Inches(1.45), c_emerald_tint, c_emerald_border)
    tf = dec5.text_frame
    tf.margin_left = Inches(0.35)
    tf.margin_right = Inches(0.35)
    tf.margin_top = Inches(0.18)
    p = tf.paragraphs[0]
    p.text = "WHICH LOAN WOULD YOU CHOOSE?"
    p.font.name = font_main
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = c_emerald

    p2 = tf.add_paragraph()
    p2.text = "• Lowest Monthly Payment: Loan D ($169.65/mo vs. $181.40/mo — $11.75 cheaper per month).\n• Lowest Total Interest: Loan C ($1,888.95 vs. $3,219.79 — saves $1,330.84).\n• My Choice: Loan C. Paying $11.75 more per month saves over $1,330 in interest and finishes 12 months sooner."
    p2.font.name = font_main
    p2.font.size = Pt(10.5)
    p2.font.color.rgb = c_slate_800

    # =========================================================================
    # SLIDE 6: PITCH TO PARENTS (Answering All 5 Rubric Questions Directly)
    # =========================================================================
    slide6 = prs.slides.add_slide(blank_layout)
    apply_canvas_background(slide6)
    add_slide_header(slide6, 6, "Pitch to Parents: Follow-Up Questions", "Parent Pitch")

    # Left Column: The 5 Rubric Questions
    card6_l = add_card(slide6, Inches(0.8), Inches(1.5), Inches(6.8), Inches(5.4))
    tf = card6_l.text_frame
    tf.margin_left = Inches(0.4)
    tf.margin_right = Inches(0.4)
    tf.margin_top = Inches(0.3)

    p = tf.paragraphs[0]
    p.text = "Follow-Up Questions"
    p.font.name = font_main
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = c_blue
    p.space_after = Pt(10)

    qa_list = [
        ("1. Chosen Car & Loan", "2023 Nissan Rogue S AWD with Loan A ($229.42 / mo).\n   (Alternative: 2012 Jeep Wrangler with Loan C at $181.40 / mo)."),
        ("2. Transportation Budget (11%)", "$150.48 / month ($1,368.00 gross income × 0.11)."),
        ("3. Does it fit your budget?", "No. The car payment exceeds my $150.48 budget by $78.94 (Rogue) or $30.92 (Jeep) before insurance."),
        ("4. Researched Car Insurance", "$245.00 / month (average teen rate on parents' policy)."),
        ("5. Total Monthly Payment", "$474.42 / month ($229.42 loan + $245.00 insurance;\nor $426.40 / mo for the Jeep).")
    ]

    for q, a in qa_list:
        p_q = tf.add_paragraph()
        p_q.text = f"{q}: "
        p_q.font.name = font_main
        p_q.font.bold = True
        p_q.font.size = Pt(11)
        p_q.font.color.rgb = c_slate_900

        r_a = p_q.add_run()
        r_a.text = a
        r_a.font.bold = False
        r_a.font.color.rgb = c_slate_800
        p_q.space_after = Pt(6)

    # Right Column: Dealership Image + 3 Budget Actions
    card6_r = add_card(slide6, Inches(7.8), Inches(1.5), Inches(4.733), Inches(5.4))
    dealer_img = "Car_Buying_Project/images/car_dealership.jpg"
    if os.path.exists(dealer_img):
        slide6.shapes.add_picture(dealer_img, Inches(8.05), Inches(1.75), width=Inches(4.233), height=Inches(2.5))

    banner6 = add_card(slide6, Inches(8.05), Inches(4.45), Inches(4.233), Inches(2.2), c_emerald_tint, c_emerald_border)
    tf = banner6.text_frame
    tf.margin_left = Inches(0.25)
    tf.margin_right = Inches(0.25)
    tf.margin_top = Inches(0.18)
    p = tf.paragraphs[0]
    p.text = "How I Will Afford It"
    p.font.name = font_main
    p.font.size = Pt(11.5)
    p.font.bold = True
    p.font.color.rgb = c_emerald
    p.space_after = Pt(4)

    steps = [
        "Pick up 1 extra Target shift per week (32 hrs/wk = +$456/mo gross).",
        "Cut dining out and entertainment spending ($100+/mo).",
        "Put down $1,500 cash from savings to lower loan payments."
    ]
    for st in steps:
        p_row = tf.add_paragraph()
        p_row.text = f"• {st}"
        p_row.font.name = font_main
        p_row.font.size = Pt(10)
        p_row.font.color.rgb = c_slate_800
        p_row.space_after = Pt(2)

    out_path = "Car_Buying_Project/Buying_Your_First_Car_Presentation.pptx"
    prs.save(out_path)
    print("Presentation successfully updated with clean, direct, slop-free copy:", out_path)

if __name__ == "__main__":
    build_presentation()
