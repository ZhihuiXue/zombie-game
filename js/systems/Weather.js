const G=globalThis;

const WEATHER=[
  {id:'clear',name:'☀️ CLEAR',desc:'晴朗天气',duration:32000},
  {id:'rain',name:'🌧️ RAIN',desc:'降雨：能见度下降，敌人脚步更难判断',duration:36000},
  {id:'storm',name:'⛈️ STORM',desc:'雷暴：偶发闪电，战场会短暂照亮',duration:30000},
  {id:'fog',name:'🌫️ FOG',desc:'浓雾：视野范围明显缩小',duration:34000},
  {id:'snow',name:'❄️ SNOW',desc:'降雪：战场进入低温天气',duration:36000}
];

G.weather=null;
G.weatherTime=0;
G.weatherFlash=0;
G.weatherBolt=0;
G.weatherParticles=[];

G.startWeather=function(){
  const pool=G.wave<3?WEATHER.slice(0,2):WEATHER;
  const next=pool[Math.floor(Math.random()*pool.length)];
  G.weather={...next};
  G.weatherTime=next.duration;
  G.weatherFlash=0;
  G.weatherBolt=0;
  G.weatherParticles=[];
  G.showMessage(next.name+' · '+next.desc,2200);
};

G.updateWeather=function(dt){
  if(!G.weather||G.state!=='playing')return;
  G.weatherTime-=dt;
  if(G.weatherTime<=0){G.startWeather();return;}
  if(G.weather.id==='storm'){
    G.weatherBolt=Math.max(0,G.weatherBolt-dt);
    if(Math.random()<dt/1000*.018){
      G.weatherBolt=150+Math.random()*180;
      G.weatherFlash=1;
      G.shake=Math.max(G.shake,2.5);
      G.playSound?.('boss');
    }
  }
  if(G.weather.id==='rain'||G.weather.id==='snow'){
    const count=G.weather.id==='rain'?3:2;
    for(let i=0;i<count;i++){
      if(G.weatherParticles.length<180){
        G.weatherParticles.push({
          x:Math.random()*G.W,
          y:-10,
          vx:G.weather.id==='rain'?-35+Math.random()*25:-8+Math.random()*16,
          vy:G.weather.id==='rain'?420+Math.random()*260:35+Math.random()*55,
          life:900+Math.random()*900
        });
      }
    }
    for(const p of G.weatherParticles){p.x+=p.vx*dt/1000;p.y+=p.vy*dt/1000;p.life-=dt;}
    G.weatherParticles=G.weatherParticles.filter(p=>p.life>0&&p.y<G.H+30);
  }
};

G.weatherLabel=function(){
  if(!G.weather)return '';
  return G.weather.name+' · '+Math.ceil(Math.max(0,G.weatherTime)/1000)+'s';
};

G.drawWeather=function(){
  if(!G.weather)return;
  const ctx=G.ctx,now=performance.now();
  ctx.save();
  if(G.weather.id==='rain'){
    ctx.fillStyle='rgba(35,65,90,.08)';ctx.fillRect(0,0,G.W,G.H);
    ctx.strokeStyle='rgba(175,215,235,.30)';ctx.lineWidth=1;
    for(const p of G.weatherParticles){ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x-7,p.y+22);ctx.stroke();}
  }else if(G.weather.id==='snow'){
    ctx.fillStyle='rgba(225,238,245,.08)';ctx.fillRect(0,0,G.W,G.H);
    ctx.fillStyle='rgba(245,250,255,.72)';
    for(const p of G.weatherParticles){ctx.beginPath();ctx.arc(p.x,p.y,1.5+Math.sin(p.x)*.8,0,Math.PI*2);ctx.fill();}
  }else if(G.weather.id==='fog'){
    const g=ctx.createRadialGradient(G.W/2,G.H/2,Math.min(G.W,G.H)*.12,G.W/2,G.H/2,Math.max(G.W,G.H)*.62);
    g.addColorStop(0,'rgba(170,185,180,.02)');g.addColorStop(.52,'rgba(145,160,155,.10)');g.addColorStop(1,'rgba(105,120,115,.34)');
    ctx.fillStyle=g;ctx.fillRect(0,0,G.W,G.H);
  }else if(G.weather.id==='storm'){
    ctx.fillStyle='rgba(35,40,65,.09)';ctx.fillRect(0,0,G.W,G.H);
    if(G.weatherBolt>0){
      ctx.fillStyle=`rgba(235,245,255,${Math.min(.34,G.weatherBolt/350)})`;
      ctx.fillRect(0,0,G.W,G.H);
      ctx.strokeStyle='rgba(255,255,255,.85)';ctx.lineWidth=3;
      ctx.beginPath();let x=G.W*.2+Math.random()*G.W*.6;ctx.moveTo(x,0);for(let y=40;y<G.H*.55;y+=55)ctx.lineTo(x+(Math.random()-.5)*70,y);ctx.stroke();
    }
  }
  ctx.restore();
};

export {G};
