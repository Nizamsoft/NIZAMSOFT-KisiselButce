/* Nizam Soft · Kişisel Bütçe — yedek alma ve geri yükleme
 *
 * Bütün veri tek JSON dosyasına aktarılır, aynı dosyadan geri yüklenir.
 * Veri cihazda durduğu için yedeği almak kullanıcının sorumluluğundadır.
 *
 * DİKKAT: Yedek dosyası ŞİFRESİZDİR. Cihazdaki veri PIN'le şifreli durur ama
 * dışa aktarılan dosya düz JSON'dur — başka bir yerde okunabilsin diye. Bu
 * yüzden kullanıcıya dosyayı güvenli bir yerde tutması söylenir.
 */

import * as vt from './veri/vt.js';
import { TABLO_ADLARI } from './veri/tablolar.js';
import { SURUM, UYGULAMA_ADI, FIRMA_ADI } from './surum.js';

const BICIM_SURUMU = 1;

/* Yedeğe girmeyen tablolar: uygulamanın kendi ayarları. */
const HARIC = ['ayarlar'];

/** Bütün veriyi yedek nesnesine toplar. */
export async function yedekOlustur() {
  const veri = {};
  for (const tablo of TABLO_ADLARI) {
    if (HARIC.includes(tablo)) continue;
    veri[tablo] = await vt.hepsi(tablo);
  }
  return {
    uygulama: `${FIRMA_ADI} · ${UYGULAMA_ADI}`,
    bicimSurumu: BICIM_SURUMU,
    uygulamaSurumu: SURUM,
    alinmaZamani: new Date().toISOString(),
    kayitSayisi: Object.fromEntries(Object.entries(veri).map(([t, k]) => [t, k.length])),
    veri,
  };
}

/** Yedeği dosya olarak indirir. */
export async function yedegiIndir() {
  const yedek = await yedekOlustur();
  const metin = JSON.stringify(yedek, null, 2);
  const damga = yedek.alinmaZamani.slice(0, 10);
  const ad = `kisisel-butce-yedek-${damga}.json`;

  const bag = document.createElement('a');
  bag.href = URL.createObjectURL(new Blob([metin], { type: 'application/json' }));
  bag.download = ad;
  document.body.append(bag);
  bag.click();
  setTimeout(() => { URL.revokeObjectURL(bag.href); bag.remove(); }, 1000);

  await ayarYaz('sonYedekTarihi', yedek.alinmaZamani);
  return { ad, boyut: metin.length, sayilar: yedek.kayitSayisi };
}

/** Yedek dosyasını okur ve denetler; içeriği döndürür. */
export async function yedegiOku(dosya) {
  let yedek;
  try {
    yedek = JSON.parse(await dosya.text());
  } catch {
    throw new Error('Bu dosya okunamadı. Yedek dosyası JSON biçiminde olmalı.');
  }
  if (!yedek || typeof yedek !== 'object' || !yedek.veri) {
    throw new Error('Bu bir Kişisel Bütçe yedeği değil.');
  }
  if (yedek.bicimSurumu > BICIM_SURUMU) {
    throw new Error('Bu yedek uygulamanın daha yeni bir sürümünden. Önce uygulamayı güncelle.');
  }
  const bilinmeyen = Object.keys(yedek.veri).filter(t => !TABLO_ADLARI.includes(t));
  if (bilinmeyen.length) {
    throw new Error('Yedekte tanınmayan bölümler var: ' + bilinmeyen.join(', '));
  }
  return yedek;
}

/**
 * Yedeği geri yükler. MEVCUT VERİNİN YERİNE GEÇER — çağırmadan önce
 * kullanıcıdan pencere ile onay alınmalıdır.
 */
export async function yedegiGeriYukle(yedek) {
  const sayilar = {};
  for (const [tablo, kayitlar] of Object.entries(yedek.veri)) {
    if (HARIC.includes(tablo)) continue;
    /* Önce tabloyu boşalt, sonra yedekteki kayıtları kimlikleriyle yaz. */
    const mevcut = await vt.hepsi(tablo);
    for (const k of mevcut) await vt.sil(tablo, k.id, 'Geri yükleme');
    if (kayitlar.length) await vt.topluEkle(tablo, kayitlar);
    sayilar[tablo] = kayitlar.length;
  }
  return sayilar;
}

/* --------------------------------------------------------- uygulama ayarı */

/** Uygulamanın kendi ayarları (son yedek tarihi gibi). */
export async function ayarOku(anahtar) {
  const kayit = await vt.oku('ayarlar', anahtar);
  return kayit ? kayit.deger : null;
}

export async function ayarYaz(anahtar, deger) {
  const mevcut = await vt.oku('ayarlar', anahtar);
  if (mevcut) await vt.guncelle('ayarlar', anahtar, { deger });
  else await vt.ekle('ayarlar', { id: anahtar, deger });
}

/** Tarayıcının bu uygulamaya ayırdığı ve kullanılan alan. */
export async function kullanilanAlan() {
  if (!navigator.storage?.estimate) return null;
  const { usage, quota } = await navigator.storage.estimate();
  return { kullanilan: usage || 0, ayrilan: quota || 0 };
}

/** Bayt sayısını okunur hâle getirir. */
export function boyutYaz(bayt) {
  if (!bayt) return '0 KB';
  if (bayt < 1024 * 1024) return (bayt / 1024).toFixed(0) + ' KB';
  return (bayt / 1024 / 1024).toFixed(1) + ' MB';
}
