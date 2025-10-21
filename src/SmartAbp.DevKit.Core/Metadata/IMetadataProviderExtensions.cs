using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using SmartAbp.DevKit.Abstractions.Metadata;
using SmartAbp.DevKit.Abstractions.Models;

namespace SmartAbp.DevKit.Core.Metadata
{
    /// <summary>
    /// IMetadataProvider扩展方法，用于向后兼容
    /// </summary>
    public static class IMetadataProviderExtensions
    {
        /// <summary>
        /// 获取实体元数据（向后兼容方法）
        /// </summary>
        public static async Task<EntityMetadata?> GetEntityAsync(this IMetadataProvider provider, Guid entityId)
        {
            return await provider.GetEntityMetadataAsync(entityId);
        }

        /// <summary>
        /// 获取所有实体（向后兼容方法）
        /// </summary>
        public static async Task<List<EntityMetadata>> GetAllEntitiesAsync(this IMetadataProvider provider)
        {
            // 注意：这里我们返回空列表，实际实现需要业务层提供默认模块ID
            return new List<EntityMetadata>();
        }

        /// <summary>
        /// 获取所有模块（向后兼容方法）
        /// </summary>
        public static async Task<List<ModuleMetadata>> GetAllModulesAsync(this IMetadataProvider provider)
        {
            // 注意：这里我们返回空列表，实际实现需要业务层提供具体实现
            return new List<ModuleMetadata>();
        }
    }
}
