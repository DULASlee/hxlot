using Volo.Abp.DependencyInjection;

namespace SmartAbp.Database.Abstraction.Adapters
{
    /// <summary>
    /// 数据库适配器工厂接口
    /// ABP平台底层增强：为上层服务提供数据库适配器
    /// </summary>
    public interface IDatabaseAdapterFactory : ITransientDependency
    {
        /// <summary>
        /// 根据数据库类型获取适配器实例
        /// </summary>
        /// <param name="databaseType">数据库类型</param>
        /// <returns>IDatabaseAdapter实例</returns>
        IDatabaseAdapter GetAdapter(DatabaseType databaseType);

        /// <summary>
        /// 根据当前配置获取适配器实例
        /// </summary>
        /// <returns>IDatabaseAdapter实例</returns>
        IDatabaseAdapter GetCurrentAdapter();

        /// <summary>
        /// 获取当前配置的数据库类型
        /// </summary>
        /// <returns>DatabaseType</returns>
        DatabaseType GetCurrentDatabaseType();
    }
}
