# T-0002 — Մաթ մոդելի առաջարկ

- **Author.** Aram (founder)
- **Assignee.** Անանիա (math)
- **Opened.** 2026-09-07
- **Priority.** P0

## Ինչ ա պետք
Ուսումնասիրել ու ՓԱՍՏԱՐԿՎԱԾ առաջարկ բերել՝ (1) RTP թիրախ, (2) max win cap,
(3) «continue or cash out» մեխանիկան books մոդելի վրա ոնց ա նստում
(մեկ book մի ռաունդի՞ն, թե՞ ամեն continue-ն նոր քաշում ա), (4) մուլտի
կորի ձևը, որ խաղը «Run! Daddy» զգացողությունը պահի։
Առաջարկը գրվում ա որպես doc + ներկայացվում product չաթում։
«Արված» = հիմնադիրը վավերացրել ա decisions.md-ում։

## Կոնտեքստ
Կախված ա T-0001-ից (գոնե Math SDK ու books մասերից)։
Look & feel ռեֆերենսը՝ docs/reference/։

## Log
- [2026-09-07] Aram. բացվեց, հաստատված ա հիմնադրի կողմից։
- [2026-09-07] Անանիա. վերցրի (approved → doing)։
- [2026-09-07] Սևակ. D-003-ը վավերացված ա. մոդելը՝ նախաորոշված արդյունք + pre-bet BetMode-եր, mid-round cashout չկա։ Սահմանները՝ docs/stake-engine/approval-guidelines.md։
- [2026-09-07] Անանիա. Մոդելի առաջին նախագիծը գրված ա՝ docs/math/model-draft-v0.md. (1) ձևակերպում — արդյունքը քաշվում ա մուլտիպլիկատորների grid-ից, վազքի երկարությունը ածանցյալ ա (d=(m−1)/r), կորուստի catch-distance-ը presentation-only; (2) book event-երի առաջարկ (runStart/runProgress/nearMiss/escape/catch/finalWin); (3) BetMode-ի A/B/C տարբերակներ, նախընտրածս՝ B (base 1.0× + long_run); (4) distribution ընտանիք՝ dead ատոմ + էքսպոնենտ մարմին + Pareto պոչ + wincap ատոմ, RTP/hit/std dev փակ բանաձևերով; (5) ստուգացանկ ու «որոշվելիք» պարամետրերի աղյուսակ՝ առանց ֆիքսած թվերի; (6) 7 բաց հարց հիմնադրին/թիմին։ Հաջորդը՝ հիմնադրի պատասխաններ + Python նախատիպ v1-ի համար։
