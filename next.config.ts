import path from "node:path";
import { fileURLToPath } from "node:url";

import type { NextConfig } from "next";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
type IgnoredPattern = RegExp | string;
type WatchOptionsLike = {
  ignored?: IgnoredPattern | IgnoredPattern[];
};

function mergeIgnoredPatterns(
  existing?: WatchOptionsLike,
): string[] | RegExp | string {
  const base = existing?.ignored;
  const patterns = [
    "**/.codex-*.log",
    "**/.codex-*.err",
    "**/.data/**",
    "**/tmp_*.py",
    "**/tmp_*.txt",
    "**/tsconfig.tsbuildinfo",
  ];

  if (!base) {
    return patterns;
  }

  if (Array.isArray(base)) {
    return [...base.filter((value): value is string => typeof value === "string"), ...patterns];
  }

  return typeof base === "string" ? [base, ...patterns] : base;
}
const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/oga/gists",
        destination: "/",
        permanent: false,
      },
      {
        source: "/oga/gists/:path*",
        destination: "/",
        permanent: false,
      },
      {
        source: "/oga",
        destination: "/",
        permanent: false,
      },
      {
        source: "/oga/:path*",
        destination: "/",
        permanent: false,
      },
      {
        source: "/oga-v2",
        destination: "/",
        permanent: false,
      },
      {
        source: "/oga-v2/:path*",
        destination: "/",
        permanent: false,
      },
      {
        source: "/oga-login",
        destination: "/",
        permanent: false,
      },
    ];
  },
  turbopack: {
    root: projectRoot,
  },
  webpack(config, { dev }) {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: mergeIgnoredPatterns(config.watchOptions),
      };
    }

    return config;
  },
};

export default nextConfig;
