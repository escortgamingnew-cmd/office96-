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
