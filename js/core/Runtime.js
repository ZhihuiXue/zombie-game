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
  achievement:document.getElementById("achievement"),
  dnaPanel:document.getElementById("dnaPanel"),dnaText:document.getElementById("dnaText"),dnaGrid:document.getElementById("dnaGrid"),
  enemyIntro:document.getElementById("enemyIntro"),enemyIntroWave:document.getElementById("enemyIntroWave"),enemyIntroIcon:document.getElementById("enemyIntroIcon"),enemyIntroName:document.getElementById("enemyIntroName"),enemyIntroDesc:document.getElementById("enemyIntroDesc"),enemyIntroDont:document.getElementById("enemyIntroDismiss"), levelPanel:document.getElementById("levelPanel"),
  levelCards:document.getElementById("levelCards"), shopPanel:document.getElementById("shopPanel"),
  shopTimer:document.getElementById("shopTimer"), shopGrid:document.getElementById("shopGrid"),
  startNext:document.getElementById("startNext"), gameOverPanel:document.getElementById("gameOverPanel"),
  gameOverStats:document.getElementById("gameOverStats"), menuPanel:document.getElementById("menuPanel"),
  soundBtn:document.getElementById("soundBtn"),profilePanel:document.getElementById("profilePanel"),profileGrid:document.getElementById("profileGrid"),profileSummary:document.getElementById("profileSummary"),profileNameInput:document.getElementById("profileNameInput"),equipmentPanel:document.getElementById("equipmentPanel"),equipmentGrid:document.getElementById("equipmentGrid"),codexPanel:document.getElementById("codexPanel"),codexGrid:document.getElementById("codexGrid"),controlsPanel:document.getElementById("controlsPanel"),controlsGrid:document.getElementById("controlsGrid"),buildPanel:document.getElementById("buildPanel"),buildText:document.getElementById("buildText"),buildGrid:document.getElementById("buildGrid"),achievementPanel:document.getElementById("achievementPanel"),achievementGrid:document.getElementById("achievementGrid")
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
G.introDismissed=JSON.parse(localStorage.getItem('zo_intro_dismissed')||'{}');G.introAfter=null;G.dnaLevels=G.dnaLevels||{};
G.uiTick=0; G.uiInterval=100; G.mapTheme='grassland';G.waterRects=[];G.bridges=[];G.trees=[];G.rocks=[]; G.currentEvent=null; G.eventUntil=0; G.weather=null; G.weatherTime=0; G.combo=0; G.comboTimer=0; G.weaponXP=0; G.vignette=null; G.vignetteW=0; G.vignetteH=0; G.killSaveTimer=0;

G.player={x:1300,y:900,r:17,hp:100,maxHp:100,speed:250,damage:1,fireRate:1,moveBoost:1,burnBoost:1,dashCooldown:0,dashTime:0,meleeDamage:42,grenades:3,recoil:0,muzzle:0,flameTick:0,damageReduction:0,critChance:0,lifeSteal:0,coinBoost:1,xpBoost:1,grenadeRadius:145,grenadeDamage:110,adrenaline:false,sniperBoost:1,shield:0,mag:{1:12,2:30,3:6,4:24,5:5},maxMag:{1:12,2:30,3:6,4:24,5:5},reserve:{1:Infinity,2:Infinity,3:0,4:0,5:0},maxReserve:{1:Infinity,2:Infinity,3:36,4:96,5:15}};
G.baseWeapons={1:{name:'Pistol',rate:260,damage:22,spread:.035,shots:1,speed:900,color:'#e8e0c5'},2:{name:'SMG',rate:85,damage:11,spread:.11,shots:1,speed:1000,color:'#d7e8e0'},3:{name:'Shotgun',rate:650,damage:11,spread:.24,shots:7,speed:820,color:'#f2d9a3'},4:{name:'Flamethrower',rate:90,damage:2,spread:.20,shots:1,speed:450,color:'#ff8b28',range:285},5:{name:'Sniper',rate:1200,damage:75,spread:.008,shots:1,speed:1400,color:'#8fc9ff',pierce:2}};
G.weapons={
1:{name:'Pistol',rate:260,damage:22,spread:.035,shots:1,speed:900,color:'#e8e0c5'},
2:{name:'SMG',rate:85,damage:11,spread:.11,shots:1,speed:1000,color:'#d7e8e0'},
3:{name:'Shotgun',rate:650,damage:11,spread:.24,shots:7,speed:820,color:'#f2d9a3'},
4:{name:'Flamethrower',rate:90,damage:2,spread:.20,shots:1,speed:450,color:'#ff8b28',range:285},
5:{name:'Sniper',rate:1200,damage:75,spread:.008,shots:1,speed:1400,color:'#8fc9ff',pierce:2}
};
G.owned={1:true,2:true,3:true,4:false,5:false};
G.upgrades=[
['damage','💥 伤害 +15%','所有武器伤害提高 15%'],['rate','⚡ 攻速 +12%','射击间隔缩短 12%'],['hp','❤️ 最大 HP +20','立即回复 20 HP'],['speed','🏃 移速 +12%','移动速度提高 12%'],['burn','🔥 燃烧强化','灼烧伤害 +50%，持续时间 +35%'],['coins','💰 金币 +20%','击杀获得更多金币'],['dash','⚡ 冲刺强化','Dash 冷却减少 25%'],['melee','⚔️ 近战强化','近战伤害 +20%']];

G.resize=function(){G.dpr=Math.min(devicePixelRatio||1,2);G.W=innerWidth;G.H=innerHeight;G.canvas.width=G.W*G.dpr;G.canvas.height=G.H*G.dpr;G.canvas.style.width=G.W+'px';G.canvas.style.height=G.H+'px';G.ctx.setTransform(G.dpr,0,0,G.dpr,0,0);G.vignette=null;G.vignetteW=0;G.vignetteH=0;};
G.showMessage=function(t,ms=1200){G.ui.message.textContent=t;G.ui.message.style.opacity=1;clearTimeout(G.showMessage.timer);G.showMessage.timer=setTimeout(()=>G.ui.message.style.opacity=0,ms)};

// Terrain movement is provided by world/WorldCollision.js.

export {G};

// Game flow/runtime orchestration. Kept here so the feature modules above can
// stay focused on their own systems while preserving the original gameplay.
G.findSafePlayerSpawn=function(){
  const cx=G.WORLD.w/2, cy=G.WORLD.h/2;
  const candidates=[
    [cx,cy],[cx-180,cy],[cx+180,cy],[cx,cy-160],[cx,cy+160],
    [cx-240,cy-180],[cx+240,cy-180],[cx-240,cy+180],[cx+240,cy+180]
  ];
  for(const [x,y] of candidates){if(!G.entityBlocked?.(x,y,G.player.r+4)){G.player.x=x;G.player.y=y;return true;}}
  for(let i=0;i<500;i++){
    const x=80+Math.random()*(G.WORLD.w-160),y=80+Math.random()*(G.WORLD.h-160);
    if(!G.entityBlocked?.(x,y,G.player.r+4)){G.player.x=x;G.player.y=y;return true;}
  }
  G.player.x=cx;G.player.y=cy;return false;
};

G.resetGame=function(){
  G.state='playing';G.wave=1;G.waveKills=0;G.waveTotal=0;G.waveTransition=false;G.shopUntil=0;G.weather=null;G.weatherTime=0;
  G.score=0;G.coins=0;G.kills=0;G.adaptive?.reset();G.level=1;G.combo=0;G.equipmentSynergiesApplied={};G.comboTimer=0;G.weaponXP=0;G.currentEvent=null;G.eventUntil=0;G.equipmentOwned=[];G.equipmentSlots={head:null,body:null,boots:null,module:null,artifact:null};G.weaponLevel={1:1,2:1,3:1,4:1,5:1};G.evolved={};G.mapTheme='grassland';G.xp=0;G.xpNeed=100;G.spawnTimer=0;
  G.particles=[];G.bullets=[];G.zombies=[];G.drops=[];G.texts=[];G.grenades=[];G.burnZones=[];G.powerups=[];G.boss=null;
  G.selectedWeapon=1;G.weapons=JSON.parse(JSON.stringify(G.baseWeapons));G.owned={1:true,2:true,3:true,4:false,5:false};
  Object.assign(G.player,{x:1300,y:900,hp:100,maxHp:100,speed:250,damage:1,fireRate:1,moveBoost:1,burnBoost:1,dashCooldown:0,dashTime:0,meleeDamage:42,grenades:3,flameTick:0,damageReduction:0,critChance:0,lifeSteal:0,coinBoost:1,xpBoost:1,grenadeRadius:145,grenadeDamage:110,adrenaline:false,sniperBoost:1,shield:0});
  G.player.hitFlash=0;G.player.dashFx=0;G.damageFlash=0;G.player.maxMag={1:12,2:30,3:6,4:24,5:5};G.player.mag={1:12,2:30,3:6,4:24,5:5};G.player.reserve={1:Infinity,2:Infinity,3:0,4:0,5:0};G.player.maxReserve={1:Infinity,2:Infinity,3:36,4:96,5:15};G.player.lastFlameFuel=0;G.player.lastFlameSound=0;
  if(G.applyDNABonuses)G.applyDNABonuses(); if(G.applyEquipment)G.applyEquipment();
  for(const k in G.player.mag)G.player.mag[k]=G.player.maxMag[k];
  G.player.reserve[3]=0;G.player.reserve[4]=0;G.player.reserve[5]=0;G.walls=[];G.generateWorld?.();G.findSafePlayerSpawn?.();
  G.ui.menuPanel.classList.add('hidden');G.ui.gameOverPanel.classList.add('hidden');G.saveActiveProfile?.();G.ui.shopPanel.classList.add('hidden');G.ui.levelPanel.classList.add('hidden');
  G.startWave();
};

G.startWave=function(){
  if(G.state!=='playing')return;
  G.recordEquipmentUnlocks?.(G.wave);
  G.waveKills=0;G.waveTotal=G.endless?Math.min(36,10+Math.floor(G.wave*2.2)):Math.min(28,8+Math.floor(G.wave*1.8));G.spawnTimer=850;G.generateWorld?.();G.findSafePlayerSpawn?.();G.phase=1;if(G.startEvent)G.startEvent();if(G.startWeather)G.startWeather();G.adaptive?.startWave();if(G.player.shield&&G.equipmentHas?.('shield'))G.player.shield=30;
  const begin=()=>{G.showMessage((G.wave%5===0?'👑 BOSS WAVE ':'🌊 WAVE ')+G.wave,1800);if(G.wave%5===0)setTimeout(()=>{if(G.state==='playing')G.spawnBoss()},900)};
  begin();
};
G.startShop=function(){G.state='shop';G.shopUntil=Infinity;G.ui.shopPanel.classList.remove('hidden');G.ui.shopTimer.textContent='准备完成后，点击“开始下一波”继续';G.renderShop()};
G.startNextWave=function(){
  if(G.state!=='shop')return;
  // Fully release the shop state before starting the next run segment.
  G.ui.shopPanel.classList.add('hidden');
  G.wave++;
  G.waveTransition=false;
  G.state='playing';
  G.spawnTimer=450;
  G.reloadTimer=0;
  G.reloadWeapon=0;
  G.attackTimer=0;
  G.fireTimer=0;
  G.mouse.down=false;
  G.keys._shiftUsed=false;
  G.keys._spaceUsed=false;
  G.startWave();
  // Safety net: a next wave must never remain idle because of a stale transition flag.
  G.state='playing';
  G.waveTransition=false;
};
G.toggleShop=function(){if(G.state==='shop')return;if(G.waveTransition)G.startShop()};
G.endWave=function(){if(G.waveTransition)return;G.waveTransition=true;G.coins+=Math.floor(50*(1+(G.getDNAUpgrade?.('coins')||0)*.05));G.playSound('victory');G.showMessage('🎉 WAVE COMPLETE +$50',1600);setTimeout(()=>{if(G.state==='playing')G.startShop()},1700)};

G.updateBullets=function(dt){
  for(const b of G.bullets){
    b.x+=b.vx*dt/1000;b.y+=b.vy*dt/1000;b.life-=dt;
    if(G.blocked(b.x,b.y,3))b.life=0;

    // Player projectiles damage enemies; enemy projectiles damage only the player.
    if(b.type==='enemy'){
      if(b.life>0&&Math.hypot(b.x-G.player.x,b.y-G.player.y)<G.player.r+6){
        G.damagePlayer(b.damage);b.life=0;
      }
      continue;
    }

    for(const z of G.spatialGrid.near(b.x,b.y,18)){
      if(b.life<=0)break;if(z.hp<=0||b.hit.has(z))continue;
      if(Math.hypot(b.x-z.x,b.y-z.y)<z.r+5){b.hit.add(z);G.damageZombie(z,b.damage,{angle:Math.atan2(b.vy,b.vx),knockback:b.type===3?125:b.type===5?95:b.type===4?38:b.type===2?18:28});if(b.explosive)G.areaDamage(b.x,b.y,70,b.damage*.55,'player');if(b.type===4){z.burnUntil=performance.now()+5000*G.player.burnBoost;z.burnTick=0}if(--b.pierce<=0)b.life=0}
    }
    if(b.life>0&&G.boss&&Math.hypot(b.x-G.boss.x,b.y-G.boss.y)<G.boss.r+5&&!b.hit.has(G.boss)){b.hit.add(G.boss);G.damageBoss(b.damage);if(b.type!==5)b.life=0}
  }
  let bw=0;for(let bi=0;bi<G.bullets.length;bi++){const b=G.bullets[bi];if(b.life>0)G.bullets[bw++]=b;}G.bullets.length=bw;
};

G.update=function(dt){
  if(G.state==='menu'||G.state==='gameover')return;
  if(G.state==='shop'){
    G.ui.shopTimer.textContent='准备完成后，点击“开始下一波”继续';
    return;
  }
  if(G.state==='level'||G.state==='intro')return;
  G.playTime+=dt;G.killSaveTimer+=dt;G.player.recoil=Math.max(0,G.player.recoil-dt);G.player.muzzle=Math.max(0,G.player.muzzle-dt);G.player.hitFlash=Math.max(0,(G.player.hitFlash||0)-dt);G.player.dashFx=Math.max(0,(G.player.dashFx||0)-dt);G.damageFlash=Math.max(0,(G.damageFlash||0)-dt);G.invuln=Math.max(0,G.invuln-dt);G.attackTimer=Math.max(0,G.attackTimer-dt);G.fireTimer=Math.max(0,G.fireTimer-dt);G.dashTimer=Math.max(0,G.dashTimer-dt);
  if(G.reloadTimer>0){G.reloadTimer-=dt;if(G.reloadTimer<=0){const w=G.reloadWeapon||G.selectedWeapon;const need=G.player.maxMag[w]-G.player.mag[w];if(w===1||w===2){G.player.mag[w]=G.player.maxMag[w]}else{const take=Math.min(need,G.player.reserve[w]);G.player.mag[w]+=take;G.player.reserve[w]-=take}G.reloadWeapon=0}}
  if(G.keys.has('shift')&&!G.keys._shiftUsed){G.keys._shiftUsed=true;G.dash()}if(!G.keys.has('shift'))G.keys._shiftUsed=false;
  if(G.keys.has(' ')&&!G.keys._spaceUsed){G.keys._spaceUsed=true;G.melee()}if(!G.keys.has(' '))G.keys._spaceUsed=false;
  if(G.keys.has('1'))G.selectedWeapon=1;if(G.keys.has('2'))G.selectedWeapon=2;if(G.keys.has('3'))G.selectedWeapon=3;if(G.keys.has('4'))G.selectedWeapon=4;if(G.keys.has('5'))G.selectedWeapon=5;
  let mx=(G.keys.has('d')||G.keys.has('arrowright')?1:0)-(G.keys.has('a')||G.keys.has('arrowleft')?1:0),my=(G.keys.has('s')||G.keys.has('arrowdown')?1:0)-(G.keys.has('w')||G.keys.has('arrowup')?1:0),l=Math.hypot(mx,my)||1;
  if(G.player.dashTime>0){G.player.dashTime-=dt;G.moveEntity(G.player,G.player._dx*700,G.player._dy*700,dt/1000)}else if(mx||my)G.moveEntity(G.player,mx/l*G.player.speed*G.player.moveBoost,my/l*G.player.speed*G.player.moveBoost,dt/1000);
  if(G.mouse.down&&G.fireTimer<=0)G.shoot();
  G.spawnTimer-=dt;if(!G.waveTransition&&G.waveKills<G.waveTotal&&G.spawnTimer<=0){G.spawnRandomZombie();G.spawnTimer=Math.max(620,1050-G.wave*10)}
  if(!G.waveTransition&&G.waveKills>=G.waveTotal&&G.zombies.length===0&&!G.boss)G.endWave();
  G.spatialGrid.build();
  G.updateSkills?.(dt);G.updateEvent?.(dt);G.updateWeather?.(dt);G.adaptive?.update(dt);G.updateBullets(dt);G.updateZombies(dt);G.updateBoss(dt);G.resolveActorCollisions?.();
  G.spatialGrid.build();
  G.updateGrenades(dt);G.updateDrops(dt);G.updatePowerups(dt);G.updateParticles(dt);G.updateTexts(dt);
  if(G.comboTimer>0){G.comboTimer-=dt;if(G.comboTimer<=0)G.combo=0}if(G.killSaveTimer>=5000){G.saveActiveProfile?.();G.killSaveTimer=0;}
  if(G.shake>0)G.shake=Math.max(0,G.shake-dt);
  G.camera.x=Math.max(0,Math.min(G.WORLD.w-G.W,G.player.x-G.W/2));G.camera.y=Math.max(0,Math.min(G.WORLD.h-G.H,G.player.y-G.H/2));
};
G.loop=function(ts){const dt=Math.min(40,ts-G.last);G.last=ts;try{G.update(dt);G.draw()}catch(err){console.error('[Zombie Outbreak]',err);G.runtimeError=String(err?.stack||err);if(G.ui?.message){G.ui.message.textContent='⚠️ 游戏运行错误，请刷新页面';G.ui.message.style.opacity=1}}requestAnimationFrame(G.loop)};

G.renderProfileSummary=function(){const el=G.ui.profileSummary;if(!el)return;const p=G.profiles?.find(x=>x.id===G.activeProfileId);if(!p)return;el.innerHTML=`<b>👤 ${p.name}</b><br><span class="small">🧬 DNA ${G.dna} · 🏆 Best Wave ${p.bestWave||0} · ☠️ Kills ${G.totalKills}</span>`};
G.toggleProfilePanel=function(){const p=G.ui.profilePanel;if(!p)return;if(p.classList.contains('hidden')){G.renderProfilePanel?.();p.classList.remove('hidden');G.ui.menuPanel.classList.add('hidden')}else{p.classList.add('hidden');G.ui.menuPanel.classList.remove('hidden');G.renderProfileSummary?.()}};
G.renderProfilePanel=function(){const g=G.ui.profileGrid;if(!g)return;g.innerHTML='';for(const p of G.profiles||[]){const active=p.id===G.activeProfileId;const el=document.createElement('div');el.className='profileCard'+(active?' active':'');el.innerHTML=`<div class="profileAvatar">👤</div><b>${p.name}</b><br><span class="small">🧬 ${p.dna||0} · 🌊 ${p.bestWave||0} · ☠️ ${p.totalKills||0}</span><button class="btn profileSelect">${active?'当前玩家':'选择'}</button>`;el.querySelector('.profileSelect').onclick=()=>{if(!active){G.selectProfile(p.id);G.renderProfilePanel?.()}};g.appendChild(el)}const name=G.ui.profileNameInput;if(name){name.value=G.profileName||'';name.onchange=()=>G.renameProfile(name.value)}};
G.toggleBuildPanel=function(){const p=G.ui.buildPanel;if(p.classList.contains('hidden')){G.renderBuildPanel();p.classList.remove('hidden');G.ui.menuPanel.classList.add('hidden')}else{p.classList.add('hidden');G.ui.menuPanel.classList.remove('hidden')}};
G.renderBuildPanel=function(){if(!G.ui.buildPanel)return;G.ui.buildText.textContent='装备：'+(G.equipmentSummary?.()||'暂无')+' · 武器进化：'+Object.keys(G.evolved||{}).filter(k=>G.evolved[k]).length;G.ui.buildGrid.innerHTML='';for(const slot of ['head','body','boots','module','artifact']){const id=G.equipmentSlots?.[slot];const el=document.createElement('div');el.className='shopItem';el.innerHTML='<b>'+slot.toUpperCase()+'</b><br>'+(id?(G.getEquip(id)?.[1]+'<br><span class="small">'+G.getEquip(id)?.[3]+'</span>'):'<span class="small">空</span>');G.ui.buildGrid.appendChild(el)}};

G.toggleAchievementPanel=function(){const p=G.ui.achievementPanel;if(p.classList.contains('hidden')){G.renderAchievementPanel();p.classList.remove('hidden');G.ui.menuPanel.classList.add('hidden')}else{p.classList.add('hidden');G.ui.menuPanel.classList.remove('hidden')}};
G.renderAchievementPanel=function(){if(!G.ui.achievementGrid)return;G.ui.achievementGrid.innerHTML='';for(const [id,a] of Object.entries(G.achievements||{})){const done=!!G.achState?.[id];const el=document.createElement('div');el.className='shopItem'+(done?'':' disabled');el.innerHTML='<b>'+(done?'🏆 ':'🔒 ')+a[0]+'</b><br><span class="small">'+a[1]+'</span><br><strong>'+(done?'已解锁 · +25 DNA':'未解锁')+'</strong>';G.ui.achievementGrid.appendChild(el)}};

G.toggleEquipmentPanel=function(){const p=G.ui.equipmentPanel;if(p.classList.contains('hidden')){G.renderEquipmentPanel?.();p.classList.remove('hidden');G.ui.menuPanel.classList.add('hidden')}else{p.classList.add('hidden');G.ui.menuPanel.classList.remove('hidden')}};
G.zombieCodex=[
 ['normal','🧟','Walker','普通感染者','100','★★','★★','无','缓慢追踪玩家。'],
 ['fast','⚡','Runner','奔跑者','75','★★★★★','★★★','高速追踪','速度快，优先处理。'],
 ['tank','🛡️','Tank','重装僵尸','300','★','★★★★★','高生命/高伤害','移动缓慢但非常耐打。'],
 ['exploder','💥','Exploder','爆炸僵尸','95','★★★','★★★★','死亡爆炸','靠近玩家后会造成范围伤害。'],
 ['spitter','🫧','Spitter','喷吐者','120','★★','★★★','远程酸液','保持距离并向玩家发射酸液。'],
 ['hunter','🏹','Hunter','猎杀者','115','★★★★','★★★','侧向移动','会绕侧面接近玩家。'],
 ['leaper','🦘','Leaper','跳跃者','130','★★★★','★★★★','锁定跳跃','锁定玩家位置后快速扑击。'],
 ['screamer','📣','Screamer','尖叫者','90','★★','★','强化同伴','保持后方并强化附近僵尸。']
];
G.renderCodex=function(){
  const g=G.ui.codexGrid;if(!g)return;
  g.innerHTML='';
  for(const z of G.zombieCodex){
    const el=document.createElement('div');el.className='codexCard';
    const cv=document.createElement('canvas');cv.className='codexPortrait';cv.width=180;cv.height=150;
    if(G.renderZombiePortrait)G.renderZombiePortrait(cv,z[0]);
    el.appendChild(cv);
    const info=document.createElement('div');
    info.innerHTML=`<b>${z[2]}</b> · ${z[3]}<div class="codexStats">❤️ HP ${z[4]}<br>⚡ 速度 ${z[5]}<br>⚔️ 威胁 ${z[6]}<br>✨ ${z[7]}</div><div class="small" style="margin-top:6px">${z[8]}</div>`;
    el.appendChild(info);g.appendChild(el);
  }
};
G.renderControls=function(){const g=G.ui.controlsGrid;if(!g)return;const rows=[['W A S D / 方向键','移动'],['鼠标移动','瞄准'],['鼠标左键','射击 / 按住喷火'],['SPACE','近战'],['SHIFT','Dash / 短暂无敌'],['G','投掷手雷'],['Q','冲击波'],['E','紧急治疗'],['1 - 5','切换武器']];g.innerHTML='';for(const r of rows){const el=document.createElement('div');el.className='controlCard';el.innerHTML=`<span class="controlKey">${r[0]}</span><b>${r[1]}</b>`;g.appendChild(el)}};
G.toggleCodexPanel=function(){const p=G.ui.codexPanel;if(p.classList.contains('hidden')){G.renderCodex();p.classList.remove('hidden');G.ui.menuPanel.classList.add('hidden')}else{p.classList.add('hidden');G.ui.menuPanel.classList.remove('hidden')}};
G.toggleControlsPanel=function(){const p=G.ui.controlsPanel;if(p.classList.contains('hidden')){G.renderControls();p.classList.remove('hidden');G.ui.menuPanel.classList.add('hidden')}else{p.classList.add('hidden');G.ui.menuPanel.classList.remove('hidden')}};

G.renderProfileSummary?.();
