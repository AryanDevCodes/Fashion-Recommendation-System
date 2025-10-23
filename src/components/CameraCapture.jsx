import React, { useRef, useState, useEffect, useCallback } from 'react';
import { FiCamera, FiCheck } from 'react-icons/fi';
import { useCamera } from '../hooks/useCamera';
import './CameraCapture.css';

function CameraCapture({ onImageCapture, disabled }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const { error, startCamera, stopCamera } = useCamera();
  const [captured, setCaptured] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);

  const startCameraAfterRender = useCallback(async () => {
    try {
      console.log('🎥 Starting camera with video ref ready...');
      const success = await startCamera(videoRef);
      console.log('✅ Camera started:', success);
      
      if (!success) {
        console.error('❌ Camera failed to start');
      }
    } catch (err) {
      console.error('❌ Error starting camera:', err);
    }
  }, [startCamera, videoRef]);

  // Start camera when video element is ready
  useEffect(() => {
    if (showCamera && videoRef.current) {
      console.log('📹 Video element is now in DOM, starting camera...');
      startCameraAfterRender();
    }
  }, [showCamera, startCameraAfterRender]);

  // Step 1: Show camera feed section first (so video element is rendered)
  const handleStartCamera = async () => {
    try {
      setCameraLoading(true);
      console.log('🎥 Opening camera feed section...');
      setShowCamera(true); // This renders the video element
      // The useEffect above will handle starting the camera
      setCameraLoading(false);
    } catch (err) {
      console.error('❌ Error opening camera:', err);
      setCameraLoading(false);
    }
  };

  const handleStopCamera = () => {
    stopCamera();
    setShowCamera(false);
    setCaptured(null);
  };

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) {
      console.error('Video or canvas ref is null');
      return;
    }

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      // Wait for video to have data
      if (video.videoWidth && video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw image with proper scaling
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageData = canvas.toDataURL('image/jpeg', 0.95);
        setCaptured(imageData);
        console.log('Image captured successfully');
      } else {
        console.error('Video not ready yet');
        alert('Please wait for video to load');
      }
    } catch (error) {
      console.error('Error capturing image:', error);
      alert('Failed to capture image');
    }
  };

  const handleUploadCapture = () => {
    if (captured) {
      onImageCapture(captured);
      handleStopCamera();
    }
  };

  return (
    <div className="camera-capture-container">
      {error && <div className="error-message">{error}</div>}

      {/* Start Camera Button */}
      {!showCamera && (
        <button
          className="start-camera-btn"
          onClick={handleStartCamera}
          disabled={disabled || cameraLoading}
        >
          <FiCamera /> {cameraLoading ? 'Starting Camera...' : 'Start Camera'}
        </button>
      )}

      {/* Camera Feed Section - Opens Below Button */}
      {showCamera && (
        <div className="camera-feed-section">
          <div className="camera-feed-header">
            <h3>📹 Camera Feed</h3>
            <button
              className="close-camera-btn"
              onClick={handleStopCamera}
              title="Close camera"
            >
              ✕
            </button>
          </div>

          <div className="video-container">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              controls={false}
              className="video-stream"
              onLoadedMetadata={() => {
                console.log('Video metadata loaded');
                if (videoRef.current) {
                  console.log('Video dimensions:', videoRef.current.videoWidth, 'x', videoRef.current.videoHeight);
                }
              }}
              onPlay={() => console.log('Video is playing')}
              onError={(e) => console.error('Video error:', e)}
            />
          </div>

          {!captured && (
            <div className="camera-controls">
              <button
                className="capture-btn"
                onClick={handleCapture}
                disabled={disabled}
              >
                <FiCamera /> Capture Photo
              </button>
              <button
                className="stop-btn"
                onClick={handleStopCamera}
                disabled={disabled}
              >
                ✕ Close Camera
              </button>
            </div>
          )}

          {captured && (
            <div className="captured-preview">
              <h4>✓ Photo Captured</h4>
              <img src={captured} alt="Captured" className="captured-image" />
              <div className="capture-actions">
                <button
                  className="upload-capture-btn"
                  onClick={handleUploadCapture}
                  disabled={disabled}
                >
                  <FiCheck /> Upload & Analyze
                </button>
                <button
                  className="retake-btn"
                  onClick={() => setCaptured(null)}
                  disabled={disabled}
                >
                  📸 Retake Photo
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}

export default CameraCapture;
