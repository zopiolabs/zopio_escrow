/**
 * SPDX-License-Identifier: MIT
 */

import type { Decimal } from '@prisma/client';

export type EscrowStatus =
  | 'DRAFT'
  | 'PENDING_BUYER'
  | 'PENDING_PAYMENT'
  | 'PAYMENT_PROCESSING'
  | 'FUNDS_HELD'
  | 'PENDING_DELIVERY'
  | 'DELIVERED'
  | 'PENDING_RELEASE'
  | 'COMPLETED'
  | 'DISPUTED'
  | 'CANCELLED'
  | 'REFUNDED';

export type PaymentStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'SUCCESS'
  | 'FAILED'
  | 'CANCELLED'
  | 'REFUNDED'
  | 'PARTIAL_REFUND';

export type KYCStatus = 'PENDING' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED';

export type UserType = 'INDIVIDUAL' | 'CORPORATE';

export type PaymentMethod = 'CREDIT_CARD' | 'BANK_TRANSFER' | 'DIGITAL_WALLET';

export type DocumentType =
  | 'VEHICLE_REGISTRATION'
  | 'ASSIGNMENT_FORM'
  | 'DELIVERY_PROOF'
  | 'ID_VERIFICATION'
  | 'PRODUCT_IMAGE'
  | 'OTHER';

export interface CreateEscrowInput {
  sellerId: string;
  buyerId?: string;

  // Product Information
  category: string;
  title: string;
  description?: string;
  productInfo?: Record<string, unknown>;

  // Vehicle Information (optional)
  vehicleInfo?: {
    brand?: string;
    model?: string;
    year?: number;
    mileage?: number;
    plateNumber?: string;
    color?: string;
    engineSize?: string;
    fuelType?: string;
    transmission?: string;
  };

  // Financial Information
  amount: number;
  currency?: string;
}

export interface UpdateEscrowInput {
  status?: EscrowStatus;
  buyerId?: string;
  description?: string;
  productInfo?: Record<string, unknown>;
  vehicleInfo?: {
    brand?: string;
    model?: string;
    year?: number;
    mileage?: number;
    plateNumber?: string;
    color?: string;
    engineSize?: string;
    fuelType?: string;
    transmission?: string;
  };
}

export interface EscrowTransaction {
  id: string;
  orderId: string;
  sellerId: string;
  buyerId?: string | null;
  amount: Decimal;
  currency: string;
  platformFee: Decimal;
  sellerReceives: Decimal;
  status: EscrowStatus;
  paymentStatus: PaymentStatus;
  paymentReference?: string | null;
  category: string;
  title: string;
  description?: string | null;
  productInfo: Record<string, unknown>;
  otpVerified: boolean;
  otpCode?: string | null;
  otpExpiresAt?: Date | null;
  sellerApproved: boolean;
  buyerApproved: boolean;
  sellerApprovedAt?: Date | null;
  buyerApprovedAt?: Date | null;
  disputed: boolean;
  disputeReason?: string | null;
  disputeRaisedBy?: string | null;
  disputeRaisedAt?: Date | null;
  disputeResolvedAt?: Date | null;
  completedAt?: Date | null;
  deliveryConfirmedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  version: number;
}

export interface UserProfile {
  id: string;
  userId: string;
  fullName?: string | null;
  identityNumber?: string | null;
  birthDate?: Date | null;
  phone?: string | null;
  phoneVerified: boolean;
  companyTitle?: string | null;
  taxNumber?: string | null;
  taxOffice?: string | null;
  iban?: string | null;
  accountHolder?: string | null;
  address?: string | null;
  kycStatus: KYCStatus;
  kycDocuments: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionResponse {
  success: boolean;
  data?: EscrowTransaction;
  error?: string;
  details?: unknown;
}

export interface ListTransactionsInput {
  userId?: string;
  status?: EscrowStatus;
  category?: string;
  minAmount?: number;
  maxAmount?: number;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'amount';
  sortOrder?: 'asc' | 'desc';
}

export interface StateTransition {
  from: EscrowStatus;
  to: EscrowStatus;
  conditions?: string[];
  actions?: string[];
}

export interface EscrowBusinessRules {
  minimumAmount: number;
  maximumAmount: number;
  platformFeePercentage: number;
  otpExpiryMinutes: number;
  disputeTimeoutDays: number;
  autoCompleteDeliveryDays: number;
}
