/* V11 — clean 2.5D actor renderer
 * One source of truth for player body, arms, weapon and muzzle.
 * Gameplay systems are untouched. This replaces the layered V9/V10 actor renderers.
 */
const G = globalThis;
const TAU = Math.PI * 2;
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));

const WEAPONS = {
  1:{body:38,muzzle:42,grip:19,fore:29,width:6, stock:0},
  2:{body:44,muzzle:49,grip:20,fore:32,width:6.5,stock:0},
  3:{body:46,muzzle:51,grip:20,fore:31,width:7,stock:5},
  4:{body:44,muzzle:49,grip:20,fore:31,width:9,stock:5},
  5:{body:58,muzzle:63,grip:20,fore:38,width:7,stock:8}
};

function moveState(){
  const keys=G.keys;
  const moving=['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright']
    .some(k=>keys?.has(k));
  return {moving};
}

function rig(){
  const p=G.player,a=G.aim?.()||0,s=WEAPONS[G.selectedWeapon]||WEAPONS[1];
  const now=performance.now(),moving=moveState().moving;
  const step=moving?Math.sin(now*.015):0;
  const bob=moving?Math.abs(Math.sin(now*.015))*1.15:0;
  const recoil=clamp((p?.recoil||0)*.72,0,7);
  // The anchor is the player's chest. Every weapon visual and projectile uses this transform.
  const anchorX=p.x+Math.cos(a)*2;
  const anchorY=p.y-17-bob;
  const muzzleX=anchorX+Math.cos(a)*(s.muzzle-recoil);
  const muzzleY=anchorY+Math.sin(a)*(s.muzzle-recoil);
  return {a,s,step,bob,recoil,anchorX,anchorY,muzzleX,muzzleY};
}

G.getWeaponRig=function(){
  const r=rig();
  return {a:r.a,s:r.s,anchorX:r.anchorX,anchorY:r.anchorY,muzzleX:r.muzzleX,muzzleY:r.muzzleY,recoil:r.recoil,bob:r.bob};
};

function stroke(ctx,x1,y1,x2,y2,w,c1,c2){
  const g=ctx.createLinearGradient(x1,y1,x2,y2);
  g.addColorStop(0,c1);g.addColorStop(1,c2);
  ctx.strokeStyle=g;ctx.lineWidth=w;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
}

function shadow(ctx,x,y,sx=1,sy=1){
  ctx.save();
  ctx.fillStyle='rgba(0,0,0,.34)';
  ctx.beginPath();ctx.ellipse(x+3,y+5,27*sx,8*sy,0,0,TAU);ctx.fill();
  ctx.fillStyle='rgba(0,0,0,.13)';
  ctx.beginPath();ctx.ellipse(x-5,y+2,17*sx,5*sy,0,0,TAU);ctx.fill();
  ctx.restore();
}

function drawWeapon(ctx,r,flash){
  const {a,s,recoil}=r;
  ctx.save();
  ctx.translate(r.anchorX,r.anchorY);
  ctx.rotate(a);
  ctx.translate(-recoil,0);

  const metal='#1a2327',edge='#77858a',dark='#0d1417';
  ctx.lineJoin='round';
  ctx.fillStyle=metal;ctx.strokeStyle=edge;ctx.lineWidth=1.4;

  if(G.selectedWeapon===1){
    ctx.beginPath();ctx.roundRect(10,-3,30,6,2);ctx.fill();ctx.stroke();
    ctx.fillStyle=dark;ctx.fillRect(18,2,7,13);
    ctx.fillStyle='#88969b';ctx.fillRect(31,-2,8,2);
  }else if(G.selectedWeapon===2){
    ctx.beginPath();ctx.roundRect(9,-3.5,36,7,2);ctx.fill();ctx.stroke();
    ctx.fillStyle=dark;ctx.fillRect(17,3,8,14);
    ctx.fillStyle='#718187';ctx.fillRect(36,-3,9,2.5);
  }else if(G.selectedWeapon===3){
    ctx.fillStyle='#46382d';ctx.beginPath();ctx.roundRect(8,-3.5,39,7,2);ctx.fill();ctx.stroke();
    ctx.fillStyle=dark;ctx.fillRect(17,3,8,15);
    ctx.fillStyle='#a17a50';ctx.fillRect(37,-1,10,3);
    ctx.fillStyle='#5d4b3d';ctx.fillRect(8,0,9,3);
  }else if(G.selectedWeapon===4){
    ctx.fillStyle='#343d40';ctx.beginPath();ctx.roundRect(8,-5,38,10,3);ctx.fill();ctx.stroke();
    ctx.fillStyle='#d27a27';ctx.fillRect(13,-7,13,2.7);
    ctx.fillStyle=dark;ctx.fillRect(21,5,10,12);
  }else{
    ctx.beginPath();ctx.roundRect(7,-3.5,51,7,2);ctx.fill();ctx.stroke();
    ctx.fillStyle=dark;ctx.fillRect(17,3,9,14);
    ctx.fillStyle='#657d86';ctx.fillRect(43,-5,12,2.5);
    ctx.fillStyle='#91d2ff';ctx.fillRect(53,-2,7,2);
  }

  ctx.fillStyle='#080e11';ctx.fillRect(s.muzzle-2,-2,5,3);

  if(flash>0){
    const q=clamp(flash/90);
    const color=G.weapons?.[G.selectedWeapon]?.color||'#ffd36b';
    ctx.globalCompositeOperation='lighter';ctx.globalAlpha=q;
    ctx.shadowColor=color;ctx.shadowBlur=18;ctx.fillStyle=color;
    ctx.beginPath();
    ctx.moveTo(s.muzzle,0);ctx.lineTo(s.muzzle+13,-7);ctx.lineTo(s.muzzle+7,0);ctx.lineTo(s.muzzle+13,7);ctx.closePath();ctx.fill();
    ctx.fillStyle='#fff5bd';ctx.beginPath();ctx.arc(s.muzzle,0,2.5+q*2,0,TAU);ctx.fill();
  }
  ctx.restore();
}

function drawPlayer(){
  const p=G.player;if(!p)return;
  const ctx=G.ctx,r=rig(),now=performance.now(),{moving}=moveState();
  const a=r.a,step=r.step;

  shadow(ctx,p.x,p.y,1.05,1);

  ctx.save();
  ctx.translate(p.x,p.y-r.bob);
  if(G.invuln>0&&Math.floor(G.invuln/70)%2===0)ctx.globalAlpha=.48;

  // Feet and legs sit on the ground plane; torso rises away from it.
  const legA=step*4.5, legB=-step*4.5;
  ctx.lineCap='round';
  stroke(ctx,-7,17,-9+legA,31,7,'#66767b','#202a2e');
  stroke(ctx,7,17,9+legB,31,7,'#718086','#202a2e');
  ctx.fillStyle='#0c1215';
  ctx.beginPath();
  ctx.ellipse(-10+legA,33,7.5,3.5,-.10,0,TAU);
  ctx.ellipse(10+legB,33,7.5,3.5,.10,0,TAU);ctx.fill();

  // Backpack gives a clear rear-side volume.
  ctx.fillStyle='#172225';ctx.beginPath();ctx.roundRect(-14,-13,8,22,3);ctx.fill();
  ctx.fillStyle='#596963';ctx.fillRect(-12,-8,5,2);ctx.fillRect(-12,-2,5,2);

  // Torso / plate carrier: deliberately asymmetric highlights create 2.5D depth.
  const body=ctx.createLinearGradient(-13,-13,13,16);
  body.addColorStop(0,'#7d8c91');body.addColorStop(.38,'#506169');body.addColorStop(1,'#202a2e');
  ctx.fillStyle=body;ctx.beginPath();ctx.roundRect(-13,-13,26,29,6);ctx.fill();
  ctx.strokeStyle='#0b1114';ctx.lineWidth=2;ctx.stroke();
  ctx.fillStyle='#2e3d41';ctx.beginPath();ctx.roundRect(-14,-5,28,20,5);ctx.fill();
  ctx.strokeStyle='rgba(185,204,197,.28)';ctx.lineWidth=1;ctx.strokeRect(-11,-3,22,17);
  ctx.strokeStyle='rgba(207,220,214,.16)';
  for(let x=-7;x<=7;x+=7){ctx.beginPath();ctx.moveTo(x,-3);ctx.lineTo(x,14);ctx.stroke();}
  ctx.fillStyle='#151e21';ctx.fillRect(-10,4,6,7);ctx.fillRect(4,4,6,7);

  // Neck and head are upright: this is what makes the actor read as 3/4 instead of a rotated top-down sprite.
  ctx.fillStyle='#bd8062';ctx.fillRect(-4,-18,8,7);
  const skin=ctx.createRadialGradient(-3,-27,1,3,-19,12);
  skin.addColorStop(0,'#f1c49f');skin.addColorStop(.55,'#d29a76');skin.addColorStop(1,'#73473d');
  ctx.fillStyle=skin;ctx.beginPath();ctx.arc(0,-27,10.5,0,TAU);ctx.fill();

  ctx.fillStyle='#2a2928';ctx.beginPath();
  ctx.moveTo(-10,-28);ctx.quadraticCurveTo(-8,-38,0,-39);
  ctx.quadraticCurveTo(9,-38,11,-28);
  ctx.lineTo(7,-31);ctx.lineTo(3,-28);ctx.lineTo(0,-32);ctx.lineTo(-4,-28);ctx.lineTo(-8,-31);ctx.closePath();ctx.fill();
  ctx.fillStyle='#1a2428';ctx.beginPath();ctx.arc(0,-34,11,Math.PI,TAU);ctx.fill();
  ctx.fillStyle='#53656a';ctx.beginPath();ctx.arc(-1,-35,9,Math.PI*1.04,Math.PI*1.96);ctx.fill();
  ctx.fillStyle='#101719';ctx.fillRect(-11,-29,22,2.5);

  // Face is only biased toward the aim. The body never spins like a compass needle.
  const faceSide=Math.cos(a)>0?1:-1;
  ctx.fillStyle='#4a3029';ctx.beginPath();
  ctx.arc(faceSide*3,-27,1.1,0,TAU);
  ctx.arc(faceSide*6,-27,1.0,0,TAU);ctx.fill();

  // Weapon-side shoulder pads.
  ctx.fillStyle='#364950';ctx.beginPath();ctx.arc(9,-9,5,0,TAU);ctx.fill();
  ctx.fillStyle='#4a5b61';ctx.beginPath();ctx.arc(-9,-8,5,0,TAU);ctx.fill();

  ctx.restore();

  // Arms + weapon are one rig. They rotate around the chest, not around the player's feet.
  ctx.save();
  ctx.translate(r.anchorX,r.anchorY);
  ctx.rotate(a);

  const rearX=r.s.grip-r.recoil;
  const foreX=r.s.fore-r.recoil;
  const upperBob=step*.8;

  // Far arm first: slightly darker and visually behind the weapon.
  stroke(ctx,-7,5,8+upperBob,4,5.8,'#3d4d52','#202c30');
  stroke(ctx,8+upperBob,4,rearX,2.8,5.1,'#53666c','#27353a');

  // Near arm is brighter and overlaps the gun.
  stroke(ctx,7,-5,13-upperBob,-1,6.1,'#718187','#2d3b40');
  stroke(ctx,13-upperBob,-1,foreX,1.1,5.3,'#61747a','#29383d');

  ctx.fillStyle='#d19a77';
  ctx.beginPath();ctx.arc(rearX,2.8,3.1,0,TAU);ctx.fill();
  ctx.beginPath();ctx.arc(foreX,1.1,2.9,0,TAU);ctx.fill();

  // Gun is drawn after the arms so the hands visibly wrap around it.
  drawWeapon(ctx,r,p.muzzle||0);
  ctx.restore();

  // Ground contact FX remain in world space.
  if(G.equipmentHas?.('shield')&&p.shield>0){
    ctx.save();ctx.strokeStyle='rgba(90,220,255,.42)';ctx.lineWidth=2;
    ctx.beginPath();ctx.ellipse(p.x,p.y-5,29,34,0,0,TAU);ctx.stroke();ctx.restore();
  }
}

function drawZombie(z){
  if(!z)return;
  const ctx=G.ctx,n=performance.now(),dead=z.hp<=0;
  const r=Math.max(18,z.r||18),t=z.type||'normal';
  const pal={
    normal:['#a6ad98','#39433d','#c74b47'],
    fast:['#c7aa78','#5b432b','#e2a33d'],
    tank:['#9da5a6','#3c4547','#d34d48'],
    exploder:['#c58a6a','#52352d','#ff6934'],
    hunter:['#a786ae','#39283f','#d5a0ff'],
    spitter:['#83bfa0','#25483a','#62e5a3'],
    leaper:['#c29d62','#54412a','#efbb50'],
    screamer:['#b77bb8','#41243f','#f071eb']
  }[t]||['#a6ad98','#39433d','#c74b47'];

  const depth=.82+Math.max(0,Math.min(1,(z.y-(G.camera?.y||0))/(G.H||800)))*.30;
  const scale=(t==='tank'?1.13:t==='exploder'?1.06:1)*depth;
  const stride=Math.sin(n*.012+(z.x+z.y)*.01)*r*.12;

  shadow(ctx,z.x,z.y,scale*(r/22),scale*(r/22));

  ctx.save();
  ctx.translate(z.x,z.y);
  ctx.scale(scale,scale);
  ctx.globalAlpha=dead?Math.max(0,1-(z.deathTimer||0)/520):1;

  // Legs.
  stroke(ctx,-r*.25,r*.38,-r*.36+stride,r*1.05,r*.28,pal[0],pal[1]);
  stroke(ctx,r*.25,r*.38,r*.36-stride,r*1.05,r*.28,pal[0],pal[1]);
  ctx.fillStyle='#151b19';
  ctx.beginPath();ctx.ellipse(-r*.38+stride,r*1.16,r*.38,r*.16,-.08,0,TAU);ctx.ellipse(r*.38-stride,r*1.16,r*.38,r*.16,.08,0,TAU);ctx.fill();

  // Body.
  const sh=t==='tank'?r*.95:r*.76;
  const bg=ctx.createLinearGradient(-sh,-r*.52,sh,r*.55);
  bg.addColorStop(0,pal[0]);bg.addColorStop(.55,pal[1]);bg.addColorStop(1,'#141a18');
  ctx.fillStyle=bg;ctx.beginPath();
  ctx.moveTo(-sh*.75,-r*.48);ctx.lineTo(-sh,-r*.15);ctx.lineTo(-r*.50,r*.42);
  ctx.lineTo(0,r*.55);ctx.lineTo(r*.50,r*.42);ctx.lineTo(sh,-r*.15);ctx.lineTo(sh*.75,-r*.48);ctx.closePath();ctx.fill();
  ctx.strokeStyle='rgba(5,9,8,.9)';ctx.lineWidth=2;ctx.stroke();

  // Arms reach forward, not sideways like a flat top-down icon.
  const reach=r*.88;
  stroke(ctx,-sh*.72,-r*.22,-reach,-r*.02,r*.26,pal[1],pal[2]);
  stroke(ctx,sh*.72,-r*.22,reach,-r*.02,r*.26,pal[0],pal[2]);
  ctx.fillStyle=pal[0];ctx.beginPath();ctx.arc(-reach,-r*.02,r*.20,0,TAU);ctx.arc(reach,-r*.02,r*.20,0,TAU);ctx.fill();

  // Head.
  const headR=t==='tank'?r*.55:r*.46;
  const hs=ctx.createRadialGradient(-headR*.25,-r*.86,1,0,-r*.72,headR*1.5);
  hs.addColorStop(0,pal[0]);hs.addColorStop(.62,pal[0]);hs.addColorStop(1,'#4b302c');
  ctx.fillStyle=hs;ctx.beginPath();ctx.ellipse(0,-r*.82,headR,headR*1.05,0,0,TAU);ctx.fill();
  ctx.fillStyle='#252321';ctx.beginPath();ctx.arc(0,-r*1.00,headR*.82,Math.PI,TAU);ctx.fill();
  ctx.fillStyle=pal[2];ctx.beginPath();ctx.arc(-headR*.32,-r*.82,headR*.11,0,TAU);ctx.arc(headR*.32,-r*.82,headR*.11,0,TAU);ctx.fill();

  if(t==='tank'){
    ctx.fillStyle='#5c6668';ctx.beginPath();ctx.roundRect(-r*.70,-r*.42,r*1.40,r*.60,4);ctx.fill();
    ctx.fillStyle='#aab3b3';ctx.fillRect(-r*.43,-r*.28,r*.86,r*.09);
  }else if(t==='spitter'){
    ctx.fillStyle='rgba(91,231,158,.7)';ctx.beginPath();ctx.arc(r*.35,-r*.18,r*.16,0,TAU);ctx.fill();
  }else if(t==='exploder'){
    ctx.strokeStyle='#ff743e';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(0,r*.04,r*.48,0,TAU);ctx.stroke();
  }

  ctx.restore();

  if(!dead&&z.maxHp){
    const bw=58*depth;
    ctx.fillStyle='rgba(5,8,8,.75)';ctx.fillRect(z.x-bw/2,z.y-r*1.58*depth,bw,4);
    ctx.fillStyle=z.hp<z.maxHp*.3?'#f04b4b':'#c85c62';
    ctx.fillRect(z.x-bw/2,z.y-r*1.58*depth,bw*Math.max(0,z.hp/z.maxHp),4);
  }
}

// Single authoritative actor entry points. No chaining to V9/V10 renderers.
G.drawPlayerV11=drawPlayer;
G.drawZombieV11=drawZombie;
G.drawPlayerV9=drawPlayer;
G.drawPlayer=drawPlayer;
G.drawZombieV9=drawZombie;
G.drawZombie=drawZombie;
