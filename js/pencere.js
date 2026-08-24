/* Nizam Soft · Kişisel Bütçe — pencere
   Veri girişi ortada küçük pencerede yapılır. Silme ve geri alınamayan
   işlemler "Emin misin?" penceresiyle onaylanır. */

import { simge } from './simge.js';
import { kacir } from './veri/bicim.js';

let acikPencere = null;

/**
 * Ortada pencere açar.
 * @param {object} ayar {baslik, govde:HTMLElement|string, genis?:boolean}
 * @returns {{kapat:Function, kok:HTMLElement}}
 */
export function pencereAc({ baslik, govde, genis = false }) {
  kapatHepsini();

  const perde = document.createElement('div');
  perde.className = 'pencere-perde';

  const kutu = document.createElement('div');
  kutu.className = 'pencere' + (genis ? ' pencere-genis' : '');
  kutu.setAttribute('role', 'dialog');
  kutu.setAttribute('aria-modal', 'true');
  kutu.setAttribute('aria-label', baslik);
  kutu.innerHTML = `
    <div class="pencere-baslik">
      <h2>${kacir(baslik)}</h2>
      <button class="dugme-simge-tek" type="button" data-kapat aria-label="Kapat">${simge('kapat')}</button>
    </div>
    <div class="pencere-govde"></div>`;

  const govdeKutu = kutu.querySelector('.pencere-govde');
  if (typeof govde === 'string') govdeKutu.innerHTML = govde;
  else govdeKutu.append(govde);

  function kapat() {
    perde.remove();
    kutu.remove();
    document.removeEventListener('keydown', tusla);
    acikPencere = null;
  }
  function tusla(olay) {
    if (olay.key === 'Escape') kapat();
    if (olay.key === 'Tab') odagiIcerdeTut(olay, kutu);
  }

  perde.addEventListener('click', kapat);
  kutu.querySelector('[data-kapat]').addEventListener('click', kapat);
  document.addEventListener('keydown', tusla);
  document.body.append(perde, kutu);

  const ilk = kutu.querySelector('input, select, textarea, button:not([data-kapat])');
  setTimeout(() => (ilk || kutu).focus(), 40);

  acikPencere = { kapat };
  return { kapat, kok: govdeKutu };
}

export function kapatHepsini() {
  if (acikPencere) acikPencere.kapat();
}

/** Sekme dolaşımı pencerenin içinde kalsın. */
function odagiIcerdeTut(olay, kutu) {
  const odaklanabilir = [...kutu.querySelectorAll(
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])')]
    .filter(e => e.offsetParent !== null);
  if (!odaklanabilir.length) return;
  const ilk = odaklanabilir[0];
  const son = odaklanabilir[odaklanabilir.length - 1];
  if (olay.shiftKey && document.activeElement === ilk) { olay.preventDefault(); son.focus(); }
  else if (!olay.shiftKey && document.activeElement === son) { olay.preventDefault(); ilk.focus(); }
}

/**
 * "Emin misin?" penceresi. Onaylanırsa true döner.
 * @param {object} ayar {baslik, yazi, onayla, tehlikeli?}
 */
export function onayla({ baslik, yazi, onayla: onayYazisi = 'Evet, devam et', tehlikeli = false }) {
  return new Promise(bitti => {
    const govde = document.createElement('div');
    govde.innerHTML = `
      <p class="pencere-yazi">${kacir(yazi)}</p>
      <div class="pencere-dugmeler">
        <button class="dugme dugme-sade" type="button" data-hayir>Vazgeç</button>
        <button class="dugme ${tehlikeli ? 'dugme-tehlike' : ''}" type="button" data-evet>
          ${simge(tehlikeli ? 'uyari' : 'onay')}<span>${kacir(onayYazisi)}</span>
        </button>
      </div>`;
    const { kapat } = pencereAc({ baslik, govde });
    govde.querySelector('[data-hayir]').addEventListener('click', () => { kapat(); bitti(false); });
    govde.querySelector('[data-evet]').addEventListener('click', () => { kapat(); bitti(true); });
  });
}

/** Sağ üstte yığılan bildirim kartı. */
export function bildir(metin, tur = 'bilgi') {
  let yig = document.getElementById('bildirim-yigini');
  if (!yig) {
    yig = document.createElement('div');
    yig.id = 'bildirim-yigini';
    yig.className = 'bildirim-yigini';
    document.body.append(yig);
  }
  const kart = document.createElement('div');
  kart.className = 'kart kart-serit bildirim ' + tur;
  kart.setAttribute('role', 'status');
  kart.innerHTML = `${simge(tur === 'tehlike' ? 'uyari' : 'onay', 'simge-16')}<span>${kacir(metin)}</span>`;
  yig.append(kart);
  setTimeout(() => kart.remove(), 3200);
}
