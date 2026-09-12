/* Escort Gaming — token գեներատոր (մեկ ճշմարտություն → Figma + CSS)
 * Հիմնադրի պատվերը 2026-09-12. scalable համակարգ, որ հաջորդ խաղերը 0-ից չսկսվեն։
 *
 * Լոգիկան.
 *  - ԱՄԵՆ գույն = anchor (խաղից եկած ճշգրիտ արժեք) + մեքենայով գեներացված սանդղակ
 *    (50…900). anchor-ները ԵՐԲԵՔ չեն կլորացվում — սանդղակը լցվում ա դրանց շուրջ։
 *  - Spacing/radius/type = թվային սանդղակներ։
 *  - Semantic շերտը ԽԱՂԻ սեփականությունն ա ու միայն primitive-ների ա հղվում.
 *    նոր խաղ = նոր semantic քարտեզ, նույն primitives-ը։
 *
 * Run: node tools/design/gen-tokens.mjs   (գրում ա docs/design/tokens.json + tokens.css
 *      + tools/design/figma-kit/code.js — Figma plugin-ը, որ նույն token-ները տանում ա ֆայլ)
 *
 * v1.1 (Արեգ, 2026-09-12, T-0012). font semantic շերտ (font/<style>/…), lh սանդղակ,
 * կոմպոնենտային token-ներ (on-bet, ghost, input, icon, touch, disabled)։
 */
import { writeFileSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const R = dirname(dirname(dirname(fileURLToPath(import.meta.url)))); // repo root

/* ---------- գույնի գործիքներ ---------- */
const hx = (s) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16));
const st = (a) => "#" + a.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("").toUpperCase();
const mix = (a, b, t) => st(hx(a).map((v, i) => v + (hx(b)[i] - v) * t));

/* սանդղակի կանոնը. 500-ը բազան ա, ցածրերը՝ սպիտակի խառնուրդ, բարձրերը՝ սևի */
const LADDER = { 50: .92, 100: .84, 200: .66, 300: .48, 400: .26, 500: 0, 600: .18, 700: .34, 800: .52, 900: .68 };
function ramp(base, overrides = {}) {
  const out = {};
  for (const [stop, t] of Object.entries(LADDER))
    out[stop] = t === 0 ? base : mix(base, +stop < 500 ? "#FFFFFF" : "#000000", t);
  for (const [stop, v] of Object.entries(overrides)) out[stop] = v.toUpperCase(); // anchor-ները սուրբ են
  return out;
}

/* ---------- PRIMITIVES (ընդհանուր բոլոր խաղերի համար) ---------- */
const color = {
  /* anchor-ները՝ Run Dady-ի կոդից (index.html :root, tex.js) — ճշգրիտ, անփոփոխ */
  green: ramp("#2EC27E", { 300: "#3DDC91", 600: "#24A869", 700: "#22B573" }),
  amber: ramp("#F6A821", { 200: "#FFD27A", 300: "#FFC94D", 900: "#3A2600" }),
  red:   ramp("#FF4D4D", { 400: "#FF6B6B", 450: "#FF5D5D" }),
  navy:  ramp("#33405E", { 550: "#3C4966", 600: "#33405E", 650: "#2C374F", 700: "#242F49" }),
  night: ramp("#0E131B", { 800: "#0E131B", 900: "#0A0E14" }),
  white: { "": "#FFFFFF" },
};
const space  = { 1: 1, 2: 2, 4: 4, 6: 6, 8: 8, 10: 10, 12: 12, 14: 14, 16: 16, 20: 20, 22: 22, 24: 24, 32: 32, 48: 48 };
const radius = { sm: 6, md: 10, control: 12, chip: 16, pill: 999 };
const type = {
  family: { mono: "Roboto Mono", sans: "Inter", armenian: "Noto Sans Armenian",
            "mono-css": "ui-monospace, Menlo, Consolas, monospace" },
  size:   { 10: 10, 11: 11, 12: 12, 14: 14, 16: 16, 20: 20, 28: 28, 40: 40, 56: 56 },
  weight: { regular: 400, medium: 500, semibold: 600, bold: 700 },
  tracking: { tight: -2, base: 0.2, button: 0.5, caps: 2 },
  /* line-height՝ տոկոսով (Figma PERCENT), CSS-ում՝ unitless (1.2) */
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

/* ---------- SEMANTIC (Run Dady / Night) — միայն primitive հղումներ կամ rgba ---------- */
const rgba = (hex, a) => { const [r, g, b] = hx(hex); return `rgba(${r},${g},${b},${a})`; };
const semantic = {
  "action/bet": "{green/500}", "action/bet-pressed": "{green/600}",
  "action/bet-glow": rgba("#2EC27E", .35),
  "action/cashout-top": "{amber/300}", "action/cashout-bottom": "{amber/500}",
  "action/cashout-glow": rgba("#F6A821", .45), "action/on-cashout": "{amber/900}",
  "action/won-top": "{green/300}", "action/won-bottom": "{green/700}",
  "state/win": "{green/300}", "state/loss": "{red/400}",
  "state/caught": "{red/450}", "state/crash": "{red/500}",
  "text/primary": "{white}", "text/secondary": rgba("#FFFFFF", .5),
  "surface/panel": rgba("#0E131B", .92), "surface/pill": rgba("#0A0E14", .55),
  "surface/chip-top": "{navy/550}", "surface/chip-bottom": "{navy/650}",
  "surface/betrow-top": "{navy/600}", "surface/betrow-bottom": "{navy/700}",
  "border/subtle": rgba("#FFFFFF", .12), "brand/accent": "{amber/200}",
  /* v1.1 — կոմպոնենտային token-ներ (T-0012) */
  "action/on-bet": "{night/900}",                       /* մուգ տեքստ կանաչի վրա. 8.4:1 (սպիտակը 2.3:1 էր) */
  "action/cashout-pressed-top": "{amber/400}", "action/cashout-pressed-bottom": "{amber/600}",
  "action/ghost": rgba("#2EC27E", .08),                 /* «Keep Running» — index.html .lost #hold */
  "action/ghost-pressed": rgba("#2EC27E", .16),
  "action/ghost-border": "{green/500}", "action/on-ghost": "{green/300}",
  "text/placeholder": rgba("#FFFFFF", .35),
  "icon/primary": "{white}", "icon/secondary": rgba("#FFFFFF", .5),
  "surface/input": "{navy/700}", "border/focus": "{amber/200}", "border/error": "{red/400}",
  "opacity/disabled": 0.4,
  /* դասավորություն — կոդի իրական պադինգները */
  "pad/button-y": "{space/14}", "pad/button-x": "{space/22}",
  "pad/input-y": "{space/12}", "pad/input-x": "{space/16}",
  "pad/hud": "{space/16}", "gap/pills": "{space/6}", "gap/controls": "{space/8}", "gap/icon": "{space/8}",
  "size/icon": "{space/24}", "size/touch": "{space/48}",  /* touch target ≥44 — մոբայլ առաջինը */
  "stroke/hairline": "{space/1}", "stroke/control": "{space/2}",
};
/* font/<style>/… — text style-երի semantic շերտը */
for (const [name, s] of Object.entries(textStyles)) {
  const k = styleKey(name);
  semantic[`font/${k}/family`] = "{family/mono}";
  semantic[`font/${k}/size`] = `{size/${s.size}}`;
  semantic[`font/${k}/weight`] = `{weight/${s.weight}}`;
  semantic[`font/${k}/tracking`] = `{tracking/${s.tracking}}`;
  semantic[`font/${k}/lh`] = `{lh/${s.lh}}`;
}

/* ---------- resolve + emit ---------- */
const flat = {};
for (const [fam, stops] of Object.entries(color))
  for (const [stop, v] of Object.entries(stops)) flat[stop ? `${fam}/${stop}` : fam] = v;
for (const [k, v] of Object.entries(space)) flat[`space/${k}`] = v;
for (const [k, v] of Object.entries(radius)) flat[`radius/${k}`] = v;
for (const [g, m] of Object.entries(type))
  for (const [k, v] of Object.entries(m)) flat[`${g}/${k}`] = v;

const resolve = (v) => typeof v === "string" && v.startsWith("{") /* թիվ/rgba-ն ինքն իրեն ա */
  ? flat[v.slice(1, -1)] ?? (() => { throw new Error("bad ref " + v); })() : v;

const tokens = {
  $meta: { generated: new Date().toISOString().slice(0, 10), generator: "tools/design/gen-tokens.mjs",
           note: "Primitives՝ ընդհանուր Escort Gaming. semantic՝ Run Dady/Night" },
  primitives: flat,
  semantic: Object.fromEntries(Object.entries(semantic).map(([k, v]) => [k, { ref: v, value: resolve(v) }])),
  textStyles: Object.fromEntries(Object.keys(textStyles).map((n) => [n, `font/${styleKey(n)}`])),
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
  const val = typeof ref === "string" && ref.startsWith("{") ? `var(--eg-${cssName(ref.slice(1, -1))})` : value;
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
