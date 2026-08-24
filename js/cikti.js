/* Nizam Soft · Kişisel Bütçe — çıktılar
   Bütün raporlar PDF olarak alınabilir; ayrıca isteğe bağlı Excel dışa
   aktarım vardır (yalnız okumak için, geri yüklenmez).
   PDF pdfmake ile üretilir; Roboto Türkçe karakterleri ve ₺ simgesini taşır. */

import { pdfYukle, xlsxYukle } from './vendor.js';
import { SURUM, UYGULAMA_ADI, FIRMA_ADI } from './surum.js';
import { para, tarih, tarihSaat, ay } from './veri/bicim.js';

const RENK = { metin: '#16181d', silik: '#676e78', cizgi: '#e1e4e9', vurgu: '#0e6e8c', tehlike: '#ce1b2e' };

function belgeIskeleti(baslik, altBaslik, govde) {
  return {
    pageSize: 'A4',
    pageMargins: [36, 44, 36, 48],
    defaultStyle: { font: 'Roboto', fontSize: 9, color: RENK.metin },
    header: {
      margin: [36, 20, 36, 0],
      columns: [
        { text: FIRMA_ADI + ' · ' + UYGULAMA_ADI, fontSize: 8, color: RENK.silik },
        { text: tarihSaat(new Date()), fontSize: 8, color: RENK.silik, alignment: 'right' },
      ],
    },
    footer: (sayfa, toplam) => ({
      margin: [36, 0, 36, 16],
      columns: [
        { text: 'Sürüm ' + SURUM, fontSize: 8, color: RENK.silik },
        { text: `${sayfa} / ${toplam}`, fontSize: 8, color: RENK.silik, alignment: 'right' },
      ],
    }),
    content: [
      { text: baslik, fontSize: 15, bold: true, margin: [0, 0, 0, 2] },
      { text: altBaslik, fontSize: 10, color: RENK.silik, margin: [0, 0, 0, 14] },
      ...govde,
    ],
  };
}

function dosyaAdi(baslik, donem) {
  const sade = baslik.toLocaleLowerCase('tr')
    .replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ğ/g, 'g')
    .replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `${sade}${donem ? '-' + donem : ''}.pdf`;
}

/** Gelir/gider raporunu PDF olarak indirir. */
export async function raporPdf(baslik, donem, r, gelirMi) {
  const pdfMake = await pdfYukle();

  const satirlar = [];
  for (const s of r.satirlar) {
    satirlar.push([
      { text: s.baslikAdi, bold: true, color: s.limitAsildi ? RENK.tehlike : RENK.metin },
      { text: String(s.hareketSayisi), alignment: 'right', color: RENK.silik },
      { text: para(s.tutar) + ' ₺', alignment: 'right', bold: true,
        color: s.limitAsildi ? RENK.tehlike : RENK.metin },
    ]);
    for (const a of s.altlar) {
      if (a.baslikAdi === 'Doğrudan bu başlığa' && s.altlar.length === 1) continue;
      satirlar.push([
        { text: '   ' + a.baslikAdi, color: RENK.silik },
        { text: '', alignment: 'right' },
        { text: para(a.tutar) + ' ₺', alignment: 'right', color: RENK.silik },
      ]);
    }
  }

  const govde = [
    {
      table: {
        headerRows: 1,
        widths: ['*', 46, 90],
        body: [
          [
            { text: 'Başlık', bold: true, fontSize: 8, color: RENK.silik },
            { text: 'Hareket', bold: true, fontSize: 8, color: RENK.silik, alignment: 'right' },
            { text: 'Tutar', bold: true, fontSize: 8, color: RENK.silik, alignment: 'right' },
          ],
          ...satirlar,
          [
            { text: gelirMi ? 'TOPLAM GELİR' : 'TOPLAM GİDER', bold: true },
            { text: '', alignment: 'right' },
            { text: para(r.toplam) + ' ₺', bold: true, alignment: 'right' },
          ],
        ],
      },
      layout: {
        hLineWidth: (i, node) => (i === 0 || i === 1 || i === node.table.body.length ? 0.8 : 0.4),
        vLineWidth: () => 0,
        hLineColor: () => RENK.cizgi,
        paddingTop: () => 4, paddingBottom: () => 4,
      },
    },
  ];

  if (!gelirMi && r.kartHarcamalari.length) {
    govde.push({ text: 'Kredi Kartı Harcamaları', fontSize: 11, bold: true, margin: [0, 18, 0, 6] });
    govde.push({
      text: `${r.kartHarcamalari.length} hareket · ${para(r.kartToplami)} ₺ ` +
            '(başlıklarının içinde de sayılır)',
      fontSize: 8, color: RENK.silik, margin: [0, 0, 0, 6],
    });
    govde.push({
      table: {
        headerRows: 0,
        widths: ['*', 60, 80],
        body: r.kartHarcamalari.map(h => [
          { text: h.aciklama },
          { text: tarih(h.tarih), color: RENK.silik, alignment: 'right' },
          { text: para(h.tutar) + ' ₺', alignment: 'right' },
        ]),
      },
      layout: {
        hLineWidth: () => 0.4, vLineWidth: () => 0, hLineColor: () => RENK.cizgi,
        paddingTop: () => 3, paddingBottom: () => 3,
      },
    });
  }

  pdfMake.createPdf(belgeIskeleti(baslik, ay(donem), govde)).download(dosyaAdi(baslik, donem));
}

/** Serbest biçimli tablo listesini PDF yapar (öteki raporlar için). */
export async function tabloPdf(baslik, altBaslik, sutunlar, satirlar, dosyaEki) {
  const pdfMake = await pdfYukle();
  const govde = [{
    table: {
      headerRows: 1,
      widths: sutunlar.map(s => s.genislik || '*'),
      body: [
        sutunlar.map(s => ({ text: s.ad, bold: true, fontSize: 8, color: RENK.silik,
                             alignment: s.hizala || 'left' })),
        ...satirlar.map(r => r.map((h, i) => ({
          text: String(h ?? ''),
          alignment: sutunlar[i].hizala || 'left',
          bold: Boolean(r.kalin),
        }))),
      ],
    },
    layout: {
      hLineWidth: (i) => (i <= 1 ? 0.8 : 0.4),
      vLineWidth: () => 0,
      hLineColor: () => RENK.cizgi,
      paddingTop: () => 4, paddingBottom: () => 4,
    },
  }];
  pdfMake.createPdf(belgeIskeleti(baslik, altBaslik, govde)).download(dosyaAdi(baslik, dosyaEki));
}

/** Gelir/gider raporunu Excel olarak indirir (isteğe bağlı, geri yüklenmez). */
export async function raporExcel(ad, donem, r) {
  const XLSX = await xlsxYukle();
  const satirlar = [['Başlık', 'Alt başlık', 'Hareket sayısı', 'Tutar']];
  for (const s of r.satirlar) {
    satirlar.push([s.baslikAdi, '', s.hareketSayisi, s.tutar]);
    for (const a of s.altlar) satirlar.push(['', a.baslikAdi, a.hareketler.length, a.tutar]);
  }
  satirlar.push([]);
  satirlar.push(['TOPLAM', '', '', r.toplam]);

  const sayfa = XLSX.utils.aoa_to_sheet(satirlar);
  sayfa['!cols'] = [{ wch: 26 }, { wch: 26 }, { wch: 14 }, { wch: 14 }];
  const kitap = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(kitap, sayfa, ad);
  XLSX.writeFile(kitap, `${ad.toLocaleLowerCase('tr')}-${donem}.xlsx`);
}

/** Serbest tabloyu Excel yapar. */
export async function tabloExcel(ad, sutunAdlari, satirlar, dosyaEki) {
  const XLSX = await xlsxYukle();
  const sayfa = XLSX.utils.aoa_to_sheet([sutunAdlari, ...satirlar]);
  sayfa['!cols'] = sutunAdlari.map(() => ({ wch: 20 }));
  const kitap = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(kitap, sayfa, ad.slice(0, 28));
  XLSX.writeFile(kitap, `${ad.toLocaleLowerCase('tr').replace(/\s+/g, '-')}${dosyaEki ? '-' + dosyaEki : ''}.xlsx`);
}
