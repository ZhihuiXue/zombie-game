// Auto-split from Zombie Outbreak V3.1. Gameplay intentionally unchanged in this refactor.
const G = globalThis;

G.aim = function(){return Math.atan2(G.mouse.y-(G.player.y-G.camera.y),G.mouse.x-(G.player.x-G.camera.x))};

G.damagePlayer = function(n){if(G.invuln>0||G.state!=='playing')return;G.player.hp-=n;G.invuln=380;G.shake=8;G.texts.push({x:G.player.x,y:G.player.y-30,t:'-'+Math.round(n),life:650,color:'#ff6d6d'});if(G.player.hp<=0)G.gameOver()};

G.dash = function(){if(G.state!=='playing'||G.player.dashCooldown>0)return;G.playSound('dash');let dx=(G.keys.has('d')||G.keys.has('arrowright')?1:0)-(G.keys.has('a')||G.keys.has('arrowleft')?1:0),dy=(G.keys.has('s')||G.keys.has('arrowdown')?1:0)-(G.keys.has('w')||G.keys.has('arrowup')?1:0);if(!dx&&!dy){dx=Math.cos(G.aim());dy=Math.sin(G.aim())}const l=Math.hypot(dx,dy)||1;dx/=l;dy/=l;G.player.dashTime=230;G.player.dashCooldown=2200;G.player._dx=dx;G.player._dy=dy;G.player.x=Math.max(30,Math.min(G.WORLD.w-30,G.player.x+dx*150));G.player.y=Math.max(30,Math.min(G.WORLD.h-30,G.player.y+dy*150));if(G.blocked(G.player.x,G.player.y,G.player.r)){G.player.x-=dx*150;G.player.y-=dy*150}};

G.melee = function(){if(G.state!=='playing'||G.attackTimer>0)return;G.attackTimer=520;G.playSound('melee');const a=G.aim();for(const z of G.zombies){const dx=z.x-G.player.x,dy=z.y-G.player.y,d=Math.hypot(dx,dy);let da=Math.atan2(dy,dx)-a;da=Math.atan2(Math.sin(da),Math.cos(da));if(d<86&&Math.abs(da)<.85){G.damageZombie(z,G.player.meleeDamage*G.player.damage*.95);z.stun=260;z.x+=Math.cos(a)*24;z.y+=Math.sin(a)*24}}for(let i=0;i<15;i++)G.particles.push({x:G.player.x+Math.cos(a)*60,y:G.player.y+Math.sin(a)*60,vx:(Math.random()-.5)*150,vy:(Math.random()-.5)*150,life:280,color:'#f1e5c0',size:2+Math.random()*3})};

G.throwGrenade = function(){if(G.state!=='playing'||G.player.grenades<=0)return;const a=G.aim();G.player.grenades--;G.grenades.push({x:G.player.x,y:G.player.y,vx:Math.cos(a)*480,vy:Math.sin(a)*480,life:700});};

