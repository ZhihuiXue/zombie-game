// Dedicated zombie renderer shared by gameplay and Codex portraits.
const G=globalThis;
G.drawZombie = function(z){
  if(z.x<G.camera.x-90||z.x>G.camera.x+G.W+90||z.y<G.camera.y-90||z.y>G.camera.y+G.H+90)return;
  const ctx=G.ctx, now=performance.now(), r=z.r, moving=Math.sin(now*.012+(z.x+z.y)*.01), step=moving*4*(z.speed>80?1.35:.75), flash=z.flash>0;
  ctx.save();ctx.translate(z.x,z.y);
  // Every zombie has a soft contact shadow; larger bodies cast a longer one.
  ctx.fillStyle='rgba(0,0,0,.30)';ctx.beginPath();ctx.ellipse(0,r*.88,r*.95,r*.32,0,0,Math.PI*2);ctx.fill();

  const palettes={normal:['#789878','#486348'],fast:['#c9a15a','#74552c'],tank:['#6d7880','#3a4449'],exploder:['#b97548','#6d3927'],hunter:['#9b6da0','#533b5b'],spitter:['#62a78c','#2e6655'],leaper:['#b48b58','#684e32'],screamer:['#a95caf','#59315f']};
  const pal=palettes[z.type]||palettes.normal;
  const low=z.hp<z.maxHp*.3, injured=z.hp<z.maxHp*.62;
  const lean=z.type==='runner'||z.type==='fast'?-.08:(z.type==='hunter'?-.15:(z.type==='leaper'?.08:0));
  ctx.rotate(lean);

  // Legs / torn pants.
  ctx.strokeStyle='#28312d';ctx.lineWidth=Math.max(5,r*.22);ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(-r*.28,r*.48);ctx.lineTo(-r*.42+step,r*.95);ctx.moveTo(r*.28,r*.48);ctx.lineTo(r*.42-step,r*.95);ctx.stroke();
  if(z.type==='tank'){ctx.strokeStyle='#4d5559';ctx.lineWidth=r*.3;ctx.beginPath();ctx.moveTo(-r*.3,r*.42);ctx.lineTo(-r*.48,r*.95);ctx.moveTo(r*.3,r*.42);ctx.lineTo(r*.48,r*.95);ctx.stroke();}

  // Torso with a vertical light-to-dark gradient.
  const bg=ctx.createLinearGradient(-r,-r*.25,r,r*1.0);bg.addColorStop(0,pal[0]);bg.addColorStop(.58,pal[0]);bg.addColorStop(1,pal[1]);
  const torsoW=z.type==='tank'?r*1.65:r*1.25, torsoH=z.type==='tank'?r*1.35:r*1.15;
  ctx.fillStyle=bg;ctx.beginPath();ctx.roundRect(-torsoW/2,-r*.15,torsoW,torsoH,Math.max(4,r*.18));ctx.fill();
  // Ragged clothing cuts.
  ctx.fillStyle='rgba(20,25,22,.28)';ctx.beginPath();ctx.moveTo(-torsoW/2,r*.45);ctx.lineTo(-r*.1,r*.28);ctx.lineTo(r*.05,r*.85);ctx.lineTo(r*.35,r*.48);ctx.lineTo(torsoW/2,r*.72);ctx.lineTo(torsoW/2,torsoH);ctx.lineTo(-torsoW/2,torsoH);ctx.closePath();ctx.fill();
  ctx.strokeStyle='rgba(220,235,220,.12)';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(-r*.45,-r*.05);ctx.lineTo(-r*.25,r*.7);ctx.moveTo(r*.18,-r*.05);ctx.lineTo(r*.1,r*.7);ctx.stroke();

  // Arms with asymmetric posture. Special zombies get readable silhouettes.
  const armDrop=z.type==='runner'||z.type==='hunter'?-2:2;
  ctx.strokeStyle=pal[0];ctx.lineWidth=Math.max(5,r*.18);ctx.beginPath();ctx.moveTo(-torsoW*.42,0);ctx.lineTo(-r*.92,8+step+armDrop);ctx.lineTo(-r*.75,15+step);ctx.moveTo(torsoW*.42,0);ctx.lineTo(r*.92,8-step-armDrop);ctx.lineTo(r*.75,15-step);ctx.stroke();
  if(z.type==='hunter'||z.type==='leaper'){ctx.lineWidth=Math.max(4,r*.15);ctx.strokeStyle=pal[1];ctx.beginPath();ctx.moveTo(-r*.7,10);ctx.lineTo(-r*1.15,18-step);ctx.moveTo(r*.7,10);ctx.lineTo(r*1.15,18+step);ctx.stroke();}

  // Head + jaw. Spitter/Screamer get distinctive facial shapes.
  const headR=z.type==='tank'?r*.63:r*.58;
  const hg=ctx.createRadialGradient(-headR*.3,-r*.62,2,headR*.2,-r*.45,headR*1.5);hg.addColorStop(0,injured?'#a9b39b':pal[0]);hg.addColorStop(.72,pal[0]);hg.addColorStop(1,pal[1]);
  ctx.fillStyle=hg;ctx.beginPath();ctx.arc(0,-r*.62,headR,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='rgba(15,18,15,.35)';ctx.beginPath();ctx.arc(0,-r*.47,headR*.72,0,Math.PI);ctx.fill();
  // Hair / exposed scalp.
  ctx.fillStyle=z.type==='screamer'?'#2c202d':'#302d28';ctx.beginPath();ctx.arc(0,-r*.82,headR*.88,Math.PI,Math.PI*2);ctx.fill();
  // Eyes: directional and type-specific.
  const eyeY=-r*.68, eyeX=headR*.28;
  ctx.fillStyle=z.type==='screamer'?'#f3a1ff':z.type==='spitter'?'#8fffd0':z.type==='hunter'?'#ffd36b':'#e74b45';
  ctx.beginPath();ctx.ellipse(-eyeX,eyeY,Math.max(1.8,r*.11),Math.max(1.4,r*.07),0,0,Math.PI*2);ctx.ellipse(eyeX,eyeY,Math.max(1.8,r*.11),Math.max(1.4,r*.07),0,0,Math.PI*2);ctx.fill();
  // Mouth / jaw.
  if(z.type==='screamer'){ctx.fillStyle='#24151f';ctx.beginPath();ctx.ellipse(0,-r*.38,r*.34,r*.23,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#f0cbdc';for(let i=-1;i<=1;i++){ctx.fillRect(i*r*.12,-r*.52,r*.055,r*.12);}}
  else if(z.type==='spitter'){ctx.fillStyle='#1c322b';ctx.beginPath();ctx.ellipse(0,-r*.36,r*.3,r*.16,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#74efb1';ctx.beginPath();ctx.arc(0,-r*.29,r*.09,0,Math.PI*2);ctx.fill();}
  else {ctx.fillStyle='#3a2823';ctx.beginPath();ctx.arc(0,-r*.38,r*.23,0,Math.PI);ctx.fill();ctx.strokeStyle='#e6d5c8';ctx.lineWidth=Math.max(1,r*.04);ctx.beginPath();ctx.moveTo(-r*.14,-r*.38);ctx.lineTo(-r*.08,-r*.29);ctx.moveTo(0,-r*.4);ctx.lineTo(r*.04,-r*.3);ctx.moveTo(r*.12,-r*.38);ctx.lineTo(r*.16,-r*.3);ctx.stroke();}

  // Type-specific visual language.
  if(z.type==='tank'){
    ctx.fillStyle='#3d474d';ctx.beginPath();ctx.roundRect(-r*.83,-r*.2,r*1.66,r*.82,5);ctx.fill();
    ctx.strokeStyle='#a8b7be';ctx.lineWidth=2;ctx.strokeRect(-r*.72,-r*.08,r*1.44,r*.55);
    ctx.fillStyle='#75868f';ctx.fillRect(-r*.58,r*.02,r*.42,r*.15);ctx.fillRect(r*.16,r*.02,r*.42,r*.15);
  }
  if(z.type==='exploder'){
    ctx.strokeStyle='#ff7a3c';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(0,r*.25,r*.9,0,Math.PI*2);ctx.stroke();
    ctx.fillStyle='#f2a05d';for(let i=0;i<4;i++){const aa=now*.002+i*1.57;ctx.beginPath();ctx.arc(Math.cos(aa)*r*.72,Math.sin(aa)*r*.62,2,0,Math.PI*2);ctx.fill();}
  }
  if(z.type==='leaper'){
    ctx.strokeStyle='rgba(247,205,102,.85)';ctx.lineWidth=2;ctx.setLineDash([4,4]);ctx.beginPath();ctx.arc(0,0,r+7,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
  }
  if(z.type==='screamer'){
    const pulse=9+Math.sin(now*.01)*3;ctx.strokeStyle='rgba(229,137,255,.55)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,-r*.3,pulse,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(0,-r*.3,pulse+7,0,Math.PI*2);ctx.stroke();
  }
  if(z.type==='hunter'){ctx.fillStyle='#34243a';ctx.fillRect(-r*.45,-r*.05,r*.9,r*.16);}
  if(z.type==='fast'){ctx.strokeStyle='#d7b56a';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-r*.6,r*.45);ctx.lineTo(-r*.2,r*.7);ctx.moveTo(r*.6,r*.45);ctx.lineTo(r*.2,r*.7);ctx.stroke();}
  if(z.burnUntil>now){ctx.globalCompositeOperation='screen';ctx.fillStyle='rgba(255,104,35,.25)';ctx.beginPath();ctx.arc(0,-r*.2,r*1.15,0,Math.PI*2);ctx.fill();ctx.globalCompositeOperation='source-over';for(let i=0;i<3;i++){const aa=now*.006+i*2.1;ctx.fillStyle=i===0?'#fff0a0':'#ff7b28';ctx.beginPath();ctx.arc(Math.cos(aa)*r*.6,Math.sin(aa)*r*.65-r*.15,2.2,0,Math.PI*2);ctx.fill();}}
  if(low){ctx.fillStyle='rgba(120,20,20,.25)';ctx.beginPath();ctx.arc(0,-r*.1,r*1.05,0,Math.PI*2);ctx.fill();}
  if(flash){ctx.globalCompositeOperation='screen';ctx.fillStyle='rgba(255,255,255,.42)';ctx.beginPath();ctx.arc(0,-r*.15,r*1.02,0,Math.PI*2);ctx.fill();ctx.globalCompositeOperation='source-over';}
  ctx.restore();
  if(z.hp<z.maxHp){const w=r*2.15;ctx.fillStyle='rgba(12,18,16,.78)';ctx.fillRect(z.x-w/2,z.y-r-20,w,4);ctx.fillStyle=low?'#ff4b4b':'#d95757';ctx.fillRect(z.x-w/2,z.y-r-20,w*Math.max(0,z.hp/z.maxHp),4);}
};

G.renderZombiePortrait = function(canvas,type){
  if(!canvas)return;
  const ctx=canvas.getContext('2d'); if(!ctx)return;
  const W=canvas.width||180,H=canvas.height||150;
  const defs={normal:[28,52,105],fast:[20,92,75],tank:[38,35,300],exploder:[25,55,95],hunter:[22,120,115],spitter:[24,48,120],leaper:[23,100,130],screamer:[25,58,90]};
  const d=defs[type]||defs.normal;
  const scale=Math.min(W/170,H/170);
  const z={x:85,y:92,r:d[0],speed:d[1],hp:d[2],maxHp:d[2],type,flash:0,burnUntil:0};

  ctx.save();
  ctx.setTransform(1,0,0,1,0,0);
  ctx.clearRect(0,0,W,H);
  const bg=ctx.createRadialGradient(W*.46,H*.40,5,W*.5,H*.55,Math.max(W,H)*.72);
  bg.addColorStop(0,'#294b3a'); bg.addColorStop(1,'#07100c');
  ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
  ctx.translate((W-170*scale)/2,(H-170*scale)/2);
  ctx.scale(scale,scale);

  // Portrait-only version of the same visual language as drawZombie().
  const now=performance.now(),r=z.r,moving=Math.sin(now*.012)*4,step=moving*(z.speed>80?1.35:.75);
  const palettes={normal:['#789878','#486348'],fast:['#c9a15a','#74552c'],tank:['#6d7880','#3a4449'],exploder:['#b97548','#6d3927'],hunter:['#9b6da0','#533b5b'],spitter:['#62a78c','#2e6655'],leaper:['#b48b58','#684e32'],screamer:['#a95caf','#59315f']};
  const pal=palettes[type]||palettes.normal;
  ctx.save();ctx.translate(z.x,z.y);
  ctx.fillStyle='rgba(0,0,0,.30)';ctx.beginPath();ctx.ellipse(0,r*.88,r*.95,r*.32,0,0,Math.PI*2);ctx.fill();
  const lean=type==='fast'?.08:type==='hunter'?.15:type==='leaper'?.08:0;ctx.rotate(lean);
  ctx.strokeStyle='#28312d';ctx.lineWidth=Math.max(5,r*.22);ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(-r*.28,r*.48);ctx.lineTo(-r*.42+step,r*.95);ctx.moveTo(r*.28,r*.48);ctx.lineTo(r*.42-step,r*.95);ctx.stroke();
  if(type==='tank'){ctx.strokeStyle='#4d5559';ctx.lineWidth=r*.3;ctx.beginPath();ctx.moveTo(-r*.3,r*.42);ctx.lineTo(-r*.48,r*.95);ctx.moveTo(r*.3,r*.42);ctx.lineTo(r*.48,r*.95);ctx.stroke();}
  const torsoW=type==='tank'?r*1.65:r*1.25, torsoH=type==='tank'?r*1.35:r*1.15;
  const bg2=ctx.createLinearGradient(-r,-r*.25,r,r);bg2.addColorStop(0,pal[0]);bg2.addColorStop(1,pal[1]);
  ctx.fillStyle=bg2;ctx.beginPath();ctx.roundRect(-torsoW/2,-r*.15,torsoW,torsoH,Math.max(4,r*.18));ctx.fill();
  ctx.fillStyle='rgba(20,25,22,.28)';ctx.beginPath();ctx.moveTo(-torsoW/2,r*.45);ctx.lineTo(-r*.1,r*.28);ctx.lineTo(r*.05,r*.85);ctx.lineTo(r*.35,r*.48);ctx.lineTo(torsoW/2,r*.72);ctx.lineTo(torsoW/2,torsoH);ctx.lineTo(-torsoW/2,torsoH);ctx.closePath();ctx.fill();
  const armDrop=type==='fast'||type==='hunter'?-2:2;ctx.strokeStyle=pal[0];ctx.lineWidth=Math.max(5,r*.18);ctx.beginPath();ctx.moveTo(-torsoW*.42,0);ctx.lineTo(-r*.92,8+step+armDrop);ctx.lineTo(-r*.75,15+step);ctx.moveTo(torsoW*.42,0);ctx.lineTo(r*.92,8-step-armDrop);ctx.lineTo(r*.75,15-step);ctx.stroke();
  if(type==='hunter'||type==='leaper'){ctx.lineWidth=Math.max(4,r*.15);ctx.strokeStyle=pal[1];ctx.beginPath();ctx.moveTo(-r*.7,10);ctx.lineTo(-r*1.15,18-step);ctx.moveTo(r*.7,10);ctx.lineTo(r*1.15,18+step);ctx.stroke();}
  const headR=type==='tank'?r*.63:r*.58;const hg=ctx.createRadialGradient(-headR*.3,-r*.62,2,headR*.2,-r*.45,headR*1.5);hg.addColorStop(0,pal[0]);hg.addColorStop(.72,pal[0]);hg.addColorStop(1,pal[1]);ctx.fillStyle=hg;ctx.beginPath();ctx.arc(0,-r*.62,headR,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='rgba(15,18,15,.35)';ctx.beginPath();ctx.arc(0,-r*.47,headR*.72,0,Math.PI);ctx.fill();
  ctx.fillStyle=type==='screamer'?'#2c202d':'#302d28';ctx.beginPath();ctx.arc(0,-r*.82,headR*.88,Math.PI,Math.PI*2);ctx.fill();
  const eyeY=-r*.68,eyeX=headR*.28;ctx.fillStyle=type==='screamer'?'#f3a1ff':type==='spitter'?'#8fffd0':type==='hunter'?'#ffd36b':'#e74b45';ctx.beginPath();ctx.ellipse(-eyeX,eyeY,Math.max(1.8,r*.11),Math.max(1.4,r*.07),0,0,Math.PI*2);ctx.ellipse(eyeX,eyeY,Math.max(1.8,r*.11),Math.max(1.4,r*.07),0,0,Math.PI*2);ctx.fill();
  if(type==='screamer'){ctx.fillStyle='#24151f';ctx.beginPath();ctx.ellipse(0,-r*.38,r*.34,r*.23,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#f0cbdc';for(let i=-1;i<=1;i++)ctx.fillRect(i*r*.12,-r*.52,r*.055,r*.12);}
  else if(type==='spitter'){ctx.fillStyle='#1c322b';ctx.beginPath();ctx.ellipse(0,-r*.36,r*.3,r*.16,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#74efb1';ctx.beginPath();ctx.arc(0,-r*.29,r*.09,0,Math.PI*2);ctx.fill();}
  else {ctx.fillStyle='#3a2823';ctx.beginPath();ctx.arc(0,-r*.38,r*.23,0,Math.PI);ctx.fill();ctx.strokeStyle='#e6d5c8';ctx.lineWidth=Math.max(1,r*.04);ctx.beginPath();ctx.moveTo(-r*.14,-r*.38);ctx.lineTo(-r*.08,-r*.29);ctx.moveTo(0,-r*.4);ctx.lineTo(r*.04,-r*.3);ctx.moveTo(r*.12,-r*.38);ctx.lineTo(r*.16,-r*.3);ctx.stroke();}
  if(type==='tank'){ctx.fillStyle='#3d474d';ctx.beginPath();ctx.roundRect(-r*.83,-r*.2,r*1.66,r*.82,5);ctx.fill();ctx.strokeStyle='#a8b7be';ctx.lineWidth=2;ctx.strokeRect(-r*.72,-r*.08,r*1.44,r*.55);ctx.fillStyle='#75868f';ctx.fillRect(-r*.58,r*.02,r*.42,r*.15);ctx.fillRect(r*.16,r*.02,r*.42,r*.15);}
  if(type==='exploder'){ctx.strokeStyle='#ff7a3c';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(0,r*.25,r*.9,0,Math.PI*2);ctx.stroke();}
  if(type==='leaper'){ctx.strokeStyle='rgba(247,205,102,.85)';ctx.lineWidth=2;ctx.setLineDash([4,4]);ctx.beginPath();ctx.arc(0,0,r+7,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);}
  if(type==='screamer'){ctx.strokeStyle='rgba(229,137,255,.55)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,-r*.3,11,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(0,-r*.3,18,0,Math.PI*2);ctx.stroke();}
  if(type==='hunter'){ctx.fillStyle='#34243a';ctx.fillRect(-r*.45,-r*.05,r*.9,r*.16);}
  if(type==='fast'){ctx.strokeStyle='#d7b56a';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-r*.6,r*.45);ctx.lineTo(-r*.2,r*.7);ctx.moveTo(r*.6,r*.45);ctx.lineTo(r*.2,r*.7);ctx.stroke();}
  ctx.restore();ctx.restore();
};
;


export {G};
