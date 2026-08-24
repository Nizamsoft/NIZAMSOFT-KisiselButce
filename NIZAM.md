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
- **Giriş: Yerel PIN**
  - Sunucu ve hesap yoktur; kimlik doğrulama uzakta değil, cihazda yapılır.
    Uygulama açılınca PIN sorar. PIN de veri gibi cihazda durur, hiçbir yere
    gönderilmez. Kayıt ekranı yoktur; PIN ilk açılışta kurulur.
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
- PIN'in kaç haneli olacağı
- PIN unutulursa ne olacağı
- PIN'in her açılışta mı sorulacağı
- PIN'in veriyi şifreleyip şifrelemeyeceği

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
  - Ortada tek kart: logo ve PIN girişi. Sunucu olmadığı için e-posta ve şifre
    yoktur; kartın içinde yalnız PIN alanı ve giriş düğmesi durur.

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

henüz belirlenmedi

## Kararlar

henüz belirlenmedi
