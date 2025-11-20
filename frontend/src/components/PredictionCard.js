import React from 'react';

const PredictionCard = ({ prediction, ticker }) => {
  if (!prediction) {
    return (
      <div className="card animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-24 bg-gray-200 rounded mb-4"></div>
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-6 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  const {
    horizon,
    prediction: direction,
    confidence,
    accuracy_target,
    model_scores,
    best_model
  } = prediction;

  // Format horizon for display
  const formatHorizon = (horizon) => {
    switch (horizon) {
      case '1d':
        return 'Next Day';
      case '5d':
        return 'Next 5 Days';
      default:
        return horizon;
    }
  };

  // Determine color based on prediction direction
  const directionBg = direction === 'up' ? 'bg-success' : 'bg-danger';
  const directionIcon = direction === 'up' ? (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );

  // Calculate confidence level class
  const getConfidenceClass = (confidence) => {
    if (confidence >= 0.75) return 'bg-green-100 text-green-800';
    if (confidence >= 0.65) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  // Format confidence as percentage
  const confidencePercentage = (confidence * 100).toFixed(0);

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">{formatHorizon(horizon)} Prediction for {ticker}</h3>
      
      <div className="flex items-center justify-center mb-6">
        <div className={`${directionBg} text-white rounded-full p-4 flex items-center justify-center w-24 h-24`}>
          <div className="text-center">
            {directionIcon}
            <span className="block font-bold uppercase">{direction}</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500 mb-1">Confidence</p>
          <div className={`inline-block px-2 py-1 rounded ${getConfidenceClass(confidence)}`}>
            {confidencePercentage}%
          </div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500 mb-1">Target Accuracy</p>
          <div className="font-semibold">{accuracy_target}</div>
        </div>
      </div>
      
      <div className="mt-6">
        <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Model Performance</h4>
        <div className="space-y-2">
          {model_scores && Object.entries(model_scores).map(([model, score]) => (
            <div key={model} className="flex items-center">
              <div className="w-32 text-sm">{formatModelName(model)}</div>
              <div className="flex-grow">
                <div className="bg-gray-200 rounded-full h-2 w-full">
                  <div
                    className={`h-2 rounded-full ${model === best_model ? 'bg-primary' : 'bg-gray-400'}`}
                    style={{ width: `${score * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="w-12 text-right text-sm">{(score * 100).toFixed(0)}%</div>
            </div>
          ))}
        </div>
        <div className="mt-2 text-sm text-gray-500">
          Best model: <span className="font-semibold text-primary">{formatModelName(best_model || '')}</span>
        </div>
      </div>
    </div>
  );
};

// Helper function to format model names for display
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

export default PredictionCard;