/* Nizam Soft · Kişisel Bütçe — form bileşeni
 *
 * Alan tanımları künyeden (veri/tablolar.js) gelir; giriş türü alanın türüne
 * göre kurulur. Zorunlu alan boş kaydedilemez — hem burada hem kaydetmeden
 * önce denetlenir.
 */

import { simge } from './simge.js';
import { kacir, para, paraCoz, sayiyaYaz } from './veri/bicim.js';

/**
 * @param {object} ayar
 *   alanlar: [{ad, as, tur, zorunlu?, degerler?, secenekler?, ipucu?, gorunur?(deger)}]
 *   deger: mevcut değerler (düzenlemede)
 *   kaydet: async (deger) => void   hata fırlatırsa pencere kapanmaz
 *   degisince?: (deger, kok) => void  her girişte çağrılır (canlı hesap için)
 *   kaydetYazisi, ikinciDugme?: {yazi, simge, islev, tehlikeli?}
 * @returns {HTMLElement}
 */
export function form(ayar) {
  const kok = document.createElement('form');
  kok.className = 'kayit-form';
  kok.noValidate = true;

  const deger = { ...ayar.deger };

  kok.innerHTML = `
    <div id="form-alanlar"></div>
    <div class="form-hata" role="alert" id="form-hata"></div>
    <div class="pencere-dugmeler">
      ${ayar.ikinciDugme ? `
        <button class="dugme dugme-sade ${ayar.ikinciDugme.tehlikeli ? 'ikinci-tehlike' : ''}"
                type="button" data-ikinci>
          ${simge(ayar.ikinciDugme.simge || 'kapat')}<span>${kacir(ayar.ikinciDugme.yazi)}</span>
        </button>` : '<span></span>'}
      <button class="dugme" type="submit">
        ${simge('onay')}<span>${kacir(ayar.kaydetYazisi || 'Kaydet')}</span>
      </button>
    </div>`;

  const alanKutu = kok.querySelector('#form-alanlar');
  const hataKutu = kok.querySelector('#form-hata');

  function alanHtml(a) {
    const d = deger[a.as];
    const kimlik = 'alan-' + a.as;
    const zorunluIsaret = a.zorunlu ? ' <span class="zorunlu" aria-hidden="true">*</span>' : '';
    let giris;

    if (a.tur === 'Seçenek') {
      const secenekler = a.degerler || [];
      giris = `<select class="alan-giris" id="${kimlik}" data-as="${kacir(a.as)}">
        ${a.zorunlu ? '' : '<option value="">— seçilmedi —</option>'}
        ${secenekler.map(s => `<option value="${kacir(s)}" ${d === s ? 'selected' : ''}>${kacir(s)}</option>`).join('')}
      </select>`;
    } else if (a.tur === 'İlişki') {
      const secenekler = a.secenekler || [];
      giris = `<select class="alan-giris" id="${kimlik}" data-as="${kacir(a.as)}">
        <option value="">— seçilmedi —</option>
        ${secenekler.map(s => `<option value="${kacir(s.id)}" ${d === s.id ? 'selected' : ''}>${kacir(s.ad)}</option>`).join('')}
      </select>`;
    } else if (a.tur === 'Evet/Hayır') {
      giris = `<label class="onay-kutu">
        <input type="checkbox" id="${kimlik}" data-as="${kacir(a.as)}" ${d ? 'checked' : ''}>
        <span>${kacir(a.ipucu || 'Evet')}</span>
      </label>`;
    } else if (a.tur === 'Uzun metin') {
      giris = `<textarea class="alan-giris alan-uzun" id="${kimlik}" data-as="${kacir(a.as)}"
                 rows="3">${kacir(d ?? '')}</textarea>`;
    } else if (a.tur === 'Tarih') {
      giris = `<input class="alan-giris" type="date" id="${kimlik}" data-as="${kacir(a.as)}"
                value="${kacir(d ?? '')}">`;
    } else if (a.tur === 'Para') {
      giris = `<div class="para-alan">
        <input class="alan-giris" type="text" inputmode="decimal" id="${kimlik}"
               data-as="${kacir(a.as)}" data-para="1" autocomplete="off"
               value="${kacir(d === null || d === undefined || d === '' ? '' : para(d))}">
        <span class="para-simge">₺</span>
      </div>`;
    } else if (a.tur === 'Sayı') {
      giris = `<input class="alan-giris" type="text" inputmode="decimal" id="${kimlik}"
                data-as="${kacir(a.as)}" data-sayi="1" autocomplete="off"
                value="${kacir(sayiyaYaz(d))}">`;
    } else {
      giris = `<input class="alan-giris" type="text" id="${kimlik}" data-as="${kacir(a.as)}"
                autocomplete="off" value="${kacir(d ?? '')}">`;
    }

    return `<div class="alan" data-alan="${kacir(a.as)}">
      <label class="alan-etiket" for="${kimlik}">${kacir(a.ad)}${zorunluIsaret}</label>
      ${giris}
      ${a.ipucu && a.tur !== 'Evet/Hayır' ? `<div class="alan-ipucu">${kacir(a.ipucu)}</div>` : ''}
    </div>`;
  }

  function cizAlanlar() {
    const gorunenler = ayar.alanlar.filter(a => !a.gorunur || a.gorunur(deger));
    alanKutu.innerHTML = gorunenler.map(alanHtml).join('');
    alanKutu.querySelectorAll('[data-as]').forEach(giris => {
      const olay = giris.tagName === 'SELECT' || giris.type === 'checkbox' ? 'change' : 'input';
      giris.addEventListener(olay, () => {
        deger[giris.dataset.as] = giris.type === 'checkbox' ? giris.checked : giris.value;
        if (ayar.degisince) ayar.degisince(deger, kok);
        /* Bir alanın görünürlüğü başka alana bağlıysa yeniden çiz. */
        if (ayar.alanlar.some(a => a.gorunur) &&
            (giris.tagName === 'SELECT' || giris.type === 'checkbox')) {
          const odak = giris.dataset.as;
          cizAlanlar();
          const yeni = alanKutu.querySelector(`[data-as="${odak}"]`);
          if (yeni) yeni.focus();
        }
      });
    });
  }

  /** Girilen değerleri alan türüne göre çevirip döndürür; hata varsa fırlatır. */
  function topla() {
    const cikti = {};
    const gorunenler = ayar.alanlar.filter(a => !a.gorunur || a.gorunur(deger));
    for (const a of gorunenler) {
      const ham = deger[a.as];
      let d;
      if (a.tur === 'Para') {
        d = (ham === '' || ham === null || ham === undefined) ? null : paraCoz(ham);
        if (ham !== '' && ham !== null && ham !== undefined && d === null) {
          throw new Error(`"${a.ad}" alanına geçerli bir tutar yaz.`);
        }
      } else if (a.tur === 'Sayı') {
        d = (ham === '' || ham === null || ham === undefined) ? null : paraCoz(ham);
        if (ham !== '' && ham !== null && ham !== undefined && d === null) {
          throw new Error(`"${a.ad}" alanına geçerli bir sayı yaz.`);
        }
      } else if (a.tur === 'Evet/Hayır') {
        d = Boolean(ham);
      } else {
        d = (ham === '' || ham === undefined) ? null : ham;
      }
      if (a.zorunlu && (d === null || d === '')) {
        throw new Error(`"${a.ad}" boş bırakılamaz.`);
      }
      cikti[a.as] = d;
    }
    return cikti;
  }

  kok.addEventListener('submit', async olay => {
    olay.preventDefault();
    hataKutu.textContent = '';
    const dugme = kok.querySelector('button[type=submit]');
    const eskiYazi = dugme.querySelector('span').textContent;
    try {
      const veri = topla();
      dugme.disabled = true;
      dugme.querySelector('span').textContent = 'Kaydediliyor…';
      await ayar.kaydet(veri);
    } catch (hata) {
      hataKutu.textContent = hata.message || 'Kayıt edilemedi.';
      dugme.disabled = false;
      dugme.querySelector('span').textContent = eskiYazi;
    }
  });

  if (ayar.ikinciDugme) {
    kok.querySelector('[data-ikinci]').addEventListener('click', ayar.ikinciDugme.islev);
  }

  cizAlanlar();
  if (ayar.degisince) ayar.degisince(deger, kok);
  return kok;
}
