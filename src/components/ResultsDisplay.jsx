import React from 'react';
import { FiDownload, FiX } from 'react-icons/fi';
import ClothingCard from './ClothingCard';
import './ResultsDisplay.css';

function ResultsDisplay({ results, onClear }) {
  const handleDownload = async () => {
    try {
      const response = await fetch('/generate_clothing_styles_json');
      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `clothing_styles_${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Failed to download: ' + error.message);
    }
  };

  return (
    <div className="results-container">
      <div className="results-header">
        <h2>✨ Results</h2>
        <button className="clear-btn" onClick={onClear}>
          <FiX /> Clear
        </button>
      </div>

      {/* Detected Face */}
      {results.detected_face_image && (
        <div className="detected-face-section">
          <img
            src={`data:image/jpeg;base64,${results.detected_face_image}`}
            alt="Detected Face"
            className="detected-face"
          />
        </div>
      )}

      {/* Gender and Skin Tone */}
      <div className="attributes-section">
        <div className="attribute-item">
          <span className="attribute-label">👥 Gender:</span>
          <span className="attribute-value">{results.gender || 'Unknown'}</span>
        </div>
        <div className="attribute-item">
          <span className="attribute-label">🎨 Skin Tone:</span>
          <span className="attribute-value">{results.skin_tone || 'Unknown'}</span>
        </div>
      </div>

      {/* Recommended Clothing */}
      <div className="clothing-section">
        <h3>👔 Recommended Clothing Styles</h3>

        {results.clothing_styles && results.clothing_styles.length > 0 ? (
          <div className="clothing-grid">
            {results.clothing_styles.map((style, index) => (
              <ClothingCard key={index} style={style} />
            ))}
          </div>
        ) : (
          <p className="no-styles">No clothing styles available</p>
        )}
      </div>

      {/* Download Button */}
      <div className="download-section">
        <button className="download-btn" onClick={handleDownload}>
          <FiDownload /> Download as JSON
        </button>
      </div>
    </div>
  );
}

export default ResultsDisplay;
