/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The db & ui packages ship raw TS — let Next transpile them.
  transpilePackages: ["@undoverse/db", "@undoverse/ui"],
  images: {
    remotePatterns: [
      // GitHub avatars (OAuth) + opengraph imagery
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "github.com" },
      { protocol: "https", hostname: "**.undoverse.in" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
