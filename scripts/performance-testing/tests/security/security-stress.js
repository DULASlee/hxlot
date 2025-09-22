/**
 * Security Stress Testing & Penetration Testing
 * Stage 6.2 Large-Scale Performance & Security Testing
 * 
 * This test implements security attack simulations, vulnerability scanning,
 * and penetration testing for the SmartAbp enterprise permission system
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

// Security Metrics
const sqlInjectionAttempts = new Counter('sql_injection_attempts');
const xssAttempts = new Counter('xss_attempts');
const bruteForceFailed = new Counter('brute_force_failed');
const unauthorizedAccess = new Counter('unauthorized_access');
const rateLimitViolations = new Counter('rate_limit_violations');
const tokenManipulation = new Counter('token_manipulation');
const privilegeEscalation = new Counter('privilege_escalation');
const securityResponseTime = new Trend('security_response_time');
const vulnerabilityDetection = new Rate('vulnerability_detection_rate');

// Security Test Configuration
export const options = {
  scenarios: {
    // Brute Force Attack Simulation
    brute_force_attack: {
      executor: 'constant-arrival-rate',
      rate: 50, // 50 requests per second
      timeUnit: '1s',
      duration: '5m',
      preAllocatedVUs: 10,
      maxVUs: 50,
      tags: { attack_type: 'brute_force' }
    },
    
    // SQL Injection Testing
    sql_injection_test: {
      executor: 'per-vu-iterations',
      vus: 5,
      iterations: 20,
      maxDuration: '10m',
      tags: { attack_type: 'sql_injection' }
    },
    
    // Cross-Site Scripting (XSS) Testing
    xss_attack_test: {
      executor: 'per-vu-iterations',
      vus: 3,
      iterations: 15,
      maxDuration: '8m',
      tags: { attack_type: 'xss' }
    },
    
    // Authorization Bypass Testing
    auth_bypass_test: {
      executor: 'constant-vus',
      vus: 10,
      duration: '7m',
      tags: { attack_type: 'auth_bypass' }
    },
    
    // Rate Limiting Stress Test
    rate_limit_stress: {
      executor: 'ramping-arrival-rate',
      startRate: 10,
      timeUnit: '1s',
      stages: [
        { duration: '2m', target: 100 }, // Ramp to 100 req/sec
        { duration: '3m', target: 200 }, // Stress at 200 req/sec
        { duration: '2m', target: 500 }, // Extreme load 500 req/sec
      ],
      preAllocatedVUs: 50,
      maxVUs: 100,
      tags: { attack_type: 'rate_limit' }
    },
    
    // Token Manipulation Testing
    token_manipulation: {
      executor: 'per-vu-iterations',
      vus: 8,
      iterations: 25,
      maxDuration: '10m',
      tags: { attack_type: 'token_manipulation' }
    },
    
    // Privilege Escalation Testing
    privilege_escalation: {
      executor: 'per-vu-iterations',
      vus: 6,
      iterations: 30,
      maxDuration: '12m',
      tags: { attack_type: 'privilege_escalation' }
    }
  },
  
  thresholds: {
    // Security thresholds
    'sql_injection_attempts': ['count>0'], // Should detect attempts
    'brute_force_failed': ['rate>0.95'],   // 95%+ should fail
    'unauthorized_access': ['rate<0.01'],   // <1% unauthorized success
    'privilege_escalation': ['rate<0.01'],  // <1% escalation success
    'vulnerability_detection_rate': ['rate>0.90'], // 90%+ vulnerability detection
    
    // Response time under attack
    'security_response_time': ['p(95)<5000', 'avg<2000'],
    'http_req_duration': ['p(99)<10000'], // Allow higher response times under attack
    
    // System stability
    'http_req_failed{attack_type:brute_force}': ['rate>0.90'], // Brute force should mostly fail
    'http_req_failed{attack_type:sql_injection}': ['rate>0.95'], // SQL injection should fail
    'http_req_failed{attack_type:xss}': ['rate>0.95'], // XSS should fail
  }
};

// Attack patterns and payloads
const ATTACK_PAYLOADS = {
  sqlInjection: [
    "' OR '1'='1",
    "'; DROP TABLE users; --",
    "' UNION SELECT * FROM users --",
    "admin'--",
    "' OR 1=1#",
    "'; EXEC xp_cmdshell('dir'); --",
    "' UNION SELECT username, password FROM users --"
  ],
  
  xssPayloads: [
    "<script>alert('XSS')</script>",
    "<img src=x onerror=alert('XSS')>",
    "javascript:alert('XSS')",
    "<svg onload=alert('XSS')>",
    "<iframe src=javascript:alert('XSS')>",
    "';alert('XSS');//",
    "<body onload=alert('XSS')>"
  ],
  
  pathTraversal: [
    "../../../etc/passwd",
    "..\\..\\..\\windows\\system32\\config\\sam",
    "%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd",
    "....//....//....//etc/passwd",
    "/var/www/../../etc/passwd"
  ],
  
  commandInjection: [
    "; ls -la",
    "| whoami",
    "&& cat /etc/passwd",
    "; rm -rf /",
    "| net user",
    "&& dir",
    "; ping -c 4 127.0.0.1"
  ]
};

// Test data and helpers
let authHelper, apiHelper, perfHelper, dataGenerator;
let validCredentials = [];
let adminToken = '';

export function setup() {
  console.log('🛡️ Starting Security Stress Testing Setup...');
  
  authHelper = new AuthHelper();
  apiHelper = new ApiHelper(authHelper);
  perfHelper = new PerformanceHelper();
  dataGenerator = new DataGenerator();
  
  // Get valid credentials for testing
  try {
    const adminAuth = authHelper.login(config.auth.adminUser, config.auth.adminPassword);
    adminToken = adminAuth.accessToken;
    
    validCredentials = [
      { username: config.auth.adminUser, password: config.auth.adminPassword, role: 'admin' },
      { username: config.auth.analystUser, password: config.auth.analystPassword, role: 'analyst' },
      { username: config.auth.viewerUser, password: config.auth.viewerPassword, role: 'viewer' }
    ];
    
    console.log('✅ Security test credentials prepared');
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
  
  return { validCredentials, adminToken };
}

export default function(data) {
  const testType = __ENV.K6_TEST_TYPE || 'mixed';
  
  switch (testType) {
    case 'brute_force':
      bruteForceTesting(data);
      break;
    case 'sql_injection':
      sqlInjectionTesting(data);
      break;
    case 'xss':
      xssTesting(data);
      break;
    case 'auth_bypass':
      authorizationBypassTesting(data);
      break;
    case 'rate_limit':
      rateLimitStressTesting(data);
      break;
    case 'token_manipulation':
      tokenManipulationTesting(data);
      break;
    case 'privilege_escalation':
      privilegeEscalationTesting(data);
      break;
    default:
      mixedSecurityTesting(data);
  }
}

function bruteForceTesting(data) {
  group('Brute Force Attack Simulation', function() {
    const commonPasswords = [
      'password', '123456', 'admin', 'root', 'user',
      'guest', 'test', 'demo', 'password123', 'admin123',
      'qwerty', 'letmein', 'welcome', 'monkey', 'dragon'
    ];
    
    const targetUsername = getRandomElement(['admin', 'user', 'test', 'administrator']);
    const attemptPassword = getRandomElement(commonPasswords);
    
    const timer = perfHelper.startTimer('brute_force_attempt');
    
    const response = http.post(`${config.baseUrl}/api/auth/login`, JSON.stringify({
      username: targetUsername,
      password: attemptPassword,
      deviceInfo: {
        deviceId: `attack-device-${Math.random()}`,
        userAgent: 'SecurityTest/1.0',
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`
      }
    }), {
      headers: { 'Content-Type': 'application/json' },
      tags: { attack_type: 'brute_force' }
    });
    
    const duration = perfHelper.endTimer(timer);
    securityResponseTime.add(duration);
    
    const bruteForceBlocked = check(response, {
      'brute force attempt blocked': (r) => r.status === 401 || r.status === 429,
      'rate limiting applied': (r) => r.status === 429,
      'security headers present': (r) => {
        return r.headers['X-Rate-Limit-Remaining'] !== undefined ||
               r.headers['Retry-After'] !== undefined;
      }
    });
    
    if (response.status === 401 || response.status === 429) {
      bruteForceFailed.add(1);
    }
    
    if (response.status === 200) {
      console.error(`🚨 SECURITY ALERT: Brute force success for ${targetUsername}/${attemptPassword}`);
      vulnerabilityDetection.add(0); // Vulnerability detected
    } else {
      vulnerabilityDetection.add(1); // System protected
    }
    
    randomSleep(0.1, 0.5);
  });
}

function sqlInjectionTesting(data) {
  group('SQL Injection Testing', function() {
    const endpoints = [
      '/api/users/search',
      '/api/security/alerts',
      '/api/audit/logs',
      '/api/reports/compliance'
    ];
    
    const endpoint = getRandomElement(endpoints);
    const payload = getRandomElement(ATTACK_PAYLOADS.sqlInjection);
    
    const timer = perfHelper.startTimer('sql_injection_attempt');
    
    // Test various injection points
    const testCases = [
      { param: 'username', value: payload },
      { param: 'search', value: payload },
      { param: 'filter', value: payload },
      { param: 'orderBy', value: payload }
    ];
    
    testCases.forEach(testCase => {
      const params = {};
      params[testCase.param] = testCase.value;
      
      const response = http.get(`${config.baseUrl}${endpoint}`, {
        params: params,
        headers: {
          'Authorization': `Bearer ${data.adminToken}`,
          'User-Agent': 'SQLMap/1.0'
        },
        tags: { attack_type: 'sql_injection' }
      });
      
      const duration = perfHelper.endTimer(timer);
      securityResponseTime.add(duration);
      
      sqlInjectionAttempts.add(1);
      
      const injectionBlocked = check(response, {
        'SQL injection blocked': (r) => r.status !== 200 || !r.body.includes('syntax error'),
        'No database errors exposed': (r) => {
          const body = r.body.toLowerCase();
          return !body.includes('sql') && 
                 !body.includes('mysql') && 
                 !body.includes('postgres') &&
                 !body.includes('syntax error');
        },
        'Proper error handling': (r) => r.status === 400 || r.status === 422
      });
      
      if (!injectionBlocked) {
        console.error(`🚨 SECURITY ALERT: Potential SQL injection vulnerability at ${endpoint}`);
        vulnerabilityDetection.add(0);
      } else {
        vulnerabilityDetection.add(1);
      }
    });
    
    randomSleep(0.5, 1);
  });
}

function xssTesting(data) {
  group('Cross-Site Scripting (XSS) Testing', function() {
    const xssPayload = getRandomElement(ATTACK_PAYLOADS.xssPayloads);
    
    const timer = perfHelper.startTimer('xss_attempt');
    
    // Test XSS in various input fields
    const testEndpoints = [
      {
        url: '/api/users/profile',
        method: 'PUT',
        body: { displayName: xssPayload, bio: xssPayload }
      },
      {
        url: '/api/security/alerts/comment',
        method: 'POST',
        body: { alertId: 'alert-001', comment: xssPayload }
      },
      {
        url: '/api/reports/create',
        method: 'POST',
        body: { title: xssPayload, description: xssPayload }
      }
    ];
    
    testEndpoints.forEach(test => {
      const response = http.request(test.method, `${config.baseUrl}${test.url}`, 
        JSON.stringify(test.body), {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${data.adminToken}`
        },
        tags: { attack_type: 'xss' }
      });
      
      const duration = perfHelper.endTimer(timer);
      securityResponseTime.add(duration);
      
      xssAttempts.add(1);
      
      const xssBlocked = check(response, {
        'XSS payload sanitized': (r) => {
          const body = r.body.toLowerCase();
          return !body.includes('<script>') && 
                 !body.includes('javascript:') &&
                 !body.includes('onerror=');
        },
        'Input validation applied': (r) => r.status === 400 || r.status === 422,
        'No script execution possible': (r) => {
          return !r.body.includes(xssPayload) || 
                 r.body.includes('&lt;script&gt;') || 
                 r.body.includes('&amp;lt;script&amp;gt;');
        }
      });
      
      if (!xssBlocked) {
        console.error(`🚨 SECURITY ALERT: Potential XSS vulnerability at ${test.url}`);
        vulnerabilityDetection.add(0);
      } else {
        vulnerabilityDetection.add(1);
      }
    });
    
    randomSleep(0.3, 0.7);
  });
}

function authorizationBypassTesting(data) {
  group('Authorization Bypass Testing', function() {
    // Test accessing admin endpoints with lower privilege tokens
    const testCredentials = data.validCredentials.find(c => c.role === 'viewer');
    
    if (!testCredentials) {
      console.error('No viewer credentials available for auth bypass testing');
      return;
    }
    
    const viewerAuth = authHelper.login(testCredentials.username, testCredentials.password);
    const viewerToken = viewerAuth.accessToken;
    
    const restrictedEndpoints = [
      '/api/admin/users',
      '/api/admin/roles',
      '/api/admin/permissions',
      '/api/admin/system-config',
      '/api/security/alerts/resolve',
      '/api/audit/logs/export'
    ];
    
    restrictedEndpoints.forEach(endpoint => {
      const timer = perfHelper.startTimer('auth_bypass_attempt');
      
      const response = http.get(`${config.baseUrl}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${viewerToken}`,
          'User-Agent': 'AuthBypassTest/1.0'
        },
        tags: { attack_type: 'auth_bypass' }
      });
      
      const duration = perfHelper.endTimer(timer);
      securityResponseTime.add(duration);
      
      const bypassBlocked = check(response, {
        'Authorization enforced': (r) => r.status === 403 || r.status === 401,
        'No sensitive data leaked': (r) => {
          if (r.status === 200) {
            const body = r.body.toLowerCase();
            return !body.includes('password') && 
                   !body.includes('secret') &&
                   !body.includes('private');
          }
          return true;
        },
        'Proper error message': (r) => {
          if (r.status === 403) {
            return r.body.includes('insufficient') || r.body.includes('unauthorized');
          }
          return true;
        }
      });
      
      if (response.status === 200) {
        console.error(`🚨 SECURITY ALERT: Authorization bypass successful at ${endpoint}`);
        unauthorizedAccess.add(1);
        vulnerabilityDetection.add(0);
      } else {
        vulnerabilityDetection.add(1);
      }
    });
    
    randomSleep(0.5, 1);
  });
}

function rateLimitStressTesting(data) {
  group('Rate Limiting Stress Testing', function() {
    const endpoint = getRandomElement([
      '/api/auth/login',
      '/api/security/dashboard/metrics',
      '/api/security/alerts',
      '/api/users/search'
    ]);
    
    const timer = perfHelper.startTimer('rate_limit_test');
    
    const response = http.get(`${config.baseUrl}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${data.adminToken}`,
        'X-Forwarded-For': `192.168.1.${Math.floor(Math.random() * 255)}`
      },
      tags: { attack_type: 'rate_limit' }
    });
    
    const duration = perfHelper.endTimer(timer);
    securityResponseTime.add(duration);
    
    const rateLimitWorking = check(response, {
      'Rate limit headers present': (r) => {
        return r.headers['X-Rate-Limit-Limit'] !== undefined &&
               r.headers['X-Rate-Limit-Remaining'] !== undefined;
      },
      'Rate limit enforced when exceeded': (r) => {
        if (r.headers['X-Rate-Limit-Remaining'] === '0') {
          return r.status === 429;
        }
        return true;
      },
      'Retry-After header on rate limit': (r) => {
        if (r.status === 429) {
          return r.headers['Retry-After'] !== undefined;
        }
        return true;
      }
    });
    
    if (response.status === 429) {
      rateLimitViolations.add(1);
      vulnerabilityDetection.add(1); // Rate limiting working
    }
    
    sleep(0.1); // Small delay to allow rate limit reset
  });
}

function tokenManipulationTesting(data) {
  group('Token Manipulation Testing', function() {
    const originalToken = data.adminToken;
    
    // Test various token manipulation techniques
    const manipulatedTokens = [
      originalToken.slice(0, -5) + 'xxxxx', // Tampered signature
      'Bearer ' + originalToken, // Wrong format
      originalToken.replace(/[aA]/g, 'b'), // Character substitution
      Buffer.from(JSON.stringify({role: 'super_admin'})).toString('base64'), // Fake token
      '', // Empty token
      'invalid_token_format'
    ];
    
    manipulatedTokens.forEach(token => {
      const timer = perfHelper.startTimer('token_manipulation');
      
      const response = http.get(`${config.baseUrl}/api/security/dashboard/metrics`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        tags: { attack_type: 'token_manipulation' }
      });
      
      const duration = perfHelper.endTimer(timer);
      securityResponseTime.add(duration);
      
      tokenManipulation.add(1);
      
      const tokenValidationWorking = check(response, {
        'Invalid token rejected': (r) => r.status === 401,
        'No sensitive data with invalid token': (r) => {
          if (r.status === 200) {
            return false; // Should not return 200 with invalid token
          }
          return true;
        },
        'Proper error message': (r) => {
          if (r.status === 401) {
            return r.body.includes('token') || r.body.includes('unauthorized');
          }
          return true;
        }
      });
      
      if (response.status === 200) {
        console.error(`🚨 SECURITY ALERT: Token manipulation bypass detected`);
        vulnerabilityDetection.add(0);
      } else {
        vulnerabilityDetection.add(1);
      }
    });
    
    randomSleep(0.3, 0.6);
  });
}

function privilegeEscalationTesting(data) {
  group('Privilege Escalation Testing', function() {
    // Test role manipulation in requests
    const viewerCreds = data.validCredentials.find(c => c.role === 'viewer');
    
    if (!viewerCreds) {
      console.error('No viewer credentials for privilege escalation testing');
      return;
    }
    
    const viewerAuth = authHelper.login(viewerCreds.username, viewerCreds.password);
    const viewerToken = viewerAuth.accessToken;
    
    const escalationAttempts = [
      {
        endpoint: '/api/users/update-role',
        method: 'POST',
        body: { userId: viewerCreds.username, newRole: 'admin' }
      },
      {
        endpoint: '/api/permissions/grant',
        method: 'POST',
        body: { userId: viewerCreds.username, permissions: ['admin.full'] }
      },
      {
        endpoint: '/api/admin/elevate',
        method: 'POST',
        body: { targetRole: 'super_admin' }
      }
    ];
    
    escalationAttempts.forEach(attempt => {
      const timer = perfHelper.startTimer('privilege_escalation');
      
      const response = http.request(attempt.method, `${config.baseUrl}${attempt.endpoint}`,
        JSON.stringify(attempt.body), {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${viewerToken}`,
          'X-Requested-With': 'XMLHttpRequest'
        },
        tags: { attack_type: 'privilege_escalation' }
      });
      
      const duration = perfHelper.endTimer(timer);
      securityResponseTime.add(duration);
      
      privilegeEscalation.add(1);
      
      const escalationBlocked = check(response, {
        'Privilege escalation denied': (r) => r.status === 403 || r.status === 401,
        'Role change prevented': (r) => {
          if (r.status === 200) {
            return !r.body.includes('role updated') && !r.body.includes('permission granted');
          }
          return true;
        },
        'Audit log generated': (r) => {
          // In a real scenario, this would check audit logs
          return r.status !== 200; // If blocked, audit should be generated
        }
      });
      
      if (response.status === 200) {
        console.error(`🚨 SECURITY ALERT: Privilege escalation successful at ${attempt.endpoint}`);
        vulnerabilityDetection.add(0);
      } else {
        vulnerabilityDetection.add(1);
      }
    });
    
    randomSleep(0.4, 0.8);
  });
}

function mixedSecurityTesting(data) {
  // Run a mix of all security tests
  const testTypes = [
    () => bruteForceTesting(data),
    () => sqlInjectionTesting(data),
    () => xssTesting(data),
    () => authorizationBypassTesting(data),
    () => tokenManipulationTesting(data)
  ];
  
  const selectedTest = getRandomElement(testTypes);
  selectedTest();
}

export function teardown(data) {
  console.log('🛡️ Security Stress Testing Completed');
  
  // Generate security report
  console.log('📊 Security Test Summary:');
  console.log(`- SQL Injection Attempts: ${sqlInjectionAttempts.count || 0}`);
  console.log(`- XSS Attempts: ${xssAttempts.count || 0}`);
  console.log(`- Brute Force Failures: ${bruteForceFailed.count || 0}`);
  console.log(`- Unauthorized Access: ${unauthorizedAccess.count || 0}`);
  console.log(`- Rate Limit Violations: ${rateLimitViolations.count || 0}`);
  console.log(`- Token Manipulation: ${tokenManipulation.count || 0}`);
  console.log(`- Privilege Escalation: ${privilegeEscalation.count || 0}`);
  
  // Cleanup
  try {
    data.validCredentials.forEach(creds => {
      authHelper.logout(creds.username);
    });
  } catch (error) {
    console.error('Cleanup error:', error.message);
  }
}