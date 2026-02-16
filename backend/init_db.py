"""
Database initialization script
Creates all database tables defined in the models
"""
import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import the app and db from api.py
from api import app, db

def init_db():
    """Initialize the database by creating all tables"""
    with app.app_context():
        print("Creating database tables...")
        
        # Drop all existing tables (use with caution!)
        # db.drop_all()
        
        # Create all tables
        db.create_all()
        
        print("✓ Database tables created successfully!")
        print("\nCreated tables:")
        print("  - users")

if __name__ == '__main__':
    try:
        init_db()
    except Exception as e:
        print(f"✗ Error initializing database: {e}")
        sys.exit(1)
