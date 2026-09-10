/* Feel-պարամետրեր — v16_14 պրոտոյի թվերը 1:1 (docs/reference/proto-params.md + կոդի ուղիղ ընթերցում)։
 * Բոլորը իրական միավորներով են (մետր, վրկ, աստիճան), որ պրոտոյի հետ 1:1 համեմատվեն։
 * DEV Feel Lab պանելը (⚙/T) էս օբյեկտն ա լարում live։ Խաղի build-ում պանելը հանվում ա,
 * թվերը ֆիքսվում են feel spec-ից (T-0004)։
 */
export const IS_MOBILE = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ||
  (navigator.maxTouchPoints > 1 && innerWidth < 1100);

export const P = {
  // --- շարժում (պրոտո. TARGET=22, արագությունը TARGET-ին էքսպոնենտով ա մոտենում dt×4-ով;
  //     ACCEL=30-ը պրոտոյում հայտարարված ա, բայց չի օգտագործվում — էստեղ էլ չկա)
  target:    22,     // մ/վ նոմինալ մաքս
  accelK:    4,      // speed += (target-speed)·dt·accelK
  stopDecel: 20,     // CAM.stopDecel
  loseDecel: 9,      // CAM.loseDecel
  multRate:  0.05,   // 1 + dist × rate
  // --- հերոս/անիմ (աշխարհի հոսքը ոտքերից ա. dz = animFps·k·dt / frames × stride)
  animFps:   38,
  stride:    8.5,    // մ մեկ ցիկլին (20 կադր)
  wobble:    0.3,
  // --- կամերա (դիրք 0/4.5/14, FOV 55, fov-zoom +14°·k)
  camY:      4.5,
  camZ:      14,
  fov:       55,
  zoomK:     1,
  camLag:    4,
  shake:     1,
  shakeF:    18,
  tilt:      0.25,
  rhythm:    0.55,
  losePull:  2,
  // --- աշխարհ
  roadW:     10,
  gap:       3,
  seg:       16,
  count:     12,     // շենք/կողմ
  lampStep:  14,
  fogFar:    IS_MOBILE ? 120 : 210,
  fogNearK:  0.333,  // near = far × k (պրոտո 70/210, 40/120)
  bbEvery:   12,     // billboard-ի հաճախ. (վրկ)
  cars:      4,
  carSpd:    0,      // 0 = կայանած (պրոտոյի default. «ճամփան վազորդինն ա»); >0 = երթևեկություն
  winPct:    0.6,
  // --- լույս (T-0008, 💡 պանել). 0/1 = v16_14-ի հին գունապնակը ճիշտ, default-ը՝ «մի քայլ ավելի գիշեր»
  skyDark:   0.4,    // երկնքի/մշուշի/գետնի/ֆասադների խորությունը դեպի գիշեր (0 = պրոտոյի գույները)
  fogHue:    0,      // մշուշի երանգ. −1 սառը կապույտ … +1 տաք մանուշակ
  lampHalo:  1.35,   // լապտերի baked halo-ի ուժ (1 = պրոտո)
  starBright: 1.2,   // աստղերի պայծառություն (1 = պրոտո, alpha .85)
  bbNeon:    1.3,    // billboard-ի նեոն glow (1 = պրոտո)
  // --- rewind
  rewindLose: 0.55,  // loseAnim տեմպ. պարտությունից հետո (դանդաղ «ժապավեն»)
  rewindCash: 1.2,   // cashout-ից հետո (արագ)
};
export const P_DEF = { ...P };
/* v16_14 պրոտոյի լույսը՝ before/after համեմատելու համար (💡 պանելի «v16_14» կոճակ) */
export const LIGHT_PROTO = { skyDark: 0, fogHue: 0, lampHalo: 1, starBright: 1, bbNeon: 1, winPct: 0.6 };

/* DEV պանելի խմբերը (icon dock). [id, icon, պիտակ] */
export const TUNE_GROUPS = [
  ["cam",   "📷", "Կամերա"],
  ["run",   "🏃", "Վազք"],
  ["city",  "🌆", "Քաղաք"],
  ["light", "💡", "Լույս"],
  ["misc",  "⚙",  "Այլ"],
];

/* DEV պանելի սահմանումները. [key, պիտակ, min, max, step, խումբ] */
export const TUNE_DEFS = [
  ["target",    "Մաքս արագ. մ/վ", 5, 60, 1, "run"],
  ["accelK",    "Արագացում", 0.5, 12, 0.5, "run"],
  ["stopDecel", "Ստոպ արագ.", 1, 25, 0.5, "run"],
  ["loseDecel", "Կանգի փափուկ.", 0.4, 16, 0.1, "run"],
  ["multRate",  "Մուլտի տեմպ", 0.01, 0.2, 0.005, "run"],
  ["animFps",   "Անիմ FPS", 6, 60, 1, "run"],
  ["stride",    "Քայլ/ցիկլ (մ)", 2, 14, 0.1, "run"],
  ["wobble",    "Դրդռոց", 0, 1.5, 0.05, "run"],
  ["camY",      "Կամ. բարձր.", 1, 14, 0.1, "cam"],
  ["camZ",      "Կամ. հեռավ.", 6, 30, 0.5, "cam"],
  ["fov",       "FOV", 30, 90, 1, "cam"],
  ["zoomK",     "Zoom ուժ", 0, 2, 0.05, "cam"],
  ["camLag",    "Կամ. արագ.", 0.5, 12, 0.5, "cam"],
  ["shake",     "Shake", 0, 3, 0.05, "cam"],
  ["shakeF",    "Shake հաճախ.", 2, 40, 1, "cam"],
  ["tilt",      "Tilt", 0, 1, 0.05, "cam"],
  ["rhythm",    "Կամ. ռիթմ", 0, 1.5, 0.05, "cam"],
  ["losePull",  "Պարտ. հետ քաշ", 0, 8, 0.1, "cam"],
  ["roadW",     "Ասֆալտ լայնք", 6, 24, 0.5, "city"],
  ["gap",       "Շենք ճամփից", 0, 20, 0.5, "city"],
  ["seg",       "Շենք քայլ", 8, 40, 1, "city"],
  ["lampStep",  "Լապտեր քայլ", 8, 30, 1, "city"],
  ["fogFar",    "Մշուշ", 60, 400, 10, "city"],
  ["bbEvery",   "Billboard վրկ", 3, 45, 1, "city"],
  ["carSpd",    "Մեք. արագ.", 0, 30, 1, "city"],
  ["skyDark",   "Երկնքի մթություն", 0, 1, 0.05, "light"],
  ["fogHue",    "Մշուշի երանգ", -1, 1, 0.05, "light"],
  ["winPct",    "Պատուհան վառ %", 0, 1, 0.05, "light"],
  ["lampHalo",  "Լապտերի halo", 0, 2.5, 0.05, "light"],
  ["starBright","Աստղեր", 0, 1.5, 0.05, "light"],
  ["bbNeon",    "Billboard նեոն", 0, 2.5, 0.05, "light"],
  ["rewindLose","Rewind պարտ.", 0.2, 3, 0.05, "misc"],
  ["rewindCash","Rewind cashout", 0.2, 4, 0.05, "misc"],
];
/* Լույսի բանալիները — փոփոխությունը texture regen ա պահանջում (debounce-ով, main.js) */
export const LIGHT_KEYS = new Set(["skyDark", "fogHue", "winPct", "lampHalo", "starBright", "bbNeon"]);
