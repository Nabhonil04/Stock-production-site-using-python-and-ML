// Real-time calculation service for stock metrics

// Calculate Relative Strength Index (RSI)
export const calculateRSI = (prices, period = 14) => {
  if (!prices || prices.length < period + 1) {
    return null;
  }

  let gains = 0;
  let losses = 0;

  // Calculate initial average gain and loss
  for (let i = 1; i <= period; i++) {
    const change = prices[i] - prices[i - 1];
    if (change >= 0) {
      gains += change;
    } else {
      losses -= change;
    }
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  // Calculate RSI for the remaining prices
  const rsiValues = [];
  for (let i = period + 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    
    // Update average gain and loss using smoothing method
    avgGain = ((avgGain * (period - 1)) + (change > 0 ? change : 0)) / period;
    avgLoss = ((avgLoss * (period - 1)) + (change < 0 ? -change : 0)) / period;
    
    // Calculate RS and RSI
    const rs = avgGain / (avgLoss === 0 ? 0.001 : avgLoss); // Avoid division by zero
    const rsi = 100 - (100 / (1 + rs));
    
    rsiValues.push(rsi);
  }

  return rsiValues.length > 0 ? rsiValues[rsiValues.length - 1] : null;
};

// Calculate Moving Average Convergence Divergence (MACD)
export const calculateMACD = (prices, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) => {
  if (!prices || prices.length < slowPeriod + signalPeriod) {
    return null;
  }

  // Calculate EMAs
  const fastEMA = calculateEMA(prices, fastPeriod);
  const slowEMA = calculateEMA(prices, slowPeriod);
  
  if (!fastEMA || !slowEMA) {
    return null;
  }

  // Calculate MACD line
  const macdLine = fastEMA - slowEMA;
  
  // Calculate signal line (9-day EMA of MACD line)
  const macdHistory = [];
  for (let i = slowPeriod - 1; i < prices.length; i++) {
    macdHistory.push(calculateEMA(prices.slice(0, i + 1), fastPeriod) - calculateEMA(prices.slice(0, i + 1), slowPeriod));
  }
  
  const signalLine = calculateEMA(macdHistory, signalPeriod);
  
  // Calculate histogram
  const histogram = macdLine - signalLine;

  return {
    macdLine,
    signalLine,
    histogram
  };
};

// Calculate Exponential Moving Average (EMA)
export const calculateEMA = (prices, period) => {
  if (!prices || prices.length < period) {
    return null;
  }

  // Calculate initial SMA
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += prices[i];
  }
  let ema = sum / period;

  // Calculate multiplier
  const multiplier = 2 / (period + 1);

  // Calculate EMA for remaining prices
  for (let i = period; i < prices.length; i++) {
    ema = (prices[i] - ema) * multiplier + ema;
  }

  return ema;
};

// Calculate Bollinger Bands
export const calculateBollingerBands = (prices, period = 20, stdDev = 2) => {
  if (!prices || prices.length < period) {
    return null;
  }

  // Calculate SMA
  let sum = 0;
  for (let i = prices.length - period; i < prices.length; i++) {
    sum += prices[i];
  }
  const sma = sum / period;

  // Calculate standard deviation
  let sumSquaredDiff = 0;
  for (let i = prices.length - period; i < prices.length; i++) {
    sumSquaredDiff += Math.pow(prices[i] - sma, 2);
  }
  const standardDeviation = Math.sqrt(sumSquaredDiff / period);

  // Calculate upper and lower bands
  const upperBand = sma + (standardDeviation * stdDev);
  const lowerBand = sma - (standardDeviation * stdDev);

  return {
    middle: sma,
    upper: upperBand,
    lower: lowerBand
  };
};

// Calculate Average True Range (ATR)
export const calculateATR = (highs, lows, closes, period = 14) => {
  if (!highs || !lows || !closes || highs.length < period + 1) {
    return null;
  }

  // Calculate true ranges
  const trueRanges = [];
  for (let i = 1; i < highs.length; i++) {
    const tr1 = highs[i] - lows[i];
    const tr2 = Math.abs(highs[i] - closes[i - 1]);
    const tr3 = Math.abs(lows[i] - closes[i - 1]);
    trueRanges.push(Math.max(tr1, tr2, tr3));
  }

  // Calculate initial ATR
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += trueRanges[i];
  }
  let atr = sum / period;

  // Calculate ATR for remaining periods using smoothing method
  for (let i = period; i < trueRanges.length; i++) {
    atr = ((atr * (period - 1)) + trueRanges[i]) / period;
  }

  return atr;
};

// Calculate Volume Weighted Average Price (VWAP)
export const calculateVWAP = (prices, volumes) => {
  if (!prices || !volumes || prices.length !== volumes.length || prices.length === 0) {
    return null;
  }

  let cumulativeTPV = 0; // Total Price * Volume
  let cumulativeVolume = 0;

  for (let i = 0; i < prices.length; i++) {
    cumulativeTPV += prices[i] * volumes[i];
    cumulativeVolume += volumes[i];
  }

  return cumulativeVolume > 0 ? cumulativeTPV / cumulativeVolume : null;
};

// Calculate Fibonacci Retracement Levels
export const calculateFibonacciLevels = (highPrice, lowPrice) => {
  if (highPrice === undefined || lowPrice === undefined) {
    return null;
  }

  const diff = highPrice - lowPrice;
  
  return {
    level0: highPrice,
    level23_6: highPrice - (diff * 0.236),
    level38_2: highPrice - (diff * 0.382),
    level50: highPrice - (diff * 0.5),
    level61_8: highPrice - (diff * 0.618),
    level78_6: highPrice - (diff * 0.786),
    level100: lowPrice
  };
};

// Calculate all metrics for a stock
export const calculateAllMetrics = (historicalData) => {
  if (!historicalData || !historicalData.prices || historicalData.prices.length < 30) {
    return null;
  }

  const prices = historicalData.prices;
  const volumes = historicalData.volumes || Array(prices.length).fill(1000000);
  const highs = historicalData.highs || prices.map(p => p * 1.01);
  const lows = historicalData.lows || prices.map(p => p * 0.99);

  // Get the latest price
  const currentPrice = prices[prices.length - 1];
  
  // Calculate 52-week high and low
  const yearPrices = prices.slice(-252); // Approximately 252 trading days in a year
  const high52Week = Math.max(...yearPrices);
  const low52Week = Math.min(...yearPrices);

  return {
    currentPrice,
    high52Week,
    low52Week,
    rsi: calculateRSI(prices),
    macd: calculateMACD(prices),
    ema20: calculateEMA(prices, 20),
    ema50: calculateEMA(prices, 50),
    ema200: calculateEMA(prices, 200),
    bollingerBands: calculateBollingerBands(prices),
    atr: calculateATR(highs, lows, prices),
    vwap: calculateVWAP(prices, volumes),
    fibonacciLevels: calculateFibonacciLevels(high52Week, low52Week)
  };
};

// Real-time calculation service
const calculationService = {
  calculateRSI,
  calculateMACD,
  calculateEMA,
  calculateBollingerBands,
  calculateATR,
  calculateVWAP,
  calculateFibonacciLevels,
  calculateAllMetrics
};

export default calculationService;