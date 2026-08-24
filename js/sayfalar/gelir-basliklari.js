/* Nizam Soft · Kişisel Bütçe — Gelir Başlıkları ekranı
   Aşama 1: yalnız başlık ve boş durum. İçerik sonraki aşamalarda gelir. */

import { simge } from '../simge.js';

export default {
  baslik: 'Gelir Başlıkları',
  simge: 'gelir',
  ciz(kap) {
    kap.innerHTML = `
      <div class="bos-durum">
        ${simge('gelir', 'simge-40')}
        <h3>Başlık yok</h3>
        <p>Maaş, kira geliri gibi gelir başlıklarını burada düzenlersin.</p>
        <button class="dugme" type="button" disabled>${simge('arti')}<span>Başlık ekle</span></button>
      </div>`;
  },
};
