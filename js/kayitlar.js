/* Nizam Soft · Kişisel Bütçe — kayıt işlemleri
 *
 * Ekleme ve düzenleme ortada pencerede yapılır. Modül kuralları burada
 * uygulanır:
 *   · Hesaba işlenmiş hareket SİLİNEMEZ; yalnız başlığı ve açıklaması değişir.
 *   · Tanım listeleri silinmez, Pasif'e alınır.
 *   · Aylık bütçe limiti yalnız ANA gider başlığına girilir.
 *   · Son ödeme günü yalnız kredi kartında tutulur.
 *   · Yön = Transfer ise başlık değil Karşı Hesap doldurulur.
 */

import * as vt from './veri/vt.js';
import { form } from './form.js';
import { pencereAc, onayla, bildir } from './pencere.js';
import { simge } from './simge.js';
import { para, paraSimgeli, tarih, tarihSaat, bugun, karsilastir, kacir } from './veri/bicim.js';

/** İlişki alanı için seçenek listesi. */
async function secenekler(tablo, adAlani, suz = () => true) {
  return (await vt.hepsi(tablo))
    .filter(k => k.durum !== 'Pasif' && suz(k))
    .sort((a, b) => karsilastir(a[adAlani], b[adAlani]))
    .map(k => ({ id: k.id, ad: k[adAlani] }));
}

/** Ağaç başlıkları "Ana → Alt" biçiminde tek listeye serer. */
async function baslikSecenekleri(tablo) {
  const hepsi = (await vt.hepsi(tablo)).filter(b => b.durum !== 'Pasif');
  const analar = hepsi.filter(b => !b.ustBaslik).sort((a, b) => karsilastir(a.baslikAdi, b.baslikAdi));
  const cikti = [];
  for (const ana of analar) {
    cikti.push({ id: ana.id, ad: ana.baslikAdi });
    hepsi.filter(b => b.ustBaslik === ana.id)
      .sort((a, b) => karsilastir(a.baslikAdi, b.baslikAdi))
      .forEach(alt => cikti.push({ id: alt.id, ad: `${ana.baslikAdi} → ${alt.baslikAdi}` }));
  }
  return cikti;
}

/* ------------------------------------------------------------ hesaplar */

export async function hesapDuzenle(id, sonra) {
  const mevcut = id ? await vt.oku('bankaHesaplari', id) : null;
  const govde = form({
    deger: mevcut || { hesapTuru: 'Banka Hesabı', durum: 'Aktif', devirTarihi: bugun() },
    kaydetYazisi: mevcut ? 'Değişikliği kaydet' : 'Hesabı ekle',
    ikinciDugme: mevcut && mevcut.durum === 'Aktif' ? {
      yazi: 'Pasife al', simge: 'kapat', tehlikeli: true,
      islev: () => pasifYap('bankaHesaplari', mevcut.id, mevcut.hesapAdi, sonra),
    } : null,
    alanlar: [
      { ad: 'Hesap Adı', as: 'hesapAdi', tur: 'Metin', zorunlu: true },
      { ad: 'Hesap Türü', as: 'hesapTuru', tur: 'Seçenek', zorunlu: true,
        degerler: ['Banka Hesabı', 'Nakit Cüzdan', 'Kredi Kartı'] },
      { ad: 'Banka Adı', as: 'bankaAdi', tur: 'Metin',
        gorunur: d => d.hesapTuru !== 'Nakit Cüzdan' },
      { ad: 'Devir Bakiye', as: 'devirBakiye', tur: 'Para', zorunlu: true,
        ipucu: 'Programa başlarken bu hesapta duran para. Kredi kartında borcunu eksi yaz: -8.000' },
      { ad: 'Devir Tarihi', as: 'devirTarihi', tur: 'Tarih', zorunlu: true },
      { ad: 'Son Ödeme Günü', as: 'sonOdemeGunu', tur: 'Sayı',
        gorunur: d => d.hesapTuru === 'Kredi Kartı',
        ipucu: 'Ayın kaçı? Nakit akışında bu gün görünür.' },
      { ad: 'Durum', as: 'durum', tur: 'Seçenek', zorunlu: true, degerler: ['Aktif', 'Pasif'] },
    ],
    async kaydet(d) {
      if (d.hesapTuru === 'Kredi Kartı' && d.sonOdemeGunu !== null &&
          (d.sonOdemeGunu < 1 || d.sonOdemeGunu > 31)) {
        throw new Error('Son ödeme günü 1 ile 31 arasında olmalı.');
      }
      if (d.hesapTuru !== 'Kredi Kartı') d.sonOdemeGunu = null;
      if (d.hesapTuru === 'Nakit Cüzdan') d.bankaAdi = null;
      if (mevcut) await vt.guncelle('bankaHesaplari', mevcut.id, d);
      else await vt.ekle('bankaHesaplari', d);
      kapat();
      bildir(mevcut ? 'Hesap güncellendi.' : 'Hesap eklendi.', 'basari');
      sonra?.();
    },
  });
  const { kapat } = pencereAc({ baslik: mevcut ? 'Hesabı düzenle' : 'Yeni hesap', govde });
}

/* ------------------------------------------------------------ hareketler */

/** Elle yeni hareket. Ekstreden gelenler sihirbazla girilir. */
export async function hareketEkle(onSecili, sonra) {
  const hesaplar = await secenekler('bankaHesaplari', 'hesapAdi');
  if (!hesaplar.length) {
    bildir('Önce bir hesap tanımlaman gerek.', 'tehlike');
    return;
  }
  const [gelirB, giderB] = await Promise.all([
    baslikSecenekleri('gelirBasliklari'), baslikSecenekleri('giderBasliklari'),
  ]);

  const govde = form({
    deger: { yon: onSecili?.yon || 'Gider', tarih: bugun(), hesap: onSecili?.hesap || hesaplar[0].id },
    kaydetYazisi: 'Hareketi ekle',
    alanlar: [
      { ad: 'Yön', as: 'yon', tur: 'Seçenek', zorunlu: true, degerler: ['Gelir', 'Gider', 'Transfer'] },
      { ad: 'Hesap', as: 'hesap', tur: 'İlişki', zorunlu: true, secenekler: hesaplar,
        ipucu: 'Paranın çıktığı ya da girdiği hesap.' },
      { ad: 'Tarih', as: 'tarih', tur: 'Tarih', zorunlu: true },
      { ad: 'Açıklama', as: 'aciklama', tur: 'Metin', zorunlu: true },
      { ad: 'Tutar', as: 'tutar', tur: 'Para', zorunlu: true },
      { ad: 'Gelir Başlığı', as: 'gelirBasligi', tur: 'İlişki', zorunlu: true, secenekler: gelirB,
        gorunur: d => d.yon === 'Gelir' },
      { ad: 'Gider Başlığı', as: 'giderBasligi', tur: 'İlişki', zorunlu: true, secenekler: giderB,
        gorunur: d => d.yon === 'Gider' },
      { ad: 'Karşı Hesap', as: 'karsiHesap', tur: 'İlişki', zorunlu: true, secenekler: hesaplar,
        gorunur: d => d.yon === 'Transfer',
        ipucu: 'Paranın gittiği yer. Bankadan nakit çekme ya da karta ödeme burada.' },
    ],
    async kaydet(d) {
      if (d.tutar <= 0) throw new Error('Tutar sıfırdan büyük olmalı.');
      if (d.yon === 'Transfer' && d.hesap === d.karsiHesap) {
        throw new Error('Karşı hesap, hesabın kendisi olamaz.');
      }
      await vt.ekle('bankaHareketleri', {
        hesap: d.hesap, tarih: d.tarih, aciklama: d.aciklama, tutar: d.tutar, yon: d.yon,
        gelirBasligi: d.yon === 'Gelir' ? d.gelirBasligi : null,
        giderBasligi: d.yon === 'Gider' ? d.giderBasligi : null,
        karsiHesap: d.yon === 'Transfer' ? d.karsiHesap : null,
        dekontNo: null, bagliAbonelik: null, bagliYatirimIslemi: null,
        ekstreYuklemesi: null, girisSekli: 'Elle',
      });
      kapat();
      bildir('Hareket eklendi.', 'basari');
      sonra?.();
    },
  });
  const { kapat } = pencereAc({ baslik: 'Yeni hareket', govde });
}

/** Hareket düzenleme: modül kuralı gereği YALNIZ başlık ve açıklama değişir. */
export async function hareketDuzenle(id, sonra) {
  const h = await vt.oku('bankaHareketleri', id);
  if (!h) return;
  const [gelirB, giderB] = await Promise.all([
    baslikSecenekleri('gelirBasliklari'), baslikSecenekleri('giderBasliklari'),
  ]);

  const govde = form({
    deger: h,
    kaydetYazisi: 'Değişikliği kaydet',
    alanlar: [
      { ad: 'Açıklama', as: 'aciklama', tur: 'Metin', zorunlu: true },
      { ad: 'Gelir Başlığı', as: 'gelirBasligi', tur: 'İlişki', zorunlu: true, secenekler: gelirB,
        gorunur: () => h.yon === 'Gelir' },
      { ad: 'Gider Başlığı', as: 'giderBasligi', tur: 'İlişki', zorunlu: true, secenekler: giderB,
        gorunur: () => h.yon === 'Gider' },
    ],
    async kaydet(d) {
      await vt.guncelle('bankaHareketleri', id, {
        aciklama: d.aciklama,
        gelirBasligi: h.yon === 'Gelir' ? d.gelirBasligi : null,
        giderBasligi: h.yon === 'Gider' ? d.giderBasligi : null,
      });
      kapat();
      bildir('Hareket güncellendi.', 'basari');
      sonra?.();
    },
  });

  const bilgi = document.createElement('div');
  bilgi.className = 'kart kart-serit duzenleme-not';
  bilgi.innerHTML = `
    <dl>
      <div class="satir-cift"><dt>Tarih</dt><dd>${kacir(tarih(h.tarih))}</dd></div>
      <div class="satir-cift"><dt>Tutar</dt><dd>${kacir(paraSimgeli(h.tutar))}</dd></div>
      <div class="satir-cift"><dt>Yön</dt><dd>${kacir(h.yon)}</dd></div>
    </dl>
    <p class="silik">Tarih, tutar ve yön değiştirilemez. Yanlışsa bu yüklemeyi
    tümüyle geri alıp yeniden yükle.</p>`;
  const sarmal = document.createElement('div');
  sarmal.append(bilgi, govde);
  const { kapat } = pencereAc({ baslik: 'Hareketi düzenle', govde: sarmal });
}

/* ------------------------------------------------------------- başlıklar */

export async function baslikDuzenle(tablo, id, sonra) {
  const limitli = tablo === 'giderBasliklari';
  const mevcut = id ? await vt.oku(tablo, id) : null;
  const analar = (await vt.hepsi(tablo))
    .filter(b => !b.ustBaslik && b.durum !== 'Pasif' && b.id !== id)
    .sort((a, b) => karsilastir(a.baslikAdi, b.baslikAdi))
    .map(b => ({ id: b.id, ad: b.baslikAdi }));

  const govde = form({
    deger: mevcut || { durum: 'Aktif' },
    kaydetYazisi: mevcut ? 'Değişikliği kaydet' : 'Başlığı ekle',
    ikinciDugme: mevcut && mevcut.durum === 'Aktif' ? {
      yazi: 'Pasife al', simge: 'kapat', tehlikeli: true,
      islev: () => pasifYap(tablo, mevcut.id, mevcut.baslikAdi, sonra),
    } : null,
    alanlar: [
      { ad: 'Başlık Adı', as: 'baslikAdi', tur: 'Metin', zorunlu: true },
      { ad: 'Üst Başlık', as: 'ustBaslik', tur: 'İlişki', secenekler: analar,
        ipucu: 'Boş bırakırsan ana başlık olur. En fazla iki kat.' },
      ...(limitli ? [{ ad: 'Aylık Bütçe Limiti', as: 'aylikLimit', tur: 'Para',
        gorunur: d => !d.ustBaslik,
        ipucu: 'Limit yalnız ana başlığa girilir; alt başlıkların harcaması buraya sayılır.' }] : []),
      { ad: 'Durum', as: 'durum', tur: 'Seçenek', zorunlu: true, degerler: ['Aktif', 'Pasif'] },
    ],
    async kaydet(d) {
      if (d.ustBaslik) d.aylikLimit = null;         // limit yalnız ana başlıkta
      if (mevcut) await vt.guncelle(tablo, mevcut.id, d);
      else await vt.ekle(tablo, d);
      kapat();
      bildir(mevcut ? 'Başlık güncellendi.' : 'Başlık eklendi.', 'basari');
      sonra?.();
    },
  });
  const { kapat } = pencereAc({
    baslik: mevcut ? 'Başlığı düzenle' : (limitli ? 'Yeni gider başlığı' : 'Yeni gelir başlığı'),
    govde,
  });
}

/* ------------------------------------------------------------ abonelikler */

export async function abonelikDuzenle(id, sonra) {
  const mevcut = id ? await vt.oku('abonelikler', id) : null;
  const hesaplar = await secenekler('bankaHesaplari', 'hesapAdi');
  if (!hesaplar.length) { bildir('Önce bir hesap tanımlaman gerek.', 'tehlike'); return; }
  const giderB = await baslikSecenekleri('giderBasliklari');

  const govde = form({
    deger: mevcut || { durum: 'Aktif', odendigiHesap: hesaplar[0].id },
    kaydetYazisi: mevcut ? 'Değişikliği kaydet' : 'Aboneliği ekle',
    ikinciDugme: mevcut && mevcut.durum === 'Aktif' ? {
      yazi: 'Pasife al', simge: 'kapat', tehlikeli: true,
      islev: () => pasifYap('abonelikler', mevcut.id, mevcut.abonelikAdi, sonra),
    } : null,
    alanlar: [
      { ad: 'Abonelik Adı', as: 'abonelikAdi', tur: 'Metin', zorunlu: true },
      { ad: 'Aylık Tutar', as: 'aylikTutar', tur: 'Para', zorunlu: true },
      { ad: 'Ödeme Günü', as: 'odemeGunu', tur: 'Sayı', zorunlu: true, ipucu: 'Ayın kaçında ödeniyor?' },
      { ad: 'Ödendiği Hesap', as: 'odendigiHesap', tur: 'İlişki', zorunlu: true, secenekler: hesaplar },
      { ad: 'Gider Başlığı', as: 'giderBasligi', tur: 'İlişki', secenekler: giderB },
      { ad: 'Durum', as: 'durum', tur: 'Seçenek', zorunlu: true, degerler: ['Aktif', 'Pasif'] },
    ],
    async kaydet(d) {
      if (d.odemeGunu < 1 || d.odemeGunu > 31) throw new Error('Ödeme günü 1 ile 31 arasında olmalı.');
      if (d.aylikTutar <= 0) throw new Error('Aylık tutar sıfırdan büyük olmalı.');
      if (mevcut) await vt.guncelle('abonelikler', mevcut.id, d);
      else await vt.ekle('abonelikler', d);
      kapat();
      bildir(mevcut ? 'Abonelik güncellendi.' : 'Abonelik eklendi.', 'basari');
      sonra?.();
    },
  });
  const { kapat } = pencereAc({ baslik: mevcut ? 'Aboneliği düzenle' : 'Yeni abonelik', govde });
}

/* -------------------------------------------------------- yatırım araçları */

export async function yatirimAraciDuzenle(id, sonra) {
  const mevcut = id ? await vt.oku('yatirimAraclari', id) : null;
  const govde = form({
    deger: mevcut || { durum: 'Aktif', birim: 'Gram' },
    kaydetYazisi: mevcut ? 'Değişikliği kaydet' : 'Aracı ekle',
    ikinciDugme: mevcut && mevcut.durum === 'Aktif' ? {
      yazi: 'Pasife al', simge: 'kapat', tehlikeli: true,
      islev: () => pasifYap('yatirimAraclari', mevcut.id, mevcut.aracAdi, sonra),
    } : null,
    alanlar: [
      { ad: 'Araç Adı', as: 'aracAdi', tur: 'Metin', zorunlu: true },
      { ad: 'Birim', as: 'birim', tur: 'Seçenek', zorunlu: true,
        degerler: ['Gram', 'Adet', 'Lot', 'Dolar', 'Euro'] },
      { ad: 'Güncel Fiyat', as: 'guncelFiyat', tur: 'Para',
        ipucu: 'Fiyat internetten çekilmez; buradan elle güncellersin.' },
      { ad: 'Güncel Fiyat Tarihi', as: 'guncelFiyatTarihi', tur: 'Tarih' },
      { ad: 'Durum', as: 'durum', tur: 'Seçenek', zorunlu: true, degerler: ['Aktif', 'Pasif'] },
    ],
    async kaydet(d) {
      /* Fiyat girildi ama tarihi boşsa bugünü yaz. */
      if (d.guncelFiyat !== null && !d.guncelFiyatTarihi) d.guncelFiyatTarihi = bugun();
      if (mevcut) await vt.guncelle('yatirimAraclari', mevcut.id, d);
      else await vt.ekle('yatirimAraclari', d);
      kapat();
      bildir(mevcut ? 'Araç güncellendi.' : 'Araç eklendi.', 'basari');
      sonra?.();
    },
  });
  const { kapat } = pencereAc({ baslik: mevcut ? 'Aracı düzenle' : 'Yeni yatırım aracı', govde });
}

/* ------------------------------------------------------- rutin hareketler */

export async function rutinDuzenle(id, sonra) {
  const mevcut = id ? await vt.oku('rutinHareketler', id) : null;
  const hesaplar = await secenekler('bankaHesaplari', 'hesapAdi');
  if (!hesaplar.length) { bildir('Önce bir hesap tanımlaman gerek.', 'tehlike'); return; }
  const [gelirB, giderB] = await Promise.all([
    baslikSecenekleri('gelirBasliklari'), baslikSecenekleri('giderBasliklari'),
  ]);

  const govde = form({
    deger: mevcut || {
      durum: 'Aktif', yon: 'Gider', tekrarSikligi: 'Aylık',
      baslangicTarihi: bugun(), hesap: hesaplar[0].id,
    },
    kaydetYazisi: mevcut ? 'Değişikliği kaydet' : 'Rutini ekle',
    ikinciDugme: mevcut && mevcut.durum === 'Aktif' ? {
      yazi: 'Pasife al', simge: 'kapat', tehlikeli: true,
      islev: () => pasifYap('rutinHareketler', mevcut.id, mevcut.adi, sonra),
    } : null,
    alanlar: [
      { ad: 'Adı', as: 'adi', tur: 'Metin', zorunlu: true },
      { ad: 'Yön', as: 'yon', tur: 'Seçenek', zorunlu: true, degerler: ['Gelir', 'Gider'] },
      { ad: 'Tutar', as: 'tutar', tur: 'Para', zorunlu: true },
      { ad: 'Tekrar Sıklığı', as: 'tekrarSikligi', tur: 'Seçenek', zorunlu: true,
        degerler: ['Haftalık', 'Aylık', 'Yıllık', 'Özel Kalıp'] },
      { ad: 'Haftanın Günü', as: 'haftaninGunu', tur: 'Seçenek', zorunlu: true,
        degerler: ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'],
        gorunur: d => d.tekrarSikligi === 'Haftalık' || d.tekrarSikligi === 'Özel Kalıp' },
      { ad: 'Ayın Kaçıncı Haftası', as: 'ayinHaftasi', tur: 'Seçenek', zorunlu: true,
        degerler: ['1. hafta', '2. hafta', '3. hafta', '4. hafta', 'Son hafta'],
        gorunur: d => d.tekrarSikligi === 'Özel Kalıp',
        ipucu: 'Örnek: her ayın 2. salısı' },
      { ad: 'Ayın Günü', as: 'ayinGunu', tur: 'Sayı', zorunlu: true,
        gorunur: d => d.tekrarSikligi === 'Aylık' || d.tekrarSikligi === 'Yıllık' },
      { ad: 'Ayı', as: 'ayi', tur: 'Sayı', zorunlu: true,
        gorunur: d => d.tekrarSikligi === 'Yıllık', ipucu: '1 = Ocak, 12 = Aralık' },
      { ad: 'Başlangıç Tarihi', as: 'baslangicTarihi', tur: 'Tarih', zorunlu: true },
      { ad: 'Bitiş Tarihi', as: 'bitisTarihi', tur: 'Tarih', ipucu: 'Boş bırakırsan süresiz tekrar eder.' },
      { ad: 'Hesap', as: 'hesap', tur: 'İlişki', zorunlu: true, secenekler: hesaplar },
      { ad: 'Gelir Başlığı', as: 'gelirBasligi', tur: 'İlişki', secenekler: gelirB,
        gorunur: d => d.yon === 'Gelir' },
      { ad: 'Gider Başlığı', as: 'giderBasligi', tur: 'İlişki', secenekler: giderB,
        gorunur: d => d.yon === 'Gider' },
      { ad: 'Durum', as: 'durum', tur: 'Seçenek', zorunlu: true, degerler: ['Aktif', 'Pasif'] },
    ],
    async kaydet(d) {
      if (d.tutar <= 0) throw new Error('Tutar sıfırdan büyük olmalı.');
      if (d.ayinGunu !== null && d.ayinGunu !== undefined && (d.ayinGunu < 1 || d.ayinGunu > 31)) {
        throw new Error('Ayın günü 1 ile 31 arasında olmalı.');
      }
      if (d.ayi !== null && d.ayi !== undefined && (d.ayi < 1 || d.ayi > 12)) {
        throw new Error('Ay 1 ile 12 arasında olmalı.');
      }
      if (d.bitisTarihi && d.bitisTarihi < d.baslangicTarihi) {
        throw new Error('Bitiş tarihi başlangıçtan önce olamaz.');
      }
      const kayit = {
        adi: d.adi, yon: d.yon, tutar: d.tutar, tekrarSikligi: d.tekrarSikligi,
        haftaninGunu: d.haftaninGunu ?? null, ayinHaftasi: d.ayinHaftasi ?? null,
        ayinGunu: d.ayinGunu ?? null, ayi: d.ayi ?? null,
        baslangicTarihi: d.baslangicTarihi, bitisTarihi: d.bitisTarihi,
        hesap: d.hesap,
        gelirBasligi: d.yon === 'Gelir' ? (d.gelirBasligi ?? null) : null,
        giderBasligi: d.yon === 'Gider' ? (d.giderBasligi ?? null) : null,
        durum: d.durum,
      };
      if (mevcut) await vt.guncelle('rutinHareketler', mevcut.id, kayit);
      else await vt.ekle('rutinHareketler', kayit);
      kapat();
      bildir(mevcut ? 'Rutin güncellendi.' : 'Rutin eklendi.', 'basari');
      sonra?.();
    },
  });
  const { kapat } = pencereAc({ baslik: mevcut ? 'Rutini düzenle' : 'Yeni rutin hareket', govde });
}

/* ---------------------------------------------------------- pasife alma */

/** Tanım listeleri silinmez; Pasif'e alınır ve geçmiş kayıtlar korunur. */
export async function pasifYap(tablo, id, ad, sonra) {
  const evet = await onayla({
    baslik: 'Pasife alınsın mı?',
    yazi: `"${ad}" pasife alınacak. Silinmez — geçmiş kayıtları ve raporları olduğu gibi kalır, ` +
          'ama yeni kayıtlarda listede görünmez.',
    onayla: 'Evet, pasife al',
    tehlikeli: true,
  });
  if (!evet) return;
  await vt.guncelle(tablo, id, { durum: 'Pasif' });
  bildir(`"${ad}" pasife alındı.`, 'basari');
  sonra?.();
}

/* ---------------------------------------------------------- detay ekranı */

function bolum(baslik, icerik, acik = false) {
  return `
    <details class="bolum" ${acik ? 'open' : ''}>
      <summary class="bolum-baslik">${kacir(baslik)}<span class="agac-ok">›</span></summary>
      <div class="bolum-govde"><dl>${icerik}</dl></div>
    </details>`;
}

function cift(etiket, deger) {
  return `<div class="satir-cift"><dt>${kacir(etiket)}</dt><dd>${deger}</dd></div>`;
}

/**
 * Bir hareketin detayı. Bölümler kapalı gelir, dokununca açılır.
 * Buradan düzenlemeye geçilir; silme yoktur.
 */
export async function hareketDetay(id, sonra) {
  const h = await vt.oku('bankaHareketleri', id);
  if (!h) return;

  const [hesaplar, gelirB, giderB, yuklemeler] = await Promise.all([
    vt.hepsi('bankaHesaplari'), vt.hepsi('gelirBasliklari'),
    vt.hepsi('giderBasliklari'), vt.hepsi('ekstreYukleme'),
  ]);
  const hesapAdi = new Map(hesaplar.map(x => [x.id, x.hesapAdi]));
  const baslikAdi = new Map([...gelirB, ...giderB].map(b => [b.id, b.baslikAdi]));
  const yukleme = yuklemeler.find(y => y.id === h.ekstreYuklemesi);

  const govde = document.createElement('div');
  govde.innerHTML = `
    <div class="detay-tepe ${h.yon === 'Gelir' ? 'arti' : h.yon === 'Gider' ? 'eksi' : ''}">
      <div class="detay-tutar">${h.yon === 'Gelir' ? '+' : h.yon === 'Gider' ? '−' : ''}${kacir(paraSimgeli(h.tutar))}</div>
      <div class="detay-aciklama">${kacir(h.aciklama)}</div>
    </div>

    ${bolum('Hareket bilgileri', [
      cift('Tarih', kacir(tarih(h.tarih))),
      cift('Yön', kacir(h.yon)),
      cift('Hesap', kacir(hesapAdi.get(h.hesap) || '—')),
      h.yon === 'Transfer' ? cift('Karşı hesap', kacir(hesapAdi.get(h.karsiHesap) || '—')) : '',
      cift('Giriş şekli', kacir(h.girisSekli)),
      h.dekontNo ? cift('Dekont no', kacir(h.dekontNo)) : '',
    ].join(''), true)}

    ${h.yon !== 'Transfer' ? bolum('Başlık', [
      cift(h.yon === 'Gelir' ? 'Gelir başlığı' : 'Gider başlığı',
        baslikAdi.get(h.gelirBasligi || h.giderBasligi)
          ? kacir(baslikAdi.get(h.gelirBasligi || h.giderBasligi))
          : '<span class="silik">Başlıksız</span>'),
    ].join('')) : ''}

    ${bolum('Bağlantılar', [
      cift('Abonelik', h.bagliAbonelik ? 'Bağlı' : '<span class="silik">yok</span>'),
      cift('Yatırım işlemi', h.bagliYatirimIslemi ? 'Bağlı' : '<span class="silik">yok</span>'),
      cift('Ekstre yüklemesi', yukleme
        ? kacir(tarihSaat(yukleme.yuklemeTarihi))
        : '<span class="silik">elle girildi</span>'),
    ].join(''))}

    <div class="pencere-dugmeler">
      <button class="dugme dugme-sade" type="button" data-kapat-detay>Kapat</button>
      <button class="dugme" type="button" data-duzenle>${simge('kalem')}<span>Düzenle</span></button>
    </div>`;

  const { kapat } = pencereAc({ baslik: 'Hareket detayı', govde });
  govde.querySelector('[data-kapat-detay]').addEventListener('click', kapat);
  govde.querySelector('[data-duzenle]').addEventListener('click', () => {
    kapat();
    hareketDuzenle(id, sonra);
  });
}
