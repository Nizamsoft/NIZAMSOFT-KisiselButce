/* Nizam Soft · Kişisel Bütçe — canlı sayı davranışı
   Hareket miktarı kararı "bol": sayaçlar sayarak yükselir, değişen sayı
   bir an vurgu renginde parlar. Sistemde hareketi azalt açıksa iki davranış
   da kapanır ve sayı doğrudan yazılır. */

import { para } from './veri/bicim.js';

const AZALT = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Sayaçların son değerleri; değişince parlaması için tutulur. */
const sonDegerler = new Map();

/**
 * Bir öğedeki para tutarını sayarak yazar.
 * @param {HTMLElement} oge
 * @param {number} hedef
 * @param {string} [anahtar] aynı sayacı sonraki çizimlerde tanımak için
 */
export function sayarakYaz(oge, hedef, anahtar) {
  const yaz = d => { oge.textContent = para(d) + ' ₺'; };
  const onceki = anahtar ? sonDegerler.get(anahtar) : undefined;
  if (anahtar) sonDegerler.set(anahtar, hedef);

  if (AZALT()) { yaz(hedef); return; }

  /* Aynı sayaç yeniden çizildiyse ve değer değiştiyse: parlasın. */
  const degisti = onceki !== undefined && onceki !== hedef;
  const baslangic = degisti ? onceki : 0;

  const sure = 620;
  const bas = performance.now();
  function adim(simdi) {
    const t = Math.min(1, (simdi - bas) / sure);
    /* Sona doğru yavaşlayan eğri. */
    const e = 1 - Math.pow(1 - t, 3);
    yaz(baslangic + (hedef - baslangic) * e);
    if (t < 1) requestAnimationFrame(adim);
    else if (degisti) parlat(oge);
  }
  requestAnimationFrame(adim);
}

/** Değişen sayıyı bir an vurgu renginde parlatır. */
export function parlat(oge) {
  if (!oge || AZALT()) return;
  oge.classList.remove('parla');
  void oge.offsetWidth;          // sınıfı yeniden tetiklemek için
  oge.classList.add('parla');
  setTimeout(() => oge.classList.remove('parla'), 800);
}

/** Sayaç geçmişini temizler (yedekten geri yükleme gibi durumlarda). */
export function sayaclariUnut() {
  sonDegerler.clear();
}
