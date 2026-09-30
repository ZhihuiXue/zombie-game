// Navigation helpers: a small flow field lets zombies route around buildings, trees and water.
const G=globalThis;
const CELL=60;
function gridInfo(){return {cols:Math.ceil(G.WORLD.w/CELL),rows:Math.ceil(G.WORLD.h/CELL)};}
G.invalidatePathField=function(){G.pathField=null;G.pathFieldTimer=0};
G.updatePathField=function(dt){
  G.pathFieldTimer=(G.pathFieldTimer||0)-dt;
  if(G.pathField&&G.pathFieldTimer>0)return;
  const {cols,rows}=gridInfo(), total=cols*rows, field=new Int32Array(total);field.fill(-1);
  const px=Math.max(0,Math.min(cols-1,Math.floor(G.player.x/CELL))),py=Math.max(0,Math.min(rows-1,Math.floor(G.player.y/CELL)));
  const pass=new Uint8Array(total);
  for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){
    const wx=x*CELL+CELL/2,wy=y*CELL+CELL/2;
    // Conservative radius: keeps all zombie body types out of terrain.
    pass[y*cols+x]=G.blocked(wx,wy,20)?0:1;
  }
  // Always make the player's cell a target, even if its edge is close to an obstacle.
  pass[py*cols+px]=1;
  const qx=new Int16Array(total),qy=new Int16Array(total);let head=0,tail=0;
  qx[tail]=px;qy[tail]=py;tail++;field[py*cols+px]=0;
  const dirs=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
  while(head<tail){const x=qx[head],y=qy[head],base=field[y*cols+x];head++;for(const [dx,dy] of dirs){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=cols||ny>=rows)continue;const i=ny*cols+nx;if(!pass[i]||field[i]>=0)continue;field[i]=base+(dx&&dy?14:10);qx[tail]=nx;qy[tail]=ny;tail++;}}
  G.pathField={field,cols,rows,cell:CELL};G.pathFieldTimer=280;
};
G.aiPathMove=function(z,tx,ty,speed,dt){
  const pf=G.pathField;if(!pf){G.aiMoveToward(z,tx,ty,speed,dt);return true;}
  const cx=Math.floor(z.x/pf.cell),cy=Math.floor(z.y/pf.cell);
  let best=-1,bx=cx,by=cy;
  for(let y=Math.max(0,cy-1);y<=Math.min(pf.rows-1,cy+1);y++)for(let x=Math.max(0,cx-1);x<=Math.min(pf.cols-1,cx+1);x++){
    const v=pf.field[y*pf.cols+x];if(v>=0&&(best<0||v<best)){best=v;bx=x;by=y;}
  }
  if(best>=0){const wx=bx*pf.cell+pf.cell/2,wy=by*pf.cell+pf.cell/2;const dx=wx-z.x,dy=wy-z.y,d=Math.hypot(dx,dy)||1;G.moveEntity(z,dx/d*speed,dy/d*speed,dt/1000);return true;}
  return G.aiMoveToward(z,tx,ty,speed,dt);
};
G.aiMoveToward=function(z,tx,ty,speed,dt){let dx=tx-z.x,dy=ty-z.y,d=Math.hypot(dx,dy)||1,ux=dx/d,uy=dy/d;const dirs=[[ux,uy],[uy,-ux],[-uy,ux],[-ux,-uy],[ux*.7+uy*.7,uy*.7-ux*.7]];for(const q of dirs){const ox=z.x,oy=z.y;G.moveEntity(z,q[0]*speed,q[1]*speed,dt/1000);if(Math.hypot(z.x-ox,z.y-oy)>0.05)return true}z.wander=(z.wander||0)+dt/1000;if(z.wander>1){z.wander=0;z.strafeDir=(Math.random()<.5?-1:1)}return false};
G.aiSeparation=function(z,near){let sx=0,sy=0;for(const q of near){if(q===z||q.hp<=0)continue;const dx=z.x-q.x,dy=z.y-q.y,d2=dx*dx+dy*dy;if(d2>0&&d2<70*70){const d=Math.sqrt(d2);sx+=dx/d*(70-d);sy+=dy/d*(70-d)}}return [sx,sy]};
export {G};
