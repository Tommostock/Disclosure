/**
 * Map Tab (Home Page) — The default view when opening the app.
 *
 * Uses a client component wrapper because next/dynamic with ssr: false
 * requires a client component context.
 */

"use client";

import dynamic from "next/dynamic";

/* Dynamic import with SSR disabled — Leaflet needs the browser window */
const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[calc(100vh-7.5rem)] items-center justify-center bg-bg-primary">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
    </div>
  ),
});

export default function MapPage() {
  return <Map />;
}
