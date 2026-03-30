"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { MapPin, BarChart3, Calendar, Search, X, ChevronRight } from "lucide-react";

const STORAGE_KEY = "disclosure-tutorial-seen";

const slides = [
  {
    icon: null,
    title: "Welcome to Disclosure",
    description:
      "Explore over 70,000 reported UFO sightings from the NUFORC database, spanning decades and multiple countries.",
  },
  {
    icon: MapPin,
    title: "Interactive Map",
    description:
      "Browse sightings on a clustered map. Tap clusters to zoom in, use filters for shape, country, and date range. Toggle heatmap or satellite view.",
  },
  {
    icon: BarChart3,
    title: "Dashboard",
    description:
      "View statistics at a glance: sightings by shape, trends over time, top regions, time of day patterns, and monthly breakdowns.",
  },
  {
    icon: Calendar,
    title: "On This Day",
    description:
      "See sightings reported on today's date across all years. A daily digest of historical encounters from this very day.",
  },
  {
    icon: Search,
    title: "Search & Filter",
    description:
      "Search by city, keyword, or region. Filter by country, shape, and date range. Sort results and explore detailed witness accounts.",
  },
];

export default function TutorialOverlay() {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);
  const [swiping, setSwiping] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY);
    if (seen !== "true") {
      setVisible(true);
    }
    setMounted(true);
  }, []);

  const dismiss = useCallback(() => {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, "true");
  }, []);

  const next = useCallback(() => {
    if (current < slides.length - 1) {
      setCurrent((c) => c + 1);
    } else {
      dismiss();
    }
  }, [current, dismiss]);

  const prev = useCallback(() => {
    if (current > 0) setCurrent((c) => c - 1);
  }, [current]);

  /* Touch swipe handlers */
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
    setSwiping(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  }, []);

  const handleTouchEnd = useCallback(() => {
    setSwiping(false);
    if (touchDeltaX.current < -50) next();
    else if (touchDeltaX.current > 50) prev();
  }, [next, prev]);

  if (!mounted || !visible) return null;

  const slide = slides[current];
  const Icon = slide.icon;
  const isLast = current === slides.length - 1;

  return (
    <div
      className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/70"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Skip button */}
      <button
        onClick={dismiss}
        className="absolute top-5 right-5 flex items-center gap-1 rounded-full
                   bg-white/10 px-3 py-1.5 text-xs font-medium text-white/70
                   hover:bg-white/20 transition-colors"
      >
        Skip
        <X size={14} strokeWidth={2} />
      </button>

      {/* Card */}
      <div
        className="mx-6 w-full max-w-sm rounded-2xl bg-bg-primary p-8 text-center shadow-2xl"
        style={{ transition: swiping ? "none" : "transform 300ms ease" }}
      >
        {/* Icon */}
        {Icon ? (
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-accent/15">
            <Icon size={32} strokeWidth={1.5} className="text-accent" />
          </div>
        ) : (
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-accent/15">
            <span className="text-3xl font-bold text-accent">D</span>
          </div>
        )}

        {/* Title */}
        <h2 className="mb-3 text-xl font-bold text-text-primary">{slide.title}</h2>

        {/* Description */}
        <p className="mb-8 text-sm leading-relaxed text-text-secondary">
          {slide.description}
        </p>

        {/* Dot indicators */}
        <div className="mb-6 flex items-center justify-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all duration-200 ${
                i === current ? "w-6 bg-accent" : "w-2 bg-text-tertiary/40"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Action button */}
        <button
          onClick={next}
          className="flex w-full items-center justify-center gap-2 rounded-lg
                     bg-accent py-3 text-sm font-semibold text-black
                     hover:bg-accent-hover transition-colors"
        >
          {isLast ? "Get Started" : "Next"}
          {!isLast && <ChevronRight size={16} strokeWidth={2} />}
        </button>
      </div>
    </div>
  );
}
