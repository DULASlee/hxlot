namespace SmartAbp.Database.Abstraction.Dialects
{
    /// <summary>
    /// 数据库方言引擎接口
    /// 处理不同数据库的SQL语法差异
    /// </summary>
    public interface IDialectEngine
    {
        /// <summary>
        /// 获取分页SQL语句
        /// </summary>
        /// <param name="baseQuery">基础查询语句</param>
        /// <param name="orderBy">排序语句</param>
        /// <param name="skip">跳过记录数</param>
        /// <param name="take">获取记录数</param>
        /// <returns>分页SQL语句</returns>
        string GetPaginationSql(string baseQuery, string orderBy, int skip, int take);

        /// <summary>
        /// 获取当前时间函数
        /// </summary>
        /// <returns>当前时间函数名</returns>
        string GetCurrentTimeFunction();

        /// <summary>
        /// 获取字符串长度函数
        /// </summary>
        /// <param name="columnName">列名</param>
        /// <returns>字符串长度函数</returns>
        string GetStringLengthFunction(string columnName);

        /// <summary>
        /// 获取字符串截取函数
        /// </summary>
        /// <param name="columnName">列名</param>
        /// <param name="start">开始位置</param>
        /// <param name="length">长度</param>
        /// <returns>字符串截取函数</returns>
        string GetSubstringFunction(string columnName, int start, int length);
    }
}