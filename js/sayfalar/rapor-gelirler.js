/* Nizam Soft · Kişisel Bütçe — Gelirler Raporu
   Salt okunur. Ana başlığa dokununca ALT BAŞLIKLARI, alt başlığa dokununca
   o başlığın hareketleri açılır. Transfer hareketleri bu rapora girmez. */

import { basliklaRaporSayfasi } from './rapor-ortak.js';

export default {
  baslik: 'Gelirler Raporu',
  simge: 'gelir',
  ciz: basliklaRaporSayfasi('Gelir'),
};
