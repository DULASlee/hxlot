namespace SmartAbp.DevKit.Abstractions.Generation;

/// <summary>
/// 代码生成器工厂接口（依赖倒置原则）
/// 负责根据配置动态创建生成器实例
/// </summary>
public interface IGeneratorFactory
{
    /// <summary>
    /// 获取指定层级的所有生成器
    /// </summary>
    /// <param name="layer">目标层级</param>
    /// <returns>生成器列表</returns>
    IEnumerable<ILayerGenerator> GetGenerators(TargetLayer layer);

    /// <summary>
    /// 获取所有启用的生成器
    /// </summary>
    /// <returns>生成器列表</returns>
    IEnumerable<ILayerGenerator> GetAllGenerators();

    /// <summary>
    /// 根据名称获取生成器
    /// </summary>
    /// <param name="name">生成器名称</param>
    /// <returns>生成器实例</returns>
    ILayerGenerator? GetGeneratorByName(string name);

    /// <summary>
    /// 注册生成器（用于扩展）
    /// </summary>
    /// <param name="generator">生成器实例</param>
    void RegisterGenerator(ILayerGenerator generator);
}

