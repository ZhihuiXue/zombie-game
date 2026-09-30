const G = globalThis;
const KEY='zo_profiles_v43';
const ACTIVE_KEY='zo_active_profile_v43';
const oldNum=(k)=>Number(localStorage.getItem(k)||0);
const clone=(v)=>JSON.parse(JSON.stringify(v||{}));
function defaultProfile(id){return {id,name:`Player ${id}`,dna:0,dnaLevels:{},totalKills:0,equipmentUnlocks:{},achievements:{},metaStats:{},bestWave:0,bestScore:0};}
function readProfiles(){try{const raw=JSON.parse(localStorage.getItem(KEY)||'null');if(Array.isArray(raw)&&raw.length)return raw}catch{}return Array.from({length:G.PROFILE_COUNT},(_,i)=>defaultProfile(i+1));}
G.profiles=readProfiles();
if(G.profiles.length<G.PROFILE_COUNT){for(let i=G.profiles.length+1;i<=G.PROFILE_COUNT;i++)G.profiles.push(defaultProfile(i));}
G.activeProfileId=Math.max(1,Math.min(G.PROFILE_COUNT,Number(localStorage.getItem(ACTIVE_KEY)||1)));
let migrated=false;
if(!localStorage.getItem(KEY) && (localStorage.getItem('zo_dna')||localStorage.getItem('zo_kills')||localStorage.getItem('zo_dna_upgrades'))){
  const p=G.profiles[0];p.dna=oldNum('zo_dna');p.totalKills=oldNum('zo_kills');
  try{p.dnaLevels=JSON.parse(localStorage.getItem('zo_dna_upgrades')||'{}')}catch{}
  try{p.equipmentUnlocks=JSON.parse(localStorage.getItem('zo_equipment_unlocks_v40')||'{}')}catch{}
  try{p.achievements=JSON.parse(localStorage.getItem('zo_achievements')||'{}')}catch{}
  try{p.metaStats=JSON.parse(localStorage.getItem('zo_meta_stats')||'{}')}catch{}
  migrated=true;
}
G.loadActiveProfile=function(){const p=G.profiles.find(x=>x.id===G.activeProfileId)||G.profiles[0];G.activeProfileId=p.id;G.dna=Number(p.dna||0);G.dnaLevels=clone(p.dnaLevels);G.totalKills=Number(p.totalKills||0);G.equipmentUnlocks=clone(p.equipmentUnlocks);G.achState=clone(p.achievements);G.statsMeta=clone(p.metaStats);G.profileName=p.name;localStorage.setItem(ACTIVE_KEY,String(p.id));return p;};
G.saveProfiles=function(){localStorage.setItem(KEY,JSON.stringify(G.profiles));localStorage.setItem(ACTIVE_KEY,String(G.activeProfileId));};
G.saveActiveProfile=function(){const p=G.profiles.find(x=>x.id===G.activeProfileId);if(!p)return;p.name=G.profileName||p.name;p.dna=Number(G.dna||0);p.dnaLevels=clone(G.dnaLevels);p.totalKills=Number(G.totalKills||0);p.equipmentUnlocks=clone(G.equipmentUnlocks);p.achievements=clone(G.achState);p.metaStats=clone(G.statsMeta);p.bestWave=Math.max(Number(p.bestWave||0),Number(G.wave||1));p.bestScore=Math.max(Number(p.bestScore||0),Number(G.score||0));G.saveProfiles();};
G.selectProfile=function(id){if(G.state==='playing'||G.state==='shop'||G.state==='level'||G.state==='intro')return false;G.saveActiveProfile?.();G.activeProfileId=Number(id);G.loadActiveProfile();G.renderProfilePanel?.();G.renderProfileSummary?.();G.showMessage?.('👤 '+G.profileName+' 已切换',1000);return true;};
G.renameProfile=function(name){const clean=String(name||'').trim().slice(0,18);if(!clean)return false;G.profileName=clean;G.saveActiveProfile();G.renderProfilePanel?.();G.renderProfileSummary?.();return true;};
G.createProfile=function(){const p=G.profiles.find(x=>!x.totalKills&&!x.dna&&!Object.keys(x.dnaLevels||{}).length&&!Object.keys(x.equipmentUnlocks||{}).length&&x.bestWave===0);if(!p){G.showMessage?.('5 个玩家档案都已使用',1200);return false}G.selectProfile(p.id);return true;};
G.loadActiveProfile();
if(migrated)G.saveActiveProfile();
G.profileStorageKey=KEY;
export {G};
