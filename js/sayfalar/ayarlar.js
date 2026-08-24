/* Nizam Soft · Kişisel Bütçe — Ayarlar ekranı
   Tepede ayar araması, altında gruplu liste.
   Aşama 1: gezinme ve sürüm etiketi çalışır; yedek ve değişiklik kaydı
   Aşama 4'te doldurulur. */

import { simge } from '../simge.js';
import { git } from '../yonlendirici.js';
import { SURUM } from '../surum.js';

const GRUPLAR = [
  {
    ad: 'Tanımlar',
    satirlar: [
      { rota: '/ayarlar/gelir-basliklari',  ad: 'Gelir Başlıkları',       simge: 'gelir',   not: 'Maaş, kira geliri…' },
      { rota: '/ayarlar/gider-basliklari',  ad: 'Gider Başlıkları',       simge: 'gider',   not: 'Market, kira, aylık limitler' },
      { rota: '/hesaplar?sekme=banka',      ad: 'Hesap ve Kart Tanımları', simge: 'banka',  not: 'Banka, nakit, kredi kartı' },
      { rota: '/ayarlar/yatirim-araclari',  ad: 'Yatırım Araçları',       simge: 'yatirim', not: 'Altın, döviz, hisse ve güncel fiyatlar' },
      { rota: '/ayarlar/rutin-hareketler',  ad: 'Rutin Hareketler',       simge: 'takvim',  not: 'Tekrar eden gelir ve giderler' },
      { rota: '/hesaplar?sekme=abonelikler', ad: 'Abonelikler',           simge: 'abonelik', not: 'Netflix, spor salonu…' },
      { rota: '/raporlar/butce',            ad: 'Bütçe Limitleri',        simge: 'butce',   not: 'Başlık başlık aylık limit' },
    ],
  },
  {
    ad: 'Güvenlik',
    satirlar: [
      { rota: null, ad: 'PIN Değiştir',            simge: 'kilit', not: '6 haneli giriş PIN’i', bekliyor: true },
      { rota: null, ad: 'Kurtarma Cevabını Değiştir', simge: 'kisi', not: 'İlk Evcil Hayvanının adı', bekliyor: true },
    ],
  },
  {
    ad: 'Veri',
    satirlar: [
      { rota: null, ad: 'Yedek Al (JSON)',      simge: 'yukle', not: 'Bütün veri tek dosyaya', bekliyor: true },
      { rota: null, ad: 'Yedekten Geri Yükle',  simge: 'yukle', not: 'Mevcut veriyi değiştirir', bekliyor: true },
      { rota: null, ad: 'Değişiklik Kaydı',     simge: 'rapor', not: 'Ne, ne zaman değişti', bekliyor: true },
    ],
  },
  {
    ad: 'Uygulama',
    satirlar: [
      { rota: null, ad: 'Uygulamayı Güncelle', simge: 'onay', not: 'Sürüm ' + SURUM, bekliyor: true },
    ],
  },
];

export default {
  baslik: 'Ayarlar',
  simge: 'ayarlar',
  ciz(kap) {
    kap.innerHTML = `
      <div class="alan arama">
        ${simge('ara', 'simge-16')}
        <input class="alan-giris" type="search" id="ayar-arama"
               placeholder="Ayarlarda ara…" autocomplete="off"
               aria-label="Ayarlarda ara">
      </div>
      <div id="ayar-gruplar"></div>
      <p class="silik" style="text-align:center;margin-top:20px;font-size:12px">
        ${'Nizam Soft · Kişisel Bütçe'} · Sürüm ${SURUM}
      </p>`;

    const kutu = kap.querySelector('#ayar-gruplar');
    const arama = kap.querySelector('#ayar-arama');

    function cizGruplar(sorgu = '') {
      const s = sorgu.trim().toLocaleLowerCase('tr');
      const gorunen = GRUPLAR
        .map(g => ({ ...g, satirlar: g.satirlar.filter(r =>
          !s || (r.ad + ' ' + r.not).toLocaleLowerCase('tr').includes(s)) }))
        .filter(g => g.satirlar.length);

      if (!gorunen.length) {
        kutu.innerHTML = `
          <div class="bos-durum">
            ${simge('ayarlar', 'simge-40')}
            <h3>Sonuç yok</h3>
            <p>Aradığın ayar bulunamadı. Başka bir kelime dene.</p>
          </div>`;
        return;
      }

      kutu.innerHTML = gorunen.map(g => `
        <div class="liste-baslik">${g.ad}</div>
        <div class="liste liste-kutu">
          ${g.satirlar.map(r => `
            <button class="liste-satir" type="button"
                    ${r.rota ? `data-rota="${r.rota}"` : 'disabled'}>
              ${simge(r.simge)}
              <span class="liste-satir-govde">
                <span class="liste-satir-ad">${r.ad}</span>
                <span class="liste-satir-not">${r.not}</span>
              </span>
            </button>`).join('')}
        </div>`).join('');

      kutu.querySelectorAll('[data-rota]').forEach(satir => {
        satir.addEventListener('click', () => git(satir.dataset.rota));
      });
    }

    cizGruplar();
    arama.addEventListener('input', () => cizGruplar(arama.value));
  },
};
