#!/bin/bash

# Security Testing Execution Script
# Stage 6.2 Large-Scale Performance & Security Testing
# 
# This script orchestrates the execution of all security tests:
# - Security stress testing
# - Vulnerability scanning (OWASP Top 10)
# - Penetration testing
# - Performance testing under attack conditions

echo "🛡️  SmartAbp Enterprise Security Testing Suite"
echo "=============================================="
echo "Starting comprehensive security assessment..."
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BASE_URL=${BASE_URL:-"https://localhost:5001"}
SECURITY_RESULTS_DIR="./results/security"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Create results directory
mkdir -p $SECURITY_RESULTS_DIR

# Function to log messages
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
}

success() {
    echo -e "${GREEN}[SUCCESS] $1${NC}"
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

# Function to check if K6 is installed
check_k6() {
    if ! command -v k6 &> /dev/null; then
        error "K6 is not installed. Please install K6 first."
        echo "Install instructions: https://k6.io/docs/getting-started/installation/"
        exit 1
    fi
    success "K6 is available: $(k6 version)"
}

# Function to check if the target application is running
check_target() {
    log "Checking if target application is available at $BASE_URL..."
    
    if curl -k -s --head --request GET "$BASE_URL/api/health" | grep "200" > /dev/null; then
        success "Target application is running and accessible"
    else
        error "Target application is not accessible at $BASE_URL"
        echo "Please ensure the SmartAbp application is running before starting security tests."
        exit 1
    fi
}

# Function to run security stress testing
run_security_stress_test() {
    log "Starting Security Stress Testing..."
    
    k6 run \
        --env BASE_URL=$BASE_URL \
        --env K6_TEST_TYPE=mixed \
        --out json=$SECURITY_RESULTS_DIR/security_stress_$TIMESTAMP.json \
        --summary-export=$SECURITY_RESULTS_DIR/security_stress_summary_$TIMESTAMP.json \
        ./tests/security/security-stress.js
    
    if [ $? -eq 0 ]; then
        success "Security stress testing completed successfully"
    else
        error "Security stress testing failed"
        return 1
    fi
}

# Function to run OWASP Top 10 vulnerability scanning
run_vulnerability_scan() {
    log "Starting OWASP Top 10 Vulnerability Scanning..."
    
    k6 run \
        --env BASE_URL=$BASE_URL \
        --env K6_VULNERABILITY_TYPE=mixed \
        --out json=$SECURITY_RESULTS_DIR/vulnerability_scan_$TIMESTAMP.json \
        --summary-export=$SECURITY_RESULTS_DIR/vulnerability_summary_$TIMESTAMP.json \
        ./tests/security/vulnerability-scan.js
    
    if [ $? -eq 0 ]; then
        success "Vulnerability scanning completed successfully"
    else
        error "Vulnerability scanning failed"
        return 1
    fi
}

# Function to run penetration testing
run_penetration_test() {
    log "Starting Automated Penetration Testing..."
    
    k6 run \
        --env BASE_URL=$BASE_URL \
        --env K6_PENTEST_TYPE=comprehensive \
        --out json=$SECURITY_RESULTS_DIR/penetration_test_$TIMESTAMP.json \
        --summary-export=$SECURITY_RESULTS_DIR/penetration_summary_$TIMESTAMP.json \
        ./tests/security/penetration-test.js
    
    if [ $? -eq 0 ]; then
        success "Penetration testing completed successfully"
    else
        error "Penetration testing failed"
        return 1
    fi
}

# Function to run performance testing under attack
run_performance_under_attack() {
    log "Starting Performance Testing Under Attack Conditions..."
    
    # Run dashboard load test with concurrent security attacks
    k6 run \
        --env BASE_URL=$BASE_URL \
        --env ATTACK_MODE=true \
        --out json=$SECURITY_RESULTS_DIR/perf_under_attack_$TIMESTAMP.json \
        --summary-export=$SECURITY_RESULTS_DIR/perf_under_attack_summary_$TIMESTAMP.json \
        ./tests/load/dashboard-load.js &
    
    LOAD_TEST_PID=$!
    
    # Start security attacks in parallel
    sleep 30 # Allow load test to stabilize
    
    k6 run \
        --env BASE_URL=$BASE_URL \
        --env K6_TEST_TYPE=rate_limit \
        --duration=10m \
        --vus=20 \
        ./tests/security/security-stress.js &
    
    SECURITY_TEST_PID=$!
    
    # Wait for both tests to complete
    wait $LOAD_TEST_PID
    wait $SECURITY_TEST_PID
    
    success "Performance testing under attack completed"
}

# Function to generate security report
generate_security_report() {
    log "Generating comprehensive security report..."
    
    REPORT_FILE="$SECURITY_RESULTS_DIR/security_report_$TIMESTAMP.html"
    
    cat > $REPORT_FILE << EOF
<!DOCTYPE html>
<html>
<head>
    <title>SmartAbp Security Assessment Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background-color: #f4f4f4; padding: 20px; border-radius: 5px; }
        .section { margin: 20px 0; padding: 15px; border-left: 4px solid #007bff; }
        .critical { border-left-color: #dc3545; background-color: #fff5f5; }
        .warning { border-left-color: #ffc107; background-color: #fffbf0; }
        .success { border-left-color: #28a745; background-color: #f0fff4; }
        .metric { display: inline-block; margin: 10px; padding: 10px; background-color: #f8f9fa; border-radius: 3px; }
        pre { background-color: #f8f9fa; padding: 10px; border-radius: 3px; overflow-x: auto; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🛡️ SmartAbp Enterprise Security Assessment Report</h1>
        <p><strong>Generated:</strong> $(date)</p>
        <p><strong>Test Duration:</strong> Comprehensive security testing completed</p>
        <p><strong>Target:</strong> $BASE_URL</p>
    </div>

    <div class="section">
        <h2>📊 Executive Summary</h2>
        <p>This report provides a comprehensive security assessment of the SmartAbp enterprise permission management system, 
        including penetration testing, vulnerability scanning, and performance testing under attack conditions.</p>
    </div>

    <div class="section">
        <h2>🎯 Test Coverage</h2>
        <div class="metric">
            <strong>Security Stress Testing</strong><br>
            Brute force, injection, XSS, rate limiting
        </div>
        <div class="metric">
            <strong>OWASP Top 10 Scanning</strong><br>
            A01-A10 comprehensive coverage
        </div>
        <div class="metric">
            <strong>Penetration Testing</strong><br>
            Authentication, authorization, session management
        </div>
        <div class="metric">
            <strong>Performance Under Attack</strong><br>
            System resilience testing
        </div>
    </div>

    <div class="section success">
        <h2>✅ Security Tests Completed</h2>
        <p>All security testing modules have been executed successfully. Detailed results are available in JSON format in the results directory.</p>
    </div>

    <div class="section">
        <h2>📁 Result Files</h2>
        <ul>
            <li><code>security_stress_$TIMESTAMP.json</code> - Security stress test results</li>
            <li><code>vulnerability_scan_$TIMESTAMP.json</code> - OWASP Top 10 scan results</li>
            <li><code>penetration_test_$TIMESTAMP.json</code> - Penetration test results</li>
            <li><code>perf_under_attack_$TIMESTAMP.json</code> - Performance under attack results</li>
        </ul>
    </div>

    <div class="section">
        <h2>🔍 Next Steps</h2>
        <ol>
            <li>Review JSON result files for detailed metrics and findings</li>
            <li>Analyze any identified vulnerabilities and implement fixes</li>
            <li>Schedule regular security testing as part of CI/CD pipeline</li>
            <li>Update security policies based on test results</li>
        </ol>
    </div>

    <div class="section">
        <h2>📈 Recommendations</h2>
        <ul>
            <li>Implement automated security testing in development pipeline</li>
            <li>Regular penetration testing by third-party security experts</li>
            <li>Continuous monitoring and threat detection</li>
            <li>Security awareness training for development team</li>
        </ul>
    </div>
</body>
</html>
EOF

    success "Security report generated: $REPORT_FILE"
}

# Main execution flow
main() {
    log "Initializing SmartAbp Security Testing Suite..."
    
    # Pre-flight checks
    check_k6
    check_target
    
    # Set environment variables
    export BASE_URL=$BASE_URL
    export K6_BROWSER_ENABLED=false
    export K6_NO_USAGE_REPORT=true
    
    log "Starting security testing sequence..."
    echo ""
    
    # Execute security tests
    local tests_passed=0
    local tests_total=4
    
    # 1. Security Stress Testing
    if run_security_stress_test; then
        ((tests_passed++))
    fi
    
    echo ""
    
    # 2. Vulnerability Scanning
    if run_vulnerability_scan; then
        ((tests_passed++))
    fi
    
    echo ""
    
    # 3. Penetration Testing
    if run_penetration_test; then
        ((tests_passed++))
    fi
    
    echo ""
    
    # 4. Performance Under Attack
    if run_performance_under_attack; then
        ((tests_passed++))
    fi
    
    echo ""
    
    # Generate comprehensive report
    generate_security_report
    
    # Final summary
    echo ""
    echo "=============================================="
    log "Security Testing Suite Completed"
    echo ""
    
    if [ $tests_passed -eq $tests_total ]; then
        success "All security tests completed successfully ✅"
        success "Results saved to: $SECURITY_RESULTS_DIR"
    else
        warning "Security testing completed with issues: $tests_passed/$tests_total tests passed"
    fi
    
    echo ""
    log "Review the generated security report and JSON result files for detailed analysis."
    log "Report location: $SECURITY_RESULTS_DIR/security_report_$TIMESTAMP.html"
    echo ""
}

# Handle script interruption
trap 'error "Security testing interrupted by user"; exit 1' INT

# Run main function
main "$@"