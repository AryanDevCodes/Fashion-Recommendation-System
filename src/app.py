from io import BytesIO
from flask import Flask, jsonify, request, render_template, send_file, session
from flask_cors import CORS
import cv2
import numpy as np
import json
import base64
from PIL import Image
from tensorflow.keras.preprocessing.image import img_to_array # type: ignore
import os
import requests
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import tensorflow as tf

# Get the directory where the script is located
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

# Create Flask app - No static or template folder for React
app = Flask(__name__)
CORS(app)
app.secret_key = 'your_secret_key'  # Set a secret key for session management

def encode_image(frame):
    _, buffer = cv2.imencode('.jpg', frame)
    return base64.b64encode(buffer).decode('utf-8')

# Load clothing styles from JSON file
def load_clothing_styles():
    try:
        # Try data folder first (organized structure)
        clothing_styles_path = os.path.join(SCRIPT_DIR, '..', 'data', 'clothing_styles.json')
        if os.path.exists(clothing_styles_path):
            with open(clothing_styles_path, 'r') as file:
                return json.load(file)
        else:
            # Fallback to src directory
            clothing_styles_path = os.path.join(SCRIPT_DIR, 'clothing_styles.json')
            with open(clothing_styles_path, 'r') as file:
                return json.load(file)
    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"Error loading clothing styles: {e}")
        return {}

clothing_styles = load_clothing_styles()

@app.route('/get_clothing_styles', methods=['POST'])
def get_clothing_styles():
    gender = request.form.get('gender')
    skin_tone = request.form.get('skin_tone')
    try:
        styles = clothing_styles[skin_tone][gender]
        return jsonify({'clothing_styles': styles})
    except KeyError:
        return jsonify({'clothing_styles': []})

def load_gender_model():
    try:
        model_path = os.path.join(SCRIPT_DIR, 'static', 'models', 'Gender_Prediction_model.h5')
        model = tf.keras.models.load_model(model_path)
        print("✓ Successfully loaded Gender_Prediction_model.h5")
        return model
    except Exception as e:
        print(f"Error loading Gender_Prediction_model.h5: {e}")
        try:
            # Try alternative model
            model_path = os.path.join(SCRIPT_DIR, 'static', 'models', 'GenderPredictionModel.h5')
            model = tf.keras.models.load_model(model_path)
            print("✓ Successfully loaded GenderPredictionModel.h5 as fallback")
            return model
        except Exception as e2:
            print(f"Error loading GenderPredictionModel.h5: {e2}")
            print("⚠ Warning: Gender model could not be loaded. Gender detection will not work.")
            return None

gender_model = load_gender_model()

# Load the face detection model
def load_face_detection_model(prototxt_path, model_path):
    try:
        if not os.path.exists(prototxt_path) or not os.path.exists(model_path):
            raise FileNotFoundError("Face detection model files are missing.")
        return cv2.dnn.readNetFromCaffe(prototxt_path, model_path)
    except Exception as e:
        print(f"Error loading face detection model: {e}")
        raise

prototxt_path = os.path.join(SCRIPT_DIR, 'static', 'models', 'deploy.prototxt.txt')
model_path = os.path.join(SCRIPT_DIR, 'static', 'models', 'res10_300x300_ssd_iter_140000_fp16.caffemodel')
try:
    face_net = load_face_detection_model(prototxt_path, model_path)
    print("✓ Face detection model loaded successfully!")
except Exception as e:
    print(f"Error loading face detection model: {e}")
    face_net = None

# Define a function to classify skin tone
def classify_skin_tone(avg_rgb):
    r, g, b = avg_rgb
    hsv = cv2.cvtColor(np.uint8([[[r, g, b]]]), cv2.COLOR_BGR2HSV)[0][0]
    hue = hsv[0]  # Extract Hue value (range 0-179 in OpenCV)

    undertone = "Cool" if hue > 170 or hue < 30 else "Warm"
    if hue >= 0 and hue < 10:
        return f'Porcelain (Very Fair) - {undertone} Undertone'
    elif hue >= 10 and hue < 20:
        return f'Alabaster (Fair) - {undertone} Undertone'
    elif hue >= 20 and hue < 30:
        return f'Ivory (Light Fair) - {undertone} Undertone'
    elif hue >= 30 and hue < 40:
        return f'Cream (Light) - {undertone} Undertone'
    elif hue >= 40 and hue < 50:
        return f'Beige (Light-Medium) - {undertone} Undertone'
    elif hue >= 50 and hue < 60:
        return f'Golden Beige (Medium) - {undertone} Undertone'
    elif hue >= 60 and hue < 70:
        return f'Honey (Medium-Warm) - {undertone} Undertone'
    elif hue >= 70 and hue < 80:
        return f'Tan (Medium-Dark) - {undertone} Undertone'
    elif hue >= 80 and hue < 90:
        return f'Caramel (Dark) - {undertone} Undertone'
    elif hue >= 90 and hue < 100:
        return f'Honey Brown (Dark-Warm) - {undertone} Undertone'
    elif hue >= 100 and hue < 110:
        return f'Walnut (Deep Brown) - {undertone} Undertone'
    elif hue >= 110 and hue < 120:
        return f'Espresso (Very Deep Brown) - {undertone} Undertone'
    elif hue >= 120 and hue < 130:
        return f'Chestnut (Very Deep Brown-Cool) - {undertone} Undertone'
    elif hue >= 130 and hue < 140:
        return f'Mocha (Deep Brown-Warm) - {undertone} Undertone'
    elif hue >= 140 and hue < 150:
        return f'Mahogany (Very Deep Brown-Warm) - {undertone} Undertone'
    elif hue >= 150 and hue < 160:
        return f'Sable (Almost Black) - {undertone} Undertone'
    elif hue >= 160 and hue < 170:
        return f'Ebony (Black) - {undertone} Undertone'
    else:
        return f'Unknown Skin Tone - {undertone} Undertone'

# Define a function to get clothing styles based on skin tone and gender
def get_clothing_styles(skin_tone, gender):
    try:
        skin_tone = skin_tone.split(' -')[0]  # Remove undertone information
        return clothing_styles[skin_tone][gender]
    except KeyError:
        return ["No recommended clothing styles found"]

def process_image(image_data):
    try:
        img_data = base64.b64decode(image_data.split(',')[1])
        image = Image.open(BytesIO(img_data))
        frame = np.array(image)

        frame = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)

        if face_net is None:
            raise RuntimeError("Face detection model is not loaded properly.")

        h, w = frame.shape[:2]
        frame_resized = cv2.resize(frame, (300, 300))
        blob = cv2.dnn.blobFromImage(frame_resized, scalefactor=1.0, size=(300, 300), mean=(104.0, 177.0, 123.0))
        face_net.setInput(blob)
        detections = face_net.forward()

        face_boxes = []
        for i in range(0, detections.shape[2]):
            confidence = detections[0, 0, i, 2]
            if confidence > 0.6:
                box = detections[0, 0, i, 3:7] * np.array([w, h, w, h])
                (start_x, start_y, end_x, end_y) = box.astype("int")
                face_boxes.append((start_x, start_y, end_x - start_x, end_y - start_y))

        if not face_boxes:
            return jsonify({'error': 'No face detected'})

        x, y, w, h = face_boxes[0]
        face_region = frame[y:y + h, x:x + w]

        cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)

        face_resized = cv2.resize(face_region, (128, 128))
        face_array = img_to_array(face_resized) / 255.0
        face_array = np.expand_dims(face_array, axis=0)

        # Store detected gender and skin tone in session
        if gender_model is not None:
            session['detected_gender'] = 'Male' if gender_model.predict(face_array)[0][0] > 0.4 else 'Female'
        else:
            session['detected_gender'] = 'Unknown'
        avg_rgb = cv2.mean(face_region)[:3]
        session['detected_skin_tone'] = classify_skin_tone(avg_rgb)

        print(f"Detected Gender: {session['detected_gender']}")
        print(f"Detected Skin Tone: {session['detected_skin_tone']}")

        # Make a request to the Flask route to get clothing styles
        response = requests.post('http://localhost:5000/get_clothing_styles', data={
            'gender': session['detected_gender'],
            'skin_tone': session['detected_skin_tone'].split(' -')[0]  # Send only the skin tone without undertone
        })

        if response.status_code == 200:
            recommended_clothing_styles = response.json().get('clothing_styles', [])
        else:
            recommended_clothing_styles = []

        return jsonify({
            'detected_face_image': encode_image(frame),
            'gender': session['detected_gender'],
            'skin_tone': session['detected_skin_tone'],
            'clothing_styles': recommended_clothing_styles
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Define a route for detecting face and processing
@app.route('/detect_face', methods=['POST'])
def detect_face():
    try:
        image_data = request.form['image']
        if not image_data:
            return jsonify({
                'error': 'No image data provided',
                'detected_face_image': None
            }), 400
        return process_image(image_data)

    except Exception as e:
        return jsonify({
            'error': str(e),
            'detected_face_image': None
        }), 500

@app.route('/upload_image', methods=['POST'])
def upload_image():
    try:
        image_file = request.files['image']
        if not image_file:
            return jsonify({
                'error': 'No image file provided',
                'detected_face_image': None
            }), 400

        image_data = base64.b64encode(image_file.read()).decode('utf-8')
        image_data = f'data:image/jpeg;base64,{image_data}'

        return process_image(image_data)

    except Exception as e:
        return jsonify({
            'error': str(e),
            'detected_face_image': None
        }), 500

@app.route('/generate_clothing_styles_json', methods=['GET'])
def generate_clothing_styles_json():
    try:
        # Retrieve gender and skin tone from session
        gender = session.get('detected_gender')
        skin_tone = session.get('detected_skin_tone')

        if not gender or not skin_tone:
            return jsonify({'error': 'Gender or skin tone not detected'}), 400

        # Get clothing styles based on gender and skin tone
        clothing_styles_list = get_clothing_styles(skin_tone, gender)

        # Create a JSON file with the clothing styles
        clothing_styles_json = {
            'gender': gender,
            'skin_tone': skin_tone,
            'clothing_styles': clothing_styles_list
        }

        json_filename = os.path.join(SCRIPT_DIR, 'clothing_styles1.json')
        with open(json_filename, 'w') as json_file:
            json.dump(clothing_styles_json, json_file, indent=4)

        # Send the JSON file to the client
        return send_file(json_filename, as_attachment=True)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=False, port=5000)