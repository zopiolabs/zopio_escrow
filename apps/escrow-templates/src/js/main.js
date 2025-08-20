/**
 * SPDX-License-Identifier: MIT
 */

import { setupFormSwitcher } from './form-switcher.js';
import { setupTogglePanel } from './toggle-panel.js';
import { setupTooltips } from './tooltip.js';
import { setupVinMask } from './validate-vin-checksum.js';

document.addEventListener('DOMContentLoaded', () => {
  setupFormSwitcher();
  setupVinMask();
  //   setupAccordion(".paymentMethod");
  //   setupTabSwitcher(
  //     "paymentWithCreditCardBtn",
  //     "paymentWithSavedCardBtn",
  //     "creditCardWrapper",
  //     "saveCardWrapper"
  //   );
  //   setupWizard({
  //     step1Id: "shoppingCreditStep1",
  //     step2Id: "shoppingCreditStep2",
  //     nextBtnId: "shoppingCreditStep1Btn",
  //     backBtnId: "shoppingCreditStep2Btn"
  // });
  // setupToggle({
  //   buttonId: "save_card",
  //   panelId: "saveCardPanel"
  // });
  setupTogglePanel({
    panelId: 'slickSheet',
    backdropId: 'slickSheetBackdrop',
    openBtnId: 'togglePanelBtn',
    closeBtnId: 'closePanelBtn',
  });
  // setupToggleSummaryPanel({
  //   panelId: "summaryWrapper",
  //   backdropId: "slickSheetSummaryBackdrop",
  //   openBtnId: "showSummaryBtn",
  //   closeBtnId: "closeSummaryPanelBtn"
  // });
  // setupToggle({
  //   buttonId: "showBilling",
  //   panelId: "billingPanel"
  // });
  setupTooltips();
  //   setupModal({
  //     modalId: "showAllInstallmentModal",
  //     openBtnId: "showAllInstallmentBtn",
  //     closeBtnId: "closeModalBtn",
  //     closeOnEscape: true,
  //     closeOnBackdropClick: true
  // });
});
