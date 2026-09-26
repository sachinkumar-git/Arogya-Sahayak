const TONES = {
  primary: "bg-primary-light text-primary",
  wellness: "bg-wellness-light text-wellness",
  success: "bg-success-light text-success",
  warning: "bg-warning-light text-warning-strong",
  emergency: "bg-emergency-light text-emergency",
  accent: "bg-accent-light text-accent",
} as const;

const BARS = {
  primary: "bg-primary",
  wellness: "bg-wellness",
  success: "bg-success",
  warning: "bg-warning",
  emergency: "bg-emergency",
  accent: "bg-marigold",
} as const;

export type Tone = keyof typeof TONES;

export const toneClasses = (tone: Tone) => TONES[tone];
export const toneBar = (tone: Tone) => BARS[tone];
