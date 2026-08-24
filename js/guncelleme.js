/* Nizam Soft · Kişisel Bütçe — güncelleme akışı
 *
 * Servis işçisi yeni bir sürüm bulduğunda kullanıcıya şerit gösterilir.
 * Kullanıcı basmadan güncelleme yapılmaz: ekranda yarım kalmış bir iş
 * (ekstre sihirbazı gibi) olabilir.
 */

import { simge } from './simge.js';
import { SURUM } from './surum.js';

let seritVar = false;

function seritGoster(yenile) {
  if (seritVar) return;
  seritVar = true;

  const serit = document.createElement('div');
  serit.className = 'surum-serit';
  serit.setAttribute('role', 'status');
  serit.innerHTML = `
    ${simge('onay')}
    <span>Yeni sürüm hazır.</span>
    <button type="button" data-sonra>Sonra</button>
    <button type="button" data-simdi>Şimdi güncelle</button>`;

  serit.querySelector('[data-sonra]').addEventListener('click', () => {
    serit.remove();
    seritVar = false;
  });
  serit.querySelector('[data-simdi]').addEventListener('click', () => {
    serit.querySelector('[data-simdi]').textContent = 'Güncelleniyor…';
    yenile();
  });

  document.body.append(serit);
}

/** Servis işçisini kurar ve yeni sürüm çıkınca şerit gösterir. */
export function guncellemeyiIzle() {
  if (!('serviceWorker' in navigator)) return;

  navigator.serviceWorker.register('./sw.js').then(kayit => {
    /* Kurulumu bekleyen bir sürüm zaten varsa hemen bildir. */
    if (kayit.waiting) seritGoster(() => beklemeyiBitir(kayit));

    kayit.addEventListener('updatefound', () => {
      const yeni = kayit.installing;
      if (!yeni) return;
      yeni.addEventListener('statechange', () => {
        /* controller varsa bu bir güncellemedir, ilk kurulum değil. */
        if (yeni.state === 'installed' && navigator.serviceWorker.controller) {
          seritGoster(() => beklemeyiBitir(kayit));
        }
      });
    });

    /* Uygulama açıkken saatte bir yeni sürüm var mı diye bakılır. */
    setInterval(() => kayit.update().catch(() => {}), 60 * 60 * 1000);
  }).catch(() => {
    /* Çevrimdışı önbellek kurulamadıysa uygulama yine de çalışır. */
  });

  let yenilendi = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (yenilendi) return;
    yenilendi = true;
    location.reload();
  });
}

function beklemeyiBitir(kayit) {
  if (kayit.waiting) kayit.waiting.postMessage({ tur: 'hemen-devral' });
  else location.reload();
}

/** Ayarlardaki "Uygulamayı güncelle" düğmesi: her şeyi tazeler. */
export async function zorlaGuncelle() {
  try {
    const kayit = await navigator.serviceWorker?.getRegistration();
    if (kayit) { await kayit.update(); await kayit.unregister(); }
    if (window.caches) {
      const adlar = await caches.keys();
      await Promise.all(adlar.map(a => caches.delete(a)));
    }
  } catch { /* önbellek temizlenemese de yeniden yükleme yeni sürümü getirir */ }
  location.reload();
}

export { SURUM };
