/**
 * API Route: /api/sightings
 *
 * Fetches sightings within a map viewport bounding box.
 * Used by the map component to load markers for the visible area.
 *
 * Query params:
 *   - north, south, east, west: bounding box coordinates (required)
 *   - shapes: comma-separated shape filter (optional)
 *   - state: state abbreviation filter (optional)
 *   - dateFrom, dateTo: ISO date strings for date range filter (optional)
 */

import { NextRequest, NextResponse } from "next/server";
import { getSightingsInViewport } from "@/lib/queries";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  /* Parse bounding box (required) */
  const north = parseFloat(params.get("north") || "");
  const south = parseFloat(params.get("south") || "");
  const east = parseFloat(params.get("east") || "");
  const west = parseFloat(params.get("west") || "");

  if (isNaN(north) || isNaN(south) || isNaN(east) || isNaN(west)) {
    return NextResponse.json(
      { error: "Missing or invalid bounding box parameters (north, south, east, west)" },
      { status: 400 }
    );
  }

  /* Parse optional filters */
  const shapesParam = params.get("shapes");
  const shapes = shapesParam ? shapesParam.split(",").filter(Boolean) : undefined;
  const country = params.get("country") || undefined;
  const state = params.get("state") || undefined;
  const dateFrom = params.get("dateFrom") || undefined;
  const dateTo = params.get("dateTo") || undefined;

  const data = await getSightingsInViewport(
    { north, south, east, west },
    { shapes, country, state, dateFrom, dateTo }
  );

  return NextResponse.json(data);
}
