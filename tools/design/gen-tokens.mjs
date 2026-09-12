/* Escort Gaming — token գեներատոր (մեկ ճշմարտություն → Figma + CSS)
 * Հիմնադրի պատվերը 2026-09-12. scalable համակարգ, որ հաջորդ խաղերը 0-ից չսկսվեն։
 *
 * Լոգիկան.
 *  - ԱՄԵՆ գույն = anchor-ներ (խաղից եկած ճշգրիտ արժեքներ) + մեքենայով լցված ամբողջական
 *    սանդղակ (50…900, night-ը՝ 0…900)։ anchor-ները ԵՐԲԵՔ չեն կլորացվում — սանդղակը
 *    կառուցվում ա անչորների ՇՈՒՐՋԸ, ոչ թե անչորը փոխվում ա սանդղակի տակ։
 *  - Spacing/radius/type = թվային սանդղակներ։
 *  - Semantic շերտը ԽԱՂԻ սեփականությունն ա ու ՄԻԱՅՆ primitive-ների ա հղվում (100% alias,
 *    ոչ մի raw hex/rgba). նոր խաղ = նոր semantic քարտեզ, նույն primitives-ը։
 *
 * Run: node tools/design/gen-tokens.mjs   (գրում ա docs/design/tokens.json + tokens.css
 *      + tools/design/figma-kit/code.js — Figma plugin-ը, որ նույն token-ները տանում ա ֆայլ)
 *
 * v1.1 (Արեգ, 2026-09-12, T-0012). font semantic շերտ (font/<style>/…), lh սանդղակ,
 * կոմպոնենտային token-ներ (on-bet, ghost, input, icon, touch, disabled)։
 * v1.2 (Արեգ, 2026-09-12, T-0013). ատոմիկ ramp v2 (anchor-ների արանքում ինտերպոլացիա),
 * alpha primitives (semantic-ը 100% alias), Figma անունները purpose-ով
 * (Colors/Global/Text/Primary…) — CSS անունները (--rd-… / --eg-…) ԱՆՓՈՓՈԽ, Bet պանելի
 * token-ներ (segment, difficulty, chip)։
 */
import { writeFileSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const R = dirname(dirname(dirname(fileURLToPath(import.meta.url)))); // repo root

/* ---------- գույնի գործիքներ ---------- */
const hx = (s) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16));
const st = (a) => "#" + a.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("").toUpperCase();
const mix = (a, b, t) => st(hx(a).map((v, i) => v + (hx(b)[i] - v) * t));
const rgba = (hex, a) => { const [r, g, b] = hx(hex); return `rgba(${r},${g},${b},${a})`; };

/* ramp v2 (T-0013). Stop-երը՝ 50…900 (+0 = սպիտակ, եթե zero). anchor-ը ֆիքսված կետ ա,
 * մնացած stop-երը երկու հարևան anchor-ների ԱՐԱՆՔՈՒՄ են ինտերպոլացվում. ծայրերից դուրս՝
 * վիրտուալ 0=#FFFFFF, 1000=#000000։ Լուսավոր կողմում ease (t^1.5), որ 50–300-ը
 * ռեֆերենսի Gray-ի պես բաց մնա (0=FFF, 100≈EDEFF3, 300≈BDC3CC)։ Off-grid anchor-ները
 * (450, 550, 650) մնում են որպես լրացուցիչ stop — կոդի արժեքներ են։ */
const STOPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
function ramp(anchors, { zero = false } = {}) {
  const A = Object.fromEntries(Object.entries(anchors).map(([k, v]) => [+k, v.toUpperCase()]));
  const keys = Object.keys(A).map(Number).sort((a, b) => a - b);
  const stops = [...new Set([...(zero ? [0] : []), ...STOPS, ...keys])].sort((a, b) => a - b);
  const out = {};
  for (const s of stops) {
    if (A[s]) { out[s] = A[s]; continue; }
    const lo = keys.filter((k) => k < s).pop(), hi = keys.find((k) => k > s);
    const [ls, lc] = lo === undefined ? [0, "#FFFFFF"] : [lo, A[lo]];
    const [hs, hc] = hi === undefined ? [1000, "#000000"] : [hi, A[hi]];
    let t = (s - ls) / (hs - ls);
    if (lo === undefined) t = Math.pow(t, 1.5);
    out[s] = mix(lc, hc, t);
  }
  return out;
}

/* ---------- PRIMITIVES (ընդհանուր բոլոր խաղերի համար) ---------- */
/* anchor-ները՝ Run Dady-ի կոդից (index.html :root, tex.js) — ճշգրիտ, անփոփոխ */
const ANCHOR = {
  green: { 300: "#3DDC91", 500: "#2EC27E", 600: "#24A869", 700: "#22B573" },
  amber: { 200: "#FFD27A", 300: "#FFC94D", 500: "#F6A821", 900: "#3A2600" },
  red:   { 400: "#FF6B6B", 450: "#FF5D5D", 500: "#FF4D4D" },
  navy:  { 550: "#3C4966", 600: "#33405E", 650: "#2C374F", 700: "#242F49" },
  night: { 800: "#0E131B", 900: "#0A0E14" },
};
const color = {
  green: ramp(ANCHOR.green),
  amber: ramp(ANCHOR.amber),
  red:   ramp(ANCHOR.red),
  navy:  ramp(ANCHOR.navy),
  night: ramp(ANCHOR.night, { zero: true }), /* night = մեր Gray. 0 = #FFFFFF (ռեֆերենսի Gray/0) */
  white: { "": "#FFFFFF" },                   /* = night/0. մնում ա հին binding-ների/--eg-white-ի համար */
  /* alpha primitives. base @ alpha — որ semantic-ը 100% alias լինի, ոչ մի raw rgba semantic-ում։
   * Միայն իրական սպառողներով (ուռճացում չկա). white-ը՝ տեքստ/եզրագիծ, night-ը՝ պանելների
   * հիմք (92-ը night/800-ի վրա ա, 55-ը night/900-ի — կոդի արժեքներն են), green/amber-ը՝ glow/ghost։ */
  alpha: {
    "white/12": rgba("#FFFFFF", .12), "white/35": rgba("#FFFFFF", .35), "white/50": rgba("#FFFFFF", .5),
    "night/92": rgba(ANCHOR.night[800], .92), "night/55": rgba(ANCHOR.night[900], .55),
    "green/8": rgba(ANCHOR.green[500], .08), "green/16": rgba(ANCHOR.green[500], .16), "green/35": rgba(ANCHOR.green[500], .35),
    "amber/45": rgba(ANCHOR.amber[500], .45),
  },
};
const space  = { 1: 1, 2: 2, 4: 4, 6: 6, 8: 8, 10: 10, 12: 12, 14: 14, 16: 16, 20: 20, 22: 22, 24: 24, 32: 32, 40: 40, 48: 48 };
const radius = { sm: 6, md: 10, control: 12, chip: 16, pill: 999 };
const type = {
  family: { mono: "Roboto Mono", sans: "Inter", armenian: "Noto Sans Armenian",
            "mono-css": "ui-monospace, Menlo, Consolas, monospace" },
  size:   { 10: 10, 11: 11, 12: 12, 14: 14, 16: 16, 20: 20, 28: 28, 40: 40, 56: 56 },
  weight: { regular: 400, medium: 500, semibold: 600, bold: 700 },
  tracking: { tight: -2, base: 0.2, button: 0.5, caps: 2 },
  /* line-height հարաբերակցություն (%)։ CSS primitives՝ unitless (1.2)։ font/<style>/lh semantic-ը
   * px ա (size × ratio) — Figma-ում variable-ին կապված lineHeight-ը ՄԻՇՏ px ա մեկնաբանվում,
   * PERCENT binding չկա (T-0012, իրական վազքով ստուգված) */
  lh: { tight: 100, snug: 120, base: 140 },
};

/* ---------- TEXT STYLES (Figma style-ի անունը → font/* semantic token-ներ) ----------
 * Ամեն style-ը ՄԻԱՅՆ font/<style>/{family,size,weight,tracking,lh} semantic-ներից ա սնվում,
 * դրանք էլ՝ Type primitives-ից։ Primitive-ից ուղիղ ոչ մի style չի սնվում (հիմնադրի կանոնը)։ */
const textStyles = {
  "Display/Multiplier": { size: 56, weight: "bold",     tracking: "tight",  lh: "tight" },
  "Amount":             { size: 20, weight: "bold",     tracking: "button", lh: "snug"  },
  "Button/Large":       { size: 16, weight: "semibold", tracking: "button", lh: "snug"  },
  "Button/Base":        { size: 14, weight: "semibold", tracking: "button", lh: "snug"  },
  "Pill":               { size: 12, weight: "bold",     tracking: "base",   lh: "snug"  },
  "Label/Caps":         { size: 12, weight: "regular",  tracking: "caps",   lh: "base"  },
};
const styleKey = (n) => n.toLowerCase().replace(/\//g, "-");

/* ---------- SEMANTIC (Run Dady / Night) — ՄԻԱՅՆ primitive հղումներ (թիվը՝ lh px, opacity) ---------- */
const semantic = {
  "action/bet": "{green/500}", "action/bet-pressed": "{green/600}",
  "action/bet-glow": "{alpha/green/35}",
  "action/cashout-top": "{amber/300}", "action/cashout-bottom": "{amber/500}",
  "action/cashout-glow": "{alpha/amber/45}", "action/on-cashout": "{amber/900}",
  "action/won-top": "{green/300}", "action/won-bottom": "{green/700}",
  "state/win": "{green/300}", "state/loss": "{red/400}",
  "state/caught": "{red/450}", "state/crash": "{red/500}",
  "text/primary": "{white}", "text/secondary": "{alpha/white/50}",
  "surface/panel": "{alpha/night/92}", "surface/pill": "{alpha/night/55}",
  "surface/chip-top": "{navy/550}", "surface/chip-bottom": "{navy/650}",
  "surface/betrow-top": "{navy/600}", "surface/betrow-bottom": "{navy/700}",
  "border/subtle": "{alpha/white/12}", "brand/accent": "{amber/200}",
  /* v1.1 — կոմպոնենտային token-ներ (T-0012) */
  "action/on-bet": "{night/900}",                       /* մուգ տեքստ կանաչի վրա. 8.4:1 (սպիտակը 2.3:1 էր) */
  "action/cashout-pressed-top": "{amber/400}", "action/cashout-pressed-bottom": "{amber/600}",
  "action/ghost": "{alpha/green/8}",                    /* «Keep Running» — index.html .lost #hold */
  "action/ghost-pressed": "{alpha/green/16}",
  "action/ghost-border": "{green/500}", "action/on-ghost": "{green/300}",
  "text/placeholder": "{alpha/white/35}",
  "icon/primary": "{white}", "icon/secondary": "{alpha/white/50}",
  "surface/input": "{navy/700}", "border/focus": "{amber/200}", "border/error": "{red/400}",
  "opacity/disabled": 0.4,
  /* v1.2 — Bet պանել (T-0013). segmented difficulty ընտրիչ + chip-եր */
  "surface/segment": "{navy/700}",                      /* segmented control-ի track (input-ի «փոսի» սկզբունքով) */
  "surface/segment-selected": "{navy/500}",             /* ընտրված segment՝ բարձրացած */
  "difficulty/easy": "{green/300}", "difficulty/medium": "{amber/200}", /* heat սանդղակ. կանաչ → դեղին → նարնջագույն → կարմիր */
  "difficulty/hard": "{amber/500}", "difficulty/expert": "{red/500}",
  /* դասավորություն — կոդի իրական պադինգները */
  "pad/button-y": "{space/14}", "pad/button-x": "{space/22}",
  "pad/input-y": "{space/12}", "pad/input-x": "{space/16}",
  "pad/hud": "{space/16}", "gap/pills": "{space/6}", "gap/controls": "{space/8}", "gap/icon": "{space/8}",
  "size/icon": "{space/24}", "size/touch": "{space/48}",  /* touch target ≥44 — մոբայլ առաջինը */
  "stroke/hairline": "{space/1}", "stroke/control": "{space/2}",
  /* v1.2 — Bet պանել */
  "pad/track": "{space/4}", "gap/segments": "{space/4}", "pad/segment-x": "{space/12}",
  "pad/chip-x": "{space/12}", "size/chip": "{space/40}", "gap/section": "{space/12}",
};
/* font/<style>/… — text style-երի semantic շերտը */
for (const [name, s] of Object.entries(textStyles)) {
  const k = styleKey(name);
  semantic[`font/${k}/family`] = "{family/mono}";
  semantic[`font/${k}/size`] = `{size/${s.size}}`;
  semantic[`font/${k}/weight`] = `{weight/${s.weight}}`;
  semantic[`font/${k}/tracking`] = `{tracking/${s.tracking}}`;
  /* px, ոչ alias. lh/<ratio> primitive-ը մնում ա որպես ratio-ի աղբյուր (CSS unitless) */
  semantic[`font/${k}/lh`] = Math.round(s.size * type.lh[s.lh] / 100);
}

/* ---------- FIGMA ԱՆՈՒՆՆԵՐ (purpose խմբեր, ռեֆերենսի Colors/Global/… ոճով) ----------
 * Token-ի բանալին (text/primary) = CSS անունն ա (--rd-text-primary) ու ԱՆՓՈՓՈԽ ա։ Figma-ում
 * նույն variable-ը purpose-ով խմբավորված անուն ա կրում. kit-ը վերանվանում ա ՏԵՂՈՒՄ (ID-ն
 * նույնը → binding-ները չեն կոտրվում)։ Global = ընդհանուր UI (Frame/Shape/Text/Border/Icon),
 * Action/State/Surface/Difficulty = խաղային շերտ։ */
const ABBR = { sm: "SM", md: "MD", hud: "HUD", css: "CSS" };
const cap = (s) => s.split("-").map((w) => ABBR[w] || w[0].toUpperCase() + w.slice(1)).join(" ").replace(/ (X|Y)$/, "/$1"); /* button-y → Button/Y */
const FIG = {
  "surface/panel": "Colors/Global/Frame/Panel", "surface/pill": "Colors/Global/Frame/Pill",
  "surface/input": "Colors/Global/Frame/Input", "surface/segment": "Colors/Global/Frame/Segment",
  "surface/segment-selected": "Colors/Global/Frame/Segment Selected",
  "surface/chip-top": "Colors/Surface/Chip/Top", "surface/chip-bottom": "Colors/Surface/Chip/Bottom",
  "surface/betrow-top": "Colors/Surface/Bet Row/Top", "surface/betrow-bottom": "Colors/Surface/Bet Row/Bottom",
  "brand/accent": "Colors/Global/Shape/Accent",
  "action/bet": "Colors/Action/Bet/Default", "action/bet-pressed": "Colors/Action/Bet/Pressed",
  "action/bet-glow": "Colors/Action/Bet/Glow", "action/on-bet": "Colors/Action/Bet/On",
  "action/cashout-top": "Colors/Action/Cashout/Top", "action/cashout-bottom": "Colors/Action/Cashout/Bottom",
  "action/cashout-pressed-top": "Colors/Action/Cashout/Pressed Top", "action/cashout-pressed-bottom": "Colors/Action/Cashout/Pressed Bottom",
  "action/cashout-glow": "Colors/Action/Cashout/Glow", "action/on-cashout": "Colors/Action/Cashout/On",
  "action/won-top": "Colors/Action/Won/Top", "action/won-bottom": "Colors/Action/Won/Bottom",
  "action/ghost": "Colors/Action/Ghost/Default", "action/ghost-pressed": "Colors/Action/Ghost/Pressed",
  "action/ghost-border": "Colors/Action/Ghost/Border", "action/on-ghost": "Colors/Action/Ghost/On",
  "opacity/disabled": "Opacity/Disabled",
};
const PREFIX = { "text/": "Colors/Global/Text/", "icon/": "Colors/Global/Icon/", "border/": "Colors/Global/Border/",
                 "state/": "Colors/State/", "difficulty/": "Colors/Difficulty/" };
const GROUP = { pad: "Padding", gap: "Gap", size: "Size", stroke: "Stroke", radius: "Radius", space: "Spacing",
                family: "Family", weight: "Weight", tracking: "Tracking", lh: "Line Height", font: "Font", alpha: "Colors/Alpha" };
function figmaName(key) {
  if (FIG[key]) return FIG[key];
  for (const [p, g] of Object.entries(PREFIX)) if (key.startsWith(p)) return g + cap(key.slice(p.length));
  const [g, ...rest] = key.split("/");
  if (g in ANCHOR || g === "white") return ["Colors", cap(g), ...rest].join("/");
  if (g === "alpha") return ["Colors/Alpha", cap(rest[0]), rest[1]].join("/");
  if (g === "size" && rest.length === 1 && /^\d+$/.test(rest[0])) return `Font Size/${rest[0]}`; /* Type primitive ≠ Layout size/icon */
  return [GROUP[g] ?? cap(g), ...rest.map(cap)].join("/");
}

/* ---------- resolve + emit ---------- */
const flat = {};
for (const [fam, stops] of Object.entries(color))
  for (const [stop, v] of Object.entries(stops)) flat[stop ? `${fam}/${stop}` : fam] = v;
for (const [k, v] of Object.entries(space)) flat[`space/${k}`] = v;
for (const [k, v] of Object.entries(radius)) flat[`radius/${k}`] = v;
for (const [g, m] of Object.entries(type))
  for (const [k, v] of Object.entries(m)) flat[`${g}/${k}`] = v;

const resolve = (v) => typeof v === "string" && v.startsWith("{") /* թիվը ինքն իրեն ա */
  ? flat[v.slice(1, -1)] ?? (() => { throw new Error("bad ref " + v); })() : v;
for (const v of Object.values(semantic)) if (typeof v === "string" && !v.startsWith("{")) throw new Error("semantic raw value: " + v); /* 100% alias կանոնը */

const figmaNames = {};
for (const k of Object.keys(flat)) figmaNames[k] = figmaName(k);
for (const k of Object.keys(semantic)) figmaNames[k] = figmaName(k);
{ const seen = new Map(); for (const [k, n] of Object.entries(figmaNames)) { /* Figma անունը կոլեկցիայի մեջ եզակի պիտի լինի */
  const key = (k.startsWith("font/") || /^(family|size|weight|tracking|lh)\//.test(k) ? "T:" : /^(pad|gap|stroke|radius|space)\/|^size\//.test(k) ? "L:" : k.startsWith("opacity/") || k.split("/")[0] in { action: 1, state: 1, text: 1, surface: 1, border: 1, brand: 1, icon: 1, difficulty: 1 } ? "U:" : "P:") + n;
  if (seen.has(key)) throw new Error(`Figma անվան բախում. ${seen.get(key)} ↔ ${k} → ${n}`); seen.set(key, k); } }

const tokens = {
  $meta: { generated: new Date().toISOString().slice(0, 10), generator: "tools/design/gen-tokens.mjs",
           note: "Primitives՝ ընդհանուր Escort Gaming. semantic՝ Run Dady/Night. figmaNames՝ Figma-ի purpose անունները (CSS անունը բանալին ա)" },
  primitives: flat,
  semantic: Object.fromEntries(Object.entries(semantic).map(([k, v]) => [k, { ref: v, value: resolve(v) }])),
  textStyles: Object.fromEntries(Object.keys(textStyles).map((n) => [n, `font/${styleKey(n)}`])),
  figmaNames,
};
writeFileSync(join(R, "docs/design/tokens.json"), JSON.stringify(tokens, null, 2) + "\n");

/* CSS. --eg-* primitives (Escort Gaming) + --rd-* semantic (Run Dady) + հին --ui-* alias-ներ */
const cssName = (k) => k.replace(/\//g, "-").toLowerCase();
const unit = (k, v) => k.startsWith("lh/") ? v / 100
  : typeof v === "number" && !/weight|^type/.test(k) && !k.startsWith("family") ? v + "px" : v;
let css = "/* ԳԵՆԵՐԱՑՎԱԾ ա tools/design/gen-tokens.mjs-ից — ձեռքով ՉԽՄԲԱԳՐԵԼ */\n:root {\n";
for (const [k, v] of Object.entries(flat))
  css += `  --eg-${cssName(k)}: ${k.startsWith("family") ? `"${v}"` : unit(k, v)};\n`;
css += "\n";
for (const [k, { ref, value }] of Object.entries(tokens.semantic)) {
  const val = typeof ref === "string" && ref.startsWith("{") ? `var(--eg-${cssName(ref.slice(1, -1))})`
    : k.endsWith("/lh") ? `${value}px` : value;
  css += `  --rd-${cssName(k)}: ${val};\n`;
}
css += `
  /* հին անունները (index.html) — alias, որ ոչինչ չկոտրվի */
  --ui-betc: var(--rd-action-bet); --ui-betc-dn: var(--rd-action-bet-pressed);
  --ui-betc-glow: var(--rd-action-bet-glow);
  --ui-runc: var(--rd-action-bet); --ui-runc-dn: var(--rd-action-bet-pressed);
  --ui-runc-glow: var(--rd-action-bet-glow);
  --ui-btnt: var(--rd-text-primary);
  --ui-coc1: var(--rd-action-cashout-top); --ui-coc2: var(--rd-action-cashout-bottom);
  --ui-coc-glow: var(--rd-action-cashout-glow);
  --ui-rad: var(--eg-radius-control);
}
`;
writeFileSync(join(R, "docs/design/tokens.css"), css);

/* Figma plugin. code.js = TOKENS + kit.src.js (Plugin API-ն նույնն ա, ինչ MCP use_figma-ն,
 * բայց quota չկա. հիմնադիրը Figma-ում ինքն ա վազեցնում — tools/design/figma-kit/README.md) */
const kitDir = join(R, "tools/design/figma-kit");
const kitSrc = readFileSync(join(kitDir, "kit.src.js"), "utf8");
writeFileSync(join(kitDir, "code.js"),
  `/* ԳԵՆԵՐԱՑՎԱԾ ա tools/design/gen-tokens.mjs-ից — ձեռքով ՉԽՄԲԱԳՐԵԼ, խմբագրի kit.src.js-ը */\n` +
  `const TOKENS = ${JSON.stringify(tokens)};\n` + kitSrc);
console.log(`tokens.json: ${Object.keys(flat).length} primitives + ${Object.keys(semantic).length} semantic; figma-kit/code.js գրվեց`);
