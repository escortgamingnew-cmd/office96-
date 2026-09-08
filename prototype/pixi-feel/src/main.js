/* pixi-feel — Run Dady-ի խաղային ներկայացումը Pixi.js v8 2.5D-ով [D-001], v16_14 պրոտոյի պարիտետով։
 * Ռաունդի հոսքը պրոտոյի animateBody()-ի ուղիղ վերաշարադրանքն ա (speed, ոտքերի հոսք, catch, rewind),
 * արդյունքը՝ SANDBOX fake-book-ից՝ bet-ի պահին (D-003)։ RGS/network ԴԵՌ չկա։
 * Ոչ մի filter, DPR cap ≤2, pooling — մոբայլի բյուջեն սուրբ ա։
 */
import { P, IS_MOBILE } from "./params.js";
import { COL, makeSkyTex, makeChaserTex } from "./tex.js";
import { Camera } from "./cam.js";
import { World } from "./world.js";
import { UI } from "./ui.js";
import { drawBook } from "./sandbox.js";
import { initFeelLab } from "./feellab.js";

(async () => {
  "use strict";
  const HERO_FRAMES = 20, HERO_COLS = 4, HERO_FW = 500, HERO_FH = 500;
  const CHAR_W = 4.7, CHAR_H = 4.7, CHAR_Y = 2.3;   // պրոտո. sprite 4.7 world unit, կենտրոն y=2.3
  const HOTEL_Z = -45, NEWG_OFF = 47, HOTEL_ON = false; // պրոտո. հյուրանոցը առաջին ռաունդից հետո անտեսանելի խարիսխ ա
  const CHAR_Z = () => innerWidth / innerHeight < 1 ? -1.2 : 2;

  // ---------- App ----------
  const app = new PIXI.Application();
  await app.init({
    resizeTo: window, background: COL.fog, antialias: false,
    resolution: Math.min(window.devicePixelRatio || 1, IS_MOBILE ? 1.5 : 2), autoDensity: true,
  });
  app.ticker.maxFPS = IS_MOBILE ? 30 : 60;   // պրոտո. frame cap = մոբայլի սառեցման գլխավոր լծակը
  document.getElementById("stage").appendChild(app.canvas);
  const W = () => app.screen.width, H = () => app.screen.height;

  // ---------- Հերոսի spritesheet ----------
  const papiBase = await PIXI.Assets.load("assets/papi-run-20f.webp");
  const heroFrames = [];
  for (let i = 0; i < HERO_FRAMES; i++) heroFrames.push(new PIXI.Texture({
    source: papiBase.source,
    frame: new PIXI.Rectangle((i % HERO_COLS) * HERO_FW, Math.floor(i / HERO_COLS) * HERO_FH, HERO_FW, HERO_FH),
  }));

  // ---------- Սցենա ----------
  const cam = new Camera();
  const view = new PIXI.Container();           // roll-ը սրա վրա ա (pivot՝ էկրանի կենտրոն)
  app.stage.addChild(view);
  const sky = new PIXI.Sprite(makeSkyTex());
  const world = new World(cam);
  view.addChild(sky, world.ground, world.stars, world.objs);

  const mkChar = () => { const s = new PIXI.Sprite(heroFrames[0]); s.anchor.set(.5, .5); world.objs.addChild(s); return s; };
  const hero = mkChar();                       // grandpa
  const newHero = mkChar(); newHero.visible = false;   // rewind-ի «նոր Պապին»՝ հյուրանոցի մոտ
  const chaser = new PIXI.Sprite(makeChaserTex()); chaser.anchor.set(.5, .5); chaser.visible = false; world.objs.addChild(chaser);
  const heroShadow = new PIXI.Sprite(world.shadowTex); heroShadow.anchor.set(.5, .5); world.objs.addChild(heroShadow);
  const newShadow = new PIXI.Sprite(world.shadowTex); newShadow.anchor.set(.5, .5); newShadow.visible = false; world.objs.addChild(newShadow);

  // ---------- Վիճակ (պրոտոյի անուններով) ----------
  let running = false, speed = 0, dist = 0, animClock = 0, dispF = 0, runPhase = 0, lost = false;
  let BET = 5, book = null, cashed = false, coHold = 0, roundOn = false;
  let catchAnim = 0, loseSettled = false, loseAnim = 0, cashSweep = false, keepChar = false;
  let sweepD = 160, sweepPeak = 80, hotelStartZ = HOTEL_Z;
  const restartFrom = { x: 0, y: 4.5, z: 14 }; let restartFov = 55;
  const camCur = { fov: P.fov, y: P.camY, z: P.camZ }; let pullCur = 0;
  let shakeT = 0; const shakeOff = { x: 0, y: 0 }, shakeTarget = { x: 0, y: 0 };
  const enemyFrom = { x: 6.5, y: 2.5, z: 19 }, enemyTo = { x: .9, y: 2.5, z: 7 }, enemy = { x: 0, y: 2.5, z: 0 };
  const grandpa = { x: 0, y: CHAR_Y, z: CHAR_Z(), rot: 0, sw: CHAR_W, sh: CHAR_H, visible: true, frame: 0 };
  const newGrandpa = { z: 0, visible: false };
  const curMult = () => 1 + dist * P.multRate;

  // ---------- UI ----------
  const ui = new UI({
    onPlaceBet(bet) {
      BET = bet;
      book = drawBook();                     // SANDBOX. crash-կետը որոշվում ա ՀԻՄԱ, ոչ վազքի ընթացքում
      ui.cashoutAmount(BET);
    },
    onHold: (on) => go(on),
    onRestart() { if (ui.state === "lost" && lost && loseAnim === 0) restart(false); },
    onCashOut: () => doCashOut(),
  });

  function go(on) {
    if (lost || loseAnim > 0) return;
    if (on && ui.state !== "run") return;
    if (on && !running) { roundOn = true; cashed = false; coHold = 0; ui.cashoutReset(); }
    running = on; ui.active(on); ui.setState(on ? "running" : "idle");
  }
  function lose() {
    lost = true; running = false; loseSettled = false; roundOn = false; ui.active(false);
    ui.pushResult(curMult(), false);
    catchAnim = 0.001;
    // հետապնդողը շենքի պես ա մտնում. ամուր, կամեռայի հետևից, հոսքի մասը — կողքից, անցնում ա, կտրում Պապիի ճամփան
    chaser.visible = true;
    enemyFrom.x = 6.5; enemyFrom.y = 2.5; enemyFrom.z = cam.z + 5;
    enemyTo.x = 0.9; enemyTo.y = 2.5; enemyTo.z = (P.camZ + grandpa.z) / 2 - 1;
    Object.assign(enemy, enemyFrom);
  }
  function doCashOut() {
    if (lost || cashed || loseAnim > 0 || !roundOn) return;
    cashed = true; running = false; ui.active(false);
    ui.cashoutWon(BET * curMult());
    ui.pushResult(curMult(), true);
    coHold = 1.4;
    restart(true);                              // rewind-ը սկսվում ա հենց սեղմելու պահին
  }
  function restart(fromCashout = false) {
    // rewind. բռնված Պապին ու հետապնդողը մնում են տեղում, աշխարհը ԵՏ ա հոսում սկիզբ, որտեղ նոր Պապին ա սպասում
    restartFrom.x = cam.x; restartFrom.y = cam.y; restartFrom.z = cam.z; restartFov = camCur.fov;
    catchAnim = 0; loseAnim = 0.001;
    lost = false; running = false; speed = 0; dist = 0; animClock = 0; dispF = 0; world.clearBillboards();
    pullCur = 0; roundOn = false;
    ui.setMult(1, false); ui.setState(fromCashout ? "cashed out" : "idle");
    if (!fromCashout) { cashed = false; coHold = 0; ui.cashoutShow(false); ui.cashoutReset(); }
    cashSweep = fromCashout;
    const hotel = world.hotel;
    if (fromCashout) {
      if (hotel.gone || !hotel.visible) { hotel.visible = HOTEL_ON; hotel.z = -(P.fogFar + 40); }
      hotel.gone = false;
      sweepD = Math.max(HOTEL_Z - hotel.z, 4);   // իրական հեռավորությունը՝ վազածի չափ
    } else {
      hotel.visible = HOTEL_ON; hotel.gone = false;
      sweepD = Math.max(P.fogFar - HOTEL_Z + 25, 120);
      hotel.z = HOTEL_Z - sweepD;
    }
    keepChar = sweepD < 14;                     // կարճ rewind. նույն Պապին տեղում ա, աշխարհը սահում ա տակով
    if (keepChar) { newGrandpa.visible = false; resetHero(); }
    else { newGrandpa.visible = true; newGrandpa.z = hotel.z + NEWG_OFF; }
    hotelStartZ = hotel.z;
    sweepPeak = sweepD * 0.55 * Math.PI / 2;    // զանգակի գագաթ. հոսքը ճիշտ sweepD ա ծածկում
    camCur.fov = P.fov; camCur.y = P.camY; camCur.z = P.camZ;
  }
  function resetHero() { grandpa.visible = true; grandpa.x = 0; grandpa.y = CHAR_Y; grandpa.z = CHAR_Z(); grandpa.rot = 0; grandpa.sw = CHAR_W; grandpa.sh = CHAR_H; grandpa.frame = 0; }

  // ---------- Feel Lab / FPS / debug ----------
  initFeelLab(() => { camCur.fov = P.fov; });
  const fpsEl = document.getElementById("fps");
  let fpsOn = false, fpsAcc = 0, fpsN = 0, fpsT = 0;
  const toggleFps = () => { fpsOn = !fpsOn; fpsEl.style.display = fpsOn ? "block" : "none"; };
  document.getElementById("fpsBtn").addEventListener("click", e => { e.stopPropagation(); toggleFps(); });
  addEventListener("keydown", e => { if (e.key === "f" || e.key === "F") toggleFps(); });
  window.__feel = {
    state: () => ({ ui: ui.state, running, speed, dist, mult: curMult(), lost, cashed, roundOn, loseAnim, catchAnim, book, cam: { x: cam.x, y: cam.y, z: cam.z, fov: camCur.fov } }),
    placeBet: (b = 5) => { ui.bet = b; ui.drawBet(); ui.btn.click(); },
    hold: (on) => go(on),
    cashout: () => doCashOut(),
    restart: () => ui.btn.click(),
    setCrash: (d) => { if (book) book.crashDist = d; },
    step: (dt = 1 / 60, n = 1) => { for (let i = 0; i < n; i++) frame(dt); },   // դետերմինիստիկ քայլ (թեստ. rAF-ից անկախ)
    budget: () => ({ objs: world.objs.children.length, stars: world.stars.children.length, visible: world.objs.children.filter(c => c.visible).length }),
    P,
  };

  // ---------- Կերպարների նկարումը ----------
  const pt = {};
  function drawChar(sp, sh, c, visible) {
    sp.visible = sh.visible = false;
    if (!visible) return;
    const p = cam.project(c.x, c.y, c.z, pt);
    if (p.d <= 0.3) return;
    sp.visible = true; sp.x = p.sx; sp.y = p.sy; sp.rotation = c.rot;
    sp.scale.set(p.s * c.sw / HERO_FW, p.s * c.sh / HERO_FH);
    sp.zIndex = -p.d; sp.alpha = 1 - world.fogT(p.d);
    // կոնտակտային ստվեր. գետնի էլիպս charW×.8 / charW×.42, hop-ից թեթևանում ա
    const lift = Math.max(0, c.y - CHAR_Y);
    const g = cam.project(c.x, 0, c.z, {}), g2 = cam.project(c.x, 0, c.z - c.sw * .21, {});
    sh.visible = true; sh.x = g.sx; sh.y = g.sy;
    sh.width = g.s * c.sw * .8 * (1 - lift * .3); sh.height = Math.max(2, (g.sy - g2.sy) * 2 * (1 - lift * .3));
    sh.alpha = .45 * (1 - lift * .4) * sp.alpha; sh.zIndex = -g.d - 0.02;
  }

  // ---------- Layout ----------
  function layout() {
    view.pivot.set(W() / 2, H() / 2); view.position.set(W() / 2, H() / 2);
    if (!running && !lost) grandpa.z = CHAR_Z();
    ui.measure();
  }
  addEventListener("resize", () => setTimeout(layout, 50));
  layout();

  // ---------- Գլխավոր loop (պրոտոյի animateBody) ----------
  app.ticker.add((tk) => frame(Math.min(tk.deltaMS / 1000, 0.05)));
  function frame(dt) {
    const k = Math.min(1, speed / P.target);

    // cash out կոճակը. հայտնվում ա ռաունդի հետ ու մնում ա մինչև վերջ (lose / cashout)
    if (coHold > 0) coHold = Math.max(0, coHold - dt);
    if (!cashed) ui.cashoutAmount(BET * curMult());
    ui.cashoutShow((!lost && loseAnim === 0 && !cashed && roundOn) || coHold > 0);

    // --- catch. հետապնդողը անցնող օբյեկտի պես ա մտնում ու նստում, կամերան ուղղակի մարում ա ---
    if (catchAnim > 0) {
      catchAnim = Math.min(1, catchAnim + dt * 1.8);
      const e = 1 - Math.pow(1 - catchAnim, 3);
      enemy.x = enemyFrom.x + (enemyTo.x - enemyFrom.x) * e; enemy.z = enemyFrom.z + (enemyTo.z - enemyFrom.z) * e;
    }
    if (lost && !loseSettled && catchAnim >= 1 && speed < 0.6) { loseSettled = true; ui.showLost(); ui.setMult(curMult(), true); }

    // --- rewind. աշխարհը ԵՏ ա հոսում սկիզբ, բռնված զույգը մնում ա ---
    if (loseAnim > 0) {
      loseAnim = Math.min(1, loseAnim + dt * (keepChar ? 2.6 : cashSweep ? P.rewindCash : P.rewindLose));
      const t2 = loseAnim, e = t2 < .5 ? 4 * t2 * t2 * t2 : 1 - Math.pow(-2 * t2 + 2, 3) / 2;
      cam.x = restartFrom.x * (1 - e); cam.y = restartFrom.y + (P.camY - restartFrom.y) * e; cam.z = restartFrom.z + (P.camZ - restartFrom.z) * e;
      if (!keepChar) cam.y += 9 * Math.sin(Math.PI * t2);   // 'over'. դրոն-կամար՝ կերպարի գլխի վրայով
      camCur.fov = restartFov + (P.fov - restartFov) * e; cam.fov = camCur.fov; cam.roll = 0;
      const la = Math.min(1, dt * (cashSweep ? 6 : 2.5));
      cam.look.x += (0 - cam.look.x) * la; cam.look.y += (2 - cam.look.y) * la; cam.look.z += (-30 - cam.look.z) * la;
      const swDz = keepChar ? 0 : sweepPeak * Math.sin(Math.PI * t2) * dt;
      world.rewind(swDz);
      if (!keepChar && grandpa.visible) { grandpa.z += swDz; if (grandpa.z > cam.z + 8) grandpa.visible = false; }
      if (chaser.visible) { enemy.z += swDz; if (enemy.z > cam.z + 8) chaser.visible = false; }
      const hotel = world.hotel;
      hotel.z = keepChar ? hotelStartZ + (HOTEL_Z - hotelStartZ) * e : hotelStartZ + (HOTEL_Z - hotelStartZ) * (1 - Math.cos(Math.PI * t2)) / 2;
      newGrandpa.z = hotel.z + NEWG_OFF;
      if (loseAnim >= 1) {
        loseAnim = 0; cam.look.x = 0; cam.look.y = 2; cam.look.z = -30; hotel.z = HOTEL_Z;
        resetHero(); newGrandpa.visible = false; chaser.visible = false;
        if (ui.state !== "bet") ui.showBet();
      }
      ui.setVignette(0);
      renderFrame();
      return;
    }

    // --- կամերա. fov-zoom, lag, lose pull, shake 18Hz, ռիթմ, tilt (ամեն վիճակում — lose-ին էլ մարում ա k-ով) ---
    const tFov = P.fov + k * 14 * P.zoomK, lagA = Math.min(1, dt * P.camLag);
    camCur.fov += (tFov - camCur.fov) * lagA; camCur.y += (P.camY - camCur.y) * lagA; camCur.z += (P.camZ - camCur.z) * lagA;
    pullCur += ((lost ? P.losePull : 0) - pullCur) * Math.min(1, dt * 1.2);
    shakeT += dt * P.shakeF;
    if (shakeT >= 1) { shakeT = 0; shakeTarget.x = Math.random() - .5; shakeTarget.y = Math.random() - .5; }
    shakeOff.x += (shakeTarget.x - shakeOff.x) * Math.min(1, dt * P.shakeF * 2);
    shakeOff.y += (shakeTarget.y - shakeOff.y) * Math.min(1, dt * P.shakeF * 2);
    const sh = k * P.shake, rb = k * P.rhythm;
    const bobY = -Math.abs(Math.sin(runPhase)) * .10 * rb, bobX = Math.sin(runPhase) * .07 * rb;
    cam.x = shakeOff.x * sh * .25 + bobX;
    cam.y = camCur.y + shakeOff.y * sh * .15 + bobY;
    cam.z = camCur.z + pullCur;
    cam.fov = camCur.fov;
    const lx = lost ? .5 : 0, ly = lost ? 2.3 : 2 + k * P.tilt * 1.2, lz = lost ? -8 : -30;
    const la = Math.min(1, dt * (lost ? 2 : 8));
    cam.look.x += (lx - cam.look.x) * la; cam.look.y += (ly - cam.look.y) * la; cam.look.z += (lz - cam.look.z) * la;
    cam.roll = shakeOff.x * sh * .016 + Math.sin(runPhase) * .01 * rb - k * P.tilt * .06;
    ui.setVignette(k);

    // --- արագություն. TARGET-ին էքսպոնենտով, lose-ին աշխարհը արագ ա կանգնում ---
    speed += ((running ? P.target : 0) - speed) * Math.min(1, dt * (running ? P.accelK : (lost ? P.loseDecel : P.stopDecel)));
    if (!running && speed < P.target * 0.12) speed = 0;
    if (speed > 0.05) {
      // ոտքերին կապած հոսք. կադրերը animFps-ով, ճամփան ճիշտ էդ քայլերի տարածությունն ա անցնում (stride մ/ցիկլ)
      const spdN = Math.min(1, speed / P.target), dtA = Math.min(dt, 0.034);
      const animAdv = dtA * P.animFps * spdN;
      const dz = animAdv / HERO_FRAMES * P.stride;
      if (!lost && !cashed) {
        dist += dz; ui.setMult(curMult(), false);
        if (book && dist >= book.crashDist) lose();     // SANDBOX crash-կետ (պրոտո. runTime > nextAt)
      }
      animClock += animAdv;
      if (lost && speed < 3) { grandpa.frame = 0; grandpa.y = CHAR_Y; grandpa.rot = 0; grandpa.sw = CHAR_W; grandpa.sh = CHAR_H; }
      else {
        const ideal = Math.floor(animClock);
        dispF = ideal > dispF ? dispF + 1 : ideal;          // մեկ կադր/ռենդեր — բաց թողած կադրը «ցնցում» ա կարդացվում
        grandpa.frame = ((dispF % HERO_FRAMES) + HERO_FRAMES) % HERO_FRAMES;
        const hopPh = ((animClock % HERO_FRAMES) / HERO_FRAMES) * Math.PI * 2;
        runPhase = hopPh;
        grandpa.y = CHAR_Y + Math.abs(Math.sin(hopPh)) * 0.18 * Math.min(1, speed / 6) * P.wobble;
        grandpa.rot = -0.08 * k * P.wobble;
        grandpa.sw = CHAR_W + k * .2 * P.wobble; grandpa.sh = CHAR_H - k * .15 * P.wobble;
      }
      world.flow(dz, dt);
    } else {
      world.idleCars(dt);
      grandpa.frame = 0; grandpa.y = CHAR_Y; grandpa.rot = 0; grandpa.sw = CHAR_W; grandpa.sh = CHAR_H;
    }
    renderFrame();
  }

  function renderFrame() {
    cam.update(W(), H());
    view.rotation = cam.roll;
    const hy = cam.horizonY();
    sky.x = 0; sky.y = 0; sky.width = W(); sky.height = Math.max(2, hy + 2);
    world.render();
    hero.texture = heroFrames[grandpa.frame];
    drawChar(hero, heroShadow, grandpa, grandpa.visible);
    newHero.texture = heroFrames[0];
    drawChar(newHero, newShadow, { x: 0, y: CHAR_Y, z: newGrandpa.z, rot: 0, sw: CHAR_W, sh: CHAR_H }, newGrandpa.visible);
    if (chaser.visible) {
      const p = cam.project(enemy.x, enemy.y, enemy.z, pt);
      if (p.d > 0.3) { chaser.x = p.sx; chaser.y = p.sy; chaser.scale.set(p.s * 5.4 / 128, p.s * 6.7 / 160); chaser.zIndex = -p.d; chaser.alpha = 1; chaser.renderable = true; }
      else chaser.renderable = false;
    }
    if (fpsOn) {
      fpsAcc += app.ticker.deltaMS; fpsN++; fpsT += app.ticker.deltaMS;
      if (fpsT > 250) { fpsEl.textContent = Math.round(1000 / (fpsAcc / fpsN)) + " fps"; fpsAcc = 0; fpsN = 0; fpsT = 0; }
    }
  }
})();
