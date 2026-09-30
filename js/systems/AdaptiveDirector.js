const G=globalThis;

// V6.0 Adaptive World: a lightweight director that learns how the player fights
// during the current run and changes the next wave without requiring AI services.
G.adaptive={
  weapon:{1:0,2:0,3:0,4:0,5:0},
  kills:{normal:0,fast:0,hunter:0,spitter:0,tank:0,leaper:0,exploder:0,screamer:0},
  damageTaken:0,shots:0,closeKills:0,rangedKills:0,fireKills:0,grenadeKills:0,
  aggression:0,mobility:0,range:0,risk:0,heat:0,adaptation:0,dominant:'balanced',
  wavePressure:0,lastWaveNote:'',waveStart:0,
  reset(){this.weapon={1:0,2:0,3:0,4:0,5:0};this.kills={normal:0,fast:0,hunter:0,spitter:0,tank:0,leaper:0,exploder:0,screamer:0};this.damageTaken=0;this.shots=0;this.closeKills=0;this.rangedKills=0;this.fireKills=0;this.grenadeKills=0;this.aggression=0;this.mobility=0;this.range=0;this.risk=0;this.heat=0;this.adaptation=0;this.dominant='balanced';this.wavePressure=0;this.lastWaveNote='';this.waveStart=performance.now()},
  recordShot(w){if(this.weapon[w]!=null)this.weapon[w]++;this.shots++;if(w===4)this.fireKills+=0},
  recordDamageTaken(n){this.damageTaken+=Math.max(0,n);this.risk=Math.min(1,this.risk+.025)},
  recordKill(z){const t=z?.type||'normal';this.kills[t]=(this.kills[t]||0)+1;const d=Math.hypot((z?.x||0)-(G.player?.x||0),(z?.y||0)-(G.player?.y||0));if(d<170)this.closeKills++;else this.rangedKills++;if(t==='exploder')this.risk=Math.min(1,this.risk+.04);this.heat=Math.min(1,this.heat+.035)},
  analyze(){const w=this.weapon,total=Object.values(w).reduce((a,b)=>a+b,0)||1;const near=(w[2]+w[3]) / total;const flame=w[4]/total;const sniper=w[5]/total;const movement=(this.closeKills+this.rangedKills)>0?this.closeKills/(this.closeKills+this.rangedKills):.5;this.aggression=Math.min(1,.35+near*.75+this.heat*.2);this.mobility=Math.min(1,movement*.75+(this.risk*.25));this.range=Math.min(1,(sniper*.9+this.rangedKills/Math.max(1,this.closeKills+this.rangedKills)*.45+flame*.25));if(flame>.32)this.dominant='fire';else if(sniper>.28||this.range>.68)this.dominant='range';else if(near>.58)this.dominant='close';else if(this.risk>.62)this.dominant='reckless';else this.dominant='balanced';this.adaptation=Math.min(1,Math.max(0,G.wave-2)*.055);this.wavePressure=Math.min(.28,this.adaptation*(.35+this.risk*.35));return this.dominant},
  chooseType(base){if(G.wave<3)return base;this.analyze();const r=Math.random();
    if(this.dominant==='fire'&&r<.16)return 'spitter';
    if(this.dominant==='range'&&r<.17)return 'hunter';
    if(this.dominant==='close'&&r<.16)return 'leaper';
    if(this.dominant==='reckless'&&r<.13)return 'exploder';
    if(this.dominant==='balanced'&&r<.08)return 'fast';
    return base;
  },
  mutateSpawn(z){if(!z)return z;this.analyze();const p=this.adaptation;z.adaptive=true;
    if(this.dominant==='fire'){z.fireResist=.28+p*.18}
    if(this.dominant==='range'&&z.type==='hunter'){z.speed*=1.06+p*.08}
    if(this.dominant==='close'&&z.type==='leaper'){z.speed*=1.08+p*.1}
    if(this.dominant==='reckless'&&z.type==='exploder'){z.damage*=1.08+p*.1}
    if(p>.25&&Math.random()<this.wavePressure){z.hp*=1.08;z.maxHp=z.hp;z.speed*=1.025}
    return z;
  },
  startWave(){this.analyze();this.waveStart=performance.now();let note='🧠 WORLD ADAPTING · '+this.dominant.toUpperCase();if(this.dominant==='fire')note+=' · 火焰抗性出现';else if(this.dominant==='range')note+=' · 猎杀者增多';else if(this.dominant==='close')note+=' · 跳跃者增多';else if(this.dominant==='reckless')note+=' · 爆炸威胁上升';else note+=' · 世界保持不确定';this.lastWaveNote=note;if(G.wave>=3)G.showMessage(note,1800)},
  update(dt){if(G.state!=='playing'||!G.wave)return;this.heat=Math.max(0,this.heat-dt/18000);if(G.wave>=3&&this.waveStart&&performance.now()-this.waveStart>3500)this.analyze()},
  label(){return '🧠 ADAPTIVE · '+this.dominant.toUpperCase()+' · '+Math.round(this.adaptation*100)+'%'}
};
G.adaptive.reset();
export {G};
