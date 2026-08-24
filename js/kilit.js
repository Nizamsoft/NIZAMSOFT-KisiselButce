/* Nizam Soft · Kişisel Bütçe — kilit (yerel PIN ve şifreleme)
 *
 * Sunucu yoktur. Kimlik doğrulama cihazda yapılır ve veri cihazda şifreli durur.
 *
 * Nasıl çalışır:
 *   Veri rastgele bir anahtarla (DEK) şifrelenir. Bu anahtarın İKİ kilitli
 *   kopyası saklanır — biri 6 haneli PIN'den, biri kurtarma cevabından
 *   türetilen anahtarla sarılmış. İkisi de aynı DEK'i açar. PIN unutulunca
 *   kurtarma cevabı DEK'i açar, kullanıcı yeni PIN belirler ve DEK yeni PIN'le
 *   yeniden sarılır — veri kaybolmaz.
 *
 * Uyarı: veri, PIN kadar kurtarma cevabı kadar da güçlüdür.
 * Şifreleme tarayıcının kendi Web Crypto'suyladır; paket kullanılmaz.
 */

import { islem, KILIT_DEPOSU } from './veri/db.js';

const KAYIT_ID = 'kilit';

export const PIN_UZUNLUK = 6;
export const KURTARMA_SORUSU = 'İlk Evcil Hayvanının adı';

const YINELEME = 250000;   // PBKDF2 tur sayısı
const TUZ_UZUNLUK = 16;
const IV_UZUNLUK = 12;

/* Bellekte tutulan çözülmüş anahtar. Diske hiç yazılmaz. */
let acikAnahtar = null;

/* ---------------------------------------------------------------- yardımcı */

/**
 * Kurtarma cevabını karşılaştırma biçimine getirir.
 * Büyük/küçük harf ve Türkçe/İngilizce karakter farkı önemsenmez,
 * baştaki ve sondaki boşluklar atılır: "Budy" = "budy" = " BUDY ".
 */
export function cevabiSadelestir(metin) {
  return String(metin || '')
    // Türkçe i'leri toLowerCase'ten ÖNCE sadeleştir; yoksa birleşik nokta kalır
    .replace(/[İIıi]/g, 'i')
    .toLowerCase()
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[âà]/g, 'a')
    .replace(/[îì]/g, 'i')
    .replace(/[ûù]/g, 'u')
    .replace(/[êè]/g, 'e')
    .replace(/\s+/g, ' ')
    .trim();
}

function rastgele(uzunluk) {
  return crypto.getRandomValues(new Uint8Array(uzunluk));
}

/** Metinden PBKDF2 ile AES-GCM sarma anahtarı türetir. */
async function anahtarTuret(metin, tuz) {
  const ham = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(metin), 'PBKDF2', false, ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: tuz, iterations: YINELEME, hash: 'SHA-256' },
    ham,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/** DEK'i verilen metinle sarar; {tuz, iv, sarili} döndürür. */
async function sar(dek, metin) {
  const tuz = rastgele(TUZ_UZUNLUK);
  const iv = rastgele(IV_UZUNLUK);
  const sarmaAnahtari = await anahtarTuret(metin, tuz);
  const dekHam = await crypto.subtle.exportKey('raw', dek);
  const sarili = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, sarmaAnahtari, dekHam);
  return { tuz, iv, sarili: new Uint8Array(sarili) };
}

/** Sarılı DEK'i açar. Metin yanlışsa null döner (hata fırlatmaz). */
async function coz(paket, metin) {
  try {
    const sarmaAnahtari = await anahtarTuret(metin, paket.tuz);
    const ham = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: paket.iv }, sarmaAnahtari, paket.sarili
    );
    return await crypto.subtle.importKey(
      'raw', ham, { name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']
    );
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------ IndexedDB */
/* Bağlantı ve sürüm veri/db.js'te; burada yalnız kilit kaydı okunup yazılır. */

function kayitOku() {
  return islem(KILIT_DEPOSU, 'readonly', d => d.get(KAYIT_ID)).then(k => k || null);
}

function kayitYaz(kayit) {
  return islem(KILIT_DEPOSU, 'readwrite', d => d.put(kayit)).then(() => true);
}

/* ------------------------------------------------------------------ genel */

/** Bu cihazda daha önce PIN kurulmuş mu? */
export async function kurulduMu() {
  return (await kayitOku()) !== null;
}

/** İlk açılış: PIN ve kurtarma cevabı birlikte alınır. */
export async function kur(pin, kurtarmaCevabi) {
  const dek = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']
  );
  const pinPaket = await sar(dek, 'pin:' + pin);
  const cevapPaket = await sar(dek, 'cevap:' + cevabiSadelestir(kurtarmaCevabi));
  await kayitYaz({
    id: KAYIT_ID,
    yineleme: YINELEME,
    pinTuz: pinPaket.tuz, pinIv: pinPaket.iv, pinSarili: pinPaket.sarili,
    cevapTuz: cevapPaket.tuz, cevapIv: cevapPaket.iv, cevapSarili: cevapPaket.sarili,
    olusturma: new Date().toISOString(),
  });
  acikAnahtar = dek;
  return true;
}

/** PIN ile açar. Doğruysa true, yanlışsa false. */
export async function ac(pin) {
  const kayit = await kayitOku();
  if (!kayit) return false;
  const dek = await coz(
    { tuz: kayit.pinTuz, iv: kayit.pinIv, sarili: kayit.pinSarili }, 'pin:' + pin
  );
  if (!dek) return false;
  acikAnahtar = dek;
  return true;
}

/** Kurtarma cevabıyla açar. Doğruysa true — sonra yeni PIN belirlenmeli. */
export async function kurtarmaIleAc(kurtarmaCevabi) {
  const kayit = await kayitOku();
  if (!kayit) return false;
  const dek = await coz(
    { tuz: kayit.cevapTuz, iv: kayit.cevapIv, sarili: kayit.cevapSarili },
    'cevap:' + cevabiSadelestir(kurtarmaCevabi)
  );
  if (!dek) return false;
  acikAnahtar = dek;
  return true;
}

/**
 * Açık anahtarı yeni PIN'le yeniden sarar. Kurtarmadan sonra ve
 * Ayarlar'daki "PIN değiştir" işleminde kullanılır. Veri değişmez.
 */
export async function pinDegistir(yeniPin) {
  if (!acikAnahtar) return false;
  const kayit = await kayitOku();
  if (!kayit) return false;
  const pinPaket = await sar(acikAnahtar, 'pin:' + yeniPin);
  kayit.pinTuz = pinPaket.tuz;
  kayit.pinIv = pinPaket.iv;
  kayit.pinSarili = pinPaket.sarili;
  await kayitYaz(kayit);
  return true;
}

/** Kurtarma cevabını değiştirir (PIN açıkken). */
export async function kurtarmaCevabiDegistir(yeniCevap) {
  if (!acikAnahtar) return false;
  const kayit = await kayitOku();
  if (!kayit) return false;
  const paket = await sar(acikAnahtar, 'cevap:' + cevabiSadelestir(yeniCevap));
  kayit.cevapTuz = paket.tuz;
  kayit.cevapIv = paket.iv;
  kayit.cevapSarili = paket.sarili;
  await kayitYaz(kayit);
  return true;
}

/** Veri katmanının kullanacağı anahtar. Kilitliyken null. */
export function anahtar() {
  return acikAnahtar;
}

export function acikMi() {
  return acikAnahtar !== null;
}

/** Uygulamayı kilitler; anahtar bellekten düşer. */
export function kilitle() {
  acikAnahtar = null;
}
