import React, { useState, useEffect } from 'react';

// Solicita permiso de notificaciones (ejemplo PDF)
const pedirPermisoNotificaciones = async () => {
  if ('Notification' in window) {
    const permiso = await Notification.requestPermission();
    return permiso === 'granted';
  }
  return false;
};

// Envía mensaje al service worker para mostrar notificación (ejemplo PDF)
const notificarPokemon = async (pokemon) => {
  if ('serviceWorker' in navigator && Notification.permission === 'granted') {
    const reg = await navigator.serviceWorker.getRegistration();
    if (reg && reg.active) {
      reg.active.postMessage({
        type: 'SHOW_POKEMON_NOTIFICATION',
        nombre: pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1),
        id: pokemon.id,
        tipos: pokemon.types?.map(t => t.type.name).join(', ') || 'Desconocido',
        icono: pokemon.sprites?.front_default || '/pokeball.jpg',
      });
    }
  }
};

import './App.css';
import PokemonStatsModal from './PokemonStatsModal';
import './PokemonStatsModal.css';


function App() {
  const [pokemons, setPokemons] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [permisoNotificaciones, setPermisoNotificaciones] = useState(Notification.permission === 'granted');

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
      // Notificar solo si el usuario aceptó
      if (permisoNotificaciones) {
        notificarPokemon(data);
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
      {!permisoNotificaciones && (
        <button
          onClick={async () => {
            const granted = await pedirPermisoNotificaciones();
            setPermisoNotificaciones(granted);
          }}
          style={{ marginBottom: 16 }}
        >
          Permitir notificaciones
        </button>
      )}
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