export const THEME_COOKIE_NAME = "gm_theme";

export type Theme = "light" | "dark";

export function normalizeTheme(value: string | undefined | null): Theme {
  return value === "dark" ? "dark" : "light";
}
