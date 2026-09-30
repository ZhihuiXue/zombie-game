// Shared enemy movement/decision helpers. Individual enemy types keep their unique behavior.
const G=globalThis;
G.aiMoveToward=function(z,tx,ty,speed,dt){let dx=tx-z.x,dy=ty-z.y,d=Math.hypot(dx,dy)||1,ux=dx/d,uy=dy/d;const dirs=[[ux,uy],[uy,-ux],[-uy,ux],[-ux,-uy],[ux*.7+uy*.7,uy*.7-ux*.7]];for(const q of dirs){const ox=z.x,oy=z.y;G.moveEntity(z,q[0]*speed,q[1]*speed,dt/1000);if(Math.hypot(z.x-ox,z.y-oy)>0.05)return true}z.wander=(z.wander||0)+dt/1000;if(z.wander>1){z.wander=0;z.strafeDir=(Math.random()<.5?-1:1)}return false};
G.aiSeparation=function(z,near){let sx=0,sy=0;for(const q of near){if(q===z||q.hp<=0)continue;const dx=z.x-q.x,dy=z.y-q.y,d2=dx*dx+dy*dy;if(d2>0&&d2<70*70){const d=Math.sqrt(d2);sx+=dx/d*(70-d);sy+=dy/d*(70-d)}}return [sx,sy]};
