# SmartAbp 生产环境部署指南

## 📋 概述

本文档提供SmartAbp低代码生成器生产环境部署的完整指南，包括Docker Compose和Kubernetes两种部署方式。

## 🎯 部署架构

### 系统架构

```
┌─────────────────────────────────────────────────────┐
│                    Load Balancer                     │
│                  (Nginx/K8s Ingress)                │
└─────────────────────┬───────────────────────────────┘
                      │
        ┌─────────────┴──────────────┐
        │                            │
┌───────▼────────┐          ┌────────▼───────┐
│  SmartAbp App  │          │  SmartAbp App  │
│   (Replica 1)  │   ...    │   (Replica N)  │
└────────┬───────┘          └────────┬───────┘
         │                           │
    ┌────┴────────────────────────┬──┴────┐
    │                             │       │
┌───▼────┐   ┌──────────┐   ┌────▼────┐ │
│PostgreSQL│   │  Redis   │   │Elastic  │ │
│          │   │  Cache   │   │ Search  │ │
└──────────┘   └──────────┘   └─────────┘ │
                                ┌──────────▼───┐
                                │  Prometheus  │
                                │   Grafana    │
                                └──────────────┘
```

### 组件清单

| 组件 | 用途 | 副本数 | 资源配置 |
|-----|------|-------|---------|
| SmartAbp App | 主应用服务 | 3-10 | 0.5-2 CPU, 512Mi-2Gi内存 |
| PostgreSQL | 关系数据库 | 1 | 0.5-2 CPU, 512Mi-2Gi内存 |
| Redis | 缓存服务 | 1 | 0.25-1 CPU, 256Mi-1Gi内存 |
| Elasticsearch | 日志存储 | 1 | 0.5-2 CPU, 1-2Gi内存 |
| Prometheus | 指标监控 | 1 | 0.25-1 CPU, 256Mi-1Gi内存 |
| Grafana | 监控仪表板 | 1 | 0.25-1 CPU, 128Mi-512Mi内存 |
| Nginx | 反向代理 | 1 | 0.25-1 CPU, 128Mi-512Mi内存 |

## 🚀 快速开始

### 方式1：Docker Compose部署（推荐用于小型部署）

#### 前置条件

- Docker Engine 20.10+
- Docker Compose 2.0+
- 4核8GB以上服务器
- 50GB以上磁盘空间

#### 部署步骤

1. **克隆代码仓库**

```bash
git clone https://github.com/YourOrg/SmartAbp.git
cd SmartAbp
```

2. **创建环境变量文件**

```bash
cp .env.production.example .env.production
```

编辑`.env.production`文件，配置必要的环境变量：

```bash
# 数据库配置
DB_NAME=SmartAbp
DB_USER=smartabp
DB_PASSWORD=YourStrongPasswordHere

# Redis配置
REDIS_PASSWORD=YourRedisPasswordHere

# JWT配置
JWT_SECRET_KEY=YourJWTSecretKeyAtLeast32CharsLong

# Elasticsearch配置
ELASTIC_PASSWORD=YourElasticPasswordHere

# Grafana配置
GRAFANA_USER=admin
GRAFANA_PASSWORD=YourGrafanaPasswordHere

# 应用配置
DOMAIN=smartabp.yourdomain.com
APP_PORT=5000
VERSION=1.0.0
```

3. **执行一键部署脚本**

```bash
chmod +x scripts/deployment/deploy-production.sh
./scripts/deployment/deploy-production.sh docker-compose
```

4. **验证部署**

```bash
# 检查服务状态
docker-compose -f docker-compose.production.yml ps

# 查看日志
docker-compose -f docker-compose.production.yml logs -f smartabp

# 访问应用
curl http://localhost:5000/health
```

### 方式2：Kubernetes部署（推荐用于企业级部署）

#### 前置条件

- Kubernetes 1.24+
- kubectl CLI工具
- Helm 3.0+（可选）
- 3个以上节点，每个节点4核8GB
- 100GB以上存储空间

#### 部署步骤

1. **准备Kubernetes集群**

确保您有一个可用的Kubernetes集群，并配置了kubectl：

```bash
kubectl cluster-info
kubectl get nodes
```

2. **创建命名空间**

```bash
kubectl create namespace smartabp-production
```

3. **创建Secrets**

```bash
# 创建数据库密码
kubectl create secret generic smartabp-secrets \
  --from-literal=database-connection-string="Host=postgres-service;Port=5432;Database=SmartAbp;Username=smartabp;Password=YourPasswordHere" \
  --from-literal=redis-connection-string="redis-service:6379,password=YourRedisPasswordHere" \
  --from-literal=jwt-secret-key="YourJWTSecretKeyAtLeast32CharsLong" \
  -n smartabp-production
```

4. **创建ConfigMap**

```bash
kubectl create configmap smartabp-config \
  --from-file=production.json=config/production.json \
  --from-literal=app-self-url="https://smartabp.yourdomain.com" \
  --from-literal=app-cors-origins="https://smartabp.yourdomain.com" \
  -n smartabp-production
```

5. **执行部署**

```bash
chmod +x scripts/deployment/deploy-production.sh
./scripts/deployment/deploy-production.sh kubernetes
```

或手动应用配置：

```bash
kubectl apply -f deployment/k8s/production/deployment.yaml
kubectl apply -f deployment/k8s/production/ingress.yaml
```

6. **验证部署**

```bash
# 查看部署状态
kubectl get deployments -n smartabp-production

# 查看Pod状态
kubectl get pods -n smartabp-production

# 查看服务
kubectl get services -n smartabp-production

# 查看日志
kubectl logs -f deployment/smartabp-app -n smartabp-production
```

## 📊 性能优化配置

### 后端性能优化

生产配置文件已包含以下优化：

```json
{
  "performance": {
    "codeGeneration": {
      "maxConcurrentJobs": 50,
      "enableCaching": true,
      "enableIncrementalCompilation": true,
      "metadataReferenceCaching": true,
      "compilationPoolSize": 10
    }
  }
}
```

### 前端性能优化

- **代码分割**: 自动按路由分割代码
- **懒加载**: 组件和路由懒加载
- **虚拟滚动**: 大列表使用虚拟滚动
- **Bundle优化**: Minify + TreeShake + Compress

### 数据库优化

```json
{
  "database": {
    "connectionPooling": {
      "minPoolSize": 5,
      "maxPoolSize": 50
    },
    "queryOptimization": {
      "enableQueryCache": true,
      "queryCacheDuration": 300
    }
  }
}
```

## 🛡️ 安全配置

### HTTPS/TLS配置

生产环境强制使用HTTPS：

```json
{
  "security": {
    "https": {
      "enabled": true,
      "enforceHttps": true,
      "hsts": {
        "enabled": true,
        "maxAge": 31536000
      }
    }
  }
}
```

### JWT认证配置

```json
{
  "security": {
    "authentication": {
      "jwt": {
        "expirationMinutes": 60,
        "requireHttpsMetadata": true
      },
      "lockout": {
        "enabled": true,
        "maxFailedAttempts": 5
      }
    }
  }
}
```

### CORS配置

```json
{
  "security": {
    "cors": {
      "enabled": true,
      "allowedOrigins": ["https://yourdomain.com"],
      "allowCredentials": true
    }
  }
}
```

## 📈 监控和告警

### Prometheus监控

访问 `http://your-domain:9090` 查看Prometheus指标。

关键指标：
- `http_requests_total`: HTTP请求总数
- `http_request_duration_seconds`: 请求响应时间
- `code_generation_duration_seconds`: 代码生成耗时
- `dotnet_total_memory_bytes`: 内存使用

### Grafana仪表板

访问 `http://your-domain:3000` 查看Grafana仪表板。

默认用户名：`admin`  
密码：在`.env.production`中配置的`GRAFANA_PASSWORD`

预置仪表板：
- 应用性能监控
- 系统资源监控
- 代码生成监控
- 数据库性能监控

### 日志管理

日志存储在Elasticsearch中，可通过以下方式查看：

```bash
# Docker Compose
docker-compose -f docker-compose.production.yml logs -f smartabp

# Kubernetes
kubectl logs -f deployment/smartabp-app -n smartabp-production
```

### 告警规则

系统预配置了以下告警规则：

| 告警名称 | 触发条件 | 严重性 | 冷却时间 |
|---------|---------|-------|---------|
| HighErrorRate | 错误率 > 5% | Critical | 15分钟 |
| HighMemoryUsage | 内存使用 > 85% | Warning | 5分钟 |
| SlowCodeGeneration | 平均生成时间 > 30秒 | Warning | 10分钟 |

## 🔄 备份和恢复

### 自动备份

系统每天凌晨2点自动备份：

```json
{
  "backup": {
    "enabled": true,
    "schedule": "0 2 * * *",
    "retention": {
      "daily": 7,
      "weekly": 4,
      "monthly": 12
    }
  }
}
```

### 手动备份

```bash
# 备份数据库
docker exec smartabp-postgres-prod pg_dump -U smartabp SmartAbp > backup_$(date +%Y%m%d).sql

# 备份生成的代码
tar -czf generated_backup_$(date +%Y%m%d).tar.gz /path/to/generated
```

### 恢复

```bash
# 恢复数据库
docker exec -i smartabp-postgres-prod psql -U smartabp SmartAbp < backup_20251003.sql

# 恢复代码
tar -xzf generated_backup_20251003.tar.gz -C /path/to/restore
```

## 🔧 故障排除

### 常见问题

**1. 应用无法启动**

```bash
# 检查日志
docker-compose logs smartabp
kubectl logs deployment/smartabp-app -n smartabp-production

# 检查数据库连接
docker exec smartabp-postgres-prod pg_isready
```

**2. 性能问题**

- 检查Grafana仪表板
- 查看Prometheus指标
- 检查资源使用情况

**3. 数据库连接失败**

- 验证数据库密码
- 检查网络连通性
- 查看数据库日志

### 回滚部署

```bash
# Docker Compose
docker-compose -f docker-compose.production.yml down
docker-compose -f docker-compose.production.yml up -d

# Kubernetes
kubectl rollout undo deployment/smartabp-app -n smartabp-production
```

## 📚 相关资源

- [性能优化指南](../performance/performance-optimization-guide.md)
- [安全配置指南](./security-configuration-guide.md)
- [监控配置指南](./monitoring-configuration-guide.md)
- [故障排除指南](./troubleshooting-guide.md)

## 📝 更新日志

### v1.0.0 (2025-10-03)
- ✅ 初始生产部署配置
- ✅ Docker Compose支持
- ✅ Kubernetes支持
- ✅ 监控和告警系统
- ✅ 自动化部署脚本

---

**文档维护**: SmartAbp团队  
**最后更新**: 2025-10-03
