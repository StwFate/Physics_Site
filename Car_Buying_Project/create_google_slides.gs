/**
 * ============================================================================
 * GOOGLE SLIDES AUTOMATION: Buying Your First Car Project
 * Student: Rehan Mangar
 * 
 * HOW TO USE THIS SCRIPT:
 * 1. Open Google Slides in your browser (go to https://slides.new).
 * 2. In the top menu, click "Extensions" > "Apps Script".
 * 3. Delete any code in the editor, paste this entire script, and click "Save" (disk icon).
 * 4. Click the "Run" button at the top.
 * 5. If prompted, click "Review Permissions" > select your Google account > "Advanced" > "Go to Untitled project (unsafe)" > "Allow".
 * 6. Switch back to your Google Slides tab — all 6 slides are generated instantly with clean casual student formatting!
 * ============================================================================
 */

function buildCarProjectPresentation() {
  var presentation = SlidesApp.getActivePresentation();
  
  // Remove existing blank slides if starting with a fresh deck
  var existingSlides = presentation.getSlides();
  
  // Color Palette - Clean, casual student theme
  var COLOR_BG = '#f8fafc';         // Soft off-white
  var COLOR_TITLE = '#0f172a';      // Dark slate
  var COLOR_TEXT = '#334155';       // Slate text
  var COLOR_ACCENT = '#2563eb';     // Clean blue
  var COLOR_GREEN = '#16a34a';      // Green highlight for savings
  var COLOR_CARD_BG = '#ffffff';    // White card background
  var COLOR_CARD_BORDER = '#cbd5e1';// Light border
  
  var FONT_MAIN = 'Arial';

  // Helper to style text
  function formatText(shape, text, fontSize, isBold, colorHex) {
    var textRange = shape.getText();
    textRange.setText(text);
    textRange.getTextStyle().setFontFamily(FONT_MAIN);
    textRange.getTextStyle().setFontSize(fontSize);
    textRange.getTextStyle().setBold(isBold);
    textRange.getTextStyle().setForegroundColor(colorHex);
    return textRange;
  }

  // Helper to add clean title
  function addSlideTitle(slide, titleText, subtitleText) {
    var titleBox = slide.insertTextBox(titleText, 40, 25, 640, 45);
    var tStyle = titleBox.getText().getTextStyle();
    tStyle.setFontFamily(FONT_MAIN);
    tStyle.setFontSize(24);
    tStyle.setBold(true);
    tStyle.setForegroundColor(COLOR_TITLE);

    if (subtitleText) {
      var subBox = slide.insertTextBox(subtitleText, 40, 68, 640, 25);
      var sStyle = subBox.getText().getTextStyle();
      sStyle.setFontFamily(FONT_MAIN);
      sStyle.setFontSize(12);
      sStyle.setBold(false);
      sStyle.setForegroundColor('#64748b');
    }
  }

  // ==========================================================================
  // SLIDE 1: Job & Budget
  // ==========================================================================
  var slide1 = presentation.appendSlide(SlidesApp.PredefinedLayout.BLANK);
  slide1.getBackground().setSolidFill(COLOR_BG);
  addSlideTitle(slide1, 'My Job & Transportation Budget', 'Slide 01 • Rehan Mangar');

  var s1Box = slide1.insertTextBox('', 40, 110, 360, 260);
  var s1Text = 
    'Job: Target Team Member\n\n' +
    '• Hourly Pay: $14.25 / hr\n' +
    '• Work Schedule: 24 hours a week\n' +
    '• Weekly Gross Pay: $342.00\n' +
    '  ($14.25 × 24 hours)\n' +
    '• Monthly Gross Pay: $1,368.00\n' +
    '  ($342.00 × 4 weeks)\n\n' +
    '11% Transportation Budget: $150.48 / month\n' +
    '($1,368.00 × 0.11)';
  formatText(s1Box, s1Text, 14, false, COLOR_TEXT);

  // Picture placeholder / insert
  var s1PicBox = slide1.insertShape(SlidesApp.ShapeType.ROUNDED_RECTANGLE, 420, 110, 260, 250);
  s1PicBox.getFill().setSolidFill('#e2e8f0');
  s1PicBox.getBorder().getLineFill().setSolidFill('#94a3b8');
  formatText(s1PicBox, '📷 [Insert Target Store Photo Here]\n\nTarget storefront where I work 24 hours/week.', 13, false, '#475569');

  slide1.getNotesPage().getSpeakerNotesShape().getText().setText(
    'Speaker Notes: I work at Target making $14.25 an hour for 24 hours a week during the school year. That brings in $342 a week, or $1,368 a month before taxes. Following the 11% personal finance guideline, my monthly transportation budget is $150.48.'
  );

  // ==========================================================================
  // SLIDE 2: Car #1 Overview (2023 Nissan Rogue S AWD)
  // ==========================================================================
  var slide2 = presentation.appendSlide(SlidesApp.PredefinedLayout.BLANK);
  slide2.getBackground().setSolidFill(COLOR_BG);
  addSlideTitle(slide2, 'Car #1: 2023 Nissan Rogue S AWD', 'Slide 02 • Vehicle Overview');

  var s2Box = slide2.insertTextBox('', 40, 105, 360, 275);
  var s2Text = 
    'Price: $11,376 (under $20k budget)\n' +
    'Gas Tank: 14.5 gallons ($56.41 to fill up at $3.89/gal)\n\n' +
    'Key Features & Safety:\n' +
    '• All-wheel drive (AWD) for snow and rain\n' +
    '• Automatic emergency braking & backup camera\n' +
    '• Blind spot monitors & lane departure warning\n' +
    '• Apple CarPlay and Android Auto\n' +
    '• Keyless entry with push-button start\n\n' +
    'Why I Picked It:\n' +
    'It has a clean history with no accidents, all-wheel drive for winter weather, and stays way under my $20,000 budget.';
  formatText(s2Box, s2Text, 13, false, COLOR_TEXT);

  var s2PicBox = slide2.insertShape(SlidesApp.ShapeType.ROUNDED_RECTANGLE, 420, 105, 260, 250);
  s2PicBox.getFill().setSolidFill('#e2e8f0');
  s2PicBox.getBorder().getLineFill().setSolidFill('#94a3b8');
  formatText(s2PicBox, '📷 [Insert 2023 Nissan Rogue Photo Here]\n\n2023 Nissan Rogue S AWD ($11,376)', 13, false, '#475569');

  slide2.getNotesPage().getSpeakerNotesShape().getText().setText(
    'Speaker Notes: For my first car, I picked a 2023 Nissan Rogue S AWD for $11,376. It has a 14.5 gallon tank which costs $56.41 to fill up. It comes with AWD for snowy winters, modern safety features like automatic braking, and phone connectivity.'
  );

  // ==========================================================================
  // SLIDE 3: Car #1 Financing (Loan A vs Loan B)
  // ==========================================================================
  var slide3 = presentation.appendSlide(SlidesApp.PredefinedLayout.BLANK);
  slide3.getBackground().setSolidFill(COLOR_BG);
  addSlideTitle(slide3, 'Car #1 Financing: Nissan Rogue Loans', 'Slide 03 • Comparing Loan A vs Loan B');

  // Loan A Box
  var cardA = slide3.insertShape(SlidesApp.ShapeType.ROUNDED_RECTANGLE, 40, 105, 305, 175);
  cardA.getFill().setSolidFill(COLOR_CARD_BG);
  cardA.getBorder().getLineFill().setSolidFill(COLOR_GREEN);
  cardA.getBorder().setWeight(2);
  var tA = 
    'Loan A: Parents (Simple Interest)\n\n' +
    '• Monthly Payment: $229.42 / mo\n' +
    '• 4.2% simple interest for 5 years (60 mos)\n' +
    '• Total Interest: $2,388.96\n' +
    '• Total Cost: $13,764.96\n' +
    '★ Saves $1,683.12 in interest vs. bank!';
  formatText(cardA, tA, 13, false, COLOR_TEXT);

  // Loan B Box
  var cardB = slide3.insertShape(SlidesApp.ShapeType.ROUNDED_RECTANGLE, 365, 105, 315, 175);
  cardB.getFill().setSolidFill(COLOR_CARD_BG);
  cardB.getBorder().getLineFill().setSolidFill(COLOR_CARD_BORDER);
  var tB = 
    'Loan B: Bank (Compound Interest)\n\n' +
    '• Monthly Payment: $214.56 / mo\n' +
    '• 5.1% daily compound for 6 years (72 mos)\n' +
    '• Total Interest: $4,072.08\n' +
    '• Total Cost: $15,448.08\n' +
    '• Cheaper monthly, but costs $1,683 more total.';
  formatText(cardB, tB, 13, false, COLOR_TEXT);

  // Decision Box
  var decBox1 = slide3.insertShape(SlidesApp.ShapeType.ROUNDED_RECTANGLE, 40, 295, 640, 80);
  decBox1.getFill().setSolidFill('#f0fdf4');
  decBox1.getBorder().getLineFill().setSolidFill(COLOR_GREEN);
  var tDec1 = 
    'Which Loan Would You Choose?\n' +
    '• Lowest Monthly Payment: Loan B ($214.56/mo vs. $229.42/mo — $14.86 cheaper per month).\n' +
    '• Lowest Total Interest: Loan A ($2,388.96 vs. $4,072.08 — saves $1,683.12).\n' +
    '• My Choice: Loan A (Parents). Paying $15 more a month saves over $1,680 in interest and finishes a whole year sooner.';
  formatText(decBox1, tDec1, 12, false, COLOR_TEXT);

  slide3.getNotesPage().getSpeakerNotesShape().getText().setText(
    'Speaker Notes: Loan B from the bank has a slightly lower monthly payment by about $15, but it lasts 6 years and compounds daily, adding over $4,000 in interest. Loan A from my parents saves $1,683 in interest and finishes 12 months earlier, so I choose Loan A.'
  );

  // ==========================================================================
  // SLIDE 4: Car #2 Overview (2012 Jeep Wrangler Unlimited Sport)
  // ==========================================================================
  var slide4 = presentation.appendSlide(SlidesApp.PredefinedLayout.BLANK);
  slide4.getBackground().setSolidFill(COLOR_BG);
  addSlideTitle(slide4, 'Car #2: 2012 Jeep Wrangler Unlimited Sport', 'Slide 04 • Vehicle Overview');

  var s4Box = slide4.insertTextBox('', 40, 105, 360, 275);
  var s4Text = 
    'Price: $8,995 (cheapest vehicle option)\n' +
    'Gas Tank: 22.5 gallons ($87.53 to fill up at $3.89/gal)\n\n' +
    'Key Features & Safety:\n' +
    '• Command-Trac shift-on-the-fly 4-wheel drive\n' +
    '• Removable doors and fold-down soft top\n' +
    '• Wash-out interior with floor drain plugs\n' +
    '• Electronic stability control & roll mitigation\n' +
    '• Hill start assist & 4-wheel anti-lock brakes\n\n' +
    'Why I Picked It:\n' +
    'It is a great deal at under $9,000, has authentic 4WD for rough weather, and it is fun to drive with the doors and top off.';
  formatText(s4Box, s4Text, 13, false, COLOR_TEXT);

  var s4PicBox = slide4.insertShape(SlidesApp.ShapeType.ROUNDED_RECTANGLE, 420, 105, 260, 250);
  s4PicBox.getFill().setSolidFill('#e2e8f0');
  s4PicBox.getBorder().getLineFill().setSolidFill('#94a3b8');
  formatText(s4PicBox, '📷 [Insert 2012 Jeep Wrangler Photo Here]\n\n2012 Jeep Wrangler Unlimited Sport 4WD ($8,995)', 13, false, '#475569');

  slide4.getNotesPage().getSpeakerNotesShape().getText().setText(
    'Speaker Notes: For Car #2, I chose a 2012 Jeep Wrangler Unlimited Sport for $8,995. Gas is pricier because the tank is 22.5 gallons, costing $87.53 to fill. I like it because it is affordable, has real 4WD capability, and has removable doors and roof.'
  );

  // ==========================================================================
  // SLIDE 5: Car #2 Financing (Loan C vs Loan D)
  // ==========================================================================
  var slide5 = presentation.appendSlide(SlidesApp.PredefinedLayout.BLANK);
  slide5.getBackground().setSolidFill(COLOR_BG);
  addSlideTitle(slide5, 'Car #2 Financing: Jeep Wrangler Loans', 'Slide 05 • Comparing Loan C vs Loan D');

  // Loan C Box
  var cardC = slide5.insertShape(SlidesApp.ShapeType.ROUNDED_RECTANGLE, 40, 105, 305, 175);
  cardC.getFill().setSolidFill(COLOR_CARD_BG);
  cardC.getBorder().getLineFill().setSolidFill(COLOR_GREEN);
  cardC.getBorder().setWeight(2);
  var tC = 
    'Loan C: Parents (Simple Interest)\n\n' +
    '• Monthly Payment: $181.40 / mo\n' +
    '• 4.2% simple interest for 5 years (60 mos)\n' +
    '• Total Interest: $1,888.95\n' +
    '• Total Cost: $10,883.95\n' +
    '★ Saves $1,330.84 in interest vs. bank!';
  formatText(cardC, tC, 13, false, COLOR_TEXT);

  // Loan D Box
  var cardD = slide5.insertShape(SlidesApp.ShapeType.ROUNDED_RECTANGLE, 365, 105, 315, 175);
  cardD.getFill().setSolidFill(COLOR_CARD_BG);
  cardD.getBorder().getLineFill().setSolidFill(COLOR_CARD_BORDER);
  var tD = 
    'Loan D: Bank (Compound Interest)\n\n' +
    '• Monthly Payment: $169.65 / mo\n' +
    '• 5.1% daily compound for 6 years (72 mos)\n' +
    '• Total Interest: $3,219.79\n' +
    '• Total Cost: $12,214.79\n' +
    '• $11.75 cheaper monthly, but $1,330 more interest.';
  formatText(cardD, tD, 13, false, COLOR_TEXT);

  // Decision Box
  var decBox2 = slide5.insertShape(SlidesApp.ShapeType.ROUNDED_RECTANGLE, 40, 295, 640, 80);
  decBox2.getFill().setSolidFill('#f0fdf4');
  decBox2.getBorder().getLineFill().setSolidFill(COLOR_GREEN);
  var tDec2 = 
    'Which Loan Would You Choose?\n' +
    '• Lowest Monthly Payment: Loan D ($169.65/mo vs. $181.40/mo — $11.75 cheaper per month).\n' +
    '• Lowest Total Interest: Loan C ($1,888.95 vs. $3,219.79 — saves $1,330.84).\n' +
    '• My Choice: Loan C (Parents). Paying $11.75 more per month saves over $1,330 in interest and finishes 12 months sooner.';
  formatText(decBox2, tDec2, 12, false, COLOR_TEXT);

  slide5.getNotesPage().getSpeakerNotesShape().getText().setText(
    'Speaker Notes: For the Jeep, Loan D from the bank is $169.65 a month, while Loan C from my parents is $181.40. I would pick Loan C because saving $1,330 in interest is well worth paying an extra $11.75 a month, and it pays the car off in 5 years instead of 6.'
  );

  // ==========================================================================
  // SLIDE 6: Pitch to Parents (Follow-Up Questions)
  // ==========================================================================
  var slide6 = presentation.appendSlide(SlidesApp.PredefinedLayout.BLANK);
  slide6.getBackground().setSolidFill(COLOR_BG);
  addSlideTitle(slide6, 'Pitch to Parents: Follow-Up Questions', 'Slide 06 • Budget Reflection & Affordability');

  var s6BoxL = slide6.insertTextBox('', 40, 105, 360, 275);
  var s6TextL = 
    '1. Which car and loan did you pick?\n' +
    '   2023 Nissan Rogue with Loan A ($229.42 / mo).\n' +
    '   (Alternative: 2012 Jeep with Loan C at $181.40 / mo).\n\n' +
    '2. What is your transportation budget?\n' +
    '   $150.48 / month (11% of $1,368 gross income).\n\n' +
    '3. Does the payment fit into your budget?\n' +
    '   No. The car payment alone is over my budget by $78.94 (Rogue) or $30.92 (Jeep).\n\n' +
    '4. What do you expect to pay for insurance?\n' +
    '   $245.00 / month on my parents\' auto policy.\n\n' +
    '5. What is your total monthly payment?\n' +
    '   $474.42 / month for Rogue ($229.42 loan + $245 insurance) or $426.40 for Jeep.';
  formatText(s6BoxL, s6TextL, 12.5, false, COLOR_TEXT);

  var s6BoxR = slide6.insertShape(SlidesApp.ShapeType.ROUNDED_RECTANGLE, 420, 105, 260, 270);
  s6BoxR.getFill().setSolidFill('#ecfdf5');
  s6BoxR.getBorder().getLineFill().setSolidFill(COLOR_GREEN);
  var s6TextR = 
    'How I Plan to Afford It:\n\n' +
    '1. Pick up 1 extra shift at Target each week\n' +
    '   Working 32 hrs/wk instead of 24 adds $456/month gross ($1,824 total monthly income).\n\n' +
    '2. Cut non-essential spending\n' +
    '   Cut back on eating out and entertainment to free up $100+ each month.\n\n' +
    '3. Put down $1,500 cash from savings\n' +
    '   A down payment reduces the total loan amount and drops monthly payments.';
  formatText(s6BoxR, s6TextR, 12, false, COLOR_TEXT);

  slide6.getNotesPage().getSpeakerNotesShape().getText().setText(
    'Speaker Notes: To pitch this to my parents, I know the monthly payment and insurance exceed my starting 11% budget. But I have a clear plan to afford it: by picking up one extra shift at Target to work 32 hours a week, I earn an extra $456 a month gross, which covers the entire difference.'
  );

  // Clean up initial empty slide if one was present
  if (existingSlides.length > 0 && existingSlides[0].getShapes().length === 0) {
    existingSlides[0].remove();
  }
}
