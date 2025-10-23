import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
});

/**
 * Send image to Flask backend for face detection and processing
 * @param {string} imageData - Base64 encoded image data
 * @returns {Promise<Object>} - Detection results
 */
export async function detectFace(imageData) {
  try {
    const formData = new FormData();
    formData.append('image', imageData);

    const response = await apiClient.post('/detect_face', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (response.data.error) {
      throw new Error(response.data.error);
    }

    return response.data;
  } catch (error) {
    console.error('Error detecting face:', error);
    throw new Error(
      error.response?.data?.error || 'Failed to process image. Please try again.'
    );
  }
}

/**
 * Download clothing styles as JSON
 * @returns {Promise<Blob>} - JSON blob
 */
export async function downloadClothingStyles() {
  try {
    const response = await apiClient.get('/generate_clothing_styles_json', {
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    console.error('Error downloading clothing styles:', error);
    throw new Error('Failed to download clothing styles');
  }
}

export default apiClient;
