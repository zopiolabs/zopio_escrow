/**
 * SPDX-License-Identifier: MIT
 */

import { auth } from '@repo/auth/server';
import { database } from '@repo/database';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const updateEscrowSchema = z.object({
  status: z
    .enum([
      'DRAFT',
      'PENDING_BUYER',
      'PENDING_PAYMENT',
      'PAYMENT_PROCESSING',
      'FUNDS_HELD',
      'PENDING_DELIVERY',
      'DELIVERED',
      'PENDING_RELEASE',
      'COMPLETED',
      'DISPUTED',
      'CANCELLED',
      'REFUNDED',
    ])
    .optional(),
  buyerId: z.string().optional(),
  description: z.string().optional(),
  productInfo: z.record(z.unknown()).optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const transaction = await database.escrowTransaction.findUnique({
      where: { id: params.id },
      include: {
        seller: true,
        buyer: true,
        vehicleInfo: true,
        documents: true,
        activities: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Check if user has access to this transaction
    if (transaction.sellerId !== userId && transaction.buyerId !== userId) {
      // Check if user is admin (implement admin check logic)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      data: transaction,
    });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateEscrowSchema.parse(body);

    const existingTransaction = await database.escrowTransaction.findUnique({
      where: { id: params.id },
    });

    if (!existingTransaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Check if user has permission to update
    if (
      existingTransaction.sellerId !== userId &&
      existingTransaction.buyerId !== userId
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Validate state transitions (implement state machine logic)
    if (
      validatedData.status &&
      !isValidStatusTransition(existingTransaction.status, validatedData.status)
    ) {
      return NextResponse.json(
        { error: 'Invalid status transition' },
        { status: 400 }
      );
    }

    const updatedTransaction = await database.escrowTransaction.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        updatedBy: userId,
        version: { increment: 1 },
      },
      include: {
        seller: true,
        buyer: true,
        vehicleInfo: true,
        documents: true,
        activities: true,
      },
    });

    // Log activity if status changed
    if (
      validatedData.status &&
      validatedData.status !== existingTransaction.status
    ) {
      await database.activity.create({
        data: {
          transactionId: updatedTransaction.id,
          performedBy: userId,
          type: 'UPDATED',
          description: 'Status updated',
          metadata: {
            oldStatus: existingTransaction.status,
            newStatus: validatedData.status,
          },
          createdBy: userId,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: updatedTransaction,
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

// Helper function to validate status transitions
function isValidStatusTransition(
  currentStatus: string,
  newStatus: string
): boolean {
  const validTransitions: Record<string, string[]> = {
    DRAFT: ['PENDING_BUYER', 'PENDING_PAYMENT', 'CANCELLED'],
    PENDING_BUYER: ['PENDING_PAYMENT', 'CANCELLED'],
    PENDING_PAYMENT: ['PAYMENT_PROCESSING', 'CANCELLED'],
    PAYMENT_PROCESSING: ['FUNDS_HELD', 'CANCELLED'],
    FUNDS_HELD: ['PENDING_DELIVERY', 'DISPUTED', 'REFUNDED'],
    PENDING_DELIVERY: ['DELIVERED', 'DISPUTED'],
    DELIVERED: ['COMPLETED', 'DISPUTED'],
    DISPUTED: ['COMPLETED', 'REFUNDED'],
    COMPLETED: [], // Final state
    CANCELLED: [], // Final state
    REFUNDED: [], // Final state
  };

  return validTransitions[currentStatus]?.includes(newStatus) ?? false;
}
