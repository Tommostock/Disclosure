/**
 * FilterDrawer — Slide-up drawer for filtering map sightings.
 *
 * Sections:
 * - Shape: Multi-select chips (tap to toggle)
 * - State: Searchable dropdown
 * - Date Range: Start year and end year dropdowns
 *
 * Footer: "Apply Filters" button and "Clear All" link.
 */

"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { UFO_SHAPES, US_STATES, cn } from "@/lib/utils";
import type { SightingFilters } from "@/lib/queries";

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: SightingFilters;
  onApply: (filters: SightingFilters) => void;
}

/* Year range for the date filter */
const START_YEAR = 1940;
const END_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: END_YEAR - START_YEAR + 1 }, (_, i) => START_YEAR + i);

export default function FilterDrawer({
  isOpen,
  onClose,
  filters,
  onApply,
}: FilterDrawerProps) {
  /* Local state for filters (applied on "Apply" click) */
  const [selectedShapes, setSelectedShapes] = useState<string[]>(filters.shapes || []);
  const [selectedState, setSelectedState] = useState<string>(filters.state || "");
  const [yearFrom, setYearFrom] = useState<string>(
    filters.dateFrom ? new Date(filters.dateFrom).getFullYear().toString() : ""
  );
  const [yearTo, setYearTo] = useState<string>(
    filters.dateTo ? new Date(filters.dateTo).getFullYear().toString() : ""
  );

  /* Sync local state when drawer opens */
  useEffect(() => {
    if (isOpen) {
      setSelectedShapes(filters.shapes || []);
      setSelectedState(filters.state || "");
      setYearFrom(filters.dateFrom ? new Date(filters.dateFrom).getFullYear().toString() : "");
      setYearTo(filters.dateTo ? new Date(filters.dateTo).getFullYear().toString() : "");
    }
  }, [isOpen, filters]);

  /* Toggle a shape chip on/off */
  function toggleShape(shape: string) {
    const lower = shape.toLowerCase();
    setSelectedShapes((prev) =>
      prev.includes(lower) ? prev.filter((s) => s !== lower) : [...prev, lower]
    );
  }

  /* Apply the current filter state */
  function handleApply() {
    onApply({
      shapes: selectedShapes.length > 0 ? selectedShapes : undefined,
      state: selectedState || undefined,
      dateFrom: yearFrom ? `${yearFrom}-01-01T00:00:00Z` : undefined,
      dateTo: yearTo ? `${yearTo}-12-31T23:59:59Z` : undefined,
    });
  }

  /* Clear all filters */
  function handleClear() {
    setSelectedShapes([]);
    setSelectedState("");
    setYearFrom("");
    setYearTo("");
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="absolute inset-0 z-[1003] bg-black/30"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-[1004] max-h-[75vh]
                     rounded-t-2xl bg-bg-primary shadow-2xl
                     transition-transform duration-250 ease-out
                     ${isOpen ? "translate-y-0" : "translate-y-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-border">
          <h2 className="text-lg font-bold text-text-primary">Filters</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full
                       text-text-tertiary hover:bg-bg-tertiary transition-colors"
            aria-label="Close filters"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto px-5 py-4 max-h-[calc(75vh-8rem)]">
          {/* Shape filter */}
          <div className="mb-6">
            <h3 className="mb-3 text-sm font-semibold text-text-secondary">Shape</h3>
            <div className="flex flex-wrap gap-2">
              {UFO_SHAPES.map((shape) => {
                const isSelected = selectedShapes.includes(shape.toLowerCase());
                return (
                  <button
                    key={shape}
                    onClick={() => toggleShape(shape)}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                      isSelected
                        ? "bg-accent text-black"
                        : "bg-bg-tertiary text-text-secondary hover:bg-border"
                    )}
                  >
                    {shape}
                  </button>
                );
              })}
            </div>
          </div>

          {/* State filter */}
          <div className="mb-6">
            <h3 className="mb-3 text-sm font-semibold text-text-secondary">State</h3>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full rounded-lg border border-border-strong bg-bg-tertiary
                         px-3 py-2.5 text-sm text-text-primary
                         focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="">All States</option>
              {US_STATES.map(({ code, name }) => (
                <option key={code} value={code}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* Date range filter */}
          <div className="mb-6">
            <h3 className="mb-3 text-sm font-semibold text-text-secondary">Date Range</h3>
            <div className="flex items-center gap-3">
              <select
                value={yearFrom}
                onChange={(e) => setYearFrom(e.target.value)}
                className="flex-1 rounded-lg border border-border-strong bg-bg-tertiary
                           px-3 py-2.5 text-sm text-text-primary
                           focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="">From</option>
                {YEARS.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <span className="text-text-tertiary">to</span>
              <select
                value={yearTo}
                onChange={(e) => setYearTo(e.target.value)}
                className="flex-1 rounded-lg border border-border-strong bg-bg-tertiary
                           px-3 py-2.5 text-sm text-text-primary
                           focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="">To</option>
                {YEARS.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Footer with Apply and Clear buttons */}
        <div className="flex items-center justify-between border-t border-border px-5 py-4">
          <button
            onClick={handleClear}
            className="text-sm font-medium text-text-secondary hover:text-text-primary
                       transition-colors"
          >
            Clear All
          </button>
          <button
            onClick={handleApply}
            className="rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-black
                       hover:bg-accent-hover transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </>
  );
}
