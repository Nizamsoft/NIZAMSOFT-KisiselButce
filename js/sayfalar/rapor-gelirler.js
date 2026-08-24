/* Nizam Soft · Kişisel Bütçe — Gelirler Raporu ekranı
   Aşama 1: yalnız başlık ve boş durum. İçerik sonraki aşamalarda gelir. */

import { simge } from '../simge.js';

export default {
  baslik: 'Gelirler Raporu',
  simge: 'gelir',
  ciz(kap) {
    kap.innerHTML = `
      <div class="bos-durum">
        ${simge('gelir', 'simge-40')}
        <h3>Gelir kaydı yok</h3>
        <p>Hareketlere gelir başlığı atadıkça bu rapor ay ay dolacak.</p>
      </div>`;
  },
};
