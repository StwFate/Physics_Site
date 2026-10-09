import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

def create_deck():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]  # completely blank

    # Color Palette
    c_bg = RGBColor(248, 250, 252)         # Slate 50
    c_white = RGBColor(255, 255, 255)
    c_navy = RGBColor(15, 23, 42)          # Slate 900
    c_header_bar = RGBColor(24, 38, 70)    # Deep Navy
    c_blue_primary = RGBColor(29, 78, 216) # Blue 700
    c_blue_light = RGBColor(239, 246, 255) # Blue 50
    c_gray_border = RGBColor(226, 232, 240)
    c_text_dark = RGBColor(15, 23, 42)
    c_text_muted = RGBColor(100, 116, 139)
    c_green = RGBColor(16, 185, 129)       # Emerald 500
    c_green_light = RGBColor(236, 253, 245)
    c_red_accent = RGBColor(220, 38, 38)   # Red 600
    c_amber = RGBColor(217, 119, 6)

    def add_slide_header(slide, slide_num, title_text, category_badge):
        # Background fill
        bg_shape = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
        bg_shape.fill.solid()
        bg_shape.fill.fore_color.rgb = c_bg
        bg_shape.line.fill.background()

        # Top Header Bar
        header = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(1.15))
        header.fill.solid()
        header.fill.fore_color.rgb = c_header_bar
        header.line.fill.background()

        # Category Badge
        badge = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.2), Inches(2.3), Inches(0.35))
        badge.fill.solid()
        badge.fill.fore_color.rgb = c_blue_primary
        badge.line.fill.background()
        tf = badge.text_frame
        tf.word_wrap = True
        tf.margin_top = Inches(0.02)
        tf.margin_bottom = Inches(0.02)
        p = tf.paragraphs[0]
        p.text = category_badge.upper()
        p.alignment = PP_ALIGN.CENTER
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = c_white

        # Slide Title
        tx_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.58), Inches(9.5), Inches(0.5))
        tf = tx_box.text_frame
        tf.word_wrap = True
        tf.margin_top = Inches(0)
        p = tf.paragraphs[0]
        p.text = title_text
        p.font.size = Pt(20)
        p.font.bold = True
        p.font.color.rgb = c_white

        # Student Subtitle / Project Tag (Right aligned)
        sub_box = slide.shapes.add_textbox(Inches(8.5), Inches(0.25), Inches(4.0), Inches(0.75))
        tf = sub_box.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = "Buying Your First Car Project"
        p.alignment = PP_ALIGN.RIGHT
        p.font.size = Pt(12)
        p.font.color.rgb = RGBColor(148, 163, 184)
        
        p2 = tf.add_paragraph()
        p2.text = f"Student: Rehan Mangar  |  Slide {slide_num} of 6"
        p2.alignment = PP_ALIGN.RIGHT
        p2.font.size = Pt(11)
        p2.font.bold = True
        p2.font.color.rgb = RGBColor(226, 232, 240)

    # -------------------------------------------------------------------------
    # SLIDE 1: JOB & INCOME OVERVIEW
    # -------------------------------------------------------------------------
    slide1 = prs.slides.add_slide(blank_layout)
    add_slide_header(slide1, 1, "Slide 1: Employment & Income Overview", "Assigned Job Profile")

    # Left Card: Job Details & Pay Breakdown
    left_card = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.4), Inches(6.0), Inches(5.6))
    left_card.fill.solid()
    left_card.fill.fore_color.rgb = c_white
    left_card.line.color.rgb = c_gray_border
    left_card.line.width = Pt(1.5)

    tf = left_card.text_frame
    tf.margin_left = Inches(0.35)
    tf.margin_right = Inches(0.35)
    tf.margin_top = Inches(0.35)

    p = tf.paragraphs[0]
    p.text = "EMPLOYMENT INFORMATION"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = c_blue_primary

    p_job = tf.add_paragraph()
    p_job.text = "Assigned Job: Target Team Member"
    p_job.font.size = Pt(20)
    p_job.font.bold = True
    p_job.font.color.rgb = c_text_dark
    p_job.space_after = Pt(14)

    # Metric Grid - Wage & Hours
    metrics = [
        ("Hourly Wage", "$14.25 / hour", "Starting entry-level pay rate"),
        ("Work Schedule", "24 hours / week", "Part-time school-year schedule"),
        ("Gross Weekly Pay", "$342.00 / week", "Calculation: 24 hrs × $14.25/hr"),
        ("Gross Monthly Pay", "$1,368.00 / month", "Calculation: $342.00 × 4 weeks"),
        ("Transportation Budget (11%)", "$150.48 / month", "Rule: 11% of gross monthly income ($1,368 × 0.11)")
    ]

    for label, val, sub in metrics:
        p_lbl = tf.add_paragraph()
        p_lbl.text = f"• {label}: "
        p_lbl.font.bold = True
        p_lbl.font.size = Pt(13)
        p_lbl.font.color.rgb = c_text_dark
        
        run = p_lbl.add_run()
        run.text = val
        run.font.bold = True
        run.font.size = Pt(15)
        run.font.color.rgb = c_red_accent if "11%" in label else c_blue_primary

        p_sub = tf.add_paragraph()
        p_sub.text = f"   ({sub})"
        p_sub.font.size = Pt(10.5)
        p_sub.font.color.rgb = c_text_muted
        p_sub.space_after = Pt(8)

    # Right Side: Image and Budget Callout
    right_card = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(7.1), Inches(1.4), Inches(5.4), Inches(5.6))
    right_card.fill.solid()
    right_card.fill.fore_color.rgb = c_white
    right_card.line.color.rgb = c_gray_border
    right_card.line.width = Pt(1.5)

    # Embed Target image
    target_img_path = "Car_Buying_Project/images/target_store.jpg"
    if os.path.exists(target_img_path):
        slide1.shapes.add_picture(target_img_path, Inches(7.35), Inches(1.65), width=Inches(4.9), height=Inches(3.1))

    # Caption / Highlight Banner below image
    banner = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(7.35), Inches(5.0), Inches(4.9), Inches(1.75))
    banner.fill.solid()
    banner.fill.fore_color.rgb = c_blue_light
    banner.line.color.rgb = RGBColor(191, 219, 254)

    tf_b = banner.text_frame
    tf_b.margin_left = Inches(0.25)
    tf_b.margin_right = Inches(0.25)
    tf_b.margin_top = Inches(0.2)

    p = tf_b.paragraphs[0]
    p.text = "TARGET EMPLOYMENT SUMMARY"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = c_blue_primary

    p2 = tf_b.add_paragraph()
    p2.text = "Steady income allows starting car financing, but keeping total transportation costs aligned with the $150.48/mo guideline requires diligent budget planning and disciplined saving."
    p2.font.size = Pt(11)
    p2.font.color.rgb = c_text_dark

    # -------------------------------------------------------------------------
    # SLIDE 2: CAR #1 OVERVIEW (2023 Nissan Rogue S AWD)
    # -------------------------------------------------------------------------
    slide2 = prs.slides.add_slide(blank_layout)
    add_slide_header(slide2, 2, "Slide 2: Car #1 Overview - 2023 Nissan Rogue S AWD", "Primary Vehicle Choice")

    # Left: Vehicle Image & Quick Stats
    img_card = slide2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.4), Inches(5.5), Inches(5.6))
    img_card.fill.solid()
    img_card.fill.fore_color.rgb = c_white
    img_card.line.color.rgb = c_gray_border

    nissan_img_path = "Car_Buying_Project/images/nissan_rogue.jpg"
    if os.path.exists(nissan_img_path):
        slide2.shapes.add_picture(nissan_img_path, Inches(1.0), Inches(1.6), width=Inches(5.1), height=Inches(3.2))

    # Price & Gas Stats Badges below image
    badge1 = slide2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.0), Inches(5.05), Inches(2.45), Inches(1.7))
    badge1.fill.solid()
    badge1.fill.fore_color.rgb = c_blue_light
    badge1.line.color.rgb = RGBColor(191, 219, 254)
    tf = badge1.text_frame
    tf.margin_top = Inches(0.15)
    p = tf.paragraphs[0]
    p.text = "LIST PRICE"
    p.alignment = PP_ALIGN.CENTER
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = c_blue_primary
    p_pr = tf.add_paragraph()
    p_pr.text = "$11,376"
    p_pr.alignment = PP_ALIGN.CENTER
    p_pr.font.size = Pt(22)
    p_pr.font.bold = True
    p_pr.font.color.rgb = c_navy
    p_sub = tf.add_paragraph()
    p_sub.text = "Under $20K project budget"
    p_sub.alignment = PP_ALIGN.CENTER
    p_sub.font.size = Pt(9.5)
    p_sub.font.color.rgb = c_text_muted

    badge2 = slide2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(3.65), Inches(5.05), Inches(2.45), Inches(1.7))
    badge2.fill.solid()
    badge2.fill.fore_color.rgb = RGBColor(254, 243, 199)
    badge2.line.color.rgb = RGBColor(252, 211, 77)
    tf = badge2.text_frame
    tf.margin_top = Inches(0.15)
    p = tf.paragraphs[0]
    p.text = "GAS TANK & FILL-UP"
    p.alignment = PP_ALIGN.CENTER
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = c_amber
    p_pr = tf.add_paragraph()
    p_pr.text = "$56.41"
    p_pr.alignment = PP_ALIGN.CENTER
    p_pr.font.size = Pt(22)
    p_pr.font.bold = True
    p_pr.font.color.rgb = c_navy
    p_sub = tf.add_paragraph()
    p_sub.text = "14.5 Gal × $3.89/gal"
    p_sub.alignment = PP_ALIGN.CENTER
    p_sub.font.size = Pt(9.5)
    p_sub.font.color.rgb = c_text_muted

    # Right: Specifications, Features, and Justification Card
    detail_card = slide2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.6), Inches(1.4), Inches(5.9), Inches(5.6))
    detail_card.fill.solid()
    detail_card.fill.fore_color.rgb = c_white
    detail_card.line.color.rgb = c_gray_border
    tf_d = detail_card.text_frame
    tf_d.margin_left = Inches(0.35)
    tf_d.margin_right = Inches(0.35)
    tf_d.margin_top = Inches(0.3)

    p = tf_d.paragraphs[0]
    p.text = "VEHICLE SPECIFICATIONS"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = c_blue_primary

    p_title = tf_d.add_paragraph()
    p_title.text = "2023 Nissan Rogue S AWD / 4WD"
    p_title.font.size = Pt(18)
    p_title.font.bold = True
    p_title.font.color.rgb = c_text_dark
    p_title.space_after = Pt(10)

    # Features
    p_sec1 = tf_d.add_paragraph()
    p_sec1.text = "Features & Tech Options:"
    p_sec1.font.bold = True
    p_sec1.font.size = Pt(13)
    p_sec1.font.color.rgb = c_navy
    
    p_f1 = tf_d.add_paragraph()
    p_f1.text = "• Apple CarPlay & Android Auto integration with Bluetooth\n• Keyless entry with push-button start\n• Rearview backup camera & automatic parking assistance\n• 8-inch digital infotainment touchscreen"
    p_f1.font.size = Pt(11)
    p_f1.font.color.rgb = c_text_dark
    p_f1.space_after = Pt(10)

    # Safety
    p_sec2 = tf_d.add_paragraph()
    p_sec2.text = "Safety & Driver Assist Features:"
    p_sec2.font.bold = True
    p_sec2.font.size = Pt(13)
    p_sec2.font.color.rgb = c_navy

    p_f2 = tf_d.add_paragraph()
    p_f2.text = "• All-Wheel Drive (AWD / 4WD) for safe snow and rain driving\n• Nissan Safety Shield 360 with Automatic Emergency Braking\n• Lane Departure Warning & Blind Spot Warning\n• Rear Cross-Traffic Alert & Rear Automatic Braking"
    p_f2.font.size = Pt(11)
    p_f2.font.color.rgb = c_text_dark
    p_f2.space_after = Pt(10)

    # Why Chosen
    p_sec3 = tf_d.add_paragraph()
    p_sec3.text = "Why I Chose This Car:"
    p_sec3.font.bold = True
    p_sec3.font.size = Pt(13)
    p_sec3.font.color.rgb = c_navy

    p_f3 = tf_d.add_paragraph()
    p_f3.text = "\"Has no accident history, car looks immaculate with zero exterior damages, features modern safety tech and AWD for peace of mind, and the $11,376 price point provides exceptional value for a late-model compact SUV.\""
    p_f3.font.size = Pt(11)
    p_f3.font.italic = True
    p_f3.font.color.rgb = RGBColor(71, 85, 105)

    # -------------------------------------------------------------------------
    # SLIDE 3: CAR #1 FINANCING (Loan A vs Loan B)
    # -------------------------------------------------------------------------
    slide3 = prs.slides.add_slide(blank_layout)
    add_slide_header(slide3, 3, "Slide 3: Car #1 Financing Breakdown - Nissan Rogue", "Financing Comparison")

    # Loan A Card (Parents)
    card_a = slide3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.4), Inches(5.6), Inches(4.3))
    card_a.fill.solid()
    card_a.fill.fore_color.rgb = c_white
    card_a.line.color.rgb = c_green
    card_a.line.width = Pt(2)

    tf_a = card_a.text_frame
    tf_a.margin_left = Inches(0.3)
    tf_a.margin_right = Inches(0.3)
    tf_a.margin_top = Inches(0.25)

    p = tf_a.paragraphs[0]
    p.text = "LOAN A: SIMPLE INTEREST (PARENTS)"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = c_green

    p = tf_a.add_paragraph()
    p.text = "$229.42 / month"
    p.font.size = Pt(26)
    p.font.bold = True
    p.font.color.rgb = c_navy
    p.space_after = Pt(8)

    rows_a = [
        ("Loan Terms:", "4.2% Simple Interest / 5 Years (60 Months)"),
        ("Interest Formula:", "I = P × r × t = $11,376 × 0.042 × 5"),
        ("Total Interest Paid:", "$2,388.96  (Saves $1,683.12 vs Bank!)"),
        ("Total Cost with Interest:", "$11,376 + $2,388.96 = $13,764.96"),
        ("Monthly Payment Formula:", "$13,764.96 ÷ 60 months = $229.42 / mo")
    ]
    for lbl, val in rows_a:
        p = tf_a.add_paragraph()
        p.text = f"{lbl} "
        p.font.bold = True
        p.font.size = Pt(11.5)
        p.font.color.rgb = c_text_dark
        r = p.add_run()
        r.text = val
        r.font.bold = "Save" in val or "$229" in val
        r.font.color.rgb = c_green if "Save" in val else c_text_dark
        p.space_after = Pt(4)

    # Loan B Card (Bank)
    card_b = slide3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(1.4), Inches(5.7), Inches(4.3))
    card_b.fill.solid()
    card_b.fill.fore_color.rgb = c_white
    card_b.line.color.rgb = c_gray_border
    card_b.line.width = Pt(1.5)

    tf_b = card_b.text_frame
    tf_b.margin_left = Inches(0.3)
    tf_b.margin_right = Inches(0.3)
    tf_b.margin_top = Inches(0.25)

    p = tf_b.paragraphs[0]
    p.text = "LOAN B: COMPOUND INTEREST (BANK)"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = c_blue_primary

    p = tf_b.add_paragraph()
    p.text = "$214.56 / month"
    p.font.size = Pt(26)
    p.font.bold = True
    p.font.color.rgb = c_navy
    p.space_after = Pt(8)

    rows_b = [
        ("Loan Terms:", "5.1% Compounded Daily (365) / 6 Years (72 Mos)"),
        ("Compound Formula:", "A = P(1 + r/n)^(nt) = 11,376(1 + 0.051/365)^(2190)"),
        ("Total Amount Repaid:", "$15,448.08"),
        ("Total Interest Paid:", "$15,448.08 - $11,376 = $4,072.08"),
        ("Monthly Payment Formula:", "$15,448.08 ÷ 72 months = $214.56 / mo")
    ]
    for lbl, val in rows_b:
        p = tf_b.add_paragraph()
        p.text = f"{lbl} "
        p.font.bold = True
        p.font.size = Pt(11.5)
        p.font.color.rgb = c_text_dark
        r = p.add_run()
        r.text = val
        r.font.color.rgb = c_red_accent if "4,072" in val else c_text_dark
        p.space_after = Pt(4)

    # Decision Banner across bottom
    dec_box = slide3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(5.9), Inches(11.7), Inches(1.3))
    dec_box.fill.solid()
    dec_box.fill.fore_color.rgb = c_green_light
    dec_box.line.color.rgb = c_green
    dec_box.line.width = Pt(1.5)

    tf_dec = dec_box.text_frame
    tf_dec.margin_left = Inches(0.3)
    tf_dec.margin_right = Inches(0.3)
    tf_dec.margin_top = Inches(0.12)

    p = tf_dec.paragraphs[0]
    p.text = "WHICH LOAN WOULD YOU CHOOSE?  —  RECOMMENDATION: LOAN A (PARENTS)"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = RGBColor(6, 95, 70)

    p2 = tf_dec.add_paragraph()
    p2.text = "• Lowest Monthly Payment: Loan B is lower by $14.86/month ($214.56 vs $229.42).\n• Lowest Total Interest Paid: Loan A saves $1,683.12 in interest ($2,388.96 vs $4,072.08).\n• Conclusion: I choose Loan A. Paying an extra $14.86/month saves $1,683.12 and clears the debt 1 full year earlier."
    p2.font.size = Pt(11)
    p2.font.color.rgb = RGBColor(6, 78, 59)

    # -------------------------------------------------------------------------
    # SLIDE 4: CAR #2 OVERVIEW (2021 Toyota Corolla LE)
    # -------------------------------------------------------------------------
    slide4 = prs.slides.add_slide(blank_layout)
    add_slide_header(slide4, 4, "Slide 4: Car #2 Overview - 2021 Toyota Corolla LE", "Alternative Vehicle Choice")

    # Left: Vehicle Image & Quick Stats
    img_card4 = slide4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.4), Inches(5.5), Inches(5.6))
    img_card4.fill.solid()
    img_card4.fill.fore_color.rgb = c_white
    img_card4.line.color.rgb = c_gray_border

    toyota_img_path = "Car_Buying_Project/images/toyota_corolla.jpg"
    if os.path.exists(toyota_img_path):
        slide4.shapes.add_picture(toyota_img_path, Inches(1.0), Inches(1.6), width=Inches(5.1), height=Inches(3.2))

    # Price & Gas Stats Badges below image
    badge1_4 = slide4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.0), Inches(5.05), Inches(2.45), Inches(1.7))
    badge1_4.fill.solid()
    badge1_4.fill.fore_color.rgb = c_blue_light
    badge1_4.line.color.rgb = RGBColor(191, 219, 254)
    tf = badge1_4.text_frame
    tf.margin_top = Inches(0.15)
    p = tf.paragraphs[0]
    p.text = "LIST PRICE"
    p.alignment = PP_ALIGN.CENTER
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = c_blue_primary
    p_pr = tf.add_paragraph()
    p_pr.text = "$14,500"
    p_pr.alignment = PP_ALIGN.CENTER
    p_pr.font.size = Pt(22)
    p_pr.font.bold = True
    p_pr.font.color.rgb = c_navy
    p_sub = tf.add_paragraph()
    p_sub.text = "Well under $20K budget"
    p_sub.alignment = PP_ALIGN.CENTER
    p_sub.font.size = Pt(9.5)
    p_sub.font.color.rgb = c_text_muted

    badge2_4 = slide4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(3.65), Inches(5.05), Inches(2.45), Inches(1.7))
    badge2_4.fill.solid()
    badge2_4.fill.fore_color.rgb = RGBColor(254, 243, 199)
    badge2_4.line.color.rgb = RGBColor(252, 211, 77)
    tf = badge2_4.text_frame
    tf.margin_top = Inches(0.15)
    p = tf.paragraphs[0]
    p.text = "GAS TANK & FILL-UP"
    p.alignment = PP_ALIGN.CENTER
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = c_amber
    p_pr = tf.add_paragraph()
    p_pr.text = "$51.35"
    p_pr.alignment = PP_ALIGN.CENTER
    p_pr.font.size = Pt(22)
    p_pr.font.bold = True
    p_pr.font.color.rgb = c_navy
    p_sub = tf.add_paragraph()
    p_sub.text = "13.2 Gal × $3.89/gal"
    p_sub.alignment = PP_ALIGN.CENTER
    p_sub.font.size = Pt(9.5)
    p_sub.font.color.rgb = c_text_muted

    # Right: Specifications, Features, and Justification Card
    detail_card4 = slide4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.6), Inches(1.4), Inches(5.9), Inches(5.6))
    detail_card4.fill.solid()
    detail_card4.fill.fore_color.rgb = c_white
    detail_card4.line.color.rgb = c_gray_border
    tf_d4 = detail_card4.text_frame
    tf_d4.margin_left = Inches(0.35)
    tf_d4.margin_right = Inches(0.35)
    tf_d4.margin_top = Inches(0.3)

    p = tf_d4.paragraphs[0]
    p.text = "VEHICLE SPECIFICATIONS"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = c_blue_primary

    p_title = tf_d4.add_paragraph()
    p_title.text = "2021 Toyota Corolla LE Sedan"
    p_title.font.size = Pt(18)
    p_title.font.bold = True
    p_title.font.color.rgb = c_text_dark
    p_title.space_after = Pt(10)

    # Features
    p_sec1 = tf_d4.add_paragraph()
    p_sec1.text = "Features & Tech Options:"
    p_sec1.font.bold = True
    p_sec1.font.size = Pt(13)
    p_sec1.font.color.rgb = c_navy
    
    p_f1 = tf_d4.add_paragraph()
    p_f1.text = "• Apple CarPlay, Android Auto & Amazon Alexa compatibility\n• 8-inch high-resolution touchscreen with 6-speaker audio\n• Integrated backup camera with projected path\n• Remote keyless entry with trunk release"
    p_f1.font.size = Pt(11)
    p_f1.font.color.rgb = c_text_dark
    p_f1.space_after = Pt(10)

    # Safety
    p_sec2 = tf_d4.add_paragraph()
    p_sec2.text = "Safety & Driver Assist Features:"
    p_sec2.font.bold = True
    p_sec2.font.size = Pt(13)
    p_sec2.font.color.rgb = c_navy

    p_f2 = tf_d4.add_paragraph()
    p_f2.text = "• Toyota Safety Sense 2.0 with Pre-Collision System\n• Lane Departure Alert with Steering Assist & Lane Tracing\n• Full-Speed Range Dynamic Radar Cruise Control\n• 10 advanced airbags & Star Safety System"
    p_f2.font.size = Pt(11)
    p_f2.font.color.rgb = c_text_dark
    p_f2.space_after = Pt(10)

    # Why Chosen
    p_sec3 = tf_d4.add_paragraph()
    p_sec3.text = "Why I Chose This Car:"
    p_sec3.font.bold = True
    p_sec3.font.size = Pt(13)
    p_sec3.font.color.rgb = c_navy

    p_f3 = tf_d4.add_paragraph()
    p_f3.text = "\"Unmatched Toyota reliability, low maintenance costs, class-leading 38 MPG highway gas mileage that saves money at the pump, exceptional safety scores, and industry-leading resale retention.\""
    p_f3.font.size = Pt(11)
    p_f3.font.italic = True
    p_f3.font.color.rgb = RGBColor(71, 85, 105)

    # -------------------------------------------------------------------------
    # SLIDE 5: CAR #2 FINANCING (Loan C vs Loan D)
    # -------------------------------------------------------------------------
    slide5 = prs.slides.add_slide(blank_layout)
    add_slide_header(slide5, 5, "Slide 5: Car #2 Financing Breakdown - Toyota Corolla", "Financing Comparison")

    # Loan C Card (Parents)
    card_c = slide5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.4), Inches(5.6), Inches(4.3))
    card_c.fill.solid()
    card_c.fill.fore_color.rgb = c_white
    card_c.line.color.rgb = c_green
    card_c.line.width = Pt(2)

    tf_c = card_c.text_frame
    tf_c.margin_left = Inches(0.3)
    tf_c.margin_right = Inches(0.3)
    tf_c.margin_top = Inches(0.25)

    p = tf_c.paragraphs[0]
    p.text = "LOAN C: SIMPLE INTEREST (PARENTS)"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = c_green

    p = tf_c.add_paragraph()
    p.text = "$292.42 / month"
    p.font.size = Pt(26)
    p.font.bold = True
    p.font.color.rgb = c_navy
    p.space_after = Pt(8)

    rows_c = [
        ("Loan Terms:", "4.2% Simple Interest / 5 Years (60 Months)"),
        ("Interest Formula:", "I = P × r × t = $14,500 × 0.042 × 5"),
        ("Total Interest Paid:", "$3,045.00  (Saves $2,142.23 vs Bank!)"),
        ("Total Cost with Interest:", "$14,500 + $3,045.00 = $17,545.00"),
        ("Monthly Payment Formula:", "$17,545.00 ÷ 60 months = $292.42 / mo")
    ]
    for lbl, val in rows_c:
        p = tf_c.add_paragraph()
        p.text = f"{lbl} "
        p.font.bold = True
        p.font.size = Pt(11.5)
        p.font.color.rgb = c_text_dark
        r = p.add_run()
        r.text = val
        r.font.bold = "Save" in val or "$292" in val
        r.font.color.rgb = c_green if "Save" in val else c_text_dark
        p.space_after = Pt(4)

    # Loan D Card (Bank)
    card_d = slide5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(1.4), Inches(5.7), Inches(4.3))
    card_d.fill.solid()
    card_d.fill.fore_color.rgb = c_white
    card_d.line.color.rgb = c_gray_border
    card_d.line.width = Pt(1.5)

    tf_d = card_d.text_frame
    tf_d.margin_left = Inches(0.3)
    tf_d.margin_right = Inches(0.3)
    tf_d.margin_top = Inches(0.25)

    p = tf_d.paragraphs[0]
    p.text = "LOAN D: COMPOUND INTEREST (BANK)"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = c_blue_primary

    p = tf_d.add_paragraph()
    p.text = "$273.43 / month"
    p.font.size = Pt(26)
    p.font.bold = True
    p.font.color.rgb = c_navy
    p.space_after = Pt(8)

    rows_d = [
        ("Loan Terms:", "5.1% Compounded Daily (365) / 6 Years (72 Mos)"),
        ("Compound Formula:", "A = P(1 + r/n)^(nt) = 14,500(1 + 0.051/365)^(2190)"),
        ("Total Amount Repaid:", "$19,687.23"),
        ("Total Interest Paid:", "$19,687.23 - $14,500 = $5,187.23"),
        ("Monthly Payment Formula:", "$19,687.23 ÷ 72 months = $273.43 / mo")
    ]
    for lbl, val in rows_d:
        p = tf_d.add_paragraph()
        p.text = f"{lbl} "
        p.font.bold = True
        p.font.size = Pt(11.5)
        p.font.color.rgb = c_text_dark
        r = p.add_run()
        r.text = val
        r.font.color.rgb = c_red_accent if "5,187" in val else c_text_dark
        p.space_after = Pt(4)

    # Decision Banner across bottom
    dec_box5 = slide5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(5.9), Inches(11.7), Inches(1.3))
    dec_box5.fill.solid()
    dec_box5.fill.fore_color.rgb = c_green_light
    dec_box5.line.color.rgb = c_green
    dec_box5.line.width = Pt(1.5)

    tf_dec5 = dec_box5.text_frame
    tf_dec5.margin_left = Inches(0.3)
    tf_dec5.margin_right = Inches(0.3)
    tf_dec5.margin_top = Inches(0.12)

    p = tf_dec5.paragraphs[0]
    p.text = "WHICH LOAN WOULD YOU CHOOSE?  —  RECOMMENDATION: LOAN C (PARENTS)"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = RGBColor(6, 95, 70)

    p2 = tf_dec5.add_paragraph()
    p2.text = "• Lowest Monthly Payment: Loan D is lower by $18.99/month ($273.43 vs $292.42).\n• Lowest Total Interest Paid: Loan C saves $2,142.23 in interest ($3,045.00 vs $5,187.23).\n• Conclusion: I choose Loan C. Paying slightly more each month eliminates over $2,100 of interest and debt 1 year faster."
    p2.font.size = Pt(11)
    p2.font.color.rgb = RGBColor(6, 78, 59)

    # -------------------------------------------------------------------------
    # SLIDE 6: FOLLOW-UP QUESTIONS & PITCH TO PARENTS
    # -------------------------------------------------------------------------
    slide6 = prs.slides.add_slide(blank_layout)
    add_slide_header(slide6, 6, "Slide 6: Pitch to Parents & Budget Action Plan", "Decision & Follow-Up Questions")

    # Left Column: Direct Answers to the 5 Parent Pitch Questions
    q_card = slide6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.4), Inches(6.0), Inches(5.6))
    q_card.fill.solid()
    q_card.fill.fore_color.rgb = c_white
    q_card.line.color.rgb = c_gray_border
    q_card.line.width = Pt(1.5)

    tf_q = q_card.text_frame
    tf_q.margin_left = Inches(0.3)
    tf_q.margin_right = Inches(0.3)
    tf_q.margin_top = Inches(0.25)

    p = tf_q.paragraphs[0]
    p.text = "PARENT PITCH: 5 CORE QUESTIONS"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = c_blue_primary
    p.space_after = Pt(6)

    q_answers = [
        ("1. Chosen Car & Monthly Payment:", "2023 Nissan Rogue S AWD with Loan A at $229.42 / mo (or Loan B at $214.56 / mo)."),
        ("2. Transportation Budget (11%):", "$150.48 / month (11% of $1,368.00 gross monthly pay)."),
        ("3. Does it fit your current budget?", "No — payment exceeds initial $150.48 budget by $64.08 to $78.94/mo (before insurance)."),
        ("4. Researched Car Insurance:", "$245.00 / month (average for 17-18 yr old added to family policy)."),
        ("5. Total Monthly Payment:", "$474.42 / month ($229.42 car loan + $245.00 insurance; or $459.56 with Loan B).")
    ]

    for q_num, ans in q_answers:
        p_q = tf_q.add_paragraph()
        p_q.text = q_num
        p_q.font.bold = True
        p_q.font.size = Pt(11.5)
        p_q.font.color.rgb = c_navy
        
        p_a = tf_q.add_paragraph()
        p_a.text = f"→ {ans}"
        p_a.font.size = Pt(11)
        p_a.font.color.rgb = c_blue_primary if "Total" in q_num or "Chosen" in q_num else c_text_dark
        p_a.space_after = Pt(6)

    # Right Column: Action Plan for Parents
    plan_card = slide6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(7.1), Inches(1.4), Inches(5.4), Inches(5.6))
    plan_card.fill.solid()
    plan_card.fill.fore_color.rgb = c_white
    plan_card.line.color.rgb = c_green
    plan_card.line.width = Pt(1.5)

    tf_p = plan_card.text_frame
    tf_p.margin_left = Inches(0.3)
    tf_p.margin_right = Inches(0.3)
    tf_p.margin_top = Inches(0.25)

    p = tf_p.paragraphs[0]
    p.text = "HOW I WILL AFFORD IT (MY COMMITMENT)"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = c_green
    p.space_after = Pt(6)

    plan_steps = [
        ("Step 1: Increase Work Hours at Target",
         "Pick up one extra 8-hour shift per week to move from 24 to 32 hrs/wk. Gross income rises from $1,368 to $1,824.00/mo (+ $456.00/mo net cash flow)."),
        ("Step 2: Reallocate Personal Budget",
         "Cut discretionary spending on dining out, snacks, subscriptions, and clothes, redirecting $150+/mo directly to insurance and fuel."),
        ("Step 3: Save Upfront Down Payment",
         "Work over summer/break to save a $1,500 to $2,000 cash down payment before buying, reducing the financed balance to under $9,500."),
        ("Why This is a Responsible Investment",
         "The Nissan Rogue provides AWD winter safety, modern crash prevention, and reliable transit to work and school, building real financial discipline.")
    ]

    for title, desc in plan_steps:
        p_st = tf_p.add_paragraph()
        p_st.text = title
        p_st.font.bold = True
        p_st.font.size = Pt(11.5)
        p_st.font.color.rgb = c_navy
        
        p_sd = tf_p.add_paragraph()
        p_sd.text = desc
        p_sd.font.size = Pt(10.5)
        p_sd.font.color.rgb = c_text_muted
        p_sd.space_after = Pt(6)

    # Save presentation
    output_path = "Car_Buying_Project/Buying_Your_First_Car_Presentation.pptx"
    prs.save(output_path)
    print(f"Presentation saved successfully to: {output_path}")

if __name__ == "__main__":
    create_deck()
