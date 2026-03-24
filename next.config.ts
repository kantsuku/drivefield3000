import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["100.121.161.76", "100.121.161.76:3000"],
  distDir: "/tmp/df3000-next",
  experimental: {
    turbopackFileSystemCacheForDev: false,
  },
};

export default nextConfig;
