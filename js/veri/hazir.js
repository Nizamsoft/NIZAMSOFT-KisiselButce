/* Nizam Soft · Kişisel Bütçe — kurulurken yüklenecek hazır veri
   Künyedeki listelerin birebir karşılığı. Kullanıcı sonradan ekleyip
   çıkarabilir; bu yüzden yalnız ilk kurulumda bir kez yüklenir. */

import * as vt from './vt.js';

const GELIR_BASLIKLARI = [
  ['Maaş', []],
  ['Ek Gelir', ['Prim', 'Freelance']],
  ['Kira Geliri', []],
  ['Yatırım Getirisi', ['Faiz', 'Temettü']],
  ['Borç Tahsilatı', []],
  ['Hediye/Yardım', []],
  ['Diğer Gelir', []],
];

const GIDER_BASLIKLARI = [
  ['Konut', ['Kira', 'Aidat', 'Elektrik', 'Su', 'Doğalgaz', 'İnternet']],
  ['Market', ['Market Alışverişi', 'Manav-Kasap']],
  ['Ulaşım', ['Yakıt', 'Toplu Taşıma', 'Otopark', 'Araç Bakım']],
  ['Aile Harcaması', ['Okul', 'Çocuk', 'Bakım']],
  ['Sağlık', ['İlaç', 'Doktor', 'Sigorta']],
  ['Yeme-İçme', ['Restoran', 'Kafe']],
  ['Giyim', []],
  ['Abonelikler', []],
  ['Eğlence', []],
  ['Borç ve Kredi', ['Kredi Taksiti', 'Kredi Kartı Faizi']],
  ['Vergi ve Harç', []],
  ['Diğer Gider', []],
];

const YATIRIM_ARACLARI = [
  ['Gram Altın', 'Gram'],
  ['Çeyrek Altın', 'Adet'],
  ['Yarım Altın', 'Adet'],
  ['Tam Altın', 'Adet'],
  ['Cumhuriyet Altını', 'Adet'],
  ['Ons Altın', 'Adet'],
  ['Gram Gümüş', 'Gram'],
  ['Dolar', 'Dolar'],
  ['Euro', 'Euro'],
  ['Sterlin', 'Adet'],
  ['Hisse Senedi', 'Lot'],
  ['Yatırım Fonu', 'Adet'],
  ['Kripto Para', 'Adet'],
];

async function basliklariYukle(tablo, liste) {
  if (await vt.sayi(tablo)) return 0;
  let eklenen = 0;
  for (const [ana, altlar] of liste) {
    const ustId = await vt.ekle(tablo, { baslikAdi: ana, ustBaslik: null, durum: 'Aktif' });
    eklenen++;
    for (const alt of altlar) {
      await vt.ekle(tablo, { baslikAdi: alt, ustBaslik: ustId, durum: 'Aktif' });
      eklenen++;
    }
  }
  return eklenen;
}

async function araclariYukle() {
  if (await vt.sayi('yatirimAraclari')) return 0;
  for (const [aracAdi, birim] of YATIRIM_ARACLARI) {
    await vt.ekle('yatirimAraclari', {
      aracAdi, birim, guncelFiyat: null, guncelFiyatTarihi: null, durum: 'Aktif',
    });
  }
  return YATIRIM_ARACLARI.length;
}

/** Boş tabloları hazır veriyle doldurur. Doluysa hiçbir şey yapmaz. */
export async function hazirVeriYukle() {
  const sonuc = {
    gelirBasliklari: await basliklariYukle('gelirBasliklari', GELIR_BASLIKLARI),
    giderBasliklari: await basliklariYukle('giderBasliklari', GIDER_BASLIKLARI),
    yatirimAraclari: await araclariYukle(),
  };
  return sonuc;
}
