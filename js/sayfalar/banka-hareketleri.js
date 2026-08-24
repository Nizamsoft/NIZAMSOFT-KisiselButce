/* Nizam Soft · Kişisel Bütçe — Hareketler ekranı
   Aşama 1: yalnız başlık ve boş durum. İçerik sonraki aşamalarda gelir. */

import { simge } from '../simge.js';

export default {
  baslik: 'Hareketler',
  simge: 'banka',
  ciz(kap) {
    kap.innerHTML = `
      <div class="bos-durum">
        ${simge('banka', 'simge-40')}
        <h3>Bu hesapta hareket yok</h3>
        <p>Ekstre yükleyerek ya da elle girerek ilk hareketi ekle.</p>
        <button class="dugme" type="button" disabled>${simge('arti')}<span>Ekstre yükle</span></button>
      </div>`;
  },
};
