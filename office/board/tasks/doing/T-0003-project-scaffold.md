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
- [2026-09-09] Տիգրան. հիմնադրի պատվերով pixi-feel-ը spike-ից դարձավ պրոտոյի (v16_14) խաղային ներկայացման պարիտետ — կոդը 0-ից, մոդուլներով (`prototype/pixi-feel/src/`)։ Պրոտոյի թվերը 1:1 իրական միավորներով (մետր/վրկ/°). կամերա (0,4.5,14) FOV 55→69, TARGET 22 էքսպոնենտ dt×4, հոսքը ոտքերից (38fps × 8.5մ/ցիկլ ≈ 16.15 մ/վ), MULT 0.05/մ, shake 18Hz, ROAD_W 10/մայթ 3/լապտեր 14/SEG 16, fog 70-210 / 40-120 mobile։ Աշխարհ. canvas ֆասադներ (front sprite + կողային/տանիքի PerspectiveMesh, near-clip ամեն տողին), լապտեր, կայանած մեքենաներ (tint placeholder), ծառ/թուփ, billboard, հյուրանոց, 3D աստղեր։ UI. պրոտոյի betmorph/CASH OUT/WON/pills/մոդալ DOM-ով պորտ։ Ռաունդ. SANDBOX fake-book bet-ի պահին (D-003), catch ռեժիսուրա, rewind (դրոն-կամար, cashout՝ վազածի չափ)։ Փորձարկված desktop + 375×812, `__feel.step()` դետերմինիստիկ քայլով (պանելի rAF-ը throttle ա), console մաքուր։ `serve.py` ավելացվեց (Windows http.server-ը .js-ը text/plain ա տալիս)։ Մանրամասները՝ README + dev.md։ Թասկը doing-ում ա մնում. սկելետի SDK մասը դեռ D-005-ին ա սպասում։
