/**
 * ChartCard — Wrapper component for dashboard chart sections.
 * Provides consistent card styling with a title.
 */

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
}

export default function ChartCard({ title, children }: ChartCardProps) {
  return (
    <div className="rounded-xl border border-border bg-bg-secondary p-4 md:p-5">
      <h3 className="mb-4 text-base font-bold text-text-primary">{title}</h3>
      {children}
    </div>
  );
}
