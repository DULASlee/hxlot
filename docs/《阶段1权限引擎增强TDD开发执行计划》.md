# 阶段1权限引擎增强TDD开发执行计划

> **开发方法论**: 测试驱动开发(TDD) - Red → Green → Refactor
> **质量保证**: 先写测试，后写实现，确保每行代码都有测试覆盖
> **目标成果**: 4周内完成权限引擎核心功能，代码覆盖率>95%

---

## 🔄 TDD开发流程概述

### TDD三步循环
1. **Red**: 写一个失败的测试（定义期望行为）
2. **Green**: 写最少代码让测试通过
3. **Refactor**: 重构代码，保持测试通过

### 权限引擎TDD策略
```mermaid
graph LR
    A[定义权限检查接口] --> B[编写失败测试]
    B --> C[实现最小功能]
    C --> D[测试通过]
    D --> E[重构优化]
    E --> F[下一个功能]
    F --> B
```

---

## 📅 Week 1: 权限引擎插件核心架构 (TDD)

### Day 1: 权限引擎插件接口设计

#### 1.1 先写测试用例

**测试文件**: `src/SmartAbp.Vue/packages/lowcode-core/src/__tests__/PermissionEnginePlugin.spec.ts`

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { PermissionEnginePlugin } from '../plugins/PermissionEnginePlugin'
import { LowCodeKernel } from '../kernel/core'
import type { PermissionSchema, PluginContext } from '../types'

describe('PermissionEnginePlugin', () => {
  let plugin: PermissionEnginePlugin
  let mockKernel: LowCodeKernel
  let mockContext: PluginContext

  beforeEach(() => {
    // 设置测试环境
    mockKernel = {
      eventBus: {
        subscribe: vi.fn(),
        publish: vi.fn(),
        unsubscribe: vi.fn()
      },
      cacheManager: {
        get: vi.fn(),
        set: vi.fn(),
        delete: vi.fn(),
        clear: vi.fn()
      },
      performanceMonitor: {
        registerMetric: vi.fn(),
        recordMetric: vi.fn(),
        getMetrics: vi.fn()
      }
    } as any

    mockContext = {
      kernel: mockKernel,
      logger: console,
      config: {}
    }

    plugin = new PermissionEnginePlugin()
  })

  describe('插件元数据', () => {
    it('应该有正确的插件元数据', () => {
      expect(plugin.metadata.name).toBe('PermissionEnginePlugin')
      expect(plugin.metadata.version).toBe('1.0.0')
      expect(plugin.metadata.capabilities).toContain('rbac')
      expect(plugin.metadata.capabilities).toContain('abac')
      expect(plugin.metadata.capabilities).toContain('data-permission')
    })

    it('应该声明正确的依赖', () => {
      expect(plugin.metadata.dependencies).toContain('vue3')
      expect(plugin.metadata.dependencies).toContain('element-plus')
      expect(plugin.metadata.requiredKernelServices).toContain('EventBus')
      expect(plugin.metadata.requiredKernelServices).toContain('CacheManager')
    })
  })

  describe('插件初始化', () => {
    it('应该正确初始化并注册事件监听器', async () => {
      await plugin.onInit(mockKernel)

      expect(mockKernel.eventBus.subscribe).toHaveBeenCalledWith(
        'permission.check',
        expect.any(Function)
      )
      expect(mockKernel.eventBus.subscribe).toHaveBeenCalledWith(
        'permission.grant',
        expect.any(Function)
      )
      expect(mockKernel.eventBus.subscribe).toHaveBeenCalledWith(
        'permission.revoke',
        expect.any(Function)
      )
    })

    it('应该注册性能监控指标', async () => {
      await plugin.onInit(mockKernel)

      expect(mockKernel.performanceMonitor.registerMetric).toHaveBeenCalledWith(
        'permission.check.duration'
      )
      expect(mockKernel.performanceMonitor.registerMetric).toHaveBeenCalledWith(
        'permission.cache.hit_rate'
      )
    })
  })

  describe('Schema处理能力', () => {
    it('应该能够处理权限类型的Schema', async () => {
      const permissionSchema = {
        type: 'permission',
        entities: [],
        permissions: []
      }

      const result = await plugin.canHandle(permissionSchema)
      expect(result).toBe(true)
    })

    it('应该能够处理包含权限管理特性的Schema', async () => {
      const featureSchema = {
        type: 'module',
        features: ['permission-management', 'user-management']
      }

      const result = await plugin.canHandle(featureSchema)
      expect(result).toBe(true)
    })

    it('应该拒绝不相关的Schema', async () => {
      const otherSchema = {
        type: 'ui-component',
        features: ['data-display']
      }

      const result = await plugin.canHandle(otherSchema)
      expect(result).toBe(false)
    })
  })

  describe('权限检查核心功能', () => {
    it('应该能够执行基础权限检查', async () => {
      const permissionEvent = {
        userId: 'user-123',
        permission: 'users.read',
        resource: 'user-list',
        context: {}
      }

      // 模拟权限检查
      const result = await plugin.handlePermissionCheck(permissionEvent)

      expect(result).toBeDefined()
      expect(typeof result).toBe('boolean')
    })

    it('应该记录权限检查性能指标', async () => {
      const permissionEvent = {
        userId: 'user-123',
        permission: 'users.read',
        resource: 'user-list',
        context: {}
      }

      await plugin.handlePermissionCheck(permissionEvent)

      expect(mockKernel.performanceMonitor.recordMetric).toHaveBeenCalledWith(
        'permission.check.duration',
        expect.any(Number)
      )
    })

    it('权限检查应该在50ms内完成', async () => {
      const permissionEvent = {
        userId: 'user-123',
        permission: 'users.read',
        resource: 'user-list',
        context: {}
      }

      const startTime = performance.now()
      await plugin.handlePermissionCheck(permissionEvent)
      const endTime = performance.now()

      expect(endTime - startTime).toBeLessThan(50)
    })
  })

  describe('错误处理', () => {
    it('应该优雅处理权限检查错误', async () => {
      const invalidEvent = {
        userId: null,
        permission: '',
        resource: '',
        context: {}
      }

      await expect(plugin.handlePermissionCheck(invalidEvent))
        .rejects.toThrow('无效的权限检查请求')
    })

    it('应该发布权限检查错误事件', async () => {
      const invalidEvent = {
        userId: null,
        permission: '',
        resource: '',
        context: {}
      }

      try {
        await plugin.handlePermissionCheck(invalidEvent)
      } catch (error) {
        expect(mockKernel.eventBus.publish).toHaveBeenCalledWith(
          'permission.check.error',
          expect.objectContaining({
            event: invalidEvent,
            error: expect.any(Error)
          })
        )
      }
    })
  })
})
```

#### 1.2 实现最小可工作代码

**实现文件**: `src/SmartAbp.Vue/packages/lowcode-core/src/plugins/PermissionEnginePlugin.ts`

```typescript
import type { LowCodePlugin, PluginMetadata, ValidationResult, GeneratedCode, PluginContext } from '../types'
import type { LowCodeKernel } from '../kernel/core'

export interface PermissionCheckEvent {
  userId: string
  permission: string
  resource: string
  context: Record<string, any>
}

export class PermissionEnginePlugin implements LowCodePlugin {
  readonly metadata: PluginMetadata = {
    name: "PermissionEnginePlugin",
    version: "1.0.0",
    description: "企业级权限引擎插件",
    capabilities: ["rbac", "abac", "data-permission", "dynamic-rules"],
    dependencies: ["vue3", "element-plus", "lodash-es"],
    requiredKernelServices: ["EventBus", "CacheManager", "PerformanceMonitor"]
  }

  private kernel: LowCodeKernel | null = null

  async onInit(kernel: LowCodeKernel): Promise<void> {
    this.kernel = kernel

    // 注册权限相关事件监听器
    kernel.eventBus.subscribe("permission.check", this.handlePermissionCheck.bind(this))
    kernel.eventBus.subscribe("permission.grant", this.handlePermissionGrant.bind(this))
    kernel.eventBus.subscribe("permission.revoke", this.handlePermissionRevoke.bind(this))

    // 注册性能监控指标
    kernel.performanceMonitor.registerMetric("permission.check.duration")
    kernel.performanceMonitor.registerMetric("permission.cache.hit_rate")
  }

  async canHandle(schema: any): Promise<boolean> {
    return schema.type === "permission" ||
           (schema.features && schema.features.includes("permission-management"))
  }

  async validate(schema: any): Promise<ValidationResult> {
    // 临时实现，后续完善
    return {
      isValid: true,
      errors: [],
      warnings: []
    }
  }

  async generate(schema: any, config: any, context: PluginContext): Promise<GeneratedCode> {
    // 临时实现，后续完善
    return {
      files: [],
      metadata: {
        generatedAt: new Date(),
        generator: this.metadata.name,
        version: this.metadata.version
      }
    }
  }

  async handlePermissionCheck(event: PermissionCheckEvent): Promise<boolean> {
    if (!event.userId || !event.permission) {
      throw new Error('无效的权限检查请求')
    }

    const startTime = performance.now()

    try {
      // 基础权限检查逻辑（暂时返回true，后续实现具体逻辑）
      const result = true

      // 记录性能指标
      const duration = performance.now() - startTime
      this.kernel?.performanceMonitor.recordMetric("permission.check.duration", duration)

      return result
    } catch (error) {
      // 发布错误事件
      this.kernel?.eventBus.publish("permission.check.error", { event, error })
      throw error
    }
  }

  private async handlePermissionGrant(event: any): Promise<void> {
    // 权限授予处理逻辑
    console.log('Permission granted:', event)
  }

  private async handlePermissionRevoke(event: any): Promise<void> {
    // 权限撤销处理逻辑
    console.log('Permission revoked:', event)
  }

  async onDestroy(): Promise<void> {
    // 清理资源
    this.kernel = null
  }
}
```

### Day 2: RBAC权限模型TDD实现

#### 2.1 RBAC测试用例

**测试文件**: `src/SmartAbp.CodeGenerator/__tests__/RBACPermissionChecker.spec.cs`

```csharp
using Xunit;
using Moq;
using Microsoft.Extensions.Logging;
using SmartAbp.CodeGenerator.Permissions;
using SmartAbp.CodeGenerator.Permissions.RBAC;

namespace SmartAbp.CodeGenerator.Tests.Permissions
{
    public class RBACPermissionCheckerTests
    {
        private readonly Mock<ICurrentUser> _currentUserMock;
        private readonly Mock<IRolePermissionRepository> _repositoryMock;
        private readonly Mock<IPermissionCache> _cacheMock;
        private readonly Mock<IPerformanceMonitor> _performanceMonitorMock;
        private readonly Mock<ILogger<RBACPermissionChecker>> _loggerMock;
        private readonly RBACPermissionChecker _permissionChecker;

        public RBACPermissionCheckerTests()
        {
            _currentUserMock = new Mock<ICurrentUser>();
            _repositoryMock = new Mock<IRolePermissionRepository>();
            _cacheMock = new Mock<IPermissionCache>();
            _performanceMonitorMock = new Mock<IPerformanceMonitor>();
            _loggerMock = new Mock<ILogger<RBACPermissionChecker>>();

            _permissionChecker = new RBACPermissionChecker(
                _currentUserMock.Object,
                _repositoryMock.Object,
                _cacheMock.Object,
                _performanceMonitorMock.Object,
                _loggerMock.Object
            );
        }

        [Fact]
        public async Task IsGrantedAsync_WithDirectPermission_ShouldReturnTrue()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var permissionName = "Users.Create";

            _currentUserMock.Setup(x => x.Id).Returns(userId);
            _repositoryMock.Setup(x => x.CheckDirectPermissionAsync(userId, permissionName, null))
                          .ReturnsAsync(true);

            // Act
            var result = await _permissionChecker.IsGrantedAsync(permissionName);

            // Assert
            Assert.True(result);
            _repositoryMock.Verify(x => x.CheckDirectPermissionAsync(userId, permissionName, null), Times.Once);
        }

        [Fact]
        public async Task IsGrantedAsync_WithRolePermission_ShouldReturnTrue()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var roleId = Guid.NewGuid();
            var permissionName = "Users.Read";

            _currentUserMock.Setup(x => x.Id).Returns(userId);
            _repositoryMock.Setup(x => x.CheckDirectPermissionAsync(userId, permissionName, null))
                          .ReturnsAsync(false);
            _repositoryMock.Setup(x => x.GetUserRolesAsync(userId))
                          .ReturnsAsync(new List<Role> { new Role { Id = roleId, Name = "Manager" } });
            _repositoryMock.Setup(x => x.CheckRolePermissionAsync(roleId, permissionName, null))
                          .ReturnsAsync(true);

            // Act
            var result = await _permissionChecker.IsGrantedAsync(permissionName);

            // Assert
            Assert.True(result);
        }

        [Fact]
        public async Task IsGrantedAsync_WithInheritedPermission_ShouldReturnTrue()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var childRoleId = Guid.NewGuid();
            var parentRoleId = Guid.NewGuid();
            var permissionName = "Users.Delete";

            _currentUserMock.Setup(x => x.Id).Returns(userId);
            _repositoryMock.Setup(x => x.CheckDirectPermissionAsync(userId, permissionName, null))
                          .ReturnsAsync(false);

            var childRole = new Role { Id = childRoleId, Name = "Employee" };
            var parentRole = new Role { Id = parentRoleId, Name = "Manager" };

            _repositoryMock.Setup(x => x.GetUserRolesAsync(userId))
                          .ReturnsAsync(new List<Role> { childRole });
            _repositoryMock.Setup(x => x.CheckRolePermissionAsync(childRoleId, permissionName, null))
                          .ReturnsAsync(false);
            _repositoryMock.Setup(x => x.GetParentRolesAsync(childRoleId))
                          .ReturnsAsync(new List<Role> { parentRole });
            _repositoryMock.Setup(x => x.CheckRolePermissionAsync(parentRoleId, permissionName, null))
                          .ReturnsAsync(true);

            // Act
            var result = await _permissionChecker.IsGrantedAsync(permissionName);

            // Assert
            Assert.True(result);
        }

        [Fact]
        public async Task IsGrantedAsync_PerformanceUnder20ms_ShouldSucceed()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var permissionName = "Users.Read";

            _currentUserMock.Setup(x => x.Id).Returns(userId);
            _repositoryMock.Setup(x => x.CheckDirectPermissionAsync(userId, permissionName, null))
                          .ReturnsAsync(true);

            // Act
            var stopwatch = System.Diagnostics.Stopwatch.StartNew();
            await _permissionChecker.IsGrantedAsync(permissionName);
            stopwatch.Stop();

            // Assert
            Assert.True(stopwatch.ElapsedMilliseconds < 20,
                       $"权限检查耗时 {stopwatch.ElapsedMilliseconds}ms，超过20ms阈值");
        }

        [Fact]
        public async Task IsGrantedAsync_ShouldRecordPerformanceMetrics()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var permissionName = "Users.Read";

            _currentUserMock.Setup(x => x.Id).Returns(userId);
            _repositoryMock.Setup(x => x.CheckDirectPermissionAsync(userId, permissionName, null))
                          .ReturnsAsync(true);

            // Act
            await _permissionChecker.IsGrantedAsync(permissionName);

            // Assert
            _performanceMonitorMock.Verify(x => x.StartActivity("RBAC.Permission.Check"), Times.Once);
        }

        [Theory]
        [InlineData("")]
        [InlineData(null)]
        [InlineData("   ")]
        public async Task IsGrantedAsync_WithInvalidPermissionName_ShouldThrow(string invalidPermissionName)
        {
            // Act & Assert
            await Assert.ThrowsAsync<ArgumentException>(() =>
                _permissionChecker.IsGrantedAsync(invalidPermissionName));
        }
    }
}
```

#### 2.2 RBAC权限检查器实现

**实现文件**: `src/SmartAbp.CodeGenerator/Permissions/RBAC/RBACPermissionChecker.cs`

```csharp
using Microsoft.Extensions.Logging;
using System.Diagnostics;
using Volo.Abp.DependencyInjection;

namespace SmartAbp.CodeGenerator.Permissions.RBAC
{
    public class RBACPermissionChecker : IPermissionChecker, ITransientDependency
    {
        private readonly ICurrentUser _currentUser;
        private readonly IRolePermissionRepository _rolePermissionRepository;
        private readonly IPermissionCache _permissionCache;
        private readonly IPerformanceMonitor _performanceMonitor;
        private readonly ILogger<RBACPermissionChecker> _logger;

        public RBACPermissionChecker(
            ICurrentUser currentUser,
            IRolePermissionRepository rolePermissionRepository,
            IPermissionCache permissionCache,
            IPerformanceMonitor performanceMonitor,
            ILogger<RBACPermissionChecker> logger)
        {
            _currentUser = currentUser;
            _rolePermissionRepository = rolePermissionRepository;
            _permissionCache = permissionCache;
            _performanceMonitor = performanceMonitor;
            _logger = logger;
        }

        public async Task<bool> IsGrantedAsync(string permissionName, string resource = null)
        {
            if (string.IsNullOrWhiteSpace(permissionName))
            {
                throw new ArgumentException("权限名称不能为空", nameof(permissionName));
            }

            using var activity = _performanceMonitor.StartActivity("RBAC.Permission.Check");

            try
            {
                // 1. 检查用户直接权限
                if (await CheckDirectPermissionAsync(permissionName, resource))
                {
                    _logger.LogDebug("用户 {UserId} 拥有直接权限 {Permission}", _currentUser.Id, permissionName);
                    return true;
                }

                // 2. 检查角色权限
                var userRoles = await GetUserRolesAsync(_currentUser.Id.Value);
                foreach (var role in userRoles)
                {
                    if (await CheckRolePermissionAsync(role.Id, permissionName, resource))
                    {
                        _logger.LogDebug("用户 {UserId} 通过角色 {RoleId} 拥有权限 {Permission}",
                                       _currentUser.Id, role.Id, permissionName);
                        return true;
                    }
                }

                // 3. 检查角色继承权限
                var inheritedRoles = await GetInheritedRolesAsync(userRoles);
                foreach (var role in inheritedRoles)
                {
                    if (await CheckRolePermissionAsync(role.Id, permissionName, resource))
                    {
                        _logger.LogDebug("用户 {UserId} 通过继承角色 {RoleId} 拥有权限 {Permission}",
                                       _currentUser.Id, role.Id, permissionName);

                        // 记录继承权限使用
                        await RecordInheritedPermissionUsageAsync(role.Id, permissionName);
                        return true;
                    }
                }

                _logger.LogDebug("用户 {UserId} 不拥有权限 {Permission}", _currentUser.Id, permissionName);
                return false;
            }
            finally
            {
                activity?.SetTag("permission.name", permissionName);
                activity?.SetTag("resource", resource);
                activity?.SetTag("user.id", _currentUser.Id?.ToString());
            }
        }

        private async Task<bool> CheckDirectPermissionAsync(string permissionName, string resource)
        {
            if (!_currentUser.Id.HasValue)
                return false;

            return await _rolePermissionRepository.CheckDirectPermissionAsync(
                _currentUser.Id.Value, permissionName, resource);
        }

        private async Task<List<Role>> GetUserRolesAsync(Guid userId)
        {
            var cacheKey = $"user_roles:{userId}";

            return await _permissionCache.GetOrCreateAsync(cacheKey, async () =>
            {
                return await _rolePermissionRepository.GetUserRolesAsync(userId);
            }, TimeSpan.FromMinutes(15));
        }

        private async Task<bool> CheckRolePermissionAsync(Guid roleId, string permissionName, string resource)
        {
            return await _rolePermissionRepository.CheckRolePermissionAsync(roleId, permissionName, resource);
        }

        private async Task<List<Role>> GetInheritedRolesAsync(List<Role> directRoles)
        {
            var cacheKey = $"inherited_roles:{string.Join(",", directRoles.Select(r => r.Id))}";

            return await _permissionCache.GetOrCreateAsync(cacheKey, async () =>
            {
                var inheritedRoles = new HashSet<Role>();
                var queue = new Queue<Role>(directRoles);
                var visited = new HashSet<Guid>();

                while (queue.Count > 0)
                {
                    var role = queue.Dequeue();
                    if (visited.Contains(role.Id)) continue;

                    visited.Add(role.Id);
                    inheritedRoles.Add(role);

                    // 获取父角色
                    var parentRoles = await _rolePermissionRepository.GetParentRolesAsync(role.Id);
                    foreach (var parentRole in parentRoles)
                    {
                        if (!visited.Contains(parentRole.Id))
                            queue.Enqueue(parentRole);
                    }
                }

                return inheritedRoles.ToList();
            }, TimeSpan.FromMinutes(30));
        }

        private async Task RecordInheritedPermissionUsageAsync(Guid roleId, string permissionName)
        {
            // 记录继承权限的使用情况，用于审计和分析
            _logger.LogInformation("继承权限使用: 角色 {RoleId}, 权限 {Permission}, 用户 {UserId}",
                                 roleId, permissionName, _currentUser.Id);
        }
    }
}
```

### Day 3: ABAC权限模型TDD实现

#### 3.1 ABAC测试用例

**测试文件**: `src/SmartAbp.CodeGenerator/__tests__/ABACRuleEngine.spec.cs`

```csharp
public class ABACRuleEngineTests
{
    private readonly Mock<IRuleRepository> _ruleRepositoryMock;
    private readonly Mock<IAttributeProvider> _attributeProviderMock;
    private readonly Mock<IRuleCompiler> _ruleCompilerMock;
    private readonly ABACRuleEngine _ruleEngine;

    public ABACRuleEngineTests()
    {
        _ruleRepositoryMock = new Mock<IRuleRepository>();
        _attributeProviderMock = new Mock<IAttributeProvider>();
        _ruleCompilerMock = new Mock<IRuleCompiler>();

        _ruleEngine = new ABACRuleEngine(
            _ruleRepositoryMock.Object,
            _attributeProviderMock.Object,
            _ruleCompilerMock.Object
        );
    }

    [Fact]
    public async Task EvaluateAsync_WithTimeBasedRule_ShouldReturnCorrectResult()
    {
        // Arrange
        var request = new ABACRequest
        {
            UserId = Guid.NewGuid(),
            Action = "read",
            Resource = "user-data",
            Context = new Dictionary<string, object>
            {
                ["currentTime"] = new DateTime(2024, 1, 1, 14, 0, 0) // 工作时间
            }
        };

        var timeRule = new ABACRule
        {
            Id = Guid.NewGuid(),
            Name = "工作时间访问控制",
            Expression = "context.Environment.CurrentTime.Hour >= 9 && context.Environment.CurrentTime.Hour <= 18",
            Priority = 100,
            Effect = ABACEffect.Allow
        };

        _ruleRepositoryMock.Setup(x => x.GetApplicableRulesAsync(request))
                          .ReturnsAsync(new[] { timeRule });

        var mockCompiledRule = new Mock<ICompiledRule>();
        mockCompiledRule.Setup(x => x.EvaluateAsync(It.IsAny<ABACEvaluationContext>()))
                       .ReturnsAsync(true);

        _ruleCompilerMock.Setup(x => x.CompileAsync(timeRule.Expression))
                        .ReturnsAsync(mockCompiledRule.Object);

        // Act
        var result = await _ruleEngine.EvaluateAsync(request);

        // Assert
        Assert.True(result);
    }

    [Fact]
    public async Task EvaluateAsync_WithLocationBasedRule_ShouldReturnCorrectResult()
    {
        // Arrange
        var request = new ABACRequest
        {
            UserId = Guid.NewGuid(),
            Action = "access",
            Resource = "sensitive-data",
            Context = new Dictionary<string, object>
            {
                ["clientIP"] = "192.168.1.100" // 内网IP
            }
        };

        var locationRule = new ABACRule
        {
            Expression = "context.Environment.ClientIP.IsInRange('192.168.1.0/24')",
            Priority = 200,
            Effect = ABACEffect.Allow
        };

        _ruleRepositoryMock.Setup(x => x.GetApplicableRulesAsync(request))
                          .ReturnsAsync(new[] { locationRule });

        var mockCompiledRule = new Mock<ICompiledRule>();
        mockCompiledRule.Setup(x => x.EvaluateAsync(It.IsAny<ABACEvaluationContext>()))
                       .ReturnsAsync(true);

        _ruleCompilerMock.Setup(x => x.CompileAsync(locationRule.Expression))
                        .ReturnsAsync(mockCompiledRule.Object);

        // Act
        var result = await _ruleEngine.EvaluateAsync(request);

        // Assert
        Assert.True(result);
    }

    [Fact]
    public async Task EvaluateAsync_PerformanceUnder5ms_ShouldSucceed()
    {
        // Arrange
        var request = new ABACRequest
        {
            UserId = Guid.NewGuid(),
            Action = "read",
            Resource = "data"
        };

        var rule = new ABACRule
        {
            Expression = "true",
            Priority = 100,
            Effect = ABACEffect.Allow
        };

        _ruleRepositoryMock.Setup(x => x.GetApplicableRulesAsync(request))
                          .ReturnsAsync(new[] { rule });

        var mockCompiledRule = new Mock<ICompiledRule>();
        mockCompiledRule.Setup(x => x.EvaluateAsync(It.IsAny<ABACEvaluationContext>()))
                       .ReturnsAsync(true);

        _ruleCompilerMock.Setup(x => x.CompileAsync(rule.Expression))
                        .ReturnsAsync(mockCompiledRule.Object);

        // Act
        var stopwatch = Stopwatch.StartNew();
        await _ruleEngine.EvaluateAsync(request);
        stopwatch.Stop();

        // Assert
        Assert.True(stopwatch.ElapsedMilliseconds < 5,
                   $"ABAC规则评估耗时 {stopwatch.ElapsedMilliseconds}ms，超过5ms阈值");
    }
}
```

### Day 4-5: 数据权限拦截器TDD实现

继续使用相同的TDD模式实现数据权限拦截器，确保每个功能都有完整的测试覆盖。

---

## 📊 TDD开发质量指标

### 每日质量检查清单
- [ ] 所有新测试通过
- [ ] 代码覆盖率>95%
- [ ] 性能测试达标
- [ ] 重构没有破坏现有功能
- [ ] CI/CD管道绿色

### TDD成功指标
- **测试先行**: 100%功能先写测试
- **快速反馈**: 测试执行<10秒
- **高覆盖率**: 代码覆盖率>95%
- **性能保证**: 所有性能测试通过
- **重构安全**: 重构不破坏功能

---

## 🛠️ TDD工具链配置

### 前端测试环境
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:watch": "vitest --watch"
  },
  "devDependencies": {
    "vitest": "^2.1.8",
    "@vitest/ui": "^2.1.8",
    "c8": "^10.1.2"
  }
}
```

### 后端测试环境
```xml
<PackageReference Include="xunit" Version="2.4.2" />
<PackageReference Include="xunit.runner.visualstudio" Version="2.4.5" />
<PackageReference Include="Moq" Version="4.20.69" />
<PackageReference Include="FluentAssertions" Version="6.12.0" />
<PackageReference Include="Microsoft.NET.Test.Sdk" Version="17.8.0" />
```

### TDD开发命令
```bash
# 前端TDD循环
npm run test:watch  # 持续监听测试

# 后端TDD循环
dotnet watch test   # 持续监听测试

# 覆盖率检查
npm run test:coverage
dotnet test --collect:"XPlat Code Coverage"
```

---

## 🎯 TDD成功要素

1. **小步前进**: 每次只实现一个小功能
2. **快速反馈**: 测试要快速执行
3. **重构勇气**: 有测试保护，放心重构
4. **设计驱动**: 通过测试驱动更好的设计
5. **质量内建**: 质量在开发过程中构建，而非测试后修复

通过TDD模式，我们可以确保阶段1的权限引擎增强不仅功能完备，而且质量过硬，为后续阶段奠定坚实基础！
