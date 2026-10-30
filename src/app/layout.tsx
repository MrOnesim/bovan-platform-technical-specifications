import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");

export const metadata: Metadata = {
  ...(siteUrl ? { metadataBase: new URL(siteUrl) } : {}),
  title: {
    default: "OCD — Votre activité mérite d’être vue",
    template: "%s · OCD",
  },
  icons: { icon: [{ url: "/icon.svg", type: "image/svg+xml" }] },
  description:
    "OCD accompagne les entrepreneurs, commerçants, artisans et prestataires dans la présentation de leurs activités en direct sur les réseaux sociaux.",
  keywords: [
    "OCD",
    "promotion commerciale",
    "publicité réseaux sociaux",
    "live shopping",
    "visibilité entrepreneur",
    "entrepreneurs Bénin",
    "marketing digital",
  ],
  openGraph: {
    title: "OCD — Votre activité mérite d’être vue",
    description:
      "Présentez vos produits et services en direct, échangez avec le public et faites découvrir votre activité.",
    siteName: "OCD",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OCD — Votre activité mérite d’être vue",
    description:
      "Présentez vos produits et services en direct et faites découvrir votre activité.",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-[#fbf9f6] text-[#1d1a17] antialiased min-h-screen flex flex-col" style={{ fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[100] focus:rounded-full focus:bg-[#171512] focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white">Aller au contenu principal</a>
        <Navbar />
        <main id="main-content" className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
