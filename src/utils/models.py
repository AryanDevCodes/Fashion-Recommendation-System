from tensorflow import keras
from keras_facenet import FaceNet
import cv2
import json

# Load FaceNet model
facenet_model = FaceNet()

# Load face detection model
face_detection_model = cv2.dnn.readNetFromCaffe("deploy.prototxt.txt", "res10_300x300_ssd_iter_140000_fp16.caffemodel")

# Load clothing styles from JSON file
with open('clothing_styles.json') as f:
    clothing_styles = json.load(f)

# Define the gender classification model
gender_model = keras.Sequential()
gender_model.add(keras.layers.Conv2D(32, (3, 3), activation='relu', input_shape=(64, 64, 1)))
gender_model.add(keras.layers.MaxPooling2D((2, 2)))
gender_model.add(keras.layers.Conv2D(64, (3, 3), activation='relu'))
gender_model.add(keras.layers.MaxPooling2D((2, 2)))
gender_model.add(keras.layers.Conv2D(128, (3, 3), activation='relu'))
gender_model.add(keras.layers.MaxPooling2D((2, 2)))
gender_model.add(keras.layers.Flatten())
gender_model.add(keras.layers.Dense(128, activation='relu'))
gender_model.add(keras.layers.Dense(2, activation='softmax'))

# Compile the model
gender_model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
