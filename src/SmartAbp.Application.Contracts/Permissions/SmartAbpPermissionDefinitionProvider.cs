using SmartAbp.Localization;
using Volo.Abp.Authorization.Permissions;
using Volo.Abp.Localization;
using Volo.Abp.MultiTenancy;

namespace SmartAbp.Permissions;

public class SmartAbpPermissionDefinitionProvider : PermissionDefinitionProvider
{
    public override void Define(IPermissionDefinitionContext context)
    {
        var smartAbpGroup = context.AddGroup(SmartAbpPermissions.GroupName, L("Permission:SmartAbp"));

        // 🔥 代码生成权限定义 - 企业级代码生成器权限体系
        var codeGenerationGroup = smartAbpGroup.AddPermission(SmartAbpPermissions.CodeGeneration.Default, L("Permission:CodeGeneration"));
        codeGenerationGroup.AddChild(SmartAbpPermissions.CodeGeneration.Create, L("Permission:CodeGeneration.Create"));
        codeGenerationGroup.AddChild(SmartAbpPermissions.CodeGeneration.Edit, L("Permission:CodeGeneration.Edit"));
        codeGenerationGroup.AddChild(SmartAbpPermissions.CodeGeneration.Delete, L("Permission:CodeGeneration.Delete"));
        codeGenerationGroup.AddChild(SmartAbpPermissions.CodeGeneration.Generate, L("Permission:CodeGeneration.Generate"));
        codeGenerationGroup.AddChild(SmartAbpPermissions.CodeGeneration.Preview, L("Permission:CodeGeneration.Preview"));
        codeGenerationGroup.AddChild(SmartAbpPermissions.CodeGeneration.Export, L("Permission:CodeGeneration.Export"));

        // 🔧 元数据管理权限定义
        var metadataGroup = smartAbpGroup.AddPermission(SmartAbpPermissions.Metadata.Default, L("Permission:Metadata"));
        metadataGroup.AddChild(SmartAbpPermissions.Metadata.Create, L("Permission:Metadata.Create"));
        metadataGroup.AddChild(SmartAbpPermissions.Metadata.Edit, L("Permission:Metadata.Edit"));
        metadataGroup.AddChild(SmartAbpPermissions.Metadata.Delete, L("Permission:Metadata.Delete"));
        metadataGroup.AddChild(SmartAbpPermissions.Metadata.Import, L("Permission:Metadata.Import"));
        metadataGroup.AddChild(SmartAbpPermissions.Metadata.Export, L("Permission:Metadata.Export"));

        // 📄 模板管理权限定义
        var templatesGroup = smartAbpGroup.AddPermission(SmartAbpPermissions.Templates.Default, L("Permission:Templates"));
        templatesGroup.AddChild(SmartAbpPermissions.Templates.Create, L("Permission:Templates.Create"));
        templatesGroup.AddChild(SmartAbpPermissions.Templates.Edit, L("Permission:Templates.Edit"));
        templatesGroup.AddChild(SmartAbpPermissions.Templates.Delete, L("Permission:Templates.Delete"));
        templatesGroup.AddChild(SmartAbpPermissions.Templates.Import, L("Permission:Templates.Import"));
        templatesGroup.AddChild(SmartAbpPermissions.Templates.Export, L("Permission:Templates.Export"));

        // 🎨 低代码引擎权限定义
        var lowCodeGroup = smartAbpGroup.AddPermission(SmartAbpPermissions.LowCode.Default, L("Permission:LowCode"));
        lowCodeGroup.AddChild(SmartAbpPermissions.LowCode.Design, L("Permission:LowCode.Design"));
        lowCodeGroup.AddChild(SmartAbpPermissions.LowCode.Preview, L("Permission:LowCode.Preview"));
        lowCodeGroup.AddChild(SmartAbpPermissions.LowCode.Deploy, L("Permission:LowCode.Deploy"));
        lowCodeGroup.AddChild(SmartAbpPermissions.LowCode.Manage, L("Permission:LowCode.Manage"));

        // 🏢 企业级功能权限定义
        var enterpriseGroup = smartAbpGroup.AddPermission(SmartAbpPermissions.Enterprise.Default, L("Permission:Enterprise"));
        enterpriseGroup.AddChild(SmartAbpPermissions.Enterprise.Analytics, L("Permission:Enterprise.Analytics"));
        enterpriseGroup.AddChild(SmartAbpPermissions.Enterprise.Monitoring, L("Permission:Enterprise.Monitoring"));
        enterpriseGroup.AddChild(SmartAbpPermissions.Enterprise.Security, L("Permission:Enterprise.Security"));
        enterpriseGroup.AddChild(SmartAbpPermissions.Enterprise.Compliance, L("Permission:Enterprise.Compliance"));
        enterpriseGroup.AddChild(SmartAbpPermissions.Enterprise.Performance, L("Permission:Enterprise.Performance"));
    }

    private static LocalizableString L(string name)
    {
        return LocalizableString.Create<SmartAbpResource>(name);
    }
}
