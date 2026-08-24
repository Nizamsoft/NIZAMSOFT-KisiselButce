/* Nizam Soft · Kişisel Bütçe — Giderler Raporu ekranı
   Aşama 1: yalnız başlık ve boş durum. İçerik sonraki aşamalarda gelir. */

import { simge } from '../simge.js';

export default {
  baslik: 'Giderler Raporu',
  simge: 'gider',
  ciz(kap) {
    kap.innerHTML = `
      <div class="bos-durum">
        ${simge('gider', 'simge-40')}
        <h3>Gider kaydı yok</h3>
        <p>Hareketlere gider başlığı atadıkça seçtiğin ayın giderleri burada toplanacak.</p>
      </div>`;
  },
};
