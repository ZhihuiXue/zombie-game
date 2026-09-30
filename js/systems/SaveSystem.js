const G=globalThis;
G.saveProgress=function(){G.saveActiveProfile?.();};
G.autoSave=function(){if(G.state==='playing'||G.state==='shop'||G.state==='level')G.saveActiveProfile?.();};
export {G};
