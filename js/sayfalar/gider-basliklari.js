/* Nizam Soft · Kişisel Bütçe — Gider Başlıkları ekranı
   Aylık bütçe limiti yalnız ANA başlıkta gösterilir. */

import { basliklarSayfasi } from './basliklar.js';

export default {
  baslik: 'Gider Başlıkları',
  simge: 'gider',
  ciz: basliklarSayfasi('giderBasliklari', true),
};
