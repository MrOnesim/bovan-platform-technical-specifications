import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getCurrentUser } from "@/lib/auth";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://bovan.africa";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "OCD — Les opportunités, c'est dehors.",
    template: "%s · OCD",
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon.png" }],
  },
  description:
    "Plateforme panafricaine qui connecte les talents africains aux entreprises du continent et du monde entier.",
  keywords: [
    "OCD",
    "talents africains",
    "opportunités",
    "emploi Afrique",
    "candidature spontanée",
    "recrutement",
  ],
  openGraph: {
    title: "OCD — Les opportunités, c'est dehors.",
    description:
      "Les talents africains se rendent visibles. Les entreprises viennent les chercher.",
    url: siteUrl,
    siteName: "OCD",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OCD — Les opportunités, c'est dehors.",
    description:
      "Les talents africains se rendent visibles. Les entreprises viennent les chercher.",
  },
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await getCurrentUser();
  return (
    <html lang="fr" className={inter.variable}>
      <body
        className="bg-[#fafafa] text-[#0a0a0a] antialiased min-h-screen flex flex-col"
        style={{ fontFamily: "var(--font-inter), Inter, system-ui, sans-serif" }}
      >
        <Navbar session={session} />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
