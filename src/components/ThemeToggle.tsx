/**
 * ThemeToggle — A button that switches between light and dark mode.
 *
 * Shows a Sun icon in dark mode (click to go light) and a Moon icon
 * in light mode (click to go dark). Uses the useTheme hook.
 */

"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

export default function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme();

  /* Don't render the icon until mounted to avoid hydration mismatch */
  if (!mounted) {
    return (
      <button
        className="flex h-10 w-10 items-center justify-center rounded-lg"
        aria-label="Toggle theme"
      >
        <div className="h-5 w-5" />
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="flex h-10 w-10 items-center justify-center rounded-lg
                 text-text-secondary hover:bg-bg-tertiary
                 transition-colors duration-200"
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark" ? (
        <Sun size={20} strokeWidth={1.5} />
      ) : (
        <Moon size={20} strokeWidth={1.5} />
      )}
    </button>
  );
}
