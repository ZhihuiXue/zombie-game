const G=globalThis;
G.pointInBridge=function(x,y){return (G.bridges||[]).some(b=>x>=b.x&&x<=b.x+b.w&&y>=b.y&&y<=b.y+b.h)};
G.pointInWater=function(x,y){return (G.waterRects||[]).some(w=>x>=w.x&&x<=w.x+w.w&&y>=w.y&&y<=w.y+w.h)&&!G.pointInBridge(x,y)};
function circleRect(cx,cy,r,q){const nx=Math.max(q.x,Math.min(cx,q.x+q.w)),ny=Math.max(q.y,Math.min(cy,q.y+q.h));return Math.hypot(cx-nx,cy-ny)<r;}
G.circleHitsWater=function(x,y,r){
  for(const w of G.waterRects||[]){
    if(!circleRect(x,y,r,w))continue;
    // A bridge is walkable only where the whole actor footprint is on it.
    let fullyOnBridge=false;
    for(const b of G.bridges||[]){
      if(x-r>=b.x&&x+r<=b.x+b.w&&y-r>=b.y&&y+r<=b.y+b.h){fullyOnBridge=true;break;}
    }
    if(!fullyOnBridge)return true;
  }
  return false;
};
G.blocked=function(x,y,r){
  if(x<r+15||y<r+15||x>G.WORLD.w-r-15||y>G.WORLD.h-r-15)return true;
  for(const a of G.walls||[])if(x+r>a.x&&x-r<a.x+a.w&&y+r>a.y&&y-r<a.y+a.h)return true;
  return !!G.circleHitsWater(x,y,r);
};
G.entityBlocked=function(x,y,r){return G.blocked(x,y,r)};
G.moveEntityWithTerrain=function(o,vx,vy,dt){return G.moveEntity(o,vx,vy,dt)};
G.moveEntity=function(o,vx,vy,seconds){
  if(!o)return false;const dt=Math.max(0,Math.min(.08,Number(seconds)||0));if(!dt)return false;
  const ox=o.x,oy=o.y;let moved=false;
  const test=(x,y)=>!G.entityBlocked(x,y,o.r);
  const nx=ox+vx*dt;if(test(nx,oy)){o.x=nx;moved=true}
  const ny=oy+vy*dt;if(test(o.x,ny)){o.y=ny;moved=true}
  return moved;
};
export {G};
