/**
 * SPDX-License-Identifier: MIT
 */

import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { locales } from '../../lib/i18n';

interface LocaleLayoutProps {
  children: ReactNode;
  params: { locale: string };
}

export default function LocaleLayout({
  children,
  params: { locale },
}: LocaleLayoutProps) {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as (typeof locales)[number])) {
    notFound();
  }

  return <>{children}</>;
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
