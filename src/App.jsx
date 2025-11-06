import React, { useState, useEffect } from 'react';
import './App.css';
import PokemonStatsModal from './PokemonStatsModal';
import './PokemonStatsModal.css';

// 1. Función para solicitar permiso de notificaciones 
const solicitarPermisoNotificaciones = () => {
  if ("Notification" in window) {
    Notification.requestPermission().then(resultado => {
      console.log("Permiso de notificación:", resultado); // [cite: 22]
    });
  }
};

// 2. Función para enviar notificación al Service Worker [cite: 9, 43]
const enviarNotificacion = async (name, pokeId) => {
  if ("serviceWorker" in navigator && Notification.permission === "granted") {
    try {
      const registration = await navigator.serviceWorker.ready; // [cite: 46]

      // Mensaje que se envía al Service Worker
      registration.active.postMessage({
        type: "SHOW_NOTIFICATION", // [cite: 48]
        pokemonName: name.charAt(0).toUpperCase() + name.slice(1),
        iconUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokeId}.png`
      });

      console.log(`Mensaje de notificación enviado para ${name}`);
    } catch (error) {
      console.error("Error al enviar el mensaje al Service Worker:", error);
    }
  }
};


function App() {
  const [pokemons, setPokemons] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [modalData, setModalData] = useState(null);

  useEffect(() => {
    fetch('https://pokeapi.co/api/v2/pokemon?limit=20')
      .then(response => response.json())
      .then(data => setPokemons(data.results));
  }, []);

  const filtered = pokemons.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  // Manejar click en la imagen para mostrar modal
  const handleCardClick = async (poke, pokeId) => {
    setSelectedPokemon(pokeId);
    setModalData(null);
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokeId}`);
      const data = await res.json();
      setModalData(data);

      // Llamar a la función de notificación [cite: 8]
      enviarNotificacion(poke.name, pokeId);
    } catch (e) {
      console.error(e);
      setModalData(null);
    }
  };

  const handleCloseModal = () => {
    setSelectedPokemon(null);
    setModalData(null);
  };

  return (
    <div className="App">
      <h1>Pokédex</h1>

      {/* 3. Botón para activar notificaciones [cite: 25] */}
      <button
        onClick={solicitarPermisoNotificaciones}
        className="notification-button"
      >
        Activar Notificaciones
      </button>

      <input
        type="text"
        placeholder="Buscar Pokémon..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="search-bar"
      />
      <div className="card-grid">
        {filtered.map((p, index) => {
          const idMatch = p.url.match(/\/pokemon\/(\d+)\//);
          const pokeId = idMatch ? idMatch[1] : index + 1;
          return (
            <div className="poke-card" key={pokeId}>
              <div className="poke-img-wrapper" onClick={() => handleCardClick(p, pokeId)} style={{ cursor: 'pointer' }}>
                <img
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokeId}.png`}
                  alt={p.name}
                  className="poke-img"
                />
              </div>
              <div className="poke-info">
                <span className="poke-name">{p.name.charAt(0).toUpperCase() + p.name.slice(1)}</span>
                <span className="poke-id">#{pokeId}</span>
              </div>
            </div>
          );
        })}
      </div>
      {selectedPokemon && modalData && (
        <PokemonStatsModal pokemon={modalData} onClose={handleCloseModal} />
      )}
    </div>
  );
}

export default App;