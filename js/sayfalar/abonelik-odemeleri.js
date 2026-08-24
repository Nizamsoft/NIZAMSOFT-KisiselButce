/* Nizam Soft · Kişisel Bütçe — Abonelik Ödemeleri ekranı
   Aşama 1: yalnız başlık ve boş durum. İçerik sonraki aşamalarda gelir. */

import { simge } from '../simge.js';

export default {
  baslik: 'Abonelik Ödemeleri',
  simge: 'abonelik',
  ciz(kap) {
    kap.innerHTML = `
      <div class="bos-durum">
        ${simge('abonelik', 'simge-40')}
        <h3>Ödeme dönemi yok</h3>
        <p>Aboneliğin ay ay ödenip ödenmediği burada tik olarak görünür.</p>
      </div>`;
  },
};
