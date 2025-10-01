# SmartAbp运维监控微服务 - Kubernetes部署指南

## 📋 概述

本目录包含SmartAbp运维监控微服务的完整Kubernetes部署配置，支持生产环境一键部署。

## 🏗️ 架构组件

### 核心资源
- **Deployment**: 2副本部署，支持滚动更新
- **Service**: ClusterIP、Headless、LoadBalancer三种服务类型
- **ConfigMap**: 应用配置和环境变量
- **Secret**: 敏感信息（数据库密码、API密钥等）
- **Ingress**: Nginx Ingress Controller路由配置
- **HPA**: 水平Pod自动扩缩容（2-10副本）
- **PDB**: Pod中断预算，保证高可用

### Dapr集成
- **State Store**: Redis状态存储
- **Pub/Sub**: Redis消息发布订阅
- **Bindings**: Cron定时任务
- **Configuration**: 全局Dapr配置

### RBAC权限
- **ServiceAccount**: 微服务专用账户
- **ClusterRole**: K8s资源只读权限
- **ClusterRoleBinding**: 权限绑定

## 🚀 部署步骤

### 1. 前置条件

```bash
# 确保kubectl已配置
kubectl version --client

# 确保Dapr已安装
dapr status -k

# 确保Nginx Ingress Controller已安装
kubectl get pods -n ingress-nginx

# 确保cert-manager已安装（用于TLS证书）
kubectl get pods -n cert-manager
```

### 2. 创建命名空间

```bash
kubectl create namespace smartabp
kubectl label namespace smartabp istio-injection=disabled
kubectl label namespace smartabp dapr-enabled=true
```

### 3. 配置Secret

**⚠️ 重要：生产环境必须替换所有密码！**

```bash
# 编辑secret.yaml，替换所有REPLACE_WITH_*占位符
vi secret.yaml

# 应用Secret
kubectl apply -f secret.yaml
```

### 4. 应用配置

```bash
# 应用ConfigMap
kubectl apply -f configmap.yaml

# 应用Dapr组件
kubectl apply -f dapr-component.yaml
```

### 5. 部署服务

```bash
# 应用Deployment和RBAC
kubectl apply -f deployment.yaml

# 应用Service
kubectl apply -f service.yaml

# 应用Ingress
kubectl apply -f ingress.yaml

# 应用HPA
kubectl apply -f hpa.yaml
```

### 6. 使用Kustomize部署（推荐）

```bash
# 一键部署所有资源
kubectl apply -k .

# 查看部署结果
kubectl get all -n smartabp -l app=smartabp-ops-monitoring
```

## 🔍 验证部署

### 检查Pod状态

```bash
# 查看Pod
kubectl get pods -n smartabp -l app=smartabp-ops-monitoring

# 查看Pod详情
kubectl describe pod -n smartabp -l app=smartabp-ops-monitoring

# 查看Pod日志
kubectl logs -n smartabp -l app=smartabp-ops-monitoring -f

# 查看Dapr Sidecar日志
kubectl logs -n smartabp -l app=smartabp-ops-monitoring -c daprd
```

### 检查服务

```bash
# 查看Service
kubectl get svc -n smartabp smartabp-ops-monitoring

# 查看Endpoints
kubectl get endpoints -n smartabp smartabp-ops-monitoring

# 测试服务连通性
kubectl run -it --rm debug --image=curlimages/curl --restart=Never -- \
  curl http://smartabp-ops-monitoring.smartabp.svc.cluster.local/health
```

### 检查Ingress

```bash
# 查看Ingress
kubectl get ingress -n smartabp smartabp-ops-monitoring

# 获取Ingress IP
kubectl get ingress -n smartabp smartabp-ops-monitoring \
  -o jsonpath='{.status.loadBalancer.ingress[0].ip}'

# 测试Ingress（需配置hosts）
curl -k https://ops.smartabp.com/health
```

### 检查HPA

```bash
# 查看HPA状态
kubectl get hpa -n smartabp smartabp-ops-monitoring-hpa

# 查看HPA详情
kubectl describe hpa -n smartabp smartabp-ops-monitoring-hpa
```

## 📊 监控与日志

### Prometheus监控

```bash
# 访问Prometheus（需要端口转发）
kubectl port-forward -n monitoring svc/prometheus-server 9090:9090

# 浏览器访问
open http://localhost:9090
```

### Grafana仪表板

```bash
# 访问Grafana（需要端口转发）
kubectl port-forward -n monitoring svc/grafana 3000:3000

# 浏览器访问（默认账号：admin/admin）
open http://localhost:3000
```

### 日志查询

```bash
# 实时查看日志
kubectl logs -n smartabp -l app=smartabp-ops-monitoring -f --tail=100

# 查看特定Pod日志
kubectl logs -n smartabp <pod-name> -c smartabp-ops-monitoring

# 导出日志
kubectl logs -n smartabp -l app=smartabp-ops-monitoring > ops-logs.txt
```

## 🔧 运维操作

### 扩缩容

```bash
# 手动扩容到5个副本
kubectl scale deployment -n smartabp smartabp-ops-monitoring --replicas=5

# 查看扩容状态
kubectl get deployment -n smartabp smartabp-ops-monitoring
```

### 滚动更新

```bash
# 更新镜像
kubectl set image deployment/smartabp-ops-monitoring \
  -n smartabp smartabp-ops-monitoring=smartabp/ops-monitoring:v1.1.0

# 查看更新状态
kubectl rollout status deployment/smartabp-ops-monitoring -n smartabp

# 查看更新历史
kubectl rollout history deployment/smartabp-ops-monitoring -n smartabp
```

### 回滚

```bash
# 回滚到上一个版本
kubectl rollout undo deployment/smartabp-ops-monitoring -n smartabp

# 回滚到指定版本
kubectl rollout undo deployment/smartabp-ops-monitoring -n smartabp --to-revision=2
```

### 重启Pod

```bash
# 重启所有Pod
kubectl rollout restart deployment/smartabp-ops-monitoring -n smartabp

# 删除Pod（自动重建）
kubectl delete pod -n smartabp -l app=smartabp-ops-monitoring
```

## 🗑️ 清理资源

```bash
# 删除所有资源
kubectl delete -k .

# 或逐个删除
kubectl delete -f hpa.yaml
kubectl delete -f ingress.yaml
kubectl delete -f service.yaml
kubectl delete -f deployment.yaml
kubectl delete -f dapr-component.yaml
kubectl delete -f configmap.yaml
kubectl delete -f secret.yaml

# 删除命名空间（慎用）
kubectl delete namespace smartabp
```

## 📝 配置说明

### 环境变量

| 变量名 | 说明 | 默认值 |
|-------|------|--------|
| `ASPNETCORE_ENVIRONMENT` | 环境名称 | Production |
| `ASPNETCORE_URLS` | 监听地址 | http://+:8080 |
| `ConnectionStrings__Default` | 数据库连接 | 从Secret读取 |
| `Prometheus__Uri` | Prometheus地址 | http://prometheus-server:9090 |
| `Elasticsearch__Uri` | Elasticsearch地址 | 从ConfigMap读取 |

### 资源配置

| 资源类型 | Request | Limit |
|---------|---------|-------|
| CPU | 250m | 1000m |
| Memory | 512Mi | 1Gi |
| Dapr Sidecar CPU | 100m | 500m |
| Dapr Sidecar Memory | 128Mi | 512Mi |

### 健康检查

- **Liveness**: `/health` (30s初始延迟，30s间隔)
- **Readiness**: `/health/ready` (10s初始延迟，10s间隔)
- **Startup**: `/health` (最长150s启动时间)

## 🔐 安全建议

1. **Secret管理**: 使用sealed-secrets或外部Secret管理器（如Vault）
2. **RBAC**: 仅授予必要的K8s权限
3. **Network Policy**: 配置网络策略限制Pod间通信
4. **Pod Security**: 使用非root用户运行，启用securityContext
5. **TLS证书**: 使用cert-manager自动管理证书
6. **镜像安全**: 使用私有镜像仓库，定期扫描漏洞

## 📞 故障排查

### Pod无法启动

```bash
# 查看事件
kubectl get events -n smartabp --sort-by='.lastTimestamp'

# 查看Pod状态
kubectl describe pod -n smartabp <pod-name>

# 查看容器日志
kubectl logs -n smartabp <pod-name> --previous
```

### 服务无法访问

```bash
# 检查Service
kubectl get svc -n smartabp smartabp-ops-monitoring

# 检查Endpoints
kubectl get endpoints -n smartabp smartabp-ops-monitoring

# 端口转发测试
kubectl port-forward -n smartabp svc/smartabp-ops-monitoring 8080:80
curl http://localhost:8080/health
```

### Dapr问题

```bash
# 查看Dapr组件状态
dapr components -k -n smartabp

# 查看Dapr配置
dapr configurations -k -n smartabp

# 查看Dapr日志
kubectl logs -n smartabp <pod-name> -c daprd
```

## 📚 参考文档

- [Kubernetes官方文档](https://kubernetes.io/docs/)
- [Dapr官方文档](https://docs.dapr.io/)
- [ABP Framework文档](https://docs.abp.io/)
- [Nginx Ingress文档](https://kubernetes.github.io/ingress-nginx/)

