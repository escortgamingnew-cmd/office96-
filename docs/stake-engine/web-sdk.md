# Web SDK (Frontend) — ստուգված փաստեր

Ստուգված՝ 2026-09-07, Սևակ։ Աղբյուրները՝ /docs/front-end բաժինը (intro,
dependencies, getting-started, file-structure, adding-new-events, context)։
Դեռ չկարդացած ենթաէջեր. storybook, flowchart, task-breakdown, ui —
կավելանան հաջորդ անցումով։

## Stack-ը (պաշտոնական)

[/docs/front-end, /dependencies, /getting-started]

- **PixiJS + Svelte**, կապող շերտը՝ իրենց in-house **pixi-svelte** npm
  փաթեթը (Pixi-ն դեկլարատիվ ձևով)։
- Monorepo՝ **Turborepo + pnpm** (repo անունը՝ web-sdk)։ **SvelteKit**
  app-երի համար, **Storybook**՝ դեվ/թեստ միջավայր, **xstate**՝ բեթի
  state machine, **TypeScript**, ձայնը՝ howler, անիմացիաներ՝ **Spine**։
- Տարբերակներ. Node **18.18.0**, pnpm **10.5.0**։
- Հրամաններ. `pnpm install`, `pnpm run storybook --filter=<app>`,
  `pnpm run dev --filter=<app>`։

## Կառուցվածքը

[/docs/front-end/file-structure]

- `apps/` — մեկ խաղ = մեկ app. sample-ները՝ cluster, lines, **price**,
  scatter, ways։ Մուտքը `+page.svelte`՝ setContext() + <Game />։
- `packages/` — workspace:* local փաթեթներ. config-*, constants-*,
  state-*, utils-* (book, fetcher, slots, sound, event-emitter, xstate,
  layout), components-* (layout, pixi, shared, storybook, ui-pixi,
  ui-html), pixi-svelte։

## Իրադարձությունների հոսքը (կենտրոնական միտք)

[/docs/front-end/adding-new-events]

Մաթի book-ի `events`-ը (bookEvent) ֆրոնտում անցնում ա էս շղթայով.

1. `typesBookEvent.ts` — bookEvent-ի TS տիպը (union)
2. `bookEventHandlerMap.ts` — bookEvent → handler
3. handler-ը emit ա անում **emitterEvent-ներ** (`typesEmitterEvent.ts`,
   `eventEmitter.ts`)
4. Կոմպոնենտը (`components/*.svelte`) subscribeOnMount-ով բռնում ա
   emitterEvent-ները ու նկարում/անիմացնում (Spine)

Ամեն նոր bookEvent թեստավորվում ա Storybook-ում երկու մակարդակով.
`MODE_X/bookEvent/<type>` (առանձին) ու `MODE_X/book/random` (ամբողջ
book-ի հոսքում)։ Storybook-ի data ֆայլերը (books/events) մաթ փաթեթից
copy/paste են արվում — RGS-ի սիմուլյացիա են։

## Context-ները ու bet state machine-ը

[/docs/front-end/context]

- setContext()-ը entry-ում դնում ա 4 context. **EventEmitter**,
  **Layout** (canvasSizes, layoutType — resizeTo: window, mobile/desktop
  ադապտացիա), **Xstate**, **App** (PIXI.Application, loadedAssets)։
- **xstate gameActor** state-երը. rendering, idle, bet, autoBet,
  **resumeBet** (ընդհատված բեթի շարունակում), forceResult։ UI-ն
  կախված ա state-ից (օր. bet կոճակը disabled երբ isPlaying)։

## Հետևանքներ Run Dady-ի համար

- D-001-ը (Pixi.js 2.5D) պաշտոնական stack-ի հետ նստում ա — Pixi-ն հենց
  հիմքն ա, բայց փաթեթավորումը Svelte/pixi-svelte-ով ա։ Որոշելու հարց՝
  վերցնում ենք web-sdk-ն որպես հիմք (խորհուրդ ա տրվում sample-ից սկսել),
  թե՞ մերը 0-ից Web SDK-ի ձևաչափերով։ → dev քննարկում, D-00X։
- resumeBet-ը SDK-ում արդեն կա — ընդհատված ռաունդի պահանջի հետ կապվում ա։
- `apps/price` sample-ի բնույթը ստուգելու արժե — անունից slot չի երևում,
  կարող ա ոչ-ռելսային մեխանիկայի օրինակ լինի (ՉՍՏՈՒԳՎԱԾ ենթադրություն,
  ստուգել repo-ում)։
