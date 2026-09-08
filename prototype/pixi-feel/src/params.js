/* Feel-պարամետրեր — v16_14 պրոտոյի ԹՈՍԱԿԱՎՈՒՆ default-ները (docs/reference/proto-params.md)։
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
  // --- rewind
  rewindLose: 0.55,  // loseAnim տեմպ. պարտությունից հետո (դանդաղ «ժապավեն»)
  rewindCash: 1.2,   // cashout-ից հետո (արագ)
};
export const P_DEF = { ...P };

/* DEV պանելի սահմանումները. [key, պիտակ, min, max, step] */
export const TUNE_DEFS = [
  ["target",    "Մաքս արագ. մ/վ", 5, 60, 1],
  ["accelK",    "Արագացում", 0.5, 12, 0.5],
  ["stopDecel", "Ստոպ արագ.", 1, 25, 0.5],
  ["loseDecel", "Կանգի փափուկ.", 0.4, 16, 0.1],
  ["multRate",  "Մուլտի տեմպ", 0.01, 0.2, 0.005],
  ["animFps",   "Անիմ FPS", 6, 60, 1],
  ["stride",    "Քայլ/ցիկլ (մ)", 2, 14, 0.1],
  ["wobble",    "Դրդռոց", 0, 1.5, 0.05],
  ["camY",      "Կամ. բարձր.", 1, 14, 0.1],
  ["camZ",      "Կամ. հեռավ.", 6, 30, 0.5],
  ["fov",       "FOV", 30, 90, 1],
  ["zoomK",     "Zoom ուժ", 0, 2, 0.05],
  ["camLag",    "Կամ. արագ.", 0.5, 12, 0.5],
  ["shake",     "Shake", 0, 3, 0.05],
  ["shakeF",    "Shake հաճախ.", 2, 40, 1],
  ["tilt",      "Tilt", 0, 1, 0.05],
  ["rhythm",    "Կամ. ռիթմ", 0, 1.5, 0.05],
  ["losePull",  "Պարտ. հետ քաշ", 0, 8, 0.1],
  ["roadW",     "Ասֆալտ լայնք", 6, 24, 0.5],
  ["gap",       "Շենք ճամփից", 0, 20, 0.5],
  ["seg",       "Շենք քայլ", 8, 40, 1],
  ["lampStep",  "Լապտեր քայլ", 8, 30, 1],
  ["fogFar",    "Մշուշ", 60, 400, 10],
  ["bbEvery",   "Billboard վրկ", 3, 45, 1],
  ["carSpd",    "Մեք. արագ.", 0, 30, 1],
  ["winPct",    "Պատուհան վառ %", 0, 1, 0.05],
  ["rewindLose","Rewind պարտ.", 0.2, 3, 0.05],
  ["rewindCash","Rewind cashout", 0.2, 4, 0.05],
];
