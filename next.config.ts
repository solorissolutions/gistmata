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
  async redirects() {
    return [
      {
        source: "/oga/gists",
        destination: "/oga-v2/matters",
        permanent: true,
      },
      {
        source: "/oga/gists/:path*",
        destination: "/oga-v2/matters/:path*",
        permanent: true,
      },
      {
        source: "/oga",
        destination: "/oga-v2",
        permanent: true,
      },
      {
        source: "/oga/:path*",
        destination: "/oga-v2/:path*",
        permanent: true,
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
