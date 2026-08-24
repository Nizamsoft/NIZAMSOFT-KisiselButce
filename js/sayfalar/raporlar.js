/* Nizam Soft · Kişisel Bütçe — Raporlar ekranı
   Rapor listesi; birine basınca ayrı ekran açılır. */

import { simge } from '../simge.js';
import { git } from '../yonlendirici.js';

const RAPORLAR = [
  { rota: '/raporlar/gelirler',   ad: 'Gelirler Raporu',   simge: 'gelir',
    not: 'Gelirleri ay ay ve başlık başlık gösterir.' },
  { rota: '/raporlar/giderler',   ad: 'Giderler Raporu',   simge: 'gider',
    not: 'Seçilen ayın giderlerini başlık başlık gösterir.' },
  { rota: '/raporlar/bu-ay',      ad: "Bu Ay N'oldu",      simge: 'butce',
    not: 'Ay başında ne vardı, ay sonunda ne oldu — madde madde.' },
  { rota: '/raporlar/nakit-akis', ad: 'Nakit Akış',        simge: 'takvim',
    not: 'Önümüzdeki 6 ayda ne girecek, ne çıkacak.' },
  { rota: '/raporlar/butce',      ad: 'Bütçe Planlama',    simge: 'butce',
    not: 'Aylık limitlerin ne kadarı harcandı, ne kadar kaldı.' },
];

export default {
  baslik: 'Raporlar',
  simge: 'rapor',
  ciz(kap) {
    kap.innerHTML = `
      <div class="liste liste-kutu">
        ${RAPORLAR.map(r => `
          <button class="liste-satir" type="button" data-rota="${r.rota}">
            ${simge(r.simge)}
            <span class="liste-satir-govde">
              <span class="liste-satir-ad">${r.ad}</span>
              <span class="liste-satir-not">${r.not}</span>
            </span>
          </button>`).join('')}
      </div>`;

    kap.querySelectorAll('[data-rota]').forEach(satir => {
      satir.addEventListener('click', () => git(satir.dataset.rota));
    });
  },
};
