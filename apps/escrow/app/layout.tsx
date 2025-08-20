/**
 * SPDX-License-Identifier: MIT
 */

import { AnalyticsProvider } from '@repo/analytics';
import { ClerkProvider } from '@repo/auth/client';
import { cn } from '@repo/design-system/lib/utils';
import { Toaster } from '@repo/design-system/ui';
import { Observability } from '@repo/observability';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Inter } from 'next/font/google';
import type { ReactNode } from 'react';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-sans',
});

interface RootLayoutProps {
  children: ReactNode;
  params: { locale: string };
}

export default async function RootLayout({
  children,
  params: { locale },
}: RootLayoutProps) {
  const messages = await getMessages();

  return (
    <ClerkProvider>
      <html lang={locale} suppressHydrationWarning>
        <body
          className={cn(
            'min-h-screen bg-background font-sans antialiased',
            inter.variable
          )}
        >
          <AnalyticsProvider>
            <NextIntlClientProvider messages={messages} locale={locale}>
              {children}
              <Toaster />
            </NextIntlClientProvider>
            <Observability />
          </AnalyticsProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
