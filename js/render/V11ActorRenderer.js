/* V11.1 — commercial 2.5D actor renderer
 * One authoritative actor layer. Upright 3/4 silhouettes, larger readable bodies,
 * integrated weapon rig, depth scaling and combat-ready animation.
 */
const G=globalThis,TAU=Math.PI*2;
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const ACTOR=1.34;

const WEAPONS={
  1:{muzzle:42,grip:19,fore:29,width:6},
  2:{muzzle:49,grip:20,fore:32,width:6.5},
  3:{muzzle:46,grip:20,fore:31,width:7},
  4:{muzzle:49,grip:20,fore:31,width:9},
  5:{muzzle:58,grip:20,fore:38,width:7}
};
function moving(){
  const k=G.keys;
  return ['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].some(v=>k?.has(v));
}
function depth(y){
  const top=G.camera?.y||0,h=G.H||800;
  return .92+clamp((y-top)/h)*.20;
}
function rig(){
  const p=G.player,a=G.aim?.()||0,s=WEAPONS[G.selectedWeapon]||WEAPONS[1];
  const walk=moving(),now=performance.now();
  const step=walk?Math.sin(now*.015):0;
  const bob=walk?Math.abs(Math.sin(now*.015))*1.15:0;
  const recoil=clamp((p?.recoil||0)*.72,0,7);
  const ax=p.x+Math.cos(a)*2*ACTOR;
  const ay=p.y-bob;
  const muzzle=ax+Math.cos(a)*(s.muzzle*ACTOR-recoil);
  const muzzleY=ay+Math.sin(a)*(s.muzzle*ACTOR-recoil);
  return {a,s,step,bob,recoil,ax,ay,muzzle,muzzleY};
}
G.getWeaponRig=()=>{const r=rig();return{a:r.a,s:r.s,anchorX:r.ax,anchorY:r.ay,muzzleX:r.muzzle,muzzleY:r.muzzleY,recoil:r.recoil,bob:r.bob};};

function shadow(c,x,y,s=1){
  c.save();c.fillStyle='rgba(0,0,0,.38)';
  c.beginPath();c.ellipse(x+4,y+7,29*s,9*s,0,0,TAU);c.fill();
  c.fillStyle='rgba(0,0,0,.14)';c.beginPath();c.ellipse(x-5,y+3,19*s,5*s,0,0,TAU);c.fill();c.restore();
}
function stroke(c,x1,y1,x2,y2,w,a,b){
  const g=c.createLinearGradient(x1,y1,x2,y2);g.addColorStop(0,a);g.addColorStop(1,b);
  c.strokeStyle=g;c.lineWidth=w;c.lineCap='round';c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();
}
function weapon(c,r,flash){
  const {a,s,recoil}=r;
  c.save();c.translate(0,0);c.rotate(a);c.translate(-recoil/ACTOR,0);
  const metal='#182125',edge='#87979c',dark='#0a1013';
  c.lineJoin='round';c.fillStyle=metal;c.strokeStyle=edge;c.lineWidth=1.5;
  const len=s.muzzle;
  if(G.selectedWeapon===1){c.beginPath();c.roundRect(8,-3,32,6,2);c.fill();c.stroke();c.fillStyle=dark;c.fillRect(17,2,8,15);}
  else if(G.selectedWeapon===2){c.beginPath();c.roundRect(7,-4,39,8,2);c.fill();c.stroke();c.fillStyle=dark;c.fillRect(16,3,9,15);c.fillStyle='#718187';c.fillRect(35,-3,11,2);}
  else if(G.selectedWeapon===3){c.fillStyle='#49382b';c.beginPath();c.roundRect(7,-4,40,8,2);c.fill();c.stroke();c.fillStyle=dark;c.fillRect(17,3,9,16);c.fillStyle='#b48b5d';c.fillRect(36,-1,11,3);}
  else if(G.selectedWeapon===4){c.fillStyle='#303b3f';c.beginPath();c.roundRect(7,-5,40,10,3);c.fill();c.stroke();c.fillStyle='#d97a27';c.fillRect(12,-7,15,3);c.fillStyle=dark;c.fillRect(20,5,11,13);}
  else{c.beginPath();c.roundRect(6,-4,52,8,2);c.fill();c.stroke();c.fillStyle=dark;c.fillRect(17,3,9,15);c.fillStyle='#6d8790';c.fillRect(43,-5,13,3);c.fillStyle='#91d2ff';c.fillRect(53,-2,8,2);}
  c.fillStyle='#070c0f';c.fillRect(len-2,-2,5,3);
  if(flash>0){const q=clamp(flash/90),col=G.weapons?.[G.selectedWeapon]?.color||'#ffd36b';c.globalCompositeOperation='lighter';c.globalAlpha=q;c.shadowColor=col;c.shadowBlur=18;c.fillStyle=col;c.beginPath();c.moveTo(len,0);c.lineTo(len+14,-7);c.lineTo(len+7,0);c.lineTo(len+14,7);c.closePath();c.fill();c.fillStyle='#fff5bd';c.beginPath();c.arc(len,0,2.5+q*2,0,TAU);c.fill();}
  c.restore();
}
function drawPlayer(){
  const p=G.player;if(!p)return;
  const c=G.ctx,r=rig(),d=depth(p.y),now=performance.now();
  const walk=moving(),step=r.step;
  shadow(c,p.x,p.y,d*1.04);
  c.save();c.translate(p.x,p.y-r.bob);c.scale(ACTOR*d,ACTOR*d);
  if(G.invuln>0&&Math.floor(G.invuln/70)%2===0)c.globalAlpha=.48;

  // Legs: separated joints + boots establish ground contact.
  const la=step*4.5,lb=-step*4.5;
  stroke(c,-7,16,-9+la,29,7,'#718087','#202a2e');
  stroke(c,7,16,9+lb,29,7,'#7d8b90','#202a2e');
  c.fillStyle='#0b1114';c.beginPath();c.ellipse(-10+la,32,7.5,3.5,-.12,0,TAU);c.ellipse(10+lb,32,7.5,3.5,.12,0,TAU);c.fill();

  // Backpack / silhouette.
  c.fillStyle='#111a1d';c.beginPath();c.roundRect(-15,-12,9,23,3);c.fill();
  c.fillStyle='#566762';c.fillRect(-13,-7,5,2);c.fillRect(-13,-1,5,2);

  // Tactical torso with plate segmentation.
  const bg=c.createLinearGradient(-14,-14,15,17);
  bg.addColorStop(0,'#8a9a9e');bg.addColorStop(.34,'#52646b');bg.addColorStop(1,'#202a2e');
  c.fillStyle=bg;c.beginPath();c.roundRect(-14,-13,28,30,6);c.fill();
  c.strokeStyle='#091013';c.lineWidth=2;c.stroke();
  c.fillStyle='#29393e';c.beginPath();c.roundRect(-15,-4,30,21,5);c.fill();
  c.strokeStyle='rgba(210,225,220,.25)';c.lineWidth=1;c.strokeRect(-12,-2,24,17);
  c.strokeStyle='rgba(220,230,225,.13)';
  for(let x=-8;x<=8;x+=8){c.beginPath();c.moveTo(x,-2);c.lineTo(x,15);c.stroke();}
  c.fillStyle='#10181b';c.fillRect(-11,5,7,8);c.fillRect(4,5,7,8);
  c.fillStyle='#6f8186';c.fillRect(-3,-9,6,4);

  // Neck / head.
  c.fillStyle='#b9785e';c.fillRect(-4,-19,8,7);
  const skin=c.createRadialGradient(-3,-29,1,3,-20,13);skin.addColorStop(0,'#f2c5a0');skin.addColorStop(.55,'#d39a76');skin.addColorStop(1,'#6e443b');
  c.fillStyle=skin;c.beginPath();c.arc(0,-28,11.5,0,TAU);c.fill();
  c.fillStyle='#202628';c.beginPath();c.moveTo(-11,-29);c.quadraticCurveTo(-9,-40,0,-41);c.quadraticCurveTo(10,-40,12,-29);c.lineTo(7,-32);c.lineTo(3,-29);c.lineTo(0,-33);c.lineTo(-4,-29);c.lineTo(-8,-32);c.closePath();c.fill();
  c.fillStyle='#52666b';c.beginPath();c.arc(-1,-36,9.5,Math.PI*1.04,Math.PI*1.96);c.fill();
  const side=Math.cos(r.a)>0?1:-1;c.fillStyle='#442e29';c.beginPath();c.arc(side*3,-28,1.15,0,TAU);c.arc(side*6,-28,1,0,TAU);c.fill();

  // Shoulder pads.
  c.fillStyle='#34474e';c.beginPath();c.arc(10,-9,5.5,0,TAU);c.fill();c.fillStyle='#53666c';c.beginPath();c.arc(-10,-8,5.5,0,TAU);c.fill();

  // Arms and weapon share the same transform.
  const rear=r.s.grip/ACTOR-r.recoil/ACTOR,fore=r.s.fore/ACTOR-r.recoil/ACTOR;
  stroke(c,-7,5,8+step*.8,4,6,'#3c4d52','#202b30');
  stroke(c,8+step*.8,4,rear,3,5.2,'#596c72','#27353a');
  stroke(c,7,-5,13-step*.8,-1,6.3,'#7a8a8e','#2d3c41');
  stroke(c,13-step*.8,-1,fore,1,5.4,'#66797f','#29383d');
  c.fillStyle='#d19a77';c.beginPath();c.arc(rear,3,3.2,0,TAU);c.arc(fore,1,3,0,TAU);c.fill();
  weapon(c,r,p.muzzle||0);
  c.restore();

  if(G.equipmentHas?.('shield')&&p.shield>0){c.save();c.strokeStyle='rgba(90,220,255,.42)';c.lineWidth=2;c.beginPath();c.ellipse(p.x,p.y-7,34*d,39*d,0,0,TAU);c.stroke();c.restore();}
}
function drawZombie(z){
  if(!z)return;
  const c=G.ctx,n=performance.now(),dead=z.hp<=0,t=z.type||'normal',r=Math.max(20,z.r||20),d=depth(z.y);
  const pal={normal:['#aab39c','#3b453f','#d34c48'],fast:['#d0b07d','#5b432b','#efaa3d'],tank:['#a5afb0','#3c4749','#df504c'],exploder:['#d08c6c','#52352d','#ff6b35'],hunter:['#a786ae','#39283f','#d6a0ff'],spitter:['#83c1a0','#25483a','#62e5a3'],leaper:['#c7a66c','#54412a','#efbb50'],screamer:['#ba7fba','#41243f','#f071eb']}[t]||['#aab39c','#3b453f','#d34c48'];
  const s=(t==='tank'?1.16:t==='exploder'?1.09:1)*d*1.28;
  const stride=Math.sin(n*.012+(z.x+z.y)*.01)*r*.12;
  shadow(c,z.x,z.y,s*.78);
  c.save();c.translate(z.x,z.y);const death=dead?Math.min(1,1-(z.deathTimer||0)/620):0;
  if(dead){c.rotate((z.deathAngle||0)*death*z.deathDir);c.translate(0,death*r*.18);}
  c.scale(s,s*(dead?(1-death*.32):1));c.globalAlpha=dead?Math.max(0,1-death):1;

  stroke(c,-r*.25,r*.36,-r*.36+stride,r*1.02,r*.27,pal[0],pal[1]);
  stroke(c,r*.25,r*.36,r*.36-stride,r*1.02,r*.27,pal[0],pal[1]);
  c.fillStyle='#151b19';c.beginPath();c.ellipse(-r*.39+stride,r*1.14,r*.40,r*.17,-.08,0,TAU);c.ellipse(r*.39-stride,r*1.14,r*.40,r*.17,.08,0,TAU);c.fill();

  const sh=t==='tank'?r*.98:r*.78,body=c.createLinearGradient(-sh,-r*.55,sh,r*.58);
  body.addColorStop(0,pal[0]);body.addColorStop(.52,pal[1]);body.addColorStop(1,'#141a18');
  c.fillStyle=body;c.beginPath();c.moveTo(-sh*.74,-r*.50);c.lineTo(-sh,-r*.14);c.lineTo(-r*.52,r*.43);c.lineTo(0,r*.58);c.lineTo(r*.52,r*.43);c.lineTo(sh,-r*.14);c.lineTo(sh*.74,-r*.50);c.closePath();c.fill();
  c.strokeStyle='rgba(5,9,8,.92)';c.lineWidth=2.2;c.stroke();

  const reach=r*.92;
  stroke(c,-sh*.72,-r*.23,-reach,-r*.01,r*.27,pal[1],pal[2]);
  stroke(c,sh*.72,-r*.23,reach,-r*.01,r*.27,pal[0],pal[2]);
  c.fillStyle=pal[0];c.beginPath();c.arc(-reach,-r*.01,r*.21,0,TAU);c.arc(reach,-r*.01,r*.21,0,TAU);c.fill();

  const hr=t==='tank'?r*.57:r*.48,head=c.createRadialGradient(-hr*.25,-r*.90,1,0,-r*.74,hr*1.55);
  head.addColorStop(0,pal[0]);head.addColorStop(.62,pal[0]);head.addColorStop(1,'#4b302c');
  c.fillStyle=head;c.beginPath();c.ellipse(0,-r*.84,hr,hr*1.06,0,0,TAU);c.fill();
  c.fillStyle='#252321';c.beginPath();c.arc(0,-r*1.01,hr*.84,Math.PI,TAU);c.fill();
  c.fillStyle=pal[2];c.beginPath();c.arc(-hr*.34,-r*.84,hr*.12,0,TAU);c.arc(hr*.34,-r*.84,hr*.12,0,TAU);c.fill();

  if(t==='tank'){c.fillStyle='#626d70';c.beginPath();c.roundRect(-r*.72,-r*.43,r*1.44,r*.62,5);c.fill();c.fillStyle='#b5bdbd';c.fillRect(-r*.45,-r*.29,r*.90,r*.10);}
  if(t==='spitter'){c.fillStyle='rgba(91,231,158,.75)';c.beginPath();c.arc(r*.36,-r*.18,r*.17,0,TAU);c.fill();}
  if(t==='exploder'){c.strokeStyle='#ff743e';c.lineWidth=2.8;c.beginPath();c.arc(0,r*.04,r*.49,0,TAU);c.stroke();}
  if(t==='hunter'){c.strokeStyle='#d5a0ff';c.lineWidth=2;c.beginPath();c.moveTo(-r*.7,-r*.25);c.lineTo(r*.7,r*.25);c.stroke();}
  c.restore();

  if(!dead&&z.maxHp){const bw=62*d;c.fillStyle='rgba(5,8,8,.78)';c.fillRect(z.x-bw/2,z.y-r*1.62*d,bw,5);c.fillStyle=z.hp<z.maxHp*.3?'#f04b4b':'#c85c62';c.fillRect(z.x-bw/2,z.y-r*1.62*d,bw*Math.max(0,z.hp/z.maxHp),5);}
}

G.drawPlayerV11=drawPlayer;
G.drawZombieV11=drawZombie;
G.drawPlayerV9=drawPlayer;
G.drawZombieV9=drawZombie;
G.drawPlayer=drawPlayer;
G.drawZombie=drawZombie;
