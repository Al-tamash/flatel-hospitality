import type { NextConfig } from "next";

/** A custom R2 domain (instead of *.r2.dev) must also be allowed for next/image. */
function customR2Host(): string | null {
  try {
    const host = new URL(process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "").hostname;
    return host && !host.endsWith(".r2.dev") ? host : null;
  } catch {
    return null;
  }
}

const r2Host = customR2Host();

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    qualities: [75, 85, 95, 100],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-f471c3e24db144a6a94c290eececee02.r2.dev",
      },
      {
        protocol: "https",
        hostname: "**.r2.dev",
      },
      ...(r2Host ? [{ protocol: "https" as const, hostname: r2Host }] : []),
    ],
  },
  async redirects() {
    return [
      {
        source: "/rooms/:slug*",
        destination: "/properties/:slug*",
        permanent: true,
      },
      {
        source: "/admi/:path*",
        destination: "/admin/:path*",
        permanent: false,
      },
      {
        source: "/admi",
        destination: "/admin/dashboard",
        permanent: false,
      },
      {
        source: "/admin",
        destination: "/admin/dashboard",
        permanent: false,
      },
      {
        source: "/admin/login",
        destination: "/admin/dashboard",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
