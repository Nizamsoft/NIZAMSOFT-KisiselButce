/* Nizam Soft · Kişisel Bütçe — Hesaplar ekranı
   Üstte yatay sekme: Banka · Yatırımlar · Abonelikler. */

import { simge } from '../simge.js';
import { git, suAnki } from '../yonlendirici.js';
import * as vt from '../veri/vt.js';
import { bakiyeler, portfoy } from '../veri/hesap.js';
import { paraSimgeli, para, karsilastir, kacir } from '../veri/bicim.js';

const SEKMELER = [
  { anahtar: 'banka',       ad: 'Banka',      simge: 'banka' },
  { anahtar: 'yatirimlar',  ad: 'Yatırımlar', simge: 'yatirim' },
  { anahtar: 'abonelikler', ad: 'Abonelikler', simge: 'abonelik' },
];

const TUR_SIMGESI = {
  'Banka Hesabı': 'banka',
  'Nakit Cüzdan': 'cuzdan',
  'Kredi Kartı': 'kart',
};

function bosDurum(ikon, baslik, yazi, dugme) {
  return `
    <div class="bos-durum">
      ${simge(ikon, 'simge-40')}
      <h3>${kacir(baslik)}</h3>
      <p>${kacir(yazi)}</p>
      ${dugme ? `<button class="dugme" type="button" disabled>${simge('arti')}<span>${kacir(dugme)}</span></button>` : ''}
    </div>`;
}

/* ------------------------------------------------------------------ banka */

async function cizBanka(kap) {
  const { hesaplar, bakiye } = await bakiyeler();
  /* Sıra: banka hesapları, sonra nakit, en sonda kartlar; her grup ada göre. */
  const TUR_SIRASI = { 'Banka Hesabı': 0, 'Nakit Cüzdan': 1, 'Kredi Kartı': 2 };
  const aktif = hesaplar
    .filter(h => h.durum !== 'Pasif')
    .sort((a, b) => (TUR_SIRASI[a.hesapTuru] ?? 9) - (TUR_SIRASI[b.hesapTuru] ?? 9)
                 || karsilastir(a.hesapAdi, b.hesapAdi));
  if (!aktif.length) {
    kap.innerHTML = bosDurum('banka', 'Henüz hesap yok',
      'Banka hesabını, nakit cüzdanını ve kredi kartlarını burada tanımlarsın.', 'Hesap ekle');
    return;
  }

  kap.innerHTML = `
    <ul class="kart-liste">
      ${aktif.map(h => {
        const b = bakiye[h.id];
        const kart = h.hesapTuru === 'Kredi Kartı';
        return `
        <li class="kart-satir" data-hesap="${kacir(h.id)}" tabindex="0">
          <span class="hesap-simge">${simge(TUR_SIMGESI[h.hesapTuru] || 'banka')}</span>
          <div class="kart-satir-govde">
            <div class="kart-satir-ust">${kacir(h.hesapAdi)}</div>
            <div class="kart-satir-alt">
              ${kacir(h.hesapTuru)}${h.bankaAdi ? ' · ' + kacir(h.bankaAdi) : ''}
              ${kart && h.sonOdemeGunu ? ' · Son ödeme: ayın ' + kacir(h.sonOdemeGunu) + '\'i' : ''}
            </div>
          </div>
          <div class="kart-satir-sag ${b < 0 ? 'eksi' : ''}">
            ${kacir(paraSimgeli(b))}
            ${kart && b < 0 ? '<span class="silik borc-not">borç</span>' : ''}
          </div>
        </li>`;
      }).join('')}
    </ul>`;

  kap.querySelectorAll('[data-hesap]').forEach(oge => {
    oge.addEventListener('click', () => git('/hesaplar/hareketler/' + oge.dataset.hesap));
  });
}

/* ------------------------------------------------------------- yatırımlar */

async function cizYatirimlar(kap) {
  const satirlar = await portfoy();
  if (!satirlar.length) {
    kap.innerHTML = bosDurum('yatirim', 'Yatırım yok',
      'Altın, döviz ya da hisse aldığında elindekiler burada araç araç görünür.', 'Yatırım ekle');
    return;
  }

  kap.innerHTML = `
    <ul class="kart-liste">
      ${satirlar.map(s => `
        <li class="kart-satir" data-arac="${kacir(s.id)}" tabindex="0">
          <span class="hesap-simge">${simge('yatirim')}</span>
          <div class="kart-satir-govde">
            <div class="kart-satir-ust">${kacir(s.aracAdi)}</div>
            <div class="kart-satir-alt">
              ${kacir(para(s.eldeKalanAdet))} ${kacir(s.birim)} ·
              ortalama ${kacir(paraSimgeli(s.ortalamaMaliyet))}
            </div>
          </div>
          <div class="kart-satir-sag">
            ${kacir(paraSimgeli(s.guncelDeger))}
            <span class="${s.karZarar >= 0 ? 'arti' : 'eksi'} kar-not">
              ${s.karZarar >= 0 ? '+' : '−'}${kacir(para(Math.abs(s.karZarar)))}
            </span>
          </div>
        </li>`).join('')}
    </ul>`;

  kap.querySelectorAll('[data-arac]').forEach(oge => {
    oge.addEventListener('click', () => git('/yatirimlar/islemler/' + oge.dataset.arac));
  });
}

/* ------------------------------------------------------------ abonelikler */

async function cizAbonelikler(kap) {
  const [abonelikler, hesaplar] = await Promise.all([
    vt.hepsi('abonelikler'), vt.hepsi('bankaHesaplari'),
  ]);
  const aktif = abonelikler.filter(a => a.durum !== 'Pasif')
    .sort((a, b) => karsilastir(a.abonelikAdi, b.abonelikAdi));
  if (!aktif.length) {
    kap.innerHTML = bosDurum('abonelik', 'Abonelik yok',
      'Her ay tekrar eden ödemelerini ekle; ödendi tikleri burada tutulur.', 'Abonelik ekle');
    return;
  }
  const hesapAdi = new Map(hesaplar.map(h => [h.id, h.hesapAdi]));

  kap.innerHTML = `
    <ul class="kart-liste">
      ${aktif.map(a => `
        <li class="kart-satir" data-abonelik="${kacir(a.id)}" tabindex="0">
          <span class="hesap-simge">${simge('abonelik')}</span>
          <div class="kart-satir-govde">
            <div class="kart-satir-ust">${kacir(a.abonelikAdi)}</div>
            <div class="kart-satir-alt">
              Ayın ${kacir(a.odemeGunu)}'i · ${kacir(hesapAdi.get(a.odendigiHesap) || '—')}
            </div>
          </div>
          <div class="kart-satir-sag">${kacir(paraSimgeli(a.aylikTutar))}</div>
        </li>`).join('')}
    </ul>`;

  kap.querySelectorAll('[data-abonelik]').forEach(oge => {
    oge.addEventListener('click', () => git('/abonelikler/odemeler/' + oge.dataset.abonelik));
  });
}

/* ------------------------------------------------------------------ sayfa */

export default {
  baslik: 'Hesaplar',
  simge: 'cuzdan',
  async ciz(kap) {
    const secili = suAnki().sorgu.sekme || 'banka';
    const etkin = SEKMELER.find(s => s.anahtar === secili) || SEKMELER[0];

    kap.innerHTML = `
      <div class="sekme-serit" role="tablist">
        ${SEKMELER.map(s => `
          <button class="sekme" role="tab" type="button"
                  aria-selected="${s.anahtar === etkin.anahtar}"
                  data-sekme="${s.anahtar}">${s.ad}</button>`).join('')}
      </div>
      <div id="sekme-govde"><div class="yukleniyor"><div class="yukleniyor-cubuk"></div></div></div>`;

    kap.querySelectorAll('[data-sekme]').forEach(dugme => {
      dugme.addEventListener('click', () => git('/hesaplar?sekme=' + dugme.dataset.sekme));
    });

    const govde = kap.querySelector('#sekme-govde');
    if (etkin.anahtar === 'yatirimlar') await cizYatirimlar(govde);
    else if (etkin.anahtar === 'abonelikler') await cizAbonelikler(govde);
    else await cizBanka(govde);
  },
};
