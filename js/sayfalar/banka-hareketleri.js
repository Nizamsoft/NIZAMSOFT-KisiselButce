/* Nizam Soft · Kişisel Bütçe — Banka Hareketleri ekranı
   En çok bakılan ekran. Tablo, arama, filtre, sonsuz kaydırma ve her satırda
   yürüyen bakiye. Telefonda her kayıt iki satırlık karta döner. */

import { simge } from '../simge.js';
import { git, geriDon } from '../yonlendirici.js';
import * as vt from '../veri/vt.js';
import { liste } from '../liste.js';
import { yuruyenBakiyeliListe, guncelBakiye } from '../veri/hesap.js';
import { para, paraSimgeli, tarih, kacir } from '../veri/bicim.js';

function tutarHucre(k) {
  const artiMi = k.etkiTutar >= 0;
  return `<span class="para ${artiMi ? 'arti' : 'eksi'}">${artiMi ? '+' : '−'}${kacir(para(Math.abs(k.etkiTutar)))}</span>`;
}

export default {
  baslik: 'Hareketler',
  simge: 'banka',
  async ciz(kap, parametre) {
    kap.innerHTML = '<div class="yukleniyor"><div class="yukleniyor-cubuk"></div></div>';

    const hesap = await vt.oku('bankaHesaplari', parametre.id);
    if (!hesap) {
      kap.innerHTML = `
        <div class="bos-durum">
          ${simge('uyari', 'simge-40')}
          <h3>Hesap bulunamadı</h3>
          <p>Bu hesap silinmiş ya da adres yanlış olabilir.</p>
          <button class="dugme" type="button" id="geri">${simge('geri')}<span>Geri dön</span></button>
        </div>`;
      kap.querySelector('#geri').addEventListener('click', geriDon);
      return;
    }

    const [hareketler, gelirB, giderB, hesaplar] = await Promise.all([
      vt.hepsi('bankaHareketleri'), vt.hepsi('gelirBasliklari'),
      vt.hepsi('giderBasliklari'), vt.hepsi('bankaHesaplari'),
    ]);

    const baslikAdi = new Map([...gelirB, ...giderB].map(b => [b.id, b.baslikAdi]));
    const hesapAdi = new Map(hesaplar.map(h => [h.id, h.hesapAdi]));

    const satirlar = yuruyenBakiyeliListe(hesap, hareketler)
      .reverse()                                  // en yeni üstte
      .map(h => ({
        ...h,
        baslik: h.yon === 'Transfer'
          ? (hesapAdi.get(h.hesap === hesap.id ? h.karsiHesap : h.hesap) || 'Transfer')
          : (baslikAdi.get(h.gelirBasligi || h.giderBasligi) || 'Başlıksız'),
      }));

    const kartMi = hesap.hesapTuru === 'Kredi Kartı';
    const bakiye = guncelBakiye(hesap, hareketler);

    kap.innerHTML = `
      <div class="kart kart-serit hesap-ozet">
        <div>
          <div class="silik">${kacir(hesap.hesapTuru)}${hesap.bankaAdi ? ' · ' + kacir(hesap.bankaAdi) : ''}</div>
          <h2>${kacir(hesap.hesapAdi)}</h2>
        </div>
        <div class="hesap-ozet-bakiye ${bakiye < 0 ? 'eksi' : ''}">
          <span class="silik">${kartMi && bakiye < 0 ? 'Güncel borç' : 'Güncel bakiye'}</span>
          <b>${kacir(paraSimgeli(kartMi && bakiye < 0 ? Math.abs(bakiye) : bakiye))}</b>
        </div>
      </div>
      ${hesap.hesapTuru === 'Nakit Cüzdan' ? '' : `
        <button class="dugme dugme-sade hesap-eylem" type="button" id="ekstre-yukle">
          ${simge('yukle')}<span>Ekstre yükle</span>
        </button>`}
      <div id="hareket-liste"></div>`;

    const yukleDugme = kap.querySelector('#ekstre-yukle');
    if (yukleDugme) {
      yukleDugme.addEventListener('click', () => git('/hesaplar/ekstre-yukle/' + hesap.id));
    }

    liste(kap.querySelector('#hareket-liste'), {
      kayitlar: satirlar,
      simge: 'banka',
      arananAlanlar: ['aciklama', 'baslik', 'dekontNo'],
      filtreler: [
        { ad: 'Yön', as: 'yon', degerler: ['Gelir', 'Gider', 'Transfer'] },
        { ad: 'Giriş şekli', as: 'girisSekli', degerler: ['Ekstreden', 'Elle'] },
      ],
      ozet: g => `${g.length} hareket · devir ${paraSimgeli(hesap.devirBakiye)}`,
      bos: {
        baslik: 'Bu hesapta hareket yok',
        yazi: hesap.hesapTuru === 'Nakit Cüzdan'
          ? 'Nakit hareketleri elle girilir. İlk harcamanı ekleyerek başla.'
          : 'Ekstre yükleyerek ya da elle girerek ilk hareketi ekle.',
      },
      sutunlar: [
        { ad: 'Tarih', as: 'tarih', ciz: k => kacir(tarih(k.tarih)), telefonda: 'alt' },
        { ad: 'Açıklama', as: 'aciklama', ciz: k => kacir(k.aciklama), telefonda: 'ust' },
        { ad: 'Başlık', as: 'baslik',
          ciz: k => k.baslik === 'Başlıksız'
            ? '<span class="silik">Başlıksız</span>' : kacir(k.baslik),
          telefonda: 'alt' },
        { ad: 'Tutar', as: 'tutar', hizala: 'sag', ciz: tutarHucre, telefonda: 'sag' },
        { ad: 'Bakiye', as: 'yuruyenBakiye', hizala: 'sag',
          ciz: k => `<span class="para">${kacir(para(k.yuruyenBakiye))}</span>`,
          telefonda: 'gizli' },
      ],
    });
  },
};
