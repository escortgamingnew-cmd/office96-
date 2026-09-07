# pixi-feel — pseudo-3D իլյուզիայի փորձանմուշ

T-0003-ի «իլյուզիայի ապացույցի» spike. ստուգում ա, որ Three.js պրոտոյի
(v16_14) 3D զգացողությունը ստացվում ա մաքուր Pixi.js 2.5D-ով [D-001]՝
առանց մոբայլը տաքացնող bloom/PBR/լույսերի։ Խաղային լոգիկա ու RGS կապ
ՉԿԱ — սա միայն զգացողության փորձ ա։

## Աշխատացնելը

Build step չկա։ Պետք ա միայն static server (ES module/fetch-ի համար՝
file://-ով չի աշխատի spritesheet-ի պատճառով).

```
cd prototype/pixi-feel
py -m http.server 7788        # կամ python3 -m http.server 7788
# բացի http://127.0.0.1:7788
```

Pixi.js v8.16.0-ը քաշվում ա cdnjs-ից (pinned) — ինտերնետ ա պետք առաջին
բացելուն։

## Կառավարում

- **Պահել (մկնիկ/touch/Space)** — արագանում ա, բաց թողնելը՝ դանդաղում
- **F կամ ƒ կոճակը (վերևի ձախ)** — FPS counter
- Մուլտիպլիկատորը վերևում՝ `1 + dist × 0.05` (պրոտոյի բանաձևի ոգով)

## Ինչից ա սարքած իլյուզիան

- **Պրոյեկցիա.** `p = (zNear/z)^fovExp`, y = horizon + (bottom−horizon)·p,
  scale ∝ p։ `fovExp`-ը արագության հետ իջնում ա 1→0.84 — «FOV-ը լայնանում
  ա» զգացողություն, ճամփի լայնությունն էլ ա speed-ից թեթև աճում։
- **Ճամփա.** Մեկ Graphics, ամեն կադր. ասֆալտի trapezoid, z-space-ում
  հոսող բանդեր + կենտրոնի դեղին dash-եր, ուղիղ եզրագծեր ու պղնձե curb։
- **Կողքի օբյեկտներ.** 30 sprite-անոց pool (շենքեր + լապտերներ), canvas-ով
  նկարած texture-ներ (baked glow, ոչ մի runtime filter)։ Ծնվում են
  հորիզոնում, alpha fade-ով ու մթնոլորտային tint-ով (հեռուն մուգ) մոտենում,
  անցնում կադրից դուրս, վերադառնում pool։
- **Ֆոն.** Երկնքի գրադիենտ + աստղեր (canvas), հեռու քաղաքի TilingSprite
  ուրվագիծ՝ դանդաղ դրեյֆով, հորիզոնի պղնձե glow ու մշուշի շերտ (ծնվելը
  քողարկում ա)։
- **Հերոս.** `assets/papi-run-20f.webp` spritesheet (4×5, 20 կադր,
  500×500) → AnimatedSprite։ Idle՝ «շնչող» առաջին կադր, վազք՝ fps-ը
  speed-ին կապած + bob/sway/rotation, blob ստվեր (canvas)։
- **Կամերա.** Բարձր արագության թեթև shake՝ root container-ի offset-ով։

## Մոբայլ բյուջեն

- `devicePixelRatio` cap ≤ 2, antialias off
- 0 filter, 0 blur — բոլոր glow-երը canvas-ում baked են
- Մեկ Graphics rebuild/կադր (~30 quad), ~35 sprite, object pooling
- `dt` clamp 0.05s — background tab-ից արթնանալիս թռիչք չկա

## Debug

`window.__feel` — `state()`, `force(speed, dist?)`, `release()`՝
կոնսոլից վիճակը ստուգելու/բռնելու համար։

## Ասեթ

`assets/papi-run-20f.webp`-ը կոպի ա `docs/reference/assets/`-ից (մեր
օրիգինալ ասեթը, պրոտոյից հանած)։ Ուրիշ ոչ մի արտաքին asset չկա։
