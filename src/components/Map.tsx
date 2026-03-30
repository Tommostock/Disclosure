/**
 * Map Component — The interactive Leaflet map showing UFO sightings.
 *
 * This is the core experience of the app. It displays:
 * - Dark CartoDB map tiles
 * - Clustered green markers (using Supercluster)
 * - Individual green dot markers when zoomed in
 * - Click on a marker opens the detail panel
 *
 * Important: This component must be loaded with next/dynamic({ ssr: false })
 * because Leaflet requires the browser's window object.
 */

"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import Supercluster from "supercluster";
import "leaflet/dist/leaflet.css";
import type { MapPoint } from "@/lib/queries";
import type { Sighting } from "@/lib/database.types";
import SightingPanel from "./SightingPanel";
import FilterDrawer from "./FilterDrawer";
import MapControlsOverlay from "./MapControls";
import { useTheme } from "@/hooks/useTheme";
import type { SightingFilters } from "@/lib/queries";

/* ---- Constants ---- */
const DEFAULT_CENTER: [number, number] = [30, -20]; /* World view showing US + Europe + Australia */
const DEFAULT_ZOOM = 3;

/* Tile layer options — theme-aware + satellite toggle */
const TILES = {
  dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  light: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
} as const;
const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>';
const SATELLITE_ATTRIBUTION = 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics';

/* ---- Cluster marker creation ---- */

/** Creates a green circle marker for a cluster with a count label */
function createClusterIcon(count: number, size: number): L.DivIcon {
  return L.divIcon({
    html: `<div style="
      width: ${size}px;
      height: ${size}px;
      background: rgba(34, 197, 94, 0.25);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <span style="
        width: ${size - 10}px;
        height: ${size - 10}px;
        background: #22C55E;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #000;
        font-weight: 700;
        font-size: ${count > 999 ? 10 : 12}px;
        font-family: 'Space Grotesk', sans-serif;
      ">${count > 9999 ? Math.round(count / 1000) + "k" : count.toLocaleString()}</span>
    </div>`,
    className: "",
    iconSize: L.point(size, size),
    iconAnchor: L.point(size / 2, size / 2),
  });
}

/** Creates a small green dot marker for an individual sighting */
function createPointIcon(): L.DivIcon {
  return L.divIcon({
    html: `<div class="sighting-pin"></div>`,
    className: "",
    iconSize: L.point(12, 12),
    iconAnchor: L.point(6, 6),
  });
}

/* ---- GeoJSON feature type for Supercluster ---- */
interface PointFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number]; /* [lng, lat] */
  };
  properties: {
    id: number;
    shape: string | null;
    city: string | null;
    state: string | null;
    date_time: string | null;
  };
}

/* ---- Inner Map Logic (runs inside MapContainer) ---- */

function MapContent({
  filters,
  onSightingSelect,
  heatmapActive,
  onPointCountChange,
  onLoadingChange,
}: {
  filters: SightingFilters;
  onSightingSelect: (id: number) => void;
  heatmapActive: boolean;
  onPointCountChange: (count: number) => void;
  onLoadingChange: (loading: boolean) => void;
}) {
  const map = useMap();
  const [points, setPoints] = useState<MapPoint[]>([]);
  const markersRef = useRef<L.LayerGroup>(L.layerGroup());
  const heatLayerRef = useRef<L.Layer | null>(null);
  const fetchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const filtersRef = useRef(filters);
  filtersRef.current = filters;
  const onPointCountChangeRef = useRef(onPointCountChange);
  onPointCountChangeRef.current = onPointCountChange;
  const onLoadingChangeRef = useRef(onLoadingChange);
  onLoadingChangeRef.current = onLoadingChange;

  /* Create a Supercluster instance */
  const clusterIndex = useMemo(() => {
    return new Supercluster<PointFeature["properties"]>({
      radius: 60,
      maxZoom: 16,
      minZoom: 0,
    });
  }, []);

  /* Fetch sighting data for the current viewport */
  const fetchData = useCallback(async () => {
    const bounds = map.getBounds();
    const params = new URLSearchParams({
      north: bounds.getNorth().toString(),
      south: bounds.getSouth().toString(),
      east: bounds.getEast().toString(),
      west: bounds.getWest().toString(),
    });

    const currentFilters = filtersRef.current;
    if (currentFilters.shapes && currentFilters.shapes.length > 0) {
      params.set("shapes", currentFilters.shapes.join(","));
    }
    if (currentFilters.country) {
      params.set("country", currentFilters.country);
    }
    if (currentFilters.state) {
      params.set("state", currentFilters.state);
    }
    if (currentFilters.dateFrom) {
      params.set("dateFrom", currentFilters.dateFrom);
    }
    if (currentFilters.dateTo) {
      params.set("dateTo", currentFilters.dateTo);
    }

    onLoadingChangeRef.current(true);
    try {
      const response = await fetch(`/api/sightings?${params}`);
      if (response.ok) {
        const data: MapPoint[] = await response.json();
        setPoints(data);
        onPointCountChangeRef.current(data.length);
      }
    } catch (error) {
      console.error("Failed to fetch sightings:", error);
    } finally {
      onLoadingChangeRef.current(false);
    }
  }, [map]);

  /* Debounced fetch on map move/zoom */
  const debouncedFetch = useCallback(() => {
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }
    fetchTimeoutRef.current = setTimeout(fetchData, 300);
  }, [fetchData]);

  /* Listen for map movement events */
  useMapEvents({
    moveend: debouncedFetch,
    zoomend: debouncedFetch,
  });

  /* Initial fetch and re-fetch when filters change */
  useEffect(() => {
    fetchData();
  }, [fetchData, filters]);

  /* Convert points to GeoJSON features and load into Supercluster */
  useEffect(() => {
    const features: PointFeature[] = points
      .filter((p) => p.latitude != null && p.longitude != null)
      .map((p) => ({
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: [p.longitude!, p.latitude!],
        },
        properties: {
          id: p.id,
          shape: p.shape,
          city: p.city,
          state: p.state,
          date_time: p.date_time,
        },
      }));

    clusterIndex.load(features);

    /* Render clusters and individual markers */
    renderMarkers();
  }, [points]); // eslint-disable-line react-hooks/exhaustive-deps

  /* Render markers whenever the map state changes */
  const renderMarkers = useCallback(() => {
    /* Clear existing markers */
    markersRef.current.clearLayers();

    const bounds = map.getBounds();
    const zoom = map.getZoom();

    /* Get clusters for the current viewport */
    const clusters = clusterIndex.getClusters(
      [
        bounds.getWest(),
        bounds.getSouth(),
        bounds.getEast(),
        bounds.getNorth(),
      ],
      Math.floor(zoom)
    );

    /* Create markers for each cluster/point */
    clusters.forEach((feature) => {
      const [lng, lat] = feature.geometry.coordinates;
      const properties = feature.properties;

      if (properties && "cluster" in properties && properties.cluster) {
        /* This is a cluster */
        const count = (properties as { point_count: number }).point_count;
        const clusterId = (properties as { cluster_id: number }).cluster_id;

        /* Size the cluster marker based on count */
        const size = count < 100 ? 36 : count < 1000 ? 44 : 52;

        const marker = L.marker([lat, lng], {
          icon: createClusterIcon(count, size),
        });

        /* Zoom into the cluster when clicked */
        marker.on("click", () => {
          const expansionZoom = clusterIndex.getClusterExpansionZoom(clusterId);
          map.flyTo([lat, lng], Math.min(expansionZoom, 18), { duration: 0.5 });
        });

        markersRef.current.addLayer(marker);
      } else {
        /* This is an individual point */
        const marker = L.marker([lat, lng], {
          icon: createPointIcon(),
        });

        /* Open the detail panel when clicked */
        marker.on("click", () => {
          if (properties && "id" in properties) {
            onSightingSelect((properties as { id: number }).id);
          }
        });

        markersRef.current.addLayer(marker);
      }
    });

    /* Add the layer group to the map */
    if (!map.hasLayer(markersRef.current)) {
      markersRef.current.addTo(map);
    }
  }, [map, clusterIndex, onSightingSelect]);

  /* Re-render markers on zoom/move */
  useMapEvents({
    moveend: renderMarkers,
    zoomend: renderMarkers,
  });

  /* Heatmap layer — toggle between markers and heatmap */
  useEffect(() => {
    if (heatmapActive) {
      /* Hide clustered markers */
      markersRef.current.clearLayers();

      /* Create heatmap data: [lat, lng, intensity] */
      const heatData = points
        .filter((p) => p.latitude != null && p.longitude != null)
        .map((p) => [p.latitude!, p.longitude!, 0.5] as [number, number, number]);

      /* Dynamically import leaflet.heat (it extends L) */
      import("leaflet.heat").then(() => {
        /* Remove old heatmap if exists */
        if (heatLayerRef.current && map.hasLayer(heatLayerRef.current)) {
          map.removeLayer(heatLayerRef.current);
        }

        /* Create new heatmap layer */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const heat = (L as any).heatLayer(heatData, {
          radius: 20,
          blur: 15,
          maxZoom: 17,
          gradient: {
            0.0: "transparent",
            0.2: "#064e3b",
            0.4: "#059669",
            0.6: "#22C55E",
            0.8: "#4ADE80",
            1.0: "#86EFAC",
          },
        });

        heat.addTo(map);
        heatLayerRef.current = heat;
      });
    } else {
      /* Remove heatmap layer and re-render markers */
      if (heatLayerRef.current && map.hasLayer(heatLayerRef.current)) {
        map.removeLayer(heatLayerRef.current);
        heatLayerRef.current = null;
      }
      renderMarkers();
    }
  }, [heatmapActive, points]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}

/* ---- Main Map Component ---- */

/* Small helper component to capture the map instance from inside MapContainer */
function MapRefCapture({ onMapReady }: { onMapReady: (map: L.Map) => void }) {
  const map = useMap();
  useEffect(() => {
    onMapReady(map);
  }, [map, onMapReady]);
  return null;
}

export default function Map() {
  const [, setSelectedSightingId] = useState<number | null>(null);
  const [selectedSighting, setSelectedSighting] = useState<Sighting | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [filters, setFilters] = useState<SightingFilters>({});
  const [heatmapActive, setHeatmapActive] = useState(false);
  const [satelliteView, setSatelliteView] = useState(false);
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  const [noResults, setNoResults] = useState(false);
  const [mapLoading, setMapLoading] = useState(false);
  const { theme } = useTheme();

  /* Pick the correct tile URL based on theme and satellite mode */
  const tileUrl = satelliteView
    ? TILES.satellite
    : theme === "light" ? TILES.light : TILES.dark;
  const tileAttribution = satelliteView ? SATELLITE_ATTRIBUTION : TILE_ATTRIBUTION;

  /* Fetch full sighting details when a marker is clicked */
  const handleSightingSelect = useCallback(async (id: number) => {
    setSelectedSightingId(id);
    setPanelOpen(true);

    try {
      const response = await fetch(`/api/sightings/${id}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedSighting(data);
      }
    } catch (error) {
      console.error("Failed to fetch sighting details:", error);
    }
  }, []);

  /* Close the detail panel */
  const handleClosePanel = useCallback(() => {
    setPanelOpen(false);
    setSelectedSighting(null);
    setSelectedSightingId(null);
  }, []);

  /* Apply filters from the filter drawer */
  const handleApplyFilters = useCallback((newFilters: SightingFilters) => {
    setFilters(newFilters);
    setFilterDrawerOpen(false);
  }, []);

  /* Count active filters for the badge */
  const activeFilterCount =
    (filters.shapes?.length || 0) +
    (filters.state ? 1 : 0) +
    (filters.dateFrom ? 1 : 0) +
    (filters.dateTo ? 1 : 0);

  return (
    <div className="relative h-[calc(100vh-7.5rem)] w-full overflow-hidden">
      {/* The Leaflet map */}
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        className="h-full w-full"
        zoomControl={false} /* We use custom zoom controls */
        attributionControl={true}
      >
        <TileLayer key={tileUrl} url={tileUrl} attribution={tileAttribution} />
        <MapContent
          filters={filters}
          onSightingSelect={handleSightingSelect}
          heatmapActive={heatmapActive}
          onPointCountChange={(count) => {
            /* Show "no results" toast only when filters are active */
            const hasFilters = (filters.shapes?.length || 0) > 0 || !!filters.state || !!filters.dateFrom || !!filters.dateTo;
            setNoResults(hasFilters && count === 0);
          }}
          onLoadingChange={setMapLoading}
        />
        <MapRefCapture onMapReady={setMapInstance} />
      </MapContainer>

      {/* Floating map controls — rendered outside MapContainer as regular DOM */}
      {mapInstance && (
        <MapControlsOverlay
          map={mapInstance}
          onFilterClick={() => setFilterDrawerOpen(true)}
          activeFilterCount={activeFilterCount}
          heatmapActive={heatmapActive}
          onHeatmapToggle={() => setHeatmapActive(!heatmapActive)}
          satelliteView={satelliteView}
          onSatelliteToggle={() => setSatelliteView(!satelliteView)}
        />
      )}

      {/* Slide-up sighting detail panel */}
      <SightingPanel
        sighting={selectedSighting}
        isOpen={panelOpen}
        onClose={handleClosePanel}
      />

      {/* Map data loading spinner — small green spinner while fetching */}
      {mapLoading && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[1000]">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      )}

      {/* No results toast — shown when active filters return zero sightings */}
      {noResults && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[1000]">
          <div className="rounded-lg bg-bg-primary border border-border px-4 py-2.5 shadow-lg">
            <p className="text-xs text-text-secondary whitespace-nowrap">
              No sightings match your current filters.
            </p>
          </div>
        </div>
      )}

      {/* Filter drawer */}
      <FilterDrawer
        isOpen={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        filters={filters}
        onApply={handleApplyFilters}
      />
    </div>
  );
}
