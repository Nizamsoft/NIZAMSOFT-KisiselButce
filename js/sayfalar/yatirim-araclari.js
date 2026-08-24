/* Nizam Soft · Kişisel Bütçe — Yatırım Araçları ekranı
   Aşama 1: yalnız başlık ve boş durum. İçerik sonraki aşamalarda gelir. */

import { simge } from '../simge.js';

export default {
  baslik: 'Yatırım Araçları',
  simge: 'yatirim',
  ciz(kap) {
    kap.innerHTML = `
      <div class="bos-durum">
        ${simge('yatirim', 'simge-40')}
        <h3>Araç yok</h3>
        <p>Gram altın, dolar, hisse gibi yatırım araçlarını ve güncel fiyatlarını burada tutarsın.</p>
        <button class="dugme" type="button" disabled>${simge('arti')}<span>Araç ekle</span></button>
      </div>`;
  },
};
