import React, { useState, useCallback } from 'react';
import './App.css';
import ImageUpload from './components/ImageUpload';
import CameraCapture from './components/CameraCapture';
import ResultsDisplay from './components/ResultsDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import { useImageProcessor } from './hooks/useImageProcessor';

function App() {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'camera'
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const { processImage, loading } = useImageProcessor();

  const handleImageSelect = useCallback(async (imageData) => {
    setError(null);
    try {
      const result = await processImage(imageData);
      if (result.error) {
        setError(result.error);
      } else {
        setResults(result);
      }
    } catch (err) {
      setError(err.message || 'An error occurred while processing the image');
    }
  }, [processImage]);

  const handleClearResults = useCallback(() => {
    setResults(null);
    setError(null);
  }, []);

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <h1>🎨 Personalized AI Fashion Recommendation</h1>
        <p>Get clothing recommendations based on your skin tone and gender</p>
      </header>

      {/* Main Content */}
      <main className="app-main">
        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button
            className={`tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            📤 Upload Image
          </button>
          <button
            className={`tab-btn ${activeTab === 'camera' ? 'active' : ''}`}
            onClick={() => setActiveTab('camera')}
          >
            📷 Use Camera
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'upload' && (
            <ImageUpload onImageSelect={handleImageSelect} disabled={loading} />
          )}
          {activeTab === 'camera' && (
            <CameraCapture onImageCapture={handleImageSelect} disabled={loading} />
          )}
        </div>

        {/* Loading Indicator */}
        {loading && <LoadingSpinner />}

        {/* Error Message */}
        {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

        {/* Results Display */}
        {results && (
          <ResultsDisplay 
            results={results} 
            onClear={handleClearResults}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>&copy; 2025 Fashion Recommendation AI. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
