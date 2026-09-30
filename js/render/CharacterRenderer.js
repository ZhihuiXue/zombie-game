// V8 Character Sprite Renderer
// Gameplay is intentionally untouched. This module owns the final character render hooks.
const G=globalThis;
const spriteCache=new Map();
const SPRITES={
  player:"./assets/v8/player.svg",
  normal:"./assets/v8/zombie-normal.svg",
  tank:"./assets/v8/zombie-tank.svg"
};
function loadSprite(key){
  if(spriteCache.has(key))return spriteCache.get(key);
  const img=new Image();
  img.decoding="async";
  img.src=SPRITES[key]||SPRITES.normal;
  const p=new Promise(resolve=>{img.onload=()=>resolve(img);img.onerror=()=>resolve(null)});
  spriteCache.set(key,p);
  return p;
}
function facingFlip(){
  const a=G.aim?.()||0;
  return Math.cos(a)<0;
}
function drawSprite(ctx,img,x,y,w,h,flip=false,alpha=1){
  if(!img)return;
  ctx.save();
  ctx.translate(x,y);
  ctx.scale(flip?-1:1,1);
  ctx.globalAlpha=alpha;
  ctx.drawImage(img,-w/2,-h/2,w,h);
  ctx.restore();
}
function playerState(){
  const p=G.player,now=performance.now();
  const moving=["w","a","s","d","arrowup","arrowdown","arrowleft","arrowright"].some(k=>G.keys?.has(k));
  return p.hp<=0?"death":p.hitFlash>0?"hurt":p.dashTime>0?"dash":moving?"walk":"idle";
}
G.drawPlayerV8=function(){
  const ctx=G.ctx,p=G.player,now=performance.now();
  const state=playerState(), moving=state==="walk"||state==="dash";
  const bob=moving?Math.abs(Math.sin(now*.015))*2.4:Math.sin(now*.0025)*.7;
  const flip=facingFlip();
  const alpha=G.invuln>0&&Math.floor(G.invuln/70)%2===0?.48:1;
  loadSprite("player").then(img=>{
    if(!img)return;
    ctx.save();
    // Grounded roguelite shadow/effect layer.
    ctx.fillStyle="rgba(0,0,0,.42)";
    ctx.beginPath();ctx.ellipse(p.x+2,p.y+30,25,8,0,0,Math.PI*2);ctx.fill();
    if(state==="dash"){
      ctx.globalAlpha=.18;ctx.fillStyle="#69d8ff";
      ctx.beginPath();ctx.ellipse(p.x,p.y+28,31,10,0,0,Math.PI*2);ctx.fill();
    }
    drawSprite(ctx,img,p.x,p.y-4-bob,Math.max(70,p.r*2.8),Math.max(80,p.r*3.25),flip,alpha);
    if(state==="hurt"){
      ctx.strokeStyle="rgba(255,92,86,.8)";ctx.lineWidth=2;
      ctx.beginPath();ctx.arc(p.x,p.y,30+Math.sin(now*.05)*2,0,Math.PI*2);ctx.stroke();
    }
    if(p.shield>0&&G.equipmentHas?.("shield")){
      ctx.strokeStyle="rgba(100,220,255,.38)";ctx.lineWidth=2;
      ctx.beginPath();ctx.arc(p.x,p.y,34+Math.sin(now*.008)*2,0,Math.PI*2);ctx.stroke();
    }
    if(p.muzzle>0){
      const c=G.weapons?.[G.selectedWeapon]?.color||"#ffd36a";
      ctx.globalAlpha=Math.min(1,p.muzzle/90);ctx.shadowColor=c;ctx.shadowBlur=18;ctx.fillStyle=c;
      const a=G.aim?.()||0,ex=p.x+Math.cos(a)*46,ey=p.y+Math.sin(a)*46;
      ctx.beginPath();ctx.arc(ex,ey,5+Math.random()*3,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
    }
    ctx.restore();
  });
};

function zombieSpriteType(z){return z.type==="tank"?"tank":"normal";}
G.drawZombieV8=function(z){
  const ctx=G.ctx,now=performance.now(),key=zombieSpriteType(z);
  if(z.x<G.camera.x-120||z.x>G.camera.x+G.W+120||z.y<G.camera.y-120||z.y>G.camera.y+G.H+120)return;
  loadSprite(key).then(img=>{
    if(!img)return;
    const scale=z.type==="tank"?1.12:1;
    const w=Math.max(62,z.r*2.75*scale),h=Math.max(76,z.r*3.25*scale);
    const moving=Math.sin(now*.012+(z.x+z.y)*.01);
    const bob=Math.abs(moving)*1.8;
    const flip=Math.cos(Math.atan2(G.player.y-z.y,G.player.x-z.x))<0;
    ctx.save();
    ctx.fillStyle="rgba(0,0,0,.40)";
    ctx.beginPath();ctx.ellipse(z.x,z.y+z.r*1.12,z.r*1.05,z.r*.28,0,0,Math.PI*2);ctx.fill();
    drawSprite(ctx,img,z.x,z.y-z.r*.04-bob,w,h,flip,z.flash>0?.72:1);
    if(z.type!=="normal"&&z.type!=="tank"){
      const hues={fast:25,exploder:350,hunter:275,spitter:145,leaper:42,screamer:300};
      ctx.save();ctx.globalCompositeOperation="screen";ctx.globalAlpha=.13;ctx.filter=`hue-rotate(${hues[z.type]||0}deg)`;
      drawSprite(ctx,img,z.x,z.y-z.r*.04-bob,w,h,flip,1);ctx.restore();
    }
    if(z.burnUntil>now){
      ctx.strokeStyle="rgba(255,112,38,.65)";ctx.lineWidth=2;
      ctx.beginPath();ctx.arc(z.x,z.y,z.r*1.25+Math.sin(now*.01)*3,0,Math.PI*2);ctx.stroke();
    }
    if(z.elite){
      ctx.strokeStyle="rgba(255,211,72,.8)";ctx.lineWidth=2.5;
      ctx.beginPath();ctx.arc(z.x,z.y,z.r*1.48+Math.sin(now*.009)*2,0,Math.PI*2);ctx.stroke();
    }
    const barW=z.r*2.35;
    if(z.hp<z.maxHp){
      ctx.fillStyle="rgba(10,14,13,.82)";ctx.fillRect(z.x-barW/2,z.y-z.r*1.65,barW,4);
      ctx.fillStyle=z.hp<z.maxHp*.3?"#ff5252":"#dc6262";ctx.fillRect(z.x-barW/2,z.y-z.r*1.65,barW*Math.max(0,z.hp/z.maxHp),4);
    }
    ctx.restore();
  });
};

G.renderZombiePortrait=function(canvas,type){
  if(!canvas)return;
  const ctx=canvas.getContext("2d");if(!ctx)return;
  const key=type==="tank"?"tank":"normal";
  loadSprite(key).then(img=>{
    if(!img)return;
    const W=canvas.width,H=canvas.height;
    ctx.clearRect(0,0,W,H);
    const bg=ctx.createRadialGradient(W*.5,H*.4,4,W*.5,H*.55,Math.max(W,H)*.7);
    bg.addColorStop(0,"#294b3a");bg.addColorStop(1,"#07100c");
    ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
    const s=Math.min(W/(key==="tank"?180:150),H/190);
    ctx.save();ctx.translate(W/2,H*.57);drawSprite(ctx,img,0,0,(key==="tank"?180:150)*s,190*s,false,1);ctx.restore();
  });
};

G.drawPlayer=G.drawPlayerV8;
G.drawZombie=G.drawZombieV8;
