/**
 * K6 Performance Testing Configuration
 * Stage 6.2 Large-Scale Performance & Security Testing
 */

// Environment Configuration
export const config = {
  // Base URLs
  baseUrl: __ENV.BASE_URL || 'http://localhost:44300',
  apiUrl: __ENV.API_URL || 'http://localhost:44300/api',
  frontendUrl: __ENV.FRONTEND_URL || 'http://localhost:11369',
  
  // Authentication
  auth: {
    adminUser: __ENV.ADMIN_USER || 'admin',
    adminPassword: __ENV.ADMIN_PASSWORD || 'admin123',
    analystUser: __ENV.ANALYST_USER || 'analyst',
    analystPassword: __ENV.ANALYST_PASSWORD || 'analyst123',
    viewerUser: __ENV.VIEWER_USER || 'viewer',
    viewerPassword: __ENV.VIEWER_PASSWORD || 'viewer123'
  },
  
  // Performance Thresholds
  thresholds: {
    http_req_duration: ['p(95)<2000', 'p(99)<5000'], // 95% requests < 2s, 99% < 5s
    http_req_failed: ['rate<0.05'], // Error rate < 5%
    http_reqs: ['rate>50'], // Minimum 50 requests per second
    http_req_receiving: ['p(95)<1000'], // 95% response time < 1s
    http_req_connecting: ['p(95)<100'], // 95% connection time < 100ms
    vus: ['value<=200'], // Maximum 200 virtual users
    vus_max: ['value<=500'], // Maximum peak 500 virtual users
    iteration_duration: ['p(95)<10000'], // 95% iterations < 10s
    data_received: ['rate>1000'], // Minimum 1KB/s data received
    data_sent: ['rate>100'] // Minimum 100B/s data sent
  },
  
  // Load Testing Scenarios
  scenarios: {
    // Baseline Load Test
    baseline: {
      executor: 'constant-vus',
      vus: 10,
      duration: '5m',
      tags: { test_type: 'baseline' }
    },
    
    // Gradual Ramp-up Load Test
    load: {
      executor: 'ramping-vus',
      startVUs: 1,
      stages: [
        { duration: '2m', target: 10 },   // Ramp up to 10 users
        { duration: '5m', target: 50 },   // Stay at 50 users
        { duration: '5m', target: 100 },  // Ramp up to 100 users
        { duration: '10m', target: 100 }, // Stay at 100 users
        { duration: '2m', target: 0 }     // Ramp down
      ],
      tags: { test_type: 'load' }
    },
    
    // Stress Test - Push beyond normal capacity
    stress: {
      executor: 'ramping-vus',
      startVUs: 1,
      stages: [
        { duration: '2m', target: 50 },   // Ramp up to normal load
        { duration: '5m', target: 100 },  // Increase to high load
        { duration: '10m', target: 200 }, // Push to stress level
        { duration: '5m', target: 300 },  // Maximum stress
        { duration: '2m', target: 0 }     // Ramp down
      ],
      tags: { test_type: 'stress' }
    },
    
    // Spike Test - Sudden traffic spikes
    spike: {
      executor: 'ramping-vus',
      startVUs: 1,
      stages: [
        { duration: '1m', target: 10 },   // Normal load
        { duration: '30s', target: 200 }, // Sudden spike
        { duration: '1m', target: 10 },   // Back to normal
        { duration: '30s', target: 300 }, // Larger spike
        { duration: '1m', target: 10 },   // Back to normal
        { duration: '1m', target: 0 }     // Ramp down
      ],
      tags: { test_type: 'spike' }
    },
    
    // Volume Test - Large data volumes
    volume: {
      executor: 'constant-vus',
      vus: 50,
      duration: '30m',
      tags: { test_type: 'volume' }
    },
    
    // Endurance Test - Long duration
    endurance: {
      executor: 'constant-vus',
      vus: 30,
      duration: '2h',
      tags: { test_type: 'endurance' }
    }
  },
  
  // Security Testing Configuration
  security: {
    // Rate limiting tests
    rateLimiting: {
      requestsPerMinute: 1000,
      burstSize: 100
    },
    
    // Authentication tests
    authentication: {
      invalidTokens: [
        'invalid-token',
        'expired-token',
        '',
        'malformed.jwt.token'
      ],
      sqlInjectionPayloads: [
        "'; DROP TABLE users; --",
        "' OR '1'='1",
        "admin'--",
        "' UNION SELECT * FROM users--"
      ],
      xssPayloads: [
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        '<img src=x onerror=alert("xss")>'
      ]
    }
  },
  
  // Monitoring and Reporting
  monitoring: {
    // InfluxDB for metrics storage
    influxdb: {
      url: __ENV.INFLUXDB_URL || 'http://localhost:8086/k6',
      database: 'k6_metrics'
    },
    
    // Grafana for visualization
    grafana: {
      url: __ENV.GRAFANA_URL || 'http://localhost:3000',
      dashboardId: 'k6-performance'
    },
    
    // Custom metrics collection
    customMetrics: {
      loginTime: 'login_duration',
      dashboardLoadTime: 'dashboard_load_duration',
      alertProcessingTime: 'alert_processing_duration',
      complianceCheckTime: 'compliance_check_duration',
      memoryUsage: 'memory_usage_bytes',
      cpuUsage: 'cpu_usage_percent'
    }
  },
  
  // Test Data Configuration
  testData: {
    // Number of test users to create
    userCount: 1000,
    
    // Number of test alerts to generate
    alertCount: 5000,
    
    // Number of compliance issues to create
    complianceIssueCount: 500,
    
    // Number of audit log entries
    auditLogCount: 10000,
    
    // Data generation patterns
    patterns: {
      userRoles: ['admin', 'analyst', 'compliance', 'viewer', 'user'],
      alertTypes: ['HighRiskPermissionAccess', 'UnusualLocationAccess', 'PermissionEscalation', 'SuspiciousActivity'],
      severityLevels: ['Low', 'Medium', 'High', 'Critical'],
      complianceTypes: ['DataRetention', 'AccessControl', 'AuditLogging', 'Encryption', 'PolicyViolation']
    }
  }
};

// Helper Functions
export function getRandomUser() {
  const users = [
    { username: config.auth.adminUser, password: config.auth.adminPassword, role: 'admin' },
    { username: config.auth.analystUser, password: config.auth.analystPassword, role: 'analyst' },
    { username: config.auth.viewerUser, password: config.auth.viewerPassword, role: 'viewer' }
  ];
  return users[Math.floor(Math.random() * users.length)];
}

export function getRandomAlertType() {
  const types = config.testData.patterns.alertTypes;
  return types[Math.floor(Math.random() * types.length)];
}

export function getRandomSeverity() {
  const severities = config.testData.patterns.severityLevels;
  return severities[Math.floor(Math.random() * severities.length)];
}

export function generateTestData(type, count = 100) {
  const data = [];
  
  for (let i = 0; i < count; i++) {
    switch (type) {
      case 'alert':
        data.push({
          id: `test-alert-${i}`,
          type: getRandomAlertType(),
          severity: getRandomSeverity(),
          description: `Test alert ${i} for performance testing`,
          timestamp: new Date().toISOString(),
          userId: `test-user-${Math.floor(Math.random() * 100)}`
        });
        break;
        
      case 'user':
        data.push({
          id: `test-user-${i}`,
          username: `testuser${i}`,
          email: `testuser${i}@smartabp.com`,
          role: config.testData.patterns.userRoles[Math.floor(Math.random() * config.testData.patterns.userRoles.length)]
        });
        break;
        
      case 'compliance':
        data.push({
          id: `test-compliance-${i}`,
          type: config.testData.patterns.complianceTypes[Math.floor(Math.random() * config.testData.patterns.complianceTypes.length)],
          severity: getRandomSeverity(),
          description: `Test compliance issue ${i}`,
          affectedUsers: Math.floor(Math.random() * 50) + 1
        });
        break;
    }
  }
  
  return data;
}

// Performance Validation Functions
export function validatePerformance(response, expectedDuration = 2000) {
  const duration = response.timings.duration;
  if (duration > expectedDuration) {
    console.warn(`Performance threshold exceeded: ${duration}ms > ${expectedDuration}ms`);
  }
  return duration <= expectedDuration;
}

export function validateMemoryUsage() {
  // Memory usage validation (requires external monitoring)
  // This would typically be implemented with custom metrics
  return true;
}

export function logPerformanceMetrics(response, endpoint) {
  console.log(`[PERF] ${endpoint}: ${response.timings.duration}ms (${response.status})`);
}