/* V10.8 — weapon rig / character motion layer
 * The player body remains the V10.7 art direction. This layer owns:
 * - procedural walk/idle arm motion
 * - two-hand weapon grip
 * - exact muzzle world position
 * - recoil synchronized to arms/gun
 * - muzzle flash at the same local muzzle point used by bullets
 */
const G = globalThis;
const TAU = Math.PI * 2;

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function movementState() {
  const moving = ['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright']
    .some(k => G.keys?.has(k));
  const dash = (G.player?.dashTime || 0) > 0;
  return { moving, dash };
}

function weaponSpec() {
  const w = G.selectedWeapon || 1;
  const specs = {
    1: { length: 43, grip: 13, muzzle: 41, rear: 12, stock: 0, width: 6 },
    2: { length: 47, grip: 15, muzzle: 45, rear: 12, stock: 0, width: 7 },
    3: { length: 48, grip: 16, muzzle: 47, rear: 12, stock: 4, width: 7 },
    4: { length: 44, grip: 16, muzzle: 43, rear: 11, stock: 4, width: 9 },
    5: { length: 56, grip: 15, muzzle: 55, rear: 10, stock: 5, width: 7 }
  };
  return specs[w] || specs[1];
}

/* World-space point for the actual visual muzzle. Reused by Weapons.js. */
G.getWeaponRig = function() {
  const p = G.player;
  const a = G.aim?.() || 0;
  const s = weaponSpec();
  const recoil = clamp((p?.recoil || 0) / 2.5, 0, 4);
  const bob = movementState().moving ? Math.sin(performance.now() * .018) * .7 : 0;
  const anchorX = p.x + Math.cos(a) * 10;
  const anchorY = p.y - 2 + bob;
  const weaponX = anchorX + Math.cos(a) * (s.grip - recoil);
  const weaponY = anchorY + Math.sin(a) * (s.grip - recoil);
  const muzzleX = anchorX + Math.cos(a) * (s.muzzle - recoil);
  const muzzleY = anchorY + Math.sin(a) * (s.muzzle - recoil);
  return { a, s, anchorX, anchorY, weaponX, weaponY, muzzleX, muzzleY, recoil, bob };
};

function limb(ctx, x1, y1, x2, y2, width, c1, c2) {
  const g = ctx.createLinearGradient(x1, y1, x2, y2);
  g.addColorStop(0, c1);
  g.addColorStop(1, c2);
  ctx.strokeStyle = g;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function drawGun(ctx, spec, flash, recoil, color) {
  ctx.save();
  ctx.translate(-recoil, 0);
  const metal = '#172126';
  const edge = '#718086';
  ctx.fillStyle = metal;
  ctx.strokeStyle = edge;
  ctx.lineWidth = 1.2;

  if (G.selectedWeapon === 1) {
    ctx.beginPath(); ctx.roundRect(12,-3,24,6,2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#0d1417'; ctx.fillRect(18,2,7,11);
    ctx.fillStyle = '#87969a'; ctx.fillRect(31,-2,7,2.5);
  } else if (G.selectedWeapon === 2) {
    ctx.beginPath(); ctx.roundRect(10,-3.3,29,6.8,2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#0d1417'; ctx.fillRect(17,3,8,12);
    ctx.fillStyle = '#718187'; ctx.fillRect(34,-3,8,2.5);
  } else if (G.selectedWeapon === 3) {
    ctx.fillStyle = '#3c3027'; ctx.beginPath(); ctx.roundRect(11,-3,31,7,2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#171b1d'; ctx.fillRect(17,3,8,13);
    ctx.fillStyle = '#a17a50'; ctx.fillRect(36,-.5,9,3);
    ctx.fillStyle = '#6c5844'; ctx.fillRect(11,0,8,3);
  } else if (G.selectedWeapon === 4) {
    ctx.fillStyle = '#343d40'; ctx.beginPath(); ctx.roundRect(10,-4.8,31,10,3); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#d27a27'; ctx.fillRect(15,-7,11,2.7);
    ctx.fillStyle = '#151b1e'; ctx.fillRect(21,5,9,11);
  } else {
    ctx.beginPath(); ctx.roundRect(9,-3.5,38,7,2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#0d1417'; ctx.fillRect(17,3,9,13);
    ctx.fillStyle = '#6d858e'; ctx.fillRect(35,-5,9,2.5);
    ctx.fillStyle = '#91d2ff'; ctx.fillRect(43,-2,6,2);
  }

  ctx.fillStyle = '#0b1114';
  ctx.fillRect(spec.muzzle - 2, -2, 5, 3);

  if (flash > 0 && G.selectedWeapon !== 4) {
    const q = clamp(flash / 90, 0, 1);
    const c = color || '#ffd36b';
    ctx.globalAlpha = q;
    ctx.shadowColor = c;
    ctx.shadowBlur = 18;
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.moveTo(spec.muzzle,0);
    ctx.lineTo(spec.muzzle+12,-6);
    ctx.lineTo(spec.muzzle+6,0);
    ctx.lineTo(spec.muzzle+12,6);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fff4ad';
    ctx.beginPath(); ctx.arc(spec.muzzle,0,2.6+q*2.2,0,TAU); ctx.fill();
  }
  ctx.restore();
}

G.drawPlayerWeaponRig = function() {
  const p = G.player, ctx = G.ctx, now = performance.now();
  if (!p) return;

  const rig = G.getWeaponRig();
  const a = rig.a;
  const { moving, dash } = movementState();
  const walk = moving ? Math.sin(now * .016) : 0;
  const phase = now * .022;
  const idle = Math.sin(phase) * .35;
  const recoil = rig.recoil;
  const armJitter = (G.player?.hitFlash || 0) > 0 ? Math.sin(now * .08) * 1.8 : 0;

  ctx.save();
  ctx.translate(p.x, p.y + rig.bob);
  ctx.rotate(a);

  /* Shoulder line: arms originate near the chest, not from empty space. */
  const shoulderY = -1;
  const leadShoulder = 7 + idle * .3;
  const supportShoulder = -7 - idle * .2;

  /* Front/support forearm reaches the weapon foregrip. */
  const foreX = 23 - recoil * .7;
  limb(ctx, leadShoulder, shoulderY, 13 + walk * 1.2 + armJitter, 1.5 + walk * .8, 5.6, '#61747a', '#2d3b40');
  limb(ctx, 13 + walk * 1.2, 1.5 + walk * .8, foreX, 1.0 + recoil * .2, 5.1, '#55686d', '#27353a');

  /* Rear hand locks the pistol grip. */
  limb(ctx, supportShoulder, 3.4, 12 - walk * 1.0 + armJitter, 3.0, 5.9, '#5a6c72', '#29383e');
  limb(ctx, 12 - walk * 1.0, 3.0, rig.s.grip, 2.4, 5.0, '#51646a', '#27353a');

  /* Hands are visibly wrapped around the weapon. */
  ctx.fillStyle = '#d29a77';
  ctx.beginPath(); ctx.arc(rig.s.grip, 2.2, 3.0, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.arc(foreX, 1.0 + recoil * .2, 2.8, 0, TAU); ctx.fill();

  /* Micro body sway without changing the logical player position. */
  ctx.globalAlpha = dash ? .78 : 1;
  drawGun(ctx, rig.s, p.muzzle || 0, recoil, G.weapons?.[G.selectedWeapon]?.color);

  if (p.muzzle > 0 && G.selectedWeapon === 4) {
    const q = clamp(p.muzzle / 90, 0, 1);
    ctx.globalAlpha = q;
    ctx.shadowColor = '#ff8b28';
    ctx.shadowBlur = 16;
    ctx.fillStyle = '#ffb52e';
    ctx.beginPath();
    ctx.arc(rig.s.muzzle, 1, 3 + q * 3, 0, TAU);
    ctx.fill();
  }

  ctx.restore();

  if (p.muzzle > 0) {
    const k = clamp(p.muzzle / 90, 0, 1);
    const sx = rig.muzzleX - (G.camera?.x || 0);
    const sy = rig.muzzleY - (G.camera?.y || 0);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = k * .55;
    const g = ctx.createRadialGradient(sx, sy, 1, sx, sy, 28);
    g.addColorStop(0, 'rgba(255,235,160,.35)');
    g.addColorStop(1, 'rgba(255,125,35,0)');
    ctx.fillStyle = g;
    ctx.fillRect(sx - 30, sy - 30, 60, 60);
    ctx.restore();
  }
};

/* Make this the final player renderer after the existing V10 layers. */
const previous = G.drawPlayerV9;
G.drawPlayerV9 = function() {
  if (previous) previous();
  G.drawPlayerWeaponRig();
};
G.drawPlayer = G.drawPlayerV9;
