/* V10.4.0 — unified free top-down shooter character art
 * Player: Riley Gombart, CC-BY 3.0
 * Source: https://opengameart.org/content/animated-top-down-survivor-player
 * Zombie: Riley Gombart, CC0
 * Source: https://opengameart.org/content/animated-top-down-zombie
 *
 * We intentionally use complete PNG frames instead of slicing a tiny RPG sheet.
 * This removes the old "paper/cardboard" look and keeps player + zombie art in
 * the same top-down shooter visual language.
 */
const G=globalThis, TAU=Math.PI*2;
const raw="https://raw.githubusercontent.com/adil192/top-down-zombie-shooter/master/images/";
const playerIdle=[0,4,8,12,16].map(n=>raw+"Top_Down_Survivor/rifle/idle/survivor-idle_rifle_"+n+".png");
const playerMove=[0,4,8,12,16].map(n=>raw+"Top_Down_Survivor/rifle/move/survivor-move_rifle_"+n+".png");
const zombieIdle=[0,4,8,12,16].map(n=>raw+"Top_Down_Zombie/skeleton-idle_"+n+".png");
const zombieMove=[0,4,8,12,16].map(n=>raw+"Top_Down_Zombie/skeleton-move_"+n+".png");
const cache=new Map();
function img(url){let x=cache.get(url);if(x)return x;x=new Image();x.decoding="async";x.src=url;cache.set(url,x);return x;}
[...playerIdle,...playerMove,...zombieIdle,...zombieMove].forEach(img);

function shadow(ctx,x,y,w,h,a=0.42){
 ctx.save();ctx.fillStyle="rgba(0,0,0,"+a+")";ctx.beginPath();
 ctx.ellipse(x,y+7,w,h,0,0,TAU);ctx.fill();ctx.restore();
}
function sprite(ctx,url,x,y,w,h,angle=0,flip=false,alpha=1){
 const im=img(url);
 if(!im.complete||!im.naturalWidth)return false;
 ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.scale(flip?-1:1,1);
 ctx.globalAlpha=alpha;ctx.imageSmoothingEnabled=true;
 ctx.drawImage(im,-w/2,-h/2,w,h);ctx.restore();return true;
}
function aimAngle(){
 return typeof G.aim==="function"?G.aim():Math.atan2((G.input?.mouseY??G.mouseY??0)-(G.canvas?.height?G.canvas.height/2:0),(G.input?.mouseX??G.mouseX??0)-(G.canvas?.width?G.canvas.width/2:0));
}
function muzzle(ctx,x,y,a,power=1){
 ctx.save();ctx.translate(x,y);ctx.rotate(a);
 ctx.globalCompositeOperation="lighter";ctx.shadowColor="#ffbd55";ctx.shadowBlur=18;
 const r=14+power*12;ctx.fillStyle="rgba(255,204,91,.9)";
 ctx.beginPath();ctx.moveTo(r+18,0);ctx.lineTo(5,-7-power*5);ctx.lineTo(9,0);ctx.lineTo(5,7+power*5);ctx.closePath();ctx.fill();
 ctx.restore();
}
G.drawPlayerV10_3=function(){
 const p=G.player,c=G.ctx,a=aimAngle();
 const moving=Math.hypot(p.vx||0,p.vy||0)>.15;
 const frames=moving?playerMove:playerIdle;
 const idx=Math.floor(performance.now()/95)%frames.length;
 const bob=moving?Math.sin(performance.now()/75)*1.5:Math.sin(performance.now()/420)*.6;
 shadow(c,p.x,p.y,34,10,.48);
 const ok=sprite(c,frames[idx],p.x,p.y-30+bob,116,70,a,Math.cos(a)<0,.98);
 if(!ok){G.drawPlayerV9?.();return;}
 if((p.muzzle||0)>0)muzzle(c,p.x+Math.cos(a)*48,p.y-31+bob+Math.sin(a)*8,a,Math.min(1,p.muzzle/70));
};
G.drawZombieV10_3=function(z){
 const c=G.ctx,t=z.type||"normal";
 const moving=Math.hypot(z.vx||0,z.vy||0)>.08;
 const frames=moving?zombieMove:zombieIdle;
 const idx=Math.floor(performance.now()/125+(z.x+z.y)*.01)%frames.length;
 const scale=t==="tank"?1.48:t==="exploder"?1.28:t==="hunter"?1.08:t==="spitter"?1.12:1;
 const a=Math.atan2((G.player?.y??z.y)-z.y,(G.player?.x??z.x)-z.x);
 shadow(c,z.x,z.y,29*scale,9*scale,.43);
 const ok=sprite(c,frames[idx],z.x,z.y-30*scale,104*scale,86*scale,a,Math.cos(a)<0,.98);
 if(!ok){G.drawZombieV9?.(z);return;}
 // Distinguish special enemies without replacing the underlying zombie silhouette.
 if(t!=="normal"){
  c.save();c.globalAlpha=.22;c.fillStyle=t==="tank"?"#d6dbe0":t==="spitter"?"#49d58a":t==="exploder"?"#ff6a45":t==="hunter"?"#bb82ff":"#e2ad58";
  c.beginPath();c.ellipse(z.x,z.y-52*scale,23*scale,12*scale,0,0,TAU);c.fill();c.restore();
 }
};
G.drawPlayerV9=G.drawPlayerV10_3;
G.drawZombieV9=G.drawZombieV10_3;
G.drawPlayer=G.drawPlayerV10_3;
G.drawZombie=G.drawZombieV10_3;
