const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const ROOT = path.resolve(__dirname, "..");

function loadBrowserModule(relativePath, setup = {}) {
  const source = fs.readFileSync(path.join(ROOT, relativePath), "utf8")
    .replace(/export\s*\{G\};?\s*$/m, "");
  const sandbox = {
    console,
    performance: { now: () => 1000 },
    Math: new Proxy(Math, { get(target, prop) { return prop === "random" ? () => 0 : target[prop]; } }),
    ...setup
  };
  sandbox.globalThis = sandbox;
  vm.runInNewContext(source, sandbox, { filename: relativePath });
  return sandbox;
}

test("AdaptiveDirector resets to a clean baseline", () => {
  const G = loadBrowserModule("js/systems/AdaptiveDirector.js", {
    wave: 1,
    player: { x: 0, y: 0 }
  });

  G.adaptive.recordShot(4);
  G.adaptive.recordDamageTaken(20);
  G.adaptive.recordKill({ type: "hunter", x: 10, y: 10 });
  assert.equal(G.adaptive.shots, 1);
  assert.equal(G.adaptive.damageTaken, 20);

  G.adaptive.reset();
  assert.equal(G.adaptive.shots, 0);
  assert.equal(G.adaptive.damageTaken, 0);
  assert.equal(G.adaptive.closeKills, 0);
  assert.equal(G.adaptive.rangedKills, 0);
  assert.equal(G.adaptive.dominant, "balanced");
  assert.equal(G.adaptive.weapon[4], 0);
});

test("AdaptiveDirector detects fire and range styles", () => {
  const G = loadBrowserModule("js/systems/AdaptiveDirector.js", {
    wave: 8,
    player: { x: 0, y: 0 }
  });

  for (let i = 0; i < 10; i++) G.adaptive.recordShot(4);
  assert.equal(G.adaptive.analyze(), "fire");

  G.adaptive.reset();
  for (let i = 0; i < 5; i++) G.adaptive.recordShot(5);
  assert.equal(G.adaptive.analyze(), "range");
});

test("AdaptiveDirector biases enemy types after wave 3", () => {
  const G = loadBrowserModule("js/systems/AdaptiveDirector.js", {
    wave: 8,
    player: { x: 0, y: 0 }
  });

  for (let i = 0; i < 20; i++) G.adaptive.recordShot(4);
  assert.equal(G.adaptive.analyze(), "fire");
  assert.equal(G.adaptive.chooseType("normal"), "spitter");

  G.adaptive.reset();
  for (let i = 0; i < 20; i++) G.adaptive.recordShot(5);
  assert.equal(G.adaptive.analyze(), "range");
  assert.equal(G.adaptive.chooseType("normal"), "hunter");
});

test("AdaptiveDirector mutates spawned enemies without removing core fields", () => {
  const G = loadBrowserModule("js/systems/AdaptiveDirector.js", {
    wave: 10,
    player: { x: 0, y: 0 }
  });

  for (let i = 0; i < 20; i++) G.adaptive.recordShot(4);
  const z = { type: "normal", hp: 100, maxHp: 100, speed: 100, damage: 20 };
  G.adaptive.mutateSpawn(z);

  assert.equal(z.adaptive, true);
  assert.ok(z.fireResist > 0);
  assert.equal(z.type, "normal");
  assert.ok(z.hp > 0);
  assert.ok(z.speed > 0);
  assert.ok(z.damage > 0);
});

test("AdaptiveDirector startWave announces the current adaptation", () => {
  const messages = [];
  const G = loadBrowserModule("js/systems/AdaptiveDirector.js", {
    wave: 5,
    player: { x: 0, y: 0 },
    showMessage: (message) => messages.push(message)
  });

  G.adaptive.startWave();
  assert.match(G.adaptive.lastWaveNote, /WORLD ADAPTING/);
  assert.equal(messages.length, 1);
});

test("Weather supports early-wave weather pool and countdown", () => {
  const messages = [];
  const G = loadBrowserModule("js/systems/Weather.js", {
    wave: 1,
    state: "playing",
    W: 800,
    H: 600,
    showMessage: (message) => messages.push(message)
  });

  G.startWeather();
  assert.ok(["clear", "rain"].includes(G.weather.id));
  assert.ok(G.weatherTime > 0);
  assert.equal(messages.length, 1);

  const before = G.weatherTime;
  G.updateWeather(1000);
  assert.equal(G.weatherTime, before - 1000);
  assert.match(G.weatherLabel(), /· 31s|· 35s/);
});

test("Weather produces rain particles and caps particle count", () => {
  const G = loadBrowserModule("js/systems/Weather.js", {
    wave: 4,
    state: "playing",
    W: 800,
    H: 600,
    showMessage: () => {}
  });

  G.weather = { id: "rain", name: "🌧️ RAIN", duration: 36000 };
  G.weatherTime = 36000;
  G.updateWeather(1000);

  assert.ok(G.weatherParticles.length > 0);
  assert.ok(G.weatherParticles.length <= 180);
  assert.ok(G.weatherParticles.every(p => Number.isFinite(p.x) && Number.isFinite(p.y)));
});

test("Weather rotates when the current weather expires", () => {
  let starts = 0;
  const G = loadBrowserModule("js/systems/Weather.js", {
    wave: 4,
    state: "playing",
    W: 800,
    H: 600,
    showMessage: () => { starts++; }
  });

  G.weather = { id: "fog", name: "🌫️ FOG", duration: 34000 };
  G.weatherTime = 1;
  G.updateWeather(10);

  assert.equal(starts, 1);
  assert.ok(G.weather);
  assert.ok(G.weatherTime > 0);
});

test("V6.0 lifecycle wiring is present in the real source", () => {
  const main = fs.readFileSync(path.join(ROOT, "js/main.js"), "utf8");
  const runtime = fs.readFileSync(path.join(ROOT, "js/core/Runtime.js"), "utf8");
  const zombie = fs.readFileSync(path.join(ROOT, "js/enemies/Zombie.js"), "utf8");
  const player = fs.readFileSync(path.join(ROOT, "js/player/Player.js"), "utf8");
  const weapons = fs.readFileSync(path.join(ROOT, "js/player/Weapons.js"), "utf8");
  const renderer = fs.readFileSync(path.join(ROOT, "js/render/Renderer.js"), "utf8");
  const css = fs.readFileSync(path.join(ROOT, "css/main.css"), "utf8");

  assert.match(main, /systems\/AdaptiveDirector\.js/);
  assert.match(main, /systems\/Weather\.js/);
  assert.match(runtime, /G\.adaptive\?\.reset\(\)/);
  assert.match(runtime, /G\.adaptive\?\.startWave\(\)/);
  assert.match(runtime, /G\.adaptive\?\.update\(dt\)/);
  assert.match(runtime, /G\.updateWeather\?\.\(dt\)/);
  assert.match(zombie, /G\.adaptive\?\.mutateSpawn\(z\)/);
  assert.match(zombie, /G\.adaptive\?\.recordKill\(z\)/);
  assert.match(player, /G\.adaptive\?\.recordDamageTaken\(n\)/);
  assert.match(weapons, /G\.adaptive\?\.recordShot\(4\)/);
  assert.match(player, /G\.drawPlayerV2=function\(\)/);
  assert.match(zombie, /G\.drawZombieV2=function\(z\)/);
});
