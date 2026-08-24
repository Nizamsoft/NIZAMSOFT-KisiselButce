/* Nizam Soft · Kişisel Bütçe — veritabanı bağlantısı
 *
 * Tek IndexedDB bağlantısı ve tek sürüm numarası burada durur. Hem kilit
 * (PIN sarmaları) hem veri katmanı buradan geçer; iki ayrı yerde açılırsa
 * sürümler çakışır ve uygulama açılmaz.
 */

import { TABLO_ADLARI } from './tablolar.js';

export const VERITABANI = 'nizam-butce';
export const SURUM = 2;
export const KILIT_DEPOSU = 'kilit';

let sozu = null;

export function ac() {
  if (sozu) return sozu;
  sozu = new Promise((tamam, hata) => {
    const istek = indexedDB.open(VERITABANI, SURUM);
    istek.onupgradeneeded = () => {
      const vt = istek.result;
      if (!vt.objectStoreNames.contains(KILIT_DEPOSU)) {
        vt.createObjectStore(KILIT_DEPOSU, { keyPath: 'id' });
      }
      for (const ad of TABLO_ADLARI) {
        if (!vt.objectStoreNames.contains(ad)) vt.createObjectStore(ad, { keyPath: 'id' });
      }
    };
    istek.onsuccess = () => tamam(istek.result);
    istek.onerror = () => { sozu = null; hata(istek.error); };
  });
  return sozu;
}

/** Tek depo üstünde işlem açar; `is(depo)` sonucunu döndürür. */
export function islem(depo, kip, is) {
  return ac().then(vt => new Promise((tamam, hata) => {
    const t = vt.transaction(depo, kip);
    const sonuc = is(t.objectStore(depo));
    /* d.get(...) gibi çağrılar IDBRequest döndürür; asıl değer .result'tadır.
       Kayıt yoksa .result undefined olur — nesnenin kendisi dönerse çağıran
       "kayıt var" sanır. */
    t.oncomplete = () => tamam(sonuc instanceof IDBRequest ? sonuc.result : sonuc);
    t.onerror = () => hata(t.error);
    t.onabort = () => hata(t.error);
  }));
}
