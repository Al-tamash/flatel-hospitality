import type { NextConfig } from "next";

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
