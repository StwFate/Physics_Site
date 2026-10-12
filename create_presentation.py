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

    # Refined Modern Color Palette (Clean Executive / Automotive FinTech)
    c_canvas = RGBColor(248, 250, 252)       # Slate 50 (#F8FAFC)
    c_white = RGBColor(255, 255, 255)        # Pure White
    c_slate_900 = RGBColor(15, 23, 42)       # Slate 900 - Primary text & headers
    c_slate_800 = RGBColor(30, 41, 59)       # Slate 800 - Strong body
    c_slate_600 = RGBColor(71, 85, 105)      # Slate 600 - Secondary text
    c_slate_400 = RGBColor(148, 163, 184)    # Slate 400 - Muted meta
    c_border = RGBColor(226, 232, 240)       # Slate 200 - Card borders
    c_border_subtle = RGBColor(241, 245, 249)# Slate 100
    
    # Accent Colors
    c_blue_primary = RGBColor(37, 99, 235)   # Cobalt Blue (#2563EB)
    c_blue_tint = RGBColor(239, 246, 255)    # Blue 50
    c_blue_border = RGBColor(191, 219, 254)  # Blue 200
    
    c_emerald = RGBColor(5, 150, 105)        # Emerald Green (#059669) - Wins/Savings
    c_emerald_tint = RGBColor(236, 253, 245) # Emerald 50
    c_emerald_border = RGBColor(167, 243, 208)

    c_amber = RGBColor(217, 119, 6)          # Amber (#D97706) - Fuel/Budget
    c_amber_tint = RGBColor(254, 243, 199)
    c_amber_border = RGBColor(253, 230, 138)

    c_red = RGBColor(220, 38, 38)            # Crimson Red - Target / Alert
    c_red_tint = RGBColor(254, 242, 242)

    font_title = "Segoe UI"
    font_body = "Segoe UI"

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

    def add_slide_header(slide, slide_num, title, category_tag, tag_bg=c_blue_tint, tag_fg=c_blue_primary, tag_border=c_blue_border):
        # Category Tag Pill
        tag = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.4), Inches(2.6), Inches(0.32))
        tag.fill.solid()
        tag.fill.fore_color.rgb = tag_bg
        tag.line.color.rgb = tag_border
        tag.line.width = Pt(1.0)
        tf = tag.text_frame
        tf.word_wrap = True
        tf.vertical_anchor = MSO_ANCHOR.MIDDLE
        tf.margin_top = Inches(0)
        p = tf.paragraphs[0]
        p.text = category_tag.upper()
        p.alignment = PP_ALIGN.CENTER
        p.font.name = font_title
        p.font.size = Pt(9.5)
        p.font.bold = True
        p.font.color.rgb = tag_fg

        # Slide Title
        t_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.72), Inches(8.5), Inches(0.55))
        tf = t_box.text_frame
        tf.word_wrap = True
        tf.margin_top = Inches(0)
        p = tf.paragraphs[0]
        p.text = title
        p.font.name = font_title
        p.font.size = Pt(21)
        p.font.bold = True
        p.font.color.rgb = c_slate_900

        # Right Meta Badge (Minimalist)
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
        p.font.name = font_title
        p.font.size = Pt(9)
        p.font.bold = True
        p.font.color.rgb = c_slate_600

        # Elegant Divider Line
        div = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(1.3), Inches(11.733), Inches(0.015))
        div.fill.solid()
        div.fill.fore_color.rgb = c_border
        div.line.fill.background()

    # =========================================================================
    # SLIDE 1: TITLE & EMPLOYMENT OVERVIEW
    # =========================================================================
    slide1 = prs.slides.add_slide(blank_layout)
    apply_canvas_background(slide1)
    add_slide_header(slide1, 1, "Employment Profile & Transportation Budget Baseline", "Assigned Job Profile", c_red_tint, c_red, RGBColor(254, 202, 202))

    # Left Container: Job Details & Income Calculations (Card)
    card1_l = add_card(slide1, Inches(0.8), Inches(1.5), Inches(6.8), Inches(5.4))
    tf1 = card1_l.text_frame
    tf1.margin_left = Inches(0.4)
    tf1.margin_right = Inches(0.4)
    tf1.margin_top = Inches(0.35)

    p = tf1.paragraphs[0]
    p.text = "PERSONAL FINANCE FOUNDATION"
    p.font.name = font_title
    p.font.size = Pt(10.5)
    p.font.bold = True
    p.font.color.rgb = c_blue_primary

    p_title = tf1.add_paragraph()
    p_title.text = "Target Team Member"
    p_title.font.name = font_title
    p_title.font.size = Pt(22)
    p_title.font.bold = True
    p_title.font.color.rgb = c_slate_900
    p_title.space_after = Pt(12)

    # 4 Key Financial Metrics (Mini Cards)
    sub_metrics = [
        ("Hourly Pay Rate", "$14.25 / hr", "Assigned entry-level starting wage"),
        ("Work Schedule", "24 hrs / week", "Part-time school-year schedule"),
        ("Gross Weekly Income", "$342.00 / week", "24 hours × $14.25 / hr"),
        ("Gross Monthly Income", "$1,368.00 / mo", "$342.00 / week × 4 weeks")
    ]

    for lbl, val, note in sub_metrics:
        p_row = tf1.add_paragraph()
        p_row.text = f"{lbl}: "
        p_row.font.name = font_title
        p_row.font.bold = True
        p_row.font.size = Pt(12.5)
        p_row.font.color.rgb = c_slate_900
        
        r_val = p_row.add_run()
        r_val.text = val
        r_val.font.bold = True
        r_val.font.size = Pt(13.5)
        r_val.font.color.rgb = c_blue_primary

        p_note = tf1.add_paragraph()
        p_note.text = f"   ↳ {note}"
        p_note.font.name = font_body
        p_note.font.size = Pt(10)
        p_note.font.color.rgb = c_slate_600
        p_note.space_after = Pt(4)

    # Highlighted Budget Callout inside Left Card
    callout1 = add_card(slide1, Inches(1.15), Inches(5.1), Inches(6.1), Inches(1.5), c_amber_tint, c_amber_border)
    tf_c1 = callout1.text_frame
    tf_c1.margin_left = Inches(0.3)
    tf_c1.margin_right = Inches(0.3)
    tf_c1.margin_top = Inches(0.18)
    p = tf_c1.paragraphs[0]
    p.text = "11% TRANSPORTATION BUDGET GUIDELINE"
    p.font.name = font_title
    p.font.size = Pt(10)
    p.font.bold = True
    p.font.color.rgb = c_amber

    p_amt = tf_c1.add_paragraph()
    p_amt.text = "$150.48 / month"
    p_amt.font.name = font_title
    p_amt.font.size = Pt(20)
    p_amt.font.bold = True
    p_amt.font.color.rgb = c_slate_900

    p_expl = tf_c1.add_paragraph()
    p_expl.text = "Calculation: $1,368.00 gross monthly income × 0.11 baseline budget allocation."
    p_expl.font.name = font_body
    p_expl.font.size = Pt(9.5)
    p_expl.font.color.rgb = c_slate_600

    # Right Container: Real Target Store Photo & Insight
    card1_r = add_card(slide1, Inches(7.8), Inches(1.5), Inches(4.733), Inches(5.4))
    
    target_img = "Car_Buying_Project/images/target_store.jpg"
    if os.path.exists(target_img):
        slide1.shapes.add_picture(target_img, Inches(8.05), Inches(1.75), width=Inches(4.233), height=Inches(3.1))

    # Caption card under photo
    banner1 = add_card(slide1, Inches(8.05), Inches(5.05), Inches(4.233), Inches(1.55), c_blue_tint, c_blue_border)
    tf_b1 = banner1.text_frame
    tf_b1.margin_left = Inches(0.25)
    tf_b1.margin_right = Inches(0.25)
    tf_b1.margin_top = Inches(0.18)
    p = tf_b1.paragraphs[0]
    p.text = "RELIABLE CASH FLOW FOUNDATION"
    p.font.name = font_title
    p.font.size = Pt(10)
    p.font.bold = True
    p.font.color.rgb = c_blue_primary
    p2 = tf_b1.add_paragraph()
    p2.text = "Consistent hourly employment provides the income stream necessary to finance and operate a vehicle responsibly during high school while building personal savings."
    p2.font.name = font_body
    p2.font.size = Pt(10)
    p2.font.color.rgb = c_slate_800

    # =========================================================================
    # SLIDE 2: CAR #1 OVERVIEW (2023 Nissan Rogue S AWD)
    # =========================================================================
    slide2 = prs.slides.add_slide(blank_layout)
    apply_canvas_background(slide2)
    add_slide_header(slide2, 2, "Car #1 Overview: 2023 Nissan Rogue S AWD", "Primary Vehicle Choice")

    # Left Column: Framed Car Image + Spec Highlights
    card2_l = add_card(slide2, Inches(0.8), Inches(1.5), Inches(5.6), Inches(5.4))
    
    nissan_img = "Car_Buying_Project/images/nissan_rogue.jpg"
    if os.path.exists(nissan_img):
        slide2.shapes.add_picture(nissan_img, Inches(1.05), Inches(1.75), width=Inches(5.1), height=Inches(3.1))

    # Two Metric Callouts under photo
    m1_box = add_card(slide2, Inches(1.05), Inches(5.05), Inches(2.45), Inches(1.6), c_blue_tint, c_blue_border)
    tf = m1_box.text_frame
    tf.margin_top = Inches(0.15)
    p = tf.paragraphs[0]
    p.text = "PURCHASE PRICE"
    p.alignment = PP_ALIGN.CENTER
    p.font.name = font_title
    p.font.size = Pt(9.5)
    p.font.bold = True
    p.font.color.rgb = c_blue_primary
    p2 = tf.add_paragraph()
    p2.text = "$11,376"
    p2.alignment = PP_ALIGN.CENTER
    p2.font.name = font_title
    p2.font.size = Pt(22)
    p2.font.bold = True
    p2.font.color.rgb = c_slate_900
    p3 = tf.add_paragraph()
    p3.text = "Under $20K project limit"
    p3.alignment = PP_ALIGN.CENTER
    p3.font.name = font_body
    p3.font.size = Pt(9.5)
    p3.font.color.rgb = c_slate_600

    m2_box = add_card(slide2, Inches(3.7), Inches(5.05), Inches(2.45), Inches(1.6), c_amber_tint, c_amber_border)
    tf = m2_box.text_frame
    tf.margin_top = Inches(0.15)
    p = tf.paragraphs[0]
    p.text = "TANK FILL-UP COST"
    p.alignment = PP_ALIGN.CENTER
    p.font.name = font_title
    p.font.size = Pt(9.5)
    p.font.bold = True
    p.font.color.rgb = c_amber
    p2 = tf.add_paragraph()
    p2.text = "$56.41"
    p2.alignment = PP_ALIGN.CENTER
    p2.font.name = font_title
    p2.font.size = Pt(22)
    p2.font.bold = True
    p2.font.color.rgb = c_slate_900
    p3 = tf.add_paragraph()
    p3.text = "14.5 Gal × $3.89/gal"
    p3.alignment = PP_ALIGN.CENTER
    p3.font.name = font_body
    p3.font.size = Pt(9.5)
    p3.font.color.rgb = c_slate_600

    # Right Column: 3 Detailed Cards
    right_x = Inches(6.65)
    right_w = Inches(5.883)

    # Card 1: Features & Technology
    c2_1 = add_card(slide2, right_x, Inches(1.5), right_w, Inches(1.65))
    tf = c2_1.text_frame
    tf.margin_left = Inches(0.3)
    tf.margin_right = Inches(0.3)
    tf.margin_top = Inches(0.18)
    p = tf.paragraphs[0]
    p.text = "TECHNOLOGY & CONVENIENCE"
    p.font.name = font_title
    p.font.size = Pt(10)
    p.font.bold = True
    p.font.color.rgb = c_blue_primary
    p2 = tf.add_paragraph()
    p2.text = "• Apple CarPlay & Android Auto seamless smartphone connectivity\n• Keyless start & remote entry with push-button ignition\n• Rearview backup camera & automatic parking assistance\n• 8-inch digital touchscreen display with Bluetooth audio"
    p2.font.name = font_body
    p2.font.size = Pt(10.5)
    p2.font.color.rgb = c_slate_800

    # Card 2: Safety & Driver Assist
    c2_2 = add_card(slide2, right_x, Inches(3.3), right_w, Inches(1.75))
    tf = c2_2.text_frame
    tf.margin_left = Inches(0.3)
    tf.margin_right = Inches(0.3)
    tf.margin_top = Inches(0.18)
    p = tf.paragraphs[0]
    p.text = "ACTIVE SAFETY & TRACTION"
    p.font.name = font_title
    p.font.size = Pt(10)
    p.font.bold = True
    p.font.color.rgb = c_emerald
    p2 = tf.add_paragraph()
    p2.text = "• Intelligent All-Wheel Drive (AWD / 4WD) for safe snow and rain control\n• Automatic Emergency Braking with Pedestrian Detection\n• Lane Departure Warning & Blind Spot Warning system\n• Rear Cross-Traffic Alert and comprehensive airbag canopy"
    p2.font.name = font_body
    p2.font.size = Pt(10.5)
    p2.font.color.rgb = c_slate_800

    # Card 3: Why I Chose This Car
    c2_3 = add_card(slide2, right_x, Inches(5.2), right_w, Inches(1.7), c_white, c_border)
    tf = c2_3.text_frame
    tf.margin_left = Inches(0.3)
    tf.margin_right = Inches(0.3)
    tf.margin_top = Inches(0.18)
    p = tf.paragraphs[0]
    p.text = "WHY THIS VEHICLE WAS CHOSEN"
    p.font.name = font_title
    p.font.size = Pt(10)
    p.font.bold = True
    p.font.color.rgb = c_slate_900
    p2 = tf.add_paragraph()
    p2.text = "\"Verified clean history with zero accident reports, no exterior or structural damage, all-weather AWD capability crucial for winter commuting, and exceptional overall value at $11,376.\""
    p2.font.name = font_body
    p2.font.italic = True
    p2.font.size = Pt(10.5)
    p2.font.color.rgb = c_slate_600

    # =========================================================================
    # SLIDE 3: CAR #1 FINANCING (Loan A vs Loan B)
    # =========================================================================
    slide3 = prs.slides.add_slide(blank_layout)
    apply_canvas_background(slide3)
    add_slide_header(slide3, 3, "Car #1 Financing Breakdown: Nissan Rogue", "Comparative Loan Analysis", c_emerald_tint, c_emerald, c_emerald_border)

    # Top Row: Side-by-Side Loan Cards
    # Loan A (Parents) - Left
    card3_a = add_card(slide3, Inches(0.8), Inches(1.5), Inches(4.5), Inches(3.8), c_white, c_emerald_border, border_width=1.5)
    # Top Emerald Tag Bar
    tbar_a = add_card(slide3, Inches(0.8), Inches(1.5), Inches(4.5), Inches(0.4), c_emerald_tint, c_emerald_border)
    tf = tbar_a.text_frame
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    p = tf.paragraphs[0]
    p.text = "★ RECOMMENDED: LOAN A (PARENTS SIMPLE INTEREST)"
    p.alignment = PP_ALIGN.CENTER
    p.font.name = font_title
    p.font.size = Pt(9.5)
    p.font.bold = True
    p.font.color.rgb = c_emerald

    tf = card3_a.text_frame
    tf.margin_top = Inches(0.55)
    tf.margin_left = Inches(0.3)
    tf.margin_right = Inches(0.3)
    p = tf.paragraphs[0]
    p.text = "$229.42 / month"
    p.font.name = font_title
    p.font.size = Pt(24)
    p.font.bold = True
    p.font.color.rgb = c_slate_900
    p.space_after = Pt(8)

    specs_a = [
        ("Terms", "4.2% Simple APR / 5 Years (60 Months)"),
        ("Interest Formula", "I = $11,376 × 0.042 × 5 = $2,388.96"),
        ("Total Repayment", "$11,376 + $2,388.96 = $13,764.96"),
        ("Monthly Payment", "$13,764.96 ÷ 60 months = $229.42 / mo"),
        ("Interest Benefit", "Saves $1,683.12 in total interest vs. Bank!")
    ]
    for lbl, val in specs_a:
        p_row = tf.add_paragraph()
        p_row.text = f"• {lbl}: "
        p_row.font.name = font_title
        p_row.font.bold = True
        p_row.font.size = Pt(10.5)
        p_row.font.color.rgb = c_slate_900
        r = p_row.add_run()
        r.text = val
        r.font.name = font_body
        r.font.bold = "Save" in val
        r.font.color.rgb = c_emerald if "Save" in val else c_slate_800
        p_row.space_after = Pt(3)

    # Loan B (Bank) - Center
    card3_b = add_card(slide3, Inches(5.5), Inches(1.5), Inches(4.5), Inches(3.8), c_white, c_border, border_width=1.0)
    tbar_b = add_card(slide3, Inches(5.5), Inches(1.5), Inches(4.5), Inches(0.4), c_blue_tint, c_blue_border)
    tf = tbar_b.text_frame
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    p = tf.paragraphs[0]
    p.text = "LOAN B: COMMERCIAL BANK (COMPOUND INTEREST)"
    p.alignment = PP_ALIGN.CENTER
    p.font.name = font_title
    p.font.size = Pt(9.5)
    p.font.bold = True
    p.font.color.rgb = c_blue_primary

    tf = card3_b.text_frame
    tf.margin_top = Inches(0.55)
    tf.margin_left = Inches(0.3)
    tf.margin_right = Inches(0.3)
    p = tf.paragraphs[0]
    p.text = "$214.56 / month"
    p.font.name = font_title
    p.font.size = Pt(24)
    p.font.bold = True
    p.font.color.rgb = c_slate_900
    p.space_after = Pt(8)

    specs_b = [
        ("Terms", "5.1% Compounded Daily (365) / 6 Years (72 Mos)"),
        ("Compound Formula", "$11,376 × (1 + 0.051/365)^2190"),
        ("Total Repayment", "$15,448.08 principal + interest"),
        ("Total Interest Paid", "$15,448.08 - $11,376 = $4,072.08"),
        ("Monthly Payment", "$15,448.08 ÷ 72 months = $214.56 / mo")
    ]
    for lbl, val in specs_b:
        p_row = tf.add_paragraph()
        p_row.text = f"• {lbl}: "
        p_row.font.name = font_title
        p_row.font.bold = True
        p_row.font.size = Pt(10.5)
        p_row.font.color.rgb = c_slate_900
        r = p_row.add_run()
        r.text = val
        r.font.name = font_body
        r.font.color.rgb = c_slate_800
        p_row.space_after = Pt(3)

    # Right Card: Financial Calculator Image
    card3_img = add_card(slide3, Inches(10.2), Inches(1.5), Inches(2.333), Inches(3.8))
    calc_img = "Car_Buying_Project/images/financing_calculator.jpg"
    if os.path.exists(calc_img):
        slide3.shapes.add_picture(calc_img, Inches(10.35), Inches(1.65), width=Inches(2.033), height=Inches(2.4))
    tf = card3_img.text_frame
    tf.margin_top = Inches(2.7)
    tf.margin_left = Inches(0.2)
    tf.margin_right = Inches(0.2)
    p = tf.paragraphs[0]
    p.text = "COMPOUND TRAP:"
    p.font.name = font_title
    p.font.size = Pt(10)
    p.font.bold = True
    p.font.color.rgb = c_slate_900
    p2 = tf.add_paragraph()
    p2.text = "A longer 6-year bank term lowers monthly payments by $14.86, but adds $1,683 in extra interest."
    p2.font.name = font_body
    p2.font.size = Pt(9.5)
    p2.font.color.rgb = c_slate_600

    # Bottom Decision Banner
    dec3 = add_card(slide3, Inches(0.8), Inches(5.5), Inches(11.733), Inches(1.4), c_emerald_tint, c_emerald_border)
    tf = dec3.text_frame
    tf.margin_left = Inches(0.35)
    tf.margin_right = Inches(0.35)
    tf.margin_top = Inches(0.18)
    p = tf.paragraphs[0]
    p.text = "WHICH LOAN WOULD YOU CHOOSE?  —  FINAL DECISION: LOAN A (PARENTS)"
    p.font.name = font_title
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = c_emerald
    p2 = tf.add_paragraph()
    p2.text = "• Lowest Monthly Payment: Loan B has the lower monthly payment ($214.56/mo vs. $229.42/mo — $14.86 cheaper per month).\n• Lowest Total Interest Paid: Loan A saves $1,683.12 in total interest ($2,388.96 vs. $4,072.08).\n• Recommendation: I choose Loan A. Paying $14.86 more per month eliminates over $1,683 in interest and clears debt a full 12 months earlier."
    p2.font.name = font_body
    p2.font.size = Pt(10.5)
    p2.font.color.rgb = c_slate_800

    # =========================================================================
    # SLIDE 4: CAR #2 OVERVIEW (2012 Jeep Wrangler Unlimited Sport 4WD)
    # =========================================================================
    slide4 = prs.slides.add_slide(blank_layout)
    apply_canvas_background(slide4)
    add_slide_header(slide4, 4, "Car #2 Overview: 2012 Jeep Wrangler Unlimited Sport", "Alternative Vehicle Choice")

    # Left Column: Framed Car Image + Spec Highlights
    card4_l = add_card(slide4, Inches(0.8), Inches(1.5), Inches(5.6), Inches(5.4))
    
    jeep_img = "Car_Buying_Project/images/jeep_wrangler.jpg"
    if os.path.exists(jeep_img):
        slide4.shapes.add_picture(jeep_img, Inches(1.05), Inches(1.75), width=Inches(5.1), height=Inches(3.1))

    # Two Metric Callouts under photo
    m1_4 = add_card(slide4, Inches(1.05), Inches(5.05), Inches(2.45), Inches(1.6), c_blue_tint, c_blue_border)
    tf = m1_4.text_frame
    tf.margin_top = Inches(0.15)
    p = tf.paragraphs[0]
    p.text = "PURCHASE PRICE"
    p.alignment = PP_ALIGN.CENTER
    p.font.name = font_title
    p.font.size = Pt(9.5)
    p.font.bold = True
    p.font.color.rgb = c_blue_primary
    p2 = tf.add_paragraph()
    p2.text = "$8,995"
    p2.alignment = PP_ALIGN.CENTER
    p2.font.name = font_title
    p2.font.size = Pt(22)
    p2.font.bold = True
    p2.font.color.rgb = c_slate_900
    p3 = tf.add_paragraph()
    p3.text = "Highly affordable deal"
    p3.alignment = PP_ALIGN.CENTER
    p3.font.name = font_body
    p3.font.size = Pt(9.5)
    p3.font.color.rgb = c_slate_600

    m2_4 = add_card(slide4, Inches(3.7), Inches(5.05), Inches(2.45), Inches(1.6), c_amber_tint, c_amber_border)
    tf = m2_4.text_frame
    tf.margin_top = Inches(0.15)
    p = tf.paragraphs[0]
    p.text = "TANK FILL-UP COST"
    p.alignment = PP_ALIGN.CENTER
    p.font.name = font_title
    p.font.size = Pt(9.5)
    p.font.bold = True
    p.font.color.rgb = c_amber
    p2 = tf.add_paragraph()
    p2.text = "$87.53"
    p2.alignment = PP_ALIGN.CENTER
    p2.font.name = font_title
    p2.font.size = Pt(22)
    p2.font.bold = True
    p2.font.color.rgb = c_slate_900
    p3 = tf.add_paragraph()
    p3.text = "22.5 Gal × $3.89/gal"
    p3.alignment = PP_ALIGN.CENTER
    p3.font.name = font_body
    p3.font.size = Pt(9.5)
    p3.font.color.rgb = c_slate_600

    # Right Column: 3 Detailed Cards
    # Card 1: Features & Technology
    c4_1 = add_card(slide4, right_x, Inches(1.5), right_w, Inches(1.65))
    tf = c4_1.text_frame
    tf.margin_left = Inches(0.3)
    tf.margin_right = Inches(0.3)
    tf.margin_top = Inches(0.18)
    p = tf.paragraphs[0]
    p.text = "UTILITY & CONVENIENCE FEATURES"
    p.font.name = font_title
    p.font.size = Pt(10)
    p.font.bold = True
    p.font.color.rgb = c_blue_primary
    p2 = tf.add_paragraph()
    p2.text = "• Durable wash-out interior with removable floor drain plugs\n• Command-Trac shift-on-the-fly 4WD system for extreme terrain\n• Removable doors & fold-down soft top convertible versatility\n• Heavy-duty roll bar audio sound system & auxiliary input"
    p2.font.name = font_body
    p2.font.size = Pt(10.5)
    p2.font.color.rgb = c_slate_800

    # Card 2: Safety & Driver Assist
    c4_2 = add_card(slide4, right_x, Inches(3.3), right_w, Inches(1.75))
    tf = c4_2.text_frame
    tf.margin_left = Inches(0.3)
    tf.margin_right = Inches(0.3)
    tf.margin_top = Inches(0.18)
    p = tf.paragraphs[0]
    p.text = "ACTIVE SAFETY & RUGGED TRACTION"
    p.font.name = font_title
    p.font.size = Pt(10)
    p.font.bold = True
    p.font.color.rgb = c_emerald
    p2 = tf.add_paragraph()
    p2.text = "• ESC (Electronic Stability Control) & ERM (Electronic Roll Mitigation)\n• HSA (Hill Start Assist) for smooth inclines without roll-back\n• 4-Wheel Anti-lock Braking System (ABS) & all-terrain traction control\n• Advanced multistage front airbag system & high-strength steel frame"
    p2.font.name = font_body
    p2.font.size = Pt(10.5)
    p2.font.color.rgb = c_slate_800

    # Card 3: Why I Chose This Car
    c4_3 = add_card(slide4, right_x, Inches(5.2), right_w, Inches(1.7), c_white, c_border)
    tf = c4_3.text_frame
    tf.margin_left = Inches(0.3)
    tf.margin_right = Inches(0.3)
    tf.margin_top = Inches(0.18)
    p = tf.paragraphs[0]
    p.text = "WHY THIS VEHICLE WAS CHOSEN"
    p.font.name = font_title
    p.font.size = Pt(10)
    p.font.bold = True
    p.font.color.rgb = c_slate_900
    p2 = tf.add_paragraph()
    p2.text = "\"It is a great deal at its price ($8,995). It provides authentic 4WD all-weather capability, legendary durability, and the lowest acquisition cost under the $20,000 project limit.\""
    p2.font.name = font_body
    p2.font.italic = True
    p2.font.size = Pt(10.5)
    p2.font.color.rgb = c_slate_600

    # =========================================================================
    # SLIDE 5: CAR #2 FINANCING (Loan C vs Loan D)
    # =========================================================================
    slide5 = prs.slides.add_slide(blank_layout)
    apply_canvas_background(slide5)
    add_slide_header(slide5, 5, "Car #2 Financing Breakdown: Jeep Wrangler", "Comparative Loan Analysis", c_emerald_tint, c_emerald, c_emerald_border)

    # Top Row: Side-by-Side Loan Cards
    # Loan C (Parents) - Left
    card5_c = add_card(slide5, Inches(0.8), Inches(1.5), Inches(4.5), Inches(3.8), c_white, c_emerald_border, border_width=1.5)
    tbar_c = add_card(slide5, Inches(0.8), Inches(1.5), Inches(4.5), Inches(0.4), c_emerald_tint, c_emerald_border)
    tf = tbar_c.text_frame
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    p = tf.paragraphs[0]
    p.text = "★ RECOMMENDED: LOAN C (PARENTS SIMPLE INTEREST)"
    p.alignment = PP_ALIGN.CENTER
    p.font.name = font_title
    p.font.size = Pt(9.5)
    p.font.bold = True
    p.font.color.rgb = c_emerald

    tf = card5_c.text_frame
    tf.margin_top = Inches(0.55)
    tf.margin_left = Inches(0.3)
    tf.margin_right = Inches(0.3)
    p = tf.paragraphs[0]
    p.text = "$181.40 / month"
    p.font.name = font_title
    p.font.size = Pt(24)
    p.font.bold = True
    p.font.color.rgb = c_slate_900
    p.space_after = Pt(8)

    specs_c = [
        ("Terms", "4.2% Simple APR / 5 Years (60 Months)"),
        ("Interest Formula", "I = $8,995 × 0.042 × 5 = $1,888.95"),
        ("Total Repayment", "$8,995 + $1,888.95 = $10,883.95"),
        ("Monthly Payment", "$10,883.95 ÷ 60 months = $181.40 / mo"),
        ("Interest Benefit", "Saves $1,330.84 in total interest vs. Bank!")
    ]
    for lbl, val in specs_c:
        p_row = tf.add_paragraph()
        p_row.text = f"• {lbl}: "
        p_row.font.name = font_title
        p_row.font.bold = True
        p_row.font.size = Pt(10.5)
        p_row.font.color.rgb = c_slate_900
        r = p_row.add_run()
        r.text = val
        r.font.name = font_body
        r.font.bold = "Save" in val
        r.font.color.rgb = c_emerald if "Save" in val else c_slate_800
        p_row.space_after = Pt(3)

    # Loan D (Bank) - Center
    card5_d = add_card(slide5, Inches(5.5), Inches(1.5), Inches(4.5), Inches(3.8), c_white, c_border, border_width=1.0)
    tbar_d = add_card(slide5, Inches(5.5), Inches(1.5), Inches(4.5), Inches(0.4), c_blue_tint, c_blue_border)
    tf = tbar_d.text_frame
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    p = tf.paragraphs[0]
    p.text = "LOAN D: COMMERCIAL BANK (COMPOUND INTEREST)"
    p.alignment = PP_ALIGN.CENTER
    p.font.name = font_title
    p.font.size = Pt(9.5)
    p.font.bold = True
    p.font.color.rgb = c_blue_primary

    tf = card5_d.text_frame
    tf.margin_top = Inches(0.55)
    tf.margin_left = Inches(0.3)
    tf.margin_right = Inches(0.3)
    p = tf.paragraphs[0]
    p.text = "$169.65 / month"
    p.font.name = font_title
    p.font.size = Pt(24)
    p.font.bold = True
    p.font.color.rgb = c_slate_900
    p.space_after = Pt(8)

    specs_d = [
        ("Terms", "5.1% Compounded Daily (365) / 6 Years (72 Mos)"),
        ("Compound Formula", "$8,995 × (1 + 0.051/365)^2190"),
        ("Total Repayment", "$12,214.79 principal + interest"),
        ("Total Interest Paid", "$12,214.79 - $8,995 = $3,219.79"),
        ("Monthly Payment", "$12,214.79 ÷ 72 months = $169.65 / mo")
    ]
    for lbl, val in specs_d:
        p_row = tf.add_paragraph()
        p_row.text = f"• {lbl}: "
        p_row.font.name = font_title
        p_row.font.bold = True
        p_row.font.size = Pt(10.5)
        p_row.font.color.rgb = c_slate_900
        r = p_row.add_run()
        r.text = val
        r.font.name = font_body
        r.font.color.rgb = c_slate_800
        p_row.space_after = Pt(3)

    # Right Card: Real Bank Piggy Bank Image
    card5_img = add_card(slide5, Inches(10.2), Inches(1.5), Inches(2.333), Inches(3.8))
    bank_img = "Car_Buying_Project/images/bank_savings.jpg"
    if os.path.exists(bank_img):
        slide5.shapes.add_picture(bank_img, Inches(10.35), Inches(1.65), width=Inches(2.033), height=Inches(2.4))
    tf = card5_img.text_frame
    tf.margin_top = Inches(2.7)
    tf.margin_left = Inches(0.2)
    tf.margin_right = Inches(0.2)
    p = tf.paragraphs[0]
    p.text = "COMPOUNDING LOSS:"
    p.font.name = font_title
    p.font.size = Pt(10)
    p.font.bold = True
    p.font.color.rgb = c_slate_900
    p2 = tf.add_paragraph()
    p2.text = "Commercial daily compounding causes over $3,219 to be lost strictly to interest."
    p2.font.name = font_body
    p2.font.size = Pt(9.5)
    p2.font.color.rgb = c_slate_600

    # Bottom Decision Banner
    dec5 = add_card(slide5, Inches(0.8), Inches(5.5), Inches(11.733), Inches(1.4), c_emerald_tint, c_emerald_border)
    tf = dec5.text_frame
    tf.margin_left = Inches(0.35)
    tf.margin_right = Inches(0.35)
    tf.margin_top = Inches(0.18)
    p = tf.paragraphs[0]
    p.text = "WHICH LOAN WOULD YOU CHOOSE?  —  FINAL DECISION: LOAN C (PARENTS)"
    p.font.name = font_title
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = c_emerald
    p2 = tf.add_paragraph()
    p2.text = "• Lowest Monthly Payment: Loan D has the lower monthly payment ($169.65/mo vs. $181.40/mo — $11.75 cheaper per month).\n• Lowest Total Interest Paid: Loan C saves $1,330.84 in total interest ($1,888.95 vs. $3,219.79).\n• Recommendation: I choose Loan C. Paying $11.75 more per month saves over $1,330 in interest and finishes 12 months sooner."
    p2.font.name = font_body
    p2.font.size = Pt(10.5)
    p2.font.color.rgb = c_slate_800

    # =========================================================================
    # SLIDE 6: PITCH TO PARENTS & BUDGET ACTION PLAN
    # =========================================================================
    slide6 = prs.slides.add_slide(blank_layout)
    apply_canvas_background(slide6)
    add_slide_header(slide6, 6, "Career & Budget Reflection: Pitch to Parents", "Parent Pitch & Action Plan", c_blue_tint, c_blue_primary, c_blue_border)

    # Left Column: Two Structured Question Cards (Rubric Answering)
    q_col_w = Inches(6.8)

    # Card 1: Chosen Vehicle, Payment & Initial Budget
    q1_card = add_card(slide6, Inches(0.8), Inches(1.5), q_col_w, Inches(2.6))
    tf = q1_card.text_frame
    tf.margin_left = Inches(0.35)
    tf.margin_right = Inches(0.35)
    tf.margin_top = Inches(0.2)
    p = tf.paragraphs[0]
    p.text = "1. VEHICLE SELECTION & INITIAL BUDGET ALIGNMENT"
    p.font.name = font_title
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = c_blue_primary
    p.space_after = Pt(4)

    p2 = tf.add_paragraph()
    p2.text = "• Primary Vehicle Option: 2023 Nissan Rogue S AWD with Loan A ($229.42 / mo) or Loan B ($214.56 / mo).\n• Budget Alternative Option: 2012 Jeep Wrangler Unlimited with Loan C ($181.40 / mo) or Loan D ($169.65 / mo).\n• Baseline Transportation Budget (11%): $150.48 / month ($1,368.00 gross income × 0.11).\n• Does it fit into your initial budget? No. Neither car fits unassisted, but the Jeep is remarkably close (exceeding by only $19.17/mo on Loan D vs. $78.94/mo for the Rogue)."
    p2.font.name = font_body
    p2.font.size = Pt(10.5)
    p2.font.color.rgb = c_slate_800

    # Card 2: Insurance, Total Payment & Affordability Commitment
    q2_card = add_card(slide6, Inches(0.8), Inches(4.3), q_col_w, Inches(2.6))
    tf = q2_card.text_frame
    tf.margin_left = Inches(0.35)
    tf.margin_right = Inches(0.35)
    tf.margin_top = Inches(0.2)
    p = tf.paragraphs[0]
    p.text = "2. INSURANCE, TOTAL COMMITMENT & ACTION PLAN"
    p.font.name = font_title
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = c_emerald
    p.space_after = Pt(4)

    p2 = tf.add_paragraph()
    p2.text = "• Researched Teen Car Insurance: $245.00 / month (average for teen added to family policy).\n• Total Monthly Transportation Commitment: $474.42 / month ($229.42 loan + $245.00 insurance; or $459.56 with Loan B).\n• Three Budget Modifications to Afford It:\n   1) Increase Target hours from 24 to 32 hrs/wk (+1 shift = +$456/mo gross = $1,824/mo total income);\n   2) Eliminate non-essential spending on dining out & entertainment ($150+/mo);\n   3) Save an upfront cash down payment of $1,500–$2,000 beforehand."
    p2.font.name = font_body
    p2.font.size = Pt(10.5)
    p2.font.color.rgb = c_slate_800

    # Right Column: Real Dealership Showroom Image + Executive Parent Pitch
    r_w = Inches(4.733)
    card6_r = add_card(slide6, Inches(7.8), Inches(1.5), r_w, Inches(5.4))

    dealer_img = "Car_Buying_Project/images/car_dealership.jpg"
    if os.path.exists(dealer_img):
        slide6.shapes.add_picture(dealer_img, Inches(8.05), Inches(1.75), width=Inches(4.233), height=Inches(2.65))

    # Parent Commitment Banner under photo
    banner6 = add_card(slide6, Inches(8.05), Inches(4.6), Inches(4.233), Inches(2.05), c_emerald_tint, c_emerald_border)
    tf = banner6.text_frame
    tf.margin_left = Inches(0.25)
    tf.margin_right = Inches(0.25)
    tf.margin_top = Inches(0.2)
    p = tf.paragraphs[0]
    p.text = "MY COMMITMENT TO MY PARENTS"
    p.font.name = font_title
    p.font.size = Pt(10)
    p.font.bold = True
    p.font.color.rgb = c_emerald
    p2 = tf.add_paragraph()
    p2.text = "By taking on one additional shift at Target each week, I will generate an extra $456.00/month gross. This surplus completely covers my total monthly car and insurance obligation of $474.42 while maintaining personal savings and building verifiable credit and financial responsibility."
    p2.font.name = font_body
    p2.font.size = Pt(10)
    p2.font.color.rgb = c_slate_800

    out_path = "Car_Buying_Project/Buying_Your_First_Car_Presentation.pptx"
    prs.save(out_path)
    print("Presentation successfully updated with refined professional style:", out_path)

if __name__ == "__main__":
    build_presentation()
