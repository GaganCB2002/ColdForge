import os
import sys

# Add the backend directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.models.user import User
from app.auth.jwt import get_password_hash

def create_test_user():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "test@example.com").first()
        if not user:
            print("Creating test user...")
            hashed_pw = get_password_hash("password123")
            new_user = User(
                email="test@example.com",
                hashed_password=hashed_pw,
                full_name="Test User",
                is_active=True
            )
            db.add(new_user)
            db.commit()
            print("Test user created successfully.")
        else:
            print("Test user already exists. Updating password to password123 just in case.")
            user.hashed_password = get_password_hash("password123")
            db.commit()
            print("Test user password updated.")
    except Exception as e:
        print(f"Error creating test user: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_test_user()
