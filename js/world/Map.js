const G=globalThis;
G.makeMap=function(){G.walls=[];const themes=['meadow','factory','ruins','lab'];G.mapTheme=themes[(G.wave-1)%4];const layout=G.wave%4;for(let i=0;i<15;i++){let x=250+((i*347+layout*130)%2000),y=180+((i*229+layout*210)%1300);let w=100+(i%3)*55,h=70+(i%4)*35,r={x,y,w,h};if(Math.abs(x-1300)<250&&Math.abs(y-900)<220)continue;G.walls.push(r)}G.worldCache=null};
