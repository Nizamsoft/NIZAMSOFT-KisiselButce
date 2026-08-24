/* Nizam Soft · Kişisel Bütçe — erişilebilirlik yardımcıları
   Dokunma hedefi 44px ve kontrast 4.5:1 kuralları CSS'te; burada klavye ve
   ekran okuyucu davranışı var. */

/** tabindex verilmiş satırlar Enter ve Boşluk ile de açılsın. */
export function klavyeyleAcilir(kap, secici, islev) {
  kap.querySelectorAll(secici).forEach(oge => {
    if (!oge.hasAttribute('tabindex')) oge.setAttribute('tabindex', '0');
    if (!oge.hasAttribute('role')) oge.setAttribute('role', 'button');
    oge.addEventListener('keydown', olay => {
      if (olay.key === 'Enter' || olay.key === ' ') {
        olay.preventDefault();
        islev(oge);
      }
    });
  });
}

/** Ekran okuyucuya sayfa değişimini duyurur. */
let duyuruKutusu = null;
export function duyur(metin) {
  if (!duyuruKutusu) {
    duyuruKutusu = document.createElement('div');
    duyuruKutusu.className = 'yalniz-okuyucu';
    duyuruKutusu.setAttribute('role', 'status');
    duyuruKutusu.setAttribute('aria-live', 'polite');
    document.body.append(duyuruKutusu);
  }
  duyuruKutusu.textContent = '';
  setTimeout(() => { duyuruKutusu.textContent = metin; }, 50);
}
