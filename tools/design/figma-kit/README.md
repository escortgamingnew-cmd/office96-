# Run Dady UI kit — Figma plugin (token-ներից → variables, text styles, կոմպոնենտներ)

Նույն Plugin API-ն, ինչ Figma MCP-ի `use_figma`-ն, բայց **առանց tool-call quota-ի**։
Կոդը git-ում ա, կրկնելի ա, ու մեկ ճշմարտությունից ա գալիս՝ `tools/design/gen-tokens.mjs`։

```
gen-tokens.mjs ──► docs/design/tokens.json + tokens.css + tokens.dtcg.json
               ├─► prototype/pixi-feel/src/tokens.js (+ index.html @tokens splice)
               └─► tools/design/figma-kit/code.js  (= TOKENS + kit.src.js)
```

`code.js`-ը ձեռքով ՉԵՆՔ խմբագրում — խմբագրում ենք `kit.src.js`-ը ու վազեցնում
`node tools/design/gen-tokens.mjs`։ Collection-ը, scopes-ը, code syntax-ը, Figma անունը,
description-ը — ամեն ինչ `tokens.json → figma.*`-ից ա. kit-ը միայն կիրառում ա։

## Տեղադրում (մեկ անգամ, Figma desktop)

1. Բացի «Run Dady UI» ֆայլը։
2. Menu → **Plugins → Development → Import plugin from manifest…**
3. Ընտրի `tools/design/figma-kit/manifest.json`։

## Վազեցնել

**Plugins → Development → Run Dady UI kit →**

| Հրաման | Ինչ ա անում |
|---|---|
| Run all | 1→6 հերթով |
| 1. Variables audit + sync | Primitives (գույն, `Number/n`, Type) → scopes `[]`, hidden. Semantic (v2.0 կոմպոնենտ-scoped) → alias primitive-ի վրա, scopes, description, code syntax։ Նոր token-ները ավելացնում ա, եղածները տեղում թարմացնում. v1.2 անունով գտածը ՏԵՂՈՒՄ ա վերանվանում (`figma.prev`) |
| 2. Text styles → Font/* | 6 text style-ի family/size/weight/tracking/line-height-ը կապում ա `Font/<Style>/*` variable-ներին |
| 3. Icons | `Icon/Plus, Minus, Close, ChevronDown, Replay, History, Settings` — 24 grid, 2px stroke, Icon/Primary |
| 4. Button | Kind (Bet/Cashout/Ghost) × Size (Large/Base) × State (Default/Pressed/Disabled) = 18 variant. Token-ները՝ Colors/Button/*, Dimensions/*/Button/*. Props՝ Label, Show icon, Icon (INSTANCE_SWAP) |
| 5. Input | State Default/Focus/Error. Token-ները՝ Colors/Field/*, Dimensions/*/Field/*. Props՝ Label, Value, Unit, Helper, Show helper |
| 6. Foundations doc | «Components — v1» frame Foundations էջին՝ instance-ներով ու կանոններով |

Կոմպոնենտները **Atoms** էջին են գնում, իրենց section-ի մեջ («Atoms · Button»), եթե section-ը
կա. չկա՝ էջի աջ եզրին։ Ամեն վազքից հետո Atoms էջին «Kit run report» տեքստ ա մնում։

**Backlog (kit-ում դեռ չկան, MCP-ով են սարքված, T-0013/T-0014).** Chip, Segment,
Difficulty, Bet Amount, Bet Panel (Molecules էջ), «Design system — v2.0» doc։ Variables
փուլը (1) դրանց token-ները ամբողջությամբ սինք ա պահում — կոմպոնենտային փուլերն են պակաս։

## Անվտանգություն (հիմնադրի ձեռքով արածին չի կպնում)

- Ամեն ստեղծած node ունի `pluginData('rdkit')` մարկեր։ Կրկնակի վազքը ջնջում ա
  **միայն** մարկերով նույնանուն node-երը (Button, Input, Icons, doc frame, report) ու
  վերակառուցում։ Ձեռքով արածը մնում ա։
- Variables ու text styles-ը **չեն ջնջվում**. գտնվում են անունով (v2.0 → v1.2 → հում
  բանալի), թարմացվում տեղում։ World collection-ին ընդհանրապես ձեռք չի տալիս։
- Icons-ը վերակառուցելուց հետո Button-ն էլ վերակառուցի (icon instance-ները նոր
  կոմպոնենտներին պիտի նայեն)։

## Փորձարկում առանց Figma-ի

```
node tools/design/figma-kit/test/mock-run.mjs          # ամբողջ հոսքը mock figma-ի վրա
node tools/design/figma-kit/test/mock-run.mjs button   # մեկ հրաման
```

Mock-ի սկզբնական վիճակը v1.2-ի Figma անուններով ա. ստուգում ա in-place rename-ը (ID-ն
նույնը), Number pool-ը hidden, Layout semantic-ը alias, ALL_SCOPES 0, description ամեն
semantic-ի վրա, hardcoded fill չլինելը։ Render-ը Figma-ում ա ստուգվում։

## Հայտնի սահմաններ

- Kit-ը 1 մոդ ա ենթադրում (Semantic-ին mode չկա, T-0013 որոշում)։ «Atoms» էջը ինքն ա
  ստեղծում, եթե չկա։
- Cashout gradient-ի stop-երը variable-կապված են (`boundVariables` stop-ի վրա). եթե
  Figma-ի տվյալ տարբերակը դա մերժի՝ solid fallback ա գնում, report-ում գրվում ա։
- Roboto Mono-ն պիտի հասանելի լինի (Google Fonts, Figma-ում կա)։ Չլինի՝ Inter fallback +
  report։
