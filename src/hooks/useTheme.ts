/**
 * useTheme — Custom hook for managing light/dark theme.
 *
 * How it works:
 * 1. On first visit, checks the user's system preference (prefers-color-scheme)
 * 2. On subsequent visits, reads the saved preference from localStorage
 * 3. Toggles the "dark" class on <html> to switch themes
 * 4. The "mounted" flag prevents hydration mismatch between server and client
 * 5. A MutationObserver keeps all useTheme instances in sync
 */

"use client";

import { useState, useEffect, useCallback } from "react";

/** The key used to store the theme preference in localStorage */
const STORAGE_KEY = "disclosure-theme";

type Theme = "light" | "dark";

/** Reads the current theme from the <html> element's class list */
function readThemeFromDOM(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function useTheme() {
  /* Start with "light" — this matches what the server renders */
  const [theme, setTheme] = useState<Theme>("light");

  /* Track whether the component has mounted (needed to avoid hydration mismatch) */
  const [mounted, setMounted] = useState(false);

  /* On mount: read saved preference, or detect system preference */
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;

    if (saved === "light" || saved === "dark") {
      setTheme(saved);
    } else {
      /* No saved preference — use system preference */
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(prefersDark ? "dark" : "light");
    }

    setMounted(true);

    /* Observe the <html> class list so all useTheme instances stay in sync.
       When one instance toggles the class, others pick it up here. */
    const observer = new MutationObserver(() => {
      setTheme(readThemeFromDOM());
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  /* Whenever the theme changes, update the DOM and localStorage */
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    const currentDOM = readThemeFromDOM();

    /* Only mutate the DOM if it's out of sync — prevents observer loop */
    if (currentDOM !== theme) {
      if (theme === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }

    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme, mounted]);

  /* Toggle function to switch between light and dark */
  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  }, []);

  return { theme, toggleTheme, mounted };
}
