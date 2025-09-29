/*
 * AI_TEMPLATE_INFO: {"version":"1.0","type":"C#","handler":"None"}
 * TEMPLATE_DESCRIPTION: 为模块生成标准的ABP权限定义提供者。
 * USAGE_GUIDE:
 * 1. 替换 {{permissionGroupName}} 为权限组名 (如 'ProductManagement')。
 * 2. 替换 {{entityNamePlural}} 为实体复数名 (如 'Products')。
 * 3. 替换 {{entityDisplayName}} 为实体的显示名称 (如 '商品')。
 */
using SmartAbp.Localization;
using Volo.Abp.Authorization.Permissions;
using Volo.Abp.Localization;

namespace SmartAbp.Permissions
{
    public class {{permissionGroupName}}PermissionDefinitionProvider : PermissionDefinitionProvider
    {
        public override void Define(IPermissionDefinitionContext context)
        {
            var myGroup = context.AddGroup({{permissionGroupName}}Permissions.GroupName, L("Permission:{{permissionGroupName}}"));

            myGroup.AddPermission({{permissionGroupName}}Permissions.{{entityNamePlural}}.Default, L("Permission:{{entityDisplayName}}"));
            myGroup.AddPermission({{permissionGroupName}}Permissions.{{entityNamePlural}}.Create, L("Permission:{{entityDisplayName}}.Create"));
            myGroup.AddPermission({{permissionGroupName}}Permissions.{{entityNamePlural}}.Update, L("Permission:{{entityDisplayName}}.Update"));
            myGroup.AddPermission({{permissionGroupName}}Permissions.{{entityNamePlural}}.Delete, L("Permission:{{entityDisplayName}}.Delete"));
        }

        private static LocalizableString L(string name)
        {
            return LocalizableString.Create<SmartAbpResource>(name);
        }
    }

    public static class {{permissionGroupName}}Permissions
    {
        public const string GroupName = "{{permissionGroupName}}";

        public static class {{entityNamePlural}}
        {
            public const string Default = GroupName + ".{{entityNamePlural}}";
            public const string Create = Default + ".Create";
            public const string Update = Default + ".Update";
            public const string Delete = Default + ".Delete";
        }
    }
}
