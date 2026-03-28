/**
 * API Route: /api/sightings/random
 *
 * Returns a single random sighting from the database.
 * Used by the Dashboard "Random Sighting" button.
 */

import { NextResponse } from "next/server";
import { getRandomSighting } from "@/lib/queries";

export async function GET() {
  const sighting = await getRandomSighting();

  if (!sighting) {
    return NextResponse.json({ error: "No sightings found" }, { status: 404 });
  }

  return NextResponse.json(sighting);
}
