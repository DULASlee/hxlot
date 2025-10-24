using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SmartAbp.CodeGeneration.Dtos;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;

namespace SmartAbp.CodeGeneration
{
    /// <summary>
    /// 代码生成应用服务
    /// </summary>
    public class CodeGenerationAppService : ApplicationService, ICodeGenerationAppService
    {
        private readonly IRepository<CodeGenerationTask, Guid> _repository;

        public CodeGenerationAppService(IRepository<CodeGenerationTask, Guid> repository)
        {
            _repository = repository;
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
            var files = new List<string>();

            // 确保输出目录存在
            Directory.CreateDirectory(outputDir);

            // 生成大屏组件文件
            foreach (var dashboardType in config.SelectedDashboards)
            {
                var componentPath = Path.Combine(outputDir, "dashboards", $"{dashboardType}.vue");
                Directory.CreateDirectory(Path.GetDirectoryName(componentPath));

                var content = GenerateDashboardComponent(dashboardType, config);
                await File.WriteAllTextAsync(componentPath, content);
                files.Add(componentPath);
            }

            // 生成配置文件
            var configPath = Path.Combine(outputDir, "dashboard-config.json");
            await File.WriteAllTextAsync(configPath, JsonSerializer.Serialize(config, new JsonSerializerOptions { WriteIndented = true }));
            files.Add(configPath);

            // 生成README
            var readmePath = Path.Combine(outputDir, "README.md");
            await File.WriteAllTextAsync(readmePath, GenerateMESReadme(config));
            files.Add(readmePath);

            return files;
        }

        /// <summary>
        /// 生成UniApp文件
        /// </summary>
        private async Task<List<string>> GenerateUniAppFilesAsync(UniAppGeneratorConfigDto config, string outputDir)
        {
            var files = new List<string>();

            // 确保输出目录存在
            Directory.CreateDirectory(outputDir);

            // 生成pages目录和页面文件
            foreach (var module in config.SelectedModules)
            {
                var pagePath = Path.Combine(outputDir, "pages", module, "list.vue");
                Directory.CreateDirectory(Path.GetDirectoryName(pagePath));

                var content = GenerateUniAppPage(module, config);
                await File.WriteAllTextAsync(pagePath, content);
                files.Add(pagePath);
            }

            // 生成配置文件
            var manifestPath = Path.Combine(outputDir, "manifest.json");
            await File.WriteAllTextAsync(manifestPath, GenerateManifestJson(config));
            files.Add(manifestPath);

            var pagesPath = Path.Combine(outputDir, "pages.json");
            await File.WriteAllTextAsync(pagesPath, GeneratePagesJson(config));
            files.Add(pagesPath);

            // 生成README
            var readmePath = Path.Combine(outputDir, "README.md");
            await File.WriteAllTextAsync(readmePath, GenerateUniAppReadme(config));
            files.Add(readmePath);

            return files;
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
    }
}

