/* Nizam Soft · Kişisel Bütçe — tablo tanımları
 *
 * Bu dosya künyenin birebir karşılığıdır. Alan adları, türleri, zorunluluk
 * durumu, seçenek değerleri ve ilişkiler künyeden gelir — buraya alan
 * EKLENMEZ, çıkarılmaz. Eksik görünen bir şey varsa önce sorulur.
 *
 * Alan türleri: Metin · Uzun metin · Sayı · Para · Tarih · Tarih-saat ·
 *               Seçenek · Evet/Hayır · Dosya · İlişki
 */

export const TABLOLAR = {
  bankaHesaplari: {
    ad: 'Banka Hesapları',
    anahtar: 'bankaHesaplari',
    alanlar: [
      { ad: 'Hesap Adı',      as: 'hesapAdi',    tur: 'Metin',   zorunlu: true },
      { ad: 'Hesap Türü',     as: 'hesapTuru',   tur: 'Seçenek', zorunlu: true,
        degerler: ['Banka Hesabı', 'Nakit Cüzdan', 'Kredi Kartı'] },
      { ad: 'Banka Adı',      as: 'bankaAdi',    tur: 'Metin' },
      { ad: 'Devir Bakiye',   as: 'devirBakiye', tur: 'Para',    zorunlu: true },
      { ad: 'Devir Tarihi',   as: 'devirTarihi', tur: 'Tarih',   zorunlu: true },
      { ad: 'Son Ödeme Günü', as: 'sonOdemeGunu', tur: 'Sayı' },
      { ad: 'Güncel Bakiye',  as: 'guncelBakiye', tur: 'Para',   hesaplanan: true },
      { ad: 'Durum',          as: 'durum',       tur: 'Seçenek', zorunlu: true,
        degerler: ['Aktif', 'Pasif'] },
    ],
  },

  bankaHareketleri: {
    ad: 'Banka Hareketleri',
    anahtar: 'bankaHareketleri',
    dizinler: ['hesap', 'tarih', 'dekontNo', 'ekstreYuklemesi'],
    alanlar: [
      { ad: 'Hesap',        as: 'hesap',       tur: 'İlişki', zorunlu: true, kaynak: 'bankaHesaplari' },
      { ad: 'Tarih',        as: 'tarih',       tur: 'Tarih',  zorunlu: true },
      { ad: 'Açıklama',     as: 'aciklama',    tur: 'Metin',  zorunlu: true },
      { ad: 'Tutar',        as: 'tutar',       tur: 'Para',   zorunlu: true },
      { ad: 'Yön',          as: 'yon',         tur: 'Seçenek', zorunlu: true,
        degerler: ['Gelir', 'Gider', 'Transfer'] },
      { ad: 'Gelir Başlığı', as: 'gelirBasligi', tur: 'İlişki', kaynak: 'gelirBasliklari' },
      { ad: 'Gider Başlığı', as: 'giderBasligi', tur: 'İlişki', kaynak: 'giderBasliklari' },
      { ad: 'Karşı Hesap',  as: 'karsiHesap',  tur: 'İlişki', kaynak: 'bankaHesaplari' },
      { ad: 'Dekont No',    as: 'dekontNo',    tur: 'Metin' },
      { ad: 'Yürüyen Bakiye', as: 'yuruyenBakiye', tur: 'Para', hesaplanan: true },
      { ad: 'Bağlı Abonelik', as: 'bagliAbonelik', tur: 'İlişki', kaynak: 'abonelikler' },
      { ad: 'Bağlı Yatırım İşlemi', as: 'bagliYatirimIslemi', tur: 'İlişki', kaynak: 'yatirimIslemleri' },
      { ad: 'Ekstre Yüklemesi', as: 'ekstreYuklemesi', tur: 'İlişki', kaynak: 'ekstreYukleme' },
      { ad: 'Giriş Şekli',  as: 'girisSekli',  tur: 'Seçenek', zorunlu: true,
        degerler: ['Ekstreden', 'Elle'] },
    ],
  },

  ekstreYukleme: {
    ad: 'Ekstre Yükleme',
    anahtar: 'ekstreYukleme',
    alanlar: [
      { ad: 'Hesap',          as: 'hesap',        tur: 'İlişki',     zorunlu: true, kaynak: 'bankaHesaplari' },
      { ad: 'Dosya',          as: 'dosya',        tur: 'Dosya',      zorunlu: true },
      { ad: 'Yükleme Tarihi', as: 'yuklemeTarihi', tur: 'Tarih-saat', zorunlu: true },
      { ad: 'Toplam Satır',   as: 'toplamSatir',  tur: 'Sayı' },
      { ad: 'Yeni Satır',     as: 'yeniSatir',    tur: 'Sayı' },
      { ad: 'Mevcut Satır',   as: 'mevcutSatir',  tur: 'Sayı' },
      { ad: 'İşlenen Satır',  as: 'islenenSatir', tur: 'Sayı' },
      { ad: 'Durum',          as: 'durum',        tur: 'Seçenek',    zorunlu: true,
        degerler: ['Önizleme', 'Başlık Atanıyor', 'İşlendi', 'Geri Alındı'] },
    ],
  },

  yatirimAraclari: {
    ad: 'Yatırım Araçları',
    anahtar: 'yatirimAraclari',
    alanlar: [
      { ad: 'Araç Adı',            as: 'aracAdi',          tur: 'Metin',   zorunlu: true },
      { ad: 'Birim',               as: 'birim',            tur: 'Seçenek', zorunlu: true,
        degerler: ['Gram', 'Adet', 'Lot', 'Dolar', 'Euro'] },
      { ad: 'Güncel Fiyat',        as: 'guncelFiyat',      tur: 'Para' },
      { ad: 'Güncel Fiyat Tarihi', as: 'guncelFiyatTarihi', tur: 'Tarih' },
      { ad: 'Durum',               as: 'durum',            tur: 'Seçenek', zorunlu: true,
        degerler: ['Aktif', 'Pasif'] },
    ],
  },

  yatirimIslemleri: {
    ad: 'Yatırım İşlemleri',
    anahtar: 'yatirimIslemleri',
    dizinler: ['yatirimAraci', 'tarih'],
    alanlar: [
      { ad: 'İşlem Türü',    as: 'islemTuru',    tur: 'Seçenek', zorunlu: true,
        degerler: ['Alış', 'Satış'] },
      { ad: 'Tarih',         as: 'tarih',        tur: 'Tarih',  zorunlu: true },
      { ad: 'Yatırım Aracı', as: 'yatirimAraci', tur: 'İlişki', zorunlu: true, kaynak: 'yatirimAraclari' },
      { ad: 'Adet',          as: 'adet',         tur: 'Sayı',   zorunlu: true },
      { ad: 'Birim Fiyat',   as: 'birimFiyat',   tur: 'Para',   zorunlu: true },
      { ad: 'Tutar',         as: 'tutar',        tur: 'Para',   zorunlu: true },
      { ad: 'Hesap',         as: 'hesap',        tur: 'İlişki', zorunlu: true, kaynak: 'bankaHesaplari' },
      { ad: 'Kâr/Zarar',     as: 'karZarar',     tur: 'Para',   hesaplanan: true },
    ],
  },

  abonelikler: {
    ad: 'Abonelikler',
    anahtar: 'abonelikler',
    alanlar: [
      { ad: 'Abonelik Adı',   as: 'abonelikAdi',   tur: 'Metin',  zorunlu: true },
      { ad: 'Aylık Tutar',    as: 'aylikTutar',    tur: 'Para',   zorunlu: true },
      { ad: 'Ödeme Günü',     as: 'odemeGunu',     tur: 'Sayı',   zorunlu: true },
      { ad: 'Ödendiği Hesap', as: 'odendigiHesap', tur: 'İlişki', zorunlu: true, kaynak: 'bankaHesaplari' },
      { ad: 'Gider Başlığı',  as: 'giderBasligi',  tur: 'İlişki', kaynak: 'giderBasliklari' },
      { ad: 'Durum',          as: 'durum',         tur: 'Seçenek', zorunlu: true,
        degerler: ['Aktif', 'Pasif'] },
    ],
  },

  abonelikOdemeleri: {
    ad: 'Abonelik Ödemeleri',
    anahtar: 'abonelikOdemeleri',
    dizinler: ['abonelik', 'donem'],
    alanlar: [
      { ad: 'Abonelik',       as: 'abonelik',      tur: 'İlişki',    zorunlu: true, kaynak: 'abonelikler' },
      { ad: 'Dönem',          as: 'donem',         tur: 'Tarih',     zorunlu: true },
      { ad: 'Beklenen Tutar', as: 'beklenenTutar', tur: 'Para',      zorunlu: true },
      { ad: 'Ödenen Tutar',   as: 'odenenTutar',   tur: 'Para' },
      { ad: 'Ödendi',         as: 'odendi',        tur: 'Evet/Hayır', zorunlu: true },
      { ad: 'Eşleşen Hareket', as: 'eslesenHareket', tur: 'İlişki',  kaynak: 'bankaHareketleri' },
    ],
  },

  gelirBasliklari: {
    ad: 'Gelir Başlıkları',
    anahtar: 'gelirBasliklari',
    agac: true,
    alanlar: [
      { ad: 'Başlık Adı', as: 'baslikAdi', tur: 'Metin',  zorunlu: true },
      { ad: 'Üst Başlık', as: 'ustBaslik', tur: 'İlişki', kaynak: 'gelirBasliklari' },
      { ad: 'Durum',      as: 'durum',     tur: 'Seçenek', zorunlu: true,
        degerler: ['Aktif', 'Pasif'] },
    ],
  },

  giderBasliklari: {
    ad: 'Gider Başlıkları',
    anahtar: 'giderBasliklari',
    agac: true,
    alanlar: [
      { ad: 'Başlık Adı',         as: 'baslikAdi',  tur: 'Metin',  zorunlu: true },
      { ad: 'Üst Başlık',         as: 'ustBaslik',  tur: 'İlişki', kaynak: 'giderBasliklari' },
      { ad: 'Aylık Bütçe Limiti', as: 'aylikLimit', tur: 'Para' },
      { ad: 'Durum',              as: 'durum',      tur: 'Seçenek', zorunlu: true,
        degerler: ['Aktif', 'Pasif'] },
    ],
  },

  rutinHareketler: {
    ad: 'Rutin Hareketler',
    anahtar: 'rutinHareketler',
    alanlar: [
      { ad: 'Adı',            as: 'adi',           tur: 'Metin',   zorunlu: true },
      { ad: 'Yön',            as: 'yon',           tur: 'Seçenek', zorunlu: true,
        degerler: ['Gelir', 'Gider'] },
      { ad: 'Tutar',          as: 'tutar',         tur: 'Para',    zorunlu: true },
      { ad: 'Tekrar Sıklığı', as: 'tekrarSikligi', tur: 'Seçenek', zorunlu: true,
        degerler: ['Haftalık', 'Aylık', 'Yıllık', 'Özel Kalıp'] },
      { ad: 'Haftanın Günü',  as: 'haftaninGunu',  tur: 'Seçenek',
        degerler: ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'] },
      { ad: 'Ayın Kaçıncı Haftası', as: 'ayinHaftasi', tur: 'Seçenek',
        degerler: ['1. hafta', '2. hafta', '3. hafta', '4. hafta', 'Son hafta'] },
      { ad: 'Ayın Günü',        as: 'ayinGunu',        tur: 'Sayı' },
      { ad: 'Ayı',              as: 'ayi',             tur: 'Sayı' },
      { ad: 'Başlangıç Tarihi', as: 'baslangicTarihi', tur: 'Tarih', zorunlu: true },
      { ad: 'Bitiş Tarihi',     as: 'bitisTarihi',     tur: 'Tarih' },
      { ad: 'Hesap',            as: 'hesap',           tur: 'İlişki', zorunlu: true, kaynak: 'bankaHesaplari' },
      { ad: 'Gelir Başlığı',    as: 'gelirBasligi',    tur: 'İlişki', kaynak: 'gelirBasliklari' },
      { ad: 'Gider Başlığı',    as: 'giderBasligi',    tur: 'İlişki', kaynak: 'giderBasliklari' },
      { ad: 'Durum',            as: 'durum',           tur: 'Seçenek', zorunlu: true,
        degerler: ['Aktif', 'Pasif'] },
    ],
  },

  /* Kullanıcı verisi değil; uygulamanın kendi ayarları ve değişiklik kaydı. */
  ayarlar: { ad: 'Ayarlar', anahtar: 'ayarlar', alanlar: [] },
  degisiklikKaydi: { ad: 'Değişiklik Kaydı', anahtar: 'degisiklikKaydi', dizinler: ['zaman'], alanlar: [] },
};

/** Kullanıcı verisi tutan tablolar — yedeğe ve şifrelemeye bunlar girer. */
export const TABLO_ADLARI = Object.keys(TABLOLAR);

/** Bir tablonun alanını takma adından bulur. */
export function alan(tablo, as) {
  return TABLOLAR[tablo].alanlar.find(a => a.as === as);
}
