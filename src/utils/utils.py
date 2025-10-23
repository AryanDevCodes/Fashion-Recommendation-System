import cv2
import numpy as np
from mtcnn import MTCNN
from tensorflow.keras.models import load_model

# Initialize MTCNN face detector
detector = MTCNN()

# Load your gender prediction model (make sure it's loaded once)
gender_model = load_model('gender_model.h5')


def preprocess_face(face_region):
    """Resize and normalize the face region for gender prediction."""
    face_region = cv2.resize(face_region, (224, 224))  # Resize to 224x224
    face_region = cv2.cvtColor(face_region, cv2.COLOR_BGR2RGB)  # Convert to RGB
    face_region = face_region.astype('float32') / 255.0  # Normalize
    face_region = np.expand_dims(face_region, axis=0)  # Add batch dimension
    return face_region


def detect_and_predict_gender(frame):
    """Detect faces and predict gender in real-time."""
    faces = detector.detect_faces(frame)

    for face in faces:
        x, y, w, h = face['box']
        face_region = frame[y:y + h, x:x + w]

        # Preprocess the face region for gender prediction
        face_region_processed = preprocess_face(face_region)

        # Predict gender
        prediction = gender_model.predict(face_region_processed)
        gender = 'Male' if prediction[0][0] > prediction[0][1] else 'Female'

        # Draw bounding box and gender label
        cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
        cv2.putText(frame, gender, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2)

    return frame


# Initialize webcam
cap = cv2.VideoCapture(0)

while True:
    ret, frame = cap.read()
    if not ret:
        break

    # Detect faces and predict gender
    frame = detect_and_predict_gender(frame)

    # Display the result
    cv2.imshow('Real-Time Gender Prediction', frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
