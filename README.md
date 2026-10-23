# Pilar a Pilar · PWA 1.3.0

Pilar a Pilar es una aplicación web progresiva (PWA) para evaluar siete pilares de vida, organizar hasta tres actividades semanales por pilar y revisar la evolución personal. Está construida con HTML, CSS y JavaScript vanilla. No requiere un framework ni un backend.

## Qué incluye

- Evaluación inicial y reevaluaciones manuales.
- Panel con las siete puntuaciones y colores por rango.
- Actividades semanales, tiempos estimados opcionales y puntuación por cumplimiento.
- Historial de evaluaciones y planes.
- Guardado local mediante `localStorage`.
- Manifiesto PWA, iconos instalables y service worker para caché del shell y uso básico sin conexión tras la primera carga correcta.
- Botón de instalación que utiliza el diálogo del navegador cuando está disponible y muestra instrucciones cuando no lo está.

## Requisitos

- Navegador moderno (Chrome, Edge, Firefox o Safari).
- Python 3 para el servidor local o una extensión similar de desarrollo web.
- Node.js 18 o superior solo para ejecutar las pruebas automáticas.

## Ejecutar en Windows

1. Descomprime el proyecto.
2. Abre una terminal en la carpeta `pilar-a-pilar`.
3. Ejecuta:

   ```powershell
   py -m http.server 8000
   ```

   Si no está disponible el comando `py`, prueba `python -m http.server 8000`.
4. Abre `http://localhost:8000`.
5. Visita la aplicación mientras tengas conexión local, navega por algunas pantallas y después prueba recargar con el modo sin conexión del navegador. El service worker debe haberse instalado y almacenado los archivos primero.
6. Detén el servidor con `Ctrl+C`.

No abras `index.html` directamente con `file://`: los módulos ES y el service worker requieren un origen adecuado. La instalación PWA funciona en `localhost` para desarrollo y en un sitio publicado a través de HTTPS.

## Ejecutar las pruebas

```bash
npm test
```

Las pruebas utilizan el módulo `node:test` de Node.js; no hay dependencias externas de ejecución.

## Estructura

```text
pilar-a-pilar/
├── index.html
├── manifest.webmanifest
├── sw.js
├── favicon.svg
├── favicon-32x32.png
├── apple-touch-icon.png
├── pwa-192.png
├── pwa-512.png
├── pwa-maskable.svg
├── pwa-maskable-512.png
├── css/styles.css
├── js/
│   ├── app.js
│   ├── dates.js
│   ├── pillars.js
│   ├── pwa.js
│   ├── scoring.js
│   ├── storage.js
│   └── views.js
├── tests/
├── package.json
└── README.md
```

## Publicar gratis con GitHub Pages

GitHub Pages sirve archivos HTML, CSS y JavaScript estáticos y soporta HTTPS. Es adecuado para esta aplicación porque no tiene backend. Consulta la documentación oficial de [GitHub Pages](https://docs.github.com/es/pages/getting-started-with-github-pages/what-is-github-pages) y la guía de [HTTPS](https://docs.github.com/es/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https).

1. Crea o inicia sesión en una cuenta de GitHub.
2. Crea un repositorio llamado `pilar-a-pilar`. Si deseas que el código sea público, recuerda que todos los archivos del repositorio quedarán visibles; no incluyas información personal ni datos guardados de tu navegador.
3. Sube el contenido de esta carpeta a la raíz del repositorio: `index.html`, `manifest.webmanifest`, `sw.js`, `css/`, `js/`, los iconos y el resto de los archivos.
4. En el repositorio abre **Settings → Pages**.
5. En **Build and deployment**, configura la publicación desde la rama principal (`main`) y la carpeta raíz (`/root`), si esa opción está disponible en el selector. Guarda la configuración.
6. Cuando termine la publicación, abre la URL que GitHub Pages muestre en esa página de configuración. Los sitios de proyecto suelen usar la forma `https://USUARIO.github.io/pilar-a-pilar/`.
7. En **Settings → Pages**, comprueba que HTTPS está disponible y activado. Visita la URL publicada en Chrome/Edge o en el navegador móvil.
8. Abre la web por lo menos una vez con conexión y espera a que termine la primera carga. Después prueba la instalación y vuelve a abrir la app sin conexión.

Las rutas de la aplicación son relativas (`./`) para que pueda vivir tanto en la raíz de un dominio como debajo de una ruta de proyecto. Si cambias el nombre del repositorio o publicas la app dentro de una subcarpeta distinta, revisa `scope`, `start_url` y la ruta de registro del service worker.

### Actualizar una versión ya publicada

1. Modifica los archivos localmente.
2. Incrementa la cadena `CACHE_NAME` en `sw.js` (por ejemplo, `v1.3.1`) para invalidar la caché del shell antiguo.
3. Sube los cambios al repositorio y espera a que se publique.
4. Abre la app online y recarga. El service worker nuevo instalará la caché actualizada; puede hacer falta cerrar y volver a abrir una ventana ya instalada para ver todos los cambios.

## Publicar en GitHub y Netlify

Esta versión incluye `netlify.toml` con la carpeta de publicación configurada en la raíz (`.`), porque `index.html`, `manifest.webmanifest`, `sw.js`, `css/` y `js/` están en la raíz y la aplicación no necesita compilarse.

1. Descomprime el ZIP y abre la carpeta interior `pilar-a-pilar`. No subas el ZIP ni la carpeta contenedora: el archivo `index.html` debe quedar en la raíz del repositorio GitHub.
2. En [GitHub](https://github.com/new), crea un repositorio llamado `pilar-a-pilar`. Puedes escoger público para compartir el código o privado si prefieres que solo los colaboradores autorizados lo vean. No hace falta inicializar otro README.
3. En el repositorio, usa **Add file → Upload files** y sube el contenido de la carpeta `pilar-a-pilar`, conservando las carpetas `css/`, `js/` y `tests/`. Confirma la carga con un mensaje como `Añadir primera versión de Pilar a Pilar`.
4. En [Netlify](https://app.netlify.com/), elige **Add new project → Import an existing project → GitHub** y autoriza el acceso al repositorio. Selecciona `pilar-a-pilar`.
5. Revisa los ajustes de despliegue. La base debe ser la raíz del repositorio; el comando de build queda vacío y el directorio de publicación es `.`. El archivo `netlify.toml` establece el directorio de publicación. No uses `dist` ni `build`.
6. Pulsa **Deploy** / **Publish**. Cuando Netlify termine, abre la URL `https://...netlify.app` que te asigne. Comprueba que la página, el manifiesto y `sw.js` cargan correctamente por HTTPS.
7. Para actualizar la web más adelante, sube y confirma los cambios en GitHub. Netlify iniciará un nuevo despliegue automáticamente.

Si la interfaz de Netlify muestra ajustes manuales, usa la raíz del repositorio como carpeta de publicación. Para otras formas de publicar, consulta la [guía oficial de Netlify para desplegar desde un repositorio](https://docs.netlify.com/start/quickstarts/deploy-from-repository/).

**Importante:** publicar el sitio en Netlify no copia el `localStorage` de `localhost` al dominio nuevo. Los datos existentes seguirán en el origen donde se crearon; la aplicación publicada comenzará con el almacenamiento local de ese dominio.

## Instalar en dispositivos

- **Chrome o Edge en escritorio/Android:** utiliza el botón **Instalar** de la página si aparece el diálogo, o el menú del navegador y la opción de instalar/añadir a la pantalla de inicio.
- **iPhone/iPad:** abre la web publicada en Safari, toca **Compartir** y elige **Añadir a pantalla de inicio**. Los navegadores de iOS no siempre muestran el mismo botón de instalación en la página.
- **Sin conexión:** carga primero la aplicación con internet para que el service worker guarde el shell. Después de eso, la interfaz se puede abrir desde la caché. Si alguna vez cambias de versión, vuelve a abrirla online para descargar los archivos nuevos.

La PWA no requiere que se publique en una tienda de aplicaciones. Una tienda sería un proceso adicional y opcional.

## Datos y privacidad

Los datos de la persona se almacenan en `localStorage`, en el navegador y perfil donde se utiliza la app. El service worker almacena los archivos de la aplicación, no los datos personales. La información de `localStorage` no se sincroniza entre dispositivos, no es una cuenta y no está protegida frente a otras personas que tengan acceso al mismo perfil del navegador. Borrar los datos del navegador puede eliminarlos de manera irreversible. No se envían a ningún backend.

## Reglas de puntuación

- La satisfacción personal se evalúa del 1 al 10 y solo cambia mediante reevaluación manual.
- Los puntos de cumplimiento se calculan por semana de forma independiente: una actividad completada de un plan de una actividad = 1 punto; dos actividades completadas de un plan de dos = 1 punto; dos de tres = 1 punto y tres de tres = 2 puntos. Si hay un plan de dos o tres actividades y solo se completa una, son 0 puntos.
- El tiempo estimado por actividad es opcional, representa el total previsto para esa actividad durante la semana y no modifica los puntos.

## Comprobaciones antes de anunciar la app públicamente

- Completar una evaluación inicial.
- Crear planes de una, dos y tres actividades; probar todos los resultados de puntos.
- Recargar y confirmar que los datos persisten.
- Crear una reevaluación y revisar que la anterior sigue en el historial.
- Probar modo sin conexión después de una carga online.
- Probar en una pantalla móvil y con teclado.
- Revisar el panel **Application → Manifest / Service Workers** en DevTools de Chrome y confirmar que no hay errores de recursos.
- Recordar que el alojamiento será público si el sitio se publica públicamente; no subir datos personales.

## Limitaciones conocidas

- El modo offline depende de haber descargado los archivos con una primera visita online correcta y de que el navegador no elimine la caché.
- No hay sincronización entre dispositivos, cuentas, notificaciones push, recordatorios programados, exportación ni restauración de datos.
- Deben realizarse pruebas manuales en los navegadores y dispositivos objetivo antes de considerar la PWA lista para un lanzamiento público.
