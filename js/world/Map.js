const G=globalThis;

G.makeMap=function(){
  G.walls=[];
  const themes=['meadow','factory','ruins','lab'];
  G.mapTheme=themes[Math.floor(Math.random()*themes.length)];
  const count=10+Math.min(6,Math.floor(G.wave/5));
  let tries=0;
  while(G.walls.length<count && tries++<240){
    const w=95+Math.random()*120,h=65+Math.random()*95;
    const x=140+Math.random()*(G.WORLD.w-w-280), y=120+Math.random()*(G.WORLD.h-h-240);
    const cx=x+w/2,cy=y+h/2;
    // Keep a generous player start area open.
    if(Math.abs(cx-G.WORLD.w/2)<360&&Math.abs(cy-G.WORLD.h/2)<300)continue;
    // Keep obstacles separated enough to preserve routes through the arena.
    if(G.walls.some(r=>x<r.x+r.w+70&&x+w>r.x-70&&y<r.y+r.h+70&&y+h>r.y-70))continue;
    G.walls.push({x,y,w,h});
  }
  G.worldCache=null;
};
