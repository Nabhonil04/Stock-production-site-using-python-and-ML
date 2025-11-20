from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import random

from app.core.auth import get_current_active_user
from app.db.database import get_db
from app.db.models import User, StockData, PredictionResult, ModelMetrics
from app.schemas.schemas import StockHistoricalData, PredictionResponse, ModelMetricsResponse
from app.core.config import settings

# In a real implementation, these would be replaced with actual model predictions
from app.models.mock_data import generate_mock_historical_data, generate_mock_prediction, generate_mock_metrics

router = APIRouter()

@router.get("/history", response_model=List[dict])
async def get_stock_history(
    ticker: str,
    range: str = "1y",
    db: Session = Depends(get_db)
):
    """Get historical stock data"""
    # In a real implementation, this would fetch data from the database or an external API
    # For now, we'll generate mock data
    historical_data = generate_mock_historical_data(ticker, range)
    
    return historical_data

@router.get("/predict", response_model=PredictionResponse)
async def get_stock_prediction(
    ticker: str,
    horizon: str = "1d",
    models: str = "xgboost,lstm,ma_crossover",
    db: Session = Depends(get_db)
):
    """Get stock price prediction"""
    # Validate horizon
    if horizon not in settings.PREDICTION_HORIZON:
        raise HTTPException(status_code=400, detail=f"Invalid horizon. Must be one of {settings.PREDICTION_HORIZON}")
    
    # Parse requested models
    model_list = models.split(",")
    
    # In a real implementation, this would use actual ML models to make predictions
    # For now, we'll generate mock predictions
    prediction = generate_mock_prediction(ticker, horizon, model_list)
    
    return prediction

@router.get("/metrics", response_model=ModelMetricsResponse)
async def get_model_metrics(
    ticker: str,
    db: Session = Depends(get_db)
):
    """Get model performance metrics"""
    # In a real implementation, this would fetch metrics from the database
    # For now, we'll generate mock metrics
    metrics = generate_mock_metrics(ticker)
    
    return metrics

@router.get("/search")
async def search_stocks(query: str, limit: int = 10):
    """Search for stocks by ticker or name"""
    # In a real implementation, this would search a database of stocks
    # For now, we'll return some mock results
    mock_results = [
        {"ticker": "AAPL", "name": "Apple Inc."},
        {"ticker": "MSFT", "name": "Microsoft Corporation"},
        {"ticker": "GOOGL", "name": "Alphabet Inc."},
        {"ticker": "AMZN", "name": "Amazon.com Inc."},
        {"ticker": "TSLA", "name": "Tesla, Inc."},
        {"ticker": "META", "name": "Meta Platforms, Inc."},
        {"ticker": "NVDA", "name": "NVIDIA Corporation"},
        {"ticker": "NFLX", "name": "Netflix, Inc."},
        {"ticker": "PYPL", "name": "PayPal Holdings, Inc."},
        {"ticker": "INTC", "name": "Intel Corporation"}
    ]
    
    # Filter results based on query
    filtered_results = []
    query = query.upper()
    for stock in mock_results:
        if query in stock["ticker"] or query.lower() in stock["name"].lower():
            filtered_results.append(stock)
    
    return filtered_results[:limit]