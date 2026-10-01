/* V11 — 2.5D industrial world renderer
 * Replaces the older flat world cache while preserving generated collision geometry.
 */
const G=globalThis,TAU=Math.PI*2;
const hash=(x,y)=>{const n=Math.sin(x*127.1+y*311.7)*43758.5453;return n-Math.floor(n);};

G.drawWorldV11=function(){
  const W=G.WORLD.w,H=G.WORLD.h;
  if(!G.worldCacheV11||G.worldCacheV11W!==W||G.worldCacheV11H!==H){
    const c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');
    const bg=x.createLinearGradient(0,0,W,H);
    bg.addColorStop(0,'#303b3a');bg.addColorStop(.52,'#3e4945');bg.addColorStop(1,'#293532');
    x.fillStyle=bg;x.fillRect(0,0,W,H);

    // Large concrete/asphalt slabs.
    for(let y=0;y<H;y+=96){
      for(let xx=0;xx<W;xx+=112){
        const n=hash(xx,y),tone=n>.62?'rgba(205,211,195,.055)':n<.22?'rgba(5,12,11,.045)':'rgba(150,160,149,.025)';
        x.fillStyle=tone;x.fillRect(xx,y,112,96);
        x.strokeStyle='rgba(10,17,16,.20)';x.lineWidth=1;
        x.beginPath();x.moveTo(xx,y+96);x.lineTo(xx+112,y+96);x.stroke();
        x.beginPath();x.moveTo(xx+112,y);x.lineTo(xx+112,y+96);x.stroke();
      }
    }

    // Perspective-like diagonal seams sell the 2.5D floor without rotating gameplay coordinates.
    x.save();x.globalAlpha=.16;x.strokeStyle='#a6ada0';x.lineWidth=1;
    for(let k=-H;k<W+H;k+=150){x.beginPath();x.moveTo(k,0);x.lineTo(k+H*.48,H);x.stroke();}
    for(let k=-H;k<W+H;k+=190){x.beginPath();x.moveTo(k,H);x.lineTo(k+H*.28,0);x.stroke();}
    x.restore();

    // Random cracks, puddles and grime.
    for(let i=0;i<430;i++){
      const px=hash(i,11)*(W-20)+10,py=hash(i,29)*(H-20)+10,n=hash(i,47);
      if(n<.42){
        x.strokeStyle='rgba(7,13,12,.26)';x.lineWidth=.8+hash(i,53)*1.2;
        x.beginPath();x.moveTo(px,py);x.lineTo(px+8+hash(i,61)*26,py+(hash(i,67)-.5)*10);x.stroke();
      }else if(n<.70){
        x.fillStyle='rgba(16,29,24,.18)';x.beginPath();x.ellipse(px,py,5+hash(i,71)*14,2+hash(i,73)*5,hash(i,79)*TAU,0,TAU);x.fill();
      }else{
        x.fillStyle='rgba(15,22,20,.30)';x.fillRect(px,py,2+hash(i,83)*6,1+hash(i,89)*3);
      }
    }

    // Water retains a physical boundary and a darker depth.
    for(const q of G.waterRects||[]){
      const g=x.createLinearGradient(q.x,q.y,q.x+q.w,q.y+q.h);
      g.addColorStop(0,'#173c4d');g.addColorStop(.5,'#20566a');g.addColorStop(1,'#123746');
      x.fillStyle=g;x.fillRect(q.x,q.y,q.w,q.h);
      x.strokeStyle='rgba(122,216,231,.25)';x.lineWidth=2;
      for(let yy=q.y+18;yy<q.y+q.h;yy+=34){
        x.beginPath();x.moveTo(q.x+8,yy);x.quadraticCurveTo(q.x+q.w*.5,yy-6,q.x+q.w-8,yy);x.stroke();
      }
    }

    // Bridges.
    for(const b of G.bridges||[]){
      x.fillStyle='rgba(0,0,0,.28)';x.fillRect(b.x+8,b.y+12,b.w,b.h);
      x.fillStyle='#5b4635';x.fillRect(b.x,b.y,b.w,b.h);
      x.fillStyle='#8b6848';
      if(b.w>b.h)for(let xx=b.x+6;xx<b.x+b.w;xx+=24)x.fillRect(xx,b.y+4,15,b.h-8);
      else for(let yy=b.y+6;yy<b.y+b.h;yy+=24)x.fillRect(b.x+4,yy,b.w-8,15);
      x.strokeStyle='#c19a68';x.lineWidth=3;x.strokeRect(b.x+2,b.y+2,b.w-4,b.h-4);
    }

    // Decorative industrial props. They are visual only; collision remains owned by WorldGenerator.
    const prop=(px,py,w,h)=>{
      x.fillStyle='rgba(0,0,0,.34)';x.fillRect(px+9,py+h+7,w,h*.28);
      x.fillStyle='#343e3d';x.fillRect(px,py,w,h);
      x.fillStyle='#56625e';x.fillRect(px+4,py+4,w-8,7);
      x.strokeStyle='#151c1b';x.strokeRect(px,py,w,h);
      x.fillStyle='rgba(193,199,180,.20)';x.fillRect(px+9,py+15,w-18,3);
    };
    for(let i=0;i<24;i++){
      const px=80+hash(i,301)*(W-160),py=70+hash(i,331)*(H-140);
      if(Math.hypot(px-W/2,py-H/2)<330)continue;
      prop(px,py,18+hash(i,351)*28,14+hash(i,371)*20);
    }

    // Buildings / containers use a roof + vertical face to create height.
    for(const a of G.walls||[]){
      if(a.kind==='tree')continue;
      const d=Math.max(10,Math.min(22,a.h*.13));
      x.fillStyle='rgba(0,0,0,.42)';x.fillRect(a.x+10,a.y+d+a.h+9,a.w+8,9);
      x.fillStyle='#303a38';x.fillRect(a.x,a.y+d,a.w,a.h);
      x.fillStyle='#59645f';x.beginPath();x.moveTo(a.x,a.y+d);x.lineTo(a.x+13,a.y);x.lineTo(a.x+a.w+13,a.y);x.lineTo(a.x+a.w,a.y+d);x.closePath();x.fill();
      x.fillStyle='#242d2b';x.beginPath();x.moveTo(a.x+a.w,a.y+d);x.lineTo(a.x+a.w+13,a.y);x.lineTo(a.x+a.w+13,a.y+a.h);x.lineTo(a.x+a.w,a.y+d+a.h);x.closePath();x.fill();
      x.strokeStyle='rgba(8,13,12,.9)';x.lineWidth=2;x.strokeRect(a.x,a.y+d,a.w,a.h);
      x.strokeStyle='rgba(205,216,205,.12)';x.lineWidth=1;x.strokeRect(a.x+7,a.y+d+7,a.w-14,a.h-14);
      const cols=Math.max(1,Math.floor(a.w/48));
      for(let k=0;k<cols;k++){
        const wx=a.x+16+k*(a.w-30)/Math.max(1,cols-1);
        x.fillStyle=hash(wx,a.y)>.55?'rgba(221,187,111,.38)':'rgba(10,18,18,.72)';
        x.fillRect(wx-6,a.y+d+15,12,8);
      }
      // roof vents
      x.fillStyle='#18211f';x.fillRect(a.x+a.w*.18,a.y+5,12,8);x.fillRect(a.x+a.w*.70,a.y+8,9,6);
    }

    // Trees and bushes with a cast shadow and lifted canopy.
    for(const t of G.trees||[]){
      const r=t.r;
      x.fillStyle='rgba(0,0,0,.34)';x.beginPath();x.ellipse(t.x+5,t.y+r*.65,r*1.18,r*.42,0,0,TAU);x.fill();
      if(t.kind==='bush'){
        x.fillStyle='#294b31';x.beginPath();x.arc(t.x,t.y,r,0,TAU);x.fill();
        x.fillStyle='#4e7b4b';x.beginPath();x.arc(t.x-r*.35,t.y-r*.18,r*.60,0,TAU);x.arc(t.x+r*.32,t.y-r*.20,r*.53,0,TAU);x.fill();
        x.fillStyle='rgba(164,190,111,.35)';x.beginPath();x.arc(t.x-r*.24,t.y-r*.42,r*.20,0,TAU);x.fill();
      }else{
        x.fillStyle='#59442f';x.fillRect(t.x-4,t.y-r*.05,8,r*1.05);
        const g=x.createRadialGradient(t.x-r*.35,t.y-r*.85,2,t.x,t.y-r*.35,r*1.25);
        g.addColorStop(0,'#72945b');g.addColorStop(.52,'#3f6d45');g.addColorStop(1,'#1d3b28');
        x.fillStyle=g;x.beginPath();x.arc(t.x,t.y-r*.52,r*1.04,0,TAU);x.fill();
        x.beginPath();x.arc(t.x-r*.58,t.y-r*.14,r*.64,0,TAU);x.fill();
        x.beginPath();x.arc(t.x+r*.56,t.y-r*.08,r*.60,0,TAU);x.fill();
      }
    }

    // Lamps / street lights add scale cues.
    for(let i=0;i<12;i++){
      const px=130+hash(i,601)*(W-260),py=130+hash(i,631)*(H-260);
      if(Math.hypot(px-W/2,py-H/2)<300)continue;
      x.strokeStyle='rgba(12,18,17,.85)';x.lineWidth=4;x.beginPath();x.moveTo(px,py);x.lineTo(px,py-38);x.stroke();
      x.fillStyle='#171d1b';x.beginPath();x.arc(px,py-41,4,0,TAU);x.fill();
      const lg=x.createRadialGradient(px,py-41,1,px,py-41,25);
      lg.addColorStop(0,'rgba(244,214,132,.20)');lg.addColorStop(1,'rgba(244,214,132,0)');
      x.fillStyle=lg;x.beginPath();x.arc(px,py-41,25,0,TAU);x.fill();
    }

    G.worldCacheV11=c;G.worldCacheV11W=W;G.worldCacheV11H=H;
  }
  G.ctx.drawImage(G.worldCacheV11,0,0);
};
G.drawWorld=G.drawWorldV11;
