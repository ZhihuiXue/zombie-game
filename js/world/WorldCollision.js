const G=globalThis;

G.pointInBridge=function(x,y){return (G.bridges||[]).some(b=>x>=b.x&&x<=b.x+b.w&&y>=b.y&&y<=b.y+b.h)};
G.pointInWater=function(x,y){return (G.waterRects||[]).some(w=>x>=w.x&&x<=w.x+w.w&&y>=w.y&&y<=w.y+w.h)&&!G.pointInBridge(x,y)};

function circleRect(cx,cy,r,q){
  const nx=Math.max(q.x,Math.min(cx,q.x+q.w));
  const ny=Math.max(q.y,Math.min(cy,q.y+q.h));
  return Math.hypot(cx-nx,cy-ny)<r;
}

// Bridges are walkable corridors through a water rectangle.  The previous
// version tested the bridge's LONG axis, which accidentally blocked actors at
// the river bank.  We only require the actor centre to stay inside the bridge
// corridor's narrow axis, with enough margin for its radius.
function actorOnBridge(x,y,r){
  for(const b of G.bridges||[]){
    const vertical=b.h>b.w;
    if(vertical){
      if(x>=b.x+r && x<=b.x+b.w-r && y>=b.y-r && y<=b.y+b.h+r)return true;
    }else{
      if(y>=b.y+r && y<=b.y+b.h-r && x>=b.x-r && x<=b.x+b.w+r)return true;
    }
  }
  return false;
}
G.actorOnBridge=actorOnBridge;

G.circleHitsWater=function(x,y,r){
  for(const w of G.waterRects||[]){
    if(!circleRect(x,y,r,w))continue;
    if(actorOnBridge(x,y,r))continue;
    return true;
  }
  return false;
};

G.blocked=function(x,y,r){
  if(x<r+15||y<r+15||x>G.WORLD.w-r-15||y>G.WORLD.h-r-15)return true;
  for(const a of G.walls||[]){
    if(x+r>a.x&&x-r<a.x+a.w&&y+r>a.y&&y-r<a.y+a.h)return true;
  }
  // Trees are physical cover too. The canopy is decorative, but the trunk
  // occupies a compact circular collision volume so players, zombies and
  // bullets cannot simply pass through the tree.
  for(const t of G.trees||[]){
    const trunk=Math.max(7,(t.r||14)*.42);
    if(Math.hypot(x-t.x,y-t.y)<r+trunk)return true;
  }
  return !!G.circleHitsWater(x,y,r);
};
G.entityBlocked=function(x,y,r){return G.blocked(x,y,r)};

G.moveEntity=function(o,vx,vy,seconds){
  if(!o)return false;
  const dt=Math.max(0,Math.min(.08,Number(seconds)||0));
  if(!dt)return false;
  const distance=Math.hypot(vx,vy)*dt;
  const steps=Math.max(1,Math.ceil(distance/8));
  const sx=vx*dt/steps, sy=vy*dt/steps;
  let moved=false;
  for(let i=0;i<steps;i++){
    const can=(x,y)=>!G.entityBlocked(x,y,o.r);
    let movedStep=false;
    if(can(o.x+sx,o.y+sy)){o.x+=sx;o.y+=sy;movedStep=true;}
    else if(can(o.x+sx,o.y)){o.x+=sx;movedStep=true;}
    else if(can(o.x,o.y+sy)){o.y+=sy;movedStep=true;}
    if(movedStep)moved=true; else break;
  }
  return moved;
};
G.moveEntityWithTerrain=G.moveEntity;
export {G};
