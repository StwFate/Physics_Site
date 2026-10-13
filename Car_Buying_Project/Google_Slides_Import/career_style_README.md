# Career Project design adaptation

Google Slides: https://docs.google.com/presentation/d/1l9VCjH4sSSVv2xEAc-5KPMn_x0KNHLkEMbHqnfK2IrA/edit

Seven slides follow the official title/job/car/loan/car/loan/follow-up order.
The visual reference is `C:/Users/Venus/Downloads/Career Project (2).pdf`.
The palette, fonts, title decorations, photo frames, information strips, tables,
and callouts follow that reference. Text, car photos, and spacing were adapted.

`career_style_deck.py` generates the seven decorative background layers and a
compact content configuration. `career_style_native.js` builds editable text
from that configuration. Photos and decorative frames are part of the fixed
background layers; change them in the Python source and regenerate the layers.
No serialized Google Slides API command dump is needed.

All seven final PDF pages were visually reviewed after the heading and safety
list fit repairs. The PPTX is an export of the final native Google Slides file.
