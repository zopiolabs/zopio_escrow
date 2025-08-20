/**
 * SPDX-License-Identifier: MIT
 */

import { auth } from '@repo/auth/server';
import { database } from '@repo/database';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const createEscrowSchema = z.object({
  // Seller Info
  sellerId: z.string(),

  // Product Info
  category: z.string(),
  title: z.string().min(1, 'Product title is required'),
  description: z.string().optional(),
  productInfo: z.record(z.unknown()).optional(),

  // Vehicle Info (when applicable)
  vehicleInfo: z
    .object({
      brand: z.string().optional(),
      model: z.string().optional(),
      year: z.number().optional(),
      mileage: z.number().optional(),
      plateNumber: z.string().optional(),
      color: z.string().optional(),
      engineSize: z.string().optional(),
      fuelType: z.string().optional(),
      transmission: z.string().optional(),
    })
    .optional(),

  // Financial Info
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().default('TRY'),

  // Buyer Info (optional - can be added later)
  buyerId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createEscrowSchema.parse(body);

    // Calculate platform fee (example: 2.5%)
    const platformFee = validatedData.amount * 0.025;
    const sellerReceives = validatedData.amount - platformFee;

    // Generate unique order ID
    const orderId = `ESC-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const transaction = await database.escrowTransaction.create({
      data: {
        orderId,
        sellerId: validatedData.sellerId,
        buyerId: validatedData.buyerId,
        amount: validatedData.amount,
        currency: validatedData.currency,
        platformFee,
        sellerReceives,
        status: 'DRAFT',
        paymentStatus: 'PENDING',
        category: validatedData.category,
        title: validatedData.title,
        description: validatedData.description,
        productInfo: validatedData.productInfo || {},
        // Vehicle info will be handled by the relation if provided
        otpVerified: false,
        disputed: false,
        createdBy: userId,
        updatedBy: userId,
      },
      include: {
        seller: true,
        buyer: true,
        vehicleInfo: true,
        documents: true,
        activities: true,
      },
    });

    // Log activity
    await database.activity.create({
      data: {
        transactionId: transaction.id,
        performedBy: userId,
        type: 'CREATED',
        description: 'Transaction created',
        metadata: {
          orderId: transaction.orderId,
          amount: transaction.amount,
          category: transaction.category,
        },
        createdBy: userId,
      },
    });

    return NextResponse.json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
