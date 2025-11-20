import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ModelComparison = ({ metrics, ticker }) => {
  const [metricType, setMetricType] = useState('accuracy'); // Default to accuracy

  if (!metrics) {
    return (
      <div className="card animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-40 bg-gray-200 rounded mb-4"></div>
        <div className="h-6 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  // Format model names for display
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

  // Prepare data for the chart
  const prepareChartData = () => {
    const modelNames = Object.keys(metrics.models).map(model => formatModelName(model));
    
    let values;
    let label;
    
    switch (metricType) {
      case 'accuracy':
        values = Object.values(metrics.models).map(model => model.accuracy);
        label = 'Directional Accuracy';
        break;
      case 'precision':
        values = Object.values(metrics.models).map(model => model.precision_up);
        label = 'Precision (Up)';
        break;
      case 'recall':
        values = Object.values(metrics.models).map(model => model.recall_up);
        label = 'Recall (Up)';
        break;
      default:
        values = Object.values(metrics.models).map(model => model.accuracy);
        label = 'Directional Accuracy';
    }

    // Find the best model for the current metric
    const bestModelIndex = values.indexOf(Math.max(...values));
    
    // Create colors array with the best model highlighted
    const backgroundColors = values.map((_, index) => 
      index === bestModelIndex ? 'rgba(0, 120, 255, 0.8)' : 'rgba(0, 120, 255, 0.4)'
    );
    
    const borderColors = values.map((_, index) => 
      index === bestModelIndex ? 'rgba(0, 120, 255, 1)' : 'rgba(0, 120, 255, 0.6)'
    );

    return {
      labels: modelNames,
      datasets: [
        {
          label,
          data: values.map(val => (val * 100).toFixed(1)),
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 1,
        },
      ],
    };
  };

  const chartData = prepareChartData();

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y}%`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value) {
            return value + '%';
          },
        },
      },
    },
  };

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Model Comparison for {ticker}</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setMetricType('accuracy')}
            className={`px-3 py-1 rounded-md text-sm ${metricType === 'accuracy' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Accuracy
          </button>
          <button
            onClick={() => setMetricType('precision')}
            className={`px-3 py-1 rounded-md text-sm ${metricType === 'precision' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Precision
          </button>
          <button
            onClick={() => setMetricType('recall')}
            className={`px-3 py-1 rounded-md text-sm ${metricType === 'recall' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Recall
          </button>
        </div>
      </div>
      
      <div className="h-64 mb-4">
        <Bar data={chartData} options={chartOptions} />
      </div>
      
      <div className="text-sm text-gray-500">
        <p>Validation period: {metrics.validation_period}</p>
        <p>Baseline accuracy ("tomorrow same as today"): {(metrics.baseline_accuracy * 100).toFixed(1)}%</p>
      </div>
    </div>
  );
};

export default ModelComparison;