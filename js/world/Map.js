const G=globalThis;
// Compatibility entry point: world generation now lives in WorldGenerator.js.
G.makeMap=function(){G.generateWorld?.();};
export {G};
