from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from typing import List, Optional
from datetime import datetime, timedelta
import uvicorn

from app.api.routes import api_router
from app.core.config import settings
from app.db.database import engine, get_db
from app.db.init_db import init_db, create_initial_data

app = FastAPI(
    title="Stock Prediction API",
    description="API for stock price prediction with ~70% directional accuracy",
    version="0.1.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database
init_db()

# Include API router
app.include_router(api_router, prefix=f"{settings.API_V1_STR}")

@app.get("/")
async def root():
    return {
        "message": "Welcome to the Stock Prediction API",
        "docs": "/docs",
        "version": "0.1.0"
    }

@app.on_event("startup")
async def startup_event():
    # Create initial data
    db = next(get_db())
    try:
        create_initial_data(db)
    finally:
        db.close()

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)