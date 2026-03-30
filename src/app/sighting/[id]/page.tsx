/**
 * Sighting Detail Page — Full-page view of a single sighting.
 *
 * Accessed from Search results or On This Day cards.
 * Shows all details including the full witness description.
 * Has a back button to return to the previous page.
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import MiniMapTile from "@/components/MiniMapTile";
import { getSightingById } from "@/lib/queries";
import { formatDateTime, normalizeShape, getRegionName, getCountryName, toTitleCase } from "@/lib/utils";

interface SightingDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function SightingDetailPage({ params }: SightingDetailPageProps) {
  const { id } = await params;
  const sightingId = parseInt(id, 10);

  if (isNaN(sightingId)) {
    notFound();
  }

  const sighting = await getSightingById(sightingId);

  if (!sighting) {
    notFound();
  }

  const regionName = sighting.state ? getRegionName(sighting.state) : null;
  const countryName = sighting.country && sighting.country !== "US" ? getCountryName(sighting.country) : null;
  const location = [toTitleCase(sighting.city), regionName, countryName].filter(Boolean).join(", ");

  return (
    <div className="px-4 py-4 md:px-6 lg:px-8 max-w-3xl mx-auto">
      {/* Back button */}
      <Link
        href="/search"
        className="inline-flex items-center gap-1.5 text-sm text-text-secondary
                   hover:text-text-primary transition-colors mb-6"
      >
        <ArrowLeft size={16} strokeWidth={1.5} />
        Back to search
      </Link>

      {/* Shape badge */}
      <div className="mb-3">
        <span className="inline-block rounded-full bg-accent/15 px-3 py-1
                         text-sm font-semibold text-accent">
          {normalizeShape(sighting.shape)}
        </span>
      </div>

      {/* Date and time */}
      {sighting.date_time && (
        <p className="text-sm text-text-secondary mb-2">
          {formatDateTime(sighting.date_time)}
        </p>
      )}

      {/* Location */}
      <h1 className="text-2xl font-bold text-text-primary mb-2">
        {location || "Unknown Location"}
      </h1>

      {/* Duration */}
      {sighting.duration && (
        <p className="text-sm text-text-secondary mb-4">
          Duration: {sighting.duration}
        </p>
      )}

      {/* Divider */}
      <hr className="border-border mb-4" />

      {/* Witness Account */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">
          Witness Account
        </h2>
        <p className="text-sm leading-relaxed text-text-primary whitespace-pre-line">
          {sighting.description || sighting.summary || "No description available."}
        </p>
      </div>

      {/* Source */}
      <p className="text-xs text-text-tertiary">
        Source:{" "}
        <a
          href="https://nuforc.org"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-text-secondary transition-colors"
        >
          {sighting.source || "NUFORC"}
        </a>
      </p>

      {/* Mini map preview + View on Map link */}
      {sighting.latitude && sighting.longitude && (
        <div className="mt-4">
          <Link
            href={`/?lat=${sighting.latitude}&lng=${sighting.longitude}&zoom=14`}
            className="block overflow-hidden rounded-xl border border-border mb-3"
          >
            {/* Static map image from OpenStreetMap via a tile server */}
            {/* Uses an iframe with a minimal Leaflet map at the sighting location */}
            <MiniMapTile latitude={sighting.latitude} longitude={sighting.longitude} />
          </Link>
          <Link
            href={`/?lat=${sighting.latitude}&lng=${sighting.longitude}&zoom=14`}
            className="inline-flex items-center gap-2 rounded-lg bg-accent
                       px-4 py-2.5 text-sm font-semibold text-black
                       hover:bg-accent-hover transition-colors"
          >
            View on Map
          </Link>
        </div>
      )}
    </div>
  );
}
