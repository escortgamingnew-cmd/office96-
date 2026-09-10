# pixi-feel — Run Dady-ի խաղային ներկայացումը Pixi.js 2.5D-ով

v16_14 Three.js պրոտոյի (`docs/reference/pntiworldproto_16_14.html`) **պարիտետը**
մաքուր Pixi.js v8 2.5D-ով [D-001]՝ առանց մոբայլը տաքացնող bloom/PBR/լույսերի։
Ռաունդի հոսքը պրոտոյի ռեժիսուրան ա (hold-to-run, մուլտի, catch, rewind), արդյունքը՝
**SANDBOX fake-book**-ից՝ bet-ի պահին [D-003]։ RGS/network ԴԵՌ չկա, իրական մաթ ԴԵՌ չկա։

## Աշխատացնելը

Build step չկա։ ES module-ներ են → static server ա պետք (file://-ով չի աշխատի).

```
cd prototype/pixi-feel
py serve.py 7788          # կամ play.bat (բացում ա բրաուզերն էլ)
# բացի http://127.0.0.1:7788/
```

`serve.py`-ն Python-ի ստանդարտ http.server-ն ա՝ մեկ ուղղումով. Windows-ում
`py -m http.server`-ը `.js`-ը `text/plain` ա տալիս, ու module script-ը չի բեռնվում։
Pixi.js v8.16.0-ը քաշվում ա cdnjs-ից (pinned) — ինտերնետ ա պետք առաջին բացելուն։

## Կառավարում

- **Place Bet** (−/+ կամ չիպ 5/10/20/50) → կոճակը մորֆվում ա **Run! Daddy**
- **Պահել** Run! Daddy-ն (մկնիկ/touch/Space/↑) — վազում ա, բաց թողնել՝ կանգնում
- **CASH OUT** — ընթացիկ մուլտիով win (sandbox semantics), կանաչ pill, rewind
- Crash-կետին հասնելիս՝ **CAUGHT** (հետապնդողը կտրում ա ճամփան), կարմիր pill,
  կոճակը ghost **Keep Running** → rewind → նոր ռաունդ
- Վերևի pills՝ վերջին 6 արդյունքը, ▾ → մոդալ (մինչև 60)
- **F / ƒ** — FPS, **T / ⚙** — Feel Lab (DEV պանել, խաղի մաս չի)

## Feel Lab (DEV, T-0008 — խաղի մաս չի)

- **Icon dock.** 📷 կամերա · 🏃 վազք/հերոս · 🌆 քաղաք · 💡 լույս · ⚙ այլ — icon-ին սեղմելիս
  միայն էդ խմբի սլայդերներն են (ընտրած խումբը localStorage-ում ա մնում)
- **💡 Լույս.** երկնքի մթություն (`skyDark`), մշուշի երանգ (`fogHue` −1 սառը … +1 տաք),
  պատուհան վառ % (`winPct`), լապտերի halo (`lampHalo`), աստղեր (`starBright`),
  billboard նեոն (`bbNeon`)։ Փոփոխությունը live ա. գունապնակը (`applyLight`, tex.js)
  անմիջապես, texture regen-ը (երկինք, ֆասադներ, լապտեր, billboard) 180ms debounce-ով։
  Ֆասադները seed-ով են regen լինում — նույն շենքեր, նույն պատուհանների դասավորություն
- **Default-ը գիշերային ա** (`skyDark .4`, `lampHalo 1.35`, `starBright 1.2`, `bbNeon 1.3`).
  0/1 արժեքները v16_14 պրոտոյի գունապնակն են ճիշտ — **v16_14 լույս (հին)** կոճակը
  before/after համեմատելու համար ա, **Reset**-ը նոր default-ն ա բերում
- **Copy JSON** — P ամբողջությամբ + `bScale` (շենքերի ոչ-default scale-երը, `"L3": 1.4`)։
  **Reset** — P default + բոլոր շենքերի scale 1
- **Հակա-թղթե շենքեր: ON/OFF** կոճակ (T-0009) — հիմքի կոնտակտային ստվեր, կողի մգացում
  (`sideDark`), պարապետ, ֆասադի cap-ի baked ստվեր։ OFF = հին «թղթե» տեսքը, before/after։
  `depthFx`/`sideDark`/`baseShadow`-ը P-ում են (Copy JSON-ում կան, Reset-ը ON ա բերում)

## Գետինը (T-0009 — perf + procedural դետալ)

- **Մեկ textured Mesh** (`world.js` `_drawGround`), 48 շարք խորությամբ × 32 բջիջ լայնությամբ,
  ամեն կադր միայն vertex-ների դիրքն ու v-ն են գրվում ֆիքսված Float32Array-ի մեջ — **per-frame
  ալոկացիա 0, poly 0**։ T-0008-ի տարբերակը ամեն կադր `Graphics.clear()` + ~470 `fill()` էր
  (Pixi v8-ում ամեն fill-ը instruction/path օբյեկտներ + geometry rebuild + GPU upload → GC)
- **Texture-ը canvas-ով ա գեներացվում** (`tex.js` `makeGroundTex`, 2048×1024 desktop /
  1024×512 mobile, 0 image ֆայլ), cross-section x-ով (գետին | մայթ | curb | ասֆալտ), 16մ tile
  z-ով repeat-ով։ Մեջը՝ մայթի սալիկներ իրենց տոնով + կարաններ + ճաքեր + բծեր, curb երկտոն + երկու
  կոնտակտային ստվեր, ասֆալտի հատիկ/կարկատան/ձյութի ճաքեր/եզրի մաշվածություն, գծանշում։ Mipmap +
  anisotropy (հեռվում shimmer չկա)։ Regen՝ 💡 skyDark/fogHue-ին (debounce) ու 🌆 roadW-ին (throttle)
- **Մշուշը գետնի վրա** մեկ gradient sprite ա (`makeGroundFogTex`), tint = fog. գետնի հարթության
  վրա fogT-ն միայն էկրանի y-ի ֆունկցիա ա (u = near/d), ուրեմն alpha-ն baked ա, կամեռայից անկախ
- Ինչի՞ 32 բջիջ լայնությամբ. GPU-ն texture-ը եռանկյան մեջ affine ա interpolate անում — trapezoid
  բանդի անկյունագծին ուղիղ գիծը կոտրվում ա (PS1 warping)։ Բջիջը փոքրացնելով կոտրվածքը subpixel ա,
  custom shader պետք չի
- **Frame cap.** desktop-ում `maxFPS` ՉԿԱ (display rate)։ `maxFPS=60`-ը 60Hz էկրանին hitch-ի
  աղբյուր էր. Pixi-ի Ticker-ը delta-ն ամբողջ թվի ա կտրում (`(now−last)|0`), 16.67 → 16 < 16.67,
  կադրը ցատկվում ա, հաջորդը 33ms-ով ա (կրկնակի քայլ) ~ամեն 35 կադրը մեկ։ Մոբայլում 30-ը մնում ա

## Asset Lab (DEV, T-0007 — խաղի մաս չի)

Դիզայներն իր շենքի ասեթը խաղի մեջ ա տեսնում առանց build-ի.

- **Tap/click շենքի վրա** → ընտրվում ա (տաք tint highlight, վերև-աջ toolbar).
  **tap ընտրվածի վրա** → հաջորդ վարիանտը (10-ից, ցիկլով). **tap դատարկ տեղ** → հանել
- **Նկար (PNG/WebP/JPG) drag&drop** պատուհանի վրա → ընտրված շենքի տեքստուրան փոխվում ա
  live, առանց reload։ Drop-ը ուղիղ շենքի վրա՝ էդ շենքն ա ընտրվում
- Toolbar. **front/side** (drop/Load-ի թիրախը, նոր ընտրության հետ ետ front ա), **Load**
  (file input — մոբայլ ու iframe, որտեղ drop չկա), **Next** (վարիանտ), **Reset**
  (վերադարձ canvas ֆասադին), **✕**, **scale** սլայդեր 0.6–1.8× (T-0008)
- Ընտրությունը և scale-ը `world.buildings[i]` ՕԲՅԵԿՏԻՆ են կապված — sprite-երը z-flow-ով
  րեցիրկուլացվում են, ասեթն ու չափը շենքի հետ են գնում-գալիս
- Կիսատ/վնասված նկարը Chrome-ը լուռ decode ա անում → սև texture. 8×8 sanity-check-ը
  console-ում warn ա տալիս («ամբողջը սև/թափանցիկ»)
- Aspect-ը շենքին (w/h, asset-spec 2.1) չի համընկնում → v1-ում ձգվում ա, console-ում warn
- Բյուջե. 0 filter, 0 լրացուցիչ display object. hit-test-ը միայն tap-ի պահին (24 շենք)
- Կոդը՝ `feellab.js` (initAssetLab) + `world.js` (select/cycle/setBuildingTex/pickBuilding)

## Կառուցվածքը (`src/`)

| Ֆայլ | Ինչ ա |
|---|---|
| `params.js` | `P` — feel-պարամետրերը պրոտոյի թվերով ու իրական միավորներով (մ/վ, °, մ); Feel Lab-ի սահմանումներ |
| `cam.js` | Վիրտուալ pinhole կամերա. դիրք (0, 4.5, 14), FOV 55(+14·k), eased lookAt, portraitK, roll |
| `world.js` | Քաղաքը. շենքեր (front sprite + ճամփի կողմի/տանիքի PerspectiveMesh երեսներ), լապտերներ, մեքենաներ, ծառ/թուփ, billboard, հյուրանոց, աստղեր; ճամփա/մայթ/գետին Graphics; flow/rewind |
| `tex.js` | Canvas-ով նկարած բոլոր texture-ները (ֆասադ, լապտեր, ծառ, մեքենա, billboard, հետապնդող, ստվեր) |
| `ui.js` | DOM/CSS UI՝ պրոտոյից պորտ. bet↔run մորֆ, CASH OUT/WON, պատմություն, մուլտի |
| `sandbox.js` | Fake-book. crash-կետը bet-ի պահին (placeholder distribution, ոչ իրական մաթ) |
| `feellab.js` | DEV. Feel Lab պանել + Asset Lab (tap/drop ասեթի փոխարինում) — մեկ ֆայլ, որ bundle-ը չփոխվի |
| `main.js` | Ռաունդի հոսքը (պրոտոյի animateBody-ի վերաշարադրանք), կերպարներ, loop |

## Ինչ ա 1:1 պրոտոյից (կոդի ուղիղ ընթերցումով)

- **Աշխարհը մետրերով ա, կամերան (0, 4.5, 14)**, lookAt (0, 2, −30), FOV 55 → 69 արագության հետ
  (fov-zoom, lag 4), portrait-ում FOV-ը լայնանում ա (portraitK), հերոսը z=2 / −1.2
- **Ուղղությունը.** Պապին կամեռայի կողմ ա վազում, աշխարհը հեռանում ա մշուշի մեջ (`z -= dz`),
  օբյեկտները ծնվում են կամեռայի հետևում (SPAWN_Z=40)
- **Արագություն.** `speed += (TARGET−speed)·min(1, dt·4)`, TARGET=22; կանգ՝ stopDecel 20,
  պարտություն՝ loseDecel 9; `speed < 0.12·TARGET → 0`
- **Հոսքը ոտքերից ա.** `dz = dt·animFps·k / 20 × stride` (38 fps, 8.5 մ/ցիկլ) →
  մաքս ≈ 16.15 մ/վ; մուլտի `1 + dist × 0.05`
- **Կամերա.** shake 18Hz amp 1 (smoothed random), ռիթմ 0.55 (bob ոտնաձայնի հետ), tilt 0.25,
  lose pull 2, vignette k·0.9
- **Հերոս.** hop 0.18·wobble, rotation −0.08·k·wobble, squash/stretch; կադրերը «մեկ կադր/ռենդեր»
  cadence-ով (ցնցում չկա); կոնտակտային ստվեր
- **Catch.** հետապնդողը (6.5, 2.5, camZ+5) → (0.9, 2.5, (camZ+charZ)/2−1), ease-out 1.8/վ,
  «CAUGHT» երբ catchAnim=1 ու speed<0.6; կարմիր մուլտի
- **Rewind.** դրոն-կամար (y += 9·sin πt), աշխարհը ետ ա հոսում sweepD (cashout՝ վազածի չափ,
  պարտություն՝ fog+70), հին Պապին/հետապնդողը հոսքով անցնում են կամեռայի տակով, նոր Պապին
  հյուրանոցի մոտ ա սպասում; կարճ rewind (<14մ)՝ նույն Պապին տեղում
- **Աշխարհ.** ROAD_W 10, մայթ 3 (±6.5), շենքեր ±(5+3+w/2), SEG 16 × 12, լապտեր քայլ 14 random
  դասավորությամբ, մեքենաներ կայանած լապտերների արանքում (պրոտո. «ճամփան վազորդինն ա»),
  billboard ամեն 12 վ, fog 70/210 desktop · 40/120 mobile, աստղեր 400/140, հյուրանոց (−19, 0, −45)
- **UI.** betmorph ms-ref խորեոգրաֆիա (stagger chips, spring), CASH OUT/WON, pills, մոդալ,
  տեքստերը նույնը

## Ինչ ա գիտակցաբար տարբեր

- **Motion blur** (frame-accumulation) չկա — fullscreen pass ա, մոբայլի բյուջեից դուրս
- Լույս/ստվեր/bloom չկա — glow-երը baked են canvas-ում, fog-ը՝ alpha fade + գույնի lerp
- Շենքերը GLB-ի փոխարեն canvas ֆասադ են (պրոտոյի lowPolyBuilding/addWindows կանոններով.
  հարկ 2.6մ, սյուն 2.2մ, 60% վառ, pastel), բարձրությունը ~8–13մ (պրոտոյի GLB-ը 12 էր)
- Մեքենան canvas placeholder ա (հետևից/դիմացից տեսք, tint) — իրական render-ը
  car-default.glb-ից Blender-ով ա գալու
- Հետապնդողը պրոտոյի drawEnemy placeholder silhouette-ն ա

## Մոբայլ բյուջեն

- DPR cap ≤2 (mobile 1.5), antialias off, ticker maxFPS 30 mobile / uncapped desktop (տես Գետինը)
- 0 filter, 0 blur; ~194 display object (+400/140 աստղ sprite), ~146 տեսանելի (85՝ depthFx OFF)
- Գետինը մեկ Mesh (1680 vertex, ֆիքսված բուֆեր, 0 ալոկացիա/կադր), PerspectiveMesh 4×4 (32 tri)
  երեսների/հիմքի ստվերի համար, 2×2 պարապետների համար. բոլորը batched
- CPU frame time (update + render, `__feel.bench`). desktop p50 0.4 / p95 0.5 / p99 0.7 ms,
  mobile viewport p50 0.3 / p95 0.5 / p99 0.7 ms (T-0008-ը՝ 1.1/2.7/4.2 և 0.9/1.6/2.5)
- `dt` clamp 0.05 վ

## Debug (`window.__feel`)

`state()`, `placeBet(b)`, `hold(on)`, `cashout()`, `restart()`, `setCrash(d)` (sandbox
crash-կետը ստիպել), `step(dt, n)` (դետերմինիստիկ քայլ՝ rAF-ից անկախ թեստի համար),
`budget()`, `P`, `world` (`buildings[i]`, `pickBuilding(x, y)`, `scales()`),
`asset` — Asset Lab. `select(i)`, `selected()`, `cycle()`, `face("front"|"side")`,
`scale(1.4)`, `loadFile(file)`, `loadUrl("assets/papi-run-20f.webp")` (drop-ի տեղ՝ թեստի համար),
`feel.showGroup("light")`, `relight("skyDark")` (P-ն ձեռքով փոխելուց հետո),
`app` (Pixi Application), `perf(60)` → Promise. իրական rAF կադրերի p50/p95/p99/max + >40/>80ms
հաշիվ (tab-ը visible պիտի լինի), `bench(3600)` — CPU frame time update+render, hidden tab-ում էլ։

## Ասեթ

`assets/papi-run-20f.webp` — մեր օրիգինալ spritesheet-ը (docs/reference/assets/-ից)։
Ուրիշ ոչ մի արտաքին asset չկա, ամեն ինչ canvas ա։
