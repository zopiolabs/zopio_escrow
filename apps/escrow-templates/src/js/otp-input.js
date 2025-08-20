/**
 * SPDX-License-Identifier: MIT
 */

import JustValidate from 'just-validate';

const OTP_REGEX = /^\d{6}$/;

export function setupOTPValidation({
  formId,
  fieldName = 'otp',
  onSubmit,
  duration = 120,
}) {
  const form = document.querySelector(formId);
  if (!form) {
    return;
  }

  const inputs = form.querySelectorAll(`input[name="${fieldName}"]`);
  const resendBtn = form.querySelector('[data-action="resend"]');
  const countdownEl = form.querySelector('[data-countdown]');
  const verifyBtn = form.querySelector('[data-action="verify"]');

  if (inputs.length !== 6 || !verifyBtn || !resendBtn || !countdownEl) {
    return;
  }

  // Harici JustValidate setup
  const validator = new JustValidate(form, {
    validateOnInput: true,
    errorLabelCssClass: 'form__error-label',
  });

  validator.addField(`[name="${fieldName}"]`, [
    {
      validator: () => {
        const value = Array.from(inputs)
          .map((i) => i.value.trim())
          .join('');
        return value.length === 6;
      },
      errorMessage: '6 haneli OTP giriniz',
    },
  ]);

  // Giriş: otomatik ilerleme ve yapıştırma
  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i];
    input.addEventListener('input', (e) => {
      const val = e.target.value;
      if (val.length === 1 && inputs[i + 1]) {
        inputs[i + 1].focus();
      }
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !input.value && inputs[i - 1]) {
        inputs[i - 1].focus();
      }
    });
  }

  inputs[0].addEventListener('paste', (e) => {
    const paste = (e.clipboardData || window.clipboardData).getData('text');
    if (OTP_REGEX.test(paste)) {
      e.preventDefault();
      const chars = paste.split('');
      for (let idx = 0; idx < chars.length; idx++) {
        if (inputs[idx]) {
          inputs[idx].value = chars[idx];
        }
      }
      inputs[5].focus();
    }
  });

  // Sayaç
  let time = duration;
  const interval = setInterval(() => {
    if (time <= 0) {
      clearInterval(interval);
      verifyBtn.disabled = true;
      countdownEl.textContent = '00:00';
    } else {
      const m = String(Math.floor(time / 60)).padStart(2, '0');
      const s = String(time % 60).padStart(2, '0');
      countdownEl.textContent = `${m}:${s}`;
      time--;
    }
  }, 1000);

  resendBtn.addEventListener('click', (e) => {
    e.preventDefault();
    verifyBtn.disabled = false;
    time = duration;
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    validator.revalidate().then((isValid) => {
      if (isValid) {
        const otp = Array.from(inputs)
          .map((i) => i.value)
          .join('');
        if (onSubmit) {
          onSubmit(otp);
        }
      }
    });
  });
}
