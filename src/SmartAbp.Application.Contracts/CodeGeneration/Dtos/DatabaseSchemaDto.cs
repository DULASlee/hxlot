using System.Collections.Generic;

namespace SmartAbp.Application.Contracts.CodeGeneration.Dtos
{
    /// <summary>
    /// 数据库Schema DTO
    /// </summary>
    public class DatabaseSchemaDto
    {
        /// <summary>
        /// 是否成功
        /// </summary>
        public bool Success { get; set; }

        /// <summary>
        /// 连接信息
        /// </summary>
        public DatabaseConnectionInfo ConnectionInfo { get; set; }

        /// <summary>
        /// 表列表
        /// </summary>
        public List<TableSchemaDto> Tables { get; set; } = new List<TableSchemaDto>();
    }

    /// <summary>
    /// 数据库连接信息
    /// </summary>
    public class DatabaseConnectionInfo
    {
        /// <summary>
        /// 数据库提供程序
        /// </summary>
        public string Provider { get; set; }

        /// <summary>
        /// 服务器版本
        /// </summary>
        public string ServerVersion { get; set; }

        /// <summary>
        /// 数据库名称
        /// </summary>
        public string DatabaseName { get; set; }

        /// <summary>
        /// Schema数量
        /// </summary>
        public int SchemaCount { get; set; }

        /// <summary>
        /// 表数量
        /// </summary>
        public int TableCount { get; set; }
    }

    /// <summary>
    /// 表Schema DTO
    /// </summary>
    public class TableSchemaDto
    {
        /// <summary>
        /// 表名
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Schema名称
        /// </summary>
        public string Schema { get; set; }

        /// <summary>
        /// 注释
        /// </summary>
        public string Comment { get; set; }

        /// <summary>
        /// 行数
        /// </summary>
        public long RowCount { get; set; }

        /// <summary>
        /// 列列表
        /// </summary>
        public List<ColumnSchemaDto> Columns { get; set; } = new List<ColumnSchemaDto>();
    }

    /// <summary>
    /// 列Schema DTO
    /// </summary>
    public class ColumnSchemaDto
    {
        /// <summary>
        /// 列名
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// 数据类型
        /// </summary>
        public string DataType { get; set; }

        /// <summary>
        /// 是否主键
        /// </summary>
        public bool IsPrimaryKey { get; set; }

        /// <summary>
        /// 是否可空
        /// </summary>
        public bool IsNullable { get; set; }

        /// <summary>
        /// 最大长度
        /// </summary>
        public int? MaxLength { get; set; }

        /// <summary>
        /// 精度
        /// </summary>
        public int? Precision { get; set; }

        /// <summary>
        /// 小数位数
        /// </summary>
        public int? Scale { get; set; }

        /// <summary>
        /// 默认值
        /// </summary>
        public string DefaultValue { get; set; }

        /// <summary>
        /// 注释
        /// </summary>
        public string Comment { get; set; }
    }
}

