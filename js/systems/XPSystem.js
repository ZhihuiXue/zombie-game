// XP and level progression.
const G = globalThis;

G.gainXP = function(n){
  // XP boosts are applied exactly once here. Callers pass base XP only.
  G.xp += n * (G.player.xpBoost || 1);
  while(G.xp >= G.xpNeed){G.xp -= G.xpNeed;G.xpNeed=Math.floor(G.xpNeed*1.18);G.level++;G.showLevelUp()}
};

G.showLevelUp=function(){G.state='level';G.ui.levelPanel.classList.remove('hidden');G.ui.levelCards.innerHTML='';const opts=[...upgrades].sort(()=>Math.random()-.5).slice(0,3);for(const [id,n,d] of opts){const c=document.createElement('div');c.className='card';c.innerHTML=`<b>${n}</b><br><span class="small">${d}</span>`;c.onclick=()=>{G.applyUpgrade(id);G.ui.levelPanel.classList.add('hidden');G.state='playing'};G.ui.levelCards.appendChild(c)}};

G.applyUpgrade=function(id){if(id==='damage')G.player.damage*=1.15;if(id==='rate')G.player.fireRate*=1.12;if(id==='hp'){G.player.maxHp+=20;G.player.hp=Math.min(G.player.maxHp,G.player.hp+20)}if(id==='speed')G.player.moveBoost*=1.12;if(id==='burn')G.player.burnBoost*=1.5;if(id==='coins')G.coins+=Math.floor(G.coins*.2);if(id==='dash')G.player.dashCooldown*=.75;if(id==='melee')G.player.meleeDamage*=1.2};
