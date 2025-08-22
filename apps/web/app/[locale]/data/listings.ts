/**
 * SPDX-License-Identifier: MIT
 */

import {
  type UsePaginationReturn,
  usePagination,
} from '../hooks/use-pagination';

export interface Listing {
  id: number;
  title: string;
  category: string;
  price: string;
  status: string;
  statusColor: string;
}

export const listings: Listing[] = [
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
  {
    id: 4,
    title: 'Mercedes Benz C200d 2024',
    category: 'Araç - Otomobil',
    price: '2.460.000 TL',
    status: 'Yayında',
    statusColor: 'success',
  },
  {
    id: 5,
    title: 'Mercedes Benz C200d 2024',
    category: 'Araç - Otomobil',
    price: '2.460.000 TL',
    status: 'Yayında',
    statusColor: 'success',
  },
  {
    id: 6,
    title: 'Mercedes Benz C200d 2024',
    category: 'Araç - Otomobil',
    price: '2.460.000 TL',
    status: 'Yayında',
    statusColor: 'success',
  },
  {
    id: 7,
    title: 'Mercedes Benz C200d 2024',
    category: 'Araç - Otomobil',
    price: '2.460.000 TL',
    status: 'Yayında',
    statusColor: 'success',
  },
  {
    id: 8,
    title: 'Mercedes Benz C200d 2024',
    category: 'Araç - Otomobil',
    price: '2.460.000 TL',
    status: 'Yayında',
    statusColor: 'success',
  },
  {
    id: 9,
    title: 'Mercedes Benz C200d 2024',
    category: 'Araç - Otomobil',
    price: '2.460.000 TL',
    status: 'Yayında',
    statusColor: 'success',
  },
  {
    id: 10,
    title: 'Mercedes Benz C200d 2024',
    category: 'Araç - Otomobil',
    price: '2.460.000 TL',
    status: 'Yayında',
    statusColor: 'success',
  },
  {
    id: 11,
    title: 'Mercedes Benz C200d 2024',
    category: 'Araç - Otomobil',
    price: '2.460.000 TL',
    status: 'Yayında',
    statusColor: 'success',
  },
  {
    id: 12,
    title: 'Mercedes Benz C200d 2024',
    category: 'Araç - Otomobil',
    price: '2.460.000 TL',
    status: 'Yayında',
    statusColor: 'success',
  },
];

export function useListingsPagination(
  customListings?: Listing[],
  initialLimit = 10,
  incrementAmount = 10
): UsePaginationReturn<Listing> {
  return usePagination({
    items: customListings || listings,
    initialLimit,
    incrementAmount,
  });
}
