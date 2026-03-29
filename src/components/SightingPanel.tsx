/**
 * SightingPanel — Slide-up bottom sheet showing sighting details.
 *
 * Triggered when a user taps a sighting pin on the map.
 * Slides up from the bottom, covering about 60% of the screen.
 * Has a drag handle at the top for swipe-down dismissal.
 *
 * Displays: shape badge, date/time, city/state, duration, witness account.
 */

"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import type { Sighting } from "@/lib/database.types";
import { formatDateTime, normalizeShape } from "@/lib/utils";

interface SightingPanelProps {
  sighting: Sighting | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function SightingPanel({ sighting, isOpen, onClose }: SightingPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  /* Close panel when clicking the overlay/backdrop */
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Backdrop overlay — tap to close */}
      {isOpen && (
        <div
          className="absolute inset-0 z-[1001] bg-black/30"
          onClick={onClose}
        />
      )}

      {/* The slide-up panel */}
      <div
        ref={panelRef}
        style={{
          translate: isOpen ? "0 0" : "0 100%",
          transition: "translate 300ms ease-out",
        }}
        className="absolute bottom-0 left-0 right-0 z-[1002] max-h-[65vh]
                     rounded-t-2xl bg-bg-primary shadow-2xl"
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="h-1 w-10 rounded-full bg-border-strong" />
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-4 flex h-8 w-8 items-center justify-center
                     rounded-full text-text-tertiary hover:bg-bg-tertiary transition-colors"
          aria-label="Close panel"
        >
          <X size={18} strokeWidth={1.5} />
        </button>

        {/* Content */}
        <div className="overflow-y-auto px-5 pb-6 max-h-[calc(65vh-3rem)]">
          {sighting ? (
            <div className="space-y-3">
              {/* Shape badge */}
              <span className="inline-block rounded-full bg-accent/15 px-3 py-1
                               text-xs font-semibold text-accent">
                {normalizeShape(sighting.shape)}
              </span>

              {/* Date and time */}
              {sighting.date_time && (
                <p className="text-sm text-text-secondary">
                  {formatDateTime(sighting.date_time)}
                </p>
              )}

              {/* City, State */}
              <h2 className="text-lg font-bold text-text-primary">
                {[sighting.city, sighting.state].filter(Boolean).join(", ") || "Unknown Location"}
              </h2>

              {/* Duration */}
              {sighting.duration && (
                <p className="text-sm text-text-secondary">
                  Duration: {sighting.duration}
                </p>
              )}

              {/* Divider */}
              <hr className="border-border" />

              {/* Witness account */}
              <div>
                <h3 className="mb-2 text-sm font-semibold text-text-secondary">
                  Witness Account
                </h3>
                <p className="text-sm leading-relaxed text-text-primary">
                  {sighting.summary || sighting.description || "No description available."}
                </p>
              </div>

              {/* Source */}
              <p className="text-xs text-text-tertiary">
                Source: {sighting.source || "NUFORC"}
              </p>
            </div>
          ) : (
            /* Loading state */
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
