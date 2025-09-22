# ADR-0001: 技术栈选择

## 状态
已接受

## 背景
SmartAbp项目需要选择合适的技术栈来构建现代化的企业级应用系统。项目需要支持：
- 快速开发和部署
- 高性能和可扩展性
- 现代化的用户界面
- 微服务架构
- 跨平台部署
- 低代码/无代码能力

## 决策
我们选择以下技术栈：

### 后端技术栈
- **框架**: ASP.NET Core + ABP Framework
- **数据库**: SQL Server / PostgreSQL
- **ORM**: Entity Framework Core
- **认证**: OpenIddict + JWT
- **API**: RESTful API + GraphQL
- **缓存**: Redis
- **消息队列**: RabbitMQ
- **容器化**: Docker + Kubernetes

### 前端技术栈
- **框架**: Vue.js 3 + Composition API
- **构建工具**: Vite
- **UI组件库**: Element Plus
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **HTTP客户端**: Axios
- **类型系统**: TypeScript
- **样式**: SCSS + CSS Variables

### 低代码引擎
- **核心**: 自研低代码引擎
- **渲染引擎**: Vue.js 3
- **设计器**: 可视化拖拽设计器
- **代码生成**: 模板引擎 + AST操作

## 后果

### 正面影响
- **开发效率**: ABP Framework提供了丰富的基础设施，大大提高开发效率
- **类型安全**: TypeScript提供了强类型支持，减少运行时错误
- **现代化UI**: Vue 3 + Element Plus提供了现代化的用户体验
- **性能优化**: Vite提供了快速的开发和构建体验
- **可维护性**: 清晰的架构分层和模块化设计
- **扩展性**: 微服务架构支持水平扩展
- **生态系统**: 所选技术都有活跃的社区和丰富的生态

### 负面影响
- **学习成本**: 团队需要学习ABP Framework和Vue 3的新特性
- **复杂性**: 微服务架构增加了系统的复杂性
- **依赖管理**: 多个技术栈需要协调版本兼容性

### 风险和缓解措施
- **技术更新风险**: 定期评估和升级技术栈版本
- **人员技能风险**: 提供培训和技术分享
- **性能风险**: 建立性能监控和优化机制

## 替代方案

### 方案A: .NET Framework + Angular
- **描述**: 使用传统的.NET Framework配合Angular前端
- **优点**: 团队熟悉度高，生态成熟
- **缺点**: 技术相对陈旧，性能不如.NET Core
- **为什么没选择**: .NET Core性能更好，跨平台支持更佳

### 方案B: Spring Boot + React
- **描述**: 使用Java Spring Boot后端配合React前端
- **优点**: Java生态丰富，React社区活跃
- **缺点**: 团队对Java不够熟悉，开发效率可能较低
- **为什么没选择**: 团队.NET技能更强，ABP Framework更适合企业应用

### 方案C: Node.js + Vue.js
- **描述**: 全栈JavaScript解决方案
- **优点**: 技术栈统一，开发效率高
- **缺点**: 企业级特性不如.NET，类型安全性较弱
- **为什么没选择**: 企业级应用需要更强的类型安全和性能保证

## 实施细节

### 阶段1: 基础架构搭建
1. 搭建ABP Framework项目结构
2. 配置Entity Framework Core和数据库
3. 设置认证和授权系统
4. 搭建Vue.js前端项目

### 阶段2: 核心功能开发
1. 实现基础CRUD功能
2. 开发用户管理和权限系统
3. 实现API接口和前端页面
4. 集成缓存和消息队列

### 阶段3: 低代码引擎
1. 设计低代码引擎架构
2. 实现可视化设计器
3. 开发代码生成器
4. 集成运行时引擎

## 相关决策
- [ADR-0002: 前端架构设计](./0002-frontend-architecture.md)
- [ADR-0003: 后端架构设计](./0003-backend-architecture.md)
- [ADR-0011: 低代码引擎架构](./0011-lowcode-engine-architecture.md)

## 参考资料
- [ABP Framework官方文档](https://docs.abp.io/)
- [Vue.js 3官方文档](https://vuejs.org/)
- [ASP.NET Core官方文档](https://docs.microsoft.com/aspnet/core/)
- [Element Plus官方文档](https://element-plus.org/)

---
**创建日期**: 2025-09-11  
**最后更新**: 2025-09-11  
**决策者**: 架构团队  
**影响范围**: 整个项目的技术基础