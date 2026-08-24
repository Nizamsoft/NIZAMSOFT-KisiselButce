/* Nizam Soft · Kişisel Bütçe — biçimlendirme
   Para: ₺ TRY, binlik nokta ondalık virgül → 12.400,00
   Tarih: 22.05.2025 · Tarih-saat: 22.05.2025 · 14:30 */

const PARA = new Intl.NumberFormat('tr-TR', {
  minimumFractionDigits: 2, maximumFractionDigits: 2,
});

/** 12400 → "12.400,00" */
export function para(deger) {
  const s = Number(deger);
  return PARA.format(Number.isFinite(s) ? s : 0);
}

/** 12400 → "12.400,00 ₺" — sayı ile simge arasında bölünmez boşluk vardır,
    böylece dar ekranda ₺ alt satıra düşmez. */
export function paraSimgeli(deger) {
  return para(deger) + '\u00A0₺';
}

/** "2025-05-22" ya da Date → "22.05.2025" */
export function tarih(deger) {
  if (!deger) return '';
  const t = deger instanceof Date ? deger : new Date(deger);
  if (Number.isNaN(t.getTime())) return '';
  const g = String(t.getDate()).padStart(2, '0');
  const a = String(t.getMonth() + 1).padStart(2, '0');
  return `${g}.${a}.${t.getFullYear()}`;
}

/** → "22.05.2025 · 14:30" */
export function tarihSaat(deger) {
  if (!deger) return '';
  const t = deger instanceof Date ? deger : new Date(deger);
  if (Number.isNaN(t.getTime())) return '';
  const s = String(t.getHours()).padStart(2, '0');
  const d = String(t.getMinutes()).padStart(2, '0');
  return `${tarih(t)} · ${s}:${d}`;
}

const AYLAR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
               'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

/** "2025-05" ya da Date → "Mayıs 2025" */
export function ay(deger) {
  if (!deger) return '';
  const t = deger instanceof Date ? deger : new Date(deger.length === 7 ? deger + '-01' : deger);
  if (Number.isNaN(t.getTime())) return '';
  return `${AYLAR[t.getMonth()]} ${t.getFullYear()}`;
}

/** Bugünün tarihi "2025-05-22" biçiminde (alan değeri olarak saklanır). */
export function bugun() {
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
}

/** Türkçe duyarlı sıralama ve arama için sadeleştirme. */
export function sadelestir(metin) {
  return String(metin || '')
    .replace(/[İIı]/g, 'i')
    .toLocaleLowerCase('tr')
    .replace(/ş/g, 's').replace(/ğ/g, 'g').replace(/ü/g, 'u')
    .replace(/ö/g, 'o').replace(/ç/g, 'c')
    .trim();
}

/** Türkçe alfabeye göre karşılaştırır. */
export const karsilastir = new Intl.Collator('tr').compare;

/** HTML'e gömülecek metni kaçırır. */
export function kacir(metin) {
  return String(metin ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/**
 * Kullanıcının yazdığı para metnini sayıya çevirir.
 * "12.400,50" → 12400.5 · "1234,5" → 1234.5 · "1234.5" → 1234.5
 * Binlik nokta ve ondalık virgül Türkçe düzene göre okunur.
 */
export function paraCoz(metin) {
  const ham = String(metin ?? '').trim().replace(/[\s₺]/g, '');
  if (!ham) return null;
  let sade;
  if (ham.includes(',')) {
    /* Virgül varsa o ondalık ayracıdır, noktalar binliktir: 12.400,50 */
    sade = ham.replace(/\./g, '').replace(',', '.');
  } else if (ham.includes('.')) {
    /* Virgül yok. Noktadan sonraki her öbek tam 3 hane ise nokta binlik
       ayracıdır (4.000 = dört bin); değilse ondalık noktasıdır (1234.5). */
    const obekler = ham.split('.');
    const binlik = obekler.slice(1).every(o => /^\d{3}$/.test(o));
    sade = binlik ? obekler.join('') : ham;
  } else {
    sade = ham;
  }
  const sayi = Number(sade);
  return Number.isFinite(sayi) ? sayi : null;
}

/** Sayıyı alan girişinde gösterilecek biçime çevirir (binlik ayracı yok). */
export function sayiyaYaz(deger) {
  if (deger === null || deger === undefined || deger === '') return '';
  return String(deger).replace('.', ',');
}
