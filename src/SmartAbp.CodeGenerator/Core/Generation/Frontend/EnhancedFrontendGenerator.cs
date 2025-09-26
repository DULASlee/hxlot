using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SmartAbp.CodeGenerator.Core.Templates;
using SmartAbp.CodeGenerator.Services.V9;
using Volo.Abp.DependencyInjection;

namespace SmartAbp.CodeGenerator.Core.Generation.Frontend;

/// <summary>
/// 🔥 增强Vue3前端代码生成器 - 企业级模板驱动实现
/// 修复原FrontendGenerator硬编码缺陷，集成务实模板系统
/// 支持UI订制和业务逻辑扩展点
/// </summary>
public class EnhancedFrontendGenerator : ITransientDependency
{
    private readonly ILogger<EnhancedFrontendGenerator> _logger;
    private readonly PragmaticTemplateService _templateService;

    private readonly Vue3ComponentCustomizer _componentCustomizer; // 🎨 Vue3组件订制器

    public EnhancedFrontendGenerator(
        ILogger<EnhancedFrontendGenerator> logger,
        PragmaticTemplateService templateService,
        Vue3ComponentCustomizer componentCustomizer) // 🔥 注入Vue3组件订制器
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _templateService = templateService ?? throw new ArgumentNullException(nameof(templateService));
        _componentCustomizer = componentCustomizer ?? throw new ArgumentNullException(nameof(componentCustomizer));
    }

    /// <summary>
    /// 🚀 生成完整的Vue3前端代码（基于模板库）
    /// </summary>
    /// <param name="metadata">模块元数据</param>
    /// <param name="solutionRoot">解决方案根目录</param>
    /// <returns>生成的文件字典</returns>
    public async Task<Dictionary<string, string>> GenerateAsync(ModuleMetadataDto metadata, string solutionRoot)
    {
        _logger.LogInformation("🚀 启动增强Vue3前端代码生成: {ModuleName}", metadata.Name);

        try
        {
            var generatedFiles = new Dictionary<string, string>();
            var vueRoot = Path.Combine(solutionRoot, "src", "SmartAbp.Vue");

            // 🎯 企业级目录结构规划
            var modulePath = Path.Combine(vueRoot, "src", "views", metadata.Name.ToLowerInvariant());
            var apiPath = Path.Combine(vueRoot, "src", "api", metadata.Name);
            var storePath = Path.Combine(vueRoot, "src", "stores", "modules", metadata.Name.ToLowerInvariant());
            var typesPath = Path.Combine(vueRoot, "src", "types", metadata.Name.ToLowerInvariant());

            // 为每个实体生成前端代码
            foreach (var entity in metadata.Entities)
            {
                _logger.LogInformation("🔧 生成实体前端代码: {EntityName}", entity.Name);

                // 🎨 生成Vue管理组件（使用CrudManagement模板）
                var managementComponent = await GenerateManagementComponentAsync(entity, metadata);
                if (managementComponent.IsSuccess)
                {
                    generatedFiles.Add(
                        Path.Combine(modulePath, $"{entity.Name}Management.vue"),
                        managementComponent.RenderedContent!
                    );
                }

                // 📊 生成Pinia状态管理（使用EntityStore模板）
                var storeFile = await GenerateStoreFileAsync(entity, metadata);
                if (storeFile.IsSuccess)
                {
                    generatedFiles.Add(
                        Path.Combine(storePath, $"{entity.Name.ToLowerInvariant()}.ts"),
                        storeFile.RenderedContent!
                    );
                }

                // 🔌 生成API服务文件
                var apiFile = await GenerateApiServiceAsync(entity, metadata);
                if (apiFile.IsSuccess)
                {
                    generatedFiles.Add(
                        Path.Combine(apiPath, $"{entity.Name.ToLowerInvariant()}.ts"),
                        apiFile.RenderedContent!
                    );
                }

                // 📋 生成TypeScript类型定义
                var typesFile = await GenerateTypesFileAsync(entity, metadata);
                if (typesFile.IsSuccess)
                {
                    generatedFiles.Add(
                        Path.Combine(typesPath, $"{entity.Name.ToLowerInvariant()}.ts"),
                        typesFile.RenderedContent!
                    );
                }
            }

            // 🚀 生成模块级文件
            await GenerateModuleLevelFilesAsync(metadata, vueRoot, generatedFiles);

            _logger.LogInformation("✅ Vue3前端代码生成完成: {FileCount}个文件", generatedFiles.Count);
            return generatedFiles;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Vue3前端代码生成失败: {ModuleName}", metadata.Name);
            throw;
        }
    }

    /// <summary>
    /// 🎨 生成Vue管理组件（增强版 - 协助请求3实现）
    /// </summary>
    private async Task<TemplateRenderResult> GenerateManagementComponentAsync(
        EnhancedEntityModelDto entity, 
        ModuleMetadataDto metadata)
    {
        _logger.LogDebug("🎨 生成增强Vue管理组件: {EntityName}", entity.Name);

        try
        {
            // 🔥 协助请求3：使用Vue3组件订制器生成带扩展点的组件
            var customizationOptions = new ComponentCustomizationOptions
            {
                EnableThemeCustomization = true,
                EnableResponsiveLayout = true,
                EnableAdvancedSearch = true,
                EnableBatchOperations = true,
                EnableImportExport = true
            };

            var customizedContent = _componentCustomizer.GenerateCustomizableManagementComponent(
                entity, metadata, customizationOptions);

            _logger.LogDebug("✅ 增强Vue组件生成成功: {EntityName}, 包含15个扩展点", entity.Name);
            
            return TemplateRenderResult.Success(customizedContent, "vue3-component-customizer");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ 增强Vue组件生成失败: {EntityName}", entity.Name);
            
            // 🔄 兜底策略：使用原有模板
            _logger.LogInformation("🔄 使用标准模板作为兜底方案: {EntityName}", entity.Name);
            return await _templateService.RenderTemplateAsync(
                "frontend/components/CrudManagement.template.vue",
                metadata,
                entity
            );
        }
    }

    /// <summary>
    /// 📊 生成Pinia状态管理（基于EntityStore模板）
    /// </summary>
    private async Task<TemplateRenderResult> GenerateStoreFileAsync(
        EnhancedEntityModelDto entity, 
        ModuleMetadataDto metadata)
    {
        _logger.LogDebug("生成状态管理: {EntityName}", entity.Name);

        // 🔥 模板强制匹配：使用标准EntityStore模板
        return await _templateService.RenderTemplateAsync(
            "frontend/stores/EntityStore.template.ts",
            metadata,
            entity
        );
    }

    /// <summary>
    /// 🔌 生成API服务文件（基于内置模板）
    /// </summary>
    private async Task<TemplateRenderResult> GenerateApiServiceAsync(
        EnhancedEntityModelDto entity, 
        ModuleMetadataDto metadata)
    {
        _logger.LogDebug("生成API服务: {EntityName}", entity.Name);

        // 🔧 生成Vue3 + TypeScript API服务代码
        var apiContent = GenerateApiServiceContent(entity, metadata);
        return await Task.FromResult(TemplateRenderResult.Success(apiContent, "internal-api-generator"));
    }

    /// <summary>
    /// 📋 生成TypeScript类型定义
    /// </summary>
    private async Task<TemplateRenderResult> GenerateTypesFileAsync(
        EnhancedEntityModelDto entity, 
        ModuleMetadataDto metadata)
    {
        _logger.LogDebug("生成类型定义: {EntityName}", entity.Name);

        var typesContent = GenerateTypesContent(entity, metadata);
        return await Task.FromResult(TemplateRenderResult.Success(typesContent, "internal-types-generator"));
    }

    /// <summary>
    /// 🚀 生成模块级文件（路由、菜单、配置）
    /// </summary>
    private async Task GenerateModuleLevelFilesAsync(
        ModuleMetadataDto metadata, 
        string vueRoot, 
        Dictionary<string, string> generatedFiles)
    {
        _logger.LogDebug("生成模块级文件: {ModuleName}", metadata.Name);

        // 🛣️ 生成路由配置
        var routeContent = await GenerateModuleRoutesAsync(metadata);
        if (routeContent.IsSuccess)
        {
            generatedFiles.Add(
                Path.Combine(vueRoot, "src", "router", "modules", $"{metadata.Name.ToLowerInvariant()}.ts"),
                routeContent.RenderedContent!
            );
        }

        // 📜 生成菜单配置
        var menuContent = GenerateMenuConfiguration(metadata);
        generatedFiles.Add(
            Path.Combine(vueRoot, "src", "config", "menus", $"{metadata.Name.ToLowerInvariant()}.ts"),
            menuContent
        );
    }

    /// <summary>
    /// 🛣️ 生成模块路由配置（使用ModuleRoutes模板）
    /// </summary>
    private async Task<TemplateRenderResult> GenerateModuleRoutesAsync(ModuleMetadataDto metadata)
    {
        // 🔥 模板强制匹配：使用标准ModuleRoutes模板
        return await _templateService.RenderTemplateAsync(
            "frontend/router/ModuleRoutes.template.ts",
            metadata,
            null
        );
    }

    /// <summary>
    /// 🔌 生成API服务内容（Vue3 + TypeScript + Axios）
    /// </summary>
    private string GenerateApiServiceContent(EnhancedEntityModelDto entity, ModuleMetadataDto metadata)
    {
        var sb = new StringBuilder();
        
        sb.AppendLine("// 🔥 自动生成的API服务 - Vue3 + TypeScript + Axios");
        sb.AppendLine("// 支持完整的CRUD操作和业务逻辑扩展");
        sb.AppendLine();
        sb.AppendLine("import { request } from '@/utils/api'");
        sb.AppendLine($"import type {{ {entity.Name}Dto, Create{entity.Name}Dto, Update{entity.Name}Dto, Get{entity.Name}ListDto }} from '@/types/{metadata.Name.ToLowerInvariant()}/{entity.Name.ToLowerInvariant()}'");
        sb.AppendLine();
        sb.AppendLine($"const API_BASE = '/api/{metadata.Name.ToLowerInvariant()}/{entity.Name.ToLowerInvariant()}'");
        sb.AppendLine();
        
        // 生成CRUD API方法
        sb.AppendLine($"export const {entity.Name.ToLowerInvariant()}Api = {{");
        sb.AppendLine($"  // 📋 获取列表");
        sb.AppendLine($"  getList: (params?: Get{entity.Name}ListDto) => request.get(`${{API_BASE}}`, {{ params }}),");
        sb.AppendLine();
        sb.AppendLine($"  // 🔍 获取详情");
        sb.AppendLine($"  getById: (id: string) => request.get(`${{API_BASE}}/${{id}}`),");
        sb.AppendLine();
        sb.AppendLine($"  // ➕ 创建");
        sb.AppendLine($"  create: (data: Create{entity.Name}Dto) => request.post(API_BASE, data),");
        sb.AppendLine();
        sb.AppendLine($"  // ✏️ 更新");
        sb.AppendLine($"  update: (id: string, data: Update{entity.Name}Dto) => request.put(`${{API_BASE}}/${{id}}`, data),");
        sb.AppendLine();
        sb.AppendLine($"  // 🗑️ 删除");
        sb.AppendLine($"  delete: (id: string) => request.delete(`${{API_BASE}}/${{id}}`),");
        sb.AppendLine();
        sb.AppendLine($"  // 🔍 批量操作（企业级扩展点）");
        sb.AppendLine($"  batchDelete: (ids: string[]) => request.post(`${{API_BASE}}/batch-delete`, {{ ids }}),");
        sb.AppendLine($"  export: (params?: any) => request.get(`${{API_BASE}}/export`, {{ params, responseType: 'blob' }}),");
        sb.AppendLine($"  import: (file: File) => {{");
        sb.AppendLine($"    const formData = new FormData()");
        sb.AppendLine($"    formData.append('file', file)");
        sb.AppendLine($"    return request.post(`${{API_BASE}}/import`, formData, {{");
        sb.AppendLine($"      headers: {{ 'Content-Type': 'multipart/form-data' }}");
        sb.AppendLine($"    }})");
        sb.AppendLine($"  }}");
        sb.AppendLine($"}}");
        sb.AppendLine();
        sb.AppendLine($"export default {entity.Name.ToLowerInvariant()}Api");

        return sb.ToString();
    }

    /// <summary>
    /// 📋 生成TypeScript类型定义（Vue3 + 强类型）
    /// </summary>
    private string GenerateTypesContent(EnhancedEntityModelDto entity, ModuleMetadataDto metadata)
    {
        var sb = new StringBuilder();
        
        sb.AppendLine("// 🔥 自动生成的TypeScript类型定义 - Vue3强类型支持");
        sb.AppendLine("// 与后端DTO保持完全一致，确保类型安全");
        sb.AppendLine();
        
        // 生成基础DTO接口
        sb.AppendLine($"/// <summary>");
        sb.AppendLine($"/// {entity.DisplayName}数据传输对象");
        sb.AppendLine($"/// </summary>");
        sb.AppendLine($"export interface {entity.Name}Dto {{");
        if (entity.Properties != null)
        {
            foreach (var prop in entity.Properties)
            {
                var tsType = MapCSharpTypeToTypeScript(prop.Type);
                var optional = !prop.IsRequired ? "?" : "";
                sb.AppendLine($"  /** {prop.Description ?? prop.DisplayName ?? prop.Name} */");
                sb.AppendLine($"  {prop.Name.ToCamelCase()}{optional}: {tsType}");
            }
        }
        sb.AppendLine($"}}");
        sb.AppendLine();
        
        // 生成创建DTO
        sb.AppendLine($"/// <summary>");
        sb.AppendLine($"/// 创建{entity.DisplayName}数据传输对象");
        sb.AppendLine($"/// </summary>");
        sb.AppendLine($"export interface Create{entity.Name}Dto {{");
        if (entity.Properties != null)
        {
            foreach (var prop in entity.Properties.Where(p => !p.IsKey))
            {
                var tsType = MapCSharpTypeToTypeScript(prop.Type);
                var optional = !prop.IsRequired ? "?" : "";
                sb.AppendLine($"  /** {prop.Description ?? prop.DisplayName ?? prop.Name} */");
                sb.AppendLine($"  {prop.Name.ToCamelCase()}{optional}: {tsType}");
            }
        }
        sb.AppendLine($"}}");
        sb.AppendLine();
        
        // 生成更新DTO
        sb.AppendLine($"/// <summary>");
        sb.AppendLine($"/// 更新{entity.DisplayName}数据传输对象");
        sb.AppendLine($"/// </summary>");
        sb.AppendLine($"export interface Update{entity.Name}Dto {{");
        if (entity.Properties != null)
        {
            foreach (var prop in entity.Properties)
            {
                var tsType = MapCSharpTypeToTypeScript(prop.Type);
                var optional = !prop.IsRequired ? "?" : "";
                sb.AppendLine($"  /** {prop.Description ?? prop.DisplayName ?? prop.Name} */");
                sb.AppendLine($"  {prop.Name.ToCamelCase()}{optional}: {tsType}");
            }
        }
        sb.AppendLine($"}}");
        sb.AppendLine();
        
        // 生成查询DTO
        sb.AppendLine($"/// <summary>");
        sb.AppendLine($"/// 获取{entity.DisplayName}列表查询对象");
        sb.AppendLine($"/// </summary>");
        sb.AppendLine($"export interface Get{entity.Name}ListDto {{");
        sb.AppendLine($"  /** 关键词搜索 */");
        sb.AppendLine($"  keyword?: string");
        sb.AppendLine($"  /** 页码 */");
        sb.AppendLine($"  pageIndex?: number");
        sb.AppendLine($"  /** 页大小 */");
        sb.AppendLine($"  pageSize?: number");
        sb.AppendLine($"  /** 排序字段 */");
        sb.AppendLine($"  sortField?: string");
        sb.AppendLine($"  /** 排序方向 */");
        sb.AppendLine($"  sortOrder?: 'asc' | 'desc'");
        sb.AppendLine($"}}");

        return sb.ToString();
    }

    /// <summary>
    /// 📜 生成菜单配置（Vue3路由集成）
    /// </summary>
    private string GenerateMenuConfiguration(ModuleMetadataDto metadata)
    {
        var sb = new StringBuilder();
        
        sb.AppendLine("// 🔥 自动生成的菜单配置 - Vue3路由集成");
        sb.AppendLine("// 支持权限控制和国际化");
        sb.AppendLine();
        sb.AppendLine("import type { MenuConfig } from '@/types/menu'");
        sb.AppendLine();
        sb.AppendLine($"export const {metadata.Name.ToLowerInvariant()}MenuConfig: MenuConfig = {{");
        sb.AppendLine($"  name: '{metadata.Name}',");
        sb.AppendLine($"  displayName: '{metadata.DisplayName}',");
        sb.AppendLine($"  icon: 'el-icon-s-data',");
        sb.AppendLine($"  order: 100,");
        sb.AppendLine($"  children: [");
        
        foreach (var entity in metadata.Entities)
        {
            sb.AppendLine($"    {{");
            sb.AppendLine($"      name: '{entity.Name}Management',");
            sb.AppendLine($"      displayName: '{entity.DisplayName}管理',");
            sb.AppendLine($"      path: '/{metadata.Name.ToLowerInvariant()}/{entity.Name.ToLowerInvariant()}',");
            sb.AppendLine($"      component: '{entity.Name}Management',");
            sb.AppendLine($"      permission: 'SmartAbp.{entity.Name}.Default',");
            sb.AppendLine($"      icon: 'el-icon-menu'");
            sb.AppendLine($"    }},");
        }
        
        sb.AppendLine($"  ]");
        sb.AppendLine($"}}");
        sb.AppendLine();
        sb.AppendLine($"export default {metadata.Name.ToLowerInvariant()}MenuConfig");

        return sb.ToString();
    }

    /// <summary>
    /// 🔧 C#类型到TypeScript类型映射
    /// </summary>
    private static string MapCSharpTypeToTypeScript(string? csharpType)
    {
        return csharpType?.ToLowerInvariant() switch
        {
            "string" => "string",
            "int" or "integer" or "long" or "short" or "byte" => "number",
            "double" or "float" or "decimal" => "number",
            "bool" or "boolean" => "boolean",
            "datetime" or "datetimeoffset" => "Date | string",
            "guid" => "string",
            "byte[]" => "string", // Base64
            null => "any",
            _ when csharpType.EndsWith("?") => MapCSharpTypeToTypeScript(csharpType.TrimEnd('?')) + " | null",
            _ when csharpType.EndsWith("[]") => MapCSharpTypeToTypeScript(csharpType.TrimEnd('[', ']')) + "[]",
            _ => "any" // 兜底类型
        };
    }
}

/// <summary>
/// 🔧 字符串扩展方法 - 支持驼峰命名转换
/// </summary>
public static class StringExtensions
{
    public static string ToCamelCase(this string str)
    {
        if (string.IsNullOrEmpty(str)) return str;
        return char.ToLowerInvariant(str[0]) + str[1..];
    }
}
