/**
 * Search Tab — Filter, search, and browse sightings as a list.
 *
 * Features:
 * - Text search across city, state, and summary
 * - Collapsible filter panel (shape, state, date range)
 * - Sort by newest/oldest/state
 * - Paginated results with "Load More" button
 * - Total result count
 */

"use client";

import { useState, useCallback, useEffect } from "react";
import { Search, SlidersHorizontal, ChevronDown, ChevronUp, Loader2, X } from "lucide-react";
import SightingCard from "@/components/SightingCard";
import { UFO_SHAPES, US_STATES, cn, formatNumber } from "@/lib/utils";
import type { Sighting } from "@/lib/database.types";

export default function SearchPage() {
  /* Search state */
  const [searchText, setSearchText] = useState("");
  const [results, setResults] = useState<Sighting[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  /* Filter state */
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedShapes, setSelectedShapes] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState("");
  const [yearFrom, setYearFrom] = useState("");
  const [yearTo, setYearTo] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "state">("newest");

  const YEARS = Array.from(
    { length: new Date().getFullYear() - 1940 + 1 },
    (_, i) => 1940 + i
  );

  /* Fetch results from the search API */
  const fetchResults = useCallback(
    async (pageNum: number, append: boolean = false) => {
      setLoading(true);
      setHasSearched(true);

      const params = new URLSearchParams();
      if (searchText.trim()) params.set("q", searchText.trim());
      if (selectedShapes.length > 0) params.set("shapes", selectedShapes.join(","));
      if (selectedState) params.set("state", selectedState);
      if (yearFrom) params.set("dateFrom", `${yearFrom}-01-01T00:00:00Z`);
      if (yearTo) params.set("dateTo", `${yearTo}-12-31T23:59:59Z`);
      params.set("sort", sortBy);
      params.set("page", pageNum.toString());
      params.set("limit", "25");

      try {
        const response = await fetch(`/api/sightings/search?${params}`);
        if (response.ok) {
          const data = await response.json();
          setResults((prev) => (append ? [...prev, ...data.data] : data.data));
          setTotalCount(data.count);
          setTotalPages(data.totalPages);
          setPage(pageNum);
        }
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setLoading(false);
      }
    },
    [searchText, selectedShapes, selectedState, yearFrom, yearTo, sortBy]
  );

  /* Debounced search on text or filter change */
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchResults(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [fetchResults]);

  /* Load more results */
  const handleLoadMore = () => {
    if (page < totalPages) {
      fetchResults(page + 1, true);
    }
  };

  /* Toggle shape filter */
  function toggleShape(shape: string) {
    const lower = shape.toLowerCase();
    setSelectedShapes((prev) =>
      prev.includes(lower) ? prev.filter((s) => s !== lower) : [...prev, lower]
    );
  }

  return (
    <div className="px-4 py-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Search bar */}
      <div className="relative mb-4">
        <Search
          size={20}
          strokeWidth={1.5}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary"
        />
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search by city, state, or keyword..."
          className="w-full rounded-lg border border-border-strong bg-bg-tertiary
                     py-3 pl-10 pr-10 text-sm text-text-primary placeholder:text-text-tertiary
                     focus:outline-none focus:ring-2 focus:ring-accent"
        />
        {/* Clear button — appears when text is entered */}
        {searchText && (
          <button
            onClick={() => setSearchText("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary
                       hover:text-text-secondary transition-colors"
            aria-label="Clear search"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        )}
      </div>

      {/* Collapsible filters */}
      <button
        onClick={() => setFiltersOpen(!filtersOpen)}
        className="flex w-full items-center justify-between rounded-lg border border-border
                   bg-bg-secondary px-4 py-2.5 text-sm font-medium text-text-secondary
                   hover:bg-bg-tertiary transition-colors mb-4"
      >
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} strokeWidth={1.5} />
          <span>Filters</span>
          {(selectedShapes.length > 0 || selectedState || yearFrom || yearTo) && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full
                             bg-accent text-xs font-bold text-black">
              {selectedShapes.length + (selectedState ? 1 : 0) + (yearFrom ? 1 : 0) + (yearTo ? 1 : 0)}
            </span>
          )}
        </div>
        {filtersOpen ? (
          <ChevronUp size={16} strokeWidth={1.5} />
        ) : (
          <ChevronDown size={16} strokeWidth={1.5} />
        )}
      </button>

      {filtersOpen && (
        <div className="mb-4 rounded-xl border border-border bg-bg-secondary p-4 space-y-4">
          {/* Shape chips */}
          <div>
            <h3 className="mb-2 text-xs font-semibold text-text-secondary">Shape</h3>
            <div className="flex flex-wrap gap-2">
              {UFO_SHAPES.map((shape) => {
                const isSelected = selectedShapes.includes(shape.toLowerCase());
                return (
                  <button
                    key={shape}
                    onClick={() => toggleShape(shape)}
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                      isSelected
                        ? "bg-accent text-black border border-accent"
                        : "bg-transparent text-text-secondary border border-border-strong hover:border-accent hover:text-accent"
                    )}
                  >
                    {shape}
                  </button>
                );
              })}
            </div>
          </div>

          {/* State + Sort row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <h3 className="mb-2 text-xs font-semibold text-text-secondary">State</h3>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full rounded-lg border border-border-strong bg-bg-tertiary
                           px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="">All States</option>
                {US_STATES.map(({ code, name }) => (
                  <option key={code} value={code}>{name}</option>
                ))}
              </select>
            </div>
            <div>
              <h3 className="mb-2 text-xs font-semibold text-text-secondary">Sort By</h3>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "newest" | "oldest" | "state")}
                className="w-full rounded-lg border border-border-strong bg-bg-tertiary
                           px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="state">State A-Z</option>
              </select>
            </div>
          </div>

          {/* Date range */}
          <div>
            <h3 className="mb-2 text-xs font-semibold text-text-secondary">Date Range</h3>
            <div className="flex items-center gap-2">
              <select
                value={yearFrom}
                onChange={(e) => setYearFrom(e.target.value)}
                className="flex-1 rounded-lg border border-border-strong bg-bg-tertiary
                           px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="">From</option>
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
              <span className="text-xs text-text-tertiary">to</span>
              <select
                value={yearTo}
                onChange={(e) => setYearTo(e.target.value)}
                className="flex-1 rounded-lg border border-border-strong bg-bg-tertiary
                           px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="">To</option>
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Results count */}
      {hasSearched && !loading && (
        <p className="mb-4 text-sm text-text-secondary">
          {formatNumber(totalCount)} result{totalCount !== 1 ? "s" : ""}
        </p>
      )}

      {/* Results list — 2-column grid on tablet+ per design spec */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {results.map((sighting) => (
          <SightingCard key={sighting.id} sighting={sighting} />
        ))}
      </div>

      {/* Loading spinner */}
      {loading && (
        <div className="flex justify-center py-8">
          <Loader2 size={24} className="animate-spin text-accent" />
        </div>
      )}

      {/* Load more button */}
      {!loading && page < totalPages && results.length > 0 && (
        <button
          onClick={handleLoadMore}
          className="mt-4 w-full rounded-lg border border-border bg-bg-secondary
                     py-3 text-sm font-medium text-text-secondary
                     hover:bg-bg-tertiary transition-colors"
        >
          Load More
        </button>
      )}

      {/* Empty state */}
      {hasSearched && !loading && results.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-sm text-text-tertiary">
            No sightings match your search. Try adjusting your filters.
          </p>
        </div>
      )}
    </div>
  );
}
