/**
 * SPDX-License-Identifier: MIT
 */

import { Decimal } from '@prisma/client';
import { database } from '@repo/database';
import type {
  CreateEscrowInput,
  EscrowBusinessRules,
  EscrowStatus,
  ListTransactionsInput,
  TransactionResponse,
} from '../../types/escrow';
import { StateMachine } from '../state-machine/state-machine';

export class EscrowService {
  private stateMachine: StateMachine;
  private businessRules: EscrowBusinessRules;

  constructor() {
    this.stateMachine = new StateMachine();
    this.businessRules = {
      minimumAmount: 100, // 100 TRY minimum
      maximumAmount: 1000000, // 1M TRY maximum
      platformFeePercentage: 0.025, // 2.5%
      otpExpiryMinutes: 10,
      disputeTimeoutDays: 30,
      autoCompleteDeliveryDays: 7,
    };
  }

  /**
   * Create a new escrow transaction
   */
  async createTransaction(
    input: CreateEscrowInput,
    createdBy: string
  ): Promise<TransactionResponse> {
    try {
      // Validate business rules
      const validationError = this.validateCreateInput(input);
      if (validationError) {
        return {
          success: false,
          error: validationError,
        };
      }

      // Calculate fees
      const amount = new Decimal(input.amount);
      const platformFee = amount.mul(this.businessRules.platformFeePercentage);
      const sellerReceives = amount.sub(platformFee);

      // Generate unique order ID
      const orderId = this.generateOrderId();

      // Create transaction in database
      const transaction = await database.escrowTransaction.create({
        data: {
          orderId,
          sellerId: input.sellerId,
          buyerId: input.buyerId,
          amount: amount,
          currency: input.currency || 'TRY',
          platformFee,
          sellerReceives,
          status: 'DRAFT',
          paymentStatus: 'PENDING',
          category: input.category,
          title: input.title,
          description: input.description,
          productInfo: input.productInfo || {},
          otpVerified: false,
          sellerApproved: false,
          buyerApproved: false,
          disputed: false,
          createdBy,
          updatedBy: createdBy,
          version: 1,
        },
        include: {
          seller: true,
          buyer: true,
          vehicleInfo: true,
          documents: true,
          activities: true,
        },
      });

      // Create vehicle info if provided
      if (input.vehicleInfo) {
        await database.vehicleInfo.create({
          data: {
            transactionId: transaction.id,
            ...input.vehicleInfo,
            createdBy,
            updatedBy: createdBy,
          },
        });
      }

      // Log activity
      await this.logActivity(transaction.id, createdBy, 'TRANSACTION_CREATED', {
        orderId: transaction.orderId,
        amount: input.amount,
        category: input.category,
      });

      return {
        success: true,
        data: transaction as unknown,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to create transaction',
        details: error,
      };
    }
  }

  /**
   * Update transaction status with state machine validation
   */
  async updateTransactionStatus(
    transactionId: string,
    newStatus: EscrowStatus,
    updatedBy: string,
    metadata?: Record<string, unknown>
  ): Promise<TransactionResponse> {
    try {
      const transaction = await database.escrowTransaction.findUnique({
        where: { id: transactionId },
        include: {
          seller: true,
          buyer: true,
          vehicleInfo: true,
          documents: true,
          activities: true,
        },
      });

      if (!transaction) {
        return {
          success: false,
          error: 'Transaction not found',
        };
      }

      // Validate state transition
      const canTransition = this.stateMachine.canTransition(
        transaction.status as EscrowStatus,
        newStatus
      );

      if (!canTransition) {
        return {
          success: false,
          error: `Invalid transition from ${transaction.status} to ${newStatus}`,
        };
      }

      // Update transaction
      const updatedTransaction = await database.escrowTransaction.update({
        where: { id: transactionId },
        data: {
          status: newStatus,
          updatedBy,
          version: { increment: 1 },
          ...(newStatus === 'COMPLETED' && { completedAt: new Date() }),
          ...(newStatus === 'DELIVERED' && { deliveryConfirmedAt: new Date() }),
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
      await this.logActivity(transactionId, updatedBy, 'STATUS_UPDATED', {
        oldStatus: transaction.status,
        newStatus,
        ...metadata,
      });

      // Execute post-transition actions
      await this.executePostTransitionActions(
        updatedTransaction,
        newStatus,
        updatedBy
      );

      return {
        success: true,
        data: updatedTransaction as unknown,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to update transaction status',
        details: error,
      };
    }
  }

  /**
   * Get transaction by ID
   */
  async getTransactionById(
    transactionId: string,
    userId?: string
  ): Promise<TransactionResponse> {
    try {
      const transaction = await database.escrowTransaction.findUnique({
        where: { id: transactionId },
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
        return {
          success: false,
          error: 'Transaction not found',
        };
      }

      // Check access permissions if userId provided
      if (userId && !this.hasTransactionAccess(transaction, userId)) {
        return {
          success: false,
          error: 'Access denied',
        };
      }

      return {
        success: true,
        data: transaction as unknown,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch transaction',
        details: error,
      };
    }
  }

  /**
   * List transactions with filtering and pagination
   */
  async listTransactions(input: ListTransactionsInput): Promise<{
    success: boolean;
    data?: unknown[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    error?: string;
  }> {
    try {
      const {
        userId,
        status,
        category,
        minAmount,
        maxAmount,
        dateFrom,
        dateTo,
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = input;

      const where = this.buildTransactionFilters({
        userId,
        status,
        category,
        minAmount,
        maxAmount,
        dateFrom,
        dateTo,
      });

      // Get total count
      const total = await database.escrowTransaction.count({ where });

      // Get paginated results
      const transactions = await database.escrowTransaction.findMany({
        where,
        include: this.getTransactionIncludeOptions(),
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip: (page - 1) * limit,
        take: limit,
      });

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        data: transactions,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      };
    } catch (_error) {
      return {
        success: false,
        error: 'Failed to list transactions',
      };
    }
  }

  /**
   * Build where clause filters for transaction queries
   */
  private buildTransactionFilters(filters: {
    userId?: string;
    status?: string;
    category?: string;
    minAmount?: number;
    maxAmount?: number;
    dateFrom?: Date;
    dateTo?: Date;
  }): Record<string, unknown> {
    const where: Record<string, unknown> = {};
    const { userId, status, category, minAmount, maxAmount, dateFrom, dateTo } =
      filters;

    // User filter
    if (userId) {
      where.OR = [{ sellerId: userId }, { buyerId: userId }];
    }

    // Status filter
    if (status) {
      where.status = status;
    }

    // Category filter
    if (category) {
      where.category = category;
    }

    // Amount filters
    this.addAmountFilters(where, minAmount, maxAmount);

    // Date filters
    this.addDateFilters(where, dateFrom, dateTo);

    return where;
  }

  /**
   * Add amount range filters to where clause
   */
  private addAmountFilters(
    where: Record<string, unknown>,
    minAmount?: number,
    maxAmount?: number
  ): void {
    if (minAmount !== undefined || maxAmount !== undefined) {
      where.amount = {};
      if (minAmount !== undefined) {
        where.amount.gte = new Decimal(minAmount);
      }
      if (maxAmount !== undefined) {
        where.amount.lte = new Decimal(maxAmount);
      }
    }
  }

  /**
   * Add date range filters to where clause
   */
  private addDateFilters(
    where: Record<string, unknown>,
    dateFrom?: Date,
    dateTo?: Date
  ): void {
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = dateFrom;
      }
      if (dateTo) {
        where.createdAt.lte = dateTo;
      }
    }
  }

  /**
   * Get standard include options for transaction queries
   */
  private getTransactionIncludeOptions() {
    return {
      seller: {
        select: {
          id: true,
          fullName: true,
          phone: true,
        },
      },
      buyer: {
        select: {
          id: true,
          fullName: true,
          phone: true,
        },
      },
      vehicleInfo: true,
    };
  }

  /**
   * Cancel transaction
   */
  cancelTransaction(
    transactionId: string,
    cancelledBy: string,
    reason?: string
  ): Promise<TransactionResponse> {
    return this.updateTransactionStatus(
      transactionId,
      'CANCELLED',
      cancelledBy,
      { reason }
    );
  }

  /**
   * Complete transaction
   */
  completeTransaction(
    transactionId: string,
    completedBy: string
  ): Promise<TransactionResponse> {
    return this.updateTransactionStatus(
      transactionId,
      'COMPLETED',
      completedBy
    );
  }

  /**
   * Raise dispute
   */
  async raiseDispute(
    transactionId: string,
    raisedBy: string,
    reason: string
  ): Promise<TransactionResponse> {
    try {
      // Update transaction with dispute info
      await database.escrowTransaction.update({
        where: { id: transactionId },
        data: {
          disputed: true,
          disputeReason: reason,
          disputeRaisedBy: raisedBy,
          disputeRaisedAt: new Date(),
          updatedBy: raisedBy,
        },
      });

      // Update transaction status
      return this.updateTransactionStatus(transactionId, 'DISPUTED', raisedBy, {
        disputeReason: reason,
        disputeRaisedBy: raisedBy,
        disputeRaisedAt: new Date(),
      });
    } catch (error) {
      return {
        success: false,
        error: 'Failed to raise dispute',
        details: error,
      };
    }
  }

  // Private helper methods

  private validateCreateInput(input: CreateEscrowInput): string | null {
    if (input.amount < this.businessRules.minimumAmount) {
      return `Amount must be at least ${this.businessRules.minimumAmount} ${input.currency || 'TRY'}`;
    }

    if (input.amount > this.businessRules.maximumAmount) {
      return `Amount cannot exceed ${this.businessRules.maximumAmount} ${input.currency || 'TRY'}`;
    }

    if (!input.title?.trim()) {
      return 'Product title is required';
    }

    if (!input.category?.trim()) {
      return 'Product category is required';
    }

    return null;
  }

  private generateOrderId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9).toUpperCase();
    return `ESC-${timestamp}-${random}`;
  }

  private hasTransactionAccess(transaction: unknown, userId: string): boolean {
    return (
      transaction.sellerId === userId ||
      transaction.buyerId === userId ||
      this.isAdmin(userId)
    ); // Implement admin check
  }

  private isAdmin(_userId: string): boolean {
    // Implement admin role check
    return false;
  }

  private async logActivity(
    transactionId: string,
    userId: string,
    action: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    await database.activity.create({
      data: {
        transactionId: transactionId,
        performedBy: userId,
        type: action,
        description: `Action: ${action}`,
        metadata: metadata || {},
        createdBy: userId,
      },
    });
  }

  private async executePostTransitionActions(
    transaction: unknown,
    newStatus: EscrowStatus,
    _updatedBy: string
  ): Promise<void> {
    switch (newStatus) {
      case 'FUNDS_HELD':
        // Send notification to seller
        await this.notifySeller(transaction, 'payment_received');
        break;

      case 'DELIVERED':
        // Start auto-completion timer
        await this.scheduleAutoCompletion(transaction.id);
        break;

      case 'COMPLETED':
        // Release funds to seller
        await this.releaseFunds(transaction);
        break;

      case 'REFUNDED':
        // Process refund
        await this.processRefund(transaction);
        break;

      default:
        // No additional actions required for other statuses
        break;
    }
  }

  private async notifySeller(
    _transaction: unknown,
    _event: string
  ): Promise<void> {
    // TODO: Implement notification logic
  }

  private async scheduleAutoCompletion(_transactionId: string): Promise<void> {
    // TODO: Implement auto-completion scheduling
  }

  private async releaseFunds(_transaction: unknown): Promise<void> {
    // TODO: Implement funds release logic
  }

  private async processRefund(_transaction: unknown): Promise<void> {
    // TODO: Implement refund processing logic
  }
}
