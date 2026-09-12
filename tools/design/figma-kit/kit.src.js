/* Run Dady UI kit — Figma plugin (Plugin API, նույնը ինչ MCP use_figma-ն, առանց quota-ի)
 * Հեղինակ՝ Արեգ (designer), T-0012, 2026-09-12։
 *
 * Կանոններ.
 *  - TOKENS-ը վերևում ա (gen-tokens.mjs-ից ներարկված) — code.js-ը ձեռքով չենք խմբագրում։
 *  - Ամեն ստեղծած node ստանում ա pluginData('rdkit') մարկեր. կրկնակի վազքը ջնջում ա ՄԻԱՅՆ
 *    մարկերով node-երը ու վերակառուցում — հիմնադրի ձեռքով արածին ձեռք չի տալիս։
 *  - Variables/text styles-ը չեն ջնջվում. գտնվում են անունով, թարմացվում են տեղում։
 *  - Primitives (գույն, space, type սանդղակներ) → scopes [] (hidden, ոչ մի էլեմենտ չի սնվում)։
 *    Semantic (UI, font/*, pad/gap/size/stroke) → միակ սպառվող շերտը։
 */

const KIT = "rdkit";
const PAGE_COMPONENTS = "Components";
const LOG = [];
const log = (s) => LOG.push(s);

/* ---------- ընդհանուր գործիքներ ---------- */
const hexToRgb = (hex) => ({ r: parseInt(hex.slice(1, 3), 16) / 255, g: parseInt(hex.slice(3, 5), 16) / 255, b: parseInt(hex.slice(5, 7), 16) / 255 });
const parseColor = (s) => {
  if (s.startsWith("#")) return Object.assign(hexToRgb(s), { a: 1 });
  const m = s.match(/rgba?\(([\d.]+),([\d.]+),([\d.]+)(?:,([\d.]+))?\)/);
  return { r: +m[1] / 255, g: +m[2] / 255, b: +m[3] / 255, a: m[4] === undefined ? 1 : +m[4] };
};
const isColor = (v) => typeof v === "string" && (v.startsWith("#") || v.startsWith("rgb"));
const mark = (n) => { n.setPluginData(KIT, "v1"); return n; };
const solid = (v) => figma.variables.setBoundVariableForPaint({ type: "SOLID", color: { r: 0, g: 0, b: 0 } }, "color", v);
const bindAll = (node, fields, v) => fields.forEach((f) => node.setBoundVariable(f, v));
const bindRadius = (node, v) => bindAll(node, ["topLeftRadius", "topRightRadius", "bottomLeftRadius", "bottomRightRadius"], v);

/* collection-ի ընտրությունը token-ի անունից */
function collectionFor(name, value, semantic) {
  if (!semantic) {
    if (isColor(value)) return "Primitives";
    if (/^(space|radius)\//.test(name)) return "Layout";
    return "Type";
  }
  if (name.startsWith("font/")) return "Type";
  if (/^(pad|gap|size|stroke)\//.test(name)) return "Layout";
  return "UI";
}
function scopesFor(name, semantic) {
  if (!semantic) return name.startsWith("radius/") ? ["CORNER_RADIUS"] : []; /* primitives hidden. radius-ը արդեն semantic անուններով ա */
  if (name.startsWith("font/")) {
    const leaf = name.split("/").pop();
    return { family: ["FONT_FAMILY"], size: ["FONT_SIZE"], weight: ["FONT_WEIGHT"], tracking: ["LETTER_SPACING"], lh: ["LINE_HEIGHT"] }[leaf];
  }
  if (/-glow$/.test(name)) return ["EFFECT_COLOR"];
  if (/^action\/on-|^text\//.test(name)) return ["TEXT_FILL"];
  if (name.startsWith("icon/")) return ["SHAPE_FILL", "STROKE_COLOR", "TEXT_FILL"];
  if (/^border\/|ghost-border$/.test(name)) return ["STROKE_COLOR"];
  if (name.startsWith("state/")) return ["TEXT_FILL", "STROKE_COLOR"];
  if (name === "brand/accent") return ["FRAME_FILL", "SHAPE_FILL", "TEXT_FILL"];
  if (/^(action|surface)\//.test(name)) return ["FRAME_FILL", "SHAPE_FILL"];
  if (/^(pad|gap)\//.test(name)) return ["GAP", "WIDTH_HEIGHT"];
  if (name.startsWith("size/")) return ["WIDTH_HEIGHT"];
  if (name.startsWith("stroke/")) return ["STROKE_FLOAT"];
  if (name.startsWith("opacity/")) return ["OPACITY"];
  return ["ALL_SCOPES"];
}
const cssVar = (name, semantic) => `var(--${semantic ? "rd" : "eg"}-${name.replace(/\//g, "-").toLowerCase()})`;

/* ---------- ՓՈՒԼ 1. variables audit + sync ---------- */
const V = {}; /* "Collection:name" → Variable */
async function loadVars() {
  const cols = await figma.variables.getLocalVariableCollectionsAsync();
  const vars = await figma.variables.getLocalVariablesAsync();
  for (const v of vars) {
    const c = cols.find((x) => x.id === v.variableCollectionId);
    if (c) V[`${c.name}:${v.name}`] = v;
  }
  return cols;
}
const getVar = (col, name) => {
  const v = V[`${col}:${name}`];
  if (!v) throw new Error(`variable չկա՝ ${col}/${name} — նախ վազեցրու «1. Variables audit + sync»`);
  return v;
};
/* semantic ref "{green/500}" → primitive Variable */
function refVar(ref) {
  const name = ref.slice(1, -1);
  return getVar(collectionFor(name, TOKENS.primitives[name], false), name);
}

async function phaseVariables() {
  let cols = await loadVars();
  const ensureCol = (name, modeName) => {
    let c = cols.find((x) => x.name === name);
    if (!c) { c = figma.variables.createVariableCollection(name); c.renameMode(c.modes[0].modeId, modeName); cols.push(c); log(`+ collection ${name}`); }
    return c;
  };
  const stat = { created: 0, updated: 0 };
  const ensureVar = (colName, name, type) => {
    const c = ensureCol(colName, colName === "UI" ? "Night" : "Value");
    let v = V[`${colName}:${name}`];
    if (!v) { v = figma.variables.createVariable(name, c, type); V[`${colName}:${name}`] = v; stat.created++; log(`+ ${colName}/${name}`); }
    else stat.updated++;
    return [v, c.modes[0].modeId];
  };
  const typeOf = (v) => (isColor(v) ? "COLOR" : typeof v === "number" ? "FLOAT" : "STRING");

  /* primitives — hidden/reference շերտ */
  for (const [name, value] of Object.entries(TOKENS.primitives)) {
    if (name === "family/mono-css") continue; /* CSS-only fallback stack, Figma-ին պետք չի */
    const col = collectionFor(name, value, false);
    const [v, mode] = ensureVar(col, name, typeOf(value));
    v.setValueForMode(mode, isColor(value) ? parseColor(value) : value);
    v.scopes = scopesFor(name, false);
    v.hiddenFromPublishing = !name.startsWith("radius/");
    v.setVariableCodeSyntax("WEB", cssVar(name, false));
  }
  /* semantic — միակ սպառվող շերտը. alias primitive-ի վրա, alpha-ները raw RGBA (Starter՝ 1 մոդ) */
  for (const [name, { ref, value }] of Object.entries(TOKENS.semantic)) {
    const col = collectionFor(name, value, true);
    const [v, mode] = ensureVar(col, name, typeOf(value));
    if (typeof ref === "string" && ref.startsWith("{")) v.setValueForMode(mode, { type: "VARIABLE_ALIAS", id: refVar(ref).id });
    else v.setValueForMode(mode, isColor(value) ? parseColor(value) : value);
    v.scopes = scopesFor(name, true);
    v.hiddenFromPublishing = false;
    v.setVariableCodeSyntax("WEB", cssVar(name, true));
  }
  log(`variables: ${stat.created} նոր, ${stat.updated} թարմացված`);
  cols = await loadVars();
}

/* ---------- ՓՈՒԼ 2. text styles → font/* variable-ներ ---------- */
const STYLE_WEIGHT_NAMES = { 400: ["Regular"], 500: ["Medium"], 600: ["SemiBold", "Semi Bold", "DemiBold"], 700: ["Bold"] };
let FONTS = null;
async function resolveFont(family, weight) {
  FONTS = FONTS || (await figma.listAvailableFontsAsync());
  const styles = FONTS.filter((f) => f.fontName.family === family).map((f) => f.fontName.style);
  let fam = family;
  if (!styles.length) { log(`! ${family} ֆոնտը հասանելի չի — Inter fallback`); fam = "Inter"; }
  const avail = fam === family ? styles : FONTS.filter((f) => f.fontName.family === fam).map((f) => f.fontName.style);
  const style = STYLE_WEIGHT_NAMES[weight].find((s) => avail.includes(s)) || "Regular";
  const fn = { family: fam, style };
  await figma.loadFontAsync(fn);
  return fn;
}
const TS = {}; /* style name → TextStyle */
async function phaseTextStyles() {
  await loadVars();
  const existing = await figma.getLocalTextStylesAsync();
  for (const [name, base] of Object.entries(TOKENS.textStyles)) {
    const t = (leaf) => getVar("Type", `${base}/${leaf}`);
    const fam = t("family"), size = t("size"), weight = t("weight"), tracking = t("tracking"), lh = t("lh");
    /* semantic-ից primitive-ի արժեքը (alias → հում արժեք) */
    const val = (v) => Object.values(v.valuesByMode)[0];
    const prim = (v) => { const x = val(v); return x && x.type === "VARIABLE_ALIAS" ? val(Object.values(V).find((y) => y.id === x.id)) : x; };
    const fontName = await resolveFont(prim(fam), prim(weight));
    let s = existing.find((x) => x.name === name);
    if (!s) { s = figma.createTextStyle(); s.name = name; log(`+ text style ${name}`); }
    else await figma.loadFontAsync(s.fontName); /* եղած style-ի ֆոնտն էլ պիտի բեռնված լինի, նոր փոխենք */
    s.fontName = fontName;
    s.fontSize = prim(size);
    s.letterSpacing = { unit: "PIXELS", value: prim(tracking) };
    s.lineHeight = { unit: "PIXELS", value: prim(lh) }; /* bound lh-ը Figma-ում px ա, PERCENT binding չկա */
    s.setBoundVariable("fontFamily", fam);
    s.setBoundVariable("fontSize", size);
    s.setBoundVariable("fontWeight", weight);
    s.setBoundVariable("letterSpacing", tracking);
    s.setBoundVariable("lineHeight", lh);
    s.description = `font/${base.split("/")[1]}/* → Type primitives. CSS: ${cssVar(base + "-size", true)}…`;
    TS[name] = s;
  }
  log(`text styles: ${Object.keys(TOKENS.textStyles).length} կապված font/* variable-ներին`);
}

/* ---------- էջ + մաքրում ---------- */
async function componentsPage() {
  let p = figma.root.children.find((x) => x.name === PAGE_COMPONENTS);
  if (!p) {
    try { p = figma.createPage(); p.name = PAGE_COMPONENTS; log(`+ page ${PAGE_COMPONENTS}`); }
    catch (e) { p = figma.root.children[0]; log(`! էջ չստեղծվեց (${e.message}) — Foundations-ի վրա եմ դնում`); }
  }
  await figma.setCurrentPageAsync(p);
  return p;
}
/* մեր մարկերով նույնանուն node-ը ջնջում ենք (idempotent), ուրիշինը՝ ոչ */
function removeMine(page, name) {
  for (const n of [...page.children]) if (n.name === name && n.getPluginData(KIT)) { n.remove(); log(`~ ${name} վերակառուցվում ա`); }
}
function nextX(page) { let x = 0; for (const n of page.children) x = Math.max(x, n.x + n.width); return x + 160; }

/* ---------- ՓՈՒԼ 3. icons (24 grid, 2px stroke, INSTANCE_SWAP-ի համար) ---------- */
const ICON_SVG = {
  Plus: '<path d="M12 5v14M5 12h14"/>',
  Minus: '<path d="M5 12h14"/>',
  Close: '<path d="M6 6l12 12M18 6L6 18"/>',
  ChevronDown: '<path d="M6 9l6 6 6-6"/>',
  Replay: '<path d="M4 4v6h6"/><path d="M5.6 15A8 8 0 1 0 7.5 6.5L4 10"/>',
  History: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  Settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2l1.8 2.6 3.1-.7.7 3.1L20.2 9 19 12l1.2 3-2.6 1.8.7 3.1-3.1.7L13.8 22 12 19.4 10.2 22l-1.4-2.6-3.1-.7.7-3.1L3.8 15 5 12 3.8 9l2.6-1.8-.7-3.1 3.1-.7z"/>',
};
const ICONS = {}; /* name → ComponentNode */
async function phaseIcons() {
  await loadVars();
  const page = await componentsPage();
  removeMine(page, "Icons");
  const iconColor = getVar("UI", "icon/primary");
  const wrap = mark(figma.createFrame());
  wrap.name = "Icons"; wrap.layoutMode = "HORIZONTAL"; wrap.itemSpacing = 24; wrap.paddingTop = wrap.paddingBottom = wrap.paddingLeft = wrap.paddingRight = 24;
  wrap.primaryAxisSizingMode = "AUTO"; wrap.counterAxisSizingMode = "AUTO"; wrap.fills = [];
  wrap.x = nextX(page); wrap.y = 0;
  page.appendChild(wrap);
  for (const [name, body] of Object.entries(ICON_SVG)) {
    const svg = figma.createNodeFromSvg(`<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${body}</g></svg>`);
    const comp = mark(figma.createComponent());
    comp.name = `Icon/${name}`; comp.resize(24, 24); comp.fills = []; comp.clipsContent = false;
    for (const ch of [...svg.children]) { comp.appendChild(ch); ch.x = 0; ch.y = 0; ch.constraints = { horizontal: "SCALE", vertical: "SCALE" }; }
    svg.remove();
    for (const vec of comp.findAll((n) => Array.isArray(n.strokes) && n.strokes.length > 0)) vec.strokes = [solid(iconColor)];
    for (const vec of comp.findAll((n) => n.type !== "COMPONENT" && Array.isArray(n.fills) && n.fills.length > 0)) vec.fills = [solid(iconColor)];
    comp.description = `24×24, stroke 2, icon/primary. INSTANCE_SWAP-ի համար։`;
    wrap.appendChild(comp);
    ICONS[name] = comp;
  }
  log(`icons: ${Object.keys(ICON_SVG).length} կոմպոնենտ (Icon/*)`);
}
async function loadIcons() {
  const page = await componentsPage();
  for (const c of page.findAllWithCriteria({ types: ["COMPONENT"] })) if (c.name.startsWith("Icon/")) ICONS[c.name.slice(5)] = c;
  if (!ICONS.Replay) await phaseIcons();
}
async function loadStyles() {
  await figma.loadFontAsync({ family: "Inter", style: "Regular" }); /* createText-ի default ֆոնտը */
  for (const s of await figma.getLocalTextStylesAsync()) TS[s.name] = s;
  for (const n of Object.keys(TOKENS.textStyles)) if (!TS[n]) { await phaseTextStyles(); break; }
  for (const s of Object.values(TS)) await figma.loadFontAsync(s.fontName);
}

/* ---------- ՓՈՒԼ 4. Button ---------- */
const KINDS = ["Bet", "Cashout", "Ghost"], SIZES = ["Large", "Base"], STATES = ["Default", "Pressed", "Disabled"];
const LABELS = { Bet: "Place Bet", Cashout: "Cash Out", Ghost: "Keep Running" };
function gradient(topVar, bottomVar) {
  const stop = (pos, v) => ({ position: pos, color: { r: 1, g: 1, b: 1, a: 1 }, boundVariables: { color: { type: "VARIABLE_ALIAS", id: v.id } } });
  return { type: "GRADIENT_LINEAR", gradientTransform: [[0, 1, 0], [-1, 0, 1]], gradientStops: [stop(0, topVar), stop(1, bottomVar)] };
}
function glow(v, y, blur) {
  const e = { type: "DROP_SHADOW", color: { r: 0, g: 0, b: 0, a: 0.35 }, offset: { x: 0, y }, radius: blur, spread: 0, visible: true, blendMode: "NORMAL" };
  return figma.variables.setBoundVariableForEffect(e, "color", v);
}
async function phaseButton() {
  await loadVars(); await loadStyles(); await loadIcons();
  const page = await componentsPage();
  removeMine(page, "Button");
  const U = (n) => getVar("UI", n), L = (n) => getVar("Layout", n);
  const comps = [];
  for (const kind of KINDS) for (const size of SIZES) for (const state of STATES) {
    const c = mark(figma.createComponent());
    c.name = `Kind=${kind}, Size=${size}, State=${state}`;
    c.layoutMode = "HORIZONTAL"; c.primaryAxisAlignItems = "CENTER"; c.counterAxisAlignItems = "CENTER";
    c.primaryAxisSizingMode = "AUTO"; c.counterAxisSizingMode = "AUTO";
    bindAll(c, ["paddingTop", "paddingBottom"], L("pad/button-y"));
    bindAll(c, ["paddingLeft", "paddingRight"], L("pad/button-x"));
    c.setBoundVariable("itemSpacing", L("gap/icon"));
    c.setBoundVariable("minHeight", L("size/touch"));
    bindRadius(c, L("radius/control"));
    /* fill / stroke / glow ըստ kind × state */
    const pressed = state === "Pressed", disabled = state === "Disabled";
    if (kind === "Bet") { c.fills = [solid(U(pressed ? "action/bet-pressed" : "action/bet"))]; c.effects = disabled ? [] : [glow(U("action/bet-glow"), 8, 24)]; }
    if (kind === "Cashout") {
      try { c.fills = [gradient(U(pressed ? "action/cashout-pressed-top" : "action/cashout-top"), U(pressed ? "action/cashout-pressed-bottom" : "action/cashout-bottom"))]; }
      catch (e) { log(`! gradient stop binding չանցավ (${e.message}) — solid fallback`); c.fills = [solid(U(pressed ? "action/cashout-pressed-top" : "action/cashout-top"))]; }
      c.effects = disabled ? [] : [glow(U("action/cashout-glow"), 6, 22)];
    }
    if (kind === "Ghost") { c.fills = [solid(U(pressed ? "action/ghost-pressed" : "action/ghost"))]; c.strokes = [solid(U("action/ghost-border"))]; c.strokeAlign = "INSIDE"; c.setBoundVariable("strokeWeight", L("stroke/control")); }
    if (disabled) c.setBoundVariable("opacity", U("opacity/disabled"));
    /* icon slot (default թաքնված) + label */
    const icon = ICONS.Replay.createInstance(); icon.name = "icon"; icon.visible = false;
    c.appendChild(icon); bindAll(icon, ["width", "height"], L("size/icon"));
    const onVar = U({ Bet: "action/on-bet", Cashout: "action/on-cashout", Ghost: "action/on-ghost" }[kind]);
    for (const vec of icon.findAll((n) => Array.isArray(n.strokes) && n.strokes.length > 0)) vec.strokes = [solid(onVar)];
    const label = figma.createText(); label.name = "label";
    c.appendChild(label);
    await label.setTextStyleIdAsync(TS[size === "Large" ? "Button/Large" : "Button/Base"].id);
    label.characters = LABELS[kind];
    label.fills = [solid(onVar)];
    label.textAlignHorizontal = "CENTER";
    comps.push(c);
  }
  const cs = mark(figma.combineAsVariants(comps, page));
  cs.name = "Button";
  cs.description = "Bet (կանաչ, մուգ տեքստ 8.4:1) / Cashout (սաթե gradient) / Ghost («Keep Running»)։ Size = Button/Large | Button/Base։ Disabled = opacity/disabled։ Բոլոր fill/radius/padding/text-ը variable-կապած են։";
  /* grid. տող = Kind×Size, սյուն = State */
  const colW = 300, rowH = 110;
  for (const ch of cs.children) {
    const p = Object.fromEntries(ch.name.split(", ").map((s) => s.split("=")));
    ch.x = 40 + STATES.indexOf(p.State) * colW;
    ch.y = 40 + (KINDS.indexOf(p.Kind) * SIZES.length + SIZES.indexOf(p.Size)) * rowH;
  }
  cs.resizeWithoutConstraints(40 + STATES.length * colW, 40 + KINDS.length * SIZES.length * rowH);
  cs.x = nextX(page); cs.y = 0;
  /* properties */
  const labelKey = cs.addComponentProperty("Label", "TEXT", "Place Bet");
  const showKey = cs.addComponentProperty("Show icon", "BOOLEAN", false);
  const iconKey = cs.addComponentProperty("Icon", "INSTANCE_SWAP", ICONS.Replay.id);
  for (const ch of cs.children) {
    ch.findOne((n) => n.name === "label").componentPropertyReferences = { characters: labelKey };
    ch.findOne((n) => n.name === "icon").componentPropertyReferences = { visible: showKey, mainComponent: iconKey };
  }
  try {
    const key = Object.keys(cs.componentPropertyDefinitions).find((k) => k.startsWith("Icon"));
    cs.editComponentProperty(key, { preferredValues: Object.values(ICONS).map((c) => ({ type: "COMPONENT", key: c.key })) });
  } catch (e) { log(`! preferredValues չդրվեց (${e.message})`); }
  log(`Button: ${cs.children.length} variant (Kind×Size×State), props Label/Show icon/Icon`);
}

/* ---------- ՓՈՒԼ 5. Input (bet amount) ---------- */
const INPUT_STATES = ["Default", "Focus", "Error"];
async function phaseInput() {
  await loadVars(); await loadStyles();
  const page = await componentsPage();
  removeMine(page, "Input");
  const U = (n) => getVar("UI", n), L = (n) => getVar("Layout", n);
  const comps = [];
  for (const state of INPUT_STATES) {
    const c = mark(figma.createComponent());
    c.name = `State=${state}`;
    c.resize(240, 10); /* resize-ը ՆԱԽ — հետո sizing mode-երը (resize-ը FIXED ա դարձնում) */
    c.layoutMode = "VERTICAL"; c.primaryAxisSizingMode = "AUTO"; c.counterAxisSizingMode = "FIXED";
    c.fills = [];
    c.setBoundVariable("itemSpacing", L("gap/pills"));
    const label = figma.createText(); label.name = "label"; c.appendChild(label);
    await label.setTextStyleIdAsync(TS["Label/Caps"].id); label.characters = "BET AMOUNT"; label.fills = [solid(U("text/secondary"))];
    const field = figma.createFrame(); field.name = "field"; c.appendChild(field);
    field.layoutMode = "HORIZONTAL"; field.primaryAxisAlignItems = "SPACE_BETWEEN"; field.counterAxisAlignItems = "CENTER";
    field.primaryAxisSizingMode = "FIXED"; field.counterAxisSizingMode = "AUTO"; field.layoutSizingHorizontal = "FILL";
    bindAll(field, ["paddingTop", "paddingBottom"], L("pad/input-y")); bindAll(field, ["paddingLeft", "paddingRight"], L("pad/input-x"));
    field.setBoundVariable("minHeight", L("size/touch")); bindRadius(field, L("radius/control"));
    field.fills = [solid(U("surface/input"))]; field.strokeAlign = "INSIDE";
    const border = { Default: ["border/subtle", "stroke/hairline"], Focus: ["border/focus", "stroke/control"], Error: ["border/error", "stroke/control"] }[state];
    field.strokes = [solid(U(border[0]))]; field.setBoundVariable("strokeWeight", L(border[1]));
    if (state === "Focus") field.effects = [glow(U("action/cashout-glow"), 0, 12)];
    const value = figma.createText(); value.name = "value"; field.appendChild(value);
    await value.setTextStyleIdAsync(TS["Amount"].id); value.characters = "1.00"; value.fills = [solid(U("text/primary"))];
    const unit = figma.createText(); unit.name = "unit"; field.appendChild(unit);
    await unit.setTextStyleIdAsync(TS["Label/Caps"].id); unit.characters = "USD"; unit.fills = [solid(U("text/secondary"))];
    const helper = figma.createText(); helper.name = "helper"; c.appendChild(helper);
    await helper.setTextStyleIdAsync(TS["Pill"].id);
    helper.characters = state === "Error" ? "Not enough balance" : "Min 0.10 · Max 1,000.00";
    helper.fills = [solid(U(state === "Error" ? "state/loss" : "text/secondary"))];
    comps.push(c);
  }
  const cs = mark(figma.combineAsVariants(comps, page));
  cs.name = "Input";
  cs.description = "Bet amount դաշտ։ Default (border/subtle 1px) / Focus (border/focus 2px + սաթե glow) / Error (border/error + state/loss helper)։ Touch target ≥48։";
  cs.children.forEach((ch, i) => { ch.x = 40 + i * 300; ch.y = 40; });
  cs.resizeWithoutConstraints(40 + INPUT_STATES.length * 300, 40 + cs.children[0].height + 40);
  cs.x = nextX(page); cs.y = 0;
  const keys = { label: cs.addComponentProperty("Label", "TEXT", "BET AMOUNT"), value: cs.addComponentProperty("Value", "TEXT", "1.00"), unit: cs.addComponentProperty("Unit", "TEXT", "USD"), helper: cs.addComponentProperty("Helper", "TEXT", "Min 0.10 · Max 1,000.00") };
  const showHelper = cs.addComponentProperty("Show helper", "BOOLEAN", true);
  for (const ch of cs.children) {
    for (const [n, k] of Object.entries(keys)) ch.findOne((x) => x.name === n).componentPropertyReferences = { characters: k };
    const h = ch.findOne((x) => x.name === "helper"); h.componentPropertyReferences = { characters: keys.helper, visible: showHelper };
  }
  log(`Input: ${cs.children.length} state, props Label/Value/Unit/Helper/Show helper`);
}

/* ---------- ՓՈՒԼ 6. Foundations doc բաժին ---------- */
async function phaseDocs() {
  await loadVars(); await loadStyles();
  const compPage = await componentsPage();
  const sets = Object.fromEntries(compPage.findAllWithCriteria({ types: ["COMPONENT_SET"] }).map((s) => [s.name, s]));
  const icons = compPage.findAllWithCriteria({ types: ["COMPONENT"] }).filter((c) => c.name.startsWith("Icon/"));
  const page = figma.root.children[0];
  await figma.setCurrentPageAsync(page);
  removeMine(page, "Components — v1");
  await figma.loadFontAsync({ family: "Inter", style: "Bold" }); await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  const U = (n) => getVar("UI", n);
  const doc = mark(figma.createFrame()); doc.name = "Components — v1";
  doc.resize(1100, 10);
  doc.layoutMode = "VERTICAL"; doc.itemSpacing = 32; doc.paddingTop = doc.paddingBottom = doc.paddingLeft = doc.paddingRight = 48;
  doc.primaryAxisSizingMode = "AUTO"; doc.counterAxisSizingMode = "FIXED";
  doc.fills = [solid(U("surface/panel"))]; doc.cornerRadius = 16;
  doc.x = nextX(page); doc.y = 0; page.appendChild(doc);
  const text = (chars, style, size, color) => { const t = figma.createText(); t.fontName = { family: "Inter", style }; t.fontSize = size; t.characters = chars; t.fills = [solid(U(color))]; doc.appendChild(t); t.layoutSizingHorizontal = "FILL"; t.textAutoResize = "HEIGHT"; return t; };
  text("Components — v1", "Bold", 32, "text/primary");
  text("Semantic token-ներից սնվող կիթ (T-0012)։ Primitives → hidden. UI/Layout/Type semantic → միակ սպառվող շերտը. Text style-երը font/* variable-ներից են։ Աղբյուրը՝ tools/design/gen-tokens.mjs → figma-kit/code.js։", "Regular", 14, "text/secondary");
  const row = (title, nodes) => {
    text(title, "Bold", 18, "text/primary");
    const r = figma.createFrame(); r.name = title; r.layoutMode = "HORIZONTAL"; r.itemSpacing = 24; r.counterAxisAlignItems = "CENTER"; r.fills = []; r.primaryAxisSizingMode = "AUTO"; r.counterAxisSizingMode = "AUTO";
    doc.appendChild(r); r.layoutSizingHorizontal = "FILL"; /* wrap-ը fixed լայնություն ա ուզում → նախ FILL */
    r.layoutWrap = "WRAP"; r.counterAxisSpacing = 24;
    for (const n of nodes) r.appendChild(n.createInstance());
  };
  if (sets.Button) row("Button — Kind × Size (Default)", sets.Button.children.filter((c) => c.name.endsWith("State=Default")));
  if (sets.Button) row("Button — Pressed / Disabled (Bet)", sets.Button.children.filter((c) => c.name.startsWith("Kind=Bet, Size=Large") && !c.name.endsWith("Default")));
  if (sets.Input) row("Input — Default / Focus / Error", sets.Input.children);
  if (icons.length) row("Icons — 24 grid, icon/primary", icons);
  text("Կանոն. կոճակի տեքստը մուգ ա (action/on-bet, night/900) — սպիտակը green/500-ի վրա 2.3:1 էր, մոբայլում արևի տակ կորում ա։ Cashout-ը նույն սկզբունքն ա (amber/900)։ Touch target ≥48 (size/touch)։", "Regular", 13, "text/secondary");
  log(`Foundations: «Components — v1» doc frame`);
}

/* ---------- run ---------- */
async function main() {
  const cmd = figma.command || "all";
  const steps = { variables: phaseVariables, text: phaseTextStyles, icons: phaseIcons, button: phaseButton, input: phaseInput, docs: phaseDocs };
  const order = cmd === "all" ? Object.keys(steps) : [cmd];
  try {
    for (const s of order) { await steps[s](); }
    figma.notify(`Run Dady kit: ${order.join(" → ")} ✓`, { timeout: 4000 });
  } catch (e) {
    LOG.push(`✗ ${e.message}`);
    figma.notify(`Kit սխալ. ${e.message}`, { error: true, timeout: 8000 });
  }
  /* run report՝ Components էջի վրա, մեր մարկերով */
  try {
    const page = await componentsPage();
    removeMine(page, "Kit run report");
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    const t = mark(figma.createText()); t.name = "Kit run report"; t.fontName = { family: "Inter", style: "Regular" }; t.fontSize = 12;
    t.characters = `Run Dady kit — ${new Date().toISOString().slice(0, 16).replace("T", " ")}\n` + LOG.join("\n");
    t.x = 0; t.y = -200; page.appendChild(t);
  } catch (_) { /* report-ը ոչինչ չի կոտրում */ }
  figma.closePlugin();
}
main();
