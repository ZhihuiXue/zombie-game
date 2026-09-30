const G=globalThis;
function separate(a,b,minDist,moveA,moveB){const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||.001;if(d>=minDist)return;const nx=dx/d,ny=dy/d,push=minDist-d;if(moveA){a.x-=nx*push*.52;a.y-=ny*push*.52}if(moveB){b.x+=nx*push*.48;b.y+=ny*push*.48}}
G.resolveActorCollisions=function(){
  if(G.state!=='playing')return;
  const px=G.player.x,py=G.player.y;
  for(const z of G.zombies){if(z.hp<=0)continue;separate(G.player,z,G.player.r+z.r+1,true,true);}
  if(G.boss&&G.boss.hp>0)separate(G.player,G.boss,G.player.r+G.boss.r+2,true,true);
  for(let i=0;i<G.zombies.length;i++){const a=G.zombies[i];if(a.hp<=0)continue;for(let j=i+1;j<G.zombies.length;j++){const b=G.zombies[j];if(b.hp<=0)continue;separate(a,b,a.r+b.r+.5,false,true);}}
  G.player.x=Math.max(G.player.r+16,Math.min(G.WORLD.w-G.player.r-16,G.player.x));G.player.y=Math.max(G.player.r+16,Math.min(G.WORLD.h-G.player.r-16,G.player.y));
  if(G.entityBlocked?.(G.player.x,G.player.y,G.player.r)){G.player.x=px;G.player.y=py;}
};
export {G};
