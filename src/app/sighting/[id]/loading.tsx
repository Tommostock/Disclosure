/**
 * Sighting Detail Loading State
 */

import { Skeleton } from "@/components/Skeleton";

export default function SightingLoading() {
  return (
    <div className="px-4 py-4 md:px-6 lg:px-8 max-w-3xl mx-auto">
      <Skeleton className="h-4 w-28 mb-6" />
      <Skeleton className="h-6 w-20 rounded-full mb-3" />
      <Skeleton className="h-4 w-48 mb-2" />
      <Skeleton className="h-7 w-64 mb-2" />
      <Skeleton className="h-4 w-36 mb-4" />
      <div className="border-t border-border my-4" />
      <Skeleton className="h-4 w-32 mb-3" />
      <Skeleton className="h-3 w-full mb-2" />
      <Skeleton className="h-3 w-full mb-2" />
      <Skeleton className="h-3 w-3/4 mb-2" />
      <Skeleton className="h-3 w-full mb-2" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}
