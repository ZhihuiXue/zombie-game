// Auto-split from Zombie Outbreak V3.1. Gameplay intentionally unchanged in this refactor.
const G = globalThis;

G.startReload = function(){if(G.state!=='playing'||G.reloadTimer>0)return;const w=G.selectedWeapon;if((w===3||w===4||w===5)&&G.player.reserve[w]<=0){G.showMessage('NO AMMO · 去商店购买',900);G.playSound('error');return}G.reloadWeapon=w;G.reloadTimer=1000;G.showMessage('↻ RELOADING',700);G.playSound('reload')};

G.shoot = function(){
if(G.state!=='playing'||G.reloadTimer>0)return;
const w=G.weapons[G.selectedWeapon];
if(!G.owned[G.selectedWeapon]){G.showMessage('🔒 请在 Wave 商店购买',800);G.playSound('error');return}
if(G.player.mag[G.selectedWeapon]<=0){G.startReload();return}
const a=G.aim();G.player.mag[G.selectedWeapon]--;if(G.player.mag[G.selectedWeapon]===0)G.startReload();
G.fireTimer=w.rate/G.player.fireRate;G.player.recoil=Math.min(10,2.5+(w.shots||1)*.7);G.player.muzzle=90;G.shake=Math.max(G.shake,w===5?5:w===3?4:2);
for(let i=0;i<w.shots;i++){const ang=a+(Math.random()-.5)*w.spread;G.bullets.push({x:G.player.x+Math.cos(ang)*22,y:G.player.y+Math.sin(ang)*22,vx:Math.cos(ang)*w.speed,vy:Math.sin(ang)*w.speed,life:900,damage:w.damage*G.player.damage,type:G.selectedWeapon,pierce:w.pierce||1,hit:new Set()})}
if(G.selectedWeapon===4){for(let i=0;i<5;i++){const ang=a+(Math.random()-.5)*.45;G.bullets.push({x:G.player.x,y:G.player.y,vx:Math.cos(ang)*450,vy:Math.sin(ang)*450,life:700,damage:2*G.player.damage,type:4,pierce:99,hit:new Set()})}}
G.playSound(G.selectedWeapon===3?'shotgun':G.selectedWeapon===5?'sniper':G.selectedWeapon===4?'flame':G.selectedWeapon===2?'smg':'pistol');
};

