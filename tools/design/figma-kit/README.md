# Run Dady UI kit — Figma plugin (token-ներից → variables, text styles, կոմպոնենտներ)

Նույն Plugin API-ն, ինչ Figma MCP-ի `use_figma`-ն, բայց **առանց tool-call quota-ի**
(Starter plan-ը ամսական մի քանի զանգ ա թողնում)։ Կոդը git-ում ա, կրկնելի ա, ու
մեկ ճշմարտությունից ա գալիս՝ `tools/design/gen-tokens.mjs`։

```
gen-tokens.mjs ──► docs/design/tokens.json + tokens.css
               └─► tools/design/figma-kit/code.js  (= TOKENS + kit.src.js)
```

`code.js`-ը ձեռքով ՉԵՆՔ խմբագրում — խմբագրում ենք `kit.src.js`-ը ու վազեցնում
`node tools/design/gen-tokens.mjs`։

## Տեղադրում (մեկ անգամ, Figma desktop)

1. Բացի «Run Dady UI» ֆայլը։
2. Menu → **Plugins → Development → Import plugin from manifest…**
3. Ընտրի `tools/design/figma-kit/manifest.json`։

## Վազեցնել

**Plugins → Development → Run Dady UI kit →**

| Հրաման | Ինչ ա անում |
|---|---|
| Run all | 1→6 հերթով |
| 1. Variables audit + sync | Primitives → scopes `[]`, hidden. Semantic (UI/Layout/Type) → alias primitive-ի վրա, scopes, code syntax։ Նոր token-ները ավելացնում ա, եղածները տեղում թարմացնում |
| 2. Text styles → font/* | 6 text style-ի family/size/weight/tracking/line-height-ը կապում ա `font/<style>/*` variable-ներին |
| 3. Icons | `Icon/Plus, Minus, Close, ChevronDown, Replay, History, Settings` — 24 grid, 2px stroke, `icon/primary` |
| 4. Button | Kind (Bet/Cashout/Ghost) × Size (Large/Base) × State (Default/Pressed/Disabled) = 18 variant. Props՝ Label, Show icon, Icon (INSTANCE_SWAP) |
| 5. Input | State Default/Focus/Error. Props՝ Label, Value, Unit, Helper, Show helper |
| 6. Foundations doc | «Components — v1» frame Foundations էջին՝ instance-ներով ու կանոններով |

Ամեն վազքից հետո Components էջին «Kit run report» տեքստ ա մնում՝ ինչ արվեց։

## Անվտանգություն (հիմնադրի ձեռքով արածին չի կպնում)

- Ամեն ստեղծած node ունի `pluginData('rdkit')` մարկեր։ Կրկնակի վազքը ջնջում ա
  **միայն** մարկերով նույնանուն node-երը (Button, Input, Icons, doc frame, report) ու
  վերակառուցում։ Ձեռքով արածը մնում ա։
- Variables ու text styles-ը **չեն ջնջվում**. գտնվում են անունով, թարմացվում տեղում։
  World collection-ին ընդհանրապես ձեռք չի տալիս։
- Icons-ը վերակառուցելուց հետո Button-ն էլ վերակառուցի (icon instance-ները նոր
  կոմպոնենտներին պիտի նայեն)։

## Փորձարկում առանց Figma-ի

```
node tools/design/figma-kit/test/mock-run.mjs          # ամբողջ հոսքը mock figma-ի վրա
node tools/design/figma-kit/test/mock-run.mjs button   # մեկ հրաման
```

Mock-ը ստուգում ա հոսքն ու API-ի կանչերը (bind դաշտեր, փուլերի կարգ, hardcoded fill
չլինելը), ոչ թե render-ը։ Իրական տեսքը Figma-ում ա ստուգվում։

## Հայտնի սահմաններ

- Starter plan՝ 1 մոդ, 3 էջ։ Kit-ը 1 մոդ ա ենթադրում, «Components» էջ ա ստեղծում
  (3-ի սահմանը լցված լինի՝ Foundations-ի վրա ա դնում)։
- Cashout gradient-ի stop-երը variable-կապված են (`boundVariables` stop-ի վրա). եթե
  Figma-ի տվյալ տարբերակը դա մերժի՝ solid fallback ա գնում, report-ում գրվում ա։
- Roboto Mono-ն պիտի հասանելի լինի (Google Fonts, Figma-ում կա)։ Չլինի՝ Inter fallback +
  report։
