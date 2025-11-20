import axios from 'axios';

// Health Monitor Service - Self-healing agent for the stock application
class HealthMonitor {
  constructor() {
    this.isRunning = false;
    this.checkInterval = 5 * 60 * 1000; // 5 minutes in milliseconds
    this.monitorIntervalId = null;
    this.lastCheckTime = null;
    this.healthStatus = {
      api: { status: 'unknown', lastCheck: null, errors: [] },
      websocket: { status: 'unknown', lastCheck: null, errors: [] },
      ui: { status: 'unknown', lastCheck: null, errors: [] },
      dataIntegrity: { status: 'unknown', lastCheck: null, errors: [] }
    };
    this.recoveryAttempts = {};
    this.maxRecoveryAttempts = 3;
    this.errorLog = [];
  }

  // Start the health monitoring service
  start() {
    if (this.isRunning) {
      console.log('Health monitor is already running');
      return;
    }

    console.log('Starting health monitor service');
    this.isRunning = true;
    
    // Run an immediate check
    this.runHealthCheck();
    
    // Set up interval for regular checks
    this.monitorIntervalId = setInterval(() => {
      this.runHealthCheck();
    }, this.checkInterval);
    
    // Add event listeners for unhandled errors
    window.addEventListener('error', this.handleGlobalError.bind(this));
    window.addEventListener('unhandledrejection', this.handlePromiseRejection.bind(this));
    
    return this;
  }

  // Stop the health monitoring service
  stop() {
    if (!this.isRunning) {
      return;
    }
    
    console.log('Stopping health monitor service');
    this.isRunning = false;
    
    if (this.monitorIntervalId) {
      clearInterval(this.monitorIntervalId);
      this.monitorIntervalId = null;
    }
    
    // Remove event listeners
    window.removeEventListener('error', this.handleGlobalError.bind(this));
    window.removeEventListener('unhandledrejection', this.handlePromiseRejection.bind(this));
  }

  // Run a comprehensive health check
  async runHealthCheck() {
    console.log('Running health check');
    this.lastCheckTime = new Date();
    
    try {
      // Check API connectivity
      await this.checkApiHealth();
      
      // Check WebSocket connectivity
      this.checkWebSocketHealth();
      
      // Check UI rendering
      this.checkUIHealth();
      
      // Check data integrity
      this.checkDataIntegrity();
      
      console.log('Health check completed', this.healthStatus);
    } catch (error) {
      console.error('Error during health check:', error);
      this.logError('health_check', error.message);
    }
  }

  // Check API connectivity
  async checkApiHealth() {
    try {
      // Try to fetch a simple endpoint to verify API connectivity
      const apiEndpoints = [
        { url: '/api/health', fallback: '/api/stocks' },
        { url: '/api/stocks', fallback: null }
      ];
      
      let success = false;
      
      for (const endpoint of apiEndpoints) {
        try {
          const response = await axios.get(endpoint.url, { timeout: 5000 });
          if (response.status >= 200 && response.status < 300) {
            success = true;
            break;
          }
        } catch (err) {
          if (endpoint.fallback) {
            console.warn(`Failed to reach ${endpoint.url}, trying fallback`);
            continue;
          }
        }
      }
      
      if (success) {
        this.healthStatus.api = { 
          status: 'healthy', 
          lastCheck: new Date(),
          errors: []
        };
      } else {
        throw new Error('All API endpoints failed');
      }
    } catch (error) {
      this.healthStatus.api = { 
        status: 'unhealthy', 
        lastCheck: new Date(),
        errors: [...(this.healthStatus.api.errors || []).slice(-4), error.message]
      };
      
      this.logError('api', error.message);
      await this.attemptApiRecovery();
    }
  }

  // Check WebSocket connectivity
  checkWebSocketHealth() {
    try {
      // Get the WebSocket from the stockService
      const socket = window.stockWebSocket;
      
      if (!socket) {
        throw new Error('WebSocket not initialized');
      }
      
      if (socket.readyState === WebSocket.OPEN) {
        this.healthStatus.websocket = { 
          status: 'healthy', 
          lastCheck: new Date(),
          errors: []
        };
      } else if (socket.readyState === WebSocket.CONNECTING) {
        this.healthStatus.websocket = { 
          status: 'connecting', 
          lastCheck: new Date(),
          errors: []
        };
      } else {
        throw new Error(`WebSocket in unhealthy state: ${socket.readyState}`);
      }
    } catch (error) {
      this.healthStatus.websocket = { 
        status: 'unhealthy', 
        lastCheck: new Date(),
        errors: [...(this.healthStatus.websocket.errors || []).slice(-4), error.message]
      };
      
      this.logError('websocket', error.message);
      this.attemptWebSocketRecovery();
    }
  }

  // Check UI rendering health
  checkUIHealth() {
    try {
      // Check for critical UI elements
      const criticalElements = [
        { selector: '#root', name: 'Root container' },
        { selector: '.navbar', name: 'Navigation bar' },
        { selector: '.container', name: 'Main container' }
      ];
      
      const missingElements = criticalElements.filter(
        element => !document.querySelector(element.selector)
      );
      
      if (missingElements.length > 0) {
        throw new Error(`Missing UI elements: ${missingElements.map(e => e.name).join(', ')}`);
      }
      
      // Check for React rendering errors
      const errorElements = document.querySelectorAll('[data-error]');
      if (errorElements.length > 0) {
        throw new Error(`Found ${errorElements.length} UI error indicators`);
      }
      
      this.healthStatus.ui = { 
        status: 'healthy', 
        lastCheck: new Date(),
        errors: []
      };
    } catch (error) {
      this.healthStatus.ui = { 
        status: 'unhealthy', 
        lastCheck: new Date(),
        errors: [...(this.healthStatus.ui.errors || []).slice(-4), error.message]
      };
      
      this.logError('ui', error.message);
      this.attemptUIRecovery();
    }
  }

  // Check data integrity
  checkDataIntegrity() {
    try {
      // Check localStorage for corruption
      try {
        const watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');
        if (!Array.isArray(watchlist)) {
          throw new Error('Watchlist is not an array');
        }
      } catch (e) {
        throw new Error(`LocalStorage data corruption: ${e.message}`);
      }
      
      // Check stock data cache integrity
      if (window.stockService && window.stockService.stockDataCache) {
        const cache = window.stockService.stockDataCache;
        const cacheKeys = Object.keys(cache);
        
        if (cacheKeys.length > 0) {
          // Verify a random stock has the expected properties
          const randomStock = cache[cacheKeys[Math.floor(Math.random() * cacheKeys.length)]];
          const requiredProps = ['symbol', 'price', 'change', 'changePercent'];
          
          const missingProps = requiredProps.filter(prop => !(prop in randomStock));
          if (missingProps.length > 0) {
            throw new Error(`Stock data missing properties: ${missingProps.join(', ')}`);
          }
        }
      }
      
      this.healthStatus.dataIntegrity = { 
        status: 'healthy', 
        lastCheck: new Date(),
        errors: []
      };
    } catch (error) {
      this.healthStatus.dataIntegrity = { 
        status: 'unhealthy', 
        lastCheck: new Date(),
        errors: [...(this.healthStatus.dataIntegrity.errors || []).slice(-4), error.message]
      };
      
      this.logError('data_integrity', error.message);
      this.attemptDataRecovery();
    }
  }

  // Handle global errors
  handleGlobalError(event) {
    const { message, filename, lineno, colno, error } = event;
    this.logError('global', `${message} at ${filename}:${lineno}:${colno}`);
    
    // Attempt recovery based on error type
    if (message.includes('WebSocket') || message.includes('socket')) {
      this.attemptWebSocketRecovery();
    } else if (message.includes('API') || message.includes('fetch') || message.includes('axios')) {
      this.attemptApiRecovery();
    } else if (message.includes('render') || message.includes('React')) {
      this.attemptUIRecovery();
    }
    
    // Don't prevent default error handling
    return false;
  }

  // Handle unhandled promise rejections
  handlePromiseRejection(event) {
    const { reason } = event;
    const message = reason instanceof Error ? reason.message : String(reason);
    this.logError('promise', message);
    
    // Attempt recovery based on error type
    if (message.includes('WebSocket') || message.includes('socket')) {
      this.attemptWebSocketRecovery();
    } else if (message.includes('API') || message.includes('fetch') || message.includes('axios')) {
      this.attemptApiRecovery();
    }
    
    // Don't prevent default error handling
    return false;
  }

  // Log an error
  logError(category, message) {
    const error = {
      category,
      message,
      timestamp: new Date(),
      url: window.location.href
    };
    
    this.errorLog.push(error);
    
    // Keep error log from growing too large
    if (this.errorLog.length > 100) {
      this.errorLog = this.errorLog.slice(-100);
    }
    
    console.error(`[HealthMonitor] ${category} error:`, message);
  }

  // Attempt to recover API connectivity
  async attemptApiRecovery() {
    const recoveryKey = 'api';
    this.recoveryAttempts[recoveryKey] = (this.recoveryAttempts[recoveryKey] || 0) + 1;
    
    if (this.recoveryAttempts[recoveryKey] > this.maxRecoveryAttempts) {
      console.warn('Max API recovery attempts reached, waiting for next health check');
      return;
    }
    
    console.log('Attempting API recovery');
    
    try {
      // Clear any cached API data
      if (window.stockService) {
        window.stockService.lastCacheRefresh = 0;
      }
      
      // Force a new API request
      if (window.stockService && window.stockService.getTrendingStocks) {
        await window.stockService.getTrendingStocks(5);
        console.log('API recovery successful');
        
        // Reset recovery counter on success
        this.recoveryAttempts[recoveryKey] = 0;
      }
    } catch (error) {
      console.error('API recovery failed:', error);
    }
  }

  // Attempt to recover WebSocket connectivity
  attemptWebSocketRecovery() {
    const recoveryKey = 'websocket';
    this.recoveryAttempts[recoveryKey] = (this.recoveryAttempts[recoveryKey] || 0) + 1;
    
    if (this.recoveryAttempts[recoveryKey] > this.maxRecoveryAttempts) {
      console.warn('Max WebSocket recovery attempts reached, waiting for next health check');
      return;
    }
    
    console.log('Attempting WebSocket recovery');
    
    try {
      // Close existing socket if it exists
      if (window.stockWebSocket && window.stockWebSocket.close) {
        window.stockWebSocket.close();
      }
      
      // Reinitialize WebSocket
      if (window.initializeWebSocket) {
        window.initializeWebSocket();
        console.log('WebSocket recovery initiated');
        
        // Check if recovery was successful after a short delay
        setTimeout(() => {
          if (window.stockWebSocket && window.stockWebSocket.readyState === WebSocket.OPEN) {
            console.log('WebSocket recovery successful');
            this.recoveryAttempts[recoveryKey] = 0;
          }
        }, 3000);
      }
    } catch (error) {
      console.error('WebSocket recovery failed:', error);
    }
  }

  // Attempt to recover UI rendering
  attemptUIRecovery() {
    const recoveryKey = 'ui';
    this.recoveryAttempts[recoveryKey] = (this.recoveryAttempts[recoveryKey] || 0) + 1;
    
    if (this.recoveryAttempts[recoveryKey] > this.maxRecoveryAttempts) {
      console.warn('Max UI recovery attempts reached, waiting for next health check');
      return;
    }
    
    console.log('Attempting UI recovery');
    
    try {
      // Force a re-render by updating the URL hash
      window.location.hash = `#refresh-${Date.now()}`;
      
      // If React is available, try to force update the root component
      if (window.rootComponent && window.rootComponent.forceUpdate) {
        window.rootComponent.forceUpdate();
      }
      
      console.log('UI recovery initiated');
    } catch (error) {
      console.error('UI recovery failed:', error);
    }
  }

  // Attempt to recover data integrity
  attemptDataRecovery() {
    const recoveryKey = 'data';
    this.recoveryAttempts[recoveryKey] = (this.recoveryAttempts[recoveryKey] || 0) + 1;
    
    if (this.recoveryAttempts[recoveryKey] > this.maxRecoveryAttempts) {
      console.warn('Max data recovery attempts reached, waiting for next health check');
      return;
    }
    
    console.log('Attempting data recovery');
    
    try {
      // Fix localStorage if corrupted
      try {
        const watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');
        if (!Array.isArray(watchlist)) {
          localStorage.setItem('watchlist', '[]');
        }
      } catch (e) {
        localStorage.setItem('watchlist', '[]');
      }
      
      // Reset stock data cache if corrupted
      if (window.stockService) {
        window.stockService.stockDataCache = {};
        window.stockService.lastCacheRefresh = 0;
      }
      
      console.log('Data recovery completed');
    } catch (error) {
      console.error('Data recovery failed:', error);
    }
  }

  // Get current health status
  getStatus() {
    const overallStatus = Object.values(this.healthStatus).every(
      component => component.status === 'healthy'
    ) ? 'healthy' : 'unhealthy';
    
    return {
      overall: overallStatus,
      components: this.healthStatus,
      lastCheck: this.lastCheckTime,
      errorLog: this.errorLog.slice(-10) // Return last 10 errors
    };
  }
}

// Create singleton instance
const healthMonitor = new HealthMonitor();

// Export the health monitor service
export default healthMonitor;