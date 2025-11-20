import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import healthMonitor from './services/healthMonitor';
import { stockService } from './services/stockService';

// Make services available globally for the health monitor
window.stockService = stockService;
window.initializeWebSocket = stockService.initializeWebSocket;

// Create root component and store reference for health monitor
const root = ReactDOM.createRoot(document.getElementById('root'));
const AppWithRef = () => {
  const appRef = React.useRef(null);
  
  // Store reference to root component for health monitor
  React.useEffect(() => {
    window.rootComponent = appRef.current;
  }, []);
  
  return (
    <React.StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <App ref={appRef} />
        </AuthProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
};

root.render(<AppWithRef />);

// Start the health monitor service
healthMonitor.start();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();