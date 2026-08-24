# NIZAM.md — Proje Kimlik Dosyası

Bu dosya projenin doğruluk kaynağıdır. Yapay zekâ her işten sonra bu
dosyayı güncellemekle yükümlüdür.

## Proje

| Alan | Değer |
|---|---|
| Firma | Nizam Soft |
| Ürün | Kişisel Bütçe |
| Sektör | Kişisel Muhasebe |
| Platform | Mobil |
| Veritabanı | Sıfırdan veritabanı |
| Depo | github.com/nizamsoft/NIZAMSOFT-KisiselButce |
| Arayüz dili | Türkçe |

## Teknik Standart

Bunlar Nizam Soft standardıdır. Tartışılmaz, değiştirilmez, alternatif
önerilmez — gerekiyorsa önce sorulur.

- **Dil ve çatı: Vanilla JS · HTML · CSS**
  - Hazır çatı (React, Vue) yok. Bağımlılık az, ömrü uzun.
- **Derleme: Yok**
  - Dosyalar doğrudan çalışır. Build adımı, paket yöneticisi, node_modules yok.
- **Dosya düzeni: Ekran başına ayrı dosya**
  - Tek dosyada 1500 satırı geçme. Büyük dosyada bir yeri düzeltirken başka yer bozulur.
- **Barındırma: GitHub Pages**
  - Depoya gönderilen kod kendiliğinden yayınlanır.
- **Depo: GitHub · main dalı**
  - Commit başına `[NS-x]` etiketi.
- **PWA: Var**
  - Ana ekrana eklenebilir. Servis işçisi kabuğu önbelleğe alır, sürüm değişince günceller.
- **Veri: Supabase**
  - Postgres + Auth + Realtime + Storage. Satır güvenliği (RLS) her tabloda açık.
- **Gerçek zamanlı: Her zaman açık**
  - Başkası bir kaydı değiştirince ekran kendiliğinden tazelenir.
- **Çevrimdışı: Her zaman çalışır**
  - Okuma yerelden: son görülen veri tarayıcıda durur. Yazma kuyruğa girer,
    internet gelince gönderilir. Çakışırsa son yazan kazanır ve kullanıcıya söylenir.
- **Değişiklik kaydı: Her zaman tutulur**
  - Her yazma işleminde kim, ne, ne zaman kaydedilir. Ayarlarda listelenir.
- **Dosya saklama: Supabase Storage**
  - Belge ve logolar özel klasörde, imzalı adresle sunulur. Profil fotoğrafı genel olabilir.
- **Giriş: E-posta + şifre**
  - Kayıt ekranı yok; hesabı yönetici açar.
- **Paketler: Yalnız Supabase istemcisi**
  - Excel gerekiyorsa xlsx. Başka paket eklemeden önce sor.
- **Para birimi: ₺ TRY**
  - Binlik nokta, ondalık virgül: 12.400,00
- **Tarih ve saat: 22.05.2025 · 14:30**
  - Gün.Ay.Yıl ve 24 saatlik saat.
- **Kayıt numarası: HARF-SIRA**
  - Kaydın türünü gösteren kısa harf, tire, sıra numarası: F-1042 (fatura),
    S-1001 (sipariş). Sayaç 1'den başlar, yıl başında sıfırlanmaz, boşluk bırakmaz.
- **Sürümleme: YIL.SAYAÇ**
  - Örnek 2026.14. Ayarlar ekranında görünür.
- **Arayüz dili: Türkçe**
  - Tek dil. Metinler koda yazılır, sözlük dosyası yok.
- **Masaüstü gezinme: Alt çubuk yok — solda panel**
  - 900px ve üstünde alt sekme çubuğu gizlenir; gezinme solda dikey panele döner.
    Alt çubuk yalnız telefon ve tablette görünür. Seçilen çubuk dokusu ikisinde de aynıdır.
- **Erişilebilirlik: 44px · 4.5:1**
  - Dokunma hedefi en az 44×44px, metin kontrastı en az 4.5:1.

### Bu projeye özel

- **Roller:** 2 katman, en alttan en üste:
  1. Yazılımcı
  2. Yönetici
  - Üstteki katman, alttakinin gördüğü her şeyi görür.
  - Yetki veritabanı kurallarıyla (RLS) uygulanır, yalnız arayüzde gizlemekle değil.

### Henüz belirlenmedi

- Alan adı

## Tasarım kararları

henüz belirlenmedi

## Modüller ve sayfalar

henüz belirlenmedi

## Kararlar

henüz belirlenmedi
