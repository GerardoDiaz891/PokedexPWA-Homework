import React, {useState, useEffect} from 'react';
import './App.css';
import PokemonStatsModal from './PokemonStatsModal';
import './PokemonStatsModal.css';


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

  // Solicitar permiso de notificaciones si no se ha hecho
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'default') {
      try {
        const perm = await Notification.requestPermission();
        return perm === 'granted';
      } catch {
        return false;
      }
    }
    return Notification.permission === 'granted';
  };

  // Manejar click en la imagen para mostrar modal y pedir permiso de notificaciones
  const handleCardClick = async (poke, pokeId) => {
    // Solicitar permiso de notificaciones si es necesario
    const hasPermission = await requestNotificationPermission();
    setSelectedPokemon(pokeId);
    setModalData(null);
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokeId}`);
      const data = await res.json();
      setModalData(data);
      // Mostrar notificación push si se tiene permiso
      if (hasPermission && 'Notification' in window) {
        const title = `¡Has seleccionado a ${data.name.charAt(0).toUpperCase() + data.name.slice(1)}!`;
        const options = {
          body: `Tipo: ${data.types.map(t => t.type.name).join(', ')}\nID: #${data.id}`,
          icon: data.sprites?.front_default || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokeId}.png`,
          image: data.sprites?.other?.['official-artwork']?.front_default || undefined
        };
        try {
          new Notification(title, options);
        } catch {
          // Ignorar error de notificación
        }
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
          const pokeId = idMatch ? idMatch[1] : index+1;
          return (
            <div className="poke-card" key={pokeId}>
              <div className="poke-img-wrapper" onClick={() => handleCardClick(p, pokeId)} style={{cursor:'pointer'}}>
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