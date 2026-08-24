/* Nizam Soft · Kişisel Bütçe — hesaplamalar
 *
 * Tutar her zaman artı sayı olarak saklanır; yönü "Yön" alanı belirler:
 *   Gelir    → hesabı artırır
 *   Gider    → hesabı azaltır
 *   Transfer → hesaptan düşer, Karşı Hesap'a eklenir (ikinci satır yazılmaz)
 *
 * Kredi kartı bakiyesi eksi durur: harcama borcu artırır (daha eksi),
 * bankadan karta yapılan ödeme Transfer olduğu için borcu azaltır.
 */

import * as vt from './vt.js';

export const NAKITE_SAYILAN = ['Banka Hesabı', 'Nakit Cüzdan'];

/** Bir hareketin verilen hesap üstündeki etkisi. */
export function etki(hareket, hesapId) {
  const tutar = Number(hareket.tutar) || 0;
  if (hareket.hesap === hesapId) {
    if (hareket.yon === 'Gelir') return tutar;
    return -tutar;                       // Gider ve Transfer: hesaptan çıkar
  }
  if (hareket.yon === 'Transfer' && hareket.karsiHesap === hesapId) return tutar;
  return 0;
}

/** Hesabın güncel bakiyesi: devir + bütün hareketlerin etkisi. */
export function guncelBakiye(hesap, hareketler) {
  return hareketler.reduce((t, h) => t + etki(h, hesap.id), Number(hesap.devirBakiye) || 0);
}

/**
 * Bir hesabın hareketlerini tarih sırasına dizip her satıra yürüyen bakiye
 * yazar. Bakiye devir tutarından başlar.
 */
export function yuruyenBakiyeliListe(hesap, hareketler) {
  const ilgili = hareketler
    .filter(h => h.hesap === hesap.id || (h.yon === 'Transfer' && h.karsiHesap === hesap.id))
    .sort((a, b) => (a.tarih || '').localeCompare(b.tarih || '') || (a.id > b.id ? 1 : -1));

  let bakiye = Number(hesap.devirBakiye) || 0;
  return ilgili.map(h => {
    const d = etki(h, hesap.id);
    bakiye += d;
    return { ...h, etkiTutar: d, yuruyenBakiye: bakiye };
  });
}

/** Bütün hesapların güncel bakiyesini {hesapId: tutar} olarak verir. */
export async function bakiyeler() {
  const [hesaplar, hareketler] = await Promise.all([
    vt.hepsi('bankaHesaplari'), vt.hepsi('bankaHareketleri'),
  ]);
  const cikti = {};
  for (const h of hesaplar) cikti[h.id] = guncelBakiye(h, hareketler);
  return { hesaplar, hareketler, bakiye: cikti };
}

/* -------------------------------------------------------------- yatırım */

/** Araç araç portföy: elde kalan adet, ortalama maliyet, güncel değer, kâr/zarar. */
export async function portfoy() {
  const [araclar, islemler] = await Promise.all([
    vt.hepsi('yatirimAraclari'), vt.hepsi('yatirimIslemleri'),
  ]);
  const sirali = [...islemler].sort((a, b) => (a.tarih || '').localeCompare(b.tarih || ''));

  const durum = new Map();   // aracId → {adet, maliyet}
  for (const i of sirali) {
    const d = durum.get(i.yatirimAraci) || { adet: 0, maliyet: 0 };
    const adet = Number(i.adet) || 0;
    const fiyat = Number(i.birimFiyat) || 0;
    if (i.islemTuru === 'Alış') {
      d.maliyet += adet * fiyat;
      d.adet += adet;
    } else {
      const ortalama = d.adet ? d.maliyet / d.adet : 0;
      d.maliyet -= ortalama * adet;      // ortalama maliyet yöntemi
      d.adet -= adet;
      if (d.adet < 1e-9) { d.adet = 0; d.maliyet = 0; }
    }
    durum.set(i.yatirimAraci, d);
  }

  return araclar
    .slice()
    .sort((a, b) => new Intl.Collator('tr').compare(a.aracAdi, b.aracAdi))
    .map(arac => {
      const d = durum.get(arac.id) || { adet: 0, maliyet: 0 };
      const guncelFiyat = Number(arac.guncelFiyat) || 0;
      const guncelDeger = d.adet * guncelFiyat;
      return {
        id: arac.id,
        aracAdi: arac.aracAdi,
        birim: arac.birim,
        eldeKalanAdet: d.adet,
        ortalamaMaliyet: d.adet ? d.maliyet / d.adet : 0,
        guncelFiyat,
        guncelDeger,
        karZarar: guncelDeger - d.maliyet,
      };
    })
    .filter(s => s.eldeKalanAdet > 0);
}

/* ---------------------------------------------------------------- panel */

function ayAnahtari(tarihMetni) {
  return String(tarihMetni || '').slice(0, 7);   // "2026-08"
}

/** Bu ayın gider başlığı başına toplamı ve limitleri. */
export async function butceDurumu(ayMetni) {
  const [basliklar, hareketler] = await Promise.all([
    vt.hepsi('giderBasliklari'), vt.hepsi('bankaHareketleri'),
  ]);
  const donem = ayMetni || ayAnahtari(new Date().toISOString());

  const anaBasliklar = basliklar.filter(b => !b.ustBaslik && b.durum === 'Aktif');
  const ustunu = new Map(basliklar.map(b => [b.id, b.ustBaslik || b.id]));

  const harcanan = new Map();
  for (const h of hareketler) {
    if (h.yon !== 'Gider' || !h.giderBasligi) continue;
    if (ayAnahtari(h.tarih) !== donem) continue;
    const ana = ustunu.get(h.giderBasligi) || h.giderBasligi;
    harcanan.set(ana, (harcanan.get(ana) || 0) + (Number(h.tutar) || 0));
  }

  const satirlar = anaBasliklar.map(b => {
    const limit = Number(b.aylikLimit) || 0;
    const gitti = harcanan.get(b.id) || 0;
    return {
      id: b.id,
      baslikAdi: b.baslikAdi,
      aylikLimit: limit,
      harcanan: gitti,
      kalan: limit - gitti,
      doluluk: limit ? Math.round((gitti / limit) * 100) : 0,
      limitAsildi: limit > 0 && gitti > limit,
    };
  });

  const limitliler = satirlar.filter(s => s.aylikLimit > 0);
  return {
    donem,
    satirlar,
    toplamLimit: limitliler.reduce((t, s) => t + s.aylikLimit, 0),
    toplamHarcanan: limitliler.reduce((t, s) => t + s.harcanan, 0),
    toplamKalan: limitliler.reduce((t, s) => t + s.kalan, 0),
    asimVar: satirlar.some(s => s.limitAsildi),
  };
}

/** Panel kartlarının değerleri. */
export async function panelOzeti() {
  const { hesaplar, bakiye } = await bakiyeler();
  const varliklar = await portfoy();
  const butce = await butceDurumu();

  const bankadaki = hesaplar
    .filter(h => NAKITE_SAYILAN.includes(h.hesapTuru) && h.durum === 'Aktif')
    .reduce((t, h) => t + bakiye[h.id], 0);

  const kartBorcu = hesaplar
    .filter(h => h.hesapTuru === 'Kredi Kartı')
    .reduce((t, h) => t + Math.min(0, bakiye[h.id]), 0);   // eksi ya da sıfır

  return {
    bankadakiParam: bankadaki,
    yatirimdakiParam: varliklar.reduce((t, v) => t + v.guncelDeger, 0),
    buAyKalanHarcanabilir: butce.toplamKalan,
    butceAsimUyarisi: butce.asimVar,
    kartBorcu: Math.abs(kartBorcu),
    hesapSayisi: hesaplar.length,
    butce,
  };
}

/* ------------------------------------------------------------ nakit akış */

const GUN_ADLARI = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
const HAFTA_SIRASI = { '1. hafta': 0, '2. hafta': 1, '3. hafta': 2, '4. hafta': 3 };

function gunMetni(t) {
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
}

/** Ayın kaçıncı gününe denk gelirse gelsin, o ayda geçerli günü verir. */
function ayinGunu(yil, ay, gun) {
  const sonGun = new Date(yil, ay + 1, 0).getDate();
  return new Date(yil, ay, Math.min(gun, sonGun));
}

/** "her ayın 2. salısı" gibi kalıbın o aydaki gününü bulur. */
function ayinKacinciGunu(yil, ay, gunAdi, haftaAdi) {
  const hedef = GUN_ADLARI.indexOf(gunAdi);
  if (hedef < 0) return null;
  if (haftaAdi === 'Son hafta') {
    const son = new Date(yil, ay + 1, 0);
    const geri = (son.getDay() - hedef + 7) % 7;
    return new Date(yil, ay, son.getDate() - geri);
  }
  const sira = HAFTA_SIRASI[haftaAdi];
  if (sira === undefined) return null;
  const ilk = new Date(yil, ay, 1);
  const ileri = (hedef - ilk.getDay() + 7) % 7;
  const gun = 1 + ileri + sira * 7;
  return gun > new Date(yil, ay + 1, 0).getDate() ? null : new Date(yil, ay, gun);
}

/** Bir rutin hareketin verilen aralıktaki tarihlerini üretir. */
function rutinTarihleri(rutin, bas, bit) {
  const cikti = [];
  const baslangic = rutin.baslangicTarihi ? new Date(rutin.baslangicTarihi) : bas;
  const bitis = rutin.bitisTarihi ? new Date(rutin.bitisTarihi) : bit;
  const alt = baslangic > bas ? baslangic : bas;
  const ust = bitis < bit ? bitis : bit;
  if (alt > ust) return cikti;

  if (rutin.tekrarSikligi === 'Haftalık') {
    const hedef = GUN_ADLARI.indexOf(rutin.haftaninGunu);
    if (hedef < 0) return cikti;
    const t = new Date(alt);
    t.setDate(t.getDate() + ((hedef - t.getDay() + 7) % 7));
    while (t <= ust) { cikti.push(gunMetni(t)); t.setDate(t.getDate() + 7); }
    return cikti;
  }

  for (let t = new Date(alt.getFullYear(), alt.getMonth(), 1); t <= ust; t.setMonth(t.getMonth() + 1)) {
    const yil = t.getFullYear(); const ay = t.getMonth();
    let gun = null;
    if (rutin.tekrarSikligi === 'Aylık') {
      gun = ayinGunu(yil, ay, Number(rutin.ayinGunu) || 1);
    } else if (rutin.tekrarSikligi === 'Yıllık') {
      if (ay + 1 !== Number(rutin.ayi)) continue;
      gun = ayinGunu(yil, ay, Number(rutin.ayinGunu) || 1);
    } else if (rutin.tekrarSikligi === 'Özel Kalıp') {
      gun = ayinKacinciGunu(yil, ay, rutin.haftaninGunu, rutin.ayinHaftasi);
    }
    if (gun && gun >= alt && gun <= ust) cikti.push(gunMetni(gun));
  }
  return cikti;
}

/**
 * İleriye dönük nakit akış satırları. Üç kaynaktan beslenir:
 * Rutin Hareketler, Aktif Abonelikler ve kredi kartlarının son ödeme günleri.
 * Gerçekleşen banka hareketiyle eşleşen satır "Gerçekleşti" olur.
 */
export async function nakitAkis(ayIleri = 6) {
  const [rutinler, abonelikler, hesaplar, hareketler] = await Promise.all([
    vt.hepsi('rutinHareketler'), vt.hepsi('abonelikler'),
    vt.hepsi('bankaHesaplari'), vt.hepsi('bankaHareketleri'),
  ]);

  const bugunT = new Date(); bugunT.setHours(0, 0, 0, 0);
  const bas = new Date(bugunT.getFullYear(), bugunT.getMonth(), 1);
  const bit = new Date(bugunT.getFullYear(), bugunT.getMonth() + ayIleri, 0);

  const satirlar = [];

  for (const r of rutinler.filter(r => r.durum === 'Aktif')) {
    for (const tarih of rutinTarihleri(r, bas, bit)) {
      satirlar.push({
        id: `rutin:${r.id}:${tarih}`, tarih, adi: r.adi, kaynak: 'Rutin Hareket',
        yon: r.yon, tahminiTutar: Number(r.tutar) || 0, hesap: r.hesap,
      });
    }
  }

  for (const a of abonelikler.filter(a => a.durum === 'Aktif')) {
    for (let t = new Date(bas); t <= bit; t.setMonth(t.getMonth() + 1)) {
      const gun = ayinGunu(t.getFullYear(), t.getMonth(), Number(a.odemeGunu) || 1);
      if (gun < bas || gun > bit) continue;
      satirlar.push({
        id: `abonelik:${a.id}:${gunMetni(gun)}`, tarih: gunMetni(gun),
        adi: a.abonelikAdi, kaynak: 'Abonelik', yon: 'Gider',
        tahminiTutar: Number(a.aylikTutar) || 0, hesap: a.odendigiHesap,
      });
    }
  }

  for (const k of hesaplar.filter(h => h.hesapTuru === 'Kredi Kartı' && h.durum === 'Aktif' && h.sonOdemeGunu)) {
    const borc = Math.abs(Math.min(0, guncelBakiye(k, hareketler)));
    for (let t = new Date(bas); t <= bit; t.setMonth(t.getMonth() + 1)) {
      const gun = ayinGunu(t.getFullYear(), t.getMonth(), Number(k.sonOdemeGunu));
      if (gun < bas || gun > bit) continue;
      satirlar.push({
        id: `kart:${k.id}:${gunMetni(gun)}`, tarih: gunMetni(gun),
        adi: k.hesapAdi + ' son ödeme', kaynak: 'Kredi Kartı Ödemesi', yon: 'Gider',
        tahminiTutar: borc, hesap: k.id,
      });
    }
  }

  /* Gerçekleşme: aynı ay içinde, aynı yönde, tutarı yakın bir hareket varsa
     satır tahminden gerçekleşene döner. */
  const kullanilan = new Set();
  for (const s of satirlar) {
    const eslesen = hareketler.find(h =>
      !kullanilan.has(h.id) &&
      String(h.tarih || '').slice(0, 7) === s.tarih.slice(0, 7) &&
      ((s.kaynak === 'Kredi Kartı Ödemesi' && h.yon === 'Transfer' && h.karsiHesap === s.hesap) ||
       (s.kaynak !== 'Kredi Kartı Ödemesi' && h.yon === s.yon &&
        Math.abs((Number(h.tutar) || 0) - s.tahminiTutar) <= s.tahminiTutar * 0.02)));
    if (eslesen) {
      kullanilan.add(eslesen.id);
      s.durum = 'Gerçekleşti';
      s.gerceklesenTutar = Number(eslesen.tutar) || 0;
    } else {
      s.durum = 'Tahmini';
      s.gerceklesenTutar = null;
    }
  }

  satirlar.sort((a, b) => a.tarih.localeCompare(b.tarih));

  /* Tahmini bakiye: bugünkü nakit varlıktan başlayıp satır satır yürür. */
  const nakit = hesaplar
    .filter(h => NAKITE_SAYILAN.includes(h.hesapTuru) && h.durum === 'Aktif')
    .reduce((t, h) => t + guncelBakiye(h, hareketler), 0);
  let yuruyen = nakit;
  for (const s of satirlar) {
    const tutar = s.gerceklesenTutar ?? s.tahminiTutar;
    yuruyen += s.yon === 'Gelir' ? tutar : -tutar;
    s.tahminiBakiye = yuruyen;
  }

  return satirlar;
}

/** Panel grafiği: gelecek N ayın gelir ve gider toplamı. */
export async function gelecekAylar(aySayisi = 2) {
  const satirlar = await nakitAkis(aySayisi);
  const bugunT = new Date();
  const aylar = [];
  for (let i = 0; i < aySayisi; i++) {
    const t = new Date(bugunT.getFullYear(), bugunT.getMonth() + i, 1);
    aylar.push({
      anahtar: `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}`,
      gelir: 0, gider: 0,
    });
  }
  for (const s of satirlar) {
    const ay = aylar.find(a => a.anahtar === s.tarih.slice(0, 7));
    if (!ay) continue;
    const tutar = s.gerceklesenTutar ?? s.tahminiTutar;
    if (s.yon === 'Gelir') ay.gelir += tutar; else ay.gider += tutar;
  }
  return aylar;
}
