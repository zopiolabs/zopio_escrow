/**
 * SPDX-License-Identifier: MIT
 */

import createIntlMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';
import { locales } from './lib/i18n';

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale: 'tr',
  localePrefix: 'as-needed',
});

export default function middleware(request: NextRequest) {
  return intlMiddleware(request);
}

export const config = {
  // Match only internationalized pathnames
  matcher: [
    // Enable a redirect to a matching locale at the root
    '/',

    // Set a cookie to remember the previous locale for
    // all requests that have a locale prefix
    '/(tr|en)/:path*',

    // Enable redirects that add missing locales
    // (e.g. `/pathnames` -> `/en/pathnames`)
    '/((?!_next|_vercel|.*\\..*).*)',
  ],
};
