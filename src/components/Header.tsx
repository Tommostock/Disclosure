/**
 * Header — The top bar of the app.
 *
 * Contains:
 * - "DISCLOSURE" wordmark on the left
 * - Theme toggle (Sun/Moon) on the right
 * - Overflow menu (three dots) linking to About/Privacy/Terms
 *
 * Sticky at the top, 56px height, solid background with bottom border.
 */

"use client";

import { useState, useRef, useEffect } from "react";
import { MoreVertical } from "lucide-react";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  /* Close the menu when clicking outside */
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center
                 justify-between px-4 border-b
                 bg-bg-primary border-border"
    >
      {/* Wordmark — green dot accent after the text, per design spec */}
      <Link href="/" className="text-lg font-bold tracking-wider text-text-primary">
        DISCLOSURE<span className="text-accent">.</span>
      </Link>

      {/* Right side: theme toggle + overflow menu */}
      <div className="flex items-center gap-1">
        <ThemeToggle />

        {/* Overflow menu */}
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-lg
                       text-text-secondary hover:bg-bg-tertiary
                       transition-colors duration-200"
            aria-label="More options"
          >
            <MoreVertical size={20} strokeWidth={1.5} />
          </button>

          {/* Dropdown menu */}
          {menuOpen && (
            <div
              className="absolute right-0 top-full mt-1 w-44 rounded-xl border
                         bg-bg-primary border-border shadow-lg"
            >
              <nav className="py-1">
                <Link
                  href="/about"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2.5 text-sm text-text-secondary
                             hover:bg-bg-secondary transition-colors"
                >
                  About
                </Link>
                <Link
                  href="/privacy"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2.5 text-sm text-text-secondary
                             hover:bg-bg-secondary transition-colors"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/terms"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2.5 text-sm text-text-secondary
                             hover:bg-bg-secondary transition-colors"
                >
                  Terms of Use
                </Link>
              </nav>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
