/* Escort Gaming — token գեներատոր (մեկ ճշմարտություն → CSS + JS + Figma + DTCG)
 * Հիմնադրի պատվերը 2026-09-12. scalable համակարգ, որ հաջորդ խաղերը 0-ից չսկսվեն։
 *
 * Լոգիկան.
 *  - ԱՄԵՆ գույն = anchor-ներ (խաղից եկած ճշգրիտ արժեքներ) + մեքենայով լցված ամբողջական
 *    սանդղակ (50…900, night-ը՝ 0…900)։ anchor-ները ԵՐԲԵՔ չեն կլորացվում — սանդղակը
 *    կառուցվում ա անչորների ՇՈՒՐՋԸ, ոչ թե անչորը փոխվում ա սանդղակի տակ։
 *  - Չափերը = ՄԵԿ թվային pool (number/<n>). radius, padding, gap, height — բոլորը դրանից։
 *  - Semantic շերտը ԽԱՂԻ սեփականությունն ա ու ՄԻԱՅՆ primitive-ների ա հղվում (100% alias,
 *    ոչ մի raw hex/rgba). նոր խաղ = նոր semantic քարտեզ, նույն primitives-ը։
 *  - Semantic-ը ԿՈՄՊՈՆԵՆՏ-SCOPED ա, բոլորը նույն կաղապարով (հիմնադրի Fun Builder մոդելը,
 *    docs/design/architecture.md §5). բանալին՝
 *        <component>[/<variant|part>]/<slot>[-<axis|size>][-<state>]
 *    slot բառարան՝ bg fg border glow h w size pad gap radius (ուրիշ բառ = error),
 *    axis՝ top bottom x y, size՝ sm md lg, state՝ pressed selected focus error (hover-ը
 *    բառարանում ա, բայց ՉԻ գեներացվում — մոբայլում չկա, Տիգրան dev.md 09-12)։
 *    Default-ը suffix չունի, Disabled-ը գույն չունի (opacity/disabled)։
 *    Global խմբեր (կոմպոնենտից դուրս)՝ text icon border shape state · space radius stroke size։
 *
 * Արտադրանք (Run: node tools/design/gen-tokens.mjs).
 *  docs/design/tokens.json        flat (kit-ի ու MCP-ի համար)
 *  docs/design/tokens.css         --eg-* primitives + --rd-* semantic + legacy alias-ներ
 *  docs/design/tokens.dtcg.json   W3C DTCG / Tokens Studio (հիմնադրի ձևաչափը), count-check
 *  prototype/pixi-feel/src/tokens.js   ESM nested frozen object (Pixi-ի համար. 0xRRGGBB, {color,alpha})
 *  prototype/pixi-feel/index.html      splice «@tokens … @/tokens» CSS-comment marker-ների արանքում (եթե կան)
 *  tools/design/figma-kit/code.js      Figma plugin (TOKENS + kit.src.js)
 *
 * v1.1 (T-0012) font semantic, lh, կոմպոնենտային token-ներ · v1.2 (T-0013) ramp v2, alpha
 * primitives, Figma purpose անուններ, Bet պանել · v2.0 (Արեգ, 2026-09-12, T-0014) Fun Builder
 * կաղապար. number pool, կոմպոնենտ-scoped semantic + state suffix, slot բառարան, JS մոդուլ,
 * DTCG export, legacy alias-ներ (--rd-action-* → T-0010-ից հետո ջնջվում են)։
 */
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const R = dirname(dirname(dirname(fileURLToPath(import.meta.url)))); // repo root
const log = [];

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
/* anchor-ները՝ Run Dady-ի կոդից (index.html :root, tex.js) — ճշգրիտ, անփոփոխ, ՍՈՒՐԲ */
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
/* ՄԵԿ թվային pool (Fun Builder-ի Dimension/Numbers սկզբունքը). թիվն ինքնին ոչինչ չի «նշանակում» —
 * 8-ը radius ա, gap ա, padding ա՝ կախված semantic-ից։ ՄԻ ՏԵՂ ա հայտարարվում, semantic-ը
 * {number/<n>} ա հղում, չգոյություն ունեցող թիվը error ա (Տիգրանի պայմանը)։ 999 = pill (100-ը ոչ)։
 * Font size-երը ԱՅՍՏԵՂ ՉԵՆ — Type-ի մեջ են (Fun Builder-ում էլ առանձին են)։ */
const NUMBER = [0, 1, 2, 4, 6, 8, 10, 12, 14, 16, 20, 22, 24, 32, 40, 48, 999];
const type = {
  family: { mono: "Roboto Mono", sans: "Inter", armenian: "Noto Sans Armenian",
            "mono-css": "ui-monospace, Menlo, Consolas, monospace" },
  size:   { 10: 10, 11: 11, 12: 12, 14: 14, 16: 16, 20: 20, 28: 28, 40: 40, 56: 56 },
  weight: { regular: 400, medium: 500, semibold: 600, bold: 700 },
  tracking: { tight: -2, base: 0.2, button: 0.5, caps: 2 },
  /* line-height հարաբերակցություն (%)։ CSS primitives՝ unitless (1.2), գեներատորի բազմապատկիչն ա։
   * font/<style>/lh semantic-ը px ա (size × ratio) — ՄԻԱԿ semantic lh-ն (Տիգրան, հարց 6).
   * Figma-ում variable-ին կապված lineHeight-ը ՄԻՇՏ px ա, PERCENT binding չկա (T-0012) */
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

/* ---------- SEMANTIC (Run Dady / Night) — կոմպոնենտ-scoped, ՄԻԱՅՆ primitive հղումներ ----------
 * Կաղապարը ամեն կոմպոնենտի համար ՆՈՒՅՆՆ ա (architecture.md §5.3). գույներ bg/fg/border/glow
 * [-axis][-state], չափեր h/w/size/pad/gap/radius։ Արժեքները նույնիսկ համընկնելիս ԱՌԱՆՁԻՆ token
 * են (Button-ի radius-ը փոխելը Field-ին չի կպնում — հիմնադրի կանոնը)։
 * Բացառություն semantic-ում՝ font/<style>/lh (px թիվ) ու opacity/* (0–1) — alias չեն։ */
const semantic = {
  /* Button. variant-ները bet (կանաչ, Place Bet / Run) · cashout (սաթե gradient) · won (cashout-ի
   * հաղթած վիճակի gradient) · ghost («Keep Running», #betmorph.lost)։ Կոդում ՄԵԿ element ա
   * մորֆում — variant-ը token-ի 2-րդ դիրքում ա, ոչ suffix (Տիգրան, dev.md հարց 5)։ */
  "button/bet/bg": "{green/500}", "button/bet/bg-pressed": "{green/600}",
  "button/bet/fg": "{night/900}",                       /* մուգ տեքստ կանաչի վրա. 8.4:1 (սպիտակը 2.3:1 էր) */
  "button/bet/glow": "{alpha/green/35}",
  "button/cashout/bg-top": "{amber/300}", "button/cashout/bg-bottom": "{amber/500}",
  "button/cashout/bg-top-pressed": "{amber/400}", "button/cashout/bg-bottom-pressed": "{amber/600}",
  "button/cashout/fg": "{amber/900}", "button/cashout/glow": "{alpha/amber/45}",
  "button/won/bg-top": "{green/300}", "button/won/bg-bottom": "{green/700}",
  "button/ghost/bg": "{alpha/green/8}", "button/ghost/bg-pressed": "{alpha/green/16}",
  "button/ghost/border": "{green/500}", "button/ghost/fg": "{green/300}",
  "button/border-focus": "{amber/200}",                 /* :focus-visible ring, desktop keyboard (Space = hold) */
  "button/h-lg": "{number/48}", "button/h-md": "{number/40}", /* Lg = Button/Large (touch ≥48), Md = Button/Base */
  "button/pad-x": "{number/22}", "button/pad-y": "{number/14}",
  "button/gap": "{number/8}", "button/radius": "{number/12}",

  /* Field (bet amount դաշտ). part-եր՝ label (BET AMOUNT), placeholder, helper (Min/Max, error) */
  "field/bg": "{navy/700}", "field/fg": "{white}",
  "field/border": "{alpha/white/12}", "field/border-focus": "{amber/200}", "field/border-error": "{red/400}",
  "field/glow-focus": "{alpha/amber/45}",               /* focus-ի սաթե glow (kit՝ Input/Focus) */
  "field/label/fg": "{alpha/white/50}", "field/placeholder/fg": "{alpha/white/35}",
  "field/helper/fg": "{alpha/white/50}", "field/helper/fg-error": "{red/400}",
  "field/h": "{number/48}", "field/pad-x": "{number/16}", "field/pad-y": "{number/12}",
  "field/gap": "{number/6}", "field/radius": "{number/12}",

  /* Chip (½ / 2× / Max). pressed = bet-row gradient, selected = բարձրացած fill + accent եզրագիծ */
  "chip/bg-top": "{navy/550}", "chip/bg-bottom": "{navy/650}",
  "chip/bg-top-pressed": "{navy/600}", "chip/bg-bottom-pressed": "{navy/700}",
  "chip/bg-selected": "{navy/500}", "chip/border-selected": "{amber/200}", "chip/fg": "{white}",
  "chip/h": "{number/40}", "chip/pad-x": "{number/12}", "chip/radius": "{number/8}", /* 8 = field 12 − inset 4 (concentric) */

  /* Bet Row (chip-երի շարքը դաշտի մեջ). pad = chip inset դաշտի եզրից */
  "bet-row/bg-top": "{navy/600}", "bet-row/bg-bottom": "{navy/700}",
  "bet-row/pad": "{number/4}", "bet-row/gap": "{number/8}",

  /* Segment (difficulty ընտրիչի բջիջ). part-եր՝ track (փոսը), dot (heat կետ) */
  "segment/bg-pressed": "{navy/600}", "segment/bg-selected": "{navy/500}",
  "segment/fg": "{alpha/white/50}", "segment/fg-selected": "{white}",
  "segment/track/bg": "{navy/700}",
  "segment/h": "{number/40}", "segment/pad-x": "{number/8}", /* 390 պանել → 4 × 85px */
  "segment/gap": "{number/8}", "segment/radius": "{number/8}", /* 8 = track 12 − pad 4 */
  "segment/track/pad": "{number/4}", "segment/track/gap": "{number/4}", "segment/track/radius": "{number/12}",
  "segment/dot/size": "{number/8}",

  /* Difficulty heat. variant = մակարդակ, bg = կետի/glow-ի գույնը. կանաչ → դեղին → նարնջագույն → կարմիր */
  "difficulty/easy/bg": "{green/300}", "difficulty/medium/bg": "{amber/200}",
  "difficulty/hard/bg": "{amber/500}", "difficulty/expert/bg": "{red/500}",

  /* Panel (HUD). part-եր՝ pill (պատմության pill-եր), section (Bet Amount → Difficulty → Bet), controls */
  "panel/bg": "{alpha/night/92}", "panel/pill/bg": "{alpha/night/55}",
  "panel/pad": "{number/16}", "panel/radius": "{number/16}",
  "panel/section/gap": "{number/12}", "panel/controls/gap": "{number/8}", "panel/pill/gap": "{number/6}",
  "panel/balance/gap": "{number/2}",                    /* HUD balance՝ label ↔ գումար (Screens/Mobile header) */

  /* Global — կոմպոնենտից դուրս սպառողներ (ազատ տեքստ, HUD-ի հաշվիչ, doc frame-եր) */
  "text/primary": "{white}", "text/secondary": "{alpha/white/50}", "text/placeholder": "{alpha/white/35}",
  "icon/primary": "{white}", "icon/secondary": "{alpha/white/50}",
  "border/subtle": "{alpha/white/12}", "border/focus": "{amber/200}", "border/error": "{red/400}",
  "shape/accent": "{amber/200}",
  "state/win": "{green/300}", "state/loss": "{red/400}", "state/caught": "{red/450}", "state/crash": "{red/500}",
  "space/xs": "{number/4}", "space/sm": "{number/8}", "space/md": "{number/12}", "space/lg": "{number/16}", "space/xl": "{number/24}",
  "radius/xs": "{number/6}", "radius/sm": "{number/8}", "radius/md": "{number/10}", "radius/lg": "{number/12}", "radius/xl": "{number/16}", "radius/pill": "{number/999}",
  "stroke/hairline": "{number/1}", "stroke/control": "{number/2}",
  "size/icon": "{number/24}", "size/touch": "{number/48}",  /* touch target ≥44 — մոբայլ առաջինը */
  "opacity/disabled": 0.4,                                    /* disabled = opacity, ոչ palette */
};
/* font/<style>/… — text style-երի semantic շերտը */
for (const [name, s] of Object.entries(textStyles)) {
  const k = styleKey(name);
  semantic[`font/${k}/family`] = "{family/mono}";
  semantic[`font/${k}/size`] = `{size/${s.size}}`;
  semantic[`font/${k}/weight`] = `{weight/${s.weight}}`;
  semantic[`font/${k}/tracking`] = `{tracking/${s.tracking}}`;
  semantic[`font/${k}/lh`] = Math.round(s.size * type.lh[s.lh] / 100); /* px, ոչ alias */
}

/* ---------- LEGACY (v1.2 բանալի → v2.0 բանալի) ----------
 * CSS-ում հին --rd-* անունը alias ա մնում canonical-ի վրա, մինչև T-0010-ի review-ն անցնի
 * (Տիգրան. «v2.0 → T-0010 → legacy ջնջում»)։ Figma-ում հին variable-ը ՏԵՂՈՒՄ ա վերանվանվում
 * (ID նույնը, binding-ները ողջ)։ Չփոխված բանալիները (text/*, icon/*, border/*, state/*,
 * stroke/*, size/icon, size/touch, opacity/*, font/*) էստեղ ՉԵՆ։ */
const LEGACY = {
  "action/bet": "button/bet/bg", "action/bet-pressed": "button/bet/bg-pressed", "action/bet-glow": "button/bet/glow", "action/on-bet": "button/bet/fg",
  "action/cashout-top": "button/cashout/bg-top", "action/cashout-bottom": "button/cashout/bg-bottom",
  "action/cashout-pressed-top": "button/cashout/bg-top-pressed", "action/cashout-pressed-bottom": "button/cashout/bg-bottom-pressed",
  "action/cashout-glow": "button/cashout/glow", "action/on-cashout": "button/cashout/fg",
  "action/won-top": "button/won/bg-top", "action/won-bottom": "button/won/bg-bottom",
  "action/ghost": "button/ghost/bg", "action/ghost-pressed": "button/ghost/bg-pressed", "action/ghost-border": "button/ghost/border", "action/on-ghost": "button/ghost/fg",
  "surface/panel": "panel/bg", "surface/pill": "panel/pill/bg", "surface/input": "field/bg",
  "surface/chip-top": "chip/bg-top", "surface/chip-bottom": "chip/bg-bottom",
  "surface/betrow-top": "bet-row/bg-top", "surface/betrow-bottom": "bet-row/bg-bottom",
  "surface/segment": "segment/track/bg", "surface/segment-selected": "segment/bg-selected",
  "brand/accent": "shape/accent",
  "difficulty/easy": "difficulty/easy/bg", "difficulty/medium": "difficulty/medium/bg", "difficulty/hard": "difficulty/hard/bg", "difficulty/expert": "difficulty/expert/bg",
  "pad/button-y": "button/pad-y", "pad/button-x": "button/pad-x", "pad/input-y": "field/pad-y", "pad/input-x": "field/pad-x",
  "pad/hud": "panel/pad", "pad/track": "segment/track/pad", "pad/segment-x": "segment/pad-x", "pad/chip-x": "chip/pad-x",
  "gap/pills": "panel/pill/gap", "gap/controls": "panel/controls/gap", "gap/icon": "button/gap", "gap/segments": "segment/track/gap", "gap/section": "panel/section/gap",
  "size/chip": "chip/h", "size/dot": "segment/dot/size",
};
/* v1.2-ի Figma անունները (in-place rename-ի համար). բանալին v2.0-ի բանալին ա։ Semantic-ները
 * LEGACY-ից են ծնվում (OLD_FIG), primitives/radius-ը՝ ուղիղ. Spacing/n → Number/n,
 * Radius/* primitives → Global radius semantic (նույն ID, հիմա alias Number-ի վրա)։ */
const OLD_FIG = { "action/bet": "Colors/Action/Bet/Default", "action/bet-pressed": "Colors/Action/Bet/Pressed", "action/bet-glow": "Colors/Action/Bet/Glow", "action/on-bet": "Colors/Action/Bet/On",
  "action/cashout-top": "Colors/Action/Cashout/Top", "action/cashout-bottom": "Colors/Action/Cashout/Bottom", "action/cashout-pressed-top": "Colors/Action/Cashout/Pressed Top", "action/cashout-pressed-bottom": "Colors/Action/Cashout/Pressed Bottom",
  "action/cashout-glow": "Colors/Action/Cashout/Glow", "action/on-cashout": "Colors/Action/Cashout/On", "action/won-top": "Colors/Action/Won/Top", "action/won-bottom": "Colors/Action/Won/Bottom",
  "action/ghost": "Colors/Action/Ghost/Default", "action/ghost-pressed": "Colors/Action/Ghost/Pressed", "action/ghost-border": "Colors/Action/Ghost/Border", "action/on-ghost": "Colors/Action/Ghost/On",
  "surface/panel": "Colors/Global/Frame/Panel", "surface/pill": "Colors/Global/Frame/Pill", "surface/input": "Colors/Global/Frame/Input",
  "surface/chip-top": "Colors/Surface/Chip/Top", "surface/chip-bottom": "Colors/Surface/Chip/Bottom", "surface/betrow-top": "Colors/Surface/Bet Row/Top", "surface/betrow-bottom": "Colors/Surface/Bet Row/Bottom",
  "surface/segment": "Colors/Global/Frame/Segment", "surface/segment-selected": "Colors/Global/Frame/Segment Selected", "brand/accent": "Colors/Global/Shape/Accent",
  "difficulty/easy": "Colors/Difficulty/Easy", "difficulty/medium": "Colors/Difficulty/Medium", "difficulty/hard": "Colors/Difficulty/Hard", "difficulty/expert": "Colors/Difficulty/Expert",
  "pad/button-y": "Padding/Button/Y", "pad/button-x": "Padding/Button/X", "pad/input-y": "Padding/Input/Y", "pad/input-x": "Padding/Input/X", "pad/hud": "Padding/HUD", "pad/track": "Padding/Track", "pad/segment-x": "Padding/Segment/X", "pad/chip-x": "Padding/Chip/X",
  "gap/pills": "Gap/Pills", "gap/controls": "Gap/Controls", "gap/icon": "Gap/Icon", "gap/segments": "Gap/Segments", "gap/section": "Gap/Section", "size/chip": "Size/Chip", "size/dot": "Size/Dot" };
const PREV_FIG = Object.fromEntries(Object.entries(LEGACY).map(([o, n]) => [n, OLD_FIG[o]]));
Object.assign(PREV_FIG, { "radius/xs": "Radius/SM", "radius/sm": "Radius/Inner", "radius/md": "Radius/MD", "radius/lg": "Radius/Control", "radius/xl": "Radius/Chip", "radius/pill": "Radius/Pill",
  "state/win": "Colors/State/Win", "state/loss": "Colors/State/Loss", "state/caught": "Colors/State/Caught", "state/crash": "Colors/State/Crash",
  "border/subtle": "Colors/Global/Border/Subtle", "border/focus": "Colors/Global/Border/Focus", "border/error": "Colors/Global/Border/Error",
  "stroke/hairline": "Stroke/Hairline", "stroke/control": "Stroke/Control", "size/icon": "Size/Icon", "size/touch": "Size/Touch" });
for (const n of NUMBER) PREV_FIG[`number/${n}`] = `Spacing/${n}`;

/* ---------- ԲԱՌԱՐԱՆ ու ԱՆՎԱՆԱԿԱՐԳ (գեներատորը պարտադրում ա) ---------- */
const SLOT = { bg: "Background", fg: "Content", border: "Border", glow: "Glow", h: "Height", w: "Width", size: "Size", pad: "Padding", gap: "Gap", radius: "Radius" };
const COLOR_SLOT = ["bg", "fg", "border", "glow"];
const AXIS = { top: "Top", bottom: "Bottom", x: "X", y: "Y", sm: "Sm", md: "Md", lg: "Lg" };
const STATE = ["pressed", "selected", "focus", "error", "hover"];
const NO_EMIT = ["hover"]; /* բառարանում ա (schema չի փոխվում), բայց չի գեներացվում */
const GLOBAL = { text: "Colors/Global/Text", icon: "Colors/Global/Icon", border: "Colors/Global/Stroke", shape: "Colors/Global/Shape", state: "Colors/Global/State",
                 space: "Dimensions/Global/Space", radius: "Dimensions/Global/Radius", stroke: "Dimensions/Global/Stroke", size: "Dimensions/Global/Size" };
const GLOBAL_COLOR = ["text", "icon", "border", "shape", "state"];
const ABBR = { hud: "HUD", css: "CSS", lh: "Line Height" };
const cap = (s) => s.split("-").map((w) => ABBR[w] || w[0].toUpperCase() + w.slice(1)).join(" ");

function parse(key) {
  const seg = key.split("/");
  if (seg[0] === "font") return { kind: "font", style: seg[1], leaf: seg[2] };
  if (seg[0] === "opacity") return { kind: "opacity", leaf: seg[1] };
  if (seg[0] in GLOBAL) {
    if (seg.length !== 2) throw new Error(`global token-ը մեկ leaf ունի. ${key}`);
    return { kind: GLOBAL_COLOR.includes(seg[0]) ? "color" : "number", global: seg[0], leaf: seg[1] };
  }
  if (seg.length < 2 || seg.length > 3) throw new Error(`token բանալի. ${key} — <component>[/<part>]/<slot>[-<axis>][-<state>]`);
  const [comp, ...mid] = seg; const leaf = mid.pop(); const part = mid[0];
  const w = leaf.split("-"); const slot = w.shift();
  if (!(slot in SLOT)) throw new Error(`slot բառարանից դուրս. ${key} («${slot}») — թույլատրված՝ ${Object.keys(SLOT).join(" ")}`);
  let axis, state;
  if (w.length && w[0] in AXIS) axis = w.shift();
  if (w.length && STATE.includes(w[0])) state = w.shift();
  if (w.length) throw new Error(`token բանալի. ${key} — slot-ից հետո միայն axis (${Object.keys(AXIS).join(" ")}), հետո state (${STATE.join(" ")})`);
  if (state && NO_EMIT.includes(state)) throw new Error(`«${state}» state-ը չի գեներացվում (dev.md 09-12, Տիգրան). ${key}`);
  return { kind: COLOR_SLOT.includes(slot) ? "color" : "number", comp, part, slot, axis, state };
}
function figmaName(key) {
  const p = parse(key);
  if (p.kind === "font") return `Font/${cap(p.style)}/${cap(p.leaf)}`;
  if (p.kind === "opacity") return `Opacity/${cap(p.leaf)}`;
  if (p.global) return `${GLOBAL[p.global]}/${cap(p.leaf)}`;
  if (p.kind === "color")
    return ["Colors", cap(p.comp), p.part && cap(p.part), SLOT[p.slot] + (p.axis ? "-" + AXIS[p.axis] : "") + (p.state ? "-" + cap(p.state) : "")].filter(Boolean).join("/");
  const path = ["Dimensions", SLOT[p.slot], cap(p.comp)];
  if (p.axis) { if (p.part) path.push(cap(p.part)); path.push(AXIS[p.axis]); } else path.push(cap(p.part ?? p.comp));
  return path.join("/");
}
function figmaNameP(key) { /* primitives */
  const [g, ...rest] = key.split("/");
  if (g in ANCHOR || g === "white") return ["Colors", cap(g), ...rest].join("/");
  if (g === "alpha") return ["Colors/Alpha", cap(rest[0]), rest[1]].join("/");
  if (g === "number") return `Number/${rest[0]}`;
  return [{ family: "Family", size: "Font Size", weight: "Weight", tracking: "Tracking", lh: "Line Height" }[g], ...rest.map(cap)].join("/");
}
const FONT_SCOPE = { family: ["FONT_FAMILY"], size: ["FONT_SIZE"], weight: ["FONT_WEIGHT"], tracking: ["LETTER_SPACING"], lh: ["LINE_HEIGHT"] };
const GLOBAL_SCOPE = { text: ["TEXT_FILL"], icon: ["SHAPE_FILL", "STROKE_COLOR", "TEXT_FILL"], border: ["STROKE_COLOR"], shape: ["FRAME_FILL", "SHAPE_FILL", "TEXT_FILL"],
  state: ["TEXT_FILL", "STROKE_COLOR", "SHAPE_FILL"], space: ["GAP", "WIDTH_HEIGHT"], radius: ["CORNER_RADIUS"], stroke: ["STROKE_FLOAT"], size: ["WIDTH_HEIGHT"] };
function scopes(key) { /* դիզայները picker-ում տեսնում ա միայն էն, ինչ էդ property-ի համար իմաստ ունի (§5.5) */
  const p = parse(key);
  if (p.kind === "font") return FONT_SCOPE[p.leaf];
  if (p.kind === "opacity") return ["OPACITY"];
  if (p.global) return GLOBAL_SCOPE[p.global];
  if (p.kind === "color") return { bg: p.comp === "difficulty" ? ["SHAPE_FILL", "STROKE_COLOR", "TEXT_FILL", "EFFECT_COLOR"] : ["FRAME_FILL", "SHAPE_FILL"],
    fg: ["TEXT_FILL", "SHAPE_FILL", "STROKE_COLOR"], border: ["STROKE_COLOR"], glow: ["EFFECT_COLOR"] }[p.slot];
  return { h: ["WIDTH_HEIGHT"], w: ["WIDTH_HEIGHT"], size: ["WIDTH_HEIGHT"], pad: ["GAP"], gap: ["GAP"], radius: ["CORNER_RADIUS"] }[p.slot];
}
function collection(key, semanticLayer) {
  if (!semanticLayer) return key.startsWith("number/") ? "Layout" : /^(family|size|weight|tracking|lh)\//.test(key) ? "Type" : "Primitives";
  const p = parse(key);
  return p.kind === "font" ? "Type" : p.kind === "color" || p.kind === "opacity" ? "UI" : "Layout";
}
const cssName = (k) => k.replace(/\//g, "-").toLowerCase();
const cssVar = (k, sem) => `var(--${sem ? "rd" : "eg"}-${cssName(k)})`;

/* $description — token-ի «ինչու»-ն (Fun Builder-ում 0 էր, §3.2 #10). կոմպոնենտի նոթ + slot + աղբյուր */
const COMP_DESC = { button: "Button. bet = Place Bet/Run (կանաչ), cashout = Cash Out (սաթե gradient), won = cashout-ի հաղթած վիճակ, ghost = Keep Running (#betmorph.lost)",
  field: "Field. bet amount դաշտ (label / placeholder / helper part-երով)", chip: "Chip. ½ / 2× / Max preset-ներ դաշտի մեջ", "bet-row": "Bet Row. chip-երի շարքը դաշտի աջ մասում",
  segment: "Segment. difficulty ընտրիչի բջիջ (track = փոսը, dot = heat կետ)", difficulty: "Difficulty heat. variant = մակարդակ", panel: "Panel. HUD/Bet Panel (pill, section, controls part-երով)",
  text: "Global տեքստ", icon: "Global icon", border: "Global stroke", shape: "Global shape/accent", state: "Round-ի ելքի գույն (win/loss/caught/crash)",
  space: "Global spacing սանդղակ (t-shirt)", radius: "Global radius սանդղակ", stroke: "Global stroke width", size: "Global չափ (icon grid, touch target)" };
function describe(key, ref) {
  const p = parse(key);
  const src = typeof ref === "string" ? ref.slice(1, -1) : String(ref);
  if (p.kind === "font") return `Text style ${cap(p.style)} → ${p.leaf}. ${p.leaf === "lh" ? "px (size × ratio, Figma-ում lh-ը միայն px ա կապվում)" : "→ " + src}. CSS ${cssVar(key, true)}`;
  if (p.kind === "opacity") return `Disabled = opacity, ոչ palette. ամբողջ կոմպոնենտի վրա (${src}). CSS ${cssVar(key, true)}`;
  const what = p.global ? cap(p.leaf) : [p.part && cap(p.part), SLOT[p.slot], p.axis && AXIS[p.axis], p.state && cap(p.state)].filter(Boolean).join(" ");
  return `${COMP_DESC[p.global ?? p.comp] ?? cap(p.comp)}. ${what} → ${src}. CSS ${cssVar(key, true)}`;
}

/* ---------- resolve + validate ---------- */
const flat = {};
for (const [fam, stops] of Object.entries(color))
  for (const [stop, v] of Object.entries(stops)) flat[stop ? `${fam}/${stop}` : fam] = v;
for (const n of NUMBER) flat[`number/${n}`] = n;
for (const [g, m] of Object.entries(type))
  for (const [k, v] of Object.entries(m)) flat[`${g}/${k}`] = v;

const resolve = (v) => typeof v === "string" && v.startsWith("{")
  ? flat[v.slice(1, -1)] ?? (() => { throw new Error("bad ref " + v + " (pool-ում/primitives-ում չկա)"); })() : v;
for (const [k, v] of Object.entries(semantic)) {
  if (typeof v === "string" && !v.startsWith("{")) throw new Error("semantic raw value: " + k + " = " + v); /* 100% alias կանոնը */
  if (typeof v === "number" && !(k.startsWith("opacity/") || k.endsWith("/lh"))) throw new Error(`semantic թիվը {number/n} պիտի լինի. ${k} = ${v}`);
  const p = parse(k);
  if (typeof v === "string" && p.kind === "number" && !v.startsWith("{number/")) throw new Error(`չափային token-ը միայն number pool-ից. ${k} → ${v}`);
  if (typeof v === "string" && p.kind === "color" && v.startsWith("{number/")) throw new Error(`գունային slot-ը թիվ չի կարա լինի. ${k} → ${v}`);
  resolve(v);
}
for (const [o, n] of Object.entries(LEGACY)) if (!(n in semantic)) throw new Error(`legacy ${o} → ${n}, բայց ${n} semantic-ում չկա`);
/* կաղապարի պարտադիր slot-ը. ամեն կոմպոնենտ/variant գոնե bg կամ fg ունի */
{ const comps = new Map();
  for (const k of Object.keys(semantic)) { const p = parse(k); if (!p.comp) continue; const s = comps.get(p.comp) ?? new Set(); s.add(p.slot); comps.set(p.comp, s); }
  for (const [c, s] of comps) if (!s.has("bg") && !s.has("fg")) throw new Error(`կոմպոնենտ ${c}-ը bg/fg չունի — կաղապարից դուրս ա`); }

/* Figma անուններ + եզակիություն collection-ի մեջ */
const fig = { name: {}, prev: {}, collection: {}, scopes: {}, css: {} };
for (const k of Object.keys(flat)) { fig.name[k] = figmaNameP(k); fig.collection[k] = collection(k, false); fig.scopes[k] = []; fig.css[k] = cssVar(k, false); }
for (const k of Object.keys(semantic)) { fig.name[k] = figmaName(k); fig.collection[k] = collection(k, true); fig.scopes[k] = scopes(k); fig.css[k] = cssVar(k, true); }
for (const [k, old] of Object.entries(PREV_FIG)) { if (!(k in fig.name)) throw new Error(`PREV_FIG. ${k} չկա`); if (old !== fig.name[k]) fig.prev[fig.name[k]] = old; }
{ const seen = new Map();
  for (const [k, n] of Object.entries(fig.name)) { const key = fig.collection[k] + ":" + n; if (seen.has(key)) throw new Error(`Figma անվան բախում. ${seen.get(key)} ↔ ${k} → ${n}`); seen.set(key, k); } }

const tokens = {
  $meta: { generated: new Date().toISOString().slice(0, 10), generator: "tools/design/gen-tokens.mjs", version: "2.0",
           note: "Primitives՝ ընդհանուր Escort Gaming (--eg-*). semantic՝ Run Dady/Night (--rd-*), կոմպոնենտ-scoped կաղապար. figma.name՝ Figma անունները, figma.prev՝ v1.2 անունը in-place rename-ի համար, legacy՝ հին CSS բանալիներ" },
  number: NUMBER,
  primitives: flat,
  semantic: Object.fromEntries(Object.entries(semantic).map(([k, v]) => [k, { ref: v, value: resolve(v), description: describe(k, v) }])),
  legacy: LEGACY,
  textStyles: Object.fromEntries(Object.keys(textStyles).map((n) => [n, `font/${styleKey(n)}`])),
  figma: fig,
};
writeFileSync(join(R, "docs/design/tokens.json"), JSON.stringify(tokens, null, 2) + "\n");

/* ---------- CSS. --eg-* primitives + --rd-* semantic + legacy alias-ներ ---------- */
const unit = (k, v) => k.startsWith("lh/") ? v / 100
  : typeof v === "number" && !/weight|^type/.test(k) && !k.startsWith("family") ? v + "px" : v;
let css = "/* ԳԵՆԵՐԱՑՎԱԾ ա tools/design/gen-tokens.mjs v2.0-ից — ձեռքով ՉԽՄԲԱԳՐԵԼ */\n:root {\n  /* primitives (Escort Gaming). կոդում ՉԵՆ սպառվում — semantic-ի աղբյուրն են */\n";
for (const [k, v] of Object.entries(flat))
  css += `  --eg-${cssName(k)}: ${k.startsWith("family") ? `"${v}"` : unit(k, v)};\n`;
css += "\n  /* semantic (Run Dady). --rd-<component>[-<part>]-<slot>[-<axis>][-<state>] */\n";
for (const [k, { ref, value }] of Object.entries(tokens.semantic)) {
  const val = typeof ref === "string" ? `var(--eg-${cssName(ref.slice(1, -1))})` : k.endsWith("/lh") ? `${value}px` : value;
  css += `  --rd-${cssName(k)}: ${val};\n`;
}
css += "\n  /* legacy v1.2 անուններ — alias canonical-ի վրա. ջնջվում են T-0010-ի review-ից հետո (dev.md 09-12) */\n";
for (const [o, n] of Object.entries(LEGACY)) css += `  --rd-${cssName(o)}: var(--rd-${cssName(n)});\n`;
css += `
  /* --ui-* (index.html, v16_14-ի անուններ) — alias, ֆրոնտը դեռ սրանց վրա ա. T-0010-ը canonical ա անցնում */
  --ui-betc: var(--rd-button-bet-bg); --ui-betc-dn: var(--rd-button-bet-bg-pressed);
  --ui-betc-glow: var(--rd-button-bet-glow);
  --ui-runc: var(--rd-button-bet-bg); --ui-runc-dn: var(--rd-button-bet-bg-pressed);
  --ui-runc-glow: var(--rd-button-bet-glow);
  --ui-btnt: var(--rd-text-primary);
  --ui-coc1: var(--rd-button-cashout-bg-top); --ui-coc2: var(--rd-button-cashout-bg-bottom);
  --ui-coc-glow: var(--rd-button-cashout-glow);
  --ui-rad: var(--rd-button-radius);
}
`;
writeFileSync(join(R, "docs/design/tokens.css"), css);

/* index.html splice — bundle-ը <link> չի տեսնում, tokens.css-ը index.html-ի ՄԵՋ ա մտնում.
 * marker-ները Տիգրանն ա դնում (T-0010), գեներատորը արանքը վերագրում ա։ Marker չկա՝ բաց ա թողնում։ */
{
  const idx = join(R, "prototype/pixi-feel/index.html");
  const M0 = "/* @tokens */", M1 = "/* @/tokens */";
  const html = existsSync(idx) ? readFileSync(idx, "utf8") : "";
  const a = html.indexOf(M0), b = html.indexOf(M1);
  if (a >= 0 && b > a) {
    const next = html.slice(0, a + M0.length) + "\n" + css + html.slice(b);
    if (next !== html) { writeFileSync(idx, next); log.push("index.html: @tokens splice թարմացվեց"); } else log.push("index.html: @tokens splice անփոփոխ");
  } else log.push("index.html: @tokens marker չկա — splice բաց (T-0010-ում Տիգրանն ա դնում)");
}

/* ---------- JS մոդուլ (Pixi-ի սպառում, Տիգրանի ձևը dev.md 09-12) ----------
 * ESM, մեկ nested frozen object. գույն = 0xRRGGBB, alpha-ով token = {color, alpha},
 * չափեր unitless number, opacity 0–1, lh px։ Բանալիները CSS անվան հատվածներն են camelCase-ով
 * (bg-pressed → bgPressed, bet-row → betRow) — մեկ կանոն, ձեռքով քարտեզ չկա։ */
{
  const camel = (s) => s.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
  const jsVal = (k, v) => {
    if (typeof v === "number") return String(v);
    if (typeof v === "string" && v.startsWith("#")) return "0x" + v.slice(1);
    const m = typeof v === "string" && v.match(/^rgba\((\d+),(\d+),(\d+),([\d.]+)\)$/);
    if (m) return `{ color: 0x${st([+m[1], +m[2], +m[3]]).slice(1)}, alpha: ${m[4]} }`;
    return JSON.stringify(v);
  };
  const tree = {};
  for (const [k, { value }] of Object.entries(tokens.semantic)) {
    const path = k.split("/").map(camel); let o = tree;
    for (const s of path.slice(0, -1)) { if (typeof o[s] !== "object") { if (s in o) throw new Error(`JS բանալու բախում. ${k}`); o[s] = {}; } o = o[s]; }
    const leaf = path.at(-1); if (leaf in o) throw new Error(`JS բանալու բախում. ${k}`); o[leaf] = jsVal(k, value);
  }
  const emit = (o, ind) => "{\n" + Object.entries(o).map(([k, v]) => `${ind}  ${k}: ${typeof v === "object" ? emit(v, ind + "  ") : v},`).join("\n") + `\n${ind}}`;
  const typ = (o) => "{ " + Object.entries(o).map(([k, v]) => `${k}: ${typeof v === "object" ? typ(v) : v.startsWith("{") ? "{ color: number, alpha: number }" : v.startsWith('"') ? "string" : "number"}`).join(", ") + " }";
  const js = `/* ԳԵՆԵՐԱՑՎԱԾ ա tools/design/gen-tokens.mjs v2.0-ից — ձեռքով ՉԽՄԲԱԳՐԵԼ (docs/design/ui-tokens.md)
 * Run Dady semantic token-ները Pixi/JS-ի համար. գույն = 0xRRGGBB, alpha-ով = {color, alpha},
 * չափեր unitless px, opacity 0–1, lh px։ Նույն արժեքները, ինչ tokens.css-ի --rd-*-ը (բանալին camelCase)։ */
const freeze = (o) => { for (const v of Object.values(o)) if (typeof v === "object") freeze(v); return Object.freeze(o); };
/** @typedef {${typ(tree)}} RDTokens */
/** @type {RDTokens} */
export const RD = freeze(${emit(tree, "")});
export default RD;
`;
  writeFileSync(join(R, "prototype/pixi-feel/src/tokens.js"), js);
}

/* ---------- DTCG export (W3C draft, Tokens Studio բարբառով — հիմնադրի tokens.json-ի ձևը) ----------
 * Set-երը = collection («Primitives», «Semantic»), path-ը Figma անունն ա, alias {Colors.Green.500}։
 * $type-երը հիմնադրի ֆայլի պես՝ color / number / text (Figma FLOAT/STRING, ոչ dimension/fontFamily —
 * Tokens Studio-ի Figma sync-ը սա ա ուտում). $description՝ ամեն semantic-ի վրա։ Count-check ներքևում։ */
{
  const hex8 = (v) => { const m = v.match(/^rgba\((\d+),(\d+),(\d+),([\d.]+)\)$/); return m ? st([+m[1], +m[2], +m[3]]) + Math.round(+m[4] * 255).toString(16).padStart(2, "0").toUpperCase() : v; };
  const put = (root, path, leaf) => { let o = root; for (const s of path.slice(0, -1)) o = o[s] = o[s] ?? {}; if (o[path.at(-1)]) throw new Error("DTCG բախում " + path.join(".")); o[path.at(-1)] = leaf; };
  const dtype = (v) => typeof v === "number" ? "number" : typeof v === "string" && (v.startsWith("#") || v.startsWith("rgba")) ? "color" : "text";
  const P = {}, S = {};
  for (const [k, v] of Object.entries(flat)) put(P, fig.name[k].split("/"), { $type: dtype(v), $value: typeof v === "string" ? hex8(v) : v });
  for (const [k, { ref, value, description }] of Object.entries(tokens.semantic))
    put(S, fig.name[k].split("/"), { $type: dtype(value), $value: typeof ref === "string" ? `{${fig.name[ref.slice(1, -1)].replace(/\//g, ".")}}` : value, $description: description });
  const count = (o) => Object.values(o).reduce((n, v) => n + ("$value" in v ? 1 : count(v)), 0);
  const cp = count(P), cs = count(S);
  if (cp !== Object.keys(flat).length || cs !== Object.keys(semantic).length) throw new Error(`DTCG count-check. primitives ${cp}/${Object.keys(flat).length}, semantic ${cs}/${Object.keys(semantic).length}`);
  const dtcg = { Primitives: P, Semantic: S, $themes: [], $metadata: { tokenSetOrder: ["Primitives", "Semantic"], generator: "tools/design/gen-tokens.mjs v2.0", counts: { Primitives: cp, Semantic: cs } } };
  writeFileSync(join(R, "docs/design/tokens.dtcg.json"), JSON.stringify(dtcg, null, 2) + "\n");
  log.push(`tokens.dtcg.json: count-check OK (${cp} + ${cs})`);
}

/* ---------- Figma plugin. code.js = TOKENS + kit.src.js ---------- */
const kitDir = join(R, "tools/design/figma-kit");
const kitSrc = readFileSync(join(kitDir, "kit.src.js"), "utf8");
writeFileSync(join(kitDir, "code.js"),
  `/* ԳԵՆԵՐԱՑՎԱԾ ա tools/design/gen-tokens.mjs-ից — ձեռքով ՉԽՄԲԱԳՐԵԼ, խմբագրի kit.src.js-ը */\n` +
  `const TOKENS = ${JSON.stringify(tokens)};\n` + kitSrc);
console.log(`tokens.json: ${Object.keys(flat).length} primitives (number pool ${NUMBER.length}) + ${Object.keys(semantic).length} semantic, ${Object.keys(LEGACY).length} legacy alias; tokens.css, src/tokens.js, figma-kit/code.js գրվեց\n` + log.join("\n"));
