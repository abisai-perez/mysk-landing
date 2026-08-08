// ================================================================
// INTEGRACIÓN META CONVERSIONS API (Purchase) — GUÍA DE APLICACIÓN
// ================================================================
// Este archivo es de referencia local, NO se despliega solo.
// Apps Script no está conectado a GitHub/Vercel — debes copiar
// estos cambios a mano en el editor real: Extensiones → Apps Script
// (dentro de la hoja MYSK-CRM), en tu archivo Código.gs.
//
// Hay DOS pasos:
//   PASO A — reemplazar tu función onEditInstalado(e) actual por la
//            versión de abajo (agrega una rama nueva, la de asignación
//            de vendedores queda exactamente igual, solo movida adentro
//            de un "if").
//   PASO B — agregar las funciones nuevas al final de Código.gs.
//
// También necesitas, antes de probar:
//   1. En la hoja, escribe "Enviado a Meta (Purchase)" en la celda Q4
//      (columna 17, fila de encabezados) — está vacía ahora mismo.
//   2. LANDING_URL ya está puesta abajo (https://mysk-landing.vercel.app/).
//   3. Confirma que META_ACCESS_TOKEN ya existe en Propiedades del
//      script (Configuración del proyecto ⚙️ → Propiedades de secuencia
//      de comandos) — dijiste que ya está, así que no hace falta tocarlo.


// ================================================================
// PASO A — REEMPLAZA tu función onEditInstalado(e) actual por esta:
// ================================================================
// (La lógica de "Asignar a (Ventas)" es idéntica a la tuya, solo está
// ahora dentro de "if (col === COL_ASIGNAR_A) { ... }" en vez de cortar
// con un "return" temprano — necesario para poder atender también la
// columna del Monto sin que una excluya a la otra.)

function onEditInstalado(e) {
  var sheet = e.range.getSheet();
  if (sheet.getName() !== SHEET_NAME) return;

  var col = e.range.getColumn();
  var row = e.range.getRow();
  if (row <= HEADER_ROW) return;

  // ---- rama existente: asignar lead a vendedor (SIN CAMBIOS) ----
  if (col === COL_ASIGNAR_A) {
    var contacto = e.range.getValue();
    if (!contacto) return;

    var nombreLead = sheet.getRange(row, COL_NOMBRE).getValue();
    if (!nombreLead) return;

    var correo = sheet.getRange(row, COL_CORREO).getValue();
    var telefono = sheet.getRange(row, COL_TELEFONO).getValue();
    var producto = sheet.getRange(row, COL_PRODUCTO).getValue();
    var fecha = sheet.getRange(row, COL_FECHA).getValue();
    var hora = sheet.getRange(row, COL_HORA).getValue();

    var waVentas = buscarNumeroContacto(sheet, contacto);
    if (!waVentas) {
      SpreadsheetApp.getUi().alert('No encontre el numero de WhatsApp de "' + contacto + '". Revisa la tabla de contactos (columnas R:S).');
      return;
    }

    var telCliente = limpiarTelefono(telefono);

    var mensaje = "Se le ha asignado un nuevo lead. Aqui los datos:\n\n" +
      "Nombre: " + nombreLead + "\n" +
      "Correo: " + correo + "\n" +
      "Telefono: " + telefono + "\n" +
      "Producto de interes: " + producto + "\n" +
      "Fecha de registro: " + fecha + " " + hora + "\n\n" +
      "Contactar al cliente: https://wa.me/" + telCliente;

    var url = "https://wa.me/" + waVentas + "?text=" + encodeURIComponent(mensaje);

    mostrarDialogoConfirmacion(mensaje, url, contacto);
    return;
  }

  // ---- rama nueva: venta confirmada → avisar a Meta ----
  if (col === COL_MONTO_COMPRA) {
    var nombreLead2 = sheet.getRange(row, COL_NOMBRE).getValue();
    if (!nombreLead2) return; // fila sin datos de lead, no hay nada que reportar

    var monto = Number(e.range.getValue());
    if (debeEnviarPurchase_(sheet, row, monto)) {
      enviarPurchaseAMeta(row);
    }
    return;
  }
}


// ================================================================
// PASO B — agrega estas funciones al final de Código.gs (nuevas,
// no reemplazan nada existente):
// ================================================================

var META_PIXEL_ID = '1899634771433428';
var META_API_VERSION = 'v26.0'; // Meta libera versión nueva cada trimestre; revisar cada ~1 año
var COL_MONTO_COMPRA = 15, COL_ENVIADO_META = 17; // Q — escribe el encabezado ahí manualmente
var LANDING_URL = 'https://mysk-landing.vercel.app/';

function sha256Hex_(texto) {
  var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, texto, Utilities.Charset.UTF_8);
  return bytes.map(function (b) {
    var v = (b < 0 ? b + 256 : b).toString(16);
    return v.length === 1 ? '0' + v : v;
  }).join('');
}

function normalizarEmailParaHash_(correo) {
  return String(correo).trim().toLowerCase();
}

/**
 * Decide si hay que (re)enviar el Purchase para esta fila: solo si el monto
 * es válido (>0) y es distinto al último monto que se envió con éxito, o si
 * el último intento fue un error (para permitir reintento).
 */
function debeEnviarPurchase_(sheet, fila, montoNuevo) {
  if (!(montoNuevo > 0)) return false;
  var registro = String(sheet.getRange(fila, COL_ENVIADO_META).getValue() || '');
  if (registro.indexOf('OK:') === 0) {
    var montoPrevio = parseFloat(registro.substring(3));
    if (montoPrevio === Number(montoNuevo)) return false; // ya se envió este mismo monto
  }
  return true;
}

/**
 * Envía un evento "Purchase" a la Conversions API de Meta para la fila indicada.
 * Registra el resultado (éxito o error) en la columna Q, junto con el monto
 * enviado — sirve de control anti-duplicados y de auditoría a la vez.
 */
function enviarPurchaseAMeta(fila) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

  var correo = sheet.getRange(fila, COL_CORREO).getValue();
  var telefono = sheet.getRange(fila, COL_TELEFONO).getValue();
  var fbclid = sheet.getRange(fila, 11).getValue(); // Click ID (fbclid), columna K
  var monto = Number(sheet.getRange(fila, COL_MONTO_COMPRA).getValue());

  var token = PropertiesService.getScriptProperties().getProperty('META_ACCESS_TOKEN');
  if (!token) {
    sheet.getRange(fila, COL_ENVIADO_META).setValue('ERR:' + monto + ' - falta META_ACCESS_TOKEN en Propiedades del script');
    return;
  }

  var userData = {};
  if (correo) userData.em = [sha256Hex_(normalizarEmailParaHash_(correo))];
  if (telefono) userData.ph = [sha256Hex_(limpiarTelefono(telefono))];
  if (fbclid) userData.fbc = 'fb.1.' + Date.now() + '.' + fbclid;

  var evento = {
    event_name: 'Purchase',
    event_time: Math.floor(Date.now() / 1000),
    event_id: 'purchase_row' + fila + '_' + Date.now(),
    action_source: 'chat',
    event_source_url: LANDING_URL,
    user_data: userData,
    custom_data: {
      value: monto,
      currency: 'USD'
    }
  };

  var url = 'https://graph.facebook.com/' + META_API_VERSION + '/' + META_PIXEL_ID +
    '/events?access_token=' + encodeURIComponent(token);

  var options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({ data: [evento] }),
    muteHttpExceptions: true
  };

  var exito = false;
  var detalle = '';
  try {
    var respuesta = UrlFetchApp.fetch(url, options);
    exito = (respuesta.getResponseCode() === 200);
    detalle = respuesta.getContentText().substring(0, 180);
  } catch (err) {
    detalle = String(err).substring(0, 180);
  }

  var marcaTiempo = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'America/Caracas', 'dd/MM/yyyy HH:mm');
  var registro = exito
    ? 'OK:' + monto + ' ' + marcaTiempo
    : 'ERR:' + monto + ' ' + marcaTiempo + ' - ' + detalle;

  sheet.getRange(fila, COL_ENVIADO_META).setValue(registro);
}
