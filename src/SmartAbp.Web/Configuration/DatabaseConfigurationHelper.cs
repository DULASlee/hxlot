using System;
using System.Runtime.InteropServices;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace SmartAbp.Web.Configuration
{
    /// <summary>
    /// 数据库配置助手 - 自动检测操作系统并选择合适的数据库连接
    /// </summary>
    public static class DatabaseConfigurationHelper
    {
        /// <summary>
        /// 获取数据库连接字符串（自动检测操作系统）
        /// </summary>
        public static string GetConnectionString(IConfiguration configuration, ILogger? logger = null)
        {
            var databaseType = configuration["Database:Type"];
            
            // 如果是Auto模式，根据操作系统自动选择
            if (string.Equals(databaseType, "Auto", StringComparison.OrdinalIgnoreCase))
            {
                databaseType = GetDatabaseTypeByOS();
                logger?.LogInformation("🔍 自动检测模式: 操作系统={OS}, 选择数据库={DbType}", 
                    GetOSName(), databaseType);
            }
            
            // 获取对应的连接字符串
            var connectionString = GetConnectionStringByType(configuration, databaseType);
            
            logger?.LogInformation("📊 数据库配置: Type={DbType}, OS={OS}", 
                databaseType, GetOSName());
            
            return connectionString;
        }
        
        /// <summary>
        /// 根据操作系统返回推荐的数据库类型
        /// </summary>
        private static string GetDatabaseTypeByOS()
        {
            if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
            {
                // Windows: 优先使用LocalDb (开发环境) 或 SqlServer (生产环境)
                return "LocalDb";
            }
            else if (RuntimeInformation.IsOSPlatform(OSPlatform.OSX))
            {
                // macOS: 使用PostgreSQL（Mac不支持SQL Server LocalDB）
                return "PostgreSQL";
            }
            else if (RuntimeInformation.IsOSPlatform(OSPlatform.Linux))
            {
                // Linux: 使用PostgreSQL或SQLite
                return "PostgreSQL";
            }
            
            // 默认使用SQLite（跨平台，无需安装服务器）
            return "Sqlite";
        }
        
        /// <summary>
        /// 根据数据库类型获取连接字符串
        /// </summary>
        private static string GetConnectionStringByType(IConfiguration configuration, string? databaseType)
        {
            if (string.IsNullOrWhiteSpace(databaseType))
            {
                return configuration.GetConnectionString("Default") 
                    ?? throw new InvalidOperationException("未配置数据库连接字符串");
            }
            
            // 优先从具名连接字符串获取
            var connectionString = configuration.GetConnectionString(databaseType);
            
            // 如果没有找到具名连接字符串，使用Default
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                connectionString = configuration.GetConnectionString("Default");
            }
            
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                throw new InvalidOperationException(
                    $"未找到数据库连接字符串: Type={databaseType}");
            }
            
            return connectionString;
        }
        
        /// <summary>
        /// 获取当前操作系统名称
        /// </summary>
        public static string GetOSName()
        {
            if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
                return "Windows";
            if (RuntimeInformation.IsOSPlatform(OSPlatform.OSX))
                return "macOS";
            if (RuntimeInformation.IsOSPlatform(OSPlatform.Linux))
                return "Linux";
            
            return "Unknown";
        }
        
        /// <summary>
        /// 获取数据库类型（考虑自动检测）
        /// </summary>
        public static string GetDatabaseType(IConfiguration configuration)
        {
            var databaseType = configuration["Database:Type"];
            
            if (string.Equals(databaseType, "Auto", StringComparison.OrdinalIgnoreCase))
            {
                return GetDatabaseTypeByOS();
            }
            
            return databaseType ?? "Sqlite";
        }
        
        /// <summary>
        /// 验证数据库配置是否完整
        /// </summary>
        public static bool ValidateDatabaseConfiguration(
            IConfiguration configuration, 
            out string errorMessage)
        {
            errorMessage = string.Empty;
            
            try
            {
                var connectionString = GetConnectionString(configuration);
                
                if (string.IsNullOrWhiteSpace(connectionString))
                {
                    errorMessage = "数据库连接字符串为空";
                    return false;
                }
                
                return true;
            }
            catch (Exception ex)
            {
                errorMessage = ex.Message;
                return false;
            }
        }
        
        /// <summary>
        /// 打印数据库配置信息（用于调试）
        /// </summary>
        public static void PrintDatabaseConfiguration(
            IConfiguration configuration, 
            ILogger logger)
        {
            logger.LogInformation("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            logger.LogInformation("📊 数据库配置信息");
            logger.LogInformation("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            logger.LogInformation("🖥️  操作系统: {OS}", GetOSName());
            logger.LogInformation("🗄️  数据库类型: {DbType}", GetDatabaseType(configuration));
            logger.LogInformation("🔗 连接字符串: {ConnectionString}", 
                MaskConnectionString(GetConnectionString(configuration)));
            logger.LogInformation("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        }
        
        /// <summary>
        /// 隐藏连接字符串中的敏感信息
        /// </summary>
        private static string MaskConnectionString(string connectionString)
        {
            if (string.IsNullOrWhiteSpace(connectionString))
                return string.Empty;
            
            // 隐藏密码
            var masked = System.Text.RegularExpressions.Regex.Replace(
                connectionString,
                @"(Password|Pwd)=([^;]+)",
                "$1=***",
                System.Text.RegularExpressions.RegexOptions.IgnoreCase
            );
            
            return masked;
        }
    }
}

