#!/bin/bash

# Real-time Performance Monitoring Startup Script
# Stage 6.2 Performance Monitoring & Analytics
# 
# This script starts all monitoring services and integrates with K6 performance tests

echo "🔧 SmartAbp Performance Monitoring Startup"
echo "=========================================="
echo "Starting comprehensive monitoring infrastructure..."
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
MONITORING_DIR="./monitoring"
DOCKER_COMPOSE_FILE="$MONITORING_DIR/docker-compose.yml"
PERFORMANCE_DASHBOARD="$MONITORING_DIR/performance-dashboard.html"

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

info() {
    echo -e "${PURPLE}[INFO] $1${NC}"
}

# Function to check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check K6
    if ! command -v k6 &> /dev/null; then
        warning "K6 is not installed. Performance tests will not be available."
    else
        success "K6 is available: $(k6 version)"
    fi
    
    success "Prerequisites check completed"
}

# Function to create monitoring directories
create_directories() {
    log "Creating monitoring directories..."
    
    mkdir -p $MONITORING_DIR/{prometheus,grafana/{provisioning,dashboards},alertmanager,influxdb}
    mkdir -p ./results/{monitoring,performance,security}
    
    success "Monitoring directories created"
}

# Function to start monitoring stack
start_monitoring_stack() {
    log "Starting monitoring stack with Docker Compose..."
    
    if [ ! -f "$DOCKER_COMPOSE_FILE" ]; then
        error "Docker Compose file not found: $DOCKER_COMPOSE_FILE"
        exit 1
    fi
    
    cd $MONITORING_DIR
    
    # Pull latest images
    log "Pulling latest Docker images..."
    docker-compose pull
    
    # Start services
    log "Starting monitoring services..."
    docker-compose up -d
    
    # Wait for services to be ready
    log "Waiting for services to start..."
    sleep 30
    
    cd - > /dev/null
    
    success "Monitoring stack started successfully"
}

# Function to check service health
check_service_health() {
    log "Checking service health..."
    
    services=(
        "Prometheus:http://localhost:9090/-/healthy"
        "Grafana:http://localhost:3000/api/health"
        "InfluxDB:http://localhost:8086/health"
        "AlertManager:http://localhost:9093/-/healthy"
    )
    
    for service_info in "${services[@]}"; do
        IFS=':' read -r service_name service_url <<< "$service_info"
        
        if curl -s --head --request GET "$service_url" | grep "200" > /dev/null; then
            success "$service_name is healthy"
        else
            warning "$service_name is not responding correctly"
        fi
    done
}

# Function to configure Grafana dashboards
configure_grafana() {
    log "Configuring Grafana dashboards..."
    
    # Wait for Grafana to be fully ready
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s http://admin:smartabp123@localhost:3000/api/health | grep "ok" > /dev/null; then
            break
        fi
        
        log "Waiting for Grafana to be ready... (attempt $attempt/$max_attempts)"
        sleep 5
        ((attempt++))
    done
    
    if [ $attempt -gt $max_attempts ]; then
        error "Grafana failed to start within expected time"
        return 1
    fi
    
    # Import dashboard
    local dashboard_file="$MONITORING_DIR/grafana/dashboards/smartabp-performance-dashboard.json"
    if [ -f "$dashboard_file" ]; then
        log "Importing SmartAbp performance dashboard..."
        
        curl -s -X POST \
            -H "Content-Type: application/json" \
            -d @"$dashboard_file" \
            http://admin:smartabp123@localhost:3000/api/dashboards/db > /dev/null
        
        success "Dashboard imported successfully"
    else
        warning "Dashboard file not found: $dashboard_file"
    fi
}

# Function to start performance dashboard
start_performance_dashboard() {
    log "Starting performance dashboard..."
    
    if [ -f "$PERFORMANCE_DASHBOARD" ]; then
        # Start simple HTTP server for the dashboard
        cd $(dirname "$PERFORMANCE_DASHBOARD")
        
        # Check if Python is available
        if command -v python3 &> /dev/null; then
            python3 -m http.server 8081 > /dev/null 2>&1 &
            local server_pid=$!
            echo $server_pid > .dashboard_server.pid
            
            success "Performance dashboard started at http://localhost:8081/performance-dashboard.html"
        elif command -v python &> /dev/null; then
            python -m SimpleHTTPServer 8081 > /dev/null 2>&1 &
            local server_pid=$!
            echo $server_pid > .dashboard_server.pid
            
            success "Performance dashboard started at http://localhost:8081/performance-dashboard.html"
        else
            warning "Python not found. Performance dashboard will not be available via HTTP server."
            info "You can open the dashboard directly: file://$PWD/$PERFORMANCE_DASHBOARD"
        fi
        
        cd - > /dev/null
    else
        warning "Performance dashboard file not found: $PERFORMANCE_DASHBOARD"
    fi
}

# Function to start continuous monitoring
start_continuous_monitoring() {
    log "Starting continuous performance monitoring..."
    
    # Create monitoring script
    cat > ./scripts/continuous-monitor.sh << 'EOF'
#!/bin/bash

# Continuous monitoring loop
while true; do
    echo "[$(date)] Running performance health check..."
    
    # Quick performance test
    k6 run --duration=30s --vus=5 \
        --out influxdb=http://localhost:8086/smartabp \
        tests/load/dashboard-load.js > /dev/null 2>&1
    
    # Security health check
    k6 run --duration=10s --vus=2 \
        --env K6_TEST_TYPE=health_check \
        tests/security/security-stress.js > /dev/null 2>&1
    
    # Wait 5 minutes before next check
    sleep 300
done
EOF

    chmod +x ./scripts/continuous-monitor.sh
    
    # Start continuous monitoring in background
    nohup ./scripts/continuous-monitor.sh > ./results/monitoring/continuous-monitor.log 2>&1 &
    local monitor_pid=$!
    echo $monitor_pid > .continuous_monitor.pid
    
    success "Continuous monitoring started (PID: $monitor_pid)"
}

# Function to display service URLs
display_service_urls() {
    log "Monitoring services are now available:"
    echo ""
    echo "📊 Grafana Dashboard:     http://localhost:3000 (admin/smartabp123)"
    echo "🔍 Prometheus:            http://localhost:9090"
    echo "💾 InfluxDB:              http://localhost:8086"
    echo "🚨 AlertManager:          http://localhost:9093"
    echo "📈 Performance Dashboard: http://localhost:8081/performance-dashboard.html"
    echo "📋 Node Exporter:        http://localhost:9100/metrics"
    echo "🐳 cAdvisor:              http://localhost:8080"
    echo ""
    echo "🔗 SmartAbp Application:  https://localhost:5001"
    echo ""
}

# Function to run integration tests
run_integration_tests() {
    log "Running monitoring integration tests..."
    
    # Test data flow to InfluxDB
    if command -v k6 &> /dev/null; then
        log "Running sample performance test with InfluxDB output..."
        
        k6 run --duration=1m --vus=10 \
            --out influxdb=http://localhost:8086/smartabp \
            tests/load/dashboard-load.js
        
        success "Integration test completed - check Grafana for data"
    else
        warning "K6 not available - skipping integration tests"
    fi
}

# Function to create monitoring alerts
setup_monitoring_alerts() {
    log "Setting up monitoring alerts..."
    
    # Create alert rules file
    cat > $MONITORING_DIR/prometheus/alert_rules.yml << 'EOF'
groups:
- name: smartabp.rules
  rules:
  - alert: HighResponseTime
    expr: smartabp_http_request_duration_seconds_bucket > 1
    for: 5m
    labels:
      severity: warning
      team: performance
    annotations:
      summary: "High response time detected"
      description: "Response time is above 1 second for 5 minutes"

  - alert: HighErrorRate
    expr: rate(smartabp_http_requests_total{status=~"5.."}[5m]) / rate(smartabp_http_requests_total[5m]) > 0.05
    for: 2m
    labels:
      severity: critical
      team: performance
    annotations:
      summary: "High error rate detected"
      description: "Error rate is above 5% for 2 minutes"

  - alert: SecurityBreach
    expr: increase(smartabp_security_alerts_total[5m]) > 10
    for: 1m
    labels:
      severity: critical
      team: security
    annotations:
      summary: "Potential security breach"
      description: "More than 10 security alerts in 5 minutes"

  - alert: HighCPUUsage
    expr: 100 - (avg(irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
    for: 5m
    labels:
      severity: warning
      team: infrastructure
    annotations:
      summary: "High CPU usage"
      description: "CPU usage is above 80% for 5 minutes"

  - alert: HighMemoryUsage
    expr: (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100 > 85
    for: 5m
    labels:
      severity: critical
      team: infrastructure
    annotations:
      summary: "High memory usage"
      description: "Memory usage is above 85% for 5 minutes"
EOF

    success "Monitoring alerts configured"
}

# Main execution flow
main() {
    log "Initializing SmartAbp Performance Monitoring..."
    
    # Execute setup steps
    check_prerequisites
    create_directories
    setup_monitoring_alerts
    start_monitoring_stack
    
    # Wait for services to stabilize
    sleep 15
    
    check_service_health
    configure_grafana
    start_performance_dashboard
    start_continuous_monitoring
    
    display_service_urls
    
    # Optional integration tests
    read -p "Run integration tests? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        run_integration_tests
    fi
    
    success "SmartAbp Performance Monitoring is now running!"
    info "Use 'docker-compose down' in the monitoring directory to stop services"
    info "Use 'kill \$(cat .continuous_monitor.pid)' to stop continuous monitoring"
}

# Handle script interruption
trap 'error "Monitoring setup interrupted by user"; exit 1' INT

# Run main function
main "$@"