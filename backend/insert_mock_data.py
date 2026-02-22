"""
Mock data insertion script
Inserts sample users into the database for testing
"""
import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import the app, db, and User model from the new structure
from infrastructure.app_factory import create_app
from infrastructure.db import db
from models.user import User

app = create_app()

def insert_mock_data():
    """Insert mock users into the database"""
    with app.app_context():
        print("Inserting mock data...")
        
        # Sample users
        mock_users = [
            {
                'username': 'john_doe',
                'email': 'john.doe@example.com',
                'password': 'password123'
            },
            {
                'username': 'jane_smith',
                'email': 'jane.smith@example.com',
                'password': 'securepass456'
            },
            {
                'username': 'bob_wilson',
                'email': 'bob.wilson@example.com',
                'password': 'mypassword789'
            },
            {
                'username': 'alice_brown',
                'email': 'alice.brown@example.com',
                'password': 'alicepass321'
            },
            {
                'username': 'charlie_davis',
                'email': 'charlie.davis@example.com',
                'password': 'charlie2024'
            }
        ]
        
        # Insert users
        for user_data in mock_users:
            # Check if user already exists
            existing_user = User.query.filter_by(username=user_data['username']).first()
            if existing_user:
                print(f"  ⚠ User '{user_data['username']}' already exists, skipping...")
                continue
            
            # Create new user
            new_user = User(
                username=user_data['username'],
                email=user_data['email']
            )
            new_user.set_password(user_data['password'])
            
            db.session.add(new_user)
            print(f"  ✓ Added user: {user_data['username']}")
        
        # Commit all changes
        db.session.commit()
        
        print(f"\n✓ Mock data inserted successfully!")
        print(f"Total users in database: {User.query.count()}")

if __name__ == '__main__':
    try:
        insert_mock_data()
    except Exception as e:
        print(f"✗ Error inserting mock data: {e}")
        db.session.rollback()
        sys.exit(1)
