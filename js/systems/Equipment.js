const G=globalThis;
const ITEMS=[
 ['vest','🦺 Tactical Vest','body','最大 HP +25，受伤冷却 +80ms',140,1],
 ['boots','👢 Combat Boots','boots','移速 +10%，Dash 冷却 -15%',130,1],
 ['target','🎯 Targeting Module','module','暴击率 +8%',160,3],
 ['battery','🔋 Extended Battery','module','弹匣容量 +25%',150,5],
 ['coin','🧲 Coin Magnet','artifact','金币获取 +15%',150,5],
 ['xp','⭐ XP Magnet','artifact','XP 获取 +15%',150,7],
 ['vampire','🧛 Vampire Implant','artifact','击杀恢复 2 HP',180,10],
 ['shield','🛡️ Energy Shield','artifact','每波开始获得 30 点护盾',190,10],
 ['thermal','🔥 Thermal Core','artifact','燃烧伤害 +25%',170,12],
 ['blast','💣 Blast Harness','body','手雷范围 +25%，伤害 +20%',180,15],
 ['adrenaline','⚡ Adrenaline','artifact','HP <35% 时攻速 +25%',175,15],
 ['scope','🔭 Hunter Scope','head','Sniper 伤害 +20%，暴击 +5%',190,20]
];
G.equipmentCatalog=ITEMS;
G.equipmentSlots={head:null,body:null,boots:null,module:null,artifact:null};
G.equipmentOwned=[];G.equipmentChoices=[];
G.equipmentUnlocks=JSON.parse(localStorage.getItem('zo_equipment_unlocks_v40')||'{}');
G.equipmentHas=id=>G.equipmentOwned.includes(id);
G.getEquip=id=>ITEMS.find(x=>x[0]===id);
G.equipmentUnlockWave=id=>G.getEquip(id)?.[5]||99;
G.equipmentUnlocked=id=>{const e=G.getEquip(id);return !!e&&(e[5]<=1||!!G.equipmentUnlocks[id]);};
G.recordEquipmentUnlocks=function(wave){let changed=false;for(const e of ITEMS){if(e[5]<=wave&&!G.equipmentUnlocks[e[0]]){G.equipmentUnlocks[e[0]]=true;changed=true;G.showMessage?.('🔓 装备解锁：'+e[1],1800)}}if(changed)localStorage.setItem('zo_equipment_unlocks_v40',JSON.stringify(G.equipmentUnlocks));};
G.equipEffect=function(id){if(!G.equipmentHas(id))return;switch(id){
 case 'vest':G.player.maxHp+=25;G.player.hp+=25;G.player.damageReduction=(G.player.damageReduction||0)+.08;break;
 case 'boots':G.player.moveBoost*=1.10;G.player.dashCooldown*=.85;break;
 case 'target':G.player.critChance=(G.player.critChance||0)+.08;break;
 case 'battery':for(const k in G.player.maxMag)G.player.maxMag[k]=Math.ceil(G.player.maxMag[k]*1.25);break;
 case 'vampire':G.player.lifeSteal=(G.player.lifeSteal||0)+2;break;
 case 'thermal':G.player.burnBoost*=1.25;break;
 case 'coin':G.player.coinBoost=(G.player.coinBoost||1)*1.15;break;
 case 'xp':G.player.xpBoost=(G.player.xpBoost||1)*1.15;break;
 case 'shield':G.player.shield=30;break;
 case 'blast':G.player.grenadeRadius=(G.player.grenadeRadius||145)*1.25;G.player.grenadeDamage=(G.player.grenadeDamage||110)*1.2;break;
 case 'adrenaline':G.player.adrenaline=true;break;
 case 'scope':G.player.critChance=(G.player.critChance||0)+.05;G.player.sniperBoost=1.2;break;
 }};
G.applyEquipment=function(){for(const id of G.equipmentOwned)G.equipEffect(id);for(const k in G.player.mag)G.player.mag[k]=Math.min(G.player.maxMag[k],G.player.mag[k]);G.applyEquipmentSynergies?.();};
G.applyEquipmentSynergies=function(){
  G.equipmentSynergiesApplied=G.equipmentSynergiesApplied||{};
  const has=id=>G.equipmentHas(id);
  if(has('vest')&&has('boots')&&!G.equipmentSynergiesApplied.guardian){
    G.player.maxHp+=15;G.player.hp+=15;G.player.damageReduction=(G.player.damageReduction||0)+.04;G.equipmentSynergiesApplied.guardian=true;G.showMessage('🛡 Guardian Build：HP +15 · 减伤 +4%',1200);
  }
  if(has('target')&&has('scope')&&!G.equipmentSynergiesApplied.hunter){
    G.player.critChance=(G.player.critChance||0)+.05;G.player.sniperBoost=(G.player.sniperBoost||1)*1.10;G.equipmentSynergiesApplied.hunter=true;G.showMessage('🎯 Hunter Build：暴击 +5% · 狙击伤害 +10%',1200);
  }
  if(has('thermal')&&has('blast')&&!G.equipmentSynergiesApplied.demolition){
    G.player.burnBoost=(G.player.burnBoost||1)*1.15;G.player.grenadeDamage=(G.player.grenadeDamage||110)*1.10;G.equipmentSynergiesApplied.demolition=true;G.showMessage('🔥 Demolition Build：燃烧 +15% · 手雷 +10%',1200);
  }
  if(has('coin')&&has('xp')&&!G.equipmentSynergiesApplied.growth){
    G.player.coinBoost=(G.player.coinBoost||1)*1.10;G.player.xpBoost=(G.player.xpBoost||1)*1.10;G.equipmentSynergiesApplied.growth=true;G.showMessage('⭐ Growth Build：金币 +10% · XP +10%',1200);
  }
};

G.addEquipment=function(id){const e=G.getEquip(id);if(!e||!G.equipmentUnlocked(id)||G.equipmentHas(id))return false;const slot=e[2];if(G.equipmentSlots[slot]){G.showMessage('该装备槽已有装备',900);return false}G.equipmentOwned.push(id);G.equipmentSlots[slot]=id;G.equipEffect(id);G.showMessage('装备获得：'+e[1],1000);return true};
G.rollEquipmentChoices=function(){const pool=ITEMS.filter(e=>G.equipmentUnlocked(e[0])&&!G.equipmentHas(e[0]));G.equipmentChoices=pool.sort(()=>Math.random()-.5).slice(0,3);return G.equipmentChoices};
G.equipmentSummary=function(){return Object.values(G.equipmentSlots).filter(Boolean).map(id=>G.getEquip(id)?.[1]).join(' · ')||'暂无装备'};
G.renderEquipmentPanel=function(){const grid=G.ui.equipmentGrid;if(!grid)return;grid.innerHTML='';for(const e of ITEMS){const unlocked=G.equipmentUnlocked(e[0]), wave=e[5],owned=G.equipmentHas(e[0]);const el=document.createElement('div');el.className='shopItem'+(!unlocked?' disabled':'');el.innerHTML=`<div class="codexIcon">${e[1].split(' ')[0]}</div><b>${e[1].replace(/^\S+\s*/,'')}</b><br><span class="small">${e[3]}</span><br><strong>${owned?'✓ 本局已装备':unlocked?'✓ 已解锁':'🔒 Wave '+wave+' 解锁'}</strong>`;grid.appendChild(el)}};
