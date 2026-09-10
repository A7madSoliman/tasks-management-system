import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
  webpack(config) {
    interface WebpackRule {
      test?: { test?: (str: string) => boolean };
      issuer?: unknown;
      resourceQuery?: { not?: unknown[] };
      exclude?: RegExp;
      [key: string]: unknown;
    }

    const fileLoaderRule = config.module.rules.find((rule: WebpackRule) =>
      rule.test?.test?.(".svg"),
    ) as WebpackRule | undefined;

    config.module.rules.push(
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/,
      },
      {
        test: /\.svg$/i,
        issuer: fileLoaderRule?.issuer,
        resourceQuery: {
          not: [...(fileLoaderRule?.resourceQuery?.not || []), /url/],
        },
        use: ["@svgr/webpack"],
      },
    );

    if (fileLoaderRule) {
      fileLoaderRule.exclude = /\.svg$/i;
    }

    return config;
  },
};

export default nextConfig;
