import { type ReactNode, useState, useEffect } from 'react';
import type { ThemeName } from "@/app/types/theme";
import { defaultTheme } from "@/app/types/theme";
import { ThemeContext, type ThemeContextValue } from './theme-context';

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<ThemeName>(() => {
        if (typeof window === "undefined" || typeof window.localStorage === "undefined") {
            return defaultTheme;
        }

        const stored = window.localStorage.getItem("tutory-theme");
        if (stored === "sunny-playroom" || stored === "forest-adventure" || stored === "ocean-lab") {
            return stored;
        }

        return defaultTheme;
    });

    useEffect(() => {
        if (typeof document === "undefined") {
            return;
        }

        const root = document.documentElement;
        root.dataset.theme = theme;
    }, [theme]);

    function setTheme(next: ThemeName) {
        setThemeState(next);

        if (typeof window !== "undefined" && typeof window.localStorage !== "undefined") {
            window.localStorage.setItem("tutory-theme", next);
        }
    }

    const value: ThemeContextValue = {
        theme,
        setTheme,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}
