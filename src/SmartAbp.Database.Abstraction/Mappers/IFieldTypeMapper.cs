namespace SmartAbp.Database.Abstraction.Mappers
{
    /// <summary>
    /// 字段类型映射接口
    /// 处理C#类型到数据库字段类型的映射
    /// </summary>
    public interface IFieldTypeMapper
    {
        /// <summary>
        /// 将C#类型映射到数据库字段类型
        /// </summary>
        /// <param name="csharpType">C#类型名称</param>
        /// <param name="maxLength">最大长度（可选）</param>
        /// <returns>数据库字段类型</returns>
        string MapCSharpTypeToDatabase(string csharpType, int? maxLength = null);

        /// <summary>
        /// 将数据库字段类型映射到C#类型
        /// </summary>
        /// <param name="databaseType">数据库字段类型</param>
        /// <returns>C#类型名称</returns>
        string MapDatabaseTypeToCSharp(string databaseType);

        /// <summary>
        /// 检查类型是否需要长度规格
        /// </summary>
        /// <param name="csharpType">C#类型名称</param>
        /// <returns>是否需要长度规格</returns>
        bool RequiresLength(string csharpType);

        /// <summary>
        /// 获取默认长度
        /// </summary>
        /// <param name="csharpType">C#类型名称</param>
        /// <returns>默认长度</returns>
        int GetDefaultLength(string csharpType);
    }
}