/**
 * SPDX-License-Identifier: MIT
 */

import { setupFormSwitcher } from './form-switcher.js';
import { setupOTPValidation } from './otp-input.js';
import { setupTogglePanel } from './toggle-panel.js';
import { setupTooltips } from './tooltip.js';

import JustValidate from 'just-validate';

// Regex constants
const _PHONE_REGEX = /^[0-9\s]{10,15}$/;
const _IBAN_REGEX = /^TR\d{2}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{0,2}$/;
const _TC_KIMLIK_REGEX = /^[1-9][0-9]{10}$/;
const _BIRTHDATE_REGEX = /^\d{2}\/\d{2}\/\d{4}$/;
const _TAX_NUMBER_REGEX = /^[0-9]{10}$/;

document.addEventListener('DOMContentLoaded', () => {
  setupFormSwitcher();
  setupTogglePanel({
    panelId: 'slickSheet',
    backdropId: 'slickSheetBackdrop',
    openBtnId: 'togglePanelBtn',
    closeBtnId: 'closePanelBtn',
  });
  setupTooltips();
  setupOTPValidation({
    formId: '#otpBox',
    fieldName: 'otp',
    duration: 120,
    onSubmit: (_code) => {
      // Burada sunucuya doğrulama isteği atabilirsiniz
    },
  });
  const form = document.querySelector('#sellerInfo');
  if (!form) {
    return;
  }
  const getUserType = () =>
    document.querySelector('input[name="userType"]:checked')?.value;

  const validator = new JustValidate(form, {
    validateOnInput: true,
    errorLabelCssClass: 'form__error-label',
  });

  // ✅ Hot validate tetikleyici (JustValidate 4.x uyumlu)
  const registeredSelectors = [
    '#email_individual',
    '#email_corporate',
    '#phone_individual',
    '#phone_corporate',
    '#iban_individual',
    '#iban_corporate',
    '#ibanaccountname_individual',
    '#ibanaccountname_corporate',
    '[name="namesurname"]',
    '[name="idendity"]',
    '[name="birthdate"]',
    '[name="corporatetitle"]',
    '[name="taxnumber"]',
    '[name="person"]',
  ];

  for (const el of form.querySelectorAll('input, select')) {
    const selector = el.id ? `#${el.id}` : `[name="${el.name}"]`;

    if (registeredSelectors.includes(selector)) {
      el.addEventListener('input', () => {
        if (!el.hasAttribute('data-validate-ignore')) {
          validator.revalidateField(selector);
        }
      });
    }
  }

  // ✅ Ortak alanlar (id bazlı)
  validator
    .addField('#email_individual', [
      { rule: 'required', errorMessage: 'E-posta zorunludur' },
      { rule: 'email', errorMessage: 'Geçerli bir e-posta giriniz' },
    ])
    .addField('#email_corporate', [
      { rule: 'required', errorMessage: 'E-posta zorunludur' },
      { rule: 'email', errorMessage: 'Geçerli bir e-posta giriniz' },
    ])
    .addField('#phone_individual', [
      { rule: 'required', errorMessage: 'Telefon zorunludur' },
      {
        rule: 'customRegexp',
        value: _PHONE_REGEX,
        errorMessage: 'Geçerli bir telefon giriniz',
      },
    ])
    .addField('#phone_corporate', [
      { rule: 'required', errorMessage: 'Telefon zorunludur' },
      {
        rule: 'customRegexp',
        value: _PHONE_REGEX,
        errorMessage: 'Geçerli bir telefon giriniz',
      },
    ])
    .addField('#iban_individual', [
      { rule: 'required', errorMessage: 'IBAN zorunludur' },
      {
        validator: (val) => _IBAN_REGEX.test(val.replace(/\s/g, '')),
        errorMessage: 'Geçerli bir IBAN giriniz',
      },
    ])
    .addField('#iban_corporate', [
      { rule: 'required', errorMessage: 'IBAN zorunludur' },
      {
        validator: (val) => _IBAN_REGEX.test(val.replace(/\s/g, '')),
        errorMessage: 'Geçerli bir IBAN giriniz',
      },
    ])
    .addField('#ibanaccountname_individual', [
      { rule: 'required', errorMessage: 'Hesap adı zorunludur' },
    ])
    .addField('#ibanaccountname_corporate', [
      { rule: 'required', errorMessage: 'Hesap adı zorunludur' },
    ]);

  // ✅ Bireysel alanlar
  validator
    .addField('[name="namesurname"]', [
      { rule: 'required', errorMessage: 'Ad Soyad zorunludur' },
    ])
    .addField('[name="idendity"]', [
      { rule: 'required', errorMessage: 'T.C. Kimlik No zorunludur' },
      {
        validator: (val) => _TC_KIMLIK_REGEX.test(val),
        errorMessage: '11 haneli geçerli T.C. No girin',
      },
    ])
    .addField('[name="birthdate"]', [
      { rule: 'required', errorMessage: 'Doğum tarihi zorunludur' },
      {
        validator: (val) => _BIRTHDATE_REGEX.test(val),
        errorMessage: 'GG/AA/YYYY formatında girin',
      },
    ]);

  // ✅ Kurumsal alanlar
  validator
    .addField('[name="corporatetitle"]', [
      { rule: 'required', errorMessage: 'Firma unvanı zorunludur' },
    ])
    .addField('[name="taxnumber"]', [
      { rule: 'required', errorMessage: 'Vergi numarası zorunludur' },
      {
        validator: (val) => _TAX_NUMBER_REGEX.test(val),
        errorMessage: '10 haneli geçerli vergi no girin',
      },
    ])
    .addField('[name="person"]', [
      { rule: 'required', errorMessage: 'Yetkili kişi adı zorunludur' },
    ]);

  // ✅ Sadece görünür alanlarda validasyon çalıştır
  validator.onValidate(() => {
    const type = getUserType();
    for (const el of form.querySelectorAll(
      '#individual input, #corporate input'
    )) {
      const visible = el.closest(`#${type}`);
      if (visible) {
        el.removeAttribute('data-validate-ignore');
      } else {
        el.setAttribute('data-validate-ignore', 'true');
      }
    }
  });

  // ✅ IBAN & ünvan otomatik büyük harf
  for (const input of form.querySelectorAll(
    '#iban_individual, #iban_corporate, #corporatetitle'
  )) {
    input.addEventListener('input', () => {
      input.value = input.value.toUpperCase();
    });
  }

  // ✅ Geçerli form submiti
  validator.onSuccess((e) => {
    e.target.submit();
  });
});
