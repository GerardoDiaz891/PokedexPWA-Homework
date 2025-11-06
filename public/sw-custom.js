// Este archivo extiende el service worker generado por vite-plugin-pwa
// para escuchar mensajes y mostrar notificaciones personalizadas.

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_POKEMON_NOTIFICATION') {
    const { title, body, icon } = event.data;
    self.registration.showNotification(title, {
      body,
      icon,
      vibrate: [200, 100, 200],
    });
  }
});
