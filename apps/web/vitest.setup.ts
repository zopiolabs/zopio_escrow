/**
 * SPDX-License-Identifier: MIT
 */

import * as matchers from '@testing-library/jest-dom/matchers';
import { cleanup } from '@testing-library/react';
import { afterEach, expect } from 'vitest';

// Extend Vitest's expect with Jest DOM matchers
expect.extend(matchers);

// Set up global afterEach hook for cleanup
afterEach(() => {
  cleanup();
});
