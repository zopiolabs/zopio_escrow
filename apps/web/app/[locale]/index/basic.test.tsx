/**
 * SPDX-License-Identifier: MIT
 */

import * as matchers from '@testing-library/jest-dom/matchers';
import { render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';

vi.mock('../components/listing-column', () => {
  return {
    ListingColumn: vi.fn(() => <div data-testid="listing-column" />),
  };
});

vi.mock('../components/listing-table', () => {
  return {
    ListingTable: vi.fn(() => <div data-testid="listing-table" />),
  };
});

vi.mock('../hooks/use-pagination', () => {
  return {
    usePagination: () => ({
      visibleItems: [
        {
          id: 1,
          title: 'BMW 320i 2023',
          category: 'Araç - Otomobil',
          price: '2.460.000 TL',
          status: 'Yayında',
          statusColor: 'success',
        },
      ],
      hasMore: true,
      loadMore: vi.fn(),
      reset: vi.fn(),
      currentLimit: 10,
    }),
  };
});

vi.mock('../data/listings', () => {
  const mockListings = [
    {
      id: 1,
      title: 'BMW 320i 2023',
      category: 'Araç - Otomobil',
      price: '2.460.000 TL',
      status: 'Yayında',
      statusColor: 'success',
    },
    {
      id: 2,
      title: 'Mercedes Benz C200d 2024',
      category: 'Araç - Otomobil',
      price: '2.460.000 TL',
      status: 'Yayında',
      statusColor: 'success',
    },
  ];

  return {
    listings: mockListings,
    useListingsPagination: () => ({
      visibleItems: mockListings,
      hasMore: true,
      loadMore: vi.fn(),
      reset: vi.fn(),
      currentLimit: 10,
    }),
  };
});

import { ListingColumn } from '../components/listing-column';
import { ListingDetailSidebar } from '../components/listing-detail-sidebar';
import { ListingTable } from '../components/listing-table';
import { LoadMoreButton } from '../components/load-more-button';
import PayloxPage from './page';

const mockListing = {
  id: 1,
  title: 'BMW 320i 2023',
  description: 'Test Description',
  price: '2.460.000 TL',
  category: 'Araç - Otomobil',
  status: 'Yayında',
  statusColor: 'success',
};

const mockListings = [mockListing];

beforeAll(() => {
  expect.extend(matchers);
});

describe('Index Page Components', () => {
  describe('LoadMoreButton', () => {
    it('renders with default props', () => {
      const { container } = render(<LoadMoreButton />);
      expect(screen.getByText('Load More')).toBeTruthy();
      expect(container.firstChild).not.toBeNull();
    });

    it('renders with custom text', () => {
      const { container } = render(
        <LoadMoreButton loadMoreText="Show More" noMoreText="No More Data" />
      );
      expect(screen.getByText('Show More')).toBeTruthy();
      expect(container.firstChild).not.toBeNull();
    });

    it('renders loading state', () => {
      const { container } = render(<LoadMoreButton isLoading={true} />);
      expect(screen.getByText('Loading...')).toBeTruthy();
      expect(container.firstChild).not.toBeNull();
    });

    it('renders no more items state', () => {
      const { container } = render(<LoadMoreButton hasMore={false} />);
      expect(screen.getByText('No More Items')).toBeTruthy();
      expect(container.firstChild).not.toBeNull();
    });
  });

  describe('ListingDetailSidebar', () => {
    it('renders with listing data when open', () => {
      render(
        <ListingDetailSidebar
          listing={mockListing}
          open={true}
          onOpenChange={vi.fn()}
        />
      );
      expect(screen.getAllByText('BMW 320i 2023')[0]).toBeTruthy();
      expect(screen.getByText('Araç - Otomobil')).toBeTruthy();
      expect(screen.getByText('2.460.000 TL')).toBeTruthy();
    });

    it('does not render when listing is null', () => {
      const { container } = render(
        <ListingDetailSidebar
          listing={null}
          open={true}
          onOpenChange={vi.fn()}
        />
      );
      expect(container.firstChild).toBeNull();
    });
  });

  describe('ListingTable', () => {
    it('renders with listings data', () => {
      const { container } = render(<ListingTable listings={mockListings} />);
      expect(screen.getByTestId('listing-table')).toBeTruthy();
      expect(container.firstChild).not.toBeNull();
    });
  });

  describe('ListingColumn', () => {
    it('renders with listings data', () => {
      const { container } = render(<ListingColumn listings={mockListings} />);
      expect(screen.getByTestId('listing-column')).toBeTruthy();
      expect(container.firstChild).not.toBeNull();
    });
  });

  describe('PayloxPage', () => {
    it('renders the page with default view mode (list)', () => {
      const { container } = render(<PayloxPage />);
      expect(screen.getByText('İlanlarım')).toBeTruthy();
      expect(screen.getByText('Paylox')).toBeTruthy();
      expect(screen.getByText('Liste')).toBeTruthy();
      expect(screen.getByText('Sütun')).toBeTruthy();
      expect(screen.getByText('Yeni İlan Ekle')).toBeTruthy();
      expect(screen.getByTestId('listing-table')).toBeTruthy();
      expect(container.firstChild).not.toBeNull();
    });
  });
});
