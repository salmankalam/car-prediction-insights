import { createContext, useContext, useEffect, useState } from "react";

type Mode = "light" | "dark";
const KEY = "carai-mode";

const ThemeCtx = createContext<{ mode: Mode; toggle: () => void }>({
  mode: "dark",
  toggle: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [mode, setMode] = useState<Mode>(() => {
    if (typeof window === "undefined") return "dark";
    const stored = localStorage.getItem(KEY) as Mode | null;
    if (stored) return stored;
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", mode === "dark");
    localStorage.setItem(KEY, mode);
  }, [mode]);

  return (
    <ThemeCtx.Provider value={{ mode, toggle: () => setMode((m) => (m === "dark" ? "light" : "dark")) }}>
      {children}
    </ThemeCtx.Provider>
  );
};

export const useTheme = () => useContext(ThemeCtx);
