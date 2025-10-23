import React from 'react';
import './PokemonStatsModal.css';

function PokemonStatsModal({ pokemon, onClose }) {
  if (!pokemon) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        <img
          src={pokemon.sprites?.front_default}
          alt={pokemon.name}
          className="modal-img"
        />
        <h2>{pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h2>
        <div className="modal-stats">
          {pokemon.stats.map(stat => (
            <div key={stat.stat.name} className="stat-row">
              <span className="stat-name">{stat.stat.name.toUpperCase()}</span>
              <span className="stat-value">{stat.base_stat}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PokemonStatsModal;
