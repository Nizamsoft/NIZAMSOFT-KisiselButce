/* Nizam Soft · Kişisel Bütçe — Gider Başlıkları ekranı
   Aşama 1: yalnız başlık ve boş durum. İçerik sonraki aşamalarda gelir. */

import { simge } from '../simge.js';

export default {
  baslik: 'Gider Başlıkları',
  simge: 'gider',
  ciz(kap) {
    kap.innerHTML = `
      <div class="bos-durum">
        ${simge('gider', 'simge-40')}
        <h3>Başlık yok</h3>
        <p>Market, kira gibi gider başlıklarını ve aylık bütçe limitlerini burada düzenlersin.</p>
        <button class="dugme" type="button" disabled>${simge('arti')}<span>Başlık ekle</span></button>
      </div>`;
  },
};
