// V9.3.1 visual overhaul: cinematic procedural art pass.
// Gameplay state and simulation stay untouched; this module owns the final visual layer.
const G=globalThis;
const TAU=Math.PI*2;
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const hash=(x,y)=>{const n=Math.sin(x*127.1+y*311.7)*43758.5453;return n-Math.floor(n)};
const roundRect=(ctx,x,y,w,h,r)=>{ctx.beginPath();ctx.roundRect(x,y,w,h,r);};

G.drawWorldV9=function(){
  if(!G.worldCacheV9){
    const c=document.createElement('canvas');
    c.width=G.WORLD.w;c.height=G.WORLD.h;
    const x=c.getContext('2d');
    const W=c.width,H=c.height;
    // Base ground with subtle tonal bands.
    const bg=x.createLinearGradient(0,0,W,H);
    bg.addColorStop(0,'#1a2a24');bg.addColorStop(.48,'#23352d');bg.addColorStop(1,'#101c18');
    x.fillStyle=bg;x.fillRect(0,0,W,H);
    // Fine terrain grain.
    for(let gy=0;gy<H;gy+=18)for(let gx=0;gx<W;gx+=18){
      const n=hash(gx,gy);
      x.fillStyle=n>.5?'rgba(130,155,135,.055)':'rgba(0,0,0,.045)';
      x.fillRect(gx,gy,18,18);
    }
    // Rich ground dressing: cracked asphalt, grass tufts, puddles, tire marks and scattered litter.
    for(let i=0;i<420;i++){
      const px=24+hash(i,41)*(W-48),py=24+hash(i,67)*(H-48),n=hash(i,93);
      if(n<.34){
        x.strokeStyle='rgba(6,12,9,.26)';x.lineWidth=1+hash(i,12)*1.4;
        x.beginPath();x.moveTo(px,py);x.lineTo(px+7+hash(i,18)*18,py+(hash(i,19)-.5)*8);x.stroke();
      }else if(n<.72){
        x.fillStyle='rgba(18,30,21,.28)';x.fillRect(px,py,1.5+hash(i,21)*2,4+hash(i,22)*7);
        x.fillStyle='rgba(118,151,91,.18)';x.fillRect(px+2,py-2,1.2,4);
      }else{
        x.save();x.translate(px,py);x.rotate(hash(i,27)*TAU);
        x.fillStyle='rgba(9,15,13,.38)';x.fillRect(-3,-1,6,2);
        x.fillStyle='rgba(177,166,129,.18)';x.fillRect(-2,-3,4,1);
        x.restore();
      }
    }
    // Small puddles and oil stains give the ground more material variation.
    for(let i=0;i<55;i++){
      const px=45+hash(i,101)*(W-90),py=45+hash(i,131)*(H-90),rx=6+hash(i,151)*18,ry=2+hash(i,161)*6;
      x.fillStyle=i%3===0?'rgba(12,25,28,.22)':'rgba(30,48,39,.20)';
      x.beginPath();x.ellipse(px,py,rx,ry,hash(i,171)*TAU,0,TAU);x.fill();
      x.strokeStyle='rgba(130,188,180,.10)';x.lineWidth=1;x.stroke();
    }
    // Road-side curbs and faded lane paint, kept underneath structures/water.
    const rcx=W/2,rcy=H/2;
    x.strokeStyle='rgba(121,126,111,.16)';x.lineWidth=104;x.lineCap='round';
    for(const [x2,y2] of [[rcx,0],[rcx,H],[0,rcy],[W,rcy]]){x.beginPath();x.moveTo(rcx,rcy);x.lineTo(x2,y2);x.stroke();}
    x.strokeStyle='rgba(174,164,127,.13)';x.lineWidth=3;x.setLineDash([26,30]);
    for(const [x2,y2] of [[rcx,0],[rcx,H],[0,rcy],[W,rcy]]){x.beginPath();x.moveTo(rcx,rcy);x.lineTo(x2,y2);x.stroke();}
    x.setLineDash([]);
    // Broken paving / dirt seams.
    x.strokeStyle='rgba(4,10,8,.20)';x.lineWidth=2;
    for(let y=90;y<H;y+=96){
      x.beginPath();x.moveTo(0,y);x.lineTo(W,y+Math.sin(y*.02)*8);x.stroke();
    }
    for(let q of G.waterRects||[]){
      const wg=x.createLinearGradient(q.x,q.y,q.x+q.w,q.y+q.h);
      wg.addColorStop(0,'#173e52');wg.addColorStop(.5,'#1e6077');wg.addColorStop(1,'#123b4d');
      x.fillStyle=wg;x.fillRect(q.x,q.y,q.w,q.h);
      x.strokeStyle='rgba(126,222,239,.22)';x.lineWidth=2;
      for(let yy=q.y+20;yy<q.y+q.h;yy+=34){
        x.beginPath();x.moveTo(q.x+10,yy);
        x.quadraticCurveTo(q.x+q.w*.25,yy-7,q.x+q.w*.5,yy);
        x.quadraticCurveTo(q.x+q.w*.75,yy+7,q.x+q.w-10,yy);
        x.stroke();
      }
    }
    // Bridges get planks, rails and wear.
    for(const b of G.bridges||[]){
      x.fillStyle='#5b4733';x.fillRect(b.x,b.y,b.w,b.h);
      x.fillStyle='#876746';
      const vertical=b.h>b.w;
      if(vertical)for(let yy=b.y+5;yy<b.y+b.h;yy+=22)x.fillRect(b.x+4,yy,b.w-8,13);
      else for(let xx=b.x+5;xx<b.x+b.w;xx+=22)x.fillRect(xx,b.y+4,13,b.h-8);
      x.strokeStyle='#b18b5e';x.lineWidth=4;x.strokeRect(b.x+2,b.y+2,b.w-4,b.h-4);
      x.strokeStyle='rgba(20,16,12,.55)';x.lineWidth=2;
      x.strokeRect(b.x+10,b.y+10,b.w-20,b.h-20);
    }
    // Buildings/obstacles become actual structures instead of gray rectangles.
    for(const a of G.walls||[]){
      if(a.kind==='tree')continue;
      const r=Math.max(3,Math.min(a.w,a.h)*.08);
      x.fillStyle='rgba(0,0,0,.30)';x.fillRect(a.x+9,a.y+11,a.w,a.h);
      const roof=x.createLinearGradient(a.x,a.y,a.x,a.y+a.h);
      roof.addColorStop(0,'#5a625f');roof.addColorStop(.08,'#424b48');roof.addColorStop(1,'#202925');
      x.fillStyle=roof;x.beginPath();x.roundRect(a.x,a.y,a.w,a.h,r);x.fill();
      x.strokeStyle='#101713';x.lineWidth=4;x.stroke();
      x.strokeStyle='rgba(166,181,173,.20)';x.lineWidth=1;x.strokeRect(a.x+6,a.y+6,a.w-12,a.h-12);
      // Windows / panels.
      const cols=Math.max(1,Math.floor(a.w/46)),rows=Math.max(1,Math.floor(a.h/38));
      for(let iy=0;iy<rows;iy++)for(let ix=0;ix<cols;ix++){
        const ww=13,hh=9,px=a.x+16+ix*(a.w-30)/Math.max(1,cols-1),py=a.y+18+iy*(a.h-30)/Math.max(1,rows-1);
        x.fillStyle=(hash(ix+a.x,iy+a.y)>.58)?'rgba(198,169,105,.42)':'rgba(10,23,27,.75)';
        x.fillRect(px-ww/2,py-hh/2,ww,hh);
        x.strokeStyle='rgba(190,210,202,.12)';x.strokeRect(px-ww/2,py-hh/2,ww,hh);
      }
      x.fillStyle='rgba(18,22,20,.75)';x.fillRect(a.x+a.w*.42,a.y+a.h*.64,a.w*.16,a.h*.36);
    }
    // Rooftop details: vents, skylights, AC units and roof wear make buildings read as structures.
    for(let i=0;i<(G.walls||[]).length;i++){
      const a=G.walls[i]; if(a.kind==='tree')continue;
      const n=Math.max(1,Math.floor(a.w*a.h/2600));
      for(let j=0;j<n;j++){
        const px=a.x+10+hash(i,j*7+201)*Math.max(12,a.w-20),py=a.y+10+hash(i,j*11+231)*Math.max(12,a.h-20);
        if(j%3===0){
          x.fillStyle='rgba(11,16,16,.72)';x.fillRect(px-7,py-5,14,10);
          x.strokeStyle='rgba(157,171,166,.25)';x.strokeRect(px-7,py-5,14,10);
          x.fillStyle='rgba(109,128,125,.22)';x.fillRect(px-4,py-3,8,2);
        }else{
          x.fillStyle='rgba(19,25,23,.72)';x.fillRect(px-5,py-4,10,8);
          x.fillStyle='rgba(137,157,151,.20)';x.fillRect(px-3,py-2,6,2);
        }
      }
      // Entrance shadow and a tiny light strip.
      x.fillStyle='rgba(5,9,8,.82)';x.fillRect(a.x+a.w*.42,a.y+a.h*.66,a.w*.16,a.h*.34);
      x.fillStyle='rgba(221,177,96,.20)';x.fillRect(a.x+a.w*.45,a.y+a.h*.69,a.w*.10,2);
    }
    // Trees / bushes with layered crowns.
    for(const t of G.trees||[]){
      const r=t.r;
      x.fillStyle='rgba(0,0,0,.34)';x.beginPath();x.ellipse(t.x+5,t.y+r*.55,r*1.18,r*.42,0,0,TAU);x.fill();
      if(t.kind==='bush'){
        x.fillStyle='#284a31';x.beginPath();x.arc(t.x,t.y,r,0,TAU);x.fill();
        x.fillStyle='#4d7b4d';x.beginPath();x.arc(t.x-r*.35,t.y-r*.15,r*.58,0,TAU);x.arc(t.x+r*.32,t.y-r*.2,r*.52,0,TAU);x.fill();
        x.fillStyle='rgba(145,176,101,.35)';x.beginPath();x.arc(t.x-r*.25,t.y-r*.42,r*.22,0,TAU);x.fill();
      }else{
        x.fillStyle='#5b4631';x.fillRect(t.x-4,t.y-r*.05,8,r*1.05);
        const g=x.createRadialGradient(t.x-r*.3,t.y-r*.75,3,t.x,t.y-r*.35,r*1.25);
        g.addColorStop(0,'#71945a');g.addColorStop(.48,'#3f6c45');g.addColorStop(1,'#1c3b28');
        x.fillStyle=g;x.beginPath();x.arc(t.x,t.y-r*.48,r*1.02,0,TAU);x.fill();
        x.beginPath();x.arc(t.x-r*.58,t.y-r*.15,r*.64,0,TAU);x.fill();
        x.beginPath();x.arc(t.x+r*.56,t.y-r*.08,r*.60,0,TAU);x.fill();
        x.fillStyle='rgba(183,202,126,.25)';x.beginPath();x.arc(t.x-r*.28,t.y-r*.92,r*.2,0,TAU);x.fill();
      }
    }
    // Environmental debris and blood stains, deterministic from obstacle coordinates.
    for(let i=0;i<150;i++){
      const px=70+hash(i,3)* (W-140),py=70+hash(i,9)*(H-140),s=2+hash(i,17)*7;
      x.save();x.translate(px,py);x.rotate(hash(i,22)*TAU);
      x.fillStyle=i%5===0?'rgba(116,35,32,.22)':'rgba(5,10,8,.26)';
      x.fillRect(-s,-s*.35,s*2,s*.7);
      x.restore();
    }
    // Road-like worn lanes leading away from the safe center.
    const cx=W/2,cy=H/2;
    x.strokeStyle='rgba(99,108,96,.16)';x.lineWidth=92;x.lineCap='round';
    x.beginPath();x.moveTo(cx,cy);x.lineTo(cx,0);x.stroke();
    x.beginPath();x.moveTo(cx,cy);x.lineTo(cx,H);x.stroke();
    x.beginPath();x.moveTo(cx,cy);x.lineTo(0,cy);x.stroke();
    x.beginPath();x.moveTo(cx,cy);x.lineTo(W,cy);x.stroke();
    x.strokeStyle='rgba(13,19,16,.20)';x.lineWidth=2;x.setLineDash([18,22]);
    x.beginPath();x.moveTo(cx,cy);x.lineTo(cx,0);x.stroke();
    x.beginPath();x.moveTo(cx,cy);x.lineTo(cx,H);x.stroke();
    x.beginPath();x.moveTo(cx,cy);x.lineTo(0,cy);x.stroke();
    x.beginPath();x.moveTo(cx,cy);x.lineTo(W,cy);x.stroke();x.setLineDash([]);
    G.worldCacheV9=c;
  }
  G.ctx.drawImage(G.worldCacheV9,0,0);
};
G.drawWorld=G.drawWorldV9;

function limb(ctx,x1,y1,x2,y2,w,c1,c2){
  const g=ctx.createLinearGradient(x1,y1,x2,y2);g.addColorStop(0,c1);g.addColorStop(1,c2);
  ctx.strokeStyle=g;ctx.lineWidth=w;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
}
G.drawPlayerV9=function(){
  const ctx=G.ctx,p=G.player,now=performance.now(),aim=G.aim?.()||0;
  const moving=["w","a","s","d","arrowup","arrowdown","arrowleft","arrowright"].some(k=>G.keys?.has(k));
  const walk=moving?Math.sin(now*.015)*.16:0, bob=moving?Math.abs(Math.sin(now*.015))*1.5:0;
  const recoil=Math.max(0,p.recoil||0), flash=Math.max(0,p.muzzle||0);
  ctx.save();ctx.translate(p.x,p.y-bob);
  if(G.invuln>0&&Math.floor(G.invuln/70)%2===0)ctx.globalAlpha=.48;
  const S=1.55;ctx.scale(S,S);
  // Large tactical survivor silhouette.
  ctx.fillStyle='rgba(0,0,0,.48)';ctx.beginPath();ctx.ellipse(2,21,18,6,0,0,TAU);ctx.fill();
  // Legs with boots and knee highlights.
  ctx.lineCap='round';ctx.lineWidth=6.5;
  limb(ctx,-5,7,-4+walk*10,19,4,'#3b454a','#11171a');
  limb(ctx,5,7,4-walk*10,19,4,'#4b555a','#11171a');
  ctx.fillStyle='#101619';ctx.beginPath();ctx.ellipse(-6+walk*10,21,5.5,2.8,-.12,0,TAU);ctx.ellipse(6-walk*10,21,5.5,2.8,.12,0,TAU);ctx.fill();
  // Backpack.
  ctx.fillStyle='#1a2528';roundRect(ctx,-12,-5,7,18,2.5);ctx.fill();
  ctx.fillStyle='#53645f';ctx.fillRect(-11,-1,5,2);ctx.fillRect(-11,5,5,2);
  // Torso + plate carrier.
  const body=ctx.createLinearGradient(-11,-7,12,15);body.addColorStop(0,'#788a91');body.addColorStop(.45,'#43545a');body.addColorStop(1,'#1d282c');
  ctx.fillStyle=body;roundRect(ctx,-11,-8,22,23,5);ctx.fill();
  ctx.strokeStyle='#0a1013';ctx.lineWidth=1.8;ctx.stroke();
  ctx.fillStyle='#2c3a3e';roundRect(ctx,-12,-3,24,18,4);ctx.fill();
  ctx.strokeStyle='rgba(183,204,198,.34)';ctx.lineWidth=.8;ctx.strokeRect(-10,-2,20,15);
  // MOLLE webbing and pouches.
  for(let y=-1;y<11;y+=4){ctx.strokeStyle='rgba(190,205,197,.22)';ctx.beginPath();ctx.moveTo(-9,y);ctx.lineTo(9,y);ctx.stroke();}
  ctx.fillStyle='#141d20';ctx.fillRect(-9,2,5,7);ctx.fillRect(4,2,5,7);
  ctx.fillStyle='#748a82';ctx.fillRect(-7.5,3,2,4);ctx.fillRect(5.5,3,2,4);
  // Neck and head.
  ctx.fillStyle='#a96f59';ctx.fillRect(-3,-12,6,5);
  const skin=ctx.createRadialGradient(-3,-20,1,3,-15,11);skin.addColorStop(0,'#f2c4a0');skin.addColorStop(.58,'#d69a76');skin.addColorStop(1,'#76483d');
  ctx.fillStyle=skin;ctx.beginPath();ctx.arc(0,-18,9.5,0,TAU);ctx.fill();
  ctx.fillStyle='#302823';ctx.beginPath();ctx.moveTo(-9,-19);ctx.quadraticCurveTo(-8,-28,0,-29);ctx.quadraticCurveTo(9,-28,10,-19);ctx.lineTo(6,-22);ctx.lineTo(3,-19);ctx.lineTo(0,-22);ctx.lineTo(-4,-19);ctx.lineTo(-7,-22);ctx.closePath();ctx.fill();
  // Helmet shell and brim.
  ctx.fillStyle='#1b272c';ctx.beginPath();ctx.arc(0,-21,10.5,Math.PI,TAU);ctx.fill();
  ctx.fillStyle='#52656a';ctx.beginPath();ctx.arc(-1,-22,8.8,Math.PI*1.04,Math.PI*1.96);ctx.fill();
  ctx.fillStyle='#11181b';ctx.fillRect(-11,-19,22,2.7);
  ctx.fillStyle='#71868b';ctx.fillRect(5,-24,4,2);
  // Face oriented toward aim.
  const fx=Math.cos(aim)*1.8,fy=Math.sin(aim)*1.1;
  ctx.fillStyle='#4a3029';ctx.beginPath();ctx.arc(-3+fx,-18+fy,1,0,TAU);ctx.arc(3+fx,-18+fy,1,0,TAU);ctx.fill();
  ctx.fillStyle='rgba(255,220,190,.4)';ctx.beginPath();ctx.arc(-2,-21,2,0,TAU);ctx.fill();
  // Arms + weapon rotate with aim.
  ctx.save();ctx.rotate(aim);
  limb(ctx,7,-3,13,-1,5.5,'#566a72','#26363c');
  limb(ctx,7,5,13,4,5.5,'#53666d','#26363c');
  ctx.fillStyle='#d29a77';ctx.beginPath();ctx.arc(16,2,2.8,0,TAU);ctx.fill();ctx.arc(17,4,2.6,0,TAU);ctx.fill();
  ctx.translate(-recoil,0);
  const gun=G.selectedWeapon,metal='#172126',edge='#718086';
  ctx.fillStyle=metal;ctx.strokeStyle=edge;ctx.lineWidth=1;
  if(gun===1){roundRect(ctx,14,-2.8,28,5.6,2);ctx.fill();ctx.stroke();ctx.fillStyle='#0d1417';ctx.fillRect(20,2,6,11);ctx.fillStyle='#839096';ctx.fillRect(39,-2,9,2.5);}
  else if(gun===2){roundRect(ctx,12,-3,36,6.5,2);ctx.fill();ctx.stroke();ctx.fillStyle='#0d1417';ctx.fillRect(20,3,7,13);ctx.fillStyle='#68787e';ctx.fillRect(40,-3,11,2.5);}
  else if(gun===3){ctx.fillStyle='#3c3027';roundRect(ctx,13,-2.5,32,6,2);ctx.fill();ctx.stroke();ctx.fillStyle='#171b1d';ctx.fillRect(20,3,7,13);ctx.fillStyle='#a17a50';ctx.fillRect(40,0,10,3);}
  else if(gun===4){ctx.fillStyle='#343d40';roundRect(ctx,12,-4.5,31,10,3);ctx.fill();ctx.stroke();ctx.fillStyle='#d27a27';ctx.fillRect(17,-6,11,2.5);ctx.fillStyle='#151b1e';ctx.fillRect(23,5,9,10);}
  else {roundRect(ctx,11,-3,43,6.5,2);ctx.fill();ctx.stroke();ctx.fillStyle='#0d1417';ctx.fillRect(20,3,8,13);ctx.fillStyle='#6d858e';ctx.fillRect(43,-5,13,2.5);ctx.fillStyle='#91d2ff';ctx.fillRect(51,-2,8,2);}
  ctx.fillStyle='#0b1114';ctx.fillRect(gun===5?54:gun===4?43:gun===3?50:gun===2?51:48,-2,7,3);
  if(flash>0&&gun!==4){const q=clamp(flash/90),c=G.weapons?.[gun]?.color||'#ffd36b';ctx.globalAlpha=q;ctx.shadowColor=c;ctx.shadowBlur=18;ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(54,0);ctx.lineTo(70,-8);ctx.lineTo(63,0);ctx.lineTo(70,8);ctx.closePath();ctx.fill();ctx.fillStyle='#fff4ad';ctx.beginPath();ctx.arc(55,0,3+q*2,0,TAU);ctx.fill();ctx.shadowBlur=0;ctx.globalAlpha=1;}
  ctx.restore();
  if(G.equipmentHas?.('shield')&&p.shield>0){ctx.strokeStyle='rgba(93,220,255,.5)';ctx.lineWidth=1.8;ctx.beginPath();ctx.arc(0,1,25+Math.sin(now*.008)*1.5,0,TAU);ctx.stroke();}
  if(p.dashTime>0){ctx.strokeStyle='rgba(105,220,255,.55)';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(0,0,25+Math.sin(now*.03)*3,0,TAU);ctx.stroke();}
  ctx.restore();
};
G.drawPlayer=G.drawPlayerV9;
G.drawZombieV9=function(z){
  if(z.x<G.camera.x-180||z.x>G.camera.x+G.W+180||z.y<G.camera.y-180||z.y>G.camera.y+G.H+180)return;
  const ctx=G.ctx,now=performance.now(),dead=z.hp<=0,death=dead?clamp(1-(z.deathTimer||0)/520):0;
  const r=Math.max(17,z.r||17),a=Math.atan2(G.player.y-z.y,G.player.x-z.x);
  const moving=!dead, stride=moving?Math.sin(now*.012+(z.x+z.y)*.01)*r*.13:0, active=!dead&&z.attack>0&&z.attack<720;
  const scale=(z.type==='tank'?1.48:z.type==='exploder'?1.34:z.type==='leaper'?1.28:1.22);
  const pal={normal:['#829b82','#314238','#c0cbc0','#e75a52'],fast:['#d6ad62','#5d4325','#ead19a','#f4bd4d'],tank:['#929da2','#30393d','#d2dddd','#ef6256'],exploder:['#dc8857','#542c24','#ffc08a','#ff7134'],hunter:['#b779c0','#39243f','#ebc5ed','#f5d060'],spitter:['#72c19d','#21463a','#c7ecd0','#75f4b0'],leaper:['#c8a15f','#554025','#ead09a','#ffd46b'],screamer:['#c66bd1','#38203d','#f0c2f2','#ff7bf0']}[z.type]||['#829b82','#314238','#c0cbc0','#e75a52'];
  ctx.save();ctx.translate(z.x,z.y+death*r*.42);ctx.rotate(dead?death*.16:0);ctx.scale(scale,scale);ctx.globalAlpha=dead?1-death*1.12:1;
  // Large contact shadow.
  ctx.fillStyle='rgba(0,0,0,.46)';ctx.beginPath();ctx.ellipse(2,r*.96,r*1.02,r*.30,0,0,TAU);ctx.fill();
  if(dead)ctx.rotate(death*.12);
  const hunched=z.type==='hunter'||z.type==='leaper', tank=z.type==='tank';
  // Legs / knees.
  ctx.lineCap='round';ctx.strokeStyle='#101615';ctx.lineWidth=r*.29;ctx.beginPath();
  ctx.moveTo(-r*.28,0);ctx.lineTo(-r*.40+stride,r*.56);ctx.lineTo(-r*.28+stride*.4,r*1.03);
  ctx.moveTo(r*.28,0);ctx.lineTo(r*.40-stride,r*.56);ctx.lineTo(r*.28-stride*.4,r*1.03);ctx.stroke();
  ctx.strokeStyle=z.type==='fast'?'#604824':z.type==='hunter'?'#2c2032':'#26302b';ctx.lineWidth=r*.20;ctx.stroke();
  ctx.fillStyle='#101615';ctx.beginPath();ctx.ellipse(-r*.25,r*1.06,r*.32,r*.14,0,0,TAU);ctx.ellipse(r*.25,r*1.06,r*.32,r*.14,0,0,TAU);ctx.fill();
  // Torso, with ragged shoulders.
  const tw=tank?r*1.62:(z.type==='fast'?r*1.30:r*1.48), top=hunched?-r*.42:-r*.30, bottom=tank?r*1.02:r*.92;
  const tg=ctx.createLinearGradient(-tw/2,top,tw/2,bottom);tg.addColorStop(0,pal[0]);tg.addColorStop(.48,pal[1]);tg.addColorStop(1,'#151b18');
  ctx.fillStyle=tg;ctx.beginPath();ctx.moveTo(-tw*.40,top);ctx.lineTo(-tw*.56,-r*.05);ctx.lineTo(-tw*.40,bottom*.78);ctx.lineTo(-tw*.22,bottom);ctx.lineTo(tw*.24,bottom);ctx.lineTo(tw*.42,bottom*.78);ctx.lineTo(tw*.56,-r*.05);ctx.lineTo(tw*.38,top);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#0a100e';ctx.lineWidth=2.2;ctx.stroke();
  // Clothing archetypes.
  if(tank){
    ctx.fillStyle='#273236';roundRect(ctx,-r*.82,-r*.10,r*1.64,r*.84,5);ctx.fill();ctx.fillStyle='#68767a';roundRect(ctx,-r*.62,-r*.02,r*1.24,r*.43,3);ctx.fill();
    ctx.strokeStyle='#b7c1c3';ctx.lineWidth=1.5;ctx.strokeRect(-r*.53,r*.06,r*1.06,r*.25);
    ctx.fillStyle='#1a2427';ctx.fillRect(-r*.90,-r*.06,r*.25,r*.62);ctx.fillRect(r*.65,-r*.06,r*.25,r*.62);
  }else if(z.type==='fast'){
    ctx.fillStyle='#704b28';ctx.fillRect(-r*.62,r*.10,r*1.24,r*.22);ctx.strokeStyle='#e7ca7b';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-r*.58,r*.28);ctx.lineTo(-r*.10,r*.66);ctx.moveTo(r*.58,r*.28);ctx.lineTo(r*.10,r*.66);ctx.stroke();
  }else if(z.type==='hunter'){
    ctx.fillStyle='#33213d';ctx.beginPath();ctx.moveTo(-tw*.48,-r*.30);ctx.lineTo(-r*.20,-r*.78);ctx.lineTo(tw*.45,-r*.20);ctx.lineTo(tw*.34,r*.60);ctx.lineTo(-tw*.40,r*.48);ctx.closePath();ctx.fill();ctx.fillStyle='#765080';ctx.fillRect(-r*.62,r*.20,r*1.24,r*.14);
  }else if(z.type==='spitter'){
    ctx.fillStyle='rgba(211,239,220,.5)';ctx.beginPath();ctx.moveTo(-tw*.38,-r*.18);ctx.lineTo(0,r*.12);ctx.lineTo(-r*.18,bottom);ctx.lineTo(-tw*.34,bottom*.78);ctx.closePath();ctx.fill();
    ctx.fillStyle='#143c30';ctx.beginPath();ctx.arc(r*.53,r*.22,r*.20,0,TAU);ctx.fill();ctx.strokeStyle='#78f2b4';ctx.lineWidth=2;ctx.stroke();
  }else if(z.type==='exploder'){
    ctx.fillStyle='#4c3028';ctx.fillRect(-r*.64,-r*.02,r*1.28,r*.70);ctx.strokeStyle='#ff7438';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,r*.27,r*.72,0,TAU);ctx.stroke();
    ctx.fillStyle='#ffb66e';ctx.beginPath();ctx.arc(-r*.34,r*.18,3,0,TAU);ctx.arc(r*.35,r*.42,2.5,0,TAU);ctx.fill();
  }else if(z.type==='leaper'){
    ctx.strokeStyle='#e0b45e';ctx.lineWidth=Math.max(2,r*.085);ctx.beginPath();ctx.moveTo(-r*.62,-r*.10);ctx.lineTo(r*.18,r*.68);ctx.moveTo(r*.62,-r*.10);ctx.lineTo(-r*.18,r*.68);ctx.stroke();
  }else if(z.type==='screamer'){
    ctx.fillStyle='#301b37';ctx.beginPath();ctx.moveTo(-r*.70,-r*.15);ctx.lineTo(-r*.52,-r*.90);ctx.lineTo(r*.52,-r*.90);ctx.lineTo(r*.70,-r*.15);ctx.lineTo(r*.42,r*.18);ctx.lineTo(-r*.42,r*.18);ctx.closePath();ctx.fill();
    ctx.strokeStyle='#eb9bf0';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,r*.32,0,TAU);ctx.stroke();
  }else{
    ctx.strokeStyle='rgba(225,238,225,.28)';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-r*.18,-r*.08);ctx.lineTo(-r*.04,r*.70);ctx.moveTo(r*.18,-r*.04);ctx.lineTo(r*.05,r*.70);ctx.stroke();
  }
  // Long reaching arms.
  const reach=active?r*(.52+.20*Math.sin(now*.028)):0;
  ctx.strokeStyle='#101513';ctx.lineWidth=r*.27;ctx.beginPath();
  if(active&&z.type!=='spitter'&&z.type!=='screamer'){
    ctx.moveTo(-tw*.32,-r*.02);ctx.lineTo(-r*.78,-r*.12);ctx.lineTo(-r*.52,reach+r*.36);
    ctx.moveTo(tw*.32,-r*.02);ctx.lineTo(r*.78,-r*.12);ctx.lineTo(r*.52,reach+r*.36);
  }else{
    ctx.moveTo(-tw*.32,0);ctx.lineTo(-r*.78,stride+r*.34);ctx.lineTo(-r*.70,stride+r*.72);
    ctx.moveTo(tw*.32,0);ctx.lineTo(r*.78,-stride+r*.34);ctx.lineTo(r*.70,-stride+r*.72);
  }ctx.stroke();
  ctx.strokeStyle=pal[0];ctx.lineWidth=r*.19;ctx.stroke();
  // Head / hair / facial damage.
  const hr=tank?r*.64:r*.58, hy=hunched?-r*.62:-r*.68;
  const hg=ctx.createRadialGradient(-hr*.3,hy-hr*.2,2,hr*.2,hy,hr*1.35);hg.addColorStop(0,pal[2]);hg.addColorStop(.55,pal[0]);hg.addColorStop(1,pal[1]);
  ctx.fillStyle=hg;ctx.beginPath();ctx.arc(0,hy,hr,0,TAU);ctx.fill();ctx.strokeStyle='#0d1311';ctx.lineWidth=2;ctx.stroke();
  ctx.fillStyle=z.type==='screamer'?'#241529':'#242321';ctx.beginPath();ctx.arc(0,hy-hr*.28,hr*.88,Math.PI,TAU);ctx.fill();
  const eye=pal[3];ctx.shadowColor=eye;ctx.shadowBlur=9;ctx.fillStyle=eye;ctx.beginPath();ctx.ellipse(-hr*.30,hy+.02,Math.max(2.4,r*.10),Math.max(1.6,r*.075),0,0,TAU);ctx.ellipse(hr*.30,hy+.02,Math.max(2.4,r*.10),Math.max(1.6,r*.075),0,0,TAU);ctx.fill();ctx.shadowBlur=0;
  ctx.fillStyle='#211817';ctx.beginPath();ctx.ellipse(0,hy+hr*.40,r*.25,r*.14,0,0,TAU);ctx.fill();
  if(z.type==='normal'||z.type==='fast'){ctx.strokeStyle='rgba(255,220,210,.35)';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(-r*.22,hy+.38*hr);ctx.lineTo(-r*.05,hy+.48*hr);ctx.lineTo(r*.16,hy+.37*hr);ctx.stroke();}
  // Attack FX.
  const pulse=.5+.5*Math.sin(now*.035);
  if(active&&z.type==='spitter'){ctx.strokeStyle='rgba(105,245,185,.8)';ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(r*.48,-r*.02);ctx.quadraticCurveTo(r*1.25,r*.12,r*1.7,0);ctx.stroke();ctx.fillStyle='#7affbf';ctx.beginPath();ctx.arc(r*1.7,0,3+pulse*2,0,TAU);ctx.fill();}
  if(active&&z.type==='screamer'){ctx.strokeStyle='rgba(224,118,255,.7)';ctx.lineWidth=2.2;ctx.globalAlpha=.3+.2*pulse;for(const q of [1,1.35,1.7]){ctx.beginPath();ctx.arc(0,hy+hr*.5,r*q,Math.PI*1.18,Math.PI*1.82);ctx.stroke();}ctx.globalAlpha=1;}
  if(active&&z.type==='leaper'){ctx.strokeStyle='#ffd16b';ctx.lineWidth=3;ctx.globalAlpha=.35+.2*pulse;ctx.beginPath();ctx.moveTo(-r*.85,r*.84);ctx.lineTo(-r*.25,r*1.35);ctx.moveTo(r*.85,r*.84);ctx.lineTo(r*.25,r*1.35);ctx.stroke();ctx.globalAlpha=1;}
  if(z.flash>0&&!dead){ctx.globalCompositeOperation='screen';ctx.fillStyle='rgba(255,255,255,.34)';ctx.beginPath();ctx.arc(0,-r*.25,r*.9,0,TAU);ctx.fill();ctx.globalCompositeOperation='source-over';}
  ctx.restore();
  if(!dead&&z.hp<z.maxHp){const w=r*2.9,yy=z.y-r*1.9;ctx.fillStyle='rgba(7,11,10,.9)';ctx.fillRect(z.x-w/2,yy,w,6);ctx.fillStyle=z.hp<z.maxHp*.3?'#ff4b4b':'#d85a5a';ctx.fillRect(z.x-w/2,yy,w*Math.max(0,z.hp/z.maxHp),6);ctx.strokeStyle='rgba(255,255,255,.16)';ctx.strokeRect(z.x-w/2,yy,w,6);}
  if(!dead&&z.stun>0){ctx.save();ctx.fillStyle='#ffe18a';ctx.font='bold 16px Arial';ctx.textAlign='center';ctx.fillText('✦',z.x,z.y-r*2.05);ctx.restore();}
};G.drawZombie=G.drawZombieV9;G.drawBulletV9=function(b){
  const ctx=G.ctx,s=Math.hypot(b.vx,b.vy)||1;
  const color=b.type==='enemy'?'#ff5d5d':(G.weapons?.[b.type]?.color||'#fff');
  const long=b.type===5?30:b.type===3?17:b.type===2?12:9;
  ctx.save();ctx.lineCap='round';ctx.globalAlpha=b.type==='enemy'?.82:.9;
  ctx.strokeStyle=color;ctx.lineWidth=b.type===5?3.4:2.2;ctx.shadowColor=color;ctx.shadowBlur=b.type===5?16:8;
  ctx.beginPath();ctx.moveTo(b.x-b.vx/s*long,b.y-b.vy/s*long);ctx.lineTo(b.x,b.y);ctx.stroke();
  ctx.globalAlpha=1;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(b.x,b.y,b.type===5?3:2,0,TAU);ctx.fill();
  ctx.restore();
};
G.drawBullet=G.drawBulletV9;

G.drawV9Lighting=function(){
  if(G.state!=='playing')return;
  const ctx=G.ctx,now=performance.now();
  // V9 uses screen-space lighting only. No full-screen multiply: it was causing black map regions.
  ctx.save();
  ctx.globalCompositeOperation='screen';
  if(G.player.muzzle>0){
    const px=G.player.x-G.camera.x,py=G.player.y-G.camera.y,a=G.aim();
    const lx=px+Math.cos(a)*60,ly=py+Math.sin(a)*60;
    const mg=ctx.createRadialGradient(lx,ly,2,lx,ly,105);
    mg.addColorStop(0,'rgba(255,238,180,.28)');mg.addColorStop(.22,'rgba(255,180,70,.12)');mg.addColorStop(1,'rgba(255,140,40,0)');
    ctx.fillStyle=mg;ctx.fillRect(lx-110,ly-110,220,220);
  }
  if(G.mouse.down&&G.selectedWeapon===4&&G.owned[4]){
    const px=G.player.x-G.camera.x,py=G.player.y-G.camera.y,a=G.aim(),x=px+Math.cos(a)*90,y=py+Math.sin(a)*90;
    const fg=ctx.createRadialGradient(x,y,4,x,y,150);
    fg.addColorStop(0,'rgba(255,125,35,.18)');fg.addColorStop(.35,'rgba(255,75,20,.055)');fg.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=fg;ctx.fillRect(x-150,y-150,300,300);
  }
  if(G.boss){
    const b=G.boss,bx=b.x-G.camera.x,by=b.y-G.camera.y,phase=b.phase||1,col=phase===3?'#ff4c42':phase===2?'#ffbd4a':'#7fe7ff';
    const bg=ctx.createRadialGradient(bx,by,3,bx,by,120);
    bg.addColorStop(0,col+'38');bg.addColorStop(.35,col+'10');bg.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=bg;ctx.fillRect(bx-120,by-120,240,240);
  }
  if(G.weather?.id==='storm'&&G.weatherLightning>0){ctx.globalAlpha=Math.min(.12,G.weatherLightning/300);ctx.fillStyle='#dff7ff';ctx.fillRect(0,0,G.W,G.H);}
  ctx.restore();
};
G.drawVignetteV9=function(){
  const ctx=G.ctx;
  const g=ctx.createRadialGradient(G.W/2,G.H/2,Math.min(G.W,G.H)*.34,G.W/2,G.H/2,Math.max(G.W,G.H)*.72);
  g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.72,'rgba(0,0,0,.10)');g.addColorStop(1,'rgba(0,0,0,.48)');
  ctx.fillStyle=g;ctx.fillRect(0,0,G.W,G.H);
};
G.drawVignette=G.drawVignetteV9;

G.drawV9Blood=function(){
  if(!G.particles?.length)return;
  // Add tiny directional flecks to existing combat particles without changing simulation.
  const ctx=G.ctx;
  ctx.save();ctx.globalAlpha=.24;ctx.fillStyle='#8f2f2f';
  for(const p of G.particles){
    if(p.life<180&&p.size>2){
      ctx.beginPath();ctx.arc(p.x,p.y,p.size*.55,0,TAU);ctx.fill();
    }
  }
  ctx.restore();
};
