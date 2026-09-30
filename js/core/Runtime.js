// Shared runtime/state for Zombie Outbreak V3.1 Modular. Gameplay values are unchanged.
const G = globalThis;

G.canvas = document.getElementById("game");
G.ctx = G.canvas.getContext("2d");
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

G.resize=function(){G.dpr=Math.min(devicePixelRatio||1,2);G.W=innerWidth;G.H=innerHeight;G.canvas.width=G.W*G.dpr;G.canvas.height=G.H*G.dpr;G.canvas.style.width=G.W+'px';G.canvas.style.height=G.H+'px';G.ctx.setTransform(G.dpr,0,0,G.dpr,0,0);};
G.showMessage=function(t,ms=1200){G.ui.message.textContent=t;G.ui.message.style.opacity=1;clearTimeout(G.showMessage.timer);G.showMessage.timer=setTimeout(()=>G.ui.message.style.opacity=0,ms)};

export {G};
