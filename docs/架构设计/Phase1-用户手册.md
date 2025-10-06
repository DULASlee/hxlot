# SmartAbp微服务编排设计器 - Phase 1用户手册

**版本**: v2.0 - Phase 1
**更新日期**: 2025-10-04
**适用对象**: 开发者、运维工程师、架构师

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 📖 目录

1. [功能概述](#功能概述)
2. [快速开始](#快速开始)
3. [多环境配置管理](#多环境配置管理)
4. [安全策略配置](#安全策略配置)
5. [可观测性配置](#可观测性配置)
6. [最佳实践](#最佳实践)
7. [故障排查](#故障排查)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 1. 功能概述

### 1.1 Phase 1核心能力

SmartAbp微服务编排设计器Phase 1提供企业级生产就绪的基础能力：

- ✅ **多环境配置管理** - 支持Development/Staging/Production 3个标准环境
- ✅ **安全策略配置** - 网络策略、RBAC、密钥管理
- ✅ **基础可观测性** - Prometheus、Grafana、Jaeger集成

### 1.2 技术架构

```
┌─────────────────────────────────────────────────────────┐
│          前端UI (Vue3 + TypeScript + Element Plus)      │
├─────────────────────────────────────────────────────────┤
│     环境配置面板  │  安全策略编辑器  │  可观测性仪表板  │
├─────────────────────────────────────────────────────────┤
│             API层 (RESTful + ABP RemoteService)         │
├─────────────────────────────────────────────────────────┤
│                   应用服务层 (ABP Application)           │
├─────────────────────────────────────────────────────────┤
│  Environment     │   Security      │  Observability    │
│  Management      │   Policy        │  Config           │
│  Service         │   Service       │  Service          │
├─────────────────────────────────────────────────────────┤
│              配置生成器 (K8s + Helm + Prometheus)        │
└─────────────────────────────────────────────────────────┘
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 2. 快速开始

### 2.1 前置要求

- ✅ Docker Desktop (用于本地Kubernetes集群)
- ✅ kubectl (用于与Kubernetes交互)
- ✅ Helm 3+ (用于部署Helm Charts)
- ✅ .NET 8+ SDK (用于后端开发)
- ✅ Node.js 18+ (用于前端开发)

### 2.2 启动应用

#### 后端服务
```bash
cd src/SmartAbp.Web
dotnet run
```

#### 前端应用
```bash
cd src/SmartAbp.Vue
npm install
npm run dev
```

#### 访问地址
- 前端UI: http://localhost:5173
- 后端API: http://localhost:5000
- Swagger: http://localhost:5000/swagger

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 3. 多环境配置管理

### 3.1 功能说明

多环境配置管理允许您为不同环境（Development/Staging/Production）定制化配置：
- 副本数
- 资源限制（CPU/Memory）
- 特性开关
- 部署策略
- 自动扩缩容
- 环境变量

### 3.2 操作步骤

#### Step 1: 打开环境配置面板
导航到：**低代码设计器 → 代码生成 → 环境配置**

#### Step 2: 选择环境
选择要配置的目标环境（Development/Staging/Production）

#### Step 3: 配置资源
```yaml
# Development环境示例
副本数: 1
CPU请求: 100m
CPU限制: 500m
内存请求: 128Mi
内存限制: 512Mi
```

#### Step 4: 配置特性开关
```yaml
✅ 启用遥测 (Telemetry)
✅ 启用指标 (Metrics)
✅ 启用追踪 (Tracing)
✅ 启用日志 (Logging)
✅ 启用健康检查 (Health Checks)
□ 启用Swagger (仅Development)
```

#### Step 5: 配置部署策略
```yaml
类型: RollingUpdate
最大增量: 25%
最大不可用: 0
就绪最小秒数: 10
```

#### Step 6: 配置自动扩缩容（可选）
```yaml
✅ 启用自动扩缩容
最小副本数: 2
最大副本数: 10
目标CPU使用率: 70%
目标内存使用率: 80%
```

#### Step 7: 保存配置
点击**保存**按钮，配置将被持久化

### 3.3 环境对比

使用环境对比功能快速发现不同环境之间的配置差异：

**操作步骤**:
1. 点击**环境对比**按钮
2. 选择要对比的两个环境（如Development vs Production）
3. 查看差异列表：
   - 🟢 绿色：环境2的值更高（更安全/更强）
   - 🔴 红色：环境2的值更低（需注意）
   - 🟡 黄色：配置类型不同（需评估）

**差异示例**:
```diff
配置项                  | Development  | Production  | 差异类型
副本数                  | 1            | 3           | Modified (🟢)
CPU限制                 | 500m         | 2000m       | Modified (🟢)
启用Swagger            | true         | false       | Modified (🔴)
```

### 3.4 生成Kubernetes Manifest

**操作步骤**:
1. 选择目标环境
2. 输入服务名称
3. 点击**生成Kubernetes Manifest**
4. 系统将生成：
   - `deployment-{service}.yaml` - Deployment配置
   - `service-{service}.yaml` - Service配置
   - `hpa-{service}.yaml` - HorizontalPodAutoscaler配置（如果启用）

**生成的Deployment示例**:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-service
  labels:
    app: my-service
    environment: production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-service
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 25%
      maxUnavailable: 0
  template:
    metadata:
      labels:
        app: my-service
    spec:
      containers:
      - name: my-service
        image: my-service:latest
        ports:
        - containerPort: 8080
        resources:
          requests:
            cpu: 500m
            memory: 512Mi
          limits:
            cpu: 2000m
            memory: 2Gi
        env:
        - name: ASPNETCORE_ENVIRONMENT
          value: "Production"
        - name: LOG_LEVEL
          value: "Warning"
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
```

### 3.5 生成Helm Chart

**操作步骤**:
1. 输入Chart名称
2. 选择要包含的服务列表
3. 选择要支持的环境
4. 点击**生成Helm Chart**
5. 系统将生成：
   - `Chart.yaml` - Chart元数据
   - `values.yaml` - 默认值配置
   - `templates/deployment.yaml` - Deployment模板
   - `templates/service.yaml` - Service模板
   - `templates/hpa.yaml` - HPA模板

**使用Helm Chart部署**:
```bash
# Development环境
helm install my-release ./my-chart \
  --values values-development.yaml \
  --namespace development

# Production环境
helm install my-release ./my-chart \
  --values values-production.yaml \
  --namespace production
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 4. 安全策略配置

### 4.1 功能说明

安全策略配置提供全方位的Kubernetes安全保障：
- **网络策略** (Network Policy) - 控制Pod间通信
- **RBAC配置** (Role-Based Access Control) - 权限管理
- **密钥管理** (Secrets Management) - 敏感信息保护

### 4.2 网络策略配置

#### 策略类型
- **Allow**: 白名单模式，只允许指定的流量
- **Deny**: 黑名单模式，拒绝指定的流量

#### Ingress规则配置
控制进入Pod的流量：

**示例：允许HTTP/HTTPS流量**
```yaml
规则名称: allow-http-https
端口: 80, 443
协议: TCP
来源: 
  - 命名空间: default
  - 选择器: app=frontend
```

#### Egress规则配置
控制Pod发出的流量：

**示例：允许访问数据库**
```yaml
规则名称: allow-database
端口: 5432
协议: TCP
目标:
  - 命名空间: database
  - 选择器: app=postgres
```

#### 生成的NetworkPolicy示例
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: my-service-network-policy
spec:
  podSelector:
    matchLabels:
      app: my-service
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: default
    - podSelector:
        matchLabels:
          app: frontend
    ports:
    - protocol: TCP
      port: 80
    - protocol: TCP
      port: 443
  egress:
  - to:
    - namespaceSelector:
        matchLabels:
          name: database
    - podSelector:
        matchLabels:
          app: postgres
    ports:
    - protocol: TCP
      port: 5432
```

### 4.3 RBAC配置

#### 授权类型
- **RBAC**: 基于角色的访问控制
- **ABAC**: 基于属性的访问控制（高级）

#### 角色定义
**示例：只读角色**
```yaml
角色名称: readonly
权限:
  - get
  - list
  - watch
资源:
  - pods
  - services
  - deployments
```

**示例：开发者角色**
```yaml
角色名称: developer
权限:
  - get
  - list
  - watch
  - create
  - update
  - patch
资源:
  - pods
  - services
  - deployments
  - configmaps
  - secrets
```

#### 生成的RBAC Manifest
```yaml
# Role
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: developer
  namespace: development
rules:
- apiGroups: ["", "apps"]
  resources: ["pods", "services", "deployments", "configmaps", "secrets"]
  verbs: ["get", "list", "watch", "create", "update", "patch"]

---
# RoleBinding
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: developer-binding
  namespace: development
subjects:
- kind: User
  name: developer@example.com
  apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: Role
  name: developer
  apiGroup: rbac.authorization.k8s.io
```

### 4.4 密钥管理

#### 支持的密钥提供商
- **Kubernetes Secrets**: 原生Kubernetes密钥
- **Azure Key Vault**: Azure云密钥管理服务
- **HashiCorp Vault**: 企业密钥管理解决方案

#### Kubernetes Secrets配置
**示例：创建数据库密钥**
```yaml
密钥名称: database-credentials
类型: Opaque
键值对:
  - username: dbuser
  - password: ********
```

#### Azure Key Vault集成
**配置项**:
```yaml
Key Vault URI: https://myvault.vault.azure.net/
租户ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
客户端ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

**生成的Secret示例**:
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: database-credentials
type: Opaque
data:
  username: ZGJ1c2Vy  # base64编码
  password: ********   # base64编码
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 5. 可观测性配置

### 5.1 功能说明

可观测性配置提供完整的监控、追踪、日志解决方案：
- **Prometheus** - 指标采集和告警
- **Grafana** - 可视化仪表板
- **Jaeger** - 分布式追踪

### 5.2 Prometheus配置

#### 采集配置
```yaml
采集间隔: 15s
采集超时: 10s
指标路径: /metrics
```

#### 采集目标配置
**示例：采集微服务指标**
```yaml
任务名称: my-service
目标地址: my-service:8080
标签:
  - environment: production
  - team: backend
```

#### 告警规则配置
**示例：高错误率告警**
```yaml
规则名称: HighErrorRate
表达式: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
持续时间: 5m
严重级别: critical
描述: HTTP 5xx错误率超过5%
```

**示例：高延迟告警**
```yaml
规则名称: HighLatency
表达式: histogram_quantile(0.95, http_request_duration_seconds_bucket) > 1
持续时间: 5m
严重级别: warning
描述: P95延迟超过1秒
```

#### 生成的Prometheus配置
```yaml
global:
  scrape_interval: 15s
  scrape_timeout: 10s
  evaluation_interval: 15s

scrape_configs:
- job_name: my-service
  metrics_path: /metrics
  static_configs:
  - targets:
    - my-service:8080
    labels:
      environment: production
      team: backend

rule_files:
- /etc/prometheus/rules/*.yml
```

#### 生成的告警规则
```yaml
groups:
- name: my-service-alerts
  interval: 30s
  rules:
  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "HTTP 5xx错误率超过5%"
      description: "服务{{ $labels.service }}的错误率为{{ $value }}%"
      
  - alert: HighLatency
    expr: histogram_quantile(0.95, http_request_duration_seconds_bucket) > 1
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "P95延迟超过1秒"
      description: "服务{{ $labels.service }}的P95延迟为{{ $value }}秒"
```

### 5.3 Grafana仪表板配置

#### 黄金指标面板
SmartAbp自动生成Google SRE四大黄金指标面板：

**1. 延迟 (Latency)**
```yaml
面板标题: Request Latency
图表类型: Graph
指标:
  - P50延迟: histogram_quantile(0.50, http_request_duration_seconds_bucket)
  - P95延迟: histogram_quantile(0.95, http_request_duration_seconds_bucket)
  - P99延迟: histogram_quantile(0.99, http_request_duration_seconds_bucket)
```

**2. 流量 (Traffic)**
```yaml
面板标题: Request Rate
图表类型: Graph
指标:
  - 请求率: rate(http_requests_total[5m])
```

**3. 错误 (Errors)**
```yaml
面板标题: Error Rate
图表类型: Graph
指标:
  - 错误率: rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m])
```

**4. 饱和度 (Saturation)**
```yaml
面板标题: Resource Saturation
图表类型: Graph
指标:
  - CPU使用率: container_cpu_usage_seconds_total
  - 内存使用率: container_memory_usage_bytes / container_spec_memory_limit_bytes
```

#### 自定义面板
您也可以创建自定义面板：

**示例：数据库连接池监控**
```yaml
面板标题: Database Connection Pool
图表类型: Gauge
指标:
  - 活跃连接: db_connections_active
  - 空闲连接: db_connections_idle
  - 最大连接数: db_connections_max
```

### 5.4 Jaeger分布式追踪

#### 采样策略
- **Constant**: 固定采样率
- **Probabilistic**: 概率采样
- **RateLimiting**: 速率限制采样
- **Adaptive**: 自适应采样

**示例：生产环境采样配置**
```yaml
采样类型: Probabilistic
采样率: 0.01  # 1%采样率
```

#### 生成的Jaeger配置
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: jaeger-configuration
data:
  sampling-strategies.json: |
    {
      "default_strategy": {
        "type": "probabilistic",
        "param": 0.01
      }
    }
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 6. 最佳实践

### 6.1 环境配置最佳实践

#### 原则1：渐进式资源配置
```
Development  → Staging      → Production
1副本          2副本          3+副本
100m CPU      200m CPU       500m+ CPU
128Mi内存      256Mi内存      512Mi+ 内存
```

#### 原则2：生产环境关闭调试功能
```yaml
# ❌ 不要在生产环境启用
EnableSwagger: false
EnableDebugLogging: false

# ✅ 生产环境推荐配置
LogLevel: Warning
EnableHealthChecks: true
EnableMetrics: true
```

#### 原则3：设置合理的资源限制
```yaml
# 避免CPU限流影响性能
CPU Request: 500m
CPU Limit: 2000m  # 4倍于Request

# 避免OOM Killed
Memory Request: 512Mi
Memory Limit: 2Gi  # 4倍于Request
```

### 6.2 安全配置最佳实践

#### 原则1：最小权限原则
```yaml
# ✅ 只读角色只需要只读权限
permissions: [get, list, watch]

# ❌ 避免过度授权
permissions: [*]  # 不推荐！
```

#### 原则2：网络策略默认拒绝
```yaml
# ✅ 白名单模式
policyType: Allow
defaultAction: Deny

# ❌ 黑名单模式（不安全）
policyType: Deny
```

#### 原则3：密钥轮换策略
```yaml
# 生产环境推荐
密钥轮换周期: 90天
使用外部密钥管理: Azure Key Vault
启用密钥审计: true
```

### 6.3 可观测性最佳实践

#### 原则1：黄金指标优先
确保监控以下4个核心指标：
1. **延迟** - 请求响应时间
2. **流量** - 请求速率
3. **错误** - 错误率
4. **饱和度** - 资源使用率

#### 原则2：合理的告警阈值
```yaml
# ✅ 推荐阈值
P95延迟 > 1s    → 警告
错误率 > 5%     → 严重
CPU使用率 > 80% → 警告
内存使用率 > 85% → 严重

# ❌ 避免过度敏感的告警
P95延迟 > 100ms  # 太敏感，会产生告警疲劳
```

#### 原则3：生产环境降低采样率
```yaml
# Development
采样率: 100%  # 全量采样

# Staging
采样率: 10%   # 10%采样

# Production
采样率: 1%    # 1%采样（平衡性能和可观测性）
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 7. 故障排查

### 7.1 环境配置问题

#### 问题1：HPA不生效
**症状**: 配置了自动扩缩容，但Pod数量不变

**排查步骤**:
1. 检查Metrics Server是否安装：
   ```bash
   kubectl get deployment metrics-server -n kube-system
   ```

2. 检查HPA状态：
   ```bash
   kubectl get hpa my-service
   kubectl describe hpa my-service
   ```

3. 检查Pod的资源请求是否配置：
   ```yaml
   # HPA需要配置resources.requests
   resources:
     requests:
       cpu: 100m  # 必须配置！
       memory: 128Mi
   ```

**解决方案**:
- 安装Metrics Server
- 确保配置了资源请求
- 检查目标CPU使用率是否合理

#### 问题2：Deployment更新失败
**症状**: Deployment状态为"Progressing"但没有进展

**排查步骤**:
1. 检查事件：
   ```bash
   kubectl describe deployment my-service
   kubectl get events --sort-by='.lastTimestamp'
   ```

2. 检查镜像拉取：
   ```bash
   kubectl get pods -l app=my-service
   kubectl describe pod <pod-name>
   ```

**常见原因**:
- 镜像不存在或无权限拉取
- 资源不足（CPU/内存）
- 健康检查配置错误

### 7.2 安全策略问题

#### 问题1：网络策略导致服务不可访问
**症状**: 配置NetworkPolicy后，服务无法相互通信

**排查步骤**:
1. 检查NetworkPolicy规则：
   ```bash
   kubectl get networkpolicy
   kubectl describe networkpolicy <policy-name>
   ```

2. 临时禁用NetworkPolicy测试：
   ```bash
   kubectl delete networkpolicy <policy-name>
   ```

**解决方案**:
- 检查Ingress/Egress规则是否正确
- 确保podSelector和namespaceSelector匹配
- 使用`kubectl logs`查看连接错误

#### 问题2：RBAC权限不足
**症状**: 操作被拒绝"forbidden: User cannot..."

**排查步骤**:
1. 检查当前用户权限：
   ```bash
   kubectl auth can-i get pods --as=user@example.com
   ```

2. 检查RoleBinding：
   ```bash
   kubectl get rolebinding
   kubectl describe rolebinding <binding-name>
   ```

**解决方案**:
- 更新Role权限
- 检查RoleBinding的subjects是否正确
- 使用ClusterRole for 跨命名空间权限

### 7.3 可观测性问题

#### 问题1：Prometheus无法采集指标
**症状**: Grafana仪表板显示"No Data"

**排查步骤**:
1. 检查Prometheus Targets：
   访问 Prometheus UI → Status → Targets

2. 检查ServiceMonitor：
   ```bash
   kubectl get servicemonitor
   kubectl describe servicemonitor <name>
   ```

3. 检查服务暴露的指标：
   ```bash
   kubectl port-forward service/my-service 8080:80
   curl http://localhost:8080/metrics
   ```

**解决方案**:
- 确保服务暴露`/metrics`端点
- 检查ServiceMonitor的selector是否匹配Service labels
- 检查Prometheus配置的scrape_configs

#### 问题2：Grafana仪表板无数据
**症状**: Grafana仪表板空白或显示"No Data"

**排查步骤**:
1. 检查数据源连接：
   Grafana → Configuration → Data Sources → Test

2. 检查PromQL查询：
   Grafana → Explore → 手动执行查询

3. 检查时间范围：
   确保时间范围覆盖有数据的时间段

**解决方案**:
- 验证Prometheus数据源配置
- 检查PromQL查询语法
- 调整时间范围
- 检查Prometheus是否有数据（访问Prometheus UI）

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 附录A：环境配置参数说明

### 副本数 (Replicas)
| 环境 | 推荐值 | 说明 |
|-----|-------|------|
| Development | 1 | 单副本，节省资源 |
| Staging | 2 | 双副本，测试高可用 |
| Production | 3+ | 多副本，保证高可用 |

### 资源限制 (Resources)
| 环境 | CPU Request | CPU Limit | Memory Request | Memory Limit |
|-----|------------|-----------|----------------|--------------|
| Development | 100m | 500m | 128Mi | 512Mi |
| Staging | 200m | 1000m | 256Mi | 1Gi |
| Production | 500m | 2000m | 512Mi | 2Gi |

### 自动扩缩容 (AutoScaling)
| 环境 | 启用 | Min副本 | Max副本 | 目标CPU% | 目标内存% |
|-----|-----|--------|---------|----------|----------|
| Development | No | - | - | - | - |
| Staging | Yes | 2 | 5 | 70% | 80% |
| Production | Yes | 3 | 20 | 60% | 70% |

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 附录B：术语表

| 术语 | 说明 |
|-----|------|
| **K8s** | Kubernetes的简称 |
| **HPA** | Horizontal Pod Autoscaler，水平Pod自动扩缩容器 |
| **RBAC** | Role-Based Access Control，基于角色的访问控制 |
| **NetworkPolicy** | Kubernetes网络策略，控制Pod间流量 |
| **ServiceMonitor** | Prometheus Operator的CRD，用于服务发现 |
| **PromQL** | Prometheus Query Language，Prometheus查询语言 |
| **P95延迟** | 95th percentile latency，95%的请求延迟低于此值 |
| **黄金指标** | Google SRE提出的4个核心监控指标（延迟/流量/错误/饱和度） |

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 附录C：联系支持

- **技术支持**: support@smartabp.com
- **文档中心**: https://docs.smartabp.com
- **GitHub Issues**: https://github.com/smartabp/hxlot/issues
- **社区论坛**: https://community.smartabp.com

---

**版权所有 © 2025 SmartAbp. All rights reserved.**

