// Auto-split from Zombie Outbreak V3.1. Gameplay intentionally unchanged in this refactor.
const G = globalThis;

G.startReload = function(){if(G.state!=='playing'||G.reloadTimer>0)return;const w=G.selectedWeapon;if((w===3||w===4||w===5)&&G.player.reserve[w]<=0){G.showMessage('NO AMMO · 去商店购买',900);G.playSound('error');return}G.reloadWeapon=w;G.reloadTimer=1000;G.showMessage('↻ RELOADING',700);G.playSound('reload')};

G.fireFlamethrower=function(){
  const w=G.weapons[4];
  if(G.player.mag[4]<=0){G.startReload();return}
  const a=G.aim();G.player.mag[4]--;G.fireTimer=w.rate/G.player.fireRate;G.player.recoil=Math.min(6,3.2);G.player.muzzle=100;G.shake=Math.max(G.shake,1.5);
  const range=330,cone=.43;
  for(const z of G.spatialGrid.near(G.player.x+Math.cos(a)*165,G.player.y+Math.sin(a)*165,range)){
    if(z.hp<=0)continue;const dx=z.x-G.player.x,dy=z.y-G.player.y,d=Math.hypot(dx,dy)||1;let da=Math.atan2(dy,dx)-a;da=Math.atan2(Math.sin(da),Math.cos(da));
    if(d<range+z.r&&Math.abs(da)<cone){G.damageZombie(z,w.damage*G.player.damage*1.15);z.burnUntil=performance.now()+5000*G.player.burnBoost;z.burnTick=0;z.stun=Math.max(z.stun||0,35)}
  }
  for(let i=0;i<10;i++){const ang=a+(Math.random()-.5)*cone*1.8,dist=30+Math.random()*280;G.particles.push({x:G.player.x+Math.cos(ang)*dist,y:G.player.y+Math.sin(ang)*dist,vx:Math.cos(ang)*(80+Math.random()*130),vy:Math.sin(ang)*(80+Math.random()*130),life:220+Math.random()*280,color:Math.random()<.5?'#ff9a2e':'#ffe36e',size:3+Math.random()*5,flame:true})}
  if(G.player.mag[4]===0)G.startReload();G.playSound('flame');
};
G.shoot=function(){
if(G.state!=='playing'||G.reloadTimer>0)return;
const w=G.weapons[G.selectedWeapon];
if(!G.owned[G.selectedWeapon]){G.showMessage('🔒 请在 Wave 商店购买',800);G.playSound('error');return}
if(G.selectedWeapon===4){G.fireFlamethrower();return}
if(G.player.mag[G.selectedWeapon]<=0){G.startReload();return}
const a=G.aim();G.player.mag[G.selectedWeapon]--;if(G.player.mag[G.selectedWeapon]===0)G.startReload();
G.fireTimer=w.rate/G.player.fireRate;G.player.recoil=Math.min(10,2.5+(w.shots||1)*.7);G.player.muzzle=90;G.shake=Math.max(G.shake,w===5?5:w===3?4:2);
for(let i=0;i<w.shots;i++){const ang=a+(Math.random()-.5)*w.spread;G.bullets.push({x:G.player.x+Math.cos(ang)*22,y:G.player.y+Math.sin(ang)*22,vx:Math.cos(ang)*w.speed,vy:Math.sin(ang)*w.speed,life:900,damage:w.damage*G.player.damage,type:G.selectedWeapon,pierce:w.pierce||1,hit:new Set()})}
G.playSound(G.selectedWeapon===3?'shotgun':G.selectedWeapon===5?'sniper':G.selectedWeapon===2?'smg':'pistol');
};
