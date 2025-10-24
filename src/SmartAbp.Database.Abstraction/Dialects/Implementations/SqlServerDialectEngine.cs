using Volo.Abp.DependencyInjection;

namespace SmartAbp.Database.Abstraction.Dialects.Implementations
{
    /// <summary>
    /// SQL Server方言引擎实现
    /// </summary>
    public class SqlServerDialectEngine : IDialectEngine, ITransientDependency
    {
        public string GetPaginationSql(string baseQuery, string orderBy, int skip, int take)
        {
            return $@"
                {baseQuery}
                {orderBy}
                OFFSET {skip} ROWS
                FETCH NEXT {take} ROWS ONLY";
        }

        public string GetCurrentTimeFunction()
        {
            return "GETDATE()";
        }

        public string GetStringLengthFunction(string columnName)
        {
            return $"LEN({columnName})";
        }

        public string GetSubstringFunction(string columnName, int start, int length)
        {
            return $"SUBSTRING({columnName}, {start}, {length})";
        }
    }
}