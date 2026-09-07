# Math SDK — ստուգված փաստեր

Ստուգված՝ 2026-09-07, Սևակ։ Աղբյուրները՝ պաշտոնական դոկերի /docs/math
բաժինը (intro, setup, quick-start, math-file-format, high-level-structure,
game-format, betmode, distribution, optimization-algorithm)։ Repo՝
https://github.com/engineio/math-sdk

## Ինչ ա անում

Python փաթեթ ա, որ (1) սահմանում ա խաղի կանոնները, (2) սիմուլյացնում ա
բոլոր հնարավոր արդյունքները, (3) օպտիմիզացնում ա win distribution-ը դեպի
թիրախ RTP, (4) գեներացնում ա RGS-ին պետք եղած բոլոր ֆայլերը։
[/docs/math]

Պահանջներ. Python ≥3.12, PIP; Rust/Cargo՝ միայն optimization-ի համար։
Հարմար հրամաններ. `make setup`, `make run GAME=<game_id>`։ [/docs/math/setup]

## Հրապարակման 3 պարտադիր ֆայլը (խիստ ձևաչափ)

[/docs/math/math-file-format]

1. **index.json** — mode-երի ցանկ. ամեն mode՝ `name` (string),
   `cost` (float, օր. base=1.0, bonus=100.0), `events` (logic ֆայլի անուն՝
   `*.jsonl.zst`), `weights` (lookup CSV-ի անուն)։
2. **Lookup table (CSV)** — տող = `simulation number, round probability,
   payout multiplier`, բոլորը **uint64**։ 3-րդ սյան payoutMultiplier-ը
   պիտի ԽԻՍՏ համընկնի logic ֆայլի արժեքի հետ (hash-ով ստուգվում ա)։
3. **Game logic (books)** — jsonl, **zStandard (.zst)** սեղմած. ամեն տող
   մի սիմուլյացիա՝ պարտադիր `id` (int), `events` (list<dict>),
   `payoutMultiplier` (int)։

**payoutMultiplier-ի սանդղակը.** դոկի օրինակում `1150` = 11.5x՝ 1.0x
արժողությամբ ռաունդի համար — այսինքն fixed-point ×100։ [/docs/math/math-file-format]
(quick-start-ի օրինակում 10 = 10x ա երևում float ձևով մինչև հրապարակում —
books-ի ներսում սիմուլյացիայի փուլում float ա, publish ձևաչափում int×100.
ՊՐԾՆԵԼՈՒՑ ԱՌԱՋ վերջնական ճշտել example խաղի publish_files-ով։)

## Ռաունդի կյանքը (ստուգված մեխանիզմ)

[/docs/math, /docs/math/quick-start]

- Բոլոր արդյունքները ՆԱԽԱՊԵՍ գեներացվում են. RGS-ը ռաունդի պահին CSV-ից
  քաշին համամասնորեն ընտրում ա simulation id ու `/play`-ի պատասխանով
  վերադարձնում էդ սիմուլյացիայի `events` ցուցակը — ֆրոնտը դա ա նկարում։
- `events`-ը հաջորդական dict-եր են (`reveal`, `winInfo`, `setWin`,
  `setTotalWin`, `finalWin`, index-ներով)՝ ամբողջ ռաունդի «սցենարը»։
- Production-ի համար խորհուրդ՝ 100k+ սիմուլյացիա per mode։

## Կոդի կառուցվածքը

[/docs/math/high-level-structure, /game-format]

- Մուտքը `run.py`՝ GameConfig + GameState; `run_spin(sim)`-ը RNG-ն
  seed-ում ա սիմուլյացիայի համարով (վերարտադրելի ա)։
- Ժառանգում. `GameStateOverride` → `GameExecutables` → `GameCalculations`
  (game-ի ֆոլդերում)՝ core-ը src/-ում, խաղայինը games/<id>/-ում։
- GameConfig-ում՝ game_id, rtp, wincap, paytable, reels, bet_modes։
- **BetMode**՝ name, cost, rtp, max_win + դրոշներ.
  - `auto_close_disabled=False` (default)՝ RGS-ը bet-ը ինքն ա փակում.
    **True՝ բաց ռաունդը կարա վերսկսվի ընդհատումից հետո, փակելը ֆրոնտի
    պարտքն ա** — մեր continue մեխանիկայի համար կրիտիկական դրոշ։
  - `is_feature`, `is_buybonus`՝ ֆրոնտի վարքի հուշումներ։
- **Distribution**՝ criteria/quota/conditions (+ ընտրովի win_criteria).
  սիմուլյացիաներին նախապես բաշխվում են win-պայմաններ (wincap, 0-win,
  freegame…), spin-ը կրկնվում ա մինչև պայմանը բավարարվի (check_repeat)։
  [/docs/math/game-state-structure/setup/distribution]

## Optimization

[/docs/math/optimization-algorithm]

- Rust binary (cargo build --release)։ Լookup-ի քաշերն ա փոխում (սկզբում
  բոլորը 1), որ mode-ը հասնի թիրախ RTP-ին։
- Conditions-ում ամեն win-type-ի համար 3 փոփոխականից (RTP, միջին win,
  hit-rate) 2-ը պիտի տրվի; hit-rate-երի գումարը = 1, մեկը կարա x (ազատ)
  մնա։ Կարգը կարևոր ա. wincap-ը առաջինը (exclusive ID pools)։
- Output՝ `lookUpTable_<mode>_0.csv`։

## Բաց հարցեր Run Dady-ի համար (T-0002-ի կորիզ)

**ԹԱՐՄԱՑՈՒՄ 2026-09-07.** «continue or cash out»-ի հարցը ՓԱԿՎԵՑ
approval-guidelines-ով. mid-round դրամական cashout/continuation-ը
ԱՐԳԵԼՎԱԾ ա (տես approval-guidelines.md)։ Մնում ա (բ) ուղին՝ pre-bet
ընտրություններ տարբեր BetMode-երով, ու նախաորոշված արդյունքի crash
ներկայացում։ Ստորև գրվածը պահում եմ որպես պատմություն.

- Դոկը ամբողջովին slot-կենտրոն ա (reels, paytable, freespins)։ Crash/
  instant runner-ի համապատասխանեցումը ուղիղ նկարագրված ՉԻ — պիտի պարզվի
  example-games-ից ու web-sdk-ի storybook-ից։
- payoutMultiplier-ը per simulation ֆիքսված ա ու hash-ով ստուգվում ա →
  «continue or cash out»-ի ամեն տարբերակ պիտի նստի կա՛մ (ա) մեկ book-ի
  event-սցենարի վրա, որտեղ cash-out-ը ընդհատում ա ռաունդը (բայց այդ դեպքում
  վճարվող գումարի մեխանիզմը /end-round-ում պարզաբանման կարիք ունի), կա՛մ
  (բ) ամեն continue = նոր /play (նոր mode/cost)։ Սա հաջորդ ուսումնասիրության
  ու Անանիայի հետ քննարկման առարկա ա — ՈՉ ենթադրության։
