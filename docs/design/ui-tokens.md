# Run Dady — UI token-ներ (մեկ ճշմարտություն կոդի ու Figma-ի համար)

Աղբյուրը **գեներատորն ա**՝ `tools/design/gen-tokens.mjs` (v1.2, T-0013)։ Anchor
գույները կոդից են (`prototype/pixi-feel/index.html` :root, `src/tex.js`)։
Գեներատորը գրում ա `docs/design/tokens.json` + `tokens.css` +
`tools/design/figma-kit/code.js`, Figma «Run Dady UI»-ն սինքվում ա դրանից
(MCP կամ kit plugin)՝ https://www.figma.com/design/JTDf8M2yHwzitpAAPzXnca
Կանոնը. **կոդը ղեկավարում ա, Figma-ն հետևում ա** — anchor փոխելը
գեներատորի ANCHOR աղյուսակում ա, ոչ ձեռքով (D-002-ով այլ բան չորոշվի)։

## Ճարտարապետությունը (ատոմիկ, T-0013)

```
Primitives  ──►  Semantic  ──►  Text styles / Components / Screens
(hidden, scopes [])   (միակ սպառվող շերտը, 100% alias)
```

- **Primitives** = հում սանդղակներ. գույն 0–900 ramp-երով, alpha, spacing,
  radius, type։ Figma-ում hidden են, scopes `[]` — ոչ մի էլեմենտ դրանցից չի
  սնվում (հիմնադրի կանոնը, 09-12)։
- **Semantic** = ինչի ՀԱՄԱՐ ա արժեքը. ամեն մեկը primitive-ի **alias** ա
  (գեներատորը raw արժեք semantic-ում սխալ ա գցում)։ Խմբավորված ա
  purpose-ով՝ ռեֆերենսի ոճով (`Colors/Global/{Frame, Shape, Text, Border,
  Icon}` + խաղային շերտ `Colors/{Action, State, Surface, Difficulty}`)։
- **Երկու անուն, մեկ token.** Token-ի բանալին CSS անունն ա (`text/primary`
  → `--rd-text-primary`), Figma-ում նույն variable-ը purpose անուն ա կրում
  (`Colors/Global/Text/Primary`, `tokens.json → figmaNames`)։ Վերանվանումը
  Figma-ում ՏԵՂՈՒՄ ա (ID-ն նույնը), binding-ները չեն կոտրվում։
- **Collection-ները Figma-ում** (5). Primitives 64 (գույն + alpha, hidden) ·
  Layout 40 (Spacing/* hidden + Padding/Gap/Size/Stroke/Radius semantic) ·
  Type 53 (Family/Font Size/Weight/Tracking/Line Height hidden + Font/<Style>/*
  semantic) · UI 43 (Colors/* + Opacity semantic) · World 16 (Figma-only, 2
  մոդ՝ Proto / Deep night)։
- **Mode-եր.** Semantic-ին mode ՉԿԱ (մեկ «Night»)։ Որոշումը՝ T-0013 Log.
  կոդում ոչ մի token չկա, որ platform-ով տարբերվի (index.html-ում `@media`
  չկա, մոբայլ/desktop տարբերությունը դասավորությունն ա, ոչ արժեքը), light
  theme Stake-ի խաղում չկա — ֆեյք mode չենք սարքում, մինչև սպառող չլինի։
  World-ի 2 մոդը մնում ա (Proto/Deep night)։

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

`white` = #FFFFFF (= night/0, մնում ա հին binding-ների համար)։ Կողքի նոթ.
green/700 (#22B573, won gradient-ի ներքև) green/600-ից բաց ա — կոդի արժեք ա,
ramp-ը դրան չի կպչում։

### Alpha primitives (որ semantic-ը 100% alias լինի)

| Token | Արժեք | Սպառող |
|---|---|---|
| alpha/white/12 · 35 · 50 | white @12/35/50% | border/subtle · text/placeholder · text/secondary, icon/secondary |
| alpha/night/92 | night/800 @92% | surface/panel |
| alpha/night/55 | night/900 @55% | surface/pill |
| alpha/green/8 · 16 · 35 | green/500 @8/16/35% | action/ghost · ghost-pressed · bet-glow |
| alpha/amber/45 | amber/500 @45% | action/cashout-glow |

### Չափեր ու տառատեսակ

- space: 1 2 4 6 8 10 12 14 16 20 22 24 32 40 48 (Figma՝ `Spacing/n`, hidden)
- radius: sm 6 · **inner 8** · md 10 · control 12 · chip 16 · pill 999
  (inner = control 12 − track pad 4. segment-ը track-ի մեջ, chip-ը դաշտի մեջ՝
  concentric)
- type: family mono «Roboto Mono» / sans «Inter» / armenian «Noto Sans
  Armenian» · size 10 11 12 14 16 20 28 40 56 · weight 400/500/600/700 ·
  tracking tight −2 / base .2 / button .5 / caps 2 · lh tight 100% / snug 120% /
  base 140%

## Semantic (ինչի ՀԱՄԱՐ ա) — Figma անունը · CSS անունը · → primitive

### Colors/Global (ընդհանուր UI)

| Figma | CSS | → |
|---|---|---|
| Global/Frame/Panel | --rd-surface-panel | alpha/night/92 |
| Global/Frame/Pill | --rd-surface-pill | alpha/night/55 |
| Global/Frame/Input | --rd-surface-input | navy/700 |
| Global/Frame/Segment | --rd-surface-segment | navy/700 (segmented track) |
| Global/Frame/Segment Selected | --rd-surface-segment-selected | navy/500 |
| Global/Shape/Accent | --rd-brand-accent | amber/200 |
| Global/Text/Primary · Secondary · Placeholder | --rd-text-* | white · alpha/white/50 · alpha/white/35 |
| Global/Icon/Primary · Secondary | --rd-icon-* | white · alpha/white/50 |
| Global/Border/Subtle · Focus · Error | --rd-border-* | alpha/white/12 · amber/200 · red/400 |

### Colors/Action, State, Surface, Difficulty (խաղային շերտ)

| Figma | CSS | → |
|---|---|---|
| Action/Bet/Default · Pressed · Glow · On | --rd-action-bet, -pressed, -glow, --rd-action-on-bet | green/500 · green/600 · alpha/green/35 · night/900 (մուգ տեքստ, 8.4:1) |
| Action/Cashout/Top · Bottom · Pressed Top · Pressed Bottom · Glow · On | --rd-action-cashout-* , --rd-action-on-cashout | amber/300 · 500 · 400 · 600 · alpha/amber/45 · amber/900 |
| Action/Won/Top · Bottom | --rd-action-won-* | green/300 · green/700 |
| Action/Ghost/Default · Pressed · Border · On | --rd-action-ghost*, --rd-action-on-ghost | alpha/green/8 · 16 · green/500 · green/300 |
| State/Win · Loss · Caught · Crash | --rd-state-* | green/300 · red/400 · red/450 · red/500 |
| Surface/Chip/Top · Bottom | --rd-surface-chip-* | navy/550 · navy/650 |
| Surface/Bet Row/Top · Bottom | --rd-surface-betrow-* | navy/600 · navy/700 |
| Difficulty/Easy · Medium · Hard · Expert | --rd-difficulty-* | green/300 · amber/200 · amber/500 · red/500 (heat սանդղակ) |
| Opacity/Disabled | --rd-opacity-disabled | 0.4 |

### Layout semantic

| Figma | CSS | → | Սպառող |
|---|---|---|---|
| Padding/Button/Y · X | --rd-pad-button-* | 14 · 22 | Button |
| Padding/Input/Y · X | --rd-pad-input-* | 12 · 16 | Input, Bet Amount (ձախ) |
| Padding/HUD | --rd-pad-hud | 16 | HUD, Bet Panel |
| Padding/Track | --rd-pad-track | 4 | Difficulty track, Bet Amount դաշտի աջ/վեր/վար (chip inset) |
| Padding/Segment/X · Padding/Chip/X | --rd-pad-segment-x, -chip-x | 8 · 12 | Segment (390 պանել → 4 × 85px), Chip |
| Gap/Pills · Controls · Icon · Segments · Section | --rd-gap-* | 6 · 8 · 8 · 4 · 12 | — |
| Size/Icon · Touch · Chip · Dot | --rd-size-* | 24 · 48 · 40 · 8 | icon grid · touch target ≥44 · chip/segment բարձրություն · difficulty կետ |
| Stroke/Hairline · Control | --rd-stroke-* | 1 · 2 | border-ներ |
| Radius/SM · Inner · MD · Control · Chip · Pill | --eg-radius-* | 6 · 8 · 10 · 12 · 16 · 999 | (radius-ը primitive-ում ա, semantic անուններով) |

### Font/<Style>/* (Type)

Ամեն text style ՄԻԱՅՆ `Font/<Style>/{Family, Size, Weight, Tracking, Line
Height}`-ից ա սնվում, դրանք էլ՝ Type primitives-ից։ Line Height-ը **px** ա
(size × ratio, կլորացված. Display 56, Amount 24, Button/Large 19, Button/Base
17, Pill 14, Label/Caps 17) — Figma-ում variable-ին կապված lineHeight-ը միշտ
px ա, PERCENT binding չկա (T-0012)։ CSS-ում `--rd-font-<style>-lh` px ա։

| Style | Չափ/քաշ | Tracking | LH | Օգտագործում |
|---|---|---|---|---|
| Display/Multiplier | 56 Bold | −2 | 56 | 1.00x ցուցիչը |
| Amount | 20 Bold | .5 | 24 | bet գումարը, balance |
| Button/Large | 16 SemiBold | .5 | 19 | Place Bet / Run! Daddy |
| Button/Base | 14 SemiBold | .5 | 17 | chip, segment, cashout |
| Pill | 12 Bold | .2 | 14 | պատմության pill-եր, helper |
| Label/Caps | 12 Regular | 2 | 17 | section label-ներ (UPPERCASE) |

## World (խաղի աշխարհ, Figma-only, 2 մոդ)

| Token | Proto | Deep night |
|---|---|---|
| world/sky-top · sky-mid · sky-horizon | #16418F · #2A68B8 · #6D97D3 | #050F2E · #0F2C66 · #35538F |
| world/fog · asphalt · sidewalk · lane | #B6BFDA · #8E93B6 · #DEDDE8 · #DCDDE8 | #5C6890 · #4F5476 · #9A99B0 · #B9BACB |
| world/lamp · neon | #FFD27A · #FF2BD6 | (նույնը) |

Live feel-ը (skyDark 0.75) երկուսի խառնուրդն ա։ World-ը գեներատորում չկա —
սինքը առանձին թասկ ա, եթե պետք լինի։

## Կոմպոնենտներ Figma-ում (Components էջ)

| Set | Node | Variant-ներ / props |
|---|---|---|
| Icons | 18:40 | 7 icon, 24 grid, Icon/Primary |
| Button | 19:92 | Kind Bet/Cashout/Ghost × Size Large/Base × State Default/Pressed/Disabled (18); Label, Show icon, Icon |
| Input | 20:22 | State Default/Focus/Error; Label, Value, Unit, Helper, Show helper |
| Chip | 37:55 | State Default/Pressed/Selected/Disabled; Label (½ / 2× / Max, preset-ներ) |
| Segment | 38:83 | Level Easy/Medium/Hard/Expert × State Default/Selected/Pressed (12); label = Level |
| Difficulty | 39:99 | Selected Easy/Medium/Hard/Expert — track + 4 Segment (FILL) |
| Bet Amount | 40:115 | State Default/Focus/Error; Label, Value, Unit, Helper, Show helper; ½/2×/Max դաշտի մեջ |
| Bet Panel | 41:88 | Bet Amount → Difficulty → Place Bet, 390 մոբայլ / 320 desktop սայդբար |

Կանոն. կոճակի տեքստը մուգ ա (Action/Bet/On = night/900, 8.4:1) — սպիտակը
green/500-ի վրա 2.3:1 էր։ Touch target ≥48 (Size/Touch)։ Ոչ մի կոմպոնենտում
hardcoded fill/stroke/padding/radius չկա — ամեն ինչ variable ա։

## Հին անուններ (index.html)

`--ui-betc`, `--ui-betc-dn`, `--ui-betc-glow`, `--ui-runc*`, `--ui-btnt`,
`--ui-coc1/2`, `--ui-coc-glow`, `--ui-rad` — tokens.css-ում alias են մնում,
ֆրոնտը դրանց վրա ա (T-0010)։ Կոդում տառատեսակը `ui-monospace, Menlo,
monospace` (family/mono-css), Figma-ում ներկայացուցիչը Roboto Mono։
