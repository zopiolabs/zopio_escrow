/**
 * SPDX-License-Identifier: MIT
 */

import { PrismaClient, EscrowStatus, ActivityType, AuditAction } from '../generated/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Paylox Escrow System...');

  // Create sample user profiles
  console.log('👤 Creating user profiles...');

  const seller1 = await prisma.userProfile.create({
    data: {
      userId: 'seller_001',
      fullName: 'Ahmet Yılmaz',
      identityNumber: '12345678901',
      birthDate: new Date('1985-03-15'),
      phone: '532 123 4567',
      phoneVerified: true,
      iban: 'TR330006100519786457841326',
      accountHolder: 'Ahmet Yılmaz',
      address: 'Kadıköy, İstanbul, Türkiye',
      kycStatus: 'APPROVED',
      createdBy: 'system',
      updatedBy: 'system',
    },
  });

  const seller2 = await prisma.userProfile.create({
    data: {
      userId: 'seller_002',
      companyTitle: 'Otomotiv Ticaret A.Ş.',
      taxNumber: '1234567890',
      taxOffice: 'Kadıköy',
      phone: '216 555 0123',
      phoneVerified: true,
      iban: 'TR640011100000000071233601',
      accountHolder: 'Otomotiv Ticaret A.Ş.',
      address: 'Ataşehir, İstanbul, Türkiye',
      kycStatus: 'APPROVED',
      createdBy: 'system',
      updatedBy: 'system',
    },
  });

  const buyer1 = await prisma.userProfile.create({
    data: {
      userId: 'buyer_001',
      fullName: 'Fatma Demir',
      identityNumber: '98765432109',
      birthDate: new Date('1990-07-22'),
      phone: '535 987 6543',
      phoneVerified: true,
      iban: 'TR470001001745563543210001',
      accountHolder: 'Fatma Demir',
      address: 'Beşiktaş, İstanbul, Türkiye',
      kycStatus: 'APPROVED',
      createdBy: 'system',
      updatedBy: 'system',
    },
  });

  const buyer2 = await prisma.userProfile.create({
    data: {
      userId: 'buyer_002',
      fullName: 'Mehmet Özkan',
      identityNumber: '11223344556',
      birthDate: new Date('1988-11-08'),
      phone: '538 456 7890',
      phoneVerified: false,
      iban: 'TR530011100000000071233602',
      accountHolder: 'Mehmet Özkan',
      address: 'Şişli, İstanbul, Türkiye',
      kycStatus: 'PENDING',
      createdBy: 'system',
      updatedBy: 'system',
    },
  });

  console.log('✅ Created 4 user profiles');

  // Create sample escrow transactions in different states
  console.log('💰 Creating escrow transactions...');

  // Transaction 1: Completed vehicle sale
  const transaction1 = await prisma.escrowTransaction.create({
    data: {
      orderId: 'ESC-2024-001',
      sellerId: seller1.userId,
      buyerId: buyer1.userId,
      amount: 250000.0,
      currency: 'TRY',
      platformFee: 6250.0,
      sellerReceives: 243750.0,
      status: 'COMPLETED',
      paymentStatus: 'SUCCESS',
      paymentReference: 'JET_PAY_123456',
      category: 'vehicle',
      title: '2018 BMW 3.20i',
      description: 'Temiz, bakımlı, tek elden çıkma araç. Full bakım yapılmış.',
      productInfo: {
        type: 'vehicle',
        brand: 'BMW',
        model: '320i',
        year: 2018,
        color: 'Beyaz',
        fuel: 'Benzin',
        transmission: 'Otomatik',
        mileage: 75000,
      },
      otpVerified: true,
      sellerApproved: true,
      buyerApproved: true,
      sellerApprovedAt: new Date('2024-01-15T10:30:00Z'),
      buyerApprovedAt: new Date('2024-01-16T14:20:00Z'),
      deliveryMethod: 'Teslim',
      deliveryAddress: 'Beşiktaş, İstanbul',
      paidAt: new Date('2024-01-15T09:15:00Z'),
      deliveredAt: new Date('2024-01-16T16:00:00Z'),
      releasedAt: new Date('2024-01-16T16:30:00Z'),
      completedAt: new Date('2024-01-16T16:30:00Z'),
      createdBy: seller1.userId,
      updatedBy: 'system',
    },
  });

  // Transaction 2: Ongoing transaction - funds held
  const transaction2 = await prisma.escrowTransaction.create({
    data: {
      orderId: 'ESC-2024-002',
      sellerId: seller2.userId,
      buyerId: buyer2.userId,
      amount: 180000.0,
      currency: 'TRY',
      platformFee: 4500.0,
      sellerReceives: 175500.0,
      status: 'FUNDS_HELD',
      paymentStatus: 'SUCCESS',
      paymentReference: 'JET_PAY_789012',
      category: 'vehicle',
      title: '2020 Volkswagen Golf 1.6 TDI',
      description:
        'Az kullanılmış, garantili araç. İkinci el piyasasında nadir bulunan temizlikte.',
      productInfo: {
        type: 'vehicle',
        brand: 'Volkswagen',
        model: 'Golf',
        year: 2020,
        color: 'Gri',
        fuel: 'Dizel',
        transmission: 'Manuel',
        mileage: 45000,
      },
      otpVerified: true,
      sellerApproved: true,
      buyerApproved: false,
      sellerApprovedAt: new Date('2024-01-18T11:00:00Z'),
      deliveryMethod: 'Kargo',
      deliveryAddress: 'Şişli, İstanbul',
      paidAt: new Date('2024-01-18T09:45:00Z'),
      createdBy: seller2.userId,
      updatedBy: 'system',
    },
  });

  // Transaction 3: Disputed transaction
  const transaction3 = await prisma.escrowTransaction.create({
    data: {
      orderId: 'ESC-2024-003',
      sellerId: seller1.userId,
      buyerId: buyer1.userId,
      amount: 85000.0,
      currency: 'TRY',
      platformFee: 2125.0,
      sellerReceives: 82875.0,
      status: 'DISPUTED',
      paymentStatus: 'SUCCESS',
      paymentReference: 'JET_PAY_345678',
      category: 'electronics',
      title: 'iPhone 14 Pro Max 256GB',
      description: 'Sıfır ayarında, kutusunda tüm aksesuarları mevcut.',
      productInfo: {
        type: 'electronics',
        brand: 'Apple',
        model: 'iPhone 14 Pro Max',
        storage: '256GB',
        color: 'Space Black',
        condition: 'new',
      },
      otpVerified: true,
      sellerApproved: true,
      buyerApproved: false,
      sellerApprovedAt: new Date('2024-01-20T13:15:00Z'),
      deliveryMethod: 'Kargo',
      deliveryAddress: 'Beşiktaş, İstanbul',
      deliveryProof: 'https://example.com/delivery-proof.pdf',
      disputed: true,
      disputeReason: 'Ürün açıklamada belirtilenden farklı çıktı',
      disputeRaisedBy: buyer1.userId,
      disputeRaisedAt: new Date('2024-01-22T10:00:00Z'),
      paidAt: new Date('2024-01-20T12:30:00Z'),
      deliveredAt: new Date('2024-01-21T14:20:00Z'),
      createdBy: seller1.userId,
      updatedBy: 'system',
    },
  });

  // Transaction 4: Pending payment
  const transaction4 = await prisma.escrowTransaction.create({
    data: {
      orderId: 'ESC-2024-004',
      sellerId: seller2.userId,
      amount: 15000.0,
      currency: 'TRY',
      platformFee: 375.0,
      sellerReceives: 14625.0,
      status: 'PENDING_PAYMENT',
      paymentStatus: 'PENDING',
      category: 'furniture',
      title: 'Vintage Deri Koltuk Takımı',
      description: "1970'lerden kalma, restore edilmiş deri koltuk takımı.",
      productInfo: {
        type: 'furniture',
        material: 'genuine_leather',
        style: 'vintage',
        pieces: 3,
        color: 'Brown',
        condition: 'restored',
      },
      otpVerified: false,
      sellerApproved: true,
      buyerApproved: false,
      sellerApprovedAt: new Date('2024-01-25T09:00:00Z'),
      createdBy: seller2.userId,
      updatedBy: seller2.userId,
    },
  });

  console.log('✅ Created 4 escrow transactions');

  // Create vehicle info for vehicle transactions
  console.log('🚗 Creating vehicle information...');

  await prisma.vehicleInfo.create({
    data: {
      transactionId: transaction1.id,
      vin: 'WBAPB71090WM12345',
      licensePlate: '34 ABC 123',
      brand: 'BMW',
      model: '320i',
      year: 2018,
      color: 'Beyaz',
      mileage: 75000,
      registrationDoc: 'https://example.com/vehicle-reg-1.pdf',
      createdBy: seller1.userId,
      updatedBy: seller1.userId,
    },
  });

  await prisma.vehicleInfo.create({
    data: {
      transactionId: transaction2.id,
      vin: 'WVWZZZ1KZAM123456',
      licensePlate: '06 DEF 456',
      brand: 'Volkswagen',
      model: 'Golf',
      year: 2020,
      color: 'Gri',
      mileage: 45000,
      registrationDoc: 'https://example.com/vehicle-reg-2.pdf',
      createdBy: seller2.userId,
      updatedBy: seller2.userId,
    },
  });

  console.log('✅ Created 2 vehicle information records');

  // Create sample documents
  console.log('📄 Creating documents...');

  await prisma.document.createMany({
    data: [
      {
        transactionId: transaction1.id,
        type: 'VEHICLE_REGISTRATION',
        url: 'https://example.com/docs/vehicle-reg-1.pdf',
        fileName: 'ruhsat_bmw_320i.pdf',
        fileSize: 1024000,
        mimeType: 'application/pdf',
        uploadedBy: seller1.userId,
        verified: true,
        verifiedBy: 'admin_001',
        verifiedAt: new Date('2024-01-15T08:30:00Z'),
        verificationNotes: 'Belge incelendi, orijinal ve geçerli',
        createdBy: seller1.userId,
        updatedBy: 'admin_001',
      },
      {
        transactionId: transaction1.id,
        type: 'ASSIGNMENT_FORM',
        url: 'https://example.com/docs/assignment-1.pdf',
        fileName: 'temlik_belgesi_bmw.pdf',
        fileSize: 512000,
        mimeType: 'application/pdf',
        uploadedBy: seller1.userId,
        verified: true,
        verifiedBy: 'admin_001',
        verifiedAt: new Date('2024-01-16T15:45:00Z'),
        verificationNotes: 'Temlik belgesi uygun',
        createdBy: seller1.userId,
        updatedBy: 'admin_001',
      },
      {
        transactionId: transaction2.id,
        type: 'VEHICLE_REGISTRATION',
        url: 'https://example.com/docs/vehicle-reg-2.pdf',
        fileName: 'ruhsat_golf.pdf',
        fileSize: 987000,
        mimeType: 'application/pdf',
        uploadedBy: seller2.userId,
        verified: false,
        createdBy: seller2.userId,
        updatedBy: seller2.userId,
      },
      {
        transactionId: transaction3.id,
        type: 'DELIVERY_PROOF',
        url: 'https://example.com/docs/delivery-proof-3.pdf',
        fileName: 'teslimat_belgesi.pdf',
        fileSize: 256000,
        mimeType: 'application/pdf',
        uploadedBy: 'courier_001',
        verified: true,
        verifiedBy: 'admin_002',
        verifiedAt: new Date('2024-01-21T16:00:00Z'),
        verificationNotes: 'Teslimat belgesi onaylandı',
        createdBy: 'courier_001',
        updatedBy: 'admin_002',
      },
    ],
  });

  console.log('✅ Created 4 documents');

  // Create status history for transactions
  console.log('📊 Creating status history...');

  const statusHistoryData = [
    // Transaction 1 history (completed)
    {
      transactionId: transaction1.id,
      fromStatus: null,
      toStatus: EscrowStatus.DRAFT,
      changedBy: seller1.userId,
      reason: 'Transaction created',
      createdBy: seller1.userId,
    },
    {
      transactionId: transaction1.id,
      fromStatus: EscrowStatus.DRAFT,
      toStatus: EscrowStatus.PENDING_BUYER,
      changedBy: seller1.userId,
      reason: 'Seller information completed',
      createdBy: seller1.userId,
    },
    {
      transactionId: transaction1.id,
      fromStatus: EscrowStatus.PENDING_BUYER,
      toStatus: EscrowStatus.PENDING_PAYMENT,
      changedBy: buyer1.userId,
      reason: 'Buyer information added',
      createdBy: buyer1.userId,
    },
    {
      transactionId: transaction1.id,
      fromStatus: EscrowStatus.PENDING_PAYMENT,
      toStatus: EscrowStatus.PAYMENT_PROCESSING,
      changedBy: 'system',
      reason: 'Payment initiated',
      createdBy: 'system',
    },
    {
      transactionId: transaction1.id,
      fromStatus: EscrowStatus.PAYMENT_PROCESSING,
      toStatus: EscrowStatus.FUNDS_HELD,
      changedBy: 'system',
      reason: 'Payment successful',
      createdBy: 'system',
    },
    {
      transactionId: transaction1.id,
      fromStatus: EscrowStatus.FUNDS_HELD,
      toStatus: EscrowStatus.PENDING_DELIVERY,
      changedBy: seller1.userId,
      reason: 'Item shipped',
      createdBy: seller1.userId,
    },
    {
      transactionId: transaction1.id,
      fromStatus: EscrowStatus.PENDING_DELIVERY,
      toStatus: EscrowStatus.DELIVERED,
      changedBy: 'courier_001',
      reason: 'Item delivered',
      createdBy: 'courier_001',
    },
    {
      transactionId: transaction1.id,
      fromStatus: EscrowStatus.DELIVERED,
      toStatus: EscrowStatus.PENDING_RELEASE,
      changedBy: buyer1.userId,
      reason: 'Delivery confirmed',
      createdBy: buyer1.userId,
    },
    {
      transactionId: transaction1.id,
      fromStatus: EscrowStatus.PENDING_RELEASE,
      toStatus: EscrowStatus.COMPLETED,
      changedBy: 'system',
      reason: 'Funds released',
      createdBy: 'system',
    },

    // Transaction 2 history (funds held)
    {
      transactionId: transaction2.id,
      fromStatus: null,
      toStatus: EscrowStatus.DRAFT,
      changedBy: seller2.userId,
      reason: 'Transaction created',
      createdBy: seller2.userId,
    },
    {
      transactionId: transaction2.id,
      fromStatus: EscrowStatus.DRAFT,
      toStatus: EscrowStatus.PENDING_BUYER,
      changedBy: seller2.userId,
      reason: 'Seller information completed',
      createdBy: seller2.userId,
    },
    {
      transactionId: transaction2.id,
      fromStatus: EscrowStatus.PENDING_BUYER,
      toStatus: EscrowStatus.PENDING_PAYMENT,
      changedBy: buyer2.userId,
      reason: 'Buyer information added',
      createdBy: buyer2.userId,
    },
    {
      transactionId: transaction2.id,
      fromStatus: EscrowStatus.PENDING_PAYMENT,
      toStatus: EscrowStatus.PAYMENT_PROCESSING,
      changedBy: 'system',
      reason: 'Payment initiated',
      createdBy: 'system',
    },
    {
      transactionId: transaction2.id,
      fromStatus: EscrowStatus.PAYMENT_PROCESSING,
      toStatus: EscrowStatus.FUNDS_HELD,
      changedBy: 'system',
      reason: 'Payment successful',
      createdBy: 'system',
    },

    // Transaction 3 history (disputed)
    {
      transactionId: transaction3.id,
      fromStatus: null,
      toStatus: EscrowStatus.DRAFT,
      changedBy: seller1.userId,
      reason: 'Transaction created',
      createdBy: seller1.userId,
    },
    {
      transactionId: transaction3.id,
      fromStatus: EscrowStatus.DRAFT,
      toStatus: EscrowStatus.PENDING_BUYER,
      changedBy: seller1.userId,
      reason: 'Seller information completed',
      createdBy: seller1.userId,
    },
    {
      transactionId: transaction3.id,
      fromStatus: EscrowStatus.PENDING_BUYER,
      toStatus: EscrowStatus.PENDING_PAYMENT,
      changedBy: buyer1.userId,
      reason: 'Buyer information added',
      createdBy: buyer1.userId,
    },
    {
      transactionId: transaction3.id,
      fromStatus: EscrowStatus.PENDING_PAYMENT,
      toStatus: EscrowStatus.PAYMENT_PROCESSING,
      changedBy: 'system',
      reason: 'Payment initiated',
      createdBy: 'system',
    },
    {
      transactionId: transaction3.id,
      fromStatus: EscrowStatus.PAYMENT_PROCESSING,
      toStatus: EscrowStatus.FUNDS_HELD,
      changedBy: 'system',
      reason: 'Payment successful',
      createdBy: 'system',
    },
    {
      transactionId: transaction3.id,
      fromStatus: EscrowStatus.FUNDS_HELD,
      toStatus: EscrowStatus.PENDING_DELIVERY,
      changedBy: seller1.userId,
      reason: 'Item shipped',
      createdBy: seller1.userId,
    },
    {
      transactionId: transaction3.id,
      fromStatus: EscrowStatus.PENDING_DELIVERY,
      toStatus: EscrowStatus.DELIVERED,
      changedBy: 'courier_001',
      reason: 'Item delivered',
      createdBy: 'courier_001',
    },
    {
      transactionId: transaction3.id,
      fromStatus: EscrowStatus.DELIVERED,
      toStatus: EscrowStatus.DISPUTED,
      changedBy: buyer1.userId,
      reason: 'Dispute raised',
      createdBy: buyer1.userId,
    },
  ];

  await prisma.statusHistory.createMany({ data: statusHistoryData });

  console.log(
    `✅ Created ${statusHistoryData.length} status history records`
  );

  // Create activities
  console.log('📋 Creating activities...');

  const activitiesData = [
    {
      transactionId: transaction1.id,
      type: ActivityType.CREATED,
      description: 'Transaction created by seller',
      performedBy: seller1.userId,
      createdBy: seller1.userId,
    },
    {
      transactionId: transaction1.id,
      type: ActivityType.PAYMENT_INITIATED,
      description: 'Payment initiated by buyer',
      performedBy: buyer1.userId,
      createdBy: buyer1.userId,
    },
    {
      transactionId: transaction1.id,
      type: ActivityType.PAYMENT_COMPLETED,
      description: 'Payment completed successfully',
      performedBy: 'system',
      createdBy: 'system',
    },
    {
      transactionId: transaction1.id,
      type: ActivityType.DOCUMENT_UPLOADED,
      description: 'Vehicle registration uploaded',
      performedBy: seller1.userId,
      createdBy: seller1.userId,
    },
    {
      transactionId: transaction1.id,
      type: ActivityType.DOCUMENT_VERIFIED,
      description: 'Vehicle registration verified',
      performedBy: 'admin_001',
      createdBy: 'admin_001',
    },
    {
      transactionId: transaction1.id,
      type: ActivityType.DELIVERED,
      description: 'Item delivered to buyer',
      performedBy: 'courier_001',
      createdBy: 'courier_001',
    },
    {
      transactionId: transaction1.id,
      type: ActivityType.APPROVED,
      description: 'Delivery approved by buyer',
      performedBy: buyer1.userId,
      createdBy: buyer1.userId,
    },

    {
      transactionId: transaction2.id,
      type: ActivityType.CREATED,
      description: 'Transaction created by seller',
      performedBy: seller2.userId,
      createdBy: seller2.userId,
    },
    {
      transactionId: transaction2.id,
      type: ActivityType.PAYMENT_COMPLETED,
      description: 'Payment completed successfully',
      performedBy: 'system',
      createdBy: 'system',
    },
    {
      transactionId: transaction2.id,
      type: ActivityType.DOCUMENT_UPLOADED,
      description: 'Vehicle registration uploaded',
      performedBy: seller2.userId,
      createdBy: seller2.userId,
    },

    {
      transactionId: transaction3.id,
      type: ActivityType.CREATED,
      description: 'Transaction created by seller',
      performedBy: seller1.userId,
      createdBy: seller1.userId,
    },
    {
      transactionId: transaction3.id,
      type: ActivityType.PAYMENT_COMPLETED,
      description: 'Payment completed successfully',
      performedBy: 'system',
      createdBy: 'system',
    },
    {
      transactionId: transaction3.id,
      type: ActivityType.DELIVERED,
      description: 'Item delivered to buyer',
      performedBy: 'courier_001',
      createdBy: 'courier_001',
    },
    {
      transactionId: transaction3.id,
      type: ActivityType.DISPUTED,
      description: 'Dispute raised by buyer',
      performedBy: buyer1.userId,
      createdBy: buyer1.userId,
    },

    {
      transactionId: transaction4.id,
      type: ActivityType.CREATED,
      description: 'Transaction created by seller',
      performedBy: seller2.userId,
      createdBy: seller2.userId,
    },
  ];

  await prisma.activity.createMany({ data: activitiesData });

  console.log(`✅ Created ${activitiesData.length} activities`);

  // Create audit logs
  console.log('🔍 Creating audit logs...');

  const auditLogData = [
    {
      entityType: 'EscrowTransaction',
      entityId: transaction1.id,
      transactionId: transaction1.id,
      action: AuditAction.CREATE,
      userId: seller1.userId,
      userRole: 'seller',
      ipAddress: '192.168.1.100',
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      reason: 'New transaction created',
      newValue: {
        orderId: transaction1.orderId,
        status: 'DRAFT',
        amount: 250000.0,
      },
      checksum: 'abc123def456',
    },
    {
      entityType: 'EscrowTransaction',
      entityId: transaction1.id,
      transactionId: transaction1.id,
      action: AuditAction.STATUS_CHANGE,
      fieldName: 'status',
      oldValue: 'FUNDS_HELD',
      newValue: 'COMPLETED',
      userId: 'system',
      userRole: 'system',
      reason: 'Funds released automatically',
      checksum: 'def456ghi789',
    },
    {
      entityType: 'UserProfile',
      entityId: seller1.id,
      action: AuditAction.CREATE,
      userId: 'system',
      userRole: 'system',
      ipAddress: '127.0.0.1',
      reason: 'Initial profile creation',
      newValue: {
        userId: seller1.userId,
        fullName: seller1.fullName,
        kycStatus: 'APPROVED',
      },
      checksum: 'ghi789jkl012',
    },
    {
      entityType: 'EscrowTransaction',
      entityId: transaction3.id,
      transactionId: transaction3.id,
      action: AuditAction.DISPUTE_RAISED,
      fieldName: 'disputed',
      oldValue: false,
      newValue: true,
      userId: buyer1.userId,
      userRole: 'buyer',
      ipAddress: '192.168.1.102',
      reason: 'Product quality issue reported',
      checksum: 'jkl012mno345',
    },
  ];

  await prisma.auditLog.createMany({ data: auditLogData });

  console.log(`✅ Created ${auditLogData.length} audit log entries`);

  // Display summary
  console.log('\n🎉 Paylox Escrow System seeding completed!');
  console.log('='.repeat(50));

  const summary = await Promise.all([
    prisma.userProfile.count(),
    prisma.escrowTransaction.count(),
    prisma.vehicleInfo.count(),
    prisma.document.count(),
    prisma.statusHistory.count(),
    prisma.activity.count(),
    prisma.auditLog.count(),
  ]);

  console.log(`👥 User Profiles: ${summary[0]}`);
  console.log(`💰 Escrow Transactions: ${summary[1]}`);
  console.log(`🚗 Vehicle Info: ${summary[2]}`);
  console.log(`📄 Documents: ${summary[3]}`);
  console.log(`📊 Status History: ${summary[4]}`);
  console.log(`📋 Activities: ${summary[5]}`);
  console.log(`🔍 Audit Logs: ${summary[6]}`);
  console.log('='.repeat(50));

  // Show sample transaction data
  console.log('\n📝 Sample Transaction States:');
  const transactions = await prisma.escrowTransaction.findMany({
    select: {
      orderId: true,
      title: true,
      amount: true,
      status: true,
      paymentStatus: true,
      seller: { select: { fullName: true, companyTitle: true } },
      buyer: { select: { fullName: true } },
    },
  });

  for (const tx of transactions) {
    const sellerName = tx.seller.fullName || tx.seller.companyTitle;
    const buyerName = tx.buyer?.fullName || 'Pending';
    console.log(
      `${tx.orderId}: ${tx.title} - ₺${tx.amount} - ${tx.status}/${tx.paymentStatus}`
    );
    console.log(`  Seller: ${sellerName}, Buyer: ${buyerName}`);
  }
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    console.log('🔚 Disconnecting from database...');
    await prisma.$disconnect();
  });
