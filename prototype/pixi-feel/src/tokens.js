/* ԳԵՆԵՐԱՑՎԱԾ ա tools/design/gen-tokens.mjs v2.0-ից — ձեռքով ՉԽՄԲԱԳՐԵԼ (docs/design/ui-tokens.md)
 * Run Dady semantic token-ները Pixi/JS-ի համար. գույն = 0xRRGGBB, alpha-ով = {color, alpha},
 * չափեր unitless px, opacity 0–1, lh px։ Նույն արժեքները, ինչ tokens.css-ի --rd-*-ը (բանալին camelCase)։ */
const freeze = (o) => { for (const v of Object.values(o)) if (typeof v === "object") freeze(v); return Object.freeze(o); };
/** @typedef {{ button: { bet: { bg: number, bgPressed: number, fg: number, glow: { color: number, alpha: number } }, cashout: { bgTop: number, bgBottom: number, bgTopPressed: number, bgBottomPressed: number, fg: number, glow: { color: number, alpha: number } }, won: { bgTop: number, bgBottom: number }, ghost: { bg: { color: number, alpha: number }, bgPressed: { color: number, alpha: number }, border: number, fg: number }, borderFocus: number, hLg: number, hMd: number, padX: number, padY: number, gap: number, radius: number }, field: { bg: number, fg: number, border: { color: number, alpha: number }, borderFocus: number, borderError: number, glowFocus: { color: number, alpha: number }, label: { fg: { color: number, alpha: number } }, placeholder: { fg: { color: number, alpha: number } }, helper: { fg: { color: number, alpha: number }, fgError: number }, h: number, padX: number, padY: number, gap: number, radius: number }, chip: { bgTop: number, bgBottom: number, bgTopPressed: number, bgBottomPressed: number, bgSelected: number, borderSelected: number, fg: number, h: number, padX: number, radius: number }, betRow: { bgTop: number, bgBottom: number, pad: number, gap: number }, segment: { bgPressed: number, bgSelected: number, fg: { color: number, alpha: number }, fgSelected: number, track: { bg: number, pad: number, gap: number, radius: number }, h: number, padX: number, gap: number, radius: number, dot: { size: number } }, difficulty: { easy: { bg: number }, medium: { bg: number }, hard: { bg: number }, expert: { bg: number } }, panel: { bg: { color: number, alpha: number }, pill: { bg: { color: number, alpha: number }, gap: number }, pad: number, radius: number, section: { gap: number }, controls: { gap: number }, balance: { gap: number } }, text: { primary: number, secondary: { color: number, alpha: number }, placeholder: { color: number, alpha: number } }, icon: { primary: number, secondary: { color: number, alpha: number } }, border: { subtle: { color: number, alpha: number }, focus: number, error: number }, shape: { accent: number }, state: { win: number, loss: number, caught: number, crash: number }, space: { xs: number, sm: number, md: number, lg: number, xl: number }, radius: { xs: number, sm: number, md: number, lg: number, xl: number, pill: number }, stroke: { hairline: number, control: number }, size: { icon: number, touch: number }, opacity: { disabled: number }, font: { displayMultiplier: { family: string, size: number, weight: number, tracking: number, lh: number }, amount: { family: string, size: number, weight: number, tracking: number, lh: number }, buttonLarge: { family: string, size: number, weight: number, tracking: number, lh: number }, buttonBase: { family: string, size: number, weight: number, tracking: number, lh: number }, pill: { family: string, size: number, weight: number, tracking: number, lh: number }, labelCaps: { family: string, size: number, weight: number, tracking: number, lh: number } } }} RDTokens */
/** @type {RDTokens} */
export const RD = freeze({
  button: {
    bet: {
      bg: 0x2EC27E,
      bgPressed: 0x24A869,
      fg: 0x0A0E14,
      glow: { color: 0x2EC27E, alpha: 0.35 },
    },
    cashout: {
      bgTop: 0xFFC94D,
      bgBottom: 0xF6A821,
      bgTopPressed: 0xFBB937,
      bgBottomPressed: 0xC78819,
      fg: 0x3A2600,
      glow: { color: 0xF6A821, alpha: 0.45 },
    },
    won: {
      bgTop: 0x3DDC91,
      bgBottom: 0x22B573,
    },
    ghost: {
      bg: { color: 0x2EC27E, alpha: 0.08 },
      bgPressed: { color: 0x2EC27E, alpha: 0.16 },
      border: 0x2EC27E,
      fg: 0x3DDC91,
    },
    borderFocus: 0xFFD27A,
    hLg: 48,
    hMd: 40,
    padX: 22,
    padY: 14,
    gap: 8,
    radius: 12,
  },
  field: {
    bg: 0x242F49,
    fg: 0xFFFFFF,
    border: { color: 0xFFFFFF, alpha: 0.12 },
    borderFocus: 0xFFD27A,
    borderError: 0xFF6B6B,
    glowFocus: { color: 0xF6A821, alpha: 0.45 },
    label: {
      fg: { color: 0xFFFFFF, alpha: 0.5 },
    },
    placeholder: {
      fg: { color: 0xFFFFFF, alpha: 0.35 },
    },
    helper: {
      fg: { color: 0xFFFFFF, alpha: 0.5 },
      fgError: 0xFF6B6B,
    },
    h: 48,
    padX: 16,
    padY: 12,
    gap: 6,
    radius: 12,
  },
  chip: {
    bgTop: 0x3C4966,
    bgBottom: 0x2C374F,
    bgTopPressed: 0x33405E,
    bgBottomPressed: 0x242F49,
    bgSelected: 0x56617A,
    borderSelected: 0xFFD27A,
    fg: 0xFFFFFF,
    h: 40,
    padX: 12,
    radius: 8,
  },
  betRow: {
    bgTop: 0x33405E,
    bgBottom: 0x242F49,
    pad: 4,
    gap: 8,
  },
  segment: {
    bgPressed: 0x33405E,
    bgSelected: 0x56617A,
    fg: { color: 0xFFFFFF, alpha: 0.5 },
    fgSelected: 0xFFFFFF,
    track: {
      bg: 0x242F49,
      pad: 4,
      gap: 4,
      radius: 12,
    },
    h: 40,
    padX: 8,
    gap: 8,
    radius: 8,
    dot: {
      size: 8,
    },
  },
  difficulty: {
    easy: {
      bg: 0x3DDC91,
    },
    medium: {
      bg: 0xFFD27A,
    },
    hard: {
      bg: 0xF6A821,
    },
    expert: {
      bg: 0xFF4D4D,
    },
  },
  panel: {
    bg: { color: 0x0E131B, alpha: 0.92 },
    pill: {
      bg: { color: 0x0A0E14, alpha: 0.55 },
      gap: 6,
    },
    pad: 16,
    radius: 16,
    section: {
      gap: 12,
    },
    controls: {
      gap: 8,
    },
    balance: {
      gap: 2,
    },
  },
  text: {
    primary: 0xFFFFFF,
    secondary: { color: 0xFFFFFF, alpha: 0.5 },
    placeholder: { color: 0xFFFFFF, alpha: 0.35 },
  },
  icon: {
    primary: 0xFFFFFF,
    secondary: { color: 0xFFFFFF, alpha: 0.5 },
  },
  border: {
    subtle: { color: 0xFFFFFF, alpha: 0.12 },
    focus: 0xFFD27A,
    error: 0xFF6B6B,
  },
  shape: {
    accent: 0xFFD27A,
  },
  state: {
    win: 0x3DDC91,
    loss: 0xFF6B6B,
    caught: 0xFF5D5D,
    crash: 0xFF4D4D,
  },
  space: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
  radius: {
    xs: 6,
    sm: 8,
    md: 10,
    lg: 12,
    xl: 16,
    pill: 999,
  },
  stroke: {
    hairline: 1,
    control: 2,
  },
  size: {
    icon: 24,
    touch: 48,
  },
  opacity: {
    disabled: 0.4,
  },
  font: {
    displayMultiplier: {
      family: "Roboto Mono",
      size: 56,
      weight: 700,
      tracking: -2,
      lh: 56,
    },
    amount: {
      family: "Roboto Mono",
      size: 20,
      weight: 700,
      tracking: 0.5,
      lh: 24,
    },
    buttonLarge: {
      family: "Roboto Mono",
      size: 16,
      weight: 600,
      tracking: 0.5,
      lh: 19,
    },
    buttonBase: {
      family: "Roboto Mono",
      size: 14,
      weight: 600,
      tracking: 0.5,
      lh: 17,
    },
    pill: {
      family: "Roboto Mono",
      size: 12,
      weight: 700,
      tracking: 0.2,
      lh: 14,
    },
    labelCaps: {
      family: "Roboto Mono",
      size: 12,
      weight: 400,
      tracking: 2,
      lh: 17,
    },
  },
});
export default RD;
