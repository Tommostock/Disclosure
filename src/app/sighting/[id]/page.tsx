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
import { getSightingById } from "@/lib/queries";
import { formatDateTime, normalizeShape, getStateName } from "@/lib/utils";

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

  const stateName = sighting.state ? getStateName(sighting.state) : null;
  const location = [sighting.city, stateName].filter(Boolean).join(", ");

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
        Source: {sighting.source || "NUFORC"}
      </p>

      {/* View on map link */}
      {sighting.latitude && sighting.longitude && (
        <Link
          href={`/?lat=${sighting.latitude}&lng=${sighting.longitude}&zoom=14`}
          className="inline-flex items-center gap-2 mt-4 rounded-lg bg-accent
                     px-4 py-2.5 text-sm font-semibold text-black
                     hover:bg-accent-hover transition-colors"
        >
          View on Map
        </Link>
      )}
    </div>
  );
}
