// V9 visual overhaul: cinematic procedural art pass.
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
  const ctx=G.ctx,p=G.player,a=G.aim(),now=performance.now();
  const moving=['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].some(k=>G.keys?.has(k));
  const stride=moving?Math.sin(now*.015)*5:0;
  ctx.save();ctx.translate(p.x,p.y);
  if(G.invuln>0&&Math.floor(G.invuln/70)%2===0)ctx.globalAlpha=.45;
  // Strong contact shadow.
  ctx.fillStyle='rgba(0,0,0,.48)';ctx.beginPath();ctx.ellipse(3,24,27,9,0,0,TAU);ctx.fill();
  ctx.fillStyle='rgba(0,0,0,.22)';ctx.beginPath();ctx.ellipse(-9,20,18,6,0,0,TAU);ctx.fill();
  // Legs and boots.
  limb(ctx,-6,8,-9+stride,19,9,'#35434a','#11181b');
  limb(ctx,6,8,9-stride,19,9,'#4a565b','#11181b');
  ctx.fillStyle='#0c1114';ctx.beginPath();ctx.ellipse(-10+stride,25,8,4,-.12,0,TAU);ctx.ellipse(10-stride,25,8,4,.12,0,TAU);ctx.fill();
  if(G.equipmentHas?.('boots')){ctx.fillStyle='#7d5538';ctx.beginPath();ctx.ellipse(-10+stride,24,8,4,-.12,0,TAU);ctx.ellipse(10-stride,24,8,4,.12,0,TAU);ctx.fill();}
  // Backpack silhouette.
  ctx.fillStyle='#1b2728';roundRect(ctx,-17,-6,8,20,3);ctx.fill();
  ctx.strokeStyle='rgba(140,165,166,.25)';ctx.lineWidth=1;ctx.stroke();
  // Torso / plate carrier.
  const bg=ctx.createLinearGradient(-14,-9,15,17);bg.addColorStop(0,'#71838a');bg.addColorStop(.45,'#42545b');bg.addColorStop(1,'#202b30');
  ctx.fillStyle=bg;roundRect(ctx,-13,-8,26,25,7);ctx.fill();
  ctx.strokeStyle='#0b1114';ctx.lineWidth=2.2;ctx.stroke();
  ctx.fillStyle='#29383c';roundRect(ctx,-14,-4,28,20,5);ctx.fill();
  ctx.strokeStyle='#7d928d';ctx.lineWidth=1;ctx.stroke();
  // MOLLE rows / pouches.
  for(let yy=0;yy<12;yy+=6){ctx.strokeStyle='rgba(174,195,188,.28)';ctx.beginPath();ctx.moveTo(-10,yy);ctx.lineTo(10,yy);ctx.stroke();}
  ctx.fillStyle='#151e20';ctx.fillRect(-10,2,6,8);ctx.fillRect(4,2,6,8);
  ctx.fillStyle='#718a7e';ctx.fillRect(-8,3,2,4);ctx.fillRect(6,3,2,4);
  // Neck and head.
  ctx.fillStyle='#b77b61';ctx.fillRect(-4,-12,8,6);
  const hg=ctx.createRadialGradient(-3,-21,2,3,-16,13);hg.addColorStop(0,'#f0c29d');hg.addColorStop(.6,'#d49a75');hg.addColorStop(1,'#815144');
  ctx.fillStyle=hg;ctx.beginPath();ctx.arc(0,-18,10.5,0,TAU);ctx.fill();
  ctx.strokeStyle='rgba(30,20,18,.55)';ctx.lineWidth=1;ctx.stroke();
  // Helmet + headset.
  ctx.fillStyle='#202b30';ctx.beginPath();ctx.arc(0,-21,11,Math.PI,TAU);ctx.fill();
  ctx.fillStyle='#34434a';ctx.beginPath();ctx.arc(0,-22,10,Math.PI*1.02,Math.PI*1.98);ctx.fill();
  ctx.fillStyle='#11181c';ctx.fillRect(-11,-19,22,3);
  ctx.fillStyle='#687c83';ctx.fillRect(4,-24,5,2);
  ctx.strokeStyle='#7f9aa0';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(9,-16,3,0,TAU);ctx.stroke();
  // Face details aimed subtly toward the weapon.
  const fx=Math.cos(a)*2.2,fy=Math.sin(a)*1.2;
  ctx.fillStyle='#4b302a';ctx.beginPath();ctx.arc(-3+fx,-18+fy,1.1,0,TAU);ctx.arc(3+fx,-18+fy,1.1,0,TAU);ctx.fill();
  // Aim rig / arms.
  ctx.save();ctx.rotate(a);
  limb(ctx,7,-3,16,-1,7,'#596b73','#26353b');
  limb(ctx,7,5,16,5,7,'#596b73','#26353b');
  ctx.fillStyle='#d4a07d';ctx.beginPath();ctx.arc(19,2,3.2,0,TAU);ctx.fill();
  ctx.fillStyle='#c89270';ctx.beginPath();ctx.arc(18,5,3,0,TAU);ctx.fill();
  const recoil=Math.max(0,p.recoil||0);ctx.translate(-recoil,0);
  // Weapon is deliberately a separate visual layer.
  const gun=G.selectedWeapon;
  ctx.shadowColor='rgba(0,0,0,.55)';ctx.shadowBlur=5;
  const metal='#1a2226',edge='#68767b';
  ctx.fillStyle=metal;ctx.strokeStyle=edge;ctx.lineWidth=1.3;
  if(gun===1){roundRect(ctx,18,-3,30,6,2);ctx.fill();ctx.stroke();ctx.fillStyle='#11171a';ctx.fillRect(23,2,7,11);ctx.fillStyle='#7e8a8d';ctx.fillRect(44,-2,9,3);}
  else if(gun===2){roundRect(ctx,15,-3,38,7,2);ctx.fill();ctx.stroke();ctx.fillStyle='#101619';ctx.fillRect(23,3,8,14);ctx.fillStyle='#657379';ctx.fillRect(45,-3,13,3);}
  else if(gun===3){ctx.fillStyle='#3a2e26';roundRect(ctx,16,-2,34,7,2);ctx.fill();ctx.stroke();ctx.fillStyle='#171b1d';ctx.fillRect(24,4,8,14);ctx.fillStyle='#9a734d';ctx.fillRect(44,0,10,4);}
  else if(gun===4){ctx.fillStyle='#343c3f';roundRect(ctx,15,-5,34,11,3);ctx.fill();ctx.stroke();ctx.fillStyle='#c77425';ctx.fillRect(19,-7,12,3);ctx.fillStyle='#151b1d';ctx.fillRect(27,5,10,11);}
  else {roundRect(ctx,14,-3,48,7,2);ctx.fill();ctx.stroke();ctx.fillStyle='#101619';ctx.fillRect(23,4,9,14);ctx.fillStyle='#6b838b';ctx.fillRect(49,-5,14,3);ctx.fillStyle='#8fc9ff';ctx.fillRect(57,-2,8,2);}
  ctx.shadowBlur=0;
  // Muzzle brake and flash.
  const muzzleX=gun===5?65:gun===4?50:gun===3?55:gun===2?58:54;
  ctx.fillStyle='#0c1215';ctx.fillRect(muzzleX-3,-2,8,4);
  if(p.muzzle>0&&gun!==4){
    const c=G.weapons?.[gun]?.color||'#ffd36b',q=clamp(p.muzzle/90);
    ctx.globalAlpha=q;ctx.shadowColor=c;ctx.shadowBlur=20;ctx.fillStyle=c;
    ctx.beginPath();ctx.moveTo(muzzleX+3,0);ctx.lineTo(muzzleX+20,-9);ctx.lineTo(muzzleX+13,0);ctx.lineTo(muzzleX+20,9);ctx.closePath();ctx.fill();
    ctx.fillStyle='#fff5b0';ctx.beginPath();ctx.arc(muzzleX+4,0,4+q*2,0,TAU);ctx.fill();ctx.shadowBlur=0;
  }
  ctx.restore();
  if(G.equipmentHas?.('shield')&&p.shield>0){
    ctx.strokeStyle='rgba(87,215,255,.48)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,1,35+Math.sin(now*.008)*2,0,TAU);ctx.stroke();
  }
  if(p.dashTime>0){
    ctx.strokeStyle='rgba(103,220,255,.48)';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,31+Math.sin(now*.03)*4,0,TAU);ctx.stroke();
  }
  ctx.restore();
};
G.drawPlayer=G.drawPlayerV9;

G.drawZombieV9=function(z){
  // Reuse the richer V7 silhouettes as the base, then add V9 lighting/readability.
  if(G.drawZombieV8)G.drawZombieV8(z);
  const ctx=G.ctx,now=performance.now();
  if(z.hp<=0)return;
  const glow={exploder:'#ff6b35',spitter:'#6ff0b5',screamer:'#e87cff',hunter:'#ffd15b',leaper:'#ffcf5a',tank:'#b9c9d0',fast:'#ffd56a'}[z.type];
  if(glow){
    ctx.save();ctx.globalAlpha=.16;ctx.shadowColor=glow;ctx.shadowBlur=18;ctx.fillStyle=glow;ctx.beginPath();ctx.arc(z.x,z.y-rSafe(z)*.2,rSafe(z)*.72,0,TAU);ctx.fill();ctx.restore();
  }
  if(z.stun>0){
    ctx.save();ctx.translate(z.x,z.y-rSafe(z)*1.25);ctx.fillStyle='#ffe18a';ctx.font='bold 13px Arial';ctx.textAlign='center';ctx.fillText('✦',0,0);ctx.restore();
  }
};
function rSafe(z){return Math.max(16,z.r||16);}
G.drawZombie=G.drawZombieV9;function drawZombieLegsV9(z){
  if(z.hp<=0)return;
  const ctx=G.ctx,r=Math.max(16,z.r||16),now=performance.now();
  const stride=Math.sin(now*.012+(z.x+z.y)*.01)*(z.type==='tank'?2.5:5);
  const wide=z.type==='tank',spread=wide?r*.47:r*.36;
  ctx.save();ctx.translate(z.x,z.y);
  ctx.fillStyle='rgba(0,0,0,.30)';ctx.beginPath();ctx.ellipse(2,r*1.08,r*1.1,r*.25,0,0,Math.PI*2);ctx.fill();
  const pants=z.type==='hunter'?'#272033':z.type==='fast'?'#4a3924':z.type==='spitter'?'#293b35':'#202725';
  ctx.fillStyle=pants;
  ctx.strokeStyle='#0d1312';ctx.lineWidth=2;
  ctx.beginPath();ctx.roundRect(-spread-r*.12,r*.42,r*.25,r*.72,4);ctx.roundRect(spread-r*.13,r*.42,r*.26,r*.72,4);ctx.fill();ctx.stroke();
  ctx.fillStyle='#111719';ctx.beginPath();
  ctx.ellipse(-spread+stride*.25,r*1.25,r*.34,r*.14,-.08,0,TAU);
  ctx.ellipse(spread-stride*.25,r*1.25,r*.34,r*.14,.08,0,TAU);ctx.fill();
  ctx.strokeStyle='rgba(190,205,195,.35)';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(-spread-r*.08,r*.55);ctx.lineTo(-spread+r*.04,r*1.12);ctx.moveTo(spread-r*.04,r*.55);ctx.lineTo(spread+r*.08,r*1.12);ctx.stroke();
  ctx.restore();
}
G._drawZombieLegsV9=drawZombieLegsV9;


G.drawBulletV9=function(b){
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
