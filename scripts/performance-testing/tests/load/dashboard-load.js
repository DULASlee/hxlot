/**
 * Security Dashboard Load Testing
 * Stage 6.2 Large-Scale Performance Testing
 * 
 * This test simulates realistic user behavior on the security dashboard
 * with varying load patterns and performance validation
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter, Gauge } from 'k6/metrics';
import { config } from '../config/k6-config.js';
import { 
  AuthHelper, 
  ApiHelper, 
  PerformanceHelper, 
  DataGenerator,
  randomSleep,
  getRandomElement 
} from '../utils/helpers.js';

// Custom Metrics
const dashboardLoadTime = new Trend('dashboard_load_time');
const alertProcessingTime = new Trend('alert_processing_time');
const complianceCheckTime = new Trend('compliance_check_time');
const authenticationTime = new Trend('authentication_time');
const errorRate = new Rate('error_rate');
const concurrentUsers = new Gauge('concurrent_users');
const dataTransferRate = new Trend('data_transfer_rate');

// Test Configuration
export const options = {
  scenarios: {
    // Baseline Dashboard Load Test
    dashboard_baseline: {
      executor: 'constant-vus',
      vus: 20,
      duration: '10m',
      tags: { test_type: 'baseline', component: 'dashboard' }
    },
    
    // Gradual Load Increase
    dashboard_ramp: {
      executor: 'ramping-vus',
      startVUs: 5,
      stages: [
        { duration: '3m', target: 25 },   // Ramp up to 25 users
        { duration: '5m', target: 50 },   // Increase to 50 users
        { duration: '10m', target: 100 }, // Peak at 100 users
        { duration: '5m', target: 50 },   // Scale down to 50
        { duration: '3m', target: 0 }     // Ramp down
      ],
      tags: { test_type: 'load', component: 'dashboard' }
    },
    
    // High Load Dashboard Test
    dashboard_stress: {
      executor: 'ramping-vus',
      startVUs: 10,
      stages: [
        { duration: '2m', target: 50 },   // Quick ramp to baseline
        { duration: '5m', target: 150 },  // Stress level
        { duration: '10m', target: 200 }, // Maximum stress
        { duration: '2m', target: 0 }     // Quick ramp down
      ],
      tags: { test_type: 'stress', component: 'dashboard' }
    },
    
    // Spike Testing
    dashboard_spike: {
      executor: 'ramping-vus',
      startVUs: 10,
      stages: [
        { duration: '1m', target: 20 },   // Normal load
        { duration: '30s', target: 150 }, // Sudden spike
        { duration: '1m', target: 20 },   // Back to normal
        { duration: '30s', target: 200 }, // Larger spike
        { duration: '1m', target: 0 }     // Ramp down
      ],
      tags: { test_type: 'spike', component: 'dashboard' }
    }
  },
  
  thresholds: {
    // Response time thresholds
    'http_req_duration': ['p(95)<3000', 'p(99)<5000'],
    'dashboard_load_time': ['p(95)<4000', 'avg<2000'],
    'alert_processing_time': ['p(95)<1500', 'avg<800'],
    'authentication_time': ['p(95)<2000', 'avg<1000'],
    'compliance_check_time': ['p(95)<2500', 'avg<1200'],
    
    // Error rate thresholds
    'http_req_failed': ['rate<0.05'], // Less than 5% errors
    'error_rate': ['rate<0.03'],      // Less than 3% custom errors
    
    // Performance thresholds
    'http_reqs': ['rate>30'],         // At least 30 requests/sec
    'data_transfer_rate': ['avg>1000'], // At least 1KB/s average
    
    // Concurrent user limits
    'concurrent_users': ['value<=200'] // Maximum 200 concurrent users
  }
};

// Global test state
let authHelper, apiHelper, perfHelper, dataGenerator;
let testUsers = [];

export function setup() {
  console.log('🚀 Starting Security Dashboard Load Testing Setup...');
  
  // Initialize helpers
  authHelper = new AuthHelper();
  apiHelper = new ApiHelper(authHelper);
  perfHelper = new PerformanceHelper();
  dataGenerator = new DataGenerator();
  
  // Pre-authenticate test users
  const userTypes = [
    { username: config.auth.adminUser, password: config.auth.adminPassword, role: 'admin' },
    { username: config.auth.analystUser, password: config.auth.analystPassword, role: 'analyst' },
    { username: config.auth.viewerUser, password: config.auth.viewerPassword, role: 'viewer' }
  ];
  
  userTypes.forEach(user => {
    try {
      const authTimer = perfHelper.startTimer('authentication');
      const authData = authHelper.login(user.username, user.password);
      const authDuration = perfHelper.endTimer(authTimer);
      
      authenticationTime.add(authDuration);
      testUsers.push({
        ...user,
        token: authData.accessToken
      });
      
      console.log(`✅ Authenticated ${user.role}: ${user.username}`);
    } catch (error) {
      console.error(`❌ Failed to authenticate ${user.username}:`, error.message);
    }
  });
  
  // Generate test data
  const testAlerts = dataGenerator.generateBatch('alert', 100);
  const testComplianceIssues = dataGenerator.generateBatch('compliance', 50);
  
  console.log(`📊 Generated ${testAlerts.length} test alerts and ${testComplianceIssues.length} compliance issues`);
  
  return {
    users: testUsers,
    alerts: testAlerts,
    complianceIssues: testComplianceIssues
  };
}

export default function(data) {
  // Update concurrent users metric
  concurrentUsers.add(1);
  
  const user = getRandomElement(data.users);
  const userId = user.username;
  
  console.log(`🔄 User ${userId} (${user.role}) starting dashboard session`);
  
  group('Dashboard Load Test Session', function() {
    
    // 1. Dashboard Initial Load
    group('Dashboard Initial Load', function() {
      const loadTimer = perfHelper.startTimer('dashboard_load');
      
      const dashboardResponse = apiHelper.get('/security/dashboard/metrics', userId);
      
      const loadSuccess = check(dashboardResponse, {
        'dashboard metrics loaded': (r) => r.status === 200,
        'dashboard has required fields': (r) => {
          const body = r.json();
          return body.todayRiskEvents !== undefined && 
                 body.complianceScore !== undefined &&
                 body.lastUpdated !== undefined;
        },
        'dashboard response size > 1KB': (r) => r.body.length > 1024
      });
      
      const loadDuration = perfHelper.endTimer(loadTimer);
      dashboardLoadTime.add(loadDuration);
      dataTransferRate.add(dashboardResponse.body.length);
      
      if (!loadSuccess) {
        errorRate.add(1);
        console.error(`❌ Dashboard load failed for ${userId}`);
      }
      
      randomSleep(1, 3);
    });
    
    // 2. Real-time Alerts Loading
    group('Security Alerts Processing', function() {
      const alertTimer = perfHelper.startTimer('alert_processing');
      
      // Get paginated alerts
      const alertsResponse = apiHelper.get('/security/alerts', userId, {
        page: 1,
        pageSize: 20,
        severity: getRandomElement(['Low', 'Medium', 'High', 'Critical'])
      });
      
      const alertSuccess = check(alertsResponse, {
        'alerts loaded successfully': (r) => r.status === 200,
        'alerts pagination exists': (r) => {
          const body = r.json();
          return body.pagination && body.pagination.totalCount !== undefined;
        },
        'alerts array present': (r) => Array.isArray(r.json().alerts)
      });
      
      const alertDuration = perfHelper.endTimer(alertTimer);
      alertProcessingTime.add(alertDuration);
      
      if (alertSuccess && user.role !== 'viewer') {
        // Acknowledge a random alert (if user has permission)
        const alerts = alertsResponse.json().alerts;
        if (alerts.length > 0) {
          const randomAlert = getRandomElement(alerts.filter(a => !a.isAcknowledged));
          if (randomAlert) {
            const ackResponse = apiHelper.post(`/security/alerts/${randomAlert.id}/acknowledge`, userId, {
              acknowledgedBy: userId,
              notes: 'Load test acknowledgment'
            });
            
            check(ackResponse, {
              'alert acknowledgment successful': (r) => r.status === 200
            });
          }
        }
      }
      
      if (!alertSuccess) {
        errorRate.add(1);
      }
      
      randomSleep(2, 4);
    });
    
    // 3. Compliance Data Processing
    group('Compliance Status Check', function() {
      const complianceTimer = perfHelper.startTimer('compliance_check');
      
      const complianceResponse = apiHelper.get('/security/compliance', userId);
      
      const complianceSuccess = check(complianceResponse, {
        'compliance data loaded': (r) => r.status === 200,
        'compliance issues array': (r) => Array.isArray(r.json()),
        'compliance response time acceptable': (r) => r.timings.duration < 3000
      });
      
      const complianceDuration = perfHelper.endTimer(complianceTimer);
      complianceCheckTime.add(complianceDuration);
      
      if (complianceSuccess && user.role === 'admin') {
        // Admin users can resolve compliance issues
        const issues = complianceResponse.json();
        const openIssues = issues.filter(i => i.status === 'Open');
        
        if (openIssues.length > 0) {
          const randomIssue = getRandomElement(openIssues);
          const resolveResponse = apiHelper.post(`/security/compliance/${randomIssue.id}/resolve`, userId, {
            resolvedBy: userId,
            resolutionNotes: 'Load test resolution'
          });
          
          check(resolveResponse, {
            'compliance resolution successful': (r) => r.status === 200
          });
        }
      }
      
      if (!complianceSuccess) {
        errorRate.add(1);
      }
      
      randomSleep(1, 2);
    });
    
    // 4. Abnormal Behavior Analysis
    group('Behavior Analysis', function() {
      const behaviorResponse = apiHelper.get('/security/behaviors', userId, {
        includeAnalytics: true,
        riskLevel: getRandomElement(['Low', 'Medium', 'High'])
      });
      
      const behaviorSuccess = check(behaviorResponse, {
        'behavior data loaded': (r) => r.status === 200,
        'behavior analytics present': (r) => {
          const body = r.json();
          return body.behaviors && body.analytics;
        }
      });
      
      if (!behaviorSuccess) {
        errorRate.add(1);
      }
      
      randomSleep(1, 3);
    });
    
    // 5. Dashboard Refresh (simulating real-time updates)
    group('Dashboard Refresh', function() {
      if (Math.random() > 0.7) { // 30% of users refresh dashboard
        const refreshResponse = apiHelper.post('/security/dashboard/metrics/refresh', userId);
        
        check(refreshResponse, {
          'dashboard refresh successful': (r) => r.status === 200,
          'refresh response time < 2s': (r) => r.timings.duration < 2000
        });
      }
      
      randomSleep(0.5, 1.5);
    });
    
    // 6. Export Functionality (Admin and Analyst only)
    group('Data Export', function() {
      if (user.role === 'admin' || user.role === 'analyst') {
        if (Math.random() > 0.8) { // 20% of eligible users export data
          const exportFormat = getRandomElement(['pdf', 'excel', 'csv']);
          
          const exportResponse = apiHelper.post('/security/dashboard/export', userId, {
            format: exportFormat,
            dateRange: '7d',
            sections: ['metrics', 'alerts', 'compliance']
          });
          
          check(exportResponse, {
            'export request successful': (r) => r.status === 200,
            'export has download URL': (r) => r.json().downloadUrl !== undefined
          });
        }
      }
      
      randomSleep(0.5, 1);
    });
    
    // 7. WebSocket Simulation (Real-time updates)
    group('Real-time Updates', function() {
      // Simulate receiving real-time updates
      const wsSimulationDelay = Math.random() * 5000; // Random delay up to 5 seconds
      
      if (wsSimulationDelay < 2000) { // 40% chance of receiving update
        // Simulate processing a real-time alert
        const realtimeAlert = dataGenerator.generateAlert();
        
        // Measure processing time for real-time data
        const processTimer = perfHelper.startTimer('realtime_processing');
        sleep(0.1); // Simulate processing time
        perfHelper.endTimer(processTimer);
        
        console.log(`📡 ${userId} received real-time alert: ${realtimeAlert.type}`);
      }
    });
  });
  
  // Session think time (user reading/analyzing data)
  randomSleep(3, 8);
  
  // Update concurrent users metric
  concurrentUsers.add(-1);
}

export function teardown(data) {
  console.log('🏁 Security Dashboard Load Test Completed');
  
  // Logout all test users
  data.users.forEach(user => {
    try {
      authHelper.logout(user.username);
      console.log(`📤 Logged out ${user.username}`);
    } catch (error) {
      console.error(`❌ Logout failed for ${user.username}:`, error.message);
    }
  });
  
  // Print performance summary
  const summary = perfHelper.getSummary();
  console.log('📊 Performance Summary:', JSON.stringify(summary, null, 2));
  
  // Generate load test report
  console.log('📈 Load Test Metrics:');
  console.log(`- Total Test Duration: ${summary.totalDuration}ms`);
  console.log(`- Total Operations: ${summary.totalOperations}`);
  console.log(`- Average Dashboard Load Time: ${summary.operationSummary.dashboard_load?.averageDuration || 'N/A'}ms`);
  console.log(`- Average Alert Processing Time: ${summary.operationSummary.alert_processing?.averageDuration || 'N/A'}ms`);
  console.log(`- Average Compliance Check Time: ${summary.operationSummary.compliance_check?.averageDuration || 'N/A'}ms`);
}