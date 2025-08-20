-- CreateEnum
CREATE TYPE "KYCStatus" AS ENUM ('PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "EscrowStatus" AS ENUM ('DRAFT', 'PENDING_BUYER', 'PENDING_PAYMENT', 'PAYMENT_PROCESSING', 'FUNDS_HELD', 'PENDING_DELIVERY', 'DELIVERED', 'PENDING_RELEASE', 'COMPLETED', 'DISPUTED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 'CANCELLED', 'REFUNDED', 'PARTIAL_REFUND');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('VEHICLE_REGISTRATION', 'ASSIGNMENT_FORM', 'DELIVERY_PROOF', 'ID_VERIFICATION', 'PRODUCT_IMAGE', 'OTHER');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('CREATED', 'UPDATED', 'PAYMENT_INITIATED', 'PAYMENT_COMPLETED', 'PAYMENT_FAILED', 'DELIVERED', 'APPROVED', 'DISPUTED', 'RESOLVED', 'CANCELLED', 'REFUNDED', 'DOCUMENT_UPLOADED', 'DOCUMENT_VERIFIED', 'PROFILE_UPDATED', 'VEHICLE_INFO_UPDATED', 'AUDIT_LOG_CREATED');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'SOFT_DELETE', 'RESTORE', 'STATUS_CHANGE', 'APPROVAL_GRANTED', 'APPROVAL_REVOKED', 'PAYMENT_PROCESSED', 'DOCUMENT_UPLOADED', 'DOCUMENT_VERIFIED', 'DOCUMENT_DELETED', 'DISPUTE_RAISED', 'DISPUTE_RESOLVED', 'FUNDS_RELEASED', 'TRANSACTION_CANCELLED');

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" TEXT,
    "identityNumber" TEXT,
    "birthDate" TIMESTAMP(3),
    "phone" TEXT,
    "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "companyTitle" TEXT,
    "taxNumber" TEXT,
    "taxOffice" TEXT,
    "iban" TEXT,
    "accountHolder" TEXT,
    "address" TEXT,
    "kycStatus" "KYCStatus" NOT NULL DEFAULT 'PENDING',
    "kycDocuments" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EscrowTransaction" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "buyerId" TEXT,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "platformFee" DECIMAL(10,2) NOT NULL,
    "sellerReceives" DECIMAL(12,2) NOT NULL,
    "status" "EscrowStatus" NOT NULL,
    "paymentStatus" "PaymentStatus" NOT NULL,
    "paymentReference" TEXT,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "productInfo" JSONB NOT NULL,
    "otpVerified" BOOLEAN NOT NULL DEFAULT false,
    "otpCode" TEXT,
    "otpExpiresAt" TIMESTAMP(3),
    "sellerApproved" BOOLEAN NOT NULL DEFAULT false,
    "buyerApproved" BOOLEAN NOT NULL DEFAULT false,
    "sellerApprovedAt" TIMESTAMP(3),
    "buyerApprovedAt" TIMESTAMP(3),
    "deliveryMethod" TEXT,
    "trackingNumber" TEXT,
    "deliveryAddress" TEXT,
    "deliveryProof" TEXT,
    "disputed" BOOLEAN NOT NULL DEFAULT false,
    "disputeReason" TEXT,
    "disputeRaisedBy" TEXT,
    "disputeRaisedAt" TIMESTAMP(3),
    "disputeResolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "shippedAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "releasedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "EscrowTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleInfo" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "vin" TEXT NOT NULL,
    "licensePlate" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "color" TEXT,
    "mileage" INTEGER,
    "registrationDoc" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "VehicleInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "url" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "uploadedBy" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "verificationNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatusHistory" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "fromStatus" "EscrowStatus",
    "toStatus" "EscrowStatus" NOT NULL,
    "changedBy" TEXT NOT NULL,
    "reason" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "StatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "type" "ActivityType" NOT NULL,
    "description" TEXT NOT NULL,
    "performedBy" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "transactionId" TEXT,
    "action" "AuditAction" NOT NULL,
    "fieldName" TEXT,
    "oldValue" JSONB,
    "newValue" JSONB,
    "userId" TEXT NOT NULL,
    "userRole" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "sessionId" TEXT,
    "reason" TEXT,
    "metadata" JSONB,
    "checksum" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");

-- CreateIndex
CREATE INDEX "UserProfile_createdBy_idx" ON "UserProfile"("createdBy");

-- CreateIndex
CREATE INDEX "UserProfile_updatedBy_idx" ON "UserProfile"("updatedBy");

-- CreateIndex
CREATE INDEX "UserProfile_deletedAt_idx" ON "UserProfile"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "EscrowTransaction_orderId_key" ON "EscrowTransaction"("orderId");

-- CreateIndex
CREATE INDEX "EscrowTransaction_sellerId_idx" ON "EscrowTransaction"("sellerId");

-- CreateIndex
CREATE INDEX "EscrowTransaction_buyerId_idx" ON "EscrowTransaction"("buyerId");

-- CreateIndex
CREATE INDEX "EscrowTransaction_status_idx" ON "EscrowTransaction"("status");

-- CreateIndex
CREATE INDEX "EscrowTransaction_paymentStatus_idx" ON "EscrowTransaction"("paymentStatus");

-- CreateIndex
CREATE INDEX "EscrowTransaction_createdAt_idx" ON "EscrowTransaction"("createdAt");

-- CreateIndex
CREATE INDEX "EscrowTransaction_createdBy_idx" ON "EscrowTransaction"("createdBy");

-- CreateIndex
CREATE INDEX "EscrowTransaction_updatedBy_idx" ON "EscrowTransaction"("updatedBy");

-- CreateIndex
CREATE INDEX "EscrowTransaction_deletedAt_idx" ON "EscrowTransaction"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "VehicleInfo_transactionId_key" ON "VehicleInfo"("transactionId");

-- CreateIndex
CREATE INDEX "VehicleInfo_createdBy_idx" ON "VehicleInfo"("createdBy");

-- CreateIndex
CREATE INDEX "VehicleInfo_updatedBy_idx" ON "VehicleInfo"("updatedBy");

-- CreateIndex
CREATE INDEX "VehicleInfo_deletedAt_idx" ON "VehicleInfo"("deletedAt");

-- CreateIndex
CREATE INDEX "Document_transactionId_idx" ON "Document"("transactionId");

-- CreateIndex
CREATE INDEX "Document_uploadedBy_idx" ON "Document"("uploadedBy");

-- CreateIndex
CREATE INDEX "Document_verifiedBy_idx" ON "Document"("verifiedBy");

-- CreateIndex
CREATE INDEX "Document_createdBy_idx" ON "Document"("createdBy");

-- CreateIndex
CREATE INDEX "Document_updatedBy_idx" ON "Document"("updatedBy");

-- CreateIndex
CREATE INDEX "Document_deletedAt_idx" ON "Document"("deletedAt");

-- CreateIndex
CREATE INDEX "StatusHistory_transactionId_idx" ON "StatusHistory"("transactionId");

-- CreateIndex
CREATE INDEX "StatusHistory_changedBy_idx" ON "StatusHistory"("changedBy");

-- CreateIndex
CREATE INDEX "StatusHistory_createdBy_idx" ON "StatusHistory"("createdBy");

-- CreateIndex
CREATE INDEX "StatusHistory_createdAt_idx" ON "StatusHistory"("createdAt");

-- CreateIndex
CREATE INDEX "Activity_transactionId_idx" ON "Activity"("transactionId");

-- CreateIndex
CREATE INDEX "Activity_performedBy_idx" ON "Activity"("performedBy");

-- CreateIndex
CREATE INDEX "Activity_createdBy_idx" ON "Activity"("createdBy");

-- CreateIndex
CREATE INDEX "Activity_createdAt_idx" ON "Activity"("createdAt");

-- CreateIndex
CREATE INDEX "Activity_type_idx" ON "Activity"("type");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_transactionId_idx" ON "AuditLog"("transactionId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_checksum_idx" ON "AuditLog"("checksum");

