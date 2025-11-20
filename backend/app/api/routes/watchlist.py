from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.auth import get_current_active_user
from app.db.database import get_db
from app.db.models import User, WatchlistItem
from app.schemas.schemas import WatchlistItemBase, WatchlistItemCreate

router = APIRouter()

@router.get("/", response_model=List[WatchlistItemBase])
async def get_watchlist(current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    """Get current user's watchlist"""
    watchlist = db.query(WatchlistItem).filter(WatchlistItem.user_id == current_user.id).all()
    return watchlist

@router.post("/", response_model=WatchlistItemBase, status_code=status.HTTP_201_CREATED)
async def add_to_watchlist(item: WatchlistItemCreate, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    """Add a stock to the watchlist"""
    # Check if stock is already in watchlist
    existing_item = db.query(WatchlistItem).filter(
        WatchlistItem.user_id == current_user.id,
        WatchlistItem.ticker == item.ticker.upper()
    ).first()
    
    if existing_item:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Stock already in watchlist"
        )
    
    # Add to watchlist
    db_item = WatchlistItem(
        user_id=current_user.id,
        ticker=item.ticker.upper()
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    
    return db_item

@router.delete("/{ticker}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_from_watchlist(ticker: str, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    """Remove a stock from the watchlist"""
    # Find the watchlist item
    db_item = db.query(WatchlistItem).filter(
        WatchlistItem.user_id == current_user.id,
        WatchlistItem.ticker == ticker.upper()
    ).first()
    
    if not db_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Stock not found in watchlist"
        )
    
    # Remove from watchlist
    db.delete(db_item)
    db.commit()
    
    return None