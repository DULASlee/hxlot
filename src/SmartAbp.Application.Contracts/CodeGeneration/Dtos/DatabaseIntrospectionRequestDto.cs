namespace SmartAbp.Application.Contracts.CodeGeneration.Dtos
{
    /// <summary>
    /// 数据库内省请求DTO
    /// </summary>
    public class DatabaseIntrospectionRequestDto
    {
        /// <summary>
        /// 连接字符串名称
        /// </summary>
        public string ConnectionStringName { get; set; } = "Default";

        /// <summary>
        /// 数据库提供程序
        /// </summary>
        public string Provider { get; set; } = "SqlServer";

        /// <summary>
        /// 表名（可选，为空则获取所有表）
        /// </summary>
        public string TableName { get; set; }
    }
}

