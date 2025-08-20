/**
 * SPDX-License-Identifier: MIT
 */

import { setupToggle } from './toggle.js';
import { setupTogglePanel } from './toggle-panel.js';
import { setupToggleSummaryPanel } from './toggle-summary-panel.js';
import { setupTooltips } from './tooltip.js';

document.addEventListener('DOMContentLoaded', () => {
  setupToggle({
    buttonId: 'showBilling',
    panelId: 'billingPanel',
  });
  setupTogglePanel({
    panelId: 'slickSheet',
    backdropId: 'slickSheetBackdrop',
    openBtnId: 'togglePanelBtn',
    closeBtnId: 'closePanelBtn',
  });
  setupTogglePanel({
    panelId: 'addAddress',
    backdropId: 'slickSheetAddAddressBackdrop',
    openBtnId: 'toggleAddAddressPanelBtn',
    closeBtnId: 'closeAddAddressPanelBtn',
  });
  setupToggleSummaryPanel({
    panelId: 'summaryWrapper',
    backdropId: 'slickSheetSummaryBackdrop',
    openBtnId: 'showSummaryBtn',
    closeBtnId: 'closeSummaryPanelBtn',
  });

  setupTooltips();
  //   setupModal({
  //     modalId: "showAllInstallmentModal",
  //     openBtnId: "showAllInstallmentBtn",
  //     closeBtnId: "closeModalBtn",
  //     closeOnEscape: true,
  //     closeOnBackdropClick: true
  // });
});
