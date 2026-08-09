# MYSK — Landing page

Landing de conversión para campañas de Meta Ads de MYSK (cosmética de lujo árabe, hecha en Siria, distribuida en Venezuela).

## Estructura de carpetas

```
.
├── index.html          → estructura HTML; incluye el Píxel de Meta en <head>
├── css/
│   └── styles.css      → todos los estilos del sitio
├── js/
│   ├── main.js          → estrellitas decorativas, aviso flotante de oferta, modal
│   │                       de pedido, validación de campos, evento "Lead" del Píxel,
│   │                       apertura de WhatsApp, captura de UTM/fbclid y envío al
│   │                       Google Apps Script
│   └── model3d.js       → visor 3D del pote (Three.js) y su fallback a imagen estática
├── img/
│   ├── jar-fallback.jpg           → imagen estática de respaldo si el visor 3D no carga
│   ├── silk-ivory.jpg             → foto de producto Silk Ivory
│   ├── pink-musk-powder-bliss.jpg → foto del combo Pink Musk + Powder Bliss
│   ├── coleccion-completa.jpg     → foto de la oferta "Toda la Línea MYSK"
│   ├── jar-body-front.jpg         → textura frontal del pote para el modelo 3D
│   ├── jar-body-side.jpg          → textura lateral del pote para el modelo 3D
│   └── jar-top.jpg                → textura de la tapa del pote para el modelo 3D
└── apps-script/
    └── meta-capi-purchase.gs      → referencia del código pegado en el Apps Script real
                                      (Google Sheets), que envía el evento "Purchase" a
                                      la Conversions API de Meta cuando se registra una
                                      venta. Este archivo NO se despliega — es solo copia
                                      de respaldo/documentación de lo que corre en producción.
```

Antes, todo (HTML + CSS + JS + imágenes en base64) vivía en un único archivo de ~725 KB. Ahora está separado en archivos independientes sin cambiar ningún comportamiento: mismo modal de pedido, mismo mensaje de WhatsApp, mismo `fetch()` al Apps Script, mismo visor 3D.

### Productos en la landing

Velvet Rose (hero), Silk Ivory, Combo Pink Musk + Powder Bliss, y el bundle "Toda la Línea MYSK" ($60, los 4 productos) — este último también se promociona con un aviso flotante que aparece al cargar la página y hace scroll directo a su tarjeta.

### Meta Pixel + Conversions API

- El Píxel de Meta (`1899634771433428`, "Pixel Mysk") está instalado en `index.html`: dispara `PageView` al cargar y `Lead` al abrir el modal de pedido.
- El evento `Purchase` **no** se dispara desde el navegador — se envía desde el servidor (Apps Script) cuando se llena la columna "Monto de compra (USD)" en la hoja MYSK-CRM, vía Conversions API. Ver `apps-script/meta-capi-purchase.gs` para el detalle.

## Cómo levantar el sitio en local

Se necesita un servidor local (no basta con abrir `index.html` con doble clic, porque los `fetch`/módulos externos requieren `http://`, no `file://`).

Con Node.js instalado:

```bash
npx serve .
```

O con la extensión **Live Server** de VS Code: clic derecho sobre `index.html` → "Open with Live Server".

Luego abre la URL que indique la terminal (normalmente `http://localhost:3000` o similar).

## Notas

- El número de WhatsApp y el formato del mensaje de pedido están fijos en `js/main.js`, no se deben cambiar sin avisar.
- La variable `SHEET_WEBAPP_URL` en `js/main.js` apunta al Google Apps Script en producción — no reemplazar.
- El teléfono del cliente se limpia asumiendo Venezuela (código 58) del lado del Apps Script; es una limitación conocida.
