/* V11 combat presentation: readable impacts, blood decals and shell-like sparks. */
const G=globalThis,TAU=Math.PI*2;
G.addImpactFX=function(x,y,a,type){
  const color=type==='enemy'?'#d45b52':type===5?'#8fc9ff':type===3?'#f1d39a':'#d7e3df';
  for(let i=0;i<(type===5?8:5);i++){
    const ang=a+Math.PI+(Math.random()-.5)*1.4,s=45+Math.random()*120;
    G.particles.push({x,y,vx:Math.cos(ang)*s,vy:Math.sin(ang)*s,life:180+Math.random()*170,color,size:1.2+Math.random()*2});
  }
  G.particles.push({x,y,vx:0,vy:0,life:120,color:'#fff4c2',size:3.5});
};
G.addBloodDecal=function(x,y,type='normal'){
  const color=type==='spitter'?'#3fbf86':type==='exploder'?'#c95b35':type==='screamer'?'#a64ac0':'#6e2528';
  G.combatDecals??=[];
  G.combatDecals.push({x,y,r:4+Math.random()*8,rx:.7+Math.random()*.7,ry:.45+Math.random()*.35,rot:Math.random()*TAU,color,life:180000});
  if(G.combatDecals.length>180)G.combatDecals.splice(0,G.combatDecals.length-180);
};
G.drawCombatFX=function(){
  const c=G.ctx;
  for(const d of G.combatDecals||[]){
    if(d.x<G.camera.x-50||d.x>G.camera.x+G.W+50||d.y<G.camera.y-50||d.y>G.camera.y+G.H+50)continue;
    c.save();c.globalAlpha=.48;c.fillStyle=d.color;
    c.translate(d.x,d.y);c.rotate(d.rot);c.beginPath();c.ellipse(0,0,d.r*d.rx,d.r*d.ry,0,0,TAU);c.fill();
    c.globalAlpha=.22;c.beginPath();c.arc(d.r*.8,-d.r*.35,d.r*.18,0,TAU);c.fill();c.restore();
  }
};
export {G};
