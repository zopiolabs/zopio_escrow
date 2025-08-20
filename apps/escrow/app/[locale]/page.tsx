/**
 * SPDX-License-Identifier: MIT
 */

import { Button } from '@repo/design-system/ui';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function HomePage() {
  const t = useTranslations('escrow');

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="mx-auto max-w-2xl space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="font-bold text-4xl tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground text-xl">{t('subtitle')}</p>
        </div>

        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/create">{t('createTransaction')}</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/dashboard">
              {useTranslations('navigation')('dashboard')}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
