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
    bg.addColorStop(0,'#3d5146');bg.addColorStop(.48,'#4a5f51');bg.addColorStop(1,'#34483d');
    x.fillStyle=bg;x.fillRect(0,0,W,H);
    // Fine terrain grain.
    for(let gy=0;gy<H;gy+=18)for(let gx=0;gx<W;gx+=18){
      const n=hash(gx,gy);
      x.fillStyle=n>.5?'rgba(190,205,178,.09)':'rgba(0,0,0,.018)';
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
      x.fillStyle='rgba(0,0,0,.22)';x.fillRect(a.x+9,a.y+11,a.w,a.h);
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
  // Ground contact is fixed to the world; only the body bobs. This prevents the survivor from looking airborne.
  ctx.save();ctx.translate(p.x,p.y);
  const S=2.08;ctx.scale(S,S);
  ctx.fillStyle='rgba(0,0,0,.28)';ctx.beginPath();ctx.ellipse(1,39,25,5.8,0,0,TAU);ctx.fill();
  ctx.restore();
  ctx.save();ctx.translate(p.x,p.y-bob);
  if(G.invuln>0&&Math.floor(G.invuln/70)%2===0)ctx.globalAlpha=.48;
  ctx.scale(S,S);
  // Long readable legs: thigh -> knee -> shin -> boot.
  ctx.lineCap='round';ctx.lineWidth=6.5;
  limb(ctx,-5,7,-7+walk*11,23,5.2,'#6d7d84','#253136');
  limb(ctx,-7+walk*11,23,-9+walk*15,36.5,5.0,'#52636a','#182126');
  limb(ctx,5,7,7-walk*11,23,5.2,'#7b8b91','#28363b');
  limb(ctx,7-walk*11,23,9-walk*15,36.5,5.0,'#5b6c72','#182126');
  ctx.fillStyle='#0d1417';ctx.beginPath();ctx.ellipse(-9.5+walk*15,39,7.2,3.4,-.10,0,TAU);ctx.ellipse(9.5-walk*15,39,7.2,3.4,.10,0,TAU);ctx.fill();
  ctx.fillStyle='rgba(220,235,230,.28)';ctx.beginPath();ctx.arc(-7+walk*11,23,2.2,0,TAU);ctx.arc(7-walk*11,23,2.2,0,TAU);ctx.fill();
  // Backpack.
  ctx.fillStyle='#1a2528';roundRect(ctx,-12,-5,7,18,2.5);ctx.fill();
  ctx.fillStyle='#53645f';ctx.fillRect(-11,-1,5,2);ctx.fillRect(-11,5,5,2);
  // Torso + plate carrier.
  const body=ctx.createLinearGradient(-11,-7,12,15);body.addColorStop(0,'#788a91');body.addColorStop(.45,'#43545a');body.addColorStop(1,'#1d282c');
  ctx.fillStyle=body;roundRect(ctx,-11,-8,22,21,5);ctx.fill();
  ctx.strokeStyle='#0a1013';ctx.lineWidth=1.8;ctx.stroke();
  ctx.fillStyle='#2c3a3e';roundRect(ctx,-12,-3,24,16,4);ctx.fill();
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
  if(gun===1){roundRect(ctx,14,-2.8,22,5.6,2);ctx.fill();ctx.stroke();ctx.fillStyle='#0d1417';ctx.fillRect(18,2,6,10);ctx.fillStyle='#839096';ctx.fillRect(32,-2,6,2.5);}
  else if(gun===2){roundRect(ctx,12,-3,27,6.5,2);ctx.fill();ctx.stroke();ctx.fillStyle='#0d1417';ctx.fillRect(18,3,7,11);ctx.fillStyle='#68787e';ctx.fillRect(34,-3,7,2.5);}
  else if(gun===3){ctx.fillStyle='#3c3027';roundRect(ctx,13,-2.5,25,6,2);ctx.fill();ctx.stroke();ctx.fillStyle='#171b1d';ctx.fillRect(18,3,7,11);ctx.fillStyle='#a17a50';ctx.fillRect(34,0,7,3);}
  else if(gun===4){ctx.fillStyle='#343d40';roundRect(ctx,12,-4.5,25,10,3);ctx.fill();ctx.stroke();ctx.fillStyle='#d27a27';ctx.fillRect(16,-6,9,2.5);ctx.fillStyle='#151b1e';ctx.fillRect(21,5,8,10);}
  else {roundRect(ctx,11,-3,31,6.5,2);ctx.fill();ctx.stroke();ctx.fillStyle='#0d1417';ctx.fillRect(18,3,8,11);ctx.fillStyle='#6d858e';ctx.fillRect(33,-5,8,2.5);ctx.fillStyle='#91d2ff';ctx.fillRect(39,-2,5,2);}
  const muzzleX=gun===5?43:gun===4?38:gun===3?41:gun===2?41:38;ctx.fillStyle='#0b1114';ctx.fillRect(muzzleX,-2,5,3);
  if(flash>0&&gun!==4){const q=clamp(flash/90),c=G.weapons?.[gun]?.color||'#ffd36b';ctx.globalAlpha=q;ctx.shadowColor=c;ctx.shadowBlur=18;ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(muzzleX,0);ctx.lineTo(muzzleX+11,-6);ctx.lineTo(muzzleX+6,0);ctx.lineTo(muzzleX+11,6);ctx.closePath();ctx.fill();ctx.fillStyle='#fff4ad';ctx.beginPath();ctx.arc(muzzleX,0,3+q*2,0,TAU);ctx.fill();ctx.shadowBlur=0;ctx.globalAlpha=1;}
  ctx.restore();
  if(G.equipmentHas?.('shield')&&p.shield>0){ctx.strokeStyle='rgba(93,220,255,.5)';ctx.lineWidth=1.8;ctx.beginPath();ctx.arc(0,1,25+Math.sin(now*.008)*1.5,0,TAU);ctx.stroke();}
  if(p.dashTime>0){ctx.strokeStyle='rgba(105,220,255,.55)';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(0,0,25+Math.sin(now*.03)*3,0,TAU);ctx.stroke();}
  ctx.restore();
};
G.drawPlayer=G.drawPlayerV9;
G.drawZombieV9=function(z){
  if(z.x<G.camera.x-220||z.x>G.camera.x+G.W+220||z.y<G.camera.y-220||z.y>G.camera.y+G.H+220)return;
  const c=G.ctx,n=performance.now(),dead=z.hp<=0,d=dead?clamp(1-(z.deathTimer||0)/560):0,r=Math.max(18,z.r||18),t=z.type||'normal';
  const P={normal:['#a7ad9b','#d0cbb3','#39433d','#202923','#b84d48',1.92,.46],fast:['#c7aa78','#ead4a0','#61492d','#30241a','#e2a63e',1.88,.44],tank:['#9ca4a5','#d2d7d4','#424b4e','#252b2d','#d34d48',2.12,.54],exploder:['#c88b68','#efb08c','#51372d','#2d201d','#ff6b32',2.02,.48],hunter:['#ad8bb0','#dfbfdc','#3b2940','#241b29','#d7a8ff',1.92,.45],spitter:['#86c2a2','#c6e8ce','#254c3e','#172d26','#61e5a5',1.94,.47],leaper:['#c4a064','#e9d19a','#554329','#302619','#f0bd50',1.98,.44],screamer:['#bc80c3','#edc4e9','#432540','#251624','#f477ef',1.95,.48]}[t]||['#a7ad9b','#d0cbb3','#39433d','#202923','#b84d48',1.62,.48];
  const [skin,hi,cloth,dark,accent,scale,head]=P,stride=!dead?Math.sin(n*.011+(z.x+z.y)*.012)*r*.16:0,active=!dead&&z.attack>0&&z.attack<720;
  c.save();c.translate(z.x,z.y+d*r*.45);c.globalAlpha=dead?Math.max(0,1-d*1.08):1;c.scale(scale,scale);
  c.fillStyle='rgba(0,0,0,.30)';c.beginPath();c.ellipse(2,r*1.43,r*1.05,r*.28,0,0,TAU);c.fill();
  limb(c,-r*.25,r*.43,-r*.38+stride,r*.93,r*.30,cloth,dark);limb(c,-r*.38+stride,r*.93,-r*.28+stride*.45,r*1.55,r*.22,dark,'#111715');
  limb(c,r*.25,r*.43,r*.38-stride,r*.93,r*.30,cloth,dark);limb(c,r*.38-stride,r*.93,r*.28-stride*.45,r*1.55,r*.22,dark,'#111715');
  c.fillStyle='#111715';c.beginPath();c.ellipse(-r*.29+stride*.45,r*1.61,r*.40,r*.17,-.08,0,TAU);c.ellipse(r*.29-stride*.45,r*1.61,r*.40,r*.17,.08,0,TAU);c.fill();
  c.fillStyle='rgba(220,225,210,.28)';c.beginPath();c.ellipse(-r*.38+stride,r*.94,r*.16,r*.09,0,0,TAU);c.ellipse(r*.38-stride,r*.94,r*.16,r*.09,0,0,TAU);c.fill();
  const sh=t==='tank'?r*1.02:r*.78,waist=t==='tank'?r*.66:r*.52;
  const tg=c.createLinearGradient(-sh,-r*.48,sh,r*.48);tg.addColorStop(0,cloth);tg.addColorStop(.52,dark);tg.addColorStop(1,'#121816');c.fillStyle=tg;
  c.beginPath();c.moveTo(-sh*.78,-r*.48);c.lineTo(-sh,-r*.20);c.lineTo(-waist,r*.30);c.lineTo(-waist*.72,r*.48);c.lineTo(waist*.72,r*.48);c.lineTo(waist,r*.30);c.lineTo(sh,-r*.20);c.lineTo(sh*.78,-r*.48);c.closePath();c.fill();
  c.strokeStyle='rgba(8,12,11,.9)';c.lineWidth=2;c.stroke();
  c.fillStyle='rgba(220,230,220,.14)';c.fillRect(-sh*.65,-r*.30,sh*1.3,r*.07);
  if(t==='tank'){c.fillStyle='#596468';roundRect(c,-r*.72,-r*.20,r*1.44,r*.62,4);c.fill();c.fillStyle='#a8b2b3';c.fillRect(-r*.48,-r*.08,r*.96,r*.12);}
  else if(t==='hunter'){c.fillStyle='#4d3355';c.beginPath();c.moveTo(-sh*.92,-r*.26);c.lineTo(-r*.30,-r*.82);c.lineTo(sh*.82,-r*.18);c.lineTo(sh*.66,r*.38);c.lineTo(-sh*.72,r*.28);c.closePath();c.fill();c.fillStyle='#b27ac1';c.fillRect(-r*.52,r*.12,r*1.04,r*.10);}
  else if(t==='spitter'){c.fillStyle='rgba(192,236,205,.35)';c.beginPath();c.moveTo(-r*.50,-r*.30);c.lineTo(0,-r*.02);c.lineTo(-r*.12,r*.43);c.lineTo(-r*.42,r*.30);c.closePath();c.fill();}
  else if(t==='exploder'){c.strokeStyle='#ff7137';c.lineWidth=3;c.beginPath();c.arc(0,r*.08,r*.54,0,TAU);c.stroke();}
  else if(t==='leaper'){c.strokeStyle='#d7a755';c.lineWidth=2.5;c.beginPath();c.moveTo(-r*.54,-r*.15);c.lineTo(r*.35,r*.38);c.moveTo(r*.54,-r*.15);c.lineTo(-r*.35,r*.38);c.stroke();}
  else if(t==='screamer'){c.fillStyle='#321a34';c.beginPath();c.moveTo(-r*.60,-r*.22);c.lineTo(-r*.42,-r*.62);c.lineTo(r*.42,-r*.62);c.lineTo(r*.60,-r*.22);c.lineTo(r*.38,r*.25);c.lineTo(-r*.38,r*.25);c.closePath();c.fill();}
  // Torn fabric, exposed wounds and grime make the silhouette read as a zombie rather than a mannequin.
  c.strokeStyle='rgba(180,205,188,.25)';c.lineWidth=Math.max(1,r*.035);c.beginPath();
  c.moveTo(-r*.42,-r*.12);c.lineTo(-r*.22,r*.30);c.moveTo(r*.42,-r*.12);c.lineTo(r*.22,r*.30);
  c.moveTo(-r*.28,r*.42);c.lineTo(-r*.12,r*.22);c.moveTo(r*.30,r*.42);c.lineTo(r*.12,r*.22);c.stroke();
  c.fillStyle='rgba(125,35,31,.72)';c.beginPath();c.ellipse(-r*.34,r*.05,r*.11,r*.18,-.3,0,TAU);c.ellipse(r*.28,-r*.16,r*.09,r*.15,.2,0,TAU);c.fill();
  c.fillStyle='rgba(225,230,215,.28)';c.beginPath();c.arc(-r*.53,-r*.18,r*.08,0,TAU);c.arc(r*.53,-r*.18,r*.08,0,TAU);c.fill();
  c.fillStyle=skin;c.fillRect(-r*.14,-r*.60,r*.28,r*.24);
  const reach=active?r*(.58+.14*Math.sin(n*.026)):r*.28;
  c.lineWidth=r*.25;c.strokeStyle='#111614';c.beginPath();c.moveTo(-sh*.82,-r*.20);c.lineTo(-r*.90,-r*.02+stride);c.lineTo(-r*.64,reach+r*.15);c.moveTo(sh*.82,-r*.20);c.lineTo(r*.90,-r*.02-stride);c.lineTo(r*.64,reach+r*.15);c.stroke();
  c.strokeStyle=skin;c.lineWidth=r*.17;c.stroke();c.fillStyle=hi;c.beginPath();c.arc(-r*.64,reach+r*.15,r*.14,0,TAU);c.arc(r*.64,reach+r*.15,r*.14,0,TAU);c.fill();
  const hy=-r*.78,hr=r*head,hg=c.createRadialGradient(-hr*.28,hy-hr*.30,2,hr*.18,hy,hr*1.25);hg.addColorStop(0,hi);hg.addColorStop(.55,skin);hg.addColorStop(1,'#4b3731');
  c.fillStyle=hg;c.beginPath();c.ellipse(0,hy,hr,hr*1.10,0,0,TAU);c.fill();c.strokeStyle='#101412';c.lineWidth=2;c.stroke();
  c.fillStyle=t==='screamer'?'#25162b':'#272522';c.beginPath();c.arc(0,hy-hr*.48,hr*.83,Math.PI,TAU);c.fill();
  c.fillStyle=skin;c.beginPath();c.arc(-hr*.92,hy,hr*.18,0,TAU);c.arc(hr*.92,hy,hr*.18,0,TAU);c.fill();
  c.fillStyle='#201716';c.beginPath();c.ellipse(0,hy+hr*.46,hr*.34,hr*.15,0,0,TAU);c.fill();
  c.fillStyle=accent;c.shadowColor=accent;c.shadowBlur=7;c.beginPath();c.ellipse(-hr*.32,hy-.02,Math.max(2.3,r*.075),Math.max(1.5,r*.045),0,0,TAU);c.ellipse(hr*.32,hy-.02,Math.max(2.3,r*.075),Math.max(1.5,r*.045),0,0,TAU);c.fill();c.shadowBlur=0;
  if(z.flash>0&&!dead){c.globalCompositeOperation='screen';c.fillStyle='rgba(255,255,255,.3)';c.beginPath();c.arc(0,-r*.25,r,0,TAU);c.fill();c.globalCompositeOperation='source-over';}
  c.restore();
  if(!dead&&z.hp<z.maxHp){const w=r*3.1,yy=z.y-r*2.15;c.fillStyle='rgba(7,11,10,.88)';c.fillRect(z.x-w/2,yy,w,6);c.fillStyle=z.hp<z.maxHp*.3?'#ff4b4b':'#d85a5a';c.fillRect(z.x-w/2,yy,w*Math.max(0,z.hp/z.maxHp),6);}
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
  g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.72,'rgba(0,0,0,.035)');g.addColorStop(1,'rgba(0,0,0,.18)');
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
