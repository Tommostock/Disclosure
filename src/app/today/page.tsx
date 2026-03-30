/**
 * Today Tab — "On This Day" daily digest.
 *
 * Shows sightings that occurred on today's date (same month and day)
 * across all years in the database. Sorted by year, most recent first.
 *
 * This is a server component that fetches data at request time.
 */

import { getSightingsOnThisDay } from "@/lib/queries";
import SightingCard from "@/components/SightingCard";

export const revalidate = 86400; /* Revalidate once per day */

export default async function TodayPage() {
  const now = new Date();
  const month = now.getMonth() + 1; /* JavaScript months are 0-indexed */
  const day = now.getDate();

  /* Format the date nicely for the header */
  const dateLabel = now.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });

  const sightings = await getSightingsOnThisDay(month, day);

  return (
    <div className="px-4 py-4 md:px-6 lg:px-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">On This Day</h1>
        <p className="text-lg text-accent font-semibold mt-1">{dateLabel}</p>
        <p className="text-sm text-text-secondary mt-1">
          {sightings.length > 0
            ? `${sightings.length} sighting${sightings.length !== 1 ? "s" : ""} reported on this date across all years`
            : ""}
        </p>
      </div>

      {/* Sighting list */}
      {sightings.length > 0 ? (
        <div className="space-y-3">
          {sightings.map((sighting) => (
            <SightingCard
              key={sighting.id}
              sighting={sighting}
              showYear={true}
            />
          ))}
        </div>
      ) : (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-sm text-text-tertiary text-center">
            No sightings reported on this date.
            <br />
            Check back tomorrow.
          </p>
        </div>
      )}
    </div>
  );
}
