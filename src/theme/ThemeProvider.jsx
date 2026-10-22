import { useCallback, useEffect, useMemo, useState } from "react";
import { ThemeContext } from "./ThemeContext";

const loadTheme = () => {
    try { return localStorage.getItem("theme") === "dark" ? "dark" : "light"; }
    catch { return "light"; }
};

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(loadTheme);   // pass the function, don't call it

    useEffect(() => {
        document.documentElement.classList.toggle("dark", theme === "dark");
        try { localStorage.setItem("theme", theme); } catch { /* storage blocked */ }
    }, [theme]);

    const toggleTheme = useCallback(() => setTheme(t => (t === "dark" ? "light" : "dark")), []);
    const value = useMemo(() => ({ theme, isDark: theme === "dark", setTheme, toggleTheme }), [theme, toggleTheme]);

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};