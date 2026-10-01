/* V10.7.0 — commercial shooter presentation FX
 * Screen-space atmosphere, flashlight cone, muzzle bloom, off-screen threat
 * indicators, rain/dust and cinematic grade. No gameplay state is changed.
 */
const G=globalThis,TAU=Math.PI*2;
const baseDraw=G.draw;
let grainSeed=731;
function rnd(){grainSeed=(grainSeed*1664525+1013904223)>>>0;return grainSeed/4294967296;}
function screenPoint(x,y){return {x:x-(G.camera?.x||0),y:y-(G.camera?.y||0)};}
function edgePoint(x,y){
 const w=G.W,h=G.H,cx=w/2,cy=h/2,dx=x-cx,dy=y-cy;
 const m=Math.max(Math.abs(dx)/(w*.44),Math.abs(dy)/(h*.44))||1;
 return {x:cx+dx/m,y:cy+dy/m};
}
function drawAtmosphere(){
 if(G.state!=='playing')return;
 const c=G.ctx,now=performance.now(),p=G.player,a=G.aim?.()||0;
 // Flashlight / weapon-facing illumination.
 c.save();
 c.globalCompositeOperation='screen';
 const sx=p.x-(G.camera?.x||0),sy=p.y-(G.camera?.y||0);
 const len=Math.max(G.W,G.H)*.62,spread=.34;
 const grad=c.createRadialGradient(sx,sy,10,sx,sy,len);
 grad.addColorStop(0,'rgba(255,244,200,.12)');
 grad.addColorStop(.3,'rgba(235,225,180,.045)');
 grad.addColorStop(1,'rgba(235,225,180,0)');
 c.fillStyle=grad;c.fillRect(0,0,G.W,G.H);
 c.globalAlpha=.055;c.fillStyle='#f5e7bb';
 c.beginPath();c.moveTo(sx,sy);c.arc(sx,sy,len,a-spread,a+spread);c.closePath();c.fill();
 c.restore();

 // Rain / dust follows the current weather label but stays subtle.
 const rainy=String(G.weatherLabel?.()||G.weather||'').toLowerCase().includes('rain')||String(G.weather||'').toLowerCase().includes('rain');
 c.save();c.globalAlpha=rainy?.20:.08;c.lineWidth=1;
 for(let i=0;i<(rainy?70:34);i++){
   const xx=(i*97+now*.018*(1+i%3)*18)%G.W;
   const yy=(i*53+now*(rainy?.0007:.00018)*(80+i))%G.H;
   c.strokeStyle=rainy?'#a7c5d1':'#c4d0c8';c.beginPath();c.moveTo(xx,yy);c.lineTo(xx-3,yy+(rainy?12:5));c.stroke();
 }
 c.restore();

 // Muzzle bloom + shell ejection.
 if(p.muzzle>0){
   c.save();const k=Math.min(1,p.muzzle/80),sx=p.x-(G.camera?.x||0),sy=p.y-(G.camera?.y||0);
   c.globalCompositeOperation='lighter';const r=42+55*k;
   const g=c.createRadialGradient(sx+Math.cos(a)*52,sy+Math.sin(a)*52,2,sx+Math.cos(a)*52,sy+Math.sin(a)*52,r);
   g.addColorStop(0,'rgba(255,226,132,.34)');g.addColorStop(1,'rgba(255,120,35,0)');
   c.fillStyle=g;c.fillRect(0,0,G.W,G.H);
   for(let i=0;i<3;i++){c.fillStyle='rgba(245,210,120,.8)';c.fillRect(sx+Math.cos(a+.9+i)*25,sy+Math.sin(a+.9+i)*25,2,2);}
   c.restore();
 }

 // Off-screen enemy indicators.
 for(const z of G.zombies||[]){
   if(z.hp<=0)continue;
   const q=screenPoint(z.x,z.y);
   if(q.x>18&&q.x<G.W-18&&q.y>18&&q.y<G.H-18)continue;
   const e=edgePoint(q.x,q.y),ang=Math.atan2(q.y-G.H/2,q.x-G.W/2),near=Math.max(0,1-Math.hypot(q.x-G.W/2,q.y-G.H/2)/700);
   c.save();c.translate(e.x,e.y);c.rotate(ang);c.globalAlpha=.25+.55*near;c.fillStyle=z.type==='tank'?'#e8b04f':'#d95b5b';c.beginPath();c.moveTo(10,0);c.lineTo(-7,-6);c.lineTo(-4,0);c.lineTo(-7,6);c.closePath();c.fill();c.restore();
 }
 // Cinematic grade + grain.
 const vg=c.createRadialGradient(G.W/2,G.H/2,Math.min(G.W,G.H)*.28,G.W/2,G.H/2,Math.max(G.W,G.H)*.72);
 vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.34)');
 c.fillStyle=vg;c.fillRect(0,0,G.W,G.H);
 c.fillStyle='rgba(170,190,175,.045)';
 for(let i=0;i<85;i++){const x=rnd()*G.W,y=rnd()*G.H;c.fillRect(x,y,1,1);}
 // thin cinematic letterbox only at very large screens
 if(G.W>1050){c.fillStyle='rgba(0,0,0,.16)';c.fillRect(0,0,G.W,10);c.fillRect(0,G.H-10,G.W,10);}
}
G.draw=function(){baseDraw();drawAtmosphere();};
G.drawV10FX=drawAtmosphere;
