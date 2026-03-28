/**
 * API Route: /api/sightings/[id]
 *
 * Fetches a single sighting by its ID.
 * Used by the detail panel and detail page to show full sighting info.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSightingById } from "@/lib/queries";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sightingId = parseInt(id, 10);

  if (isNaN(sightingId)) {
    return NextResponse.json({ error: "Invalid sighting ID" }, { status: 400 });
  }

  const sighting = await getSightingById(sightingId);

  if (!sighting) {
    return NextResponse.json({ error: "Sighting not found" }, { status: 404 });
  }

  return NextResponse.json(sighting);
}
