/**
 * SPDX-License-Identifier: MIT
 */

import crypto from 'node:crypto';
import { database } from '@repo/database';
import { env } from '../../env';
import type { PaymentMethod, PaymentStatus } from '../../types/escrow';

export interface PaymentRequest {
  escrowTransactionId: string;
  paymentMethod: PaymentMethod;
  amount: number;
  currency: string;
  returnUrl: string;
  cancelUrl: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address?: string;
    ip: string;
  };
}

export interface PaymentResponse {
  success: boolean;
  paymentUrl?: string;
  token?: string;
  error?: string;
  details?: unknown;
}

export interface WebhookPayload {
  merchant_oid: string;
  status: string;
  total_amount: string;
  hash: string;
  failed_reason_code?: string;
  failed_reason_msg?: string;
  test_mode?: string;
  payment_type?: string;
  currency?: string;
  payment_amount?: string;
}

export interface RefundRequest {
  escrowTransactionId: string;
  amount?: number;
  reason?: string;
}

export interface RefundResponse {
  success: boolean;
  refundId?: string;
  error?: string;
  details?: unknown;
}

export class PaymentService {
  private readonly apiUrl: string;
  private readonly merchantKey: string;
  private readonly merchantSalt: string;
  private readonly webhookSecret: string;

  constructor() {
    this.apiUrl = 'https://www.paytr.com/odeme/api';
    this.merchantKey = env.JETCHECKOUT_API_KEY;
    this.merchantSalt = env.JETCHECKOUT_SECRET_KEY;
    this.webhookSecret = env.JETCHECKOUT_WEBHOOK_SECRET;
  }

  /**
   * Initialize a payment with Jetcheckout
   */
  async initializePayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      // Get escrow transaction
      const transaction = await database.escrowTransaction.findUnique({
        where: { id: request.escrowTransactionId },
      });

      if (!transaction) {
        return {
          success: false,
          error: 'Escrow transaction not found',
        };
      }

      // Update transaction to processing
      await database.escrowTransaction.update({
        where: { id: request.escrowTransactionId },
        data: {
          paymentStatus: 'PROCESSING',
          updatedBy: request.customerInfo.email,
        },
      });

      // Prepare Jetcheckout request
      const merchantOrderId = `${transaction.orderId}-${Date.now()}`;
      const userBasket = this.prepareUserBasket(request);

      // Generate security hash
      const hashStr = `${this.merchantKey}${userBasket}${request.amount}${request.currency}${merchantOrderId}${this.merchantSalt}`;
      const paytrToken = this.generateHash(hashStr);

      const jetcheckoutPayload = {
        merchant_id: this.merchantKey,
        merchant_oid: merchantOrderId,
        user_name: request.customerInfo.name,
        user_address: request.customerInfo.address || 'Not provided',
        user_phone: request.customerInfo.phone,
        user_basket: userBasket,
        user_ip: request.customerInfo.ip,
        email: request.customerInfo.email,
        payment_amount: request.amount.toString(),
        currency: request.currency,
        test_mode: env.NODE_ENV === 'development' ? '1' : '0',
        non_3d: '0', // Force 3D Secure
        merchant_ok_url: request.returnUrl,
        merchant_fail_url: request.cancelUrl,
        paytr_token: paytrToken,
        debug_on: env.NODE_ENV === 'development' ? '1' : '0',
        lang: 'tr', // Default to Turkish
      };

      // Make request to Jetcheckout API
      const response = await fetch(`${this.apiUrl}/get-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(jetcheckoutPayload),
      });

      const result = await response.json();

      if (result.status === 'success') {
        // Update transaction with payment reference
        await database.escrowTransaction.update({
          where: { id: request.escrowTransactionId },
          data: {
            paymentReference: result.token,
            updatedBy: request.customerInfo.email,
          },
        });

        return {
          success: true,
          paymentUrl: `https://www.paytr.com/odeme/guvenli/${result.token}`,
          token: result.token,
        };
      }
      // Update transaction status to failed
      await database.escrowTransaction.update({
        where: { id: request.escrowTransactionId },
        data: {
          paymentStatus: 'FAILED',
          updatedBy: request.customerInfo.email,
        },
      });

      return {
        success: false,
        error: 'Payment initialization failed',
        details: result.reason || 'Unknown error',
      };
    } catch (error) {
      return {
        success: false,
        error: 'Payment initialization failed',
        details: error,
      };
    }
  }

  /**
   * Verify payment status
   */
  async verifyPayment(escrowTransactionId: string): Promise<{
    success: boolean;
    status?: PaymentStatus;
    error?: string;
    transaction?: unknown;
  }> {
    try {
      const transaction = await database.escrowTransaction.findUnique({
        where: { id: escrowTransactionId },
      });

      if (!transaction) {
        return {
          success: false,
          error: 'Transaction not found',
        };
      }

      // If payment is already completed, return current status
      if (transaction.paymentStatus === 'SUCCESS') {
        return {
          success: true,
          status: transaction.paymentStatus as PaymentStatus,
          transaction,
        };
      }

      // Query Jetcheckout for payment status
      const statusResponse = await this.queryPaymentStatus(
        transaction.paymentReference || ''
      );

      if (statusResponse.success && statusResponse.status) {
        // Update payment status in database
        const updatedTransaction = await database.escrowTransaction.update({
          where: { id: escrowTransactionId },
          data: {
            paymentStatus: statusResponse.status,
            updatedBy: 'system',
          },
        });

        return {
          success: true,
          status: statusResponse.status,
          transaction: updatedTransaction,
        };
      }

      return {
        success: false,
        error: 'Failed to verify payment status',
      };
    } catch (_error) {
      return {
        success: false,
        error: 'Payment verification failed',
      };
    }
  }

  /**
   * Handle webhook from Jetcheckout
   */
  async handleWebhook(payload: WebhookPayload): Promise<{
    success: boolean;
    processed?: boolean;
    error?: string;
  }> {
    try {
      // Verify webhook signature
      if (!this.verifyWebhookSignature(payload)) {
        return {
          success: false,
          error: 'Invalid webhook signature',
        };
      }

      // Find transaction by order reference
      const transaction = await database.escrowTransaction.findFirst({
        where: {
          OR: [
            { orderId: { contains: payload.merchant_oid.split('-')[0] } },
            { paymentReference: payload.merchant_oid },
          ],
        },
      });

      if (!transaction) {
        return {
          success: false,
          error: 'Transaction not found',
        };
      }

      // Determine payment status based on webhook payload
      const paymentStatus = this.mapJetcheckoutStatus(payload.status);
      const escrowStatus =
        paymentStatus === 'SUCCESS' ? 'FUNDS_HELD' : transaction.status;

      // Update transaction record
      await database.escrowTransaction.update({
        where: { id: transaction.id },
        data: {
          paymentStatus,
          status: escrowStatus,
          paymentReference: payload.merchant_oid,
          updatedBy: 'webhook',
          ...(paymentStatus === 'SUCCESS' && { paidAt: new Date() }),
        },
      });

      // Log activity
      await database.activity.create({
        data: {
          transactionId: transaction.id,
          performedBy: 'system',
          type:
            paymentStatus === 'SUCCESS'
              ? 'PAYMENT_COMPLETED'
              : 'PAYMENT_FAILED',
          description: `Payment ${paymentStatus.toLowerCase()}`,
          metadata: {
            amount: payload.total_amount,
            currency: payload.currency,
            paymentType: payload.payment_type,
            ...(payload.failed_reason_msg && {
              failureReason: payload.failed_reason_msg,
            }),
          },
          createdBy: 'webhook',
        },
      });

      // Send notifications (implement notification service)
      if (paymentStatus === 'SUCCESS') {
        await this.notifyPaymentCompleted(transaction);
      } else if (paymentStatus === 'FAILED') {
        await this.notifyPaymentFailed(transaction, payload.failed_reason_msg);
      }

      return {
        success: true,
        processed: true,
      };
    } catch (_error) {
      return {
        success: false,
        error: 'Webhook processing failed',
      };
    }
  }

  /**
   * Process refund
   */
  async processRefund(request: RefundRequest): Promise<RefundResponse> {
    try {
      const transaction = await database.escrowTransaction.findUnique({
        where: { id: request.escrowTransactionId },
      });

      if (!transaction) {
        return {
          success: false,
          error: 'Transaction not found',
        };
      }

      if (transaction.paymentStatus !== 'SUCCESS') {
        return {
          success: false,
          error: 'Payment is not in success status',
        };
      }

      const refundAmount = request.amount || Number(transaction.amount);

      // Prepare refund request to Jetcheckout
      const refundPayload = {
        merchant_id: this.merchantKey,
        merchant_oid: transaction.paymentReference || transaction.orderId,
        return_amount: refundAmount.toString(),
        paytr_token: this.generateRefundHash(
          transaction.paymentReference || transaction.orderId,
          refundAmount
        ),
      };

      // Make refund request to Jetcheckout
      const response = await fetch(`${this.apiUrl}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(refundPayload),
      });

      const result = await response.json();

      if (result.status === 'success') {
        // Update transaction status
        await database.escrowTransaction.update({
          where: { id: request.escrowTransactionId },
          data: {
            paymentStatus: 'REFUNDED',
            status: 'REFUNDED',
            updatedBy: 'system',
          },
        });

        // Log refund activity
        await database.activity.create({
          data: {
            transactionId: transaction.id,
            performedBy: 'system',
            type: 'REFUNDED',
            description: 'Payment refunded',
            metadata: {
              refundAmount,
              reason: request.reason,
            },
            createdBy: 'system',
          },
        });

        return {
          success: true,
          refundId: result.refund_id,
        };
      }
      return {
        success: false,
        error: 'Refund failed',
        details: result.reason || 'Unknown error',
      };
    } catch (error) {
      return {
        success: false,
        error: 'Refund processing failed',
        details: error,
      };
    }
  }

  // Private helper methods

  private prepareUserBasket(request: PaymentRequest): string {
    const basket = [['Escrow Transaction', request.amount.toString(), 1]];
    return JSON.stringify(basket);
  }

  private generateHash(data: string): string {
    return crypto
      .createHmac('sha256', this.merchantSalt)
      .update(data)
      .digest('base64');
  }

  private generateRefundHash(merchantOid: string, amount: number): string {
    const hashStr = `${this.merchantKey}${merchantOid}${amount}${this.merchantSalt}`;
    return this.generateHash(hashStr);
  }

  private verifyWebhookSignature(payload: WebhookPayload): boolean {
    const hashStr = `${payload.merchant_oid}${this.merchantSalt}${payload.status}${payload.total_amount}`;
    const expectedHash = this.generateHash(hashStr);
    return expectedHash === payload.hash;
  }

  private mapJetcheckoutStatus(jetcheckoutStatus: string): PaymentStatus {
    switch (jetcheckoutStatus.toLowerCase()) {
      case 'success':
        return 'SUCCESS';
      case 'failed':
        return 'FAILED';
      case 'pending':
        return 'PROCESSING';
      default:
        return 'PENDING';
    }
  }

  private async queryPaymentStatus(gatewayReference: string): Promise<{
    success: boolean;
    status?: PaymentStatus;
    details?: unknown;
  }> {
    try {
      // Implement payment status query to Jetcheckout
      const payload = {
        merchant_id: this.merchantKey,
        merchant_oid: gatewayReference,
        paytr_token: this.generateHash(
          `${this.merchantKey}${gatewayReference}${this.merchantSalt}`
        ),
      };

      const response = await fetch(`${this.apiUrl}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(payload),
      });

      const result = await response.json();

      if (result.status) {
        return {
          success: true,
          status: this.mapJetcheckoutStatus(result.status),
          details: result,
        };
      }

      return {
        success: false,
      };
    } catch (_error) {
      return {
        success: false,
      };
    }
  }

  private async notifyPaymentCompleted(_transaction: unknown): Promise<void> {
    // TODO: Implement payment completion notification
  }

  private async notifyPaymentFailed(
    _transaction: unknown,
    _reason?: string
  ): Promise<void> {
    // TODO: Implement payment failure notification
  }
}
