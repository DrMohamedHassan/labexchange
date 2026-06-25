import type { Metadata } from "next";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import "./globals.css";

const siteUrl = "https://interlab-hub.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "InterLab Hub | Global Lab Supplies Marketplace",
    template: "%s | InterLab Hub",
  },
  description:
    "InterLab Hub is a reviewed global marketplace for buying and selling new, unused, and used lab supplies, reagents, consumables, PCR reagents, qPCR reagents, primers, probes, extraction kits, plasticware, equipment, and biotechnology research products.",
  keywords: [
    "InterLab Hub",
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
    "lab equipment marketplace",
    "biotechnology marketplace",
    "agricultural biotechnology supplies",
    "research supplies",
    "surplus lab supplies",
  ],
  authors: [{ name: "InterLab Hub" }],
  creator: "InterLab Hub",
  publisher: "InterLab Hub",
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
    title: "InterLab Hub | Global Lab Supplies Marketplace",
    description:
      "Buy and sell reviewed lab supplies, reagents, consumables, equipment, and biotechnology research products by country.",
    siteName: "InterLab Hub",
    images: [
      {
        url: "/images/hero-lab.png",
        width: 1200,
        height: 630,
        alt: "InterLab Hub laboratory supplies marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "InterLab Hub | Global Lab Supplies Marketplace",
    description:
      "A reviewed global marketplace for new, unused, and used lab supplies.",
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
    name: "InterLab Hub",
    url: siteUrl,
    description:
      "A reviewed marketplace for buying and selling new, unused, and used lab supplies and biotechnology research products.",
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/?search={search_term_string}`,
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