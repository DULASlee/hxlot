using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace SmartAbp.Web.Swagger;

/// <summary>
/// Phase 1B: Swagger Schema过滤器 - 确保所有属性都被正确包含在OpenAPI schema中
/// 用于NSwag前端类型生成
/// </summary>
public class RequireNonNullablePropertiesSchemaFilter : ISchemaFilter
{
    public void Apply(OpenApiSchema schema, SchemaFilterContext context)
    {
        if (schema.Properties == null)
            return;

        // 确保所有属性都有明确的类型定义
        foreach (var property in schema.Properties)
        {
            if (property.Value.Type == null && property.Value.Reference == null)
            {
                // 如果既没有type也没有reference，尝试推断类型
                property.Value.Type = "object";
            }
        }
    }
}

