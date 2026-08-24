/* Nizam Soft · Kişisel Bütçe — Panel ekranı
   Aşama 1: yalnız başlık ve boş durum. İçerik sonraki aşamalarda gelir. */

import { simge } from '../simge.js';

export default {
  baslik: 'Panel',
  simge: 'panel',
  ciz(kap) {
    kap.innerHTML = `
      <div class="bos-durum">
        ${simge('panel', 'simge-40')}
        <h3>Henüz veri yok</h3>
        <p>Bir banka hesabı tanımla ve ilk ekstreni yükle; özet burada oluşacak.</p>
        <button class="dugme" type="button" disabled>${simge('arti')}<span>Hesap ekle</span></button>
      </div>`;
  },
};
