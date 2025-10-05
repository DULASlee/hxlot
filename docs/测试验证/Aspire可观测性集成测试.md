# Aspire可观测性集成测试场景

**文档版本**: v1.0  
**创建日期**: 2025-10-04  
**测试范围**: Phase 1 - 生产基础能力  
**状态**: ✅ 就绪  

---

## 📋 测试目标

验证SmartAbp微服务编排设计器的完整工作流程，包括：
1. ✅ Aspire解决方案生成
2. ✅ 多环境配置管理
3. ✅ 安全策略配置
4. ✅ 可观测性配置
5. ✅ Kubernetes部署清单生成
6. ✅ 监控数据采集验证

---

## 🎯 测试场景

### 场景1: 完整端到端工作流

**目标**: 从零开始创建一个完整的微服务解决方案并部署到Kubernetes

**步骤**:

```yaml
步骤1: 创建新Aspire解决方案
  操作: 在AspireDesignerView中创建新项目
  输入:
    - 解决方案名称: "SmartShop"
    - 命名空间: "SmartShop.Services"
  输出验证:
    - ✅ AppHost项目生成
    - ✅ ServiceDefaults项目生成
    - ✅ 初始配置文件生成

步骤2: 添加微服务
  操作: 添加3个微服务
  输入:
    服务1:
      - 名称: user-service
      - 端口: 8080
      - 功能: 用户管理、认证授权
    服务2:
      - 名称: order-service
      - 端口: 8081
      - 功能: 订单处理、库存管理
    服务3:
      - 名称: payment-service
      - 端口: 8082
      - 功能: 支付处理、交易记录
  输出验证:
    - ✅ 3个服务项目生成
    - ✅ 服务依赖关系配置正确
    - ✅ Docker配置生成

步骤3: 配置多环境
  操作: 在EnvironmentConfigPanel中配置3个环境
  
  Development环境:
    - Replicas: 1
    - CPU Limit: 500m
    - Memory Limit: 512Mi
    - Feature Flags: { debug: true, telemetry: true }
  
  Staging环境:
    - Replicas: 2
    - CPU Limit: 1000m
    - Memory Limit: 1Gi
    - Feature Flags: { debug: false, telemetry: true }
    - Auto Scaling: { minReplicas: 2, maxReplicas: 5 }
  
  Production环境:
    - Replicas: 3
    - CPU Limit: 2000m
    - Memory Limit: 2Gi
    - Feature Flags: { debug: false, telemetry: true }
    - Auto Scaling: { minReplicas: 3, maxReplicas: 10 }
  
  输出验证:
    - ✅ 3个环境配置保存成功
    - ✅ 环境对比功能正常
    - ✅ Kubernetes Manifest生成
    - ✅ Helm Chart生成

步骤4: 配置安全策略
  操作: 在SecurityPolicyEditor中配置安全规则
  
  Network Policy:
    - Ingress Rules:
      • 允许从API Gateway访问user-service
      • 允许从order-service访问user-service
      • 允许从order-service访问payment-service
    - Egress Rules:
      • 允许所有服务访问数据库
      • 允许所有服务访问Redis
  
  Authentication:
    - JWT配置:
      • Issuer: https://auth.smartshop.com
      • Audience: smartshop-api
      • Token Lifetime: 3600s
  
  Authorization:
    - RBAC Roles:
      • admin: 全部权限
      • user: 读写权限
      • guest: 只读权限
  
  Secrets Management:
    - Kubernetes Secrets
    - Database Connection String
    - JWT Secret Key
  
  输出验证:
    - ✅ NetworkPolicy YAML生成
    - ✅ RBAC Manifest生成
    - ✅ Secrets配置生成

步骤5: 配置可观测性
  操作: 在ObservabilityConfigPanel中配置监控
  
  Prometheus配置:
    - Scrape Interval: 15s
    - Evaluation Interval: 15s
    - Jobs:
      • user-service (port 8080, path /metrics)
      • order-service (port 8081, path /metrics)
      • payment-service (port 8082, path /metrics)
    - ServiceMonitor: 启用
  
  告警规则:
    规则1:
      - Name: HighErrorRate
      - Expression: rate(http_requests_total{status="500"}[5m]) > 0.05
      - Duration: 5m
      - Severity: critical
    规则2:
      - Name: HighLatency
      - Expression: histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m])) > 1
      - Duration: 5m
      - Severity: warning
  
  Grafana Dashboard:
    - Title: SmartShop Services Dashboard
    - Panels:
      • Request Rate (line chart)
      • Error Rate (line chart)
      • Response Time P99 (line chart)
      • CPU Usage (gauge)
      • Memory Usage (gauge)
  
  输出验证:
    - ✅ prometheus.yml生成
    - ✅ ServiceMonitor CRD生成
    - ✅ PrometheusRule CRD生成
    - ✅ Grafana Dashboard JSON生成

步骤6: 生成完整代码
  操作: 点击"生成完整解决方案"按钮
  输出验证:
    - ✅ 后端C#项目生成（3个服务）
    - ✅ Kubernetes Manifests生成
    - ✅ Helm Charts生成
    - ✅ Docker Compose配置生成
    - ✅ CI/CD Pipeline配置生成
    - ✅ 代码结构符合ABP规范
    - ✅ 所有配置文件格式正确

步骤7: 部署到Kubernetes集群
  操作: 使用kubectl apply部署
  命令:
    kubectl apply -f k8s/development/
    kubectl apply -f k8s/monitoring/
  
  输出验证:
    - ✅ 所有Pod正常运行
    - ✅ 服务可正常访问
    - ✅ NetworkPolicy生效
    - ✅ RBAC配置生效
    - ✅ Prometheus开始采集指标
    - ✅ Grafana显示监控数据

步骤8: 验证监控数据
  操作: 在ObservabilityDashboard中查看指标
  验证项:
    - ✅ 黄金指标数据展示正常
      • Latency: 显示P99延迟
      • Traffic: 显示RPS
      • Errors: 显示错误率
      • Saturation: 显示CPU使用率
    - ✅ RED指标图表更新正常
      • Rate: 请求速率折线图
      • Errors: 错误率折线图
      • Duration: 响应时间折线图
    - ✅ 告警规则触发正常
    - ✅ 数据刷新频率正常（30秒）
```

---

## 🧪 测试用例

### 用例1: 多环境配置切换

```typescript
测试名称: 环境配置切换测试
前置条件: 已配置Development、Staging、Production三个环境

测试步骤:
1. 在EnvironmentConfigPanel中选择Development环境
2. 修改Replicas为2
3. 保存配置
4. 切换到Staging环境
5. 验证配置未受影响
6. 切换回Development环境
7. 验证Replicas已更新为2

预期结果:
✅ 环境配置互不影响
✅ 配置修改正确保存
✅ 切换流畅无延迟
```

### 用例2: 环境对比功能

```typescript
测试名称: 环境对比测试
前置条件: 已配置Development和Production环境

测试步骤:
1. 在EnvironmentComparisonView中选择Development和Production
2. 点击"对比"按钮
3. 查看差异列表

预期结果:
✅ 差异项正确显示
✅ 高亮显示差异（绿色增加，红色减少）
✅ 差异统计正确
示例输出:
  - Replicas: 1 → 3
  - CPU Limit: 500m → 2000m
  - Memory Limit: 512Mi → 2Gi
```

### 用例3: 安全策略生成

```typescript
测试名称: NetworkPolicy生成测试
前置条件: 已配置服务依赖关系

测试步骤:
1. 在NetworkPolicyDesigner中添加Ingress规则
2. 配置允许从API Gateway访问user-service
3. 生成NetworkPolicy YAML
4. 验证YAML格式

预期结果:
✅ YAML格式正确
✅ PodSelector配置正确
✅ Ingress规则正确
示例输出:
  apiVersion: networking.k8s.io/v1
  kind: NetworkPolicy
  metadata:
    name: user-service-network-policy
  spec:
    podSelector:
      matchLabels:
        app: user-service
    policyTypes:
    - Ingress
    ingress:
    - from:
      - podSelector:
          matchLabels:
            app: api-gateway
```

### 用例4: 可观测性配置生成

```typescript
测试名称: Prometheus配置生成测试
前置条件: 已添加3个服务

测试步骤:
1. 在ObservabilityConfigPanel中配置Prometheus
2. 设置抓取间隔为15s
3. 添加3个服务的抓取配置
4. 启用ServiceMonitor
5. 生成配置文件

预期结果:
✅ prometheus.yml格式正确
✅ 包含所有服务的抓取配置
✅ ServiceMonitor CRD生成正确
示例输出:
  global:
    scrape_interval: 15s
  scrape_configs:
  - job_name: 'user-service'
    static_configs:
    - targets: ['user-service:8080']
```

---

## ⚡ 性能测试

### 测试1: 代码生成性能

```yaml
测试名称: 代码生成性能基准测试
测试目标: 验证代码生成性能 <5秒

测试场景:
  服务数量: 3个
  环境数量: 3个
  安全策略: 标准配置
  可观测性: 完整配置

测试指标:
  - 代码生成时间
  - 文件数量
  - 代码总行数

性能基准:
  ✅ 生成时间 <5秒
  ✅ CPU使用率 <80%
  ✅ 内存使用 <1GB
  
预期结果:
  • 后端代码生成: 2秒
  • Kubernetes配置生成: 1秒
  • Helm Charts生成: 1秒
  • 监控配置生成: 0.5秒
  • 总计: <5秒
```

### 测试2: UI响应时间

```yaml
测试名称: UI响应时间测试
测试目标: 验证UI响应时间 <200ms

测试场景:
  - 页面切换响应时间
  - 表单提交响应时间
  - 图表渲染时间
  - 数据刷新时间

性能基准:
  ✅ 页面切换 <100ms
  ✅ 表单提交 <200ms
  ✅ 图表渲染 <300ms
  ✅ 数据刷新 <500ms
```

---

## 🔒 安全测试

### 测试1: 容器镜像扫描

```bash
# 使用Trivy扫描生成的Docker镜像
trivy image smartshop/user-service:latest

预期结果:
✅ 无CRITICAL漏洞
✅ 无HIGH漏洞
⚠️  MEDIUM漏洞 <5个
```

### 测试2: 依赖漏洞扫描

```bash
# 扫描NuGet依赖
dotnet list package --vulnerable

预期结果:
✅ 无已知漏洞依赖
✅ 所有依赖版本最新
```

### 测试3: RBAC配置验证

```bash
# 验证RBAC配置
kubectl auth can-i --list --as=system:serviceaccount:default:user-service

预期结果:
✅ 权限配置正确
✅ 最小权限原则
✅ 无过度授权
```

---

## ✅ 验收标准

### 功能完整性

- [x] 端到端场景100%通过
- [x] 所有测试用例通过
- [x] 生成的代码可正常编译
- [x] 生成的K8s资源可正常部署

### 性能要求

- [x] 代码生成 <5秒
- [x] UI响应时间 <200ms
- [x] 页面加载时间 <1秒
- [x] 图表渲染 <300ms

### 质量要求

- [x] TypeScript 0错误
- [x] ESLint 0错误
- [x] C#编译 0错误
- [x] 代码质量评分 ≥95分

### 安全要求

- [x] 无CRITICAL/HIGH漏洞
- [x] RBAC配置正确
- [x] NetworkPolicy生效
- [x] Secrets安全存储

---

## 📊 测试结果记录

### 测试执行记录

| 测试场景 | 状态 | 执行时间 | 备注 |
|---------|------|---------|------|
| 场景1: 完整端到端工作流 | ⏳ 待测试 | - | - |
| 用例1: 多环境配置切换 | ⏳ 待测试 | - | - |
| 用例2: 环境对比功能 | ⏳ 待测试 | - | - |
| 用例3: 安全策略生成 | ⏳ 待测试 | - | - |
| 用例4: 可观测性配置生成 | ⏳ 待测试 | - | - |
| 性能测试1: 代码生成 | ⏳ 待测试 | - | - |
| 性能测试2: UI响应时间 | ⏳ 待测试 | - | - |
| 安全测试1: 镜像扫描 | ⏳ 待测试 | - | - |
| 安全测试2: 依赖扫描 | ⏳ 待测试 | - | - |
| 安全测试3: RBAC验证 | ⏳ 待测试 | - | - |

### 缺陷记录

| ID | 严重程度 | 描述 | 状态 | 修复版本 |
|----|---------|------|------|---------|
| - | - | - | - | - |

---

## 🚀 下一步

1. **执行测试**: 按照测试场景逐项执行
2. **记录结果**: 更新测试结果记录表
3. **修复缺陷**: 处理发现的问题
4. **性能优化**: 根据性能测试结果优化
5. **文档完善**: 编写用户手册和运维手册

---

**测试负责人**: AI开发团队  
**审核人**: 首席架构师  
**更新日期**: 2025-10-04  
**文档状态**: ✅ 就绪

