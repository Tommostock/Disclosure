/**
 * SightingCard — Reusable card component for displaying a sighting summary.
 *
 * Used in Search results, On This Day list, and Dashboard.
 * Shows: date, city/state, shape badge, and truncated summary.
 * Tapping navigates to the full sighting detail page.
 */

"use client";

import Link from "next/link";
import type { Sighting } from "@/lib/database.types";
import { formatDate, normalizeShape, truncateText } from "@/lib/utils";

interface SightingCardProps {
  sighting: Sighting;
  /** Show the year prominently (for On This Day view) */
  showYear?: boolean;
}

export default function SightingCard({ sighting, showYear }: SightingCardProps) {
  const year = sighting.date_time
    ? new Date(sighting.date_time).getFullYear()
    : null;

  return (
    <Link
      href={`/sighting/${sighting.id}`}
      className="block rounded-xl border border-border bg-bg-secondary p-4
                 hover:bg-bg-tertiary active:scale-[0.98] transition-all duration-150"
    >
      <div className="flex items-start gap-3">
        {/* Year (large, green) when in "On This Day" mode */}
        {showYear && year && (
          <span className="text-2xl font-bold text-accent shrink-0">
            {year}
          </span>
        )}

        <div className="flex-1 min-w-0">
          {/* Top row: shape badge and date */}
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-block rounded-full bg-accent/15 px-2.5 py-0.5
                             text-xs font-semibold text-accent">
              {normalizeShape(sighting.shape)}
            </span>
            {!showYear && sighting.date_time && (
              <span className="text-xs text-text-tertiary">
                {formatDate(sighting.date_time)}
              </span>
            )}
          </div>

          {/* City, State */}
          <h3 className="text-sm font-semibold text-text-primary mb-1">
            {[sighting.city, sighting.state].filter(Boolean).join(", ") || "Unknown Location"}
          </h3>

          {/* Truncated summary */}
          {sighting.summary && (
            <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
              {truncateText(sighting.summary, 200)}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
