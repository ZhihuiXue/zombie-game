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
