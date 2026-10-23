const INSTALL_BUTTON_ID = 'install-app-button';
let deferredInstallPrompt = null;

function isRunningStandalone() {
  return window.matchMedia?.('(display-mode: standalone)').matches === true || navigator.standalone === true;
}

function tellUser(onMessage, message, isError = false) {
  if (typeof onMessage === 'function') onMessage(message, isError);
}

function getInstallInstructions() {
  const userAgent = navigator.userAgent || '';
  const isIOS = /iPhone|iPad|iPod/i.test(userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (isIOS) {
    return 'Para instalar Pilar a Pilar en iPhone o iPad: abre esta web en Safari, toca Compartir y elige «Añadir a pantalla de inicio». La opción no aparece cuando se abre desde algunos navegadores integrados en otras apps.';
  }
  if (/Android/i.test(userAgent)) {
    return 'Para instalar Pilar a Pilar en Android, abre el menú del navegador (⋮) y selecciona «Instalar aplicación» o «Añadir a pantalla de inicio», según el navegador.';
  }
  return 'Para instalar Pilar a Pilar, usa el menú de Chrome o Edge y elige «Instalar Pilar a Pilar», o utiliza el icono de instalación que puede aparecer en la barra de direcciones.';
}

export function initPwa({ onMessage } = {}) {
  const installButton = document.getElementById(INSTALL_BUTTON_ID);
  const standaloneQuery = window.matchMedia?.('(display-mode: standalone)');

  const refreshInstallButton = () => {
    if (installButton) installButton.hidden = isRunningStandalone();
  };

  refreshInstallButton();
  standaloneQuery?.addEventListener?.('change', refreshInstallButton);

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    refreshInstallButton();
    if (installButton) installButton.dataset.installReady = 'true';
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    refreshInstallButton();
    tellUser(onMessage, 'Pilar a Pilar se instaló correctamente. ¡Ya puedes abrirla desde tu dispositivo!');
  });

  installButton?.addEventListener('click', async () => {
    if (isRunningStandalone()) {
      refreshInstallButton();
      return;
    }
    if (!deferredInstallPrompt) {
      tellUser(onMessage, getInstallInstructions());
      return;
    }

    try {
      const promptEvent = deferredInstallPrompt;
      deferredInstallPrompt = null;
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      if (choice?.outcome === 'accepted') {
        tellUser(onMessage, 'Has aceptado la instalación. El navegador terminará el proceso.');
      } else {
        tellUser(onMessage, 'No hay problema. Puedes instalar Pilar a Pilar más adelante desde el navegador.');
      }
    } catch (error) {
      console.error('No se pudo mostrar el diálogo de instalación de la PWA:', error);
      tellUser(onMessage, getInstallInstructions());
    }
  });

  if ('serviceWorker' in navigator && window.isSecureContext && ['https:', 'http:'].includes(location.protocol)) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js', { scope: './' })
        .then(() => navigator.serviceWorker.ready)
        .catch((error) => {
          console.error('No se pudo registrar el service worker:', error);
          tellUser(onMessage, 'La aplicación funciona, pero no se pudo activar el modo sin conexión en este momento.', true);
        });
    }, { once: true });
  }
}
