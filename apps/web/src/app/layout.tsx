import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";

const ROOT_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://undoverse.in";

export const metadata: Metadata = {
  metadataBase: new URL(ROOT_URL),
  title: {
    default: "undoverse — where Kerala builds the internet",
    template: "%s · undoverse",
  },
  description:
    "The aggregator and developer-creator hub for the undo ecosystem — currentundo, kuzhiundo, damundo and everything Kerala ships next. Built by 72BPM, Trivandrum.",
  keywords: [
    "undoverse",
    "Kerala developers",
    "Trivandrum",
    "72BPM",
    "indie hackers India",
    "currentundo",
    "kuzhiundo",
    "damundo",
  ],
  authors: [{ name: "72BPM", url: "https://72bpm.com" }],
  openGraph: {
    title: "undoverse — where Kerala builds the internet",
    description:
      "Discover the undo ecosystem, back the builders, and ship your own undo.",
    url: ROOT_URL,
    siteName: "undoverse",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "undoverse — where Kerala builds the internet",
    description: "The developer-creator hub for the undo ecosystem.",
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0b1120",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex min-h-dvh flex-col">
        {/* Skip link for keyboard / screen-reader users */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-brand focus:px-4 focus:py-2 focus:text-brand-fg"
        >
          Skip to content
        </a>
        <Nav />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
