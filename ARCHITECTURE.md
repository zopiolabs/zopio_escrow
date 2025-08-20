# Paylox Escrow System - Comprehensive Architecture & Implementation Plan

## Executive Summary

The Paylox Escrow System will be built using the Zopio Framework as the foundation, integrating Jetcheckout API for payment processing, with custom escrow logic to bridge the functionality gap. The system will support Turkish and English languages, handle vehicle/product transactions, and provide secure multi-party approval workflows.

**Key Findings:**

- Zopio Framework provides 85-90% of required infrastructure
- Jetcheckout API handles payment processing but lacks native escrow features
- Custom escrow logic layer needed to bridge functionality gaps
- MVP deliverable in 2-day sprint with 3 developers

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────┐
│              Client Applications                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │   Web    │  │  Mobile  │  │ Admin Portal │  │
│  │  (Next)  │  │  (PWA)   │  │   (Next)     │  │
│  └──────────┘  └──────────┘  └──────────────┘  │
└─────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────┐
│           API Gateway (Next.js API)             │
│  ┌──────────────────────────────────────────┐  │
│  │   Authentication (Clerk) + RBAC/ABAC     │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────┐
│            Business Logic Layer                 │
│  ┌──────────┐  ┌──────────┐  ┌────────────┐   │
│  │  Escrow  │  │  Payment │  │   User     │   │
│  │  Engine  │  │  Service │  │  Service   │   │
│  └──────────┘  └──────────┘  └────────────┘   │
│  ┌──────────┐  ┌──────────┐  ┌────────────┐   │
│  │Document  │  │   OTP    │  │Notification│   │
│  │ Service  │  │  Service │  │  Service   │   │
│  └──────────┘  └──────────┘  └────────────┘   │
└─────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────┐
│            Data Layer                           │
│  ┌──────────┐  ┌──────────┐  ┌────────────┐   │
│  │PostgreSQL│  │   Redis  │  │ Vercel Blob│   │
│  │ (Primary)│  │  (Cache) │  │(Documents) │   │
│  └──────────┘  └──────────┘  └────────────┘   │
└─────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────┐
│            External Services                    │
│  ┌──────────┐  ┌──────────┐  ┌────────────┐   │
│  │Jetcheckout│  │  Clerk   │  │   Resend   │   │
│  │   API    │  │   Auth   │  │   Email    │   │
│  └──────────┘  └──────────┘  └────────────┘   │
│  ┌──────────┐  ┌──────────┐  ┌────────────┐   │
│  │  Knock   │  │  Sentry  │  │  PostHog   │   │
│  │ Notific. │  │ Monitor  │  │ Analytics  │   │
│  └──────────┘  └──────────┘  └────────────┘   │
└─────────────────────────────────────────────────┘
```

### Component Analysis Based on Requirements

#### From HTML Template Analysis

**Required Features Identified:**

1. **Multi-step Forms**: seller-info.html, recipient-info.html, product-info.html, payment.html
2. **OTP Verification**: Email-based OTP via Clerk authentication system
3. **Dashboard**: index.html with listing management and settings
4. **Payment Processing**: Credit card, saved cards, partial payments
5. **Document Management**: Vehicle registration, assignment forms
6. **Turkish/English Localization**: Throughout all interfaces

#### From Zopio Framework Capabilities

**Available Infrastructure (85-90% coverage):**

- ✅ Authentication & RBAC via Clerk
- ✅ Database with Prisma/PostgreSQL
- ✅ Payment processing via Stripe (adaptable to Jetcheckout)
- ✅ File storage via Vercel Blob
- ✅ Email system via Resend
- ✅ UI components via shadcn/ui
- ✅ Internationalization support
- ✅ Real-time features via Liveblocks
- ✅ Analytics via PostHog/Sentry

#### From Jetcheckout API Analysis

**Payment Gateway Features:**

- ✅ Credit card processing with 3D Secure
- ✅ Multiple payment methods (cards, wallets, transfers)
- ✅ Refund and cancellation support
- ✅ Webhook notifications
- ❌ **Missing**: Native escrow/fund holding capabilities
- ❌ **Missing**: Multi-party approval workflows
- ❌ **Missing**: Dispute resolution system

### Hybrid Integration Strategy

```
┌─────────────────────────────────────────┐
│         Zopio Escrow Platform           │
├─────────────────────────────────────────┤
│  Custom Escrow Logic Layer              │
│  - Fund holding simulation              │
│  - Multi-party approval                 │
│  - Dispute management                   │
│  - Document verification                │
│  - State machine management             │
├─────────────────────────────────────────┤
│  Integration Orchestration Layer        │
│  - Payment orchestration                │
│  - Webhook coordination                 │
│  - State synchronization                │
│  - Event handling                       │
├─────────────────────────────────────────┤
│  Zopio Framework Services               │
│  - Authentication (Clerk)               │
│  - Database (Prisma)                    │
│  - Storage (Vercel Blob)                │
│  - Email (Resend)                       │
│  - UI (shadcn/ui)                       │
├─────────────────────────────────────────┤
│  External Service Integration           │
│  - Jetcheckout (Payment Processing)     │
│  - Email OTP (via Clerk)               │
│  - Document Verification                │
└─────────────────────────────────────────┘
```

## Technical Implementation

### 1. Database Schema (Prisma)

```prisma
// User extension for escrow-specific data
model UserProfile {
  id              String   @id @default(cuid())
  userId          String   @unique // Clerk user ID
  
  // Individual Info
  fullName        String?
  identityNumber  String?  // Turkish ID
  birthDate       DateTime?
  phone           String?
  phoneVerified   Boolean  @default(false)
  
  // Corporate Info
  companyTitle    String?
  taxNumber       String?
  taxOffice       String?
  
  // Financial Info
  iban            String?
  accountHolder   String?
  
  // Address
  address         String?
  
  // Verification
  kycStatus       KYCStatus @default(PENDING)
  kycDocuments    String[] // URLs to verification documents
  
  // Relationships
  sellerTransactions  EscrowTransaction[] @relation("SellerTransactions")
  buyerTransactions   EscrowTransaction[] @relation("BuyerTransactions")
  
  // Audit Trail Fields
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  createdBy       String   // User ID who created this profile
  updatedBy       String   // User ID who last updated this profile
  version         Int      @default(1) // Optimistic locking
  
  // Soft Delete
  deletedAt       DateTime?
  deletedBy       String?  // User ID who deleted this profile
  
  @@index([createdBy])
  @@index([updatedBy])
  @@index([deletedAt])
}

model EscrowTransaction {
  id                String   @id @default(cuid())
  orderId           String   @unique
  
  // Parties
  sellerId          String
  seller            UserProfile @relation("SellerTransactions", fields: [sellerId], references: [userId])
  buyerId           String?
  buyer             UserProfile? @relation("BuyerTransactions", fields: [buyerId], references: [userId])
  
  // Financial Details
  amount            Decimal  @db.Decimal(12, 2)
  currency          String   @default("TRY")
  platformFee       Decimal  @db.Decimal(10, 2)
  sellerReceives    Decimal  @db.Decimal(12, 2)
  
  // Status Management
  status            EscrowStatus
  paymentStatus     PaymentStatus
  paymentReference  String?  // Jetcheckout payment ID
  
  // Product/Service Information
  category          String
  title             String
  description       String?
  productInfo       Json     // Flexible product data
  
  // Vehicle-specific (when applicable)
  vehicleInfo       VehicleInfo?
  
  // Documents
  documents         Document[]
  
  // Verification & Approval
  otpVerified       Boolean  @default(false)
  otpCode           String?
  otpExpiresAt      DateTime?
  sellerApproved    Boolean  @default(false)
  buyerApproved     Boolean  @default(false)
  sellerApprovedAt  DateTime?
  buyerApprovedAt   DateTime?
  
  // Delivery Information
  deliveryMethod    String?
  trackingNumber    String?
  deliveryAddress   String?
  deliveryProof     String?  // Document URL
  
  // Dispute Management
  disputed          Boolean  @default(false)
  disputeReason     String?
  disputeRaisedBy   String?
  disputeRaisedAt   DateTime?
  disputeResolvedAt DateTime?
  
  // Timestamps
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  paidAt            DateTime?
  shippedAt         DateTime?
  deliveredAt       DateTime?
  releasedAt        DateTime?
  completedAt       DateTime?
  
  // Enhanced Audit Trail
  statusHistory     StatusHistory[]
  activities        Activity[]
  auditLogs         AuditLog[]
  
  // Audit Trail Fields
  createdBy         String   // User ID who created this transaction
  updatedBy         String   // User ID who last updated this transaction
  version           Int      @default(1) // Optimistic locking
  
  // Soft Delete
  deletedAt         DateTime?
  deletedBy         String?  // User ID who deleted this transaction
  
  @@index([sellerId])
  @@index([buyerId])
  @@index([status])
  @@index([paymentStatus])
  @@index([createdAt])
  @@index([createdBy])
  @@index([updatedBy])
  @@index([deletedAt])
}

model VehicleInfo {
  id              String   @id @default(cuid())
  transactionId   String   @unique
  transaction     EscrowTransaction @relation(fields: [transactionId], references: [id])
  
  vin             String   // 17-character VIN
  licensePlate    String
  brand           String
  model           String
  year            Int
  color           String?
  mileage         Int?
  
  // Registration Documents
  registrationDoc String?  // URL to document
  
  // Audit Trail Fields
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  createdBy       String   // User ID who created this vehicle info
  updatedBy       String   // User ID who last updated this vehicle info
  version         Int      @default(1) // Optimistic locking
  
  // Soft Delete
  deletedAt       DateTime?
  deletedBy       String?  // User ID who deleted this vehicle info
  
  @@index([createdBy])
  @@index([updatedBy])
  @@index([deletedAt])
}

model Document {
  id              String   @id @default(cuid())
  transactionId   String
  transaction     EscrowTransaction @relation(fields: [transactionId], references: [id])
  
  type            DocumentType
  url             String   // Vercel Blob URL
  fileName        String
  fileSize        Int
  mimeType        String
  
  uploadedBy      String   // User ID
  uploadedAt      DateTime @default(now())
  
  // Verification
  verified        Boolean  @default(false)
  verifiedBy      String?
  verifiedAt      DateTime?
  verificationNotes String?
  
  // Audit Trail Fields
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  createdBy       String   // User ID who created this document record
  updatedBy       String   // User ID who last updated this document
  version         Int      @default(1) // Optimistic locking
  
  // Soft Delete
  deletedAt       DateTime?
  deletedBy       String?  // User ID who deleted this document
  
  @@index([transactionId])
  @@index([uploadedBy])
  @@index([verifiedBy])
  @@index([createdBy])
  @@index([updatedBy])
  @@index([deletedAt])
}

model StatusHistory {
  id              String   @id @default(cuid())
  transactionId   String
  transaction     EscrowTransaction @relation(fields: [transactionId], references: [id])
  
  fromStatus      EscrowStatus?
  toStatus        EscrowStatus
  changedBy       String   // User ID or system
  reason          String?
  metadata        Json?
  
  // Audit Trail Fields
  createdAt       DateTime @default(now())
  createdBy       String   // User ID who created this status change record
  
  // Immutable record - no updatedAt/updatedBy needed
  // StatusHistory entries should never be modified after creation
  
  @@index([transactionId])
  @@index([changedBy])
  @@index([createdBy])
  @@index([createdAt])
}

model Activity {
  id              String   @id @default(cuid())
  transactionId   String
  transaction     EscrowTransaction @relation(fields: [transactionId], references: [id])
  
  type            ActivityType
  description     String
  performedBy     String   // User ID or system
  metadata        Json?
  
  // Audit Trail Fields
  createdAt       DateTime @default(now())
  createdBy       String   // User ID who created this activity record
  
  // Immutable record - no updatedAt/updatedBy needed
  // Activity entries should never be modified after creation
  
  @@index([transactionId])
  @@index([performedBy])
  @@index([createdBy])
  @@index([createdAt])
  @@index([type])
}

model AuditLog {
  id              String   @id @default(cuid())
  
  // What was changed
  entityType      String   // Model name (e.g., "UserProfile", "EscrowTransaction")
  entityId        String   // ID of the entity that was changed
  transactionId   String?  // Optional: Link to transaction if applicable
  transaction     EscrowTransaction? @relation(fields: [transactionId], references: [id])
  
  // Change Details
  action          AuditAction // CREATE, UPDATE, DELETE, STATUS_CHANGE
  fieldName       String?  // Specific field that was changed (null for full record operations)
  oldValue        Json?    // Previous value (null for CREATE)
  newValue        Json?    // New value (null for DELETE)
  
  // Context
  userId          String   // User who performed the action
  userRole        String?  // User's role at time of action
  ipAddress       String?  // IP address of the user
  userAgent       String?  // Browser/app information
  sessionId       String?  // Session identifier
  
  // Business Context
  reason          String?  // Optional reason for the change
  metadata        Json?    // Additional context data
  
  // Security & Integrity
  checksum        String?  // Hash for integrity verification
  
  // Timestamps
  createdAt       DateTime @default(now())
  
  // Immutable - audit logs should never be modified
  // No updatedAt, updatedBy, deletedAt fields
  
  @@index([entityType, entityId])
  @@index([transactionId])
  @@index([userId])
  @@index([action])
  @@index([createdAt])
  @@index([checksum])
}

// Enums
enum KYCStatus {
  PENDING
  IN_REVIEW
  APPROVED
  REJECTED
}

enum EscrowStatus {
  DRAFT           // Initial creation
  PENDING_BUYER   // Waiting for buyer information
  PENDING_PAYMENT // Ready for payment
  PAYMENT_PROCESSING // Payment in progress
  FUNDS_HELD      // Payment successful, funds held
  PENDING_DELIVERY // Awaiting shipment/delivery
  DELIVERED       // Item delivered, awaiting confirmation
  PENDING_RELEASE // Buyer confirmed, awaiting final release
  COMPLETED       // Funds released, transaction complete
  DISPUTED        // Dispute raised
  CANCELLED       // Transaction cancelled
  REFUNDED        // Refund processed
}

enum PaymentStatus {
  PENDING
  PROCESSING
  SUCCESS
  FAILED
  CANCELLED
  REFUNDED
  PARTIAL_REFUND
}

enum DocumentType {
  VEHICLE_REGISTRATION
  ASSIGNMENT_FORM
  DELIVERY_PROOF
  ID_VERIFICATION
  PRODUCT_IMAGE
  OTHER
}

enum ActivityType {
  CREATED
  UPDATED
  PAYMENT_INITIATED
  PAYMENT_COMPLETED
  PAYMENT_FAILED
  DELIVERED
  APPROVED
  DISPUTED
  RESOLVED
  CANCELLED
  REFUNDED
  DOCUMENT_UPLOADED
  DOCUMENT_VERIFIED
  PROFILE_UPDATED
  VEHICLE_INFO_UPDATED
  AUDIT_LOG_CREATED
}

enum AuditAction {
  CREATE
  UPDATE
  DELETE
  SOFT_DELETE
  RESTORE
  STATUS_CHANGE
  APPROVAL_GRANTED
  APPROVAL_REVOKED
  PAYMENT_PROCESSED
  DOCUMENT_UPLOADED
  DOCUMENT_VERIFIED
  DOCUMENT_DELETED
  DISPUTE_RAISED
  DISPUTE_RESOLVED
  FUNDS_RELEASED
  TRANSACTION_CANCELLED
}
```

### 2. API Routes Structure

```
apps/api/src/app/api/
├── escrow/
│   ├── create/
│   │   └── route.ts              - POST: Create new escrow transaction
│   ├── [id]/
│   │   ├── route.ts              - GET: Transaction details, PUT: Update transaction
│   │   ├── seller-info/
│   │   │   └── route.ts          - POST/GET: Seller information
│   │   ├── buyer-info/
│   │   │   └── route.ts          - POST/GET: Buyer information
│   │   ├── product-info/
│   │   │   └── route.ts          - POST/GET: Product details
│   │   ├── approve/
│   │   │   └── route.ts          - POST: Seller/Buyer approval
│   │   ├── release/
│   │   │   └── route.ts          - POST: Release funds
│   │   ├── dispute/
│   │   │   └── route.ts          - POST: Raise dispute
│   │   ├── cancel/
│   │   │   └── route.ts          - POST: Cancel transaction
│   │   ├── documents/
│   │   │   ├── route.ts          - GET: List documents, POST: Upload
│   │   │   └── [docId]/route.ts  - GET: Download, DELETE: Remove
│   │   └── activities/
│   │       └── route.ts          - GET: Activity history
│   └── list/
│       └── route.ts              - GET: User's transactions
├── payment/
│   ├── prepare/
│   │   └── route.ts              - GET: Payment options from Jetcheckout
│   ├── process/
│   │   └── route.ts              - POST: Process payment via Jetcheckout
│   ├── status/
│   │   └── [referenceId]/
│   │       └── route.ts          - GET: Payment status
│   ├── refund/
│   │   └── route.ts              - POST: Process refund
│   └── saved-cards/
│       └── route.ts              - GET: User's saved cards
├── otp/
│   ├── send/
│   │   └── route.ts              - POST: Send OTP via Clerk email
│   ├── verify/
│   │   └── route.ts              - POST: Verify OTP code
│   └── resend/
│       └── route.ts              - POST: Resend OTP
├── documents/
│   ├── upload/
│   │   └── route.ts              - POST: Upload document to Vercel Blob
│   ├── [id]/
│   │   └── route.ts              - GET: Download document (with access control)
│   └── verify/
│       └── route.ts              - POST: Admin document verification
├── webhooks/
│   ├── jetcheckout/
│   │   └── route.ts              - POST: Payment status webhooks
│   ├── clerk/
│   │   └── route.ts              - POST: User lifecycle webhooks
│   └── sms/
│       └── route.ts              - POST: Email delivery webhooks
├── admin/
│   ├── transactions/
│   │   ├── route.ts              - GET: All transactions (paginated)
│   │   └── [id]/
│   │       ├── route.ts          - GET: Transaction details
│   │       └── resolve/
│   │           └── route.ts      - POST: Resolve dispute
│   ├── disputes/
│   │   └── route.ts              - GET: Active disputes
│   ├── analytics/
│   │   └── route.ts              - GET: Platform analytics
│   └── users/
│       ├── route.ts              - GET: User list
│       └── [id]/
│           ├── route.ts          - GET: User details
│           └── verify/
│               └── route.ts      - POST: Verify KYC
├── audit/
│   ├── logs/
│   │   └── route.ts              - GET: Query audit logs (with filtering)
│   ├── entity/
│   │   └── [entityType]/
│   │       └── [entityId]/
│   │           └── route.ts      - GET: Audit history for specific entity
│   ├── user/
│   │   └── [userId]/
│   │       └── route.ts          - GET: User's activity history
│   ├── transaction/
│   │   └── [id]/
│   │       └── route.ts          - GET: Complete audit trail for transaction
│   └── export/
│       └── route.ts              - POST: Export audit logs (CSV/JSON)
├── compliance/
│   ├── report/
│   │   └── route.ts              - GET: Generate compliance reports
│   ├── retention/
│   │   └── route.ts              - POST: Apply retention policies
│   └── integrity/
│       └── route.ts              - GET: Verify audit log integrity
└── health/
    └── route.ts                  - GET: Health check
```

### 3. Core Services Implementation

#### Escrow Service

```typescript
// services/escrow.service.ts
import { db } from '@repo/database';
import { PaymentService } from './payment.service';
import { NotificationService } from './notification.service';
import { DocumentService } from './document.service';

export class EscrowService {
  constructor(
    private paymentService: PaymentService,
    private notificationService: NotificationService,
    private documentService: DocumentService
  ) {}

  async createTransaction(data: CreateEscrowDto): Promise<EscrowTransaction> {
    const orderId = this.generateOrderId();
    
    const transaction = await db.escrowTransaction.create({
      data: {
        orderId,
        sellerId: data.sellerId,
        amount: data.amount,
        currency: data.currency,
        category: data.category,
        title: data.title,
        description: data.description,
        status: 'DRAFT',
        paymentStatus: 'PENDING',
        platformFee: this.calculatePlatformFee(data.amount),
        sellerReceives: this.calculateSellerAmount(data.amount),
        productInfo: data.productInfo
      },
      include: {
        seller: true,
        documents: true
      }
    });

    await this.createActivity(transaction.id, 'CREATED', 'Transaction created', data.sellerId);
    
    // Send notification to seller
    await this.notificationService.sendTransactionCreated(transaction);
    
    return transaction;
  }

  async updateSellerInfo(transactionId: string, sellerData: SellerInfoDto): Promise<void> {
    await db.userProfile.upsert({
      where: { userId: sellerData.userId },
      create: {
        userId: sellerData.userId,
        fullName: sellerData.fullName,
        identityNumber: sellerData.identityNumber,
        birthDate: sellerData.birthDate,
        phone: sellerData.phone,
        iban: sellerData.iban,
        accountHolder: sellerData.accountHolder,
        companyTitle: sellerData.companyTitle,
        taxNumber: sellerData.taxNumber
      },
      update: {
        fullName: sellerData.fullName,
        identityNumber: sellerData.identityNumber,
        birthDate: sellerData.birthDate,
        phone: sellerData.phone,
        iban: sellerData.iban,
        accountHolder: sellerData.accountHolder,
        companyTitle: sellerData.companyTitle,
        taxNumber: sellerData.taxNumber,
        updatedAt: new Date()
      }
    });

    await this.createActivity(transactionId, 'UPDATED', 'Seller information updated', sellerData.userId);
  }

  async processPayment(transactionId: string, paymentData: PaymentDto): Promise<PaymentResult> {
    const transaction = await this.getTransaction(transactionId);
    
    if (transaction.status !== 'PENDING_PAYMENT') {
      throw new Error('Transaction not ready for payment');
    }

    // Update status to processing
    await this.updateTransactionStatus(transactionId, 'PAYMENT_PROCESSING');

    try {
      // Process payment via Jetcheckout
      const paymentResult = await this.paymentService.createPayment({
        orderId: transaction.orderId,
        amount: transaction.amount,
        currency: transaction.currency,
        customer: paymentData.customer,
        paymentMethod: paymentData.paymentMethod,
        callbackUrl: `${process.env.API_BASE_URL}/api/webhooks/jetcheckout`,
        returnUrl: paymentData.returnUrl
      });

      // Update transaction with payment reference
      await db.escrowTransaction.update({
        where: { id: transactionId },
        data: {
          paymentReference: paymentResult.paymentId,
          paymentStatus: 'PROCESSING'
        }
      });

      await this.createActivity(transactionId, 'PAYMENT_INITIATED', 'Payment initiated', paymentData.customer.id);

      return paymentResult;
    } catch (error) {
      await this.updateTransactionStatus(transactionId, 'PENDING_PAYMENT');
      await this.updatePaymentStatus(transactionId, 'FAILED');
      throw error;
    }
  }

  async handlePaymentSuccess(paymentReference: string): Promise<void> {
    const transaction = await db.escrowTransaction.findFirst({
      where: { paymentReference },
      include: { seller: true, buyer: true }
    });

    if (!transaction) {
      throw new Error('Transaction not found for payment reference');
    }

    await db.escrowTransaction.update({
      where: { id: transaction.id },
      data: {
        status: 'FUNDS_HELD',
        paymentStatus: 'SUCCESS',
        paidAt: new Date()
      }
    });

    await this.createActivity(transaction.id, 'PAYMENT_COMPLETED', 'Payment successful, funds held in escrow', 'SYSTEM');

    // Notify both parties
    await this.notificationService.sendPaymentSuccess(transaction);
    await this.notificationService.sendFundsHeld(transaction);
  }

  async releaseFunds(transactionId: string, userId: string): Promise<void> {
    const transaction = await this.getTransaction(transactionId);
    
    // Verify user authorization
    if (transaction.buyerId !== userId && !this.isAdmin(userId)) {
      throw new Error('Unauthorized to release funds');
    }

    if (transaction.status !== 'PENDING_RELEASE') {
      throw new Error('Transaction not ready for release');
    }

    try {
      // Calculate final amounts (after any disputes/adjustments)
      const releaseAmount = transaction.sellerReceives;
      
      // Here we would integrate with a payout system
      // For MVP, we'll simulate this
      await this.paymentService.simulatePayout({
        amount: releaseAmount,
        currency: transaction.currency,
        recipient: transaction.seller.iban,
        reference: transaction.orderId
      });

      await db.escrowTransaction.update({
        where: { id: transactionId },
        data: {
          status: 'COMPLETED',
          releasedAt: new Date(),
          completedAt: new Date()
        }
      });

      await this.createActivity(transactionId, 'COMPLETED', 'Funds released to seller', userId);

      // Send completion notifications
      await this.notificationService.sendTransactionCompleted(transaction);
    } catch (error) {
      await this.createActivity(transactionId, 'FAILED', `Fund release failed: ${error.message}`, userId);
      throw error;
    }
  }

  async raiseDispute(transactionId: string, disputeData: DisputeDto): Promise<void> {
    const transaction = await this.getTransaction(transactionId);
    
    if (!['FUNDS_HELD', 'PENDING_DELIVERY', 'DELIVERED', 'PENDING_RELEASE'].includes(transaction.status)) {
      throw new Error('Cannot dispute transaction in current status');
    }

    await db.escrowTransaction.update({
      where: { id: transactionId },
      data: {
        status: 'DISPUTED',
        disputed: true,
        disputeReason: disputeData.reason,
        disputeRaisedBy: disputeData.raisedBy,
        disputeRaisedAt: new Date()
      }
    });

    await this.createActivity(transactionId, 'DISPUTED', `Dispute raised: ${disputeData.reason}`, disputeData.raisedBy);

    // Notify admin and other party
    await this.notificationService.sendDisputeRaised(transaction, disputeData);
  }

  private async getTransaction(id: string): Promise<EscrowTransaction> {
    const transaction = await db.escrowTransaction.findUnique({
      where: { id },
      include: {
        seller: true,
        buyer: true,
        documents: true,
        vehicleInfo: true
      }
    });

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    return transaction;
  }

  private async updateTransactionStatus(id: string, status: EscrowStatus): Promise<void> {
    const current = await db.escrowTransaction.findUnique({ where: { id } });
    
    await db.escrowTransaction.update({
      where: { id },
      data: { status }
    });

    // Record status change
    await db.statusHistory.create({
      data: {
        transactionId: id,
        fromStatus: current?.status,
        toStatus: status,
        changedBy: 'SYSTEM'
      }
    });
  }

  private async updatePaymentStatus(id: string, paymentStatus: PaymentStatus): Promise<void> {
    await db.escrowTransaction.update({
      where: { id },
      data: { paymentStatus }
    });
  }

  private async createActivity(transactionId: string, type: ActivityType, description: string, performedBy: string): Promise<void> {
    await db.activity.create({
      data: {
        transactionId,
        type,
        description,
        performedBy
      }
    });
  }

  private generateOrderId(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `ESC-${timestamp}-${random}`;
  }

  private calculatePlatformFee(amount: number): number {
    // 2.5% platform fee, minimum 10 TRY
    const fee = amount * 0.025;
    return Math.max(fee, 10);
  }

  private calculateSellerAmount(amount: number): number {
    const fee = this.calculatePlatformFee(amount);
    return amount - fee;
  }

  private isAdmin(userId: string): boolean {
    // Check if user has admin role via Clerk or RBAC
    // Implementation depends on Zopio's auth setup
    return false; // Simplified for now
  }
}
```

#### Audit Service Implementation

```typescript
// services/audit.service.ts
import { db } from '@repo/database';
import crypto from 'crypto';
import { AuditAction } from '@prisma/client';

export class AuditService {
  private readonly auditSecretKey = process.env.AUDIT_SECRET_KEY!;

  async logChange(params: {
    entityType: string;
    entityId: string;
    action: AuditAction;
    userId: string;
    userRole?: string;
    fieldName?: string;
    oldValue?: any;
    newValue?: any;
    transactionId?: string;
    reason?: string;
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
    metadata?: any;
  }): Promise<void> {
    try {
      // Create the audit log entry
      const auditData = {
        entityType: params.entityType,
        entityId: params.entityId,
        action: params.action,
        userId: params.userId,
        userRole: params.userRole,
        fieldName: params.fieldName,
        oldValue: params.oldValue ? JSON.stringify(params.oldValue) : null,
        newValue: params.newValue ? JSON.stringify(params.newValue) : null,
        transactionId: params.transactionId,
        reason: params.reason,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        sessionId: params.sessionId,
        metadata: params.metadata,
      };

      // Generate integrity checksum
      const checksum = this.generateChecksum(auditData);

      // Save to database
      await db.auditLog.create({
        data: {
          ...auditData,
          checksum,
        }
      });

      // Log the audit event as an activity if linked to a transaction
      if (params.transactionId) {
        await this.createActivity(
          params.transactionId,
          'AUDIT_LOG_CREATED',
          `Audit log created: ${params.action} on ${params.entityType}`,
          params.userId
        );
      }
    } catch (error) {
      console.error('Failed to create audit log:', error);
      // Don't throw - audit logging should not break main operations
    }
  }

  async getEntityHistory(entityType: string, entityId: string): Promise<any[]> {
    return db.auditLog.findMany({
      where: {
        entityType,
        entityId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        transaction: {
          select: {
            orderId: true,
            title: true,
          }
        }
      }
    });
  }

  async getUserActivity(userId: string, limit?: number): Promise<any[]> {
    return db.auditLog.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      ...(limit && { take: limit }),
      include: {
        transaction: {
          select: {
            orderId: true,
            title: true,
          }
        }
      }
    });
  }

  async getTransactionAuditTrail(transactionId: string): Promise<any> {
    const [auditLogs, statusHistory, activities] = await Promise.all([
      db.auditLog.findMany({
        where: { transactionId },
        orderBy: { createdAt: 'desc' }
      }),
      db.statusHistory.findMany({
        where: { transactionId },
        orderBy: { createdAt: 'desc' }
      }),
      db.activity.findMany({
        where: { transactionId },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    return {
      auditLogs,
      statusHistory,
      activities,
      timeline: this.createTimelineView([...auditLogs, ...statusHistory, ...activities])
    };
  }

  async queryAuditLogs(filters: {
    entityType?: string;
    action?: AuditAction;
    userId?: string;
    dateFrom?: Date;
    dateTo?: Date;
    limit?: number;
    offset?: number;
  }): Promise<{ logs: any[], total: number }> {
    const where: any = {};

    if (filters.entityType) where.entityType = filters.entityType;
    if (filters.action) where.action = filters.action;
    if (filters.userId) where.userId = filters.userId;
    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) where.createdAt.gte = filters.dateFrom;
      if (filters.dateTo) where.createdAt.lte = filters.dateTo;
    }

    const [logs, total] = await Promise.all([
      db.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: filters.limit || 100,
        skip: filters.offset || 0,
        include: {
          transaction: {
            select: {
              orderId: true,
              title: true,
            }
          }
        }
      }),
      db.auditLog.count({ where })
    ]);

    return { logs, total };
  }

  async exportAuditLogs(filters: any, format: 'csv' | 'json' = 'json'): Promise<string> {
    const { logs } = await this.queryAuditLogs({ ...filters, limit: 10000 });
    
    if (format === 'csv') {
      return this.convertToCSV(logs);
    }
    
    return JSON.stringify(logs, null, 2);
  }

  async verifyIntegrity(auditLogId: string): Promise<boolean> {
    const auditLog = await db.auditLog.findUnique({
      where: { id: auditLogId }
    });

    if (!auditLog) {
      return false;
    }

    // Recreate checksum without the stored checksum
    const { checksum, ...dataForVerification } = auditLog;
    const calculatedChecksum = this.generateChecksum(dataForVerification);

    return checksum === calculatedChecksum;
  }

  async applyRetentionPolicy(retentionDays: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    // Only delete audit logs older than retention period
    // Keep critical logs (disputes, payments) longer
    const result = await db.auditLog.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
        action: {
          notIn: [
            'PAYMENT_PROCESSED',
            'DISPUTE_RAISED',
            'DISPUTE_RESOLVED',
            'FUNDS_RELEASED'
          ]
        }
      }
    });

    return result.count;
  }

  private generateChecksum(data: any): string {
    const sortedKeys = Object.keys(data).sort();
    const hashData = sortedKeys
      .map(key => `${key}=${JSON.stringify(data[key])}`)
      .join('&') + this.auditSecretKey;
    
    return crypto.createHash('sha256').update(hashData).digest('hex');
  }

  private async createActivity(
    transactionId: string, 
    type: any, 
    description: string, 
    performedBy: string
  ): Promise<void> {
    await db.activity.create({
      data: {
        transactionId,
        type,
        description,
        performedBy,
        createdBy: performedBy
      }
    });
  }

  private createTimelineView(events: any[]): any[] {
    return events
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .map(event => ({
        timestamp: event.createdAt,
        type: event.action || event.type || 'status_change',
        description: event.description || `${event.action || 'Status change'}: ${event.fromStatus || ''} → ${event.toStatus || ''}`,
        user: event.userId || event.performedBy || event.changedBy,
        metadata: event.metadata
      }));
  }

  private convertToCSV(data: any[]): string {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => 
      Object.values(row)
        .map(value => `"${JSON.stringify(value) || ''}"`)
        .join(',')
    );
    
    return [headers, ...rows].join('\n');
  }
}
```

#### Jetcheckout Integration Service

```typescript
// services/payment.service.ts
import crypto from 'crypto';

export class PaymentService {
  private readonly baseUrl = process.env.JETCHECKOUT_API_URL || 'https://api.jetcheckout.com';
  private readonly merchantId = process.env.JETCHECKOUT_MERCHANT_ID!;
  private readonly merchantKey = process.env.JETCHECKOUT_MERCHANT_KEY!;

  async createPayment(paymentData: CreatePaymentDto): Promise<PaymentResult> {
    const requestData = {
      merchant_id: this.merchantId,
      amount: paymentData.amount,
      currency: paymentData.currency,
      order_id: paymentData.orderId,
      customer: {
        name: paymentData.customer.name,
        email: paymentData.customer.email,
        phone: paymentData.customer.phone,
        identity_number: paymentData.customer.identityNumber,
        ip_address: paymentData.customer.ipAddress
      },
      items: [{
        name: paymentData.productName || 'Escrow Transaction',
        price: paymentData.amount,
        quantity: 1
      }],
      callback_url: paymentData.callbackUrl,
      return_url: paymentData.returnUrl
    };

    // Generate hash for security
    const hash = this.generateHash(requestData);
    requestData.hash_data = hash;

    try {
      const response = await fetch(`${this.baseUrl}/api/v1/payment/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(`Payment failed: ${result.message || 'Unknown error'}`);
      }

      return {
        paymentId: result.payment_id,
        status: result.status,
        redirectUrl: result.redirect_url,
        requires3DS: result.requires_3ds
      };
    } catch (error) {
      console.error('Jetcheckout payment error:', error);
      throw new Error('Payment processing failed');
    }
  }

  async getPaymentStatus(paymentId: string): Promise<PaymentStatusResult> {
    const requestData = {
      merchant_id: this.merchantId,
      payment_id: paymentId
    };

    const hash = this.generateHash(requestData);
    requestData.hash_data = hash;

    try {
      const response = await fetch(`${this.baseUrl}/api/v1/payment/payment-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      const result = await response.json();
      
      return {
        paymentId: result.payment_id,
        status: result.status,
        amount: result.amount,
        currency: result.currency,
        paidAt: result.paid_at ? new Date(result.paid_at) : null
      };
    } catch (error) {
      console.error('Payment status check error:', error);
      throw new Error('Failed to check payment status');
    }
  }

  async refundPayment(paymentId: string, amount?: number): Promise<RefundResult> {
    const requestData = {
      merchant_id: this.merchantId,
      payment_id: paymentId,
      ...(amount && { amount })
    };

    const hash = this.generateHash(requestData);
    requestData.hash_data = hash;

    try {
      const response = await fetch(`${this.baseUrl}/api/v1/payment/refund-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(`Refund failed: ${result.message || 'Unknown error'}`);
      }

      return {
        refundId: result.refund_id,
        status: result.status,
        amount: result.refund_amount
      };
    } catch (error) {
      console.error('Refund error:', error);
      throw new Error('Refund processing failed');
    }
  }

  async simulatePayout(payoutData: PayoutDto): Promise<void> {
    // Simulate payout for MVP
    // In production, integrate with actual payout service or Jetcheckout's submerchant system
    console.log('Simulating payout:', payoutData);
    
    // Add delay to simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In real implementation:
    // 1. Validate IBAN
    // 2. Process bank transfer
    // 3. Handle payout webhooks
    // 4. Update transaction status
  }

  private generateHash(data: any): string {
    // Implement hash generation according to Jetcheckout's specification
    const sortedKeys = Object.keys(data).filter(key => key !== 'hash_data').sort();
    const hashString = sortedKeys.map(key => `${key}=${data[key]}`).join('&') + this.merchantKey;
    
    return crypto.createHash('sha256').update(hashString).digest('hex');
  }

  async verifyWebhookHash(receivedHash: string, data: any): Promise<boolean> {
    const calculatedHash = this.generateHash(data);
    return receivedHash === calculatedHash;
  }
}
```

### 4. State Machine Implementation

```typescript
// utils/escrow-state-machine.ts
export class EscrowStateMachine {
  private static readonly transitions: Record<EscrowStatus, EscrowStatus[]> = {
    DRAFT: ['PENDING_BUYER', 'CANCELLED'],
    PENDING_BUYER: ['PENDING_PAYMENT', 'CANCELLED'],
    PENDING_PAYMENT: ['PAYMENT_PROCESSING', 'CANCELLED'],
    PAYMENT_PROCESSING: ['FUNDS_HELD', 'PENDING_PAYMENT', 'FAILED', 'CANCELLED'],
    FUNDS_HELD: ['PENDING_DELIVERY', 'DISPUTED', 'REFUNDED'],
    PENDING_DELIVERY: ['DELIVERED', 'DISPUTED'],
    DELIVERED: ['PENDING_RELEASE', 'DISPUTED'],
    PENDING_RELEASE: ['COMPLETED', 'DISPUTED'],
    COMPLETED: [],
    DISPUTED: ['COMPLETED', 'REFUNDED', 'FUNDS_HELD'],
    CANCELLED: [],
    REFUNDED: []
  };

  static canTransition(from: EscrowStatus, to: EscrowStatus): boolean {
    return this.transitions[from]?.includes(to) ?? false;
  }

  static getNextStates(currentStatus: EscrowStatus): EscrowStatus[] {
    return this.transitions[currentStatus] ?? [];
  }

  static getRequiredActions(status: EscrowStatus): string[] {
    const actions: Record<EscrowStatus, string[]> = {
      DRAFT: ['Complete seller information'],
      PENDING_BUYER: ['Add buyer information'],
      PENDING_PAYMENT: ['Process payment'],
      PAYMENT_PROCESSING: ['Wait for payment confirmation'],
      FUNDS_HELD: ['Arrange delivery'],
      PENDING_DELIVERY: ['Confirm delivery'],
      DELIVERED: ['Buyer approval required'],
      PENDING_RELEASE: ['Final release confirmation'],
      COMPLETED: ['Transaction complete'],
      DISPUTED: ['Resolve dispute'],
      CANCELLED: ['Transaction cancelled'],
      REFUNDED: ['Refund processed']
    };

    return actions[status] ?? [];
  }
}
```

### 5. Audit Middleware & Security Implementation

#### Prisma Middleware for Automatic Audit Logging

```typescript
// middleware/audit.middleware.ts
import { Prisma } from '@prisma/client';
import { AuditService } from '../services/audit.service';

export function createAuditMiddleware(auditService: AuditService) {
  return async (params: Prisma.MiddlewareParams, next: (params: Prisma.MiddlewareParams) => Promise<any>) => {
    const { model, action, args } = params;
    
    // Skip audit logging for audit-related tables
    if (model === 'AuditLog' || model === 'Activity' || model === 'StatusHistory') {
      return next(params);
    }

    // Get user context from request context or args
    const userContext = getUserContext();
    
    if (!userContext) {
      console.warn('No user context available for audit logging');
      return next(params);
    }

    let result;
    let originalData: any = null;

    // Get original data for UPDATE and DELETE operations
    if (action === 'update' || action === 'delete') {
      try {
        originalData = await db[model].findUnique({
          where: args.where,
        });
      } catch (error) {
        console.warn('Failed to fetch original data for audit:', error);
      }
    }

    // Execute the operation
    result = await next(params);

    // Log the change asynchronously (don't block the main operation)
    setImmediate(async () => {
      try {
        await logDatabaseChange({
          model,
          action,
          args,
          result,
          originalData,
          userContext,
          auditService
        });
      } catch (error) {
        console.error('Failed to log database change:', error);
      }
    });

    return result;
  };
}

async function logDatabaseChange({
  model,
  action,
  args,
  result,
  originalData,
  userContext,
  auditService
}: any) {
  const auditAction = mapPrismaActionToAuditAction(action);
  
  if (action === 'create') {
    await auditService.logChange({
      entityType: model,
      entityId: result.id,
      action: auditAction,
      userId: userContext.userId,
      userRole: userContext.role,
      newValue: result,
      transactionId: getTransactionId(model, result),
      ipAddress: userContext.ipAddress,
      userAgent: userContext.userAgent,
      sessionId: userContext.sessionId
    });
  } else if (action === 'update') {
    // Log field-level changes
    const changes = detectChanges(originalData, result);
    
    for (const [fieldName, { oldValue, newValue }] of Object.entries(changes)) {
      await auditService.logChange({
        entityType: model,
        entityId: result.id,
        action: auditAction,
        fieldName,
        oldValue,
        newValue,
        userId: userContext.userId,
        userRole: userContext.role,
        transactionId: getTransactionId(model, result),
        ipAddress: userContext.ipAddress,
        userAgent: userContext.userAgent,
        sessionId: userContext.sessionId
      });
    }
  } else if (action === 'delete' || action === 'deleteMany') {
    await auditService.logChange({
      entityType: model,
      entityId: originalData?.id || 'bulk_operation',
      action: auditAction,
      userId: userContext.userId,
      userRole: userContext.role,
      oldValue: originalData,
      transactionId: getTransactionId(model, originalData),
      ipAddress: userContext.ipAddress,
      userAgent: userContext.userAgent,
      sessionId: userContext.sessionId
    });
  }
}

function mapPrismaActionToAuditAction(prismaAction: string): string {
  const mapping: Record<string, string> = {
    'create': 'CREATE',
    'update': 'UPDATE',
    'delete': 'DELETE',
    'deleteMany': 'DELETE'
  };
  
  return mapping[prismaAction] || 'UPDATE';
}

function detectChanges(oldData: any, newData: any): Record<string, { oldValue: any, newValue: any }> {
  const changes: Record<string, { oldValue: any, newValue: any }> = {};
  
  if (!oldData || !newData) return changes;
  
  // Compare each field
  for (const key of Object.keys(newData)) {
    if (key === 'updatedAt' || key === 'version') continue; // Skip system fields
    
    if (JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])) {
      changes[key] = {
        oldValue: oldData[key],
        newValue: newData[key]
      };
    }
  }
  
  return changes;
}

function getTransactionId(model: string, data: any): string | undefined {
  if (model === 'EscrowTransaction') {
    return data?.id;
  }
  
  return data?.transactionId;
}

function getUserContext(): any {
  // Implementation depends on your request context setup
  // This could come from:
  // 1. AsyncLocalStorage for Node.js
  // 2. Request headers
  // 3. JWT token data
  // 4. Clerk auth context
  
  // Example implementation:
  return {
    userId: 'current-user-id',
    role: 'user',
    ipAddress: '127.0.0.1',
    userAgent: 'Mozilla/5.0...',
    sessionId: 'session-123'
  };
}
```

#### User Context Middleware for API Routes

```typescript
// middleware/user-context.middleware.ts
import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export interface UserContext {
  userId: string;
  role: string;
  ipAddress: string;
  userAgent: string;
  sessionId: string;
}

export async function withUserContext<T>(
  req: NextRequest,
  handler: (context: UserContext) => Promise<T>
): Promise<T> {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('Unauthorized: No user context available');
  }

  const context: UserContext = {
    userId,
    role: await getUserRole(userId),
    ipAddress: getClientIP(req),
    userAgent: req.headers.get('user-agent') || '',
    sessionId: await getSessionId(req)
  };

  // Store context for middleware access
  setUserContext(context);
  
  try {
    return await handler(context);
  } finally {
    // Clean up context
    clearUserContext();
  }
}

async function getUserRole(userId: string): Promise<string> {
  // Integrate with your RBAC system
  // This could query Clerk roles or your custom role system
  return 'user'; // Simplified
}

function getClientIP(req: NextRequest): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  const realIP = req.headers.get('x-real-ip');
  
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
}

async function getSessionId(req: NextRequest): Promise<string> {
  // Extract session ID from cookies or JWT
  const sessionCookie = req.cookies.get('__session');
  return sessionCookie?.value || 'no-session';
}

// Context storage (using AsyncLocalStorage in production)
let currentUserContext: UserContext | null = null;

export function setUserContext(context: UserContext): void {
  currentUserContext = context;
}

export function getCurrentUserContext(): UserContext | null {
  return currentUserContext;
}

export function clearUserContext(): void {
  currentUserContext = null;
}
```

#### API Route Example with Audit Integration

```typescript
// api/escrow/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { EscrowService } from '@/services/escrow.service';
import { AuditService } from '@/services/audit.service';
import { withUserContext } from '@/middleware/user-context.middleware';

const escrowService = new EscrowService();
const auditService = new AuditService();

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return withUserContext(req, async (userContext) => {
    try {
      const body = await req.json();
      
      // Update the transaction
      const updatedTransaction = await escrowService.updateTransaction(
        params.id,
        body,
        userContext.userId
      );

      // Manual audit log for business-critical operations
      await auditService.logChange({
        entityType: 'EscrowTransaction',
        entityId: params.id,
        action: 'UPDATE',
        userId: userContext.userId,
        userRole: userContext.role,
        reason: body.reason || 'Transaction updated via API',
        metadata: {
          endpoint: '/api/escrow/[id]',
          method: 'PUT',
          updatedFields: Object.keys(body)
        },
        ipAddress: userContext.ipAddress,
        userAgent: userContext.userAgent,
        sessionId: userContext.sessionId
      });

      return NextResponse.json(updatedTransaction);
    } catch (error) {
      // Log the error attempt
      await auditService.logChange({
        entityType: 'EscrowTransaction',
        entityId: params.id,
        action: 'UPDATE',
        userId: userContext.userId,
        userRole: userContext.role,
        reason: `Failed update attempt: ${error.message}`,
        metadata: {
          error: error.message,
          endpoint: '/api/escrow/[id]',
          method: 'PUT'
        },
        ipAddress: userContext.ipAddress,
        userAgent: userContext.userAgent,
        sessionId: userContext.sessionId
      });

      return NextResponse.json(
        { error: 'Failed to update transaction' },
        { status: 500 }
      );
    }
  });
}
```

#### Security Features & Compliance

```typescript
// utils/audit-security.ts
export class AuditSecurity {
  // Audit log integrity verification
  static async verifyAuditChain(auditService: AuditService): Promise<boolean> {
    const recentLogs = await auditService.queryAuditLogs({
      limit: 1000,
      dateFrom: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
    });

    let validCount = 0;
    
    for (const log of recentLogs.logs) {
      const isValid = await auditService.verifyIntegrity(log.id);
      if (isValid) validCount++;
    }

    const integrityRatio = validCount / recentLogs.logs.length;
    
    // Alert if integrity drops below 99%
    if (integrityRatio < 0.99) {
      console.error(`Audit integrity compromised: ${integrityRatio * 100}%`);
      // Send alert to administrators
      return false;
    }

    return true;
  }

  // Suspicious activity detection
  static async detectSuspiciousActivity(auditService: AuditService): Promise<any[]> {
    const suspiciousPatterns = [];
    
    // Detect bulk operations by single user
    const bulkOperations = await auditService.queryAuditLogs({
      dateFrom: new Date(Date.now() - 60 * 60 * 1000), // Last hour
      limit: 1000
    });

    const userActivity = bulkOperations.logs.reduce((acc, log) => {
      acc[log.userId] = (acc[log.userId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    for (const [userId, count] of Object.entries(userActivity)) {
      if (count > 50) { // More than 50 operations per hour
        suspiciousPatterns.push({
          type: 'BULK_OPERATIONS',
          userId,
          count,
          severity: 'HIGH'
        });
      }
    }

    // Detect off-hours access
    const now = new Date();
    const isOffHours = now.getHours() < 6 || now.getHours() > 22;
    
    if (isOffHours) {
      const offHoursActivity = bulkOperations.logs.filter(log => 
        ['DELETE', 'FUNDS_RELEASED', 'DISPUTE_RESOLVED'].includes(log.action)
      );
      
      if (offHoursActivity.length > 0) {
        suspiciousPatterns.push({
          type: 'OFF_HOURS_CRITICAL_OPERATIONS',
          operations: offHoursActivity,
          severity: 'MEDIUM'
        });
      }
    }

    return suspiciousPatterns;
  }

  // Generate compliance reports
  static async generateComplianceReport(
    auditService: AuditService,
    dateFrom: Date,
    dateTo: Date
  ): Promise<any> {
    const auditLogs = await auditService.queryAuditLogs({
      dateFrom,
      dateTo,
      limit: 10000
    });

    const report = {
      period: { from: dateFrom, to: dateTo },
      totalOperations: auditLogs.total,
      operationsByType: {},
      userActivity: {},
      criticalOperations: [],
      integrityStatus: 'VERIFIED',
      recommendations: []
    };

    // Analyze operations by type
    auditLogs.logs.forEach(log => {
      report.operationsByType[log.action] = (report.operationsByType[log.action] || 0) + 1;
      report.userActivity[log.userId] = (report.userActivity[log.userId] || 0) + 1;
      
      if (['FUNDS_RELEASED', 'DISPUTE_RESOLVED', 'PAYMENT_PROCESSED'].includes(log.action)) {
        report.criticalOperations.push(log);
      }
    });

    // Generate recommendations
    if (report.totalOperations > 10000) {
      report.recommendations.push('Consider implementing audit log archiving');
    }

    if (Object.keys(report.userActivity).length < 5) {
      report.recommendations.push('Low user diversity - consider access controls review');
    }

    return report;
  }
}
```

#### Environment Variables for Audit System

```bash
# .env additions for audit functionality
AUDIT_SECRET_KEY=your-audit-signing-secret-key-here
AUDIT_RETENTION_DAYS=2555  # 7 years for financial compliance
AUDIT_LOG_LEVEL=INFO       # DEBUG, INFO, WARN, ERROR
AUDIT_INTEGRITY_CHECK_INTERVAL=3600  # Check every hour (seconds)
```

## Frontend Implementation (React Components)

### Page Components Structure

```
apps/app/src/app/escrow/
├── create/
│   └── page.tsx              - New transaction creation
├── [id]/
│   ├── page.tsx              - Transaction overview
│   ├── seller-info/
│   │   └── page.tsx          - Seller information form
│   ├── buyer-info/
│   │   └── page.tsx          - Buyer information form
│   ├── product-info/
│   │   └── page.tsx          - Product details form
│   ├── payment/
│   │   └── page.tsx          - Payment processing
│   ├── verify/
│   │   └── page.tsx          - OTP verification
│   └── dashboard/
│       └── page.tsx          - Transaction dashboard
└── components/
    ├── forms/
    │   ├── SellerInfoForm.tsx
    │   ├── BuyerInfoForm.tsx
    │   ├── ProductInfoForm.tsx
    │   ├── PaymentForm.tsx
    │   └── OTPForm.tsx
    ├── ui/
    │   ├── ProgressIndicator.tsx
    │   ├── TransactionCard.tsx
    │   ├── StatusBadge.tsx
    │   └── DocumentUpload.tsx
    └── layout/
        ├── EscrowLayout.tsx
        └── SettingsPanel.tsx
```

### Key Components Implementation

#### Progress Indicator Component

```typescript
// components/ui/ProgressIndicator.tsx
import { cn } from "@/lib/utils";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  steps: { label: string; completed: boolean }[];
  className?: string;
}

export function ProgressIndicator({ currentStep, totalSteps, steps, className }: ProgressIndicatorProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                {
                  "bg-green-500 text-white": step.completed,
                  "bg-blue-500 text-white": index === currentStep && !step.completed,
                  "bg-gray-200 text-gray-500": index > currentStep && !step.completed,
                }
              )}
            >
              {step.completed ? "✓" : index + 1}
            </div>
            <span className="text-xs mt-1 text-center max-w-16">
              {step.label}
            </span>
          </div>
        ))}
      </div>
      <div className="flex mt-4">
        {steps.map((_, index) => (
          <div
            key={index}
            className={cn(
              "h-1 flex-1",
              {
                "bg-green-500": index < currentStep,
                "bg-blue-500": index === currentStep,
                "bg-gray-200": index > currentStep,
              }
            )}
          />
        ))}
      </div>
    </div>
  );
}
```

#### Seller Info Form Component

```typescript
// components/forms/SellerInfoForm.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@repo/design-system/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/design-system/ui/form";
import { Input } from "@repo/design-system/ui/input";
import { Textarea } from "@repo/design-system/ui/textarea";
import { Switch } from "@repo/design-system/ui/switch";
import { toast } from "@repo/design-system/ui/use-toast";

const sellerInfoSchema = z.object({
  userType: z.enum(['individual', 'corporate']),
  // Individual fields
  fullName: z.string().min(2, "Full name is required").optional(),
  identityNumber: z.string().regex(/^\d{11}$/, "Turkish ID must be 11 digits").optional(),
  birthDate: z.string().optional(),
  // Corporate fields
  companyTitle: z.string().min(2, "Company title is required").optional(),
  taxNumber: z.string().regex(/^\d{10}$/, "Tax number must be 10 digits").optional(),
  // Common fields
  phone: z.string().regex(/^5\d{2} \d{3} \d{4}$/, "Phone format: 5XX XXX XXXX"),
  email: z.string().email("Invalid email format"),
  iban: z.string().regex(/^TR\d{24}$/, "Invalid IBAN format"),
  accountHolder: z.string().min(2, "Account holder name is required"),
  address: z.string().min(10, "Address is required")
}).refine((data) => {
  if (data.userType === 'individual') {
    return data.fullName && data.identityNumber && data.birthDate;
  }
  if (data.userType === 'corporate') {
    return data.companyTitle && data.taxNumber;
  }
  return true;
}, {
  message: "Please fill all required fields for selected user type"
});

interface SellerInfoFormProps {
  transactionId: string;
  initialData?: Partial<z.infer<typeof sellerInfoSchema>>;
  onSubmit: (data: z.infer<typeof sellerInfoSchema>) => Promise<void>;
  isLoading?: boolean;
}

export function SellerInfoForm({ transactionId, initialData, onSubmit, isLoading }: SellerInfoFormProps) {
  const [userType, setUserType] = useState<'individual' | 'corporate'>(initialData?.userType || 'individual');
  
  const form = useForm<z.infer<typeof sellerInfoSchema>>({
    resolver: zodResolver(sellerInfoSchema),
    defaultValues: {
      userType: 'individual',
      ...initialData
    }
  });

  const handleSubmit = async (data: z.infer<typeof sellerInfoSchema>) => {
    try {
      await onSubmit(data);
      toast({
        title: "Success",
        description: "Seller information saved successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to save seller information",
        variant: "destructive"
      });
    }
  };

  const validateIBAN = async (iban: string) => {
    try {
      const response = await fetch('/api/payment/validate-iban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ iban })
      });
      
      const result = await response.json();
      return result.valid;
    } catch (error) {
      return false;
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* User Type Toggle */}
        <div className="flex items-center justify-center space-x-4">
          <span className={`text-sm ${userType === 'individual' ? 'font-bold' : ''}`}>
            Individual
          </span>
          <Switch
            checked={userType === 'corporate'}
            onCheckedChange={(checked) => setUserType(checked ? 'corporate' : 'individual')}
          />
          <span className={`text-sm ${userType === 'corporate' ? 'font-bold' : ''}`}>
            Corporate
          </span>
        </div>

        {/* Individual Fields */}
        {userType === 'individual' && (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="identityNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Turkish ID Number</FormLabel>
                  <FormControl>
                    <Input placeholder="12345678901" maxLength={11} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="birthDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Birth Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {/* Corporate Fields */}
        {userType === 'corporate' && (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="companyTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter company name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="taxNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tax Number</FormLabel>
                  <FormControl>
                    <Input placeholder="1234567890" maxLength={10} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {/* Common Fields */}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="5XX XXX XXXX" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="email@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="iban"
            render={({ field }) => (
              <FormItem>
                <FormLabel>IBAN</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="TR12 3456 7890 1234 5678 9012 34" 
                    {...field}
                    onBlur={async (e) => {
                      field.onBlur();
                      if (e.target.value) {
                        const isValid = await validateIBAN(e.target.value);
                        if (!isValid) {
                          form.setError('iban', { message: 'Invalid IBAN' });
                        }
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="accountHolder"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account Holder Name</FormLabel>
                <FormControl>
                  <Input placeholder="Account holder name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Textarea placeholder="Enter your full address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Continue"}
        </Button>
      </form>
    </Form>
  );
}
```

## Implementation Plan (2-Day Sprint)

### Day 1: Foundation & Core Features

#### Morning Session (9:00 - 13:00) - 4 hours

**All Developers Together (Setup & Foundation):**

**Hour 1 (9:00-10:00): Environment Setup**

- Clone and setup Zopio monorepo
- Install dependencies and run initial build
- Setup database connection (Neon PostgreSQL)
- Configure environment variables

**Hour 2 (10:00-11:00): Database Schema**

- Create Prisma schema for escrow system
- Run initial migrations
- Test database connectivity
- Setup seed data for development

**Hour 3 (11:00-12:00): Project Structure**

- Create escrow app structure in apps/
- Setup API routes skeleton
- Configure Next.js app with internationalization
- Setup shadcn/ui components

**Hour 4 (12:00-13:00): Core Services Foundation**

- Implement basic EscrowService class
- Setup PaymentService skeleton
- Create database service methods
- Implement basic state machine

#### Afternoon Session (14:00 - 18:00) - 4 hours

**Parallel Development:**

**Umut (uozopio) - Backend Core Services (4h):**

- Complete EscrowService implementation
  - Transaction creation and management
  - Status transition logic
  - Validation and business rules
- Implement PaymentService with Jetcheckout integration
  - Payment creation and processing
  - Webhook handling setup
  - Hash generation and verification
- Create API route handlers
  - /api/escrow/* endpoints
  - /api/payment/* endpoints
  - **Basic /api/admin/* endpoints** for dashboard
  - Error handling and validation

**Burak (mbyzopio) - Frontend Forms (4h):**

- Convert seller-info.html to React component
  - Individual/corporate user toggle
  - Form validation with Zod
  - IBAN validation integration
- Convert buyer-info.html to React component
  - Similar structure to seller form
  - Address handling
- Convert product-info.html to React component
  - Category selection
  - Vehicle-specific fields
  - File upload preparation

**Enes (teczopio) - UI Components & Layout (4h):**

- Setup shadcn/ui component library
- Create layout components
  - EscrowLayout with sidebar navigation
  - Header with progress indicator
  - Settings panel
- Implement ProgressIndicator component
- Create StatusBadge component
- Setup responsive design patterns

### Day 2: Integration & Completion

#### Morning Session (9:00 - 13:00) - 4 hours

**Advanced Features & Integration:**

**Umut (uozopio) - Advanced Backend (4h):**

- Implement OTP service
  - Email OTP integration via Clerk authentication
  - Code generation and validation
  - Expiry handling
- Document upload service
  - Vercel Blob integration
  - File validation and security
  - Access control
- Dispute management system
  - Dispute creation and handling
  - Admin notification system
- **Admin dashboard backend services**
  - Transaction monitoring APIs
  - User management endpoints
- Webhook handlers
  - Jetcheckout payment webhooks
  - Status synchronization

**Burak (mbyzopio) - Payment & Verification (4h):**

- Convert payment.html to React component
  - Credit card form with validation
  - Saved cards display
  - 3D Secure handling
  - Partial payment support
- Convert otp.html to React component
  - 6-digit input with auto-focus
  - Countdown timer
  - Resend functionality
- Integrate forms with backend APIs
  - Form submission handling
  - Loading states and error handling
  - Success redirections

**Enes (teczopio) - Dashboard & Polish (4h):**

- Convert index.html to React dashboard
  - Transaction list/grid view
  - Listing management
  - Search and filtering
- **Create basic admin dashboard UI**
  - Transaction monitoring interface
  - Dispute management panel
  - User overview and basic actions
- Create DocumentUpload component
  - Drag and drop functionality
  - File preview
  - Upload progress
- Polish UI components
  - Loading states
  - Error boundaries
  - Responsive improvements

#### Afternoon Session (14:00 - 18:00) - 4 hours

**Final Integration & Testing:**

**Hour 1 (14:00-15:00): End-to-End Integration**

- Connect all components together
- Test complete escrow flow
- Fix integration issues
- Verify state management

**Hour 2 (15:00-16:00): Testing & Bug Fixes**

- Test all form validations
- Verify payment flow
- Test OTP verification
- Fix discovered bugs

**Hour 3 (16:00-17:00): Deployment Preparation**

- Build production version
- Setup environment variables
- Deploy to staging/Vercel
- Test deployed version

**Hour 4 (17:00-18:00): Documentation & Handover**

- Update documentation
- Create user guide
- Prepare demo
- Code review and cleanup

## Detailed Task Breakdown

### Umut (uozopio ) - 16 total hours

**Day 1 Backend Tasks (8 hours):**

1. **Database & Core Setup (2h)**
   - Prisma schema implementation
   - Initial service architecture
   - Database connection and testing

2. **EscrowService Implementation (3h)**
   - Transaction creation and management
   - State machine implementation
   - Business logic and validations
   - Activity logging

3. **PaymentService & Jetcheckout Integration (2h)**
   - API integration methods
   - Hash generation and verification
   - Payment processing flow
   - Error handling

4. **API Routes Setup (1h)**
   - Route handlers for escrow endpoints
   - Request/response validation
   - Authentication middleware

**Day 2 Advanced Tasks (8 hours):**

1. **OTP Service Implementation (2h)**
   - Email OTP integration via Clerk
   - Code generation and validation
   - Expiry handling and cleanup

2. **Document Management (2h)**
   - Vercel Blob integration
   - File upload validation
   - Access control implementation
   - Document verification system

3. **Dispute & Admin Features (2h)**
   - Dispute creation and management
   - Admin notification system
   - Resolution workflows

4. **Integration & Testing (2h)**
   - End-to-end testing
   - Bug fixes and optimizations
   - Performance monitoring setup

### Burak (mbyzopio ) - 16 total hours

**Day 1 Frontend Forms (8 hours):**

1. **Environment & Setup (1h)**
   - React form setup with react-hook-form
   - Zod validation schemas
   - Component structure planning

2. **Seller Info Form (2.5h)**
   - Individual/corporate toggle
   - Form fields with validation
   - IBAN validation integration
   - Responsive design

3. **Buyer Info Form (2h)**
   - Similar structure to seller form
   - Address handling
   - Form state management

4. **Product Info Form (2.5h)**
   - Category selection logic
   - Vehicle-specific fields
   - Dynamic form rendering
   - File upload preparation

**Day 2 Payment & Integration (8 hours):**

1. **Payment Form Component (3h)**
   - Credit card form with Luhn validation
   - Saved cards display and selection
   - 3D Secure redirect handling
   - Partial payment calculations

2. **OTP Verification Component (2h)**
   - 6-digit input with auto-focus
   - Countdown timer implementation
   - Resend functionality
   - Auto-submit on completion

3. **API Integration (2h)**
   - Form submission handlers
   - Loading states and error handling
   - Success/error notifications
   - Navigation flow

4. **Testing & Polish (1h)**
   - Form validation testing
   - User experience improvements
   - Accessibility enhancements

### Enes (teczopio ) - 16 total hours

**Day 1 UI Foundation (8 hours):**

1. **Component Library Setup (2h)**
   - shadcn/ui installation and configuration
   - Theme setup and customization
   - Component documentation review

2. **Layout Components (2h)**
   - EscrowLayout with navigation
   - Header with branding and user menu
   - Sidebar navigation structure
   - Responsive breakpoints

3. **Progress Indicator (2h)**
   - Step-by-step visual indicator
   - Completion status display
   - Responsive design
   - Animation effects

4. **Settings Panel (2h)**
   - Theme selection (light/dark)
   - Language switcher
   - Help center integration
   - Slide-out animation

**Day 2 Dashboard & Polish (8 hours):**

1. **Dashboard Implementation (3h)**
   - Transaction list/grid toggle
   - Search and filter functionality
   - Sorting options
   - Pagination

2. **Document Upload Component (2h)**
   - Drag and drop interface
   - File preview functionality
   - Upload progress indicator
   - File validation messages

3. **UI Polish & Testing (2h)**
   - Loading states for all components
   - Error boundaries implementation
   - Responsive design testing
   - Cross-browser compatibility

4. **Support & Integration (1h)**
   - Help other developers with integration
   - Bug fixes and UI improvements
   - Final testing and validation

## Risk Mitigation Strategies

### High Priority Risks

1. **Jetcheckout Integration Complexity**
   - **Risk**: API documentation gaps, hash generation issues
   - **Mitigation**: Start with payment simulation, implement comprehensive error handling
   - **Fallback**: Mock payment service for demo, complete integration post-MVP
   - **Owner**: Umut
   - **Timeline**: Address by end of Day 1

2. **Database Schema Complexity**
   - **Risk**: Complex relationships, performance issues
   - **Mitigation**: Start with minimal viable schema, add complexity incrementally
   - **Fallback**: Simplified schema without full audit trail
   - **Owner**: Umut
   - **Timeline**: Resolve by Day 1 morning

3. **Time Constraints**
   - **Risk**: Feature creep, underestimated tasks
   - **Mitigation**: Focus on core MVP features, defer nice-to-haves
   - **Fallback**: Deliver partial functionality with clear roadmap
   - **Owner**: All team members
   - **Timeline**: Continuous monitoring

### Medium Priority Risks

1. **Email OTP Service Integration**
   - **Risk**: Clerk email delivery limits, rate limiting
   - **Mitigation**: Use Clerk's built-in rate limiting, implement proper error handling
   - **Fallback**: Basic Clerk authentication without OTP for MVP
   - **Owner**: Umut
   - **Timeline**: Day 2 morning

2. **Form Validation Complexity**
   - **Risk**: Turkish ID validation, IBAN validation
   - **Mitigation**: Use existing libraries, implement comprehensive validation
   - **Fallback**: Basic format validation with manual verification
   - **Owner**: Burak
   - **Timeline**: Day 1 afternoon

3. **File Upload Security**
   - **Risk**: Malicious file uploads, storage limits
   - **Mitigation**: Implement file type/size validation, use Vercel Blob security features
   - **Fallback**: Temporary file upload with manual review
   - **Owner**: Umut + Enes
   - **Timeline**: Day 2 morning

### Low Priority Risks

1. **Performance Issues**
   - **Risk**: Slow database queries, large file uploads
   - **Mitigation**: Implement proper indexing, use pagination
   - **Monitoring**: Sentry performance tracking
   - **Owner**: Umut
   - **Timeline**: Post-MVP optimization

2. **UI/UX Consistency**
   - **Risk**: Inconsistent styling, poor mobile experience
   - **Mitigation**: Use design system components, test on multiple devices
   - **Owner**: Enes + Burak
   - **Timeline**: Continuous during development

## Success Metrics & Acceptance Criteria

### MVP Completion Criteria

**Core Functionality (Must Have):**

- ✅ Complete seller registration with Turkish ID/corporate info validation
- ✅ Buyer information collection with address handling
- ✅ Product information with vehicle-specific fields
- ✅ OTP verification with Clerk email integration working
- ✅ Payment processing via Jetcheckout with 3D Secure
- ✅ Document upload for vehicle registration and assignment forms
- ✅ Basic escrow state management (create → pay → hold → release)
- ✅ **Basic admin dashboard** for transaction monitoring and dispute management
- ✅ Turkish and English language support
- ✅ Mobile responsive design for all forms

**Technical Requirements (Must Have):**

- ✅ Database schema with proper relationships and constraints
- ✅ API endpoints with authentication and validation
- ✅ Error handling and logging throughout the system
- ✅ Webhook handling for payment status updates
- ✅ File upload with security validation
- ✅ State machine implementation for transaction flow

**Nice-to-Have (If Time Permits):**

- 📝 Advanced admin analytics and detailed reporting
- 📝 Email notifications for transaction milestones
- 📝 Advanced dispute resolution workflows with automation
- 📝 Saved payment methods
- 📝 Advanced transaction analytics and business intelligence
- 📝 Automated testing suite

### Performance Targets

**Response Time:**

- Page load time: < 3 seconds on 3G
- API response time: < 500ms for most endpoints
- File upload: Progress indicator for files > 1MB

**User Experience:**

- Form validation: Real-time validation with clear error messages
- Mobile compatibility: All features work on iOS/Android browsers
- Accessibility: WCAG 2.1 AA compliance for core flows

**Security Standards:**

- All forms validated server-side
- File uploads restricted to safe types and sizes
- Authentication required for all sensitive operations
- Payment data handled securely with PCI DSS best practices

### Testing Checklist

**Functional Testing:**

1. **Registration Flow:**
   - Individual seller registration with valid Turkish ID
   - Corporate seller registration with tax number
   - IBAN validation with real/test IBANs
   - Phone number validation and formatting

2. **Transaction Flow:**
   - Create transaction → Add seller info → Add buyer info → Add product info → Process payment → OTP verification → Fund holding → Release

3. **Payment Processing:**
   - Credit card payment with 3D Secure
   - Invalid card handling
   - Payment webhook processing
   - Refund functionality

4. **Document Management:**
   - Vehicle registration upload
   - File type/size validation
   - Document access control
   - Assignment form download

5. **State Management:**
   - Proper state transitions
   - Status history tracking
   - Activity logging
   - Error recovery

**Integration Testing:**

1. **Jetcheckout API:**
   - Payment creation and processing
   - Webhook delivery and verification
   - Hash generation and validation
   - Error handling for API failures

2. **Database Operations:**
   - Transaction ACID compliance
   - Relationship integrity
   - Performance with concurrent users
   - Data migration and rollback

3. **External Services:**
   - Email delivery for OTP via Clerk
   - Email notifications
   - File storage operations
   - Authentication flows

## Post-MVP Roadmap

### Week 1: Enhanced Admin & Management

- **Advanced Admin Features:**
  - **Advanced transaction analytics** and detailed reporting
  - **Enhanced dispute resolution** workflows with automation
  - User management and KYC verification workflows
  - Financial reconciliation and reporting tools

- **Enhanced Notifications:**
  - Email templates for all transaction stages
  - Email notifications for critical events via Resend
  - In-app notification system
  - Push notifications for mobile

### Week 2: Advanced Features

- **Dispute Resolution:**
  - Evidence submission system
  - Arbitration workflows
  - Automated resolution rules
  - Communication tools for parties

- **Analytics & Reporting:**
  - Transaction volume and value metrics
  - Success/failure rate tracking
  - User behavior analysis
  - Financial reconciliation reports

### Week 3: Mobile & Performance

- **Mobile App (PWA):**
  - Native mobile experience
  - Offline capability for forms
  - Camera integration for document capture
  - Push notifications

- **Performance Optimization:**
  - Database query optimization
  - CDN integration for assets
  - Image optimization and compression
  - Caching strategies implementation

### Week 4: Security & Compliance

- **Advanced Security:**
  - Two-factor authentication
  - Device fingerprinting
  - Fraud detection algorithms
  - Advanced audit logging

- **Compliance & Legal:**
  - GDPR compliance tools
  - Terms of service management
  - Legal document templates
  - Regulatory reporting tools

## Conclusion

This comprehensive architecture provides a solid foundation for building the Paylox Escrow System using the Zopio Framework. The 2-day implementation plan is aggressive but achievable with the right team structure and clear task distribution.

**Key Success Factors:**

1. **Leveraging Zopio's Strengths**: 85-90% of infrastructure is already available
2. **Clear Task Separation**: Minimal dependencies between team members
3. **MVP-First Approach**: Focus on core functionality, defer enhancements
4. **Risk Mitigation**: Clear fallback strategies for each major risk
5. **Scalable Architecture**: Foundation supports future growth and features

The hybrid approach of using Jetcheckout for payment processing while building custom escrow logic provides the best balance of functionality, development speed, and future flexibility. The resulting system will be production-ready with proper security, monitoring, and user experience standards.

**Final Deliverable**: A fully functional escrow platform that enables secure transactions between buyers and sellers, with proper fund holding, multi-party approval, and dispute resolution capabilities - all built on the robust Zopio Framework infrastructure.
