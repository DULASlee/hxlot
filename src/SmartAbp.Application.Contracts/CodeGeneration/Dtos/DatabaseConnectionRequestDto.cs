namespace SmartAbp.Application.Contracts.CodeGeneration.Dtos
{
    /// <summary>
    /// 数据库连接请求DTO
    /// </summary>
    public class DatabaseConnectionRequestDto
    {
        /// <summary>
        /// 连接字符串名称
        /// </summary>
        public string ConnectionStringName { get; set; } = "Default";

        /// <summary>
        /// 数据库提供程序
        /// </summary>
        public string Provider { get; set; } = "SqlServer";
    }
}

