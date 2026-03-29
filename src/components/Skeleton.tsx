/**
 * Skeleton — Reusable skeleton loading placeholder.
 *
 * Shows a pulsing grey rectangle that indicates content is loading.
 * Used across dashboard charts, search results, and today page.
 */

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-bg-tertiary",
        className
      )}
    />
  );
}

/** Skeleton card that mimics a SightingCard */
export function SightingCardSkeleton() {
  return (
    <div className="card-surface rounded-xl border border-border bg-bg-secondary p-4">
      <div className="flex items-start gap-3">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      </div>
    </div>
  );
}

/** Skeleton chart card that mimics a ChartCard */
export function ChartCardSkeleton() {
  return (
    <div className="card-surface rounded-xl border border-border bg-bg-secondary p-4 md:p-5">
      <Skeleton className="mb-4 h-5 w-36" />
      <Skeleton className="h-48 w-full" />
    </div>
  );
}
