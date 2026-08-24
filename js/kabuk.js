/* Nizam Soft · Kişisel Bütçe — uygulama kabuğu
   Üst çubuk (ince başlık) · alt sekme şeridi (yüzen hap, ortada +) ·
   900px ve üstünde solda dikey panel. */

import { simge } from './simge.js';
import { GEZINME, EKLE_MENUSU } from './sayfalar/kayit.js';
import { git, geriDon } from './yonlendirici.js';
import { FIRMA_ADI, UYGULAMA_ADI } from './surum.js';

let menuAcik = false;

export function cizKabuk(kok) {
  kok.innerHTML = `
    <div class="uygulama">
      <nav class="yan-panel" aria-label="Ana gezinme">
        <div class="yan-panel-logo">
          <img src="./icon-512.png" alt="">
          <span>
            <b>${UYGULAMA_ADI}</b>
            <span>${FIRMA_ADI}</span>
          </span>
        </div>
        ${GEZINME.map(g => `
          <button class="yan-sekme" type="button" data-kok="${g.kok}" data-rota="${g.rota}">
            ${simge(g.simge)}<span>${g.ad}</span>
          </button>`).join('')}
        <button class="dugme yan-ekle" type="button" data-ekle>
          ${simge('arti')}<span>Yeni kayıt</span>
        </button>
      </nav>

      <header class="ust-cubuk">
        <button class="dugme-simge-tek" type="button" data-geri hidden aria-label="Geri">
          ${simge('geri')}
        </button>
        <h1 class="ust-cubuk-baslik" id="sayfa-basligi">Panel</h1>
        <button class="dugme-simge-tek" type="button" data-yardim aria-label="Destek ve istek">
          ${simge('yardim')}
        </button>
        <button class="cip" type="button" data-kullanici>
          <span class="cip-avatar">NS</span>
          <span style="text-align:left">
            <span class="cip-ad">Nizam Soft</span>
            <span class="cip-rol">Yönetici</span>
          </span>
        </button>
      </header>

      <main class="icerik" id="sayfa-govdesi" tabindex="-1"></main>

      <nav class="alt-cubuk" aria-label="Ana gezinme">
        <button class="alt-sekme" type="button" data-kok="panel" data-rota="/panel">
          ${simge('panel', 'simge-22')}<span>Panel</span>
        </button>
        <button class="alt-sekme" type="button" data-kok="hesaplar" data-rota="/hesaplar">
          ${simge('cuzdan', 'simge-22')}<span>Hesaplar</span>
        </button>
        <button class="alt-ekle" type="button" data-ekle aria-label="Yeni kayıt ekle">
          ${simge('arti', 'simge-22')}
        </button>
        <button class="alt-sekme" type="button" data-kok="raporlar" data-rota="/raporlar">
          ${simge('rapor', 'simge-22')}<span>Raporlar</span>
        </button>
        <button class="alt-sekme" type="button" data-kok="ayarlar" data-rota="/ayarlar">
          ${simge('ayarlar', 'simge-22')}<span>Ayarlar</span>
        </button>
      </nav>
    </div>`;

  kok.querySelectorAll('[data-rota]').forEach(dugme => {
    dugme.addEventListener('click', () => git(dugme.dataset.rota));
  });
  kok.querySelectorAll('[data-ekle]').forEach(dugme => {
    dugme.addEventListener('click', ekleMenusunuAc);
  });
  kok.querySelector('[data-geri]').addEventListener('click', geriDon);
  kok.querySelector('[data-yardim]').addEventListener('click', () => {
    duyur('Destek ve istek penceresi sonraki aşamada gelecek.');
  });
  kok.querySelector('[data-kullanici]').addEventListener('click', () => {
    duyur('Kullanıcı menüsü sonraki aşamada gelecek.');
  });
}

/** Üst çubuğu ve seçili gezinme durağını günceller. */
export function kabuguGuncelle({ baslik, kok, geri }) {
  document.getElementById('sayfa-basligi').textContent = baslik;
  document.title = baslik + ' · ' + UYGULAMA_ADI;
  document.querySelector('[data-geri]').hidden = !geri;
  document.querySelectorAll('[data-kok]').forEach(dugme => {
    if (dugme.dataset.kok === kok) dugme.setAttribute('aria-current', 'page');
    else dugme.removeAttribute('aria-current');
  });
}

/* ---------------------------------------------------- ekleme menüsü (+) */

function ekleMenusunuAc() {
  if (menuAcik) return;
  menuAcik = true;

  const perde = document.createElement('button');
  perde.className = 'ekle-perde';
  perde.setAttribute('aria-label', 'Menüyü kapat');

  const menu = document.createElement('div');
  menu.className = 'ekle-menu';
  menu.setAttribute('role', 'menu');
  menu.innerHTML = EKLE_MENUSU.map(m => `
    <button type="button" role="menuitem" disabled>${simge(m.simge)}<span>${m.ad}</span></button>
  `).join('');

  function kapat() {
    perde.remove();
    menu.remove();
    menuAcik = false;
    document.removeEventListener('keydown', kacinca);
  }
  function kacinca(olay) { if (olay.key === 'Escape') kapat(); }

  perde.addEventListener('click', kapat);
  document.addEventListener('keydown', kacinca);
  document.body.append(perde, menu);
  menu.querySelector('button').focus();
}

/* Geçici bildirim — Aşama 4'te sağ üstte yığılan kartlara dönecek. */
function duyur(metin) {
  const kutu = document.createElement('div');
  kutu.className = 'kart';
  kutu.setAttribute('role', 'status');
  kutu.style.cssText =
    'position:fixed;z-index:60;top:52px;right:10px;max-width:280px;font-size:13px';
  kutu.textContent = metin;
  document.body.append(kutu);
  setTimeout(() => kutu.remove(), 2600);
}
