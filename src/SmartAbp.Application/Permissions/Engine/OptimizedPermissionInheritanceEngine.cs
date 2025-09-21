using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Caching.Memory;
using SmartAbp.Application.Permissions.Engine;
using SmartAbp.Permissions.Models;

namespace SmartAbp.Permissions.Engine
{
    public interface IPermissionInheritanceEngine
    {
        Task<List<EffectivePermission>> CalculateEffectivePermissionsAsync(Guid userId, List<Role> userRoles);
        Task<bool> HasPermissionAsync(Guid userId, string permissionName, string resource);
        Task<List<EffectivePermission>> GetUserPermissionsAsync(Guid userId);
    }

    public class OptimizedPermissionInheritanceEngine : IPermissionInheritanceEngine
    {
        private readonly IPermissionCache _permissionCache;

        public OptimizedPermissionInheritanceEngine(IPermissionCache permissionCache)
        {
            _permissionCache = permissionCache ?? throw new ArgumentNullException(nameof(permissionCache));
        }

        public OptimizedPermissionInheritanceEngine(IMemoryCache cache) : this(new PermissionCacheWrapper(cache))
        {
        }

        public async Task<List<EffectivePermission>> CalculateEffectivePermissionsAsync(Guid userId, List<Role> userRoles)
        {
            if (userId == Guid.Empty)
                throw new ArgumentException("User ID cannot be empty", nameof(userId));

            if (userRoles == null)
                throw new ArgumentNullException(nameof(userRoles));

            var cacheKey = $"permissions:{userId}";
            
            return await _permissionCache.GetOrCreateAsync(cacheKey, async () =>
            {
                return await ComputeEffectivePermissionsAsync(userId, userRoles);
            });
        }

        private async Task<List<EffectivePermission>> ComputeEffectivePermissionsAsync(Guid userId, List<Role> userRoles)
        {
            var stopwatch = System.Diagnostics.Stopwatch.StartNew();
            
            try
            {
                // 权限优先级映射 (数字越小优先级越高)
                var permissionPriority = new Dictionary<string, int>
                {
                    { "Direct", 1 },      // 直接权限 (最高优先级)
                    { "Role", 2 },        // 角色权限
                    { "Inheritance", 3 }, // 继承权限
                    { "Organization", 4 }  // 组织权限 (最低优先级)
                };

                // 权限合并字典: (PermissionName, Resource) -> EffectivePermission
                var permissionMap = new Dictionary<(string, string), EffectivePermission>();

                // 处理每个角色的权限
                foreach (var role in userRoles.Where(r => r != null && r.Permissions != null))
                {
                    foreach (var permission in role.Permissions.Where(p => p != null))
                    {
                        var key = (permission.Name, permission.Resource);
                        var source = DeterminePermissionSource(role.Name);
                        
                        if (!permissionMap.ContainsKey(key))
                        {
                            // 新权限直接添加
                            permissionMap[key] = new EffectivePermission
                            {
                                Name = permission.Name,
                                Resource = permission.Resource,
                                IsGranted = permission.IsGranted,
                                Source = source,
                                RoleId = role.Id,
                                Priority = GetSourcePriority(source, permissionPriority)
                            };
                        }
                        else
                        {
                            // 已存在权限，根据优先级决定是否覆盖
                            var existingPermission = permissionMap[key];
                            var newPriority = GetSourcePriority(source, permissionPriority);
                            
                            if (newPriority < existingPermission.Priority)
                            {
                                // 新权限优先级更高，覆盖现有权限
                                existingPermission.IsGranted = permission.IsGranted;
                                existingPermission.Source = source;
                                existingPermission.RoleId = role.Id;
                                existingPermission.Priority = newPriority;
                            }
                            else if (newPriority == existingPermission.Priority)
                            {
                                // 相同优先级，采用最宽松策略 (OR逻辑)
                                existingPermission.IsGranted = existingPermission.IsGranted || permission.IsGranted;
                            }
                            // 新权限优先级较低，忽略
                        }
                    }
                }

                // 转换为列表并排序
                var effectivePermissions = permissionMap.Values
                    .OrderBy(p => p.Name)
                    .ThenBy(p => p.Resource)
                    .ToList();

                stopwatch.Stop();
                
                // 性能监控: 记录计算时间
                if (stopwatch.ElapsedMilliseconds > 5) // 超过5ms记录警告
                {
                    // 这里可以集成日志系统
                    Console.WriteLine($"WARNING: Permission calculation took {stopwatch.ElapsedMilliseconds}ms for user {userId}");
                }

                return effectivePermissions;
            }
            catch (Exception ex)
            {
                stopwatch.Stop();
                // 这里可以集成日志系统
                Console.WriteLine($"ERROR: Failed to calculate permissions for user {userId}: {ex.Message}");
                throw;
            }
        }

        public async Task<bool> HasPermissionAsync(Guid userId, string permissionName, string resource)
        {
            if (userId == Guid.Empty)
                throw new ArgumentException("User ID cannot be empty", nameof(userId));

            if (string.IsNullOrWhiteSpace(permissionName))
                throw new ArgumentException("Permission name cannot be null or empty", nameof(permissionName));

            if (string.IsNullOrWhiteSpace(resource))
                throw new ArgumentException("Resource cannot be null or empty", nameof(resource));

            // 这里应该从缓存或存储获取用户角色
            // 为简化实现，假设我们有方法获取用户角色
            var userRoles = await GetUserRolesAsync(userId);
            var permissions = await CalculateEffectivePermissionsAsync(userId, userRoles);

            return permissions.Any(p => 
                p.Name.Equals(permissionName, StringComparison.OrdinalIgnoreCase) &&
                p.Resource.Equals(resource, StringComparison.OrdinalIgnoreCase) &&
                p.IsGranted);
        }

        public async Task<List<EffectivePermission>> GetUserPermissionsAsync(Guid userId)
        {
            if (userId == Guid.Empty)
                throw new ArgumentException("User ID cannot be empty", nameof(userId));

            var userRoles = await GetUserRolesAsync(userId);
            return await CalculateEffectivePermissionsAsync(userId, userRoles);
        }

        private PermissionSource DeterminePermissionSource(string roleName)
        {
            if (string.IsNullOrWhiteSpace(roleName))
                return PermissionSource.Role;

            // 根据角色名称确定权限来源
            if (roleName.Contains("Direct", StringComparison.OrdinalIgnoreCase))
                return PermissionSource.Direct;
            if (roleName.Contains("Inheritance", StringComparison.OrdinalIgnoreCase))
                return PermissionSource.Inheritance;
            if (roleName.Contains("Organization", StringComparison.OrdinalIgnoreCase))
                return PermissionSource.Organization;

            return PermissionSource.Role;
        }

        private int GetSourcePriority(PermissionSource source, Dictionary<string, int> priorityMap)
        {
            return priorityMap.TryGetValue(source.ToString(), out var priority) ? priority : 999;
        }

        private async Task<List<Role>> GetUserRolesAsync(Guid userId)
        {
            // 这里应该实现从数据库或缓存获取用户角色的逻辑
            // 为简化测试，返回空列表
            return new List<Role>();
        }
    }

    public enum PermissionSource
    {
        Direct = 1,      // 直接权限
        Role = 2,        // 角色权限
        Inheritance = 3, // 继承权限
        Organization = 4 // 组织权限
    }

    public class EffectivePermission
    {
        public string Name { get; set; }
        public string Resource { get; set; }
        public bool IsGranted { get; set; }
        public PermissionSource Source { get; set; }
        public Guid? RoleId { get; set; }
        public int Priority { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}