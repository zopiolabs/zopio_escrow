/**
 * SPDX-License-Identifier: MIT
 */

import { StripeAgentToolkit } from '@stripe/agent-toolkit/ai-sdk';
import { keys } from './keys';

const secretKey = keys().STRIPE_SECRET_KEY;
export const paymentsAgentToolkit = secretKey
  ? new StripeAgentToolkit({
      secretKey,
      configuration: {
        actions: {
          paymentLinks: {
            create: true,
          },
          products: {
            create: true,
          },
          prices: {
            create: true,
          },
        },
      },
    })
  : null;
