# RGS API — ստուգված փաստեր

Ստուգված՝ 2026-09-07, Սևակ։ Աղբյուրները՝ /docs/rgs, /docs/rgs/wallet։
NPM client՝ https://github.com/engineio/ts-client («Engine client»)։

## Հոսքը

[/docs/rgs, /docs/rgs/wallet]

1. Խաղը բացվում ա CDN URL-ով.
   `https://<TeamName>.cdn.stake-engine.com/<GameID>/<GameVersion>/index.html`
   query-ով՝ `sessionID`, `lang` (ISO 639-1, ~18 լեզու), `device`
   (mobile/desktop), `rgs_url` (ՉԻ hardcode-վում)։
2. Առաջինը ՄԻՇՏ `POST /wallet/authenticate` {sessionID} — առանց սրա
   մնացած բոլորը 400 ERR_IS են։ Պատասխանում՝ balance, config (minBet,
   maxBet, stepBet, defaultBetLevel, betLevels, jurisdiction դրոշներ) ու
   **round** — ակտիվ կամ վերջին ռաունդը. **ակտիվ ա՝ ֆրոնտը ՊԱՐՏԱՎՈՐ ա
   շարունակի էդ ռաունդը** (resume)։
3. `POST /wallet/play` {amount, sessionID, mode} — debit + ռաունդի
   սցենարը (round)։ Debit = base bet × mode-ի cost multiplier։
4. `POST /bet/event` {sessionID, event} — ռաունդի ընթացքի «էջանիշը».
   ընդհատվելուց հետո authenticate-ի round.event-ով գիտես որտեղից
   շարունակել։
5. `POST /wallet/end-round` {sessionID} — փակում ա ռաունդը, վճարում ա
   payout-ը։ Երկար ռաունդներում սա ձեռքով ա արվում (տես Math SDK-ի
   auto_close_disabled-ը)։
6. `POST /wallet/balance` {sessionID} — ընթացիկ բալանս։

## Փողի ձևաչափը

Ամբողջ թիվ՝ 6 տասնորդական ճշտությամբ. 1,000,000 = 1.0 (օր. $1 bet =
"1000000")։ Արժույթը միայն ցուցադրման շերտն ա, gameplay-ի վրա չի ազդում։
~50 արժույթ, ներառյալ social՝ XGC/XSC/XEC (jurisdiction.socialCasino)։

## Bet-երի կանոններ

- bet ∈ [minBet, maxBet], բաժանվում ա stepBet-ի վրա; betLevels-ը
  ուղեցույց ա։
- Նոր խաղերից ակնկալվում ա մանր բեթեր՝ $0.01, $0.02, $0.05, $0.10…
  Min win <0.1x → ցուցադրման 4 նիշ ճշտություն, ≥0.1x → 3 նիշ
  (երբ bet-ը <$0.10)։ Բալանսը 2 նիշից ավել ցույց տալ պետք չի։

## Սխալների կոդերը

400՝ ERR_VAL (վատ request), ERR_IPB (բալանս չի հերիքում), ERR_IS (վատ
session), ERR_ATE (auth/token), ERR_GLE (gambling limits), ERR_LOC
(location)։ 500՝ ERR_GEN, ERR_MAINTENANCE։

## Հետևանքներ Run Dady-ի համար

- Ընդհատված ռաունդի վերականգնումը ՊԱՇՏՈՆԱՊԵՍ ապահովված ա
  (authenticate→round + /bet/event)։ QA-ի «ընդհատված ռաունդ» սցենարը
  ուղիղ սրանով ա ստուգվելու։
- Մեկ ռաունդ = մեկ debit (/play) ու մեկ credit (/end-round)։ Continue
  մեխանիկան եթե նոր debit ա պահանջում՝ նոր /play ա (ուրիշ mode?), եթե
  ոչ՝ նույն ռաունդի event-սցենարի ներսում ա. մաթ կողմը՝ math-sdk.md-ի
  «Բաց հարցեր»։
