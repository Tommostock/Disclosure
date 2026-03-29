/**
 * ErrorState — Reusable error message component.
 *
 * Displays an error message with an optional retry button.
 * Used when API calls fail or the user is offline.
 */

"use client";

import { WifiOff, AlertCircle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  /** The error message to display */
  message: string;
  /** Whether this is an offline error (shows wifi icon) */
  isOffline?: boolean;
  /** Callback for the retry button */
  onRetry?: () => void;
}

export default function ErrorState({ message, isOffline, onRetry }: ErrorStateProps) {
  const Icon = isOffline ? WifiOff : AlertCircle;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <Icon
        size={32}
        strokeWidth={1.5}
        className="mb-4 text-text-tertiary"
      />
      <p className="text-sm text-text-secondary text-center mb-4 max-w-sm">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-lg border border-border
                     bg-bg-secondary px-4 py-2 text-sm font-medium text-text-primary
                     hover:bg-bg-tertiary transition-colors"
        >
          <RefreshCw size={16} strokeWidth={1.5} />
          Retry
        </button>
      )}
    </div>
  );
}
