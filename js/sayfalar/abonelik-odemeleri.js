/* Nizam Soft · Kişisel Bütçe — Abonelik Ödemeleri ekranı
   Bir aboneliğin ay ay ödenip ödenmediğini tik olarak tutar. Ekstre
   yüklenirken eşleşen hareket tiki kendiliğinden koyar; kullanıcı elle
   değiştirebilir. */

import { simge } from '../simge.js';
import { geriDon, cozumle } from '../yonlendirici.js';
import * as vt from '../veri/vt.js';
import { abonelikDuzenle } from '../kayitlar.js';
import { bildir } from '../pencere.js';
import { paraSimgeli, ay, kacir } from '../veri/bicim.js';

/** Aboneliğin başladığı aydan bu aya kadarki dönemler. */
function donemler(basTarih, aySayisi = 12) {
  const bugunT = new Date();
  const liste = [];
  for (let i = 0; i < aySayisi; i++) {
    const t = new Date(bugunT.getFullYear(), bugunT.getMonth() - i, 1);
    liste.push(`${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}`);
  }
  return liste;
}

export default {
  baslik: 'Abonelik Ödemeleri',
  simge: 'abonelik',
  async ciz(kap, parametre) {
    kap.innerHTML = '<div class="yukleniyor"><div class="yukleniyor-cubuk"></div></div>';

    const abonelik = await vt.oku('abonelikler', parametre.id);
    if (!abonelik) {
      kap.innerHTML = `
        <div class="bos-durum">
          ${simge('uyari', 'simge-40')}
          <h3>Abonelik bulunamadı</h3>
          <p>Bu abonelik silinmiş ya da adres yanlış olabilir.</p>
          <button class="dugme" type="button" id="geri">${simge('geri')}<span>Geri dön</span></button>
        </div>`;
      kap.querySelector('#geri').addEventListener('click', geriDon);
      return;
    }

    const odemeler = (await vt.hepsi('abonelikOdemeleri')).filter(o => o.abonelik === abonelik.id);
    const odemeHaritasi = new Map(odemeler.map(o => [String(o.donem).slice(0, 7), o]));

    kap.innerHTML = `
      <div class="kart kart-serit hesap-ozet">
        <div>
          <div class="silik">Abonelik · ayın ${kacir(abonelik.odemeGunu)}'i</div>
          <h2>${kacir(abonelik.abonelikAdi)}</h2>
        </div>
        <div class="hesap-ozet-bakiye">
          <span class="silik">Aylık</span>
          <b>${kacir(paraSimgeli(abonelik.aylikTutar))}</b>
        </div>
      </div>
      <button class="dugme dugme-sade hesap-eylem" type="button" id="abonelik-duzenle">
        ${simge('kalem')}<span>Aboneliği düzenle</span>
      </button>
      <div class="liste-arac"><div class="liste-arac-sol">Son 12 dönem</div></div>
      <ul class="kart-liste" id="donem-liste">
        ${donemler(abonelik.baslangic).map(d => {
          const o = odemeHaritasi.get(d);
          const odendi = Boolean(o?.odendi);
          return `
          <li class="kart-satir">
            <div class="kart-satir-govde">
              <div class="kart-satir-ust">${kacir(ay(d))}</div>
              <div class="kart-satir-alt">
                ${odendi
                  ? 'Ödendi · ' + kacir(paraSimgeli(o.odenenTutar ?? abonelik.aylikTutar))
                  : 'Ödenmedi'}
              </div>
            </div>
            <label class="onay-kutu tik-kutu">
              <input type="checkbox" data-donem="${kacir(d)}" ${odendi ? 'checked' : ''}
                     aria-label="${kacir(ay(d))} ödendi">
              <span class="yalniz-okuyucu">Ödendi</span>
            </label>
          </li>`;
        }).join('')}
      </ul>`;

    kap.querySelector('#abonelik-duzenle')
       .addEventListener('click', () => abonelikDuzenle(abonelik.id, () => cozumle()));

    kap.querySelectorAll('[data-donem]').forEach(kutu => {
      kutu.addEventListener('change', async () => {
        const donem = kutu.dataset.donem;
        const mevcut = odemeHaritasi.get(donem);
        const veri = {
          abonelik: abonelik.id,
          donem: donem + '-01',
          beklenenTutar: abonelik.aylikTutar,
          odenenTutar: kutu.checked ? abonelik.aylikTutar : null,
          odendi: kutu.checked,
          eslesenHareket: mevcut?.eslesenHareket ?? null,
        };
        if (mevcut) await vt.guncelle('abonelikOdemeleri', mevcut.id, veri);
        else await vt.ekle('abonelikOdemeleri', veri);
        bildir(kutu.checked ? 'Ödendi olarak işaretlendi.' : 'Ödenmedi olarak işaretlendi.', 'basari');
        cozumle();
      });
    });
  },
};
