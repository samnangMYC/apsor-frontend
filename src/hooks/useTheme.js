import React from "react";

const THEME_KEY = "theme";
const THEME_EVENT = "apsor:theme";

function getSystemTheme() {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function useTheme(defaultTheme = "light") {
  const [theme, setThemeState] = React.useState(() => {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "dark" || saved === "light") return saved;
    return defaultTheme === "system" ? getSystemTheme() : defaultTheme;
  });

  const setTheme = React.useCallback((next) => {
    if (next !== "dark" && next !== "light") return;
    setThemeState(next);
  }, []);

  const toggleTheme = React.useCallback(() => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  React.useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
    document.documentElement.setAttribute("data-theme", theme);
    window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: theme }));
  }, [theme]);

  React.useEffect(() => {
    const handler = (e) => {
      const next = e?.detail;
      if ((next === "dark" || next === "light") && next !== theme) {
        setThemeState(next);
      }
    };
    window.addEventListener(THEME_EVENT, handler);
    return () => window.removeEventListener(THEME_EVENT, handler);
  }, [theme]);

  React.useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== THEME_KEY) return;
      const next = e.newValue;
      if ((next === "dark" || next === "light") && next !== theme) {
        setThemeState(next);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [theme]);

  return {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === "dark",
  };
}
