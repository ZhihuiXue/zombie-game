// Auto-split from Zombie Outbreak V3.1. Gameplay intentionally unchanged in this refactor.
const G = globalThis;

G.renderShop = function(){
const equipItems=(G.rollEquipmentChoices?G.rollEquipmentChoices():[]).map(e=>['equip_'+e[0],e[1],e[3],e[4],()=>G.addEquipment(e[0])]);
const evoItems=[];for(const w of [1,2,3,4,5]){if(G.weaponLevel?.[w]>=8&&!G.evolved?.[w]&&G.owned[w])evoItems.push(['evo_'+w,'⚔️ 进化 '+G.weapons[w].name,G.evolutions[w].desc,260,()=>G.evolveWeapon(w)]);}
const items=[
['grenade','💣 手雷','+1 颗手雷',60,()=>G.player.grenades++],
['damage','💥 Damage +10%','永久强化',120,()=>G.player.damage*=1.1],
['rate','⚡ Fire Rate +10%','永久强化',120,()=>G.player.fireRate*=1.1],
['speed','🏃 Speed +8%','永久强化',100,()=>G.player.moveBoost*=1.08],
['hp','❤️ Max HP +15','永久强化',110,()=>{G.player.maxHp+=15;G.player.hp=Math.min(G.player.maxHp,G.player.hp+15)}],
['flame','🔥 解锁喷火枪',G.owned[4]?'已经拥有':'本局解锁',180,()=>{G.owned[4]=true;G.player.reserve[4]=0;G.player.mag[4]=G.player.maxMag[4]}],
['sniper','🎯 解锁狙击枪',G.owned[5]?'已经拥有':'本局解锁',220,()=>{G.owned[5]=true;G.player.reserve[5]=0;G.player.mag[5]=G.player.maxMag[5]}],
['shotAmmo','🟫 霰弹枪弹药','+6 发',40,()=>G.player.reserve[3]=Math.min(G.player.maxReserve[3],G.player.reserve[3]+6)],
...(G.owned[5]?[['sniperAmmo','🔹 狙击枪弹药','+3 发',60,()=>G.player.reserve[5]=Math.min(G.player.maxReserve[5],G.player.reserve[5]+3)]]:[]),
...(G.owned[4]?[['flameAmmo','🔥 喷火枪燃料','+24 发',40,()=>G.player.reserve[4]=Math.min(G.player.maxReserve[4],G.player.reserve[4]+24)]]:[]),
['heal','🩹 医疗包','回复 40 HP',75,()=>G.player.hp=Math.min(G.player.maxHp,G.player.hp+40)],...equipItems,...evoItems
];
G.ui.shopGrid.innerHTML='<div class="shopSectionTitle">🧩 装备（本局 Build）</div><div class="small" style="grid-column:1/-1;text-align:left">装备通过达到指定 Wave 永久解锁；解锁后可在商店随机出现。</div>'; 
for(const [id,n,d,c,fn] of items){
 const ownedAlready=(id==='flame'&&G.owned[4])||(id==='sniper'&&G.owned[5]);
 const locked=(id==='flameAmmo'&&!G.owned[4]);
 const noAmmoCap=(id==='shotAmmo'&&G.player.reserve[3]>=G.player.maxReserve[3])||(id==='flameAmmo'&&(!G.owned[4]||G.player.reserve[4]>=G.player.maxReserve[4]))||(id==='sniperAmmo'&&G.player.reserve[5]>=G.player.maxReserve[5]);
 const el=document.createElement('div');el.className='shopItem'+(G.coins<c||noAmmoCap||locked?' disabled':'');
 el.innerHTML=`<b>${n}</b><br><span class="small">${d}</span><br><strong>${locked?'🔒 需先解锁':ownedAlready?'✓ 已拥有':noAmmoCap?'已满':'💰 '+c}</strong>`;
 el.onclick=()=>{
   if(ownedAlready){G.showMessage('✓ 已经拥有 '+(id==='flame'?'喷火枪':'狙击枪'),900);return}
   if(locked){G.showMessage('请先解锁喷火枪',800);return}
   if(noAmmoCap){G.showMessage('弹药已经满了',800);return}
   if(G.coins<c){G.showMessage('金币不足',800);return}
   G.coins-=c;fn();G.playSound('buy');G.renderShop();G.showMessage('购买成功',700)
 };
 G.ui.shopGrid.appendChild(el);
}
};

