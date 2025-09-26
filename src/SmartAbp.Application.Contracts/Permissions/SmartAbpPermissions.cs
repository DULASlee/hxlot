namespace SmartAbp.Permissions;

/// <summary>
/// 🔥 SmartAbp权限常量定义 - 企业级权限体系
/// 基于ABP权限框架，支持代码生成器自动权限集成
/// </summary>
public static class SmartAbpPermissions
{
    public const string GroupName = "SmartAbp";

    /// <summary>
    /// 代码生成权限组
    /// </summary>
    public static class CodeGeneration
    {
        public const string Default = GroupName + ".CodeGeneration";
        public const string Create = Default + ".Create";
        public const string Edit = Default + ".Edit";
        public const string Delete = Default + ".Delete";
        public const string Generate = Default + ".Generate";
        public const string Preview = Default + ".Preview";
        public const string Export = Default + ".Export";
    }

    /// <summary>
    /// 元数据管理权限组
    /// </summary>
    public static class Metadata
    {
        public const string Default = GroupName + ".Metadata";
        public const string Create = Default + ".Create";
        public const string Edit = Default + ".Edit";
        public const string Delete = Default + ".Delete";
        public const string Import = Default + ".Import";
        public const string Export = Default + ".Export";
    }

    /// <summary>
    /// 模板管理权限组
    /// </summary>
    public static class Templates
    {
        public const string Default = GroupName + ".Templates";
        public const string Create = Default + ".Create";
        public const string Edit = Default + ".Edit";
        public const string Delete = Default + ".Delete";
        public const string Import = Default + ".Import";
        public const string Export = Default + ".Export";
    }

    /// <summary>
    /// 低代码引擎权限组  
    /// </summary>
    public static class LowCode
    {
        public const string Default = GroupName + ".LowCode";
        public const string Design = Default + ".Design";
        public const string Preview = Default + ".Preview";
        public const string Deploy = Default + ".Deploy";
        public const string Manage = Default + ".Manage";
    }

    /// <summary>
    /// 企业级功能权限组
    /// </summary>
    public static class Enterprise
    {
        public const string Default = GroupName + ".Enterprise";
        public const string Analytics = Default + ".Analytics";
        public const string Monitoring = Default + ".Monitoring";
        public const string Security = Default + ".Security";
        public const string Compliance = Default + ".Compliance";
        public const string Performance = Default + ".Performance";
    }

    /// <summary>
    /// 🔧 代码生成器专用：动态权限构建器
    /// 用于自动生成实体相关权限
    /// </summary>
    public static class Generated
    {
        public static string GetEntityDefault(string entityName) => GroupName + $".{entityName}";
        public static string GetEntityCreate(string entityName) => GetEntityDefault(entityName) + ".Create";
        public static string GetEntityEdit(string entityName) => GetEntityDefault(entityName) + ".Edit";
        public static string GetEntityDelete(string entityName) => GetEntityDefault(entityName) + ".Delete";
        public static string GetEntityImport(string entityName) => GetEntityDefault(entityName) + ".Import";
        public static string GetEntityExport(string entityName) => GetEntityDefault(entityName) + ".Export";
    }
}
