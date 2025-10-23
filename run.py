#!/usr/bin/env python
"""
Entry point for the Fashion Recommendation Application
Run this script to start the Flask development server
"""
import sys
import os

# Add src directory to path
src_dir = os.path.join(os.path.dirname(__file__), 'src')
sys.path.insert(0, src_dir)

from app import app

if __name__ == '__main__':
    print("\n" + "="*60)
    print("  PERSONALIZED AI FASHION RECOMMENDATION")
    print("="*60)
    print("  Starting Flask Application...")
    print("  Access the app at: http://127.0.0.1:5000")
    print("="*60 + "\n")
    
    app.run(debug=False, host='127.0.0.1', port=5000, use_reloader=False)
