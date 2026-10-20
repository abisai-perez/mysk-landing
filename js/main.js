// estrellitas doradas decorativas en el hero
const starsWrap = document.getElementById('stars');
const heroHeight = 900;
for (let i = 0; i < 26; i++) {
  const s = document.createElement('span');
  s.style.left = Math.random() * 100 + '%';
  s.style.top = Math.random() * heroHeight + 'px';
  s.style.animationDelay = (Math.random() * 4) + 's';
  starsWrap.appendChild(s);
}

// aviso flotante: oferta "Toda la Línea MYSK"
(function(){
  var banner = document.getElementById('promoBanner');
  var closeBtn = document.getElementById('promoClose');
  var link = document.getElementById('promoLink');
  if (!banner || !closeBtn || !link) return;

  var heroBtn = document.querySelector('.hero .cta-btn');
  var ALTO_AVISO_APROX = 140; // alto aproximado del aviso (con margen), para calcular la zona de peligro
  var mostrado = false;

  function heroLibreDeLaZonaDePeligro(){
    if (!heroBtn) return true;
    var r = heroBtn.getBoundingClientRect();
    var zonaPeligro = window.innerHeight - ALTO_AVISO_APROX;
    return r.bottom <= zonaPeligro || r.bottom <= 0;
  }

  function mostrarBanner(){
    if (mostrado || !heroLibreDeLaZonaDePeligro()) return;
    mostrado = true;
    banner.classList.remove('hidden');
  }
  function ocultarBanner(){
    banner.classList.add('hidden');
  }

  // el aviso solo aparece una vez que el botón principal del hero ya no está
  // en la franja inferior de la pantalla — evita que lo tape justo al entrar
  // (pasaba en celulares donde el hero cabe casi completo en la pantalla)
  mostrarBanner();
  window.addEventListener('scroll', mostrarBanner);
  window.addEventListener('resize', mostrarBanner);

  closeBtn.addEventListener('click', ocultarBanner);
  link.addEventListener('click', ocultarBanner);
})();

(function(){
  // ⚠️ Reemplaza esta URL por la de tu Google Apps Script Web App (ver instrucciones)
  var SHEET_WEBAPP_URL = "https://script.google.com/macros/s/AKfycbz8D_mgZ768CcyZ5GeYXAM6IF6h6Ir9WCvjjbrDCwnF0ckfaAEgbHgMxqfBA5m_mhGjpA/exec";

  // ---------- captura de origen del cliente (campañas de Meta Ads) ----------
  function hostnameFromReferrer(){
    try { return document.referrer ? new URL(document.referrer).hostname : 'directo'; }
    catch(e){ return 'directo'; }
  }
  function captureSource(){
    var params = new URLSearchParams(window.location.search);
    var fromUrl = {
      fuente: params.get('utm_source') || '',
      medio: params.get('utm_medium') || '',
      campana: params.get('utm_campaign') || '',
      contenido: params.get('utm_content') || '',
      fbclid: params.get('fbclid') || ''
    };
    var stored = {};
    try { stored = JSON.parse(sessionStorage.getItem('mysk_source') || '{}'); } catch(e){}
    var merged = {
      fuente: fromUrl.fuente || stored.fuente || hostnameFromReferrer(),
      medio: fromUrl.medio || stored.medio || '',
      campana: fromUrl.campana || stored.campana || '',
      contenido: fromUrl.contenido || stored.contenido || '',
      fbclid: fromUrl.fbclid || stored.fbclid || ''
    };
    try { sessionStorage.setItem('mysk_source', JSON.stringify(merged)); } catch(e){}
    return merged;
  }
  var sourceInfo = captureSource();

  var overlay = document.getElementById('orderOverlay');
  var form = document.getElementById('orderForm');
  var productLabel = document.getElementById('orderProductLabel');
  var closeBtn = document.getElementById('orderClose');
  var errorMsg = document.getElementById('orderError');
  var inputNombre = document.getElementById('orderNombre');
  var inputCorreo = document.getElementById('orderCorreo');
  var inputTelefono = document.getElementById('orderTelefono');
  var inputCiudad = document.getElementById('orderCiudad');
  var currentProduct = '';
  var currentWa = '584244178242';

  document.querySelectorAll('.cta-btn[data-product]').forEach(function(btn){
    btn.addEventListener('click', function(){
      currentProduct = btn.getAttribute('data-product');
      currentWa = btn.getAttribute('data-wa') || currentWa;
      productLabel.textContent = 'Producto: ' + currentProduct;
      form.reset();
      errorMsg.style.display = 'none';
      overlay.classList.add('active');
      if (typeof fbq === 'function') fbq('track', 'Lead');
    });
  });

  function closeModal(){ overlay.classList.remove('active'); }
  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', function(e){ if (e.target === overlay) closeModal(); });

  function showError(msg){
    errorMsg.textContent = msg;
    errorMsg.style.display = 'block';
  }

  function isValidEmail(v){
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  function handleConfirm(e){
    if (e) e.preventDefault();

    var nombre = inputNombre.value.trim();
    var correo = inputCorreo.value.trim();
    var telefono = inputTelefono.value.trim();
    var ciudad = inputCiudad.value.trim();

    if (!nombre || !correo || !telefono || !ciudad){
      showError('Por favor completa los cuatro campos: nombre, correo, teléfono y ciudad.');
      return;
    }
    if (!isValidEmail(correo)){
      showError('Por favor ingresa un correo válido (ejemplo: nombre@correo.com).');
      return;
    }
    errorMsg.style.display = 'none';

    var mensaje = 'Saludos, soy ' + nombre + ', de ' + ciudad + ', y quiero realizar una compra del producto ' + currentProduct + '.';
    var waLink = 'https://wa.me/' + currentWa + '?text=' + encodeURIComponent(mensaje);

    // Simula un clic real sobre un enlace <a target="_blank">, igual que hacían
    // los botones antes del cambio — es la forma más confiable de abrir WhatsApp.
    var waLinkEl = document.createElement('a');
    waLinkEl.href = waLink;
    waLinkEl.target = '_blank';
    waLinkEl.rel = 'noopener';
    document.body.appendChild(waLinkEl);
    waLinkEl.click();
    document.body.removeChild(waLinkEl);

    var ahora = new Date();
    var fechaStr = ahora.toLocaleDateString('es-VE');
    var horaStr = ahora.toLocaleTimeString('es-VE', {hour:'2-digit', minute:'2-digit'});

    var payload = {
      fecha: fechaStr,
      hora: horaStr,
      nombre: nombre,
      correo: correo,
      telefono: telefono,
      ciudad: ciudad,
      producto: currentProduct,
      fuente: sourceInfo.fuente,
      medio: sourceInfo.medio,
      campana: sourceInfo.campana,
      contenido: sourceInfo.contenido,
      fbclid: sourceInfo.fbclid
    };

    if (SHEET_WEBAPP_URL.indexOf('http') === 0) {
      fetch(SHEET_WEBAPP_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(payload)
      }).catch(function(){});
    }

    closeModal();
    form.reset();
  }

  form.addEventListener('submit', handleConfirm);
})();
