# T-0003 — Պրոյեկտի սկելետ (Pixi.js + SDK-ներ)

- **Author.** Aram (founder)
- **Assignee.** Տիգրան (developer)
- **Opened.** 2026-09-07
- **Priority.** P1

## Ինչ ա պետք
Ռեպոյի սկելետ՝ Pixi.js фронтенд Stake Web SDK-ի կանոններով + Math SDK
Python պրոյեկտի կմախք, build/run README-ով։ Դեռ խաղային լոգիկա ՉԻ գրվում —
մենակ կմախք, որ T-0002-ի որոշումից հետո միանգամից աշխատանք սկսվի։
«Արված» = մաքուր clone-ից երկու կողմը build/run ա լինում README-ով։

## Կոնտեքստ
Կախված ա T-0001-ի Web SDK մասից։ D-001 (Pixi.js) decisions.md-ում։

## Log
- [2026-09-07] Aram. բացվեց, հաստատված ա հիմնադրի կողմից։
- [2026-09-07] Տիգրան. վերցրի (approved → doing)։ Բովանդակային աշխատանքը բլոկված ա T-0001-ի web-sdk մասով (docs/stake-engine/-ը դեռ դատարկ ա) — SDK-ի կառուցվածք չեմ հորինելու, սպասում եմ PM-ի web-sdk.md-ին։
- [2026-09-08] Տիգրան. հիմնադրի կանաչ լույսով սարքեցի «իլյուզիայի ապացույցի» spike-ը՝ `prototype/pixi-feel/` (Pixi v8.16.0 CDN, build step չկա)։ Pseudo-3D ճամփա + կողքի օբյեկտների pool + parallax ֆոն + papi AnimatedSprite + hold-to-run + մուլտիպլիկատոր + FPS counter։ Փորձարկած ա բրաուզերում desktop ու mobile (375×812) viewport-ներով — խորությունը կարդացվում ա, 0 filter, DPR cap 2։ Մանրամասները՝ prototype/pixi-feel/README.md։ Fork-vs-scratch առաջարկս գրեցի dev.md-ում (D-005 թեկնածու)։ Սկելետի բուն աշխատանքը (SDK ձևաչափերով repo կառուցվածք) մնում ա հաջորդ քայլը՝ D-005-ի որոշումից հետո։
