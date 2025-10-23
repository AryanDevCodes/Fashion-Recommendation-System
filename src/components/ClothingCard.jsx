import React from 'react';
import './ClothingCard.css';

function ClothingCard({ style }) {
  return (
    <div className="clothing-card">
      {style['img-url'] && (
        <img
          src={style['img-url']}
          alt={style.item || 'Clothing'}
          className="clothing-image"
          onError={(e) => (e.target.style.display = 'none')}
        />
      )}
      <div className="card-content">
        <p>
          <strong>👕 Item:</strong> {style.item || 'N/A'}
        </p>
        <p>
          <strong>🧵 Fabric:</strong> {style.fabric || 'N/A'}
        </p>
        <p>
          <strong>🎨 Color:</strong> {style.color || 'N/A'}
        </p>
        <p>
          <strong>🌍 Style:</strong> {style.traditional_aspect || 'N/A'}
        </p>
      </div>
    </div>
  );
}

export default ClothingCard;
