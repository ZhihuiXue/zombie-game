import "../core/Runtime.js";
const G=globalThis;

G.ui.soundBtn.onclick=()=>{G.soundOn=!G.soundOn;G.ui.soundBtn.textContent=G.soundOn?"🔊 Sound ON":"🔇 Sound OFF";if(G.soundOn)G.ensureAudio()};
document.getElementById("startBtn").onclick=()=>{G.ensureAudio();G.resetGame()};
document.getElementById("restartBtn").onclick=()=>{G.ensureAudio();G.resetGame()};
document.getElementById("endlessBtn").onclick=()=>{G.ensureAudio();G.endless=true;G.resetGame()};
G.ui.menuPanel.classList.remove("hidden");
