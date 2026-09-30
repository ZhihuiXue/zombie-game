// Auto-split from Zombie Outbreak V3.1. Gameplay intentionally unchanged in this refactor.
const G = globalThis;

G.draw = function(){G.ctx.clearRect(0,0,G.W,G.H);G.ctx.fillStyle='#0a1510';G.ctx.fillRect(0,0,G.W,G.H);G.ctx.save();if(G.state==='playing'&&G.mouse.down&&G.selectedWeapon===4&&G.owned[4])G.drawFlameCone();let sx=(Math.random()-.5)*G.shake,sy=(Math.random()-.5)*G.shake;G.ctx.translate(-G.camera.x+sx,-G.camera.y+sy);G.drawWorld();G.drawDrops();G.drawPowerups();for(const g of G.grenades)G.drawGrenade(g);for(const b of G.bullets)G.drawBullet(b);for(const z of G.zombies)G.drawZombie(z);if(G.boss)G.drawBoss();G.drawPlayer();G.drawParticles();G.drawTexts();G.drawV9Blood?.();G.ctx.restore();G.drawV9Lighting?.();if(G.combo>1){G.ctx.fillStyle='#fff';G.ctx.font='bold 22px Arial';G.ctx.textAlign='center';G.ctx.fillText('🔥 COMBO x'+G.combo,G.W/2,90)}if(G.currentEvent){G.ctx.fillStyle='#ffd45a';G.ctx.font='bold 15px Arial';G.ctx.textAlign='center';G.ctx.fillText(G.eventLabel(),G.W/2,118)}if(G.weather){G.ctx.fillStyle='#dce9e4';G.ctx.font='bold 13px Arial';G.ctx.textAlign='center';G.ctx.fillText(G.weatherLabel(),G.W/2,138)}if(G.adaptive&&G.wave>=3){G.ctx.fillStyle='#b9c7ff';G.ctx.font='bold 12px Arial';G.ctx.textAlign='center';G.ctx.fillText(G.adaptive.label(),G.W/2,158)}G.drawWeather?.();G.drawVignette();G.drawCombatOverlay();G.drawThreatPulse?.();G.updateUI()};

G.drawWorld=function(){
 if(!G.worldCache){
  const c=document.createElement('canvas');c.width=G.WORLD.w;c.height=G.WORLD.h;const x=c.getContext('2d');
  const b=G.biomes?.[G.mapTheme]||G.biomes?.grassland||{ground:'#31563b',ground2:'#3e6846',accent:'#6f995f'};
  x.fillStyle=b.ground;x.fillRect(0,0,c.width,c.height);
  x.fillStyle=b.ground2;
  for(let i=0;i<900;i++){const px=Math.random()*c.width,py=Math.random()*c.height,s=1+Math.random()*3;x.globalAlpha=.10+.08*Math.random();x.fillRect(px,py,s,s*1.8);}x.globalAlpha=1;
  if(G.mapTheme==='forest'||G.mapTheme==='forestRiver'){
    x.fillStyle='rgba(16,31,21,.16)';for(let i=0;i<180;i++){const px=Math.random()*c.width,py=Math.random()*c.height;x.beginPath();x.arc(px,py,12+Math.random()*16,0,Math.PI*2);x.fill();}
  }
  for(const q of G.waterRects||[]){const g=x.createLinearGradient(q.x,q.y,q.x+q.w,q.y+q.h);g.addColorStop(0,'#2b7ea0');g.addColorStop(.5,'#3b9fc1');g.addColorStop(1,'#256c8c');x.fillStyle=g;x.fillRect(q.x,q.y,q.w,q.h);x.strokeStyle='rgba(210,245,255,.25)';x.lineWidth=2;for(let yy=q.y+22;yy<q.y+q.h;yy+=34){x.beginPath();x.moveTo(q.x+20,yy);x.quadraticCurveTo(q.x+q.w*.5,yy-7,q.x+q.w-20,yy);x.stroke();}}
  for(const bridge of G.bridges||[]){x.fillStyle='#8a6a45';x.fillRect(bridge.x,bridge.y,bridge.w,bridge.h);x.fillStyle='#5b442f';for(let xx=bridge.x+8;xx<bridge.x+bridge.w;xx+=22)x.fillRect(xx,bridge.y+4,12,bridge.h-8);x.strokeStyle='#d0a66e';x.strokeRect(bridge.x,bridge.y,bridge.w,bridge.h);}
  for(const a of G.walls||[]){if(a.kind==='tree')continue;x.fillStyle='#59635d';x.fillRect(a.x,a.y,a.w,a.h);x.fillStyle='#78847c';x.fillRect(a.x+5,a.y+5,a.w-10,8);x.strokeStyle='#26302b';x.strokeRect(a.x,a.y,a.w,a.h);}
  for(const t of G.trees||[]){if(t.kind==='bush')continue;x.fillStyle='rgba(0,0,0,.20)';x.beginPath();x.ellipse(t.x+6,t.y+t.r*.75,t.r*1.05,t.r*.42,0,0,Math.PI*2);x.fill();x.fillStyle='#684936';x.fillRect(t.x-4,t.y-2,8,t.r*1.25);const tg=x.createRadialGradient(t.x-5,t.y-t.r*.6,2,t.x,t.y-t.r*.3,t.r*1.35);tg.addColorStop(0,'#6e9c5b');tg.addColorStop(.6,'#3f7046');tg.addColorStop(1,'#1f432b');x.fillStyle=tg;x.beginPath();x.arc(t.x,t.y-t.r*.45,t.r*1.08,0,Math.PI*2);x.fill();x.beginPath();x.arc(t.x-t.r*.55,t.y-t.r*.1,t.r*.7,0,Math.PI*2);x.fill();x.beginPath();x.arc(t.x+t.r*.55,t.y-t.r*.05,t.r*.68,0,Math.PI*2);x.fill();}
  for(const t of G.trees||[]){if(t.kind!=='bush')continue;x.fillStyle='#47734a';x.beginPath();x.arc(t.x,t.y,t.r,0,Math.PI*2);x.fill();x.fillStyle='#6b9258';x.beginPath();x.arc(t.x-t.r*.35,t.y-t.r*.25,t.r*.5,0,Math.PI*2);x.fill();}
  G.worldCache=c;
 }
 G.ctx.drawImage(G.worldCache,0,0);
};

G.drawFlameCone=function(){
  const a=G.aim(),now=performance.now(),range=285,cone=.32;
  G.ctx.save();G.ctx.lineCap='round';
  // The visible cone is intentionally the same geometry used by damage detection.
  G.ctx.globalAlpha=.13;G.ctx.fillStyle='#ff5a18';G.ctx.beginPath();G.ctx.moveTo(G.player.x,G.player.y);G.ctx.arc(G.player.x,G.player.y,range,a-cone,a+cone);G.ctx.closePath();G.ctx.fill();
  G.ctx.globalAlpha=.22;G.ctx.fillStyle='#ff9d2e';G.ctx.beginPath();G.ctx.moveTo(G.player.x,G.player.y);G.ctx.arc(G.player.x,G.player.y,range*.72,a-cone*.72,a+cone*.72);G.ctx.closePath();G.ctx.fill();
  for(let i=0;i<11;i++){
    const t=i/10,ang=a+Math.sin(now*.012+i*2.7)*.045+(Math.random()-.5)*.028;
    const len=38+t*220,sx=G.player.x+Math.cos(a)*20,sy=G.player.y+Math.sin(a)*20;
    const ex=sx+Math.cos(ang)*len,ey=sy+Math.sin(ang)*len;
    G.ctx.globalAlpha=.42*(1-t*.6);G.ctx.strokeStyle=i%3===0?'#fff1a0':i%2?'#ffb52e':'#ff6b18';G.ctx.lineWidth=8-t*5;
    G.ctx.beginPath();G.ctx.moveTo(sx,sy);G.ctx.quadraticCurveTo((sx+ex)/2+Math.sin(now*.01+i)*12,(sy+ey)/2-Math.cos(now*.01+i)*12,ex,ey);G.ctx.stroke();
  }
  G.ctx.restore();
};
G.drawPlayer = function(){
  const ctx=G.ctx, p=G.player, a=G.aim();
  const moving=G.keys.has('w')||G.keys.has('a')||G.keys.has('s')||G.keys.has('d')||G.keys.has('arrowup')||G.keys.has('arrowdown')||G.keys.has('arrowleft')||G.keys.has('arrowright');
  const now=performance.now(), walk=Math.sin(now*.014)*(moving?5:1), bob=moving?Math.abs(Math.sin(now*.014))*1.4:0;
  ctx.save();ctx.translate(p.x,p.y-bob);
  ctx.globalAlpha=G.invuln>0&&Math.floor(G.invuln/70)%2===0?.45:1;

  // Soft contact shadow + directional ground shadow. Keeping it simple avoids a per-frame blur cost.
  ctx.fillStyle='rgba(0,0,0,.30)';ctx.beginPath();ctx.ellipse(0,20,25,9,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='rgba(0,0,0,.14)';ctx.beginPath();ctx.ellipse(-5,17,18,6,0,0,Math.PI*2);ctx.fill();

  // Legs: separated joints make the character read as a person instead of two strokes.
  const leftLeg=walk,rightLeg=-walk;
  ctx.lineCap='round';ctx.lineJoin='round';
  ctx.strokeStyle='#26333a';ctx.lineWidth=9;
  ctx.beginPath();ctx.moveTo(-6,8);ctx.lineTo(-8+leftLeg,18);ctx.lineTo(-10+leftLeg,25);ctx.moveTo(6,8);ctx.lineTo(8+rightLeg,18);ctx.lineTo(10+rightLeg,25);ctx.stroke();
  ctx.fillStyle='#12191d';ctx.beginPath();ctx.ellipse(-11+leftLeg,26,7,3.5,-.12,0,Math.PI*2);ctx.ellipse(11+rightLeg,26,7,3.5,.12,0,Math.PI*2);ctx.fill();
  if(G.equipmentHas?.('boots')){ctx.fillStyle='#8a5735';ctx.beginPath();ctx.ellipse(-11+leftLeg,25.5,7,3.7,-.12,0,Math.PI*2);ctx.ellipse(11+rightLeg,25.5,7,3.7,.12,0,Math.PI*2);ctx.fill();}

  // Torso: layered shirt + tactical vest + side shadow for depth.
  const bodyGrad=ctx.createLinearGradient(-12,-7,13,14);bodyGrad.addColorStop(0,'#71879a');bodyGrad.addColorStop(.48,'#52697b');bodyGrad.addColorStop(1,'#30414e');
  ctx.fillStyle=bodyGrad;ctx.beginPath();ctx.roundRect(-12,-7,24,23,6);ctx.fill();
  ctx.fillStyle='rgba(12,18,22,.32)';ctx.fillRect(-12,5,24,10);
  // Character silhouette outline + compact backpack make the player read clearly against the terrain.
  ctx.strokeStyle='rgba(5,12,15,.72)';ctx.lineWidth=2.2;ctx.beginPath();ctx.roundRect(-13,-8,26,25,7);ctx.stroke();
  ctx.fillStyle='#26343b';ctx.beginPath();ctx.roundRect(-16,-2,5,15,2);ctx.fill();ctx.roundRect(11,-2,5,15,2);ctx.fill();
  if(G.equipmentHas?.('vest')){
    const vg=ctx.createLinearGradient(-14,-7,14,13);vg.addColorStop(0,'#566b5e');vg.addColorStop(.5,'#394c42');vg.addColorStop(1,'#202d27');ctx.fillStyle=vg;ctx.beginPath();ctx.roundRect(-14,-7,28,22,5);ctx.fill();
    ctx.strokeStyle='#718879';ctx.lineWidth=1.4;ctx.strokeRect(-13,-6,26,20);
    ctx.fillStyle='#26362e';ctx.fillRect(-11,0,7,8);ctx.fillRect(4,0,7,8);
    ctx.fillStyle='#809786';ctx.fillRect(-9,1,3,5);ctx.fillRect(6,1,3,5);
    ctx.strokeStyle='rgba(180,200,190,.28)';ctx.beginPath();ctx.moveTo(-5,-6);ctx.lineTo(-5,14);ctx.moveTo(5,-6);ctx.lineTo(5,14);ctx.stroke();
  } else {
    ctx.strokeStyle='rgba(210,225,235,.18)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-7,-4);ctx.lineTo(-7,13);ctx.moveTo(7,-4);ctx.lineTo(7,13);ctx.stroke();
  }

  // Neck and head stay upright; only the aiming rig rotates.
  ctx.fillStyle='#bd805e';ctx.fillRect(-4,-11,8,7);
  const skin=ctx.createRadialGradient(-3,-20,2,2,-15,12);skin.addColorStop(0,'#f0c09a');skin.addColorStop(.65,'#d49a73');skin.addColorStop(1,'#8c5847');
  ctx.fillStyle=skin;ctx.beginPath();ctx.arc(0,-18,10.5,0,Math.PI*2);ctx.fill();
  // Ear / cheek depth.
  ctx.fillStyle='#a96855';ctx.beginPath();ctx.arc(-10,-17,2.8,0,Math.PI*2);ctx.arc(10,-17,2.8,0,Math.PI*2);ctx.fill();
  // Hair with irregular edge.
  ctx.fillStyle='#302824';ctx.beginPath();ctx.moveTo(-10,-19);ctx.quadraticCurveTo(-8,-29,0,-29);ctx.quadraticCurveTo(9,-28,11,-19);ctx.lineTo(7,-22);ctx.lineTo(4,-19);ctx.lineTo(0,-23);ctx.lineTo(-4,-19);ctx.lineTo(-8,-22);ctx.closePath();ctx.fill();
  // Face direction follows aim subtly without rotating the body.
  const fx=Math.cos(a)*2.5, fy=Math.sin(a)*1.4;
  ctx.fillStyle='#4a3029';ctx.beginPath();ctx.arc(-3+fx,-18+fy,1.2,0,Math.PI*2);ctx.arc(3+fx,-18+fy,1.2,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='rgba(255,220,190,.45)';ctx.beginPath();ctx.arc(-3,-21,2.2,0,Math.PI*2);ctx.fill();
  if(G.equipmentHas?.('scope')){ctx.fillStyle='#252e34';ctx.fillRect(-10,-24,20,3);ctx.fillStyle='#6fc8ef';ctx.fillRect(5,-24,5,2);}

  // Aiming rig: shoulder -> upper arm -> forearm -> hands -> weapon.
  ctx.save();ctx.rotate(a);ctx.lineCap='round';
  ctx.fillStyle='#394d5c';ctx.beginPath();ctx.arc(8,-3,5,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#c78e6d';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(6,-2);ctx.lineTo(15,-1);ctx.lineTo(20,3);ctx.moveTo(6,5);ctx.lineTo(15,5);ctx.lineTo(20,3);ctx.stroke();
  ctx.fillStyle='#d8a07b';ctx.beginPath();ctx.arc(20,3,3,0,Math.PI*2);ctx.fill();
  const recoil=Math.max(0,p.recoil||0);
  const gun=G.selectedWeapon;
  ctx.translate(-recoil,0);
  if(gun===1){ctx.fillStyle='#252b30';ctx.fillRect(18,0,25,5);ctx.fillStyle='#11161a';ctx.fillRect(18,4,7,9);ctx.fillStyle='#89959b';ctx.fillRect(41,1,6,4);}
  else if(gun===2){ctx.fillStyle='#20272b';ctx.fillRect(16,-1,31,6);ctx.fillStyle='#11181b';ctx.fillRect(22,4,8,12);ctx.fillStyle='#4e5b61';ctx.fillRect(44,0,9,4);}
  else if(gun===3){ctx.fillStyle='#46382f';ctx.fillRect(17,0,28,6);ctx.fillStyle='#202427';ctx.fillRect(24,5,7,13);ctx.fillStyle='#8a6b4b';ctx.fillRect(43,1,8,4);}
  else if(gun===4){ctx.fillStyle='#343b3e';ctx.fillRect(15,-3,30,9);ctx.fillStyle='#d27a24';ctx.fillRect(19,-5,12,3);ctx.fillStyle='#202528';ctx.fillRect(27,5,9,9);}
  else {ctx.fillStyle='#273238';ctx.fillRect(14,-2,43,7);ctx.fillStyle='#10171b';ctx.fillRect(23,5,9,12);ctx.fillStyle='#617b86';ctx.fillRect(49,-4,12,3);ctx.fillStyle='#8fc9ff';ctx.fillRect(55,-2,7,2);}
  if(p.muzzle>0&&gun!==4){ctx.globalAlpha=Math.min(1,p.muzzle/90);ctx.fillStyle=G.weapons[gun]?.color||'#ffd36b';ctx.beginPath();ctx.moveTo(50,3);ctx.lineTo(63,-2);ctx.lineTo(58,3);ctx.lineTo(63,8);ctx.closePath();ctx.fill();ctx.globalAlpha=1;}
  ctx.restore();

  if(G.equipmentHas?.('target')){ctx.strokeStyle='#5fcfff';ctx.lineWidth=1.6;ctx.beginPath();ctx.arc(13,4,5,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#8be2ff';ctx.beginPath();ctx.arc(13,4,1.5,0,Math.PI*2);ctx.fill();}
  if(G.equipmentHas?.('shield')&&p.shield>0){ctx.strokeStyle='#72dcff';ctx.globalAlpha=.25+.15*Math.sin(now*.008);ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(0,0,29,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;}
  ctx.restore();
  if(G.attackTimer>250){ctx.save();ctx.translate(p.x,p.y);ctx.rotate(a);ctx.strokeStyle='rgba(246,226,164,.75)';ctx.lineWidth=6;ctx.beginPath();ctx.arc(22,1,68,-.82,.82);ctx.stroke();ctx.restore();}
};

G.drawBoss = function(){
  const b=G.boss;if(!b)return;const ctx=G.ctx,now=performance.now(),r=b.r;
  ctx.save();ctx.translate(b.x,b.y);
  ctx.fillStyle='rgba(0,0,0,.38)';ctx.beginPath();ctx.ellipse(0,r*.95,r*1.15,r*.38,0,0,Math.PI*2);ctx.fill();
  const body=ctx.createRadialGradient(-r*.25,-r*.3,4,r*.2,r*.2,r*1.25);body.addColorStop(0,b.flash>0?'#fff':'#87444e');body.addColorStop(.55,b.phase===3?'#9e2222':'#63333b');body.addColorStop(1,'#2d1b20');
  ctx.fillStyle=body;ctx.beginPath();ctx.ellipse(0,5,r*.82,r*.95,0,0,Math.PI*2);ctx.fill();
  // Armor plates and torn straps.
  ctx.fillStyle='#4d5559';ctx.beginPath();ctx.roundRect(-r*.72,-r*.25,r*1.44,r*.65,10);ctx.fill();ctx.strokeStyle='#9ba7aa';ctx.lineWidth=2;ctx.strokeRect(-r*.62,-r*.18,r*1.24,r*.48);
  ctx.fillStyle='#273034';ctx.fillRect(-r*.46,-r*.05,r*.28,r*.2);ctx.fillRect(r*.18,-r*.05,r*.28,r*.2);
  // Head and crown.
  const hg=ctx.createRadialGradient(-r*.2,-r*.72,3,0,-r*.45,r*.65);hg.addColorStop(0,'#bd746f');hg.addColorStop(1,'#4b242a');ctx.fillStyle=hg;ctx.beginPath();ctx.arc(0,-r*.62,r*.52,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#20181a';ctx.beginPath();ctx.ellipse(0,-r*.42,r*.3,r*.18,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#ffd95b';ctx.beginPath();ctx.arc(-r*.18,-r*.68,5,0,Math.PI*2);ctx.arc(r*.18,-r*.68,5,0,Math.PI*2);ctx.fill();
  // Crown-like spikes.
  ctx.fillStyle='#b99338';ctx.beginPath();ctx.moveTo(-r*.52,-r*.88);ctx.lineTo(-r*.36,-r*1.35);ctx.lineTo(-r*.08,-r*.95);ctx.lineTo(r*.08,-r*1.4);ctx.lineTo(r*.35,-r*.94);ctx.lineTo(r*.52,-r*1.28);ctx.lineTo(r*.55,-r*.65);ctx.closePath();ctx.fill();
  // Huge asymmetric arms.
  ctx.strokeStyle='#5b3035';ctx.lineWidth=r*.28;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-r*.62,0);ctx.lineTo(-r*1.18,r*.45);ctx.lineTo(-r*1.35,r*.78);ctx.moveTo(r*.62,0);ctx.lineTo(r*1.15,r*.5);ctx.lineTo(r*1.32,r*.8);ctx.stroke();
  if(b.phase>=2){ctx.strokeStyle='rgba(255,95,75,.6)';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,r*1.05,0,Math.PI*2);ctx.stroke();}
  if(b.phase===3){const pulse=1+Math.sin(now*.008)*.08;ctx.strokeStyle='rgba(255,50,50,.45)';ctx.lineWidth=5;ctx.beginPath();ctx.arc(0,0,r*1.25*pulse,0,Math.PI*2);ctx.stroke();}
  ctx.restore();
  ctx.fillStyle='rgba(15,22,19,.9)';ctx.fillRect(b.x-90,b.y-r-30,180,11);ctx.fillStyle=b.phase===3?'#f23a3a':b.phase===2?'#ef9c3d':'#c33b48';ctx.fillRect(b.x-90,b.y-r-30,180*Math.max(0,b.hp/b.maxHp),11);
  ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font='bold 15px Arial';ctx.fillText('👑 BOSS · PHASE '+b.phase,b.x,b.y-r-38);
};

G.drawBullet = function(b){if(b.x<G.camera.x-30||b.x>G.camera.x+G.W+30||b.y<G.camera.y-30||b.y>G.camera.y+G.H+30)return;const ctx=G.ctx;const color=b.type==='enemy'?'#ff675c':(G.weapons[b.type]?.color||'#fff');const speed=Math.hypot(b.vx,b.vy)||1;const trail=b.type===5?22:b.type===3?13:b.type===2?9:7;const radius=b.type===5?4:b.type===3?3.5:3;ctx.save();ctx.globalAlpha=b.type==='enemy'?.72:.62;ctx.strokeStyle=color;ctx.lineWidth=b.type===5?3.2:2;ctx.shadowColor=color;ctx.shadowBlur=b.type===5?12:6;ctx.beginPath();ctx.moveTo(b.x-b.vx/speed*trail,b.y-b.vy/speed*trail);ctx.lineTo(b.x,b.y);ctx.stroke();ctx.globalAlpha=1;ctx.fillStyle=color;ctx.beginPath();ctx.arc(b.x,b.y,radius,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.restore()};

G.drawGrenade = function(g){if(g.x<G.camera.x-30||g.x>G.camera.x+G.W+30||g.y<G.camera.y-30||g.y>G.camera.y+G.H+30)return;G.ctx.fillStyle='#25362c';G.ctx.beginPath();G.ctx.arc(g.x,g.y,8,0,Math.PI*2);G.ctx.fill();G.ctx.fillStyle='#d9c28b';G.ctx.fillRect(g.x-2,g.y-11,4,4)};

G.drawDrops = function(){for(const d of G.drops){if(d.x<G.camera.x-40||d.x>G.camera.x+G.W+40||d.y<G.camera.y-40||d.y>G.camera.y+G.H+40)continue;const bob=Math.sin(performance.now()/160+d.x)*4;G.ctx.save();G.ctx.translate(d.x,d.y+bob);G.ctx.fillStyle='#0007';G.ctx.beginPath();G.ctx.ellipse(0,12,15,6,0,0,Math.PI*2);G.ctx.fill();if(d.type==='hp'){G.ctx.fillStyle='#e8eee9';G.ctx.fillRect(-12,-10,24,22);G.ctx.fillStyle='#d53f4c';G.ctx.fillRect(-4,-8,8,18);G.ctx.fillRect(-9,-3,18,8)}if(d.type==='ammo'){G.ctx.fillStyle='#c99d4d';G.ctx.fillRect(-13,-10,26,20);G.ctx.fillStyle='#55422a';for(let i=-8;i<=8;i+=8)G.ctx.fillRect(i,-7,4,14)}if(d.type==='grenade'){G.ctx.fillStyle='#3f5746';G.ctx.beginPath();G.ctx.arc(0,2,10,0,Math.PI*2);G.ctx.fill();G.ctx.fillStyle='#d6c185';G.ctx.fillRect(-2,-12,4,5)}if(d.type==='coin'){G.ctx.fillStyle='#f3c64f';G.ctx.beginPath();G.ctx.arc(0,0,11,0,Math.PI*2);G.ctx.fill();G.ctx.fillStyle='#9a6c1f';G.ctx.font='bold 12px Arial';G.ctx.textAlign='center';G.ctx.fillText('$',0,4)}G.ctx.restore()}};

G.drawPowerups = function(){for(const p of G.powerups){if(p.x<G.camera.x-40||p.x>G.camera.x+G.W+40||p.y<G.camera.y-40||p.y>G.camera.y+G.H+40)continue;const y=p.y+Math.sin(performance.now()/180)*5;G.ctx.save();G.ctx.translate(p.x,y);G.ctx.fillStyle=p.type==='rage'?'#f05':p.type==='freeze'?'#61cfff':p.type==='heal'?'#68df85':'#ffd34e';G.ctx.beginPath();G.ctx.arc(0,0,14,0,Math.PI*2);G.ctx.fill();G.ctx.fillStyle='#07100d';G.ctx.font='bold 13px Arial';G.ctx.textAlign='center';G.ctx.textBaseline='middle';G.ctx.fillText(p.type==='rage'?'R':p.type==='freeze'?'F':p.type==='heal'?'+':'K',0,0);G.ctx.restore()}};

G.drawParticles = function(){for(const p of G.particles){if(p.x<G.camera.x-20||p.x>G.camera.x+G.W+20||p.y<G.camera.y-20||p.y>G.camera.y+G.H+20)continue;G.ctx.globalAlpha=Math.max(0,p.life/(p.flame?420:600));G.ctx.fillStyle=p.color;G.ctx.beginPath();G.ctx.arc(p.x,p.y,p.size,0,Math.PI*2);G.ctx.fill()}G.ctx.globalAlpha=1};

G.drawTexts = function(){G.ctx.textAlign='center';G.ctx.font='bold 14px Arial';for(const t of G.texts){if(t.x<G.camera.x-40||t.x>G.camera.x+G.W+40||t.y<G.camera.y-40||t.y>G.camera.y+G.H+40)continue;G.ctx.globalAlpha=Math.max(0,t.life/520);G.ctx.fillStyle=t.color;G.ctx.font=t.critLabel?'bold 16px Arial':'bold 14px Arial';G.ctx.fillText(t.t,t.x,t.y)}G.ctx.globalAlpha=1};

G.drawCombatOverlay=function(){const ctx=G.ctx;if(G.damageFlash>0){ctx.fillStyle=`rgba(220,35,35,${Math.min(.28,G.damageFlash/800)})`;ctx.fillRect(0,0,G.W,G.H)}const hpRatio=G.player.maxHp?G.player.hp/G.player.maxHp:1;if(hpRatio<.28&&G.state==='playing'){const pulse=.08+.06*(.5+.5*Math.sin(performance.now()*.012));const g=ctx.createRadialGradient(G.W/2,G.H/2,Math.min(G.W,G.H)*.25,G.W/2,G.H/2,Math.max(G.W,G.H)*.72);g.addColorStop(0,'rgba(150,0,0,0)');g.addColorStop(1,`rgba(170,0,0,${pulse})`);ctx.fillStyle=g;ctx.fillRect(0,0,G.W,G.H)}if(G.player.dashFx>0){ctx.save();ctx.globalAlpha=Math.min(.32,G.player.dashFx/500);ctx.strokeStyle='#72d7ff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(G.W/2,G.H/2,26+((230-G.player.dashFx)*.08),0,Math.PI*2);ctx.stroke();ctx.restore()}};

G.drawCrosshair=function(){
  if(G.state!=='playing')return;
  const ctx=G.ctx,x=G.mouse.x,y=G.mouse.y,w=G.weapons[G.selectedWeapon]||{},now=performance.now();
  const color=w.color||'#ffffff',moving=G.player.dashTime>0,pulse=1+Math.sin(now*.012)*.08;
  const gap=G.selectedWeapon===3?9:G.selectedWeapon===5?13:7,size=G.selectedWeapon===5?12:G.selectedWeapon===4?10:8;
  ctx.save();ctx.translate(x,y);ctx.globalAlpha=.9;ctx.strokeStyle=color;ctx.lineWidth=1.5;ctx.shadowColor=color;ctx.shadowBlur=8;
  ctx.beginPath();ctx.moveTo(-size*1.5,-gap);ctx.lineTo(-size*.45,-gap);ctx.moveTo(size*.45,-gap);ctx.lineTo(size*1.5,-gap);ctx.moveTo(-size*1.5,gap);ctx.lineTo(-size*.45,gap);ctx.moveTo(size*.45,gap);ctx.lineTo(size*1.5,gap);ctx.stroke();
  ctx.beginPath();ctx.arc(0,0,size*.52*pulse,0,Math.PI*2);ctx.stroke();
  ctx.fillStyle=color;ctx.globalAlpha=moving?.45:.8;ctx.beginPath();ctx.arc(0,0,2.1,0,Math.PI*2);ctx.fill();
  if(G.reloadTimer>0){ctx.globalAlpha=.65;ctx.strokeStyle='#ffcf4a';ctx.beginPath();ctx.arc(0,0,size*1.55,-Math.PI/2,-Math.PI/2+Math.PI*2*Math.min(1,1-G.reloadTimer/1000));ctx.stroke();}
  ctx.restore();
};
G.drawThreatPulse=function(){
  if(G.state!=='playing'||!G.zombies?.length)return;
  let nearest=Infinity;for(const z of G.zombies){if(z.hp>0)nearest=Math.min(nearest,Math.hypot(z.x-G.player.x,z.y-G.player.y));}
  if(nearest>=250)return;
  const intensity=Math.max(0,1-nearest/250),pulse=.018+.035*intensity*(.5+.5*Math.sin(performance.now()*.014));
  const ctx=G.ctx;ctx.save();const g=ctx.createRadialGradient(G.W/2,G.H/2,Math.min(G.W,G.H)*.3,G.W/2,G.H/2,Math.max(G.W,G.H)*.72);g.addColorStop(0,'rgba(255,35,35,0)');g.addColorStop(1,'rgba(255,45,45,'+pulse+')');ctx.fillStyle=g;ctx.fillRect(0,0,G.W,G.H);ctx.restore();
};
G.drawVignette = function(){if(!G.vignette||G.vignetteW!==G.W||G.vignetteH!==G.H){const c=document.createElement('canvas');c.width=Math.max(1,Math.floor(G.W));c.height=Math.max(1,Math.floor(G.H));const x=c.getContext('2d');const g=x.createRadialGradient(G.W/2,G.H/2,Math.min(G.W,G.H)*.25,G.W/2,G.H/2,Math.max(G.W,G.H)*.7);g.addColorStop(0,'transparent');g.addColorStop(1,'#0009');x.fillStyle=g;x.fillRect(0,0,G.W,G.H);G.vignette=c;G.vignetteW=G.W;G.vignetteH=G.H;}G.ctx.drawImage(G.vignette,0,0)};

G.updateUI = function(){
  G.uiTick+=16.67;
  if(G.uiTick<G.uiInterval)return;
  G.uiTick=0;
  const hp=Math.ceil(G.player.hp), w=G.selectedWeapon, maxMag=G.player.maxMag[w], mag=G.player.mag[w];
  G.ui.hpText.textContent=hp+' / '+G.player.maxHp;
  G.ui.hpBar.style.width=Math.max(0,hp/G.player.maxHp*100)+'%';
  G.ui.xpText.textContent=Math.floor(G.xp)+' / '+G.xpNeed;
  G.ui.xpBar.style.width=(G.xp/G.xpNeed*100)+'%';
  G.ui.stats.textContent='🌊 Wave '+G.wave+' · ☠️ '+G.waveKills+'/'+G.waveTotal+' · ⭐ Lv.'+G.level+' · 💰 '+G.coins+' · 🧬 '+G.dna+' · 🏆 '+G.score;
  G.ui.weaponText.textContent='🔫 '+G.weapons[w].name+' ['+w+']';
  G.ui.ammoText.innerHTML='弹匣 '+mag+'/'+maxMag+((w===3||w===5)?' · '+G.player.reserve[w]+' reserve':'')+(G.reloadTimer>0?' <span class="reloadBadge">↻ RELOADING</span>':'');
  G.ui.dashText.textContent='⚡ Dash '+(G.player.dashCooldown>0?Math.ceil(G.player.dashCooldown/1000)+'s':'READY');
  G.ui.grenadeText.textContent='💣 '+G.player.grenades+' · Space 近战';
};


/* V7 Dynamic Character Lighting — subtle world light, muzzle/fire/lightning accents */
G.drawDynamicLighting=function(){};
const _drawV7Base=G.draw;
G.draw=function(){_drawV7Base();G.drawDynamicLighting?.();};
