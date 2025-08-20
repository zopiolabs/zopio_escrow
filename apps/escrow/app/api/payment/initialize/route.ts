/**
 * SPDX-License-Identifier: MIT
 */

import crypto from 'node:crypto';
import { auth } from '@repo/auth/server';
import { database } from '@repo/database';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { env } from '../../../../env';

const initializePaymentSchema = z.object({
  escrowTransactionId: z.string(),
  paymentMethod: z.enum(['CREDIT_CARD', 'BANK_TRANSFER']),
  returnUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

interface JetcheckoutPaymentRequest {
  merchant_oid: string;
  user_name: string;
  user_address: string;
  user_phone: string;
  user_basket: string;
  user_ip: string;
  payment_amount: string;
  currency: string;
  test_mode: string;
  non_3d: string;
  merchant_ok_url: string;
  merchant_fail_url: string;
  paytr_token: string;
  debug_on?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = initializePaymentSchema.parse(body);

    // Fetch the escrow transaction
    const transaction = await database.escrowTransaction.findUnique({
      where: { id: validatedData.escrowTransactionId },
      include: {
        seller: true,
        buyer: true,
      },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Verify user has permission to pay for this transaction
    if (transaction.buyerId !== userId && transaction.sellerId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if transaction is in correct state for payment
    if (transaction.status !== 'PENDING_PAYMENT') {
      return NextResponse.json(
        { error: 'Transaction is not ready for payment' },
        { status: 400 }
      );
    }

    // Update transaction to payment processing status
    await database.escrowTransaction.update({
      where: { id: transaction.id },
      data: {
        paymentStatus: 'PROCESSING',
        updatedBy: userId,
      },
    });

    // Prepare Jetcheckout payment request
    const merchantOrderId = `${transaction.orderId}-${Date.now()}`;
    const userBasket = JSON.stringify([
      [`${transaction.title}`, `${transaction.amount}`, 1],
    ]);

    // Generate hash for security
    const hashStr = `${env.JETCHECKOUT_API_KEY}${userBasket}${transaction.amount}${transaction.currency}${merchantOrderId}${env.JETCHECKOUT_SECRET_KEY}`;
    const paytrToken = generateHash(hashStr);

    const jetcheckoutRequest: JetcheckoutPaymentRequest = {
      merchant_oid: merchantOrderId,
      user_name: transaction.buyer?.fullName || 'Unknown',
      user_address: transaction.buyer?.address || 'Unknown',
      user_phone: transaction.buyer?.phone || 'Unknown',
      user_basket: userBasket,
      user_ip: getClientIP(request),
      payment_amount: transaction.amount.toString(),
      currency: transaction.currency,
      test_mode: env.NODE_ENV === 'development' ? '1' : '0',
      non_3d: '0', // Use 3D Secure
      merchant_ok_url: validatedData.returnUrl,
      merchant_fail_url: validatedData.cancelUrl,
      paytr_token: paytrToken,
      debug_on: env.NODE_ENV === 'development' ? '1' : '0',
    };

    // Make request to Jetcheckout API
    const jetcheckoutResponse = await fetch(
      'https://www.paytr.com/odeme/api/get-token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(jetcheckoutRequest as Record<string, string>),
      }
    );

    const jetcheckoutData = await jetcheckoutResponse.json();

    if (jetcheckoutData.status === 'success') {
      // Update transaction with payment reference
      await database.escrowTransaction.update({
        where: { id: transaction.id },
        data: {
          paymentReference: jetcheckoutData.token,
          updatedBy: userId,
        },
      });

      // Log activity
      await database.activity.create({
        data: {
          transactionId: transaction.id,
          performedBy: userId,
          type: 'PAYMENT_INITIATED',
          description: 'Payment initialization started',
          metadata: {
            paymentMethod: validatedData.paymentMethod,
            amount: transaction.amount.toString(),
            merchantOrderId,
          },
          createdBy: userId,
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          paymentUrl: `https://www.paytr.com/odeme/guvenli/${jetcheckoutData.token}`,
          token: jetcheckoutData.token,
        },
      });
    }
    // Update transaction status to failed
    await database.escrowTransaction.update({
      where: { id: transaction.id },
      data: {
        paymentStatus: 'FAILED',
        updatedBy: userId,
      },
    });

    return NextResponse.json(
      {
        error: 'Payment initialization failed',
        details: jetcheckoutData.reason,
      },
      { status: 400 }
    );
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

function generateHash(str: string): string {
  return crypto
    .createHmac('sha256', env.JETCHECKOUT_SECRET_KEY)
    .update(str)
    .digest('base64');
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  return '127.0.0.1';
}
