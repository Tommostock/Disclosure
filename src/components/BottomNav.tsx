/**
 * BottomNav — Fixed bottom navigation bar with 4 tabs.
 *
 * Tabs:
 * 1. Map (/) — MapPin icon
 * 2. Dashboard (/dashboard) — BarChart3 icon
 * 3. Today (/today) — Calendar icon
 * 4. Search (/search) — Search icon
 *
 * Active tab is highlighted with the green accent color.
 * Uses Next.js usePathname() to determine which tab is active.
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, BarChart3, Calendar, Search } from "lucide-react";
import { cn } from "@/lib/utils";

/** Tab configuration — each tab has a path, label, and icon */
const tabs = [
  { href: "/", label: "Map", icon: MapPin },
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/today", label: "Today", icon: Calendar },
  { href: "/search", label: "Search", icon: Search },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center
                 border-t bg-bg-primary border-border"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {tabs.map((tab) => {
        /* Check if this tab is active — exact match for "/" and startsWith for others */
        const isActive =
          tab.href === "/"
            ? pathname === "/"
            : pathname.startsWith(tab.href);

        const Icon = tab.icon;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 py-2",
              "transition-colors duration-200",
              isActive
                ? "text-accent"
                : "text-text-tertiary hover:text-text-secondary"
            )}
          >
            <Icon size={24} strokeWidth={1.5} />
            <span className="text-xs font-medium">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
