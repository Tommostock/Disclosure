/**
 * Dashboard Tab — Stats and analytics page.
 *
 * Displays:
 * - Hero stat: total sighting count
 * - 5 charts: by shape, over time, top states, time of day, by month
 * - Most recent sighting card
 * - Random sighting button
 *
 * Client component because Recharts requires browser APIs.
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, CartesianGrid,
} from "recharts";
import { Shuffle, Loader2 } from "lucide-react";
import ChartCard from "@/components/ChartCard";
import SightingCard from "@/components/SightingCard";
import { formatNumber, normalizeShape } from "@/lib/utils";
import type { Sighting } from "@/lib/database.types";

/* Month names for the month chart */
const MONTH_NAMES = [
  "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/* Dashboard stats shape */
interface DashboardStats {
  total: number;
  byShape: { shape: string; count: number }[];
  byState: { state: string; count: number }[];
  byYear: { year: number; count: number }[];
  byHour: { hour: number; count: number }[];
  byMonth: { month: number; count: number }[];
  mostRecent: Sighting | null;
}

/* Custom tooltip for charts */
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-lg border border-border bg-bg-primary px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-text-primary">{label}</p>
      <p className="text-accent">{formatNumber(payload[0].value)} sightings</p>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [randomSighting, setRandomSighting] = useState<Sighting | null>(null);
  const [randomLoading, setRandomLoading] = useState(false);

  /* Fetch dashboard stats */
  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/sightings/stats");
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  /* Fetch random sighting */
  const fetchRandom = useCallback(async () => {
    setRandomLoading(true);
    try {
      const response = await fetch("/api/sightings/random");
      if (response.ok) {
        const data = await response.json();
        setRandomSighting(data);
      }
    } catch (error) {
      console.error("Failed to fetch random sighting:", error);
    } finally {
      setRandomLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-7.5rem)] items-center justify-center">
        <Loader2 size={32} className="animate-spin text-accent" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex h-[calc(100vh-7.5rem)] items-center justify-center">
        <p className="text-text-tertiary">Unable to load dashboard data.</p>
      </div>
    );
  }

  /* Prepare chart data */
  const shapeData = stats.byShape.map((d) => ({
    name: normalizeShape(d.shape),
    count: Number(d.count),
  }));

  const yearData = stats.byYear
    .filter((d) => d.year >= 1950)
    .map((d) => ({
      name: d.year.toString(),
      count: Number(d.count),
    }));

  const stateData = stats.byState.map((d) => ({
    name: d.state,
    count: Number(d.count),
  }));

  const hourData = Array.from({ length: 24 }, (_, i) => {
    const match = stats.byHour.find((d) => d.hour === i);
    const label = i === 0 ? "12AM" : i < 12 ? `${i}AM` : i === 12 ? "12PM" : `${i - 12}PM`;
    return { name: label, count: match ? Number(match.count) : 0 };
  });

  const monthData = stats.byMonth.map((d) => ({
    name: MONTH_NAMES[d.month] || d.month.toString(),
    count: Number(d.count),
  }));

  return (
    <div className="px-4 py-4 md:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Hero stat */}
      <div className="mb-6 text-center">
        <p className="text-4xl font-bold text-accent md:text-5xl">
          {formatNumber(stats.total)}
        </p>
        <p className="mt-1 text-sm text-text-secondary">Reported UFO Sightings</p>
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Sightings by Shape */}
        <ChartCard title="Sightings by Shape">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={shapeData} layout="vertical" margin={{ left: 60 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: "var(--text-secondary)" }} width={60} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="#22C55E" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Sightings Over Time */}
        <ChartCard title="Sightings Over Time">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={yearData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: "var(--text-secondary)" }}
                interval={Math.floor(yearData.length / 5)}
              />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#22C55E"
                fill="#22C55E"
                fillOpacity={0.2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Top States */}
        <ChartCard title="Top States">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stateData} layout="vertical" margin={{ left: 30 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "var(--text-secondary)" }} width={30} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="#22C55E" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Time of Day */}
        <ChartCard title="Time of Day">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={hourData}>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 9, fill: "var(--text-secondary)" }}
                interval={2}
              />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="#22C55E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Sightings by Month */}
        <ChartCard title="Sightings by Month">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthData}>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "var(--text-secondary)" }}
              />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="#22C55E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Most Recent Sighting */}
        {stats.mostRecent && (
          <ChartCard title="Most Recent Sighting">
            <SightingCard sighting={stats.mostRecent} />
          </ChartCard>
        )}
      </div>

      {/* Random Sighting */}
      <div className="mt-6">
        <button
          onClick={fetchRandom}
          disabled={randomLoading}
          className="flex w-full items-center justify-center gap-2 rounded-lg
                     bg-accent py-3 text-sm font-semibold text-black
                     hover:bg-accent-hover transition-colors
                     disabled:opacity-50"
        >
          {randomLoading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Shuffle size={18} strokeWidth={1.5} />
          )}
          Random Sighting
        </button>

        {randomSighting && (
          <div className="mt-3">
            <SightingCard sighting={randomSighting} />
          </div>
        )}
      </div>
    </div>
  );
}
