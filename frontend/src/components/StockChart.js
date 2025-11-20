import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  BarElement,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const StockChart = ({ stockData, ticker }) => {
  const [timeRange, setTimeRange] = useState('1m'); // Default to 1 month

  // Filter data based on selected time range
  const filterDataByRange = (data, range) => {
    if (!data || !data.data || !data.data.length) return { dates: [], prices: [], volumes: [] };
    
    const stockData = data.data;
    const now = new Date();
    let filterDate = new Date();

    switch (range) {
      case '1w':
        filterDate.setDate(now.getDate() - 7);
        break;
      case '1m':
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case '3m':
        filterDate.setMonth(now.getMonth() - 3);
        break;
      case '6m':
        filterDate.setMonth(now.getMonth() - 6);
        break;
      case '1y':
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'all':
        return {
          dates: stockData.map(item => item.date),
          prices: stockData.map(item => item.close),
          volumes: stockData.map(item => item.volume),
        };
      default:
        filterDate.setMonth(now.getMonth() - 1);
    }

    const filteredData = stockData.filter(item => new Date(item.date) >= filterDate);

    return {
      dates: filteredData.map(item => item.date),
      prices: filteredData.map(item => item.close),
      volumes: filteredData.map(item => item.volume),
    };
  };

  const { dates, prices } = filterDataByRange(stockData, timeRange);

  // Determine if price has increased or decreased
  const priceChange = prices.length >= 2 ? prices[prices.length - 1] - prices[0] : 0;
  const lineColor = priceChange >= 0 ? 'rgba(0, 200, 83, 1)' : 'rgba(255, 23, 68, 1)';
  const fillColor = priceChange >= 0 ? 'rgba(0, 200, 83, 0.1)' : 'rgba(255, 23, 68, 0.1)';

  const chartData = {
    labels: dates,
    datasets: [
      {
        label: ticker,
        data: prices,
        borderColor: lineColor,
        backgroundColor: fillColor,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: lineColor,
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2,
        tension: 0.1,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: $${context.parsed.y.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxTicksLimit: 10,
          maxRotation: 0,
        },
      },
      y: {
        position: 'right',
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          callback: function(value) {
            return '$' + value.toFixed(2);
          },
        },
      },
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
  };

  // Calculate price change and percentage
  const calculatePriceChange = () => {
    if (prices.length < 2) return { change: 0, percentage: 0 };
    
    const firstPrice = prices[0];
    const lastPrice = prices[prices.length - 1];
    const change = lastPrice - firstPrice;
    const percentage = (change / firstPrice) * 100;
    
    return { change, percentage };
  };

  const { change, percentage } = calculatePriceChange();
  const isPositive = change >= 0;

  return (
    <div className="card">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold">{ticker}</h2>
          <div className="flex items-center mt-1">
            <span className="text-xl font-semibold">
              ${prices.length ? prices[prices.length - 1].toFixed(2) : 'N/A'}
            </span>
            <span
              className={`ml-2 px-2 py-1 rounded text-sm font-medium ${isPositive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
            >
              {isPositive ? '+' : ''}{change.toFixed(2)} ({isPositive ? '+' : ''}{percentage.toFixed(2)}%)
            </span>
          </div>
        </div>
        <div className="flex space-x-2 mt-4 md:mt-0">
          <button
            onClick={() => setTimeRange('1w')}
            className={`px-3 py-1 rounded-md text-sm ${timeRange === '1w' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            1W
          </button>
          <button
            onClick={() => setTimeRange('1m')}
            className={`px-3 py-1 rounded-md text-sm ${timeRange === '1m' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            1M
          </button>
          <button
            onClick={() => setTimeRange('3m')}
            className={`px-3 py-1 rounded-md text-sm ${timeRange === '3m' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            3M
          </button>
          <button
            onClick={() => setTimeRange('6m')}
            className={`px-3 py-1 rounded-md text-sm ${timeRange === '6m' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            6M
          </button>
          <button
            onClick={() => setTimeRange('1y')}
            className={`px-3 py-1 rounded-md text-sm ${timeRange === '1y' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            1Y
          </button>
          <button
            onClick={() => setTimeRange('all')}
            className={`px-3 py-1 rounded-md text-sm ${timeRange === 'all' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            All
          </button>
        </div>
      </div>
      <div className="h-80">
        {stockData && dates.length > 0 ? (
          <Line data={chartData} options={chartOptions} />
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mb-2"></div>
              <p className="text-gray-500">Loading stock data...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockChart;