/**
 * SPDX-License-Identifier: MIT
 */

import { Badge } from '@repo/design-system/ui/badge';
import { Button } from '@repo/design-system/ui/button';
import { ChevronRight, Plus, Settings } from 'lucide-react';

const listings = [
  {
    id: 1,
    title: 'BMW 320i 2023',
    category: 'Araç - Otomobil',
    price: '2.460.000 TL',
    status: 'Satıldı',
    statusColor: 'destructive',
  },
  {
    id: 2,
    title: 'Mercedes Benz C200d 2024',
    category: 'Araç - Otomobil',
    price: '2.460.000 TL',
    status: 'Yayında',
    statusColor: 'success',
  },
  {
    id: 3,
    title: 'Mercedes Benz C200d 2024',
    category: 'Araç - Otomobil',
    price: '2.460.000 TL',
    status: 'Yayında',
    statusColor: 'success',
  },
];

export default function PayloxPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-gray-200 border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600">
                <span className="font-bold text-sm text-white">PL</span>
              </div>
              <span className="font-semibold text-gray-900 text-xl">
                Paylox
              </span>
            </div>
          </div>

          {/* Settings */}
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5 text-gray-600" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-6">
        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="font-semibold text-2xl text-gray-900">İlanlarım</h1>

          <div className="flex items-center gap-3">
            <Button className="bg-purple-600 text-white hover:bg-purple-700">
              <Plus className="mr-2 h-4 w-4" />
              Yeni İlan Ekle
            </Button>
            <Button variant="outline">Liste</Button>
            <Button variant="outline">Sütun</Button>
          </div>
        </div>

        {/* Listings Table */}
        <div className="flex flex-col overflow-hidden rounded-lg px-60">
          {/* Table Header */}
          <div className="col-12 grid grid-cols-12 gap-4 px-6 py-4 font-medium text-gray-700 text-xs uppercase tracking-wide">
            <div className="col-span-4 font-medium">İLAN BİLGİSİ</div>
            <div className="col-span-2 font-medium">KATEGORİ</div>
            <div className="col-span-2 font-medium">FİYAT</div>
            <div className="col-span-2 font-medium">DURUM</div>
            <div className="col-span-2 font-medium" />
          </div>

          {/* Table Rows */}
          <div className="text-xs">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="mb-[10px] grid grid-cols-12 items-center gap-4 divide-x divide-gray-200 rounded-[0.875rem] border-[#f7f8fa] border-[10px] px-[10px] py-1 transition-colors hover:bg-gray-50"
              >
                {/* Listing Info */}
                <div className="col-span-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100" />
                  <span className="font-medium text-gray-900">
                    {listing.title}
                  </span>
                </div>

                {/* Category */}
                <div className="col-span-2">
                  <span className="text-gray-500">{listing.category}</span>
                </div>

                {/* Price */}
                <div className="col-span-2">
                  <span className="font-semibold text-gray-900">
                    {listing.price}
                  </span>
                </div>

                {/* Status */}
                <div className="col-span-2">
                  <Badge
                    variant={
                      listing.statusColor === 'destructive'
                        ? 'destructive'
                        : 'default'
                    }
                    className={
                      listing.statusColor === 'success'
                        ? 'bg-green-100 text-green-800 hover:bg-green-100'
                        : ''
                    }
                  >
                    {listing.status}
                  </Badge>
                </div>

                {/* Action */}
                <div className="col-span-2 flex justify-end">
                  <Button variant="ghost" size="icon">
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
