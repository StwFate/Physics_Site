// Compact native-text builder. Coordinates in content.json are 720 × 405 PDF points.
// Final deck: https://docs.google.com/presentation/d/1l9VCjH4sSSVv2xEAc-5KPMn_x0KNHLkEMbHqnfK2IrA/edit
// Build on a copy: clear its elements, upload each generated background, then add this text.
function nativeTextRequests(slides) {
  const requests=[], scale=4/3;
  let count=0;
  const rgb=h=>({red:parseInt(h.slice(1,3),16)/255,green:parseInt(h.slice(3,5),16)/255,blue:parseInt(h.slice(5,7),16)/255});
  for(const slide of slides) for(const item of slide.labels) {
    if(!item.text) continue;
    const id='career_native_'+(++count);
    requests.push(
      {createShape:{objectId:id,shapeType:'TEXT_BOX',elementProperties:{
        pageObjectId:slide.page,
        size:{width:{magnitude:item.w*scale,unit:'PT'},height:{magnitude:item.h*scale,unit:'PT'}},
        transform:{scaleX:1,scaleY:1,translateX:item.x*scale,translateY:item.y*scale,unit:'PT'}
      }}},
      {insertText:{objectId:id,insertionIndex:0,text:item.text}},
      {updateTextStyle:{objectId:id,textRange:{type:'ALL'},style:{
        fontFamily:item.font,fontSize:{magnitude:item.size*scale,unit:'PT'},bold:item.bold,
        foregroundColor:{opaqueColor:{rgbColor:rgb(item.color)}}
      },fields:'fontFamily,fontSize,bold,foregroundColor'}},
      {updateParagraphStyle:{objectId:id,textRange:{type:'ALL'},style:{
        alignment:item.align,spaceAbove:{magnitude:0,unit:'PT'},spaceBelow:{magnitude:0,unit:'PT'},lineSpacing:110
      },fields:'alignment,spaceAbove,spaceBelow,lineSpacing'}}
    );
    if(item.bullets) requests.push({createParagraphBullets:{objectId:id,textRange:{type:'ALL'},bulletPreset:'BULLET_DISC_CIRCLE_SQUARE'}});
  }
  return requests;
}
