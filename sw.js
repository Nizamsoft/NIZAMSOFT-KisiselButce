/* Nizam Soft · Kişisel Bütçe — servis işçisi
 *
 * Kabuğu önbelleğe alır, sürüm değişince günceller. Bütün yollar GÖRELİ:
 * GitHub Pages projeyi alt klasörden yayınlıyor, kök yol yayında kırılır.
 *
 * Veri önbelleğe alınmaz — veri zaten kullanıcının cihazında, IndexedDB'de
 * şifreli durur. Burada yalnız uygulamanın kendisi (kabuk) tutulur.
 */

const SURUM = '2026.6';
const ONBELLEK = 'nizam-butce-' + SURUM;

const KABUK = [
  './',
  './index.html',
  './manifest.json',
  './icon-512.png',
  './vendor/yazitipi.css',
  './vendor/fonts/inter-latin.woff2',
  './vendor/fonts/inter-latin-ext.woff2',
  './vendor/fonts/manrope-latin.woff2',
  './vendor/fonts/manrope-latin-ext.woff2',
  './css/tema.css',
  './css/temel.css',
  './css/bilesen.css',
  './css/kabuk.css',
  './css/liste.css',
  './css/pencere.css',
  './css/sihirbaz.css',
  './css/rapor.css',
  './css/hareket.css',
  './js/app.js',
  './js/kabuk.js',
  './js/giris.js',
  './js/kilit.js',
  './js/simge.js',
  './js/surum.js',
  './js/yonlendirici.js',
  './js/liste.js',
  './js/form.js',
  './js/pencere.js',
  './js/kayitlar.js',
  './js/vendor.js',
  './js/canli.js',
  './js/erisim.js',
  './js/guncelleme.js',
  './js/yedek.js',
  './js/cikti.js',
  './js/veri/rapor.js',
  './js/sayfalar/rapor-ortak.js',
  './js/veri/ekstre.js',
  './js/veri/db.js',
  './js/veri/vt.js',
  './js/veri/tablolar.js',
  './js/veri/bicim.js',
  './js/veri/hazir.js',
  './js/veri/hesap.js',
  './js/sayfalar/kayit.js',
  './js/sayfalar/panel.js',
  './js/sayfalar/hesaplar.js',
  './js/sayfalar/banka-hareketleri.js',
  './js/sayfalar/ekstre-yukleme.js',
  './js/sayfalar/yatirim-islemleri.js',
  './js/sayfalar/yatirim-araclari.js',
  './js/sayfalar/abonelik-odemeleri.js',
  './js/sayfalar/raporlar.js',
  './js/sayfalar/rapor-gelirler.js',
  './js/sayfalar/rapor-giderler.js',
  './js/sayfalar/rapor-bu-ay.js',
  './js/sayfalar/rapor-nakit-akis.js',
  './js/sayfalar/rapor-butce.js',
  './js/sayfalar/ayarlar.js',
  './js/sayfalar/gelir-basliklari.js',
  './js/sayfalar/gider-basliklari.js',
  './js/sayfalar/basliklar.js',
  './js/sayfalar/rutin-hareketler.js',
];

self.addEventListener('install', olay => {
  /* skipWaiting BURADA çağrılmaz: kullanıcı ekranda bir işin ortasında
     olabilir (ekstre sihirbazı gibi). Yeni sürüm beklemeye alınır, uygulama
     şerit gösterir ve kullanıcı "Şimdi güncelle" deyince devralır. */
  olay.waitUntil(
    caches.open(ONBELLEK).then(onbellek => onbellek.addAll(KABUK))
  );
});

self.addEventListener('message', olay => {
  if (olay.data && olay.data.tur === 'hemen-devral') self.skipWaiting();
});

self.addEventListener('activate', olay => {
  olay.waitUntil(
    caches.keys()
      .then(adlar => Promise.all(
        adlar.filter(ad => ad.startsWith('nizam-butce-') && ad !== ONBELLEK)
             .map(ad => caches.delete(ad))
      ))
      .then(() => self.clients.claim())
  );
});

/* vendor/js altındaki büyük paketler (xlsx, pdfmake) KABUK listesinde yoktur:
   toplam 3 MB, ilk açılışı yavaşlatır. İlk kullanıldıklarında aşağıdaki
   fetch işleyicisi onları önbelleğe alır, sonraki seferler çevrimdışı çalışır. */

self.addEventListener('fetch', olay => {
  const istek = olay.request;
  if (istek.method !== 'GET') return;
  if (new URL(istek.url).origin !== self.location.origin) return;

  /* Gezinme isteği: ağ önce, olmazsa önbellekteki kabuk.
     Böylece yeni sürüm çıkınca kullanıcı eski kabukta kalmaz. */
  if (istek.mode === 'navigate') {
    olay.respondWith(
      fetch(istek).catch(() => caches.match('./index.html'))
    );
    return;
  }

  /* Diğer dosyalar: önbellek önce, yoksa ağdan al ve önbelleğe koy. */
  olay.respondWith(
    caches.match(istek).then(bulunan => bulunan || fetch(istek).then(cevap => {
      if (cevap.ok) {
        const kopya = cevap.clone();
        caches.open(ONBELLEK).then(onbellek => onbellek.put(istek, kopya));
      }
      return cevap;
    }))
  );
});
