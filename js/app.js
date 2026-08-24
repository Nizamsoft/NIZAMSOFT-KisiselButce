/* Nizam Soft · Kişisel Bütçe — uygulama girişi
   Sıra: açılış ekranı → giriş kapısı (PIN) → kabuk → yönlendirici. */

import { SAYFALAR } from './sayfalar/kayit.js';
import { tanimla, dinle, cozumle, git } from './yonlendirici.js';
import { cizKabuk, kabuguGuncelle } from './kabuk.js';
import { acilisGoster, girisiAc } from './giris.js';
import { SURUM } from './surum.js';

async function baslat() {
  await acilisGoster(async ilerle => {
    ilerle('Uygulama hazırlanıyor…', 25);
    await new Promise(b => setTimeout(b, 150));
    ilerle('Kilit denetleniyor…', 60);
    await new Promise(b => setTimeout(b, 150));
    ilerle('Veriler alınıyor…', 85);
  });

  // Giriş kapısı: PIN kurulmamışsa kurdurur, kurulmuşsa sorar.
  await girisiAc();

  const kok = document.getElementById('uygulama');
  cizKabuk(kok);

  SAYFALAR.forEach(kayit => tanimla(kayit.rota, kayit));

  dinle(({ sayfa: kayit, parametre, sorgu }) => {
    const govde = document.getElementById('sayfa-govdesi');
    kabuguGuncelle({
      baslik: kayit.sayfa.baslik,
      kok: kayit.kok,
      geri: kayit.geri,
    });
    govde.innerHTML = '';
    kayit.sayfa.ciz(govde, parametre, sorgu);
    govde.scrollTop = 0;
    window.scrollTo(0, 0);
  });

  if (!location.hash) git('/panel');
  else cozumle();
}

/* Servis işçisi: kabuğu önbelleğe alır, sürüm değişince günceller.
   Yol GÖRELİ — GitHub Pages projeyi alt klasörden yayınlıyor. */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      /* Çevrimdışı önbellek kurulamadıysa uygulama yine de çalışır. */
    });
  });
}

console.info('Nizam Soft · Kişisel Bütçe · Sürüm ' + SURUM);
baslat();
