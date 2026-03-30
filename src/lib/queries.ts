/**
 * Supabase Query Functions — All data fetching logic lives here.
 *
 * These functions are used by both server components and API routes.
 * All queries use the Supabase client with RLS (read-only).
 */

import { supabase } from "./supabase";
import type { Sighting } from "./database.types";

/* ---- Types for query parameters ---- */

/** Filters that can be applied to sighting queries */
export interface SightingFilters {
  shapes?: string[];
  country?: string;
  state?: string;
  dateFrom?: string;
  dateTo?: string;
}

/** Bounding box for viewport-based map queries */
export interface BoundingBox {
  north: number;
  south: number;
  east: number;
  west: number;
}

/** A lightweight sighting point for map markers */
export interface MapPoint {
  id: number;
  latitude: number;
  longitude: number;
  shape: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  date_time: string | null;
}

/* ---- Map Queries ---- */

/**
 * Fetches sightings within a map viewport bounding box.
 * Returns lightweight points (id, lat, lng, shape, city, state, date)
 * to minimize data transfer. Limited to 5000 points max.
 */
export async function getSightingsInViewport(
  bounds: BoundingBox,
  filters?: SightingFilters,
  limit: number = 5000
): Promise<MapPoint[]> {
  let query = supabase
    .from("sightings")
    .select("id, latitude, longitude, shape, city, state, country, date_time")
    .gte("latitude", bounds.south)
    .lte("latitude", bounds.north)
    .gte("longitude", bounds.west)
    .lte("longitude", bounds.east)
    .not("latitude", "is", null)
    .not("longitude", "is", null)
    .limit(limit);

  /* Apply optional filters */
  if (filters?.shapes && filters.shapes.length > 0) {
    query = query.in("shape", filters.shapes.map((s) => s.toLowerCase()));
  }
  if (filters?.country) {
    query = query.eq("country", filters.country.toUpperCase());
  }
  if (filters?.state) {
    query = query.eq("state", filters.state.toUpperCase());
  }
  if (filters?.dateFrom) {
    query = query.gte("date_time", filters.dateFrom);
  }
  if (filters?.dateTo) {
    query = query.lte("date_time", filters.dateTo);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching viewport sightings:", error);
    return [];
  }

  return (data || []) as MapPoint[];
}

/* ---- Single Sighting ---- */

/**
 * Fetches a single sighting by ID with all details.
 */
export async function getSightingById(id: number): Promise<Sighting | null> {
  const { data, error } = await supabase
    .from("sightings")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching sighting:", error);
    return null;
  }

  return data;
}

/* ---- Search Queries ---- */

/**
 * Searches sightings with text search and filters.
 * Returns paginated results with total count.
 */
export async function searchSightings(params: {
  query?: string;
  filters?: SightingFilters;
  sortBy?: "newest" | "oldest" | "state";
  page?: number;
  limit?: number;
}): Promise<{ data: Sighting[]; count: number }> {
  const { query: searchText, filters, sortBy = "newest", page = 1, limit = 25 } = params;
  const offset = (page - 1) * limit;

  let dbQuery = supabase
    .from("sightings")
    .select("*", { count: "exact" });

  /* Text search across city, state, summary */
  if (searchText && searchText.trim()) {
    const term = `%${searchText.trim()}%`;
    dbQuery = dbQuery.or(`city.ilike.${term},state.ilike.${term},summary.ilike.${term}`);
  }

  /* Apply filters */
  if (filters?.shapes && filters.shapes.length > 0) {
    dbQuery = dbQuery.in("shape", filters.shapes.map((s) => s.toLowerCase()));
  }
  if (filters?.country) {
    dbQuery = dbQuery.eq("country", filters.country.toUpperCase());
  }
  if (filters?.state) {
    dbQuery = dbQuery.eq("state", filters.state.toUpperCase());
  }
  if (filters?.dateFrom) {
    dbQuery = dbQuery.gte("date_time", filters.dateFrom);
  }
  if (filters?.dateTo) {
    dbQuery = dbQuery.lte("date_time", filters.dateTo);
  }

  /* Sorting */
  switch (sortBy) {
    case "oldest":
      dbQuery = dbQuery.order("date_time", { ascending: true, nullsFirst: false });
      break;
    case "state":
      dbQuery = dbQuery.order("state", { ascending: true }).order("date_time", { ascending: false });
      break;
    case "newest":
    default:
      dbQuery = dbQuery.order("date_time", { ascending: false, nullsFirst: false });
      break;
  }

  /* Pagination */
  dbQuery = dbQuery.range(offset, offset + limit - 1);

  const { data, error, count } = await dbQuery;

  if (error) {
    console.error("Error searching sightings:", error);
    return { data: [], count: 0 };
  }

  return { data: data || [], count: count || 0 };
}

/* ---- Today ("On This Day") Queries ---- */

/**
 * Fetches sightings that occurred on a specific month and day across all years.
 * Uses a custom Postgres function for efficient querying.
 */
export async function getSightingsOnThisDay(
  month: number,
  day: number,
  limit: number = 50
): Promise<Sighting[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.rpc as any)("get_sightings_on_this_day", {
    target_month: month,
    target_day: day,
    max_results: limit,
  });

  if (error) {
    console.error("Error fetching On This Day sightings:", error);
    return [];
  }

  return (data as Sighting[]) || [];
}

/* ---- Dashboard Aggregation Queries ---- */

/**
 * Gets the total count of all sightings.
 */
export async function getTotalCount(): Promise<number> {
  const { count, error } = await supabase
    .from("sightings")
    .select("*", { count: "exact", head: true });

  if (error) {
    console.error("Error fetching total count:", error);
    return 0;
  }

  return count || 0;
}

/**
 * Gets sighting counts grouped by shape (top 10).
 */
export async function getSightingsByShape(): Promise<{ shape: string; count: number }[]> {
  const { data, error } = await supabase
    .rpc("sighting_month", { ts: new Date().toISOString() });
  void data; void error;

  /* Supabase JS doesn't support GROUP BY directly, so we use an RPC or raw query.
     We'll use execute_sql for aggregation via the API route instead.
     For now, fetch from the API route. */

  return [];
}

/**
 * Gets the most recent sighting in the database.
 */
export async function getMostRecentSighting(): Promise<Sighting | null> {
  const { data, error } = await supabase
    .from("sightings")
    .select("*")
    .order("date_time", { ascending: false, nullsFirst: false })
    .limit(1)
    .single();

  if (error) {
    console.error("Error fetching most recent sighting:", error);
    return null;
  }

  return data;
}

/**
 * Gets a random sighting from the database.
 * Uses a random offset approach (faster than ORDER BY RANDOM()).
 */
export async function getRandomSighting(): Promise<Sighting | null> {
  /* First get the total count */
  const { count } = await supabase
    .from("sightings")
    .select("*", { count: "exact", head: true });

  if (!count || count === 0) return null;

  /* Pick a random offset */
  const randomOffset = Math.floor(Math.random() * count);

  const { data, error } = await supabase
    .from("sightings")
    .select("*")
    .range(randomOffset, randomOffset)
    .limit(1)
    .single();

  if (error) {
    console.error("Error fetching random sighting:", error);
    return null;
  }

  return data;
}
