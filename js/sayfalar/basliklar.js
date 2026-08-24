/* Nizam Soft · Kişisel Bütçe — başlık ağacı (gelir ve gider ortak)
   İki kat: ana başlık ve alt başlık. Kod kullanılmaz.
   Açılışta yalnız ana başlıklar görünür; dokununca altları açılır. */

import { simge } from '../simge.js';
import * as vt from '../veri/vt.js';
import { paraSimgeli, sadelestir, karsilastir, kacir } from '../veri/bicim.js';

/**
 * @param {'gelirBasliklari'|'giderBasliklari'} tablo
 * @param {boolean} limitli Gider başlıklarında aylık bütçe limiti gösterilir.
 */
export function basliklarSayfasi(tablo, limitli) {
  return async function ciz(kap) {
    kap.innerHTML = '<div class="yukleniyor"><div class="yukleniyor-cubuk"></div></div>';
    const kayitlar = await vt.hepsi(tablo);
    const acik = new Set();
    let arama = '';

    kap.innerHTML = `
      <div class="alan arama">
        ${simge('ara', 'simge-16')}
        <input class="alan-giris" type="search" id="baslik-arama"
               placeholder="Başlıkta ara…" autocomplete="off" aria-label="Başlıkta ara">
      </div>
      <div id="baslik-govde"></div>`;

    const govde = kap.querySelector('#baslik-govde');
    const aramaGiris = kap.querySelector('#baslik-arama');
    aramaGiris.addEventListener('input', () => { arama = aramaGiris.value; cizAgac(); });

    function cizAgac() {
      const q = sadelestir(arama);
      const aktifler = kayitlar.filter(k => k.durum !== 'Pasif');
      const analar = aktifler.filter(k => !k.ustBaslik)
        .sort((a, b) => karsilastir(a.baslikAdi, b.baslikAdi));

      const dallar = analar.map(ana => {
        const altlar = aktifler.filter(k => k.ustBaslik === ana.id)
          .sort((a, b) => karsilastir(a.baslikAdi, b.baslikAdi));
        const anaUyar = !q || sadelestir(ana.baslikAdi).includes(q);
        const uyanAltlar = q ? altlar.filter(a => sadelestir(a.baslikAdi).includes(q)) : altlar;
        return { ana, altlar, gorunen: anaUyar ? altlar : uyanAltlar, uyar: anaUyar || uyanAltlar.length };
      }).filter(d => d.uyar);

      if (!dallar.length) {
        govde.innerHTML = `
          <div class="bos-durum">
            ${simge(limitli ? 'gider' : 'gelir', 'simge-40')}
            <h3>${arama ? 'Sonuç yok' : 'Başlık yok'}</h3>
            <p>${arama
              ? 'Aradığın başlık bulunamadı. Başka bir kelime dene.'
              : 'Kurulumda hazır başlıklar yüklenir; buradan ekleyip çıkarabilirsin.'}</p>
          </div>`;
        return;
      }

      govde.innerHTML = `
        <div class="liste-arac"><div class="liste-arac-sol">
          ${dallar.length} ana başlık · ${dallar.reduce((t, d) => t + d.altlar.length, 0)} alt başlık
        </div></div>
        <ul class="kart-liste">
          ${dallar.map(d => {
            const acikMi = acik.has(d.ana.id) || Boolean(q);
            return `
            <li>
              <div class="kart-satir agac-ana ${acikMi ? 'agac-acik' : ''}"
                   data-ana="${kacir(d.ana.id)}" tabindex="0"
                   aria-expanded="${acikMi}">
                <span class="agac-ok">${d.altlar.length ? simge('sagOk', 'simge-16') : ''}</span>
                <div class="kart-satir-govde">
                  <div class="kart-satir-ust">${kacir(d.ana.baslikAdi)}</div>
                  <div class="kart-satir-alt">
                    ${d.altlar.length ? d.altlar.length + ' alt başlık' : 'Alt başlık yok'}
                  </div>
                </div>
                ${limitli ? `<div class="kart-satir-sag">${d.ana.aylikLimit
                  ? kacir(paraSimgeli(d.ana.aylikLimit))
                  : '<span class="silik limit-yok">limit yok</span>'}</div>` : ''}
              </div>
              <ul class="agac-alt ${acikMi ? 'acik' : ''}">
                ${d.gorunen.map(alt => `
                  <li class="kart-satir agac-girinti">
                    <div class="kart-satir-govde">
                      <div class="kart-satir-ust alt-baslik">${kacir(alt.baslikAdi)}</div>
                    </div>
                  </li>`).join('')}
              </ul>
            </li>`;
          }).join('')}
        </ul>`;

      govde.querySelectorAll('[data-ana]').forEach(oge => {
        oge.addEventListener('click', () => {
          const id = oge.dataset.ana;
          if (acik.has(id)) acik.delete(id); else acik.add(id);
          cizAgac();
        });
      });
    }

    cizAgac();
  };
}
