/* Nizam Soft · Kişisel Bütçe — Ayarlar ekranı
   Tepede ayar araması, altında gruplu liste. Tanım listeleri, güvenlik,
   yedek, değişiklik kaydı ve sürüm burada. */

import { simge } from '../simge.js';
import { git, cozumle } from '../yonlendirici.js';
import { SURUM, UYGULAMA_ADI, FIRMA_ADI } from '../surum.js';
import * as vt from '../veri/vt.js';
import { form } from '../form.js';
import { pencereAc, onayla, bildir, tikGoster } from '../pencere.js';
import { yedegiIndir, yedegiOku, yedegiGeriYukle, ayarOku, kullanilanAlan, boyutYaz } from '../yedek.js';
import { PIN_UZUNLUK, KURTARMA_SORUSU, ac as kilidiAc, pinDegistir, kurtarmaCevabiDegistir }
  from '../kilit.js';
import { zorlaGuncelle } from '../guncelleme.js';
import { tarihSaat, sadelestir, kacir } from '../veri/bicim.js';

/* ------------------------------------------------------------- güvenlik */

/** PIN değiştirme: önce mevcut PIN sorulur. */
function pinDegistirPenceresi() {
  const govde = form({
    deger: {},
    kaydetYazisi: 'PIN’i değiştir',
    alanlar: [
      { ad: 'Şu anki PIN', as: 'eski', tur: 'Metin', zorunlu: true },
      { ad: 'Yeni PIN', as: 'yeni', tur: 'Metin', zorunlu: true,
        ipucu: `${PIN_UZUNLUK} hane` },
      { ad: 'Yeni PIN (tekrar)', as: 'tekrar', tur: 'Metin', zorunlu: true },
    ],
    async kaydet(d) {
      if (!/^\d{6}$/.test(d.yeni)) throw new Error(`Yeni PIN ${PIN_UZUNLUK} rakam olmalı.`);
      if (d.yeni !== d.tekrar) throw new Error('İki yeni PIN aynı değil.');
      if (!(await kilidiAc(d.eski))) throw new Error('Şu anki PIN yanlış.');
      await pinDegistir(d.yeni);
      kapat();
      await tikGoster('PIN değişti');
    },
  });
  const { kapat } = pencereAc({ baslik: 'PIN değiştir', govde });
}

function kurtarmaDegistirPenceresi() {
  const govde = form({
    deger: {},
    kaydetYazisi: 'Cevabı değiştir',
    alanlar: [
      { ad: 'Şu anki PIN', as: 'pin', tur: 'Metin', zorunlu: true },
      { ad: KURTARMA_SORUSU, as: 'cevap', tur: 'Metin', zorunlu: true,
        ipucu: 'Büyük/küçük harf ve Türkçe karakter farkı önemsenmez.' },
    ],
    async kaydet(d) {
      if (d.cevap.trim().length < 2) throw new Error('Cevap en az iki harf olmalı.');
      if (!(await kilidiAc(d.pin))) throw new Error('PIN yanlış.');
      await kurtarmaCevabiDegistir(d.cevap);
      kapat();
      await tikGoster('Kurtarma cevabı değişti');
    },
  });
  const { kapat } = pencereAc({ baslik: 'Kurtarma cevabını değiştir', govde });
}

/* ---------------------------------------------------------------- yedek */

async function yedekAl() {
  try {
    const sonuc = await yedegiIndir();
    await tikGoster('Yedek indirildi');
    bildir(`${sonuc.ad} · ${boyutYaz(sonuc.boyut)}`, 'basari');
    cozumle();
  } catch (hata) {
    bildir(hata.message || 'Yedek alınamadı.', 'tehlike');
  }
}

function geriYuklePenceresi() {
  const govde = document.createElement('div');
  govde.innerHTML = `
    <p class="pencere-yazi">
      Yedek dosyasını seç. İçindekiler <b>şu anki verinin yerine geçer</b> —
      geri alınamaz. Devam etmeden önce mevcut verinin yedeğini almanı öneririm.
    </p>
    <button class="dugme dugme-sade" type="button" id="dosya-sec" style="width:100%">
      ${simge('yukle')}<span>Yedek dosyası seç</span>
    </button>
    <input type="file" id="yedek-dosya" accept=".json,application/json" hidden>
    <div class="form-hata" role="alert" id="yedek-hata"></div>`;

  const { kapat } = pencereAc({ baslik: 'Yedekten geri yükle', govde });
  const giris = govde.querySelector('#yedek-dosya');
  const hata = govde.querySelector('#yedek-hata');
  govde.querySelector('#dosya-sec').addEventListener('click', () => giris.click());

  giris.addEventListener('change', async () => {
    const dosya = giris.files[0];
    if (!dosya) return;
    hata.textContent = '';
    try {
      const yedek = await yedegiOku(dosya);
      const toplam = Object.values(yedek.kayitSayisi || {}).reduce((t, s) => t + s, 0);
      kapat();
      const evet = await onayla({
        baslik: 'Geri yüklensin mi?',
        yazi: `${tarihSaat(yedek.alinmaZamani)} tarihli yedekte ${toplam} kayıt var. ` +
              'Şu anki bütün verinin yerine geçecek ve geri alınamayacak.',
        onayla: 'Evet, geri yükle', tehlikeli: true,
      });
      if (!evet) return;
      await yedegiGeriYukle(yedek);
      await tikGoster('Yedek geri yüklendi');
      cozumle();
    } catch (h) {
      hata.textContent = h.message || 'Yedek okunamadı.';
    }
  });
}

/* -------------------------------------------------- değişiklik kaydı */

async function degisiklikKaydiPenceresi() {
  const kayitlar = (await vt.hepsi('degisiklikKaydi'))
    .sort((a, b) => String(b.zaman).localeCompare(String(a.zaman)))
    .slice(0, 200);

  const TABLO_ADI = {
    bankaHesaplari: 'Hesap', bankaHareketleri: 'Hareket', ekstreYukleme: 'Ekstre yükleme',
    yatirimAraclari: 'Yatırım aracı', yatirimIslemleri: 'Yatırım işlemi',
    abonelikler: 'Abonelik', abonelikOdemeleri: 'Abonelik ödemesi',
    gelirBasliklari: 'Gelir başlığı', giderBasliklari: 'Gider başlığı',
    rutinHareketler: 'Rutin hareket', ayarlar: 'Ayar',
  };

  const govde = document.createElement('div');
  govde.innerHTML = kayitlar.length ? `
    <p class="pencere-yazi">Son ${kayitlar.length} değişiklik. Veri cihazında durduğu
      için yalnız ne ve ne zaman değiştiği tutulur.</p>
    <ul class="kart-liste">
      ${kayitlar.map(k => `
        <li class="kart-satir">
          <div class="kart-satir-govde">
            <div class="kart-satir-ust">${kacir(TABLO_ADI[k.tablo] || k.tablo)} · ${kacir(k.islem)}</div>
            <div class="kart-satir-alt">${kacir(tarihSaat(k.zaman))}</div>
          </div>
        </li>`).join('')}
    </ul>` : `
    <div class="bos-durum">${simge('rapor', 'simge-40')}
      <h3>Kayıt yok</h3><p>Henüz bir değişiklik yapılmamış.</p></div>`;

  pencereAc({ baslik: 'Değişiklik kaydı', govde, genis: true });
}

/* ------------------------------------------------------------ güncelleme */

async function uygulamayiGuncelle() {
  const evet = await onayla({
    baslik: 'Uygulama güncellensin mi?',
    yazi: 'En yeni sürüm indirilip uygulama yeniden başlatılacak. Verilerine dokunulmaz.',
    onayla: 'Evet, güncelle',
  });
  if (evet) await zorlaGuncelle();
}

/* ---------------------------------------------------------------- sayfa */

export default {
  baslik: 'Ayarlar',
  simge: 'ayarlar',

  async ciz(kap) {
    const yenile = () => this.ciz(kap);
    const [sonYedek, alan] = await Promise.all([ayarOku('sonYedekTarihi'), kullanilanAlan()]);

    const yedekNotu = sonYedek
      ? 'Son yedek: ' + tarihSaat(sonYedek)
      : 'Henüz yedek alınmadı';

    const GRUPLAR = [
      { ad: 'Tanımlar', satirlar: [
        { ad: 'Gelir Başlıkları', not: 'Maaş, kira geliri…', simge: 'gelir',
          is: () => git('/ayarlar/gelir-basliklari') },
        { ad: 'Gider Başlıkları', not: 'Market, kira, aylık limitler', simge: 'gider',
          is: () => git('/ayarlar/gider-basliklari') },
        { ad: 'Hesap ve Kart Tanımları', not: 'Banka, nakit, kredi kartı', simge: 'banka',
          is: () => git('/hesaplar?sekme=banka') },
        { ad: 'Yatırım Araçları', not: 'Altın, döviz, hisse ve güncel fiyatlar', simge: 'yatirim',
          is: () => git('/ayarlar/yatirim-araclari') },
        { ad: 'Rutin Hareketler', not: 'Tekrar eden gelir ve giderler', simge: 'takvim',
          is: () => git('/ayarlar/rutin-hareketler') },
        { ad: 'Abonelikler', not: 'Netflix, spor salonu…', simge: 'abonelik',
          is: () => git('/hesaplar?sekme=abonelikler') },
        { ad: 'Bütçe Limitleri', not: 'Başlık başlık aylık limit', simge: 'butce',
          is: () => git('/raporlar/butce') },
      ] },
      { ad: 'Güvenlik', satirlar: [
        { ad: 'PIN Değiştir', not: `${PIN_UZUNLUK} haneli giriş PIN’i`, simge: 'kilit',
          is: pinDegistirPenceresi },
        { ad: 'Kurtarma Cevabını Değiştir', not: KURTARMA_SORUSU, simge: 'kisi',
          is: kurtarmaDegistirPenceresi },
      ] },
      { ad: 'Veri', satirlar: [
        { ad: 'Yedek Al', not: yedekNotu, simge: 'yukle', is: yedekAl },
        { ad: 'Yedekten Geri Yükle', not: 'Mevcut verinin yerine geçer', simge: 'yukle',
          is: geriYuklePenceresi },
        { ad: 'Değişiklik Kaydı', not: 'Ne, ne zaman değişti', simge: 'rapor',
          is: degisiklikKaydiPenceresi },
        ...(alan ? [{ ad: 'Kullanılan Alan',
          not: `${boyutYaz(alan.kullanilan)} kullanılıyor`, simge: 'kutu', is: null }] : []),
      ] },
      { ad: 'Uygulama', satirlar: [
        { ad: 'Uygulamayı Güncelle', not: 'Sürüm ' + SURUM, simge: 'onay',
          is: uygulamayiGuncelle },
      ] },
    ];

    kap.innerHTML = `
      ${!sonYedek ? `
        <div class="kart kart-serit uyari-serit yedek-uyari">
          ${simge('uyari')}
          <span><b>Henüz yedek almadın</b>
          <span class="silik">Veri yalnız bu cihazda duruyor. Tarayıcı verisini
          temizlersen kaybolur.</span></span>
        </div>` : ''}
      <div class="alan arama">
        ${simge('ara', 'simge-16')}
        <input class="alan-giris" type="search" id="ayar-arama"
               placeholder="Ayarlarda ara…" autocomplete="off" aria-label="Ayarlarda ara">
      </div>
      <div id="ayar-gruplar"></div>
      <p class="silik ayar-alt">
        ${kacir(FIRMA_ADI)} · ${kacir(UYGULAMA_ADI)} · Sürüm ${kacir(SURUM)}<br>
        Veri bu cihazda, şifreli olarak duruyor.
      </p>`;

    const kutu = kap.querySelector('#ayar-gruplar');
    const arama = kap.querySelector('#ayar-arama');

    function cizGruplar(sorgu = '') {
      const s = sadelestir(sorgu);
      const gorunen = GRUPLAR
        .map(g => ({ ...g, satirlar: g.satirlar.filter(r =>
          !s || sadelestir(r.ad + ' ' + r.not).includes(s)) }))
        .filter(g => g.satirlar.length);

      if (!gorunen.length) {
        kutu.innerHTML = `
          <div class="bos-durum">${simge('ayarlar', 'simge-40')}
            <h3>Sonuç yok</h3>
            <p>Aradığın ayar bulunamadı. Başka bir kelime dene.</p></div>`;
        return;
      }

      kutu.innerHTML = gorunen.map((g, gi) => `
        <div class="liste-baslik">${kacir(g.ad)}</div>
        <div class="liste liste-kutu">
          ${g.satirlar.map((r, ri) => `
            <button class="liste-satir" type="button"
                    ${r.is ? `data-is="${gi}-${ri}"` : 'disabled'}>
              ${simge(r.simge)}
              <span class="liste-satir-govde">
                <span class="liste-satir-ad">${kacir(r.ad)}</span>
                <span class="liste-satir-not">${kacir(r.not)}</span>
              </span>
            </button>`).join('')}
        </div>`).join('');

      kutu.querySelectorAll('[data-is]').forEach(dugme => {
        const [gi, ri] = dugme.dataset.is.split('-').map(Number);
        dugme.addEventListener('click', () => gorunen[gi].satirlar[ri].is(yenile));
      });
    }

    cizGruplar();
    let aramaZaman = null;
    arama.addEventListener('input', () => {
      clearTimeout(aramaZaman);
      aramaZaman = setTimeout(() => cizGruplar(arama.value), 140);
    });
  },
};
