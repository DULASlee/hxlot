namespace SmartAbp.Application.Contracts.CodeGeneration.Dtos
{
    /// <summary>
    /// 数据库连接测试结果DTO
    /// </summary>
    public class DatabaseConnectionTestResultDto
    {
        /// <summary>
        /// 是否成功
        /// </summary>
        public bool Success { get; set; }

        /// <summary>
        /// 消息
        /// </summary>
        public string Message { get; set; }

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
    }
}

