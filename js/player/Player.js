// Auto-split from Zombie Outbreak V3.1. Gameplay intentionally unchanged in this refactor.
const G = globalThis;

G.aim = function(){return Math.atan2(G.mouse.y-(G.player.y-G.camera.y),G.mouse.x-(G.player.x-G.camera.x))};

G.damagePlayer = function(n){if(G.invuln>0||G.state!=='playing')return;if(G.player.shield>0){const absorbed=Math.min(G.player.shield,n);G.player.shield-=absorbed;n-=absorbed;if(n<=0){G.showMessage('🛡️ SHIELD BLOCK',350);G.player.hitFlash=180;return}}n*=1-(G.player.damageReduction||0);G.player.hp-=n;G.adaptive?.recordDamageTaken(n);G.invuln=380;G.shake=8;G.player.hitFlash=180;G.damageFlash=220;G.texts.push({x:G.player.x,y:G.player.y-30,t:'-'+Math.round(n),life:650,color:'#ff6d6d'});for(let i=0;i<10;i++){const a=Math.random()*Math.PI*2,s=80+Math.random()*150;G.particles.push({x:G.player.x,y:G.player.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:260,color:'#e34d4d',size:2+Math.random()*3})}G.playSound('damage');if(G.player.hp<=0)G.gameOver()};

G.dash = function(){if(G.state!=='playing'||G.player.dashCooldown>0)return;G.playSound('dash');let dx=(G.keys.has('d')||G.keys.has('arrowright')?1:0)-(G.keys.has('a')||G.keys.has('arrowleft')?1:0),dy=(G.keys.has('s')||G.keys.has('arrowdown')?1:0)-(G.keys.has('w')||G.keys.has('arrowup')?1:0);if(!dx&&!dy){dx=Math.cos(G.aim());dy=Math.sin(G.aim())}const l=Math.hypot(dx,dy)||1;dx/=l;dy/=l;G.player.dashTime=230;G.player.dashCooldown=2200;G.player._dx=dx;G.player._dy=dy;G.player.dashFx=230;for(let i=0;i<8;i++){G.particles.push({x:G.player.x,y:G.player.y,vx:-dx*(70+Math.random()*120)+(Math.random()-.5)*50,vy:-dy*(70+Math.random()*120)+(Math.random()-.5)*50,life:180+Math.random()*100,color:'#72d7ff',size:3+Math.random()*3})}};

G.melee = function(){if(G.state!=='playing'||G.attackTimer>0)return;G.attackTimer=520;G.playSound('melee');const a=G.aim();for(const z of G.zombies){const dx=z.x-G.player.x,dy=z.y-G.player.y,d=Math.hypot(dx,dy);let da=Math.atan2(dy,dx)-a;da=Math.atan2(Math.sin(da),Math.cos(da));if(d<86&&Math.abs(da)<.85){G.damageZombie(z,G.player.meleeDamage*G.player.damage*.95);z.stun=260;z.x+=Math.cos(a)*24;z.y+=Math.sin(a)*24}}for(let i=0;i<15;i++)G.particles.push({x:G.player.x+Math.cos(a)*60,y:G.player.y+Math.sin(a)*60,vx:(Math.random()-.5)*150,vy:(Math.random()-.5)*150,life:280,color:'#f1e5c0',size:2+Math.random()*3})};

G.throwGrenade = function(){if(G.state!=='playing'||G.player.grenades<=0)return;const a=G.aim();G.player.grenades--;G.grenades.push({x:G.player.x,y:G.player.y,vx:Math.cos(a)*480,vy:Math.sin(a)*480,life:700});};

/* Character Visual V2 — stylized 2D roguelite survivor */
G.drawPlayerV2=function(){
  const ctx=G.ctx,p=G.player,a=G.aim(),now=performance.now();
  const moving=G.keys.has('w')||G.keys.has('a')||G.keys.has('s')||G.keys.has('d')||
    G.keys.has('arrowup')||G.keys.has('arrowdown')||G.keys.has('arrowleft')||G.keys.has('arrowright');
  const phase=now*.014,step=moving?Math.sin(phase)*4.5:Math.sin(phase)*.7;
  const bob=moving?Math.abs(Math.sin(phase))*1.8:0;
  ctx.save();
  ctx.translate(p.x,p.y-bob);
  ctx.globalAlpha=G.invuln>0&&Math.floor(G.invuln/70)%2===0?.45:1;

  // Ground contact + directional shadow.
  ctx.fillStyle='rgba(0,0,0,.34)';
  ctx.beginPath();ctx.ellipse(2,27,25,8,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='rgba(0,0,0,.18)';
  ctx.beginPath();ctx.ellipse(-8,23,19,5,-.12,0,Math.PI*2);ctx.fill();

  // Legs / boots: stronger silhouette and volume.
  const lg=ctx.createLinearGradient(-10,8,12,25);
  lg.addColorStop(0,'#344553');lg.addColorStop(.55,'#263440');lg.addColorStop(1,'#151d25');
  ctx.fillStyle=lg;
  ctx.beginPath();
  ctx.moveTo(-10,8);ctx.lineTo(-2,9);ctx.lineTo(-4+step,20);ctx.lineTo(-7+step,26);
  ctx.lineTo(-15+step,26);ctx.lineTo(-11+step,20);ctx.closePath();
  ctx.moveTo(2,9);ctx.lineTo(10,8);ctx.lineTo(11-step,20);ctx.lineTo(15-step,26);
  ctx.lineTo(7-step,26);ctx.lineTo(4-step,20);ctx.closePath();ctx.fill();
  ctx.fillStyle='#111820';
  ctx.beginPath();ctx.ellipse(-11+step,27,8,3.4,-.08,0,Math.PI*2);ctx.ellipse(11-step,27,8,3.4,.08,0,Math.PI*2);ctx.fill();
  if(G.equipmentHas?.('boots')){
    ctx.fillStyle='#7a4c32';
    ctx.beginPath();ctx.ellipse(-11+step,26.5,8,3.7,-.08,0,Math.PI*2);ctx.ellipse(11-step,26.5,8,3.7,.08,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='rgba(255,210,150,.35)';ctx.lineWidth=1;ctx.stroke();
  }

  // Torso: jacket silhouette + vest layers.
  const body=ctx.createLinearGradient(-15,-8,15,16);
  body.addColorStop(0,'#60798b');body.addColorStop(.42,'#43596a');body.addColorStop(1,'#202d38');
  ctx.fillStyle=body;
  ctx.beginPath();ctx.moveTo(-12,-7);ctx.quadraticCurveTo(-16,-2,-14,11);
  ctx.lineTo(-10,17);ctx.lineTo(10,17);ctx.lineTo(14,11);
  ctx.quadraticCurveTo(16,-2,12,-7);ctx.closePath();ctx.fill();
  ctx.strokeStyle='rgba(8,14,19,.9)';ctx.lineWidth=2;ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,.08)';ctx.beginPath();ctx.moveTo(-10,-5);ctx.lineTo(-2,-7);ctx.lineTo(-2,13);ctx.lineTo(-9,14);ctx.closePath();ctx.fill();
  ctx.strokeStyle='rgba(190,220,235,.22)';ctx.lineWidth=1.2;
  ctx.beginPath();ctx.moveTo(-2,-5);ctx.lineTo(-2,15);ctx.moveTo(2,-5);ctx.lineTo(2,15);ctx.stroke();

  if(G.equipmentHas?.('vest')){
    const vg=ctx.createLinearGradient(-14,-7,14,15);
    vg.addColorStop(0,'#596f61');vg.addColorStop(.5,'#35493f');vg.addColorStop(1,'#1d2b25');
    ctx.fillStyle=vg;ctx.beginPath();ctx.roundRect(-14,-6,28,22,5);ctx.fill();
    ctx.strokeStyle='rgba(170,205,180,.42)';ctx.lineWidth=1.2;ctx.stroke();
    ctx.fillStyle='#26372e';ctx.fillRect(-11,0,7,8);ctx.fillRect(4,0,7,8);
    ctx.fillStyle='rgba(160,190,170,.45)';ctx.fillRect(-9,1,3,5);ctx.fillRect(6,1,3,5);
  }

  // Neck + head, with rim light.
  ctx.fillStyle='#a96e53';ctx.fillRect(-4,-12,8,7);
  const skin=ctx.createRadialGradient(-4,-21,2,3,-15,13);
  skin.addColorStop(0,'#f4c29a');skin.addColorStop(.48,'#d99a74');skin.addColorStop(.82,'#b86f59');skin.addColorStop(1,'#6f4039');
  ctx.fillStyle=skin;ctx.beginPath();ctx.ellipse(0,-18,11,12,0,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='rgba(255,220,190,.42)';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(-2,-20,8.5,3.6,5.2);ctx.stroke();
  ctx.fillStyle='#2b2422';ctx.beginPath();
  ctx.moveTo(-11,-19);ctx.quadraticCurveTo(-10,-29,-1,-30);ctx.quadraticCurveTo(8,-30,11,-21);
  ctx.lineTo(7,-23);ctx.lineTo(4,-20);ctx.lineTo(1,-24);ctx.lineTo(-3,-20);ctx.lineTo(-7,-23);ctx.closePath();ctx.fill();
  ctx.fillStyle='#171517';ctx.fillRect(-8,-23,6,2);ctx.fillRect(2,-23,6,2);
  const fx=Math.cos(a)*1.8,fy=Math.sin(a)*1.1;
  ctx.fillStyle='#35211f';ctx.beginPath();ctx.ellipse(-3.2+fx,-18+fy,1.5,1.1,0,0,Math.PI*2);ctx.ellipse(3.2+fx,-18+fy,1.5,1.1,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#fff1dd';ctx.beginPath();ctx.arc(-2.7+fx,-18.4+fy,.42,0,Math.PI*2);ctx.arc(3.7+fx,-18.4+fy,.42,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#8c5549';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-2,-13);ctx.quadraticCurveTo(0,-11,3,-13);ctx.stroke();

  // Aiming arm + weapon, with metal highlights and recoil.
  ctx.save();ctx.rotate(a);
  ctx.fillStyle='#405463';ctx.beginPath();ctx.arc(8,-3,6,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#c48b6b';ctx.lineWidth=5.5;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(7,-2);ctx.lineTo(16,0);ctx.lineTo(22,3);ctx.moveTo(7,5);ctx.lineTo(16,5);ctx.lineTo(21,3);ctx.stroke();
  ctx.fillStyle='#d7a07d';ctx.beginPath();ctx.arc(21,3,3.2,0,Math.PI*2);ctx.fill();
  const recoil=Math.max(0,p.recoil||0),gun=G.selectedWeapon;ctx.translate(-recoil,0);
  const metal=ctx.createLinearGradient(15,-5,60,8);metal.addColorStop(0,'#55636a');metal.addColorStop(.45,'#202a30');metal.addColorStop(1,'#0c1115');
  ctx.fillStyle=metal;
  if(gun===1){ctx.fillRect(18,-1,28,6);ctx.fillStyle='#10171b';ctx.fillRect(24,4,7,12);ctx.fillStyle='#7c8d96';ctx.fillRect(43,0,8,3);}
  else if(gun===2){ctx.fillRect(16,-2,35,6);ctx.fillStyle='#10171b';ctx.fillRect(22,4,9,13);ctx.fillStyle='#71838c';ctx.fillRect(46,-1,10,3);}
  else if(gun===3){ctx.fillStyle='#5b4434';ctx.fillRect(17,-1,31,6);ctx.fillStyle='#171d20';ctx.fillRect(24,4,8,14);ctx.fillStyle='#9b7754';ctx.fillRect(44,0,10,3);}
  else if(gun===4){ctx.fillStyle='#303a3e';ctx.fillRect(15,-4,34,10);ctx.fillStyle='#d47b25';ctx.fillRect(20,-6,13,3);ctx.fillStyle='#151c20';ctx.fillRect(29,5,10,10);}
  else {ctx.fillStyle='#27363d';ctx.fillRect(14,-3,45,7);ctx.fillStyle='#0b1115';ctx.fillRect(23,4,9,14);ctx.fillStyle='#718c98';ctx.fillRect(49,-5,13,3);ctx.fillStyle='#a8ddff';ctx.fillRect(56,-2,7,2);}
  if(p.muzzle>0&&gun!==4){
    const glow=G.weapons[gun]?.color||'#ffd36b';
    ctx.globalAlpha=Math.min(1,p.muzzle/90);ctx.shadowColor=glow;ctx.shadowBlur=14;ctx.fillStyle=glow;
    ctx.beginPath();ctx.moveTo(50,3);ctx.lineTo(64,-4);ctx.lineTo(59,3);ctx.lineTo(65,9);ctx.closePath();ctx.fill();
    ctx.shadowBlur=0;ctx.globalAlpha=1;
  }
  ctx.restore();

  if(G.equipmentHas?.('target')){
    ctx.strokeStyle='#72d8ff';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(15,4,5,0,Math.PI*2);ctx.stroke();
    ctx.fillStyle='#b4edff';ctx.beginPath();ctx.arc(15,4,1.5,0,Math.PI*2);ctx.fill();
  }
  if(G.equipmentHas?.('shield')&&p.shield>0){
    const pulse=.22+.10*Math.sin(now*.008);ctx.strokeStyle='rgba(105,220,255,'+pulse+')';ctx.lineWidth=2.5;
    ctx.beginPath();ctx.arc(0,1,31,0,Math.PI*2);ctx.stroke();
  }
  if(G.attackTimer>250){
    ctx.save();ctx.rotate(a);ctx.strokeStyle='rgba(255,236,177,.8)';ctx.lineWidth=6;
    ctx.shadowColor='#ffe6a0';ctx.shadowBlur=10;ctx.beginPath();ctx.arc(25,1,69,-.82,.82);ctx.stroke();ctx.restore();
  }
  ctx.restore();
};
G.drawPlayer=G.drawPlayerV2;



/* V7 Character Animation Layer — 8-direction pose, locomotion states, hurt/death */
G.getPlayerPose8=function(){
  const a=G.aim(), oct=Math.round(a/(Math.PI/4)), dir=((oct%8)+8)%8;
  const moving=G.keys.has('w')||G.keys.has('a')||G.keys.has('s')||G.keys.has('d')||G.keys.has('arrowup')||G.keys.has('arrowdown')||G.keys.has('arrowleft')||G.keys.has('arrowright');
  return {angle:dir*Math.PI/4,dir,moving};
};
G.playerAnimState=function(){
  const p=G.player, now=performance.now();
  if(p.hp<=0)return 'death';
  if(p.hitFlash>0)return 'hurt';
  if(p.dashTime>0)return 'dash';
  return G.getPlayerPose8().moving?'walk':'idle';
};
const _drawPlayerBaseV7=G.drawPlayer;
G.drawPlayer=function(){
  const ctx=G.ctx,p=G.player,pose=G.getPlayerPose8(),state=G.playerAnimState(),now=performance.now();
  const phase=now*.014, bob=state==='walk'?Math.abs(Math.sin(phase))*1.8:state==='idle'?Math.sin(now*.0025)*.8:0;
  // Directional ground shadow communicates the 8-way facing even though the weapon remains mouse-driven.
  ctx.save();ctx.translate(p.x,p.y+24);
  ctx.rotate(pose.angle);ctx.globalAlpha=.16;
  ctx.fillStyle='#08100d';ctx.beginPath();ctx.ellipse(0,0,27,8,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='rgba(105,210,255,.10)';ctx.beginPath();ctx.ellipse(8,0,18,5,0,0,Math.PI*2);ctx.fill();ctx.restore();

  // Directional rim/backlight: eight discrete pose accents rather than a fixed silhouette.
  ctx.save();ctx.translate(p.x,p.y-bob);ctx.rotate(pose.angle);ctx.globalAlpha=state==='hurt'?.45:.22;
  ctx.strokeStyle=state==='hurt'?'#ff6b6b':p.dashTime>0?'#72d7ff':'#b9d4c8';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(-10,9);ctx.lineTo(-13,22);ctx.moveTo(10,9);ctx.lineTo(13,22);ctx.stroke();
  ctx.restore();

  // Existing detailed character remains the core render; animation overlays add state readability.
  _drawPlayerBaseV7();
  ctx.save();ctx.translate(p.x,p.y-bob);
  if(state==='hurt'){
    ctx.globalAlpha=.6;ctx.strokeStyle='#ff625f';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,30+Math.sin(now*.04)*2,0,Math.PI*2);ctx.stroke();
  }else if(state==='dash'){
    ctx.globalAlpha=.35;ctx.strokeStyle='#72d7ff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,31+Math.sin(now*.03)*3,0,Math.PI*2);ctx.stroke();
  }else if(state==='walk'){
    ctx.globalAlpha=.16;ctx.fillStyle='#d9eee5';ctx.beginPath();ctx.arc(0,25,2.5,0,Math.PI*2);ctx.fill();
  }
  ctx.restore();
};
