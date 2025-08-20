# @repo/database

## Overview

The `@repo/database` package provides a streamlined database integration for Zopio applications using Prisma ORM with Neon PostgreSQL. It offers a type-safe, server-side database client with connection pooling, optimized for both development and production environments.

## Module Categories

### Core Components

- **Database Client**: Type-safe Prisma client with Neon adapter
- **Connection Management**: Optimized connection pooling for serverless environments
- **Environment Configuration**: Type-safe environment variable handling

### Database Features

- **PostgreSQL Integration**: Full support for Neon's serverless PostgreSQL
- **Type Generation**: Automatic TypeScript type generation from Prisma schema
- **Schema Management**: Prisma schema definition and migration tools

## Usage Guidelines

### Basic Setup

1. Add your database connection string to your environment variables:

```env
DATABASE_URL=postgresql://user:password@host:port/database
```

2. Import and use the database client in your application:

```tsx
import { database } from '@repo/database';

// In your server component or API route
export async function getData() {
  const transactions = await database.escrowTransaction.findMany();
  return transactions;
}
```

### Querying Data

```tsx
import { database } from '@repo/database';

// Find a single record
const transaction = await database.escrowTransaction.findUnique({
  where: { id: 'clx1234567890' },
});

// Find multiple records with filtering
const transactions = await database.escrowTransaction.findMany({
  where: {
    title: {
      contains: 'Vehicle',
    },
    status: 'ACTIVE',
  },
  orderBy: {
    createdAt: 'desc',
  },
});

// Create a new record
const newTransaction = await database.escrowTransaction.create({
  data: {
    title: 'Vehicle Sale',
    description: 'Sale of 2020 Toyota Camry',
    amount: 15000,
    sellerId: 'user_123',
    buyerId: 'user_456',
    status: 'PENDING',
  },
});

// Update a record
const updatedTransaction = await database.escrowTransaction.update({
  where: { id: 'clx1234567890' },
  data: {
    status: 'IN_PROGRESS',
    updatedBy: 'user_123',
  },
});

// Delete a record (soft delete)
const deletedTransaction = await database.escrowTransaction.update({
  where: { id: 'clx1234567890' },
  data: {
    deletedAt: new Date(),
    deletedBy: 'user_123',
  },
});
```

### Using Transactions

```tsx
import { database } from '@repo/database';

// Perform multiple operations in a transaction
const result = await database.$transaction(async (tx) => {
  // Create a new escrow transaction
  const escrow = await tx.escrowTransaction.create({
    data: {
      title: 'Vehicle Purchase',
      description: 'Sale of 2020 Honda Civic',
      amount: 18000,
      sellerId: 'user_seller',
      buyerId: 'user_buyer',
      status: 'PENDING',
    },
  });
  
  // Create activity log for the transaction
  const activity = await tx.activity.create({
    data: {
      transactionId: escrow.id,
      type: 'TRANSACTION_CREATED',
      description: 'Escrow transaction created',
      performedBy: 'user_seller',
      createdBy: 'user_seller',
    },
  });
  
  return { escrow, activity };
});
```

### Using Raw SQL Queries

```tsx
import { database, Prisma } from '@repo/database';

// Execute a raw SQL query
const result = await database.$queryRaw`
  SELECT * FROM "EscrowTransaction" WHERE "title" LIKE ${`%${searchTerm}%`}
`;
```

## Installation

This package is part of the Zopio monorepo and is available as a workspace package.

```bash
pnpm add @repo/database
```

## Environment Variables

| Variable | Description | Format |
| --- | --- | --- |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:password@host:port/database` |

## Development Guidelines

### Extending the Schema

To add new models to your database schema:

1. Edit the `prisma/schema.prisma` file:

```prisma
// Example: Adding a User model
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// Example: Adding a Post model with relations
model Post {
  id        String   @id @default(cuid())
  title     String
  content   String?
  published Boolean  @default(false)
  authorId  String
  author    User     @relation(fields: [authorId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([authorId])
}
```

2. Generate the Prisma client:

```bash
pnpm run -F @repo/database build
```

3. Use the new models in your application:

```tsx
import { database } from '@repo/database';

// Create a user with posts
const user = await database.user.create({
  data: {
    email: 'user@example.com',
    name: 'Example User',
    posts: {
      create: [
        {
          title: 'First Post',
          content: 'This is my first post',
        },
      ],
    },
  },
  include: {
    posts: true,
  },
});
```

### Managing Database Migrations

To create and apply database migrations:

1. Make changes to your Prisma schema
2. Create a migration:

```bash
cd packages/database
npx prisma migrate dev --name add_user_model
```

3. Apply the migration to your database:

```bash
npx prisma migrate deploy
```

### Working with Neon Database

This package is configured to work with Neon's serverless PostgreSQL. Some best practices:

1. Use connection pooling for optimal performance
2. Keep transactions short to avoid connection timeouts
3. Consider using edge-compatible queries for global deployments
4. Monitor query performance in the Neon dashboard

## Integration Examples

### With Next.js App Router

```tsx
// app/transactions/route.ts
import { database } from '@repo/database';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const transactions = await database.escrowTransaction.findMany();
    return NextResponse.json({ transactions });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}
```

### With TanStack Query

```tsx
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Fetch transactions
function useTransactions() {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const response = await fetch('/api/transactions');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
  });
}

// Create a new transaction
function useCreateTransaction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (transactionData: {
      title: string;
      description: string;
      amount: number;
      buyerId: string;
    }) => {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create transaction');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}
```

### With Server Actions

```tsx
'use server';

import { database } from '@repo/database';
import { revalidatePath } from 'next/cache';
import { auth } from '@repo/auth/server';

export async function createTransaction(formData: FormData) {
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const amount = Number(formData.get('amount'));
  const buyerId = formData.get('buyerId') as string;
  
  const { userId } = await auth();
  
  if (!title || !amount || !buyerId || !userId) {
    return { error: 'All fields are required' };
  }
  
  try {
    await database.escrowTransaction.create({
      data: { 
        title,
        description,
        amount,
        buyerId,
        sellerId: userId,
        status: 'PENDING',
        createdBy: userId,
        updatedBy: userId,
      },
    });
    
    revalidatePath('/transactions');
    return { success: true };
  } catch (error) {
    console.error('Failed to create transaction:', error);
    return { error: 'Failed to create transaction' };
  }
}
```

## Database Schema Visualization

You can visualize your database schema using Prisma Studio:

```bash
cd packages/database
npx prisma studio
```

This will open a web interface at `http://localhost:5555` where you can browse and edit your database.

## Documentation References

- [Prisma Documentation](https://www.prisma.io/docs)
- [Neon PostgreSQL Documentation](https://neon.tech/docs)
- [Next.js Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)

## Contributing Guidelines

1. Ensure all new code follows the project's TypeScript configuration
2. Add SPDX license headers to all new files
3. Keep dependencies minimal and up-to-date
4. Write tests for new database models and queries
5. Follow the project's naming conventions
6. Update the Prisma schema documentation when adding new models

## License

MIT
