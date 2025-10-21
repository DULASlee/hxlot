using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace SmartAbp.Application.Contracts.LowCode.Dtos
{
    /// <summary>
    /// Layer2 (SmartStudio Lite) - 简化的模块创建DTO
    /// 提供渐进式用户体验，相比Layer1增加字段配置能力
    /// </summary>
    public class SimplifiedModuleCreationDto
    {
        /// <summary>
        /// 系统名称（例如：SmartConstruction）
        /// </summary>
        [Required]
        [MaxLength(100)]
        public string SystemName { get; set; }

        /// <summary>
        /// 模块名称（例如：ProjectManagement）
        /// </summary>
        [Required]
        [MaxLength(100)]
        public string ModuleName { get; set; }

        /// <summary>
        /// 显示名称（例如：项目管理）
        /// </summary>
        [Required]
        [MaxLength(200)]
        public string DisplayName { get; set; }

        /// <summary>
        /// 描述
        /// </summary>
        [MaxLength(500)]
        public string Description { get; set; }

        /// <summary>
        /// 实体名称（单数，PascalCase，例如：Project）
        /// </summary>
        [Required]
        [MaxLength(100)]
        public string EntityName { get; set; }

        /// <summary>
        /// 实体显示名称（例如：项目）
        /// </summary>
        [Required]
        [MaxLength(200)]
        public string EntityDisplayName { get; set; }

        /// <summary>
        /// 字段配置列表（用户可视化配置的字段）
        /// </summary>
        public List<SimplifiedFieldConfigDto> Fields { get; set; } = new();

        /// <summary>
        /// 架构模式（Crud/DDD/CQRS）
        /// </summary>
        [MaxLength(50)]
        public string ArchitecturePattern { get; set; } = "Crud";

        /// <summary>
        /// 数据库提供商（SqlServer/MySql/PostgreSql）
        /// </summary>
        [MaxLength(50)]
        public string DatabaseProvider { get; set; } = "SqlServer";

        /// <summary>
        /// 父级菜单ID
        /// </summary>
        [MaxLength(100)]
        public string ParentMenuId { get; set; } = "business";

        /// <summary>
        /// 菜单图标
        /// </summary>
        [MaxLength(100)]
        public string MenuIcon { get; set; } = "document";
    }

    /// <summary>
    /// Layer2 - 简化的字段配置DTO
    /// 提供10种常用字段类型和UI控件选择
    /// </summary>
    public class SimplifiedFieldConfigDto
    {
        /// <summary>
        /// 字段名称（PascalCase，例如：Name）
        /// </summary>
        [Required]
        [MaxLength(100)]
        public string Name { get; set; }

        /// <summary>
        /// 显示名称（例如：姓名）
        /// </summary>
        [Required]
        [MaxLength(200)]
        public string DisplayName { get; set; }

        /// <summary>
        /// 字段类型（string/int/decimal/bool/DateTime/enum/Guid/text/json/byte[]）
        /// </summary>
        [Required]
        [MaxLength(50)]
        public string Type { get; set; } = "string";

        /// <summary>
        /// 是否必填
        /// </summary>
        public bool IsRequired { get; set; }

        /// <summary>
        /// 是否可空
        /// </summary>
        public bool IsNullable { get; set; } = true;

        /// <summary>
        /// 最大长度（字符串类型）
        /// </summary>
        public int? MaxLength { get; set; }

        /// <summary>
        /// 最小长度（字符串类型）
        /// </summary>
        public int? MinLength { get; set; }

        /// <summary>
        /// 精度（decimal类型）
        /// </summary>
        public int? Precision { get; set; }

        /// <summary>
        /// 小数位数（decimal类型）
        /// </summary>
        public int? Scale { get; set; }

        /// <summary>
        /// 最小值（数值类型）
        /// </summary>
        public decimal? MinValue { get; set; }

        /// <summary>
        /// 最大值（数值类型）
        /// </summary>
        public decimal? MaxValue { get; set; }

        /// <summary>
        /// 默认值
        /// </summary>
        [MaxLength(500)]
        public string DefaultValue { get; set; }

        /// <summary>
        /// 正则表达式验证
        /// </summary>
        [MaxLength(500)]
        public string Pattern { get; set; }

        /// <summary>
        /// UI控件类型（input/number/switch/date-picker/select/textarea/editor）
        /// </summary>
        [MaxLength(50)]
        public string UIControl { get; set; } = "input";

        /// <summary>
        /// 枚举值列表（当Type=enum时使用）
        /// </summary>
        public List<EnumValueDto> EnumValues { get; set; } = new();

        /// <summary>
        /// 验证规则列表
        /// </summary>
        public List<ValidationRuleDto> ValidationRules { get; set; } = new();

        /// <summary>
        /// 排序
        /// </summary>
        public int Order { get; set; }

        /// <summary>
        /// 备注
        /// </summary>
        [MaxLength(500)]
        public string Comment { get; set; }
    }

    /// <summary>
    /// Layer2 - 模块创建结果DTO
    /// </summary>
    public class SimplifiedModuleCreationResultDto
    {
        /// <summary>
        /// 是否成功
        /// </summary>
        public bool Success { get; set; }

        /// <summary>
        /// 创建的模块ID
        /// </summary>
        public Guid? ModuleId { get; set; }

        /// <summary>
        /// 创建的实体ID
        /// </summary>
        public Guid? EntityId { get; set; }

        /// <summary>
        /// 消息
        /// </summary>
        public string Message { get; set; }

        /// <summary>
        /// 生成的文件列表
        /// </summary>
        public List<string> GeneratedFiles { get; set; } = new();

        /// <summary>
        /// 代码生成会话ID（用于进度查询）
        /// </summary>
        public string SessionId { get; set; }
    }
}

