/**
 * API Route: /api/sightings/stats
 *
 * Returns aggregated statistics for the dashboard charts.
 * Uses Postgres RPC functions for efficient GROUP BY queries
 * instead of loading all rows to the client.
 */

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  /* Run all aggregation queries in parallel for speed */
  const [
    totalResult,
    shapesResult,
    statesResult,
    yearsResult,
    hoursResult,
    monthsResult,
    recentResult,
  ] = await Promise.all([
    /* Total count */
    supabase.from("sightings").select("*", { count: "exact", head: true }),

    /* Top 10 shapes via Postgres function */
    supabase.rpc("get_sightings_by_shape"),

    /* Top 15 states via Postgres function */
    supabase.rpc("get_sightings_by_state"),

    /* Sightings by year via Postgres function */
    supabase.rpc("get_sightings_by_year"),

    /* Sightings by hour of day via Postgres function */
    supabase.rpc("get_sightings_by_hour"),

    /* Sightings by month via Postgres function */
    supabase.rpc("get_sightings_by_month"),

    /* Most recent sighting */
    supabase
      .from("sightings")
      .select("*")
      .order("date_time", { ascending: false, nullsFirst: false })
      .limit(1)
      .single(),
  ]);

  return NextResponse.json({
    total: totalResult.count || 0,
    byShape: shapesResult.data || [],
    byState: statesResult.data || [],
    byYear: yearsResult.data || [],
    byHour: hoursResult.data || [],
    byMonth: monthsResult.data || [],
    mostRecent: recentResult.data,
  });
}
