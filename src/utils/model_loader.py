"""Model loading utilities for the fashion recommendation app"""
import os
import tensorflow as tf
import cv2


def load_gender_model(models_dir):
    """
    Load gender prediction model with fallback option.
    
    Args:
        models_dir (str): Directory containing model files
        
    Returns:
        model: Loaded TensorFlow model or None if failed
    """
    model_path = os.path.join(models_dir, 'Gender_Prediction_model.h5')
    
    try:
        model = tf.keras.models.load_model(model_path)
        print(f"✓ Successfully loaded gender model from {model_path}")
        return model
    except Exception as e:
        print(f"✗ Error loading gender model: {e}")
        return None


def load_face_detection_model(models_dir):
    """
    Load OpenCV DNN face detection model.
    
    Args:
        models_dir (str): Directory containing model files
        
    Returns:
        net: OpenCV DNN network or None if failed
    """
    proto_path = os.path.join(models_dir, 'deploy.prototxt.txt')
    model_path = os.path.join(models_dir, 'res10_300x300_ssd_iter_140000_fp16.caffemodel')
    
    try:
        if not os.path.exists(proto_path) or not os.path.exists(model_path):
            raise FileNotFoundError(f"Model files not found:\n  Proto: {proto_path}\n  Model: {model_path}")
        
        net = cv2.dnn.readNetFromCaffe(proto_path, model_path)
        print("✓ Face detection model loaded successfully!")
        return net
    except Exception as e:
        print(f"✗ Error loading face detection model: {e}")
        return None
