/* Nizam Soft · Kişisel Bütçe — Nakit Akış ekranı
   Aşama 1: yalnız başlık ve boş durum. İçerik sonraki aşamalarda gelir. */

import { simge } from '../simge.js';

export default {
  baslik: 'Nakit Akış',
  simge: 'takvim',
  ciz(kap) {
    kap.innerHTML = `
      <div class="bos-durum">
        ${simge('takvim', 'simge-40')}
        <h3>Rutin hareket yok</h3>
        <p>Maaş, kira gibi tekrar eden gelir ve giderlerini ekle; önümüzdeki 6 ay burada görünsün.</p>
        <button class="dugme" type="button" disabled>${simge('arti')}<span>Rutin ekle</span></button>
      </div>`;
  },
};
