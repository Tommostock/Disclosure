/**
 * Dashboard Loading State — Skeleton placeholders while charts load.
 */

import { Skeleton, ChartCardSkeleton } from "@/components/Skeleton";

export default function DashboardLoading() {
  return (
    <div className="px-4 py-4 md:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Hero stat skeleton */}
      <div className="mb-6 flex flex-col items-center gap-2">
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-4 w-36" />
      </div>

      {/* Chart cards skeleton grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ChartCardSkeleton />
        <ChartCardSkeleton />
        <ChartCardSkeleton />
        <ChartCardSkeleton />
        <ChartCardSkeleton />
        <ChartCardSkeleton />
      </div>
    </div>
  );
}
