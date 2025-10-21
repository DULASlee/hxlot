using System;
using System.Collections.Generic;
using SmartAbp.Domain.Entities.LowCode;
using Volo.Abp.Application.Dtos;

namespace SmartAbp.Application.Contracts.LowCode.Dtos
{
    /// <summary>
    /// 🔥 低代码模块DTO（Phase 3 - 后端SSOT完整版）
    /// 对应Domain实体: LowCodeModule
    /// 对应前端类型: UnifiedModuleMetadata (unified-schema.ts)
    /// 用途: 前端TypeScript类型生成的唯一来源
    /// 架构决策: 100%字段对齐前端UnifiedModuleMetadata
    /// </summary>
    public class ModuleDto : EntityDto<Guid>
    {
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 核心标识（必填）- 完全对齐UnifiedModuleMetadata
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 系统名称（唯一标识，如：SmartConstruction, MES）
        /// 对应前端: systemName
        /// </summary>
        public string SystemName { get; set; } = default!;

        /// <summary>
        /// 模块名称（如：ProjectManagement, Device）
        /// 对应前端: name
        /// </summary>
        public string ModuleName { get; set; } = default!;

        /// <summary>
        /// 显示名称（中文，如：项目管理，设备管理）
        /// 对应前端: displayName
        /// </summary>
        public string DisplayName { get; set; } = default!;

        /// <summary>
        /// 模块描述
        /// 对应前端: description
        /// </summary>
        public string Description { get; set; } = default!;

        /// <summary>
        /// 命名空间（如：SmartAbp.ProjectManagement）
        /// 对应前端: namespace
        /// </summary>
        public string Namespace { get; set; } = default!;

        /// <summary>
        /// 版本号（如：1.0.0）
        /// 对应前端: version
        /// </summary>
        public string Version { get; set; } = "1.0.0";

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // JSON配置（直接引用Domain配置类型）
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 架构配置（直接引用Domain类型）
        /// 对应前端: ArchitectureConfig包含所有架构相关字段
        /// Phase 3: 通过这个对象暴露Pattern, Author, DatabaseProvider等
        /// </summary>
        public ModuleArchitectureConfig? ArchitectureConfig { get; set; }

        /// <summary>
        /// 前端配置（直接引用Domain类型）
        /// 对应前端: FrontendConfig包含RoutePrefix, MenuConfig等
        /// Phase 3: 通过这个对象暴露所有前端配置
        /// </summary>
        public ModuleFrontendConfig? FrontendConfig { get; set; }

        /// <summary>
        /// 代码生成选项（直接引用Domain类型）
        /// 对应前端: CodeGenOptions包含GenerateMobilePages等
        /// Phase 3: 通过这个对象暴露所有代码生成选项
        /// </summary>
        public ModuleCodeGenOptions? CodeGenOptions { get; set; }

        /// <summary>
        /// 权限配置
        /// 对应前端: PermissionConfig (UnifiedPermissionConfig)
        /// Phase 3新增: 与前端UnifiedModuleMetadata完全对齐
        /// </summary>
        public ModulePermissionConfigDto? PermissionConfig { get; set; }

        /// <summary>
        /// 特性管理配置
        /// 对应前端: FeatureManagement (UnifiedFeatureManagement)
        /// Phase 3新增: 与前端UnifiedModuleMetadata完全对齐
        /// </summary>
        public ModuleFeatureManagementDto? FeatureManagement { get; set; }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 状态管理
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 模块状态：Draft | Published | Archived
        /// </summary>
        public string Status { get; set; } = "Draft";

        /// <summary>
        /// 是否激活
        /// </summary>
        public bool IsActive { get; set; } = true;

        /// <summary>
        /// 租户ID（多租户支持）
        /// </summary>
        public Guid? TenantId { get; set; }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 导航属性（Phase 2A新增 - 完整元数据）
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 模块下的实体列表（完整元数据）
        /// Phase 2A: 支持前端获取模块完整结构
        /// </summary>
        public List<EntityDefinitionDto>? Entities { get; set; }

        /// <summary>
        /// 模块依赖列表
        /// 对应前端: dependencies (string[])
        /// Phase 3新增: 与前端UnifiedModuleMetadata完全对齐
        /// </summary>
        public List<string> Dependencies { get; set; } = new();

        /// <summary>
        /// Schema版本号
        /// 对应前端: schemaVersion
        /// Phase 3新增: 与前端UnifiedModuleMetadata完全对齐
        /// </summary>
        public string SchemaVersion { get; set; } = "1.0.0";

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 审计字段（从EntityDto<Guid>继承）
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 创建时间
        /// </summary>
        public DateTime CreationTime { get; set; }

        /// <summary>
        /// 创建人ID
        /// </summary>
        public Guid? CreatorId { get; set; }

        /// <summary>
        /// 最后修改时间
        /// </summary>
        public DateTime? LastModificationTime { get; set; }

        /// <summary>
        /// 最后修改人ID
        /// </summary>
        public Guid? LastModifierId { get; set; }
    }

    /// <summary>
    /// 创建或更新模块DTO
    /// </summary>
    public class CreateOrUpdateModuleDto
    {
        public string SystemName { get; set; } = default!;
        public string ModuleName { get; set; } = default!;
        public string DisplayName { get; set; } = default!;
        public string? Description { get; set; }
        public string Namespace { get; set; } = default!;
        public string Version { get; set; } = "1.0.0";
        public ModuleArchitectureConfig? ArchitectureConfig { get; set; }
        public ModuleFrontendConfig? FrontendConfig { get; set; }
        public ModuleCodeGenOptions? CodeGenOptions { get; set; }
        public string Status { get; set; } = "Draft";
        public bool IsActive { get; set; } = true;
    }

    /// <summary>
    /// 获取模块列表输入参数
    /// </summary>
    public class GetModulesInput : PagedAndSortedResultRequestDto
    {
        /// <summary>
        /// 模块名称过滤
        /// </summary>
        public string? Filter { get; set; }

        /// <summary>
        /// 状态过滤：Draft | Published | Archived
        /// </summary>
        public string? Status { get; set; }

        /// <summary>
        /// 是否只显示激活的模块
        /// </summary>
        public bool? IsActive { get; set; }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📦 Phase 3B：配置DTO类型（对应Domain配置类）
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /// <summary>
    /// 模块权限配置DTO
    /// 对应Domain: ModulePermissionConfig
    /// </summary>
    public class ModulePermissionConfigDto
    {
        /// <summary>
        /// 权限组列表
        /// </summary>
        public List<PermissionGroupConfigDto> Groups { get; set; } = new();

        /// <summary>
        /// 自定义操作列表
        /// </summary>
        public List<string> CustomActions { get; set; } = new();
    }

    /// <summary>
    /// 权限组配置DTO
    /// </summary>
    public class PermissionGroupConfigDto
    {
        /// <summary>
        /// 权限组名称
        /// </summary>
        public string Name { get; set; } = default!;

        /// <summary>
        /// 显示名称
        /// </summary>
        public string DisplayName { get; set; } = default!;

        /// <summary>
        /// 权限列表
        /// </summary>
        public List<string> Permissions { get; set; } = new();
    }

    /// <summary>
    /// 模块特性管理配置DTO
    /// 对应Domain: ModuleFeatureManagement
    /// </summary>
    public class ModuleFeatureManagementDto
    {
        /// <summary>
        /// 是否启用特性管理
        /// </summary>
        public bool IsEnabled { get; set; } = false;

        /// <summary>
        /// 默认策略
        /// </summary>
        public string DefaultPolicy { get; set; } = string.Empty;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🚀 Portal入口页面统计DTO（Task 4: 增量添加）
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /// <summary>
    /// 用户入口选择统计DTO（Portal页面展示）
    /// 复用现有数据，不新增数据库表
    /// </summary>
    public class UserChoiceStatsDto
    {
        /// <summary>
        /// Layer1使用百分比
        /// </summary>
        public double Layer1Percentage { get; set; }

        /// <summary>
        /// Layer2使用百分比
        /// </summary>
        public double Layer2Percentage { get; set; }

        /// <summary>
        /// Layer3使用百分比
        /// </summary>
        public double Layer3Percentage { get; set; }

        /// <summary>
        /// 总模块数
        /// </summary>
        public int TotalModules { get; set; }

        /// <summary>
        /// 活跃模块数（最近7天有访问）
        /// </summary>
        public int ActiveModules { get; set; }

        /// <summary>
        /// 今日新增模块数
        /// </summary>
        public int TodayNewModules { get; set; }
    }
}

