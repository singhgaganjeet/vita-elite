import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: 'world.openfoodfacts.org' },
      { hostname: 'static.openfoodfacts.org' },
      { hostname: 'images.openfoodfacts.org' },
    ],
  },
};

export default nextConfig;
