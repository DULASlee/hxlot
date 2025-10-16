namespace SmartAbp.Application.Contracts.LowCode.Dtos
{
    /// <summary>
    /// 字段类型（与前端 UnifiedFieldType 对齐）
    /// </summary>
    public enum FieldType
    {
        String,
        Text,
        Int,
        Long,
        Decimal,
        Double,
        Bool,
        DateTime,
        DateOnly,
        TimeOnly,
        Guid,
        Enum,
        Json,
        Binary
    }

    /// <summary>
    /// 验证规则类型（与前端 UnifiedValidationRuleType 对齐）
    /// </summary>
    public enum ValidationRuleType
    {
        Required,
        Length,
        Range,
        Regex,
        Email,
        Url,
        Unique,
        Custom
    }
}


