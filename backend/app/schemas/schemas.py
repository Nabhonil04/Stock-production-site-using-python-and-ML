from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    name: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Stock data schemas
class StockDataPoint(BaseModel):
    date: str
    open: float
    high: float
    low: float
    close: float
    volume: int

class StockHistoricalData(BaseModel):
    ticker: str
    data: List[StockDataPoint]

# Prediction schemas
class ModelScore(BaseModel):
    accuracy: float
    precision_up: float
    recall_up: float
    f1_score: float

class ModelMetricsResponse(BaseModel):
    ticker: str
    models: Dict[str, ModelScore]
    validation_period: str
    baseline_accuracy: float

class PredictionResponse(BaseModel):
    ticker: str
    horizon: str
    prediction: str  # "up" or "down"
    confidence: float
    accuracy_target: str
    model_scores: Dict[str, float]
    best_model: str

# Watchlist schemas
class WatchlistItemBase(BaseModel):
    ticker: str

class WatchlistItemCreate(WatchlistItemBase):
    pass

class WatchlistItem(WatchlistItemBase):
    id: int
    user_id: int
    added_at: datetime

    class Config:
        orm_mode = True

class WatchlistResponse(BaseModel):
    items: List[WatchlistItemBase]