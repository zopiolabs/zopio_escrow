/**
 * SPDX-License-Identifier: MIT
 */

import { setupFileUpload } from './fileUpload.js';
import { setupPartialPriceValidation } from './setupPartialPriceValidation.js';

document.addEventListener('DOMContentLoaded', () => {
  setupPartialPriceValidation();
  setupFileUpload({
    inputId: 'file-input',
    listId: 'files-list',
    counterId: 'num-of-files',
  });
});
