# Run Dady — UI token-ներ (մեկ ճշմարտություն կոդի ու Figma-ի համար)

Աղբյուրը **գեներատորն ա**՝ `tools/design/gen-tokens.mjs` (v2.0, T-0014)։ Anchor
գույները կոդից են (`prototype/pixi-feel/index.html` :root, `src/tex.js`)։
Գեներատորը մեկ run-ով գրում ա.

| Արտեֆակտ | Ում համար | Ինչ |
|---|---|---|
| `docs/design/tokens.css` | DOM UI (index.html) | `--eg-*` primitives + `--rd-*` semantic + legacy alias-ներ |
| `prototype/pixi-feel/src/tokens.js` | Pixi/JS | ESM `RD` nested frozen object (0xRRGGBB, `{color, alpha}`, unitless) |
| `prototype/pixi-feel/index.html` | bundle | `/* @tokens */ … /* @/tokens */` marker-ների արանքը splice (marker-ը Տիգրանն ա դնում, T-0010) |
| `docs/design/tokens.json` | kit + MCP | flat. primitives, semantic{ref,value,description}, legacy, figma{name,prev,collection,scopes,css} |
| `docs/design/tokens.dtcg.json` | Tokens Studio / DTCG | հիմնադրի Fun Builder ձևաչափը (`$value/$type/$description`, alias `{Colors.Green.500}`), count-check |
| `tools/design/figma-kit/code.js` | Figma plugin | TOKENS + kit.src.js |

Figma «Run Dady UI»՝ https://www.figma.com/design/JTDf8M2yHwzitpAAPzXnca —
սինքվում ա MCP-ով կամ kit-ով։ Կանոնը. **կոդը ղեկավարում ա, Figma-ն հետևում ա** —
anchor փոխելը գեներատորի ANCHOR աղյուսակում ա, ոչ ձեռքով (D-002-ով այլ բան չորոշվի)։
Արխիտեկտուրայի «ինչու»-ն ու հաջորդ պրոյեկտի checklist-ը՝ `docs/design/architecture.md`։

## Ճարտարապետությունը (Fun Builder կաղապար, T-0014)

```
Primitives  ──►  Semantic (կոմպոնենտ-scoped)  ──►  Text styles / Atoms / Molecules / Screens
(hidden, scopes [])   (միակ սպառվող շերտը, 100% alias)
```

- **Primitives** = հում սանդղակներ. գույն 0–900 ramp-երով, alpha, **մեկ թվային
  pool** `number/<n>`, type։ Figma-ում hidden, scopes `[]` — ոչ մի էլեմենտ
  դրանցից չի սնվում։ Կոդում ոչ ոք primitive չի սպառում (Տիգրան, dev.md 09-12)։
- **Semantic** = ինչի ՀԱՄԱՐ ա արժեքը, ու **ում** ա պատկանում. ամեն ինտերակտիվ
  կոմպոնենտ իր խումբն ունի ՆՈՒՅՆ կաղապարով, արժեքները նույնիսկ համընկնելիս
  առանձին token են (Button-ի radius-ը փոխելը Field-ին չի կպնում)։ Ամեն semantic
  primitive-ի alias ա (գեներատորը raw-ը մերժում ա). բացառություն՝ `font/*/lh`
  (px թիվ) ու `opacity/*`։
- **Երեք անուն, մեկ token.** Բանալին (`button/bet/bg`) ծնում ա CSS-ը
  (`--rd-button-bet-bg`), JS-ը (`RD.button.bet.bg`) ու Figma-ն
  (`Colors/Button/Bet/Background`) — մեքենայով, ձեռքով քարտեզ չկա։
- **Collection-ները Figma-ում** (5, 256 variable). Primitives 64 (գույն + alpha,
  hidden) · Layout 62 (`Number/<n>` 17 hidden + `Dimensions/*` 45 semantic) ·
  Type 53 (Family/Font Size/Weight/Tracking/Line Height hidden + `Font/<Style>/*`)
  · UI 61 (`Colors/*` + `Opacity`) · World 16 (Figma-only, 2 մոդ)։ Երեքը չեն
  միավորվել մեկ «Semantic»-ի մեջ. Plugin API-ով variable-ը collection-ից
  collection չի տեղափոխվում, ID-ն կփոխվեր, binding-ները կկոտրվեին։
- **Mode-եր.** Semantic-ին mode ՉԿԱ (T-0013 որոշում, Տիգրանը համաձայն. mode լինի՝
  `@media`-ով `:root` վերասահմանում DOM-ի համար)։ World-ի 2 մոդը մնում ա։

## Բանալու գրամատիկան (գեներատորը պարտադրում ա, սխալը error ա)

```
<component>[/<variant|part>]/<slot>[-<axis|size>][-<state>]
```

| Մաս | Արժեքներ | Նոթ |
|---|---|---|
| slot (գույն) | `bg` `fg` `border` `glow` | Figma՝ Background · Content · Border · Glow |
| slot (չափ) | `h` `w` `size` `pad` `gap` `radius` | Figma՝ Height · Width · Size · Padding · Gap · Radius. `size` = քառակուսի (icon, dot) |
| axis | `top` `bottom` `x` `y` | gradient-ը background ա՝ `bg-top`, ոչ առանձին slot (Տիգրանի ուղղում 1) |
| size | `sm` `md` `lg` | կոմպոնենտի Size variant-ի հետ 1:1 |
| state | `pressed` `selected` `focus` `error` (`hover`) | suffix, ՄԻՇՏ վերջում. Default-ը suffix չունի. Disabled = `opacity/disabled`. **hover-ը բառարանում ա, բայց չի գեներացվում** (մոբայլում չկա) |
| variant / part | `bet` `cashout` `won` `ghost` · `track` `dot` `pill` `label` `helper` `placeholder` `section` `controls` `balance` | 2-րդ դիրք. variant = կոդում մորֆվող տեսակ, part = ենթատարր (Տիգրանի ուղղում 2) |
| global խմբեր | `text` `icon` `border` `shape` `state` · `space` `radius` `stroke` `size` | կոմպոնենտից դուրս սպառողներ. Figma՝ `Colors/Global/*`, `Dimensions/Global/*` |

Figma անուն. `Colors/<Component>[/<Part>]/<Slot>[-<Axis>][-<State>]`,
`Dimensions/<Slot>/<Component>[/<Part>]/<Axis|Size|Component>` (`segment/track/pad`
→ `Dimensions/Padding/Segment/Track`, `button/radius` → `Dimensions/Radius/Button/Button`)։
CSS՝ `--rd-` + բանալին գծիկներով։ JS՝ հատվածները camelCase (`bg-top-pressed` →
`bgTopPressed`, `bet-row` → `betRow`)։ Ամեն semantic Figma-ում `$description` ունի
(կոմպոնենտի նոթ + slot + աղբյուր + CSS անուն)։ Scope-երը՝ ըստ slot-ի (bg →
FRAME_FILL|SHAPE_FILL, fg → TEXT_FILL|SHAPE_FILL|STROKE_COLOR, border → STROKE_COLOR,
glow → EFFECT_COLOR, pad/gap → GAP, h/w/size → WIDTH_HEIGHT, radius → CORNER_RADIUS)։

## Primitives (հում արժեքներ)

### Գույն — ramp v2

Ramp-ը կառուցվում ա **anchor-ների շուրջը**. anchor-ը ֆիքսված կետ ա, մնացած
stop-երը երկու հարևան anchor-ի արանքում են ինտերպոլացվում, ծայրերից դուրս՝
վիրտուալ 0=#FFFFFF / 1000=#000000, լուսավոր կողմում ease (t^1.5)՝ որ 50–300-ը
ռեֆերենսի Gray-ի պես բաց մնա։ night = մեր Gray (0…900, 11 stop), մյուսները
50…900։ Off-grid anchor-ները (450/550/650) մնում են՝ կոդի արժեքներ են։
Anchor-ները **ընդգծված** են։

| Ընտանիք | 0 | 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | off-grid |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| green | — | #F2FDF8 | #DAF8EA | #95ECC3 | **#3DDC91** | #36CF88 | **#2EC27E** | **#24A869** | **#22B573** | #17794D | #0B3C26 | — |
| amber | — | #FFF9EE | #FFEFD0 | **#FFD27A** | **#FFC94D** | #FBB937 | **#F6A821** | #C78819 | #986711 | #694708 | **#3A2600** | — |
| red | — | #FFF8F8 | #FFEDED | #FFCBCB | #FF9F9F | **#FF6B6B** | **#FF4D4D** | #CC3E3E | #992E2E | #661F1F | #330F0F | 450 **#FF5D5D** |
| navy | — | #FAFAFB | #F0F1F3 | #D4D7DD | #B0B6C1 | #868EA0 | #56617A | **#33405E** | **#242F49** | #181F31 | #0C1018 | 550 **#3C4966**, 650 **#2C374F** |
| night | #FFFFFF | #FBFBFB | #F4F5F5 | #E1E2E3 | #C8C9CB | #AAACAE | #888A8E | #62666B | #3A3E44 | **#0E131B** | **#0A0E14** | — |

`white` = #FFFFFF (= night/0, մնում ա հին binding-ների համար)։ green/700 (#22B573,
won gradient-ի ներքև) green/600-ից բաց ա — կոդի արժեք ա, ramp-ը դրան չի կպչում։

### Alpha primitives

| Token | Արժեք | Սպառող |
|---|---|---|
| alpha/white/12 · 35 · 50 | white @12/35/50% | border/subtle, field/border · placeholder-ներ · text/secondary, icon/secondary, label/helper |
| alpha/night/92 · 55 | night/800 @92% · night/900 @55% | panel/bg · panel/pill/bg |
| alpha/green/8 · 16 · 35 | green/500 @8/16/35% | button/ghost/bg · bg-pressed · button/bet/glow |
| alpha/amber/45 | amber/500 @45% | button/cashout/glow, field/glow-focus |

### Number pool ու type

- **number**: 0 1 2 4 6 8 10 12 14 16 20 22 24 32 40 48 999 (Figma `Number/n`,
  hidden, Layout collection)։ Radius, padding, gap, height, stroke — բոլորը սրանից,
  `{number/<n>}` alias-ով. չգոյություն ունեցող թիվը error ա։ 999 = pill (100-ը ոչ)։
  Font size-երը այստեղ ՉԵՆ (Type-ի մեջ են)։
- **type**: family mono «Roboto Mono» / sans «Inter» / armenian «Noto Sans
  Armenian» · size 10 11 12 14 16 20 28 40 56 · weight 400/500/600/700 ·
  tracking tight −2 / base .2 / button .5 / caps 2 · lh tight 100% / snug 120% /
  base 140% (գեներատորի բազմապատկիչն ա, ֆրոնտը չի սպառում)։

## Semantic — կոմպոնենտներով (բանալի · → primitive · Figma անունը կանոնով ա ծնվում)

### Button (Atoms). variant՝ bet · cashout · won · ghost

| Բանալի | → | Նոթ |
|---|---|---|
| button/bet/bg · bg-pressed · fg · glow | green/500 · green/600 · night/900 · alpha/green/35 | Place Bet / Run. մուգ տեքստ 8.4:1 (սպիտակը 2.3:1 էր) |
| button/cashout/bg-top · bg-bottom · bg-top-pressed · bg-bottom-pressed · fg · glow | amber/300 · 500 · 400 · 600 · amber/900 · alpha/amber/45 | սաթե gradient |
| button/won/bg-top · bg-bottom | green/300 · green/700 | cashout-ի հաղթած վիճակ (`#cashout.won`) |
| button/ghost/bg · bg-pressed · border · fg | alpha/green/8 · 16 · green/500 · green/300 | «Keep Running» (`#betmorph.lost`) |
| button/border-focus | amber/200 | `:focus-visible` ring (desktop keyboard) |
| button/h-lg · h-md | 48 · 40 | Large = Button/Large style, Md = Button/Base |
| button/pad-x · pad-y · gap · radius | 22 · 14 · 8 · 12 | |

### Field (Atoms, Input set). part՝ label · placeholder · helper

| Բանալի | → |
|---|---|
| field/bg · fg | navy/700 · white |
| field/border · border-focus · border-error · glow-focus | alpha/white/12 · amber/200 · red/400 · alpha/amber/45 |
| field/label/fg · placeholder/fg · helper/fg · helper/fg-error | alpha/white/50 · alpha/white/35 · alpha/white/50 · red/400 |
| field/h · pad-x · pad-y · gap · radius | 48 · 16 · 12 · 6 · 12 |

### Chip · Bet Row · Segment · Difficulty · Panel

| Բանալի | → | Նոթ |
|---|---|---|
| chip/bg-top · bg-bottom · bg-top-pressed · bg-bottom-pressed · bg-selected · border-selected · fg | navy/550 · 650 · 600 · 700 · navy/500 · amber/200 · white | ½ / 2× / Max |
| chip/h · pad-x · radius | 40 · 12 · 8 | 8 = field 12 − inset 4 (concentric) |
| bet-row/bg-top · bg-bottom · pad · gap | navy/600 · navy/700 · 4 · 8 | chip-երի շարքը դաշտի մեջ |
| segment/bg-pressed · bg-selected · fg · fg-selected | navy/600 · navy/500 · alpha/white/50 · white | difficulty ընտրիչի բջիջ |
| segment/track/bg · pad · gap · radius | navy/700 · 4 · 4 · 12 | track = «փոսը» |
| segment/h · pad-x · gap · radius · dot/size | 40 · 8 · 8 · 8 · 8 | 390 պանել → 4 × 85px |
| difficulty/easy · medium · hard · expert /bg | green/300 · amber/200 · amber/500 · red/500 | heat. կետ + glow |
| panel/bg · pill/bg | alpha/night/92 · alpha/night/55 | HUD / Bet Panel |
| panel/pad · radius · section/gap · controls/gap · pill/gap · balance/gap | 16 · 16 · 12 · 8 · 6 · 2 | |

### Global (կոմպոնենտից դուրս)

| Բանալի | → | Figma |
|---|---|---|
| text/primary · secondary · placeholder | white · alpha/white/50 · alpha/white/35 | Colors/Global/Text |
| icon/primary · secondary | white · alpha/white/50 | Colors/Global/Icon |
| border/subtle · focus · error | alpha/white/12 · amber/200 · red/400 | Colors/Global/Stroke |
| shape/accent | amber/200 | Colors/Global/Shape |
| state/win · loss · caught · crash | green/300 · red/400 · red/450 · red/500 | Colors/Global/State |
| space/xs · sm · md · lg · xl | 4 · 8 · 12 · 16 · 24 | Dimensions/Global/Space |
| radius/xs · sm · md · lg · xl · pill | 6 · 8 · 10 · 12 · 16 · 999 | Dimensions/Global/Radius |
| stroke/hairline · control | 1 · 2 | Dimensions/Global/Stroke |
| size/icon · touch | 24 · 48 | Dimensions/Global/Size (touch ≥44, մոբայլ առաջինը) |
| opacity/disabled | 0.4 | Opacity/Disabled — disabled = opacity, ոչ palette |

### Font/<Style>/* (Type)

Ամեն text style ՄԻԱՅՆ `font/<style>/{family, size, weight, tracking, lh}`-ից ա
սնվում, դրանք էլ՝ Type primitives-ից։ lh-ը **px** ա ու միակն ա semantic-ում
(Տիգրան, հարց 6). Figma-ում variable-ին կապված lineHeight-ը միշտ px ա։

| Style | Չափ/քաշ | Tracking | LH | Օգտագործում |
|---|---|---|---|---|
| Display/Multiplier | 56 Bold | −2 | 56 | 1.00x ցուցիչը |
| Amount | 20 Bold | .5 | 24 | bet գումարը, balance |
| Button/Large | 16 SemiBold | .5 | 19 | Place Bet / Run! Daddy |
| Button/Base | 14 SemiBold | .5 | 17 | chip, segment, cashout |
| Pill | 12 Bold | .2 | 14 | պատմության pill-եր, helper |
| Label/Caps | 12 Regular | 2 | 17 | section label-ներ (UPPERCASE) |

## Ֆրոնտի սպառումը

- **CSS.** `--rd-button-bet-bg`, `--rd-field-border-focus`, `--rd-segment-track-pad`…
  State-ը class-ով ա, suffix 1:1 (`.pressed`, `.selected`, `:focus-visible`,
  native `:disabled` + `--rd-opacity-disabled`)։
- **JS** (`src/tokens.js`). `import { RD } from "./tokens.js"`;
  `RD.button.bet.bg` = `0x2EC27E`, `RD.button.bet.glow` = `{ color: 0x2EC27E, alpha: .35 }`,
  `RD.button.hLg` = 48, `RD.opacity.disabled` = .4, `RD.font.buttonLarge.lh` = 19։
  JSDoc typedef-ը մոդուլի մեջ ա, `.d.ts` չկա (stack-ը plain JS ա)։
- **Legacy.** 45 հին `--rd-*` անուն (`--rd-action-bet` → `var(--rd-button-bet-bg)`…)
  ու 12 `--ui-*` (index.html v16_14) alias են մնում մինչև T-0010-ի review-ն անցնի,
  հետո մեկ commit-ով հանվում են (Տիգրան. «v2.0 → T-0010 → legacy ջնջում»)։
  `--eg-space-*` / `--eg-radius-*` արդեն ջնջված են (ֆրոնտը երբեք չի սպառել)։

## World (խաղի աշխարհ, Figma-only, 2 մոդ)

| Token | Proto | Deep night |
|---|---|---|
| world/sky-top · sky-mid · sky-horizon | #16418F · #2A68B8 · #6D97D3 | #050F2E · #0F2C66 · #35538F |
| world/fog · asphalt · sidewalk · lane | #B6BFDA · #8E93B6 · #DEDDE8 · #DCDDE8 | #5C6890 · #4F5476 · #9A99B0 · #B9BACB |
| world/lamp · neon | #FFD27A · #FF2BD6 | (նույնը) |

Կոդում սա mode չի, `skyDark` slider ա (COL_PROTO→COL_NIGHT mix) — Figma-ի
արտեֆակտ ա։ Երբևէ World-ը գեներատոր մտնի՝ աղբյուրը tex.js-ն ա, ոչ Figma-ն (Տիգրան)։

## Figma «Run Dady UI» — էջեր ու set-եր

| Էջ | Section / node | Բովանդակություն |
|---|---|---|
| Foundations | 2:2 (հիմնադրի, անձեռնմխելի) · 21:2 «Components — v1» · 46:47 «— v2» · **60:231 «Design system — v2.0»** | ramp-եր, type, doc |
| **Atoms** (18:2) | Atoms · Icons 18:40 · Button 19:92 · Input 20:22 · Chip 37:55 · Segment 38:83 | state-ից անկախ կամ մեկ set-ի մեջ փակ leaf-եր |
| **Molecules** (59:305) | Molecules · Bet Amount 40:115 · Difficulty 39:99 · Bet Panel 41:88 | control-ների կոմպոզիցիաներ |
| Screens (42:47) | Mobile 42:48 (390×844) · Desktop 43:120 (1280×800) | instance-ներ (Atoms/Molecules-ից) |

Set-երը. Button `Kind Bet/Cashout/Ghost × Size Large/Base × State Default/Pressed/
Disabled` (18) — Kind-ը մնում ա մինչև հիմնադրի որոշումը (3 set, թե Kind. product.md).
Input `State Default/Focus/Error` · Chip `State Default/Pressed/Selected/Disabled` ·
Segment `Level × State Default/Selected/Pressed` (12) · Difficulty `Selected` ·
Bet Amount `State` · Bet Panel (կոմպոզիցիա)։ Ամեն set իր token խմբին ա կապված
(Button → Colors/Button/*, Dimensions/*/Button/*; Input → Field/*; Chip → Chip/*;
Segment/Difficulty → Segment/*, Difficulty/*; Bet Amount → Field/* + Bet Row/*;
Bet Panel → Panel/*)։ Stroke width-երը Global/Stroke-ից են (դիտավորյալ)։
Ոչ մի կոմպոնենտում hardcoded fill/stroke/padding/radius չկա, ոչ մի binding primitive-ի
(T-0014 աուդիտ. Atoms 937, Molecules 913, Screens 702 binding, 0 primitive, 0 hardcoded)։

Kit-ը (`tools/design/figma-kit/`) variables → text styles → Icons/Button/Input-ը
սարքում ա Atoms-ի section-ների մեջ. Chip/Segment/Difficulty/Bet Amount/Bet Panel-ը
MCP-ով են — kit-ի backlog (README)։
