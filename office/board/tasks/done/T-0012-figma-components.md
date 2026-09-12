# T-0012 — Figma v2. variable-ների ստուգում + կոմպոնենտ կիթ (Button/Input/Icons)

- **Author.** Aram (founder), ձևակերպումը՝ Սևակ (lead)
- **Assignee.** Արեգ (designer)
- **Opened.** 2026-09-12
- **Priority.** P1 — հիմնադիրը հենց հիմա Figma-ում ա աշխատում, սա իրա ուղիղ պատվերն ա

## Ինչ ա պետք

Հիմնադրի ուղղությունը (product.md, 2026-09-12 14:08), իրա բառերով.
primitive գրուպ՝ որից ոչ մի էլեմենտ ՉԻ սնվում, semantic՝ որից սնվում
են ԲՈԼՈՐ style-երը. ֆոնտները variable. հետո կոմպոնենտներ՝ button-ներ,
input-ներ, icon set։

1. **Variables-ի աուդիտ ու ամրացում** «Run Dady UI» ֆայլում
   (JTDf8M2yHwzitpAAPzXnca). primitives-ը միայն hidden/reference դեր
   (scopes՝ []), semantic-ը՝ միակ սպառվող շերտը. text style-երը
   կապել Type variable-ներին (family/size/weight/tracking), ոչ hardcode։
2. **Button կոմպոնենտ** variant-ներով. Bet (կանաչ) / Cashout (սաթե
   gradient) / Ghost (Keep Running) × states (default/pressed/disabled),
   բոլոր fill/radius/padding/text՝ variable-կապած։ Կոնտրաստի հարցդ
   (action/on-bet) լուծի հենց էստեղ՝ քո առաջարկով։
3. **Input կոմպոնենտ** (bet amount դաշտի ոգով)՝ default/focus/error
   state-երով, variable-կապած։
4. **Icon set v1** — խաղի UI-ի իրական կարիքից (+/−, ✕, ⚙, ▾, replay ▶,
   history)՝ մեկ չափի grid-ով, INSTANCE_SWAP-ի համար պատրաստ։
5. Foundations էջին՝ կոմպոնենտների documentation բաժին. before/after
   screenshot-ները՝ թասկի Log-ում։

Կանոններ. figma-generate-library + figma-use skill-երի կարգով
(variables → components, մեկ-մեկ, validate ամեն քայլից հետո)։ Կոդի
tokens-ի հետ սինքը (gen-tokens.mjs) մնում ա մեկ ճշմարտություն —
Figma-ում նոր token ես մտցնում՝ գեներատորին էլ ես ավելացնում։

## Կոնտեքստ

- Հիմնադիրը ինքն էլ դիզայներ ա ու ֆայլում զուգահեռ աշխատում ա —
  համագործակցի, մի ջնջի իրա ձեռքով արածը. հարց լինի՝ product.md։
- Քո 09-12 գնահատականի 2-3 կետերը (product.md) հենց սա էին —
  հիմնադիրը փաստացի կանաչ լույս ա տվել։

## Log

- [2026-09-12] Սևակ. բացվեց հիմնադրի product-ի պատվերից, approved
  (հիմնադրի թասկ, D-002)։ Արեգը արթնացվում ա որպես design task routing
  (D-009) — սա D-010-ի «չաթի արթնացում» չի, գործի հանձնարարություն ա։
- [2026-09-12 17:10] Արեգ. վերցրի, doing։ Հիմնադրին պատասխանեցի product-ում։
- [2026-09-12 17:25] Արեգ. **Blocker.** Figma MCP-ն Starter plan-ի tool-call
  սահմանին խփեց (Figma doc՝ View/Collab seat = 20/ամիս, Dev/Full = 200/օր;
  բոլոր զանգերը հիմա մերժվում են, ներառյալ use_figma-ն)։ Հասցրի ամբողջ
  variables inventory-ն վերցնել (5 collection, 97+ var, scopes/code syntax/alias
  վիճակը) — audit-ի «before»-ը դա ա։ MCP-ի սպասելը հիմնադրի պատվերը հետ էր
  քաշելու, դրա համար ճանապարհը փոխեցի, ոչ թե նպատակը։
- [2026-09-12 19:40] Արեգ. **Լուծումը՝ tools/design/figma-kit/** — local Figma
  plugin նույն Plugin API-ով, ինչ use_figma-ն, առանց quota-ի։ gen-tokens.mjs-ը
  հիմա գեներացնում ա նաև `figma-kit/code.js` (TOKENS + kit.src.js) — մեկ
  ճշմարտությունը մնաց մեկ։ Հիմնադիրը Figma-ում import ա անում manifest-ը ու
  «Run all» — 6 փուլ. variables audit → text styles binding → icons → Button →
  Input → Foundations doc։ Ամեն node `rdkit` մարկերով, կրկնակի վազքը միայն իր
  արածն ա փոխարինում. հիմնադրի ձեռքի աշխատանքն անձեռնմխելի ա։
  - **Audit-ի ուղղումները (before → after).** Primitives՝ scopes արդեն [] էին,
    բայց code syntax չկար ու hidden չէին → `var(--eg-*)` + hidden։ Layout-ում
    space/6..16-ը GAP scope-ով բացահայտ էին (սպառվող primitive) → []։ Type
    primitives (family/size/weight/tracking) սպառվող scope-երով էին ու text
    style-երը դրանցից ուղիղ չէին էլ սնվում (hardcode) → նոր `font/<style>/*`
    semantic շերտ (30 var), style-երը 5 դաշտով կապված, primitives՝ hidden։
    Line-height ընդհանրապես չկար → lh/tight|snug|base։ Code syntax-ը հին
    --ui-* alias-ներից տարվեց canonical --rd-*/--eg-* անուններին (alias-ները
    CSS-ում մնում են)։
  - **Կոնտրաստ (կետ 2-ի պահանջը).** `action/on-bet` → night/900. Bet-ի տեքստը
    8.4:1 (pressed 6.3:1) սպիտակի 2.3:1-ի փոխարեն, Cashout-ի amber/900 (9.4:1)
    սկզբունքով։ Այլընտրանք՝ green/900՝ 5.2:1 / pressed 3.95:1 (pressed-ը AA-ից
    ցածր) — դրա համար night/900-ն եմ դրել, հիմնադիրը կվավերացնի (D-002)։
  - **Նոր token-ներ գեներատորում (Սևակ, սինքի համար).** 17 semantic + 30 font/*
    + lh սանդղակ + space/1 (ցուցակը ui-tokens.md v1.1 բաժնում)։ Բոլորը միայն
    primitive-ի alias կամ rgba — semantic-ը հում արժեք չի կրկնում։ CSS-ում
    հին --ui-* alias-ները չեն կոտրվել։ Սևակ, եթե անուններից մեկը կոդի
    պայմանականության դեմ ա՝ գրի, գեներատորում մեկ տող ա։
  - **Կոմպոնենտներ.** Button 18 variant (Kind Bet/Cashout/Ghost × Size
    Large/Base × State Default/Pressed/Disabled), props Label / Show icon /
    Icon (INSTANCE_SWAP, 7 icon preferred)։ Ghost-ը պրոտոյի `.lost #hold`-ից ա
    (green 8% fill, green/500 2px border, green/300 տեքստ)։ Disabled =
    opacity/disabled 0.4, glow off։ minHeight = size/touch 48։ Input 3 state
    (Default hairline / Focus amber 2px+glow / Error red + state/loss helper),
    props Label/Value/Unit/Helper/Show helper։ Icons 7 (Plus, Minus, Close,
    ChevronDown, Replay, History, Settings), 24 grid, stroke 2, icon/primary։
  - **Վերիֆիկացիա.** Mock Plugin API harness (`figma-kit/test/mock-run.mjs`)՝
    ամբողջ հոսքը անցնում ա. 291 variable binding, 108 bound paint, 9 bound
    effect, 0 hardcoded fill Button-ում, style-երի 5×6 binding-ը ստուգված,
    փուլերի սխալ կարգը հասկանալի error ա տալիս։ Իրական Figma render-ը
    (screenshot «after») ինձ մոտ չկա — quota. հիմնադիրը վազեցնելուց հետո
    Components էջին «Kit run report»-ը կլինի, ու Լուսինեն կարա ֆայլում ստուգի։
  - **Ինչ ՉԱՐՎԵՑ ու ինչու.** Live world set (իմ 09-12 գնահատականի 3-րդ կետ) —
    T-0012-ի շրջանակից դուրս էր, առանձին թասկ։ Before/after screenshot —
    quota-ի պատճառով «before»-ը inventory-ն ա (վերևում), «after»-ը հիմնադրի
    վազքից հետո։ Icons-ի gear-ը իմ ձեռքով ա (ոչ Feather/Lucide)՝ լիցենզիայի
    հարց չլինի։
- [2026-09-12 19:45] Արեգ. → review/։ Լուսինե, ստուգելու կարգը README-ում ա.
  mock-run + (հիմնադրի վազքից հետո) Figma-ում Button/Input/Icons + Foundations
  «Components — v1»։ Դիզայնի վավերացումը հիմնադրինն ա (on-bet-ի ընտրությունը
  ներառյալ)։
- [2026-09-12 21:05] Արեգ. **Pro եկավ, MCP-ով եմ ավարտում.** հիմնադիրը Figma-ն
  Pro դարձրեց (product.md 14:40) — quota-ի blocker-ը վերացավ։ Թասկը ետ քաշեցի
  doing/։ Kit-ի 6 փուլը նույն կարգով վազեցնում եմ use_figma-ով (kit.src.js-ը
  script-երի աղբյուր ա), ամեն փուլից հետո validate + screenshot։
- [2026-09-12 22:40] Արեգ. **Ավարտված ա ուղիղ Figma-ում (MCP)։** Հիմնադրի 2:2
  frame-ին ձեռք չեմ տվել։ Node-id-ներ (ֆայլ JTDf8M2yHwzitpAAPzXnca).
  - **Button set՝ `19:92`** (Components էջ, 18:2) — 18 variant, props Label /
    Show icon / Icon (INSTANCE_SWAP, 7 icon preferred)։ Screenshot «after»՝
    18 variant-ը դարձած, gradient-ը 2 stop-ով variable-կապած։
  - **Input set՝ `20:22`** — 3 state, props Label/Value/Unit/Helper/Show helper։
  - **Icons՝ frame `18:40`**, Icon/Plus 18:44, Minus 18:48, Close 18:52,
    ChevronDown 18:56, Replay 18:61, History 18:66, Settings 18:71։
  - **Foundations doc՝ «Components — v1» `21:2`** (հիմնադրի frame-ից աջ, x=1224)։
  - **Audit «after».** Primitives 96՝ scopes [] (radius-ը CORNER_RADIUS), hidden,
    code syntax var(--eg-*)։ Semantic 79՝ 0 ALL_SCOPES, բոլորը var(--rd-*),
    68 alias primitive-ի վրա (մնացածը rgba/opacity/lh px՝ դիտավորյալ)։
    6 text style × 5 binding (family/size/weight/tracking/lh)։ Button+Input՝
    66 կապված paint, 0 hardcoded։
  - **Երկու բաց հարցը փակվեց իրական վազքով.** (1) gradient stop-ի
    `boundVariables.color`-ը աշխատում ա — Cashout-ը իսկական gradient ա, ոչ
    solid fallback։ (2) Roboto Mono-ի style-ը «SemiBold» ա (առանց բացատ),
    Inter-ինը՝ «Semi Bold» — listAvailableFontsAsync-ով ստուգված։
  - **Անսպասելի գտածո — line-height.** Variable-ին կապված lineHeight-ը
    Figma-ում ՄԻՇՏ px ա մեկնաբանվում (PERCENT binding չկա). lh/tight=100-ը
    Display-ի վրա 100px էր դարձել։ Լուծում՝ font/<style>/lh-ն px ա (size ×
    ratio, կլորացված. 56/24/19/17/14/17), lh/* primitive-ը մնում ա ratio-ի
    աղբյուր CSS-ի համար։ gen-tokens.mjs, kit.src.js, ui-tokens.md թարմացված,
    tokens.json/css վերագեներացված, mock harness OK։ Սևակ/Տիգրան՝ CSS-ում
    --rd-font-*-lh հիմա px ա (19px), ոչ unitless — Web SDK-ում հենց դա ա պետք։
  - **Pro մոդեր (կետ 3).** World collection՝ «Proto» (հին Value) + «Deep night»
    (23:0)։ world/*-ի 9 var-ը երկրորդ մոդում world-night/*-ի արժեքներն են
    (lamp/neon՝ նույնը)։ world-night/* 7 var-ը ՉԵՄ ջնջել — հիմնադրի 2:2-ում 3
    swatch դրանց ա կապված. hidden + «Deprecated → mode Deep night» նկարագրով։
    Հիմնադիր, երբ swatch-երը world/*-ին տեղափոխես՝ ջնջում եմ։ World-ը
    գեներատորում չկա (Figma-only շերտ ա) — մոդերի սինքը gen-tokens-ում
    առանձին թասկ ա, եթե պետք լինի։
  - **Ինչ մնաց.** Ոչինչ «Ինչ ա պետք»-ից։ Կողքի նոթեր. Label prop-ի default-ը
    («Place Bet») set-ի բոլոր variant-ների վրա ա (Figma TEXT prop-ի բնույթը),
    doc-ում instance override-ով ա (Cash Out / Keep Running)։ Doc-ի
    բացատրական տեքստը անգլերեն ա — Noto Sans Armenian-ը ֆայլում հասանելի չի,
    Inter-ը հայերեն գլիֆ չունի։ Կիթ plugin-ը (figma-kit/) մնում ա որպես
    offline կրկնօրինակ, MCP-ի հետ սինք։
- [2026-09-12 22:45] Արեգ. → review/։ Լուսինե, ստուգելու տեղը Figma-ն ա.
  Components էջ (Button 19:92, Input 20:22, Icons 18:40) + Foundations «Components
  — v1» 21:2 + Variables panel (primitives hidden, World 2 մոդ)։ mock-run-ը
  դեռ անցնում ա։ Դիզայնի վավերացումը հիմնադրինն ա (on-bet = night/900)։
- [2026-09-12 23:15] Լուսինե (qa). **Review ԱՆՑԱՎ → done/։** Ինչ ստուգեցի ու ոնց.
  - **Repo.** `node tools/design/gen-tokens.mjs` մաքուր tree-ի վրա —
    tokens.json/tokens.css/figma-kit/code.js դետերմինիստիկ վերագեներացվում են,
    git diff դատարկ։ `figma-kit/test/mock-run.mjs`՝ OK, exit 0 (291 binding,
    108 bound paint, 9 effect — Log-ի թվերի հետ 1:1)։ tokens.css-ում
    `--rd-font-*-lh` = 56/24/19/17/14/17 px ✓։ Հին `--ui-*` alias-ները անվնաս
    են. index.html-ի օգտագործած բոլոր 11 անունները ծածկված են (`--ui-spd`-ն
    tokens-ից չի, լոկալ անիմացիայի փոփոխական ա index.html:10-ում)։
  - **Figma (MCP, read-only).** Primitives՝ 0 ALL_SCOPES, hidden, scopes []
    (radius-ը CORNER_RADIUS, ինչպես գրված ա), code syntax `var(--eg-*)`։
    Semantic՝ 0 ALL_SCOPES, բոլորը `var(--rd-*)`։ Հաշվարկը ճշտեցի
    անուն-առ-անուն diff-ով. Figma 175 var (ոչ-World) = գեներատորի 176 −
    `family/mono-css` (CSS string, Figma-ում կիրառելի չի) → 96 primitive +
    79 semantic, ճիշտ ինչպես Log-ում։ 6 text style × 5 binding
    (family/size/weight/tracking/lh), lineHeight-ը PIXELS ✓։
  - **Կոմպոնենտներ.** Button 19:92՝ COMPONENT_SET, 18 variant
    (Kind×Size×State), props Label / Show icon / Icon (INSTANCE_SWAP) ✓;
    fill-երի ամբողջ սկան՝ 36 bound paint, **0 hardcoded** (Cashout-ի gradient
    stop-երը ներառյալ՝ բոլորը variable-bound)։ Input 20:22՝ 3 state
    (Default/Focus/Error) + 5 prop ✓։ Icons 18:40՝ 7 կոմպոնենտ
    (Plus/Minus/Close/ChevronDown/Replay/History/Settings) ✓։ World՝ 2 մոդ
    (Proto / Deep night), world-night/* 7-ը hidden + «Deprecated → Deep night»
    նկարագրով ✓ — Log-ի սահմանափակումների ցուցակը ազնիվ ա (doc-ը իրոք
    անգլերեն ա, world-night-ը իրոք դեռ կա)։
  - **Screenshot 19:92.** Bet-ի տեքստը մուգ ա (ոչ սպիտակ), Cashout-ը իսկական
    2-stop սաթե gradient, Ghost-ը կանաչ եզրագիծ + կանաչ տեքստ, Disabled
    սյունը 0.4 opacity՝ խամրած ✓։
  - **Հիմնադրի 2:2-ը** անձեռնմխելի ա — x=100, y=100, հին swatch/type
    կառուցվածքով, world-night swatch-երը (2:117, 2:121, 2:125) տեղում են։
    «Components — v1» 21:2-ը x=1224՝ աջից, չեն հատվում ✓։
  - Մանր նիտ, ֆիքս չի պահանջում. Log-ի «68 alias»-ը իմ հաշվով 62 ա
    (UI 26 + Layout 12 + Type 24); ոչ-alias 17-ի բացատրությունը ճիշտ ա
    (11 rgba/opacity + 6 lh px)։
  - **ԴԻԶԱՅՆԻ վավերացումը հիմնադրինն ա (D-002) ու դեռ սպասվող** — on-bet =
    night/900 կոնտրաստի ընտրությունը ու lh px որոշումը Արամը պիտի հաստատի։
    QA-ն փակում ա ֆունկցիոնալ կողմը, ոչ դիզայնը։
