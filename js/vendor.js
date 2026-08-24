/* Nizam Soft · Kişisel Bütçe — dış paketlerin geç yüklenmesi
 *
 * xlsx ve pdfmake toplam ~3 MB. Açılışta yüklenirlerse uygulama ağır açılır;
 * bu yüzden ilk gerektiğinde yüklenirler. Servis işçisi bu dosyaları ilk
 * kullanımdan sonra önbelleğe aldığı için sonraki seferler çevrimdışı da çalışır.
 */

const yuklenen = new Map();

function betikYukle(yol) {
  if (yuklenen.has(yol)) return yuklenen.get(yol);
  const soz = new Promise((tamam, hata) => {
    const oge = document.createElement('script');
    oge.src = yol;
    oge.onload = () => tamam(true);
    oge.onerror = () => { yuklenen.delete(yol); hata(new Error(yol + ' yüklenemedi.')); };
    document.head.append(oge);
  });
  yuklenen.set(yol, soz);
  return soz;
}

/** Excel okuma ve yazma (SheetJS). */
export async function xlsxYukle() {
  if (!window.XLSX) await betikYukle('./vendor/js/xlsx.full.min.js');
  if (!window.XLSX) throw new Error('Excel okuyucu yüklenemedi.');
  return window.XLSX;
}

/** PDF üretimi (pdfmake + Türkçe karakterleri tam olan Roboto). */
export async function pdfYukle() {
  if (!window.pdfMake?.createPdf) {
    await betikYukle('./vendor/js/pdfmake.min.js');
    await betikYukle('./vendor/js/vfs_fonts.js');
  }
  if (!window.pdfMake?.createPdf) throw new Error('PDF üretici yüklenemedi.');
  return window.pdfMake;
}
