# Բաց հարցեր արտաքին research-ի համար

Այստեղ Սևակը գրում ա հարցերը, որոնք պաշտոնական աղբյուրով դեռ ո՛չ
հաստատվել են, ո՛չ հերքվել։ Հիմնադիրը տանում ա ChatGPT/Grok կամ Engine
support/Discord, պատասխանը բերում ա research-raw՝ որպես նոր ֆայլ.
պատասխանը հետք ա, ստուգումը՝ Սևակինը։

---
Q-001 — GGR պայմանագիրը
Ստատուս. open
Հարցը. 10% GGR-ի ճշգրիտ պայմանները. negative GGR/clawback իրակա՞ն ա,
կա՞ «7.5% guaranteed» տարբերակ, deductions/tax/վճարման ուղիներ։
Ինչու ա կարևոր. ստուդիայի եկամտի մոդելն ա. community-ում clawback-ի
սքրինշոթ ա պտտվում (LTC Casino, երկրորդ ձեռք)։
Լավագույն աղբյուր. ACP-ի պայմանագիր/Discord staff։

---
Q-002 — Exclusivity
Ստատուս. open
Հարցը. խաղի լիցենզիան բացառի՞կ ա Stake-ի (Medium Rare N.V.) համար,
multi-casino տարածումը երբ/ինչ պայմաններով ա գալու։
Ինչու ա կարևոր. որոշում ա՝ Run Dady-ն այլ տեղ կարա՞ գնա։

---
Q-003 — ACP onboarding
Ստատուս. open
Հարցը. account/team ստեղծման, KYC/KYB, պայմանագրի ընդունման ճշգրիտ
քայլերը մինչև առաջին upload-ը; approval checklist-ի login-gated մասը։
Ինչու ա կարևոր. հիմնադիրը պիտի account բացի, որ T-0003-ի վերջում
իրական upload փորձենք ու ամբողջ checklist-ը կարդանք։

---
Q-004 — RGS-ի հուսալիության պայմանագիրը
Ստատուս. open
Հարցը. /play-ի idempotency/կրկնակի քլիքի վարքը, retry/timeout
կանոնները, rate limit-երը։
Ինչու ա կարևոր. ֆրոնտի սխալակայունությունը (QA-ի edge case-երը) սրա
վրա ա նստելու։ Public docs-ում չկա — ts-client-ի կոդից + support-ից։

---
Q-005 — Quality Rankings vs Submission Checklist
Ստատուս. documented-conflict (երկու էջն էլ կարդացած եմ 2026-09-07)
Հարցը. «1 աստղ»-ի հրապարակման շեմի երկու էջի ձևակերպումները
հակասու՞մ են, թե՞ quality-rankings-ը ուրիշ բան ա չափում։
Ինչու ա կարևոր. մեր թիրախը 2-3 աստղն ա, բայց շեմը հստակ իմանալ ա պետք։

---
Q-006 — Մաթ version-ների քաղաքականությունը
Ստատուս. open
Հարցը. live խաղի համար թույլատրվու՞մ ա նոր math version submit անել
(նոր review-ով), թե՞ post-release freeze-ը բացարձակ ա ու mode-set-ը
ընդմիշտ ա։ Replay URL-ը version ունի (1, 2…), community-ն ասում ա
«նոր version = նոր review», public doc-ը լուռ ա։
Ինչու ա կարևոր. որոշում ա T-0002-ի mode-քանակի ռազմավարությունը
(հիմա ամբողջը դնե՞նք, թե՞ կարանք հետո ավելացնենք)։
Լավագույն աղբյուր. Engine Discord/support, ACP-ի փաստաթղթեր։

---
Q-007 — Stateful խաղերի իրական քաղաքականությունը (ՈՐՈՇԻՉ ՀԱՐՑ)
Ստատուս. open
Հարցը. web-sdk-ի README-ն ճանաչում ա stateful խաղերի հասկացությունը
(Mines՝ մի քանի RGS request մեկ ռաունդում), բայց օրինակի լինքը Stake-ի
ՍԵՓԱԿԱՆ Mines-ն ա, approval-guidelines-ը երրորդ կողմի համար խիստ
stateless ա պահանջում, իսկ ts-client-ը cashout/step մեթոդ չունի։
Հարցնել Engine-ին ԳՐԱՎՈՐ. երրորդ կողմի խաղը երբևէ կարո՞ղ ա stateful
լինել (mid-round որոշում, որ փոխում ա settlement-ը), թե՞ դա միայն
Stake Originals-ի արտոնությունն ա։
Ինչու ա կարևոր. եթե պատասխանը «այո, կարելի ա» լինի — Run Dady-ի
մեխանիկան կարանք վերանայենք դեպի իրական cashout։ Մինչև գրավոր «այո»՝
D-003-ով ենք գնում (նախաորոշված արդյունք)։
Լավագույն աղբյուր. Engine Discord staff / support ticket։
