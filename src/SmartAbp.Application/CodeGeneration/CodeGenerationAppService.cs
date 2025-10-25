using System;
using System.Collections.Generic;
using System.Data.Common;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using SmartAbp.Application.CodeGeneration.Generators.MES;
using SmartAbp.Application.CodeGeneration.Generators.UniApp;
using SmartAbp.Application.Contracts.CodeGeneration;
using SmartAbp.Application.Contracts.CodeGeneration.Dtos;
using SmartAbp.Domain.CodeGeneration;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;

namespace SmartAbp.Application.CodeGeneration
{
    /// <summary>
    /// 代码生成应用服务
    /// </summary>
    public class CodeGenerationAppService : ApplicationService, ICodeGenerationAppService
    {
        private readonly IRepository<CodeGenerationTask, Guid> _repository;
        private readonly MesDashboardGenerator _mesDashboardGenerator;
        private readonly UniAppGenerator _uniAppGenerator;
        private readonly IConfiguration _configuration;

        public CodeGenerationAppService(
            IRepository<CodeGenerationTask, Guid> repository,
            IConfiguration configuration,
            ILogger<MesDashboardGenerator> mesLogger,
            ILogger<UniAppGenerator> uniAppLogger)
        {
            _repository = repository;
            _configuration = configuration;
            _mesDashboardGenerator = new MesDashboardGenerator(mesLogger);
            _uniAppGenerator = new UniAppGenerator(uniAppLogger);
        }

        /// <summary>
        /// 获取任务列表
        /// </summary>
        public async Task<PagedResultDto<CodeGenerationTaskDto>> GetListAsync(PagedAndSortedResultRequestDto input)
        {
            var totalCount = await _repository.GetCountAsync();
            var items = await _repository.GetPagedListAsync(
                input.SkipCount,
                input.MaxResultCount,
                input.Sorting ?? "CreationTime DESC"
            );

            return new PagedResultDto<CodeGenerationTaskDto>(
                totalCount,
                ObjectMapper.Map<List<CodeGenerationTask>, List<CodeGenerationTaskDto>>(items)
            );
        }

        /// <summary>
        /// 获取单个任务
        /// </summary>
        public async Task<CodeGenerationTaskDto> GetAsync(Guid id)
        {
            var task = await _repository.GetAsync(id);
            return ObjectMapper.Map<CodeGenerationTask, CodeGenerationTaskDto>(task);
        }

        /// <summary>
        /// 创建MES大屏生成任务
        /// </summary>
        public async Task<CodeGenerationResultDto> GenerateMESDashboardAsync(MESGeneratorConfigDto config)
        {
            var startTime = DateTime.Now;

            try
            {
                // 创建任务记录
                var task = new CodeGenerationTask(
                    GuidGenerator.Create(),
                    config.SystemName,
                    CodeGeneratorType.MESDashboard,
                    JsonSerializer.Serialize(config)
                );

                task.StartGeneration();
                await _repository.InsertAsync(task, autoSave: true);

                // 生成代码
                var generatedFiles = await GenerateMESDashboardFilesAsync(config, task.OutputDirectory);

                // 标记任务成功
                var result = new CodeGenerationResultDto
                {
                    Success = true,
                    GeneratedFiles = generatedFiles.ToArray(),
                    OutputDirectory = task.OutputDirectory,
                    Duration = (DateTime.Now - startTime).TotalSeconds
                };

                task.MarkAsSucceeded(JsonSerializer.Serialize(result));
                await _repository.UpdateAsync(task, autoSave: true);

                return result;
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "生成MES大屏失败");
                return new CodeGenerationResultDto
                {
                    Success = false,
                    ErrorMessage = ex.Message,
                    Duration = (DateTime.Now - startTime).TotalSeconds
                };
            }
        }

        /// <summary>
        /// 创建UniApp移动应用生成任务
        /// </summary>
        public async Task<CodeGenerationResultDto> GenerateUniAppAsync(UniAppGeneratorConfigDto config)
        {
            var startTime = DateTime.Now;

            try
            {
                // 创建任务记录
                var task = new CodeGenerationTask(
                    GuidGenerator.Create(),
                    config.AppName,
                    CodeGeneratorType.UniAppMobile,
                    JsonSerializer.Serialize(config)
                );

                task.StartGeneration();
                await _repository.InsertAsync(task, autoSave: true);

                // 生成代码
                var generatedFiles = await GenerateUniAppFilesAsync(config, task.OutputDirectory);

                // 标记任务成功
                var result = new CodeGenerationResultDto
                {
                    Success = true,
                    GeneratedFiles = generatedFiles.ToArray(),
                    OutputDirectory = task.OutputDirectory,
                    Duration = (DateTime.Now - startTime).TotalSeconds
                };

                task.MarkAsSucceeded(JsonSerializer.Serialize(result));
                await _repository.UpdateAsync(task, autoSave: true);

                return result;
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "生成UniApp应用失败");
                return new CodeGenerationResultDto
                {
                    Success = false,
                    ErrorMessage = ex.Message,
                    Duration = (DateTime.Now - startTime).TotalSeconds
                };
            }
        }

        /// <summary>
        /// 删除任务
        /// </summary>
        public async Task DeleteAsync(Guid id)
        {
            await _repository.DeleteAsync(id);
        }

        #region 私有方法

        /// <summary>
        /// 生成MES大屏文件
        /// </summary>
        private async Task<List<string>> GenerateMESDashboardFilesAsync(MESGeneratorConfigDto config, string outputDir)
        {
            // 使用真实的MES大屏生成器
            var result = await _mesDashboardGenerator.GenerateAsync(config, outputDir);

            if (!result.Success)
            {
                throw new Exception(result.ErrorMessage);
            }

            return new List<string>(result.GeneratedFiles);
        }

        /// <summary>
        /// 生成UniApp文件
        /// </summary>
        private async Task<List<string>> GenerateUniAppFilesAsync(UniAppGeneratorConfigDto config, string outputDir)
        {
            // 使用真实的UniApp生成器
            var result = await _uniAppGenerator.GenerateAsync(config, outputDir);

            if (!result.Success)
            {
                throw new Exception(result.ErrorMessage);
            }

            return new List<string>(result.GeneratedFiles);
        }

        private string GenerateDashboardComponent(string dashboardType, MESGeneratorConfigDto config)
        {
            return $@"<template>
  <div class=""{dashboardType}-dashboard"">
    <h2>{config.SystemName} - {dashboardType}</h2>
    <div class=""dashboard-content"">
      <!-- 大屏内容区域 -->
      <p>更新频率: {config.UpdateInterval}ms</p>
      <p>数据源: {config.SourceType}</p>
    </div>
  </div>
</template>

<script setup>
// Generated by SmartAbp CodeGenerator
// Dashboard Type: {dashboardType}
// System: {config.SystemName}
</script>

<style scoped>
.{dashboardType}-dashboard {{
  width: 100%;
  height: 100%;
  background: #0a0e27;
  color: #fff;
  padding: 20px;
}}
</style>";
        }

        private string GenerateUniAppPage(string module, UniAppGeneratorConfigDto config)
        {
            return $@"<template>
  <view class=""container"">
    <u-navbar :title=""module + '列表'""></u-navbar>
    <view class=""content"">
      <!-- {module} 列表内容 -->
      <text>Generated by SmartAbp CodeGenerator</text>
    </view>
  </view>
</template>

<script setup>
// Generated for {config.AppName}
// Module: {module}
// Version: {config.Version}
</script>

<style scoped>
.container {{
  background-color: #f5f5f5;
}}
</style>";
        }

        private string GenerateManifestJson(UniAppGeneratorConfigDto config)
        {
            var manifest = new
            {
                name = config.AppName,
                appid = config.AppId,
                version = config.Version,
                description = config.Description
            };
            return JsonSerializer.Serialize(manifest, new JsonSerializerOptions { WriteIndented = true });
        }

        private string GeneratePagesJson(UniAppGeneratorConfigDto config)
        {
            var pages = config.SelectedModules;
            var pagesConfig = new
            {
                pages = pages,
                globalStyle = new
                {
                    navigationBarTextStyle = "black",
                    navigationBarTitleText = config.AppName,
                    navigationBarBackgroundColor = config.PrimaryColor,
                    backgroundColor = "#F8F8F8"
                }
            };
            return JsonSerializer.Serialize(pagesConfig, new JsonSerializerOptions { WriteIndented = true });
        }

        private string GenerateMESReadme(MESGeneratorConfigDto config)
        {
            return $@"# {config.SystemName} - MES数字大屏

## 生成信息
- 系统名称: {config.SystemName}
- 公司名称: {config.CompanyName}
- 生成时间: {DateTime.Now:yyyy-MM-dd HH:mm:ss}

## 包含的大屏
{string.Join("\n", Array.ConvertAll(config.SelectedDashboards, d => $"- {d}"))}

## 配置信息
- 数据更新频率: {config.UpdateInterval}ms
- 数据源类型: {config.SourceType}
- 启用告警: {config.EnableAlerts}
- 启用导出: {config.EnableExport}

## 使用说明
1. 复制生成的文件到项目的 `src/views/dashboard/mes/` 目录
2. 配置路由
3. 启动项目查看效果

---
Generated by SmartAbp CodeGenerator
";
        }

        private string GenerateUniAppReadme(UniAppGeneratorConfigDto config)
        {
            return $@"# {config.AppName}

## 应用信息
- 应用名称: {config.AppName}
- 应用ID: {config.AppId}
- 版本号: {config.Version}
- 生成时间: {DateTime.Now:yyyy-MM-dd HH:mm:ss}

## 功能模块
{string.Join("\n", Array.ConvertAll(config.SelectedModules, m => $"- {m}"))}

## 支持平台
{string.Join("\n", Array.ConvertAll(config.Targets, t => $"- {t}"))}

## 运行说明
1. 使用HBuilderX打开项目
2. 选择目标平台运行: npm run dev:h5 或 npm run dev:mp-weixin
3. 构建生产版本: npm run build:app

---
Generated by SmartAbp CodeGenerator
";
        }

        #endregion

        #region 数据库相关方法

        /// <summary>
        /// 测试数据库连接
        /// </summary>
        public async Task<DatabaseConnectionTestResultDto> TestDatabaseConnectionAsync(DatabaseConnectionRequestDto request)
        {
            try
            {
                var connectionString = _configuration.GetConnectionString(request.ConnectionStringName);
                if (string.IsNullOrEmpty(connectionString))
                {
                    return new DatabaseConnectionTestResultDto
                    {
                        Success = false,
                        Message = $"未找到连接字符串: {request.ConnectionStringName}"
                    };
                }

                using (var connection = new SqlConnection(connectionString))
                {
                    await connection.OpenAsync();

                    var serverVersion = connection.ServerVersion;
                    var databaseName = connection.Database;

                    return new DatabaseConnectionTestResultDto
                    {
                        Success = true,
                        Message = "数据库连接成功",
                        Provider = request.Provider,
                        ServerVersion = serverVersion,
                        DatabaseName = databaseName
                    };
                }
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "测试数据库连接失败");
                return new DatabaseConnectionTestResultDto
                {
                    Success = false,
                    Message = $"连接失败: {ex.Message}"
                };
            }
        }

        /// <summary>
        /// 数据库内省（获取表结构）
        /// </summary>
        public async Task<DatabaseSchemaDto> IntrospectDatabaseAsync(DatabaseIntrospectionRequestDto request)
        {
            try
            {
                var connectionString = _configuration.GetConnectionString(request.ConnectionStringName);
                if (string.IsNullOrEmpty(connectionString))
                {
                    return new DatabaseSchemaDto
                    {
                        Success = false,
                        ConnectionInfo = new DatabaseConnectionInfo
                        {
                            Provider = request.Provider,
                            DatabaseName = "未找到连接字符串"
                        }
                    };
                }

                using (var connection = new SqlConnection(connectionString))
                {
                    await connection.OpenAsync();

                    var tables = new List<TableSchemaDto>();
                    var serverVersion = connection.ServerVersion;
                    var databaseName = connection.Database;

                    // 获取所有表
                    var tableQuery = @"
                        SELECT
                            t.TABLE_SCHEMA,
                            t.TABLE_NAME,
                            CAST(p.rows AS bigint) AS RowCount
                        FROM INFORMATION_SCHEMA.TABLES t
                        LEFT JOIN sys.tables st ON t.TABLE_NAME = st.name
                        LEFT JOIN sys.partitions p ON st.object_id = p.object_id AND p.index_id IN (0,1)
                        WHERE t.TABLE_TYPE = 'BASE TABLE'";

                    if (!string.IsNullOrEmpty(request.TableName))
                    {
                        tableQuery += " AND t.TABLE_NAME = @TableName";
                    }

                    tableQuery += " ORDER BY t.TABLE_SCHEMA, t.TABLE_NAME";

                    using (var command = new SqlCommand(tableQuery, connection))
                    {
                        if (!string.IsNullOrEmpty(request.TableName))
                        {
                            command.Parameters.AddWithValue("@TableName", request.TableName);
                        }

                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                var schema = reader.GetString(0);
                                var tableName = reader.GetString(1);
                                var rowCount = reader.IsDBNull(2) ? 0 : reader.GetInt64(2);

                                tables.Add(new TableSchemaDto
                                {
                                    Schema = schema,
                                    Name = tableName,
                                    RowCount = rowCount,
                                    Comment = ""
                                });
                            }
                        }
                    }

                    // 获取每个表的列信息
                    foreach (var table in tables)
                    {
                        var columnQuery = @"
                            SELECT
                                c.COLUMN_NAME,
                                c.DATA_TYPE,
                                c.CHARACTER_MAXIMUM_LENGTH,
                                c.NUMERIC_PRECISION,
                                c.NUMERIC_SCALE,
                                c.IS_NULLABLE,
                                c.COLUMN_DEFAULT,
                                CASE WHEN pk.COLUMN_NAME IS NOT NULL THEN 1 ELSE 0 END AS IsPrimaryKey
                            FROM INFORMATION_SCHEMA.COLUMNS c
                            LEFT JOIN (
                                SELECT ku.TABLE_SCHEMA, ku.TABLE_NAME, ku.COLUMN_NAME
                                FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS AS tc
                                INNER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE AS ku
                                    ON tc.CONSTRAINT_TYPE = 'PRIMARY KEY'
                                    AND tc.CONSTRAINT_NAME = ku.CONSTRAINT_NAME
                            ) pk ON c.TABLE_SCHEMA = pk.TABLE_SCHEMA
                                AND c.TABLE_NAME = pk.TABLE_NAME
                                AND c.COLUMN_NAME = pk.COLUMN_NAME
                            WHERE c.TABLE_SCHEMA = @Schema AND c.TABLE_NAME = @TableName
                            ORDER BY c.ORDINAL_POSITION";

                        using (var command = new SqlCommand(columnQuery, connection))
                        {
                            command.Parameters.AddWithValue("@Schema", table.Schema);
                            command.Parameters.AddWithValue("@TableName", table.Name);

                            using (var reader = await command.ExecuteReaderAsync())
                            {
                                while (await reader.ReadAsync())
                                {
                                    table.Columns.Add(new ColumnSchemaDto
                                    {
                                        Name = reader.GetString(0),
                                        DataType = reader.GetString(1),
                                        MaxLength = reader.IsDBNull(2) ? null : (int?)reader.GetInt32(2),
                                        Precision = reader.IsDBNull(3) ? null : (int?)reader.GetByte(3),
                                        Scale = reader.IsDBNull(4) ? null : (int?)reader.GetInt32(4),
                                        IsNullable = reader.GetString(5) == "YES",
                                        DefaultValue = reader.IsDBNull(6) ? null : reader.GetString(6),
                                        IsPrimaryKey = reader.GetInt32(7) == 1,
                                        Comment = ""
                                    });
                                }
                            }
                        }
                    }

                    return new DatabaseSchemaDto
                    {
                        Success = true,
                        ConnectionInfo = new DatabaseConnectionInfo
                        {
                            Provider = request.Provider,
                            ServerVersion = serverVersion,
                            DatabaseName = databaseName,
                            SchemaCount = tables.Select(t => t.Schema).Distinct().Count(),
                            TableCount = tables.Count
                        },
                        Tables = tables
                    };
                }
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "数据库内省失败");
                return new DatabaseSchemaDto
                {
                    Success = false,
                    ConnectionInfo = new DatabaseConnectionInfo
                    {
                        Provider = request.Provider,
                        DatabaseName = $"内省失败: {ex.Message}"
                    }
                };
            }
        }

        /// <summary>
        /// 获取UI配置
        /// </summary>
        public async Task<EntityUIConfigDto> GetUiConfigAsync(string module, string entity)
        {
            // 返回默认配置
            return await Task.FromResult(new EntityUIConfigDto
            {
                FormLayout = "horizontal",
                LabelWidth = "120px",
                Fields = new List<FieldConfigDto>(),
                TableColumns = new List<TableColumnConfigDto>(),
                Actions = new ActionsConfigDto
                {
                    Create = true,
                    Update = true,
                    Delete = true,
                    Export = true,
                    Import = false,
                    BatchDelete = true
                },
                Pagination = new PaginationConfigDto
                {
                    PageSize = 10,
                    PageSizes = new List<int> { 10, 20, 50, 100 }
                }
            });
        }

        /// <summary>
        /// 保存UI配置
        /// </summary>
        public async Task SaveUiConfigAsync(string module, string entity, EntityUIConfigDto config)
        {
            // TODO: 实现UI配置保存逻辑
            await Task.CompletedTask;
        }

        #endregion
    }
}

