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

### 2026-09-12 — Արեգ. փուլ 1-2 ավարտված, թասկը doing/-ում ա (փուլ 3-ը Տիգրանի պատասխանից հետո)

**Փուլ 1ա — tokens.json.** Քանդված ա. Primitives (Blue/Red/Yellow/Green 50–900,
Gray 0–900, Utility alpha, Typography, Numbers pool 18 արժեք) → Semantic (100%
alias. կոմպոնենտ-scoped Form Fields/Button/Toggle/Color Picker, Global Text/Shape,
Dimensions Radius/Height/Padding/Border/Size՝ կոմպոնենտային + Global սանդղակ,
Opacity)։ State suffix `-Hover/-Focus/-Active/-Error/-Selected`, Disabled =
Opacity։ Ձևաչափը՝ DTCG/Tokens Studio (`number`, ոչ `dimension`; `global` set
դատարկ; `$description` չկա)։ Թերությունները ազնիվ ցուցակով՝ architecture.md 3.2։

**Փուլ 1բ — Figma (read-only, 0 մուտացիա. 3 get_metadata, 3 use_figma read
script, 8 screenshot).** Բացահայտում. live ֆայլը JSON-ից առաջ ա անցել — 390
variable (Primitives 105, Semantic 285՝ Desktop/Mobile mode, որից 7-ն ա
տարբերվում), Typography լրիվ (16 size, 9 weight STRING, 7 lh ratio), Gap/Width
խմբեր, Colors/Global/{Frame,Stroke}, 6 նոր կոմպոնենտի semantic։ Atoms (`4:55`)
= Icons 43×3, Form Hint, Dropzone — state-ից անկախ leaf-եր։ Molecules
(`500:1686`) = State×Size variant set-եր (12 հատ) + կոմպոզիցիաներ (FormField,
LabeledToggle, Segmented Control…)։ Հին Button set-ը (Type variant, Click/Disable)
կողքին ա — նորերում Type-ը առանձին set ա դարձել. **մեկ set ↔ մեկ token խումբ**։
Binding-ը ամբողջական ա (root՝ height/padding/gap/radius×4/opacity/fill,
text՝ fill/size/weight/family)։ Line-height-ը style-երում PERCENT ա, variable-ի
կապված չի (Figma-ի սահմանափակումն ա, T-0012-ում մենք էլ դրան բախվեցինք)։
337 variable scope `[]`, բայց կապված — Tokens Studio-ով apply-ի հետք, հիմնադրին
հարց product.md-ում։

**Փուլ 1գ — `docs/design/architecture.md`** գրված ա. 1 Fun Builder token
արխիտեկտուրա · 2 Figma կազմակերպում · 3 պրոֆեսիոնալ գնահատական (7 ուժեղ, 10
թերի) · 4 համեմատություն մեր v1.2-ի հետ (աղյուսակ. համընկնում ա՝ ramp-եր, alpha,
100% alias, Global purpose, hidden primitives, disabled=opacity, typography շղթա;
տարբեր ա՝ Number pool, կոմպոնենտ-scoped կաղապար, state suffix, Sm/Md/Lg + xs…2xl,
Atoms/Molecules, set↔խումբ, DTCG export) · 5 Escort Gaming ստանդարտ (կաղապար,
Run Dady-ի բոլոր կոմպոնենտները քարտեզագրված, անվանակարգի 6 կանոն, scope
քաղաքականություն, էջեր) · 6 migration 6 քայլով + 3 ռիսկ։

**Փուլ 2 — dev.md** գրառում Տիգրանին. 7 հարց (CSS անվանակարգ + legacy alias
հորիզոն, Pixi-ի սպառում CSS/JS մոդուլ, DTCG export, Number pool CSS-ում, ֆրոնտի
state-երն ու մեխանիզմը, lh px/ratio, mode-երի ապագա)։ product.md-ում հիմնադրին
2 հարց (Tokens Studio, Button 3 set թե Kind variant)։

**Փուլ 3-ի ռիսկեր** (architecture.md 6). Button set-ի բաժանումը Screens-ի
instance swap ա պահանջում; legacy alias-ների կրկնակի շերտ; Figma-ում variable-ը
collection-ից collection API-ով չի տեղափոխվում (Layout/UI/Type→Semantic
միավորումը ID կփոխի — առաջարկում եմ չմիավորել)։

Fun Builder ֆայլում ոչ մի մուտացիա. Run Dady UI-ին էս session-ում ձեռք չեմ տվել։
