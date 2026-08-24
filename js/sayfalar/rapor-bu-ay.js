/* Nizam Soft · Kişisel Bütçe — "Bu Ay N'oldu" Raporu
   Ay başındaki varlıktan ay sonundakine giden yol, madde madde ve tek sütun.
   İlkokul mezununun anlayacağı sadelikte. */

import { simge } from '../simge.js';
import { buAyNoldu, veriOlanAylar, buAy } from '../veri/rapor.js';
import { tabloPdf, tabloExcel } from '../cikti.js';
import { bildir } from '../pencere.js';
import { para, paraSimgeli, ay, kacir } from '../veri/bicim.js';

export default {
  baslik: "Bu Ay N'oldu",
  simge: 'butce',

  async ciz(kap) {
    kap.innerHTML = '<div class="yukleniyor"><div class="yukleniyor-cubuk"></div></div>';

    const gelirAylari = await veriOlanAylar('Gelir');
    const giderAylari = await veriOlanAylar('Gider');
    const aylar = [...new Set([...gelirAylari, ...giderAylari, buAy()])].sort().reverse();
    let donem = aylar[0];

    async function cizRapor() {
      const r = await buAyNoldu(donem);

      const maddeler = [
        { ad: 'Ay başında paran', deger: r.ayBasiVarlik, tur: 'baslangic',
          not: 'Banka + nakit + yatırım − kart borcu' },
        { ad: 'Bu ay giren', deger: r.toplamGelir, tur: 'arti' },
        { ad: 'Bu ay çıkan', deger: r.toplamGider, tur: 'eksi' },
        { ad: 'Yatırımdan kâr/zarar', deger: r.yatirimKarZarar, tur: 'karzarar',
          not: 'Bu ay satılan yatırımlardan' },
        { ad: 'Ay sonunda paran', deger: r.aySonuVarlik, tur: 'sonuc' },
      ];

      kap.innerHTML = `
        <div class="kart kart-serit rapor-tepe ${r.fark >= 0 ? 'gelir' : 'gider'}">
          <div>
            <div class="silik">${r.fark >= 0 ? 'Bu ay kazandın' : 'Bu ay kaybettin'}</div>
            <div class="rapor-toplam">${r.fark >= 0 ? '+' : '−'}${kacir(paraSimgeli(Math.abs(r.fark)))}</div>
          </div>
          <div class="rapor-donem">${kacir(ay(donem))}</div>
        </div>

        <div class="liste-arac">
          <div class="liste-arac-sol"></div>
          <div class="liste-arac-sag">
            <button class="dugme-simge-tek" type="button" id="donem-dugme"
                    aria-label="Dönem seç">${simge('filtre')}</button>
            <button class="dugme-simge-tek" type="button" id="pdf-dugme"
                    aria-label="PDF olarak yazdır">${simge('rapor')}</button>
            <button class="dugme-simge-tek" type="button" id="excel-dugme"
                    aria-label="Excel olarak dışa aktar">${simge('kutu')}</button>
          </div>
        </div>
        <div class="liste-filtre gizli" id="donem-panel">
          <label class="alan">
            <span class="alan-etiket">Dönem</span>
            <select class="alan-giris" id="donem-secim">
              ${aylar.map(a => `<option value="${kacir(a)}" ${a === donem ? 'selected' : ''}>${kacir(ay(a))}</option>`).join('')}
            </select>
          </label>
        </div>

        <ol class="bu-ay-liste">
          ${maddeler.map((m, i) => `
            <li class="kart bu-ay-madde ${m.tur}">
              <div class="bu-ay-sira">${i + 1}</div>
              <div class="bu-ay-govde">
                <div class="bu-ay-ad">${kacir(m.ad)}</div>
                ${m.not ? `<div class="bu-ay-not silik">${kacir(m.not)}</div>` : ''}
              </div>
              <div class="bu-ay-tutar">
                ${m.tur === 'arti' ? '+' : m.tur === 'eksi' ? '−'
                  : m.tur === 'karzarar' ? (m.deger >= 0 ? '+' : '−') : ''}${
                  kacir(paraSimgeli(m.tur === 'karzarar' ? Math.abs(m.deger) : m.deger))}
              </div>
            </li>`).join('')}
        </ol>`;

      const panel = kap.querySelector('#donem-panel');
      kap.querySelector('#donem-dugme').addEventListener('click', () => panel.classList.toggle('gizli'));
      kap.querySelector('#donem-secim').addEventListener('change', olay => {
        donem = olay.target.value;
        cizRapor();
      });

      const satirlar = maddeler.map(m => [m.ad, para(m.deger) + ' ₺']);
      kap.querySelector('#pdf-dugme').addEventListener('click', async () => {
        try {
          await tabloPdf("Bu Ay N'oldu", ay(donem),
            [{ ad: 'Madde' }, { ad: 'Tutar', hizala: 'right', genislik: 110 }], satirlar, donem);
        } catch (h) { bildir(h.message || 'PDF üretilemedi.', 'tehlike'); }
      });
      kap.querySelector('#excel-dugme').addEventListener('click', async () => {
        try { await tabloExcel("Bu Ay Noldu", ['Madde', 'Tutar'],
          maddeler.map(m => [m.ad, m.deger]), donem); }
        catch (h) { bildir(h.message || 'Excel üretilemedi.', 'tehlike'); }
      });
    }

    await cizRapor();
  },
};
