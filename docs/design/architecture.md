# Design system արխիտեկտուրա — Fun Builder մոդելը ու Escort Gaming ստանդարտը

**Կարգավիճակ.** T-0014 փուլ 1 (ուսումնասիրություն), Արեգ, 2026-09-12։ Փուլ 2-ը՝
Տիգրանի հետ համաձայնեցում dev.md-ում, փուլ 3-ը՝ իրականացում (gen-tokens.mjs +
Run Dady UI)։ Դոկը գրված ա, որ ՀԱՋՈՐԴ պրոյեկտը 0-ից նույն կառուցվածքով բացվի։

**Աղբյուրները.**
- `docs/design/reference/fun-builder-tokens.json` — հիմնադրի Fun Builder
  design system-ի token-ների snapshot (Tokens Studio export, W3C DTCG ձևաչափ)։
- Figma «Fun Builder» `YchCC4giM1vJENUyy0gzbL` — Atoms (`4:55`) ու Molecules
  (`500:1686`) էջեր, read-only կարդացված MCP-ով (0 մուտացիա)։
- Մեր ընթացիկը՝ `docs/design/ui-tokens.md` + `tools/design/gen-tokens.mjs`
  (v1.2, T-0012/T-0013)։

Կարևոր նախադիտողություն. **tokens.json-ը ու live Figma ֆայլը նույն համակարգի
երկու ժամանակակետ են**։ JSON-ում 53 գույն + 4 font size + 18 թիվ primitives ու
~150 semantic ա, մեկ մոդ («Mode 1»). live ֆայլում 105 primitive + 285 semantic
ա, Semantic-ը երկու մոդ ունի (Desktop / Mobile), Typography-ն լրիվ ա (16 size,
9 weight, 7 line-height), ավելացել են Gap/Width խմբերը ու 6 նոր կոմպոնենտի
semantic-ները։ Ստորև արխիտեկտուրան նկարագրում եմ live վիճակով, JSON-ի
տարբերությունները նշելով էնտեղ, որտեղ սկզբունքային են։

---

## 1. Fun Builder — token արխիտեկտուրան

### 1.1 Շերտերը

```
Primitives (collection «Primitives», 1 mode)
   │  հում արժեքներ. Colors ramp-եր, Typography, Dimension/Numbers pool
   ▼
Semantic (collection «Semantic», modes Desktop / Mobile)
   │  100% alias primitives-ի վրա. կոմպոնենտ-scoped + Global խմբեր
   ▼
Text styles (16) → Components (Atoms / Molecules) → Screens
```

Երրորդ collection «global» դատարկ ա (0 variable) — Tokens Studio-ի default
set-ի հետքն ա (`$metadata.tokenSetOrder: ["global", …]`)։

Երկու շերտ, ոչ երեք. **component շերտը semantic-ի ՄԵՋ ա** (Colors/Button/
Primary/Background), ոչ թե առանձին collection։ Սա հիմնադրի մոդելի առանցքն ա.
«semantic» = «ինչի համար ա արժեքը», ու կոմպոնենտի slot-ը հենց էդ «ինչի համար»-ն
ա։ Global խմբերը (Text, Shape, Frame, Stroke, Global Dimensions, Radius/Global)
կոմպոնենտից ԴՈՒՐՍ սպառողների համար են (layout, ազատ տեքստ, doc frame-եր)։

### 1.2 Primitives

| Խումբ | Բովանդակություն | Նոթ |
|---|---|---|
| Colors/Blue · Red · Yellow · Green | 50…900, 10 stop | brand = Blue/500 (#407BFF) |
| Colors/Gray | **0…900, 11 stop**, 0 = #FFFFFF | live-ը՝ #F7F8FA / #EDEFF3 / … / #020406. մեր night ramp-ի ռեֆերենսը (T-0013) |
| Colors/Utility | Transparent (#FFFFFF00), Black-20 (#00000033) | alpha primitive-ի գաղափարը — մեր `alpha/*`-ի նախատիպը |
| Typography/Font Family | Poppins (STRING) | մեկ ընտանիք |
| Typography/Font Size | 10…72, 16 stop (JSON-ում՝ 4) | |
| Typography/Font Weight | Thin…Black, 9 STRING («SemiBold») | Figma-ի fontStyle binding-ը STRING ա |
| Typography/Line Height | None 1 · Tight 1.1 · Snug 1.2 · Normal 1.4 · Relaxed 1.5 · Loose 1.6 · Extra Loose 1.75 | ratio — style-երին ԿԱՊՎԱԾ ՉԵՆ (տես 3.2) |
| **Dimension** (JSON-ում «Numbers») | 0 1 1.5 2 4 6 8 12 14 16 18 24 30 32 36 40 48 50 100 | **մեկ թվային pool**. spacing, height, radius, border, opacity — բոլորը սրանից |

Numbers pool-ի սկզբունքը. primitive թիվը ինքնին ոչինչ չի «նշանակում». 8-ը
radius ա, gap ա, padding ա՝ կախված semantic-ից, որը դրան հղվում ա։ 100-ը
միաժամանակ Radius/Pill ա (px) ու Opacity/Enabled (%) — նույն primitive-ը,
տարբեր իմաստներ։

### 1.3 Semantic — կոմպոնենտ-scoped խմբեր

Ամեն ինտերակտիվ կոմպոնենտ ունի **իր** semantic ենթախումբը, ու բոլորը նույն
կաղապարով են (live ֆայլի ուշ կոմպոնենտներում կաղապարը լրիվ նստած ա).

```
Colors/<Component>/
   Background · Background-Hover · Background-Active
   Text-Main  · Text-Main-Hover  · Text-Main-Active   (հին խմբերում՝ Content)
   Icon       · Icon-Hover       · Icon-Active
   Border     · Border-Hover     · Border-Focus · Border-Error …
Dimensions/Height/<Component>/  Sm · Md · Lg
Dimensions/Padding/<Component>/ Padding-X-Sm/Md/Lg · Padding-Y-Sm/Md/Lg · Padding-Track
Dimensions/Gap/<Component>/     Gap-None · Gap-Inner-Tight · Gap-Inner-Loose · Gap-Track
Dimensions/Radius/<Component>/  <Component> (+ Track)
Dimensions/Width/<Component>/   Width · Thumb Width · Width-Min (միայն երբ պետք ա)
```

Կոմպոնենտները live-ում. Form Fields (32 գույն), Color Picker, Button/{Primary,
Secondary, Panel, Icon}, Toggle, UI Segment, Canvas Tab, Dropzone, Dropdown Menu,
Accordion Item։ Չափային կաղապարը (Height/Padding/Gap/Radius) ամեն մեկի համար
առանձին ա՝ **նույնիսկ երբ արժեքները համընկնում են** (Height/Field, Height/Button,
Height/Icon Button, Height/Dropdown Menu բոլորը 36/40/48)։ Սա գիտակցված ա.
Button-ի բարձրությունը փոխելը Field-ին չի կպնում։

Global խմբեր (կոմպոնենտից անկախ).

| Խումբ | Անդամներ |
|---|---|
| Colors/Global/Text | Primary · Emphasized · Secondary · Tertiary · Muted · Disabled · Inverse · Brand · Error · Success · Warning |
| Colors/Global/Shape | Brand · Error · Primary · Secondary · Tertiary · Inverse |
| Colors/Global/Frame | Default · Raised |
| Colors/Global/Stroke | Subtle · Default · Strong · Inverse · Focus · Disabled |
| Dimensions/Global Dimensions | None 0 · Min 1 · 3xs 2 · 2xs 4 · xs 6 · sm 8 · md 12 · lg 16 · xl 24 · 2xl 30 |
| Dimensions/Radius/Global | None · xs 4 · sm 8 · md 12 · lg 24 · Pill 100 |
| Dimensions/Width/Border Width | None 0 · Default 1 · Medium 1.5 · Thick 2 |
| Text/Desktop & Mobile, Text/Desktop | Display 64/42 · H1 48/32 · H2 36/28 · H3 28/24 · H4 20 · H5 18 · Body Large 16 · Body 14 · Body Small 12 · Caption 11 · Overline 10 |
| Text/Weight, Text/Line Height | primitives-ի semantic alias-ներ (Weight/Semibold → Typography/Font Weight/Semibold, Line Height/Body → Relaxed) |
| Opacity | Enabled 100 · Disabled 50 · None |

### 1.4 State կոնվենցիան

State-ը slot-ի **suffix** ա, ոչ առանձին մակարդակ. `Border-Focus`, `Background-Hover`,
`Thumb-Active`, `Text-Hint-Error`։ Հանդիպող suffix-ները. `-Hover`, `-Focus`,
`-Active`, `-Selected`, `-Error`, `-Warning`, `-Success`, `-Drag`։ Default-ը
suffix ՉՈՒՆԻ (`Background`, ոչ `Background-Default`)։ **Disabled-ը գույն չունի** —
մեկ Opacity/Disabled ա ամբողջ կոմպոնենտի վրա (component-ի root-ի opacity-ն
կապված ա Opacity/Enabled-ին, disabled variant-ում՝ Opacity/Disabled)։ Սա շատ
էժան ու հետևողական մոտեցում ա. disabled-ը state ա, ոչ palette։

Չափային սանդղակները երկու անվանակարգով են. կոմպոնենտայինը՝ **Sm/Md/Lg**
(կոմպոնենտի Size variant-ի հետ 1:1), Global-ը՝ **xs…2xl** (t-shirt)։

### 1.5 Scope-երի քաղաքականությունը

Live ֆայլում. 105 primitive-ն էլ scopes `[]` (picker-ում ՉԵՆ երևում), semantic-ից
232-ը նույնպես `[]`, ու միայն 53-ն են ALL_SCOPES (Colors/Global/* + Opacity)։
Tokens.json-ում պատկերն այլ ա (Gray/Yellow/Green ramp-երն ու Form Fields-ը
ALL_SCOPES, Global Dimensions-ը ամեն թվային scope-ից ԲԱՑԻ CORNER_RADIUS/OPACITY,
Radius/Global-ը միայն CORNER_RADIUS, Text-ը TEXT_FILL, Shape-ը SHAPE_FILL)։

Երկու հետևություն. (ա) JSON-ի scope-երը՝ էնտեղ, որտեղ դրված են, ճիշտ
դիսցիպլինա են (spacing արժեքը radius-ի չես կարա կպցնես), բայց հետևողական չեն
դրված. (բ) live ֆայլում 337 variable `[]` scope-ով, բայց կոմպոնենտներում
կապված — սա ասում ա, որ binding-ը արվել ա **ոչ Figma-ի picker-ով**, այլ գործիքով
(Tokens Studio «apply»)։ Հիմնադրի հաստատումն ա պետք, բայց ձևաչափն էլ, `global`
set-ն էլ, `$extensions.com.figma.*`-ն էլ դրա վրա են ցույց տալիս։

### 1.6 Ձևաչափը

W3C DTCG draft (`$value`, `$type`, `$extensions`) Tokens Studio-ի բարբառով.
- set-երը = collection + mode («Primitives /Mode 1», «Semantic /Mode 1»);
- alias-ը dot-path ա առանց set-ի (`{Colors.Gray.100}`, `{Numbers.8}`),
  լուծվում ա `tokenSetOrder`-ով;
- `$type`-երը՝ `color`, `number`, `text`։ Standard DTCG-ն `dimension`
  (արժեք + միավոր) ու `fontFamily` կուզեր. `number`-ը Figma variable-ի FLOAT-ն ա,
  ոչ DTCG-ի `dimension`-ը — Style Dictionary-ի պես գործիք unit չի իմանա;
- `$description` ոչ մի token-ի վրա չկա;
- `$themes: []` — theme-ը Figma mode-ով ա արվում, ոչ Tokens Studio theme-ով։

### 1.7 Live ֆայլի էվոլյուցիան (snapshot-ից հետո)

- Semantic-ին ավելացել ա **Desktop / Mobile** mode։ 285-ից միայն 7 token ա
  տարբերվում. Text/Desktop/{Display, H1, H2, H3} (64→42, 48→32, 36→28, 28→24) +
  3 մանր (Dropdown Menu/Background-Active 800↔500, Accordion radius 6↔4,
  Dropzone/Background-Drag)։ Այսինքն մոդը ՄԻԱՅՆ display տիպոգրաֆիայի համար ա
  իմաստալից. մնացած 278-ը երկու մոդում նույնն են։
- Ավելացել են Gap/… ու Width/… խմբերը, Colors/Global/{Frame, Stroke},
  Text/Weight ու Text/Line Height semantic-ները։
- Primitives-ի «Numbers»-ը վերանվանվել ա «Dimension»։

---

## 2. Fun Builder — Figma-ի կազմակերպումը

### 2.1 Atoms էջ (`4:55`)

Երեք set. **Icons** (43 icon × 3 size = 129 variant, `Icon=<name>, Size=24|20|16`),
**Form Hint** (`Type=Default|Warning|Success|Error` — icon + hint տեքստ),
**Dropzone** (`State=Default|Drag`, միայն icon+label վիզուալը)։

Atom = **state-ից անկախ, ինքնուրույն իմաստ չունեցող leaf**. icon-ը, հուշող
տեքստը, dropzone-ի ներքին պատկերը։ Atom-ը Size variant ունի, բայց ոչ
State×Size grid։

### 2.2 Molecules էջ (`500:1686`)

Երկու մակարդակ ՆՈՒՅՆ էջում.

1. **Variant set-եր** (ինտերակտիվ control-ներ). TextInput, Dropdown, Toggle,
   Dimension/Input, Control Field, ColorPickerRow, Primary/Secondary/Panel/Icon
   Button, Canvas Tab, UI Segment, Dropzone, MenuItem, AccordionItem։ Կաղապարը՝
   `State=Default|Hover|Active|Disabled × Size=Sm|Md|Lg` (12 variant) +
   boolean prop-եր (`Show Prefix Icon`, `Show Leading Icon`, `Show Label`,
   `Show Indicator`)։ Form-ի կոմպոնենտները Hover-ի փոխարեն `Error` ունեն
   (TextInput՝ Default|Hover|Error|Disabled|Active, FormField՝
   Default|Error|Warning|Success)։
2. **Կոմպոզիցիաներ** (առանձին component, առանց variant-ի, boolean/instance-swap
   prop-երով). FormField = Label + TextInput + Form Hint; LabeledToggle = Label +
   Toggle; Segmented Control = track + UI Segment×n; Canvas Tabs; DimensionGroup;
   ColorField; LayoutSizing; Control Field (instance-swap slot-ով)։

Molecule = **state ունեցող control, կամ control-ների կոմպոզիցիա**։ Organisms
էջ չկա — Fun Builder-ը փոքր գործիք ա, երկու մակարդակը բավարարել ա։

### 2.3 Ամենակարևոր կապը. մեկ set ↔ մեկ token խումբ

Հին «Button» set-ը (`5:271`, 24 variant, `Type=Primary|Secondary × State=Default|
Hover|Click|Disable × Size=40|36|32`) դեռ էջում ա՝ առաջին սերունդ։ Նորերում
Type-ը հանված ա variant-ից ու դարձել ա **առանձին set** (Primary Button,
Secondary Button, Panel Button, Icon Button)։ Պատճառը հենց token-ներն են.
Colors/Button/Primary ու Colors/Button/Secondary տարբեր խմբեր են, ու set-ը
կապվում ա ՄԵԿ խմբի — variant-ը կարա state/size փոխի, բայց ոչ token խմբի
արմատը։ Անվանակարգն էլ մաքրվել ա. Click→Active, Disable→Disabled,
40/36/32→Lg/Md/Sm։

### 2.4 Փաստաթղթային կաղապարը

Ամեն molecule՝ մեկ frame «Molecules <Name>». սև header (Label՝ «Molecules» +
անուն), սպիտակ «Inputs» body, մեջը կապույտ dashed frame-ով variant grid-ը
(տողերը՝ Size, սյուները՝ State), ներքևում կոմպոզիցիաների instance-ները։
Համաչափ ա ու սկան անելիս ամեն ինչ մեկ հայացքով ա։

### 2.5 Binding-ի խորությունը

Ստուգած օրինակներ (read-only). Primary Button Md-ի root-ը կապված ա
Padding/Button/X, Gap/Button/Gap-None, Height/Button/Md, Radius/Button (4 անկյուն
առանձին), Opacity/Enabled, fills→Colors/Button/Primary/Background; Label-ի
fills→…/Content, fontSize→Text/Desktop & Mobile/Body, fontStyle→Text/Weight/
Medium, fontFamily→Typography/Font Family/Poppins։ TextInput-ը՝ նույն ձևով +
strokes ու strokeWeight ×4։ **Hardcoded արժեք չկա** — մեր T-0012/13 կանոնի հետ
1:1։ Text style-երը (16 հատ. Display/XL, Heading/XL…XXXS, Body/L…S, Label/L…S,
Caption, Overline) size/weight/family-ով variable-ի են կապված, line-height-ը
PERCENT ա ու ԿԱՊՎԱԾ ՉԻ (տես 3.2)։

---

## 3. Պրոֆեսիոնալ գնահատական

### 3.1 Ինչն ա ուժեղ (ու վերցնում ենք որպես ստանդարտ)

1. **Կոմպոնենտ-scoped semantic-ը նույն կաղապարով.** Background/Text/Icon/
   Border × state suffix, Height/Padding/Gap/Radius × Sm/Md/Lg։ Նոր կոմպոնենտ =
   կաղապարը լրացնել, ոչ հորինել։ Սա էն ա, ինչ «մնացած պրոյեկտները նույն ձևով
   տանելու» համար պետք ա։
2. **Մեկ թվային pool.** Radius-ը, padding-ը, height-ը մեկ սանդղակից — մեկ
   արժեք ավելացնելը մեկ տեղ ա։
3. **Disabled = opacity, ոչ palette.** Կրկնակի գույներ չկան, ամեն կոմպոնենտ
   disabled ա դառնում մեկ token-ով։
4. **100% alias semantic-ում.** Ստուգեցի. ոչ մի semantic raw արժեք չունի։
5. **Set ↔ token խումբ 1:1** (2.3)։ Կոմպոնենտի կառուցվածքն ու token-ի
   կառուցվածքը միմյանց արտացոլում են։
6. **Ոչ մի hardcoded արժեք կոմպոնենտներում**, 4 անկյունը ու 4 stroke-ը
   առանձին կապված — կանոնը կիրառված ա մինչև վերջ։
7. **Փաստաթղթային կաղապարը** — մեկ frame, մեկ header, մեկ grid կանոն։

### 3.2 Ինչն ա թերի (ազնիվ ցուցակ, առանց շողոքորթության)

1. **Անվանակարգի հետևողականությունը քայքայվում ա հին→նոր անցումում.**
   `Content` ↔ `Text-Main` (նույն slot-ը երկու անուն), `Text Placeholder`
   (բացատ) ↔ `Text-Hint-Default` (գծիկ), `Thumb  Height` (կրկնակի բացատ),
   `Width/Toggle 2`, `Text-Drag 2` (Figma-ի auto-suffix-ը մնացել ա),
   `Dimensions/Width/{None,Default,Thick}` ու `Dimensions/Width/Border Width/*`
   կրկնվում են։ Հին Button set-ը (Click/Disable/40) նոր set-երի կողքին ա։
   Սա ձեռքով աճած համակարգի բնական հետք ա — մեր գեներատորն էս խնդիրը
   կառուցվածքով վերացնում ա (անունը կոդից ա ծնվում, ձեռքով չի գրվում)։
2. **Gap խմբի մեջ padding կա** (`Gap/Field/Padding-None`, `Gap/Button/Padding-None`),
   Padding/Toggle-ի մեջ՝ Width/Height/Thumb radius։ Խմբի անունը slot-ի իմաստից
   շեղվել ա։
3. **Scope-երը հետևողական չեն** (1.5). JSON-ում որոշ ramp ALL_SCOPES ա, որոշը՝
   ոչ. live-ում 337-ը դատարկ։ Primitives-ի հանելը picker-ից ճիշտ ա (մեր T-0013
   կանոնը), բայց semantic-ը դատարկ scope-ով նշանակում ա, որ դիզայները picker-ից
   կոմպոնենտի token չի կարա ընտրի — միայն գործիքով։
4. **Numbers/100 = Pill.** 100px radius-ը pill ա մինչև 200px բարձրություն. մեր
   Bet կոճակը 48 ա, խնդիր չկա, բայց սանդղակի ընդհանուր կանոն լինելու համար
   999-ը անվտանգ ա (մեր ընթացիկը)։ Նույն 100-ը Opacity/Enabled ա — pool-ի
   սկզբունքով ճիշտ, բայց unit-ը կորած ա (տես 5-ը)։
5. **DTCG `number` ≠ `dimension`.** Export-ը Figma-կենտրոն ա. կոդային
   pipeline-ը (Style Dictionary) միավոր չի ստանա, `text`-ը `fontFamily` չի։
   Tokens Studio-ից դուրս ձևաչափը կիսա-ստանդարտ ա։
6. **Line-height-ը կապված չի.** Typography/Line Height primitives (1.1…1.75) ու
   Text/Line Height semantic կան, բայց 16 text style-ից ոչ մեկը lineHeight-ը
   variable-ի չի կապել — PERCENT ա ձեռքով։ Պատճառը Figma-ի սահմանափակումն ա
   (variable-ին կապված lineHeight-ը միշտ px ա, T-0012-ում մենք էլ դրան բախվեցինք).
   ratio token-ները փաստացի decorative են։
7. **Desktop/Mobile mode-ը 285-ից 7-ի համար ա.** 4 display size + 3
   պատահական տարբերություն (Dropdown Background-Active 800↔500-ը ու Accordion
   radius 6↔4-ը դիզայն-որոշում չեն թվում, ավելի շուտ վրիպակ)։ Mode-ը ամբողջ
   Semantic-ի վրա ա, չնայած ազդում ա միայն Text/Desktop/*-ի — ամեն նոր token
   երկու անգամ ա լրացվում։ Մեր T-0013 որոշումը (mode չսարքել, մինչև սպառող չկա)
   սրանով ավելի ա ամրանում. եթե պետք լինի՝ mode-ը ՄԻԱՅՆ Type collection-ի վրա։
8. **Hover-ը մոբայլում գոյություն չունի, Pressed-ը՝ բացակա.** Fun Builder-ը
   desktop գործիք ա, դրա համար ճիշտ ա։ Մեր խաղը մոբայլ-առաջին ա (D-001).
   մեր suffix բազմությունը `-Pressed`-ով ա սկսվում, `-Hover`-ը desktop-ի
   լրացում ա։
9. **Icons set-ը «existing errors» ա տալիս** — `Icon=X, Size=24` երեք անգամ
   կրկնվում ա (20/16-ը սխալ անվանված), `Icon=Eyedropper`-ը Size չունի։ Մեկ
   instance (`841:3144`) main component-ը ջնջված ա։ Մանր, բայց library-ի
   publish-ը կկանգնեցնի։
10. `$description` զրո — token-ի «ինչու»-ն ոչ մի տեղ գրված չի։ Մեր
    գեներատորում մեկնաբանությունը կոդի մեջ ա, tokens.json-ում՝ ոչ. սա մեզ էլ ա
    վերաբերում (փուլ 3-ում `$description` ավելացնում ենք)։

Ամփոփ. արխիտեկտուրան (շերտեր, կաղապար, pool, disabled=opacity, set↔խումբ)
ճիշտ ա ու ընդունելի որպես ստուդիայի ստանդարտ. թերությունները գրեթե բոլորը
**ձեռքով պահվող** համակարգի հետևանք են — ու հենց դրանք ա մեր «կոդը ղեկավարում
ա, Figma-ն հետևում ա» կանոնը վերացնում։

---

## 4. Համեմատություն մեր T-0012/T-0013 վիճակի հետ

| Հարց | Fun Builder | Մերը (v1.2) | Վերդիկտ |
|---|---|---|---|
| Գույնի ramp-եր | 50–900, Gray 0–900 | 50–900, night 0–900, anchor-ների շուրջ ինտերպոլացիա | **համընկնում ա** (մեր ramp v2-ի ռեֆերենսը հենց սա էր) |
| Alpha primitives | Utility/Transparent, Black-20 | alpha/white/12…, alpha/night/92… | համընկնում ա, մերը ավելի ամբողջական |
| Semantic 100% alias | այո | այո, գեներատորը raw-ը սխալ ա գցում | **համընկնում ա** |
| Global purpose խմբեր | Colors/Global/{Text, Shape, Frame, Stroke} | Colors/Global/{Text, Icon, Frame, Shape, Border} | համընկնում ա. Border→**Stroke** վերանվանում ա պետք (Figma-ի տերմինն ա) |
| Disabled | Opacity/Disabled 50 | opacity/disabled 0.4 | համընկնում ա սկզբունքով |
| Primitives hidden | scopes `[]` | scopes `[]`, hidden | համընկնում ա |
| **Թվային pool** | Dimension/<n> ՄԵԿ pool → Radius/Height/Padding/Gap/Width/Opacity | space/<n> + radius/<name> + size/<n> ԱՌԱՆՁԻՆ, radius-ը semantic-ով անմիջապես primitive-ից | **տարբեր** — migration |
| **Կոմպոնենտ-scoped semantic** | Colors/<Comp>/<Slot>-<State> + Dimensions/*/<Comp>/* բոլոր կոմպոնենտներին | մասամբ. Action/Bet/{Default,Pressed,Glow,On} ≈ Button/Bet/{Background,Background-Pressed,Glow,Content}; Frame/Input, Border/Focus, Text/Placeholder-ը Global-ում են, ոչ Field-ում; Height/<Comp> չկա (size/chip 40-ը մեկն ա) | **տարբեր** — migration |
| State կոնվենցիա | suffix `-Hover/-Focus/-Active/-Error` | leaf `Pressed`, `Pressed Top` | **տարբեր** — suffix ենք անցնում, մեր բազմությամբ |
| Չափային սանդղակ | Sm/Md/Lg կոմպոնենտային, xs…2xl Global | Button Large/Base, ad-hoc pad/gap անուններ | տարբեր — Sm/Md/Lg + xs…2xl |
| Typography | family/size/weight/lh primitives → Text/* semantic → style | նույնը (Font/<Style>/{family,size,weight,tracking,lh}) | համընկնում ա, մերը tracking էլ ունի ու lh px-ով ա լուծել Figma-ի սահմանափակումը |
| Mode-եր | Semantic՝ Desktop/Mobile (7 token-ի համար) | չկա (T-0013 որոշում) | տարբեր, մեր որոշումը մնում ա (3.2 §7) |
| Figma էջեր | Atoms / Molecules | Foundations / Components / Screens | **տարբեր** — Atoms/Molecules/Screens + doc կաղապար |
| Set ↔ token խումբ | 1:1 (Primary Button set ↔ Button/Primary) | Button set-ը Kind=Bet/Cashout/Ghost variant-ով, 3 token խումբ մեկ set-ում | **տարբեր** — կամ 3 set, կամ Kind-ը պահել (տես 6) |
| Ձևաչափ | DTCG/Tokens Studio | սեփական flat JSON (`primitives`, `semantic{ref,value}`, `figmaNames`) | տարբեր — DTCG export ավելացնել (Տիգրանի հետ) |
| Աղբյուր | ձեռքով Figma/Tokens Studio | gen-tokens.mjs → JSON/CSS/Figma | մերը մնում ա (կանոն. կոդը ղեկավարում ա) |

---

## 5. Escort Gaming ստանդարտ — թիրախային արխիտեկտուրա (առաջարկ)

Հիմնադրի մոդելը + մեր գեներատորի կարգապահությունը։ Վավերացվում ա D-002-ով,
կոդային մասը՝ Տիգրանի հետ (փուլ 2)։

### 5.1 Շերտեր ու collection-ներ

```
Primitives  (hidden, scopes [])   Colors/<Family>/<stop> · Colors/Alpha/* · Number/<n> · Type/*
Semantic    (1 mode)              Colors/<Component>/* · Colors/Global/* · Dimensions/* · Text/* · Opacity/*
Text styles                       Font/<Style> → Text/* semantic
Components  Atoms → Molecules → Screens
```

Primitives-ը ստուդիայի ընդհանուրն ա (--eg-*), Semantic-ը խաղինը (--rd-*, հաջորդ
խաղը՝ իր prefix-ով)։ Անփոփոխ։

### 5.2 Number pool

`Number/<n>`. 0 1 2 4 6 8 10 12 14 16 20 22 24 28 32 40 48 56 999։ Հիմքը՝ Fun
Builder-ի pool-ը + մեր կոդի իրական արժեքները (10, 22 button-x, 14 button-y, 999
pill)։ `space/*`, `radius/*`, `size/<n>` primitives-ը ջնջվում են՝ CSS-ում
`--eg-space-*`/`--eg-radius-*` alias-ով մնում (T-0010 ֆրոնտը դրանց վրա ա)։
Font Size-ը մնում ա Type-ի մեջ (Fun Builder-ում էլ առանձին ա)։

### 5.3 Կոմպոնենտային կաղապարը (ամեն կոմպոնենտ ՆՈՒՅՆ slot-երը)

```
Colors/<Component>[/<Variant>]/
   Background[-<State>] · Content[-<State>] · Icon[-<State>] · Border[-<State>]
   + կոմպոնենտային slot-եր, երբ իրոք կան. Glow, Top/Bottom (gradient), Track, Thumb, Dot
Dimensions/Height/<Component>/<Size>          Sm · Md · Lg (կամ մեկ՝ եթե size չկա)
Dimensions/Padding/<Component>/X-<Size> · Y-<Size> · Track
Dimensions/Gap/<Component>/Inner · Track
Dimensions/Radius/<Component>/<Component> · Track · Inner
Dimensions/Width/<Component>/… (միայն երբ պետք ա)
```

State suffix բազմությունը (մոբայլ-առաջին կարգով). `-Pressed` (պարտադիր),
`-Selected`, `-Focus`, `-Error`, `-Hover` (desktop-ի լրացում, ֆրոնտը կորոշի՝
սպառում ա թե ոչ), Default-ը suffix չունի, Disabled-ը՝ Opacity/Disabled։
Fun Builder-ի `-Active`-ը մեզ մոտ երկու իմաստ ա բաժանվում. `-Pressed` (մատը
վրան ա) ու `-Selected` (ընտրված ա)։

Run Dady-ի կոմպոնենտները կաղապարով.

| Կոմպոնենտ | Colors/… | Dimensions/… |
|---|---|---|
| Button/Bet | Background, Background-Pressed, Content, Glow | Height/Button/Lg 48 · Md 40, Padding/Button/X 22 · Y 14, Radius/Button 12 |
| Button/Cashout | Top, Bottom, Top-Pressed, Bottom-Pressed, Content, Glow | նույնը |
| Button/Won | Top, Bottom | նույնը |
| Button/Ghost | Background, Background-Pressed, Border, Content | նույնը |
| Field | Background, Border, Border-Focus, Border-Error, Content, Placeholder | Height/Field 48, Padding/Field/X 16 · Y 12, Radius/Field 12 |
| Chip | Top, Bottom, Content | Height/Chip 40, Padding/Chip/X 12, Radius/Chip 8 (inner) |
| Segment | Track, Background-Selected, Content, Dot | Height/Segment 40, Padding/Segment/X 8 · Track 4, Gap/Segment/Track 4, Radius/Segment/Track 12 · Inner 8 |
| Difficulty (heat) | Easy · Medium · Hard · Expert | — (Segment-ի Dot-ի արժեքներն են) |
| Panel (HUD) | Background, Pill | Padding/Panel 16, Gap/Panel/Section 12 · Controls 8, Radius/Panel 16 |
| Global | Text/{Primary, Secondary, Placeholder}, Icon/{Primary, Secondary}, Stroke/{Subtle, Focus, Error}, Shape/Accent, State/{Win, Loss, Caught, Crash} | Global/{xs 4, sm 8, md 12, lg 16, xl 24}, Radius/Global/{sm 6, md 10, lg 12, xl 16, Pill 999}, Width/{Hairline 1, Control 2}, Size/{Icon 24, Touch 48} |

Ամեն ընթացիկ `--rd-*` անուն ստանում ա նոր canonical անուն, հինը մնում ա CSS
alias (T-0010-ը չի կոտրվում)։

### 5.4 Անվանակարգի կանոններ (գեներատորը պարտադրում ա)

1. Figma անուն = `<Group>/<Component>[/<Variant>]/<Slot>[-<State>]`։ Բացատ միայն
   բազմաբառ անունների մեջ (`Bet Row`), suffix-ը գծիկով, երբեք բացատով։
2. CSS անուն = `--<game>-<component>[-<variant>]-<slot>[-<state>]`, ամբողջը
   lowercase-kebab, slot-երի հապավումով (փուլ 2-ում Տիգրանի հետ ֆիքսվող
   բառարան. bg / fg / border / glow / top / bottom / h / pad-x / pad-y / gap /
   radius / w)։ Figma-ից CSS-ը ՄԵՔԵՆԱՅՈՎ ա ստացվում, ոչ ձեռքով։
3. Slot-ի հոմանիշ չկա. `Content`, ոչ `Text`/`Text-Main`/`On`։
4. Default-ը suffix չունի. Disabled-ը գույն չունի։
5. Token-ի ամեն արժեք primitive alias ա. գեներատորը raw-ը մերժում ա (կա)։
6. Ամեն semantic ունի `$description` (ինչի համար ա, որտեղից ա արժեքը)։

### 5.5 Scope-երի քաղաքականություն

Primitives `[]`։ Semantic. Colors/Global/Text → TEXT_FILL, Icon → SHAPE_FILL,
Frame/Shape → FRAME_FILL|SHAPE_FILL, Stroke → STROKE_COLOR, կոմպոնենտային
գույներ → ըստ slot-ի (Background→FRAME_FILL|SHAPE_FILL, Content→TEXT_FILL|
SHAPE_FILL, Border→STROKE_COLOR), Radius → CORNER_RADIUS, Padding/Gap → GAP,
Height/Width/Size → WIDTH_HEIGHT, Width/Border → STROKE_FLOAT, Opacity →
OPACITY։ Fun Builder-ի JSON-ի Global Dimensions-ի «ամեն ինչ բացի radius/opacity»
սկզբունքը ընդհանրացված։ Դիզայները picker-ում տեսնում ա միայն էն, ինչ էդ
property-ի համար իմաստ ունի։

### 5.6 Figma էջեր (Run Dady UI ու ամեն հաջորդ ֆայլ)

- **Foundations** — մնում ա (ramp-եր, type, doc)։
- **Atoms** — Icons, Segment, Chip, Form Hint/Helper, Dot. State-ից անկախ կամ
  մեկ set-ի ներսում փակ leaf-եր։
- **Molecules** — Button/Bet, Button/Cashout, Button/Ghost (3 set, ոչ Kind
  variant — set↔խումբ 1:1), Input, Bet Amount, Difficulty (track + Segment×4),
  Bet Panel (կոմպոզիցիա)։ Ամեն մեկը Fun Builder-ի doc կաղապարով («Molecules
  <Name>» header + variant grid + կոմպոզիցիաների instance)։
- **Screens** — մնում ա։
- Հիմնադրի 2:2-ը՝ անձեռնմխելի։

Կաղապարը template ա. հաջորդ խաղի ֆայլը = նույն 4 էջը, նույն doc frame-ը,
kit-ը գեներացնում ա։

---

## 6. Migration պլան (փուլ 3)

Կանոններ. anchor-ները ՍՈՒՐԲ են, `--rd-*`/`--ui-*` CSS անունները չեն կոտրվում
(alias), Figma-ի variable-ները ՏԵՂՈՒՄ են վերանվանվում (ID նույնը → binding-ները
ողջ), ամեն քայլ՝ regen → diff → commit։

1. **gen-tokens.mjs v2.0 — primitives.** `space/radius/size` → `number/<n>` pool.
   CSS-ում `--eg-number-*` + հին `--eg-space-*`/`--eg-radius-*` alias-ներ։
   Ստուգում. tokens.css-ի ֆրոնտ-սպառվող 12 var-ի արժեքը 0 շարժ։
2. **v2.0 — semantic կաղապարով.** Semantic աղյուսակը վերագրվում ա
   `<component>/<slot>[-<state>]` բանալիներով (5.3 աղյուսակը), figmaName-ը
   կանոնով ա ծնվում (FIG ձեռքի քարտեզը կրճատվում ա մինչև բացառություններ)։
   Հին բանալիները (`action/bet`, `surface/input`…) → `legacy` աղյուսակ, CSS
   alias-ով։ Գեներատորը ստուգում ա. ամեն կոմպոնենտ կաղապարի պարտադիր slot-երն
   ունի (Background/Content առնվազն), suffix-ը թույլատրված բազմությունից ա։
3. **Export-ներ.** tokens.json-ը ստանում ա DTCG արտահանում (`tokens.dtcg.json`.
   `$value/$type/$description`, alias `{Colors.Green.500}` ոճով, Tokens Studio
   set-երով), ընթացիկ flat JSON-ը մնում ա kit-ի համար։ Ձևը՝ Տիգրանի պատասխանից
   հետո (փուլ 2, հարց 3)։ Ֆրոնտի սպառման արտեֆակտը (CSS միայն, թե + JS/TS
   մոդուլ Pixi-ի համար) — հարց 2։
4. **Figma kit.** kit.src.js-ը վերանվանում ա variables-ը տեղում, scopes-ը դնում
   5.5-ով, `$description`-ը՝ variable.description։ Կոլեկցիաները՝ Primitives /
   Semantic (Layout+UI+Type միավորվում են մեկ Semantic-ի մեջ, Fun Builder-ի պես.
   Figma-ում մեկ collection-ը group-ներով ավելի ընթեռնելի ա, քան 3 collection)։
   World-ը մնում ա առանձին (2 մոդ)։
5. **Run Dady UI էջեր.** Components → Atoms + Molecules, Button set-ը 3 set
   (Bet/Cashout/Ghost), doc frame-երը կաղապարով։ Screens-ի instance-ները
   swap-վում են (binding-ները չեն կոտրվում, քանի որ token ID-ները նույնն են)։
6. **Դոկ.** ui-tokens.md-ն թարմանում ա, architecture.md-ի 5-րդ բաժինը դառնում ա
   «template» — հաջորդ պրոյեկտի checklist։

**Ռիսկեր.** (ա) Button set-ը 3-ի բաժանելը Screens-ի instance-ները ձեռքով
swap ա պահանջում (18 variant → 3×6). ալտերնատիվ՝ Kind-ը պահել variant-ով, բայց
token խմբերը առանձին (set↔խումբ 1:n)։ Հիմնադրի ընտրությունն ա, երկուսն էլ
աշխատում են։ (բ) CSS անունների կրկնակի շերտ (canonical + legacy alias)
tokens.css-ը մեծացնում ա. Տիգրանի հետ պայմանավորվել legacy-ի ջնջման հորիզոնը։
(գ) Figma-ում variable-ը collection-ից collection Plugin API-ով ՉԻ տեղափոխվում —
Layout/UI/Type → Semantic միավորումը նոր variable + rebind ա, ID-ն փոխվում ա։
Կա՛մ միավորումը հանում ենք պլանից (3 collection-ը մնում ա, անունները
կաղապարով), կա՛մ kit-ը rebind-ը ինքն ա անում ամբողջ ֆայլով (T-0012-ի փորձ. mock-run
+ Լուսինեի Figma read-only աուդիտ)։ Իմ առաջարկը՝ չմիավորել. ռիսկը արժեքից մեծ ա։
