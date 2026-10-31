import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "localhost:3000",
    "192.168.18.14",
    "192.168.18.14:3000",
    "bitter-states-push.loca.lt",
    "*.loca.lt",
  ],
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/work/:slug",
        destination: "/work",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
