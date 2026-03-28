/**
 * Terms of Use Page — Required for App Store submission.
 */

export default function TermsPage() {
  return (
    <div className="px-4 py-6 md:px-6 lg:px-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-text-primary mb-6">Terms of Use</h1>

      <div className="space-y-4 text-sm leading-relaxed text-text-secondary">
        <p>Last updated: March 2026</p>

        <h2 className="text-lg font-bold text-text-primary pt-4">Acceptance of Terms</h2>
        <p>
          By accessing and using Disclosure, you accept and agree to be bound by
          these terms. If you do not agree to these terms, please do not use the app.
        </p>

        <h2 className="text-lg font-bold text-text-primary pt-4">Use of Data</h2>
        <p>
          Disclosure provides publicly available UFO sighting data from the
          National UFO Reporting Center (NUFORC) and other public databases for
          informational purposes only. The data is presented as-is with no
          guarantee of accuracy, completeness, or reliability.
        </p>

        <h2 className="text-lg font-bold text-text-primary pt-4">No Affiliation</h2>
        <p>
          Disclosure is not affiliated with, endorsed by, or connected to any
          government agency, military organisation, or official body. The app is
          an independent project that aggregates publicly available data.
        </p>

        <h2 className="text-lg font-bold text-text-primary pt-4">Disclaimer</h2>
        <p>
          The sighting reports displayed are unverified witness accounts. We make
          no claims about the nature, origin, or authenticity of the reported
          sightings. Use of this app and reliance on the data is entirely at
          your own risk.
        </p>

        <h2 className="text-lg font-bold text-text-primary pt-4">Intellectual Property</h2>
        <p>
          The Disclosure app design, code, and branding are the property of the
          developer. The sighting data is sourced from NUFORC and is publicly
          available.
        </p>

        <h2 className="text-lg font-bold text-text-primary pt-4">Changes to Terms</h2>
        <p>
          We reserve the right to update these terms at any time. Changes will be
          reflected on this page with an updated date.
        </p>
      </div>
    </div>
  );
}
