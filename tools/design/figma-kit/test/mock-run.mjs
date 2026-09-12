/* Figma Plugin API-ի mock — kit-ի ամբողջական dry run առանց Figma-ի։
 * Ստուգում ա հոսքը, typo-ները, բոլոր setBoundVariable/props կանչերը։ Չի ստուգում render-ը։
 * Run: node tools/design/figma-kit/test/mock-run.mjs [command]
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import vm from "node:vm";

const D = dirname(fileURLToPath(import.meta.url));
let ids = 0;
const nid = () => `${++ids}:0`;
const calls = { bound: 0, paints: 0, effects: 0, props: 0 };

const VALID_NODE_FIELDS = new Set(["paddingTop", "paddingBottom", "paddingLeft", "paddingRight", "itemSpacing", "counterAxisSpacing", "minHeight", "maxHeight", "minWidth", "maxWidth", "width", "height", "opacity", "strokeWeight", "topLeftRadius", "topRightRadius", "bottomLeftRadius", "bottomRightRadius", "visible", "characters"]);
const VALID_TEXT_FIELDS = new Set(["fontFamily", "fontStyle", "fontSize", "fontWeight", "letterSpacing", "lineHeight", "paragraphSpacing", "paragraphIndent"]);

function node(type, extra = {}) {
  const n = {
    id: nid(), type, name: type, children: [], parent: null, x: 0, y: 0, width: 100, height: 40, visible: true,
    fills: [], strokes: [], effects: [], _pd: {}, boundVariables: {}, componentPropertyReferences: {},
    setPluginData(k, v) { this._pd[k] = v; }, getPluginData(k) { return this._pd[k] || ""; },
    appendChild(c) { if (c.parent) c.parent.children = c.parent.children.filter((x) => x !== c); c.parent = this; this.children.push(c); },
    remove() { if (this.parent) this.parent.children = this.parent.children.filter((x) => x !== this); this.removed = true; },
    resize(w, h) { this.width = w; this.height = h; }, resizeWithoutConstraints(w, h) { this.width = w; this.height = h; },
    findAll(fn) { const out = []; const walk = (x) => { for (const c of x.children) { if (fn(c)) out.push(c); walk(c); } }; walk(this); return out; },
    findOne(fn) { return this.findAll(fn)[0] || null; },
    findAllWithCriteria({ types }) { return this.findAll((c) => types.includes(c.type)); },
    setBoundVariable(field, v) {
      if (!VALID_NODE_FIELDS.has(field) && !VALID_TEXT_FIELDS.has(field)) throw new Error(`bad bind field ${field}`);
      if (!v || !v.id) throw new Error(`setBoundVariable(${field}) → variable չկա`);
      this.boundVariables[field] = v.id; calls.bound++;
    },
    async setTextStyleIdAsync(id) { if (!styles.find((s) => s.id === id)) throw new Error("bad style id"); this.textStyleId = id; },
    createInstance() { const i = node("INSTANCE"); i.name = this.name; i.mainComponent = this; for (const c of this.children) i.appendChild(clone(c)); page.current.appendChild(i); return i; },
    clone() { return clone(this); },
    ...extra,
  };
  return n;
}
function clone(n) { const c = node(n.type, {}); Object.assign(c, { name: n.name, fills: n.fills, strokes: n.strokes, x: n.x, y: n.y, width: n.width, height: n.height }); c.id = nid(); for (const ch of n.children) c.appendChild(clone(ch)); return c; }

/* ---- ֆայլի սկզբնական վիճակը (իրական inventory-ի ձևով) ---- */
const collections = [], variables = [], styles = [];
function mkCol(name, mode) { const c = { id: nid(), name, modes: [{ modeId: nid(), name: mode }], variableIds: [], renameMode(id, n) { this.modes[0].name = n; }, addMode() { throw new Error("in addMode: Limited to 1 modes only"); } }; collections.push(c); return c; }
function mkVar(name, col, type, value) {
  const v = { id: nid(), name, variableCollectionId: col.id, resolvedType: type, scopes: ["ALL_SCOPES"], codeSyntax: {}, valuesByMode: {}, hiddenFromPublishing: false,
    setValueForMode(m, val) { if (!col.modes.find((x) => x.modeId === m)) throw new Error("bad mode"); if (type === "COLOR" && (typeof val !== "object" || (!("r" in val) && val.type !== "VARIABLE_ALIAS"))) throw new Error(`COLOR var ${name} got ${JSON.stringify(val)}`); if (type === "FLOAT" && typeof val !== "number" && val.type !== "VARIABLE_ALIAS") throw new Error(`FLOAT var ${name} got ${JSON.stringify(val)}`); this.valuesByMode[m] = val; },
    setVariableCodeSyntax(p, s) { if (!/^var\(--/.test(s)) throw new Error(`bad css syntax ${s}`); this.codeSyntax[p] = s; } };
  if (value !== undefined) v.setValueForMode(col.modes[0].modeId, value);
  col.variableIds.push(v.id); variables.push(v); return v;
}
/* սկզբնական անունները v1.2-ի Figma անուններն են (T-0013-ից հետո ֆայլի իրական վիճակը) — v2.0 kit-ը
 * պիտի դրանք prev անունով գտնի ու ՏԵՂՈՒՄ վերանվանի, ոչ թե կրկնակի ստեղծի */
const P = mkCol("Primitives", "Value"), W = mkCol("World", "Value"), UI = mkCol("UI", "Night"), LAY = mkCol("Layout", "Value"), TY = mkCol("Type", "Value");
const col = { r: 0, g: 0, b: 0, a: 1 };
for (const n of ["Green/300", "Green/500", "Green/600", "Green/700", "Amber/200", "Amber/300", "Amber/500", "Amber/900", "Red/400", "Red/450", "Red/500", "Navy/550", "Navy/600", "Navy/650", "Navy/700", "Night/800", "Night/900", "White", "Green/50", "Green/100", "Alpha/Green/35"]) mkVar("Colors/" + n, P, "COLOR", col);
mkVar("world/sky-top", W, "COLOR", col);
for (const n of ["Colors/Action/Bet/Default", "Colors/Action/Bet/Pressed", "Colors/Action/Bet/Glow", "Colors/Action/Cashout/Top", "Colors/Action/Cashout/Bottom", "Colors/Action/Cashout/Glow", "Colors/Action/Cashout/On", "Colors/Global/Text/Primary", "Colors/Global/Text/Secondary", "Colors/Global/Frame/Panel", "Colors/Global/Border/Subtle", "Colors/Global/Shape/Accent", "Colors/Global/Frame/Segment Selected"]) mkVar(n, UI, "COLOR", col);
for (const [n, v] of [["Radius/Control", 12], ["Radius/Chip", 16], ["Radius/Pill", 999], ["Radius/Inner", 8], ["Spacing/6", 6], ["Spacing/8", 8], ["Spacing/12", 12], ["Spacing/16", 16], ["Padding/Button/Y", 14], ["Size/Chip", 40], ["Padding/Track", 4]]) mkVar(n, LAY, "FLOAT", v);
mkVar("Family/Mono", TY, "STRING", "Roboto Mono"); for (const [n, v] of [["Font Size/14", 14], ["Weight/Bold", 700], ["Tracking/Button", 0.5]]) mkVar(n, TY, "FLOAT", v);
const preIds = Object.fromEntries(variables.map((v) => [v.name, v.id])); /* in-place rename-ի ստուգման համար */
for (const n of ["Display/Multiplier", "Amount", "Button/Large", "Button/Base", "Pill", "Label/Caps"]) styles.push(mkStyle(n));
function mkStyle(name) { return { id: nid(), name, fontName: { family: "Roboto Mono", style: "Bold" }, fontSize: 14, boundVariables: {}, setBoundVariable(f, v) { if (!VALID_TEXT_FIELDS.has(f)) throw new Error(`bad text-style field ${f}`); if (!v) throw new Error("no var"); this.boundVariables[f] = v.id; calls.bound++; } }; }

const loadedFonts = new Set();
const fonts = [];
for (const s of ["Regular", "Medium", "SemiBold", "Bold"]) fonts.push({ fontName: { family: "Roboto Mono", style: s } });
for (const s of ["Regular", "Semi Bold", "Bold"]) fonts.push({ fontName: { family: "Inter", style: s } });

const pages = [node("PAGE", { name: "Foundations" })];
const page = { current: pages[0] };
const existing = node("FRAME"); existing.name = "Foundations"; existing.width = 1200; pages[0].appendChild(existing);

const requireFont = (fn) => { if (!loadedFonts.has(`${fn.family}/${fn.style}`)) throw new Error(`Cannot write to node with unloaded font "${fn.family} ${fn.style}"`); };
function createText() {
  const t = node("TEXT"); t.fontName = { family: "Inter", style: "Regular" }; t._chars = "";
  Object.defineProperty(t, "characters", { get() { return this._chars; }, set(v) { const st = styles.find((s) => s.id === this.textStyleId); requireFont(st ? st.fontName : this.fontName); this._chars = v; } });
  page.current.appendChild(t); return t;
}
const figma = {
  command: process.argv[2] || "all",
  root: { children: pages },
  get currentPage() { return page.current; },
  async setCurrentPageAsync(p) { page.current = p; },
  createPage() { if (pages.length >= 3) throw new Error("Starter plan: 3 pages"); const p = node("PAGE"); pages.push(p); return p; },
  createFrame() { const f = node("FRAME"); page.current.appendChild(f); return f; },
  createComponent() { const c = node("COMPONENT"); c.key = "key" + c.id; c.addComponentProperty = addProp; c.componentPropertyDefinitions = {}; page.current.appendChild(c); return c; },
  createText,
  createTextStyle() { const s = mkStyle("new"); styles.push(s); return s; },
  createNodeFromSvg(svg) { const f = node("FRAME"); const g = node("GROUP"); f.appendChild(g); const n = (svg.match(/<(path|circle)/g) || []).length; for (let i = 0; i < n; i++) { const v = node("VECTOR"); v.strokes = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }]; g.appendChild(v); } page.current.appendChild(f); return f; },
  combineAsVariants(comps, parent) { for (const c of comps) if (c.type !== "COMPONENT") throw new Error("combineAsVariants requires ComponentNodes"); const cs = node("COMPONENT_SET"); cs.componentPropertyDefinitions = {}; cs.addComponentProperty = addProp; cs.editComponentProperty = () => { calls.props++; }; for (const c of comps) cs.appendChild(c); parent.appendChild(cs); return cs; },
  async loadFontAsync(fn) { if (!fonts.find((f) => f.fontName.family === fn.family && f.fontName.style === fn.style)) throw new Error(`font not found ${fn.family} ${fn.style}`); loadedFonts.add(`${fn.family}/${fn.style}`); },
  async listAvailableFontsAsync() { return fonts; },
  async getLocalTextStylesAsync() { return styles; },
  variables: {
    async getLocalVariableCollectionsAsync() { return collections; },
    async getLocalVariablesAsync() { return variables; },
    createVariableCollection(name) { return mkCol(name, "Mode 1"); },
    createVariable(name, c, type) { if (typeof c === "string") c = collections.find((x) => x.id === c); if (!["COLOR", "FLOAT", "STRING", "BOOLEAN"].includes(type)) throw new Error("bad type"); return mkVar(name, c, type); },
    setBoundVariableForPaint(p, f, v) { if (p.type !== "SOLID") throw new Error("only SOLID"); if (!v || !v.id) throw new Error("paint bind: no var"); calls.paints++; return { ...p, boundVariables: { [f]: { type: "VARIABLE_ALIAS", id: v.id } } }; },
    setBoundVariableForEffect(e, f, v) { if (!v || !v.id) throw new Error("effect bind: no var"); calls.effects++; return { ...e, boundVariables: { [f]: { type: "VARIABLE_ALIAS", id: v.id } } }; },
  },
  notify(msg) { console.log("notify:", msg); },
  closePlugin() { console.log("closePlugin"); },
};
function addProp(name, type, def) { if (!["TEXT", "BOOLEAN", "INSTANCE_SWAP", "SLOT"].includes(type)) throw new Error("bad prop type"); const k = `${name}#${nid()}`; this.componentPropertyDefinitions[k] = { type, defaultValue: def }; calls.props++; return k; }

const code = readFileSync(join(D, "..", "code.js"), "utf8");
const ctx = vm.createContext({ figma, console, Date, JSON, Object, Array, Math, Error, parseInt, Promise, setTimeout });
await vm.runInContext(code + "\n;main;", ctx); /* main()-ը ֆայլում ա կանչվում */
await new Promise((r) => setTimeout(r, 50));

/* ---- assertions ---- */
const comp = pages.find((p) => p.name === "Atoms");
const report = comp && comp.children.find((n) => n.name === "Kit run report");
console.log("\n--- report ---\n" + (report ? report.characters : "(չկա)"));
const fail = (m) => { console.error("ASSERT FAIL:", m); process.exitCode = 1; };
if (!comp) fail("Atoms էջ չկա");
const sets = comp ? comp.findAllWithCriteria({ types: ["COMPONENT_SET"] }) : [];
const btn = sets.find((s) => s.name === "Button"), inp = sets.find((s) => s.name === "Input");
if (!btn || btn.children.length !== 18) fail("Button 18 variant չի");
if (!inp || inp.children.length !== 3) fail("Input 3 state չի");
if (btn && Object.keys(btn.componentPropertyDefinitions).length !== 3) fail("Button props ≠ 3");
const icons = comp ? comp.findAllWithCriteria({ types: ["COMPONENT"] }).filter((c) => c.name.startsWith("Icon/")) : [];
if (icons.length !== 7) fail("Icons ≠ 7");
for (const s of styles.slice(0, 6)) for (const f of ["fontFamily", "fontSize", "fontWeight", "letterSpacing", "lineHeight"]) if (!s.boundVariables[f]) fail(`${s.name} ${f} չկապված`);
const prim = variables.filter((v) => v.variableCollectionId === P.id);
if (prim.some((v) => v.scopes.length)) fail("primitive scopes ≠ []");
const onBet = variables.find((v) => v.name === "Colors/Button/Bet/Content"); if (!onBet || Object.values(onBet.valuesByMode)[0].type !== "VARIABLE_ALIAS") fail("Colors/Button/Bet/Content alias չի");
/* v2.0 միգրացիա. v1.2 անուն չպիտի մնա, ID-ն պիտի նույնը լինի (in-place rename, ոչ կրկնակի) */
const TOK = JSON.parse(readFileSync(join(D, "..", "..", "..", "..", "docs", "design", "tokens.json"), "utf8"));
const oldNames = new Set(Object.values(TOK.figma.prev));
const stale = variables.filter((v) => oldNames.has(v.name) && v.variableCollectionId !== W.id);
if (stale.length) fail("հին (v1.2, չվերանվանված) անուն մնաց՝ " + stale.map((v) => v.name).join(","));
if (variables.some((v) => /^[a-z]+\/[a-z0-9-]+$/.test(v.name) && v.variableCollectionId !== W.id)) fail("v1.1 հում բանալի մնաց");
for (const [nw, old] of Object.entries(TOK.figma.prev)) if (preIds[old]) { const v = variables.find((x) => x.name === nw); if (!v || v.id !== preIds[old]) fail(`${old} → ${nw} rename-ը ID չպահեց`); }
for (const n of ["Number/12", "Dimensions/Global/Radius/Lg", "Dimensions/Radius/Button/Button", "Colors/Segment/Background-Selected", "Colors/Chip/Background-Selected"]) if (!variables.find((v) => v.name === n)) fail(`${n} չկա`);
const semRaw = variables.filter((v) => [UI.id, LAY.id, TY.id].includes(v.variableCollectionId) && v.resolvedType === "COLOR" && Object.values(v.valuesByMode)[0].type !== "VARIABLE_ALIAS");
if (semRaw.length) fail("semantic raw color (alias չի)՝ " + semRaw.map((v) => v.name).join(","));
const layRaw = variables.filter((v) => v.variableCollectionId === LAY.id && !v.name.startsWith("Number/") && Object.values(v.valuesByMode)[0].type !== "VARIABLE_ALIAS");
if (layRaw.length) fail("Layout semantic-ը Number pool-ի alias չի՝ " + layRaw.map((v) => v.name).join(","));
const numVis = variables.filter((v) => v.name.startsWith("Number/") && (v.scopes.length || !v.hiddenFromPublishing));
if (numVis.length) fail("Number pool-ը hidden/scopes [] չի");
if (variables.some((v) => v.scopes.includes("ALL_SCOPES") && v.variableCollectionId !== W.id)) fail("ALL_SCOPES մնաց");
const noDesc = variables.filter((v) => [UI.id, LAY.id, TY.id].includes(v.variableCollectionId) && !v.hiddenFromPublishing && !v.description);
if (noDesc.length) fail("semantic առանց description՝ " + noDesc.length);
const hard = btn ? btn.findAll((n) => Array.isArray(n.fills) && n.fills.some((p) => p.type === "SOLID" && !p.boundVariables)) : [];
if (hard.length) fail(`hardcoded SOLID fill՝ ${hard.map((n) => n.name).join(",")}`);
const doc = pages[0].children.find((n) => n.name === "Components — v1"); if (!doc) fail("Foundations doc չկա");
console.log(`\ncollections=${collections.length} variables=${variables.length} styles=${styles.length} pages=${pages.length} bound=${calls.bound} paints=${calls.paints} effects=${calls.effects} props=${calls.props}`);
console.log(process.exitCode ? "MOCK RUN: FAIL" : "MOCK RUN: OK");
