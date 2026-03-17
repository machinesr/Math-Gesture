export const GAME_FONT = "'Poppins', sans-serif";
export const BODY_FONT = "'Poppins', sans-serif";

export const COLORS = {
  black: "#111111",
  white: "#ffffff",
  bgDark: "#1a1a1a",
  borderLight: "#d8d8d8",
  placeholderGray: "#bbbbbb",
  textMuted: "#999999",
  green: "#22c55e",
  badgeBg: "#f3f3f3",
  badgeText: "#444444",
} as const;

export const CARD_WIDTH = "340px";

export const TIME_LIMIT_OPTIONS: readonly number[] = [1, 2, 3, 5];

export const STEPS = {
  JOIN: "join",
  USERNAME: "username",
  CREATE: "create",
} as const;

export type Step = (typeof STEPS)[keyof typeof STEPS];
