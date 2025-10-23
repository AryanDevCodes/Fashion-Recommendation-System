"""Configuration settings for the Fashion Recommendation app"""
import os

# Get directory paths
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)

# Path configuration
MODELS_DIR = os.path.join(SCRIPT_DIR, 'static', 'models')
DATA_DIR = os.path.join(PROJECT_ROOT, 'data')
STATIC_DIR = os.path.join(SCRIPT_DIR, 'static')
TEMPLATES_DIR = os.path.join(SCRIPT_DIR, 'templates')

# Flask configuration
DEBUG = False
TESTING = False
SECRET_KEY = 'your_secret_key_here_change_in_production'
PORT = 5000
HOST = '127.0.0.1'

# Upload configuration
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'gif', 'bmp'}

# Model configuration
FACE_DETECTION_CONFIDENCE = 0.6
GENDER_PREDICTION_THRESHOLD = 0.4

# Ensure directories exist
os.makedirs(MODELS_DIR, exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(STATIC_DIR, exist_ok=True)
os.makedirs(TEMPLATES_DIR, exist_ok=True)

print(f"""
╔════════════════════════════════════════════╗
║  Fashion Recommendation Configuration     ║
╠════════════════════════════════════════════╣
║  Project Root: {PROJECT_ROOT}
║  Models Dir:   {MODELS_DIR}
║  Data Dir:     {DATA_DIR}
║  Static Dir:   {STATIC_DIR}
║  Templates:    {TEMPLATES_DIR}
╚════════════════════════════════════════════╝
""")
