/* Feel Lab — DEV լարման պանել (⚙ կամ T)։ Խաղի մաս չի. Stake build-ում հանվում ա,
 * թվերը ֆիքսվում են feel spec-ից (T-0004)։ Հեռանկարում՝ «կոնստրուկտոր» պրոդուկտի սաղմը (Սևակ, 2026-09-08)։
 * Slider-ները P-ի իրական միավորներով են (մ/վ, աստիճան, մ) — Copy JSON-ը ուղիղ պրոտոյի հետ ա համեմատվում։
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
