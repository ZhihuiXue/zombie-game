// Auto-split from Zombie Outbreak V3.1. Gameplay intentionally unchanged in this refactor.
const G = globalThis;

G.startReload = function(){if(G.state!=='playing'||G.reloadTimer>0)return;const w=G.selectedWeapon;if((w===3||w===4||w===5)&&G.player.reserve[w]<=0){G.showMessage('NO AMMO · 去商店购买',900);G.playSound('error');return}G.reloadWeapon=w;G.reloadTimer=1000;G.showMessage('↻ RELOADING',700);G.playSound('reload')};

G.fireFlamethrower=function(){
  const w=G.weapons[4];
  if(G.player.reserve[4] < 0) G.player.reserve[4]=0;
  if(G.player.mag[4]<=0){G.startReload();return}
  const a=G.aim();
  G.adaptive?.recordShot(4);
  const now=performance.now();
  const range=285,cone=.32;

  // The flamethrower is a continuous stream: hold the mouse to keep spraying.
  // Fuel is consumed at a steady rate instead of behaving like ordinary bullets.
  const last=G.player.lastFlameFuel||0;
  if(now-last>=120){
    G.player.lastFlameFuel=now;
    G.player.mag[4]--;
    for(const z of G.spatialGrid.near(G.player.x+Math.cos(a)*170,G.player.y+Math.sin(a)*170,range)){
      if(z.hp<=0)continue;
      const dx=z.x-G.player.x,dy=z.y-G.player.y,d=Math.hypot(dx,dy)||1;
      let da=Math.atan2(dy,dx)-a;da=Math.atan2(Math.sin(da),Math.cos(da));
      if(d<range+z.r&&Math.abs(da)<cone){
        G.damageZombie(z,w.damage*G.player.damage*1.25);
        z.burnUntil=Math.max(z.burnUntil||0,now+5000*G.player.burnBoost);z.lastDamageSource='fire';
        z.burnTick=0;
        z.stun=Math.max(z.stun||0,55);
      }
    }
  }

  // Dense flame particles make the stream visually obvious.
  for(let i=0;i<5;i++){
    const ang=a+(Math.random()-.5)*cone*1.9;
    const dist=18+Math.random()*235;
    const speed=90+Math.random()*180;
    G.particles.push({
      x:G.player.x+Math.cos(ang)*(18+dist*.16), y:G.player.y+Math.sin(ang)*(18+dist*.16),
      vx:Math.cos(ang)*speed, vy:Math.sin(ang)*speed,
      life:180+Math.random()*260,
      color:Math.random()<.55?'#ff7a18':Math.random()<.7?'#ffbd35':'#fff0a0',
      size:4+Math.random()*7, flame:true
    });
  }
  G.player.recoil=Math.min(5,2.8);G.player.muzzle=90;G.shake=Math.max(G.shake,1.2);
  if(G.player.mag[4]<=0)G.startReload();G.metaAdd?.('fire',1);
  if(now-(G.player.lastFlameSound||0)>180){G.player.lastFlameSound=now;G.playSound('flame');}
};
G.shoot=function(){
if(G.state!=='playing'||G.reloadTimer>0)return;
const w=G.weapons[G.selectedWeapon];
if(G.player.adrenaline&&G.player.hp<G.player.maxHp*.35)G.fireTimer=0;
if(!G.owned[G.selectedWeapon]){G.showMessage('🔒 请在 Wave 商店购买',800);G.playSound('error');return}
if(G.selectedWeapon===4){G.fireFlamethrower();return}
if(G.player.mag[G.selectedWeapon]<=0){G.startReload();return}
const a=G.aim();G.adaptive?.recordShot(G.selectedWeapon);G.player.mag[G.selectedWeapon]--;if(G.player.mag[G.selectedWeapon]===0)G.startReload();
G.fireTimer=w.rate/G.player.fireRate;G.player.recoil=Math.min(10,2.5+(w.shots||1)*.7);G.player.muzzle=90;G.shake=Math.max(G.shake,w===5?5:w===3?4:2);
for(let i=0;i<w.shots;i++){const ang=a+(Math.random()-.5)*w.spread;G.bullets.push({x:G.player.x+Math.cos(ang)*22,y:G.player.y+Math.sin(ang)*22,vx:Math.cos(ang)*w.speed,vy:Math.sin(ang)*w.speed,life:900,damage:w.damage*G.player.damage*(G.selectedWeapon===5?G.player.sniperBoost:1),type:G.selectedWeapon,pierce:w.pierce||1,hit:new Set(),explosive:!!w.explosive})}
G.playSound(G.selectedWeapon===3?'shotgun':G.selectedWeapon===5?'sniper':G.selectedWeapon===2?'smg':'pistol');
};
