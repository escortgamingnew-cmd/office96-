/* SANDBOX fake-book — D-003-ի ոգով. ռաունդի արդյունքը (crash-կետը = վազքի երկարությունը մետրով)
 * որոշվում ա bet-ի պահին, ոչ վազքի ընթացքում։ Ներկայացումը (hold-to-run, մուլտի, catch) դրան ա հետևում։
 *
 * Ուշադիր. սա placeholder distribution ա (exponential + հազվադեպ երկար) — իրական մաթ չի,
 * RTP/hit-rate չի հաշվված։ Իրական distribution-ը T-0002-ից ա գալու (docs/math/model-draft-v0.md),
 * իսկ պրոդուկտում book-ը RGS-ից ա եկելու, ոչ լոկալ գեներացվելու։
 * Cashout-ի վերջնական semantics-ը (stateless կանոնով) T-0004/product որոշում ա — էստեղ պրոտոյի
 * զգացողությունն ա վերարտադրվում sandbox-ում (cashout = win ընթացիկ մուլտիով)։
 */
export function drawBook(rng = Math.random) {
  const u = rng();
  let crashDist = 6 + -Math.log(1 - u) * 55;      // մեան ~61 մ → ~4x @0.05/մ
  if (rng() < 0.06) crashDist *= 3.5;             // հազվադեպ երկար վազք
  return { crashDist, sandbox: true };
}
