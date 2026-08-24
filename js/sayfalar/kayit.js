/* Nizam Soft · Kişisel Bütçe — sayfa kaydı
   Bütün ekranlar ve rotaları tek yerde. Yönlendirici buradan beslenir. */

import panel from './panel.js';
import hesaplar from './hesaplar.js';
import bankaHareketleri from './banka-hareketleri.js';
import ekstreYukleme from './ekstre-yukleme.js';
import yatirimIslemleri from './yatirim-islemleri.js';
import abonelikOdemeleri from './abonelik-odemeleri.js';
import raporlar from './raporlar.js';
import raporGelirler from './rapor-gelirler.js';
import raporGiderler from './rapor-giderler.js';
import raporBuAy from './rapor-bu-ay.js';
import raporNakitAkis from './rapor-nakit-akis.js';
import raporButce from './rapor-butce.js';
import ayarlar from './ayarlar.js';
import gelirBasliklari from './gelir-basliklari.js';
import giderBasliklari from './gider-basliklari.js';
import yatirimAraclari from './yatirim-araclari.js';
import rutinHareketler from './rutin-hareketler.js';

/** rota → sayfa. geri: true ise üst çubukta geri oku çıkar. */
export const SAYFALAR = [
  { rota: '/panel',                        sayfa: panel,              geri: false, kok: 'panel' },
  { rota: '/hesaplar',                     sayfa: hesaplar,           geri: false, kok: 'hesaplar' },
  { rota: '/hesaplar/hareketler/:id',      sayfa: bankaHareketleri,   geri: true,  kok: 'hesaplar' },
  { rota: '/hesaplar/ekstre-yukle/:id',    sayfa: ekstreYukleme,      geri: true,  kok: 'hesaplar' },
  { rota: '/yatirimlar/islemler/:id',      sayfa: yatirimIslemleri,   geri: true,  kok: 'hesaplar' },
  { rota: '/abonelikler/odemeler/:id',     sayfa: abonelikOdemeleri,  geri: true,  kok: 'hesaplar' },
  { rota: '/raporlar',                     sayfa: raporlar,           geri: false, kok: 'raporlar' },
  { rota: '/raporlar/gelirler',            sayfa: raporGelirler,      geri: true,  kok: 'raporlar' },
  { rota: '/raporlar/giderler',            sayfa: raporGiderler,      geri: true,  kok: 'raporlar' },
  { rota: '/raporlar/bu-ay',               sayfa: raporBuAy,          geri: true,  kok: 'raporlar' },
  { rota: '/raporlar/nakit-akis',          sayfa: raporNakitAkis,     geri: true,  kok: 'raporlar' },
  { rota: '/raporlar/butce',               sayfa: raporButce,         geri: true,  kok: 'raporlar' },
  { rota: '/ayarlar',                      sayfa: ayarlar,            geri: false, kok: 'ayarlar' },
  { rota: '/ayarlar/gelir-basliklari',     sayfa: gelirBasliklari,    geri: true,  kok: 'ayarlar' },
  { rota: '/ayarlar/gider-basliklari',     sayfa: giderBasliklari,    geri: true,  kok: 'ayarlar' },
  { rota: '/ayarlar/yatirim-araclari',     sayfa: yatirimAraclari,    geri: true,  kok: 'ayarlar' },
  { rota: '/ayarlar/rutin-hareketler',     sayfa: rutinHareketler,    geri: true,  kok: 'ayarlar' },
];

/** Alt çubuk ve yan paneldeki dört ana gezinme durağı. */
export const GEZINME = [
  { kok: 'panel',    rota: '/panel',    ad: 'Panel',    simge: 'panel' },
  { kok: 'hesaplar', rota: '/hesaplar', ad: 'Hesaplar', simge: 'cuzdan' },
  { kok: 'raporlar', rota: '/raporlar', ad: 'Raporlar', simge: 'rapor' },
  { kok: 'ayarlar',  rota: '/ayarlar',  ad: 'Ayarlar',  simge: 'ayarlar' },
];

/** Alt çubuğun ortasındaki + düğmesinin menüsü. */
export const EKLE_MENUSU = [
  { ad: 'Gelir ekle',    simge: 'gelir' },
  { ad: 'Gider ekle',    simge: 'gider' },
  { ad: 'Yatırım ekle',  simge: 'yatirim' },
  { ad: 'Abonelik ekle', simge: 'abonelik' },
  { ad: 'Ekstre yükle',  simge: 'yukle' },
];
