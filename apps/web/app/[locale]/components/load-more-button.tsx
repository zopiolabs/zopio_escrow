/**
 * SPDX-License-Identifier: MIT
 */

import { Loader2 } from 'lucide-react';
import type React from 'react';
import { cn } from '../../../../../packages/design-system/lib/utils';
import { Button } from '../../../../../packages/design-system/ui/button';

export interface LoadMoreButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  hasMore?: boolean;
  loadMoreText?: string;
  noMoreText?: string;
  onLoadMore?: () => void;
}

export function LoadMoreButton({
  isLoading = false,
  hasMore = true,
  loadMoreText = 'Load More',
  noMoreText = 'No More Items',
  onLoadMore,
  className,
  disabled,
  ...props
}: LoadMoreButtonProps) {
  return (
    <div className="mt-8 mb-6 flex w-full justify-center">
      <Button
        variant="outline"
        size="lg"
        className={cn('min-w-[200px]', className)}
        onClick={onLoadMore}
        disabled={isLoading || !hasMore || disabled}
        {...props}
      >
        {isLoading && (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </>
        )}
        {!isLoading && hasMore && loadMoreText}
        {!isLoading && !hasMore && noMoreText}
      </Button>
    </div>
  );
}
