// Auto-split from Zombie Outbreak V3.1. Gameplay intentionally unchanged in this refactor.
const G = globalThis;

G.gameOver = function(){G.state='gameover';G.dna+=Math.floor(G.wave*4+G.kills/10);localStorage.setItem('zo_dna',G.dna);localStorage.setItem('zo_kills',G.totalKills);G.ui.gameOverStats.innerHTML=`坚持到 <b>Wave ${G.wave}</b> · 击杀 ${G.kills} · 得分 ${G.score} · 获得 🧬 DNA ${Math.floor(G.wave*4+G.kills/10)}<br>累计击杀 ${G.totalKills} · 永久 DNA ${G.dna}`;G.ui.gameOverPanel.classList.remove('hidden')};

G.closeOverlays = function(){if(G.state==='level'){G.ui.levelPanel.classList.add('hidden');G.state='playing'}if(G.state==='shop'){G.ui.shopPanel.classList.add('hidden');G.state='playing'}};

