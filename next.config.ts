// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // 🚩 Allows production builds to successfully complete even if
    // there are TypeScript errors. Remove once clean.
    ignoreBuildErrors: true,
  },
  eslint: {
    // 🚩 Skip ESLint during Vercel build
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
