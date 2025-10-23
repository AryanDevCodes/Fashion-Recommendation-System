import { useState, useCallback } from 'react';
import { detectFace } from '../services/api';

export function useImageProcessor() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const processImage = useCallback(async (imageData) => {
    setLoading(true);
    setError(null);

    try {
      const result = await detectFace(imageData);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { processImage, loading, error };
}
