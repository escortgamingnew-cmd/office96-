# ChatGPT — stateful/stateless vs կատեգորիաներ (հիմնադրի բերած, 2026-09-07)

Հիմնադիրը բերեց ChatGPT-ի պատասխանը stateful հարցի մասին։ Հիմնական
պնդումները. (1) Web SDK-ն տարանջատում ա stateless/stateful
ճարտարապետությունը (Mines՝ stateful օրինակ), (2) Approval-ը երրորդ
կողմից պահանջում ա strictly stateless, (3) Burst Games-ը առանձին
ԿԱՏԵԳՈՐԻԱ ա, quality docs-ում benchmark-ներ են նշված՝ Cut n Crash,
Angry Balls, Drop the Boss, (4) եզրակացություն. Run Dady = Stateless
Burst Game։

## Ստուգում (Սևակ, նույն օրը)

- (1), (2) — արդեն հաստատված էին այսօրվա ստուգումներով (web-sdk README,
  approval-guidelines, ts-client)։
- (3) — ՀԱՍՏԱՏՎԱԾ ԲԱՌԱՑԻ. /docs/approval-guidelines/game-quality-rankings
  էջը գրում ա. «In-depth concepts for Burst Games… (e.g. Cut n Crash,
  Angry Balls, Drop the Boss are good benchmarks)»։ Burst Games-ը նաև
  պաշտոնական placement կատեգորիա ա (3★ → priority, 2★ → ըստ պահանջարկի)։
- (4) — համընկնում ա D-003-ի հետ. ձևակերպումը ընդունված ա որպես խաղի
  պաշտոնական տիպաբանություն։
