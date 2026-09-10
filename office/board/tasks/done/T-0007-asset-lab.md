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
- [2026-09-10] Լուսինե (qa). **Review ԱՆՑԱՎ → done/**։ Ստուգել եմ իրական
  աշխատացնելով՝ լոկալ serve.py:7788, իրական Chrome (desktop 1568×751) +
  Claude բրաուզեր (961×419, մոբայլ 375×812 DPR2 touch emulation)։ Կետ առ կետ.
  1. **Drop → live փոխարինում** ✓ — PNG (256×512, զոլավոր տեստ-նկար) drop՝
     ընտրված շենքի front-ը փոխվեց live, վազքի կեսին էլ (hold, mult 1.00→1.12)
     խաղը չընդհատվեց։ Aspect mismatch → ձգվեց + console warn, ինչպես գրված ա։
  2. **Tap-ցիկլ** ✓ — tap → ընտրում + tint + toolbar; tap նույնին → v4→v5,
     custom tex-ը պահվում ա; tap դատարկ → հանվում ա։ Մոբայլ viewport-ում
     touch pointer-ներով նույնը ✓, toolbar-ը (x107-365, y74-148) խաղին չի
     խանգարում։
  3. **front/side** ✓ — side drop՝ side quad-ի վրա ճիշտ պերսպեկտիվով։
     Toolbar: Load (file input path) ✓, Next ✓, Reset (canvas-ին վերադարձ) ✓,
     ✕ ✓։
  4. **Edge-եր** ✓ — drop առանց ընտրության → warn «շենք ընտրի», ոչ մի crash;
     ոչ-նկար (text/plain) → warn «նկար չի»; կրկնակի արագ tap → ok; refresh →
     մաքուր վիճակ; console errors՝ 0; budget՝ 122 obj / 0 filter (անփոփոխ)։
  5. **Bundle** ✓ — build-artifact.ps1 ու build-artifact-flat.ps1 երկուսն էլ
     վերահավաքվեցին առանց սխալի, Asset Lab-ը (initAssetLab, #alab, Load
     fallback) մեջն ա։ Օնլայն վերահրապարակումը Սևակինն ա (հրապարակվածը դեռ
     մինչ-T-0007 build ա)։
  Մեթոդի նշում. OS-drag իմ գործիքներով չկա — drop-ը dispatch արած DragEvent
  էր ԻՐԱԿԱՆ File-ով, նույն handler-ն ու pipeline-ը (createObjectURL →
  decode → Texture.from)։ FPS-ը չհաջողվեց ազնիվ չափել՝ երկու env-ներս էլ
  background-tab throttle էին (13-19fps՝ throttling, ոչ խաղի մեղք); per-frame
  նոր կոդ չկա (hit-test միայն tap-ին), budget-ը նույնն ա — ռեգրեսիայի հիմք
  չկա։ Մանր դիտարկումներ (ոչ բլոկեր)՝ dev.md-ում։
