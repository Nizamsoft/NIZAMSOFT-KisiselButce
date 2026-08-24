/* Nizam Soft · Kişisel Bütçe — simge seti
   Lucide (ISC lisanslı, açık kaynak). Paket yüklenmez; kullanılan simgelerin
   yol verileri buraya gömülüdür. Çizim iki katmanlıdır: kontur + arkada aynı
   rengin saydam dolgusu (bkz. .simge kuralı). */

const YOLLAR = {
  panel:      '<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
  cuzdan:     '<path d="M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0 0 4h15a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/>',
  rapor:      '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4" fill="none"/><path d="M8 13h8M8 17h5" fill="none"/>',
  ayarlar:    '<path d="M12.2 2h-.4a2 2 0 0 0-2 2 2 2 0 0 1-3 1.7l-.3-.2a2 2 0 0 0-2.7.7l-.2.4a2 2 0 0 0 .7 2.7l.3.2a2 2 0 0 1 0 3.4l-.3.2a2 2 0 0 0-.7 2.7l.2.4a2 2 0 0 0 2.7.7l.3-.2a2 2 0 0 1 3 1.7 2 2 0 0 0 2 2h.4a2 2 0 0 0 2-2 2 2 0 0 1 3-1.7l.3.2a2 2 0 0 0 2.7-.7l.2-.4a2 2 0 0 0-.7-2.7l-.3-.2a2 2 0 0 1 0-3.4l.3-.2a2 2 0 0 0 .7-2.7l-.2-.4a2 2 0 0 0-2.7-.7l-.3.2a2 2 0 0 1-3-1.7 2 2 0 0 0-2-2Z"/><circle cx="12" cy="12" r="3"/>',
  arti:       '<path d="M12 5v14M5 12h14" fill="none"/>',
  geri:       '<path d="m15 18-6-6 6-6" fill="none"/>',
  sagOk:      '<path d="m9 18 6-6-6-6" fill="none"/>',
  yardim:     '<circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01" fill="none"/>',
  kilit:      '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4" fill="none"/>',
  banka:      '<path d="M3 22h18M6 18v-7M10 18v-7M14 18v-7M18 18v-7M12 2 2 8h20Z"/>',
  yatirim:    '<path d="M16 7h6v6" fill="none"/><path d="m22 7-8.5 8.5-5-5L2 17" fill="none"/>',
  abonelik:   '<path d="m17 2 4 4-4 4" fill="none"/><path d="M3 11v-1a4 4 0 0 1 4-4h14" fill="none"/><path d="m7 22-4-4 4-4" fill="none"/><path d="M21 13v1a4 4 0 0 1-4 4H3" fill="none"/>',
  gelir:      '<path d="M12 19V5M5 12l7-7 7 7" fill="none"/>',
  gider:      '<path d="M12 5v14M19 12l-7 7-7-7" fill="none"/>',
  yukle:      '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" fill="none"/><path d="M7 10l5-5 5 5M12 5v13" fill="none"/>',
  kutu:       '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.5 5.5 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.5A2 2 0 0 0 16.8 4H7.2a2 2 0 0 0-1.7 1.5Z"/>',
  uyari:      '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01" fill="none"/>',
  onay:       '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4" fill="none"/>',
  kisi:       '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0" fill="none"/>',
  takvim:     '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18" fill="none"/>',
  ara:        '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3" fill="none"/>',
  kart:       '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20" fill="none"/>',
  filtre:     '<path d="M22 3H2l8 9.5V19l4 2v-8.5Z"/>',
  butce:      '<path d="M12 2a10 10 0 1 0 10 10H12Z"/><path d="M15 2a7 7 0 0 1 7 7h-7Z"/>',
};

/**
 * Bir simgenin SVG metnini döndürür.
 * @param {string} ad YOLLAR içindeki anahtar
 * @param {string} [ek] ek sınıf adı (simge-16, simge-40 gibi)
 */
export function simge(ad, ek = '') {
  const yol = YOLLAR[ad];
  if (!yol) return '';
  return `<svg class="simge ${ek}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${yol}</svg>`;
}

export const SIMGE_ADLARI = Object.keys(YOLLAR);
