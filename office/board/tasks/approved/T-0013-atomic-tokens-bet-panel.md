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
