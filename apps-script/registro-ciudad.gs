// ================================================================
// REGISTRO DE "CIUDAD" DESDE LA LANDING — GUÍA DE APLICACIÓN
// ================================================================
// Archivo de referencia local, NO se despliega solo. Copia estos
// cambios a mano en Extensiones → Apps Script → Código.gs.
//
// La landing ya manda el campo "ciudad" en el POST. Para guardarlo,
// agregamos una columna NUEVA AL FINAL (columna T = 20), no insertada
// entre las columnas existentes — así ningún índice que ya usa el
// script (COL_ASIGNAR_A, COL_MONTO_COMPRA, COL_ENVIADO_META,
// CONFIG_NOMBRE_COL, CONFIG_WA_COL, etc.) se recorre ni se rompe.
//
// Pasos:
//   1. En la hoja, escribe "Ciudad" en la celda T4 (columna 20,
//      misma fila que los demás encabezados) — está vacía ahora.
//   2. Agrega esta línea nueva, var COL_CIUDAD = 20;, junto a tus
//      demás constantes de columna (donde están COL_FECHA, COL_HORA, etc.)
//   3. Dentro de doPost(e), agrega UNA línea nueva (ver abajo) —
//      el resto de la función queda exactamente igual.
//   4. ⚠️ PASO QUE SE OLVIDA FÁCIL: guardar (Ctrl+S) NO actualiza la
//      URL pública del Web App (la que usa la landing). doPost solo
//      vive en esa URL si además haces: Implementar → Administrar
//      implementaciones → ícono de lápiz ✏️ → Versión: "Nueva versión"
//      → Implementar. Esto aplica cada vez que cambies doPost en el
//      futuro — ya nos pasó una vez que el cambio quedó guardado pero
//      nunca llegó a producción por saltarse este paso.


// ---- PASO 1: agregar esta constante junto a las demás (arriba del archivo) ----
var COL_CIUDAD = 20; // columna T


// ---- PASO 2: en doPost(e), agrega esta línea nueva (no reemplaces nada más) ----
//
// function doPost(e) {
//   var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
//   var data = JSON.parse(e.postData.contents);
//   var row = encontrarFilaVacia(sheet);
//
//   sheet.getRange(row, COL_FECHA).setValue(data.fecha || "");
//   sheet.getRange(row, COL_HORA).setValue(data.hora || "");
//   sheet.getRange(row, COL_NOMBRE).setValue(data.nombre || "");
//   sheet.getRange(row, COL_CORREO).setValue(data.correo || "");
//   sheet.getRange(row, COL_TELEFONO).setValue(data.telefono || "");
//   sheet.getRange(row, COL_PRODUCTO).setValue(data.producto || "");
//   sheet.getRange(row, 7).setValue(data.fuente || "");
//   sheet.getRange(row, 8).setValue(data.medio || "");
//   sheet.getRange(row, 9).setValue(data.campana || "");
//   sheet.getRange(row, 10).setValue(data.contenido || "");
//   sheet.getRange(row, 11).setValue(data.fbclid || "");
//   sheet.getRange(row, COL_CIUDAD).setValue(data.ciudad || "");   // <-- LÍNEA NUEVA
//
//   return ContentService.createTextOutput("OK");
// }
