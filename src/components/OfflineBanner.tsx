/**
 * OfflineBanner — Shows a banner when the user loses internet connection.
 *
 * Listens to the browser's online/offline events and displays a fixed
 * banner at the top of the screen when offline.
 */

"use client";

import { useState, useEffect } from "react";
import { WifiOff } from "lucide-react";

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    /* Check initial state */
    setIsOffline(!navigator.onLine);

    function handleOffline() {
      setIsOffline(true);
    }

    function handleOnline() {
      setIsOffline(false);
    }

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed top-14 left-0 right-0 z-[60] bg-[#7C2D12] px-4 py-2 text-center">
      <p className="flex items-center justify-center gap-2 text-xs font-medium text-white">
        <WifiOff size={14} strokeWidth={1.5} />
        You are offline. Sighting data requires an internet connection.
      </p>
    </div>
  );
}
