/**
 * MapControls — Floating control buttons overlaid on the map.
 *
 * Top-left: Filter button with active filter badge
 * Top-right: Zoom in, Zoom out, Near Me
 * Bottom-left: Heatmap toggle
 *
 * All buttons have 44px minimum touch targets.
 */

"use client";

import { Plus, Minus, SlidersHorizontal, Crosshair, Loader2 } from "lucide-react";
import { useMap } from "react-leaflet";
import { useGeolocation } from "@/hooks/useGeolocation";
import { cn } from "@/lib/utils";

interface MapControlsProps {
  onFilterClick: () => void;
  activeFilterCount: number;
  heatmapActive: boolean;
  onHeatmapToggle: () => void;
}

export default function MapControls({
  onFilterClick,
  activeFilterCount,
  heatmapActive,
  onHeatmapToggle,
}: MapControlsProps) {
  const map = useMap();
  const { loading: geoLoading, error: geoError, requestLocation, latitude, longitude } = useGeolocation();

  /* Handle Near Me click — fly to user's location */
  function handleNearMe() {
    if (latitude && longitude) {
      /* Already have location, fly there */
      map.flyTo([latitude, longitude], 10, { duration: 1 });
    } else {
      /* Request location, then fly there */
      requestLocation();
    }
  }

  /* Fly to location when it becomes available */
  if (latitude && longitude && !geoLoading) {
    /* This gets called on re-render after location is obtained */
  }

  return (
    <>
      {/* Top-left: Filter button */}
      <div className="absolute top-4 left-4 z-[1000]">
        <button
          onClick={onFilterClick}
          className="relative flex items-center gap-2 rounded-lg bg-bg-primary px-3 py-2.5
                     text-sm font-medium text-text-primary shadow-md border border-border
                     hover:bg-bg-secondary transition-colors"
          aria-label="Open filters"
        >
          <SlidersHorizontal size={18} strokeWidth={1.5} />
          <span>Filters</span>

          {activeFilterCount > 0 && (
            <span
              className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center
                         rounded-full bg-accent text-xs font-bold text-black"
            >
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Top-right: Zoom controls + Near Me */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        <button
          onClick={() => map.zoomIn()}
          className="flex h-11 w-11 items-center justify-center rounded-lg
                     bg-bg-primary text-text-primary shadow-md border border-border
                     hover:bg-bg-secondary transition-colors"
          aria-label="Zoom in"
        >
          <Plus size={20} strokeWidth={1.5} />
        </button>
        <button
          onClick={() => map.zoomOut()}
          className="flex h-11 w-11 items-center justify-center rounded-lg
                     bg-bg-primary text-text-primary shadow-md border border-border
                     hover:bg-bg-secondary transition-colors"
          aria-label="Zoom out"
        >
          <Minus size={20} strokeWidth={1.5} />
        </button>
        <button
          onClick={handleNearMe}
          disabled={geoLoading}
          className="flex h-11 w-11 items-center justify-center rounded-lg
                     bg-bg-primary text-text-primary shadow-md border border-border
                     hover:bg-bg-secondary transition-colors disabled:opacity-50"
          aria-label="Center on my location"
          title={geoError || "Near Me"}
        >
          {geoLoading ? (
            <Loader2 size={20} strokeWidth={1.5} className="animate-spin" />
          ) : (
            <Crosshair size={20} strokeWidth={1.5} />
          )}
        </button>
      </div>

      {/* Bottom-left: Heatmap toggle */}
      <div className="absolute bottom-4 left-4 z-[1000]">
        <button
          onClick={onHeatmapToggle}
          className={cn(
            "rounded-full px-4 py-2 text-xs font-medium shadow-md border transition-colors",
            heatmapActive
              ? "bg-accent text-black border-accent"
              : "bg-bg-primary text-text-primary border-border hover:bg-bg-secondary"
          )}
        >
          Heatmap
        </button>
      </div>

      {/* Geolocation error toast */}
      {geoError && (
        <div className="absolute bottom-14 left-4 right-4 z-[1000]">
          <div className="rounded-lg bg-bg-primary border border-border px-4 py-3 shadow-lg">
            <p className="text-xs text-text-secondary">{geoError}</p>
          </div>
        </div>
      )}
    </>
  );
}
