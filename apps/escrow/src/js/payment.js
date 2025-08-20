/**
 * SPDX-License-Identifier: MIT
 */

import { setupFileUpload } from './file-upload.js';
import { setupPartialPriceValidation } from './setup-partial-price-validation.js';

document.addEventListener('DOMContentLoaded', () => {
  setupPartialPriceValidation();
  setupFileUpload({
    inputId: 'file-input',
    listId: 'files-list',
    counterId: 'num-of-files',
  });
});
