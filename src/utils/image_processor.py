"""Image processing utilities for face detection and skin tone classification"""
import cv2
import numpy as np
from tensorflow.keras.preprocessing.image import img_to_array


def classify_skin_tone(avg_rgb):
    """
    Classify skin tone based on RGB values.
    
    Args:
        avg_rgb (tuple): Average RGB values (R, G, B)
        
    Returns:
        str: Skin tone classification with undertone
    """
    r, g, b = avg_rgb
    
    # Convert BGR to HSV for better color analysis
    hsv = cv2.cvtColor(np.uint8([[[r, g, b]]]), cv2.COLOR_BGR2HSV)[0][0]
    hue = hsv[0]  # Extract Hue value (range 0-179 in OpenCV)
    
    # Determine undertone based on hue
    undertone = "Cool" if hue > 170 or hue < 30 else "Warm"
    
    # Classify skin tone by hue ranges
    skin_tone_map = {
        (0, 10): 'Porcelain (Very Fair)',
        (10, 20): 'Alabaster (Fair)',
        (20, 30): 'Ivory (Light Fair)',
        (30, 40): 'Cream (Light)',
        (40, 50): 'Beige (Light-Medium)',
        (50, 60): 'Golden Beige (Medium)',
        (60, 70): 'Honey (Medium-Warm)',
        (70, 80): 'Tan (Medium-Dark)',
        (80, 90): 'Caramel (Dark)',
        (90, 100): 'Honey Brown (Dark-Warm)',
        (100, 110): 'Walnut (Deep Brown)',
        (110, 120): 'Espresso (Very Deep Brown)',
        (120, 130): 'Chestnut (Very Deep Brown-Cool)',
        (130, 140): 'Mocha (Deep Brown-Warm)',
        (140, 150): 'Mahogany (Very Deep Brown-Warm)',
        (150, 160): 'Sable (Almost Black)',
        (160, 170): 'Ebony (Black)',
    }
    
    # Find matching skin tone
    for (min_hue, max_hue), tone in skin_tone_map.items():
        if min_hue <= hue < max_hue:
            return f'{tone} - {undertone} Undertone'
    
    return f'Unknown Skin Tone - {undertone} Undertone'


def detect_faces(frame, face_net, confidence_threshold=0.6):
    """
    Detect faces in frame using DNN.
    
    Args:
        frame (np.ndarray): Input frame
        face_net: OpenCV DNN network
        confidence_threshold (float): Confidence threshold for detection
        
    Returns:
        list: List of face bounding boxes [(x, y, w, h), ...]
    """
    h, w = frame.shape[:2]
    frame_resized = cv2.resize(frame, (300, 300))
    
    # Create blob and detect
    blob = cv2.dnn.blobFromImage(
        frame_resized,
        scalefactor=1.0,
        size=(300, 300),
        mean=(104.0, 177.0, 123.0)
    )
    
    face_net.setInput(blob)
    detections = face_net.forward()
    
    # Extract face boxes
    face_boxes = []
    for i in range(detections.shape[2]):
        confidence = detections[0, 0, i, 2]
        if confidence > confidence_threshold:
            box = detections[0, 0, i, 3:7] * np.array([w, h, w, h])
            (start_x, start_y, end_x, end_y) = box.astype("int")
            face_boxes.append((start_x, start_y, end_x - start_x, end_y - start_y))
    
    return face_boxes


def extract_face_region(frame, face_box):
    """
    Extract face region from frame.
    
    Args:
        frame (np.ndarray): Input frame
        face_box (tuple): Face bounding box (x, y, w, h)
        
    Returns:
        np.ndarray: Extracted face region
    """
    x, y, w, h = face_box
    return frame[y:y + h, x:x + w]


def prepare_face_for_gender_prediction(face_region, target_size=(128, 128)):
    """
    Prepare face region for gender prediction model.
    
    Args:
        face_region (np.ndarray): Face region
        target_size (tuple): Target size for model
        
    Returns:
        np.ndarray: Prepared face array
    """
    face_resized = cv2.resize(face_region, target_size)
    face_array = img_to_array(face_resized) / 255.0
    face_array = np.expand_dims(face_array, axis=0)
    return face_array


def draw_face_rectangle(frame, face_box, color=(0, 255, 0), thickness=2):
    """
    Draw rectangle around detected face.
    
    Args:
        frame (np.ndarray): Input frame
        face_box (tuple): Face bounding box (x, y, w, h)
        color (tuple): BGR color
        thickness (int): Rectangle thickness
        
    Returns:
        np.ndarray: Frame with rectangle drawn
    """
    x, y, w, h = face_box
    cv2.rectangle(frame, (x, y), (x + w, y + h), color, thickness)
    return frame
