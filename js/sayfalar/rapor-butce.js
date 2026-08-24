/* Nizam Soft · Kişisel Bütçe — Bütçe Planlama ekranı
   Aşama 1: yalnız başlık ve boş durum. İçerik sonraki aşamalarda gelir. */

import { simge } from '../simge.js';

export default {
  baslik: 'Bütçe Planlama',
  simge: 'butce',
  ciz(kap) {
    kap.innerHTML = `
      <div class="bos-durum">
        ${simge('butce', 'simge-40')}
        <h3>Limit girilmemiş</h3>
        <p>Gider başlıklarına aylık limit koy; ne kadarını harcadığın burada görünsün.</p>
        <button class="dugme" type="button" disabled>${simge('arti')}<span>Limit gir</span></button>
      </div>`;
  },
};
