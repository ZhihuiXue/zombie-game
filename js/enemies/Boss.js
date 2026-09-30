// Auto-split from Zombie Outbreak V3.1. Gameplay intentionally unchanged in this refactor.
const G = globalThis;

G.spawnBoss = function(){if(G.boss||G.state!=='playing')return;let p=null;for(let i=0;i<300;i++){const q=G.spawnPoint();if(!G.blocked(q.x,q.y,58)){p=q;break}}if(!p){const bridge=G.nearestBridgePoint?.(G.player.x,G.player.y,G.player.x,G.player.y,58);if(bridge&&!G.blocked(bridge.x,bridge.y,58))p=bridge}if(!p){p={x:Math.max(80,Math.min(G.WORLD.w-80,G.player.x)),y:80};}G.boss={x:p.x,y:p.y,r:58,hp:900+G.wave*180,maxHp:900+G.wave*180,attack:0,shoot:0,phase:1,flash:0};G.invalidatePathField?.();G.showMessage('👑 BOSS INCOMING!',2200);G.playSound('boss')};

G.updateBoss = function(dt){
  if(!G.boss)return;
  if(G.boss.hp<=0){G.score+=2000;G.metaAdd?.('boss',1);G.coins+=Math.floor(250*(1+(G.getDNAUpgrade?.('coins')||0)*.05));G.playSound('bossVictory');G.gainXP(200);G.showMessage('👑 BOSS DEFEATED +$250',2200);for(let i=0;i<30;i++)G.particles.push({x:G.boss.x,y:G.boss.y,vx:(Math.random()-.5)*300,vy:(Math.random()-.5)*300,life:900,color:'#ffcc45',size:3+Math.random()*4});G.boss=null;return}
  const oldPhase=G.boss.phase;
  G.boss.phase=G.boss.hp<G.boss.maxHp*.33?3:G.boss.hp<G.boss.maxHp*.66?2:1;
  if(G.boss.phase!==oldPhase){G.boss.phasePulse=900;G.shake=Math.max(G.shake,3);G.showMessage('👑 BOSS PHASE '+G.boss.phase,1200);G.playSound('boss');}
  G.boss.phasePulse=Math.max(0,(G.boss.phasePulse||0)-dt);
  const d=Math.hypot(G.player.x-G.boss.x,G.player.y-G.boss.y)||1;
  const a=Math.atan2(G.player.y-G.boss.y,G.player.x-G.boss.x);
  G.boss.attack-=dt;G.boss.shoot-=dt;G.boss.special=(G.boss.special||0)-dt;
  const moveSpeed=G.boss.phase===3?95:G.boss.phase===2?78:65;
  if(d>115){const moved=G.moveEntity(G.boss,Math.cos(a)*moveSpeed,Math.sin(a)*moveSpeed,dt/1000);if(!moved){const bridge=G.nearestBridgePoint?.(G.boss.x,G.boss.y,G.player.x,G.player.y,58);if(bridge){const ba=Math.atan2(bridge.y-G.boss.y,bridge.x-G.boss.x);G.moveEntity(G.boss,Math.cos(ba)*moveSpeed,Math.sin(ba)*moveSpeed,dt/1000);}else G.aiPathMove?.(G.boss,G.player.x,G.player.y,moveSpeed,dt);}}
  if(d<G.boss.r+G.player.r+12&&G.boss.attack<=0){G.damagePlayer(18+G.boss.phase*4);G.boss.attack=G.boss.phase===3?520:700}
  if(G.boss.shoot<=0){
    G.boss.shoot=G.boss.phase===3?620:G.boss.phase===2?900:1200;
    const count=G.boss.phase===3?5:G.boss.phase===2?3:1;
    const spread=G.boss.phase===3?.34:G.boss.phase===2?.22:0;
    for(let i=0;i<count;i++){const aa=count===1?a:a+(i-(count-1)/2)*spread;G.bullets.push({x:G.boss.x,y:G.boss.y,vx:Math.cos(aa)*360,vy:Math.sin(aa)*360,life:1800,damage:14+G.boss.phase*4,type:'enemy',pierce:1,hit:new Set()})}
  }
  if(G.boss.phase>=2&&G.boss.special<=0){
    G.boss.special=G.boss.phase===3?4200:5600;
    if(G.boss.phase===2){G.spawnRandomZombie();G.spawnRandomZombie();}
    else{
      // Phase 3: burst of reinforcements plus a radial danger ring.
      G.spawnRandomZombie();G.spawnRandomZombie();G.spawnRandomZombie();
      G.burnZones?.push({x:G.boss.x,y:G.boss.y,r:150,life:2200,damage:10});
      G.shake=Math.max(G.shake,2);
    }
  }
};



/* V7 Boss Character Pass — unique silhouette, core, wind-up and phase armor */
G.drawBoss=function(){
  const b=G.boss;if(!b)return;const ctx=G.ctx,now=performance.now(),r=b.r,phase=b.phase||1;
  const pulse=1+Math.sin(now*.008)*.055, wind=b.shoot>0?Math.max(0,1-Math.min(b.shoot/(phase===3?620:phase===2?900:1200),1)):0;
  ctx.save();ctx.translate(b.x,b.y);
  ctx.fillStyle='rgba(0,0,0,.44)';ctx.beginPath();ctx.ellipse(4,r*1.18,r*1.35,r*.42,0,0,Math.PI*2);ctx.fill();
  // Huge asymmetric silhouette: armored shoulders, heavy legs and a raised spinal crown.
  const body=ctx.createRadialGradient(-r*.3,-r*.35,4,r*.25,r*.35,r*1.45);body.addColorStop(0,b.flash>0?'#fff':phase===3?'#a62b30':'#78424c');body.addColorStop(.52,phase===3?'#76242b':'#4f3039');body.addColorStop(1,'#20171c');ctx.fillStyle=body;
  ctx.beginPath();ctx.moveTo(-r*.58,-r*.48);ctx.quadraticCurveTo(-r*.86,-r*.1,-r*.78,r*.65);ctx.quadraticCurveTo(-r*.55,r*1.02,0,r*1.08);ctx.quadraticCurveTo(r*.55,r*1.02,r*.78,r*.65);ctx.quadraticCurveTo(r*.86,-r*.1,r*.58,-r*.48);ctx.quadraticCurveTo(r*.35,-r*.9,0,-r*.72);ctx.quadraticCurveTo(-r*.35,-r*.9,-r*.58,-r*.48);ctx.fill();
  // Shoulder armor / torn cape.
  ctx.fillStyle=phase===3?'#4a1d25':'#343d42';ctx.beginPath();ctx.roundRect(-r*1.02,-r*.25,r*.72,r*.7,8);ctx.roundRect(r*.3,-r*.25,r*.72,r*.7,8);ctx.fill();
  ctx.strokeStyle='#aeb9ba';ctx.lineWidth=2;ctx.strokeRect(-r*.91,-r*.16,r*.48,r*.43);ctx.strokeRect(r*.43,-r*.16,r*.48,r*.43);
  ctx.fillStyle='#20292d';ctx.fillRect(-r*.72,r*.52,r*.34,r*.36);ctx.fillRect(r*.38,r*.52,r*.34,r*.36);
  // Head and horned crown, intentionally unlike any normal zombie.
  const hg=ctx.createRadialGradient(-r*.18,-r*.78,3,0,-r*.45,r*.7);hg.addColorStop(0,'#d17a73');hg.addColorStop(.62,'#8d3d45');hg.addColorStop(1,'#381c24');ctx.fillStyle=hg;ctx.beginPath();ctx.ellipse(0,-r*.63,r*.48,r*.58,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#171418';ctx.beginPath();ctx.moveTo(-r*.52,-r*.84);ctx.lineTo(-r*.92,-r*1.48);ctx.lineTo(-r*.18,-r*.98);ctx.lineTo(r*.12,-r*1.52);ctx.lineTo(r*.55,-r*.88);ctx.lineTo(r*.72,-r*1.32);ctx.lineTo(r*.7,-r*.5);ctx.closePath();ctx.fill();
  // Glowing eyes + mouth.
  const eye=phase===3?'#ff6b3e':phase===2?'#ffd04a':'#8ff3ff';ctx.shadowColor=eye;ctx.shadowBlur=16;ctx.fillStyle=eye;ctx.beginPath();ctx.ellipse(-r*.19,-r*.68,5,3,0,0,Math.PI*2);ctx.ellipse(r*.19,-r*.68,5,3,0,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
  ctx.fillStyle='#1b1217';ctx.beginPath();ctx.ellipse(0,-r*.39,r*.30,r*.18,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#e7c8bc';for(let i=-2;i<=2;i++)ctx.fillRect(i*r*.09,-r*.53,r*.035,r*.12);
  // Chest reactor: the boss's readable gameplay core.
  const coreR=(r*.22)*pulse*(phase===3?1.18:1);ctx.shadowColor=eye;ctx.shadowBlur=28;ctx.fillStyle=eye;ctx.beginPath();ctx.arc(0,r*.13,coreR,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
  ctx.strokeStyle='rgba(210,235,240,.55)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,r*.13,r*.34,0,Math.PI*2);ctx.stroke();
  // Arms: attack posture telegraphs the next strike.
  const raise=wind*(phase===3?.45:.3), armY=-r*.02-raise*r;
  ctx.strokeStyle=phase===3?'#7e292f':'#58323a';ctx.lineWidth=r*.27;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-r*.62,0);ctx.lineTo(-r*(1.12+raise),armY+r*.38);ctx.lineTo(-r*(1.32+raise),armY+r*.76);ctx.moveTo(r*.62,0);ctx.lineTo(r*(1.08+raise),armY+r*.48);ctx.lineTo(r*(1.30+raise),armY+r*.82);ctx.stroke();
  if(phase>=2){ctx.strokeStyle=phase===3?'rgba(255,70,50,.75)':'rgba(255,170,70,.65)';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,r*1.14*pulse,0,Math.PI*2);ctx.stroke();}
  if(phase===3){ctx.strokeStyle='rgba(255,55,45,.38)';ctx.lineWidth=5;ctx.beginPath();ctx.arc(0,0,r*1.38*pulse,0,Math.PI*2);ctx.stroke();}
  if(wind>.25){ctx.strokeStyle=eye;ctx.globalAlpha=.35+.3*wind;ctx.lineWidth=2;ctx.setLineDash([5,5]);ctx.beginPath();ctx.arc(0,0,r*(1.55+wind*.25),-Math.PI/2,-Math.PI/2+Math.PI*2*wind);ctx.stroke();ctx.setLineDash([]);}
  ctx.restore();
  const bw=190;ctx.fillStyle='rgba(12,16,18,.92)';ctx.fillRect(b.x-bw/2,b.y-r-42,bw,12);ctx.fillStyle=phase===3?'#f13e45':phase===2?'#efaa3f':'#c84a5a';ctx.fillRect(b.x-bw/2,b.y-r-42,bw*Math.max(0,b.hp/b.maxHp),12);ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font='bold 15px Arial';ctx.fillText('👑 OUTBREAK WARDEN · PHASE '+phase,b.x,b.y-r-50);
};
