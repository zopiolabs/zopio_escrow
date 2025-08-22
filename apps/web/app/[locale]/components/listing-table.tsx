/**
 * SPDX-License-Identifier: MIT
 */

'use client';

import { LoadMoreButton } from '@/app/[locale]/components/load-more-button';
import { Badge } from '@repo/design-system/ui/badge';
import { Button } from '@repo/design-system/ui/button';
import { ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useListingsPagination } from '../data/listings';
import { ListingDetailSidebar } from './listing-detail-sidebar';

interface Listing {
  id: number;
  title: string;
  category: string;
  price: string;
  status: string;
  statusColor: string;
}

interface ListingTableProps {
  listings: Listing[];
  initialLimit?: number;
  incrementAmount?: number;
}

export function ListingTable({
  listings,
  initialLimit = 10,
  incrementAmount = 10,
}: ListingTableProps) {
  const { visibleItems, hasMore, loadMore } = useListingsPagination(
    listings,
    initialLimit,
    incrementAmount
  );
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleListingClick = (listing: Listing) => {
    setSelectedListing(listing);
    setSidebarOpen(true);
  };
  return (
    <>
      <div className="mx-auto flex max-w-6xl flex-col overflow-hidden rounded-lg">
        {/* Table Header - Hidden on mobile */}
        <div className="col-12 hidden grid-cols-12 gap-2 px-3 py-3 font-medium text-gray-700 text-xs uppercase tracking-wide sm:grid sm:gap-4 sm:px-6 sm:py-4">
          <div className="col-span-4 font-medium">İLAN BİLGİSİ</div>
          <div className="col-span-2 font-medium">KATEGORİ</div>
          <div className="col-span-2 font-medium">FİYAT</div>
          <div className="col-span-2 font-medium">DURUM</div>
          <div className="col-span-2 font-medium" />
        </div>

        {/* Table Rows */}
        <div className="text-xs">
          {visibleItems.map((listing) => (
            <button
              key={listing.id}
              type="button"
              className="divide mb-2.5 grid w-full cursor-pointer grid-cols-1 items-start gap-2 divide-gray-200 rounded-[0.875rem] border-[10px] border-gray-100 px-[10px] py-2 text-left transition-colors hover:bg-gray-50 sm:grid-cols-12 sm:items-center sm:gap-4 sm:divide-x sm:divide-y-0 sm:py-1"
              onClick={() => handleListingClick(listing)}
            >
              {/* Listing Info */}
              <div className="col-span-1 flex items-center gap-2 py-2 sm:col-span-4 sm:gap-3 sm:py-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 sm:h-10 sm:w-10" />
                <span className="font-medium text-gray-900">
                  {listing.title}
                </span>
              </div>

              {/* Mobile Layout - Grouped Info */}
              <div className="col-span-1 flex flex-col gap-1 sm:hidden">
                <div className="flex justify-between">
                  <span className="text-gray-500">{listing.category}</span>
                  <span className="font-semibold text-gray-900">
                    {listing.price}
                  </span>
                </div>
                <div className="flex items-center justify-between">
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
                  <Button variant="ghost" size="icon">
                    <ChevronRight className="h-4 w-4 text-gray-400 sm:h-5 sm:w-5" />
                  </Button>
                </div>
              </div>

              {/* Desktop Layout - Individual Columns */}
              <div className="col-span-2 hidden sm:block">
                <span className="text-gray-500">{listing.category}</span>
              </div>

              <div className="col-span-2 hidden sm:block">
                <span className="font-semibold text-gray-900">
                  {listing.price}
                </span>
              </div>

              <div className="col-span-2 hidden sm:block">
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

              {/* Action Column */}
              <div className="col-span-2 hidden items-center justify-center sm:flex">
                <ChevronRight className="h-4 w-4 text-gray-400 sm:h-5 sm:w-5" />
              </div>
            </button>
          ))}
        </div>

        {/* Listing Detail Sidebar */}
        <ListingDetailSidebar
          listing={selectedListing}
          open={sidebarOpen}
          onOpenChange={setSidebarOpen}
        />
      </div>

      {/* Load More Button - Positioned below and centered */}
      {listings.length > initialLimit && (
        <div className="mx-auto max-w-6xl">
          <LoadMoreButton
            hasMore={hasMore}
            onLoadMore={loadMore}
            loadMoreText="Daha Fazla Göster"
            noMoreText="Tüm İlanlar Gösteriliyor"
          />
        </div>
      )}
    </>
  );
}
