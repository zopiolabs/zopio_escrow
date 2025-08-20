/**
 * SPDX-License-Identifier: MIT
 */

import { database } from '@repo/database';

export const GET = async () => {
  const healthCheck = await database.auditLog.create({
    data: {
      entityType: 'SYSTEM',
      entityId: 'keep-alive',
      action: 'CREATE',
      userId: 'system',
      reason: 'Database connection health check',
    },
  });

  await database.auditLog.delete({
    where: {
      id: healthCheck.id,
    },
  });

  return new Response('OK', { status: 200 });
};
