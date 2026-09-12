# T-0013 — Atomic token համակարգ (ամբողջական ramp-եր) + Bet պանել Stake-ի դասավորությամբ

- **Author.** Aram (founder), ձևակերպումը՝ Սևակ (lead)
- **Assignee.** Արեգ (designer)
- **Opened.** 2026-09-12
- **Priority.** P1 — հիմնադրի ուղիղ պատվերն ա, T-0012-ի շարունակությունը

## Հիմնադրի պատվերը (2026-09-12, բառացի ոգով)

«Շնորհակալ եմ շատ Արեգից, բայց պետք ա միքիչ խորանամ. թող ատոմիկով
հավաքի — ես որ ասում եմ semantic-primitive սենց համակարգ, նկատի ունեմ
սքրինշոթում ա։ Մեկ էլ՝ բեթ փարթը հավաքի խաղի, ոնց որ լինելու ա
Stake-ում, որ ընտրի հեշտությունը ու բարդությունը. ես հետո վրայից
կանցնեմ, կդզեմ»։

Հիմնադիրը ռեֆերենս design system-ի երկու սքրինշոթ ա տվել (Figma
Variables պանել). նկարագրությունը ստորև՝ «Ռեֆերենսը» բաժնում։

## Ինչ ա պետք

### Մաս 1 — Atomic token համակարգ ռեֆերենսի ոճով

1. **Primitives՝ ամբողջական թվային ramp-եր**, ոչ միայն anchor-ներ։
   Ռեֆերենսում ամեն գույն 10-11 քայլ ա՝ 0/50/100/200…900 (Gray-ը 11,
   մյուսները՝ 10)։ Մեր ընտանիքները (gray/night, navy, green, amber,
   red — կարիք լինի՝ blue) դարձնել լրիվ 0–900 սանդղակ։ Կոդի anchor
   գույները (gen-tokens.mjs-ի anchors-ը) ՍՈՒՐԲ են — ramp-ը կառուցվում
   ա անչորների ՇՈՒՐՋԸ, ոչ թե անչորը փոխվում ա ramp-ի տակ։
2. **Semantic՝ purpose-ով խմբավորված, ԱՄԲՈՂՋԸ alias primitives-ից**,
   ռեֆերենսի կառուցվածքով. `Colors/Global/{Frame, Shape, Text, Border,
   Icon}` + մեր խաղային շերտը (`Action`, `State`, `Surface`)։
   Ռեֆերենսում semantic-ը (285) primitives-ից (105) ՄԵԾ ա — ամեն
   օգտագործման տեղ իրա semantic-ն ունի. մենք էլ էդ ուղղությամբ ենք
   գնում, բայց առանց արհեստական ուռճացնելու՝ միայն իրական սպառողներով։
3. **Mode-երի կմախք.** ռեֆերենսի Semantic-ը mode ունի («Desktop»)։
   Մեզ մոտ World-ը արդեն 2 մոդ ա (Proto/Deep night)։ Գնահատի՝ Semantic
   collection-ին mode-եր հիմա պե՞տք են (օր. Desktop/Mobile spacing-ի
   համար), թե՞ single mode + World-ի մոդերը բավական են. որոշումդ
   փաստարկով գրի Log-ում — ֆեյք mode չենք սարքում, եթե սպառող չկա։
4. **Մեկ ճշմարտություն մնում ա gen-tokens.mjs-ը.** ամբողջ ramp-ն ու
   վերախմբավորումը ԳԵՆԵՐԱՏՈՐՈՒՄ ես անում → tokens.json / tokens.css /
   figma-kit վերագեներացվում են → Figma-ն սինքվում ա։ Հին semantic
   անունները (--rd-*) ու --ui-* alias-ները ՉԿՈՏՐԵԼ — ֆրոնտը դրանց վրա
   ա (T-0010 pending). վերանվանում ես՝ հին անունը alias ա մնում։
5. docs/design/ui-tokens.md-ն թարմացնել նոր կառուցվածքով։

### Մաս 2 — Bet պանել՝ Stake-ի խաղի դասավորությամբ

6. **Bet panel screen** Figma-ում՝ ոնց իրական Stake crash/instant
   խաղում ա լինելու. bet amount դաշտ (½ / 2× / max կոճակներով),
   **difficulty ընտրիչ** (հեշտ→բարդ սանդղակ. Stake-ի originals-ի
   ոգով՝ Easy/Medium/Hard/Expert տիպի segmented control կամ dropdown),
   Run/Bet կոճակ, balance/win ցուցադրում։ Մոբայլ-առաջին՝ 390×844
   frame + desktop տարբերակ։
7. Հավաքվում ա ՄԵՐ կոմպոնենտներից (Button 19:92, Input 20:22, icons
   18:40) — պակասող ատոմները (segmented control, stepper, chip)
   ստեղծի որպես նոր variable-կապած կոմպոնենտներ, նույն կարգով։
8. Հիմնադիրը ասել ա՝ «ես հետո վրայից կանցնեմ, կդզեմ» — ուրեմն
   կառուցվածքը մաքուր թող (auto-layout, անուններ, 0 hardcoded fill),
   որ իրա խմբագրելը հեշտ լինի։ Իրա 2:2 frame-ին ձեռք ՉՏԱԼ։

## Ռեֆերենսը (հիմնադրի սքրինշոթների նկարագրությունը)

**Սքրինշոթ 1 — Primitives collection (105 variable).**
Խմբեր՝ Colors 53 (Gray 11, Blue 10, Red 10, Yellow 10, …)։ Gray ramp-ի
երևացող մասը. 0=#FFFFFF, 50=#F7F8FA, 100=#EDEFF3, 200=#D9DDE3,
300=#BDC3CC — այսինքն թվային սանդղակ 0-ից մինչև մուգ։

**Սքրինշոթ 2 — Semantic collection (285 variable), mode սյուն «Desktop»։**
Խմբեր՝ Colors 129 → Global 25 → Frame 2, Shape 6, Text 11…
Օրինակներ. `Colors/Global/Frame/Default → Colors/Gray/100`,
`Colors/Global/Frame/Raised → Colors/Gray/0`,
`Colors/Global/Shape/Primary → Colors/Gray/0`։
Ամեն semantic-ը alias ա primitive-ից, ոչ մի raw hex semantic շերտում։

## Կանոններ

- figma-use + figma-generate-library skill-երը պարտադիր, փուլ առ փուլ,
  validate ամեն քայլից հետո. use_figma-ները sequential։
- Ֆայլը՝ «Run Dady UI» (JTDf8M2yHwzitpAAPzXnca), Aram-ի անձնական team.
  GBS work team-ին ՉԴԻՊՉԵԼ։
- Ամեն փուլից հետո commit քո անունով + push։
- Ավարտին՝ review/, ռեպորտ product.md-ում, հիմնադրի համար node
  լինկեր։ Դիզայնի վերջնական խոսքը հիմնադրինն ա (D-002)։

## Log

- [2026-09-12] Սևակ. բացվեց հիմնադրի ուղիղ պատվերից (երկու սքրինշոթ), approved։
- [2026-09-12] Արեգ. վերցրի, doing։ Ledger-ը (scratchpad figma-ds-state.json) հին
  էր՝ phase2. Figma-ի իրական «before»-ը կարդացի MCP-ով. Primitives 54 (միայն
  գույն, LADDER-ով), World 16/2 մոդ, UI 37, Layout 31 (14 hidden space + 17
  semantic), Type 53 (23 hidden + 30 font/*)։
- [2026-09-12] Արեգ. **Փուլ 1 — gen-tokens v1.2** (commit 360bc37, ce0e066).
  - *Ramp v2.* Հին LADDER-ը մեկ բազայից սպիտակ/սև խառնուրդ էր + override —
    դրանից navy/500 == navy/600 կրկնություն կար։ Նորը. anchor-ները ֆիքսված
    կետեր են, մնացած stop-երը երկու հարևան anchor-ի ԱՐԱՆՔՈՒՄ են
    ինտերպոլացվում, ծայրերից դուրս՝ վիրտուալ 0=#FFFFFF / 1000=#000000,
    լուսավոր կողմում ease t^1.5 (ռեֆերենսի Gray 50–300-ի պես բաց. night/100
    #F4F5F5 ≈ ref #EDEFF3, night/300 #C8C9CB ≈ ref #BDC3CC)։ night = մեր Gray,
    0…900 (11 stop), մյուսները 50…900 (10)։ Off-grid anchor-ները (red/450,
    navy/550, navy/650) մնում են՝ կոդի արժեքներ են։ Anchor-ներից ոչ մեկը
    չի փոխվել (ANCHOR աղյուսակը ֆայլի վերևում)։ Կողմնակի. amber/400 ու
    amber/600 (cashout pressed) non-anchor են ու փոքր-ինչ շարժվեցին
    (#F8BD5B→#FBB937, #CA8A1B→#C78819) — հիմա ramp-ի ՄԵՋ են, ոչ դրանից դուրս։
  - *Alpha primitives.* alpha/white/{12,35,50}, alpha/night/{92,55},
    alpha/green/{8,16,35}, alpha/amber/45 — միայն իրական սպառողներով։
    Semantic-ը հիմա 100% alias ա (գեներատորը raw string semantic-ը
    ՍԽԱԼ ա գցում)։ CSS-ում --rd-* անունների բազմությունը անփոփոխ,
    արժեքները՝ նույն rgba-ն var(--eg-alpha-*)-ով։ --ui-* alias-ները տեղում։
  - *Figma անուններ purpose-ով.* token-ի բանալին (text/primary) = CSS
    անունն ա, tokens.json-ում նոր `figmaNames` քարտեզ (Colors/Global/
    {Frame,Shape,Text,Border,Icon}/…, Colors/{Action,State,Surface,
    Difficulty}/…, Padding/…, Gap/…, Size/…, Stroke/…, Radius/…, Font/<Style>/
    …, hidden՝ Colors/<Family>/<stop>, Spacing/n, Font Size/n, Weight/…,
    Tracking/…, Line Height/…)։ Kit-ը (kit.src.js) lookup ա անում Figma
    անունով, fallback՝ հին բանալի → վերանվանում ա ՏԵՂՈՒՄ (ID-ն նույնը →
    binding-ները չեն կոտրվում)։ Mock-ում assertion. հին անուն չմնա, UI-ի
    ոչ մի COLOR raw չլինի։
  - *Bet պանելի token-ներ.* surface/segment (navy/700), surface/segment-
    selected (navy/500), difficulty/{easy,medium,hard,expert} = green/300,
    amber/200, amber/500, red/500 (heat սանդղակ), pad/track, gap/segments,
    pad/segment-x, pad/chip-x, size/chip (40), gap/section, size/dot,
    radius/inner (8 = control 12 − track pad 4, concentric)։
  - Արդյունք. 109 primitive + 92 semantic, mock-run OK։
- [2026-09-12] Արեգ. **Փուլ 2 — Figma sync MCP-ով** (4 sequential կանչ, մեկ
  collection = մեկ կանչ, kit-ի phaseVariables-ի նույն կոդով). Primitives 64
  (54 վերանվանված, 10 նոր), Layout 38 (31 վերանվանված, 7 նոր), Type 53 (53
  վերանվանված), UI 43 (37 վերանվանված, 6 նոր)։ Audit «after». legacy անուն 0,
  UI-ում raw COLOR 0 (բոլորը alias), primitives scopes [] + hidden, ALL_SCOPES
  0, code syntax 100%, Components էջում 572 binding / 0 hardcoded / 0 կախված,
  6 style × 5 binding։ Հիմնադրի 2:2-ը render-ով նույնն ա (արժեքները չեն
  փոխվել, binding-ները ID-ով են)։
- [2026-09-12] Արեգ. **Փուլ 3 — Bet պանել Figma-ում** (MCP, sequential, ամեն
  քայլից հետո screenshot/metadata)։ Node-id-ներ (ֆայլ JTDf8M2yHwzitpAAPzXnca).
  - **Components էջ (18:2), նոր set-եր.** Chip `37:55` (State Default/Pressed/
    Selected/Disabled, Label prop — ½ / 2× / Max ու preset-ներ)։ Segment
    `38:83` (Level Easy/Medium/Hard/Expert × State Default/Selected/Pressed =
    12; label = Level, prop չկա — TEXT prop-ի default-ը բոլոր variant-ների
    վրա էր նստում)։ Difficulty `39:99` (Selected=Easy…Expert; track Frame/
    Segment + Padding/Track 4 + Gap/Segments 4 + Radius/Control 12, մեջը 4
    Segment FILL՝ Radius/Inner 8 concentric)։ Bet Amount `40:115` (State
    Default/Focus/Error; props Label/Value/Unit/Helper/Show helper; ½ 2× Max
    chip-երը ԴԱՇՏԻ ՄԵՋ՝ 4px inset, 40 ⊂ 48 — Stake-ի pattern-ը)։ **Bet Panel
    `41:88`** (390; Bet Amount → Difficulty section (label + segmented + «Max
    win» տող) → Button Kind=Bet Size=Large FILL; Padding/HUD, Gap/Section,
    Frame/Panel)։
  - **Screens էջ (նոր, 42:47).** Mobile 390×844 `42:48` (header balance +
    History/Settings icon-ներ, canvas World/sky-mid՝ պատմության pill-եր +
    Display/Multiplier + state, ներքևում Bet Panel instance՝ վերևի անկյունները
    Radius/Chip)։ Desktop 1280×800 `43:120` (Bet Panel ձախ սայդբար 390 ×
    FILL, աջում header + canvas՝ մոբայլի clone-ներ)։
  - **Foundations.** «Components — v2 (T-0013)» doc `46:47` (x=2424, հիմնադրի
    2:2-ից ու v1 21:2-ից աջ)։ 2:2-ը անձեռնմխելի (100,100 · 6 երեխա · 3
    world-night swatch տեղում)։
  - **Audit «after».** Components էջ՝ 8 set/component, 238 bound paint, 0
    hardcoded, 0 կախված; Screens՝ 2 × 48 bound, 0 hardcoded; բոլոր
    padding/gap/radius/minHeight/stroke՝ variable։ Variables. Primitives 64 ·
    Layout 40 · Type 53 · UI 43 · World 16 = 216 (ոչ-World 200 = գեներատորի
    201 − family/mono-css)։
  - **Screenshot-ների եզրակացությունները.** (1) Difficulty՝ heat կետերը
    (կանաչ→դեղին→նարնջ→կարմիր) մեկ հայացքով կարդացվում են, Selected-ը
    հստակ (fill + սպիտակ տեքստ)։ (2) Desktop սայդբարը 320-ով փորձեցի —
    4 segment-ը սեղմվեց (Medium/Expert 14px mono + կետ + padding = 93 > 67).
    սայդբարը 390 դրեցի (= մոբայլի պանել, մեկ չափ) ու pad/segment-x-ը 12→8
    (85 = 85, ճշգրիտ)։ (3) Bet Amount set-ի screenshot-ում label/helper-ը
    «չէին երևում» — set-ը fill չունի, սպիտակ ֆոնին white-50% տեքստ. պանելի
    մուգ ֆոնին տեղն են։ (4) Disabled chip-ը (opacity 0.4) մուգ պանելի վրա
    գրեթե անտեսանելի ա — դիզայն-հարց հիմնադրին (տես ստորև)։
- [2026-09-12] Արեգ. **Որոշումներ ու փաստարկներ.**
  - **Mode-եր (կետ 3). Semantic-ին mode ՉԵՄ ավելացրել։** Փաստարկ. ֆեյք mode
    = սպառող չունեցող mode։ (a) կոդում ոչ մի token չկա, որ platform-ով
    տարբերվի — index.html-ում `@media` չկա, մոբայլ/desktop տարբերությունը
    ԴԱՍԱՎՈՐՈՒԹՅՈՒՆՆ ա (sheet vs սայդբար), ոչ արժեքը (touch 48-ը desktop-ում
    էլ ա մնում, Stake-ի desktop պանելը մոբայլից չի տարբերվում չափերով);
    (b) light theme Stake-ի խաղում չկա, պանելը միշտ մուգ ա; (c) ռեֆերենսի
    «Desktop» mode-ը վեբ-ապպի ա, ոչ խաղի։ Mode-ի իրական թեկնածուն World-ն ա
    (արդեն 2 մոդ), ու ապագա «Live» feel-ը (skyDark 0.75) — դա առանձին թասկ։
    Երբ Web SDK ինտեգրացիան platform-ով տարբեր արժեք բերի (օր. desktop-ում
    pad/hud 24), գեներատորում mode ավելացնելը մեկ օբյեկտ ա։
  - **Collection-ների կառուցվածքը չեմ վերադասավորել** (Primitives/Layout/
    Type/UI մնացին, ռեֆերենսի «2 collection»-ի փոխարեն)։ Variable-ը
    collection-ից collection չի տեղափոխվում API-ով — պիտի ջնջվեր ու
    ստեղծվեր, ինչը 572 binding-ի (Button/Input/style-եր + հիմնադրի 2:2
    swatch-երը) rebinding էր պահանջելու։ Purpose-ով խմբավորումը անունների
    մեջ ա (Colors/Global/…), primitives-ը hidden — ռեֆերենսի կառուցվածքը
    Variables պանելում նույն կերպ ա կարդացվում։
  - **Input 20:22-ը չեմ փոխել, Bet Amount-ը նոր set ա.** Input-ի դաշտը
    16px symmetric padding ա, chip-երը մեջը դնելը աջ padding-ը 4 ա ուզում
    (Stake-ի inset)։ Մեկ set-ում երկուսն էլ առանց conditional padding չեն
    պահվում — Input-ը մնում ա ընդհանուր տեքստային դաշտ, Bet Amount-ը
    խաղինն ա։ Ազնիվ դուբլիկացիա, նշված ա description-ում։
  - **Difficulty՝ 4 մակարդակ, բայց քանակը մաթինն ա.** Անանիայի T-0002 B
    տարբերակը 2 mode ա (base + long_run)։ Set-ը 2–5-ի ա ձգվում (Segment
    Level variant-ները հանել/ավելացնել)։ Անունները (Easy/Medium/Hard/
    Expert) Stake originals-ի ոգով են — թեմատիկ տարբերակը («Կարճ վազք /
    Երկար վազք») հիմնադրի ընտրությունն ա։
  - **«Max win 1,000×»-ը placeholder ա** (մաթի թիրախը որոշված չի)։
  - **Ramp-ի կողմնակի փոփոխություն.** amber/400, amber/600 (cashout pressed)
    non-anchor են ու շարժվեցին ramp-ի մեջ (տես փուլ 1)։
  - **Ինչ ՉԱՐՎԵՑ.** Preset chip-երի շարք (5/10/20/50, պրոտոյում կա, Stake-ում
    չկա) — Chip-ը կա, panel-ում չեմ դրել։ Auto-bet tab (Manual/Auto) —
    burst խաղին վաղ ա։ Kit plugin-ի (figma-kit) component փուլերը նոր
    set-երը դեռ չեն ստեղծում — variables փուլը լրիվ սինք ա, կոմպոնենտները
    MCP-ով են; kit-ի Chip/Segment/Difficulty/Bet Amount փուլերը առանձին
    փոքր թասկ ա, եթե offline կրկնօրինակը պետք լինի։
- [2026-09-12] Արեգ. → review/։ Լուսինե, ստուգելու տեղերը. (1) repo՝
  `node tools/design/gen-tokens.mjs` դետերմինիստիկ (git diff դատարկ),
  `node tools/design/figma-kit/test/mock-run.mjs` OK, tokens.css-ում --rd-*
  բազմությունը հին + 13 նոր, --ui-* alias-ները տեղում; (2) Figma՝ Variables
  պանել (Primitives Colors/<Family>/0…900 hidden, UI-ում 0 raw), Components
  էջի 5 նոր node, Screens էջ, Foundations 46:47; 2:2 անձեռնմխելի։
  **Դիզայնի վավերացումը հիմնադրինն ա (D-002).** Հարցերը իրեն՝ product.md-ում։
- [2026-09-12] Լուսինե (qa). **Review ԱՆՑԱՎ → done/**։ Ամեն պնդում՝ ինչ արեցի / ինչ ստացա.
  - *Anchor-ները անփոփոխ.* Հին գեներատորի (437e0fe) base+override 17 anchor hex-ը
    համեմատեցի v1.2 ANCHOR աղյուսակի ու tokens.json-ի ելքի դեմ — 0 շարժված
    (green 300/500/600/700, amber 200/300/500/900, red 400/450/500,
    navy 550/600/650/700, night 800/900)։ night 0…900՝ 11 stop, night/0=#FFFFFF;
    մյուսները 50…900, off-grid 450/550/650-ը տեղում։
  - *CSS անուններ/արժեքներ.* Հին tokens.css-ի --rd-* բազմությունը ամբողջությամբ
    պահված ա + 13 նոր, --ui-* 8/8։ Լուծված արժեքների diff՝ միայն 2 փոփոխություն —
    --rd-action-cashout-pressed-top/bottom (#F8BF5B→#FBB937, #CA8A1B→#C78819) =
    Արեգի բացահայտած amber/400/600 ramp-շարժը (Log-ում #F8BD5B ա գրած — մանր
    տառասխալ, իրական հինը #F8BF5B էր)։ Ֆրոնտի (index.html) օգտագործած 12 var-ից
    ոչ մեկը cashout-pressed չի — ֆրոնտին չի կպնում. մնացած «diff»-երը միայն
    case/format են (#fff vs #FFFFFF, .35 vs 0.35)։ --ui-spd-ն ֆրոնտի լոկալ var ա,
    tokens.css-ում երբեք չի եղել — orphan 0։
  - *Regen դետերմինիստիկ.* node gen-tokens.mjs → git status/diff դատարկ ✓։
  - *mock-run.* exit 0, «MOCK RUN: OK», 201 variable / 6 style / 291 binding ✓։
  - *100% alias-ի ջարդման փորձ.* Ժամանակավոր "qa/raw-test": "#FF0000" semantic
    ավելացրի → գեներատորը ընկավ «Error: semantic raw value: #FF0000» (exit 1) ✓,
    հետ գցեցի, regen՝ ծառը մաքուր։ tokens.json-ում raw semantic string՝ 0։
  - *Թվեր.* tokens.json-ից անկախ հաշվեցի՝ 109 primitive + 92 semantic ✓,
    figmaNames՝ 201 գրառում, ✓։ ui-tokens.md-ն v1.2 կառուցվածքով ա ✓։
  - *Figma (read-only MCP, 7 sequential կանչ, 0 մուտացիա).* 216 variable —
    Primitives 64 · Layout 40 · Type 53 · UI 43 · World 16 ✓։ Փոքրատառ legacy
    անուն ոչ-World collection-ներում՝ 0 (World-ի world/*-ը կանխամտածված ա)։
    ALL_SCOPES՝ 0։ Primitives՝ բոլորը hidden, scopes [] ✓։ UI-ի COLOR-ներում
    raw արժեք՝ 0 (բոլորը alias) ✓։ Անունները purpose ոճով են
    (Colors/Action/Bet/Default, Radius/Control, Font Size/10…) ✓։
  - *Node-եր.* Chip 37:55, Segment 38:83 (12 variant), Difficulty 39:99,
    Bet Amount 40:115, Bet Panel 41:88 — 169 node սկան. hardcoded solid/gradient
    paint՝ 0, բոլոր padding/gap/radius/minHeight՝ bound։ 5 strokeWeight «կասկած»
    ստուգեցի առանձին — բոլորը bound են individual strokeTop/Bottom/Left/Right-
    Weight-ով + stroke գույնը alias. false positive էր, խնդիր չկա։
  - *Screens.* 42:47 էջ, Mobile 42:48 = 390×844, Desktop 43:120 = 1280×800,
    երկուսում էլ 0 hardcoded, bet-panel instance-ները տեղում ✓։ Doc 46:47
    «Components — v2 (T-0013)» x=2424 ✓։
  - *2:2 անձեռնմխելի.* (100,100), 964×1349, 6 երեխա, 3 swatch-ը (2:117/121/125)
    տեղում ✓։
  - *Վիզուալ սանիտի (screenshot).* Mobile — 4 segment-ը տեղավորվում ա, heat
    կետերը կարդացվում են, տեքստ կտրված չկա, ½/2×/Max chip-երը դաշտի մեջ են,
    Selected-ը հստակ։ Desktop — 390 սայդբար, նույն պանելը, ամեն ինչ տեղավորվում
    ա։ Երկուսն էլ մաքուր։
  - *Բաց (ոչ բլոկեր, D-002).* Հիմնադրի 5 որոշումը (difficulty անուններ/քանակ,
    սայդբար 390, disabled chip, mode-եր, on-bet/lh) — դիզայնի վավերացում ա,
    review-ի fail չի։
