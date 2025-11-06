import React, { useState, useEffect } from 'react';
// Utilidad para enviar mensaje al service worker
function sendNotificationToSW({ title, body, icon }) {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'SHOW_POKEMON_NOTIFICATION',
      title,
      body,
      icon,
    });
  }
}
import './App.css';
import PokemonStatsModal from './PokemonStatsModal';
import './PokemonStatsModal.css';



function App() {
  const [pokemons, setPokemons] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [notifPermission, setNotifPermission] = useState(() => (typeof Notification !== 'undefined' ? Notification.permission : 'default'));

  useEffect(() => {
    fetch('https://pokeapi.co/api/v2/pokemon?limit=20')
      .then(response => response.json())
      .then(data => setPokemons(data.results));
  }, []);

  const filtered = pokemons.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  // Pedir permiso de notificaciones
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      setNotifPermission(perm);
    }
  };

  // Manejar click en la imagen para mostrar modal
  const handleCardClick = async (poke, pokeId) => {
    setSelectedPokemon(pokeId);
    setModalData(null);
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokeId}`);
      const data = await res.json();
      setModalData(data);
      // Enviar notificación al SW si el permiso está concedido
      if (notifPermission === 'granted') {
        sendNotificationToSW({
          title: `¡Pokémon consultado!`,
          body: `Has consultado a ${data.name.charAt(0).toUpperCase() + data.name.slice(1)} (#${pokeId})`,
          icon: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokeId}.png`,
        });
      }
    } catch {
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
      <button onClick={requestNotificationPermission} disabled={notifPermission === 'granted'} style={{marginBottom: 12}}>
        {notifPermission === 'granted' ? 'Notificaciones activadas' : 'Activar notificaciones'}
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
          // Extraer el ID del Pokémon desde la URL
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