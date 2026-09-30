// V8.1 Sprite-sheet character renderer
// One render owner: no procedural character layers are allowed to render after this module.
const G=globalThis;
const SHEET="./assets/v8/characters.svg";
let sheetPromise=null;
const FRAME=128;
const DIRS=8;
function loadSheet(){
  if(sheetPromise)return sheetPromise;
  const img=new Image();
  img.decoding="async";
  img.src=SHEET;
  sheetPromise=new Promise(resolve=>{img.onload=()=>resolve(img);img.onerror=()=>resolve(null)});
  return sheetPromise;
}
function moving(){
  return ["w","a","s","d","arrowup","arrowdown","arrowleft","arrowright"].some(k=>G.keys?.has(k));
}
function dir8(angle){
  return ((Math.round(angle/(Math.PI/4))%8)+8)%8;
}
function frame4(now,speed=115){
  return Math.floor(now/speed)%4;
}
function aimAngle(){
  return G.aim?.()||0;
}
function drawFrame(ctx,img,row,frame,x,y,w,h,alpha=1,rotation=0){
  if(!img)return;
  ctx.save();
  ctx.translate(x,y);
  ctx.rotate(rotation);
  ctx.globalAlpha=alpha;
  ctx.imageSmoothingEnabled=true;
  ctx.drawImage(img,frame*FRAME,row*FRAME,FRAME,FRAME,-w/2,-h/2,w,h);
  ctx.restore();
}
function shadow(ctx,x,y,rx,ry,alpha=.38){
  ctx.save();ctx.fillStyle="rgba(0,0,0,"+alpha+")";
  ctx.beginPath();ctx.ellipse(x+2,y,rx,ry,0,0,Math.PI*2);ctx.fill();ctx.restore();
}
function playerRow(a){return dir8(a);}
function zombieRow(z){
  if(z.type==="tank")return 16+dir8(Math.atan2(G.player.y-z.y,G.player.x-z.x));
  return 8+dir8(Math.atan2(G.player.y-z.y,G.player.x-z.x));
}
function playerWeaponOverlay(ctx,p,a,now){
  ctx.save();
  ctx.translate(p.x,p.y-2);
  ctx.rotate(a);
  const recoil=Math.max(0,p.recoil||0);
  ctx.translate(-recoil,0);
  // Compact tactical rifle overlay guarantees the weapon stays visible at every aim angle.
  ctx.fillStyle="#11181d";ctx.strokeStyle="#6f7d84";ctx.lineWidth=1.4;
  ctx.beginPath();ctx.roundRect(10,-3,42,7,2);ctx.fill();ctx.stroke();
  ctx.fillStyle="#273238";ctx.fillRect(20,4,9,13);ctx.fillRect(39,2,8,7);
  ctx.fillStyle="#8e9ba1";ctx.fillRect(45,-2,13,3);
  ctx.fillStyle="#0a1014";ctx.fillRect(54,-1,10,2);
  if(p.muzzle>0){
    const c=G.weapons?.[G.selectedWeapon]?.color||"#ffd36a";
    ctx.globalAlpha=Math.min(1,p.muzzle/90);ctx.shadowColor=c;ctx.shadowBlur=18;ctx.fillStyle=c;
    ctx.beginPath();ctx.moveTo(62,0);ctx.lineTo(76,-7);ctx.lineTo(70,0);ctx.lineTo(77,7);ctx.closePath();ctx.fill();
  }
  ctx.restore();
}
G.drawPlayerV8=function(){
  const ctx=G.ctx,p=G.player,now=performance.now();
  loadSheet().then(img=>{
    if(!img||!G.ctx)return;
    const movingNow=moving();
    const state=p.hp<=0?"death":p.hitFlash>0?"hurt":p.dashTime>0?"dash":movingNow?"walk":"idle";
    const a=aimAngle(),dir=playerRow(a),f=state==="walk"||state==="dash"?frame4(now,95):state==="idle"?0:3;
    const bob=state==="walk"?Math.abs(Math.sin(now*.014))*2:Math.sin(now*.0025)*.7;
    const alpha=G.invuln>0&&Math.floor(G.invuln/70)%2===0?.45:state==="death"?(p.deathTimer==null?1:Math.max(0,p.deathTimer/520)):1;
    shadow(ctx,p.x,p.y+27,25,8,.42);
    drawFrame(ctx,img,dir,f,p.x,p.y-3-bob,Math.max(76,p.r*3.0),Math.max(84,p.r*3.5),alpha);
    playerWeaponOverlay(ctx,p,a,now);
    if(state==="hurt"){ctx.strokeStyle="rgba(255,82,78,.85)";ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.x,p.y,31+Math.sin(now*.05)*2,0,Math.PI*2);ctx.stroke();}
    if(state==="dash"){ctx.strokeStyle="rgba(105,216,255,.45)";ctx.lineWidth=3;ctx.beginPath();ctx.arc(p.x,p.y,32+Math.sin(now*.03)*3,0,Math.PI*2);ctx.stroke();}
    if(p.shield>0&&G.equipmentHas?.("shield")){ctx.strokeStyle="rgba(100,220,255,.42)";ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.x,p.y,35+Math.sin(now*.008)*2,0,Math.PI*2);ctx.stroke();}
  });
};
const ZOMBIE_SHEET="./assets/v9/zombie-body.svg?v=9.2.1";
let zombieSheetPromise=null;
function loadZombieSheet(){
  if(zombieSheetPromise)return zombieSheetPromise;
  const img=new Image(); img.decoding="async"; img.src=ZOMBIE_SHEET;
  zombieSheetPromise=new Promise(resolve=>{img.onload=()=>resolve(img);img.onerror=()=>resolve(null)});
  return zombieSheetPromise;
}
G.drawZombieV8=function(z){
  const ctx=G.ctx,now=performance.now();
  if(z.x<G.camera.x-180||z.x>G.camera.x+G.W+180||z.y<G.camera.y-180||z.y>G.camera.y+G.H+180)return;
  loadZombieSheet().then(img=>{
    if(!img||!G.ctx)return;
    const dead=z.hp<=0&&z.deathTimer>0;
    const t=dead?1-z.deathTimer/520:0;
    const movingZombie=!dead&&(Math.abs(z.vx||0)+Math.abs(z.vy||0)>2);
    const f=dead?3:(movingZombie?Math.floor(now/115)%4:Math.floor(now/360)%2);
    const scale=(z.type==="tank"?1.28:(z.type==="exploder"?1.08:1));
    const w=Math.max(72,z.r*2.95*scale),h=Math.max(82,z.r*3.45*scale);
    const a=Math.atan2(G.player.y-z.y,G.player.x-z.x);
    const alpha=dead?Math.max(0,1-t*1.2):(z.flash>0?.72:1);
    const hue={fast:18,exploder:338,hunter:275,spitter:105,leaper:32,screamer:300}[z.type];
    shadow(ctx,z.x,z.y+z.r*1.08,z.r*1.08,z.r*.3,.43);
    ctx.save();
    if(dead)ctx.translate(z.x,z.y+t*18);
    ctx.translate(z.x,z.y-z.r*.05); ctx.rotate(a+Math.PI/2); ctx.globalAlpha=alpha;
    if(hue!==undefined)ctx.filter="hue-rotate("+hue+"deg) saturate(1.25)";
    ctx.imageSmoothingEnabled=true;
    ctx.drawImage(img,f*128,0,128,128,-w/2,-h/2,w,h);
    ctx.restore();
    if(z.type==="tank"){
      ctx.strokeStyle="rgba(45,45,45,.9)";ctx.lineWidth=5;ctx.beginPath();ctx.arc(z.x,z.y,z.r*1.08,0,Math.PI*2);ctx.stroke();
    }
    if(z.type==="exploder"){
      ctx.fillStyle="rgba(255,92,48,.22)";ctx.beginPath();ctx.arc(z.x,z.y,z.r*.7+Math.sin(now*.012)*3,0,Math.PI*2);ctx.fill();
    }
    if(z.burnUntil>now){ctx.strokeStyle="rgba(255,112,38,.7)";ctx.lineWidth=2;ctx.beginPath();ctx.arc(z.x,z.y,z.r*1.3+Math.sin(now*.01)*3,0,Math.PI*2);ctx.stroke();}
    if(z.elite){ctx.strokeStyle="rgba(255,211,72,.82)";ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(z.x,z.y,z.r*1.5+Math.sin(now*.009)*2,0,Math.PI*2);ctx.stroke();}
    if(z.hp<z.maxHp){const bw=z.r*2.35;ctx.fillStyle="rgba(10,14,13,.82)";ctx.fillRect(z.x-bw/2,z.y-z.r*1.65,bw,4);ctx.fillStyle=z.hp<z.maxHp*.3?"#ff5252":"#dc6262";ctx.fillRect(z.x-bw/2,z.y-z.r*1.65,bw*Math.max(0,z.hp/z.maxHp),4);}
  });
};
G.renderZombiePortrait=function(canvas,type){
  if(!canvas)return;const ctx=canvas.getContext("2d");if(!ctx)return;
  loadSheet().then(img=>{if(!img)return;const W=canvas.width,H=canvas.height;ctx.clearRect(0,0,W,H);const bg=ctx.createRadialGradient(W*.5,H*.4,4,W*.5,H*.55,Math.max(W,H)*.7);bg.addColorStop(0,"#294b3a");bg.addColorStop(1,"#07100c");ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);const row=type==="tank"?16:8;drawFrame(ctx,img,row,0,W/2,H*.56,Math.min(W*.8,H*.8),Math.min(W*.9,H*.9),1);});
};
G.drawPlayer=G.drawPlayerV8;
G.drawZombie=G.drawZombieV8;
