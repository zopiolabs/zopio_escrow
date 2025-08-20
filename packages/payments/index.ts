/**
 * SPDX-License-Identifier: MIT
 */

import 'server-only';
import Stripe from 'stripe';
import { keys } from './keys';

const secretKey = keys().STRIPE_SECRET_KEY;
export const stripe = secretKey
  ? new Stripe(secretKey, {
      apiVersion: '2025-07-30.basil',
    })
  : null;

export type { Stripe } from 'stripe';
