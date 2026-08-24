/* Nizam Soft · Kişisel Bütçe — Nakit Akış Raporu
   İleriye dönük 6 AY. Satırlar üç kaynaktan gelir: Rutin Hareketler, aktif
   Abonelikler ve kredi kartlarının son ödeme günleri. Beklenen tarih gelip
   banka hareketiyle eşleşince satır "Gerçekleşti" olur ve tahmini tutar
   gerçekleşen tutara döner. */

import { simge } from '../simge.js';
import { nakitAkis } from '../veri/hesap.js';
import { git } from '../yonlendirici.js';
import { rutinDuzenle } from '../kayitlar.js';
import { tabloPdf, tabloExcel } from '../cikti.js';
import { bildir } from '../pencere.js';
import { para, paraSimgeli, tarih, ay, kacir } from '../veri/bicim.js';

const KAYNAK_SIMGESI = {
  'Rutin Hareket': 'takvim',
  'Abonelik': 'abonelik',
  'Kredi Kartı Ödemesi': 'kart',
};

export default {
  baslik: 'Nakit Akış',
  simge: 'takvim',

  async ciz(kap) {
    kap.innerHTML = '<div class="yukleniyor"><div class="yukleniyor-cubuk"></div></div>';
    const yenile = () => this.ciz(kap);
    const satirlar = await nakitAkis(6);

    if (!satirlar.length) {
      kap.innerHTML = `
        <div class="bos-durum">
          ${simge('takvim', 'simge-40')}
          <h3>Rutin hareket yok</h3>
          <p>Maaş, kira gibi tekrar eden gelir ve giderlerini ekle; önümüzdeki 6 ay
             burada görünsün. Abonelikler ve kredi kartı son ödeme günleri
             kendiliğinden buraya akar.</p>
          <button class="dugme" type="button" id="rutin-ekle">${simge('arti')}<span>Rutin ekle</span></button>
        </div>`;
      kap.querySelector('#rutin-ekle').addEventListener('click', () => rutinDuzenle(null, yenile));
      return;
    }

    /* Ay ay kümelenir. */
    const aylar = new Map();
    for (const s of satirlar) {
      const a = s.tarih.slice(0, 7);
      if (!aylar.has(a)) aylar.set(a, []);
      aylar.get(a).push(s);
    }

    const sonBakiye = satirlar[satirlar.length - 1].tahminiBakiye;
    const enDusuk = Math.min(...satirlar.map(s => s.tahminiBakiye));
    const enDusukSatir = satirlar.find(s => s.tahminiBakiye === enDusuk);

    kap.innerHTML = `
      <div class="kart kart-serit rapor-tepe ${sonBakiye < 0 ? 'gider' : 'gelir'}">
        <div>
          <div class="silik">6 ay sonra tahmini paran</div>
          <div class="rapor-toplam">${kacir(paraSimgeli(sonBakiye))}</div>
        </div>
      </div>

      ${enDusuk < 0 ? `
        <div class="kart kart-serit tehlike uyari-kart">
          ${simge('uyari')}
          <span><b>Para eksiye düşüyor</b>
          <span class="silik">${kacir(tarih(enDusukSatir.tarih))} günü bakiyen
          ${kacir(paraSimgeli(enDusuk))} oluyor.</span></span>
        </div>` : ''}

      <div class="liste-arac">
        <div class="liste-arac-sol">${satirlar.length} beklenen hareket</div>
        <div class="liste-arac-sag">
          <button class="dugme-simge-tek" type="button" id="rutin-git"
                  aria-label="Rutin ekle">${simge('arti')}</button>
          <button class="dugme-simge-tek" type="button" id="pdf-dugme"
                  aria-label="PDF olarak yazdır">${simge('rapor')}</button>
          <button class="dugme-simge-tek" type="button" id="excel-dugme"
                  aria-label="Excel olarak dışa aktar">${simge('kutu')}</button>
        </div>
      </div>

      ${[...aylar.entries()].map(([a, liste]) => {
        const gelir = liste.filter(s => s.yon === 'Gelir')
          .reduce((t, s) => t + (s.gerceklesenTutar ?? s.tahminiTutar), 0);
        const gider = liste.filter(s => s.yon === 'Gider')
          .reduce((t, s) => t + (s.gerceklesenTutar ?? s.tahminiTutar), 0);
        return `
        <div class="liste-baslik akis-ay">
          <span>${kacir(ay(a))}</span>
          <span class="akis-ay-ozet">
            <span class="arti">+${kacir(para(gelir))}</span>
            <span class="eksi">−${kacir(para(gider))}</span>
          </span>
        </div>
        <ul class="kart-liste">
          ${liste.map(s => `
            <li class="kart-satir akis-satir ${s.durum === 'Gerçekleşti' ? 'gerceklesti' : ''}">
              <span class="hesap-simge">${simge(KAYNAK_SIMGESI[s.kaynak] || 'takvim')}</span>
              <div class="kart-satir-govde">
                <div class="kart-satir-ust">${kacir(s.adi)}</div>
                <div class="kart-satir-alt">
                  ${kacir(tarih(s.tarih))} · ${kacir(s.kaynak)}
                  ${s.durum === 'Gerçekleşti'
                    ? ' · <b class="gerceklesti-etiket">gerçekleşti</b>' : ' · tahmini'}
                </div>
              </div>
              <div class="kart-satir-sag">
                <span class="${s.yon === 'Gelir' ? 'arti' : 'eksi'}">
                  ${s.yon === 'Gelir' ? '+' : '−'}${kacir(para(s.gerceklesenTutar ?? s.tahminiTutar))}
                </span>
                <span class="silik akis-bakiye ${s.tahminiBakiye < 0 ? 'eksi' : ''}">
                  ${kacir(para(s.tahminiBakiye))}</span>
              </div>
            </li>`).join('')}
        </ul>`;
      }).join('')}`;

    kap.querySelector('#rutin-git').addEventListener('click', () => rutinDuzenle(null, yenile));

    const disaVeri = satirlar.map(s => [
      tarih(s.tarih), s.adi, s.kaynak, s.yon,
      para(s.gerceklesenTutar ?? s.tahminiTutar) + ' ₺',
      s.durum, para(s.tahminiBakiye) + ' ₺',
    ]);
    kap.querySelector('#pdf-dugme').addEventListener('click', async () => {
      try {
        await tabloPdf('Nakit Akış Raporu', 'Önümüzdeki 6 ay', [
          { ad: 'Tarih', genislik: 56 }, { ad: 'Adı' }, { ad: 'Kaynak', genislik: 82 },
          { ad: 'Yön', genislik: 40 }, { ad: 'Tutar', hizala: 'right', genislik: 72 },
          { ad: 'Durum', genislik: 60 }, { ad: 'Bakiye', hizala: 'right', genislik: 76 },
        ], disaVeri, '6ay');
      } catch (h) { bildir(h.message || 'PDF üretilemedi.', 'tehlike'); }
    });
    kap.querySelector('#excel-dugme').addEventListener('click', async () => {
      try {
        await tabloExcel('Nakit Akış', ['Tarih', 'Adı', 'Kaynak', 'Yön', 'Tutar', 'Durum', 'Tahmini bakiye'],
          satirlar.map(s => [s.tarih, s.adi, s.kaynak, s.yon,
            s.gerceklesenTutar ?? s.tahminiTutar, s.durum, s.tahminiBakiye]), '6ay');
      } catch (h) { bildir(h.message || 'Excel üretilemedi.', 'tehlike'); }
    });
  },
};
