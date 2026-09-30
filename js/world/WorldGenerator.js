const G=globalThis;
const rand=(a,b)=>a+Math.random()*(b-a);
const rectsOverlap=(a,b,pad=0)=>a.x-pad<b.x+b.w&&a.x+a.w+pad>b.x&&a.y-pad<b.y+b.h&&a.y+a.h+pad>b.y;
const circleRectOverlap=(c,r,q,pad=0)=>{const nx=Math.max(q.x,Math.min(c.x,q.x+q.w)),ny=Math.max(q.y,Math.min(c.y,q.y+q.h));return Math.hypot(c.x-nx,c.y-ny)<r+pad};
G.generateWorld=function(){
  G.walls=[];G.waterRects=[];G.bridges=[];G.trees=[];G.rocks=[];
  const themes=G.WORLD_BIOMES||['grassland','forest','riverlands','forestRiver'];
  G.mapTheme=themes[Math.floor(Math.random()*themes.length)];
  const center={x:G.WORLD.w/2,y:G.WORLD.h/2,w:520,h:420};
  const isForest=G.mapTheme==='forest'||G.mapTheme==='forestRiver';
  const hasRiver=G.mapTheme==='riverlands'||G.mapTheme==='forestRiver';
  if(hasRiver){
    const horizontal=Math.random()<.55;
    if(horizontal){const y=rand(420,1180),h=rand(150,210);G.waterRects.push({x:0,y,w:G.WORLD.w,h});const bx=rand(700,1700),bw=170;G.bridges.push({x:bx,y:y-18,w:bw,h:h+36});}
    else {const x=rand(500,1900),w=rand(150,210);G.waterRects.push({x,y:0,w,h:G.WORLD.h});const by=rand(500,1250),bh=170;G.bridges.push({x:x-18,y:by,w:w+36,h:bh});}
  }
  // Buildings/rock obstacles never overlap water or bridges, and keep a safe spawn area.
  const obstacleCount=10+Math.min(8,Math.floor(G.wave/4));
  let tries=0;
  while(G.walls.length<obstacleCount&&tries++<700){
    const w=rand(90,190),h=rand(65,130),x=rand(130,G.WORLD.w-w-130),y=rand(110,G.WORLD.h-h-110),r={x,y,w,h,kind:'rock'};
    if(rectsOverlap(r,center,90))continue;
    if(G.waterRects.some(q=>rectsOverlap(r,q,30)))continue;
    if(G.bridges.some(q=>rectsOverlap(r,q,25)))continue;
    if(G.walls.some(q=>rectsOverlap(r,q,70)))continue;
    G.walls.push(r);G.rocks.push({x:x+w/2,y:y+h/2,w,h});
  }
  if(isForest){
    const n=34+Math.min(26,G.wave);tries=0;
    while(G.trees.length<n&&tries++<1600){
      const r=rand(16,28),x=rand(70,G.WORLD.w-70),y=rand(70,G.WORLD.h-70),c={x,y};
      if(Math.hypot(x-center.x,y-center.y)<390)continue;
      if(G.waterRects.some(q=>circleRectOverlap(c,r,q,12)))continue;
      if(G.bridges.some(q=>circleRectOverlap(c,r,q,10)))continue;
      if(G.walls.some(q=>circleRectOverlap(c,r,q,24)))continue;
      if(G.trees.some(t=>Math.hypot(x-t.x,y-t.y)<r+t.r+35))continue;
      G.trees.push({x,y,r,kind:'tree'});
      G.walls.push({x:x-r*.72,y:y-r*.72,w:r*1.44,h:r*1.44,kind:'tree'});
    }
  } else {
    let n=18, tries2=0;
    while(G.trees.length<n&&tries2++<700){
      const r=rand(10,17),x=rand(60,G.WORLD.w-60),y=rand(60,G.WORLD.h-60),c={x,y};
      if(Math.hypot(x-center.x,y-center.y)<360)continue;
      if(G.waterRects.some(q=>circleRectOverlap(c,r,q,8)))continue;
      if(G.bridges.some(q=>circleRectOverlap(c,r,q,8)))continue;
      if(G.walls.some(q=>circleRectOverlap(c,r,q,18)))continue;
      if(G.trees.some(t=>Math.hypot(x-t.x,y-t.y)<r+t.r+25))continue;
      G.trees.push({x,y,r,kind:'bush'});
    }
  }
  G.worldCache=null;
  G.invalidatePathField?.();
};
export {G};
