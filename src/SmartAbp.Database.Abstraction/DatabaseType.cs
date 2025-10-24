namespace SmartAbp.Database.Abstraction
{
    /// <summary>
    /// 支持的数据库类型
    /// ABP平台底层增强：定义支持的数据库类型枚举
    /// </summary>
    public enum DatabaseType
    {
        /// <summary>
        /// Microsoft SQL Server
        /// </summary>
        SqlServer = 1,

        /// <summary>
        /// PostgreSQL
        /// </summary>
        PostgreSQL = 2,

        /// <summary>
        /// SQLite
        /// </summary>
        SQLite = 3,

        /// <summary>
        /// MySQL
        /// </summary>
        MySQL = 4
    }
}