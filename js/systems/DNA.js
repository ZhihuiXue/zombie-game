const G=globalThis;
const DNA_UPGRADES=[
 ['hp','❤️ Vitality','最大 HP +10 / 级',10],
 ['damage','💥 Damage','所有伤害 +5% / 级',10],
 ['speed','🏃 Speed','移动速度 +3% / 级',10],
 ['coins','💰 Scavenger','金币获取 +5% / 级',10],
 ['drop','🎁 Luck','掉落率 +5% / 级',10],
 ['burn','🔥 Burn','燃烧伤害 +5% / 级',10]
];
G.dnaUpgrades=DNA_UPGRADES;
G.dnaLevels=JSON.parse(localStorage.getItem('zo_dna_upgrades')||'{}');
G.getDNAUpgrade=function(id){return Number(G.dnaLevels[id]||0)};
G.applyDNABonuses=function(){const hp=G.getDNAUpgrade('hp'),damage=G.getDNAUpgrade('damage'),speed=G.getDNAUpgrade('speed'),burn=G.getDNAUpgrade('burn');G.player.maxHp+=hp*10;G.player.hp=G.player.maxHp;G.player.damage*=1+damage*.05;G.player.moveBoost*=1+speed*.03;G.player.burnBoost*=1+burn*.05};
G.dnaCost=function(level){return 10+level*8};
G.buyDNAUpgrade=function(id){const row=DNA_UPGRADES.find(x=>x[0]===id);if(!row)return;const lv=G.getDNAUpgrade(id),cost=G.dnaCost(lv);if(G.dna<cost){G.showMessage('🧬 DNA 不足',800);return}G.dna-=cost;G.dnaLevels[id]=lv+1;localStorage.setItem('zo_dna',G.dna);localStorage.setItem('zo_dna_upgrades',JSON.stringify(G.dnaLevels));G.renderDNAPanel();G.playSound('buy');G.showMessage('🧬 永久强化 +1',800)};
G.renderDNAPanel=function(){G.ui.dnaText.textContent='当前 DNA：'+G.dna;G.ui.dnaGrid.innerHTML='';for(const [id,name,desc] of DNA_UPGRADES){const lv=G.getDNAUpgrade(id),cost=G.dnaCost(lv),el=document.createElement('div');el.className='shopItem'+(G.dna<cost?' disabled':'');el.innerHTML=`<b>${name}</b><br><span class="small">${desc}</span><br><span>Lv.${lv} · 🧬 ${cost}</span>`;el.onclick=()=>G.buyDNAUpgrade(id);G.ui.dnaGrid.appendChild(el)}};
G.toggleDNAPanel=function(){const p=G.ui.dnaPanel;if(p.classList.contains('hidden')){G.renderDNAPanel();p.classList.remove('hidden');G.ui.menuPanel.classList.add('hidden')}else{p.classList.add('hidden');G.ui.menuPanel.classList.remove('hidden')}};
