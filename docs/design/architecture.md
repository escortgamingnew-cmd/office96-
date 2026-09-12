# Design system արխիտեկտուրա — Fun Builder մոդելը ու Escort Gaming ստանդարտը

**Կարգավիճակ.** T-0014 փուլ 3 ավարտված, Արեգ, 2026-09-12։ Բաժիններ 1–4-ը
ուսումնասիրությունն են (փուլ 1), 5-ը՝ ստանդարտը ԻՆՉՊԵՍ ՈՐ իրականացված ա
(gen-tokens.mjs v2.0 + Run Dady UI), 6-ը՝ migration-ի փաստացի ընթացքը, **7-ը՝ հաջորդ
պրոյեկտի checklist-ը**։ Տիգրանի հետ համաձայնությունը՝ dev.md 2026-09-12 23:58։
Գործնական ռեֆերենսը (ամեն token, Figma անուն, CSS/JS)՝ `docs/design/ui-tokens.md`։

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

## 5. Escort Gaming ստանդարտ — արխիտեկտուրան, ինչպես որ իրականացված ա (v2.0)

Հիմնադրի մոդելը + մեր գեներատորի կարգապահությունը։ Կոդային մասը Տիգրանի հետ
համաձայնեցված ա (dev.md 09-12), դիզայնի վավերացումը՝ D-002-ով հիմնադրինը։
Այս բաժինը թարմացված ա փուլ 3-ից հետո — էստեղ գրածը գեներատորի ընթացիկ վիճակն ա։

### 5.1 Շերտեր ու collection-ներ

```
Primitives  (hidden, scopes [])   Colors/<Family>/<stop> · Colors/Alpha/* · Number/<n> · Type/*
Semantic    (1 mode)              Colors/<Component>/* · Colors/Global/* · Dimensions/* · Text/* · Opacity/*
Text styles                       Font/<Style> → Text/* semantic
Components  Atoms → Molecules → Screens
```

Primitives-ը ստուդիայի ընդհանուրն ա (--eg-*), Semantic-ը խաղինը (--rd-*, հաջորդ
խաղը՝ իր prefix-ով)։ Figma-ում «Semantic»-ը ֆիզիկապես 3 collection ա (UI / Layout /
Type) — չմիավորեցինք. Plugin API-ով variable-ը collection-ից collection չի տեղափոխվում,
ID-ն կփոխվեր, binding-ները կկոտրվեին (6-րդ բաժնի ռիսկ գ)։ Հաջորդ ֆայլը 0-ից բացվելիս
կարա մեկ Semantic collection լինի — kit-ի collection-ը `tokens.json → figma.collection`-ից ա։

### 5.2 Number pool

`number/<n>` → Figma `Number/<n>`. **0 1 2 4 6 8 10 12 14 16 20 22 24 32 40 48 999**
(17)։ Հիմքը՝ Fun Builder-ի pool-ը + մեր կոդի իրական արժեքները (22 button-x, 14
button-y, 999 pill)։ 28/56-ը հանվեցին — font size են, Type-ի մեջ են։ `space/*`,
`radius/*`, `size/<n>` primitives-ը ջնջված են, `--eg-space-*`/`--eg-radius-*` alias
ՉԻ մնացել (Տիգրան. ֆրոնտը երբեք չի սպառել, 0 կոտրում)։ Semantic-ը միայն
`{number/<n>}` ա հղում, չգոյություն ունեցող թիվը error ա։

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

State suffix բազմությունը (մոբայլ-առաջին կարգով). `-Pressed`, `-Selected`,
`-Focus`, `-Error` գեներացվում են, `-Hover`-ը բառարանում ա, բայց **չի գեներացվում**
(Տիգրան. մոբայլում չկա, երբ desktop hover լինի՝ `@media (hover:hover)` guard-ով,
schema-ն չի փոխվում)։ Default-ը suffix չունի, Disabled-ը՝ Opacity/Disabled։
Fun Builder-ի `-Active`-ը մեզ մոտ երկու իմաստ ա բաժանվում. `-Pressed` (մատը
վրան ա) ու `-Selected` (ընտրված ա)։ Կոդում state = class 1:1 (`.pressed`,
`.selected`, `:focus-visible`, native `:disabled`)։ Variant-ը (`#betmorph.run/.lost`,
`#cashout.won`) state ՉԻ — 2-րդ դիրքում ա (bet/ghost/won), suffix չի։

Երկու ուղղում Տիգրանից, որ կաղապարի մաս դարձան. (1) **top/bottom-ը axis են,
ոչ slot** — gradient-ը background ա, `button/cashout/bg-top-pressed` (այլապես `bg`
grep-ը cashout-ը չէր բռնի). (2) **track/thumb/dot/pill/label/helper-ը part են**,
variant-ի դիրքում — `segment/track/pad`, `field/helper/fg-error`։ Slot-ը միշտ
վերջին «իմաստն» ա։

Run Dady-ի կոմպոնենտները կաղապարով (136 semantic, ամբողջ ցուցակը ui-tokens.md-ում).

| Կոմպոնենտ | Colors/… | Dimensions/… |
|---|---|---|
| Button/{Bet, Cashout, Won, Ghost} + Button/Border-Focus | Background[-Top/-Bottom][-Pressed], Content, Glow, Border | Height/Button/Lg 48 · Md 40, Padding/Button/X 22 · Y 14, Gap/Button 8, Radius/Button 12 |
| Field (+ Label/Placeholder/Helper part) | Background, Content, Border[-Focus/-Error], Glow-Focus, Label/Content, Placeholder/Content, Helper/Content[-Error] | Height/Field 48, Padding/Field/X 16 · Y 12, Gap/Field 6, Radius/Field 12 |
| Chip | Background-Top/-Bottom[-Pressed], Background-Selected, Border-Selected, Content | Height/Chip 40, Padding/Chip/X 12, Radius/Chip 8 |
| Bet Row | Background-Top/-Bottom | Padding/Bet Row 4, Gap/Bet Row 8 |
| Segment (+ Track/Dot part) | Background-Pressed/-Selected, Content[-Selected], Track/Background | Height/Segment 40, Padding/Segment/X 8 · Track 4, Gap/Segment 8 · Track 4, Radius/Segment 8 · Track 12, Size/Segment/Dot 8 |
| Difficulty/{Easy, Medium, Hard, Expert} | Background (heat) | — |
| Panel (+ Pill/Section/Controls/Balance part) | Background, Pill/Background | Padding/Panel 16, Radius/Panel 16, Gap/Panel/Section 12 · Controls 8 · Pill 6 · Balance 2 |
| Global | Text/{Primary, Secondary, Placeholder}, Icon/{Primary, Secondary}, Stroke/{Subtle, Focus, Error}, Shape/Accent, State/{Win, Loss, Caught, Crash} | Space/{Xs 4, Sm 8, Md 12, Lg 16, Xl 24}, Radius/{Xs 6, Sm 8, Md 10, Lg 12, Xl 16, Pill 999}, Stroke/{Hairline 1, Control 2}, Size/{Icon 24, Touch 48} |

45 ընթացիկ `--rd-*` անուն ստացավ նոր canonical անուն, հինը CSS alias ա
(`tokens.css` «legacy» բլոկ) մինչև T-0010-ի review-ն, հետո մեկ commit-ով ջնջվում ա։

### 5.4 Անվանակարգի կանոններ (գեներատորը պարտադրում ա)

1. Figma անուն = `<Group>/<Component>[/<Variant>]/<Slot>[-<State>]`։ Բացատ միայն
   բազմաբառ անունների մեջ (`Bet Row`), suffix-ը գծիկով, երբեք բացատով։
2. CSS անուն = `--<game>-<component>[-<variant|part>]-<slot>[-<axis>][-<state>]`,
   lowercase-kebab, slot բառարանը (Տիգրանի հետ ֆիքսված). **bg fg border glow h w
   size pad gap radius**, axis՝ top bottom x y, size՝ sm md lg։ `fg`, ոչ `content`
   (CSS-ում `color:` ա, դեվի գլխում fg ա. Figma-ում Content)։ JS անուն = նույն
   հատվածները camelCase (`RD.button.cashout.bgTopPressed`)։ Figma-ն, CSS-ն ու JS-ը
   ՄԵԿ բանալուց ՄԵՔԵՆԱՅՈՎ են ծնվում, ձեռքով քարտեզ չկա։
3. Slot-ի հոմանիշ չկա. `Content`, ոչ `Text`/`Text-Main`/`On`։ Բառարանից դուրս բառ =
   գեներատորի error։
4. Default-ը suffix չունի. Disabled-ը գույն չունի։ Hover-ը չի գեներացվում։
5. Token-ի ամեն արժեք primitive alias ա. գեներատորը raw-ը մերժում ա. չափային slot-ը
   միայն `{number/n}`, գունային slot-ը թիվ չի կարա լինի։
6. Ամեն semantic ունի `$description` (կոմպոնենտի նոթ + slot + աղբյուր + CSS անուն) —
   Figma variable-ի description-ում ու DTCG-ում։
7. Ամեն կոմպոնենտ գոնե `bg` կամ `fg` ունի (կաղապարի պարտադիր մասը)։

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

- **Foundations** — մնում ա (ramp-եր, type, doc frame-եր. «Design system — v2.0»
  60:231-ը կաղապարի ամփոփումն ա ֆայլի մեջ)։
- **Atoms** (18:2) — Icons, Button, Input, Chip, Segment (թասկի սահմանումով.
  state-ից անկախ կամ մեկ set-ի ներսում փակ leaf-եր)։
- **Molecules** (59:305) — Bet Amount, Difficulty (track + Segment×4), Bet Panel
  (կոմպոզիցիա)։
- Ամեն set իր **section**-ում ա («Atoms · Button», «Molecules · Bet Panel») —
  Fun Builder-ի «Molecules <Name>» header-ի սկզբունքը Figma-ի բնիկ գործիքով, kit-ը
  նոր set-ը section-ի մեջ ա դնում։
- **Screens** — մնում ա, instance-ները Atoms/Molecules-ից են (0 missing main)։
- Հիմնադրի 2:2-ը՝ անձեռնմխելի։
- Button set-ը Kind variant-ով ա (18). 3 set-ի բաժանումը (set↔խումբ 1:1)
  հիմնադրի որոշումն ա, product.md-ի հարցը բաց ա։ Token խմբերն արդեն առանձին են
  (Colors/Button/{Bet, Cashout, Ghost}), բաժանումը միայն Figma-ի կողմն ա։

Կաղապարը template ա. հաջորդ խաղի ֆայլը = նույն 4 էջը, նույն section-ները,
kit-ը գեներացնում ա (§7)։

---

## 6. Migration — ինչ արվեց (փուլ 3, 2026-09-12)

Կանոնները պահվեցին. anchor-ները 0 շարժ (17 hex), 103 հին `--ui-*`/`--rd-*` անուն
նույն արժեքին ա լուծվում (ստուգված HEAD-ի tokens.css-ի դեմ), Figma-ի variable-ները
ՏԵՂՈՒՄ վերանվանվեցին (ID նույնը), ամեն քայլ regen → diff → commit։

| Քայլ | Պլան | Փաստ |
|---|---|---|
| 1 primitives | space/radius/size → number pool, --eg-space/--eg-radius alias | number/<n> 17. alias ՉԿԱ (Տիգրան. ֆրոնտը չի սպառել), 109 → 105 primitive |
| 2 semantic | կաղապարով բանալիներ, legacy աղյուսակ, գեներատորի ստուգումներ | 92 → 136 semantic, 45 legacy alias, parse()-ը slot/axis/state-ը պարտադրում ա, hover error ա, bg/fg պարտադիր, number-only չափեր |
| 3 export-ներ | DTCG + ֆրոնտի արտեֆակտ | tokens.dtcg.json (հիմնադրի բարբառով՝ color/number/text, count-check 105+136), src/tokens.js (nested frozen, 0xRRGGBB, {color,alpha}, JSDoc), index.html @tokens splice (marker-ը T-0010-ում) |
| 4 kit | in-place rename, scopes, description, Semantic միավորում | kit-ը TOKENS.figma-ից ա սնվում (collection/scopes/css/name/prev), mock-run-ը v1.2 անուններից ա սկսում ու ID-ի պահպանումն ա ստուգում. **միավորումը հանվեց** (ռիսկ գ) — 3 collection, անունները կաղապարով |
| 5 Figma էջեր | Atoms + Molecules, Button 3 set, doc | Layout 40 rename + 21 նոր, UI 36 rename + 18 նոր, Type 30 description, 298 rebind 6 set-ում (+ Screens balance gap), Components → Atoms, Molecules նոր էջ, 8 section, «Design system — v2.0» doc (60:231). **Button 3 set — ՉԻ արվել**, հիմնադրի որոշումն ա (product.md) |
| 6 դոկ | ui-tokens.md, template բաժին | ui-tokens.md v2.0, §7 checklist ստորև |

Աուդիտ (MCP, read-only). 256 variable (64/16/61/62/53), v1.2 անուն 0, ALL_SCOPES 0,
Atoms 937 / Molecules 913 / Screens 702 binding, primitive-ի binding 0, hardcoded
fill 0, Screens-ի instance-ների missing main 0։ Set-երում Global-ից մնացել են
միայն stroke width-երը (Global/Stroke — դիտավորյալ) ու Bet Panel-ի ազատ տեքստը
(Global/Text)։

Բաց ռիսկեր. (ա) Button set-ի բաժանումը — հիմնադրի որոշում, token խմբերն արդեն
առանձին են, Figma-ի կողմն ա միայն. (բ) legacy շերտի ջնջման հորիզոնը ֆիքսված ա՝
T-0010-ի review-ից հետո, մեկ commit։

---

## 7. Հաջորդ պրոյեկտի կաղապար — checklist (0-ից նույն կառուցվածքով)

Ենթադրություն. նոր խաղ = նոր `<prefix>` (Run Dady-ինը `rd`), նույն primitives-ը
(--eg-*), նոր semantic քարտեզ, նոր Figma ֆայլ։

1. **Գեներատոր.** `tools/design/gen-tokens.mjs`-ը copy չես անում — `semantic`
   օբյեկտն ու `ANCHOR`-ը խաղինն են, մնացածը ընդհանուր։ Նոր խաղի anchor-ները
   կոդից ես վերցնում (ճշգրիտ hex, երբեք կլորացված), ramp()-ը մնացածը լցնում ա։
   Նոր գույնի ընտանիք = ANCHOR-ի մեկ տող։ Number pool-ին թիվ ավելացնելը մեկ տեղ ա։
2. **Semantic քարտեզ.** Ամեն ինտերակտիվ կոմպոնենտի համար լրացրու կաղապարը (§5.3).
   `bg`/`fg` պարտադիր, հետո border/glow, հետո h/pad/gap/radius — ամեն մեկը
   `{number/n}`։ State-երը միայն էնտեղ, որտեղ ֆրոնտն իրոք ունի (հարցրու դեվին
   ցուցակը. Run Dady-ինը pressed/selected/focus/error)։ Variant-ը 2-րդ դիրք, part-ը
   2-րդ դիրք, slot-ը վերջում։ Global-ը միայն կոմպոնենտից դուրս սպառողի համար։
3. **Վազեցրու.** `node tools/design/gen-tokens.mjs` — error-ները կաղապարի խախտումն
   են (բառարանից դուրս slot, raw արժեք, pool-ում չեղած թիվ, hover)։ Հետո
   `node tools/design/figma-kit/test/mock-run.mjs`։ Ստուգի regen-ը դետերմինիստիկ ա
   (երկու անգամ վազեցնելը diff չի տալիս)։
4. **Ֆրոնտ.** tokens.css-ը index.html-ի `@tokens` marker-ների արանքն ա գնում,
   src/tokens.js-ը Pixi-ին։ Ֆրոնտը primitive չի սպառում, state = class = suffix։
5. **Figma ֆայլ.** 4 էջ՝ Foundations / Atoms / Molecules / Screens։ Variables-ը kit-ի
   «1. Variables audit + sync»-ով (կամ MCP-ով նույն TOKENS.figma տվյալներից).
   primitives hidden scopes [], semantic scopes ըստ slot-ի, description, code syntax։
   Text style-երը «2»-ով։ Ամեն set իր section-ում («Atoms · <Name>»), set ↔ token
   խումբ 1:1 (variant-ը state/size ա փոխում, ոչ token խմբի արմատը — Button-ի
   Kind-ի հարցը հենց սա ա)։ Ոչ մի hardcoded fill/stroke/padding/radius, 4 անկյունը
   ու 4 stroke-ը առանձին կապված։
6. **Աուդիտ (QA-ի համար).** variable count = tokens.json-ի count, v1.x անուն 0,
   ALL_SCOPES 0, binding primitive-ի 0, hardcoded 0, instance-ների missing main 0,
   anchor-ները diff 0։ Read-only MCP script-երը T-0014-ի Log-ում են։
7. **Դոկ.** ui-tokens.md-ի կաղապարով՝ արտեֆակտների աղյուսակ, գրամատիկա, primitives,
   semantic կոմպոնենտներով, ֆրոնտի սպառում, Figma էջեր։ Architecture-ը ընդհանուր ա,
   չես կրկնում։

Ինչը ԴԵՌ ձեռքով ա (kit-ի backlog). Chip/Segment/Difficulty/Bet Amount/Bet Panel
կոմպոնենտային փուլերը, doc frame-երի կաղապարը։ Հաջորդ պրոյեկտում սրանք kit-ի փուլ
դառնան՝ ֆայլը ամբողջությամբ գեներացվող ա։
