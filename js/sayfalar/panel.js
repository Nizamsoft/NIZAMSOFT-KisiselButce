/* Nizam Soft · Kişisel Bütçe — Panel ekranı
   Üstte 3'lü sayaç ızgarası, altında tek büyük grafik.
   Grafik geçmişi değil GELECEK 2 AYI gösterir; verisini nakit akıştan çeker. */

import { simge } from '../simge.js';
import { git } from '../yonlendirici.js';
import { paraSimgeli, para, ay, kacir } from '../veri/bicim.js';
import { panelOzeti, gelecekAylar } from '../veri/hesap.js';

function sayac(etiket, deger, rota, serit = '') {
  return `
    <button class="kart kart-serit ${serit} sayac" type="button" data-rota="${rota}">
      <span class="sayac-etiket">${kacir(etiket)}</span>
      <span class="sayac-deger">${kacir(deger)}</span>
    </button>`;
}

function grafik(aylar) {
  const ustDeger = Math.max(1, ...aylar.flatMap(a => [a.gelir, a.gider]));
  return `
    <div class="grafik">
      ${aylar.map(a => `
        <div class="grafik-ay">
          <div class="grafik-cubuklar">
            <div class="grafik-cubuk gelir" style="height:${(a.gelir / ustDeger) * 100}%"
                 title="Gelir ${para(a.gelir)} ₺"></div>
            <div class="grafik-cubuk gider" style="height:${(a.gider / ustDeger) * 100}%"
                 title="Gider ${para(a.gider)} ₺"></div>
          </div>
          <div class="grafik-etiket">${kacir(ay(a.anahtar))}</div>
          <div class="grafik-tutar">
            <span class="arti">+${para(a.gelir)}</span>
            <span class="eksi">−${para(a.gider)}</span>
          </div>
        </div>`).join('')}
    </div>
    <div class="grafik-anahtar">
      <span><i class="nokta gelir"></i>Gelir</span>
      <span><i class="nokta gider"></i>Gider</span>
    </div>`;
}

export default {
  baslik: 'Panel',
  simge: 'panel',
  async ciz(kap) {
    kap.innerHTML = '<div class="yukleniyor"><div class="yukleniyor-cubuk"></div></div>';

    const [ozet, aylar] = await Promise.all([panelOzeti(), gelecekAylar(2)]);

    if (!ozet.hesapSayisi) {
      kap.innerHTML = `
        <div class="bos-durum">
          ${simge('panel', 'simge-40')}
          <h3>Henüz veri yok</h3>
          <p>Bir banka hesabı tanımla ve ilk ekstreni yükle; özet burada oluşacak.</p>
          <button class="dugme" type="button" id="hesap-git">${simge('arti')}<span>Hesap ekle</span></button>
        </div>`;
      kap.querySelector('#hesap-git').addEventListener('click', () => git('/hesaplar?sekme=banka'));
      return;
    }

    kap.innerHTML = `
      ${ozet.butceAsimUyarisi ? `
        <button class="kart kart-serit tehlike uyari-kart" type="button" data-rota="/raporlar/butce">
          ${simge('uyari')}
          <span>
            <b>Bütçe aşıldı</b>
            <span class="silik">Bu ay bir ya da daha çok başlıkta limiti geçtin. Ayrıntı için dokun.</span>
          </span>
        </button>` : ''}

      <div class="sayac-izgara">
        ${sayac('Bankadaki param', paraSimgeli(ozet.bankadakiParam), '/hesaplar?sekme=banka')}
        ${sayac('Yatırımdaki param', paraSimgeli(ozet.yatirimdakiParam), '/hesaplar?sekme=yatirimlar')}
        ${sayac('Bu ay kalan harcanabilir', paraSimgeli(ozet.buAyKalanHarcanabilir), '/raporlar/butce',
                ozet.buAyKalanHarcanabilir < 0 ? 'tehlike' : '')}
      </div>

      ${ozet.kartBorcu > 0 ? `
        <p class="silik panel-not">Kredi kartı borcun: <b>${kacir(paraSimgeli(ozet.kartBorcu))}</b></p>` : ''}

      <div class="kart panel-grafik">
        <div class="panel-grafik-baslik">
          <h3>Gelecek 2 ay</h3>
          <span class="silik">Nakit akışından</span>
        </div>
        ${aylar.some(a => a.gelir || a.gider) ? grafik(aylar) : `
          <div class="bos-durum" style="min-height:150px;padding:24px">
            ${simge('takvim', 'simge-40')}
            <h3>Nakit akışı boş</h3>
            <p>Maaş, kira gibi tekrar eden hareketlerini ekle; gelecek iki ay burada görünsün.</p>
          </div>`}
      </div>

      <button class="dugme dugme-sade panel-alt-dugme" type="button" data-rota="/raporlar/nakit-akis">
        ${simge('takvim')}<span>Nakit akışının tamamını gör</span>
      </button>`;

    kap.querySelectorAll('[data-rota]').forEach(oge => {
      oge.addEventListener('click', () => git(oge.dataset.rota));
    });
  },
};
