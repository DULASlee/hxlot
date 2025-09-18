using {{SystemName}}.Localization;
using Volo.Abp.Authorization.Permissions;

namespace {{SystemName}}.{{ModuleName}}.Permissions
{
    public class {{ModuleName}}PermissionDefinitionProvider : PermissionDefinitionProvider
    {
        public override void Define(IPermissionDefinitionContext context)
        {
            var myGroup = context.AddGroup({{ModuleName}}Permissions.GroupName);
            //Define your own permissions here. Example:
            //myGroup.AddPermission(BookStorePermissions.Books.Default, L("Permission:Books"));
        }

        private static LocalizableString L(string name)
        {
            return LocalizableString.Create<{{SystemName}}Resource>(name);
        }
    }
}
