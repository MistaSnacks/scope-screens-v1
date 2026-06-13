"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type Theme = "movie" | "house";

interface ThemeCtxValue {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeCtx = createContext<ThemeCtxValue>({
  theme: "movie",
  toggle: () => {},
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeCtx);
}

/**
 * Holds the active theme. The real initial value is set pre-paint by the inline
 * script in layout.tsx (reads localStorage, writes html[data-theme]); this
 * provider just syncs React state to that attribute on mount and owns the
 * toggle. Default is Movie Mode (dark).
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("movie");

  useEffect(() => {
    const fromDom = document.documentElement.dataset.theme as Theme | undefined;
    if (fromDom === "house" || fromDom === "movie") setThemeState(fromDom);
  }, []);

  const setTheme = useCallback((t: Theme) => {
    document.documentElement.dataset.theme = t;
    try {
      localStorage.setItem("scope-theme", t);
    } catch {
      /* private mode / blocked storage — non-fatal */
    }
    setThemeState(t);
  }, []);

  const toggle = useCallback(() => {
    const current = (document.documentElement.dataset.theme as Theme) ?? "movie";
    setTheme(current === "house" ? "movie" : "house");
  }, [setTheme]);

  return <ThemeCtx.Provider value={{ theme, toggle, setTheme }}>{children}</ThemeCtx.Provider>;
}
