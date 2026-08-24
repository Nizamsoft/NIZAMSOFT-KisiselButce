/* Nizam Soft · Kişisel Bütçe — gelir/gider raporlarının ortak gövdesi
   İki rapor da aynı kalıptır: dönem seçimi filtre panelinde, başlık başlık
   toplam, ana başlığa dokununca altları, alt başlığa dokununca hareketler. */

import { simge } from '../simge.js';
import { basliklaRapor, veriOlanAylar, buAy } from '../veri/rapor.js';
import { hareketDetay } from '../kayitlar.js';
import { cozumle } from '../yonlendirici.js';
import { raporPdf, raporExcel } from '../cikti.js';
import { bildir } from '../pencere.js';
import { para, paraSimgeli, tarih, ay, kacir } from '../veri/bicim.js';

export function basliklaRaporSayfasi(yon) {
  const gelirMi = yon === 'Gelir';

  return async function ciz(kap) {
    kap.innerHTML = '<div class="yukleniyor"><div class="yukleniyor-cubuk"></div></div>';

    const aylar = await veriOlanAylar(yon);
    let donem = kap.dataset.donem || aylar[0] || buAy();
    const acik = new Set();

    async function cizRapor() {
      kap.dataset.donem = donem;
      const r = await basliklaRapor(yon, donem);

      /* Seçim vurgusu: bir başlık açıkken ötekiler soluklaşır, odak
         seçilene toplanır. Hiçbiri açık değilse hepsi normal görünür. */
      const secimVar = [...acik].some(a => !a.includes('/'));

      const satirlarHtml = r.satirlar.map(s => {
        const acikMi = acik.has(s.id);
        return `
        <li class="rapor-dal ${acikMi ? 'secili' : ''}">
          <div class="kart-satir rapor-ana ${acikMi ? 'agac-acik' : ''} ${s.limitAsildi ? 'asildi' : ''}"
               data-ana="${kacir(s.id)}" tabindex="0" aria-expanded="${acikMi}">
            <span class="agac-ok">${simge('sagOk', 'simge-16')}</span>
            <div class="kart-satir-govde">
              <div class="kart-satir-ust ${s.basliksiz ? 'silik' : ''}">${kacir(s.baslikAdi)}</div>
              <div class="kart-satir-alt">
                ${s.hareketSayisi} hareket
                ${s.aylikLimit ? ' · limit ' + kacir(paraSimgeli(s.aylikLimit)) : ''}
                ${s.limitAsildi ? ' · <b>aşıldı</b>' : ''}
              </div>
            </div>
            <div class="kart-satir-sag ${s.limitAsildi ? 'eksi' : ''}">${kacir(paraSimgeli(s.tutar))}</div>
          </div>
          <ul class="agac-alt ${acikMi ? 'acik' : ''}">
            ${s.altlar.map(a => {
              const altAcik = acik.has(s.id + '/' + a.id);
              return `
              <li>
                <div class="kart-satir agac-girinti rapor-alt ${altAcik ? 'agac-acik' : ''}"
                     data-alt="${kacir(s.id + '/' + a.id)}" tabindex="0" aria-expanded="${altAcik}">
                  <span class="agac-ok">${simge('sagOk', 'simge-16')}</span>
                  <div class="kart-satir-govde">
                    <div class="kart-satir-ust alt-baslik">${kacir(a.baslikAdi)}</div>
                  </div>
                  <div class="kart-satir-sag">${kacir(paraSimgeli(a.tutar))}</div>
                </div>
                <ul class="agac-alt ${altAcik ? 'acik' : ''}">
                  ${a.hareketler.map(h => `
                    <li class="kart-satir rapor-hareket" data-hareket="${kacir(h.id)}" tabindex="0">
                      <div class="kart-satir-govde">
                        <div class="kart-satir-ust">${kacir(h.aciklama)}</div>
                        <div class="kart-satir-alt">${kacir(tarih(h.tarih))}</div>
                      </div>
                      <div class="kart-satir-sag">${kacir(para(h.tutar))}</div>
                    </li>`).join('')}
                </ul>
              </li>`;
            }).join('')}
          </ul>
        </li>`;
      }).join('');

      /* Giderler raporunda en altta ayrıca kredi kartı harcamaları satırı durur. */
      const kartAcik = acik.has('__kart__');
      const kartHtml = (!gelirMi && r.kartHarcamalari.length) ? `
        <li class="rapor-dal kart-dal ${kartAcik ? 'secili' : ''}">
          <div class="kart-satir rapor-ana ${kartAcik ? 'agac-acik' : ''}"
               data-ana="__kart__" tabindex="0" aria-expanded="${kartAcik}">
            <span class="agac-ok">${simge('sagOk', 'simge-16')}</span>
            <div class="kart-satir-govde">
              <div class="kart-satir-ust">Kredi Kartı Harcamaları</div>
              <div class="kart-satir-alt">${r.kartHarcamalari.length} hareket ·
                başlıklarının içinde de sayılır</div>
            </div>
            <div class="kart-satir-sag">${kacir(paraSimgeli(r.kartToplami))}</div>
          </div>
          <ul class="agac-alt ${kartAcik ? 'acik' : ''}">
            ${r.kartHarcamalari.map(h => `
              <li class="kart-satir rapor-hareket agac-girinti" data-hareket="${kacir(h.id)}" tabindex="0">
                <div class="kart-satir-govde">
                  <div class="kart-satir-ust">${kacir(h.aciklama)}</div>
                  <div class="kart-satir-alt">${kacir(tarih(h.tarih))}</div>
                </div>
                <div class="kart-satir-sag">${kacir(para(h.tutar))}</div>
              </li>`).join('')}
          </ul>
        </li>` : '';

      kap.innerHTML = `
        <div class="kart kart-serit rapor-tepe ${gelirMi ? 'gelir' : 'gider'}">
          <div>
            <div class="silik">${gelirMi ? 'Toplam gelir' : 'Toplam gider'}</div>
            <div class="rapor-toplam">${kacir(paraSimgeli(r.toplam))}</div>
          </div>
          <div class="rapor-donem">${kacir(ay(donem))}</div>
        </div>

        <div class="liste-arac">
          <div class="liste-arac-sol">${r.satirlar.length} başlık</div>
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
              ${(aylar.length ? aylar : [donem]).map(a => `
                <option value="${kacir(a)}" ${a === donem ? 'selected' : ''}>${kacir(ay(a))}</option>`).join('')}
            </select>
          </label>
        </div>

        ${r.satirlar.length ? `
          <ul class="kart-liste rapor-liste ${secimVar ? 'secim-var' : ''}">${satirlarHtml}${kartHtml}</ul>` : `
          <div class="bos-durum">
            ${simge(gelirMi ? 'gelir' : 'gider', 'simge-40')}
            <h3>${gelirMi ? 'Gelir kaydı yok' : 'Gider kaydı yok'}</h3>
            <p>${kacir(ay(donem))} ayında ${gelirMi ? 'gelir' : 'gider'} hareketi bulunamadı.
               Başka bir dönem seçebilirsin.</p>
          </div>`}`;

      /* dönem */
      const panel = kap.querySelector('#donem-panel');
      kap.querySelector('#donem-dugme').addEventListener('click', () => panel.classList.toggle('gizli'));
      kap.querySelector('#donem-secim')?.addEventListener('change', olay => {
        donem = olay.target.value;
        acik.clear();
        cizRapor();
      });

      /* çıktılar */
      kap.querySelector('#pdf-dugme').addEventListener('click', async () => {
        try { await raporPdf(gelirMi ? 'Gelirler Raporu' : 'Giderler Raporu', donem, r, gelirMi); }
        catch (h) { bildir(h.message || 'PDF üretilemedi.', 'tehlike'); }
      });
      kap.querySelector('#excel-dugme').addEventListener('click', async () => {
        try { await raporExcel(gelirMi ? 'Gelirler' : 'Giderler', donem, r); }
        catch (h) { bildir(h.message || 'Excel üretilemedi.', 'tehlike'); }
      });

      /* açılıp kapanma */
      /* Hem dokunma hem klavye: Enter ve Boşluk da açar. */
      function bagla(secici, islev) {
        kap.querySelectorAll(secici).forEach(oge => {
          oge.setAttribute('role', 'button');
          const calistir = olay => { olay.stopPropagation(); islev(oge); };
          oge.addEventListener('click', calistir);
          oge.addEventListener('keydown', olay => {
            if (olay.key === 'Enter' || olay.key === ' ') { olay.preventDefault(); calistir(olay); }
          });
        });
      }
      const cevir = (kume, id) => { if (kume.has(id)) kume.delete(id); else kume.add(id); cizRapor(); };
      bagla('[data-ana]', oge => cevir(acik, oge.dataset.ana));
      bagla('[data-alt]', oge => cevir(acik, oge.dataset.alt));
      bagla('[data-hareket]', oge => hareketDetay(oge.dataset.hareket, () => cozumle()));
    }

    await cizRapor();
  };
}
