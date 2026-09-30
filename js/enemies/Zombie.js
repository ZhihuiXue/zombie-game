const G=globalThis;
G.spawnPoint=function(){const side=Math.floor(Math.random()*4),m=75;return side===0?{x:m+Math.random()*(G.WORLD.w-2*m),y:m}:side===1?{x:G.WORLD.w-m,y:m+Math.random()*(G.WORLD.h-2*m)}:side===2?{x:m+Math.random()*(G.WORLD.w-2*m),y:G.WORLD.h-m}:{x:m,y:m+Math.random()*(G.WORLD.h-2*m)}};
const defs={normal:[28,52,105,'#668f6b'],fast:[20,92,75,'#d2a044'],tank:[38,35,300,'#53616b'],exploder:[25,55,95,'#bf6b35'],hunter:[22,120,115,'#9c5a9a'],spitter:[24,48,120,'#4c9b85'],leaper:[23,100,130,'#b58a42'],screamer:[25,58,90,'#a44ca8']};
G.spawnZombie=function(type){const d=defs[type]||defs.normal;let p=G.spawnPoint(),tries=0;while(G.blocked(p.x,p.y,d[0]+3)&&tries++<240)p=G.spawnPoint();if(G.blocked(p.x,p.y,d[0]+3))return false;const elite=G.wave>=6&&Math.random()<Math.min(.14,.045+G.wave*.004);const scale=1+Math.max(0,G.wave-1)*.12;const eliteHp=elite?1.75:1,eliteSpeed=elite?1.12:1,eliteDamage=elite?1.22:1;const hp=d[2]*scale*eliteHp;const z={x:p.x,y:p.y,r:d[0]*(elite?1.08:1),speed:d[1]*eliteSpeed,damage:d[2]*eliteDamage,hp,maxHp:hp,type,color:d[3],elite,eliteReward:elite?2.2:1,attack:0,burnUntil:0,burnTick:0,stun:0,wander:0,jump:0,strafeDir:1,flash:0,kx:0,ky:0};G.adaptive?.mutateSpawn(z);G.zombies.push(z);if(elite)G.showMessage('⚠️ ELITE '+type.toUpperCase(),700);return true};
G.spawnRandomZombie=function(){const r=Math.random();let type=r<.43?'normal':r<.57?'fast':r<.69?'hunter':r<.79?'spitter':r<.87?'tank':r<.92?'leaper':r<.97?'exploder':'screamer';if(G.wave<20&&type==='screamer')type='normal';type=G.adaptive?.chooseType(type)||type;G.spawnZombie(type)};
G.damageZombie=function(z,n,impact){if(!z||z.hp<=0)return;let crit=false;if(Math.random()<(G.player.critChance||0)){n*=1.75;crit=true}if(impact?.source===4&&z.fireResist)n*=1-z.fireResist;z.hp-=n;G.player.lifeSteal&&(G.player.hp=Math.min(G.player.maxHp,G.player.hp+G.player.lifeSteal*.15));z.flash=110;z.stun=Math.max(z.stun||0,crit?100:55);G.shake=Math.max(G.shake,crit?3.2:1.0);for(let i=0;i<(crit?7:3);i++){const a=(impact?.angle??Math.random()*Math.PI*2)+(Math.random()-.5)*1.2,s=(crit?110:70)+Math.random()*80;G.particles.push({x:z.x,y:z.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:crit?300:220,color:crit?'#ffd45a':'#d8e1dc',size:crit?3+Math.random()*3:2+Math.random()*2})}if(impact){const k=impact.knockback||0;z.kx=(z.kx||0)+Math.cos(impact.angle)*k;z.ky=(z.ky||0)+Math.sin(impact.angle)*k}G.playSound('hit');G.texts.push({x:z.x,y:z.y-z.r-8,t:Math.round(n),life:crit?520:420,color:crit?'#ffd45a':'#fff',crit});if(crit)G.texts.push({x:z.x,y:z.y-z.r-28,t:'CRIT!',life:480,color:'#ffd45a',critLabel:true});if(z.hp<=0)G.killZombie(z)};
G.killZombie=function(z){if(z._dead)return;z._dead=true;z.deathTimer=520;z.hp=0;G.kills++;G.totalKills++;G.adaptive?.recordKill(z);G.combo=(G.combo||0)+1;G.comboTimer=3500;G.statsMeta&&(G.statsMeta.kills=G.totalKills);G.score+=Math.floor((100+Math.min(200,G.combo*4))*(z.eliteReward||1));G.coins+=Math.floor((6+Math.random()*8)*(1+(G.getDNAUpgrade?.('coins')||0)*.05)*(G.player.coinBoost||1)*(G.currentEvent?.[0]==='bounty'?1.5:1)*(z.eliteReward||1));G.waveKills++;G.gainXP((20+(z.type==='tank'?20:0))*(z.eliteReward||1));G.addWeaponXP?.(G.selectedWeapon,1);if(z.lastDamageSource==='fire')G.metaAdd?.('fire',1);if(z.lastDamageSource==='grenade')G.metaAdd?.('grenade',1);if(G.combo>=20)G.metaAdd?.('combo',G.combo);if(z.type==='screamer')G.metaAdd?.('screamer',1);if(G.player.lifeSteal)G.player.hp=Math.min(G.player.maxHp,G.player.hp+G.player.lifeSteal);if(z.type==='fire')G.metaAdd?.('fire',1);if(z.elite||Math.random()<(0.18*(1+(G.getDNAUpgrade?.('drop')||0)*.05))){const types=['hp','grenade','coin','ammo'];G.drops.push({x:z.x,y:z.y,type:types[Math.floor(Math.random()*types.length)],life:15000})}if(z.elite||Math.random()<.025)G.powerups.push({x:z.x,y:z.y,type:['rage','freeze','heal','insta'][Math.floor(Math.random()*4)],life:12000});const burstCount=z.elite?26:(z.type==='tank'?18:14);for(let i=0;i<burstCount;i++){const a=Math.random()*Math.PI*2,s=80+Math.random()*220;G.particles.push({x:z.x,y:z.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:420+Math.random()*180,color:z.type==='exploder'?'#ff7a30':(critKillColor(z.type)),size:2+Math.random()*4})}function critKillColor(type){return type==='screamer'?'#d96cff':type==='tank'?'#aeb9c0':type==='spitter'?'#67d9b8':'#8b302f'}if(z.elite){for(let i=0;i<12;i++){const a=Math.random()*Math.PI*2;G.particles.push({x:z.x,y:z.y,vx:Math.cos(a)*(120+Math.random()*160),vy:Math.sin(a)*(120+Math.random()*160),life:650,color:'#ffcf4a',size:2+Math.random()*3})}G.showMessage('⭐ ELITE DEFEATED · BONUS LOOT',900)}if(z.type==='exploder')G.areaDamage(z.x,z.y,100,45*G.player.damage,'player')};
G.updateZombies=function(dt){const now=performance.now();G.updatePathField?.(dt);for(const z of G.zombies){if(z.hp<=0){if(z.deathTimer>0)z.deathTimer-=dt;continue;}if(z.flash>0)z.flash-=dt;if(z.burnUntil>now){z.burnTick-=dt;if(z.burnTick<=0){G.damageZombie(z,2.5*G.player.damage*G.player.burnBoost,{source:4});z.burnTick=600}}if(z.hp<=0)continue;z.stun=Math.max(0,z.stun-dt);z.attack=Math.max(0,z.attack-dt);z.jump=Math.max(0,z.jump-dt);
  // Weapon impact knockback decays quickly, while normal AI movement remains in control.
  if(Math.abs(z.kx)+Math.abs(z.ky)>0.5){G.moveEntity(z,z.kx,z.ky,dt/1000);const decay=Math.pow(z.type==='tank'?.08:.035,dt/1000);z.kx*=decay;z.ky*=decay}else{z.kx=0;z.ky=0}
  const dx=G.player.x-z.x,dy=G.player.y-z.y,d=Math.hypot(dx,dy)||1;
  if(z.type==='screamer'){if(d<300)G.aiPathMove(z,z.x-dx/d*80,z.y-dy/d*80,Math.min(z.speed,42),dt);else if(d>500)G.aiPathMove(z,G.player.x,G.player.y,z.speed,dt);if(z.attack<=0){z.attack=2200;for(const q of G.spatialGrid.near(z.x,z.y,240)){if(q!==z&&q.hp>0)q.buffUntil=now+1800}}continue}
  if(z.type==='spitter'){if(d<300)G.aiPathMove(z,z.x-dx/d*120,z.y-dy/d*120,Math.min(z.speed,38),dt);else if(d>520)G.aiPathMove(z,G.player.x,G.player.y,z.speed,dt);if(d<520&&d>220&&z.attack<=0){z.attack=1550;G.enemyShot(z)}continue}
  let tx=G.player.x,ty=G.player.y,sp=z.speed;if(z.type==='leaper'&&d<360&&z.jump<=0){z.jump=1900;z._leapX=G.player.x;z._leapY=G.player.y}if(z.type==='leaper'&&z.jump>0&&z.jump<1500){tx=z._leapX;ty=z._leapY;sp=230}
  if(z.buffUntil&&z.buffUntil>now)sp*=1.22;if(z.stun<=0){const near=G.spatialGrid.near(z.x,z.y,80),sep=G.aiSeparation(z,near),sd=Math.hypot(sep[0],sep[1]);if(sd>1){tx+=sep[0]*.65;ty+=sep[1]*.65}if(z.type==='hunter'&&d<260){const side=z.strafeDir||1;tx+=(-dy/d)*120*side;ty+=(dx/d)*120*side}G.aiPathMove(z,tx,ty,sp,dt)}
  if(d<z.r+G.player.r+3&&z.attack<=0&&z.type!=='spitter'){G.damagePlayer(z.damage*(z.type==='exploder'?.15:.04));z.attack=700;if(z.type==='exploder'){G.areaDamage(z.x,z.y,100,30,'player');z.hp=0;z._dead=true}}
 }
 let w=0;for(let i=0;i<G.zombies.length;i++){const z=G.zombies[i];if(z.hp>0)G.zombies[w++]=z}G.zombies.length=w};
G.enemyShot=function(z){const a=Math.atan2(G.player.y-z.y,G.player.x-z.x);G.bullets.push({x:z.x+Math.cos(a)*z.r,y:z.y+Math.sin(a)*z.r,vx:Math.cos(a)*320,vy:Math.sin(a)*320,life:1600,damage:12,type:'enemy',pierce:1,hit:new Set(),owner:z})};


/* V9.3 Zombie Character Pass — distinct role silhouettes, attack poses and death poses */
G.drawZombieV7=function(z){
  if(z.x<G.camera.x-120||z.x>G.camera.x+G.W+120||z.y<G.camera.y-120||z.y>G.camera.y+G.H+120)return;
  const ctx=G.ctx,now=performance.now(),r=z.r;
  const dead=z.deathTimer>0, deathT=dead?Math.max(0,1-z.deathTimer/520):0;
  const moving=!dead, stride=moving?Math.sin(now*.012+(z.x+z.y)*.01)*5:0;
  const pal={normal:['#789878','#3e5944'],fast:['#d5aa5f','#704d27'],tank:['#78858c','#39454b'],exploder:['#ca784a','#6d3324'],hunter:['#a778aa','#4d3156'],spitter:['#69b295','#2b6651'],leaper:['#bd955d','#684a2c'],screamer:['#bb63c4','#542858']}[z.type]||['#789878','#3e5944'];
  const alpha=dead?Math.max(0,1-deathT*1.15):1;
  ctx.save();ctx.translate(z.x,z.y+deathT*18);ctx.globalAlpha=alpha;
  const fall=(dead?deathT*1.05:0)+(z.type==='fast'?.12:z.type==='hunter'?.16:z.type==='leaper'?-0.08:0);
  ctx.rotate(fall);
  // Contact shadow.
  ctx.fillStyle='rgba(0,0,0,.34)';ctx.beginPath();ctx.ellipse(2,r*1.16,r*(dead?1.28:1.02),r*.34,0,0,Math.PI*2);ctx.fill();
  // Legs: role-specific footwear and stance.
  const wide=z.type==='tank', legSpread=wide?r*.47:r*.35, knee=r*.70, ankle=r*1.24;
  const lg=ctx.createLinearGradient(0,r*.35,0,ankle);lg.addColorStop(0,'#4a514d');lg.addColorStop(1,'#171c1a');ctx.fillStyle=lg;
  ctx.beginPath();ctx.roundRect(-legSpread-r*.12,r*.42,r*.24,knee-r*.42,4);ctx.roundRect(legSpread-r*.12,r*.42,r*.24,knee-r*.42,4);ctx.fill();
  ctx.beginPath();ctx.roundRect(-legSpread-r*.15,knee,r*.30,ankle-knee,4);ctx.roundRect(legSpread-r*.15,knee,r*.30,ankle-knee,4);ctx.fill();
  ctx.fillStyle='#121716';ctx.beginPath();ctx.ellipse(-legSpread+stride*.35,ankle+2,r*.34,r*.14,-.08,0,Math.PI*2);ctx.ellipse(legSpread-stride*.35,ankle+2,r*.34,r*.14,.08,0,Math.PI*2);ctx.fill();
  if(z.type==='fast'||z.type==='hunter'){ctx.strokeStyle='rgba(235,210,140,.75)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-legSpread-r*.2,ankle-2);ctx.lineTo(-legSpread+r*.15,ankle-1);ctx.moveTo(legSpread-r*.15,ankle-1);ctx.lineTo(legSpread+r*.2,ankle-2);ctx.stroke();}
  // Torso / clothing.
  const tw=wide?r*1.75:z.type==='hunter'||z.type==='fast'?r*1.15:r*1.38,th=wide?r*1.5:r*1.22;
  const tg=ctx.createLinearGradient(-tw/2,-r*.18,tw/2,th);tg.addColorStop(0,pal[0]);tg.addColorStop(.48,pal[1]);tg.addColorStop(1,'#1d2822');ctx.fillStyle=tg;
  ctx.beginPath();ctx.moveTo(-tw*.42,-r*.15);ctx.quadraticCurveTo(-tw*.56,r*.3,-tw*.38,th*.72);ctx.lineTo(-tw*.25,th);ctx.lineTo(tw*.25,th);ctx.lineTo(tw*.38,th*.72);ctx.quadraticCurveTo(tw*.56,r*.3,tw*.42,-r*.15);ctx.closePath();ctx.fill();
  ctx.strokeStyle='rgba(8,13,11,.9)';ctx.lineWidth=2;ctx.stroke();
  // Clothing identity.
  if(z.type==='tank'){
    // Heavy infected riot gear: shoulder plates, chest plate, straps, utility belt.
    ctx.fillStyle='#2f3b40';ctx.beginPath();ctx.roundRect(-r*.83,-r*.06,r*1.66,r*.78,6);ctx.fill();
    ctx.fillStyle='#56656b';ctx.beginPath();ctx.roundRect(-r*.64,.03,r*1.28,r*.45,4);ctx.fill();
    ctx.strokeStyle='#a7b4b7';ctx.lineWidth=1.7;ctx.strokeRect(-r*.57,.10,r*1.14,r*.28);
    ctx.fillStyle='#222b2e';ctx.fillRect(-r*.92,-r*.08,r*.27,r*.55);ctx.fillRect(r*.65,-r*.08,r*.27,r*.55);
    ctx.fillStyle='#4d5b55';ctx.fillRect(-r*.82,r*.62,r*1.64,r*.17);
    ctx.fillStyle='#151c1d';ctx.fillRect(-r*.55,r*.62,r*.18,r*.25);ctx.fillRect(r*.37,r*.62,r*.18,r*.25);
  } else if(z.type==='hunter'){
    // Stalker hoodie / scarf and asymmetric shoulder.
    ctx.fillStyle='#35263d';ctx.beginPath();ctx.moveTo(-tw*.48,-r*.1);ctx.lineTo(-r*.05,-r*.3);ctx.lineTo(tw*.48,-r*.08);ctx.lineTo(tw*.38,r*.5);ctx.lineTo(-tw*.35,r*.55);ctx.closePath();ctx.fill();
    ctx.fillStyle='#6f4b72';ctx.fillRect(-r*.62,r*.3,r*1.24,r*.14);
    ctx.fillStyle='#1e1722';ctx.fillRect(-r*.55,-r*.02,r*.25,r*.55);
  } else if(z.type==='spitter'){
    // Contaminated lab coat + bio-canister.
    ctx.fillStyle='rgba(205,230,210,.38)';ctx.beginPath();ctx.moveTo(-tw*.4,-r*.08);ctx.lineTo(-r*.08,r*.15);ctx.lineTo(-r*.18,th);ctx.lineTo(-tw*.34,th*.8);ctx.closePath();ctx.fill();
    ctx.fillStyle='#193b31';ctx.beginPath();ctx.arc(r*.52,r*.35,r*.18,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#72efb7';ctx.stroke();
    ctx.strokeStyle='#72efb7';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(r*.52,r*.53);ctx.lineTo(r*.35,r*.78);ctx.stroke();
  } else if(z.type==='exploder'){
    // Ruptured hazmat vest with glowing pressure seams.
    ctx.fillStyle='#3b3029';ctx.fillRect(-r*.62,-r*.02,r*1.24,r*.68);
    ctx.strokeStyle='#ff7a36';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(0,r*.30,r*.78,0,Math.PI*2);ctx.stroke();
    ctx.fillStyle='#ffb36c';ctx.beginPath();ctx.arc(-r*.34,r*.18,2.5,0,Math.PI*2);ctx.arc(r*.32,r*.48,2,0,Math.PI*2);ctx.fill();
  } else if(z.type==='leaper'){
    // Torn athletic straps / crouched legs.
    ctx.strokeStyle='#d6a45e';ctx.lineWidth=Math.max(2,r*.08);ctx.beginPath();ctx.moveTo(-r*.58,-r*.05);ctx.lineTo(r*.15,r*.68);ctx.moveTo(r*.55,-r*.04);ctx.lineTo(-r*.18,r*.68);ctx.stroke();
  } else if(z.type==='screamer'){
    // Tattered hood and speaker-like throat collar.
    ctx.fillStyle='#321d38';ctx.beginPath();ctx.moveTo(-r*.68,-r*.2);ctx.lineTo(-r*.48,-r*.85);ctx.lineTo(r*.48,-r*.85);ctx.lineTo(r*.68,-r*.2);ctx.lineTo(r*.45,r*.1);ctx.lineTo(-r*.45,r*.1);ctx.closePath();ctx.fill();
    ctx.strokeStyle='#e78cf0';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,r*.02,r*.30,0,Math.PI*2);ctx.stroke();
  } else if(z.type==='fast'){
    // Work jacket, reflective strips, forward runner stance.
    ctx.fillStyle='#6b4b27';ctx.fillRect(-r*.62,r*.15,r*1.24,r*.18);
    ctx.strokeStyle='#e7c67b';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-r*.62,r*.28);ctx.lineTo(-r*.18,r*.62);ctx.moveTo(r*.62,r*.28);ctx.lineTo(r*.18,r*.62);ctx.stroke();
  } else {
    // Walker: torn civilian shirt, hanging strap.
    ctx.strokeStyle='rgba(220,235,220,.22)';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(-r*.2,-r*.05);ctx.lineTo(-r*.05,r*.78);ctx.moveTo(r*.18,-r*.02);ctx.lineTo(r*.05,r*.72);ctx.stroke();
  }
  // Arms / pose.
  const attacking=!dead&&z.attack>0&&z.attack<720;
  const attackSwing=attacking?(0.55+0.45*Math.sin(now*.028))*r:0;
  const armSwing=dead?0:stride*.65;ctx.strokeStyle=pal[0];ctx.lineWidth=Math.max(5,r*.19);ctx.lineCap='round';
  ctx.beginPath();
  if(attacking&&z.type!=='spitter'&&z.type!=='screamer'){
    ctx.moveTo(-tw*.38,0);ctx.lineTo(-r*.92,-attackSwing*.35+r*.18);ctx.lineTo(-r*.58,attackSwing+r*.38);
    ctx.moveTo(tw*.38,0);ctx.lineTo(r*.92,-attackSwing*.35+r*.18);ctx.lineTo(r*.58,attackSwing+r*.38);
  }else{
    ctx.moveTo(-tw*.38,0);ctx.lineTo(-r*.86,armSwing+r*.42);ctx.lineTo(-r*.72,armSwing+r*.72);
    ctx.moveTo(tw*.38,0);ctx.lineTo(r*.86,-armSwing+r*.42);ctx.lineTo(r*.72,-armSwing+r*.72);
  }
  ctx.stroke();
  // Head / face.
  const hr=wide?r*.64:r*.58;const hg=ctx.createRadialGradient(-hr*.3,-r*.72,2,hr*.2,-r*.55,hr*1.5);hg.addColorStop(0,pal[0]);hg.addColorStop(.7,pal[0]);hg.addColorStop(1,pal[1]);ctx.fillStyle=hg;ctx.beginPath();ctx.arc(0,-r*.63,hr,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=z.type==='screamer'?'#2b1a31':'#2d2926';ctx.beginPath();ctx.arc(0,-r*.84,hr*.88,Math.PI,Math.PI*2);ctx.fill();
  const glow=z.type==='screamer'?'#f4a0ff':z.type==='spitter'?'#8fffd0':z.type==='hunter'?'#ffd36b':'#ef554a';ctx.shadowColor=glow;ctx.shadowBlur=6;ctx.fillStyle=glow;ctx.beginPath();ctx.ellipse(-hr*.28,-r*.69,Math.max(1.8,r*.10),Math.max(1.4,r*.07),0,0,Math.PI*2);ctx.ellipse(hr*.28,-r*.69,Math.max(1.8,r*.10),Math.max(1.4,r*.07),0,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
  ctx.fillStyle='#271c1a';ctx.beginPath();ctx.ellipse(0,-r*.39,r*.25,r*.16,0,0,Math.PI*2);ctx.fill();
  if(z.type==='tank'){ctx.fillStyle='#303a3e';ctx.fillRect(-r*.55,-r*.2,r*1.1,r*.22);ctx.strokeStyle='#a9b7ba';ctx.strokeRect(-r*.55,-r*.2,r*1.1,r*.55);}
  if(z.type==='screamer'&&attacking){ctx.fillStyle='rgba(244,160,255,.55)';ctx.beginPath();ctx.ellipse(0,-r*.37,r*.26,r*.34,0,0,Math.PI*2);ctx.fill();}
  if(z.type==='leaper'&&attacking){ctx.strokeStyle='rgba(248,205,100,.75)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-r*.65,r*.45);ctx.lineTo(-r*.25,r*.95);ctx.moveTo(r*.65,r*.45);ctx.lineTo(r*.25,r*.95);ctx.stroke();}
  if(z.burnUntil>now&&!dead){ctx.globalCompositeOperation='screen';ctx.fillStyle='rgba(255,92,30,.18)';ctx.beginPath();ctx.arc(0,-r*.2,r*.62,0,Math.PI*2);ctx.fill();ctx.globalCompositeOperation='source-over';}
  if(z.flash>0&&!dead){ctx.globalCompositeOperation='screen';ctx.fillStyle='rgba(255,255,255,.35)';ctx.beginPath();ctx.arc(0,-r*.2,r*1.08,0,Math.PI*2);ctx.fill();ctx.globalCompositeOperation='source-over';}
  ctx.restore();
  if(!dead&&z.hp<z.maxHp){const w=r*2.2;ctx.fillStyle='rgba(10,15,13,.82)';ctx.fillRect(z.x-w/2,z.y-r-21,w,4);ctx.fillStyle=z.hp<z.maxHp*.3?'#ff4c4c':'#d95757';ctx.fillRect(z.x-w/2,z.y-r-21,w*Math.max(0,z.hp/z.maxHp),4);}
};
G.drawZombie=G.drawZombieV7;
