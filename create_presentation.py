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

    # Professional Color System
    c_bg = RGBColor(245, 247, 250)         # Ultra-light slate background
    c_white = RGBColor(255, 255, 255)      # Card white
    c_navy_header = RGBColor(15, 23, 42)   # Dark slate navy
    c_blue_primary = RGBColor(29, 78, 216) # Rich royal blue
    c_blue_soft = RGBColor(239, 246, 255)  # Light blue tint
    c_blue_border = RGBColor(191, 219, 254)
    c_text_dark = RGBColor(15, 23, 42)     # Charcoal slate
    c_text_body = RGBColor(51, 65, 85)     # Medium dark slate
    c_text_muted = RGBColor(100, 116, 139) # Muted gray
    c_border = RGBColor(226, 232, 240)     # Light border
    c_green = RGBColor(16, 185, 129)       # Emerald green
    c_green_soft = RGBColor(236, 253, 245) # Emerald light
    c_green_dark = RGBColor(6, 95, 70)
    c_amber = RGBColor(217, 119, 6)
    c_amber_soft = RGBColor(254, 243, 199)
    c_red = RGBColor(220, 38, 38)
    c_red_soft = RGBColor(254, 242, 242)

    font_family = "Calibri"

    def add_base_decorations(slide, slide_num, title, badge_text, badge_color=c_blue_primary):
        # 1. Slide canvas background
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = c_bg
        bg.line.fill.background()

        # 2. Modern Header Banner
        hdr = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(1.15))
        hdr.fill.solid()
        hdr.fill.fore_color.rgb = c_navy_header
        hdr.line.fill.background()

        # 3. Category Badge Pill
        badge = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.18), Inches(2.4), Inches(0.32))
        badge.fill.solid()
        badge.fill.fore_color.rgb = badge_color
        badge.line.fill.background()
        tf = badge.text_frame
        tf.word_wrap = True
        tf.vertical_anchor = MSO_ANCHOR.MIDDLE
        tf.margin_top = Inches(0)
        p = tf.paragraphs[0]
        p.text = badge_text.upper()
        p.alignment = PP_ALIGN.CENTER
        p.font.name = font_family
        p.font.size = Pt(10.5)
        p.font.bold = True
        p.font.color.rgb = c_white

        # 4. Slide Title
        tbox = slide.shapes.add_textbox(Inches(0.8), Inches(0.55), Inches(9.0), Inches(0.55))
        tf = tbox.text_frame
        tf.word_wrap = True
        tf.margin_top = Inches(0)
        p = tf.paragraphs[0]
        p.text = title
        p.font.name = font_family
        p.font.size = Pt(21)
        p.font.bold = True
        p.font.color.rgb = c_white

        # 5. Right Header (Student & Project Meta)
        meta = slide.shapes.add_textbox(Inches(8.5), Inches(0.2), Inches(4.0), Inches(0.75))
        tf = meta.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = "Buying Your First Car Project"
        p.alignment = PP_ALIGN.RIGHT
        p.font.name = font_family
        p.font.size = Pt(11)
        p.font.color.rgb = RGBColor(148, 163, 184)
        
        p2 = tf.add_paragraph()
        p2.text = f"Student: Rehan Mangar  •  Slide {slide_num} of 6"
        p2.alignment = PP_ALIGN.RIGHT
        p2.font.name = font_family
        p2.font.size = Pt(12)
        p2.font.bold = True
        p2.font.color.rgb = RGBColor(226, 232, 240)

    # =========================================================================
    # SLIDE 1: JOB INFORMATION & BUDGET
    # =========================================================================
    slide1 = prs.slides.add_slide(blank_layout)
    add_base_decorations(slide1, 1, "Slide 1: Employment & Income Overview", "Assigned Job Profile", RGBColor(220, 38, 38))

    # Left Container: Job Profile & Earnings Breakdown
    card1_l = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.35), Inches(6.1), Inches(5.7))
    card1_l.fill.solid()
    card1_l.fill.fore_color.rgb = c_white
    card1_l.line.color.rgb = c_border
    card1_l.line.width = Pt(1.5)

    tf = card1_l.text_frame
    tf.margin_left = Inches(0.35)
    tf.margin_right = Inches(0.35)
    tf.margin_top = Inches(0.3)

    p = tf.paragraphs[0]
    p.text = "JOB PROFILE & EARNINGS"
    p.font.name = font_family
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = RGBColor(220, 38, 38)

    p_title = tf.add_paragraph()
    p_title.text = "Target Team Member"
    p_title.font.name = font_family
    p_title.font.size = Pt(22)
    p_title.font.bold = True
    p_title.font.color.rgb = c_navy_header
    p_title.space_after = Pt(12)

    stats1 = [
        ("Position / Company", "Target (Sales Floor / Cashier)"),
        ("Hourly Pay Rate", "$14.25 / hour"),
        ("Weekly Hours Scheduled", "24 hours / week"),
        ("Gross Weekly Income", "$342.00 / week", "24 hrs × $14.25 / hr"),
        ("Gross Monthly Income", "$1,368.00 / month", "$342.00 × 4 weeks"),
        ("Transportation Budget (11%)", "$150.48 / month", "$1,368.00 × 0.11")
    ]

    for item in stats1:
        lbl = item[0]
        val = item[1]
        p_row = tf.add_paragraph()
        p_row.text = f"• {lbl}: "
        p_row.font.name = font_family
        p_row.font.bold = True
        p_row.font.size = Pt(13)
        p_row.font.color.rgb = c_text_dark

        run = p_row.add_run()
        run.text = val
        run.font.name = font_family
        run.font.bold = True
        run.font.size = Pt(14)
        run.font.color.rgb = RGBColor(220, 38, 38) if "11%" in lbl else c_blue_primary

        if len(item) > 2:
            p_sub = tf.add_paragraph()
            p_sub.text = f"   ({item[2]})"
            p_sub.font.name = font_family
            p_sub.font.size = Pt(10.5)
            p_sub.font.color.rgb = c_text_muted
            p_sub.space_after = Pt(4)

    # Right Container: Authentic Store Image + Budget Key Takeaway
    card1_r = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(7.1), Inches(1.35), Inches(5.4), Inches(5.7))
    card1_r.fill.solid()
    card1_r.fill.fore_color.rgb = c_white
    card1_r.line.color.rgb = c_border
    card1_r.line.width = Pt(1.5)

    # Insert Real Target Store Photo
    img1_path = "Car_Buying_Project/images/target_store.jpg"
    if os.path.exists(img1_path):
        slide1.shapes.add_picture(img1_path, Inches(7.35), Inches(1.6), width=Inches(4.9), height=Inches(3.2))

    # Caption / Highlight Banner below Target image
    banner1 = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(7.35), Inches(5.0), Inches(4.9), Inches(1.8))
    banner1.fill.solid()
    banner1.fill.fore_color.rgb = c_blue_soft
    banner1.line.color.rgb = c_blue_border
    tf_b1 = banner1.text_frame
    tf_b1.margin_left = Inches(0.25)
    tf_b1.margin_right = Inches(0.25)
    tf_b1.margin_top = Inches(0.18)

    p = tf_b1.paragraphs[0]
    p.text = "BUDGET FOUNDATION & GOALS"
    p.font.name = font_family
    p.font.size = Pt(11.5)
    p.font.bold = True
    p.font.color.rgb = c_blue_primary

    p2 = tf_b1.add_paragraph()
    p2.text = "At 24 hours/week, working at Target generates $1,368 gross monthly. The standard 11% transportation guideline allocates $150.48/month for vehicle expenses. Any car loan and insurance must be planned carefully around this baseline."
    p2.font.name = font_family
    p2.font.size = Pt(10.5)
    p2.font.color.rgb = c_text_body

    # =========================================================================
    # SLIDE 2: CAR #1 OVERVIEW (2023 Nissan Rogue S AWD)
    # =========================================================================
    slide2 = prs.slides.add_slide(blank_layout)
    add_base_decorations(slide2, 2, "Slide 2: Car #1 Overview - 2023 Nissan Rogue S AWD", "Primary Vehicle Choice")

    # Left Container: Real Nissan Rogue Photo & Metric Badges
    card2_l = slide2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.35), Inches(5.5), Inches(5.7))
    card2_l.fill.solid()
    card2_l.fill.fore_color.rgb = c_white
    card2_l.line.color.rgb = c_border
    card2_l.line.width = Pt(1.5)

    img2_path = "Car_Buying_Project/images/nissan_rogue.jpg"
    if os.path.exists(img2_path):
        slide2.shapes.add_picture(img2_path, Inches(1.05), Inches(1.6), width=Inches(5.0), height=Inches(3.15))

    # Metric Badge 1: Price
    b_pr1 = slide2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.05), Inches(4.95), Inches(2.4), Inches(1.8))
    b_pr1.fill.solid()
    b_pr1.fill.fore_color.rgb = c_blue_soft
    b_pr1.line.color.rgb = c_blue_border
    tf = b_pr1.text_frame
    tf.margin_top = Inches(0.18)
    p = tf.paragraphs[0]
    p.text = "LIST PRICE"
    p.alignment = PP_ALIGN.CENTER
    p.font.name = font_family
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = c_blue_primary
    p2 = tf.add_paragraph()
    p2.text = "$11,376"
    p2.alignment = PP_ALIGN.CENTER
    p2.font.name = font_family
    p2.font.size = Pt(22)
    p2.font.bold = True
    p2.font.color.rgb = c_navy_header
    p3 = tf.add_paragraph()
    p3.text = "Under $20K budget limit"
    p3.alignment = PP_ALIGN.CENTER
    p3.font.name = font_family
    p3.font.size = Pt(9.5)
    p3.font.color.rgb = c_text_muted

    # Metric Badge 2: Fuel Tank
    b_gas1 = slide2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(3.65), Inches(4.95), Inches(2.4), Inches(1.8))
    b_gas1.fill.solid()
    b_gas1.fill.fore_color.rgb = c_amber_soft
    b_gas1.line.color.rgb = RGBColor(252, 211, 77)
    tf = b_gas1.text_frame
    tf.margin_top = Inches(0.18)
    p = tf.paragraphs[0]
    p.text = "GAS TANK & FILL-UP"
    p.alignment = PP_ALIGN.CENTER
    p.font.name = font_family
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = c_amber
    p2 = tf.add_paragraph()
    p2.text = "$56.41"
    p2.alignment = PP_ALIGN.CENTER
    p2.font.name = font_family
    p2.font.size = Pt(22)
    p2.font.bold = True
    p2.font.color.rgb = c_navy_header
    p3 = tf.add_paragraph()
    p3.text = "14.5 Gallons × $3.89/gal"
    p3.alignment = PP_ALIGN.CENTER
    p3.font.name = font_family
    p3.font.size = Pt(9.5)
    p3.font.color.rgb = c_text_muted

    # Right Container: Full Vehicle Details & Rubric Justifications
    card2_r = slide2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.55), Inches(1.35), Inches(6.0), Inches(5.7))
    card2_r.fill.solid()
    card2_r.fill.fore_color.rgb = c_white
    card2_r.line.color.rgb = c_border
    card2_r.line.width = Pt(1.5)

    tf = card2_r.text_frame
    tf.margin_left = Inches(0.35)
    tf.margin_right = Inches(0.35)
    tf.margin_top = Inches(0.28)

    p = tf.paragraphs[0]
    p.text = "VEHICLE SPECIFICATIONS"
    p.font.name = font_family
    p.font.size = Pt(11.5)
    p.font.bold = True
    p.font.color.rgb = c_blue_primary

    p_model = tf.add_paragraph()
    p_model.text = "2023 Nissan Rogue S AWD / 4WD"
    p_model.font.name = font_family
    p_model.font.size = Pt(18)
    p_model.font.bold = True
    p_model.font.color.rgb = c_navy_header
    p_model.space_after = Pt(8)

    # Features
    p_f = tf.add_paragraph()
    p_f.text = "Features & Tech Options:"
    p_f.font.name = font_family
    p_f.font.bold = True
    p_f.font.size = Pt(12.5)
    p_f.font.color.rgb = c_navy_header
    p_ft = tf.add_paragraph()
    p_ft.text = "• Apple CarPlay & Android Auto integration\n• Keyless start & remote entry with push-button ignition\n• Bluetooth hands-free phone & audio streaming\n• Rearview backup camera & automatic parking assistance"
    p_ft.font.name = font_family
    p_ft.font.size = Pt(11)
    p_ft.font.color.rgb = c_text_body
    p_ft.space_after = Pt(8)

    # Safety
    p_s = tf.add_paragraph()
    p_s.text = "Safety & Driver Assistance:"
    p_s.font.name = font_family
    p_s.font.bold = True
    p_s.font.size = Pt(12.5)
    p_s.font.color.rgb = c_navy_header
    p_st = tf.add_paragraph()
    p_st.text = "• All-Wheel Drive (AWD / 4WD) for winter snow & rain control\n• Lane Departure Warning & Blind Spot Warning\n• Automatic Emergency Braking with pedestrian detection\n• Rear Cross-Traffic Alert & advanced airbag protection"
    p_st.font.name = font_family
    p_st.font.size = Pt(11)
    p_st.font.color.rgb = c_text_body
    p_st.space_after = Pt(8)

    # Why Chosen
    p_w = tf.add_paragraph()
    p_w.text = "Why I Chose This Car:"
    p_w.font.name = font_family
    p_w.font.bold = True
    p_w.font.size = Pt(12.5)
    p_w.font.color.rgb = c_navy_header
    p_wt = tf.add_paragraph()
    p_wt.text = "\"Has clean history with no accidents, car is in immaculate condition with zero damage, offers modern AWD safety for teenage driving, and the $11,376 price provides tremendous value.\""
    p_wt.font.name = font_family
    p_wt.font.size = Pt(10.5)
    p_wt.font.italic = True
    p_wt.font.color.rgb = c_text_muted

    # =========================================================================
    # SLIDE 3: CAR #1 FINANCING (Loan A vs Loan B)
    # =========================================================================
    slide3 = prs.slides.add_slide(blank_layout)
    add_base_decorations(slide3, 3, "Slide 3: Car #1 Financing Breakdown - Nissan Rogue", "Financing Comparison", c_green)

    # Top Left: Loan A Card (Parents - Recommended)
    card3_a = slide3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.35), Inches(4.5), Inches(4.2))
    card3_a.fill.solid()
    card3_a.fill.fore_color.rgb = c_white
    card3_a.line.color.rgb = c_green
    card3_a.line.width = Pt(2)

    tf = card3_a.text_frame
    tf.margin_left = Inches(0.28)
    tf.margin_right = Inches(0.28)
    tf.margin_top = Inches(0.22)
    p = tf.paragraphs[0]
    p.text = "LOAN A: PARENTS (SIMPLE INTEREST)"
    p.font.name = font_family
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = c_green

    p2 = tf.add_paragraph()
    p2.text = "$229.42 / mo"
    p2.font.name = font_family
    p2.font.size = Pt(24)
    p2.font.bold = True
    p2.font.color.rgb = c_navy_header
    p2.space_after = Pt(6)

    rows3_a = [
        ("Terms", "4.2% Simple Interest / 5 Yrs (60 Mos)"),
        ("Interest Paid", "$2,388.96  (Saves $1,683.12!)"),
        ("Total Repayment", "$11,376 + $2,388.96 = $13,764.96"),
        ("Monthly Payment", "$13,764.96 ÷ 60 = $229.42 / month")
    ]
    for lbl, val in rows3_a:
        p = tf.add_paragraph()
        p.text = f"• {lbl}: "
        p.font.name = font_family
        p.font.bold = True
        p.font.size = Pt(11)
        p.font.color.rgb = c_text_dark
        r = p.add_run()
        r.text = val
        r.font.name = font_family
        r.font.bold = "Save" in val or "$229" in val
        r.font.color.rgb = c_green if "Save" in val else c_text_body
        p.space_after = Pt(4)

    # Top Middle: Loan B Card (Bank)
    card3_b = slide3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(5.5), Inches(1.35), Inches(4.5), Inches(4.2))
    card3_b.fill.solid()
    card3_b.fill.fore_color.rgb = c_white
    card3_b.line.color.rgb = c_border
    card3_b.line.width = Pt(1.5)

    tf = card3_b.text_frame
    tf.margin_left = Inches(0.28)
    tf.margin_right = Inches(0.28)
    tf.margin_top = Inches(0.22)
    p = tf.paragraphs[0]
    p.text = "LOAN B: BANK (COMPOUND INTEREST)"
    p.font.name = font_family
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = c_blue_primary

    p2 = tf.add_paragraph()
    p2.text = "$214.56 / mo"
    p2.font.name = font_family
    p2.font.size = Pt(24)
    p2.font.bold = True
    p2.font.color.rgb = c_navy_header
    p2.space_after = Pt(6)

    rows3_b = [
        ("Terms", "5.1% Daily Compound (365) / 6 Yrs (72 Mos)"),
        ("Interest Paid", "$4,072.08  (+$1,683.12 more interest)"),
        ("Total Repayment", "$15,448.08 (11,376 × (1 + 0.051/365)^2190)"),
        ("Monthly Payment", "$15,448.08 ÷ 72 = $214.56 / month")
    ]
    for lbl, val in rows3_b:
        p = tf.add_paragraph()
        p.text = f"• {lbl}: "
        p.font.name = font_family
        p.font.bold = True
        p.font.size = Pt(11)
        p.font.color.rgb = c_text_dark
        r = p.add_run()
        r.text = val
        r.font.name = font_family
        r.font.color.rgb = c_red if "more interest" in val else c_text_body
        p.space_after = Pt(4)

    # Top Right: Real Financial Image Card
    card3_img = slide3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(10.2), Inches(1.35), Inches(2.35), Inches(4.2))
    card3_img.fill.solid()
    card3_img.fill.fore_color.rgb = c_white
    card3_img.line.color.rgb = c_border
    card3_img.line.width = Pt(1.5)

    img3_path = "Car_Buying_Project/images/financing_calculator.jpg"
    if os.path.exists(img3_path):
        slide3.shapes.add_picture(img3_path, Inches(10.35), Inches(1.55), width=Inches(2.05), height=Inches(2.6))
    
    tf = card3_img.text_frame
    tf.margin_top = Inches(2.9)
    tf.margin_left = Inches(0.15)
    tf.margin_right = Inches(0.15)
    p = tf.paragraphs[0]
    p.text = "Financial Wisdom:"
    p.font.name = font_family
    p.font.bold = True
    p.font.size = Pt(10.5)
    p.font.color.rgb = c_navy_header
    p2 = tf.add_paragraph()
    p2.text = "Simple interest with shorter term saves significant money over long compounding."
    p2.font.name = font_family
    p2.font.size = Pt(9.5)
    p2.font.color.rgb = c_text_muted

    # Bottom Decision Banner across all columns
    dec3 = slide3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(5.75), Inches(11.75), Inches(1.4))
    dec3.fill.solid()
    dec3.fill.fore_color.rgb = c_green_soft
    dec3.line.color.rgb = c_green
    dec3.line.width = Pt(1.5)

    tf = dec3.text_frame
    tf.margin_left = Inches(0.3)
    tf.margin_right = Inches(0.3)
    tf.margin_top = Inches(0.15)

    p = tf.paragraphs[0]
    p.text = "WHICH LOAN WOULD YOU CHOOSE?  —  FINAL DECISION: LOAN A (PARENTS)"
    p.font.name = font_family
    p.font.size = Pt(12.5)
    p.font.bold = True
    p.font.color.rgb = c_green_dark

    p2 = tf.add_paragraph()
    p2.text = "• Lowest Monthly Payment: Loan B ($214.56/mo vs. $229.42/mo — lower by $14.86/mo).\n• Lowest Total Interest: Loan A ($2,388.96 vs. $4,072.08 — saves $1,683.12 in interest).\n• Reasoning: I choose Loan A. Paying $14.86 more per month saves $1,683.12 and clears the debt a full 12 months earlier."
    p2.font.name = font_family
    p2.font.size = Pt(11)
    p2.font.color.rgb = c_green_dark

    # =========================================================================
    # SLIDE 4: CAR #2 OVERVIEW (2021 Toyota Corolla LE)
    # =========================================================================
    slide4 = prs.slides.add_slide(blank_layout)
    add_base_decorations(slide4, 4, "Slide 4: Car #2 Overview - 2021 Toyota Corolla LE", "Alternative Vehicle Choice")

    # Left Container: Real Toyota Corolla Photo & Metric Badges
    card4_l = slide4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.35), Inches(5.5), Inches(5.7))
    card4_l.fill.solid()
    card4_l.fill.fore_color.rgb = c_white
    card4_l.line.color.rgb = c_border
    card4_l.line.width = Pt(1.5)

    img4_path = "Car_Buying_Project/images/toyota_corolla.jpg"
    if os.path.exists(img4_path):
        slide4.shapes.add_picture(img4_path, Inches(1.05), Inches(1.6), width=Inches(5.0), height=Inches(3.15))

    # Metric Badge 1: Price
    b_pr2 = slide4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.05), Inches(4.95), Inches(2.4), Inches(1.8))
    b_pr2.fill.solid()
    b_pr2.fill.fore_color.rgb = c_blue_soft
    b_pr2.line.color.rgb = c_blue_border
    tf = b_pr2.text_frame
    tf.margin_top = Inches(0.18)
    p = tf.paragraphs[0]
    p.text = "LIST PRICE"
    p.alignment = PP_ALIGN.CENTER
    p.font.name = font_family
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = c_blue_primary
    p2 = tf.add_paragraph()
    p2.text = "$14,500"
    p2.alignment = PP_ALIGN.CENTER
    p2.font.name = font_family
    p2.font.size = Pt(22)
    p2.font.bold = True
    p2.font.color.rgb = c_navy_header
    p3 = tf.add_paragraph()
    p3.text = "Under $20K budget limit"
    p3.alignment = PP_ALIGN.CENTER
    p3.font.name = font_family
    p3.font.size = Pt(9.5)
    p3.font.color.rgb = c_text_muted

    # Metric Badge 2: Fuel Tank
    b_gas2 = slide4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(3.65), Inches(4.95), Inches(2.4), Inches(1.8))
    b_gas2.fill.solid()
    b_gas2.fill.fore_color.rgb = c_amber_soft
    b_gas2.line.color.rgb = RGBColor(252, 211, 77)
    tf = b_gas2.text_frame
    tf.margin_top = Inches(0.18)
    p = tf.paragraphs[0]
    p.text = "GAS TANK & FILL-UP"
    p.alignment = PP_ALIGN.CENTER
    p.font.name = font_family
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = c_amber
    p2 = tf.add_paragraph()
    p2.text = "$51.35"
    p2.alignment = PP_ALIGN.CENTER
    p2.font.name = font_family
    p2.font.size = Pt(22)
    p2.font.bold = True
    p2.font.color.rgb = c_navy_header
    p3 = tf.add_paragraph()
    p3.text = "13.2 Gallons × $3.89/gal"
    p3.alignment = PP_ALIGN.CENTER
    p3.font.name = font_family
    p3.font.size = Pt(9.5)
    p3.font.color.rgb = c_text_muted

    # Right Container: Full Vehicle Details & Rubric Justifications
    card4_r = slide4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.55), Inches(1.35), Inches(6.0), Inches(5.7))
    card4_r.fill.solid()
    card4_r.fill.fore_color.rgb = c_white
    card4_r.line.color.rgb = c_border
    card4_r.line.width = Pt(1.5)

    tf = card4_r.text_frame
    tf.margin_left = Inches(0.35)
    tf.margin_right = Inches(0.35)
    tf.margin_top = Inches(0.28)

    p = tf.paragraphs[0]
    p.text = "VEHICLE SPECIFICATIONS"
    p.font.name = font_family
    p.font.size = Pt(11.5)
    p.font.bold = True
    p.font.color.rgb = c_blue_primary

    p_model = tf.add_paragraph()
    p_model.text = "2021 Toyota Corolla LE Sedan"
    p_model.font.name = font_family
    p_model.font.size = Pt(18)
    p_model.font.bold = True
    p_model.font.color.rgb = c_navy_header
    p_model.space_after = Pt(8)

    # Features
    p_f = tf.add_paragraph()
    p_f.text = "Features & Tech Options:"
    p_f.font.name = font_family
    p_f.font.bold = True
    p_f.font.size = Pt(12.5)
    p_f.font.color.rgb = c_navy_header
    p_ft = tf.add_paragraph()
    p_ft.text = "• Apple CarPlay, Android Auto & Amazon Alexa compatibility\n• 8-inch high-resolution touchscreen infotainment system\n• Integrated backup camera with path guidelines\n• Remote keyless entry & Bluetooth hands-free connectivity"
    p_ft.font.name = font_family
    p_ft.font.size = Pt(11)
    p_ft.font.color.rgb = c_text_body
    p_ft.space_after = Pt(8)

    # Safety
    p_s = tf.add_paragraph()
    p_s.text = "Safety & Driver Assistance:"
    p_s.font.name = font_family
    p_s.font.bold = True
    p_s.font.size = Pt(12.5)
    p_s.font.color.rgb = c_navy_header
    p_st = tf.add_paragraph()
    p_st.text = "• Toyota Safety Sense 2.0 with Pre-Collision System\n• Lane Departure Alert with Steering Assist & Lane Tracing\n• Full-Speed Dynamic Radar Cruise Control & Road Sign Assist\n• 10 advanced airbags & Star Safety System"
    p_st.font.name = font_family
    p_st.font.size = Pt(11)
    p_st.font.color.rgb = c_text_body
    p_st.space_after = Pt(8)

    # Why Chosen
    p_w = tf.add_paragraph()
    p_w.text = "Why I Chose This Car:"
    p_w.font.name = font_family
    p_w.font.bold = True
    p_w.font.size = Pt(12.5)
    p_w.font.color.rgb = c_navy_header
    p_wt = tf.add_paragraph()
    p_wt.text = "\"Unrivaled Toyota mechanical reliability, lower insurance premiums, class-leading 38 MPG highway fuel efficiency that saves money on daily commutes, and high resale value retention.\""
    p_wt.font.name = font_family
    p_wt.font.size = Pt(10.5)
    p_wt.font.italic = True
    p_wt.font.color.rgb = c_text_muted

    # =========================================================================
    # SLIDE 5: CAR #2 FINANCING (Loan C vs Loan D)
    # =========================================================================
    slide5 = prs.slides.add_slide(blank_layout)
    add_base_decorations(slide5, 5, "Slide 5: Car #2 Financing Breakdown - Toyota Corolla", "Financing Comparison", c_green)

    # Top Left: Loan C Card (Parents - Recommended)
    card5_c = slide5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.35), Inches(4.5), Inches(4.2))
    card5_c.fill.solid()
    card5_c.fill.fore_color.rgb = c_white
    card5_c.line.color.rgb = c_green
    card5_c.line.width = Pt(2)

    tf = card5_c.text_frame
    tf.margin_left = Inches(0.28)
    tf.margin_right = Inches(0.28)
    tf.margin_top = Inches(0.22)
    p = tf.paragraphs[0]
    p.text = "LOAN C: PARENTS (SIMPLE INTEREST)"
    p.font.name = font_family
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = c_green

    p2 = tf.add_paragraph()
    p2.text = "$292.42 / mo"
    p2.font.name = font_family
    p2.font.size = Pt(24)
    p2.font.bold = True
    p2.font.color.rgb = c_navy_header
    p2.space_after = Pt(6)

    rows5_c = [
        ("Terms", "4.2% Simple Interest / 5 Yrs (60 Mos)"),
        ("Interest Paid", "$3,045.00  (Saves $2,142.23!)"),
        ("Total Repayment", "$14,500 + $3,045.00 = $17,545.00"),
        ("Monthly Payment", "$17,545.00 ÷ 60 = $292.42 / month")
    ]
    for lbl, val in rows5_c:
        p = tf.add_paragraph()
        p.text = f"• {lbl}: "
        p.font.name = font_family
        p.font.bold = True
        p.font.size = Pt(11)
        p.font.color.rgb = c_text_dark
        r = p.add_run()
        r.text = val
        r.font.name = font_family
        r.font.bold = "Save" in val or "$292" in val
        r.font.color.rgb = c_green if "Save" in val else c_text_body
        p.space_after = Pt(4)

    # Top Middle: Loan D Card (Bank)
    card5_d = slide5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(5.5), Inches(1.35), Inches(4.5), Inches(4.2))
    card5_d.fill.solid()
    card5_d.fill.fore_color.rgb = c_white
    card5_d.line.color.rgb = c_border
    card5_d.line.width = Pt(1.5)

    tf = card5_d.text_frame
    tf.margin_left = Inches(0.28)
    tf.margin_right = Inches(0.28)
    tf.margin_top = Inches(0.22)
    p = tf.paragraphs[0]
    p.text = "LOAN D: BANK (COMPOUND INTEREST)"
    p.font.name = font_family
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = c_blue_primary

    p2 = tf.add_paragraph()
    p2.text = "$273.43 / mo"
    p2.font.name = font_family
    p2.font.size = Pt(24)
    p2.font.bold = True
    p2.font.color.rgb = c_navy_header
    p2.space_after = Pt(6)

    rows5_d = [
        ("Terms", "5.1% Daily Compound (365) / 6 Yrs (72 Mos)"),
        ("Interest Paid", "$5,187.23  (+$2,142.23 more interest)"),
        ("Total Repayment", "$19,687.23 (14,500 × (1 + 0.051/365)^2190)"),
        ("Monthly Payment", "$19,687.23 ÷ 72 = $273.43 / month")
    ]
    for lbl, val in rows5_d:
        p = tf.add_paragraph()
        p.text = f"• {lbl}: "
        p.font.name = font_family
        p.font.bold = True
        p.font.size = Pt(11)
        p.font.color.rgb = c_text_dark
        r = p.add_run()
        r.text = val
        r.font.name = font_family
        r.font.color.rgb = c_red if "more interest" in val else c_text_body
        p.space_after = Pt(4)

    # Top Right: Real Bank Savings Image Card
    card5_img = slide5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(10.2), Inches(1.35), Inches(2.35), Inches(4.2))
    card5_img.fill.solid()
    card5_img.fill.fore_color.rgb = c_white
    card5_img.line.color.rgb = c_border
    card5_img.line.width = Pt(1.5)

    img5_path = "Car_Buying_Project/images/bank_savings.jpg"
    if os.path.exists(img5_path):
        slide5.shapes.add_picture(img5_path, Inches(10.35), Inches(1.55), width=Inches(2.05), height=Inches(2.6))

    tf = card5_img.text_frame
    tf.margin_top = Inches(2.9)
    tf.margin_left = Inches(0.15)
    tf.margin_right = Inches(0.15)
    p = tf.paragraphs[0]
    p.text = "Compounding Impact:"
    p.font.name = font_family
    p.font.bold = True
    p.font.size = Pt(10.5)
    p.font.color.rgb = c_navy_header
    p2 = tf.add_paragraph()
    p2.text = "Daily compounding adds over $5,100 in interest on a 6-year bank loan."
    p2.font.name = font_family
    p2.font.size = Pt(9.5)
    p2.font.color.rgb = c_text_muted

    # Bottom Decision Banner across all columns
    dec5 = slide5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(5.75), Inches(11.75), Inches(1.4))
    dec5.fill.solid()
    dec5.fill.fore_color.rgb = c_green_soft
    dec5.line.color.rgb = c_green
    dec5.line.width = Pt(1.5)

    tf = dec5.text_frame
    tf.margin_left = Inches(0.3)
    tf.margin_right = Inches(0.3)
    tf.margin_top = Inches(0.15)

    p = tf.paragraphs[0]
    p.text = "WHICH LOAN WOULD YOU CHOOSE?  —  FINAL DECISION: LOAN C (PARENTS)"
    p.font.name = font_family
    p.font.size = Pt(12.5)
    p.font.bold = True
    p.font.color.rgb = c_green_dark

    p2 = tf.add_paragraph()
    p2.text = "• Lowest Monthly Payment: Loan D ($273.43/mo vs. $292.42/mo — lower by $18.99/mo).\n• Lowest Total Interest: Loan C ($3,045.00 vs. $5,187.23 — saves $2,142.23 in interest).\n• Reasoning: I choose Loan C. Paying $18.99 more per month saves over $2,142 in interest and eliminates debt 1 year faster."
    p2.font.name = font_family
    p2.font.size = Pt(11)
    p2.font.color.rgb = c_green_dark

    # =========================================================================
    # SLIDE 6: FOLLOW-UP QUESTIONS & PITCH TO PARENTS
    # =========================================================================
    slide6 = prs.slides.add_slide(blank_layout)
    add_base_decorations(slide6, 6, "Slide 6: Pitch to Parents & Budget Action Plan", "Decision & Follow-Up Questions", c_blue_primary)

    # Left Container: All 5 Required Parent Pitch Questions
    card6_l = slide6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.35), Inches(5.2), Inches(5.7))
    card6_l.fill.solid()
    card6_l.fill.fore_color.rgb = c_white
    card6_l.line.color.rgb = c_border
    card6_l.line.width = Pt(1.5)

    tf = card6_l.text_frame
    tf.margin_left = Inches(0.3)
    tf.margin_right = Inches(0.3)
    tf.margin_top = Inches(0.25)

    p = tf.paragraphs[0]
    p.text = "PARENT PITCH: 5 CORE QUESTIONS"
    p.font.name = font_family
    p.font.size = Pt(11.5)
    p.font.bold = True
    p.font.color.rgb = c_blue_primary
    p.space_after = Pt(4)

    q_items = [
        ("1. Which car and monthly payment did you pick?",
         "2023 Nissan Rogue S AWD with Loan A at $229.42 / mo (or Loan B at $214.56 / mo)."),
        ("2. What is your transportation budget?",
         "$150.48 / month (11% of $1,368.00 gross monthly income)."),
        ("3. Does the monthly payment fit into your budget?",
         "No. Payment exceeds the initial $150.48 budget by $64.08 (Loan B) or $78.94 (Loan A)."),
        ("4. What do you expect to pay for car insurance?",
         "$245.00 / month (researched average for 17-18 yr old driver on family policy)."),
        ("5. What is your total monthly payment?",
         "$474.42 / month ($229.42 loan + $245.00 insurance; or $459.56 with Loan B).")
    ]

    for q, a in q_items:
        p_q = tf.add_paragraph()
        p_q.text = q
        p_q.font.name = font_family
        p_q.font.bold = True
        p_q.font.size = Pt(11)
        p_q.font.color.rgb = c_navy_header
        
        p_a = tf.add_paragraph()
        p_a.text = f"→ {a}"
        p_a.font.name = font_family
        p_a.font.size = Pt(10.5)
        p_a.font.color.rgb = c_blue_primary if ("Total" in q or "Which car" in q) else c_text_body
        p_a.space_after = Pt(4)

    # Right Container: Action Plan + Dealership Image
    card6_r = slide6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.25), Inches(1.35), Inches(6.3), Inches(5.7))
    card6_r.fill.solid()
    card6_r.fill.fore_color.rgb = c_white
    card6_r.line.color.rgb = c_green
    card6_r.line.width = Pt(1.5)

    # Real Car Dealership Image
    img6_path = "Car_Buying_Project/images/car_dealership.jpg"
    if os.path.exists(img6_path):
        slide6.shapes.add_picture(img6_path, Inches(6.5), Inches(1.55), width=Inches(5.8), height=Inches(2.3))

    # Action Plan Content below image
    tf_p = card6_r.text_frame
    tf_p.margin_left = Inches(0.3)
    tf_p.margin_right = Inches(0.3)
    tf_p.margin_top = Inches(2.65)

    p = tf_p.paragraphs[0]
    p.text = "HOW I WILL AFFORD IT (MY COMMITMENT TO YOU)"
    p.font.name = font_family
    p.font.size = Pt(11.5)
    p.font.bold = True
    p.font.color.rgb = c_green_dark
    p.space_after = Pt(2)

    plan_points = [
        ("1. Increase Work Hours at Target:",
         "Pick up one extra 8-hr shift/week (24 to 32 hrs/wk). Gross income jumps from $1,368 to $1,824.00/mo (+ $456.00/mo cash flow), easily covering the entire car payment and insurance."),
        ("2. Cut Discretionary Spending:",
         "Reduce dining out, streaming, and entertainment expenses, reallocating $150+/month directly toward gasoline and maintenance reserves."),
        ("3. Save Upfront Down Payment:",
         "Save $1,500 - $2,000 cash before purchase to reduce loan principal under $9,500, lowering monthly payments even further.")
    ]

    for title, desc in plan_points:
        p_t = tf_p.add_paragraph()
        p_t.text = f"• {title} "
        p_t.font.name = font_family
        p_t.font.bold = True
        p_t.font.size = Pt(10.5)
        p_t.font.color.rgb = c_navy_header
        r = p_t.add_run()
        r.text = desc
        r.font.name = font_family
        r.font.size = Pt(10)
        r.font.color.rgb = c_text_body
        p_t.space_after = Pt(3)

    output_path = "Car_Buying_Project/Buying_Your_First_Car_Presentation.pptx"
    prs.save(output_path)
    print(f"Presentation successfully created at: {output_path}")

if __name__ == "__main__":
    build_presentation()
