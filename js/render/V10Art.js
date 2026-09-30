const G=globalThis,TAU=Math.PI*2;
const oldPlayerV9=G.drawPlayerV9,oldZombieV9=G.drawZombieV9;
const A={player:[],zombies:{}};G.V10Art=A;
const img=s=>{const i=new Image();i.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(s);return i};
const player=f=>'<svg xmlns="http://www.w3.org/2000/svg" width="180" height="200"><defs><linearGradient id="b"><stop stop-color="#71847b"/><stop offset=".55" stop-color="#394945"/><stop offset="1" stop-color="#151d20"/></linearGradient><radialGradient id="s"><stop stop-color="#f0c29e"/><stop offset=".65" stop-color="#c17e62"/><stop offset="1" stop-color="#5c3733"/></radialGradient><linearGradient id="g"><stop stop-color="#718087"/><stop offset=".5" stop-color="#273137"/><stop offset="1" stop-color="#090e11"/></linearGradient></defs><g transform="translate(0,'+(f?3:-3)+')"><path d="M67 130L54 165 48 180 66 181 80 164 82 137M113 130L126 165 132 180 114 181 100 164 98 137" fill="none" stroke="#2c383d" stroke-width="15" stroke-linecap="round"/><path d="M47 178q-10 1-11 10 15 6 34 0l-3-9M133 178q10 1 11 10-15 6-34 0l3-9" fill="#10171a" stroke="#070b0d" stroke-width="3"/><path d="M55 109q35-13 70 0l-4 34q-31 15-62 0z" fill="url(#b)" stroke="#0a1113" stroke-width="5"/><path d="M63 116h54l-7 24H70z" fill="#283732" stroke="#91a49a" stroke-opacity=".35"/><path d="M73 118v22M90 116v25M107 118v22" stroke="#aebbb3" stroke-opacity=".25" stroke-width="2"/><path d="M58 114l-14 12-6 17 14 6 15-17M122 114l14 12 6 17-14 6-15-17" fill="#3b4b51" stroke="#0d1518" stroke-width="4"/><path d="M51 144l-14 8M129 144l14 8" stroke="#cb9271" stroke-width="7" stroke-linecap="round"/><path d="M78 108V90h24v18" fill="#b9795e"/><ellipse cx="90" cy="77" rx="25" ry="28" fill="url(#s)" stroke="#111518" stroke-width="4"/><path d="M65 75q2-31 25-34 24 3 26 34l-9-9-8 5-9-8-9 8-9-5z" fill="#27292b" stroke="#101315" stroke-width="4"/><path d="M67 59q23-20 46 0" stroke="#8d9a9b" stroke-width="4"/><circle cx="79" cy="78" r="3" fill="#382724"/><circle cx="101" cy="78" r="3" fill="#382724"/><path d="M82 89q8 5 17 0" fill="none" stroke="#703e36" stroke-width="3"/><g transform="translate(122 130)"><path d="M0 6l25-8h47l13 4v7l-48 2-14 7-14-4z" fill="url(#g)" stroke="#080d10" stroke-width="4"/><path d="M30-2l17-9 11 2-9 9M13 10l13 2-4 15-11-3" fill="#1a2226" stroke="#090e10" stroke-width="3"/><path d="M71 1h30v6H71M94-2h13v10H94" fill="#0a0f12"/></g><rect x="113" y="104" width="10" height="19" rx="2" fill="#182326"/></g></svg>';
const P={normal:['#9da98f','#d0c9a9','#3d4840','#202722','#b84444'],fast:['#b9996d','#e8ce98','#5a412d','#2a2018','#db9436'],tank:['#8d9799','#d1d6d3','#454e51','#252b2d','#c24646'],exploder:['#ba785f','#e8a383','#52362f','#2b1e1b','#ff6337'],hunter:['#9d80a5','#dcb9d8','#392b41','#211921','#c58bf2'],spitter:['#79b091','#c8e6ca','#28503e','#172c24','#5de09b'],leaper:['#b99860','#e9cf96','#514029','#2c2318','#e5aa43'],screamer:['#ad73ae','#e5b9df','#452542','#251523','#ef70e5']};
function zombie(t,f){const p=P[t]||P.normal,s=f?7:-7,head=t==='tank'?28:23;
return '<svg xmlns="http://www.w3.org/2000/svg" width="170" height="200"><defs><linearGradient id="b"><stop stop-color="'+p[0]+'"/><stop offset=".55" stop-color="'+p[2]+'"/><stop offset="1" stop-color="'+p[3]+'"/></linearGradient><radialGradient id="s"><stop stop-color="'+p[1]+'"/><stop offset=".7" stop-color="'+p[0]+'"/><stop offset="1" stop-color="#4a302c"/></radialGradient></defs><path d="M67 132L'+(61+s)+' 158 '+(57+s)+' 181M103 132L'+(109-s)+' 158 '+(113-s)+' 181" fill="none" stroke="'+p[3]+'" stroke-width="15" stroke-linecap="round"/><path d="M'+(56+s)+' 181q-11 0-14 7 10 8 27 1M'+(114-s)+' 181q11 0 14 7-10 8-27 1" fill="#101615"/><circle cx="'+(61+s)+'" cy="157" r="5" fill="'+p[1]+'"/><circle cx="'+(109-s)+'" cy="157" r="5" fill="'+p[1]+'"/><path d="M54 111q31-14 62 0l8 34q-39 16-78 0z" fill="url(#b)" stroke="#0d1312" stroke-width="5"/><path d="M60 118l15 8-7 18M110 118l-15 8 7 18" stroke="'+p[1]+'" stroke-opacity=".22" stroke-width="4"/><path d="M57 112l-19 14-14 25M113 112l19 14 14 25" stroke="'+p[3]+'" stroke-width="16" stroke-linecap="round"/><path d="M38 126l-14 25M132 126l14 25" stroke="'+p[0]+'" stroke-width="10" stroke-linecap="round"/><circle cx="24" cy="151" r="7" fill="'+p[1]+'"/><circle cx="146" cy="151" r="7" fill="'+p[1]+'"/><path d="M76 109V91h18v18" fill="'+p[0]+'"/><ellipse cx="85" cy="72" rx="'+head+'" ry="27" fill="url(#s)" stroke="#121514" stroke-width="5"/><path d="M63 68q2-26 22-28 21 3 23 28l-8-8-9 5-8-8-10 8z" fill="#282523" stroke="#111212" stroke-width="4"/><path d="M69 82q16 12 32 0" fill="none" stroke="#301d1b" stroke-width="7"/><ellipse cx="76" cy="72" rx="4" ry="3" fill="'+p[4]+'"/><ellipse cx="94" cy="72" rx="4" ry="3" fill="'+p[4]+'"/><path d="M63 126l9 7-7 8-8-6M103 118l8 5-4 11-9-5" fill="'+p[4]+'" opacity=".8"/>'+
(t==='tank'?'<path d="M47 113h76l7 28H40z" fill="#5e6769" opacity=".9"/><circle cx="54" cy="128" r="8" fill="#252b2d"/><circle cx="116" cy="128" r="8" fill="#252b2d"/>':'')+
(t==='hunter'?'<path d="M53 112l16-16h33l17 16-10 26H61z" fill="#35263b"/><path d="M66 105l19 16 19-16" stroke="#c184ca" stroke-width="5"/>':'')+
(t==='spitter'?'<path d="M57 116q28-14 56 0l-7 26H64z" fill="#234b39"/><circle cx="112" cy="130" r="9" fill="#74e7a0" opacity=".65"/>':'')+
(t==='exploder'?'<ellipse cx="85" cy="132" rx="31" ry="23" fill="#9d4737" opacity=".8"/><circle cx="70" cy="129" r="6" fill="#ff7b48"/><circle cx="100" cy="137" r="7" fill="#ff7b48"/>':'')+
'</svg>';}
A.player=[img(player(0)),img(player(1))];
for(const t in P)A.zombies[t]=[img(zombie(t,0)),img(zombie(t,1))];

function ready(ctx,im,x,y,w,h,a){if(!im.complete||!im.naturalWidth)return false;ctx.save();ctx.translate(x,y);ctx.rotate(a||0);ctx.drawImage(im,-w/2,-h,w,h);ctx.restore();return true}
G.drawWorld=function(){
  if(!G.v10WorldCache||G.v10WorldW!==G.WORLD.w||G.v10WorldH!==G.WORLD.h){
    const c=document.createElement('canvas');c.width=G.WORLD.w;c.height=G.WORLD.h;const x=c.getContext('2d');
    let seed=918273;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
    // V10.4: faux 3/4 industrial environment. The playable coordinates stay unchanged;
    // only the art gains depth through receding bands, curbs, vertical facades and long shadows.
    x.fillStyle='#303936';x.fillRect(0,0,c.width,c.height);
    // distant concrete slabs / perspective seams
    for(let y=-80;y<c.height+120;y+=150){
      const shade=((Math.floor(y/150)&1)?'#343c39':'#303835');
      x.fillStyle=shade;x.fillRect(0,y,c.width,150);
      x.strokeStyle='rgba(9,14,13,.28)';x.lineWidth=2;x.beginPath();x.moveTo(0,y);x.lineTo(c.width,y+8);x.stroke();
    }
    for(let i=-2;i<14;i++){
      const bx=i*150;
      x.strokeStyle='rgba(12,18,17,.20)';x.lineWidth=2;x.beginPath();x.moveTo(bx,0);x.lineTo(bx+55,c.height);x.stroke();
    }
    // Main road with perspective-like edges and lane dashes.
    const ry=c.height*.50;
    x.fillStyle='#252c2a';x.fillRect(0,ry,c.width,c.height*.18);
    x.fillStyle='#555b52';x.fillRect(0,ry-8,c.width,9);x.fillRect(0,ry+c.height*.18,c.width,10);
    x.fillStyle='rgba(224,211,164,.42)';
    for(let xx=20;xx<c.width;xx+=118)x.fillRect(xx,ry+c.height*.09,52,4);
    // drains / cracks / grime
    for(let i=0;i<1200;i++){
      const px=rnd()*c.width,py=rnd()*c.height,s=.5+rnd()*3;
      x.fillStyle=rnd()<.76?'rgba(9,14,13,.11)':'rgba(194,187,157,.07)';
      x.fillRect(px,py,s,s*(.4+rnd()*1.5));
    }
    for(let i=0;i<85;i++){
      const px=rnd()*c.width,py=rnd()*c.height,rx=12+rnd()*38,ry2=3+rnd()*9;
      const g=x.createRadialGradient(px,py,1,px,py,rx);
      g.addColorStop(0,'rgba(102,122,118,.18)');g.addColorStop(1,'rgba(10,16,15,0)');
      x.fillStyle=g;x.beginPath();x.ellipse(px,py,rx,ry2,rnd()*Math.PI,0,TAU);x.fill();
    }
    // 3/4 scenery: raised walls/containers with visible front faces and cast shadows.
    function block(px,py,w,h,d,top='#56605b',front='#363f3b',edge='#1b2220'){
      x.fillStyle='rgba(0,0,0,.28)';x.beginPath();x.roundRect(px+8,py+10,w,d*.75,5);x.fill();
      x.fillStyle=front;x.fillRect(px,py+d,w,h);
      x.fillStyle=top;x.beginPath();x.moveTo(px,py+d);x.lineTo(px+16,py);x.lineTo(px+w+16,py);x.lineTo(px+w,py+d);x.closePath();x.fill();
      x.strokeStyle=edge;x.lineWidth=2;x.stroke();
      x.fillStyle='rgba(225,225,205,.12)';x.fillRect(px+8,py+d+8,w-16,5);
    }
    for(let i=0;i<15;i++){
      const px=35+rnd()*(c.width-170),py=35+rnd()*(c.height-150),w=55+rnd()*90,h=25+rnd()*28,d=12+rnd()*16;
      block(px,py,w,h,d,rnd()<.55?'#5b625b':'#4f5958',rnd()<.5?'#353d3a':'#3b4541', '#1d2522');
    }
    // shipping crates with visible front + top
    for(let i=0;i<30;i++){
      const px=20+rnd()*(c.width-55),py=25+rnd()*(c.height-55),w=18+rnd()*28,h=13+rnd()*16,d=8+rnd()*7;
      block(px,py,w,h,d,'#6a604a','#4b4537','#292a24');
      x.strokeStyle='rgba(220,190,125,.25)';x.beginPath();x.moveTo(px+3,py+d+3);x.lineTo(px+w-3,py+d+h-3);x.moveTo(px+w-3,py+d+3);x.lineTo(px+3,py+d+h-3);x.stroke();
    }
    // cars / vans with roof, glass and lower body, so they read as 3D objects.
    for(let i=0;i<8;i++){
      const px=45+rnd()*(c.width-110),py=35+rnd()*(c.height-90),w=58+rnd()*38,h=25+rnd()*12,d=11;
      x.fillStyle='rgba(0,0,0,.34)';x.fillRect(px+8,py+d+h+5,w,h*.35);
      x.fillStyle='#4b5350';x.fillRect(px,py+d,w,h);
      x.fillStyle='#6b7470';x.beginPath();x.moveTo(px+8,py+d);x.lineTo(px+18,py,w-18+px,py);x.lineTo(px+w-5,py+d);x.closePath();x.fill();
      x.fillStyle='#1d282a';x.fillRect(px+18,py+d+4,w-35,8);
      x.fillStyle='#171d1d';x.fillRect(px+5,py+d+h-4,13,6);x.fillRect(px+w-18,py+d+h-4,13,6);
      x.strokeStyle='#151b19';x.strokeRect(px,py+d,w,h);
    }
    // blood, weeds and small vertical details
    for(let i=0;i<42;i++){
      const px=rnd()*c.width,py=rnd()*c.height,rx=4+rnd()*14,ry2=2+rnd()*7;
      x.fillStyle='rgba(108,25,28,.27)';x.beginPath();x.ellipse(px,py,rx,ry2,rnd()*Math.PI,0,TAU);x.fill();
    }
    for(let i=0;i<230;i++){
      const px=rnd()*c.width,py=rnd()*c.height;
      x.strokeStyle=rnd()<.7?'rgba(73,111,72,.55)':'rgba(104,83,61,.5)';
      x.lineWidth=1.5;x.beginPath();x.moveTo(px,py);x.lineTo(px-2+rnd()*5,py-5-rnd()*10);x.stroke();
    }
    // fixed drains and manholes
    for(let i=0;i<18;i++){
      const px=35+rnd()*(c.width-70),py=35+rnd()*(c.height-70);
      x.fillStyle='#1c2422';x.beginPath();x.ellipse(px,py,18,8,0,0,TAU);x.fill();
      x.strokeStyle='rgba(150,158,147,.35)';x.stroke();
      x.strokeStyle='rgba(90,98,91,.3)';x.beginPath();x.moveTo(px-10,py);x.lineTo(px+10,py);x.stroke();
    }
    // existing collision walls become substantial raised structures
    for(const a of G.walls||[]){
      if(a.kind==='tree')continue;
      x.fillStyle='rgba(0,0,0,.35)';x.fillRect(a.x+9,a.y+14,a.w,a.h);
      x.fillStyle='#3f4844';x.fillRect(a.x,a.y+12,a.w,a.h);
      x.fillStyle='#5e6660';x.beginPath();x.moveTo(a.x,a.y+12);x.lineTo(a.x+12,a.y);x.lineTo(a.x+a.w+12,a.y);x.lineTo(a.x+a.w,a.y+12);x.closePath();x.fill();
      x.strokeStyle='#202722';x.strokeRect(a.x,a.y+12,a.w,a.h);
    }
    G.v10WorldCache=c;G.v10WorldW=G.WORLD.w;G.v10WorldH=G.WORLD.h;
  }
  G.ctx.drawImage(G.v10WorldCache,0,0);
};
G.drawPlayerV10=function(){const p=G.player,ctx=G.ctx,a=G.aim?.()||0,f=Math.floor(performance.now()/150)%2;ctx.save();ctx.translate(p.x,p.y+1);ctx.fillStyle='rgba(0,0,0,.24)';ctx.beginPath();ctx.ellipse(0,2,27,7,0,0,TAU);ctx.fill();ctx.restore();if(!ready(ctx,A.player[f],p.x,p.y,108,120,a))return oldPlayerV9?.();if(p.muzzle>0){ctx.save();ctx.translate(p.x,p.y);ctx.rotate(a);ctx.globalAlpha=Math.min(1,p.muzzle/90);ctx.fillStyle=G.weapons?.[G.selectedWeapon]?.color||'#ffd36b';ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=15;ctx.beginPath();ctx.moveTo(52,0);ctx.lineTo(67,-7);ctx.lineTo(58,0);ctx.lineTo(67,7);ctx.closePath();ctx.fill();ctx.restore();}};
G.drawZombieV10=function(z){if(z.x<G.camera.x-250||z.x>G.camera.x+G.W+250||z.y<G.camera.y-250||z.y>G.camera.y+G.H+250)return;const t=z.type||'normal',set=A.zombies[t]||A.zombies.normal,f=Math.floor(performance.now()/170+(z.x+z.y)*.01)%2,sc=t==='tank'?1.42:t==='exploder'?1.28:1.10,w=108*sc,h=126*sc,dead=z.hp<=0; G.ctx.save();G.ctx.fillStyle='rgba(0,0,0,.28)';G.ctx.beginPath();G.ctx.ellipse(z.x,z.y+2,27*sc,7*sc,0,0,TAU);G.ctx.fill();G.ctx.restore(); if(!ready(G.ctx,set[f],z.x,z.y,w,h,0)){oldZombieV9?.(z);return}if(!dead&&z.hp<z.maxHp){const bar=w*.78,y=z.y-h-7;G.ctx.fillStyle='rgba(8,10,10,.82)';G.ctx.fillRect(z.x-bar/2,y,bar,5);G.ctx.fillStyle=z.hp<z.maxHp*.3?'#f04b4b':'#cf5a5a';G.ctx.fillRect(z.x-bar/2,y,bar*Math.max(0,z.hp/z.maxHp),5)}};
G.drawPlayerV9=G.drawPlayerV10;G.drawZombieV9=G.drawZombieV10;G.drawPlayer=G.drawPlayerV10;G.drawZombie=G.drawZombieV10;
G.drawV9Lighting=function(){if(G.state!=='playing')return;const c=G.ctx,p=G.player;c.save();const g=c.createRadialGradient(p.x,p.y,20,p.x,p.y,260);g.addColorStop(0,'rgba(235,245,220,.13)');g.addColorStop(.45,'rgba(90,120,105,.04)');g.addColorStop(1,'rgba(0,0,0,.16)');c.fillStyle=g;c.fillRect(G.camera.x,G.camera.y,G.W,G.H);c.restore();};