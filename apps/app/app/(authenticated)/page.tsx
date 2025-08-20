/**
 * SPDX-License-Identifier: MIT
 */

import { env } from '@/env';
import { auth } from '@repo/auth/server';
import { database } from '@repo/database';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';
import { AvatarStack } from './components/avatar-stack';
import { Cursors } from './components/cursors';
import { Header } from './components/header';

const title = 'Acme Inc';
const description = 'My application.';

const CollaborationProvider = dynamic(() =>
  import('./components/collaboration-provider').then(
    (mod) => mod.CollaborationProvider
  )
);

export const metadata: Metadata = {
  title,
  description,
};

const App = async () => {
  const { userId, orgId } = await auth();

  if (!orgId || !userId) {
    notFound();
  }

  // Get user's escrow transactions
  const userTransactions = await database.escrowTransaction.findMany({
    where: {
      OR: [{ sellerId: userId }, { buyerId: userId }],
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 10, // Limit to recent 10 transactions
  });

  return (
    <>
      <Header pages={['Escrow Dashboard']} page="Your Transactions">
        {env.LIVEBLOCKS_SECRET && (
          <CollaborationProvider orgId={orgId}>
            <AvatarStack />
            <Cursors />
          </CollaborationProvider>
        )}
      </Header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          {userTransactions.length > 0 ? (
            userTransactions.map((transaction) => (
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
              </div>
            ))
          ) : (
            <div className="flex aspect-video items-center justify-center rounded-xl bg-muted/50 p-4">
              <p className="text-muted-foreground">
                No escrow transactions yet
              </p>
            </div>
          )}
        </div>
        <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
      </div>
    </>
  );
};

export default App;
