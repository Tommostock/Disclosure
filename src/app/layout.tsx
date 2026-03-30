/**
 * Root Layout — The top-level layout for the entire app.
 *
 * This component:
 * 1. Loads the Space Grotesk font from Google Fonts
 * 2. Sets up metadata (title, description, theme color)
 * 3. Renders the Header at the top and BottomNav at the bottom
 * 4. The main content area sits between header and nav
 * 5. suppressHydrationWarning on <html> prevents theme mismatch warnings
 */

import type { Metadata, Viewport } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import OfflineBanner from "@/components/OfflineBanner";
import TutorialOverlay from "@/components/TutorialOverlay";

/* Load Space Grotesk — the only font used in the app */
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

/* App metadata for SEO and PWA */
export const metadata: Metadata = {
  title: "Disclosure",
  description: "Explore the unexplained. A professional UFO sighting explorer featuring 148,000+ reported sightings from NUFORC.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Disclosure",
  },
};

/* Viewport settings including theme color for the browser chrome */
export const viewport: Viewport = {
  themeColor: "#22C55E",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${spaceGrotesk.variable} font-sans antialiased`}>
        {/* Fixed header at top */}
        <Header />

        {/* Offline detection banner — shows below header when offline */}
        <OfflineBanner />

        {/* Main content area — padded to avoid overlap with header and nav */}
        <main className="pt-14 pb-16 min-h-screen">
          {children}
        </main>

        {/* Fixed bottom navigation */}
        <BottomNav />

        {/* First-visit tutorial overlay */}
        <TutorialOverlay />

        {/* Register service worker for PWA */}
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
