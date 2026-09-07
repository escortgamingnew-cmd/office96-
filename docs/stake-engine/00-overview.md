# Stake Engine — ընդհանուր պատկեր ու դոկերի քարտեզ

Ստուգված՝ 2026-09-07, Սևակ։ Աղբյուրը՝ պաշտոնական կայքը՝
https://stake-engine.com/ ու https://stake-engine.com/docs (բրաուզերով,
ուղիղ)։ Ամեն պնդման կողքին՝ էջը, որտեղից ա։

## Ինչ ա Stake Engine-ը (ստուգված)

- RGS (Remote Gaming Server) պլատֆորմ ա անկախ դեվելոփերների համար՝
  խաղերը ուղիղ Stake ու Stake US վրա հանելու։ [/]
- Կոմերցիոն մոդելը՝ **10% GGR** perpetual royalty, վճարումներ ամեն ամսի
  1-ին։ [/]
- SDK-ն **ընտրովի (optional)** փաթեթ ա. կարաս սեփական front/math
  ունենաս, եթե ձևաչափերին համապատասխանում ա։ [/docs]
- SDK-ի երկու մասը. **Math Framework** — Python, խաղի կանոններ,
  սիմուլյացիա, win distribution-ների օպտիմիզացիա, գեներացնում ա backend
  ու config ֆայլերը, lookup table-ները։ **Frontend Framework** —
  «PixieJS/Svelte-based» (այսպես ա գրված դոկում)։ [/docs]
- RGS-ի անունը դոկում՝ **Carrot RGS**։ [/docs]

## Խաղի ձևաչափի ԿԱՐԵՎՈՐԱԳՈՒՅՆ փաստը (ստուգված, /docs)

Խաղերը **ստատիկ ֆայլեր** են. բոլոր հնարավոր արդյունքները ՆԱԽԱՊԵՍ
գեներացվում են ու վերբեռնվում սեղմված ֆայլերով (սովորաբար ըստ mode-երի)։
Ամեն արդյունք քարտեզագրվում ա CSV տողի՝ simulation number, ընտրվելու
հավանականություն, վերջնական payout multiplier։ Ռաունդ սկսելիս RGS-ը
քաշին համամասնորեն ընտրում ա simulation number ու իրադարձությունները
վերադարձնում `/play` API պատասխանով։ Վերբեռնումը՝ Admin Control Panel
(ACP)։

Հետևանք մեզ համար. Run Dady-ի continue/cash-out մեխանիկան պիտի նստի
«նախագեներացված արդյունքների» մոդելի վրա — T-0002-ի կենտրոնական հարցը
հենց սա ա։ (Սա իմ եզրակացությունն ա, ոչ դոկի պնդում — ստուգվելու ա
math բաժինը կարդալիս։)

## Դոկերի ամբողջական քարտեզը (ստուգված, /docs nav)

Getting Started՝ /docs · RGS Details՝ /docs/rgs, /docs/rgs/wallet,
/docs/rgs/example · Payments՝ /docs/payments

Front End՝ /docs/front-end + dependencies, getting-started, storybook,
flowchart, task-breakdown, adding-new-events, file-structure, context, ui

Math՝ /docs/math + setup, quick-start, math-file-format, sdk-directory,
high-level-structure (state-machine, game-structure, game-format),
game-state-structure (simulation-acceptance, setup/configs, betmode,
distribution, symbols, board, wins, events, force-files), source-files
(config, events, executables, state, win-manager, outputs, calculations՝
board/tumble/lines/ways/scatter/cluster), utilities, example-games,
optimization-algorithm

Approval Guidelines՝ /docs/approval-guidelines + submission-checklist,
game-replay-requirements, game-quality-rankings, rgs-communication,
front-end-communication, math-verification, game-tile-requirements,
general-disclaimer, jurisdiction-requirements

Legal՝ /docs/terms, /docs/privacy

## Դիտարկումներ, որ ստուգում են պահանջում (questions-ի թեկնածու)

- Դոկի intro-ն SDK-ն նկարագրում ա «slot games»-ի շուրջ. crash/instant
  խաղի (Run Dady) համապատասխանությունը state machine-ին ու mode-երին
  պիտի պարզվի math բաժնից։
- Frontend Framework-ը Svelte-ի վրա ա. D-001-ը (Pixi.js 2.5D) սրա հետ
  ոնց ա նստում — Տիգրանի հետ քննարկելու հարց, /docs/front-end-ը
  կարդալուց հետո։
