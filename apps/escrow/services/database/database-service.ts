/**
 * SPDX-License-Identifier: MIT
 */

import { database } from '@repo/database';

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface SortOptions {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class DatabaseService {
  private static instance: DatabaseService;

  private constructor() {}

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  /**
   * Execute a transaction with multiple operations
   */
  executeTransaction<T>(
    operations: (prisma: typeof database) => Promise<T>
  ): Promise<T> {
    return database.$transaction(operations);
  }

  /**
   * Generic pagination helper
   */
  async findWithPagination<T, K>(
    model: unknown,
    options: PaginationOptions & {
      where?: K;
      include?: unknown;
      orderBy?: unknown;
    }
  ): Promise<PaginationResult<T>> {
    const { page, limit, where, include, orderBy } = options;
    const skip = (page - 1) * limit;

    const [total, data] = await Promise.all([
      model.count({ where }),
      model.findMany({
        where,
        include,
        orderBy,
        skip,
        take: limit,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Soft delete helper
   */
  softDelete(model: unknown, id: string, deletedBy: string): Promise<unknown> {
    return model.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy,
        updatedBy: deletedBy,
      },
    });
  }

  /**
   * Restore soft deleted record
   */
  restore(model: unknown, id: string, restoredBy: string): Promise<unknown> {
    return model.update({
      where: { id },
      data: {
        deletedAt: null,
        deletedBy: null,
        updatedBy: restoredBy,
      },
    });
  }

  /**
   * Upsert helper
   */
  upsertRecord<T>(
    model: unknown,
    where: unknown,
    create: unknown,
    update: unknown
  ): Promise<T> {
    return model.upsert({
      where,
      create,
      update,
    });
  }

  /**
   * Bulk update helper
   */
  bulkUpdate(
    model: unknown,
    where: unknown,
    data: unknown
  ): Promise<{ count: number }> {
    return model.updateMany({
      where,
      data,
    });
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    details: unknown;
  }> {
    try {
      await database.$queryRaw`SELECT 1`;
      return {
        status: 'healthy',
        details: {
          connection: 'ok',
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          connection: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  /**
   * Get database metrics
   */
  async getMetrics(): Promise<{
    totalTransactions: number;
    totalUsers: number;
    totalPayments: number; // Always 0 - no payment model
    recentActivity: number;
  }> {
    const [totalTransactions, totalUsers, _totalPayments, recentActivity] =
      await Promise.all([
        database.escrowTransaction.count(),
        database.userProfile.count(),
        0, // No payment model in schema
        database.activity.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
            },
          },
        }),
      ]);

    return {
      totalTransactions,
      totalUsers,
      totalPayments: 0, // No payment model
      recentActivity,
    };
  }
}

// Repository classes for specific entities

export class EscrowRepository {
  private db = database;

  findById(id: string, include?: unknown) {
    return this.db.escrowTransaction.findUnique({
      where: { id },
      include,
    });
  }

  findByOrderId(orderId: string, include?: unknown) {
    return this.db.escrowTransaction.findUnique({
      where: { orderId },
      include,
    });
  }

  findByUser(
    userId: string,
    options: PaginationOptions &
      SortOptions & {
        status?: string[];
        category?: string;
      }
  ) {
    const {
      page,
      limit,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status,
      category,
    } = options;

    const where: Record<string, unknown> = {
      OR: [{ sellerId: userId }, { buyerId: userId }],
      deletedAt: null,
    };

    if (status && status.length > 0) {
      where.status = { in: status };
    }

    if (category) {
      where.category = category;
    }

    return DatabaseService.getInstance().findWithPagination(
      this.db.escrowTransaction,
      {
        page,
        limit,
        where,
        include: {
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
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
      }
    );
  }

  updateStatus(
    id: string,
    status: string,
    updatedBy: string,
    additionalData?: unknown
  ) {
    return this.db.escrowTransaction.update({
      where: { id },
      data: {
        status,
        updatedBy,
        version: { increment: 1 },
        ...additionalData,
      },
    });
  }

  getStatusCounts(userId?: string) {
    const where: Record<string, unknown> = { deletedAt: null };

    if (userId) {
      where.OR = [{ sellerId: userId }, { buyerId: userId }];
    }

    return this.db.escrowTransaction.groupBy({
      by: ['status'],
      where,
      _count: {
        status: true,
      },
    });
  }
}

export class UserRepository {
  private db = database;

  findByClerkId(userId: string) {
    return this.db.userProfile.findUnique({
      where: { userId },
    });
  }

  createOrUpdate(userId: string, data: unknown, updatedBy: string) {
    return this.db.userProfile.upsert({
      where: { userId },
      create: {
        userId,
        ...data,
        createdBy: updatedBy,
        updatedBy,
      },
      update: {
        ...data,
        updatedBy,
        version: { increment: 1 },
      },
    });
  }

  updateKycStatus(userId: string, status: string, updatedBy: string) {
    return this.db.userProfile.update({
      where: { userId },
      data: {
        kycStatus: status,
        updatedBy,
        version: { increment: 1 },
      },
    });
  }

  async getTransactionStats(userId: string) {
    const [sellerStats, buyerStats] = await Promise.all([
      this.db.escrowTransaction.groupBy({
        by: ['status'],
        where: {
          sellerId: userId,
          deletedAt: null,
        },
        _count: {
          status: true,
        },
        _sum: {
          amount: true,
        },
      }),
      this.db.escrowTransaction.groupBy({
        by: ['status'],
        where: {
          buyerId: userId,
          deletedAt: null,
        },
        _count: {
          status: true,
        },
        _sum: {
          amount: true,
        },
      }),
    ]);

    return { sellerStats, buyerStats };
  }
}

// PaymentRepository removed - no payment model in schema

export class ActivityRepository {
  private db = database;

  log(
    transactionId: string,
    performedBy: string,
    type: string,
    description: string,
    metadata: unknown,
    createdBy: string
  ) {
    return this.db.activity.create({
      data: {
        transactionId,
        performedBy,
        type,
        description,
        metadata,
        createdBy,
      },
    });
  }

  getTransactionLogs(transactionId: string, options: PaginationOptions) {
    return DatabaseService.getInstance().findWithPagination(this.db.activity, {
      ...options,
      where: { transactionId },
      orderBy: { createdAt: 'desc' },
    });
  }

  getUserActivity(
    performedBy: string,
    options: PaginationOptions & {
      types?: string[];
      dateFrom?: Date;
      dateTo?: Date;
    }
  ) {
    const { types, dateFrom, dateTo, ...paginationOptions } = options;

    const where: Record<string, unknown> = { performedBy };

    if (types && types.length > 0) {
      where.type = { in: types };
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = dateFrom;
      }
      if (dateTo) {
        where.createdAt.lte = dateTo;
      }
    }

    return DatabaseService.getInstance().findWithPagination(this.db.activity, {
      ...paginationOptions,
      where,
      include: {
        transaction: {
          select: {
            id: true,
            orderId: true,
            title: true,
            amount: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

// Export singleton instances
export const escrowRepository = new EscrowRepository();
export const userRepository = new UserRepository();
export const activityRepository = new ActivityRepository();
export const databaseService = DatabaseService.getInstance();
