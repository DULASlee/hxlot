using System;
using System.Collections.Generic;
using SmartAbp.DevKit.Abstractions.Metadata;
using SmartAbp.DevKit.Core.Generator.EnhancedGenerators;

namespace SmartAbp.DevKit.Core.Samples;

/// <summary>
/// 租户管理元数据示例
/// 用于验证P0/P1/P2生成器的完整功能
/// </summary>
public static class TenantMetadataSample
{
    /// <summary>
    /// 创建完整的租户管理元数据
    /// </summary>
    public static EntityMetadata Create()
    {
        return new EntityMetadata
        {
            Name = "Tenant",
            Properties = new List<PropertyMetadata>
            {
                // 基本信息
                new PropertyMetadata
                {
                    Name = "Name",
                    Type = "string",
                    IsRequired = true,
                    IsNullable = false,
                    ExtensionData = new Dictionary<string, object>
                    {
                        ["MaxLength"] = 100,
                        ["DisplayName"] = "租户名称",
                        ["FieldGroup"] = "BasicInfo"
                    }
                },
                new PropertyMetadata
                {
                    Name = "Code",
                    Type = "string",
                    IsRequired = true,
                    IsNullable = false,
                    ExtensionData = new Dictionary<string, object>
                    {
                        ["MaxLength"] = 50,
                        ["DisplayName"] = "租户代码",
                        ["FieldGroup"] = "BasicInfo"
                    }
                },
                new PropertyMetadata
                {
                    Name = "Type",
                    Type = "TenantType",
                    IsRequired = true,
                    IsNullable = false,
                    ExtensionData = new Dictionary<string, object>
                    {
                        ["EnumTypeName"] = "TenantType",
                        ["DisplayName"] = "租户类型",
                        ["FieldGroup"] = "BasicInfo"
                    }
                },
                new PropertyMetadata
                {
                    Name = "Status",
                    Type = "TenantStatus",
                    IsRequired = true,
                    IsNullable = false,
                    ExtensionData = new Dictionary<string, object>
                    {
                        ["EnumTypeName"] = "TenantStatus",
                        ["DisplayName"] = "租户状态",
                        ["FieldGroup"] = "BasicInfo"
                    }
                },
                new PropertyMetadata
                {
                    Name = "ParentId",
                    Type = "Guid?",
                    IsRequired = false,
                    IsNullable = true,
                    ExtensionData = new Dictionary<string, object>
                    {
                        ["DisplayName"] = "父租户ID",
                        ["FieldGroup"] = "BasicInfo",
                        ["NavigationEntityName"] = "Tenant"
                    }
                },
                
                // 订阅信息
                new PropertyMetadata
                {
                    Name = "SubscriptionPlanId",
                    Type = "Guid?",
                    IsRequired = false,
                    IsNullable = true,
                    ExtensionData = new Dictionary<string, object>
                    {
                        ["DisplayName"] = "订阅计划ID",
                        ["FieldGroup"] = "SubscriptionInfo",
                        ["NavigationEntityName"] = "SubscriptionPlan"
                    }
                },
                new PropertyMetadata
                {
                    Name = "StartTime",
                    Type = "DateTime?",
                    IsRequired = false,
                    IsNullable = true,
                    ExtensionData = new Dictionary<string, object>
                    {
                        ["DisplayName"] = "订阅开始时间",
                        ["FieldGroup"] = "SubscriptionInfo"
                    }
                },
                new PropertyMetadata
                {
                    Name = "EndTime",
                    Type = "DateTime?",
                    IsRequired = false,
                    IsNullable = true,
                    ExtensionData = new Dictionary<string, object>
                    {
                        ["DisplayName"] = "订阅结束时间",
                        ["FieldGroup"] = "SubscriptionInfo"
                    }
                },
                
                // 资源配额
                new PropertyMetadata
                {
                    Name = "MaxUserCount",
                    Type = "int",
                    IsRequired = true,
                    IsNullable = false,
                    ExtensionData = new Dictionary<string, object>
                    {
                        ["DisplayName"] = "最大用户数",
                        ["FieldGroup"] = "QuotaInfo"
                    }
                },
                new PropertyMetadata
                {
                    Name = "MaxStorageSize",
                    Type = "long",
                    IsRequired = true,
                    IsNullable = false,
                    ExtensionData = new Dictionary<string, object>
                    {
                        ["DisplayName"] = "最大存储空间(MB)",
                        ["FieldGroup"] = "QuotaInfo"
                    }
                },
                
                // 安全配置（敏感字段）
                new PropertyMetadata
                {
                    Name = "ConnectionString",
                    Type = "string",
                    IsRequired = false,
                    IsNullable = true,
                    ExtensionData = new Dictionary<string, object>
                    {
                        ["MaxLength"] = 500,
                        ["DisplayName"] = "数据库连接字符串",
                        ["FieldGroup"] = "SecurityInfo",
                        ["IsSensitive"] = true
                    }
                },
                
                // 高级配置（JSON字段）
                new PropertyMetadata
                {
                    Name = "FeatureConfig",
                    Type = "string",
                    IsRequired = false,
                    IsNullable = true,
                    ExtensionData = new Dictionary<string, object>
                    {
                        ["MaxLength"] = 2000,
                        ["DisplayName"] = "功能配置",
                        ["FieldGroup"] = "AdvancedConfig",
                        ["IsJsonField"] = true
                    }
                },
                new PropertyMetadata
                {
                    Name = "CustomSettings",
                    Type = "string",
                    IsRequired = false,
                    IsNullable = true,
                    ExtensionData = new Dictionary<string, object>
                    {
                        ["MaxLength"] = 2000,
                        ["DisplayName"] = "自定义设置",
                        ["FieldGroup"] = "AdvancedConfig",
                        ["IsJsonField"] = true
                    }
                },
                
                // 审计字段
                new PropertyMetadata
                {
                    Name = "IsActive",
                    Type = "bool",
                    IsRequired = true,
                    IsNullable = false,
                    ExtensionData = new Dictionary<string, object>
                    {
                        ["DisplayName"] = "是否启用",
                        ["FieldGroup"] = "BasicInfo"
                    }
                },
                new PropertyMetadata
                {
                    Name = "Description",
                    Type = "string",
                    IsRequired = false,
                    IsNullable = true,
                    ExtensionData = new Dictionary<string, object>
                    {
                        ["MaxLength"] = 500,
                        ["DisplayName"] = "描述",
                        ["FieldGroup"] = "BasicInfo"
                    }
                }
            },
            ExtensionData = new Dictionary<string, object>
            {
                // 字段分组定义（P1功能）
                ["FieldGroups"] = new List<FieldGroup>
                {
                    new FieldGroup
                    {
                        Name = "BasicInfo",
                        DisplayName = "基本信息",
                        Description = "租户基本信息",
                        Order = 1,
                        Properties = new List<string> { "Name", "Code", "Type", "Status", "ParentId", "IsActive", "Description" },
                        IsCollapsible = true,
                        IsCollapsedByDefault = false
                    },
                    new FieldGroup
                    {
                        Name = "SubscriptionInfo",
                        DisplayName = "订阅信息",
                        Description = "租户订阅信息",
                        Order = 2,
                        Properties = new List<string> { "SubscriptionPlanId", "StartTime", "EndTime" },
                        IsCollapsible = true,
                        IsCollapsedByDefault = false
                    },
                    new FieldGroup
                    {
                        Name = "QuotaInfo",
                        DisplayName = "资源配额",
                        Description = "租户资源配额限制",
                        Order = 3,
                        Properties = new List<string> { "MaxUserCount", "MaxStorageSize" },
                        IsCollapsible = true,
                        IsCollapsedByDefault = true
                    },
                    new FieldGroup
                    {
                        Name = "SecurityInfo",
                        DisplayName = "安全配置",
                        Description = "租户安全相关配置",
                        Order = 4,
                        Properties = new List<string> { "ConnectionString" },
                        IsCollapsible = true,
                        IsCollapsedByDefault = true
                    },
                    new FieldGroup
                    {
                        Name = "AdvancedConfig",
                        DisplayName = "高级配置",
                        Description = "租户高级配置选项",
                        Order = 5,
                        Properties = new List<string> { "FeatureConfig", "CustomSettings" },
                        IsCollapsible = true,
                        IsCollapsedByDefault = true
                    }
                },
                
                // 树形结构定义（P1功能）
                ["TreeStructure"] = new TreeStructure
                {
                    ParentIdProperty = "ParentId",
                    ParentProperty = "Parent",
                    ChildrenProperty = "Children",
                    HierarchyPathProperty = "HierarchyPath",
                    LevelProperty = "Level",
                    MaxLevel = 5
                }
            }
        };
    }
    
    /// <summary>
    /// 创建租户类型枚举元数据
    /// </summary>
    public static EnumMetadata CreateTenantTypeEnum()
    {
        return new EnumMetadata
        {
            Name = "TenantType",
            DisplayName = "租户类型",
            Description = "租户的类型分类",
            Values = new List<EnumValueMetadata>
            {
                new EnumValueMetadata { Name = "Enterprise", Value = 1, DisplayName = "企业租户", Description = "企业客户" },
                new EnumValueMetadata { Name = "Personal", Value = 2, DisplayName = "个人租户", Description = "个人用户" },
                new EnumValueMetadata { Name = "Trial", Value = 3, DisplayName = "试用租户", Description = "试用期客户" },
                new EnumValueMetadata { Name = "Partner", Value = 4, DisplayName = "合作伙伴", Description = "合作伙伴" }
            }
        };
    }
    
    /// <summary>
    /// 创建租户状态枚举元数据
    /// </summary>
    public static EnumMetadata CreateTenantStatusEnum()
    {
        return new EnumMetadata
        {
            Name = "TenantStatus",
            DisplayName = "租户状态",
            Description = "租户的当前状态",
            Values = new List<EnumValueMetadata>
            {
                new EnumValueMetadata { Name = "Active", Value = 1, DisplayName = "正常", Description = "租户正常运行" },
                new EnumValueMetadata { Name = "Suspended", Value = 2, DisplayName = "暂停", Description = "租户已暂停" },
                new EnumValueMetadata { Name = "Expired", Value = 3, DisplayName = "已过期", Description = "订阅已过期" },
                new EnumValueMetadata { Name = "Disabled", Value = 4, DisplayName = "已禁用", Description = "租户已禁用" }
            }
        };
    }
}

/// <summary>
/// 枚举元数据
/// </summary>
public class EnumMetadata
{
    public string Name { get; set; } = default!;
    public string DisplayName { get; set; } = default!;
    public string Description { get; set; } = default!;
    public List<EnumValueMetadata> Values { get; set; } = new();
}

/// <summary>
/// 枚举值元数据
/// </summary>
public class EnumValueMetadata
{
    public string Name { get; set; } = default!;
    public int Value { get; set; }
    public string DisplayName { get; set; } = default!;
    public string Description { get; set; } = default!;
}

