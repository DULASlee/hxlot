# SmartAbp Aspire设计器 - 运维手册概览

**版本**: v1.0  
**更新日期**: 2025-10-04  

---

## 部署指南

### 前端部署

```bash
cd src/SmartAbp.Vue
npm install
npm run build
# 生成的文件在 dist/ 目录

# Nginx配置示例
server {
  listen 80;
  server_name smartabp.com;
  root /var/www/smartabp/dist;
  
  location / {
    try_files $uri $uri/ /index.html;
  }
  
  location /api {
    proxy_pass http://backend:5000;
  }
}
```

### 后端部署

```bash
cd src/SmartAbp.Web
dotnet publish -c Release -o ./publish

# 使用systemd管理
sudo systemctl start smartabp-web
sudo systemctl enable smartabp-web
```

### Kubernetes部署

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: smartabp-web
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: smartabp-web
        image: smartabp/web:latest
        ports:
        - containerPort: 5000
        env:
        - name: ASPNETCORE_ENVIRONMENT
          value: "Production"
```

---

## 故障排查

### 常见问题

**1. 代码生成失败**
```bash
# 检查日志
tail -f /var/log/smartabp/app.log

# 检查数据库连接
dotnet ef database update

# 重启服务
sudo systemctl restart smartabp-web
```

**2. 前端页面空白**
```bash
# 检查浏览器控制台
# 检查Nginx日志
tail -f /var/log/nginx/error.log

# 检查API连接
curl http://backend:5000/api/health
```

**3. 性能问题**
```bash
# 检查资源使用
top
df -h

# 检查数据库连接池
SELECT * FROM pg_stat_activity;

# 启用详细日志
export ASPNETCORE_ENVIRONMENT=Development
```

---

## 监控指标

### 关键指标

| 指标 | 正常值 | 告警阈值 |
|------|--------|---------|
| API响应时间 | <200ms | >500ms |
| 代码生成时间 | <5s | >10s |
| CPU使用率 | <70% | >85% |
| 内存使用率 | <80% | >90% |
| 错误率 | <0.1% | >1% |

### Prometheus查询

```promql
# API响应时间P99
histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))

# 错误率
rate(http_requests_total{status="500"}[5m])

# CPU使用率
rate(process_cpu_seconds_total[5m])
```

---

## 备份与恢复

### 数据库备份

```bash
# 备份
pg_dump smartabp > backup_$(date +%Y%m%d).sql

# 恢复
psql smartabp < backup_20251004.sql
```

### 配置备份

```bash
# 备份配置
tar -czf config_backup.tar.gz /etc/smartabp/

# 恢复配置
tar -xzf config_backup.tar.gz -C /
```

---

## 性能优化

### 数据库优化

```sql
-- 创建索引
CREATE INDEX idx_solution_name ON solutions(name);

-- 分析表
ANALYZE solutions;

-- 清理vacuum
VACUUM ANALYZE;
```

### 缓存配置

```csharp
// Redis缓存
services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = "localhost:6379";
    options.InstanceName = "SmartAbp:";
});
```

### 前端优化

```typescript
// 路由懒加载
const Dashboard = () => import('./views/Dashboard.vue')

// 组件缓存
<keep-alive>
  <component :is="currentView" />
</keep-alive>
```

---

完整运维手册请参阅: [详细文档](../deployment/)

