using System.Collections.Generic;

namespace SmartAbp.CodeGenerator.ABP
{
    /// <summary>
    /// ABP模块生成参数
    /// </summary>
    public class AbpModuleGenerationArgs
    {
        /// <summary>
        /// 模块命名空间
        /// </summary>
        public string Namespace { get; set; } = null!;

        /// <summary>
        /// 模块名称
        /// </summary>
        public string ModuleName { get; set; } = null!;

        /// <summary>
        /// 模块依赖（其他ABP模块的完整类型名）
        /// </summary>
        public List<string>? Dependencies { get; set; }

        /// <summary>
        /// 是否启用多租户
        /// </summary>
        public bool EnableMultiTenancy { get; set; } = true;

        /// <summary>
        /// 是否启用本地化
        /// </summary>
        public bool EnableLocalization { get; set; } = true;

        /// <summary>
        /// 是否启用审计日志
        /// </summary>
        public bool EnableAuditing { get; set; } = true;

        /// <summary>
        /// 是否启用特性管理
        /// </summary>
        public bool EnableFeatures { get; set; } = true;

        /// <summary>
        /// 是否启用权限管理
        /// </summary>
        public bool EnablePermissions { get; set; } = true;

        /// <summary>
        /// 是否启用设置管理
        /// </summary>
        public bool EnableSettings { get; set; } = true;

        /// <summary>
        /// 是否启用后台作业
        /// </summary>
        public bool EnableBackgroundJobs { get; set; } = false;

        /// <summary>
        /// 自定义配置代码（在ConfigureServices方法中的额外代码）
        /// </summary>
        public string? CustomConfiguration { get; set; }
    }
}

