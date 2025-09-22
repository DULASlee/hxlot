# ADR-0010: 设计模式应用

## 状态
已接受

## 背景
SmartAbp项目作为大型企业级应用，需要采用合适的设计模式来确保代码的可维护性、可扩展性和可测试性。设计模式的正确应用可以帮助团队：
- 提高代码质量和一致性
- 降低系统复杂度
- 提升开发效率
- 便于团队协作和知识传承

## 决策
我们在SmartAbp项目中采用以下设计模式：

### 1. 架构模式

#### 领域驱动设计 (DDD)
- **应用场景**: 整体架构设计
- **实现方式**: ABP Framework的DDD分层架构
- **核心概念**: 实体、值对象、聚合根、领域服务、应用服务

#### CQRS (命令查询职责分离)
- **应用场景**: 复杂业务操作的读写分离
- **实现方式**: 分离命令和查询的处理逻辑
- **适用模块**: 用户管理、订单处理、报表查询

#### 事件驱动架构
- **应用场景**: 模块间解耦和异步处理
- **实现方式**: ABP的分布式事件总线
- **典型场景**: 用户注册、订单状态变更、数据同步

### 2. 创建型模式

#### 工厂模式 (Factory Pattern)
- **应用场景**: 对象创建的封装和抽象
- **实现方式**: 依赖注入容器 + 工厂接口
- **典型应用**: 支付处理器、通知发送器、文件处理器

#### 建造者模式 (Builder Pattern)
- **应用场景**: 复杂对象的构建
- **实现方式**: Fluent API设计
- **典型应用**: 查询构建器、配置构建器、报表构建器

#### 单例模式 (Singleton Pattern)
- **应用场景**: 全局唯一实例
- **实现方式**: 依赖注入的单例生命周期
- **典型应用**: 配置管理器、缓存管理器、日志管理器

### 3. 结构型模式

#### 适配器模式 (Adapter Pattern)
- **应用场景**: 第三方服务集成
- **实现方式**: 接口适配和转换
- **典型应用**: 支付网关适配、短信服务适配、存储服务适配

#### 装饰器模式 (Decorator Pattern)
- **应用场景**: 功能增强和横切关注点
- **实现方式**: ABP的拦截器和过滤器
- **典型应用**: 缓存装饰、日志装饰、权限装饰

#### 外观模式 (Facade Pattern)
- **应用场景**: 复杂子系统的简化接口
- **实现方式**: 应用服务层的封装
- **典型应用**: 用户管理外观、订单处理外观、报表服务外观

### 4. 行为型模式

#### 策略模式 (Strategy Pattern)
- **应用场景**: 算法和业务规则的动态选择
- **实现方式**: 接口 + 具体策略实现
- **典型应用**: 支付策略、折扣策略、通知策略

#### 观察者模式 (Observer Pattern)
- **应用场景**: 事件通知和状态变更
- **实现方式**: 事件总线和事件处理器
- **典型应用**: 领域事件、系统通知、状态同步

#### 命令模式 (Command Pattern)
- **应用场景**: 操作的封装和队列化
- **实现方式**: 命令接口 + 命令处理器
- **典型应用**: 批量操作、撤销重做、任务队列

#### 模板方法模式 (Template Method Pattern)
- **应用场景**: 算法骨架的定义
- **实现方式**: 抽象基类 + 钩子方法
- **典型应用**: 数据导入流程、审批流程、报表生成

### 5. 前端设计模式

#### 组合模式 (Composition Pattern)
- **应用场景**: Vue组件的组合和复用
- **实现方式**: Composition API + 组合式函数
- **典型应用**: 表单组合、列表组合、图表组合

#### 发布订阅模式 (Pub/Sub Pattern)
- **应用场景**: 组件间通信
- **实现方式**: 事件总线 + 自定义事件
- **典型应用**: 全局状态通知、组件间消息传递

#### MVC/MVVM模式
- **应用场景**: 前端架构组织
- **实现方式**: Vue.js的响应式数据绑定
- **典型应用**: 页面结构、数据流管理

## 后果

### 正面影响
- **代码质量**: 统一的设计模式提高代码质量和一致性
- **可维护性**: 清晰的模式结构便于代码维护和修改
- **可扩展性**: 模式的抽象性支持功能扩展
- **团队协作**: 共同的设计语言提高团队沟通效率
- **知识传承**: 标准化的模式便于新成员学习
- **测试友好**: 模式的解耦特性便于单元测试

### 负面影响
- **学习成本**: 团队需要学习和理解各种设计模式
- **过度设计**: 可能导致不必要的复杂性
- **性能开销**: 某些模式可能带来额外的性能开销

### 风险和缓解措施
- **过度使用风险**: 建立代码审查机制，避免过度设计
- **模式误用风险**: 提供培训和最佳实践指南
- **性能风险**: 建立性能测试和监控机制

## 具体实施示例

### 1. 工厂模式实现

```csharp
// 支付处理器工厂
public interface IPaymentProcessorFactory
{
    IPaymentProcessor Create(PaymentType type);
}

public class PaymentProcessorFactory : IPaymentProcessorFactory
{
    private readonly IServiceProvider _serviceProvider;
    
    public PaymentProcessorFactory(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }
    
    public IPaymentProcessor Create(PaymentType type)
    {
        return type switch
        {
            PaymentType.Alipay => _serviceProvider.GetService<AlipayProcessor>(),
            PaymentType.WeChat => _serviceProvider.GetService<WeChatProcessor>(),
            PaymentType.UnionPay => _serviceProvider.GetService<UnionPayProcessor>(),
            _ => throw new NotSupportedException($"Payment type {type} is not supported")
        };
    }
}
```

### 2. 策略模式实现

```csharp
// 折扣策略
public interface IDiscountStrategy
{
    decimal CalculateDiscount(Order order);
}

public class VipDiscountStrategy : IDiscountStrategy
{
    public decimal CalculateDiscount(Order order)
    {
        return order.TotalAmount * 0.1m; // VIP用户10%折扣
    }
}

public class QuantityDiscountStrategy : IDiscountStrategy
{
    public decimal CalculateDiscount(Order order)
    {
        return order.Items.Count > 10 ? order.TotalAmount * 0.05m : 0;
    }
}

// 折扣计算服务
public class DiscountService
{
    public decimal CalculateDiscount(Order order, IDiscountStrategy strategy)
    {
        return strategy.CalculateDiscount(order);
    }
}
```

### 3. 装饰器模式实现

```csharp
// 缓存装饰器
public class CachedUserService : IUserService
{
    private readonly IUserService _userService;
    private readonly IDistributedCache _cache;
    
    public CachedUserService(IUserService userService, IDistributedCache cache)
    {
        _userService = userService;
        _cache = cache;
    }
    
    public async Task<UserDto> GetAsync(Guid id)
    {
        var cacheKey = $"user:{id}";
        var cachedUser = await _cache.GetStringAsync(cacheKey);
        
        if (cachedUser != null)
        {
            return JsonSerializer.Deserialize<UserDto>(cachedUser);
        }
        
        var user = await _userService.GetAsync(id);
        await _cache.SetStringAsync(cacheKey, JsonSerializer.Serialize(user));
        
        return user;
    }
}
```

### 4. 观察者模式实现

```csharp
// 领域事件
public class UserCreatedEvent : IDistributedEvent
{
    public Guid UserId { get; set; }
    public string Email { get; set; }
    public DateTime CreatedTime { get; set; }
}

// 事件处理器
public class UserCreatedEventHandler : IDistributedEventHandler<UserCreatedEvent>
{
    private readonly IEmailService _emailService;
    private readonly IAuditService _auditService;
    
    public async Task HandleEventAsync(UserCreatedEvent eventData)
    {
        // 发送欢迎邮件
        await _emailService.SendWelcomeEmailAsync(eventData.Email);
        
        // 记录审计日志
        await _auditService.LogAsync($"User {eventData.UserId} created");
    }
}
```

### 5. 前端组合模式实现

```typescript
// 表单组合函数
export function useForm<T>(initialValues: T) {
  const formData = ref<T>(initialValues)
  const errors = ref<Record<string, string>>({})
  const isSubmitting = ref(false)
  
  const validate = (rules: ValidationRules<T>) => {
    // 验证逻辑
  }
  
  const submit = async (submitFn: (data: T) => Promise<void>) => {
    isSubmitting.value = true
    try {
      await submitFn(formData.value)
    } finally {
      isSubmitting.value = false
    }
  }
  
  return {
    formData,
    errors,
    isSubmitting,
    validate,
    submit
  }
}

// 列表组合函数
export function useList<T>(fetchFn: (params: any) => Promise<PagedResult<T>>) {
  const items = ref<T[]>([])
  const loading = ref(false)
  const pagination = ref({
    current: 1,
    pageSize: 10,
    total: 0
  })
  
  const load = async (params?: any) => {
    loading.value = true
    try {
      const result = await fetchFn({
        ...params,
        skipCount: (pagination.value.current - 1) * pagination.value.pageSize,
        maxResultCount: pagination.value.pageSize
      })
      items.value = result.items
      pagination.value.total = result.totalCount
    } finally {
      loading.value = false
    }
  }
  
  return {
    items,
    loading,
    pagination,
    load
  }
}
```

## 模式选择指南

### 何时使用工厂模式
- 需要根据条件创建不同类型的对象
- 对象创建逻辑复杂
- 需要隐藏对象创建的细节

### 何时使用策略模式
- 有多种算法或业务规则
- 需要在运行时动态选择算法
- 避免大量的if-else或switch语句

### 何时使用装饰器模式
- 需要动态添加功能
- 横切关注点的处理（如缓存、日志、权限）
- 避免继承层次过深

### 何时使用观察者模式
- 对象状态变化需要通知其他对象
- 松耦合的事件处理
- 一对多的依赖关系

## 替代方案

### 方案A: 面向过程编程
- **描述**: 使用简单的函数和过程来组织代码
- **优点**: 简单直接，学习成本低
- **缺点**: 难以维护和扩展，代码重复度高
- **为什么没选择**: 不适合大型项目的复杂性管理

### 方案B: 函数式编程
- **描述**: 主要使用函数式编程范式
- **优点**: 代码简洁，副作用少
- **缺点**: 学习曲线陡峭，与现有技术栈不匹配
- **为什么没选择**: 团队熟悉度不够，与ABP Framework不匹配

## 实施计划

### 第一阶段: 核心模式应用 (1个月)
1. 实施DDD分层架构
2. 应用工厂模式和策略模式
3. 建立事件驱动机制
4. 前端组合模式实施

### 第二阶段: 高级模式应用 (2个月)
1. CQRS模式实施
2. 装饰器模式应用
3. 模板方法模式应用
4. 完善观察者模式

### 第三阶段: 优化和完善 (1个月)
1. 模式使用规范制定
2. 代码审查标准建立
3. 最佳实践文档编写
4. 团队培训和分享

## 相关决策
- [ADR-0001: 技术栈选择](./0001-technology-stack-selection.md)
- [ADR-0002: 前端架构设计](./0002-frontend-architecture.md)
- [ADR-0003: 后端架构设计](./0003-backend-architecture.md)

## 参考资料
- [Design Patterns: Elements of Reusable Object-Oriented Software](https://en.wikipedia.org/wiki/Design_Patterns)
- [ABP Framework Architecture](https://docs.abp.io/en/abp/latest/Architecture)
- [Vue.js Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

---
**创建日期**: 2025-09-11  
**最后更新**: 2025-09-11  
**决策者**: 架构团队, 开发团队  
**影响范围**: 整个项目的代码结构和设计