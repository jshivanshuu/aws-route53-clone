import { createContext, ReactNode, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";
const ThemeContext = createContext<{ theme: Theme; toggleTheme: () => void }>({ theme: "dark", toggleTheme: () => undefined });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  useEffect(() => {
    const saved = localStorage.getItem("route53_theme") as Theme | null;
    const preferred = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    setTheme(saved || preferred);
  }, []);
  useEffect(() => { document.documentElement.dataset.theme = theme; localStorage.setItem("route53_theme", theme); }, [theme]);
  return <ThemeContext.Provider value={{ theme, toggleTheme: () => setTheme(current => current === "dark" ? "light" : "dark") }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
