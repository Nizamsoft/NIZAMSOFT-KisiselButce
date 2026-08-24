/* Nizam Soft · Kişisel Bütçe — Giderler Raporu
   Salt okunur. Ana başlık → alt başlıklar → hareketler. En altta ayrıca
   "Kredi Kartı Harcamaları" satırı durur. Limiti aşan satır kırmızıdır. */

import { basliklaRaporSayfasi } from './rapor-ortak.js';

export default {
  baslik: 'Giderler Raporu',
  simge: 'gider',
  ciz: basliklaRaporSayfasi('Gider'),
};
