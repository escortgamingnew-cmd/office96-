/* Canvas-ով նկարած texture-ներ — ոչ մի արտաքին asset (բացի papi spritesheet-ից),
 * ոչ մի runtime filter։ Ամեն glow baked ա։ Գունապնակը v16_14 պրոտոյի ռենդերից ա
 * (գունատ low-poly քաղաք, կապույտ գիշեր, բաց մշուշ)։
 */
import { P, IS_MOBILE } from "./params.js";

/* v16_14 պրոտոյի գունապնակը — ԱՆՓՈՓՈԽ ռեֆերենս։ COL-ը սրանից ա հաշվվում applyLight()-ով (P.skyDark/fogHue) */
export const COL_PROTO = Object.freeze({
  skyTop: "#16418f", skyMid: "#2a68b8", skyHor: "#6d97d3",
  fog: "#b6bfda",                        // հորիզոնի/մշուշի գույնը (ամեն ինչ սրան ա հալվում)
  asphalt: "#8e93b6", asphaltEdge: "#7d82a3", lane: "#dcdde8",
  sidewalk: "#dedde8", curb: "#b3b2c6", ground: "#d4d4e1",
  walls: ["#d9d6e3", "#cfc9dc", "#e3e0ea", "#d5cfe1", "#e0d7d9"],
  winLit: ["#f4c7dd", "#c7bff2", "#bfe9d9", "#f7e5a8", "#bcd6f5"],
  winDark: "#7f7c9c",
  awnings: ["#f3b6cf", "#a9c4f0", "#f1ede0", "#f5d48a"],
  roofCap: "#bbb8cc", base: "#c4c2d4",
  lampPole: "#8f91aa", lampHead: "#ffd27a",
  trunk: "#8a5a3a", crowns: ["#8fd05a", "#7cc24a", "#a0dc66"],
  cars: ["#e0475a", "#ff6bc7", "#5ad0e8", "#f0d060"],
});
/* Խորը գիշերի թիրախները (skyDark=1)։ Նույն քաղաքն ա, նույն pastel-ը — ուղղակի ավելի ուշ ժամ */
const COL_NIGHT = {
  skyTop: "#050f2e", skyMid: "#0f2c66", skyHor: "#35538f", fog: "#5c6890",
  asphalt: "#4f5476", asphaltEdge: "#41455f", lane: "#b9bacb",
  sidewalk: "#9a99b0", curb: "#7a7a92", ground: "#8d8ea6",
  wallK: 0.42,                           // ֆասադները մթնում են սրա չափով (պատուհանները չեն — կոնտրաստը դրանից ա)
  winDark: "#3f3c5c", roofCap: "#77768c", base: "#7f7e94",
};
export const COL = { ...COL_PROTO, walls: [...COL_PROTO.walls] };

const _hx = (s) => [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16)];
const _str = (r, g, b) => "#" + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
const _mix = (a, b, t) => { const A = _hx(a), B = _hx(b); return _str(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t); };
const _shade = (a, k) => { const A = _hx(a); return _str(A[0] * (1 - k), A[1] * (1 - k), A[2] * (1 - k)); };
/* մշուշի երանգ. h<0 սառը (կապույտ), h>0 տաք (մանուշակ-վարդագույն) — ալիքային ձևափոխում */
const _hue = (a, h) => { const A = _hx(a), k = Math.abs(h); return h < 0 ? _str(A[0] * (1 - .22 * k), A[1] * (1 - .06 * k), A[2] * (1 + .10 * k)) : _str(A[0] * (1 + .14 * k), A[1] * (1 - .14 * k), A[2] * (1 + .02 * k)); };

/* Գունապնակը P-ից. skyDark 0 = պրոտոն 1:1, 1 = COL_NIGHT։ Կանչվում ա boot-ին ու 💡 պանելից (հետո՝ regen) */
export function applyLight() {
  const d = Math.max(0, Math.min(1, P.skyDark)), h = Math.max(-1, Math.min(1, P.fogHue));
  for (const k of ["skyTop", "skyMid", "skyHor", "fog", "asphalt", "asphaltEdge", "lane", "sidewalk", "curb", "ground", "winDark", "roofCap", "base"])
    COL[k] = _mix(COL_PROTO[k], COL_NIGHT[k], d);
  for (const k of ["skyHor", "fog", "ground", "sidewalk", "asphalt"]) COL[k] = _hue(COL[k], h * (k === "fog" || k === "skyHor" ? 1 : .5));
  for (let i = 0; i < COL_PROTO.walls.length; i++) COL.walls[i] = _shade(COL_PROTO.walls[i], COL_NIGHT.wallK * d);
  return COL;
}
applyLight();

let _seed = 12345;
export function rnd(a = 0, b = 1) { // deterministic — նույն քաղաքը ամեն reload-ին
  _seed |= 0; _seed = (_seed + 0x6d2b79f5) | 0;
  let t = Math.imul(_seed ^ (_seed >>> 15), 1 | _seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return a + (((t ^ (t >>> 14)) >>> 0) / 4294967296) * (b - a);
}
export const pick = (arr) => arr[Math.floor(rnd() * arr.length)];

function cv(w, h) {
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h));
  return [c, c.getContext("2d")];
}
const tex = (c) => PIXI.Texture.from(c);

/* Երկինք. ուղղահայաց գրադիենտ + աստղերը առանձին են (3D կետեր, հոսում են) */
export function makeSkyTex() {
  const [c, x] = cv(4, 512);
  const g = x.createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0, COL.skyTop); g.addColorStop(0.45, COL.skyMid);
  g.addColorStop(0.86, COL.skyHor); g.addColorStop(1, COL.fog);
  x.fillStyle = g; x.fillRect(0, 0, 4, 512);
  return tex(c);
}
export function makeDotTex() {
  const [c, x] = cv(16, 16);
  const g = x.createRadialGradient(8, 8, 0, 8, 8, 8);
  g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(.4, "rgba(255,255,255,.9)"); g.addColorStop(1, "rgba(255,255,255,0)");
  x.fillStyle = g; x.fillRect(0, 0, 16, 16);
  return tex(c);
}

/* Ֆասադ. պրոտոյի lowPolyBuilding/addWindows ոգով — պատուհանների ցանց 2.6մ հարկ / 2.2մ սյուն,
 * winPct-ը վառ, pastel գույներ, տանիքի cap, հիմք, ճամփի կողմի երեսին դուռ + երբեմն awning։
 * PX = պիքսել/մետր։ Վերադարձնում ա canvas (texture-ը արվում ա դրսում)։ */
const PX = 22;
export function facadeCanvas(wM, hM, wall, winPct, opts = {}) {
  const w = wM * PX, h = hM * PX;
  const [c, x] = cv(w, h);
  x.fillStyle = wall; x.fillRect(0, 0, w, h);
  // աղյուսի թեթև ցանց (GLB-ի brick զգացողությունը)
  x.strokeStyle = "rgba(60,50,90,.07)"; x.lineWidth = 1;
  const bh = 0.9 * PX, bw = 1.8 * PX;
  for (let yy = 0, r = 0; yy < h; yy += bh, r++) {
    x.beginPath(); x.moveTo(0, yy + .5); x.lineTo(w, yy + .5); x.stroke();
    for (let xx = (r % 2) * bw / 2; xx < w; xx += bw) { x.beginPath(); x.moveTo(xx + .5, yy); x.lineTo(xx + .5, yy + bh); x.stroke(); }
  }
  // պատուհաններ
  const floorH = 2.6, rows = Math.max(1, Math.floor((hM - 1.2) / floorH)), rowStep = (hM - 1.0) / rows;
  const cols = Math.max(1, Math.floor(wM / 2.2)), step = wM / cols;
  const ww = step * .42, wh = rowStep * .5;
  for (let r = 0; r < rows; r++) for (let q = 0; q < cols; q++) {
    const cx = step * (q + .5), cy = hM - (1.0 + rowStep * (r + .5) + 0.3); // y-ը ներքևից (հիմքը 0.3 բարձր)
    const lit = rnd() < winPct;
    const X = (cx - ww / 2) * PX, Y = (cy - wh / 2) * PX, WW = ww * PX, WH = wh * PX;
    x.fillStyle = "rgba(70,62,96,.35)"; x.fillRect(X - 3, Y - 3, WW + 6, WH + 6); // շրջանակ
    if (lit) {
      const col = pick(COL.winLit);
      // գիշերը վառ պատուհանը ավելի ա «ճառագայթում» (կոնտրաստը ֆասադի մթնելուց + glow-ից ա)
      x.shadowColor = col; x.shadowBlur = 5 + 7 * P.skyDark; x.fillStyle = col; x.fillRect(X, Y, WW, WH); x.shadowBlur = 0;
    } else { x.fillStyle = COL.winDark; x.fillRect(X, Y, WW, WH); }
    x.fillStyle = "rgba(0,0,0,.12)"; x.fillRect(X, Y, WW, WH * .12); // sill ստվեր
  }
  // տանիքի cap + հիմք
  x.fillStyle = COL.roofCap; x.fillRect(0, 0, w, .35 * PX);
  x.fillStyle = "rgba(0,0,0,.08)"; x.fillRect(0, .35 * PX, w, 3);
  if (P.depthFx > 0) {                          // T-0009. պարապետի ստվերը ֆասադի վրա (baked). cap-ը 0.22մ առաջ ա, տակը մթնում ա
    const g = x.createLinearGradient(0, .35 * PX, 0, .95 * PX);
    g.addColorStop(0, "rgba(0,0,0,.30)"); g.addColorStop(1, "rgba(0,0,0,0)");
    x.fillStyle = g; x.fillRect(0, .35 * PX, w, .6 * PX);
  }
  x.fillStyle = COL.base; x.fillRect(0, h - .3 * PX, w, .3 * PX);
  if (opts.door) {
    const dw = 1.2 * PX, dh = 2.0 * PX, dx = w / 2 - dw / 2, dy = h - .3 * PX - dh;
    x.shadowColor = "#f7e5a8"; x.shadowBlur = 10; x.fillStyle = "#f7e5a8"; x.fillRect(dx, dy, dw, dh); x.shadowBlur = 0;
    x.fillStyle = "rgba(0,0,0,.2)"; x.fillRect(dx + dw * .45, dy + dh * .5, 3, 3);
    if (opts.awning) {
      x.fillStyle = opts.awning; x.fillRect(w / 2 - 1.2 * PX, dy - .5 * PX, 2.4 * PX, .3 * PX);
      x.fillStyle = "rgba(0,0,0,.15)"; x.fillRect(w / 2 - 1.2 * PX, dy - .2 * PX, 2.4 * PX, .12 * PX);
    }
  }
  if (opts.antenna) { // բարձրերի վրա. ալեհավաք + վարդագույն ծայր (պրոտո. h>12)
    x.fillStyle = "#7a7a9a"; x.fillRect(w * .5 - 1, -0, 3, 2); // cap-ի վրա տեղ չկա — նկարվում ա առանձին sprite-ով
  }
  return c;
}

/* Շենքի արխետիպ (պրոտո SHAPES. tower/block), երկու երես. front (կամեռային, w×h) + side (ճամփային, d×h) */
export function makeBuildingVariant() {
  // պրոտոյի ռենդերում շենքերը GLB-ից ֆիքս ~12մ բարձրության էին (cloneSlot(sl, 12)), լայնությունը՝ տարբեր.
  // tower/block արխետիպները պահված են, բարձրության ցրվածքը՝ նեղացրած էդ տեսքին
  // Seed-ը պահվում ա. regen()-ը (💡 պանել՝ winPct/skyDark) նույն երկրաչափությունն ու պատուհանների նույն
  // դասավորությունն ա տալիս, միայն գույներն են նոր։ Վերադարձնում ա հին texture-ները՝ destroy-ի համար։
  const seed = _seed, v = { seed, front: null, side: null };
  const gen = () => {
    const tower = rnd() < .5;
    const h = tower ? rnd(10.5, 13) : rnd(8, 10.5);
    const d = tower ? rnd(5, 7) : rnd(8, 12);
    const w = tower ? rnd(5, 8) : rnd(9, 14);
    const wall = pick(COL.walls);
    const old = [v.front, v.side];
    v.w = w; v.h = h; v.d = d; v.antenna = h > 12;
    v.front = tex(facadeCanvas(w, h, wall, P.winPct, {}));
    v.side = tex(facadeCanvas(d, h, wall, P.winPct, { door: true, awning: rnd() < .4 ? pick(COL.awnings) : null }));
    return old;
  };
  gen();
  v.regen = () => { const save = _seed; _seed = seed; const old = gen(); _seed = save; return old; };
  return v;
}

export function makeRoofTex() {
  const [c, x] = cv(64, 64);
  x.fillStyle = COL.roofCap; x.fillRect(0, 0, 64, 64);
  x.strokeStyle = "rgba(60,50,90,.18)"; x.lineWidth = 4; x.strokeRect(2, 2, 60, 60);
  x.fillStyle = "rgba(255,255,255,.12)"; x.fillRect(14, 14, 36, 36);
  return tex(c);
}

export function makeAntennaTex() {
  const [c, x] = cv(24, 96);
  x.fillStyle = "#7a7a9a"; x.fillRect(10, 14, 4, 82);
  x.shadowColor = "#ff4fe0"; x.shadowBlur = 8; x.fillStyle = "#ff4fe0";
  x.beginPath(); x.arc(12, 10, 5, 0, 7); x.fill();
  return tex(c);
}

/* Լապտեր. սյուն 5մ, թև 1.2մ դեպի ճամփա, գլուխ + baked halo (2.6մ × P.lampHalo)։
 * Canvas-ը 4.4×6.6մ ա, որ halo-ն 2.5×-ի վրա էլ տեղավորվի. սյունը նույն տեղում ա (poleX anchor) */
export function makeLampTex() {
  const S = 20, W = 4.4 * S, H = 6.6 * S, halo = Math.max(0, P.lampHalo);
  const [c, x] = cv(W, H);
  const px = 3.3 * S, hy = (6.6 - 4.9) * S;   // սյունը աջ մասում, թևը ձախ (ճամփայի կողմ)
  if (halo > 0) {
    const r = 1.3 * S * (0.6 + 0.4 * halo), a0 = Math.min(1, .9 * halo), a1 = Math.min(.85, .45 * halo);
    const g = x.createRadialGradient(px - 1.0 * S, hy, 2, px - 1.0 * S, hy, r);
    g.addColorStop(0, `rgba(255,210,122,${a0})`); g.addColorStop(.35, `rgba(255,210,122,${a1})`); g.addColorStop(1, "rgba(255,210,122,0)");
    x.fillStyle = g; x.beginPath(); x.arc(px - 1.0 * S, hy, r, 0, 7); x.fill();
  }
  x.fillStyle = COL.lampPole;
  x.fillRect(px - .09 * S, H - 5 * S, .18 * S, 5 * S);           // սյուն
  x.fillRect(px - 1.1 * S, H - 5 * S, 1.2 * S, .09 * S);        // թև
  x.fillStyle = COL.lampHead; x.fillRect(px - 1.5 * S, hy - .08 * S, 1.0 * S, .16 * S); // գլուխ
  return { texture: tex(c), wM: 4.4, hM: 6.6, poleX: 3.3 / 4.4 }; // poleX = anchor x
}

/* Ծառ. բուն + low-poly սաղարթ (icosahedron-ի silhouette՝ բազմանկյուն) */
export function makeTreeTex() {
  const S = 24, W = 3.2 * S, H = 4.2 * S;
  const [c, x] = cv(W, H);
  x.fillStyle = COL.trunk; x.fillRect(W / 2 - .17 * S, H - 1.9 * S, .34 * S, 1.9 * S);
  const crown = pick(COL.crowns), cx = W / 2, cy = (4.2 - 2.7) * S, r = 1.3 * S;
  x.fillStyle = crown; x.beginPath();
  for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + i * Math.PI * 2 / 7, rr = r * (0.88 + rnd() * .2); x.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); }
  x.closePath(); x.fill();
  x.fillStyle = "rgba(0,0,0,.14)"; x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + r, cy + r * .2); x.lineTo(cx + r * .3, cy + r); x.closePath(); x.fill(); // մեկ մութ երես (flat shading)
  x.fillStyle = "rgba(255,255,255,.14)"; x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx - r * .9, cy - r * .3); x.lineTo(cx - r * .2, cy - r); x.closePath(); x.fill();
  return { texture: tex(c), wM: 3.2, hM: 4.2 };
}
export function makeBushTex() {
  const S = 24, W = 1.4 * S, H = 1.1 * S;
  const [c, x] = cv(W, H);
  x.fillStyle = pick(COL.crowns); x.beginPath();
  for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + i * Math.PI / 3; x.lineTo(W / 2 + Math.cos(a) * .55 * S, .55 * S + Math.sin(a) * .5 * S); }
  x.closePath(); x.fill();
  x.fillStyle = "rgba(0,0,0,.14)"; x.fillRect(W / 2, .55 * S, .5 * S, .5 * S);
  return { texture: tex(c), wM: 1.4, hM: 1.1 };
}

/* Մեքենա — placeholder՝ հետևից/դիմացից տեսք (ուղիղ ռակուրս), 1.8×1.6մ front, 4.2մ երկար։
 * Իրական render-ը car-default.glb-ից Blender-ով ա գալու (ռակուրսների strip)։ Tint-ով գունավորվում ա։ */
export function makeCarTex(rear) {
  const S = 48, W = 2.0 * S, H = 1.6 * S;
  const [c, x] = cv(W, H);
  const cxp = W / 2;
  // անիվներ (թափքի տակից երևում են)
  x.fillStyle = "#15151d";
  x.beginPath(); x.roundRect(.12 * S, H - .5 * S, .42 * S, .5 * S, 3); x.fill();
  x.beginPath(); x.roundRect(W - .54 * S, H - .5 * S, .42 * S, .5 * S, 3); x.fill();
  // թափք (սպիտակ՝ tint-ի համար). ներքևի մասը՝ լայն, խցիկը՝ նեղացող trapezoid
  x.fillStyle = "#ffffff";
  x.beginPath(); x.roundRect(.1 * S, H - 1.0 * S, 1.8 * S, .78 * S, 6); x.fill();
  x.beginPath(); x.moveTo(.32 * S, H - .95 * S); x.lineTo(.5 * S, H - 1.5 * S); x.lineTo(W - .5 * S, H - 1.5 * S); x.lineTo(W - .32 * S, H - .95 * S); x.closePath(); x.fill();
  // ապակի (հետևի/դիմացի), մուգ կապույտ, թեթև արտացոլում
  x.fillStyle = "#22304d";
  x.beginPath(); x.moveTo(.45 * S, H - 1.0 * S); x.lineTo(.58 * S, H - 1.42 * S); x.lineTo(W - .58 * S, H - 1.42 * S); x.lineTo(W - .45 * S, H - 1.0 * S); x.closePath(); x.fill();
  x.fillStyle = "rgba(255,255,255,.18)"; x.fillRect(.62 * S, H - 1.38 * S, .3 * S, .3 * S);
  // բամպեր + համարանիշ
  x.fillStyle = "rgba(0,0,0,.22)"; x.fillRect(.1 * S, H - .36 * S, 1.8 * S, .14 * S);
  x.fillStyle = "#e9e9f0"; x.fillRect(cxp - .22 * S, H - .62 * S, .44 * S, .16 * S);
  // լույսեր. հետևից կարմիր, դիմացից տաք սպիտակ (baked glow)
  const lc = rear ? "#ff3040" : "#fff2c8";
  x.shadowColor = lc; x.shadowBlur = 12; x.fillStyle = lc;
  x.beginPath(); x.roundRect(.2 * S, H - .9 * S, .42 * S, .18 * S, 3); x.fill();
  x.beginPath(); x.roundRect(W - .62 * S, H - .9 * S, .42 * S, .18 * S, 3); x.fill();
  x.shadowBlur = 0;
  return { texture: tex(c), wM: 2.0, hM: 1.6 };
}

/* Billboard 8×4մ վահանակ 5մ սյուների վրա — placeholder գովազդ (canvas տեքստ) */
export function makeBillboardTex(line1, line2, c1, c2) {
  const S = 28, W = 8 * S, H = 9 * S, neon = Math.max(0, P.bbNeon); // 9մ ընդհանուր բարձր. (5 սյուն + 4 վահանակ)
  const [c, x] = cv(W, H);
  x.fillStyle = "#8f91aa"; x.fillRect(.7 * S - 3, 4 * S, 6, 5 * S); x.fillRect(W - .7 * S - 3, 4 * S, 6, 5 * S);
  x.fillStyle = "#12093a"; x.fillRect(0, .6 * S, W, 4 * S);
  x.strokeStyle = "#ff2bd6"; x.lineWidth = 5; x.shadowColor = "#ff2bd6"; x.shadowBlur = 10 * neon; x.strokeRect(6, .6 * S + 6, W - 12, 4 * S - 12);
  x.textAlign = "center"; x.textBaseline = "middle";
  x.fillStyle = c1; x.font = "bold " + (1.5 * S) + "px Arial"; x.shadowColor = c1; x.shadowBlur = 14 * neon; x.fillText(line1, W / 2, 2.0 * S);
  if (neon > 1) x.fillText(line1, W / 2, 2.0 * S);                  // երկրորդ անցում = ավելի խիտ glow
  x.fillStyle = c2; x.font = "bold " + (0.9 * S) + "px Arial"; x.shadowColor = c2; x.shadowBlur = 10 * neon; x.fillText(line2, W / 2, 3.6 * S);
  x.shadowBlur = 0;
  return { texture: tex(c), wM: 8, hM: 9 };
}

/* Հետապնդող — պրոտոյի drawEnemy 1:1 (հետևից տեսք. վերարկու, գլուխ, ոտքեր), placeholder silhouette */
export function makeChaserTex() {
  const [c, g] = cv(128, 160);
  g.translate(64, 80);
  g.fillStyle = "#3a4a8c"; g.fillRect(-24, -12, 48, 64);
  g.fillStyle = "#2a3566"; g.fillRect(-3, -12, 6, 64);
  g.fillStyle = "#e8b98a"; g.beginPath(); g.arc(0, -36, 25, 0, Math.PI * 2); g.fill();
  g.fillStyle = "#2a2a33"; g.beginPath(); g.arc(0, -40, 25, Math.PI, 0); g.fill();
  g.fillStyle = "#26304f"; g.fillRect(-20, 52, 15, 24); g.fillRect(5, 52, 15, 24);
  return tex(c);
}

/* Հյուրանոց — պրոտոյի landmark-ը (26×22×14, #5a3644 ֆասադ, վարդագույն ցուցանակ) */
export function makeHotelTex() {
  const [c, x] = cv(26 * 10, 25 * 10);
  x.fillStyle = "#6a4454"; x.fillRect(0, 30, 260, 220);
  const fw = 260 / 6, fh = 220 / 7;
  for (let r = 0; r < 7; r++) for (let q = 0; q < 6; q++) {
    x.fillStyle = rnd() < .6 ? pick(COL.winLit) : "#3b2530";
    x.fillRect(q * fw + fw * .22, 30 + r * fh + fh * .2, fw * .56, fh * .55);
  }
  x.fillStyle = "#2a1a24"; x.fillRect(102, 185, 55, 65);
  x.fillStyle = "#ff2bd6"; x.fillRect(90, 175, 80, 7);
  x.shadowColor = "#ff2bd6"; x.shadowBlur = 16; x.fillRect(60, 6, 140, 24); x.shadowBlur = 0;
  return { texture: tex(c), wM: 26, hM: 25 };
}

export function makeShadowTex() {
  const [c, x] = cv(128, 64);
  const g = x.createRadialGradient(64, 32, 2, 64, 32, 32);
  g.addColorStop(0, "rgba(0,0,0,.55)"); g.addColorStop(.6, "rgba(0,0,0,.25)"); g.addColorStop(1, "rgba(0,0,0,0)");
  x.fillStyle = g; x.save(); x.scale(2, 1); x.beginPath(); x.arc(32, 32, 32, 0, 7); x.fill(); x.restore();
  return tex(c);
}

/* ================= T-0009. Գետին + հակա-«թղթե» շենքեր ================= */

/* Առանձին PRNG — քաղաքի rnd() հաջորդականությունը չշարժենք (նույն շենքերը, ինչ առաջ) */
function prng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

/* Գետնի cross-section texture. Մեկ canvas, 0 asset. x-ով՝ [−gx, gx] մ (գետին | մայթ | curb | ասֆալտ | curb | մայթ | գետին),
 * z-ով՝ GROUND_TILE մ, repeat (մայթի սալիկ 2մ × 8, dash 8մ × 2)։ Դետալը ամբողջությամբ baked ա. մայթի սալիկ-կարաններ ու
 * տոնային տարբերություն, ճաքեր, բծեր, ասֆալտի հատիկ, կարկատաններ, եզրի մաշվածություն, curb երկտոն + երկու կոնտակտային ստվեր,
 * գծանշում։ Mesh-ը (world.js) ամեն կադր միայն vertex-ներն ա շարժում — per-frame poly/ալոկացիա 0։
 * Chrome-ի canvas-ը ~10–25ms ա նկարում (մեկ անգամ boot-ին, հետո միայն 💡 regen-ին)։ POT չափ՝ mipmap-ը WebGL1-ում էլ աշխատի։ */
export const GROUND_TILE = 16;
export function makeGroundTex(roadW) {
  const hw = roadW / 2, swO = hw + 3, gx = swO + 6;
  const W = IS_MOBILE ? 1024 : 2048, H = W / 2, kx = W / (2 * gx), kz = H / GROUND_TILE, GT = GROUND_TILE;
  const [c, x] = cv(W, H);
  const R = prng(2026);
  const X = (m) => (m + gx) * kx, Z = (m) => m * kz;
  const rect = (x0, x1, z0, z1, col) => { x.fillStyle = col; x.fillRect(X(Math.min(x0, x1)), Z(z0), Math.abs(x1 - x0) * kx, (z1 - z0) * kz); };
  const grain = (x0, x1, n, a, px) => { const w = (x1 - x0) * kx; for (let i = 0; i < n; i++) { x.fillStyle = R() < .5 ? `rgba(255,255,255,${a})` : `rgba(0,0,0,${a})`; x.fillRect(X(x0) + R() * w, R() * H, px, px); } };
  const blot = (x0, x1, n, rM, a) => { for (let i = 0; i < n; i++) { const cx = X(x0 + R() * (x1 - x0)), cy = R() * H, r = (rM * (0.5 + R())) * kx; const g = x.createRadialGradient(cx, cy, 0, cx, cy, r); g.addColorStop(0, `rgba(0,0,0,${a})`); g.addColorStop(1, "rgba(0,0,0,0)"); x.fillStyle = g; x.fillRect(cx - r, cy - r, 2 * r, 2 * r); } };
  const crack = (x0, x1, n, a, lw) => { x.strokeStyle = `rgba(0,0,0,${a})`; x.lineWidth = lw; x.lineCap = "round"; for (let i = 0; i < n; i++) { let px = X(x0 + R() * (x1 - x0)), py = R() * H; x.beginPath(); x.moveTo(px, py); const segs = 4 + Math.floor(R() * 5); for (let k = 0; k < segs; k++) { px += (R() - .5) * .5 * kx; py += (R() * .9 - .2) * .5 * kz; x.lineTo(px, py); } x.stroke(); } };
  // --- գետին (ամբողջ լայնք). եզրի սյուները մաքուր գետնի գույն են — mesh-ի u=0/1 clamp-ը էդ ա ձգում դեպի էկրանի եզր
  rect(-gx, gx, 0, GT, COL.ground);
  blot(-gx + 1.5, gx - 1.5, 10, 1.6, .05); grain(-gx + .5, gx - .5, 1200, .04, 2);
  const seam = _shade(COL.sidewalk, .28), curbTop = _mix(COL.curb, "#ffffff", .22), curbFace = _shade(COL.curb, .30);
  for (const s of [-1, 1]) {
    const S = (m) => s * m;
    // --- մայթ. սալիկներ 2×~1.65մ, ամեն մեկը իրա տոնով, կարաններ (լայնակի ամեն 2մ + երկայնակի մեջտեղով), ճաքեր, բծեր
    rect(S(hw), S(swO), 0, GT, COL.sidewalk);
    const xm = hw + 1.65;
    for (let z = 0; z < GT; z += 2) for (const [a, b] of [[hw + .3, xm], [xm, swO]]) {
      const k = (R() - .5) * .07; rect(S(a), S(b), z, z + 2, k > 0 ? `rgba(255,255,255,${k})` : `rgba(0,0,0,${-k})`);
    }
    for (let z = 0; z < GT; z += 2) rect(S(hw + .34), S(swO), z - .03, z + .03, `rgba(${_hx(seam).join(",")},.55)`);
    rect(S(xm - .03), S(xm + .03), 0, GT, `rgba(${_hx(seam).join(",")},.35)`);
    crack(Math.min(S(hw + .4), S(swO - .2)), Math.max(S(hw + .4), S(swO - .2)), 5, .16, 1.5);
    blot(Math.min(S(hw + .6), S(swO - .4)), Math.max(S(hw + .6), S(swO - .4)), 5, .5, .07);
    grain(Math.min(S(hw + .3), S(swO)), Math.max(S(hw + .3), S(swO)), 700, .045, 2);
    // --- curb. երես (մուգ) / վերև (բաց), ստվեր մայթի վրա (նուրբ) ու կոնտակտային ստվեր ասֆալտի վրա (gradient)
    rect(S(hw), S(hw + .08), 0, GT, curbFace);
    rect(S(hw + .08), S(hw + .30), 0, GT, curbTop);
    { const g = x.createLinearGradient(X(S(hw + .30)), 0, X(S(hw + .62)), 0); g.addColorStop(0, "rgba(0,0,0,.10)"); g.addColorStop(1, "rgba(0,0,0,0)"); rect(S(hw + .30), S(hw + .62), 0, GT, g); }
  }
  // --- ասֆալտ. հատիկ, եզրի մուգ գոտի + մաշվածություն, կարկատաններ (մուգ՝ բաց եզրով), «վերանորոգված» բաց խայտեր, ձյութի գծեր, ճաքեր
  rect(-hw, hw, 0, GT, COL.asphalt);
  grain(-hw, hw, IS_MOBILE ? 1800 : 4000, .06, 2);
  for (const s of [-1, 1]) {
    const S = (m) => s * m;
    rect(S(hw * .82), S(hw), 0, GT, `rgba(${_hx(COL.asphaltEdge).join(",")},.45)`);
    rect(S(hw * .90), S(hw * .97), 0, GT, `rgba(${_hx(COL.sidewalk).join(",")},.13)`);
    { const g = x.createLinearGradient(X(S(hw - .45)), 0, X(S(hw)), 0); g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,0,.26)"); rect(S(hw - .45), S(hw), 0, GT, g); }
  }
  for (let i = 0; i < 6; i++) {                 // կարկատան. անկանոն բազմանկյուն, նուրբ — ֆոն ա, ոչ առաջին պլան
    const cx = (R() - .5) * 2 * (hw - 1.2), cz = R() * GT, rx = .35 + R() * .6, rz = .5 + R() * 1.2, n = 6 + Math.floor(R() * 4);
    x.beginPath();
    for (let k = 0; k < n; k++) { const a = k / n * Math.PI * 2, rr = .75 + R() * .35; x.lineTo(X(cx + Math.cos(a) * rx * rr), Z(cz + Math.sin(a) * rz * rr)); }
    x.closePath();
    const light = R() < .3;
    x.fillStyle = light ? `rgba(${_hx(COL.sidewalk).join(",")},.05)` : `rgba(0,0,0,${.05 + R() * .05})`; x.fill();
    x.strokeStyle = light ? "rgba(0,0,0,.06)" : "rgba(255,255,255,.05)"; x.lineWidth = 1.5; x.stroke();
  }
  crack(-hw + .8, hw - .8, 4, .14, 2);          // ձյութած ճաքեր
  crack(-hw + .8, hw - .8, 3, .09, 1);
  blot(-hw + 1, hw - 1, 6, .9, .05);
  // --- գծանշում. կենտրոնի dash 0.47×2.73 ամեն 8մ + երկու թույլ գոտու գիծ ±2.6 (հատիկը վրայից՝ մաշված)
  for (const z of [0, 8]) rect(-.235, .235, z, z + 2.73, COL.lane);
  for (const s of [-1, 1]) rect(s * 2.6 - .06, s * 2.6 + .06, 0, GT, "rgba(255,255,255,.12)");
  grain(-.3, .3, 60, .10, 2);
  const t = tex(c);
  t.source.style.addressModeU = "clamp-to-edge";  // եզրից դուրս՝ գետնի գույնը (mesh-ի արտաքին սյուները u=0/1)
  t.source.style.addressModeV = "repeat";         // z-ով tile
  t.source.style.maxAnisotropy = IS_MOBILE ? 4 : 8;
  t.source.autoGenerateMipmaps = true;            // հեռվում shimmer չլինի (trilinear + aniso)
  return { texture: t, gx, gt: GT, roadW };
}

/* Գետնի մշուշի overlay. Գետնի (y=0) հարթության վրա խորությունը միայն էկրանի y-ի ֆունկցիա ա. sy − hy = F·h/(cosθ·d),
 * ուրեմն u = (sy − hy)/(y_near − hy) = near/d, t = fogT(d) = k/(1−k)·(1−u)/u, k = fogNearK — ԱՆԿԱԽ կամեռայի բարձրությունից/FOV-ից։
 * Մեկ սպիտակ gradient sprite (alpha = t), tint = COL.fog, hy-ից մինչև y_near ձգված — ամեն կադր 4 թիվ, 0 ալոկացիա */
export function makeGroundFogTex() {
  const N = 256, [c, x] = cv(4, N), kk = P.fogNearK / (1 - P.fogNearK);
  const img = x.createImageData(4, N);
  for (let r = 0; r < N; r++) {
    const u = (r + .5) / N, a = Math.min(1, kk * (1 - u) / u);
    for (let i = 0; i < 4; i++) { const o = (r * 4 + i) * 4; img.data[o] = img.data[o + 1] = img.data[o + 2] = 255; img.data[o + 3] = Math.round(a * 255); }
  }
  x.putImageData(img, 0, 0);
  return tex(c);
}

/* Շենքի հիմքի կոնտակտային ստվեր (AO). Փափուկ եզրով ուղղանկյուն — կենտրոնը շենքի տակ ա, երևում ա միայն 1.6մ շրջագիծը */
export function makeFootTex() {
  const S = 128, [c, x] = cv(S, S);
  for (let i = 1; i <= 16; i++) { x.fillStyle = "rgba(0,0,0,.05)"; x.beginPath(); x.roundRect(i, i, S - 2 * i, S - 2 * i, Math.max(3, 18 - i)); x.fill(); }
  return tex(c);
}

/* Պարապետ/քիվ. վերին լուսավոր եզր, կողի գիծ, ներքևի մութ underside — կամերան ներքևից ա նայում, տակն ա երևում */
export function makeCornTex() {
  const [c, x] = cv(32, 16);
  x.fillStyle = COL.roofCap; x.fillRect(0, 0, 32, 16);
  x.fillStyle = "rgba(255,255,255,.20)"; x.fillRect(0, 0, 32, 5);
  x.fillStyle = "rgba(0,0,0,.12)"; x.fillRect(0, 5, 32, 4);
  x.fillStyle = "rgba(0,0,0,.45)"; x.fillRect(0, 9, 32, 7);
  return tex(c);
}
