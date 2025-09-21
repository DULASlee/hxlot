using System.Collections.Generic;
using System.Threading.Tasks;
using SmartAbp.Permissions.Models;

namespace SmartAbp.Permissions.Cache
{
    /// <summary>
    /// 权限缓存服务接口
    /// </summary>
    public interface IPermissionCacheService
    {
        /// <summary>
        /// 获取用户权限集合
        /// </summary>
        /// <param name="userId">用户ID</param>
        /// <param name="tenantId">租户ID</param>
        /// <returns>用户权限集合</returns>
        Task<UserPermissionSet> GetUserPermissionsAsync(string userId, string tenantId);

        /// <summary>
        /// 设置用户权限集合
        /// </summary>
        /// <param name="userId">用户ID</param>
        /// <param name="tenantId">租户ID</param>
        /// <param name="permissions">权限集合</param>
        /// <returns>是否设置成功</returns>
        Task<bool> SetUserPermissionsAsync(string userId, string tenantId, UserPermissionSet permissions);

        /// <summary>
        /// 移除用户权限缓存
        /// </summary>
        /// <param name="userId">用户ID</param>
        /// <param name="tenantId">租户ID</param>
        /// <returns>是否移除成功</returns>
        Task<bool> RemoveUserPermissionsAsync(string userId, string tenantId);

        /// <summary>
        /// 刷新用户权限缓存
        /// </summary>
        /// <param name="userId">用户ID</param>
        /// <param name="tenantId">租户ID</param>
        /// <returns>是否刷新成功</returns>
        Task<bool> RefreshUserPermissionsAsync(string userId, string tenantId);
    }

    /// <summary>
    /// 权限缓存预热服务接口
    /// </summary>
    public interface IPermissionCachePrewarmService
    {
        /// <summary>
        /// 预热活跃用户的权限缓存
        /// </summary>
        /// <param name="activeUsers">活跃用户列表</param>
        /// <returns>任务</returns>
        Task PrewarmActiveUserPermissionsAsync(List<UserActivity> activeUsers);

        /// <summary>
        /// 获取预热统计信息
        /// </summary>
        /// <returns>预热统计信息</returns>
        Task<PermissionPrewarmStatistics> GetPrewarmStatisticsAsync();
    }


}