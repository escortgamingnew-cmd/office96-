/* Feel Lab — DEV լարման պանել (⚙ կամ T)։ Խաղի մաս չի. Stake build-ում հանվում ա,
 * թվերը ֆիքսվում են feel spec-ից (T-0004)։ Հեռանկարում՝ «կոնստրուկտոր» պրոդուկտի սաղմը (Սևակ, 2026-09-08)։
 * Slider-ները P-ի իրական միավորներով են (մ/վ, աստիճան, մ) — Copy JSON-ը ուղիղ պրոտոյի հետ ա համեմատվում։
 *
 * Asset Lab (T-0007) — նույն ֆայլում, նույն կարգավիճակով (DEV, Stake build-ի մաս ՉԻ)։ Մեկ ֆայլ,
 * որ օնլայն bundle-ը (tools/office/online/build-artifact*.ps1) առանց փոփոխության հավաքվի։
 */
import { P, P_DEF, TUNE_DEFS } from "./params.js";

export function initFeelLab(onChange) {
  const $ = (id) => document.getElementById(id);
  const tuneEl = $("tune"), rows = $("tuneRows"), vals = {};
  for (const [key, label, min, max, step] of TUNE_DEFS) {
    const row = document.createElement("div");
    row.className = "row";
    row.innerHTML = `<label>${label} <b data-v="${key}">${P[key]}</b></label>` +
      `<input type="range" min="${min}" max="${max}" step="${step}" value="${P[key]}" data-k="${key}">`;
    rows.appendChild(row);
    vals[key] = row.querySelector("b");
    const inp = row.querySelector("input");
    inp.addEventListener("input", () => { P[key] = parseFloat(inp.value); vals[key].textContent = P[key]; onChange(key); });
    for (const ev of ["pointerdown", "pointerup"]) inp.addEventListener(ev, e => e.stopPropagation());
  }
  const refresh = () => { for (const [key] of TUNE_DEFS) { rows.querySelector(`input[data-k="${key}"]`).value = P[key]; vals[key].textContent = P[key]; } };
  const toggle = () => tuneEl.classList.toggle("open");
  $("tuneBtn").addEventListener("click", e => { e.stopPropagation(); toggle(); });
  for (const ev of ["pointerdown", "pointerup"]) { $("tuneBtn").addEventListener(ev, e => e.stopPropagation()); tuneEl.addEventListener(ev, e => e.stopPropagation()); }
  addEventListener("keydown", e => { if (e.key === "t" || e.key === "T") toggle(); });
  $("tuneCopy").addEventListener("click", () => {
    const json = JSON.stringify(P, null, 2);
    console.log("feel params:", json);
    if (navigator.clipboard) navigator.clipboard.writeText(json).catch(() => {});
  });
  $("tuneReset").addEventListener("click", () => { Object.assign(P, P_DEF); refresh(); onChange("*"); });
}

/* ---- Asset Lab (DEV, T-0007). Հիմնադիրը իր ասեթը խաղի մեջ ա տեսնում առանց build-ի։
 * Tap շենքի վրա → ընտրվում ա (tint highlight), tap ընտրվածի վրա → հաջորդ վարիանտ (10-ից),
 * tap դատարկ տեղ → հանել։ Նկար (PNG/WebP/JPG) drop պատուհանի վրա → ընտրված (կամ drop-ի տակի)
 * շենքի front/side տեքստուրան փոխվում ա live։ Մոբայլ/iframe-ի համար՝ «Load» կոճակ (file input)։
 * Ընտրությունը world.buildings[i] օբյեկտին ա կապված, ոչ էկրանային դիրքին — sprite-երը z-flow-ով պտտվում են։
 * Բյուջե. 0 filter, 0 լրացուցիչ draw. hit-test-ը միայն tap-ի պահին ա (24 շենք)։ */
export function initAssetLab({ app, world }) {
  const $ = (id) => document.getElementById(id);
  const bar = $("alab"), lbl = $("alabLbl"), faceBtn = $("alabFace"), fileIn = $("alabFile");
  let face = "front";                              // drop/load-ի թիրախը
  const S = () => world.selected;
  const name = (b) => (b.side < 0 ? "L" : "R") + b.i + " · v" + b.vi + (b.tex.front || b.tex.side ? " · custom" : "");

  const refresh = () => {
    const b = S();
    bar.classList.toggle("show", !!b);
    if (b) lbl.textContent = name(b);
    faceBtn.textContent = face;
  };
  const select = (b) => { world.selectBuilding(b); refresh(); };
  const cycle = () => { const b = S(); if (b) { world.cycleVariant(b); refresh(); } };

  // --- tap (ոչ drag, ոչ hold). roll-ը հաշվի առնելով objs-ի local-ում ենք hit-test անում
  const toLocal = (cx, cy) => world.objs.toLocal({ x: cx, y: cy });
  const pick = (cx, cy) => { const p = toLocal(cx, cy); return world.pickBuilding(p.x, p.y); };
  let down = null;
  app.canvas.addEventListener("pointerdown", e => { down = { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now() }; });
  app.canvas.addEventListener("pointerup", e => {
    if (!down || down.id !== e.pointerId) return;
    const d = down; down = null;
    if (Math.hypot(e.clientX - d.x, e.clientY - d.y) > 12 || performance.now() - d.t > 450) return;
    const b = pick(e.clientX, e.clientY);
    if (b && b === S()) cycle(); else select(b);
  });
  app.canvas.addEventListener("pointercancel", () => { down = null; });

  // --- նկար → texture. aspect-ը շենքին չի համընկնում՝ v1-ում ձգվում ա (asset-spec 2.1), console-ում նախազգուշացում
  async function loadImage(src, label) {
    const img = new Image();
    img.src = src;
    await img.decode();
    return { img, label };
  }
  function apply(b, img, label) {
    const v = b.v, tex = PIXI.Texture.from(img);
    const want = face === "front" ? v.w / v.h : v.d / v.h, got = img.naturalWidth / img.naturalHeight;
    if (Math.abs(want - got) / want > 0.15)
      console.warn(`asset-lab: ${label} ${img.naturalWidth}×${img.naturalHeight} (aspect ${got.toFixed(2)}) ≠ ${name(b)} ${face} ${want.toFixed(2)} — ձգվում ա (v1)`);
    if (Math.max(img.naturalWidth, img.naturalHeight) > 2048) console.warn(`asset-lab: ${label} > 2048px — մոբայլի GPU-ն կարա չտանի, փոքրացրու`);
    world.setBuildingTex(b, face, tex);
    console.info(`asset-lab: ${name(b)} ${face} ← ${label}`);
    refresh();
  }
  async function loadFile(file, b = S()) {
    if (!file || !/^image\//.test(file.type)) { console.warn("asset-lab: նկար չի (PNG/WebP/JPG)", file && file.type); return; }
    if (!b) { console.warn("asset-lab: սկզբում շենք ընտրի (tap)"); return; }
    const url = URL.createObjectURL(file);
    try { const { img } = await loadImage(url, file.name); apply(b, img, file.name); }
    catch (err) { console.warn("asset-lab: decode ձախողվեց", file.name, err); }
    finally { URL.revokeObjectURL(url); }
  }
  async function loadUrl(url, b = S()) {                     // debug/QA. __feel.asset.loadUrl("assets/papi-run-20f.webp")
    if (!b) { console.warn("asset-lab: սկզբում շենք ընտրի"); return; }
    try { const { img } = await loadImage(url, url); apply(b, img, url); }
    catch (err) { console.warn("asset-lab: load ձախողվեց", url, err); }
  }

  // --- drag&drop (desktop). Drop-ի տակ շենք կա՝ ինքն ա դառնում թիրախը, չկա՝ ընտրվածը
  addEventListener("dragover", e => { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; });
  addEventListener("drop", e => {
    e.preventDefault();
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (!file) return;
    const under = pick(e.clientX, e.clientY);
    if (under) select(under);
    loadFile(file);
  });

  // --- toolbar (հայտնվում ա ընտրության հետ). Իրադարձությունները canvas չեն հասնում
  for (const ev of ["pointerdown", "pointerup", "click"]) bar.addEventListener(ev, e => e.stopPropagation());
  faceBtn.addEventListener("click", () => { face = face === "front" ? "side" : "front"; refresh(); });
  $("alabLoad").addEventListener("click", () => { fileIn.value = ""; fileIn.click(); });
  fileIn.addEventListener("change", () => loadFile(fileIn.files[0]));
  $("alabNext").addEventListener("click", cycle);
  $("alabReset").addEventListener("click", () => { const b = S(); if (b) { world.resetBuildingTex(b); refresh(); } });
  $("alabOff").addEventListener("click", () => select(null));

  return {
    select: (b) => select(typeof b === "number" ? world.buildings[b] : b),
    selected: S, cycle, loadFile, loadUrl,
    face: (f) => { if (f) { face = f; refresh(); } return face; },
  };
}
