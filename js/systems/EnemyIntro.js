const G=globalThis;
const INTRO_KEY="zo_intro_dismissed_v321";
const INTRO={
  1:{type:'normal',name:'Walker',cn:'普通僵尸',desc:'基础近战敌人，会持续追击玩家。'},
  3:{type:'fast',name:'Runner',cn:'奔跑者',desc:'速度很快，会快速接近玩家。'},
  5:{type:'tank',name:'Tank',cn:'重型僵尸',desc:'生命值很高，移动缓慢，但非常耐打。'},
  7:{type:'exploder',name:'Exploder',cn:'爆炸僵尸',desc:'接近玩家后会爆炸，对范围内造成伤害。'},
  10:{type:'spitter',name:'Spitter',cn:'喷吐者',desc:'保持距离，从远处向玩家发射酸液弹。'},
  12:{type:'hunter',name:'Hunter',cn:'猎杀者',desc:'会绕侧面移动，寻找攻击角度。'},
  15:{type:'leaper',name:'Leaper',cn:'跳跃者',desc:'会锁定玩家位置进行快速跳跃。'},
  20:{type:'screamer',name:'Screamer',cn:'尖叫者',desc:'特殊支援型敌人，会强化附近僵尸。'}
};
G.enemyIntros=INTRO;
G.introDismissed=JSON.parse(localStorage.getItem(INTRO_KEY)||'{}');
G.shouldShowEnemyIntro=function(wave){const d=INTRO[wave];return !!d&&!G.introDismissed[d.type]};
G.showEnemyIntro=function(wave,after){const d=INTRO[wave];if(!d){after?.();return}G.introAfter=after;G.state='intro';G.ui.enemyIntro.classList.remove('hidden');G.ui.enemyIntroWave.textContent='WAVE '+wave+' · NEW ENEMY';G.ui.enemyIntroIcon.textContent=d.type==='spitter'?'🫧':d.type==='hunter'?'🏹':d.type==='leaper'?'🦘':d.type==='exploder'?'💥':d.type==='tank'?'🛡️':d.type==='fast'?'⚡':d.type==='screamer'?'📣':'🧟';G.ui.enemyIntroName.textContent=d.name+' · '+d.cn;G.ui.enemyIntroDesc.textContent=d.desc;G.ui.enemyIntroDont.checked=false;};
G.continueEnemyIntro=function(dismiss){const type=G.enemyIntros[G.wave]?.type;if(dismiss&&type){G.introDismissed[type]=true;localStorage.setItem(INTRO_KEY,JSON.stringify(G.introDismissed));}G.ui.enemyIntro.classList.add('hidden');const cb=G.introAfter;G.introAfter=null;if(G.state==='intro')G.state='playing';cb?.();};
