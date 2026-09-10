/* Feel Lab — DEV լարման պանել (⚙ կամ T)։ Խաղի մաս չի. Stake build-ում հանվում ա,
 * թվերը ֆիքսվում են feel spec-ից (T-0004)։ Հեռանկարում՝ «կոնստրուկտոր» պրոդուկտի սաղմը (Սևակ, 2026-09-08)։
 * Slider-ները P-ի իրական միավորներով են (մ/վ, աստիճան, մ) — Copy JSON-ը ուղիղ պրոտոյի հետ ա համեմատվում։
 *
 * Asset Lab (T-0007) — նույն ֆայլում, նույն կարգավիճակով (DEV, Stake build-ի մաս ՉԻ)։ Մեկ ֆայլ,
 * որ օնլայն bundle-ը (tools/office/online/build-artifact*.ps1) առանց փոփոխության հավաքվի։
 */
import { P, P_DEF, TUNE_DEFS, TUNE_GROUPS, LIGHT_PROTO } from "./params.js";

/* T-0008. Icon dock (📷🏃🌆💡⚙) — icon-ին click → ՄԻԱՅՆ էդ խմբի slider-ները։ Copy JSON / Reset՝ ընդհանուր։
 * world-ը միայն Copy JSON-ի (շենքերի scale) ու Reset-ի (scale-երը 1) համար ա։ */
export function initFeelLab({ onChange, world }) {
  const $ = (id) => document.getElementById(id);
  const tuneEl = $("tune"), rows = $("tuneRows"), dock = $("tuneDock"), title = $("tuneGroup"), vals = {}, rowEl = {};
  let group = "cam";
  for (const [key, label, min, max, step, grp] of TUNE_DEFS) {
    const row = document.createElement("div");
    row.className = "row"; row.dataset.g = grp;
    row.innerHTML = `<label>${label} <b data-v="${key}">${P[key]}</b></label>` +
      `<input type="range" min="${min}" max="${max}" step="${step}" value="${P[key]}" data-k="${key}">`;
    rows.appendChild(row);
    vals[key] = row.querySelector("b"); rowEl[key] = row;
    const inp = row.querySelector("input");
    inp.addEventListener("input", () => { P[key] = parseFloat(inp.value); vals[key].textContent = P[key]; onChange(key); });
    for (const ev of ["pointerdown", "pointerup"]) inp.addEventListener(ev, e => e.stopPropagation());
  }
  // --- dock. մեկ կոճակ/խումբ, ակտիվը նշված, պանելը միայն էդ խմբի row-երն ա ցույց տալիս
  const showGroup = (id) => {
    group = id;
    for (const b of dock.children) b.classList.toggle("on", b.dataset.g === id);
    for (const [key, , , , , grp] of TUNE_DEFS) rowEl[key].style.display = grp === id ? "" : "none";
    const gdef = TUNE_GROUPS.find(g => g[0] === id);
    title.textContent = gdef ? gdef[2] : id;
    $("tuneProto").style.display = id === "light" ? "" : "none";
    try { localStorage.setItem("feel.group", id); } catch (_) {}
  };
  for (const [id, icon, label] of TUNE_GROUPS) {
    const b = document.createElement("button");
    b.type = "button"; b.dataset.g = id; b.textContent = icon; b.title = label;
    b.addEventListener("click", e => { e.stopPropagation(); showGroup(id); });
    dock.appendChild(b);
  }
  let saved = null; try { saved = localStorage.getItem("feel.group"); } catch (_) {}
  showGroup(TUNE_GROUPS.some(g => g[0] === saved) ? saved : "cam");

  const refresh = () => { for (const [key] of TUNE_DEFS) { rows.querySelector(`input[data-k="${key}"]`).value = P[key]; vals[key].textContent = P[key]; } };
  const toggle = () => tuneEl.classList.toggle("open");
  $("tuneBtn").addEventListener("click", e => { e.stopPropagation(); toggle(); });
  for (const ev of ["pointerdown", "pointerup"]) { $("tuneBtn").addEventListener(ev, e => e.stopPropagation()); tuneEl.addEventListener(ev, e => e.stopPropagation()); }
  addEventListener("keydown", e => { if (e.key === "t" || e.key === "T") toggle(); });
  // Copy JSON. P + շենքերի ոչ-default scale-երը (bScale: {"L3": 1.4}) — feel spec-ի հետ մեկ տեղ
  $("tuneCopy").addEventListener("click", () => {
    const bScale = world ? world.scales() : {};
    const json = JSON.stringify(Object.keys(bScale).length ? { ...P, bScale } : P, null, 2);
    console.log("feel params:", json);
    if (navigator.clipboard) navigator.clipboard.writeText(json).catch(() => {});
  });
  // Reset. ամեն ինչ ետ՝ P default-ները (գիշերային լույսը ներառյալ) + շենքերի scale-երը 1
  $("tuneReset").addEventListener("click", () => { Object.assign(P, P_DEF); if (world) world.resetScales(); refresh(); onChange("*"); });
  // v16_14. լույսի խումբը պրոտոյի հին գունապնակին — before/after համեմատելու համար (Reset-ը նորը ետ ա բերում)
  $("tuneProto").addEventListener("click", () => { Object.assign(P, LIGHT_PROTO); refresh(); onChange("*"); });
  return { showGroup, refresh, group: () => group };
}

/* ---- Asset Lab (DEV, T-0007). Հիմնադիրը իր ասեթը խաղի մեջ ա տեսնում առանց build-ի։
 * Tap շենքի վրա → ընտրվում ա (tint highlight), tap ընտրվածի վրա → հաջորդ վարիանտ (10-ից),
 * tap դատարկ տեղ → հանել։ Նկար (PNG/WebP/JPG) drop պատուհանի վրա → ընտրված (կամ drop-ի տակի)
 * շենքի front/side տեքստուրան փոխվում ա live։ Մոբայլ/iframe-ի համար՝ «Load» կոճակ (file input)։
 * Ընտրությունը world.buildings[i] օբյեկտին ա կապված, ոչ էկրանային դիրքին — sprite-երը z-flow-ով պտտվում են։
 * Բյուջե. 0 filter, 0 լրացուցիչ draw. hit-test-ը միայն tap-ի պահին ա (24 շենք)։ */
export function initAssetLab({ app, world }) {
  const $ = (id) => document.getElementById(id);
  const bar = $("alab"), lbl = $("alabLbl"), faceBtn = $("alabFace"), fileIn = $("alabFile"), scIn = $("alabScale"), scVal = $("alabScaleV");
  let face = "front";                              // drop/load-ի թիրախը
  const S = () => world.selected;
  const name = (b) => (b.side < 0 ? "L" : "R") + b.i + " · v" + b.vi + (b.tex.front || b.tex.side ? " · custom" : "") + (b.sc !== 1 ? " · ×" + b.sc.toFixed(2) : "");

  const refresh = () => {
    const b = S();
    bar.classList.toggle("show", !!b);
    if (b) { lbl.textContent = name(b); scIn.value = b.sc; scVal.textContent = "×" + b.sc.toFixed(2); }
    faceBtn.textContent = face;
  };
  // նոր ընտրություն / հանել → drop-ի թիրախը ետ front (Լուսինե, T-0007 review §3. side-ը global չմնա)
  const select = (b) => { if (b !== S()) face = "front"; world.selectBuilding(b); refresh(); };
  const cycle = () => { const b = S(); if (b) { world.cycleVariant(b); refresh(); } };
  // --- scale (T-0008). Կպած ա շենք-օբյեկտին, flow/rewind-ից ողջ ա մնում
  scIn.min = world.constructor.SC_MIN; scIn.max = world.constructor.SC_MAX; scIn.step = 0.05;
  scIn.addEventListener("input", () => { const b = S(); if (b) { world.setBuildingScale(b, parseFloat(scIn.value)); refresh(); } });
  for (const ev of ["pointerdown", "pointerup"]) scIn.addEventListener(ev, e => e.stopPropagation());
  const setScale = (sc, b = S()) => { if (b) { world.setBuildingScale(b, sc); refresh(); } };

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
  /* Chrome-ը կիսատ/վնասված PNG-ն decode ա անում առանց error-ի → սև texture (Լուսինե, T-0007 review §1)։
   * Sanity-check. 8×8 նմուշ — բոլորը սև+անթափանց կամ բոլորը թափանցիկ → warn, բայց կիրառում ենք (կարող ա գիտակցված սև ասեթ լինի) */
  function looksBlank(img) {
    try {
      const c = document.createElement("canvas"); c.width = c.height = 8;
      const x = c.getContext("2d", { willReadFrequently: true }); x.drawImage(img, 0, 0, 8, 8);
      const d = x.getImageData(0, 0, 8, 8).data;
      let dark = 0, clear = 0;
      for (let i = 0; i < d.length; i += 4) { if (d[i + 3] < 8) clear++; else if (d[i] + d[i + 1] + d[i + 2] < 24) dark++; }
      return dark === 64 ? "ամբողջը սև" : clear === 64 ? "ամբողջը թափանցիկ" : null;
    } catch (_) { return null; }
  }
  const short = (s) => s.length > 72 ? s.slice(0, 48) + "…" + s.slice(-16) : s;   // data-URI-ն console-ը չլցնի (review §2)
  function apply(b, img, label) {
    const v = b.v, tex = PIXI.Texture.from(img);
    const want = face === "front" ? v.w / v.h : v.d / v.h, got = img.naturalWidth / img.naturalHeight;
    if (Math.abs(want - got) / want > 0.15)
      console.warn(`asset-lab: ${label} ${img.naturalWidth}×${img.naturalHeight} (aspect ${got.toFixed(2)}) ≠ ${name(b)} ${face} ${want.toFixed(2)} — ձգվում ա (v1)`);
    if (Math.max(img.naturalWidth, img.naturalHeight) > 2048) console.warn(`asset-lab: ${label} > 2048px — մոբայլի GPU-ն կարա չտանի, փոքրացրու`);
    const blank = looksBlank(img);
    if (blank) console.warn(`asset-lab: ${label} — նկարը ${blank} ա. վնասված/կիսատ ֆայլ՞ (Chrome-ը կիսատ PNG-ն լուռ ա decode անում)`);
    world.setBuildingTex(b, face, tex);
    console.info(`asset-lab: ${name(b)} ${face} ← ${label}${blank ? " (⚠ " + blank + ")" : ""}`);
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
    const label = short(url);
    try { const { img } = await loadImage(url, label); apply(b, img, label); }
    catch (err) { console.warn("asset-lab: load ձախողվեց", label, err); }
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
    selected: S, cycle, loadFile, loadUrl, scale: setScale,          // scale(1.4) — debug/QA
    face: (f) => { if (f) { face = f; refresh(); } return face; },
  };
}
