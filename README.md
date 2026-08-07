# MYSK — Landing page

Landing de conversión para campañas de Meta Ads de MYSK (cosmética de lujo árabe, hecha en Siria, distribuida en Venezuela).

## Estructura de carpetas

```
.
├── index.html          → estructura HTML, enlaza a los archivos externos
├── css/
│   └── styles.css      → todos los estilos del sitio
├── js/
│   ├── main.js          → estrellitas decorativas, modal de pedido, validación
│   │                       de campos, apertura de WhatsApp, captura de UTM/fbclid
│   │                       y envío al Google Apps Script
│   └── model3d.js       → visor 3D del pote (Three.js) y su fallback a imagen estática
└── img/
    ├── jar-fallback.jpg          → imagen estática de respaldo si el visor 3D no carga
    ├── silk-ivory.jpg            → foto de producto Silk Ivory
    ├── pink-musk-powder-bliss.jpg → foto del combo Pink Musk + Powder Bliss
    ├── jar-body-front.jpg        → textura frontal del pote para el modelo 3D
    ├── jar-body-side.jpg         → textura lateral del pote para el modelo 3D
    └── jar-top.jpg               → textura de la tapa del pote para el modelo 3D
```

Antes, todo (HTML + CSS + JS + imágenes en base64) vivía en un único archivo de ~725 KB. Ahora está separado en archivos independientes sin cambiar ningún comportamiento: mismo modal de pedido, mismo mensaje de WhatsApp, mismo `fetch()` al Apps Script, mismo visor 3D.

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
