import path from "node:path";
import { fileURLToPath } from "node:url";

import type { NextConfig } from "next";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const operatorOrigin = process.env.OGA_APP_ORIGIN?.trim().replace(/\/$/, "") || null;
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

function ogaDestination(path: string) {
  return operatorOrigin ? `${operatorOrigin}${path}` : path;
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
      ...(operatorOrigin
        ? [
            {
              source: "/oga-login",
              destination: `${operatorOrigin}/login`,
              permanent: true,
              basePath: false as const,
            },
          ]
        : []),
      {
        source: "/oga/gists",
        destination: ogaDestination("/oga-v2/matters"),
        permanent: true,
      },
      {
        source: "/oga/gists/:path*",
        destination: ogaDestination("/oga-v2/matters/:path*"),
        permanent: true,
        basePath: operatorOrigin ? false : undefined,
      },
      {
        source: "/oga-v2",
        destination: ogaDestination("/oga-v2"),
        permanent: true,
        basePath: operatorOrigin ? false : undefined,
      },
      {
        source: "/oga-v2/:path*",
        destination: ogaDestination("/oga-v2/:path*"),
        permanent: true,
        basePath: operatorOrigin ? false : undefined,
      },
      {
        source: "/oga",
        destination: ogaDestination("/oga-v2"),
        permanent: true,
        basePath: operatorOrigin ? false : undefined,
      },
      {
        source: "/oga/:path*",
        destination: ogaDestination("/oga-v2/:path*"),
        permanent: true,
        basePath: operatorOrigin ? false : undefined,
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
