const G=globalThis;
const EVO={1:{name:'Magnum',desc:'Pistol damage +45%，弹匣 +4'},2:{name:'Plasma SMG',desc:'SMG damage +25%，射速 +18%'},3:{name:'Explosive Shotgun',desc:'子弹爆炸，小范围 AOE'},4:{name:'Inferno',desc:'火焰范围 +25%，燃烧伤害 +40%'},5:{name:'Rail Sniper',desc:'穿透 +2，伤害 +35%'}};
G.evolutions=EVO;G.weaponLevel={1:1,2:1,3:1,4:1,5:1};G.evolved={};
G.evolveWeapon=function(w){if(G.weaponLevel[w]<8||G.evolved[w]||!G.owned[w])return false;G.evolved[w]=true;const x=G.weapons[w];if(w===1){x.damage*=1.45;G.player.maxMag[1]+=4;G.player.mag[1]+=4}if(w===2){x.damage*=1.25;x.rate*=.82}if(w===3){x.damage*=1.18;x.explosive=true}if(w===4){x.range*=1.25;G.player.burnBoost*=1.4}if(w===5){x.damage*=1.35;x.pierce=(x.pierce||1)+2}G.showMessage('⚔️ '+x.name+' 已进化！',1200);G.playSound('victory');return true};
G.addWeaponXP=function(w,n=1){G.weaponLevel[w]=(G.weaponLevel[w]||1)+n;};
