// Public API for the theme feature
export { useTheme } from "./hooks/useTheme.ts";
export { ThemeContext, useThemeMode, useThemeContext } from "./context/ThemeContext.tsx";
export { THEME_PRESETS, FONT_OPTIONS } from "./themePresets.ts";
export type { ThemeId, FontFamily } from "./themePresets.ts";
