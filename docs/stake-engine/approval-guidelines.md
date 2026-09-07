# Approval Guidelines — ստուգված փաստեր

Ստուգված՝ 2026-09-07, Սևակ։ Աղբյուրները՝ /docs/approval-guidelines,
/docs/approval-guidelines/math-verification, /submission-checklist,
/game-replay-requirements (բոլորը ուղիղ կարդացած)։ Մի մասը (նոր թիմի
ամբողջական checklist-ը) login-ի հետևում ա — կկարդանք ACP account
ունենալուց հետո։

## ԿԱՐՄԻՐ ԳԻԾԸ — stateless կանոնը (բառացի)

«Engine games are strictly stateless: Each bet must be independent of
previous outcomes. Games cannot include jackpots, gamble features,
**continuation, or early cashout options**.» [/docs/approval-guidelines]

Հետևանքը Run Dady-ի համար. mid-round դրամական «continue or cash out»
որոշումը, որ փոխում ա settlement-ը, ՉԻ ԹՈՒՅԼԱՏՐՎՈՒՄ։ Crash/Burst
ՆԵՐԿԱՅԱՑՈՒՄԸ թույլատրված ա (Stake-ում live են Engine Burst խաղեր՝
Angry Balls, Penguins Can Fly)։ Խաղի արդյունքը մեկ /play-ով
նախաորոշված ա, ֆրոնտը դա «նվագարկում» ա։

## Մյուս սահմանափակումները [/docs/approval-guidelines]

- Անուններ/ասեթներ՝ IP/copyright մաքուր; Stake™ բրենդինգ՝ արգելված։
- Միայն օրիգինալ դիզայն. այլ կայքերում եղած pre-purchased/licensed
  խաղեր չեն անցնում։
- Վիրավորական/անորակ/մանկական տեսք — մերժում. reviewer-ի հայեցողություն։
- stake.us-ի համար ավտոմատ դիտարկվում ա՝ social language պահանջներով։
- **Post-release ոչինչ չի փոխվում** մաթում/mode-երում/մեխանիկայում —
  միայն մանր վիզուալ ֆիքսեր։ Մաթը օր 1-ից վերջնական ա։

## Math verification — պաշտոնական թվերը [/math-verification]

Critical (չանցար՝ submit չկա).
| Թեստ | Պահանջ |
|---|---|
| Base mode | 1.0× cost, ամենաէժանը |
| Base volatility | std dev ≥ 0.6 |
| RTP | ամեն mode՝ **90.0%–96.7%** |
| Cross-mode RTP | mode-երի տարբերությունը ≤ 0.5% |
| Max payout | ≤ **500,000×** |
| Max cost multiplier | ≤ 2,000× |
| Hit rate | ոչ զրո win ≥ 1/50 spin |

Նաև. max win-ը «իրատեսորեն հասանելի» (տիպիկ՝ >1/10,000,000),
slot-type՝ 100k–1M սիմուլյացիա, dead spin-երը չգերակշռեն (90k/100k
զրո = մերժման հիմք), win-սանդղակում դատարկ գոտիներ չլինեն։

Ֆայլային սահմաններ. մեկ events ֆայլ ≤ 4.2GB, մեկ mode ≤ 10M events։
RGS-ի բացարձակ սահմաններ. bet ≤ $500k, մեկ bet-ի payout ≤ $50M։

Non-critical թեստերը (CVaR, Expected Tail Liability, tail
probabilities, exposure) չեն արգելում submit-ը, բայց իջեցնում են
exposure/bet-cost cap-երը 2-star/3-star tier-երով (0–6 failure class,
penalty schedule) — ամբողջ աղյուսակները էջում են։

## Review-ի ընթացքը [/submission-checklist]

- 3 անկախ reviewer, 0–3 աստղ՝ design/gameplay/math compliance,
  գնահատականները թաքուն մինչև երեքն էլ տան։
- Միջին ≥1 աստղ → approved; <1 → rejected, feedback + resubmit։
- Կարա տևի մի քանի ժամ; անպատրաստ submit-ը՝ շաբաթներ, ու
  deprioritize ա լինում։

## Bet Replay — պարտադիր ա [/game-replay-requirements]

Առանց սրա նոր խաղ ՉԻ հաստատվում։ `replay=true` query param →
`GET {rgs_url}/bet/replay/{game}/{version}/{mode}/{event}` (session
ՊԵՏՔ ՉԻ, public ա) → {payoutMultiplier, costMultiplier, state}։
UX. auto-load → Play կոճակ → ամբողջ անիմացիան → Play Again; betting
UI-ն ամբողջությամբ անջատած, session call-եր չկան։ Review-ում պահանջում
են event ID-ներ՝ normal win / big win / max win / loss / bonus։
