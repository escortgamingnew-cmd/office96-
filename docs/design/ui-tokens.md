# Run Dady — UI token-ներ (մեկ ճշմարտություն կոդի ու Figma-ի համար)

Աղբյուրը ԿՈԴՆ ա. `prototype/pixi-feel/index.html` (:root) ու
`prototype/pixi-feel/src/tex.js` (COL_PROTO/COL_NIGHT)։ Figma-ի
variables-ը սրանից են գեներացված (ֆայլ՝ «Run Dady UI», 2026-09-12)՝
https://www.figma.com/design/JTDf8M2yHwzitpAAPzXnca
4 collection (Primitives 18, World 16, UI 23, Layout 7) + 6 text style +
Foundations էջ։ Նշում. Starter plan-ը 1 մոդ ա թողնում, դրա համար deep
night-ը `world-night/*` խումբ ա, ոչ մոդ. alpha ունեցող semantic-ները
(glow/panel/pill/border/secondary) raw RGBA են, ոչ alias։
Փոխում ես կոդում → թարմացնում ենք էստեղ ու Figma-ում. ոչ հակառակը,
քանի դեռ D-002-ով այլ բան չենք որոշել։

## Primitives (հում արժեքներ)

| Token | Արժեք | Աղբյուր |
|---|---|---|
| green/500 | #2EC27E | --ui-betc (bet/run կոճակ) |
| green/600 | #24A869 | --ui-betc-dn (սեղմած) |
| green/300 | #3DDC91 | won gradient վերև, win pill |
| green/700 | #22B573 | won gradient ներքև |
| amber/300 | #FFC94D | --ui-coc1 (cashout վերև) |
| amber/500 | #F6A821 | --ui-coc2 (cashout ներքև) |
| amber/200 | #FFD27A | brand accent, լապտեր, Feel Lab |
| amber/900 | #3A2600 | տեքստ սաթեի վրա |
| red/400 | #FF6B6B | loss pill |
| red/450 | #FF5D5D | CAUGHT պիտակ |
| red/500 | #FF4D4D | crashed մուլտի |
| navy/550 | #3C4966 | chip gradient վերև |
| navy/600 | #33405E | bet-row gradient վերև |
| navy/650 | #2C374F | chip gradient ներքև |
| navy/700 | #242F49 | bet-row gradient ներքև |
| night/800 | #0E131B | պանելների հիմք (op .7–.94) |
| night/900 | #0A0E14 | pill-երի հիմք (op .55) |
| white | #FFFFFF | կոճակի տեքստ, մուլտի |

## World (խաղի աշխարհ, v16_14 proto → deep night)

| Token | Proto | Deep night (skyDark=1) |
|---|---|---|
| world/sky-top | #16418F | #050F2E |
| world/sky-mid | #2A68B8 | #0F2C66 |
| world/sky-horizon | #6D97D3 | #35538F |
| world/fog | #B6BFDA | #5C6890 |
| world/asphalt | #8E93B6 | #4F5476 |
| world/sidewalk | #DEDDE8 | #9A99B0 |
| world/lane | #DCDDE8 | #B9BACB |
| world/lamp | #FFD27A | — (չի մթնում) |
| world/neon | #FF2BD6 | — |

Ընթացիկ feel-ը (հիմնադրի JSON, 2026-09-11)՝ skyDark 0.75, fogHue −0.8 —
այսինքն live գույները proto↔night խառնուրդ են. Figma-ում երկուսն էլ կան
որպես մոդ (Proto / Deep night)։

## Semantic (ինչի ՀԱՄԱՐ ա գույնը)

| Token | → Primitive | CSS var |
|---|---|---|
| action/bet | green/500 | --ui-betc |
| action/bet-pressed | green/600 | --ui-betc-dn |
| action/bet-glow | green/500 @35% | --ui-betc-glow |
| action/cashout-top | amber/300 | --ui-coc1 |
| action/cashout-bottom | amber/500 | --ui-coc2 |
| action/on-cashout | amber/900 | — |
| action/won-top | green/300 | — |
| action/won-bottom | green/700 | — |
| state/win | green/300 | — |
| state/loss | red/400 | — |
| state/crash | red/500 | — |
| text/primary | white | --ui-btnt |
| text/secondary | white @50% | — |
| surface/panel | night/800 @92% | — |
| surface/pill | night/900 @55% | — |
| surface/chip-top | navy/550 | — |
| surface/chip-bottom | navy/650 | — |
| surface/betrow-top | navy/600 | — |
| surface/betrow-bottom | navy/700 | — |
| border/subtle | white @12% | — |
| brand/accent | amber/200 | — |

### v1.1 — կոմպոնենտային token-ներ (T-0012, Արեգ, 2026-09-12)

| Token | → Primitive | Ինչու |
|---|---|---|
| action/on-bet | night/900 | Bet կոճակի տեքստ. սպիտակը green/500-ի վրա 2.3:1 էր, մուգը՝ 8.4:1 (pressed՝ 6.3:1)։ Այլընտրանք՝ green/900 (5.2:1 / 3.95:1) — հիմնադրի որոշումն ա |
| action/cashout-pressed-top/-bottom | amber/400 / amber/600 | Cashout սեղմած |
| action/ghost | green/500 @8% | «Keep Running» — index.html `.lost #hold` |
| action/ghost-pressed | green/500 @16% | — |
| action/ghost-border | green/500 | — |
| action/on-ghost | green/300 | — |
| text/placeholder | white @35% | Input դատարկ |
| icon/primary, icon/secondary | white, white @50% | Icon set stroke |
| surface/input | navy/700 | Input դաշտի ֆոն |
| border/focus | amber/200 | Input focus (2px) |
| border/error | red/400 | Input error (2px) |
| opacity/disabled | 0.4 | Disabled՝ ամբողջ կոճակի opacity |
| pad/input-y, pad/input-x | space/12, space/16 | — |
| gap/icon | space/8 | icon↔label |
| size/icon | space/24 | icon grid |
| size/touch | space/48 | Touch target ≥44 — մոբայլ առաջինը |
| stroke/hairline, stroke/control | space/1, space/2 | border-ներ |

**font/\<style\>/\*** — text style-երի semantic շերտը. ամեն style ՄԻԱՅՆ
`font/<style>/{family,size,weight,tracking,lh}`-ից ա սնվում, դրանք էլ՝ Type
primitives-ից (family/size/weight/tracking/lh)։ Primitive-ից ուղիղ ոչ մի style
չի սնվում (հիմնադրի կանոնը, 09-12)։ Line-height սանդղակ՝ lh/tight 100%,
lh/snug 120%, lh/base 140% (CSS-ում unitless 1 / 1.2 / 1.4)։

**Figma-ն ինչպես ա ստանում.** `tools/design/figma-kit/` plugin-ը (գեներացվում ա
gen-tokens.mjs-ից) — README-ն էնտեղ։ MCP-ի Starter quota-ից անկախ ա։

## Չափեր

radius/control = 12 (--ui-rad), radius/chip = 16, radius/pill = 999.
space/xs 6, space/sm 8, space/md 10, space/lg 16.

## Տառատեսակ

Կոդում՝ `ui-monospace, Menlo, monospace` (համակարգային մոնո)։
Figma-ում ներկայացուցիչը՝ **Roboto Mono** (ամենամոտ լայն հասանելին)։

| Style | Չափ/քաշ | Letter-spacing | Line-height | Օգտագործում |
|---|---|---|---|---|
| Display/Multiplier | 56 Bold | −2 | 100% | 1.00x ցուցիչը |
| Amount | 20 Bold | .5 | 120% | bet գումարը |
| Button/Large | 16 SemiBold | .5 | 120% | Run! Daddy |
| Button/Base | 14 SemiBold | .5 | 120% | Place Bet, cashout |
| Pill | 12 Bold | .2 | 120% | պատմության pill-եր |
| Label/Caps | 12 Regular | 2 | 140% | state (UPPERCASE) |
