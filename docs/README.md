# Personalized AI Fashion Recommendation

A professional Flask-based web application that uses Artificial Intelligence to detect faces and recommend personalized clothing styles based on gender detection and skin tone classification.

## 🎯 Features

- 📸 **Face Detection** - Real-time face detection using OpenCV DNN
- 🧬 **Gender & Skin Tone Analysis** - AI-powered predictions
- 👔 **Smart Clothing Recommendations** - Personalized style suggestions
- 📱 **Multi-input Support** - Upload images or capture from camera
- 📊 **JSON Export** - Download recommendations as JSON
- 🎨 **Responsive Design** - Works on desktop, tablet, and mobile
- ⚡ **Real-time Processing** - Quick and efficient analysis

## 📁 Project Structure

```
personalised_fashion_recomendation/
├── src/
│   ├── app.py                 # Main Flask application
│   ├── config.py              # Configuration settings
│   ├── utils/                 # Utility modules
│   │   ├── __init__.py
│   │   ├── model_loader.py    # Model loading utilities
│   │   └── image_processor.py # Image processing utilities
│   ├── templates/             # HTML templates
│   │   └── index.html
│   └── static/                # CSS, JS, and models
│       ├── css/
│       │   └── styles.css
│       ├── js/
│       │   └── app.js
│       ├── images/            # Background images
│       └── models/            # ML models
├── data/                      # Data files
│   └── clothing_styles.json
├── docs/                      # Documentation
├── requirements.txt           # Python dependencies
├── run.py                     # Application entry point
├── .gitignore
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- pip (Python package manager)

### Installation

1. **Clone or download the project**
```bash
cd personalised_fashion_recomendation
```

2. **Create virtual environment**
```bash
python -m venv venv
```

3. **Activate virtual environment**

On Windows:
```bash
venv\Scripts\activate
```

On macOS/Linux:
```bash
source venv/bin/activate
```

4. **Install dependencies**
```bash
pip install -r requirements.txt
```

### Running the Application

```bash
python run.py
```

The application will start at `http://127.0.0.1:5000`

## 🎮 How to Use

1. **Open the web interface** in your browser
2. **Choose an option:**
   - 📤 Upload an image from your device
   - 📷 Use your camera to capture a photo
3. **View Results:**
   - Detected face image with highlighted region
   - Gender prediction (Male/Female)
   - Skin tone classification
   - Recommended clothing styles
4. **Download Results** - Export recommendations as JSON file

## 🛠️ Technologies Used

- **Backend**: Flask (Python web framework)
- **Computer Vision**: OpenCV, TensorFlow/Keras
- **Frontend**: HTML5, CSS3, JavaScript
- **ML Models**: 
  - Gender Prediction: Custom Keras model
  - Face Detection: OpenCV DNN (Caffe)
- **Deployment**: WSGI compatible

## 📊 Model Information

### Face Detection
- **Type**: OpenCV DNN (Caffe)
- **Input Size**: 300x300 pixels
- **Output**: Face bounding boxes with confidence scores
- **Confidence Threshold**: 0.6 (configurable)

### Gender Prediction
- **Type**: TensorFlow/Keras Neural Network
- **Input Size**: 128x128 pixels
- **Output**: Gender probability (Male/Female)
- **Threshold**: 0.4 (configurable)

### Skin Tone Classification
- **Method**: RGB to HSV conversion with hue-based classification
- **Categories**: 17 different skin tone classifications
- **Undertone**: Cool or Warm determination

## 🔧 Configuration

Edit `src/config.py` to customize:
- Model directories
- Detection confidence thresholds
- Upload file size limits
- Flask port and host settings

## 📝 API Endpoints

### GET `/`
Renders the main application interface

### POST `/detect_face`
Processes uploaded/captured image and returns:
- Detected face image (base64)
- Gender prediction
- Skin tone classification
- Recommended clothing styles

### POST `/get_clothing_styles`
Returns clothing recommendations for specific gender and skin tone

### GET `/generate_clothing_styles_json`
Downloads recommendations as JSON file

## 🎨 Customization

### Adding New Clothing Styles
Edit `data/clothing_styles.json` to add/modify clothing recommendations

### Styling the UI
Modify `src/static/css/styles.css` for custom appearance

### Enhancing Functionality
Add new routes in `src/app.py` or utilities in `src/utils/`

## ⚠️ Limitations

- Single face detection per image
- Models work best with clear, front-facing faces
- Performance depends on image quality and lighting
- GPU acceleration recommended for faster processing

## 🐛 Troubleshooting

### Models Not Loading
- Check that model files are in `src/static/models/`
- Verify file names match exactly
- Ensure sufficient disk space

### Camera Not Working
- Allow browser permission for camera access
- Check camera device availability
- Try a different browser

### Slow Performance
- Ensure adequate system RAM
- Reduce image resolution
- Consider using GPU (requires CUDA)

## 📜 License

This project is provided as-is for educational and commercial use.

## 👨‍💻 Authors

Created as an AI Fashion Recommendation System

## 📞 Support

For issues or questions, refer to the documentation or check the code comments for detailed explanations.

---

**Happy Fashion Recommending! 🎉**
