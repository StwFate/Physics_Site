"""Recreate the supplied Career Project design with native Google Slides text.
Decorative layers and rounded photo frames are rendered at 4x resolution.
Official project order: title, job, car 1, loans A/B, car 2, loans C/D, follow-up.
"""
from pathlib import Path
import json, io
from PIL import Image, ImageDraw, ImageOps
from pypdf import PdfReader
ROOT = Path(__file__).resolve().parents[1]
OUT = Path(__file__).resolve().parent / 'career_style_assets'
OUT.mkdir(exist_ok=True)
S = 4
C = dict(paper='#fffdf7', ink='#1c1c1c', yellow='#fde047', pink='#f472b6', blue='#38bdf8', green='#4ade80', orange='#fb923c', purple='#c084fc', muted='#52627d')
reference = PdfReader(r'C:\Users\Venus\Downloads\Career Project (2).pdf')
phone = Image.open(io.BytesIO(reference.pages[3].images[0].data)).convert('RGB')
writing = Image.open(io.BytesIO(reference.pages[5].images[0].data)).convert('RGB')
slides = []
def begin(page):
    global canvas, draw, labels
    canvas = Image.new('RGB', (720*S,405*S), C['paper']); draw = ImageDraw.Draw(canvas); labels=[]
def rect(x,y,w,h,fill,r=8,stroke=2.3):
    draw.rounded_rectangle((x*S,y*S,(x+w)*S,(y+h)*S), radius=r*S, fill=fill, outline=C['ink'] if stroke else None, width=round(stroke*S))
def photo(image,x,y,w,h,r=18,fit=False):
    source = image if isinstance(image,Image.Image) else Image.open(ROOT/'images'/image).convert('RGB')
    size=(round(w*S),round(h*S)); mask=Image.new('L',size); ImageDraw.Draw(mask).rounded_rectangle((0,0,size[0]-1,size[1]-1),r*S,fill=255)
    pic=ImageOps.contain(source,size) if fit else ImageOps.fit(source,size)
    if fit:
        plate=Image.new('RGB',size,C['paper']);plate.paste(pic,((size[0]-pic.width)//2,(size[1]-pic.height)//2));pic=plate
    canvas.paste(pic,(round(x*S),round(y*S)),mask); draw.rounded_rectangle((x*S,y*S,(x+w)*S,(y+h)*S),r*S,outline=C['ink'],width=round(2.3*S))
def text(value,x,y,w,h,size=12,bold=False,color='ink',font='Arial',align='START',bullets=False):
    labels.append(dict(text=value,x=x,y=y,w=w,h=h,size=size,bold=bold,color=C.get(color,color),font=font,align=align,bullets=bullets))
def rotated(x,y,size,degrees,fill):
    tile=Image.new('RGBA',(round(size*S+12*S),round(size*S+12*S)));d=ImageDraw.Draw(tile);d.rectangle((6*S,6*S,(size+6)*S,(size+6)*S),fill=fill,outline=C['ink'],width=round(2.5*S));tile=tile.rotate(degrees,expand=True);canvas.paste(tile,(round(x*S),round(y*S)),tile)
def header(title,n,fill=None):
    rect(30,18,460,42,fill or C['yellow']);rect(570,18,120,34,C['pink'],r=6)
    text(title,38,28,444,29,16,True,align='CENTER');text(f'SLIDE {n:02d} / 07',576,25,108,22,11,True,align='CENTER')
def save(page):
    path=OUT/(page+'.png');canvas.save(path);slides.append(dict(page=page,background=str(path),labels=labels))
begin('cb26_cover')
rotated(-4,-15,50,40,C['blue']);rotated(325,24,50,-27,C['green']);rotated(597,337,50,16,C['green'])
draw.ellipse((198*S,288*S,260*S,350*S),fill=C['pink'],outline=C['ink'],width=round(2.5*S))
rect(40,45,230,30,C['blue'],r=5);text('MY CAR PRESENTATION',44,52,222,22,10,True,align='CENTER')
text('BUYING MY FIRST CAR',44,89,355,63,33,True,font='Oswald');text('ON A BUDGET',44,148,350,50,26,True,font='Oswald')
rect(40,275,173,60,C['paper'],r=10);text('PREPARED BY:',46,286,161,19,11,True,color='#666666',align='CENTER');text('Rehan Mangar',46,303,161,24,13,True,font='Lexend',align='CENTER')
rect(420,67,285,260,C['pink'],r=10);photo('jeep_wrangler.jpg',412,59,285,260,r=10)
rect(596,49,86,23,C['yellow'],r=12);text('CAR PROJECT',597,55,84,14,7.5,True,align='CENTER');save('cb26_cover')
begin('p1');header('MY JOB & PAY',2)
rect(35,75,211,177,C['yellow'],r=28);text('GROSS MONTHLY PAY',43,109,195,25,12,True,align='CENTER');text('$1,368',43,149,195,46,26,True,font='Oswald',align='CENTER');text('Before taxes',43,208,195,22,11,color='muted',align='CENTER');photo('target_store.jpg',35,264,211,98,r=16)
job=[('MY JOB','Target team member','blue'),('HOURLY PAY','$14.25','yellow'),('HOURS EACH WEEK','24 hours','green'),('GROSS WEEKLY PAY','$342','pink')]
for i,(label,value,col) in enumerate(job):
    x=264+(i%2)*225;y=75+(i//2)*100;rect(x,y,206,88,'white',r=12);rect(x+9,y+10,14,14,C[col],r=3,stroke=1.5);text(label,x+28,y+10,171,22,11,True);text(value,x+28,y+36,171,38,16,True)
rect(264,275,431,88,'white',r=12);rect(273,285,14,14,C['purple'],r=3,stroke=1.5);text('HOW I GOT MY PAY',292,285,391,23,11,True);text('$14.25 × 24 = $342 a week\n$342 × 4 weeks = $1,368 a month',292,313,391,45,13);save('p1')
def car(page,n,model,price,features,tank,reason,image):
    begin(page);header('CAR #'+str(n)+': '+(model.upper() if n==1 else '2012 JEEP WRANGLER'),3 if n==1 else 5)
    values=[('YEAR / MAKE / MODEL',model,'yellow'),('PRICE',price,'blue'),('FEATURES',features,'green'),('COST TO FILL THE TANK',tank,'purple'),('WHY I LIKE IT',reason,'orange')]
    for i,(label,body,col) in enumerate(values):
        y=72+i*62;rect(35,y,390,54,'white',r=9);rect(42,y+7,12,41,C[col],r=3,stroke=1);text(label,66,y+7,350,21,12,True);text(body,66,y+27,350,24,11,color='muted')
    photo(image,438,89,254,156,r=24,fit=True);rect(450,285,235,95,C['blue'],r=17);text('SAFETY FEATURES',459,295,217,23,14,True,align='CENTER')
    safety='AWD\nLane departure warning\nBrake assist\nCross-traffic alert' if n==1 else 'ESC and ERM\nAdvanced airbags\nHSA and ABS'
    text(safety,465,317,211,58,10.5,True,bullets=True);save(page)
car('p2',1,'2023 Nissan Rogue S AWD','$11,376','Keyless start, Apple CarPlay, Android Auto.','$56.41 (14.5 gal at $3.89/gal)','No accidents or damage. Nice car for the price.','nissan_rogue.jpg')
def loan(page,n,letters,interest,total,pay,saving):
    begin(page);header('CAR #'+str(n)+': LOAN COMPARISON',4 if n==1 else 6,fill='#b26206')
    # Match the reference salary table, with two loan columns replacing salary columns.
    widths=[120,165,165]; rows=[['',f'Loan {letters[0]} (parents)',f'Loan {letters[1]} (bank)'],['Rate','4.2% simple','5.1% daily compound'],['Term','5 years','6 years'],['Payments','60','72'],['Interest',interest[0],interest[1]],['Total cost',total[0],total[1]],['Monthly payment',pay[0],pay[1]]]
    for i,row in enumerate(rows):
        x=30;y=75+i*(290/7)
        for j,value in enumerate(row):
            rect(x,y,widths[j],290/7,C['orange'] if i==0 else C['green'] if i==6 else 'white',r=0,stroke=2);text(value,x+5,y+10,widths[j]-10,27,10.5 if j==0 else 11,True if i in (0,6) else False);x+=widths[j]
    photo(phone,489,74,222,150,r=25);rect(534,280,135,100,C['blue'],r=16)
    text('MY PICK: LOAN '+letters[0],538,289,127,21,10,True,align='CENTER');text(pay[0],538,313,127,30,22,True,font='Oswald',align='CENTER');text('Saves '+saving+'\nin interest',538,345,127,29,9.5,True,align='CENTER')
    draw.polygon([(486*S,333*S),(510*S,333*S),(510*S,328*S),(524*S,340*S),(510*S,350*S),(510*S,345*S),(486*S,345*S)],fill='#666666');save(page)
loan('p3',1,['A','B'],['$2,388.96','$4,072.08'],['$13,764.96','$15,448.08'],['$229.42','$214.56'],'$1,683.12')
car('p4',2,'2012 Jeep Wrangler Unlimited Sport 4WD','$8,995','Durable interior and four-wheel drive.','$87.53 (22.5 gal at $3.89/gal)','It seemed like a good deal for the price.','jeep_wrangler.jpg')
loan('p5',2,['C','D'],['$1,888.95','$3,219.79'],['$10,883.95','$12,214.79'],['$181.40','$169.65'],'$1,330.84')
begin('p6');header('FOLLOW-UP QUESTIONS',7)
rect(35,73,410,173,'#f0fff6',r=27);rect(35,258,410,116,'#fff7ed',r=27);photo(writing,477,73,214,150,r=26)
for label,body,y in [('1. WHICH CAR AND PAYMENT DID I PICK?','2012 Jeep Wrangler with Loan C, $181.40/month.',88),('2. WHAT IS MY TRANSPORTATION BUDGET?','11% of $1,368 = $150.48/month.',137),('3. DOES THE PAYMENT FIT?','No. It is $30.92 over, before insurance.',186)]:
    text(label,52,y,376,21,10.5,True);text(body,52,y+22,376,25,11.5,color='muted')
text('4. WHAT WOULD INSURANCE COST?',52,269,376,21,10.5,True);text('About $245/month.',52,291,376,24,11.5,color='muted');text('5. WHAT IS MY TOTAL MONTHLY COST?',52,321,376,21,10.5,True);text('$181.40 + $245 = $426.40, before gas.',52,343,376,25,11.5,color='muted')
rect(477,258,214,116,C['blue'],r=22);text('I LIKE THE JEEP, BUT I\nCANNOT AFFORD IT YET.',488,274,192,43,13,True,align='CENTER');text('I need more hours or a\nbigger down payment.',488,330,192,36,11.5,align='CENTER');save('p6')
(OUT/'content.json').write_text(json.dumps(slides,separators=(',',':')),encoding='utf-8')
print('Created',len(slides),'decorative layers and compact native text configuration.')
