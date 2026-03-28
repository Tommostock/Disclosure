/**
 * Privacy Policy Page — Required for App Store submission.
 */

export default function PrivacyPage() {
  return (
    <div className="px-4 py-6 md:px-6 lg:px-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-text-primary mb-6">Privacy Policy</h1>

      <div className="space-y-4 text-sm leading-relaxed text-text-secondary">
        <p>Last updated: March 2026</p>

        <h2 className="text-lg font-bold text-text-primary pt-4">Overview</h2>
        <p>
          Disclosure is a read-only application that displays publicly available
          UFO sighting data. We take your privacy seriously and have designed the
          app to collect as little data as possible.
        </p>

        <h2 className="text-lg font-bold text-text-primary pt-4">Data Collection</h2>
        <p>
          Disclosure does not collect, store, or transmit any personal data.
          There are no user accounts, no sign-ups, and no forms that collect
          personal information.
        </p>

        <h2 className="text-lg font-bold text-text-primary pt-4">Location Data</h2>
        <p>
          The &ldquo;Near Me&rdquo; feature uses your device&apos;s geolocation to centre the
          map on your current location. This location data is processed entirely
          in your browser and is never stored, transmitted to our servers, or
          shared with any third parties.
        </p>

        <h2 className="text-lg font-bold text-text-primary pt-4">Cookies and Tracking</h2>
        <p>
          Disclosure does not use cookies for tracking purposes. A small amount
          of data may be stored in your browser&apos;s local storage to remember your
          theme preference (light or dark mode). No analytics or tracking services
          are used.
        </p>

        <h2 className="text-lg font-bold text-text-primary pt-4">Third-Party Services</h2>
        <p>
          The app uses OpenStreetMap tiles for the map display and Supabase for
          data hosting. These services may have their own privacy policies.
        </p>

        <h2 className="text-lg font-bold text-text-primary pt-4">Contact</h2>
        <p>
          If you have any questions about this privacy policy, you can reach us
          through the GitHub repository.
        </p>
      </div>
    </div>
  );
}
