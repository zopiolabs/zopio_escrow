/**
 * SPDX-License-Identifier: MIT
 */

'use client';

import { Avatar, AvatarImage } from '@repo/design-system/ui/avatar';
import { Badge } from '@repo/design-system/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@repo/design-system/ui/sheet';

interface Listing {
  id: number;
  title: string;
  category: string;
  price: string;
  status: string;
  statusColor: string;
}

interface ListingDetailSidebarProps {
  listing: Listing | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ListingDetailSidebar({
  listing,
  open,
  onOpenChange,
}: ListingDetailSidebarProps) {
  if (!listing) {
    return null;
  }

  // Extract brand from title (e.g., "BMW" from "BMW 320i 2023")
  const brand = listing.title.split(' ')[0];
  const model = listing.title.split(' ')[1];
  const year = listing.title.split(' ')[2];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto p-0 pt-8 sm:max-w-md md:max-w-lg"
      >
        {/* Hidden SheetTitle for accessibility */}
        <SheetHeader className="sr-only">
          <SheetTitle>{listing.title}</SheetTitle>
        </SheetHeader>
        <div className="p-6">
          <div className="mb-4 flex items-center space-x-3 rounded-md border p-4">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-gray-200">
              <Avatar>
                <AvatarImage
                  src="https://github.com/shadcn.png"
                  alt="@shadcn"
                />
              </Avatar>
            </div>
            <div className="flex flex-col">
              <h2 className="font-bold text-xl">{listing.title}</h2>
              <p className="text-gray-500">{listing.category}</p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-bold text-2xl">{listing.price}</h3>
            <Badge
              variant={
                listing.statusColor === 'destructive'
                  ? 'destructive'
                  : 'default'
              }
              className={`mt-2 ${listing.statusColor === 'success' ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}`}
            >
              {listing.status}
            </Badge>
          </div>

          <div className="border-gray-200 border-t pt-4">
            <p className="mb-6 text-gray-700 text-sm">
              {brand} {model} {year}, 0 km, full donanım. Detaylar burada.
            </p>

            {/* Car details */}
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">Model Yılı</span>
                <span className="font-medium text-sm">{year}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">Kilometre</span>
                <span className="font-medium text-sm">0 km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">Donanım</span>
                <span className="font-medium text-sm">Full</span>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
