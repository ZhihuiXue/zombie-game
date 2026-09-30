/* V10.2.0 free directional sprite layer
 * Player: TheNess, CC0 - https://opengameart.org/content/rpg-sprite-8-direction-human-male-16x16
 * Zombie: Clint Bellanger, CC-BY 3.0 - https://opengameart.org/content/zombie-sprites
 */
const G=globalThis,TAU=Math.PI*2;
const oldP=G.drawPlayerV9,oldZ=G.drawZombieV9;
const player=new Image(),zombie=new Image();
player.src="https://opengameart.org/sites/default/files/sprite_oga.png";
zombie.src="https://opengameart.org/sites/default/files/zombie_topdown.png";

function dir(a){return ((Math.round(((a+TAU)%TAU)/(TAU/8)))%8+8)%8}
function src(img,cols,rows,c,r){
 if(!img.complete||!img.naturalWidth)return null;
 return {x:img.naturalWidth*c/cols,y:img.naturalHeight*r/rows,w:img.naturalWidth/cols,h:img.naturalHeight/rows};
}
function sheet(ctx,img,cols,rows,c,r,x,y,w,h){
 const s=src(img,cols,rows,c,r);if(!s)return false;
 ctx.imageSmoothingEnabled=false;ctx.drawImage(img,s.x,s.y,s.w,s.h,x-w/2,y-h,w,h);return true;
}
function shadow(ctx,x,y,s=1){
 ctx.save();ctx.fillStyle="rgba(0,0,0,.35)";ctx.beginPath();ctx.ellipse(x,y+5,25*s,8*s,0,0,TAU);ctx.fill();ctx.restore();
}
function gun(ctx,x,y,a,flash){
 ctx.save();ctx.translate(x,y-38);ctx.rotate(a);ctx.lineCap="round";
 ctx.strokeStyle="#11181b";ctx.lineWidth=9;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(43,0);ctx.stroke();
 ctx.strokeStyle="#566267";ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(3,0);ctx.lineTo(40,0);ctx.stroke();
 ctx.fillStyle="#20282b";ctx.fillRect(9,-5,14,10);ctx.fillRect(5,3,10,13);
 ctx.fillStyle="#111517";ctx.fillRect(40,-2,13,4);
 if(flash){ctx.globalAlpha=Math.min(1,G.player.muzzle/70);ctx.fillStyle="#ffd36b";ctx.shadowColor="#ffd36b";ctx.shadowBlur=18;ctx.beginPath();ctx.moveTo(53,0);ctx.lineTo(74,-9);ctx.lineTo(63,0);ctx.lineTo(74,9);ctx.closePath();ctx.fill();}
 ctx.restore();
}
G.drawPlayerV10_2=function(){
 const p=G.player,c=G.ctx,a=G.aim?.()||0,m=Math.abs(p.vx||0)+Math.abs(p.vy||0)>.1;
 shadow(c,p.x,p.y);
 if(!sheet(c,player,6,8,m?Math.floor(performance.now()/120)%6:0,dir(a),p.x,p.y,92,92)){oldP?.();return;}
 gun(c,p.x,p.y,a,p.muzzle>0);
};
G.drawZombieV10_2=function(z){
 const c=G.ctx,t=z.type||"normal",m=Math.abs(z.vx||0)+Math.abs(z.vy||0)>.1;
 const dx=(G.player?.x??z.x)-z.x,dy=(G.player?.y??z.y)-z.y;
 const row=dir(Math.atan2(dy,dx)),col=m?4+(Math.floor(performance.now()/130+(z.x+z.y)*.01)%8):0;
 const scale=t==="tank"?1.4:t==="exploder"?1.25:1;
 shadow(c,z.x,z.y,scale);
 if(!sheet(c,zombie,36,8,col,row,z.x,z.y,112*scale,126*scale)){oldZ?.(z);return;}
 if(t!=="normal"){c.save();c.globalAlpha=.25;c.fillStyle=t==="tank"?"#c7cdd0":t==="spitter"?"#59d596":t==="exploder"?"#ff7448":t==="hunter"?"#b77bd0":"#e0aa52";c.beginPath();c.ellipse(z.x,z.y-45*scale,18*scale,10*scale,0,0,TAU);c.fill();c.restore();}
};
G.drawPlayerV9=G.drawPlayerV10_2;
G.drawZombieV9=G.drawZombieV10_2;
G.drawPlayer=G.drawPlayerV10_2;
G.drawZombie=G.drawZombieV10_2;
