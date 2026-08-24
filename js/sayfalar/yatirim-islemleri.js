/* Nizam Soft · Kişisel Bütçe — Yatırım İşlemleri ekranı
   Bir yatırım aracının alış ve satış geçmişi. Ortalama maliyet yöntemiyle
   elde kalan adet ve kâr/zarar hesaplanır. */

import { simge } from '../simge.js';
import { geriDon, cozumle } from '../yonlendirici.js';
import { yatirimIslemiEkle } from '../kayitlar.js';
import * as vt from '../veri/vt.js';
import { liste } from '../liste.js';
import { portfoy } from '../veri/hesap.js';
import { para, paraSimgeli, tarih, kacir } from '../veri/bicim.js';

export default {
  baslik: 'Yatırım İşlemleri',
  simge: 'yatirim',
  async ciz(kap, parametre) {
    kap.innerHTML = '<div class="yukleniyor"><div class="yukleniyor-cubuk"></div></div>';

    const arac = await vt.oku('yatirimAraclari', parametre.id);
    if (!arac) {
      kap.innerHTML = `
        <div class="bos-durum">
          ${simge('uyari', 'simge-40')}
          <h3>Yatırım aracı bulunamadı</h3>
          <p>Bu araç silinmiş ya da adres yanlış olabilir.</p>
          <button class="dugme" type="button" id="geri">${simge('geri')}<span>Geri dön</span></button>
        </div>`;
      kap.querySelector('#geri').addEventListener('click', geriDon);
      return;
    }

    const [islemler, hesaplar, varliklar] = await Promise.all([
      vt.hepsi('yatirimIslemleri'), vt.hepsi('bankaHesaplari'), portfoy(),
    ]);
    const hesapAdi = new Map(hesaplar.map(h => [h.id, h.hesapAdi]));
    const durum = varliklar.find(v => v.id === arac.id);

    const satirlar = islemler
      .filter(i => i.yatirimAraci === arac.id)
      .sort((a, b) => (b.tarih || '').localeCompare(a.tarih || ''))
      .map(i => ({ ...i, hesapAdi: hesapAdi.get(i.hesap) || '—' }));

    kap.innerHTML = `
      <div class="kart kart-serit hesap-ozet">
        <div>
          <div class="silik">Yatırım aracı · ${kacir(arac.birim)}</div>
          <h2>${kacir(arac.aracAdi)}</h2>
        </div>
        <div class="hesap-ozet-bakiye">
          <span class="silik">Elde kalan</span>
          <b>${durum ? kacir(para(durum.eldeKalanAdet)) + ' ' + kacir(arac.birim) : '—'}</b>
        </div>
      </div>

      ${durum ? `
        <div class="kart yatirim-ozet">
          <dl>
            <div class="satir-cift"><dt>Ortalama maliyet</dt>
              <dd>${kacir(paraSimgeli(durum.ortalamaMaliyet))}</dd></div>
            <div class="satir-cift"><dt>Güncel fiyat</dt>
              <dd>${arac.guncelFiyat ? kacir(paraSimgeli(arac.guncelFiyat)) : '<span class="silik">girilmedi</span>'}</dd></div>
            <div class="satir-cift"><dt>Güncel değer</dt>
              <dd>${kacir(paraSimgeli(durum.guncelDeger))}</dd></div>
            <div class="satir-cift"><dt>Kâr / zarar</dt>
              <dd class="${durum.karZarar >= 0 ? 'arti' : 'eksi'}">
                ${durum.karZarar >= 0 ? '+' : '−'}${kacir(paraSimgeli(Math.abs(durum.karZarar)))}</dd></div>
          </dl>
        </div>` : ''}

      <div class="liste-arac">
        <div class="liste-arac-sol"></div>
        <button class="dugme dugme-sade dugme-kucuk" type="button" id="islem-ekle">
          ${simge('arti')}<span>Alış / satış ekle</span></button>
      </div>
      <div id="islem-liste"></div>`;

    const yenile = () => cozumle();
    kap.querySelector('#islem-ekle')
       .addEventListener('click', () => yatirimIslemiEkle({ arac: arac.id }, yenile));

    liste(kap.querySelector('#islem-liste'), {
      kayitlar: satirlar,
      simge: 'yatirim',
      arananAlanlar: ['islemTuru', 'hesapAdi'],
      filtreler: [{ ad: 'İşlem', as: 'islemTuru', degerler: ['Alış', 'Satış'] }],
      ozet: g => `${g.length} işlem`,
      bos: {
        baslik: 'Bu araçta işlem yok',
        yazi: 'Bu yatırım aracıyla yaptığın alış ve satışlar burada listelenir.',
        dugme: 'Alış / satış ekle',
        dugmeIslev: () => yatirimIslemiEkle({ arac: arac.id }, yenile),
      },
      sutunlar: [
        { ad: 'Tarih', as: 'tarih', ciz: k => kacir(tarih(k.tarih)), telefonda: 'alt' },
        { ad: 'İşlem', as: 'islemTuru', telefonda: 'ust',
          ciz: k => `<span class="${k.islemTuru === 'Alış' ? 'arti' : 'eksi'}">${kacir(k.islemTuru)}</span>` },
        { ad: 'Adet', as: 'adet', hizala: 'sag', telefonda: 'alt',
          ciz: k => kacir(para(k.adet)) + ' ' + kacir(arac.birim) },
        { ad: 'Birim Fiyat', as: 'birimFiyat', hizala: 'sag', telefonda: 'alt',
          ciz: k => kacir(paraSimgeli(k.birimFiyat)) },
        { ad: 'Tutar', as: 'tutar', hizala: 'sag', telefonda: 'sag',
          ciz: k => `<span class="para">${kacir(paraSimgeli(k.tutar))}</span>` },
        { ad: 'Hesap', as: 'hesapAdi', ciz: k => kacir(k.hesapAdi), telefonda: 'gizli' },
      ],
    });
  },
};
