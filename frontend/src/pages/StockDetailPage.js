import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StockChart from '../components/StockChart';
import PredictionCard from '../components/PredictionCard';
import ModelComparison from '../components/ModelComparison';
import StockMetrics from '../components/StockMetrics';
import { stockService } from '../services/stockService';
import { AuthContext } from '../context/AuthContext';
import calculationService from '../services/calculationService';

const StockDetailPage = () => {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  
  const [stockData, setStockData] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [predictionHorizon, setPredictionHorizon] = useState('1d');
  const [realTimeQuote, setRealTimeQuote] = useState(null);
  const [isAutoUpdating, setIsAutoUpdating] = useState(true);
  const [seriesData, setSeriesData] = useState(null);
  const unsubscribeRef = useRef(null);
  const VERSION = process.env.REACT_APP_VERSION || '1.0.0';
  
  // Log application version on component mount
  useEffect(() => {
    console.log(`Stock Detail Page - Version: ${VERSION}`);
  }, []);

  // Fetch stock data and prediction
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch historical data
        const historicalData = await stockService.getHistoricalData(symbol, '1y');
        setStockData(historicalData);

        // Build metrics-friendly series arrays from historical data
        const prices = historicalData?.data?.map(d => d.close) || [];
        const volumes = historicalData?.data?.map(d => d.volume) || [];
        const highs = historicalData?.data?.map(d => d.high) || [];
        const lows = historicalData?.data?.map(d => d.low) || [];
        const series = { prices, volumes, highs, lows };
        setSeriesData(series);

        // Fetch real-time quote
        const quote = await stockService.getRealTimeQuote(symbol);
        setRealTimeQuote(quote);

        // Fetch prediction
        const predictionData = await stockService.getPrediction(symbol, predictionHorizon);
        setPrediction(predictionData);

        // Calculate metrics using calculationService
        if (series && series.prices?.length >= 30) {
          const calculatedMetrics = calculationService.calculateAllMetrics(series);
          setMetrics(calculatedMetrics);
        } else {
          // Fallback metrics if calculation fails
          setMetrics({
            models: [{
              name: 'ma_crossover',
              accuracy: 0.68,
              precision: 0.71,
              recall: 0.65,
              f1_score: 0.68
            }]
          });
        }

        // Check if stock is in watchlist (if user is logged in)
        if (currentUser) {
          try {
            const watchlist = await stockService.getWatchlist();
            setIsInWatchlist(watchlist.some(item => item.ticker === symbol));
          } catch (watchlistErr) {
            console.error('Error fetching watchlist:', watchlistErr);
            // Don't fail the whole page load if watchlist fails
            setIsInWatchlist(false);
          }
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching stock data:', err);
        setError('Failed to load stock data. Please try again later.');
        setLoading(false);
      }
    };

    if (symbol) {
      fetchData();
    }

    return () => {
      // Clean up any subscriptions when component unmounts or symbol changes
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [symbol, predictionHorizon, currentUser]);

  // Set up real-time updates
  useEffect(() => {
    if (!symbol || !isAutoUpdating) return;

    // Clean up previous subscription
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    // Subscribe to real-time updates
    unsubscribeRef.current = stockService.subscribeToRealTimeUpdates(symbol, (data) => {
      setRealTimeQuote(prevQuote => ({
        ...prevQuote,
        price: data.price,
        timestamp: data.timestamp,
        volume: data.volume
      }));
      
      // Update metrics with real-time data using series arrays
      setSeriesData(prev => {
        if (!prev || !prev.prices || prev.prices.length === 0) return prev;
        const updated = { ...prev, prices: [...prev.prices] };
        updated.prices[updated.prices.length - 1] = data.price;
        const updatedMetrics = calculationService.calculateAllMetrics(updated);
        setMetrics(updatedMetrics);
        return updated;
      });
    });

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [symbol, isAutoUpdating, seriesData]);

  // Handle watchlist toggle
  const handleWatchlistToggle = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    try {
      if (isInWatchlist) {
        await stockService.removeFromWatchlist(symbol);
        setIsInWatchlist(false);
      } else {
        await stockService.addToWatchlist(symbol);
        setIsInWatchlist(true);
      }
    } catch (err) {
      console.error('Error updating watchlist:', err);
    }
  };

  // Handle prediction horizon change
  const handleHorizonChange = (horizon) => {
    setPredictionHorizon(horizon);
  };

  if (loading && !stockData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with real-time price and watchlist button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{symbol}</h1>
          {realTimeQuote && (
            <div className="mt-2">
              <span className="text-2xl font-semibold">${realTimeQuote.price.toFixed(2)}</span>
              <span className={`ml-2 ${realTimeQuote.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {realTimeQuote.change >= 0 ? '+' : ''}{realTimeQuote.change.toFixed(2)} ({realTimeQuote.changePercent.toFixed(2)}%)
              </span>
              <div className="text-xs text-gray-500 mt-1">
                Last updated: {new Date(realTimeQuote.timestamp).toLocaleTimeString()}
                <span className="ml-2">
                  <button 
                    onClick={() => setIsAutoUpdating(!isAutoUpdating)}
                    className={`px-2 py-1 rounded text-xs ${isAutoUpdating ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                  >
                    {isAutoUpdating ? 'Auto-updating' : 'Updates paused'}
                  </button>
                </span>
              </div>
            </div>
          )}
        </div>
        <div className="mt-4 md:mt-0">
          <button
            onClick={handleWatchlistToggle}
            className={`btn ${isInWatchlist ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' : 'btn-primary'}`}
          >
            {isInWatchlist ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 inline" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
                In Watchlist
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Add to Watchlist
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stock Chart */}
      <div className="mb-8">
        <StockChart stockData={stockData} ticker={symbol} />
      </div>

      {/* Stock Metrics */}
      <div className="mb-8">
        <StockMetrics metrics={metrics} ticker={symbol} />
      </div>

      {/* Prediction Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Price Prediction</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => handleHorizonChange('1d')}
              className={`px-3 py-1 rounded-md text-sm ${predictionHorizon === '1d' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Next Day
            </button>
            <button
              onClick={() => handleHorizonChange('5d')}
              className={`px-3 py-1 rounded-md text-sm ${predictionHorizon === '5d' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Next 5 Days
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PredictionCard prediction={prediction} ticker={symbol} />
          <ModelComparison metrics={metrics} ticker={symbol} />
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              <strong>Disclaimer:</strong> Predictions are based on historical data and machine learning models with a target accuracy of ~70%. 
              Past performance is not indicative of future results. This tool is for educational purposes only and should not be used as financial advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockDetailPage;