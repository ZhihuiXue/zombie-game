/* V10.6.0 — polished 3/4 survivor presentation
 * World coordinates remain unchanged. Renderer.js already sorts actors by y;
 * this layer adds depth scaling, contact shadows, directional silhouettes,
 * richer clothing/weapon detail, and readable enemy variants.
 */
const G=globalThis,TAU=Math.PI*2;
function makeImg(svg){const i=new Image();i.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);return i;}

function playerSVG(back=false,step=0){
 const face=back
  ? '<path d="M67 52q23-21 46 0v24q-23 13-46 0z" fill="#22292b" stroke="#101416" stroke-width="4"/><path d="M71 54q19-15 38 0" stroke="#566063" stroke-width="4" fill="none"/>'
  : '<ellipse cx="90" cy="61" rx="23" ry="26" fill="#c58a68" stroke="#131719" stroke-width="4"/><path d="M67 58q2-28 24-33 22 3 25 33l-9-9-8 5-9-8-9 8-9-5z" fill="#282a2b" stroke="#111416" stroke-width="4"/><circle cx="81" cy="63" r="2.6" fill="#342521"/><circle cx="99" cy="63" r="2.6" fill="#342521"/><path d="M82 76q8 4 16 0" stroke="#743f35" stroke-width="3" fill="none"/>';
 const leg=step?'<path d="M67 139l-18 39-8 10M111 139l12 38 16 9" stroke="#20282b" stroke-width="18" stroke-linecap="round"/><path d="M39 191q12-6 27 0l-2 10q-18 5-29-2zM119 188q13-5 27 2l5 8q-16 7-29 0z" fill="#111719"/>':'<path d="M69 139l-13 42-10 9M111 139l13 42 10 9" stroke="#20282b" stroke-width="18" stroke-linecap="round"/><path d="M43 190q12-5 26 1l-2 10q-17 5-28-2zM118 190q13-5 27 1l5 8q-16 7-29 1z" fill="#111719"/>';
 return '<svg xmlns="http://www.w3.org/2000/svg" width="190" height="225">'+leg+
 '<path d="M51 100q39-19 78 0l-6 52q-33 19-66 0z" fill="#45534f" stroke="#0e1517" stroke-width="5"/>'+
 '<path d="M59 108h62v41H59z" fill="#34443d" stroke="#71857b" stroke-opacity=".35" stroke-width="2"/>'+
 '<path d="M66 112v35M81 108v40M96 108v40M111 112v35" stroke="#87988e" stroke-opacity=".25" stroke-width="2"/>'+
 '<rect x="63" y="119" width="14" height="13" rx="2" fill="#25332f"/><rect x="103" y="119" width="14" height="13" rx="2" fill="#25332f"/>'+
 '<path d="M54 104L33 126 28 151M126 104l22 22 5 24" fill="none" stroke="#465a55" stroke-width="15" stroke-linecap="round"/>'+
 '<path d="M34 148l-8 19M148 150l9 19" stroke="#c58a68" stroke-width="7" stroke-linecap="round"/>'+
 '<path d="M72 91v15h36V91" fill="#c58a68"/>'+face+
 '<path d="M54 108q-8 10-11 25l12 3 8-20M126 108q8 10 11 25l-12 3-8-20" fill="#53665e" opacity=".85"/>'+
 '<path d="M68 100h44" stroke="#a5b2aa" stroke-opacity=".25" stroke-width="3"/>'+
 '</svg>';
}
function zombieSVG(back=false,variant='normal',step=0){
 const pal={
  normal:['#6d7c5f','#aab98c','#30392f'],
  fast:['#8f7755','#d0b889','#3e3124'],
  tank:['#59666a','#c0c8c8','#2c3436'],
  exploder:['#875447','#d18b73','#3a2622'],
  hunter:['#705d7d','#b69bc0','#302735'],
  spitter:['#4e7b61','#91c9a0','#203d2d'],
  leaper:['#8b714a','#d0b176','#392d1e'],
  screamer:['#7d5277','#c49ac0','#342333']
 }[variant]||['#6d7c5f','#aab98c','#30392f'];
 const face=back
  ? '<path d="M65 54q25-22 50 0v26q-25 13-50 0z" fill="'+pal[2]+'" stroke="#111614" stroke-width="5"/><path d="M69 57q21-16 42 0" stroke="'+pal[1]+'" stroke-opacity=".35" stroke-width="4"/>'
  : '<ellipse cx="90" cy="63" rx="27" ry="29" fill="'+pal[0]+'" stroke="#121714" stroke-width="5"/><path d="M63 63q4-30 27-33 24 3 29 33l-11-9-8 6-9-8-10 8z" fill="#292923"/><circle cx="80" cy="65" r="4" fill="#e14d4d"/><circle cx="101" cy="65" r="4" fill="#e14d4d"/><path d="M74 80q16 13 32 0" stroke="#351f1b" stroke-width="6" fill="none"/>';
 const extra=variant==='tank'?'<rect x="46" y="101" width="88" height="48" rx="10" fill="#626d70" opacity=".9"/><circle cx="58" cy="125" r="8" fill="#252d2f"/><circle cx="122" cy="125" r="8" fill="#252d2f"/>'
 :variant==='exploder'?'<circle cx="66" cy="124" r="8" fill="#ff6842" opacity=".8"/><circle cx="112" cy="137" r="10" fill="#ff6842" opacity=".7"/>'
 :variant==='hunter'?'<path d="M52 103l38 25 38-25-9 43H61z" fill="#30253a" opacity=".9"/>'
 :variant==='spitter'?'<circle cx="117" cy="130" r="11" fill="#70e4a0" opacity=".7"/>'
 :variant==='screamer'?'<path d="M59 111q31-25 62 0l-5 39H64z" fill="#43283f"/>':'';
 const leg=step?'<path d="M68 143l-21 40-10 8M112 143l15 39 14 9" stroke="'+pal[2]+'" stroke-width="19" stroke-linecap="round"/><path d="M37 192q14-6 28 1M119 190q13-6 28 2" stroke="#151916" stroke-width="10" stroke-linecap="round"/>':'<path d="M70 143l-15 42-10 9M110 143l15 42 10 9" stroke="'+pal[2]+'" stroke-width="19" stroke-linecap="round"/><path d="M43 193q13-6 27 1M117 193q14-6 28 1" stroke="#151916" stroke-width="10" stroke-linecap="round"/>';
 return '<svg xmlns="http://www.w3.org/2000/svg" width="190" height="225">'+leg+
 '<path d="M50 104q40-21 80 0l-5 51q-35 20-70 0z" fill="'+pal[0]+'" stroke="#111613" stroke-width="5"/>'+
 '<path d="M58 112l20 14-9 20M122 112l-20 14 9 20" stroke="'+pal[1]+'" stroke-opacity=".35" stroke-width="4"/>'+
 '<path d="M53 106L28 130 15 159M127 106l25 24 13 29" fill="none" stroke="'+pal[2]+'" stroke-width="17" stroke-linecap="round"/>'+
 '<path d="M29 157l-12 18M151 157l13 18" stroke="'+pal[1]+'" stroke-width="10" stroke-linecap="round"/>'+
 '<path d="M72 91v15h36V91" fill="'+pal[0]+'"/>'+face+extra+
 '</svg>';
}
const pFront0=makeImg(playerSVG(false,0)),pFront1=makeImg(playerSVG(false,1)),pBack0=makeImg(playerSVG(true,0)),pBack1=makeImg(playerSVG(true,1));
const pSide0=pFront0,pSide1=pFront1;
const zCache={};
function zset(t){if(zCache[t])return zCache[t];zCache[t]=[makeImg(zombieSVG(false,t,0)),makeImg(zombieSVG(false,t,1)),makeImg(zombieSVG(true,t,0)),makeImg(zombieSVG(true,t,1))];return zCache[t];}
function body(im,x,y,w,h,flip=false,alpha=1){if(!im.complete||!im.naturalWidth)return false;const c=G.ctx;c.save();c.translate(x,y);c.scale(flip?-1:1,1);c.globalAlpha=alpha;c.drawImage(im,-w/2,-h,w,h);c.restore();return true;}
function dirBucket(a){const n=(a+TAU)%TAU;if(n>Math.PI*.25&&n<Math.PI*.75)return 'front';if(n>Math.PI*1.25&&n<Math.PI*1.75)return 'back';return 'side';}
function depthScale(y){
 const top=G.camera?.y??0,hh=G.H||800;
 const t=Math.max(0,Math.min(1,(y-top)/hh));
 return .78+t*.38;
}
function shadow(x,y,s){const c=G.ctx;c.save();c.fillStyle='rgba(0,0,0,.38)';c.beginPath();c.ellipse(x,y+5,31*s,9*s,0,0,TAU);c.fill();c.fillStyle='rgba(0,0,0,.16)';c.beginPath();c.ellipse(x-7*s,y+3,19*s,6*s,0,0,TAU);c.fill();c.restore();}
function gun(x,y,a,flash){
 const c=G.ctx;c.save();c.translate(x,y);c.rotate(a);c.fillStyle='#1a2226';c.strokeStyle='#080c0e';c.lineWidth=3;c.fillRect(2,-5,67,10);c.strokeRect(2,-5,67,10);c.fillStyle='#56636a';c.fillRect(40,-3,22,6);c.fillStyle='#11171a';c.fillRect(10,4,13,17);c.fillStyle='#7c8b90';c.fillRect(60,-3,10,5);c.restore();
 if(flash>0){c.save();c.translate(x+Math.cos(a)*72,y+Math.sin(a)*72);c.rotate(a);c.globalCompositeOperation='lighter';c.fillStyle='#ffd06a';c.shadowColor='#ff9d35';c.shadowBlur=20;c.beginPath();c.moveTo(24,0);c.lineTo(0,-9);c.lineTo(7,0);c.lineTo(0,9);c.closePath();c.fill();c.restore();}
}
G.drawPlayerV10_3=function(){
 const p=G.player,c=G.ctx,a=G.aim?.()||0,d=dirBucket(a),moving=Math.hypot(p.vx||0,p.vy||0)>.15,step=Math.floor(performance.now()/150)%2,s=depthScale(p.y);
 shadow(p.x,p.y,s);
 const im=d==='front'?(step?pFront1:pFront0):d==='back'?(step?pBack1:pBack0):(step?pSide1:pSide0);
 body(im,p.x,p.y,118*s,146*s,d==='side'&&Math.cos(a)<0,.98);
 gun(p.x,p.y-76*s,a,p.muzzle||0);
};
G.drawZombieV10_3=function(z){
 const c=G.ctx,t=z.type||'normal',a=Math.atan2((G.player?.y??z.y)-z.y,(G.player?.x??z.x)-z.x),d=dirBucket(a),step=Math.floor(performance.now()/170+(z.x+z.y)*.01)%2,s=depthScale(z.y)*(t==='tank'?1.16:t==='exploder'?1.10:t==='hunter'?1.02:1),set=zset(t);
 shadow(z.x,z.y,s);
 const im=d==='back'?(step?set[3]:set[2]):(step?set[1]:set[0]);
 body(im,z.x,z.y,112*s,148*s,d==='side'&&Math.cos(a)<0,.98);
 if(t!=='normal'){c.save();c.globalAlpha=.30;c.fillStyle=t==='tank'?'#d8dde0':t==='spitter'?'#50d88e':t==='exploder'?'#ff704d':t==='hunter'?'#bb84ff':t==='screamer'?'#ef70e5':'#e0ae5b';c.beginPath();c.ellipse(z.x,z.y-86*s,26*s,13*s,0,0,TAU);c.fill();c.restore();}
 if(z.hp<z.maxHp&&z.hp>0){const bw=72*s;c.fillStyle='rgba(5,8,8,.75)';c.fillRect(z.x-bw/2,z.y-156*s,bw,4);c.fillStyle=z.hp<z.maxHp*.3?'#f04b4b':'#c85c62';c.fillRect(z.x-bw/2,z.y-156*s,bw*Math.max(0,z.hp/z.maxHp),4);}
};
G.drawPlayerV9=G.drawPlayerV10_3;G.drawZombieV9=G.drawZombieV10_3;G.drawPlayer=G.drawPlayerV10_3;G.drawZombie=G.drawZombieV10_3;
