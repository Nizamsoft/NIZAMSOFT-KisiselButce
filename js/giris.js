/* Nizam Soft · Kişisel Bütçe — giriş kapısı
   Açılış ekranı (logo + yüzde + mesaj) ve PIN ekranı (ortada kart).
   Üç hâli vardır: PIN kurma · PIN ile giriş · PIN kurtarma. */

import { simge } from './simge.js';
import { FIRMA_ADI, UYGULAMA_ADI } from './surum.js';
import {
  PIN_UZUNLUK, KURTARMA_SORUSU,
  kurulduMu, kur, ac, kurtarmaIleAc, pinDegistir,
} from './kilit.js';

const MARKA = `
  <div class="marka">
    <img src="./icon-512.png" alt="${FIRMA_ADI} ${UYGULAMA_ADI}" width="88" height="88">
    <div class="marka-cizgi"></div>
    <div class="marka-ad">${FIRMA_ADI}</div>
  </div>`;

/* ------------------------------------------------------------ açılış ekranı */

/**
 * Açılış ekranını gösterir ve verilen işi yaparken çubuğu ilerletir.
 * @param {(mesaj:string, yuzde:number)=>void} is
 */
export async function acilisGoster(is) {
  const ekran = document.createElement('div');
  ekran.className = 'acilis';
  ekran.innerHTML = `
    ${MARKA}
    <div class="acilis-cubuk"><div class="acilis-dolgu" id="acilis-dolgu"></div></div>
    <div class="acilis-yuzde" id="acilis-yuzde">%0</div>
    <div class="acilis-mesaj" id="acilis-mesaj" role="status">Başlatılıyor…</div>`;
  document.body.append(ekran);

  const dolgu = ekran.querySelector('#acilis-dolgu');
  const yuzdeYazi = ekran.querySelector('#acilis-yuzde');
  const mesaj = ekran.querySelector('#acilis-mesaj');

  const ilerle = (metin, yuzde) => {
    mesaj.textContent = metin;
    dolgu.style.width = yuzde + '%';
    yuzdeYazi.textContent = '%' + Math.round(yuzde);
  };

  try {
    await is(ilerle);
    ilerle('Hazır', 100);
  } finally {
    await new Promise(b => setTimeout(b, 260));
    ekran.remove();
  }
}

/* --------------------------------------------------------------- PIN alanı */

/** PIN kutucuklarını ve gizli girişi kurar; tamamlanınca islev çağrılır. */
function pinAlaniKur(kap, islev) {
  const giris = kap.querySelector('.pin-gizli');
  const kutular = [...kap.querySelectorAll('.pin-kutu')];

  function ciz() {
    const deger = giris.value;
    kutular.forEach((kutu, i) => {
      kutu.textContent = deger[i] ? '•' : '';
      kutu.classList.toggle('dolu', Boolean(deger[i]));
      kutu.classList.toggle('odak', i === deger.length && document.activeElement === giris);
    });
  }

  giris.addEventListener('input', () => {
    giris.value = giris.value.replace(/\D/g, '').slice(0, PIN_UZUNLUK);
    ciz();
    if (giris.value.length === PIN_UZUNLUK) islev(giris.value);
  });
  giris.addEventListener('focus', ciz);
  giris.addEventListener('blur', ciz);
  kap.addEventListener('click', () => giris.focus());

  ciz();
  setTimeout(() => giris.focus(), 60);
  return {
    temizle() { giris.value = ''; ciz(); giris.focus(); },
    odakla() { giris.focus(); },
  };
}

const PIN_ALANI = `
  <div class="pin-kutular">
    ${Array.from({ length: PIN_UZUNLUK }, () => '<div class="pin-kutu"></div>').join('')}
    <input class="pin-gizli" type="text" inputmode="numeric" autocomplete="off"
           maxlength="${PIN_UZUNLUK}" aria-label="${PIN_UZUNLUK} haneli PIN">
  </div>`;

/* ------------------------------------------------------------ giriş ekranı */

/**
 * Giriş kapısını açar. Kullanıcı içeri girene kadar bekler.
 * @returns {Promise<void>}
 */
export function girisiAc() {
  return new Promise(async (bitti) => {
    const kuruldu = await kurulduMu();
    const ekran = document.createElement('div');
    ekran.className = 'giris';
    document.body.append(ekran);

    const kapat = () => { ekran.remove(); bitti(); };

    if (kuruldu) cizGiris(ekran, kapat);
    else cizKurulum(ekran, kapat);
  });
}

/* --- 1) İlk açılış: PIN belirle + kurtarma sorusunu cevapla --- */

function cizKurulum(ekran, kapat) {
  let birinciPin = null;

  function adim(baslik, aciklama, hata = '') {
    ekran.innerHTML = `
      <div class="kart giris-kart">
        ${MARKA}
        <h2>${baslik}</h2>
        <div class="giris-aciklama">${aciklama}</div>
        ${PIN_ALANI}
        <div class="giris-hata" role="alert">${hata}</div>
      </div>`;
    return pinAlaniKur(ekran, girilen => {
      if (birinciPin === null) {
        birinciPin = girilen;
        adim('PIN’i doğrula', 'Aynı 6 haneyi bir kez daha gir.');
      } else if (birinciPin !== girilen) {
        birinciPin = null;
        adim('PIN belirle', `Uygulamayı her açtığında bu ${PIN_UZUNLUK} haneyi soracağız.`,
             'İki PIN aynı olmadı. Baştan dene.');
      } else {
        cizKurtarmaKurulum(ekran, birinciPin, kapat);
      }
    });
  }

  adim('PIN belirle', `Uygulamayı her açtığında bu ${PIN_UZUNLUK} haneyi soracağız.`);
}

function cizKurtarmaKurulum(ekran, pin, kapat) {
  ekran.innerHTML = `
    <form class="kart giris-kart" id="kurtarma-form">
      ${MARKA}
      <h2>Kurtarma sorusu</h2>
      <div class="giris-aciklama">
        PIN’ini unutursan bu soruyu soracağız. Cevabı unutma —
        sunucu olmadığı için başka kurtarma yolu yok.
      </div>
      <label class="alan" style="text-align:left">
        <span class="alan-etiket">${KURTARMA_SORUSU}</span>
        <input class="alan-giris" id="kurtarma-cevap" type="text"
               autocomplete="off" required maxlength="60">
      </label>
      <div class="giris-hata" role="alert" id="kurtarma-hata"></div>
      <button class="dugme" type="submit" style="width:100%">
        ${simge('kilit')}<span>Kaydet ve başla</span>
      </button>
    </form>`;

  const form = ekran.querySelector('#kurtarma-form');
  const cevap = ekran.querySelector('#kurtarma-cevap');
  const hata = ekran.querySelector('#kurtarma-hata');
  setTimeout(() => cevap.focus(), 60);

  form.addEventListener('submit', async olay => {
    olay.preventDefault();
    if (cevap.value.trim().length < 2) {
      hata.textContent = 'Cevap en az iki harf olmalı.';
      return;
    }
    hata.textContent = '';
    form.querySelector('button').disabled = true;
    await kur(pin, cevap.value);
    kapat();
  });
}

/* --- 2) Her açılışta: PIN sor --- */

function cizGiris(ekran, kapat) {
  ekran.innerHTML = `
    <div class="kart giris-kart">
      ${MARKA}
      <h2>PIN’ini gir</h2>
      <div class="giris-aciklama">${UYGULAMA_ADI} cihazında kilitli.</div>
      ${PIN_ALANI}
      <div class="giris-hata" role="alert" id="giris-hata"></div>
      <button class="giris-bag" type="button" id="unuttum">PIN’imi unuttum</button>
    </div>`;

  const hata = ekran.querySelector('#giris-hata');
  const alan = pinAlaniKur(ekran, async girilen => {
    hata.textContent = '';
    if (await ac(girilen)) kapat();
    else { hata.textContent = 'PIN yanlış. Tekrar dene.'; alan.temizle(); }
  });

  ekran.querySelector('#unuttum').addEventListener('click', () => cizKurtarma(ekran, kapat));
}

/* --- 3) Kurtarma: soruya cevap ver, sonra yeni PIN belirle --- */

function cizKurtarma(ekran, kapat) {
  ekran.innerHTML = `
    <form class="kart giris-kart" id="kurtarma-form">
      ${MARKA}
      <h2>PIN kurtarma</h2>
      <div class="giris-aciklama">
        Soruyu doğru cevaplarsan yeni bir PIN belirlersin. Verilerin olduğu gibi kalır.
      </div>
      <label class="alan" style="text-align:left">
        <span class="alan-etiket">${KURTARMA_SORUSU}</span>
        <input class="alan-giris" id="kurtarma-cevap" type="text"
               autocomplete="off" required maxlength="60">
      </label>
      <div class="giris-hata" role="alert" id="kurtarma-hata"></div>
      <button class="dugme" type="submit" style="width:100%">
        ${simge('onay')}<span>Doğrula</span>
      </button>
      <button class="giris-bag" type="button" id="vazgec">PIN girişine dön</button>
    </form>`;

  const form = ekran.querySelector('#kurtarma-form');
  const cevap = ekran.querySelector('#kurtarma-cevap');
  const hata = ekran.querySelector('#kurtarma-hata');
  setTimeout(() => cevap.focus(), 60);

  ekran.querySelector('#vazgec').addEventListener('click', () => cizGiris(ekran, kapat));

  form.addEventListener('submit', async olay => {
    olay.preventDefault();
    const dugme = form.querySelector('button');
    dugme.disabled = true;
    hata.textContent = '';
    if (await kurtarmaIleAc(cevap.value)) cizYeniPin(ekran, kapat);
    else { hata.textContent = 'Cevap doğru değil.'; dugme.disabled = false; }
  });
}

function cizYeniPin(ekran, kapat) {
  let birinci = null;

  function adim(baslik, aciklama, hata = '') {
    ekran.innerHTML = `
      <div class="kart giris-kart">
        ${MARKA}
        <h2>${baslik}</h2>
        <div class="giris-aciklama">${aciklama}</div>
        ${PIN_ALANI}
        <div class="giris-hata" role="alert">${hata}</div>
      </div>`;
    return pinAlaniKur(ekran, async girilen => {
      if (birinci === null) {
        birinci = girilen;
        adim('Yeni PIN’i doğrula', 'Aynı 6 haneyi bir kez daha gir.');
      } else if (birinci !== girilen) {
        birinci = null;
        adim('Yeni PIN belirle', 'Bundan sonra bu PIN geçerli olacak.',
             'İki PIN aynı olmadı. Baştan dene.');
      } else {
        await pinDegistir(birinci);
        kapat();
      }
    });
  }

  adim('Yeni PIN belirle', 'Bundan sonra bu PIN geçerli olacak.');
}
