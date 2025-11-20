import datetime
import random
from typing import List, Dict, Any

from app.core.config import settings

# Mock stock data
def generate_mock_historical_data(ticker: str, range: str = "1y") -> List[Dict[str, Any]]:
    """Generate mock historical stock data"""
    # Determine date range
    end_date = datetime.datetime.now()
    if range == "1w":
        days = 7
    elif range == "1m":
        days = 30
    elif range == "3m":
        days = 90
    elif range == "6m":
        days = 180
    elif range == "1y":
        days = 365
    else:  # "all"
        days = 1000
    
    # Generate data
    data = []
    base_price = random.uniform(50, 500)  # Random starting price based on ticker
    
    # Seed random with ticker to get consistent results for the same ticker
    random.seed(sum(ord(c) for c in ticker))
    
    for i in range(days):
        date = end_date - datetime.timedelta(days=days-i)
        # Skip weekends
        if date.weekday() >= 5:  # 5 = Saturday, 6 = Sunday
            continue
            
        # Generate price with some randomness but trending
        change_percent = random.uniform(-0.03, 0.03)  # Daily change between -3% and 3%
        base_price = base_price * (1 + change_percent)
        
        # Generate OHLCV data
        open_price = base_price
        high_price = open_price * (1 + random.uniform(0, 0.02))  # Up to 2% higher
        low_price = open_price * (1 - random.uniform(0, 0.02))   # Up to 2% lower
        close_price = random.uniform(low_price, high_price)       # Between low and high
        volume = int(random.uniform(100000, 10000000))           # Random volume
        
        data.append({
            "date": date.strftime("%Y-%m-%d"),
            "open": round(open_price, 2),
            "high": round(high_price, 2),
            "low": round(low_price, 2),
            "close": round(close_price, 2),
            "volume": volume
        })
    
    return data

# Mock prediction data
def generate_mock_prediction(ticker: str, horizon: str, models: List[str]) -> Dict[str, Any]:
    """Generate mock stock prediction"""
    # Seed random with ticker and horizon to get consistent results
    random.seed(sum(ord(c) for c in ticker) + sum(ord(c) for c in horizon))
    
    # Generate model scores (around 70% accuracy as per requirements)
    model_scores = {}
    for model in models:
        if model == "xgboost":
            score = random.uniform(0.68, 0.74)  # XGBoost performs well
        elif model == "lstm":
            score = random.uniform(0.67, 0.73)  # LSTM also performs well
        elif model == "gru":
            score = random.uniform(0.66, 0.72)  # GRU slightly worse than LSTM
        elif model == "arima":
            score = random.uniform(0.60, 0.65)  # ARIMA is a baseline model
        elif model == "ma_crossover":
            score = random.uniform(0.55, 0.62)  # Moving average is a simple baseline
        else:
            score = random.uniform(0.50, 0.70)  # Unknown model
        
        model_scores[model] = round(score, 2)
    
    # Determine best model
    best_model = max(model_scores, key=model_scores.get)
    
    # Determine prediction direction (slightly biased towards up for a more positive user experience)
    prediction = "up" if random.random() > 0.45 else "down"
    
    # Confidence based on best model score
    confidence = model_scores[best_model]
    
    return {
        "ticker": ticker.upper(),
        "horizon": horizon,
        "prediction": prediction,
        "confidence": confidence,
        "accuracy_target": settings.TARGET_ACCURACY,
        "model_scores": model_scores,
        "best_model": best_model
    }

# Mock metrics data
def generate_mock_metrics(ticker: str) -> Dict[str, Any]:
    """Generate mock model performance metrics"""
    # Seed random with ticker to get consistent results
    random.seed(sum(ord(c) for c in ticker))
    
    # Generate metrics for different models
    models = ["xgboost", "lstm", "arima", "ma_crossover"]
    metrics = {}
    
    for model in models:
        if model == "xgboost":
            accuracy = random.uniform(0.68, 0.74)
            precision = random.uniform(0.65, 0.75)
            recall = random.uniform(0.65, 0.75)
        elif model == "lstm":
            accuracy = random.uniform(0.67, 0.73)
            precision = random.uniform(0.64, 0.74)
            recall = random.uniform(0.64, 0.74)
        elif model == "arima":
            accuracy = random.uniform(0.60, 0.65)
            precision = random.uniform(0.58, 0.68)
            recall = random.uniform(0.58, 0.68)
        elif model == "ma_crossover":
            accuracy = random.uniform(0.55, 0.62)
            precision = random.uniform(0.53, 0.63)
            recall = random.uniform(0.53, 0.63)
        
        metrics[model] = {
            "accuracy": round(accuracy, 2),
            "precision": round(precision, 2),
            "recall": round(recall, 2)
        }
    
    return {
        "ticker": ticker.upper(),
        "metrics": metrics
    }