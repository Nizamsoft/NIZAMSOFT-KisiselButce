/* Nizam Soft · Kişisel Bütçe — Ekstre Yükleme ekranı
 *
 * Akış: Dosya yüklendi → Önizleme → Başlık atama → İşlendi
 * Hareketler ancak sihirbaz SONUNA KADAR bitince hesaba işlenir. Yarıda
 * bırakılırsa yükleme "Başlık Atanıyor" durumunda saklanır ve kullanıcı
 * kaldığı hareketten devam eder. Bu yüzden başlıksız hareket hiç oluşmaz.
 */

import { simge } from '../simge.js';
import { git, geriDon } from '../yonlendirici.js';
import * as vt from '../veri/vt.js';
import { ekstreOku, tahminEdici, abonelikEslestir } from '../veri/ekstre.js';
import { bildir, onayla, tikGoster, hataEkrani } from '../pencere.js';
import { para, paraSimgeli, tarih, karsilastir, kacir } from '../veri/bicim.js';

/* Ağaç başlıkları "Ana → Alt" biçiminde düz listeye serer. */
function basliklariSer(hepsi) {
  const aktif = hepsi.filter(b => b.durum !== 'Pasif');
  const analar = aktif.filter(b => !b.ustBaslik).sort((a, b) => karsilastir(a.baslikAdi, b.baslikAdi));
  const cikti = [];
  for (const ana of analar) {
    cikti.push({ id: ana.id, ad: ana.baslikAdi });
    aktif.filter(b => b.ustBaslik === ana.id)
      .sort((a, b) => karsilastir(a.baslikAdi, b.baslikAdi))
      .forEach(alt => cikti.push({ id: alt.id, ad: `${ana.baslikAdi} → ${alt.baslikAdi}` }));
  }
  return cikti;
}

export default {
  baslik: 'Ekstre Yükleme',
  simge: 'yukle',

  async ciz(kap, parametre) {
    const hesap = await vt.oku('bankaHesaplari', parametre.id);
    if (!hesap) {
      kap.innerHTML = `
        <div class="bos-durum">${simge('uyari', 'simge-40')}
          <h3>Hesap bulunamadı</h3><p>Bu hesap silinmiş ya da adres yanlış olabilir.</p>
          <button class="dugme" type="button" id="geri">${simge('geri')}<span>Geri dön</span></button>
        </div>`;
      kap.querySelector('#geri').addEventListener('click', geriDon);
      return;
    }

    /* Yarıda bırakılmış yükleme varsa kaldığı yerden devam edilir. */
    const yarim = (await vt.hepsi('ekstreYukleme'))
      .find(y => y.hesap === hesap.id && y.durum === 'Başlık Atanıyor');

    if (yarim) return devamSor(kap, hesap, yarim, this);
    return dosyaSec(kap, hesap, this);
  },
};

/* ------------------------------------------------------------- 1) dosya */

function dosyaSec(kap, hesap, sayfa) {
  kap.innerHTML = `
    <div class="kart kart-serit hesap-ozet">
      <div>
        <div class="silik">Ekstre yüklenecek hesap</div>
        <h2>${kacir(hesap.hesapAdi)}</h2>
      </div>
    </div>
    <div class="bos-durum">
      ${simge('yukle', 'simge-40')}
      <h3>Excel ekstresini seç</h3>
      <p>Bankandan indirdiğin dosyayı olduğu gibi yükle. Program sütunları kendi tanır.
         Dosya cihazından çıkmaz.</p>
      <button class="dugme" type="button" id="dosya-sec">${simge('yukle')}<span>Excel seç</span></button>
      <input type="file" id="dosya" accept=".xlsx,.xls,.xlsm" hidden>
    </div>`;

  const giris = kap.querySelector('#dosya');
  kap.querySelector('#dosya-sec').addEventListener('click', () => giris.click());
  giris.addEventListener('change', async () => {
    const dosya = giris.files[0];
    if (!dosya) return;
    kap.innerHTML = `
      <div class="yukleniyor"><div class="yukleniyor-cubuk"></div></div>
      <p class="silik okuma-notu">${kacir(dosya.name)} okunuyor…</p>`;
    try {
      const sonuc = await ekstreOku(dosya);
      if (!sonuc.satirlar.length) {
        hataEkrani(kap, 'Dosyada işlenebilir hareket bulunamadı.', () => dosyaSec(kap, hesap, sayfa));
        return;
      }
      await onizleme(kap, hesap, dosya, sonuc, sayfa);
    } catch (hata) {
      hataEkrani(kap, hata.message || 'Dosya okunamadı.', () => dosyaSec(kap, hesap, sayfa));
    }
  });
}

/* ---------------------------------------------------------- 2) önizleme */

async function onizleme(kap, hesap, dosya, sonuc, sayfa) {
  const [gecmis, gelirB, giderB, abonelikler] = await Promise.all([
    vt.hepsi('bankaHareketleri'), vt.hepsi('gelirBasliklari'),
    vt.hepsi('giderBasliklari'), vt.hepsi('abonelikler'),
  ]);

  /* Mükerrer engelleme: dekont no zaten varsa o satır "mevcut" sayılır. */
  const varOlanDekont = new Set(gecmis.filter(h => h.dekontNo).map(h => h.dekontNo));
  const tahmin = tahminEdici(gecmis);
  const abonelikBul = abonelikEslestir(abonelikler);
  const baslikAdi = new Map([...gelirB, ...giderB].map(b => [b.id, b.baslikAdi]));

  const isaretli = sonuc.satirlar.map(s => {
    const mevcut = Boolean(s.dekontNo && varOlanDekont.has(s.dekontNo));
    const onerilen = mevcut ? null : tahmin(s.aciklama, s.yon);
    const abonelik = mevcut ? null : abonelikBul(s.aciklama, s.tutar);
    return { ...s, mevcut, onerilen, abonelik };
  });

  const yeni = isaretli.filter(s => !s.mevcut);
  const mevcutSayi = isaretli.length - yeni.length;

  kap.innerHTML = `
    <div class="kart kart-serit onizleme-ozet">
      <div class="onizleme-sayi">
        <b>${yeni.length}</b> yeni · <b>${mevcutSayi}</b> mevcut
      </div>
      <div class="silik">
        ${kacir(dosya.name)} · ${kacir(hesap.hesapAdi)}
        ${sonuc.atlanan ? ` · ${sonuc.atlanan} satır okunamadı, atlandı` : ''}
      </div>
      ${!sonuc.taninan.includes('dekontNo') ? `
        <div class="onizleme-uyari">${simge('uyari', 'simge-16')}
          <span>Bu dosyada dekont no sütunu yok. Aynı ekstreyi ikinci kez
          yüklersen mükerrer kayıt engellenemez.</span></div>` : ''}
    </div>

    <div class="liste-arac"><div class="liste-arac-sol">Yüklenecek hareketler</div></div>
    <ul class="kart-liste onizleme-liste">
      ${isaretli.slice(0, 200).map(s => `
        <li class="kart-satir ${s.mevcut ? 'mevcut-satir' : ''}">
          <div class="kart-satir-govde">
            <div class="kart-satir-ust">${kacir(s.aciklama)}</div>
            <div class="kart-satir-alt">
              ${kacir(tarih(s.tarih))} · ${kacir(s.yon)}
              ${s.mevcut ? ' · <b>zaten var</b>'
                : s.onerilen ? ' · önerilen: ' + kacir(baslikAdi.get(s.onerilen) || '')
                : ' · başlık seçilecek'}
              ${s.abonelik ? ' · abonelik: ' + kacir(s.abonelik.abonelik.abonelikAdi) : ''}
            </div>
          </div>
          <div class="kart-satir-sag ${s.yon === 'Gider' ? 'eksi' : 'arti'}">
            ${s.yon === 'Gider' ? '−' : '+'}${kacir(para(s.tutar))}
          </div>
        </li>`).join('')}
    </ul>
    ${isaretli.length > 200 ? `<div class="liste-devam">${isaretli.length - 200} satır daha…</div>` : ''}

    <div class="pencere-dugmeler onizleme-dugmeler">
      <button class="dugme dugme-sade" type="button" id="vazgec">Vazgeç</button>
      <button class="dugme" type="button" id="basla" ${yeni.length ? '' : 'disabled'}>
        ${simge('sagOk')}<span>${yeni.length ? yeni.length + ' hareketi başlıklandır' : 'Yeni hareket yok'}</span>
      </button>
    </div>`;

  kap.querySelector('#vazgec').addEventListener('click', () => dosyaSec(kap, hesap, sayfa));
  if (!yeni.length) return;

  kap.querySelector('#basla').addEventListener('click', async () => {
    const yuklemeId = await vt.ekle('ekstreYukleme', {
      hesap: hesap.id,
      dosya: dosya.name,
      yuklemeTarihi: new Date().toISOString(),
      toplamSatir: isaretli.length,
      yeniSatir: yeni.length,
      mevcutSatir: mevcutSayi,
      islenenSatir: 0,
      durum: 'Başlık Atanıyor',
      bekleyen: yeni,          // sihirbaz bitene kadar burada bekler
      atanan: [],
    });
    sihirbaz(kap, hesap, await vt.oku('ekstreYukleme', yuklemeId), sayfa);
  });
}

/* -------------------------------------------------- 3) başlık atama sihirbazı */

async function devamSor(kap, hesap, yukleme, sayfa) {
  const kalan = (yukleme.bekleyen || []).length - (yukleme.atanan || []).length;
  kap.innerHTML = `
    <div class="bos-durum">
      ${simge('yukle', 'simge-40')}
      <h3>Yarım kalmış yükleme var</h3>
      <p><b>${kacir(yukleme.dosya)}</b> dosyasında <b>${kalan}</b> hareket başlık bekliyor.
         Kaldığın yerden devam edebilirsin.</p>
      <button class="dugme" type="button" id="devam">${simge('sagOk')}<span>Kaldığım yerden devam et</span></button>
      <button class="giris-bag" type="button" id="iptal">Bu yüklemeyi iptal et</button>
    </div>`;
  kap.querySelector('#devam').addEventListener('click', () => sihirbaz(kap, hesap, yukleme, sayfa));
  kap.querySelector('#iptal').addEventListener('click', async () => {
    const evet = await onayla({
      baslik: 'Yükleme iptal edilsin mi?',
      yazi: 'Bu ekstre yüklemesi silinecek. Hiçbir hareket hesaba işlenmemişti, ' +
            'bu yüzden verilerinde bir değişiklik olmaz.',
      onayla: 'Evet, iptal et', tehlikeli: true,
    });
    if (!evet) return;
    await vt.sil('ekstreYukleme', yukleme.id, 'Yükleme iptal');
    bildir('Yükleme iptal edildi.', 'basari');
    dosyaSec(kap, hesap, sayfa);
  });
}

async function sihirbaz(kap, hesap, yukleme, sayfa) {
  const [gelirB, giderB] = await Promise.all([
    vt.hepsi('gelirBasliklari'), vt.hepsi('giderBasliklari'),
  ]);
  const gelirSecenek = basliklariSer(gelirB);
  const giderSecenek = basliklariSer(giderB);

  const bekleyen = yukleme.bekleyen || [];
  const atanan = [...(yukleme.atanan || [])];
  let sira = atanan.length;

  async function durumuKaydet() {
    await vt.guncelle('ekstreYukleme', yukleme.id, { atanan, islenenSatir: atanan.length });
  }

  function ciz() {
    if (sira >= bekleyen.length) return bitir();

    const s = bekleyen[sira];
    const gelirMi = s.yon === 'Gelir';
    const secenekler = gelirMi ? gelirSecenek : giderSecenek;

    kap.innerHTML = `
      <div class="sihirbaz">
        <div class="sihirbaz-ilerleme">
          <div class="sihirbaz-cubuk"><div style="width:${(sira / bekleyen.length) * 100}%"></div></div>
          <div class="silik">${sira + 1} / ${bekleyen.length}</div>
        </div>

        <div class="sihirbaz-yon ${gelirMi ? 'gelir' : 'gider'}">
          ${gelirMi ? 'GELİR' : 'GİDER'}
        </div>

        <div class="sihirbaz-tutar ${gelirMi ? 'arti' : 'eksi'}">
          ${gelirMi ? '+' : '−'}${kacir(paraSimgeli(s.tutar))}
        </div>
        <div class="sihirbaz-aciklama">${kacir(s.aciklama)}</div>
        <div class="sihirbaz-tarih silik">${kacir(tarih(s.tarih))}${
          s.dekontNo ? ' · Dekont ' + kacir(s.dekontNo) : ''}</div>

        ${s.abonelik ? `
          <label class="onay-kutu sihirbaz-abonelik">
            <input type="checkbox" id="abonelik-tik" ${s.abonelik.kesin ? 'checked' : ''}>
            <span>Bu, <b>${kacir(s.abonelik.abonelik.abonelikAdi)}</b> aboneliğinin ödemesi
              ${s.abonelik.kesin ? '' : ' <em>(emin değilim, sen karar ver)</em>'}</span>
          </label>` : ''}

        <div class="sihirbaz-secim">
          <label class="alan-etiket sihirbaz-soru" for="sihirbaz-baslik">
            LÜTFEN ${gelirMi ? 'GELİR' : 'GİDER'} GRUBU SEÇİN
          </label>
          <select class="alan-giris sihirbaz-baslik" id="sihirbaz-baslik">
            <option value="">— seçilmedi —</option>
            ${secenekler.map(o => `<option value="${kacir(o.id)}" ${
              o.id === s.onerilen ? 'selected' : ''}>${kacir(o.ad)}</option>`).join('')}
          </select>
          ${s.onerilen ? '<div class="alan-ipucu">Daha önce benzer bir açıklamaya bu başlığı vermiştin.</div>' : ''}
        </div>

        <div class="sihirbaz-dugmeler">
          <button class="dugme dugme-sade" type="button" id="geri-don">
            ${simge('geri')}<span>Geri dön</span></button>
          <button class="dugme" type="button" id="ilerle">
            <span>${sira + 1 === bekleyen.length ? 'Bitir ve işle' : 'Kaydet ve ilerle'}</span>${simge('sagOk')}</button>
        </div>
        <div class="form-hata" role="alert" id="sihirbaz-hata"></div>
      </div>`;

    const secim = kap.querySelector('#sihirbaz-baslik');
    const hata = kap.querySelector('#sihirbaz-hata');

    kap.querySelector('#geri-don').addEventListener('click', async () => {
      if (sira === 0) { await durumuKaydet(); geriDon(); return; }
      sira--;
      atanan.pop();
      await durumuKaydet();
      ciz();
    });

    kap.querySelector('#ilerle').addEventListener('click', async () => {
      if (!secim.value) {
        hata.textContent = `Önce bir ${gelirMi ? 'gelir' : 'gider'} grubu seç.`;
        secim.focus();
        return;
      }
      const abonelikTik = kap.querySelector('#abonelik-tik');
      atanan[sira] = {
        baslik: secim.value,
        abonelik: abonelikTik?.checked ? s.abonelik.abonelik.id : null,
      };
      sira++;
      await durumuKaydet();
      ciz();
    });
  }

  /* ------------------------------------------- 4) işle: hepsi birden yazılır */
  async function bitir() {
    kap.innerHTML = `
      <div class="yukleniyor"><div class="yukleniyor-cubuk"></div></div>
      <p class="silik okuma-notu">Hareketler hesaba işleniyor…</p>`;

    const hareketler = bekleyen.map((s, i) => ({
      hesap: hesap.id,
      tarih: s.tarih,
      aciklama: s.aciklama,
      tutar: s.tutar,
      yon: s.yon,
      gelirBasligi: s.yon === 'Gelir' ? atanan[i].baslik : null,
      giderBasligi: s.yon === 'Gider' ? atanan[i].baslik : null,
      karsiHesap: null,
      dekontNo: s.dekontNo,
      bagliAbonelik: atanan[i].abonelik,
      bagliYatirimIslemi: null,
      ekstreYuklemesi: yukleme.id,
      girisSekli: 'Ekstreden',
    }));

    const idler = await vt.topluEkle('bankaHareketleri', hareketler);

    /* Abonelik eşleşenlerin o dönemki tiki işaretlenir. */
    const odemeler = await vt.hepsi('abonelikOdemeleri');
    for (let i = 0; i < hareketler.length; i++) {
      const abonelikId = hareketler[i].bagliAbonelik;
      if (!abonelikId) continue;
      const donem = hareketler[i].tarih.slice(0, 7);
      const mevcut = odemeler.find(o => o.abonelik === abonelikId &&
                                        String(o.donem).slice(0, 7) === donem);
      const kayit = {
        abonelik: abonelikId,
        donem: donem + '-01',
        beklenenTutar: hareketler[i].tutar,
        odenenTutar: hareketler[i].tutar,
        odendi: true,
        eslesenHareket: idler[i],
      };
      if (mevcut) await vt.guncelle('abonelikOdemeleri', mevcut.id, kayit);
      else await vt.ekle('abonelikOdemeleri', kayit);
    }

    await vt.guncelle('ekstreYukleme', yukleme.id, {
      durum: 'İşlendi',
      islenenSatir: hareketler.length,
      bekleyen: null,
      atanan: null,
    });

    await tikGoster(`${hareketler.length} hareket işlendi`);
    git('/hesaplar/hareketler/' + hesap.id);
  }

  ciz();
}
