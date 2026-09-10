# T-0007 — Asset Lab. շենքի ասեթի live փոխարինում pixi-feel-ում

- **Author.** Aram (founder), ձևակերպումը՝ Սևակ (lead)
- **Assignee.** Տիգրան
- **Opened.** 2026-09-10
- **Priority.** P1 — հիմնադիրը հենց հիմա ա ասեթներ սարքում, գործիքը իրա հոսքն ա արագացնում

## Ինչ ա պետք

Հիմնադիրը դիզայն-ասեթներ ա հավաքում (T-0006) ու ուզում ա իրենց խաղի մեջ
տեսնել՝ առանց build/կոդ։ pixi-feel-ում (DEV գործիք, Feel Lab-ի պես —
Stake build-ի մաս ՉԻ) ավելացնել.

1. **Drag & drop.** Նկար-ֆայլը (PNG/WebP/JPG) բրաուզերի պատուհանի վրա
   քաշելիս՝ ընտրված շենքի ֆասադի տեքստուրան փոխարինվում ա էդ նկարով,
   առանց reload-ի։ Ստուգելի. քաշեցիր → շենքը նոր տեքստուրայով ա,
   վազքը չի ընդհատվում։
2. **Tap → ընտրել/պտտել.** Շենքի վրա click/tap՝ ընտրում ա այն (թեթև
   highlight), կրկնակի tap՝ պտտում ա 10 վարիանտի մեջ։ Ստուգելի.
   ամեն tap-ին ասեթը փոխվում ա, highlight-ը երևում ա։
3. Փոխարինումը կիրառվում ա էդ շենքի front-ին. side-ի համար երկրորդ
   drop (կամ UI-ում front/side ընտրիչ) — Տիգրանի հայեցողությամբ,
   Ինչ ա պետք-ի միջուկը front-ն ա։
4. Մոբայլում drag&drop չկա — բավական ա tap-ցիկլը աշխատի, drop-ը
   desktop-only ա։
5. Օնլայն bundle-ները (build-artifact*.ps1) փոփոխությունից հետո
   վերահավաքվում են ու աշխատում — artifact-ում էլ ա գործում
   (file input fallback drop-ի տեղը, եթե iframe-ը drop չի թողնում)։

## Կոնտեքստ

- Հիմնադրի խնդրանքը՝ 2026-09-10, Claude Code պատուհանով. «ես շենքը
  քաշեմ՝ ինքը ավտոմատ փոխի ասեթը»։
- prototype/pixi-feel/src/world.js — buildings[].front sprite,
  makeBuildingVariant (10 վարիանտ)։ tex.js-ի facadeCanvas-ը հիմա
  canvas ա գեներացնում. drop-ի դեպքում PIXI.Texture.from(img)։
- Feel Lab-ի օրինաչափությունը՝ DEV գործիք, Stake build-ում հանվում ա։
- asset-spec-ի չափերը՝ docs/design/asset-spec.md — drop արած նկարի
  aspect-ը կարա չհամընկնի շենքի w/h-ին. v1-ում ուղղակի ձգել,
  նախազգուշացում console-ում։

## Log

- [2026-09-10] Սևակ. բացվեց հիմնադրի խնդրանքով, approved՝ հիմնադրի
  թասկ ա (D-002 կանոն)։ Տիգրանի հաջորդ արթնացմանն ա սպասում —
  wake-preference-ը հարգում ենք, հիմնադիրը շտապ չի ասել։
- [2026-09-10] Տիգրան. արված, review։ Tap → ընտրել (tint highlight, toolbar
  վերև-աջ), tap ընտրվածին → հաջորդ վարիանտ, tap դատարկ → հանել։ Drop (նաև
  ուղիղ շենքի վրա) → front/side texture live, PIXI.Texture.from(img)։ Load
  կոճակ (file input) մոբայլ/iframe-ի համար։ Ընտրությունը buildings[i]
  օբյեկտին ա. hit-test՝ front rect + side quad, roll-ը հաշված, միայն tap-ի
  պահին։ Aspect-ը չի բռնում → ձգվում ա + console warn (v1)։ Ստուգված
  desktop + 375×812 (Android UA), console մաքուր, budget անփոփոխ (122 obj,
  0 filter)։ Կոդը feellab.js/world.js/main.js/index.html — նոր մոդուլ չկա,
  bundle script-ը փոփոխություն չի պահանջում (կետ 5-ը Սևակի rebuild-ն ա)։
