/* Nizam Soft · Kişisel Bütçe — Yatırım Araçları ekranı
   Tanım listesi ve güncel fiyatlar. Fiyat internetten çekilmez. */

import { simge } from '../simge.js';
import * as vt from '../veri/vt.js';
import { liste } from '../liste.js';
import { paraSimgeli, tarih, kacir } from '../veri/bicim.js';

export default {
  baslik: 'Yatırım Araçları',
  simge: 'yatirim',
  async ciz(kap) {
    kap.innerHTML = '<div class="yukleniyor"><div class="yukleniyor-cubuk"></div></div>';
    const araclar = (await vt.hepsi('yatirimAraclari')).filter(a => a.durum !== 'Pasif');

    kap.innerHTML = '<div id="arac-liste"></div>';
    liste(kap.querySelector('#arac-liste'), {
      kayitlar: araclar,
      simge: 'yatirim',
      arananAlanlar: ['aracAdi', 'birim'],
      filtreler: [{ ad: 'Birim', as: 'birim', degerler: ['Gram', 'Adet', 'Lot', 'Dolar', 'Euro'] }],
      ozet: g => `${g.length} araç`,
      bos: {
        baslik: 'Araç yok',
        yazi: 'Gram altın, dolar, hisse gibi yatırım araçlarını ve güncel fiyatlarını burada tutarsın.',
      },
      sutunlar: [
        { ad: 'Araç Adı', as: 'aracAdi', ciz: k => kacir(k.aracAdi), telefonda: 'ust' },
        { ad: 'Birim', as: 'birim', ciz: k => kacir(k.birim), telefonda: 'alt' },
        { ad: 'Güncel Fiyat', as: 'guncelFiyat', hizala: 'sag', telefonda: 'sag',
          ciz: k => k.guncelFiyat
            ? `<span class="para">${kacir(paraSimgeli(k.guncelFiyat))}</span>`
            : '<span class="silik">girilmedi</span>' },
        { ad: 'Fiyat Tarihi', as: 'guncelFiyatTarihi', telefonda: 'alt',
          ciz: k => k.guncelFiyatTarihi ? kacir(tarih(k.guncelFiyatTarihi)) : '' },
      ],
    });
  },
};
