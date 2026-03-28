/**
 * About Page — Information about the Disclosure app.
 */

export default function AboutPage() {
  return (
    <div className="px-4 py-6 md:px-6 lg:px-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-text-primary mb-6">About Disclosure</h1>

      <div className="space-y-4 text-sm leading-relaxed text-text-secondary">
        <p>
          Disclosure is a professional, data-driven UFO sighting explorer.
          It visualises tens of thousands of reported UFO/UAP sightings from the
          NUFORC (National UFO Reporting Center) database on an interactive map
          with advanced filtering, analytics, and discovery features.
        </p>

        <h2 className="text-lg font-bold text-text-primary pt-4">Data Source</h2>
        <p>
          All sighting data is sourced from the National UFO Reporting Center (NUFORC),
          a non-profit organisation that has been collecting UFO reports from the
          public since 1974. NUFORC data is publicly available and has been used
          in numerous academic studies and media reports.
        </p>

        <h2 className="text-lg font-bold text-text-primary pt-4">Disclaimer</h2>
        <p>
          The sighting reports displayed in this app are unverified witness accounts
          submitted to NUFORC. Disclosure does not make any claims about the nature,
          origin, or authenticity of the reported sightings. The data is presented
          for informational and research purposes only.
        </p>

        <h2 className="text-lg font-bold text-text-primary pt-4">Credits</h2>
        <p>
          Data: National UFO Reporting Center (NUFORC)
        </p>
        <p>
          Built with Next.js, Supabase, Leaflet, and Recharts.
        </p>

        <p className="text-xs text-text-tertiary pt-6">Version 1.0.0</p>
      </div>
    </div>
  );
}
