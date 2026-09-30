// Auto-split from Zombie Outbreak V3.1. Gameplay intentionally unchanged in this refactor.
const G = globalThis;

G.updateDrops = function(dt){for(const d of G.drops){d.life-=dt;if(Math.hypot(d.x-G.player.x,d.y-G.player.y)<28){if(d.type==='hp')G.player.hp=Math.min(G.player.maxHp,G.player.hp+25);if(d.type==='grenade')G.player.grenades++;if(d.type==='coin')G.coins+=30;if(d.type==='ammo'){if(G.selectedWeapon===4&&G.owned[4])G.player.reserve[4]=Math.min(G.player.maxReserve[4],G.player.reserve[4]+12);else if(G.selectedWeapon===3)G.player.reserve[3]=Math.min(G.player.maxReserve[3],G.player.reserve[3]+6);else if(G.selectedWeapon===5)G.player.reserve[5]=Math.min(G.player.maxReserve[5],G.player.reserve[5]+2);else G.player.mag[G.selectedWeapon]=G.player.maxMag[G.selectedWeapon];G.playSound('pickup')}d.life=0}}let dw=0;for(let di=0;di<G.drops.length;di++){const d=G.drops[di];if(d.life>0)G.drops[dw++]=d;}G.drops.length=dw};

G.updatePowerups = function(dt){for(const p of G.powerups){p.life-=dt;if(Math.hypot(p.x-G.player.x,p.y-G.player.y)<30){p.life=0;if(p.type==='heal')G.player.hp=Math.min(G.player.maxHp,G.player.hp+45);if(p.type==='rage')G.player.fireRate*=1.35,setTimeout(()=>G.player.fireRate/=1.35,10000);if(p.type==='freeze')for(const z of G.zombies)z.stun=5000;if(p.type==='insta')for(const z of G.zombies)if(z.type==='normal'||z.type==='fast'||z.type==='hunter')G.damageZombie(z,99999);G.showMessage('⚡ POWER-UP!',900)}}let pw=0;for(let pi=0;pi<G.powerups.length;pi++){const p=G.powerups[pi];if(p.life>0)G.powerups[pw++]=p;}G.powerups.length=pw};

G.updateParticles = function(dt){for(const p of G.particles){p.x+=p.vx*dt/1000;p.y+=p.vy*dt/1000;p.vx*=.98;p.vy*=.98;p.life-=dt}let prw=0;for(let pri=0;pri<G.particles.length;pri++){const p=G.particles[pri];if(p.life>0)G.particles[prw++]=p;}G.particles.length=prw};

G.updateTexts = function(dt){for(const t of G.texts){t.y-=18*dt/1000;t.life-=dt}let tw=0;for(let ti=0;ti<G.texts.length;ti++){const t=G.texts[ti];if(t.life>0)G.texts[tw++]=t;}G.texts.length=tw};

G.explodeGrenade = function(g){
  G.playSound('explosion');
  for(const z of G.zombies)if(Math.hypot(z.x-g.x,z.y-g.y)<145)G.damageZombie(z,110*G.player.damage);
  if(G.boss&&Math.hypot(G.boss.x-g.x,G.boss.y-g.y)<145)G.boss.hp-=110*G.player.damage;
  for(let i=0;i<24;i++)G.particles.push({x:g.x,y:g.y,vx:(Math.random()-.5)*260,vy:(Math.random()-.5)*260,life:550,color:'#ffad43',size:3+Math.random()*4});
};

G.updateGrenades = function(dt){
  for(const g of G.grenades){
    g.x+=g.vx*dt/1000;g.y+=g.vy*dt/1000;g.vx*=.985;g.vy*=.985;g.life-=dt;
    let hitEnemy=G.boss&&Math.hypot(g.x-G.boss.x,g.y-G.boss.y)<G.boss.r+7;
    if(!hitEnemy)for(const z of G.zombies){if(z.hp>0&&Math.hypot(g.x-z.x,g.y-z.y)<z.r+7){hitEnemy=true;break}}
    if(hitEnemy||G.blocked(g.x,g.y,5)||g.life<=0){G.explodeGrenade(g);g.life=0}
  }
  let gw=0;for(let gi=0;gi<G.grenades.length;gi++){const g=G.grenades[gi];if(g.life>0)G.grenades[gw++]=g;}G.grenades.length=gw
};

