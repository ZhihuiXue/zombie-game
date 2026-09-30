// Auto-split from Zombie Outbreak V3.1. Gameplay intentionally unchanged in this refactor.
const G = globalThis;

G.spawnPoint = function(){const side=Math.floor(Math.random()*4),m=75;return side===0?{x:m+Math.random()*(G.WORLD.w-2*m),y:m}:side===1?{x:G.WORLD.w-m,y:m+Math.random()*(G.WORLD.h-2*m)}:side===2?{x:m+Math.random()*(G.WORLD.w-2*m),y:G.WORLD.h-m}:{x:m,y:m+Math.random()*(G.WORLD.h-2*m)}};

G.blocked = function(x,y,r){if(x<r+15||y<r+15||x>G.WORLD.w-r-15||y>G.WORLD.h-r-15)return true;for(const a of G.walls)if(x+r>a.x&&x-r<a.x+a.w&&y+r>a.y&&y-r<a.y+a.h)return true;return false};

G.moveEntity = function(o,vx,vy,dt){const nx=o.x+vx*dt,ny=o.y+vy*dt;if(!G.blocked(nx,o.y,o.r))o.x=nx;if(!G.blocked(o.x,ny,o.r))o.y=ny};

G.spawnZombie = function(type){let p=G.spawnPoint();let tries=0;while(G.blocked(p.x,p.y,22)&&tries++<20)p=G.spawnPoint();const defs={normal:[28,52,105,'#668f6b'],fast:[20,92,75,'#d2a044'],tank:[38,35,300,'#53616b'],exploder:[25,55,95,'#bf6b35'],hunter:[22,120,115,'#9c5a9a'],spitter:[24,48,120,'#4c9b85'],leaper:[23,100,130,'#b58a42']};const d=defs[type]||defs.normal;const hpScale=1+Math.max(0,G.wave-1)*.12;const hp=d[2]*hpScale;G.zombies.push({x:p.x,y:p.y,r:d[0],speed:d[1],damage:d[2],hp,maxHp:hp,type,color:d[3],attack:0,burnUntil:0,burnTick:0,stun:0,wander:Math.random()*6,jump:0})};

G.spawnRandomZombie = function(){let r=Math.random(),type=r<.48?'normal':r<.65?'fast':r<.77?'hunter':r<.86?'spitter':r<.93?'tank':r<.97?'leaper':'exploder';G.spawnZombie(type)};

G.damageZombie = function(z,n){if(z.hp<=0)return;z.hp-=n;G.playSound('hit');z.flash=90;G.texts.push({x:z.x,y:z.y-z.r-8,t:Math.round(n),life:520,color:'#fff'});if(z.hp<=0)G.killZombie(z)};

G.killZombie = function(z){z.hp=-999;G.kills++;G.totalKills++;G.score+=100;G.coins+=Math.floor(6+Math.random()*8);G.waveKills++;G.gainXP(20+(z.type==='tank'?20:0));if(Math.random()<.18){const types=['hp','grenade','coin','ammo'];G.drops.push({x:z.x,y:z.y,type:types[Math.floor(Math.random()*types.length)],life:15000})}if(Math.random()<.025)G.powerups.push({x:z.x,y:z.y,type:['rage','freeze','heal','insta'][Math.floor(Math.random()*4)],life:12000});for(let i=0;i<14;i++)G.particles.push({x:z.x,y:z.y,vx:(Math.random()-.5)*180,vy:(Math.random()-.5)*180,life:400,color:z.type==='exploder'?'#ff7a30':'#8b302f',size:2+Math.random()*4});if(z.type==='exploder'){for(const q of G.zombies){if(q!==z&&Math.hypot(q.x-z.x,q.y-z.y)<100)G.damageZombie(q,45*G.player.damage)}}};

G.updateZombies = function(dt){const now=performance.now();for(const z of G.zombies){if(z.hp<=0)continue;if(z.burnUntil>now){z.burnTick-=dt;if(z.burnTick<=0){G.damageZombie(z,2.5*G.player.damage*G.player.burnBoost);z.burnTick=600}}if(z.hp<=0)continue;z.stun=Math.max(0,z.stun-dt);z.attack=Math.max(0,z.attack-dt);let dx=G.player.x-z.x,dy=G.player.y-z.y,d=Math.hypot(dx,dy)||1,ux=dx/d,uy=dy/d;let sp=z.speed*(z.type==='hunter'?1.15:1);if(z.type==='leaper'){z.jump=Math.max(0,z.jump-dt);if(d<260&&z.jump<=0){z.jump=1800;z._leapX=G.player.x;z._leapY=G.player.y}}if(z.jump>0&&z.jump<1500&&z.type==='leaper'){ux=(z._leapX-z.x)/(Math.hypot(z._leapX-z.x,z._leapY-z.y)||1);uy=(z._leapY-z.y)/(Math.hypot(z._leapX-z.x,z._leapY-z.y)||1);sp=220}if(z.type==='spitter'&&d<420){sp=0;if(z.attack<=0){z.attack=1600;G.enemyShot(z)}}if(z.stun<=0&&sp>0){let tryDirs=[[ux,uy],[uy,-ux],[-uy,ux],[-ux,-uy]];let moved=false;for(const [vx,vy] of tryDirs){const ox=z.x,oy=z.y;G.moveEntity(z,vx*sp,vy*sp,dt/1000);if(Math.hypot(z.x-ox,z.y-oy)>0.1){moved=true;break}}if(!moved){z.x+=(-uy)*12;z.y+=ux*12}}if(d<z.r+G.player.r+3&&z.attack<=0&&z.type!=='spitter'){G.damagePlayer(z.damage*(z.type==='exploder'?.15:.04));z.attack=700;if(z.type==='exploder'){for(const q of G.zombies)if(q!==z&&Math.hypot(q.x-z.x,q.y-z.y)<100)G.damageZombie(q,30);z.hp=0}}}let zw=0;for(let zi=0;zi<G.zombies.length;zi++){const z=G.zombies[zi];if(z.hp>0)G.zombies[zw++]=z;}G.zombies.length=zw};

G.enemyShot = function(z){const a=Math.atan2(G.player.y-z.y,G.player.x-z.x);G.bullets.push({x:z.x,y:z.y,vx:Math.cos(a)*320,vy:Math.sin(a)*320,life:1600,damage:12,type:'enemy',pierce:1,hit:new Set()})};

