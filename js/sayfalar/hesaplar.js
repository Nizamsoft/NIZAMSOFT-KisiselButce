/* Nizam Soft · Kişisel Bütçe — Hesaplar ekranı
   Üstte yatay sekme: Banka · Yatırımlar · Abonelikler.
   Aşama 1: sekmeler çalışır, içerikler boş durum. */

import { simge } from '../simge.js';
import { git, suAnki } from '../yonlendirici.js';

const SEKMELER = [
  {
    anahtar: 'banka', ad: 'Banka', simge: 'banka',
    bosBaslik: 'Henüz hesap yok',
    bosYazi: 'Banka hesabını, nakit cüzdanını ve kredi kartlarını burada tanımlarsın.',
    bosDugme: 'Hesap ekle',
  },
  {
    anahtar: 'yatirimlar', ad: 'Yatırımlar', simge: 'yatirim',
    bosBaslik: 'Yatırım yok',
    bosYazi: 'Altın, döviz ya da hisse aldığında elindekiler burada araç araç görünür.',
    bosDugme: 'Yatırım ekle',
  },
  {
    anahtar: 'abonelikler', ad: 'Abonelikler', simge: 'abonelik',
    bosBaslik: 'Abonelik yok',
    bosYazi: 'Her ay tekrar eden ödemelerini ekle; ödendi tikleri burada tutulur.',
    bosDugme: 'Abonelik ekle',
  },
];

export default {
  baslik: 'Hesaplar',
  simge: 'cuzdan',
  ciz(kap) {
    const secili = suAnki().sorgu.sekme || 'banka';
    const etkin = SEKMELER.find(s => s.anahtar === secili) || SEKMELER[0];

    kap.innerHTML = `
      <div class="sekme-serit" role="tablist">
        ${SEKMELER.map(s => `
          <button class="sekme" role="tab" type="button"
                  aria-selected="${s.anahtar === etkin.anahtar}"
                  data-sekme="${s.anahtar}">${s.ad}</button>`).join('')}
      </div>
      <div class="bos-durum">
        ${simge(etkin.simge, 'simge-40')}
        <h3>${etkin.bosBaslik}</h3>
        <p>${etkin.bosYazi}</p>
        <button class="dugme" type="button" disabled>${simge('arti')}<span>${etkin.bosDugme}</span></button>
      </div>`;

    kap.querySelectorAll('[data-sekme]').forEach(dugme => {
      dugme.addEventListener('click', () => git('/hesaplar?sekme=' + dugme.dataset.sekme));
    });
  },
};
