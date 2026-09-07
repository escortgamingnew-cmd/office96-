/* pixi-feel — Run Dady pseudo-3D իլյուզիայի փորձանմուշ (T-0003 spike)
 * Pixi.js v8, ոչ մի filter, ոչ մի արտաքին asset՝ բացի papi spritesheet-ից։
 * Ամբողջ «3D»-ն պրոյեկցիայի իլյուզիա ա. p = (zNear/z)^fovExp
 */
(async () => {
  "use strict";

  // ---------- Կոնստանտներ ----------
  const PAL = {
    bg: 0x14121a, panel: 0x211d2b, sidebar: 0x1c1824,
    line: 0x332c42, lineSoft: 0x2b2537,
    accent: 0xc8956d, accentSoft: 0x3a2c22,
    text: 0xe8e4f0, muted: 0x9a92ad, faint: 0x6f6883,
    yellow: 0xdfb45a, blue: 0x6ea8e8,
  };
  const Z_NEAR = 1, Z_FAR = 64;        // վիրտուալ խորության միջակայք
  const SEG_LEN = 2;                    // ճամփի գծանշման սեգմենտի երկարությունը z-ում
  const HORIZON = 0.40;                 // հորիզոնի y-ը՝ էկրանի մասնաբաժնով
  const MULT_RATE = 0.05;               // 1 + dist * rate (պրոտոյի բանաձևը)
  const ACCEL = 1.6, DECEL = 2.2;       // speed 0..1
  const N_SIDE = 30;                    // կողքի օբյեկտների pool
  const HERO_FRAMES = 20, HERO_COLS = 4, HERO_FW = 500, HERO_FH = 500;

  // ---------- App ----------
  const app = new PIXI.Application();
  await app.init({
    resizeTo: window,
    background: PAL.bg,
    antialias: false,
    resolution: Math.min(window.devicePixelRatio || 1, 2),
    autoDensity: true,
  });
  document.getElementById("stage").appendChild(app.canvas);

  const W = () => app.screen.width;
  const H = () => app.screen.height;
  const horizonY = () => H() * HORIZON;
  const roadHalf = (speed) => W() * (0.30 + 0.07 * speed); // FOV-ի իլյուզիա. արագանալիս ճամփան «լայնանում» ա

  // ---------- Canvas texture-ներ (baked, ոչ մի filter runtime-ում) ----------
  function cv(w, h) {
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    return [c, c.getContext("2d")];
  }
  function hex(n) { return "#" + n.toString(16).padStart(6, "0"); }

  function makeSkyTex() {
    const SW = 512, SH = 256;
    const [c, x] = cv(SW, SH);
    const g = x.createLinearGradient(0, 0, 0, SH);
    g.addColorStop(0, "#0d0b13");
    g.addColorStop(0.55, "#1a1626");
    g.addColorStop(0.86, "#2b2036");
    g.addColorStop(1, "#3a2c22"); // պղնձե շող հորիզոնում
    x.fillStyle = g; x.fillRect(0, 0, SW, SH);
    // աստղեր (կետ են մնում, որովհետև canvas-ը լայն ա)
    x.fillStyle = "rgba(232,228,240,1)";
    for (let i = 0; i < 140; i++) {
      const sy = Math.random() * SH * 0.6;
      x.globalAlpha = 0.1 + Math.random() * 0.45 * (1 - sy / (SH * 0.65));
      x.fillRect(Math.random() * SW, sy, Math.random() < 0.15 ? 2 : 1, 1);
    }
    x.globalAlpha = 1;
    return PIXI.Texture.from(c);
  }

  function makeSkylineTex() {
    const [c, x] = cv(1024, 170);
    let px = 0;
    while (px < 1024) {
      const bw = 30 + Math.random() * 70;
      const bh = 40 + Math.random() * 110;
      x.fillStyle = Math.random() < 0.5 ? "#171422" : "#1c1824";
      x.fillRect(px, 170 - bh, bw, bh);
      // հատուկենտ վառվող պատուհաններ
      x.fillStyle = Math.random() < 0.7 ? "rgba(223,180,90,.55)" : "rgba(110,168,232,.45)";
      const n = Math.floor(bw * bh / 900);
      for (let i = 0; i < n; i++) {
        if (Math.random() < 0.5) continue;
        x.fillRect(px + 3 + Math.random() * (bw - 6), 174 - bh + Math.random() * (bh - 10), 2, 2);
      }
      px += bw + 2;
    }
    // ներքևից մշուշ
    const g = x.createLinearGradient(0, 100, 0, 170);
    g.addColorStop(0, "rgba(58,44,34,0)");
    g.addColorStop(1, "rgba(58,44,34,.55)");
    x.fillStyle = g; x.fillRect(0, 0, 1024, 170);
    return PIXI.Texture.from(c);
  }

  function makeBuildingTex(seed) {
    const rnd = mulberry32(seed);
    const bw = 110 + Math.floor(rnd() * 110);
    const bh = 260 + Math.floor(rnd() * 200);
    const [c, x] = cv(bw, bh);
    const bodies = ["#1c1824", "#211d2b", "#241f30", "#1a1722"];
    x.fillStyle = bodies[Math.floor(rnd() * bodies.length)];
    x.fillRect(0, 6, bw, bh - 6);
    // եզրագիծ + տանիքի թեթև accent
    x.fillStyle = "#332c42";
    x.fillRect(0, 6, bw, 2);
    if (rnd() < 0.4) { x.fillStyle = "#c8956d"; x.fillRect(bw * 0.2, 0, 3, 8); } // ալեհավաք
    // պատուհանների ցանց՝ baked glow-ով
    const cols = Math.max(3, Math.floor(bw / 22));
    const rows = Math.max(6, Math.floor(bh / 26));
    for (let r = 0; r < rows; r++) {
      for (let q = 0; q < cols; q++) {
        if (rnd() > 0.38) continue; // մեծ մասը մութն ա
        const wx = 8 + q * ((bw - 16) / cols);
        const wy = 16 + r * ((bh - 26) / rows);
        const warm = rnd() < 0.75;
        x.shadowColor = warm ? "rgba(223,180,90,.8)" : "rgba(110,168,232,.7)";
        x.shadowBlur = 6;
        x.fillStyle = warm ? "rgba(223,180,90,.85)" : "rgba(110,168,232,.7)";
        x.fillRect(wx, wy, 5, 7);
      }
    }
    x.shadowBlur = 0;
    // ներքևի մութ գրադիենտ (գետնին «նստացնում» ա)
    const g = x.createLinearGradient(0, bh - 70, 0, bh);
    g.addColorStop(0, "rgba(13,11,19,0)");
    g.addColorStop(1, "rgba(13,11,19,.75)");
    x.fillStyle = g; x.fillRect(0, bh - 70, bw, 70);
    return PIXI.Texture.from(c);
  }

  function makeLampTex() {
    const [c, x] = cv(64, 240);
    // baked glow գլխին
    const g = x.createRadialGradient(44, 26, 2, 44, 26, 26);
    g.addColorStop(0, "rgba(232,185,138,.95)");
    g.addColorStop(0.35, "rgba(200,149,109,.5)");
    g.addColorStop(1, "rgba(200,149,109,0)");
    x.fillStyle = g; x.beginPath(); x.arc(44, 26, 26, 0, 7); x.fill();
    x.fillStyle = "#332c42";
    x.fillRect(18, 20, 6, 220);           // սյուն
    x.fillRect(18, 20, 26, 5);            // թև
    x.fillStyle = "#e8b98a";
    x.fillRect(40, 22, 9, 5);             // լամպ
    return PIXI.Texture.from(c);
  }

  function makeHazeTex() {
    const [c, x] = cv(16, 140);
    const g = x.createLinearGradient(0, 0, 0, 140);
    g.addColorStop(0, "rgba(20,18,26,0)");
    g.addColorStop(0.5, "rgba(35,27,30,.42)");
    g.addColorStop(1, "rgba(20,18,26,0)");
    x.fillStyle = g; x.fillRect(0, 0, 16, 140);
    return PIXI.Texture.from(c);
  }

  function makeGlowTex() {
    const [c, x] = cv(256, 128);
    const g = x.createRadialGradient(128, 64, 4, 128, 64, 120);
    g.addColorStop(0, "rgba(200,149,109,.5)");
    g.addColorStop(0.4, "rgba(200,149,109,.16)");
    g.addColorStop(1, "rgba(200,149,109,0)");
    x.fillStyle = g; x.fillRect(0, 0, 256, 128);
    return PIXI.Texture.from(c);
  }

  function makeShadowTex() {
    const [c, x] = cv(128, 48);
    const g = x.createRadialGradient(64, 24, 2, 64, 24, 60);
    g.addColorStop(0, "rgba(0,0,0,.5)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    x.fillStyle = g;
    x.save(); x.scale(1, 48 / 128); x.beginPath(); x.arc(64, 64, 60, 0, 7); x.fill(); x.restore();
    return PIXI.Texture.from(c);
  }

  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // ---------- Հերոսի spritesheet ----------
  const papiBase = await PIXI.Assets.load("assets/papi-run-20f.webp");
  const heroFrames = [];
  for (let i = 0; i < HERO_FRAMES; i++) {
    heroFrames.push(new PIXI.Texture({
      source: papiBase.source,
      frame: new PIXI.Rectangle((i % HERO_COLS) * HERO_FW, Math.floor(i / HERO_COLS) * HERO_FH, HERO_FW, HERO_FH),
    }));
  }

  // ---------- Սցենայի կառուցում ----------
  const skyTex = makeSkyTex();
  const skylineTex = makeSkylineTex();
  const lampTex = makeLampTex();
  const buildingTexes = [];
  for (let i = 0; i < 6; i++) buildingTexes.push(makeBuildingTex(1000 + i * 77));

  const root = app.stage;                  // shake-ը root-ի վրա ա
  const sky = new PIXI.Sprite(skyTex);
  const skyline = new PIXI.TilingSprite({ texture: skylineTex, width: 100, height: 170 });
  const glow = new PIXI.Sprite(makeGlowTex());   // պղնձե շող vanishing point-ում
  glow.anchor.set(0.5, 0.5);
  const road = new PIXI.Graphics();
  const world = new PIXI.Container();      // կողքի օբյեկտները՝ z-sorted
  world.sortableChildren = true;
  const haze = new PIXI.Sprite(makeHazeTex()); // հորիզոնի մշուշը՝ օբյեկտների ԾՆՎԵԼԸ քողարկող
  const heroLayer = new PIXI.Container();

  root.addChild(sky, skyline, glow, road, world, haze, heroLayer);

  // Կողքի օբյեկտների pool
  const side = [];
  for (let i = 0; i < N_SIDE; i++) {
    const sp = new PIXI.Sprite();
    sp.anchor.set(0.5, 1);
    world.addChild(sp);
    side.push({ sp, z: 0, side: 1, xOff: 1.6, kind: "b", w0: 0, h0: 0 });
    resetSideObj(side[i], true, i);
  }
  function resetSideObj(o, initial, i) {
    o.side = (i !== undefined ? i : Math.floor(Math.random() * 2)) % 2 === 0 ? -1 : 1;
    o.z = initial
      ? Z_NEAR + ((i + 0.5) / N_SIDE) * (Z_FAR - Z_NEAR)
      : Z_FAR - Math.random() * 3;
    const lamp = (i !== undefined ? i % 3 === 2 : Math.random() < 0.33);
    if (lamp) {
      o.kind = "l";
      o.sp.texture = lampTex;
      o.xOff = 1.08 + Math.random() * 0.1;
      o.h0 = 0.9; // էկրանի բարձրության մասնաբաժինը p=1-ում
    } else {
      o.kind = "b";
      o.sp.texture = buildingTexes[Math.floor(Math.random() * buildingTexes.length)];
      o.xOff = 1.55 + Math.random() * 1.5;
      o.h0 = 0.65 + Math.random() * 0.75;
    }
    // լամպերը հայելային են ձախ կողմում
    o.sp.scale.x = 1;
    o.mirror = o.kind === "l" && o.side === -1 ? -1 : 1;
  }

  // Հերոսը
  const heroShadow = new PIXI.Sprite(makeShadowTex());
  heroShadow.anchor.set(0.5, 0.5);
  const hero = new PIXI.AnimatedSprite(heroFrames);
  hero.anchor.set(0.5, 1);
  hero.loop = true;
  hero.gotoAndStop(0);
  heroLayer.addChild(heroShadow, hero);

  // ---------- Վիճակ ----------
  let holding = false;
  let speed = 0;          // 0..1
  let zOff = 0;           // ճամփի գծանշման հոսքի offset
  let dist = 0;           // «վազած» տարածությունը (մուլտի համար)
  let runPhase = 0;       // bob/sway ֆազա
  let skylineDrift = 0;
  let idleT = 0;

  const multEl = document.getElementById("mult");
  const hintEl = document.getElementById("hint");
  const fpsEl = document.getElementById("fps");
  let fpsOn = false, fpsAcc = 0, fpsN = 0, fpsT = 0;

  function toggleFps() { fpsOn = !fpsOn; fpsEl.style.display = fpsOn ? "block" : "none"; }
  document.getElementById("fpsBtn").addEventListener("click", (e) => { e.stopPropagation(); toggleFps(); });
  window.addEventListener("keydown", (e) => {
    if (e.key === "f" || e.key === "F") toggleFps();
    if (e.code === "Space") holding = true;
  });
  window.addEventListener("keyup", (e) => { if (e.code === "Space") holding = false; });
  const down = () => { holding = true; hintEl.classList.add("hidden"); };
  const up = () => { holding = false; };
  window.addEventListener("pointerdown", down);
  window.addEventListener("pointerup", up);
  window.addEventListener("pointercancel", up);
  window.addEventListener("blur", up);

  // ---------- Պրոյեկցիա ----------
  // p ∈ (0..1]. 1 = ամենամոտ, 0 = հորիզոն։ fovExp<1 արագության վրա՝
  // մոտիկ օբյեկտները ավելի կտրուկ են մեծանում → «FOV-ը լայնացավ» զգացողություն։
  function project(z, fovExp) {
    return Math.pow(Z_NEAR / z, fovExp);
  }

  // ---------- Ճամփի նկարումը (ամեն կադր, մեկ Graphics) ----------
  function drawRoad(fovExp) {
    const g = road;
    g.clear();
    const cx = W() / 2, hy = horizonY(), by = H() + 4;
    const halfBot = roadHalf(speed);

    // ասֆալտի հիմքը
    g.poly([cx - halfBot, by, cx + halfBot, by, cx + 3, hy, cx - 3, hy]).fill(0x161320);

    // սեգմենտային բանդեր + կենտրոնի գծանշում
    const k = Math.floor(zOff / SEG_LEN);
    for (let i = 0; ; i++) {
      const z0 = (k + i) * SEG_LEN - zOff;
      const z1 = z0 + SEG_LEN;
      if (z0 >= Z_FAR) break;
      const a = Math.max(z0, Z_NEAR), b = Math.min(z1, Z_FAR);
      if (b <= a) continue;
      const pa = project(a, fovExp), pb = project(b, fovExp);
      const ya = hy + (by - hy) * pa, yb = hy + (by - hy) * pb;
      const wa = halfBot * pa, wb = halfBot * pb;
      if ((k + i) % 2 === 0) {
        // բաց բանդ՝ հոսքի ռիթմը զգացվի ամբողջ լայնությամբ
        g.poly([cx - wa, ya, cx + wa, ya, cx + wb, yb, cx - wb, yb]).fill({ color: 0x262135, alpha: 0.9 });
      } else {
        // կենտրոնի դեղին dash՝ սեգմենտի միջին մասում
        const da = Math.max(z0 + SEG_LEN * 0.18, Z_NEAR), db = Math.min(z0 + SEG_LEN * 0.62, Z_FAR);
        if (db > da) {
          const p1 = project(da, fovExp), p2 = project(db, fovExp);
          const y1 = hy + (by - hy) * p1, y2 = hy + (by - hy) * p2;
          const w1 = Math.max(1.5, halfBot * 0.03 * p1), w2 = Math.max(0.8, halfBot * 0.03 * p2);
          g.poly([cx - w1, y1, cx + w1, y1, cx + w2, y2, cx - w2, y2]).fill({ color: PAL.yellow, alpha: 0.95 });
        }
      }
    }

    // եզրագծեր (ուղիղ են՝ ուղիղ ճամփի վրա, մեկական քառանկյուն)
    for (const s of [-1, 1]) {
      g.poly([cx + s * halfBot * 0.93, by, cx + s * halfBot * 0.965, by, cx + 3 * s, hy, cx + 2 * s, hy])
        .fill({ color: PAL.muted, alpha: 0.5 });
      // պղնձե curb
      g.poly([cx + s * halfBot * 0.985, by, cx + s * halfBot, by, cx + 3.5 * s, hy, cx + 3 * s, hy])
        .fill({ color: PAL.accent, alpha: 0.35 });
    }
    // մայթի ստվերային շերտ ճամփից դուրս
    for (const s of [-1, 1]) {
      g.poly([cx + s * halfBot, by, cx + s * halfBot * 1.6, by, cx + 8 * s, hy, cx + 3.5 * s, hy])
        .fill({ color: 0x121019, alpha: 0.9 });
    }
  }

  // ---------- Layout / resize ----------
  function layout() {
    sky.width = W(); sky.height = H();
    skyline.width = W();
    skyline.height = Math.min(170, H() * 0.24);
    skyline.y = horizonY() - skyline.height + 6;
    glow.x = W() / 2; glow.y = horizonY() + 4;
    glow.width = W() * 0.75; glow.height = H() * 0.16;
    haze.width = W(); haze.height = H() * 0.16;
    haze.y = horizonY() - haze.height * 0.45;
    const hs = (H() * 0.30) / HERO_FH; // հերոսը ~30% էկրանի բարձրության
    hero.scale.set(hs);
  }
  layout();
  window.addEventListener("resize", () => setTimeout(layout, 50));

  // ---------- Debug hook (միայն փորձարկման համար) ----------
  window.__feel = {
    state: () => ({ speed, holding, dist, zOff }),
    force: (v, d) => { holding = true; speed = v; if (d !== undefined) dist = d; },
    release: () => { holding = false; },
  };

  // ---------- Գլխավոր loop ----------
  app.ticker.add((tk) => {
    const dt = Math.min(tk.deltaMS / 1000, 0.05);

    // արագություն
    if (holding) speed = Math.min(1, speed + ACCEL * dt);
    else speed = Math.max(0, speed - DECEL * dt);
    const fovExp = 1 - 0.16 * speed; // FOV-ի իլյուզիա

    // հոսք
    const zSpeed = speed * 26;      // z-միավոր/վրկ
    zOff += zSpeed * dt;
    if (speed > 0.02) {
      dist += speed * 8 * dt;
      runPhase += dt * (6 + 14 * speed);
    }
    idleT += dt;

    // ֆոն
    skylineDrift += zSpeed * dt * 0.3;
    skyline.tilePosition.x = -skylineDrift;

    // ճամփա
    drawRoad(fovExp);

    // կողքի օբյեկտներ
    const cx = W() / 2, hy = horizonY(), by = H() + 4;
    const halfBot = roadHalf(speed);
    for (const o of side) {
      o.z -= zSpeed * dt;
      if (o.z <= Z_NEAR * 1.02) { resetSideObj(o, false); }
      const p = project(o.z, fovExp);
      o.sp.x = cx + o.side * halfBot * o.xOff * p;
      o.sp.y = hy + (by - hy) * p;
      const targetH = H() * o.h0 * p;
      const sc = targetH / o.sp.texture.height;
      o.sp.scale.set(sc * o.mirror, sc);
      o.sp.zIndex = -o.z;
      // հորիզոնում փափուկ են ծնվում, մոտիկում՝ լրիվ կոնտրաստ
      o.sp.alpha = Math.min(1, Math.max(0, (p - 0.02) * 22));
      // մթնոլորտային խորություն. հեռուն՝ մուգ ու կապտավուն, մոտիկը՝ լրիվ գույն
      const t = Math.min(1, p * 2.4);
      const v = Math.floor(90 + 165 * t);
      o.sp.tint = (v << 16) | (v << 8) | Math.min(255, v + 18);
    }

    // հերոս
    const heroX = cx;
    const baseY = H() - H() * 0.015;
    const bob = Math.sin(runPhase * 2) * H() * 0.008 * speed;
    const swayX = Math.sin(runPhase) * W() * 0.006 * speed;
    hero.x = heroX + swayX;
    hero.y = baseY + bob;
    hero.rotation = Math.sin(runPhase) * 0.045 * speed;
    heroShadow.x = heroX + swayX * 0.6;
    heroShadow.y = baseY - H() * 0.006;
    heroShadow.width = hero.width * 0.62;
    heroShadow.height = hero.width * 0.13;
    heroShadow.alpha = 0.55 - 0.25 * speed + (bob < 0 ? bob / (H() * 0.03) : 0) * 0.3;

    if (speed > 0.05) {
      if (!hero.playing) hero.play();
      hero.animationSpeed = 0.10 + 0.42 * speed;
    } else {
      // idle. կանգնած՝ շատ դանդաղ «շնչող» ցիկլ առաջին կադրերի վրա
      if (hero.playing) { hero.gotoAndStop(0); }
      hero.scale.y = ((H() * 0.30) / HERO_FH) * (1 + Math.sin(idleT * 2.2) * 0.006);
      hero.rotation *= 0.9;
    }
    if (speed > 0.05) hero.scale.y = (H() * 0.30) / HERO_FH;

    // camera shake բարձր արագության վրա (root-ի offset, ոչ մի filter)
    const shake = Math.max(0, speed - 0.72) * 10;
    root.x = (Math.random() - 0.5) * shake;
    root.y = (Math.random() - 0.5) * shake * 0.6;

    if (speed > 0.3) hintEl.classList.add("hidden");

    // մուլտիպլիկատոր
    const mult = 1 + dist * MULT_RATE;
    multEl.textContent = "×" + mult.toFixed(2);
    multEl.classList.toggle("hot", speed > 0.85);
    multEl.style.transform = speed > 0.85 ? `scale(${1 + Math.sin(runPhase * 3) * 0.02})` : "";

    // FPS
    if (fpsOn) {
      fpsAcc += tk.deltaMS; fpsN++;
      fpsT += tk.deltaMS;
      if (fpsT > 250) {
        fpsEl.textContent = Math.round(1000 / (fpsAcc / fpsN)) + " fps";
        fpsAcc = 0; fpsN = 0; fpsT = 0;
      }
    }
  });
})();
