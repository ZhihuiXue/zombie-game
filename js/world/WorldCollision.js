const G=globalThis;
G.pointInWater=function(x,y){if(!G.waterRects)return false;const inWater=G.waterRects.some(r=>x>r.x&&x<r.x+r.w&&y>r.y&&y<r.y+r.h);if(!inWater)return false;return !(G.bridges||[]).some(r=>x>r.x&&x<r.x+r.w&&y>r.y&&y<r.y+r.h);};
G.circleHitsWater=function(x,y,r){if(!G.waterRects)return false;return G.waterRects.some(q=>{const nx=Math.max(q.x,Math.min(x,q.x+q.w)),ny=Math.max(q.y,Math.min(y,q.y+q.h));return Math.hypot(x-nx,y-ny)<r})&&!((G.bridges||[]).some(b=>x>b.x&&x<b.x+b.w&&y>b.y&&y<b.y+b.h));};
G.entityBlocked=function(x,y,r){return G.blocked(x,y,r)||G.circleHitsWater?.(x,y,r);};
const oldBlocked=G.blocked;
G.blocked=function(x,y,r){if(x<r+15||y<r+15||x>G.WORLD.w-r-15||y>G.WORLD.h-r-15)return true;for(const a of G.walls||[])if(x+r>a.x&&x-r<a.x+a.w&&y+r>a.y&&y-r<a.y+a.h)return true;return false;};
G.moveEntityWithTerrain=function(o,vx,vy,dt){const nx=o.x+vx*dt,ny=o.y+vy*dt;if(!G.entityBlocked(nx,o.y,o.r))o.x=nx;if(!G.entityBlocked(o.x,ny,o.r))o.y=ny;};
export {G};
