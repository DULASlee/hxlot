using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Volo.Abp.Domain.Entities.Auditing;
using Volo.Abp.MultiTenancy;

namespace SmartAbp.Domain.Entities.LowCode
{
    /// <summary>
    /// 🔥 低代码模块聚合根（Phase 1 核心表）
    /// 对应表名: LC_Modules
    /// 用途: 管理低代码业务模块（如ProjectManagement, Device）
    /// 架构决策: 后端SSOT，此DTO将通过NSwag生成前端TypeScript类型
    /// </summary>
    [Table("LC_Modules")]
    public class LowCodeModule : AuditedAggregateRoot<Guid>, IMultiTenant
    {
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 基础信息
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 系统名称（唯一标识，如：ProjectManagement）
        /// </summary>
        [Required]
        [MaxLength(100)]
        public string SystemName { get; set; } = default!;

        /// <summary>
        /// 模块名称（代码生成用，如：Project）
        /// </summary>
        [Required]
        [MaxLength(100)]
        public string ModuleName { get; set; } = default!;

        /// <summary>
        /// 显示名称（中文，如：项目管理）
        /// </summary>
        [Required]
        [MaxLength(200)]
        public string DisplayName { get; set; } = default!;

        /// <summary>
        /// 模块描述
        /// </summary>
        [MaxLength(500)]
        public string? Description { get; set; }

        /// <summary>
        /// 命名空间（如：SmartAbp.ProjectManagement）
        /// </summary>
        [Required]
        [MaxLength(200)]
        public string Namespace { get; set; } = default!;

        /// <summary>
        /// 版本号（如：1.0.0）
        /// </summary>
        [Required]
        [MaxLength(20)]
        public string Version { get; set; } = "1.0.0";

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // JSON配置（强类型DTO）
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 架构配置（JSON存储）
        /// </summary>
        public ModuleArchitectureConfig? ArchitectureConfig { get; set; }

        /// <summary>
        /// 前端配置（JSON存储）
        /// </summary>
        public ModuleFrontendConfig? FrontendConfig { get; set; }

        /// <summary>
        /// 代码生成选项（JSON存储）
        /// </summary>
        public ModuleCodeGenOptions? CodeGenOptions { get; set; }

        /// <summary>
        /// 权限配置（JSON存储）
        /// Phase 3新增：后端SSOT完整性
        /// </summary>
        public ModulePermissionConfig? PermissionConfig { get; set; }

        /// <summary>
        /// 特性管理配置（JSON存储）
        /// Phase 3新增：后端SSOT完整性
        /// </summary>
        public ModuleFeatureManagement? FeatureManagement { get; set; }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 状态管理
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 模块状态：Draft | Published | Archived
        /// </summary>
        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "Draft";

        /// <summary>
        /// 是否激活
        /// </summary>
        public bool IsActive { get; set; } = true;

        /// <summary>
        /// Schema版本号（如：1.0.0）
        /// Phase 3新增：后端SSOT完整性
        /// 对应前端: schemaVersion
        /// </summary>
        [MaxLength(20)]
        public string SchemaVersion { get; set; } = "1.0.0";

        /// <summary>
        /// 模块依赖（JSON数组，存储依赖的其他模块名称）
        /// Phase 3新增：后端SSOT完整性
        /// 对应前端: dependencies (string[])
        /// 示例: ["SmartAbp.IdentityManagement", "SmartAbp.TenantManagement"]
        /// </summary>
        [MaxLength(2000)]
        public string? Dependencies { get; set; }

        /// <summary>
        /// 租户ID（多租户支持）
        /// </summary>
        public Guid? TenantId { get; set; }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 导航属性
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 模块下的实体列表
        /// </summary>
        public virtual ICollection<LowCodeEntity> Entities { get; set; } = new List<LowCodeEntity>();

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 构造函数
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        protected LowCodeModule()
        {
            // EF Core需要无参构造函数
        }

        public LowCodeModule(
            Guid id,
            string systemName,
            string moduleName,
            string displayName,
            string @namespace) : base(id)
        {
            SystemName = systemName;
            ModuleName = moduleName;
            DisplayName = displayName;
            Namespace = @namespace;
        }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 强类型DTO（JSON配置）- 后端SSOT核心
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /// <summary>
    /// 模块架构配置
    /// </summary>
    public class ModuleArchitectureConfig
    {
        /// <summary>
        /// 架构模式：Crud | DDD | CQRS
        /// </summary>
        public string Pattern { get; set; } = "Crud";

        /// <summary>
        /// 数据库提供程序：SqlServer | PostgreSQL | MySQL
        /// </summary>
        public string DatabaseProvider { get; set; } = "SqlServer";

        /// <summary>
        /// 连接字符串名称
        /// </summary>
        public string ConnectionString { get; set; } = "Default";

        /// <summary>
        /// 数据库Schema名称
        /// </summary>
        public string Schema { get; set; } = "dbo";

        /// <summary>
        /// 数据库表前缀
        /// Phase 3新增：后端SSOT完整性
        /// </summary>
        public string? TablePrefix { get; set; }

        /// <summary>
        /// 代码生成作者
        /// Phase 3新增：后端SSOT完整性
        /// </summary>
        public string? Author { get; set; }

        /// <summary>
        /// 是否使用多租户
        /// Phase 3新增：后端SSOT完整性
        /// </summary>
        public bool IsMultiTenant { get; set; } = false;

        /// <summary>
        /// 是否使用软删除
        /// Phase 3新增：后端SSOT完整性
        /// </summary>
        public bool UseSoftDelete { get; set; } = true;

        /// <summary>
        /// 是否启用审计日志
        /// Phase 3新增：后端SSOT完整性
        /// </summary>
        public bool EnableAuditLog { get; set; } = true;
    }

    /// <summary>
    /// 模块前端配置
    /// </summary>
    public class ModuleFrontendConfig
    {
        /// <summary>
        /// 路由前缀（如：/project-management）
        /// </summary>
        public string? RoutePrefix { get; set; }

        /// <summary>
        /// 父级菜单ID
        /// </summary>
        public string? ParentMenuId { get; set; }

        /// <summary>
        /// 菜单图标
        /// </summary>
        public string? MenuIcon { get; set; }

        /// <summary>
        /// 菜单排序
        /// </summary>
        public int MenuOrder { get; set; }

        /// <summary>
        /// 完整菜单配置（支持多层级菜单树）
        /// Phase 3新增：支持前端完整菜单结构
        /// </summary>
        public List<MenuConfigItem>? MenuConfig { get; set; }
    }

    /// <summary>
    /// 菜单配置项（支持递归树结构）
    /// Phase 3新增：后端SSOT完整性
    /// </summary>
    public class MenuConfigItem
    {
        /// <summary>
        /// 菜单ID
        /// </summary>
        public string Id { get; set; } = default!;

        /// <summary>
        /// 菜单标题
        /// </summary>
        public string Label { get; set; } = default!;

        /// <summary>
        /// 菜单图标
        /// </summary>
        public string? Icon { get; set; }

        /// <summary>
        /// 路由地址
        /// </summary>
        public string? Route { get; set; }

        /// <summary>
        /// 排序号
        /// </summary>
        public int Order { get; set; }

        /// <summary>
        /// 子菜单（支持递归）
        /// </summary>
        public List<MenuConfigItem>? Children { get; set; }
    }

    /// <summary>
    /// 模块代码生成选项
    /// </summary>
    public class ModuleCodeGenOptions
    {
        /// <summary>
        /// 是否生成后端代码
        /// </summary>
        public bool GenerateBackend { get; set; } = true;

        /// <summary>
        /// 是否生成前端代码
        /// </summary>
        public bool GenerateFrontend { get; set; } = true;

        /// <summary>
        /// 是否生成数据库迁移
        /// </summary>
        public bool GenerateDatabase { get; set; } = true;

        /// <summary>
        /// 是否生成测试代码
        /// </summary>
        public bool GenerateTests { get; set; } = false;

        /// <summary>
        /// 是否生成移动端页面
        /// Phase 3新增：后端SSOT完整性
        /// </summary>
        public bool GenerateMobilePages { get; set; } = false;

        /// <summary>
        /// 是否使用AutoMapper
        /// </summary>
        public bool UseAutoMapper { get; set; } = true;

        /// <summary>
        /// 是否生成Swagger文档
        /// </summary>
        public bool GenerateSwagger { get; set; } = true;
    }

    /// <summary>
    /// 模块权限配置
    /// Phase 3新增：后端SSOT完整性
    /// 对应前端: UnifiedPermissionConfig (unified-schema.ts)
    /// </summary>
    public class ModulePermissionConfig
    {
        /// <summary>
        /// 权限组列表
        /// </summary>
        public List<PermissionGroupConfig> Groups { get; set; } = new();

        /// <summary>
        /// 自定义操作列表
        /// </summary>
        public List<string> CustomActions { get; set; } = new();
    }

    /// <summary>
    /// 权限组配置
    /// Phase 3新增：后端SSOT完整性
    /// </summary>
    public class PermissionGroupConfig
    {
        /// <summary>
        /// 权限组名称
        /// </summary>
        public string Name { get; set; } = default!;

        /// <summary>
        /// 权限组显示名称
        /// </summary>
        public string DisplayName { get; set; } = default!;

        /// <summary>
        /// 权限列表
        /// </summary>
        public List<string> Permissions { get; set; } = new();
    }

    /// <summary>
    /// 模块特性管理配置
    /// Phase 3新增：后端SSOT完整性
    /// 对应前端: UnifiedFeatureManagement (unified-schema.ts)
    /// </summary>
    public class ModuleFeatureManagement
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
}

