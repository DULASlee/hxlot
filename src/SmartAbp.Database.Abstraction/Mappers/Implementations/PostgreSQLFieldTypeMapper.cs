using System;
using Volo.Abp.DependencyInjection;

namespace SmartAbp.Database.Abstraction.Mappers.Implementations
{
    /// <summary>
    /// PostgreSQL字段类型映射器实现
    /// 关键映射：byte[] → bytea (不是BLOB!), Guid → uuid, DateTime → timestamp
    /// </summary>
    public class PostgreSQLFieldTypeMapper : IFieldTypeMapper, ITransientDependency
    {
        public string MapCSharpTypeToDatabase(string csharpType, int? maxLength = null)
        {
            return csharpType.ToLowerInvariant() switch
            {
                // 字符串类型：PostgreSQL使用 varchar 和 text
                "string" => maxLength.HasValue && maxLength.Value <= 10485760 
                    ? $"VARCHAR({maxLength})" 
                    : "TEXT",
                
                // 整数类型
                "int" => "INTEGER",
                "long" => "BIGINT",
                "short" => "SMALLINT",
                "byte" => "SMALLINT", // PostgreSQL没有TINYINT，使用SMALLINT
                
                // 布尔类型
                "bool" or "boolean" => "BOOLEAN",
                
                // 日期时间类型
                "datetime" => "TIMESTAMP WITHOUT TIME ZONE",
                "datetimeoffset" => "TIMESTAMP WITH TIME ZONE",
                
                // 数值类型
                "decimal" => "NUMERIC(18,2)",
                "double" => "DOUBLE PRECISION",
                "float" => "REAL",
                
                // GUID类型：PostgreSQL使用uuid
                "guid" => "UUID",
                
                // 🔥 关键！二进制数据：PostgreSQL使用bytea，不是BLOB！
                "byte[]" => "BYTEA",
                
                // 字符类型
                "char" => "CHAR(1)",
                
                _ => throw new NotSupportedException($"不支持的C#类型: {csharpType}")
            };
        }

        public string MapDatabaseTypeToCSharp(string databaseType)
        {
            var upperType = databaseType.ToUpperInvariant();
            
            return upperType switch
            {
                var type when type.StartsWith("VARCHAR") || type.StartsWith("TEXT") => "string",
                "INTEGER" or "INT" or "INT4" => "int",
                "BIGINT" or "INT8" => "long",
                "SMALLINT" or "INT2" => "short",
                "BOOLEAN" or "BOOL" => "bool",
                "TIMESTAMP WITHOUT TIME ZONE" or "TIMESTAMP" => "DateTime",
                "TIMESTAMP WITH TIME ZONE" or "TIMESTAMPTZ" => "DateTimeOffset",
                var type when type.StartsWith("NUMERIC") || type.StartsWith("DECIMAL") => "decimal",
                "DOUBLE PRECISION" or "FLOAT8" => "double",
                "REAL" or "FLOAT4" => "float",
                "UUID" => "Guid",
                
                // 🔥 关键！bytea映射到byte[]
                "BYTEA" => "byte[]",
                
                "CHAR" or "CHARACTER" => "char",
                _ => throw new NotSupportedException($"不支持的PostgreSQL类型: {databaseType}")
            };
        }

        public bool RequiresLength(string csharpType)
        {
            return csharpType.ToLowerInvariant() switch
            {
                "string" => true,
                _ => false // PostgreSQL的bytea不需要长度
            };
        }

        public int GetDefaultLength(string csharpType)
        {
            return csharpType.ToLowerInvariant() switch
            {
                "string" => 255,
                _ => 0
            };
        }
    }
}

