using System;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SmartAbp.Application.Contracts.DatabaseInfo;
using SmartAbp.Database.Abstraction.Adapters;
using Volo.Abp.Application.Services;
using Volo.Abp.DependencyInjection;

namespace SmartAbp.Application.DatabaseInfo
{
    /// <summary>
    /// 数据库信息应用服务实现
    /// ABP平台底层增强：通过标准ABP服务层暴露数据库适配功能
    /// </summary>
    public class DatabaseInfoAppService : ApplicationService, IDatabaseInfoAppService, ITransientDependency
    {
        private readonly IDatabaseAdapterFactory _databaseAdapterFactory;
        private readonly ILogger<DatabaseInfoAppService> _logger;

        public DatabaseInfoAppService(
            IDatabaseAdapterFactory databaseAdapterFactory,
            ILogger<DatabaseInfoAppService> logger)
        {
            _databaseAdapterFactory = databaseAdapterFactory;
            _logger = logger;
        }

        public async Task<DatabaseInfoDto> GetCurrentDatabaseInfoAsync()
        {
            try
            {
                var adapter = _databaseAdapterFactory.GetCurrentAdapter();
                return await BuildDatabaseInfoDto(adapter);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "获取当前数据库信息失败");
                throw;
            }
        }

        public async Task<DatabaseInfoDto> GetDatabaseInfoAsync(string databaseType)
        {
            try
            {
                if (!Enum.TryParse<Database.Abstraction.DatabaseType>(databaseType, true, out var dbType))
                {
                    throw new ArgumentException($"不支持的数据库类型: {databaseType}");
                }

                var adapter = _databaseAdapterFactory.GetAdapter(dbType);
                return await BuildDatabaseInfoDto(adapter);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "获取数据库信息失败: {DatabaseType}", databaseType);
                throw;
            }
        }

        public async Task<DatabaseInfoDto> TestConnectionAsync(string connectionString)
        {
            try
            {
                var adapter = _databaseAdapterFactory.GetCurrentAdapter();
                
                var result = new DatabaseInfoDto
                {
                    DatabaseType = adapter.DatabaseType.ToString(),
                    DatabaseName = adapter.DatabaseName,
                    MaskedConnectionString = MaskConnectionString(connectionString)
                };

                // 测试连接
                var isValid = await adapter.TestConnectionAsync(connectionString);
                result.IsConnectionValid = isValid;
                result.ConnectionTestMessage = isValid ? "连接成功" : "连接失败";

                if (isValid)
                {
                    try
                    {
                        result.DatabaseVersion = await adapter.GetDatabaseVersionAsync(connectionString);
                        result.DatabaseSizeInMB = await adapter.GetDatabaseSizeAsync(connectionString);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "获取数据库详细信息时出现警告");
                        result.ConnectionTestMessage += " (部分信息获取失败)";
                    }
                }

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "测试数据库连接失败");
                return new DatabaseInfoDto
                {
                    MaskedConnectionString = MaskConnectionString(connectionString),
                    IsConnectionValid = false,
                    ConnectionTestMessage = $"连接测试失败: {ex.Message}"
                };
            }
        }

        public async Task<string> GetDatabaseFieldTypeAsync(string csharpType, int? maxLength = null)
        {
            try
            {
                var adapter = _databaseAdapterFactory.GetCurrentAdapter();
                return await Task.FromResult(adapter.GetDatabaseFieldType(csharpType, maxLength));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "获取数据库字段类型映射失败: {CSharpType}", csharpType);
                throw;
            }
        }

        /// <summary>
        /// 构建数据库信息DTO
        /// </summary>
        private async Task<DatabaseInfoDto> BuildDatabaseInfoDto(IDatabaseAdapter adapter)
        {
            var dto = new DatabaseInfoDto
            {
                DatabaseType = adapter.DatabaseType.ToString(),
                DatabaseName = adapter.DatabaseName,
                IsSupported = adapter.IsSupported(),
                ConnectionStringTemplate = adapter.GetConnectionStringTemplate()
            };

            try
            {
                var connectionString = adapter.GetConnectionString();
                dto.MaskedConnectionString = MaskConnectionString(connectionString);
                
                // 测试连接
                dto.IsConnectionValid = await adapter.TestConnectionAsync(connectionString);
                dto.ConnectionTestMessage = dto.IsConnectionValid ? "连接正常" : "连接失败";

                if (dto.IsConnectionValid)
                {
                    try
                    {
                        dto.DatabaseVersion = await adapter.GetDatabaseVersionAsync(connectionString);
                        dto.DatabaseSizeInMB = await adapter.GetDatabaseSizeAsync(connectionString);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "获取数据库详细信息时出现警告");
                        dto.ConnectionTestMessage = "连接正常 (部分信息不可用)";
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "获取数据库连接信息时出现警告");
                dto.IsConnectionValid = false;
                dto.ConnectionTestMessage = $"连接信息获取失败: {ex.Message}";
            }

            return dto;
        }

        /// <summary>
        /// 脱敏连接字符串（隐藏密码等敏感信息）
        /// </summary>
        private static string MaskConnectionString(string connectionString)
        {
            if (string.IsNullOrWhiteSpace(connectionString))
                return string.Empty;

            // 使用正则表达式替换密码相关信息
            var maskedString = connectionString;
            
            // 替换 Password= 或 pwd= 后的内容
            maskedString = Regex.Replace(maskedString, @"(Password|pwd)\s*=\s*[^;]*", "$1=***", RegexOptions.IgnoreCase);
            
            // 替换 User Id= 或 uid= 后的内容（部分脱敏）
            maskedString = Regex.Replace(maskedString, @"(User Id|uid)\s*=\s*([^;]*)", match =>
            {
                var key = match.Groups[1].Value;
                var value = match.Groups[2].Value;
                return value.Length > 3 ? $"{key}={value.Substring(0, 2)}***" : $"{key}=***";
            }, RegexOptions.IgnoreCase);

            return maskedString;
        }
    }
}
