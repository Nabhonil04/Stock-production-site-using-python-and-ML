from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime, Float, Text
from sqlalchemy.orm import relationship
from datetime import datetime

from app.db.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    watchlist = relationship("WatchlistItem", back_populates="user")

class WatchlistItem(Base):
    __tablename__ = "watchlist_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    ticker = Column(String, index=True)
    added_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="watchlist")

class StockData(Base):
    __tablename__ = "stock_data"

    id = Column(Integer, primary_key=True, index=True)
    ticker = Column(String, index=True)
    date = Column(DateTime, index=True)
    open = Column(Float)
    high = Column(Float)
    low = Column(Float)
    close = Column(Float)
    volume = Column(Integer)
    last_updated = Column(DateTime, default=datetime.utcnow)

    class Config:
        orm_mode = True

class PredictionResult(Base):
    __tablename__ = "prediction_results"

    id = Column(Integer, primary_key=True, index=True)
    ticker = Column(String, index=True)
    prediction_date = Column(DateTime, default=datetime.utcnow)
    target_date = Column(DateTime)
    horizon = Column(String)  # e.g., "1d", "5d"
    prediction = Column(String)  # "up" or "down"
    confidence = Column(Float)
    model_name = Column(String)  # e.g., "xgboost", "lstm"
    actual_result = Column(String, nullable=True)  # "up" or "down", filled after the fact
    was_correct = Column(Boolean, nullable=True)  # filled after the fact

    class Config:
        orm_mode = True

class ModelMetrics(Base):
    __tablename__ = "model_metrics"

    id = Column(Integer, primary_key=True, index=True)
    ticker = Column(String, index=True)
    model_name = Column(String, index=True)
    horizon = Column(String, index=True)  # e.g., "1d", "5d"
    accuracy = Column(Float)
    precision_up = Column(Float)
    recall_up = Column(Float)
    f1_score = Column(Float)
    validation_period = Column(String)  # e.g., "2022-01-01 to 2022-12-31"
    last_updated = Column(DateTime, default=datetime.utcnow)

    class Config:
        orm_mode = True