// Auto-split from Zombie Outbreak V3.1. Gameplay intentionally unchanged in this refactor.
const G = globalThis;

G.makeMap = function(){G.walls=[];const layout=G.wave%4;for(let i=0;i<15;i++){let x=250+((i*347+layout*130)%2000),y=180+((i*229+layout*210)%1300);let w=100+(i%3)*55,h=70+(i%4)*35;let r={x,y,w,h};if(Math.abs(x-1300)<250&&Math.abs(y-900)<220)continue;G.walls.push(r)}};

