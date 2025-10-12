# SmartAbp运维监控微服务 - 完整交付文档

## 🎯 项目概述

SmartAbp运维监控微服务（SmartAbp.OpsManagement.Service）是一个企业级、生产就绪的微服务，提供全栈应用性能监控(APM)、ELK日志管理、Kubernetes资源监控和智能告警管理。

### 核心特性

- ✅ **APM性能监控**: 实时监控CPU、内存、请求数、响应时间
- ✅ **ELK日志管理**: PostgreSQL+Elasticsearch双写，日志持久化与全文检索
- ✅ **K8s资源监控**: 监控Pods、Deployments、Services，实时查看日志
- ✅ **智能告警管理**: 灵活的告警规则配置，多渠道通知（邮件、短信、钉钉、Webhook）
- ✅ **Vue3前端集成**: 4个完整的监控面板，ECharts可视化
- ✅ **K8S生产部署**: 完整的Deployment、Service、Ingress、HPA配置
- ✅ **Aspire本地编排**: 一键启动完整开发环境，包含所有依赖服务

## 📁 项目结构

```
SmartAbp.OpsManagement.Service/
├── Domain/                                 # 领域层
│   ├── Entities/                           # 实体
│   │   ├── PerformanceMetric.cs            # 性能指标实体
│   │   ├── K8sResourceSnapshot.cs          # K8s资源快照实体
│   │   ├── AlertRule.cs                    # 告警规则实体
│   │   └── LogEntry.cs                     # 日志条目实体（数据库持久化）
│   └── Repositories/                       # 仓储接口
│       ├── IPerformanceMetricRepository.cs
│       └── ILogEntryRepository.cs
│
├── Application/                            # 应用层
│   ├── Contracts/                          # 应用服务契约
│   │   ├── Metrics/                        # APM指标DTOs
│   │   ├── Logs/                           # 日志DTOs
│   │   ├── K8s/                            # K8s资源DTOs
│   │   ├── Alerts/                         # 告警DTOs
│   │   └── Services/                       # 基础服务接口
│   │       ├── IPrometheusService.cs
│   │       ├── IElasticsearchService.cs
│   │       └── IKubernetesMonitorService.cs
│   └── Services/                           # 应用服务实现
│       ├── MetricsAppService.cs            # APM性能监控服务
│       ├── LogsAppService.cs               # 日志管理服务
│       ├── LogsAppServiceEnhanced.cs      # 日志双写增强服务
│       ├── K8sMonitorAppService.cs         # K8s监控服务
│       └── AlertsAppService.cs             # 告警管理服务
│
├── Infrastructure/                         # 基础设施层
│   ├── Prometheus/                         # Prometheus集成
│   │   └── PrometheusService.cs
│   ├── Elasticsearch/                      # Elasticsearch集成
│   │   └── ElasticsearchService.cs
│   ├── Kubernetes/                         # Kubernetes API集成
│   │   └── KubernetesMonitorService.cs
│   ├── EntityFrameworkCore/                # EF Core配置
│   │   └── OpsManagementDbContext.cs
│   └── Repositories/                       # 仓储实现
│       ├── EfCorePerformanceMetricRepository.cs
│       └── EfCoreLogEntryRepository.cs
│
├── HttpApi/                                # HTTP API层
│   └── Controllers/
│       ├── MetricsController.cs            # APM API
│       ├── LogsController.cs               # 日志API
│       ├── K8sController.cs                # K8s API
│       └── AlertsController.cs             # 告警API
│
└── Host/                                   # 主机项目
    ├── Program.cs                          # 启动入口（含Dapr配置）
    └── OpsManagementHostModule.cs          # ABP模块配置

SmartAbp.Vue/src/                           # Vue前端
├── router/modules/
│   └── ops-monitoring.ts                   # 运维监控路由
└── views/ops/
    ├── ApmDashboard.vue                    # APM性能监控面板
    ├── LogsDashboard.vue                   # ELK日志管理面板
    ├── K8sDashboard.vue                    # K8s监控面板
    └── AlertDashboard.vue                  # 告警管理面板

deployments/k8s/ops-monitoring/             # K8S部署配置
├── deployment.yaml                         # Deployment + RBAC
├── service.yaml                            # Service（ClusterIP + LoadBalancer）
├── configmap.yaml                          # ConfigMap
├── secret.yaml                             # Secret
├── dapr-component.yaml                     # Dapr组件配置
├── ingress.yaml                            # Ingress路由
├── hpa.yaml                                # 水平自动扩缩容
├── kustomization.yaml                      # Kustomize配置
└── README.md                               # 部署指南

src/SmartAbp.AspireHost/                    # Aspire编排
├── Program.cs                              # Aspire AppHost
├── appsettings.json                        # Aspire配置
└── prometheus/
    └── prometheus.yml                      # Prometheus配置
```

## 🚀 快速开始

### 本地开发（使用Aspire）

```bash
# 1. 安装.NET 9.0 SDK
dotnet --version

# 2. 安装Aspire工作负载
dotnet workload install aspire

# 3. 启动Aspire AppHost（一键启动所有服务）
cd src/SmartAbp.AspireHost
dotnet run

# 4. 访问Aspire Dashboard
open http://localhost:18888

# 5. 服务访问地址
# - 运维监控API: http://localhost:8080
# - 主Web应用: http://localhost:5000
# - 代码生成器: http://localhost:6000
# - Vue前端: http://localhost:3000
# - Prometheus: http://localhost:9090
# - Grafana: http://localhost:3000
```

### 生产部署（Kubernetes）

```bash
# 1. 前置条件检查
kubectl version
dapr status -k

# 2. 创建命名空间
kubectl create namespace smartabp

# 3. 配置Secret（⚠️ 必须替换所有密码）
vi deployments/k8s/ops-monitoring/secret.yaml
kubectl apply -f deployments/k8s/ops-monitoring/secret.yaml

# 4. 一键部署（推荐使用Kustomize）
kubectl apply -k deployments/k8s/ops-monitoring/

# 5. 验证部署
kubectl get all -n smartabp -l app=smartabp-ops-monitoring
kubectl logs -n smartabp -l app=smartabp-ops-monitoring -f

# 6. 访问服务
# - 通过LoadBalancer IP访问
kubectl get svc -n smartabp smartabp-ops-monitoring-lb
# - 通过Ingress访问（配置DNS后）
open https://ops.smartabp.com
```

## 📊 功能详解

### 1. APM性能监控

**后端API**:
- `GET /api/metrics/realtime?serviceName={name}` - 实时指标
- `GET /api/metrics/history?serviceName={name}&metricType={type}&startTime={start}&endTime={end}` - 历史趋势
- `GET /api/metrics/summary?serviceName={name}&period={period}` - 服务摘要

**前端面板**: `/ops-monitoring/apm`
- 实时指标卡片（CPU、内存、请求数、响应时间）
- ECharts趋势图（CPU/内存、响应时间P50/P95/P99）
- 服务性能摘要表格
- 自动刷新（30秒）

### 2. ELK日志管理

**后端API**:
- `POST /api/logs/search` - 日志搜索（支持关键词、级别、时间范围）
- `GET /api/logs/statistics?startTime={start}&endTime={end}` - 日志统计
- `POST /api/logs/index` - 索引单条日志
- `POST /api/logs/bulk-index` - 批量索引日志

**数据持久化**: PostgreSQL主存储 + Elasticsearch辅助索引（双写架构）

**前端面板**: `/ops-monitoring/logs`
- 日志统计卡片（总日志数、错误日志、警告日志、错误率）
- 日志级别分布饼图
- 24小时日志趋势图
- 高级搜索与分页
- 日志详情弹窗

### 3. K8s资源监控

**后端API**:
- `GET /api/k8s/summary?namespace={ns}` - 集群摘要
- `GET /api/k8s/resources?namespace={ns}&resourceType={type}` - 资源列表
- `GET /api/k8s/pod-logs?namespace={ns}&podName={name}&tailLines={n}` - Pod日志

**前端面板**: `/ops-monitoring/k8s`
- 集群摘要（节点数、Pod数、CPU/内存使用率）
- 资源Tab切换（Pods、Deployments、Services）
- Pod实时监控与操作
- Pod日志实时查看与下载

### 4. 智能告警管理

**后端API**:
- `GET /api/alerts` - 告警规则列表
- `POST /api/alerts` - 创建告警规则
- `PUT /api/alerts/{id}` - 更新告警规则
- `DELETE /api/alerts/{id}` - 删除告警规则
- `PUT /api/alerts/{id}/toggle` - 启用/禁用告警规则

**前端面板**: `/ops-monitoring/alerts`
- 告警规则配置（指标类型、阈值、严重级别）
- 通知渠道配置（邮件、短信、钉钉、Webhook）
- 告警历史时间线
- 规则搜索与过滤

## 🔧 技术栈

### 后端
- **.NET 9.0** - 运行时
- **ABP Framework** - 应用框架
- **Entity Framework Core** - ORM
- **PostgreSQL** - 主数据库
- **Prometheus** - APM监控
- **Elasticsearch** - 日志检索
- **Kubernetes Client** - K8s API
- **Dapr** - 微服务通信
- **Serilog** - 结构化日志
- **Swagger** - API文档

### 前端
- **Vue 3** - 渐进式框架
- **TypeScript** - 类型安全
- **Element Plus** - UI组件库
- **ECharts 5.x** - 数据可视化
- **Vue Router** - 路由管理
- **Vite** - 构建工具

### 部署
- **Kubernetes** - 容器编排
- **Dapr** - 服务网格
- **Nginx Ingress** - 入口控制器
- **cert-manager** - 证书管理
- **.NET Aspire** - 本地编排

## 📈 性能指标

- **资源使用**: CPU 250m-1000m, Memory 512Mi-1Gi
- **启动时间**: < 30秒
- **健康检查**: Liveness 30s, Readiness 10s
- **HPA扩缩容**: 2-10副本，基于CPU/内存/请求数
- **日志写入**: PostgreSQL主写 + Elasticsearch异步索引
- **监控抓取**: Prometheus 15秒间隔

## 🔐 安全特性

- ✅ 非root用户运行
- ✅ SecurityContext配置
- ✅ RBAC最小权限
- ✅ Secret加密存储
- ✅ TLS/HTTPS支持
- ✅ CORS跨域限制
- ✅ 限流保护
- ✅ JWT认证
- ✅ 审计日志

## 📞 运维支持

### 健康检查

```bash
# Liveness探针
curl http://localhost:8080/health

# Readiness探针
curl http://localhost:8080/health/ready
```

### 日志查看

```bash
# K8s日志
kubectl logs -n smartabp -l app=smartabp-ops-monitoring -f

# Dapr Sidecar日志
kubectl logs -n smartabp <pod-name> -c daprd
```

### 监控指标

```bash
# Prometheus指标
curl http://localhost:8080/metrics
```

### API文档

```bash
# Swagger UI
open http://localhost:8080/swagger
```

## 🎓 最佳实践

1. **数据持久化**: 使用PersistentVolume存储日志数据
2. **高可用**: 至少2个副本，配置PodDisruptionBudget
3. **自动扩缩容**: 配置HPA，基于CPU/内存/自定义指标
4. **监控告警**: 集成Prometheus + Grafana + Alertmanager
5. **日志聚合**: ELK Stack完整部署
6. **备份恢复**: 定期备份PostgreSQL数据库
7. **灰度发布**: 使用Ingress流量分割或Istio

## 📝 开发指南

### 添加新监控指标

1. 在`Domain/Entities`创建实体
2. 在`Application/Contracts`定义DTO和接口
3. 在`Application/Services`实现服务逻辑
4. 在`HttpApi/Controllers`暴露API
5. 在Vue前端创建对应面板

### 添加新告警规则

1. 在`AlertsAppService`扩展规则验证逻辑
2. 在`AlertDashboard.vue`添加新的指标类型
3. 配置通知渠道集成

### 数据库迁移

```bash
# 生成迁移
cd src/SmartAbp.OpsManagement.Service/Infrastructure
dotnet ef migrations add InitialCreate

# 应用迁移
dotnet ef database update
```

## 🌟 项目亮点

1. **企业级架构**: DDD分层设计，清晰的职责边界
2. **生产就绪**: 完整的K8S配置，支持一键部署
3. **双写架构**: PostgreSQL保证数据可靠性，Elasticsearch提供快速检索
4. **现代化前端**: Vue3 + TypeScript + Element Plus + ECharts
5. **云原生**: Dapr微服务通信，Aspire本地编排
6. **可观测性**: APM + Logging + Tracing完整支持
7. **高可用**: HPA自动扩缩容，PDB保证服务稳定性

## 📄 许可证

本项目采用 MIT 许可证

## 👥 贡献者

SmartAbp团队

---

**🎉 SmartAbp运维监控微服务已完美交付！**

