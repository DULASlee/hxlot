# SmartAbp微服务编排设计器 - 快速开始指南

## 📋 文档信息

**版本**: v2.0  
**更新日期**: 2025-11-18  
**适用对象**: 新用户、开发者、运维人员  
**预计时间**: 30分钟

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🎯 学习目标

完成本指南后，您将能够：
- ✅ 成功部署SmartAbp微服务编排设计器
- ✅ 创建第一个微服务配置
- ✅ 使用AI助手进行配置推荐
- ✅ 从模板市场部署微服务
- ✅ 配置监控和可观测性

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 📦 前置条件

### 系统要求

**最低配置**:
- CPU: 4核
- 内存: 8GB
- 存储: 50GB
- 操作系统: Windows 10+, macOS 12+, Ubuntu 20.04+

**推荐配置**:
- CPU: 8核
- 内存: 16GB
- 存储: 100GB SSD
- 操作系统: Windows 11, macOS 14+, Ubuntu 22.04+

### 软件依赖

**必需**:
- [.NET 9.0 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- [Node.js 20+](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [kubectl](https://kubernetes.io/docs/tasks/tools/)

**可选**:
- [Azure CLI](https://docs.microsoft.com/cli/azure/install-azure-cli) (如果使用Azure)
- [Helm](https://helm.sh/docs/intro/install/)
- [k9s](https://k9scli.io/) (Kubernetes管理工具)

### 验证安装

```bash
# 验证.NET SDK
dotnet --version
# 输出: 9.0.x

# 验证Node.js
node --version
# 输出: v20.x.x

# 验证Docker
docker --version
# 输出: Docker version 24.x.x

# 验证kubectl
kubectl version --client
# 输出: Client Version: v1.28.x
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🚀 Step 1: 项目部署 (5分钟)

### 1.1 克隆项目

```bash
# 克隆仓库
git clone https://github.com/smartabp/hxlot.git
cd hxlot

# 查看项目结构
ls -la
```

### 1.2 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑配置 (根据您的环境调整)
nano .env
```

**关键配置项**:
```bash
# 数据库配置
DB_HOST=localhost
DB_PORT=5432
DB_NAME=smartabp
DB_USER=postgres
DB_PASSWORD=your_password

# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379

# OpenAI配置 (可选，用于AI助手)
OPENAI_API_KEY=sk-your-openai-api-key
OPENAI_MODEL=gpt-4

# Kubernetes配置
KUBECONFIG=~/.kube/config
```

### 1.3 启动数据库和Redis

```bash
# 使用Docker Compose启动基础设施
docker-compose up -d postgres redis

# 验证服务状态
docker-compose ps
```

### 1.4 初始化数据库

```bash
# 进入后端目录
cd src/SmartAbp.Web

# 运行数据库迁移
dotnet ef database update

# 验证数据库
psql -h localhost -U postgres -d smartabp -c "\dt"
```

### 1.5 启动后端服务

```bash
# 启动后端API
cd src/SmartAbp.Web
dotnet run

# 验证后端运行
curl http://localhost:5000/health
# 输出: {"status":"Healthy"}
```

### 1.6 启动前端服务

```bash
# 新开一个终端窗口
cd src/SmartAbp.Vue

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 浏览器访问
# http://localhost:3000
```

**✅ 完成！** 现在您应该能看到SmartAbp微服务编排设计器的登录页面。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🎨 Step 2: 创建第一个微服务配置 (10分钟)

### 2.1 登录系统

1. 访问 http://localhost:3000
2. 使用默认管理员账号登录
   - 用户名: `admin`
   - 密码: `1q2w3E*`

### 2.2 创建新项目

1. 点击左侧菜单 **项目管理**
2. 点击 **创建新项目**
3. 填写项目信息：
   ```
   项目名称: my-first-microservice
   项目描述: 我的第一个微服务项目
   项目类型: Microservice
   ```
4. 点击 **创建**

### 2.3 配置微服务

#### 2.3.1 基础配置

1. 进入项目详情页
2. 点击 **环境配置** 标签
3. 选择环境: **Development**
4. 填写基础信息：
   ```yaml
   服务名称: user-service
   命名空间: default
   镜像: myregistry/user-service:latest
   端口: 8080
   副本数: 2
   ```

#### 2.3.2 资源配置

```yaml
资源限制:
  CPU请求: 100m
  CPU限制: 500m
  内存请求: 128Mi
  内存限制: 512Mi
  
存储:
  - 名称: data-volume
    大小: 10Gi
    挂载路径: /app/data
```

#### 2.3.3 环境变量

```yaml
环境变量:
  - 名称: DATABASE_URL
    值: postgresql://user:pass@db:5432/mydb
  - 名称: REDIS_URL
    值: redis://redis:6379
  - 名称: LOG_LEVEL
    值: info
```

#### 2.3.4 健康检查

```yaml
就绪探针:
  路径: /health/ready
  端口: 8080
  初始延迟: 10秒
  间隔: 10秒
  
存活探针:
  路径: /health/live
  端口: 8080
  初始延迟: 30秒
  间隔: 30秒
```

5. 点击 **保存配置**

### 2.4 生成Kubernetes清单

1. 点击 **生成配置** 按钮
2. 选择生成类型：
   - ✅ Kubernetes Deployment
   - ✅ Kubernetes Service
   - ✅ Horizontal Pod Autoscaler
3. 点击 **生成**

**生成的文件**:
- `deployment.yaml`
- `service.yaml`
- `hpa.yaml`

### 2.5 预览和下载

1. 点击 **代码预览** 标签
2. 查看生成的YAML文件
3. 点击 **下载全部** 保存到本地

**✅ 完成！** 您已成功创建第一个微服务配置！

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🤖 Step 3: 使用AI助手 (5分钟)

### 3.1 打开AI助手面板

1. 点击右下角的 **AI助手** 按钮
2. AI助手面板从右侧滑出

### 3.2 选择智能模式

AI助手提供5种智能模式：

**1. Configuration Recommendation (配置推荐)**
- 用途: 获取最佳配置建议
- 示例问题: "为一个高流量的Web服务推荐配置"

**2. Architecture Design (架构设计)**
- 用途: 设计微服务架构
- 示例问题: "设计一个电商系统的微服务架构"

**3. Problem Diagnosis (问题诊断)**
- 用途: 诊断和解决问题
- 示例问题: "我的Pod一直处于CrashLoopBackOff状态"

**4. Code Optimization (代码优化)**
- 用途: 优化配置和代码
- 示例问题: "优化我的Deployment配置以提升性能"

**5. Best Practices (最佳实践)**
- 用途: 学习最佳实践
- 示例问题: "微服务监控的最佳实践是什么？"

### 3.3 获取配置推荐

1. 选择 **Configuration Recommendation** 模式
2. 输入问题：
   ```
   我有一个Node.js微服务，日均请求量约10万，
   需要高可用配置，请推荐最佳配置。
   ```
3. 点击 **发送**
4. AI助手会返回详细的配置建议

**示例回答**:
```yaml
推荐配置:

副本数: 3 (最小值，确保高可用)
资源配置:
  CPU请求: 200m
  CPU限制: 1000m
  内存请求: 256Mi
  内存限制: 1Gi

自动伸缩:
  最小副本: 3
  最大副本: 10
  目标CPU使用率: 70%

弹性策略:
  - 断路器: 失败率>50%时熔断
  - 重试: 最多3次，指数退避
  - 超时: 5秒
```

### 3.4 应用AI建议

1. 点击建议中的 **应用此配置**
2. 系统自动填充配置表单
3. 点击 **保存**

**✅ 完成！** 您已成功使用AI助手优化配置！

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🏪 Step 4: 从模板市场部署 (5分钟)

### 4.1 进入模板市场

1. 点击左侧菜单 **模板市场**
2. 浏览可用模板

### 4.2 搜索和筛选

**搜索示例**:
```
搜索: "redis"
```

**筛选条件**:
- 分类: Microservices
- 类型: 后端
- 评分: 4星以上

### 4.3 查看模板详情

1. 点击感兴趣的模板卡片
2. 模板详情抽屉打开
3. 查看：
   - 基本信息（名称、版本、作者、评分）
   - 模板描述
   - 版本历史
   - 用户评论
   - 相关模板

### 4.4 一键部署

1. 点击 **一键部署** 按钮
2. 选择目标环境：
   ```
   环境: Development
   命名空间: default
   ```
3. 编辑配置（可选）：
   ```yaml
   # 可以根据需要修改配置
   replicas: 2
   resources:
     limits:
       memory: "512Mi"
   ```
4. 点击 **部署**
5. 查看部署进度

### 4.5 验证部署

```bash
# 查看Pod状态
kubectl get pods -n default

# 查看服务
kubectl get svc -n default

# 查看日志
kubectl logs -n default <pod-name>
```

**✅ 完成！** 您已成功从模板市场部署微服务！

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 📊 Step 5: 配置监控和可观测性 (5分钟)

### 5.1 配置Prometheus

1. 进入 **可观测性** → **Prometheus配置**
2. 启用Prometheus监控
3. 配置指标采集：
   ```yaml
   采集间隔: 15秒
   采集目标:
     - 服务名: user-service
       端口: 8080
       路径: /metrics
   ```
4. 点击 **生成配置**
5. 下载 `prometheus.yaml`

### 5.2 配置Grafana

1. 进入 **可观测性** → **Grafana仪表板**
2. 选择预置模板：
   - **黄金指标仪表板** (推荐)
   - Kubernetes集群监控
   - 应用性能监控
3. 点击 **生成仪表板**
4. 点击 **预览**

**黄金指标**:
- 🎯 延迟 (Latency): P50, P95, P99
- 📈 流量 (Traffic): QPS
- ❌ 错误 (Errors): 错误率
- 🔥 饱和度 (Saturation): CPU/内存使用率

### 5.3 配置Jaeger链路追踪

1. 进入 **可观测性** → **Jaeger配置**
2. 启用链路追踪
3. 配置采样率：
   ```yaml
   采样策略: 概率采样
   采样率: 10% (生产环境推荐)
   ```
4. 生成配置

### 5.4 部署监控栈

```bash
# 使用生成的配置部署
kubectl apply -f prometheus.yaml
kubectl apply -f grafana.yaml
kubectl apply -f jaeger.yaml

# 验证部署
kubectl get pods -n monitoring

# 端口转发访问Grafana
kubectl port-forward -n monitoring svc/grafana 3001:3000

# 浏览器访问
# http://localhost:3001
# 默认账号: admin/admin
```

**✅ 完成！** 您已成功配置监控和可观测性！

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🔧 常用操作

### 查看服务健康状态

1. 进入 **智能故障排查**
2. 点击 **执行健康检查**
3. 查看6维度检查结果：
   - Pod状态
   - 服务可用性
   - 性能指标
   - 日志分析
   - 配置验证
   - 资源使用

### 配置弹性策略

1. 进入 **弹性工程** → **弹性策略设计器**
2. 选择服务
3. 配置6种弹性模式：
   - Circuit Breaker (断路器)
   - Retry (重试)
   - Timeout (超时)
   - Bulkhead (舱壁隔离)
   - Rate Limiting (限流)
   - Fallback (降级)
4. 生成Polly或Istio配置

### 配置自动伸缩

1. 进入 **自动伸缩** → **自动伸缩设计器**
2. 选择策略类型：
   - HPA (水平Pod自动伸缩)
   - VPA (垂直Pod自动伸缩)
3. 配置触发条件：
   ```yaml
   最小副本: 2
   最大副本: 10
   触发指标:
     - CPU使用率 > 70%
     - 内存使用率 > 80%
     - 自定义指标: QPS > 1000
   ```
4. 获取AI推荐（可选）
5. 生成并部署配置

### 成本优化

1. 进入 **成本优化** → **成本仪表板**
2. 查看当前成本：
   - 按服务分组
   - 按命名空间分组
   - 按资源类型分组
3. 查看优化建议：
   - 过度配置的资源
   - 闲置资源
   - 优化建议
4. 对比多云成本（Azure/AWS/GCP/Aliyun）
5. 应用优化建议

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 💡 最佳实践

### 1. 环境隔离
- ✅ 使用不同的命名空间隔离环境
- ✅ 为每个环境配置独立的资源配额
- ✅ 使用标签管理环境

### 2. 资源配置
- ✅ 始终设置资源请求和限制
- ✅ CPU请求设置为实际使用的70%
- ✅ 内存限制设置为预期峰值的1.2倍

### 3. 健康检查
- ✅ 配置就绪探针和存活探针
- ✅ 就绪探针应该快速响应
- ✅ 存活探针可以更宽松

### 4. 日志和监控
- ✅ 使用结构化日志
- ✅ 配置日志级别为INFO（生产环境）
- ✅ 监控黄金指标（延迟、流量、错误、饱和度）

### 5. 弹性设计
- ✅ 实施断路器模式
- ✅ 配置合理的重试策略
- ✅ 设置超时时间
- ✅ 实现优雅降级

### 6. 安全性
- ✅ 使用Secret管理敏感信息
- ✅ 配置Network Policy
- ✅ 启用RBAC
- ✅ 定期更新镜像

### 7. 成本优化
- ✅ 使用自动伸缩
- ✅ 清理未使用的资源
- ✅ 使用Spot实例（非关键服务）
- ✅ 定期审查资源使用情况

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🆘 故障排除

### 问题1: 无法连接到Kubernetes集群

**症状**: 
```
Error: Unable to connect to the cluster
```

**解决方案**:
```bash
# 1. 验证kubectl配置
kubectl config view

# 2. 验证集群连接
kubectl cluster-info

# 3. 验证当前上下文
kubectl config current-context

# 4. 如果需要切换集群
kubectl config use-context <context-name>
```

### 问题2: Pod一直处于Pending状态

**症状**: 
```bash
kubectl get pods
NAME           READY   STATUS    RESTARTS   AGE
user-service   0/1     Pending   0          5m
```

**解决方案**:
```bash
# 1. 查看Pod事件
kubectl describe pod user-service

# 2. 常见原因和解决方法
# - 资源不足: 减少资源请求或扩容集群
# - 存储问题: 检查PVC状态
# - 调度问题: 检查节点标签和污点

# 3. 查看节点资源
kubectl top nodes
```

### 问题3: AI助手无法工作

**症状**: 
AI助手返回错误或无响应

**解决方案**:
```bash
# 1. 检查OpenAI API Key配置
cat .env | grep OPENAI_API_KEY

# 2. 验证API Key有效性
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# 3. 检查后端日志
docker-compose logs backend | grep "OpenAI"

# 4. 如果是网络问题，配置代理
export HTTP_PROXY=http://proxy:port
export HTTPS_PROXY=http://proxy:port
```

### 问题4: 模板部署失败

**症状**: 
模板部署显示失败状态

**解决方案**:
```bash
# 1. 查看部署日志
kubectl describe deployment <deployment-name>

# 2. 查看Pod日志
kubectl logs <pod-name>

# 3. 检查镜像是否存在
docker pull <image-name>

# 4. 验证配置正确性
kubectl apply --dry-run=client -f deployment.yaml
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 📚 下一步学习

### 进阶主题

1. **[Phase 1用户手册](./Phase1-User-Manual.md)**
   - 深入了解多环境配置管理
   - 学习安全策略配置
   - 掌握可观测性最佳实践

2. **[API参考文档](./Phase1-API-Reference.md)**
   - 完整的API文档
   - 代码示例
   - 集成指南

3. **[运维指南](./Phase1-Operations-Guide.md)**
   - 生产环境部署
   - 性能调优
   - 故障排查

### 高级功能

4. **弹性工程**
   - 混沌工程实验
   - 高级弹性模式
   - 故障注入测试

5. **成本优化**
   - 多云成本对比
   - 资源优化建议
   - 成本预算管理

6. **GitOps工作流**
   - CI/CD流水线配置
   - ArgoCD集成
   - 自动化部署

### 社区资源

- 💬 [社区论坛](https://community.smartabp.com)
- 📖 [技术博客](https://blog.smartabp.com)
- 🐛 [问题追踪](https://github.com/smartabp/hxlot/issues)
- 💡 [功能建议](https://github.com/smartabp/hxlot/discussions)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🎓 认证课程

**SmartAbp微服务编排设计器专业认证**

- 📚 在线课程: https://learn.smartabp.com
- ⏱️ 学习时长: 20小时
- 🎯 认证考试: 包含
- 💼 适合人群: 开发者、架构师、DevOps工程师

**课程大纲**:
1. 微服务基础和最佳实践
2. Kubernetes深入理解
3. 服务网格和Istio
4. 可观测性和监控
5. 弹性工程和混沌工程
6. AI辅助配置和智能运维

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 📞 获取帮助

### 技术支持

**企业支持**:
- 📧 邮箱: support@smartabp.com
- 📞 电话: +86 400-xxx-xxxx
- 💬 在线客服: https://smartabp.com/support

**社区支持**:
- 💬 论坛: https://community.smartabp.com
- 💡 Stack Overflow: 标签 `smartabp`
- 🐛 GitHub Issues: https://github.com/smartabp/hxlot/issues

### 培训和咨询

- 🎓 在线培训: https://learn.smartabp.com
- 👨‍💼 企业培训: training@smartabp.com
- 💼 技术咨询: consulting@smartabp.com

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🎉 恭喜！

您已完成SmartAbp微服务编排设计器的快速开始指南！

**您现在能够**:
- ✅ 部署和运行设计器
- ✅ 创建微服务配置
- ✅ 使用AI助手优化配置
- ✅ 从模板市场部署服务
- ✅ 配置监控和可观测性

**下一步**:
- 📖 阅读[完整文档](./README.md)
- 🎯 尝试[高级功能](./Phase1-User-Manual.md)
- 💬 加入[社区讨论](https://community.smartabp.com)
- 🚀 开始构建您的微服务系统！

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**SmartAbp - Building the Future of Microservices Orchestration** 🚀

*最后更新: 2025-11-18 | 版本: 2.0*

