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
  if(z.elite){ctx.save();ctx.strokeStyle='rgba(255,205,70,.72)';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(0,0,r*1.42+Math.sin(now*.009)*3,0,Math.PI*2);ctx.stroke();ctx.restore();}
  const lean=z.type==='runner'||z.type==='fast'?-.08:(z.type==='hunter'?-.15:(z.type==='leaper'?.08:0));
  ctx.rotate(lean);

  // Full readable legs: knees, shins and boots are intentionally longer than the torso.
  const legLen=z.type==='tank'?r*.78:r*.95;
  const kneeY=r*.62, footY=r*1.22;
  const lKneeX=-r*.34+step, rKneeX=r*.34-step;
  ctx.lineCap='round';ctx.lineJoin='round';
  ctx.strokeStyle='#242b28';ctx.lineWidth=Math.max(6,r*.24);
  ctx.beginPath();
  ctx.moveTo(-r*.28,r*.43);ctx.lineTo(lKneeX,kneeY);ctx.lineTo(-r*.42+step*.55,footY);
  ctx.moveTo(r*.28,r*.43);ctx.lineTo(rKneeX,kneeY);ctx.lineTo(r*.42-step*.55,footY);
  ctx.stroke();
  // Knee highlights and heavy boots make the contact with the ground obvious.
  ctx.fillStyle='#3b453f';
  ctx.beginPath();ctx.arc(lKneeX,kneeY,Math.max(2,r*.12),0,Math.PI*2);ctx.arc(rKneeX,kneeY,Math.max(2,r*.12),0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#161c1a';
  ctx.beginPath();
  ctx.ellipse(-r*.45+step*.55,footY+2,r*.27,r*.12,-.10,0,Math.PI*2);
  ctx.ellipse(r*.45-step*.55,footY+2,r*.27,r*.12,.10,0,Math.PI*2);
  ctx.fill();
  if(z.type==='fast'||z.type==='hunter'){ctx.strokeStyle='rgba(230,205,130,.7)';ctx.lineWidth=Math.max(2,r*.06);ctx.beginPath();ctx.moveTo(-r*.55+step*.55,footY);ctx.lineTo(-r*.35+step*.55,footY+1);ctx.moveTo(r*.35-step*.55,footY+1);ctx.lineTo(r*.55-step*.55,footY);ctx.stroke();}
  if(z.elite){ctx.fillStyle='rgba(255,210,70,.9)';ctx.beginPath();ctx.arc(0,-r*1.32,4,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ffe9a0';ctx.font='bold 9px Arial';ctx.textAlign='center';ctx.fillText('ELITE',0,-r*1.48);}
  if(z.type==='tank'){ctx.strokeStyle='#4d5559';ctx.lineWidth=r*.30;ctx.beginPath();ctx.moveTo(-r*.3,r*.42);ctx.lineTo(-r*.48,kneeY);ctx.lineTo(-r*.48,footY);ctx.moveTo(r*.3,r*.42);ctx.lineTo(r*.48,kneeY);ctx.lineTo(r*.48,footY);ctx.stroke();}

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
  if(z.elite){const w=r*2.45;ctx.fillStyle='rgba(18,15,8,.9)';ctx.fillRect(z.x-w/2,z.y-r-28,w,5);ctx.fillStyle='#ffd34e';ctx.fillRect(z.x-w/2,z.y-r-28,w*Math.max(0,z.hp/z.maxHp),5);}
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

/* Zombie Visual V2 — stronger silhouettes, painterly lighting and readable types */
G.drawZombieV2=function(z){
  if(z.x<G.camera.x-100||z.x>G.camera.x+G.W+100||z.y<G.camera.y-100||z.y>G.camera.y+G.H+100)return;
  const ctx=G.ctx,now=performance.now(),r=z.r;
  const step=Math.sin(now*.012+(z.x+z.y)*.008)*4*(z.speed>80?1.25:.8);
  const palMap={
    normal:['#789b79','#3b5b45','#253a2c'],
    fast:['#d1a75d','#77552b','#382718'],
    tank:['#77838b','#465158','#252d32'],
    exploder:['#c67a4d','#733b2b','#3a211b'],
    hunter:['#a978a8','#593d60','#2a1c30'],
    spitter:['#68b193','#356e59','#1d382e'],
    leaper:['#bd955d','#715331','#38281b'],
    screamer:['#b963c1','#613466','#2c1931']
  };
  const pal=palMap[z.type]||palMap.normal,low=z.hp<z.maxHp*.3,flash=z.flash>0;
  ctx.save();ctx.translate(z.x,z.y);
  // shadow
  ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(1,r*1.18,r*1.05,r*.34,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='rgba(0,0,0,.16)';ctx.beginPath();ctx.ellipse(-r*.25,r*1.02,r*.7,r*.2,-.15,0,Math.PI*2);ctx.fill();

  const lean=z.type==='fast'?.13:z.type==='hunter'?.17:z.type==='leaper'?-.08:0;ctx.rotate(lean);

  // Legs are now chunky shapes rather than strokes.
  const lg=ctx.createLinearGradient(-r,0,r,r*1.2);lg.addColorStop(0,'#38413e');lg.addColorStop(1,'#171c1b');
  ctx.fillStyle=lg;
  ctx.beginPath();ctx.moveTo(-r*.48,r*.36);ctx.lineTo(-r*.05,r*.48);ctx.lineTo(-r*.20+step,r*.98);ctx.lineTo(-r*.50+step,r*1.25);ctx.lineTo(-r*.82+step,r*1.2);ctx.lineTo(-r*.58+step,r*.78);ctx.closePath();
  ctx.moveTo(r*.05,r*.48);ctx.lineTo(r*.48,r*.36);ctx.lineTo(r*.58-step,r*.78);ctx.lineTo(r*.82-step,r*1.2);ctx.lineTo(r*.50-step,r*1.25);ctx.lineTo(r*.20-step,r*.98);ctx.closePath();ctx.fill();
  ctx.fillStyle='#141817';ctx.beginPath();ctx.ellipse(-r*.65+step,r*1.28,r*.30,r*.12,-.1,0,Math.PI*2);ctx.ellipse(r*.65-step,r*1.28,r*.30,r*.12,.1,0,Math.PI*2);ctx.fill();

  // Type silhouette modifiers.
  const wide=z.type==='tank',thin=z.type==='hunter'||z.type==='fast';
  const torsoW=wide?r*1.72:thin?r*1.12:r*1.35;
  const torsoH=wide?r*1.48:r*1.22;
  const tg=ctx.createLinearGradient(-torsoW/2,-r*.2,torsoW/2,r*1.05);
  tg.addColorStop(0,pal[0]);tg.addColorStop(.52,pal[1]);tg.addColorStop(1,pal[2]);
  ctx.fillStyle=tg;ctx.beginPath();
  ctx.moveTo(-torsoW*.42,-r*.14);ctx.quadraticCurveTo(-torsoW*.56,r*.22,-torsoW*.42,torsoH*.72);
  ctx.lineTo(-torsoW*.25,torsoH);ctx.lineTo(torsoW*.25,torsoH);ctx.lineTo(torsoW*.42,torsoH*.72);
  ctx.quadraticCurveTo(torsoW*.56,r*.22,torsoW*.42,-r*.14);ctx.closePath();ctx.fill();
  ctx.strokeStyle='rgba(12,17,15,.85)';ctx.lineWidth=Math.max(1.5,r*.055);ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,.06)';ctx.beginPath();ctx.moveTo(-torsoW*.35,-r*.05);ctx.lineTo(-torsoW*.08,-r*.12);ctx.lineTo(-torsoW*.08,torsoH*.8);ctx.lineTo(-torsoW*.3,torsoH*.72);ctx.closePath();ctx.fill();

  // Ragged clothes / type-specific chest details.
  ctx.strokeStyle='rgba(225,235,220,.16)';ctx.lineWidth=Math.max(1,r*.035);
  ctx.beginPath();ctx.moveTo(-torsoW*.22,0);ctx.lineTo(-torsoW*.1,r*.72);ctx.moveTo(torsoW*.18,0);ctx.lineTo(torsoW*.08,r*.75);ctx.stroke();
  if(z.type==='tank'){
    ctx.fillStyle='#313b40';ctx.beginPath();ctx.roundRect(-r*.78,-r*.02,r*1.56,r*.62,5);ctx.fill();
    ctx.strokeStyle='rgba(190,205,210,.3)';ctx.lineWidth=1.5;ctx.strokeRect(-r*.68,.06,r*1.36,r*.45);
  }
  if(z.type==='exploder'){
    ctx.strokeStyle='rgba(255,112,54,.9)';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(0,r*.38,r*.78,0,Math.PI*2);ctx.stroke();
    ctx.fillStyle='#ff9b5d';ctx.beginPath();ctx.arc(-r*.34,r*.25,2.5,0,Math.PI*2);ctx.arc(r*.3,r*.52,2,0,Math.PI*2);ctx.fill();
  }

  // Arms: long, asymmetrical and type readable.
  const armY=z.type==='hunter'||z.type==='leaper'?-r*.02:r*.08;
  ctx.strokeStyle=pal[1];ctx.lineWidth=Math.max(5,r*.20);ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(-torsoW*.4,armY);ctx.lineTo(-r*.82,armY+r*.42+step);ctx.lineTo(-r*.72,armY+r*.75+step*.4);
  ctx.moveTo(torsoW*.4,armY);ctx.lineTo(r*.82,armY+r*.42-step);ctx.lineTo(r*.72,armY+r*.75-step*.4);ctx.stroke();
  if(thin){ctx.strokeStyle=pal[2];ctx.lineWidth=Math.max(2.5,r*.09);ctx.beginPath();ctx.moveTo(-r*.68,armY+r*.62);ctx.lineTo(-r*1.08,armY+r*.84);ctx.moveTo(r*.68,armY+r*.62);ctx.lineTo(r*1.08,armY+r*.84);ctx.stroke();}

  // Head: irregular silhouette + ears + hair.
  const headR=wide?r*.66:thin?r*.55:r*.61;
  const hg=ctx.createRadialGradient(-headR*.32,-r*.72,2,headR*.28,-r*.45,headR*1.5);
  hg.addColorStop(0,pal[0]);hg.addColorStop(.58,pal[1]);hg.addColorStop(1,pal[2]);
  ctx.fillStyle=hg;ctx.beginPath();ctx.moveTo(-headR*.9,-r*.7);ctx.quadraticCurveTo(-headR,-r*1.1,0,-r*1.12);
  ctx.quadraticCurveTo(headR,-r*1.05,headR*.9,-r*.68);ctx.lineTo(headR*.7,-r*.25);
  ctx.quadraticCurveTo(0,r*.02,-headR*.7,-r*.25);ctx.closePath();ctx.fill();
  ctx.strokeStyle='rgba(10,15,13,.75)';ctx.lineWidth=1.5;ctx.stroke();
  ctx.fillStyle=z.type==='screamer'?'#261b29':'#272622';ctx.beginPath();ctx.arc(0,-r*.88,headR*.82,Math.PI,Math.PI*2);ctx.fill();
  ctx.fillStyle='rgba(245,235,205,.12)';ctx.beginPath();ctx.arc(-headR*.3,-r*.82,headR*.35,3.4,5.2);ctx.fill();

  // Eyes and facial expression.
  const eyeY=-r*.68,eyeX=headR*.29;
  const eyeColor=z.type==='screamer'?'#f3a2ff':z.type==='spitter'?'#8fffc8':z.type==='hunter'?'#ffd76b':'#ff5750';
  ctx.fillStyle=eyeColor;ctx.shadowColor=eyeColor;ctx.shadowBlur=5;
  ctx.beginPath();ctx.ellipse(-eyeX,eyeY,Math.max(2,r*.11),Math.max(1.5,r*.07),-.08,0,Math.PI*2);ctx.ellipse(eyeX,eyeY,Math.max(2,r*.11),Math.max(1.5,r*.07),.08,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
  ctx.fillStyle='#21191a';ctx.beginPath();ctx.ellipse(0,-r*.38,r*.26,r*.17,0,0,Math.PI*2);ctx.fill();
  if(z.type==='screamer'){
    ctx.fillStyle='#f0d4df';for(let i=-1;i<=1;i++)ctx.fillRect(i*r*.12,-r*.51,r*.055,r*.12);
  }else if(z.type==='spitter'){
    ctx.fillStyle='#72efb2';ctx.beginPath();ctx.arc(0,-r*.28,r*.09,0,Math.PI*2);ctx.fill();
  }else{
    ctx.strokeStyle='#e8d7c9';ctx.lineWidth=Math.max(1,r*.035);ctx.beginPath();
    ctx.moveTo(-r*.13,-r*.4);ctx.lineTo(-r*.08,-r*.31);ctx.moveTo(0,-r*.41);ctx.lineTo(r*.04,-r*.31);ctx.moveTo(r*.12,-r*.4);ctx.lineTo(r*.16,-r*.31);ctx.stroke();
  }

  // Special visual signatures.
  if(z.type==='leaper'){
    ctx.strokeStyle='rgba(255,214,110,.7)';ctx.lineWidth=2;ctx.setLineDash([4,4]);ctx.beginPath();ctx.arc(0,0,r+8,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
  }
  if(z.type==='screamer'){
    const pulse=10+Math.sin(now*.01)*3;ctx.strokeStyle='rgba(232,125,255,.48)';ctx.lineWidth=2;
    ctx.beginPath();ctx.arc(0,-r*.32,pulse,0,Math.PI*2);ctx.arc(0,-r*.32,pulse+7,0,Math.PI*2);ctx.stroke();
  }
  if(z.type==='hunter'){ctx.fillStyle='#34243b';ctx.fillRect(-r*.48,-r*.08,r*.96,r*.15);}
  if(z.type==='fast'){ctx.strokeStyle='rgba(235,201,125,.7)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-r*.6,r*.35);ctx.lineTo(-r*.18,r*.65);ctx.moveTo(r*.6,r*.35);ctx.lineTo(r*.18,r*.65);ctx.stroke();}

  if(z.burnUntil>now){
    ctx.globalCompositeOperation='screen';ctx.fillStyle='rgba(255,100,35,.22)';ctx.beginPath();ctx.arc(0,-r*.25,r*1.18,0,Math.PI*2);ctx.fill();ctx.globalCompositeOperation='source-over';
    for(let i=0;i<4;i++){const aa=now*.006+i*1.57;ctx.fillStyle=i%2?'#ff7b28':'#fff0a0';ctx.beginPath();ctx.arc(Math.cos(aa)*r*.7,Math.sin(aa)*r*.65-r*.2,2.3,0,Math.PI*2);ctx.fill();}
  }
  if(low){ctx.fillStyle='rgba(155,24,24,.18)';ctx.beginPath();ctx.arc(0,-r*.1,r*1.15,0,Math.PI*2);ctx.fill();}
  if(flash){ctx.globalCompositeOperation='screen';ctx.fillStyle='rgba(255,255,255,.48)';ctx.beginPath();ctx.arc(0,-r*.25,r*1.08,0,Math.PI*2);ctx.fill();ctx.globalCompositeOperation='source-over';}

  if(z.elite){
    ctx.strokeStyle='rgba(255,210,70,.78)';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(0,0,r*1.5+Math.sin(now*.009)*3,0,Math.PI*2);ctx.stroke();
    ctx.fillStyle='#ffd44f';ctx.shadowColor='#ffd44f';ctx.shadowBlur=8;ctx.beginPath();ctx.arc(0,-r*1.38,4,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
  }
  ctx.restore();

  const w=r*2.25;
  if(z.elite){ctx.fillStyle='rgba(18,15,8,.9)';ctx.fillRect(z.x-w/2,z.y-r-31,w,5);ctx.fillStyle='#ffd34e';ctx.fillRect(z.x-w/2,z.y-r-31,w*Math.max(0,z.hp/z.maxHp),5);}
  if(z.hp<z.maxHp){ctx.fillStyle='rgba(10,15,13,.82)';ctx.fillRect(z.x-w/2,z.y-r-21,w,4);ctx.fillStyle=low?'#ff5252':'#db6262';ctx.fillRect(z.x-w/2,z.y-r-21,w*Math.max(0,z.hp/z.maxHp),4);}
};
G.drawZombie=G.drawZombieV2;

