using Volo.Abp.DependencyInjection;

namespace SmartAbp.Database.Abstraction.Dialects.Implementations
{
    /// <summary>
    /// PostgreSQL方言引擎实现
    /// 处理PostgreSQL特定的SQL语法
    /// </summary>
    public class PostgreSQLDialectEngine : IDialectEngine, ITransientDependency
    {
        public string GetPaginationSql(string baseQuery, string orderBy, int skip, int take)
        {
            // PostgreSQL使用LIMIT/OFFSET语法
            return $@"
                {baseQuery}
                {orderBy}
                LIMIT {take} OFFSET {skip}";
        }

        public string GetCurrentTimeFunction()
        {
            // PostgreSQL使用NOW()或CURRENT_TIMESTAMP
            return "NOW()";
        }

        public string GetStringLengthFunction(string columnName)
        {
            // PostgreSQL使用LENGTH()函数
            return $"LENGTH({columnName})";
        }

        public string GetSubstringFunction(string columnName, int start, int length)
        {
            // PostgreSQL的SUBSTRING语法与SQL Server相同
            return $"SUBSTRING({columnName}, {start}, {length})";
        }
    }
}

