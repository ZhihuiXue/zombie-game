const G=globalThis;

G.pointInBridge=function(x,y){return (G.bridges||[]).some(b=>x>=b.x&&x<=b.x+b.w&&y>=b.y&&y<=b.y+b.h)};
G.pointInWater=function(x,y){return (G.waterRects||[]).some(w=>x>=w.x&&x<=w.x+w.w&&y>=w.y&&y<=w.y+w.h)&&!G.pointInBridge(x,y)};

function circleRect(cx,cy,r,q){
  const nx=Math.max(q.x,Math.min(cx,q.x+q.w));
  const ny=Math.max(q.y,Math.min(cy,q.y+q.h));
  return Math.hypot(cx-nx,cy-ny)<r;
}

// A bridge is a rectangular walkable corridor crossing the water.
// The actor only needs to fit across the bridge's narrow dimension; this is
// deliberately less strict than requiring the whole circular footprint to be
// inside the complete bridge rectangle. That allows an actor to ENTER a bridge
// from land instead of getting blocked at the water's edge.
function actorOnBridge(x,y,r){
  for(const b of G.bridges||[]){
    const horizontalBridge=b.w < b.h;
    const insideLong=x>=b.x-r&&x<=b.x+b.w+r&&y>=b.y-r&&y<=b.y+b.h+r;
    if(!insideLong)continue;
    if(horizontalBridge){
      if(x-r>=b.x&&x+r<=b.x+b.w)return true;
    }else{
      if(y-r>=b.y&&y+r<=b.y+b.h)return true;
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
  return !!G.circleHitsWater(x,y,r);
};
G.entityBlocked=function(x,y,r){return G.blocked(x,y,r)};

// Terrain movement uses small substeps and slides along blocked axes. This is
// important at building corners and bridge entrances, where a single large
// diagonal step can otherwise pin an actor against the obstacle.
G.moveEntity=function(o,vx,vy,seconds){
  if(!o)return false;
  const dt=Math.max(0,Math.min(.08,Number(seconds)||0));
  if(!dt)return false;
  const distance=Math.hypot(vx,vy)*dt;
  const steps=Math.max(1,Math.ceil(distance/10));
  const sx=vx*dt/steps, sy=vy*dt/steps;
  let moved=false;
  const test=(x,y)=>!G.entityBlocked(x,y,o.r);
  for(let i=0;i<steps;i++){
    let changed=false;
    if(test(o.x+sx,o.y)){o.x+=sx;changed=true;moved=true}
    if(test(o.x,o.y+sy)){o.y+=sy;changed=true;moved=true}
    // If diagonal movement is blocked, try the stronger component alone.
    if(!changed){
      const ax=Math.abs(sx)>=Math.abs(sy)?sx:0;
      const ay=Math.abs(sy)>Math.abs(sx)?sy:0;
      if(ax&&test(o.x+ax,o.y)){o.x+=ax;changed=true;moved=true}
      if(ay&&test(o.x,o.y+ay)){o.y+=ay;changed=true;moved=true}
    }
    if(!changed)break;
  }
  return moved;
};
G.moveEntityWithTerrain=G.moveEntity;
export {G};
