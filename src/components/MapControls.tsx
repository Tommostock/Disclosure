/**
 * MapControls — Floating control buttons overlaid on the map.
 *
 * Rendered OUTSIDE of MapContainer (as regular DOM elements) to avoid
 * the useLeafletContext error. Receives the Leaflet map instance as a prop.
 *
 * Top-left: Filter button with active filter badge
 * Top-right: Zoom in, Zoom out, Near Me
 * Bottom-left: Heatmap toggle
 */

"use client";

import { useEffect, useRef } from "react";
import { Plus, Minus, SlidersHorizontal, Crosshair, Loader2, Globe } from "lucide-react";
import L from "leaflet";
import { useGeolocation } from "@/hooks/useGeolocation";
import { cn } from "@/lib/utils";

interface MapControlsProps {
  map: L.Map;
  onFilterClick: () => void;
  activeFilterCount: number;
  heatmapActive: boolean;
  onHeatmapToggle: () => void;
  satelliteView: boolean;
  onSatelliteToggle: () => void;
}

export default function MapControlsOverlay({
  map,
  onFilterClick,
  activeFilterCount,
  heatmapActive,
  onHeatmapToggle,
  satelliteView,
  onSatelliteToggle,
}: MapControlsProps) {
  const { loading: geoLoading, error: geoError, requestLocation, latitude, longitude } = useGeolocation();
  const userMarkerRef = useRef<L.CircleMarker | null>(null);
  const hasFlewRef = useRef(false);

  /* When coordinates arrive (async), fly to them and show a blue dot */
  useEffect(() => {
    if (latitude && longitude && !hasFlewRef.current) {
      map.flyTo([latitude, longitude], 10, { duration: 1 });
      hasFlewRef.current = true;

      /* Remove old marker if exists */
      if (userMarkerRef.current) {
        map.removeLayer(userMarkerRef.current);
      }

      /* Add a blue pulsing dot at the user's location */
      userMarkerRef.current = L.circleMarker([latitude, longitude], {
        radius: 8,
        fillColor: "#3B82F6",
        fillOpacity: 1,
        color: "#3B82F6",
        weight: 2,
        opacity: 0.4,
        className: "user-location-pulse",
      }).addTo(map);
    }
  }, [latitude, longitude, map]);

  /* Handle Near Me click — request location or fly to cached location */
  function handleNearMe() {
    if (latitude && longitude) {
      map.flyTo([latitude, longitude], 10, { duration: 1 });
    } else {
      hasFlewRef.current = false; /* Allow fly on next coordinate arrival */
      requestLocation();
    }
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

      {/* Bottom-left: Heatmap + Satellite toggles */}
      <div className="absolute bottom-4 left-4 z-[1000] flex gap-2">
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
        <button
          onClick={onSatelliteToggle}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium shadow-md border transition-colors",
            satelliteView
              ? "bg-accent text-black border-accent"
              : "bg-bg-primary text-text-primary border-border hover:bg-bg-secondary"
          )}
        >
          <Globe size={14} strokeWidth={1.5} />
          Satellite
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
