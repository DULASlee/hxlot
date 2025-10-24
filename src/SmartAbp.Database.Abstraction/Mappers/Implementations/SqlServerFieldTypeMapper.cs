using System;
using Volo.Abp.DependencyInjection;

namespace SmartAbp.Database.Abstraction.Mappers.Implementations
{
    /// <summary>
    /// SQL Server字段类型映射器实现
    /// </summary>
    public class SqlServerFieldTypeMapper : IFieldTypeMapper, ITransientDependency
    {
        public string MapCSharpTypeToDatabase(string csharpType, int? maxLength = null)
        {
            return csharpType.ToLowerInvariant() switch
            {
                "string" => maxLength.HasValue ? $"NVARCHAR({maxLength})" : "NVARCHAR(MAX)",
                "int" => "INT",
                "long" => "BIGINT",
                "short" => "SMALLINT",
                "byte" => "TINYINT",
                "bool" or "boolean" => "BIT",
                "datetime" => "DATETIME2",
                "datetimeoffset" => "DATETIMEOFFSET",
                "decimal" => "DECIMAL(18,2)",
                "double" => "FLOAT",
                "float" => "REAL",
                "guid" => "UNIQUEIDENTIFIER",
                "byte[]" => "VARBINARY(MAX)",
                "char" => "NCHAR(1)",
                _ => throw new NotSupportedException($"不支持的C#类型: {csharpType}")
            };
        }

        public string MapDatabaseTypeToCSharp(string databaseType)
        {
            return databaseType.ToUpperInvariant() switch
            {
                var type when type.StartsWith("NVARCHAR") || type.StartsWith("VARCHAR") => "string",
                "INT" => "int",
                "BIGINT" => "long",
                "SMALLINT" => "short",
                "TINYINT" => "byte",
                "BIT" => "bool",
                "DATETIME2" or "DATETIME" => "DateTime",
                "DATETIMEOFFSET" => "DateTimeOffset",
                "DECIMAL" or "NUMERIC" => "decimal",
                "FLOAT" => "double",
                "REAL" => "float",
                "UNIQUEIDENTIFIER" => "Guid",
                var type when type.StartsWith("VARBINARY") => "byte[]",
                "NCHAR" or "CHAR" => "char",
                _ => throw new NotSupportedException($"不支持的数据库类型: {databaseType}")
            };
        }

        public bool RequiresLength(string csharpType)
        {
            return csharpType.ToLowerInvariant() switch
            {
                "string" => true,
                "byte[]" => true,
                _ => false
            };
        }

        public int GetDefaultLength(string csharpType)
        {
            return csharpType.ToLowerInvariant() switch
            {
                "string" => 255,
                "byte[]" => 8000,
                _ => 0
            };
        }
    }
}