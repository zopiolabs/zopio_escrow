/**
 * SPDX-License-Identifier: MIT
 */

import path from 'node:path';
import { withToolbar } from '@repo/feature-flags/lib/toolbar';
import { config } from '@repo/next-config';
import { withLogging, withSentry } from '@repo/observability/next-config';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./lib/i18n.ts');

// Initialize the base Next.js configuration with wrappers
let nextConfig: NextConfig = withToolbar(withLogging(config));

// Define path aliases dynamically for Webpack
const aliasMap: Record<string, string> = {
  '@repo/design-system': 'packages/design-system',
  '@repo/design-system/ui': 'packages/design-system/ui',
  '@repo/design-system/lib': 'packages/design-system/lib',
  '@repo/design-system/blocks': 'packages/design-system/blocks',
};

// Apply Webpack alias configuration
nextConfig.webpack = (config, _options) => {
  config.resolve.alias = {
    ...(config.resolve.alias || {}),
    ...Object.fromEntries(
      Object.entries(aliasMap).map(([key, relPath]) => [
        key,
        path.resolve(__dirname, '../../..', relPath),
      ])
    ),
  };
  return config;
};

// Apply Sentry plugin on Vercel deployments
if (process.env.VERCEL) {
  nextConfig = withSentry(nextConfig);
}

// Apply bundle analyzer if ANALYZE env var is set
if (process.env.ANALYZE === 'true') {
  const withBundleAnalyzer = require('@next/bundle-analyzer');
  nextConfig = withBundleAnalyzer({
    enabled: true,
    openAnalyzer: false,
  })(nextConfig);
}

// Wrap with next-intl
nextConfig = withNextIntl(nextConfig);

export default nextConfig;
