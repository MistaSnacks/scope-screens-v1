import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [new URL("https://static.wixstatic.com/media/**")],
  },
};

export default nextConfig;
