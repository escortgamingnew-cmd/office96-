# T-0014 — Հիմնադրի Fun Builder արխիտեկտուրայի ուսումնասիրություն ու մեր design system-ի հավասարեցում

- **Author.** Aram (founder), ձևակերպումը՝ Սևակ (lead)
- **Assignee.** Արեգ (designer), փուլ 2-ում՝ + Տիգրան (developer)
- **Opened.** 2026-09-12
- **Priority.** P1 — սա ստուդիայի ՍՏԱՆԴԱՐՏՆ ա դառնալու բոլոր գալիք պրոյեկտների համար

## Հիմնադրի պատվերը (2026-09-12, բառացի ոգով)

«Նախկինում ես համակարգ էի հավաքել էս ճանապարհով — tokens.json-ը կտամ,
արխիտեկտուրան կհասկանաք։ Fun Builder ֆայլի atom էջն ու molecule էջը՝
լինկերով։ Արեգը թող սա ուսումնասիրի որպես օրինակ — սա ԻՄ դիզայն
արխիտեկտուրան ա — ու մի հատ Տիգրանի հետ խոսա, հետո սկսի design
system-ը էս արխիտեկտուրային մոտեցումով կարգավորի, որ մնացած
պրոյեկտներն էլ նույն ձևով տանենք»։

## Ռեֆերենսները

1. **tokens.json** — `docs/design/reference/fun-builder-tokens.json`
   (հիմնադրի բնօրինակը, W3C/Tokens Studio ձևաչափ)։
2. **Atoms էջ** — https://www.figma.com/design/YchCC4giM1vJENUyy0gzbL/Fun-Builder?node-id=4-55
3. **Molecules էջ** — https://www.figma.com/design/YchCC4giM1vJENUyy0gzbL/Fun-Builder?node-id=500-1686

**Fun Builder ֆայլը ՄԻԱՅՆ ԿԱՐԴԱԼՈՒ ա** — հիմնադրի անձնական աշխատանքն
ա, ոչ մի մուտացիա էնտեղ։

## Ինչ ա պետք

### Փուլ 1 — Ուսումնասիրություն (Արեգ)

1. tokens.json-ի արխիտեկտուրան քանդել-հասկանալ ու գրավոր ամփոփել
   (`docs/design/architecture.md` նոր դոկ). նկատած առանցքային
   սկզբունքները ներառյալ, օրինակ.
   - Primitives = Colors (50–900 ramp-եր) + Typography + **Numbers՝
     մեկ ընդհանուր թվային pool**, որից ALIAS-ով են սնվում բոլոր
     չափային semantic-ները (Radius/Height/Padding/Border/Size)։
   - Semantic-ը **կոմպոնենտ-scoped** ա. `Button/Primary/Background`,
     `Form Fields/Border-Focus`, `Toggle/Thumb-Active` — ամեն
     կոմպոնենտ իրա semantic ենթախումբն ունի, state-երը՝ `-Hover`,
     `-Focus`, `-Error`, `-Active` suffix-ներով։
   - Global ենթախմբեր ընդհանուրի համար (Text, Shape, Radius/Global,
     Padding/Global xs…2xl, Opacity)։
2. Fun Builder-ի Atoms ու Molecules էջերը MCP-ով կարդալ (read-only).
   ինչ ա atom, ինչ ա molecule հիմնադրի մոտ, էջերի կազմակերպումը,
   անվանումները, variant կառուցվածքը — ամփոփել architecture.md-ում։
3. Համեմատել մեր ընթացիկի հետ (T-0012/T-0013). ինչն ա արդեն
   համընկնում, ինչն ա տարբեր, ինչ migration ա պետք։

### Փուլ 2 — Խոսակցություն Տիգրանի հետ (Արեգ ↔ Տիգրան, dev.md)

4. Արեգը dev.md-ում գրում ա առաջարկն ու ԿՈՆԿՐԵՏ հարցերը Տիգրանին.
   կոմպոնենտ-scoped token-ների CSS անվանակարգը (--rd-button-primary-bg
   ոճ), ֆրոնտի սպառման ձևը, tokens.json-ի export ձևաչափը (Tokens
   Studio համատեղելիությո՞ւն), Numbers pool-ի արտապատկերումը կոդում։
   Տիգրանը պատասխանում ա, համաձայնությունը ֆիքսվում ա dev.md-ում։

### Փուլ 3 — Իրականացում (Արեգ)

5. gen-tokens.mjs-ը հավասարեցնել էս արխիտեկտուրային. Numbers-ի պես
   մեկ թվային primitive pool, կոմպոնենտ-scoped semantic խմբեր,
   state suffix կոնվենցիա։ Anchor-ները ՍՈՒՐԲ են, --rd-*/--ui-* CSS
   անունները չկոտրել (alias-ով պահել)։
6. «Run Dady UI» ֆայլի էջերը վերակազմակերպել Atoms/Molecules
   մոտեցումով (մեր Button/Input/Chip/Segment = atoms, Bet Amount/
   Difficulty/Bet Panel = molecules)։ Հիմնադրի 2:2-ը՝ անձեռնմխելի։
7. Ամբողջը փաստաթղթել այնպես, որ ՀԱՋՈՐԴ պրոյեկտը 0-ից նույն
   կառուցվածքով բացվի (template մտածողություն)։

## Կանոններ

- Run Dady UI (JTDf8M2yHwzitpAAPzXnca) — խմբագրելի. Fun Builder
  (YchCC4giM1vJENUyy0gzbL) — ՄԻԱՅՆ read-only։
- figma-use (+generate-library փուլ 3-ում) skill-երը պարտադիր,
  use_figma sequential։
- Ամեն փուլ՝ commit + push. ավարտին review/, ռեպորտ product.md։

## Log
