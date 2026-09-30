const G=globalThis;
G.pointInBridge=function(x,y){return (G.bridges||[]).some(b=>x>=b.x&&x<=b.x+b.w&&y>=b.y&&y<=b.y+b.h)};
G.pointInWater=function(x,y){return (G.waterRects||[]).some(r=>x>r.x&&x<r.x+r.w&&y>r.y&&y<r.y+r.h)&&!G.pointInBridge(x,y)};
G.circleHitsWater=function(x,y,r){
  for(const q of G.waterRects||[]){
    const nx=Math.max(q.x,Math.min(x,q.x+q.w)),ny=Math.max(q.y,Math.min(y,q.y+q.h));
    if(Math.hypot(x-nx,y-ny)<r && !G.pointInBridge(x,y))return true;
  }
  return false;
};
G.blocked=function(x,y,r){
  if(x<r+15||y<r+15||x>G.WORLD.w-r-15||y>G.WORLD.h-r-15)return true;
  for(const a of G.walls||[])if(x+r>a.x&&x-r<a.x+a.w&&y+r>a.y&&y-r<a.y+a.h)return true;
  return !!G.circleHitsWater?.(x,y,r);
};
G.entityBlocked=function(x,y,r){return G.blocked(x,y,r)};
G.moveEntityWithTerrain=function(o,vx,vy,dt){const nx=o.x+vx*dt,ny=o.y+vy*dt;if(!G.entityBlocked(nx,o.y,o.r))o.x=nx;if(!G.entityBlocked(o.x,ny,o.r))o.y=ny;};
export {G};
