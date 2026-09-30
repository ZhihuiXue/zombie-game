import "../core/Runtime.js";
const G=globalThis;

document.getElementById("dnaBtn").onclick=()=>G.toggleDNAPanel();
document.getElementById("buildBtn").onclick=()=>G.toggleBuildPanel();
document.getElementById("achievementBtn").onclick=()=>G.toggleAchievementPanel();
document.getElementById("achievementBack").onclick=()=>G.toggleAchievementPanel();
document.getElementById("buildBack").onclick=()=>G.toggleBuildPanel();
document.getElementById("enemyIntroContinue").onclick=()=>G.continueEnemyIntro(false);
document.getElementById("enemyIntroDismiss").onclick=()=>G.continueEnemyIntro(true);
G.ui.soundBtn.onclick=()=>{G.soundOn=!G.soundOn;G.ui.soundBtn.textContent=G.soundOn?"🔊 Sound ON":"🔇 Sound OFF";if(G.soundOn)G.ensureAudio()};
document.getElementById("startBtn").onclick=()=>{G.ensureAudio();G.resetGame()};
document.getElementById("restartBtn").onclick=()=>{G.ensureAudio();G.resetGame()};
document.getElementById("endlessBtn").onclick=()=>{G.ensureAudio();G.endless=true;G.resetGame()};
G.ui.menuPanel.classList.remove("hidden");

document.getElementById("dnaBack").onclick=()=>G.toggleDNAPanel();
