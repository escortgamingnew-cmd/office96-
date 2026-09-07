# Ստուգման նոթեր — 2026-09-07 երկու PDF-ների վրա (Սևակ)

Raw ֆայլերը. `2026-09-07-chatgpt-deep-research-stake-engine.pdf` ու
`2026-09-07-community-x-reddit-stake-engine.pdf`։ Ստորև՝ ինչն եմ ՍՏՈՒԳԵԼ
պաշտոնական աղբյուրի դեմ, ինչը մնում ա հետք։

## ՀԱՍՏԱՏՎԱԾ (իմ ընթերցմամբ, պաշտոնական էջերից)

- **Stateless/early-cashout արգելքը** — բառացի կա /docs/approval-guidelines-ում։
  Երկու PDF-ների կենտրոնական պնդումը ճիշտ ա։ → docs/stake-engine/approval-guidelines.md
- **RTP 90.0–96.7%** — պաշտոնական math-verification էջում։ Ուշադրություն.
  ChatGPT PDF-ը գրում էր «RTP range = GAP, 97%-ը օրինակ ա», community-ն՝
  «90–98 + 96.7 ceiling որպես լուր»։ Իրական էջը ՀԵՆՑ 96.70% ա տալիս որպես
  վերին սահման — community-ի «լուրը» պաշտոնականացված ա, ChatGPT-ի «GAP»-ը՝ հնացած։
- Cross-mode ≤0.5%, max payout ≤500,000×, cost multiplier ≤2,000×,
  base std dev ≥0.6, hit ≥1/50, events ≤4.2GB, ≤10M events/mode,
  bet ≤$500k, payout ≤$50M — բոլորը math-verification էջում։
- Post-release math/mechanics freeze — /approval-guidelines։
- 3 reviewer / 0–3 աստղ / միջին ≥1 → approved — /submission-checklist։
- Bet Replay պարտադիր, endpoint-ը՝ GET /bet/replay/... առանց session —
  /game-replay-requirements։
- GitHub org. **engineio**-ն ա canonical-ը (github.com/StakeEngine/math-sdk-ն
  նույն repo-ին ա տանում — rebrand)։ MIT license, Python ≥3.12 — ստուգված։

## ՉՍՏՈՒԳՎԱԾ — մնում են հետք (questions.md-ում են)

- 10% GGR-ի պայմանագրային մանրամասները. negative GGR/clawback, «7.5%
  guaranteed» տարբերակ (միայն LTC Casino երկրորդ ձեռք), deductions։
- Exclusivity Medium Rare N.V.-ին, multi-casino «coming» — երկրորդ ձեռք։
- Quality Rankings vs Submission Checklist «1 աստղ»-ի հակասությունը —
  submission-checklist-ի կողմն եմ ստուգել; quality-rankings էջը դեռ չեմ կարդացել։
- ACP onboarding/KYC հոսքը, idempotency/retry semantics — login-gated/չկա public։
- Angry Balls / Penguins Can Fly օրինակների «Burst» պիտակավորումը Stake-ի
  կատալոգում — չեմ ստուգել (stake.com-ի էջեր են, ոչ stake-engine.com)։
  Հավանական ա, բայց մեջբերելուց առաջ ստուգել։
- Community PDF-ի GitHub issue-ները (#105 state leak, #99 JSONL pretty-print,
  optimizer crash) — repo-ի issues-ում դեռ չեմ ստուգել. մինչև ստուգելը՝
  որպես զգուշացում ենք պահում (sample-ները production-safe չհամարել)։

## ՀԵՐՔՎԱԾ

- ChatGPT PDF. «RTP band-ը public docs-ում չկա (GAP)» — ՀԵՐՔՎԱԾ 2026-09-07.
  math-verification էջը հստակ 90.0–96.70% ա տալիս + ամբողջ critical/non-critical
  թեստերի աղյուսակներ։ (Հնարավոր ա էջը թարմացվել ա PDF-ից հետո։)
