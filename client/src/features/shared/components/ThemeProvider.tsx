import { createContext, use, useEffect, useState } from "react";

import { getItem, setItem } from "@/lib/utils/localStorage";

type Theme = "dark" | "light" | "system";

interface ThemeProviderState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeProviderState>({
  theme: "system",
  setTheme: () => {},
});

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "advanced-react-theme",
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    getItem(storageKey) ?? defaultTheme,
  );

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("dark", "light");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
      setItem(storageKey, systemTheme);
      return;
    }

    root.classList.add(theme);
    setItem(storageKey, theme);
  }, [theme, storageKey]);

  return <ThemeContext value={{ theme, setTheme }}>{children}</ThemeContext>;
}

export const useTheme = () => {
  const context = use(ThemeContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};
