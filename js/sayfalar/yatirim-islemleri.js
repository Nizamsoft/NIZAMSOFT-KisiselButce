/* Nizam Soft · Kişisel Bütçe — Yatırım İşlemleri ekranı
   Aşama 1: yalnız başlık ve boş durum. İçerik sonraki aşamalarda gelir. */

import { simge } from '../simge.js';

export default {
  baslik: 'Yatırım İşlemleri',
  simge: 'yatirim',
  ciz(kap) {
    kap.innerHTML = `
      <div class="bos-durum">
        ${simge('yatirim', 'simge-40')}
        <h3>Bu araçta işlem yok</h3>
        <p>Bu yatırım aracıyla yaptığın alış ve satışlar burada listelenir.</p>
        <button class="dugme" type="button" disabled>${simge('arti')}<span>İşlem ekle</span></button>
      </div>`;
  },
};
