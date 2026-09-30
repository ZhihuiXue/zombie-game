// Shared runtime/state for Zombie Outbreak V3.1 Modular. Gameplay values are unchanged.
const G = globalThis;

G.canvas = document.getElementById("game");
G.ctx = G.canvas.getContext("2d", {alpha:false});
G.W = innerWidth;
G.H = innerHeight;
G.dpr = 1;
G.keys = new Set();
G.mouse = {x:G.W/2,y:G.H/2,down:false};

G.ui = {
  hpText:document.getElementById("hpText"), hpBar:document.getElementById("hpBar"),
  xpText:document.getElementById("xpText"), xpBar:document.getElementById("xpBar"),
  stats:document.getElementById("stats"), weaponText:document.getElementById("weaponText"),
  ammoText:document.getElementById("ammoText"), dashText:document.getElementById("dashText"),
  grenadeText:document.getElementById("grenadeText"), message:document.getElementById("message"),
  achievement:document.getElementById("achievement"), levelPanel:document.getElementById("levelPanel"),
  levelCards:document.getElementById("levelCards"), shopPanel:document.getElementById("shopPanel"),
  shopTimer:document.getElementById("shopTimer"), shopGrid:document.getElementById("shopGrid"),
  startNext:document.getElementById("startNext"), gameOverPanel:document.getElementById("gameOverPanel"),
  gameOverStats:document.getElementById("gameOverStats"), menuPanel:document.getElementById("menuPanel"),
  soundBtn:document.getElementById("soundBtn")
};

G.WORLD = {w:2600,h:1800};
G.state='menu'; G.wave=1; G.waveKills=0; G.waveTotal=0; G.waveTransition=false; G.shopUntil=0;
G.endless=false; G.score=0; G.coins=0; G.kills=0;
G.totalKills=Number(localStorage.getItem('zo_kills')||0); G.dna=Number(localStorage.getItem('zo_dna')||0);
G.level=1; G.xp=0; G.xpNeed=100; G.spawnTimer=0; G.last=performance.now();
G.camera={x:0,y:0}; G.shake=0; G.messageUntil=0; G.selectedWeapon=1;
G.particles=[]; G.bullets=[]; G.zombies=[]; G.drops=[]; G.texts=[]; G.walls=[]; G.grenades=[]; G.burnZones=[]; G.powerups=[]; G.boss=null;
G.dashTimer=0; G.attackTimer=0; G.reloadTimer=0; G.fireTimer=0; G.invuln=0; G.playTime=0; G.phase=1; G.achievementTimer=0;
G.audioCtx=null; G.masterGain=null; G.soundOn=true; G.reloadWeapon=0;
G.uiTick=0; G.uiInterval=100; G.vignette=null; G.vignetteW=0; G.vignetteH=0; G.killSaveTimer=0;

G.player={x:1300,y:900,r:17,hp:100,maxHp:100,speed:250,damage:1,fireRate:1,moveBoost:1,burnBoost:1,dashCooldown:0,dashTime:0,meleeDamage:42,grenades:3,mag:{1:12,2:30,3:6,4:24,5:5},maxMag:{1:12,2:30,3:6,4:24,5:5},reserve:{1:Infinity,2:Infinity,3:0,4:Infinity,5:0},maxReserve:{1:Infinity,2:Infinity,3:36,4:Infinity,5:15}};
G.weapons={
1:{name:'Pistol',rate:260,damage:22,spread:.035,shots:1,speed:900,color:'#e8e0c5'},
2:{name:'SMG',rate:85,damage:11,spread:.11,shots:1,speed:1000,color:'#d7e8e0'},
3:{name:'Shotgun',rate:650,damage:11,spread:.24,shots:7,speed:820,color:'#f2d9a3'},
4:{name:'Flamethrower',rate:90,damage:2,spread:.20,shots:1,speed:450,color:'#ff8b28',range:330},
5:{name:'Sniper',rate:1200,damage:75,spread:.008,shots:1,speed:1400,color:'#8fc9ff',pierce:2}
};
G.owned={1:true,2:true,3:true,4:false,5:false};
G.upgrades=[
['damage','💥 伤害 +15%','所有武器伤害提高 15%'],['rate','⚡ 攻速 +12%','射击间隔缩短 12%'],['hp','❤️ 最大 HP +20','立即回复 20 HP'],['speed','🏃 移速 +12%','移动速度提高 12%'],['burn','🔥 燃烧强化','灼烧伤害 +50%，持续时间 +35%'],['coins','💰 金币 +20%','击杀获得更多金币'],['dash','⚡ 冲刺强化','Dash 冷却减少 25%'],['melee','⚔️ 近战强化','近战伤害 +20%']];

G.resize=function(){G.dpr=Math.min(devicePixelRatio||1,2);G.W=innerWidth;G.H=innerHeight;G.canvas.width=G.W*G.dpr;G.canvas.height=G.H*G.dpr;G.canvas.style.width=G.W+'px';G.canvas.style.height=G.H+'px';G.ctx.setTransform(G.dpr,0,0,G.dpr,0,0);G.vignette=null;G.vignetteW=0;G.vignetteH=0;};
G.showMessage=function(t,ms=1200){G.ui.message.textContent=t;G.ui.message.style.opacity=1;clearTimeout(G.showMessage.timer);G.showMessage.timer=setTimeout(()=>G.ui.message.style.opacity=0,ms)};

export {G};

// Game flow/runtime orchestration. Kept here so the feature modules above can
// stay focused on their own systems while preserving the original gameplay.
G.resetGame=function(){
  G.state='playing';G.wave=1;G.waveKills=0;G.waveTotal=0;G.waveTransition=false;G.shopUntil=0;
  G.score=0;G.coins=0;G.kills=0;G.level=1;G.xp=0;G.xpNeed=100;G.spawnTimer=0;
  G.particles=[];G.bullets=[];G.zombies=[];G.drops=[];G.texts=[];G.grenades=[];G.burnZones=[];G.powerups=[];G.boss=null;
  G.selectedWeapon=1;G.owned={1:true,2:true,3:true,4:false,5:false};
  Object.assign(G.player,{x:1300,y:900,hp:100,maxHp:100,speed:250,damage:1,fireRate:1,moveBoost:1,burnBoost:1,dashCooldown:0,dashTime:0,meleeDamage:42,grenades:3});
  for(const k in G.player.mag)G.player.mag[k]=G.player.maxMag[k];
  G.player.reserve[3]=0;G.player.reserve[5]=0;G.walls=[];G.makeMap();
  G.ui.menuPanel.classList.add('hidden');G.ui.gameOverPanel.classList.add('hidden');G.ui.shopPanel.classList.add('hidden');G.ui.levelPanel.classList.add('hidden');
  G.startWave();
};

G.startWave=function(){
  if(G.state!=='playing')return;
  G.waveKills=0;G.waveTotal=G.endless?12+Math.floor(G.wave*3.5):10+G.wave*3;G.spawnTimer=650;G.phase=1;
  G.showMessage((G.wave%5===0?'👑 BOSS WAVE ':'🌊 WAVE ')+G.wave,1800);
  if(G.wave%5===0)setTimeout(()=>{if(G.state==='playing')G.spawnBoss()},900);
};
G.startShop=function(){G.state='shop';G.shopUntil=performance.now()+7000;G.ui.shopPanel.classList.remove('hidden');G.renderShop()};
G.toggleShop=function(){if(G.state==='shop')return;if(G.waveTransition)G.startShop()};
G.endWave=function(){if(G.waveTransition)return;G.waveTransition=true;G.coins+=50;G.showMessage('🎉 WAVE COMPLETE +$50',1600);setTimeout(()=>{if(G.state==='playing')G.startShop()},1700)};

G.updateBullets=function(dt){
  for(const b of G.bullets){
    b.x+=b.vx*dt/1000;b.y+=b.vy*dt/1000;b.life-=dt;
    if(G.blocked(b.x,b.y,3))b.life=0;
    for(const z of G.zombies){
      if(b.life<=0)break;if(z.hp<=0||b.hit.has(z))continue;
      if(Math.hypot(b.x-z.x,b.y-z.y)<z.r+5){b.hit.add(z);G.damageZombie(z,b.damage);if(b.type===4){z.burnUntil=performance.now()+5000*G.player.burnBoost;z.burnTick=0}if(--b.pierce<=0)b.life=0}
    }
    if(b.life>0&&G.boss&&Math.hypot(b.x-G.boss.x,b.y-G.boss.y)<G.boss.r+5){if(!b.hit.has(G.boss)){b.hit.add(G.boss);G.boss.hp-=b.damage;if(b.type!==5)b.life=0}}
  }
  let bw=0;for(let bi=0;bi<G.bullets.length;bi++){const b=G.bullets[bi];if(b.life>0)G.bullets[bw++]=b;}G.bullets.length=bw;
};

G.update=function(dt){
  if(G.state==='menu'||G.state==='gameover')return;
  if(G.state==='shop'){
    G.ui.shopTimer.textContent='下一波准备：'+Math.max(0,Math.ceil((G.shopUntil-performance.now())/1000))+' 秒';
    if(performance.now()>G.shopUntil){G.state='playing';G.ui.shopPanel.classList.add('hidden');G.wave++;G.waveTransition=false;G.startWave()}
    return;
  }
  if(G.state==='level')return;
  G.playTime+=dt;G.killSaveTimer+=dt;G.invuln=Math.max(0,G.invuln-dt);G.attackTimer=Math.max(0,G.attackTimer-dt);G.fireTimer=Math.max(0,G.fireTimer-dt);G.dashTimer=Math.max(0,G.dashTimer-dt);
  if(G.reloadTimer>0){G.reloadTimer-=dt;if(G.reloadTimer<=0){const w=G.reloadWeapon||G.selectedWeapon;const need=G.player.maxMag[w]-G.player.mag[w];if(w===3||w===5){const take=Math.min(need,G.player.reserve[w]);G.player.mag[w]+=take;G.player.reserve[w]-=take}else G.player.mag[w]=G.player.maxMag[w]}}
  if(G.keys.has('shift')&&!G.keys._shiftUsed){G.keys._shiftUsed=true;G.dash()}if(!G.keys.has('shift'))G.keys._shiftUsed=false;
  if(G.keys.has(' ')&&!G.keys._spaceUsed){G.keys._spaceUsed=true;G.melee()}if(!G.keys.has(' '))G.keys._spaceUsed=false;
  if(G.keys.has('1'))G.selectedWeapon=1;if(G.keys.has('2'))G.selectedWeapon=2;if(G.keys.has('3'))G.selectedWeapon=3;if(G.keys.has('4'))G.selectedWeapon=4;if(G.keys.has('5'))G.selectedWeapon=5;
  let mx=(G.keys.has('d')||G.keys.has('arrowright')?1:0)-(G.keys.has('a')||G.keys.has('arrowleft')?1:0),my=(G.keys.has('s')||G.keys.has('arrowdown')?1:0)-(G.keys.has('w')||G.keys.has('arrowup')?1:0),l=Math.hypot(mx,my)||1;
  if(G.player.dashTime>0){G.player.dashTime-=dt;G.moveEntity(G.player,G.player._dx*700,G.player._dy*700,dt/1000)}else if(mx||my)G.moveEntity(G.player,mx/l*G.player.speed*G.player.moveBoost,my/l*G.player.speed*G.player.moveBoost,dt/1000);
  if(G.mouse.down&&G.fireTimer<=0)G.shoot();
  G.spawnTimer-=dt;if(!G.waveTransition&&G.waveKills<G.waveTotal&&G.spawnTimer<=0){G.spawnRandomZombie();G.spawnTimer=Math.max(420,900-G.wave*18)}
  if(!G.waveTransition&&G.waveKills>=G.waveTotal&&G.zombies.length===0&&!G.boss)G.endWave();
  G.updateBullets(dt);G.updateZombies(dt);G.updateBoss(dt);G.updateGrenades(dt);G.updateDrops(dt);G.updatePowerups(dt);G.updateParticles(dt);G.updateTexts(dt);
  if(G.killSaveTimer>=5000){localStorage.setItem('zo_kills',G.totalKills);G.killSaveTimer=0;}
  if(G.shake>0)G.shake=Math.max(0,G.shake-dt);
  G.camera.x=Math.max(0,Math.min(G.WORLD.w-G.W,G.player.x-G.W/2));G.camera.y=Math.max(0,Math.min(G.WORLD.h-G.H,G.player.y-G.H/2));
};
G.loop=function(ts){const dt=Math.min(40,ts-G.last);G.last=ts;G.update(dt);G.draw();requestAnimationFrame(G.loop)};
