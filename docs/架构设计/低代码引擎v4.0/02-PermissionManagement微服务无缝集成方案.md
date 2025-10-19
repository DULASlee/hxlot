# PermissionManagement微服务无缝集成方案 v1.0

## 📋 文档信息

| 项目 | 内容 |
|------|------|
| 文档版本 | v1.0 |
| 创建日期 | 2025-10-19 |
| 负责人 | SmartABP架构团队 |
| 优先级 | P0（最高优先级）|
| 状态 | 设计阶段 |
| 客户端SDK | SmartAbp.PermissionManagement.Client |

---

## 🎯 1. 系统概述

### 1.1 业务目标

PermissionManagement微服务是SmartABP低代码引擎平台的统一权限管理系统，提供零侵入式的权限验证、角色管理、动态权限更新能力。

### 1.2 核心价值

- **零侵入式集成**：一行代码完成权限系统集成
- **高性能验证**：本地双层缓存（Redis + 内存），验证响应时间<5ms
- **实时权限同步**：权限变更实时推送到所有客户端
- **100%可靠性**：权限数据不丢失，离线自动降级
- **细粒度控制**：支持到按钮级别的权限控制

### 1.3 应用场景

```yaml
应用场景清单:
  1. 低代码引擎平台:
     - 页面访问权限控制
     - API接口权限验证
     - 按钮级别权限控制
     - 数据行级权限控制
     
  2. MES制造执行系统:
     - 工作站权限控制
     - 设备操作权限
     - 生产数据访问权限
     - 质量检验权限
     
  3. 智慧工地管理系统:
     - 人员进场权限
     - 设备使用权限
     - 数据查看权限
     - 审批流程权限
     
  4. DevKit框架:
     - 代码生成权限
     - 模板管理权限
     - 系统配置权限
     - AI功能权限
```

---

## 🏗️ 2. 现有SmartAbp权限系统分析

### 2.1 现有权限系统优势

通过深度分析`src/SmartAbp.Application/Permissions/`，发现SmartABP已有完善的权限基础：

```csharp
// src/SmartAbp.Application/Permissions/PermissionManagement/PermissionAppService.cs
public class PermissionAppService : ApplicationService, IPermissionAppService
{
    private readonly IPermissionManager _permissionManager;
    private readonly IPermissionDefinitionManager _permissionDefinitionManager;
    
    // ✅ 已有完善的权限查询和管理
    public async Task<PermissionListResultDto> GetAsync(string providerName, string providerKey)
    public async Task UpdateAsync(string providerName, string providerKey, UpdatePermissionsDto input)
}

// ✅ 已有权限定义提供者
public class SmartAbpPermissionDefinitionProvider : PermissionDefinitionProvider
{
    public override void Define(IPermissionDefinitionContext context)
    {
        var lowCodeGroup = context.AddGroup(SmartAbpPermissions.GroupName);
        // ... 完整的权限定义
    }
}
```

**现有优势**：
- ✅ ABP权限框架集成完整
- ✅ 权限定义体系完善
- ✅ 权限查询API完整
- ✅ 支持多种权限提供者（User/Role/Client）

### 2.2 现有系统痛点

**核心问题识别**：

1. **❌ 无客户端SDK，集成复杂**
   - 每个系统需要手动编写权限验证代码
   - 权限缓存策略不统一
   - 代码重复度高

2. **❌ 无本地权限缓存，性能低**
   - 每次权限验证都需要调用API
   - 响应时间>100ms
   - 高并发场景性能瓶颈

3. **❌ 无实时权限同步，一致性差**
   - 权限变更后需要重启应用
   - 权限缓存更新延迟
   - 用户体验差

4. **❌ 无自动权限拦截器，开发效率低**
   - 每个API都需要手动添加`[Authorize]`特性
   - 手动验证权限代码容易遗漏
   - 无法统一权限日志

---

## 💡 3. SmartAbp.PermissionManagement.Client SDK设计

### 3.1 核心设计理念（基于现有系统增强）

**设计原则**：
1. ✅ 100%兼容现有ABP权限系统
2. ✅ 零侵入式集成（不修改现有代码）
3. ✅ 本地双层缓存（Redis + 内存）
4. ✅ 实时权限同步（SignalR推送）
5. ✅ 自动权限拦截器（ABP集成）
6. ✅ 离线降级策略（网络故障时使用本地缓存）

### 3.2 6大核心集成组件

#### 组件1：PermissionCacheManager（权限缓存管理器）

**职责**：双层权限缓存管理（Redis + 内存）

```csharp
// PermissionCacheManager.cs
using System.Collections.Concurrent;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Caching.Memory;

namespace SmartAbp.PermissionManagement.Client.Caching
{
    /// <summary>
    /// 权限缓存管理器
    /// 双层缓存：Redis（一级，跨进程共享）+ 内存（二级，进程内高速）
    /// </summary>
    public class PermissionCacheManager
    {
        private readonly IDistributedCache _distributedCache; // Redis
        private readonly IMemoryCache _memoryCache;           // 内存
        private readonly PermissionManagementOptions _options;
        
        // 内存缓存过期时间：5分钟（可配置）
        private readonly TimeSpan _memoryCacheExpiration;
        
        // Redis缓存过期时间：30分钟（可配置）
        private readonly TimeSpan _redisCacheExpiration;
        
        public PermissionCacheManager(
            IDistributedCache distributedCache,
            IMemoryCache memoryCache,
            PermissionManagementOptions options)
        {
            _distributedCache = distributedCache;
            _memoryCache = memoryCache;
            _options = options;
            _memoryCacheExpiration = TimeSpan.FromMinutes(options.MemoryCacheExpirationMinutes);
            _redisCacheExpiration = TimeSpan.FromMinutes(options.RedisCacheExpirationMinutes);
        }

        /// <summary>
        /// 获取用户权限（双层缓存）
        /// </summary>
        public async Task<HashSet<string>> GetUserPermissionsAsync(Guid userId)
        {
            var cacheKey = $"perm:user:{userId}";
            
            // 1. 先查内存缓存（最快）
            if (_memoryCache.TryGetValue(cacheKey, out HashSet<string>? memoryPermissions))
            {
                return memoryPermissions!;
            }
            
            // 2. 查Redis缓存
            var redisData = await _distributedCache.GetStringAsync(cacheKey);
            if (!string.IsNullOrEmpty(redisData))
            {
                var permissions = JsonSerializer.Deserialize<HashSet<string>>(redisData)!;
                
                // 写入内存缓存
                _memoryCache.Set(cacheKey, permissions, _memoryCacheExpiration);
                
                return permissions;
            }
            
            // 3. 缓存未命中，从API加载
            var permissionsFromApi = await LoadPermissionsFromApiAsync(userId);
            
            // 写入Redis缓存
            var json = JsonSerializer.Serialize(permissionsFromApi);
            await _distributedCache.SetStringAsync(
                cacheKey,
                json,
                new DistributedCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = _redisCacheExpiration
                }
            );
            
            // 写入内存缓存
            _memoryCache.Set(cacheKey, permissionsFromApi, _memoryCacheExpiration);
            
            return permissionsFromApi;
        }

        /// <summary>
        /// 清除用户权限缓存（权限变更时调用）
        /// </summary>
        public async Task ClearUserPermissionsAsync(Guid userId)
        {
            var cacheKey = $"perm:user:{userId}";
            
            // 清除内存缓存
            _memoryCache.Remove(cacheKey);
            
            // 清除Redis缓存
            await _distributedCache.RemoveAsync(cacheKey);
        }

        /// <summary>
        /// 预热权限缓存（应用启动时调用）
        /// </summary>
        public async Task WarmupCacheAsync(List<Guid> userIds)
        {
            var tasks = userIds.Select(userId => GetUserPermissionsAsync(userId));
            await Task.WhenAll(tasks);
        }
        
        private async Task<HashSet<string>> LoadPermissionsFromApiAsync(Guid userId)
        {
            // 调用 PermissionManagementClient 从API加载权限
            var client = _serviceProvider.GetRequiredService<PermissionManagementClient>();
            var permissions = await client.GetUserPermissionsAsync(userId);
            return permissions;
        }
    }
}
```

#### 组件2：PermissionSyncProcessor（权限同步处理器）

**职责**：实时权限同步（SignalR推送）

```csharp
// PermissionSyncProcessor.cs
using Microsoft.AspNetCore.SignalR.Client;

namespace SmartAbp.PermissionManagement.Client.Sync
{
    /// <summary>
    /// 权限同步处理器
    /// 通过SignalR接收权限变更通知，实时更新本地缓存
    /// </summary>
    public class PermissionSyncProcessor : IAsyncDisposable
    {
        private readonly PermissionCacheManager _cacheManager;
        private readonly PermissionManagementOptions _options;
        private readonly ILogger<PermissionSyncProcessor> _logger;
        private HubConnection? _hubConnection;
        
        public PermissionSyncProcessor(
            PermissionCacheManager cacheManager,
            PermissionManagementOptions options,
            ILogger<PermissionSyncProcessor> logger)
        {
            _cacheManager = cacheManager;
            _options = options;
            _logger = logger;
        }

        /// <summary>
        /// 启动权限同步
        /// </summary>
        public async Task StartAsync()
        {
            _hubConnection = new HubConnectionBuilder()
                .WithUrl($"{_options.ServiceUrl}/hubs/permission")
                .WithAutomaticReconnect(new[] {
                    TimeSpan.FromSeconds(0),
                    TimeSpan.FromSeconds(2),
                    TimeSpan.FromSeconds(10),
                    TimeSpan.FromSeconds(30)
                })
                .Build();

            // 订阅权限变更事件
            _hubConnection.On<Guid>("OnPermissionChanged", async (userId) =>
            {
                _logger.LogInformation($"收到权限变更通知: UserId={userId}");
                
                // 清除缓存
                await _cacheManager.ClearUserPermissionsAsync(userId);
                
                // 预加载新权限
                await _cacheManager.GetUserPermissionsAsync(userId);
            });

            // 订阅批量权限变更事件
            _hubConnection.On<List<Guid>>("OnPermissionsBatchChanged", async (userIds) =>
            {
                _logger.LogInformation($"收到批量权限变更通知: Count={userIds.Count}");
                
                foreach (var userId in userIds)
                {
                    await _cacheManager.ClearUserPermissionsAsync(userId);
                }
            });

            // 连接SignalR Hub
            await _hubConnection.StartAsync();
            _logger.LogInformation("权限同步处理器已启动");
        }

        /// <summary>
        /// 停止权限同步
        /// </summary>
        public async ValueTask DisposeAsync()
        {
            if (_hubConnection != null)
            {
                await _hubConnection.DisposeAsync();
            }
        }
    }
}
```

#### 组件3：PermissionValidator（权限验证器）

**职责**：高性能权限验证（<5ms）

```csharp
// PermissionValidator.cs
namespace SmartAbp.PermissionManagement.Client.Validation
{
    /// <summary>
    /// 权限验证器
    /// 高性能权限验证（基于本地缓存，响应时间<5ms）
    /// </summary>
    public class PermissionValidator
    {
        private readonly PermissionCacheManager _cacheManager;
        private readonly ICurrentUser _currentUser;
        private readonly ILogger<PermissionValidator> _logger;
        
        public PermissionValidator(
            PermissionCacheManager cacheManager,
            ICurrentUser currentUser,
            ILogger<PermissionValidator> logger)
        {
            _cacheManager = cacheManager;
            _currentUser = currentUser;
            _logger = logger;
        }

        /// <summary>
        /// 验证当前用户是否有指定权限
        /// </summary>
        public async Task<bool> IsGrantedAsync(string permissionName)
        {
            if (!_currentUser.IsAuthenticated)
            {
                return false;
            }

            var userId = _currentUser.Id!.Value;
            var permissions = await _cacheManager.GetUserPermissionsAsync(userId);
            
            return permissions.Contains(permissionName);
        }

        /// <summary>
        /// 验证当前用户是否有任意一个权限
        /// </summary>
        public async Task<bool> IsGrantedAnyAsync(params string[] permissionNames)
        {
            if (!_currentUser.IsAuthenticated)
            {
                return false;
            }

            var userId = _currentUser.Id!.Value;
            var permissions = await _cacheManager.GetUserPermissionsAsync(userId);
            
            return permissionNames.Any(p => permissions.Contains(p));
        }

        /// <summary>
        /// 验证当前用户是否拥有所有权限
        /// </summary>
        public async Task<bool> IsGrantedAllAsync(params string[] permissionNames)
        {
            if (!_currentUser.IsAuthenticated)
            {
                return false;
            }

            var userId = _currentUser.Id!.Value;
            var permissions = await _cacheManager.GetUserPermissionsAsync(userId);
            
            return permissionNames.All(p => permissions.Contains(p));
        }

        /// <summary>
        /// 断言当前用户有指定权限（无权限则抛出异常）
        /// </summary>
        public async Task CheckAsync(string permissionName)
        {
            if (!await IsGrantedAsync(permissionName))
            {
                throw new AbpAuthorizationException($"权限验证失败: {permissionName}");
            }
        }
    }
}
```

#### 组件4：PermissionInterceptor（权限拦截器）

**职责**：自动拦截ABP AppService方法，验证`[Authorize]`特性

```csharp
// PermissionInterceptor.cs
using Volo.Abp.DependencyInjection;
using Volo.Abp.DynamicProxy;
using Microsoft.AspNetCore.Authorization;

namespace SmartAbp.PermissionManagement.Client.Interceptors
{
    /// <summary>
    /// 权限拦截器
    /// 自动拦截标记了[Authorize]特性的AppService方法，验证权限
    /// </summary>
    public class PermissionInterceptor : AbpInterceptor, ITransientDependency
    {
        private readonly PermissionValidator _permissionValidator;
        private readonly ILogger<PermissionInterceptor> _logger;

        public PermissionInterceptor(
            PermissionValidator permissionValidator,
            ILogger<PermissionInterceptor> logger)
        {
            _permissionValidator = permissionValidator;
            _logger = logger;
        }

        public override async Task InterceptAsync(IAbpMethodInvocation invocation)
        {
            // 获取方法或类上的 [Authorize] 特性
            var authorizeAttribute = invocation.Method
                .GetCustomAttributes(typeof(AuthorizeAttribute), true)
                .FirstOrDefault() as AuthorizeAttribute
                ?? invocation.Method.DeclaringType?
                .GetCustomAttributes(typeof(AuthorizeAttribute), true)
                .FirstOrDefault() as AuthorizeAttribute;

            if (authorizeAttribute != null)
            {
                var permissionName = authorizeAttribute.Policy;
                
                if (!string.IsNullOrEmpty(permissionName))
                {
                    _logger.LogDebug($"验证权限: {permissionName}");
                    
                    // 验证权限
                    await _permissionValidator.CheckAsync(permissionName);
                }
            }

            // 继续执行方法
            await invocation.ProceedAsync();
        }
    }
}
```

#### 组件5：PermissionMiddleware（权限中间件）

**职责**：自动拦截HTTP请求，验证权限

```csharp
// PermissionMiddleware.cs
using Microsoft.AspNetCore.Http;

namespace SmartAbp.PermissionManagement.Client.Middleware
{
    /// <summary>
    /// 权限中间件
    /// 自动拦截HTTP请求，验证权限
    /// </summary>
    public class PermissionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly PermissionValidator _permissionValidator;
        private readonly ILogger<PermissionMiddleware> _logger;

        public PermissionMiddleware(
            RequestDelegate next,
            PermissionValidator permissionValidator,
            ILogger<PermissionMiddleware> logger)
        {
            _next = next;
            _permissionValidator = permissionValidator;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var endpoint = context.GetEndpoint();
            
            if (endpoint != null)
            {
                // 获取端点上的 [Authorize] 特性
                var authorizeAttribute = endpoint.Metadata
                    .GetMetadata<AuthorizeAttribute>();

                if (authorizeAttribute != null)
                {
                    var permissionName = authorizeAttribute.Policy;
                    
                    if (!string.IsNullOrEmpty(permissionName))
                    {
                        _logger.LogDebug($"验证权限: {permissionName}");
                        
                        // 验证权限
                        if (!await _permissionValidator.IsGrantedAsync(permissionName))
                        {
                            context.Response.StatusCode = 403;
                            await context.Response.WriteAsync("权限不足");
                            return;
                        }
                    }
                }
            }

            await _next(context);
        }
    }
}
```

#### 组件6：PermissionManagementClient（HTTP客户端）

**职责**：与PermissionManagement微服务通信

```csharp
// PermissionManagementClient.cs
using System.Net.Http.Json;

namespace SmartAbp.PermissionManagement.Client
{
    /// <summary>
    /// PermissionManagement HTTP客户端
    /// </summary>
    public class PermissionManagementClient
    {
        private readonly HttpClient _httpClient;
        private readonly PermissionManagementOptions _options;

        public PermissionManagementClient(
            HttpClient httpClient,
            PermissionManagementOptions options)
        {
            _httpClient = httpClient;
            _httpClient.BaseAddress = new Uri(options.ServiceUrl);
            _options = options;
        }

        /// <summary>
        /// 获取用户权限列表
        /// </summary>
        public async Task<HashSet<string>> GetUserPermissionsAsync(Guid userId)
        {
            var response = await _httpClient.GetAsync($"/api/permission-management/permissions/user/{userId}");
            response.EnsureSuccessStatusCode();
            
            var result = await response.Content.ReadFromJsonAsync<PermissionListResultDto>();
            return result!.Permissions.Select(p => p.Name).ToHashSet();
        }

        /// <summary>
        /// 检查用户是否有指定权限
        /// </summary>
        public async Task<bool> CheckPermissionAsync(Guid userId, string permissionName)
        {
            var response = await _httpClient.GetAsync(
                $"/api/permission-management/permissions/check?userId={userId}&permission={permissionName}"
            );
            return response.IsSuccessStatusCode;
        }

        /// <summary>
        /// 授予用户权限
        /// </summary>
        public async Task GrantPermissionAsync(Guid userId, string permissionName)
        {
            var response = await _httpClient.PostAsJsonAsync(
                "/api/permission-management/permissions/grant",
                new { UserId = userId, PermissionName = permissionName }
            );
            response.EnsureSuccessStatusCode();
        }

        /// <summary>
        /// 撤销用户权限
        /// </summary>
        public async Task RevokePermissionAsync(Guid userId, string permissionName)
        {
            var response = await _httpClient.PostAsJsonAsync(
                "/api/permission-management/permissions/revoke",
                new { UserId = userId, PermissionName = permissionName }
            );
            response.EnsureSuccessStatusCode();
        }
    }
}
```

---

## 🔌 4. 3种无缝集成方式

### 4.1 方式1：零侵入式集成（推荐）

**使用场景**：快速集成，最小化代码改动

```csharp
// Program.cs
var builder = WebApplication.CreateBuilder(args);

// ⭐ 一行代码完成权限系统集成
builder.Host.UsePermissionManagement(
    serviceUrl: "http://permission-api:5000",
    serviceName: "SmartAbp.LowCode"
);

var app = builder.Build();
app.Run();

// ✅ 自动启用：
// - 权限验证拦截器（自动拦截[Authorize]特性）
// - 本地权限缓存（Redis + 内存双层）
// - 实时权限同步（SignalR）
// - 权限HTTP中间件
```

### 4.2 方式2：ABP Module集成（企业级）

**使用场景**：需要高度自定义配置

```csharp
// Program.cs
builder.Services.AddPermissionManagementClient(options =>
{
    options.ServiceUrl = "http://permission-api:5000";
    options.ServiceName = "SmartAbp.LowCode";
    
    // 缓存配置
    options.MemoryCacheExpirationMinutes = 5;
    options.RedisCacheExpirationMinutes = 30;
    
    // 权限验证配置
    options.EnableAutoInterceptor = true;
    options.EnablePermissionMiddleware = true;
    
    // SignalR实时同步配置
    options.EnableRealtimeSync = true;
    
    // 离线降级策略
    options.EnableOfflineMode = true;
    options.OfflineCacheExpirationDays = 7;
});

app.UsePermissionManagement();
```

### 4.3 方式3：HttpClient SDK（通用）

**使用场景**：手动控制权限验证

```csharp
// 注入依赖
builder.Services.AddHttpClient<PermissionManagementClient>();
builder.Services.AddSingleton<PermissionManagementOptions>(new PermissionManagementOptions
{
    ServiceUrl = "http://permission-api:5000",
    ServiceName = "SmartAbp.LowCode"
});

// 手动验证权限
public class MyAppService : ApplicationService
{
    private readonly PermissionManagementClient _permissionClient;
    
    public MyAppService(PermissionManagementClient permissionClient)
    {
        _permissionClient = permissionClient;
    }
    
    public async Task DoSomethingAsync()
    {
        var userId = CurrentUser.Id!.Value;
        var hasPermission = await _permissionClient.CheckPermissionAsync(
            userId,
            "SmartAbp.LowCode.Entities.Create"
        );
        
        if (!hasPermission)
        {
            throw new AbpAuthorizationException("权限不足");
        }
        
        // 执行业务逻辑
    }
}
```

---

## 📊 5. 核心特性

### 5.1 性能特性

```yaml
权限验证性能:
  ✅ 内存缓存命中: <1ms
  ✅ Redis缓存命中: <5ms
  ✅ API调用: <100ms
  ✅ 双层缓存命中率: >99%

缓存性能:
  ✅ 内存缓存容量: 10,000用户权限
  ✅ Redis缓存容量: 1,000,000用户权限
  ✅ 缓存预热时间: <30秒（10,000用户）
  ✅ 缓存清除时间: <100ms

同步性能:
  ✅ SignalR连接时间: <1秒
  ✅ 权限变更通知延迟: <100ms
  ✅ 批量权限同步: 10,000用户/秒
```

### 5.2 可靠性特性

```yaml
高可用性:
  ✅ 服务降级: 网络故障时使用本地缓存
  ✅ 自动重连: SignalR断线自动重连（指数退避）
  ✅ 缓存持久化: 7天本地缓存保留
  ✅ 故障恢复: 服务恢复后自动同步权限

数据一致性:
  ✅ 实时同步: 权限变更实时推送
  ✅ 缓存失效: 权限变更时立即清除缓存
  ✅ 最终一致性: 异常情况下最终一致性保证
```

### 5.3 易用性特性

```yaml
零侵入集成:
  ✅ 一行代码完成集成
  ✅ 自动拦截权限验证
  ✅ 无需修改现有代码
  ✅ 100%兼容ABP权限系统

多种集成方式:
  ✅ 零侵入式集成（快速）
  ✅ ABP Module集成（完整）
  ✅ HttpClient SDK（灵活）

完整文档:
  ✅ 使用指南
  ✅ API文档
  ✅ 集成示例
  ✅ 最佳实践
```

---

## 🧪 6. 验收测试场景

### 6.1 性能测试

**测试场景1：双层缓存性能测试**
```csharp
// 测试代码
var validator = serviceProvider.GetRequiredService<PermissionValidator>();
var stopwatch = Stopwatch.StartNew();

for (int i = 0; i < 10000; i++)
{
    await validator.IsGrantedAsync("SmartAbp.LowCode.Entities.Create");
}

stopwatch.Stop();
var avgTime = stopwatch.ElapsedMilliseconds / 10000.0;

// 预期: avgTime < 1ms（内存缓存命中）
Console.WriteLine($"平均验证时间: {avgTime}ms");
```

**测试场景2：实时权限同步测试**
```bash
# 1. 启动应用，建立SignalR连接
# 2. 在PermissionManagement微服务中修改用户权限
# 3. 验证本地缓存是否立即清除
# 4. 验证下次权限验证是否使用新权限

# 预期: 权限变更通知延迟<100ms
```

### 6.2 可靠性测试

**测试场景3：网络故障降级测试**
```bash
# 1. 正常运行，权限验证使用远程API
# 2. 关闭PermissionManagement API服务
# 3. 验证权限验证是否使用本地缓存
# 4. 验证应用是否正常运行
# 5. 重启PermissionManagement API服务
# 6. 验证权限是否自动同步

# 预期: 网络故障时应用正常运行，使用本地缓存
```

**测试场景4：SignalR断线重连测试**
```bash
# 1. 正常运行，SignalR连接正常
# 2. 模拟网络中断（10秒）
# 3. 验证SignalR是否自动重连
# 4. 验证重连后权限同步是否正常

# 预期: SignalR自动重连，权限同步恢复
```

---

## 📦 7. NuGet包信息

```xml
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <Version>1.0.0</Version>
    <Authors>SmartABP Team</Authors>
    <Description>SmartAbp PermissionManagement Client SDK - 零侵入式权限管理集成</Description>
    <PackageProjectUrl>https://github.com/smartabp/permissionmanagement</PackageProjectUrl>
    <RepositoryUrl>https://github.com/smartabp/permissionmanagement</RepositoryUrl>
    <PackageLicenseExpression>MIT</PackageLicenseExpression>
    <PackageTags>smartabp;permission;authorization;abp;sdk</PackageTags>
  </PropertyGroup>

  <ItemGroup>
    <!-- 核心依赖 -->
    <PackageReference Include="Microsoft.Extensions.Caching.Memory" Version="8.0.0" />
    <PackageReference Include="Microsoft.Extensions.Caching.StackExchangeRedis" Version="8.0.0" />
    <PackageReference Include="Microsoft.AspNetCore.SignalR.Client" Version="8.0.0" />
    <PackageReference Include="Volo.Abp.Core" Version="8.0.0" />
    <PackageReference Include="Volo.Abp.Authorization" Version="8.0.0" />
  </ItemGroup>
</Project>
```

---

**文档状态**：✅ 无缝集成方案完成
**下一步**：开始实施开发


