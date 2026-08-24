/* Nizam Soft · Kişisel Bütçe — Rutin Hareketler ekranı
   Aşama 1: yalnız başlık ve boş durum. İçerik sonraki aşamalarda gelir. */

import { simge } from '../simge.js';

export default {
  baslik: 'Rutin Hareketler',
  simge: 'takvim',
  ciz(kap) {
    kap.innerHTML = `
      <div class="bos-durum">
        ${simge('takvim', 'simge-40')}
        <h3>Rutin yok</h3>
        <p>Her ayın 5'i maaş, 8'i kira gibi tekrar eden hareketleri burada tanımlarsın.</p>
        <button class="dugme" type="button" disabled>${simge('arti')}<span>Rutin ekle</span></button>
      </div>`;
  },
};
