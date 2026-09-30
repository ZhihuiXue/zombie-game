// Central combat rules: one place for damage, explosions and hit feedback.
const G=globalThis;
G.damageBoss=function(n){if(!G.boss||G.boss.hp<=0)return;G.boss.hp-=n;G.boss.flash=90;G.shake=Math.max(G.shake,2);G.texts.push({x:G.boss.x,y:G.boss.y-G.boss.r-8,t:Math.round(n),life:420,color:'#ffd35a'});G.playSound('hit')};
G.damageEnemy=function(target,n){if(!target)return;if(target===G.boss)G.damageBoss(n);else G.damageZombie(target,n)};
G.areaDamage=function(x,y,r,n,source='player'){for(const z of G.spatialGrid.near(x,y,r)){if(z.hp>0&&Math.hypot(z.x-x,z.y-y)<r+z.r)G.damageZombie(z,n)}if(source==='player'&&G.boss&&Math.hypot(G.boss.x-x,G.boss.y-y)<r+G.boss.r)G.damageBoss(n)};
