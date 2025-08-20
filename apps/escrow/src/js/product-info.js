/**
 * SPDX-License-Identifier: MIT
 */

import { setupFileUpload } from './file-upload.js';
import { setupFormSwitcher } from './form-switcher.js';
import { setupTogglePanel } from './toggle-panel.js';
import { setupTooltips } from './tooltip.js';
import { isValidVinChecksum } from './validate-vin-checksum.js';

import JustValidate from 'just-validate';

// Regex constants
const NOT_ZERO_REGEX = /^(?!0$)/;
const VIN_REGEX = /^[A-HJ-NPR-Z0-9]{17}$/;
const PLATE_REGEX = /^(0[1-9]|[1-7][0-9]|8[01])\s?[A-Z]{1,3}\s?[0-9]{1,4}$/;

document.addEventListener('DOMContentLoaded', () => {
  setupFormSwitcher();
  setupTogglePanel({
    panelId: 'slickSheet',
    backdropId: 'slickSheetBackdrop',
    openBtnId: 'togglePanelBtn',
    closeBtnId: 'closePanelBtn',
  });
  setupTooltips();
  setupFileUpload({
    inputId: 'file-input',
    listId: 'files-list',
    counterId: 'num-of-files',
  });

  const validator = new JustValidate('#productInfo', {
    validateOnInput: true,
    errorLabelCssClass: 'form__error-label',
  });

  for (const el of document.querySelectorAll(
    '#productInfo input, #productInfo select'
  )) {
    el.addEventListener('input', () => {
      const selector = el.id ? `#${el.id}` : `[name="${el.name}"]`;
      validator.revalidateField(selector);
    });
  }

  validator
    // Satış Kategorisi
    .addField('#town', [
      {
        rule: 'customRegexp',
        value: NOT_ZERO_REGEX,
        errorMessage: 'Lütfen satış kategorisi seçin',
      },
    ])

    // Satış Fiyatı
    .addField('[name="price"]', [
      {
        rule: 'required',
        errorMessage: 'Satış fiyatı zorunludur',
      },
      {
        rule: 'number',
        errorMessage: 'Geçerli bir sayı girin',
      },
    ])

    // Şase No
    .addField('#vinInput', [
      {
        rule: 'required',
        errorMessage: 'Şase numarası zorunludur',
      },
      {
        rule: 'customRegexp',
        value: VIN_REGEX,
        errorMessage: 'Geçerli bir 17 karakterlik VIN girin',
      },
      {
        validator: (value) => isValidVinChecksum(value.toUpperCase()),
        errorMessage: 'Geçersiz VIN numarası (kontrol hanesi yanlış)',
      },
    ])

    // Plaka
    .addField('[name="numberplate"]', [
      {
        rule: 'required',
        errorMessage: 'Plaka zorunludur',
      },
      {
        rule: 'customRegexp',
        value: PLATE_REGEX,
        errorMessage: 'Geçerli bir plaka girin (örn: 34 ABC 123)',
      },
    ])

    // Marka
    .addField('#brand', [
      {
        rule: 'customRegexp',
        value: NOT_ZERO_REGEX,
        errorMessage: 'Marka seçin',
      },
    ])

    // Model
    .addField('#model', [
      {
        rule: 'customRegexp',
        value: NOT_ZERO_REGEX,
        errorMessage: 'Model seçin',
      },
    ])

    // Yıl
    .addField('[name="year"]', [
      {
        rule: 'required',
        errorMessage: 'Yıl zorunludur',
      },
      {
        rule: 'number',
        errorMessage: 'Yıl sadece sayı olmalıdır',
      },
      {
        rule: 'minNumber',
        value: 1950,
        errorMessage: 'Geçerli bir yıl girin',
      },
      {
        rule: 'maxNumber',
        value: new Date().getFullYear(),
        errorMessage: 'Gelecek yıl girilemez',
      },
    ])

    // Ruhsat Fotoğrafı (file input)
    .addField('#file-input', [
      {
        validator: () => {
          const input = document.querySelector('#file-input');
          return input?.files && input.files.length > 0;
        },
        errorMessage: 'En az bir dosya seçmelisiniz',
      },
    ])

    // Submit başarılıysa
    .onSuccess((event) => {
      event.target.submit();
    })

    // Hata varsa konsola logla (debug için)
    .onFail((_fields) => {
      // Validation failed - could add custom error handling here
    });

  document
    .querySelector('[name="numberplate"]')
    .addEventListener('input', (e) => {
      e.target.value = e.target.value.toUpperCase();
    });
});
