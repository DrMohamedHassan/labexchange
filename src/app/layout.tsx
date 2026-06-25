import type { Metadata } from "next";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://labexchange.vercel.app"),
  title: {
    default: "LabExchange | Lab Supplies Marketplace",
    template: "%s | LabExchange",
  },
  description:
    "LabExchange is a reviewed marketplace for buying and selling new, unused, and used lab supplies, reagents, consumables, PCR reagents, qPCR reagents, primers, probes, extraction kits, plasticware, and biotechnology research products.",
  keywords: [
    "lab supplies marketplace",
    "laboratory supplies",
    "used lab supplies",
    "unused lab reagents",
    "PCR reagents",
    "qPCR reagents",
    "primers and probes",
    "DNA RNA extraction kits",
    "electrophoresis consumables",
    "cell culture supplies",
    "immunology reagents",
    "protein analysis supplies",
    "lab plasticware",
    "biotechnology marketplace",
    "agricultural biotechnology supplies",
    "research supplies",
    "surplus lab supplies",
  ],
  authors: [{ name: "LabExchange" }],
  creator: "LabExchange",
  publisher: "LabExchange",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    title: "LabExchange | Lab Supplies Marketplace",
    description:
      "Buy and sell reviewed lab supplies, reagents, consumables, and biotechnology research products.",
    siteName: "LabExchange",
    images: [
      {
        url: "/images/hero-lab.png",
        width: 1200,
        height: 630,
        alt: "LabExchange laboratory supplies marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LabExchange | Lab Supplies Marketplace",
    description:
      "A reviewed marketplace for new, unused, and used lab supplies.",
    images: ["/images/hero-lab.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "LabExchange",
    url: "https://labexchange.vercel.app",
    description:
      "A reviewed marketplace for buying and selling new, unused, and used lab supplies and biotechnology research products.",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://labexchange.vercel.app/?search={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="en">
      <body>
        <AnalyticsTracker />

        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />

        {children}
      </body>
    </html>
  );
}