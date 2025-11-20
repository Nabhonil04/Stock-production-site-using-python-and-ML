from sqlalchemy.orm import Session

from app.db.database import engine
from app.db.models import Base
from app.core.auth import get_password_hash
from app.db.models import User

# Create all tables
def init_db():
    Base.metadata.create_all(bind=engine)
    return True
    
def create_initial_data(db: Session):
    # Check if we already have users
    user = db.query(User).first()
    if not user:
        # Create a demo user
        demo_user = User(
            email="demo@example.com",
            name="Demo User",
            hashed_password=get_password_hash("password123"),
            is_active=True
        )
        db.add(demo_user)
        db.commit()
        
    # Add more initial data as needed
    # For example, you could add some initial stock data or model metrics