import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import stockService from '../services/stockService';
import { AuthContext } from '../context/AuthContext';

const WatchlistPage = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const fetchWatchlist = async () => {
      try {
        setLoading(true);
        const data = await stockService.getWatchlist();
        
        // Fetch predictions for each stock in watchlist
        const watchlistWithPredictions = await Promise.all(
          data.map(async (item) => {
            try {
              const prediction = await stockService.getPrediction(item.ticker, '1d');
              return {
                ...item,
                prediction: prediction.prediction,
                confidence: prediction.confidence,
                best_model: prediction.best_model
              };
            } catch (err) {
              console.error(`Error fetching prediction for ${item.ticker}:`, err);
              return {
                ...item,
                prediction: 'unknown',
                confidence: null,
                best_model: null
              };
            }
          })
        );

        setWatchlist(watchlistWithPredictions);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching watchlist:', err);
        setError('Failed to load watchlist. Please try again later.');
        setLoading(false);
      }
    };

    fetchWatchlist();
  }, [currentUser, navigate]);

  const handleRemoveFromWatchlist = async (ticker) => {
    try {
      await stockService.removeFromWatchlist(ticker);
      setWatchlist(watchlist.filter(item => item.ticker !== ticker));
    } catch (err) {
      console.error('Error removing from watchlist:', err);
    }
  };

  const handleStockClick = (ticker) => {
    navigate(`/stock/${ticker}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Watchlist</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="card animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Watchlist</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Watchlist</h1>

      {watchlist.length === 0 ? (
        <div className="card text-center py-12">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <h2 className="text-xl font-semibold mb-2">Your watchlist is empty</h2>
          <p className="text-gray-600 mb-6">Start adding stocks to your watchlist to track their predictions</p>
          <button
            onClick={() => navigate('/')}
            className="btn btn-primary"
          >
            Search Stocks
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {watchlist.map((stock) => (
            <div key={stock.ticker} className="card relative">
              {/* Remove button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFromWatchlist(stock.ticker);
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
                title="Remove from watchlist"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>

              {/* Stock info */}
              <div
                className="cursor-pointer"
                onClick={() => handleStockClick(stock.ticker)}
              >
                <h3 className="text-xl font-bold mb-1">{stock.ticker}</h3>
                <p className="text-gray-600 mb-4">{stock.name || stock.ticker}</p>

                {stock.prediction !== 'unknown' ? (
                  <>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-500">Next-day prediction:</span>
                      <span
                        className={`px-2 py-1 rounded text-sm font-medium ${stock.prediction === 'up' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                      >
                        {stock.prediction === 'up' ? '↑ Up' : '↓ Down'}
                      </span>
                    </div>

                    <div className="flex items-center mb-2">
                      <span className="text-sm text-gray-500 mr-2">Confidence:</span>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full ${stock.prediction === 'up' ? 'bg-success' : 'bg-danger'}`}
                          style={{ width: `${stock.confidence * 100}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-sm font-medium">
                        {stock.confidence ? `${(stock.confidence * 100).toFixed(0)}%` : 'N/A'}
                      </span>
                    </div>

                    {stock.best_model && (
                      <div className="text-sm text-gray-500">
                        Best model: <span className="font-medium">{formatModelName(stock.best_model)}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-sm text-gray-500">
                    Prediction data unavailable
                  </div>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStockClick(stock.ticker);
                  }}
                  className="mt-4 w-full text-center py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Helper function to format model names
const formatModelName = (modelKey) => {
  const modelMap = {
    'xgboost': 'XGBoost',
    'lstm': 'LSTM',
    'ma_crossover': 'MA Crossover',
    'arima': 'ARIMA',
    'logistic': 'Logistic',
    'gru': 'GRU',
    'ensemble': 'Ensemble'
  };
  
  return modelMap[modelKey] || modelKey;
};

export default WatchlistPage;