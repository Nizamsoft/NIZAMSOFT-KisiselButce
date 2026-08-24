/* Nizam Soft · Kişisel Bütçe — veri katmanı (şifreli IndexedDB)
 *
 * Her kayıt IndexedDB'ye {id, iv, sifre} olarak yazılır: alanların hiçbiri
 * düz metin durmaz. Bu yüzden IndexedDB dizini de kullanılmaz — dizin anahtarı
 * düz durmak zorunda olurdu. Onun yerine tablo bir kez çözülüp bellekte
 * tutulur, süzme ve sıralama bellekte yapılır. Ölçek "birkaç bin kayıt"
 * olduğu için bu yeterlidir ve şifrelemeyi delmez.
 *
 * Anahtar kilit.js'ten gelir; uygulama kilitliyken hiçbir okuma/yazma olmaz.
 */

import { anahtar, acikMi } from '../kilit.js';
import { TABLO_ADLARI } from './tablolar.js';
import { islem } from './db.js';

/** tablo → çözülmüş kayıt dizisi. Yazma olunca ilgili tablo düşer. */
const bellek = new Map();

/* ------------------------------------------------------- şifrele / çöz */

const metneCevir = new TextEncoder();
const metneDon = new TextDecoder();

async function sifrele(nesne) {
  const dek = anahtar();
  if (!dek) throw new Error('Uygulama kilitli; veri yazılamaz.');
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const acik = metneCevir.encode(JSON.stringify(nesne));
  const sifre = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, dek, acik);
  return { iv, sifre: new Uint8Array(sifre) };
}

async function coz(kayit) {
  const dek = anahtar();
  if (!dek) throw new Error('Uygulama kilitli; veri okunamaz.');
  const acik = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: kayit.iv }, dek, kayit.sifre);
  return { ...JSON.parse(metneDon.decode(acik)), id: kayit.id };
}

/* -------------------------------------------------------------- okuma */

/** Bir tablonun bütün kayıtları (çözülmüş). Bellekte tutulur. */
export async function hepsi(tablo) {
  if (!acikMi()) return [];
  if (bellek.has(tablo)) return bellek.get(tablo);
  const ham = await islem(tablo, 'readonly', d => d.getAll());
  const cozulmus = [];
  for (const kayit of ham) {
    try { cozulmus.push(await coz(kayit)); }
    catch { /* bozuk ya da başka anahtarla yazılmış kayıt atlanır */ }
  }
  bellek.set(tablo, cozulmus);
  return cozulmus;
}

/** Tek kayıt. Bulunamazsa null. */
export async function oku(tablo, id) {
  const liste = await hepsi(tablo);
  return liste.find(k => k.id === id) || null;
}

/** Basit süzme: {alan: değer} eşleşmesi. */
export async function bul(tablo, kosul = {}) {
  const liste = await hepsi(tablo);
  const anahtarlar = Object.keys(kosul);
  if (!anahtarlar.length) return liste;
  return liste.filter(k => anahtarlar.every(a => k[a] === kosul[a]));
}

export async function sayi(tablo) {
  return (await hepsi(tablo)).length;
}

/* -------------------------------------------------------------- yazma */

function yeniId() {
  return crypto.randomUUID();
}

/** Yeni kayıt ekler, id'sini döndürür. */
export async function ekle(tablo, nesne) {
  const id = nesne.id || yeniId();
  const { iv, sifre } = await sifrele({ ...nesne, id: undefined });
  await islem(tablo, 'readwrite', d => d.put({ id, iv, sifre }));
  bellek.delete(tablo);
  await kaydaGec(tablo, id, 'Ekle');
  return id;
}

/** Var olan kaydı günceller. */
export async function guncelle(tablo, id, degisiklik) {
  const eski = await oku(tablo, id);
  if (!eski) throw new Error('Kayıt bulunamadı: ' + tablo + '/' + id);
  const yeni = { ...eski, ...degisiklik, id: undefined };
  const { iv, sifre } = await sifrele(yeni);
  await islem(tablo, 'readwrite', d => d.put({ id, iv, sifre }));
  bellek.delete(tablo);
  await kaydaGec(tablo, id, 'Düzenle');
  return id;
}

/**
 * Kaydı siler. Modül kuralı gereği banka hareketleri tek tek SİLİNEMEZ;
 * tanım listeleri de silinmez, Pasif'e alınır. Bu işlev yalnız kuralın
 * izin verdiği yerlerde (ekstre yüklemesini geri alma gibi) kullanılır.
 */
export async function sil(tablo, id, sebep = 'Sil') {
  await islem(tablo, 'readwrite', d => d.delete(id));
  bellek.delete(tablo);
  await kaydaGec(tablo, id, sebep);
}

/** Birden çok kaydı tek işlemde yazar (ekstre yüklemesi için). */
export async function topluEkle(tablo, nesneler) {
  const paketler = [];
  for (const n of nesneler) {
    const id = n.id || yeniId();
    const { iv, sifre } = await sifrele({ ...n, id: undefined });
    paketler.push({ id, iv, sifre });
  }
  await islem(tablo, 'readwrite', d => { paketler.forEach(p => d.put(p)); });
  bellek.delete(tablo);
  await kaydaGec(tablo, paketler.length + ' kayıt', 'Toplu ekle');
  return paketler.map(p => p.id);
}

/* --------------------------------------------------- değişiklik kaydı */

/**
 * Her yazma işleminde ne, ne zaman değişti kaydedilir (teknik standart).
 * Tek kullanıcı olduğu için "kim" alanı tutulmaz.
 */
async function kaydaGec(tablo, id, islem_) {
  if (tablo === 'degisiklikKaydi') return;
  try {
    const kayit = { tablo, kayitId: String(id), islem: islem_, zaman: new Date().toISOString() };
    const { iv, sifre } = await sifrele(kayit);
    await islem('degisiklikKaydi', 'readwrite', d => d.put({ id: yeniId(), iv, sifre }));
    bellek.delete('degisiklikKaydi');
  } catch { /* değişiklik kaydı yazılamazsa asıl işlem yine de geçerlidir */ }
}

/* ----------------------------------------------------------- yardımcı */

/** Bellekteki çözülmüş kayıtları düşürür (kilitlenince çağrılır). */
export function bellegiBosalt() {
  bellek.clear();
}

/** Bütün tabloları çözülmüş hâlde verir — yedek almak için. */
export async function tumVeri() {
  const cikti = {};
  for (const tablo of TABLO_ADLARI) cikti[tablo] = await hepsi(tablo);
  return cikti;
}
