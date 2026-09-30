import "./Runtime.js";
const G=globalThis;

// Input is intentionally kept separate so future controls can be changed without touching game logic.
G.keys = new Set();
G.mouse = {x: G.W/2, y: G.H/2, down:false};

addEventListener("keydown", e=>{
  G.keys.add(e.key.toLowerCase());
  if([" ","arrowup","arrowdown","arrowleft","arrowright"].includes(e.key.toLowerCase())) e.preventDefault();
  if(e.key.toLowerCase()==="b") G.toggleShop();
  if(e.key.toLowerCase()==="g") G.throwGrenade();
  if(e.key.toLowerCase()==="q") G.useShockwave?.();
  if(e.key.toLowerCase()==="e") G.useEmergencyHeal?.();
  if(e.key==="Escape") G.closeOverlays();
});
addEventListener("keyup", e=>G.keys.delete(e.key.toLowerCase()));
G.canvas.addEventListener("mousemove", e=>{G.mouse.x=e.clientX;G.mouse.y=e.clientY});
G.canvas.addEventListener("mousedown", e=>{if(e.button===0)G.mouse.down=true});
addEventListener("mouseup", e=>{if(e.button===0)G.mouse.down=false});


const touch = {moveId:null, aimId:null, baseX:0, baseY:0, aimX:0, aimY:0};
const isTouchDevice = () => matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
function setKey(k,on){if(on)G.keys.add(k);else G.keys.delete(k)}
function setAim(clientX,clientY){G.mouse.x=clientX;G.mouse.y=clientY}
function moveStick(x,y){
  const dx=x-touch.baseX,dy=y-touch.baseY,len=Math.hypot(dx,dy)||1,max=58,scale=Math.min(1,max/len);
  const nx=dx/len*scale,ny=dy/len*scale;
  setKey('a',nx<-.22);setKey('d',nx>.22);setKey('w',ny<-.22);setKey('s',ny>.22);
  const knob=document.getElementById('touchMoveKnob');if(knob)knob.style.transform=`translate(${nx*58}px,${ny*58}px)`;
}
function resetMove(){['a','d','w','s'].forEach(k=>setKey(k,false));const knob=document.getElementById('touchMoveKnob');if(knob)knob.style.transform='translate(0,0)'}
function resetAim(){G.mouse.down=false;const dot=document.getElementById('touchAimDot');if(dot)dot.style.transform='translate(0,0)'}
function buttonAction(action){
  if(action==='reload')G.startReload();
  else if(action==='dash')G.dash();
  else if(action==='melee')G.melee();
  else if(action==='grenade')G.throwGrenade();
  else if(action==='shock')G.useShockwave?.();
  else if(action==='heal')G.useEmergencyHeal?.();
}
function setupTouchControls(){
  if(!isTouchDevice())return;
  const root=document.getElementById('touchControls');if(!root)return;
  const move=document.getElementById('touchMove'),aim=document.getElementById('touchAim');
  const moveStart=e=>{e.preventDefault();const t=e.changedTouches[0];touch.moveId=t.identifier;touch.baseX=t.clientX;touch.baseY=t.clientY;moveStick(t.clientX,t.clientY)};
  const moveMove=e=>{for(const t of e.changedTouches)if(t.identifier===touch.moveId){e.preventDefault();moveStick(t.clientX,t.clientY)}};
  const moveEnd=e=>{for(const t of e.changedTouches)if(t.identifier===touch.moveId){touch.moveId=null;resetMove()}};
  move.addEventListener('touchstart',moveStart,{passive:false});move.addEventListener('touchmove',moveMove,{passive:false});move.addEventListener('touchend',moveEnd,{passive:false});move.addEventListener('touchcancel',moveEnd,{passive:false});
  const aimStart=e=>{e.preventDefault();const t=e.changedTouches[0];touch.aimId=t.identifier;setAim(t.clientX,t.clientY);G.mouse.down=true};
  const aimMove=e=>{for(const t of e.changedTouches)if(t.identifier===touch.aimId){e.preventDefault();setAim(t.clientX,t.clientY);const el=document.getElementById('touchAimDot');if(el){const r=aim.getBoundingClientRect();const dx=t.clientX-(r.left+r.width/2),dy=t.clientY-(r.top+r.height/2),len=Math.hypot(dx,dy)||1,s=Math.min(45/len,1);el.style.transform=`translate(${dx*s}px,${dy*s}px)`}}};
  const aimEnd=e=>{for(const t of e.changedTouches)if(t.identifier===touch.aimId){touch.aimId=null;resetAim()}};
  aim.addEventListener('touchstart',aimStart,{passive:false});aim.addEventListener('touchmove',aimMove,{passive:false});aim.addEventListener('touchend',aimEnd,{passive:false});aim.addEventListener('touchcancel',aimEnd,{passive:false});
  root.querySelectorAll('[data-touch-weapon]').forEach(btn=>{
    btn.addEventListener('touchstart',e=>{e.preventDefault();const w=Number(btn.dataset.touchWeapon);if(G.owned?.[w]){G.selectedWeapon=w;G.showMessage?.(G.weapons[w]?.name||('武器 '+w),500)}else{G.showMessage?.('🔒 该武器尚未解锁',700);G.playSound?.('error')}} ,{passive:false});
  });
  root.querySelectorAll('[data-touch-action]').forEach(btn=>{
    const action=btn.dataset.touchAction;
    btn.addEventListener('touchstart',e=>{e.preventDefault();buttonAction(action)},{passive:false});
  });
}
addEventListener('load',setupTouchControls);
