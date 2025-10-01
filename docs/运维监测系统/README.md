# SmartAbp运维监测系统 - 完整文档

> **SmartAbp.OpsManagement.Service** - 企业级运维监测微服务完整技术文档

## 📚 文档目录

### [01 - 系统概述](./01-系统概述.md)
**核心内容**: 系统简介、核心功能、技术特点、架构特色

- 📋 功能概览：APM性能监控、ELK日志管理、K8s资源监控、智能告警管理
- 🏗️ 技术栈：.NET 9.0 + Vue 3 + PostgreSQL + Elasticsearch + Prometheus + Dapr
- 🎯 架构特色：DDD领域驱动设计、双写架构、云原生设计、完整可观测性
- 📊 整体架构图与数据流向
- 🚀 部署架构：本地开发（Aspire）+ 生产环境（Kubernetes）

**适用人群**: 项目经理、架构师、技术决策者

---

### [02 - 操作使用说明](./02-操作使用说明.md)
**核心内容**: 用户手册、功能操作、使用场景

- 🔐 系统登录与权限
- 📈 APM性能监控面板：实时指标、趋势图表、服务性能摘要
- 📝 ELK日志管理面板：日志查询、统计分析、可视化图表
- ☸️ K8s资源监控面板：集群摘要、资源管理、Pod日志查看
- 🔔 智能告警管理面板：规则配置、通知渠道、告警历史

**适用人群**: 运维工程师、系统管理员、开发人员

---

### [03 - 技术架构说明](./03-技术架构说明.md)
**核心内容**: 深度架构设计、技术实现细节

- 🏛️ DDD分层架构：Domain/Application/Infrastructure/HttpApi/Host
- 🔄 双写架构设计：PostgreSQL主存储 + Elasticsearch异步索引
- 🌐 Dapr集成架构：State Store、Pub/Sub、Bindings、Service Invocation
- 🎨 Vue3组合式API：Composables设计、ECharts可视化、状态管理
- 💾 数据持久化设计：PostgreSQL表结构、Elasticsearch索引模板
- 🔒 安全架构设计：认证授权、数据安全、网络安全
- 📊 监控与可观测性：Metrics、Logging、Tracing

**适用人群**: 系统架构师、高级开发人员、技术专家

---

### [04 - 二次开发指南](./04-二次开发指南.md)
**核心内容**: 开发环境、扩展开发、性能优化、单元测试

- 🛠️ 开发环境准备：必需工具、依赖安装、代码克隆
- ➕ 添加新的监控指标：实体定义、DTO创建、应用服务、API控制器
- 🎨 添加新的前端面板：Vue组件、路由配置、菜单注册
- 🔌 集成新的监控数据源：数据源服务接口、集成实现、服务注册
- 🎯 扩展告警规则：自定义规则类型、复杂告警逻辑
- ⚡ 性能优化建议：数据库查询优化、缓存策略、异步处理
- ✅ 单元测试编写：测试项目结构、单元测试、集成测试

**适用人群**: 开发人员、技术团队负责人

---

### [05 - Aspire本地测试指南](./05-Aspire本地测试指南.md)
**核心内容**: .NET Aspire本地开发环境搭建和测试

- 🌟 .NET Aspire简介：什么是Aspire、Aspire优势
- 📦 安装和配置：Aspire工作负载、Docker Desktop、Dapr初始化
- 🚀 启动Aspire AppHost：项目结构、配置说明、启动步骤
- 🌐 访问服务和仪表板：
  - Aspire Dashboard (http://localhost:18888)
  - 运维监测微服务 API (http://localhost:8080)
  - Vue前端 (http://localhost:3000)
  - PostgreSQL、Redis、RabbitMQ、Elasticsearch、Prometheus、Grafana
  - Dapr Sidecars
- 📊 使用Aspire Dashboard：服务资源视图、日志查看、分布式追踪、性能指标
- 🔧 调试和排错：服务启动失败、数据库连接失败、Elasticsearch启动慢、前端Hot Reload
- 🧪 测试场景：功能测试、性能测试、集成测试

**适用人群**: 开发人员、测试工程师

---

### [06 - K8S部署与集成指南](./06-K8S部署与集成指南.md)
**核心内容**: Kubernetes生产环境部署、集成到SmartAbp平台

- ☸️ K8S集群准备：集群要求、必需组件、存储类配置
- 🏗️ 部署基础设施服务：
  - 创建命名空间
  - 部署PostgreSQL（StatefulSet + PVC）
  - 部署Redis
  - 部署Elasticsearch（StatefulSet + PVC）
  - 部署Prometheus（ConfigMap + Deployment）
- 🚀 部署运维监测微服务：
  - 构建Docker镜像
  - 应用K8S配置（Secret、ConfigMap、Dapr Component、Deployment、Service、HPA、Ingress）
  - 验证部署（Pod、Service、Ingress、HPA状态）
- 🔒 配置TLS证书：ClusterIssuer、Ingress TLS
- 🔗 集成到SmartAbp平台：
  - 主应用配置
  - 注册运维监测客户端
  - 前端集成
  - 权限集成
- 📊 监控和维护：
  - 查看运行状态
  - 滚动更新
  - 回滚部署
  - 扩缩容
  - 备份和恢复
- 🔧 故障排查：Pod Pending、Pod频繁重启、Ingress无法访问、数据库连接失败

**适用人群**: DevOps工程师、运维工程师、系统管理员

---

## 📖 快速导航

### 按角色分类

**🎯 项目决策者**
- 阅读顺序: 01 → 03（概览部分）

**👨‍💻 开发人员**
- 阅读顺序: 01 → 03 → 04 → 05

**🔧 运维工程师**
- 阅读顺序: 01 → 02 → 06

**🧪 测试工程师**
- 阅读顺序: 01 → 02 → 05

**🏗️ 架构师**
- 阅读顺序: 01 → 03 → 06

### 按场景分类

**🚀 快速上手**
```
01-系统概述 → 05-Aspire本地测试指南
```

**🏭 生产部署**
```
03-技术架构说明 → 06-K8S部署与集成指南
```

**🔧 功能开发**
```
03-技术架构说明 → 04-二次开发指南
```

**📊 日常运维**
```
02-操作使用说明 → 06-K8S部署与集成指南（监控和维护部分）
```

---

## 🌟 核心亮点

### 技术创新
- ✅ **DDD领域驱动设计**: 清晰的分层架构，高内聚低耦合
- ✅ **双写架构**: PostgreSQL保证可靠性 + Elasticsearch提供高性能查询
- ✅ **Dapr Service Mesh**: 微服务通信、状态管理、Pub/Sub
- ✅ **.NET Aspire编排**: 一键启动本地开发环境
- ✅ **Vue3 Composition API**: 逻辑复用、类型安全、代码组织优化

### 部署能力
- ✅ **本地开发**: Aspire一键启动（11个服务）
- ✅ **K8S生产**: 完整YAML配置 + HPA自动扩缩容
- ✅ **云原生**: 容器化、服务网格、可观测性
- ✅ **高可用**: 多副本、健康检查、滚动更新、自动重启

### 监控能力
- ✅ **APM性能监控**: Prometheus + Grafana
- ✅ **ELK日志管理**: Elasticsearch全文检索 + Kibana可视化
- ✅ **K8s资源监控**: 集群状态、Pod管理、资源使用
- ✅ **智能告警**: 规则配置、多渠道通知、历史追溯

---

## 📊 文档统计

| 文档 | 字数 | 页数（估） | 核心内容 |
|-----|------|----------|---------|
| 01-系统概述 | 2,800字 | 10页 | 功能、架构、特点 |
| 02-操作使用说明 | 2,400字 | 9页 | 面板操作、使用场景 |
| 03-技术架构说明 | 3,000字 | 12页 | 架构设计、技术实现 |
| 04-二次开发指南 | 2,500字 | 10页 | 开发环境、扩展开发 |
| 05-Aspire本地测试指南 | 2,800字 | 11页 | Aspire搭建、测试 |
| 06-K8S部署与集成指南 | 3,000字 | 12页 | K8S部署、集成 |
| **总计** | **16,500字** | **64页** | **完整技术文档** |

---

## 🔗 相关资源

### 官方文档
- [ABP Framework](https://abp.io/)
- [.NET Aspire](https://learn.microsoft.com/en-us/dotnet/aspire/)
- [Dapr](https://dapr.io/)
- [Vue 3](https://vuejs.org/)
- [Kubernetes](https://kubernetes.io/)

### 项目链接
- 源代码仓库: https://github.com/your-org/smartabp
- 在线演示: https://demo.smartabp.com
- 技术支持: support@smartabp.com

---

## 📝 文档版本

| 版本 | 日期 | 作者 | 变更说明 |
|-----|------|------|---------|
| v1.0.0 | 2025-10-01 | AI Chief Architect | 初始版本，完整文档体系 |

---

## 🎯 后续计划

- [ ] 添加视频教程（操作演示）
- [ ] 补充常见问题FAQ
- [ ] 增加性能调优最佳实践
- [ ] 编写故障处理手册
- [ ] 提供Helm Chart部署方式

---

**🏆 SmartAbp运维监测系统 - 企业级、生产就绪、全栈交付！**

**📧 技术支持**: support@smartabp.com  
**💬 技术交流**: https://github.com/your-org/smartabp/discussions

