/* Nizam Soft · Kişisel Bütçe — yönlendirici
 *
 * Adres çubuğu yerine # kullanılır. Sebep: GitHub Pages projeyi alt klasörden
 * yayınlar ve sunucu tarafında yönlendirme kuralı yazılamaz; # ile bütün
 * yollar tek index.html üstünden çalışır ve yenilemede kırılmaz.
 */

const kaliplar = [];
let dinleyici = null;

/**
 * Rota tanımlar. Kalıpta :ad biçimindeki parçalar parametreye dönüşür.
 * @param {string} kalip '/hesaplar/hareketler/:id' gibi
 * @param {object} sayfa {baslik, ciz}
 */
export function tanimla(kalip, sayfa) {
  const parcalar = kalip.split('/').filter(Boolean);
  kaliplar.push({ kalip, parcalar, sayfa });
}

function esles(yol) {
  const parcalar = yol.split('/').filter(Boolean);
  for (const kayit of kaliplar) {
    if (kayit.parcalar.length !== parcalar.length) continue;
    const parametre = {};
    let uydu = true;
    for (let i = 0; i < parcalar.length; i++) {
      const beklenen = kayit.parcalar[i];
      if (beklenen.startsWith(':')) parametre[beklenen.slice(1)] = decodeURIComponent(parcalar[i]);
      else if (beklenen !== parcalar[i]) { uydu = false; break; }
    }
    if (uydu) return { sayfa: kayit.sayfa, kalip: kayit.kalip, parametre };
  }
  return null;
}

/** Şu anki adresi {yol, sorgu} olarak verir. */
export function suAnki() {
  const ham = location.hash.replace(/^#/, '') || '/panel';
  const [yol, sorguMetni = ''] = ham.split('?');
  const sorgu = {};
  new URLSearchParams(sorguMetni).forEach((deger, ad) => { sorgu[ad] = deger; });
  return { yol, sorgu };
}

/** Sayfaya gider. */
export function git(yol) {
  if (location.hash === '#' + yol) cozumle();
  else location.hash = yol;
}

/** Bir önceki sayfaya döner; geçmiş yoksa Panel'e gider. */
export function geriDon() {
  if (history.length > 1) history.back();
  else git('/panel');
}

export function cozumle() {
  const { yol, sorgu } = suAnki();
  const bulunan = esles(yol);
  if (!bulunan) { git('/panel'); return; }
  if (dinleyici) dinleyici({ ...bulunan, yol, sorgu });
}

/** Her rota değişiminde çağrılacak işlev. */
export function dinle(islev) {
  dinleyici = islev;
  window.addEventListener('hashchange', cozumle);
}
