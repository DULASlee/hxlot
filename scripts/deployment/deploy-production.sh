#!/bin/bash

# ==========================================
# SmartAbp 生产环境一键部署脚本
# ==========================================

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 显示标题
print_header() {
    echo ""
    echo "=========================================="
    echo "  SmartAbp 生产环境部署工具"
    echo "  Version: 1.0.0"
    echo "  Platform: Docker/Kubernetes"
    echo "=========================================="
    echo ""
}

# 检查先决条件
check_prerequisites() {
    log_info "检查部署先决条件..."
    
    # 检查Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker未安装，请先安装Docker"
        exit 1
    fi
    log_success "Docker已安装: $(docker --version)"
    
    # 检查Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_warn "Docker Compose未安装，将使用docker compose命令"
    else
        log_success "Docker Compose已安装: $(docker-compose --version)"
    fi
    
    # 检查kubectl（如果部署到K8s）
    if [ "$DEPLOY_TARGET" = "kubernetes" ]; then
        if ! command -v kubectl &> /dev/null; then
            log_error "kubectl未安装，请先安装kubectl"
            exit 1
        fi
        log_success "kubectl已安装: $(kubectl version --client --short)"
    fi
    
    echo ""
}

# 加载环境变量
load_env_file() {
    if [ -f ".env.production" ]; then
        log_info "加载生产环境变量..."
        export $(cat .env.production | grep -v '^#' | xargs)
        log_success "环境变量加载完成"
    else
        log_error ".env.production 文件不存在"
        log_info "请创建 .env.production 文件并配置必要的环境变量"
        exit 1
    fi
    echo ""
}

# 验证环境变量
validate_env() {
    log_info "验证必要的环境变量..."
    
    REQUIRED_VARS=(
        "DB_PASSWORD"
        "REDIS_PASSWORD"
        "JWT_SECRET_KEY"
        "ELASTIC_PASSWORD"
        "GRAFANA_PASSWORD"
    )
    
    MISSING_VARS=()
    for var in "${REQUIRED_VARS[@]}"; do
        if [ -z "${!var}" ]; then
            MISSING_VARS+=("$var")
        fi
    done
    
    if [ ${#MISSING_VARS[@]} -gt 0 ]; then
        log_error "以下环境变量未设置："
        for var in "${MISSING_VARS[@]}"; do
            echo "  - $var"
        done
        exit 1
    fi
    
    log_success "环境变量验证通过"
    echo ""
}

# 构建Docker镜像
build_images() {
    log_info "开始构建Docker镜像..."
    
    export BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    export VERSION=${VERSION:-1.0.0}
    
    log_info "构建参数:"
    log_info "  BUILD_DATE: $BUILD_DATE"
    log_info "  VERSION: $VERSION"
    
    docker build \
        --file Dockerfile.production \
        --tag smartabp/lowcode-generator:${VERSION} \
        --tag smartabp/lowcode-generator:latest \
        --build-arg BUILD_DATE="$BUILD_DATE" \
        --build-arg VERSION="$VERSION" \
        .
    
    if [ $? -eq 0 ]; then
        log_success "Docker镜像构建成功"
    else
        log_error "Docker镜像构建失败"
        exit 1
    fi
    echo ""
}

# Docker Compose部署
deploy_docker_compose() {
    log_info "使用Docker Compose部署..."
    
    # 停止旧容器
    log_info "停止旧容器..."
    docker-compose -f docker-compose.production.yml down
    
    # 启动新容器
    log_info "启动新容器..."
    docker-compose -f docker-compose.production.yml up -d
    
    if [ $? -eq 0 ]; then
        log_success "Docker Compose部署成功"
    else
        log_error "Docker Compose部署失败"
        exit 1
    fi
    
    # 等待服务启动
    log_info "等待服务启动..."
    sleep 30
    
    # 检查服务状态
    check_services_health_docker
    
    echo ""
}

# Kubernetes部署
deploy_kubernetes() {
    log_info "使用Kubernetes部署..."
    
    # 创建命名空间
    log_info "创建命名空间..."
    kubectl create namespace smartabp-production --dry-run=client -o yaml | kubectl apply -f -
    
    # 应用ConfigMap和Secret
    log_info "应用配置..."
    kubectl apply -f deployment/k8s/production/configmap.yaml
    kubectl apply -f deployment/k8s/production/secret.yaml
    
    # 应用部署
    log_info "应用部署配置..."
    kubectl apply -f deployment/k8s/production/deployment.yaml
    
    # 等待部署完成
    log_info "等待部署完成..."
    kubectl rollout status deployment/smartabp-app -n smartabp-production --timeout=5m
    
    if [ $? -eq 0 ]; then
        log_success "Kubernetes部署成功"
    else
        log_error "Kubernetes部署失败"
        exit 1
    fi
    
    # 检查服务状态
    check_services_health_k8s
    
    echo ""
}

# 检查Docker服务健康状态
check_services_health_docker() {
    log_info "检查服务健康状态..."
    
    SERVICES=("smartabp-app-prod" "smartabp-postgres-prod" "smartabp-redis-prod")
    
    for service in "${SERVICES[@]}"; do
        HEALTH=$(docker inspect --format='{{.State.Health.Status}}' $service 2>/dev/null || echo "not_found")
        
        if [ "$HEALTH" = "healthy" ]; then
            log_success "$service: 健康"
        elif [ "$HEALTH" = "not_found" ]; then
            log_warn "$service: 未找到"
        else
            log_warn "$service: $HEALTH"
        fi
    done
    
    echo ""
}

# 检查Kubernetes服务健康状态
check_services_health_k8s() {
    log_info "检查服务健康状态..."
    
    kubectl get pods -n smartabp-production
    
    echo ""
}

# 显示部署信息
show_deployment_info() {
    log_success "=========================================="
    log_success "部署完成！"
    log_success "=========================================="
    echo ""
    
    if [ "$DEPLOY_TARGET" = "docker-compose" ]; then
        log_info "访问地址："
        log_info "  应用: http://localhost:${APP_PORT:-5000}"
        log_info "  Grafana: http://localhost:3000"
        log_info "  Prometheus: http://localhost:9090"
        echo ""
        log_info "查看日志："
        log_info "  docker-compose -f docker-compose.production.yml logs -f smartabp"
        echo ""
        log_info "停止服务："
        log_info "  docker-compose -f docker-compose.production.yml down"
    else
        log_info "查看部署状态："
        log_info "  kubectl get pods -n smartabp-production"
        echo ""
        log_info "查看日志："
        log_info "  kubectl logs -f deployment/smartabp-app -n smartabp-production"
        echo ""
        log_info "访问应用："
        log_info "  kubectl port-forward service/smartabp-app 5000:80 -n smartabp-production"
    fi
    
    echo ""
}

# 回滚部署
rollback_deployment() {
    log_warn "回滚部署..."
    
    if [ "$DEPLOY_TARGET" = "kubernetes" ]; then
        kubectl rollout undo deployment/smartabp-app -n smartabp-production
        log_success "Kubernetes部署已回滚"
    else
        log_warn "Docker Compose部署需要手动回滚"
    fi
    
    echo ""
}

# 主函数
main() {
    print_header
    
    # 解析参数
    DEPLOY_TARGET=${1:-docker-compose}
    
    if [ "$DEPLOY_TARGET" != "docker-compose" ] && [ "$DEPLOY_TARGET" != "kubernetes" ]; then
        log_error "无效的部署目标: $DEPLOY_TARGET"
        log_info "用法: $0 [docker-compose|kubernetes]"
        exit 1
    fi
    
    log_info "部署目标: $DEPLOY_TARGET"
    echo ""
    
    # 执行部署流程
    check_prerequisites
    load_env_file
    validate_env
    build_images
    
    if [ "$DEPLOY_TARGET" = "docker-compose" ]; then
        deploy_docker_compose
    else
        deploy_kubernetes
    fi
    
    show_deployment_info
}

# 错误处理
trap 'log_error "部署过程中发生错误，正在回滚..."; rollback_deployment; exit 1' ERR

# 执行主函数
main "$@"
