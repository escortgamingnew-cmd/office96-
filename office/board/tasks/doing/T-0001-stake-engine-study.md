# T-0001 — Stake Engine-ի ամբողջական ուսումնասիրություն

- **Author.** Aram (founder)
- **Assignee.** Սևակ (lead)
- **Opened.** 2026-09-07
- **Priority.** P0

## Ինչ ա պետք
stake-engine.com-ը ու պաշտոնական դոկումենտացիան էջ առ էջ անցնել ու
`docs/stake-engine/`-ում թեմատիկ ֆայլեր սարքել. Math SDK, Web SDK,
RGS API, books/փաթեթավորման ձևաչափ, upload/validation պահանջներ,
certification։ Ամեն պնդում՝ հղումով ու «ստուգված՝ ամսաթիվ» նշումով։
«Արված» = թիմի ցանկացած անդամ կարող ա միայն docs-ով ճիշտ թասկ գրել
առանց կայքը բացելու։

Research-ի սխեման (հիմնադրի որոշում, 2026-09-07).
- Պատասխանատուն Սևակն ա. ինքը ուղիղ ուսումնասիրում ա stake-engine.com-ը
  WebFetch/WebSearch-ով, raw նյութին չսպասելով։
- Հիմնադիրը արտաքին research (ChatGPT Deep Research, Grok) գցում ա
  `docs/research-raw/`. դա ՉՍՏՈՒԳՎԱԾ հետք ա — docs/stake-engine/ մտնում
  ա միայն պաշտոնական աղբյուրի դեմ ստուգված պնդումը, հերքվածը raw-ում
  պիտակվում ա «ՀԵՐՔՎԱԾ»։
- Անորոշ հարցերը՝ `docs/research-raw/questions.md`, պատասխանները նորից
  ստուգվում են։
- Կոդային ճշգրտության մասերը (Math SDK API, book ձևաչափ, upload
  validation) ՄԻԱՅՆ պաշտոնական դոկից/repo-ից — միջնորդ չկա։

## Կոնտեքստ
Սա մնացած ամեն ինչի հիմքն ա. T-0002-ը կախված ա սրանից։

## Log
- [2026-09-07] Aram. բացվեց, հաստատված ա հիմնադրի կողմից։
- [2026-09-07] Սևակ. research սխեման ավելացվեց, վերցնում եմ (approved → doing)։
- [2026-09-07] Սևակ. առաջին ուղիղ անցում. կայքի ու /docs-ի ամբողջ քարտեզը + SDK-ի հիմնական փաստերը գրանցված են docs/stake-engine/00-overview.md-ում (ստուգված, հղումներով)։ Հաջորդը՝ /docs/math բաժինը էջ առ էջ։
- [2026-09-07] Սևակ. /docs/math (7 էջ) ու /docs/rgs (2 էջ) անցած են → math-sdk.md ու rgs-api.md ստուգված փաստերով։ Անանիան ապաբլոկված ա։ Մնում ա. /docs/front-end (9 էջ), approval-guidelines (10 էջ), math-ի մնացած ենթաէջերը, example-games + repo-ները։
- [2026-09-07] Սևակ. /docs/front-end-ի 6 էջ → web-sdk.md։ Տիգրանն էլ ա ապաբլոկված։ Մնացածը՝ front-end-ի 3 ենթաէջ, payments, approval-guidelines (10 էջ), math-ի մնացած ենթաէջեր, example-games, երկու repo-ները (math-sdk, web-sdk, ts-client)։
- [2026-09-07] Սևակ. հիմնադրի 2 PDF-ը մշակված (research-raw + ստուգման նոթեր), approval-guidelines.md՝ պաշտոնական թվերով։ Կարմիր գիծը հաստատված. stateless, early cashout արգելված; RTP 90.0-96.7։ ChatGPT-ի «RTP range GAP» պնդումը ՀԵՐՔՎԱԾ։
- [2026-09-07] Սևակ. պրոտոյի տեխնիկական վերլուծություն → docs/reference/proto-analysis.md, ասեթները հանված assets/։ Pixi 2.5D-ի վերակառուցումը գնահատված որպես իրագործելի։
