/**
 * Today Loading State — Skeleton placeholders while On This Day data loads.
 */

import { Skeleton, SightingCardSkeleton } from "@/components/Skeleton";

export default function TodayLoading() {
  return (
    <div className="px-4 py-4 md:px-6 lg:px-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <Skeleton className="h-8 w-40 mb-2" />
        <Skeleton className="h-6 w-28 mb-1" />
        <Skeleton className="h-4 w-56" />
      </div>
      <div className="space-y-3">
        <SightingCardSkeleton />
        <SightingCardSkeleton />
        <SightingCardSkeleton />
        <SightingCardSkeleton />
      </div>
    </div>
  );
}
