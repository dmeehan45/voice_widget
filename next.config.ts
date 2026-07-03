import type { NextConfig } from "next";

// Optional hardening for self-hosters: restrict which sites may embed
// /embed by listing allowed origins, e.g.
//   EMBED_FRAME_ANCESTORS="https://www.example.com https://example.com"
const frameAncestors = process.env.EMBED_FRAME_ANCESTORS;

const nextConfig: NextConfig = {
  async headers() {
    if (!frameAncestors) return [];
    return [
      {
        source: "/embed",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `frame-ancestors ${frameAncestors}`,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
