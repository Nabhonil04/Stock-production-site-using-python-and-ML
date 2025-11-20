from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_active_user
from app.db.database import get_db
from app.db.models import User
from app.schemas.schemas import User as UserSchema

router = APIRouter()

@router.get("/me", response_model=UserSchema)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    """Get current user information"""
    return current_user

@router.put("/me", response_model=UserSchema)
async def update_user(user_data: UserSchema, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    """Update current user information"""
    # Update user data
    current_user.name = user_data.name
    
    # If email is being changed, check if it's already in use
    if user_data.email != current_user.email:
        db_user = db.query(User).filter(User.email == user_data.email).first()
        if db_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        current_user.email = user_data.email
    
    db.commit()
    db.refresh(current_user)
    
    return current_user