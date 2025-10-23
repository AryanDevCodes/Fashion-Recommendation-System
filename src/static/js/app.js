// DOM Elements
const fileInput = document.getElementById('file-input');
const uploadButton = document.getElementById('upload-btn');
const startCameraButton = document.getElementById('start-camera-btn');
const captureButton = document.getElementById('capture-btn');
const uploadCapturedButton = document.getElementById('upload-captured-btn');
const cameraButtons = document.getElementById('camera-buttons');
const resultSection = document.getElementById('result-section');
const detectedFaceImage = document.getElementById('detected-face-image');
const genderElement = document.getElementById('gender');
const skinToneElement = document.getElementById('skin-tone');
const clothingStylesElement = document.getElementById('clothing-styles');
const errorMessage = document.getElementById('error-message');
const imagePreview = document.getElementById('image-preview');
const uploadSection = document.getElementById('upload-section');
const resultSectionContainer = document.getElementById('result-section-container');
const liveVideo = document.getElementById('live-video');
const backButton = document.getElementById('back-btn');
const downloadJsonButton = document.getElementById('downloadJsonButton');
const clearResultsButton = document.getElementById('clear-results-btn');
const loadingSpinner = document.getElementById('loadingSpinner');
const loadingOverlay = document.getElementById('loadingOverlay');

let capturedImageData = null;
let isProcessing = false;

/**
 * Show loading indicator
 */
function showLoading() {
  loadingSpinner.classList.add('active');
  loadingOverlay.classList.add('active');
  isProcessing = true;
  uploadButton.disabled = true;
  startCameraButton.disabled = true;
  downloadJsonButton.disabled = true;
}

/**
 * Hide loading indicator
 */
function hideLoading() {
  loadingSpinner.classList.remove('active');
  loadingOverlay.classList.remove('active');
  isProcessing = false;
  uploadButton.disabled = false;
  startCameraButton.disabled = false;
  downloadJsonButton.disabled = false;
}

/**
 * Validate file size and type
 * @param {File} file - The file to validate
 * @returns {boolean} - True if valid, false otherwise
 */
function validateFile(file) {
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    showError('File size exceeds 5MB. Please upload a smaller image.');
    return false;
  }
  if (!file.type.startsWith('image/')) {
    showError('Please upload a valid image file.');
    return false;
  }
  return true;
}

/**
 * Show error message
 * @param {string} message - The error message to display
 */
function showError(message) {
  errorMessage.textContent = message;
  errorMessage.style.display = 'block';
  resultSectionContainer.style.display = 'block';
  resultSectionContainer.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Clear all results
 */
function clearResults() {
  resultSectionContainer.style.display = 'none';
  clothingStylesElement.innerHTML = '';
  errorMessage.textContent = '';
  errorMessage.style.display = 'none';
  imagePreview.style.display = 'none';
  detectedFaceImage.style.display = 'none';
  fileInput.value = '';
}

/**
 * Stop camera stream
 */
function stopCameraStream() {
  const stream = liveVideo.srcObject;
  if (stream) {
    const tracks = stream.getTracks();
    tracks.forEach(track => track.stop());
    liveVideo.srcObject = null;
  }
}

/**
 * Reset UI to initial state
 */
function resetUI() {
  imagePreview.style.display = 'none';
  liveVideo.style.display = 'none';
  backButton.style.display = 'none';
  cameraButtons.style.display = 'none';
  fileInput.value = '';
  stopCameraStream();
}

// Event Listeners

/**
 * Clear results button
 */
clearResultsButton.addEventListener('click', clearResults);

/**
 * Upload button - trigger file input
 */
uploadButton.addEventListener('click', () => {
  fileInput.click();
});

/**
 * File input change - handle file selection
 */
fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (!file) return;

  if (!validateFile(file)) {
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const imageData = reader.result;
    imagePreview.src = imageData;
    imagePreview.style.display = 'block';
    liveVideo.style.display = 'none';
    backButton.style.display = 'block';
    sendImageToServer(imageData);
  };
  reader.readAsDataURL(file);
});

/**
 * Start camera button
 */
startCameraButton.addEventListener('click', () => {
  navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
    .then(stream => {
      liveVideo.srcObject = stream;
      liveVideo.style.display = 'block';
      imagePreview.style.display = 'none';
      backButton.style.display = 'block';
      cameraButtons.style.display = 'block';
    })
    .catch(error => {
      showError(`Camera access denied: ${error.message}`);
    });
});

/**
 * Capture image from live video
 */
captureButton.addEventListener('click', () => {
  const canvas = document.createElement('canvas');
  canvas.width = liveVideo.videoWidth;
  canvas.height = liveVideo.videoHeight;
  const context = canvas.getContext('2d');
  context.drawImage(liveVideo, 0, 0, canvas.width, canvas.height);
  capturedImageData = canvas.toDataURL('image/jpeg');
  imagePreview.src = capturedImageData;
  imagePreview.style.display = 'block';
  liveVideo.style.display = 'none';
  backButton.style.display = 'block';
});

/**
 * Upload captured image
 */
uploadCapturedButton.addEventListener('click', () => {
  if (capturedImageData) {
    sendImageToServer(capturedImageData);
  } else {
    showError('No image captured. Please capture an image first.');
  }
});

/**
 * Back button - reset UI
 */
backButton.addEventListener('click', resetUI);

/**
 * Send image to server for processing
 * @param {string} imageData - Base64 encoded image data
 */
function sendImageToServer(imageData) {
  showLoading();
  fetch('/detect_face', {
    method: 'POST',
    body: new URLSearchParams({ 'image': imageData })
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      hideLoading();
      updateUI(data);
    })
    .catch(err => {
      hideLoading();
      showError(`Error: ${err.message}. Please try again.`);
    });
}

/**
 * Download clothing styles as JSON
 */
downloadJsonButton.addEventListener('click', function () {
  showLoading();
  fetch('/generate_clothing_styles_json')
    .then(response => {
      if (response.ok) {
        return response.blob();
      }
      throw new Error('Failed to fetch JSON');
    })
    .then(blob => {
      hideLoading();
      const url = window.URL.createObjectURL(blob);
      const filename = `clothing_styles_${Date.now()}.json`;
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    })
    .catch(error => {
      hideLoading();
      showError(`Download failed: ${error.message}`);
    });
});

/**
 * Update UI with results
 * @param {Object} data - Response data from server
 */
function updateUI(data) {
  if (data.error) {
    showError(data.error);
    return;
  }

  if (!data.clothing_styles || !Array.isArray(data.clothing_styles)) {
    showError('Unable to retrieve clothing styles. Please try again.');
    return;
  }

  errorMessage.textContent = '';
  errorMessage.style.display = 'none';
  resultSectionContainer.style.display = 'block';
  detectedFaceImage.src = `data:image/jpeg;base64,${data.detected_face_image}`;
  detectedFaceImage.style.display = 'block';

  genderElement.textContent = data.gender || 'Unknown';
  skinToneElement.textContent = data.skin_tone || 'Unknown';

  clothingStylesElement.innerHTML = '';
  data.clothing_styles.forEach((style, index) => {
    const card = document.createElement('div');
    card.className = 'clothing-card';

    card.innerHTML = `
      <div class="card-content">
        <img src="${style['img-url'] || ''}" alt="${style.item || 'Clothing'}" onerror="this.style.display='none'">
        <p><strong>Item:</strong> ${style.item || 'N/A'} <i class="fas fa-tshirt icon"></i></p>
        <p><strong>Fabric:</strong> ${style.fabric || 'N/A'} <i class="fas fa-fabric icon"></i></p>
        <p><strong>Color:</strong> ${style.color || 'N/A'} <i class="fas fa-palette icon"></i></p>
        <p><strong>Traditional Aspect:</strong> ${style.traditional_aspect || 'N/A'} <i class="fas fa-globe icon"></i></p>
      </div>
    `;

    clothingStylesElement.appendChild(card);
  });

  resultSectionContainer.scrollIntoView({ behavior: 'smooth' });
}
