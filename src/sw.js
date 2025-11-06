// Importa las funciones de Workbox para el precaching
import { precacheAndRoute } from 'workbox-precaching';

// Precaching: inyectado por vite-plugin-pwa
precacheAndRoute(self.__WB_MANIFEST);

// Listener para recibir mensajes desde la aplicación React
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
        const { pokemonName, iconUrl } = event.data;
        self.registration.showNotification('¡Pokédex actualizada!', {
            body: `¡Has consultado a ${pokemonName}! ¡Atrápalos ya!`, // [cite: 37]
            icon: iconUrl || '/pokeball.jpg', // [cite: 38]
            vibrate: [200, 100, 200], // [cite: 39]
            tag: 'poke-notify-' + pokemonName // [cite: 40]
        });
    }
});

// Opcional: Listener para manejar clics en la notificación
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
});