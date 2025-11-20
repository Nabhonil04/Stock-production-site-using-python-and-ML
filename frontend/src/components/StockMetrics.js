import React from 'react';
import { Card, Row, Col, Badge } from 'react-bootstrap';

const StockMetrics = ({ metrics }) => {
  if (!metrics) return null;

  // Format number to 2 decimal places
  const formatNumber = (num) => {
    return num ? Number(num).toFixed(2) : 'N/A';
  };

  // Determine RSI status
  const getRsiStatus = (rsi) => {
    if (!rsi) return { text: 'N/A', variant: 'secondary' };
    if (rsi < 30) return { text: 'Oversold', variant: 'danger' };
    if (rsi > 70) return { text: 'Overbought', variant: 'warning' };
    return { text: 'Neutral', variant: 'success' };
  };

  // Determine MACD status
  const getMacdStatus = (macd) => {
    if (!macd || !macd.histogram) return { text: 'N/A', variant: 'secondary' };
    if (macd.histogram > 0) return { text: 'Bullish', variant: 'success' };
    return { text: 'Bearish', variant: 'danger' };
  };

  // Determine price position relative to EMAs
  const getEmaStatus = (price, ema) => {
    if (!price || !ema) return { text: 'N/A', variant: 'secondary' };
    if (price > ema) return { text: 'Above', variant: 'success' };
    return { text: 'Below', variant: 'danger' };
  };

  // Determine Bollinger Bands status
  const getBollingerStatus = (price, bands) => {
    if (!price || !bands) return { text: 'N/A', variant: 'secondary' };
    if (price > bands.upper) return { text: 'Above Upper', variant: 'warning' };
    if (price < bands.lower) return { text: 'Below Lower', variant: 'danger' };
    return { text: 'Within Bands', variant: 'success' };
  };

  const rsiStatus = getRsiStatus(metrics.rsi);
  const macdStatus = getMacdStatus(metrics.macd);
  const ema20Status = getEmaStatus(metrics.currentPrice, metrics.ema20);
  const ema50Status = getEmaStatus(metrics.currentPrice, metrics.ema50);
  const ema200Status = getEmaStatus(metrics.currentPrice, metrics.ema200);
  const bollingerStatus = getBollingerStatus(metrics.currentPrice, metrics.bollingerBands);

  return (
    <Card className="mb-4">
      <Card.Header className="bg-primary text-white">
        <h5 className="mb-0">Real-Time Technical Metrics</h5>
      </Card.Header>
      <Card.Body>
        <Row className="mb-3">
          <Col md={6}>
            <h6>Price Metrics</h6>
            <div className="d-flex justify-content-between mb-2">
              <span>Current Price:</span>
              <strong>${formatNumber(metrics.currentPrice)}</strong>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span>52-Week High:</span>
              <strong>${formatNumber(metrics.high52Week)}</strong>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span>52-Week Low:</span>
              <strong>${formatNumber(metrics.low52Week)}</strong>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span>ATR:</span>
              <strong>{formatNumber(metrics.atr)}</strong>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span>VWAP:</span>
              <strong>${formatNumber(metrics.vwap)}</strong>
            </div>
          </Col>
          <Col md={6}>
            <h6>Momentum Indicators</h6>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span>RSI (14):</span>
              <div>
                <strong className="me-2">{formatNumber(metrics.rsi)}</strong>
                <Badge bg={rsiStatus.variant}>{rsiStatus.text}</Badge>
              </div>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span>MACD:</span>
              <div>
                <strong className="me-2">{metrics.macd ? formatNumber(metrics.macd.macdLine) : 'N/A'}</strong>
                <Badge bg={macdStatus.variant}>{macdStatus.text}</Badge>
              </div>
            </div>
          </Col>
        </Row>
        <Row>
          <Col md={6}>
            <h6>Moving Averages</h6>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span>EMA 20:</span>
              <div>
                <strong className="me-2">${formatNumber(metrics.ema20)}</strong>
                <Badge bg={ema20Status.variant}>{ema20Status.text}</Badge>
              </div>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span>EMA 50:</span>
              <div>
                <strong className="me-2">${formatNumber(metrics.ema50)}</strong>
                <Badge bg={ema50Status.variant}>{ema50Status.text}</Badge>
              </div>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span>EMA 200:</span>
              <div>
                <strong className="me-2">${formatNumber(metrics.ema200)}</strong>
                <Badge bg={ema200Status.variant}>{ema200Status.text}</Badge>
              </div>
            </div>
          </Col>
          <Col md={6}>
            <h6>Volatility Indicators</h6>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span>Bollinger Bands:</span>
              <Badge bg={bollingerStatus.variant}>{bollingerStatus.text}</Badge>
            </div>
            {metrics.bollingerBands && (
              <>
                <div className="d-flex justify-content-between mb-2">
                  <span>Upper Band:</span>
                  <strong>${formatNumber(metrics.bollingerBands.upper)}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Middle Band:</span>
                  <strong>${formatNumber(metrics.bollingerBands.middle)}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Lower Band:</span>
                  <strong>${formatNumber(metrics.bollingerBands.lower)}</strong>
                </div>
              </>
            )}
          </Col>
        </Row>
        <div className="mt-2 text-muted small">
          <em>All metrics are calculated in real-time based on latest market data</em>
        </div>
      </Card.Body>
    </Card>
  );
};

export default StockMetrics;