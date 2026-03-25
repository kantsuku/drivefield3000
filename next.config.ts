import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["100.116.195.92", "100.116.195.92:3003"],
  distDir: "/tmp/df3000-next",
  experimental: {
    turbopackFileSystemCacheForDev: false,
  },
};

export default nextConfig;
