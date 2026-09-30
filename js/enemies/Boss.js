// Auto-split from Zombie Outbreak V3.1. Gameplay intentionally unchanged in this refactor.
const G = globalThis;

G.spawnBoss = function(){if(G.boss||G.state!=='playing')return;const p=G.spawnPoint();G.boss={x:p.x,y:p.y,r:58,hp:900+G.wave*180,maxHp:900+G.wave*180,attack:0,shoot:0,phase:1,flash:0};G.showMessage('👑 BOSS INCOMING!',2200);G.playSound('boss')};

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
  if(d>115)G.moveEntity(G.boss,Math.cos(a)*moveSpeed,Math.sin(a)*moveSpeed,dt/1000);
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

