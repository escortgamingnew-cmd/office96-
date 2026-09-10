/* Աշխարհը — v16_14 պրոտոյի procedural քաղաքի 2.5D վերակառուցումը։
 * Կոորդինատները մետրերով են, պրոտոյի դասավորությամբ. կամերան z=14-ում, օբյեկտները ծնվում են
 * SPAWN_Z=40-ում (կամեռայի հետևում) ու հոսում են −z՝ դեպի մշուշ (Պապին կամեռայի կողմ ա վազում)։
 * Ամեն ինչ sprite/mesh ա, մշուշը՝ alpha fade դեպի fog-գույն ֆոն + ճամփի բանդերի գույնի lerp։
 */
import { P } from "./params.js";
import * as T from "./tex.js";
import { makeGroundTex, makeGroundFogTex, makeFootTex, makeCornTex } from "./tex.js"; // T-0009 (անունով, ոչ T.* — bundle-ի texNS ցուցակը չի փոխվում)

const SPAWN_Z = 40;
const LAMP_N = 14;
const GROUND_ROWS = 48, GROUND_XN = 32, GROUND_COLS = GROUND_XN + 3; // գետնի mesh. 48 շարք խորությամբ (հաստատուն d-հարաբերություն) × (−∞ | 32 բջիջ −gx..+gx | +∞)
const CORN_H = 0.5, CORN_P = 0.22, FOOT_M = 1.6; // պարապետի բարձրություն/ելուստ (մ), հիմքի ստվերի շրջագիծ (մ)
const clamp01 = (v) => v < 0 ? 0 : v > 1 ? 1 : v;

function hexLerp(a, b, t) {
  const ar = a >> 16 & 255, ag = a >> 8 & 255, ab = a & 255, br = b >> 16 & 255, bg = b >> 8 & 255, bb = b & 255;
  return (Math.round(ar + (br - ar) * t) << 16) | (Math.round(ag + (bg - ag) * t) << 8) | Math.round(ab + (bb - ab) * t);
}
const hexN = (s) => parseInt(s.slice(1), 16);

/* Պրոյեկցված քառանկյուն texture-ով. PerspectiveMesh (perspective-correct) կամ MeshSimple fallback */
class Quad {
  constructor(texture, sub = 4) {             // sub = subdivision. 4×4 մեծ երեսներին, 2×2 բարակ շերտերին (պարապետ)
    if (PIXI.PerspectiveMesh) {
      this.m = new PIXI.PerspectiveMesh({ texture, verticesX: sub, verticesY: sub, x0: 0, y0: 0, x1: 1, y1: 0, x2: 1, y2: 1, x3: 0, y3: 1 });
      this.persp = true;
    } else {
      this.m = new PIXI.MeshSimple({ texture, vertices: new Float32Array(8), uvs: new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]), indices: new Uint32Array([0, 1, 2, 0, 2, 3]) });
      this.persp = false;
    }
    this.c = new Float32Array(8);               // վերջին անկյունները (էկրան), hit-test-ի համար
  }
  set(x0, y0, x1, y1, x2, y2, x3, y3) {
    if (this.persp) this.m.setCorners(x0, y0, x1, y1, x2, y2, x3, y3);
    else { const v = this.m.vertices; v[0] = x0; v[1] = y0; v[2] = x1; v[3] = y1; v[4] = x2; v[5] = y2; v[6] = x3; v[7] = y3; }
    const c = this.c; c[0] = x0; c[1] = y0; c[2] = x1; c[3] = y1; c[4] = x2; c[5] = y2; c[6] = x3; c[7] = y3;
  }
  /* կետը քառանկյան մեջ ա՞ (ուռուցիկ. պրոյեկցված ուղղանկյուն) — Asset Lab-ի hit-test */
  contains(px, py) {
    if (!this.m.visible) return false;
    const c = this.c; let neg = false, pos = false;
    for (let i = 0; i < 4; i++) {
      const ax = c[i * 2], ay = c[i * 2 + 1], bx = c[(i * 2 + 2) % 8], by = c[(i * 2 + 3) % 8];
      const cr = (bx - ax) * (py - ay) - (by - ay) * (px - ax);
      if (cr < 0) neg = true; else if (cr > 0) pos = true;
    }
    return !(neg && pos);
  }
}

export class World {
  constructor(cam) {
    this.cam = cam;
    this.ground = new PIXI.Container();         // գետին + ճամփա + մայթ. մեկ textured Mesh + մշուշի gradient sprite (T-0009)
    this.stars = new PIXI.Container();
    this.objs = new PIXI.Container();           // z-sorted sprite-եր/mesh-եր
    this.objs.sortableChildren = true;
    this.roadPhase = 0;                         // dash-երի հոսքի ֆազա (մ)
    this.bbTimer = 0;
    this.billboards = [];
    this.pt = {};
    this.pq = [{}, {}, {}, {}];                 // project() pool քառանկյունների համար — hot path-ում նոր օբյեկտ չկա
    this._build();
    this._buildGround();
  }

  _spr(texture, ax = .5, ay = 1) { const s = new PIXI.Sprite(texture); s.anchor.set(ax, ay); this.objs.addChild(s); return s; }

  _build() {
    // --- շենքեր. 10 վարիանտ, 12/կողմ, երկու երես ---
    this.variants = []; for (let i = 0; i < 10; i++) this.variants.push(T.makeBuildingVariant());
    this.antennaTex = T.makeAntennaTex();
    this.roofTex = T.makeRoofTex();
    this.treeTexes = [T.makeTreeTex(), T.makeTreeTex(), T.makeTreeTex()];
    this.bushTexes = [T.makeBushTex(), T.makeBushTex()];
    this.footTex = makeFootTex(); this.cornTex = makeCornTex();   // T-0009. հիմքի ստվեր, պարապետ
    this.buildings = [];
    this.selected = null;                       // Asset Lab. ընտրված շենքը (buildings[i] օբյեկտ, ոչ էկրանային դիրք)
    for (const side of [-1, 1]) for (let i = 0; i < P.count; i++) {
      const v = T.pick(this.variants);
      // tex = Asset Lab-ի override-ներ (drop արած նկար), null = վարիանտի canvas-ը
      // sc = Asset Lab-ի scale (0.6–1.8), sv = վարիանտի չափերը × sc (render-ը սրանով ա, չափերը փոխվելիս ա հաշվվում, ոչ ամեն կադր)
      // footQ = հիմքի կոնտակտային ստվեր (գետնի վրա), cornF/cornS = պարապետ front/կող (T-0009, P.depthFx)
      const b = { side, i, v, vi: this.variants.indexOf(v), sc: 1, sv: null, tex: { front: null, side: null }, xj: T.rnd(0, 2), z: SPAWN_Z - i * P.seg, front: this._spr(v.front), sideQ: new Quad(v.side), roofQ: new Quad(this.roofTex), footQ: new Quad(this.footTex), cornF: new Quad(this.cornTex, 2), cornS: new Quad(this.cornTex, 2), antenna: null, trees: [], bushes: [] };
      this.objs.addChild(b.footQ.m, b.sideQ.m, b.roofQ.m, b.cornF.m, b.cornS.m);
      if (v.antenna) b.antenna = this._spr(this.antennaTex, .5, 1);
      if (T.rnd() < .7) b.trees.push({ tex: T.pick(this.treeTexes), sc: T.rnd(.8, 1.3), dz: T.rnd(-3, 3), sp: this._spr(T.pick(this.treeTexes).texture) });
      if (T.rnd() < .5) b.bushes.push({ tex: T.pick(this.bushTexes), dz: T.rnd(-4, 4), sp: this._spr(T.pick(this.bushTexes).texture) });
      for (const t of b.trees) t.sp.texture = t.tex.texture;
      for (const s of b.bushes) s.sp.texture = s.tex.texture;
      this._scaled(b);
      this.buildings.push(b);
    }
    // --- լապտերներ. պրոտոյի random դասավորություն (մեկ կողմ/slot, ~15% դատարկ) ---
    this.lampTex = T.makeLampTex();
    this.lamps = [];
    for (let i = 0; i < LAMP_N; i++) {
      let v = T.rnd() < .15 ? 0 : (T.rnd() < .5 ? -1 : 1);
      if (i > 1 && v !== 0 && this.lamps[i - 1]?.side === v && this.lamps[i - 2]?.side === v) v = -v;
      const l = { i, side: v, z: SPAWN_Z - i * P.lampStep, sp: v ? this._spr(this.lampTex.texture, this.lampTex.poleX, 1) : null };
      this.lamps.push(l);
    }
    // --- մեքենաներ. կայանած լապտերների արանքում (պրոտո), tint-ով գունավորում ---
    this.carRear = T.makeCarTex(true); this.carFront = T.makeCarTex(false);
    this.cars = [];
    const n = P.cars, stride = LAMP_N / n, base = T.rnd() * stride;
    for (let i = 0; i < n; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const slot = Math.floor(base + i * stride) % LAMP_N;
      const c = { side, dir: side, z: SPAWN_Z - (slot + .5) * P.lampStep + T.rnd(-1.5, 1.5), sp: this._spr((side === -1 ? this.carRear : this.carFront).texture) };
      c.sp.tint = hexN(T.COL.cars[i % T.COL.cars.length]);
      this.cars.push(c);
    }
    // --- billboard placeholder-ներ ---
    this.bbTexes = [T.makeBillboardTex("RUN", "DADY", "#00f0ff", "#ffd84d"), T.makeBillboardTex("CLUB", "96", "#ff2bd6", "#7cff4d"), T.makeBillboardTex("ESCORT", "GAMING", "#ffd84d", "#00f0ff")];
    // --- հյուրանոց (պրոտո. (-19,0,-45), առաջին ռաունդում տեսանելի, հետո rewind-ի անտեսանելի խարիսխ) ---
    this.hotelTex = T.makeHotelTex();
    this.hotel = { x: -19, z: -45, visible: true, gone: false, sp: this._spr(this.hotelTex.texture) };
    // --- աստղեր. 3D կետեր, հոսում են 1.6× ---
    const dot = T.makeDotTex();
    this.starN = P.fogFar > 150 ? 400 : 140;
    this.starPos = new Float32Array(this.starN * 3);
    this.starSp = [];
    for (let i = 0; i < this.starN; i++) {
      this.starPos.set([(Math.random() - .5) * 420, 38 + Math.random() * 90, -Math.random() * 320 + 20], i * 3);
      const s = new PIXI.Sprite(dot); s.anchor.set(.5); s.alpha = .85; this.stars.addChild(s); this.starSp.push(s);
    }
    // --- ստվեր (կերպարների համար) ---
    this.shadowTex = T.makeShadowTex();
    this.relight("starBright");                 // մնացած texture-ները հենց նոր ընթացիկ P-ով են նկարվել
  }

  /* ---- Լույս (T-0008, 💡 պանել). Գունապնակը արդեն applyLight()-ով փոխված ա (tex.js), էստեղ texture-ների regen-ն ա։
   * key = փոխված պարամետրը կամ "*" — միայն կախված texture-ներն են վերանկարվում։ Հին texture-ները destroy՝ GPU-ն չլցվի։ */
  relight(key = "*") {
    const all = key === "*";
    if (all || key === "starBright") { const a = Math.min(1, .85 * P.starBright); for (const s of this.starSp) s.alpha = a; }
    if (all || key === "lampHalo") {
      const old = this.lampTex; this.lampTex = T.makeLampTex();
      for (const l of this.lamps) if (l.sp) { l.sp.texture = this.lampTex.texture; l.sp.anchor.x = this.lampTex.poleX; }
      if (old && old !== this.lampTex) old.texture.destroy(true);
    }
    if (all || key === "bbNeon") {
      const old = this.bbTexes;
      this.bbTexes = [T.makeBillboardTex("RUN", "DADY", "#00f0ff", "#ffd84d"), T.makeBillboardTex("CLUB", "96", "#ff2bd6", "#7cff4d"), T.makeBillboardTex("ESCORT", "GAMING", "#ffd84d", "#00f0ff")];
      for (const b of this.billboards) { const i = old.indexOf(b.tex); b.tex = this.bbTexes[i < 0 ? 0 : i]; b.sp.texture = b.tex.texture; }
      if (old) for (const t of old) t.texture.destroy(true);
    }
    if (all || key === "skyDark" || key === "fogHue") {
      // գետնի texture-ը (գույները baked են) + պարապետի cap-ը (T-0009)
      this._regenGround();
      const oc = this.cornTex; this.cornTex = makeCornTex();
      for (const b of this.buildings) { b.cornF.m.texture = this.cornTex; b.cornS.m.texture = this.cornTex; }
      if (oc) oc.destroy(true);
    }
    if (all || key === "winPct" || key === "skyDark" || key === "fogHue" || key === "depthFx") {
      // ֆասադներ. նույն seed → նույն երկրաչափություն ու պատուհանների դասավորություն, միայն գույներն են նոր։
      // depthFx-ը էստեղ ա, որովհետև պարապետի ստվերը ֆասադի canvas-ում baked ա։
      // flat A/B build-ում վարիանտը regen չունի (կողը baked ա) — բաց ենք թողնում, կաշխատի reload-ով
      const olds = [];
      for (const v of this.variants) if (v.regen) olds.push(...v.regen());
      if (olds.length) {
        for (const b of this.buildings) this._applyBuildingTex(b);
        for (const t of olds) if (t) t.destroy(true);
      }
      // roofTex-ը գիտակցաբար չենք regen անում. flat build-ում sideQ-ի dummy texture-ն էլ ա, ու տանիքը միայն rewind-ի կամարում ա երևում
    }
  }

  /* ---- հոսք ---- */
  flow(dz, dt) {
    const bl = P.count * P.seg, ll = LAMP_N * P.lampStep;
    for (const b of this.buildings) { b.z -= dz; if (b.z < SPAWN_Z - bl) b.z += bl; }
    for (const l of this.lamps) { l.z -= dz; if (l.z < SPAWN_Z - ll) l.z += ll; }
    for (const c of this.cars) {
      c.z -= dz - c.dir * P.carSpd * dt;
      if (c.z < SPAWN_Z - ll) c.z += ll; if (c.z > SPAWN_Z) c.z -= ll;
    }
    for (let i = 0; i < this.starN; i++) { this.starPos[i * 3 + 2] -= dz * 1.6; if (this.starPos[i * 3 + 2] < -300) this.starPos[i * 3 + 2] += 320; }
    this.roadPhase -= dz;
    this.bbTimer += dt;
    if (this.bbTimer >= P.bbEvery) { this.bbTimer = 0; this.spawnBillboard(); }
    const gone = -(P.fogFar + 40);
    for (let i = this.billboards.length - 1; i >= 0; i--) {
      const b = this.billboards[i]; b.z -= dz;
      if (b.z < gone) { this.objs.removeChild(b.sp); b.sp.destroy(); this.billboards.splice(i, 1); }
    }
    if (this.hotel.visible) { this.hotel.z -= dz; if (this.hotel.z < gone) { this.hotel.visible = false; this.hotel.gone = true; } }
  }
  rewind(swDz) {
    const bl = P.count * P.seg, ll = LAMP_N * P.lampStep;
    for (const b of this.buildings) { b.z += swDz; if (b.z > SPAWN_Z) b.z -= bl; }
    for (const l of this.lamps) { l.z += swDz; if (l.z > SPAWN_Z) l.z -= ll; }
    for (const c of this.cars) { c.z += swDz; if (c.z > SPAWN_Z) c.z -= ll; }
    for (let i = 0; i < this.starN; i++) { this.starPos[i * 3 + 2] += swDz * 1.6; if (this.starPos[i * 3 + 2] > 20) this.starPos[i * 3 + 2] -= 320; }
    this.roadPhase += swDz;
    for (let i = this.billboards.length - 1; i >= 0; i--) {
      const b = this.billboards[i]; b.z += swDz;
      if (b.z > this.cam.z + 30) { this.objs.removeChild(b.sp); b.sp.destroy(); this.billboards.splice(i, 1); }
    }
  }
  spawnBillboard() {
    const side = T.rnd() < .5 ? -1 : 1, t = T.pick(this.bbTexes);
    const b = { side, z: SPAWN_Z + 8, tex: t, sp: this._spr(t.texture) };
    this.billboards.push(b);
  }
  clearBillboards() { for (const b of this.billboards) { this.objs.removeChild(b.sp); b.sp.destroy(); } this.billboards.length = 0; this.bbTimer = 0; }
  idleCars(dt) { if (P.carSpd > 0) for (const c of this.cars) { const ll = LAMP_N * P.lampStep; c.z += c.dir * P.carSpd * dt; if (c.z > SPAWN_Z) c.z -= ll; if (c.z < SPAWN_Z - ll) c.z += ll; } }

  /* ---- Asset Lab (DEV գործիք, Stake build-ի մաս ՉԻ — feellab.js-ից ա կանչվում) ----
   * Ամեն ինչ շենք-ՕԲՅԵԿՏԻ վրա ա (buildings[i]). sprite-երը z-flow-ով րեցիրկուլացվում են, էկրանային դիրքը անցողիկ ա։
   * Highlight-ը tint ա (0 filter, 0 լրացուցիչ draw)։ */
  static SEL_TINT = 0xffd27a;
  _applyBuildingTex(b) {
    const v = b.v, sel = b === this.selected, tint = sel ? World.SEL_TINT : 0xffffff;
    b.front.texture = b.tex.front || v.front;
    const st = b.tex.side || v.side;              // flat A/B build-ում v.side null ա — texture-ը չենք դիպչում
    if (st) b.sideQ.m.texture = st;
    b.front.tint = tint; b.sideQ.m.tint = tint;
    if (v.antenna && !b.antenna) b.antenna = this._spr(this.antennaTex, .5, 1);
    if (b.antenna) b.antenna.visible = false;    // render()-ը v.antenna-ով ա որոշում
  }
  selectBuilding(b) {
    const prev = this.selected;
    this.selected = b || null;
    if (prev) this._applyBuildingTex(prev);
    if (b) this._applyBuildingTex(b);
  }
  /* հաջորդ վարիանտը (10-ի մեջ ցիկլով). drop-ած override-ները մնում են՝ ասեթը հարկավոր ա տարբեր չափերի վրա տեսնել */
  cycleVariant(b, step = 1) {
    const n = this.variants.length;
    b.vi = ((b.vi + step) % n + n) % n; b.v = this.variants[b.vi];
    this._scaled(b);
    this._applyBuildingTex(b);
    return b.vi;
  }
  /* ---- շենքի scale (T-0008). Կպած ա շենք-օբյեկտին (b.sc) → flow/rewind-ից ողջ ա մնում։
   * b.sv = վարիանտի չափերը × sc. render()-ը միայն sv-ն ա կարդում (v.w/v.h/v.d տողերը նույնն են մնում) */
  static SC_MIN = 0.6; static SC_MAX = 1.8;
  _scaled(b) {
    const v = b.v, s = b.sc;
    b.sv = { w: v.w * s, h: v.h * s, d: v.d * s, antenna: v.antenna,
             wFlat: v.wFlat ? v.wFlat * s : undefined, hFlat: v.hFlat ? v.hFlat * s : undefined }; // wFlat/hFlat = flat A/B build
  }
  setBuildingScale(b, sc) {
    b.sc = Math.max(World.SC_MIN, Math.min(World.SC_MAX, +sc || 1));
    this._scaled(b);
    return b.sc;
  }
  resetScales() { for (const b of this.buildings) if (b.sc !== 1) { b.sc = 1; this._scaled(b); } }
  /* Copy JSON-ի համար. միայն ոչ-default scale-երը, "L3"/"R7" բանալիներով */
  scales() { const o = {}; for (const b of this.buildings) if (b.sc !== 1) o[(b.side < 0 ? "L" : "R") + b.i] = +b.sc.toFixed(2); return o; }
  /* face = "front" | "side". texture = PIXI.Texture կամ null (վերադարձ canvas-ին)։ Հինը destroy՝ GPU-ն չլցվի */
  setBuildingTex(b, face, texture) {
    const old = b.tex[face];
    b.tex[face] = texture || null;
    this._applyBuildingTex(b);
    if (old && old !== texture) old.destroy(true);
  }
  resetBuildingTex(b) { this.setBuildingTex(b, "front", null); this.setBuildingTex(b, "side", null); }
  /* էկրանի կետ (objs-ի local, roll-ը հաշված) → ամենամոտ շենքը, որի front sprite-ը կամ side երեսը ծածկում ա կետը */
  pickBuilding(px, py) {
    let best = null, bestZ = -Infinity;
    for (const b of this.buildings) {
      const f = b.front; let hit = false, zi = -Infinity;
      if (f.visible) {
        const hw = Math.abs(f.width) / 2;
        if (px >= f.x - hw && px <= f.x + hw && py >= f.y - f.height && py <= f.y) { hit = true; zi = f.zIndex; }
      }
      if (b.sideQ.contains(px, py)) { hit = true; zi = Math.max(zi, b.sideQ.m.zIndex); }
      if (hit && zi > bestZ) { bestZ = zi; best = b; }
    }
    return best;
  }

  /* ---- ռենդեր ---- */
  /* ուղղահայաց պատ x=xi հարթությունում, z∈[zNear,zFar], y∈[0,h]. near-clip ամեն տողին առանձին */
  _wallQuad(q, xi, h, zNear, zFar, nearOnRight, y0 = 0) {   // y0 = ներքևի եզրը (պարապետի շերտի համար ≠ 0)
    const cam = this.cam, DMIN = 0.35, p = this.pq;
    const fb = cam.project(xi, y0, zFar, p[0]), ft = cam.project(xi, h, zFar, p[1]);
    if (fb.d <= DMIN || ft.d <= DMIN || fb.d > P.fogFar + 10) { q.m.visible = false; return; }
    let nb = cam.project(xi, y0, zNear, p[2]), nt = cam.project(xi, h, zNear, p[3]);
    if (nb.d <= DMIN) nb = cam.project(xi, y0, zNear + (zFar - zNear) * ((DMIN - nb.d) / (fb.d - nb.d)), p[2]);
    if (nt.d <= DMIN) nt = cam.project(xi, h, zNear + (zFar - zNear) * ((DMIN - nt.d) / (ft.d - nt.d)), p[3]);
    q.m.visible = true;
    if (nearOnRight) q.set(ft.sx, ft.sy, nt.sx, nt.sy, nb.sx, nb.sy, fb.sx, fb.sy);
    else q.set(nt.sx, nt.sy, ft.sx, ft.sy, fb.sx, fb.sy, nb.sx, nb.sy);
    const dm = (nb.d + fb.d) / 2;
    q.m.alpha = 1 - this.fogT(dm);
    q.m.zIndex = -dm + 0.01;
  }
  /* հորիզոնական տանիք y=h, x∈[x0,x1], z∈[zNear,zFar] */
  _roofQuad(q, x0, x1, h, zNear, zFar) {      // վերադարձնում ա հեռու եզրի խորությունը (կամ -1)
    const cam = this.cam, DMIN = 0.35, p = this.pq;
    const a = cam.project(x0, h, zFar, p[0]), b = cam.project(x1, h, zFar, p[1]), c = cam.project(x1, h, zNear, p[2]), d = cam.project(x0, h, zNear, p[3]);
    if (a.d <= DMIN || b.d <= DMIN || c.d <= DMIN || d.d <= DMIN || a.d > P.fogFar + 10) { q.m.visible = false; return -1; }
    q.m.visible = true;
    q.set(a.sx, a.sy, b.sx, b.sy, c.sx, c.sy, d.sx, d.sy);
    const dm = (a.d + c.d) / 2;
    q.m.alpha = 1 - this.fogT(dm);
    q.m.zIndex = -dm + 0.02;
    return a.d;
  }
  /* կամեռային (z = const) ուղղահայաց շերտ. x∈[x0,x1], y∈[y0,y1] — պարապետի front-ը (T-0009) */
  _faceQuad(q, x0, x1, y0, y1, z) {
    const cam = this.cam, p = this.pq;
    const a = cam.project(x0, y1, z, p[0]), b = cam.project(x1, y1, z, p[1]), c = cam.project(x1, y0, z, p[2]), d = cam.project(x0, y0, z, p[3]);
    if (a.d <= 0.35 || c.d <= 0.35 || a.d > P.fogFar + 10) { q.m.visible = false; return; }
    q.m.visible = true;
    q.set(a.sx, a.sy, b.sx, b.sy, c.sx, c.sy, d.sx, d.sy);
    q.m.alpha = 1 - this.fogT(a.d);
    q.m.zIndex = -a.d + 0.005;
  }
  fogT(d) { const near = P.fogFar * P.fogNearK; return clamp01((d - near) / (P.fogFar - near)); }

  /* sprite-ը դնում ա գետնի (x,z) կետին, wM×hM մետր, մշուշով։ Վերադարձնում ա խորությունը կամ -1 */
  place(sp, x, z, wM, hM, y = 0) {
    const p = this.cam.project(x, y, z, this.pt);
    if (p.d <= 0.3 || p.d > P.fogFar + 10) { sp.visible = false; return -1; }
    sp.visible = true;
    sp.x = p.sx; sp.y = p.sy;
    const sx = p.s * wM / sp.texture.width, sy = p.s * hM / sp.texture.height;
    sp.scale.set(Math.sign(sp.scale.x || 1) * sx, sy);
    sp.alpha = 1 - this.fogT(p.d);
    sp.zIndex = -p.d;
    return p.d;
  }

  render() {
    const cam = this.cam, W = cam.W, H = cam.H;
    // շենքեր
    const xIn = P.roadW / 2 + P.gap;
    // T-0009. հակա-«թղթե» փաթեթ (P.depthFx). կողի tint = ֆասադի նկատմամբ հաստատուն մգացում — անկյան «կոտրվածքը» դրանից ա
    const fx = P.depthFx > 0, sideTint = fx ? hexLerp(0xffffff, 0x000000, P.sideDark) : 0xffffff;
    for (const b of this.buildings) {
      const v = b.sv, cx = b.side * (xIn + v.w / 2 + b.xj), zNear = b.z + v.d / 2, zFar = b.z - v.d / 2; // sv = չափերը × scale
      const d = this.place(b.front, cx, zNear, v.w, v.h);
      // ճամփի կողմի երեսը. պատի հարթությունում (x=xi) քառանկյուն, near-plane clip՝ ամեն տողի (ներքև/վերև)
      // համար առանձին z-ով — խորությունը z-ի գծային ֆունկցիա ա, ուրեմն կտրվածքը ճիշտ ա ու pop չկա
      const xi = cx - b.side * v.w / 2;
      this._wallQuad(b.sideQ, xi, v.h, zNear, zFar, b.side > 0);
      if (b !== this.selected) b.sideQ.m.tint = sideTint;
      // տանիք. երևում ա միայն երբ կամերան շենքից բարձր ա (rewind-ի դրոն-կամար)
      if (cam.y > v.h + 0.2) this._roofQuad(b.roofQ, cx - v.w / 2, cx + v.w / 2, v.h, zNear, zFar);
      else b.roofQ.m.visible = false;
      // պարապետ. front-ը ֆասադից CORN_P առաջ ու լայն, կողինը՝ ճամփի կողմ. flat A/B build-ում (v.wFlat, կողը baked) չկա
      if (fx && d > 0 && v.wFlat === undefined) this._faceQuad(b.cornF, cx - v.w / 2 - CORN_P, cx + v.w / 2 + CORN_P, v.h - CORN_H + .1, v.h + .1, zNear + CORN_P);
      else b.cornF.m.visible = false;
      if (fx && b.sideQ.m.visible) {
        this._wallQuad(b.cornS, xi - b.side * CORN_P, v.h + .1, zNear + CORN_P, zFar - CORN_P, b.side > 0, v.h - CORN_H + .1);
        b.cornS.m.tint = sideTint; b.cornS.m.zIndex = b.sideQ.m.zIndex + 0.004;
      } else b.cornS.m.visible = false;
      // հիմքի կոնտակտային ստվեր. գետնի վրա, footprint + FOOT_M շրջագիծ, մշուշին ենթարկվող, շենքի բոլոր օբյեկտներից ՀԵՏԵՎՈՒՄ
      if (fx && P.baseShadow > 0) {
        const df = this._roofQuad(b.footQ, cx - v.w / 2 - FOOT_M, cx + v.w / 2 + FOOT_M, 0, zNear + FOOT_M, zFar - FOOT_M);
        if (df > 0) { b.footQ.m.alpha *= P.baseShadow; b.footQ.m.zIndex = -df - 0.05; }
      } else b.footQ.m.visible = false;
      if (b.antenna) { if (d > 0 && v.antenna) { const p = cam.project(cx, v.h + .35, zNear, this.pt); b.antenna.visible = true; b.antenna.x = p.sx; b.antenna.y = p.sy; const s = p.s * 3.0 / b.antenna.texture.height; b.antenna.scale.set(s); b.antenna.alpha = b.front.alpha; b.antenna.zIndex = b.front.zIndex; } else b.antenna.visible = false; }
      for (const t of b.trees) this.place(t.sp, cx - b.side * (v.w / 2 + 2.2), b.z + t.dz, t.tex.wM * t.sc, t.tex.hM * t.sc);
      for (const s of b.bushes) this.place(s.sp, cx - b.side * (v.w / 2 + 1.2), b.z + s.dz, s.tex.wM, s.tex.hM);
    }
    // լապտերներ (ձախ կողմում հայելային, թևը դեպի ճամփա)
    for (const l of this.lamps) {
      if (!l.sp) continue;
      l.sp.scale.x = l.side === -1 ? -1 : 1;
      this.place(l.sp, l.side * (P.roadW / 2 + 1.5), l.z, this.lampTex.wM, this.lampTex.hM);
    }
    // մեքենաներ. կայանած՝ մայթին, երթևեկություն՝ ճամփի գծերում
    for (const c of this.cars) {
      const x = P.carSpd > 0 ? c.side * 2.6 : c.side * (P.roadW / 2 + 1.5);
      c.sp.texture = (c.dir === -1 ? this.carRear : this.carFront).texture;
      this.place(c.sp, x, c.z, this.carRear.wM, this.carRear.hM);
    }
    for (const b of this.billboards) this.place(b.sp, b.side * (xIn + 4), b.z, b.tex.wM, b.tex.hM);
    this.hotel.sp.visible = this.hotel.visible;
    if (this.hotel.visible) this.place(this.hotel.sp, this.hotel.x, this.hotel.z, this.hotelTex.wM, this.hotelTex.hM);
    // աստղեր
    for (let i = 0; i < this.starN; i++) {
      const p = cam.project(this.starPos[i * 3], this.starPos[i * 3 + 1], this.starPos[i * 3 + 2], this.pt);
      const s = this.starSp[i];
      if (p.d <= 0.3 || p.sy > cam.horizonY()) { s.visible = false; continue; }
      s.visible = true; s.x = p.sx; s.y = p.sy;
      const px = Math.max(1.4, p.s * 0.9); s.width = px; s.height = px;
    }
    this._drawGround();
  }

  /* ---- Գետին (T-0009). Մեկ textured Mesh + մշուշի gradient sprite — per-frame poly/ալոկացիա 0։
   * T-0008-ի տարբերակը ամեն կադր Graphics.clear() + ~470 poly.fill() էր (27 բանդ × 16 strip + կարաններ + dash-եր).
   * Pixi v8-ում ամեն fill-ը instruction/path/polygon օբյեկտներ ա, հետո ամբողջ geometry-ն rebuild + GPU upload —
   * ~3000 կարճատև օբյեկտ/կադր → GC։ Հիմա. cross-section texture-ը (makeGroundTex, canvas, repeat z-ով) մեկ անգամ,
   * ամեն կադր միայն vertex-ների դիրքն ու v-ն են գրվում ֆիքսված Float32Array-ի մեջ (4 project() + lerp ամեն շարքին)։
   * Ցանցը՝ 48 շարք խորությամբ հաստատուն d-հարաբերությամբ (~1.13. մոտիկում խիտ) × 32 բջիջ լայնությամբ (−gx..+gx) +
   * երկու արտաքին սյուն ±(gx + 3·d) — էկրանի եզրից դուրս ամեն խորության համար, u clamp → գետնի գույն։
   * Ինչի՞ 32 բջիջ լայնությամբ. GPU-ն texture-ը եռանկյան մեջ affine ա interpolate անում — trapezoid բանդի անկյունագծին
   * ուղիղ գիծը (curb, dash) կոտրվում ա (PS1-ի warping)։ Բջիջը փոքրացնելով կոտրվածքը subpixel ա դառնում. ձևը 3D-ի
   * դասական quad-subdivision-ն ա, custom shader չի պահանջում։ Շարքը էկրանին ուղիղ գիծ ա (yaw≈0) → միջանկյալ
   * սյուները lerp-ով են, ոչ project()-ով։
   * Մշուշը գետնի վրա միայն էկրանի y-ի ֆունկցիա ա (makeGroundFogTex) — մեկ sprite, tint = fog։ */
  _buildGround() {
    const R = GROUND_ROWS, C = GROUND_COLS, N = GROUND_XN;
    this.gnd = makeGroundTex(P.roadW);
    this.gndT = performance.now();
    const positions = new Float32Array(R * C * 2), uvs = new Float32Array(R * C * 2), indices = new Uint32Array((R - 1) * (C - 1) * 6);
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) uvs[(r * C + c) * 2] = c === 0 ? 0 : c === C - 1 ? 1 : (c - 1) / N;   // u՝ ֆիքս, v՝ ամեն կադր
    let k = 0;
    for (let r = 0; r < R - 1; r++) for (let c = 0; c < C - 1; c++) {
      const a = r * C + c, b = a + 1, d = a + C, e = d + 1;
      indices[k++] = a; indices[k++] = b; indices[k++] = e; indices[k++] = a; indices[k++] = e; indices[k++] = d;
    }
    this.gGeo = new PIXI.MeshGeometry({ positions, uvs, indices });
    this.gMesh = new PIXI.Mesh({ geometry: this.gGeo, texture: this.gnd.texture });
    this.gFog = new PIXI.Sprite(makeGroundFogTex());
    this.ground.addChild(this.gMesh, this.gFog);
  }
  /* texture regen. 💡 (skyDark/fogHue — գույները baked են) կամ 🌆 roadW (cross-section-ը փոխվում ա, throttle-ով) */
  _regenGround() {
    const old = this.gnd;
    this.gnd = makeGroundTex(P.roadW);
    this.gMesh.texture = this.gnd.texture;
    if (old) old.texture.destroy(true);
    this.gndT = performance.now();
  }
  _drawGround() {
    const cam = this.cam, W = cam.W, H = cam.H, R = GROUND_ROWS, C = GROUND_COLS, N = GROUND_XN, p = this.pq;
    if (P.roadW !== this.gnd.roadW && performance.now() - this.gndT > 250) this._regenGround();
    const pos = this.gGeo.positions, uv = this.gGeo.uvs, gx = this.gnd.gx, GT = this.gnd.gt;
    const ph = ((this.roadPhase % GT) + GT) % GT;   // v-ն փոքր պահենք (float32-ի ճշտություն երկար վազքից հետո)
    // խորությունը z-ի գծային ֆունկցիա ա (x=0). d(z) = d0 + B·(z − cam.z)
    const d0 = cam.project(0, 0, cam.z, p[0]).d, B = (cam.project(0, 0, cam.z - 10, p[1]).d - d0) / -10;
    const zOf = (d) => cam.z + (d - d0) / B;
    const DMIN = 0.8, dFar = P.fogFar + 20;         // near clip 0.8 — yaw-ի (look.x, shake) շեղումով էլ արտաքին սյուները d>0.3 են մնում
    const ratio = Math.pow(dFar / DMIN, 1 / (R - 1)); // շարքերի խորությունը DMIN·ratioʳ — վերջինը ճիշտ dFar-ին
    let dr = DMIN;
    for (let r = 0; r < R; r++, dr *= ratio) {
      const zr = zOf(dr), v = (zr - ph) / GT, xo = gx + 3 * dr;
      const q0 = cam.project(-xo, 0, zr, p[0]), q1 = cam.project(-gx, 0, zr, p[1]), q2 = cam.project(gx, 0, zr, p[2]), q3 = cam.project(xo, 0, zr, p[3]);
      for (const q of p) if (q.s === 0) { q.sx = W / 2; q.sy = H * 4; }   // անվտանգության ցանց. d≤0.3 → էկրանից շատ ներքև
      let o = r * C * 2;
      pos[o] = q0.sx; pos[o + 1] = q0.sy; uv[o + 1] = v; o += 2;
      const dx = (q2.sx - q1.sx) / N, dy = (q2.sy - q1.sy) / N;
      for (let c = 0; c <= N; c++, o += 2) { pos[o] = q1.sx + dx * c; pos[o + 1] = q1.sy + dy * c; uv[o + 1] = v; }
      pos[o] = q3.sx; pos[o + 1] = q3.sy; uv[o + 1] = v;
    }
    this.gGeo.attributes.aPosition.buffer.update();
    this.gGeo.attributes.aUV.buffer.update();
    // մշուշի overlay. hy-ից մինչև near-ի y-ը, 3W լայն (roll-ի անկյունները ծածկի), tint = ընթացիկ fog
    const hy = cam.horizonY(), yn = cam.project(0, 0, zOf(P.fogFar * P.fogNearK), p[0]).sy;
    const f = this.gFog;
    f.x = -W; f.y = hy; f.width = 3 * W; f.height = Math.max(1, yn - hy); f.tint = hexN(T.COL.fog);
  }
}
