/**
 * SPDX-License-Identifier: MIT
 */

export function setupAccordion(accordionSelector) {
  const accordion = document.querySelector(accordionSelector);
  if (!accordion) {
    return;
  }

  const panels = accordion.querySelectorAll('.paymentMethod__panel');
  const headers = accordion.querySelectorAll('.paymentMethod__header');

  for (const panel of panels) {
    const header = panel.querySelector('.paymentMethod__header');

    header.addEventListener('click', () => {
      const isActive = panel.classList.contains('paymentMethod__panel--active');

      // Tüm panelleri kapat (kapanırken içerik yüksekliğini sıfırla)
      for (const p of panels) {
        p.classList.remove('paymentMethod__panel--active');
      }

      for (const h of headers) {
        h.classList.remove('paymentMethod__header--active');
      }

      // Eğer tıklanan panel kapalıysa aç
      if (!isActive) {
        panel.classList.add('paymentMethod__panel--active');
        header.classList.add('paymentMethod__header--active');

        // Açılan paneli sayfanın üstüne kaydır
        setTimeout(() => {
          panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 200); // Animasyonun başlamasını beklet
      }
    });
  }
}
