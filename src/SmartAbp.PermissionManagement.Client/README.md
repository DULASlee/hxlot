# SmartAbp.PermissionManagement.Client SDK

Client SDK for SmartAbp Permission Management Microservice，providing seamless integration for distributed permission verification.

## 🚀 快速开始

### 1. 安装NuGet包

```bash
dotnet add package SmartAbp.PermissionManagement.Client
```

### 2. 配置服务

在`Program.cs`或`Startup.cs`中注册客户端：

```csharp
using SmartAbp.PermissionManagement.Client.Extensions;

// 添加Permission Management Client
services.AddPermissionManagementClient(options =>
{
    options.BaseUrl = "http://localhost:5001"; // Permission Management微服务地址
    options.TimeoutSeconds = 30;
    options.EnableRetry = true; // 启用重试策略
    options.RetryCount = 3;
    options.EnableCircuitBreaker = true; // 启用断路器
    options.AuthenticationToken = "your-service-token"; // 可选：服务间认证Token
});
```

### 3. 使用客户端

```csharp
using SmartAbp.PermissionManagement.Client.Services;
using SmartAbp.PermissionManagement.Client.Models;

public class YourService
{
    private readonly IPermissionManagementClient _permissionClient;

    public YourService(IPermissionManagementClient permissionClient)
    {
        _permissionClient = permissionClient;
    }

    // 获取用户权限
    public async Task<List<PermissionDto>> GetUserPermissionsAsync(Guid userId)
    {
        return await _permissionClient.GetUserPermissionsAsync(userId);
    }

    // 验证用户权限
    public async Task<bool> CheckUserPermissionAsync(Guid userId, string permissionName)
    {
        return await _permissionClient.CheckPermissionAsync(userId, permissionName);
    }

    // 批量验证用户权限
    public async Task<Dictionary<string, bool>> CheckUserPermissionsAsync(Guid userId, List<string> permissions)
    {
        return await _permissionClient.CheckPermissionsAsync(userId, permissions);
    }

    // 更新用户权限
    public async Task UpdateUserPermissionsAsync(Guid userId, Dictionary<string, bool> permissions)
    {
        var updateDto = new UpdatePermissionsDto
        {
            Permissions = permissions
        };

        await _permissionClient.UpdateUserPermissionsAsync(userId, updateDto);
    }
}
```

## 📚 API文档

### 角色权限管理

```csharp
// 获取角色权限
var permissions = await _permissionClient.GetRolePermissionsAsync("Admin");

// 更新角色权限
await _permissionClient.UpdateRolePermissionsAsync("Admin", new UpdatePermissionsDto
{
    Permissions = new Dictionary<string, bool>
    {
        { "Users.View", true },
        { "Users.Create", true },
        { "Users.Delete", false }
    }
});
```

### 用户权限管理

```csharp
// 获取用户权限
var permissions = await _permissionClient.GetUserPermissionsAsync(userId);

// 更新用户权限
await _permissionClient.UpdateUserPermissionsAsync(userId, new UpdatePermissionsDto
{
    Permissions = new Dictionary<string, bool>
    {
        { "Users.View", true },
        { "Users.Create", false }
    }
});

// 验证单个权限
bool hasPermission = await _permissionClient.CheckPermissionAsync(userId, "Users.View");

// 批量验证权限
var result = await _permissionClient.CheckPermissionsAsync(userId, new List<string>
{
    "Users.View",
    "Users.Create",
    "Users.Delete"
});
```

### 组织单元权限管理

```csharp
// 获取组织单元权限
var permissions = await _permissionClient.GetOrganizationUnitPermissionsAsync(ouId);

// 更新组织单元权限
await _permissionClient.UpdateOrganizationUnitPermissionsAsync(ouId, new UpdatePermissionsDto
{
    Permissions = new Dictionary<string, bool>
    {
        { "Users.View", true },
        { "Users.Create", true }
    }
});
```

## ⚙️ 配置选项

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `BaseUrl` | string | `http://localhost:5001` | Permission Management微服务地址 |
| `ApiVersion` | string | `v1` | API版本 |
| `TimeoutSeconds` | int | `30` | HTTP请求超时时间（秒） |
| `EnableRetry` | bool | `true` | 是否启用重试策略 |
| `RetryCount` | int | `3` | 重试次数 |
| `EnableCircuitBreaker` | bool | `true` | 是否启用断路器 |
| `AuthenticationToken` | string | `null` | 服务间认证Token（可选） |

## 🔒 弹性策略

SDK内置了以下弹性策略：

1. **重试策略**：
   - 指数退避重试（2^retryAttempt秒）
   - 默认重试3次
   - 处理瞬时HTTP错误

2. **断路器策略**：
   - 5次失败后断开电路
   - 断开时间30秒
   - 自动恢复机制

## 📦 依赖项

- .NET 9.0+
- Microsoft.Extensions.Http 9.0.0+
- Microsoft.Extensions.Http.Polly 9.0.0+

## 📄 许可证

MIT License

## 🤝 贡献

欢迎贡献代码！请参阅[贡献指南](../../CONTRIBUTING.md)。

## 📧 联系方式

- GitHub: [SmartAbp](https://github.com/DULASlee/hxlot)
- Email: support@smartabp.com

