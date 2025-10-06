# SmartAbp微服务编排设计器 - Phase 1运维手册

**版本**: v2.0 - Phase 1
**更新日期**: 2025-10-04
**适用对象**: 运维工程师、SRE、DevOps

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 📖 目录

1. [部署指南](#部署指南)
2. [监控与告警](#监控与告警)
3. [日常运维](#日常运维)
4. [故障处理](#故障处理)
5. [性能调优](#性能调优)
6. [备份与恢复](#备份与恢复)
7. [安全加固](#安全加固)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 1. 部署指南

### 1.1 系统要求

#### 硬件要求
| 环境 | CPU | 内存 | 存储 | 网络 |
|-----|-----|------|------|------|
| Development | 4核 | 8GB | 50GB SSD | 100Mbps |
| Staging | 8核 | 16GB | 200GB SSD | 1Gbps |
| Production | 16核+ | 32GB+ | 500GB+ SSD | 10Gbps |

#### 软件要求
- **操作系统**: Ubuntu 22.04 LTS / CentOS 8+ / RHEL 8+
- **Kubernetes**: 1.25+
- **Docker**: 24.0+
- **Helm**: 3.10+
- **.NET Runtime**: 8.0+
- **PostgreSQL**: 14+ (数据库)
- **Redis**: 7.0+ (缓存)

### 1.2 Kubernetes集群部署

#### Step 1: 准备命名空间
```bash
# 创建命名空间
kubectl create namespace smartabp-development
kubectl create namespace smartabp-staging
kubectl create namespace smartabp-production

# 设置默认命名空间
kubectl config set-context --current --namespace=smartabp-production
```

#### Step 2: 配置Secret
```bash
# 创建数据库密钥
kubectl create secret generic database-credentials \
  --from-literal=username=smartabp \
  --from-literal=password='YourSecurePassword' \
  -n smartabp-production

# 创建Redis密钥
kubectl create secret generic redis-credentials \
  --from-literal=password='YourRedisPassword' \
  -n smartabp-production
```

#### Step 3: 部署PostgreSQL
```bash
# 使用Helm部署PostgreSQL
helm repo add bitnami https://charts.bitnami.com/bitnami
helm install postgresql bitnami/postgresql \
  --set auth.username=smartabp \
  --set auth.password=YourSecurePassword \
  --set auth.database=SmartAbp \
  --set primary.persistence.size=100Gi \
  -n smartabp-production
```

#### Step 4: 部署Redis
```bash
# 使用Helm部署Redis
helm install redis bitnami/redis \
  --set auth.password=YourRedisPassword \
  --set master.persistence.size=10Gi \
  -n smartabp-production
```

#### Step 5: 部署SmartAbp应用
```bash
# 使用生成的Helm Chart部署
cd /path/to/smartabp-chart
helm install smartabp . \
  --values values-production.yaml \
  -n smartabp-production
```

#### Step 6: 验证部署
```bash
# 检查Pod状态
kubectl get pods -n smartabp-production

# 检查服务
kubectl get services -n smartabp-production

# 检查Ingress
kubectl get ingress -n smartabp-production

# 查看应用日志
kubectl logs -f deployment/smartabp-web -n smartabp-production
```

### 1.3 Docker Compose部署（开发/测试）

#### docker-compose.yml
```yaml
version: '3.8'

services:
  # PostgreSQL数据库
  postgres:
    image: postgres:14
    environment:
      POSTGRES_USER: smartabp
      POSTGRES_PASSWORD: YourSecurePassword
      POSTGRES_DB: SmartAbp
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    networks:
      - smartabp-network

  # Redis缓存
  redis:
    image: redis:7-alpine
    command: redis-server --requirepass YourRedisPassword
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    networks:
      - smartabp-network

  # SmartAbp后端
  smartabp-web:
    image: smartabp/smartabp-web:latest
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - ConnectionStrings__Default=Host=postgres;Port=5432;Database=SmartAbp;Username=smartabp;Password=YourSecurePassword
      - Redis__Configuration=redis,password=YourRedisPassword
    ports:
      - "5000:80"
    depends_on:
      - postgres
      - redis
    networks:
      - smartabp-network

  # SmartAbp前端
  smartabp-vue:
    image: smartabp/smartabp-vue:latest
    environment:
      - VITE_API_BASE_URL=http://smartabp-web
    ports:
      - "5173:80"
    depends_on:
      - smartabp-web
    networks:
      - smartabp-network

volumes:
  postgres_data:
  redis_data:

networks:
  smartabp-network:
    driver: bridge
```

**启动应用**:
```bash
docker-compose up -d
```

**验证部署**:
```bash
# 检查容器状态
docker-compose ps

# 查看日志
docker-compose logs -f smartabp-web

# 访问应用
curl http://localhost:5000/health
curl http://localhost:5173
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 2. 监控与告警

### 2.1 Prometheus部署

#### Step 1: 部署Prometheus Operator
```bash
# 添加Prometheus Operator Helm仓库
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# 部署Prometheus Operator
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace \
  --set prometheus.prometheusSpec.serviceMonitorSelectorNilUsesHelmValues=false
```

#### Step 2: 部署ServiceMonitor
使用SmartAbp生成的ServiceMonitor配置：
```bash
kubectl apply -f servicemonitor-smartabp.yaml -n smartabp-production
```

#### Step 3: 配置告警规则
```bash
kubectl apply -f alertrules-smartabp.yaml -n monitoring
```

#### Step 4: 验证采集
```bash
# 端口转发Prometheus UI
kubectl port-forward -n monitoring svc/prometheus-kube-prometheus-prometheus 9090:9090

# 访问 http://localhost:9090
# 检查 Status → Targets，确认smartabp服务为UP状态
```

### 2.2 Grafana仪表板

#### Step 1: 访问Grafana
```bash
# 获取Grafana密码
kubectl get secret -n monitoring prometheus-grafana -o jsonpath="{.data.admin-password}" | base64 --decode ; echo

# 端口转发Grafana UI
kubectl port-forward -n monitoring svc/prometheus-grafana 3000:80

# 访问 http://localhost:3000
# 用户名: admin
# 密码: (上面获取的密码)
```

#### Step 2: 导入SmartAbp仪表板
1. 访问Grafana → Dashboards → Import
2. 上传SmartAbp生成的仪表板JSON文件
3. 选择Prometheus数据源
4. 点击Import

#### Step 3: 配置告警通知
```yaml
# grafana-notification-channel.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: grafana-notification-channel
  namespace: monitoring
data:
  notification-channel.yaml: |
    notifiers:
    - name: email
      type: email
      uid: email-notifier
      settings:
        addresses: ops@smartabp.com
        
    - name: slack
      type: slack
      uid: slack-notifier
      settings:
        url: https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

### 2.3 关键指标监控

#### 黄金指标
1. **延迟 (Latency)**
   - P50延迟: < 100ms
   - P95延迟: < 500ms
   - P99延迟: < 1s

2. **流量 (Traffic)**
   - 请求率: 监控趋势
   - QPS峰值: 记录历史峰值

3. **错误 (Errors)**
   - 错误率: < 0.1%
   - 5xx错误: < 0.01%

4. **饱和度 (Saturation)**
   - CPU使用率: < 70%
   - 内存使用率: < 80%
   - 磁盘使用率: < 85%

#### 告警阈值配置
```yaml
# 高错误率告警
- alert: HighErrorRate
  expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.01
  for: 5m
  labels:
    severity: critical
  annotations:
    summary: "HTTP 5xx错误率过高"
    description: "服务{{ $labels.service }}的5xx错误率为{{ $value }}%"

# 高延迟告警
- alert: HighLatency
  expr: histogram_quantile(0.95, http_request_duration_seconds_bucket) > 1
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "P95延迟超过1秒"
    description: "服务{{ $labels.service }}的P95延迟为{{ $value }}秒"

# CPU使用率告警
- alert: HighCPU
  expr: rate(container_cpu_usage_seconds_total[5m]) > 0.8
  for: 10m
  labels:
    severity: warning
  annotations:
    summary: "CPU使用率过高"
    description: "Pod {{ $labels.pod }}的CPU使用率为{{ $value }}%"

# 内存使用率告警
- alert: HighMemory
  expr: container_memory_usage_bytes / container_spec_memory_limit_bytes > 0.85
  for: 10m
  labels:
    severity: critical
  annotations:
    summary: "内存使用率过高"
    description: "Pod {{ $labels.pod }}的内存使用率为{{ $value }}%"
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 3. 日常运维

### 3.1 日常检查清单

#### 每日检查 (Daily)
```bash
#!/bin/bash
# daily-check.sh

echo "=== SmartAbp日常健康检查 ==="
echo "时间: $(date)"

# 1. 检查Pod状态
echo "\n1. Pod状态检查:"
kubectl get pods -n smartabp-production -o wide

# 2. 检查服务状态
echo "\n2. 服务状态检查:"
kubectl get services -n smartabp-production

# 3. 检查健康端点
echo "\n3. 应用健康检查:"
curl -s http://smartabp-web/health | jq .

# 4. 检查资源使用
echo "\n4. 资源使用情况:"
kubectl top pods -n smartabp-production

# 5. 检查最近的错误日志
echo "\n5. 最近的错误日志:"
kubectl logs --tail=50 -n smartabp-production deployment/smartabp-web | grep -i error

# 6. 检查数据库连接
echo "\n6. 数据库连接检查:"
kubectl exec -n smartabp-production deployment/smartabp-web -- \
  psql -h postgres -U smartabp -d SmartAbp -c "SELECT 1"

# 7. 检查Redis连接
echo "\n7. Redis连接检查:"
kubectl exec -n smartabp-production deployment/smartabp-web -- \
  redis-cli -h redis -a YourRedisPassword ping
```

#### 每周检查 (Weekly)
- ✅ 备份验证
- ✅ 性能指标回顾
- ✅ 容量规划评估
- ✅ 安全漏洞扫描
- ✅ 日志清理

#### 每月检查 (Monthly)
- ✅ 灾难恢复演练
- ✅ 依赖版本更新
- ✅ 监控告警规则优化
- ✅ 文档更新

### 3.2 日志管理

#### 日志采集
```bash
# 查看实时日志
kubectl logs -f deployment/smartabp-web -n smartabp-production

# 查看过去1小时的日志
kubectl logs --since=1h deployment/smartabp-web -n smartabp-production

# 导出日志到文件
kubectl logs deployment/smartabp-web -n smartabp-production > smartabp-web.log
```

#### 日志分析
```bash
# 统计错误数量
kubectl logs deployment/smartabp-web -n smartabp-production | grep -i error | wc -l

# 查找特定错误
kubectl logs deployment/smartabp-web -n smartabp-production | grep "NullReferenceException"

# 分析最频繁的错误
kubectl logs deployment/smartabp-web -n smartabp-production | \
  grep -i error | \
  awk '{print $5}' | \
  sort | uniq -c | sort -rn | head -10
```

### 3.3 更新与升级

#### 零停机滚动更新
```bash
# 更新镜像
kubectl set image deployment/smartabp-web \
  smartabp-web=smartabp/smartabp-web:v2.1 \
  -n smartabp-production

# 查看更新状态
kubectl rollout status deployment/smartabp-web -n smartabp-production

# 如果更新失败，回滚到上一个版本
kubectl rollout undo deployment/smartabp-web -n smartabp-production
```

#### Helm升级
```bash
# 升级应用
helm upgrade smartabp ./smartabp-chart \
  --values values-production.yaml \
  -n smartabp-production

# 如果升级失败，回滚
helm rollback smartabp -n smartabp-production
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 4. 故障处理

### 4.1 常见故障场景

#### 场景1: Pod启动失败

**症状**:
```bash
$ kubectl get pods -n smartabp-production
NAME                            READY   STATUS             RESTARTS   AGE
smartabp-web-7d8b9c5f6d-abc123  0/1     CrashLoopBackOff   5          10m
```

**排查步骤**:
```bash
# 1. 查看Pod事件
kubectl describe pod smartabp-web-7d8b9c5f6d-abc123 -n smartabp-production

# 2. 查看容器日志
kubectl logs smartabp-web-7d8b9c5f6d-abc123 -n smartabp-production

# 3. 检查配置
kubectl get configmap -n smartabp-production
kubectl get secret -n smartabp-production
```

**常见原因**:
- ❌ 镜像拉取失败
- ❌ 数据库连接失败
- ❌ Redis连接失败
- ❌ 配置错误

**解决方案**:
```bash
# 修复配置
kubectl edit deployment smartabp-web -n smartabp-production

# 重启Pod
kubectl delete pod smartabp-web-7d8b9c5f6d-abc123 -n smartabp-production
```

#### 场景2: 数据库连接失败

**症状**:
```
System.InvalidOperationException: Cannot access a disposed object.
Object name: 'NpgsqlConnection'
```

**排查步骤**:
```bash
# 1. 检查数据库Pod
kubectl get pods -n smartabp-production -l app=postgresql

# 2. 检查数据库日志
kubectl logs -n smartabp-production -l app=postgresql --tail=50

# 3. 测试数据库连接
kubectl exec -n smartabp-production deployment/smartabp-web -- \
  psql -h postgres -U smartabp -d SmartAbp -c "SELECT 1"
```

**解决方案**:
```bash
# 重启数据库
kubectl rollout restart statefulset/postgres -n smartabp-production

# 更新连接字符串
kubectl edit secret database-credentials -n smartabp-production
```

#### 场景3: 内存溢出 (OOM)

**症状**:
```bash
$ kubectl get pods -n smartabp-production
NAME                            READY   STATUS        RESTARTS   AGE
smartabp-web-7d8b9c5f6d-abc123  0/1     OOMKilled     3          15m
```

**排查步骤**:
```bash
# 1. 查看资源使用
kubectl top pod smartabp-web-7d8b9c5f6d-abc123 -n smartabp-production

# 2. 查看资源限制
kubectl describe pod smartabp-web-7d8b9c5f6d-abc123 -n smartabp-production | grep -A 5 "Limits:"
```

**解决方案**:
```bash
# 增加内存限制
kubectl set resources deployment smartabp-web \
  --limits=memory=2Gi \
  --requests=memory=1Gi \
  -n smartabp-production
```

### 4.2 紧急故障恢复流程

#### 1. 故障发现
- 监控告警触发
- 用户报障
- 健康检查失败

#### 2. 快速响应
```bash
# 快速检查脚本
#!/bin/bash
echo "=== 紧急故障检查 ==="
kubectl get pods -n smartabp-production
kubectl get services -n smartabp-production
kubectl top pods -n smartabp-production
kubectl logs --tail=100 deployment/smartabp-web -n smartabp-production | grep -i error
```

#### 3. 故障定位
- 检查Pod状态
- 检查日志
- 检查资源
- 检查网络
- 检查依赖服务

#### 4. 快速恢复
```bash
# 方案1: 重启Pod
kubectl delete pod -l app=smartabp-web -n smartabp-production

# 方案2: 回滚到上一个版本
kubectl rollout undo deployment/smartabp-web -n smartabp-production

# 方案3: 扩容Pod
kubectl scale deployment smartabp-web --replicas=5 -n smartabp-production

# 方案4: 切换到备用环境
kubectl apply -f backup-deployment.yaml -n smartabp-production
```

#### 5. 故障分析
- 收集日志
- 分析根因
- 制定永久性修复方案

#### 6. 事后总结
- 编写故障报告
- 更新运维手册
- 优化监控告警

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 5. 性能调优

### 5.1 应用性能调优

#### .NET应用配置
```json
{
  "Kestrel": {
    "Limits": {
      "MaxConcurrentConnections": 1000,
      "MaxConcurrentUpgradedConnections": 1000,
      "MaxRequestBodySize": 30000000,
      "KeepAliveTimeout": "00:02:00",
      "RequestHeadersTimeout": "00:00:30"
    }
  },
  "ConnectionStrings": {
    "Default": "Host=postgres;Port=5432;Database=SmartAbp;Username=smartabp;Password=***;Maximum Pool Size=50;Minimum Pool Size=5;Connection Idle Lifetime=300"
  }
}
```

#### Redis缓存优化
```yaml
Redis:
  Configuration: "redis,password=***,connectTimeout=5000,syncTimeout=5000,abortConnect=false"
  InstanceName: "SmartAbp:"
  Enabled: true
  CacheExpirationTime: "01:00:00"  # 1小时过期
```

### 5.2 数据库性能调优

#### PostgreSQL配置优化
```bash
# 编辑PostgreSQL配置
kubectl exec -it postgres-0 -n smartabp-production -- bash
vi /var/lib/postgresql/data/postgresql.conf

# 关键参数优化
max_connections = 200
shared_buffers = 2GB
effective_cache_size = 6GB
maintenance_work_mem = 512MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 10MB
min_wal_size = 1GB
max_wal_size = 4GB
```

#### 索引优化
```sql
-- 查找缺失索引
SELECT schemaname, tablename, attname, n_distinct, correlation
FROM pg_stats
WHERE schemaname = 'public'
  AND n_distinct > 100
  AND correlation < 0.1
ORDER BY n_distinct DESC;

-- 创建复合索引
CREATE INDEX idx_users_email_status ON users(email, status);

-- 分析表统计信息
ANALYZE users;
```

### 5.3 Kubernetes资源优化

#### HPA配置优化
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: smartabp-web-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: smartabp-web
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 60  # CPU目标60%
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 70  # 内存目标70%
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300  # 5分钟稳定窗口
      policies:
      - type: Percent
        value: 50  # 每次缩容50%
        periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 0
      policies:
      - type: Percent
        value: 100  # 每次扩容100%
        periodSeconds: 15
      - type: Pods
        value: 4  # 每次最多扩容4个Pod
        periodSeconds: 15
      selectPolicy: Max
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 6. 备份与恢复

### 6.1 数据库备份

#### 自动化备份脚本
```bash
#!/bin/bash
# backup-database.sh

BACKUP_DIR="/backups/smartabp"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="smartabp_backup_${DATE}.sql"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 执行备份
kubectl exec -n smartabp-production postgres-0 -- \
  pg_dump -U smartabp SmartAbp > $BACKUP_DIR/$BACKUP_FILE

# 压缩备份
gzip $BACKUP_DIR/$BACKUP_FILE

# 上传到云存储 (示例: AWS S3)
aws s3 cp $BACKUP_DIR/${BACKUP_FILE}.gz s3://smartabp-backups/database/

# 删除30天前的本地备份
find $BACKUP_DIR -name "smartabp_backup_*.sql.gz" -mtime +30 -delete

echo "备份完成: ${BACKUP_FILE}.gz"
```

#### 配置CronJob
```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: database-backup
  namespace: smartabp-production
spec:
  schedule: "0 2 * * *"  # 每天凌晨2点
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: backup
            image: smartabp/backup-tool:latest
            command:
            - /bin/bash
            - /scripts/backup-database.sh
            volumeMounts:
            - name: backup-volume
              mountPath: /backups
          restartPolicy: OnFailure
          volumes:
          - name: backup-volume
            persistentVolumeClaim:
              claimName: backup-pvc
```

### 6.2 数据库恢复

#### 恢复流程
```bash
#!/bin/bash
# restore-database.sh

BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
  echo "使用方法: ./restore-database.sh <backup_file.sql.gz>"
  exit 1
fi

# 解压备份
gunzip -c $BACKUP_FILE > /tmp/restore.sql

# 停止应用
kubectl scale deployment smartabp-web --replicas=0 -n smartabp-production

# 删除现有数据库
kubectl exec -n smartabp-production postgres-0 -- \
  psql -U smartabp -c "DROP DATABASE IF EXISTS SmartAbp;"

# 创建新数据库
kubectl exec -n smartabp-production postgres-0 -- \
  psql -U smartabp -c "CREATE DATABASE SmartAbp;"

# 恢复数据
kubectl exec -i -n smartabp-production postgres-0 -- \
  psql -U smartabp SmartAbp < /tmp/restore.sql

# 重启应用
kubectl scale deployment smartabp-web --replicas=3 -n smartabp-production

# 验证恢复
kubectl exec -n smartabp-production postgres-0 -- \
  psql -U smartabp -d SmartAbp -c "SELECT COUNT(*) FROM users;"

echo "数据库恢复完成"
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 7. 安全加固

### 7.1 网络安全

#### 实施NetworkPolicy
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: smartabp-network-policy
  namespace: smartabp-production
spec:
  podSelector:
    matchLabels:
      app: smartabp-web
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: smartabp-production
    ports:
    - protocol: TCP
      port: 80
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: postgres
    ports:
    - protocol: TCP
      port: 5432
  - to:
    - podSelector:
        matchLabels:
          app: redis
    ports:
    - protocol: TCP
      port: 6379
```

### 7.2 访问控制

#### 实施RBAC
```yaml
# readonly-role.yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: readonly
  namespace: smartabp-production
rules:
- apiGroups: ["", "apps"]
  resources: ["pods", "services", "deployments", "logs"]
  verbs: ["get", "list", "watch"]

---
# developer-role.yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: developer
  namespace: smartabp-production
rules:
- apiGroups: ["", "apps"]
  resources: ["pods", "services", "deployments", "configmaps"]
  verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]
```

### 7.3 密钥管理

#### 使用Sealed Secrets
```bash
# 安装Sealed Secrets Controller
helm install sealed-secrets sealed-secrets/sealed-secrets -n kube-system

# 创建加密的Secret
echo -n 'YourSecurePassword' | kubectl create secret generic database-password \
  --dry-run=client \
  --from-file=password=/dev/stdin \
  -o yaml | \
  kubeseal -o yaml > sealed-database-password.yaml

# 应用加密的Secret
kubectl apply -f sealed-database-password.yaml -n smartabp-production
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 附录A：运维工具清单

| 工具 | 用途 | 安装命令 |
|-----|------|----------|
| kubectl | Kubernetes命令行工具 | `curl -LO https://dl.k8s.io/release/v1.25.0/bin/linux/amd64/kubectl` |
| helm | Kubernetes包管理工具 | `curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 \| bash` |
| k9s | Kubernetes终端UI | `brew install k9s` (Mac) / `snap install k9s` (Linux) |
| kubectx | Kubernetes上下文切换 | `brew install kubectx` |
| stern | Kubernetes日志聚合 | `brew install stern` |
| pgAdmin | PostgreSQL管理工具 | https://www.pgadmin.org/ |
| Redis Commander | Redis管理工具 | `npm install -g redis-commander` |

---

**版权所有 © 2025 SmartAbp. All rights reserved.**

