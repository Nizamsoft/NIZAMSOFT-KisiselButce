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
- **Veri: Tarayıcıda — IndexedDB**
  - Sunucu yok, hesap yok, veri tarayıcıdan dışarı çıkmaz. Bütün kayıtlar
    kullanıcının cihazındaki IndexedDB'de durur.
- **Gerçek zamanlı: Yok**
  - Tek cihaz, tek kullanıcı. Paylaşılan veri olmadığı için tazelenecek bir şey yok.
- **Çevrimdışı: Her zaman çalışır**
  - Uygulama zaten çevrimdışı çalışır; okuma da yazma da doğrudan cihazdaki
    veritabanına gider. Kuyruk, eşitleme ve çakışma yoktur.
- **Değişiklik kaydı: Her zaman tutulur**
  - Her yazma işleminde ne, ne zaman değişti cihazda kaydedilir. Ayarlarda listelenir.
- **Dosya saklama: Tarayıcıda**
  - Yüklenen belgeler IndexedDB'de saklanır. Uzak depolama yok.
- **Giriş: Yerel PIN — 6 hane**
  - Sunucu ve hesap yoktur; kimlik doğrulama uzakta değil, cihazda yapılır.
    PIN her açılışta sorulur, hiçbir yere gönderilmez.
  - İlk açılışta kullanıcı hem 6 haneli PIN'i belirler hem de sabit kurtarma
    sorusunu cevaplar: **"İlk Evcil Hayvanının adı"**. Cevap karşılaştırılırken
    büyük/küçük harf ve Türkçe/İngilizce karakter farkı önemsenmez, baştaki
    ve sondaki boşluklar atılır (Budy = budy = BUDY).
  - PIN unutulursa kurtarma sorusu sorulur; doğru cevaplanırsa kullanıcı yeni
    PIN belirler. Veri kaybolmaz.
- **Şifreleme: Veri PIN'le şifrelenir**
  - Kayıtlar IndexedDB'de düz değil şifreli durur. Tarayıcının kendi Web
    Crypto'su kullanılır (AES-GCM + PBKDF2); paket eklenmez.
  - Veri rastgele bir anahtarla şifrelenir. Bu anahtarın iki kilitli kopyası
    saklanır: biri PIN'den, biri kurtarma cevabından türetilen anahtarla.
    İkisi de aynı anahtarı açar; kurtarmada anahtar yeni PIN'le yeniden
    kilitlenir. Veri bu yüzden PIN kadar kurtarma cevabı kadar da güçlüdür.
- **Yedek: JSON dosyası**
  - Bütün veri tek JSON dosyasına dışa aktarılır, aynı dosyadan geri yüklenir.
    Veri cihazda durduğu için yedeği kullanıcı alır.
  - Ayrıca isteğe bağlı Excel dışa aktarım vardır; o yalnız okumak içindir,
    geri yüklenmez.
- **Paketler: İki tane**
  - `xlsx` (SheetJS) — banka ekstresini okumak ve isteğe bağlı Excel dışa aktarım.
  - `pdfmake` — raporların PDF çıktısı. Türkçe karakterleri tam olan Roboto ile gelir.
  - İkisi de depoya `vendor/` altına konur ve doğrudan dosyadan yüklenir;
    paket yöneticisi ve node_modules yok. Başka paket eklemeden önce sor.
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
  - Sunucu ve veritabanı kuralı (RLS) olmadığı için yetki **yalnız arayüzde**
    uygulanır. Bu bir güvenlik sınırı değildir; veri zaten cihazın sahibinindir.

### Henüz belirlenmedi

- Alan adı

## Tasarım kararları

Bu bölümdekiler alınmış kararlardır. Tartışılmaz, değiştirilmez, biçim
uydurulmaz. Eksik görülen bir şey varsa tahmin edilmez — sorulur.

### Renk ve tipografi

Renkler ve ölçüler **tek yerde** değişken olarak tanımlanır; hiçbir
ekranda yeniden yazılmaz.

#### Renk değişkenleri

| Değişken | Değer | Nerede |
|---|---|---|
| `--arka-plan` | `#f4f5f7` | Sayfa zemini |
| `--yuzey` | `#ffffff` | Kart, pencere, çubuk, panel |
| `--cizgi` | `#e1e4e9` | Kenarlık, ayraç, tablo satır çizgisi |
| `--metin` | `#16181d` | Başlık ve ana metin |
| `--metin-soft` | `#4a5058` | İkincil metin |
| `--metin-silik` | `#676e78` | Etiket, ipucu, üçüncül metin |
| `--vurgu` | `#0e6e8c` | Ana buton, aktif menü, acil işareti |
| `--vurgu-koyu` | `#0a566e` | Üzerine gelince ve basılınca |
| `--basari` | `#107c41` | Olumlu durum |
| `--uyari` | `#a66300` | Uyarı durumu |
| `--tehlike` | `#ce1b2e` | Hata ve silme |

Vurgu rengi **az kullanılır**: ana buton, aktif menü ve acil işareti.
Başka hiçbir yerde kullanılmaz.

#### Yazı ve simge

| Değişken | Değer |
|---|---|
| `--yazi-baslik` | Manrope — 600–700 ağırlık |
| `--yazi-metin` | Inter — 400–500 ağırlık |

- **Simge seti:** Lucide
- **Ton:** Karbon zeminde keskin kesilmiş metalik bir N — soğuk çelik ve
  grafit tonlarını kırmızı bir kıvılcımla kesen, kurumsal ve teknik bir duruş.

#### Ölçü değişkenleri

Aşağıdaki değerler kararlardan gelir; renkler gibi tek yerde tanımlanır.

| Değişken | Değer | Nerede |
|---|---|---|
| `--ust-cubuk-yukseklik` | `44px` | İnce başlık çubuğu |
| `--kose` | `6px` | Köşe yarıçapı |
| `--satir-yukseklik` | `34px` | Liste ve tablo satırı (sıkışık) |
| `--kart-bosluk` | `10px` | Kart içi boşluk (sıkışık) |
| `--serit-kalinlik` | `3px` | Kartın sol kenarındaki vurgu şeridi |
| `--dugme-simge` | `16px` | Düğme içindeki simge |
| `--dugme-simge-bosluk` | `8px` | Simge ile yazı arası |
| `--icerik-genislik` | `1200px` | Ortalanmış içerik genişliği |
| `--gecis-sure` | `160ms` | Sayfa geçişi |
| `--kayma-mesafe` | `8px` | Açılma/kapanmadaki kayma |
| `--basma-olcek` | `0.985` | Dokunma tepkisinde küçülme |
| `--soluk-saydamlik` | `0.55` | Seçili olmayanların saydamlığı |
| `--liste-gecikme` | `40ms` | Liste satırlarının belirme arası |

### Uygulama sırası

Kararlar rastgele uygulanmaz. Sonrakiler öncekilerin üstüne kurulur:

1. **Renk ve bileşen** — Önce malzeme: her ekranda kullanılacak kutu, düğme, simge.
2. **Uygulama kabuğu** — Her ekranı saran çatı: üst çubuk, gezinme, genişlik.
3. **Giriş kapısı** — Uygulamaya girerken görülen ilk iki ekran.
4. **Panel ekranı** — Açılışta karşılayan ekran.
5. **Liste ekranı** — En çok bakılan ekran ve içindeki her şey.
6. **Diğer ekranlar** — Kayıt girme, detay, ayarlar ve toplu aktarım.
7. **Uç durumlar** — Ekran boşken, beklerken ve iş ters gittiğinde.
8. **Hareket** — Uygulamayı canlandıran katman. Kodda da en son yazılır.
9. **Sistem** — Güncelleme, tema ve yedek — uygulamanın kendi bakımı.

### Yerleşim

- **Üst çubuk: İnce başlık**
  - 44px yükseklikte, yalnız sayfa adı ve geri oku.
- **Logo görünümü: Zeminsiz, altında ad**
  - Logo kutusuz durur; altında ince ışık çizgisi, onun altında firma adı.
    Açılışta ve girişte böyle görünür.
- **Gezinme: Alt + orta +**
  - Alt sekme şeridi, ortasında yükseltilmiş ekleme düğmesi.
- **Çubuk ve panel dokusu: Yüzen hap**
  - Kenarlardan boşluklu, yuvarlak köşeli, gölgeli ada gibi durur.
- **Sayfa listesi: Üst sekme**
  - Modülün sayfaları üstte yatay sekme olur.
- **Yol izi: Geri oku + başlık**
  - Solda geri oku, yanında sayfa adı. Telefonda en anlaşılır olan.
- **Kullanıcı menüsü: Sağ üstte çip**
  - Avatar + ad + rol bir arada; dokununca menü açılır.
- **Destek ve istek: Üst çubukta**
  - Üst çubukta soru işareti düğmesi; basınca istek penceresi.
- **Sayaç düzeni: 3'lü ızgara**
  - Üçlü ızgara: üstte küçük gri etiket, altta büyük kalın sayı.
- **Dönem seçici: Filtre içinde**
  - Tarih aralığı diğer filtrelerle birlikte.
- **Tablolu sayfa: Sekmeli liste**
  - Durum sekmeleri (Bekleyen · Onaylı · Kapalı) tablonun üstünde.
- **Dashboard: Sayaç + büyük grafik**
  - Üstte sayaç şeridi, altında tek büyük grafik.
- **Veri girişi: Ortada pencere**
  - Ortada küçük pencere. 3-4 alanlık kısa formlar için.
- **Ayarlar: Arama + gruplu**
  - Tepede ayar araması, altında gruplu liste.
- **Detay ekranı: Katlanır bölümler**
  - Bölümler kapalı gelir, dokununca açılır.
- **Ana eylem yeri: Alt çubukta orta**
  - Alt sekme şeridinin ortasında yükseltilmiş düğme.
- **Arama: Simgeden açılan**
  - Büyüteç simgesi; dokununca arama çubuğu açılır.
- **Filtre: Açılır panel**
  - Filtre düğmesi; basınca üstten panel iner.
- **İçe aktarma: Önizlemeli**
  - Yüklemeden önce "N yeni · M mevcut" özeti ve satır listesi gösterilir.
- **Genişlik: Ortada sınırlı**
  - En fazla 1200px, ortalanır. Uzun satırlar okunaklı kalır.

### Biçim

- **Kart: Yükseltilmiş**
  - Yumuşak gölge ve üstte ince ışık çizgisi; kart zeminden kalkık durur.
- **Karta ekle: Şerit vurgu + Dokulu**
  - Şerit vurgu: Sol kenarda 3px vurgu renginde dikey şerit.
  - Dokulu: Dolgunun üzerinde çok ince gren dokusu; matbaa kağıdı hissi.
  - Bu seçenekler birleşerek uygulanır, biri diğerini iptal etmez.
- **Vurgu kartı: Degrade hero**
  - Vurgu renginden koyusuna 135° degrade, büyük köşe, yumuşak renkli gölge.
- **Köşe: Hafif**
  - `border-radius` 6px. Nötr, güvenli seçim.
- **Yoğunluk: Sıkışık**
  - Satır 34px, kart içi boşluk 10px. Çok kayıtlı ekranlar için.
- **Tablo satırı: Yatay çizgi**
  - Her satırın altında 1px çizgi; dikey çizgi yok.
- **Tabloya ekle: Vurgulu sütun**
  - İlk sütun kalın yazılır ve yatay kaydırmada yapışık kalır.
- **Tablo · telefonda: İki satır**
  - Her kayıt iki satır: üstte ana bilgi kalın, altta detaylar küçük ve silik.
- **Düğme: Degrade**
  - Dolgu vurgu renginden koyusuna 135° geçiş.
- **Düğmeye ekle: İkonlu**
  - Her düğmede solda 16px simge, sağında yazı; arada 8px boşluk.
- **Simge: İki katman**
  - Kontur + arkada aynı rengin saydam dolgusu.

### Açılış

- **Açılış ekranı: Logo + yüzde + mesaj**
  - Çubuk, yüzde ve "Veriler alınıyor…" gibi durum yazısı.
- **Giriş ekranı: Ortada kart**
  - Ortada tek kart: logo ve 6 haneli PIN girişi. Sunucu olmadığı için e-posta
    ve şifre yoktur. Kartın altında "PIN'imi unuttum" bağlantısı durur; ona
    basınca aynı kart kurtarma sorusuna döner.

### Durumlar

- **Boş durum: Simge + yazı + düğme**
  - Simge, ne yapılacağını anlatan cümle ve ilk kaydı ekleyen düğme.
- **Yükleme: İlerleme çubuğu**
  - Üstte ince çubuk; içerik yerinde kalır.
- **Hata ekranı: Simge + tekrar dene**
  - Uyarı simgesi, ne olduğunu anlatan cümle ve "Tekrar dene" düğmesi.
- **İşlem sonucu: Tik animasyonu**
  - Ortada büyüyen onay işareti, sonra ekran kapanır.
- **Bildirim: Sağ üstte**
  - Sağ üst köşede yığılan kartlar. Masaüstü alışkanlığı.
- **Onay & silme: Pencere ile onay**
  - "Emin misin?" penceresi; silmeden önce durdurur.
- **Liste sonu: Sonsuz kaydırma**
  - Aşağı indikçe kendiliğinden yüklenir.

### Hareket

- **Sayfa geçişi: Soluk**
  - Yeni sayfa 160ms içinde belirir.
- **Dokunma tepkisi: Hafif küçülme**
  - Basılan öğe %98,5 küçülür, bırakınca geri döner. En sessiz tepki.
- **Seçim vurgusu: Ötekiler soluklaşır**
  - Seçili olmayanlar %55 saydamlığa iner; odak seçilene toplanır.
- **Açılma ve kapanma: Soluk + kayma**
  - Hem belirir hem 8px kayar. En yumuşak olanı.
- **Bekleme göstergesi: Yazı değişir**
  - "Kaydet" → "Kaydediliyor…" olur; düğme pasifleşir.
- **Liste girişi: Sırayla belirme**
  - Satırlar 40ms arayla tek tek belirir.
- **Sayı değişimi: Kısa parlama**
  - Değişen sayı bir an vurgu renginde parlar.
- **Hareket miktarı: Bol**
  - Sayı sayma, parlama ve yaylanma dahil. Gösterişli ama yorabilir.

### Sistem

- **Güncelleme: Güncelle düğmesi**
  - Ayarlarda "Uygulamayı güncelle" düğmesi ve altında sürüm etiketi.
- **Yedek ve kayıt geçmişi: Yedek + değişiklik kaydı**
  - Ayrıca kimin neyi ne zaman değiştirdiğini gösteren liste.

## Modüller ve sayfalar

Tek modül: **Kişisel Bütçe Modülü**. Aşağıdaki künyeler kullanıcıyla tek tek
konuşularak alınmıştır; tahmin değil karardır.

- **Alan listesi o sayfanın veri tablosudur.** Sütun adlarını ve türlerini
  buradan al; uydurma, fazladan sütun ekleme.
- **Seçenek alanlarının değerleri sabittir.**
- **İlişki alanı** yazılı sayfanın kaydına bağlanır.
- **Zorunlu alan** boş kaydedilemez; hem arayüzde hem veri katmanında engelle.
- **Modül kuralları bütün sayfalarda geçerlidir.** Bir sayfada "Bu sayfada
  farklı" satırı varsa yalnız orada modül kuralının yerine geçer.

### Modül kuralları

- **Görebilen:** Yönetici
- **Yapılabilecek işler ve yetkiler:** Ekle · Düzenle · Sil · Ara · Filtrele ·
  İçe aktar · Yazdır · Dışa aktar · Yüklemeyi geri al — hepsi Yönetici.
- **Ortak kural:** Tek kişilik kullanım. Sunucu YOKTUR: bütün veri kullanıcının
  cihazındaki IndexedDB'de şifreli durur, dışarı çıkmaz. Giriş 6 haneli yerel
  PIN iledir; PIN her açılışta sorulur ve hiçbir yere gönderilmez.
  Yazılımcı rolü bu modülde kullanılmaz; roller yalnız arayüzde
  uygulanır, bu bir güvenlik sınırı değildir. Hesaba işlenmiş banka/nakit/kart
  hareketi tek tek SİLİNEMEZ; yalnız başlığı ve açıklaması düzenlenebilir ya da
  ait olduğu ekstre yüklemesi tümüyle geri alınabilir. Tanım listeleri
  (başlıklar, yatırım araçları, abonelikler, hesaplar) silinmek yerine Pasif'e
  alınır, böylece geçmiş raporlar bozulmaz. Yedek, bütün veriyi tek JSON
  dosyasına dışa aktarıp aynı dosyadan geri yükleyerek alınır. Bütün tutarlar
  ₺ TRY, binlik nokta ondalık virgül (12.400,00); tarihler 22.05.2025 · 14:30.

### Sayfa künyeleri

#### Panel
Açılışta karşılayan ekran: bankadaki, yatırımdaki ve bu ay harcanabilecek
paranın özeti ile gelecek iki ayın gidişatı.

- **Tür:** Panel · **Ölçek:** Az
- **Alanlar:** Bankadaki Param (Para) · Yatırımdaki Param (Para) ·
  Bu Ay Kalan Harcanabilir (Para) · Bütçe Aşım Uyarısı (Evet/Hayır)
- **Bu sayfada farklı:** yalnız Ara ve Filtrele.
  Kural: Bankadaki Param = bütün Banka Hesabı ve Nakit Cüzdan hesaplarının
  güncel bakiye toplamı. Yatırımdaki Param = elde kalan adet × güncel fiyat
  toplamı. Bu Ay Kalan Harcanabilir = gider başlıklarına girilen aylık
  limitlerin toplamı − bu ay gerçekleşen gider toplamı. Ortadaki grafik geçmişi
  değil GELECEK 2 AYI gösterir ve verisini Nakit Akış Raporu'ndan çeker: ay ay
  gelir ve gider çubukları. Bu ekranda kayıt eklenmez, değiştirilmez.

#### Banka Hesapları
Paranın durduğu yerleri tanımlar: banka hesapları, nakit cüzdan ve kredi kartları.

- **Tür:** Liste · **Ölçek:** Az
- **Alanlar:** Hesap Adı (Metin, zorunlu) · Hesap Türü (Seçenek, zorunlu:
  Banka Hesabı | Nakit Cüzdan | Kredi Kartı) · Banka Adı (Metin) ·
  Devir Bakiye (Para, zorunlu) · Devir Tarihi (Tarih, zorunlu) ·
  Son Ödeme Günü (Sayı) · Güncel Bakiye (Para) ·
  Durum (Seçenek, zorunlu: Aktif | Pasif)
- **Bu sayfada farklı:** Kural: Hesaplar sayfasının ilk sekmesidir (Banka ·
  Yatırımlar · Abonelikler üst yatay sekme). Devir Bakiye her hesap türü için
  girilir; Kredi Kartı'nda devir BORCU anlamına gelir ve eksi bakiye olarak
  durur. Son Ödeme Günü yalnız Hesap Türü = Kredi Kartı iken doldurulur (ayın
  kaçı, 1-31) ve Nakit Akış Raporu'na kart borcu ödemesi olarak düşer. Hesap
  silinmez, Pasif'e alınır.

#### Banka Hareketleri
Bir hesaba giren ve çıkan bütün paranın tarih sıralı listesi, her satırda o
işlemden sonra kalan bakiye ile.

- **Tür:** Liste · **Ölçek:** Orta
- **Alanlar:** Hesap (İlişki, zorunlu → Banka Hesapları) · Tarih (Tarih,
  zorunlu) · Açıklama (Metin, zorunlu) · Tutar (Para, zorunlu) ·
  Yön (Seçenek, zorunlu: Gelir | Gider | Transfer) ·
  Gelir Başlığı (İlişki → Gelir Başlıkları) ·
  Gider Başlığı (İlişki → Gider Başlıkları) ·
  Karşı Hesap (İlişki → Banka Hesapları) · Dekont No (Metin) ·
  Yürüyen Bakiye (Para) · Bağlı Abonelik (İlişki → Abonelikler) ·
  Bağlı Yatırım İşlemi (İlişki → Yatırım İşlemleri) ·
  Ekstre Yüklemesi (İlişki → Ekstre Yükleme) ·
  Giriş Şekli (Seçenek, zorunlu: Ekstreden | Elle)
- **Yapı — Yürüyen bakiye:** Bakiye hesap türüne göre değişir; devir tutarından başlar.
- **Bu sayfada farklı:** Sil YOK; diğer eylemler var.
  Kural: SİLME YOK. Yanlış kayıt düzeltilmek istenirse ya başlığı/açıklaması
  düzenlenir ya da ait olduğu Ekstre Yüklemesi tümüyle geri alınır (o yüklemeden
  gelen bütün hareketler birden kalkar). Yön = Gelir ise yalnız Gelir Başlığı,
  Yön = Gider ise yalnız Gider Başlığı doldurulur; Yön = Transfer ise hiçbiri
  doldurulmaz, Karşı Hesap zorunlu olur ve bu hareket gelir/gider raporlarına
  GİRMEZ. ATM'den para çekme, bankadan nakit cüzdana Transfer'dir. Bankadan
  kredi kartına yapılan ödeme de Transfer'dir; karşı hesabı kart olduğu için
  kart borcunu düşürür. Nakit Cüzdan hareketleri yalnız elle girilir (ekstre
  yüklenmez). Kredi kartı harcamaları elle girilir ve kart hesabında borç
  doğurur. Yürüyen bakiye devir tutarından başlar; Banka Hesabı ve Nakit Cüzdan
  için giriş − çıkış, Kredi Kartı için harcama borcu artırır, ödeme azaltır.

#### Ekstre Yükleme
Bankadan indirilen Excel ekstresini yükleyip her hareketi tek tek
başlıklandırarak hesaba işlemek.

- **Tür:** Form · **Ölçek:** Az · **Aynı kaydı yazar:** Banka Hareketleri
  (iki ayrı tablo kurma; tek tablo, iki görünüm)
- **Alanlar:** Hesap (İlişki, zorunlu → Banka Hesapları) · Dosya (Dosya,
  zorunlu) · Yükleme Tarihi (Tarih-saat, zorunlu) · Toplam Satır (Sayı) ·
  Yeni Satır (Sayı) · Mevcut Satır (Sayı) · İşlenen Satır (Sayı) ·
  Durum (Seçenek, zorunlu: Önizleme | Başlık Atanıyor | İşlendi | Geri Alındı)
- **Yapı — Durum akışı:** Dosya yüklendi → Önizleme → Başlık atama → İşlendi.
  Geri alınabilir. Bitince değişebilir.
- **Bu sayfada farklı:** yalnız İçe aktar, Yüklemeyi geri al, Ara.
  Kural: Yalnız Excel kabul edilir; dosya xlsx (SheetJS) ile tarayıcıda okunur,
  hiçbir yere gönderilmez. Program dosyayı kendi tanır (sütunları kendi bulur,
  kullanıcıya sütun eşleştirmesi sordurulmaz). Mükerrer kayıt DEKONT NO ile
  engellenir: dosyadaki dekont no zaten varsa o satır "mevcut" sayılır.
  Önizlemede "N yeni · M mevcut" özeti ve satır listesi gösterilir; program
  daha önceki benzer açıklamalardan başlığı tahmin edip önerir ve bu öneri
  ÖNİZLEMEDE de görünür. Sonra sihirbaz başlar: telefon ekranında TEK BİR
  hareket görünür, sadece o işlemin bilgileri (tarih, açıklama, tutar); tutar
  eksiyse en üstte otomatik "Gider", artıysa "Gelir" yazar; en altta büyük
  harflerle "Lütfen Gider/Gelir grubu seçin" der; solda "Geri dön", sağda
  "Kaydet/İlerle" düğmesi vardır ve "İlerle" denince doğrudan bir sonraki
  hareket gelir. Hareketler ancak sihirbaz SONUNA KADAR bitince hesaba işlenir;
  yarıda bırakılırsa yükleme "Başlık Atanıyor" durumunda saklanır ve kullanıcı
  kaldığı hareketten devam eder (baştan başlamaz). Bu yüzden başlıksız hareket
  hiç oluşmaz. "Yüklemeyi geri al" o yüklemeden gelen bütün hareketleri birden
  kaldırır.

#### Yatırımlar
Elde tutulan yatırımların araç araç özeti: kaç adet var, kaça alınmış, bugün ne
ediyor, kâr mı zarar mı.

- **Tür:** Liste · **Ölçek:** Az
- **Alanlar:** Yatırım Aracı (İlişki, zorunlu → Yatırım Araçları) ·
  Elde Kalan Adet (Sayı) · Ortalama Maliyet (Para) · Güncel Fiyat (Para) ·
  Güncel Değer (Para) · Kâr/Zarar (Para)
- **Bu sayfada farklı:** yalnız Ara, Filtrele, Yazdır, Dışa aktar.
  Kural: Hesaplar sayfasının ikinci sekmesidir. Bu ekranda kayıt elle eklenmez;
  satırlar Yatırım İşlemleri'nden hesaplanır. Güncel Değer = Elde Kalan Adet ×
  Güncel Fiyat. Kâr/Zarar = Güncel Değer − (Elde Kalan Adet × Ortalama Maliyet).
  Güncel Fiyat, Yatırım Araçları'ndan gelir.

#### Yatırım İşlemleri
Yatırım alış ve satışlarını kaydeder; hangi hesaptan çıktığını, kaçtan ve kaç
adet alındığını tutar.

- **Tür:** Liste · **Ölçek:** Az
- **Alanlar:** İşlem Türü (Seçenek, zorunlu: Alış | Satış) · Tarih (Tarih,
  zorunlu) · Yatırım Aracı (İlişki, zorunlu → Yatırım Araçları) ·
  Adet (Sayı, zorunlu) · Birim Fiyat (Para, zorunlu) · Tutar (Para, zorunlu) ·
  Hesap (İlişki, zorunlu → Banka Hesapları) · Kâr/Zarar (Para)
- **Yapı — Stok hareketi:** Eksiye düşemez, engellenir. Tek yer. Ortalama maliyet.
- **Bu sayfada farklı:** Sil YOK; diğer eylemler var.
  Kural: Tutar = Adet × Birim Fiyat ve bu çarpım, bağlandığı banka/nakit
  hareketinin tutarına TAM DENK olmak zorundadır; tutmuyorsa kayıt kabul
  edilmez (komisyon/masraf ayrı bir gider hareketi olarak girilir). Adet
  küsuratlı girilebilir (0,5 gram · 12,75 dolar). Satış kısmi olabilir; elde
  olandan fazlası satılamaz. Alışta para hangi hesaptan çıkacak, satışta hangi
  hesaba girecek kullanıcı seçer (banka veya nakit). Satışta Kâr/Zarar =
  (Birim Fiyat − Ortalama Maliyet) × Adet. İşlem sırasında listede olmayan bir
  araç için oradan yeni Yatırım Aracı eklenebilir. Kayıt silinmez, düzeltilir.

#### Yatırım Araçları
Altın, döviz, hisse gibi yatırım araçlarının tanım listesi ve güncel fiyatları.

- **Tür:** Liste · **Ölçek:** Az
- **Alanlar:** Araç Adı (Metin, zorunlu) · Birim (Seçenek, zorunlu:
  Gram | Adet | Lot | Dolar | Euro) · Güncel Fiyat (Para) ·
  Güncel Fiyat Tarihi (Tarih) · Durum (Seçenek, zorunlu: Aktif | Pasif)
- **Bu sayfada farklı:** Kural: Fiyat internetten çekilmez. Güncel Fiyat iki
  yolla güncellenir: (1) o araçla yeni bir alış/satış girildiğinde işlemin birim
  fiyatı kendiliğinden güncel fiyat olur, (2) kullanıcı istediği zaman elle
  günceller. Araç silinmez, Pasif'e alınır. Hem Ayarlar'dan hem de Yatırımlar
  sekmesindeki ayar ikonundan açılır.

#### Abonelikler
Her ay tekrar eden Netflix, spor salonu gibi ödemelerin tanım listesi.

- **Tür:** Liste · **Ölçek:** Az
- **Alanlar:** Abonelik Adı (Metin, zorunlu) · Aylık Tutar (Para, zorunlu) ·
  Ödeme Günü (Sayı, zorunlu) · Ödendiği Hesap (İlişki, zorunlu →
  Banka Hesapları) · Gider Başlığı (İlişki → Gider Başlıkları) ·
  Durum (Seçenek, zorunlu: Aktif | Pasif)
- **Bu sayfada farklı:** Sil YOK; diğer eylemler var.
  Kural: Hesaplar sayfasının üçüncü sekmesidir. Ödeme Günü ayın kaçı olduğudur
  (1-31). Abonelik bırakıldığında SİLİNMEZ, Pasif'e alınır; geçmiş ödemeleri
  raporlarda durmaya devam eder. Aktif abonelikler Nakit Akış Raporu'na
  kendiliğinden akar, ayrıca rutin hareket girilmesi gerekmez.

#### Abonelik Ödemeleri
Her aboneliğin ay ay ödenip ödenmediğini tik olarak tutar.

- **Tür:** Liste · **Ölçek:** Orta
- **Alanlar:** Abonelik (İlişki, zorunlu → Abonelikler) · Dönem (Tarih,
  zorunlu) · Beklenen Tutar (Para, zorunlu) · Ödenen Tutar (Para) ·
  Ödendi (Evet/Hayır, zorunlu) · Eşleşen Hareket (İlişki → Banka Hareketleri)
- **Bu sayfada farklı:** yalnız Düzenle, Ara, Filtrele.
  Kural: Ekstre yüklenirken program hareketin açıklamasını abonelik adlarıyla
  karşılaştırır; iyi bir eşleşme bulursa o dönemin tikini kendiliğinden koyar ve
  Ödenen Tutar'ı yazar. EMİN DEĞİLSE kendi karar vermez, sihirbazda kullanıcıya
  "bu şu abonelik mi?" diye sorar. Kullanıcı otomatik konan tiki her zaman elle
  değiştirebilir. Ödenmemiş dönemler Abonelikler sekmesinde görünür kalır.

#### Gelir Başlıkları
Gelirlerin hangi başlık altında toplanacağını tanımlar (Maaş, Kira Geliri gibi).

- **Tür:** Liste · **Ölçek:** Az
- **Alanlar:** Başlık Adı (Metin, zorunlu) · Üst Başlık (İlişki →
  Gelir Başlıkları) · Durum (Seçenek, zorunlu: Aktif | Pasif)
- **Yapı — Ağaç liste:** Kod alanı YOK, başlık yalnız isimden ibaret.
  En çok 2 kat. Açılışta yalnız ana kayıtlar görünür.
- **Bu sayfada farklı:** yalnız Ekle, Düzenle, Ara.
  Kural: Gelir ve gider başlıkları AYRI iki listedir, birbirine karışmaz. Kod
  kullanılmaz. En fazla iki kat: ana başlık ve alt başlık. Kullanılmış bir
  başlık silinmez, Pasif'e alınır. Hem Ayarlar'dan hem de ilgili sayfadaki ayar
  ikonundan açılır.

#### Gider Başlıkları
Giderlerin hangi başlık altında toplanacağını ve her başlığın aylık bütçe
limitini tanımlar.

- **Tür:** Liste · **Ölçek:** Az
- **Alanlar:** Başlık Adı (Metin, zorunlu) · Üst Başlık (İlişki →
  Gider Başlıkları) · Aylık Bütçe Limiti (Para) ·
  Durum (Seçenek, zorunlu: Aktif | Pasif)
- **Yapı — Ağaç liste:** Kod alanı YOK. En çok 2 kat. Açılışta yalnız ana kayıtlar.
- **Bu sayfada farklı:** yalnız Ekle, Düzenle, Ara.
  Kural: Kod kullanılmaz. En fazla iki kat. Aylık Bütçe Limiti YALNIZ ANA
  BAŞLIĞA girilir, alt başlığa girilmez. Limit bir kez girilir ve her ay
  kendiliğinden geçerli olur; kullanıcı isterse yeni bir tutarla yeniler.
  Kullanılmış başlık silinmez, Pasif'e alınır.

#### Rutin Hareketler
Her ayın 5'i maaş, 8'i kira gibi tekrar eden gelecek gelir ve giderleri tanımlar.

- **Tür:** Liste · **Ölçek:** Az
- **Alanlar:** Adı (Metin, zorunlu) · Yön (Seçenek, zorunlu: Gelir | Gider) ·
  Tutar (Para, zorunlu) · Tekrar Sıklığı (Seçenek, zorunlu: Haftalık | Aylık |
  Yıllık | Özel Kalıp) · Haftanın Günü (Seçenek: Pazartesi | Salı | Çarşamba |
  Perşembe | Cuma | Cumartesi | Pazar) · Ayın Kaçıncı Haftası (Seçenek:
  1. hafta | 2. hafta | 3. hafta | 4. hafta | Son hafta) · Ayın Günü (Sayı) ·
  Ayı (Sayı) · Başlangıç Tarihi (Tarih, zorunlu) · Bitiş Tarihi (Tarih) ·
  Hesap (İlişki, zorunlu → Banka Hesapları) · Gelir Başlığı (İlişki →
  Gelir Başlıkları) · Gider Başlığı (İlişki → Gider Başlıkları) ·
  Durum (Seçenek, zorunlu: Aktif | Pasif)
- **Bu sayfada farklı:** yalnız Ekle, Düzenle, Ara, Filtrele.
  Kural: Tekrar Sıklığı = Aylık ise Ayın Günü doldurulur (her ayın 5'i).
  Haftalık ise Haftanın Günü. Yıllık ise Ayı + Ayın Günü. Özel Kalıp ise Ayın
  Kaçıncı Haftası + Haftanın Günü (her ayın 2. salısı gibi). Abonelikler ve
  kredi kartı son ödeme günleri buraya elle GİRİLMEZ, kendiliğinden Nakit Akış
  Raporu'na akar. Rutin silinmez, Pasif'e alınır.

#### Gelirler Raporu
Gelirleri ay ay ve başlık başlık gösterir.

- **Tür:** Liste · **Ölçek:** Orta
- **Alanlar:** Ay (Tarih, zorunlu) · Gelir Başlığı (İlişki, zorunlu →
  Gelir Başlıkları) · Tutar (Para, zorunlu) · Hareket Sayısı (Sayı)
- **Bu sayfada farklı:** yalnız Ara, Filtrele, Yazdır, Dışa aktar.
  Kural: Salt okunur. Ay ay gelirleri gösterir. Ana başlığa dokununca önce ALT
  BAŞLIKLARI açılır, alt başlığa dokununca o başlığın hareketleri listelenir.
  Transfer hareketleri bu rapora girmez.

#### Giderler Raporu
Seçilen ayın giderlerini başlık başlık gösterir; başlığa dokununca detayı açılır.

- **Tür:** Liste · **Ölçek:** Orta
- **Alanlar:** Ay (Tarih, zorunlu) · Gider Başlığı (İlişki, zorunlu →
  Gider Başlıkları) · Tutar (Para, zorunlu) · Hareket Sayısı (Sayı) ·
  Aylık Bütçe Limiti (Para) · Limit Aşıldı (Evet/Hayır)
- **Bu sayfada farklı:** yalnız Ara, Filtrele, Yazdır, Dışa aktar.
  Kural: Salt okunur. Dönem, filtre panelinden seçilir. Ana başlığa dokununca
  önce ALT BAŞLIKLARI açılır (Aile Harcaması → Market, Okul), alt başlığa
  dokununca o başlığın hareketleri listelenir. Başlık listesinin en altında
  ayrıca "Kredi Kartı Harcamaları" diye tek bir satır durur; ona dokununca
  kartla yapılan bütün harcamalar açılır. Limiti aşan satır kırmızı gösterilir.
  Transfer hareketleri bu rapora girmez; bankadan karta yapılan ödeme gider
  sayılmaz, kart harcamasının kendisi gider sayılır.

#### Bu Ay N'oldu Raporu
Ay başında ne kadar paran vardı, ay sonunda ne oldu — madde madde gösterir.

- **Tür:** Detay · **Ölçek:** Az
- **Alanlar:** Ay (Tarih, zorunlu) · Ay Başı Toplam Varlık (Para, zorunlu) ·
  Toplam Gelir (Para, zorunlu) · Toplam Gider (Para, zorunlu) ·
  Yatırım Kâr/Zararı (Para, zorunlu) · Ay Sonu Toplam Varlık (Para, zorunlu)
- **Bu sayfada farklı:** yalnız Filtrele, Yazdır, Dışa aktar.
  Kural: Salt okunur. Toplam Varlık = banka + nakit + yatırımların güncel değeri
  − kredi kartı borcu. Sıra: Ay Başı Toplam Varlık → + Toplam Gelir → − Toplam
  Gider → ± Yatırım Kâr/Zararı → Ay Sonu Toplam Varlık. İlkokul mezununun
  anlayacağı sadelikte, madde madde ve tek sütun yazılır.

#### Nakit Akış Raporu
Önümüzdeki 6 ayda hangi gün ne kadar para girecek ve çıkacak, bakiye nasıl
gidecek gösterir.

- **Tür:** Liste · **Ölçek:** Orta
- **Alanlar:** Tarih (Tarih, zorunlu) · Adı (Metin, zorunlu) ·
  Kaynak (Seçenek, zorunlu: Rutin Hareket | Abonelik | Kredi Kartı Ödemesi) ·
  Yön (Seçenek, zorunlu: Gelir | Gider) · Tahmini Tutar (Para, zorunlu) ·
  Gerçekleşen Tutar (Para) · Durum (Seçenek, zorunlu: Tahmini | Gerçekleşti) ·
  Tahmini Bakiye (Para)
- **Bu sayfada farklı:** yalnız Ekle, Düzenle, Filtrele, Yazdır, Dışa aktar.
  Kural: İleriye dönük 6 AY gösterir. Satırlar üç kaynaktan gelir: Rutin
  Hareketler, Aktif Abonelikler (kendiliğinden) ve kredi kartlarının son ödeme
  günleri (kendiliğinden). Beklenen tarih gelip banka hareketiyle eşleşince
  satır "Gerçekleşti" olarak işaretlenir ve tahmini tutar GERÇEKLEŞEN TUTARA
  döner. Bu ekrandaki "Ekle" düğmesi Rutin Hareketler'e yeni kayıt açar.
  Panel'in ortasındaki gelecek 2 aylık grafik verisini bu rapordan çeker.

#### Bütçe Planlama Raporu
Her gider başlığı için konan aylık limitin ne kadarının harcandığını ve ne kadar
kaldığını gösterir.

- **Tür:** Liste · **Ölçek:** Az
- **Alanlar:** Ay (Tarih, zorunlu) · Gider Başlığı (İlişki, zorunlu →
  Gider Başlıkları) · Aylık Limit (Para, zorunlu) · Harcanan (Para, zorunlu) ·
  Kalan (Para, zorunlu) · Doluluk Yüzdesi (Sayı) · Limit Aşıldı (Evet/Hayır)
- **Bu sayfada farklı:** yalnız Düzenle, Filtrele, Yazdır, Dışa aktar.
  Kural: Limit yalnız ANA gider başlıklarına girilir; alt başlıkların
  harcamaları ana başlığın limitine sayılır. Limit bir kez girilir, her ay
  kendiliğinden geçerlidir; kullanıcı isterse buradan yeniler. Kalan = Limit −
  Harcanan. Limiti aşan satır KIRMIZI gösterilir ve ayrıca Panel'de uyarı
  çıkar. Panel'deki "Bu Ay Kalan Harcanabilir" kartı bu raporun toplam kalanıdır.

#### Ayarlar
Tanım listeleri, sürüm, güncelleme, yedek ve değişiklik kaydının tek yerden
yönetildiği ekran.

- **Tür:** Ayarlar · **Ölçek:** Az
- **Alanlar:** Sürüm (Metin) · Son Yedek Tarihi (Tarih-saat) ·
  Yedek Dosyası (Dosya) · Kullanılan Alan (Metin)
- **Bu sayfada farklı:** yalnız Düzenle, Ara, Dışa aktar, İçe aktar.
  Kural: Tepede ayar araması, altında gruplu liste. Buradan açılan tanım
  listeleri: Gelir Başlıkları, Gider Başlıkları, Yatırım Araçları, Banka
  Hesapları (hesap ve kart tanımları), Bütçe Limitleri, Abonelikler. Aynı
  listeler ilgili sayfadaki ayar ikonuna basınca da açılır. Ayrıca: uygulamayı
  güncelle düğmesi ve altında sürüm etiketi (YIL.SAYAÇ). GÜVENLİK: "PIN Değiştir"
  ve "Kurtarma Cevabını Değiştir" buradadır; ikisi de veriyi bozmaz, yalnız veri
  anahtarını yeniden sarar. VERİ: yedek alma — bütün veri tek JSON dosyasına dışa aktarılır ve aynı JSON dosyasından
  geri yüklenir (geri yükleme mevcut veriyi değiştireceği için pencere ile onay
  ister); isteğe bağlı Excel dışa aktarım yalnız okumak içindir, geri
  yüklenmez; ve neyin ne zaman değiştiğini gösteren değişiklik kaydı listesi.
  Veri cihazda durduğu için yedeği almak kullanıcının sorumluluğundadır;
  uygulama uzun süre yedek alınmadıysa uyarır.

### Ekranlar arası geçiş

| Nereden | Nereye | Ne zaman |
|---|---|---|
| Panel | Nakit Akış Raporu | Ortadaki gelecek 2 aylık grafiğe dokununca |
| Panel | Bütçe Planlama Raporu | Bütçe aşım uyarısına ya da "Bu Ay Kalan Harcanabilir" kartına dokununca |
| Panel | Yatırımlar | "Yatırımdaki Param" kartına dokununca |
| Panel | Banka Hesapları | "Bankadaki Param" kartına dokununca |
| Banka Hesapları | Banka Hareketleri | Bir hesaba ya da karta dokununca yürüyen bakiyeli hareket listesi açılır |
| Banka Hesapları | Ekstre Yükleme | Hesabın üstündeki "Ekstre yükle" düğmesine basınca |
| Ekstre Yükleme | Banka Hareketleri | Sihirbaz bitince hareketler işlenir ve liste açılır |
| Ekstre Yükleme | Gider Başlıkları | Sihirbazda listede olmayan başlık gerekince |
| Ekstre Yükleme | Abonelik Ödemeleri | Bir hareket abonelikle eşleşince o dönemin tiki işaretlenir |
| Banka Hareketleri | Yatırım İşlemleri | Bir para çıkışına "Yatırım" denince araç, fiyat, adet sorulur |
| Yatırımlar | Yatırım İşlemleri | Bir araca dokununca alış/satış geçmişi açılır |
| Yatırım İşlemleri | Yatırım Araçları | İşlem girerken listede olmayan araç için |
| Yatırım İşlemleri | Banka Hareketleri | Alışta çıkış, satışta giriş hareketi oluşur |
| Abonelikler | Abonelik Ödemeleri | Bir aboneliğe dokununca ay ay tikler açılır |
| Abonelikler | Nakit Akış Raporu | Aktif abonelikler kendiliğinden satır olarak görünür |
| Nakit Akış Raporu | Rutin Hareketler | "+" ile yeni rutin eklenince ya da var olana dokununca |
| Raporlar | Gelirler Raporu | Rapor listesinden seçilince |
| Raporlar | Giderler Raporu | Rapor listesinden seçilince |
| Raporlar | Bu Ay N'oldu Raporu | Rapor listesinden seçilince |
| Raporlar | Nakit Akış Raporu | Rapor listesinden seçilince |
| Raporlar | Bütçe Planlama Raporu | Rapor listesinden seçilince |
| Giderler Raporu | Banka Hareketleri | Ana başlık → alt başlıklar, alt başlık → hareketler |
| Gelirler Raporu | Banka Hareketleri | Bir gelir başlığına dokununca |
| Bütçe Planlama Raporu | Gider Başlıkları | Bir satırın limitini değiştirmek için dokununca |
| Ayarlar | Gelir Başlıkları | Ayarlar listesinden seçilince |
| Ayarlar | Gider Başlıkları | Ayarlar listesinden seçilince |
| Ayarlar | Yatırım Araçları | Ayarlar listesinden seçilince |
| Ayarlar | Banka Hesapları | Ayarlar listesinden "Hesap ve Kart Tanımları" seçilince |

### Kurulurken yüklenecek hazır veri

- **Gelir Başlıkları:** Maaş · Ek Gelir (Prim, Freelance) · Kira Geliri ·
  Yatırım Getirisi (Faiz, Temettü) · Borç Tahsilatı · Hediye/Yardım ·
  Diğer Gelir
- **Gider Başlıkları (iki kat):** Konut (Kira, Aidat, Elektrik, Su, Doğalgaz,
  İnternet) · Market (Market Alışverişi, Manav-Kasap) · Ulaşım (Yakıt, Toplu
  Taşıma, Otopark, Araç Bakım) · Aile Harcaması (Okul, Çocuk, Bakım) · Sağlık
  (İlaç, Doktor, Sigorta) · Yeme-İçme (Restoran, Kafe) · Giyim · Abonelikler ·
  Eğlence · Borç ve Kredi (Kredi Taksiti, Kredi Kartı Faizi) · Vergi ve Harç ·
  Diğer Gider
- **Yatırım Araçları:** Gram Altın (Gram) · Çeyrek Altın (Adet) · Yarım Altın
  (Adet) · Tam Altın (Adet) · Cumhuriyet Altını (Adet) · Ons Altın (Adet) ·
  Gram Gümüş (Gram) · Dolar (Dolar) · Euro (Euro) · Sterlin (Adet) ·
  Hisse Senedi (Lot) · Yatırım Fonu (Adet) · Kripto Para (Adet)

Üçü de kullanıcı tarafından sonradan eklenip çıkarılabilir.

### Çıktılar

| Belge | Nereden | Biçim |
|---|---|---|
| Gelirler Raporu | Gelirler Raporu | PDF |
| Giderler Raporu | Giderler Raporu | PDF |
| Bu Ay N'oldu Raporu | Bu Ay N'oldu Raporu | PDF |
| Nakit Akış Raporu | Nakit Akış Raporu | PDF |
| Bütçe Planlama Raporu | Bütçe Planlama Raporu | PDF |
| Hesap Ekstresi | Banka Hareketleri | PDF |
| Veri Yedeği (tam veri) | Ayarlar | JSON |
| Hareket Listesi (isteğe bağlı) | Banka Hareketleri | Excel |
| Rapor Tabloları (isteğe bağlı) | Giderler Raporu | Excel |

### Yayın

Yayın adresi: `https://nizamsoft.github.io/NIZAMSOFT-KisiselButce`
GitHub Pages projeyi alt klasörden yayınlar. Bu yüzden:

- Bütün yollar **göreli** olsun: `style.css`, `./app.js`, `./icon.png`.
  Kök yol (`/style.css`) kullanılmaz — yayında kırılır.
- Servis işçisinin önbelleklediği yollar ve PWA manifestindeki `start_url`
  da göreli olsun.
- Depo kökünde boş bir `.nojekyll` dosyası durur; yoksa GitHub bazı dosyaları
  yok sayar.

### Kodlama aşamaları

Hepsi bir seferde yazılmaz. Her aşamanın sonunda durulur, ne yapıldığı
özetlenir ve kullanıcıdan denemesi istenir. Onay gelmeden sonrakine geçilmez.

1. **İskelet ve tema** — Renk, yazı tipi ve ölçüler tek dosyada değişken olarak;
   uygulama kabuğu (üst çubuk, gezinme, genişlik); açılış ve PIN ekranı;
   bütün sayfalar boş olarak açılır (yalnız başlık ve boş durum).
2. **Veri ve ana ekranlar** — Veri tabloları ve şifreli IndexedDB katmanı;
   Panel gerçek veriyle; bir liste ekranı tam (tablo, arama, filtre,
   sayfalama); telefonda tablo iki satır.
3. **Kayıt işlemleri** — Veri giriş ekranı (ekleme, düzenleme); detay ekranı;
   silme ve onay akışı; kalan liste ekranları aynı kalıpla.
4. **Uç durumlar ve ayarlar** — Boş durum, yükleme, hata ekranları; bildirim ve
   işlem sonucu; Ayarlar, yedek ve içe aktarma; roller ve yetkiler.
5. **Hareket ve cila** — Sayfa geçişi, dokunma tepkisi, açılma animasyonları;
   güncelleme akışı ve sürüm etiketi; erişilebilirlik; performans.

Her aşamanın içinde "Tasarım kararları → Uygulama sırası" bölümündeki sıra izlenir.

## Kararlar

henüz belirlenmedi
