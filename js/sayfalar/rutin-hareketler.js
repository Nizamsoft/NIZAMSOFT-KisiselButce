/* Nizam Soft · Kişisel Bütçe — Rutin Hareketler ekranı
   Tekrar eden gelir ve giderlerin tanım listesi. Abonelikler ve kredi kartı
   son ödeme günleri buraya elle GİRİLMEZ; kendiliğinden nakit akışa akar. */

import { simge } from '../simge.js';
import * as vt from '../veri/vt.js';
import { liste } from '../liste.js';
import { rutinDuzenle } from '../kayitlar.js';
import { paraSimgeli, tarih, karsilastir, kacir } from '../veri/bicim.js';

/** "Her ayın 5'i" gibi insan diliyle tekrar tarifi. */
function tekrarYazisi(r) {
  if (r.tekrarSikligi === 'Haftalık') return `Her ${r.haftaninGunu}`;
  if (r.tekrarSikligi === 'Aylık') return `Her ayın ${r.ayinGunu}'i`;
  if (r.tekrarSikligi === 'Yıllık') return `Her yıl ${r.ayinGunu}.${String(r.ayi).padStart(2, '0')}`;
  if (r.tekrarSikligi === 'Özel Kalıp') {
    /* "2. hafta" → "2."  ·  "Son hafta" → "son" */
    const hafta = r.ayinHaftasi === 'Son hafta' ? 'son' : r.ayinHaftasi.replace(' hafta', '');
    return `Her ayın ${hafta} ${r.haftaninGunu}`;
  }
  return r.tekrarSikligi;
}

export default {
  baslik: 'Rutin Hareketler',
  simge: 'takvim',
  async ciz(kap) {
    kap.innerHTML = '<div class="yukleniyor"><div class="yukleniyor-cubuk"></div></div>';
    const yeniden = () => this.ciz(kap);

    const [rutinler, hesaplar] = await Promise.all([
      vt.hepsi('rutinHareketler'), vt.hepsi('bankaHesaplari'),
    ]);
    const hesapAdi = new Map(hesaplar.map(h => [h.id, h.hesapAdi]));

    const satirlar = rutinler
      .filter(r => r.durum !== 'Pasif')
      .sort((a, b) => karsilastir(a.adi, b.adi))
      .map(r => ({ ...r, tekrar: tekrarYazisi(r), hesapAdi: hesapAdi.get(r.hesap) || '—' }));

    kap.innerHTML = `
      <div class="liste-arac">
        <div class="liste-arac-sol"></div>
        <button class="dugme dugme-sade dugme-kucuk" type="button" id="rutin-ekle">
          ${simge('arti')}<span>Rutin ekle</span></button>
      </div>
      <div id="rutin-liste"></div>`;
    kap.querySelector('#rutin-ekle').addEventListener('click', () => rutinDuzenle(null, yeniden));

    liste(kap.querySelector('#rutin-liste'), {
      kayitlar: satirlar,
      simge: 'takvim',
      arananAlanlar: ['adi', 'tekrar', 'hesapAdi'],
      filtreler: [
        { ad: 'Yön', as: 'yon', degerler: ['Gelir', 'Gider'] },
        { ad: 'Sıklık', as: 'tekrarSikligi', degerler: ['Haftalık', 'Aylık', 'Yıllık', 'Özel Kalıp'] },
      ],
      ozet: g => `${g.length} rutin`,
      satirTikla: k => rutinDuzenle(k.id, yeniden),
      bos: {
        baslik: 'Rutin yok',
        yazi: "Her ayın 5'i maaş, 8'i kira gibi tekrar eden hareketleri burada tanımlarsın.",
        dugme: 'Rutin ekle',
        dugmeIslev: () => rutinDuzenle(null, yeniden),
      },
      sutunlar: [
        { ad: 'Adı', as: 'adi', ciz: k => kacir(k.adi), telefonda: 'ust' },
        { ad: 'Tekrar', as: 'tekrar', ciz: k => kacir(k.tekrar), telefonda: 'alt' },
        { ad: 'Hesap', as: 'hesapAdi', ciz: k => kacir(k.hesapAdi), telefonda: 'alt' },
        { ad: 'Tutar', as: 'tutar', hizala: 'sag', telefonda: 'sag',
          ciz: k => `<span class="para ${k.yon === 'Gelir' ? 'arti' : 'eksi'}">${
            k.yon === 'Gelir' ? '+' : '−'}${kacir(paraSimgeli(k.tutar))}</span>` },
        { ad: 'Başlangıç', as: 'baslangicTarihi', ciz: k => kacir(tarih(k.baslangicTarihi)),
          telefonda: 'gizli' },
      ],
    });
  },
};
