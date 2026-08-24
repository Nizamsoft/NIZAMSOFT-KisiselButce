/* Nizam Soft · Kişisel Bütçe — rapor hesapları
   Raporlar salt okunurdur; buradaki işlevler kayıtlardan türetir.
   Transfer hareketleri gelir/gider raporlarına GİRMEZ. */

import * as vt from './vt.js';
import { bakiyeler, portfoy, butceDurumu, NAKITE_SAYILAN, guncelBakiye } from './hesap.js';
import { karsilastir } from './bicim.js';

export function ayAnahtari(tarihMetni) {
  return String(tarihMetni || '').slice(0, 7);
}

export function buAy() {
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}`;
}

/** Başlık ağacını "ana → altlar" biçiminde çözer. */
async function baslikAgaci(tablo) {
  const hepsi = await vt.hepsi(tablo);
  const ad = new Map(hepsi.map(b => [b.id, b.baslikAdi]));
  const ustu = new Map(hepsi.map(b => [b.id, b.ustBaslik || null]));
  return { hepsi, ad, ustu, anaBul: id => ustu.get(id) || id };
}

/**
 * Gelir ya da gider raporu: seçilen aydaki hareketleri ana başlık altında
 * toplar, her ana başlığın altında alt başlıkları ve onların hareketlerini verir.
 */
export async function basliklaRapor(yon, donem) {
  const tablo = yon === 'Gelir' ? 'gelirBasliklari' : 'giderBasliklari';
  const alan = yon === 'Gelir' ? 'gelirBasligi' : 'giderBasligi';
  const [{ ad, ustu, anaBul, hepsi }, hareketler, hesaplar] = await Promise.all([
    baslikAgaci(tablo), vt.hepsi('bankaHareketleri'), vt.hepsi('bankaHesaplari'),
  ]);
  const kartHesaplari = new Set(
    hesaplar.filter(h => h.hesapTuru === 'Kredi Kartı').map(h => h.id));

  const ilgili = hareketler.filter(h =>
    h.yon === yon && ayAnahtari(h.tarih) === donem);   // Transfer kendiliğinden dışarıda

  /* ana başlık → { toplam, altlar: Map(altId → {toplam, hareketler}) } */
  const analar = new Map();
  const kartHarcamalari = [];

  for (const h of ilgili) {
    if (yon === 'Gider' && kartHesaplari.has(h.hesap)) kartHarcamalari.push(h);

    const baslikId = h[alan];
    const anaId = baslikId ? anaBul(baslikId) : '__basliksiz__';
    if (!analar.has(anaId)) analar.set(anaId, { toplam: 0, sayi: 0, altlar: new Map() });
    const ana = analar.get(anaId);
    ana.toplam += Number(h.tutar) || 0;
    ana.sayi++;

    const altId = baslikId && ustu.get(baslikId) ? baslikId : '__dogrudan__';
    if (!ana.altlar.has(altId)) ana.altlar.set(altId, { toplam: 0, hareketler: [] });
    const alt = ana.altlar.get(altId);
    alt.toplam += Number(h.tutar) || 0;
    alt.hareketler.push(h);
  }

  const limitler = new Map(hepsi.map(b => [b.id, Number(b.aylikLimit) || 0]));

  const satirlar = [...analar.entries()].map(([anaId, v]) => ({
    id: anaId,
    baslikAdi: anaId === '__basliksiz__' ? 'Başlıksız' : (ad.get(anaId) || 'Bilinmeyen'),
    basliksiz: anaId === '__basliksiz__',
    tutar: v.toplam,
    hareketSayisi: v.sayi,
    aylikLimit: limitler.get(anaId) || 0,
    limitAsildi: (limitler.get(anaId) || 0) > 0 && v.toplam > limitler.get(anaId),
    altlar: [...v.altlar.entries()].map(([altId, a]) => ({
      id: altId,
      baslikAdi: altId === '__dogrudan__' ? 'Doğrudan bu başlığa' : (ad.get(altId) || '—'),
      tutar: a.toplam,
      hareketler: a.hareketler.sort((x, y) => (y.tarih || '').localeCompare(x.tarih || '')),
    })).sort((a, b) => b.tutar - a.tutar),
  })).sort((a, b) => b.tutar - a.tutar);

  return {
    donem,
    satirlar,
    toplam: satirlar.reduce((t, s) => t + s.tutar, 0),
    kartHarcamalari: kartHarcamalari.sort((a, b) => (b.tarih || '').localeCompare(a.tarih || '')),
    kartToplami: kartHarcamalari.reduce((t, h) => t + (Number(h.tutar) || 0), 0),
  };
}

/** Gelirler raporu ay ay gösterilir; hangi ayların verisi var? */
export async function veriOlanAylar(yon) {
  const hareketler = await vt.hepsi('bankaHareketleri');
  const aylar = new Set(hareketler.filter(h => h.yon === yon).map(h => ayAnahtari(h.tarih)));
  return [...aylar].filter(Boolean).sort().reverse();
}

/**
 * "Bu Ay N'oldu": ay başındaki varlıktan ay sonundakine giden yol.
 * Toplam varlık = banka + nakit + yatırımların güncel değeri − kart borcu.
 */
export async function buAyNoldu(donem) {
  const [{ hesaplar, hareketler, yatirimTurleri }, varliklar, islemler] = await Promise.all([
    bakiyeler(), portfoy(), vt.hepsi('yatirimIslemleri'),
  ]);

  const ayBasi = donem + '-01';
  const sonrakiAy = new Date(Number(donem.slice(0, 4)), Number(donem.slice(5, 7)), 1);
  const ayBitisi = `${sonrakiAy.getFullYear()}-${String(sonrakiAy.getMonth() + 1).padStart(2, '0')}-01`;

  const oncekiler = hareketler.filter(h => (h.tarih || '') < ayBasi);
  const buAykiler = hareketler.filter(h => (h.tarih || '') >= ayBasi && (h.tarih || '') < ayBitisi);

  function nakitVarlik(liste) {
    return hesaplar
      .filter(h => NAKITE_SAYILAN.includes(h.hesapTuru))
      .reduce((t, h) => t + guncelBakiye(h, liste, yatirimTurleri), 0);
  }
  function kartBorcu(liste) {
    return hesaplar
      .filter(h => h.hesapTuru === 'Kredi Kartı')
      .reduce((t, h) => t + Math.min(0, guncelBakiye(h, liste, yatirimTurleri)), 0);
  }

  /* Yatırımın ay başındaki değeri: o güne kadarki adet × güncel fiyat.
     Geçmiş fiyat tutulmadığı için güncel fiyat kullanılır. */
  const araclar = await vt.hepsi('yatirimAraclari');
  const fiyat = new Map(araclar.map(a => [a.id, Number(a.guncelFiyat) || 0]));
  function yatirimDegeri(tariheKadar) {
    const adet = new Map();
    for (const i of islemler) {
      if ((i.tarih || '') >= tariheKadar) continue;
      const d = adet.get(i.yatirimAraci) || 0;
      adet.set(i.yatirimAraci, i.islemTuru === 'Alış' ? d + Number(i.adet) : d - Number(i.adet));
    }
    let toplam = 0;
    for (const [aracId, a] of adet) if (a > 0) toplam += a * (fiyat.get(aracId) || 0);
    return toplam;
  }

  const ayBasiVarlik = nakitVarlik(oncekiler) + kartBorcu(oncekiler) + yatirimDegeri(ayBasi);
  const toplamGelir = buAykiler.filter(h => h.yon === 'Gelir')
    .reduce((t, h) => t + (Number(h.tutar) || 0), 0);
  const toplamGider = buAykiler.filter(h => h.yon === 'Gider')
    .reduce((t, h) => t + (Number(h.tutar) || 0), 0);

  /* Yatırım kâr/zararı: bu ay SATILANLARDAN doğan gerçekleşmiş kâr.
     Elde duranın değer değişimi ay sonu varlığın içinde zaten görünür. */
  const yatirimKarZarar = islemler
    .filter(i => ayAnahtari(i.tarih) === donem && i.islemTuru === 'Satış')
    .reduce((t, i) => t + (Number(i.karZarar) || 0), 0);

  const ayBitmis = ayBitisi <= new Date().toISOString().slice(0, 10);
  const aySonuHareketler = ayBitmis ? hareketler.filter(h => (h.tarih || '') < ayBitisi) : hareketler;
  const aySonuYatirim = ayBitmis
    ? yatirimDegeri(ayBitisi)
    : varliklar.reduce((t, v) => t + v.guncelDeger, 0);

  const aySonuVarlik = nakitVarlik(aySonuHareketler) + kartBorcu(aySonuHareketler) + aySonuYatirim;

  return {
    donem,
    ayBasiVarlik,
    toplamGelir,
    toplamGider,
    yatirimKarZarar,
    aySonuVarlik,
    fark: aySonuVarlik - ayBasiVarlik,
  };
}

export { butceDurumu };
