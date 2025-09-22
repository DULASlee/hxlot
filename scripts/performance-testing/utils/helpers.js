/**
 * K6 Authentication and Utility Helpers
 * Stage 6.2 Performance Testing Framework
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { config } from '../config/k6-config.js';

// Authentication Helper
export class AuthHelper {
  constructor() {
    this.tokens = new Map();
    this.refreshTokens = new Map();
  }

  /**
   * Authenticate user and get JWT token
   */
  login(username, password) {
    const loginPayload = {
      username: username,
      password: password,
      rememberMe: true
    };

    const response = http.post(`${config.apiUrl}/auth/login`, JSON.stringify(loginPayload), {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const success = check(response, {
      'login successful': (r) => r.status === 200,
      'login response time < 2s': (r) => r.timings.duration < 2000,
      'has access token': (r) => r.json('accessToken') !== undefined
    });

    if (success) {
      const responseData = response.json();
      this.tokens.set(username, responseData.accessToken);
      this.refreshTokens.set(username, responseData.refreshToken);
      
      return {
        accessToken: responseData.accessToken,
        refreshToken: responseData.refreshToken,
        expiresIn: responseData.expiresIn
      };
    }

    throw new Error(`Login failed for ${username}: ${response.status} ${response.body}`);
  }

  /**
   * Get stored token for user
   */
  getToken(username) {
    return this.tokens.get(username);
  }

  /**
   * Refresh JWT token
   */
  refreshToken(username) {
    const refreshToken = this.refreshTokens.get(username);
    if (!refreshToken) {
      throw new Error(`No refresh token found for ${username}`);
    }

    const response = http.post(`${config.apiUrl}/auth/refresh-token`, null, {
      headers: {
        'Authorization': `Bearer ${this.tokens.get(username)}`,
        'Refresh-Token': refreshToken
      }
    });

    const success = check(response, {
      'token refresh successful': (r) => r.status === 200,
      'refresh response time < 1s': (r) => r.timings.duration < 1000
    });

    if (success) {
      const responseData = response.json();
      this.tokens.set(username, responseData.accessToken);
      this.refreshTokens.set(username, responseData.refreshToken);
      return responseData.accessToken;
    }

    throw new Error(`Token refresh failed for ${username}: ${response.status}`);
  }

  /**
   * Logout user
   */
  logout(username) {
    const token = this.tokens.get(username);
    if (!token) return;

    const response = http.post(`${config.apiUrl}/auth/logout`, null, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    check(response, {
      'logout successful': (r) => r.status === 200 || r.status === 401
    });

    this.tokens.delete(username);
    this.refreshTokens.delete(username);
  }

  /**
   * Get authorization headers
   */
  getAuthHeaders(username) {
    const token = this.tokens.get(username);
    if (!token) {
      throw new Error(`No token found for ${username}. Please login first.`);
    }

    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }
}

// API Helper
export class ApiHelper {
  constructor(authHelper) {
    this.auth = authHelper;
  }

  /**
   * Make authenticated GET request
   */
  get(endpoint, username, params = {}) {
    const url = new URL(`${config.apiUrl}${endpoint}`);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

    const response = http.get(url.toString(), {
      headers: this.auth.getAuthHeaders(username)
    });

    check(response, {
      [`GET ${endpoint} successful`]: (r) => r.status >= 200 && r.status < 300,
      [`GET ${endpoint} response time < 2s`]: (r) => r.timings.duration < 2000
    });

    return response;
  }

  /**
   * Make authenticated POST request
   */
  post(endpoint, username, data = {}) {
    const response = http.post(`${config.apiUrl}${endpoint}`, JSON.stringify(data), {
      headers: this.auth.getAuthHeaders(username)
    });

    check(response, {
      [`POST ${endpoint} successful`]: (r) => r.status >= 200 && r.status < 300,
      [`POST ${endpoint} response time < 2s`]: (r) => r.timings.duration < 2000
    });

    return response;
  }

  /**
   * Make authenticated PUT request
   */
  put(endpoint, username, data = {}) {
    const response = http.put(`${config.apiUrl}${endpoint}`, JSON.stringify(data), {
      headers: this.auth.getAuthHeaders(username)
    });

    check(response, {
      [`PUT ${endpoint} successful`]: (r) => r.status >= 200 && r.status < 300,
      [`PUT ${endpoint} response time < 2s`]: (r) => r.timings.duration < 2000
    });

    return response;
  }

  /**
   * Make authenticated DELETE request
   */
  delete(endpoint, username) {
    const response = http.del(`${config.apiUrl}${endpoint}`, null, {
      headers: this.auth.getAuthHeaders(username)
    });

    check(response, {
      [`DELETE ${endpoint} successful`]: (r) => r.status >= 200 && r.status < 300,
      [`DELETE ${endpoint} response time < 2s`]: (r) => r.timings.duration < 2000
    });

    return response;
  }
}

// Performance Monitoring Helper
export class PerformanceHelper {
  constructor() {
    this.metrics = [];
    this.startTime = Date.now();
  }

  /**
   * Start timing a operation
   */
  startTimer(operationName) {
    return {
      name: operationName,
      startTime: Date.now()
    };
  }

  /**
   * End timing and record metric
   */
  endTimer(timer) {
    const duration = Date.now() - timer.startTime;
    this.metrics.push({
      operation: timer.name,
      duration: duration,
      timestamp: new Date().toISOString()
    });
    return duration;
  }

  /**
   * Record custom metric
   */
  recordMetric(name, value, tags = {}) {
    this.metrics.push({
      name: name,
      value: value,
      tags: tags,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Get average response time for operation
   */
  getAverageResponseTime(operationName) {
    const operationMetrics = this.metrics.filter(m => m.operation === operationName);
    if (operationMetrics.length === 0) return 0;
    
    const total = operationMetrics.reduce((sum, m) => sum + m.duration, 0);
    return total / operationMetrics.length;
  }

  /**
   * Get performance summary
   */
  getSummary() {
    const totalDuration = Date.now() - this.startTime;
    const operations = [...new Set(this.metrics.map(m => m.operation))];
    
    const summary = {
      totalDuration: totalDuration,
      totalOperations: this.metrics.length,
      operationSummary: {}
    };

    operations.forEach(op => {
      const opMetrics = this.metrics.filter(m => m.operation === op);
      const durations = opMetrics.map(m => m.duration);
      
      summary.operationSummary[op] = {
        count: opMetrics.length,
        averageDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
        minDuration: Math.min(...durations),
        maxDuration: Math.max(...durations)
      };
    });

    return summary;
  }
}

// Data Generation Helper
export class DataGenerator {
  constructor() {
    this.userCounter = 0;
    this.alertCounter = 0;
    this.complianceCounter = 0;
  }

  /**
   * Generate random user data
   */
  generateUser() {
    this.userCounter++;
    const roles = config.testData.patterns.userRoles;
    
    return {
      id: `perf-user-${this.userCounter}`,
      username: `perfuser${this.userCounter}`,
      email: `perfuser${this.userCounter}@test.com`,
      displayName: `Performance User ${this.userCounter}`,
      role: roles[Math.floor(Math.random() * roles.length)],
      isActive: true,
      createdAt: new Date().toISOString()
    };
  }

  /**
   * Generate random security alert
   */
  generateAlert() {
    this.alertCounter++;
    const types = config.testData.patterns.alertTypes;
    const severities = config.testData.patterns.severityLevels;
    
    return {
      id: `perf-alert-${this.alertCounter}`,
      type: types[Math.floor(Math.random() * types.length)],
      severity: severities[Math.floor(Math.random() * severities.length)],
      description: `Performance test alert ${this.alertCounter} - automated generation`,
      timestamp: new Date().toISOString(),
      userInfo: {
        displayName: `Test User ${Math.floor(Math.random() * 1000)}`,
        userId: `user-${Math.floor(Math.random() * 1000)}`
      },
      isAcknowledged: Math.random() > 0.7, // 30% acknowledged
      riskScore: Math.floor(Math.random() * 100) + 1
    };
  }

  /**
   * Generate random compliance issue
   */
  generateComplianceIssue() {
    this.complianceCounter++;
    const types = config.testData.patterns.complianceTypes;
    const severities = config.testData.patterns.severityLevels;
    const statuses = ['Open', 'InProgress', 'Resolved', 'Dismissed'];
    
    return {
      id: `perf-compliance-${this.complianceCounter}`,
      type: types[Math.floor(Math.random() * types.length)],
      severity: severities[Math.floor(Math.random() * severities.length)],
      description: `Performance test compliance issue ${this.complianceCounter}`,
      affectedUsers: Math.floor(Math.random() * 100) + 1,
      detectedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(), // Random date within last 30 days
      status: statuses[Math.floor(Math.random() * statuses.length)]
    };
  }

  /**
   * Generate batch of test data
   */
  generateBatch(type, count) {
    const data = [];
    for (let i = 0; i < count; i++) {
      switch (type) {
        case 'user':
          data.push(this.generateUser());
          break;
        case 'alert':
          data.push(this.generateAlert());
          break;
        case 'compliance':
          data.push(this.generateComplianceIssue());
          break;
      }
    }
    return data;
  }
}

// Load Balancing Helper
export class LoadBalancer {
  constructor(endpoints) {
    this.endpoints = endpoints;
    this.currentIndex = 0;
  }

  /**
   * Get next endpoint in round-robin fashion
   */
  getNextEndpoint() {
    const endpoint = this.endpoints[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.endpoints.length;
    return endpoint;
  }

  /**
   * Get random endpoint
   */
  getRandomEndpoint() {
    return this.endpoints[Math.floor(Math.random() * this.endpoints.length)];
  }
}

// Error Handler
export class ErrorHandler {
  constructor() {
    this.errors = [];
  }

  /**
   * Handle and log error
   */
  handleError(error, context = {}) {
    const errorInfo = {
      message: error.message || error,
      context: context,
      timestamp: new Date().toISOString(),
      stack: error.stack
    };

    this.errors.push(errorInfo);
    console.error(`[ERROR] ${errorInfo.message}`, errorInfo.context);
  }

  /**
   * Get error summary
   */
  getErrorSummary() {
    const errorTypes = {};
    this.errors.forEach(error => {
      const type = error.message.split(':')[0] || 'Unknown';
      errorTypes[type] = (errorTypes[type] || 0) + 1;
    });

    return {
      totalErrors: this.errors.length,
      errorTypes: errorTypes,
      recentErrors: this.errors.slice(-10) // Last 10 errors
    };
  }
}

// Utility Functions
export function randomSleep(min = 1, max = 5) {
  const sleepTime = Math.random() * (max - min) + min;
  sleep(sleepTime);
}

export function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

export function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
  return `${(ms / 60000).toFixed(2)}m`;
}