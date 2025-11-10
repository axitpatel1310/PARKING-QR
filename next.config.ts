// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true, // optional, remove once clean
  },
  // (no 'eslint' key here on Next 16)
};

export default nextConfig;
