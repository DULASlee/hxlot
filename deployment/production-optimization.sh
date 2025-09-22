#!/bin/bash

# Production Deployment Optimization Script
# Stage 6.3 Final Optimization & Production Deployment
# 
# This script performs final optimizations and prepares the SmartAbp system for production deployment

echo "🚀 SmartAbp Production Deployment Optimization"
echo "=============================================="
echo "Performing final optimizations and production readiness checks..."
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="$(pwd)"
VUE_APP_DIR="$PROJECT_ROOT/src/SmartAbp.Vue"
API_DIR="$PROJECT_ROOT/src"
DEPLOYMENT_DIR="$PROJECT_ROOT/deployment"
OPTIMIZATION_REPORT="$DEPLOYMENT_DIR/optimization-report.html"

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
    log "Checking production deployment prerequisites..."
    
    local required_tools=("node" "npm" "dotnet" "docker")
    local missing_tools=()
    
    for tool in "${required_tools[@]}"; do
        if ! command -v $tool &> /dev/null; then
            missing_tools+=($tool)
        fi
    done
    
    if [ ${#missing_tools[@]} -ne 0 ]; then
        error "Missing required tools: ${missing_tools[*]}"
        error "Please install all required tools before proceeding"
        exit 1
    fi
    
    success "All required tools are available"
}

# Function to optimize Vue.js frontend
optimize_frontend() {
    log "Optimizing Vue.js frontend for production..."
    
    if [ ! -d "$VUE_APP_DIR" ]; then
        error "Vue.js application directory not found: $VUE_APP_DIR"
        return 1
    fi
    
    cd "$VUE_APP_DIR"
    
    # Install dependencies
    log "Installing frontend dependencies..."
    npm ci --production=false
    
    # Run code quality checks
    log "Running ESLint analysis..."
    npx eslint src/ --ext .js,.vue,.ts --format json --output-file "$DEPLOYMENT_DIR/eslint-report.json" || true
    
    # Run security audit
    log "Running npm security audit..."
    npm audit --audit-level=moderate --json > "$DEPLOYMENT_DIR/npm-audit-report.json" || true
    
    # Bundle analysis
    log "Analyzing bundle size..."
    npm run build -- --report --report-json
    
    # Move build artifacts
    if [ -d "dist" ]; then
        mv dist/report.html "$DEPLOYMENT_DIR/bundle-report.html" 2>/dev/null || true
        mv dist/report.json "$DEPLOYMENT_DIR/bundle-report.json" 2>/dev/null || true
    fi
    
    # Optimize images and assets
    log "Optimizing static assets..."
    if [ -d "src/assets/images" ]; then
        find src/assets/images -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" | while read img; do
            # Use imagemin or similar tool if available
            if command -v imagemin &> /dev/null; then
                imagemin "$img" --out-dir="$(dirname "$img")/optimized/" --plugins=imagemin-mozjpeg --plugins=imagemin-pngquant
            fi
        done
    fi
    
    # Create production build
    log "Creating optimized production build..."
    NODE_ENV=production npm run build
    
    if [ $? -eq 0 ]; then
        success "Frontend optimization completed successfully"
        
        # Calculate build size
        if [ -d "dist" ]; then
            local build_size=$(du -sh dist | cut -f1)
            info "Production build size: $build_size"
        fi
    else
        error "Frontend build failed"
        return 1
    fi
    
    cd "$PROJECT_ROOT"
}

# Function to optimize .NET backend
optimize_backend() {
    log "Optimizing .NET backend for production..."
    
    # Find the main project file
    local main_project=$(find "$API_DIR" -name "*.Host.csproj" | head -1)
    
    if [ -z "$main_project" ]; then
        warning "Main .NET project not found, skipping backend optimization"
        return 0
    fi
    
    local project_dir=$(dirname "$main_project")
    cd "$project_dir"
    
    # Restore packages
    log "Restoring NuGet packages..."
    dotnet restore
    
    # Run security analysis
    log "Running .NET security analysis..."
    if command -v dotnet-retire &> /dev/null; then
        dotnet retire --outputformat=json --outputfile="$DEPLOYMENT_DIR/dotnet-security-report.json" || true
    fi
    
    # Code analysis
    log "Running code analysis..."
    dotnet build --configuration Release --verbosity quiet
    
    # Create optimized publish
    log "Creating optimized production publish..."
    dotnet publish --configuration Release --output "$DEPLOYMENT_DIR/publish" \
        --runtime linux-x64 --self-contained false \
        /p:PublishTrimmed=false \
        /p:PublishSingleFile=false \
        /p:IncludeNativeLibrariesForSelfExtract=true
    
    if [ $? -eq 0 ]; then
        success "Backend optimization completed successfully"
        
        # Calculate publish size
        if [ -d "$DEPLOYMENT_DIR/publish" ]; then
            local publish_size=$(du -sh "$DEPLOYMENT_DIR/publish" | cut -f1)
            info "Production publish size: $publish_size"
        fi
    else
        error "Backend publish failed"
        return 1
    fi
    
    cd "$PROJECT_ROOT"
}

# Function to run comprehensive tests
run_comprehensive_tests() {
    log "Running comprehensive test suite..."
    
    local test_results_dir="$DEPLOYMENT_DIR/test-results"
    mkdir -p "$test_results_dir"
    
    # Frontend tests
    if [ -d "$VUE_APP_DIR" ]; then
        log "Running frontend unit tests..."
        cd "$VUE_APP_DIR"
        npm run test:unit -- --reporter=json --outputFile="$test_results_dir/frontend-unit-tests.json" || true
        cd "$PROJECT_ROOT"
    fi
    
    # Backend tests
    log "Running backend unit tests..."
    find "$API_DIR" -name "*.Tests.csproj" | while read test_project; do
        local project_name=$(basename "$test_project" .csproj)
        dotnet test "$test_project" --configuration Release \
            --logger "trx;LogFileName=$project_name.trx" \
            --results-directory "$test_results_dir" || true
    done
    
    # E2E tests
    if [ -d "$VUE_APP_DIR/cypress" ]; then
        log "Running E2E tests..."
        cd "$VUE_APP_DIR"
        npx cypress run --reporter json --reporter-options "output=$test_results_dir/e2e-tests.json" || true
        cd "$PROJECT_ROOT"
    fi
    
    # Performance tests
    if [ -d "performance-testing" ]; then
        log "Running performance validation tests..."
        cd "performance-testing"
        npm run test:performance -- --summary-export="$test_results_dir/performance-summary.json" || true
        cd "$PROJECT_ROOT"
    fi
    
    success "Comprehensive test suite completed"
}

# Function to run security validation
run_security_validation() {
    log "Running comprehensive security validation..."
    
    local security_results_dir="$DEPLOYMENT_DIR/security-results"
    mkdir -p "$security_results_dir"
    
    # OWASP dependency check for .NET
    if command -v dependency-check &> /dev/null; then
        log "Running OWASP dependency check..."
        dependency-check --project SmartAbp --scan "$API_DIR" \
            --format JSON --out "$security_results_dir/owasp-dependency-check.json" || true
    fi
    
    # Frontend security audit
    if [ -d "$VUE_APP_DIR" ]; then
        cd "$VUE_APP_DIR"
        log "Running frontend security audit..."
        npm audit --json > "$security_results_dir/frontend-audit.json" || true
        
        # Check for known vulnerabilities
        if command -v retire &> /dev/null; then
            retire --outputformat json --outputpath "$security_results_dir/retire-scan.json" || true
        fi
        cd "$PROJECT_ROOT"
    fi
    
    # Security test suite
    if [ -d "performance-testing" ]; then
        log "Running security test suite..."
        cd "performance-testing"
        npm run test:security:all || true
        cd "$PROJECT_ROOT"
    fi
    
    success "Security validation completed"
}

# Function to optimize database
optimize_database() {
    log "Preparing database optimization scripts..."
    
    # Create database optimization SQL scripts
    cat > "$DEPLOYMENT_DIR/database-optimization.sql" << 'EOF'
-- SmartAbp Database Production Optimization
-- Stage 6.3 Final Optimization

-- Update statistics for all tables
EXEC sp_updatestats;

-- Rebuild indexes for optimal performance
DECLARE @TableName NVARCHAR(255)
DECLARE @IndexName NVARCHAR(255)
DECLARE @SQL NVARCHAR(MAX)

DECLARE index_cursor CURSOR FOR
SELECT t.name AS TableName, i.name AS IndexName
FROM sys.tables t
INNER JOIN sys.indexes i ON t.object_id = i.object_id
WHERE i.type > 0 AND t.name LIKE 'Abp%' OR t.name LIKE 'SmartAbp%'

OPEN index_cursor
FETCH NEXT FROM index_cursor INTO @TableName, @IndexName

WHILE @@FETCH_STATUS = 0
BEGIN
    SET @SQL = 'ALTER INDEX [' + @IndexName + '] ON [' + @TableName + '] REBUILD WITH (ONLINE = ON, FILLFACTOR = 90)'
    PRINT @SQL
    -- EXEC sp_executesql @SQL  -- Uncomment to execute
    
    FETCH NEXT FROM index_cursor INTO @TableName, @IndexName
END

CLOSE index_cursor
DEALLOCATE index_cursor

-- Optimize audit log tables
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'AbpAuditLogs')
BEGIN
    -- Archive old audit logs (older than 1 year)
    PRINT 'Creating audit log archive strategy...'
    
    -- Create partitioned tables for better performance
    PRINT 'Consider implementing table partitioning for audit logs'
END

-- Performance monitoring indexes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_AbpAuditLogs_ExecutionTime')
BEGIN
    CREATE INDEX IX_AbpAuditLogs_ExecutionTime ON AbpAuditLogs (ExecutionTime DESC)
    PRINT 'Created performance index: IX_AbpAuditLogs_ExecutionTime'
END

-- Security optimization
-- Ensure proper permissions are set
PRINT 'Reviewing database security permissions...'

-- Performance baseline queries
SELECT 
    'Database Performance Baseline' AS Category,
    COUNT(*) AS TotalUsers,
    (SELECT COUNT(*) FROM AbpRoles) AS TotalRoles,
    (SELECT COUNT(*) FROM AbpPermissions) AS TotalPermissions,
    (SELECT COUNT(*) FROM AbpAuditLogs WHERE ExecutionTime > DATEADD(day, -30, GETDATE())) AS AuditLogsLast30Days
FROM AbpUsers;
EOF

    success "Database optimization scripts created"
}

# Function to create Docker configuration
create_docker_configuration() {
    log "Creating optimized Docker configuration..."
    
    # Multi-stage Dockerfile for production
    cat > "$DEPLOYMENT_DIR/Dockerfile" << 'EOF'
# SmartAbp Production Docker Configuration
# Stage 6.3 Final Optimization & Production Deployment

# Build stage for .NET API
FROM mcr.microsoft.com/dotnet/sdk:7.0 AS api-build
WORKDIR /src

# Copy csproj files and restore dependencies
COPY ["src/SmartAbp.Host/SmartAbp.Host.csproj", "SmartAbp.Host/"]
COPY ["src/SmartAbp.Application/SmartAbp.Application.csproj", "SmartAbp.Application/"]
COPY ["src/SmartAbp.Domain/SmartAbp.Domain.csproj", "SmartAbp.Domain/"]
COPY ["src/SmartAbp.EntityFrameworkCore/SmartAbp.EntityFrameworkCore.csproj", "SmartAbp.EntityFrameworkCore/"]
RUN dotnet restore "SmartAbp.Host/SmartAbp.Host.csproj"

# Copy source code and build
COPY src/ .
RUN dotnet publish "SmartAbp.Host/SmartAbp.Host.csproj" -c Release -o /app/publish \
    --runtime linux-x64 --self-contained false

# Build stage for Vue.js frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app

# Copy package files and install dependencies
COPY src/SmartAbp.Vue/package*.json ./
RUN npm ci --only=production=false

# Copy source code and build
COPY src/SmartAbp.Vue/ .
RUN npm run build

# Production runtime
FROM mcr.microsoft.com/dotnet/aspnet:7.0 AS runtime
WORKDIR /app

# Install necessary packages
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy API files
COPY --from=api-build /app/publish .

# Copy frontend build
COPY --from=frontend-build /app/dist ./wwwroot

# Create non-root user for security
RUN addgroup --gid 1001 --system smartabp && \
    adduser --no-create-home --shell /bin/false --disabled-password --uid 1001 --system --group smartabp
USER smartabp

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

EXPOSE 5000
ENTRYPOINT ["dotnet", "SmartAbp.Host.dll"]
EOF

    # Docker Compose for production
    cat > "$DEPLOYMENT_DIR/docker-compose.prod.yml" << 'EOF'
version: '3.8'

services:
  smartabp-app:
    build:
      context: ../
      dockerfile: deployment/Dockerfile
    container_name: smartabp-app
    ports:
      - "5000:5000"
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - ASPNETCORE_URLS=http://+:5000
      - ConnectionStrings__Default=Server=sqlserver;Database=SmartAbpProd;User=sa;Password=${SQL_PASSWORD};TrustServerCertificate=true
      - Redis__Configuration=redis:6379
      - Elasticsearch__Url=http://elasticsearch:9200
    depends_on:
      - sqlserver
      - redis
      - elasticsearch
    restart: unless-stopped
    networks:
      - smartabp-network

  sqlserver:
    image: mcr.microsoft.com/mssql/server:2022-latest
    container_name: smartabp-sqlserver
    environment:
      - ACCEPT_EULA=Y
      - SA_PASSWORD=${SQL_PASSWORD}
      - MSSQL_PID=Express
    ports:
      - "1433:1433"
    volumes:
      - sqlserver-data:/var/opt/mssql
    restart: unless-stopped
    networks:
      - smartabp-network

  redis:
    image: redis:7-alpine
    container_name: smartabp-redis
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    restart: unless-stopped
    networks:
      - smartabp-network

  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    container_name: smartabp-elasticsearch
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ports:
      - "9200:9200"
    volumes:
      - elasticsearch-data:/usr/share/elasticsearch/data
    restart: unless-stopped
    networks:
      - smartabp-network

  nginx:
    image: nginx:alpine
    container_name: smartabp-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - smartabp-app
    restart: unless-stopped
    networks:
      - smartabp-network

networks:
  smartabp-network:
    driver: bridge

volumes:
  sqlserver-data:
  redis-data:
  elasticsearch-data:
EOF

    # Nginx configuration
    cat > "$DEPLOYMENT_DIR/nginx.conf" << 'EOF'
events {
    worker_connections 1024;
}

http {
    upstream smartabp_backend {
        server smartabp-app:5000;
    }

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;

    server {
        listen 80;
        server_name _;
        
        # Redirect HTTP to HTTPS
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name _;

        # SSL configuration
        ssl_certificate /etc/nginx/ssl/smartabp.crt;
        ssl_certificate_key /etc/nginx/ssl/smartabp.key;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;

        # Security settings
        client_max_body_size 10M;
        
        # API endpoints with rate limiting
        location /api/auth/login {
            limit_req zone=login burst=3 nodelay;
            proxy_pass http://smartabp_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://smartabp_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Static files
        location / {
            proxy_pass http://smartabp_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Health check
        location /health {
            proxy_pass http://smartabp_backend;
            access_log off;
        }
    }
}
EOF

    success "Docker configuration created"
}

# Function to generate deployment documentation
generate_deployment_documentation() {
    log "Generating deployment documentation..."
    
    cat > "$DEPLOYMENT_DIR/DEPLOYMENT_GUIDE.md" << 'EOF'
# SmartAbp Production Deployment Guide

## Overview
This guide provides step-by-step instructions for deploying SmartAbp enterprise permission management system to production.

## Prerequisites
- Docker and Docker Compose
- SSL certificates
- Environment variables configured
- Database backup strategy

## Deployment Steps

### 1. Environment Configuration
```bash
# Copy environment template
cp .env.template .env

# Edit environment variables
# Required variables:
# - SQL_PASSWORD
# - JWT_SECRET
# - ENCRYPTION_KEY
```

### 2. SSL Certificates
```bash
# Place SSL certificates in deployment/ssl/
mkdir -p ssl
cp your-cert.crt ssl/smartabp.crt
cp your-key.key ssl/smartabp.key
```

### 3. Database Setup
```bash
# Run database migrations
dotnet ef database update --project src/SmartAbp.EntityFrameworkCore

# Execute optimization scripts
sqlcmd -i database-optimization.sql
```

### 4. Deploy Application
```bash
# Build and start services
docker-compose -f docker-compose.prod.yml up -d

# Verify deployment
docker-compose logs -f
```

### 5. Post-Deployment Verification
- [ ] Health check endpoint: https://your-domain/health
- [ ] Authentication system: https://your-domain/api/auth/health
- [ ] Security dashboard: https://your-domain/security/dashboard
- [ ] Performance monitoring: Check Grafana dashboards

## Monitoring
- Grafana: http://your-domain:3000
- Prometheus: http://your-domain:9090
- Application logs: `docker logs smartabp-app`

## Maintenance
- Regular security updates
- Database maintenance
- Performance monitoring
- Backup verification

## Rollback Procedure
```bash
# Stop current deployment
docker-compose -f docker-compose.prod.yml down

# Deploy previous version
docker-compose -f docker-compose.prod.yml up -d --build
```

## Security Checklist
- [ ] SSL/TLS certificates valid
- [ ] Security headers configured
- [ ] Rate limiting active
- [ ] Database encryption enabled
- [ ] Audit logging functional
- [ ] Backup encryption verified
EOF

    success "Deployment documentation generated"
}

# Function to generate optimization report
generate_optimization_report() {
    log "Generating comprehensive optimization report..."
    
    cat > "$OPTIMIZATION_REPORT" << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SmartAbp Production Optimization Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
        .header { background: linear-gradient(135deg, #1e3a8a, #3b82f6); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .section { margin: 20px 0; padding: 15px; border-left: 4px solid #3b82f6; background-color: #f8fafc; }
        .metric { display: inline-block; margin: 10px; padding: 15px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 6px; }
        .success { border-left-color: #10b981; background-color: #f0fdf4; }
        .warning { border-left-color: #f59e0b; background-color: #fffbeb; }
        .critical { border-left-color: #ef4444; background-color: #fef2f2; }
        .checklist { list-style-type: none; padding: 0; }
        .checklist li { margin: 5px 0; padding: 5px; background-color: #f0f9ff; border-radius: 4px; }
        .checklist li:before { content: "✅ "; color: #10b981; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left