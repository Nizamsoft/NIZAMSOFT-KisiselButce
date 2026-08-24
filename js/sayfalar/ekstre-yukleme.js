/* Nizam Soft · Kişisel Bütçe — Ekstre Yükleme ekranı
   Aşama 1: yalnız başlık ve boş durum. İçerik sonraki aşamalarda gelir. */

import { simge } from '../simge.js';

export default {
  baslik: 'Ekstre Yükleme',
  simge: 'yukle',
  ciz(kap) {
    kap.innerHTML = `
      <div class="bos-durum">
        ${simge('yukle', 'simge-40')}
        <h3>Dosya seçilmedi</h3>
        <p>Bankandan indirdiğin Excel ekstresini seç; hareketleri tek tek başlıklandıracağız.</p>
        <button class="dugme" type="button" disabled>${simge('arti')}<span>Excel seç</span></button>
      </div>`;
  },
};
