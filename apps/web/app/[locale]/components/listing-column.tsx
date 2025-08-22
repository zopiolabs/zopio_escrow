/**
 * SPDX-License-Identifier: MIT
 */

'use client';

import { LoadMoreButton } from '@/app/[locale]/components/load-more-button';
import { Badge } from '@repo/design-system/ui/badge';
import type React from 'react';
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

interface ListingColumnProps {
  listings: Listing[];
  initialLimit?: number;
  incrementAmount?: number;
}

export function ListingColumn({
  listings,
  initialLimit = 10,
  incrementAmount = 10,
}: ListingColumnProps) {
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

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    listing: Listing
  ) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleListingClick(listing);
    }
  };

  return (
    <>
      <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-2 lg:grid-cols-3">
        {visibleItems.map((listing) => (
          <button
            key={listing.id}
            type="button"
            className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md"
            onClick={() => handleListingClick(listing)}
            onKeyDown={(e) => handleKeyDown(e, listing)}
            aria-label={`View details for ${listing.title}`}
          >
            {/* Image Placeholder */}
            <div className="aspect-video bg-gray-100" />

            {/* Content */}
            <div className="flex flex-1 flex-col p-4">
              <h3 className="font-semibold text-gray-900">{listing.title}</h3>
              <p className="mt-1 mb-4 text-gray-500 text-sm">
                {listing.category}
              </p>

              <div className="mt-auto flex items-center justify-between">
                <span className="font-medium text-gray-900">
                  {listing.price}
                </span>
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
            </div>
          </button>
        ))}

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
