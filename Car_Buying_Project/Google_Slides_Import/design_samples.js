// Two editable Google Slides samples. Run buildSampleRequests on a COPY of the prior deck.
// Source: https://docs.google.com/presentation/d/164-KAC1SxB2USFju5Sno2JmOb-7MWrSQoOyAlu0QUZ4
// Output: https://docs.google.com/presentation/d/12QZhoYHyNIYp5-QrPESt9xvCQ9_JoqW-8lIQaR94NVk/edit
// Dimensions are points. The shared helpers keep the theme and layouts compact.
function buildSampleRequests(deck) {
  const requests = [], ink = '#172B3A', paper = '#F7F3EB', accent = '#B9694D', muted = '#66717A';
  let serial = 0;
  const color = hex => ({red:parseInt(hex.slice(1,3),16)/255,green:parseInt(hex.slice(3,5),16)/255,blue:parseInt(hex.slice(5,7),16)/255});
  const geometry = (page,x,y,w,h) => ({pageObjectId:page,size:{width:{magnitude:w,unit:'PT'},height:{magnitude:h,unit:'PT'}},transform:{scaleX:1,scaleY:1,translateX:x,translateY:y,unit:'PT'}});
  function box(page,x,y,w,h,fill) {
    const id = 'sample_box_'+(++serial);
    requests.push({createShape:{objectId:id,shapeType:'RECTANGLE',elementProperties:geometry(page,x,y,w,h)}},
      {updateShapeProperties:{objectId:id,shapeProperties:{shapeBackgroundFill:{solidFill:{color:{rgbColor:color(fill)}}},outline:{propertyState:'NOT_RENDERED'}},fields:'shapeBackgroundFill,outline'}});
  }
  function text(page,value,x,y,w,h,size=17,bold=false,fill=ink,font='Arial') {
    const id = 'sample_text_'+(++serial);
    requests.push({createShape:{objectId:id,shapeType:'TEXT_BOX',elementProperties:geometry(page,x,y,w,h)}},
      {insertText:{objectId:id,insertionIndex:0,text:value}},
      {updateTextStyle:{objectId:id,textRange:{type:'ALL'},style:{fontFamily:font,fontSize:{magnitude:size,unit:'PT'},bold,foregroundColor:{opaqueColor:{rgbColor:color(fill)}}},fields:'fontFamily,fontSize,bold,foregroundColor'}},
      {updateParagraphStyle:{objectId:id,textRange:{type:'ALL'},style:{spaceAbove:{magnitude:0,unit:'PT'},spaceBelow:{magnitude:0,unit:'PT'},lineSpacing:112},fields:'spaceAbove,spaceBelow,lineSpacing'}});
  }
  function background(page,fill) {
    requests.push({updatePageProperties:{objectId:page,pageProperties:{pageBackgroundFill:{solidFill:{color:{rgbColor:color(fill)}}}},fields:'pageBackgroundFill'}});
  }
  const cover = 'cb26_cover', car = 'p2';
  for (const slide of deck.slides.filter(s=>[cover,car].includes(s.objectId))) {
    for (const element of slide.pageElements) if (element.objectId !== 'p2_i9') requests.push({deleteObject:{objectId:element.objectId}});
  }
  background(cover,ink);
  text(cover,'PERSONAL FINANCE',50,43,365,30,12,true,paper);
  box(cover,53,91,49,3,accent);
  text(cover,'Buying my\nfirst car.',48,129,378,158,47,false,paper,'Georgia');
  text(cover,'On a budget',49,299,363,53,28,false,'#DDA88F','Georgia');
  text(cover,'Rehan Mangar',50,445,340,35,18,true,paper);
  requests.push({createImage:{objectId:'sample_cover_photo',url:'C:/Users/Venus/OneDrive/Desktop/Documents/School/Car_Buying_Project/images/jeep_wrangler.jpg',elementProperties:geometry(cover,452,135,460,259.3)}});
  box(cover,452,415,460,2,accent);
  text(cover,'$150.48',452,433,240,50,33,true,paper);
  text(cover,'My monthly transportation budget',454,485,460,29,14,false,'#C6D0D5');
  background(car,paper);
  text(car,'CAR #1',49,42,355,28,12,true,accent);
  text(car,'2023 Nissan\nRogue S AWD',47,86,353,92,32,false,ink,'Georgia');
  text(car,'$11,376',49,189,355,51,34,true);
  box(car,53,253,328,1,'#C9CDD0');
  text(car,'FEATURES',49,271,348,26,11,true,muted);
  text(car,'Keyless start\nApple CarPlay + Android Auto',49,301,348,59,17);
  text(car,'SAFETY',49,374,348,25,11,true,muted);
  text(car,'AWD, lane departure warning,\nbrake assist and cross-traffic alert.',49,403,348,65,16);
  requests.push({updatePageElementTransform:{objectId:'p2_i9',applyMode:'ABSOLUTE',transform:{scaleX:502*12700/3000000,scaleY:282.98*12700/3000000,translateX:410*12700,translateY:94*12700,unit:'EMU'}}});
  text(car,'FULL TANK',407,401,213,25,11,true,muted);
  text(car,'$56.41',407,430,213,41,27,true,accent);
  text(car,'14.5 gal × $3.89/gal',407,477,213,30,13,false,muted);
  text(car,'WHY I LIKE IT',654,401,260,25,11,true,muted);
  text(car,'No accidents or damage.\nIt looks nice for the price.',654,430,260,70,17);
  return requests;
}
function keepOnlySamples(deck) {
  return deck.slides.filter(s=>!['cb26_cover','p2'].includes(s.objectId)).map(s=>({deleteObject:{objectId:s.objectId}}));
}
