/**
 * SPDX-License-Identifier: MIT
 */

'use client';

import { Button } from '@repo/design-system/ui/button';
import { Plus, Settings } from 'lucide-react';
import { useState } from 'react';
import { ListingColumn } from '../components/listing-column';
import { ListingTable } from '../components/listing-table';
import { listings } from '../data/listings';

export default function PayloxPage() {
  const [viewMode, setViewMode] = useState<'list' | 'column'>('list');
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-gray-200 border-b bg-white px-3 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 sm:h-8 sm:w-8">
                <span className="font-bold text-white text-xs sm:text-sm">
                  PL
                </span>
              </div>
              <span className="font-semibold text-gray-900 text-lg sm:text-xl">
                Paylox
              </span>
            </div>
          </div>

          {/* Settings */}
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4 text-gray-600 sm:h-5 sm:w-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-3 py-4 sm:px-6 sm:py-6">
        {/* Page Header */}
        <div className="mx-auto mb-6 flex max-w-6xl flex-col items-start justify-between gap-4 sm:mb-8 sm:flex-row sm:items-center sm:gap-0">
          <h1 className="font-semibold text-gray-900 text-sm sm:text-xl">
            İlanlarım
          </h1>

          <div className="flex flex-wrap items-center gap-2 text-xs sm:gap-3">
            <Button className="rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 px-4 py-2 text-white">
              <Plus className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
              Yeni İlan Ekle
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              onClick={() => setViewMode('list')}
            >
              Liste
            </Button>
            <Button
              variant={viewMode === 'column' ? 'default' : 'outline'}
              onClick={() => setViewMode('column')}
            >
              Sütun
            </Button>
          </div>
        </div>

        {/* Listings View - Table or Column */}
        {viewMode === 'list' ? (
          <ListingTable
            listings={listings}
            initialLimit={10}
            incrementAmount={10}
          />
        ) : (
          <ListingColumn
            listings={listings}
            initialLimit={10}
            incrementAmount={10}
          />
        )}
      </main>
    </div>
  );
}
