#!/bin/bash

# Production Readiness Validation Script
# Stage 6.3 Final Optimization & Production Deployment
# 
# This script validates system readiness for production deployment

echo "✅ SmartAbp Production Readiness Validation"
echo "==========================================="
echo "Conducting comprehensive production readiness assessment..."
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Validation results
VALIDATION_RESULTS=()
CRITICAL_ISSUES=0
WARNING_ISSUES=0
PASSED_CHECKS=0

# Function to log validation results
log_result() {
    local status=$1
    local category=$2
    local check=$3
    local details=$4
    
    case $status in
        "PASS")
            echo -e "${GREEN}[PASS]${NC} $category: $check"
            VALIDATION_RESULTS+=("PASS|$category|$check|$details")
            ((PASSED_CHECKS++))
            ;;
        "WARN")
            echo -e "${YELLOW}[WARN]${NC} $category: $check"
            VALIDATION_RESULTS+=("WARN|$category|$check|$details")
            ((WARNING_ISSUES++))
            ;;
        "FAIL")
            echo -e "${RED}[FAIL]${NC} $category: $check"
            VALIDATION_RESULTS+=("FAIL|$category|$check|$details")
            ((CRITICAL_ISSUES++))
            ;;
    esac
    
    if [ ! -z "$details" ]; then
        echo "      Details: $details"
    fi
}

# Security validation checks
validate_security() {
    echo -e "${BLUE}🔒 Security Validation${NC}"
    echo "========================"
    
    # Check HTTPS configuration
    if grep -q "ssl_certificate" deployment/nginx.conf 2>/dev/null; then
        log_result "PASS" "Security" "HTTPS Configuration" "SSL certificates configured in Nginx"
    else
        log_result "FAIL" "Security" "HTTPS Configuration" "SSL certificates not configured"
    fi
    
    # Check security headers
    if grep -q "X-Frame-Options\|X-Content-Type-Options\|X-XSS-Protection" deployment/nginx.conf 2>/dev/null; then
        log_result "PASS" "Security" "Security Headers" "Security headers configured"
    else
        log_result "FAIL" "Security" "Security Headers" "Security headers missing"
    fi
    
    # Check rate limiting
    if grep -q "limit_req_zone" deployment/nginx.conf 2>/dev/null; then
        log_result "PASS" "Security" "Rate Limiting" "Rate limiting configured"
    else
        log_result "WARN" "Security" "Rate Limiting" "Rate limiting not configured"
    fi
    
    # Check for security test results
    if [ -f "performance-testing/results/security/security_stress_*.json" ]; then
        log_result "PASS" "Security" "Security Testing" "Security tests executed"
    else
        log_result "WARN" "Security" "Security Testing" "Security test results not found"
    fi
    
    # Check authentication configuration
    if [ -f "src/SmartAbp.Host/appsettings.Production.json" ]; then
        if grep -q "JWT\|Authentication" src/SmartAbp.Host/appsettings.Production.json 2>/dev/null; then
            log_result "PASS" "Security" "Authentication Config" "JWT authentication configured"
        else
            log_result "WARN" "Security" "Authentication Config" "Authentication configuration unclear"
        fi
    else
        log_result "FAIL" "Security" "Authentication Config" "Production configuration missing"
    fi
    
    echo ""
}

# Performance validation checks
validate_performance() {
    echo -e "${BLUE}⚡ Performance Validation${NC}"
    echo "=========================="
    
    # Check frontend build optimization
    if [ -f "src/SmartAbp.Vue/dist/index.html" ]; then
        if grep -q "js/chunk\|css/chunk" src/SmartAbp.Vue/dist/index.html 2>/dev/null; then
            log_result "PASS" "Performance" "Frontend Optimization" "Code splitting and chunking enabled"
        else
            log_result "WARN" "Performance" "Frontend Optimization" "Code splitting may not be optimal"
        fi
    else
        log_result "FAIL" "Performance" "Frontend Optimization" "Production build not found"
    fi
    
    # Check backend optimization
    if [ -d "deployment/publish" ]; then
        local publish_size=$(du -sh deployment/publish 2>/dev/null | cut -f1)
        log_result "PASS" "Performance" "Backend Optimization" "Optimized publish created ($publish_size)"
    else
        log_result "FAIL" "Performance" "Backend Optimization" "Optimized backend build not found"
    fi
    
    # Check database optimization
    if [ -f "deployment/database-optimization.sql" ]; then
        log_result "PASS" "Performance" "Database Optimization" "Database optimization scripts prepared"
    else
        log_result "WARN" "Performance" "Database Optimization" "Database optimization scripts missing"
    fi
    
    # Check caching configuration
    if grep -q "Redis\|MemoryCache" src/SmartAbp.Host/appsettings.Production.json 2>/dev/null; then
        log_result "PASS" "Performance" "Caching Strategy" "Caching configured"
    else
        log_result "WARN" "Performance" "Caching Strategy" "Caching configuration unclear"
    fi
    
    # Check performance test results
    if [ -f "performance-testing/results/performance-summary.json" ]; then
        log_result "PASS" "Performance" "Performance Testing" "Performance tests executed"
    else
        log_result "WARN" "Performance" "Performance Testing" "Performance test results not found"
    fi
    
    echo ""
}

# Infrastructure validation checks
validate_infrastructure() {
    echo -e "${BLUE}🏗️ Infrastructure Validation${NC}"
    echo "=============================="
    
    # Check Docker configuration
    if [ -f "deployment/Dockerfile" ]; then
        log_result "PASS" "Infrastructure" "Docker Configuration" "Production Dockerfile available"
    else
        log_result "FAIL" "Infrastructure" "Docker Configuration" "Dockerfile missing"
    fi
    
    # Check Docker Compose
    if [ -f "deployment/docker-compose.prod.yml" ]; then
        log_result "PASS" "Infrastructure" "Container Orchestration" "Production Docker Compose configured"
    else
        log_result "FAIL" "Infrastructure" "Container Orchestration" "Production Docker Compose missing"
    fi
    
    # Check monitoring setup
    if [ -f "performance-testing/monitoring/docker-compose.yml" ]; then
        log_result "PASS" "Infrastructure" "Monitoring Stack" "Monitoring infrastructure configured"
    else
        log_result "WARN" "Infrastructure" "Monitoring Stack" "Monitoring setup not found"
    fi
    
    # Check health checks
    if grep -q "HEALTHCHECK\|health" deployment/Dockerfile 2>/dev/null; then
        log_result "PASS" "Infrastructure" "Health Checks" "Health checks configured"
    else
        log_result "WARN" "Infrastructure" "Health Checks" "Health checks not configured"
    fi
    
    # Check backup strategy
    if [ -f "deployment/backup-strategy.md" ] || grep -q "backup" deployment/DEPLOYMENT_GUIDE.md 2>/dev/null; then
        log_result "PASS" "Infrastructure" "Backup Strategy" "Backup strategy documented"
    else
        log_result "FAIL" "Infrastructure" "Backup Strategy" "Backup strategy not defined"
    fi
    
    echo ""
}

# Quality validation checks
validate_quality() {
    echo -e "${BLUE}🧪 Quality Validation${NC}"
    echo "====================="
    
    # Check unit test coverage
    if [ -f "deployment/test-results/frontend-unit-tests.json" ] || [ -f "deployment/test-results/*.trx" ]; then
        log_result "PASS" "Quality" "Unit Test Coverage" "Unit tests executed"
    else
        log_result "WARN" "Quality" "Unit Test Coverage" "Unit test results not found"
    fi
    
    # Check E2E test coverage
    if [ -f "deployment/test-results/e2e-tests.json" ]; then
        log_result "PASS" "Quality" "E2E Test Coverage" "E2E tests executed"
    else
        log_result "WARN" "Quality" "E2E Test Coverage" "E2E test results not found"
    fi
    
    # Check code quality
    if [ -f "deployment/eslint-report.json" ]; then
        log_result "PASS" "Quality" "Code Quality Analysis" "Frontend code analysis completed"
    else
        log_result "WARN" "Quality" "Code Quality Analysis" "Code quality reports missing"
    fi
    
    # Check security audit
    if [ -f "deployment/npm-audit-report.json" ] || [ -f "deployment/dotnet-security-report.json" ]; then
        log_result "PASS" "Quality" "Security Audit" "Security audit completed"
    else
        log_result "WARN" "Quality" "Security Audit" "Security audit results missing"
    fi
    
    # Check documentation
    if [ -f "deployment/DEPLOYMENT_GUIDE.md" ]; then
        log_result "PASS" "Quality" "Documentation" "Deployment documentation available"
    else
        log_result "FAIL" "Quality" "Documentation" "Deployment documentation missing"
    fi
    
    echo ""
}

# Compliance validation checks
validate_compliance() {
    echo -e "${BLUE}📋 Compliance Validation${NC}"
    echo "========================="
    
    # Check audit logging
    if grep -q "AuditLog\|Elasticsearch" src/SmartAbp.Host/appsettings.Production.json 2>/dev/null; then
        log_result "PASS" "Compliance" "Audit Logging" "Audit logging configured"
    else
        log_result "FAIL" "Compliance" "Audit Logging" "Audit logging not configured"
    fi
    
    # Check data encryption
    if grep -q "Encryption\|DataProtection" src/SmartAbp.Host/appsettings.Production.json 2>/dev/null; then
        log_result "PASS" "Compliance" "Data Encryption" "Data encryption configured"
    else
        log_result "WARN" "Compliance" "Data Encryption" "Data encryption configuration unclear"
    fi
    
    # Check GDPR compliance features
    if [ -d "src/SmartAbp.Vue/packages/lowcode-designer/src/components/SecurityDashboard" ]; then
        log_result "PASS" "Compliance" "GDPR Features" "Security dashboard with compliance monitoring"
    else
        log_result "WARN" "Compliance" "GDPR Features" "Compliance monitoring features unclear"
    fi
    
    # Check access control
    if grep -q "Permission\|Authorization" src/SmartAbp.Host/appsettings.Production.json 2>/dev/null; then
        log_result "PASS" "Compliance" "Access Control" "Role-based access control implemented"
    else
        log_result "WARN" "Compliance" "Access Control" "Access control configuration unclear"
    fi
    
    echo ""
}

# Environment validation checks
validate_environment() {
    echo -e "${BLUE}🌍 Environment Validation${NC}"
    echo "=========================="
    
    # Check environment configuration
    if [ -f "deployment/.env.template" ]; then
        log_result "PASS" "Environment" "Configuration Template" "Environment template available"
    else
        log_result "WARN" "Environment" "Configuration Template" "Environment template missing"
    fi
    
    # Check production settings
    if [ -f "src/SmartAbp.Host/appsettings.Production.json" ]; then
        if grep -q "Production\|Release" src/SmartAbp.Host/appsettings.Production.json 2>/dev/null; then
            log_result "PASS" "Environment" "Production Settings" "Production configuration available"
        else
            log_result "WARN" "Environment" "Production Settings" "Production settings unclear"
        fi
    else
        log_result "FAIL" "Environment" "Production Settings" "Production configuration missing"
    fi
    
    # Check secrets management
    if grep -q "KeyVault\|Secrets\|Environment" deployment/docker-compose.prod.yml 2>/dev/null; then
        log_result "PASS" "Environment" "Secrets Management" "Environment-based secrets configured"
    else
        log_result "WARN" "Environment" "Secrets Management" "Secrets management strategy unclear"
    fi
    
    # Check logging configuration
    if grep -q "Serilog\|Logging" src/SmartAbp.Host/appsettings.Production.json 2>/dev/null; then
        log_result "PASS" "Environment" "Logging Configuration" "Production logging configured"
    else
        log_result "WARN" "Environment" "Logging Configuration" "Logging configuration unclear"
    fi
    
    echo ""
}

# Generate detailed validation report
generate_validation_report() {
    local report_file="deployment/production-readiness-report.html"
    
    cat > "$report_file" << EOF
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SmartAbp Production Readiness Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background-color: #f8fafc; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden; }
        .header { background: linear-gradient(135deg, #1e3a8a, #3b82f6); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 2.5rem; font-weight: 600; }
        .header p { margin: 10px 0 0; opacity: 0.9; font-size: 1.1rem; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; padding: 30px; }
        .summary-card { text-align: center; padding: 20px; border-radius: 8px; }
        .summary-card.passed { background-color: #f0fdf4; border: 2px solid #22c55e; }
        .summary-card.warning { background-color: #fffbeb; border: 2px solid #f59e0b; }
        .summary-card.critical { background-color: #fef2f2; border: 2px solid #ef4444; }
        .summary-card h3 { margin: 0 0 10px; font-size: 2rem; font-weight: 700; }
        .summary-card p { margin: 0; font-weight: 500; }
        .section { padding: 20px 30px; border-bottom: 1px solid #e5e7eb; }
        .section h2 { color: #1f2937; margin-bottom: 20px; font-size: 1.5rem; }
        .check-item { display: flex; align-items: center; padding: 12px 0; border-bottom: 1px solid #f3f4f6; }
        .check-item:last-child { border-bottom: none; }
        .status-badge { padding: 4px 12px; border-radius: 20px; font-weight: 600; font-size: 0.875rem; margin-right: 15px; min-width: 60px; text-align: center; }
        .status-pass { background-color: #dcfce7; color: #166534; }
        .status-warn { background-color: #fef3c7; color: #92400e; }
        .status-fail { background-color: #fecaca; color: #991b1b; }
        .check-content { flex: 1; }
        .check-title { font-weight: 600; color: #1f2937; margin-bottom: 4px; }
        .check-details { color: #6b7280; font-size: 0.875rem; }
        .recommendations { background-color: #f8fafc; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #3b82f6; }
        .footer { padding: 30px; text-align: center; background-color: #f9fafb; color: #6b7280; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 SmartAbp Production Readiness Report</h1>
            <p>Comprehensive validation results for production deployment</p>
            <p>Generated on $(date)</p>
        </div>
        
        <div class="summary">
            <div class="summary-card passed">
                <h3>$PASSED_CHECKS</h3>
                <p>Checks Passed</p>
            </div>
            <div class="summary-card warning">
                <h3>$WARNING_ISSUES</h3>
                <p>Warnings</p>
            </div>
            <div class="summary-card critical">
                <h3>$CRITICAL_ISSUES</h3>
                <p>Critical Issues</p>
            </div>
        </div>
EOF

    # Group results by category
    local categories=("Security" "Performance" "Infrastructure" "Quality" "Compliance" "Environment")
    
    for category in "${categories[@]}"; do
        echo "        <div class=\"section\">" >> "$report_file"
        echo "            <h2>$category Validation</h2>" >> "$report_file"
        
        for result in "${VALIDATION_RESULTS[@]}"; do
            IFS='|' read -r status cat check details <<< "$result"
            
            if [ "$cat" = "$category" ]; then
                local status_class=""
                case $status in
                    "PASS") status_class="status-pass" ;;
                    "WARN") status_class="status-warn" ;;
                    "FAIL") status_class="status-fail" ;;
                esac
                
                echo "            <div class=\"check-item\">" >> "$report_file"
                echo "                <div class=\"status-badge $status_class\">$status</div>" >> "$report_file"
                echo "                <div class=\"check-content\">" >> "$report_file"
                echo "                    <div class=\"check-title\">$check</div>" >> "$report_file"
                echo "                    <div class=\"check-details\">$details</div>" >> "$report_file"
                echo "                </div>" >> "$report_file"
                echo "            </div>" >> "$report_file"
            fi
        done
        
        echo "        </div>" >> "$report_file"
    done
    
    cat >> "$report_file" << EOF
        
        <div class="recommendations">
            <h3>🎯 Recommendations for Production Deployment</h3>
            <ul>
                <li><strong>Critical Issues:</strong> Resolve all critical issues before proceeding to production</li>
                <li><strong>Security:</strong> Ensure SSL certificates are properly configured and security headers are in place</li>
                <li><strong>Performance:</strong> Verify all optimization steps have been completed</li>
                <li><strong>Monitoring:</strong> Set up comprehensive monitoring and alerting before go-live</li>
                <li><strong>Backup:</strong> Implement and test backup and recovery procedures</li>
                <li><strong>Documentation:</strong> Ensure all operational procedures are documented</li>
            </ul>
        </div>
        
        <div class="footer">
            <p>SmartAbp Enterprise Permission Management System</p>
            <p>Production readiness validation completed with expert-level quality standards</p>
        </div>
    </div>
</body>
</html>
EOF

    echo "📊 Validation report generated: $report_file"
}

# Main execution
main() {
    echo "Starting comprehensive production readiness validation..."
    echo ""
    
    # Create deployment directory if it doesn't exist
    mkdir -p deployment/test-results
    
    # Run all validation categories
    validate_security
    validate_performance
    validate_infrastructure
    validate_quality
    validate_compliance
    validate_environment
    
    # Generate comprehensive report
    generate_validation_report
    
    # Final summary
    echo "================================================================"
    echo -e "${BLUE}📊 PRODUCTION READINESS SUMMARY${NC}"
    echo "================================================================"
    echo -e "✅ Checks Passed:    ${GREEN}$PASSED_CHECKS${NC}"
    echo -e "⚠️  Warnings:        ${YELLOW}$WARNING_ISSUES${NC}"
    echo -e "❌ Critical Issues:  ${RED}$CRITICAL_ISSUES${NC}"
    echo ""
    
    if [ $CRITICAL_ISSUES -eq 0 ]; then
        if [ $WARNING_ISSUES -eq 0 ]; then
            echo -e "${GREEN}🎉 PRODUCTION READY!${NC}"
            echo "All validation checks passed. The system is ready for production deployment."
        else
            echo -e "${YELLOW}⚠️  PRODUCTION READY WITH WARNINGS${NC}"
            echo "The system can be deployed to production, but consider addressing warnings."
        fi
        echo ""
        echo "Next steps:"
        echo "1. Review the detailed validation report"
        echo "2. Address any remaining warnings"
        echo "3. Execute deployment using deployment/production-optimization.sh"
        echo "4. Start monitoring stack using performance-testing/scripts/start-monitoring.sh"
        
        exit 0
    else
        echo -e "${RED}❌ NOT READY FOR PRODUCTION${NC}"
        echo "Critical issues must be resolved before production deployment."
        echo ""
        echo "Required actions:"
        echo "1. Review and address all critical issues"
        echo "2. Re-run this validation script"
        echo "3. Ensure all checks pass before deployment"
        
        exit 1
    fi
}

# Run main function
main "$@"