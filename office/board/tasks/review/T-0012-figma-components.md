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
