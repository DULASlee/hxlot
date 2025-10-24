using System;
using System.Threading.Tasks;
using Volo.Abp.Application.Services;

namespace SmartAbp.Application.Contracts.DatabaseInfo
{
    /// <summary>
    /// 数据库信息应用服务接口
    /// ABP平台底层增强：为上层服务（如代码生成器）提供数据库适配信息
    /// </summary>
    public interface IDatabaseInfoAppService : IApplicationService
    {
        /// <summary>
        /// 获取当前数据库信息
        /// </summary>
        /// <returns>数据库信息</returns>
        Task<DatabaseInfoDto> GetCurrentDatabaseInfoAsync();

        /// <summary>
        /// 获取指定数据库类型的信息
        /// </summary>
        /// <param name="databaseType">数据库类型</param>
        /// <returns>数据库信息</returns>
        Task<DatabaseInfoDto> GetDatabaseInfoAsync(string databaseType);

        /// <summary>
        /// 测试数据库连接
        /// </summary>
        /// <param name="connectionString">连接字符串</param>
        /// <returns>连接测试结果</returns>
        Task<DatabaseInfoDto> TestConnectionAsync(string connectionString);

        /// <summary>
        /// 获取数据库字段类型映射
        /// 例如：C# Guid -> SQL Server uniqueidentifier, PostgreSQL uuid
        /// </summary>
        /// <param name="csharpType">C# 类型名称 (如 "Guid", "string", "int")</param>
        /// <param name="maxLength">字段最大长度 (可选)</param>
        /// <returns>数据库字段类型字符串</returns>
        Task<string> GetDatabaseFieldTypeAsync(string csharpType, int? maxLength = null);
    }
}
