/* Nizam Soft · Kişisel Bütçe — uygulama girişi
   Sıra: açılış ekranı → giriş kapısı (PIN) → kabuk → yönlendirici. */

import { SAYFALAR } from './sayfalar/kayit.js';
import { tanimla, dinle, cozumle, git } from './yonlendirici.js';
import { cizKabuk, kabuguGuncelle } from './kabuk.js';
import { acilisGoster, girisiAc } from './giris.js';
import { hazirVeriYukle } from './veri/hazir.js';
import { SURUM } from './surum.js';

async function baslat() {
  await acilisGoster(async ilerle => {
    ilerle('Uygulama hazırlanıyor…', 40);
    await new Promise(b => setTimeout(b, 200));
    ilerle('Kilit denetleniyor…', 80);
    await new Promise(b => setTimeout(b, 150));
  });

  // Giriş kapısı: PIN kurulmamışsa kurdurur, kurulmuşsa sorar.
  await girisiAc();

  // Anahtar açıldı; ilk kurulumda hazır listeler yüklenir.
  await acilisGoster(async ilerle => {
    ilerle('Veriler alınıyor…', 60);
    await hazirVeriYukle();
    ilerle('Hazırlanıyor…', 95);
  });

  const kok = document.getElementById('uygulama');
  cizKabuk(kok);

  SAYFALAR.forEach(kayit => tanimla(kayit.rota, kayit));

  dinle(async ({ sayfa: kayit, parametre, sorgu }) => {
    const govde = document.getElementById('sayfa-govdesi');
    kabuguGuncelle({
      baslik: kayit.sayfa.baslik,
      kok: kayit.kok,
      geri: kayit.geri,
    });
    govde.innerHTML = '';
    window.scrollTo(0, 0);
    try {
      await kayit.sayfa.ciz(govde, parametre, sorgu);
    } catch (hata) {
      console.error(hata);
      govde.innerHTML = `
        <div class="bos-durum">
          <h3>Bir şeyler ters gitti</h3>
          <p>Bu ekran açılamadı. Tekrar denemek için sayfayı yenile.</p>
          <button class="dugme" type="button" onclick="location.reload()">Tekrar dene</button>
        </div>`;
    }
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
