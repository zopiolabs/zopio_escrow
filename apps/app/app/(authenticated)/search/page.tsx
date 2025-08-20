/**
 * SPDX-License-Identifier: MIT
 */

import { auth } from '@repo/auth/server';
import { database } from '@repo/database';
import { notFound, redirect } from 'next/navigation';
import { Header } from '../components/header';

type SearchPageProperties = {
  searchParams: Promise<{
    q: string;
  }>;
};

export const generateMetadata = async ({
  searchParams,
}: SearchPageProperties) => {
  const { q } = await searchParams;

  return {
    title: `${q} - Search results`,
    description: `Search results for ${q}`,
  };
};

const SearchPage = async ({ searchParams }: SearchPageProperties) => {
  const { q } = await searchParams;
  const { userId, orgId } = await auth();

  if (!orgId || !userId) {
    notFound();
  }

  if (!q) {
    redirect('/');
  }

  // Search escrow transactions by title, description, or transaction ID
  const transactions = await database.escrowTransaction.findMany({
    where: {
      AND: [
        {
          OR: [{ sellerId: userId }, { buyerId: userId }],
        },
        {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
            { id: { contains: q, mode: 'insensitive' } },
          ],
        },
      ],
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <>
      <Header pages={['Escrow Dashboard']} page={`Search: "${q}"`} />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          {transactions.length > 0 ? (
            transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="aspect-video rounded-xl bg-muted/50 p-4"
              >
                <div className="font-medium">{transaction.title}</div>
                <div className="text-muted-foreground text-sm">
                  Amount: ${transaction.amount.toString()}
                </div>
                <div className="text-muted-foreground text-sm">
                  Status: {transaction.status}
                </div>
                <div className="mt-2 text-muted-foreground text-xs">
                  ID: {transaction.id.slice(0, 8)}...
                </div>
              </div>
            ))
          ) : (
            <div className="flex aspect-video items-center justify-center rounded-xl bg-muted/50 p-4">
              <p className="text-muted-foreground">
                No transactions found for "{q}"
              </p>
            </div>
          )}
        </div>
        <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
      </div>
    </>
  );
};

export default SearchPage;
