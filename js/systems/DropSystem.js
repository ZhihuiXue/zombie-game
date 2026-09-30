// Auto-split from Zombie Outbreak V3.1. Gameplay intentionally unchanged in this refactor.
const G = globalThis;

G.updateDrops = function(dt){for(const d of G.drops){d.life-=dt;if(Math.hypot(d.x-G.player.x,d.y-G.player.y)<28){if(d.type==='hp')G.player.hp=Math.min(G.player.maxHp,G.player.hp+25);if(d.type==='grenade')G.player.grenades++;if(d.type==='coin')G.coins+=30;if(d.type==='ammo'){if(G.selectedWeapon===3)G.player.reserve[3]=Math.min(G.player.maxReserve[3],G.player.reserve[3]+6);else if(G.selectedWeapon===5)G.player.reserve[5]=Math.min(G.player.maxReserve[5],G.player.reserve[5]+2);else G.player.mag[G.selectedWeapon]=G.player.maxMag[G.selectedWeapon];G.playSound('pickup')}d.life=0}}G.drops=G.drops.filter(d=>d.life>0)};

G.updatePowerups = function(dt){for(const p of G.powerups){p.life-=dt;if(Math.hypot(p.x-G.player.x,p.y-G.player.y)<30){p.life=0;if(p.type==='heal')G.player.hp=Math.min(G.player.maxHp,G.player.hp+45);if(p.type==='rage')G.player.fireRate*=1.35,setTimeout(()=>G.player.fireRate/=1.35,10000);if(p.type==='freeze')for(const z of G.zombies)z.stun=5000;if(p.type==='insta')for(const z of G.zombies)if(z.type==='normal'||z.type==='fast'||z.type==='hunter')G.damageZombie(z,99999);G.showMessage('⚡ POWER-UP!',900)}}G.powerups=G.powerups.filter(p=>p.life>0)};

G.updateParticles = function(dt){for(const p of G.particles){p.x+=p.vx*dt/1000;p.y+=p.vy*dt/1000;p.vx*=.98;p.vy*=.98;p.life-=dt}G.particles=G.particles.filter(p=>p.life>0)};

G.updateTexts = function(dt){for(const t of G.texts){t.y-=18*dt/1000;t.life-=dt}G.texts=G.texts.filter(t=>t.life>0)};

G.updateGrenades = function(dt){for(const g of G.grenades){g.x+=g.vx*dt/1000;g.y+=g.vy*dt/1000;g.vx*=.985;g.vy*=.985;g.life-=dt;if(g.life<=0){G.playSound('explosion');for(const z of G.zombies)if(Math.hypot(z.x-g.x,z.y-g.y)<145)G.damageZombie(z,110*G.player.damage);for(let i=0;i<24;i++)G.particles.push({x:g.x,y:g.y,vx:(Math.random()-.5)*260,vy:(Math.random()-.5)*260,life:550,color:'#ffad43',size:3+Math.random()*4})}}G.grenades=G.grenades.filter(g=>g.life>0)};

