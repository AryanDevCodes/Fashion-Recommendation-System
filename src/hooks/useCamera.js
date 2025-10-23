import { useState, useCallback } from 'react';

export function useCamera() {
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);

  const startCamera = useCallback(async (videoRef) => {
    try {
      setError(null);
      console.log('🎤 Requesting camera access...');
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      
      console.log('✅ Camera access granted, setting stream...');
      
      if (videoRef.current) {
        console.log('📹 Video ref exists, assigning stream...');
        
        // Directly assign the stream
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        
        console.log('🎬 Stream assigned to video element');
        console.log('📊 Stream tracks:', mediaStream.getTracks().length);
        console.log('✓ Camera stream started successfully');
        
        return true;
      } else {
        console.error('❌ Video ref is null!');
        mediaStream.getTracks().forEach(track => track.stop());
        return false;
      }
    } catch (err) {
      console.error('❌ Camera error:', err);
      console.error('📋 Error details:', {
        name: err.name,
        message: err.message,
        stack: err.stack
      });
      
      setError(
        err.name === 'NotAllowedError'
          ? 'Camera access denied. Please allow camera access in your browser settings.'
          : err.name === 'NotFoundError'
          ? 'No camera device found. Please connect a camera.'
          : 'Error accessing camera: ' + err.message
      );
      return false;
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      console.log('🛑 Stopping camera...');
      stream.getTracks().forEach((track) => {
        console.log('Stopping track:', track.label, track.kind);
        track.stop();
      });
      setStream(null);
      console.log('✓ Camera stopped');
    }
  }, [stream]);

  return { stream, error, startCamera, stopCamera };
}
