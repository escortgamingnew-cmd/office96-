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

Արխիվի նոթ. փուլ 1-2-ի ֆայլերը (architecture.md, dev.md, product.md, էս Log-ը)
զուգահեռ session-ների պատճառով իմ commit-ի փոխարեն Սևակի `87f740a`-ի մեջ են ընկել
(approved→doing rename-ը՝ Հասմիկի `0511dc3`-ի)։ Բովանդակությունը իմն ա, ստորագրությունը՝
ոչ — ուղղում եմ էս տողով, պատմությունը չեմ վերագրում։ (Արեգ)

### 2026-09-13 — Արեգ. փուլ 3 ավարտված → review/

Տիգրանի պատասխանը (dev.md 09-12 23:58) ընդունված ամբողջությամբ. slot բառարան
`bg fg border glow h w size pad gap radius` (`size`-ը ես ավելացրի՝ քառակուսի չափերի
համար. icon/dot — մեկ թիվ, ոչ w+h), top/bottom = axis, track/dot/pill/label/helper = part,
JS մոդուլ nested frozen, DTCG հավելյալ + count-check, `--eg-space/--eg-radius` ջնջված,
hover չի գեներացվում, lh միայն px, mode չկա։

**3.1 gen-tokens.mjs v2.0** (`f5af385`). Number pool `number/<n>` 17 արժեք (0…48, 999;
28/56 հանված՝ font size են)։ Semantic 92 → 136, բանալու գրամատիկա
`<component>[/<part>]/<slot>[-<axis>][-<state>]` — `parse()`-ը error ա գցում բառարանից
դուրս slot-ի, raw արժեքի, pool-ում չեղած թվի, գունային slot-ի թվի, hover-ի ու
bg/fg չունեցող կոմպոնենտի վրա։ Figma անուն / CSS / JS՝ մեկ բանալուց, ձեռքի FIG
քարտեզը վերացավ (PREV_FIG-ը միայն միգրացիայի համար ա)։ 45 legacy `--rd-*` alias +
12 `--ui-*`։ Ստուգում. 103 հին --ui/--rd անուն HEAD-ի tokens.css-ի դեմ → 0 արժեքային
շարժ, dropped միայն --eg-space/--eg-radius. regen ×2 md5 նույնը։ Նոր արտեֆակտներ՝
`docs/design/tokens.dtcg.json` (105 + 136, հիմնադրի color/number/text բարբառ,
$description ամեն semantic-ի), `prototype/pixi-feel/src/tokens.js` (RD, 0xRRGGBB,
{color, alpha}, JSDoc typedef), index.html splice `@tokens` marker-ով (marker չկա՝ բաց,
Տիգրանը T-0010-ում ա դնում)։ Kit-ը TOKENS.figma-ից ա սնվում, mock-run-ը v1.2 Figma
անուններից ա սկսում ու in-place rename-ի ID-ն ա ստուգում — OK։

**3.2 Run Dady UI** (`e1fed71`, MCP, 13 use_figma). Layout՝ 40 rename (Spacing→Number,
Padding/Gap/Size/Stroke→Dimensions/*, Radius primitives→Global/Radius alias) + 21 նոր.
UI՝ 36 rename + 18 նոր (Field/*, Chip pressed/selected, Segment content, Button
Border-Focus). Type՝ 30 description։ Rebind՝ Button 90, Input 34, Chip 24, Segment 88,
Difficulty 16, Bet Amount 46 (instance subtree-ները չեմ դիպել՝ ժառանգում են) + Screens
balance gap (Number/2 primitive binding → նոր `panel/balance/gap`)։ Էջեր՝ Components →
**Atoms** (18:2), նոր **Molecules** (59:305), 8 section (Atoms · Icons/Button/Input/Chip/
Segment, Molecules · Bet Amount/Difficulty/Bet Panel), Foundations-ում «Design system —
v2.0 (T-0014)» doc 60:231 (x=3624)։ Աուդիտ. 256 variable (64/16/61/62/53), v1.2 անուն 0,
ALL_SCOPES 0, Atoms 937 / Molecules 913 / Screens 702 binding, primitive binding 0,
hardcoded fill 0, missing main 0։ Collection-ները ՉԵՆ միավորվել (ռիսկ գ). 2:2-ին ձեռք
չեմ տվել. Button set-ը Kind variant-ով ա։ Ledger՝ scratchpad/figma-ds-state.json։

**3.3 Դոկ.** ui-tokens.md v2.0 (արտեֆակտների աղյուսակ, գրամատիկա, կոմպոնենտային
աղյուսակներ, ֆրոնտի սպառում, Figma էջեր), architecture.md §5 փաստացի վիճակով, §6
migration-ի փաստ + աուդիտ, **§7 հաջորդ պրոյեկտի checklist**, kit README (backlog)։

**Հիմնադրի որոշումներին մնաց.** (1) Button set՝ 3 set, թե Kind variant (token խմբերն
արդեն առանձին են, միայն Figma-ի կողմն ա). (2) Tokens Studio-ի հաստատումը (DTCG-ն
իրա ֆայլի բարբառով ա, `dimension`/`fontFamily` չեմ անցել՝ որ Figma sync-ը ուտի).
(3) T-0013-ից բաց՝ Bet-ի մուգ տեքստ, lh px, difficulty անուններ, desktop 390։
**Տիգրանին.** src/tokens.js-ի ձևը վերջնական ա, index.html-ի marker-ը ու bundle-ի
Load-Module տողը T-0010-ում. legacy-ի ջնջումը review-ից հետո։

QA-ի համար (Լուսինե). regen ×2 diff 0, mock-run OK, `git show HEAD~2:docs/design/tokens.css`
դեմ 103 անուն 0 շարժ (script-ը Log-ի վերևում ա նկարագրված), Figma աուդիտի թվերը վերևում,
read-only ստուգում՝ variable count 256, `Colors/Action/*`/`Spacing/*` անուն չկա։

### 2026-09-13 — Լուսինե (qa). Review ԱՆՑԱՎ → done/

**Repo կողմ (ամեն ինչ անկախ վազեցրած, ոչ թե Log-ից արտագրած).**

1. **Regen դետերմինիստիկ.** `node tools/design/gen-tokens.mjs` ×2 → `git diff` 0 տող։
   Գեներատորի սեփական հաշվետվությունը՝ 105 primitives (pool 17) + 136 semantic +
   45 legacy alias, DTCG count-check OK, index.html splice բաց (marker չկա — սպասված)։
2. **mock-run** exit 0. v1.2 Figma անուններից ա սկսում, 21 in-place rename + 191 նոր,
   MOCK RUN: OK։
3. **Ջարդման 5 թեստ** (ներարկում → վազք → վերականգնում, ամեն մեկից հետո ծառը մաքուր).
   - `button/bet/bg-hover` → error «"hover" state-ը չի գեներացվում» ✓
   - `"button/bet/bg": "#2EC27E"` (raw hex) → error «semantic raw value» ✓
   - `{number/9}` (pool-ում չկա) → error «bad ref … pool-ում/primitives-ում չկա» ✓
   - `button/bet/txt` (բառարանից դուրս slot) → error «slot բառարանից դուրս» ✓
   - `button/bet/fg: {number/12}` (գունային slot-ին թիվ) → error «գունային slot-ը թիվ չի կարա լինի» ✓
   Բոլորը exit 1, restore-ից հետո regen → diff 0։
4. **103 հին --rd-*/--ui-* անուն՝ 0 շարժ, ԱՆԿԱԽ վերարտադրված.** իմ սեփական CSS var
   resolver-ով (var() շղթաները ռեկուրսիվ լուծող script) `git show 3d479c4:docs/design/tokens.css`
   (v2.0-ից առաջվա վիճակը) ընդդեմ ընթացիկի. 103 անուն, missing 0, արժեքային շարժ 0։
   Ջնջվածը ՃԻՇՏ 21 `--eg-space-*`/`--eg-radius-*` ա, ուրիշ ոչ մի անուն չի կորել։
5. **Anchor-ներ.** ANCHOR բլոկը 3d479c4 ↔ HEAD բիթ-առ-բիթ նույնն ա (17 hex՝ green 4,
   amber 4, red 3, navy 4, night 2)։
6. **tokens.dtcg.json.** Անկախ leaf-հաշվարկ ($value ունեցող node-եր). Primitives 105 +
   Semantic 136 — համընկնում ա tokens.json-ի հետ։
7. **src/tokens.js.** node-ով import՝ OK. `RD` deep-frozen (նաև nested), գույները 0xRRGGBB
   (bet.bg = 0x2EC27E), glow = {color, alpha}, camelCase բանալիներ։ 7 խաչաձև արժեք
   tokens.json-ի դեմ (bet/bg, bg-pressed, cashout/bg-bottom-pressed #C78819,
   field/border-focus #FFD27A, chip/bg-selected #56617A, field/h 48, segment/dot-size 8) —
   բոլորը 1:1։
8. **--eg-space/--eg-radius.** grep prototype/ + tokens.css → 0 hit. index.html-ը սպառում
   ա ՄԻԱՅՆ 12 `--ui-*` var (--eg-*/--rd-* չկա) — Տիգրանի փաստը ստուգված։

**Figma կողմ (JTDf8M2yHwzitpAAPzXnca, 7 use_figma read script + 2 screenshot, sequential, 0 մուտացիա).**

9. **256 variable** = Primitives 64 / World 16 / UI 61 / Layout 62 / Type 53 —
   Արեգի 64/16/61/62/53-ի հետ 1:1։ v1.2 հին անուն (Colors/Action/*, Spacing/*, …) 0,
   ALL_SCOPES 0, hover անուն 0, Primitives-ի scopes բոլորի մոտ `[]`։ Semantic-ի 3
   collection-ը (UI/Layout/Type) առանձին են — չմիավորված, ինչպես որոշված էր (ռիսկ գ)։
10. **Էջեր.** Foundations 0:1 / Atoms 18:2 / Molecules 59:305 / Screens 42:47։
    Doc frame 60:231 «Design system — v2.0 (T-0014)»՝ Foundations, x=3624, 1100×843,
    բովանդակությունը՝ շերտեր + կաղապար։ Հիմնադրի 2:2-ը՝ (100,100), FRAME, 6 երեխա —
    անձեռնմխելի։
11. **Binding-ներ.** Screens՝ **702 ճշգրիտ** (իմ node+paint alias հաշվարկը թիվ-առ-թիվ
    նստեց Արեգի թվի վրա), instance 26, **missing main 0**։ Atoms՝ իմ մեթոդով 919
    (806 node + 104 paint + 9 effect), Molecules՝ 887+ — Արեգի 937/913-ից մի քիչ ցածր՝
    հաշվման մեթոդի տարբերություն ա (Screens-ի ճշգրիտ համընկնումը ցույց ա տալիս, որ
    երկուսս էլ նույն բանն ենք չափում), ծածկույթի էությանը չի կպնում։
12. **Primitive-ուղիղ binding 0** երեք էջում էլ (ամեն bound variable-ի collection-ը
    ստուգած)։ **Hardcoded fill կոմպոնենտների ներսում 0** — միակ unbound SOLID fill-երը
    8 SECTION-ների ֆոներն են (canvas կազմակերպում, token surface չի)։
13. **Set-եր.** Atoms՝ Button 18 variant (Kind×Size×State — Kind-ը ՏԵՂՈՒՄ ա, հիմնադրի
    բաց որոշում, fail չի), Input 3, Chip 4, Segment 12. Molecules՝ Bet Amount 3,
    Difficulty 4, Bet Panel։ 8 section՝ «Atoms · Icons/Button/Input/Chip/Segment»,
    «Molecules · Bet Amount/Difficulty/Bet Panel»։
14. **Screenshot սանիտի.** Atoms ու Molecules էջերը ռենդերվում են կարգին. Button-ի
    bet/cashout/ghost state-երը, Input-ի default/focus/error, Difficulty-ի 4 selected
    վիճակ, Bet Panel կոմպոզիցիան — կտրված տեքստ, ջարդված layout չկա։

**Երկու ոչ-բլոկեր դիտարկում.**
- tokens.json-ի Type collection-ում 54 Figma անուն կա, ֆայլում՝ 53. պակասը
  `Family/Mono CSS`-ն ա — կանխամտածված (CSS font stack string, T-0012-ի նույն
  նախադեպը), արձանագրում եմ, որ հաջորդ ստուգողը count-ի «անհամապատասխանությունից»
  չկասկածի։
- Binding-ների բացարձակ թվերը (937/913) ստուգողի script-ից են կախված. հաջորդ անգամ
  audit script-ը commit-ի մեջ լինի (kit-ի test/-ում), որ QA-ն թիվ-առ-թիվ նույն
  մեթոդով վազեցնի։

Հիմնադրի բաց որոշումները (Button 3 set / Kind, Tokens Studio, T-0013-ի վավերացումներ)
review-ի բլոկեր չեն — product.md-ում են։ (Լուսինե)
