/* Աշխարհը — v16_14 պրոտոյի procedural քաղաքի 2.5D վերակառուցումը։
 * Կոորդինատները մետրերով են, պրոտոյի դասավորությամբ. կամերան z=14-ում, օբյեկտները ծնվում են
 * SPAWN_Z=40-ում (կամեռայի հետևում) ու հոսում են −z՝ դեպի մշուշ (Պապին կամեռայի կողմ ա վազում)։
 * Ամեն ինչ sprite/mesh ա, մշուշը՝ alpha fade դեպի fog-գույն ֆոն + ճամփի բանդերի գույնի lerp։
 */
import { P } from "./params.js";
import * as T from "./tex.js";

const SPAWN_Z = 40;
const LAMP_N = 14;
const clamp01 = (v) => v < 0 ? 0 : v > 1 ? 1 : v;

function hexLerp(a, b, t) {
  const ar = a >> 16 & 255, ag = a >> 8 & 255, ab = a & 255, br = b >> 16 & 255, bg = b >> 8 & 255, bb = b & 255;
  return (Math.round(ar + (br - ar) * t) << 16) | (Math.round(ag + (bg - ag) * t) << 8) | Math.round(ab + (bb - ab) * t);
}
const hexN = (s) => parseInt(s.slice(1), 16);

/* Պրոյեկցված քառանկյուն texture-ով. PerspectiveMesh (perspective-correct) կամ MeshSimple fallback */
class Quad {
  constructor(texture) {
    if (PIXI.PerspectiveMesh) {
      this.m = new PIXI.PerspectiveMesh({ texture, verticesX: 4, verticesY: 4, x0: 0, y0: 0, x1: 1, y1: 0, x2: 1, y2: 1, x3: 0, y3: 1 });
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
    this.ground = new PIXI.Graphics();          // գետին + ճամփա + մայթ (ամեն կադր)
    this.stars = new PIXI.Container();
    this.objs = new PIXI.Container();           // z-sorted sprite-եր/mesh-եր
    this.objs.sortableChildren = true;
    this.roadPhase = 0;                         // dash-երի հոսքի ֆազա (մ)
    this.bbTimer = 0;
    this.billboards = [];
    this.pt = {};
    this._build();
  }

  _spr(texture, ax = .5, ay = 1) { const s = new PIXI.Sprite(texture); s.anchor.set(ax, ay); this.objs.addChild(s); return s; }

  _build() {
    // --- շենքեր. 10 վարիանտ, 12/կողմ, երկու երես ---
    this.variants = []; for (let i = 0; i < 10; i++) this.variants.push(T.makeBuildingVariant());
    this.antennaTex = T.makeAntennaTex();
    this.roofTex = T.makeRoofTex();
    this.treeTexes = [T.makeTreeTex(), T.makeTreeTex(), T.makeTreeTex()];
    this.bushTexes = [T.makeBushTex(), T.makeBushTex()];
    this.buildings = [];
    this.selected = null;                       // Asset Lab. ընտրված շենքը (buildings[i] օբյեկտ, ոչ էկրանային դիրք)
    for (const side of [-1, 1]) for (let i = 0; i < P.count; i++) {
      const v = T.pick(this.variants);
      // tex = Asset Lab-ի override-ներ (drop արած նկար), null = վարիանտի canvas-ը
      const b = { side, i, v, vi: this.variants.indexOf(v), tex: { front: null, side: null }, xj: T.rnd(0, 2), z: SPAWN_Z - i * P.seg, front: this._spr(v.front), sideQ: new Quad(v.side), roofQ: new Quad(this.roofTex), antenna: null, trees: [], bushes: [] };
      this.objs.addChild(b.sideQ.m, b.roofQ.m);
      if (v.antenna) b.antenna = this._spr(this.antennaTex, .5, 1);
      if (T.rnd() < .7) b.trees.push({ tex: T.pick(this.treeTexes), sc: T.rnd(.8, 1.3), dz: T.rnd(-3, 3), sp: this._spr(T.pick(this.treeTexes).texture) });
      if (T.rnd() < .5) b.bushes.push({ tex: T.pick(this.bushTexes), dz: T.rnd(-4, 4), sp: this._spr(T.pick(this.bushTexes).texture) });
      for (const t of b.trees) t.sp.texture = t.tex.texture;
      for (const s of b.bushes) s.sp.texture = s.tex.texture;
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
    this._applyBuildingTex(b);
    return b.vi;
  }
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
  _wallQuad(q, xi, h, zNear, zFar, nearOnRight) {
    const cam = this.cam, DMIN = 0.35;
    const fb = cam.project(xi, 0, zFar, {}), ft = cam.project(xi, h, zFar, {});
    if (fb.d <= DMIN || ft.d <= DMIN || fb.d > P.fogFar + 10) { q.m.visible = false; return; }
    let nb = cam.project(xi, 0, zNear, {}), nt = cam.project(xi, h, zNear, {});
    if (nb.d <= DMIN) nb = cam.project(xi, 0, zNear + (zFar - zNear) * ((DMIN - nb.d) / (fb.d - nb.d)), {});
    if (nt.d <= DMIN) nt = cam.project(xi, h, zNear + (zFar - zNear) * ((DMIN - nt.d) / (ft.d - nt.d)), {});
    q.m.visible = true;
    if (nearOnRight) q.set(ft.sx, ft.sy, nt.sx, nt.sy, nb.sx, nb.sy, fb.sx, fb.sy);
    else q.set(nt.sx, nt.sy, ft.sx, ft.sy, fb.sx, fb.sy, nb.sx, nb.sy);
    const dm = (nb.d + fb.d) / 2;
    q.m.alpha = 1 - this.fogT(dm);
    q.m.zIndex = -dm + 0.01;
  }
  /* հորիզոնական տանիք y=h, x∈[x0,x1], z∈[zNear,zFar] */
  _roofQuad(q, x0, x1, h, zNear, zFar) {
    const cam = this.cam, DMIN = 0.35;
    const a = cam.project(x0, h, zFar, {}), b = cam.project(x1, h, zFar, {}), c = cam.project(x1, h, zNear, {}), d = cam.project(x0, h, zNear, {});
    if (a.d <= DMIN || b.d <= DMIN || c.d <= DMIN || d.d <= DMIN || a.d > P.fogFar + 10) { q.m.visible = false; return; }
    q.m.visible = true;
    q.set(a.sx, a.sy, b.sx, b.sy, c.sx, c.sy, d.sx, d.sy);
    const dm = (a.d + c.d) / 2;
    q.m.alpha = 1 - this.fogT(dm);
    q.m.zIndex = -dm + 0.02;
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
    for (const b of this.buildings) {
      const v = b.v, cx = b.side * (xIn + v.w / 2 + b.xj), zNear = b.z + v.d / 2, zFar = b.z - v.d / 2;
      const d = this.place(b.front, cx, zNear, v.w, v.h);
      // ճամփի կողմի երեսը. պատի հարթությունում (x=xi) քառանկյուն, near-plane clip՝ ամեն տողի (ներքև/վերև)
      // համար առանձին z-ով — խորությունը z-ի գծային ֆունկցիա ա, ուրեմն կտրվածքը ճիշտ ա ու pop չկա
      const xi = cx - b.side * v.w / 2;
      this._wallQuad(b.sideQ, xi, v.h, zNear, zFar, b.side > 0);
      // տանիք. երևում ա միայն երբ կամերան շենքից բարձր ա (rewind-ի դրոն-կամար)
      if (cam.y > v.h + 0.2) this._roofQuad(b.roofQ, cx - v.w / 2, cx + v.w / 2, v.h, zNear, zFar);
      else b.roofQ.m.visible = false;
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

  /* գետին + ճամփա + մայթ. խորության բանդեր, գույնը lerp դեպի մշուշ (ֆիզիկական fog-ի համարժեք) */
  _drawGround() {
    const g = this.ground, cam = this.cam, W = cam.W, H = cam.H;
    g.clear();
    const fog = hexN(T.COL.fog), asph = hexN(T.COL.asphalt), edge = hexN(T.COL.asphaltEdge), sw = hexN(T.COL.sidewalk), gnd = hexN(T.COL.ground), curb = hexN(T.COL.curb);
    const hw = P.roadW / 2, swO = hw + 3;
    // բանդերի z-սահմանները. կամեռայի հետևից (էկրանից ներքև) մինչև մշուշ, երկրաչափական քայլով
    const zs = [];
    let z = cam.z + 6, step = 0.6;
    while (z > cam.z - P.fogFar - 20) { zs.push(z); z -= step; step *= 1.18; }
    zs.push(cam.z - P.fogFar - 20);
    const pr = (x, zz) => cam.project(x, 0, zz, {});
    // հորիզոնից ներքև ամեն ինչ fog-գույն ա (գետնի հեռուն) — ֆոն
    const hy = cam.horizonY();
    g.rect(0, hy - 1, W, H - hy + 1).fill(fog);
    for (let i = 0; i < zs.length - 1; i++) {
      const zA = zs[i], zB = zs[i + 1];
      const a = pr(0, zA), b = pr(0, zB);
      if (b.d <= 0.3) continue;
      const dm = (Math.max(a.d, 0.3) + b.d) / 2, t = this.fogT(dm);
      const zAA = a.d > 0.35 ? zA : zA + (zB - zA) * ((0.35 - a.d) / (b.d - a.d)); // near clip
      const aa = pr(0, zAA);
      if (aa.sy < hy) continue;
      const sA = aa.s, sB = b.s, yA = Math.min(aa.sy, H + 40), yB = b.sy;
      const cx = W / 2;
      // գետին (ամբողջ լայնք)
      g.poly([0, yA, W, yA, W, yB, 0, yB]).fill(hexLerp(gnd, fog, t));
      // մայթեր
      for (const s of [-1, 1]) g.poly([cx + s * hw * sA, yA, cx + s * swO * sA, yA, cx + s * swO * sB, yB, cx + s * hw * sB, yB]).fill(hexLerp(sw, fog, t));
      // ասֆալտ + եզրի մուգ գոտիներ + curb
      g.poly([cx - hw * sA, yA, cx + hw * sA, yA, cx + hw * sB, yB, cx - hw * sB, yB]).fill(hexLerp(asph, fog, t));
      for (const s of [-1, 1]) {
        g.poly([cx + s * hw * sA, yA, cx + s * hw * .82 * sA, yA, cx + s * hw * .82 * sB, yB, cx + s * hw * sB, yB]).fill({ color: hexLerp(edge, fog, t), alpha: .55 });
        g.poly([cx + s * hw * sA, yA, cx + s * (hw + .18) * sA, yA, cx + s * (hw + .18) * sB, yB, cx + s * hw * sB, yB]).fill(hexLerp(curb, fog, t));
      }
    }
    // գծանշում. կենտրոնի dash (24×700 @512×2048 → 0.47մ × 2.73մ, քայլ 8մ) + երկու թույլ գոտու գիծ ±2.6մ
    const lane = hexN(T.COL.lane);
    const cx = W / 2;
    const phase = ((this.roadPhase % 8) + 8) % 8;
    for (let k = -1; k < P.fogFar / 8 + 2; k++) {
      const z0 = cam.z + phase - k * 8 + 4, z1 = z0 - 2.73; // z0 = մոտ ծայր
      const a = pr(0, z0), b = pr(0, z1);
      if (b.d <= 0.3) continue;
      const zA = a.d > 0.35 ? z0 : z0 + (z1 - z0) * ((0.35 - a.d) / (b.d - a.d));
      const aa = pr(0, zA);
      const t = this.fogT((aa.d + b.d) / 2);
      const wA = .235 * aa.s, wB = .235 * b.s;
      g.poly([cx - wA, Math.min(aa.sy, H + 40), cx + wA, Math.min(aa.sy, H + 40), cx + wB, b.sy, cx - wB, b.sy]).fill({ color: hexLerp(lane, fog, t), alpha: 1 - t * .5 });
    }
    for (const s of [-1, 1]) {
      const zn = cam.z + 1.2, zf = cam.z - P.fogFar;
      const a = pr(s * 2.6, zn), b = pr(s * 2.6, zf);
      if (a.d > 0.3 && b.d > 0.3) g.poly([a.sx - .06 * a.s, Math.min(a.sy, H + 40), a.sx + .06 * a.s, Math.min(a.sy, H + 40), b.sx + .5, b.sy, b.sx - .5, b.sy]).fill({ color: 0xffffff, alpha: .12 });
    }
  }
}
