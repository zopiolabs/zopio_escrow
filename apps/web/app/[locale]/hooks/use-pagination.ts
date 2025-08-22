/**
 * SPDX-License-Identifier: MIT
 */

import { useMemo, useState } from 'react';

interface UsePaginationProps<T> {
  items: T[];
  initialLimit?: number;
  incrementAmount?: number;
}

export interface UsePaginationReturn<T> {
  visibleItems: T[];
  hasMore: boolean;
  loadMore: () => void;
  reset: () => void;
  currentLimit: number;
}

export function usePagination<T>({
  items,
  initialLimit = 10,
  incrementAmount = 10,
}: UsePaginationProps<T>): UsePaginationReturn<T> {
  const [limit, setLimit] = useState<number>(initialLimit);

  const visibleItems = useMemo(() => {
    return items.slice(0, limit);
  }, [items, limit]);

  const hasMore = useMemo(() => {
    return items.length > limit;
  }, [items.length, limit]);

  const loadMore = () => {
    setLimit((prevLimit) => prevLimit + incrementAmount);
  };

  const reset = () => {
    setLimit(initialLimit);
  };

  return {
    visibleItems,
    hasMore,
    loadMore,
    reset,
    currentLimit: limit,
  };
}
