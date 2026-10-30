import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/talents/:path*", destination: "/#public-cible", permanent: true },
      { source: "/entreprises/:path*", destination: "/#public-cible", permanent: true },
      { source: "/opportunites/:path*", destination: "/#tarifs", permanent: true },
      { source: "/pays/:path*", destination: "/#concept", permanent: true },
      { source: "/auth/:path*", destination: "/contact", permanent: true },
      { source: "/dashboard/:path*", destination: "/contact", permanent: true },
      { source: "/company/:path*", destination: "/contact", permanent: true },
      { source: "/admin", destination: "/contact", permanent: true },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;