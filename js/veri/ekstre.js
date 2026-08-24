/* Nizam Soft · Kişisel Bütçe — Excel ekstre okuma
 *
 * Program dosyayı kendi tanır: sütunları başlık adlarından bulur, kullanıcıya
 * eşleştirme sordurmaz. Mükerrer kayıt DEKONT NO ile engellenir.
 * Dosya tarayıcıda okunur, hiçbir yere gönderilmez.
 */

import { xlsxYukle } from '../vendor.js';
import { sadelestir, paraCoz } from './bicim.js';

/* Bankaların ekstrelerinde bu sütun adları geçer. Sadeleştirilmiş hâlleriyle
   karşılaştırılır (büyük/küçük harf ve Türkçe karakter farkı önemsenmez). */
const SUTUN_ADLARI = {
  tarih:     ['tarih', 'islem tarihi', 'işlem tarihi', 'valor', 'valör', 'valor tarihi', 'date'],
  aciklama:  ['aciklama', 'açıklama', 'islem aciklamasi', 'işlem açıklaması', 'detay',
              'aciklama detay', 'islem', 'işlem', 'description'],
  tutar:     ['tutar', 'islem tutari', 'işlem tutarı', 'miktar', 'amount'],
  borc:      ['borc', 'borç', 'cikis', 'çıkış', 'gider', 'debit'],
  alacak:    ['alacak', 'giris', 'giriş', 'gelir', 'credit'],
  bakiye:    ['bakiye', 'kalan', 'balance'],
  dekontNo:  ['dekont no', 'dekontno', 'dekont numarasi', 'dekont numarası', 'fis no', 'fiş no',
              'islem no', 'işlem no', 'referans', 'referans no', 'kayit no', 'kayıt no'],
};

/** Bir başlık satırındaki sütunları tanır; {alan: sütunIndeksi} döndürür. */
function sutunlariTani(basliklar) {
  const bulunan = {};
  basliklar.forEach((ham, i) => {
    const s = sadelestir(ham);
    if (!s) return;
    for (const [alan, adlar] of Object.entries(SUTUN_ADLARI)) {
      if (bulunan[alan] !== undefined) continue;
      if (adlar.some(a => s === a || s.startsWith(a + ' ') || s.endsWith(' ' + a))) {
        bulunan[alan] = i;
      }
    }
  });
  return bulunan;
}

/** Başlık satırını bulur: tarih ve (tutar ya da borç/alacak) içeren ilk satır. */
function baslikSatiriniBul(satirlar) {
  for (let i = 0; i < Math.min(satirlar.length, 25); i++) {
    const s = sutunlariTani(satirlar[i].map(h => String(h ?? '')));
    if (s.tarih !== undefined && (s.tutar !== undefined || s.borc !== undefined || s.alacak !== undefined)) {
      return { satir: i, sutunlar: s };
    }
  }
  return null;
}

/** Excel hücresindeki tarihi "2026-08-06" biçimine çevirir. */
function tariheCevir(deger) {
  if (deger === null || deger === undefined || deger === '') return null;
  if (deger instanceof Date && !Number.isNaN(deger.getTime())) {
    return `${deger.getFullYear()}-${String(deger.getMonth() + 1).padStart(2, '0')}-${String(deger.getDate()).padStart(2, '0')}`;
  }
  const metin = String(deger).trim();
  /* 06.08.2026 · 06/08/2026 · 06-08-2026 */
  const gay = metin.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})/);
  if (gay) return `${gay[3]}-${gay[2].padStart(2, '0')}-${gay[1].padStart(2, '0')}`;
  /* 2026-08-06 */
  const yag = metin.match(/^(\d{4})[./-](\d{1,2})[./-](\d{1,2})/);
  if (yag) return `${yag[1]}-${yag[2].padStart(2, '0')}-${yag[3].padStart(2, '0')}`;
  return null;
}

/**
 * Excel dosyasını okur ve satırları çıkarır.
 * @returns {Promise<{satirlar:Array, taninan:object, toplam:number, atlanan:number}>}
 *   satır: {tarih, aciklama, tutar, yon:'Gelir'|'Gider', dekontNo}
 */
export async function ekstreOku(dosya) {
  const XLSX = await xlsxYukle();
  const veri = await dosya.arrayBuffer();
  const kitap = XLSX.read(veri, { cellDates: true });
  const sayfa = kitap.Sheets[kitap.SheetNames[0]];
  if (!sayfa) throw new Error('Excel dosyasında sayfa bulunamadı.');

  const ham = XLSX.utils.sheet_to_json(sayfa, { header: 1, raw: false, dateNF: 'yyyy-mm-dd', defval: '' });
  const baslik = baslikSatiriniBul(ham);
  if (!baslik) {
    throw new Error('Dosyada tarih ve tutar sütunları bulunamadı. ' +
                    'Bankandan indirdiğin ekstreyi olduğu gibi yüklediğinden emin ol.');
  }

  const s = baslik.sutunlar;
  const satirlar = [];
  let atlanan = 0;

  for (let i = baslik.satir + 1; i < ham.length; i++) {
    const r = ham[i];
    if (!r || !r.length) continue;

    const tarih = tariheCevir(r[s.tarih]);
    if (!tarih) { atlanan++; continue; }

    let tutar = null;
    if (s.tutar !== undefined) tutar = paraCoz(r[s.tutar]);
    if (tutar === null && s.borc !== undefined) {
      const borc = paraCoz(r[s.borc]);
      if (borc) tutar = -Math.abs(borc);
    }
    if (tutar === null && s.alacak !== undefined) {
      const alacak = paraCoz(r[s.alacak]);
      if (alacak) tutar = Math.abs(alacak);
    }
    if (tutar === null || tutar === 0) { atlanan++; continue; }

    const aciklama = String(r[s.aciklama] ?? '').trim() || 'Açıklama yok';
    const dekontNo = s.dekontNo !== undefined ? String(r[s.dekontNo] ?? '').trim() : '';

    satirlar.push({
      tarih,
      aciklama,
      tutar: Math.abs(tutar),
      yon: tutar < 0 ? 'Gider' : 'Gelir',   // eksiyse gider, artıysa gelir
      dekontNo: dekontNo || null,
    });
  }

  return {
    satirlar,
    taninan: Object.keys(s),
    toplam: satirlar.length + atlanan,
    atlanan,
  };
}

/**
 * Başlık tahmini: aynı açıklama daha önce bir başlığa atanmışsa onu önerir.
 * Açıklamalar sadeleştirilip ilk üç kelimesine bakılır (banka açıklamalarında
 * sonda değişen numaralar olur).
 */
export function tahminEdici(gecmisHareketler) {
  const gelir = new Map();
  const gider = new Map();

  const anahtar = a => sadelestir(a).split(/\s+/).slice(0, 3).join(' ');

  for (const h of gecmisHareketler) {
    if (h.yon === 'Gelir' && h.gelirBasligi) {
      const k = anahtar(h.aciklama);
      gelir.set(k, (gelir.get(k) || new Map()));
      gelir.get(k).set(h.gelirBasligi, (gelir.get(k).get(h.gelirBasligi) || 0) + 1);
    } else if (h.yon === 'Gider' && h.giderBasligi) {
      const k = anahtar(h.aciklama);
      gider.set(k, (gider.get(k) || new Map()));
      gider.get(k).set(h.giderBasligi, (gider.get(k).get(h.giderBasligi) || 0) + 1);
    }
  }

  const encok = m => m ? [...m.entries()].sort((a, b) => b[1] - a[1])[0][0] : null;

  return (aciklama, yon) => encok((yon === 'Gelir' ? gelir : gider).get(anahtar(aciklama)));
}

/**
 * Abonelik eşleştirmesi. Açıklamada abonelik adı geçiyor ve tutar yakınsa
 * eşleşme sayılır. Emin olunamayan durumda null döner — sihirbaz kullanıcıya sorar.
 */
export function abonelikEslestir(abonelikler) {
  const aktif = abonelikler.filter(a => a.durum !== 'Pasif')
    .map(a => ({ ...a, sade: sadelestir(a.abonelikAdi) }))
    .filter(a => a.sade.length >= 3);

  return (aciklama, tutar) => {
    const s = sadelestir(aciklama);
    const adayla = aktif.filter(a => s.includes(a.sade));
    if (adayla.length !== 1) return null;              // hiç yoksa ya da birden çoksa emin değiliz
    const a = adayla[0];
    const fark = Math.abs((Number(a.aylikTutar) || 0) - tutar);
    const yakin = fark <= Math.max(1, (Number(a.aylikTutar) || 0) * 0.05);
    return { abonelik: a, kesin: yakin };
  };
}
