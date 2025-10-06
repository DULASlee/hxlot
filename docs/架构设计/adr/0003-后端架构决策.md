# ADR-0003: 后端架构决策

## 状态
已接受

## 背景
SmartAbp项目后端基于ABP Framework构建，需要建立标准的分层架构、认证授权体系和API设计规范。

## 决策

### 技术栈
- **框架**: ABP Framework (基于.NET 8)
- **认证**: OpenIddict Server/Validation
- **数据访问**: Entity Framework Core
- **数据库**: SQL Server / LocalDB
- **API**: ABP Conventional Controllers (自动API)
- **日志**: Serilog

### 分层架构
```
SmartAbp.Web (宿主层)
├── SmartAbp.HttpApi (HTTP API层)
├── SmartAbp.Application (应用服务层)
├── SmartAbp.Application.Contracts (契约层)
├── SmartAbp.Domain (领域层)
├── SmartAbp.Domain.Shared (领域共享层)
└── SmartAbp.EntityFrameworkCore (数据访问层)
```

### 核心组件

#### 认证授权
- **OpenIddict配置**: 支持Password Grant Flow
- **自定义Claims**: SmartAbpProfileService注入用户/租户信息
- **权限系统**: 基于ABP权限框架
- **多租户**: ABP多租户支持

#### 数据访问
- **DbContext**: SmartAbpDbContext统一管理
- **仓储模式**: ABP内置仓储
- **迁移**: SmartAbp.DbMigrator独立控制台

#### API设计
- **自动API**: 应用服务自动暴露为REST API
- **约定路由**: `/api/[controller]/[action]`
- **DTO模式**: 输入输出严格使用DTO
- **分页查询**: 统一使用PagedAndSortedResultRequestDto

## 理由

### ABP Framework选择理由
1. **企业级特性**: 内置多租户、权限、审计、设置管理
2. **模块化设计**: 支持插件式开发
3. **最佳实践**: DDD、CQRS、事件驱动等模式支持
4. **生态完善**: 丰富的预构建模块

### 架构设计理由
1. **分层清晰**: 职责分离，便于维护和测试
2. **依赖方向**: 遵循DDD依赖倒置原则
3. **自动API**: 减少重复代码，提高开发效率
4. **统一DbContext**: 便于事务管理和查询优化

### OpenIddict选择理由
1. **标准兼容**: 完全符合OAuth 2.0/OpenID Connect标准
2. **ABP集成**: 官方推荐，集成度高
3. **安全性**: 成熟的安全实现
4. **扩展性**: 支持自定义Claims和流程

## 后果

### 正面影响
- 标准化的企业级架构
- 高度的代码复用性
- 强大的扩展能力
- 完善的安全机制

### 负面影响
- 学习曲线较陡峭
- 框架依赖较重
- 需要遵循ABP约定

### 风险缓解
- 提供ABP培训和文档
- 建立代码模板和示例
- 逐步引入复杂特性

## AI编程指导原则

### 强制要求
1. **分层约束**: 严格遵循ABP分层架构，不得跨层直接依赖
2. **应用服务**: 业务逻辑必须在Application层实现
3. **DTO使用**: API输入输出必须使用DTO，不得直接暴露实体
4. **权限检查**: 所有应用服务方法必须进行权限验证

### 代码生成规则
1. **实体定义**: 必须在Domain层定义，继承适当的基类
2. **应用服务**: 必须继承SmartAbpAppService
3. **权限常量**: 必须在Contracts层定义
4. **DTO映射**: 使用AutoMapper进行对象映射

### 命名约定
- **应用服务**: `{EntityName}AppService`
- **DTO**: `{EntityName}Dto`, `Create{EntityName}Dto`, `Update{EntityName}Dto`
- **权限**: `{ModuleName}Permissions.{EntityName}.{Action}`
- **API路由**: `/api/app/{entity-name}`

### 质量标准
- 所有公共方法必须有XML文档注释
- 异常处理使用ABP异常类型
- 日志记录使用ILogger接口
- 单元测试覆盖率 ≥ 80%

## 安全要求

### 认证安全
- 生产环境必须使用HTTPS
- Token过期时间合理设置
- 支持Token刷新机制

### 授权安全
- 最小权限原则
- 权限检查在应用服务层
- 多租户数据隔离

### 数据安全
- 敏感数据加密存储
- 审计日志完整记录
- 输入验证和SQL注入防护

## 性能要求

### 数据访问优化
- 合理使用Include避免N+1查询
- 分页查询使用Skip/Take
- 复杂查询考虑原生SQL

### 缓存策略
- 静态数据使用分布式缓存
- 权限信息适当缓存
- 缓存失效策略明确

## 相关文档
- [系统架构说明书](./系统架构说明书.md)
- [项目编程规则](../项目编程规则.md)
- [项目开发铁律](../项目开发铁律.md)

## 更新历史
- 2024-01-09: 初始版本，基于现有架构分析