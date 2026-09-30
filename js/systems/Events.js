const G=globalThis;
G.currentEvent=null;G.eventUntil=0;
const EVENTS=[
 ['toxic','☣️ TOXIC ZONE','地图中心毒区：玩家持续受到轻微伤害'],
 ['overcharge','⚡ OVERCHARGE','所有武器射速 +20%'],
 ['bounty','💰 BOUNTY','击杀金币 +50%']
];
G.startEvent=function(){if(G.wave<4||G.wave%4!==0)return;const e=EVENTS[Math.floor(Math.random()*EVENTS.length)];G.currentEvent=e;G.eventUntil=performance.now()+Math.min(22000,7000+G.wave*350);G.showMessage(e[1]+' · '+e[2],2200)};
G.updateEvent=function(dt){if(!G.currentEvent)return;if(performance.now()>G.eventUntil){G.currentEvent=null;return}if(G.currentEvent[0]==='toxic'&&G.state==='playing'&&Math.random()<dt/1000*.55&&Math.hypot(G.player.x-G.WORLD.w/2,G.player.y-G.WORLD.h/2)<250)G.damagePlayer(2)};
G.eventLabel=function(){return G.currentEvent?G.currentEvent[1]:''};
