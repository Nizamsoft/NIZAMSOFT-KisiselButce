/* Nizam Soft · Kişisel Bütçe — Bütçe Planlama Raporu
   Limit yalnız ANA gider başlıklarına girilir; alt başlıkların harcamaları
   ana başlığın limitine sayılır. Limiti aşan satır kırmızı gösterilir. */

import { simge } from '../simge.js';
import { butceDurumu } from '../veri/hesap.js';
import { git, cozumle } from '../yonlendirici.js';
import { baslikDuzenle } from '../kayitlar.js';
import { tabloPdf, tabloExcel } from '../cikti.js';
import { bildir } from '../pencere.js';
import { para, paraSimgeli, ay, kacir } from '../veri/bicim.js';

export default {
  baslik: 'Bütçe Planlama',
  simge: 'butce',

  async ciz(kap) {
    kap.innerHTML = '<div class="yukleniyor"><div class="yukleniyor-cubuk"></div></div>';
    const yenile = () => this.ciz(kap);
    const b = await butceDurumu();

    const limitliler = b.satirlar.filter(s => s.aylikLimit > 0)
      .sort((x, y) => y.doluluk - x.doluluk);
    const limitsizler = b.satirlar.filter(s => !s.aylikLimit)
      .sort((x, y) => y.harcanan - x.harcanan);

    if (!limitliler.length) {
      kap.innerHTML = `
        <div class="bos-durum">
          ${simge('butce', 'simge-40')}
          <h3>Limit girilmemiş</h3>
          <p>Gider başlıklarına aylık limit koy; ne kadarını harcadığın burada görünsün.
             Limit bir kez girilir, her ay kendiliğinden geçerli olur.</p>
          <button class="dugme" type="button" id="limit-gir">${simge('arti')}<span>Limit gir</span></button>
        </div>`;
      kap.querySelector('#limit-gir').addEventListener('click', () => git('/ayarlar/gider-basliklari'));
      return;
    }

    function cubuk(s) {
      const yuzde = Math.min(100, s.doluluk);
      const renk = s.limitAsildi ? 'asildi' : s.doluluk >= 80 ? 'yaklasti' : '';
      return `<div class="butce-cubuk ${renk}"><div style="width:${yuzde}%"></div></div>`;
    }

    kap.innerHTML = `
      <div class="kart kart-serit rapor-tepe ${b.toplamKalan < 0 ? 'gider' : 'gelir'}">
        <div>
          <div class="silik">Bu ay kalan</div>
          <div class="rapor-toplam">${kacir(paraSimgeli(b.toplamKalan))}</div>
          <div class="silik butce-alt">
            ${kacir(paraSimgeli(b.toplamHarcanan))} / ${kacir(paraSimgeli(b.toplamLimit))} harcandı
          </div>
        </div>
        <div class="rapor-donem">${kacir(ay(b.donem))}</div>
      </div>

      <div class="liste-arac">
        <div class="liste-arac-sol">${limitliler.length} başlıkta limit var</div>
        <div class="liste-arac-sag">
          <button class="dugme-simge-tek" type="button" id="pdf-dugme"
                  aria-label="PDF olarak yazdır">${simge('rapor')}</button>
          <button class="dugme-simge-tek" type="button" id="excel-dugme"
                  aria-label="Excel olarak dışa aktar">${simge('kutu')}</button>
        </div>
      </div>

      <ul class="kart-liste">
        ${limitliler.map(s => `
          <li class="kart-satir butce-satir ${s.limitAsildi ? 'asildi' : ''}"
              data-baslik="${kacir(s.id)}" tabindex="0">
            <div class="kart-satir-govde">
              <div class="kart-satir-ust">${kacir(s.baslikAdi)}</div>
              ${cubuk(s)}
              <div class="kart-satir-alt">
                ${kacir(para(s.harcanan))} / ${kacir(para(s.aylikLimit))} ₺ · %${s.doluluk}
                ${s.limitAsildi ? ' · <b>aşıldı</b>' : ''}
              </div>
            </div>
            <div class="kart-satir-sag ${s.kalan < 0 ? 'eksi' : ''}">
              ${kacir(paraSimgeli(s.kalan))}
              <span class="silik butce-kalan-not">${s.kalan < 0 ? 'aşım' : 'kalan'}</span>
            </div>
          </li>`).join('')}
      </ul>

      ${limitsizler.some(s => s.harcanan > 0) ? `
        <div class="liste-baslik">Limit konmamış başlıklar</div>
        <ul class="kart-liste">
          ${limitsizler.filter(s => s.harcanan > 0).map(s => `
            <li class="kart-satir" data-baslik="${kacir(s.id)}" tabindex="0">
              <div class="kart-satir-govde">
                <div class="kart-satir-ust">${kacir(s.baslikAdi)}</div>
                <div class="kart-satir-alt">Limit yok · dokunup ekleyebilirsin</div>
              </div>
              <div class="kart-satir-sag">${kacir(paraSimgeli(s.harcanan))}</div>
            </li>`).join('')}
        </ul>` : ''}`;

    kap.querySelectorAll('[data-baslik]').forEach(oge => {
      oge.addEventListener('click', () =>
        baslikDuzenle('giderBasliklari', oge.dataset.baslik, yenile));
    });

    const satirlar = limitliler.map(s => [s.baslikAdi, para(s.aylikLimit) + ' ₺',
      para(s.harcanan) + ' ₺', para(s.kalan) + ' ₺', '%' + s.doluluk]);
    kap.querySelector('#pdf-dugme').addEventListener('click', async () => {
      try {
        await tabloPdf('Bütçe Planlama', ay(b.donem), [
          { ad: 'Gider başlığı' }, { ad: 'Limit', hizala: 'right', genislik: 80 },
          { ad: 'Harcanan', hizala: 'right', genislik: 80 },
          { ad: 'Kalan', hizala: 'right', genislik: 80 },
          { ad: 'Doluluk', hizala: 'right', genislik: 52 },
        ], satirlar, b.donem);
      } catch (h) { bildir(h.message || 'PDF üretilemedi.', 'tehlike'); }
    });
    kap.querySelector('#excel-dugme').addEventListener('click', async () => {
      try {
        await tabloExcel('Bütçe Planlama', ['Gider başlığı', 'Limit', 'Harcanan', 'Kalan', 'Doluluk %'],
          limitliler.map(s => [s.baslikAdi, s.aylikLimit, s.harcanan, s.kalan, s.doluluk]), b.donem);
      } catch (h) { bildir(h.message || 'Excel üretilemedi.', 'tehlike'); }
    });
  },
};
