# Stock Prediction Website MVP

A web platform that predicts short-term stock price direction with approximately 68-72% accuracy using robust time-series and machine learning methods.

## Features

### Core MVP (must-have)
- Search a stock symbol and view historical OHLCV chart
- Fetch historical data automatically from an API (currently using mock data)
- Predict next-day or next-5-days up/down movement
- Show accuracy metrics and confidence score for predictions
- Compare at least 3 models (baseline, ML, DL) and highlight the best performer
- Simple authentication and watchlist
- Responsive UI

### Nice-to-have (post-MVP)
- Multi-horizon predictions
- Model explainability (SHAP), portfolio signals
- Real-time updates, scheduled retraining

## Project Structure

```
├── frontend/               # React frontend application
│   ├── public/             # Static files
│   └── src/                # React source code
│       ├── components/     # UI components
│       ├── pages/          # Page components
│       ├── services/       # API services
│       └── utils/          # Utility functions
├── backend/                # FastAPI backend application
│   ├── app/                # Main application
│   │   ├── api/            # API endpoints
│   │   ├── core/           # Core functionality
│   │   ├── db/             # Database models and connections
│   │   └── models/         # ML models
│   ├── data/               # Data storage
│   └── tests/              # Backend tests
└── docker/                 # Docker configuration
```

## Technology Stack

### Frontend
- React
- Tailwind CSS
- Chart.js for visualization

### Backend
- FastAPI
- Python (scikit-learn, statsmodels, XGBoost, PyTorch)
- PostgreSQL for user data

### Deployment
- Docker
- Cloud hosting (Heroku/Render/AWS)

## Getting Started

### Prerequisites
- Node.js and npm
- Python 3.8+
- Docker (optional)

### Installation

1. Clone the repository

2. Set up the backend:
   ```
   cd backend
   pip install -r requirements.txt
   python run.py
   ```
   The backend API will be available at http://localhost:8000
   
   You can access the API documentation at http://localhost:8000/docs

3. Set up the frontend:
   ```
   cd frontend
   npm install
   npm start
   ```
   The frontend will be available at http://localhost:3000

### Testing the API

You can test the backend API using the provided test script:
```
cd backend
python test_api.py
```

### Default Credentials

A demo user is automatically created when you start the application:
- Email: demo@example.com
- Password: password123

You can use these credentials to log in, or register a new user through the application.

## Implementation Timeline

- Week 1: Data ingestion + frontend skeleton
- Week 2: Baseline models (MA, ARIMA) + API
- Week 3: ML models + walk-forward validation
- Week 4: DL models + ensemble
- Week 5: Auth, watchlist, deployment