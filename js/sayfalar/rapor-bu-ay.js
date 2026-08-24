/* Nizam Soft · Kişisel Bütçe — Bu Ay N'oldu ekranı
   Aşama 1: yalnız başlık ve boş durum. İçerik sonraki aşamalarda gelir. */

import { simge } from '../simge.js';

export default {
  baslik: "Bu Ay N'oldu",
  simge: 'butce',
  ciz(kap) {
    kap.innerHTML = `
      <div class="bos-durum">
        ${simge('butce', 'simge-40')}
        <h3>Bu ay için veri yok</h3>
        <p>Ay başındaki ve ay sonundaki varlığın karşılaştırması burada madde madde çıkar.</p>
      </div>`;
  },
};
