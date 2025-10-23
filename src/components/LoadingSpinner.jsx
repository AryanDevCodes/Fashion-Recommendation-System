import React from 'react';
import './LoadingSpinner.css';

function LoadingSpinner() {
  return (
    <div className="loading-overlay">
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Processing image...</p>
      </div>
    </div>
  );
}

export default LoadingSpinner;
