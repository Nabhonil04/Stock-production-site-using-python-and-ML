import os
from pydantic_settings import BaseSettings
from typing import List, Optional

class Settings(BaseSettings):
    # API settings
    API_V1_STR: str = "/api"
    PROJECT_NAME: str = "Stock Prediction API"
    
    # CORS settings
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8000"]
    
    # Database settings
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./stock_prediction.db")
    
    # JWT settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-for-jwt-please-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Stock API settings
    STOCK_API_KEY: Optional[str] = os.getenv("STOCK_API_KEY", None)
    STOCK_API_URL: str = "https://www.alphavantage.co/query"
    
    # Model settings
    MODEL_DIR: str = "./app/models/saved"
    PREDICTION_HORIZON: List[str] = ["1d", "5d"]
    TARGET_ACCURACY: str = "~70%"
    
    class Config:
        case_sensitive = True

settings = Settings()