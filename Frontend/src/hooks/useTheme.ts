import { useEffect, useState, useCallback } from "react";

export function useTheme() {
    const [theme, setTheme] = useState<"light" | "dark">(() => {
        if (typeof window !== "undefined") {
            return (
                (localStorage.getItem("pb-theme") as "light" | "dark") ??
                (
                    window.matchMedia("(prefers-color-scheme: dark)").matches
                        ? "dark"
                        : "light"
                )
            );
        }

        return "light";
    });

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("pb-theme", theme);
    }, [theme]);

    const toggleTheme = useCallback(() => {
        setTheme((prev) => (prev === "light" ? "dark" : "light"));
    }, []);

    return {
        theme,
        toggleTheme,
    };
}