# T-0009 — Կախոցի fix + գետնի procedural դետալ + հակա-«թղթե» շենքեր

- **Author.** Aram (founder), ձևակերպումը՝ Սևակ (lead)
- **Assignee.** Տիգրան
- **Priority.** P0 — հիմնադիրը live տեստում ա ու խաղը կախում ա. feel-ը մեր պրոդուկտի սիրտն ա
- **Opened.** 2026-09-10

## Ինչ ա պետք

1. **Կախոցի (hitch) ախտորոշում ու fix։** Հիմնադիրը T-0008-ից հետո
   զգում ա «կախելով ա աշխատում»։ Կասկածելի #1՝ _drawGround-ի նոր
   per-frame poly ծավալը (կարաններ, երկտոն curb, մաշվածություն) ու
   դրանից GC ցատկերը։ Պահանջվում ա. (ա) չափել frame time-ի ՑԱՏԿԵՐԸ
   (ոչ միջինը)՝ p95/max, before/after. (բ) իջեցնել՝ static geometry-ի
   քեշավորում / poly-երի կրճատում / ալոկացիաների զրոյացում hot path-ում.
   (գ) ստուգելի արդյունք՝ 60վ վազքի ընթացքում մոբայլ viewport-ում
   ոչ մի >80ms կադր, desktop-ում՝ >40ms։
2. **Գետնի procedural տեքստուրա շենքերի գոտում (0 asset-մեգաբայթ)։**
   Ասֆալտի ու մայթի՝ շենքերին հարող գոտիներին canvas-ով գեներացված
   դետալ (ասֆալտի բծեր/կարկատան, մայթի սալիկի ֆակտուրա) — առանց
   մեկ image ֆայլի։ Իրագործման ձևը քոնն ա (tiling texture strip-եր
   mesh-ով, թե baked bands) — պայմանը՝ 1-ին կետի բյուջեն չխախտվի.
   perf-ը առաջնային ա դետալից։
3. **Հակա-«թղթե» փաթեթ շենքերին։** Հիմնադրի զգացողությունը. «շենքերը
   թղթից են»։ Գոնե երեքը՝
   - կոնտակտային ստվերաշերտ շենքի հիմքի տակ (գետնի վրա, մշուշին
     ենթարկվող),
   - կողային երեսի հաստատուն մգացում ֆասադի նկատմամբ (անկյան
     «կոտրվածքի» զգացողություն),
   - տանիքի եզր/պարապետ (վերևի «կտրված թղթի» եզրը վերանում ա)։
   Ստուգելի. before/after համեմատվող ա (💡 կամ ⚙ պանելում toggle),
   մոտիկով անցնող շենքի վրա երեք էֆեկտն էլ երևում են։

Ընդհանուր. 0 filter, DPR cap, բյուջեն սուրբ. flat build-ի patch-երի
համատեղելիությունը ստուգել. bundle script-երը առանց փոփոխության
հավաքվում են։

## Կոնտեքստ

- Հիմնադրի հաղորդումը՝ 2026-09-10. «խաղը կախելով ա աշխատում»,
  «ասֆալտին/մայթին շենքերի տեղերում տեքստուրա տանք կոդով, որ MB
  չխլի», «շենքերը ոնց որ թղթից լինեն»։
- Հիմնադրի ճշտումը (2026-09-10). **կախում ա ՀԱՄԱԿԱՐԳՉՈՎ** (desktop,
  Chrome, artifact iframe)։ Այսինքն մոբայլի 30fps cap-ը չի քողարկում —
  desktop-ում maxFPS 60 ա ու DPR-ը մինչև 2. hot path-ը էնտեղ կրկնակի ա։
- T-0008-ի _drawGround-ը՝ world.js. Լուսինեի չափումը (0.389ms միջին)
  hitch-երը չի բացառում — միջինի ու max-ի տարբերությունն ա խնդիրը։

## Log

- [2026-09-10] Սևակ. բացվեց հիմնադրի feedback-ով, approved (հիմնադրի
  թասկ, D-002)։ P0՝ perf-ը feel-ի հիմքն ա։
- [2026-09-10 16:40] Տիգրան. doing → review։ Երեք բլոկն էլ արված։

  **1. Կախոցը — երկու աղբյուր, երկուսն էլ փակված։**
  - **Աղբյուր A (գլխավորը, desktop-only). `app.ticker.maxFPS = 60` 60Hz էկրանին.** Pixi 8.16-ի
    Ticker.update-ը delta-ն ամբողջ թվի ա կտրում (`(now − _lastFrame) | 0`), rAF-ի 16.67-ը դառնում ա
    16 < 16.667 → կադրը ցատկվում ա, հաջորդը deltaMS 33-ով ա գալիս (աշխարհը կրկնակի քայլ ա անում)։
    Մնացորդը ամեն «կարճ» rAF-ով 1ms-ով ընկնում ա → skip մոտ ամեն 16–35 կադրը մեկ = կանոնավոր hitch
    ամեն կես վայրկյան։ Ապացույցը՝ Pixi-ի ԻՍԿԱԿԱՆ Ticker-ին սինթետիկ timestamp-ներով (3600 կադր).
    60Hz ±0.3ms jitter → **104 կրկնակի (33ms) կադր րոպեում** (eff 58.3 fps), ±1ms → 119, 144Hz
    մոնիտոր → մշտական 14/21ms judder, **uncapped → 0**։ Մոբայլի 30 cap-ը նույն սիմուլյացիայում
    նորմալ ա (29.6 fps, 60Hz ու 120Hz) — մնում ա։ Fix՝ `main.js` desktop-ում `maxFPS = 0`
    (display rate, շարժումը dt-ով ա, clamp 0.05 կար)։ T-0003-ից կար — հիմնադիրը desktop-ում
    artifact-ով նոր սկսեց խաղալ, դրա համար հիմա զգաց։
  - **Աղբյուր B (T-0008 գետինը). ամեն կադր `Graphics.clear()` + ~470 `poly().fill()`** (27 բանդ ×
    16 strip + 64 կարան + 30 dash). Pixi v8-ում ամեն fill-ը instruction/path/polygon օբյեկտ ա, հետո
    ամբողջ geometry-ն rebuild + GPU upload → ~3000 կարճատև օբյեկտ/կադր։ Fix՝ գետինը **մեկ textured
    Mesh** ա (48×35 vertex, ֆիքսված Float32Array, ամեն կադր 4 project + lerp ամեն շարքին, **0 ալոկացիա,
    0 poly**), մշուշը՝ մեկ gradient sprite (գետնի հարթության վրա fogT-ն էկրանի y-ի ֆունկցիա ա,
    ապացույցը tex.js-ի կոմենտում)։ Հավելյալ՝ `_wallQuad/_roofQuad`-ի `project(…, {})`-երը pool-ով
    (`this.pq`), hot path-ում նոր օբյեկտ չկա։
  - **Չափում (CPU frame time = update + `renderer.render`, 3600 կադր վազքի ժամանակ, Chrome).**
    Desktop 1920×919. **before** p50 1.1 / p95 2.7 / p99 4.2 / max 13.9–19.5 ms (3 վազք, 7200-ում
    1 կադր >16.7, 0 >40) → **after** p50 0.4 / p95 0.5 / p99 0.7 / max 6.3–18.3 (0 >40)։
    Մոբայլ viewport 375×812 (Android UA, fog 120). **before** p50 0.9 / p95 1.5–1.8 / p99 2.5 /
    max 10.9–11.3 → **after** p50 0.3 / p95 0.5 / p99 0.7 / max 4.7։ Թիրախը (desktop 0 >40ms,
    մոբայլ 0 >80ms) — ✓ էս մետրիկով։
  - **Ազնիվ սահման.** rAF-ի ԻՐԱԿԱՆ p95/max-ը էս session-ում չչափվեց. Browser pane-ն էլ, Chrome-ի
    tab-ն էլ hidden էին (rAF-ը կանգնում ա), իսկ Chrome-ի պատուհանը առաջ բերելը մերժվեց։ CPU-loop-ը
    GC/rebuild ցատկերն ա բռնում, բայց ոչ ticker-ի skip-ը — դրա համար ա սիմուլյացիան։ Հիմնադրին/
    Լուսինեին. visible tab-ում `__feel.perf(60)` → {p50,p95,p99,max,over40,over80}, կամ F-ով FPS-ը։
    Նաև DPR 1 էր (հիմնադրի մոտ մինչև 2 — GPU-ի կողմն ա, CPU-ն նույնն ա)։

  **2. Գետնի procedural դետալ (0 asset).** `tex.js` `makeGroundTex(roadW)` — canvas 2048×1024
  desktop / 1024×512 mobile, cross-section x-ով, 16մ tile z-ով (repeat, mipmap, aniso 8/4)։ Մայթ.
  սալիկներ 2×1.65մ իրենց տոնով, կարաններ, ճաքեր, բծեր, հատիկ։ Curb. երես/վերև երկտոն + ստվեր մայթին +
  gradient կոնտակտային ստվեր ասֆալտին։ Ասֆալտ. հատիկ, եզրի մուգ գոտի + մաշվածություն, 6 կարկատան
  (մուգ/բաց, նուրբ), ձյութած ճաքեր, բծեր, dash 8մ + գոտու գծեր։ Առանձին PRNG — քաղաքի rnd()-ն չի
  շարժվում, նույն շենքերն են։ Regen՝ 💡 skyDark/fogHue (գույները baked են) և 🌆 roadW (throttle 250ms)։
  Բյուջեն չխախտվեց (տես թվերը) — դետալը minimal չեմ արել, բայց հանգիստ եմ պահել (ֆոն ա)։
  Երկու տեխնիկական ուսանելի բան. (ա) առաջին տարբերակը 4 սյունով էր → curb-ն ու dash-երը զիգզագ
  (affine texture warping trapezoid-ի անկյունագծին, PS1-ի էֆեկտը) → 32 բջիջ լայնությամբ, միջանկյալ
  սյուները lerp-ով (շարքը էկրանին ուղիղ գիծ ա), կոտրվածքը subpixel. (բ) Pixi API-ները
  (addressModeU/V, autoGenerateMipmaps, maxAnisotropy, MeshGeometry buffer.update) ստուգված են
  8.16.0-ի աղբյուրից, ոչ հիշողությունից։

  **3. Հակա-«թղթե» փաթեթ** (`P.depthFx`, 💡 պանելում «Հակա-թղթե շենքեր: ON/OFF» կոճակ, before/after).
  (ա) հիմքի կոնտակտային ստվեր՝ PerspectiveMesh գետնի վրա, footprint + 1.6մ, `P.baseShadow` (.55),
  մշուշին ենթարկվող, շենքի բոլոր օբյեկտներից հետևում (zIndex). (բ) կողի հաստատուն մգացում՝ tint
  `P.sideDark` (.28) ֆասադի նկատմամբ. (գ) պարապետ՝ front 0.22մ առաջ/լայն + կող դեպի ճամփա, 0.5մ,
  canvas cap texture (լուսավոր եզր, մութ underside) + ֆասադի canvas-ում baked ստվեր cap-ի տակ։
  sideDark/baseShadow սլայդերները 💡-ում, ամեն կադր P-ից են (regen չկա), depthFx-ը ֆասադ regen ա
  (LIGHT_KEYS)։ Copy JSON-ում երեքն էլ կան, Reset → ON/default։ OFF-ում 194 obj-ից 85 visible (հին
  տեսքը 1:1)։ Flat A/B build-ում պարապետ ՉԿԱ (կողը baked ա, wFlat-ով գիտակցված skip), հիմքի
  ստվերն ու գետինը կան։

  **Ինչ փոխվեց.** `params.js` (depthFx/sideDark/baseShadow, TUNE_DEFS light, LIGHT_KEYS+depthFx),
  `tex.js` (facadeCanvas cap-ի ստվեր, makeGroundTex/makeGroundFogTex/makeFootTex/makeCornTex, prng),
  `world.js` (Quad sub, pq pool, ground Container = Mesh + fog sprite, _buildGround/_regenGround/
  _drawGround նոր, footQ/cornF/cornS, _faceQuad, _wallQuad y0, relight ground/corn regen), `main.js`
  (maxFPS fix, `__feel.app/perf/bench`), `feellab.js` (depth toggle), `index.html` (կոճակ), README։
  Բյուջե. 122 → 194 display object (+72 quad, բոլորը batched), 0 filter, DPR cap անփոփոխ։

  **Bundle-ներ (Սևակ).** Երկու script-ին չեմ դիպել, երկուսն էլ HEAD-ից հավաքվում են (986/987 KB,
  output temp-ում, repo մաքուր)։ Flat-ի 6 string patch-ը Contains/regex-ով ստուգած — բոլորը բռնում
  են, world.js-ի T.* ցուցակը նույնն ա (նոր texture-ները անունով import են, texNS-ը չի փոխվում)։
  Main bundle-ը Chrome-ում boot՝ 194 obj, ON, maxFPS 0, UTF-8, console մաքուր. flat-ը՝ badge,
  պարապետ off, հիմքի ստվեր on։ Մեկ 47ms outlier flat-ի bench-ում boot-ից անմիջապես հետո, tab-ը
  hidden դառնալու պահին (texture upload/throttle) — մյուս 5 վազքում max ≤ 18։
  Լուսինեի §4-ը (bundle-ի `_img.decode()` hidden tab-ում կախված ա) էսօր էլ բռնեց — pane-ում
  bundle-ը boot չեղավ մինչև Chrome-ում չֆրոնտեցի։ Script-ինն ա, չդիպա։

  **Review-ի կետեր (Լուսինե).** (ա) desktop Chrome, visible tab, F → FPS-ը կայուն, ու
  `await __feel.perf(60)` վազքի ժամանակ՝ over40 = 0 (before-ի համար `__feel.app.ticker.maxFPS = 60`
  դիր ու նորից՝ over40 պիտի > 0 լինի — hitch-ի ապացույցը հենց տեղում). (բ) 💡 → «Հակա-թղթե» OFF/ON
  մոտիկով անցնող շենքի վրա՝ հիմքի ստվեր, կողի մգացում, պարապետ. (գ) գետինը մոտիկից՝ curb/dash
  ուղիղ (զիգզագ չկա), կարանները հոսում են, հեռվում shimmer չկա. (դ) 🌆 roadW քաշելիս գետինը
  հետևում ա (regen throttle). (ե) 375×812 `__feel.bench(3600)` max < 80, console մաքուր.
  (զ) Copy JSON-ում depthFx/sideDark/baseShadow, Reset → ON։
