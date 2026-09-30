const G=globalThis;
const ITEMS=[
 ['vest','🦺 Tactical Vest','body','最大 HP +25，受伤冷却 +80ms',140],
 ['boots','👢 Combat Boots','boots','移速 +10%，Dash 冷却 -15%',130],
 ['target','🎯 Targeting Module','module','暴击率 +8%',160],
 ['battery','🔋 Extended Battery','module','弹匣容量 +25%',150],
 ['vampire','🧛 Vampire Implant','artifact','击杀恢复 2 HP',180],
 ['thermal','🔥 Thermal Core','artifact','燃烧伤害 +25%',170],
 ['coin','🧲 Coin Magnet','artifact','金币获取 +15%',150],
 ['xp','⭐ XP Magnet','artifact','XP 获取 +15%',150],
 ['shield','🛡️ Energy Shield','artifact','每波开始获得 30 点护盾',190],
 ['blast','💣 Blast Harness','body','手雷范围 +25%，伤害 +20%',180],
 ['adrenaline','⚡ Adrenaline','artifact','HP <35% 时攻速 +25%',175],
 ['scope','🔭 Hunter Scope','head','Sniper 伤害 +20%，暴击 +5%',190]
];
G.equipmentCatalog=ITEMS;
G.equipmentSlots={head:null,body:null,boots:null,module:null,artifact:null};
G.equipmentOwned=[];
G.equipmentChoices=[];
G.equipmentHas=id=>G.equipmentOwned.includes(id);
G.getEquip=id=>ITEMS.find(x=>x[0]===id);
G.equipBonus=(id,key)=>{const e=G.getEquip(id);return e&&e[0]===id?1:0};
G.equipTotal=(id)=>G.equipmentOwned.includes(id)?1:0;
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
G.applyEquipment=function(){for(const id of G.equipmentOwned)G.equipEffect(id);for(const k in G.player.mag)G.player.mag[k]=Math.min(G.player.maxMag[k],G.player.mag[k]);};
G.addEquipment=function(id){const e=G.getEquip(id);if(!e||G.equipmentHas(id))return false;const slot=e[2];if(G.equipmentSlots[slot]){G.showMessage('该装备槽已有装备',900);return false}G.equipmentOwned.push(id);G.equipmentSlots[slot]=id;G.equipEffect(id);G.showMessage('装备获得：'+e[1],1000);return true};
G.rollEquipmentChoices=function(){const pool=ITEMS.filter(e=>!G.equipmentHas(e[0]));G.equipmentChoices=pool.sort(()=>Math.random()-.5).slice(0,3);return G.equipmentChoices};
G.equipmentSummary=function(){return Object.values(G.equipmentSlots).filter(Boolean).map(id=>G.getEquip(id)?.[1]).join(' · ')||'暂无装备'};
