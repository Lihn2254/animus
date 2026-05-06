import sys
from dotenv import load_dotenv
from infrastructure.app_factory import create_app
from infrastructure.db import db
from sqlalchemy import inspect

# Load environment variables
load_dotenv()

# Import the app and db from the application factory

app = create_app()
# Ensure models are imported so SQLAlchemy metadata includes them
from models import Report  # noqa: F401

def init_db():
    """Initialize the database by creating all tables"""
    with app.app_context():
        print("Creating database tables...")

        # Drop all existing tables and recreate with the current schema
        db.drop_all()

        # Create all tables
        db.create_all()
        print("Database tables created successfully!")
        print("\nCreated tables:")
        inspector = inspect(db.engine)
        for table_name in inspector.get_table_names():
            print(f"  - {table_name}")

if __name__ == '__main__':
    try:
        init_db()
    except Exception as e:
        print(f"Error initializing database: {e}")
        sys.exit(1)
