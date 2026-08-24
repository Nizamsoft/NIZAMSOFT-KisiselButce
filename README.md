# Kişisel Bütçe

**Nizam Soft**

Gelir ve giderini tek yerden takip etmeni sağlayan mobil öncelikli kişisel muhasebe uygulaması.

Yayın: <https://nizamsoft.github.io/NIZAMSOFT-KisiselButce>

## Nasıl çalışır

- Sunucu yok. Bütün veri kullanıcının tarayıcısında, IndexedDB'de **şifreli** durur.
- Giriş 6 haneli **yerel PIN** ile. PIN unutulursa sabit kurtarma sorusu sorulur.
- Yedek, bütün veriyi tek JSON dosyasına aktarıp aynı dosyadan geri yükleyerek alınır.
- Derleme adımı, paket yöneticisi ve `node_modules` yoktur; dosyalar doğrudan çalışır.

Bütün kararlar ve sayfa künyeleri [`NIZAM.md`](./NIZAM.md) dosyasındadır.

## Yerelde çalıştırma

Servis işçisi ve modüller `file://` üstünde çalışmaz; basit bir sunucu yeter:

```
python3 -m http.server 8000
```

Sonra <http://localhost:8000> adresini aç.
