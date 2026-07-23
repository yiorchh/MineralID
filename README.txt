MINERAL ID MVP

Contenido:
- Menú principal
- Cámara del teléfono
- Captura de fotografía
- Asistente básico con respuestas predeterminadas
- Dictado por voz, si el navegador lo permite
- Pantalla "Acerca de"
- PWA instalable básica

Cómo probar:
1. Descomprime la carpeta.
2. Abre una terminal dentro de la carpeta.
3. Ejecuta:
   python -m http.server 8000
4. Entra desde el navegador a:
   http://localhost:8000

Para probar en un celular:
- Debes alojar la carpeta en un servicio con HTTPS, por ejemplo GitHub Pages, Netlify o Vercel.
- La cámara normalmente no funciona al abrir index.html directamente desde archivos.
- El navegador pedirá permiso para usar la cámara y el micrófono.

Limitaciones:
- No reconoce minerales todavía.
- El asistente no usa IA generativa; usa respuestas predeterminadas.
- Es un prototipo académico, no una herramienta de diagnóstico mineralógico.

Controles avanzados de cámara:
- El botón de flash aparece cuando el navegador expone la capacidad torch.
- El control de enfoque manual aparece cuando la cámara expone focusDistance y focusMode manual.
- En iPhone se recomienda usar Safari, HTTPS, la cámara trasera y, de ser posible, instalar la PWA en la pantalla de inicio.
- La disponibilidad depende de la versión de iOS, Safari y el modelo de cámara; la interfaz informa cuando el control no está disponible.
