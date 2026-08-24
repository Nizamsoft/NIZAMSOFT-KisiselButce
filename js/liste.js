/* Nizam Soft · Kişisel Bütçe — liste bileşeni
 *
 * Bütün liste ekranları bunu kullanır. Tasarım kararları:
 *   Yoğunluk sıkışık (satır 34px) · tablo satırı yatay çizgi, dikey çizgi yok
 *   İlk sütun kalın ve yatay kaydırmada yapışık · telefonda her kayıt iki satır
 *   Arama simgeden açılır · filtre üstten inen panel · liste sonu sonsuz kaydırma
 */

import { simge } from './simge.js';
import { kacir, sadelestir } from './veri/bicim.js';

const SAYFA_BOYU = 50;   // sonsuz kaydırmada bir seferde eklenen satır

/**
 * @param {HTMLElement} kap
 * @param {object} ayar
 *   sutunlar: [{ad, as, hizala?, ciz?(kayit), telefonda?: 'ust'|'alt'|'gizli'}]
 *   kayitlar: dizi
 *   arananAlanlar: ['aciklama', ...]
 *   filtreler: [{ad, as, degerler:[...]}]
 *   bos: {baslik, yazi, dugme?, dugmeIslev?}
 *   satirTikla?: (kayit) => void
 *   ozet?: (gorunen) => string   listenin üstünde tek satır özet
 */
export function liste(kap, ayar) {
  const durum = { arama: '', filtre: {}, gosterilen: SAYFA_BOYU, aramaAcik: false };

  kap.innerHTML = `
    <div class="liste-arac">
      <div class="liste-arac-sol" id="liste-ozet"></div>
      <div class="liste-arac-sag">
        <button class="dugme-simge-tek" type="button" id="liste-ara-dugme"
                aria-label="Ara" aria-expanded="false">${simge('ara')}</button>
        ${ayar.filtreler?.length ? `
          <button class="dugme-simge-tek" type="button" id="liste-filtre-dugme"
                  aria-label="Filtrele" aria-expanded="false">${simge('filtre')}</button>` : ''}
      </div>
    </div>
    <div class="liste-arama gizli" id="liste-arama-kutu">
      <input class="alan-giris" type="search" id="liste-arama"
             placeholder="Listede ara…" autocomplete="off" aria-label="Listede ara">
    </div>
    <div class="liste-filtre gizli" id="liste-filtre-panel"></div>
    <div id="liste-govde"></div>`;

  const govde = kap.querySelector('#liste-govde');
  const ozetKutu = kap.querySelector('#liste-ozet');
  const aramaKutu = kap.querySelector('#liste-arama-kutu');
  const aramaGiris = kap.querySelector('#liste-arama');
  const filtrePanel = kap.querySelector('#liste-filtre-panel');

  /* ---- arama ---- */
  kap.querySelector('#liste-ara-dugme').addEventListener('click', () => {
    durum.aramaAcik = !durum.aramaAcik;
    aramaKutu.classList.toggle('gizli', !durum.aramaAcik);
    kap.querySelector('#liste-ara-dugme').setAttribute('aria-expanded', String(durum.aramaAcik));
    if (durum.aramaAcik) aramaGiris.focus();
    else { aramaGiris.value = ''; durum.arama = ''; ciz(); }
  });
  aramaGiris.addEventListener('input', () => {
    durum.arama = aramaGiris.value;
    durum.gosterilen = SAYFA_BOYU;
    ciz();
  });

  /* ---- filtre: üstten inen panel ---- */
  if (ayar.filtreler?.length) {
    filtrePanel.innerHTML = ayar.filtreler.map(f => `
      <label class="alan">
        <span class="alan-etiket">${kacir(f.ad)}</span>
        <select class="alan-giris" data-filtre="${kacir(f.as)}">
          <option value="">Hepsi</option>
          ${f.degerler.map(d => `<option value="${kacir(d)}">${kacir(d)}</option>`).join('')}
        </select>
      </label>`).join('');

    kap.querySelector('#liste-filtre-dugme').addEventListener('click', () => {
      const acik = filtrePanel.classList.toggle('gizli');
      kap.querySelector('#liste-filtre-dugme').setAttribute('aria-expanded', String(!acik));
    });
    filtrePanel.querySelectorAll('[data-filtre]').forEach(secim => {
      secim.addEventListener('change', () => {
        durum.filtre[secim.dataset.filtre] = secim.value;
        durum.gosterilen = SAYFA_BOYU;
        ciz();
      });
    });
  }

  /* ---- süzme ---- */
  function suzulmus() {
    const q = sadelestir(durum.arama);
    return ayar.kayitlar.filter(k => {
      for (const [as, deger] of Object.entries(durum.filtre)) {
        if (deger && String(k[as] ?? '') !== deger) return false;
      }
      if (!q) return true;
      return (ayar.arananAlanlar || []).some(as => sadelestir(k[as]).includes(q));
    });
  }

  /* ---- çizim ---- */
  function ciz() {
    const gorunen = suzulmus();
    ozetKutu.textContent = ayar.ozet ? ayar.ozet(gorunen) : `${gorunen.length} kayıt`;

    if (!gorunen.length) {
      const bos = durum.arama || Object.values(durum.filtre).some(Boolean)
        ? { baslik: 'Sonuç yok', yazi: 'Aramanı ya da filtreni değiştirip yeniden dene.' }
        : ayar.bos;
      govde.innerHTML = `
        <div class="bos-durum">
          ${simge(ayar.simge || 'kutu', 'simge-40')}
          <h3>${kacir(bos.baslik)}</h3>
          <p>${kacir(bos.yazi)}</p>
          ${bos.dugme ? `<button class="dugme" type="button" id="bos-dugme">${simge('arti')}<span>${kacir(bos.dugme)}</span></button>` : ''}
        </div>`;
      if (bos.dugme && bos.dugmeIslev) {
        govde.querySelector('#bos-dugme').addEventListener('click', bos.dugmeIslev);
      }
      return;
    }

    const dilim = gorunen.slice(0, durum.gosterilen);
    const sutunlar = ayar.sutunlar;

    govde.innerHTML = `
      <div class="tablo-kutu">
        <table class="tablo">
          <thead>
            <tr>${sutunlar.map((s, i) => `
              <th class="${i === 0 ? 'ilk-sutun' : ''} ${s.hizala === 'sag' ? 'sag' : ''}"
                  scope="col">${kacir(s.ad)}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${dilim.map(k => satirHtml(k, sutunlar)).join('')}
          </tbody>
        </table>
      </div>
      <ul class="kart-liste">${dilim.map(k => kartHtml(k, sutunlar)).join('')}</ul>
      ${gorunen.length > dilim.length
        ? `<div class="liste-devam" id="liste-devam">${gorunen.length - dilim.length} kayıt daha…</div>` : ''}`;

    if (ayar.satirTikla) {
      govde.querySelectorAll('[data-kayit]').forEach(oge => {
        oge.addEventListener('click', () => {
          ayar.satirTikla(gorunen.find(k => k.id === oge.dataset.kayit));
        });
      });
    }

    /* Sonsuz kaydırma: son satır göründüğünde bir sayfa daha ekle. */
    const devam = govde.querySelector('#liste-devam');
    if (devam) {
      const gozcu = new IntersectionObserver(girisler => {
        if (girisler[0].isIntersecting) {
          gozcu.disconnect();
          durum.gosterilen += SAYFA_BOYU;
          ciz();
        }
      }, { rootMargin: '200px' });
      gozcu.observe(devam);
    }
  }

  function hucre(kayit, s) {
    return s.ciz ? s.ciz(kayit) : kacir(kayit[s.as] ?? '');
  }

  function satirHtml(kayit, sutunlar) {
    return `<tr data-kayit="${kacir(kayit.id)}" ${ayar.satirTikla ? 'tabindex="0"' : ''}>
      ${sutunlar.map((s, i) => `
        <td class="${i === 0 ? 'ilk-sutun' : ''} ${s.hizala === 'sag' ? 'sag' : ''}">${hucre(kayit, s)}</td>`).join('')}
    </tr>`;
  }

  /* Telefonda her kayıt iki satır: üstte ana bilgi kalın, altta detaylar silik. */
  function kartHtml(kayit, sutunlar) {
    const ust = sutunlar.filter(s => s.telefonda === 'ust' || (!s.telefonda && sutunlar.indexOf(s) === 0));
    const sag = sutunlar.find(s => s.telefonda === 'sag');
    const alt = sutunlar.filter(s => s.telefonda === 'alt');
    return `<li class="kart-satir" data-kayit="${kacir(kayit.id)}" ${ayar.satirTikla ? 'tabindex="0"' : ''}>
      <div class="kart-satir-govde">
        <div class="kart-satir-ust">${ust.map(s => hucre(kayit, s)).join(' ')}</div>
        <div class="kart-satir-alt">${alt.map(s => hucre(kayit, s)).filter(Boolean).join(' · ')}</div>
      </div>
      ${sag ? `<div class="kart-satir-sag">${hucre(kayit, sag)}</div>` : ''}
    </li>`;
  }

  ciz();
  return { yenile: ciz };
}
