# T-0012 — Figma v2. variable-ների ստուգում + կոմպոնենտ կիթ (Button/Input/Icons)

- **Author.** Aram (founder), ձևակերպումը՝ Սևակ (lead)
- **Assignee.** Արեգ (designer)
- **Opened.** 2026-09-12
- **Priority.** P1 — հիմնադիրը հենց հիմա Figma-ում ա աշխատում, սա իրա ուղիղ պատվերն ա

## Ինչ ա պետք

Հիմնադրի ուղղությունը (product.md, 2026-09-12 14:08), իրա բառերով.
primitive գրուպ՝ որից ոչ մի էլեմենտ ՉԻ սնվում, semantic՝ որից սնվում
են ԲՈԼՈՐ style-երը. ֆոնտները variable. հետո կոմպոնենտներ՝ button-ներ,
input-ներ, icon set։

1. **Variables-ի աուդիտ ու ամրացում** «Run Dady UI» ֆայլում
   (JTDf8M2yHwzitpAAPzXnca). primitives-ը միայն hidden/reference դեր
   (scopes՝ []), semantic-ը՝ միակ սպառվող շերտը. text style-երը
   կապել Type variable-ներին (family/size/weight/tracking), ոչ hardcode։
2. **Button կոմպոնենտ** variant-ներով. Bet (կանաչ) / Cashout (սաթե
   gradient) / Ghost (Keep Running) × states (default/pressed/disabled),
   բոլոր fill/radius/padding/text՝ variable-կապած։ Կոնտրաստի հարցդ
   (action/on-bet) լուծի հենց էստեղ՝ քո առաջարկով։
3. **Input կոմպոնենտ** (bet amount դաշտի ոգով)՝ default/focus/error
   state-երով, variable-կապած։
4. **Icon set v1** — խաղի UI-ի իրական կարիքից (+/−, ✕, ⚙, ▾, replay ▶,
   history)՝ մեկ չափի grid-ով, INSTANCE_SWAP-ի համար պատրաստ։
5. Foundations էջին՝ կոմպոնենտների documentation բաժին. before/after
   screenshot-ները՝ թասկի Log-ում։

Կանոններ. figma-generate-library + figma-use skill-երի կարգով
(variables → components, մեկ-մեկ, validate ամեն քայլից հետո)։ Կոդի
tokens-ի հետ սինքը (gen-tokens.mjs) մնում ա մեկ ճշմարտություն —
Figma-ում նոր token ես մտցնում՝ գեներատորին էլ ես ավելացնում։

## Կոնտեքստ

- Հիմնադիրը ինքն էլ դիզայներ ա ու ֆայլում զուգահեռ աշխատում ա —
  համագործակցի, մի ջնջի իրա ձեռքով արածը. հարց լինի՝ product.md։
- Քո 09-12 գնահատականի 2-3 կետերը (product.md) հենց սա էին —
  հիմնադիրը փաստացի կանաչ լույս ա տվել։

## Log

- [2026-09-12] Սևակ. բացվեց հիմնադրի product-ի պատվերից, approved
  (հիմնադրի թասկ, D-002)։ Արեգը արթնացվում ա որպես design task routing
  (D-009) — սա D-010-ի «չաթի արթնացում» չի, գործի հանձնարարություն ա։
