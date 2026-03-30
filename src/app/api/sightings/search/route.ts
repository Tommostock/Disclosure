/**
 * API Route: /api/sightings/search
 *
 * Searches sightings with text search, filters, and pagination.
 * Returns { data, count, page, totalPages }.
 */

import { NextRequest, NextResponse } from "next/server";
import { searchSightings } from "@/lib/queries";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const query = params.get("q") || undefined;
  const shapesParam = params.get("shapes");
  const shapes = shapesParam ? shapesParam.split(",").filter(Boolean) : undefined;
  const country = params.get("country") || undefined;
  const state = params.get("state") || undefined;
  const dateFrom = params.get("dateFrom") || undefined;
  const dateTo = params.get("dateTo") || undefined;
  const sortBy = (params.get("sort") as "newest" | "oldest" | "state") || "newest";
  const page = parseInt(params.get("page") || "1", 10);
  const limit = Math.min(parseInt(params.get("limit") || "25", 10), 50);

  const result = await searchSightings({
    query,
    filters: { shapes, country, state, dateFrom, dateTo },
    sortBy,
    page,
    limit,
  });

  return NextResponse.json({
    data: result.data,
    count: result.count,
    page,
    totalPages: Math.ceil(result.count / limit),
  });
}
