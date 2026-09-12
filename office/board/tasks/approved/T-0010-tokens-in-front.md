# T-0010 — Token-ները ֆրոնտում. tokens.css-ի ներառում pixi-feel-ում

- **Author.** Aram (founder), ձևակերպումը՝ Սևակ (lead)
- **Assignee.** — (դատարկ մինչև doing)
- **Opened.** 2026-09-12
- **Priority.** P2 — շտապ չի, հիմնադիրը ասել ա «Տիգրանին շատ նեղություն չտանք». հերթական արթնացմանդ, ուրիշ գործի կողքով

## Ինչ ա պետք

1. docs/design/tokens.css-ի :root բլոկը (գեներացված՝ tools/design/
   gen-tokens.mjs) ներառել pixi-feel-ում. splice index.html-ի <style>-ի
   սկզբում կամ քո ընտրած ձևով — ՊԱՅՄԱՆԸ՝ bundle script-երը (build-
   artifact*.ps1) առանց փոփոխության շարունակեն աշխատել (նրանք <style>
   բլոկն են քաշում, <link> չեն տեսնի)։
2. Հին --ui-* անունները tokens.css-ում արդեն alias են → index.html-ի
   սեփական --ui-* սահմանումները հանել (կրկնություն չմնա)։ Վիզուալ
   փոփոխություն ԶՐՈ — before/after pixel-նույն։
3. Ընտրովի, եթե հեշտ ա. <style>-ի hardcoded կրկնվող արժեքները (chip/
   betrow գրադիենտներ, pill գույներ, 12px radius-ներ) փոխարինել
   var(--rd-*/--eg-*)-ով։ Ամբողջական refactor ՉԻ պահանջվում — միայն
   ակնհայտները։
4. Կանոնը կոդում կոմենտով. tokens.css-ը գեներացվում ա, ձեռքով չի
   խմբագրվում. գույն փոխելու տեղը tools/design/gen-tokens.mjs-ն ա
   (anchor-ները) → node run → commit։

## Կոնտեքստ

- Հիմնադրի պատվերը 2026-09-12. scalable token համակարգ, «ուրիշ խաղերի
  համար էլ 0-ից չհավաքենք»։ Ամբողջ շղթան՝ gen-tokens.mjs → tokens.json
  (մեքենայի ճշմարտություն) + tokens.css (ֆրոնտ) + Figma «Run Dady UI»
  (variables, նույն անուններով)։ Մարդու համար՝ docs/design/ui-tokens.md։
- Figma ֆայլը՝ https://www.figma.com/design/JTDf8M2yHwzitpAAPzXnca

## Log

- [2026-09-12] Սևակ. բացվեց, approved (հիմնադրի թասկ, D-002)։ P2 —
  հիմնադրի ցուցումով Տիգրանին չենք արթնացնում սրա համար։
